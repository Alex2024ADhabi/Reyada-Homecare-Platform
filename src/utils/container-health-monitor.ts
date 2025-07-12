/**
 * Container Health Monitor - Comprehensive container and application health monitoring
 * Provides real-time health checks, diagnostics, and recovery mechanisms
 */

export interface ContainerHealthStatus {
  overall: "healthy" | "warning" | "critical" | "error";
  timestamp: number;
  uptime: number;
  checks: {
    react: boolean;
    network: boolean;
    dependencies: boolean;
    jsx: boolean;
    storyboards: boolean;
    memory: boolean;
  };
  metrics: {
    memoryUsage: number;
    loadTime: number;
    errorCount: number;
    recoveryAttempts: number;
  };
  errors: string[];
  warnings: string[];
}

export class ContainerHealthMonitor {
  private static instance: ContainerHealthMonitor;
  private startTime: number;
  private healthChecks: Map<string, boolean> = new Map();
  private errors: string[] = [];
  private warnings: string[] = [];
  private metrics = {
    memoryUsage: 0,
    loadTime: 0,
    errorCount: 0,
    recoveryAttempts: 0,
  };

  private constructor() {
    this.startTime = Date.now();
    this.initializeHealthMonitoring();
  }

  static getInstance(): ContainerHealthMonitor {
    if (!ContainerHealthMonitor.instance) {
      ContainerHealthMonitor.instance = new ContainerHealthMonitor();
    }
    return ContainerHealthMonitor.instance;
  }

  /**
   * Initialize comprehensive health monitoring
   */
  private initializeHealthMonitoring(): void {
    try {
      console.log("🏥 Initializing container health monitoring...");

      // Set up periodic health checks
      setInterval(() => {
        this.performHealthCheck();
      }, 30000); // Every 30 seconds

      // Set up memory monitoring
      setInterval(() => {
        this.monitorMemoryUsage();
      }, 10000); // Every 10 seconds

      // Set up error monitoring
      this.setupErrorMonitoring();

      // Initial health check
      setTimeout(() => {
        this.performHealthCheck();
      }, 1000);

      console.log("✅ Container health monitoring initialized");
    } catch (error) {
      console.error("❌ Failed to initialize health monitoring:", error);
    }
  }

  /**
   * Perform comprehensive health check
   */
  private performHealthCheck(): void {
    try {
      // Check React availability
      this.healthChecks.set("react", this.checkReactAvailability());

      // Check network connectivity
      this.healthChecks.set("network", navigator.onLine);

      // Check dependencies
      this.healthChecks.set("dependencies", this.checkDependencies());

      // Check JSX runtime
      this.healthChecks.set("jsx", this.checkJSXRuntime());

      // Check storyboards
      this.healthChecks.set("storyboards", this.checkStoryboards());

      // Check memory usage
      this.healthChecks.set("memory", this.checkMemoryHealth());

      // Update global health status
      this.updateGlobalHealthStatus();
    } catch (error) {
      console.error("❌ Health check failed:", error);
      this.errors.push(`Health check failed: ${error}`);
    }
  }

  /**
   * Check React availability
   */
  private checkReactAvailability(): boolean {
    try {
      const windowReact =
        typeof window !== "undefined" && (window as any).React;
      const globalReact =
        typeof globalThis !== "undefined" && (globalThis as any).React;
      return !!(windowReact || globalReact);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check dependencies
   */
  private checkDependencies(): boolean {
    try {
      if (typeof window !== "undefined") {
        const depStatus = (window as any).__DEPENDENCY_SCAN_STATUS__;
        return depStatus === "success";
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check JSX runtime
   */
  private checkJSXRuntime(): boolean {
    try {
      if (typeof window !== "undefined") {
        const jsxStatus = (window as any).__JSX_RUNTIME_INITIALIZED__;
        const jsxBulletproof = (window as any).__JSX_RUNTIME_BULLETPROOF__;
        return jsxStatus === true || jsxBulletproof === true;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check storyboards
   */
  private checkStoryboards(): boolean {
    try {
      if (typeof window !== "undefined") {
        const storyboardStatus = (window as any).__STORYBOARD_STATUS__;
        if (storyboardStatus) {
          return storyboardStatus.successRate >= 80; // 80% success rate threshold
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check memory health
   */
  private checkMemoryHealth(): boolean {
    try {
      if (typeof performance !== "undefined" && performance.memory) {
        const memory = performance.memory;
        const usedPercent =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        return usedPercent < 85; // 85% threshold
      }
      return true;
    } catch (error) {
      return true;
    }
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    try {
      if (typeof performance !== "undefined" && performance.memory) {
        const memory = performance.memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize;

        const usedPercent =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usedPercent > 90) {
          this.warnings.push(`High memory usage: ${usedPercent.toFixed(1)}%`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Memory monitoring failed:", error);
    }
  }

  /**
   * Setup error monitoring
   */
  private setupErrorMonitoring(): void {
    try {
      // Monitor container errors
      if (typeof window !== "undefined") {
        const originalErrors = (window as any).__CONTAINER_ERRORS__ || [];
        this.metrics.errorCount = originalErrors.length;

        // Set up periodic error count monitoring
        setInterval(() => {
          const currentErrors = (window as any).__CONTAINER_ERRORS__ || [];
          if (currentErrors.length > this.metrics.errorCount) {
            this.metrics.errorCount = currentErrors.length;
            this.errors.push(
              `New container errors detected: ${currentErrors.length - this.metrics.errorCount}`,
            );
          }
        }, 5000);
      }
    } catch (error) {
      console.warn("⚠️ Error monitoring setup failed:", error);
    }
  }

  /**
   * Update global health status
   */
  private updateGlobalHealthStatus(): void {
    try {
      const status = this.getHealthStatus();

      if (typeof window !== "undefined") {
        (window as any).__CONTAINER_HEALTH_STATUS__ = status;
        (window as any).__CONTAINER_HEALTH__ = status.overall;
      }
    } catch (error) {
      console.error("❌ Failed to update global health status:", error);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): ContainerHealthStatus {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Calculate overall health
    const healthyChecks = Array.from(this.healthChecks.values()).filter(
      Boolean,
    ).length;
    const totalChecks = this.healthChecks.size;
    const healthPercentage =
      totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;

    let overall: "healthy" | "warning" | "critical" | "error";
    if (healthPercentage >= 90) {
      overall = "healthy";
    } else if (healthPercentage >= 70) {
      overall = "warning";
    } else if (healthPercentage >= 50) {
      overall = "critical";
    } else {
      overall = "error";
    }

    return {
      overall,
      timestamp: now,
      uptime,
      checks: {
        react: this.healthChecks.get("react") || false,
        network: this.healthChecks.get("network") || false,
        dependencies: this.healthChecks.get("dependencies") || false,
        jsx: this.healthChecks.get("jsx") || false,
        storyboards: this.healthChecks.get("storyboards") || false,
        memory: this.healthChecks.get("memory") || false,
      },
      metrics: {
        ...this.metrics,
        loadTime: uptime,
      },
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }

  /**
   * Record error
   */
  recordError(error: string): void {
    this.errors.push(error);
    this.metrics.errorCount++;

    // Limit error history
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  /**
   * Record warning
   */
  recordWarning(warning: string): void {
    this.warnings.push(warning);

    // Limit warning history
    if (this.warnings.length > 50) {
      this.warnings = this.warnings.slice(-50);
    }
  }

  /**
   * Record recovery attempt
   */
  recordRecoveryAttempt(): void {
    this.metrics.recoveryAttempts++;
  }

  /**
   * Get health summary
   */
  getHealthSummary(): string {
    const status = this.getHealthStatus();
    const uptimeMinutes = Math.floor(status.uptime / 60000);

    return `Container Health: ${status.overall.toUpperCase()} | Uptime: ${uptimeMinutes}m | Errors: ${status.errors.length} | Memory: ${Math.round(status.metrics.memoryUsage / 1024 / 1024)}MB`;
  }

  /**
   * Generate health report
   */
  generateHealthReport(): string {
    const status = this.getHealthStatus();
    const uptimeHours = Math.floor(status.uptime / 3600000);
    const uptimeMinutes = Math.floor((status.uptime % 3600000) / 60000);

    let report = "# Container Health Report\n\n";
    report += `**Overall Status:** ${status.overall.toUpperCase()}\n`;
    report += `**Uptime:** ${uptimeHours}h ${uptimeMinutes}m\n`;
    report += `**Timestamp:** ${new Date(status.timestamp).toISOString()}\n\n`;

    report += "## Health Checks\n";
    Object.entries(status.checks).forEach(([check, healthy]) => {
      report += `- ${check}: ${healthy ? "✅ Healthy" : "❌ Unhealthy"}\n`;
    });

    report += "\n## Metrics\n";
    report += `- Memory Usage: ${Math.round(status.metrics.memoryUsage / 1024 / 1024)}MB\n`;
    report += `- Load Time: ${status.metrics.loadTime}ms\n`;
    report += `- Error Count: ${status.metrics.errorCount}\n`;
    report += `- Recovery Attempts: ${status.metrics.recoveryAttempts}\n`;

    if (status.errors.length > 0) {
      report += "\n## Recent Errors\n";
      status.errors.slice(-5).forEach((error) => {
        report += `- ${error}\n`;
      });
    }

    if (status.warnings.length > 0) {
      report += "\n## Recent Warnings\n";
      status.warnings.slice(-5).forEach((warning) => {
        report += `- ${warning}\n`;
      });
    }

    return report;
  }
}

// Export singleton instance
export const containerHealthMonitor = ContainerHealthMonitor.getInstance();
export default containerHealthMonitor;
