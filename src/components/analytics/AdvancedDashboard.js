import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, CheckCircle, Clock, Target, Zap, Brain, } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import { createDataMart, optimizeETLProcesses, createCustomReport, exportData, generatePDFReport, generateExcelReport, createDocumentWorkflow, processDocumentOCR, implementElectronicSignature, optimizeDatabaseQueries, implementCachingLayer, monitorPerformanceMetrics, configureLoadBalancing, } from "@/api/integration-intelligence.api";
const AdvancedDashboard = ({ dateRange = "30d", refreshInterval = 30000, }) => {
    const { toast } = useToastContext();
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [dataWarehouseMetrics, setDataWarehouseMetrics] = useState({
        totalDataMarts: 4,
        etlProcesses: 12,
        dataQualityScore: 94.2,
        storageUtilization: 78.5,
    });
    const [reportingMetrics, setReportingMetrics] = useState({
        totalReports: 156,
        scheduledReports: 23,
        selfServiceUsers: 45,
        dataExports: 89,
    });
    const [showDataWarehouse, setShowDataWarehouse] = useState(false);
    const [showReporting, setShowReporting] = useState(false);
    const [showSelfService, setShowSelfService] = useState(false);
    const [customReportData, setCustomReportData] = useState(null);
    const [exportProgress, setExportProgress] = useState(null);
    const [documentWorkflows, setDocumentWorkflows] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        queryOptimization: 0,
        cacheHitRate: 0,
        responseTime: 0,
        loadBalancingStatus: "inactive",
    });
    const [documentProcessing, setDocumentProcessing] = useState({
        ocrProgress: 0,
        signatureStatus: "pending",
        versionControl: "v1.0",
    });
    // Mock data - in real implementation, this would come from APIs
    const [metrics, setMetrics] = useState([
        {
            label: "Total Revenue",
            value: 2847500,
            change: 12.5,
            trend: "up",
            target: 3000000,
            unit: "AED",
        },
        {
            label: "Active Patients",
            value: 1247,
            change: 8.3,
            trend: "up",
            target: 1500,
        },
        {
            label: "Compliance Score",
            value: 94.2,
            change: 2.1,
            trend: "up",
            target: 95,
            unit: "%",
        },
        {
            label: "Avg Response Time",
            value: 2.3,
            change: -15.2,
            trend: "up",
            target: 2.0,
            unit: "hrs",
        },
    ]);
    const [chartData, setChartData] = useState([
        { name: "Jan", value: 2400, change: 5.2 },
        { name: "Feb", value: 2210, change: -7.9 },
        { name: "Mar", value: 2290, change: 3.6 },
        { name: "Apr", value: 2000, change: -12.7 },
        { name: "May", value: 2181, change: 9.1 },
        { name: "Jun", value: 2500, change: 14.6 },
    ]);
    const [predictiveInsights, setPredictiveInsights] = useState([
        {
            id: "1",
            title: "Revenue Growth Opportunity",
            description: "Based on current trends, implementing automated billing could increase revenue by 18%",
            confidence: 87,
            impact: "high",
            category: "revenue",
            recommendation: "Deploy automated billing system within next quarter",
            timeframe: "3 months",
        },
        {
            id: "2",
            title: "Staff Optimization Alert",
            description: "Peak demand periods show 23% understaffing in physiotherapy services",
            confidence: 92,
            impact: "medium",
            category: "operations",
            recommendation: "Hire 2 additional physiotherapists or adjust scheduling",
            timeframe: "6 weeks",
        },
        {
            id: "3",
            title: "Compliance Risk Detected",
            description: "Documentation completion rates dropping below DOH requirements",
            confidence: 78,
            impact: "high",
            category: "compliance",
            recommendation: "Implement mandatory documentation checkpoints",
            timeframe: "2 weeks",
        },
    ]);
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);
    const refreshData = async () => {
        setIsLoading(true);
        try {
            // Simulate API calls
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Update metrics with slight variations
            setMetrics((prev) => prev.map((metric) => ({
                ...metric,
                value: metric.value + (Math.random() - 0.5) * metric.value * 0.02,
                change: metric.change + (Math.random() - 0.5) * 2,
            })));
            // Update data warehouse metrics
            setDataWarehouseMetrics((prev) => ({
                totalDataMarts: prev.totalDataMarts + Math.floor(Math.random() * 2),
                etlProcesses: prev.etlProcesses + Math.floor(Math.random() * 3),
                dataQualityScore: Math.min(100, prev.dataQualityScore + (Math.random() - 0.5) * 2),
                storageUtilization: Math.min(100, prev.storageUtilization + (Math.random() - 0.5) * 5),
            }));
            // Update reporting metrics
            setReportingMetrics((prev) => ({
                totalReports: prev.totalReports + Math.floor(Math.random() * 5),
                scheduledReports: prev.scheduledReports + Math.floor(Math.random() * 2),
                selfServiceUsers: prev.selfServiceUsers + Math.floor(Math.random() * 3),
                dataExports: prev.dataExports + Math.floor(Math.random() * 4),
            }));
            setLastUpdated(new Date());
            toast({
                title: "Dashboard Updated",
                description: "Latest data has been loaded",
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to refresh dashboard data",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateDataMart = async () => {
        try {
            const martStructure = {
                martId: `mart_${Date.now()}`,
                name: "Custom Analytics Mart",
                type: "operational",
                schema: {
                    tables: [
                        {
                            name: "analytics_data",
                            columns: [
                                {
                                    name: "id",
                                    type: "varchar(50)",
                                    constraints: ["PRIMARY KEY"],
                                    indexes: ["idx_id"],
                                },
                                {
                                    name: "metric_name",
                                    type: "varchar(100)",
                                    constraints: ["NOT NULL"],
                                    indexes: ["idx_metric"],
                                },
                                {
                                    name: "value",
                                    type: "decimal(10,2)",
                                    constraints: ["NOT NULL"],
                                    indexes: [],
                                },
                                {
                                    name: "timestamp",
                                    type: "datetime",
                                    constraints: ["NOT NULL"],
                                    indexes: ["idx_timestamp"],
                                },
                            ],
                            relationships: [],
                        },
                    ],
                },
                etlProcesses: [],
                dataQualityRules: [],
                refreshSchedule: "0 2 * * *",
                retentionPolicy: "5 years",
                accessControls: ["analytics_team"],
            };
            const martId = await createDataMart(martStructure);
            toast({
                title: "Data Mart Created",
                description: `Successfully created data mart: ${martId}`,
                variant: "success",
            });
            setDataWarehouseMetrics((prev) => ({
                ...prev,
                totalDataMarts: prev.totalDataMarts + 1,
            }));
        }
        catch (error) {
            toast({
                title: "Creation Failed",
                description: "Failed to create data mart",
                variant: "destructive",
            });
        }
    };
    const handleOptimizeETL = async () => {
        try {
            const optimization = await optimizeETLProcesses();
            toast({
                title: "ETL Optimization Complete",
                description: `Overall improvement: ${optimization.overallImprovement.toFixed(1)}%`,
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Optimization Failed",
                description: "Failed to optimize ETL processes",
                variant: "destructive",
            });
        }
    };
    const handleCreateCustomReport = async () => {
        try {
            const reportConfig = {
                name: "Custom Analytics Report",
                dataSources: ["clinical_mart", "financial_mart"],
                visualizations: [
                    { type: "chart", config: { type: "bar" } },
                    { type: "table", config: { columns: ["metric", "value"] } },
                ],
                filters: [],
                userId: "current_user",
            };
            const result = await createCustomReport(reportConfig);
            setCustomReportData(result);
            toast({
                title: "Report Created",
                description: `Custom report created: ${result.reportId}`,
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Report Creation Failed",
                description: "Failed to create custom report",
                variant: "destructive",
            });
        }
    };
    const handleExportData = async (format) => {
        try {
            setExportProgress({ status: "processing", progress: 0 });
            const exportConfig = {
                dataSource: "analytics_mart",
                format: format,
                filters: [],
                columns: ["metric_name", "value", "timestamp"],
                userId: "current_user",
            };
            // Simulate progress
            const progressInterval = setInterval(() => {
                setExportProgress((prev) => {
                    if (prev && prev.progress < 90) {
                        return { ...prev, progress: prev.progress + 10 };
                    }
                    return prev;
                });
            }, 200);
            let result;
            if (format === "pdf") {
                result = await generatePDFReport(exportConfig);
            }
            else if (format === "excel") {
                result = await generateExcelReport(exportConfig);
            }
            else {
                result = await exportData(exportConfig);
            }
            clearInterval(progressInterval);
            setExportProgress({
                status: "completed",
                progress: 100,
                downloadUrl: result.downloadUrl,
            });
            toast({
                title: "Export Complete",
                description: `Data exported successfully as ${format.toUpperCase()}`,
                variant: "success",
            });
        }
        catch (error) {
            setExportProgress(null);
            toast({
                title: "Export Failed",
                description: "Failed to export data",
                variant: "destructive",
            });
        }
    };
    const handleDocumentWorkflow = async (action) => {
        try {
            let result;
            switch (action) {
                case "ocr":
                    setDocumentProcessing((prev) => ({ ...prev, ocrProgress: 0 }));
                    result = await processDocumentOCR({
                        documentId: "sample-doc-001",
                        documentType: "clinical_form",
                        processingOptions: {
                            language: "en",
                            extractTables: true,
                            extractSignatures: true,
                        },
                    });
                    setDocumentProcessing((prev) => ({ ...prev, ocrProgress: 100 }));
                    break;
                case "signature":
                    result = await implementElectronicSignature({
                        documentId: "sample-doc-001",
                        signerEmail: "clinician@rhhcs.ae",
                        signatureType: "electronic",
                        requiresTimestamp: true,
                    });
                    setDocumentProcessing((prev) => ({
                        ...prev,
                        signatureStatus: "completed",
                    }));
                    break;
                case "workflow":
                    result = await createDocumentWorkflow({
                        workflowName: "Clinical Document Review",
                        steps: [
                            { step: "document_upload", assignee: "clinician" },
                            { step: "quality_review", assignee: "quality_manager" },
                            { step: "final_approval", assignee: "medical_director" },
                        ],
                        automationRules: {
                            autoAssign: true,
                            notificationEnabled: true,
                            deadlineTracking: true,
                        },
                    });
                    setDocumentWorkflows((prev) => [...prev, result]);
                    break;
            }
            toast({
                title: "Document Action Complete",
                description: `${action.toUpperCase()} processing completed successfully`,
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Document Action Failed",
                description: `Failed to process ${action}`,
                variant: "destructive",
            });
        }
    };
    const handlePerformanceOptimization = async (action) => {
        try {
            let result;
            switch (action) {
                case "database":
                    result = await optimizeDatabaseQueries({
                        targetTables: ["patients", "clinical_assessments", "care_plans"],
                        optimizationType: "index_optimization",
                        performanceTarget: "sub_100ms",
                    });
                    setPerformanceMetrics((prev) => ({
                        ...prev,
                        queryOptimization: result.improvementPercentage,
                    }));
                    break;
                case "caching":
                    result = await implementCachingLayer({
                        cacheType: "redis",
                        cacheStrategy: "write_through",
                        ttl: 3600,
                        maxMemory: "2gb",
                    });
                    setPerformanceMetrics((prev) => ({
                        ...prev,
                        cacheHitRate: result.hitRate,
                    }));
                    break;
                case "monitoring":
                    result = await monitorPerformanceMetrics({
                        metricsToTrack: [
                            "response_time",
                            "throughput",
                            "error_rate",
                            "resource_utilization",
                        ],
                        alertThresholds: {
                            response_time: 500,
                            error_rate: 5,
                            cpu_utilization: 80,
                        },
                    });
                    setPerformanceMetrics((prev) => ({
                        ...prev,
                        responseTime: result.averageResponseTime,
                    }));
                    break;
                case "loadbalancing":
                    result = await configureLoadBalancing({
                        strategy: "round_robin",
                        healthCheckInterval: 30,
                        autoScaling: {
                            enabled: true,
                            minInstances: 2,
                            maxInstances: 10,
                            targetCPU: 70,
                        },
                    });
                    setPerformanceMetrics((prev) => ({
                        ...prev,
                        loadBalancingStatus: "active",
                    }));
                    break;
            }
            toast({
                title: "Performance Optimization Complete",
                description: `${action.toUpperCase()} optimization implemented successfully`,
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Optimization Failed",
                description: `Failed to implement ${action} optimization`,
                variant: "destructive",
            });
        }
    };
    const formatValue = (value, unit) => {
        if (unit === "AED") {
            return new Intl.NumberFormat("en-AE", {
                style: "currency",
                currency: "AED",
                minimumFractionDigits: 0,
            }).format(value);
        }
        if (unit === "%") {
            return `${value.toFixed(1)}%`;
        }
        if (unit === "hrs") {
            return `${value.toFixed(1)} hrs`;
        }
        return value.toLocaleString();
    };
    const getTrendIcon = (trend, change) => {
        if (trend === "up" && change > 0) {
            return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
        }
        if (trend === "up" && change < 0) {
            return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
        }
        return _jsx(TrendingDown, { className: "h-4 w-4 text-red-500" });
    };
    const getImpactColor = (impact) => {
        switch (impact) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case "revenue":
                return _jsx(DollarSign, { className: "h-4 w-4" });
            case "operations":
                return _jsx(Activity, { className: "h-4 w-4" });
            case "quality":
                return _jsx(Target, { className: "h-4 w-4" });
            case "compliance":
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            default:
                return _jsx(BarChart3, { className: "h-4 w-4" });
        }
    };
    return (_jsxs("div", { className: "w-full bg-background p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Advanced Analytics Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "AI-powered insights and predictive analytics for your homecare operations" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Select, { value: selectedDateRange, onValueChange: setSelectedDateRange, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "Last 7 days" }), _jsx(SelectItem, { value: "30d", children: "Last 30 days" }), _jsx(SelectItem, { value: "90d", children: "Last 90 days" }), _jsx(SelectItem, { value: "1y", children: "Last year" })] })] }), _jsxs(Button, { onClick: refreshData, disabled: isLoading, children: [isLoading ? (_jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(BarChart3, { className: "h-4 w-4 mr-2" })), "Refresh"] })] })] }), _jsxs("div", { className: "text-sm text-gray-500 mb-6", children: ["Last updated: ", lastUpdated.toLocaleString()] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: metrics.map((metric, index) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: metric.label }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: formatValue(metric.value, metric.unit) }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [getTrendIcon(metric.trend, metric.change), _jsxs("span", { className: `text-sm ${metric.change > 0 ? "text-green-600" : "text-red-600"}`, children: [metric.change > 0 ? "+" : "", metric.change.toFixed(1), "%"] })] })] }), metric.target && (_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-xs text-gray-500", children: "Target" }), _jsx("div", { className: "text-sm font-medium", children: formatValue(metric.target, metric.unit) }), _jsxs("div", { className: `text-xs ${metric.value >= metric.target
                                                    ? "text-green-600"
                                                    : "text-red-600"}`, children: [((metric.value / metric.target) * 100).toFixed(1), "%"] })] }))] }) })] }, index))) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-9", children: [_jsxs(TabsTrigger, { value: "overview", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Overview"] }), _jsxs(TabsTrigger, { value: "insights", children: [_jsx(Brain, { className: "h-4 w-4 mr-2" }), "AI Insights"] }), _jsxs(TabsTrigger, { value: "trends", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Trends"] }), _jsxs(TabsTrigger, { value: "alerts", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Alerts"] }), _jsxs(TabsTrigger, { value: "warehouse", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Data Warehouse"] }), _jsxs(TabsTrigger, { value: "reporting", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Advanced Reporting"] }), _jsxs(TabsTrigger, { value: "documents", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Document Management"] }), _jsxs(TabsTrigger, { value: "performance", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Performance"] }), _jsxs(TabsTrigger, { value: "exports", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Export & Reports"] })] }), _jsx(TabsContent, { value: "overview", className: "mt-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Revenue Trend" }), _jsx(CardDescription, { children: "Monthly revenue performance over time" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center bg-gray-50 rounded", children: _jsxs("div", { className: "text-center", children: [_jsx(BarChart3, { className: "h-12 w-12 mx-auto text-gray-400 mb-2" }), _jsx("p", { className: "text-gray-500", children: "Interactive chart would be rendered here" }), _jsx("p", { className: "text-sm text-gray-400", children: "Using Chart.js or similar library" })] }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Distribution" }), _jsx(CardDescription, { children: "Key performance indicators breakdown" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                    {
                                                        label: "Patient Satisfaction",
                                                        value: 94,
                                                        color: "bg-green-500",
                                                    },
                                                    {
                                                        label: "Staff Efficiency",
                                                        value: 87,
                                                        color: "bg-blue-500",
                                                    },
                                                    {
                                                        label: "Compliance Rate",
                                                        value: 96,
                                                        color: "bg-purple-500",
                                                    },
                                                    {
                                                        label: "Revenue Growth",
                                                        value: 78,
                                                        color: "bg-yellow-500",
                                                    },
                                                ].map((item, index) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-24 text-sm", children: item.label }), _jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${item.color}`, style: { width: `${item.value}%` } }) }), _jsxs("div", { className: "w-12 text-sm font-medium", children: [item.value, "%"] })] }, index))) }) })] })] }) }), _jsx(TabsContent, { value: "insights", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: predictiveInsights.map((insight) => (_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getCategoryIcon(insight.category), _jsx(CardTitle, { className: "text-lg", children: insight.title })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { className: getImpactColor(insight.impact), children: [insight.impact.toUpperCase(), " IMPACT"] }), _jsxs(Badge, { variant: "outline", children: [insight.confidence, "% confidence"] })] })] }), _jsx(CardDescription, { children: insight.description })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-sm", children: "Recommendation:" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: insight.recommendation })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-4 w-4" }), "Timeframe: ", insight.timeframe] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Zap, { className: "h-4 w-4" }), "Category: ", insight.category] })] })] }) })] }, insight.id))) }) }), _jsx(TabsContent, { value: "trends", className: "mt-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Trend Analysis" }), _jsx(CardDescription, { children: "Historical data analysis and future projections" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-96 flex items-center justify-center bg-gray-50 rounded", children: _jsxs("div", { className: "text-center", children: [_jsx(TrendingUp, { className: "h-16 w-16 mx-auto text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-500 text-lg", children: "Advanced trend analysis charts" }), _jsx("p", { className: "text-sm text-gray-400", children: "Time series analysis, forecasting, and pattern recognition" })] }) }) })] }) }), _jsx(TabsContent, { value: "alerts", className: "mt-6", children: _jsx("div", { className: "space-y-4", children: [
                                {
                                    type: "warning",
                                    title: "Documentation Compliance Alert",
                                    message: "3 patient records missing required signatures",
                                    time: "2 hours ago",
                                },
                                {
                                    type: "info",
                                    title: "System Maintenance Scheduled",
                                    message: "Planned maintenance window: Sunday 2:00 AM - 4:00 AM",
                                    time: "1 day ago",
                                },
                                {
                                    type: "success",
                                    title: "Monthly Target Achieved",
                                    message: "Revenue target for this month has been exceeded by 12%",
                                    time: "3 days ago",
                                },
                            ].map((alert, index) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-2 rounded-full ${alert.type === "warning"
                                                    ? "bg-yellow-100"
                                                    : alert.type === "info"
                                                        ? "bg-blue-100"
                                                        : "bg-green-100"}`, children: alert.type === "warning" ? (_jsx(AlertCircle, { className: "h-4 w-4 text-yellow-600" })) : alert.type === "info" ? (_jsx(Activity, { className: "h-4 w-4 text-blue-600" })) : (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: alert.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: alert.message }), _jsx("p", { className: "text-xs text-gray-400 mt-2", children: alert.time })] })] }) }) }, index))) }) }), _jsx(TabsContent, { value: "warehouse", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Data Marts" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: dataWarehouseMetrics.totalDataMarts }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Active data marts" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "ETL Processes" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: dataWarehouseMetrics.etlProcesses }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Running processes" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Data Quality Score" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [dataWarehouseMetrics.dataQualityScore.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "+2.1% from last week" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Storage Utilization" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [dataWarehouseMetrics.storageUtilization.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "of allocated space" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Data Mart Management" }), _jsx(CardDescription, { children: "Create and manage data mart structures" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: handleCreateDataMart, className: "w-full", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Create New Data Mart"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Clinical Data Mart - Active" }), _jsx("p", { children: "\u2022 Financial Data Mart - Active" }), _jsx("p", { children: "\u2022 Operational Data Mart - Active" }), _jsx("p", { children: "\u2022 Compliance Data Mart - Active" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "ETL Optimization" }), _jsx(CardDescription, { children: "Monitor and optimize ETL processes" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: handleOptimizeETL, className: "w-full", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Optimize ETL Processes"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Average execution time: 4.2 min" }), _jsx("p", { children: "\u2022 Success rate: 98.5%" }), _jsx("p", { children: "\u2022 Data freshness: 15 min" }), _jsx("p", { children: "\u2022 Next optimization: 2 hours" })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Data Quality Monitoring" }), _jsx(CardDescription, { children: "Real-time data quality metrics and validation" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                    {
                                                        rule: "Completeness Check",
                                                        score: 96.8,
                                                        status: "passing",
                                                    },
                                                    {
                                                        rule: "Accuracy Validation",
                                                        score: 94.2,
                                                        status: "passing",
                                                    },
                                                    {
                                                        rule: "Consistency Rules",
                                                        score: 91.5,
                                                        status: "warning",
                                                    },
                                                    {
                                                        rule: "Uniqueness Constraints",
                                                        score: 98.1,
                                                        status: "passing",
                                                    },
                                                ].map((rule, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${rule.status === "passing"
                                                                        ? "bg-green-500"
                                                                        : "bg-yellow-500"}` }), _jsx("span", { className: "font-medium", children: rule.rule })] }), _jsx("div", { className: "text-right", children: _jsxs("span", { className: "font-bold", children: [rule.score, "%"] }) })] }, index))) }) })] })] }) }), _jsx(TabsContent, { value: "reporting", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Total Reports" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: reportingMetrics.totalReports }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "+12 this month" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Scheduled Reports" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: reportingMetrics.scheduledReports }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Auto-generated" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Self-Service Users" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: reportingMetrics.selfServiceUsers }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "+8 this week" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Data Exports" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: reportingMetrics.dataExports }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "This month" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Custom Report Builder" }), _jsx(CardDescription, { children: "Create custom reports with drag-and-drop interface" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: handleCreateCustomReport, className: "w-full", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Create Custom Report"] }), customReportData && (_jsxs("div", { className: "p-3 bg-green-50 rounded", children: [_jsxs("p", { className: "text-sm text-green-800", children: ["Report created: ", customReportData.reportId] }), _jsxs("p", { className: "text-xs text-green-600 mt-1", children: [customReportData.recommendations.length, " ", "recommendations available"] })] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Self-Service Analytics" }), _jsx(CardDescription, { children: "Enable users to create their own analytics workspaces" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => setShowSelfService(!showSelfService), className: "w-full", children: [_jsx(Brain, { className: "h-4 w-4 mr-2" }), "Launch Self-Service Portal"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Drag-and-drop report builder" }), _jsx("p", { children: "\u2022 Pre-built visualization templates" }), _jsx("p", { children: "\u2022 Real-time data connections" }), _jsx("p", { children: "\u2022 Collaborative workspaces" })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Data Export Capabilities" }), _jsx(CardDescription, { children: "Export data in multiple formats with advanced filtering" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: ["CSV", "Excel", "JSON", "PDF"].map((format) => (_jsxs(Button, { variant: "outline", onClick: () => handleExportData(format.toLowerCase()), className: "w-full", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Export ", format] }, format))) }), exportProgress && (_jsxs("div", { className: "mt-4 p-4 bg-blue-50 rounded", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Export Progress" }), _jsxs("span", { className: "text-sm", children: [exportProgress.progress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${exportProgress.progress}%` } }) }), exportProgress.status === "completed" &&
                                                            exportProgress.downloadUrl && (_jsx("div", { className: "mt-2", children: _jsx("a", { href: exportProgress.downloadUrl, className: "text-blue-600 hover:underline text-sm", target: "_blank", rel: "noopener noreferrer", children: "Download exported file" }) }))] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Automated Report Scheduling" }), _jsx(CardDescription, { children: "Schedule reports to be generated and delivered automatically" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                    {
                                                        name: "Executive Summary",
                                                        frequency: "Daily",
                                                        nextRun: "Tomorrow 8:00 AM",
                                                        recipients: 3,
                                                    },
                                                    {
                                                        name: "Financial Report",
                                                        frequency: "Weekly",
                                                        nextRun: "Monday 9:00 AM",
                                                        recipients: 5,
                                                    },
                                                    {
                                                        name: "Quality Metrics",
                                                        frequency: "Monthly",
                                                        nextRun: "1st of next month",
                                                        recipients: 8,
                                                    },
                                                    {
                                                        name: "Compliance Dashboard",
                                                        frequency: "Weekly",
                                                        nextRun: "Friday 5:00 PM",
                                                        recipients: 12,
                                                    },
                                                ].map((schedule, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: schedule.name }), _jsxs("div", { className: "text-sm text-gray-600", children: [schedule.frequency, " \u2022 Next: ", schedule.nextRun] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: [schedule.recipients, " recipients"] }), _jsx("div", { className: "text-xs text-green-600", children: "Active" })] })] }, index))) }) })] })] }) }), _jsx(TabsContent, { value: "documents", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "OCR Processing" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [documentProcessing.ocrProgress, "%"] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Document extraction progress" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Electronic Signatures" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold capitalize", children: documentProcessing.signatureStatus }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Signature processing status" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Version Control" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: documentProcessing.versionControl }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Current document version" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "OCR & Document Processing" }), _jsx(CardDescription, { children: "Extract text and data from scanned documents" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handleDocumentWorkflow("ocr"), className: "w-full", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Process Document OCR"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Automatic text extraction" }), _jsx("p", { children: "\u2022 Table and form recognition" }), _jsx("p", { children: "\u2022 Signature detection" }), _jsx("p", { children: "\u2022 Multi-language support" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Electronic Signature Integration" }), _jsx(CardDescription, { children: "Secure digital signature workflow" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handleDocumentWorkflow("signature"), className: "w-full", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Implement E-Signature"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Legal compliance" }), _jsx("p", { children: "\u2022 Timestamp verification" }), _jsx("p", { children: "\u2022 Multi-party signing" }), _jsx("p", { children: "\u2022 Audit trail tracking" })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Automated Document Workflow" }), _jsx(CardDescription, { children: "Configure and manage document approval processes" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handleDocumentWorkflow("workflow"), className: "w-full", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Create Document Workflow"] }), documentWorkflows.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "Active Workflows:" }), documentWorkflows.map((workflow, index) => (_jsxs("div", { className: "p-3 bg-gray-50 rounded", children: [_jsx("div", { className: "font-medium", children: workflow.workflowName }), _jsxs("div", { className: "text-sm text-gray-600", children: [workflow.steps?.length || 0, " steps configured"] })] }, index)))] }))] })] })] }) }), _jsx(TabsContent, { value: "performance", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Query Optimization" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [performanceMetrics.queryOptimization.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "Performance improvement" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Cache Hit Rate" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [performanceMetrics.cacheHitRate.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Cache efficiency" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Response Time" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [performanceMetrics.responseTime.toFixed(0), "ms"] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Average response time" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Load Balancing" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold capitalize", children: performanceMetrics.loadBalancingStatus }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Auto-scaling status" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Database Optimization" }), _jsx(CardDescription, { children: "Optimize database queries and indexing" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handlePerformanceOptimization("database"), className: "w-full", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Optimize Database Queries"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Index optimization" }), _jsx("p", { children: "\u2022 Query plan analysis" }), _jsx("p", { children: "\u2022 Performance tuning" }), _jsx("p", { children: "\u2022 Resource monitoring" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Caching Layer Implementation" }), _jsx(CardDescription, { children: "Deploy comprehensive caching strategy" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handlePerformanceOptimization("caching"), className: "w-full", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Implement Caching Layer"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Redis integration" }), _jsx("p", { children: "\u2022 Cache invalidation" }), _jsx("p", { children: "\u2022 Memory optimization" }), _jsx("p", { children: "\u2022 Hit rate monitoring" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Monitoring" }), _jsx(CardDescription, { children: "Real-time system performance tracking" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handlePerformanceOptimization("monitoring"), className: "w-full", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Enable Performance Monitoring"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Real-time metrics" }), _jsx("p", { children: "\u2022 Alert thresholds" }), _jsx("p", { children: "\u2022 Performance dashboards" }), _jsx("p", { children: "\u2022 Historical analysis" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Load Balancing & Auto-Scaling" }), _jsx(CardDescription, { children: "Configure automatic scaling and load distribution" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => handlePerformanceOptimization("loadbalancing"), className: "w-full", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Configure Load Balancing"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Auto-scaling policies" }), _jsx("p", { children: "\u2022 Health check monitoring" }), _jsx("p", { children: "\u2022 Traffic distribution" }), _jsx("p", { children: "\u2022 Failover management" })] })] })] })] })] }) }), _jsx(TabsContent, { value: "exports", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Advanced Export & Reporting" }), _jsx(CardDescription, { children: "Generate comprehensive reports in multiple formats with automated scheduling" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: ["PDF", "Excel", "CSV", "JSON"].map((format) => (_jsxs(Button, { variant: "outline", onClick: () => handleExportData(format.toLowerCase()), className: "w-full", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Export ", format] }, format))) }), exportProgress && (_jsxs("div", { className: "mt-4 p-4 bg-blue-50 rounded", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Export Progress" }), _jsxs("span", { className: "text-sm", children: [exportProgress.progress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${exportProgress.progress}%` } }) }), exportProgress.status === "completed" &&
                                                            exportProgress.downloadUrl && (_jsx("div", { className: "mt-2", children: _jsx("a", { href: exportProgress.downloadUrl, className: "text-blue-600 hover:underline text-sm", target: "_blank", rel: "noopener noreferrer", children: "Download exported file" }) }))] })), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded", children: [_jsx("h4", { className: "font-medium mb-3", children: "Bulk Data Export Features:" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { children: "\u2022 Multi-table data extraction" }), _jsx("p", { children: "\u2022 Custom date range filtering" }), _jsx("p", { children: "\u2022 Automated report scheduling" })] }), _jsxs("div", { children: [_jsx("p", { children: "\u2022 Template-based reporting" }), _jsx("p", { children: "\u2022 Email delivery integration" }), _jsx("p", { children: "\u2022 Compression and encryption" })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Custom Report Template Engine" }), _jsx(CardDescription, { children: "Create and manage custom report templates for automated generation" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Button, { className: "w-full", children: [_jsx(Brain, { className: "h-4 w-4 mr-2" }), "Clinical Reports"] }), _jsxs(Button, { className: "w-full", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Financial Reports"] }), _jsxs(Button, { className: "w-full", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Compliance Reports"] })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded", children: [_jsx("h5", { className: "font-medium text-green-800 mb-2", children: "Template Engine Features:" }), _jsxs("div", { className: "text-sm text-green-700 space-y-1", children: [_jsx("p", { children: "\u2022 Drag-and-drop report builder" }), _jsx("p", { children: "\u2022 Dynamic data binding" }), _jsx("p", { children: "\u2022 Conditional formatting" }), _jsx("p", { children: "\u2022 Multi-language support" }), _jsx("p", { children: "\u2022 Brand customization" })] })] })] }) })] })] }) })] })] }));
};
export default AdvancedDashboard;
