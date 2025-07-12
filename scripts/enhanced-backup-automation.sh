#!/bin/bash

# Enhanced Automated Backup Script for Reyada Homecare Platform
# This script performs comprehensive backups of all critical components

set -e

# Configuration
BACKUP_ROOT="/mnt/backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
RETENTION_DAYS=30
NAMESPACE="reyada-homecare"
S3_BUCKET="reyada-homecare-backups"
ENCRYPTION_KEY="/etc/backup-keys/backup-encryption-key.gpg"
LOG_FILE="/var/log/reyada-backups.log"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "$LOG_FILE"
}

log "Starting enhanced backup procedure"

# Backup Kubernetes resources
log "Backing up Kubernetes resources"
mkdir -p "$BACKUP_DIR/kubernetes"

# Backup all resources in the namespace
kubectl get all -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/kubernetes/all-resources.yaml"

# Backup specific resource types
for resource in deployments services configmaps secrets statefulsets pvc ingress; do
  log "Backing up $resource"
  kubectl get "$resource" -n "$NAMESPACE" -o yaml > "$BACKUP_DIR/kubernetes/$resource.yaml"
done

# Backup database
log "Backing up PostgreSQL database"
mkdir -p "$BACKUP_DIR/database"
PG_POD=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n "$NAMESPACE" "$PG_POD" -- pg_dumpall -c -U postgres | gzip > "$BACKUP_DIR/database/postgres-full.sql.gz"

# Backup MongoDB
log "Backing up MongoDB database"
MONGO_POD=$(kubectl get pods -n "$NAMESPACE" -l app=mongodb -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n "$NAMESPACE" "$MONGO_POD" -- mongodump --archive --gzip --out /tmp/mongodb-backup.gz
kubectl cp "$NAMESPACE/$MONGO_POD:/tmp/mongodb-backup.gz" "$BACKUP_DIR/database/mongodb-backup.gz"

# Backup Redis data
log "Backing up Redis data"
REDIS_POD=$(kubectl get pods -n "$NAMESPACE" -l app=redis -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n "$NAMESPACE" "$REDIS_POD" -- redis-cli SAVE
kubectl cp "$NAMESPACE/$REDIS_POD:/data/dump.rdb" "$BACKUP_DIR/database/redis-dump.rdb"

# Backup persistent volumes
log "Backing up persistent volumes"
mkdir -p "$BACKUP_DIR/volumes"
for pv in $(kubectl get pvc -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
  log "Backing up PVC: $pv"
  PVC_POD_NAME="backup-$pv"
  
  # Create a temporary pod that mounts the PVC
  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: $PVC_POD_NAME
  namespace: $NAMESPACE
spec:
  containers:
  - name: backup
    image: alpine:latest
    command: ["sleep", "3600"]
    volumeMounts:
    - mountPath: /data
      name: volume
  volumes:
  - name: volume
    persistentVolumeClaim:
      claimName: $pv
  restartPolicy: Never
EOF

  # Wait for the pod to be ready
  kubectl wait --for=condition=Ready pod/$PVC_POD_NAME -n "$NAMESPACE" --timeout=60s
  
  # Create a tar archive of the volume
  kubectl exec -n "$NAMESPACE" "$PVC_POD_NAME" -- tar -czf /tmp/volume-backup.tar.gz -C /data .
  
  # Copy the backup from the pod
  kubectl cp "$NAMESPACE/$PVC_POD_NAME:/tmp/volume-backup.tar.gz" "$BACKUP_DIR/volumes/$pv.tar.gz"
  
  # Delete the temporary pod
  kubectl delete pod "$PVC_POD_NAME" -n "$NAMESPACE"
done

# Encrypt the backup
log "Encrypting backup"
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
gpg --encrypt --recipient-file "$ENCRYPTION_KEY" --output "$BACKUP_DIR.tar.gz.gpg" "$BACKUP_DIR.tar.gz"

# Upload to S3
log "Uploading backup to S3"
aws s3 cp "$BACKUP_DIR.tar.gz.gpg" "s3://$S3_BUCKET/backups/$(basename "$BACKUP_DIR").tar.gz.gpg"

# Clean up local files
log "Cleaning up local files"
rm -f "$BACKUP_DIR.tar.gz"
rm -rf "$BACKUP_DIR"

# Delete old backups (local)
log "Deleting old local backups"
find "$BACKUP_ROOT" -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} \; 2>/dev/null || true

# Delete old backups (S3)
log "Deleting old S3 backups"
aws s3 ls "s3://$S3_BUCKET/backups/" | awk '{print $4}' | while read -r backup; do
  backup_date=$(echo "$backup" | grep -oP '\d{8}-\d{6}')
  if [ -n "$backup_date" ]; then
    backup_timestamp=$(date -d "${backup_date:0:8} ${backup_date:9:2}:${backup_date:11:2}:${backup_date:13:2}" +%s)
    current_timestamp=$(date +%s)
    age_days=$(( (current_timestamp - backup_timestamp) / 86400 ))
    
    if [ "$age_days" -gt "$RETENTION_DAYS" ]; then
      log "Deleting old S3 backup: $backup"
      aws s3 rm "s3://$S3_BUCKET/backups/$backup"
    fi
  fi
done

log "Backup completed successfully"

# Create backup verification report
BACKUP_SIZE=$(aws s3 ls "s3://$S3_BUCKET/backups/$(basename "$BACKUP_DIR").tar.gz.gpg" --summarize | grep "Total Size" | awk '{print $3}')
echo "Backup Verification Report" > backup-report.txt
echo "------------------------" >> backup-report.txt
echo "Timestamp: $(date)" >> backup-report.txt
echo "Backup ID: $(basename "$BACKUP_DIR")" >> backup-report.txt
echo "Backup Size: $BACKUP_SIZE bytes" >> backup-report.txt
echo "Backup Location: s3://$S3_BUCKET/backups/$(basename "$BACKUP_DIR").tar.gz.gpg" >> backup-report.txt
echo "Status: Success" >> backup-report.txt

# Send notification
echo "Backup completed successfully. See attached report." | mail -s "Reyada Homecare Backup Report" -a backup-report.txt admin@reyada-homecare.ae

exit 0
