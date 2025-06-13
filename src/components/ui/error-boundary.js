import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Component } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react";
import { errorHandler } from "@/utils/errorHandler";
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "logErrorToService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (error, errorInfo) => {
                // In a real app, you would send this to your error tracking service
                // like Sentry, LogRocket, or Bugsnag
                const errorReport = {
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    errorId: this.state.errorId,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                };
                console.error("Error reported to service:", errorReport);
                // Example: Send to error tracking service
                // errorTrackingService.captureException(error, {
                //   extra: errorReport,
                //   tags: {
                //     component: 'ErrorBoundary',
                //     errorId: this.state.errorId,
                //   },
                // });
            }
        });
        Object.defineProperty(this, "handleRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorId: null,
                });
            }
        });
        Object.defineProperty(this, "handleReload", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                window.location.reload();
            }
        });
        Object.defineProperty(this, "handleGoHome", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                window.location.href = "/";
            }
        });
        Object.defineProperty(this, "copyErrorDetails", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const { error, errorInfo, errorId } = this.state;
                const errorDetails = {
                    errorId,
                    message: error?.message,
                    stack: error?.stack,
                    componentStack: errorInfo?.componentStack,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                };
                navigator.clipboard
                    .writeText(JSON.stringify(errorDetails, null, 2))
                    .then(() => {
                    alert("Error details copied to clipboard");
                })
                    .catch(() => {
                    console.error("Failed to copy error details");
                });
            }
        });
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error to our error handling system
        errorHandler.logError(error, "ErrorBoundary");
        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        this.setState({
            errorInfo,
        });
        // Log to external service in production
        if (process.env.NODE_ENV === "production") {
            this.logErrorToService(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "max-w-2xl w-full", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsx(CardTitle, { className: "text-xl text-red-600", children: "Oops! Something went wrong" }), _jsx(CardDescription, { children: "We encountered an unexpected error. Our team has been notified." })] }), _jsxs(CardContent, { className: "space-y-4", children: [this.state.errorId && (_jsxs("div", { className: "bg-gray-100 p-3 rounded-lg", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [_jsx("strong", { children: "Error ID:" }), " ", this.state.errorId] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Please include this ID when contacting support" })] })), process.env.NODE_ENV === "development" && this.state.error && (_jsxs("details", { className: "bg-red-50 p-3 rounded-lg", children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium text-red-800 mb-2", children: "Error Details (Development)" }), _jsxs("div", { className: "text-xs text-red-700 space-y-2", children: [_jsxs("div", { children: [_jsx("strong", { children: "Message:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap", children: this.state.error.message })] }), this.state.error.stack && (_jsxs("div", { children: [_jsx("strong", { children: "Stack Trace:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap text-xs overflow-x-auto", children: this.state.error.stack })] })), this.state.errorInfo?.componentStack && (_jsxs("div", { children: [_jsx("strong", { children: "Component Stack:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap text-xs overflow-x-auto", children: this.state.errorInfo.componentStack })] }))] })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs(Button, { onClick: this.handleRetry, className: "flex-1", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Try Again"] }), _jsxs(Button, { variant: "outline", onClick: this.handleReload, className: "flex-1", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Reload Page"] }), _jsxs(Button, { variant: "outline", onClick: this.handleGoHome, className: "flex-1", children: [_jsx(Home, { className: "h-4 w-4 mr-2" }), "Go Home"] })] }), _jsx("div", { className: "pt-2 border-t", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: this.copyErrorDetails, className: "w-full text-gray-600", children: [_jsx(Bug, { className: "h-4 w-4 mr-2" }), "Copy Error Details"] }) }), _jsx("div", { className: "text-center text-sm text-gray-500", children: _jsxs("p", { children: ["If this problem persists, please contact our support team at", " ", _jsx("a", { href: "mailto:support@reyada.com", className: "text-blue-600 hover:underline", children: "support@reyada.com" })] }) })] })] }) }));
        }
        return this.props.children;
    }
}
// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps) => {
    const WrappedComponent = (props) => (_jsx(ErrorBoundary, { ...errorBoundaryProps, children: _jsx(Component, { ...props }) }));
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
};
// Hook for error reporting
export const useErrorHandler = () => {
    const reportError = React.useCallback((error, context) => {
        errorHandler.logError(error, context || "useErrorHandler");
    }, []);
    return { reportError };
};
export default ErrorBoundary;
