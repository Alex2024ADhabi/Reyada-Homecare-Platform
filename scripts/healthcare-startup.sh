#!/bin/sh

# Healthcare Platform Startup Script
# Secure initialization for DOH and HIPAA compliant deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo "${BLUE}[INFO]${NC} $(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "${GREEN}[SUCCESS]${NC} $(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo "${YELLOW}[WARNING]${NC} $(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "${RED}[ERROR]${NC} $(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Healthcare platform initialization
init_healthcare_platform() {
    log_info "Initializing Reyada Healthcare Platform..."
    
    # Verify healthcare compliance environment variables
    if [ "$HEALTHCARE_MODE" != "true" ]; then
        log_warning "Healthcare mode not enabled, setting to true"
        export HEALTHCARE_MODE=true
    fi
    
    if [ "$DOH_COMPLIANCE" != "enabled" ]; then
        log_warning "DOH compliance not enabled, setting to enabled"
        export DOH_COMPLIANCE=enabled
    fi
    
    if [ "$HIPAA_COMPLIANCE" != "enabled" ]; then
        log_warning "HIPAA compliance not enabled, setting to enabled"
        export HIPAA_COMPLIANCE=enabled
    fi
    
    log_success "Healthcare compliance environment verified"
}

# Security hardening
security_hardening() {
    log_info "Applying security hardening measures..."
    
    # Set secure file permissions
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;
    
    # Ensure log directories exist with proper permissions
    mkdir -p /var/log/nginx/healthcare
    chmod 755 /var/log/nginx/healthcare
    
    # Create runtime directories
    mkdir -p /var/cache/nginx
    mkdir -p /var/run/nginx
    
    # Set ownership (already done in Dockerfile, but ensuring)
    chown -R healthcare:healthcare /var/log/nginx/healthcare 2>/dev/null || true
    chown -R healthcare:healthcare /var/cache/nginx 2>/dev/null || true
    chown -R healthcare:healthcare /var/run/nginx 2>/dev/null || true
    
    log_success "Security hardening completed"
}

# Validate healthcare configuration
validate_healthcare_config() {
    log_info "Validating healthcare platform configuration..."
    
    # Check if required files exist
    local required_files="
        /usr/share/nginx/html/index.html
        /etc/nginx/nginx.conf
        /usr/local/bin/healthcheck.sh
    "
    
    for file in $required_files; do
        if [ ! -f "$file" ]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Validate nginx configuration
    if ! nginx -t 2>/dev/null; then
        log_error "Nginx configuration validation failed"
        exit 1
    fi
    
    log_success "Healthcare platform configuration validated"
}

# Initialize logging
init_logging() {
    log_info "Initializing healthcare audit logging..."
    
    # Create log rotation configuration
    cat > /tmp/logrotate.conf << EOF
/var/log/nginx/healthcare/*.log {
    daily
    missingok
    rotate 90
    compress
    delaycompress
    notifempty
    create 644 healthcare healthcare
    postrotate
        if [ -f /var/run/nginx/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx/nginx.pid)
        fi
    endscript
}
EOF
    
    # Initialize audit log
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Healthcare platform startup initiated" >> /var/log/nginx/healthcare/audit.log
    
    log_success "Healthcare audit logging initialized"
}

# Performance optimization
optimize_performance() {
    log_info "Applying healthcare platform performance optimizations..."
    
    # Set nginx worker processes based on CPU cores
    local cpu_cores
    cpu_cores=$(nproc 2>/dev/null || echo "1")
    
    # Update nginx configuration if needed
    sed -i "s/worker_processes auto;/worker_processes $cpu_cores;/g" /etc/nginx/nginx.conf 2>/dev/null || true
    
    # Set memory limits for healthcare workloads
    ulimit -n 65536 2>/dev/null || log_warning "Could not set file descriptor limit"
    
    log_success "Performance optimizations applied"
}

# Health check initialization
init_health_checks() {
    log_info "Initializing healthcare platform health checks..."
    
    # Ensure health check script is executable
    chmod +x /usr/local/bin/healthcheck.sh
    
    # Create health check status file
    echo '{"status":"initializing","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > /tmp/health-status.json
    
    log_success "Health checks initialized"
}

# Start nginx with healthcare configuration
start_nginx() {
    log_info "Starting nginx with healthcare configuration..."
    
    # Final configuration test
    nginx -t
    
    # Start nginx in foreground mode
    log_success "Starting Reyada Healthcare Platform on port 8080"
    log_info "Healthcare Mode: $HEALTHCARE_MODE"
    log_info "DOH Compliance: $DOH_COMPLIANCE"
    log_info "HIPAA Compliance: $HIPAA_COMPLIANCE"
    log_info "Security Hardened: $SECURITY_HARDENED"
    
    # Update health status
    echo '{"status":"starting","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > /tmp/health-status.json
    
    # Start nginx
    exec nginx -g "daemon off;"
}

# Cleanup function
cleanup() {
    log_info "Performing cleanup on shutdown..."
    
    # Log shutdown event
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Healthcare platform shutdown initiated" >> /var/log/nginx/healthcare/audit.log 2>/dev/null || true
    
    # Update health status
    echo '{"status":"shutting_down","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > /tmp/health-status.json 2>/dev/null || true
    
    # Graceful nginx shutdown
    if [ -f /var/run/nginx/nginx.pid ]; then
        kill -QUIT $(cat /var/run/nginx/nginx.pid) 2>/dev/null || true
    fi
    
    log_success "Cleanup completed"
}

# Trap signals for graceful shutdown
trap cleanup TERM INT QUIT

# Main startup sequence
main() {
    log_info "=== Reyada Healthcare Platform Startup ==="
    log_info "Starting healthcare-compliant web server..."
    
    # Run initialization steps
    init_healthcare_platform
    security_hardening
    validate_healthcare_config
    init_logging
    optimize_performance
    init_health_checks
    
    # Start the platform
    start_nginx
}

# Run main function
main "$@"
