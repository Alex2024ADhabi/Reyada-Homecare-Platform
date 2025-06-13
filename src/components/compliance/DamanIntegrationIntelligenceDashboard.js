import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, CheckCircle, Globe, RefreshCw, WifiOff, Zap, TrendingUp, BarChart3, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
const DamanIntegrationIntelligenceDashboard = () => {
    const [systemsHealth, setSystemsHealth] = useState([]);
    const [integrationMetrics, setIntegrationMetrics] = useState([]);
    const [predictedIssues, setPredictedIssues] = useState([]);
    const [optimizationOpportunities, setOptimizationOpportunities] = useState([]);
    const [overallHealthScore, setOverallHealthScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    useEffect(() => {
        loadIntegrationData();
        const interval = setInterval(loadIntegrationData, 30000);
        return () => clearInterval(interval);
    }, []);
    const loadIntegrationData = async () => {
        try {
            setLoading(true);
            // Mock data with proper sanitization
            const mockSystemsHealth = [
                {
                    systemId: "daman",
                    systemName: "Daman Authorization API",
                    status: "healthy",
                    responseTime: 245,
                    uptime: 99.8,
                    errorRate: 1.2,
                    lastHealthCheck: new Date().toISOString(),
                    complianceScore: 94.2,
                },
                {
                    systemId: "openjet",
                    systemName: "OpenJet Provider Portal",
                    status: "healthy",
                    responseTime: 180,
                    uptime: 99.9,
                    errorRate: 0.5,
                    lastHealthCheck: new Date().toISOString(),
                    complianceScore: 96.8,
                },
                {
                    systemId: "malaffi",
                    systemName: "Malaffi EMR Integration",
                    status: "degraded",
                    responseTime: 680,
                    uptime: 98.5,
                    errorRate: 3.2,
                    lastHealthCheck: new Date().toISOString(),
                    complianceScore: 89.3,
                },
                {
                    systemId: "doh",
                    systemName: "DOH Compliance System",
                    status: "healthy",
                    responseTime: 320,
                    uptime: 99.5,
                    errorRate: 1.8,
                    lastHealthCheck: new Date().toISOString(),
                    complianceScore: 92.1,
                },
            ];
            const mockIntegrationMetrics = [
                {
                    id: "total_requests",
                    name: "Total API Requests",
                    value: 12847,
                    unit: "requests",
                    status: "excellent",
                    trend: "up",
                },
                {
                    id: "success_rate",
                    name: "Success Rate",
                    value: 96.2,
                    unit: "%",
                    status: "good",
                    trend: "stable",
                    target: 95,
                },
                {
                    id: "avg_response_time",
                    name: "Average Response Time",
                    value: 285,
                    unit: "ms",
                    status: "good",
                    trend: "down",
                    target: 300,
                },
                {
                    id: "throughput",
                    name: "Throughput",
                    value: 145.8,
                    unit: "req/min",
                    status: "excellent",
                    trend: "up",
                },
            ];
            const mockPredictedIssues = [
                {
                    id: "1",
                    systemId: "malaffi",
                    type: "performance_degradation",
                    severity: "medium",
                    probability: 0.75,
                    timeToOccurrence: 4,
                    description: "Response time trending upward, potential performance degradation expected",
                    preventiveActions: [
                        "Scale resources",
                        "Optimize database queries",
                        "Review system load",
                    ],
                },
                {
                    id: "2",
                    systemId: "daman",
                    type: "capacity_limit",
                    severity: "low",
                    probability: 0.35,
                    timeToOccurrence: 12,
                    description: "API rate limits may be reached during peak hours",
                    preventiveActions: [
                        "Request rate limit increase",
                        "Implement request queuing",
                        "Load balancing",
                    ],
                },
            ];
            const mockOptimizationOpportunities = [
                {
                    id: "1",
                    systemId: "daman",
                    type: "performance",
                    description: "Implement response caching for frequently accessed authorization data",
                    expectedBenefit: "25% reduction in response time",
                    implementationEffort: "medium",
                    estimatedROI: 2.8,
                },
                {
                    id: "2",
                    systemId: "openjet",
                    type: "cost",
                    description: "Optimize API call patterns to reduce unnecessary requests",
                    expectedBenefit: "15% cost reduction",
                    implementationEffort: "low",
                    estimatedROI: 3.2,
                },
            ];
            // Sanitize data
            const sanitizedSystems = mockSystemsHealth.map((system) => ({
                ...system,
                systemName: inputSanitizer.sanitizeText(system.systemName, 100)
                    .sanitized,
                lastHealthCheck: inputSanitizer.sanitizeText(system.lastHealthCheck, 50)
                    .sanitized,
            }));
            const sanitizedMetrics = mockIntegrationMetrics.map((metric) => ({
                ...metric,
                name: inputSanitizer.sanitizeText(metric.name, 100).sanitized,
                unit: inputSanitizer.sanitizeText(metric.unit, 20).sanitized,
            }));
            const sanitizedIssues = mockPredictedIssues.map((issue) => ({
                ...issue,
                description: inputSanitizer.sanitizeText(issue.description, 500)
                    .sanitized,
                preventiveActions: issue.preventiveActions.map((action) => inputSanitizer.sanitizeText(action, 200).sanitized),
            }));
            const sanitizedOpportunities = mockOptimizationOpportunities.map((opp) => ({
                ...opp,
                description: inputSanitizer.sanitizeText(opp.description, 500)
                    .sanitized,
                expectedBenefit: inputSanitizer.sanitizeText(opp.expectedBenefit, 200)
                    .sanitized,
            }));
            setSystemsHealth(sanitizedSystems);
            setIntegrationMetrics(sanitizedMetrics);
            setPredictedIssues(sanitizedIssues);
            setOptimizationOpportunities(sanitizedOpportunities);
            // Calculate overall health score
            const avgHealth = sanitizedSystems.reduce((sum, system) => {
                let score = 100;
                if (system.status === "degraded")
                    score = 75;
                else if (system.status === "critical")
                    score = 50;
                else if (system.status === "offline")
                    score = 0;
                return sum + score;
            }, 0) / sanitizedSystems.length;
            setOverallHealthScore(Math.round(avgHealth));
            setLastRefresh(new Date());
        }
        catch (error) {
            console.error("Error loading integration data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "healthy":
                return _jsx(CheckCircle, { className: "h-5 w-5 text-green-500" });
            case "degraded":
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-500" });
            case "critical":
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" });
            case "offline":
                return _jsx(WifiOff, { className: "h-5 w-5 text-gray-500" });
            default:
                return _jsx(Activity, { className: "h-5 w-5 text-blue-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "healthy":
                return "text-green-600 bg-green-50";
            case "degraded":
                return "text-yellow-600 bg-yellow-50";
            case "critical":
                return "text-red-600 bg-red-50";
            case "offline":
                return "text-gray-600 bg-gray-50";
            default:
                return "text-blue-600 bg-blue-50";
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
    const generateIntelligenceReport = async () => {
        try {
            const reportData = {
                timestamp: new Date().toISOString(),
                overallHealthScore,
                systemsHealth,
                integrationMetrics,
                predictedIssues: predictedIssues.filter((issue) => issue.severity === "high" || issue.severity === "critical"),
                optimizationOpportunities: optimizationOpportunities.filter((opp) => opp.estimatedROI > 2),
                summary: {
                    totalSystems: systemsHealth.length,
                    healthySystems: systemsHealth.filter((s) => s.status === "healthy")
                        .length,
                    criticalIssues: predictedIssues.filter((i) => i.severity === "critical").length,
                    highROIOpportunities: optimizationOpportunities.filter((o) => o.estimatedROI > 3).length,
                },
            };
            const jsonString = JsonValidator.safeStringify(reportData, 2);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                throw new Error(`Report generation failed: ${validation.errors?.join(", ")}`);
            }
            console.log("Integration intelligence report generated:", reportData);
        }
        catch (error) {
            console.error("Error generating intelligence report:", error);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center h-96", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin" }), _jsx("span", { className: "ml-2", children: "Loading integration intelligence..." })] }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-white min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Integration Intelligence Dashboard" }), _jsx("p", { className: "text-gray-600 mt-2", children: "AI-powered insights for Daman and OpenJet integrations" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Last updated: ", lastRefresh.toLocaleTimeString()] }), _jsxs(Button, { onClick: loadIntegrationData, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }), _jsxs(Button, { onClick: generateIntelligenceReport, children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Globe, { className: "h-5 w-5 mr-2" }), "Overall Integration Health"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-4xl font-bold text-blue-600", children: [overallHealthScore, "%"] }), _jsxs("div", { className: "flex-1", children: [_jsx(Progress, { value: overallHealthScore, className: "h-3" }), _jsxs("div", { className: "flex justify-between text-sm text-gray-500 mt-1", children: [_jsx("span", { children: "0%" }), _jsx("span", { children: "Target: 95%" }), _jsx("span", { children: "100%" })] })] }), _jsx(Badge, { variant: overallHealthScore >= 95
                                        ? "default"
                                        : overallHealthScore >= 85
                                            ? "secondary"
                                            : "destructive", children: overallHealthScore >= 95
                                        ? "Excellent"
                                        : overallHealthScore >= 85
                                            ? "Good"
                                            : "Needs Attention" })] }) })] }), predictedIssues.filter((issue) => issue.severity === "critical" || issue.severity === "high").length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Predicted Issues Detected" }), _jsxs(AlertDescription, { children: [predictedIssues.filter((issue) => issue.severity === "critical" || issue.severity === "high").length, " ", "high-priority issues predicted. Review the Intelligence tab for details."] })] })), _jsxs(Tabs, { defaultValue: "systems", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "systems", children: "System Health" }), _jsx(TabsTrigger, { value: "metrics", children: "Performance Metrics" }), _jsx(TabsTrigger, { value: "intelligence", children: "AI Intelligence" }), _jsx(TabsTrigger, { value: "optimization", children: "Optimization" })] }), _jsx(TabsContent, { value: "systems", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: systemsHealth.map((system) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-lg flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [getStatusIcon(system.status), _jsx("span", { className: "ml-2", children: system.systemName })] }), _jsx(Badge, { className: getStatusColor(system.status), children: system.status })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: "Response Time" }), _jsxs("div", { className: "font-semibold", children: [system.responseTime, "ms"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: "Uptime" }), _jsxs("div", { className: "font-semibold", children: [system.uptime, "%"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: "Error Rate" }), _jsxs("div", { className: "font-semibold", children: [system.errorRate, "%"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: "Compliance" }), _jsxs("div", { className: "font-semibold", children: [system.complianceScore, "%"] })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Last check:", " ", new Date(system.lastHealthCheck).toLocaleString()] })] }) })] }, system.systemId))) }) }), _jsx(TabsContent, { value: "metrics", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: integrationMetrics.map((metric) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: metric.name }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-2xl font-bold", children: metric.value.toLocaleString() }), _jsx("span", { className: "text-sm text-gray-500", children: metric.unit })] }), metric.target && (_jsx(Progress, { value: (metric.value / metric.target) * 100, className: "h-2" })), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx(Badge, { variant: metric.status === "excellent"
                                                                ? "default"
                                                                : "secondary", children: metric.status }), _jsxs("div", { className: "flex items-center", children: [metric.trend === "up" && (_jsx(TrendingUp, { className: "h-3 w-3 text-green-500" })), metric.trend === "down" && (_jsx(TrendingUp, { className: "h-3 w-3 text-red-500 rotate-180" })), metric.trend === "stable" && (_jsx(Activity, { className: "h-3 w-3 text-blue-500" }))] })] })] }) })] }, metric.id))) }) }), _jsx(TabsContent, { value: "intelligence", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Zap, { className: "h-5 w-5 mr-2" }), "Predicted Issues"] }), _jsx(CardDescription, { children: "AI-powered predictions of potential system issues" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-64", children: _jsx("div", { className: "space-y-3", children: predictedIssues.map((issue) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Badge, { className: getSeverityColor(issue.severity), children: issue.severity }), _jsxs("span", { className: "text-xs text-gray-500", children: [issue.probability * 100, "% probability"] })] }), _jsx("div", { className: "text-sm font-medium mb-1", children: issue.description }), _jsxs("div", { className: "text-xs text-gray-500 mb-2", children: ["Expected in ", issue.timeToOccurrence, " hours | System:", " ", issue.systemId] }), _jsxs("div", { className: "text-xs", children: [_jsx("div", { className: "font-medium text-gray-700 mb-1", children: "Preventive Actions:" }), _jsx("ul", { className: "list-disc list-inside text-gray-600", children: issue.preventiveActions.map((action, index) => (_jsx("li", { children: action }, index))) })] })] }, issue.id))) }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "Optimization Opportunities"] }), _jsx(CardDescription, { children: "Identified opportunities for system improvements" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-64", children: _jsx("div", { className: "space-y-3", children: optimizationOpportunities.map((opportunity) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Badge, { variant: "outline", children: opportunity.type }), _jsxs("span", { className: "text-xs font-medium text-green-600", children: ["ROI: ", opportunity.estimatedROI, "x"] })] }), _jsx("div", { className: "text-sm font-medium mb-1", children: opportunity.description }), _jsxs("div", { className: "text-xs text-gray-600 mb-2", children: ["Expected benefit: ", opportunity.expectedBenefit] }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-gray-500", children: ["System: ", opportunity.systemId] }), _jsxs(Badge, { variant: opportunity.implementationEffort === "low"
                                                                            ? "default"
                                                                            : "secondary", children: [opportunity.implementationEffort, " effort"] })] })] }, opportunity.id))) }) }) })] })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Performance Optimization" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Response Time Improvement" }), _jsx("span", { className: "font-bold text-green-600", children: "-25%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Throughput Increase" }), _jsx("span", { className: "font-bold text-green-600", children: "+40%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Error Rate Reduction" }), _jsx("span", { className: "font-bold text-green-600", children: "-50%" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Cost Optimization" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Infrastructure Savings" }), _jsx("span", { className: "font-bold text-green-600", children: "$2,500/mo" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "API Call Optimization" }), _jsx("span", { className: "font-bold text-green-600", children: "15%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Resource Utilization" }), _jsx("span", { className: "font-bold text-blue-600", children: "85%" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Reliability Enhancement" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Uptime Target" }), _jsx("span", { className: "font-bold text-blue-600", children: "99.9%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "MTBF Improvement" }), _jsx("span", { className: "font-bold text-green-600", children: "+200%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Recovery Time" }), _jsx("span", { className: "font-bold text-green-600", children: "-60%" })] })] }) })] })] }) })] })] }));
};
export default DamanIntegrationIntelligenceDashboard;
