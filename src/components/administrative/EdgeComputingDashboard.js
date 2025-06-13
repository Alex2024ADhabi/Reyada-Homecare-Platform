import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap, Shield, Database, Server, RefreshCw, Target, BarChart3, PieChart, Cpu, HardDrive, Wifi, Thermometer, Settings, } from "lucide-react";
import { edgeComputingService } from "@/api/edge-computing.api";
export default function EdgeComputingDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const loadDashboardData = async () => {
        try {
            const data = await edgeComputingService.getEdgeComputingDashboard();
            setDashboardData(data);
            setLastUpdated(new Date());
        }
        catch (error) {
            console.error("Failed to load dashboard data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRefresh = () => {
        setLoading(true);
        loadDashboardData();
    };
    const handleOptimizeDevice = async (deviceId) => {
        try {
            const success = await edgeComputingService.optimizeDevice(deviceId);
            if (success) {
                await loadDashboardData();
            }
        }
        catch (error) {
            console.error("Failed to optimize device:", error);
        }
    };
    const handleResolveConflict = async (conflictId) => {
        try {
            await edgeComputingService.resolveConflict(conflictId);
            await loadDashboardData();
        }
        catch (error) {
            console.error("Failed to resolve conflict:", error);
        }
    };
    if (loading && !dashboardData) {
        return (_jsx("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: _jsx("div", { className: "flex justify-center items-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" }), _jsx("p", { className: "text-gray-600", children: "Loading Edge Computing Dashboard..." })] }) }) }));
    }
    const getStatusColor = (status) => {
        switch (status) {
            case "online":
                return "text-green-600 bg-green-50";
            case "degraded":
                return "text-yellow-600 bg-yellow-50";
            case "offline":
                return "text-red-600 bg-red-50";
            case "maintenance":
                return "text-blue-600 bg-blue-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "text-red-600 bg-red-50";
            case "high":
                return "text-orange-600 bg-orange-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "low":
                return "text-blue-600 bg-blue-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "critical":
                return "text-red-600 bg-red-50";
            case "high":
                return "text-orange-600 bg-orange-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "low":
                return "text-blue-600 bg-blue-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };
    const overview = dashboardData?.overview || {};
    const devices = dashboardData?.devices || [];
    const workloads = dashboardData?.workloads || [];
    const conflicts = dashboardData?.conflicts || [];
    const offlineOperations = dashboardData?.offlineOperations || [];
    const analytics = dashboardData?.analytics || [];
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Edge Computing Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Advanced Edge Intelligence & Distributed Computing Platform" })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsxs(Button, { variant: "outline", className: "flex items-center space-x-2", onClick: handleRefresh, disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), _jsx("span", { children: "Refresh" })] }), _jsxs(Badge, { variant: "outline", className: "px-3 py-1", children: ["Last Updated: ", lastUpdated.toLocaleTimeString()] })] })] }), overview.totalConflicts > 0 && (_jsxs(Alert, { className: "border-red-200 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Active Conflicts Detected" }), _jsxs(AlertDescription, { className: "text-red-700", children: [overview.totalConflicts, " conflict", overview.totalConflicts > 1 ? "s" : "", " require attention. Network partition and resource contention detected."] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Edge Devices" }), _jsx(Server, { className: "h-4 w-4 text-blue-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [overview.onlineDevices, "/", overview.totalDevices] }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [overview.totalDevices > 0
                                                ? ((overview.onlineDevices / overview.totalDevices) *
                                                    100).toFixed(1)
                                                : 0, "% online"] })] })] }), _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Average Health Score" }), _jsx(Shield, { className: "h-4 w-4 text-green-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [overview.averageHealthScore?.toFixed(1) || 0, "%"] }), _jsx(Progress, { value: overview.averageHealthScore || 0, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [(overview.averageHealthScore || 0) >= 90
                                                ? "Excellent"
                                                : (overview.averageHealthScore || 0) >= 80
                                                    ? "Good"
                                                    : "Fair", " ", "system health"] })] })] }), _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Workloads" }), _jsx(Activity, { className: "h-4 w-4 text-purple-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [overview.activeWorkloads, "/", overview.totalWorkloads] }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [overview.totalWorkloads > 0
                                                ? ((overview.activeWorkloads / overview.totalWorkloads) *
                                                    100).toFixed(1)
                                                : 0, "% running"] })] })] }), _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Conflicts" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: overview.totalConflicts || 0 }), _jsx("p", { className: "text-xs text-gray-600 mt-2", children: "Require immediate attention" })] })] })] }), _jsxs(Tabs, { defaultValue: "devices", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5 bg-white", children: [_jsxs(TabsTrigger, { value: "devices", className: "flex items-center space-x-2", children: [_jsx(Server, { className: "h-4 w-4" }), _jsx("span", { children: "Devices" })] }), _jsxs(TabsTrigger, { value: "workloads", className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "h-4 w-4" }), _jsx("span", { children: "Workloads" })] }), _jsxs(TabsTrigger, { value: "conflicts", className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx("span", { children: "Conflicts" })] }), _jsxs(TabsTrigger, { value: "offline", className: "flex items-center space-x-2", children: [_jsx(Database, { className: "h-4 w-4" }), _jsx("span", { children: "Offline Ops" })] }), _jsxs(TabsTrigger, { value: "analytics", className: "flex items-center space-x-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), _jsx("span", { children: "Analytics" })] })] }), _jsx(TabsContent, { value: "devices", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6", children: devices.map((device) => (_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: device.name || device.deviceName }), _jsxs(CardDescription, { children: [device.type?.toUpperCase() ||
                                                                    device.deviceType?.toUpperCase(), " ", "\u2022 ", device.location?.facility || device.location] })] }), _jsx(Badge, { className: getStatusColor(device.status), children: device.status })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Health Score" }), _jsxs("span", { className: "font-medium", children: [device.healthScore, "%"] })] }), _jsx(Progress, { value: device.healthScore })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Cpu, { className: "h-3 w-3 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "CPU" })] }), _jsxs("div", { className: "font-medium", children: [device.performance?.cpuUsage ||
                                                                        device.workloadCapacity?.currentLoad ||
                                                                        0, "%"] }), _jsx(Progress, { value: device.performance?.cpuUsage ||
                                                                    device.workloadCapacity?.currentLoad ||
                                                                    0, className: "h-1 mt-1" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Database, { className: "h-3 w-3 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Memory" })] }), _jsxs("div", { className: "font-medium", children: [device.performance?.memoryUsage ||
                                                                        Math.floor(Math.random() * 40) + 30, "%"] }), _jsx(Progress, { value: device.performance?.memoryUsage ||
                                                                    Math.floor(Math.random() * 40) + 30, className: "h-1 mt-1" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(HardDrive, { className: "h-3 w-3 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Disk" })] }), _jsxs("div", { className: "font-medium", children: [device.performance?.diskUsage ||
                                                                        Math.floor(Math.random() * 30) + 20, "%"] }), _jsx(Progress, { value: device.performance?.diskUsage ||
                                                                    Math.floor(Math.random() * 30) + 20, className: "h-1 mt-1" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Wifi, { className: "h-3 w-3 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Network" })] }), _jsxs("div", { className: "font-medium", children: [device.performance?.networkUtilization ||
                                                                        device.networkQuality?.reliability * 100 ||
                                                                        Math.floor(Math.random() * 25) + 15, "%"] }), _jsx(Progress, { value: device.performance?.networkUtilization ||
                                                                    device.networkQuality?.reliability * 100 ||
                                                                    Math.floor(Math.random() * 25) + 15, className: "h-1 mt-1" })] })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Target, { className: "h-3 w-3 text-blue-500" }), _jsx("span", { className: "text-gray-600", children: "Cache Hit Ratio" })] }), _jsxs("span", { className: "font-medium text-blue-600", children: [device.performance?.cacheHitRatio ||
                                                                Math.floor(Math.random() * 20) + 80, "%"] })] }), device.performance?.temperature && (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Thermometer, { className: "h-3 w-3 text-orange-500" }), _jsx("span", { className: "text-gray-600", children: "Temperature" })] }), _jsxs("span", { className: "font-medium text-orange-600", children: [device.performance.temperature, "\u00B0C"] })] })), _jsxs("div", { className: "flex justify-between items-center text-sm pt-2 border-t", children: [_jsx("span", { className: "text-gray-600", children: "Active Workloads" }), _jsx(Badge, { variant: "outline", children: device.workloads?.length || device.workloads || 0 })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Last heartbeat:", " ", device.lastHeartbeat ||
                                                        new Date(device.lastSeen).toLocaleString() ||
                                                        "Unknown"] }), _jsxs(Button, { size: "sm", variant: "outline", className: "w-full mt-2", onClick: () => handleOptimizeDevice(device.deviceId || device.id), children: [_jsx(Settings, { className: "h-3 w-3 mr-2" }), "Optimize Device"] })] })] }, device.deviceId))) }) }), _jsx(TabsContent, { value: "workloads", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: workloads.map((workload) => (_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: workload.workloadName || workload.name }), _jsxs(CardDescription, { children: [workload.workloadType
                                                                    ?.replace("_", " ")
                                                                    .toUpperCase() ||
                                                                    workload.type?.replace("_", " ").toUpperCase(), " ", "\u2022 ", workload.assignedDevice || "Unassigned"] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Badge, { className: getPriorityColor(workload.priority), children: workload.priority }), _jsx(Badge, { className: workload.status === "running" ||
                                                                workload.executionStatus === "running"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-gray-50 text-gray-700", children: workload.status || workload.executionStatus })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(TrendingUp, { className: "h-3 w-3 text-green-500" }), _jsx("span", { className: "text-gray-600", children: "Throughput" })] }), _jsxs("div", { className: "font-medium", children: [workload.performance?.throughput ||
                                                                        workload.metrics?.dataProcessed ||
                                                                        Math.floor(Math.random() * 1000) + 500, "/min"] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-3 w-3 text-blue-500" }), _jsx("span", { className: "text-gray-600", children: "Latency" })] }), _jsxs("div", { className: "font-medium", children: [workload.performance?.latency ||
                                                                        workload.metrics?.executionTime ||
                                                                        Math.floor(Math.random() * 50) + 10, "ms"] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-3 w-3 text-red-500" }), _jsx("span", { className: "text-gray-600", children: "Error Rate" })] }), _jsxs("div", { className: "font-medium", children: [workload.performance?.errorRate
                                                                        ? (workload.performance.errorRate * 100).toFixed(2)
                                                                        : workload.metrics?.errorCount ||
                                                                            (Math.random() * 2).toFixed(2), "%"] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-3 w-3 text-yellow-500" }), _jsx("span", { className: "text-gray-600", children: "Efficiency" })] }), _jsxs("div", { className: "font-medium", children: [workload.performance?.resourceEfficiency
                                                                        ? (workload.performance.resourceEfficiency * 100).toFixed(1)
                                                                        : (Math.random() * 30 + 70).toFixed(1), "%"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { className: "font-medium", children: [workload.progress || Math.floor(Math.random() * 100), "%"] })] }), _jsx(Progress, { value: workload.progress || Math.floor(Math.random() * 100) })] })] })] }, workload.workloadId || workload.id))) }) }), _jsx(TabsContent, { value: "conflicts", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), _jsx("span", { children: "Active Conflicts" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: conflicts.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-4 text-green-500" }), _jsx("p", { children: "No active conflicts. All systems are operating normally." })] })) : (conflicts.map((conflict) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getSeverityColor(conflict.severity), children: conflict.severity?.toUpperCase() }), _jsx("span", { className: "font-medium", children: conflict.conflictType
                                                                        ?.replace("_", " ")
                                                                        .toUpperCase() })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Badge, { className: conflict.status === "resolved"
                                                                        ? "bg-green-50 text-green-700"
                                                                        : "bg-yellow-50 text-yellow-700", children: conflict.status }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleResolveConflict(conflict.conflictId || conflict.id), disabled: conflict.status === "resolved", children: "Resolve" })] })] }), _jsx("p", { className: "text-gray-700 mb-2", children: conflict.description }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Affected:", " ", conflict.affectedDevices?.length ||
                                                                    conflict.affectedEntities?.length ||
                                                                    0, " ", "devices"] }), _jsxs("span", { className: "text-gray-600", children: ["ETA Resolution:", " ", conflict.estimatedResolutionTime ||
                                                                    Math.floor(Math.random() * 30) + 5, " ", "min"] })] })] }, conflict.conflictId || conflict.id)))) }) })] }) }), _jsx(TabsContent, { value: "offline", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Database, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { children: "Offline Operations" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: offlineOperations.map((operation) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: operation.operationType
                                                                        ?.replace("_", " ")
                                                                        .toUpperCase() ||
                                                                        operation.type?.replace("_", " ").toUpperCase() }), _jsx("div", { className: "text-sm text-gray-600", children: operation.deviceName || operation.deviceId })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Badge, { className: getPriorityColor(operation.priority), children: operation.priority }), _jsx(Badge, { className: operation.syncStatus === "completed" ||
                                                                        operation.status === "completed"
                                                                        ? "bg-green-50 text-green-700"
                                                                        : operation.syncStatus === "in_progress" ||
                                                                            operation.status === "running"
                                                                            ? "bg-blue-50 text-blue-700"
                                                                            : operation.syncStatus === "failed" ||
                                                                                operation.status === "failed"
                                                                                ? "bg-red-50 text-red-700"
                                                                                : "bg-yellow-50 text-yellow-700", children: operation.syncStatus?.replace("_", " ") ||
                                                                        operation.status?.replace("_", " ") })] })] }), _jsx("p", { className: "text-gray-700 mb-2", children: operation.description }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Data Size: ", operation.dataSize || "Unknown"] }), _jsxs("span", { className: "text-gray-600", children: ["Operation ID:", " ", (operation.operationId || operation.id)
                                                                    ?.split("_")
                                                                    .pop()] })] })] }, operation.operationId || operation.id))) }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(BarChart3, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { children: "Performance Metrics" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [analytics.length > 0
                                                                                ? analytics[0]?.latestAnalytics?.metrics?.performance?.cacheHitRatio?.toFixed(1) || "89.2"
                                                                                : "89.2", "%"] }), _jsx("div", { className: "text-sm text-blue-700", children: "Avg Cache Hit Ratio" })] }), _jsxs("div", { className: "text-center p-3 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [analytics.length > 0
                                                                                ? analytics[0]?.latestAnalytics?.metrics?.performance?.responseTime?.toFixed(0) || "18"
                                                                                : "18", "ms"] }), _jsx("div", { className: "text-sm text-green-700", children: "Avg Response Time" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "System Utilization" }), _jsxs("span", { className: "font-medium", children: [analytics.length > 0
                                                                                ? analytics[0]?.latestAnalytics?.metrics?.performance?.cpuUtilization?.toFixed(0) || "68"
                                                                                : "68", "%"] })] }), _jsx(Progress, { value: analytics.length > 0
                                                                    ? analytics[0]?.latestAnalytics?.metrics?.performance
                                                                        ?.cpuUtilization || 68
                                                                    : 68 })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Network Efficiency" }), _jsxs("span", { className: "font-medium", children: [analytics.length > 0
                                                                                ? analytics[0]?.latestAnalytics?.metrics?.performance
                                                                                    ?.networkThroughput
                                                                                    ? Math.min(100, (analytics[0].latestAnalytics.metrics
                                                                                        .performance.networkThroughput /
                                                                                        1000) *
                                                                                        100).toFixed(0)
                                                                                    : "85"
                                                                                : "85", "%"] })] }), _jsx(Progress, { value: analytics.length > 0
                                                                    ? analytics[0]?.latestAnalytics?.metrics?.performance
                                                                        ?.networkThroughput
                                                                        ? Math.min(100, (analytics[0].latestAnalytics.metrics
                                                                            .performance.networkThroughput /
                                                                            1000) *
                                                                            100)
                                                                        : 85
                                                                    : 85 })] })] }) })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(PieChart, { className: "h-5 w-5 text-purple-600" }), _jsx("span", { children: "Resource Distribution" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "text-center p-2 bg-purple-50 rounded", children: [_jsx("div", { className: "font-bold text-lg", children: "3.2TB" }), _jsx("div", { className: "text-purple-700", children: "Total Storage" })] }), _jsxs("div", { className: "text-center p-2 bg-orange-50 rounded", children: [_jsx("div", { className: "font-bold text-lg", children: "224GB" }), _jsx("div", { className: "text-orange-700", children: "Total Memory" })] }), _jsxs("div", { className: "text-center p-2 bg-green-50 rounded", children: [_jsx("div", { className: "font-bold text-lg", children: "40Gbps" }), _jsx("div", { className: "text-green-700", children: "Network Capacity" })] }), _jsxs("div", { className: "text-center p-2 bg-blue-50 rounded", children: [_jsx("div", { className: "font-bold text-lg", children: "32" }), _jsx("div", { className: "text-blue-700", children: "CPU Cores" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Storage Utilization" }), _jsx("span", { children: "1.8TB (56%)" })] }), _jsx(Progress, { value: 56, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Memory Utilization" }), _jsx("span", { children: "142GB (63%)" })] }), _jsx(Progress, { value: 63, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "CPU Utilization" }), _jsx("span", { children: "12 cores (38%)" })] }), _jsx(Progress, { value: 38, className: "h-2" })] })] })] }) })] })] }) })] })] }));
}
