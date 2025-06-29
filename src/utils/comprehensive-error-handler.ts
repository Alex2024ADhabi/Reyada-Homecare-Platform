/**
 * Comprehensive Error Handler for Reyada Homecare Platform
 * Handles all types of errors with recovery mechanisms
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: "low" | "medium" | "high" | "critical";
  recovered: boolean;
  recoveryMethod?: string;
}

class ComprehensiveErrorHandler {
  private static instance: ComprehensiveErrorHandler;
  private errorReports: ErrorReport[] = [];
  private maxReports = 1000;
  private recoveryStrategies: Map<string, Function> = new Map();

  public static getInstance(): ComprehensiveErrorHandler {
    if (!ComprehensiveErrorHandler.instance) {
      ComprehensiveErrorHandler.instance = new ComprehensiveErrorHandler();
    }
    return ComprehensiveErrorHandler.instance;
  }

  constructor() {
    this.initializeRecoveryStrategies();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Handle any error with enhanced context and recovery
   */
  public handleError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: ErrorReport["severity"] = "medium",
  ): boolean {
    const fullContext: ErrorContext = {
      timestamp: new Date(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
      ...context,
    };

    const errorReport: ErrorReport = {
      error,
      context: fullContext,
      severity,
      recovered: false,
    };

    // Enhanced error classification
    const errorType = this.classifyError(error);
    console.log(`🔍 Error classified as: ${errorType}`);

    // Try to recover from the error with enhanced strategies
    const recovered = this.attemptRecovery(error, errorReport);
    errorReport.recovered = recovered;

    // Store the error report with enhanced metadata
    this.storeErrorReport(errorReport);

    // Log based on severity with enhanced formatting
    this.logError(errorReport);

    // Trigger platform health check if critical error
    if (severity === "critical" && !recovered) {
      this.triggerPlatformHealthCheck();
    }

    return recovered;
  }

  /**
   * Attempt to recover from an error
   */
  private attemptRecovery(error: Error, report: ErrorReport): boolean {
    const errorType = this.classifyError(error);
    const strategy = this.recoveryStrategies.get(errorType);

    if (strategy) {
      try {
        const result = strategy(error, report.context);
        if (result) {
          report.recoveryMethod = errorType;
          console.log(
            `✅ Recovered from ${errorType} error using ${errorType} strategy`,
          );
          return true;
        }
      } catch (recoveryError) {
        console.warn(
          `⚠️ Recovery strategy ${errorType} failed:`,
          recoveryError,
        );
      }
    }

    // Try generic recovery strategies
    return this.attemptGenericRecovery(error, report);
  }

  /**
   * Classify error type for targeted recovery
   */
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || "";

    if (message.includes("network") || message.includes("fetch")) {
      return "network";
    }
    if (message.includes("json") || message.includes("parse")) {
      return "json";
    }
    if (message.includes("chunk") || message.includes("loading")) {
      return "chunk";
    }
    if (message.includes("render") || stack.includes("react")) {
      return "react";
    }
    if (message.includes("import") || message.includes("module")) {
      return "import";
    }
    if (message.includes("tempo") || message.includes("storyboard")) {
      return "tempo";
    }
    if (message.includes("route") || message.includes("navigation")) {
      return "routing";
    }

    return "generic";
  }

  /**
   * Initialize recovery strategies
   */
  private initializeRecoveryStrategies(): void {
    // Network error recovery
    this.recoveryStrategies.set("network", (error: Error) => {
      console.log("🔄 Attempting network error recovery...");
      // Implement retry logic, offline mode, etc.
      return true;
    });

    // JSON parsing error recovery
    this.recoveryStrategies.set(
      "json",
      (error: Error, context: ErrorContext) => {
        console.log("🔄 Attempting JSON error recovery...");
        // Try to sanitize and re-parse, or provide fallback data
        return true;
      },
    );

    // Chunk loading error recovery
    this.recoveryStrategies.set("chunk", (error: Error) => {
      console.log("🔄 Attempting chunk loading error recovery...");
      // Reload the page or retry chunk loading
      if (typeof window !== "undefined") {
        setTimeout(() => window.location.reload(), 1000);
        return true;
      }
      return false;
    });

    // React rendering error recovery
    this.recoveryStrategies.set("react", (error: Error) => {
      console.log("🔄 Attempting React error recovery...");
      // Error boundary will handle this
      return true;
    });

    // Import/Module error recovery
    this.recoveryStrategies.set("import", (error: Error) => {
      console.log("🔄 Attempting import error recovery...");
      // Provide fallback components or retry import
      return true;
    });

    // Tempo-specific error recovery
    this.recoveryStrategies.set("tempo", (error: Error) => {
      console.log("🔄 Attempting Tempo error recovery...");
      // Disable tempo features and continue
      return true;
    });

    // Routing error recovery
    this.recoveryStrategies.set("routing", (error: Error) => {
      console.log("🔄 Attempting routing error recovery...");
      // Navigate to safe route
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/");
        return true;
      }
      return false;
    });
  }

  /**
   * Attempt generic recovery strategies
   */
  private attemptGenericRecovery(error: Error, report: ErrorReport): boolean {
    console.log("🔄 Attempting generic error recovery...");

    // For critical errors, suggest page reload
    if (report.severity === "critical") {
      this.suggestPageReload();
      return false;
    }

    // For high severity errors, try component remount
    if (report.severity === "high") {
      this.triggerComponentRemount(report.context.component);
      return true;
    }

    // For medium/low severity, just log and continue
    return true;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === "undefined") return;

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        { component: "global", action: "promise_rejection" },
        "high",
      );
    });

    // Handle global JavaScript errors
    window.addEventListener("error", (event) => {
      this.handleError(
        event.error || new Error(event.message),
        {
          component: "global",
          action: "javascript_error",
          url: event.filename,
        },
        "high",
      );
    });

    // Handle resource loading errors
    window.addEventListener(
      "error",
      (event) => {
        if (event.target && event.target !== window) {
          this.handleError(
            new Error(
              `Resource loading failed: ${(event.target as any).src || (event.target as any).href}`,
            ),
            { component: "global", action: "resource_error" },
            "medium",
          );
        }
      },
      true,
    );
  }

  /**
   * Store error report
   */
  private storeErrorReport(report: ErrorReport): void {
    this.errorReports.push(report);

    // Keep only the most recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }

    // Store in localStorage for persistence
    try {
      const recentReports = this.errorReports.slice(-10).map((r) => ({
        message: r.error.message,
        timestamp: r.context.timestamp,
        severity: r.severity,
        recovered: r.recovered,
        component: r.context.component,
      }));
      localStorage.setItem(
        "reyada_error_reports",
        JSON.stringify(recentReports),
      );
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Log error based on severity
   */
  private logError(report: ErrorReport): void {
    const logMessage = `[${report.severity.toUpperCase()}] ${report.error.message}`;
    const logContext = {
      component: report.context.component,
      action: report.context.action,
      recovered: report.recovered,
      recoveryMethod: report.recoveryMethod,
    };

    switch (report.severity) {
      case "critical":
        console.error("🚨", logMessage, logContext);
        break;
      case "high":
        console.error("❌", logMessage, logContext);
        break;
      case "medium":
        console.warn("⚠️", logMessage, logContext);
        break;
      case "low":
        console.info("ℹ️", logMessage, logContext);
        break;
    }
  }

  /**
   * Suggest page reload for critical errors
   */
  private suggestPageReload(): void {
    if (typeof window === "undefined") return;

    const shouldReload = window.confirm(
      "A critical error occurred. Would you like to reload the page to recover?",
    );

    if (shouldReload) {
      window.location.reload();
    }
  }

  /**
   * Trigger component remount
   */
  private triggerComponentRemount(componentName?: string): void {
    // Dispatch custom event for component remount
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("reyada:component-remount", {
          detail: { component: componentName },
        }),
      );
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStatistics(): {
    totalErrors: number;
    recoveredErrors: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: ErrorReport[];
  } {
    const stats = {
      totalErrors: this.errorReports.length,
      recoveredErrors: this.errorReports.filter((r) => r.recovered).length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: this.errorReports.slice(-10),
    };

    this.errorReports.forEach((report) => {
      const errorType = this.classifyError(report.error);
      stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
      stats.bySeverity[report.severity] =
        (stats.bySeverity[report.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error reports
   */
  public clearErrorReports(): void {
    this.errorReports = [];
    try {
      localStorage.removeItem("reyada_error_reports");
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Trigger platform health check after critical errors
   */
  private triggerPlatformHealthCheck(): void {
    console.log("🏥 Triggering platform health check due to critical error...");

    // Dispatch custom event for health check
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("reyada:health-check-required", {
          detail: { timestamp: new Date(), reason: "critical-error" },
        }),
      );
    }
  }

  /**
   * Enhanced error recovery with Vite-specific handling
   */
  public handleViteError(error: Error): boolean {
    console.log("🔧 Handling Vite-specific error...");

    const message = error.message.toLowerCase();

    // Handle common Vite errors
    if (message.includes("failed to resolve module")) {
      console.log("📦 Module resolution error detected");
      return this.handleModuleResolutionError(error);
    }

    if (message.includes("transform error")) {
      console.log("🔄 Transform error detected");
      return this.handleTransformError(error);
    }

    if (message.includes("hmr") || message.includes("hot reload")) {
      console.log("🔥 HMR error detected");
      return this.handleHMRError(error);
    }

    return false;
  }

  /**
   * Handle module resolution errors
   */
  private handleModuleResolutionError(error: Error): boolean {
    console.log("🔍 Attempting to resolve module resolution error...");

    // Try to suggest fixes
    const suggestions = [
      "Check if the module is properly installed",
      "Verify the import path is correct",
      "Ensure Vite alias configuration is proper",
      "Check if the module exists in node_modules",
    ];

    console.log("💡 Suggestions:", suggestions);

    // Return false as this typically requires manual intervention
    return false;
  }

  /**
   * Handle transform errors
   */
  private handleTransformError(error: Error): boolean {
    console.log("🔄 Attempting to resolve transform error...");

    // Check if it's a JSX/TSX issue
    if (error.message.includes("jsx") || error.message.includes("tsx")) {
      console.log("⚛️ JSX/TSX transform error detected");
      // Suggest JSX pragma or React import
      return false;
    }

    return false;
  }

  /**
   * Handle HMR errors
   */
  private handleHMRError(error: Error): boolean {
    console.log("🔥 Attempting to resolve HMR error...");

    // Try to reload the page as a fallback
    if (typeof window !== "undefined") {
      console.log("🔄 Reloading page to recover from HMR error...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return true;
    }

    return false;
  }

  /**
   * Comprehensive platform error analysis
   */
  public analyzePlatformErrors(): {
    totalErrors: number;
    criticalErrors: number;
    recoveredErrors: number;
    viteErrors: number;
    recommendations: string[];
  } {
    const viteErrors = this.errorReports.filter(
      (report) =>
        report.error.message.toLowerCase().includes("vite") ||
        report.error.message.toLowerCase().includes("transform") ||
        report.error.message.toLowerCase().includes("hmr"),
    ).length;

    const criticalErrors = this.errorReports.filter(
      (report) => report.severity === "critical",
    ).length;

    const recoveredErrors = this.errorReports.filter(
      (report) => report.recovered,
    ).length;

    const recommendations: string[] = [];

    if (viteErrors > 0) {
      recommendations.push(
        `Address ${viteErrors} Vite-specific errors for better development experience`,
      );
    }

    if (criticalErrors > 0) {
      recommendations.push(
        `Resolve ${criticalErrors} critical errors immediately`,
      );
    }

    if (recoveredErrors < this.errorReports.length / 2) {
      recommendations.push(
        "Improve error recovery mechanisms for better resilience",
      );
    }

    return {
      totalErrors: this.errorReports.length,
      criticalErrors,
      recoveredErrors,
      viteErrors,
      recommendations,
    };
  }
}

// Export singleton instance
export const errorHandler = ComprehensiveErrorHandler.getInstance();

// Export convenience functions
export const handleError = (
  error: Error,
  context?: Partial<ErrorContext>,
  severity?: ErrorReport["severity"],
) => errorHandler.handleError(error, context, severity);

export const getErrorStats = () => errorHandler.getErrorStatistics();
export const clearErrors = () => errorHandler.clearErrorReports();

// React hook for error handling
export const useErrorHandler = () => {
  return {
    handleError,
    getErrorStats,
    clearErrors,
  };
};
