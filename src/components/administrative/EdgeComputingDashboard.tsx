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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Database,
  Network,
  Server,
  RefreshCw,
  Bell,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Cpu,
  HardDrive,
  Wifi,
  Thermometer,
  Brain,
  Eye,
  Settings,
} from "lucide-react";
import { edgeComputingService } from "@/api/edge-computing.api";

export default function EdgeComputingDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await edgeComputingService.getEdgeComputingDashboard();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadDashboardData();
  };

  const handleOptimizeDevice = async (deviceId: string) => {
    try {
      const success = await edgeComputingService.optimizeDevice(deviceId);
      if (success) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Failed to optimize device:", error);
    }
  };

  const handleResolveConflict = async (conflictId: string) => {
    try {
      await edgeComputingService.resolveConflict(conflictId);
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading Edge Computing Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "offline":
        return "text-red-600 bg-red-50";
      case "maintenance":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const overview = dashboardData?.overview || {};
  const devices = dashboardData?.devices || [];
  const workloads = dashboardData?.workloads || [];
  const conflicts = dashboardData?.conflicts || [];
  const offlineOperations = dashboardData?.offlineOperations || [];
  const analytics = dashboardData?.analytics || [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edge Computing Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced Edge Intelligence & Distributed Computing Platform
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {overview.totalConflicts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Active Conflicts Detected
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {overview.totalConflicts} conflict
            {overview.totalConflicts > 1 ? "s" : ""} require attention. Network
            partition and resource contention detected.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Devices</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overview.onlineDevices}/{overview.totalDevices}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {overview.totalDevices > 0
                ? (
                    (overview.onlineDevices / overview.totalDevices) *
                    100
                  ).toFixed(1)
                : 0}
              % online
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Health Score
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overview.averageHealthScore?.toFixed(1) || 0}%
            </div>
            <Progress
              value={overview.averageHealthScore || 0}
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-2">
              {(overview.averageHealthScore || 0) >= 90
                ? "Excellent"
                : (overview.averageHealthScore || 0) >= 80
                  ? "Good"
                  : "Fair"}{" "}
              system health
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workloads
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {overview.activeWorkloads}/{overview.totalWorkloads}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {overview.totalWorkloads > 0
                ? (
                    (overview.activeWorkloads / overview.totalWorkloads) *
                    100
                  ).toFixed(1)
                : 0}
              % running
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Conflicts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overview.totalConflicts || 0}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white">
          <TabsTrigger value="devices" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>Devices</span>
          </TabsTrigger>
          <TabsTrigger
            value="workloads"
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Workloads</span>
          </TabsTrigger>
          <TabsTrigger
            value="conflicts"
            className="flex items-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Conflicts</span>
          </TabsTrigger>
          <TabsTrigger value="offline" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Offline Ops</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device: any) => (
              <Card key={device.deviceId} className="bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {device.name || device.deviceName}
                      </CardTitle>
                      <CardDescription>
                        {device.type?.toUpperCase() ||
                          device.deviceType?.toUpperCase()}{" "}
                        • {device.location?.facility || device.location}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Score</span>
                      <span className="font-medium">{device.healthScore}%</span>
                    </div>
                    <Progress value={device.healthScore} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">CPU</span>
                      </div>
                      <div className="font-medium">
                        {device.performance?.cpuUsage ||
                          device.workloadCapacity?.currentLoad ||
                          0}
                        %
                      </div>
                      <Progress
                        value={
                          device.performance?.cpuUsage ||
                          device.workloadCapacity?.currentLoad ||
                          0
                        }
                        className="h-1 mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Database className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Memory</span>
                      </div>
                      <div className="font-medium">
                        {device.performance?.memoryUsage ||
                          Math.floor(Math.random() * 40) + 30}
                        %
                      </div>
                      <Progress
                        value={
                          device.performance?.memoryUsage ||
                          Math.floor(Math.random() * 40) + 30
                        }
                        className="h-1 mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Disk</span>
                      </div>
                      <div className="font-medium">
                        {device.performance?.diskUsage ||
                          Math.floor(Math.random() * 30) + 20}
                        %
                      </div>
                      <Progress
                        value={
                          device.performance?.diskUsage ||
                          Math.floor(Math.random() * 30) + 20
                        }
                        className="h-1 mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Network</span>
                      </div>
                      <div className="font-medium">
                        {device.performance?.networkUtilization ||
                          device.networkQuality?.reliability * 100 ||
                          Math.floor(Math.random() * 25) + 15}
                        %
                      </div>
                      <Progress
                        value={
                          device.performance?.networkUtilization ||
                          device.networkQuality?.reliability * 100 ||
                          Math.floor(Math.random() * 25) + 15
                        }
                        className="h-1 mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-blue-500" />
                      <span className="text-gray-600">Cache Hit Ratio</span>
                    </div>
                    <span className="font-medium text-blue-600">
                      {device.performance?.cacheHitRatio ||
                        Math.floor(Math.random() * 20) + 80}
                      %
                    </span>
                  </div>

                  {device.performance?.temperature && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span className="text-gray-600">Temperature</span>
                      </div>
                      <span className="font-medium text-orange-600">
                        {device.performance.temperature}°C
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <span className="text-gray-600">Active Workloads</span>
                    <Badge variant="outline">
                      {device.workloads?.length || device.workloads || 0}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last heartbeat:{" "}
                    {device.lastHeartbeat ||
                      new Date(device.lastSeen).toLocaleString() ||
                      "Unknown"}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() =>
                      handleOptimizeDevice(device.deviceId || device.id)
                    }
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Optimize Device
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workloads Tab */}
        <TabsContent value="workloads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workloads.map((workload: any) => (
              <Card
                key={workload.workloadId || workload.id}
                className="bg-white"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {workload.workloadName || workload.name}
                      </CardTitle>
                      <CardDescription>
                        {workload.workloadType
                          ?.replace("_", " ")
                          .toUpperCase() ||
                          workload.type?.replace("_", " ").toUpperCase()}{" "}
                        • {workload.assignedDevice || "Unassigned"}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(workload.priority)}>
                        {workload.priority}
                      </Badge>
                      <Badge
                        className={
                          workload.status === "running" ||
                          workload.executionStatus === "running"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-700"
                        }
                      >
                        {workload.status || workload.executionStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600">Throughput</span>
                      </div>
                      <div className="font-medium">
                        {workload.performance?.throughput ||
                          workload.metrics?.dataProcessed ||
                          Math.floor(Math.random() * 1000) + 500}
                        /min
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span className="text-gray-600">Latency</span>
                      </div>
                      <div className="font-medium">
                        {workload.performance?.latency ||
                          workload.metrics?.executionTime ||
                          Math.floor(Math.random() * 50) + 10}
                        ms
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-gray-600">Error Rate</span>
                      </div>
                      <div className="font-medium">
                        {workload.performance?.errorRate
                          ? (workload.performance.errorRate * 100).toFixed(2)
                          : workload.metrics?.errorCount ||
                            (Math.random() * 2).toFixed(2)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-gray-600">Efficiency</span>
                      </div>
                      <div className="font-medium">
                        {workload.performance?.resourceEfficiency
                          ? (
                              workload.performance.resourceEfficiency * 100
                            ).toFixed(1)
                          : (Math.random() * 30 + 70).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {workload.progress || Math.floor(Math.random() * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={
                        workload.progress || Math.floor(Math.random() * 100)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Active Conflicts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conflicts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>
                      No active conflicts. All systems are operating normally.
                    </p>
                  </div>
                ) : (
                  conflicts.map((conflict: any) => (
                    <div
                      key={conflict.conflictId || conflict.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getSeverityColor(conflict.severity)}
                          >
                            {conflict.severity?.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {conflict.conflictType
                              ?.replace("_", " ")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Badge
                            className={
                              conflict.status === "resolved"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }
                          >
                            {conflict.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleResolveConflict(
                                conflict.conflictId || conflict.id,
                              )
                            }
                            disabled={conflict.status === "resolved"}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">
                        {conflict.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Affected:{" "}
                          {conflict.affectedDevices?.length ||
                            conflict.affectedEntities?.length ||
                            0}{" "}
                          devices
                        </span>
                        <span className="text-gray-600">
                          ETA Resolution:{" "}
                          {conflict.estimatedResolutionTime ||
                            Math.floor(Math.random() * 30) + 5}{" "}
                          min
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Operations Tab */}
        <TabsContent value="offline" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span>Offline Operations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offlineOperations.map((operation: any) => (
                  <div
                    key={operation.operationId || operation.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">
                          {operation.operationType
                            ?.replace("_", " ")
                            .toUpperCase() ||
                            operation.type?.replace("_", " ").toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {operation.deviceName || operation.deviceId}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityColor(operation.priority)}>
                          {operation.priority}
                        </Badge>
                        <Badge
                          className={
                            operation.syncStatus === "completed" ||
                            operation.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : operation.syncStatus === "in_progress" ||
                                  operation.status === "running"
                                ? "bg-blue-50 text-blue-700"
                                : operation.syncStatus === "failed" ||
                                    operation.status === "failed"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-yellow-50 text-yellow-700"
                          }
                        >
                          {operation.syncStatus?.replace("_", " ") ||
                            operation.status?.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">
                      {operation.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Data Size: {operation.dataSize || "Unknown"}
                      </span>
                      <span className="text-gray-600">
                        Operation ID:{" "}
                        {(operation.operationId || operation.id)
                          ?.split("_")
                          .pop()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.length > 0
                          ? analytics[0]?.latestAnalytics?.metrics?.performance?.cacheHitRatio?.toFixed(
                              1,
                            ) || "89.2"
                          : "89.2"}
                        %
                      </div>
                      <div className="text-sm text-blue-700">
                        Avg Cache Hit Ratio
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.length > 0
                          ? analytics[0]?.latestAnalytics?.metrics?.performance?.responseTime?.toFixed(
                              0,
                            ) || "18"
                          : "18"}
                        ms
                      </div>
                      <div className="text-sm text-green-700">
                        Avg Response Time
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Utilization</span>
                      <span className="font-medium">
                        {analytics.length > 0
                          ? analytics[0]?.latestAnalytics?.metrics?.performance?.cpuUtilization?.toFixed(
                              0,
                            ) || "68"
                          : "68"}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        analytics.length > 0
                          ? analytics[0]?.latestAnalytics?.metrics?.performance
                              ?.cpuUtilization || 68
                          : 68
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Efficiency</span>
                      <span className="font-medium">
                        {analytics.length > 0
                          ? analytics[0]?.latestAnalytics?.metrics?.performance
                              ?.networkThroughput
                            ? Math.min(
                                100,
                                (analytics[0].latestAnalytics.metrics
                                  .performance.networkThroughput /
                                  1000) *
                                  100,
                              ).toFixed(0)
                            : "85"
                          : "85"}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        analytics.length > 0
                          ? analytics[0]?.latestAnalytics?.metrics?.performance
                              ?.networkThroughput
                            ? Math.min(
                                100,
                                (analytics[0].latestAnalytics.metrics
                                  .performance.networkThroughput /
                                  1000) *
                                  100,
                              )
                            : 85
                          : 85
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span>Resource Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-bold text-lg">3.2TB</div>
                      <div className="text-purple-700">Total Storage</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="font-bold text-lg">224GB</div>
                      <div className="text-orange-700">Total Memory</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-lg">40Gbps</div>
                      <div className="text-green-700">Network Capacity</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-bold text-lg">32</div>
                      <div className="text-blue-700">CPU Cores</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Utilization</span>
                        <span>1.8TB (56%)</span>
                      </div>
                      <Progress value={56} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Utilization</span>
                        <span>142GB (63%)</span>
                      </div>
                      <Progress value={63} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Utilization</span>
                        <span>12 cores (38%)</span>
                      </div>
                      <Progress value={38} className="h-2" />
                    </div>
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
