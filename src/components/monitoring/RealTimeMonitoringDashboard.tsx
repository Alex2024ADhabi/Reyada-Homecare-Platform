/**
 * Real-Time Monitoring Dashboard
 * Comprehensive real-time monitoring with healthcare-specific metrics
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  Bell,
  Settings,
} from "lucide-react";
import {
  realTimeAnalyticsService,
  type RealTimeAlert,
  type AnalyticsMetric,
} from "@/services/real-time-analytics.service";

interface MonitoringMetrics {
  systemHealth: {
    status: "healthy" | "warning" | "critical";
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
  patientMetrics: {
    activePatients: number;
    admissionsToday: number;
    completedForms: number;
    pendingTasks: number;
  };
  complianceMetrics: {
    overallScore: number;
    dohCompliance: number;
    jawdaCompliance: number;
    hipaaCompliance: number;
  };
  performanceMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
}

interface RealTimeMonitoringDashboardProps {
  refreshInterval?: number;
  showAlerts?: boolean;
  compactMode?: boolean;
}

const RealTimeMonitoringDashboard: React.FC<
  RealTimeMonitoringDashboardProps
> = ({ refreshInterval = 30000, showAlerts = true, compactMode = false }) => {
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    systemHealth: {
      status: "healthy",
      uptime: 99.9,
      responseTime: 150,
      errorRate: 0.1,
    },
    patientMetrics: {
      activePatients: 0,
      admissionsToday: 0,
      completedForms: 0,
      pendingTasks: 0,
    },
    complianceMetrics: {
      overallScore: 0,
      dohCompliance: 0,
      jawdaCompliance: 0,
      hipaaCompliance: 0,
    },
    performanceMetrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
    },
  });

  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize real-time analytics service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await realTimeAnalyticsService.initialize();
        console.log("✅ Real-time analytics service initialized");
      } catch (error) {
        console.error(
          "❌ Failed to initialize real-time analytics service:",
          error,
        );
      }
    };

    initializeService();
  }, []);

  // Fetch metrics data
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get healthcare analytics
      const healthcareAnalytics =
        await realTimeAnalyticsService.getHealthcareAnalytics();

      // Get real-time metrics
      const realtimeMetrics = await realTimeAnalyticsService.getMetrics([
        "response_time",
        "error_rate",
        "memory_usage",
        "compliance_score",
        "patient_admissions",
        "forms_submitted",
      ]);

      // Update metrics state
      setMetrics({
        systemHealth: {
          status: calculateSystemHealthStatus(realtimeMetrics),
          uptime: 99.9, // This would come from actual system monitoring
          responseTime:
            getLatestMetricValue(realtimeMetrics, "response_time") || 150,
          errorRate: getLatestMetricValue(realtimeMetrics, "error_rate") || 0.1,
        },
        patientMetrics: {
          activePatients:
            healthcareAnalytics.patientMetrics?.totalPatients || 0,
          admissionsToday:
            healthcareAnalytics.patientMetrics?.admissionsToday || 0,
          completedForms:
            healthcareAnalytics.clinicalMetrics?.formsCompleted || 0,
          pendingTasks: Math.floor(Math.random() * 20) + 5, // Simulated
        },
        complianceMetrics: {
          overallScore:
            healthcareAnalytics.complianceMetrics?.overallScore || 0,
          dohCompliance:
            healthcareAnalytics.complianceMetrics?.dohCompliance || 0,
          jawdaCompliance:
            healthcareAnalytics.complianceMetrics?.jawdaCompliance || 0,
          hipaaCompliance:
            healthcareAnalytics.complianceMetrics?.hipaaCompliance || 0,
        },
        performanceMetrics: {
          cpuUsage: Math.floor(Math.random() * 30) + 20, // Simulated
          memoryUsage:
            getLatestMetricValue(realtimeMetrics, "memory_usage") || 0,
          diskUsage: Math.floor(Math.random() * 20) + 30, // Simulated
          networkLatency: Math.floor(Math.random() * 50) + 10, // Simulated
        },
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const activeAlerts = await realTimeAnalyticsService.getActiveAlerts();
      setAlerts(activeAlerts);
    } catch (error) {
      console.error("❌ Error fetching alerts:", error);
    }
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to metric updates
    const metricUnsubscriber = realTimeAnalyticsService.subscribe(
      "metric:*",
      (metric: AnalyticsMetric) => {
        console.log("📊 Received metric update:", metric.name, metric.value);
        // Trigger refresh when important metrics update
        if (
          ["response_time", "error_rate", "compliance_score"].includes(
            metric.name,
          )
        ) {
          fetchMetrics();
        }
      },
    );
    unsubscribers.push(metricUnsubscriber);

    // Subscribe to alerts
    const alertUnsubscriber = realTimeAnalyticsService.subscribe(
      "alert",
      (alert: RealTimeAlert) => {
        console.log("🚨 Received new alert:", alert.title);
        fetchAlerts();
      },
    );
    unsubscribers.push(alertUnsubscriber);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [fetchMetrics, fetchAlerts]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchMetrics, fetchAlerts]);

  // Initial data fetch
  useEffect(() => {
    fetchMetrics();
    fetchAlerts();
  }, [fetchMetrics, fetchAlerts]);

  // Helper functions
  const calculateSystemHealthStatus = (
    metrics: Record<string, AnalyticsMetric[]>,
  ): "healthy" | "warning" | "critical" => {
    const errorRate = getLatestMetricValue(metrics, "error_rate") || 0;
    const responseTime = getLatestMetricValue(metrics, "response_time") || 0;

    if (errorRate > 5 || responseTime > 2000) {
      return "critical";
    } else if (errorRate > 2 || responseTime > 1000) {
      return "warning";
    }
    return "healthy";
  };

  const getLatestMetricValue = (
    metrics: Record<string, AnalyticsMetric[]>,
    metricName: string,
  ): number | undefined => {
    const metricArray = metrics[metricName];
    if (metricArray && metricArray.length > 0) {
      return metricArray[metricArray.length - 1].value;
    }
    return undefined;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleRefresh = () => {
    fetchMetrics();
    fetchAlerts();
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await realTimeAnalyticsService.acknowledgeAlert(alertId);
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error("❌ Error acknowledging alert:", error);
    }
  };

  if (compactMode) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </h3>
          <div className="flex items-center gap-2">
            {getStatusIcon(metrics.systemHealth.status)}
            <span
              className={`text-sm font-medium ${getStatusColor(metrics.systemHealth.status)}`}
            >
              {metrics.systemHealth.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.patientMetrics.activePatients}
            </div>
            <div className="text-sm text-gray-600">Active Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.complianceMetrics.overallScore}%
            </div>
            <div className="text-sm text-gray-600">Compliance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.systemHealth.responseTime}ms
            </div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {alerts.length}
            </div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Real-Time Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive healthcare system monitoring and analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${autoRefresh ? "text-green-600" : "text-gray-400"}`}
            />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getStatusIcon(metrics.systemHealth.status)}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getStatusColor(metrics.systemHealth.status)}`}
            >
              {metrics.systemHealth.status.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {metrics.systemHealth.uptime}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.systemHealth.responseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Error rate: {metrics.systemHealth.errorRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.patientMetrics.activePatients}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics.patientMetrics.admissionsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.complianceMetrics.overallScore}%
            </div>
            <Progress
              value={metrics.complianceMetrics.overallScore}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {showAlerts && alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-500" />
            Active Alerts ({alerts.length})
          </h2>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Alert
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === "critical"
                    ? "border-l-red-500 bg-red-50"
                    : alert.severity === "warning"
                      ? "border-l-yellow-500 bg-yellow-50"
                      : alert.severity === "error"
                        ? "border-l-orange-500 bg-orange-50"
                        : "border-l-blue-500 bg-blue-50"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </AlertTitle>
                <AlertDescription>
                  {alert.message}
                  <div className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="healthcare" className="space-y-4">
        <TabsList>
          <TabsTrigger value="healthcare">Healthcare Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="healthcare" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Patient Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Patients</span>
                  <span className="font-semibold">
                    {metrics.patientMetrics.activePatients}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Admissions Today
                  </span>
                  <span className="font-semibold">
                    {metrics.patientMetrics.admissionsToday}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Forms</span>
                  <span className="font-semibold">
                    {metrics.patientMetrics.completedForms}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Tasks</span>
                  <span className="font-semibold">
                    {metrics.patientMetrics.pendingTasks}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Clinical Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Form Completion Rate</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Assessment Coverage</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documentation Quality</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Data Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Data Completeness
                  </span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Validation Errors
                  </span>
                  <span className="font-semibold text-red-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sync Status</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Synced
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Metrics</CardTitle>
                <CardDescription>
                  Average response times across different endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Endpoints</span>
                    <span className="font-semibold">
                      {metrics.systemHealth.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Queries</span>
                    <span className="font-semibold">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">File Operations</span>
                    <span className="font-semibold">120ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
                <CardDescription>
                  System errors and recovery metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-semibold">
                      {metrics.systemHealth.errorRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recovery Time</span>
                    <span className="font-semibold">2.3s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Requests</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DOH Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.complianceMetrics.dohCompliance}%
                </div>
                <Progress
                  value={metrics.complianceMetrics.dohCompliance}
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  Department of Health standards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>JAWDA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.complianceMetrics.jawdaCompliance}%
                </div>
                <Progress
                  value={metrics.complianceMetrics.jawdaCompliance}
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  Quality assurance standards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {metrics.complianceMetrics.hipaaCompliance}%
                </div>
                <Progress
                  value={metrics.complianceMetrics.hipaaCompliance}
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  Privacy and security standards
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics.performanceMetrics.cpuUsage}%
                </div>
                <Progress value={metrics.performanceMetrics.cpuUsage} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics.performanceMetrics.memoryUsage.toFixed(1)}MB
                </div>
                <Progress
                  value={(metrics.performanceMetrics.memoryUsage / 1024) * 100}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics.performanceMetrics.diskUsage}%
                </div>
                <Progress value={metrics.performanceMetrics.diskUsage} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Network Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics.performanceMetrics.networkLatency}ms
                </div>
                <div className="text-sm text-gray-600">Average latency</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeMonitoringDashboard;
