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
  Database,
  Gauge,
  LineChart,
  Monitor,
  Server,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface PerformanceMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  activeUsers: number;
}

interface PerformanceAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface DashboardProps {
  title?: string;
  refreshInterval?: number;
}

const PerformanceMonitoringDashboard: React.FC<DashboardProps> = ({
  title = "Performance Monitoring Dashboard",
  refreshInterval = 30000,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [systemHealth, setSystemHealth] = useState<
    "healthy" | "warning" | "critical"
  >("healthy");

  // Simulate real-time metrics collection
  useEffect(() => {
    const generateMetrics = (): PerformanceMetrics => {
      const now = new Date();
      const hour = now.getHours();
      const isBusinessHours = hour >= 9 && hour <= 17;
      const isPeakHours = hour >= 10 && hour <= 16;

      let baseMetrics = {
        timestamp: now,
        cpuUsage: Math.random() * 30 + 40, // 40-70%
        memoryUsage: Math.random() * 25 + 50, // 50-75%
        responseTime: Math.random() * 200 + 100, // 100-300ms
        throughput: Math.random() * 200 + 300, // 300-500 req/s
        errorRate: Math.random() * 2, // 0-2%
        availability: 99.5 + Math.random() * 0.5, // 99.5-100%
        activeUsers: Math.floor(Math.random() * 200 + 100), // 100-300 users
      };

      // Adjust for business hours
      if (isBusinessHours) {
        baseMetrics.activeUsers *= 1.5;
        baseMetrics.throughput *= 1.2;
        baseMetrics.cpuUsage *= 1.1;
        baseMetrics.memoryUsage *= 1.05;
      }

      if (isPeakHours) {
        baseMetrics.responseTime *= 1.2;
        baseMetrics.errorRate *= 1.5;
      }

      return baseMetrics;
    };

    const checkAlerts = (
      currentMetrics: PerformanceMetrics,
    ): PerformanceAlert[] => {
      const newAlerts: PerformanceAlert[] = [];

      // CPU Usage Alert
      if (currentMetrics.cpuUsage > 80) {
        newAlerts.push({
          id: `cpu-${Date.now()}`,
          severity: currentMetrics.cpuUsage > 90 ? "critical" : "high",
          message: `High CPU usage detected: ${currentMetrics.cpuUsage.toFixed(1)}%`,
          metric: "cpuUsage",
          value: currentMetrics.cpuUsage,
          threshold: 80,
          timestamp: currentMetrics.timestamp,
        });
      }

      // Memory Usage Alert
      if (currentMetrics.memoryUsage > 85) {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          severity: currentMetrics.memoryUsage > 95 ? "critical" : "high",
          message: `High memory usage detected: ${currentMetrics.memoryUsage.toFixed(1)}%`,
          metric: "memoryUsage",
          value: currentMetrics.memoryUsage,
          threshold: 85,
          timestamp: currentMetrics.timestamp,
        });
      }

      // Response Time Alert
      if (currentMetrics.responseTime > 1000) {
        newAlerts.push({
          id: `response-${Date.now()}`,
          severity: currentMetrics.responseTime > 3000 ? "critical" : "medium",
          message: `Slow response time detected: ${currentMetrics.responseTime.toFixed(0)}ms`,
          metric: "responseTime",
          value: currentMetrics.responseTime,
          threshold: 1000,
          timestamp: currentMetrics.timestamp,
        });
      }

      // Error Rate Alert
      if (currentMetrics.errorRate > 1) {
        newAlerts.push({
          id: `error-${Date.now()}`,
          severity: currentMetrics.errorRate > 5 ? "critical" : "high",
          message: `High error rate detected: ${currentMetrics.errorRate.toFixed(2)}%`,
          metric: "errorRate",
          value: currentMetrics.errorRate,
          threshold: 1,
          timestamp: currentMetrics.timestamp,
        });
      }

      return newAlerts;
    };

    const updateMetrics = () => {
      if (!isMonitoring) return;

      const newMetrics = generateMetrics();
      const newAlerts = checkAlerts(newMetrics);

      setMetrics((prev) => {
        const updated = [...prev, newMetrics];
        // Keep only last 100 data points
        return updated.slice(-100);
      });

      if (newAlerts.length > 0) {
        setAlerts((prev) => {
          const updated = [...prev, ...newAlerts];
          // Keep only last 50 alerts
          return updated.slice(-50);
        });
      }

      // Update system health
      const criticalAlerts = newAlerts.filter(
        (a) => a.severity === "critical",
      ).length;
      const highAlerts = newAlerts.filter((a) => a.severity === "high").length;

      if (criticalAlerts > 0) {
        setSystemHealth("critical");
      } else if (highAlerts > 0) {
        setSystemHealth("warning");
      } else {
        setSystemHealth("healthy");
      }

      setLastUpdate(new Date());
    };

    // Initial load
    updateMetrics();

    // Set up interval
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval]);

  const currentMetrics = metrics[metrics.length - 1];
  const activeAlerts = alerts.filter((alert) => {
    const alertAge = Date.now() - alert.timestamp.getTime();
    return alertAge < 300000; // Active for 5 minutes
  });

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Monitor className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">
              Real-time performance monitoring and system health dashboard
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getHealthIcon(systemHealth)}
              <span className={`font-medium ${getHealthColor(systemHealth)}`}>
                {systemHealth.toUpperCase()}
              </span>
            </div>
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity
                  className={`h-4 w-4 ${isMonitoring ? "text-green-600" : "text-gray-400"}`}
                />
                <span className="text-sm font-medium">
                  {isMonitoring ? "Monitoring Active" : "Monitoring Stopped"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Alerts
            </h2>
            {activeAlerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Badge variant={getSeverityColor(alert.severity) as any}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  Threshold: {alert.threshold} | Current:{" "}
                  {alert.value.toFixed(2)} | Time:{" "}
                  {alert.timestamp.toLocaleTimeString()}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Response Time
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics
                      ? `${currentMetrics.responseTime.toFixed(0)}ms`
                      : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: &lt; 1000ms
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Throughput
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics
                      ? `${currentMetrics.throughput.toFixed(0)}`
                      : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    requests/second
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Error Rate
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics
                      ? `${currentMetrics.errorRate.toFixed(2)}%`
                      : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: &lt; 1%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics
                      ? currentMetrics.activeUsers.toLocaleString()
                      : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    concurrent sessions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>
                  Real-time system performance and availability metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Availability</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.availability.toFixed(2)}%`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={currentMetrics?.availability || 0}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.cpuUsage.toFixed(1)}%`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={currentMetrics?.cpuUsage || 0}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.memoryUsage.toFixed(1)}%`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={currentMetrics?.memoryUsage || 0}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Health</span>
                      <span className={getHealthColor(systemHealth)}>
                        {systemHealth.toUpperCase()}
                      </span>
                    </div>
                    <Progress
                      value={
                        systemHealth === "healthy"
                          ? 100
                          : systemHealth === "warning"
                            ? 60
                            : 20
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed performance analysis and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <LineChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Performance charts would be rendered here</p>
                  <p className="text-sm">
                    Integration with charting library required
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>System Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.cpuUsage.toFixed(1)}%`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={currentMetrics?.cpuUsage || 0}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.memoryUsage.toFixed(1)}%`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={currentMetrics?.memoryUsage || 0}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Application Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.responseTime.toFixed(0)}ms`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        (currentMetrics?.responseTime || 0) / 10,
                        100,
                      )}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span>
                        {currentMetrics
                          ? `${currentMetrics.errorRate.toFixed(2)}%`
                          : "--"}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        (currentMetrics?.errorRate || 0) * 10,
                        100,
                      )}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>
                  Recent performance alerts and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p>No alerts detected</p>
                    <p className="text-sm">System is operating normally</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts
                      .slice()
                      .reverse()
                      .slice(0, 10)
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                alert.severity === "critical"
                                  ? "text-red-600"
                                  : alert.severity === "high"
                                    ? "text-orange-600"
                                    : alert.severity === "medium"
                                      ? "text-yellow-600"
                                      : "text-blue-600"
                              }`}
                            />
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-gray-600">
                                {alert.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={getSeverityColor(alert.severity) as any}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
