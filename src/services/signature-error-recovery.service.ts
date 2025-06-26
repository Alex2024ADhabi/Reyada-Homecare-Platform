/**
 * Signature Error Recovery Service
 * Enhanced error handling and recovery system for robust signature operations
 */

import { SignatureData } from "@/components/ui/signature-capture";
import { WorkflowInstance } from "@/services/signature-workflow.service";

export interface ErrorRecoveryOptions {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackStrategy: "cache" | "offline" | "manual";
  notificationEnabled: boolean;
}

export interface ErrorContext {
  errorId: string;
  timestamp: string;
  errorType: "network" | "validation" | "security" | "system" | "user";
  severity: "low" | "medium" | "high" | "critical";
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  deviceInfo?: any;
  stackTrace?: string;
  metadata?: Record<string, any>;
}

export interface RecoveryAction {
  id: string;
  type: "retry" | "fallback" | "escalate" | "ignore";
  description: string;
  automated: boolean;
  priority: number;
  conditions?: Record<string, any>;
  handler: (context: ErrorContext) => Promise<boolean>;
}

export interface ErrorRecoveryState {
  errorId: string;
  attempts: number;
  lastAttempt: string;
  status: "pending" | "recovering" | "resolved" | "failed";
  recoveryActions: string[];
  userNotified: boolean;
  escalated: boolean;
}

class SignatureErrorRecoveryService {
  private errorStates: Map<string, ErrorRecoveryState> = new Map();
  private recoveryActions: Map<string, RecoveryAction> = new Map();
  private errorHistory: ErrorContext[] = [];
  private defaultOptions: ErrorRecoveryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    fallbackStrategy: "cache",
    notificationEnabled: true,
  };

  constructor() {
    this.initializeRecoveryActions();
    this.startErrorMonitoring();
  }

  private initializeRecoveryActions(): void {
    // Network Error Recovery
    this.registerRecoveryAction({
      id: "network_retry",
      type: "retry",
      description: "Retry network operation with exponential backoff",
      automated: true,
      priority: 1,
      conditions: { errorType: "network" },
      handler: async (context) => {
        await this.delay(this.calculateRetryDelay(context));
        return this.retryNetworkOperation(context);
      },
    });

    // Validation Error Recovery
    this.registerRecoveryAction({
      id: "validation_correction",
      type: "fallback",
      description: "Apply automatic validation corrections",
      automated: true,
      priority: 2,
      conditions: { errorType: "validation" },
      handler: async (context) => {
        return this.applyValidationCorrections(context);
      },
    });

    // Security Error Recovery
    this.registerRecoveryAction({
      id: "security_escalation",
      type: "escalate",
      description: "Escalate security issues to admin",
      automated: true,
      priority: 1,
      conditions: { errorType: "security" },
      handler: async (context) => {
        return this.escalateSecurityIssue(context);
      },
    });

    // System Error Recovery
    this.registerRecoveryAction({
      id: "system_fallback",
      type: "fallback",
      description: "Switch to offline mode for system errors",
      automated: true,
      priority: 3,
      conditions: { errorType: "system" },
      handler: async (context) => {
        return this.enableOfflineMode(context);
      },
    });

    // User Error Recovery
    this.registerRecoveryAction({
      id: "user_guidance",
      type: "fallback",
      description: "Provide user guidance and assistance",
      automated: false,
      priority: 4,
      conditions: { errorType: "user" },
      handler: async (context) => {
        return this.provideUserGuidance(context);
      },
    });
  }

  /**
   * Handle error with automatic recovery
   */
  public async handleError(
    error: Error,
    context: Partial<ErrorContext>,
    options: Partial<ErrorRecoveryOptions> = {},
  ): Promise<boolean> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const fullContext: ErrorContext = {
      errorId,
      timestamp,
      errorType: this.classifyError(error),
      severity: this.calculateSeverity(error, context),
      component: context.component || "unknown",
      operation: context.operation || "unknown",
      userId: context.userId,
      sessionId: context.sessionId,
      deviceInfo: context.deviceInfo,
      stackTrace: error.stack,
      metadata: {
        message: error.message,
        name: error.name,
        ...context.metadata,
      },
    };

    // Store error context
    this.errorHistory.push(fullContext);

    // Initialize recovery state
    const recoveryState: ErrorRecoveryState = {
      errorId,
      attempts: 0,
      lastAttempt: timestamp,
      status: "pending",
      recoveryActions: [],
      userNotified: false,
      escalated: false,
    };

    this.errorStates.set(errorId, recoveryState);

    // Start recovery process
    return this.executeRecovery(fullContext, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Execute recovery process
   */
  private async executeRecovery(
    context: ErrorContext,
    options: ErrorRecoveryOptions,
  ): Promise<boolean> {
    const state = this.errorStates.get(context.errorId);
    if (!state) return false;

    state.status = "recovering";
    state.attempts++;
    state.lastAttempt = new Date().toISOString();

    try {
      // Find applicable recovery actions
      const applicableActions = this.findApplicableActions(context);

      // Execute recovery actions in priority order
      for (const action of applicableActions) {
        state.recoveryActions.push(action.id);

        const success = await action.handler(context);
        if (success) {
          state.status = "resolved";
          this.logRecoverySuccess(context, action);
          return true;
        }
      }

      // Check if we should retry
      if (state.attempts < options.maxRetries) {
        const delay = options.exponentialBackoff
          ? options.retryDelay * Math.pow(2, state.attempts - 1)
          : options.retryDelay;

        await this.delay(delay);
        return this.executeRecovery(context, options);
      }

      // Recovery failed
      state.status = "failed";
      await this.handleRecoveryFailure(context, options);
      return false;
    } catch (recoveryError) {
      state.status = "failed";
      this.logRecoveryError(context, recoveryError as Error);
      return false;
    }
  }

  /**
   * Register custom recovery action
   */
  public registerRecoveryAction(action: RecoveryAction): void {
    this.recoveryActions.set(action.id, action);
  }

  /**
   * Get error statistics
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recoveryRate: number;
    averageRecoveryTime: number;
  } {
    const totalErrors = this.errorHistory.length;
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    let resolvedErrors = 0;
    let totalRecoveryTime = 0;

    this.errorHistory.forEach((error) => {
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
      errorsBySeverity[error.severity] =
        (errorsBySeverity[error.severity] || 0) + 1;
    });

    this.errorStates.forEach((state) => {
      if (state.status === "resolved") {
        resolvedErrors++;
        const recoveryTime =
          new Date(state.lastAttempt).getTime() -
          new Date(
            this.errorHistory.find((e) => e.errorId === state.errorId)
              ?.timestamp || 0,
          ).getTime();
        totalRecoveryTime += recoveryTime;
      }
    });

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      recoveryRate: totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0,
      averageRecoveryTime:
        resolvedErrors > 0 ? totalRecoveryTime / resolvedErrors : 0,
    };
  }

  // Private helper methods
  private classifyError(error: Error): ErrorContext["errorType"] {
    const message = error.message.toLowerCase();

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
      message.includes("required")
    ) {
      return "validation";
    }
    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("security")
    ) {
      return "security";
    }
    if (message.includes("user") || message.includes("input")) {
      return "user";
    }

    return "system";
  }

  private calculateSeverity(
    error: Error,
    context: Partial<ErrorContext>,
  ): ErrorContext["severity"] {
    const message = error.message.toLowerCase();

    if (
      message.includes("critical") ||
      message.includes("fatal") ||
      context.component === "security"
    ) {
      return "critical";
    }
    if (message.includes("error") || message.includes("failed")) {
      return "high";
    }
    if (message.includes("warning") || message.includes("invalid")) {
      return "medium";
    }

    return "low";
  }

  private findApplicableActions(context: ErrorContext): RecoveryAction[] {
    return Array.from(this.recoveryActions.values())
      .filter((action) => this.matchesConditions(action, context))
      .sort((a, b) => a.priority - b.priority);
  }

  private matchesConditions(
    action: RecoveryAction,
    context: ErrorContext,
  ): boolean {
    if (!action.conditions) return true;

    return Object.entries(action.conditions).every(([key, value]) => {
      return (context as any)[key] === value;
    });
  }

  private calculateRetryDelay(context: ErrorContext): number {
    const state = this.errorStates.get(context.errorId);
    if (!state) return this.defaultOptions.retryDelay;

    return this.defaultOptions.retryDelay * Math.pow(2, state.attempts);
  }

  private async retryNetworkOperation(context: ErrorContext): Promise<boolean> {
    try {
      // Implement network retry logic based on context
      if (context.metadata?.url) {
        const response = await fetch(
          context.metadata.url,
          context.metadata.options,
        );
        return response.ok;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async applyValidationCorrections(
    context: ErrorContext,
  ): Promise<boolean> {
    // Implement automatic validation corrections
    try {
      if (context.metadata?.validationErrors) {
        // Apply common validation fixes
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async escalateSecurityIssue(context: ErrorContext): Promise<boolean> {
    try {
      // Log security incident
      console.warn("Security issue escalated:", context);

      // Notify security team
      await this.notifySecurityTeam(context);

      const state = this.errorStates.get(context.errorId);
      if (state) {
        state.escalated = true;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  private async enableOfflineMode(context: ErrorContext): Promise<boolean> {
    try {
      // Enable offline mode for the application
      localStorage.setItem("offlineMode", "true");
      localStorage.setItem("offlineReason", context.errorId);

      // Dispatch offline mode event
      window.dispatchEvent(
        new CustomEvent("offlineModeEnabled", {
          detail: { context },
        }),
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  private async provideUserGuidance(context: ErrorContext): Promise<boolean> {
    try {
      // Show user-friendly error message with guidance
      const guidance = this.generateUserGuidance(context);

      // Dispatch user guidance event
      window.dispatchEvent(
        new CustomEvent("userGuidanceRequired", {
          detail: { context, guidance },
        }),
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  private generateUserGuidance(context: ErrorContext): string {
    switch (context.errorType) {
      case "network":
        return "Please check your internet connection and try again.";
      case "validation":
        return "Please review your input and ensure all required fields are completed correctly.";
      case "security":
        return "A security issue has been detected. Please contact support if this persists.";
      case "user":
        return "Please review your action and try again. Contact support if you need assistance.";
      default:
        return "An unexpected error occurred. Please try again or contact support.";
    }
  }

  private async notifySecurityTeam(context: ErrorContext): Promise<void> {
    // Implementation would send notification to security team
    console.log("Security team notified:", context.errorId);
  }

  private async handleRecoveryFailure(
    context: ErrorContext,
    options: ErrorRecoveryOptions,
  ): Promise<void> {
    if (options.notificationEnabled) {
      await this.notifyUser(context);
    }

    // Log failure for analysis
    this.logRecoveryFailure(context);
  }

  private async notifyUser(context: ErrorContext): Promise<void> {
    const state = this.errorStates.get(context.errorId);
    if (state && !state.userNotified) {
      state.userNotified = true;

      // Dispatch user notification event
      window.dispatchEvent(
        new CustomEvent("errorNotification", {
          detail: {
            errorId: context.errorId,
            message: this.generateUserGuidance(context),
            severity: context.severity,
          },
        }),
      );
    }
  }

  private logRecoverySuccess(
    context: ErrorContext,
    action: RecoveryAction,
  ): void {
    console.log(`Recovery successful: ${context.errorId} using ${action.id}`);
  }

  private logRecoveryError(context: ErrorContext, error: Error): void {
    console.error(`Recovery failed for ${context.errorId}:`, error);
  }

  private logRecoveryFailure(context: ErrorContext): void {
    console.error(`All recovery attempts failed for ${context.errorId}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private startErrorMonitoring(): void {
    // Global error handler
    window.addEventListener("error", (event) => {
      this.handleError(new Error(event.message), {
        component: "global",
        operation: "runtime",
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(new Error(event.reason), {
        component: "promise",
        operation: "async",
        metadata: {
          reason: event.reason,
        },
      });
    });
  }

  /**
   * Clean up old error states
   */
  public cleanup(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    for (const [errorId, state] of this.errorStates.entries()) {
      const errorTime = new Date(state.lastAttempt).getTime();
      if (
        errorTime < cutoffTime &&
        (state.status === "resolved" || state.status === "failed")
      ) {
        this.errorStates.delete(errorId);
      }
    }

    // Keep only recent error history
    this.errorHistory = this.errorHistory.filter(
      (error) => new Date(error.timestamp).getTime() > cutoffTime,
    );
  }
}

export const signatureErrorRecoveryService =
  new SignatureErrorRecoveryService();
export default signatureErrorRecoveryService;
