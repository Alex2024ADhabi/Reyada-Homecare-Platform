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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Activity,
  Server,
  Database,
  Wifi,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
  LineChart,
  Gauge,
  Settings,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import {
  getRealTimeMetrics,
  getBusinessIntelligence,
} from "@/services/real-time-analytics.service";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: "up" | "down" | "stable";
  change: number;
  status: "healthy" | "warning" | "critical";
  category: "performance" | "availability" | "security" | "capacity";
}

interface PerformanceAlert {
  id: string;
  type: "performance" | "availability" | "security" | "capacity";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

interface ScalabilityMetric {
  component: string;
  currentLoad: number;
  maxCapacity: number;
  utilizationPercentage: number;
  scalingRecommendation: string;
  autoScalingEnabled: boolean;
  nextScalingThreshold: number;
}

interface ResponseTimeMetric {
  endpoint: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  availability: number;
}

interface PerformanceAnalyticsDashboardProps {
  refreshInterval?: number;
}

const PerformanceAnalyticsDashboard: React.FC<
  PerformanceAnalyticsDashboardProps
> = ({
  refreshInterval = 15000, // 15 seconds for performance monitoring
}) => {
  const { toast } = useToastContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      id: "cpu_usage",
      name: "CPU Usage",
      value: 23.4,
      unit: "%",
      threshold: { warning: 70, critical: 85 },
      trend: "stable",
      change: 0.2,
      status: "healthy",
      category: "performance",
    },
    {
      id: "memory_usage",
      name: "Memory Usage",
      value: 67.8,
      unit: "%",
      threshold: { warning: 80, critical: 90 },
      trend: "up",
      change: 2.1,
      status: "healthy",
      category: "performance",
    },
    {
      id: "disk_usage",
      name: "Disk Usage",
      value: 45.2,
      unit: "%",
      threshold: { warning: 80, critical: 90 },
      trend: "up",
      change: 1.3,
      status: "healthy",
      category: "capacity",
    },
    {
      id: "network_latency",
      name: "Network Latency",
      value: 12.3,
      unit: "ms",
      threshold: { warning: 100, critical: 200 },
      trend: "down",
      change: -2.1,
      status: "healthy",
      category: "performance",
    },
    {
      id: "database_connections",
      name: "Database Connections",
      value: 45,
      unit: "active",
      threshold: { warning: 80, critical: 95 },
      trend: "stable",
      change: 0.5,
      status: "healthy",
      category: "capacity",
    },
    {
      id: "system_uptime",
      name: "System Uptime",
      value: 99.97,
      unit: "%",
      threshold: { warning: 99.5, critical: 99.0 },
      trend: "stable",
      change: 0.01,
      status: "healthy",
      category: "availability",
    },
    {
      id: "security_score",
      name: "Security Score",
      value: 94.2,
      unit: "/100",
      threshold: { warning: 80, critical: 70 },
      trend: "up",
      change: 1.2,
      status: "healthy",
      category: "security",
    },
    {
      id: "error_rate",
      name: "Error Rate",
      value: 0.03,
      unit: "%",
      threshold: { warning: 1.0, critical: 2.0 },
      trend: "down",
      change: -0.02,
      status: "healthy",
      category: "performance",
    },
  ]);

  const [performanceAlerts, setPerformanceAlerts] = useState<
    PerformanceAlert[]
  >([
    {
      id: "alert_001",
      type: "performance",
      severity: "medium",
      title: "Database Query Performance Degradation",
      description:
        "Average query response time increased by 15% in the last hour",
      metric: "database_response_time",
      threshold: 500,
      currentValue: 575,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "alert_002",
      type: "capacity",
      severity: "low",
      title: "Memory Usage Trending Upward",
      description:
        "Memory usage has been steadily increasing over the past 2 hours",
      metric: "memory_usage",
      threshold: 80,
      currentValue: 67.8,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "alert_003",
      type: "availability",
      severity: "high",
      title: "Service Downtime Detected",
      description: "Authentication service experienced 2-minute downtime",
      metric: "service_availability",
      threshold: 99.9,
      currentValue: 99.7,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true,
      resolution: "Service restarted and load balancer reconfigured",
    },
  ]);

  const [scalabilityMetrics, setScalabilityMetrics] = useState<
    ScalabilityMetric[]
  >([
    {
      component: "Web Servers",
      currentLoad: 3,
      maxCapacity: 10,
      utilizationPercentage: 30,
      scalingRecommendation: "Current capacity sufficient",
      autoScalingEnabled: true,
      nextScalingThreshold: 70,
    },
    {
      component: "Database Cluster",
      currentLoad: 2,
      maxCapacity: 5,
      utilizationPercentage: 40,
      scalingRecommendation: "Consider read replicas for better performance",
      autoScalingEnabled: false,
      nextScalingThreshold: 80,
    },
    {
      component: "Cache Layer",
      currentLoad: 1,
      maxCapacity: 3,
      utilizationPercentage: 33,
      scalingRecommendation: "Optimal configuration",
      autoScalingEnabled: true,
      nextScalingThreshold: 75,
    },
    {
      component: "Message Queue",
      currentLoad: 2,
      maxCapacity: 8,
      utilizationPercentage: 25,
      scalingRecommendation: "Well within capacity limits",
      autoScalingEnabled: true,
      nextScalingThreshold: 60,
    },
  ]);

  const [responseTimeMetrics, setResponseTimeMetrics] = useState<
    ResponseTimeMetric[]
  >([
    {
      endpoint: "/api/patients",
      avgResponseTime: 145,
      p95ResponseTime: 280,
      p99ResponseTime: 450,
      requestsPerSecond: 23.4,
      errorRate: 0.02,
      availability: 99.98,
    },
    {
      endpoint: "/api/clinical/assessments",
      avgResponseTime: 89,
      p95ResponseTime: 156,
      p99ResponseTime: 234,
      requestsPerSecond: 15.7,
      errorRate: 0.01,
      availability: 99.99,
    },
    {
      endpoint: "/api/revenue/analytics",
      avgResponseTime: 234,
      p95ResponseTime: 456,
      p99ResponseTime: 678,
      requestsPerSecond: 8.9,
      errorRate: 0.05,
      availability: 99.95,
    },
    {
      endpoint: "/api/compliance/reports",
      avgResponseTime: 567,
      p95ResponseTime: 890,
      p99ResponseTime: 1200,
      requestsPerSecond: 4.2,
      errorRate: 0.03,
      availability: 99.97,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [realTimeMetrics, businessIntelligence] = await Promise.all([
        getRealTimeMetrics(),
        getBusinessIntelligence({ includePerformance: true }),
      ]);

      // Update system metrics with real data
      if (realTimeMetrics.systemMetrics) {
        setSystemMetrics((prev) =>
          prev.map((metric) => {
            const updatedData = realTimeMetrics.systemMetrics[metric.id];
            return updatedData ? { ...metric, ...updatedData } : metric;
          }),
        );
      }

      // Update performance alerts
      if (realTimeMetrics.alerts) {
        setPerformanceAlerts(
          realTimeMetrics.alerts.filter((alert) =>
            ["performance", "availability", "security", "capacity"].includes(
              alert.type,
            ),
          ),
        );
      }

      // Update scalability metrics
      if (businessIntelligence.scalability) {
        setScalabilityMetrics(businessIntelligence.scalability);
      }

      // Update response time metrics
      if (realTimeMetrics.responseTime) {
        setResponseTimeMetrics(realTimeMetrics.responseTime);
      }

      setLastUpdated(new Date());

      toast({
        title: "Performance Data Updated",
        description: "Latest performance metrics have been loaded",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing performance data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh performance analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "performance":
        return <Zap className="h-4 w-4" />;
      case "availability":
        return <Server className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "capacity":
        return <Database className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time system performance monitoring, scalability metrics, and
            response time analysis
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshData} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Monitor className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()} • Auto-refresh every{" "}
        {refreshInterval / 1000}s
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {systemMetrics.slice(0, 4).map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                {getCategoryIcon(metric.category)}
                <span className="ml-2">{metric.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(
                      metric.unit === "ms" ? 1 : metric.unit === "%" ? 1 : 0,
                    )}
                    {metric.unit}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span
                      className={`text-sm ${
                        metric.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-3">
                <Progress
                  value={Math.min(
                    100,
                    (metric.value / metric.threshold.critical) * 100,
                  )}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    Warning: {metric.threshold.warning}
                    {metric.unit}
                  </span>
                  <span>
                    Critical: {metric.threshold.critical}
                    {metric.unit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="scalability">
            <Server className="h-4 w-4 mr-2" />
            Scalability
          </TabsTrigger>
          <TabsTrigger value="response-times">
            <Clock className="h-4 w-4 mr-2" />
            Response Times
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Overview</CardTitle>
                <CardDescription>
                  Real-time system health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <Gauge className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">System performance gauge</p>
                    <p className="text-sm text-gray-400">
                      Real-time performance visualization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  Current resource usage across all systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics
                    .filter(
                      (m) =>
                        m.category === "performance" ||
                        m.category === "capacity",
                    )
                    .map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(metric.category)}
                          <span className="text-sm font-medium">
                            {metric.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={metric.value} className="w-20 h-2" />
                          <span className="text-sm font-bold w-12">
                            {metric.value.toFixed(1)}
                            {metric.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(metric.category)}
                      <span className="ml-2 text-base">{metric.name}</span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {metric.value.toFixed(
                          metric.unit === "ms"
                            ? 1
                            : metric.unit === "%"
                              ? 1
                              : 0,
                        )}
                        <span className="text-lg text-gray-500 ml-1">
                          {metric.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {getTrendIcon(metric.trend)}
                        <span
                          className={`text-sm ${
                            metric.change > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span>
                          {metric.value.toFixed(1)}
                          {metric.unit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (metric.value / metric.threshold.critical) * 100,
                        )}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Warning: {metric.threshold.warning}</span>
                        <span>Critical: {metric.threshold.critical}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scalability Tab */}
        <TabsContent value="scalability" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scalabilityMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.component}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          metric.autoScalingEnabled ? "default" : "secondary"
                        }
                      >
                        {metric.autoScalingEnabled ? "Auto-scaling" : "Manual"}
                      </Badge>
                      <Badge
                        className={getUtilizationColor(
                          metric.utilizationPercentage,
                        )}
                      >
                        {metric.utilizationPercentage}% utilized
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {metric.currentLoad}
                        </div>
                        <div className="text-xs text-gray-600">
                          Current Load
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {metric.maxCapacity}
                        </div>
                        <div className="text-xs text-gray-600">
                          Max Capacity
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          {metric.nextScalingThreshold}%
                        </div>
                        <div className="text-xs text-gray-600">
                          Next Scaling
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span>{metric.utilizationPercentage}%</span>
                      </div>
                      <Progress
                        value={metric.utilizationPercentage}
                        className="h-2"
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Recommendation:</span>{" "}
                        {metric.scalingRecommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Response Times Tab */}
        <TabsContent value="response-times" className="mt-6">
          <div className="space-y-6">
            {responseTimeMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.endpoint}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          metric.availability >= 99.9
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {metric.availability.toFixed(2)}% uptime
                      </Badge>
                      <Badge variant="outline">
                        {metric.requestsPerSecond.toFixed(1)} req/s
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {metric.avgResponseTime}ms
                      </div>
                      <div className="text-xs text-gray-600">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {metric.p95ResponseTime}ms
                      </div>
                      <div className="text-xs text-gray-600">
                        95th Percentile
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {metric.p99ResponseTime}ms
                      </div>
                      <div className="text-xs text-gray-600">
                        99th Percentile
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {metric.requestsPerSecond.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Requests/sec</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${
                          metric.errorRate < 0.1
                            ? "text-green-600"
                            : metric.errorRate < 1.0
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {metric.errorRate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-600">Error Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {performanceAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.severity === "critical"
                              ? "text-red-500"
                              : alert.severity === "high"
                                ? "text-orange-500"
                                : alert.severity === "medium"
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                          }`}
                        />
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="bg-green-100 text-green-800">
                            RESOLVED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <span className="font-medium">Metric:</span>{" "}
                          {alert.metric}
                        </div>
                        <div>
                          <span className="font-medium">Threshold:</span>{" "}
                          {alert.threshold}
                        </div>
                        <div>
                          <span className="font-medium">Current Value:</span>{" "}
                          {alert.currentValue}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>{" "}
                          {alert.type}
                        </div>
                      </div>
                      {alert.resolution && (
                        <p className="text-sm text-green-700 mb-2">
                          <span className="font-medium">Resolution:</span>{" "}
                          {alert.resolution}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                      {!alert.resolved && (
                        <Button size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalyticsDashboard;
