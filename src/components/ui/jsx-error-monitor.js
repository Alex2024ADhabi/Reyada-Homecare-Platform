import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, RefreshCw, Code, Zap, TrendingUp, Activity, } from "lucide-react";
import { jsxErrorHandler } from "@/services/jsx-error-handler.service";
export const JSXErrorMonitor = ({ className = "", showDetails = true, autoRefresh = true, }) => {
    const [healthReport, setHealthReport] = useState(null);
    const [errorStats, setErrorStats] = useState(null);
    const [recentErrors, setRecentErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const report = jsxErrorHandler.generateHealthReport();
            const stats = jsxErrorHandler.getErrorStats();
            const errors = jsxErrorHandler.getRecentErrors(5);
            setHealthReport(report);
            setErrorStats(stats);
            setRecentErrors(errors);
        }
        catch (error) {
            console.error("Failed to refresh JSX error data:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        refreshData();
        if (autoRefresh) {
            const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);
    const getStatusColor = (status) => {
        switch (status) {
            case "healthy":
                return "text-green-600 bg-green-100";
            case "warning":
                return "text-yellow-600 bg-yellow-100";
            case "critical":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "healthy":
                return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
            case "warning":
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" });
            case "critical":
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" });
            default:
                return _jsx(Activity, { className: "h-5 w-5 text-gray-600" });
        }
    };
    if (!healthReport || !errorStats) {
        return (_jsx(Card, { className: className, children: _jsxs(CardContent, { className: "flex items-center justify-center p-6", children: [_jsx(RefreshCw, { className: "h-6 w-6 animate-spin mr-2" }), _jsx("span", { children: "Loading JSX health data..." })] }) }));
    }
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(healthReport.status), _jsx(CardTitle, { children: "JSX Health Monitor" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusColor(healthReport.status), children: healthReport.status.toUpperCase() }), _jsx(Button, { variant: "outline", size: "sm", onClick: refreshData, disabled: isLoading, children: _jsx(RefreshCw, { className: `h-4 w-4 ${isLoading ? "animate-spin" : ""}` }) })] })] }), _jsx(CardDescription, { children: "Real-time monitoring of JSX parsing and component health" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: "Health Score" }), _jsxs("span", { className: "font-medium", children: [healthReport.score, "/100"] })] }), _jsx(Progress, { value: healthReport.score, className: `h-3 ${healthReport.score >= 80 ? "bg-green-100" : healthReport.score >= 60 ? "bg-yellow-100" : "bg-red-100"}` })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: errorStats.totalErrors }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Errors" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: errorStats.recentErrors }), _jsx("div", { className: "text-sm text-gray-600", children: "Recent (1h)" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: errorStats.fixedErrors }), _jsx("div", { className: "text-sm text-gray-600", children: "Fixed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: Object.keys(errorStats.commonErrors).length }), _jsx("div", { className: "text-sm text-gray-600", children: "Error Types" })] })] })] })] }), showDetails && (_jsxs(_Fragment, { children: [(healthReport.issues.length > 0 ||
                        healthReport.recommendations.length > 0) && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [healthReport.issues.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), "Current Issues"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: healthReport.issues.map((issue, index) => (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: issue }) }, index))) }) })] })), healthReport.recommendations.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-5 w-5 text-blue-600" }), "Recommendations"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: healthReport.recommendations.map((rec, index) => (_jsx(Alert, { children: _jsx(AlertDescription, { children: rec }) }, index))) }) })] }))] })), Object.keys(errorStats.commonErrors).length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Error Distribution"] }), _jsx(CardDescription, { children: "Most common JSX error types" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: Object.entries(errorStats.commonErrors)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([errorType, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Code, { className: "h-4 w-4 text-gray-500" }), _jsx("span", { className: "text-sm font-medium", children: errorType })] }), _jsxs(Badge, { variant: "outline", children: [count, " occurrences"] })] }, errorType))) }) })] })), recentErrors.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Recent Errors"] }), _jsx(CardDescription, { children: "Latest JSX parsing issues" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: recentErrors.map((error, index) => (_jsx("div", { className: "p-3 border rounded-lg", children: _jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium text-red-600", children: error.error }), error.component && (_jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Component: ", error.component] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [error.fixed && (_jsx(Badge, { className: "text-green-600 bg-green-100", children: "Fixed" })), _jsx("div", { className: "text-xs text-gray-500", children: new Date(error.timestamp).toLocaleTimeString() })] })] }) }, index))) }) })] }))] }))] }));
};
export default JSXErrorMonitor;
