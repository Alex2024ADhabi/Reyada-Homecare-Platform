import { jsx as _jsx_1, jsxs as _jsxs_1 } from "react/jsx-runtime";
import { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Code, Wrench } from "lucide-react";
import { jsxErrorHandler } from "@/services/jsx-error-handler.service";
export class JSXErrorRecovery extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "maxRecoveryAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "recoveryTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "attemptRecovery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ isRecovering: true });
                this.recoveryTimeout = setTimeout(() => {
                    this.setState((prevState) => ({
                        hasError: false,
                        error: null,
                        errorInfo: null,
                        errorId: null,
                        recoveryAttempts: prevState.recoveryAttempts + 1,
                        isRecovering: false,
                    }));
                }, 2000);
            }
        });
        Object.defineProperty(this, "handleManualRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorId: null,
                    recoveryAttempts: 0,
                    isRecovering: false,
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
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            recoveryAttempts: 0,
            isRecovering: false,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorId: `jsx-recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error("JSX Error Recovery caught:", error, errorInfo);
        // Handle JSX-specific errors
        const jsxHandling = jsxErrorHandler.handleJSXError(error, this.props.componentName);
        this.setState({
            errorInfo,
        });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Attempt auto-recovery if enabled
        if (this.props.autoRecover &&
            this.state.recoveryAttempts < this.maxRecoveryAttempts) {
            this.attemptRecovery();
        }
    }
    componentWillUnmount() {
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.state.isRecovering) {
                return (_jsx_1("div", { className: "min-h-32 bg-yellow-50 flex items-center justify-center p-4 border border-yellow-200 rounded-lg", children: _jsxs_1("div", { className: "text-center", children: [_jsx_1(RefreshCw, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-yellow-600" }), _jsx_1("p", { className: "text-sm text-yellow-800", children: "Attempting to recover from JSX error..." })] }) }));
            }
            if (this.props.fallback) {
                return this.props.fallback;
            }
            const isJSXError = this.state.error?.message.toLowerCase().includes("jsx") ||
                this.state.error?.message.toLowerCase().includes("unexpected token") ||
                this.state.error?.message
                    .toLowerCase()
                    .includes("expected jsx identifier");
            return (_jsx_1("div", { className: "min-h-32 bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs_1(Card, { className: "max-w-2xl w-full", children: [_jsxs_1(CardHeader, { className: "text-center", children: [_jsx_1("div", { className: "mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3", children: isJSXError ? (_jsx_1(Code, { className: "h-5 w-5 text-red-600" })) : (_jsx_1(AlertTriangle, { className: "h-5 w-5 text-red-600" })) }), _jsx_1(CardTitle, { className: "text-lg text-red-600", children: isJSXError ? "JSX Parsing Error" : "Component Error" })] }), _jsxs_1(CardContent, { className: "space-y-3", children: [this.state.errorId && (_jsxs_1("div", { className: "bg-gray-100 p-2 rounded text-xs", children: [_jsx_1("strong", { children: "Error ID:" }), " ", this.state.errorId, this.props.componentName && (_jsxs_1("div", { children: [_jsx_1("strong", { children: "Component:" }), " ", this.props.componentName] }))] })), this.state.recoveryAttempts > 0 && (_jsxs_1(Alert, { children: [_jsx_1(Wrench, { className: "h-4 w-4" }), _jsxs_1(AlertDescription, { children: ["Recovery attempts: ", this.state.recoveryAttempts, "/", this.maxRecoveryAttempts] })] })), _jsxs_1(Alert, { variant: "destructive", children: [_jsx_1(AlertTriangle, { className: "h-4 w-4" }), _jsx_1(AlertDescription, { className: "text-sm", children: this.state.error?.message || "Unknown JSX error occurred" })] }), _jsxs_1("div", { className: "flex gap-2", children: [_jsxs_1(Button, { onClick: this.handleManualRetry, size: "sm", className: "flex-1", children: [_jsx_1(RefreshCw, { className: "h-3 w-3 mr-1" }), "Retry"] }), _jsxs_1(Button, { variant: "outline", onClick: this.handleReload, size: "sm", className: "flex-1", children: [_jsx_1(RefreshCw, { className: "h-3 w-3 mr-1" }), "Reload"] })] })] })] }) }));
        }
        return this.props.children;
    }
}
export default JSXErrorRecovery;
