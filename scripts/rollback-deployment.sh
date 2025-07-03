#!/bin/bash

# Automated Rollback Script for Reyada Homecare Platform
# Provides quick rollback capabilities with health validation

set -euo pipefail

# Configuration
NAMESPACE="reyada-homecare"
APP_NAME="reyada-frontend"
ROLLBACK_TIMEOUT=300
HEALTH_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get current active deployment
get_active_deployment() {
    kubectl get service $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo "unknown"
}

# Function to get previous deployment
get_previous_deployment() {
    local active=$(get_active_deployment)
    if [ "$active" = "blue" ]; then
        echo "green"
    elif [ "$active" = "green" ]; then
        echo "blue"
    else
        # Try to determine from deployment history
        local deployments=$(kubectl get deployments -n $NAMESPACE -l app=$APP_NAME -o jsonpath='{.items[*].metadata.name}')
        for deployment in $deployments; do
            if [[ $deployment == *"blue"* ]]; then
                echo "blue"
                return
            elif [[ $deployment == *"green"* ]]; then
                echo "green"
                return
            fi
        done
        echo "blue"  # Default fallback
    fi
}

# Function to check if deployment exists and is healthy
check_deployment_exists() {
    local deployment="$1"
    
    if kubectl get deployment $APP_NAME-$deployment -n $NAMESPACE >/dev/null 2>&1; then
        local ready_replicas=$(kubectl get deployment $APP_NAME-$deployment -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired_replicas=$(kubectl get deployment $APP_NAME-$deployment -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
        
        if [ "$ready_replicas" -gt "0" ] && [ "$ready_replicas" = "$desired_replicas" ]; then
            return 0
        fi
    fi
    return 1
}

# Function to scale up deployment
scale_up_deployment() {
    local deployment="$1"
    local replicas="${2:-3}"
    
    log_info "Scaling up deployment $deployment to $replicas replicas"
    
    kubectl scale deployment $APP_NAME-$deployment --replicas=$replicas -n $NAMESPACE
    
    # Wait for deployment to be ready
    local elapsed=0
    while [ $elapsed -lt $ROLLBACK_TIMEOUT ]; do
        local ready_replicas=$(kubectl get deployment $APP_NAME-$deployment -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        
        if [ "$ready_replicas" = "$replicas" ]; then
            log_success "Deployment $deployment scaled up successfully"
            return 0
        fi
        
        log_info "Waiting for deployment $deployment to scale up... ($elapsed/$ROLLBACK_TIMEOUT seconds)"
        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    done
    
    log_error "Failed to scale up deployment $deployment within timeout"
    return 1
}

# Function to switch traffic
switch_traffic() {
    local target_deployment="$1"
    
    log_info "Switching traffic to $target_deployment deployment"
    
    # Update service selector
    kubectl patch service $APP_NAME -n $NAMESPACE -p '{"spec":{"selector":{"version":"'$target_deployment'"}}}'
    
    # Verify traffic switch
    local current_target=$(kubectl get service $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.version}')
    
    if [ "$current_target" = "$target_deployment" ]; then
        log_success "Traffic successfully switched to $target_deployment"
        return 0
    else
        log_error "Failed to switch traffic to $target_deployment"
        return 1
    fi
}

# Function to perform health checks
perform_health_checks() {
    local deployment="$1"
    
    log_info "Performing health checks for $deployment deployment"
    
    # Check pod status
    local pods=$(kubectl get pods -n $NAMESPACE -l app=$APP_NAME,version=$deployment -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $pods; do
        local pod_status=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
        local pod_ready=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "False")
        
        if [ "$pod_status" != "Running" ] || [ "$pod_ready" != "True" ]; then
            log_error "Pod $pod is not healthy (Status: $pod_status, Ready: $pod_ready)"
            return 1
        fi
    done
    
    # Perform application health check
    kubectl port-forward service/$APP_NAME-$deployment 8080:3000 -n $NAMESPACE &
    local port_forward_pid=$!
    
    sleep 10
    
    local health_check_passed=false
    local health_endpoints=("/health" "/api/health" "/api/status")
    
    for endpoint in "${health_endpoints[@]}"; do
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080$endpoint || echo "000")
        
        if [ "$response_code" = "200" ]; then
            log_success "Health check passed for endpoint: $endpoint"
            health_check_passed=true
            break
        fi
    done
    
    # Kill port-forward
    kill $port_forward_pid 2>/dev/null || true
    
    if [ "$health_check_passed" = "true" ]; then
        log_success "Health checks passed for $deployment deployment"
        return 0
    else
        log_error "Health checks failed for $deployment deployment"
        return 1
    fi
}

# Function to get deployment history
get_deployment_history() {
    log_info "Retrieving deployment history"
    
    echo "=== Deployment History ==="
    kubectl rollout history deployment/$APP_NAME-blue -n $NAMESPACE 2>/dev/null || echo "No blue deployment history"
    kubectl rollout history deployment/$APP_NAME-green -n $NAMESPACE 2>/dev/null || echo "No green deployment history"
    echo "========================="
}

# Function to create incident report
create_incident_report() {
    local rollback_reason="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "/tmp/rollback-incident-$timestamp.json" <<EOF
{
  "incident_id": "rollback-$(date +%s)",
  "timestamp": "$timestamp",
  "application": "$APP_NAME",
  "namespace": "$NAMESPACE",
  "rollback_reason": "$rollback_reason",
  "previous_deployment": "$(get_active_deployment)",
  "target_deployment": "$(get_previous_deployment)",
  "rollback_initiated_by": "automated-system",
  "environment": "production",
  "impact": "service-degradation",
  "status": "in-progress"
}
EOF
    
    log_info "Incident report created: /tmp/rollback-incident-$timestamp.json"
}

# Function to notify operations team
notify_operations_team() {
    local message="$1"
    
    log_info "Notifying operations team: $message"
    
    # Here you would integrate with your notification system
    # Examples: Slack, PagerDuty, email, etc.
    
    # For now, we'll just log the notification
    echo "ALERT: $message" >> /tmp/rollback-notifications.log
}

# Main rollback logic
main() {
    local rollback_reason="${1:-manual-rollback}"
    
    log_info "=== Automated Rollback Started ==="
    log_info "Rollback reason: $rollback_reason"
    
    # Create incident report
    create_incident_report "$rollback_reason"
    
    # Get current state
    local current_deployment=$(get_active_deployment)
    local target_deployment=$(get_previous_deployment)
    
    log_info "Current active deployment: $current_deployment"
    log_info "Target rollback deployment: $target_deployment"
    
    # Show deployment history
    get_deployment_history
    
    # Check if target deployment exists and is viable
    if ! check_deployment_exists $target_deployment; then
        log_warning "Target deployment $target_deployment does not exist or is not healthy"
        log_info "Attempting to scale up $target_deployment deployment"
        
        if ! scale_up_deployment $target_deployment; then
            log_error "Failed to scale up $target_deployment deployment"
            log_error "Manual intervention required"
            notify_operations_team "Rollback failed - manual intervention required"
            exit 1
        fi
    fi
    
    # Perform health checks on target deployment
    if ! perform_health_checks $target_deployment; then
        log_error "Target deployment $target_deployment failed health checks"
        log_error "Cannot proceed with rollback - manual intervention required"
        notify_operations_team "Rollback failed - target deployment unhealthy"
        exit 1
    fi
    
    # Switch traffic to target deployment
    if ! switch_traffic $target_deployment; then
        log_error "Failed to switch traffic during rollback"
        notify_operations_team "Rollback failed - traffic switch failed"
        exit 1
    fi
    
    # Wait for traffic to stabilize
    log_info "Waiting for traffic to stabilize..."
    sleep 30
    
    # Perform post-rollback validation
    if ! perform_health_checks $target_deployment; then
        log_error "Post-rollback health checks failed"
        log_warning "Rollback may have been unsuccessful"
        notify_operations_team "Rollback completed but health checks failed"
    else
        log_success "Post-rollback health checks passed"
    fi
    
    # Scale down problematic deployment
    if [ "$current_deployment" != "unknown" ]; then
        log_info "Scaling down problematic deployment: $current_deployment"
        kubectl scale deployment $APP_NAME-$current_deployment --replicas=0 -n $NAMESPACE || true
    fi
    
    # Update incident report
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "{\"status\": \"completed\", \"completion_time\": \"$timestamp\"}" >> /tmp/rollback-incident-*.json
    
    log_success "=== Automated Rollback Completed ==="
    log_info "Active deployment is now: $target_deployment"
    
    notify_operations_team "Rollback completed successfully - active deployment: $target_deployment"
    
    # Provide next steps
    echo ""
    log_info "=== Next Steps ==="
    log_info "1. Investigate the root cause of the deployment failure"
    log_info "2. Review application logs and metrics"
    log_info "3. Prepare a fix for the issues identified"
    log_info "4. Test the fix in staging environment"
    log_info "5. Plan the next deployment with proper validation"
    echo ""
}

# Handle script arguments
if [ $# -eq 0 ]; then
    main "manual-rollback"
else
    main "$1"
fi