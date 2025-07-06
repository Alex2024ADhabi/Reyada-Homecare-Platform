import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Settings,
  Activity,
  TrendingUp,
  Shield,
  Database,
  Code,
  Wrench,
  GitBranch,
  Layers,
  Users,
  FileCheck,
  Download,
  Calendar,
  BarChart3,
  Cpu,
  Network,
  HardDrive,
  Memory,
  Globe,
  Lock,
  Bug,
  TestTube,
  Rocket,
  CheckSquare,
} from "lucide-react";

interface ImplementationTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "failed" | "blocked";
  progress: number;
  estimatedHours: number;
  dependencies: string[];
  blockers: string[];
  assignedTo?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  automationLevel: "manual" | "semi-automated" | "fully-automated";
  healthScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  businessImpact: string;
  technicalRequirements: string[];
  acceptanceCriteria: string[];
}

interface ImplementationMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  criticalTasks: number;
  overallProgress: number;
  estimatedCompletion: string;
  totalEffort: number;
  remainingEffort: number;
  averageHealthScore: number;
  riskAssessment: string;
  automationCoverage: number;
  qualityScore: number;
  complianceScore: number;
  securityScore: number;
  performanceScore: number;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  type: "deployment" | "testing" | "validation" | "monitoring" | "backup";
  status: "idle" | "running" | "completed" | "failed";
  progress: number;
  steps: {
    id: string;
    name: string;
    status: "pending" | "running" | "completed" | "failed";
    duration?: number;
    output?: string;
  }[];
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  successRate: number;
}

const MasterImplementationController: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Comprehensive implementation tasks
  const implementationTasks: ImplementationTask[] = [
    {
      id: "real-time-sync-enhancement",
      title: "Enhanced Real-Time Synchronization Service",
      description:
        "Implement advanced real-time sync with offline queue management and conflict resolution",
      category: "Core Infrastructure",
      priority: "critical",
      status: "in_progress",
      progress: 75,
      estimatedHours: 32,
      dependencies: ["WebSocket Service", "Offline Storage"],
      blockers: [],
      automationLevel: "fully-automated",
      healthScore: 85,
      riskLevel: "medium",
      businessImpact:
        "Critical - Real-time data synchronization across all modules",
      technicalRequirements: [
        "WebSocket connection management",
        "Offline queue with IndexedDB",
        "Conflict resolution algorithms",
        "Data integrity validation",
        "Performance optimization",
      ],
      acceptanceCriteria: [
        "Real-time sync works across all modules",
        "Offline queue handles 10,000+ items",
        "Conflict resolution is automatic",
        "Data integrity is maintained",
        "Performance impact < 5%",
      ],
    },
    {
      id: "error-handling-framework",
      title: "Advanced Error Handling & Recovery System",
      description:
        "Comprehensive error handling with self-healing capabilities and predictive error prevention",
      category: "Core Infrastructure",
      priority: "critical",
      status: "in_progress",
      progress: 60,
      estimatedHours: 28,
      dependencies: ["Monitoring Service", "Alert System"],
      blockers: [],
      automationLevel: "fully-automated",
      healthScore: 80,
      riskLevel: "medium",
      businessImpact: "Critical - System reliability and user experience",
      technicalRequirements: [
        "Global error boundary implementation",
        "Self-healing mechanisms",
        "Predictive error analytics",
        "Automated recovery workflows",
        "Error reporting and tracking",
      ],
      acceptanceCriteria: [
        "All errors are caught and handled gracefully",
        "Self-healing recovers from 90% of errors",
        "Predictive analytics prevent 80% of issues",
        "Recovery time < 30 seconds",
        "Error reports are comprehensive",
      ],
    },
    {
      id: "ai-hub-implementation",
      title: "Comprehensive AI Hub Service",
      description:
        "Complete AI Hub with ML models, predictive analytics, and healthcare-specific AI capabilities",
      category: "AI & Machine Learning",
      priority: "critical",
      status: "pending",
      progress: 0,
      estimatedHours: 80,
      dependencies: ["Data Pipeline", "ML Infrastructure"],
      blockers: ["ML Infrastructure Setup Required"],
      automationLevel: "semi-automated",
      healthScore: 0,
      riskLevel: "high",
      businessImpact:
        "High - Competitive advantage through AI-powered insights",
      technicalRequirements: [
        "Machine learning model training pipeline",
        "Predictive analytics for patient outcomes",
        "Natural language processing for clinical notes",
        "Computer vision for wound assessment",
        "Manpower optimization algorithms",
      ],
      acceptanceCriteria: [
        "ML models achieve >90% accuracy",
        "Predictive analytics provide actionable insights",
        "NLP processes clinical notes correctly",
        "Computer vision accurately assesses wounds",
        "Manpower optimization improves efficiency by >20%",
      ],
    },
    {
      id: "zero-trust-security",
      title: "Zero Trust Security Architecture",
      description:
        "Complete Zero Trust security model with micro-segmentation and continuous verification",
      category: "Security",
      priority: "critical",
      status: "pending",
      progress: 0,
      estimatedHours: 64,
      dependencies: ["Security Framework", "Network Infrastructure"],
      blockers: ["Network Segmentation Planning Required"],
      automationLevel: "semi-automated",
      healthScore: 0,
      riskLevel: "critical",
      businessImpact: "Critical - Healthcare data security and compliance",
      technicalRequirements: [
        "Micro-segmentation implementation",
        "Continuous authentication system",
        "Behavioral analytics for threat detection",
        "Automated incident response",
        "Compliance monitoring integration",
      ],
      acceptanceCriteria: [
        "Micro-segmentation isolates critical systems",
        "Continuous authentication works seamlessly",
        "Behavioral analytics detect anomalies",
        "Incident response is automated",
        "Compliance monitoring is continuous",
      ],
    },
    {
      id: "doh-compliance-automation",
      title: "Automated DOH Nine Domains Assessment",
      description:
        "Complete automation of DOH nine domains assessment with real-time scoring and recommendations",
      category: "Compliance",
      priority: "critical",
      status: "in_progress",
      progress: 70,
      estimatedHours: 40,
      dependencies: ["Clinical Documentation", "AI Analytics Engine"],
      blockers: [],
      automationLevel: "fully-automated",
      healthScore: 85,
      riskLevel: "medium",
      businessImpact: "Critical - DOH compliance is mandatory for operations",
      technicalRequirements: [
        "Nine domains scoring algorithm",
        "Real-time assessment engine",
        "Automated recommendation system",
        "Compliance gap analysis",
        "DOH reporting integration",
      ],
      acceptanceCriteria: [
        "Nine domains assessment is fully automated",
        "Scoring algorithm matches DOH standards",
        "Recommendations are contextually relevant",
        "Gap analysis identifies specific issues",
        "Reports generate in DOH-required format",
      ],
    },
    {
      id: "mobile-pwa-optimization",
      title: "Mobile-Optimized PWA with Offline Capability",
      description:
        "Complete mobile optimization with offline data collection, sync, and voice-to-text integration",
      category: "Mobile & PWA",
      priority: "high",
      status: "pending",
      progress: 0,
      estimatedHours: 48,
      dependencies: ["PWA Infrastructure", "Offline Sync Service"],
      blockers: ["PWA Service Worker Implementation"],
      automationLevel: "semi-automated",
      healthScore: 0,
      riskLevel: "high",
      businessImpact:
        "Critical - Mobile workforce depends on this functionality",
      technicalRequirements: [
        "Responsive design for all forms",
        "Touch-optimized input controls",
        "Offline data storage with IndexedDB",
        "Background sync when connection restored",
        "Voice-to-text input for clinical notes",
      ],
      acceptanceCriteria: [
        "All forms work seamlessly on mobile devices",
        "Offline data collection functions correctly",
        "Data syncs automatically when online",
        "Voice input recognizes medical terminology",
        "Form validation works offline",
      ],
    },
    {
      id: "comprehensive-testing-suite",
      title: "Complete End-to-End Testing Framework",
      description:
        "Comprehensive E2E testing covering all healthcare workflows with automated execution",
      category: "Testing & QA",
      priority: "high",
      status: "in_progress",
      progress: 40,
      estimatedHours: 52,
      dependencies: ["All Core Features", "Test Infrastructure"],
      blockers: [],
      automationLevel: "fully-automated",
      healthScore: 70,
      riskLevel: "medium",
      businessImpact: "High - Quality assurance and reliability",
      technicalRequirements: [
        "Playwright/Cypress test framework setup",
        "Healthcare workflow test scenarios",
        "Automated test data generation",
        "CI/CD pipeline integration",
        "Test reporting and analytics",
      ],
      acceptanceCriteria: [
        "All critical workflows have E2E tests",
        "Tests run automatically in CI/CD",
        "Test data generation is automated",
        "Test reports provide actionable insights",
        "Test coverage exceeds 90% for critical paths",
      ],
    },
    {
      id: "performance-optimization",
      title: "Advanced Multi-Layer Caching System",
      description:
        "Intelligent multi-layer caching with Redis, CDN, and application-level optimization",
      category: "Performance",
      priority: "high",
      status: "in_progress",
      progress: 75,
      estimatedHours: 28,
      dependencies: ["Redis Infrastructure", "CDN Setup"],
      blockers: [],
      automationLevel: "fully-automated",
      healthScore: 90,
      riskLevel: "low",
      businessImpact: "Medium - Performance improvement and user experience",
      technicalRequirements: [
        "Redis cluster configuration",
        "CDN integration for static assets",
        "Application-level caching strategies",
        "Cache invalidation mechanisms",
        "Performance monitoring integration",
      ],
      acceptanceCriteria: [
        "Multi-layer caching reduces response time by >50%",
        "Cache hit rate exceeds 90%",
        "Invalidation mechanisms work correctly",
        "Performance monitoring shows improvements",
        "System handles cache failures gracefully",
      ],
    },
  ];

  // Automation workflows
  const automationWorkflows: AutomationWorkflow[] = [
    {
      id: "automated-deployment",
      name: "Automated Deployment Pipeline",
      description:
        "Complete CI/CD pipeline with automated testing, building, and deployment",
      type: "deployment",
      status: "running",
      progress: 85,
      steps: [
        {
          id: "build",
          name: "Build Application",
          status: "completed",
          duration: 120,
        },
        { id: "test", name: "Run Tests", status: "completed", duration: 300 },
        {
          id: "security",
          name: "Security Scan",
          status: "running",
          duration: 180,
        },
        { id: "deploy", name: "Deploy to Staging", status: "pending" },
        { id: "validate", name: "Validate Deployment", status: "pending" },
      ],
      schedule: "On every commit",
      lastRun: "2024-01-15T10:30:00Z",
      successRate: 95,
    },
    {
      id: "automated-testing",
      name: "Comprehensive Test Automation",
      description:
        "Automated execution of all test suites including E2E, integration, and performance tests",
      type: "testing",
      status: "completed",
      progress: 100,
      steps: [
        { id: "unit", name: "Unit Tests", status: "completed", duration: 45 },
        {
          id: "integration",
          name: "Integration Tests",
          status: "completed",
          duration: 120,
        },
        {
          id: "e2e",
          name: "End-to-End Tests",
          status: "completed",
          duration: 300,
        },
        {
          id: "performance",
          name: "Performance Tests",
          status: "completed",
          duration: 180,
        },
        {
          id: "security",
          name: "Security Tests",
          status: "completed",
          duration: 90,
        },
      ],
      schedule: "Every 4 hours",
      lastRun: "2024-01-15T08:00:00Z",
      nextRun: "2024-01-15T12:00:00Z",
      successRate: 98,
    },
    {
      id: "compliance-validation",
      name: "DOH Compliance Validation",
      description:
        "Automated validation of DOH compliance requirements and reporting",
      type: "validation",
      status: "idle",
      progress: 0,
      steps: [
        { id: "nine-domains", name: "Nine Domains Check", status: "pending" },
        {
          id: "documentation",
          name: "Documentation Validation",
          status: "pending",
        },
        { id: "reporting", name: "Generate Reports", status: "pending" },
      ],
      schedule: "Daily at 2:00 AM",
      nextRun: "2024-01-16T02:00:00Z",
      successRate: 92,
    },
    {
      id: "health-monitoring",
      name: "System Health Monitoring",
      description:
        "Continuous monitoring of system health, performance, and security metrics",
      type: "monitoring",
      status: "running",
      progress: 100,
      steps: [
        { id: "metrics", name: "Collect Metrics", status: "running" },
        { id: "analysis", name: "Analyze Performance", status: "running" },
        { id: "alerts", name: "Process Alerts", status: "running" },
      ],
      schedule: "Continuous",
      lastRun: "2024-01-15T11:45:00Z",
      successRate: 99,
    },
    {
      id: "backup-automation",
      name: "Automated Backup & Recovery",
      description:
        "Automated backup of all critical data with disaster recovery capabilities",
      type: "backup",
      status: "completed",
      progress: 100,
      steps: [
        {
          id: "database",
          name: "Database Backup",
          status: "completed",
          duration: 300,
        },
        {
          id: "files",
          name: "File System Backup",
          status: "completed",
          duration: 180,
        },
        {
          id: "validation",
          name: "Backup Validation",
          status: "completed",
          duration: 60,
        },
      ],
      schedule: "Daily at 1:00 AM",
      lastRun: "2024-01-15T01:00:00Z",
      nextRun: "2024-01-16T01:00:00Z",
      successRate: 100,
    },
  ];

  // Calculate implementation metrics
  const calculateMetrics = (): ImplementationMetrics => {
    const totalTasks = implementationTasks.length;
    const completedTasks = implementationTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const inProgressTasks = implementationTasks.filter(
      (t) => t.status === "in_progress",
    ).length;
    const blockedTasks = implementationTasks.filter(
      (t) => t.status === "blocked",
    ).length;
    const criticalTasks = implementationTasks.filter(
      (t) => t.priority === "critical",
    ).length;

    const overallProgress = Math.round(
      implementationTasks.reduce((sum, task) => sum + task.progress, 0) /
        totalTasks,
    );

    const totalEffort = implementationTasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0,
    );
    const remainingEffort = implementationTasks.reduce(
      (sum, task) => sum + (task.estimatedHours * (100 - task.progress)) / 100,
      0,
    );

    const averageHealthScore = Math.round(
      implementationTasks.reduce((sum, task) => sum + task.healthScore, 0) /
        totalTasks,
    );

    const automationCoverage = Math.round(
      (implementationTasks.filter(
        (t) => t.automationLevel === "fully-automated",
      ).length /
        totalTasks) *
        100,
    );

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      criticalTasks,
      overallProgress,
      estimatedCompletion: "2024-02-15",
      totalEffort,
      remainingEffort: Math.round(remainingEffort),
      averageHealthScore,
      riskAssessment:
        overallProgress > 80 ? "Low" : overallProgress > 60 ? "Medium" : "High",
      automationCoverage,
      qualityScore: 92,
      complianceScore: 88,
      securityScore: 95,
      performanceScore: 87,
    };
  };

  const metrics = calculateMetrics();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const executeAutomatedImplementation = async () => {
    setIsExecuting(true);
    console.log(
      "🚀 Starting comprehensive automated implementation execution...",
    );

    try {
      // Import the automated implementation executor
      const { automatedImplementationExecutor } = await import(
        "@/services/automated-implementation-executor.service"
      );

      // Set up event listeners for real-time updates
      automatedImplementationExecutor.on("execution-started", () => {
        console.log("📋 Implementation execution started");
      });

      automatedImplementationExecutor.on("workflow-started", ({ workflow }) => {
        console.log(`🔄 Started workflow: ${workflow.name}`);
      });

      automatedImplementationExecutor.on(
        "workflow-completed",
        ({ workflow }) => {
          console.log(`✅ Completed workflow: ${workflow.name}`);
          setLastUpdated(new Date());
        },
      );

      automatedImplementationExecutor.on(
        "workflow-failed",
        ({ workflow, error }) => {
          console.error(`❌ Failed workflow: ${workflow.name}`, error);
        },
      );

      automatedImplementationExecutor.on("execution-completed", () => {
        console.log("🎉 All implementation workflows completed successfully!");
        setLastUpdated(new Date());
      });

      // Execute all automated implementation workflows
      await automatedImplementationExecutor.executeAllWorkflows();

      // Update implementation task statuses based on execution results
      const executionMetrics =
        automatedImplementationExecutor.getExecutionMetrics();
      console.log("📊 Execution Metrics:", executionMetrics);

      // Simulate updating task progress based on workflow completion
      implementationTasks.forEach((task) => {
        if (
          task.automationLevel === "fully-automated" &&
          task.status === "in_progress"
        ) {
          task.progress = Math.min(100, task.progress + 25);
          if (task.progress >= 100) {
            task.status = "completed";
            task.completedAt = new Date().toISOString();
          }
        }
      });
    } catch (error) {
      console.error("❌ Automated implementation execution failed:", error);
    } finally {
      setIsExecuting(false);
      setLastUpdated(new Date());
    }
  };

  const filteredTasks = implementationTasks.filter((task) => {
    const categoryMatch =
      selectedCategory === "all" || task.category === selectedCategory;
    const priorityMatch =
      selectedPriority === "all" || task.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const categories = Array.from(
    new Set(implementationTasks.map((task) => task.category)),
  );
  const priorities = ["critical", "high", "medium", "low"];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Rocket className="h-8 w-8 text-blue-600" />
            Master Implementation Controller
          </h1>
          <p className="text-gray-600 mt-2">
            Automated implementation orchestration for 100% platform robustness
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-lg px-4 py-2 bg-blue-50 text-blue-700 border-blue-200"
          >
            {metrics.overallProgress}% Complete
          </Badge>
          <Button
            onClick={executeAutomatedImplementation}
            disabled={isExecuting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExecuting ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Implementation
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastUpdated(new Date())}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalTasks}
                </p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.criticalTasks}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.inProgressTasks}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining Hours</p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.remainingEffort}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Implementation Progress</span>
                <span>{metrics.overallProgress}%</span>
              </div>
              <Progress value={metrics.overallProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(metrics.remainingEffort / 8)} days
                </div>
                <div className="text-gray-600">Est. Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {metrics.automationCoverage}%
                </div>
                <div className="text-gray-600">Automation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {metrics.averageHealthScore}%
                </div>
                <div className="text-gray-600">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {metrics.riskAssessment}
                </div>
                <div className="text-gray-600">Risk Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Implementation Tasks</TabsTrigger>
          <TabsTrigger value="automation">Automation Workflows</TabsTrigger>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="roadmap">Execution Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Implementation Tasks */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {task.automationLevel.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progress</div>
                      <div className="text-lg font-bold">{task.progress}%</div>
                      <Progress
                        value={task.progress}
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">
                        Technical Requirements
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {task.technicalRequirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Code className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                      <ul className="space-y-1 text-sm">
                        {task.acceptanceCriteria.map((criteria, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {task.blockers.length > 0 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Blockers</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {task.blockers.map((blocker, index) => (
                            <li key={index}>{blocker}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>Effort:</strong> {task.estimatedHours}h
                        </span>
                        <span>
                          <strong>Health:</strong> {task.healthScore}%
                        </span>
                        <span>
                          <strong>Risk:</strong> {task.riskLevel}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Business Impact:</strong> {task.businessImpact}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationWorkflows.map((workflow) => (
              <Card key={workflow.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {workflow.description}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {workflow.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-lg font-bold text-green-600">
                        {workflow.successRate}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      {workflow.steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <span className="text-sm">{step.name}</span>
                          </div>
                          {step.duration && (
                            <span className="text-xs text-gray-500">
                              {step.duration}s
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t text-xs text-gray-600">
                      <div>
                        <strong>Schedule:</strong> {workflow.schedule}
                      </div>
                      {workflow.lastRun && (
                        <div>
                          <strong>Last Run:</strong>{" "}
                          {new Date(workflow.lastRun).toLocaleString()}
                        </div>
                      )}
                      {workflow.nextRun && (
                        <div>
                          <strong>Next Run:</strong>{" "}
                          {new Date(workflow.nextRun).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.qualityScore}%
                    </p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Compliance Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.complianceScore}%
                    </p>
                  </div>
                  <FileCheck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {metrics.securityScore}%
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Performance Score</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {metrics.performanceScore}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Code Quality & Standards</span>
                    <span>{metrics.qualityScore}%</span>
                  </div>
                  <Progress value={metrics.qualityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Healthcare Compliance</span>
                    <span>{metrics.complianceScore}%</span>
                  </div>
                  <Progress value={metrics.complianceScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Security Implementation</span>
                    <span>{metrics.securityScore}%</span>
                  </div>
                  <Progress value={metrics.securityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Performance Optimization</span>
                    <span>{metrics.performanceScore}%</span>
                  </div>
                  <Progress value={metrics.performanceScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Automation Coverage</span>
                    <span>{metrics.automationCoverage}%</span>
                  </div>
                  <Progress
                    value={metrics.automationCoverage}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Implementation Execution Roadmap</AlertTitle>
            <AlertDescription>
              Automated execution sequence for achieving 100% platform
              robustness. Critical tasks are prioritized and executed in
              parallel where possible.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {["critical", "high", "medium", "low"].map((priority) => {
              const priorityTasks = implementationTasks.filter(
                (task) => task.priority === priority,
              );
              if (priorityTasks.length === 0) return null;

              return (
                <Card key={priority} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={getPriorityColor(priority)}>
                        {priority.toUpperCase()} PRIORITY
                      </Badge>
                      <span className="text-lg">
                        {priorityTasks.length} Tasks
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {priorityTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(task.status)}
                            <div>
                              <div className="font-medium text-sm">
                                {task.title}
                              </div>
                              <div className="text-xs text-gray-600">
                                {task.estimatedHours}h • {task.riskLevel} risk •{" "}
                                {task.healthScore}% health
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={task.progress}
                              className="w-16 h-2"
                            />
                            <span className="text-sm font-medium">
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Summary */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Automated Implementation Execution Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-red-700">
                Critical Tasks (Execute Immediately)
              </h4>
              <ul className="space-y-2 text-sm">
                {implementationTasks
                  .filter(
                    (task) =>
                      task.priority === "critical" &&
                      task.status !== "completed",
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <li key={task.id} className="flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 mt-1 text-red-500 flex-shrink-0" />
                      <span>
                        {task.title} ({task.estimatedHours}h)
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-green-700">
                Automation Status
              </h4>
              <ul className="space-y-2 text-sm">
                {automationWorkflows
                  .filter(
                    (workflow) =>
                      workflow.status === "running" ||
                      workflow.status === "completed",
                  )
                  .slice(0, 5)
                  .map((workflow) => (
                    <li key={workflow.id} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                      <span>
                        {workflow.name} ({workflow.successRate}% success)
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium mb-2">Next Automated Actions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Execute critical priority tasks in parallel</li>
              <li>Deploy automated testing and validation workflows</li>
              <li>Implement real-time monitoring and health checks</li>
              <li>Activate self-healing and error recovery systems</li>
              <li>Complete security and compliance validation</li>
              <li>Generate comprehensive implementation reports</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterImplementationController;
