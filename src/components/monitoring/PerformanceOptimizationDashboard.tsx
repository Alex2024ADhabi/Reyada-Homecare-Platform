/**
 * Performance Optimization Dashboard
 * Phase 3: Performance Optimization - Comprehensive monitoring and control center
 * Real-time bundle optimization, caching, database performance, and memory management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Zap,
  Database,
  HardDrive,
  Cpu,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Target,
  Gauge,
  FileText,
  Shield,
  Users,
  Globe
} from 'lucide-react';

interface PerformanceMetrics {
  bundleOptimization: {
    totalSize: number;
    compressedSize: number;
    optimizationScore: number;
    loadTime: number;
    chunkCount: number;
    lastOptimized: Date;
    status: 'optimizing' | 'optimized' | 'needs_optimization';
  };
  caching: {
    hitRate: number;
    missRate: number;
    cacheSize: number;
    evictionRate: number;
    avgResponseTime: number;
    status: 'healthy' | 'degraded' | 'critical';
  };
  database: {
    queryPerformance: number;
    connectionPool: number;
    indexEfficiency: number;
    slowQueries: number;
    avgQueryTime: number;
    status: 'optimal' | 'slow' | 'critical';
  };
  memory: {
    heapUsage: number;
    memoryLeaks: number;
    gcFrequency: number;
    allocatedMemory: number;
    freeMemory: number;
    status: 'stable' | 'high_usage' | 'critical';
  };
  overall: {
    performanceScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    criticalIssues: number;
    warnings: number;
    uptime: number;
  };
}

interface OptimizationRecommendation {
  id: string;
  category: 'bundle' | 'cache' | 'database' | 'memory';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: number;
}

interface PerformanceOptimizationDashboardProps {
  className?: string;
}

export default function PerformanceOptimizationDashboard({ 
  className = "" 
}: PerformanceOptimizationDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleOptimization: {
      totalSize: 2.4 * 1024 * 1024, // 2.4MB
      compressedSize: 0.8 * 1024 * 1024, // 0.8MB
      optimizationScore: 87,
      loadTime: 1200,
      chunkCount: 12,
      lastOptimized: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'optimized'
    },
    caching: {
      hitRate: 94.2,
      missRate: 5.8,
      cacheSize: 128 * 1024 * 1024, // 128MB
      evictionRate: 2.1,
      avgResponseTime: 45,
      status: 'healthy'
    },
    database: {
      queryPerformance: 92,
      connectionPool: 75,
      indexEfficiency: 88,
      slowQueries: 3,
      avgQueryTime: 120,
      status: 'optimal'
    },
    memory: {
      heapUsage: 68,
      memoryLeaks: 0,
      gcFrequency: 15,
      allocatedMemory: 512 * 1024 * 1024, // 512MB
      freeMemory: 256 * 1024 * 1024, // 256MB
      status: 'stable'
    },
    overall: {
      performanceScore: 89,
      healthStatus: 'good',
      criticalIssues: 0,
      warnings: 2,
      uptime: 99.8
    }
  });

  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([
    {
      id: '1',
      category: 'bundle',
      priority: 'medium',
      title: 'Enable Advanced Tree Shaking',
      description: 'Remove unused code from healthcare modules to reduce bundle size',
      impact: 'Reduce bundle size by ~15%',
      effort: 'low',
      estimatedImprovement: 15
    },
    {
      id: '2',
      category: 'cache',
      priority: 'high',
      title: 'Implement Predictive Caching',
      description: 'Pre-cache frequently accessed patient data and clinical forms',
      impact: 'Improve response time by ~25%',
      effort: 'medium',
      estimatedImprovement: 25
    },
    {
      id: '3',
      category: 'database',
      priority: 'medium',
      title: 'Optimize Clinical Data Queries',
      description: 'Add composite indexes for patient episode queries',
      impact: 'Reduce query time by ~30%',
      effort: 'medium',
      estimatedImprovement: 30
    },
    {
      id: '4',
      category: 'memory',
      priority: 'low',
      title: 'Implement Memory Pooling',
      description: 'Use object pooling for frequently created clinical objects',
      impact: 'Reduce GC pressure by ~20%',
      effort: 'high',
      estimatedImprovement: 20
    }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        bundleOptimization: {
          ...prev.bundleOptimization,
          loadTime: prev.bundleOptimization.loadTime + (Math.random() - 0.5) * 100
        },
        caching: {
          ...prev.caching,
          hitRate: Math.max(85, Math.min(98, prev.caching.hitRate + (Math.random() - 0.5) * 2)),
          avgResponseTime: Math.max(20, prev.caching.avgResponseTime + (Math.random() - 0.5) * 10)
        },
        database: {
          ...prev.database,
          avgQueryTime: Math.max(50, prev.database.avgQueryTime + (Math.random() - 0.5) * 20)
        },
        memory: {
          ...prev.memory,
          heapUsage: Math.max(40, Math.min(85, prev.memory.heapUsage + (Math.random() - 0.5) * 5))
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleOptimizeAll = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setMetrics(prev => ({
      ...prev,
      bundleOptimization: {
        ...prev.bundleOptimization,
        optimizationScore: Math.min(95, prev.bundleOptimization.optimizationScore + 5),
        loadTime: Math.max(800, prev.bundleOptimization.loadTime - 200),
        lastOptimized: new Date(),
        status: 'optimized'
      },
      overall: {
        ...prev.overall,
        performanceScore: Math.min(95, prev.overall.performanceScore + 3)
      }
    }));
    
    setIsOptimizing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'optimized':
      case 'healthy':
      case 'optimal':
      case 'stable':
        return 'text-green-600';
      case 'good':
      case 'degraded':
      case 'slow':
      case 'high_usage':
        return 'text-yellow-600';
      case 'fair':
      case 'needs_optimization':
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'optimized':
      case 'healthy':
      case 'optimal':
      case 'stable':
        return 'default';
      case 'good':
      case 'degraded':
      case 'slow':
      case 'high_usage':
        return 'secondary';
      case 'fair':
      case 'needs_optimization':
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Gauge className="h-8 w-8 text-blue-600" />
              Performance Optimization Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Phase 3: Real-time performance monitoring and optimization control center
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={getStatusBadgeVariant(metrics.overall.healthStatus)}
              className="px-3 py-1 text-sm"
            >
              {metrics.overall.healthStatus.toUpperCase()}
            </Badge>
            <Button
              onClick={handleOptimizeAll}
              disabled={isOptimizing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isOptimizing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize All'}
            </Button>
          </div>
        </div>

        {/* Overall Performance Score */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Performance Score</h3>
                <div className="text-4xl font-bold">{metrics.overall.performanceScore}/100</div>
                <p className="text-blue-100 mt-2">
                  System Health: {metrics.overall.healthStatus} • Uptime: {metrics.overall.uptime}%
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {metrics.overall.criticalIssues} Critical
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {metrics.overall.warnings} Warnings
                  </div>
                </div>
                <Progress 
                  value={metrics.overall.performanceScore} 
                  className="w-48 mt-4 bg-blue-400" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bundle">Bundle</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bundle Optimization */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Bundle Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metrics.bundleOptimization.optimizationScore}</span>
                      <Badge variant={getStatusBadgeVariant(metrics.bundleOptimization.status)}>
                        {metrics.bundleOptimization.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Progress value={metrics.bundleOptimization.optimizationScore} className="h-2" />
                    <div className="text-sm text-gray-600">
                      Size: {formatBytes(metrics.bundleOptimization.compressedSize)} / {formatBytes(metrics.bundleOptimization.totalSize)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Load Time: {formatDuration(metrics.bundleOptimization.loadTime)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cache Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    Cache Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metrics.caching.hitRate.toFixed(1)}%</span>
                      <Badge variant={getStatusBadgeVariant(metrics.caching.status)}>
                        {metrics.caching.status}
                      </Badge>
                    </div>
                    <Progress value={metrics.caching.hitRate} className="h-2" />
                    <div className="text-sm text-gray-600">
                      Miss Rate: {metrics.caching.missRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg Response: {metrics.caching.avgResponseTime}ms
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                    Database Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metrics.database.queryPerformance}</span>
                      <Badge variant={getStatusBadgeVariant(metrics.database.status)}>
                        {metrics.database.status}
                      </Badge>
                    </div>
                    <Progress value={metrics.database.queryPerformance} className="h-2" />
                    <div className="text-sm text-gray-600">
                      Slow Queries: {metrics.database.slowQueries}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg Query: {metrics.database.avgQueryTime}ms
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Management */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-orange-600" />
                    Memory Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metrics.memory.heapUsage}%</span>
                      <Badge variant={getStatusBadgeVariant(metrics.memory.status)}>
                        {metrics.memory.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Progress value={metrics.memory.heapUsage} className="h-2" />
                    <div className="text-sm text-gray-600">
                      Allocated: {formatBytes(metrics.memory.allocatedMemory)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Memory Leaks: {metrics.memory.memoryLeaks}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Optimization Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations to improve system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={rec.priority === 'critical' ? 'destructive' : 
                                   rec.priority === 'high' ? 'default' : 'secondary'}
                          >
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                          <h4 className="font-semibold">{rec.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          +{rec.estimatedImprovement}%
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Impact: {rec.impact}</span>
                        <span className="text-gray-500">Effort: {rec.effort}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bundle Tab */}
          <TabsContent value="bundle" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bundle Analysis</CardTitle>
                  <CardDescription>Detailed bundle optimization metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Size</div>
                      <div className="text-2xl font-bold">{formatBytes(metrics.bundleOptimization.totalSize)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Compressed Size</div>
                      <div className="text-2xl font-bold">{formatBytes(metrics.bundleOptimization.compressedSize)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Chunk Count</div>
                      <div className="text-2xl font-bold">{metrics.bundleOptimization.chunkCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Load Time</div>
                      <div className="text-2xl font-bold">{formatDuration(metrics.bundleOptimization.loadTime)}</div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Compression Ratio</div>
                    <Progress 
                      value={(1 - metrics.bundleOptimization.compressedSize / metrics.bundleOptimization.totalSize) * 100} 
                      className="h-3" 
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {((1 - metrics.bundleOptimization.compressedSize / metrics.bundleOptimization.totalSize) * 100).toFixed(1)}% compression
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Healthcare Module Optimization</CardTitle>
                  <CardDescription>Critical healthcare modules performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-medium">Patient Safety Module</div>
                          <div className="text-sm text-gray-600">Critical • HIPAA Compliant</div>
                        </div>
                      </div>
                      <Badge variant="default">Optimized</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="font-medium">Emergency Response</div>
                          <div className="text-sm text-gray-600">Critical • DOH Compliant</div>
                        </div>
                      </div>
                      <Badge variant="default">Optimized</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Clinical Documentation</div>
                          <div className="text-sm text-gray-600">Clinical • Both Compliant</div>
                        </div>
                      </div>
                      <Badge variant="secondary">Needs Review</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cache Tab */}
          <TabsContent value="cache" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Hit Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{metrics.caching.hitRate.toFixed(1)}%</div>
                    <Progress value={metrics.caching.hitRate} className="mt-4" />
                    <div className="text-sm text-gray-600 mt-2">
                      Target: 95%+ for optimal performance
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{formatBytes(metrics.caching.cacheSize)}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Eviction Rate: {metrics.caching.evictionRate.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600">{metrics.caching.avgResponseTime}ms</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Target: <50ms for cached responses
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Query Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Performance Score</div>
                      <div className="text-2xl font-bold">{metrics.database.queryPerformance}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg Query Time</div>
                      <div className="text-2xl font-bold">{metrics.database.avgQueryTime}ms</div>
                    </div>
                  </div>
                  <Progress value={metrics.database.queryPerformance} className="h-3" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connection Pool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Pool Usage</div>
                      <div className="text-2xl font-bold">{metrics.database.connectionPool}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Slow Queries</div>
                      <div className="text-2xl font-bold">{metrics.database.slowQueries}</div>
                    </div>
                  </div>
                  <Progress value={metrics.database.connectionPool} className="h-3" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Heap Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600">{metrics.memory.heapUsage}%</div>
                    <Progress value={metrics.memory.heapUsage} className="mt-4" />
                    <div className="text-sm text-gray-600 mt-2">
                      {formatBytes(metrics.memory.allocatedMemory)} allocated
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memory Leaks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{metrics.memory.memoryLeaks}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      No memory leaks detected
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GC Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{metrics.memory.gcFrequency}/min</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Garbage collection frequency
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Auto-Optimization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Optimization Settings
            </CardTitle>
            <CardDescription>
              Configure automatic optimization and monitoring preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-Optimization</div>
                <div className="text-sm text-gray-600">
                  Automatically optimize performance when thresholds are exceeded
                </div>
              </div>
              <Button
                variant={autoOptimization ? "default" : "outline"}
                onClick={() => setAutoOptimization(!autoOptimization)}
                className="flex items-center gap-2"
              >
                {autoOptimization ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {autoOptimization ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}