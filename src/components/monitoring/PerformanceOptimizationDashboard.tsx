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
  Brain,
  Package,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Network,
  Memory,
  Gauge,
  Target,
  Award,
  Star,
  Bookmark,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash,
  Save,
  X,
  Check,
  Eye,
  Bell,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";

// Performance Optimization Types
interface PerformanceMetrics {
  bundle: {
    totalSize: number;
    gzippedSize: number;
    chunkCount: number;
    loadTime: number;
    optimizationScore: number;
  };
  database: {
    queryThroughput: number;
    averageResponseTime: number;
    connectionPoolEfficiency: number;
    cacheHitRatio: number;
    optimizationScore: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    memoryLeaks: number;
    gcEfficiency: number;
    optimizationScore: number;
  };
  performance: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    overallScore: number;
  };
}

interface OptimizationRecommendation {
  id: string;
  category: "bundle" | "database" | "memory" | "performance";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: "major" | "moderate" | "minor";
  effort: "low" | "medium" | "high";
  estimatedImprovement: number;
  implementation: string;
  status: "pending" | "in_progress" | "completed" | "dismissed";
}

interface PerformanceTrend {
  metric: string;
  timeframe: "hour" | "day" | "week";
  trend: "improving" | "stable" | "degrading";
  changePercentage: number;
  data: Array<{ timestamp: string; value: number }>;
}

const PerformanceOptimizationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundle: {
      totalSize: 2450000,
      gzippedSize: 850000,
      chunkCount: 12,
      loadTime: 1200,
      optimizationScore: 78,
    },
    database: {
      queryThroughput: 1250,
      averageResponseTime: 85,
      connectionPoolEfficiency: 92,
      cacheHitRatio: 87,
      optimizationScore: 85,
    },
    memory: {
      heapUsed: 145000000,
      heapTotal: 200000000,
      memoryLeaks: 2,
      gcEfficiency: 94,
      optimizationScore: 82,
    },
    performance: {
      firstContentfulPaint: 1100,
      largestContentfulPaint: 2300,
      cumulativeLayoutShift: 0.08,
      firstInputDelay: 45,
      overallScore: 88,
    },
  });

  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([
    {
      id: "bundle-split-1",
      category: "bundle",
      priority: "high",
      title: "Implement Route-Based Code Splitting",
      description: "Split large chunks into smaller, route-based bundles",
      impact: "major",
      effort: "medium",
      estimatedImprovement: 35,
      implementation: "Use React.lazy() and dynamic imports for route components",
      status: "pending",
    },
    {
      id: "db-index-1",
      category: "database",
      priority: "high",
      title: "Optimize Slow Query Performance",
      description: "Add indexes to frequently queried columns",
      impact: "major",
      effort: "low",
      estimatedImprovement: 60,
      implementation: "CREATE INDEX idx_patients_email ON patients(email)",
      status: "pending",
    },
    {
      id: "memory-leak-1",
      category: "memory",
      priority: "medium",
      title: "Fix Event Listener Memory Leaks",
      description: "Remove event listeners on component unmount",
      impact: "moderate",
      effort: "low",
      estimatedImprovement: 25,
      implementation: "Add cleanup functions to useEffect hooks",
      status: "in_progress",
    },
    {
      id: "perf-image-1",
      category: "performance",
      priority: "medium",
      title: "Implement Image Optimization",
      description: "Add WebP conversion and lazy loading for images",
      impact: "moderate",
      effort: "medium",
      estimatedImprovement: 40,
      implementation: "Use next/image or implement custom image optimization",
      status: "pending",
    },
  ]);

  const [trends, setTrends] = useState<PerformanceTrend[]>([
    {
      metric: "Bundle Size",
      timeframe: "week",
      trend: "improving",
      changePercentage: 12.5,
      data: Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: 2450000 - (i * 50000) + Math.random() * 100000,
      })),
    },
    {
      metric: "Database Response Time",
      timeframe: "day",
      trend: "stable",
      changePercentage: 2.1,
      data: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        value: 85 + Math.random() * 20 - 10,
      })),
    },
    {
      metric: "Memory Usage",
      timeframe: "hour",
      trend: "improving",
      changePercentage: 8.3,
      data: Array.from({ length: 60 }, (_, i) => ({
        timestamp: new Date(Date.now() - (59 - i) * 60 * 1000).toISOString(),
        value: 145000000 - (i * 500000) + Math.random() * 2000000,
      })),
    },
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMetrics(prev => ({
        ...prev,
        bundle: {
          ...prev.bundle,
          loadTime: Math.max(800, prev.bundle.loadTime + (Math.random() - 0.5) * 100),
          optimizationScore: Math.max(70, Math.min(100, prev.bundle.optimizationScore + (Math.random() - 0.5) * 2)),
        },
        database: {
          ...prev.database,
          averageResponseTime: Math.max(50, prev.database.averageResponseTime + (Math.random() - 0.5) * 10),
          queryThroughput: Math.max(1000, prev.database.queryThroughput + (Math.random() - 0.5) * 100),
        },
        memory: {
          ...prev.memory,
          heapUsed: Math.max(100000000, prev.memory.heapUsed + (Math.random() - 0.5) * 5000000),
          gcEfficiency: Math.max(85, Math.min(100, prev.memory.gcEfficiency + (Math.random() - 0.5) * 2)),
        },
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "dismissed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "degrading":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };

  const runOptimization = async (category?: string) => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics to show improvement
    setMetrics(prev => ({
      ...prev,
      bundle: {
        ...prev.bundle,
        optimizationScore: Math.min(100, prev.bundle.optimizationScore + 5),
        loadTime: Math.max(600, prev.bundle.loadTime - 200),
      },
      database: {
        ...prev.database,
        optimizationScore: Math.min(100, prev.database.optimizationScore + 3),
        averageResponseTime: Math.max(40, prev.database.averageResponseTime - 15),
      },
      memory: {
        ...prev.memory,
        optimizationScore: Math.min(100, prev.memory.optimizationScore + 4),
        memoryLeaks: Math.max(0, prev.memory.memoryLeaks - 1),
      },
    }));
    
    setIsOptimizing(false);
  };

  const updateRecommendationStatus = (id: string, status: OptimizationRecommendation["status"]) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status } : rec)
    );
  };

  const calculateOverallScore = () => {
    const scores = [
      metrics.bundle.optimizationScore,
      metrics.database.optimizationScore,
      metrics.memory.optimizationScore,
      metrics.performance.overallScore,
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Optimization Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and optimization of bundle, database, memory, and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(calculateOverallScore())}`}>
                Overall Score: {calculateOverallScore()}/100
              </div>
            </div>
            <Button 
              onClick={() => runOptimization()} 
              disabled={isOptimizing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Alert className="border-blue-200 bg-blue-50">
            <Package className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.bundle.optimizationScore)}`}>
                  {metrics.bundle.optimizationScore}
                </div>
                <p className="text-blue-700 text-sm">Bundle Score</p>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round(metrics.bundle.totalSize / 1024 / 1024 * 10) / 10}MB total
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Database className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.database.optimizationScore)}`}>
                  {metrics.database.optimizationScore}
                </div>
                <p className="text-green-700 text-sm">Database Score</p>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round(metrics.database.averageResponseTime)}ms avg
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50">
            <Brain className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.memory.optimizationScore)}`}>
                  {metrics.memory.optimizationScore}
                </div>
                <p className="text-purple-700 text-sm">Memory Score</p>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB used
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50">
            <Activity className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.performance.overallScore)}`}>
                  {metrics.performance.overallScore}
                </div>
                <p className="text-orange-700 text-sm">Performance Score</p>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round(metrics.performance.firstContentfulPaint)}ms FCP
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
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gauge className="h-5 w-5 mr-2 text-blue-600" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Performance</span>
                        <span className="font-medium">{calculateOverallScore()}/100</span>
                      </div>
                      <Progress value={calculateOverallScore()} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Bundle Optimization:</span>
                        <span className="ml-2 font-medium">{metrics.bundle.optimizationScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Database Performance:</span>
                        <span className="ml-2 font-medium">{metrics.database.optimizationScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Memory Management:</span>
                        <span className="ml-2 font-medium">{metrics.memory.optimizationScore}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Core Web Vitals:</span>
                        <span className="ml-2 font-medium">{metrics.performance.overallScore}/100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-green-600" />
                    Quick Optimizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => runOptimization("bundle")} 
                      disabled={isOptimizing}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Optimize Bundle Size
                    </Button>
                    <Button 
                      onClick={() => runOptimization("database")} 
                      disabled={isOptimizing}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Optimize Database Queries
                    </Button>
                    <Button 
                      onClick={() => runOptimization("memory")} 
                      disabled={isOptimizing}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Clean Memory Leaks
                    </Button>
                    <Button 
                      onClick={() => runOptimization("performance")} 
                      disabled={isOptimizing}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Improve Core Web Vitals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Load Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(metrics.bundle.loadTime)}ms
                  </div>
                  <div className="text-sm text-gray-500">Bundle load time</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Query Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(metrics.database.averageResponseTime)}ms
                  </div>
                  <div className="text-sm text-gray-500">Avg response time</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Memory className="h-4 w-4 mr-2" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Heap utilization</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Throughput
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.database.queryThroughput.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Queries per minute</div>
                </CardContent>
              </Card>
            </div>
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
                          {Math.round(metrics.bundle.totalSize / 1024 / 1024 * 10) / 10}MB
                        </div>
                        <div className="text-sm text-gray-600">Total Bundle Size</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(metrics.bundle.gzippedSize / 1024 / 1024 * 10) / 10}MB
                        </div>
                        <div className="text-sm text-gray-600">Gzipped Size</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compression Ratio</span>
                        <span className="font-medium">
                          {Math.round((1 - metrics.bundle.gzippedSize / metrics.bundle.totalSize) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Chunk Count</span>
                        <span className="font-medium">{metrics.bundle.chunkCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Load Time</span>
                        <span className="font-medium">{Math.round(metrics.bundle.loadTime)}ms</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Code Splitting Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Route-based Splitting</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Component Lazy Loading</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vendor Chunk Splitting</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tree Shaking</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
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
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(metrics.database.averageResponseTime)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.database.queryThroughput.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Queries/min</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cache Hit Ratio</span>
                        <span className="font-medium">{metrics.database.cacheHitRatio}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Connection Pool Efficiency</span>
                        <span className="font-medium">{metrics.database.connectionPoolEfficiency}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Slow Queries</span>
                        <span className="font-medium text-yellow-600">3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-600" />
                    Optimization Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Query Optimization</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Index Optimization</span>
                        <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Connection Pooling</span>
                        <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Performance Monitoring</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
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
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB
                        </div>
                        <div className="text-sm text-gray-600">Heap Used</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Utilization</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Leaks</span>
                        <span className={`font-medium ${metrics.memory.memoryLeaks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {metrics.memory.memoryLeaks}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>GC Efficiency</span>
                        <span className="font-medium">{metrics.memory.gcEfficiency}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Heap Total</span>
                        <span className="font-medium">{Math.round(metrics.memory.heapTotal / 1024 / 1024)}MB</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-orange-600" />
                    Memory Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Leak Detection</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Automated Cleanup</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Object Pooling</span>
                        <Badge className="bg-blue-100 text-blue-800">Partial</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GC Optimization</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Optimization Recommendations
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {recommendations.filter(r => r.status === "pending").length} Pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge className={`ml-2 ${getPriorityColor(rec.priority)}`}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <Badge className={`ml-2 ${getStatusColor(rec.status)}`}>
                              {rec.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Impact:</span> {rec.impact} | 
                            <span className="font-medium"> Effort:</span> {rec.effort} | 
                            <span className="font-medium"> Improvement:</span> {rec.estimatedImprovement}%
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {rec.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateRecommendationStatus(rec.id, "in_progress")}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRecommendationStatus(rec.id, "dismissed")}
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                          {rec.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() => updateRecommendationStatus(rec.id, "completed")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs bg-gray-50 p-2 rounded">
                        <span className="font-medium">Implementation:</span> {rec.implementation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {trends.map((trend, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{trend.metric}</span>
                      <span className="text-lg">{getTrendIcon(trend.trend)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Trend</span>
                        <Badge className={`text-xs ${
                          trend.trend === "improving" ? "bg-green-100 text-green-800" :
                          trend.trend === "degrading" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {trend.trend.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Change</span>
                        <span className={`text-sm font-medium ${
                          trend.trend === "improving" ? "text-green-600" :
                          trend.trend === "degrading" ? "text-red-600" :
                          "text-gray-600"
                        }`}>
                          {trend.changePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Timeframe: {trend.timeframe}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Performance trend visualization would be displayed here</p>
                  </div>
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