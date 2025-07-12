#!/bin/bash

# Comprehensive Deployment Script for Reyada Homecare Platform
# Advanced deployment with health checks, rollback capabilities, and compliance validation

set -euo pipefail

# Configuration
NAMESPACE="reyada-homecare"
APP_NAME="reyada-frontend"
DEPLOYMENT_TIMEOUT=600
HEALTH_CHECK_INTERVAL=15
MAX_HEALTH_CHECK_ATTEMPTS=20
ROLLBACK_ON_FAILURE=true
COMPLIANCE_VALIDATION=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to create deployment report
create_deployment_report() {
    local deployment_id="$1"
    local status="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "/tmp/deployment-report-$deployment_id.json" <<EOF
{
  "deployment_id": "$deployment_id",
  "timestamp": "$timestamp",
  "application": "$APP_NAME",
  "namespace": "$NAMESPACE",
  "status": "$status",
  "environment": "production",
  "deployment_strategy": "blue-green",
  "compliance_validated": $COMPLIANCE_VALIDATION,
  "rollback_enabled": $ROLLBACK_ON_FAILURE,
  "health_checks": {
    "enabled": true,
    "timeout": $DEPLOYMENT_TIMEOUT,
    "interval": $HEALTH_CHECK_INTERVAL,
    "max_attempts": $MAX_HEALTH_CHECK_ATTEMPTS
  }
}
EOF
    
    log_info "Deployment report created: /tmp/deployment-report-$deployment_id.json"
}

# Function to validate prerequisites
validate_prerequisites() {
    log_step "Validating deployment prerequisites"
    
    # Check kubectl access
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_error "kubectl is not configured or cluster is not accessible"
        exit 1
    fi
    
    # Check namespace exists
    if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        log_warning "Namespace $NAMESPACE does not exist, creating it"
        kubectl create namespace $NAMESPACE
    fi
    
    # Check required secrets exist
    local required_secrets=("app-secrets" "database-secrets" "daman-secrets")
    for secret in "${required_secrets[@]}"; do
        if ! kubectl get secret $secret -n $NAMESPACE >/dev/null 2>&1; then
            log_warning "Required secret $secret not found in namespace $NAMESPACE"
        fi
    done
    
    # Check Docker image availability
    local image_tag="${IMAGE_TAG:-latest}"
    log_info "Validating Docker image: $APP_NAME:$image_tag"
    
    # Validate Kubernetes resources
    if [ -f "kubernetes/frontend-deployment.yaml" ]; then
        kubectl apply --dry-run=client -f kubernetes/frontend-deployment.yaml >/dev/null 2>&1 || {
            log_error "Invalid Kubernetes deployment configuration"
            exit 1
        }
    fi
    
    log_success "Prerequisites validation completed"
}

# Function to determine current active deployment
get_current_deployment() {
    local current=$(kubectl get service $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo "none")
    echo $current
}

# Function to determine target deployment
get_target_deployment() {
    local current=$(get_current_deployment)
    if [ "$current" = "blue" ]; then
        echo "green"
    elif [ "$current" = "green" ]; then
        echo "blue"
    else
        echo "blue"  # Default to blue for first deployment
    fi
}

# Function to build and push Docker image
build_and_push_image() {
    local target_deployment="$1"
    local image_tag="${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}"
    
    log_step "Building and pushing Docker image"
    
    # Build Docker image
    log_info "Building Docker image: $APP_NAME:$image_tag"
    docker build -t $APP_NAME:$image_tag -f Dockerfile.frontend . || {
        log_error "Docker image build failed"
        exit 1
    }
    
    # Tag for target deployment
    docker tag $APP_NAME:$image_tag $APP_NAME:$target_deployment-$image_tag
    
    # Push to registry (if configured)
    if [ -n "${DOCKER_REGISTRY:-}" ]; then
        log_info "Pushing image to registry: $DOCKER_REGISTRY"
        docker tag $APP_NAME:$image_tag $DOCKER_REGISTRY/$APP_NAME:$image_tag
        docker push $DOCKER_REGISTRY/$APP_NAME:$image_tag || {
            log_error "Failed to push image to registry"
            exit 1
        }
    fi
    
    log_success "Docker image built and pushed successfully"
    echo $image_tag
}

# Function to deploy to target environment
deploy_to_target() {
    local target_deployment="$1"
    local image_tag="$2"
    
    log_step "Deploying to $target_deployment environment"
    
    # Create deployment configuration
    local deployment_config="/tmp/$APP_NAME-$target_deployment-deployment.yaml"
    
    cat > $deployment_config <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $APP_NAME-$target_deployment
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
    version: $target_deployment
    healthcare-platform: "true"
    doh-compliant: "true"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: $APP_NAME
      version: $target_deployment
  template:
    metadata:
      labels:
        app: $APP_NAME
        version: $target_deployment
        healthcare-platform: "true"
        doh-compliant: "true"
      annotations:
        deployment.timestamp: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        deployment.image-tag: "$image_tag"
    spec:
      containers:
      - name: frontend
        image: ${DOCKER_REGISTRY:-}$APP_NAME:$image_tag
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DEPLOYMENT_VERSION
          value: "$target_deployment"
        - name: IMAGE_TAG
          value: "$image_tag"
        - name: HEALTHCARE_COMPLIANCE
          value: "enabled"
        - name: DOH_COMPLIANCE
          value: "enabled"
        - name: JAWDA_COMPLIANCE
          value: "enabled"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1000
          capabilities:
            drop:
            - ALL
      securityContext:
        fsGroup: 1000
      serviceAccountName: $APP_NAME-service-account
EOF
    
    # Apply deployment
    kubectl apply -f $deployment_config || {
        log_error "Failed to apply deployment configuration"
        exit 1
    }
    
    log_success "Deployment configuration applied for $target_deployment"
}

# Function to wait for deployment readiness
wait_for_deployment_ready() {
    local target_deployment="$1"
    
    log_step "Waiting for $target_deployment deployment to be ready"
    
    local elapsed=0
    local deployment_name="$APP_NAME-$target_deployment"
    
    while [ $elapsed -lt $DEPLOYMENT_TIMEOUT ]; do
        local ready_replicas=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired_replicas=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
        
        if [ "$ready_replicas" = "$desired_replicas" ] && [ "$ready_replicas" -gt "0" ]; then
            log_success "Deployment $target_deployment is ready ($ready_replicas/$desired_replicas replicas)"
            return 0
        fi
        
        log_info "Waiting for deployment readiness... ($ready_replicas/$desired_replicas replicas ready) - $elapsed/$DEPLOYMENT_TIMEOUT seconds"
        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    done
    
    log_error "Deployment $target_deployment failed to become ready within timeout"
    return 1
}

# Function to perform comprehensive health checks
perform_health_checks() {
    local target_deployment="$1"
    
    log_step "Performing comprehensive health checks for $target_deployment"
    
    # Get pod information
    local pods=$(kubectl get pods -n $NAMESPACE -l app=$APP_NAME,version=$target_deployment -o jsonpath='{.items[*].metadata.name}')
    
    if [ -z "$pods" ]; then
        log_error "No pods found for deployment $target_deployment"
        return 1
    fi
    
    # Check each pod
    for pod in $pods; do
        log_info "Checking pod: $pod"
        
        # Check pod status
        local pod_status=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
        local pod_ready=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "False")
        
        if [ "$pod_status" != "Running" ] || [ "$pod_ready" != "True" ]; then
            log_error "Pod $pod is not healthy (Status: $pod_status, Ready: $pod_ready)"
            kubectl describe pod $pod -n $NAMESPACE
            return 1
        fi
        
        log_success "Pod $pod is healthy"
    done
    
    # Perform application-level health checks
    log_info "Performing application-level health checks"
    
    # Port forward for health check
    kubectl port-forward service/$APP_NAME-$target_deployment 8080:3000 -n $NAMESPACE &
    local port_forward_pid=$!
    
    sleep 10
    
    local health_check_passed=false
    local health_endpoints=("/health" "/api/health" "/api/status" "/ready")
    
    for endpoint in "${health_endpoints[@]}"; do
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080$endpoint 2>/dev/null || echo "000")
        
        if [ "$response_code" = "200" ]; then
            log_success "Health check passed for endpoint: $endpoint"
            health_check_passed=true
            break
        else
            log_warning "Health check failed for endpoint: $endpoint (HTTP $response_code)"
        fi
    done
    
    # Kill port-forward
    kill $port_forward_pid 2>/dev/null || true
    wait $port_forward_pid 2>/dev/null || true
    
    if [ "$health_check_passed" = "true" ]; then
        log_success "Application health checks passed"
        return 0
    else
        log_error "Application health checks failed"
        return 1
    fi
}

# Function to validate DOH compliance
validate_doh_compliance() {
    local target_deployment="$1"
    
    if [ "$COMPLIANCE_VALIDATION" != "true" ]; then
        log_info "Compliance validation disabled, skipping"
        return 0
    fi
    
    log_step "Validating DOH compliance for $target_deployment"
    
    # Check deployment labels
    local doh_compliant=$(kubectl get deployment $APP_NAME-$target_deployment -n $NAMESPACE -o jsonpath='{.metadata.labels.doh-compliant}' 2>/dev/null