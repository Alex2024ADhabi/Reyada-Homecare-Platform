#!/usr/bin/env tsx
/**
 * Framework Health Monitor
 * Continuous health monitoring and alerting system for the healthcare testing framework
 * Provides real-time health status, alerts, and automated recovery suggestions
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

// Import framework components
import { testExecutionMonitor } from "./test-execution-monitor";
import { globalTestReporter } from "./test-reporting";
import { frameworkSetup } from "./framework-setup";
import IntegrationValidator from "./integration-validator";
import { errorRecoverySystem } from "./error-recovery-system";

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: {
    warning: number;
    critical: number;
  };
  trend: "improving" | "stable" | "degrading";
  lastUpdated: string;
}

interface ComponentHealth {
  name: string;
  status: "healthy" | "degraded" | "failed" | "unknown";
  metrics: HealthMetric[];
  issues: string[];
  lastCheck: string;
  uptime: number;
  responseTime: number;
}

interface SystemHealth {
  overall: "healthy" | "degraded" | "critical" | "failed";
  score: number; // 0-100
  components: ComponentHealth[];
  alerts: HealthAlert[];
  recommendations: string[];
  lastFullCheck: string;
  monitoringDuration: number;
}

interface HealthAlert {
  id: string;
  severity: "info" | "warning" | "error" | "critical";
  component: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  autoResolved: boolean;
  resolutionActions: string[];
}

interface MonitorConfig {
  checkInterval: number;
  alertThresholds: {
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
    diskSpace: number;
  };
  enableAutoRecovery: boolean;
  enableNotifications: boolean;
  retentionPeriod: number;
  outputDirectory: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

class FrameworkHealthMonitor extends EventEmitter {
  private static instance: FrameworkHealthMonitor;
  private config: MonitorConfig;
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private healthHistory: SystemHealth[] = [];
  private activeAlerts: Map<string, HealthAlert> = new Map();
  private startTime: number = 0;
  private logFile: string;

  private constructor() {
    super();
    this.config = this.loadDefaultConfig();
    this.logFile = path.join(this.config.outputDirectory, "health-monitor.log");
    this.ensureLogDirectory();
  }

  static getInstance(): FrameworkHealthMonitor {
    if (!FrameworkHealthMonitor.instance) {
      FrameworkHealthMonitor.instance = new FrameworkHealthMonitor();
    }
    return FrameworkHealthMonitor.instance;
  }

  startMonitoring(config?: Partial<MonitorConfig>): void {
    if (this.isMonitoring) {
      console.warn("⚠️  Health monitoring is already active");
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.healthHistory = [];
    this.activeAlerts.clear();

    console.log("🏥 Framework Health Monitor started");
    console.log(`   Check interval: ${this.config.checkInterval}ms`);
    console.log(`   Auto recovery: ${this.config.enableAutoRecovery}`);
    console.log(`   Notifications: ${this.config.enableNotifications}`);

    // Start periodic health checks
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    // Perform initial health check
    this.performHealthCheck();

    this.emit("monitoring-started", {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  stopMonitoring(): SystemHealth | null {
    if (!this.isMonitoring) {
      console.warn("⚠️  Health monitoring is not active");
      return null;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    const finalHealth = this.getCurrentHealth();
    const monitoringDuration = performance.now() - this.startTime;

    console.log("🏥 Framework Health Monitor stopped");
    console.log(
      `   Monitoring duration: ${(monitoringDuration / 1000).toFixed(2)}s`,
    );
    console.log(`   Final health score: ${finalHealth.score}/100`);
    console.log(`   Active alerts: ${this.activeAlerts.size}`);

    this.emit("monitoring-stopped", {
      timestamp: Date.now(),
      finalHealth,
      duration: monitoringDuration,
    });

    return finalHealth;
  }

  async performHealthCheck(): Promise<SystemHealth> {
    const startTime = performance.now();

    try {
      // Check all framework components
      const components = await Promise.all([
        this.checkMonitorHealth(),
        this.checkReporterHealth(),
        this.checkValidatorHealth(),
        this.checkRecoverySystemHealth(),
        this.checkSystemResourcesHealth(),
        this.checkFileSystemHealth(),
      ]);

      // Calculate overall health
      const systemHealth = this.calculateSystemHealth(components);
      systemHealth.monitoringDuration = performance.now() - this.startTime;
      systemHealth.lastFullCheck = new Date().toISOString();

      // Process alerts
      this.processHealthAlerts(systemHealth);

      // Store in history
      this.healthHistory.push(systemHealth);
      this.trimHealthHistory();

      // Log health status
      await this.logHealthStatus(systemHealth);

      // Emit health update
      this.emit("health-update", systemHealth);

      // Auto-recovery if enabled and needed
      if (
        this.config.enableAutoRecovery &&
        systemHealth.overall === "critical"
      ) {
        await this.attemptAutoRecovery(systemHealth);
      }

      return systemHealth;
    } catch (error) {
      const errorHealth: SystemHealth = {
        overall: "failed",
        score: 0,
        components: [],
        alerts: [
          {
            id: `health-check-error-${Date.now()}`,
            severity: "critical",
            component: "health-monitor",
            message: `Health check failed: ${error}`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            autoResolved: false,
            resolutionActions: [
              "Restart health monitoring",
              "Check system resources",
            ],
          },
        ],
        recommendations: [
          "Investigate health check failure",
          "Restart framework components",
        ],
        lastFullCheck: new Date().toISOString(),
        monitoringDuration: performance.now() - this.startTime,
      };

      this.emit("health-check-error", { error, timestamp: Date.now() });
      return errorHealth;
    }
  }

  getCurrentHealth(): SystemHealth {
    return this.healthHistory.length > 0
      ? { ...this.healthHistory[this.healthHistory.length - 1] }
      : this.createEmptyHealth();
  }

  getHealthHistory(limit?: number): SystemHealth[] {
    const history = [...this.healthHistory];
    return limit ? history.slice(-limit) : history;
  }

  getActiveAlerts(): HealthAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit("alert-acknowledged", { alertId, timestamp: Date.now() });
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      this.activeAlerts.delete(alertId);
      this.emit("alert-resolved", { alertId, timestamp: Date.now() });
      return true;
    }
    return false;
  }

  // Component health check methods
  private async checkMonitorHealth(): Promise<ComponentHealth> {
    const startTime = performance.now();
    const component: ComponentHealth = {
      name: "Test Execution Monitor",
      status: "unknown",
      metrics: [],
      issues: [],
      lastCheck: new Date().toISOString(),
      uptime: 0,
      responseTime: 0,
    };

    try {
      // Check if monitor is available
      if (!testExecutionMonitor) {
        component.status = "failed";
        component.issues.push("Monitor instance not available");
        return component;
      }

      // Test basic functionality
      const sessionId = testExecutionMonitor.startMonitoring({
        reportInterval: 10000,
      });
      const isActive = testExecutionMonitor.isActive();
      const metrics = testExecutionMonitor.getCurrentMetrics();
      testExecutionMonitor.stopMonitoring();

      component.responseTime = performance.now() - startTime;
      component.status = sessionId && isActive ? "healthy" : "degraded";

      // Add metrics
      component.metrics.push({
        name: "Response Time",
        value: component.responseTime,
        unit: "ms",
        status:
          component.responseTime < 100
            ? "healthy"
            : component.responseTime < 500
              ? "warning"
              : "critical",
        threshold: { warning: 100, critical: 500 },
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      });

      if (!sessionId) {
        component.issues.push("Failed to start monitoring session");
      }
      if (!isActive) {
        component.issues.push("Monitor not active after start");
      }
    } catch (error) {
      component.status = "failed";
      component.issues.push(`Monitor check failed: ${error}`);
      component.responseTime = performance.now() - startTime;
    }

    return component;
  }

  private async checkReporterHealth(): Promise<ComponentHealth> {
    const startTime = performance.now();
    const component: ComponentHealth = {
      name: "Test Reporter",
      status: "unknown",
      metrics: [],
      issues: [],
      lastCheck: new Date().toISOString(),
      uptime: 0,
      responseTime: 0,
    };

    try {
      if (!globalTestReporter) {
        component.status = "failed";
        component.issues.push("Reporter instance not available");
        return component;
      }

      const sessionId = globalTestReporter.startReporting({
        formats: ["json"],
      });
      const isActive = globalTestReporter.isActive();
      globalTestReporter.stopReporting();

      component.responseTime = performance.now() - startTime;
      component.status = sessionId && isActive ? "healthy" : "degraded";

      component.metrics.push({
        name: "Response Time",
        value: component.responseTime,
        unit: "ms",
        status:
          component.responseTime < 100
            ? "healthy"
            : component.responseTime < 500
              ? "warning"
              : "critical",
        threshold: { warning: 100, critical: 500 },
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      });

      if (!sessionId) {
        component.issues.push("Failed to start reporting session");
      }
    } catch (error) {
      component.status = "failed";
      component.issues.push(`Reporter check failed: ${error}`);
      component.responseTime = performance.now() - startTime;
    }

    return component;
  }

  private async checkValidatorHealth(): Promise<ComponentHealth> {
    const startTime = performance.now();
    const component: ComponentHealth = {
      name: "Integration Validator",
      status: "unknown",
      metrics: [],
      issues: [],
      lastCheck: new Date().toISOString(),
      uptime: 0,
      responseTime: 0,
    };

    try {
      const validator = new IntegrationValidator({ timeoutMs: 5000 });
      const healthCheck = await validator.quickHealthCheck();

      component.responseTime = performance.now() - startTime;
      component.status = healthCheck ? "healthy" : "degraded";

      component.metrics.push({
        name: "Response Time",
        value: component.responseTime,
        unit: "ms",
        status:
          component.responseTime < 200
            ? "healthy"
            : component.responseTime < 1000
              ? "warning"
              : "critical",
        threshold: { warning: 200, critical: 1000 },
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      });

      if (!healthCheck) {
        component.issues.push("Validator health check failed");
      }
    } catch (error) {
      component.status = "failed";
      component.issues.push(`Validator check failed: ${error}`);
      component.responseTime = performance.now() - startTime;
    }

    return component;
  }

  private async checkRecoverySystemHealth(): Promise<ComponentHealth> {
    const startTime = performance.now();
    const component: ComponentHealth = {
      name: "Error Recovery System",
      status: "unknown",
      metrics: [],
      issues: [],
      lastCheck: new Date().toISOString(),
      uptime: 0,
      responseTime: 0,
    };

    try {
      if (!errorRecoverySystem) {
        component.status = "failed";
        component.issues.push("Recovery system not available");
        return component;
      }

      const systemHealth = errorRecoverySystem.getSystemHealth();
      component.responseTime = performance.now() - startTime;

      switch (systemHealth.overall) {
        case "healthy":
          component.status = "healthy";
          break;
        case "degraded":
          component.status = "degraded";
          break;
        default:
          component.status = "failed";
      }

      component.metrics.push({
        name: "Recovery Attempts",
        value: systemHealth.recoveryAttempts,
        unit: "count",
        status:
          systemHealth.recoveryAttempts < 3
            ? "healthy"
            : systemHealth.recoveryAttempts < 10
              ? "warning"
              : "critical",
        threshold: { warning: 3, critical: 10 },
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      });

      if (systemHealth.issues.length > 0) {
        component.issues.push(...systemHealth.issues);
      }
    } catch (error) {
      component.status = "failed";
      component.issues.push(`Recovery system check failed: ${error}`);
      component.responseTime = performance.now() - startTime;
    }

    return component;
  }

  private async checkSystemResourcesHealth(): Promise<ComponentHealth> {
    const startTime = performance.now();
    const component: ComponentHealth = {
      name: "System Resources",
      status: "healthy",
      metrics: [],
      issues: [],
      lastCheck: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: 0,
    };

    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      const memoryTotalMB = memoryUsage.heapTotal / 1024 / 1024;
      const memoryUsagePercent = (memoryUsedMB / memoryTotalMB) * 100;

      component.responseTime = performance.now() - startTime;

      // Memory usage metric
      component.metrics.push({
        name: "Memory Usage",
        value: memoryUsagePercent,
        unit: "%",
        status:
          memoryUsagePercent < 70
            ? "healthy"
            : memoryUsagePercent < 90
              ? "warning"
              : "critical",
        threshold: { warning: 70, critical: 90 },
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      });

      // Uptime metric
      component.metrics.push({
        name: "Uptime",
        value: component.uptime,
        unit: "seconds",
        status: "healthy",
        threshold: { warning: 0, critical: 0 },
        trend: "improving",
        lastUpdated: new Date().toISOString(),
      });

      // Check thresholds
      if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
        component.status = "warning";
        component.issues.push(
          `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        );
      }
    } catch (error) {
      component.status = "failed";
      component.issues.push(`System resources check failed: ${error}`);
      component.responseTime = performance.now() - startTime;
    }

    return component;
  }

  private async checkFileSystemHealth(): Promise<ComponentHealth> {
    const startTime = performance.now();
    const component: ComponentHealth = {
      name: "File System",
      status: "unknown",
      metrics: [],
      issues: [],
      lastCheck: new Date().toISOString(),
      uptime: 0,
      responseTime: 0,
    };

    try {
      // Test file operations
      const testDir = path.join(this.config.outputDirectory, "health-test");
      const testFile = path.join(testDir, "test.json");

      // Create directory if it doesn't exist
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Write test file
      const testData = { timestamp: new Date().toISOString(), test: true };
      fs.writeFileSync(testFile, JSON.stringify(testData));

      // Read test file
      const readData = JSON.parse(fs.readFileSync(testFile, "utf8"));

      // Delete test file
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);

      component.responseTime = performance.now() - startTime;
      component.status = readData.test === true ? "healthy" : "degraded";

      component.metrics.push({
        name: "File Operation Time",
        value: component.responseTime,
        unit: "ms",
        status:
          component.responseTime < 50
            ? "healthy"
            : component.responseTime < 200
              ? "warning"
              : "critical",
        threshold: { warning: 50, critical: 200 },
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      });

      if (readData.test !== true) {
        component.issues.push("File read/write verification failed");
      }
    } catch (error) {
      component.status = "failed";
      component.issues.push(`File system check failed: ${error}`);
      component.responseTime = performance.now() - startTime;
    }

    return component;
  }

  private calculateSystemHealth(components: ComponentHealth[]): SystemHealth {
    const healthyCount = components.filter(
      (c) => c.status === "healthy",
    ).length;
    const degradedCount = components.filter(
      (c) => c.status === "degraded",
    ).length;
    const failedCount = components.filter((c) => c.status === "failed").length;

    // Calculate health score (0-100)
    const totalComponents = components.length;
    const score =
      totalComponents > 0
        ? Math.round(
            (healthyCount * 100 + degradedCount * 50) / totalComponents,
          )
        : 0;

    // Determine overall status
    let overall: "healthy" | "degraded" | "critical" | "failed";
    if (failedCount > 0) {
      overall = failedCount >= totalComponents / 2 ? "failed" : "critical";
    } else if (degradedCount > 0) {
      overall = "degraded";
    } else {
      overall = "healthy";
    }

    // Collect all issues and recommendations
    const allIssues = components.flatMap((c) => c.issues);
    const recommendations = this.generateRecommendations(components, overall);

    return {
      overall,
      score,
      components,
      alerts: Array.from(this.activeAlerts.values()),
      recommendations,
      lastFullCheck: new Date().toISOString(),
      monitoringDuration: 0, // Will be set by caller
    };
  }

  private generateRecommendations(
    components: ComponentHealth[],
    overall: string,
  ): string[] {
    const recommendations: string[] = [];

    if (overall === "failed" || overall === "critical") {
      recommendations.push(
        "Immediate attention required - system is in critical state",
      );
      recommendations.push(
        "Run framework repair to attempt automatic recovery",
      );
    }

    if (overall === "degraded") {
      recommendations.push(
        "Monitor system closely - performance may be impacted",
      );
    }

    // Component-specific recommendations
    components.forEach((component) => {
      if (component.status === "failed") {
        recommendations.push(`Restart ${component.name} component`);
      }
      if (component.issues.length > 0) {
        recommendations.push(
          `Address issues in ${component.name}: ${component.issues.join(", ")}`,
        );
      }
    });

    // Resource-specific recommendations
    const resourceComponent = components.find(
      (c) => c.name === "System Resources",
    );
    if (resourceComponent) {
      const memoryMetric = resourceComponent.metrics.find(
        (m) => m.name === "Memory Usage",
      );
      if (memoryMetric && memoryMetric.status === "critical") {
        recommendations.push(
          "Consider increasing available memory or optimizing memory usage",
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("System is healthy - continue regular monitoring");
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private processHealthAlerts(systemHealth: SystemHealth): void {
    // Generate alerts based on system health
    if (
      systemHealth.overall === "critical" ||
      systemHealth.overall === "failed"
    ) {
      const alertId = `system-critical-${Date.now()}`;
      if (!this.activeAlerts.has(alertId)) {
        const alert: HealthAlert = {
          id: alertId,
          severity: "critical",
          component: "system",
          message: `System health is ${systemHealth.overall} (score: ${systemHealth.score}/100)`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          autoResolved: false,
          resolutionActions: systemHealth.recommendations.slice(0, 3),
        };
        this.activeAlerts.set(alertId, alert);
        this.emit("alert-created", alert);
      }
    }

    // Component-specific alerts
    systemHealth.components.forEach((component) => {
      if (component.status === "failed") {
        const alertId = `component-failed-${component.name}-${Date.now()}`;
        if (!this.activeAlerts.has(alertId)) {
          const alert: HealthAlert = {
            id: alertId,
            severity: "error",
            component: component.name,
            message: `Component ${component.name} has failed`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            autoResolved: false,
            resolutionActions: [
              `Restart ${component.name}`,
              "Check component logs",
              "Run diagnostics",
            ],
          };
          this.activeAlerts.set(alertId, alert);
          this.emit("alert-created", alert);
        }
      }
    });

    // Auto-resolve alerts if conditions improve
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.component === "system" && systemHealth.overall === "healthy") {
        alert.autoResolved = true;
        this.activeAlerts.delete(alertId);
        this.emit("alert-auto-resolved", alert);
      }
    }
  }

  private async attemptAutoRecovery(systemHealth: SystemHealth): Promise<void> {
    console.log("🔧 Attempting automatic recovery...");

    try {
      const healResult = await errorRecoverySystem.healSystem();

      if (healResult) {
        console.log("✅ Automatic recovery successful");
        this.emit("auto-recovery-success", { timestamp: Date.now() });
      } else {
        console.log("❌ Automatic recovery failed");
        this.emit("auto-recovery-failed", { timestamp: Date.now() });
      }
    } catch (error) {
      console.error(`❌ Auto-recovery error: ${error}`);
      this.emit("auto-recovery-error", { error, timestamp: Date.now() });
    }
  }

  private trimHealthHistory(): void {
    const maxHistory = Math.floor(
      this.config.retentionPeriod / this.config.checkInterval,
    );
    if (this.healthHistory.length > maxHistory) {
      this.healthHistory = this.healthHistory.slice(-maxHistory);
    }
  }

  private async logHealthStatus(systemHealth: SystemHealth): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level:
          systemHealth.overall === "healthy"
            ? "info"
            : systemHealth.overall === "degraded"
              ? "warn"
              : "error",
        message: "Health check completed",
        health: {
          overall: systemHealth.overall,
          score: systemHealth.score,
          componentCount: systemHealth.components.length,
          alertCount: systemHealth.alerts.length,
          issues: systemHealth.components.flatMap((c) => c.issues),
        },
      };

      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n");
    } catch (error) {
      console.warn(`Failed to log health status: ${error}`);
    }
  }

  private createEmptyHealth(): SystemHealth {
    return {
      overall: "unknown",
      score: 0,
      components: [],
      alerts: [],
      recommendations: [],
      lastFullCheck: "",
      monitoringDuration: 0,
    };
  }

  private loadDefaultConfig(): MonitorConfig {
    return {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        memoryUsage: 80, // 80%
        responseTime: 1000, // 1 second
        errorRate: 10, // 10%
        diskSpace: 90, // 90%
      },
      enableAutoRecovery: true,
      enableNotifications: true,
      retentionPeriod: 3600000, // 1 hour
      outputDirectory: "test-results",
      logLevel: "info",
    };
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  isActive(): boolean {
    return this.isMonitoring;
  }

  // Cleanup
  destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const frameworkHealthMonitor = FrameworkHealthMonitor.getInstance();
export default frameworkHealthMonitor;

// Export types
export {
  FrameworkHealthMonitor,
  type HealthMetric,
  type ComponentHealth,
  type SystemHealth,
  type HealthAlert,
  type MonitorConfig,
};

// CLI execution
if (require.main === module) {
  console.log("🏥 Framework Health Monitor - Test Mode");

  const monitor = frameworkHealthMonitor;

  monitor.startMonitoring({
    checkInterval: 10000, // 10 seconds for demo
    enableAutoRecovery: true,
  });

  // Stop monitoring after 60 seconds
  setTimeout(() => {
    const finalHealth = monitor.stopMonitoring();

    if (finalHealth) {
      console.log("\n🎯 Final Health Report:");
      console.log(`Overall Status: ${finalHealth.overall.toUpperCase()}`);
      console.log(`Health Score: ${finalHealth.score}/100`);
      console.log(`Components: ${finalHealth.components.length}`);
      console.log(`Active Alerts: ${finalHealth.alerts.length}`);

      if (finalHealth.recommendations.length > 0) {
        console.log("\n💡 Recommendations:");
        finalHealth.recommendations.forEach((rec) =>
          console.log(`   - ${rec}`),
        );
      }
    }

    process.exit(0);
  }, 60000);
}
