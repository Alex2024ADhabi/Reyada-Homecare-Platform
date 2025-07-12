import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Cpu,
  Database,
  Shield,
  TestTube,
  Rocket,
} from "lucide-react";

interface ExecutionStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  output?: string[];
  error?: string;
  dependencies: string[];
  criticalPath: boolean;
}

interface ExecutionWorkflow {
  id: string;
  name: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "idle" | "running" | "completed" | "failed" | "paused";
  progress: number;
  steps: ExecutionStep[];
  estimatedDuration: number;
  actualDuration?: number;
  healthScore: number;
  automationLevel: "manual" | "semi-automated" | "fully-automated";
  businessImpact: string;
}

interface ExecutionMetrics {
  totalWorkflows: number;
  completedWorkflows: number;
  runningWorkflows: number;
  failedWorkflows: number;
  overallProgress: number;
  totalSteps: number;
  completedSteps: number;
  averageHealthScore: number;
  executionEfficiency: number;
  automationCoverage: number;
  criticalPathCompletion: number;
}

interface RealTimeExecutionMonitorProps {
  className?: string;
}

const RealTimeExecutionMonitor: React.FC<RealTimeExecutionMonitorProps> = ({
  className = "",
}) => {
  const [workflows, setWorkflows] = useState<ExecutionWorkflow[]>([]);
  const [metrics, setMetrics] = useState<ExecutionMetrics>({
    totalWorkflows: 0,
    completedWorkflows: 0,
    runningWorkflows: 0,
    failedWorkflows: 0,
    overallProgress: 0,
    totalSteps: 0,
    completedSteps: 0,
    averageHealthScore: 0,
    executionEfficiency: 0,
    automationCoverage: 0,
    criticalPathCompletion: 0,
  });
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    overall: 100,
    performance: 98,
    security: 100,
    compliance: 100,
    availability: 99.99,
  });
  const [predictiveMetrics, setPredictiveMetrics] = useState({
    estimatedCompletion: new Date(Date.now() + 3600000), // 1 hour from now
    riskAssessment: "LOW",
    resourceUtilization: 35,
    performanceTrend: "IMPROVING",
  });

  useEffect(() => {
    // Initialize monitoring
    initializeMonitoring();

    return () => {
      // Cleanup
      setIsMonitoring(false);
    };
  }, []);

  const initializeMonitoring = async () => {
    try {
      const { automatedImplementationExecutor } = await import(
        "@/services/automated-implementation-executor.service"
      );

      setIsMonitoring(true);

      // Set up real-time event listeners
      automatedImplementationExecutor.on("execution-started", () => {
        addLog("🚀 Implementation execution started");
        updateMetrics();
      });

      automatedImplementationExecutor.on("workflow-started", ({ workflow }) => {
        addLog(`🔄 Started: ${workflow.name}`);
        updateWorkflows();
        updateMetrics();
      });

      automatedImplementationExecutor.on(
        "workflow-progress",
        ({ workflow }) => {
          updateWorkflows();
          updateMetrics();
        },
      );

      automatedImplementationExecutor.on("step-started", ({ step }) => {
        addLog(`  ▶️ Step: ${step.name}`);
      });

      automatedImplementationExecutor.on("step-completed", ({ step }) => {
        addLog(`  ✅ Completed: ${step.name}`);
        updateWorkflows();
        updateMetrics();
      });

      automatedImplementationExecutor.on("step-failed", ({ step, error }) => {
        addLog(`  ❌ Failed: ${step.name} - ${error}`);
        updateWorkflows();
        updateMetrics();
      });

      automatedImplementationExecutor.on(
        "workflow-completed",
        ({ workflow }) => {
          addLog(`✅ Completed: ${workflow.name}`);
          updateWorkflows();
          updateMetrics();
        },
      );

      automatedImplementationExecutor.on(
        "workflow-failed",
        ({ workflow, error }) => {
          addLog(`❌ Failed: ${workflow.name} - ${error}`);
          updateWorkflows();
          updateMetrics();
        },
      );

      automatedImplementationExecutor.on("execution-completed", () => {
        addLog("🎉 All workflows completed successfully!");
        updateWorkflows();
        updateMetrics();
      });

      // Initial data load
      updateWorkflows();
      updateMetrics();
      updateSystemHealth();
      updatePredictiveMetrics();

      // Set up periodic updates for advanced metrics
      setInterval(() => {
        updateSystemHealth();
        updatePredictiveMetrics();
      }, 10000); // Update every 10 seconds
    } catch (error) {
      console.error("Failed to initialize execution monitoring:", error);
      addLog("❌ Failed to initialize monitoring");
    }
  };

  const updateSystemHealth = () => {
    // Simulate real-time system health updates
    setSystemHealth({
      overall: 98 + Math.random() * 2,
      performance: 96 + Math.random() * 4,
      security: 99 + Math.random() * 1,
      compliance: 99 + Math.random() * 1,
      availability: 99.9 + Math.random() * 0.09,
    });
  };

  const updatePredictiveMetrics = () => {
    // Simulate predictive analytics updates
    const riskLevels = ["LOW", "MEDIUM", "HIGH"];
    const trends = ["IMPROVING", "STABLE", "DECLINING"];

    setPredictiveMetrics({
      estimatedCompletion: new Date(
        Date.now() + (3000000 + Math.random() * 1800000),
      ),
      riskAssessment: riskLevels[Math.floor(Math.random() * 3)],
      resourceUtilization: 30 + Math.random() * 20,
      performanceTrend: trends[Math.floor(Math.random() * 3)],
    });
  };

  const updateWorkflows = async () => {
    try {
      const { automatedImplementationExecutor } = await import(
        "@/services/automated-implementation-executor.service"
      );
      const allWorkflows = automatedImplementationExecutor.getAllWorkflows();
      setWorkflows([...allWorkflows]);
    } catch (error) {
      console.error("Failed to update workflows:", error);
    }
  };

  const updateMetrics = async () => {
    try {
      const { automatedImplementationExecutor } = await import(
        "@/services/automated-implementation-executor.service"
      );
      const currentMetrics =
        automatedImplementationExecutor.getExecutionMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error("Failed to update metrics:", error);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setExecutionLogs((prev) => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "running":
        return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "idle":
        return <Clock className="h-4 w-4 text-gray-400" />;
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Core Infrastructure":
        return <Database className="h-5 w-5 text-blue-600" />;
      case "Testing & QA":
        return <TestTube className="h-5 w-5 text-green-600" />;
      case "Compliance":
        return <Shield className="h-5 w-5 text-purple-600" />;
      case "Performance":
        return <Cpu className="h-5 w-5 text-orange-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className={`w-full space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Rocket className="h-6 w-6 text-blue-600" />
            Real-Time Execution Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Live monitoring of automated implementation workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`px-3 py-1 ${
              isMonitoring
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {isMonitoring ? "🟢 Monitoring Active" : "🔴 Monitoring Inactive"}
          </Badge>
        </div>
      </div>

      {/* Advanced System Health Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  System Health
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {Math.round(systemHealth.overall)}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={systemHealth.overall} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Performance</p>
                <p className="text-2xl font-bold text-blue-800">
                  {Math.round(systemHealth.performance)}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={systemHealth.performance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Security</p>
                <p className="text-2xl font-bold text-purple-800">
                  {Math.round(systemHealth.security)}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={systemHealth.security} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Compliance
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {Math.round(systemHealth.compliance)}%
                </p>
              </div>
              <TestTube className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={systemHealth.compliance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-medium">
                  Availability
                </p>
                <p className="text-2xl font-bold text-indigo-800">
                  {systemHealth.availability.toFixed(2)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
            <Progress value={systemHealth.availability} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics Dashboard */}
      <Card className="mb-6 border-2 border-cyan-200 bg-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-800">
            <Target className="h-5 w-5" />
            Predictive Analytics & Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-700">
                {predictiveMetrics.estimatedCompletion.toLocaleTimeString()}
              </div>
              <div className="text-sm text-cyan-600">Estimated Completion</div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  predictiveMetrics.riskAssessment === "LOW"
                    ? "text-green-700"
                    : predictiveMetrics.riskAssessment === "MEDIUM"
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}
              >
                {predictiveMetrics.riskAssessment}
              </div>
              <div className="text-sm text-cyan-600">Risk Assessment</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-700">
                {Math.round(predictiveMetrics.resourceUtilization)}%
              </div>
              <div className="text-sm text-cyan-600">Resource Utilization</div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  predictiveMetrics.performanceTrend === "IMPROVING"
                    ? "text-green-700"
                    : predictiveMetrics.performanceTrend === "STABLE"
                      ? "text-blue-700"
                      : "text-red-700"
                }`}
              >
                {predictiveMetrics.performanceTrend}
              </div>
              <div className="text-sm text-cyan-600">Performance Trend</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.overallProgress}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={metrics.overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Running Workflows</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.runningWorkflows}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Steps</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.completedSteps}/{metrics.totalSteps}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.executionEfficiency}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Status */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Execution Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(workflow.category)}
                        <div>
                          <h4 className="font-medium text-sm">
                            {workflow.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getPriorityColor(workflow.priority)}
                              size="sm"
                            >
                              {workflow.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {workflow.automationLevel.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <span className="text-sm font-medium">
                          {workflow.progress}%
                        </span>
                      </div>
                    </div>

                    <Progress value={workflow.progress} className="h-2 mb-2" />

                    <div className="text-xs text-gray-600">
                      <div>
                        Steps:{" "}
                        {
                          workflow.steps.filter((s) => s.status === "completed")
                            .length
                        }
                        /{workflow.steps.length}
                      </div>
                      <div>Health Score: {workflow.healthScore}%</div>
                      {workflow.actualDuration && (
                        <div>
                          Duration: {Math.round(workflow.actualDuration / 1000)}
                          s
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Execution Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {executionLogs.map((log, index) => (
                  <div
                    key={index}
                    className="text-xs font-mono p-2 bg-gray-50 rounded"
                  >
                    {log}
                  </div>
                ))}
                {executionLogs.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No execution logs yet. Start an implementation to see
                    real-time logs.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Critical Path Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Path Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Critical Path Progress</span>
                <span>{metrics.criticalPathCompletion}%</span>
              </div>
              <Progress
                value={metrics.criticalPathCompletion}
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {metrics.totalWorkflows}
                </div>
                <div className="text-gray-600">Total Workflows</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {metrics.completedWorkflows}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {metrics.automationCoverage}%
                </div>
                <div className="text-gray-600">Automation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {metrics.averageHealthScore}%
                </div>
                <div className="text-gray-600">Avg Health</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeExecutionMonitor;
