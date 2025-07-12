import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  Database,
  Smartphone,
  FileText,
  Workflow,
  Users,
  BarChart3,
  Activity,
  Target,
  Zap,
  Eye,
  Lock,
  Server,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Filter,
  Search,
  Calendar,
  User,
  Code,
  TestTube,
  BookOpen,
  Gauge,
  Bug,
  GitBranch,
  Layers,
  Network,
  Globe,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";

interface ValidationResult {
  overallScore: number;
  healthStatus: string;
  validationTimestamp: string;
  completeness: any;
  quality: any;
  regulatory: any;
  organization: any;
  integration: any;
  workflows: any;
  frontend: any;
  backend: any;
  security: any;
  backupRecovery: any;
  gaps: string[];
  criticalIssues: string[];
  recommendations: string[];
  pendingSubtasks: string[];
  riskAssessment: any;
  complianceMatrix: any;
  performanceMetrics: any;
  securityPosture: any;
}

interface PlatformValidatorResult {
  overallScore: number;
  healthStatus: string;
  validationResults: {
    platformRobustness: ValidationResult;
    schemaValidation: any;
    mobileAccessibility: any;
    exportCapabilities: any;
    documentIntegration: any;
    implementationPlan: any;
  };
  consolidatedFindings: {
    totalGaps: number;
    criticalIssues: number;
    pendingSubtasks: number;
    recommendations: number;
  };
  actionItems: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface Subtask {
  id: string;
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: string;
  estimatedHours: number;
  dependencies: string[];
  assignedTo: string | null;
  dueDate: string | null;
}

const PlatformRobustnessValidator: React.FC = () => {
  // Add error boundary for this component
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (error: Error) => {
      console.error('PlatformRobustnessValidator error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Component Error</h1>
          <p className="text-gray-600 mb-4">There was an error loading the Platform Robustness Validator.</p>
          <button 
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [platformValidatorResult, setPlatformValidatorResult] =
    useState<PlatformValidatorResult | null>(null);
  const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [securityAssessment, setSecurityAssessment] = useState<any>(null);
  const [enhancementPlan, setEnhancementPlan] = useState<any>(null);
  const [implementationProgress, setImplementationProgress] = useState<any>(null);

  const runRobustnessValidation = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/doh-audit/platform-robustness-validation",
      );
      const data = await response.json();
      if (data.success) {
        setValidationResult(data.validation);
      }
    } catch (error) {
      console.error("Error running robustness validation:", error);
    } finally {
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
    } catch (error) {
      console.error("Error running platform validator:", error);
    } finally {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error generating enhancement plan:", error);
    } finally {
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
    } catch (error) {
      console.error("Error fetching implementation progress:", error);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, status: string) => {
    try {
      const response = await fetch(`/api/doh-audit/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchPendingSubtasks();
      }
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  const generateRobustnessReport = async () => {
    try {
      const response = await fetch(
        "/api/doh-audit/generate-robustness-report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format: "json", includeDetails: true }),
        },
      );
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
    } catch (error) {
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
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [realTimeMode]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (score: number) => {
    if (score >= 80)
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60)
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Needs Improvement
        </Badge>
      );
    return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
  };

  const getPriorityColor = (priority: string) => {
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

  const getModuleIcon = (moduleName: string) => {
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

  const getQualityIcon = (metricName: string) => {
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

  const getSecurityIcon = (domainName: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interactive Platform Validation Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring and comprehensive validation of platform robustness
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setRealTimeMode(!realTimeMode)}
                  variant={realTimeMode ? "default" : "outline"}
                  size="sm"
                >
                  {realTimeMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {realTimeMode ? "Pause" : "Real-time"}
                </Button>
                <Button
                  onClick={runRobustnessValidation}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Button onClick={runRobustnessValidation} disabled={loading}>
                {loading ? "Running..." : "Run Validation"}
              </Button>
              <Button
                onClick={runPlatformValidator}
                disabled={loading}
                variant="outline"
              >
                {loading ? "Running..." : "Full Analysis"}
              </Button>
              <Button onClick={generateRobustnessReport} variant="outline">
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        {(validationResult || platformValidatorResult) && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Overall Score
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold mt-2 ${getScoreColor(validationResult?.overallScore || platformValidatorResult?.overallScore || 0)}`}
                >
                  {validationResult?.overallScore ||
                    platformValidatorResult?.overallScore ||
                    0}
                  %
                </div>
                <Progress
                  value={
                    validationResult?.overallScore ||
                    platformValidatorResult?.overallScore ||
                    0
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Health Status
                  </span>
                </div>
                <div className="mt-2">
                  <Badge
                    className={
                      validationResult?.healthStatus === "EXCELLENT"
                        ? "bg-green-100 text-green-800"
                        : validationResult?.healthStatus === "GOOD"
                          ? "bg-blue-100 text-blue-800"
                          : validationResult?.healthStatus === "FAIR"
                            ? "bg-yellow-100 text-yellow-800"
                            : validationResult?.healthStatus ===
                                "NEEDS_IMPROVEMENT"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                    }
                  >
                    {validationResult?.healthStatus || "UNKNOWN"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Critical Issues
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2 text-red-600">
                  {validationResult?.criticalIssues.length ||
                    platformValidatorResult?.consolidatedFindings
                      .criticalIssues ||
                    0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Pending Tasks
                  </span>
                </div>
                <div className="text-2xl font-bold mt-2 text-yellow-600">
                  {pendingSubtasks.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Risk Level
                  </span>
                </div>
                <div className="mt-2">
                  <Badge
                    className={
                      validationResult?.riskAssessment?.riskLevel === "LOW"
                        ? "bg-green-100 text-green-800"
                        : validationResult?.riskAssessment?.riskLevel ===
                            "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {validationResult?.riskAssessment?.riskLevel || "UNKNOWN"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Results */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Real-time Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Platform Health Score</span>
                    {realTimeMode && (
                      <Badge className="bg-green-100 text-green-800 animate-pulse">
                        Live
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Real-time assessment of overall platform robustness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`${
                            (validationResult?.overallScore || 0) >= 80
                              ? "text-green-500"
                              : (validationResult?.overallScore || 0) >= 60
                                ? "text-yellow-500"
                                : "text-red-500"
                          }`}
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={`${(validationResult?.overallScore || 0) * 0.628}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div
                            className={`text-3xl font-bold ${
                              (validationResult?.overallScore || 0) >= 80
                                ? "text-green-600"
                                : (validationResult?.overallScore || 0) >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {validationResult?.overallScore || 0}%
                          </div>
                          <div className="text-sm text-gray-500">Health Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {coreModules.filter(m => m.implemented >= 80).length}
                      </div>
                      <div className="text-sm text-gray-500">Healthy Modules</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {coreModules.filter(m => m.implemented >= 60 && m.implemented < 80).length}
                      </div>
                      <div className="text-sm text-gray-500">At Risk</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {coreModules.filter(m => m.implemented < 60).length}
                      </div>
                      <div className="text-sm text-gray-500">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Key Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={88} className="w-16" />
                      <span className="text-sm font-bold text-green-600">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={82} className="w-16" />
                      <span className="text-sm font-bold text-blue-600">82%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compliance</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-16" />
                      <span className="text-sm font-bold text-green-600">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-16" />
                      <span className="text-sm font-bold text-yellow-600">75%</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Critical Tasks</span>
                    <Badge className="bg-red-100 text-red-800">
                      {filteredSubtasks.filter(t => t.priority === 'critical').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Priority</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {filteredSubtasks.filter(t => t.priority === 'high').length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("modules")}
                  >
                    <Layers className="h-6 w-6" />
                    <span>Module Analysis</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="h-6 w-6" />
                    <span>Security Check</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("tasks")}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Task Manager</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={generateRobustnessReport}
                  >
                    <FileText className="h-6 w-6" />
                    <span>Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            {validationResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completeness
                    </CardTitle>
                    <Database className="h-4 w-4 ml-auto text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(validationResult.completeness.score)}`}
                    >
                      {validationResult.completeness.score}%
                    </div>
                    <Progress
                      value={validationResult.completeness.score}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {validationResult.completeness.gaps.length} gaps
                      identified
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Quality
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 ml-auto text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(validationResult.quality.score)}`}
                    >
                      {validationResult.quality.score}%
                    </div>
                    <Progress
                      value={validationResult.quality.score}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {validationResult.quality.gaps.length} quality issues
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Security
                    </CardTitle>
                    <Shield className="h-4 w-4 ml-auto text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(validationResult.security.score)}`}
                    >
                      {validationResult.security.score}%
                    </div>
                    <Progress
                      value={validationResult.security.score}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {validationResult.security.criticalIssues.length} security
                      risks
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Frontend
                    </CardTitle>
                    <Smartphone className="h-4 w-4 ml-auto text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(validationResult.frontend.score)}`}
                    >
                      {validationResult.frontend.score}%
                    </div>
                    <Progress
                      value={validationResult.frontend.score}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {validationResult.frontend.gaps.length} UI/UX improvements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Backend
                    </CardTitle>
                    <Database className="h-4 w-4 ml-auto text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(validationResult.backend.score)}`}
                    >
                      {validationResult.backend.score}%
                    </div>
                    <Progress
                      value={validationResult.backend.score}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {validationResult.backend.gaps.length} backend
                      enhancements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Workflows
                    </CardTitle>
                    <Workflow className="h-4 w-4 ml-auto text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(validationResult.workflows.score)}`}
                    >
                      {validationResult.workflows.score}%
                    </div>
                    <Progress
                      value={validationResult.workflows.score}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {validationResult.workflows.gaps.length} workflow
                      optimizations
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Module-by-Module Analysis</h3>
                <p className="text-sm text-gray-600">12 core modules with implementation percentages</p>
              </div>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {coreModules.map((module) => (
                    <SelectItem key={module.key} value={module.key}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {coreModules
                .filter(module => selectedModule === "all" || module.key === selectedModule)
                .map((module) => {
                  const IconComponent = getModuleIcon(module.key);
                  return (
                    <Card key={module.key} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-sm">{module.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                              {module.implemented}%
                            </span>
                            <Badge
                              className={
                                module.implemented >= 80
                                  ? "bg-green-100 text-green-800"
                                  : module.implemented >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {module.implemented >= 80
                                ? "Healthy"
                                : module.implemented >= 60
                                  ? "At Risk"
                                  : "Critical"}
                            </Badge>
                          </div>
                          <Progress value={module.implemented} className="h-2" />
                          <div className="text-xs text-gray-500">
                            {module.implemented >= 80
                              ? "Module is performing well"
                              : module.implemented >= 60
                                ? "Needs attention"
                                : "Requires immediate action"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
            </div>

            {/* Module Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round(coreModules.reduce((acc, m) => acc + m.implemented, 0) / coreModules.length)}%
                    </div>
                    <div className="text-sm text-gray-600">Average Implementation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {coreModules.filter(m => m.implemented >= 80).length}/{coreModules.length}
                    </div>
                    <div className="text-sm text-gray-600">Modules Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {coreModules.filter(m => m.implemented < 60).length}
                    </div>
                    <div className="text-sm text-gray-600">Critical Modules</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Quality Metrics Dashboard</h3>
              <p className="text-sm text-gray-600">Code quality, test coverage, documentation, and performance metrics</p>
            </div>

            {/* Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
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
                return (
                  <Card key={metric.key} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <Badge
                          className={
                            metric.trend.startsWith("+")
                              ? "bg-green-100 text-green-800"
                              : metric.trend.startsWith("-")
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {metric.trend}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        {metric.name}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xl font-bold ${getScoreColor(metric.score)}`}>
                          {metric.score}%
                        </span>
                      </div>
                      <Progress value={metric.score} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Detailed Quality Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Code Quality Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Cyclomatic Complexity", score: 82, target: 85 },
                    { name: "Code Duplication", score: 88, target: 90 },
                    { name: "Technical Debt Ratio", score: 75, target: 80 },
                    { name: "Code Smells", score: 78, target: 85 },
                  ].map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.score}% / {item.target}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <Progress value={item.score} className="flex-1" />
                        <Progress value={item.target} className="flex-1 opacity-30" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TestTube className="h-5 w-5" />
                    <span>Testing Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Unit Test Coverage", score: 82, total: 1250 },
                    { name: "Integration Tests", score: 65, total: 180 },
                    { name: "E2E Test Coverage", score: 45, total: 85 },
                    { name: "Performance Tests", score: 30, total: 25 },
                  ].map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.score}% ({item.total} tests)</span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Security Assessment</h3>
              <p className="text-sm text-gray-600">10 security domains with comprehensive risk identification</p>
            </div>

            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {securityDomains.map((domain) => {
                const IconComponent = getSecurityIcon(domain.key);
                return (
                  <Card key={domain.key} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <Badge
                          className={
                            domain.risk === "Low"
                              ? "bg-green-100 text-green-800"
                              : domain.risk === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {domain.risk} Risk
                        </Badge>
                      </div>
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {domain.name}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-lg font-bold ${getScoreColor(domain.score)}`}>
                          {domain.score}%
                        </span>
                      </div>
                      <Progress value={domain.score} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Security Risk Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Risk Assessment Matrix</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { level: "Critical", count: securityDomains.filter(d => d.risk === "High" && d.score < 70).length, color: "red" },
                      { level: "High", count: securityDomains.filter(d => d.risk === "High").length, color: "orange" },
                      { level: "Medium", count: securityDomains.filter(d => d.risk === "Medium").length, color: "yellow" },
                      { level: "Low", count: securityDomains.filter(d => d.risk === "Low").length, color: "green" },
                    ].map((risk) => (
                      <div key={risk.level} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-${risk.color}-500`}></div>
                          <span className="font-medium">{risk.level} Risk</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">{risk.count}</span>
                          <span className="text-sm text-gray-500">domains</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Security Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Implement advanced threat detection for incident response",
                      "Enhance vulnerability scanning automation",
                      "Strengthen API security with rate limiting",
                      "Improve network segmentation controls",
                      "Update security training for all team members",
                    ].map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Security Analysis */}
            {validationResult?.security && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Security Controls</span>
                      </CardTitle>
                      <CardDescription>
                        Current security control effectiveness
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {validationResult.securityPosture?.securityControls &&
                          Object.entries(
                            validationResult.securityPosture.securityControls,
                          ).map(([control, score]: [string, any]) => (
                            <div
                              key={control}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm font-medium capitalize">
                                {control.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Progress value={score} className="w-20" />
                                <span
                                  className={`text-sm font-bold ${getScoreColor(score)}`}
                                >
                                  {score}%
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <span>Security Posture</span>
                      </CardTitle>
                      <CardDescription>
                        Overall security assessment and threat level
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Overall Posture
                          </span>
                          <Badge
                            className={
                              validationResult.securityPosture
                                ?.overallPosture === "STRONG"
                                ? "bg-green-100 text-green-800"
                                : validationResult.securityPosture
                                      ?.overallPosture === "MODERATE"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {validationResult.securityPosture?.overallPosture ||
                              "UNKNOWN"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Threat Level
                          </span>
                          <Badge
                            className={
                              validationResult.securityPosture?.threatLevel ===
                              "LOW"
                                ? "bg-green-100 text-green-800"
                                : validationResult.securityPosture
                                      ?.threatLevel === "MEDIUM"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {validationResult.securityPosture?.threatLevel ||
                              "UNKNOWN"}
                          </Badge>
                        </div>
                        {validationResult.securityPosture?.vulnerabilities && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">
                              Vulnerabilities
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span>Critical:</span>
                                <span className="font-bold text-red-600">
                                  {
                                    validationResult.securityPosture
                                      .vulnerabilities.critical
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>High:</span>
                                <span className="font-bold text-orange-600">
                                  {
                                    validationResult.securityPosture
                                      .vulnerabilities.high
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Medium:</span>
                                <span className="font-bold text-yellow-600">
                                  {
                                    validationResult.securityPosture
                                      .vulnerabilities.medium
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Low:</span>
                                <span className="font-bold text-green-600">
                                  {
                                    validationResult.securityPosture
                                      .vulnerabilities.low
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {validationResult.security.criticalIssues.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Critical Security Issues</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1">
                        {validationResult.security.criticalIssues
                          .slice(0, 10)
                          .map((issue: string, index: number) => (
                            <li key={index} className="text-sm">
                              • {issue}
                            </li>
                          ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {validationResult?.riskAssessment && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Risk Assessment Overview</span>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive risk analysis across all domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold ${getScoreColor(100 - validationResult.riskAssessment.overallRisk)}`}
                        >
                          {validationResult.riskAssessment.overallRisk}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Risk
                        </div>
                        <Badge
                          className={
                            validationResult.riskAssessment.riskLevel === "LOW"
                              ? "bg-green-100 text-green-800"
                              : validationResult.riskAssessment.riskLevel ===
                                  "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {validationResult.riskAssessment.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(
                    validationResult.riskAssessment.riskFactors,
                  ).map(([riskType, riskData]: [string, any]) => (
                    <Card key={riskType}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm capitalize">
                          {riskType.replace(/([A-Z])/g, " $1").trim()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Risk Score
                            </span>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={riskData.score}
                                className="w-16"
                              />
                              <span
                                className={`text-sm font-bold ${getScoreColor(100 - riskData.score)}`}
                              >
                                {riskData.score}%
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={
                              riskData.level === "LOW"
                                ? "bg-green-100 text-green-800"
                                : riskData.level === "MEDIUM"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {riskData.level} RISK
                          </Badge>
                          <div className="space-y-1">
                            {riskData.factors
                              .slice(0, 3)
                              .map((factor: string, index: number) => (
                                <div
                                  key={index}
                                  className="text-xs text-gray-600"
                                >
                                  • {factor}
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {validationResult.riskAssessment.mitigationStrategies.length >
                  0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Mitigation Strategies</CardTitle>
                      <CardDescription>
                        Recommended actions to reduce identified risks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {validationResult.riskAssessment.mitigationStrategies.map(
                          (strategy: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strategy}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            {validationResult?.complianceMatrix && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(validationResult.complianceMatrix).map(
                  ([complianceType, complianceData]: [string, any]) => (
                    <Card key={complianceType}>
                      <CardHeader>
                        <CardTitle className="text-sm capitalize flex items-center space-x-2">
                          <Lock className="h-4 w-4" />
                          <span>
                            {complianceType.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Score</span>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={complianceData.score}
                                className="w-20"
                              />
                              <span
                                className={`text-sm font-bold ${getScoreColor(complianceData.score)}`}
                              >
                                {complianceData.score}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Status</span>
                            <Badge
                              className={
                                complianceData.status === "COMPLIANT"
                                  ? "bg-green-100 text-green-800"
                                  : complianceData.status === "IN_PROGRESS"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {complianceData.status}
                            </Badge>
                          </div>
                          {complianceData.requirements && (
                            <div className="text-xs text-gray-600">
                              <div>
                                Requirements:{" "}
                                {complianceData.requirements.completed}/
                                {complianceData.requirements.total}
                              </div>
                              <div>
                                Pending: {complianceData.requirements.pending}
                              </div>
                            </div>
                          )}
                          {complianceData.certification && (
                            <div className="text-xs text-gray-600">
                              Certification: {complianceData.certification}
                            </div>
                          )}
                          {complianceData.nextAudit && (
                            <div className="text-xs text-gray-600">
                              Next Audit: {complianceData.nextAudit}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Task Management</h3>
                <p className="text-sm text-gray-600">Prioritized subtasks with effort estimation</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={taskFilter} onValueChange={setTaskFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Task Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Critical", count: filteredSubtasks.filter(t => t.priority === 'critical').length, color: "red" },
                { label: "High Priority", count: filteredSubtasks.filter(t => t.priority === 'high').length, color: "orange" },
                { label: "Medium Priority", count: filteredSubtasks.filter(t => t.priority === 'medium').length, color: "yellow" },
                { label: "Low Priority", count: filteredSubtasks.filter(t => t.priority === 'low').length, color: "green" },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-600">{item.label}</div>
                        <div className={`text-2xl font-bold text-${item.color}-600`}>{item.count}</div>
                      </div>
                      <div className={`p-2 rounded-full bg-${item.color}-100`}>
                        <AlertTriangle className={`h-5 w-5 text-${item.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Task List ({filteredSubtasks.length})</span>
                  <div className="text-sm text-gray-500">
                    Total Effort: {filteredSubtasks.reduce((acc, task) => acc + task.estimatedHours, 0)}h
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredSubtasks.slice(0, 20).map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-sm">{subtask.title}</div>
                          <Badge className={getPriorityColor(subtask.priority)}>
                            {subtask.priority}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center space-x-4">
                          <span>{subtask.category}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{subtask.estimatedHours}h estimated</span>
                          </span>
                          {subtask.assignedTo && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{subtask.assignedTo}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={subtask.status}
                          onValueChange={(value) => updateSubtaskStatus(subtask.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredSubtasks.length > 20 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      Showing 20 of {filteredSubtasks.length} tasks
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Load More
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Platform Analytics</h3>
              <p className="text-sm text-gray-600">Comprehensive insights and trend analysis</p>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Validation Runs", value: "1,247", change: "+12%", icon: Activity },
                { name: "Issues Resolved", value: "89", change: "+25%", icon: CheckCircle },
                { name: "Avg Response Time", value: "2.3s", change: "-8%", icon: Clock },
                { name: "System Uptime", value: "99.9%", change: "+0.1%", icon: Server },
              ].map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={metric.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <Badge
                          className={
                            metric.change.startsWith("+")
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {metric.change}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        {metric.name}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Trend Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Health trend chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Score Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Security trend chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Dashboard Settings</h3>
              <p className="text-sm text-gray-600">Configure validation parameters and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Real-time Monitoring</div>
                      <div className="text-sm text-gray-500">Enable automatic validation every 30 seconds</div>
                    </div>
                    <Button
                      onClick={() => setRealTimeMode(!realTimeMode)}
                      variant={realTimeMode ? "default" : "outline"}
                      size="sm"
                    >
                      {realTimeMode ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Validation Depth</label>
                    <Select defaultValue="comprehensive">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Validation</SelectItem>
                        <SelectItem value="standard">Standard Validation</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Validation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alert Threshold</label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Score < 90%)</SelectItem>
                        <SelectItem value="medium">Medium (Score < 80%)</SelectItem>
                        <SelectItem value="high">High (Score < 70%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Critical Issues", enabled: true },
                    { name: "Security Alerts", enabled: true },
                    { name: "Performance Degradation", enabled: false },
                    { name: "Compliance Updates", enabled: true },
                    { name: "Weekly Reports", enabled: false },
                  ].map((notification) => (
                    <div key={notification.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{notification.name}</span>
                      <Button
                        variant={notification.enabled ? "default" : "outline"}
                        size="sm"
                      >
                        {notification.enabled ? "On" : "Off"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enhancements" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Platform Enhancement Plan</h3>
              <p className="text-sm text-gray-600">Comprehensive enhancement roadmap with prioritized improvements</p>
            </div>

            {/* Enhancement Plan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Infrastructure Enhancements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Database Optimization", priority: "high", effort: "40h" },
                      { name: "API Performance", priority: "high", effort: "32h" },
                      { name: "Caching Strategy", priority: "medium", effort: "24h" },
                      { name: "Load Balancing", priority: "medium", effort: "16h" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.effort} estimated</div>
                        </div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Security Enhancements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Advanced Threat Detection", priority: "critical", effort: "48h" },
                      { name: "Zero Trust Architecture", priority: "high", effort: "56h" },
                      { name: "Compliance Automation", priority: "high", effort: "32h" },
                      { name: "Security Training", priority: "medium", effort: "16h" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.effort} estimated</div>
                        </div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>User Experience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Mobile Optimization", priority: "high", effort: "40h" },
                      { name: "Accessibility Compliance", priority: "high", effort: "32h" },
                      { name: "Performance Optimization", priority: "medium", effort: "24h" },
                      { name: "User Interface Refresh", priority: "low", effort: "48h" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.effort} estimated</div>
                        </div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Timeline</CardTitle>
                <CardDescription>
                  Phased approach to platform enhancement implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
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
                  ].map((phase, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{phase.phase}</h4>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {phase.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { role: "Senior Security Engineer", allocation: "Full-time", duration: "12 weeks" },
                      { role: "DevOps Engineer", allocation: "Full-time", duration: "8 weeks" },
                      { role: "Frontend Developer", allocation: "Part-time", duration: "6 weeks" },
                      { role: "QA Engineer", allocation: "Part-time", duration: "14 weeks" },
                    ].map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{resource.role}</div>
                          <div className="text-sm text-gray-500">{resource.allocation} for {resource.duration}</div>
                        </div>
                        <Badge variant="secondary">{resource.allocation}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { metric: "Security Score", current: "88%", target: "95%" },
                      { metric: "Performance Score", current: "75%", target: "90%" },
                      { metric: "Compliance Score", current: "92%", target: "98%" },
                      { metric: "User Satisfaction", current: "4.2/5", target: "4.7/5" },
                    ].map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.metric}</span>
                          <span>{metric.current} → {metric.target}</span>
                        </div>
                        <Progress 
                          value={parseFloat(metric.current.replace('%', '').replace('/5', '')) * (metric.current.includes('/5') ? 20 : 1)} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {(validationResult || platformValidatorResult) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      Immediate Actions
                    </CardTitle>
                    <CardDescription>
                      Critical issues requiring immediate attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(
                        platformValidatorResult?.actionItems.immediate ||
                        validationResult?.criticalIssues.slice(0, 5) ||
                        []
                      ).map((item: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-yellow-600">
                      Short-term Goals
                    </CardTitle>
                    <CardDescription>
                      Improvements to implement within 1-3 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(
                        platformValidatorResult?.actionItems.shortTerm ||
                        validationResult?.gaps.slice(0, 5) ||
                        []
                      ).map((item: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      Long-term Vision
                    </CardTitle>
                    <CardDescription>
                      Strategic enhancements for future growth
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(
                        platformValidatorResult?.actionItems.longTerm ||
                        validationResult?.recommendations.slice(0, 5) ||
                        []
                      ).map((item: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlatformRobustnessValidator;