import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { FileText, Search, Plus, Edit, CheckCircle, AlertCircle, RefreshCw, Download, AlertTriangle, FileX, BarChart3, DollarSign, FileBarChart, ClipboardCheck, Send, Eye, Settings, } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const ClaimsProcessingDashboard = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const [activeTab, setActiveTab] = useState("daily-generation");
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [showClaimDialog, setShowClaimDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    // Dashboard statistics
    const [dashboardStats, setDashboardStats] = useState({
        totalClaims: 0,
        pendingValidation: 0,
        readyForSubmission: 0,
        validationIssues: 0,
        averageProcessingTime: 0,
        approvalRate: 0,
        totalClaimAmount: 0,
        paidAmount: 0,
    });
    // Mock data for claims processing
    const mockClaims = [
        {
            id: "1",
            patient_id: 12345,
            patient_name: "Mohammed Al Mansoori",
            service_month: 2,
            service_year: 2024,
            claim_number: "CL-2024-0001",
            claim_type: "Initial",
            claim_status: "Draft",
            primary_clinician: "Sarah Ahmed",
            primary_clinician_license: "DOH-N-2023-12345",
            primary_clinician_license_expiry: "2025-01-14",
            primary_clinician_license_status: "Active",
            authorization_number: "DAMAN-PA-2024-12345",
            authorization_start_date: "2024-01-20",
            authorization_end_date: "2024-04-20",
            authorized_services: "Home Nursing, Physiotherapy",
            authorized_quantity: 90,
            total_services_provided: 28,
            total_authorized_services: 30,
            service_utilization_rate: 93.3,
            service_provision_status: "Active",
            documentation_audit_status: "Pass",
            claim_amount: 7500.0,
            approved_amount: 7500.0,
            approval_probability: 0.95,
            created_at: "2024-02-01T08:00:00Z",
            updated_at: "2024-02-15T14:30:00Z",
        },
        {
            id: "2",
            patient_id: 12346,
            patient_name: "Fatima Al Zaabi",
            service_month: 2,
            service_year: 2024,
            claim_number: "CL-2024-0002",
            claim_type: "Initial",
            claim_status: "Pending",
            primary_clinician: "Ali Hassan",
            primary_clinician_license: "DOH-PT-2022-67890",
            primary_clinician_license_expiry: "2024-03-09",
            primary_clinician_license_status: "Pending Renewal",
            authorization_number: "DAMAN-PA-2024-12346",
            authorization_start_date: "2024-01-22",
            authorization_end_date: "2024-04-22",
            authorized_services: "Physical Therapy",
            authorized_quantity: 36,
            total_services_provided: 12,
            total_authorized_services: 12,
            service_utilization_rate: 100.0,
            service_provision_status: "Active",
            documentation_audit_status: "Needs Review",
            documentation_audit_remarks: "Missing service logs for 3 days",
            claim_amount: 3600.0,
            approval_probability: 0.75,
            created_at: "2024-02-01T09:15:00Z",
            updated_at: "2024-02-15T16:45:00Z",
        },
        {
            id: "3",
            patient_id: 12347,
            patient_name: "Ahmed Al Shamsi",
            service_month: 2,
            service_year: 2024,
            claim_number: "CL-2024-0003",
            claim_type: "Initial",
            claim_status: "Submitted",
            submission_date: "2024-02-14",
            primary_clinician: "Khalid Rahman",
            primary_clinician_license: "DOH-ST-2023-24680",
            primary_clinician_license_expiry: "2024-03-31",
            primary_clinician_license_status: "Pending Renewal",
            authorization_number: "DAMAN-PA-2024-12347",
            authorization_start_date: "2024-01-25",
            authorization_end_date: "2024-04-25",
            authorized_services: "Speech Therapy",
            authorized_quantity: 24,
            total_services_provided: 8,
            total_authorized_services: 8,
            service_utilization_rate: 100.0,
            service_provision_status: "Active",
            documentation_audit_status: "Pass",
            claim_amount: 4200.0,
            approved_amount: 4200.0,
            claim_processing_time_days: 3,
            approval_probability: 0.9,
            created_at: "2024-02-01T10:30:00Z",
            updated_at: "2024-02-14T11:20:00Z",
        },
        {
            id: "4",
            patient_id: 12348,
            patient_name: "Mariam Al Nuaimi",
            service_month: 2,
            service_year: 2024,
            claim_number: "CL-2024-0004",
            claim_type: "Initial",
            claim_status: "Draft",
            primary_clinician: "Aisha Al Hashimi",
            primary_clinician_license: "DOH-N-2022-98765",
            primary_clinician_license_expiry: "2024-07-14",
            primary_clinician_license_status: "Active",
            authorization_number: "DAMAN-PA-2024-12348",
            authorization_start_date: "2024-01-28",
            authorization_end_date: "2024-04-28",
            authorized_services: "Home Nursing",
            authorized_quantity: 60,
            total_services_provided: 27,
            total_authorized_services: 30,
            service_utilization_rate: 90.0,
            service_provision_status: "Active",
            documentation_audit_status: "Fail",
            documentation_audit_remarks: "Incomplete clinical notes, missing vital signs records",
            claim_amount: 6750.0,
            approval_probability: 0.45,
            created_at: "2024-02-01T11:45:00Z",
            updated_at: "2024-02-15T17:10:00Z",
        },
    ];
    // Load claims on component mount
    useEffect(() => {
        const fetchClaims = async () => {
            try {
                // In a real implementation, this would be an API call
                setClaims(mockClaims);
                // Calculate dashboard statistics
                const stats = {
                    totalClaims: mockClaims.length,
                    pendingValidation: mockClaims.filter((c) => c.documentation_audit_status === "Needs Review" ||
                        c.documentation_audit_status === "Fail").length,
                    readyForSubmission: mockClaims.filter((c) => c.claim_status === "Draft" &&
                        c.documentation_audit_status === "Pass").length,
                    validationIssues: mockClaims.filter((c) => c.documentation_audit_status === "Fail").length,
                    averageProcessingTime: mockClaims
                        .filter((c) => c.claim_processing_time_days)
                        .reduce((sum, c) => sum + (c.claim_processing_time_days || 0), 0) /
                        mockClaims.filter((c) => c.claim_processing_time_days).length ||
                        0,
                    approvalRate: (mockClaims
                        .filter((c) => c.approval_probability)
                        .reduce((sum, c) => sum + (c.approval_probability || 0), 0) /
                        mockClaims.filter((c) => c.approval_probability).length) *
                        100 || 0,
                    totalClaimAmount: mockClaims.reduce((sum, c) => sum + c.claim_amount, 0),
                    paidAmount: mockClaims.reduce((sum, c) => sum + (c.paid_amount || 0), 0),
                };
                setDashboardStats(stats);
            }
            catch (error) {
                console.error("Error fetching claims:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchClaims();
    }, []);
    // Filter claims based on search and status
    const filteredClaims = claims.filter((claim) => {
        const matchesSearch = claim.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            claim.primary_clinician.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" ||
            claim.claim_status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });
    // Get status badge variant
    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case "submitted":
                return "default";
            case "paid":
                return "success";
            case "denied":
                return "destructive";
            case "pending":
                return "warning";
            case "draft":
                return "secondary";
            default:
                return "outline";
        }
    };
    // Get audit status badge variant
    const getAuditStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case "pass":
                return "success";
            case "fail":
                return "destructive";
            case "needs review":
                return "warning";
            default:
                return "secondary";
        }
    };
    // Handle claim validation
    const handleValidateClaim = (claimId) => {
        setClaims(claims.map((claim) => claim.id === claimId
            ? {
                ...claim,
                documentation_audit_status: "Pass",
                updated_at: new Date().toISOString(),
            }
            : claim));
    };
    // Handle claim submission
    const handleSubmitClaim = (claimId) => {
        setClaims(claims.map((claim) => claim.id === claimId
            ? {
                ...claim,
                claim_status: "Submitted",
                submission_date: new Date().toISOString().split("T")[0],
                updated_at: new Date().toISOString(),
            }
            : claim));
    };
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Claims Processing Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Manage daily claims generation, validation, and submission processes" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Button, { onClick: () => setShowClaimDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Generate New Claim"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Total Claims"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: dashboardStats.totalClaims }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Active processing records" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Pending Validation"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-amber-600", children: dashboardStats.pendingValidation }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Require review and validation" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Ready for Submission"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: dashboardStats.readyForSubmission }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Validated and ready to submit" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Total Claim Value"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["AED ", dashboardStats.totalClaimAmount.toLocaleString()] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Combined claim amounts" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "daily-generation", children: [_jsx(FileBarChart, { className: "h-4 w-4 mr-2" }), "Daily Generation"] }), _jsxs(TabsTrigger, { value: "validation", children: [_jsx(ClipboardCheck, { className: "h-4 w-4 mr-2" }), "Validation"] }), _jsxs(TabsTrigger, { value: "submission", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Submission"] }), _jsxs(TabsTrigger, { value: "analytics", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Analytics"] })] }), _jsx(TabsContent, { value: "daily-generation", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Daily Claims Generation" }), _jsx(CardDescription, { children: "Generate and manage daily claims based on service delivery documentation" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Configure"] }), _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Generate Claims"] })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search claims...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "submitted", children: "Submitted" }), _jsx(SelectItem, { value: "paid", children: "Paid" }), _jsx(SelectItem, { value: "denied", children: "Denied" })] })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Claim Number" }), _jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Provider" }), _jsx(TableHead, { children: "Service Period" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Audit Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto text-muted-foreground" }) }) })) : filteredClaims.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground", children: "No claims found matching your criteria" }) })) : (filteredClaims.map((claim) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: claim.claim_number }), _jsx(TableCell, { children: claim.patient_name }), _jsx(TableCell, { children: claim.primary_clinician }), _jsxs(TableCell, { children: [new Date(0, claim.service_month - 1).toLocaleString("default", {
                                                                            month: "short",
                                                                        }), " ", claim.service_year] }), _jsxs(TableCell, { children: ["AED ", claim.claim_amount.toLocaleString()] }), _jsx(TableCell, { children: _jsx(Badge, { variant: getStatusBadgeVariant(claim.claim_status), children: claim.claim_status }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: getAuditStatusBadgeVariant(claim.documentation_audit_status), children: claim.documentation_audit_status }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedClaim(claim), children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedClaim(claim), children: _jsx(Edit, { className: "h-4 w-4" }) })] }) })] }, claim.id)))) })] }) })] }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", filteredClaims.length, " of ", claims.length, " claims"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] }), _jsxs(Button, { size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] })] })] })] }) }), _jsx(TabsContent, { value: "validation", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claims Validation" }), _jsx(CardDescription, { children: "Review and validate claims before submission" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Validation Queue" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-amber-600", children: claims.filter((c) => c.documentation_audit_status === "Needs Review").length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Claims awaiting review" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Failed Validation" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: claims.filter((c) => c.documentation_audit_status === "Fail").length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Claims with issues" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Validation Rate" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [Math.round((claims.filter((c) => c.documentation_audit_status === "Pass").length /
                                                                            claims.length) *
                                                                            100), "%"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Success rate" })] })] })] }), _jsx("div", { className: "space-y-4", children: claims
                                                .filter((c) => c.documentation_audit_status !== "Pass")
                                                .map((claim) => (_jsxs(Card, { className: "border-l-4 border-l-amber-500", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: claim.claim_number }), _jsxs(CardDescription, { children: [claim.patient_name, " \u2022 ", claim.primary_clinician] })] }), _jsx(Badge, { variant: getAuditStatusBadgeVariant(claim.documentation_audit_status), children: claim.documentation_audit_status })] }) }), _jsxs(CardContent, { children: [claim.documentation_audit_remarks && (_jsx("div", { className: "bg-amber-50 p-3 rounded-md mb-4", children: _jsxs("p", { className: "text-sm text-amber-800", children: [_jsx(AlertTriangle, { className: "h-4 w-4 inline mr-2" }), claim.documentation_audit_remarks] }) })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Amount:" }), _jsxs("p", { children: ["AED ", claim.claim_amount.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Services:" }), _jsxs("p", { children: [claim.total_services_provided, "/", claim.total_authorized_services] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Utilization:" }), _jsxs("p", { children: [claim.service_utilization_rate.toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "License Status:" }), _jsx("p", { children: claim.primary_clinician_license_status })] })] })] }), _jsxs(CardFooter, { className: "flex justify-end gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Review Details"] }), claim.documentation_audit_status ===
                                                                "Needs Review" && (_jsxs(Button, { size: "sm", onClick: () => handleValidateClaim(claim.id), children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Approve"] })), claim.documentation_audit_status === "Fail" && (_jsxs(Button, { variant: "destructive", size: "sm", children: [_jsx(FileX, { className: "h-4 w-4 mr-2" }), "Request Corrections"] }))] })] }, claim.id))) })] })] }) }), _jsx(TabsContent, { value: "submission", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claims Submission" }), _jsx(CardDescription, { children: "Submit validated claims to insurance providers" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Ready for Submission" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: claims.filter((c) => c.claim_status === "Draft" &&
                                                                        c.documentation_audit_status === "Pass").length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Validated claims" }), _jsxs(Button, { className: "w-full mt-4", size: "sm", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Submit All"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Submitted Today" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: claims.filter((c) => c.submission_date ===
                                                                        new Date().toISOString().split("T")[0]).length }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Claims submitted" }), _jsxs(Button, { variant: "outline", className: "w-full mt-4", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "View Submissions"] })] })] })] }), _jsx("div", { className: "space-y-4", children: claims
                                                .filter((c) => c.claim_status === "Draft" &&
                                                c.documentation_audit_status === "Pass")
                                                .map((claim) => (_jsxs(Card, { className: "border-l-4 border-l-green-500", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: claim.claim_number }), _jsxs(CardDescription, { children: [claim.patient_name, " \u2022 AED", " ", claim.claim_amount.toLocaleString()] })] }), _jsx(Badge, { variant: "success", children: "Ready to Submit" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Provider:" }), _jsx("p", { children: claim.primary_clinician })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Authorization:" }), _jsx("p", { children: claim.authorization_number })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Service Period:" }), _jsxs("p", { children: [new Date(0, claim.service_month - 1).toLocaleString("default", {
                                                                                    month: "short",
                                                                                }), " ", claim.service_year] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Approval Probability:" }), _jsxs("p", { children: [((claim.approval_probability || 0) * 100).toFixed(0), "%"] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-end gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Preview"] }), _jsxs(Button, { size: "sm", onClick: () => handleSubmitClaim(claim.id), children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Submit"] })] })] }, claim.id))) })] })] }) }), _jsx(TabsContent, { value: "analytics", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Processing Performance" }), _jsx(CardDescription, { children: "Key metrics for claims processing efficiency" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Average Processing Time:" }), _jsxs("span", { className: "text-lg font-bold", children: [dashboardStats.averageProcessingTime.toFixed(1), " days"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Approval Rate:" }), _jsxs("span", { className: "text-lg font-bold text-green-600", children: [dashboardStats.approvalRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Validation Success Rate:" }), _jsxs("span", { className: "text-lg font-bold", children: [Math.round((claims.filter((c) => c.documentation_audit_status === "Pass").length /
                                                                        claims.length) *
                                                                        100), "%"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Claims Requiring Attention:" }), _jsx("span", { className: "text-lg font-bold text-amber-600", children: dashboardStats.validationIssues })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Financial Summary" }), _jsx(CardDescription, { children: "Claims value and payment tracking" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Claims Value:" }), _jsxs("span", { className: "text-lg font-bold", children: ["AED ", dashboardStats.totalClaimAmount.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Approved Amount:" }), _jsxs("span", { className: "text-lg font-bold text-green-600", children: ["AED", " ", claims
                                                                        .reduce((sum, c) => sum + (c.approved_amount || 0), 0)
                                                                        .toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Paid Amount:" }), _jsxs("span", { className: "text-lg font-bold", children: ["AED ", dashboardStats.paidAmount.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Collection Rate:" }), _jsxs("span", { className: "text-lg font-bold", children: [dashboardStats.totalClaimAmount > 0
                                                                        ? Math.round((dashboardStats.paidAmount /
                                                                            dashboardStats.totalClaimAmount) *
                                                                            100)
                                                                        : 0, "%"] })] })] }) })] })] }) })] }), selectedClaim && (_jsx(Dialog, { open: !!selectedClaim, onOpenChange: () => setSelectedClaim(null), children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: selectedClaim.claim_number }), _jsxs(DialogDescription, { children: ["Claim details for ", selectedClaim.patient_name] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Patient Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Patient ID:" }), _jsx("span", { children: selectedClaim.patient_id })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Name:" }), _jsx("span", { children: selectedClaim.patient_name })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Service Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Service Period:" }), _jsxs("span", { children: [new Date(0, selectedClaim.service_month - 1).toLocaleString("default", { month: "long" }), " ", selectedClaim.service_year] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Authorized Services:" }), _jsx("span", { children: selectedClaim.authorized_services })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Services Provided:" }), _jsxs("span", { children: [selectedClaim.total_services_provided, "/", selectedClaim.total_authorized_services] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Utilization Rate:" }), _jsxs("span", { children: [selectedClaim.service_utilization_rate.toFixed(1), "%"] })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Provider Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Primary Clinician:" }), _jsx("span", { children: selectedClaim.primary_clinician })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "License Number:" }), _jsx("span", { children: selectedClaim.primary_clinician_license })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "License Expiry:" }), _jsx("span", { children: selectedClaim.primary_clinician_license_expiry })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "License Status:" }), _jsx(Badge, { variant: selectedClaim.primary_clinician_license_status ===
                                                                        "Active"
                                                                        ? "success"
                                                                        : "warning", children: selectedClaim.primary_clinician_license_status })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Financial Information" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Claim Amount:" }), _jsxs("span", { children: ["AED ", selectedClaim.claim_amount.toLocaleString()] })] }), selectedClaim.approved_amount && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Approved Amount:" }), _jsxs("span", { children: ["AED ", selectedClaim.approved_amount.toLocaleString()] })] })), selectedClaim.approval_probability && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Approval Probability:" }), _jsxs("span", { children: [(selectedClaim.approval_probability * 100).toFixed(0), "%"] })] }))] })] })] })] }), selectedClaim.documentation_audit_remarks && (_jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-medium mb-2", children: "Audit Remarks" }), _jsx("div", { className: "bg-amber-50 p-3 rounded-md", children: _jsx("p", { className: "text-sm text-amber-800", children: selectedClaim.documentation_audit_remarks }) })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setSelectedClaim(null), children: "Close" }), _jsx(Button, { children: "Edit Claim" })] })] }) }))] }));
};
export default ClaimsProcessingDashboard;
