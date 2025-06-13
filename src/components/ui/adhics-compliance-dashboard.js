import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle, TrendingUp, RefreshCw, Download, Settings, Lock, Users, Activity, } from "lucide-react";
import { adhicsComplianceService, } from "@/services/adhics-compliance.service";
export default function ADHICSComplianceDashboard() {
    const [complianceResult, setComplianceResult] = useState(null);
    const [controlImplementations, setControlImplementations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assessmentInProgress, setAssessmentInProgress] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [reportGenerating, setReportGenerating] = useState(false);
    useEffect(() => {
        loadComplianceData();
    }, []);
    const loadComplianceData = async () => {
        try {
            setLoading(true);
            const result = await adhicsComplianceService.performComplianceAssessment();
            const controls = adhicsComplianceService.getAllControlImplementations();
            setComplianceResult(result);
            setControlImplementations(controls);
        }
        catch (error) {
            console.error("Failed to load compliance data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const runAssessment = async () => {
        try {
            setAssessmentInProgress(true);
            const result = await adhicsComplianceService.performComplianceAssessment();
            setComplianceResult(result);
        }
        catch (error) {
            console.error("Assessment failed:", error);
        }
        finally {
            setAssessmentInProgress(false);
        }
    };
    const generateReport = async () => {
        try {
            setReportGenerating(true);
            const report = await adhicsComplianceService.generateComplianceReport();
            // Create and download the report
            const reportContent = JSON.stringify(report, null, 2);
            const blob = new Blob([reportContent], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `adhics-compliance-report-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error("Report generation failed:", error);
        }
        finally {
            setReportGenerating(false);
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "Critical":
                return "bg-red-500";
            case "High":
                return "bg-orange-500";
            case "Medium":
                return "bg-yellow-500";
            case "Low":
                return "bg-blue-500";
            default:
                return "bg-gray-500";
        }
    };
    const getSeverityBadgeVariant = (severity) => {
        switch (severity) {
            case "Critical":
                return "destructive";
            case "High":
                return "destructive";
            case "Medium":
                return "outline";
            case "Low":
                return "secondary";
            default:
                return "secondary";
        }
    };
    const getImplementationStatusColor = (status) => {
        switch (status) {
            case "Implemented":
                return "text-green-600";
            case "Partially Implemented":
                return "text-yellow-600";
            case "Not Implemented":
                return "text-red-600";
            case "Not Applicable":
                return "text-gray-600";
            default:
                return "text-gray-600";
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center h-96", children: [_jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-4 text-lg", children: "Loading ADHICS V2 compliance data..." })] }));
    }
    if (!complianceResult) {
        return (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertTriangle, { className: "h-16 w-16 mx-auto mb-4 text-yellow-500" }), _jsx("p", { className: "text-lg mb-4", children: "No compliance data available" }), _jsxs(Button, { onClick: loadComplianceData, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Load Compliance Data"] })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6 bg-white min-h-screen p-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "ADHICS V2 Compliance Dashboard" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Abu Dhabi Healthcare Information and Cyber Security Standard V2 Compliance Monitoring" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Button, { onClick: runAssessment, disabled: assessmentInProgress, variant: "outline", children: [assessmentInProgress ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Activity, { className: "h-4 w-4 mr-2" })), assessmentInProgress ? "Assessing..." : "Run Assessment"] }), _jsxs(Button, { onClick: generateReport, disabled: reportGenerating, children: [reportGenerating ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Download, { className: "h-4 w-4 mr-2" })), reportGenerating ? "Generating..." : "Generate Report"] })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overall Score" }), _jsx(Shield, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [complianceResult.overallScore, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: complianceResult.complianceLevel })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Section A" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [complianceResult.sectionAScore, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Governance" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Section B" }), _jsx(Lock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [complianceResult.sectionBScore, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Controls" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Violations" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: complianceResult.violations.length }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [complianceResult.violations.filter((v) => v.severity === "Critical").length, " ", "Critical"] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5" }), "Certification Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Badge, { variant: complianceResult.certificationStatus === "Certified"
                                                ? "default"
                                                : complianceResult.certificationStatus === "Pending"
                                                    ? "secondary"
                                                    : "destructive", className: "text-lg px-4 py-2", children: complianceResult.certificationStatus }), _jsxs("p", { className: "text-sm text-gray-600 mt-2", children: ["Last Assessment:", " ", new Date(complianceResult.lastAssessment).toLocaleString()] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Next Assessment Due:", " ", new Date(complianceResult.nextAssessmentDue).toLocaleString()] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold", children: complianceResult.isCompliant ? "✓" : "✗" }), _jsx("p", { className: "text-sm text-gray-600", children: complianceResult.isCompliant ? "Compliant" : "Non-Compliant" })] })] }) })] }), _jsxs(Tabs, { defaultValue: "violations", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "violations", children: "Violations" }), _jsx(TabsTrigger, { value: "controls", children: "Control Implementations" }), _jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" }), _jsx(TabsTrigger, { value: "governance", children: "Section A - Governance" }), _jsx(TabsTrigger, { value: "technical", children: "Section B - Controls" })] }), _jsx(TabsContent, { value: "violations", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), "Compliance Violations"] }), _jsx(CardDescription, { children: "Active violations requiring attention" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsxs("div", { className: "space-y-4", children: [complianceResult.violations.map((violation) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: getSeverityBadgeVariant(violation.severity), children: violation.severity }), _jsx("span", { className: "font-medium", children: violation.control }), _jsxs(Badge, { variant: "outline", children: ["Section ", violation.section] })] }), _jsx(Badge, { variant: violation.status === "Open"
                                                                        ? "destructive"
                                                                        : violation.status === "In Progress"
                                                                            ? "secondary"
                                                                            : "default", children: violation.status })] }), _jsx("h4", { className: "font-semibold mb-2", children: violation.description }), _jsxs("div", { className: "text-sm text-gray-600 mb-2", children: [_jsx("strong", { children: "Deadline:" }), " ", new Date(violation.deadline).toLocaleDateString()] }), _jsxs("div", { className: "text-sm", children: [_jsx("strong", { children: "Remediation Steps:" }), _jsx("ul", { className: "list-disc list-inside mt-1", children: violation.remediation.map((step, index) => (_jsx("li", { children: step }, index))) })] }), violation.assignedTo && (_jsxs("div", { className: "text-sm text-gray-600 mt-2", children: [_jsx("strong", { children: "Assigned to:" }), " ", violation.assignedTo] }))] }, violation.id))), complianceResult.violations.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "h-16 w-16 mx-auto mb-4 text-green-500" }), _jsx("p", { className: "text-lg font-semibold text-green-600", children: "No violations found!" }), _jsx("p", { className: "text-gray-600", children: "Your system is fully compliant with ADHICS V2 standards." })] }))] }) }) })] }) }), _jsx(TabsContent, { value: "controls", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5" }), "Control Implementations"] }), _jsx(CardDescription, { children: "Status of all ADHICS V2 control implementations" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-4", children: controlImplementations.map((control) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", children: control.controlId }), _jsxs(Badge, { variant: "outline", children: ["Section ", control.section] }), _jsx("span", { className: "font-medium", children: control.category })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-sm font-medium ${getImplementationStatusColor(control.implementationStatus)}`, children: control.implementationStatus }), control.evidenceProvided && (_jsx(Badge, { variant: "secondary", children: "Evidence Provided" }))] })] }), _jsx("h4", { className: "font-semibold mb-2", children: control.title }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: control.description }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "Maturity Level:" }), " ", control.maturityLevel, "/5"] }), _jsxs("div", { children: [_jsx("strong", { children: "Risk Rating:" }), " ", control.riskRating] }), _jsxs("div", { children: [_jsx("strong", { children: "Business Impact:" }), " ", control.businessImpact] }), _jsxs("div", { children: [_jsx("strong", { children: "Last Reviewed:" }), " ", new Date(control.lastReviewed).toLocaleDateString()] })] }), control.implementationNotes && (_jsxs("div", { className: "mt-2 text-sm text-gray-600", children: [_jsx("strong", { children: "Notes:" }), " ", control.implementationNotes] }))] }, control.controlId))) }) }) })] }) }), _jsx(TabsContent, { value: "recommendations", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Compliance Recommendations"] }), _jsx(CardDescription, { children: "Actionable recommendations to improve compliance" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: complianceResult.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-3 p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold", children: index + 1 }), _jsx("p", { className: "text-sm", children: recommendation })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "governance", className: "space-y-4", children: _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Information Security Governance" }), _jsx(CardDescription, { children: "ADHICS Section A compliance status" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "ISGC Establishment" }), _jsx(Badge, { variant: "default", children: "Implemented" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "HIIP Workgroup" }), _jsx(Badge, { variant: "default", children: "Active" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "CISO Designation" }), _jsx(Badge, { variant: "default", children: "Appointed" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Risk Management" }), _jsx(Badge, { variant: "default", children: "Operational" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Governance Metrics" }), _jsx(CardDescription, { children: "Key governance indicators" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Policy Coverage" }), _jsx("span", { children: "95%" })] }), _jsx(Progress, { value: 95, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Risk Assessment Completion" }), _jsx("span", { children: "88%" })] }), _jsx(Progress, { value: 88, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Asset Classification" }), _jsx("span", { children: "92%" })] }), _jsx(Progress, { value: 92, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Audit Compliance" }), _jsx("span", { children: "97%" })] }), _jsx(Progress, { value: 97, className: "h-2" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "technical", className: "space-y-4", children: _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Technical Controls" }), _jsx(CardDescription, { children: "ADHICS Section B implementation status" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Access Control (AC)" }), _jsx(Badge, { variant: "default", children: "Implemented" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Data Privacy (DP)" }), _jsx(Badge, { variant: "default", children: "Implemented" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Cryptographic Controls (SA)" }), _jsx(Badge, { variant: "default", children: "Implemented" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Incident Management (IM)" }), _jsx(Badge, { variant: "default", children: "Operational" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Security Metrics" }), _jsx(CardDescription, { children: "Technical security indicators" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Encryption Coverage" }), _jsx("span", { children: "100%" })] }), _jsx(Progress, { value: 100, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Access Control Effectiveness" }), _jsx("span", { children: "94%" })] }), _jsx(Progress, { value: 94, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Vulnerability Management" }), _jsx("span", { children: "89%" })] }), _jsx(Progress, { value: 89, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Incident Response Readiness" }), _jsx("span", { children: "96%" })] }), _jsx(Progress, { value: 96, className: "h-2" })] })] }) })] })] }) })] })] }));
}
