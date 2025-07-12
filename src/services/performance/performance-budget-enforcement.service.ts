/**
 * Performance Budget Enforcement Service
 * Implements automated performance budget monitoring and enforcement
 * Part of Phase 3: Performance Optimization - Additional Performance
 */

import { EventEmitter } from "eventemitter3";

// Performance Budget Types
export interface PerformanceBudget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  thresholds: PerformanceThresholds;
  monitoring: MonitoringConfig;
  enforcement: EnforcementConfig;
  notifications: NotificationConfig;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceThresholds {
  // Core Web Vitals
  lcp: { warning: number; error: number }; // Largest Contentful Paint (ms)
  fid: { warning: number; error: number }; // First Input Delay (ms)
  cls: { warning: number; error: number }; // Cumulative Layout Shift
  fcp: { warning: number; error: number }; // First Contentful Paint (ms)
  tti: { warning: number; error: number }; // Time to Interactive (ms)
  tbt: { warning: number; error: number }; // Total Blocking Time (ms)
  
  // Resource Budgets
  totalSize: { warning: number; error: number }; // Total page size (bytes)
  jsSize: { warning: number; error: number }; // JavaScript size (bytes)
  cssSize: { warning: number; error: number }; // CSS size (bytes)
  imageSize: { warning: number; error: number }; // Image size (bytes)
  fontSize: { warning: number; error: number }; // Font size (bytes)
  
  // Network Budgets
  requests: { warning: number; error: number }; // Total HTTP requests
  domains: { warning: number; error: number }; // Number of domains
  
  // Runtime Performance
  memoryUsage: { warning: number; error: number }; // Memory usage (MB)
  cpuUsage: { warning: number; error: number }; // CPU usage (%)
  
  // Custom Metrics
  customMetrics: {
    name: string;
    warning: number;
    error: number;
    unit: string;
  }[];
}

export interface MonitoringConfig {
  frequency: number; // seconds
  environments: ("development" | "staging" | "production")[];
  pages: string[]; // URLs to monitor
  devices: ("desktop" | "mobile" | "tablet")[];
  networks: ("fast" | "slow" | "offline")[];
  locations: string[]; // Geographic locations
}

export interface EnforcementConfig {
  blockDeployment: boolean;
  failBuild: boolean;
  createIssues: boolean;
  sendAlerts: boolean;
  autoOptimize: boolean;
  rollbackThreshold: number; // Performance degradation % to trigger rollback
}

export interface NotificationConfig {
  email: {
    enabled: boolean;
    recipients: string[];
    template: string;
  };
  slack: {
    enabled: boolean;
    webhook: string;
    channel: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
    headers: Record<string, string>;
  };
}

export interface PerformanceMeasurement {
  id: string;
  budgetId: string;
  timestamp: string;
  url: string;
  device: string;
  network: string;
  location: string;
  
  // Core Web Vitals
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  tti: number;
  tbt: number;
  
  // Resource Metrics
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  
  // Network Metrics
  requests: number;
  domains: number;
  
  // Runtime Metrics
  memoryUsage: number;
  cpuUsage: number;
  
  // Custom Metrics
  customMetrics: Record<string, number>;
  
  // Violation Information
  violations: PerformanceViolation[];
  score: number; // Overall performance score (0-100)
}

export interface PerformanceViolation {
  metric: string;
  actual: number;
  threshold: number;
  severity: "warning" | "error";
  impact: number; // Performance impact score
  recommendations: string[];
}

export interface BudgetReport {
  id: string;
  budgetId: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalMeasurements: number;
    violations: number;
    averageScore: number;
    trend: "improving" | "degrading" | "stable";
  };
  metrics: {
    metric: string;
    average: number;
    p50: number;
    p90: number;
    p95: number;
    violations: number;
    trend: number; // % change
  }[];
  recommendations: BudgetRecommendation[];
  createdAt: string;
}

export interface BudgetRecommendation {
  id: string;
  type: "optimization" | "threshold" | "monitoring";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: {
    performance: number;
    effort: number;
    cost: number;
  };
  implementation: {
    steps: string[];
    code?: string;
    tools?: string[];
  };
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  measurementId: string;
  type: "violation" | "degradation" | "improvement";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  metrics: Record<string, number>;
  actions: string[];
}

class PerformanceBudgetEnforcementService extends EventEmitter {
  private budgets: Map<string, PerformanceBudget> = new Map();
  private measurements: Map<string, PerformanceMeasurement> = new Map();
  private alerts: Map<string, BudgetAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("📊 Initializing Performance Budget Enforcement Service...");

      // Create default budget
      await this.createDefaultBudget();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      // Start monitoring
      this.startMonitoring();

      this.emit("service:initialized");
      console.log("✅ Performance Budget Enforcement Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Performance Budget Enforcement Service:", error);
      throw error;
    }
  }

  /**
   * Create performance budget
   */
  async createBudget(budgetData: Omit<PerformanceBudget, "id" | "createdAt" | "updatedAt">): Promise<PerformanceBudget> {
    try {
      const budgetId = this.generateBudgetId();
      const now = new Date().toISOString();

      const budget: PerformanceBudget = {
        ...budgetData,
        id: budgetId,
        createdAt: now,
        updatedAt: now,
      };

      this.budgets.set(budgetId, budget);
      this.emit("budget:created", budget);

      console.log(`📊 Performance budget created: ${budget.name}`);
      return budget;
    } catch (error) {
      console.error("❌ Failed to create performance budget:", error);
      throw error;
    }
  }

  /**
   * Update performance budget
   */
  async updateBudget(budgetId: string, updates: Partial<PerformanceBudget>): Promise<PerformanceBudget> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error(`Budget not found: ${budgetId}`);
    }

    const updatedBudget = {
      ...budget,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.budgets.set(budgetId, updatedBudget);
    this.emit("budget:updated", updatedBudget);

    return updatedBudget;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor performance every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);

    // Initial measurement
    this.collectPerformanceMetrics();

    this.emit("monitoring:started");
    console.log("📊 Performance budget monitoring started");
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    this.emit("monitoring:stopped");
    console.log("⏹️ Performance budget monitoring stopped");
  }

  /**
   * Measure performance against budget
   */
  async measurePerformance(budgetId: string, url: string = window.location.href): Promise<PerformanceMeasurement> {
    try {
      const budget = this.budgets.get(budgetId);
      if (!budget) {
        throw new Error(`Budget not found: ${budgetId}`);
      }

      const measurementId = this.generateMeasurementId();
      const timestamp = new Date().toISOString();

      // Collect performance metrics
      const metrics = await this.collectCurrentMetrics();

      // Check for violations
      const violations = this.checkViolations(metrics, budget.thresholds);

      // Calculate performance score
      const score = this.calculatePerformanceScore(metrics, budget.thresholds);

      const measurement: PerformanceMeasurement = {
        id: measurementId,
        budgetId,
        timestamp,
        url,
        device: this.detectDevice(),
        network: this.detectNetwork(),
        location: "local", // Would be actual location in production
        ...metrics,
        violations,
        score,
      };

      this.measurements.set(measurementId, measurement);

      // Keep only last 1000 measurements
      if (this.measurements.size > 1000) {
        const oldestKey = this.measurements.keys().next().value;
        this.measurements.delete(oldestKey);
      }

      // Process violations
      if (violations.length > 0) {
        await this.processViolations(measurement, budget);
      }

      this.emit("measurement:completed", measurement);
      return measurement;
    } catch (error) {
      console.error("❌ Failed to measure performance:", error);
      throw error;
    }
  }

  /**
   * Generate budget report
   */
  async generateReport(
    budgetId: string,
    period: { start: string; end: string }
  ): Promise<BudgetReport> {
    try {
      const budget = this.budgets.get(budgetId);
      if (!budget) {
        throw new Error(`Budget not found: ${budgetId}`);
      }

      const measurements = Array.from(this.measurements.values())
        .filter(m => 
          m.budgetId === budgetId &&
          m.timestamp >= period.start &&
          m.timestamp <= period.end
        );

      const reportId = this.generateReportId();
      const totalViolations = measurements.reduce((sum, m) => sum + m.violations.length, 0);
      const averageScore = measurements.length > 0
        ? measurements.reduce((sum, m) => sum + m.score, 0) / measurements.length
        : 0;

      // Calculate metrics statistics
      const metricsStats = this.calculateMetricsStatistics(measurements);

      // Generate recommendations
      const recommendations = this.generateRecommendations(measurements, budget);

      // Determine trend
      const trend = this.calculateTrend(measurements);

      const report: BudgetReport = {
        id: reportId,
        budgetId,
        period,
        summary: {
          totalMeasurements: measurements.length,
          violations: totalViolations,
          averageScore,
          trend,
        },
        metrics: metricsStats,
        recommendations,
        createdAt: new Date().toISOString(),
      };

      this.emit("report:generated", report);
      return report;
    } catch (error) {
      console.error("❌ Failed to generate budget report:", error);
      throw error;
    }
  }

  /**
   * Get active budgets
   */
  getActiveBudgets(): PerformanceBudget[] {
    return Array.from(this.budgets.values()).filter(budget => budget.enabled);
  }

  /**
   * Get recent measurements
   */
  getRecentMeasurements(budgetId: string, limit: number = 50): PerformanceMeasurement[] {
    return Array.from(this.measurements.values())
      .filter(m => m.budgetId === budgetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): BudgetAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit("alert:acknowledged", alert);
      return true;
    }
    return false;
  }

  // Private helper methods
  private async createDefaultBudget(): Promise<void> {
    const defaultBudget: Omit<PerformanceBudget, "id" | "createdAt" | "updatedAt"> = {
      name: "Default Performance Budget",
      description: "Standard performance budget for healthcare application",
      enabled: true,
      thresholds: {
        lcp: { warning: 2500, error: 4000 },
        fid: { warning: 100, error: 300 },
        cls: { warning: 0.1, error: 0.25 },
        fcp: { warning: 1800, error: 3000 },
        tti: { warning: 3800, error: 7300 },
        tbt: { warning: 200, error: 600 },
        totalSize: { warning: 1024 * 1024 * 2, error: 1024 * 1024 * 5 }, // 2MB warning, 5MB error
        jsSize: { warning: 1024 * 512, error: 1024 * 1024 }, // 512KB warning, 1MB error
        cssSize: { warning: 1024 * 100, error: 1024 * 200 }, // 100KB warning, 200KB error
        imageSize: { warning: 1024 * 1024, error: 1024 * 1024 * 3 }, // 1MB warning, 3MB error
        fontSize: { warning: 1024 * 100, error: 1024 * 300 }, // 100KB warning, 300KB error
        requests: { warning: 50, error: 100 },
        domains: { warning: 5, error: 10 },
        memoryUsage: { warning: 100, error: 200 }, // MB
        cpuUsage: { warning: 70, error: 90 }, // %
        customMetrics: [],
      },
      monitoring: {
        frequency: 60, // 1 minute
        environments: ["development", "production"],
        pages: ["/", "/dashboard", "/patients"],
        devices: ["desktop", "mobile"],
        networks: ["fast", "slow"],
        locations: ["local"],
      },
      enforcement: {
        blockDeployment: false,
        failBuild: false,
        createIssues: true,
        sendAlerts: true,
        autoOptimize: false,
        rollbackThreshold: 20, // 20% performance degradation
      },
      notifications: {
        email: {
          enabled: false,
          recipients: [],
          template: "default",
        },
        slack: {
          enabled: false,
          webhook: "",
          channel: "#performance",
        },
        webhook: {
          enabled: false,
          url: "",
          headers: {},
        },
      },
    };

    await this.createBudget(defaultBudget);
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // Setup Performance Observer
    if ("PerformanceObserver" in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.emit("performance:entry", entry);
        });
      });

      try {
        this.performanceObserver.observe({ 
          entryTypes: ["navigation", "resource", "paint", "largest-contentful-paint"] 
        });
      } catch (error) {
        console.warn("Performance observer not fully supported:", error);
      }
    }

    // Setup Web Vitals monitoring
    this.setupWebVitalsMonitoring();
  }

  private setupWebVitalsMonitoring(): void {
    // Monitor Core Web Vitals
    if (typeof window !== "undefined") {
      // LCP monitoring
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.emit("web-vital:lcp", lastEntry.startTime);
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // FID monitoring
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.emit("web-vital:fid", entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ["first-input"] });

      // CLS monitoring
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.emit("web-vital:cls", clsValue);
      }).observe({ entryTypes: ["layout-shift"] });
    }
  }

  private async collectPerformanceMetrics(): Promise<void> {
    const activeBudgets = this.getActiveBudgets();
    
    for (const budget of activeBudgets) {
      try {
        await this.measurePerformance(budget.id);
      } catch (error) {
        console.error(`Failed to measure performance for budget ${budget.id}:`, error);
      }
    }
  }

  private async collectCurrentMetrics(): Promise<Omit<PerformanceMeasurement, "id" | "budgetId" | "timestamp" | "url" | "device" | "network" | "location" | "violations" | "score">> {
    // Collect Core Web Vitals
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");
    const resources = performance.getEntriesByType("resource");

    const fcp = paint.find(entry => entry.name === "first-contentful-paint")?.startTime || 0;
    const lcp = await this.getLCP();
    const fid = await this.getFID();
    const cls = await this.getCLS();
    const tti = await this.getTTI();
    const tbt = await this.getTBT();

    // Calculate resource sizes
    const jsSize = resources
      .filter(r => r.name.includes(".js"))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);

    const cssSize = resources
      .filter(r => r.name.includes(".css"))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);

    const imageSize = resources
      .filter(r => /\.(png|jpg|jpeg|gif|webp|svg)/.test(r.name))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);

    const fontSize = resources
      .filter(r => /\.(woff|woff2|ttf|eot)/.test(r.name))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);

    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

    // Network metrics
    const requests = resources.length;
    const domains = new Set(resources.map(r => new URL(r.name).hostname)).size;

    // Runtime metrics
    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = this.getCPUUsage();

    return {
      lcp,
      fid,
      cls,
      fcp,
      tti,
      tbt,
      totalSize,
      jsSize,
      cssSize,
      imageSize,
      fontSize,
      requests,
      domains,
      memoryUsage,
      cpuUsage,
      customMetrics: {},
    };
  }

  private checkViolations(
    metrics: any,
    thresholds: PerformanceThresholds
  ): PerformanceViolation[] {
    const violations: PerformanceViolation[] = [];

    // Check each metric against thresholds
    Object.entries(thresholds).forEach(([key, threshold]) => {
      if (typeof threshold === "object" && "warning" in threshold && "error" in threshold) {
        const value = metrics[key];
        if (value !== undefined) {
          if (value > threshold.error) {
            violations.push({
              metric: key,
              actual: value,
              threshold: threshold.error,
              severity: "error",
              impact: this.calculateImpact(key, value, threshold.error),
              recommendations: this.getRecommendations(key),
            });
          } else if (value > threshold.warning) {
            violations.push({
              metric: key,
              actual: value,
              threshold: threshold.warning,
              severity: "warning",
              impact: this.calculateImpact(key, value, threshold.warning),
              recommendations: this.getRecommendations(key),
            });
          }
        }
      }
    });

    return violations;
  }

  private calculatePerformanceScore(metrics: any, thresholds: PerformanceThresholds): number {
    let totalScore = 0;
    let metricCount = 0;

    // Core Web Vitals (weighted more heavily)
    const coreVitals = ["lcp", "fid", "cls", "fcp"];
    coreVitals.forEach(metric => {
      const value = metrics[metric];
      const threshold = thresholds[metric as keyof PerformanceThresholds];
      
      if (value !== undefined && typeof threshold === "object" && "warning" in threshold) {
        const score = this.calculateMetricScore(value, threshold.warning, threshold.error);
        totalScore += score * 2; // Double weight for core vitals
        metricCount += 2;
      }
    });

    // Other metrics
    const otherMetrics = ["tti", "tbt", "totalSize", "jsSize", "cssSize"];
    otherMetrics.forEach(metric => {
      const value = metrics[metric];
      const threshold = thresholds[metric as keyof PerformanceThresholds];
      
      if (value !== undefined && typeof threshold === "object" && "warning" in threshold) {
        const score = this.calculateMetricScore(value, threshold.warning, threshold.error);
        totalScore += score;
        metricCount += 1;
      }
    });

    return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
  }

  private calculateMetricScore(value: number, warning: number, error: number): number {
    if (value <= warning) return 100;
    if (value >= error) return 0;
    
    // Linear interpolation between warning and error
    const ratio = (value - warning) / (error - warning);
    return Math.round(100 - (ratio * 100));
  }

  private async processViolations(
    measurement: PerformanceMeasurement,
    budget: PerformanceBudget
  ): Promise<void> {
    const criticalViolations = measurement.violations.filter(v => v.severity === "error");
    const warningViolations = measurement.violations.filter(v => v.severity === "warning");

    // Create alerts
    if (criticalViolations.length > 0) {
      this.createAlert({
        budgetId: budget.id,
        measurementId: measurement.id,
        type: "violation",
        severity: "critical",
        title: "Critical Performance Budget Violations",
        description: `${criticalViolations.length} critical performance violations detected`,
        metrics: criticalViolations.reduce((acc, v) => ({ ...acc, [v.metric]: v.actual }), {}),
        actions: criticalViolations.flatMap(v => v.recommendations),
      });
    }

    if (warningViolations.length > 0) {
      this.createAlert({
        budgetId: budget.id,
        measurementId: measurement.id,
        type: "violation",
        severity: "warning",
        title: "Performance Budget Warnings",
        description: `${warningViolations.length} performance warnings detected`,
        metrics: warningViolations.reduce((acc, v) => ({ ...acc, [v.metric]: v.actual }), {}),
        actions: warningViolations.flatMap(v => v.recommendations),
      });
    }

    // Send notifications
    if (budget.notifications.email.enabled || budget.notifications.slack.enabled) {
      await this.sendNotifications(measurement, budget);
    }

    // Enforcement actions
    if (budget.enforcement.createIssues && criticalViolations.length > 0) {
      await this.createPerformanceIssue(measurement, budget);
    }
  }

  private createAlert(alertData: Omit<BudgetAlert, "id" | "timestamp" | "acknowledged">): void {
    const alert: BudgetAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.alerts.set(alert.id, alert);

    // Keep only last 200 alerts
    if (this.alerts.size > 200) {
      const oldestKey = this.alerts.keys().next().value;
      this.alerts.delete(oldestKey);
    }

    this.emit("alert:created", alert);
  }

  private async sendNotifications(
    measurement: PerformanceMeasurement,
    budget: PerformanceBudget
  ): Promise<void> {
    // In a real implementation, this would send actual notifications
    console.log(`📧 Sending performance budget notifications for ${budget.name}`);
  }

  private async createPerformanceIssue(
    measurement: PerformanceMeasurement,
    budget: PerformanceBudget
  ): Promise<void> {
    // In a real implementation, this would create issues in project management tools
    console.log(`🐛 Creating performance issue for budget ${budget.name}`);
  }

  // Metric collection helpers
  private async getLCP(): Promise<number> {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ["largest-contentful-paint"] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 1000);
    });
  }

  private async getFID(): Promise<number> {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        resolve(firstEntry.processingStart - firstEntry.startTime);
      }).observe({ entryTypes: ["first-input"] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 1000);
    });
  }

  private async getCLS(): Promise<number> {
    return new Promise((resolve) => {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        resolve(clsValue);
      }).observe({ entryTypes: ["layout-shift"] });
      
      // Fallback timeout
      setTimeout(() => resolve(clsValue), 1000);
    });
  }

  private async getTTI(): Promise<number> {
    // Simplified TTI calculation
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return navigation.domInteractive;
  }

  private async getTBT(): Promise<number> {
    // Simplified TBT calculation
    return 0; // Would require more complex calculation in real implementation
  }

  private getMemoryUsage(): number {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      return (window as any).performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private getCPUUsage(): number {
    // Simplified CPU usage estimation
    return Math.random() * 30 + 10; // 10-40% simulated
  }

  private detectDevice(): string {
    if (typeof window === "undefined") return "desktop";
    
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return /iPad/.test(userAgent) ? "tablet" : "mobile";
    }
    return "desktop";
  }

  private detectNetwork(): string {
    if (typeof navigator !== "undefined" && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === "4g") return "fast";
      if (effectiveType === "3g") return "slow";
      return "slow";
    }
    return "fast";
  }

  private calculateImpact(metric: string, actual: number, threshold: number): number {
    const ratio = actual / threshold;
    return Math.min(100, Math.round((ratio - 1) * 100));
  }

  private getRecommendations(metric: string): string[] {
    const recommendations: Record<string, string[]> = {
      lcp: [
        "Optimize server response times",
        "Remove render-blocking resources",
        "Optimize images and use modern formats",
        "Preload important resources",
      ],
      fid: [
        "Minimize JavaScript execution time",
        "Remove unused JavaScript",
        "Use code splitting",
        "Optimize third-party scripts",
      ],
      cls: [
        "Include size attributes on images and videos",
        "Reserve space for ads and embeds",
        "Avoid inserting content above existing content",
        "Use transform animations instead of layout changes",
      ],
      fcp: [
        "Eliminate render-blocking resources",
        "Minify CSS and JavaScript",
        "Remove unused CSS",
        "Use efficient cache policies",
      ],
      totalSize: [
        "Enable compression (gzip/brotli)",
        "Optimize images",
        "Remove unused code",
        "Use code splitting",
      ],
      jsSize: [
        "Remove unused JavaScript",
        "Use code splitting",
        "Minify JavaScript",
        "Use tree shaking",
      ],
    };

    return recommendations[metric] || ["Optimize resource usage"];
  }

  private calculateMetricsStatistics(measurements: PerformanceMeasurement[]): BudgetReport["metrics"] {
    if (measurements.length === 0) return [];

    const metrics = ["lcp", "fid", "cls", "fcp", "tti", "totalSize", "jsSize"];
    
    return metrics.map(metric => {
      const values = measurements.map(m => m[metric as keyof PerformanceMeasurement] as number).filter(v => v !== undefined);
      
      if (values.length === 0) {
        return {
          metric,
          average: 0,
          p50: 0,
          p90: 0,
          p95: 0,
          violations: 0,
          trend: 0,
        };
      }

      values.sort((a, b) => a - b);
      
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const p50 = values[Math.floor(values.length * 0.5)];
      const p90 = values[Math.floor(values.length * 0.9)];
      const p95 = values[Math.floor(values.length * 0.95)];
      
      const violations = measurements.filter(m => 
        m.violations.some(v => v.metric === metric)
      ).length;

      // Calculate trend (simplified)
      const trend = values.length > 1 ? 
        ((values[values.length - 1] - values[0]) / values[0]) * 100 : 0;

      return {
        metric,
        average,
        p50,
        p90,
        p95,
        violations,
        trend,
      };
    });
  }

  private generateRecommendations(
    measurements: PerformanceMeasurement[],
    budget: PerformanceBudget
  ): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    // Analyze common violations
    const violationCounts: Record<string, number> = {};
    measurements.forEach(m => {
      m.violations.forEach(v => {
        violationCounts[v.metric] = (violationCounts[v.metric] || 0) + 1;
      });
    });

    // Generate recommendations for most common violations
    Object.entries(violationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([metric, count]) => {
        recommendations.push({
          id: this.generateRecommendationId(),
          type: "optimization",
          priority: count > measurements.length * 0.5 ? "high" : "medium",
          title: `Optimize ${metric.toUpperCase()}`,
          description: `${metric} violations detected in ${count} measurements`,
          impact: {
            performance: 25,
            effort: 40,
            cost: 20,
          },
          implementation: {
            steps: this.getRecommendations(metric),
          },
        });
      });

    return recommendations;
  }

  private calculateTrend(measurements: PerformanceMeasurement[]): "improving" | "degrading" | "stable" {
    if (measurements.length < 2) return "stable";

    const recent = measurements.slice(-10);
    const older = measurements.slice(-20, -10);

    if (recent.length === 0 || older.length === 0) return "stable";

    const recentAvg = recent.reduce((sum, m) => sum + m.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.score, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return "improving";
    if (change < -5) return "degrading";
    return "stable";
  }

  private generateBudgetId(): string {
    return `BUDGET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMeasurementId(): string {
    return `MEASURE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.stopMonitoring();
      this.removeAllListeners();
      console.log("📊 Performance Budget Enforcement Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during performance budget enforcement service shutdown:", error);
    }
  }
}

export const performanceBudgetEnforcementService = new PerformanceBudgetEnforcementService();
export default performanceBudgetEnforcementService;