import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, Activity, Shield, Database, Settings, Users, FileText, TrendingUp, Zap, RefreshCw, Download, Clock, Target, Workflow, BarChart3, CheckSquare, AlertCircle, } from "lucide-react";
import { PlatformQualityValidator, } from "@/utils/platform-quality-validator";
import StoryboardLoader from "@/utils/storyboard-loader";
export default function PlatformQualityValidationStoryboard() {
    const [report, setReport] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [selectedTab, setSelectedTab] = useState("overview");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastValidation, setLastValidation] = useState("");
    const [validationHistory, setValidationHistory] = useState([]);
    const [storyboardStatus, setStoryboardStatus] = useState(null);
    // Run validation on component mount
    useEffect(() => {
        runValidation();
        loadStoryboardStatus();
    }, []);
    const loadStoryboardStatus = async () => {
        try {
            // Register storyboards from canvas info (this would normally come from props or context)
            const mockStoryboards = [
                { id: "1", name: "PatientManagement", type: "COMPONENT" },
                { id: "2", name: "ClinicalDocumentation", type: "COMPONENT" },
                { id: "3", name: "ComplianceChecker", type: "COMPONENT" },
                { id: "4", name: "DamanSubmission", type: "COMPONENT" },
                { id: "5", name: "DOHCompliance", type: "COMPONENT" },
                { id: "6", name: "QualityControl", type: "COMPONENT" },
            ];
            StoryboardLoader.registerStoryboards(mockStoryboards);
            const status = StoryboardLoader.getStoryboardStatus();
            const validation = StoryboardLoader.validateStoryboardImplementation();
            setStoryboardStatus({ ...status, validation });
        }
        catch (error) {
            console.error("Failed to load storyboard status:", error);
        }
    };
    // Auto-refresh functionality
    useEffect(() => {
        let interval;
        if (autoRefresh && !isValidating) {
            interval = setInterval(() => {
                runValidation();
            }, 30000); // Refresh every 30 seconds
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [autoRefresh, isValidating]);
    const runValidation = async () => {
        setIsValidating(true);
        try {
            const validationReport = await PlatformQualityValidator.validatePlatform({
                strict_mode: true,
                auto_fix: true,
                include_warnings: true,
                compliance_frameworks: ["Daman", "DOH", "Tasneef", "ADHICS"],
                performance_thresholds: {
                    response_time_ms: 2000,
                    memory_usage_mb: 512,
                    cpu_usage_percent: 80,
                },
            });
            setReport(validationReport);
            setLastValidation(new Date().toLocaleString());
            // Add to validation history
            setValidationHistory((prev) => {
                const newHistory = [validationReport, ...prev.slice(0, 9)]; // Keep last 10 reports
                return newHistory;
            });
        }
        catch (error) {
            console.error("Validation failed:", error);
        }
        finally {
            setIsValidating(false);
        }
    };
    const downloadReport = () => {
        if (!report)
            return;
        const reportText = PlatformQualityValidator.generateQualityReport(report);
        const blob = new Blob([reportText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `platform-quality-report-${new Date().toISOString().split("T")[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 70)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getScoreBadgeVariant = (score) => {
        if (score >= 90)
            return "default";
        if (score >= 70)
            return "secondary";
        return "destructive";
    };
    const ValidationMetricCard = ({ title, value, icon: Icon, description, trend, details, }) => (_jsxs(Card, { className: "bg-white hover:shadow-md transition-shadow", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: title }), _jsxs("div", { className: "flex items-center gap-2", children: [trend && (_jsx("div", { className: `text-xs px-2 py-1 rounded ${trend === "up"
                                    ? "bg-green-100 text-green-700"
                                    : trend === "down"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"}`, children: trend === "up" ? "↗" : trend === "down" ? "↘" : "→" })), _jsx(Icon, { className: "h-4 w-4 text-muted-foreground" })] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold mb-2", children: _jsxs("span", { className: getScoreColor(value), children: [value, "/100"] }) }), _jsx(Progress, { value: value, className: "mb-2" }), _jsx("p", { className: "text-xs text-muted-foreground mb-1", children: description }), details && _jsx("p", { className: "text-xs text-blue-600", children: details })] })] }));
    const ValidationResultCard = ({ title, passed, tested, passedCount, issues, score, icon: Icon, }) => (_jsxs(Card, { className: "bg-white hover:shadow-md transition-shadow", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [Icon && _jsx(Icon, { className: "h-5 w-5" }), passed ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(XCircle, { className: "h-5 w-5 text-red-600" })), title, score && (_jsxs(Badge, { variant: getScoreBadgeVariant(score), className: "ml-auto", children: [score, "/100"] }))] }), _jsxs(CardDescription, { children: [passedCount, "/", tested, " tests passed", score && ` • Score: ${score}/100`] })] }), _jsxs(CardContent, { children: [_jsx(Progress, { value: (passedCount / Math.max(tested, 1)) * 100, className: "mb-4" }), issues.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "text-sm font-medium text-red-600 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Issues Found (", issues.length, "):"] }), _jsxs(ScrollArea, { className: "h-32", children: [issues.slice(0, 5).map((issue, index) => (_jsxs("div", { className: "text-xs text-muted-foreground mb-1 p-2 bg-red-50 rounded", children: ["\u2022 ", issue] }, index))), issues.length > 5 && (_jsxs("div", { className: "text-xs text-muted-foreground italic", children: ["...and ", issues.length - 5, " more issues"] }))] })] }))] })] }));
    const SystematicFixesCard = ({ fixes }) => (_jsxs(Card, { className: "bg-green-50 border-green-200", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-green-800", children: [_jsx(CheckSquare, { className: "h-5 w-5" }), "Systematic Fixes Applied"] }), _jsxs(CardDescription, { className: "text-green-700", children: [fixes.length, " automatic fixes have been applied to resolve issues"] })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-40", children: fixes.map((fix, index) => (_jsxs("div", { className: "text-sm text-green-800 mb-2 p-2 bg-green-100 rounded flex items-start gap-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 mt-0.5 text-green-600" }), fix] }, index))) }) })] }));
    if (!report) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(RefreshCw, { className: `h-8 w-8 mx-auto mb-4 text-blue-600 ${isValidating ? "animate-spin" : ""}` }), _jsx("p", { className: "text-lg font-medium", children: isValidating
                                    ? "Running Comprehensive Platform Validation..."
                                    : "Loading Platform Quality Report..." }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Validating practices, tools, APIs, workflows, and compliance" })] }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Platform Quality Validation Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Comprehensive assessment of platform robustness, compliance, and implementation quality" }), lastValidation && (_jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Last validation: ", lastValidation] })] }))] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: autoRefresh ? "default" : "outline", size: "sm", onClick: () => setAutoRefresh(!autoRefresh), children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Auto Refresh"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: downloadReport, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download Report"] }), _jsxs(Button, { onClick: runValidation, disabled: isValidating, size: "sm", children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}` }), isValidating ? "Validating..." : "Run Validation"] })] })] }), _jsxs(Card, { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-6 w-6 text-blue-600" }), _jsx("span", { children: "Overall Platform Quality Score" })] }), _jsxs(Badge, { variant: getScoreBadgeVariant(report.overall_score), className: "text-lg px-3 py-1", children: [report.overall_score, "/100"] })] }), _jsxs(CardDescription, { children: ["Generated on ", new Date(report.timestamp).toLocaleString()] })] }), _jsxs(CardContent, { children: [_jsx(Progress, { value: report.overall_score, className: "h-3 mb-4" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-2xl font-bold ${getScoreColor(report.quality_metrics.code_quality)}`, children: report.quality_metrics.code_quality }), _jsx("div", { className: "text-sm text-gray-600", children: "Code Quality" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-2xl font-bold ${getScoreColor(report.quality_metrics.security)}`, children: report.quality_metrics.security }), _jsx("div", { className: "text-sm text-gray-600", children: "Security" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-2xl font-bold ${getScoreColor(report.quality_metrics.performance)}`, children: report.quality_metrics.performance }), _jsx("div", { className: "text-sm text-gray-600", children: "Performance" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-2xl font-bold ${getScoreColor(report.quality_metrics.reliability)}`, children: report.quality_metrics.reliability }), _jsx("div", { className: "text-sm text-gray-600", children: "Reliability" })] })] })] })] }), report.critical_issues.length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Critical Issues Detected" }), _jsxs(AlertDescription, { children: [report.critical_issues.length, " critical issues require immediate attention.", _jsx("div", { className: "mt-2 space-y-1", children: report.critical_issues.map((issue, index) => (_jsxs("div", { className: "text-sm", children: ["\u2022 ", issue] }, index))) })] })] })), report.systematic_fixes_applied.length > 0 && (_jsx(SystematicFixesCard, { fixes: report.systematic_fixes_applied })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(ValidationMetricCard, { title: "Practice Implementation", value: report.quality_metrics.practice_implementation, icon: Users, description: "Clinical and administrative practices", details: `ADHICS Score: ${report.validation_results.practice_implementation.adhics_compliance_score}/100`, trend: "up" }), _jsx(ValidationMetricCard, { title: "Tools Effectiveness", value: report.quality_metrics.tools_effectiveness, icon: Settings, description: "Platform tools and utilities", details: `${report.validation_results.tools_utilization.tools_functional}/${report.validation_results.tools_utilization.tools_tested} tools functional`, trend: "stable" }), _jsx(ValidationMetricCard, { title: "Workflow Efficiency", value: report.quality_metrics.workflow_efficiency, icon: Workflow, description: "Process integration and automation", details: `Automation: ${report.validation_results.workflow_integration.automation_score}%`, trend: "up" }), _jsx(ValidationMetricCard, { title: "Maintainability", value: report.quality_metrics.maintainability, icon: FileText, description: "Code structure and documentation", trend: "stable" })] }), _jsxs(Tabs, { value: selectedTab, onValueChange: setSelectedTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-7", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "validation", children: "Core Validation" }), _jsx(TabsTrigger, { value: "practices", children: "Practices" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "storyboards", children: "Storyboards" }), _jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" }), _jsx(TabsTrigger, { value: "history", children: "History" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(ValidationResultCard, { title: "JSON Validation", passed: report.validation_results.json_validation.passed, tested: 1, passedCount: report.validation_results.json_validation.passed ? 1 : 0, issues: report.validation_results.json_validation.critical_errors, icon: Database }), _jsx(ValidationResultCard, { title: "API Validation", passed: report.validation_results.api_validation.passed, tested: report.validation_results.api_validation.endpoints_tested, passedCount: report.validation_results.api_validation.endpoints_passed, issues: report.validation_results.api_validation.failed_endpoints, icon: Zap }), _jsx(ValidationResultCard, { title: "Component Validation", passed: report.validation_results.component_validation.passed, tested: report.validation_results.component_validation
                                            .components_tested, passedCount: report.validation_results.component_validation
                                            .components_passed, issues: report.validation_results.component_validation.jsx_errors, icon: Settings }), _jsx(ValidationResultCard, { title: "Integration Validation", passed: report.validation_results.integration_validation.passed, tested: report.validation_results.integration_validation
                                            .integrations_tested, passedCount: report.validation_results.integration_validation
                                            .integrations_passed, issues: report.validation_results.integration_validation
                                            .integration_issues, icon: Workflow })] }) }), _jsx(TabsContent, { value: "validation", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-5 w-5" }), "JSON/JSX Systematic Fixes"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Issues Found:" }), _jsx(Badge, { variant: "outline", children: report.validation_results.json_validation.issues_found })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Issues Fixed:" }), _jsx(Badge, { variant: "default", children: report.validation_results.json_validation.issues_fixed })] }), _jsx(Separator, {}), report.validation_results.json_validation.systematic_fixes
                                                            .length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2 text-green-700", children: "Systematic Fixes Applied:" }), _jsx(ScrollArea, { className: "h-32", children: report.validation_results.json_validation.systematic_fixes.map((fix, index) => (_jsxs("div", { className: "text-xs text-green-700 mb-1 p-2 bg-green-50 rounded", children: ["\u2713 ", fix] }, index))) })] }))] }) })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "h-5 w-5" }), "Component Integrity"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Components Tested:" }), _jsx(Badge, { variant: "outline", children: report.validation_results.component_validation
                                                                        .components_tested })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Components Passed:" }), _jsx(Badge, { variant: "default", children: report.validation_results.component_validation
                                                                        .components_passed })] }), _jsx(Progress, { value: (report.validation_results.component_validation
                                                                .components_passed /
                                                                report.validation_results.component_validation
                                                                    .components_tested) *
                                                                100, className: "mt-2" }), report.validation_results.component_validation.jsx_fixes
                                                            .length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2 text-blue-700", children: "JSX Fixes Applied:" }), _jsx(ScrollArea, { className: "h-32", children: report.validation_results.component_validation.jsx_fixes
                                                                        .slice(0, 3)
                                                                        .map((fix, index) => (_jsxs("div", { className: "text-xs text-blue-700 mb-1 p-2 bg-blue-50 rounded", children: ["\u2713 ", fix] }, index))) })] }))] }) })] })] }) }), _jsx(TabsContent, { value: "practices", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(ValidationResultCard, { title: "Practice Implementation", passed: report.validation_results.practice_implementation.passed, tested: report.validation_results.practice_implementation
                                            .practices_tested, passedCount: report.validation_results.practice_implementation
                                            .practices_implemented, issues: report.validation_results.practice_implementation
                                            .implementation_gaps, score: report.validation_results.practice_implementation
                                            .adhics_compliance_score, icon: Users }), _jsx(ValidationResultCard, { title: "Tools Utilization", passed: report.validation_results.tools_utilization.passed, tested: report.validation_results.tools_utilization.tools_tested, passedCount: report.validation_results.tools_utilization.tools_functional, issues: report.validation_results.tools_utilization.tool_issues, score: report.validation_results.tools_utilization
                                            .effectiveness_score, icon: Settings }), _jsx(ValidationResultCard, { title: "Workflow Integration", passed: report.validation_results.workflow_integration.passed, tested: report.validation_results.workflow_integration
                                            .workflows_tested, passedCount: report.validation_results.workflow_integration
                                            .workflows_integrated, issues: report.validation_results.workflow_integration.workflow_issues, score: report.validation_results.workflow_integration
                                            .automation_score, icon: Workflow }), _jsx(ValidationResultCard, { title: "DOH Ranking Compliance", passed: report.validation_results.doh_ranking_compliance.passed, tested: report.validation_results.doh_ranking_compliance
                                            .total_requirements, passedCount: report.validation_results.doh_ranking_compliance
                                            .requirements_met, issues: report.validation_results.doh_ranking_compliance
                                            .compliance_issues, score: report.validation_results.doh_ranking_compliance.ranking_score, icon: Target })] }) }), _jsx(TabsContent, { value: "storyboards", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Storyboard Implementation Status"] }), _jsx(CardDescription, { children: "Complete assessment of all platform storyboards and their loading status" })] }), _jsx(CardContent, { children: storyboardStatus ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: storyboardStatus.total }), _jsx("div", { className: "text-sm text-blue-700", children: "Total Storyboards" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: storyboardStatus.loaded }), _jsx("div", { className: "text-sm text-green-700", children: "Successfully Loaded" })] }), _jsxs("div", { className: "text-center p-4 bg-yellow-50 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: storyboardStatus.loading }), _jsx("div", { className: "text-sm text-yellow-700", children: "Loading" })] }), _jsxs("div", { className: "text-center p-4 bg-red-50 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: storyboardStatus.error }), _jsx("div", { className: "text-sm text-red-700", children: "Errors" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Implementation Progress:" }), _jsx(Badge, { variant: storyboardStatus.validation.isComplete
                                                                        ? "default"
                                                                        : "secondary", children: storyboardStatus.validation.isComplete
                                                                        ? "Complete"
                                                                        : "Incomplete" })] }), _jsx(Progress, { value: (storyboardStatus.loaded / storyboardStatus.total) *
                                                                100, className: "mb-4" }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Success Rate:", " ", ((storyboardStatus.loaded / storyboardStatus.total) *
                                                                    100).toFixed(1), "%"] })] }), storyboardStatus.validation.errorStoryboards.length >
                                                    0 && (_jsxs("div", { children: [_jsxs("h4", { className: "font-medium mb-2 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600" }), "Storyboards with Errors:"] }), _jsx(ScrollArea, { className: "h-32", children: storyboardStatus.validation.errorStoryboards.map((error, index) => (_jsxs("div", { className: "text-sm text-red-700 mb-1 p-2 bg-red-50 rounded", children: ["\u2022 ", error] }, index))) })] })), storyboardStatus.validation.missingStoryboards.length >
                                                    0 && (_jsxs("div", { children: [_jsxs("h4", { className: "font-medium mb-2 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-orange-600" }), "Missing Required Storyboards:"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: storyboardStatus.validation.missingStoryboards.map((missing, index) => (_jsx(Badge, { variant: "outline", className: "justify-center", children: missing }, index))) })] })), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "All Storyboards:" }), _jsx(ScrollArea, { className: "h-64", children: storyboardStatus.storyboards.map((storyboard, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded mb-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [storyboard.status === "loaded" ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })) : storyboard.status === "loading" ? (_jsx(RefreshCw, { className: "h-4 w-4 text-blue-600 animate-spin" })) : (_jsx(XCircle, { className: "h-4 w-4 text-red-600" })), _jsx("span", { className: "font-medium", children: storyboard.name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: storyboard.type }), _jsx(Badge, { variant: storyboard.status === "loaded"
                                                                                    ? "default"
                                                                                    : storyboard.status === "loading"
                                                                                        ? "secondary"
                                                                                        : "destructive", className: "text-xs", children: storyboard.status })] })] }, index))) })] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(RefreshCw, { className: "h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" }), _jsx("p", { className: "text-muted-foreground", children: "Loading storyboard status..." })] })) })] }) }), _jsxs(TabsContent, { value: "compliance", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6", children: [_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [report.validation_results.compliance_validation
                                                                .daman_compliant ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(XCircle, { className: "h-5 w-5 text-red-600" })), "Daman Compliance"] }) }), _jsx(CardContent, { children: _jsx(Badge, { variant: report.validation_results.compliance_validation
                                                            .daman_compliant
                                                            ? "default"
                                                            : "destructive", className: "w-full justify-center", children: report.validation_results.compliance_validation
                                                            .daman_compliant
                                                            ? "Compliant"
                                                            : "Non-Compliant" }) })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [report.validation_results.compliance_validation
                                                                .doh_compliant ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(XCircle, { className: "h-5 w-5 text-red-600" })), "DOH Compliance"] }) }), _jsx(CardContent, { children: _jsx(Badge, { variant: report.validation_results.compliance_validation
                                                            .doh_compliant
                                                            ? "default"
                                                            : "destructive", className: "w-full justify-center", children: report.validation_results.compliance_validation
                                                            .doh_compliant
                                                            ? "Compliant"
                                                            : "Non-Compliant" }) })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [report.validation_results.compliance_validation
                                                                .tasneef_compliant ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(XCircle, { className: "h-5 w-5 text-red-600" })), "Tasneef Compliance"] }) }), _jsx(CardContent, { children: _jsx(Badge, { variant: report.validation_results.compliance_validation
                                                            .tasneef_compliant
                                                            ? "default"
                                                            : "destructive", className: "w-full justify-center", children: report.validation_results.compliance_validation
                                                            .tasneef_compliant
                                                            ? "Compliant"
                                                            : "Non-Compliant" }) })] }), _jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [report.validation_results.compliance_validation
                                                                .adhics_compliant ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : (_jsx(XCircle, { className: "h-5 w-5 text-red-600" })), "ADHICS V2 Compliance"] }) }), _jsx(CardContent, { children: _jsx(Badge, { variant: report.validation_results.compliance_validation
                                                            .adhics_compliant
                                                            ? "default"
                                                            : "destructive", className: "w-full justify-center", children: report.validation_results.compliance_validation
                                                            .adhics_compliant
                                                            ? "Compliant"
                                                            : "Non-Compliant" }) })] })] }), _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "DOH Ranking Compliance Details"] }), _jsx(CardDescription, { children: "Comprehensive assessment against DOH audit checklist requirements" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [report.validation_results.doh_ranking_compliance
                                                                            .ranking_score, "/100"] }), _jsx("div", { className: "text-sm text-blue-700", children: "DOH Ranking Score" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: report.validation_results.doh_ranking_compliance
                                                                        .requirements_met }), _jsx("div", { className: "text-sm text-green-700", children: "Requirements Met" })] }), _jsxs("div", { className: "text-center p-4 bg-gray-50 rounded", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: report.validation_results.doh_ranking_compliance
                                                                        .total_requirements }), _jsx("div", { className: "text-sm text-gray-700", children: "Total Requirements" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Audit Readiness:" }), _jsx(Badge, { variant: report.validation_results.doh_ranking_compliance
                                                                        .audit_readiness
                                                                        ? "default"
                                                                        : "secondary", children: report.validation_results.doh_ranking_compliance
                                                                        .audit_readiness
                                                                        ? "Ready"
                                                                        : "Needs Improvement" })] }), _jsx(Progress, { value: (report.validation_results.doh_ranking_compliance
                                                                .requirements_met /
                                                                report.validation_results.doh_ranking_compliance
                                                                    .total_requirements) *
                                                                100, className: "mb-4" })] }), report.validation_results.doh_ranking_compliance
                                                    .compliance_issues.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "font-medium mb-2 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-orange-600" }), "Compliance Issues:"] }), _jsxs(ScrollArea, { className: "h-40", children: [report.validation_results.doh_ranking_compliance.compliance_issues
                                                                    .slice(0, 10)
                                                                    .map((issue, index) => (_jsxs("div", { className: "text-sm text-orange-700 mb-1 p-2 bg-orange-50 rounded", children: ["\u2022 ", issue] }, index))), report.validation_results.doh_ranking_compliance
                                                                    .compliance_issues.length > 10 && (_jsxs("div", { className: "text-xs text-muted-foreground italic mt-2", children: ["...and", " ", report.validation_results.doh_ranking_compliance
                                                                            .compliance_issues.length - 10, " ", "more issues"] }))] })] }))] })] })] }), _jsx(TabsContent, { value: "storyboards", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Storyboards"] }), _jsx(CardDescription, { children: "View and manage storyboards for the platform" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: mockStoryboards.map((storyboard, index) => (_jsxs("div", { className: "p-4 bg-gray-50 rounded flex items-center gap-2", children: [_jsx("div", { className: "text-sm font-medium", children: storyboard.name }), _jsx("div", { className: "text-sm text-muted-foreground", children: storyboard.type })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "recommendations", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Improvement Recommendations"] }), _jsxs(CardDescription, { children: [report.recommendations.length, " actionable recommendations to enhance platform quality"] })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: report.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-3 mb-4 p-3 bg-blue-50 rounded", children: [_jsx(Badge, { variant: "outline", className: "mt-0.5 text-xs", children: index + 1 }), _jsx("div", { className: "flex-1", children: _jsx("span", { className: "text-sm font-medium", children: recommendation }) })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "history", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), "Validation History"] }), _jsx(CardDescription, { children: "Track quality score trends over time" })] }), _jsx(CardContent, { children: validationHistory.length > 0 ? (_jsx(ScrollArea, { className: "h-96", children: validationHistory.map((historyReport, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded mb-2", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: new Date(historyReport.timestamp).toLocaleString() }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [historyReport.critical_issues.length, " critical issues"] })] }), _jsx("div", { className: "text-right", children: _jsxs(Badge, { variant: getScoreBadgeVariant(historyReport.overall_score), children: [historyReport.overall_score, "/100"] }) })] }, index))) })) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No validation history available yet." })) })] }) })] })] }) }));
}
