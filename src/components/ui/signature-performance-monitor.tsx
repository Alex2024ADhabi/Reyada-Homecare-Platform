/**
 * Signature Performance Monitor
 * P6-001: Performance Monitoring (24h)
 *
 * Advanced performance monitoring for signature system with
 * real-time metrics, optimization recommendations, and alerts.
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerformanceMetrics {
  signatureCapture: {
    averageTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
  };
  validation: {
    averageTime: number;
    successRate: number;
    cacheHitRate: number;
  };
  storage: {
    averageWriteTime: number;
    averageReadTime: number;
    compressionRatio: number;
    storageEfficiency: number;
  };
  network: {
    averageLatency: number;
    bandwidth: number;
    connectionStability: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    batteryImpact: number;
  };
}

export interface PerformanceAlerts {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  recommendation?: string;
}

export interface OptimizationRecommendations {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  effort: string;
  implementation: string[];
}

export interface SignaturePerformanceMonitorProps {
  metrics?: PerformanceMetrics;
  alerts?: PerformanceAlerts[];
  recommendations?: OptimizationRecommendations[];
  onOptimize?: (category: string) => Promise<void>;
  onRefresh?: () => void;
  className?: string;
}

const SignaturePerformanceMonitor: React.FC<
  SignaturePerformanceMonitorProps
> = ({
  metrics = {
    signatureCapture: {
      averageTime: 1.2,
      successRate: 98.5,
      errorRate: 1.5,
      throughput: 45,
    },
    validation: {
      averageTime: 0.8,
      successRate: 99.2,
      cacheHitRate: 85.3,
    },
    storage: {
      averageWriteTime: 0.5,
      averageReadTime: 0.3,
      compressionRatio: 3.2,
      storageEfficiency: 92.1,
    },
    network: {
      averageLatency: 120,
      bandwidth: 25.6,
      connectionStability: 94.8,
    },
    system: {
      cpuUsage: 15.2,
      memoryUsage: 68.4,
      diskUsage: 45.7,
      batteryImpact: 8.3,
    },
  },
  alerts = [
    {
      id: "alert-001",
      type: "warning",
      title: "High Memory Usage",
      message: "Signature cache is using 68% of available memory",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false,
      recommendation:
        "Consider clearing old cached signatures or increasing memory allocation",
    },
    {
      id: "alert-002",
      type: "info",
      title: "Optimization Opportunity",
      message: "Signature compression could be improved by 15%",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
      recommendation:
        "Enable advanced compression algorithms for better storage efficiency",
    },
  ],
  recommendations = [
    {
      category: "Storage",
      priority: "high",
      title: "Implement Progressive Image Loading",
      description:
        "Load signature images progressively to reduce initial load time",
      impact: "30% faster signature display",
      effort: "Medium",
      implementation: [
        "Implement lazy loading for signature images",
        "Add progressive JPEG support",
        "Optimize image compression settings",
      ],
    },
    {
      category: "Validation",
      priority: "medium",
      title: "Cache Validation Results",
      description:
        "Cache frequently validated signatures to improve response time",
      impact: "50% faster validation",
      effort: "Low",
      implementation: [
        "Implement Redis caching layer",
        "Add cache invalidation logic",
        "Monitor cache hit rates",
      ],
    },
    {
      category: "Network",
      priority: "low",
      title: "Implement Request Batching",
      description:
        "Batch multiple signature operations to reduce network overhead",
      impact: "20% reduction in network calls",
      effort: "High",
      implementation: [
        "Design batching API endpoints",
        "Implement client-side batching logic",
        "Add retry mechanisms",
      ],
    },
  ],
  onOptimize,
  onRefresh,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);

  const getPerformanceColor = (
    value: number,
    thresholds: { good: number; warning: number },
  ) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOptimize = async (category: string) => {
    setIsOptimizing(category);
    try {
      await onOptimize?.(category);
    } finally {
      setIsOptimizing(null);
    }
  };

  return (
    <div className={cn("space-y-6 bg-white p-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Signature Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Alerts */}
      {alerts.filter((alert) => !alert.resolved).length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((alert) => !alert.resolved)
            .map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.type === "error" ? "destructive" : "default"}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm">{alert.message}</div>
                      {alert.recommendation && (
                        <div className="text-xs mt-1 text-gray-600">
                          Recommendation: {alert.recommendation}
                        </div>
                      )}
                    </div>
                    <Badge
                      className={cn("text-xs ml-4", getAlertColor(alert.type))}
                    >
                      {alert.type.toUpperCase()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Signature Capture</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    getPerformanceColor(metrics.signatureCapture.averageTime, {
                      good: 2,
                      warning: 1,
                    }),
                  )}
                >
                  {metrics.signatureCapture.averageTime}s
                </p>
                <p className="text-xs text-gray-500">Average Time</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    getPerformanceColor(metrics.signatureCapture.successRate, {
                      good: 95,
                      warning: 90,
                    }),
                  )}
                >
                  {metrics.signatureCapture.successRate}%
                </p>
                <p className="text-xs text-gray-500">Capture Success</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Throughput</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.signatureCapture.throughput}
                </p>
                <p className="text-xs text-gray-500">Signatures/hour</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Load</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    getPerformanceColor(100 - metrics.system.cpuUsage, {
                      good: 80,
                      warning: 60,
                    }),
                  )}
                >
                  {metrics.system.cpuUsage}%
                </p>
                <p className="text-xs text-gray-500">CPU Usage</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Signature Capture</span>
                      <span className="text-sm font-medium">
                        {metrics.signatureCapture.successRate}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.signatureCapture.successRate}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Validation</span>
                      <span className="text-sm font-medium">
                        {metrics.validation.successRate}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.validation.successRate}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Storage Efficiency</span>
                      <span className="text-sm font-medium">
                        {metrics.storage.storageEfficiency}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.storage.storageEfficiency}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Network Stability</span>
                      <span className="text-sm font-medium">
                        {metrics.network.connectionStability}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.network.connectionStability}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div
                      className={cn(
                        "text-xl font-bold",
                        getPerformanceColor(100 - metrics.system.cpuUsage, {
                          good: 80,
                          warning: 60,
                        }),
                      )}
                    >
                      {metrics.system.cpuUsage}%
                    </div>
                    <div className="text-xs text-gray-600">CPU Usage</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div
                      className={cn(
                        "text-xl font-bold",
                        getPerformanceColor(100 - metrics.system.memoryUsage, {
                          good: 70,
                          warning: 50,
                        }),
                      )}
                    >
                      {metrics.system.memoryUsage}%
                    </div>
                    <div className="text-xs text-gray-600">Memory Usage</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div
                      className={cn(
                        "text-xl font-bold",
                        getPerformanceColor(100 - metrics.system.diskUsage, {
                          good: 80,
                          warning: 60,
                        }),
                      )}
                    >
                      {metrics.system.diskUsage}%
                    </div>
                    <div className="text-xs text-gray-600">Disk Usage</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div
                      className={cn(
                        "text-xl font-bold",
                        getPerformanceColor(
                          100 - metrics.system.batteryImpact,
                          { good: 90, warning: 80 },
                        ),
                      )}
                    >
                      {metrics.system.batteryImpact}%
                    </div>
                    <div className="text-xs text-gray-600">Battery Impact</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Signature Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Average Capture Time:</span>
                    <span className="ml-2 font-medium">
                      {metrics.signatureCapture.averageTime}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="ml-2 font-medium">
                      {metrics.signatureCapture.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {metrics.signatureCapture.errorRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Throughput:</span>
                    <span className="ml-2 font-medium">
                      {metrics.signatureCapture.throughput}/hr
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Validation Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Average Time:</span>
                    <span className="ml-2 font-medium">
                      {metrics.validation.averageTime}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="ml-2 font-medium">
                      {metrics.validation.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cache Hit Rate:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {metrics.validation.cacheHitRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Write Time:</span>
                    <span className="ml-2 font-medium">
                      {metrics.storage.averageWriteTime}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Read Time:</span>
                    <span className="ml-2 font-medium">
                      {metrics.storage.averageReadTime}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Compression Ratio:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {metrics.storage.compressionRatio}:1
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="ml-2 font-medium">
                      {metrics.storage.storageEfficiency}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Network Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Average Latency:</span>
                    <span className="ml-2 font-medium">
                      {metrics.network.averageLatency}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bandwidth:</span>
                    <span className="ml-2 font-medium">
                      {metrics.network.bandwidth} Mbps
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Connection Stability:</span>
                    <span className="ml-2 font-medium">
                      {metrics.network.connectionStability}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge
                          className={cn(
                            "text-xs",
                            getPriorityColor(rec.priority),
                          )}
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {rec.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Expected Impact:
                          </span>
                          <span className="ml-2 font-medium text-green-600">
                            {rec.impact}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Implementation Effort:
                          </span>
                          <span className="ml-2 font-medium">{rec.effort}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOptimize(rec.category)}
                      disabled={isOptimizing === rec.category}
                      className="flex items-center gap-2"
                    >
                      {isOptimizing === rec.category ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {isOptimizing === rec.category
                        ? "Optimizing..."
                        : "Optimize"}
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">
                      Implementation Steps:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {rec.implementation.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge
                          className={cn("text-xs", getAlertColor(alert.type))}
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        {alert.resolved ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {alert.message}
                      </p>
                      {alert.recommendation && (
                        <p className="text-xs text-gray-600 mb-2">
                          <strong>Recommendation:</strong>{" "}
                          {alert.recommendation}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!alert.resolved && (
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
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

export default SignaturePerformanceMonitor;
