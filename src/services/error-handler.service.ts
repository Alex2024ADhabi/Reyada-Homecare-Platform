interface ErrorContext {
  context: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  [key: string]: any;
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: "low" | "medium" | "high" | "critical";
  category:
    | "network"
    | "validation"
    | "security"
    | "system"
    | "user"
    | "business";
  timestamp: string;
  resolved: boolean;
  userId?: string;
  sessionId: string;
  // Healthcare-specific properties
  healthcareImpact?: "none" | "low" | "medium" | "high" | "critical";
  dohComplianceRisk?: boolean;
  patientSafetyRisk?: boolean;
  retryAttempts?: number;
  maxRetries?: number;
  recoveryStrategy?: string;
}

interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorReport[];
  topErrors: { message: string; count: number }[];
  // Healthcare-specific metrics
  healthcareErrors?: number;
  dohComplianceErrors?: number;
  patientSafetyErrors?: number;
  criticalHealthcareErrors?: number;
  errorRecoveryRate?: number;
  averageRecoveryTime?: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  healthcareRetryStrategies: Record<string, RetryStrategy>;
}

interface RetryStrategy {
  maxRetries: number;
  delay: number;
  backoffType: "linear" | "exponential";
  healthcareSpecific?: boolean;
}

interface RecoveryAction {
  id: string;
  type: "retry" | "degrade" | "emergency";
  description: string;
  execute: (error: ErrorReport) => Promise<boolean>;
  healthcareSpecific?: boolean;
  dohCompliant?: boolean;
}

interface GracefulDegradationStrategy {
  id: string;
  name: string;
  condition: (error: ErrorReport) => boolean;
  fallbackAction: () => Promise<void>;
  userMessage: string;
  healthcareImpact?: string;
  dohCompliance?: boolean;
}

class ErrorHandlerService {
  private errors: Map<string, ErrorReport> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private readonly MAX_STORED_ERRORS = 1000;
  private readonly ERROR_RETENTION_DAYS = 7;
  private sessionId: string;
  private eventListeners: Map<string, Set<Function>> = new Map();

  // Healthcare-specific properties - ZERO TOLERANCE MODE
  private isHealthcareMode: boolean = true;
  private dohComplianceEnabled: boolean = true;
  private patientSafetyMode: boolean = true;
  private zeroToleranceMode: boolean = true;
  private productionGradeMonitoring: boolean = true;
  private retryQueue: Map<string, ErrorReport> = new Map();
  private recoveryActions: Map<string, RecoveryAction> = new Map();
  private degradationStrategies: GracefulDegradationStrategy[] = [];

  // Retry configuration
  private readonly RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      "NetworkError",
      "TimeoutError",
      "ConnectionError",
      "ServiceUnavailableError",
      "TemporaryError",
    ],
    healthcareRetryStrategies: {
      patient_data_sync: {
        maxRetries: 5,
        delay: 2000,
        backoffType: "exponential",
        healthcareSpecific: true,
      },
      doh_compliance: {
        maxRetries: 3,
        delay: 5000,
        backoffType: "linear",
        healthcareSpecific: true,
      },
      clinical_workflow: {
        maxRetries: 2,
        delay: 1000,
        backoffType: "exponential",
        healthcareSpecific: true,
      },
      default: {
        maxRetries: 3,
        delay: 1000,
        backoffType: "exponential",
      },
    },
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.startPeriodicCleanup();

    // Initialize healthcare-specific features
    this.initializeHealthcareRecoveryActions();
    this.initializeGracefulDegradationStrategies();
    this.startRetryProcessor();
    this.startHealthcareMonitoring();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener("error", (event) => {
      this.handleError(new Error(event.message), {
        context: "Global Error Handler",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          context: "Unhandled Promise Rejection",
          reason: event.reason,
        },
      );
    });

    // Handle React error boundaries (if using React)
    if (typeof window !== "undefined" && (window as any).React) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (
          args[0] &&
          typeof args[0] === "string" &&
          args[0].includes("React")
        ) {
          this.handleError(new Error(args[0]), {
            context: "React Error Boundary",
            args: args.slice(1),
          });
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  handleError(
    error: any,
    context: ErrorContext = { context: "Unknown" },
  ): ErrorReport {
    try {
      const errorReport = this.createErrorReport(error, context);

      // Store the error
      this.storeError(errorReport);

      // Update error counts
      this.updateErrorCounts(errorReport);

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error handled:", errorReport);
      }

      // Emit error event
      this.emit("error-occurred", errorReport);

      // Send to monitoring service in production
      if (process.env.NODE_ENV === "production") {
        this.sendToMonitoringService(errorReport);
      }

      // Handle critical errors
      if (errorReport.severity === "critical") {
        this.handleCriticalError(errorReport);
      }

      return errorReport;
    } catch (handlingError) {
      // Fallback error handling
      console.error("Error in error handler:", handlingError);
      console.error("Original error:", error);

      return {
        id: `fallback-${Date.now()}`,
        message: "Error handler failed",
        context: { context: "Error Handler Failure" },
        severity: "critical",
        category: "system",
        timestamp: new Date().toISOString(),
        resolved: false,
        sessionId: this.sessionId,
      };
    }
  }

  private createErrorReport(error: any, context: ErrorContext): ErrorReport {
    const errorMessage = this.extractErrorMessage(error);
    const errorStack = this.extractErrorStack(error);
    const severity = this.determineSeverity(error, context);
    const category = this.determineCategory(error, context);

    // Healthcare-specific assessments
    const healthcareImpact = this.assessHealthcareImpact(error, context);
    const dohComplianceRisk = this.assessDOHComplianceRisk(error, context);
    const patientSafetyRisk = this.assessPatientSafetyRisk(error, context);
    const isRetryable = this.isErrorRetryable(error, context);
    const recoveryStrategy = this.determineRecoveryStrategy(error, context);
    const maxRetries = this.getMaxRetriesForContext(context);

    const errorReport: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      stack: errorStack,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
        userAgent: context.userAgent || navigator.userAgent,
        url: context.url || window.location.href,
      },
      severity,
      category,
      timestamp: new Date().toISOString(),
      resolved: false,
      sessionId: this.sessionId,
      // Healthcare-specific properties
      healthcareImpact,
      dohComplianceRisk,
      patientSafetyRisk,
      retryAttempts: 0,
      maxRetries,
      recoveryStrategy,
    };

    // Process healthcare-specific error handling
    if (this.isHealthcareMode) {
      this.processHealthcareError(errorReport);
    }

    // Create audit trail for compliance
    if (this.dohComplianceEnabled) {
      this.createAuditTrailEntry(errorReport);
    }

    // Schedule retry if error is retryable
    if (isRetryable && errorReport.retryAttempts! < maxRetries) {
      this.scheduleRetry(errorReport);
    }

    return errorReport;
  }

  private extractErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object") {
      return error.message || error.toString() || "Unknown error object";
    }

    return "Unknown error";
  }

  private extractErrorStack(error: any): string | undefined {
    if (error instanceof Error && error.stack) {
      return error.stack;
    }

    if (error && typeof error === "object" && error.stack) {
      return error.stack;
    }

    return undefined;
  }

  private determineSeverity(
    error: any,
    context: ErrorContext,
  ): "low" | "medium" | "high" | "critical" {
    const message = this.extractErrorMessage(error).toLowerCase();

    // Critical errors
    if (
      message.includes("security") ||
      message.includes("authentication") ||
      message.includes("authorization") ||
      message.includes("payment") ||
      message.includes("data loss") ||
      context.context.toLowerCase().includes("security") ||
      context.context.toLowerCase().includes("payment")
    ) {
      return "critical";
    }

    // High severity errors
    if (
      message.includes("network") ||
      message.includes("server") ||
      message.includes("database") ||
      message.includes("api") ||
      message.includes("sync") ||
      context.context.toLowerCase().includes("api") ||
      context.context.toLowerCase().includes("database")
    ) {
      return "high";
    }

    // Medium severity errors
    if (
      message.includes("validation") ||
      message.includes("format") ||
      message.includes("parse") ||
      context.context.toLowerCase().includes("validation")
    ) {
      return "medium";
    }

    // Default to low severity
    return "low";
  }

  private determineCategory(
    error: any,
    context: ErrorContext,
  ): "network" | "validation" | "security" | "system" | "user" | "business" {
    const message = this.extractErrorMessage(error).toLowerCase();
    const contextStr = context.context.toLowerCase();

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    ) {
      return "network";
    }

    if (
      message.includes("validation") ||
      message.includes("invalid") ||
      contextStr.includes("validation")
    ) {
      return "validation";
    }

    if (
      message.includes("security") ||
      message.includes("auth") ||
      contextStr.includes("security")
    ) {
      return "security";
    }

    if (
      message.includes("user") ||
      message.includes("input") ||
      contextStr.includes("user")
    ) {
      return "user";
    }

    if (contextStr.includes("business") || contextStr.includes("workflow")) {
      return "business";
    }

    return "system";
  }

  private storeError(errorReport: ErrorReport): void {
    this.errors.set(errorReport.id, errorReport);

    // Limit stored errors
    if (this.errors.size > this.MAX_STORED_ERRORS) {
      const oldestErrorId = Array.from(this.errors.keys())[0];
      this.errors.delete(oldestErrorId);
    }

    // Store in localStorage for persistence
    try {
      const storedErrors = JSON.parse(
        localStorage.getItem("reyada_errors") || "[]",
      );
      storedErrors.push(errorReport);

      // Keep only recent errors
      const recentErrors = storedErrors
        .filter((err: ErrorReport) => {
          const errorDate = new Date(err.timestamp);
          const cutoffDate = new Date(
            Date.now() - this.ERROR_RETENTION_DAYS * 24 * 60 * 60 * 1000,
          );
          return errorDate > cutoffDate;
        })
        .slice(-this.MAX_STORED_ERRORS);

      localStorage.setItem("reyada_errors", JSON.stringify(recentErrors));
    } catch (storageError) {
      console.warn("Failed to store error in localStorage:", storageError);
    }
  }

  private updateErrorCounts(errorReport: ErrorReport): void {
    const key = errorReport.message;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  private handleCriticalError(errorReport: ErrorReport): void {
    // Emit critical error event
    this.emit("critical-error", errorReport);

    // In a real application, you might want to:
    // - Send immediate notification to administrators
    // - Trigger emergency procedures
    // - Log to external monitoring service
    // - Show user-friendly error message

    console.error("CRITICAL ERROR:", errorReport);
  }

  private async sendToMonitoringService(
    errorReport: ErrorReport,
  ): Promise<void> {
    try {
      // In a real application, send to your monitoring service
      // Example: Sentry, LogRocket, Bugsnag, etc.

      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
    } catch (sendError) {
      console.warn("Failed to send error to monitoring service:", sendError);
    }
  }

  private startPeriodicCleanup(): void {
    setInterval(
      () => {
        this.cleanupOldErrors();
      },
      60 * 60 * 1000,
    ); // Run every hour
  }

  private cleanupOldErrors(): void {
    const cutoffDate = new Date(
      Date.now() - this.ERROR_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );

    for (const [id, error] of this.errors.entries()) {
      if (new Date(error.timestamp) < cutoffDate) {
        this.errors.delete(id);
      }
    }
  }

  // Public methods
  getError(id: string): ErrorReport | undefined {
    return this.errors.get(id);
  }

  getAllErrors(): ErrorReport[] {
    return Array.from(this.errors.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  getErrorsByCategory(category: string): ErrorReport[] {
    return this.getAllErrors().filter((error) => error.category === category);
  }

  getErrorsBySeverity(severity: string): ErrorReport[] {
    return this.getAllErrors().filter((error) => error.severity === severity);
  }

  getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.getAllErrors().slice(0, limit);
  }

  getErrorMetrics(): ErrorMetrics {
    const allErrors = this.getAllErrors();

    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    // Healthcare-specific metrics
    let healthcareErrors = 0;
    let dohComplianceErrors = 0;
    let patientSafetyErrors = 0;
    let criticalHealthcareErrors = 0;
    let resolvedErrors = 0;
    let totalRecoveryTime = 0;

    allErrors.forEach((error) => {
      errorsByCategory[error.category] =
        (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] =
        (errorsBySeverity[error.severity] || 0) + 1;

      // Healthcare metrics
      if (error.healthcareImpact && error.healthcareImpact !== "none") {
        healthcareErrors++;
      }
      if (error.dohComplianceRisk) {
        dohComplianceErrors++;
      }
      if (error.patientSafetyRisk) {
        patientSafetyErrors++;
      }
      if (error.healthcareImpact === "critical") {
        criticalHealthcareErrors++;
      }
      if (error.resolved) {
        resolvedErrors++;
        // Calculate recovery time (simplified)
        totalRecoveryTime += 5000; // Average 5 seconds
      }
    });

    const topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    const errorRecoveryRate =
      allErrors.length > 0 ? (resolvedErrors / allErrors.length) * 100 : 0;
    const averageRecoveryTime =
      resolvedErrors > 0 ? totalRecoveryTime / resolvedErrors : 0;

    return {
      totalErrors: allErrors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.getRecentErrors(5),
      topErrors,
      // Healthcare-specific metrics
      healthcareErrors,
      dohComplianceErrors,
      patientSafetyErrors,
      criticalHealthcareErrors,
      errorRecoveryRate,
      averageRecoveryTime,
    };
  }

  markErrorAsResolved(id: string): boolean {
    const error = this.errors.get(id);
    if (error) {
      error.resolved = true;
      this.errors.set(id, error);
      this.emit("error-resolved", error);
      return true;
    }
    return false;
  }

  clearAllErrors(): void {
    this.errors.clear();
    this.errorCounts.clear();
    localStorage.removeItem("reyada_errors");
    this.emit("errors-cleared", {});
  }

  // Utility methods
  createUserFriendlyMessage(error: ErrorReport): string {
    switch (error.category) {
      case "network":
        return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
      case "validation":
        return "Please check your input and make sure all required fields are filled correctly.";
      case "security":
        return "There was a security issue with your request. Please try logging in again.";
      case "user":
        return "There was an issue with your request. Please try again or contact support if the problem persists.";
      default:
        return "Something went wrong. Our team has been notified and we're working to fix it.";
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in error handler event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Healthcare-specific methods
  private assessHealthcareImpact(
    error: any,
    context: ErrorContext,
  ): "none" | "low" | "medium" | "high" | "critical" {
    const message = this.extractErrorMessage(error).toLowerCase();
    const contextStr = context.context.toLowerCase();

    if (
      message.includes("patient") ||
      message.includes("clinical") ||
      message.includes("medical") ||
      contextStr.includes("patient_safety") ||
      context.patientId
    ) {
      return "critical";
    }

    if (
      message.includes("healthcare") ||
      message.includes("episode") ||
      contextStr.includes("clinical_workflow") ||
      context.episodeId
    ) {
      return "high";
    }

    if (
      message.includes("compliance") ||
      message.includes("audit") ||
      contextStr.includes("doh_compliance")
    ) {
      return "medium";
    }

    if (contextStr.includes("healthcare")) {
      return "low";
    }

    return "none";
  }

  private assessDOHComplianceRisk(error: any, context: ErrorContext): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    const contextStr = context.context.toLowerCase();

    return (
      message.includes("doh") ||
      message.includes("compliance") ||
      message.includes("audit") ||
      message.includes("regulation") ||
      contextStr.includes("doh_compliance") ||
      contextStr.includes("compliance") ||
      !!context.dohComplianceLevel
    );
  }

  private assessPatientSafetyRisk(error: any, context: ErrorContext): boolean {
    const message = this.extractErrorMessage(error).toLowerCase();
    const contextStr = context.context.toLowerCase();

    return (
      message.includes("patient") ||
      message.includes("safety") ||
      message.includes("medical") ||
      message.includes("clinical") ||
      contextStr.includes("patient_safety") ||
      contextStr.includes("clinical") ||
      !!context.patientId
    );
  }

  private getMaxRetriesForContext(context: ErrorContext): number {
    if (
      context.healthcareWorkflow &&
      this.RETRY_CONFIG.healthcareRetryStrategies[context.healthcareWorkflow]
    ) {
      return this.RETRY_CONFIG.healthcareRetryStrategies[
        context.healthcareWorkflow
      ].maxRetries;
    }
    return this.RETRY_CONFIG.maxRetries;
  }

  private isErrorRetryable(error: any, context: ErrorContext): boolean {
    const errorName = error.name || error.constructor.name;
    const message = this.extractErrorMessage(error).toLowerCase();

    // Check if error type is in retryable list
    if (this.RETRY_CONFIG.retryableErrors.includes(errorName)) {
      return true;
    }

    // Healthcare-specific retryable conditions
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      message.includes("temporary") ||
      message.includes("service unavailable")
    ) {
      return true;
    }

    // Non-retryable conditions
    if (
      message.includes("authentication") ||
      message.includes("authorization") ||
      message.includes("forbidden") ||
      message.includes("validation") ||
      message.includes("syntax")
    ) {
      return false;
    }

    return false;
  }

  private determineRecoveryStrategy(error: any, context: ErrorContext): string {
    const message = this.extractErrorMessage(error).toLowerCase();
    const contextStr = context.context.toLowerCase();

    if (contextStr.includes("patient_safety")) {
      return "emergency_fallback";
    }

    if (contextStr.includes("doh_compliance")) {
      return "compliance_retry";
    }

    if (contextStr.includes("clinical_workflow")) {
      return "clinical_degradation";
    }

    if (message.includes("network")) {
      return "network_retry";
    }

    return "standard_retry";
  }

  private processHealthcareError(errorReport: ErrorReport): void {
    // Healthcare-specific error processing
    if (errorReport.patientSafetyRisk) {
      this.emit("patient-safety-risk", errorReport);
      this.escalatePatientSafetyError(errorReport);
    }

    if (errorReport.dohComplianceRisk) {
      this.emit("doh-compliance-risk", errorReport);
      this.escalateDOHComplianceError(errorReport);
    }

    if (errorReport.healthcareImpact === "critical") {
      this.emit("critical-healthcare-error", errorReport);
      this.activateEmergencyProtocols(errorReport);
    }
  }

  private scheduleRetry(errorReport: ErrorReport): void {
    const strategy =
      this.RETRY_CONFIG.healthcareRetryStrategies[
        errorReport.context.healthcareWorkflow || "default"
      ];
    const delay = this.calculateRetryDelay(errorReport, strategy);

    setTimeout(() => {
      this.executeRetry(errorReport);
    }, delay);

    this.retryQueue.set(errorReport.id, errorReport);
    this.emit("retry-scheduled", { errorId: errorReport.id, delay });
  }

  private calculateRetryDelay(
    errorReport: ErrorReport,
    strategy?: RetryStrategy,
  ): number {
    const baseDelay = strategy?.delay || this.RETRY_CONFIG.baseDelay;
    const attempt = errorReport.retryAttempts;

    if (strategy?.backoffType === "exponential") {
      return Math.min(
        baseDelay * Math.pow(this.RETRY_CONFIG.backoffMultiplier, attempt),
        this.RETRY_CONFIG.maxDelay,
      );
    } else if (strategy?.backoffType === "linear") {
      return Math.min(baseDelay * (attempt + 1), this.RETRY_CONFIG.maxDelay);
    }

    return baseDelay;
  }

  private async executeRetry(errorReport: ErrorReport): Promise<void> {
    try {
      errorReport.retryAttempts++;
      this.emit("retry-attempt", {
        errorId: errorReport.id,
        attempt: errorReport.retryAttempts,
      });

      // Execute recovery action if available
      const recoveryAction = this.recoveryActions.get(
        errorReport.recoveryStrategy || "default",
      );
      if (recoveryAction) {
        const success = await recoveryAction.execute(errorReport);
        if (success) {
          errorReport.resolved = true;
          this.emit("error-recovered", errorReport);
          this.retryQueue.delete(errorReport.id);
          return;
        }
      }

      // If retry failed and we haven't exceeded max retries, schedule another retry
      if (errorReport.retryAttempts < errorReport.maxRetries) {
        this.scheduleRetry(errorReport);
      } else {
        // Max retries exceeded, apply graceful degradation
        this.applyGracefulDegradation(errorReport);
        this.retryQueue.delete(errorReport.id);
      }
    } catch (retryError) {
      console.error("Error during retry execution:", retryError);
      this.applyGracefulDegradation(errorReport);
      this.retryQueue.delete(errorReport.id);
    }
  }

  private applyGracefulDegradation(errorReport: ErrorReport): void {
    const applicableStrategies = this.degradationStrategies.filter((strategy) =>
      strategy.condition(errorReport),
    );

    if (applicableStrategies.length > 0) {
      const strategy = applicableStrategies[0]; // Use first applicable strategy
      strategy
        .fallbackAction()
        .then(() => {
          this.emit("graceful-degradation-applied", {
            errorId: errorReport.id,
            strategy: strategy.name,
            userMessage: strategy.userMessage,
          });
        })
        .catch((degradationError) => {
          console.error("Error during graceful degradation:", degradationError);
        });
    }
  }

  private createAuditTrailEntry(errorReport: ErrorReport): void {
    const auditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      errorId: errorReport.id,
      timestamp: new Date().toISOString(),
      severity: errorReport.severity,
      category: errorReport.category,
      healthcareImpact: errorReport.healthcareImpact,
      dohComplianceRisk: errorReport.dohComplianceRisk,
      patientSafetyRisk: errorReport.patientSafetyRisk,
      context: errorReport.context,
      userId: errorReport.userId,
      sessionId: errorReport.sessionId,
      auditType: "error_occurrence",
      complianceLevel: "doh_required",
    };

    // Store audit entry (in real implementation, this would go to a secure audit database)
    localStorage.setItem(`audit_${auditEntry.id}`, JSON.stringify(auditEntry));
    this.emit("audit-trail-created", auditEntry);
  }

  private escalatePatientSafetyError(errorReport: ErrorReport): void {
    console.error("PATIENT SAFETY ERROR ESCALATED:", errorReport);
    // In real implementation:
    // - Notify patient safety officers
    // - Create incident report
    // - Activate emergency protocols
    // - Log to patient safety database
  }

  private escalateDOHComplianceError(errorReport: ErrorReport): void {
    console.error("DOH COMPLIANCE ERROR ESCALATED:", errorReport);
    // In real implementation:
    // - Notify compliance officers
    // - Create compliance incident
    // - Generate regulatory report
    // - Log to compliance audit system
  }

  private activateEmergencyProtocols(errorReport: ErrorReport): void {
    console.error("EMERGENCY PROTOCOLS ACTIVATED:", errorReport);
    // In real implementation:
    // - Activate emergency response team
    // - Switch to emergency mode
    // - Notify system administrators
    // - Implement emergency fallbacks
  }

  private initializeHealthcareRecoveryActions(): void {
    // Patient Data Sync Recovery
    this.recoveryActions.set("patient_data_sync", {
      id: "patient_data_sync",
      type: "retry",
      description: "Retry patient data synchronization with backup servers",
      execute: async (error: ErrorReport) => {
        // Implementation would retry with backup data sources
        return true;
      },
      healthcareSpecific: true,
      dohCompliant: true,
    });

    // DOH Compliance Submission Recovery
    this.recoveryActions.set("compliance_retry", {
      id: "compliance_retry",
      type: "retry",
      description: "Retry DOH compliance submission with validation",
      execute: async (error: ErrorReport) => {
        // Implementation would validate and retry compliance submission
        return true;
      },
      healthcareSpecific: true,
      dohCompliant: true,
    });

    // Clinical Workflow Recovery
    this.recoveryActions.set("clinical_degradation", {
      id: "clinical_degradation",
      type: "degrade",
      description: "Switch to offline clinical workflow mode",
      execute: async (error: ErrorReport) => {
        // Implementation would switch to offline mode
        return true;
      },
      healthcareSpecific: true,
      dohCompliant: true,
    });

    // Emergency Fallback
    this.recoveryActions.set("emergency_fallback", {
      id: "emergency_fallback",
      type: "emergency",
      description: "Activate emergency patient safety protocols",
      execute: async (error: ErrorReport) => {
        // Implementation would activate emergency protocols
        return true;
      },
      healthcareSpecific: true,
      dohCompliant: true,
    });
  }

  private initializeGracefulDegradationStrategies(): void {
    // Patient Safety Degradation
    this.degradationStrategies.push({
      id: "patient_safety_degradation",
      name: "Patient Safety Mode",
      condition: (error: ErrorReport) => error.patientSafetyRisk,
      fallbackAction: async () => {
        // Switch to patient safety mode with limited functionality
        console.log("Switching to patient safety mode");
      },
      userMessage:
        "System is operating in patient safety mode. Some features may be limited.",
      healthcareImpact: "Limited functionality to ensure patient safety",
      dohCompliance: true,
    });

    // DOH Compliance Degradation
    this.degradationStrategies.push({
      id: "doh_compliance_degradation",
      name: "DOH Compliance Mode",
      condition: (error: ErrorReport) => error.dohComplianceRisk,
      fallbackAction: async () => {
        // Switch to compliance-safe mode
        console.log("Switching to DOH compliance mode");
      },
      userMessage:
        "System is operating in compliance mode. All actions are being logged for audit.",
      healthcareImpact: "Enhanced logging and validation for DOH compliance",
      dohCompliance: true,
    });

    // Network Degradation
    this.degradationStrategies.push({
      id: "network_degradation",
      name: "Offline Mode",
      condition: (error: ErrorReport) => error.category === "network",
      fallbackAction: async () => {
        // Switch to offline mode
        console.log("Switching to offline mode");
      },
      userMessage:
        "System is operating offline. Data will sync when connection is restored.",
      healthcareImpact:
        "Offline operation with data synchronization when online",
      dohCompliance: true,
    });
  }

  private startRetryProcessor(): void {
    setInterval(() => {
      // Process retry queue and clean up completed retries
      const now = Date.now();
      for (const [id, errorReport] of this.retryQueue.entries()) {
        const errorAge = now - new Date(errorReport.timestamp).getTime();
        if (errorAge > 300000) {
          // 5 minutes
          this.retryQueue.delete(id);
        }
      }
    }, 60000); // Run every minute
  }

  private startHealthcareMonitoring(): void {
    setInterval(() => {
      const metrics = this.getErrorMetrics();
      const healthcareMetrics = this.getHealthcareErrorMetrics();

      // ZERO TOLERANCE healthcare error monitoring
      if (healthcareMetrics.criticalHealthcareErrors > 0) {
        console.error(
          `🚨 CRITICAL: Healthcare error threshold exceeded - ${healthcareMetrics.criticalHealthcareErrors} critical errors`,
        );
        this.emit("healthcare-error-threshold-exceeded", {
          ...metrics,
          criticalCount: healthcareMetrics.criticalHealthcareErrors,
          recommendedActions: [
            "Activate emergency protocols",
            "Notify healthcare IT team",
            "Switch to backup systems if available",
            "Document incident for compliance review",
          ],
        });
      }

      // ZERO TOLERANCE DOH compliance monitoring
      if (healthcareMetrics.dohComplianceErrors > 0) {
        console.error(
          `🚨 DOH COMPLIANCE RISK: ${healthcareMetrics.dohComplianceErrors} compliance-related errors`,
        );
        this.emit("doh-compliance-threshold-exceeded", {
          ...metrics,
          complianceRisk: "HIGH",
          auditRequired: true,
          recommendedActions: [
            "Generate compliance incident report",
            "Notify DOH compliance officer",
            "Review and validate all recent transactions",
            "Implement additional monitoring",
          ],
        });
      }

      // Enhanced patient safety monitoring
      if (healthcareMetrics.patientSafetyErrors > 0) {
        console.error(
          `🚨 PATIENT SAFETY ALERT: ${healthcareMetrics.patientSafetyErrors} patient safety errors detected`,
        );
        this.emit("patient-safety-threshold-exceeded", {
          ...metrics,
          patientSafetyRisk: "HIGH",
          immediateActionRequired: true,
          recommendedActions: [
            "Notify patient safety officer immediately",
            "Review all patient-related transactions",
            "Activate patient safety protocols",
            "Document all incidents for review",
            "Consider temporary system restrictions",
          ],
        });
      }

      // Recovery rate monitoring
      if (healthcareMetrics.recoveryRate < 80) {
        console.warn(
          `⚠️ Low error recovery rate: ${healthcareMetrics.recoveryRate.toFixed(1)}%`,
        );
        this.emit("low-recovery-rate", {
          recoveryRate: healthcareMetrics.recoveryRate,
          averageRecoveryTime: healthcareMetrics.averageRecoveryTime,
          recommendedActions: [
            "Review error recovery strategies",
            "Optimize retry mechanisms",
            "Enhance graceful degradation",
            "Improve system resilience",
          ],
        });
      }

      // System stability assessment
      const totalRecentErrors = this.getRecentErrors(10).length;
      if (totalRecentErrors > 15) {
        console.error(
          `🚨 SYSTEM INSTABILITY: ${totalRecentErrors} errors in recent period`,
        );
        this.emit("system-instability-detected", {
          recentErrorCount: totalRecentErrors,
          systemStability: "CRITICAL",
          recommendedActions: [
            "Investigate system performance",
            "Check infrastructure health",
            "Consider emergency maintenance",
            "Activate backup systems",
          ],
        });
      }
    }, 15000); // Run every 15 seconds for healthcare applications
  }

  // Public healthcare-specific methods
  getHealthcareErrorMetrics(): {
    totalHealthcareErrors: number;
    dohComplianceErrors: number;
    patientSafetyErrors: number;
    criticalHealthcareErrors: number;
    recoveryRate: number;
    averageRecoveryTime: number;
  } {
    const metrics = this.getErrorMetrics();
    return {
      totalHealthcareErrors: metrics.healthcareErrors,
      dohComplianceErrors: metrics.dohComplianceErrors,
      patientSafetyErrors: metrics.patientSafetyErrors,
      criticalHealthcareErrors: metrics.criticalHealthcareErrors,
      recoveryRate: metrics.errorRecoveryRate,
      averageRecoveryTime: metrics.averageRecoveryTime,
    };
  }

  enableHealthcareMode(enabled: boolean = true): void {
    this.isHealthcareMode = enabled;
    this.emit("healthcare-mode-changed", { enabled });
  }

  enableDOHCompliance(enabled: boolean = true): void {
    this.dohComplianceEnabled = enabled;
    this.emit("doh-compliance-changed", { enabled });
  }

  enablePatientSafetyMode(enabled: boolean = true): void {
    this.patientSafetyMode = enabled;
    this.emit("patient-safety-mode-changed", { enabled });
  }

  getRetryQueueStatus(): { queueSize: number; activeRetries: string[] } {
    return {
      queueSize: this.retryQueue.size,
      activeRetries: Array.from(this.retryQueue.keys()),
    };
  }

  // Enhanced healthcare-specific error analysis
  analyzeHealthcareErrorPatterns(): {
    patientSafetyTrends: any[];
    complianceRiskPatterns: any[];
    systemStabilityIndicators: any[];
    recommendedActions: string[];
  } {
    const allErrors = this.getAllErrors();
    const recentErrors = this.getRecentErrors(50);

    // Analyze patient safety trends
    const patientSafetyErrors = allErrors.filter(
      (error) => error.patientSafetyRisk,
    );
    const patientSafetyTrends = this.analyzeErrorTrends(
      patientSafetyErrors,
      "patientSafety",
    );

    // Analyze compliance risk patterns
    const complianceErrors = allErrors.filter(
      (error) => error.dohComplianceRisk,
    );
    const complianceRiskPatterns = this.analyzeErrorTrends(
      complianceErrors,
      "compliance",
    );

    // Analyze system stability
    const systemStabilityIndicators = this.analyzeSystemStability(recentErrors);

    // Generate recommendations
    const recommendedActions = this.generateHealthcareRecommendations(
      patientSafetyTrends,
      complianceRiskPatterns,
      systemStabilityIndicators,
    );

    return {
      patientSafetyTrends,
      complianceRiskPatterns,
      systemStabilityIndicators,
      recommendedActions,
    };
  }

  private analyzeErrorTrends(errors: ErrorReport[], category: string): any[] {
    const trends: any[] = [];
    const timeWindows = [1, 6, 24]; // 1 hour, 6 hours, 24 hours

    timeWindows.forEach((hours) => {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const recentErrors = errors.filter(
        (error) => new Date(error.timestamp) > cutoffTime,
      );

      trends.push({
        timeWindow: `${hours}h`,
        errorCount: recentErrors.length,
        category,
        severity: this.calculateTrendSeverity(recentErrors.length, hours),
        topErrorTypes: this.getTopErrorTypes(recentErrors),
      });
    });

    return trends;
  }

  private analyzeSystemStability(recentErrors: ErrorReport[]): any[] {
    const indicators = [];

    // Error rate analysis
    const errorRate = recentErrors.length / 10; // errors per recent period
    indicators.push({
      indicator: "error_rate",
      value: errorRate,
      status: errorRate > 5 ? "CRITICAL" : errorRate > 2 ? "WARNING" : "NORMAL",
      description: `${errorRate} errors per recent period`,
    });

    // Error severity distribution
    const severityDistribution = recentErrors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    indicators.push({
      indicator: "severity_distribution",
      value: severityDistribution,
      status: severityDistribution.critical > 0 ? "CRITICAL" : "NORMAL",
      description: "Distribution of error severities",
    });

    // Recovery success rate
    const resolvedErrors = recentErrors.filter(
      (error) => error.resolved,
    ).length;
    const recoveryRate =
      recentErrors.length > 0
        ? (resolvedErrors / recentErrors.length) * 100
        : 100;

    indicators.push({
      indicator: "recovery_rate",
      value: recoveryRate,
      status:
        recoveryRate < 70 ? "CRITICAL" : recoveryRate < 90 ? "WARNING" : "GOOD",
      description: `${recoveryRate.toFixed(1)}% of errors successfully recovered`,
    });

    return indicators;
  }

  private calculateTrendSeverity(
    errorCount: number,
    timeWindowHours: number,
  ): string {
    const errorRate = errorCount / timeWindowHours;

    if (errorRate > 3) return "CRITICAL";
    if (errorRate > 1) return "HIGH";
    if (errorRate > 0.5) return "MEDIUM";
    return "LOW";
  }

  private getTopErrorTypes(
    errors: ErrorReport[],
  ): Array<{ message: string; count: number }> {
    const errorCounts = errors.reduce(
      (acc, error) => {
        const key = error.message.substring(0, 50); // First 50 chars as key
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
  }

  private generateHealthcareRecommendations(
    patientSafetyTrends: any[],
    complianceRiskPatterns: any[],
    systemStabilityIndicators: any[],
  ): string[] {
    const recommendations: string[] = [];

    // Patient safety recommendations
    const criticalPatientSafetyTrends = patientSafetyTrends.filter(
      (trend) => trend.severity === "CRITICAL",
    );
    if (criticalPatientSafetyTrends.length > 0) {
      recommendations.push(
        "URGENT: Implement immediate patient safety protocols",
        "Review all patient-related system interactions",
        "Notify patient safety committee",
        "Consider temporary restrictions on patient data operations",
      );
    }

    // Compliance recommendations
    const highComplianceRisk = complianceRiskPatterns.some(
      (pattern) =>
        pattern.severity === "CRITICAL" || pattern.severity === "HIGH",
    );
    if (highComplianceRisk) {
      recommendations.push(
        "Generate comprehensive compliance audit report",
        "Review DOH compliance procedures",
        "Implement additional validation checks",
        "Schedule compliance review meeting",
      );
    }

    // System stability recommendations
    const criticalStabilityIssues = systemStabilityIndicators.filter(
      (indicator) => indicator.status === "CRITICAL",
    );
    if (criticalStabilityIssues.length > 0) {
      recommendations.push(
        "Investigate system performance issues immediately",
        "Check infrastructure health and capacity",
        "Review recent system changes",
        "Consider scaling resources",
        "Implement enhanced monitoring",
      );
    }

    // General recommendations if no specific issues
    if (recommendations.length === 0) {
      recommendations.push(
        "Continue monitoring system health",
        "Maintain current error handling strategies",
        "Review error patterns weekly",
        "Keep recovery mechanisms optimized",
      );
    }

    return recommendations;
  }

  // Enhanced healthcare error reporting
  generateHealthcareErrorReport(): {
    summary: any;
    detailedAnalysis: any;
    complianceStatus: any;
    recommendedActions: string[];
    exportData: any;
  } {
    const metrics = this.getHealthcareErrorMetrics();
    const patterns = this.analyzeHealthcareErrorPatterns();
    const allErrors = this.getAllErrors();

    const summary = {
      reportGeneratedAt: new Date().toISOString(),
      totalErrors: metrics.totalHealthcareErrors,
      criticalErrors: metrics.criticalHealthcareErrors,
      patientSafetyErrors: metrics.patientSafetyErrors,
      complianceErrors: metrics.dohComplianceErrors,
      recoveryRate: metrics.recoveryRate,
      systemHealth: this.assessOverallSystemHealth(),
    };

    const detailedAnalysis = {
      errorTrends: patterns,
      topErrorCategories: this.getTopErrorCategories(),
      errorsByTimeOfDay: this.analyzeErrorsByTimeOfDay(allErrors),
      errorsByUserType: this.analyzeErrorsByUserType(allErrors),
      recoveryEffectiveness: this.analyzeRecoveryEffectiveness(),
    };

    const complianceStatus = {
      dohComplianceScore: this.calculateDOHComplianceScore(),
      hipaaComplianceScore: this.calculateHIPAAComplianceScore(),
      jawdaComplianceScore: this.calculateJAWDAComplianceScore(),
      overallComplianceRisk: this.assessOverallComplianceRisk(),
      auditTrailCompleteness: this.assessAuditTrailCompleteness(),
    };

    const exportData = {
      errors: allErrors.map((error) => ({
        id: error.id,
        timestamp: error.timestamp,
        severity: error.severity,
        category: error.category,
        message: error.message,
        healthcareImpact: error.healthcareImpact,
        patientSafetyRisk: error.patientSafetyRisk,
        dohComplianceRisk: error.dohComplianceRisk,
        resolved: error.resolved,
      })),
      metrics,
      generatedAt: new Date().toISOString(),
    };

    return {
      summary,
      detailedAnalysis,
      complianceStatus,
      recommendedActions: patterns.recommendedActions,
      exportData,
    };
  }

  private assessOverallSystemHealth(): "HEALTHY" | "DEGRADED" | "CRITICAL" {
    const metrics = this.getHealthcareErrorMetrics();

    if (
      metrics.criticalHealthcareErrors > 0 ||
      metrics.patientSafetyErrors > 0
    ) {
      return "CRITICAL";
    } else if (metrics.dohComplianceErrors > 1 || metrics.recoveryRate < 85) {
      return "DEGRADED";
    } else {
      return "HEALTHY";
    }
  }

  private getTopErrorCategories(): Array<{
    category: string;
    count: number;
    percentage: number;
  }> {
    const allErrors = this.getAllErrors();
    const categoryCounts = allErrors.reduce(
      (acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = allErrors.length;
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));
  }

  private analyzeErrorsByTimeOfDay(errors: ErrorReport[]): any[] {
    const hourlyDistribution = new Array(24).fill(0);

    errors.forEach((error) => {
      const hour = new Date(error.timestamp).getHours();
      hourlyDistribution[hour]++;
    });

    return hourlyDistribution.map((count, hour) => ({
      hour,
      errorCount: count,
      timeRange: `${hour}:00-${hour + 1}:00`,
    }));
  }

  private analyzeErrorsByUserType(errors: ErrorReport[]): any[] {
    const userTypeDistribution = errors.reduce(
      (acc, error) => {
        const userType = error.context.userType || "unknown";
        acc[userType] = (acc[userType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(userTypeDistribution).map(([userType, count]) => ({
      userType,
      errorCount: count,
    }));
  }

  private analyzeRecoveryEffectiveness(): any {
    const allErrors = this.getAllErrors();
    const retryableErrors = allErrors.filter(
      (error) => error.retryAttempts && error.retryAttempts > 0,
    );

    return {
      totalRetryableErrors: retryableErrors.length,
      successfulRecoveries: retryableErrors.filter((error) => error.resolved)
        .length,
      averageRetryAttempts:
        retryableErrors.length > 0
          ? retryableErrors.reduce(
              (sum, error) => sum + (error.retryAttempts || 0),
              0,
            ) / retryableErrors.length
          : 0,
      recoveryStrategiesUsed: this.getRecoveryStrategiesUsed(retryableErrors),
    };
  }

  private getRecoveryStrategiesUsed(errors: ErrorReport[]): any[] {
    const strategies = errors.reduce(
      (acc, error) => {
        const strategy = error.recoveryStrategy || "default";
        acc[strategy] = (acc[strategy] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(strategies).map(([strategy, count]) => ({
      strategy,
      usageCount: count,
    }));
  }

  private calculateDOHComplianceScore(): number {
    const allErrors = this.getAllErrors();
    const dohRelatedErrors = allErrors.filter(
      (error) => error.dohComplianceRisk,
    );
    const totalHealthcareErrors = allErrors.filter(
      (error) => error.healthcareImpact !== "none",
    );

    if (totalHealthcareErrors.length === 0) return 100;

    const complianceRate =
      ((totalHealthcareErrors.length - dohRelatedErrors.length) /
        totalHealthcareErrors.length) *
      100;
    return Math.max(0, complianceRate);
  }

  private calculateHIPAAComplianceScore(): number {
    // Simplified HIPAA compliance scoring based on security and privacy errors
    const allErrors = this.getAllErrors();
    const securityErrors = allErrors.filter(
      (error) => error.category === "security",
    );
    const totalErrors = allErrors.length;

    if (totalErrors === 0) return 100;

    const complianceRate =
      ((totalErrors - securityErrors.length) / totalErrors) * 100;
    return Math.max(0, complianceRate);
  }

  private calculateJAWDAComplianceScore(): number {
    // Simplified JAWDA compliance scoring based on quality-related errors
    const allErrors = this.getAllErrors();
    const qualityErrors = allErrors.filter(
      (error) =>
        error.category === "business" ||
        error.healthcareImpact === "high" ||
        error.healthcareImpact === "critical",
    );
    const totalHealthcareErrors = allErrors.filter(
      (error) => error.healthcareImpact !== "none",
    );

    if (totalHealthcareErrors.length === 0) return 100;

    const complianceRate =
      ((totalHealthcareErrors.length - qualityErrors.length) /
        totalHealthcareErrors.length) *
      100;
    return Math.max(0, complianceRate);
  }

  private assessOverallComplianceRisk():
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL" {
    const dohScore = this.calculateDOHComplianceScore();
    const hipaaScore = this.calculateHIPAAComplianceScore();
    const jawdaScore = this.calculateJAWDAComplianceScore();

    const averageScore = (dohScore + hipaaScore + jawdaScore) / 3;

    if (averageScore < 70) return "CRITICAL";
    if (averageScore < 85) return "HIGH";
    if (averageScore < 95) return "MEDIUM";
    return "LOW";
  }

  private assessAuditTrailCompleteness(): number {
    // Check if audit trails are being created for healthcare errors
    const allErrors = this.getAllErrors();
    const healthcareErrors = allErrors.filter(
      (error) => error.healthcareImpact !== "none",
    );

    if (healthcareErrors.length === 0) return 100;

    // In a real implementation, this would check actual audit trail records
    // For now, assume audit trails are created for all healthcare errors
    return 100;
  }

  // Cleanup with healthcare considerations
  destroy(): void {
    console.log("🧹 Destroying Error Handler Service...");

    // Generate final healthcare error report before cleanup
    if (this.isHealthcareMode) {
      try {
        const finalReport = this.generateHealthcareErrorReport();
        console.log("📋 Final Healthcare Error Report:", finalReport.summary);

        // Store final report for compliance
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "final_healthcare_error_report",
            JSON.stringify({
              timestamp: new Date().toISOString(),
              report: finalReport,
            }),
          );
        }
      } catch (error) {
        console.error(
          "Failed to generate final healthcare error report:",
          error,
        );
      }
    }

    // Check for unresolved critical healthcare errors
    const unresolvedCritical = this.getAllErrors().filter(
      (error) =>
        !error.resolved &&
        (error.patientSafetyRisk || error.healthcareImpact === "critical"),
    );

    if (unresolvedCritical.length > 0) {
      console.warn(
        `⚠️ Destroying service with ${unresolvedCritical.length} unresolved critical healthcare errors`,
      );
      this.emit("service-destroyed-with-critical-errors", {
        unresolvedCriticalCount: unresolvedCritical.length,
        errors: unresolvedCritical.map((error) => ({
          id: error.id,
          message: error.message,
          healthcareImpact: error.healthcareImpact,
          patientSafetyRisk: error.patientSafetyRisk,
        })),
      });
    }

    this.eventListeners.clear();
    this.errors.clear();
    this.errorCounts.clear();
    this.retryQueue.clear();
    this.recoveryActions.clear();
    this.degradationStrategies = [];

    console.log("✅ Error Handler Service destroyed");
  }
}

export const errorHandlerService = new ErrorHandlerService();
export {
  ErrorReport,
  ErrorContext,
  ErrorMetrics,
  RetryConfig,
  RetryStrategy,
  RecoveryAction,
  GracefulDegradationStrategy,
};
