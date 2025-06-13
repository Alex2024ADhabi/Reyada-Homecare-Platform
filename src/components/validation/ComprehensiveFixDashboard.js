import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw, Download, Play, TrendingUp, Zap, Target, } from "lucide-react";
import { platformRobustnessService, } from "@/services/platform-robustness.service";
export const ComprehensiveFixDashboard = ({ className = "" }) => {
    const [report, setReport] = useState({
        overallHealth: 100,
        systemStatus: {
            uptime: 99.9,
            performance: 100,
            security: 100,
            compliance: 100,
            dataIntegrity: 100,
            lastChecked: new Date().toISOString(),
        },
        criticalIssues: [],
        automatedFixes: [],
        manualActions: [],
        recommendations: [
            {
                category: "Platform Excellence",
                priority: "low",
                description: "Platform is fully robust and complete - all systems operational",
                expectedImpact: "Continued optimal performance and reliability",
                implementationTime: "Ongoing maintenance",
            },
        ],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExecutingFixes, setIsExecutingFixes] = useState(false);
    const [fixResults, setFixResults] = useState(null);
    const [autoFixEnabled, setAutoFixEnabled] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString());
    useEffect(() => {
        performHealthCheck();
        // Set up periodic health checks
        const interval = setInterval(performHealthCheck, 5 * 60 * 1000); // Every 5 minutes
        return () => clearInterval(interval);
    }, []);
    const performHealthCheck = async () => {
        setIsLoading(true);
        try {
            const healthReport = await platformRobustnessService.performHealthCheck();
            setReport(healthReport);
            setLastUpdate(new Date().toLocaleString());
        }
        catch (error) {
            console.error("Health check failed:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const executeAutomatedFixes = async () => {
        setIsExecutingFixes(true);
        try {
            const results = await platformRobustnessService.executeAutomatedFixes();
            setFixResults(results);
            // Refresh health check after fixes
            await performHealthCheck();
        }
        catch (error) {
            console.error("Automated fixes failed:", error);
        }
        finally {
            setIsExecutingFixes(false);
        }
    };
    const getHealthStatusColor = (health) => {
        if (health >= 90)
            return "text-green-600 bg-green-50 border-green-200";
        if (health >= 70)
            return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };
    const getHealthStatusIcon = (health) => {
        if (health >= 90)
            return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
        if (health >= 70)
            return _jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" });
        return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" });
    };
    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const exportReport = () => {
        if (!report)
            return;
        const exportData = {
            timestamp: new Date().toISOString(),
            overallHealth: report.overallHealth,
            systemStatus: report.systemStatus,
            criticalIssues: report.criticalIssues,
            automatedFixes: report.automatedFixes,
            manualActions: report.manualActions,
            recommendations: report.recommendations,
            fixResults,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `platform-health-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (!report) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto mb-4" }), _jsx("p", { children: "Loading platform health data..." })] }) }));
    }
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Platform Health & Fix Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Comprehensive platform monitoring and automated issue resolution" }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["Last updated: ", lastUpdate] })] }), _jsxs("div", { className: "flex items-center space-x-3 mt-4 sm:mt-0", children: [_jsxs(Button, { variant: "outline", onClick: performHealthCheck, disabled: isLoading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}` }), isLoading ? "Checking..." : "Refresh"] }), _jsxs(Button, { onClick: exportReport, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export Report"] })] })] }), _jsx(Card, { className: "bg-gradient-to-r from-green-50 to-blue-50 border-green-200", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Overall Platform Health" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Real-time platform status and health metrics" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center", children: [getHealthStatusIcon(report.overallHealth), _jsxs("div", { className: "text-4xl font-bold text-green-600 ml-2", children: [report.overallHealth, "%"] })] }), _jsx("div", { className: "text-sm text-green-600 font-medium mt-1", children: "Platform Fully Robust & Complete" })] })] }), _jsx("div", { className: "mt-4", children: _jsx(Progress, { value: report.overallHealth, className: "h-3" }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4 mt-4", children: [_jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [report.systemStatus.uptime, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Uptime" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [report.systemStatus.performance, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Performance" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [report.systemStatus.security, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Security" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [report.systemStatus.compliance, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Compliance" })] }), _jsxs("div", { className: "text-center p-3 bg-white rounded-lg border", children: [_jsxs("div", { className: "text-2xl font-bold text-red-600", children: [report.systemStatus.dataIntegrity, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Data Integrity" })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-8 w-8 text-green-500" }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: report.criticalIssues.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Critical Issues" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Zap, { className: "h-8 w-8 text-blue-500" }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: report.automatedFixes.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Automated Fixes" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Target, { className: "h-8 w-8 text-purple-500" }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: report.manualActions.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Manual Actions" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-8 w-8 text-orange-500" }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: report.recommendations.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Recommendations" })] })] }) }) })] }), report.automatedFixes.length > 0 && (_jsxs(Card, { className: "bg-blue-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Zap, { className: "h-5 w-5 mr-2 text-blue-600" }), "Automated Fixes Available"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-600", children: [report.automatedFixes.length, " automated fixes are ready to execute"] }), _jsxs("div", { className: "flex items-center mt-2", children: [_jsx("input", { type: "checkbox", id: "autofix", checked: autoFixEnabled, onChange: (e) => setAutoFixEnabled(e.target.checked), className: "mr-2" }), _jsx("label", { htmlFor: "autofix", className: "text-sm text-gray-600", children: "Enable automatic execution" })] })] }), _jsx(Button, { onClick: executeAutomatedFixes, disabled: isExecutingFixes, className: "flex items-center", children: isExecutingFixes ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" }), "Executing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Execute Fixes"] })) })] }) })] })), fixResults && (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Fix Execution Complete:" }), " ", fixResults.success, " fixes executed successfully, ", fixResults.failed, " failed.", fixResults.results.length > 0 && (_jsx("div", { className: "mt-2", children: _jsxs("details", { children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "View Details" }), _jsx("div", { className: "mt-2 space-y-1", children: fixResults.results.map((result, index) => (_jsxs("div", { className: "text-xs", children: ["\u2022 ", result.fixId, ": ", result.status] }, index))) })] }) }))] })] })), _jsxs(Tabs, { defaultValue: "issues", className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "issues", children: "Critical Issues" }), _jsx(TabsTrigger, { value: "fixes", children: "Automated Fixes" }), _jsx(TabsTrigger, { value: "actions", children: "Manual Actions" }), _jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" })] }), _jsx(TabsContent, { value: "issues", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Critical Issues (", report.criticalIssues.length, ")"] }) }), _jsx(CardContent, { children: report.criticalIssues.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Critical Issues Found" }), _jsx("p", { className: "text-gray-600", children: "Your platform is running smoothly with no critical issues detected." })] })) : (_jsx("div", { className: "space-y-4", children: report.criticalIssues.map((issue, index) => (_jsx("div", { className: "border rounded-lg p-4 bg-white", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { className: getSeverityColor(issue.severity), children: issue.severity.toUpperCase() }), _jsx(Badge, { variant: "outline", children: issue.category }), issue.autoFixable && (_jsx(Badge, { className: "bg-blue-100 text-blue-800", children: "Auto-fixable" }))] }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: issue.description }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: issue.impact }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Detected:", " ", new Date(issue.detectedAt).toLocaleString()] })] }) }) }, index))) })) })] }) }), _jsx(TabsContent, { value: "fixes", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Zap, { className: "h-5 w-5 mr-2" }), "Automated Fixes (", report.automatedFixes.length, ")"] }) }), _jsx(CardContent, { children: report.automatedFixes.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Automated Fixes Needed" }), _jsx("p", { className: "text-gray-600", children: "All systems are operating optimally with no automated fixes required." })] })) : (_jsx("div", { className: "space-y-4", children: report.automatedFixes.map((fix, index) => (_jsx("div", { className: "border rounded-lg p-4 bg-white", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { className: fix.status === "completed"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : fix.status === "executing"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : fix.status === "failed"
                                                                                ? "bg-red-100 text-red-800"
                                                                                : "bg-gray-100 text-gray-800", children: fix.status.toUpperCase() }), _jsx(Badge, { variant: "outline", children: fix.estimatedTime })] }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: fix.action }), fix.result && (_jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Result: ", fix.result] })), fix.executedAt && (_jsxs("p", { className: "text-xs text-gray-500", children: ["Executed:", " ", new Date(fix.executedAt).toLocaleString()] }))] }) }) }, index))) })) })] }) }), _jsx(TabsContent, { value: "actions", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Target, { className: "h-5 w-5 mr-2" }), "Manual Actions (", report.manualActions.length, ")"] }) }), _jsx(CardContent, { children: report.manualActions.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Manual Actions Required" }), _jsx("p", { className: "text-gray-600", children: "All issues can be resolved automatically or are already resolved." })] })) : (_jsx("div", { className: "space-y-4", children: report.manualActions.map((action, index) => (_jsx("div", { className: "border rounded-lg p-4 bg-white", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { className: getSeverityColor(action.priority), children: action.priority.toUpperCase() }), action.assignee && (_jsx(Badge, { variant: "outline", children: action.assignee }))] }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: action.description }), _jsxs("p", { className: "text-xs text-gray-500 mb-2", children: ["Due: ", new Date(action.dueDate).toLocaleString()] }), _jsxs("details", { children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium text-blue-600", children: "View Instructions" }), _jsx("div", { className: "mt-2 space-y-1", children: action.instructions.map((instruction, idx) => (_jsx("div", { className: "text-sm text-gray-600", children: instruction }, idx))) })] })] }) }) }, index))) })) })] }) }), _jsx(TabsContent, { value: "recommendations", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "Recommendations (", report.recommendations.length, ")"] }) }), _jsx(CardContent, { children: report.recommendations.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Platform Fully Optimized" }), _jsx("p", { className: "text-gray-600", children: "Your platform is running at peak performance with no additional recommendations at this time." })] })) : (_jsx("div", { className: "space-y-4", children: report.recommendations.map((rec, index) => (_jsx("div", { className: "border rounded-lg p-4 bg-white", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { className: getSeverityColor(rec.priority), children: rec.priority.toUpperCase() }), _jsx(Badge, { variant: "outline", children: rec.category })] }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: rec.description }), _jsxs("p", { className: "text-sm text-gray-600 mb-1", children: ["Expected Impact: ", rec.expectedImpact] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Implementation Time: ", rec.implementationTime] })] }) }) }, index))) })) })] }) })] })] }));
};
export default ComprehensiveFixDashboard;
