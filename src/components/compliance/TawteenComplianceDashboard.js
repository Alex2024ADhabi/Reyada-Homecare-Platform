import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Users, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, RefreshCw, Download, Plus, Eye, Search, Building, UserCheck, AlertCircle, FileText, } from "lucide-react";
import { ApiService } from "@/services/api.service";
import { ValidationUtils } from "@/components/ui/form-validation";
import { useOfflineSync } from "@/hooks/useOfflineSync";
export default function TawteenComplianceDashboard({ facilityId = "facility-001", region = "abu-dhabi", userId = "admin", userRole = "hr_manager", }) {
    // State Management
    const [workforceData, setWorkforceData] = useState(null);
    const [categoryBreakdown, setCategoryBreakdown] = useState({});
    const [recruitmentPipeline, setRecruitmentPipeline] = useState(null);
    const [tawteenReports, setTawteenReports] = useState([]);
    const [penaltyRisk, setPenaltyRisk] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
    const [regionalTargets, setRegionalTargets] = useState(null);
    const { isOnline, saveFormData } = useOfflineSync();
    useEffect(() => {
        loadTawteenData();
    }, [facilityId, region]);
    const loadTawteenData = async () => {
        try {
            setLoading(true);
            const [complianceStatus, targets] = await Promise.all([
                ApiService.get(`/api/tawteen/compliance-status?facilityId=${facilityId}&region=${region}`),
                ApiService.get(`/api/tawteen/targets/${region}`),
            ]);
            setWorkforceData({
                totalEmployees: complianceStatus.emiratizationMetrics.totalPositions,
                uaeNationals: complianceStatus.emiratizationMetrics.emiratiEmployees,
                emiratizationRate: complianceStatus.emiratizationMetrics.currentPercentage,
                targetRate: complianceStatus.emiratizationMetrics.targetPercentage,
                complianceStatus: complianceStatus.emiratizationMetrics.complianceStatus ===
                    "below-target"
                    ? "non_compliant"
                    : "compliant",
                gapToTarget: complianceStatus.emiratizationMetrics.gap,
                trend: complianceStatus.emiratizationMetrics.trend,
                lastUpdated: new Date().toISOString(),
            });
            setCategoryBreakdown(complianceStatus.categoryBreakdown);
            setRegionalTargets(targets);
            // Load additional data
            loadRecruitmentPipeline();
            loadTawteenReports();
            loadPenaltyRisk();
        }
        catch (error) {
            console.error("Error loading Tawteen data:", error);
            loadFallbackData();
        }
        finally {
            setLoading(false);
        }
    };
    const loadFallbackData = () => {
        setWorkforceData({
            totalEmployees: 45,
            uaeNationals: 4,
            emiratizationRate: 8.9,
            targetRate: 10.0,
            complianceStatus: "non_compliant",
            gapToTarget: 1,
            trend: "improving",
            lastUpdated: new Date().toISOString(),
        });
        setCategoryBreakdown({
            healthcare: {
                total: 25,
                emirati: 2,
                percentage: 8.0,
                target: 12.0,
                status: "below_target",
            },
            administrative: {
                total: 15,
                emirati: 2,
                percentage: 13.3,
                target: 10.0,
                status: "above_target",
            },
            support: {
                total: 5,
                emirati: 0,
                percentage: 0.0,
                target: 5.0,
                status: "below_target",
            },
        });
    };
    const loadRecruitmentPipeline = () => {
        setRecruitmentPipeline({
            uaeNationalCandidates: 12,
            activeRecruitment: 3,
            plannedHires: 2,
            expectedHireDate: "2025-03-15",
            recruitmentChannels: [
                "TAMM Portal",
                "UAE University Partnerships",
                "Professional Networks",
            ],
            challenges: [
                "Limited qualified candidates",
                "Salary expectations",
                "Location preferences",
            ],
        });
    };
    const loadTawteenReports = () => {
        setTawteenReports([
            {
                id: "TWN-2024-Q4",
                reportingPeriod: "Q4 2024",
                submissionDate: "2024-12-31",
                status: "submitted",
                complianceScore: 8.9,
                penalties: 5000,
                incentives: 0,
            },
            {
                id: "TWN-2024-Q3",
                reportingPeriod: "Q3 2024",
                submissionDate: "2024-09-30",
                status: "approved",
                complianceScore: 8.5,
                penalties: 7500,
                incentives: 0,
            },
        ]);
    };
    const loadPenaltyRisk = () => {
        setPenaltyRisk({
            currentRisk: "high",
            estimatedPenalty: 15000,
            riskFactors: [
                "Below 10% Emiratization target",
                "Declining trend in Q4",
                "Limited recruitment pipeline",
            ],
            mitigationActions: [
                "Accelerate UAE national recruitment",
                "Partner with local universities",
                "Implement retention programs",
                "Review compensation packages",
            ],
            timeToCompliance: "6-9 months",
        });
    };
    const submitTawteenReport = async (reportData) => {
        try {
            setLoading(true);
            const response = await ApiService.post("/api/tawteen/submit-report", {
                facilityId,
                reportingPeriod: reportData.period,
                emiratizationData: workforceData,
                categoryBreakdown,
                submittedBy: userId,
            });
            // Validate Emirates ID format for Emirati employees
            if (reportData.emiratiEmployees) {
                for (const employee of reportData.emiratiEmployees) {
                    if (employee.emiratesId &&
                        !ValidationUtils.validateEmiratesId(employee.emiratesId)) {
                        return {
                            success: false,
                            error: `Invalid Emirates ID format for employee: ${employee.name}`,
                            field: "emiratesId",
                        };
                    }
                }
            }
            // Update reports list
            const newReport = {
                id: response.reportId,
                reportingPeriod: reportData.period,
                submissionDate: response.submissionDate,
                status: "submitted",
                complianceScore: response.emiratizationPercentage,
                penalties: 0,
                incentives: 0,
            };
            setTawteenReports((prev) => [newReport, ...prev]);
            setShowReportDialog(false);
        }
        catch (error) {
            console.error("Error submitting Tawteen report:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const updateWorkforceData = async (employeeData) => {
        try {
            setLoading(true);
            const response = await ApiService.put("/api/tawteen/update-workforce-data", {
                facilityId,
                employees: employeeData,
                updatedBy: userId,
            });
            // Update local state
            setWorkforceData((prev) => prev
                ? {
                    ...prev,
                    totalEmployees: response.metrics.totalEmployees,
                    uaeNationals: response.metrics.emiratiEmployees,
                    emiratizationRate: response.metrics.emiratizationPercentage,
                    lastUpdated: new Date().toISOString(),
                }
                : null);
            setCategoryBreakdown(response.metrics.categoryBreakdown);
        }
        catch (error) {
            console.error("Error updating workforce data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getComplianceStatusBadge = (status) => {
        const variants = {
            compliant: "default",
            non_compliant: "destructive",
            at_risk: "secondary",
        };
        const colors = {
            compliant: "text-green-700 bg-green-100",
            non_compliant: "text-red-700 bg-red-100",
            at_risk: "text-yellow-700 bg-yellow-100",
        };
        return (_jsx(Badge, { variant: variants[status] || "secondary", className: colors[status], children: status.replace("_", " ").toUpperCase() }));
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "improving":
                return _jsx(TrendingUp, { className: "w-4 h-4 text-green-500" });
            case "declining":
                return _jsx(TrendingDown, { className: "w-4 h-4 text-red-500" });
            default:
                return _jsx(Target, { className: "w-4 h-4 text-blue-500" });
        }
    };
    const getRiskBadge = (risk) => {
        const colors = {
            low: "text-green-700 bg-green-100",
            medium: "text-yellow-700 bg-yellow-100",
            high: "text-orange-700 bg-orange-100",
            critical: "text-red-700 bg-red-100",
        };
        return (_jsx(Badge, { className: colors[risk], children: risk.toUpperCase() }));
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Tawteen Initiative Compliance Dashboard" }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["UAE National Employment tracking and compliance for ", region] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!isOnline && (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), "Offline Mode"] })), _jsxs(Button, { onClick: loadTawteenData, variant: "outline", size: "sm", disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] }), _jsx(Dialog, { open: showReportDialog, onOpenChange: setShowReportDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Submit Report"] }) }) })] })] }), workforceData && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Total Employees"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: workforceData.totalEmployees }), _jsx("p", { className: "text-xs text-blue-600", children: "Active workforce" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(UserCheck, { className: "w-4 h-4" }), "UAE Nationals"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: workforceData.uaeNationals }), _jsxs("p", { className: "text-xs text-green-600", children: [workforceData.emiratizationRate.toFixed(1), "% of workforce"] })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Target Progress"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [workforceData.emiratizationRate.toFixed(1), "%"] }), _jsx(Progress, { value: (workforceData.emiratizationRate /
                                                workforceData.targetRate) *
                                                100, className: "h-2 mt-2" }), _jsxs("p", { className: "text-xs text-purple-600 mt-1", children: ["Target: ", workforceData.targetRate, "%"] })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Compliance Status"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getComplianceStatusBadge(workforceData.complianceStatus), getTrendIcon(workforceData.trend)] }), _jsxs("p", { className: "text-xs text-orange-600", children: ["Gap: ", workforceData.gapToTarget, " employees"] })] })] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "workforce", children: "Workforce" }), _jsx(TabsTrigger, { value: "recruitment", children: "Recruitment" }), _jsx(TabsTrigger, { value: "reports", children: "Reports" }), _jsx(TabsTrigger, { value: "penalties", children: "Risk & Penalties" }), _jsx(TabsTrigger, { value: "targets", children: "Regional Targets" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Category Breakdown" }), _jsx(CardDescription, { children: "Emiratization by job category" })] }), _jsx(CardContent, { className: "space-y-4", children: Object.entries(categoryBreakdown).map(([category, data]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "capitalize font-medium", children: category }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm", children: [data.emirati, "/", data.total] }), _jsxs(Badge, { variant: data.status === "above_target"
                                                                                ? "default"
                                                                                : "secondary", children: [data.percentage.toFixed(1), "%"] })] })] }), _jsx(Progress, { value: (data.percentage / data.target) * 100, className: "h-2" }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Target: ", data.target, "% | Status:", " ", data.status.replace("_", " ")] })] }, category))) })] }), penaltyRisk && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), "Penalty Risk Assessment"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Current Risk Level:" }), getRiskBadge(penaltyRisk.currentRisk)] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Estimated Penalty:" }), _jsxs("span", { className: "font-semibold text-red-600", children: ["AED ", penaltyRisk.estimatedPenalty.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Time to Compliance:" }), _jsx("span", { className: "font-medium", children: penaltyRisk.timeToCompliance })] }), _jsxs("div", { className: "pt-2 border-t", children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Risk Factors:" }), _jsx("ul", { className: "list-disc list-inside space-y-1 text-xs text-gray-600", children: penaltyRisk.riskFactors.map((factor, index) => (_jsx("li", { children: factor }, index))) })] })] })] }))] }) }), _jsx(TabsContent, { value: "workforce", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Workforce Management" }), _jsx(CardDescription, { children: "Manage employee data and Emiratization tracking" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search employees...", className: "pl-10 w-64" })] }), _jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "healthcare", children: "Healthcare" }), _jsx(SelectItem, { value: "administrative", children: "Administrative" }), _jsx(SelectItem, { value: "support", children: "Support" })] })] })] }), _jsx(Dialog, { open: showEmployeeDialog, onOpenChange: setShowEmployeeDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Employee"] }) }) })] }), _jsxs("div", { className: "text-center py-8", children: [_jsx(Users, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Employee Management" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Add and manage employee records for Tawteen compliance tracking" }), _jsxs(Button, { onClick: () => setShowEmployeeDialog(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add First Employee"] })] })] })] }) }), _jsx(TabsContent, { value: "recruitment", className: "space-y-6", children: recruitmentPipeline && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recruitment Pipeline" }), _jsx(CardDescription, { children: "UAE National recruitment progress" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: recruitmentPipeline.uaeNationalCandidates }), _jsx("div", { className: "text-xs text-blue-600", children: "Candidates" })] }), _jsxs("div", { className: "p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: recruitmentPipeline.activeRecruitment }), _jsx("div", { className: "text-xs text-green-600", children: "Active" })] }), _jsxs("div", { className: "p-3 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: recruitmentPipeline.plannedHires }), _jsx("div", { className: "text-xs text-purple-600", children: "Planned" })] })] }), _jsx("div", { className: "pt-4 border-t", children: _jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { className: "text-gray-600", children: "Expected Hire Date:" }), _jsx("span", { className: "font-medium", children: new Date(recruitmentPipeline.expectedHireDate).toLocaleDateString() })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recruitment Channels" }) }), _jsxs(CardContent, { className: "space-y-3", children: [recruitmentPipeline.recruitmentChannels.map((channel, index) => (_jsxs("div", { className: "flex items-center gap-3 p-3 border rounded-lg", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }), _jsx("span", { children: channel })] }, index))), _jsxs(Button, { variant: "outline", className: "w-full mt-4", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Channel"] })] })] })] })) }), _jsx(TabsContent, { value: "reports", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tawteen Reports" }), _jsx(CardDescription, { children: "Quarterly compliance reports and submissions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Report ID" }), _jsx(TableHead, { children: "Period" }), _jsx(TableHead, { children: "Submission Date" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Compliance Score" }), _jsx(TableHead, { children: "Penalties" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: tawteenReports.map((report) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: report.id }), _jsx(TableCell, { children: report.reportingPeriod }), _jsx(TableCell, { children: new Date(report.submissionDate).toLocaleDateString() }), _jsx(TableCell, { children: _jsx(Badge, { variant: report.status === "approved"
                                                                            ? "default"
                                                                            : "secondary", children: report.status.toUpperCase() }) }), _jsxs(TableCell, { children: [report.complianceScore.toFixed(1), "%"] }), _jsxs(TableCell, { className: "text-red-600", children: ["AED ", report.penalties.toLocaleString()] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Download, { className: "w-4 h-4" }) })] }) })] }, report.id))) })] }) }) })] }) }), _jsx(TabsContent, { value: "penalties", className: "space-y-6", children: penaltyRisk && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-red-700", children: "Penalty Risk Analysis" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-red-50 rounded-lg border border-red-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium text-red-800", children: "Current Risk Level" }), getRiskBadge(penaltyRisk.currentRisk)] }), _jsxs("div", { className: "text-2xl font-bold text-red-900 mb-1", children: ["AED ", penaltyRisk.estimatedPenalty.toLocaleString()] }), _jsx("div", { className: "text-sm text-red-600", children: "Estimated quarterly penalty" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Risk Factors:" }), _jsx("ul", { className: "space-y-2", children: penaltyRisk.riskFactors.map((factor, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" }), factor] }, index))) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-green-700", children: "Mitigation Actions" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200", children: [_jsx("div", { className: "font-medium text-green-800 mb-1", children: "Time to Compliance" }), _jsx("div", { className: "text-2xl font-bold text-green-900", children: penaltyRisk.timeToCompliance })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Recommended Actions:" }), _jsx("ul", { className: "space-y-2", children: penaltyRisk.mitigationActions.map((action, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" }), action] }, index))) })] }), _jsxs(Button, { className: "w-full mt-4", children: [_jsx(Target, { className: "w-4 h-4 mr-2" }), "Create Action Plan"] })] })] })] })) }), _jsx(TabsContent, { value: "targets", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: ["Regional Targets - ", region] }), _jsx(CardDescription, { children: "Emiratization targets and requirements for your region" })] }), _jsx(CardContent, { children: regionalTargets ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [regionalTargets.emiratizationTarget, "%"] }), _jsx("div", { className: "text-sm text-blue-600", children: "Overall Target" })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: regionalTargets.reportingFrequency }), _jsx("div", { className: "text-sm text-green-600", children: "Reporting" })] }), _jsxs("div", { className: "p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: new Date(regionalTargets.nextDeadline).toLocaleDateString() }), _jsx("div", { className: "text-sm text-purple-600", children: "Next Deadline" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Category Targets:" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(regionalTargets.categoryTargets).map(([category, target]) => (_jsx("div", { className: "p-3 border rounded-lg", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "capitalize font-medium", children: category.replace("_", " ") }), _jsxs("span", { className: "text-lg font-bold", children: [target, "%"] })] }) }, category))) })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading regional targets..." })] })) })] }) })] }), _jsx(Dialog, { open: showReportDialog, onOpenChange: setShowReportDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Submit Tawteen Report" }), _jsx(DialogDescription, { children: "Submit quarterly Tawteen compliance report" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reporting-period", children: "Reporting Period" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select period" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Q1-2030", children: "Q1 2030" }), _jsx(SelectItem, { value: "Q4-2029", children: "Q4 2029" }), _jsx(SelectItem, { value: "Q3-2029", children: "Q3 2029" }), _jsx(SelectItem, { value: "Q2-2029", children: "Q2 2029" }), _jsx(SelectItem, { value: "Q1-2029", children: "Q1 2029" }), _jsx(SelectItem, { value: "Q4-2028", children: "Q4 2028" }), _jsx(SelectItem, { value: "Q3-2028", children: "Q3 2028" }), _jsx(SelectItem, { value: "Q2-2028", children: "Q2 2028" }), _jsx(SelectItem, { value: "Q1-2028", children: "Q1 2028" }), _jsx(SelectItem, { value: "Q4-2027", children: "Q4 2027" }), _jsx(SelectItem, { value: "Q3-2027", children: "Q3 2027" }), _jsx(SelectItem, { value: "Q2-2027", children: "Q2 2027" }), _jsx(SelectItem, { value: "Q1-2027", children: "Q1 2027" }), _jsx(SelectItem, { value: "Q4-2026", children: "Q4 2026" }), _jsx(SelectItem, { value: "Q3-2026", children: "Q3 2026" }), _jsx(SelectItem, { value: "Q2-2026", children: "Q2 2026" }), _jsx(SelectItem, { value: "Q1-2026", children: "Q1 2026" }), _jsx(SelectItem, { value: "Q4-2025", children: "Q4 2025" }), _jsx(SelectItem, { value: "Q3-2025", children: "Q3 2025" }), _jsx(SelectItem, { value: "Q2-2025", children: "Q2 2025" }), _jsx(SelectItem, { value: "Q1-2025", children: "Q1 2025" }), _jsx(SelectItem, { value: "Q4-2024", children: "Q4 2024" }), _jsx(SelectItem, { value: "Q3-2024", children: "Q3 2024" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "submission-type", children: "Submission Type" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "regular", children: "Regular Report" }), _jsx(SelectItem, { value: "amended", children: "Amended Report" }), _jsx(SelectItem, { value: "final", children: "Final Report" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "comments", children: "Comments (Optional)" }), _jsx(Textarea, { id: "comments", placeholder: "Add any additional comments or explanations...", rows: 3 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowReportDialog(false), children: "Cancel" }), _jsx(Button, { disabled: loading, children: loading ? "Submitting..." : "Submit Report" })] })] }) }), _jsx(Dialog, { open: showEmployeeDialog, onOpenChange: setShowEmployeeDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Employee" }), _jsx(DialogDescription, { children: "Add new employee for Tawteen tracking" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "employee-name", children: "Full Name" }), _jsx(Input, { id: "employee-name", placeholder: "Enter full name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "employee-id", children: "Employee ID" }), _jsx(Input, { id: "employee-id", placeholder: "Enter employee ID" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "nationality", children: "Nationality" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select nationality" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "UAE", children: "UAE" }), _jsx(SelectItem, { value: "Other", children: "Other" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "category", children: "Job Category" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "healthcare", children: "Healthcare" }), _jsx(SelectItem, { value: "administrative", children: "Administrative" }), _jsx(SelectItem, { value: "support", children: "Support" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "position", children: "Position" }), _jsx(Input, { id: "position", placeholder: "Enter job position" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowEmployeeDialog(false), children: "Cancel" }), _jsx(Button, { disabled: loading, children: loading ? "Adding..." : "Add Employee" })] })] }) })] }) }));
}
