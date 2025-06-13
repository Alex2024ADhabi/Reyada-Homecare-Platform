import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Eye, Edit, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, RefreshCw, BarChart3, Award, FileText, } from "lucide-react";
import { getJAWDAKPIRecords, createJAWDAKPIRecord, } from "@/api/quality-management.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
export default function JAWDAKPITracker({ userId = "Dr. Sarah Ahmed", userRole = "quality_manager", showHeader = true, }) {
    const [kpiRecords, setKpiRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showKPIDialog, setShowKPIDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [newKPIRecord, setNewKPIRecord] = useState({
        kpi_name: "",
        kpi_category: "patient_safety",
        kpi_description: "",
        measurement_period: new Date().toISOString().split("T")[0],
        target_value: 0,
        actual_value: 0,
        data_source: "",
        collection_method: "manual",
        responsible_department: "",
        responsible_person: "",
        reporting_frequency: "monthly",
    });
    const { isOnline, saveFormData } = useOfflineSync();
    useEffect(() => {
        loadKPIData();
    }, [selectedCategory]);
    const loadKPIData = async () => {
        try {
            setLoading(true);
            const records = await getJAWDAKPIRecords();
            // Filter by category if selected
            const filteredRecords = selectedCategory === "all"
                ? records
                : records.filter((record) => record.kpi_category === selectedCategory);
            setKpiRecords(filteredRecords);
        }
        catch (error) {
            console.error("Error loading KPI data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateKPIRecord = async () => {
        try {
            setLoading(true);
            const kpiId = `KPI-${Date.now()}`;
            const variance = newKPIRecord.actual_value - newKPIRecord.target_value;
            const variancePercentage = newKPIRecord.target_value !== 0
                ? (variance / newKPIRecord.target_value) * 100
                : 0;
            let performanceStatus;
            if (variancePercentage >= 10)
                performanceStatus = "exceeds";
            else if (variancePercentage >= 0)
                performanceStatus = "meets";
            else if (variancePercentage >= -10)
                performanceStatus = "below";
            else
                performanceStatus = "critical";
            await createJAWDAKPIRecord({
                ...newKPIRecord,
                kpi_id: kpiId,
                variance,
                variance_percentage: variancePercentage,
                performance_status: performanceStatus,
                last_updated: new Date().toISOString(),
                next_update_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                trend_analysis: {
                    previous_period_value: 0,
                    trend_direction: "stable",
                    trend_percentage: 0,
                },
                action_required: performanceStatus === "below" || performanceStatus === "critical",
                improvement_actions: [],
                regulatory_requirement: {
                    regulation: "JAWDA",
                    requirement_code: "JAWDA-KPI-001",
                    mandatory: true,
                },
                benchmarking: {},
            });
            // Save to offline storage if offline
            if (!isOnline) {
                await saveFormData("jawda_kpi", {
                    ...newKPIRecord,
                    kpi_id: kpiId,
                    timestamp: new Date().toISOString(),
                });
            }
            setShowKPIDialog(false);
            resetKPIForm();
            await loadKPIData();
        }
        catch (error) {
            console.error("Error creating KPI record:", error);
            alert(error instanceof Error ? error.message : "Failed to create KPI record");
        }
        finally {
            setLoading(false);
        }
    };
    const resetKPIForm = () => {
        setNewKPIRecord({
            kpi_name: "",
            kpi_category: "patient_safety",
            kpi_description: "",
            measurement_period: new Date().toISOString().split("T")[0],
            target_value: 0,
            actual_value: 0,
            data_source: "",
            collection_method: "manual",
            responsible_department: "",
            responsible_person: "",
            reporting_frequency: "monthly",
        });
    };
    const getPerformanceBadge = (status) => {
        const variants = {
            exceeds: "default",
            meets: "secondary",
            below: "destructive",
            critical: "destructive",
        };
        const icons = {
            exceeds: _jsx(TrendingUp, { className: "w-3 h-3" }),
            meets: _jsx(Target, { className: "w-3 h-3" }),
            below: _jsx(TrendingDown, { className: "w-3 h-3" }),
            critical: _jsx(AlertTriangle, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "secondary", className: "flex items-center gap-1", children: [icons[status], status.toUpperCase()] }));
    };
    const getTrendBadge = (direction) => {
        const variants = {
            improving: "default",
            stable: "secondary",
            declining: "destructive",
        };
        const icons = {
            improving: _jsx(TrendingUp, { className: "w-3 h-3" }),
            stable: _jsx(Target, { className: "w-3 h-3" }),
            declining: _jsx(TrendingDown, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[direction] || "secondary", className: "flex items-center gap-1", children: [icons[direction], direction.toUpperCase()] }));
    };
    const categories = [
        "all",
        "patient_safety",
        "clinical_effectiveness",
        "patient_experience",
        "operational_efficiency",
        "staff_satisfaction",
    ];
    // Calculate summary statistics
    const totalKPIs = kpiRecords.length;
    const meetingTargets = kpiRecords.filter((kpi) => kpi.performance_status === "meets" ||
        kpi.performance_status === "exceeds").length;
    const belowTargets = kpiRecords.filter((kpi) => kpi.performance_status === "below" ||
        kpi.performance_status === "critical").length;
    const averagePerformance = totalKPIs > 0 ? Math.round((meetingTargets / totalKPIs) * 100) : 0;
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [showHeader && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "JAWDA KPI Tracker" }), _jsx("p", { className: "text-gray-600 mt-1", children: "UAE Quality Framework Key Performance Indicators Monitoring" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!isOnline && (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), "Offline Mode"] })), _jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md text-sm", children: categories.map((category) => (_jsx("option", { value: category, children: category === "all"
                                            ? "All Categories"
                                            : category
                                                .replace("_", " ")
                                                .replace(/\b\w/g, (l) => l.toUpperCase()) }, category))) }), _jsxs(Button, { onClick: loadKPIData, disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs(Dialog, { open: showKPIDialog, onOpenChange: setShowKPIDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add KPI"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add JAWDA KPI" }), _jsx(DialogDescription, { children: "Add a new Key Performance Indicator for UAE Quality Framework tracking" })] }), _jsxs("div", { className: "grid gap-4 py-4 max-h-96 overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "kpiName", children: "KPI Name" }), _jsx(Input, { id: "kpiName", value: newKPIRecord.kpi_name, onChange: (e) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                kpi_name: e.target.value,
                                                                            }), placeholder: "Enter KPI name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "kpiCategory", children: "Category" }), _jsxs(Select, { value: newKPIRecord.kpi_category, onValueChange: (value) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                kpi_category: value,
                                                                            }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "patient_safety", children: "Patient Safety" }), _jsx(SelectItem, { value: "clinical_effectiveness", children: "Clinical Effectiveness" }), _jsx(SelectItem, { value: "patient_experience", children: "Patient Experience" }), _jsx(SelectItem, { value: "operational_efficiency", children: "Operational Efficiency" }), _jsx(SelectItem, { value: "staff_satisfaction", children: "Staff Satisfaction" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "kpiDescription", children: "Description" }), _jsx(Textarea, { id: "kpiDescription", value: newKPIRecord.kpi_description, onChange: (e) => setNewKPIRecord({
                                                                        ...newKPIRecord,
                                                                        kpi_description: e.target.value,
                                                                    }), placeholder: "Describe the KPI and its measurement criteria", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "targetValue", children: "Target Value" }), _jsx(Input, { id: "targetValue", type: "number", value: newKPIRecord.target_value, onChange: (e) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                target_value: parseFloat(e.target.value) || 0,
                                                                            }), placeholder: "Enter target value" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "actualValue", children: "Actual Value" }), _jsx(Input, { id: "actualValue", type: "number", value: newKPIRecord.actual_value, onChange: (e) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                actual_value: parseFloat(e.target.value) || 0,
                                                                            }), placeholder: "Enter actual value" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "dataSource", children: "Data Source" }), _jsx(Input, { id: "dataSource", value: newKPIRecord.data_source, onChange: (e) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                data_source: e.target.value,
                                                                            }), placeholder: "Enter data source" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "collectionMethod", children: "Collection Method" }), _jsxs(Select, { value: newKPIRecord.collection_method, onValueChange: (value) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                collection_method: value,
                                                                            }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "manual", children: "Manual" }), _jsx(SelectItem, { value: "automated", children: "Automated" }), _jsx(SelectItem, { value: "hybrid", children: "Hybrid" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "responsibleDepartment", children: "Responsible Department" }), _jsx(Input, { id: "responsibleDepartment", value: newKPIRecord.responsible_department, onChange: (e) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                responsible_department: e.target.value,
                                                                            }), placeholder: "Enter responsible department" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "responsiblePerson", children: "Responsible Person" }), _jsx(Input, { id: "responsiblePerson", value: newKPIRecord.responsible_person, onChange: (e) => setNewKPIRecord({
                                                                                ...newKPIRecord,
                                                                                responsible_person: e.target.value,
                                                                            }), placeholder: "Enter responsible person" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowKPIDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateKPIRecord, disabled: loading, children: "Add KPI" })] })] })] })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), "Total KPIs"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: totalKPIs }), _jsx("p", { className: "text-xs text-blue-600", children: "Active indicators" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Meeting Targets"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: meetingTargets }), _jsxs("p", { className: "text-xs text-green-600", children: ["of ", totalKPIs, " KPIs"] })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Below Targets"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: belowTargets }), _jsx("p", { className: "text-xs text-red-600", children: "Require attention" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Award, { className: "w-4 h-4" }), "Performance Score"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [averagePerformance, "%"] }), _jsx(Progress, { value: averagePerformance, className: "h-2 mt-2" })] })] })] }), belowTargets > 0 && (_jsxs(Alert, { className: "border-red-200 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Critical KPI Performance" }), _jsxs(AlertDescription, { className: "text-red-700", children: [belowTargets, " KPI", belowTargets > 1 ? "s are" : " is", " performing below target. Review and implement improvement actions to maintain quality standards."] })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "JAWDA KPI Performance Dashboard" }), _jsx(CardDescription, { children: "Monitor and track UAE Quality Framework Key Performance Indicators" })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "KPI Name" }), _jsx(TableHead, { children: "Category" }), _jsx(TableHead, { children: "Target" }), _jsx(TableHead, { children: "Actual" }), _jsx(TableHead, { children: "Variance" }), _jsx(TableHead, { children: "Performance" }), _jsx(TableHead, { children: "Trend" }), _jsx(TableHead, { children: "Last Updated" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, className: "text-center py-4", children: "Loading KPI data..." }) })) : kpiRecords.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, className: "text-center py-4 text-gray-500", children: "No KPI records found" }) })) : (kpiRecords.map((kpi) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: kpi.kpi_name }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: kpi.kpi_category
                                                                .replace("_", " ")
                                                                .replace(/\b\w/g, (l) => l.toUpperCase()) }) }), _jsx(TableCell, { children: kpi.target_value }), _jsx(TableCell, { children: kpi.actual_value }), _jsx(TableCell, { children: _jsxs("span", { className: kpi.variance >= 0
                                                                ? "text-green-600"
                                                                : "text-red-600", children: [kpi.variance > 0 ? "+" : "", kpi.variance.toFixed(1)] }) }), _jsx(TableCell, { children: getPerformanceBadge(kpi.performance_status) }), _jsx(TableCell, { children: getTrendBadge(kpi.trend_analysis.trend_direction) }), _jsx(TableCell, { className: "text-sm", children: new Date(kpi.last_updated).toLocaleDateString() }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Edit, { className: "w-3 h-3" }) })] }) })] }, kpi._id?.toString())))) })] }) }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: categories.slice(1).map((category) => {
                        const categoryKPIs = kpiRecords.filter((kpi) => kpi.kpi_category === category);
                        const categoryMeeting = categoryKPIs.filter((kpi) => kpi.performance_status === "meets" ||
                            kpi.performance_status === "exceeds").length;
                        const categoryPerformance = categoryKPIs.length > 0
                            ? Math.round((categoryMeeting / categoryKPIs.length) * 100)
                            : 0;
                        return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), category
                                                .replace("_", " ")
                                                .replace(/\b\w/g, (l) => l.toUpperCase())] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total KPIs:" }), _jsx("span", { className: "font-medium", children: categoryKPIs.length })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Meeting Targets:" }), _jsx("span", { className: "font-medium", children: categoryMeeting })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Performance:" }), _jsxs("span", { className: "font-medium", children: [categoryPerformance, "%"] })] }), _jsx(Progress, { value: categoryPerformance, className: "h-2 mt-2" })] }) })] }, category));
                    }) })] }) }));
}
