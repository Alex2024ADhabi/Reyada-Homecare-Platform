#!/bin/bash

# Healthcare Platform Monitoring Setup
# Comprehensive monitoring, alerting, and observability for DOH compliance

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONITORING_NAMESPACE="reyada-monitoring"
HEALTHCARE_NAMESPACE="reyada-homecare"
LOG_FILE="/tmp/monitoring-setup-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log_error "$1"
    exit 1
}

# Create monitoring namespace
create_monitoring_namespace() {
    log_info "Creating monitoring namespace..."
    
    kubectl create namespace "$MONITORING_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Label namespace for monitoring
    kubectl label namespace "$MONITORING_NAMESPACE" \
        monitoring=enabled \
        healthcare-platform=true \
        doh-compliant=true \
        --overwrite
    
    log_success "Monitoring namespace created"
}

# Install Prometheus Operator
install_prometheus_operator() {
    log_info "Installing Prometheus Operator..."
    
    # Add Prometheus community Helm repository
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Install kube-prometheus-stack
    helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
        --namespace "$MONITORING_NAMESPACE" \
        --create-namespace \
        --values - << 'EOF'
prometheus:
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp2
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
    additionalScrapeConfigs:
      - job_name: 'healthcare-platform'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - reyada-homecare
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
      - job_name: 'doh-compliance-metrics'
        static_configs:
          - targets: ['healthcare-platform.reyada-homecare.svc.cluster.local:8080']
        metrics_path: '/api/metrics/doh-compliance'
        scrape_interval: 30s
      - job_name: 'hipaa-compliance-metrics'
        static_configs:
          - targets: ['healthcare-platform.reyada-homecare.svc.cluster.local:8080']
        metrics_path: '/api/metrics/hipaa-compliance'
        scrape_interval: 30s
      - job_name: 'daman-integration-metrics'
        static_configs:
          - targets: ['healthcare-platform.reyada-homecare.svc.cluster.local:8080']
        metrics_path: '/api/metrics/daman-integration'
        scrape_interval: 60s

grafana:
  adminPassword: "${GRAFANA_ADMIN_PASSWORD:-admin123}"
  persistence:
    enabled: true
    storageClassName: gp2
    size: 10Gi
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
        - name: 'healthcare-dashboards'
          orgId: 1
          folder: 'Healthcare'
          type: file
          disableDeletion: false
          editable: true
          options:
            path: /var/lib/grafana/dashboards/healthcare
  dashboards:
    healthcare:
      healthcare-overview:
        gnetId: 12900
        revision: 1
        datasource: Prometheus
      doh-compliance:
        url: https://raw.githubusercontent.com/reyada-healthcare/monitoring/main/dashboards/doh-compliance.json
      hipaa-compliance:
        url: https://raw.githubusercontent.com/reyada-healthcare/monitoring/main/dashboards/hipaa-compliance.json
      daman-integration:
        url: https://raw.githubusercontent.com/reyada-healthcare/monitoring/main/dashboards/daman-integration.json

alertmanager:
  config:
    global:
      smtp_smarthost: 'smtp.gmail.com:587'
      smtp_from: 'alerts@reyada.ae'
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'healthcare-alerts'
      routes:
        - match:
            severity: critical
          receiver: 'critical-healthcare-alerts'
        - match:
            healthcare_impact: high
          receiver: 'healthcare-team'
        - match:
            doh_compliance: violated
          receiver: 'compliance-team'
    receivers:
      - name: 'healthcare-alerts'
        email_configs:
          - to: 'healthcare-ops@reyada.ae'
            subject: 'Healthcare Platform Alert: {{ .GroupLabels.alertname }}'
            body: |
              {{ range .Alerts }}
              Alert: {{ .Annotations.summary }}
              Description: {{ .Annotations.description }}
              Severity: {{ .Labels.severity }}
              Healthcare Impact: {{ .Labels.healthcare_impact }}
              {{ end }}
        slack_configs:
          - api_url: '${SLACK_WEBHOOK_URL}'
            channel: '#healthcare-alerts'
            title: 'Healthcare Platform Alert'
            text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
      - name: 'critical-healthcare-alerts'
        email_configs:
          - to: 'healthcare-critical@reyada.ae'
            subject: 'CRITICAL: Healthcare Platform Alert'
        pagerduty_configs:
          - routing_key: '${PAGERDUTY_ROUTING_KEY}'
            description: 'Critical healthcare platform alert'
      - name: 'healthcare-team'
        email_configs:
          - to: 'healthcare-team@reyada.ae'
      - name: 'compliance-team'
        email_configs:
          - to: 'compliance@reyada.ae'
            subject: 'DOH Compliance Violation Alert'
EOF
    
    log_success "Prometheus Operator installed"
}

# Install ELK Stack for logging
install_elk_stack() {
    log_info "Installing ELK Stack for healthcare logging..."
    
    # Add Elastic Helm repository
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    # Install Elasticsearch
    helm upgrade --install elasticsearch elastic/elasticsearch \
        --namespace "$MONITORING_NAMESPACE" \
        --values - << 'EOF'
replicas: 3
minimumMasterNodes: 2
esMajorVersion: 8
clusterName: "reyada-healthcare-logs"
nodeGroup: "master"
roles:
  master: "true"
  ingest: "true"
  data: "true"
  remote_cluster_client: "true"
  ml: "false"
resources:
  requests:
    cpu: "1000m"
    memory: "2Gi"
  limits:
    cpu: "2000m"
    memory: "4Gi"
volumeClaimTemplate:
  accessModes: ["ReadWriteOnce"]
  storageClassName: gp2
  resources:
    requests:
      storage: 100Gi
esConfig:
  elasticsearch.yml: |
    cluster.name: "reyada-healthcare-logs"
    network.host: 0.0.0.0
    xpack.security.enabled: true
    xpack.security.transport.ssl.enabled: true
    xpack.security.http.ssl.enabled: false
    xpack.monitoring.collection.enabled: true
    # Healthcare-specific settings
    action.auto_create_index: "+healthcare-*,-*"
    indices.memory.index_buffer_size: 20%
EOF
    
    # Install Kibana
    helm upgrade --install kibana elastic/kibana \
        --namespace "$MONITORING_NAMESPACE" \
        --values - << 'EOF'
replicas: 2
resources:
  requests:
    cpu: "500m"
    memory: "1Gi"
  limits:
    cpu: "1000m"
    memory: "2Gi"
kibanaConfig:
  kibana.yml: |
    server.name: "reyada-kibana"
    server.host: "0.0.0.0"
    elasticsearch.hosts: ["http://elasticsearch-master:9200"]
    xpack.monitoring.enabled: true
    # Healthcare-specific configuration
    server.defaultRoute: "/app/dashboards#/view/healthcare-overview"
    xpack.security.session.idleTimeout: "1h"
    xpack.security.session.lifespan: "8h"
service:
  type: ClusterIP
  port: 5601
EOF
    
    # Install Filebeat for log collection
    helm upgrade --install filebeat elastic/filebeat \
        --namespace "$MONITORING_NAMESPACE" \
        --values - << 'EOF'
daemonset:
  enabled: true
filebeatConfig:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*healthcare*.log
        - /var/log/containers/*reyada*.log
      processors:
        - add_kubernetes_metadata:
            host: ${NODE_NAME}
            matchers:
            - logs_path:
                logs_path: "/var/log/containers/"
        - add_fields:
            target: healthcare
            fields:
              platform: reyada
              compliance: doh-hipaa
    
    output.elasticsearch:
      hosts: ["elasticsearch-master:9200"]
      index: "healthcare-logs-%{+yyyy.MM.dd}"
    
    setup.template.name: "healthcare-logs"
    setup.template.pattern: "healthcare-logs-*"
    setup.template.settings:
      index.number_of_shards: 1
      index.number_of_replicas: 1
    
    logging.level: info
    logging.to_files: true
    logging.files:
      path: /var/log/filebeat
      name: filebeat
      keepfiles: 7
      permissions: 0644
EOF
    
    log_success "ELK Stack installed"
}

# Install Jaeger for distributed tracing
install_jaeger() {
    log_info "Installing Jaeger for distributed tracing..."
    
    # Add Jaeger Helm repository
    helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
    helm repo update
    
    # Install Jaeger
    helm upgrade --install jaeger jaegertracing/jaeger \
        --namespace "$MONITORING_NAMESPACE" \
        --values - << 'EOF'
provisionDataStore:
  cassandra: false
  elasticsearch: true
storage:
  type: elasticsearch
  elasticsearch:
    host: elasticsearch-master
    port: 9200
    scheme: http
    user: elastic
    password: changeme
query:
  enabled: true
  replicaCount: 2
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
collector:
  enabled: true
  replicaCount: 2
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
agent:
  enabled: true
  daemonset:
    useHostPort: true
EOF
    
    log_success "Jaeger installed"
}

# Setup healthcare-specific monitoring
setup_healthcare_monitoring() {
    log_info "Setting up healthcare-specific monitoring..."
    
    # Create healthcare monitoring ConfigMap
    kubectl apply -f - << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: healthcare-monitoring-config
  namespace: reyada-monitoring
  labels:
    app: healthcare-monitoring
data:
  doh-compliance-rules.yml: |
    groups:
    - name: doh-compliance
      rules:
      - alert: DOHComplianceViolation
        expr: doh_compliance_score < 0.85
        for: 1m
        labels:
          severity: critical
          healthcare_impact: high
          doh_compliance: violated
        annotations:
          summary: "DOH compliance score below threshold"
          description: "DOH compliance score is {{ $value }}, below required 0.85"
      
      - alert: MissingClinicalDocumentation
        expr: missing_clinical_docs_total > 5
        for: 2m
        labels:
          severity: warning
          healthcare_impact: medium
          doh_compliance: at_risk
        annotations:
          summary: "Missing clinical documentation detected"
          description: "{{ $value }} clinical documents are missing"
  
  hipaa-compliance-rules.yml: |
    groups:
    - name: hipaa-compliance
      rules:
      - alert: UnauthorizedDataAccess
        expr: unauthorized_access_attempts_total > 3
        for: 1m
        labels:
          severity: critical
          healthcare_impact: high
          security: breach_suspected
        annotations:
          summary: "Unauthorized access attempts detected"
          description: "{{ $value }} unauthorized access attempts in last minute"
      
      - alert: EncryptionFailure
        expr: encryption_failures_total > 0
        for: 0s
        labels:
          severity: critical
          healthcare_impact: critical
          security: encryption_failure
        annotations:
          summary: "Data encryption failure detected"
          description: "{{ $value }} encryption failures detected"
  
  daman-integration-rules.yml: |
    groups:
    - name: daman-integration
      rules:
      - alert: DAMANIntegrationDown
        expr: daman_connection_status == 0
        for: 2m
        labels:
          severity: critical
          healthcare_impact: high
          integration: daman
        annotations:
          summary: "DAMAN integration is down"
          description: "Connection to DAMAN has been down for more than 2 minutes"
      
      - alert: DAMANAuthorizationFailures
        expr: rate(daman_authorization_failures_total[5m]) > 0.1
        for: 3m
        labels:
          severity: warning
          healthcare_impact: medium
          integration: daman
        annotations:
          summary: "High DAMAN authorization failure rate"
          description: "DAMAN authorization failure rate is {{ $value }} per second"
EOF
    
    # Create ServiceMonitor for healthcare platform
    kubectl apply -f - << 'EOF'
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: healthcare-platform
  namespace: reyada-monitoring
  labels:
    app: healthcare-platform
spec:
  selector:
    matchLabels:
      app: healthcare-platform
  namespaceSelector:
    matchNames:
    - reyada-homecare
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
  - port: http
    path: /api/metrics/doh-compliance
    interval: 30s
  - port: http
    path: /api/metrics/hipaa-compliance
    interval: 30s
  - port: http
    path: /api/metrics/daman-integration
    interval: 60s
EOF
    
    log_success "Healthcare-specific monitoring configured"
}

# Setup log aggregation and analysis
setup_log_analysis() {
    log_info "Setting up healthcare log analysis..."
    
    # Create Elasticsearch index templates for healthcare logs
    kubectl exec -n "$MONITORING_NAMESPACE" deployment/elasticsearch-master -- \
        curl -X PUT "localhost:9200/_index_template/healthcare-logs" \
        -H "Content-Type: application/json" \
        -d '{
          "index_patterns": ["healthcare-*"],
          "template": {
            "settings": {
              "number_of_shards": 1,
              "number_of_replicas": 1,
              "index.lifecycle.name": "healthcare-policy",
              "index.lifecycle.rollover_alias": "healthcare-logs"
            },
            "mappings": {
              "properties": {
                "@timestamp": {"type": "date"},
                "patient_id": {"type": "keyword"},
                "user_id": {"type": "keyword"},
                "session_id": {"type": "keyword"},
                "action": {"type": "keyword"},
                "resource": {"type": "keyword"},
                "compliance_flag": {"type": "keyword"},
                "doh_category": {"type": "keyword"},
                "severity": {"type": "keyword"},
                "message": {"type": "text"},
                "ip_address": {"type": "ip"},
                "response_time": {"type": "float"}
              }
            }
          }
        }' || log_warning "Failed to create Elasticsearch index template"
    
    log_success "Healthcare log analysis configured"
}

# Create monitoring dashboards
create_monitoring_dashboards() {
    log_info "Creating healthcare monitoring dashboards..."
    
    # Apply existing Grafana dashboard configurations
    kubectl apply -f "$PROJECT_ROOT/monitoring/grafana/healthcare-dashboards.yaml"
    
    # Create Kibana dashboards for log analysis
    kubectl apply -f - << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: kibana-healthcare-dashboards
  namespace: reyada-monitoring
data:
  healthcare-audit-dashboard.json: |
    {
      "version": "8.8.0",
      "objects": [
        {
          "id": "healthcare-audit-dashboard",
          "type": "dashboard",
          "attributes": {
            "title": "Healthcare Audit Dashboard",
            "description": "Comprehensive audit trail for healthcare platform",
            "panelsJSON": "[{\"version\":\"8.8.0\",\"gridData\":{\"x\":0,\"y\":0,\"w\":24,\"h\":15},\"panelIndex\":\"1\"}]",
            "timeRestore": false,
            "timeTo": "now",
            "timeFrom": "now-24h"
          }
        }
      ]
    }
EOF
    
    log_success "Monitoring dashboards created"
}

# Setup alerting and notifications
setup_alerting() {
    log_info "Setting up healthcare alerting..."
    
    # Apply Prometheus alerting rules
    kubectl apply -f "$PROJECT_ROOT/monitoring/prometheus/healthcare-alerts.yaml"
    
    # Create PagerDuty integration if configured
    if [[ -n "${PAGERDUTY_ROUTING_KEY:-}" ]]; then
        kubectl create secret generic pagerduty-config \
            --from-literal=routing-key="$PAGERDUTY_ROUTING_KEY" \
            -n "$MONITORING_NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -
    fi
    
    # Create Slack webhook secret if configured
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        kubectl create secret generic slack-config \
            --from-literal=webhook-url="$SLACK_WEBHOOK_URL" \
            -n "$MONITORING_NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -
    fi
    
    log_success "Healthcare alerting configured"
}

# Validate monitoring setup
validate_monitoring_setup() {
    log_info "Validating monitoring setup..."
    
    # Check if all components are running
    local components=("prometheus" "grafana" "alertmanager" "elasticsearch" "kibana" "jaeger")
    
    for component in "${components[@]}"; do
        if kubectl get pods -n "$MONITORING_NAMESPACE" -l "app.kubernetes.io/name=$component" --no-headers | grep -q Running; then
            log_success "$component is running"
        else
            log_warning "$component is not running properly"
        fi
    done
    
    # Test Prometheus targets
    log_info "Checking Prometheus targets..."
    kubectl port-forward -n "$MONITORING_NAMESPACE" svc/prometheus-stack-kube-prom-prometheus 9090:9090 &
    local port_forward_pid=$!
    sleep 5
    
    if curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | select(.health == "up") | .labels.job' | grep -q healthcare; then
        log_success "Healthcare targets are being scraped"
    else
        log_warning "Healthcare targets may not be configured properly"
    fi
    
    kill $port_forward_pid 2>/dev/null || true
    
    log_success "Monitoring setup validation completed"
}

# Main function
main() {
    log_info "Starting healthcare monitoring setup..."
    
    create_monitoring_namespace
    install_prometheus_operator
    install_elk_stack
    install_jaeger
    setup_healthcare_monitoring
    setup_log_analysis
    create_monitoring_dashboards
    setup_alerting
    validate_monitoring_setup
    
    log_success "Healthcare monitoring setup completed successfully"
    log_info "Access Grafana: kubectl port-forward -n $MONITORING_NAMESPACE svc/prometheus-stack-grafana 3000:80"
    log_info "Access Kibana: kubectl port-forward -n $MONITORING_NAMESPACE svc/kibana-kibana 5601:5601"
    log_info "Access Jaeger: kubectl port-forward -n $MONITORING_NAMESPACE svc/jaeger-query 16686:16686"
    log_info "Log file: $LOG_FILE"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
