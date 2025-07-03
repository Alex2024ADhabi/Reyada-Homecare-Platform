#!/bin/sh

# Healthcare Platform Health Check Script
# Comprehensive health validation for DOH and HIPAA compliance

set -e

# Configuration
HEALTH_ENDPOINT="http://localhost:8080/health"
DOH_ENDPOINT="http://localhost:8080/api/health/doh-compliance"
HIPAA_ENDPOINT="http://localhost:8080/api/health/hipaa-compliance"
DATABASE_ENDPOINT="http://localhost:8080/api/health/database"
DAMAN_ENDPOINT="http://localhost:8080/api/health/daman-integration"
TIMEOUT=10
RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log_success() {
    echo "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo "${RED}[ERROR]${NC} $1"
}

# Health check function
check_endpoint() {
    local endpoint="$1"
    local description="$2"
    local retry_count=0
    
    while [ $retry_count -lt $RETRIES ]; do
        if curl -f -s --max-time $TIMEOUT "$endpoint" > /dev/null 2>&1; then
            log_success "$description health check passed"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $RETRIES ]; then
            log_warning "$description health check failed, retrying ($retry_count/$RETRIES)..."
            sleep 2
        fi
    done
    
    log_error "$description health check failed after $RETRIES attempts"
    return 1
}

# Detailed health check function
check_endpoint_detailed() {
    local endpoint="$1"
    local description="$2"
    local expected_field="$3"
    local expected_value="$4"
    
    local response
    response=$(curl -f -s --max-time $TIMEOUT "$endpoint" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        log_error "$description endpoint unreachable"
        return 1
    fi
    
    if [ -n "$expected_field" ] && [ -n "$expected_value" ]; then
        local actual_value
        actual_value=$(echo "$response" | grep -o "\"$expected_field\":[^,}]*" | cut -d':' -f2 | tr -d '"')
        
        if [ "$actual_value" = "$expected_value" ]; then
            log_success "$description validation passed ($expected_field=$actual_value)"
            return 0
        else
            log_error "$description validation failed ($expected_field=$actual_value, expected=$expected_value)"
            return 1
        fi
    else
        log_success "$description endpoint accessible"
        return 0
    fi
}

# Main health check routine
main() {
    log "Starting healthcare platform health check..."
    
    local overall_status=0
    
    # Basic application health
    if ! check_endpoint "$HEALTH_ENDPOINT" "Basic application"; then
        overall_status=1
    fi
    
    # DOH compliance check
    if ! check_endpoint_detailed "$DOH_ENDPOINT" "DOH compliance" "doh_compliant" "true"; then
        overall_status=1
    fi
    
    # HIPAA compliance check
    if ! check_endpoint_detailed "$HIPAA_ENDPOINT" "HIPAA compliance" "hipaa_compliant" "true"; then
        overall_status=1
    fi
    
    # Database connectivity check
    if ! check_endpoint_detailed "$DATABASE_ENDPOINT" "Database connectivity" "database_status" "connected"; then
        overall_status=1
    fi
    
    # DAMAN integration check
    if ! check_endpoint_detailed "$DAMAN_ENDPOINT" "DAMAN integration" "daman_status" "connected"; then
        log_warning "DAMAN integration check failed, but this is not critical for basic functionality"
        # Don't fail overall health check for DAMAN issues
    fi
    
    # Additional system checks
    log "Performing additional system checks..."
    
    # Check disk space
    local disk_usage
    disk_usage=$(df /usr/share/nginx/html | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_error "Disk usage is critical: ${disk_usage}%"
        overall_status=1
    elif [ "$disk_usage" -gt 80 ]; then
        log_warning "Disk usage is high: ${disk_usage}%"
    else
        log_success "Disk usage is normal: ${disk_usage}%"
    fi
    
    # Check memory usage (if available)
    if command -v free >/dev/null 2>&1; then
        local memory_usage
        memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [ "$memory_usage" -gt 90 ]; then
            log_error "Memory usage is critical: ${memory_usage}%"
            overall_status=1
        elif [ "$memory_usage" -gt 80 ]; then
            log_warning "Memory usage is high: ${memory_usage}%"
        else
            log_success "Memory usage is normal: ${memory_usage}%"
        fi
    fi
    
    # Check if nginx is running
    if ! pgrep nginx > /dev/null; then
        log_error "Nginx process not found"
        overall_status=1
    else
        log_success "Nginx process is running"
    fi
    
    # Check log file permissions and sizes
    if [ -d "/var/log/nginx/healthcare" ]; then
        local log_size
        log_size=$(du -sm /var/log/nginx/healthcare 2>/dev/null | cut -f1)
        if [ "$log_size" -gt 1000 ]; then
            log_warning "Healthcare log directory size is large: ${log_size}MB"
        else
            log_success "Healthcare log directory size is normal: ${log_size}MB"
        fi
    fi
    
    # Final status
    if [ $overall_status -eq 0 ]; then
        log_success "All healthcare platform health checks passed"
        echo '{"status":"healthy","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","healthcare_compliant":true,"checks_passed":true}'
        exit 0
    else
        log_error "Healthcare platform health checks failed"
        echo '{"status":"unhealthy","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","healthcare_compliant":false,"checks_passed":false}'
        exit 1
    fi
}

# Run main function
main "$@"
