import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Users,
  Truck,
  FileText,
  Database,
  Wifi,
  Lock,
  RefreshCw,
} from "lucide-react";

interface PlatformModule {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "pending" | "error";
  progress: number;
  description: string;
  dependencies: string[];
  criticalIssues: string[];
  lastUpdated: string;
}

interface ComprehensivePlatformStatusProps {
  organizationId?: string;
}

export default function ComprehensivePlatformStatus({
  organizationId = "RHHCS",
}: ComprehensivePlatformStatusProps) {
  const [modules, setModules] = useState<PlatformModule[]>([
    {
      id: "attendance-management",
      name: "Attendance Management",
      status: "completed",
      progress: 100,
      description:
        "Real-time staff attendance tracking with biometric authentication",
      dependencies: [
        "websocket-service",
        "security-service",
        "validation-service",
      ],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "logistics-management",
      name: "Logistics Management",
      status: "completed",
      progress: 100,
      description: "Fleet management and route optimization system",
      dependencies: [
        "vehicle-management-api",
        "websocket-service",
        "validation-service",
      ],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "websocket-service",
      name: "WebSocket Service",
      status: "completed",
      progress: 100,
      description: "Real-time communication and live updates",
      dependencies: ["messaging-config"],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "security-service",
      name: "Security Service",
      status: "completed",
      progress: 100,
      description:
        "Comprehensive security framework with encryption and audit trails",
      dependencies: ["validation-service", "error-handler-service"],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "validation-service",
      name: "Validation Service",
      status: "completed",
      progress: 100,
      description: "Data validation and sanitization service",
      dependencies: ["error-handler-service"],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "vehicle-management-api",
      name: "Vehicle Management API",
      status: "completed",
      progress: 100,
      description: "Fleet vehicle management and tracking API",
      dependencies: ["security-service", "validation-service"],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "homecare-operations-api",
      name: "Homecare Operations API",
      status: "completed",
      progress: 100,
      description: "Core homecare operations and staff management API",
      dependencies: ["database", "validation-service"],
      criticalIssues: [],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "doh-compliance",
      name: "DOH Compliance",
      status: "in_progress",
      progress: 85,
      description: "Department of Health compliance and reporting",
      dependencies: ["validation-service", "audit-trail"],
      criticalIssues: [
        "Missing 9-domain assessment validation",
        "Incomplete audit trail logging",
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "mobile-pwa",
      name: "Mobile PWA",
      status: "in_progress",
      progress: 70,
      description: "Progressive Web App for mobile devices",
      dependencies: ["offline-service", "camera-service"],
      criticalIssues: ["Offline sync incomplete", "Camera integration pending"],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "ai-optimization",
      name: "AI Optimization",
      status: "pending",
      progress: 30,
      description: "AI-powered route optimization and predictive analytics",
      dependencies: ["analytics-service", "machine-learning-models"],
      criticalIssues: [
        "ML models not trained",
        "Analytics pipeline incomplete",
      ],
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [criticalIssuesCount, setCriticalIssuesCount] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateOverallMetrics();
  }, [modules]);

  const calculateOverallMetrics = () => {
    const totalProgress = modules.reduce(
      (sum, module) => sum + module.progress,
      0,
    );
    const avgProgress = totalProgress / modules.length;
    const criticalCount = modules.reduce(
      (sum, module) => sum + module.criticalIssues.length,
      0,
    );
    const completedCount = modules.filter(
      (module) => module.status === "completed",
    ).length;

    setOverallProgress(Math.round(avgProgress));
    setCriticalIssuesCount(criticalCount);
    setCompletedModules(completedCount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "pending":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      in_progress: "secondary",
      pending: "outline",
      error: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const refreshStatus = async () => {
    setLoading(true);
    // Simulate API call to refresh status
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              Reyada Homecare Platform Status
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive platform completion and robustness monitoring
            </p>
          </div>
          <Button onClick={refreshStatus} disabled={loading} variant="outline">
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Status
          </Button>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {overallProgress}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <Progress value={overallProgress} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Modules</p>
                  <p className="text-3xl font-bold text-green-600">
                    {completedModules}/{modules.length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Issues</p>
                  <p className="text-3xl font-bold text-red-600">
                    {criticalIssuesCount}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform Health</p>
                  <p className="text-3xl font-bold text-green-600">
                    {criticalIssuesCount === 0 ? "Excellent" : "Good"}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Modules Status</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="issues">Critical Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Modules Status Tab */}
          <TabsContent value="modules" className="space-y-4">
            {modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(module.status)}
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      {getStatusBadge(module.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {module.progress}%
                      </div>
                    </div>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={module.progress} className="h-2" />

                    {module.criticalIssues.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">
                          Critical Issues ({module.criticalIssues.length})
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {module.criticalIssues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(module.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Dependencies</CardTitle>
                <CardDescription>
                  Dependency relationships between platform modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(module.status)}
                        <h3 className="font-medium">{module.name}</h3>
                      </div>
                      {module.dependencies.length > 0 ? (
                        <div className="ml-7">
                          <p className="text-sm text-gray-600 mb-2">
                            Depends on:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {module.dependencies.map((dep) => (
                              <Badge
                                key={dep}
                                variant="outline"
                                className="text-xs"
                              >
                                {dep.replace("-", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 ml-7">
                          No dependencies
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Critical Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Critical Issues Requiring Attention
                </CardTitle>
                <CardDescription>
                  Issues that need immediate resolution for 100% platform
                  completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                {criticalIssuesCount === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-green-600 font-medium">
                      No critical issues found!
                    </p>
                    <p className="text-gray-500 text-sm">
                      Platform is operating optimally
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules
                      .filter((module) => module.criticalIssues.length > 0)
                      .map((module) => (
                        <div
                          key={module.id}
                          className="border-l-4 border-red-500 pl-4"
                        >
                          <h3 className="font-medium text-red-800">
                            {module.name}
                          </h3>
                          <ul className="mt-2 space-y-1">
                            {module.criticalIssues.map((issue, index) => (
                              <li key={index} className="text-sm text-red-700">
                                • {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Recommendations</CardTitle>
                <CardDescription>
                  Priority actions to achieve 100% platform completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-blue-800">High Priority</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li>• Complete DOH 9-domain assessment validation</li>
                      <li>• Implement comprehensive audit trail logging</li>
                      <li>• Finalize mobile PWA offline synchronization</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h3 className="font-medium text-yellow-800">
                      Medium Priority
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                      <li>• Integrate camera functionality for mobile app</li>
                      <li>• Develop AI optimization algorithms</li>
                      <li>• Enhance real-time analytics pipeline</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-medium text-green-800">Low Priority</h3>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li>• Performance optimization and caching</li>
                      <li>• Advanced reporting and dashboard features</li>
                      <li>• Integration with external healthcare systems</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
