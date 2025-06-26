/**
 * Signature System Monitor
 * P5-001.1.1: Comprehensive System Health Monitoring
 *
 * Advanced monitoring dashboard for the entire signature system,
 * providing real-time health metrics, performance tracking, and alerting.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  HardDrive,
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
  BarChart3,
  Eye,
  Settings,
  Download,
  Bell,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    latency: number;
    bandwidth: number;
    packetsLost: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
  };
}

export interface SignatureSystemHealth {
  overall: "healthy" | "warning" | "critical" | "offline";
  components: {
    capture: {
      status: "online" | "offline" | "degraded";
      responseTime: number;
      errorRate: number;
      activeUsers: number;
    };
    analytics: {
      status: "online" | "offline" | "degraded";
      dataProcessingDelay: number;
      reportGenerationTime: number;
      storageUsage: number;
    };
    workflow: {
      status: "online" | "offline" | "degraded";
      queueLength: number;
      processingRate: number;
      failureRate: number;
    };
    export: {
      status: "online" | "offline" | "degraded";
      exportQueue: number;
      averageExportTime: number;
      successRate: number;
    };
    security: {
      status: "online" | "offline" | "degraded";
      threatLevel: "low" | "medium" | "high" | "critical";
      lastSecurityScan: string;
      vulnerabilities: number;
    };
  };
  alerts: SystemAlert[];
  performance: {
    uptime: number;
    totalSignatures: number;
    signaturesPerHour: number;
    averageProcessingTime: number;
  };
}

export interface SystemAlert {
  id: string;
  type: "info" | "warning" | "error" | "critical";
  component: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  details?: any;
}

export interface SignatureSystemMonitorProps {
  systemHealth?: SignatureSystemHealth;
  systemMetrics?: SystemMetrics;
  onRefresh?: () => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  onExportReport?: () => void;
  onConfigureAlerts?: () => void;
  refreshInterval?: number;
  className?: string;
}

const SignatureSystemMonitor: React.FC<SignatureSystemMonitorProps> = ({
  systemHealth = {
    overall: "healthy",
    components: {
      capture: {
        status: "online",
        responseTime: 120,
        errorRate: 0.02,
        activeUsers: 45,
      },
      analytics: {
        status: "online",
        dataProcessingDelay: 2.5,
        reportGenerationTime: 8.2,
        storageUsage: 68.5,
      },
      workflow: {
        status: "online",
        queueLength: 12,
        processingRate: 95.8,
        failureRate: 0.8,
      },
      export: {
        status: "online",
        exportQueue: 3,
        averageExportTime: 4.2,
        successRate: 99.2,
      },
      security: {
        status: "online",
        threatLevel: "low",
        lastSecurityScan: new Date(
          Date.now() - 2 * 60 * 60 * 1000,
        ).toISOString(),
        vulnerabilities: 0,
      },
    },
    alerts: [
      {
        id: "alert-1",
        type: "warning",
        component: "Analytics",
        message: "Storage usage approaching 70% threshold",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: "alert-2",
        type: "info",
        component: "Workflow",
        message: "Queue processing rate increased by 15%",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        acknowledged: true,
      },
    ],
    performance: {
      uptime: 99.8,
      totalSignatures: 15420,
      signaturesPerHour: 127,
      averageProcessingTime: 2.8,
    },
  },
  systemMetrics = {
    cpu: {
      usage: 45.2,
      cores: 8,
      temperature: 62,
    },
    memory: {
      used: 6.2,
      total: 16,
      percentage: 38.8,
    },
    storage: {
      used: 245,
      total: 500,
      percentage: 49.0,
    },
    network: {
      latency: 12,
      bandwidth: 850,
      packetsLost: 0.02,
    },
    database: {
      connections: 25,
      queryTime: 45,
      cacheHitRate: 94.5,
    },
  },
  onRefresh,
  onAcknowledgeAlert,
  onExportReport,
  onConfigureAlerts,
  refreshInterval = 30000,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Calculate overall system health score
  const healthScore = useMemo(() => {
    const components = Object.values(systemHealth.components);
    const onlineComponents = components.filter(
      (c) => c.status === "online",
    ).length;
    const totalComponents = components.length;
    return Math.round((onlineComponents / totalComponents) * 100);
  }, [systemHealth.components]);

  // Get unacknowledged alerts
  const unacknowledgedAlerts = useMemo(() => {
    return systemHealth.alerts.filter((alert) => !alert.acknowledged);
  }, [systemHealth.alerts]);

  // Get critical alerts
  const criticalAlerts = useMemo(() => {
    return systemHealth.alerts.filter(
      (alert) => alert.type === "critical" || alert.type === "error",
    );
  }, [systemHealth.alerts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "degraded":
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "offline":
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleRefresh = () => {
    onRefresh?.();
    setLastRefresh(new Date());
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-6 w-6" />
              Signature System Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Auto
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold">{healthScore}%</p>
              </div>
              {getStatusIcon(systemHealth.overall)}
            </div>
            <Progress value={healthScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {unacknowledgedAlerts.length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">
                  {systemHealth.performance.uptime}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Signatures/Hour</p>
                <p className="text-2xl font-bold">
                  {systemHealth.performance.signaturesPerHour}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {criticalAlerts.length} critical alert(s) require immediate
                attention
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTab("alerts")}
              >
                View Alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Component Status */}
            <Card>
              <CardHeader>
                <CardTitle>Component Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(systemHealth.components).map(
                  ([name, component]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(component.status)}
                        <span className="font-medium capitalize">{name}</span>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs",
                          getStatusColor(component.status),
                        )}
                      >
                        {component.status.toUpperCase()}
                      </Badge>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Signatures</p>
                    <p className="text-xl font-bold">
                      {systemHealth.performance.totalSignatures.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Processing Time</p>
                    <p className="text-xl font-bold">
                      {systemHealth.performance.averageProcessingTime}s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPU Usage</p>
                    <p className="text-xl font-bold">
                      {systemMetrics.cpu.usage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                    <p className="text-xl font-bold">
                      {systemMetrics.memory.percentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(systemHealth.components).map(
              ([name, component]) => (
                <Card key={name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">
                        {name} Service
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(component.status)}
                        <Badge
                          className={cn(
                            "text-xs",
                            getStatusColor(component.status),
                          )}
                        >
                          {component.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {name === "capture" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Response Time:
                            </span>
                            <span className="font-medium">
                              {component.responseTime}ms
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Error Rate:
                            </span>
                            <span className="font-medium">
                              {(component.errorRate * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Active Users:
                            </span>
                            <span className="font-medium">
                              {component.activeUsers}
                            </span>
                          </div>
                        </>
                      )}
                      {name === "analytics" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Processing Delay:
                            </span>
                            <span className="font-medium">
                              {component.dataProcessingDelay}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Report Generation:
                            </span>
                            <span className="font-medium">
                              {component.reportGenerationTime}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Storage Usage:
                            </span>
                            <span className="font-medium">
                              {component.storageUsage}%
                            </span>
                          </div>
                        </>
                      )}
                      {name === "workflow" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Queue Length:
                            </span>
                            <span className="font-medium">
                              {component.queueLength}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Processing Rate:
                            </span>
                            <span className="font-medium">
                              {component.processingRate}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Failure Rate:
                            </span>
                            <span className="font-medium">
                              {component.failureRate}%
                            </span>
                          </div>
                        </>
                      )}
                      {name === "export" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Export Queue:
                            </span>
                            <span className="font-medium">
                              {component.exportQueue}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Avg Export Time:
                            </span>
                            <span className="font-medium">
                              {component.averageExportTime}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Success Rate:
                            </span>
                            <span className="font-medium">
                              {component.successRate}%
                            </span>
                          </div>
                        </>
                      )}
                      {name === "security" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Threat Level:
                            </span>
                            <Badge
                              className={cn(
                                "text-xs",
                                component.threatLevel === "low"
                                  ? "bg-green-100 text-green-800"
                                  : component.threatLevel === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : component.threatLevel === "high"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800",
                              )}
                            >
                              {component.threatLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Last Scan:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                component.lastSecurityScan,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Vulnerabilities:
                            </span>
                            <span className="font-medium">
                              {component.vulnerabilities}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="text-sm font-medium">
                        {systemMetrics.cpu.usage}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.cpu.usage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Memory Usage
                      </span>
                      <span className="text-sm font-medium">
                        {systemMetrics.memory.used}GB /{" "}
                        {systemMetrics.memory.total}GB
                      </span>
                    </div>
                    <Progress
                      value={systemMetrics.memory.percentage}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Storage Usage
                      </span>
                      <span className="text-sm font-medium">
                        {systemMetrics.storage.used}GB /{" "}
                        {systemMetrics.storage.total}GB
                      </span>
                    </div>
                    <Progress
                      value={systemMetrics.storage.percentage}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network & Database</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Network Latency</p>
                    <p className="text-xl font-bold">
                      {systemMetrics.network.latency}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bandwidth</p>
                    <p className="text-xl font-bold">
                      {systemMetrics.network.bandwidth}Mbps
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">DB Connections</p>
                    <p className="text-xl font-bold">
                      {systemMetrics.database.connections}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cache Hit Rate</p>
                    <p className="text-xl font-bold">
                      {systemMetrics.database.cacheHitRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Alerts</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConfigureAlerts}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {systemHealth.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {systemHealth.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "border rounded-lg p-4",
                        alert.acknowledged ? "bg-gray-50" : "bg-white",
                        alert.type === "critical"
                          ? "border-red-200"
                          : alert.type === "error"
                            ? "border-red-100"
                            : alert.type === "warning"
                              ? "border-yellow-200"
                              : "border-blue-100",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {alert.component}
                              </span>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  alert.type === "critical"
                                    ? "bg-red-100 text-red-800"
                                    : alert.type === "error"
                                      ? "bg-red-100 text-red-800"
                                      : alert.type === "warning"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800",
                                )}
                              >
                                {alert.type.toUpperCase()}
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs">
                                  ACKNOWLEDGED
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAcknowledgeAlert?.(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CPU Cores:</span>
                  <span className="font-medium">{systemMetrics.cpu.cores}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    CPU Temperature:
                  </span>
                  <span className="font-medium">
                    {systemMetrics.cpu.temperature}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Memory:</span>
                  <span className="font-medium">
                    {systemMetrics.memory.total}GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Storage:</span>
                  <span className="font-medium">
                    {systemMetrics.storage.total}GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Query Time:</span>
                  <span className="font-medium">
                    {systemMetrics.database.queryTime}ms
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={onExportReport}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export System Report
                </Button>
                <Button
                  variant="outline"
                  onClick={onConfigureAlerts}
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure Alerts
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignatureSystemMonitor;
