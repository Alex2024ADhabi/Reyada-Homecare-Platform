import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { CheckCircle, TrendingUp, BarChart3, Users, Target, Activity, Zap, Database, } from "lucide-react";
export default function JAWDAEnhancementDashboard() {
    const [metrics, setMetrics] = useState([]);
    const [enhancements, setEnhancements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    useEffect(() => {
        loadJAWDAData();
    }, []);
    const loadJAWDAData = async () => {
        try {
            setLoading(true);
            // Mock JAWDA metrics data
            const mockMetrics = [
                {
                    id: "kpi-collection",
                    name: "KPI Data Collection Automation",
                    value: 98,
                    target: 95,
                    trend: "up",
                    status: "excellent",
                    lastUpdated: "2024-12-18T10:00:00Z",
                },
                {
                    id: "training-compliance",
                    name: "Training Compliance Rate",
                    value: 100,
                    target: 90,
                    trend: "up",
                    status: "excellent",
                    lastUpdated: "2024-12-18T09:30:00Z",
                },
                {
                    id: "audit-readiness",
                    name: "Audit Readiness Score",
                    value: 96,
                    target: 85,
                    trend: "up",
                    status: "excellent",
                    lastUpdated: "2024-12-18T11:15:00Z",
                },
                {
                    id: "incident-classification",
                    name: "Incident Classification Accuracy",
                    value: 94,
                    target: 90,
                    trend: "stable",
                    status: "excellent",
                    lastUpdated: "2024-12-18T08:45:00Z",
                },
                {
                    id: "quality-metrics",
                    name: "Quality Metrics Reporting",
                    value: 97,
                    target: 92,
                    trend: "up",
                    status: "excellent",
                    lastUpdated: "2024-12-18T12:00:00Z",
                },
                {
                    id: "risk-management",
                    name: "Risk Management Effectiveness",
                    value: 93,
                    target: 88,
                    trend: "up",
                    status: "excellent",
                    lastUpdated: "2024-12-18T10:30:00Z",
                },
            ];
            // Mock JAWDA enhancements data
            const mockEnhancements = [
                {
                    id: "auto-kpi-collection",
                    title: "Automated KPI Data Collection System",
                    description: "Real-time automated collection and validation of JAWDA KPI data with error handling and alerts",
                    category: "automation",
                    status: "completed",
                    impact: "high",
                    completionDate: "2024-12-15",
                    benefits: [
                        "Eliminated manual data entry errors",
                        "Reduced data collection time by 85%",
                        "Real-time validation and alerts",
                        "Comprehensive audit trail",
                    ],
                },
                {
                    id: "training-management",
                    title: "Enhanced Training Management System",
                    description: "Digital training tracking with automated reminders, compliance verification, and reporting",
                    category: "training",
                    status: "completed",
                    impact: "high",
                    completionDate: "2024-12-10",
                    benefits: [
                        "100% training compliance tracking",
                        "Automated reminder system",
                        "Digital signature validation",
                        "Comprehensive training analytics",
                    ],
                },
                {
                    id: "quality-reporting",
                    title: "Automated Quality Metrics Reporting",
                    description: "Automated generation of monthly and quarterly quality reports with trend analysis",
                    category: "reporting",
                    status: "completed",
                    impact: "high",
                    completionDate: "2024-12-12",
                    benefits: [
                        "Automated report generation",
                        "Real-time trend analysis",
                        "Predictive quality indicators",
                        "Stakeholder dashboard integration",
                    ],
                },
                {
                    id: "emr-audit-enhancement",
                    title: "EMR Audit Log System Enhancement",
                    description: "Comprehensive EMR audit logging with real-time monitoring and automated compliance checks",
                    category: "monitoring",
                    status: "completed",
                    impact: "high",
                    completionDate: "2024-12-08",
                    benefits: [
                        "Real-time audit log monitoring",
                        "Automated compliance verification",
                        "Enhanced security tracking",
                        "Performance optimization",
                    ],
                },
                {
                    id: "risk-assessment-framework",
                    title: "Risk Assessment and Mitigation Framework",
                    description: "Comprehensive risk assessment with automated mitigation tracking and reporting",
                    category: "monitoring",
                    status: "completed",
                    impact: "high",
                    completionDate: "2024-12-14",
                    benefits: [
                        "Proactive risk identification",
                        "Automated mitigation tracking",
                        "Risk trend analysis",
                        "Compliance risk scoring",
                    ],
                },
                {
                    id: "incident-management-enhancement",
                    title: "Patient Safety Incident Management Enhancement",
                    description: "Enhanced incident classification with automated DOH taxonomy compliance",
                    category: "automation",
                    status: "completed",
                    impact: "high",
                    completionDate: "2024-12-11",
                    benefits: [
                        "Automated DOH taxonomy classification",
                        "Real-time incident tracking",
                        "Enhanced reporting capabilities",
                        "Compliance verification",
                    ],
                },
            ];
            setMetrics(mockMetrics);
            setEnhancements(mockEnhancements);
        }
        catch (error) {
            console.error("Error loading JAWDA data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            excellent: "bg-green-100 text-green-800",
            good: "bg-blue-100 text-blue-800",
            needs_attention: "bg-yellow-100 text-yellow-800",
        };
        return (_jsx(Badge, { className: variants[status], children: status.replace("_", " ").toUpperCase() }));
    };
    const getEnhancementStatusBadge = (status) => {
        const variants = {
            completed: "bg-green-100 text-green-800",
            in_progress: "bg-blue-100 text-blue-800",
            planned: "bg-gray-100 text-gray-800",
        };
        return (_jsx(Badge, { className: variants[status], children: status.replace("_", " ").toUpperCase() }));
    };
    const getImpactBadge = (impact) => {
        const variants = {
            high: "bg-red-100 text-red-800",
            medium: "bg-yellow-100 text-yellow-800",
            low: "bg-green-100 text-green-800",
        };
        return (_jsx(Badge, { className: variants[impact], children: impact.toUpperCase() }));
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case "automation":
                return _jsx(Zap, { className: "w-4 h-4" });
            case "reporting":
                return _jsx(BarChart3, { className: "w-4 h-4" });
            case "training":
                return _jsx(Users, { className: "w-4 h-4" });
            case "monitoring":
                return _jsx(Activity, { className: "w-4 h-4" });
            default:
                return _jsx(Target, { className: "w-4 h-4" });
        }
    };
    const overallScore = Math.round(metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length);
    const completedEnhancements = enhancements.filter((e) => e.status === "completed").length;
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "JAWDA Enhancement Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Comprehensive JAWDA implementation with automated KPI management and compliance monitoring" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), "Implementation Complete"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Overall JAWDA Score"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [overallScore, "%"] }), _jsx(Progress, { value: overallScore, className: "h-2 mt-2" }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "Excellent compliance level" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Completed Enhancements"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [completedEnhancements, "/", enhancements.length] }), _jsx("p", { className: "text-xs text-blue-600", children: "All critical enhancements deployed" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Database, { className: "w-4 h-4" }), "Automated KPIs"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: metrics.length }), _jsx("p", { className: "text-xs text-purple-600", children: "Real-time monitoring active" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "Performance Improvement"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: "+24%" }), _jsx("p", { className: "text-xs text-orange-600", children: "Since JAWDA implementation" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "metrics", children: "KPI Metrics" }), _jsx(TabsTrigger, { value: "enhancements", children: "Enhancements" }), _jsx(TabsTrigger, { value: "benefits", children: "Benefits" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JAWDA Implementation Status" }), _jsx(CardDescription, { children: "Current status of all JAWDA enhancement initiatives" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: enhancements.slice(0, 3).map((enhancement) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getCategoryIcon(enhancement.category), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: enhancement.title }), _jsx("p", { className: "text-sm text-gray-600", children: enhancement.category })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getEnhancementStatusBadge(enhancement.status), getImpactBadge(enhancement.impact)] })] }, enhancement.id))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Key Performance Indicators" }), _jsx(CardDescription, { children: "Real-time JAWDA compliance metrics" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: metrics.slice(0, 3).map((metric) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: metric.name }), _jsxs("span", { className: "text-sm text-gray-600", children: [metric.value, "%"] })] }), _jsx(Progress, { value: metric.value, className: "h-2" })] }, metric.id))) }) })] })] }) }), _jsx(TabsContent, { value: "metrics", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JAWDA KPI Metrics" }), _jsx(CardDescription, { children: "Comprehensive view of all JAWDA key performance indicators" })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Metric" }), _jsx(TableHead, { children: "Current Value" }), _jsx(TableHead, { children: "Target" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Trend" }), _jsx(TableHead, { children: "Last Updated" })] }) }), _jsx(TableBody, { children: metrics.map((metric) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: metric.name }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: metric.value, className: "h-2 w-16" }), _jsxs("span", { className: "text-sm font-medium", children: [metric.value, "%"] })] }) }), _jsxs(TableCell, { children: [metric.target, "%"] }), _jsx(TableCell, { children: getStatusBadge(metric.status) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1", children: [metric.trend === "up" && (_jsx(TrendingUp, { className: "w-4 h-4 text-green-600" })), metric.trend === "down" && (_jsx(TrendingUp, { className: "w-4 h-4 text-red-600 rotate-180" })), metric.trend === "stable" && (_jsx("div", { className: "w-4 h-4 bg-gray-400 rounded-full" })), _jsx("span", { className: "text-sm capitalize", children: metric.trend })] }) }), _jsx(TableCell, { className: "text-sm text-gray-600", children: new Date(metric.lastUpdated).toLocaleString() })] }, metric.id))) })] }) }) })] }) }), _jsx(TabsContent, { value: "enhancements", className: "space-y-6", children: _jsx("div", { className: "space-y-4", children: enhancements.map((enhancement) => (_jsx(Card, { className: "border-l-4 border-l-green-400", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getCategoryIcon(enhancement.category), _jsx("h4", { className: "font-semibold text-lg", children: enhancement.title })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: enhancement.description }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("span", { children: ["Category: ", enhancement.category] }), _jsxs("span", { children: ["Completed: ", enhancement.completionDate] })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [getEnhancementStatusBadge(enhancement.status), getImpactBadge(enhancement.impact)] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium mb-2", children: "Key Benefits:" }), _jsx("ul", { className: "list-disc list-inside text-sm text-gray-600 space-y-1", children: enhancement.benefits.map((benefit, index) => (_jsx("li", { children: benefit }, index))) })] })] }) }, enhancement.id))) }) }), _jsx(TabsContent, { value: "benefits", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Operational Benefits" }), _jsx(CardDescription, { children: "Improvements in day-to-day operations" })] }), _jsx(CardContent, { children: _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "85% reduction in manual data entry" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "100% training compliance tracking" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Real-time audit readiness monitoring" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Automated compliance verification" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quality Improvements" }), _jsx(CardDescription, { children: "Enhanced quality metrics and outcomes" })] }), _jsx(CardContent, { children: _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "24% improvement in overall compliance" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "98% KPI data accuracy" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "Proactive risk identification" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "Enhanced incident management" })] })] }) })] })] }) })] })] }) }));
}
