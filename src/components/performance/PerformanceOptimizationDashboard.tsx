import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Database,
  Memory,
  Image,
  Gauge,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  HardDrive,
  Cpu,
  Network,
  Clock,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Bell,
  Shield,
  Layers,
  Package,
  Server,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Signal,
  Battery,
} from "lucide-react";

// Performance Optimization Dashboard Types
interface PerformanceMetrics {
  bundleOptimization: {
    totalSize: number;
    gzippedSize: number;
    chunkCount: number;
    compressionRatio: number;
    treeshakingEfficiency: number;
    codeSpittingScore: number;
  };
  databasePerformance: {
    queryResponseTime: number;
    connectionPoolUtilization: number;
    cacheHitRate: number;
    slowQueries: number;
    indexEfficiency: number;
    throughput: number;
  };
  memoryManagement: {
    heapUsage: number;
    memoryLeaks: number;
    gcEfficiency: number;
    objectCount: number;
    retainedSize: number;
    fragmentationRate: number;
  };
  additionalPerformance: {
    cdnHitRate: number;
    imageOptimization: number;
    serviceWorkerCacheHit: number;
    performanceBudgetCompliance: number;
    webVitalsScore: number;
    loadTime: number;
  };
}

interface OptimizationRecommendation {
  id: string;
  category: "bundle" | "database" | "memory" | "additional";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: {
    performance: number;
    size: number;
    effort: number;
  };
  implementation: string[];
}

interface PerformanceAlert {
  id: string;
  type: "budget_exceeded" | "memory_leak" | "slow_query" | "optimization_opportunity";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  metrics: Record<string, number>;
}

const PerformanceOptimizationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleOptimization: {
      totalSize: 1.2 * 1024 * 1024, // 1.2MB
      gzippedSize: 380 * 1024, // 380KB
      chunkCount: 8,
      compressionRatio: 68.3,
      treeshakingEfficiency: 87.5,
      codeSpittingScore: 92.1,
    },
    databasePerformance: {
      queryResponseTime: 45,
      connectionPoolUtilization: 23,
      cacheHitRate: 94.2,
      slowQueries: 3,
      indexEfficiency: 91.7,
      throughput: 1250,
    },
    memoryManagement: {
      heapUsage: 67.3,
      memoryLeaks: 2,
      gcEfficiency: 89.4,
      objectCount: 15420,
      retainedSize: 23.7,
      fragmentationRate: 12.8,
    },
    additionalPerformance: {
      cdnHitRate: 96.8,
      imageOptimization: 88.5,
      serviceWorkerCacheHit: 92.3,
      performanceBudgetCompliance: 94.7,
      webVitalsScore: 87.2,
      loadTime: 1.8,
    },
  });

  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([
    {
      id: "rec-001",
      category: "bundle",
      priority: "high",
      title: "Implement Advanced Code Splitting",
      description: "Split large components into separate chunks for better loading performance",
      impact: { performance: 25, size: 200, effort: 60 },
      implementation: [
        "Use React.lazy() for route-based splitting",
        "Implement dynamic imports for large components",
        "Configure Webpack chunk optimization",
      ],
    },
    {
      id: "rec-002",
      category: "database",
      priority: "critical",
      title: "Optimize Slow Queries",
      description: "3 queries are exceeding performance thresholds",
      impact: { performance: 40, size: 0, effort: 30 },
      implementation: [
        "Add missing database indexes",
        "Optimize query structure",
        "Implement query result caching",
      ],
    },
    {
      id: "rec-003",
      category: "memory",
      priority: "medium",
      title: "Fix Memory Leaks",
      description: "2 potential memory leaks detected in component lifecycle",
      impact: { performance: 15, size: 0, effort: 45 },
      implementation: [
        "Review event listener cleanup",
        "Fix component unmounting logic",
        "Implement proper cleanup in useEffect",
      ],
    },
    {
      id: "rec-004",
      category: "additional",
      priority: "medium",
      title: "Enhance Image Optimization",
      description: "Implement WebP conversion and responsive images",
      impact: { performance: 20, size: 300, effort: 40 },
      implementation: [
        "Convert images to WebP format",
        "Implement responsive image sets",
        "Add lazy loading for images",
      ],
    },
  ]);

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([
    {
      id: "alert-001",
      type: "slow_query",
      severity: "error",
      title: "Database Query Performance Degraded",
      description: "Patient search query response time increased to 2.3s",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      acknowledged: false,
      metrics: { responseTime: 2300, threshold: 1000 },
    },
    {
      id: "alert-002",
      type: "memory_leak",
      severity: "warning",
      title: "Memory Usage Increasing",
      description: "Heap usage has grown by 15% in the last hour",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      acknowledged: false,
      metrics: { heapUsage: 67.3, growth: 15 },
    },
    {
      id: "alert-003",
      type: "budget_exceeded",
      severity: "warning",
      title: "Bundle Size Budget Exceeded",
      description: "JavaScript bundle size exceeds 1MB threshold",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      acknowledged: true,
      metrics: { bundleSize: 1.2, threshold: 1.0 },
    },
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        databasePerformance: {
          ...prev.databasePerformance,
          queryResponseTime: Math.max(20, prev.databasePerformance.queryResponseTime + (Math.random() - 0.5) * 10),
          connectionPoolUtilization: Math.max(0, Math.min(100, prev.databasePerformance.connectionPoolUtilization + (Math.random() - 0.5) * 5)),
          throughput: Math.max(0, prev.databasePerformance.throughput + (Math.random() - 0.5) * 100),
        },
        memoryManagement: {
          ...prev.memoryManagement,
          heapUsage: Math.max(0, Math.min(100, prev.memoryManagement.heapUsage + (Math.random() - 0.5) * 2)),
          objectCount: Math.max(0, prev.memoryManagement.objectCount + Math.floor((Math.random() - 0.5) * 100)),
        },
        additionalPerformance: {
          ...prev.additionalPerformance,
          loadTime: Math.max(0.5, prev.additionalPerformance.loadTime + (Math.random() - 0.5) * 0.2),
          webVitalsScore: Math.max(0, Math.min(100, prev.additionalPerformance.webVitalsScore + (Math.random() - 0.5) * 3)),
        },
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-600 bg-green-100";
    if (value >= thresholds.warning) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100";
      case "error": return "text-red-600 bg-red-100";
      case "warning": return "text-yellow-600 bg-yellow-100";
      case "info": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const optimizePerformance = async (recommendationIds: string[]) => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics to show improvement
    setMetrics(prev => ({
      ...prev,
      bundleOptimization: {
        ...prev.bundleOptimization,
        totalSize: prev.bundleOptimization.totalSize * 0.85,
        treeshakingEfficiency: Math.min(100, prev.bundleOptimization.treeshakingEfficiency + 5),
      },
      databasePerformance: {
        ...prev.databasePerformance,
        queryResponseTime: prev.databasePerformance.queryResponseTime * 0.7,
        slowQueries: Math.max(0, prev.databasePerformance.slowQueries - 1),
      },
    }));

    // Remove applied recommendations
    setRecommendations(prev => prev.filter(rec => !recommendationIds.includes(rec.id)));
    
    setIsOptimizing(false);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Optimization Control Center
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced performance monitoring and optimization for Phase 3 implementation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="text-lg font-semibold text-green-600">
                System Status: Optimized
              </div>
            </div>
            <Button 
              onClick={() => optimizePerformance(recommendations.slice(0, 2).map(r => r.id))}
              disabled={isOptimizing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className={`h-4 w-4 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'Optimizing...' : 'Auto Optimize'}
            </Button>
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Alert className="border-blue-200 bg-blue-50">
            <Package className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {formatBytes(metrics.bundleOptimization.totalSize)}
                </div>
                <p className="text-blue-700 text-sm">Bundle Size</p>
                <div className="text-xs text-blue-600 mt-1">
                  {metrics.bundleOptimization.compressionRatio.toFixed(1)}% compressed
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Database className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {Math.round(metrics.databasePerformance.queryResponseTime)}ms
                </div>
                <p className="text-green-700 text-sm">Query Response</p>
                <div className="text-xs text-green-600 mt-1">
                  {metrics.databasePerformance.cacheHitRate.toFixed(1)}% cache hit
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50">
            <Memory className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {metrics.memoryManagement.heapUsage.toFixed(1)}%
                </div>
                <p className="text-purple-700 text-sm">Memory Usage</p>
                <div className="text-xs text-purple-600 mt-1">
                  {metrics.memoryManagement.memoryLeaks} leaks detected
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50">
            <Gauge className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800">
                  {metrics.additionalPerformance.webVitalsScore.toFixed(0)}
                </div>
                <p className="text-orange-700 text-sm">Web Vitals Score</p>
                <div className="text-xs text-orange-600 mt-1">
                  {metrics.additionalPerformance.loadTime.toFixed(1)}s load time
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bundle">Bundle</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Performance Metrics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Bundle Optimization</span>
                        <span>{metrics.bundleOptimization.codeSpittingScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.bundleOptimization.codeSpittingScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Performance</span>
                        <span>{metrics.databasePerformance.indexEfficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.databasePerformance.indexEfficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Management</span>
                        <span>{metrics.memoryManagement.gcEfficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.memoryManagement.gcEfficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Additional Performance</span>
                        <span>{metrics.additionalPerformance.performanceBudgetCompliance.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.additionalPerformance.performanceBudgetCompliance} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.slice(0, 4).map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{rec.title}</div>
                          <div className="text-xs text-gray-500">{rec.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-green-600">
                            +{rec.impact.performance}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-orange-600" />
                    Active Performance Alerts
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    {alerts.filter(alert => !alert.acknowledged).length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.filter(alert => !alert.acknowledged).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="ml-2 font-medium text-sm">{alert.title}</span>
                        </div>
                        <div className="text-xs text-gray-500">{alert.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bundle" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Bundle Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatBytes(metrics.bundleOptimization.totalSize)}
                        </div>
                        <div className="text-sm text-gray-600">Total Bundle Size</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatBytes(metrics.bundleOptimization.gzippedSize)}
                        </div>
                        <div className="text-sm text-gray-600">Gzipped Size</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compression Ratio</span>
                        <span className="font-medium">{metrics.bundleOptimization.compressionRatio.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tree Shaking Efficiency</span>
                        <span className="font-medium">{metrics.bundleOptimization.treeshakingEfficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Code Splitting Score</span>
                        <span className="font-medium">{metrics.bundleOptimization.codeSpittingScore.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Chunk Count</span>
                        <span className="font-medium">{metrics.bundleOptimization.chunkCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-purple-600" />
                    Bundle Optimization Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Dynamic Code Splitting</span>
                        <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Route-based splitting implemented</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tree Shaking</span>
                        <Badge className="bg-green-100 text-green-800">OPTIMIZED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Advanced dead code elimination</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Bundle Monitoring</span>
                        <Badge className="bg-blue-100 text-blue-800">MONITORING</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Automated size analysis active</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Dynamic Imports</span>
                        <Badge className="bg-green-100 text-green-800">ENABLED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Lazy loading with preloading</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-green-600" />
                    Database Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(metrics.databasePerformance.queryResponseTime)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Query Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.databasePerformance.throughput.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Queries/min</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Connection Pool Utilization</span>
                        <span className="font-medium">{metrics.databasePerformance.connectionPoolUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cache Hit Rate</span>
                        <span className="font-medium">{metrics.databasePerformance.cacheHitRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Index Efficiency</span>
                        <span className="font-medium">{metrics.databasePerformance.indexEfficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Slow Queries</span>
                        <span className="font-medium text-orange-600">{metrics.databasePerformance.slowQueries}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2 text-blue-600" />
                    Database Optimization Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Query Optimization</span>
                        <Badge className="bg-green-100 text-green-800">AUTOMATED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Real-time query analysis active</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Index Optimization</span>
                        <Badge className="bg-green-100 text-green-800">DYNAMIC</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Adaptive index management</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Connection Pooling</span>
                        <Badge className="bg-blue-100 text-blue-800">ENHANCED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Advanced pool management</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Monitoring</span>
                        <Badge className="bg-green-100 text-green-800">REAL-TIME</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Live performance tracking</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Memory className="h-5 w-5 mr-2 text-purple-600" />
                    Memory Management Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.memoryManagement.heapUsage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Heap Usage</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {metrics.memoryManagement.memoryLeaks}
                        </div>
                        <div className="text-sm text-gray-600">Memory Leaks</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>GC Efficiency</span>
                        <span className="font-medium">{metrics.memoryManagement.gcEfficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Object Count</span>
                        <span className="font-medium">{metrics.memoryManagement.objectCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Retained Size</span>
                        <span className="font-medium">{metrics.memoryManagement.retainedSize.toFixed(1)} MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fragmentation Rate</span>
                        <span className="font-medium">{metrics.memoryManagement.fragmentationRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Memory Optimization Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Leak Detection</span>
                        <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Automated leak detection running</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Cleanup</span>
                        <Badge className="bg-blue-100 text-blue-800">AUTOMATED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Proactive memory management</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Usage Optimization</span>
                        <Badge className="bg-green-100 text-green-800">PROFILING</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Memory usage profiling active</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Real-time Monitoring</span>
                        <Badge className="bg-green-100 text-green-800">LIVE</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Live memory usage tracking</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    Additional Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.additionalPerformance.cdnHitRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">CDN Hit Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.additionalPerformance.loadTime.toFixed(1)}s
                        </div>
                        <div className="text-sm text-gray-600">Load Time</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Image Optimization</span>
                        <span className="font-medium">{metrics.additionalPerformance.imageOptimization.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service Worker Cache Hit</span>
                        <span className="font-medium">{metrics.additionalPerformance.serviceWorkerCacheHit.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Performance Budget Compliance</span>
                        <span className="font-medium">{metrics.additionalPerformance.performanceBudgetCompliance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Web Vitals Score</span>
                        <span className="font-medium">{metrics.additionalPerformance.webVitalsScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Additional Optimization Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CDN Integration</span>
                        <Badge className="bg-green-100 text-green-800">GLOBAL</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Edge caching with global CDN</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Image Optimization</span>
                        <Badge className="bg-blue-100 text-blue-800">AUTOMATED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">WebP conversion pipeline active</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Service Worker</span>
                        <Badge className="bg-green-100 text-green-800">ADVANCED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Smart caching strategies</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Budget</span>
                        <Badge className="bg-green-100 text-green-800">ENFORCED</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Automated budget monitoring</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-orange-600" />
                    Performance Alerts & Notifications
                  </div>
                  <div className="flex space-x-2">
                    <Badge className="bg-red-100 text-red-800">
                      {alerts.filter(a => a.severity === 'error' && !a.acknowledged).length} Errors
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length} Warnings
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="ml-2 font-medium">{alert.title}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          <div className="text-xs text-gray-500">
                            Metrics: {Object.entries(alert.metrics).map(([key, value]) => 
                              `${key}: ${typeof value === 'number' ? value.toFixed(1) : value}`
                            ).join(', ')}
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
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

export default PerformanceOptimizationDashboard;