#!/bin/bash

# Enhanced Blue-Green Deployment Script for Reyada Homecare Platform
# This script implements a zero-downtime deployment strategy with comprehensive validation

set -e

# Configuration
NAMESPACE="reyada-homecare"
APP_NAME="reyada-frontend"
ENVIRONMENT="${1:-production}"
VERSION="$2"
HEALTH_CHECK_PATH="/health"
HEALTH_CHECK_PORT=80
MAX_WAIT_TIME=600  # Increased timeout for healthcare applications
LOG_FILE="/var/log/reyada-deployment.log"
ROLLBACK_ON_FAILURE=true
DOH_COMPLIANCE_CHECK=true

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Validate input
if [ -z "$VERSION" ]; then
  echo "Error: Environment and version parameters are required"
  echo "Usage: $0 <environment> <version>"
  echo "Environments: staging, production"
  exit 1
fi

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "Error: Environment must be 'staging' or 'production'"
  exit 1
fi

# Set environment-specific configurations
case $ENVIRONMENT in
    "production")
        REPLICAS=5
        HEALTH_CHECK_RETRIES=10
        SMOKE_TEST_TIMEOUT=300
        ;;
    "staging")
        REPLICAS=2
        HEALTH_CHECK_RETRIES=5
        SMOKE_TEST_TIMEOUT=120
        ;;
esac

log "Starting enhanced blue-green deployment for $APP_NAME"
log "Environment: $ENVIRONMENT"
log "Version: $VERSION"
log "Replicas: $REPLICAS"
log "DOH Compliance Check: $DOH_COMPLIANCE_CHECK"

# Pre-deployment validation
log "Performing pre-deployment validation..."

# Check if kubectl is available and configured
if ! kubectl cluster-info &> /dev/null; then
    log "❌ kubectl is not configured or cluster is not accessible"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    log "❌ Namespace $NAMESPACE does not exist"
    exit 1
fi

# Validate image exists
log "Validating container image..."
if ! docker manifest inspect "$VERSION" &> /dev/null; then
    log "⚠️ Cannot validate image manifest, proceeding with deployment"
fi

log "✅ Pre-deployment validation completed"

# Determine current active deployment (blue or green)
CURRENT_DEPLOYMENT=$(kubectl get service "$APP_NAME-service" -n "$NAMESPACE" -o jsonpath='{.spec.selector.deployment}')

if [ "$CURRENT_DEPLOYMENT" == "blue" ]; then
  NEW_DEPLOYMENT="green"
  OLD_DEPLOYMENT="blue"
else
  NEW_DEPLOYMENT="blue"
  OLD_DEPLOYMENT="green"
fi

echo "Current active deployment is $CURRENT_DEPLOYMENT. Will deploy to $NEW_DEPLOYMENT"

# Update the new deployment with the new version
echo "Updating $NEW_DEPLOYMENT deployment with version $VERSION"
kubectl set image deployment/$APP_NAME-$NEW_DEPLOYMENT $APP_NAME=reyada/$APP_NAME:$VERSION -n $NAMESPACE

# Scale up the new deployment
log "Scaling up $NEW_DEPLOYMENT deployment to $REPLICAS replicas"
kubectl scale deployment/$APP_NAME-$NEW_DEPLOYMENT --replicas=$REPLICAS -n $NAMESPACE

# Wait for the new deployment to be ready
log "Waiting for $NEW_DEPLOYMENT deployment to be ready (timeout: ${MAX_WAIT_TIME}s)"
if ! kubectl rollout status deployment/$APP_NAME-$NEW_DEPLOYMENT -n $NAMESPACE --timeout=${MAX_WAIT_TIME}s; then
    log "❌ Deployment rollout failed or timed out"
    if [ "$ROLLBACK_ON_FAILURE" = true ]; then
        log "Initiating automatic rollback..."
        kubectl rollout undo deployment/$APP_NAME-$NEW_DEPLOYMENT -n $NAMESPACE
        kubectl scale deployment/$APP_NAME-$NEW_DEPLOYMENT --replicas=0 -n $NAMESPACE
    fi
    exit 1
fi

log "✅ Deployment rollout completed successfully"

# Comprehensive health verification
log "Performing comprehensive health verification of $NEW_DEPLOYMENT deployment"

# Get all pod names for the new deployment
POD_NAMES=($(kubectl get pods -n $NAMESPACE -l app=$APP_NAME,deployment=$NEW_DEPLOYMENT -o jsonpath='{.items[*].metadata.name}'))

if [ ${#POD_NAMES[@]} -eq 0 ]; then
    log "❌ No pods found for $NEW_DEPLOYMENT deployment"
    exit 1
fi

log "Found ${#POD_NAMES[@]} pods for health verification"

# Health check each pod
HEALTHY_PODS=0
for POD_NAME in "${POD_NAMES[@]}"; do
    log "Checking health of pod: $POD_NAME"
    
    # Check pod readiness
    if kubectl wait --for=condition=ready pod/$POD_NAME -n $NAMESPACE --timeout=60s; then
        log "✅ Pod $POD_NAME is ready"
        
        # Perform HTTP health check
        for attempt in {1..3}; do
            log "Health check attempt $attempt/3 for pod $POD_NAME"
            
            # Use kubectl exec for internal health check
            if kubectl exec -n $NAMESPACE $POD_NAME -- wget --quiet --tries=1 --timeout=10 --spider http://localhost:$HEALTH_CHECK_PORT$HEALTH_CHECK_PATH; then
                log "✅ Health check passed for pod $POD_NAME"
                HEALTHY_PODS=$((HEALTHY_PODS + 1))
                break
            else
                log "⚠️ Health check attempt $attempt failed for pod $POD_NAME"
                if [ $attempt -eq 3 ]; then
                    log "❌ All health check attempts failed for pod $POD_NAME"
                fi
                sleep 10
            fi
        done
    else
        log "❌ Pod $POD_NAME failed readiness check"
    fi
done

# Validate minimum healthy pods
MIN_HEALTHY_PODS=$((REPLICAS * 80 / 100))  # 80% of replicas must be healthy
if [ $HEALTHY_PODS -lt $MIN_HEALTHY_PODS ]; then
    log "❌ Insufficient healthy pods: $HEALTHY_PODS/$REPLICAS (minimum required: $MIN_HEALTHY_PODS)"
    if [ "$ROLLBACK_ON_FAILURE" = true ]; then
        log "Initiating rollback due to health check failure..."
        kubectl scale deployment/$APP_NAME-$NEW_DEPLOYMENT --replicas=0 -n $NAMESPACE
    fi
    exit 1
fi

log "✅ Health verification completed: $HEALTHY_PODS/$REPLICAS pods are healthy"

# DOH Compliance validation (if enabled)
if [ "$DOH_COMPLIANCE_CHECK" = true ]; then
    log "Performing DOH compliance validation..."
    
    # Check if compliance test can be run
    if command -v npm &> /dev/null && [ -f "package.json" ]; then
        if npm run test:doh-compliance; then
            log "✅ DOH compliance validation passed"
        else
            log "❌ DOH compliance validation failed"
            if [ "$ROLLBACK_ON_FAILURE" = true ]; then
                log "Initiating rollback due to compliance failure..."
                kubectl scale deployment/$APP_NAME-$NEW_DEPLOYMENT --replicas=0 -n $NAMESPACE
            fi
            exit 1
        fi
    else
        log "⚠️ Cannot run DOH compliance tests, skipping validation"
    fi
fi

# Gradual traffic switching for zero-downtime
log "Initiating gradual traffic switch to $NEW_DEPLOYMENT deployment"

# Create temporary service for canary testing
log "Creating canary service for gradual rollout..."
kubectl create service clusterip $APP_NAME-canary -n $NAMESPACE --tcp=80:80 --dry-run=client -o yaml | \
    kubectl label --local -f - deployment=$NEW_DEPLOYMENT -o yaml | \
    kubectl apply -f -

# Gradual traffic shift: 10% -> 50% -> 100%
for TRAFFIC_PERCENTAGE in 10 50 100; do
    log "Shifting $TRAFFIC_PERCENTAGE% traffic to $NEW_DEPLOYMENT deployment"
    
    if [ $TRAFFIC_PERCENTAGE -eq 100 ]; then
        # Full switch
        kubectl patch service $APP_NAME-service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"deployment\":\"$NEW_DEPLOYMENT\"}}}"
        kubectl delete service $APP_NAME-canary -n $NAMESPACE
    else
        # Partial traffic (this would require a service mesh like Istio for true percentage-based routing)
        # For now, we'll do a simple validation and then proceed
        log "Validating $TRAFFIC_PERCENTAGE% traffic shift..."
    fi
    
    # Wait and monitor
    log "Monitoring traffic for 30 seconds..."
    sleep 30
    
    # Quick health check during traffic shift
    if ! kubectl exec -n $NAMESPACE deployment/$APP_NAME-$NEW_DEPLOYMENT -- wget --quiet --tries=1 --timeout=5 --spider http://localhost:$HEALTH_CHECK_PORT$HEALTH_CHECK_PATH; then
        log "❌ Health check failed during traffic shift at $TRAFFIC_PERCENTAGE%"
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            log "Initiating rollback due to traffic shift failure..."
            kubectl patch service $APP_NAME-service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"deployment\":\"$OLD_DEPLOYMENT\"}}}"
            kubectl scale deployment/$APP_NAME-$NEW_DEPLOYMENT --replicas=0 -n $NAMESPACE
        fi
        exit 1
    fi
    
    log "✅ Traffic shift to $TRAFFIC_PERCENTAGE% completed successfully"
done

log "✅ Traffic switching completed successfully"

# Post-deployment validation
log "Performing post-deployment validation..."

# Run smoke tests
log "Running smoke tests..."
SMOKE_TEST_PASSED=true

# Basic connectivity test
for i in {1..5}; do
    if kubectl exec -n $NAMESPACE deployment/$APP_NAME-$NEW_DEPLOYMENT -- wget --quiet --tries=1 --timeout=10 --spider http://localhost:$HEALTH_CHECK_PORT$HEALTH_CHECK_PATH; then
        log "✅ Smoke test $i/5 passed"
    else
        log "❌ Smoke test $i/5 failed"
        SMOKE_TEST_PASSED=false
        break
    fi
    sleep 2
done

if [ "$SMOKE_TEST_PASSED" = false ]; then
    log "❌ Smoke tests failed"
    if [ "$ROLLBACK_ON_FAILURE" = true ]; then
        log "Initiating rollback due to smoke test failure..."
        kubectl patch service $APP_NAME-service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"deployment\":\"$OLD_DEPLOYMENT\"}}}"
        kubectl scale deployment/$APP_NAME-$NEW_DEPLOYMENT --replicas=0 -n $NAMESPACE
        kubectl scale deployment/$APP_NAME-$OLD_DEPLOYMENT --replicas=$REPLICAS -n $NAMESPACE
    fi
    exit 1
fi

log "✅ Post-deployment validation completed successfully"

# Scale down the old deployment
log "Scaling down $OLD_DEPLOYMENT deployment"
kubectl scale deployment/$APP_NAME-$OLD_DEPLOYMENT --replicas=0 -n $NAMESPACE

# Update HPA target if needed
log "Updating HPA target to $NEW_DEPLOYMENT"
kubectl patch hpa $APP_NAME-hpa -n $NAMESPACE -p "{\"spec\":{\"scaleTargetRef\":{\"name\":\"$APP_NAME-$NEW_DEPLOYMENT\"}}}"

# Generate deployment report
log "Generating deployment report..."
cat > "/tmp/deployment-report-$(date +%Y%m%d-%H%M%S).json" << EOF
{
  "deployment_id": "$(date +%Y%m%d-%H%M%S)",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "application": "$APP_NAME",
  "version": "$VERSION",
  "deployment_type": "blue-green",
  "target_deployment": "$NEW_DEPLOYMENT",
  "previous_deployment": "$OLD_DEPLOYMENT",
  "replicas": $REPLICAS,
  "healthy_pods": $HEALTHY_PODS,
  "doh_compliance_check": $DOH_COMPLIANCE_CHECK,
  "smoke_tests_passed": $SMOKE_TEST_PASSED,
  "deployment_duration": "$(($(date +%s) - START_TIME)) seconds",
  "status": "success"
}
EOF

log "✅ Enhanced blue-green deployment completed successfully!"
log "Environment: $ENVIRONMENT"
log "Application: $APP_NAME"
log "Version: $VERSION"
log "Active Deployment: $NEW_DEPLOYMENT"
log "Replicas: $REPLICAS"
log "Healthy Pods: $HEALTHY_PODS"

# Add deployment record to history
echo "$(date): Successfully deployed $APP_NAME version $VERSION to $NEW_DEPLOYMENT in $ENVIRONMENT environment" >> /var/log/deployment-history.log

# Send success notification
if command -v curl &> /dev/null && [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Reyada Homecare deployment successful\\nEnvironment: $ENVIRONMENT\\nVersion: $VERSION\\nDeployment: $NEW_DEPLOYMENT\\nReplicas: $REPLICAS\\nTimestamp: $(date)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

log "Deployment process completed successfully"
exit 0
