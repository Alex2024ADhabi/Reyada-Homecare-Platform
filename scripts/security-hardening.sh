#!/bin/bash

# Security Hardening Script for Reyada Homecare Platform
# This script implements security best practices and runs vulnerability scans

set -e

# Configuration
NAMESPACE="reyada-homecare"
LOG_FILE="/var/log/reyada-security.log"
REPORT_DIR="/var/reports/security"
EMAIL_RECIPIENT="security@reyada-homecare.ae"

# Create report directory
mkdir -p "$REPORT_DIR"

log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "$LOG_FILE"
}

log "Starting security hardening procedure"

# 1. Update Network Policies
log "Implementing strict network policies"
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: $NAMESPACE
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-ingress
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: reyada-frontend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway-ingress
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      app: reyada-api-gateway
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: reyada-frontend
    ports:
    - protocol: TCP
      port: 8000
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-internal-services
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      tier: internal
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: reyada-api-gateway
    - podSelector:
        matchLabels:
          tier: internal
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-database-access
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: internal
    - podSelector:
        matchLabels:
          app: reyada-api-gateway
EOF

# 2. Apply Pod Security Policies
log "Applying Pod Security Policies"
cat <<EOF | kubectl apply -f -
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: reyada-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true
EOF

# 3. Update Secret Management
log "Implementing secure secret management"

# Create a script to rotate secrets
cat > rotate-secrets.sh <<'EOF'
#!/bin/bash

NAMESPACE="reyada-homecare"
SECRET_NAMES=("db-credentials" "api-keys" "jwt-secret" "oauth-credentials")

for secret in "${SECRET_NAMES[@]}"; do
  echo "Rotating secret: $secret"
  
  # Generate new credentials
  NEW_PASSWORD=$(openssl rand -base64 32)
  NEW_API_KEY=$(openssl rand -hex 32)
  NEW_JWT_SECRET=$(openssl rand -base64 64)
  
  # Update the secret
  case "$secret" in
    "db-credentials")
      kubectl create secret generic "$secret" \
        --from-literal=username=postgres \
        --from-literal=password="$NEW_PASSWORD" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
      
      # Update database password
      PG_POD=$(kubectl get pods -n "$NAMESPACE" -l app=postgres -o jsonpath='{.items[0].metadata.name}')
      kubectl exec -n "$NAMESPACE" "$PG_POD" -- psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';"
      ;;
    
    "api-keys")
      kubectl create secret generic "$secret" \
        --from-literal=api-key="$NEW_API_KEY" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
      ;;
    
    "jwt-secret")
      kubectl create secret generic "$secret" \
        --from-literal=secret="$NEW_JWT_SECRET" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
      ;;
    
    "oauth-credentials")
      # These would typically come from your OAuth provider
      kubectl get secret "$secret" -n "$NAMESPACE" -o json | \
        jq '.data["client-id"] = "'$(echo -n "new-client-id" | base64)'" | .data["client-secret"] = "'$(echo -n "new-client-secret" | base64)'"' | \
        kubectl apply -f -
      ;;
  esac
done

# Restart affected deployments
kubectl rollout restart deployment -l affected-by-secret-rotation=true -n "$NAMESPACE"
EOF

chmod +x rotate-secrets.sh

# 4. Run Vulnerability Scanning
log "Running vulnerability scanning"

# Scan container images
log "Scanning container images"
mkdir -p "$REPORT_DIR/trivy"
for deployment in $(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
  image=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
  log "Scanning image: $image"
  trivy image --format json --output "$REPORT_DIR/trivy/$deployment.json" "$image"
done

# Scan Kubernetes resources
log "Scanning Kubernetes resources"
mkdir -p "$REPORT_DIR/kubesec"
for deployment in $(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
  kubectl get deployment "$deployment" -n "$NAMESPACE" -o yaml | \
    kubesec scan - > "$REPORT_DIR/kubesec/$deployment.json"
done

# Scan for CIS benchmarks
log "Running CIS benchmark scan"
kube-bench --json > "$REPORT_DIR/kube-bench-results.json"

# 5. Apply Security Context to Deployments
log "Applying security context to deployments"
for deployment in $(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
  kubectl patch deployment "$deployment" -n "$NAMESPACE" --type json -p '[
    {
      "op": "add",
      "path": "/spec/template/spec/securityContext",
      "value": {
        "runAsNonRoot": true,
        "runAsUser": 10001,
        "runAsGroup": 10001,
        "fsGroup": 10001,
        "readOnlyRootFilesystem": true
      }
    }
  ]'
done

# 6. Enable Audit Logging
log "Enabling audit logging"
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: audit-policy
  namespace: kube-system
data:
  policy.yaml: |
    apiVersion: audit.k8s.io/v1
    kind: Policy
    rules:
    - level: Metadata
      resources:
      - group: ""
        resources: ["pods"]
    - level: RequestResponse
      resources:
      - group: ""
        resources: ["pods/exec", "pods/attach"]
    - level: Metadata
      resources:
      - group: ""
        resources: ["secrets"]
    - level: Metadata
      resources:
      - group: "authentication.k8s.io"
        resources: ["*"]
EOF

# 7. Generate Security Report
log "Generating security report"

# Combine all scan results
python3 -c '
import json
import os
import glob

report_dir = "'"$REPORT_DIR"'"
output_file = os.path.join(report_dir, "security-report.json")

report = {
    "timestamp": "'"$(date -Iseconds)"'",
    "cluster": "'"$(kubectl config current-context)"'",
    "namespace": "'"$NAMESPACE"'",
    "trivy_results": {},
    "kubesec_results": {},
    "kube_bench_results": {}
}

# Process Trivy results
for file in glob.glob(os.path.join(report_dir, "trivy/*.json")):
    deployment = os.path.basename(file).replace(".json", "")
    with open(file, "r") as f:
        try:
            data = json.load(f)
            report["trivy_results"][deployment] = data
        except json.JSONDecodeError:
            report["trivy_results"][deployment] = {"error": "Failed to parse results"}

# Process Kubesec results
for file in glob.glob(os.path.join(report_dir, "kubesec/*.json")):
    deployment = os.path.basename(file).replace(".json", "")
    with open(file, "r") as f:
        try:
            data = json.load(f)
            report["kubesec_results"][deployment] = data
        except json.JSONDecodeError:
            report["kubesec_results"][deployment] = {"error": "Failed to parse results"}

# Process Kube-bench results
kube_bench_file = os.path.join(report_dir, "kube-bench-results.json")
if os.path.exists(kube_bench_file):
    with open(kube_bench_file, "r") as f:
        try:
            data = json.load(f)
            report["kube_bench_results"] = data
        except json.JSONDecodeError:
            report["kube_bench_results"] = {"error": "Failed to parse results"}

# Generate summary
vulnerabilities = {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "unknown": 0
}

for deployment, result in report["trivy_results"].items():
    if "Results" in result:
        for res in result["Results"]:
            if "Vulnerabilities" in res:
                for vuln in res["Vulnerabilities"]:
                    severity = vuln.get("Severity", "unknown").lower()
                    if severity in vulnerabilities:
                        vulnerabilities[severity] += 1

report["summary"] = {
    "vulnerabilities": vulnerabilities,
    "total_vulnerabilities": sum(vulnerabilities.values()),
    "critical_deployments": []
}

# Identify critical deployments
for deployment, result in report["trivy_results"].items():
    has_critical = False
    if "Results" in result:
        for res in result["Results"]:
            if "Vulnerabilities" in res:
                for vuln in res["Vulnerabilities"]:
                    if vuln.get("Severity", "").lower() == "critical":
                        has_critical = True
                        break
            if has_critical:
                break
    
    if has_critical:
        report["summary"]["critical_deployments"].append(deployment)

# Write the report
with open(output_file, "w") as f:
    json.dump(report, f, indent=2)

# Generate HTML report
html_report = os.path.join(report_dir, "security-report.html")
with open(html_report, "w") as f:
    f.write("""<!DOCTYPE html>
<html>
<head>
    <title>Reyada Homecare Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
        .critical { color: #d9534f; }
        .high { color: #f0ad4e; }
        .medium { color: #5bc0de; }
        .low { color: #5cb85c; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Reyada Homecare Security Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Timestamp: {timestamp}</p>
        <p>Cluster: {cluster}</p>
        <p>Namespace: {namespace}</p>
        <h3>Vulnerabilities</h3>
        <p><span class="critical">Critical: {critical}</span></p>
        <p><span class="high">High: {high}</span></p>
        <p><span class="medium">Medium: {medium}</span></p>
        <p><span class="low">Low: {low}</span></p>
        <p>Unknown: {unknown}</p>
        <p>Total: {total}</p>
    </div>
    
    <h2>Critical Deployments</h2>
    <ul>
        {critical_deployments}
    </ul>
    
    <h2>Recommendations</h2>
    <ol>
        <li>Update all container images with critical vulnerabilities</li>
        <li>Apply security patches to all affected components</li>
        <li>Review and update network policies</li>
        <li>Implement regular secret rotation</li>
        <li>Enable audit logging for all sensitive operations</li>
    </ol>
</body>
</html>
""".format(
        timestamp=report["timestamp"],
        cluster=report["cluster"],
        namespace=report["namespace"],
        critical=vulnerabilities["critical"],
        high=vulnerabilities["high"],
        medium=vulnerabilities["medium"],
        low=vulnerabilities["low"],
        unknown=vulnerabilities["unknown"],
        total=sum(vulnerabilities.values()),
        critical_deployments="".join(["<li>{}</li>".format(d) for d in report["summary"]["critical_deployments"]])
    ))
'

# 8. Send Security Report
log "Sending security report"
mail -s "Reyada Homecare Security Report" -a "$REPORT_DIR/security-report.html" "$EMAIL_RECIPIENT" < /dev/null

log "Security hardening completed successfully"

exit 0
