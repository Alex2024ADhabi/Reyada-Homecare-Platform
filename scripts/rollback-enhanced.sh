#!/bin/bash

# Enhanced Rollback Script for Reyada Homecare Platform
# This script rolls back to the previous deployment in case of issues

set -e

# Configuration
NAMESPACE="reyada-homecare"
APP_NAME="reyada-frontend"
MAX_WAIT_TIME=300  # Maximum time to wait for deployment in seconds

echo "Starting rollback procedure for $APP_NAME"

# Determine current active deployment (blue or green)
CURRENT_DEPLOYMENT=$(kubectl get service "$APP_NAME-service" -n "$NAMESPACE" -o jsonpath='{.spec.selector.deployment}')

if [ "$CURRENT_DEPLOYMENT" == "blue" ]; then
  ROLLBACK_DEPLOYMENT="green"
else
  ROLLBACK_DEPLOYMENT="blue"
fi

echo "Current active deployment is $CURRENT_DEPLOYMENT. Will roll back to $ROLLBACK_DEPLOYMENT"

# Check if the rollback deployment has any pods
POD_COUNT=$(kubectl get pods -n $NAMESPACE -l app=$APP_NAME,deployment=$ROLLBACK_DEPLOYMENT -o jsonpath='{.items | length}')

if [ "$POD_COUNT" -eq 0 ]; then
  echo "Error: No pods found in $ROLLBACK_DEPLOYMENT deployment. Cannot roll back."
  echo "You may need to manually restore from a previous image version."
  exit 1
fi

# Scale up the rollback deployment if needed
REPLICA_COUNT=$(kubectl get deployment/$APP_NAME-$ROLLBACK_DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.replicas}')
if [ "$REPLICA_COUNT" -lt 3 ]; then
  echo "Scaling up $ROLLBACK_DEPLOYMENT deployment to 3 replicas"
  kubectl scale deployment/$APP_NAME-$ROLLBACK_DEPLOYMENT --replicas=3 -n $NAMESPACE
  
  # Wait for the rollback deployment to be ready
  echo "Waiting for $ROLLBACK_DEPLOYMENT deployment to be ready"
  kubectl rollout status deployment/$APP_NAME-$ROLLBACK_DEPLOYMENT -n $NAMESPACE --timeout=${MAX_WAIT_TIME}s
fi

# Switch traffic to the rollback deployment
echo "Switching traffic to $ROLLBACK_DEPLOYMENT deployment"
kubectl patch service $APP_NAME-service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"deployment\":\"$ROLLBACK_DEPLOYMENT\"}}}"

# Wait a moment to ensure traffic is flowing to the rollback deployment
echo "Waiting for traffic to stabilize"
sleep 10

# Scale down the problematic deployment
echo "Scaling down $CURRENT_DEPLOYMENT deployment"
kubectl scale deployment/$APP_NAME-$CURRENT_DEPLOYMENT --replicas=0 -n $NAMESPACE

echo "Rollback completed successfully!"
echo "$APP_NAME is now running on $ROLLBACK_DEPLOYMENT deployment"

# Add rollback record to history
echo "$(date): Rolled back $APP_NAME to $ROLLBACK_DEPLOYMENT" >> deployment-history.log
