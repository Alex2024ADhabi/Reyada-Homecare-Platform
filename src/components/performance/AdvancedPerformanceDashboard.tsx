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
  Image,
  Cpu,
  HardDrive,
  Network,
  Memory,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Bell,
  Gauge,
  Layers,
  Smartphone,
  Globe,
  Shield,
  Optimize,
  FileImage,
  Server,
  CloudLightning,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";

// Performance Metrics Interfaces
interface BundleMetrics {
  totalSize: number;
  gzipSize: number;
  brotliSize: number;
  chunks: { name: string; size: number; gzipSize: number }[];
  treeShakingEfficiency: number;
  codeSpittingEfficiency: number;
}

interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  heapUsed: number;
  heapTotal: number;
  leaksDetected: number;
  gcFrequency: number;
}

interface DatabaseMetrics {
  queryTime: number;
  connectionCount: number;
  slowQueries: number;
  indexEfficiency: number;
  cacheHitRate: number;
  connectionPoolUtilization: number;
}

interface ImageMetrics {
  totalImages: number;
  optimizedImages: number;
  totalSavings: number;
  averageCompressionRatio: number;
  lazyLoadedImages: number;
  webpUsage: number;
}

interface ServiceWorkerMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  offlineRequests: number;
  backgroundSyncQueue: number;
  cacheSizes: Record<string, number>;
}

interface PerformanceScores {
  overall: number;
  bundle: number;
  memory: number;
  database: number;
  images: number;
  serviceWorker: number;
  coreWebVitals: {
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
  };
}

const AdvancedPerformanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Performance Metrics State
  const [bundleMetrics, setBundleMetrics] = useState<BundleMetrics>({
    totalSize: 2.4 * 1024 * 1024, // 2.4MB
    gzipSize: 0.8 * 1024 * 1024,  // 800KB
    brotliSize: 0.7 * 1024 * 1024, // 700KB
    chunks: [
      { name: "vendor", size: 1.2 * 1024 * 1024, gzipSize: 0.4 * 1024 * 1024 },
      { name: "main", size: 0.8 * 1024 * 1024, gzipSize: 0.25 * 1024 * 1024 },
      { name: "compliance", size: 0.3 * 1024 * 1024, gzipSize: 0.1 * 1024 * 1024 },
      { name: "analytics", size: 0.1 * 1024 * 1024, gzipSize: 0.05 * 1024 * 1024 },
    ],
    treeShakingEfficiency: 87.5,
    codeSpittingEfficiency: 92.3,
  });

  const [memoryMetrics, setMemoryMetrics] = useState<MemoryMetrics>({
    used: 45 * 1024 * 1024,  // 45MB
    total: 100 * 1024 * 1024, // 100MB
    percentage: 45,
    heapUsed: 38 * 1024 * 1024,
    heapTotal: 85 * 1024 * 1024,
    leaksDetected: 2,
    gcFrequency: 0.5, // per second
  });

  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>({
    queryTime: 45,
    connectionCount: 12,
    slowQueries: 3,
    indexEfficiency: 94.2,
    cacheHitRate: 87.5,
    connectionPoolUtilization: 65,
  });

  const [imageMetrics, setImageMetrics] = useState<ImageMetrics>({
    totalImages: 156,
    optimizedImages: 142,
    totalSavings: 3.2 * 1024 * 1024, // 3.2MB saved
    averageCompressionRatio: 68.5,
    lazyLoadedImages: 89,
    webpUsage: 78.5,
  });

  const [serviceWorkerMetrics, setServiceWorkerMetrics] = useState<ServiceWorkerMetrics>({
    cacheHitRate: 82.3,
    averageResponseTime: 125,
    offlineRequests: 23,
    backgroundSyncQueue: 5,
    cacheSizes: {
      "static": 2.1 * 1024 * 1024,
      "dynamic": 1.8 * 1024 * 1024,
      "api": 0.5 * 1024 * 1024,
      "images": 4.2 * 1024 * 1024,
    },
  });

  const [performanceScores, setPerformanceScores] = useState<PerformanceScores>({
    overall: 94.2,
    bundle: 91.5,
    memory: 88.7,
    database: 96.3,
    images: 93.8,
    serviceWorker: 89.2,
    coreWebVitals: {
      fcp: 1.2, // seconds
      lcp: 2.1, // seconds
      cls: 0.08,
      fid: 45, // milliseconds
    },
  });

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMemoryMetrics(prev => ({
        ...prev,
        used: Math.max(30 * 1024 * 1024, prev.used + (Math.random() - 0.5) * 2 * 1024 * 1024),
        percentage: Math.max(30, Math.min(80, prev.percentage + (Math.random() - 0.5) * 5)),
      }));

      setDatabaseMetrics(prev => ({
        ...prev,
        queryTime: Math.max(20, prev.queryTime + (Math.random() - 0.5) * 10),
        connectionCount: Math.max(5, Math.min(20, prev.connectionCount + Math.floor((Math.random() - 0.5) * 4))),
      }));

      setServiceWorkerMetrics(prev => ({
        ...prev,
        cacheHitRate: Math.max(70, Math.min(95, prev.cacheHitRate + (Math.random() - 0.5) * 3)),
        averageResponseTime: Math.max(50, prev.averageResponseTime + (Math.random() - 0.5) * 20),
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const optimizePerformance = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics to show improvements
    setBundleMetrics(prev => ({
      ...prev,
      totalSize: prev.totalSize * 0.85,
      gzipSize: prev.gzipSize * 0.8,
      treeShakingEfficiency: Math.min(95, prev.treeShakingEfficiency + 5),
    }));

    setMemoryMetrics(prev => ({
      ...prev,
      leaksDetected: Math.max(0, prev.leaksDetected - 1),
      percentage: Math.max(30, prev.percentage - 10),
    }));

    setImageMetrics(prev => ({
      ...prev,
      optimizedImages: Math.min(prev.totalImages, prev.optimizedImages + 5),
      totalSavings: prev.totalSavings * 1.2,
    }));

    setPerformanceScores(prev => ({
      ...prev,
      overall: Math.min(100, prev.overall + 3),
      bundle: Math.min(100, prev.bundle + 4),
      memory: Math.min(100, prev.memory + 5),
      images: Math.min(100, prev.images + 2),
    }));

    setIsOptimizing(false);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Advanced Performance Optimization Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and optimization of all performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(performanceScores.overall)}`}>
                Performance Score: {performanceScores.overall.toFixed(1)}
              </div>
            </div>
            <Button 
              onClick={optimizePerformance} 
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
                  <Optimize className="h-4 w-4 mr-2" />
                  Optimize All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Performance Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Alert className="border-blue-200 bg-blue-50">
            <Gauge className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScores.overall)}`}>
                  {performanceScores.overall.toFixed(1)}
                </div>
                <p className="text-blue-700 text-sm">Overall Score</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Layers className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScores.bundle)}`}>
                  {performanceScores.bundle.toFixed(1)}
                </div>
                <p className="text-green-700 text-sm">Bundle</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50">
            <Memory className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScores.memory)}`}>
                  {performanceScores.memory.toFixed(1)}
                </div>
                <p className="text-purple-700 text-sm">Memory</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50">
            <Database className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScores.database)}`}>
                  {performanceScores.database.toFixed(1)}
                </div>
                <p className="text-orange-700 text-sm">Database</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-pink-200 bg-pink-50">
            <FileImage className="h-4 w-4 text-pink-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScores.images)}`}>
                  {performanceScores.images.toFixed(1)}
                </div>
                <p className="text-pink-700 text-sm">Images</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-indigo-200 bg-indigo-50">
            <CloudLightning className="h-4 w-4 text-indigo-600" />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScores.serviceWorker)}`}>
                  {performanceScores.serviceWorker.toFixed(1)}
                </div>
                <p className="text-indigo-700 text-sm">Service Worker</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bundle">Bundle</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="service-worker">Service Worker</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${performanceScores.coreWebVitals.fcp <= 1.8 ? 'text-green-600' : 'text-red-600'}`}>
                      {performanceScores.coreWebVitals.fcp.toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600">First Contentful Paint</div>
                    <Badge className={performanceScores.coreWebVitals.fcp <= 1.8 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {performanceScores.coreWebVitals.fcp <= 1.8 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${performanceScores.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {performanceScores.coreWebVitals.lcp.toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600">Largest Contentful Paint</div>
                    <Badge className={performanceScores.coreWebVitals.lcp <= 2.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {performanceScores.coreWebVitals.lcp <= 2.5 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${performanceScores.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                      {performanceScores.coreWebVitals.cls.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600">Cumulative Layout Shift</div>
                    <Badge className={performanceScores.coreWebVitals.cls <= 0.1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {performanceScores.coreWebVitals.cls <= 0.1 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${performanceScores.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {performanceScores.coreWebVitals.fid.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-600">First Input Delay</div>
                    <Badge className={performanceScores.coreWebVitals.fid <= 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {performanceScores.coreWebVitals.fid <= 100 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Performance Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bundle Size Reduction</span>
                      <div className="flex items-center">
                        <span className="text-green-600 font-medium">-32%</span>
                        <TrendingDown className="h-4 w-4 ml-1 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Usage Optimization</span>
                      <div className="flex items-center">
                        <span className="text-green-600 font-medium">-18%</span>
                        <TrendingDown className="h-4 w-4 ml-1 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Image Compression</span>
                      <div className="flex items-center">
                        <span className="text-green-600 font-medium">-68%</span>
                        <TrendingDown className="h-4 w-4 ml-1 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Query Speed</span>
                      <div className="flex items-center">
                        <span className="text-green-600 font-medium">+45%</span>
                        <TrendingUp className="h-4 w-4 ml-1 text-green-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                    Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Enable advanced tree shaking</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Implement memory leak detection</span>
                      <Badge className="bg-red-100 text-red-800">High</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Optimize database indexes</span>
                      <Badge className="bg-orange-100 text-orange-800">Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Convert images to WebP</span>
                      <Badge className="bg-blue-100 text-blue-800">Low</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bundle" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-green-600" />
                    Bundle Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Bundle Size</span>
                        <span className="font-medium">{formatBytes(bundleMetrics.totalSize)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Gzipped Size</span>
                        <span className="font-medium text-green-600">{formatBytes(bundleMetrics.gzipSize)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-3">
                        <span>Brotli Size</span>
                        <span className="font-medium text-blue-600">{formatBytes(bundleMetrics.brotliSize)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Optimization Efficiency</div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Tree Shaking</span>
                            <span>{bundleMetrics.treeShakingEfficiency.toFixed(1)}%</span>
                          </div>
                          <Progress value={bundleMetrics.treeShakingEfficiency} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Code Splitting</span>
                            <span>{bundleMetrics.codeSpittingEfficiency.toFixed(1)}%</span>
                          </div>
                          <Progress value={bundleMetrics.codeSpittingEfficiency} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Chunk Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bundleMetrics.chunks.map((chunk, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{chunk.name}</span>
                          <span className="font-medium">{formatBytes(chunk.size)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Gzipped: {formatBytes(chunk.gzipSize)}</span>
                          <span>{((chunk.size / bundleMetrics.totalSize) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(chunk.size / bundleMetrics.totalSize) * 100} className="h-1" />
                      </div>
                    ))}
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
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {memoryMetrics.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Memory Utilization</div>
                    </div>
                    
                    <Progress value={memoryMetrics.percentage} className="h-3" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Used:</span>
                        <span className="ml-2 font-medium">{formatBytes(memoryMetrics.used)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 font-medium">{formatBytes(memoryMetrics.total)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Heap Used:</span>
                        <span className="ml-2 font-medium">{formatBytes(memoryMetrics.heapUsed)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Heap Total:</span>
                        <span className="ml-2 font-medium">{formatBytes(memoryMetrics.heapTotal)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Memory Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Memory Leaks Detected</div>
                        <div className="text-sm text-gray-500">Active leak monitoring</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${memoryMetrics.leaksDetected > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {memoryMetrics.leaksDetected}
                        </div>
                        <Badge className={memoryMetrics.leaksDetected > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {memoryMetrics.leaksDetected > 0 ? 'Issues Found' : 'Healthy'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Garbage Collection</div>
                        <div className="text-sm text-gray-500">Frequency per second</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {memoryMetrics.gcFrequency.toFixed(1)}
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
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
                    <Database className="h-5 w-5 mr-2 text-orange-600" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {databaseMetrics.queryTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Query Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {databaseMetrics.cacheHitRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Cache Hit Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Index Efficiency</span>
                        <span className="font-medium">{databaseMetrics.indexEfficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={databaseMetrics.indexEfficiency} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Connection Pool Utilization</span>
                        <span className="font-medium">{databaseMetrics.connectionPoolUtilization.toFixed(1)}%</span>
                      </div>
                      <Progress value={databaseMetrics.connectionPoolUtilization} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Active Connections</div>
                        <div className="text-sm text-gray-500">Currently in use</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {databaseMetrics.connectionCount}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Slow Queries</div>
                        <div className="text-sm text-gray-500">Queries > 1s</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${databaseMetrics.slowQueries > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {databaseMetrics.slowQueries}
                        </div>
                        <Badge className={databaseMetrics.slowQueries > 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {databaseMetrics.slowQueries > 5 ? 'Needs Attention' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileImage className="h-5 w-5 mr-2 text-pink-600" />
                    Image Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">
                          {imageMetrics.optimizedImages}
                        </div>
                        <div className="text-sm text-gray-600">Optimized Images</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatBytes(imageMetrics.totalSavings)}
                        </div>
                        <div className="text-sm text-gray-600">Total Savings</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Optimization Rate</span>
                        <span className="font-medium">{((imageMetrics.optimizedImages / imageMetrics.totalImages) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(imageMetrics.optimizedImages / imageMetrics.totalImages) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Compression</span>
                        <span className="font-medium">{imageMetrics.averageCompressionRatio.toFixed(1)}%</span>
                      </div>
                      <Progress value={imageMetrics.averageCompressionRatio} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-600" />
                    Loading Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Lazy Loaded Images</div>
                        <div className="text-sm text-gray-500">Performance optimization</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {imageMetrics.lazyLoadedImages}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">WebP Usage</div>
                        <div className="text-sm text-gray-500">Modern format adoption</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {imageMetrics.webpUsage.toFixed(1)}%
                        </div>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="service-worker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CloudLightning className="h-5 w-5 mr-2 text-indigo-600" />
                    Service Worker Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {serviceWorkerMetrics.cacheHitRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Cache Hit Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {serviceWorkerMetrics.averageResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Offline Requests Handled</span>
                        <span className="font-medium">{serviceWorkerMetrics.offlineRequests}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Background Sync Queue</span>
                        <span className="font-medium">{serviceWorkerMetrics.backgroundSyncQueue}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2 text-gray-600" />
                    Cache Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(serviceWorkerMetrics.cacheSizes).map(([cache, size]) => (
                      <div key={cache} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{cache} Cache</span>
                          <span className="font-medium">{formatBytes(size)}</span>
                        </div>
                        <Progress 
                          value={(size / Math.max(...Object.values(serviceWorkerMetrics.cacheSizes))) * 100} 
                          className="h-1" 
                        />
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total Cache Size</span>
                        <span>{formatBytes(Object.values(serviceWorkerMetrics.cacheSizes).reduce((a, b) => a + b, 0))}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedPerformanceDashboard;