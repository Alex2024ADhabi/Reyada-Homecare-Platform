#!/bin/bash

# Blue-Green Deployment Script for Reyada Healthcare Platform
# Zero-downtime deployment with automated health checks and rollback capability

set -euo pipefail

# Configuration
NAMESPACE="reyada-homecare"
APP_NAME="reyada-frontend"
IMAGE_TAG="${1:-latest}"
HEALTH_CHECK_TIMEOUT=300
HEALTH_CHECK_INTERVAL=10
ROLLBACK_ON_FAILURE=true
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
TEAMS_WEBHOOK_URL="${TEAMS_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Notification functions
send_slack_notification() {
    local message="$1"
    local color="${2:-#36a64f}"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"Reyada Healthcare Platform Deployment\",
                    \"text\": \"$message\",
                    \"footer\": \"Blue-Green Deployment\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" || log_warning "Failed to send Slack notification"
    fi
}

send_teams_notification() {
    local message="$1"
    local color="${2:-00FF00}"
    
    if [[ -n "$TEAMS_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"@type\": \"MessageCard\",
                \"@context\": \"http://schema.org/extensions\",
                \"themeColor\": \"$color\",
                \"summary\": \"Reyada Healthcare Platform Deployment\",
                \"sections\": [{
                    \"activityTitle\": \"Blue-Green Deployment\",
                    \"activitySubtitle\": \"$(date '+%Y-%m-%d %H:%M:%S')\",
                    \"text\": \"$message\"
                }]
            }" \
            "$TEAMS_WEBHOOK_URL" || log_warning "Failed to send Teams notification"
    fi
}

# Cleanup function
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment failed with exit code $exit_code"
        send_slack_notification "🚨 Healthcare platform deployment FAILED! Image: $IMAGE_TAG" "#ff0000"
        send_teams_notification "🚨 Healthcare platform deployment FAILED! Image: $IMAGE_TAG" "FF0000"
        
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            log_info "Initiating automatic rollback..."
            ./scripts/rollback-deployment.sh || log_error "Rollback also failed!"
        fi
    fi
}

trap cleanup EXIT

# Validate prerequisites
validate_prerequisites() {
    log_info "Validating deployment prerequisites..."
    
    # Check if kubectl is available and configured
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_error "Namespace $NAMESPACE does not exist"
        exit 1
    fi
    
    # Validate image tag
    if [[ -z "$IMAGE_TAG" || "$IMAGE_TAG" == "latest" ]]; then
        log_warning "Using 'latest' tag is not recommended for production deployments"
    fi
    
    log_success "Prerequisites validation completed"
}

# Get current active environment (blue or green)
get_current_environment() {
    local current_env
    current_env=$(kubectl get service "$APP_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.selector.environment}' 2>/dev/null || echo "blue")
    echo "$current_env"
}

# Get target environment (opposite of current)
get_target_environment() {
    local current_env="$1"
    if [[ "$current_env" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Deploy to target environment
deploy_to_environment() {
    local env="$1"
    local deployment_name="$APP_NAME-$env"
    
    log_info "Deploying to $env environment..."
    
    # Create deployment if it doesn't exist
    if ! kubectl get deployment "$deployment_name" -n "$NAMESPACE" &> /dev/null; then
        log_info "Creating new deployment: $deployment_name"
        kubectl create deployment "$deployment_name" \
            --image="ghcr.io/reyada-homecare/reyada-frontend:$IMAGE_TAG" \
            --namespace="$NAMESPACE"
    else
        log_info "Updating existing deployment: $deployment_name"
        kubectl set image deployment/"$deployment_name" \
            "$APP_NAME"="ghcr.io/reyada-homecare/reyada-frontend:$IMAGE_TAG" \
            --namespace="$NAMESPACE"
    fi
    
    # Add environment labels and healthcare-specific labels
    kubectl patch deployment "$deployment_name" -n "$NAMESPACE" -p '{
        "metadata": {
            "labels": {
                "environment": "'$env'",
                "app": "'$APP_NAME'",
                "healthcare-platform": "true",
                "doh-compliant": "true",
                "deployment-strategy": "blue-green"
            }
        },
        "spec": {
            "template": {
                "metadata": {
                    "labels": {
                        "environment": "'$env'",
                        "app": "'$APP_NAME'",
                        "healthcare-platform": "true"
                    }
                },
                "spec": {
                    "containers": [{
                        "name": "'$APP_NAME'",
                        "env": [
                            {"name": "NODE_ENV", "value": "production"},
                            {"name": "HEALTHCARE_MODE", "value": "true"},
                            {"name": "DOH_COMPLIANCE", "value": "enabled"},
                            {"name": "DEPLOYMENT_ENV", "value": "'$env'"},
                            {"name": "IMAGE_TAG", "value": "'$IMAGE_TAG'"}
                        ],
                        "resources": {
                            "requests": {
                                "cpu": "500m",
                                "memory": "1Gi"
                            },
                            "limits": {
                                "cpu": "2000m",
                                "memory": "2Gi"
                            }
                        },
                        "readinessProbe": {
                            "httpGet": {
                                "path": "/health",
                                "port": 3000
                            },
                            "initialDelaySeconds": 30,
                            "periodSeconds": 10,
                            "timeoutSeconds": 5,
                            "failureThreshold": 3
                        },
                        "livenessProbe": {
                            "httpGet": {
                                "path": "/health",
                                "port": 3000
                            },
                            "initialDelaySeconds": 60,
                            "periodSeconds": 30,
                            "timeoutSeconds": 10,
                            "failureThreshold": 3
                        }
                    }]
                }
            }
        }
    }'
    
    # Scale deployment
    kubectl scale deployment "$deployment_name" --replicas=3 -n "$NAMESPACE"
    
    log_success "Deployment to $env environment initiated"
}

# Wait for deployment to be ready
wait_for_deployment() {
    local env="$1"
    local deployment_name="$APP_NAME-$env"
    
    log_info "Waiting for $env deployment to be ready..."
    
    if kubectl rollout status deployment/"$deployment_name" -n "$NAMESPACE" --timeout=600s; then
        log_success "$env deployment is ready"
        return 0
    else
        log_error "$env deployment failed to become ready"
        return 1
    fi
}

# Perform comprehensive health checks
perform_health_checks() {
    local env="$1"
    local deployment_name="$APP_NAME-$env"
    
    log_info "Performing comprehensive health checks for $env environment..."
    
    # Get pod IPs for direct health checks
    local pod_ips
    pod_ips=$(kubectl get pods -l "app=$APP_NAME,environment=$env" -n "$NAMESPACE" -o jsonpath='{.items[*].status.podIP}')
    
    if [[ -z "$pod_ips" ]]; then
        log_error "No pods found for $env environment"
        return 1
    fi
    
    local health_check_passed=true
    local start_time=$(date +%s)
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -gt $HEALTH_CHECK_TIMEOUT ]]; then
            log_error "Health check timeout after ${HEALTH_CHECK_TIMEOUT}s"
            health_check_passed=false
            break
        fi
        
        local all_healthy=true
        
        for pod_ip in $pod_ips; do
            log_info "Checking health of pod at $pod_ip..."
            
            # Basic health check
            if ! curl -sf "http://$pod_ip:3000/health" > /dev/null 2>&1; then
                log_warning "Basic health check failed for pod $pod_ip"
                all_healthy=false
                continue
            fi
            
            # Healthcare-specific health checks
            if ! curl -sf "http://$pod_ip:3000/api/health/doh-compliance" > /dev/null 2>&1; then
                log_warning "DOH compliance health check failed for pod $pod_ip"
                all_healthy=false
                continue
            fi
            
            if ! curl -sf "http://$pod_ip:3000/api/health/database" > /dev/null 2>&1; then
                log_warning "Database health check failed for pod $pod_ip"
                all_healthy=false
                continue
            fi
            
            if ! curl -sf "http://$pod_ip:3000/api/health/daman-integration" > /dev/null 2>&1; then
                log_warning "DAMAN integration health check failed for pod $pod_ip"
                all_healthy=false
                continue
            fi
            
            log_info "All health checks passed for pod $pod_ip"
        done
        
        if [[ "$all_healthy" == "true" ]]; then
            log_success "All health checks passed for $env environment"
            break
        fi
        
        log_info "Waiting ${HEALTH_CHECK_INTERVAL}s before next health check..."
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    if [[ "$health_check_passed" == "false" ]]; then
        return 1
    fi
    
    return 0
}

# Perform smoke tests
perform_smoke_tests() {
    local env="$1"
    
    log_info "Performing smoke tests for $env environment..."
    
    # Get service endpoint
    local service_ip
    service_ip=$(kubectl get service "$APP_NAME-$env" -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || \
                kubectl get service "$APP_NAME-$env" -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
    
    if [[ -z "$service_ip" ]]; then
        log_warning "Could not get service IP, using port-forward for smoke tests"
        kubectl port-forward service/"$APP_NAME-$env" 8080:80 -n "$NAMESPACE" &
        local port_forward_pid=$!
        sleep 5
        service_ip="localhost:8080"
    fi
    
    local smoke_tests_passed=true
    
    # Test 1: Basic application load
    log_info "Testing basic application load..."
    if curl -sf "http://$service_ip" > /dev/null; then
        log_success "✓ Basic application load test passed"
    else
        log_error "✗ Basic application load test failed"
        smoke_tests_passed=false
    fi
    
    # Test 2: API health endpoint
    log_info "Testing API health endpoint..."
    if curl -sf "http://$service_ip/api/health" > /dev/null; then
        log_success "✓ API health endpoint test passed"
    else
        log_error "✗ API health endpoint test failed"
        smoke_tests_passed=false
    fi
    
    # Test 3: Authentication endpoint
    log_info "Testing authentication endpoint..."
    if curl -sf "http://$service_ip/api/auth/health" > /dev/null; then
        log_success "✓ Authentication endpoint test passed"
    else
        log_error "✗ Authentication endpoint test failed"
        smoke_tests_passed=false
    fi
    
    # Test 4: DOH compliance endpoint
    log_info "Testing DOH compliance endpoint..."
    if curl -sf "http://$service_ip/api/compliance/doh/health" > /dev/null; then
        log_success "✓ DOH compliance endpoint test passed"
    else
        log_error "✗ DOH compliance endpoint test failed"
        smoke_tests_passed=false
    fi
    
    # Test 5: DAMAN integration endpoint
    log_info "Testing DAMAN integration endpoint..."
    if curl -sf "http://$service_ip/api/revenue/daman/health" > /dev/null; then
        log_success "✓ DAMAN integration endpoint test passed"
    else
        log_error "✗ DAMAN integration endpoint test failed"
        smoke_tests_passed=false
    fi
    
    # Cleanup port-forward if used
    if [[ -n "${port_forward_pid:-}" ]]; then
        kill $port_forward_pid 2>/dev/null || true
    fi
    
    if [[ "$smoke_tests_passed" == "true" ]]; then
        log_success "All smoke tests passed for $env environment"
        return 0
    else
        log_error "Some smoke tests failed for $env environment"
        return 1
    fi
}

# Switch traffic to target environment
switch_traffic() {
    local target_env="$1"
    
    log_info "Switching traffic to $target_env environment..."
    
    # Update main service selector
    kubectl patch service "$APP_NAME" -n "$NAMESPACE" -p '{
        "spec": {
            "selector": {
                "app": "'$APP_NAME'",
                "environment": "'$target_env'"
            }
        }
    }'
    
    # Add deployment timestamp annotation
    kubectl annotate service "$APP_NAME" -n "$NAMESPACE" \
        "deployment.reyada.ae/switched-at"="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        "deployment.reyada.ae/image-tag"="$IMAGE_TAG" \
        "deployment.reyada.ae/environment"="$target_env" \
        --overwrite
    
    log_success "Traffic switched to $target_env environment"
}

# Cleanup old environment
cleanup_old_environment() {
    local old_env="$1"
    local deployment_name="$APP_NAME-$old_env"
    
    log_info "Scaling down $old_env environment..."
    
    # Scale down old deployment
    kubectl scale deployment "$deployment_name" --replicas=0 -n "$NAMESPACE"
    
    log_success "$old_env environment scaled down"
    
    # Optional: Delete old deployment after some time
    # This is commented out to allow for quick rollback
    # kubectl delete deployment "$deployment_name" -n "$NAMESPACE"
}

# Create deployment backup
create_deployment_backup() {
    local current_env="$1"
    local backup_file="/tmp/deployment-backup-$(date +%Y%m%d-%H%M%S).yaml"
    
    log_info "Creating deployment backup..."
    
    kubectl get deployment "$APP_NAME-$current_env" -n "$NAMESPACE" -o yaml > "$backup_file"
    kubectl get service "$APP_NAME" -n "$NAMESPACE" -o yaml >> "$backup_file"
    
    log_success "Deployment backup created: $backup_file"
    echo "$backup_file"
}

# Main deployment function
main() {
    log_info "Starting blue-green deployment for Reyada Healthcare Platform"
    log_info "Image tag: $IMAGE_TAG"
    
    # Send deployment start notification
    send_slack_notification "🚀 Starting healthcare platform deployment. Image: $IMAGE_TAG" "#ffaa00"
    send_teams_notification "🚀 Starting healthcare platform deployment. Image: $IMAGE_TAG" "FFAA00"
    
    # Validate prerequisites
    validate_prerequisites
    
    # Get current and target environments
    local current_env
    current_env=$(get_current_environment)
    local target_env
    target_env=$(get_target_environment "$current_env")
    
    log_info "Current environment: $current_env"
    log_info "Target environment: $target_env"
    
    # Create backup of current deployment
    local backup_file
    backup_file=$(create_deployment_backup "$current_env")
    
    # Deploy to target environment
    deploy_to_environment "$target_env"
    
    # Wait for deployment to be ready
    if ! wait_for_deployment "$target_env"; then
        log_error "Deployment to $target_env failed"
        exit 1
    fi
    
    # Perform health checks
    if ! perform_health_checks "$target_env"; then
        log_error "Health checks failed for $target_env environment"
        exit 1
    fi
    
    # Perform smoke tests
    if ! perform_smoke_tests "$target_env"; then
        log_error "Smoke tests failed for $target_env environment"
        exit 1
    fi
    
    # Switch traffic to target environment
    switch_traffic "$target_env"
    
    # Wait a bit to ensure traffic is flowing
    log_info "Waiting 30 seconds to ensure traffic is flowing properly..."
    sleep 30
    
    # Perform final health check on the switched service
    log_info "Performing final health check on switched service..."
    if ! perform_health_checks "$target_env"; then
        log_error "Final health check failed, initiating rollback"
        switch_traffic "$current_env"
        exit 1
    fi
    
    # Cleanup old environment
    cleanup_old_environment "$current_env"
    
    # Success!
    log_success "Blue-green deployment completed successfully!"
    log_success "Active environment: $target_env"
    log_success "Image tag: $IMAGE_TAG"
    log_success "Backup file: $backup_file"
    
    # Send success notification
    send_slack_notification "✅ Healthcare platform deployment completed successfully! Active environment: $target_env, Image: $IMAGE_TAG" "#36a64f"
    send_teams_notification "✅ Healthcare platform deployment completed successfully! Active environment: $target_env, Image: $IMAGE_TAG" "36A64F"
    
    # Display deployment summary
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Application: $APP_NAME"
    echo "Namespace: $NAMESPACE"
    echo "Active Environment: $target_env"
    echo "Image Tag: $IMAGE_TAG"
    echo "Deployment Time: $(date)"
    echo "Backup File: $backup_file"
    echo "========================="
}

# Run main function
main "$@"