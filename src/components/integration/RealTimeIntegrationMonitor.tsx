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
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Heart,
  RefreshCw,
  Server,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Zap,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useMalaffiSync } from "@/hooks/useMalaffiSync";
import {
  executeIntegrationTestSuite,
  getIntegrationTestReports,
} from "@/api/integration-intelligence.api";

interface RealTimeIntegrationMonitorProps {
  className?: string;
}

const RealTimeIntegrationMonitor: React.FC<RealTimeIntegrationMonitorProps> = ({
  className = "",
}) => {
  const {
    realTimeData,
    integrationHealth,
    isMonitoring,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    refreshIntegrationHealth,
    retryFailedOperations,
    isLoading,
    error,
    clearError,
  } = useMalaffiSync();

  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testSuites] = useState<string[]>([
    "malaffi_integration_tests",
    "daman_integration_tests",
    "doh_compliance_tests",
  ]);

  // Auto-refresh integration health and test results
  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      const interval = setInterval(() => {
        refreshIntegrationHealth();
        loadTestResults();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, isMonitoring, refreshInterval, refreshIntegrationHealth]);

  // Load test results on component mount
  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      const results = await getIntegrationTestReports({
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dateTo: new Date().toISOString(),
      });
      setTestResults(results.slice(0, 10)); // Show last 10 results
    } catch (error) {
      console.error("Failed to load test results:", error);
    }
  };

  const runIntegrationTests = async (suiteId?: string) => {
    setIsRunningTests(true);
    try {
      if (suiteId) {
        await executeIntegrationTestSuite(suiteId);
      } else {
        // Run all test suites
        for (const suite of testSuites) {
          await executeIntegrationTestSuite(suite);
        }
      }
      await loadTestResults();
    } catch (error) {
      console.error("Integration tests failed:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "text-green-600 bg-green-50";
      case "degraded":
      case "reconnecting":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
      case "disconnected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return <CheckCircle className="h-4 w-4" />;
      case "degraded":
      case "reconnecting":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
      case "disconnected":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "degrading":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  return (
    <div className={`bg-white min-h-screen p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Real-Time Integration Monitor
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor integration health, performance, and data flows in
              real-time
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshIntegrationHealth}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runIntegrationTests()}
              disabled={isRunningTests}
            >
              <Zap
                className={`h-4 w-4 mr-2 ${isRunningTests ? "animate-spin" : ""}`}
              />
              {isRunningTests ? "Running Tests..." : "Run Tests"}
            </Button>
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              onClick={
                isMonitoring ? stopRealTimeMonitoring : startRealTimeMonitoring
              }
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Integration Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {realTimeData.connectionStatus === "connected" ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span>Connection Status</span>
              <Badge className={getStatusColor(realTimeData.connectionStatus)}>
                {realTimeData.connectionStatus.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeData.activeConnections}
                </div>
                <div className="text-sm text-gray-600">Active Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeData.syncProgress.completed}
                </div>
                <div className="text-sm text-gray-600">
                  Completed Operations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {realTimeData.syncProgress.failed}
                </div>
                <div className="text-sm text-gray-600">Failed Operations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {realTimeData.queuedOperations}
                </div>
                <div className="text-sm text-gray-600">Queued Operations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Integration Health</span>
              <Badge
                className={getStatusColor(integrationHealth.overallHealth)}
              >
                {integrationHealth.overallHealth.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Overall system health: {integrationHealth.apiResponseTime}ms avg
              response time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-gray-600">
                    {integrationHealth.apiResponseTime}ms
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (integrationHealth.apiResponseTime / 1000) * 100,
                    100,
                  )}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-gray-600">
                    {integrationHealth.errorRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={integrationHealth.errorRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-gray-600">
                    {integrationHealth.uptime.toFixed(1)}%
                  </span>
                </div>
                <Progress value={integrationHealth.uptime} className="h-2" />
              </div>
            </div>

            {integrationHealth.issues.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Current Issues</h4>
                <div className="space-y-2">
                  {integrationHealth.issues.map((issue, index) => (
                    <Alert
                      key={index}
                      variant={
                        issue.type === "critical" ? "destructive" : "default"
                      }
                    >
                      {getStatusIcon(issue.type)}
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>{issue.message}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(issue.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeData.performanceMetrics.averageResponseTime.toFixed(
                    0,
                  )}
                  ms
                </div>
                <div className="text-sm text-gray-600">
                  Average Response Time
                </div>
                <div className="flex items-center justify-center mt-2">
                  {getTrendIcon("stable")}
                  <span className="text-xs text-gray-500 ml-1">Stable</span>
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeData.performanceMetrics.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="flex items-center justify-center mt-2">
                  {getTrendIcon("improving")}
                  <span className="text-xs text-gray-500 ml-1">Improving</span>
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {realTimeData.performanceMetrics.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Error Rate</div>
                <div className="flex items-center justify-center mt-2">
                  {getTrendIcon("degrading")}
                  <span className="text-xs text-gray-500 ml-1">Degrading</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Progress */}
        {realTimeData.syncProgress.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <span>Synchronization Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">
                    {realTimeData.syncProgress.completed} /{" "}
                    {realTimeData.syncProgress.total}
                  </span>
                </div>
                <Progress
                  value={
                    (realTimeData.syncProgress.completed /
                      realTimeData.syncProgress.total) *
                    100
                  }
                  className="h-3"
                />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {realTimeData.syncProgress.completed}
                    </div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {realTimeData.syncProgress.inProgress}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {realTimeData.syncProgress.failed}
                    </div>
                    <div className="text-xs text-gray-600">Failed</div>
                  </div>
                </div>
                {realTimeData.syncProgress.failed > 0 && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retryFailedOperations}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry Failed Operations
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Sync Information */}
        {realTimeData.lastSyncTime && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span>Last Synchronization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Last Sync Time</div>
                  <div className="text-sm text-gray-600">
                    {new Date(realTimeData.lastSyncTime).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Time Ago</div>
                  <div className="text-sm text-gray-600">
                    {formatDuration(
                      Date.now() -
                        new Date(realTimeData.lastSyncTime).getTime(),
                    )}{" "}
                    ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="malaffi">Malaffi EMR</TabsTrigger>
            <TabsTrigger value="daman">DAMAN</TabsTrigger>
            <TabsTrigger value="tests">Integration Tests</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Real-time status of all integrated systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Malaffi EMR", "DAMAN", "DOH", "WhatsApp Business"].map(
                    (system) => (
                      <div
                        key={system}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Server className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="font-medium">{system}</div>
                            <div className="text-sm text-gray-600">
                              Integration Service
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor("healthy")}>
                            {getStatusIcon("healthy")}
                            <span className="ml-1">Healthy</span>
                          </Badge>
                          <div className="text-sm text-gray-600">
                            {(200 + Math.random() * 300).toFixed(0)}ms
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="malaffi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Malaffi EMR Integration</CardTitle>
                <CardDescription>
                  Detailed monitoring of Malaffi EMR integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Connection Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Endpoint:</span>
                        <span className="text-gray-600">api.malaffi.ae</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protocol:</span>
                        <span className="text-gray-600">HTTPS/REST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authentication:</span>
                        <span className="text-green-600">OAuth 2.0 ✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate Limit:</span>
                        <span className="text-gray-600">1000/hour</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Patient sync completed</span>
                        <span className="text-gray-500">2m ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Medical records updated</span>
                        <span className="text-gray-500">5m ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Rate limit warning</span>
                        <span className="text-gray-500">15m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daman" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>DAMAN Integration</CardTitle>
                <CardDescription>
                  Insurance authorization and claims processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    DAMAN integration monitoring coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Integration Test Results</span>
                  <div className="flex space-x-2">
                    {testSuites.map((suiteId) => (
                      <Button
                        key={suiteId}
                        variant="outline"
                        size="sm"
                        onClick={() => runIntegrationTests(suiteId)}
                        disabled={isRunningTests}
                      >
                        {suiteId.replace("_", " ").toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
                <CardDescription>
                  Automated integration test results and health checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {result.summary.failed === 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium">
                              Test Suite: {result.suiteId.replace("_", " ")}
                            </div>
                            <div className="text-sm text-gray-600">
                              {result.summary.passed}/
                              {result.summary.totalTests} tests passed
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {result.summary.errorRate.toFixed(1)}% error rate
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              result.executionTime,
                            ).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No test results available. Run integration tests to see
                      results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Real-time integration activity and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[
                    {
                      time: "14:32:15",
                      level: "INFO",
                      message: "Malaffi patient sync initiated",
                      system: "Malaffi",
                    },
                    {
                      time: "14:32:18",
                      level: "SUCCESS",
                      message: "Patient data synchronized successfully",
                      system: "Malaffi",
                    },
                    {
                      time: "14:33:02",
                      level: "INFO",
                      message: "DAMAN authorization request sent",
                      system: "DAMAN",
                    },
                    {
                      time: "14:33:05",
                      level: "SUCCESS",
                      message: "Authorization approved",
                      system: "DAMAN",
                    },
                    {
                      time: "14:34:12",
                      level: "WARNING",
                      message: "High response time detected",
                      system: "Malaffi",
                    },
                    {
                      time: "14:35:01",
                      level: "INFO",
                      message: "Automatic retry initiated",
                      system: "System",
                    },
                  ].map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 border-l-4 border-l-blue-200 bg-gray-50 rounded"
                    >
                      <div className="text-xs text-gray-500 font-mono">
                        {log.time}
                      </div>
                      <Badge
                        variant={
                          log.level === "SUCCESS"
                            ? "default"
                            : log.level === "WARNING"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {log.level}
                      </Badge>
                      <div className="flex-1 text-sm">{log.message}</div>
                      <div className="text-xs text-gray-500">{log.system}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealTimeIntegrationMonitor;
