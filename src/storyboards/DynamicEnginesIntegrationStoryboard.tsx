import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Cog,
  Zap,
  FileText,
  GitBranch,
  Calculator,
} from "lucide-react";

interface EngineStatus {
  name: string;
  icon: React.ReactNode;
  status: "operational" | "degraded" | "offline";
  initialized: boolean;
  tasksCompleted: number;
  successRate: number;
  averageExecutionTime: number;
  capabilities: string[];
  recentActivity: Array<{
    timestamp: string;
    action: string;
    status: "success" | "warning" | "error";
  }>;
}

interface IntegrationTest {
  name: string;
  status: "passed" | "failed" | "running";
  duration: number;
  details: string;
}

export default function DynamicEnginesIntegrationStoryboard() {
  const [engines, setEngines] = useState<EngineStatus[]>([]);
  const [integrationTests, setIntegrationTests] = useState<IntegrationTest[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    loadEngineData();
  }, []);

  const loadEngineData = async () => {
    setIsLoading(true);

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock engine data
    setEngines([
      {
        name: "Form Generation Engine",
        icon: <FileText className="h-5 w-5" />,
        status: "operational",
        initialized: true,
        tasksCompleted: 1247,
        successRate: 98.5,
        averageExecutionTime: 245,
        capabilities: [
          "Dynamic Form Creation",
          "DOH Compliance Validation",
          "AI-Enhanced Fields",
          "Multi-language Support",
          "Mobile Optimization",
        ],
        recentActivity: [
          {
            timestamp: "2 min ago",
            action: "Generated clinical assessment form",
            status: "success",
          },
          {
            timestamp: "5 min ago",
            action: "Validated DOH compliance",
            status: "success",
          },
          {
            timestamp: "8 min ago",
            action: "Applied AI enhancements",
            status: "success",
          },
        ],
      },
      {
        name: "Workflow Engine",
        icon: <GitBranch className="h-5 w-5" />,
        status: "operational",
        initialized: true,
        tasksCompleted: 892,
        successRate: 96.8,
        averageExecutionTime: 1850,
        capabilities: [
          "Process Automation",
          "Healthcare Workflows",
          "AI-Enhanced Routing",
          "Predictive Scheduling",
          "Resource Optimization",
        ],
        recentActivity: [
          {
            timestamp: "1 min ago",
            action: "Executed patient admission workflow",
            status: "success",
          },
          {
            timestamp: "4 min ago",
            action: "Optimized resource allocation",
            status: "success",
          },
          {
            timestamp: "7 min ago",
            action: "Applied intelligent routing",
            status: "success",
          },
        ],
      },
      {
        name: "Rules Engine",
        icon: <Cog className="h-5 w-5" />,
        status: "operational",
        initialized: true,
        tasksCompleted: 2156,
        successRate: 99.2,
        averageExecutionTime: 125,
        capabilities: [
          "Business Rules Processing",
          "Clinical Decision Rules",
          "Compliance Validation",
          "Safety Monitoring",
          "Real-time Evaluation",
        ],
        recentActivity: [
          {
            timestamp: "30 sec ago",
            action: "Evaluated medication allergy rules",
            status: "success",
          },
          {
            timestamp: "2 min ago",
            action: "Validated DOH compliance rules",
            status: "success",
          },
          {
            timestamp: "3 min ago",
            action: "Processed safety monitoring rules",
            status: "warning",
          },
        ],
      },
      {
        name: "Computation Engine",
        icon: <Calculator className="h-5 w-5" />,
        status: "operational",
        initialized: true,
        tasksCompleted: 3421,
        successRate: 97.4,
        averageExecutionTime: 680,
        capabilities: [
          "Healthcare Analytics",
          "Complex Calculations",
          "Predictive Modeling",
          "Resource Optimization",
          "Performance Analysis",
        ],
        recentActivity: [
          {
            timestamp: "45 sec ago",
            action: "Calculated health metrics",
            status: "success",
          },
          {
            timestamp: "3 min ago",
            action: "Optimized resource allocation",
            status: "success",
          },
          {
            timestamp: "6 min ago",
            action: "Performed predictive analysis",
            status: "success",
          },
        ],
      },
    ]);

    // Mock integration tests
    setIntegrationTests([
      {
        name: "Form Generation Integration",
        status: "passed",
        duration: 245,
        details:
          "Successfully generated and validated healthcare forms with AI enhancements",
      },
      {
        name: "Workflow Execution Integration",
        status: "passed",
        duration: 1850,
        details:
          "Workflow engine executed clinical assessment workflow with AI optimizations",
      },
      {
        name: "Rules Evaluation Integration",
        status: "passed",
        duration: 125,
        details:
          "Rules engine evaluated healthcare business rules and compliance checks",
      },
      {
        name: "Computation Processing Integration",
        status: "passed",
        duration: 680,
        details:
          "Computation engine processed healthcare analytics and calculations",
      },
      {
        name: "Cross-Engine Communication",
        status: "passed",
        duration: 320,
        details: "All engines successfully communicated and shared data",
      },
      {
        name: "AI Hub Orchestration",
        status: "passed",
        duration: 450,
        details: "AI Hub successfully orchestrated all dynamic engines",
      },
    ]);

    setIsLoading(false);
  };

  const runIntegrationTests = async () => {
    setIsRunningTests(true);

    // Simulate running tests
    for (let i = 0; i < integrationTests.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIntegrationTests((prev) =>
        prev.map((test, index) =>
          index === i ? { ...test, status: "running" } : test,
        ),
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIntegrationTests((prev) =>
        prev.map((test, index) =>
          index === i ? { ...test, status: "passed" } : test,
        ),
      );
    }

    setIsRunningTests(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "passed":
        return "text-green-600";
      case "degraded":
      case "running":
        return "text-yellow-600";
      case "offline":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
      case "passed":
        return "default";
      case "degraded":
      case "running":
        return "secondary";
      case "offline":
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading Dynamic Engines...
          </p>
        </div>
      </div>
    );
  }

  const overallSuccessRate =
    engines.reduce((acc, engine) => acc + engine.successRate, 0) /
    engines.length;
  const totalTasksCompleted = engines.reduce(
    (acc, engine) => acc + engine.tasksCompleted,
    0,
  );
  const averageResponseTime =
    engines.reduce((acc, engine) => acc + engine.averageExecutionTime, 0) /
    engines.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Dynamic Engines Integration
            </h1>
            <Badge variant="outline" className="ml-auto">
              ⚙️ All Engines Operational - 100% Integration Complete
            </Badge>
          </div>
          <p className="text-gray-600">
            Comprehensive integration dashboard for all dynamic processing
            engines
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalTasksCompleted.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overall Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {overallSuccessRate.toFixed(1)}%
              </div>
              <Progress value={overallSuccessRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(averageResponseTime)}ms
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Engines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {engines.filter((e) => e.status === "operational").length}/
                {engines.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Alert */}
        <Alert className="mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Integration Status:</strong> All dynamic engines are
            operational and fully integrated. Cross-engine communication is
            functioning optimally with AI Hub orchestration active.
          </AlertDescription>
        </Alert>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Engine Overview</TabsTrigger>
            <TabsTrigger value="integration">Integration Tests</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Engine Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {engines.map((engine, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {engine.icon}
                      {engine.name}
                      <Badge
                        variant={getStatusBadge(engine.status)}
                        className="ml-auto"
                      >
                        {engine.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {engine.tasksCompleted.toLocaleString()} tasks completed |{" "}
                      {engine.successRate}% success rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {engine.successRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Success Rate
                        </div>
                        <Progress value={engine.successRate} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {engine.averageExecutionTime}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg Execution Time
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Capabilities:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {engine.capabilities.map((capability, capIndex) => (
                          <Badge
                            key={capIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integration Tests Tab */}
          <TabsContent value="integration" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Integration Test Suite</h3>
              <Button
                onClick={runIntegrationTests}
                disabled={isRunningTests}
                className="flex items-center gap-2"
              >
                {isRunningTests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run Integration Tests
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {integrationTests.map((test, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {test.status === "passed" && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {test.status === "running" && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                      {test.status === "failed" && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      {test.name}
                      <Badge
                        variant={getStatusBadge(test.status)}
                        className="ml-auto"
                      >
                        {test.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Duration: {test.duration}ms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{test.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {engines.map((engine, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {engine.icon}
                      {engine.name}
                    </CardTitle>
                    <CardDescription>
                      Recent activity and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {engine.recentActivity.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="flex items-start gap-3 p-2 rounded-lg bg-gray-50"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${getActivityStatusColor(activity.status).replace("text-", "bg-")}`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.timestamp}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getActivityStatusColor(activity.status)}`}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
