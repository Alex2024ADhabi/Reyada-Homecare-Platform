import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, CheckCircle, Clock, AlertTriangle, Settings, Zap, RefreshCw, ArrowRight, Users, FileText, Target, BarChart3, Activity, Brain, Shield, Truck, MapPin, TrendingUp, } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { workflowAutomationService } from "@/services/workflow-automation.service";
export default function WorkflowAutomationEngine({ facilityId = "RHHCS-001", patientId, }) {
    const [workflows, setWorkflows] = useState([
        {
            id: "patient-journey-001",
            name: "Complete Patient Journey",
            description: "End-to-end automation from referral to discharge with AI optimization",
            category: "patient_journey",
            totalDuration: 180,
            automationPercentage: 92,
            successRate: 97.5,
            patientComplexityScore: 85,
            staffMatchingScore: 94,
            routeOptimization: 88,
            jawdaKPIScore: 96,
            steps: [
                {
                    id: "step-001",
                    name: "Referral Intake & Validation",
                    description: "Automated referral processing with DOH compliance validation",
                    status: "completed",
                    duration: 15,
                    automationLevel: 95,
                    dependencies: [],
                    completedAt: "2024-12-18T09:00:00Z",
                },
                {
                    id: "step-002",
                    name: "Eligibility & Insurance Verification",
                    description: "Real-time insurance verification with Daman/Thiqa integration",
                    status: "completed",
                    duration: 10,
                    automationLevel: 100,
                    dependencies: ["step-001"],
                    completedAt: "2024-12-18T09:15:00Z",
                },
                {
                    id: "step-003",
                    name: "Patient Complexity Assessment",
                    description: "Multi-dimensional complexity scoring with risk stratification",
                    status: "completed",
                    duration: 20,
                    automationLevel: 85,
                    dependencies: ["step-002"],
                    assignedTo: "AI Assessment Engine",
                    completedAt: "2024-12-18T09:35:00Z",
                },
                {
                    id: "step-004",
                    name: "Staff-Patient-Vehicle Matching",
                    description: "AI-powered 8-factor matching algorithm with route optimization",
                    status: "in_progress",
                    duration: 25,
                    automationLevel: 90,
                    dependencies: ["step-003"],
                    assignedTo: "Resource Optimization Engine",
                },
                {
                    id: "step-005",
                    name: "Care Plan Development",
                    description: "AI-assisted care plan creation with clinical guidelines",
                    status: "pending",
                    duration: 30,
                    automationLevel: 80,
                    dependencies: ["step-004"],
                },
                {
                    id: "step-006",
                    name: "Dynamic Scheduling & Route Optimization",
                    description: "Genetic algorithm-based scheduling with real-time traffic data",
                    status: "pending",
                    duration: 15,
                    automationLevel: 95,
                    dependencies: ["step-005"],
                },
                {
                    id: "step-007",
                    name: "Service Delivery Monitoring",
                    description: "Real-time service delivery tracking with mobile integration",
                    status: "pending",
                    duration: 0,
                    automationLevel: 75,
                    dependencies: ["step-006"],
                },
                {
                    id: "step-008",
                    name: "JAWDA KPI Tracking",
                    description: "Patient-level KPI monitoring with predictive analytics",
                    status: "pending",
                    duration: 0,
                    automationLevel: 100,
                    dependencies: ["step-007"],
                },
                {
                    id: "step-009",
                    name: "Quality Assurance & Compliance",
                    description: "Automated quality checks with DOH compliance validation",
                    status: "pending",
                    duration: 20,
                    automationLevel: 95,
                    dependencies: ["step-008"],
                },
                {
                    id: "step-010",
                    name: "Outcome Prediction & Discharge Planning",
                    description: "ML-powered outcome prediction with automated discharge planning",
                    status: "pending",
                    duration: 25,
                    automationLevel: 85,
                    dependencies: ["step-009"],
                },
            ],
        },
        {
            id: "operational-intelligence-001",
            name: "Real-time Operational Intelligence",
            description: "Live operational monitoring with predictive analytics",
            category: "operational_intelligence",
            totalDuration: 1440, // 24 hours continuous
            automationPercentage: 98,
            successRate: 99.2,
            steps: [
                {
                    id: "oi-001",
                    name: "Live Metrics Collection",
                    description: "Real-time data collection from all operational systems",
                    status: "in_progress",
                    duration: 1440,
                    automationLevel: 100,
                    dependencies: [],
                },
                {
                    id: "oi-002",
                    name: "Predictive Analytics Engine",
                    description: "ML-powered demand forecasting and risk prediction",
                    status: "in_progress",
                    duration: 1440,
                    automationLevel: 95,
                    dependencies: ["oi-001"],
                },
                {
                    id: "oi-003",
                    name: "Emergency Alert System",
                    description: "Automated emergency detection and response coordination",
                    status: "in_progress",
                    duration: 1440,
                    automationLevel: 100,
                    dependencies: ["oi-002"],
                },
            ],
        },
        {
            id: "quality-assurance-001",
            name: "31-Day Quality Assurance Cycle",
            description: "Automated quality monitoring with JAWDA compliance",
            category: "quality_assurance",
            totalDuration: 44640, // 31 days in minutes
            automationPercentage: 94,
            successRate: 98.8,
            steps: [
                {
                    id: "qa-001",
                    name: "Daily Quality Assessments",
                    description: "Automated daily quality checks with scoring",
                    status: "in_progress",
                    duration: 1440,
                    automationLevel: 95,
                    dependencies: [],
                },
                {
                    id: "qa-002",
                    name: "Weekly Performance Analysis",
                    description: "Comprehensive performance analysis with trend identification",
                    status: "pending",
                    duration: 10080,
                    automationLevel: 90,
                    dependencies: ["qa-001"],
                },
                {
                    id: "qa-003",
                    name: "Monthly Compliance Report",
                    description: "DOH and JAWDA compliance report generation",
                    status: "pending",
                    duration: 44640,
                    automationLevel: 92,
                    dependencies: ["qa-002"],
                },
            ],
        },
    ]);
    const [activeWorkflow, setActiveWorkflow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [operationalMetrics, setOperationalMetrics] = useState({
        totalActiveWorkflows: 45,
        fullyAutomatedSteps: 78,
        semiAutomatedSteps: 32,
        manualSteps: 12,
        averageAutomationScore: 92.5,
        averageQualityScore: 96.2,
        timesSaved: 186, // hours per week
        errorReduction: 73, // percentage
        patientSatisfactionImprovement: 15, // percentage
        costReduction: 28, // percentage
    });
    useEffect(() => {
        const interval = setInterval(() => {
            refreshMetrics();
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const refreshMetrics = async () => {
        setLoading(true);
        try {
            // Simulate real-time updates with enhanced operational intelligence
            setWorkflows((prev) => prev.map((workflow) => ({
                ...workflow,
                steps: workflow.steps.map((step) => ({
                    ...step,
                    duration: step.status === "in_progress"
                        ? Math.max(0, step.duration - Math.random() * 2)
                        : step.duration,
                })),
            })));
            // Update operational metrics
            setOperationalMetrics((prev) => ({
                ...prev,
                averageAutomationScore: Math.min(100, prev.averageAutomationScore + Math.random() * 0.5),
                averageQualityScore: Math.min(100, prev.averageQualityScore + Math.random() * 0.3),
                timesSaved: prev.timesSaved + Math.floor(Math.random() * 2),
            }));
        }
        catch (error) {
            console.error("Error refreshing workflow data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const executeWorkflow = async (workflowId) => {
        setLoading(true);
        setActiveWorkflow(workflowId);
        try {
            // Execute workflow using the automation service
            const execution = await workflowAutomationService.executeWorkflow(workflowId, { facilityId, patientId }, { priority: "high" });
            // Update workflow status based on execution
            setWorkflows((prev) => prev.map((workflow) => {
                if (workflow.id === workflowId) {
                    const updatedSteps = workflow.steps.map((step, index) => {
                        if (index === 0 && step.status === "pending") {
                            return { ...step, status: "in_progress" };
                        }
                        return step;
                    });
                    return { ...workflow, steps: updatedSteps };
                }
                return workflow;
            }));
        }
        catch (error) {
            console.error("Error executing workflow:", error);
        }
        finally {
            setLoading(false);
            setActiveWorkflow(null);
        }
    };
    const optimizeWorkflow = async (workflowId) => {
        setLoading(true);
        try {
            const optimization = await workflowAutomationService.optimizeWorkflow(workflowId);
            console.log("Workflow optimization results:", optimization);
            // Update UI with optimization results
        }
        catch (error) {
            console.error("Error optimizing workflow:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
            case "in_progress":
                return _jsx(Clock, { className: "w-4 h-4 text-blue-600 animate-pulse" });
            case "failed":
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-red-600" });
            case "pending":
                return _jsx(Clock, { className: "w-4 h-4 text-gray-400" });
            default:
                return _jsx(Clock, { className: "w-4 h-4 text-gray-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-600 bg-green-100";
            case "in_progress":
                return "text-blue-600 bg-blue-100";
            case "failed":
                return "text-red-600 bg-red-100";
            case "pending":
                return "text-gray-600 bg-gray-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case "patient_journey":
                return _jsx(Users, { className: "w-4 h-4" });
            case "resource_management":
                return _jsx(Settings, { className: "w-4 h-4" });
            case "quality_assurance":
                return _jsx(Target, { className: "w-4 h-4" });
            case "compliance":
                return _jsx(FileText, { className: "w-4 h-4" });
            case "operational_intelligence":
                return _jsx(Brain, { className: "w-4 h-4" });
            default:
                return _jsx(Zap, { className: "w-4 h-4" });
        }
    };
    const calculateOverallProgress = (steps) => {
        const completedSteps = steps.filter((step) => step.status === "completed").length;
        return Math.round((completedSteps / steps.length) * 100);
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [_jsx(Zap, { className: "w-8 h-8 mr-3 text-purple-600" }), "Workflow Automation Engine"] }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["AI-powered end-to-end workflow automation with operational intelligence for ", facilityId] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(Brain, { className: "w-3 h-3" }), "AI-Optimized"] }), _jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(BarChart3, { className: "w-3 h-3" }), operationalMetrics.totalActiveWorkflows, " Active"] }), _jsxs(Button, { onClick: refreshMetrics, variant: "outline", size: "sm", disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4" }), "Automation Score"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [operationalMetrics.averageAutomationScore.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-purple-600", children: "AI-powered optimization" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Quality Score"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [operationalMetrics.averageQualityScore.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-blue-600", children: "JAWDA compliance" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Time Saved"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [operationalMetrics.timesSaved, "h"] }), _jsx("p", { className: "text-xs text-green-600", children: "Per week automation" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "Cost Reduction"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-orange-900", children: [operationalMetrics.costReduction, "%"] }), _jsx("p", { className: "text-xs text-orange-600", children: "Operational savings" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "workflows", children: "Active Workflows" }), _jsx(TabsTrigger, { value: "intelligence", children: "AI Intelligence" }), _jsx(TabsTrigger, { value: "optimization", children: "Optimization" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: workflows.map((workflow) => (_jsxs(Card, { className: "border-l-4 border-l-purple-400", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getCategoryIcon(workflow.category), _jsx(CardTitle, { className: "text-lg", children: workflow.name })] }), _jsx(Badge, { variant: "outline", children: workflow.category.replace("_", " ") })] }), _jsx(CardDescription, { children: workflow.description })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [calculateOverallProgress(workflow.steps), "%"] })] }), _jsx(Progress, { value: calculateOverallProgress(workflow.steps), className: "h-2" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Automation:" }), _jsxs("span", { className: "font-medium ml-1", children: [workflow.automationPercentage, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Success Rate:" }), _jsxs("span", { className: "font-medium ml-1", children: [workflow.successRate, "%"] })] })] }), workflow.category === "patient_journey" && (_jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Complexity Score:" }), _jsxs("span", { className: "font-medium ml-1", children: [workflow.patientComplexityScore, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Staff Matching:" }), _jsxs("span", { className: "font-medium ml-1", children: [workflow.staffMatchingScore, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Route Optimization:" }), _jsxs("span", { className: "font-medium ml-1", children: [workflow.routeOptimization, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "JAWDA KPI:" }), _jsxs("span", { className: "font-medium ml-1", children: [workflow.jawdaKPIScore, "%"] })] })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { size: "sm", onClick: () => executeWorkflow(workflow.id), disabled: loading && activeWorkflow === workflow.id, children: [loading && activeWorkflow === workflow.id ? (_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" })) : (_jsx(Play, { className: "w-4 h-4 mr-2" })), "Execute"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => optimizeWorkflow(workflow.id), children: [_jsx(Brain, { className: "w-4 h-4 mr-2" }), "Optimize"] })] })] }) })] }, workflow.id))) }) }), _jsx(TabsContent, { value: "workflows", className: "space-y-6", children: workflows.map((workflow) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [getCategoryIcon(workflow.category), workflow.name] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { className: "text-purple-600 bg-purple-100", children: [workflow.automationPercentage, "% Automated"] }), _jsxs(Badge, { variant: "outline", children: [calculateOverallProgress(workflow.steps), "% Complete"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: workflow.steps.map((step, index) => (_jsxs("div", { className: "flex items-center gap-4 p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(step.status), _jsx("span", { className: "text-sm font-medium", children: index + 1 })] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-medium", children: step.name }), _jsx(Badge, { className: getStatusColor(step.status), children: step.status.replace("_", " ").toUpperCase() })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: step.description }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: [_jsxs("span", { children: ["Duration: ", step.duration, "min"] }), _jsxs("span", { children: ["Automation: ", step.automationLevel, "%"] }), step.assignedTo && (_jsxs("span", { children: ["Assigned: ", step.assignedTo] }))] })] }), index < workflow.steps.length - 1 && (_jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" }))] }, step.id))) }) })] }, workflow.id))) }), _jsx(TabsContent, { value: "intelligence", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI-Powered Insights" }), _jsx(CardDescription, { children: "Machine learning insights and predictions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Brain, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Demand Prediction" }), _jsx(AlertDescription, { className: "text-blue-700", children: "AI predicts 18% increase in service requests next week. Recommend increasing staff allocation by 12%." })] }), _jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(Target, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Optimization Opportunity" }), _jsx(AlertDescription, { className: "text-green-700", children: "Route optimization algorithm identified 23% efficiency improvement in Zone B operations." })] }), _jsxs(Alert, { className: "bg-purple-50 border-purple-200", children: [_jsx(Users, { className: "h-4 w-4 text-purple-600" }), _jsx(AlertTitle, { className: "text-purple-800", children: "Staff Matching Enhancement" }), _jsx(AlertDescription, { className: "text-purple-700", children: "AI matching improved patient satisfaction by 15% through better staff-patient compatibility." })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Predictive Analytics" }), _jsx(CardDescription, { children: "Real-time predictions and risk assessments" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Patient Risk Prediction" })] }), _jsx("span", { className: "text-sm font-bold", children: "94.2% Accuracy" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Route Optimization" })] }), _jsx("span", { className: "text-sm font-bold", children: "-18% Travel Time" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Quality Prediction" })] }), _jsx("span", { className: "text-sm font-bold", children: "96.8% Success" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Optimization" }), _jsx(CardDescription, { children: "AI-driven performance improvements" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Workflow Efficiency" })] }), _jsx("span", { className: "text-sm font-bold", children: "+32% Improvement" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Resource Utilization" })] }), _jsx("span", { className: "text-sm font-bold", children: "87.5% Optimal" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Quality Score" })] }), _jsx("span", { className: "text-sm font-bold", children: "96.2% Average" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cost Optimization" }), _jsx(CardDescription, { children: "Financial impact of automation" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-4 h-4 text-orange-600" }), _jsx("span", { className: "text-sm font-medium", children: "Operational Costs" })] }), _jsx("span", { className: "text-sm font-bold text-green-600", children: "-28% Reduction" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Staff Productivity" })] }), _jsx("span", { className: "text-sm font-bold text-green-600", children: "+45% Increase" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4 text-red-600" }), _jsx("span", { className: "text-sm font-medium", children: "Error Reduction" })] }), _jsx("span", { className: "text-sm font-bold text-green-600", children: "-73% Errors" })] })] }) })] })] }) })] })] }) }));
}
