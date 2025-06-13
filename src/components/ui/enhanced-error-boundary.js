import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Bug, Clock, User, Code, Database, Shield, Activity, FileText, Download, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
/**
 * Enhanced Error Boundary with comprehensive error handling,
 * recovery mechanisms, and DOH compliance features
 */
export class EnhancedErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "retryTimeoutId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "errorReportingEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceObserver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "memoryMonitorInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "errorStartTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "attemptRecovery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (this.state.recoveryAttempts >= (this.props.maxRetries || 3)) {
                    console.warn("Maximum recovery attempts reached");
                    return;
                }
                this.setState({ isRecovering: true });
                // Attempt recovery after a delay
                this.retryTimeoutId = setTimeout(() => {
                    this.setState((prevState) => ({
                        hasError: false,
                        error: null,
                        errorInfo: null,
                        isRecovering: false,
                        recoveryAttempts: prevState.recoveryAttempts + 1,
                        retryCount: prevState.retryCount + 1,
                    }));
                }, 2000 * (this.state.recoveryAttempts + 1)); // Exponential backoff
            }
        });
        Object.defineProperty(this, "resetErrorState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorId: "",
                    isRecovering: false,
                    retryCount: 0,
                    recoveryAttempts: 0,
                });
            }
        });
        Object.defineProperty(this, "handleManualRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.resetErrorState();
            }
        });
        Object.defineProperty(this, "handleDownloadErrorReport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
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
            }
        });
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
    static getDerivedStateFromError(error) {
        const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const severity = EnhancedErrorBoundary.assessErrorSeverity(error);
        return {
            hasError: true,
            error,
            errorId,
            errorSeverity: severity,
            affectedComponents: EnhancedErrorBoundary.extractAffectedComponents(error),
        };
    }
    componentDidCatch(error, errorInfo) {
        this.errorStartTime = performance.now();
        const errorId = this.state.errorId ||
            `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const severity = EnhancedErrorBoundary.assessErrorSeverity(error);
        const affectedComponents = EnhancedErrorBoundary.extractAffectedComponents(error);
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
    componentDidUpdate(prevProps) {
        // Reset error state if props changed and resetOnPropsChange is enabled
        if (this.props.resetOnPropsChange && this.state.hasError) {
            const propsChanged = JSON.stringify(prevProps) !== JSON.stringify(this.props);
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
    setupPerformanceMonitoring() {
        if (typeof PerformanceObserver !== "undefined") {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const renderTime = entries.reduce((total, entry) => total + entry.duration, 0);
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
            }
            catch (error) {
                console.warn("Performance monitoring not available:", error);
            }
        }
    }
    setupMemoryMonitoring() {
        this.memoryMonitorInterval = setInterval(() => {
            const memoryUsage = this.getMemoryUsage();
            this.setState({ memoryUsage });
        }, 5000);
    }
    getMemoryUsage() {
        if (typeof performance !== "undefined" && performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }
    static assessErrorSeverity(error) {
        const errorMessage = error.message.toLowerCase();
        const errorStack = error.stack?.toLowerCase() || "";
        // Critical errors
        if (errorMessage.includes("security") ||
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("authentication") ||
            errorMessage.includes("patient") ||
            errorMessage.includes("medical") ||
            errorMessage.includes("hipaa") ||
            errorMessage.includes("doh")) {
            return "critical";
        }
        // High severity errors
        if (errorMessage.includes("network") ||
            errorMessage.includes("database") ||
            errorMessage.includes("api") ||
            errorMessage.includes("server") ||
            errorStack.includes("fetch") ||
            errorStack.includes("axios")) {
            return "high";
        }
        // Medium severity errors
        if (errorMessage.includes("validation") ||
            errorMessage.includes("format") ||
            errorMessage.includes("parse") ||
            errorMessage.includes("render")) {
            return "medium";
        }
        return "low";
    }
    static extractAffectedComponents(error) {
        const components = [];
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
    logEnhancedError(error, errorInfo, errorId, severity) {
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
        }
        else {
            console.error("Enhanced Error Boundary - Error (validation failed):", error);
        }
    }
    async reportError(error, errorInfo, errorId, severity) {
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
        }
        catch (reportingError) {
            console.error("Failed to report error:", reportingError);
        }
    }
    escalateError(errorReport) {
        // In a real application, this would escalate to appropriate channels
        console.error("CRITICAL ERROR ESCALATED:", errorReport);
        // For healthcare applications, this might involve:
        // - Notifying system administrators
        // - Creating incident tickets
        // - Alerting compliance officers
        // - Logging to audit trails
    }
    getCurrentUserId() {
        // In a real application, get from authentication context
        return "anonymous";
    }
    getSessionId() {
        // In a real application, get from session management
        return sessionStorage.getItem("sessionId") || "unknown";
    }
    getSeverityColor(severity) {
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
    getSeverityIcon(severity) {
        switch (severity) {
            case "critical":
                return _jsx(AlertTriangle, { className: "h-4 w-4" });
            case "high":
                return _jsx(Bug, { className: "h-4 w-4" });
            case "medium":
                return _jsx(Activity, { className: "h-4 w-4" });
            case "low":
                return _jsx(FileText, { className: "h-4 w-4" });
            default:
                return _jsx(AlertTriangle, { className: "h-4 w-4" });
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
                return (_jsxs(Card, { className: "w-full max-w-2xl mx-auto mt-8 bg-blue-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-blue-700", children: [_jsx(RefreshCw, { className: "h-5 w-5 animate-spin" }), "Attempting Recovery"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-blue-600", children: "The system is attempting to recover from the error. Please wait..." }), _jsx("div", { className: "mt-4", children: _jsxs("div", { className: "text-sm text-blue-500", children: ["Recovery attempt ", this.state.recoveryAttempts + 1, " of", " ", this.props.maxRetries || 3] }) })] })] }));
            }
            // Enhanced error display
            return (_jsxs("div", { className: "w-full max-w-4xl mx-auto mt-8 space-y-6 bg-white", children: [_jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-red-700", children: [this.getSeverityIcon(this.state.errorSeverity), "Application Error Detected", _jsx(Badge, { variant: this.getSeverityColor(this.state.errorSeverity), children: this.state.errorSeverity.toUpperCase() })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["An unexpected error occurred. The development team has been notified.", this.state.errorSeverity === "critical" && (_jsx("span", { className: "block mt-2 font-semibold text-red-600", children: "This is a critical error that may affect system security or patient data." }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Bug, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Error ID:" }), _jsx("code", { className: "bg-gray-100 px-2 py-1 rounded text-xs", children: this.state.errorId })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Occurred:" }), _jsx("span", { children: new Date().toLocaleString() })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(User, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "User:" }), _jsx("span", { children: this.getCurrentUserId() })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Database, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Memory Usage:" }), _jsxs("span", { children: [(this.state.memoryUsage / 1024 / 1024).toFixed(2), " MB"] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Activity, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Error Count:" }), _jsx("span", { children: this.state.performanceImpact.errorCount })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium", children: "Retry Count:" }), _jsx("span", { children: this.state.retryCount })] })] })] }), this.state.affectedComponents.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-sm mb-2 flex items-center gap-2", children: [_jsx(Code, { className: "h-4 w-4" }), "Affected Components:"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: this.state.affectedComponents.map((component, index) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: component }, index))) })] })), _jsxs("div", { className: "flex flex-wrap gap-2 pt-4", children: [_jsxs(Button, { onClick: this.handleManualRetry, className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Try Again"] }), this.props.enableRecovery &&
                                                this.state.recoveryAttempts <
                                                    (this.props.maxRetries || 3) && (_jsxs(Button, { onClick: this.attemptRecovery, variant: "outline", className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4" }), "Auto Recovery"] })), _jsxs(Button, { onClick: this.handleDownloadErrorReport, variant: "outline", className: "flex items-center gap-2", children: [_jsx(Download, { className: "h-4 w-4" }), "Download Report"] }), _jsxs(Button, { onClick: () => window.location.reload(), variant: "outline", className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Reload Page"] })] })] })] }), process.env.NODE_ENV === "development" && this.state.error && (_jsxs(Card, { className: "border-gray-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-gray-700 text-sm", children: "Technical Details (Development)" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Error Message:" }), _jsx("code", { className: "block bg-gray-100 p-3 rounded text-sm overflow-x-auto", children: this.state.error.message })] }), this.state.error.stack && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Stack Trace:" }), _jsx("code", { className: "block bg-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap", children: this.state.error.stack })] })), this.state.errorInfo && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Component Stack:" }), _jsx("code", { className: "block bg-gray-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap", children: this.state.errorInfo.componentStack })] }))] }) })] })), this.state.errorHistory.length > 0 && (_jsxs(Card, { className: "border-gray-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-gray-700 text-sm", children: "Recent Error History" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: this.state.errorHistory
                                        .slice(-3)
                                        .map((errorEntry, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: errorEntry.errorId }), _jsxs("span", { className: "text-sm text-gray-600", children: [errorEntry.error.message.substring(0, 50), "..."] })] }), _jsx("span", { className: "text-xs text-gray-500", children: errorEntry.timestamp.toLocaleTimeString() })] }, index))) }) })] }))] }));
        }
        return this.props.children;
    }
}
export default EnhancedErrorBoundary;
