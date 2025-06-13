import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertTriangle, FileText, Clock, CheckCircle, XCircle, Upload, Download, RefreshCw, Search, TrendingUp, TrendingDown, Calendar, DollarSign, } from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const DenialManagementDashboard = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const { isLoading, error, recordDenial, submitAppeal, denialAnalytics, fetchDenialAnalytics, } = useRevenueManagement();
    const [activeTab, setActiveTab] = useState("denials");
    const [denialData, setDenialData] = useState([]);
    const [selectedDenial, setSelectedDenial] = useState(null);
    const [showAppealDialog, setShowAppealDialog] = useState(false);
    const [showDenialDialog, setShowDenialDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [appealReason, setAppealReason] = useState("");
    const [appealDocuments, setAppealDocuments] = useState([]);
    const [appealNotes, setAppealNotes] = useState("");
    // Mock data for demonstration
    const mockDenialData = [
        {
            id: "1",
            claimId: "CL-2024-0001",
            patientName: "Mohammed Al Mansoori",
            denialDate: "2024-02-10",
            denialReason: "Insufficient clinical documentation",
            denialCode: "D001",
            denialAmount: 7500.0,
            appealStatus: "not_started",
            appealDeadline: "2024-03-12",
            supportingDocuments: ["medical-report.pdf", "authorization-form.pdf"],
            priority: "high",
            assignedTo: "Dr. Sarah Ahmed",
            lastUpdated: "2024-02-10T10:30:00Z",
        },
        {
            id: "2",
            claimId: "CL-2024-0002",
            patientName: "Fatima Al Zaabi",
            denialDate: "2024-02-08",
            denialReason: "Service not covered under policy",
            denialCode: "D002",
            denialAmount: 3600.0,
            appealStatus: "in_progress",
            appealDeadline: "2024-03-10",
            appealSubmissionDate: "2024-02-15",
            supportingDocuments: [
                "policy-coverage.pdf",
                "clinical-notes.pdf",
                "appeal-letter.pdf",
            ],
            priority: "medium",
            assignedTo: "Dr. Ahmed Hassan",
            lastUpdated: "2024-02-15T14:20:00Z",
        },
        {
            id: "3",
            claimId: "CL-2024-0003",
            patientName: "Ahmed Al Shamsi",
            denialDate: "2024-02-05",
            denialReason: "Duplicate claim submission",
            denialCode: "D003",
            denialAmount: 4200.0,
            appealStatus: "approved",
            appealDeadline: "2024-03-07",
            appealSubmissionDate: "2024-02-12",
            supportingDocuments: ["original-claim.pdf", "duplicate-analysis.pdf"],
            priority: "low",
            assignedTo: "Dr. Mariam Ali",
            lastUpdated: "2024-02-20T09:15:00Z",
        },
        {
            id: "4",
            claimId: "CL-2024-0004",
            patientName: "Mariam Al Nuaimi",
            denialDate: "2024-02-12",
            denialReason: "Pre-authorization required",
            denialCode: "D004",
            denialAmount: 6750.0,
            appealStatus: "submitted",
            appealDeadline: "2024-03-14",
            appealSubmissionDate: "2024-02-18",
            supportingDocuments: ["pre-auth-request.pdf", "medical-necessity.pdf"],
            priority: "urgent",
            assignedTo: "Dr. Omar Khalil",
            lastUpdated: "2024-02-18T16:45:00Z",
        },
    ];
    useEffect(() => {
        loadDenialData();
        if (isOnline && !isOffline) {
            fetchDenialAnalytics();
        }
    }, []);
    const loadDenialData = async () => {
        try {
            if (isOnline && !isOffline) {
                // In a real implementation, this would fetch from API
                setDenialData(mockDenialData);
            }
            else {
                setDenialData(mockDenialData);
            }
        }
        catch (error) {
            console.error("Error loading denial data:", error);
            setDenialData(mockDenialData);
        }
    };
    const handleSubmitAppeal = async (denial) => {
        try {
            const appealData = {
                claimId: denial.claimId,
                denialId: denial.id,
                appealReason,
                supportingDocuments: appealDocuments,
                additionalInformation: appealNotes,
                submissionDate: new Date().toISOString(),
            };
            if (isOnline && !isOffline) {
                await submitAppeal(appealData);
            }
            // Update local state
            setDenialData((prev) => prev.map((item) => item.id === denial.id
                ? {
                    ...item,
                    appealStatus: "submitted",
                    appealSubmissionDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                }
                : item));
            setShowAppealDialog(false);
            setSelectedDenial(null);
            setAppealReason("");
            setAppealDocuments([]);
            setAppealNotes("");
        }
        catch (error) {
            console.error("Error submitting appeal:", error);
        }
    };
    const handleRecordDenial = async (denialFormData) => {
        try {
            if (isOnline && !isOffline) {
                await recordDenial(denialFormData);
            }
            // Add to local state
            const newDenial = {
                id: `denial-${Date.now()}`,
                claimId: denialFormData.claimId,
                patientName: denialFormData.patientName,
                denialDate: denialFormData.denialDate || new Date().toISOString(),
                denialReason: denialFormData.reason,
                denialCode: denialFormData.code,
                denialAmount: denialFormData.amount,
                appealStatus: "not_started",
                appealDeadline: denialFormData.appealDeadline,
                supportingDocuments: denialFormData.supportingDocuments || [],
                priority: denialFormData.priority || "medium",
                assignedTo: denialFormData.assignedTo,
                lastUpdated: new Date().toISOString(),
            };
            setDenialData((prev) => [newDenial, ...prev]);
            setShowDenialDialog(false);
        }
        catch (error) {
            console.error("Error recording denial:", error);
        }
    };
    const filteredData = denialData.filter((denial) => {
        const matchesSearch = denial.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            denial.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            denial.denialReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            denial.denialCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || denial.appealStatus === statusFilter;
        const matchesPriority = priorityFilter === "all" || denial.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });
    const getStatusBadge = (status) => {
        const variants = {
            not_started: "destructive",
            in_progress: "secondary",
            submitted: "outline",
            approved: "default",
            denied: "destructive",
        };
        const icons = {
            not_started: _jsx(XCircle, { className: "w-3 h-3" }),
            in_progress: _jsx(Clock, { className: "w-3 h-3" }),
            submitted: _jsx(FileText, { className: "w-3 h-3" }),
            approved: _jsx(CheckCircle, { className: "w-3 h-3" }),
            denied: _jsx(XCircle, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status.replace("_", " ").charAt(0).toUpperCase() +
                    status.replace("_", " ").slice(1)] }));
    };
    const getPriorityBadge = (priority) => {
        const variants = {
            low: "outline",
            medium: "secondary",
            high: "default",
            urgent: "destructive",
        };
        return (_jsx(Badge, { variant: variants[priority] || "outline", children: priority.charAt(0).toUpperCase() + priority.slice(1) }));
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
        }).format(amount);
    };
    const calculateSummaryStats = () => {
        const totalDenials = denialData.length;
        const totalDenialAmount = denialData.reduce((sum, denial) => sum + denial.denialAmount, 0);
        const notStartedCount = denialData.filter((denial) => denial.appealStatus === "not_started").length;
        const inProgressCount = denialData.filter((denial) => denial.appealStatus === "in_progress").length;
        const submittedCount = denialData.filter((denial) => denial.appealStatus === "submitted").length;
        const approvedCount = denialData.filter((denial) => denial.appealStatus === "approved").length;
        const urgentCount = denialData.filter((denial) => denial.priority === "urgent").length;
        return {
            totalDenials,
            totalDenialAmount,
            notStartedCount,
            inProgressCount,
            submittedCount,
            approvedCount,
            urgentCount,
            appealSuccessRate: submittedCount + approvedCount > 0
                ? (approvedCount / (submittedCount + approvedCount)) * 100
                : 0,
        };
    };
    const stats = calculateSummaryStats();
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Denial Management Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage claim denials, track appeals, and monitor success rates" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Button, { onClick: () => setShowDenialDialog(true), className: "bg-primary", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "Record Denial"] }), _jsxs(Button, { onClick: loadDenialData, disabled: isLoading, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Total Denials"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalDenials }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.urgentCount, " urgent cases"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Denial Amount"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(stats.totalDenialAmount) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Total denied revenue" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Pending Appeals"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-amber-600", children: stats.notStartedCount + stats.inProgressCount }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.notStartedCount, " not started, ", stats.inProgressCount, " in progress"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Success Rate"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [stats.appealSuccessRate.toFixed(1), "%"] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.approvedCount, " of", " ", stats.submittedCount + stats.approvedCount, " appeals"] })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "denials", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Denials"] }), _jsxs(TabsTrigger, { value: "appeals", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Appeals"] }), _jsxs(TabsTrigger, { value: "analytics", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Analytics"] })] }), _jsx(TabsContent, { value: "denials", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Claim Denials" }), _jsx(CardDescription, { children: "Track and manage all claim denials and their appeal status" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import Denials"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by patient, claim ID, or reason...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "not_started", children: "Not Started" }), _jsx(SelectItem, { value: "in_progress", children: "In Progress" }), _jsx(SelectItem, { value: "submitted", children: "Submitted" }), _jsx(SelectItem, { value: "approved", children: "Approved" }), _jsx(SelectItem, { value: "denied", children: "Denied" })] })] }), _jsxs(Select, { value: priorityFilter, onValueChange: setPriorityFilter, children: [_jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Filter by priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priorities" }), _jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Claim ID" }), _jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Denial Reason" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Priority" }), _jsx(TableHead, { children: "Appeal Status" }), _jsx(TableHead, { children: "Deadline" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto text-muted-foreground" }) }) })) : filteredData.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground", children: "No denial records found" }) })) : (filteredData.map((denial) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: denial.claimId }), _jsx(TableCell, { children: denial.patientName }), _jsx(TableCell, { children: _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: denial.denialReason }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Code: ", denial.denialCode] })] }) }), _jsx(TableCell, { children: formatCurrency(denial.denialAmount) }), _jsx(TableCell, { children: getPriorityBadge(denial.priority) }), _jsx(TableCell, { children: getStatusBadge(denial.appealStatus) }), _jsx(TableCell, { children: denial.appealDeadline ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3" }), new Date(denial.appealDeadline).toLocaleDateString()] })) : ("—") }), _jsx(TableCell, { children: _jsx("div", { className: "flex gap-2", children: denial.appealStatus === "not_started" ||
                                                                            denial.appealStatus === "in_progress" ? (_jsx(Button, { size: "sm", onClick: () => {
                                                                                setSelectedDenial(denial);
                                                                                setShowAppealDialog(true);
                                                                            }, children: "Submit Appeal" })) : (_jsx(Button, { size: "sm", variant: "outline", children: "View Details" })) }) })] }, denial.id)))) })] }) })] })] }) }), _jsx(TabsContent, { value: "appeals", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Appeal Tracking" }), _jsx(CardDescription, { children: "Monitor the progress of submitted appeals" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredData
                                            .filter((denial) => denial.appealStatus === "in_progress" ||
                                            denial.appealStatus === "submitted" ||
                                            denial.appealStatus === "approved" ||
                                            denial.appealStatus === "denied")
                                            .map((denial) => (_jsxs(Card, { className: `border-l-4 ${denial.appealStatus === "approved"
                                                ? "border-l-green-500"
                                                : denial.appealStatus === "denied"
                                                    ? "border-l-red-500"
                                                    : denial.appealStatus === "submitted"
                                                        ? "border-l-blue-500"
                                                        : "border-l-amber-500"}`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-base", children: [denial.claimId, " - ", denial.patientName] }), _jsxs(CardDescription, { children: ["Denial Reason: ", denial.denialReason] })] }), _jsxs("div", { className: "flex gap-2", children: [getStatusBadge(denial.appealStatus), getPriorityBadge(denial.priority)] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Denial Amount:" }), _jsx("p", { children: formatCurrency(denial.denialAmount) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Denial Date:" }), _jsx("p", { children: new Date(denial.denialDate).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Appeal Deadline:" }), _jsx("p", { children: denial.appealDeadline
                                                                                ? new Date(denial.appealDeadline).toLocaleDateString()
                                                                                : "N/A" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Assigned To:" }), _jsx("p", { children: denial.assignedTo || "Unassigned" })] })] }), denial.supportingDocuments.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("span", { className: "font-medium text-sm", children: "Supporting Documents:" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: denial.supportingDocuments.map((doc, index) => (_jsxs(Badge, { variant: "outline", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), doc] }, index))) })] }))] })] }, denial.id))) }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingDown, { className: "h-5 w-5 mr-2 text-primary" }), "Denial Trends"] }), _jsx(CardDescription, { children: "Analysis of denial patterns over time" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Monthly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Track denial rates and common reasons" })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2 text-primary" }), "Appeal Success Rate"] }), _jsx(CardDescription, { children: "Monitor appeal outcomes and success factors" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Weekly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Analyze successful appeal strategies" })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-2 text-primary" }), "Revenue Recovery"] }), _jsx(CardDescription, { children: "Track recovered revenue from successful appeals" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Quarterly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Measure financial impact of appeal process" })] })] })] }) })] }), _jsx(Dialog, { open: showAppealDialog, onOpenChange: setShowAppealDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Submit Appeal" }), _jsxs(DialogDescription, { children: ["Submit an appeal for claim ", selectedDenial?.claimId] })] }), selectedDenial && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Claim ID" }), _jsx(Input, { value: selectedDenial.claimId, readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Patient Name" }), _jsx(Input, { value: selectedDenial.patientName, readOnly: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Denial Amount" }), _jsx(Input, { value: formatCurrency(selectedDenial.denialAmount), readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Appeal Deadline" }), _jsx(Input, { value: selectedDenial.appealDeadline
                                                        ? new Date(selectedDenial.appealDeadline).toLocaleDateString()
                                                        : "", readOnly: true })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Denial Reason" }), _jsx(Input, { value: selectedDenial.denialReason, readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "appeal-reason", children: "Appeal Reason *" }), _jsx(Textarea, { id: "appeal-reason", placeholder: "Provide detailed reason for the appeal...", value: appealReason, onChange: (e) => setAppealReason(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "appeal-notes", children: "Additional Notes" }), _jsx(Textarea, { id: "appeal-notes", placeholder: "Add any additional information or context...", value: appealNotes, onChange: (e) => setAppealNotes(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Supporting Documents" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: selectedDenial.supportingDocuments.map((doc, index) => (_jsxs(Badge, { variant: "outline", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), doc] }, index))) }), _jsxs(Button, { variant: "outline", className: "mt-2", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Upload Additional Documents"] })] })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setShowAppealDialog(false);
                                        setSelectedDenial(null);
                                        setAppealReason("");
                                        setAppealNotes("");
                                    }, children: "Cancel" }), _jsx(Button, { onClick: () => selectedDenial && handleSubmitAppeal(selectedDenial), disabled: isLoading || !appealReason.trim(), children: isLoading ? "Submitting..." : "Submit Appeal" })] })] }) }), _jsx(Dialog, { open: showDenialDialog, onOpenChange: setShowDenialDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Record New Denial" }), _jsx(DialogDescription, { children: "Record a new claim denial in the system" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "claim-id", children: "Claim ID *" }), _jsx(Input, { id: "claim-id", placeholder: "Enter claim ID", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patient-name", children: "Patient Name *" }), _jsx(Input, { id: "patient-name", placeholder: "Enter patient name", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "denial-code", children: "Denial Code *" }), _jsx(Input, { id: "denial-code", placeholder: "Enter denial code", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "denial-amount", children: "Denial Amount *" }), _jsx(Input, { id: "denial-amount", type: "number", placeholder: "Enter amount", required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "denial-reason", children: "Denial Reason *" }), _jsx(Textarea, { id: "denial-reason", placeholder: "Enter detailed denial reason...", required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "priority", children: "Priority" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select priority" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "assigned-to", children: "Assigned To" }), _jsx(Input, { id: "assigned-to", placeholder: "Enter assignee name" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowDenialDialog(false), children: "Cancel" }), _jsx(Button, { onClick: () => handleRecordDenial({}), disabled: isLoading, children: isLoading ? "Recording..." : "Record Denial" })] })] }) })] }));
};
export default DenialManagementDashboard;
