#!/bin/bash

# Health Check Script for Reyada Homecare Platform
# Comprehensive health monitoring for production deployments

set -euo pipefail

# Configuration
URL="${1:-http://localhost:8080}"
TIMEOUT="${2:-30}"
MAX_RETRIES="${3:-3}"
RETRY_DELAY="${4:-5}"
VERBOSE="${5:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[$timestamp] INFO:${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[$timestamp] WARN:${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] ERROR:${NC} $message" >&2
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] SUCCESS:${NC} $message"
            ;;
    esac
}

# Check if required tools are available
check_dependencies() {
    local deps=("curl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log "ERROR" "Required dependency '$dep' is not installed"
            exit 1
        fi
    done
}

# Basic HTTP health check
check_http_health() {
    local url="$1"
    local timeout="$2"
    
    log "INFO" "Checking HTTP health at $url"
    
    local response
    local http_code
    local response_time
    
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
        --max-time "$timeout" \
        --connect-timeout 10 \
        --retry 0 \
        "$url/health" 2>/dev/null || echo "ERROR\n000\n0")
    
    local body=$(echo "$response" | head -n -2)
    http_code=$(echo "$response" | tail -n 2 | head -n 1)
    response_time=$(echo "$response" | tail -n 1)
    
    if [[ "$http_code" == "200" ]]; then
        log "SUCCESS" "HTTP health check passed (${http_code}) in ${response_time}s"
        
        # Parse JSON response if available
        if echo "$body" | jq . &>/dev/null; then
            local status=$(echo "$body" | jq -r '.status // "unknown"')
            local timestamp=$(echo "$body" | jq -r '.timestamp // "unknown"')
            log "INFO" "Service status: $status (timestamp: $timestamp)"
        fi
        
        return 0
    else
        log "ERROR" "HTTP health check failed with code: $http_code"
        [[ "$VERBOSE" == "true" ]] && log "ERROR" "Response body: $body"
        return 1
    fi
}

# Check application-specific endpoints
check_application_health() {
    local base_url="$1"
    local timeout="$2"
    
    log "INFO" "Checking application-specific health endpoints"
    
    # Check main application
    local main_response
    main_response=$(curl -s -w "%{http_code}" \
        --max-time "$timeout" \
        --connect-timeout 10 \
        "$base_url" -o /dev/null 2>/dev/null || echo "000")
    
    if [[ "$main_response" == "200" ]]; then
        log "SUCCESS" "Main application endpoint is healthy"
    else
        log "ERROR" "Main application endpoint failed with code: $main_response"
        return 1
    fi
    
    # Check API endpoints (if available)
    local api_response
    api_response=$(curl -s -w "%{http_code}" \
        --max-time "$timeout" \
        --connect-timeout 10 \
        "$base_url/api/health" -o /dev/null 2>/dev/null || echo "000")
    
    if [[ "$api_response" == "200" || "$api_response" == "404" ]]; then
        log "INFO" "API endpoint check completed (${api_response})"
    else
        log "WARN" "API endpoint returned unexpected code: $api_response"
    fi
    
    return 0
}

# Check SSL/TLS certificate (if HTTPS)
check_ssl_certificate() {
    local url="$1"
    
    if [[ "$url" == https://* ]]; then
        log "INFO" "Checking SSL certificate"
        
        local hostname=$(echo "$url" | sed 's|https://||' | sed 's|/.*||')
        local cert_info
        
        cert_info=$(echo | openssl s_client -servername "$hostname" -connect "$hostname:443" 2>/dev/null | \
            openssl x509 -noout -dates 2>/dev/null || echo "ERROR")
        
        if [[ "$cert_info" != "ERROR" ]]; then
            local not_after=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
            local expiry_date=$(date -d "$not_after" +%s 2>/dev/null || echo "0")
            local current_date=$(date +%s)
            local days_until_expiry=$(( (expiry_date - current_date) / 86400 ))
            
            if [[ $days_until_expiry -gt 30 ]]; then
                log "SUCCESS" "SSL certificate is valid (expires in $days_until_expiry days)"
            elif [[ $days_until_expiry -gt 0 ]]; then
                log "WARN" "SSL certificate expires soon ($days_until_expiry days)"
            else
                log "ERROR" "SSL certificate has expired"
                return 1
            fi
        else
            log "WARN" "Could not verify SSL certificate"
        fi
    fi
    
    return 0
}

# Performance check
check_performance() {
    local url="$1"
    local timeout="$2"
    
    log "INFO" "Checking application performance"
    
    local response_time
    response_time=$(curl -s -w "%{time_total}" \
        --max-time "$timeout" \
        --connect-timeout 10 \
        "$url" -o /dev/null 2>/dev/null || echo "999")
    
    local response_time_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null || echo "999000")
    local response_time_int=${response_time_ms%.*}
    
    if [[ $response_time_int -lt 1000 ]]; then
        log "SUCCESS" "Response time is excellent (${response_time_int}ms)"
    elif [[ $response_time_int -lt 2000 ]]; then
        log "INFO" "Response time is good (${response_time_int}ms)"
    elif [[ $response_time_int -lt 5000 ]]; then
        log "WARN" "Response time is slow (${response_time_int}ms)"
    else
        log "ERROR" "Response time is too slow (${response_time_int}ms)"
        return 1
    fi
    
    return 0
}

# Database connectivity check (if applicable)
check_database_connectivity() {
    local base_url="$1"
    
    log "INFO" "Checking database connectivity"
    
    # Try to access a database health endpoint
    local db_response
    db_response=$(curl -s -w "%{http_code}" \
        --max-time 10 \
        --connect-timeout 5 \
        "$base_url/api/db/health" -o /dev/null 2>/dev/null || echo "000")
    
    if [[ "$db_response" == "200" ]]; then
        log "SUCCESS" "Database connectivity check passed"
    elif [[ "$db_response" == "404" ]]; then
        log "INFO" "Database health endpoint not available (expected for static sites)"
    else
        log "WARN" "Database connectivity check returned: $db_response"
    fi
    
    return 0
}

# Memory and resource check
check_system_resources() {
    log "INFO" "Checking system resources"
    
    # Check memory usage
    if command -v free &> /dev/null; then
        local mem_usage
        mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
        
        if (( $(echo "$mem_usage < 80" | bc -l) )); then
            log "SUCCESS" "Memory usage is healthy (${mem_usage}%)"
        elif (( $(echo "$mem_usage < 90" | bc -l) )); then
            log "WARN" "Memory usage is high (${mem_usage}%)"
        else
            log "ERROR" "Memory usage is critical (${mem_usage}%)"
            return 1
        fi
    fi
    
    # Check disk usage
    if command -v df &> /dev/null; then
        local disk_usage
        disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
        
        if [[ $disk_usage -lt 80 ]]; then
            log "SUCCESS" "Disk usage is healthy (${disk_usage}%)"
        elif [[ $disk_usage -lt 90 ]]; then
            log "WARN" "Disk usage is high (${disk_usage}%)"
        else
            log "ERROR" "Disk usage is critical (${disk_usage}%)"
            return 1
        fi
    fi
    
    return 0
}

# Main health check function
run_health_check() {
    local url="$1"
    local timeout="$2"
    local retries="$3"
    local delay="$4"
    
    log "INFO" "Starting comprehensive health check for $url"
    log "INFO" "Configuration: timeout=${timeout}s, retries=$retries, delay=${delay}s"
    
    local attempt=1
    local max_attempts=$((retries + 1))
    
    while [[ $attempt -le $max_attempts ]]; do
        log "INFO" "Health check attempt $attempt of $max_attempts"
        
        local failed=false
        
        # Run all health checks
        check_http_health "$url" "$timeout" || failed=true
        check_application_health "$url" "$timeout" || failed=true
        check_ssl_certificate "$url" || failed=true
        check_performance "$url" "$timeout" || failed=true
        check_database_connectivity "$url" || failed=true
        check_system_resources || failed=true
        
        if [[ "$failed" == "false" ]]; then
            log "SUCCESS" "All health checks passed successfully!"
            return 0
        else
            log "ERROR" "Health check attempt $attempt failed"
            
            if [[ $attempt -lt $max_attempts ]]; then
                log "INFO" "Waiting ${delay}s before retry..."
                sleep "$delay"
            fi
        fi
        
        ((attempt++))
    done
    
    log "ERROR" "All health check attempts failed after $max_attempts tries"
    return 1
}

# Generate health report
generate_health_report() {
    local url="$1"
    local status="$2"
    
    local report_file="/tmp/health-check-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "url": "$url",
  "status": "$status",
  "checks": {
    "http_health": "$(check_http_health "$url" "$TIMEOUT" &>/dev/null && echo 'passed' || echo 'failed')",
    "application_health": "$(check_application_health "$url" "$TIMEOUT" &>/dev/null && echo 'passed' || echo 'failed')",
    "ssl_certificate": "$(check_ssl_certificate "$url" &>/dev/null && echo 'passed' || echo 'failed')",
    "performance": "$(check_performance "$url" "$TIMEOUT" &>/dev/null && echo 'passed' || echo 'failed')",
    "database_connectivity": "$(check_database_connectivity "$url" &>/dev/null && echo 'passed' || echo 'failed')",
    "system_resources": "$(check_system_resources &>/dev/null && echo 'passed' || echo 'failed')"
  },
  "configuration": {
    "timeout": $TIMEOUT,
    "max_retries": $MAX_RETRIES,
    "retry_delay": $RETRY_DELAY
  }
}
EOF
    
    log "INFO" "Health report generated: $report_file"
    
    # Output report if verbose
    if [[ "$VERBOSE" == "true" ]]; then
        log "INFO" "Health Report:"
        cat "$report_file" | jq .
    fi
}

# Signal handlers
trap 'log "ERROR" "Health check interrupted"; exit 130' INT TERM

# Main execution
main() {
    log "INFO" "Reyada Homecare Platform Health Check v1.0.0"
    
    # Check dependencies
    check_dependencies
    
    # Run health check
    if run_health_check "$URL" "$TIMEOUT" "$MAX_RETRIES" "$RETRY_DELAY"; then
        generate_health_report "$URL" "healthy"
        log "SUCCESS" "Health check completed successfully"
        exit 0
    else
        generate_health_report "$URL" "unhealthy"
        log "ERROR" "Health check failed"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
Reyada Homecare Platform Health Check Script

Usage: $0 [URL] [TIMEOUT] [MAX_RETRIES] [RETRY_DELAY] [VERBOSE]

Parameters:
  URL          Target URL to check (default: http://localhost:8080)
  TIMEOUT      Request timeout in seconds (default: 30)
  MAX_RETRIES  Maximum retry attempts (default: 3)
  RETRY_DELAY  Delay between retries in seconds (default: 5)
  VERBOSE      Enable verbose output (default: false)

Examples:
  $0
  $0 https://app.reyada-homecare.com
  $0 https://app.reyada-homecare.com 60 5 10 true

Exit Codes:
  0  All health checks passed
  1  One or more health checks failed
  130 Script interrupted

EOF
}

# Check for help flag
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
