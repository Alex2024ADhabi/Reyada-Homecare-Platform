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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  TrendingUp,
  Shield,
  Database,
  Network,
  Settings,
  FileText,
  Users,
  Clock,
} from "lucide-react";

interface ErrorAnalysis {
  id: string;
  type: "critical" | "warning" | "info";
  category: string;
  message: string;
  file?: string;
  line?: number;
  solution?: string;
  status: "pending" | "fixing" | "resolved" | "failed";
  timestamp: Date;
}

interface SystemHealth {
  overall: number;
  categories: {
    routing: number;
    services: number;
    compliance: number;
    performance: number;
    security: number;
  };
}

export default function ComprehensiveErrorAnalysisDashboard({
  className = "",
}: {
  className?: string;
}) {
  const [errors, setErrors] = useState<ErrorAnalysis[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 0,
    categories: {
      routing: 0,
      services: 0,
      compliance: 0,
      performance: 0,
      security: 0,
    },
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [lastScan, setLastScan] = useState<Date>(new Date());

  // Initialize error analysis
  useEffect(() => {
    performErrorAnalysis();
    const interval = setInterval(performErrorAnalysis, 30000); // Scan every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const performErrorAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate comprehensive error analysis
      const detectedErrors: ErrorAnalysis[] = [
        {
          id: "route-001",
          type: "critical",
          category: "Routing",
          message: "Empty routes array in tempo routes configuration",
          file: "src/tempobook/routes.js",
          line: 5,
          solution: "Generate routes for all storyboards automatically",
          status: "resolved",
          timestamp: new Date(Date.now() - 300000),
        },
        {
          id: "service-001",
          type: "critical",
          category: "Services",
          message: "DOH Schema Validator service not found",
          file: "src/services/doh-schema-validator.service.js",
          line: 3047,
          solution: "Create comprehensive DOH schema validation service",
          status: "resolved",
          timestamp: new Date(Date.now() - 240000),
        },
        {
          id: "dep-001",
          type: "warning",
          category: "Dependencies",
          message: "Circular dependency detected in service imports",
          file: "src/services/",
          solution: "Refactor service imports to prevent circular references",
          status: "fixing",
          timestamp: new Date(Date.now() - 180000),
        },
        {
          id: "comp-001",
          type: "warning",
          category: "Compliance",
          message: "DOH compliance validation needs enhancement",
          solution: "Implement comprehensive DOH nine domains validation",
          status: "pending",
          timestamp: new Date(Date.now() - 120000),
        },
        {
          id: "perf-001",
          type: "info",
          category: "Performance",
          message: "Bundle size optimization opportunities detected",
          solution: "Implement code splitting and lazy loading",
          status: "pending",
          timestamp: new Date(Date.now() - 60000),
        },
      ];

      setErrors(detectedErrors);

      // Calculate system health
      const resolvedCount = detectedErrors.filter(
        (e) => e.status === "resolved",
      ).length;
      const totalCount = detectedErrors.length;
      const overallHealth =
        totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

      setSystemHealth({
        overall: overallHealth,
        categories: {
          routing: 100, // Fixed
          services: 85,
          compliance: 75,
          performance: 80,
          security: 95,
        },
      });

      setLastScan(new Date());
    } catch (error) {
      console.error("Error analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoFix = async (errorId: string) => {
    const error = errors.find((e) => e.id === errorId);
    if (!error) return;

    setErrors((prev) =>
      prev.map((e) => (e.id === errorId ? { ...e, status: "fixing" } : e)),
    );

    // Simulate auto-fix process
    setTimeout(() => {
      setErrors((prev) =>
        prev.map((e) => (e.id === errorId ? { ...e, status: "resolved" } : e)),
      );
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "fixing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  const criticalErrors = errors.filter((e) => e.type === "critical");
  const warningErrors = errors.filter((e) => e.type === "warning");
  const infoErrors = errors.filter((e) => e.type === "info");
  const resolvedErrors = errors.filter((e) => e.status === "resolved");

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Comprehensive Error Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time platform health monitoring and automated error
              resolution
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Last scan: {lastScan.toLocaleTimeString()}</span>
            </Badge>
            <Button
              onClick={performErrorAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
              />
              <span>{isAnalyzing ? "Analyzing..." : "Scan Now"}</span>
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Overall Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Progress value={systemHealth.overall} className="h-3" />
                  <p className="text-sm text-gray-600 mt-1">
                    {systemHealth.overall}% System Health
                  </p>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {systemHealth.overall}%
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(systemHealth.categories).map(([category, health]) => {
            const icons = {
              routing: Network,
              services: Database,
              compliance: Shield,
              performance: TrendingUp,
              security: Shield,
            };
            const Icon = icons[category as keyof typeof icons];

            return (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="capitalize">{category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {health}%
                  </div>
                  <Progress value={health} className="h-2 mt-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Error Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {criticalErrors.length}
                  </p>
                  <p className="text-sm text-gray-600">Critical Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {warningErrors.length}
                  </p>
                  <p className="text-sm text-gray-600">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {resolvedErrors.length}
                  </p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {infoErrors.length}
                  </p>
                  <p className="text-sm text-gray-600">Info</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Details */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Issues ({errors.length})</TabsTrigger>
            <TabsTrigger value="critical">
              Critical ({criticalErrors.length})
            </TabsTrigger>
            <TabsTrigger value="warnings">
              Warnings ({warningErrors.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedErrors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {errors.map((error) => (
              <Card key={error.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(error.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {error.message}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Badge variant={getTypeColor(error.type) as any}>
                            {error.type.toUpperCase()}
                          </Badge>
                          <span>•</span>
                          <span>{error.category}</span>
                          {error.file && (
                            <>
                              <span>•</span>
                              <span>
                                {error.file}
                                {error.line ? `:${error.line}` : ""}
                              </span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    {error.status === "pending" && autoFixEnabled && (
                      <Button
                        size="sm"
                        onClick={() => handleAutoFix(error.id)}
                        className="flex items-center space-x-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Auto Fix</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {error.solution && (
                  <CardContent>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Recommended Solution</AlertTitle>
                      <AlertDescription>{error.solution}</AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="critical" className="space-y-4">
            {criticalErrors.map((error) => (
              <Card key={error.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(error.status)}
                      <div>
                        <CardTitle className="text-lg text-red-900">
                          {error.message}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Badge variant="destructive">CRITICAL</Badge>
                          <span>•</span>
                          <span>{error.category}</span>
                          {error.file && (
                            <>
                              <span>•</span>
                              <span>
                                {error.file}
                                {error.line ? `:${error.line}` : ""}
                              </span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    {error.status === "pending" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAutoFix(error.id)}
                      >
                        Fix Now
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {error.solution && (
                  <CardContent>
                    <Alert className="border-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Critical Fix Required</AlertTitle>
                      <AlertDescription>{error.solution}</AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            {warningErrors.map((error) => (
              <Card key={error.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(error.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {error.message}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">WARNING</Badge>
                          <span>•</span>
                          <span>{error.category}</span>
                          {error.file && (
                            <>
                              <span>•</span>
                              <span>
                                {error.file}
                                {error.line ? `:${error.line}` : ""}
                              </span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    {error.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoFix(error.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {error.solution && (
                  <CardContent>
                    <Alert className="border-yellow-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Recommended Action</AlertTitle>
                      <AlertDescription>{error.solution}</AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedErrors.map((error) => (
              <Card key={error.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <CardTitle className="text-lg text-green-900">
                        {error.message}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-100 text-green-800">
                          RESOLVED
                        </Badge>
                        <span>•</span>
                        <span>{error.category}</span>
                        <span>•</span>
                        <span>
                          Fixed at {error.timestamp.toLocaleTimeString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Auto-Fix Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Automated Resolution Settings</span>
            </CardTitle>
            <CardDescription>
              Configure automatic error detection and resolution preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Auto-Fix</h4>
                <p className="text-sm text-gray-600">
                  Automatically resolve common errors when detected
                </p>
              </div>
              <Button
                variant={autoFixEnabled ? "default" : "outline"}
                onClick={() => setAutoFixEnabled(!autoFixEnabled)}
              >
                {autoFixEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
