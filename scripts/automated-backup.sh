#!/bin/bash

# Healthcare Platform Automated Backup Script
# Implements comprehensive backup strategy with encryption and compliance

set -euo pipefail

# Configuration
BACKUP_BASE_DIR="/var/backups/reyada-homecare"
S3_BUCKET="reyada-homecare-backups"
ENCRYPTION_KEY_FILE="/etc/backup/encryption.key"
RETENTION_DAYS=90
COMPLIANCE_RETENTION_DAYS=2555  # 7 years for healthcare data
NAMESPACE="reyada-homecare"
DATABASE_HOST="${DB_HOST:-localhost}"
DATABASE_NAME="${DB_NAME:-reyada_homecare}"
DATABASE_USER="${DB_USER:-backup_user}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create backup directory structure
setup_backup_directories() {
    local timestamp="$1"
    local backup_dir="${BACKUP_BASE_DIR}/${timestamp}"
    
    mkdir -p "${backup_dir}/{database,kubernetes,application,logs,compliance}"
    echo "$backup_dir"
}

# Database backup with encryption
backup_database() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting database backup..."
    
    local db_backup_file="${backup_dir}/database/reyada_homecare_${timestamp}.sql"
    local encrypted_file="${db_backup_file}.enc"
    
    # Create database dump
    if pg_dump -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
        --verbose --no-password --format=custom --compress=9 \
        --file="$db_backup_file"; then
        
        # Encrypt the backup
        if [[ -f "$ENCRYPTION_KEY_FILE" ]]; then
            openssl enc -aes-256-cbc -salt -in "$db_backup_file" \
                -out "$encrypted_file" -pass file:"$ENCRYPTION_KEY_FILE"
            rm "$db_backup_file"  # Remove unencrypted file
            log_success "Database backup encrypted and saved to $encrypted_file"
        else
            log_warning "Encryption key not found, backup saved unencrypted"
        fi
        
        return 0
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Kubernetes resources backup
backup_kubernetes() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting Kubernetes resources backup..."
    
    local k8s_backup_dir="${backup_dir}/kubernetes"
    
    # Backup all resources in the namespace
    kubectl get all,configmaps,secrets,pvc,ingress -n "$NAMESPACE" -o yaml > \
        "${k8s_backup_dir}/all-resources-${timestamp}.yaml"
    
    # Backup specific deployments
    kubectl get deployment -n "$NAMESPACE" -o yaml > \
        "${k8s_backup_dir}/deployments-${timestamp}.yaml"
    
    # Backup services
    kubectl get service -n "$NAMESPACE" -o yaml > \
        "${k8s_backup_dir}/services-${timestamp}.yaml"
    
    # Backup persistent volume claims
    kubectl get pvc -n "$NAMESPACE" -o yaml > \
        "${k8s_backup_dir}/pvc-${timestamp}.yaml"
    
    # Backup RBAC
    kubectl get rolebindings,roles -n "$NAMESPACE" -o yaml > \
        "${k8s_backup_dir}/rbac-${timestamp}.yaml"
    
    log_success "Kubernetes resources backup completed"
}

# Application data backup
backup_application_data() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting application data backup..."
    
    local app_backup_dir="${backup_dir}/application"
    
    # Backup uploaded files and documents
    if [[ -d "/var/app/uploads" ]]; then
        tar -czf "${app_backup_dir}/uploads-${timestamp}.tar.gz" -C /var/app uploads/
        log_success "Application uploads backup completed"
    fi
    
    # Backup configuration files
    if [[ -d "/etc/reyada-homecare" ]]; then
        tar -czf "${app_backup_dir}/config-${timestamp}.tar.gz" -C /etc reyada-homecare/
        log_success "Configuration backup completed"
    fi
    
    # Backup SSL certificates
    if [[ -d "/etc/ssl/reyada" ]]; then
        tar -czf "${app_backup_dir}/ssl-${timestamp}.tar.gz" -C /etc/ssl reyada/
        log_success "SSL certificates backup completed"
    fi
}

# Logs backup
backup_logs() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting logs backup..."
    
    local logs_backup_dir="${backup_dir}/logs"
    
    # Backup application logs
    if [[ -d "/var/log/reyada-homecare" ]]; then
        tar -czf "${logs_backup_dir}/app-logs-${timestamp}.tar.gz" \
            -C /var/log reyada-homecare/
    fi
    
    # Backup audit logs (critical for compliance)
    if [[ -d "/var/log/audit" ]]; then
        tar -czf "${logs_backup_dir}/audit-logs-${timestamp}.tar.gz" \
            -C /var/log audit/
    fi
    
    # Backup system logs
    journalctl --since="24 hours ago" --output=json > \
        "${logs_backup_dir}/system-logs-${timestamp}.json"
    
    log_success "Logs backup completed"
}

# Compliance data backup
backup_compliance_data() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Starting compliance data backup..."
    
    local compliance_backup_dir="${backup_dir}/compliance"
    
    # Export DOH compliance reports
    if command -v psql &> /dev/null; then
        psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
            -c "COPY (SELECT * FROM doh_compliance_reports WHERE created_at >= NOW() - INTERVAL '30 days') TO STDOUT WITH CSV HEADER" > \
            "${compliance_backup_dir}/doh-reports-${timestamp}.csv"
    fi
    
    # Export audit trail data
    if command -v psql &> /dev/null; then
        psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
            -c "COPY (SELECT * FROM audit_trail WHERE timestamp >= NOW() - INTERVAL '30 days') TO STDOUT WITH CSV HEADER" > \
            "${compliance_backup_dir}/audit-trail-${timestamp}.csv"
    fi
    
    log_success "Compliance data backup completed"
}

# Upload to S3 with encryption
upload_to_s3() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Uploading backup to S3..."
    
    local s3_path="s3://${S3_BUCKET}/backups/${timestamp}/"
    
    # Upload with server-side encryption
    if aws s3 sync "$backup_dir" "$s3_path" \
        --storage-class STANDARD_IA \
        --server-side-encryption AES256 \
        --metadata "backup-type=automated,compliance=healthcare,retention=${COMPLIANCE_RETENTION_DAYS}"; then
        
        log_success "Backup uploaded to $s3_path"
        
        # Set lifecycle policy for compliance retention
        aws s3api put-object-tagging \
            --bucket "$S3_BUCKET" \
            --key "backups/${timestamp}/" \
            --tagging "TagSet=[{Key=RetentionDays,Value=${COMPLIANCE_RETENTION_DAYS}},{Key=BackupType,Value=Healthcare},{Key=Compliance,Value=DOH}]"
        
        return 0
    else
        log_error "Failed to upload backup to S3"
        return 1
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_dir="$1"
    local timestamp="$2"
    
    log_info "Verifying backup integrity..."
    
    local verification_file="${backup_dir}/backup-verification-${timestamp}.txt"
    
    # Generate checksums for all backup files
    find "$backup_dir" -type f -exec sha256sum {} \; > "$verification_file"
    
    # Verify database backup can be read
    local db_backup_file
    db_backup_file=$(find "${backup_dir}/database" -name "*.sql.enc" -o -name "*.sql" | head -1)
    
    if [[ -n "$db_backup_file" ]]; then
        if [[ "$db_backup_file" == *.enc ]]; then
            # Test decryption
            if openssl enc -aes-256-cbc -d -in "$db_backup_file" \
                -pass file:"$ENCRYPTION_KEY_FILE" | head -10 > /dev/null 2>&1; then
                log_success "Database backup encryption verified"
            else
                log_error "Database backup encryption verification failed"
                return 1
            fi
        else
            # Test file readability
            if head -10 "$db_backup_file" > /dev/null 2>&1; then
                log_success "Database backup file verified"
            else
                log_error "Database backup file verification failed"
                return 1
            fi
        fi
    fi
    
    log_success "Backup integrity verification completed"
    return 0
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Local cleanup
    find "$BACKUP_BASE_DIR" -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} \; 2>/dev/null || true
    
    # S3 cleanup (non-compliance data)
    aws s3api list-objects-v2 --bucket "$S3_BUCKET" --prefix "backups/" \
        --query "Contents[?LastModified<='$(date -d "${RETENTION_DAYS} days ago" --iso-8601)'].Key" \
        --output text | while read -r key; do
        if [[ -n "$key" ]]; then
            # Check if it's compliance data before deleting
            tags=$(aws s3api get-object-tagging --bucket "$S3_BUCKET" --key "$key" --output text 2>/dev/null || echo "")
            if [[ "$tags" != *"Compliance=DOH"* ]]; then
                aws s3 rm "s3://${S3_BUCKET}/${key}"
                log_info "Deleted old backup: $key"
            fi
        fi
    done
    
    log_success "Old backups cleanup completed"
}

# Send backup notification
send_notification() {
    local status="$1"
    local message="$2"
    local backup_size="$3"
    
    # Send to monitoring system
    if command -v curl &> /dev/null && [[ -n "${WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Healthcare Platform Backup $status: $message (Size: $backup_size)\"}" \
            "$WEBHOOK_URL" || true
    fi
    
    # Update Prometheus metrics
    if [[ "$status" == "SUCCESS" ]]; then
        echo "last_successful_backup_timestamp $(date +%s)" > /var/lib/prometheus/node-exporter/backup_status.prom
        echo "backup_size_bytes $backup_size" >> /var/lib/prometheus/node-exporter/backup_status.prom
    else
        echo "backup_failures_total 1" > /var/lib/prometheus/node-exporter/backup_status.prom
    fi
}

# Main backup function
main() {
    local timestamp
    timestamp=$(date '+%Y%m%d_%H%M%S')
    
    log_info "Starting automated backup for Healthcare Platform"
    log_info "Timestamp: $timestamp"
    
    # Setup backup directories
    local backup_dir
    backup_dir=$(setup_backup_directories "$timestamp")
    
    local backup_success=true
    local error_messages=()
    
    # Perform backups
    if ! backup_database "$backup_dir" "$timestamp"; then
        backup_success=false
        error_messages+=("Database backup failed")
    fi
    
    if ! backup_kubernetes "$backup_dir" "$timestamp"; then
        backup_success=false
        error_messages+=("Kubernetes backup failed")
    fi
    
    backup_application_data "$backup_dir" "$timestamp"
    backup_logs "$backup_dir" "$timestamp"
    backup_compliance_data "$backup_dir" "$timestamp"
    
    # Verify backup integrity
    if ! verify_backup "$backup_dir" "$timestamp"; then
        backup_success=false
        error_messages+=("Backup verification failed")
    fi
    
    # Calculate backup size
    local backup_size
    backup_size=$(du -sb "$backup_dir" | cut -f1)
    
    # Upload to S3
    if [[ "$backup_success" == "true" ]]; then
        if ! upload_to_s3 "$backup_dir" "$timestamp"; then
            backup_success=false
            error_messages+=("S3 upload failed")
        fi
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send notification
    if [[ "$backup_success" == "true" ]]; then
        send_notification "SUCCESS" "Backup completed successfully" "$backup_size"
        log_success "Automated backup completed successfully"
        log_info "Backup location: $backup_dir"
        log_info "Backup size: $(numfmt --to=iec $backup_size)"
    else
        local error_msg
        error_msg=$(IFS=', '; echo "${error_messages[*]}")
        send_notification "FAILED" "Backup failed: $error_msg" "$backup_size"
        log_error "Automated backup failed: $error_msg"
        exit 1
    fi
}

# Execute main function
main "$@"
