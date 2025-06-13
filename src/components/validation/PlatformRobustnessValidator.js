import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, Clock, TrendingUp, Shield, Database, Smartphone, FileText, Workflow, Users, BarChart3, Activity, Target, Zap, Eye, Lock, Server, RefreshCw, Play, Pause, Settings, Search, User, Code, TestTube, BookOpen, Gauge, Bug, GitBranch, Layers, Network, Globe, Monitor, HardDrive, } from "lucide-react";
const PlatformRobustnessValidator = () => {
    // Add error boundary for this component
    const [hasError, setHasError] = React.useState(false);
    React.useEffect(() => {
        const handleError = (error) => {
            console.error('PlatformRobustnessValidator error:', error);
            setHasError(true);
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);
    if (hasError) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-red-600 mb-4", children: "Component Error" }), _jsx("p", { className: "text-gray-600 mb-4", children: "There was an error loading the Platform Robustness Validator." }), _jsx("button", { onClick: () => setHasError(false), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Retry" })] }) }));
    }
    const [validationResult, setValidationResult] = useState(null);
    const [platformValidatorResult, setPlatformValidatorResult] = useState(null);
    const [pendingSubtasks, setPendingSubtasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [realTimeMode, setRealTimeMode] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [taskFilter, setTaskFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModule, setSelectedModule] = useState("all");
    const [qualityMetrics, setQualityMetrics] = useState(null);
    const [securityAssessment, setSecurityAssessment] = useState(null);
    const [enhancementPlan, setEnhancementPlan] = useState(null);
    const [implementationProgress, setImplementationProgress] = useState(null);
    const runRobustnessValidation = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/doh-audit/platform-robustness-validation");
            const data = await response.json();
            if (data.success) {
                setValidationResult(data.validation);
            }
        }
        catch (error) {
            console.error("Error running robustness validation:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const runPlatformValidator = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/doh-audit/run-platform-validator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ validationType: "comprehensive" }),
            });
            const data = await response.json();
            if (data.success) {
                setPlatformValidatorResult(data);
            }
        }
        catch (error) {
            console.error("Error running platform validator:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchPendingSubtasks = async () => {
        try {
            const response = await fetch("/api/doh-audit/pending-subtasks");
            const data = await response.json();
            if (data.success) {
                setPendingSubtasks(data.subtasks);
            }
        }
        catch (error) {
            console.error("Error fetching pending subtasks:", error);
        }
    };
    const fetchQualityMetrics = async () => {
        try {
            const response = await fetch("/api/doh-audit/quality-metrics");
            const data = await response.json();
            if (data.success) {
                setQualityMetrics(data.metrics);
            }
        }
        catch (error) {
            console.error("Error fetching quality metrics:", error);
        }
    };
    const fetchSecurityAssessment = async () => {
        try {
            const response = await fetch("/api/doh-audit/security-assessment");
            const data = await response.json();
            if (data.success) {
                setSecurityAssessment(data.assessment);
            }
        }
        catch (error) {
            console.error("Error fetching security assessment:", error);
        }
    };
    const generateEnhancementPlan = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/doh-audit/generate-enhancement-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    includeInfrastructure: true,
                    includeSecurity: true,
                    includeUX: true,
                    includeCompliance: true
                }),
            });
            const data = await response.json();
            if (data.success) {
                setEnhancementPlan(data.plan);
            }
        }
        catch (error) {
            console.error("Error generating enhancement plan:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchImplementationProgress = async () => {
        try {
            const response = await fetch("/api/doh-audit/implementation-progress");
            const data = await response.json();
            if (data.success) {
                setImplementationProgress(data.progress);
            }
        }
        catch (error) {
            console.error("Error fetching implementation progress:", error);
        }
    };
    const updateSubtaskStatus = async (subtaskId, status) => {
        try {
            const response = await fetch(`/api/doh-audit/subtasks/${subtaskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                fetchPendingSubtasks();
            }
        }
        catch (error) {
            console.error("Error updating subtask status:", error);
        }
    };
    const generateRobustnessReport = async () => {
        try {
            const response = await fetch("/api/doh-audit/generate-robustness-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ format: "json", includeDetails: true }),
            });
            const data = await response.json();
            if (data.success) {
                // Download or display the report
                const blob = new Blob([JSON.stringify(data.report, null, 2)], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `platform-robustness-report-${new Date().toISOString().split("T")[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
        catch (error) {
            console.error("Error generating robustness report:", error);
        }
    };
    useEffect(() => {
        fetchPendingSubtasks();
        fetchQualityMetrics();
        fetchSecurityAssessment();
        fetchImplementationProgress();
    }, []);
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                runRobustnessValidation();
                fetchPendingSubtasks();
                fetchQualityMetrics();
                fetchSecurityAssessment();
                fetchImplementationProgress();
            }, 30000); // Refresh every 30 seconds
            setRefreshInterval(interval);
        }
        else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
        return () => {
            if (refreshInterval)
                clearInterval(refreshInterval);
        };
    }, [realTimeMode]);
    const getScoreColor = (score) => {
        if (score >= 80)
            return "text-green-600";
        if (score >= 60)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getStatusBadge = (score) => {
        if (score >= 80)
            return _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Excellent" });
        if (score >= 60)
            return (_jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: "Needs Improvement" }));
        return _jsx(Badge, { className: "bg-red-100 text-red-800", children: "Critical" });
    };
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "critical":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getModuleIcon = (moduleName) => {
        const iconMap = {
            patientManagement: Users,
            clinicalDocumentation: FileText,
            complianceMonitoring: Shield,
            workflowAutomation: Workflow,
            mobileInterface: Smartphone,
            integrationLayer: Network,
            reportingAnalytics: BarChart3,
            securityFramework: Lock,
            backupRecovery: HardDrive,
            qualityAssurance: TestTube,
            userInterface: Monitor,
            systemInfrastructure: Server,
        };
        return iconMap[moduleName] || Database;
    };
    const getQualityIcon = (metricName) => {
        const iconMap = {
            codeQuality: Code,
            testCoverage: TestTube,
            documentation: BookOpen,
            performance: Gauge,
            bugDensity: Bug,
            codeComplexity: GitBranch,
            maintainability: Settings,
            reliability: Shield,
        };
        return iconMap[metricName] || Activity;
    };
    const getSecurityIcon = (domainName) => {
        const iconMap = {
            authentication: User,
            authorization: Shield,
            dataEncryption: Lock,
            networkSecurity: Network,
            apiSecurity: Globe,
            accessControl: Eye,
            auditLogging: FileText,
            incidentResponse: AlertTriangle,
            vulnerabilityManagement: Bug,
            complianceFramework: CheckCircle,
        };
        return iconMap[domainName] || Shield;
    };
    const filteredSubtasks = pendingSubtasks.filter((task) => {
        const matchesFilter = taskFilter === "all" || task.priority === taskFilter;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = selectedModule === "all" || task.category.toLowerCase().includes(selectedModule.toLowerCase());
        return matchesFilter && matchesSearch && matchesModule;
    });
    const coreModules = [
        { name: "Patient Management", key: "patientManagement", implemented: 85 },
        { name: "Clinical Documentation", key: "clinicalDocumentation", implemented: 92 },
        { name: "Compliance Monitoring", key: "complianceMonitoring", implemented: 78 },
        { name: "Workflow Automation", key: "workflowAutomation", implemented: 65 },
        { name: "Mobile Interface", key: "mobileInterface", implemented: 70 },
        { name: "Integration Layer", key: "integrationLayer", implemented: 88 },
        { name: "Reporting & Analytics", key: "reportingAnalytics", implemented: 82 },
        { name: "Security Framework", key: "securityFramework", implemented: 95 },
        { name: "Backup & Recovery", key: "backupRecovery", implemented: 45 },
        { name: "Quality Assurance", key: "qualityAssurance", implemented: 75 },
        { name: "User Interface", key: "userInterface", implemented: 90 },
        { name: "System Infrastructure", key: "systemInfrastructure", implemented: 80 },
    ];
    const securityDomains = [
        { name: "Authentication", key: "authentication", score: 92, risk: "Low" },
        { name: "Authorization", key: "authorization", score: 88, risk: "Low" },
        { name: "Data Encryption", key: "dataEncryption", score: 95, risk: "Low" },
        { name: "Network Security", key: "networkSecurity", score: 85, risk: "Medium" },
        { name: "API Security", key: "apiSecurity", score: 78, risk: "Medium" },
        { name: "Access Control", key: "accessControl", score: 90, risk: "Low" },
        { name: "Audit Logging", key: "auditLogging", score: 82, risk: "Medium" },
        { name: "Incident Response", key: "incidentResponse", score: 65, risk: "High" },
        { name: "Vulnerability Management", key: "vulnerabilityManagement", score: 70, risk: "High" },
        { name: "Compliance Framework", key: "complianceFramework", score: 88, risk: "Low" },
    ];
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow-sm p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Interactive Platform Validation Dashboard" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Real-time monitoring and comprehensive validation of platform robustness" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { onClick: () => setRealTimeMode(!realTimeMode), variant: realTimeMode ? "default" : "outline", size: "sm", children: [realTimeMode ? _jsx(Pause, { className: "h-4 w-4 mr-2" }) : _jsx(Play, { className: "h-4 w-4 mr-2" }), realTimeMode ? "Pause" : "Real-time"] }), _jsxs(Button, { onClick: runRobustnessValidation, disabled: loading, size: "sm", variant: "outline", children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] }), _jsx(Separator, { orientation: "vertical", className: "h-8" }), _jsx(Button, { onClick: runRobustnessValidation, disabled: loading, children: loading ? "Running..." : "Run Validation" }), _jsx(Button, { onClick: runPlatformValidator, disabled: loading, variant: "outline", children: loading ? "Running..." : "Full Analysis" }), _jsx(Button, { onClick: generateRobustnessReport, variant: "outline", children: "Generate Report" })] })] }) }), (validationResult || platformValidatorResult) && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Overall Score" })] }), _jsxs("div", { className: `text-2xl font-bold mt-2 ${getScoreColor(validationResult?.overallScore || platformValidatorResult?.overallScore || 0)}`, children: [validationResult?.overallScore ||
                                                platformValidatorResult?.overallScore ||
                                                0, "%"] }), _jsx(Progress, { value: validationResult?.overallScore ||
                                            platformValidatorResult?.overallScore ||
                                            0, className: "mt-2" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "h-5 w-5 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Health Status" })] }), _jsx("div", { className: "mt-2", children: _jsx(Badge, { className: validationResult?.healthStatus === "EXCELLENT"
                                                ? "bg-green-100 text-green-800"
                                                : validationResult?.healthStatus === "GOOD"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : validationResult?.healthStatus === "FAIR"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : validationResult?.healthStatus ===
                                                            "NEEDS_IMPROVEMENT"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-red-100 text-red-800", children: validationResult?.healthStatus || "UNKNOWN" }) })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Critical Issues" })] }), _jsx("div", { className: "text-2xl font-bold mt-2 text-red-600", children: validationResult?.criticalIssues.length ||
                                            platformValidatorResult?.consolidatedFindings
                                                .criticalIssues ||
                                            0 })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-5 w-5 text-yellow-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Pending Tasks" })] }), _jsx("div", { className: "text-2xl font-bold mt-2 text-yellow-600", children: pendingSubtasks.length })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-indigo-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Risk Level" })] }), _jsx("div", { className: "mt-2", children: _jsx(Badge, { className: validationResult?.riskAssessment?.riskLevel === "LOW"
                                                ? "bg-green-100 text-green-800"
                                                : validationResult?.riskAssessment?.riskLevel ===
                                                    "MEDIUM"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800", children: validationResult?.riskAssessment?.riskLevel || "UNKNOWN" }) })] }) })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-10", children: [_jsx(TabsTrigger, { value: "dashboard", children: "Dashboard" }), _jsx(TabsTrigger, { value: "enhancements", children: "Enhancements" }), _jsx(TabsTrigger, { value: "modules", children: "Modules" }), _jsx(TabsTrigger, { value: "quality", children: "Quality" }), _jsx(TabsTrigger, { value: "security", children: "Security" }), _jsx(TabsTrigger, { value: "tasks", children: "Tasks" }), _jsx(TabsTrigger, { value: "risks", children: "Risks" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsxs(TabsContent, { value: "dashboard", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Activity, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { children: "Platform Health Score" }), realTimeMode && (_jsx(Badge, { className: "bg-green-100 text-green-800 animate-pulse", children: "Live" }))] }), _jsx(CardDescription, { children: "Real-time assessment of overall platform robustness" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "flex items-center justify-center mb-6", children: _jsxs("div", { className: "relative w-32 h-32", children: [_jsxs("svg", { className: "w-32 h-32 transform -rotate-90", viewBox: "0 0 36 36", children: [_jsx("path", { className: "text-gray-200", stroke: "currentColor", strokeWidth: "3", fill: "none", d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" }), _jsx("path", { className: `${(validationResult?.overallScore || 0) >= 80
                                                                                    ? "text-green-500"
                                                                                    : (validationResult?.overallScore || 0) >= 60
                                                                                        ? "text-yellow-500"
                                                                                        : "text-red-500"}`, stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", fill: "none", strokeDasharray: `${(validationResult?.overallScore || 0) * 0.628}, 100`, d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-3xl font-bold ${(validationResult?.overallScore || 0) >= 80
                                                                                        ? "text-green-600"
                                                                                        : (validationResult?.overallScore || 0) >= 60
                                                                                            ? "text-yellow-600"
                                                                                            : "text-red-600"}`, children: [validationResult?.overallScore || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-500", children: "Health Score" })] }) })] }) }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: coreModules.filter(m => m.implemented >= 80).length }), _jsx("div", { className: "text-sm text-gray-500", children: "Healthy Modules" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: coreModules.filter(m => m.implemented >= 60 && m.implemented < 80).length }), _jsx("div", { className: "text-sm text-gray-500", children: "At Risk" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: coreModules.filter(m => m.implemented < 60).length }), _jsx("div", { className: "text-sm text-gray-500", children: "Critical" })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Target, { className: "h-5 w-5 text-purple-600" }), _jsx("span", { children: "Key Metrics" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Security Score" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 88, className: "w-16" }), _jsx("span", { className: "text-sm font-bold text-green-600", children: "88%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Quality Score" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 82, className: "w-16" }), _jsx("span", { className: "text-sm font-bold text-blue-600", children: "82%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Compliance" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 92, className: "w-16" }), _jsx("span", { className: "text-sm font-bold text-green-600", children: "92%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Performance" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 75, className: "w-16" }), _jsx("span", { className: "text-sm font-bold text-yellow-600", children: "75%" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Critical Tasks" }), _jsx(Badge, { className: "bg-red-100 text-red-800", children: filteredSubtasks.filter(t => t.priority === 'critical').length })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "High Priority" }), _jsx(Badge, { className: "bg-orange-100 text-orange-800", children: filteredSubtasks.filter(t => t.priority === 'high').length })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-5 w-5 text-yellow-600" }), _jsx("span", { children: "Quick Actions" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col space-y-2", onClick: () => setActiveTab("modules"), children: [_jsx(Layers, { className: "h-6 w-6" }), _jsx("span", { children: "Module Analysis" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col space-y-2", onClick: () => setActiveTab("security"), children: [_jsx(Shield, { className: "h-6 w-6" }), _jsx("span", { children: "Security Check" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col space-y-2", onClick: () => setActiveTab("tasks"), children: [_jsx(CheckCircle, { className: "h-6 w-6" }), _jsx("span", { children: "Task Manager" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col space-y-2", onClick: generateRobustnessReport, children: [_jsx(FileText, { className: "h-6 w-6" }), _jsx("span", { children: "Generate Report" })] })] }) })] })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: validationResult && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Completeness" }), _jsx(Database, { className: "h-4 w-4 ml-auto text-blue-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${getScoreColor(validationResult.completeness.score)}`, children: [validationResult.completeness.score, "%"] }), _jsx(Progress, { value: validationResult.completeness.score, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [validationResult.completeness.gaps.length, " gaps identified"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Quality" }), _jsx(BarChart3, { className: "h-4 w-4 ml-auto text-green-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${getScoreColor(validationResult.quality.score)}`, children: [validationResult.quality.score, "%"] }), _jsx(Progress, { value: validationResult.quality.score, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [validationResult.quality.gaps.length, " quality issues"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Security" }), _jsx(Shield, { className: "h-4 w-4 ml-auto text-red-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${getScoreColor(validationResult.security.score)}`, children: [validationResult.security.score, "%"] }), _jsx(Progress, { value: validationResult.security.score, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [validationResult.security.criticalIssues.length, " security risks"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Frontend" }), _jsx(Smartphone, { className: "h-4 w-4 ml-auto text-purple-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${getScoreColor(validationResult.frontend.score)}`, children: [validationResult.frontend.score, "%"] }), _jsx(Progress, { value: validationResult.frontend.score, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [validationResult.frontend.gaps.length, " UI/UX improvements"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Backend" }), _jsx(Database, { className: "h-4 w-4 ml-auto text-indigo-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${getScoreColor(validationResult.backend.score)}`, children: [validationResult.backend.score, "%"] }), _jsx(Progress, { value: validationResult.backend.score, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [validationResult.backend.gaps.length, " backend enhancements"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Workflows" }), _jsx(Workflow, { className: "h-4 w-4 ml-auto text-orange-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: `text-2xl font-bold ${getScoreColor(validationResult.workflows.score)}`, children: [validationResult.workflows.score, "%"] }), _jsx(Progress, { value: validationResult.workflows.score, className: "mt-2" }), _jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [validationResult.workflows.gaps.length, " workflow optimizations"] })] })] })] })) }), _jsxs(TabsContent, { value: "modules", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Module-by-Module Analysis" }), _jsx("p", { className: "text-sm text-gray-600", children: "12 core modules with implementation percentages" })] }), _jsxs(Select, { value: selectedModule, onValueChange: setSelectedModule, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by module" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Modules" }), coreModules.map((module) => (_jsx(SelectItem, { value: module.key, children: module.name }, module.key)))] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: coreModules
                                        .filter(module => selectedModule === "all" || module.key === selectedModule)
                                        .map((module) => {
                                        const IconComponent = getModuleIcon(module.key);
                                        return (_jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(IconComponent, { className: "h-5 w-5 text-blue-600" }), _jsx(CardTitle, { className: "text-sm", children: module.name })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-2xl font-bold text-gray-900", children: [module.implemented, "%"] }), _jsx(Badge, { className: module.implemented >= 80
                                                                            ? "bg-green-100 text-green-800"
                                                                            : module.implemented >= 60
                                                                                ? "bg-yellow-100 text-yellow-800"
                                                                                : "bg-red-100 text-red-800", children: module.implemented >= 80
                                                                            ? "Healthy"
                                                                            : module.implemented >= 60
                                                                                ? "At Risk"
                                                                                : "Critical" })] }), _jsx(Progress, { value: module.implemented, className: "h-2" }), _jsx("div", { className: "text-xs text-gray-500", children: module.implemented >= 80
                                                                    ? "Module is performing well"
                                                                    : module.implemented >= 60
                                                                        ? "Needs attention"
                                                                        : "Requires immediate action" })] }) })] }, module.key));
                                    }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Implementation Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600 mb-2", children: [Math.round(coreModules.reduce((acc, m) => acc + m.implemented, 0) / coreModules.length), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Average Implementation" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600 mb-2", children: [coreModules.filter(m => m.implemented >= 80).length, "/", coreModules.length] }), _jsx("div", { className: "text-sm text-gray-600", children: "Modules Complete" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-orange-600 mb-2", children: coreModules.filter(m => m.implemented < 60).length }), _jsx("div", { className: "text-sm text-gray-600", children: "Critical Modules" })] })] }) })] })] }), _jsxs(TabsContent, { value: "quality", className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Quality Metrics Dashboard" }), _jsx("p", { className: "text-sm text-gray-600", children: "Code quality, test coverage, documentation, and performance metrics" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
                                        { name: "Code Quality", key: "codeQuality", score: 85, trend: "+2%" },
                                        { name: "Test Coverage", key: "testCoverage", score: 78, trend: "+5%" },
                                        { name: "Documentation", key: "documentation", score: 72, trend: "+1%" },
                                        { name: "Performance", key: "performance", score: 88, trend: "-1%" },
                                        { name: "Bug Density", key: "bugDensity", score: 92, trend: "+3%" },
                                        { name: "Code Complexity", key: "codeComplexity", score: 75, trend: "0%" },
                                        { name: "Maintainability", key: "maintainability", score: 80, trend: "+2%" },
                                        { name: "Reliability", key: "reliability", score: 90, trend: "+1%" },
                                    ].map((metric) => {
                                        const IconComponent = getQualityIcon(metric.key);
                                        return (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx(IconComponent, { className: "h-5 w-5 text-blue-600" }), _jsx(Badge, { className: metric.trend.startsWith("+")
                                                                    ? "bg-green-100 text-green-800"
                                                                    : metric.trend.startsWith("-")
                                                                        ? "bg-red-100 text-red-800"
                                                                        : "bg-gray-100 text-gray-800", children: metric.trend })] }), _jsx("div", { className: "text-sm font-medium text-gray-600 mb-2", children: metric.name }), _jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("span", { className: `text-xl font-bold ${getScoreColor(metric.score)}`, children: [metric.score, "%"] }) }), _jsx(Progress, { value: metric.score, className: "h-2" })] }) }, metric.key));
                                    }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Code, { className: "h-5 w-5" }), _jsx("span", { children: "Code Quality Breakdown" })] }) }), _jsx(CardContent, { className: "space-y-4", children: [
                                                        { name: "Cyclomatic Complexity", score: 82, target: 85 },
                                                        { name: "Code Duplication", score: 88, target: 90 },
                                                        { name: "Technical Debt Ratio", score: 75, target: 80 },
                                                        { name: "Code Smells", score: 78, target: 85 },
                                                    ].map((item) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: item.name }), _jsxs("span", { className: "font-medium", children: [item.score, "% / ", item.target, "%"] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Progress, { value: item.score, className: "flex-1" }), _jsx(Progress, { value: item.target, className: "flex-1 opacity-30" })] })] }, item.name))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(TestTube, { className: "h-5 w-5" }), _jsx("span", { children: "Testing Metrics" })] }) }), _jsx(CardContent, { className: "space-y-4", children: [
                                                        { name: "Unit Test Coverage", score: 82, total: 1250 },
                                                        { name: "Integration Tests", score: 65, total: 180 },
                                                        { name: "E2E Test Coverage", score: 45, total: 85 },
                                                        { name: "Performance Tests", score: 30, total: 25 },
                                                    ].map((item) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: item.name }), _jsxs("span", { className: "font-medium", children: [item.score, "% (", item.total, " tests)"] })] }), _jsx(Progress, { value: item.score, className: "h-2" })] }, item.name))) })] })] })] }), _jsxs(TabsContent, { value: "security", className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Security Assessment" }), _jsx("p", { className: "text-sm text-gray-600", children: "10 security domains with comprehensive risk identification" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: securityDomains.map((domain) => {
                                        const IconComponent = getSecurityIcon(domain.key);
                                        return (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx(IconComponent, { className: "h-5 w-5 text-blue-600" }), _jsxs(Badge, { className: domain.risk === "Low"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : domain.risk === "Medium"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800", children: [domain.risk, " Risk"] })] }), _jsx("div", { className: "text-xs font-medium text-gray-600 mb-2", children: domain.name }), _jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("span", { className: `text-lg font-bold ${getScoreColor(domain.score)}`, children: [domain.score, "%"] }) }), _jsx(Progress, { value: domain.score, className: "h-2" })] }) }, domain.key));
                                    }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsx("span", { children: "Risk Assessment Matrix" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                            { level: "Critical", count: securityDomains.filter(d => d.risk === "High" && d.score < 70).length, color: "red" },
                                                            { level: "High", count: securityDomains.filter(d => d.risk === "High").length, color: "orange" },
                                                            { level: "Medium", count: securityDomains.filter(d => d.risk === "Medium").length, color: "yellow" },
                                                            { level: "Low", count: securityDomains.filter(d => d.risk === "Low").length, color: "green" },
                                                        ].map((risk) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full bg-${risk.color}-500` }), _jsxs("span", { className: "font-medium", children: [risk.level, " Risk"] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-lg font-bold", children: risk.count }), _jsx("span", { className: "text-sm text-gray-500", children: "domains" })] })] }, risk.level))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Eye, { className: "h-5 w-5" }), _jsx("span", { children: "Security Recommendations" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [
                                                            "Implement advanced threat detection for incident response",
                                                            "Enhance vulnerability scanning automation",
                                                            "Strengthen API security with rate limiting",
                                                            "Improve network segmentation controls",
                                                            "Update security training for all team members",
                                                        ].map((recommendation, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: recommendation })] }, index))) }) })] })] }), validationResult?.security && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5" }), _jsx("span", { children: "Security Controls" })] }), _jsx(CardDescription, { children: "Current security control effectiveness" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: validationResult.securityPosture?.securityControls &&
                                                                    Object.entries(validationResult.securityPosture.securityControls).map(([control, score]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium capitalize", children: control.replace(/([A-Z])/g, " $1").trim() }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: score, className: "w-20" }), _jsxs("span", { className: `text-sm font-bold ${getScoreColor(score)}`, children: [score, "%"] })] })] }, control))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Eye, { className: "h-5 w-5" }), _jsx("span", { children: "Security Posture" })] }), _jsx(CardDescription, { children: "Overall security assessment and threat level" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Posture" }), _jsx(Badge, { className: validationResult.securityPosture
                                                                                    ?.overallPosture === "STRONG"
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : validationResult.securityPosture
                                                                                        ?.overallPosture === "MODERATE"
                                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                                        : "bg-red-100 text-red-800", children: validationResult.securityPosture?.overallPosture ||
                                                                                    "UNKNOWN" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Threat Level" }), _jsx(Badge, { className: validationResult.securityPosture?.threatLevel ===
                                                                                    "LOW"
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : validationResult.securityPosture
                                                                                        ?.threatLevel === "MEDIUM"
                                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                                        : "bg-red-100 text-red-800", children: validationResult.securityPosture?.threatLevel ||
                                                                                    "UNKNOWN" })] }), validationResult.securityPosture?.vulnerabilities && (_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Vulnerabilities" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Critical:" }), _jsx("span", { className: "font-bold text-red-600", children: validationResult.securityPosture
                                                                                                    .vulnerabilities.critical })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "High:" }), _jsx("span", { className: "font-bold text-orange-600", children: validationResult.securityPosture
                                                                                                    .vulnerabilities.high })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Medium:" }), _jsx("span", { className: "font-bold text-yellow-600", children: validationResult.securityPosture
                                                                                                    .vulnerabilities.medium })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Low:" }), _jsx("span", { className: "font-bold text-green-600", children: validationResult.securityPosture
                                                                                                    .vulnerabilities.low })] })] })] }))] }) })] })] }), validationResult.security.criticalIssues.length > 0 && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Critical Security Issues" }), _jsx(AlertDescription, { children: _jsx("ul", { className: "mt-2 space-y-1", children: validationResult.security.criticalIssues
                                                            .slice(0, 10)
                                                            .map((issue, index) => (_jsxs("li", { className: "text-sm", children: ["\u2022 ", issue] }, index))) }) })] }))] }))] }), _jsx(TabsContent, { value: "risks", className: "space-y-4", children: validationResult?.riskAssessment && (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Target, { className: "h-5 w-5" }), _jsx("span", { children: "Risk Assessment Overview" })] }), _jsx(CardDescription, { children: "Comprehensive risk analysis across all domains" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-3xl font-bold ${getScoreColor(100 - validationResult.riskAssessment.overallRisk)}`, children: [validationResult.riskAssessment.overallRisk, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Overall Risk" }), _jsx(Badge, { className: validationResult.riskAssessment.riskLevel === "LOW"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : validationResult.riskAssessment.riskLevel ===
                                                                        "MEDIUM"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800", children: validationResult.riskAssessment.riskLevel })] }) }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(validationResult.riskAssessment.riskFactors).map(([riskType, riskData]) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm capitalize", children: riskType.replace(/([A-Z])/g, " $1").trim() }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Risk Score" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: riskData.score, className: "w-16" }), _jsxs("span", { className: `text-sm font-bold ${getScoreColor(100 - riskData.score)}`, children: [riskData.score, "%"] })] })] }), _jsxs(Badge, { className: riskData.level === "LOW"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : riskData.level === "MEDIUM"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800", children: [riskData.level, " RISK"] }), _jsx("div", { className: "space-y-1", children: riskData.factors
                                                                    .slice(0, 3)
                                                                    .map((factor, index) => (_jsxs("div", { className: "text-xs text-gray-600", children: ["\u2022 ", factor] }, index))) })] }) })] }, riskType))) }), validationResult.riskAssessment.mitigationStrategies.length >
                                        0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Risk Mitigation Strategies" }), _jsx(CardDescription, { children: "Recommended actions to reduce identified risks" })] }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: validationResult.riskAssessment.mitigationStrategies.map((strategy, index) => (_jsxs("li", { className: "flex items-start space-x-2", children: [_jsx(Zap, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: strategy })] }, index))) }) })] }))] })) }), _jsx(TabsContent, { value: "compliance", className: "space-y-4", children: validationResult?.complianceMatrix && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: Object.entries(validationResult.complianceMatrix).map(([complianceType, complianceData]) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-sm capitalize flex items-center space-x-2", children: [_jsx(Lock, { className: "h-4 w-4" }), _jsx("span", { children: complianceType.replace(/([A-Z])/g, " $1").trim() })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Score" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: complianceData.score, className: "w-20" }), _jsxs("span", { className: `text-sm font-bold ${getScoreColor(complianceData.score)}`, children: [complianceData.score, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Status" }), _jsx(Badge, { className: complianceData.status === "COMPLIANT"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : complianceData.status === "IN_PROGRESS"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800", children: complianceData.status })] }), complianceData.requirements && (_jsxs("div", { className: "text-xs text-gray-600", children: [_jsxs("div", { children: ["Requirements:", " ", complianceData.requirements.completed, "/", complianceData.requirements.total] }), _jsxs("div", { children: ["Pending: ", complianceData.requirements.pending] })] })), complianceData.certification && (_jsxs("div", { className: "text-xs text-gray-600", children: ["Certification: ", complianceData.certification] })), complianceData.nextAudit && (_jsxs("div", { className: "text-xs text-gray-600", children: ["Next Audit: ", complianceData.nextAudit] }))] }) })] }, complianceType))) })) }), _jsxs(TabsContent, { value: "tasks", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Task Management" }), _jsx("p", { className: "text-sm text-gray-600", children: "Prioritized subtasks with effort estimation" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search tasks...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 w-64" })] }), _jsxs(Select, { value: taskFilter, onValueChange: setTaskFilter, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Priorities" }), _jsx(SelectItem, { value: "critical", children: "Critical" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "low", children: "Low" })] })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
                                        { label: "Critical", count: filteredSubtasks.filter(t => t.priority === 'critical').length, color: "red" },
                                        { label: "High Priority", count: filteredSubtasks.filter(t => t.priority === 'high').length, color: "orange" },
                                        { label: "Medium Priority", count: filteredSubtasks.filter(t => t.priority === 'medium').length, color: "yellow" },
                                        { label: "Low Priority", count: filteredSubtasks.filter(t => t.priority === 'low').length, color: "green" },
                                    ].map((item) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: item.label }), _jsx("div", { className: `text-2xl font-bold text-${item.color}-600`, children: item.count })] }), _jsx("div", { className: `p-2 rounded-full bg-${item.color}-100`, children: _jsx(AlertTriangle, { className: `h-5 w-5 text-${item.color}-600` }) })] }) }) }, item.label))) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("span", { children: ["Task List (", filteredSubtasks.length, ")"] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Total Effort: ", filteredSubtasks.reduce((acc, task) => acc + task.estimatedHours, 0), "h"] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: filteredSubtasks.slice(0, 20).map((subtask) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "font-medium text-sm", children: subtask.title }), _jsx(Badge, { className: getPriorityColor(subtask.priority), children: subtask.priority })] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1 flex items-center space-x-4", children: [_jsx("span", { children: subtask.category }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { children: [subtask.estimatedHours, "h estimated"] })] }), subtask.assignedTo && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center space-x-1", children: [_jsx(User, { className: "h-3 w-3" }), _jsx("span", { children: subtask.assignedTo })] })] }))] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Select, { value: subtask.status, onValueChange: (value) => updateSubtaskStatus(subtask.id, value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "in-progress", children: "In Progress" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "blocked", children: "Blocked" })] })] }) })] }, subtask.id))) }), filteredSubtasks.length > 20 && (_jsxs("div", { className: "text-center mt-4", children: [_jsxs("p", { className: "text-sm text-gray-500", children: ["Showing 20 of ", filteredSubtasks.length, " tasks"] }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-2", children: "Load More" })] }))] })] })] }), _jsxs(TabsContent, { value: "analytics", className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Platform Analytics" }), _jsx("p", { className: "text-sm text-gray-600", children: "Comprehensive insights and trend analysis" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
                                        { name: "Validation Runs", value: "1,247", change: "+12%", icon: Activity },
                                        { name: "Issues Resolved", value: "89", change: "+25%", icon: CheckCircle },
                                        { name: "Avg Response Time", value: "2.3s", change: "-8%", icon: Clock },
                                        { name: "System Uptime", value: "99.9%", change: "+0.1%", icon: Server },
                                    ].map((metric) => {
                                        const IconComponent = metric.icon;
                                        return (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(IconComponent, { className: "h-5 w-5 text-blue-600" }), _jsx(Badge, { className: metric.change.startsWith("+")
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800", children: metric.change })] }), _jsx("div", { className: "text-sm font-medium text-gray-600 mb-1", children: metric.name }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: metric.value })] }) }, metric.name));
                                    }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Platform Health Trend" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center bg-gray-50 rounded-lg", children: _jsxs("div", { className: "text-center", children: [_jsx(BarChart3, { className: "h-12 w-12 text-gray-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-500", children: "Health trend chart would be displayed here" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Security Score Trend" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center bg-gray-50 rounded-lg", children: _jsxs("div", { className: "text-center", children: [_jsx(TrendingUp, { className: "h-12 w-12 text-gray-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-500", children: "Security trend chart would be displayed here" })] }) }) })] })] })] }), _jsxs(TabsContent, { value: "settings", className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Dashboard Settings" }), _jsx("p", { className: "text-sm text-gray-600", children: "Configure validation parameters and preferences" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Validation Settings" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Real-time Monitoring" }), _jsx("div", { className: "text-sm text-gray-500", children: "Enable automatic validation every 30 seconds" })] }), _jsx(Button, { onClick: () => setRealTimeMode(!realTimeMode), variant: realTimeMode ? "default" : "outline", size: "sm", children: realTimeMode ? "Enabled" : "Disabled" })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Validation Depth" }), _jsxs(Select, { defaultValue: "comprehensive", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "basic", children: "Basic Validation" }), _jsx(SelectItem, { value: "standard", children: "Standard Validation" }), _jsx(SelectItem, { value: "comprehensive", children: "Comprehensive Validation" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Alert Threshold" }), _jsxs(Select, { defaultValue: "medium", children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsxs(SelectItem, { value: "low", children: ["Low (Score ", _jsx(, {}), " 90%)"] }), _jsxs(SelectItem, { value: "medium", children: ["Medium (Score ", _jsx(, {}), " 80%)"] }), _jsxs(SelectItem, { value: "high", children: ["High (Score ", _jsx(, {}), " 70%)"] })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Notification Preferences" }) }), _jsx(CardContent, { className: "space-y-4", children: [
                                                        { name: "Critical Issues", enabled: true },
                                                        { name: "Security Alerts", enabled: true },
                                                        { name: "Performance Degradation", enabled: false },
                                                        { name: "Compliance Updates", enabled: true },
                                                        { name: "Weekly Reports", enabled: false },
                                                    ].map((notification) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: notification.name }), _jsx(Button, { variant: notification.enabled ? "default" : "outline", size: "sm", children: notification.enabled ? "On" : "Off" })] }, notification.name))) })] })] })] }), _jsxs(TabsContent, { value: "enhancements", className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Platform Enhancement Plan" }), _jsx("p", { className: "text-sm text-gray-600", children: "Comprehensive enhancement roadmap with prioritized improvements" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Target, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { children: "Infrastructure Enhancements" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [
                                                            { name: "Database Optimization", priority: "high", effort: "40h" },
                                                            { name: "API Performance", priority: "high", effort: "32h" },
                                                            { name: "Caching Strategy", priority: "medium", effort: "24h" },
                                                            { name: "Load Balancing", priority: "medium", effort: "16h" },
                                                        ].map((item) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: item.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [item.effort, " estimated"] })] }), _jsx(Badge, { className: getPriorityColor(item.priority), children: item.priority })] }, item.name))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-green-600" }), _jsx("span", { children: "Security Enhancements" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [
                                                            { name: "Advanced Threat Detection", priority: "critical", effort: "48h" },
                                                            { name: "Zero Trust Architecture", priority: "high", effort: "56h" },
                                                            { name: "Compliance Automation", priority: "high", effort: "32h" },
                                                            { name: "Security Training", priority: "medium", effort: "16h" },
                                                        ].map((item) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: item.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [item.effort, " estimated"] })] }), _jsx(Badge, { className: getPriorityColor(item.priority), children: item.priority })] }, item.name))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "h-5 w-5 text-purple-600" }), _jsx("span", { children: "User Experience" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [
                                                            { name: "Mobile Optimization", priority: "high", effort: "40h" },
                                                            { name: "Accessibility Compliance", priority: "high", effort: "32h" },
                                                            { name: "Performance Optimization", priority: "medium", effort: "24h" },
                                                            { name: "User Interface Refresh", priority: "low", effort: "48h" },
                                                        ].map((item) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: item.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [item.effort, " estimated"] })] }), _jsx(Badge, { className: getPriorityColor(item.priority), children: item.priority })] }, item.name))) }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Implementation Timeline" }), _jsx(CardDescription, { children: "Phased approach to platform enhancement implementation" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                    {
                                                        phase: "Phase 1: Critical Security & Performance",
                                                        duration: "4-6 weeks",
                                                        items: [
                                                            "Advanced Threat Detection Implementation",
                                                            "Database Optimization",
                                                            "API Performance Enhancements",
                                                            "Critical Security Patches"
                                                        ]
                                                    },
                                                    {
                                                        phase: "Phase 2: Infrastructure & Compliance",
                                                        duration: "6-8 weeks",
                                                        items: [
                                                            "Zero Trust Architecture",
                                                            "Compliance Automation",
                                                            "Caching Strategy Implementation",
                                                            "Load Balancing Setup"
                                                        ]
                                                    },
                                                    {
                                                        phase: "Phase 3: User Experience & Mobile",
                                                        duration: "4-6 weeks",
                                                        items: [
                                                            "Mobile Optimization",
                                                            "Accessibility Compliance",
                                                            "Performance Optimization",
                                                            "User Interface Improvements"
                                                        ]
                                                    }
                                                ].map((phase, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "font-semibold text-lg", children: phase.phase }), _jsx(Badge, { variant: "outline", children: phase.duration })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: phase.items.map((item, itemIndex) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-blue-500" }), _jsx("span", { className: "text-sm", children: item })] }, itemIndex))) })] }, index))) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Resource Requirements" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                            { role: "Senior Security Engineer", allocation: "Full-time", duration: "12 weeks" },
                                                            { role: "DevOps Engineer", allocation: "Full-time", duration: "8 weeks" },
                                                            { role: "Frontend Developer", allocation: "Part-time", duration: "6 weeks" },
                                                            { role: "QA Engineer", allocation: "Part-time", duration: "14 weeks" },
                                                        ].map((resource, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: resource.role }), _jsxs("div", { className: "text-sm text-gray-500", children: [resource.allocation, " for ", resource.duration] })] }), _jsx(Badge, { variant: "secondary", children: resource.allocation })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Success Metrics" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [
                                                            { metric: "Security Score", current: "88%", target: "95%" },
                                                            { metric: "Performance Score", current: "75%", target: "90%" },
                                                            { metric: "Compliance Score", current: "92%", target: "98%" },
                                                            { metric: "User Satisfaction", current: "4.2/5", target: "4.7/5" },
                                                        ].map((metric, index) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: metric.metric }), _jsxs("span", { children: [metric.current, " \u2192 ", metric.target] })] }), _jsx(Progress, { value: parseFloat(metric.current.replace('%', '').replace('/5', '')) * (metric.current.includes('/5') ? 20 : 1), className: "h-2" })] }, index))) }) })] })] })] }), _jsx(TabsContent, { value: "recommendations", className: "space-y-4", children: (validationResult || platformValidatorResult) && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-red-600", children: "Immediate Actions" }), _jsx(CardDescription, { children: "Critical issues requiring immediate attention" })] }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: (platformValidatorResult?.actionItems.immediate ||
                                                        validationResult?.criticalIssues.slice(0, 5) ||
                                                        []).map((item, index) => (_jsxs("li", { className: "flex items-start space-x-2", children: [_jsx(XCircle, { className: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: item })] }, index))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-yellow-600", children: "Short-term Goals" }), _jsx(CardDescription, { children: "Improvements to implement within 1-3 months" })] }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: (platformValidatorResult?.actionItems.shortTerm ||
                                                        validationResult?.gaps.slice(0, 5) ||
                                                        []).map((item, index) => (_jsxs("li", { className: "flex items-start space-x-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: item })] }, index))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-green-600", children: "Long-term Vision" }), _jsx(CardDescription, { children: "Strategic enhancements for future growth" })] }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: (platformValidatorResult?.actionItems.longTerm ||
                                                        validationResult?.recommendations.slice(0, 5) ||
                                                        []).map((item, index) => (_jsxs("li", { className: "flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: item })] }, index))) }) })] })] })) })] })] }) }));
};
export default PlatformRobustnessValidator;
