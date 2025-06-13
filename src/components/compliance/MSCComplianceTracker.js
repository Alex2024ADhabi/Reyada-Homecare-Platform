import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertTriangle, CheckCircle, XCircle, FileText, Activity, TrendingUp, Bell, RefreshCw, } from "lucide-react";
import { cn } from "@/lib/utils";
const MSCComplianceTracker = ({ className = "", }) => {
    const [mscPlans, setMscPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        loadMSCPlans();
    }, []);
    const loadMSCPlans = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockPlans = [
                {
                    id: "msc-001",
                    patientId: "pat-001",
                    patientName: "Ahmed Al Mansouri",
                    planType: "MSC",
                    startDate: "2024-01-15",
                    endDate: "2024-04-15",
                    initialVisitDate: "2024-01-18",
                    atcNumber: "ATC-2024-001",
                    atcValidityPeriod: "90 days",
                    status: "active",
                    extensionCount: 0,
                    maxExtensions: 2,
                    complianceScore: 92,
                    lastReviewDate: "2024-03-01",
                    nextReviewDate: "2024-04-01",
                    treatmentPeriodDays: 90,
                    remainingDays: 25,
                    documents: {
                        initialAssessment: true,
                        treatmentPlan: true,
                        progressNotes: true,
                        faceToFaceAssessment: true,
                    },
                    alerts: [],
                },
                {
                    id: "msc-002",
                    patientId: "pat-002",
                    patientName: "Fatima Al Zahra",
                    planType: "Extended_MSC",
                    startDate: "2023-12-01",
                    endDate: "2024-05-14",
                    initialVisitDate: "2023-12-05",
                    atcNumber: "ATC-2023-045",
                    atcValidityPeriod: "Extended to May 14, 2025",
                    status: "extended",
                    extensionCount: 1,
                    maxExtensions: 2,
                    complianceScore: 87,
                    lastReviewDate: "2024-02-15",
                    nextReviewDate: "2024-04-15",
                    treatmentPeriodDays: 165,
                    remainingDays: 45,
                    documents: {
                        initialAssessment: true,
                        treatmentPlan: true,
                        progressNotes: false,
                        faceToFaceAssessment: true,
                    },
                    alerts: ["Progress notes overdue", "Review date approaching"],
                },
                {
                    id: "msc-003",
                    patientId: "pat-003",
                    patientName: "Mohammed Hassan",
                    planType: "MSC",
                    startDate: "2024-02-01",
                    endDate: "2024-05-01",
                    atcNumber: "ATC-2024-012",
                    atcValidityPeriod: "90 days",
                    status: "pending_renewal",
                    extensionCount: 0,
                    maxExtensions: 2,
                    complianceScore: 65,
                    lastReviewDate: "2024-03-15",
                    nextReviewDate: "2024-04-20",
                    treatmentPeriodDays: 89,
                    remainingDays: 5,
                    documents: {
                        initialAssessment: true,
                        treatmentPlan: false,
                        progressNotes: false,
                        faceToFaceAssessment: false,
                    },
                    alerts: [
                        "Initial visit not recorded",
                        "Treatment plan missing",
                        "Face-to-face assessment required",
                    ],
                },
            ];
            setMscPlans(mockPlans);
        }
        catch (error) {
            console.error("Error loading MSC plans:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const refreshData = async () => {
        setRefreshing(true);
        await loadMSCPlans();
        setRefreshing(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "extended":
                return "bg-blue-100 text-blue-800";
            case "pending_renewal":
                return "bg-yellow-100 text-yellow-800";
            case "expired":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getComplianceColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 75)
            return "text-yellow-600";
        return "text-red-600";
    };
    const calculateDaysUntilExpiry = (endDate) => {
        const today = new Date();
        const expiry = new Date(endDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    const validate90DayRule = (plan) => {
        const violations = [];
        if (plan.treatmentPeriodDays > 90) {
            violations.push("Treatment period exceeds 90-day limit");
        }
        if (!plan.initialVisitDate) {
            violations.push("Initial visit date not recorded");
        }
        if (!plan.documents.faceToFaceAssessment) {
            violations.push("Face-to-face assessment missing");
        }
        return violations;
    };
    const criticalPlans = mscPlans.filter((plan) => plan.remainingDays <= 7 || plan.complianceScore < 70);
    const extensionEligible = mscPlans.filter((plan) => plan.extensionCount < plan.maxExtensions && plan.remainingDays <= 30);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading MSC compliance data..." })] }) }));
    }
    return (_jsxs("div", { className: cn("space-y-6 bg-gray-50 min-h-screen p-6", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Activity, { className: "h-6 w-6 mr-3 text-blue-600" }), "MSC Compliance Tracker"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Monitor MSC plan extensions, 90-day rule compliance, and ATC validity" })] }), _jsxs(Button, { onClick: refreshData, disabled: refreshing, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(RefreshCw, { className: cn("h-4 w-4 mr-2", refreshing && "animate-spin") }), "Refresh"] })] }), criticalPlans.length > 0 && (_jsxs(Alert, { variant: "compliance-critical", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Critical MSC Plans Require Attention" }), _jsxs(AlertDescription, { children: [criticalPlans.length, " MSC plan(s) have critical compliance issues or are expiring soon."] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total MSC Plans" }), _jsx("p", { className: "text-2xl font-bold", children: mscPlans.length })] }), _jsx(FileText, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Extension Eligible" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: extensionEligible.length })] }), _jsx(Clock, { className: "h-8 w-8 text-orange-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Critical Issues" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: criticalPlans.length })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Avg Compliance" }), _jsxs("p", { className: cn("text-2xl font-bold", getComplianceColor(Math.round(mscPlans.reduce((sum, plan) => sum + plan.complianceScore, 0) /
                                                    mscPlans.length))), children: [Math.round(mscPlans.reduce((sum, plan) => sum + plan.complianceScore, 0) /
                                                        mscPlans.length), "%"] })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-green-500" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "plans", children: "MSC Plans" }), _jsx(TabsTrigger, { value: "extensions", children: "Extensions" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" })] }), _jsx(TabsContent, { value: "overview", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Plan Status Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                    { status: "active", count: mscPlans.filter(p => p.status === "active").length },
                                                    { status: "extended", count: mscPlans.filter(p => p.status === "extended").length },
                                                    { status: "pending_renewal", count: mscPlans.filter(p => p.status === "pending_renewal").length },
                                                    { status: "expired", count: mscPlans.filter(p => p.status === "expired").length },
                                                ].map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium capitalize", children: item.status.replace("_", " ") }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: (item.count / mscPlans.length) * 100, className: "w-20 h-2" }), _jsx("span", { className: "text-sm text-gray-600", children: item.count })] })] }, item.status))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Upcoming Renewals" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: mscPlans
                                                    .filter((plan) => plan.remainingDays <= 30)
                                                    .sort((a, b) => a.remainingDays - b.remainingDays)
                                                    .slice(0, 5)
                                                    .map((plan) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: plan.patientName }), _jsx("p", { className: "text-sm text-gray-600", children: plan.atcNumber })] }), _jsxs(Badge, { className: cn(plan.remainingDays <= 7
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-yellow-100 text-yellow-800"), children: [plan.remainingDays, " days"] })] }, plan.id))) }) })] })] }) }), _jsx(TabsContent, { value: "plans", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "MSC Plans Management" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: mscPlans.map((plan) => (_jsx(Card, { className: cn("cursor-pointer transition-all hover:shadow-md", plan.alerts.length > 0 && "border-l-4 border-l-red-500"), onClick: () => setSelectedPlan(plan), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: plan.patientName }), _jsx(Badge, { className: getStatusColor(plan.status), children: plan.status.replace("_", " ") }), _jsx(Badge, { variant: "outline", children: plan.planType })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "ATC Number:" }), _jsx("p", { className: "font-medium", children: plan.atcNumber })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Remaining Days:" }), _jsx("p", { className: cn("font-medium", plan.remainingDays <= 7
                                                                                        ? "text-red-600"
                                                                                        : plan.remainingDays <= 30
                                                                                            ? "text-yellow-600"
                                                                                            : "text-green-600"), children: plan.remainingDays })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Compliance Score:" }), _jsxs("p", { className: cn("font-medium", getComplianceColor(plan.complianceScore)), children: [plan.complianceScore, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Extensions:" }), _jsxs("p", { className: "font-medium", children: [plan.extensionCount, "/", plan.maxExtensions] })] })] }), plan.alerts.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center space-x-1 mb-1", children: [_jsx(Bell, { className: "h-4 w-4 text-red-500" }), _jsxs("span", { className: "text-sm font-medium text-red-600", children: ["Alerts (", plan.alerts.length, ")"] })] }), _jsx("ul", { className: "text-sm text-red-600 space-y-1", children: plan.alerts.map((alert, index) => (_jsxs("li", { children: ["\u2022 ", alert] }, index))) })] }))] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [_jsx(Progress, { value: plan.complianceScore, className: "w-20 h-2" }), _jsx(Button, { size: "sm", variant: "outline", children: "View Details" })] })] }) }) }, plan.id))) }) })] }) }), _jsx(TabsContent, { value: "extensions", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Extension Management" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { variant: "doh-requirement", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "MSC Extension Guidelines" }), _jsx(AlertDescription, { children: "MSC plans can be extended until May 14, 2025. Maximum 2 extensions per plan. Each extension requires updated ATC validity revision." })] }), extensionEligible.map((plan) => (_jsx(Card, { className: "border-l-4 border-l-orange-500", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: plan.patientName }), _jsxs("p", { className: "text-sm text-gray-600", children: ["ATC: ", plan.atcNumber, " | Expires in ", plan.remainingDays, " }, "days"] }), _jsxs("p", { className: "text-sm text-orange-600", children: ["Extensions used: ", plan.extensionCount, "/", plan.maxExtensions] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", className: "bg-orange-600 hover:bg-orange-700", children: "Request Extension" }), _jsx(Button, { size: "sm", variant: "outline", children: "View Plan" })] })] }) }) }, plan.id))), extensionEligible.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-4 text-green-500" }), _jsx("p", { children: "No plans currently eligible for extension" })] }))] }) })] }) }), _jsx(TabsContent, { value: "compliance", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "90-Day Rule Compliance" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: mscPlans.map((plan) => {
                                            const violations = validate90DayRule(plan);
                                            return (_jsx(Card, { className: cn(violations.length > 0 && "border-l-4 border-l-red-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: plan.patientName }), violations.length === 0 ? (_jsxs(Badge, { className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Compliant"] })) : (_jsxs(Badge, { className: "bg-red-100 text-red-800", children: [_jsx(XCircle, { className: "h-3 w-3 mr-1" }), "Non-Compliant"] }))] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Treatment Period:" }), _jsxs("p", { className: cn("font-medium", plan.treatmentPeriodDays > 90
                                                                                            ? "text-red-600"
                                                                                            : "text-green-600"), children: [plan.treatmentPeriodDays, " days"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Initial Visit:" }), _jsx("p", { className: cn("font-medium", plan.initialVisitDate
                                                                                            ? "text-green-600"
                                                                                            : "text-red-600"), children: plan.initialVisitDate || "Not recorded" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "ATC Validity:" }), _jsx("p", { className: "font-medium", children: plan.atcValidityPeriod })] })] }), violations.length > 0 && (_jsxs("div", { className: "bg-red-50 p-3 rounded", children: [_jsx("h4", { className: "font-medium text-red-800 mb-2", children: "Compliance Violations:" }), _jsx("ul", { className: "text-sm text-red-700 space-y-1", children: violations.map((violation, index) => (_jsxs("li", { children: ["\u2022 ", violation] }, index))) })] }))] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Compliance Score" }), _jsxs("p", { className: cn("text-lg font-bold", getComplianceColor(plan.complianceScore)), children: [plan.complianceScore, "%"] })] }), _jsx(Button, { size: "sm", variant: "outline", children: "Fix Issues" })] })] }) }) }, plan.id));
                                        }) }) })] }) })] })] }));
};
export default MSCComplianceTracker;
