import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, RefreshCw, ArrowRight, Workflow, BarChart3, PieChart, Activity, } from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const RevenueWorkflowIntegration = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const { isLoading, error, getKPIDashboard, generateCashFlowProjection, getPayerPerformanceAnalytics, } = useRevenueManagement();
    const [activeTab, setActiveTab] = useState("workflows");
    const [workflows, setWorkflows] = useState([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    // Mock workflow data
    const mockWorkflows = [
        {
            id: "wf-001",
            claimId: "CL-2024-0001",
            patientName: "Mohammed Al Mansoori",
            workflowType: "claim_submission",
            currentStep: "clinical_review",
            progress: 65,
            status: "active",
            steps: [
                {
                    id: "step-1",
                    name: "Document Collection",
                    status: "completed",
                    duration: 120,
                    completedAt: "2024-02-20T09:00:00Z",
                    assignedTo: "Sarah Ahmed",
                },
                {
                    id: "step-2",
                    name: "Clinical Review",
                    status: "in_progress",
                    assignedTo: "Dr. Ahmed Hassan",
                },
                {
                    id: "step-3",
                    name: "Coding & Billing",
                    status: "pending",
                },
                {
                    id: "step-4",
                    name: "Submission",
                    status: "pending",
                },
            ],
            startedAt: "2024-02-20T08:30:00Z",
            totalAmount: 7500.0,
            priority: "high",
        },
        {
            id: "wf-002",
            claimId: "CL-2024-0002",
            patientName: "Fatima Al Zaabi",
            workflowType: "payment_processing",
            currentStep: "payment_reconciliation",
            progress: 80,
            status: "active",
            steps: [
                {
                    id: "step-1",
                    name: "Payment Received",
                    status: "completed",
                    duration: 60,
                    completedAt: "2024-02-19T14:00:00Z",
                },
                {
                    id: "step-2",
                    name: "Payment Reconciliation",
                    status: "in_progress",
                    assignedTo: "Finance Team",
                },
                {
                    id: "step-3",
                    name: "Account Update",
                    status: "pending",
                },
            ],
            startedAt: "2024-02-19T13:45:00Z",
            totalAmount: 3600.0,
            priority: "medium",
        },
        {
            id: "wf-003",
            claimId: "CL-2024-0003",
            patientName: "Ahmed Al Shamsi",
            workflowType: "denial_management",
            currentStep: "appeal_preparation",
            progress: 40,
            status: "active",
            steps: [
                {
                    id: "step-1",
                    name: "Denial Analysis",
                    status: "completed",
                    duration: 180,
                    completedAt: "2024-02-18T11:00:00Z",
                    assignedTo: "Dr. Mariam Ali",
                },
                {
                    id: "step-2",
                    name: "Appeal Preparation",
                    status: "in_progress",
                    assignedTo: "Legal Team",
                },
                {
                    id: "step-3",
                    name: "Appeal Submission",
                    status: "pending",
                },
                {
                    id: "step-4",
                    name: "Appeal Tracking",
                    status: "pending",
                },
            ],
            startedAt: "2024-02-18T10:30:00Z",
            totalAmount: 4200.0,
            priority: "urgent",
        },
    ];
    useEffect(() => {
        loadWorkflows();
    }, []);
    const loadWorkflows = async () => {
        try {
            if (isOnline && !isOffline) {
                // In a real implementation, this would fetch from API
                setWorkflows(mockWorkflows);
            }
            else {
                setWorkflows(mockWorkflows);
            }
        }
        catch (error) {
            console.error("Error loading workflows:", error);
            setWorkflows(mockWorkflows);
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            active: "default",
            completed: "secondary",
            failed: "destructive",
            paused: "outline",
        };
        const icons = {
            active: _jsx(Activity, { className: "w-3 h-3" }),
            completed: _jsx(CheckCircle, { className: "w-3 h-3" }),
            failed: _jsx(AlertCircle, { className: "w-3 h-3" }),
            paused: _jsx(Clock, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status.charAt(0).toUpperCase() + status.slice(1)] }));
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
    const getStepStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case "in_progress":
                return _jsx(Clock, { className: "w-4 h-4 text-blue-600" });
            case "failed":
                return _jsx(AlertCircle, { className: "w-4 h-4 text-red-600" });
            default:
                return (_jsx("div", { className: "w-4 h-4 rounded-full border-2 border-gray-300" }));
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
        }).format(amount);
    };
    const filteredWorkflows = workflows.filter((workflow) => {
        const matchesStatus = filterStatus === "all" || workflow.status === filterStatus;
        const matchesType = filterType === "all" || workflow.workflowType === filterType;
        return matchesStatus && matchesType;
    });
    const calculateSummaryStats = () => {
        const totalWorkflows = workflows.length;
        const activeWorkflows = workflows.filter((w) => w.status === "active").length;
        const completedWorkflows = workflows.filter((w) => w.status === "completed").length;
        const failedWorkflows = workflows.filter((w) => w.status === "failed").length;
        const totalAmount = workflows.reduce((sum, w) => sum + w.totalAmount, 0);
        const averageProgress = workflows.reduce((sum, w) => sum + w.progress, 0) / totalWorkflows;
        return {
            totalWorkflows,
            activeWorkflows,
            completedWorkflows,
            failedWorkflows,
            totalAmount,
            averageProgress,
            completionRate: totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0,
        };
    };
    const stats = calculateSummaryStats();
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Revenue Workflow Integration" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Monitor and manage revenue cycle workflows across all processes" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Button, { onClick: loadWorkflows, disabled: isLoading, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Workflow, { className: "h-4 w-4 mr-2" }), "Total Workflows"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalWorkflows }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.activeWorkflows, " active, ", stats.completedWorkflows, " ", "completed"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Total Value"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: formatCurrency(stats.totalAmount) }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Across all active workflows" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Average Progress"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [stats.averageProgress.toFixed(1), "%"] }), _jsx(Progress, { value: stats.averageProgress, className: "mt-2" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Completion Rate"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [stats.completionRate.toFixed(1), "%"] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [stats.failedWorkflows, " failed workflows"] })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "workflows", children: [_jsx(Workflow, { className: "h-4 w-4 mr-2" }), "Active Workflows"] }), _jsxs(TabsTrigger, { value: "analytics", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Analytics"] }), _jsxs(TabsTrigger, { value: "optimization", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Optimization"] })] }), _jsx(TabsContent, { value: "workflows", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Workflow Management" }), _jsx(CardDescription, { children: "Monitor and manage all revenue cycle workflows" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "failed", children: "Failed" }), _jsx(SelectItem, { value: "paused", children: "Paused" })] })] }), _jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "claim_submission", children: "Claim Submission" }), _jsx(SelectItem, { value: "payment_processing", children: "Payment Processing" }), _jsx(SelectItem, { value: "denial_management", children: "Denial Management" })] })] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredWorkflows.map((workflow) => (_jsxs(Card, { className: "border-l-4 border-l-primary", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-base", children: [workflow.claimId, " - ", workflow.patientName] }), _jsx(CardDescription, { children: workflow.workflowType
                                                                            .replace("_", " ")
                                                                            .replace(/\b\w/g, (l) => l.toUpperCase()) })] }), _jsxs("div", { className: "flex gap-2", children: [getStatusBadge(workflow.status), getPriorityBadge(workflow.priority)] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Current Step:" }), _jsx("p", { children: workflow.currentStep
                                                                                    .replace("_", " ")
                                                                                    .replace(/\b\w/g, (l) => l.toUpperCase()) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Progress:" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Progress, { value: workflow.progress, className: "flex-1" }), _jsxs("span", { className: "text-xs", children: [workflow.progress, "%"] })] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Amount:" }), _jsx("p", { children: formatCurrency(workflow.totalAmount) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Started:" }), _jsx("p", { children: new Date(workflow.startedAt).toLocaleDateString() })] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-sm mb-2 block", children: "Workflow Steps:" }), _jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-2", children: workflow.steps.map((step, index) => (_jsxs("div", { className: "flex items-center gap-2 min-w-fit", children: [_jsxs("div", { className: "flex flex-col items-center gap-1", children: [getStepStatusIcon(step.status), _jsx("span", { className: "text-xs text-center min-w-20", children: step.name }), step.assignedTo && (_jsx("span", { className: "text-xs text-muted-foreground", children: step.assignedTo }))] }), index < workflow.steps.length - 1 && (_jsx(ArrowRight, { className: "w-4 h-4 text-muted-foreground" }))] }, step.id))) })] }), _jsxs("div", { className: "flex justify-between items-center pt-2 border-t", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Last updated: ", new Date().toLocaleString()] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "View Details" }), _jsx(Button, { size: "sm", children: "Manage" })] })] })] }) })] }, workflow.id))) }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(PieChart, { className: "h-5 w-5 mr-2" }), "Workflow Distribution"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Claim Submission" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-20 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: "40%" } }) }), _jsx("span", { className: "text-sm", children: "40%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Payment Processing" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-20 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: { width: "35%" } }) }), _jsx("span", { className: "text-sm", children: "35%" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Denial Management" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-20 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-red-600 h-2 rounded-full", style: { width: "25%" } }) }), _jsx("span", { className: "text-sm", children: "25%" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2" }), "Performance Metrics"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Average Completion Time:" }), _jsx("span", { className: "font-medium", children: "3.2 days" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Success Rate:" }), _jsx("span", { className: "font-medium text-green-600", children: "94.5%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Bottleneck Rate:" }), _jsx("span", { className: "font-medium text-amber-600", children: "12.3%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "SLA Compliance:" }), _jsx("span", { className: "font-medium text-green-600", children: "98.1%" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "optimization", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2 text-primary" }), "Process Optimization"] }), _jsx(CardDescription, { children: "Identify and optimize workflow bottlenecks" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Real-time" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "AI-powered analysis of workflow efficiency" })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Activity, { className: "h-5 w-5 mr-2 text-primary" }), "Resource Allocation"] }), _jsx(CardDescription, { children: "Optimize staff and resource allocation" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Daily" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Balance workload across team members" })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(BarChart3, { className: "h-5 w-5 mr-2 text-primary" }), "Performance Analytics"] }), _jsx(CardDescription, { children: "Track KPIs and performance metrics" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Weekly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Comprehensive performance reporting" })] })] })] }) })] })] }));
};
export default RevenueWorkflowIntegration;
