import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { EnhancedToast } from "./enhanced-toast";
import { Progress } from "./progress";
import { CheckCircle, AlertTriangle, Clock, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
export const ComplianceDashboard = ({ items, overallScore, onRefresh, onItemAction, }) => {
    const [toasts, setToasts] = React.useState([]);
    const [selectedItem, setSelectedItem] = React.useState(null);
    const getStatusIcon = (status) => {
        switch (status) {
            case "compliant":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-emerald-600" });
            case "non-compliant":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-600" });
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-blue-600" });
            case "warning":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" });
            default:
                return _jsx(Info, { className: "h-4 w-4 text-gray-600" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "compliant":
                return "text-emerald-600";
            case "non-compliant":
                return "text-red-600";
            case "pending":
                return "text-blue-600";
            case "warning":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };
    const criticalItems = items.filter((item) => item.level === "critical");
    const nonCompliantItems = items.filter((item) => item.status === "non-compliant");
    const pendingItems = items.filter((item) => item.status === "pending");
    const addToast = (toast) => {
        setToasts((prev) => [...prev, { ...toast, id: Date.now().toString() }]);
    };
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    const handleItemClick = (item) => {
        setSelectedItem(item);
        if (item.status === "non-compliant" && item.level === "critical") {
            addToast({
                title: "Critical Compliance Issue",
                description: `${item.title} requires immediate attention`,
                variant: "compliance-error",
                complianceLevel: "critical",
                dohRequirement: item.dohRequirement,
                remediation: item.remediation,
                persistent: true,
            });
        }
    };
    return (_jsxs("div", { className: "space-y-6 bg-gray-50 min-h-screen p-6", children: [_jsx("div", { className: "fixed top-4 right-4 z-50 space-y-2", children: toasts.map((toast) => (_jsx(EnhancedToast, { ...toast, onDismiss: removeToast }, toast.id))) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "DOH 2025 Compliance Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Monitor and manage DOH Claims and Adjudication Rules compliance" })] }), _jsx(Button, { onClick: onRefresh, complianceAction: "validate", className: "bg-blue-600 hover:bg-blue-700", children: "Refresh Compliance Status" })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: ["Overall Compliance Score", _jsxs(Badge, { complianceLevel: overallScore >= 90
                                        ? "passed"
                                        : overallScore >= 70
                                            ? "medium"
                                            : "critical", statusIcon: true, children: [overallScore, "%"] })] }) }), _jsxs(CardContent, { children: [_jsx(Progress, { value: overallScore, className: "h-3" }), _jsxs("div", { className: "flex justify-between text-sm text-gray-600 mt-2", children: [_jsx("span", { children: "0%" }), _jsx("span", { children: "Target: 95%" }), _jsx("span", { children: "100%" })] })] })] }), criticalItems.length > 0 && (_jsxs(Alert, { variant: "compliance-critical", className: "bg-white", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Critical Compliance Issues Detected" }), _jsxs(AlertDescription, { children: [criticalItems.length, " critical issue", criticalItems.length > 1 ? "s" : "", " require immediate attention to maintain DOH compliance."] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { className: "bg-white", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Items" }), _jsx("p", { className: "text-2xl font-bold", children: items.length })] }), _jsx(Info, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { className: "bg-white", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Non-Compliant" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: nonCompliantItems.length })] }), _jsx(XCircle, { className: "h-8 w-8 text-red-500" })] }) }) }), _jsx(Card, { className: "bg-white", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending Review" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: pendingItems.length })] }), _jsx(Clock, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { className: "bg-white", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Critical Issues" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: criticalItems.length })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-500" })] }) }) })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Items" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: items.map((item) => (_jsx(Card, { className: cn("cursor-pointer transition-all hover:shadow-md", item.level === "critical" && "border-l-4 border-l-red-600", item.level === "high" && "border-l-4 border-l-orange-500", item.level === "medium" && "border-l-4 border-l-yellow-500", item.level === "low" && "border-l-4 border-l-blue-500"), onClick: () => handleItemClick(item), complianceLevel: item.level, actionRequired: item.status === "non-compliant", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getStatusIcon(item.status), _jsx("h3", { className: "font-semibold", children: item.title }), _jsx(Badge, { complianceLevel: item.level, statusIcon: true, children: item.level }), _jsx(Badge, { variant: item.status === "compliant"
                                                                    ? "compliance-passed"
                                                                    : "compliance-critical", children: item.status })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: item.description }), _jsxs("p", { className: "text-xs text-indigo-600 font-medium", children: ["DOH Requirement: ", item.dohRequirement] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Last checked: ", item.lastChecked.toLocaleString()] })] }), _jsxs("div", { className: "flex gap-2", children: [item.remediation && (_jsx(Button, { size: "sm", variant: "outline", complianceAction: "remediate", onClick: (e) => {
                                                            e.stopPropagation();
                                                            item.remediation?.onAction();
                                                        }, children: item.remediation.actionLabel })), _jsx(Button, { size: "sm", complianceAction: "review", onClick: (e) => {
                                                            e.stopPropagation();
                                                            onItemAction(item.id, "review");
                                                        }, children: "Review" })] })] }) }) }, item.id))) }) })] }), selectedItem && (_jsxs(Card, { className: "bg-white", expandable: true, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Compliance Details: ", selectedItem.title] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Status Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Status:" }), _jsx("span", { className: cn("text-sm font-medium", getStatusColor(selectedItem.status)), children: selectedItem.status })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Level:" }), _jsx(Badge, { complianceLevel: selectedItem.level, statusIcon: true, children: selectedItem.level })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "DOH Requirement:" }), _jsx("span", { className: "text-sm text-indigo-600 font-medium", children: selectedItem.dohRequirement })] })] })] }), selectedItem.remediation && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Remediation Steps" }), _jsx("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-600", children: selectedItem.remediation.steps.map((step, index) => (_jsx("li", { children: step }, index))) }), _jsx(Button, { className: "mt-3", complianceAction: "remediate", onClick: selectedItem.remediation.onAction, children: selectedItem.remediation.actionLabel })] }))] }) })] }))] }));
};
export default ComplianceDashboard;
