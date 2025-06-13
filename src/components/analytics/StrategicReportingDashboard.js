import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, FileText, BarChart3, Download, RefreshCw, AlertCircle, CheckCircle, } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
const StrategicReportingDashboard = () => {
    const { toast } = useToastContext();
    const [activeTab, setActiveTab] = useState("executive-summary");
    const [selectedPeriod, setSelectedPeriod] = useState("current-quarter");
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    // Mock data - in real implementation, this would come from analytics service
    const [executiveSummary, setExecutiveSummary] = useState({
        period: "Q4 2024",
        totalRevenue: 12450000,
        revenueGrowth: 18.5,
        totalPatients: 3247,
        patientGrowth: 12.3,
        operationalEfficiency: 87.2,
        qualityScore: 94.1,
        keyAchievements: [
            "Exceeded quarterly revenue target by 15%",
            "Achieved 98% patient satisfaction rating",
            "Reduced average response time by 23%",
            "Implemented AI-powered care optimization",
        ],
        criticalIssues: [
            "Staff shortage in physiotherapy department",
            "Delayed implementation of new EHR system",
            "Compliance documentation backlog",
        ],
        strategicInitiatives: [
            {
                name: "Digital Transformation Program",
                status: "on-track",
                progress: 78,
                impact: "Expected 25% efficiency improvement",
            },
            {
                name: "Quality Excellence Initiative",
                status: "completed",
                progress: 100,
                impact: "Achieved 94.1% quality score",
            },
            {
                name: "Market Expansion Strategy",
                status: "at-risk",
                progress: 45,
                impact: "Potential 30% patient volume increase",
            },
        ],
    });
    const [financialForecast, setFinancialForecast] = useState({
        period: "Next 12 Months",
        revenue: {
            current: 12450000,
            projected: 15680000,
            growth: 25.9,
            confidence: 87,
        },
        expenses: {
            current: 9340000,
            projected: 11250000,
            change: 20.4,
        },
        profitability: {
            current: 3110000,
            projected: 4430000,
            margin: 28.3,
        },
        cashFlow: {
            operating: 3850000,
            investing: -1200000,
            financing: -500000,
            net: 2150000,
        },
        scenarios: {
            optimistic: 17200000,
            realistic: 15680000,
            pessimistic: 14100000,
        },
    });
    const [operationalMetrics, setOperationalMetrics] = useState([
        {
            category: "Patient Care",
            metrics: [
                {
                    name: "Average Response Time",
                    current: 2.3,
                    target: 2.0,
                    trend: "improving",
                    unit: "hours",
                    benchmark: 2.8,
                },
                {
                    name: "Patient Satisfaction",
                    current: 94.2,
                    target: 95.0,
                    trend: "stable",
                    unit: "%",
                    benchmark: 87.5,
                },
                {
                    name: "Care Plan Adherence",
                    current: 91.7,
                    target: 95.0,
                    trend: "improving",
                    unit: "%",
                    benchmark: 89.2,
                },
            ],
            efficiency: {
                score: 87.2,
                factors: [
                    "Optimized scheduling",
                    "Staff training",
                    "Technology adoption",
                ],
                improvements: [
                    {
                        action: "Implement AI-powered scheduling",
                        impact: 12,
                        timeline: "3 months",
                    },
                    {
                        action: "Enhanced mobile app features",
                        impact: 8,
                        timeline: "2 months",
                    },
                ],
            },
        },
        {
            category: "Financial Performance",
            metrics: [
                {
                    name: "Revenue per Patient",
                    current: 3834,
                    target: 4000,
                    trend: "improving",
                    unit: "AED",
                    benchmark: 3650,
                },
                {
                    name: "Cost per Visit",
                    current: 287,
                    target: 275,
                    trend: "declining",
                    unit: "AED",
                    benchmark: 310,
                },
                {
                    name: "Collection Rate",
                    current: 96.8,
                    target: 98.0,
                    trend: "stable",
                    unit: "%",
                    benchmark: 94.2,
                },
            ],
            efficiency: {
                score: 82.4,
                factors: [
                    "Automated billing",
                    "Insurance optimization",
                    "Cost control",
                ],
                improvements: [
                    {
                        action: "Optimize insurance claim processing",
                        impact: 15,
                        timeline: "4 months",
                    },
                ],
            },
        },
    ]);
    const [qualityImprovements, setQualityImprovements] = useState([
        {
            domain: "Clinical Excellence",
            currentScore: 91.3,
            targetScore: 95.0,
            improvement: 3.7,
            initiatives: [
                {
                    name: "Evidence-Based Care Protocols",
                    status: "in-progress",
                    impact: 2.1,
                    timeline: "6 months",
                    resources: [
                        "Clinical team",
                        "Training budget",
                        "Technology platform",
                    ],
                },
                {
                    name: "Continuous Quality Monitoring",
                    status: "completed",
                    impact: 1.6,
                    timeline: "Completed",
                    resources: ["Quality team", "Analytics platform"],
                },
            ],
            metrics: [
                {
                    name: "Clinical Outcomes",
                    baseline: 87.5,
                    current: 91.3,
                    target: 95.0,
                    trend: "up",
                },
                {
                    name: "Patient Safety Incidents",
                    baseline: 2.3,
                    current: 1.1,
                    target: 0.5,
                    trend: "down",
                },
            ],
        },
        {
            domain: "Patient Experience",
            currentScore: 94.2,
            targetScore: 96.0,
            improvement: 1.8,
            initiatives: [
                {
                    name: "Patient Communication Enhancement",
                    status: "planning",
                    impact: 1.2,
                    timeline: "4 months",
                    resources: ["Communication team", "Technology upgrade"],
                },
                {
                    name: "Family Engagement Program",
                    status: "in-progress",
                    impact: 0.6,
                    timeline: "3 months",
                    resources: ["Social services", "Training materials"],
                },
            ],
            metrics: [
                {
                    name: "Patient Satisfaction",
                    baseline: 89.7,
                    current: 94.2,
                    target: 96.0,
                    trend: "up",
                },
                {
                    name: "Family Satisfaction",
                    baseline: 91.2,
                    current: 93.8,
                    target: 95.5,
                    trend: "up",
                },
            ],
        },
    ]);
    useEffect(() => {
        // Auto-refresh data every 10 minutes
        const interval = setInterval(() => {
            refreshReports();
        }, 600000);
        return () => clearInterval(interval);
    }, []);
    const refreshReports = async () => {
        setIsLoading(true);
        try {
            // Simulate API call to analytics service
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // Update data with slight variations
            setExecutiveSummary((prev) => ({
                ...prev,
                totalRevenue: prev.totalRevenue + (Math.random() - 0.5) * prev.totalRevenue * 0.02,
                revenueGrowth: prev.revenueGrowth + (Math.random() - 0.5) * 2,
                operationalEfficiency: Math.max(70, Math.min(100, prev.operationalEfficiency + (Math.random() - 0.5) * 3)),
            }));
            setLastUpdated(new Date());
            toast({
                title: "Reports Updated",
                description: "Latest strategic reports have been generated",
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to refresh strategic reports",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const exportReport = async (reportType) => {
        toast({
            title: "Export Started",
            description: `Generating ${reportType} report...`,
            variant: "default",
        });
        // Simulate export process
        setTimeout(() => {
            toast({
                title: "Export Complete",
                description: `${reportType} report has been downloaded`,
                variant: "success",
            });
        }, 2000);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "on-track":
                return "bg-blue-100 text-blue-800";
            case "at-risk":
                return "bg-yellow-100 text-yellow-800";
            case "delayed":
                return "bg-red-100 text-red-800";
            case "in-progress":
                return "bg-purple-100 text-purple-800";
            case "planning":
                return "bg-gray-100 text-gray-800";
            case "on-hold":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "improving":
            case "up":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
            case "declining":
            case "down":
                return _jsx(TrendingDown, { className: "h-4 w-4 text-red-500" });
            default:
                return _jsx(Activity, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsxs("div", { className: "w-full bg-background p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Strategic Reporting Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Executive insights, financial forecasting, and operational analytics" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Select, { value: selectedPeriod, onValueChange: setSelectedPeriod, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "current-quarter", children: "Current Quarter" }), _jsx(SelectItem, { value: "last-quarter", children: "Last Quarter" }), _jsx(SelectItem, { value: "ytd", children: "Year to Date" }), _jsx(SelectItem, { value: "last-year", children: "Last Year" })] })] }), _jsxs(Button, { onClick: refreshReports, disabled: isLoading, children: [isLoading ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(FileText, { className: "h-4 w-4 mr-2" })), "Refresh"] })] })] }), _jsxs("div", { className: "text-sm text-gray-500 mb-6", children: ["Last updated: ", lastUpdated.toLocaleString(), " \u2022 Strategic Analytics Engine"] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "executive-summary", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Executive Summary"] }), _jsxs(TabsTrigger, { value: "financial-forecast", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Financial Forecast"] }), _jsxs(TabsTrigger, { value: "operational-analytics", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Operational Analytics"] }), _jsxs(TabsTrigger, { value: "quality-tracking", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Quality Tracking"] })] }), _jsx(TabsContent, { value: "executive-summary", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Revenue" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(executiveSummary.totalRevenue) }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }), _jsxs("span", { className: "text-sm text-green-600", children: ["+", executiveSummary.revenueGrowth.toFixed(1), "%"] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Active Patients" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: executiveSummary.totalPatients.toLocaleString() }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }), _jsxs("span", { className: "text-sm text-green-600", children: ["+", executiveSummary.patientGrowth.toFixed(1), "%"] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Operational Efficiency" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [executiveSummary.operationalEfficiency.toFixed(1), "%"] }), _jsx(Progress, { value: executiveSummary.operationalEfficiency, className: "mt-2" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Quality Score" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [executiveSummary.qualityScore.toFixed(1), "%"] }), _jsx(Progress, { value: executiveSummary.qualityScore, className: "mt-2" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Strategic Initiatives" }), _jsxs(Button, { size: "sm", onClick: () => exportReport("Strategic Initiatives"), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] }), _jsx(CardDescription, { children: "Progress on key strategic initiatives" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: executiveSummary.strategicInitiatives.map((initiative, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h4", { className: "font-medium", children: initiative.name }), _jsx(Badge, { className: getStatusColor(initiative.status), children: initiative.status.replace("-", " ").toUpperCase() })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [initiative.progress, "%"] })] }), _jsx(Progress, { value: initiative.progress }), _jsx("p", { className: "text-sm text-gray-600", children: initiative.impact })] })] }, index))) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }), "Key Achievements"] }) }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: executiveSummary.keyAchievements.map((achievement, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("div", { className: "w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: achievement })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-500" }), "Critical Issues"] }) }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: executiveSummary.criticalIssues.map((issue, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("div", { className: "w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: issue })] }, index))) }) })] })] })] }) }), _jsx(TabsContent, { value: "financial-forecast", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Revenue Forecast" }), _jsxs(Button, { size: "sm", onClick: () => exportReport("Financial Forecast"), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] }), _jsx(CardDescription, { children: financialForecast.period })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Current Revenue" }), _jsx("div", { className: "text-2xl font-bold", children: formatCurrency(financialForecast.revenue.current) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Projected Revenue" }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(financialForecast.revenue.projected) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Growth Rate" }), _jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["+", financialForecast.revenue.growth.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: "Forecast Confidence" }), _jsxs("span", { children: [financialForecast.revenue.confidence, "%"] })] }), _jsx(Progress, { value: financialForecast.revenue.confidence })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Scenario Analysis" }), _jsx(CardDescription, { children: "Revenue projections under different scenarios" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-green-700 font-medium", children: "Optimistic" }), _jsx("div", { className: "text-xl font-bold text-green-800", children: formatCurrency(financialForecast.scenarios.optimistic) }), _jsxs("div", { className: "text-xs text-green-600 mt-1", children: ["+", (((financialForecast.scenarios.optimistic -
                                                                        financialForecast.revenue.current) /
                                                                        financialForecast.revenue.current) *
                                                                        100).toFixed(1), "%"] })] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-blue-700 font-medium", children: "Realistic" }), _jsx("div", { className: "text-xl font-bold text-blue-800", children: formatCurrency(financialForecast.scenarios.realistic) }), _jsxs("div", { className: "text-xs text-blue-600 mt-1", children: ["+", (((financialForecast.scenarios.realistic -
                                                                        financialForecast.revenue.current) /
                                                                        financialForecast.revenue.current) *
                                                                        100).toFixed(1), "%"] })] }), _jsxs("div", { className: "text-center p-4 bg-orange-50 rounded-lg", children: [_jsx("div", { className: "text-sm text-orange-700 font-medium", children: "Pessimistic" }), _jsx("div", { className: "text-xl font-bold text-orange-800", children: formatCurrency(financialForecast.scenarios.pessimistic) }), _jsxs("div", { className: "text-xs text-orange-600 mt-1", children: ["+", (((financialForecast.scenarios.pessimistic -
                                                                        financialForecast.revenue.current) /
                                                                        financialForecast.revenue.current) *
                                                                        100).toFixed(1), "%"] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cash Flow Analysis" }), _jsx(CardDescription, { children: "Projected cash flow breakdown" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Operating" }), _jsx("div", { className: "text-lg font-bold text-green-600", children: formatCurrency(financialForecast.cashFlow.operating) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Investing" }), _jsx("div", { className: "text-lg font-bold text-red-600", children: formatCurrency(financialForecast.cashFlow.investing) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Financing" }), _jsx("div", { className: "text-lg font-bold text-red-600", children: formatCurrency(financialForecast.cashFlow.financing) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Net Cash Flow" }), _jsx("div", { className: "text-lg font-bold text-blue-600", children: formatCurrency(financialForecast.cashFlow.net) })] })] }) })] })] }) }), _jsx(TabsContent, { value: "operational-analytics", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: operationalMetrics.map((category, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: category.category }), _jsxs(Button, { size: "sm", onClick: () => exportReport(category.category), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] }), _jsxs(CardDescription, { children: ["Efficiency Score: ", category.efficiency.score.toFixed(1), "%"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: category.metrics.map((metric, idx) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: metric.name }), getTrendIcon(metric.trend)] }), _jsxs("div", { className: "text-2xl font-bold", children: [metric.current.toLocaleString(), metric.unit && (_jsx("span", { className: "text-sm text-gray-500 ml-1", children: metric.unit }))] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-2", children: [_jsxs("span", { children: ["Target: ", metric.target.toLocaleString(), metric.unit] }), _jsxs("span", { children: ["Benchmark: ", metric.benchmark.toLocaleString(), metric.unit] })] }), _jsx(Progress, { value: (metric.current / metric.target) * 100, className: "mt-2 h-1" })] }, idx))) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Improvement Opportunities" }), _jsx("div", { className: "space-y-2", children: category.efficiency.improvements.map((improvement, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: improvement.action }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Timeline: ", improvement.timeline] })] }), _jsxs(Badge, { variant: "secondary", children: ["+", improvement.impact, "% impact"] })] }, idx))) })] })] }) })] }, index))) }) }), _jsx(TabsContent, { value: "quality-tracking", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: qualityImprovements.map((domain, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: domain.domain }), _jsxs(Button, { size: "sm", onClick: () => exportReport(domain.domain), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] }), _jsxs(CardDescription, { children: ["Target improvement: +", domain.improvement.toFixed(1), " points"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Current Score" }), _jsx("div", { className: "text-2xl font-bold", children: domain.currentScore.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Target Score" }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: domain.targetScore.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Gap" }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: (domain.targetScore - domain.currentScore).toFixed(1) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Quality Initiatives" }), _jsx("div", { className: "space-y-3", children: domain.initiatives.map((initiative, idx) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h5", { className: "font-medium", children: initiative.name }), _jsx(Badge, { className: getStatusColor(initiative.status), children: initiative.status
                                                                                    .replace("-", " ")
                                                                                    .toUpperCase() })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Impact:" }), _jsxs("span", { className: "ml-2 font-medium", children: ["+", initiative.impact.toFixed(1), " points"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Timeline:" }), _jsx("span", { className: "ml-2", children: initiative.timeline })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Resources:" }), _jsx("span", { className: "ml-2", children: initiative.resources.join(", ") })] })] })] }, idx))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Quality Metrics" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: domain.metrics.map((metric, idx) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium", children: metric.name }), getTrendIcon(metric.trend)] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["Baseline: ", metric.baseline.toFixed(1)] }), _jsxs("span", { children: ["Current: ", metric.current.toFixed(1)] }), _jsxs("span", { children: ["Target: ", metric.target.toFixed(1)] })] }), _jsx(Progress, { value: (metric.current / metric.target) * 100 })] })] }, idx))) })] })] }) })] }, index))) }) })] })] }));
};
export default StrategicReportingDashboard;
