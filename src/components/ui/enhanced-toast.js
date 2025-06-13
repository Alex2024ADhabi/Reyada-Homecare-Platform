import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X, Loader2, } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
const variantStyles = {
    default: "bg-background border-border text-foreground",
    destructive: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    "compliance-error": "bg-red-100 border-red-300 text-red-950 shadow-red-100",
    "compliance-warning": "bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100",
    "compliance-success": "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100",
    "doh-validation": "bg-blue-50 border-blue-300 text-blue-950 shadow-blue-100",
    "authorization-pending": "bg-purple-50 border-purple-300 text-purple-900 shadow-purple-100",
    "security-threat": "bg-red-100 border-red-400 text-red-950 shadow-red-200 ring-2 ring-red-300",
    "security-warning": "bg-orange-50 border-orange-300 text-orange-900 shadow-orange-100",
    "security-success": "bg-green-100 border-green-300 text-green-900 shadow-green-100",
    "vulnerability-critical": "bg-red-200 border-red-500 text-red-950 shadow-red-300 ring-2 ring-red-400 animate-pulse",
    "vulnerability-high": "bg-red-100 border-red-400 text-red-900 shadow-red-200",
    "intrusion-detected": "bg-red-200 border-red-600 text-red-950 shadow-red-300 ring-4 ring-red-500 animate-pulse",
    "malware-detected": "bg-red-150 border-red-500 text-red-950 shadow-red-250 ring-3 ring-red-400",
    "data-breach": "bg-red-200 border-red-700 text-red-950 shadow-red-400 ring-4 ring-red-600 animate-pulse",
    "penetration-test": "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-indigo-100",
};
const variantIcons = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
    "compliance-error": XCircle,
    "compliance-warning": AlertCircle,
    "compliance-success": CheckCircle,
    "doh-validation": Info,
    "authorization-pending": Loader2,
    "security-threat": AlertCircle,
    "security-warning": AlertCircle,
    "security-success": CheckCircle,
    "vulnerability-critical": XCircle,
    "vulnerability-high": AlertCircle,
    "intrusion-detected": XCircle,
    "malware-detected": XCircle,
    "data-breach": XCircle,
    "penetration-test": Info,
    "mobile-app-ready": CheckCircle,
    "workflow-automation": CheckCircle,
    "clinical-workflow": CheckCircle,
};
const iconColors = {
    default: "text-gray-500",
    destructive: "text-red-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    "compliance-error": "text-red-600",
    "compliance-warning": "text-amber-600",
    "compliance-success": "text-emerald-600",
    "doh-validation": "text-blue-600",
    "authorization-pending": "text-purple-600",
    "security-threat": "text-red-700",
    "security-warning": "text-orange-600",
    "security-success": "text-green-600",
    "vulnerability-critical": "text-red-800",
    "vulnerability-high": "text-red-700",
    "intrusion-detected": "text-red-800",
    "malware-detected": "text-red-700",
    "data-breach": "text-red-900",
    "penetration-test": "text-indigo-600",
    "mobile-app-ready": "text-blue-600",
    "workflow-automation": "text-purple-600",
    "clinical-workflow": "text-green-600",
};
const progressBarColors = {
    default: "bg-gray-500",
    destructive: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    "compliance-error": "bg-red-600",
    "compliance-warning": "bg-amber-500",
    "compliance-success": "bg-emerald-500",
    "doh-validation": "bg-blue-500",
    "authorization-pending": "bg-purple-500",
    "security-threat": "bg-red-700",
    "security-warning": "bg-orange-500",
    "security-success": "bg-green-500",
    "vulnerability-critical": "bg-red-800",
    "vulnerability-high": "bg-red-600",
    "intrusion-detected": "bg-red-800",
    "malware-detected": "bg-red-700",
    "data-breach": "bg-red-900",
    "penetration-test": "bg-indigo-500",
    "mobile-app-ready": "bg-blue-500",
    "workflow-automation": "bg-purple-500",
    "clinical-workflow": "bg-green-500",
};
export const EnhancedToast = ({ id, title, description, variant = "default", duration = 5000, onDismiss, className, action, persistent = false, loading = false, progress, complianceLevel, dohRequirement, remediation, validationId, accessibilityLabel, }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [progressState, setProgressState] = useState(100);
    const Icon = loading || variant === "authorization-pending"
        ? Loader2
        : variantIcons[variant];
    const isComplianceVariant = variant.startsWith("compliance-") ||
        variant === "doh-validation" ||
        variant === "authorization-pending";
    const shouldShowProgress = progress !== undefined || loading;
    const complianceLevelColor = {
        critical: "border-l-4 border-l-red-600",
        high: "border-l-4 border-l-orange-500",
        medium: "border-l-4 border-l-yellow-500",
        low: "border-l-4 border-l-blue-500",
    };
    // Quality control: Validate props
    React.useEffect(() => {
        if (!title || title.trim() === "") {
            console.warn("EnhancedToast: title prop is required and cannot be empty");
        }
        if (!id || id.trim() === "") {
            console.warn("EnhancedToast: id prop is required and cannot be empty");
        }
        if (typeof onDismiss !== "function") {
            console.warn("EnhancedToast: onDismiss prop must be a function");
        }
    }, [title, id, onDismiss]);
    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (persistent || loading)
            return;
        // Progress bar animation
        const progressTimer = setInterval(() => {
            setProgressState((prev) => {
                const newProgress = prev - 100 / (duration / 100);
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 100);
        // Auto dismiss
        const dismissTimer = setTimeout(() => {
            handleDismiss();
        }, duration);
        return () => {
            clearInterval(progressTimer);
            clearTimeout(dismissTimer);
        };
    }, [duration, persistent, loading]);
    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(id);
        }, 300);
    };
    return (_jsxs("div", { className: cn("relative overflow-hidden flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md transition-all duration-300 ease-in-out", variantStyles[variant], isVisible && !isExiting
            ? "translate-x-0 opacity-100 animate-in slide-in-from-right-full"
            : "translate-x-full opacity-0", isExiting && "translate-x-full opacity-0", complianceLevel && complianceLevelColor[complianceLevel], isComplianceVariant && "ring-2 ring-offset-2", className), role: "alert", "aria-live": isComplianceVariant ? "assertive" : "polite", "aria-label": accessibilityLabel || `${variant} notification: ${title}`, "data-compliance-level": complianceLevel, "data-validation-id": validationId, children: [shouldShowProgress && (_jsx("div", { className: "absolute bottom-0 left-0 h-1 bg-gray-200 w-full", children: _jsx("div", { className: cn("h-full transition-all duration-100 ease-linear", progressBarColors[variant], loading && "animate-pulse"), style: {
                        width: progress !== undefined
                            ? `${progress}%`
                            : loading
                                ? "100%"
                                : `${progressState}%`,
                    }, role: "progressbar", "aria-valuenow": progress !== undefined ? progress : progressState, "aria-valuemin": 0, "aria-valuemax": 100 }) })), complianceLevel && (_jsxs("div", { className: "absolute top-2 right-12 flex items-center gap-1", children: [_jsx("div", { className: cn("w-2 h-2 rounded-full", complianceLevel === "critical" && "bg-red-600 animate-pulse", complianceLevel === "high" && "bg-orange-500", complianceLevel === "medium" && "bg-yellow-500", complianceLevel === "low" && "bg-blue-500") }), _jsx("span", { className: "text-xs font-medium uppercase tracking-wide opacity-75", children: complianceLevel })] })), _jsx(Icon, { className: cn("h-5 w-5 mt-0.5 flex-shrink-0", loading ? "animate-spin text-blue-600" : iconColors[variant]) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "font-medium text-sm flex items-center gap-2", children: [title, dohRequirement && (_jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800", children: ["DOH ", dohRequirement] }))] }), description && (_jsx("div", { className: "text-sm opacity-90 mt-1", children: description })), remediation && (_jsxs("div", { className: "mt-2 p-2 bg-black/5 rounded text-xs", children: [_jsx("div", { className: "font-medium mb-1", children: "Required Actions:" }), _jsx("ul", { className: "list-disc list-inside space-y-0.5", children: remediation.steps.map((step, index) => (_jsx("li", { children: step }, index))) })] })), _jsxs("div", { className: "flex gap-2 mt-3", children: [remediation && (_jsx(Button, { variant: "outline", size: "sm", onClick: remediation.onAction, className: "text-xs bg-white hover:bg-gray-50", children: remediation.actionLabel })), action && (_jsx(Button, { variant: "outline", size: "sm", onClick: action.onClick, className: "text-xs", children: action.label }))] })] }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 hover:bg-black/10", onClick: handleDismiss, "aria-label": "Dismiss notification", children: _jsx(X, { className: "h-4 w-4" }) })] }));
};
export default EnhancedToast;
