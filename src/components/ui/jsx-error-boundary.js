import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Code, Wrench } from "lucide-react";
import { jsxErrorHandler } from "@/services/jsx-error-handler.service";
export class JSXErrorBoundary extends Component {
    constructor(props) {
        super(props);
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
                    jsxErrorHandled: false,
                    autoFixSuggestion: undefined,
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
                    componentName: this.props.componentName,
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
            jsxErrorHandled: false,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorId: `jsx-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error("JSX Error caught by boundary:", error, errorInfo);
        // Handle JSX-specific errors
        const jsxHandling = jsxErrorHandler.handleJSXError(error, this.props.componentName);
        this.setState({
            errorInfo,
            jsxErrorHandled: jsxHandling.handled,
            autoFixSuggestion: jsxHandling.suggestion,
        });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            const isJSXError = this.state.error?.message.toLowerCase().includes("jsx") ||
                this.state.error?.message.toLowerCase().includes("unexpected token") ||
                this.state.error?.message
                    .toLowerCase()
                    .includes("expected jsx identifier");
            return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "max-w-3xl w-full", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4", children: isJSXError ? (_jsx(Code, { className: "h-6 w-6 text-red-600" })) : (_jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" })) }), _jsx(CardTitle, { className: "text-xl text-red-600", children: isJSXError ? "JSX Parsing Error" : "Component Error" })] }), _jsxs(CardContent, { className: "space-y-4", children: [this.state.errorId && (_jsxs("div", { className: "bg-gray-100 p-3 rounded-lg", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [_jsx("strong", { children: "Error ID:" }), " ", this.state.errorId] }), this.props.componentName && (_jsxs("p", { className: "text-sm text-gray-600", children: [_jsx("strong", { children: "Component:" }), " ", this.props.componentName] }))] })), this.state.jsxErrorHandled && this.state.autoFixSuggestion && (_jsxs(Alert, { children: [_jsx(Wrench, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Auto-Fix Suggestion:" }), _jsx("br", {}), this.state.autoFixSuggestion] })] })), _jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Error:" }), " ", this.state.error?.message] })] }), isJSXError && (_jsxs(Alert, { children: [_jsx(Code, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "JSX Error Help:" }), _jsx("br", {}), "This appears to be a JSX parsing error. Common causes include:", _jsxs("ul", { className: "list-disc list-inside mt-2 text-sm", children: [_jsx("li", { children: "Missing React import" }), _jsx("li", { children: "Incorrect component naming (must start with uppercase)" }), _jsx("li", { children: "Malformed JSX elements" }), _jsx("li", { children: "Missing closing tags" }), _jsx("li", { children: "Incorrect prop syntax" })] })] })] })), process.env.NODE_ENV === "development" && this.state.error && (_jsxs("details", { className: "bg-red-50 p-3 rounded-lg", children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium text-red-800 mb-2", children: "Error Details (Development)" }), _jsxs("div", { className: "text-xs text-red-700 space-y-2", children: [_jsxs("div", { children: [_jsx("strong", { children: "Message:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap", children: this.state.error.message })] }), this.state.error.stack && (_jsxs("div", { children: [_jsx("strong", { children: "Stack Trace:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap text-xs overflow-x-auto max-h-32", children: this.state.error.stack })] })), this.state.errorInfo?.componentStack && (_jsxs("div", { children: [_jsx("strong", { children: "Component Stack:" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap text-xs overflow-x-auto max-h-32", children: this.state.errorInfo.componentStack })] }))] })] })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs(Button, { onClick: this.handleRetry, className: "flex-1", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Try Again"] }), _jsxs(Button, { variant: "outline", onClick: this.handleReload, className: "flex-1", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Reload Page"] }), _jsxs(Button, { variant: "outline", onClick: this.copyErrorDetails, className: "flex-1", children: [_jsx(Code, { className: "h-4 w-4 mr-2" }), "Copy Details"] })] }), _jsx("div", { className: "text-center text-sm text-gray-500 pt-4 border-t", children: _jsxs("p", { children: ["If this JSX error persists, check your component structure and imports. For additional help, contact", " ", _jsx("a", { href: "mailto:support@reyada.com", className: "text-blue-600 hover:underline", children: "support@reyada.com" })] }) })] })] }) }));
        }
        return this.props.children;
    }
}
export default JSXErrorBoundary;
