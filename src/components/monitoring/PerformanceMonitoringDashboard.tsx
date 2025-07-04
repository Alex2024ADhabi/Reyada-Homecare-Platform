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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Globe,
  Heart,
  Lock,
  Memory,
  Monitor,
  Network,
  RefreshCw,
  Server,
  Shield,
  TrendingUp,
  Users,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import {
  performanceMonitoringService,
  PerformanceMetrics,
  CoreWebVitals,
  SystemMetrics,
  PerformanceAlert,
} from "@/services/performance-monitoring.service";

interface PerformanceMonitoringDashboardProps {
  refreshInterval?: number;
  showAlerts?: boolean;
  compactMode?: boolean;
}

const PerformanceMonitoringDashboard: React.FC<
  PerformanceMonitoringDashboardProps
> = ({ refreshInterval = 5000, showAlerts = true, compactMode = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [coreWebVitals, setCoreWebVitals] = useState<CoreWebVitals>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    cpuUsage: 0,
    networkLatency: 0,
    activeConnections: 0,
    cacheHitRate: 0,
  });
  const [performanceSummary, setPerformanceSummary] = useState({
    totalMetrics: 0,
    activeAlerts: 0,
    averageResponseTime: 0,
    errorRate: 0,
    coreWebVitals: { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0 },
    systemHealth: "good" as "good" | "warning" | "critical",
    healthcare: {
      activePatientSessions: 0,
      clinicalFormsProcessed: 0,
      complianceScore: 0,
      encryptionOperations: 0,
      auditEventsGenerated: 0,
    },
    security: {
      threatsDetected: 0,
      securityScore: 0,
      failedAuthAttempts: 0,
      rateLimitViolations: 0,
    },
    cache: {
      hitRate: 0,
      responseTime: 0,
      operations: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const updateData = () => {
      try {
        setMetrics(performanceMonitoringService.getMetrics(undefined, 100));
        setAlerts(performanceMonitoringService.getAlerts(false));
        setCoreWebVitals(performanceMonitoringService.getCoreWebVitals());
        setSystemMetrics(performanceMonitoringService.getSystemMetrics());
        setPerformanceSummary(
          performanceMonitoringService.getComprehensivePerformanceSummary(),
        );
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error("Error updating performance data:", error);
      }
    };

    // Initial load
    updateData();

    // Set up interval
    const interval = setInterval(updateData, refreshInterval);

    // Set up event listeners
    const handleMetricRecorded = () => updateData();
    const handleAlertCreated = () => updateData();

    performanceMonitoringService.on("metric-recorded", handleMetricRecorded);
    performanceMonitoringService.on("alert-created", handleAlertCreated);

    return () => {
      clearInterval(interval);
      performanceMonitoringService.off("metric-recorded", handleMetricRecorded);
      performanceMonitoringService.off("alert-created", handleAlertCreated);
    };
  }, [refreshInterval]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "good":
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
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getWebVitalScore = (metric: string, value: number) => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return "good";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "good":
        return "text-green-600 bg-green-50";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Performance Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {getHealthIcon(performanceSummary.systemHealth)}
                  <span
                    className={`text-lg font-semibold capitalize ${getHealthColor(performanceSummary.systemHealth)}`}
                  >
                    {performanceSummary.systemHealth}
                  </span>
                </div>
              </div>
              <Monitor className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceSummary.activeAlerts}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatDuration(performanceSummary.averageResponseTime)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceSummary.errorRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {showAlerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Active Performance Alerts</span>
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={
                      alert.type === "critical" ? "destructive" : "default"
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-sm">
                      {alert.metric} - {alert.type.toUpperCase()}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      {alert.message}
                      <span className="ml-2 text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Healthcare Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Patient Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceSummary.healthcare?.activePatientSessions || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Score
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceSummary.healthcare?.complianceScore || 0}%
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Security Score
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceSummary.security?.securityScore || 0}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Cache Hit Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceSummary.cache?.hitRate?.toFixed(1) || 0}%
                </p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="network">Network & API</TabsTrigger>
          <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                key: "fcp",
                name: "First Contentful Paint",
                value: coreWebVitals.fcp,
                unit: "ms",
              },
              {
                key: "lcp",
                name: "Largest Contentful Paint",
                value: coreWebVitals.lcp,
                unit: "ms",
              },
              {
                key: "fid",
                name: "First Input Delay",
                value: coreWebVitals.fid,
                unit: "ms",
              },
              {
                key: "cls",
                name: "Cumulative Layout Shift",
                value: coreWebVitals.cls,
                unit: "",
              },
              {
                key: "ttfb",
                name: "Time to First Byte",
                value: coreWebVitals.ttfb,
                unit: "ms",
              },
            ].map((vital) => {
              const score = getWebVitalScore(vital.key, vital.value);
              return (
                <Card key={vital.key}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {vital.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {vital.key === "cls"
                          ? vital.value.toFixed(3)
                          : Math.round(vital.value)}
                        <span className="text-sm text-gray-500 ml-1">
                          {vital.unit}
                        </span>
                      </p>
                      <Badge className={`mt-2 ${getScoreColor(score)}`}>
                        {score.replace("-", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* System Metrics Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Memory className="h-5 w-5" />
                  <span>Memory Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Used Memory</span>
                      <span>
                        {systemMetrics.memoryUsage.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={systemMetrics.memoryUsage.percentage}
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Used</p>
                      <p className="font-semibold">
                        {formatBytes(systemMetrics.memoryUsage.used)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-semibold">
                        {formatBytes(systemMetrics.memoryUsage.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5" />
                  <span>Network Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Latency</p>
                      <p className="text-lg font-semibold">
                        {systemMetrics.networkLatency}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Connections</p>
                      <p className="text-lg font-semibold">
                        {systemMetrics.activeConnections}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cache Hit Rate</span>
                      <span>{systemMetrics.cacheHitRate.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={systemMetrics.cacheHitRate}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Healthcare Metrics Tab */}
        <TabsContent value="healthcare" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Clinical Operations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Forms Processed</p>
                      <p className="text-lg font-semibold">
                        {performanceSummary.healthcare
                          ?.clinicalFormsProcessed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Audit Events</p>
                      <p className="text-lg font-semibold">
                        {performanceSummary.healthcare?.auditEventsGenerated ||
                          0}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>DOH Compliance Score</span>
                      <span>
                        {performanceSummary.healthcare?.complianceScore || 0}%
                      </span>
                    </div>
                    <Progress
                      value={
                        performanceSummary.healthcare?.complianceScore || 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>PHI Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Encryption Ops</p>
                      <p className="text-lg font-semibold">
                        {performanceSummary.healthcare?.encryptionOperations ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Sessions</p>
                      <p className="text-lg font-semibold">
                        {performanceSummary.healthcare?.activePatientSessions ||
                          0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      HIPAA Compliant
                    </p>
                    <p className="text-xs text-green-600">
                      All PHI data encrypted at rest and in transit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Metrics Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Threats Detected
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceSummary.security?.threatsDetected || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Failed Auth Attempts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceSummary.security?.failedAuthAttempts || 0}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Rate Limit Violations
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceSummary.security?.rateLimitViolations || 0}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Security Score</span>
                    <span>
                      {performanceSummary.security?.securityScore || 0}%
                    </span>
                  </div>
                  <Progress
                    value={performanceSummary.security?.securityScore || 0}
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-800">DDoS Protection</p>
                    <p className="text-blue-600">Active & Monitoring</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800">Rate Limiting</p>
                    <p className="text-green-600">Adaptive Rules Active</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-800">Encryption</p>
                    <p className="text-purple-600">AES-256 End-to-End</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network & API Tab */}
        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      API Calls
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {metrics.filter((m) => m.type === "api").length}
                    </p>
                  </div>
                  <Server className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Network Requests
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {metrics.filter((m) => m.type === "network").length}
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Resource Loads
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {metrics.filter((m) => m.type === "resource").length}
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Metrics</CardTitle>
              <CardDescription>
                Latest {metrics.length} performance measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {metrics.slice(0, 50).map((metric, index) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{metric.type}</Badge>
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-semibold">
                          {metric.value.toFixed(2)} {metric.unit}
                        </span>
                        <span>
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
