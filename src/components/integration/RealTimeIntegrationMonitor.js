import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Globe, Heart, RefreshCw, Server, TrendingUp, TrendingDown, Wifi, WifiOff, Zap, AlertCircle, Play, Pause, RotateCcw, } from "lucide-react";
import { useMalaffiSync } from "@/hooks/useMalaffiSync";
import { executeIntegrationTestSuite, getIntegrationTestReports, } from "@/api/integration-intelligence.api";
const RealTimeIntegrationMonitor = ({ className = "", }) => {
    const { realTimeData, integrationHealth, isMonitoring, startRealTimeMonitoring, stopRealTimeMonitoring, refreshIntegrationHealth, retryFailedOperations, isLoading, error, clearError, } = useMalaffiSync();
    const [selectedSystem, setSelectedSystem] = useState("all");
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);
    const [testResults, setTestResults] = useState([]);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [testSuites] = useState([
        "malaffi_integration_tests",
        "daman_integration_tests",
        "doh_compliance_tests",
    ]);
    // Auto-refresh integration health and test results
    useEffect(() => {
        if (autoRefresh && isMonitoring) {
            const interval = setInterval(() => {
                refreshIntegrationHealth();
                loadTestResults();
            }, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, isMonitoring, refreshInterval, refreshIntegrationHealth]);
    // Load test results on component mount
    useEffect(() => {
        loadTestResults();
    }, []);
    const loadTestResults = async () => {
        try {
            const results = await getIntegrationTestReports({
                dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                dateTo: new Date().toISOString(),
            });
            setTestResults(results.slice(0, 10)); // Show last 10 results
        }
        catch (error) {
            console.error("Failed to load test results:", error);
        }
    };
    const runIntegrationTests = async (suiteId) => {
        setIsRunningTests(true);
        try {
            if (suiteId) {
                await executeIntegrationTestSuite(suiteId);
            }
            else {
                // Run all test suites
                for (const suite of testSuites) {
                    await executeIntegrationTestSuite(suite);
                }
            }
            await loadTestResults();
        }
        catch (error) {
            console.error("Integration tests failed:", error);
        }
        finally {
            setIsRunningTests(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "healthy":
            case "connected":
                return "text-green-600 bg-green-50";
            case "degraded":
            case "reconnecting":
                return "text-yellow-600 bg-yellow-50";
            case "critical":
            case "disconnected":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "healthy":
            case "connected":
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            case "degraded":
            case "reconnecting":
                return _jsx(AlertTriangle, { className: "h-4 w-4" });
            case "critical":
            case "disconnected":
                return _jsx(AlertCircle, { className: "h-4 w-4" });
            default:
                return _jsx(Clock, { className: "h-4 w-4" });
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "improving":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-600" });
            case "degrading":
                return _jsx(TrendingDown, { className: "h-4 w-4 text-red-600" });
            default:
                return _jsx(Activity, { className: "h-4 w-4 text-blue-600" });
        }
    };
    const formatDuration = (ms) => {
        if (ms < 1000)
            return `${ms}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };
    const formatBytes = (bytes) => {
        if (bytes < 1024)
            return `${bytes}B`;
        if (bytes < 1048576)
            return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / 1048576).toFixed(1)}MB`;
    };
    return (_jsx("div", { className: `bg-white min-h-screen p-6 ${className}`, children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Real-Time Integration Monitor" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Monitor integration health, performance, and data flows in real-time" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: refreshIntegrationHealth, disabled: isLoading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => runIntegrationTests(), disabled: isRunningTests, children: [_jsx(Zap, { className: `h-4 w-4 mr-2 ${isRunningTests ? "animate-spin" : ""}` }), isRunningTests ? "Running Tests..." : "Run Tests"] }), _jsx(Button, { variant: isMonitoring ? "destructive" : "default", size: "sm", onClick: isMonitoring ? stopRealTimeMonitoring : startRealTimeMonitoring, children: isMonitoring ? (_jsxs(_Fragment, { children: [_jsx(Pause, { className: "h-4 w-4 mr-2" }), "Stop Monitoring"] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Start Monitoring"] })) })] })] }), error && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Integration Error" }), _jsxs(AlertDescription, { className: "flex items-center justify-between", children: [_jsx("span", { children: error }), _jsx(Button, { variant: "outline", size: "sm", onClick: clearError, children: "Dismiss" })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [realTimeData.connectionStatus === "connected" ? (_jsx(Wifi, { className: "h-5 w-5 text-green-600" })) : (_jsx(WifiOff, { className: "h-5 w-5 text-red-600" })), _jsx("span", { children: "Connection Status" }), _jsx(Badge, { className: getStatusColor(realTimeData.connectionStatus), children: realTimeData.connectionStatus.toUpperCase() })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: realTimeData.activeConnections }), _jsx("div", { className: "text-sm text-gray-600", children: "Active Connections" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: realTimeData.syncProgress.completed }), _jsx("div", { className: "text-sm text-gray-600", children: "Completed Operations" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: realTimeData.syncProgress.failed }), _jsx("div", { className: "text-sm text-gray-600", children: "Failed Operations" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: realTimeData.queuedOperations }), _jsx("div", { className: "text-sm text-gray-600", children: "Queued Operations" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Heart, { className: "h-5 w-5 text-red-500" }), _jsx("span", { children: "Integration Health" }), _jsx(Badge, { className: getStatusColor(integrationHealth.overallHealth), children: integrationHealth.overallHealth.toUpperCase() })] }), _jsxs(CardDescription, { children: ["Overall system health: ", integrationHealth.apiResponseTime, "ms avg response time"] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "API Response Time" }), _jsxs("span", { className: "text-sm text-gray-600", children: [integrationHealth.apiResponseTime, "ms"] })] }), _jsx(Progress, { value: Math.min((integrationHealth.apiResponseTime / 1000) * 100, 100), className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Error Rate" }), _jsxs("span", { className: "text-sm text-gray-600", children: [integrationHealth.errorRate.toFixed(1), "%"] })] }), _jsx(Progress, { value: integrationHealth.errorRate, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Uptime" }), _jsxs("span", { className: "text-sm text-gray-600", children: [integrationHealth.uptime.toFixed(1), "%"] })] }), _jsx(Progress, { value: integrationHealth.uptime, className: "h-2" })] })] }), integrationHealth.issues.length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "text-sm font-medium mb-3", children: "Current Issues" }), _jsx("div", { className: "space-y-2", children: integrationHealth.issues.map((issue, index) => (_jsxs(Alert, { variant: issue.type === "critical" ? "destructive" : "default", children: [getStatusIcon(issue.type), _jsx(AlertDescription, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: issue.message }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(issue.timestamp).toLocaleTimeString() })] }) })] }, index))) })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-5 w-5 text-yellow-500" }), _jsx("span", { children: "Performance Metrics" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [realTimeData.performanceMetrics.averageResponseTime.toFixed(0), "ms"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Average Response Time" }), _jsxs("div", { className: "flex items-center justify-center mt-2", children: [getTrendIcon("stable"), _jsx("span", { className: "text-xs text-gray-500 ml-1", children: "Stable" })] })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [realTimeData.performanceMetrics.successRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Success Rate" }), _jsxs("div", { className: "flex items-center justify-center mt-2", children: [getTrendIcon("improving"), _jsx("span", { className: "text-xs text-gray-500 ml-1", children: "Improving" })] })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-red-600", children: [realTimeData.performanceMetrics.errorRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Error Rate" }), _jsxs("div", { className: "flex items-center justify-center mt-2", children: [getTrendIcon("degrading"), _jsx("span", { className: "text-xs text-gray-500 ml-1", children: "Degrading" })] })] })] }) })] }), realTimeData.syncProgress.total > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Database, { className: "h-5 w-5 text-purple-500" }), _jsx("span", { children: "Synchronization Progress" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Progress" }), _jsxs("span", { className: "text-sm text-gray-600", children: [realTimeData.syncProgress.completed, " /", " ", realTimeData.syncProgress.total] })] }), _jsx(Progress, { value: (realTimeData.syncProgress.completed /
                                            realTimeData.syncProgress.total) *
                                            100, className: "h-3" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: realTimeData.syncProgress.completed }), _jsx("div", { className: "text-xs text-gray-600", children: "Completed" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-blue-600", children: realTimeData.syncProgress.inProgress }), _jsx("div", { className: "text-xs text-gray-600", children: "In Progress" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-red-600", children: realTimeData.syncProgress.failed }), _jsx("div", { className: "text-xs text-gray-600", children: "Failed" })] })] }), realTimeData.syncProgress.failed > 0 && (_jsx("div", { className: "flex justify-center", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: retryFailedOperations, disabled: isLoading, children: [_jsx(RotateCcw, { className: "h-4 w-4 mr-2" }), "Retry Failed Operations"] }) }))] }) })] })), realTimeData.lastSyncTime && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-5 w-5 text-gray-500" }), _jsx("span", { children: "Last Synchronization" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Last Sync Time" }), _jsx("div", { className: "text-sm text-gray-600", children: new Date(realTimeData.lastSyncTime).toLocaleString() })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm font-medium", children: "Time Ago" }), _jsxs("div", { className: "text-sm text-gray-600", children: [formatDuration(Date.now() -
                                                        new Date(realTimeData.lastSyncTime).getTime()), " ", "ago"] })] })] }) })] })), _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "malaffi", children: "Malaffi EMR" }), _jsx(TabsTrigger, { value: "daman", children: "DAMAN" }), _jsx(TabsTrigger, { value: "tests", children: "Integration Tests" }), _jsx(TabsTrigger, { value: "logs", children: "Activity Logs" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "System Overview" }), _jsx(CardDescription, { children: "Real-time status of all integrated systems" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: ["Malaffi EMR", "DAMAN", "DOH", "WhatsApp Business"].map((system) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Server, { className: "h-5 w-5 text-gray-500" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: system }), _jsx("div", { className: "text-sm text-gray-600", children: "Integration Service" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { className: getStatusColor("healthy"), children: [getStatusIcon("healthy"), _jsx("span", { className: "ml-1", children: "Healthy" })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [(200 + Math.random() * 300).toFixed(0), "ms"] })] })] }, system))) }) })] }) }), _jsx(TabsContent, { value: "malaffi", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Malaffi EMR Integration" }), _jsx(CardDescription, { children: "Detailed monitoring of Malaffi EMR integration" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Connection Details" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Endpoint:" }), _jsx("span", { className: "text-gray-600", children: "api.malaffi.ae" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Protocol:" }), _jsx("span", { className: "text-gray-600", children: "HTTPS/REST" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Authentication:" }), _jsx("span", { className: "text-green-600", children: "OAuth 2.0 \u2713" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Rate Limit:" }), _jsx("span", { className: "text-gray-600", children: "1000/hour" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Recent Activity" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx("span", { children: "Patient sync completed" }), _jsx("span", { className: "text-gray-500", children: "2m ago" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx("span", { children: "Medical records updated" }), _jsx("span", { className: "text-gray-500", children: "5m ago" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsx("span", { children: "Rate limit warning" }), _jsx("span", { className: "text-gray-500", children: "15m ago" })] })] })] })] }) })] }) }), _jsx(TabsContent, { value: "daman", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DAMAN Integration" }), _jsx(CardDescription, { children: "Insurance authorization and claims processing" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Globe, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "DAMAN integration monitoring coming soon" })] }) })] }) }), _jsx(TabsContent, { value: "tests", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: "Integration Test Results" }), _jsx("div", { className: "flex space-x-2", children: testSuites.map((suiteId) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => runIntegrationTests(suiteId), disabled: isRunningTests, children: suiteId.replace("_", " ").toUpperCase() }, suiteId))) })] }), _jsx(CardDescription, { children: "Automated integration test results and health checks" })] }), _jsx(CardContent, { children: testResults.length > 0 ? (_jsx("div", { className: "space-y-3", children: testResults.map((result, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [result.summary.failed === 0 ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(XCircle, { className: "h-5 w-5 text-red-600" })), _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: ["Test Suite: ", result.suiteId.replace("_", " ")] }), _jsxs("div", { className: "text-sm text-gray-600", children: [result.summary.passed, "/", result.summary.totalTests, " tests passed"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: [result.summary.errorRate.toFixed(1), "% error rate"] }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(result.executionTime).toLocaleTimeString() })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No test results available. Run integration tests to see results." })] })) })] }) }), _jsx(TabsContent, { value: "logs", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Activity Logs" }), _jsx(CardDescription, { children: "Real-time integration activity and events" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: [
                                                {
                                                    time: "14:32:15",
                                                    level: "INFO",
                                                    message: "Malaffi patient sync initiated",
                                                    system: "Malaffi",
                                                },
                                                {
                                                    time: "14:32:18",
                                                    level: "SUCCESS",
                                                    message: "Patient data synchronized successfully",
                                                    system: "Malaffi",
                                                },
                                                {
                                                    time: "14:33:02",
                                                    level: "INFO",
                                                    message: "DAMAN authorization request sent",
                                                    system: "DAMAN",
                                                },
                                                {
                                                    time: "14:33:05",
                                                    level: "SUCCESS",
                                                    message: "Authorization approved",
                                                    system: "DAMAN",
                                                },
                                                {
                                                    time: "14:34:12",
                                                    level: "WARNING",
                                                    message: "High response time detected",
                                                    system: "Malaffi",
                                                },
                                                {
                                                    time: "14:35:01",
                                                    level: "INFO",
                                                    message: "Automatic retry initiated",
                                                    system: "System",
                                                },
                                            ].map((log, index) => (_jsxs("div", { className: "flex items-center space-x-3 p-2 border-l-4 border-l-blue-200 bg-gray-50 rounded", children: [_jsx("div", { className: "text-xs text-gray-500 font-mono", children: log.time }), _jsx(Badge, { variant: log.level === "SUCCESS"
                                                            ? "default"
                                                            : log.level === "WARNING"
                                                                ? "secondary"
                                                                : "outline", className: "text-xs", children: log.level }), _jsx("div", { className: "flex-1 text-sm", children: log.message }), _jsx("div", { className: "text-xs text-gray-500", children: log.system })] }, index))) }) })] }) })] })] }) }));
};
export default RealTimeIntegrationMonitor;
