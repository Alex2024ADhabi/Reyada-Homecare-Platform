import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Shield,
  Zap,
  Heart,
  Brain,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  TrendingUp,
  Database,
  Lock,
  FileCheck,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3,
  RefreshCw,
  Power,
  AlertCircle,
} from "lucide-react";
import { masterPlatformControllerService } from "@/services/master-platform-controller.service";
import { productionGradeOrchestratorService } from "@/services/production-grade-orchestrator.service";

interface MasterHealthDashboardProps {
  className?: string;
}

export function MasterHealthDashboard({
  className = "",
}: MasterHealthDashboardProps) {
  const [controllerStatus, setControllerStatus] = useState(null);
  const [subsystemStatuses, setSubsystemStatuses] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState(null);
  const [advancedHealth, setAdvancedHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize and fetch data
  useEffect(() => {
    const initializeController = async () => {
      try {
        await masterPlatformControllerService.initialize();
        await updateDashboardData();
      } catch (error) {
        console.error("Failed to initialize controller:", error);
      }
    };

    initializeController();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(updateDashboardData, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const updateDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get controller status
      const status = masterPlatformControllerService.getControllerStatus();
      setControllerStatus(status);

      // Get subsystem statuses
      const subsystems = masterPlatformControllerService.getSubsystemStatuses();
      setSubsystemStatuses(subsystems);

      // Get platform metrics
      const metrics = masterPlatformControllerService.getPlatformMetrics();
      setPlatformMetrics(metrics);

      // Get advanced health status
      const health =
        productionGradeOrchestratorService.getAdvancedHealthStatus();
      setAdvancedHealth(health);

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPTIMAL":
      case "ACTIVE":
        return "text-green-600 bg-green-100";
      case "DEGRADED":
        return "text-yellow-600 bg-yellow-100";
      case "CRITICAL":
      case "ERROR":
        return "text-red-600 bg-red-100";
      case "MAINTENANCE":
      case "INACTIVE":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPTIMAL":
      case "ACTIVE":
        return CheckCircle;
      case "DEGRADED":
        return AlertTriangle;
      case "CRITICAL":
      case "ERROR":
        return XCircle;
      case "MAINTENANCE":
      case "INACTIVE":
        return Settings;
      default:
        return AlertCircle;
    }
  };

  const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const handleEmergencyShutdown = async () => {
    if (confirm("Are you sure you want to execute emergency shutdown?")) {
      try {
        await masterPlatformControllerService.executeEmergencyShutdown(
          "Manual emergency shutdown initiated",
        );
        await updateDashboardData();
      } catch (error) {
        console.error("Emergency shutdown failed:", error);
      }
    }
  };

  const handleRestart = async () => {
    if (confirm("Are you sure you want to restart the platform controller?")) {
      try {
        await masterPlatformControllerService.restart();
        await updateDashboardData();
      } catch (error) {
        console.error("Restart failed:", error);
      }
    }
  };

  if (isLoading && !controllerStatus) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Initializing Master Health Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Master Health Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive platform monitoring and control center
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`}
            />
            {autoRefresh ? "Auto" : "Manual"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={updateDashboardData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {controllerStatus && controllerStatus.overallStatus !== "OPTIMAL" && (
        <Alert
          variant={
            controllerStatus.overallStatus === "CRITICAL"
              ? "destructive"
              : "default"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Platform Status: {controllerStatus.overallStatus}</strong>
            {controllerStatus.overallStatus === "CRITICAL" && (
              <span className="ml-2">
                Immediate attention required. Check subsystem statuses below.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Status
            </CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {controllerStatus?.overallStatus || "UNKNOWN"}
            </div>
            <p className="text-xs text-muted-foreground">
              System Health: {controllerStatus?.systemHealth || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subsystems
            </CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {controllerStatus?.activeSubsystems || 0}/
              {controllerStatus?.totalSubsystems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                ((controllerStatus?.activeSubsystems || 0) /
                  (controllerStatus?.totalSubsystems || 1)) *
                  100,
              )}
              % operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Score
            </CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {controllerStatus?.performanceScore || 0}%
            </div>
            <Progress
              value={controllerStatus?.performanceScore || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(controllerStatus?.uptime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Since last restart</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subsystems">Subsystems</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Health</span>
                    <span>{advancedHealth?.overallHealth || 0}%</span>
                  </div>
                  <Progress
                    value={advancedHealth?.overallHealth || 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Robustness Score</span>
                    <span>{controllerStatus?.robustnessScore || 0}%</span>
                  </div>
                  <Progress
                    value={controllerStatus?.robustnessScore || 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Security Score</span>
                    <span>{controllerStatus?.securityScore || 0}%</span>
                  </div>
                  <Progress
                    value={controllerStatus?.securityScore || 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span>{controllerStatus?.complianceScore || 0}%</span>
                  </div>
                  <Progress
                    value={controllerStatus?.complianceScore || 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advancedHealth?.recommendations?.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  )) || (
                    <div className="text-sm text-gray-500">
                      No recommendations available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Insights */}
          {advancedHealth?.predictiveInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advancedHealth.predictiveInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subsystems" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subsystemStatuses.map((subsystem, index) => {
              const StatusIcon = getStatusIcon(subsystem.status);
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <StatusIcon
                          className={`h-4 w-4 mr-2 ${getStatusColor(subsystem.status).split(" ")[0]}`}
                        />
                        {subsystem.name}
                      </div>
                      <Badge className={getStatusColor(subsystem.status)}>
                        {subsystem.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Health</span>
                          <span>{subsystem.health}%</span>
                        </div>
                        <Progress value={subsystem.health} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Response Time</span>
                          <div className="font-medium">
                            {subsystem.responseTime}ms
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors</span>
                          <div className="font-medium">
                            {subsystem.errorCount}
                          </div>
                        </div>
                      </div>
                      {subsystem.criticalIssues.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-red-600">
                            Critical Issues:
                          </span>
                          {subsystem.criticalIssues.map((issue, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-red-600 bg-red-50 p-2 rounded"
                            >
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {platformMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Avg Response Time
                      </span>
                      <div className="text-lg font-semibold">
                        {Math.round(
                          platformMetrics.performance.averageResponseTime,
                        )}
                        ms
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Throughput</span>
                      <div className="text-lg font-semibold">
                        {Math.round(platformMetrics.performance.throughput)}{" "}
                        req/s
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Error Rate</span>
                      <div className="text-lg font-semibold">
                        {platformMetrics.performance.errorRate}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Availability
                      </span>
                      <div className="text-lg font-semibold">
                        {platformMetrics.performance.availability}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <Cpu className="h-4 w-4 mr-1" /> CPU Usage
                        </span>
                        <span>
                          {Math.round(platformMetrics.resources.cpuUsage)}%
                        </span>
                      </div>
                      <Progress
                        value={platformMetrics.resources.cpuUsage}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-1" /> Memory Usage
                        </span>
                        <span>
                          {Math.round(platformMetrics.resources.memoryUsage)}%
                        </span>
                      </div>
                      <Progress
                        value={platformMetrics.resources.memoryUsage}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <Database className="h-4 w-4 mr-1" /> Disk Usage
                        </span>
                        <span>
                          {Math.round(platformMetrics.resources.diskUsage)}%
                        </span>
                      </div>
                      <Progress
                        value={platformMetrics.resources.diskUsage}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center">
                          <Wifi className="h-4 w-4 mr-1" /> Network
                        </span>
                        <span>
                          {Math.round(
                            platformMetrics.resources.networkUtilization,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={platformMetrics.resources.networkUtilization}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {platformMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    Threat Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {platformMetrics.security.threatLevel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current security status
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                    Active Threats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformMetrics.security.activeThreats}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Detected threats
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-green-600" />
                    Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformMetrics.security.securityEvents}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {platformMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                    DOH Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {platformMetrics.compliance.dohCompliance}%
                  </div>
                  <Progress
                    value={platformMetrics.compliance.dohCompliance}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-green-600" />
                    DAMAN Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {platformMetrics.compliance.damanCompliance}%
                  </div>
                  <Progress
                    value={platformMetrics.compliance.damanCompliance}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-purple-600" />
                    JAWDA Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {platformMetrics.compliance.jawdaCompliance}%
                  </div>
                  <Progress
                    value={platformMetrics.compliance.jawdaCompliance}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-red-600" />
                    HIPAA Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {platformMetrics.compliance.hipaaCompliance}%
                  </div>
                  <Progress
                    value={platformMetrics.compliance.hipaaCompliance}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Platform Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleRestart}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Platform Controller
                </Button>
                <Button
                  onClick={handleEmergencyShutdown}
                  className="w-full"
                  variant="destructive"
                >
                  <Power className="h-4 w-4 mr-2" />
                  Emergency Shutdown
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Platform Version</span>
                    <div className="font-medium">v2.1.0</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Build</span>
                    <div className="font-medium">Production</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Environment</span>
                    <div className="font-medium">Healthcare</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Region</span>
                    <div className="font-medium">UAE</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MasterHealthDashboard;
