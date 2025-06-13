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
import { DollarSign, CheckCircle, AlertCircle, Clock, FileText, Upload, Download, RefreshCw, Search, TrendingUp, TrendingDown, } from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const PaymentReconciliationDashboard = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const { isLoading, error, getPaymentReconciliation, processPaymentReconciliation, } = useRevenueManagement();
    const [activeTab, setActiveTab] = useState("reconciliation");
    const [reconciliationData, setReconciliationData] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showReconcileDialog, setShowReconcileDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [reconciliationNotes, setReconciliationNotes] = useState("");
    // Mock data for demonstration
    const mockReconciliationData = [
        {
            id: "1",
            claimId: "CL-2024-0001",
            patientName: "Mohammed Al Mansoori",
            expectedAmount: 7500.0,
            receivedAmount: 7500.0,
            variance: 0,
            paymentDate: "2024-02-15",
            paymentMethod: "Electronic Transfer",
            referenceNumber: "PAY-2024-001",
            status: "matched",
            reconciliationDate: "2024-02-15",
        },
        {
            id: "2",
            claimId: "CL-2024-0002",
            patientName: "Fatima Al Zaabi",
            expectedAmount: 3600.0,
            receivedAmount: 3240.0,
            variance: -360.0,
            varianceReason: "Contractual adjustment",
            paymentDate: "2024-02-14",
            paymentMethod: "Check",
            referenceNumber: "CHK-2024-045",
            status: "variance",
            reconciliationDate: "2024-02-14",
        },
        {
            id: "3",
            claimId: "CL-2024-0003",
            patientName: "Ahmed Al Shamsi",
            expectedAmount: 4200.0,
            receivedAmount: 0,
            variance: -4200.0,
            paymentDate: "",
            paymentMethod: "",
            referenceNumber: "",
            status: "unmatched",
        },
        {
            id: "4",
            claimId: "CL-2024-0004",
            patientName: "Mariam Al Nuaimi",
            expectedAmount: 6750.0,
            receivedAmount: 6750.0,
            variance: 0,
            paymentDate: "2024-02-16",
            paymentMethod: "Electronic Transfer",
            referenceNumber: "PAY-2024-002",
            status: "pending",
        },
    ];
    useEffect(() => {
        loadReconciliationData();
    }, []);
    const loadReconciliationData = async () => {
        try {
            if (isOnline && !isOffline) {
                const data = await getPaymentReconciliation();
                setReconciliationData(data || mockReconciliationData);
            }
            else {
                setReconciliationData(mockReconciliationData);
            }
        }
        catch (error) {
            console.error("Error loading reconciliation data:", error);
            setReconciliationData(mockReconciliationData);
        }
    };
    const handleReconcile = async (record) => {
        try {
            const reconciliationData = {
                claimId: record.claimId,
                expectedAmount: record.expectedAmount,
                receivedAmount: record.receivedAmount,
                variance: record.variance,
                varianceReason: record.varianceReason,
                notes: reconciliationNotes,
                reconciliationDate: new Date().toISOString(),
                status: "reconciled",
            };
            if (isOnline && !isOffline) {
                await processPaymentReconciliation(reconciliationData);
            }
            // Update local state
            setReconciliationData((prev) => prev.map((item) => item.id === record.id
                ? {
                    ...item,
                    status: "matched",
                    reconciliationDate: new Date().toISOString(),
                    notes: reconciliationNotes,
                }
                : item));
            setShowReconcileDialog(false);
            setSelectedRecord(null);
            setReconciliationNotes("");
        }
        catch (error) {
            console.error("Error reconciling payment:", error);
        }
    };
    const filteredData = reconciliationData.filter((record) => {
        const matchesSearch = record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const getStatusBadge = (status) => {
        const variants = {
            matched: "default",
            variance: "secondary",
            unmatched: "destructive",
            pending: "outline",
        };
        const icons = {
            matched: _jsx(CheckCircle, { className: "w-3 h-3" }),
            variance: _jsx(AlertCircle, { className: "w-3 h-3" }),
            unmatched: _jsx(AlertCircle, { className: "w-3 h-3" }),
            pending: _jsx(Clock, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status.charAt(0).toUpperCase() + status.slice(1)] }));
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
        }).format(amount);
    };
    const calculateSummaryStats = () => {
        const totalExpected = reconciliationData.reduce((sum, record) => sum + record.expectedAmount, 0);
        const totalReceived = reconciliationData.reduce((sum, record) => sum + record.receivedAmount, 0);
        const totalVariance = reconciliationData.reduce((sum, record) => sum + record.variance, 0);
        const matchedCount = reconciliationData.filter((record) => record.status === "matched").length;
        const varianceCount = reconciliationData.filter((record) => record.status === "variance").length;
        const unmatchedCount = reconciliationData.filter((record) => record.status === "unmatched").length;
        const pendingCount = reconciliationData.filter((record) => record.status === "pending").length;
        return {
            totalExpected,
            totalReceived,
            totalVariance,
            matchedCount,
            varianceCount,
            unmatchedCount,
            pendingCount,
            reconciliationRate: reconciliationData.length > 0
                ? (matchedCount / reconciliationData.length) * 100
                : 0,
        };
    };
    const stats = calculateSummaryStats();
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Payment Reconciliation Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Reconcile payments with expected claim amounts and manage variances" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Button, { onClick: loadReconciliationData, disabled: isLoading, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Expected Amount"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(stats.totalExpected) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Total expected from claims" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Received Amount"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(stats.totalReceived) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Total payments received" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [stats.totalVariance >= 0 ? (_jsx(TrendingUp, { className: "h-4 w-4 mr-2" })) : (_jsx(TrendingDown, { className: "h-4 w-4 mr-2" })), "Total Variance"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: `text-2xl font-bold ${stats.totalVariance >= 0 ? "text-green-600" : "text-red-600"}`, children: formatCurrency(stats.totalVariance) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Difference from expected" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Reconciliation Rate"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [stats.reconciliationRate.toFixed(1), "%"] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.matchedCount, " of ", reconciliationData.length, " reconciled"] })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "reconciliation", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Reconciliation"] }), _jsxs(TabsTrigger, { value: "variances", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Variances"] }), _jsxs(TabsTrigger, { value: "reports", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Reports"] })] }), _jsx(TabsContent, { value: "reconciliation", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Payment Reconciliation" }), _jsx(CardDescription, { children: "Match received payments with expected claim amounts" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import Payments"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by patient, claim ID, or reference...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-full md:w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "matched", children: "Matched" }), _jsx(SelectItem, { value: "variance", children: "Variance" }), _jsx(SelectItem, { value: "unmatched", children: "Unmatched" }), _jsx(SelectItem, { value: "pending", children: "Pending" })] })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Claim ID" }), _jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Expected" }), _jsx(TableHead, { children: "Received" }), _jsx(TableHead, { children: "Variance" }), _jsx(TableHead, { children: "Payment Date" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto text-muted-foreground" }) }) })) : filteredData.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground", children: "No reconciliation records found" }) })) : (filteredData.map((record) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: record.claimId }), _jsx(TableCell, { children: record.patientName }), _jsx(TableCell, { children: formatCurrency(record.expectedAmount) }), _jsx(TableCell, { children: record.receivedAmount > 0
                                                                        ? formatCurrency(record.receivedAmount)
                                                                        : "—" }), _jsx(TableCell, { children: _jsx("span", { className: `font-medium ${record.variance > 0
                                                                            ? "text-green-600"
                                                                            : record.variance < 0
                                                                                ? "text-red-600"
                                                                                : "text-gray-600"}`, children: record.variance !== 0
                                                                            ? formatCurrency(record.variance)
                                                                            : "—" }) }), _jsx(TableCell, { children: record.paymentDate || "—" }), _jsx(TableCell, { children: getStatusBadge(record.status) }), _jsx(TableCell, { children: _jsx("div", { className: "flex gap-2", children: record.status === "pending" ||
                                                                            record.status === "variance" ? (_jsx(Button, { size: "sm", onClick: () => {
                                                                                setSelectedRecord(record);
                                                                                setShowReconcileDialog(true);
                                                                            }, children: "Reconcile" })) : (_jsx(Button, { size: "sm", variant: "outline", children: "View" })) }) })] }, record.id)))) })] }) })] })] }) }), _jsx(TabsContent, { value: "variances", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Variances" }), _jsx(CardDescription, { children: "Review and manage payment variances that require attention" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredData
                                            .filter((record) => record.status === "variance" || record.variance !== 0)
                                            .map((record) => (_jsxs(Card, { className: "border-l-4 border-l-amber-500", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-base", children: [record.claimId, " - ", record.patientName] }), _jsxs(CardDescription, { children: ["Payment Reference:", " ", record.referenceNumber || "N/A"] })] }), _jsx(Badge, { variant: "secondary", children: formatCurrency(record.variance) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Expected:" }), _jsx("p", { children: formatCurrency(record.expectedAmount) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Received:" }), _jsx("p", { children: formatCurrency(record.receivedAmount) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Payment Date:" }), _jsx("p", { children: record.paymentDate || "N/A" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Method:" }), _jsx("p", { children: record.paymentMethod || "N/A" })] })] }), record.varianceReason && (_jsx("div", { className: "mt-4 bg-amber-50 p-3 rounded-md", children: _jsxs("p", { className: "text-sm text-amber-800", children: [_jsx("strong", { children: "Variance Reason:" }), " ", record.varianceReason] }) }))] })] }, record.id))) }) })] }) }), _jsx(TabsContent, { value: "reports", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2 text-primary" }), "Reconciliation Summary"] }), _jsx(CardDescription, { children: "Daily reconciliation summary report" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Daily" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Summary of all reconciliation activities" })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 mr-2 text-primary" }), "Variance Analysis"] }), _jsx(CardDescription, { children: "Detailed analysis of payment variances" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Weekly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Trends and patterns in payment variances" })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2 text-primary" }), "Reconciliation Trends"] }), _jsx(CardDescription, { children: "Historical reconciliation performance" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Monthly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Track reconciliation efficiency over time" })] })] })] }) })] }), _jsx(Dialog, { open: showReconcileDialog, onOpenChange: setShowReconcileDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Reconcile Payment" }), _jsxs(DialogDescription, { children: ["Review and reconcile the payment for ", selectedRecord?.claimId] })] }), selectedRecord && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Expected Amount" }), _jsx(Input, { value: formatCurrency(selectedRecord.expectedAmount), readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Received Amount" }), _jsx(Input, { value: formatCurrency(selectedRecord.receivedAmount), readOnly: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Variance" }), _jsx(Input, { value: formatCurrency(selectedRecord.variance), readOnly: true, className: selectedRecord.variance !== 0 ? "text-red-600" : "" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Payment Date" }), _jsx(Input, { value: selectedRecord.paymentDate || "", readOnly: true })] })] }), selectedRecord.varianceReason && (_jsxs("div", { children: [_jsx(Label, { children: "Variance Reason" }), _jsx(Input, { value: selectedRecord.varianceReason, readOnly: true })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "reconciliation-notes", children: "Reconciliation Notes" }), _jsx(Textarea, { id: "reconciliation-notes", placeholder: "Add notes about this reconciliation...", value: reconciliationNotes, onChange: (e) => setReconciliationNotes(e.target.value) })] })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setShowReconcileDialog(false);
                                        setSelectedRecord(null);
                                        setReconciliationNotes("");
                                    }, children: "Cancel" }), _jsx(Button, { onClick: () => selectedRecord && handleReconcile(selectedRecord), disabled: isLoading, children: isLoading ? "Processing..." : "Reconcile" })] })] }) })] }));
};
export default PaymentReconciliationDashboard;
