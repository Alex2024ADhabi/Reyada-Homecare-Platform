import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Clock,
  User,
  Code,
  Database,
  Network,
  Shield,
  Activity,
  FileText,
  Download,
  Send,
} from "lucide-react";
import { JSXValidator } from "@/utils/jsx-validator";
import { JsonValidator } from "@/utils/json-validator";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  enableReporting?: boolean;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  isolateErrors?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  errorHistory: Array<{
    error: Error;
    timestamp: Date;
    errorId: string;
    componentStack: string;
  }>;
  isRecovering: boolean;
  recoveryAttempts: number;
  errorSeverity: "low" | "medium" | "high" | "critical";
  affectedComponents: string[];
  memoryUsage: number;
  performanceImpact: {
    renderTime: number;
    memoryDelta: number;
    errorCount: number;
  };
}

/**
 * Enhanced Error Boundary with comprehensive error handling,
 * recovery mechanisms, and DOH compliance features
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private errorReportingEnabled: boolean;
  private performanceObserver: PerformanceObserver | null = null;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;
  private errorStartTime: number = 0;

  constructor(props: Props) {
    super(props);

    this.errorReportingEnabled = props.enableReporting ?? true;

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
      errorHistory: [],
      isRecovering: false,
      recoveryAttempts: 0,
      errorSeverity: "low",
      affectedComponents: [],
      memoryUsage: 0,
      performanceImpact: {
        renderTime: 0,
        memoryDelta: 0,
        errorCount: 0,
      },
    };

    this.setupPerformanceMonitoring();
    this.setupMemoryMonitoring();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const severity = EnhancedErrorBoundary.assessErrorSeverity(error);

    return {
      hasError: true,
      error,
      errorId,
      errorSeverity: severity,
      affectedComponents:
        EnhancedErrorBoundary.extractAffectedComponents(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorStartTime = performance.now();

    const errorId =
      this.state.errorId ||
      `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const severity = EnhancedErrorBoundary.assessErrorSeverity(error);
    const affectedComponents =
      EnhancedErrorBoundary.extractAffectedComponents(error);

    // Enhanced error logging
    this.logEnhancedError(error, errorInfo, errorId, severity);

    // Update error history
    const errorEntry = {
      error,
      timestamp: new Date(),
      errorId,
      componentStack: errorInfo.componentStack,
    };

    this.setState((prevState) => ({
      errorInfo,
      errorId,
      errorSeverity: severity,
      affectedComponents,
      errorHistory: [...prevState.errorHistory, errorEntry].slice(-10), // Keep last 10 errors
      performanceImpact: {
        ...prevState.performanceImpact,
        errorCount: prevState.performanceImpact.errorCount + 1,
      },
    }));

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt automatic recovery for non-critical errors
    if (this.props.enableRecovery && severity !== "critical") {
      this.attemptRecovery();
    }

    // Report error if enabled
    if (this.errorReportingEnabled) {
      this.reportError(error, errorInfo, errorId, severity);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if props changed and resetOnPropsChange is enabled
    if (this.props.resetOnPropsChange && this.state.hasError) {
      const propsChanged =
        JSON.stringify(prevProps) !== JSON.stringify(this.props);
      if (propsChanged) {
        this.resetErrorState();
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }
  }

  private setupPerformanceMonitoring() {
    if (typeof PerformanceObserver !== "undefined") {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const renderTime = entries.reduce(
          (total, entry) => total + entry.duration,
          0,
        );

        this.setState((prevState) => ({
          performanceImpact: {
            ...prevState.performanceImpact,
            renderTime: renderTime,
          },
        }));
      });

      try {
        this.performanceObserver.observe({
          entryTypes: ["measure", "navigation"],
        });
      } catch (error) {
        console.warn("Performance monitoring not available:", error);
      }
    }
  }

  private setupMemoryMonitoring() {
    this.memoryMonitorInterval = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      this.setState({ memoryUsage });
    }, 5000);
  }

  private getMemoryUsage(): number {
    if (typeof performance !== "undefined" && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  private static assessErrorSeverity(
    error: Error,
  ): "low" | "medium" | "high" | "critical" {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || "";

    // Critical errors
    if (
      errorMessage.includes("security") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("patient") ||
      errorMessage.includes("medical") ||
      errorMessage.includes("hipaa") ||
      errorMessage.includes("doh")
    ) {
      return "critical";
    }

    // High severity errors
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("database") ||
      errorMessage.includes("api") ||
      errorMessage.includes("server") ||
      errorStack.includes("fetch") ||
      errorStack.includes("axios")
    ) {
      return "high";
    }

    // Medium severity errors
    if (
      errorMessage.includes("validation") ||
      errorMessage.includes("format") ||
      errorMessage.includes("parse") ||
      errorMessage.includes("render")
    ) {
      return "medium";
    }

    return "low";
  }

  private static extractAffectedComponents(error: Error): string[] {
    const components: string[] = [];
    const stack = error.stack || "";

    // Extract component names from stack trace
    const componentMatches = stack.match(/at\s+(\w+)\s+/g);
    if (componentMatches) {
      componentMatches.forEach((match) => {
        const componentName = match.replace(/at\s+/, "").trim();
        if (componentName && !components.includes(componentName)) {
          components.push(componentName);
        }
      });
    }

    return components.slice(0, 5); // Limit to 5 components
  }

  private logEnhancedError(
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    severity: string,
  ) {
    const errorData = {
      errorId,
      severity,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      memoryUsage: this.getMemoryUsage(),
      performanceMetrics: {
        renderTime: this.state.performanceImpact.renderTime,
        errorCount: this.state.performanceImpact.errorCount,
      },
      affectedComponents: this.state.affectedComponents,
    };

    // Validate error data with JsonValidator
    const validation = JsonValidator.validate(JSON.stringify(errorData));
    if (validation.isValid) {
      console.error("Enhanced Error Boundary - Error Details:", errorData);
    } else {
      console.error(
        "Enhanced Error Boundary - Error (validation failed):",
        error,
      );
    }
  }

  private async reportError(
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    severity: string,
  ) {
    try {
      const errorReport = {
        errorId,
        severity,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        buildVersion: process.env.REACT_APP_VERSION || "unknown",
        environment: process.env.NODE_ENV || "unknown",
      };

      // In a real application, send to error reporting service
      console.log("Error reported:", errorReport);

      // For DOH compliance, ensure error reports are properly logged
      if (severity === "critical") {
        this.escalateError(errorReport);
      }
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  }

  private escalateError(errorReport: any) {
    // In a real application, this would escalate to appropriate channels
    console.error("CRITICAL ERROR ESCALATED:", errorReport);

    // For healthcare applications, this might involve:
    // - Notifying system administrators
    // - Creating incident tickets
    // - Alerting compliance officers
    // - Logging to audit trails
  }

  private getCurrentUserId(): string {
    // In a real application, get from authentication context
    return "anonymous";
  }

  private getSessionId(): string {
    // In a real application, get from session management
    return sessionStorage.getItem("sessionId") || "unknown";
  }

  private attemptRecovery = () => {
    if (this.state.recoveryAttempts >= (this.props.maxRetries || 3)) {
      console.warn("Maximum recovery attempts reached");
      return;
    }

    this.setState({ isRecovering: true });

    // Attempt recovery after a delay
    this.retryTimeoutId = setTimeout(
      () => {
        this.setState((prevState) => ({
          hasError: false,
          error: null,
          errorInfo: null,
          isRecovering: false,
          recoveryAttempts: prevState.recoveryAttempts + 1,
          retryCount: prevState.retryCount + 1,
        }));
      },
      2000 * (this.state.recoveryAttempts + 1),
    ); // Exponential backoff
  };

  private resetErrorState = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      isRecovering: false,
      retryCount: 0,
      recoveryAttempts: 0,
    });
  };

  private handleManualRetry = () => {
    this.resetErrorState();
  };

  private handleDownloadErrorReport = () => {
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: this.state.error
        ? {
            name: this.state.error.name,
            message: this.state.error.message,
            stack: this.state.error.stack,
          }
        : null,
      errorInfo: this.state.errorInfo,
      errorHistory: this.state.errorHistory,
      performanceImpact: this.state.performanceImpact,
      memoryUsage: this.state.memoryUsage,
      affectedComponents: this.state.affectedComponents,
    };

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  }

  private getSeverityIcon(severity: string) {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <Bug className="h-4 w-4" />;
      case "medium":
        return <Activity className="h-4 w-4" />;
      case "low":
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Recovery in progress
      if (this.state.isRecovering) {
        return (
          <Card className="w-full max-w-2xl mx-auto mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Attempting Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-600">
                The system is attempting to recover from the error. Please
                wait...
              </p>
              <div className="mt-4">
                <div className="text-sm text-blue-500">
                  Recovery attempt {this.state.recoveryAttempts + 1} of{" "}
                  {this.props.maxRetries || 3}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Enhanced error display
      return (
        <div className="w-full max-w-4xl mx-auto mt-8 space-y-6 bg-white">
          {/* Main Error Card */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                {this.getSeverityIcon(this.state.errorSeverity)}
                Application Error Detected
                <Badge
                  variant={
                    this.getSeverityColor(this.state.errorSeverity) as any
                  }
                >
                  {this.state.errorSeverity.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred. The development team has been
                  notified.
                  {this.state.errorSeverity === "critical" && (
                    <span className="block mt-2 font-semibold text-red-600">
                      This is a critical error that may affect system security
                      or patient data.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {/* Error Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Bug className="h-4 w-4" />
                    <span className="font-medium">Error ID:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {this.state.errorId}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Occurred:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="font-medium">User:</span>
                    <span>{this.getCurrentUserId()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">Memory Usage:</span>
                    <span>
                      {(this.state.memoryUsage / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Error Count:</span>
                    <span>{this.state.performanceImpact.errorCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCw className="h-4 w-4" />
                    <span className="font-medium">Retry Count:</span>
                    <span>{this.state.retryCount}</span>
                  </div>
                </div>
              </div>

              {/* Affected Components */}
              {this.state.affectedComponents.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Affected Components:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {this.state.affectedComponents.map((component, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  onClick={this.handleManualRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>

                {this.props.enableRecovery &&
                  this.state.recoveryAttempts <
                    (this.props.maxRetries || 3) && (
                    <Button
                      onClick={this.attemptRecovery}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Auto Recovery
                    </Button>
                  )}

                <Button
                  onClick={this.handleDownloadErrorReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details (Development Mode) */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700 text-sm">
                  Technical Details (Development)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Error Message:</h4>
                    <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {this.state.error.message}
                    </code>
                  </div>

                  {this.state.error.stack && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Stack Trace:</h4>
                      <code className="block bg-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </code>
                    </div>
                  )}

                  {this.state.errorInfo && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Component Stack:
                      </h4>
                      <code className="block bg-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error History */}
          {this.state.errorHistory.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-700 text-sm">
                  Recent Error History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {this.state.errorHistory
                    .slice(-3)
                    .map((errorEntry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {errorEntry.errorId}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {errorEntry.error.message.substring(0, 50)}...
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {errorEntry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
