#!/bin/bash

# Disaster Recovery Script for Reyada Homecare Platform
# This script restores the platform from backups in case of a disaster

set -e

# Configuration
BACKUP_ROOT="/mnt/backups"
S3_BUCKET="reyada-homecare-backups"
NAMESPACE="reyada-homecare"
ENCRYPTION_KEY="/etc/backup-keys/backup-encryption-key.gpg"
LOG_FILE="/var/log/reyada-recovery.log"

# Check if backup ID is provided
if [ -z "$1" ]; then
  echo "Error: Backup ID is required"
  echo "Usage: $0 <backup-id> [--latest]"
  exit 1
fi

log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "$LOG_FILE"
}

log "Starting disaster recovery procedure"

# Determine backup to restore
if [ "$1" == "--latest" ]; then
  log "Finding latest backup"
  BACKUP_ID=$(aws s3 ls "s3://$S3_BUCKET/backups/" | sort | tail -n 1 | awk '{print $4}' | sed 's/.tar.gz.gpg//')
  if [ -z "$BACKUP_ID" ]; then
    log "Error: No backups found in S3"
    exit 1
  fi
else
  BACKUP_ID="$1"
fi

log "Using backup ID: $BACKUP_ID"

# Create temporary directory for restoration
TEMP_DIR="/tmp/reyada-recovery-$BACKUP_ID"
mkdir -p "$TEMP_DIR"

# Download backup from S3
log "Downloading backup from S3"
aws s3 cp "s3://$S3_BUCKET/backups/$BACKUP_ID.tar.gz.gpg" "$TEMP_DIR/$BACKUP_ID.tar.gz.gpg"

# Decrypt backup
log "Decrypting backup"
gpg --decrypt --output "$TEMP_DIR/$BACKUP_ID.tar.gz" "$TEMP_DIR/$BACKUP_ID.tar.gz.gpg"

# Extract backup
log "Extracting backup"
tar -xzf "$TEMP_DIR/$BACKUP_ID.tar.gz" -C "$TEMP_DIR"

# Ensure namespace exists
log "Ensuring namespace exists"
kubectl get namespace "$NAMESPACE" || kubectl create namespace "$NAMESPACE"

# Restore Kubernetes resources
log "Restoring Kubernetes resources"

# First apply ConfigMaps and Secrets
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/configmaps.yaml"
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/secrets.yaml"

# Then apply PVCs
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/pvc.yaml"

# Wait for PVCs to be bound
log "Waiting for PVCs to be bound"
sleep 10

# Apply other resources
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/services.yaml"
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/statefulsets.yaml"
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/deployments.yaml"
kubectl apply -f "$TEMP_DIR/$BACKUP_ID/kubernetes/ingress.yaml"

# Wait for core services to be ready
log "Waiting for core services to be ready"
kubectl wait --for=condition=Ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s
kubectl wait --for=condition=Ready pod -l app=mongodb -n "$NAMESPACE" --timeout=300s
kubectl wait --for=condition=Ready pod -l app=redis -n "$NAMESPACE" --timeout=300s

# Restore database data
log "Restoring PostgreSQL database"
PG_POD=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}')
kubectl cp "$TEMP_DIR/$BACKUP_ID/database/postgres-full.sql.gz" "$NAMESPACE/$PG_POD:/tmp/"
kubectl exec -n "$NAMESPACE" "$PG_POD" -- bash -c "gunzip -c /tmp/postgres-full.sql.gz | psql -U postgres"

# Restore MongoDB
log "Restoring MongoDB database"
MONGO_POD=$(kubectl get pods -n "$NAMESPACE" -l app=mongodb -o jsonpath='{.items[0].metadata.name}')
kubectl cp "$TEMP_DIR/$BACKUP_ID/database/mongodb-backup.gz" "$NAMESPACE/$MONGO_POD:/tmp/"
kubectl exec -n "$NAMESPACE" "$MONGO_POD" -- mongorestore --gzip --archive=/tmp/mongodb-backup.gz --drop

# Restore Redis data
log "Restoring Redis data"
REDIS_POD=$(kubectl get pods -n "$NAMESPACE" -l app=redis -o jsonpath='{.items[0].metadata.name}')
kubectl cp "$TEMP_DIR/$BACKUP_ID/database/redis-dump.rdb" "$NAMESPACE/$REDIS_POD:/data/dump.rdb"
kubectl exec -n "$NAMESPACE" "$REDIS_POD" -- redis-cli SHUTDOWN SAVE

# Restore persistent volumes
log "Restoring persistent volumes"
for volume_file in "$TEMP_DIR/$BACKUP_ID/volumes"/*.tar.gz; do
  if [ -f "$volume_file" ]; then
    pvc_name=$(basename "$volume_file" .tar.gz)
    log "Restoring PVC: $pvc_name"
    
    # Create a temporary pod that mounts the PVC
    PVC_POD_NAME="restore-$pvc_name"
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: $PVC_POD_NAME
  namespace: $NAMESPACE
spec:
  containers:
  - name: restore
    image: alpine:latest
    command: ["sleep", "3600"]
    volumeMounts:
    - mountPath: /data
      name: volume
  volumes:
  - name: volume
    persistentVolumeClaim:
      claimName: $pvc_name
  restartPolicy: Never
EOF

    # Wait for the pod to be ready
    kubectl wait --for=condition=Ready pod/$PVC_POD_NAME -n "$NAMESPACE" --timeout=60s
    
    # Copy the backup to the pod
    kubectl cp "$volume_file" "$NAMESPACE/$PVC_POD_NAME:/tmp/volume-backup.tar.gz"
    
    # Extract the backup to the volume
    kubectl exec -n "$NAMESPACE" "$PVC_POD_NAME" -- sh -c "rm -rf /data/* && tar -xzf /tmp/volume-backup.tar.gz -C /data"
    
    # Delete the temporary pod
    kubectl delete pod "$PVC_POD_NAME" -n "$NAMESPACE"
  fi
done

# Restart all deployments to ensure they use the restored data
log "Restarting all deployments"
for deployment in $(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
  kubectl rollout restart deployment "$deployment" -n "$NAMESPACE"
done

# Wait for all deployments to be ready
log "Waiting for all deployments to be ready"
for deployment in $(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
  kubectl rollout status deployment "$deployment" -n "$NAMESPACE" --timeout=300s
done

# Clean up
log "Cleaning up temporary files"
rm -rf "$TEMP_DIR"

log "Disaster recovery completed successfully"

# Create recovery verification report
echo "Recovery Verification Report" > recovery-report.txt
echo "---------------------------" >> recovery-report.txt
echo "Timestamp: $(date)" >> recovery-report.txt
echo "Backup ID: $BACKUP_ID" >> recovery-report.txt
echo "Status: Success" >> recovery-report.txt
echo "\nDeployed Resources:" >> recovery-report.txt
kubectl get all -n "$NAMESPACE" >> recovery-report.txt

# Send notification
echo "Disaster recovery completed successfully. See attached report." | mail -s "Reyada Homecare Recovery Report" -a recovery-report.txt admin@reyada-homecare.ae

exit 0
