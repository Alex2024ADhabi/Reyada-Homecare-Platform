import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { CheckCircle, Target, TrendingUp, BarChart3, FileText, Users, Database, Shield, Activity, RefreshCw, } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export default function JAWDAImplementationTracker({ facilityId = "RHHCS-001", showHeader = true, }) {
    const [kpiIndicators, setKpiIndicators] = useState([]);
    const [implementationItems, setImplementationItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    useEffect(() => {
        loadJAWDAImplementationData();
    }, [facilityId]);
    const loadJAWDAImplementationData = async () => {
        try {
            setLoading(true);
            // JAWDA KPI Indicators based on Version 8.3 guidelines
            const mockKPIIndicators = [
                {
                    id: "HC001",
                    code: "HC001",
                    name: "All-cause Emergency Department / Urgent Care Visit without Hospitalization",
                    description: "Percentage of homecare patient days in which patients used the emergency department or urgent care but were not admitted to the hospital",
                    calculation: "(Number of unplanned ED/UC visits / Total homecare patient days) × 100",
                    target: "Lower is better",
                    reporting_frequency: "Quarterly",
                    current_value: 2.1,
                    target_value: 3.0,
                    status: "excellent",
                    last_updated: "2024-12-18T10:00:00Z",
                    data_source: "EMR System",
                    collection_method: "automated",
                    doh_compliance: true,
                },
                {
                    id: "HC002",
                    code: "HC002",
                    name: "All-cause Unplanned Acute Care Hospitalization",
                    description: "Percentage of days in which homecare patients were admitted to an acute care hospital",
                    calculation: "(Number of unplanned hospital days / Total homecare patient days) × 100",
                    target: "Lower is better",
                    reporting_frequency: "Quarterly",
                    current_value: 1.8,
                    target_value: 2.5,
                    status: "excellent",
                    last_updated: "2024-12-18T10:00:00Z",
                    data_source: "EMR System",
                    collection_method: "automated",
                    doh_compliance: true,
                },
                {
                    id: "HC003",
                    code: "HC003",
                    name: "Managing daily activities – Improvement in Ambulation for patients who received physiotherapy",
                    description: "Percentage of home health care patients during which the patient improved in ability to ambulate",
                    calculation: "(Number of patients with ambulation improvement / Total patients receiving physiotherapy) × 100",
                    target: "Higher is better",
                    reporting_frequency: "Quarterly",
                    current_value: 87.5,
                    target_value: 80.0,
                    status: "excellent",
                    last_updated: "2024-12-18T10:00:00Z",
                    data_source: "Clinical Assessment Records",
                    collection_method: "automated",
                    doh_compliance: true,
                },
                {
                    id: "HC004",
                    code: "HC004",
                    name: "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
                    description: "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
                    calculation: "(Number of pressure injuries Stage 2+ / Total homecare patient days) × 1000",
                    target: "Lower is better",
                    reporting_frequency: "Quarterly",
                    current_value: 0.8,
                    target_value: 1.2,
                    status: "excellent",
                    last_updated: "2024-12-18T10:00:00Z",
                    data_source: "Wound Assessment Records",
                    collection_method: "automated",
                    doh_compliance: true,
                },
                {
                    id: "HC005",
                    code: "HC005",
                    name: "Rate of homecare patient falls resulting in any injury per 1000 homecare patient days",
                    description: "Homecare patients falls resulting in any injury per 1000 home care patient days",
                    calculation: "(Number of patient falls with injury / Total homecare patient days) × 1000",
                    target: "Lower is better",
                    reporting_frequency: "Quarterly",
                    current_value: 0.5,
                    target_value: 1.0,
                    status: "excellent",
                    last_updated: "2024-12-18T10:00:00Z",
                    data_source: "Incident Reports",
                    collection_method: "automated",
                    doh_compliance: true,
                },
                {
                    id: "HC006",
                    code: "HC006",
                    name: "Discharge to Community",
                    description: "Percentage of days in which homecare patients were discharged to the community",
                    calculation: "(Number of patients discharged to community / Total homecare patient days) × 100",
                    target: "Higher is better",
                    reporting_frequency: "Quarterly",
                    current_value: 92.3,
                    target_value: 85.0,
                    status: "excellent",
                    last_updated: "2024-12-18T10:00:00Z",
                    data_source: "Discharge Records",
                    collection_method: "automated",
                    doh_compliance: true,
                },
            ];
            // JAWDA Implementation Items
            const mockImplementationItems = [
                {
                    id: "IMPL-001",
                    category: "kpi_tracking",
                    title: "Automated KPI Data Collection System",
                    description: "Real-time automated collection and validation of all 6 JAWDA KPI indicators with error handling and alerts",
                    status: "completed",
                    priority: "critical",
                    completion_percentage: 100,
                    responsible_person: "IT Team, Quality Department",
                    due_date: "2024-12-15",
                    implementation_notes: "System fully operational with real-time monitoring and automated validation",
                    benefits: [
                        "Eliminated manual data entry errors",
                        "Real-time KPI monitoring",
                        "Automated compliance validation",
                        "Comprehensive audit trail",
                    ],
                },
                {
                    id: "IMPL-002",
                    category: "data_collection",
                    title: "Patient Demographics Integration",
                    description: "Enhanced patient demographics tracking with JAWDA/Non-JAWDA classification for accurate reporting",
                    status: "completed",
                    priority: "high",
                    completion_percentage: 100,
                    responsible_person: "Mohammed Shafi",
                    due_date: "2024-12-10",
                    implementation_notes: "Demographics integration completed with automated classification",
                    benefits: [
                        "Accurate patient classification",
                        "Improved data quality",
                        "Automated demographic tracking",
                        "Enhanced reporting accuracy",
                    ],
                },
                {
                    id: "IMPL-003",
                    category: "reporting",
                    title: "Quarterly JAWDA Submission Automation",
                    description: "Automated quarterly data submission to DOH with validation and compliance checks",
                    status: "completed",
                    priority: "critical",
                    completion_percentage: 100,
                    responsible_person: "Quality Team",
                    due_date: "2024-12-12",
                    implementation_notes: "Automated submission system with pre-validation and compliance verification",
                    benefits: [
                        "Timely quarterly submissions",
                        "Automated compliance validation",
                        "Reduced manual effort",
                        "Improved data accuracy",
                    ],
                },
                {
                    id: "IMPL-004",
                    category: "training",
                    title: "JAWDA KPI Training Program",
                    description: "Comprehensive training program for all staff on JAWDA KPI requirements and data collection",
                    status: "completed",
                    priority: "high",
                    completion_percentage: 100,
                    responsible_person: "Ghiwa Nasr, Training Team",
                    due_date: "2024-12-08",
                    implementation_notes: "All staff trained with digital certificates and automated tracking",
                    benefits: [
                        "100% staff compliance",
                        "Standardized data collection",
                        "Improved data quality",
                        "Continuous competency monitoring",
                    ],
                },
                {
                    id: "IMPL-005",
                    category: "compliance",
                    title: "DOH Compliance Monitoring Dashboard",
                    description: "Real-time dashboard for monitoring DOH compliance across all JAWDA requirements",
                    status: "completed",
                    priority: "high",
                    completion_percentage: 100,
                    responsible_person: "Development Team",
                    due_date: "2024-12-14",
                    implementation_notes: "Interactive dashboard with real-time alerts and compliance scoring",
                    benefits: [
                        "Real-time compliance monitoring",
                        "Proactive issue identification",
                        "Executive visibility",
                        "Automated reporting",
                    ],
                },
                {
                    id: "IMPL-006",
                    category: "data_collection",
                    title: "Service Code Mapping Implementation",
                    description: "Implementation of new 2024-2025 service codes (17-25-1 to 17-25-5) with automated mapping",
                    status: "completed",
                    priority: "critical",
                    completion_percentage: 100,
                    responsible_person: "Coding Team, IT Department",
                    due_date: "2024-12-01",
                    implementation_notes: "All new service codes implemented with automated legacy code mapping",
                    benefits: [
                        "Compliance with new coding standards",
                        "Automated code mapping",
                        "Improved billing accuracy",
                        "Seamless transition from legacy codes",
                    ],
                },
            ];
            setKpiIndicators(mockKPIIndicators);
            setImplementationItems(mockImplementationItems);
        }
        catch (error) {
            console.error("Error loading JAWDA implementation data:", error);
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
            critical: "bg-red-100 text-red-800",
            completed: "bg-green-100 text-green-800",
            in_progress: "bg-blue-100 text-blue-800",
            pending: "bg-yellow-100 text-yellow-800",
            overdue: "bg-red-100 text-red-800",
        };
        return (_jsx(Badge, { className: variants[status], children: status.replace("_", " ").toUpperCase() }));
    };
    const getPriorityBadge = (priority) => {
        const variants = {
            critical: "bg-red-200 text-red-900 border-red-300",
            high: "bg-orange-200 text-orange-900 border-orange-300",
            medium: "bg-yellow-200 text-yellow-900 border-yellow-300",
            low: "bg-green-200 text-green-900 border-green-300",
        };
        return (_jsx(Badge, { className: variants[priority], children: priority.toUpperCase() }));
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case "kpi_tracking":
                return _jsx(BarChart3, { className: "w-4 h-4" });
            case "data_collection":
                return _jsx(Database, { className: "w-4 h-4" });
            case "reporting":
                return _jsx(FileText, { className: "w-4 h-4" });
            case "training":
                return _jsx(Users, { className: "w-4 h-4" });
            case "compliance":
                return _jsx(Shield, { className: "w-4 h-4" });
            default:
                return _jsx(Activity, { className: "w-4 h-4" });
        }
    };
    const overallImplementationProgress = Math.round(implementationItems.reduce((sum, item) => sum + item.completion_percentage, 0) / implementationItems.length);
    const completedItems = implementationItems.filter((item) => item.status === "completed").length;
    const kpiCompliance = Math.round((kpiIndicators.filter((kpi) => kpi.status === "excellent" || kpi.status === "good").length /
        kpiIndicators.length) *
        100);
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [showHeader && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "JAWDA Implementation Tracker" }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["Comprehensive JAWDA Guidelines Version 8.3 Implementation Status - ", facilityId] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), "Version 8.3 Compliant"] }), _jsxs(Button, { onClick: loadJAWDAImplementationData, variant: "outline", size: "sm", disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Implementation Progress"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [overallImplementationProgress, "%"] }), _jsx(Progress, { value: overallImplementationProgress, className: "h-2 mt-2" }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "All critical items completed" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Completed Items"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [completedItems, "/", implementationItems.length] }), _jsx("p", { className: "text-xs text-blue-600", children: "Implementation items completed" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), "KPI Compliance"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [kpiCompliance, "%"] }), _jsxs("p", { className: "text-xs text-purple-600", children: [kpiIndicators.length, " KPIs monitored"] })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "DOH Compliance Score"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: "98%" }), _jsx("p", { className: "text-xs text-orange-600", children: "Excellent compliance level" })] })] })] }), _jsxs(Alert, { className: "border-green-200 bg-green-50", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "JAWDA Implementation Complete" }), _jsx(AlertDescription, { className: "text-green-700", children: "All critical JAWDA requirements have been successfully implemented with automated KPI tracking, real-time compliance monitoring, and comprehensive reporting capabilities." })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "kpis", children: "KPI Indicators" }), _jsx(TabsTrigger, { value: "implementation", children: "Implementation" }), _jsx(TabsTrigger, { value: "benefits", children: "Benefits" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JAWDA KPI Performance" }), _jsx(CardDescription, { children: "Current performance across all 6 JAWDA KPI indicators" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: kpiIndicators.slice(0, 3).map((kpi) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: kpi.code }), _jsxs("span", { className: "text-sm text-gray-600", children: [kpi.current_value, " ", kpi.target === "Higher is better" ? "↑" : "↓"] })] }), _jsx("div", { className: "text-xs text-gray-500", children: kpi.name }), getStatusBadge(kpi.status)] }, kpi.id))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Implementation Status" }), _jsx(CardDescription, { children: "Status of key JAWDA implementation components" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: implementationItems.slice(0, 3).map((item) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getCategoryIcon(item.category), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm", children: item.title }), _jsx("p", { className: "text-xs text-gray-600", children: item.category.replace("_", " ") })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusBadge(item.status), _jsxs("span", { className: "text-sm font-medium", children: [item.completion_percentage, "%"] })] })] }, item.id))) }) })] })] }) }), _jsx(TabsContent, { value: "kpis", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JAWDA KPI Indicators (Version 8.3)" }), _jsx(CardDescription, { children: "All 6 mandatory JAWDA KPI indicators with real-time monitoring" })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Code" }), _jsx(TableHead, { children: "Indicator Name" }), _jsx(TableHead, { children: "Current Value" }), _jsx(TableHead, { children: "Target" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Collection Method" }), _jsx(TableHead, { children: "Last Updated" })] }) }), _jsx(TableBody, { children: kpiIndicators.map((kpi) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: kpi.code }), _jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: kpi.name }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: kpi.description })] }) }), _jsx(TableCell, { className: "font-medium", children: kpi.current_value }), _jsx(TableCell, { children: kpi.target }), _jsx(TableCell, { children: getStatusBadge(kpi.status) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: kpi.collection_method }) }), _jsx(TableCell, { className: "text-sm", children: new Date(kpi.last_updated).toLocaleDateString() })] }, kpi.id))) })] }) }) })] }) }), _jsx(TabsContent, { value: "implementation", className: "space-y-6", children: _jsx("div", { className: "space-y-4", children: implementationItems.map((item) => (_jsx(Card, { className: "border-l-4 border-l-green-400", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getCategoryIcon(item.category), _jsx("h4", { className: "font-semibold text-lg", children: item.title })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: item.description }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("span", { children: ["Category: ", item.category.replace("_", " ")] }), _jsxs("span", { children: ["Responsible: ", item.responsible_person] }), _jsxs("span", { children: ["Due: ", new Date(item.due_date).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [getStatusBadge(item.status), getPriorityBadge(item.priority), _jsxs("span", { className: "text-sm font-medium", children: [item.completion_percentage, "%"] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium mb-2", children: "Implementation Benefits:" }), _jsx("ul", { className: "list-disc list-inside text-sm text-gray-600 space-y-1", children: item.benefits.map((benefit, index) => (_jsx("li", { children: benefit }, index))) })] }), _jsx("div", { className: "mt-3 p-3 bg-gray-50 rounded-lg", children: _jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("strong", { children: "Notes:" }), " ", item.implementation_notes] }) })] }) }, item.id))) }) }), _jsx(TabsContent, { value: "benefits", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Operational Benefits" }), _jsx(CardDescription, { children: "Improvements achieved through JAWDA implementation" })] }), _jsx(CardContent, { children: _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "100% automated KPI data collection" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Real-time compliance monitoring" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Automated quarterly submissions" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Comprehensive audit trail" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Eliminated manual data entry errors" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quality Improvements" }), _jsx(CardDescription, { children: "Enhanced quality metrics and outcomes" })] }), _jsx(CardContent, { children: _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "98% data accuracy improvement" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "95% reduction in reporting time" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "100% staff training compliance" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "Enhanced patient safety outcomes" })] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "Proactive risk identification" })] })] }) })] })] }) })] })] }) }));
}
