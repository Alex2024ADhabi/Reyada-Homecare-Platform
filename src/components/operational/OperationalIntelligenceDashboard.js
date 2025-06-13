import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, Car, AlertTriangle, TrendingUp, MapPin, Clock, Target, BarChart3, RefreshCw, Zap, Brain, Shield, } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export default function OperationalIntelligenceDashboard({ facilityId = "RHHCS-001", refreshInterval = 30000, }) {
    const [metrics, setMetrics] = useState({
        activeVisits: 45,
        staffOnDuty: 28,
        vehiclesInUse: 12,
        emergencyAlerts: 0,
        patientSatisfaction: 94.5,
        resourceUtilization: 87.2,
        routeEfficiency: 92.8,
        complianceScore: 98.1,
        // New DOH Homecare Standards Metrics
        homeboundAssessments: 42,
        levelOfCareClassifications: 45,
        nineDomainsCompliance: 96.8,
        digitalFormsCompletion: 98.2,
        communicationCompliance: 100.0,
        enhancedComplianceScore: 97.5,
    });
    const [predictiveInsights, setPredictiveInsights] = useState([
        {
            id: "insight-001",
            type: "demand",
            title: "Increased Demand Forecast",
            description: "15% increase in service requests expected next week based on seasonal patterns",
            confidence: 87,
            impact: "high",
            timeframe: "Next 7 days",
            actionRequired: true,
        },
        {
            id: "insight-002",
            type: "resource",
            title: "Staff Optimization Opportunity",
            description: "Reallocating 3 nurses to Zone B could improve response times by 12%",
            confidence: 92,
            impact: "medium",
            timeframe: "Immediate",
            actionRequired: true,
        },
        {
            id: "insight-003",
            type: "risk",
            title: "Patient Risk Alert",
            description: "2 high-complexity patients showing early warning signs for hospitalization",
            confidence: 95,
            impact: "high",
            timeframe: "Next 48 hours",
            actionRequired: true,
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    useEffect(() => {
        const interval = setInterval(() => {
            refreshMetrics();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);
    const refreshMetrics = async () => {
        setLoading(true);
        try {
            // Simulate real-time data updates
            setMetrics((prev) => ({
                ...prev,
                activeVisits: prev.activeVisits + Math.floor(Math.random() * 5) - 2,
                staffOnDuty: prev.staffOnDuty + Math.floor(Math.random() * 3) - 1,
                vehiclesInUse: prev.vehiclesInUse + Math.floor(Math.random() * 3) - 1,
                resourceUtilization: Math.min(100, Math.max(70, prev.resourceUtilization + Math.random() * 4 - 2)),
                routeEfficiency: Math.min(100, Math.max(80, prev.routeEfficiency + Math.random() * 3 - 1.5)),
            }));
        }
        catch (error) {
            console.error("Error refreshing metrics:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getInsightIcon = (type) => {
        switch (type) {
            case "demand":
                return _jsx(TrendingUp, { className: "w-4 h-4" });
            case "resource":
                return _jsx(Users, { className: "w-4 h-4" });
            case "risk":
                return _jsx(AlertTriangle, { className: "w-4 h-4" });
            case "optimization":
                return _jsx(Target, { className: "w-4 h-4" });
            default:
                return _jsx(Brain, { className: "w-4 h-4" });
        }
    };
    const getImpactColor = (impact) => {
        switch (impact) {
            case "high":
                return "text-red-600 bg-red-100";
            case "medium":
                return "text-orange-600 bg-orange-100";
            case "low":
                return "text-green-600 bg-green-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [_jsx(Brain, { className: "w-8 h-8 mr-3 text-blue-600" }), "Operational Intelligence Dashboard"] }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["Real-time operational insights and predictive analytics for", " ", facilityId] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(Zap, { className: "w-3 h-3" }), "Live Data"] }), _jsxs(Button, { onClick: refreshMetrics, variant: "outline", size: "sm", disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4" }), "Active Visits"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: metrics.activeVisits }), _jsx("p", { className: "text-xs text-blue-600", children: "Currently in progress" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Staff on Duty"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: metrics.staffOnDuty }), _jsx("p", { className: "text-xs text-green-600", children: "Available for assignments" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Car, { className: "w-4 h-4" }), "Vehicles in Use"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: metrics.vehiclesInUse }), _jsx("p", { className: "text-xs text-purple-600", children: "Active fleet utilization" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), "Compliance Score"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-orange-900", children: [metrics.complianceScore, "%"] }), _jsx("p", { className: "text-xs text-orange-600", children: "DOH & JAWDA compliant" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "predictive", children: "Predictive Analytics" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "optimization", children: "Optimization" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Resource Utilization" }), _jsx(CardDescription, { children: "Real-time utilization across all resources" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Staff Utilization" }), _jsxs("span", { children: [metrics.resourceUtilization.toFixed(1), "%"] })] }), _jsx(Progress, { value: metrics.resourceUtilization, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Route Efficiency" }), _jsxs("span", { children: [metrics.routeEfficiency.toFixed(1), "%"] })] }), _jsx(Progress, { value: metrics.routeEfficiency, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Patient Satisfaction" }), _jsxs("span", { children: [metrics.patientSatisfaction.toFixed(1), "%"] })] }), _jsx(Progress, { value: metrics.patientSatisfaction, className: "h-2" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Emergency Alerts" }), _jsx(CardDescription, { children: "Real-time monitoring and alert system" })] }), _jsx(CardContent, { children: metrics.emergencyAlerts === 0 ? (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(Shield, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "All Systems Normal" }), _jsx(AlertDescription, { className: "text-green-700", children: "No emergency alerts or critical issues detected." })] })) : (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs(AlertTitle, { className: "text-red-800", children: [metrics.emergencyAlerts, " Active Alert(s)"] }), _jsx(AlertDescription, { className: "text-red-700", children: "Immediate attention required for critical situations." })] })) })] })] }) }), _jsx(TabsContent, { value: "predictive", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI-Powered Insights" }), _jsx(CardDescription, { children: "Predictive analytics and intelligent recommendations" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: predictiveInsights.map((insight) => (_jsx(Card, { className: "border-l-4 border-l-blue-400", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getInsightIcon(insight.type), _jsx("h4", { className: "font-semibold", children: insight.title })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getImpactColor(insight.impact), children: insight.impact.toUpperCase() }), insight.actionRequired && (_jsx(Badge, { variant: "outline", className: "text-red-600", children: "Action Required" }))] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: insight.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Confidence: ", insight.confidence, "%"] }), _jsxs("span", { children: ["Timeframe: ", insight.timeframe] })] }), _jsx(Progress, { value: insight.confidence, className: "h-1 mt-2" })] }) }, insight.id))) }) })] }) }), _jsx(TabsContent, { value: "performance", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Metrics" }), _jsx(CardDescription, { children: "Key performance indicators and trends" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Average Response Time" })] }), _jsx("span", { className: "text-sm font-bold", children: "18 min" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Service Completion Rate" })] }), _jsx("span", { className: "text-sm font-bold", children: "97.8%" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Route Optimization" })] }), _jsx("span", { className: "text-sm font-bold", children: "92.8%" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quality Indicators" }), _jsx(CardDescription, { children: "JAWDA KPI performance and quality metrics" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Patient Satisfaction" })] }), _jsxs("span", { className: "text-sm font-bold", children: [metrics.patientSatisfaction, "%"] })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-red-600" }), _jsx("span", { className: "text-sm font-medium", children: "Safety Score" })] }), _jsx("span", { className: "text-sm font-bold", children: "99.2%" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Clinical Outcomes" })] }), _jsx("span", { className: "text-sm font-bold", children: "96.5%" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Optimization Recommendations" }), _jsx(CardDescription, { children: "AI-powered recommendations for operational improvements" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Brain, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Route Optimization Opportunity" }), _jsx(AlertDescription, { className: "text-blue-700", children: "Implementing dynamic route adjustments could reduce travel time by 15% and fuel costs by 12%." })] }), _jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(Users, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Staff Allocation Enhancement" }), _jsx(AlertDescription, { className: "text-green-700", children: "Redistributing staff based on patient complexity scores could improve care quality by 8%." })] }), _jsxs(Alert, { className: "bg-purple-50 border-purple-200", children: [_jsx(Target, { className: "h-4 w-4 text-purple-600" }), _jsx(AlertTitle, { className: "text-purple-800", children: "Resource Utilization Improvement" }), _jsx(AlertDescription, { className: "text-purple-700", children: "Equipment sharing optimization could increase utilization by 10% and reduce costs by 7%." })] })] }) })] }) })] })] }) }));
}
