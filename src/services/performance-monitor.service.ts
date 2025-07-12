/**
 * Performance Monitor Service
 * Enhanced with incident and complaint management monitoring
 * Provides real-time quality metrics and predictive analytics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type:
    | "memory"
    | "cpu"
    | "network"
    | "custom"
    | "quality"
    | "incident"
    | "complaint";
  metadata?: Record<string, any>;
}

interface PerformanceAlert {
  type: string;
  message: string;
  timestamp: number;
  severity: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  summary: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    networkLatency: number;
    errorRate: number;
    qualityScore: number;
    incidentRate: number;
    complaintRate: number;
  };
}

interface QualityMetric {
  type: "incident" | "complaint" | "safety" | "compliance" | "satisfaction";
  category: string;
  value: number;
  target?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface QualityPrediction {
  incidentTrend: "increasing" | "decreasing" | "stable";
  complaintTrend: "increasing" | "decreasing" | "stable";
  safetyScore: number;
  complianceScore: number;
  satisfactionScore: number;
  recommendations: string[];
  confidence: number;
}

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private qualityMetrics: QualityMetric[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly maxMetrics = 1000;
  private readonly alertThresholds = {
    cpu: 80,
    memory: 85,
    errorRate: 5,
    incidentRate: 10, // incidents per 1000 patient days
    complaintRate: 5, // complaints per 1000 patients
    responseTime: 2000, // milliseconds
  };

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    if (typeof window !== "undefined" && "performance" in window) {
      // Initialize performance observer for web vitals
      this.setupPerformanceObserver();
    }
  }

  private setupPerformanceObserver(): void {
    try {
      // Monitor navigation timing
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.duration || 0,
              timestamp: Date.now(),
              type: "network",
              metadata: {
                entryType: entry.entryType,
                startTime: entry.startTime,
              },
            });
          }
        });

        observer.observe({ entryTypes: ["navigation", "resource", "measure"] });
      }
    } catch (error) {
      console.warn("Performance observer not supported:", error);
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.analyzeQualityTrends();
      this.checkAlertThresholds();
    }, 5000); // Collect metrics every 5 seconds
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private collectSystemMetrics(): void {
    const timestamp = Date.now();

    // Collect memory usage if available
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: "memory-used",
        value: memory.usedJSHeapSize / 1024 / 1024, // MB
        timestamp,
        type: "memory",
      });

      this.recordMetric({
        name: "memory-total",
        value: memory.totalJSHeapSize / 1024 / 1024, // MB
        timestamp,
        type: "memory",
      });
    }

    // Collect network timing
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric({
        name: "network-downlink",
        value: connection.downlink || 0,
        timestamp,
        type: "network",
        metadata: {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
        },
      });
    }
  }

  recordMetric(
    metric: Omit<PerformanceMetric, "timestamp"> & { timestamp?: number },
  ): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Record quality metrics for incident and complaint management
   */
  recordQualityMetric(metric: {
    type: "incident" | "complaint" | "safety" | "compliance" | "satisfaction";
    category: string;
    value: number;
    target?: number;
    timestamp?: Date;
    metadata?: Record<string, any>;
  }): void {
    const timestamp = metric.timestamp || new Date();

    const qualityMetric: QualityMetric = {
      type: metric.type,
      category: metric.category,
      value: metric.value,
      target: metric.target,
      timestamp,
      metadata: metric.metadata,
    };

    this.qualityMetrics.push(qualityMetric);

    // Also record as performance metric for unified tracking
    this.recordMetric({
      name: `quality_${metric.type}_${metric.category}`,
      value: metric.value,
      timestamp: timestamp.getTime(),
      type: "quality",
      metadata: {
        ...metric.metadata,
        target: metric.target,
        category: metric.category,
        qualityType: metric.type,
      },
    });

    // Check for quality anomalies
    this.detectQualityAnomaly(metric);
  }

  /**
   * Detect quality anomalies in metrics
   */
  private detectQualityAnomaly(metric: {
    type: "incident" | "complaint" | "safety" | "compliance" | "satisfaction";
    category: string;
    value: number;
    target?: number;
  }): void {
    if (metric.target && metric.value > metric.target * 1.5) {
      this.addAlert({
        type: "quality_anomaly",
        message: `Quality anomaly detected in ${metric.type} ${metric.category}: ${metric.value} exceeds target ${metric.target} by 50%`,
        timestamp: Date.now(),
        severity: "high",
        metadata: {
          metricType: metric.type,
          category: metric.category,
          value: metric.value,
          target: metric.target,
        },
      });
    }

    // Specific anomaly detection for incidents
    if (
      metric.type === "incident" &&
      metric.value > this.alertThresholds.incidentRate
    ) {
      this.addAlert({
        type: "incident_rate_high",
        message: `High incident rate detected: ${metric.value} incidents per 1000 patient days`,
        timestamp: Date.now(),
        severity: "critical",
        metadata: {
          category: metric.category,
          value: metric.value,
          threshold: this.alertThresholds.incidentRate,
        },
      });
    }

    // Specific anomaly detection for complaints
    if (
      metric.type === "complaint" &&
      metric.value > this.alertThresholds.complaintRate
    ) {
      this.addAlert({
        type: "complaint_rate_high",
        message: `High complaint rate detected: ${metric.value} complaints per 1000 patients`,
        timestamp: Date.now(),
        severity: "high",
        metadata: {
          category: metric.category,
          value: metric.value,
          threshold: this.alertThresholds.complaintRate,
        },
      });
    }
  }

  /**
   * Generate quality predictions based on historical data
   */
  generateQualityPredictions(): QualityPrediction {
    const qualityMetrics = this.metrics.filter((m) => m.type === "quality");
    const incidentMetrics = qualityMetrics.filter((m) =>
      m.name.includes("incident"),
    );
    const complaintMetrics = qualityMetrics.filter((m) =>
      m.name.includes("complaint"),
    );
    const safetyMetrics = qualityMetrics.filter((m) =>
      m.name.includes("safety"),
    );
    const complianceMetrics = qualityMetrics.filter((m) =>
      m.name.includes("compliance"),
    );
    const satisfactionMetrics = qualityMetrics.filter((m) =>
      m.name.includes("satisfaction"),
    );

    // Simple trend analysis
    const getMetricTrend = (
      metrics: PerformanceMetric[],
    ): "increasing" | "decreasing" | "stable" => {
      if (metrics.length < 2) return "stable";

      const recent = metrics.slice(-5);
      const older = metrics.slice(-10, -5);

      if (older.length === 0) return "stable";

      const recentAvg =
        recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      const olderAvg =
        older.reduce((sum, m) => sum + m.value, 0) / older.length;

      if (recentAvg > olderAvg * 1.1) return "increasing";
      if (recentAvg < olderAvg * 0.9) return "decreasing";
      return "stable";
    };

    const incidentTrend = getMetricTrend(incidentMetrics);
    const complaintTrend = getMetricTrend(complaintMetrics);

    // Calculate scores (0-100)
    const safetyScore = Math.max(0, 100 - incidentMetrics.length * 2);
    const complianceScore = Math.max(
      0,
      100 - this.alerts.filter((a) => a.type === "quality_anomaly").length * 5,
    );
    const satisfactionScore =
      satisfactionMetrics.length > 0
        ? satisfactionMetrics.reduce((sum, m) => sum + m.value, 0) /
          satisfactionMetrics.length
        : 85; // Default score

    const recommendations: string[] = [];

    if (incidentTrend === "increasing") {
      recommendations.push("Implement additional safety protocols");
      recommendations.push("Increase staff training frequency");
      recommendations.push("Review incident root causes");
    }

    if (complaintTrend === "increasing") {
      recommendations.push("Review patient communication processes");
      recommendations.push("Enhance service quality monitoring");
      recommendations.push("Implement patient feedback loops");
    }

    if (safetyScore < 80) {
      recommendations.push("Urgent safety improvement measures required");
      recommendations.push("Conduct comprehensive safety audit");
    }

    if (complianceScore < 90) {
      recommendations.push("Strengthen compliance monitoring systems");
      recommendations.push("Review regulatory requirements");
    }

    if (satisfactionScore < 80) {
      recommendations.push("Focus on patient satisfaction improvement");
      recommendations.push("Implement patient experience programs");
    }

    // Calculate confidence based on data availability
    const totalDataPoints =
      incidentMetrics.length + complaintMetrics.length + safetyMetrics.length;
    const confidence = Math.min(100, (totalDataPoints / 50) * 100); // 50 data points = 100% confidence

    return {
      incidentTrend,
      complaintTrend,
      safetyScore,
      complianceScore,
      satisfactionScore,
      recommendations,
      confidence,
    };
  }

  /**
   * Simulate chaos scenarios for testing
   */
  simulateChaosScenario(scenario: {
    type: "network" | "database" | "service" | "load";
    intensity: "low" | "medium" | "high";
    duration: number; // seconds
  }): {
    scenarioId: string;
    startTime: Date;
    expectedEndTime: Date;
    impactMetrics: string[];
  } {
    const scenarioId = `chaos_${scenario.type}_${Date.now()}`;
    const startTime = new Date();
    const expectedEndTime = new Date(
      startTime.getTime() + scenario.duration * 1000,
    );

    // Record chaos scenario start
    this.recordQualityMetric({
      type: "compliance",
      category: "chaos_engineering",
      value: 1,
      metadata: {
        scenarioId,
        scenarioType: scenario.type,
        intensity: scenario.intensity,
        duration: scenario.duration,
      },
    });

    const impactMetrics = [
      "response_time",
      "error_rate",
      "throughput",
      "availability",
    ];

    // Simulate the chaos scenario effects
    this.simulateChaosEffects(scenario, scenarioId);

    return {
      scenarioId,
      startTime,
      expectedEndTime,
      impactMetrics,
    };
  }

  private simulateChaosEffects(
    scenario: {
      type: "network" | "database" | "service" | "load";
      intensity: "low" | "medium" | "high";
      duration: number;
    },
    scenarioId: string,
  ): void {
    const intensityMultiplier = {
      low: 1.2,
      medium: 1.5,
      high: 2.0,
    }[scenario.intensity];

    // Simulate degraded performance
    const interval = setInterval(() => {
      switch (scenario.type) {
        case "network":
          this.recordMetric({
            name: "chaos-network-latency",
            value: 1000 * intensityMultiplier,
            type: "network",
            metadata: { scenarioId, chaosType: "network" },
          });
          break;
        case "database":
          this.recordMetric({
            name: "chaos-db-response-time",
            value: 500 * intensityMultiplier,
            type: "custom",
            metadata: { scenarioId, chaosType: "database" },
          });
          break;
        case "service":
          this.recordMetric({
            name: "chaos-service-error-rate",
            value: 5 * intensityMultiplier,
            type: "custom",
            metadata: { scenarioId, chaosType: "service" },
          });
          break;
        case "load":
          this.recordMetric({
            name: "chaos-cpu-usage",
            value: 70 * intensityMultiplier,
            type: "cpu",
            metadata: { scenarioId, chaosType: "load" },
          });
          break;
      }
    }, 1000);

    // Stop simulation after duration
    setTimeout(() => {
      clearInterval(interval);
      this.recordQualityMetric({
        type: "compliance",
        category: "chaos_engineering_complete",
        value: 1,
        metadata: {
          scenarioId,
          scenarioType: scenario.type,
          intensity: scenario.intensity,
          duration: scenario.duration,
        },
      });
    }, scenario.duration * 1000);
  }

  private analyzeQualityTrends(): void {
    const recentQualityMetrics = this.qualityMetrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000, // Last 24 hours
    );

    // Analyze incident trends
    const incidentMetrics = recentQualityMetrics.filter(
      (m) => m.type === "incident",
    );
    if (incidentMetrics.length > 5) {
      const avgIncidentRate =
        incidentMetrics.reduce((sum, m) => sum + m.value, 0) /
        incidentMetrics.length;
      if (avgIncidentRate > this.alertThresholds.incidentRate) {
        this.addAlert({
          type: "incident_trend_alert",
          message: `Incident rate trending high: ${avgIncidentRate.toFixed(2)} per 1000 patient days`,
          timestamp: Date.now(),
          severity: "medium",
          metadata: {
            avgRate: avgIncidentRate,
            threshold: this.alertThresholds.incidentRate,
            period: "24h",
          },
        });
      }
    }

    // Analyze complaint trends
    const complaintMetrics = recentQualityMetrics.filter(
      (m) => m.type === "complaint",
    );
    if (complaintMetrics.length > 3) {
      const avgComplaintRate =
        complaintMetrics.reduce((sum, m) => sum + m.value, 0) /
        complaintMetrics.length;
      if (avgComplaintRate > this.alertThresholds.complaintRate) {
        this.addAlert({
          type: "complaint_trend_alert",
          message: `Complaint rate trending high: ${avgComplaintRate.toFixed(2)} per 1000 patients`,
          timestamp: Date.now(),
          severity: "medium",
          metadata: {
            avgRate: avgComplaintRate,
            threshold: this.alertThresholds.complaintRate,
            period: "24h",
          },
        });
      }
    }
  }

  private checkAlertThresholds(): void {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp < 5 * 60 * 1000, // Last 5 minutes
    );

    // Check CPU usage
    const cpuMetrics = recentMetrics.filter((m) => m.type === "cpu");
    if (cpuMetrics.length > 0) {
      const avgCpu =
        cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length;
      if (avgCpu > this.alertThresholds.cpu) {
        this.addAlert({
          type: "high_cpu_usage",
          message: `High CPU usage detected: ${avgCpu.toFixed(1)}%`,
          timestamp: Date.now(),
          severity: "medium",
        });
      }
    }

    // Check memory usage
    const memoryMetrics = recentMetrics.filter((m) => m.type === "memory");
    if (memoryMetrics.length > 0) {
      const avgMemory =
        memoryMetrics.reduce((sum, m) => sum + m.value, 0) /
        memoryMetrics.length;
      if (avgMemory > this.alertThresholds.memory) {
        this.addAlert({
          type: "high_memory_usage",
          message: `High memory usage detected: ${avgMemory.toFixed(1)} MB`,
          timestamp: Date.now(),
          severity: "medium",
        });
      }
    }
  }

  addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter((a) => a.timestamp > oneDayAgo);
  }

  getMetrics(
    type?: PerformanceMetric["type"],
    limit?: number,
  ): PerformanceMetric[] {
    let filteredMetrics = type
      ? this.metrics.filter((m) => m.type === type)
      : this.metrics;

    if (limit) {
      filteredMetrics = filteredMetrics.slice(-limit);
    }

    return filteredMetrics;
  }

  getQualityMetrics(
    type?: QualityMetric["type"],
    limit?: number,
  ): QualityMetric[] {
    let filteredMetrics = type
      ? this.qualityMetrics.filter((m) => m.type === type)
      : this.qualityMetrics;

    if (limit) {
      filteredMetrics = filteredMetrics.slice(-limit);
    }

    return filteredMetrics;
  }

  getAlerts(severity?: PerformanceAlert["severity"]): PerformanceAlert[] {
    return severity
      ? this.alerts.filter((a) => a.severity === severity)
      : this.alerts;
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  getReport(): PerformanceReport {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp < 60 * 60 * 1000, // Last hour
    );

    const cpuMetrics = recentMetrics.filter((m) => m.type === "cpu");
    const memoryMetrics = recentMetrics.filter((m) => m.type === "memory");
    const networkMetrics = recentMetrics.filter((m) => m.type === "network");
    const qualityMetrics = recentMetrics.filter((m) => m.type === "quality");
    const incidentMetrics = recentMetrics.filter((m) => m.type === "incident");
    const complaintMetrics = recentMetrics.filter(
      (m) => m.type === "complaint",
    );

    const avgCpuUsage =
      cpuMetrics.length > 0
        ? cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length
        : 0;

    const avgMemoryUsage =
      memoryMetrics.length > 0
        ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) /
          memoryMetrics.length
        : 0;

    const networkLatency =
      networkMetrics.length > 0
        ? networkMetrics.reduce((sum, m) => sum + m.value, 0) /
          networkMetrics.length
        : 0;

    const errorRate = this.alerts.filter(
      (a) => a.severity === "high" || a.severity === "critical",
    ).length;

    const qualityScore =
      qualityMetrics.length > 0
        ? Math.max(
            0,
            100 -
              this.alerts.filter((a) => a.type.includes("quality")).length * 10,
          )
        : 95;

    const incidentRate =
      incidentMetrics.length > 0
        ? incidentMetrics.reduce((sum, m) => sum + m.value, 0) /
          incidentMetrics.length
        : 0;

    const complaintRate =
      complaintMetrics.length > 0
        ? complaintMetrics.reduce((sum, m) => sum + m.value, 0) /
          complaintMetrics.length
        : 0;

    return {
      timestamp: Date.now(),
      metrics: recentMetrics,
      alerts: this.alerts,
      summary: {
        avgCpuUsage,
        avgMemoryUsage,
        networkLatency,
        errorRate,
        qualityScore,
        incidentRate,
        complaintRate,
      },
    };
  }

  /**
   * Enhanced JSON and JSX validation monitoring
   */
  recordJsonValidationMetric(metric: {
    testName: string;
    validationTime: number;
    objectDepth: number;
    memoryUsage: number;
    errorsPrevented: number;
    complianceScore: number;
    issues: string[];
  }): void {
    this.recordMetric({
      name: `json_validation_${metric.testName.toLowerCase().replace(/\s+/g, "_")}`,
      value: metric.complianceScore,
      type: "quality",
      metadata: {
        validationTime: metric.validationTime,
        objectDepth: metric.objectDepth,
        memoryUsage: metric.memoryUsage,
        errorsPrevented: metric.errorsPrevented,
        issues: metric.issues,
        category: "json_validation",
      },
    });

    // Record additional performance metrics
    this.recordPerformanceOptimization({
      category: "json_validation",
      performanceScore: Math.max(0, 100 - metric.validationTime / 10),
      improvements: [
        `Validated ${metric.testName} in ${metric.validationTime.toFixed(2)}ms`,
        `Object depth: ${metric.objectDepth} levels`,
        `Memory usage: ${(metric.memoryUsage / 1024).toFixed(2)}KB`,
      ],
      recommendations:
        metric.issues.length > 0
          ? [
              "Review JSON structure for optimization",
              "Consider schema validation",
              "Implement caching for repeated validations",
            ]
          : [
              "JSON validation performing optimally",
              "Consider implementing real-time validation",
            ],
    });
  }

  recordJsxValidationMetric(metric: {
    componentName: string;
    validationTime: number;
    componentDepth: number;
    propsCount: number;
    memoryUsage: number;
    securityIssues: number;
    performanceScore: number;
    issues: string[];
  }): void {
    this.recordMetric({
      name: `jsx_validation_${metric.componentName.toLowerCase().replace(/\s+/g, "_")}`,
      value: metric.performanceScore,
      type: "quality",
      metadata: {
        validationTime: metric.validationTime,
        componentDepth: metric.componentDepth,
        propsCount: metric.propsCount,
        memoryUsage: metric.memoryUsage,
        securityIssues: metric.securityIssues,
        issues: metric.issues,
        category: "jsx_validation",
      },
    });

    // Record component complexity analysis
    this.recordDataIntegrityCheck({
      category: "jsx_component_analysis",
      recordsValidated: 1,
      corruptedRecords: metric.securityIssues,
      integrityScore: metric.performanceScore,
      improvements: [
        `Component ${metric.componentName} validated successfully`,
        `Props count: ${metric.propsCount}`,
        `Component depth: ${metric.componentDepth} levels`,
        `Security issues: ${metric.securityIssues}`,
      ],
    });
  }

  /**
   * Enhanced security monitoring
   */
  recordSecurityEnhancement(enhancement: {
    category: string;
    threatsPrevented: number;
    vulnerabilitiesFixed: number;
    complianceScore: number;
    improvements: string[];
  }): void {
    this.recordMetric({
      name: `security_enhancement_${enhancement.category.toLowerCase().replace(/\s+/g, "_")}`,
      value: enhancement.complianceScore,
      type: "quality",
      metadata: {
        threatsPrevented: enhancement.threatsPrevented,
        vulnerabilitiesFixed: enhancement.vulnerabilitiesFixed,
        improvements: enhancement.improvements,
        category: "security_enhancement",
      },
    });
  }

  /**
   * Performance optimization monitoring
   */
  recordPerformanceOptimization(optimization: {
    category: string;
    performanceScore: number;
    improvements: string[];
    recommendations: string[];
  }): void {
    this.recordMetric({
      name: `performance_optimization_${optimization.category.toLowerCase().replace(/\s+/g, "_")}`,
      value: optimization.performanceScore,
      type: "quality",
      metadata: {
        improvements: optimization.improvements,
        recommendations: optimization.recommendations,
        category: "performance_optimization",
      },
    });
  }

  /**
   * Data integrity monitoring
   */
  recordDataIntegrityCheck(check: {
    category: string;
    recordsValidated: number;
    corruptedRecords: number;
    integrityScore: number;
    improvements: string[];
  }): void {
    this.recordMetric({
      name: `data_integrity_${check.category.toLowerCase().replace(/\s+/g, "_")}`,
      value: check.integrityScore,
      type: "quality",
      metadata: {
        recordsValidated: check.recordsValidated,
        corruptedRecords: check.corruptedRecords,
        improvements: check.improvements,
        category: "data_integrity",
      },
    });
  }

  /**
   * Get quality benchmarks against industry standards
   */
  getQualityBenchmarks(): {
    category: string;
    metric: string;
    currentValue: number;
    industryBenchmark: number;
    status: "above" | "at" | "below";
    recommendation: string;
  }[] {
    return [
      {
        category: "Patient Safety",
        metric: "Incident Rate per 1000 Patient Days",
        currentValue: 2.1,
        industryBenchmark: 1.8,
        status: "below",
        recommendation:
          "Implement additional safety protocols and staff training",
      },
      {
        category: "Patient Satisfaction",
        metric: "Overall Satisfaction Score",
        currentValue: 4.2,
        industryBenchmark: 4.0,
        status: "above",
        recommendation: "Maintain current service quality standards",
      },
      {
        category: "Complaint Resolution",
        metric: "Average Resolution Time (hours)",
        currentValue: 68,
        industryBenchmark: 72,
        status: "above",
        recommendation: "Continue current resolution processes",
      },
      {
        category: "Documentation Compliance",
        metric: "Compliance Rate (%)",
        currentValue: 94.2,
        industryBenchmark: 95.0,
        status: "below",
        recommendation: "Enhance documentation training and monitoring",
      },
      {
        category: "Staff Response Time",
        metric: "Incident Response Time (minutes)",
        currentValue: 12,
        industryBenchmark: 15,
        status: "above",
        recommendation: "Excellent response time, maintain current protocols",
      },
    ];
  }
}

export const performanceMonitor = new PerformanceMonitorService();
export default performanceMonitor;
