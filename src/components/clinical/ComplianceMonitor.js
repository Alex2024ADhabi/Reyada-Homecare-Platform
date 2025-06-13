import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, XCircle, Clock, FileText, Shield, Eye, Download, RefreshCw, } from "lucide-react";
import { getComplianceMonitoringRecords, getComplianceDashboardData, } from "@/api/quality-management.api";
export default function ComplianceMonitor({ regulationType, showHeader = true, }) {
    const [complianceRecords, setComplianceRecords] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRegulation, setSelectedRegulation] = useState(regulationType || "all");
    useEffect(() => {
        loadComplianceData();
    }, [selectedRegulation]);
    const loadComplianceData = async () => {
        try {
            setLoading(true);
            const [records, dashboard] = await Promise.all([
                getComplianceMonitoringRecords(),
                getComplianceDashboardData(),
            ]);
            // Filter records if specific regulation type is selected
            const filteredRecords = selectedRegulation === "all"
                ? records
                : records.filter((record) => record.regulation_type === selectedRegulation);
            setComplianceRecords(filteredRecords);
            setDashboardData(dashboard);
        }
        catch (error) {
            console.error("Error loading compliance data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getComplianceStatusBadge = (status) => {
        const variants = {
            compliant: "default",
            partially_compliant: "secondary",
            non_compliant: "destructive",
            under_review: "outline",
            not_applicable: "outline",
        };
        const icons = {
            compliant: _jsx(CheckCircle, { className: "w-3 h-3" }),
            partially_compliant: _jsx(Clock, { className: "w-3 h-3" }),
            non_compliant: _jsx(XCircle, { className: "w-3 h-3" }),
            under_review: _jsx(RefreshCw, { className: "w-3 h-3" }),
            not_applicable: _jsx(FileText, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status.replace("_", " ").toUpperCase()] }));
    };
    const getCategoryBadge = (category) => {
        const variants = {
            mandatory: "destructive",
            recommended: "secondary",
            best_practice: "default",
        };
        return (_jsx(Badge, { variant: variants[category] || "secondary", children: category.replace("_", " ").toUpperCase() }));
    };
    const getComplianceColor = (percentage) => {
        if (percentage >= 90)
            return "text-green-600";
        if (percentage >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    const regulationTypes = [
        "all",
        "DOH",
        "TASNEEF",
        "ACHC",
        "JAWDA",
        "ISO",
        "HAAD",
        "DHA",
    ];
    return (_jsxs("div", { className: "space-y-6", children: [showHeader && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Compliance Monitor" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Real-time regulatory compliance monitoring and tracking" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("select", { value: selectedRegulation, onChange: (e) => setSelectedRegulation(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md text-sm", children: regulationTypes.map((type) => (_jsx("option", { value: type, children: type === "all" ? "All Regulations" : type }, type))) }), _jsxs(Button, { onClick: loadComplianceData, disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] })] })), dashboardData && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Overall Compliance" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [dashboardData.total_compliance_score, "%"] }), _jsx(Progress, { value: dashboardData.total_compliance_score, className: "h-2 mt-2" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Upcoming Audits" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: dashboardData.upcoming_audits.length }), _jsx("p", { className: "text-xs text-blue-600", children: "Next 30 days" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Overdue Items" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: dashboardData.overdue_compliance.length }), _jsx("p", { className: "text-xs text-orange-600", children: "Require attention" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "Active Regulations" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: Object.keys(dashboardData.compliance_by_regulation).length }), _jsx("p", { className: "text-xs text-purple-600", children: "Being monitored" })] })] })] })), dashboardData && dashboardData.overdue_compliance.length > 0 && (_jsxs(Alert, { className: "border-red-200 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Critical Compliance Issues" }), _jsxs(AlertDescription, { className: "text-red-700", children: [dashboardData.overdue_compliance.length, " compliance requirements are overdue for assessment. Immediate action is required to maintain regulatory compliance."] })] })), dashboardData && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance by Regulation Type" }), _jsx(CardDescription, { children: "Overview of compliance status across different regulatory frameworks" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(dashboardData.compliance_by_regulation).map(([regulation, data]) => (_jsxs(Card, { className: "border", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), regulation] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Total Requirements:" }), _jsx("span", { className: "font-medium", children: data.total })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-green-600", children: "Compliant:" }), _jsx("span", { className: "font-medium", children: data.compliant || 0 })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-red-600", children: "Non-Compliant:" }), _jsx("span", { className: "font-medium", children: data.non_compliant || 0 })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-yellow-600", children: "Partial:" }), _jsx("span", { className: "font-medium", children: data.partially_compliant || 0 })] }), _jsx(Progress, { value: data.total > 0
                                                        ? ((data.compliant || 0) / data.total) * 100
                                                        : 0, className: "h-2 mt-2" })] }) })] }, regulation))) }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance Requirements" }), _jsx(CardDescription, { children: "Detailed view of all compliance requirements and their current status" })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Regulation" }), _jsx(TableHead, { children: "Code" }), _jsx(TableHead, { children: "Title" }), _jsx(TableHead, { children: "Category" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Compliance %" }), _jsx(TableHead, { children: "Last Assessment" }), _jsx(TableHead, { children: "Next Due" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, className: "text-center py-4", children: "Loading compliance data..." }) })) : complianceRecords.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, className: "text-center py-4 text-gray-500", children: "No compliance records found" }) })) : (complianceRecords.map((record) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: record.regulation_type }) }), _jsx(TableCell, { className: "font-mono text-sm", children: record.regulation_code }), _jsx(TableCell, { className: "font-medium max-w-xs truncate", children: record.regulation_title }), _jsx(TableCell, { children: getCategoryBadge(record.compliance_category) }), _jsx(TableCell, { children: getComplianceStatusBadge(record.current_status) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `font-medium ${getComplianceColor(record.compliance_percentage)}`, children: [record.compliance_percentage, "%"] }), _jsx(Progress, { value: record.compliance_percentage, className: "h-1 w-16" })] }) }), _jsx(TableCell, { className: "text-sm", children: new Date(record.last_assessment_date).toLocaleDateString() }), _jsx(TableCell, { className: "text-sm", children: _jsx("span", { className: new Date(record.next_assessment_due) < new Date()
                                                            ? "text-red-600 font-medium"
                                                            : "", children: new Date(record.next_assessment_due).toLocaleDateString() }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Download, { className: "w-3 h-3" }) })] }) })] }, record._id?.toString())))) })] }) }) })] }), dashboardData && dashboardData.upcoming_audits.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Upcoming Audits" }), _jsx(CardDescription, { children: "Scheduled audits in the next 30 days" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: dashboardData.upcoming_audits.map((audit, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: audit.audit_title }), _jsxs("div", { className: "text-sm text-gray-600", children: [audit.audit_type, " audit by ", audit.auditing_body] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: new Date(audit.scheduled_date).toLocaleDateString() }), _jsx("div", { className: "text-sm text-gray-600", children: audit.departments_audited?.join(", ") })] })] }, index))) }) })] }))] }));
}
