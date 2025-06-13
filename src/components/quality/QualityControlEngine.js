import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Settings, RefreshCw, Shield, Zap, Activity, } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
import { performanceMonitor } from "@/services/performance-monitor.service";
import { cacheOptimization } from "@/services/cache-optimization.service";
const QUALITY_RULES = [
    {
        id: "qr-001",
        name: "Required Field Validation",
        description: "Ensures all mandatory fields are completed",
        category: "Data Validation",
        severity: "critical",
        enabled: true,
        autoApply: true,
        validationFunction: async (data) => {
            const issues = [];
            let score = 100;
            const requiredFields = [
                "patientId",
                "patientName",
                "emiratesId",
                "serviceType",
            ];
            requiredFields.forEach((field) => {
                if (!data[field] ||
                    (typeof data[field] === "string" && data[field].trim() === "")) {
                    issues.push({
                        id: `missing-${field}`,
                        severity: "critical",
                        message: `Required field '${field}' is missing or empty`,
                        field,
                        suggestion: `Please provide a value for ${field}`,
                        autoFixable: false,
                    });
                    score -= 25;
                }
            });
            return {
                passed: issues.length === 0,
                score: Math.max(0, score),
                issues,
            };
        },
    },
    {
        id: "qr-002",
        name: "Data Format Validation",
        description: "Validates data formats (Emirates ID, phone numbers, etc.)",
        category: "Data Validation",
        severity: "high",
        enabled: true,
        autoApply: true,
        validationFunction: async (data) => {
            const issues = [];
            let score = 100;
            // Emirates ID validation
            if (data.emiratesId) {
                const emiratesIdPattern = /^784-[0-9]{4}-[0-9]{7}-[0-9]$/;
                if (!emiratesIdPattern.test(data.emiratesId)) {
                    issues.push({
                        id: "invalid-emirates-id",
                        severity: "high",
                        message: "Invalid Emirates ID format",
                        field: "emiratesId",
                        suggestion: "Format should be 784-YYYY-NNNNNNN-N",
                        autoFixable: false,
                    });
                    score -= 30;
                }
            }
            // Phone number validation
            if (data.phoneNumber) {
                const phonePattern = /^(\+971|00971|971)?[0-9]{8,9}$/;
                if (!phonePattern.test(data.phoneNumber.replace(/[\s-]/g, ""))) {
                    issues.push({
                        id: "invalid-phone",
                        severity: "medium",
                        message: "Invalid UAE phone number format",
                        field: "phoneNumber",
                        suggestion: "Use format +971XXXXXXXXX or 05XXXXXXXX",
                        autoFixable: true,
                    });
                    score -= 20;
                }
            }
            return {
                passed: issues.filter((i) => i.severity === "critical" || i.severity === "high").length === 0,
                score: Math.max(0, score),
                issues,
            };
        },
        correctionFunction: async (data) => {
            const correctedData = { ...data };
            // Auto-correct phone number format
            if (data.phoneNumber && !/^\+971/.test(data.phoneNumber)) {
                correctedData.phoneNumber = `+971${data.phoneNumber.replace(/^0/, "")}`;
            }
            return correctedData;
        },
    },
    {
        id: "qr-003",
        name: "Business Logic Validation",
        description: "Validates business rules and constraints",
        category: "Business Rules",
        severity: "high",
        enabled: true,
        autoApply: false,
        validationFunction: async (data) => {
            const issues = [];
            let score = 100;
            // Age-appropriate service validation
            if (data.dateOfBirth && data.serviceType) {
                const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
                if (data.serviceType === "pediatric" && age >= 18) {
                    issues.push({
                        id: "age-service-mismatch",
                        severity: "high",
                        message: "Pediatric service selected for adult patient",
                        field: "serviceType",
                        suggestion: "Consider changing service type or verify patient age",
                        autoFixable: false,
                    });
                    score -= 30;
                }
            }
            // Duration constraint checking
            if (data.requestedDuration && data.mscPlanExtension) {
                if (data.requestedDuration > 90) {
                    issues.push({
                        id: "msc-duration-exceeded",
                        severity: "critical",
                        message: "MSC plan extensions cannot exceed 90 days",
                        field: "requestedDuration",
                        suggestion: "Reduce duration to 90 days or less",
                        autoFixable: true,
                    });
                    score -= 40;
                }
            }
            return {
                passed: issues.filter((i) => i.severity === "critical").length === 0,
                score: Math.max(0, score),
                issues,
            };
        },
        correctionFunction: async (data) => {
            const correctedData = { ...data };
            // Auto-correct MSC duration
            if (data.mscPlanExtension && data.requestedDuration > 90) {
                correctedData.requestedDuration = 90;
            }
            return correctedData;
        },
    },
    {
        id: "qr-004",
        name: "Data Completeness Check",
        description: "Ensures data completeness for optimal processing",
        category: "Data Quality",
        severity: "medium",
        enabled: true,
        autoApply: true,
        validationFunction: async (data) => {
            const issues = [];
            let score = 100;
            const recommendedFields = [
                "insuranceDetails",
                "clinicalJustification",
                "documents",
                "providerLicense",
            ];
            recommendedFields.forEach((field) => {
                if (!data[field] ||
                    (Array.isArray(data[field]) && data[field].length === 0)) {
                    issues.push({
                        id: `missing-recommended-${field}`,
                        severity: "medium",
                        message: `Recommended field '${field}' is missing`,
                        field,
                        suggestion: `Adding ${field} will improve processing efficiency`,
                        autoFixable: false,
                    });
                    score -= 10;
                }
            });
            return {
                passed: true, // Medium severity issues don't fail validation
                score: Math.max(0, score),
                issues,
            };
        },
    },
];
const QUALITY_METRICS = [
    {
        id: "data-completeness",
        name: "Data Completeness",
        category: "Data Quality",
        target: 95,
        current: 87,
        unit: "%",
        status: "warning",
        trend: "up",
    },
    {
        id: "validation-accuracy",
        name: "Validation Accuracy",
        category: "Processing",
        target: 99,
        current: 96,
        unit: "%",
        status: "good",
        trend: "stable",
    },
    {
        id: "compliance-score",
        name: "Compliance Score",
        category: "Regulatory",
        target: 100,
        current: 92,
        unit: "%",
        status: "warning",
        trend: "up",
    },
    {
        id: "error-rate",
        name: "Error Rate",
        category: "Quality",
        target: 1,
        current: 2.3,
        unit: "%",
        status: "warning",
        trend: "down",
    },
];
export default function QualityControlEngine({ data = {}, autoMode = false, onQualityCheck, className, }) {
    const { toast } = useToastContext();
    const { handleSuccess, handleApiError } = useErrorHandler();
    const [isRunning, setIsRunning] = useState(false);
    const [qualityResult, setQualityResult] = useState(null);
    const [metrics, setMetrics] = useState(QUALITY_METRICS);
    const [enabledRules, setEnabledRules] = useState(QUALITY_RULES.filter((rule) => rule.enabled).map((rule) => rule.id));
    const runQualityValidation = useCallback(async (inputData = data) => {
        setIsRunning(true);
        const startTime = performance.now();
        try {
            const results = [];
            const activeRules = QUALITY_RULES.filter((rule) => enabledRules.includes(rule.id));
            // Run validation rules in parallel
            const validationPromises = activeRules.map(async (rule) => {
                try {
                    const result = await performanceMonitor.measureApiCall(`quality-rule-${rule.id}`, () => rule.validationFunction(inputData));
                    return { rule, result };
                }
                catch (error) {
                    console.error(`Quality rule ${rule.id} failed:`, error);
                    return {
                        rule,
                        result: {
                            passed: false,
                            score: 0,
                            issues: [
                                {
                                    id: `rule-error-${rule.id}`,
                                    severity: "critical",
                                    message: `Quality rule execution failed: ${error}`,
                                    autoFixable: false,
                                },
                            ],
                        },
                    };
                }
            });
            const validationResults = await Promise.all(validationPromises);
            // Aggregate results
            const allIssues = [];
            let totalScore = 0;
            let ruleCount = 0;
            validationResults.forEach(({ rule, result }) => {
                allIssues.push(...result.issues);
                totalScore += result.score;
                ruleCount++;
            });
            const averageScore = ruleCount > 0 ? totalScore / ruleCount : 0;
            const criticalIssues = allIssues.filter((issue) => issue.severity === "critical");
            const overallPassed = criticalIssues.length === 0;
            // Apply auto-corrections if enabled
            let correctedData = inputData;
            if (autoMode) {
                for (const { rule, result } of validationResults) {
                    if (rule.autoApply && rule.correctionFunction && !result.passed) {
                        try {
                            correctedData = await rule.correctionFunction(correctedData);
                        }
                        catch (error) {
                            console.error(`Auto-correction failed for rule ${rule.id}:`, error);
                        }
                    }
                }
            }
            const finalResult = {
                passed: overallPassed,
                score: averageScore,
                issues: allIssues,
                correctedData: correctedData !== inputData ? correctedData : undefined,
                metadata: {
                    rulesExecuted: ruleCount,
                    executionTime: performance.now() - startTime,
                    autoCorrectionsApplied: correctedData !== inputData,
                },
            };
            setQualityResult(finalResult);
            // Cache the result
            const cacheKey = `quality-result-${JSON.stringify(inputData).substring(0, 50)}`;
            cacheOptimization.set(cacheKey, finalResult, 300000); // 5 minutes
            // Update metrics
            updateMetrics(finalResult);
            if (onQualityCheck) {
                onQualityCheck(finalResult);
            }
            // Show notification
            if (overallPassed) {
                handleSuccess("Quality Check Passed", `Score: ${averageScore.toFixed(1)}% - ${allIssues.length} issues found`);
            }
            else {
                toast({
                    title: "Quality Issues Detected",
                    description: `${criticalIssues.length} critical issues require attention`,
                    variant: "destructive",
                });
            }
        }
        catch (error) {
            console.error("Quality validation failed:", error);
            handleApiError(error, "Quality Control Engine");
        }
        finally {
            setIsRunning(false);
        }
    }, [
        data,
        enabledRules,
        autoMode,
        onQualityCheck,
        toast,
        handleSuccess,
        handleApiError,
    ]);
    const updateMetrics = (result) => {
        setMetrics((prevMetrics) => prevMetrics.map((metric) => {
            switch (metric.id) {
                case "data-completeness":
                    return {
                        ...metric,
                        current: result.score,
                        status: result.score >= 95
                            ? "excellent"
                            : result.score >= 85
                                ? "good"
                                : "warning",
                    };
                case "validation-accuracy":
                    return { ...metric, current: result.passed ? 100 : 0 };
                case "compliance-score":
                    return { ...metric, current: result.score };
                case "error-rate":
                    return { ...metric, current: result.issues.length };
                default:
                    return metric;
            }
        }));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "excellent":
                return "text-green-600 bg-green-100";
            case "good":
                return "text-blue-600 bg-blue-100";
            case "warning":
                return "text-yellow-600 bg-yellow-100";
            case "critical":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case "critical":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case "high":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500" });
            case "medium":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "low":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-blue-500" });
            default:
                return _jsx(CheckCircle, { className: "h-4 w-4 text-gray-500" });
        }
    };
    // Auto-run validation when data changes (if autoMode is enabled)
    useEffect(() => {
        if (autoMode && Object.keys(data).length > 0) {
            const timeoutId = setTimeout(() => {
                runQualityValidation(data);
            }, 500); // Debounce
            return () => clearTimeout(timeoutId);
        }
    }, [data, autoMode, runQualityValidation]);
    return (_jsxs("div", { className: `bg-white space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Shield, { className: "w-6 h-6 mr-2" }), "Quality Control Engine"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Automated quality validation and data correction system" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [qualityResult && (_jsx(Badge, { className: getStatusColor(qualityResult.passed ? "excellent" : "critical"), children: qualityResult.passed ? "PASSED" : "FAILED" })), _jsxs(Button, { onClick: () => runQualityValidation(), disabled: isRunning, className: "flex items-center", children: [isRunning ? (_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Zap, { className: "w-4 h-4 mr-2" })), isRunning ? "Running..." : "Run Quality Check"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: metrics.map((metric) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: metric.name }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-2xl font-bold", children: [metric.current.toFixed(1), metric.unit] }), _jsx(Badge, { className: getStatusColor(metric.status), children: metric.status.toUpperCase() })] }), _jsx(Progress, { value: metric.unit === "%"
                                        ? metric.current
                                        : (metric.current / metric.target) * 100, className: "h-2 mt-2" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Target: ", metric.target, metric.unit] })] })] }, metric.id))) }), qualityResult && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Activity, { className: "w-5 h-5 mr-2" }), "Quality Validation Results"] }), _jsxs(CardDescription, { children: ["Overall Score: ", qualityResult.score.toFixed(1), "% | Issues Found:", " ", qualityResult.issues.length, " | Execution Time:", " ", qualityResult.metadata?.executionTime?.toFixed(0), "ms"] })] }), _jsxs(CardContent, { children: [qualityResult.issues.length === 0 ? (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "All Quality Checks Passed" }), _jsx(AlertDescription, { className: "text-green-700", children: "No issues detected. Data meets all quality standards." })] })) : (_jsx("div", { className: "space-y-3", children: qualityResult.issues.map((issue, index) => (_jsx(Alert, { className: "border-l-4 border-l-orange-500", children: _jsxs("div", { className: "flex items-start space-x-3", children: [getSeverityIcon(issue.severity), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(AlertTitle, { className: "text-sm font-medium", children: issue.message }), _jsx(Badge, { className: getStatusColor(issue.severity === "critical"
                                                                    ? "critical"
                                                                    : "warning"), children: issue.severity.toUpperCase() })] }), issue.field && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Field: ", issue.field] })), issue.suggestion && (_jsxs(AlertDescription, { className: "text-sm mt-2", children: ["\uD83D\uDCA1 ", issue.suggestion] })), issue.autoFixable && (_jsx("div", { className: "mt-2", children: _jsx(Badge, { variant: "outline", className: "text-xs", children: "Auto-fixable" }) }))] })] }) }, issue.id))) })), qualityResult.correctedData && (_jsxs(Alert, { className: "mt-4 bg-blue-50 border-blue-200", children: [_jsx(Settings, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Auto-Corrections Applied" }), _jsx(AlertDescription, { className: "text-blue-700", children: "Some issues have been automatically corrected. Review the changes before proceeding." })] }))] })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-base", children: "Quality Control Configuration" }), _jsx(CardDescription, { children: "Configure which quality rules are active" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: QUALITY_RULES.map((rule) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-sm", children: rule.name }), _jsx("div", { className: "text-xs text-gray-500", children: rule.description }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx(Badge, { className: getStatusColor(rule.severity === "critical" ? "critical" : "warning"), children: rule.severity.toUpperCase() }), _jsx(Badge, { variant: "outline", className: "text-xs", children: rule.category })] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx("input", { type: "checkbox", checked: enabledRules.includes(rule.id), onChange: (e) => {
                                                if (e.target.checked) {
                                                    setEnabledRules([...enabledRules, rule.id]);
                                                }
                                                else {
                                                    setEnabledRules(enabledRules.filter((id) => id !== rule.id));
                                                }
                                            }, className: "rounded" }) })] }, rule.id))) }) })] })] }));
}
