#!/bin/bash

# Comprehensive Backup Automation Script for Reyada Homecare Platform
# This script implements automated backup procedures with encryption, compression,
# and compliance with healthcare data retention requirements

set -euo pipefail

# Configuration
BACKUP_BASE_DIR="/opt/reyada-backups"
S3_BUCKET="reyada-homecare-backups"
ENCRYPTION_KEY_FILE="/etc/reyada/backup-encryption.key"
RETENTION_DAYS=2555  # 7 years for healthcare compliance
COMPRESSION_LEVEL=9
MAX_PARALLEL_JOBS=4

# Healthcare compliance settings
HIPAA_COMPLIANT=true
DOH_COMPLIANT=true
AUDIT_LOGGING=true

# Notification settings
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${BACKUP_EMAIL_RECIPIENTS:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    [ "$AUDIT_LOGGING" = true ] && echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> "$BACKUP_BASE_DIR/audit.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    [ "$AUDIT_LOGGING" = true ] && echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $1" >> "$BACKUP_BASE_DIR/audit.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    [ "$AUDIT_LOGGING" = true ] && echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $1" >> "$BACKUP_BASE_DIR/audit.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    [ "$AUDIT_LOGGING" = true ] && echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >> "$BACKUP_BASE_DIR/audit.log"
}

# Error handling
error_exit() {
    log_error "$1"
    send_notification "FAILED" "Backup failed: $1"
    exit 1
}

# Initialize backup environment
init_backup_env() {
    log_info "Initializing backup environment..."
    
    # Create backup directories
    mkdir -p "$BACKUP_BASE_DIR"/{database,files,kubernetes,logs,temp}
    mkdir -p "$BACKUP_BASE_DIR/archive/$(date +%Y)/$(date +%m)"
    
    # Set proper permissions
    chmod 700 "$BACKUP_BASE_DIR"
    
    # Initialize audit log
    if [ "$AUDIT_LOGGING" = true ]; then
        touch "$BACKUP_BASE_DIR/audit.log"
        chmod 600 "$BACKUP_BASE_DIR/audit.log"
    fi
    
    # Verify encryption key
    if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
        log_warning "Encryption key not found, generating new key..."
        openssl rand -base64 32 > "$ENCRYPTION_KEY_FILE"
        chmod 600 "$ENCRYPTION_KEY_FILE"
    fi
    
    log_success "Backup environment initialized"
}

# Database backup function
backup_databases() {
    log_info "Starting database backups..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local db_backup_dir="$BACKUP_BASE_DIR/database/$timestamp"
    mkdir -p "$db_backup_dir"
    
    # PostgreSQL backup
    if kubectl get pods -n reyada-homecare -l app=postgresql &>/dev/null; then
        log_info "Backing up PostgreSQL database..."
        
        kubectl exec -n reyada-homecare deployment/postgresql -- \
            pg_dumpall -U postgres | \
            gzip -$COMPRESSION_LEVEL > "$db_backup_dir/postgresql_full_$timestamp.sql.gz"
        
        # Individual database backups
        local databases=("reyada_main" "reyada_audit" "reyada_analytics")
        for db in "${databases[@]}"; do
            kubectl exec -n reyada-homecare deployment/postgresql -- \
                pg_dump -U postgres "$db" | \
                gzip -$COMPRESSION_LEVEL > "$db_backup_dir/postgresql_${db}_$timestamp.sql.gz"
        done
        
        log_success "PostgreSQL backup completed"
    fi
    
    # Redis backup
    if kubectl get pods -n reyada-homecare -l app=redis &>/dev/null; then
        log_info "Backing up Redis data..."
        
        kubectl exec -n reyada-homecare deployment/redis -- \
            redis-cli BGSAVE
        
        # Wait for background save to complete
        while kubectl exec -n reyada-homecare deployment/redis -- \
            redis-cli LASTSAVE | grep -q "$(kubectl exec -n reyada-homecare deployment/redis -- redis-cli LASTSAVE)"; do
            sleep 1
        done
        
        kubectl cp reyada-homecare/$(kubectl get pods -n reyada-homecare -l app=redis -o jsonpath='{.items[0].metadata.name}'):/data/dump.rdb \
            "$db_backup_dir/redis_$timestamp.rdb"
        
        gzip -$COMPRESSION_LEVEL "$db_backup_dir/redis_$timestamp.rdb"
        
        log_success "Redis backup completed"
    fi
    
    # Encrypt database backups
    if [ "$HIPAA_COMPLIANT" = true ]; then
        log_info "Encrypting database backups..."
        
        for file in "$db_backup_dir"/*.gz; do
            if [ -f "$file" ]; then
                openssl enc -aes-256-cbc -salt -in "$file" -out "${file}.enc" -pass file:"$ENCRYPTION_KEY_FILE"
                rm "$file"
            fi
        done
        
        log_success "Database backups encrypted"
    fi
    
    # Generate backup manifest
    cat > "$db_backup_dir/manifest.json" << EOF
{
  "backup_type": "database",
  "timestamp": "$timestamp",
  "compliance": {
    "hipaa": $HIPAA_COMPLIANT,
    "doh": $DOH_COMPLIANT
  },
  "encryption": {
    "enabled": $HIPAA_COMPLIANT,
    "algorithm": "AES-256-CBC"
  },
  "files": [
EOF
    
    for file in "$db_backup_dir"/*; do
        if [ -f "$file" ] && [ "$(basename "$file")" != "manifest.json" ]; then
            echo "    \"$(basename "$file")\"," >> "$db_backup_dir/manifest.json"
        fi
    done
    
    # Remove trailing comma and close JSON
    sed -i '$ s/,$//' "$db_backup_dir/manifest.json"
    echo "  ]" >> "$db_backup_dir/manifest.json"
    echo "}" >> "$db_backup_dir/manifest.json"
    
    log_success "Database backup completed: $db_backup_dir"
}

# Kubernetes configuration backup
backup_kubernetes() {
    log_info "Starting Kubernetes configuration backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local k8s_backup_dir="$BACKUP_BASE_DIR/kubernetes/$timestamp"
    mkdir -p "$k8s_backup_dir"
    
    # Backup all resources in reyada-homecare namespace
    local resources=("deployments" "services" "configmaps" "secrets" "ingresses" "persistentvolumeclaims")
    
    for resource in "${resources[@]}"; do
        log_info "Backing up $resource..."
        kubectl get "$resource" -n reyada-homecare -o yaml > "$k8s_backup_dir/${resource}.yaml"
    done
    
    # Backup cluster-wide resources
    kubectl get nodes -o yaml > "$k8s_backup_dir/nodes.yaml"
    kubectl get persistentvolumes -o yaml > "$k8s_backup_dir/persistentvolumes.yaml"
    kubectl get storageclasses -o yaml > "$k8s_backup_dir/storageclasses.yaml"
    
    # Backup RBAC
    kubectl get clusterroles -o yaml > "$k8s_backup_dir/clusterroles.yaml"
    kubectl get clusterrolebindings -o yaml > "$k8s_backup_dir/clusterrolebindings.yaml"
    kubectl get roles -n reyada-homecare -o yaml > "$k8s_backup_dir/roles.yaml"
    kubectl get rolebindings -n reyada-homecare -o yaml > "$k8s_backup_dir/rolebindings.yaml"
    
    # Create archive
    tar -czf "$k8s_backup_dir.tar.gz" -C "$BACKUP_BASE_DIR/kubernetes" "$timestamp"
    rm -rf "$k8s_backup_dir"
    
    # Encrypt if required
    if [ "$HIPAA_COMPLIANT" = true ]; then
        openssl enc -aes-256-cbc -salt -in "$k8s_backup_dir.tar.gz" -out "$k8s_backup_dir.tar.gz.enc" -pass file:"$ENCRYPTION_KEY_FILE"
        rm "$k8s_backup_dir.tar.gz"
    fi
    
    log_success "Kubernetes backup completed"
}

# Application files backup
backup_application_files() {
    log_info "Starting application files backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local files_backup_dir="$BACKUP_BASE_DIR/files/$timestamp"
    mkdir -p "$files_backup_dir"
    
    # Backup persistent volumes
    local pvcs=$(kubectl get pvc -n reyada-homecare -o jsonpath='{.items[*].metadata.name}')
    
    for pvc in $pvcs; do
        log_info "Backing up PVC: $pvc"
        
        # Create a backup pod
        kubectl run backup-pod-$timestamp --rm -i --restart=Never \
            --image=alpine:latest \
            --overrides='{
              "spec": {
                "containers": [{
                  "name": "backup",
                  "image": "alpine:latest",
                  "command": ["tar", "czf", "/backup/'$pvc'_'$timestamp'.tar.gz", "/data"],
                  "volumeMounts": [{
                    "name": "data",
                    "mountPath": "/data"
                  }, {
                    "name": "backup",
                    "mountPath": "/backup"
                  }]
                }],
                "volumes": [{
                  "name": "data",
                  "persistentVolumeClaim": {
                    "claimName": "'$pvc'"
                  }
                }, {
                  "name": "backup",
                  "hostPath": {
                    "path": "'$files_backup_dir'"
                  }
                }]
              }
            }' \
            --timeout=600s
    done
    
    # Encrypt files if required
    if [ "$HIPAA_COMPLIANT" = true ]; then
        for file in "$files_backup_dir"/*.tar.gz; do
            if [ -f "$file" ]; then
                openssl enc -aes-256-cbc -salt -in "$file" -out "${file}.enc" -pass file:"$ENCRYPTION_KEY_FILE"
                rm "$file"
            fi
        done
    fi
    
    log_success "Application files backup completed"
}

# Upload to cloud storage
upload_to_cloud() {
    log_info "Uploading backups to cloud storage..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local upload_path="s3://$S3_BUCKET/$(date +%Y)/$(date +%m)/$(date +%d)"
    
    # Upload with parallel processing
    find "$BACKUP_BASE_DIR" -name "*.gz" -o -name "*.enc" | \
        xargs -I {} -P $MAX_PARALLEL_JOBS aws s3 cp {} "$upload_path/"
    
    # Upload manifests and logs
    find "$BACKUP_BASE_DIR" -name "manifest.json" -o -name "*.log" | \
        xargs -I {} aws s3 cp {} "$upload_path/metadata/"
    
    # Set lifecycle policy for compliance
    aws s3api put-object-lifecycle-configuration \
        --bucket "$S3_BUCKET" \
        --lifecycle-configuration file:///etc/reyada/s3-lifecycle-policy.json
    
    log_success "Cloud upload completed"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Local cleanup
    find "$BACKUP_BASE_DIR" -type f -mtime +30 -delete
    find "$BACKUP_BASE_DIR" -type d -empty -delete
    
    # Cloud cleanup (keep for compliance period)
    aws s3 ls "s3://$S3_BUCKET/" --recursive | \
        awk '{print $1" "$2" "$4}' | \
        while read date time file; do
            if [[ $(date -d "$date $time" +%s) -lt $(date -d "-$RETENTION_DAYS days" +%s) ]]; then
                aws s3 rm "s3://$S3_BUCKET/$file"
            fi
        done
    
    log_success "Cleanup completed"
}

# Verify backup integrity
verify_backups() {
    log_info "Verifying backup integrity..."
    
    local verification_failed=false
    
    # Verify database backups
    for file in "$BACKUP_BASE_DIR"/database/*/postgresql_*.sql.gz.enc; do
        if [ -f "$file" ]; then
            if ! openssl enc -aes-256-cbc -d -in "$file" -pass file:"$ENCRYPTION_KEY_FILE" | gunzip -t; then
                log_error "Database backup verification failed: $file"
                verification_failed=true
            fi
        fi
    done
    
    # Verify Kubernetes backups
    for file in "$BACKUP_BASE_DIR"/kubernetes/*.tar.gz.enc; do
        if [ -f "$file" ]; then
            if ! openssl enc -aes-256-cbc -d -in "$file" -pass file:"$ENCRYPTION_KEY_FILE" | tar -tzf - >/dev/null; then
                log_error "Kubernetes backup verification failed: $file"
                verification_failed=true
            fi
        fi
    done
    
    if [ "$verification_failed" = true ]; then
        error_exit "Backup verification failed"
    fi
    
    log_success "Backup verification completed successfully"
}

# Send notifications
send_notification() {
    local status="$1"
    local message="$2"
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        [ "$status" = "FAILED" ] && color="danger"
        
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data '{
                "attachments": [{
                    "color": "'$color'",
                    "title": "Reyada Homecare Backup '$status'",
                    "text": "'$message'",
                    "fields": [{
                        "title": "Timestamp",
                        "value": "'$(date)'",
                        "short": true
                    }, {
                        "title": "Environment",
                        "value": "Production",
                        "short": true
                    }]
                }]
            }'
    fi
    
    # Email notification
    if [ -n "$EMAIL_RECIPIENTS" ]; then
        echo "$message" | mail -s "Reyada Homecare Backup $status" "$EMAIL_RECIPIENTS"
    fi
}

# Generate backup report
generate_report() {
    log_info "Generating backup report..."
    
    local report_file="$BACKUP_BASE_DIR/backup-report-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "backup_summary": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "SUCCESS",
    "compliance": {
      "hipaa_compliant": $HIPAA_COMPLIANT,
      "doh_compliant": $DOH_COMPLIANT,
      "retention_days": $RETENTION_DAYS
    },
    "components": {
      "database": {
        "postgresql": "completed",
        "redis": "completed"
      },
      "kubernetes": "completed",
      "application_files": "completed",
      "cloud_upload": "completed"
    },
    "encryption": {
      "enabled": $HIPAA_COMPLIANT,
      "algorithm": "AES-256-CBC"
    },
    "storage": {
      "local_path": "$BACKUP_BASE_DIR",
      "cloud_bucket": "$S3_BUCKET"
    }
  }
}
EOF
    
    log_success "Backup report generated: $report_file"
}

# Main backup function
main() {
    log_info "Starting comprehensive backup process..."
    
    # Initialize
    init_backup_env
    
    # Perform backups
    backup_databases
    backup_kubernetes
    backup_application_files
    
    # Upload and cleanup
    upload_to_cloud
    cleanup_old_backups
    
    # Verify and report
    verify_backups
    generate_report
    
    # Send success notification
    send_notification "SUCCESS" "All backup operations completed successfully"
    
    log_success "Comprehensive backup process completed successfully!"
}

# Execute main function
main "$@"
