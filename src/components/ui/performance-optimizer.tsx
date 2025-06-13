import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Database,
  Wifi,
  Smartphone,
  Monitor,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  memoryUsage: number;
  networkRequests: number;
  bundleSize: number;
  cacheHitRate: number;
  renderTime: number;
}

interface OptimizationSuggestion {
  id: string;
  category: "performance" | "memory" | "network" | "rendering";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  implementation: string;
  estimatedImprovement: number;
}

interface PerformanceOptimizerProps {
  className?: string;
  autoOptimize?: boolean;
  realTimeMonitoring?: boolean;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  className,
  autoOptimize = false,
  realTimeMonitoring = true,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>(
    [],
  );

  // Real-time performance monitoring
  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        collectPerformanceMetrics();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  // Initial performance analysis
  useEffect(() => {
    collectPerformanceMetrics();
  }, []);

  const collectPerformanceMetrics = useCallback(async () => {
    try {
      const performance = window.performance;
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      // Web Vitals calculation
      const fcp =
        paint.find((entry) => entry.name === "first-contentful-paint")
          ?.startTime || 0;
      const lcp = await getLargestContentfulPaint();
      const cls = await getCumulativeLayoutShift();
      const fid = await getFirstInputDelay();

      // Memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo
        ? memoryInfo.usedJSHeapSize / 1024 / 1024
        : 0;

      // Network metrics
      const resources = performance.getEntriesByType("resource");
      const networkRequests = resources.length;

      // Bundle size estimation
      const bundleSize =
        resources
          .filter(
            (resource) =>
              resource.name.includes(".js") || resource.name.includes(".css"),
          )
          .reduce(
            (total, resource) => total + (resource.transferSize || 0),
            0,
          ) / 1024;

      const newMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: cls,
        firstInputDelay: fid,
        timeToInteractive:
          navigation.domInteractive - navigation.navigationStart,
        totalBlockingTime: calculateTotalBlockingTime(),
        memoryUsage,
        networkRequests,
        bundleSize,
        cacheHitRate: calculateCacheHitRate(resources),
        renderTime: performance.now(),
      };

      setMetrics(newMetrics);
      setHistoricalData((prev) => [...prev.slice(-19), newMetrics]);

      // Calculate performance score
      const score = calculatePerformanceScore(newMetrics);
      setPerformanceScore(score);

      // Generate optimization suggestions
      const newSuggestions = generateOptimizationSuggestions(newMetrics);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Performance metrics collection failed:", error);
    }
  }, []);

  const getLargestContentfulPaint = (): Promise<number> => {
    return new Promise((resolve) => {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry?.startTime || 0);
          observer.disconnect();
        });
        observer.observe({ entryTypes: ["largest-contentful-paint"] });

        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 1000);
      } else {
        resolve(0);
      }
    });
  };

  const getCumulativeLayoutShift = (): Promise<number> => {
    return new Promise((resolve) => {
      if ("PerformanceObserver" in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ entryTypes: ["layout-shift"] });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      } else {
        resolve(0);
      }
    });
  };

  const getFirstInputDelay = (): Promise<number> => {
    return new Promise((resolve) => {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const firstEntry = list.getEntries()[0];
          resolve(
            (firstEntry as any)?.processingStart - firstEntry?.startTime || 0,
          );
          observer.disconnect();
        });
        observer.observe({ entryTypes: ["first-input"] });

        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      } else {
        resolve(0);
      }
    });
  };

  const calculateTotalBlockingTime = (): number => {
    const longTasks = performance.getEntriesByType("longtask");
    return longTasks.reduce((total, task) => {
      const blockingTime = Math.max(0, task.duration - 50);
      return total + blockingTime;
    }, 0);
  };

  const calculateCacheHitRate = (resources: PerformanceEntry[]): number => {
    const cachedResources = resources.filter((resource) => {
      const resourceTiming = resource as PerformanceResourceTiming;
      return (
        resourceTiming.transferSize === 0 && resourceTiming.decodedBodySize > 0
      );
    });
    return resources.length > 0
      ? (cachedResources.length / resources.length) * 100
      : 0;
  };

  const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
    // Weighted scoring based on Core Web Vitals and other metrics
    const lcpScore =
      metrics.largestContentfulPaint < 2500
        ? 100
        : Math.max(0, 100 - (metrics.largestContentfulPaint - 2500) / 25);
    const fidScore =
      metrics.firstInputDelay < 100
        ? 100
        : Math.max(0, 100 - (metrics.firstInputDelay - 100) / 5);
    const clsScore =
      metrics.cumulativeLayoutShift < 0.1
        ? 100
        : Math.max(0, 100 - (metrics.cumulativeLayoutShift - 0.1) * 1000);
    const fcpScore =
      metrics.firstContentfulPaint < 1800
        ? 100
        : Math.max(0, 100 - (metrics.firstContentfulPaint - 1800) / 20);

    return Math.round(
      lcpScore * 0.25 + fidScore * 0.25 + clsScore * 0.25 + fcpScore * 0.25,
    );
  };

  const generateOptimizationSuggestions = (
    metrics: PerformanceMetrics,
  ): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    // LCP optimization
    if (metrics.largestContentfulPaint > 2500) {
      suggestions.push({
        id: "optimize-lcp",
        category: "performance",
        priority: "high",
        title: "Optimize Largest Contentful Paint",
        description: "LCP is slower than recommended 2.5s threshold",
        impact: "Improves perceived loading performance",
        implementation:
          "Optimize images, preload critical resources, improve server response times",
        estimatedImprovement: 25,
      });
    }

    // Bundle size optimization
    if (metrics.bundleSize > 500) {
      suggestions.push({
        id: "reduce-bundle-size",
        category: "network",
        priority: "high",
        title: "Reduce Bundle Size",
        description: `Bundle size is ${Math.round(metrics.bundleSize)}KB, consider code splitting`,
        impact: "Faster initial page load",
        implementation:
          "Implement lazy loading, tree shaking, and code splitting",
        estimatedImprovement: 20,
      });
    }

    // Memory optimization
    if (metrics.memoryUsage > 50) {
      suggestions.push({
        id: "optimize-memory",
        category: "memory",
        priority: "medium",
        title: "Optimize Memory Usage",
        description: `Memory usage is ${Math.round(metrics.memoryUsage)}MB`,
        impact: "Better performance on low-end devices",
        implementation:
          "Implement proper cleanup, avoid memory leaks, optimize data structures",
        estimatedImprovement: 15,
      });
    }

    // Cache optimization
    if (metrics.cacheHitRate < 80) {
      suggestions.push({
        id: "improve-caching",
        category: "network",
        priority: "medium",
        title: "Improve Caching Strategy",
        description: `Cache hit rate is ${Math.round(metrics.cacheHitRate)}%`,
        impact: "Faster subsequent page loads",
        implementation:
          "Implement proper cache headers, service worker caching, CDN optimization",
        estimatedImprovement: 30,
      });
    }

    // CLS optimization
    if (metrics.cumulativeLayoutShift > 0.1) {
      suggestions.push({
        id: "reduce-cls",
        category: "rendering",
        priority: "high",
        title: "Reduce Layout Shifts",
        description: "CLS exceeds recommended 0.1 threshold",
        impact: "Better visual stability",
        implementation:
          "Set dimensions for images/videos, avoid inserting content above existing content",
        estimatedImprovement: 20,
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const optimizePerformance = async () => {
    setOptimizing(true);
    try {
      // Simulate performance optimizations
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Apply optimizations
      await applyOptimizations();

      // Re-collect metrics
      await collectPerformanceMetrics();
    } catch (error) {
      console.error("Performance optimization failed:", error);
    } finally {
      setOptimizing(false);
    }
  };

  const applyOptimizations = async () => {
    // Image lazy loading
    const images = document.querySelectorAll("img:not([loading])");
    images.forEach((img) => {
      img.setAttribute("loading", "lazy");
    });

    // Preload critical resources
    const criticalResources = document.querySelectorAll(
      'link[rel="stylesheet"], script[src]',
    );
    criticalResources.forEach((resource, index) => {
      if (index < 3) {
        // Preload first 3 critical resources
        const link = document.createElement("link");
        link.rel = "preload";
        link.href =
          resource.getAttribute("href") || resource.getAttribute("src") || "";
        link.as = resource.tagName === "LINK" ? "style" : "script";
        document.head.appendChild(link);
      }
    });

    // Enable compression hints
    const meta = document.createElement("meta");
    meta.httpEquiv = "Accept-Encoding";
    meta.content = "gzip, deflate, br";
    document.head.appendChild(meta);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const filteredSuggestions = useMemo(() => {
    if (selectedCategory === "all") return suggestions;
    return suggestions.filter(
      (suggestion) => suggestion.category === selectedCategory,
    );
  }, [suggestions, selectedCategory]);

  const categories = [
    { id: "all", label: "All Suggestions", icon: Activity },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "memory", label: "Memory", icon: Database },
    { id: "network", label: "Network", icon: Wifi },
    { id: "rendering", label: "Rendering", icon: Monitor },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimizer
              </CardTitle>
              <CardDescription>
                Real-time performance monitoring and optimization
                recommendations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {metrics && (
                <Badge variant={getScoreBadgeVariant(performanceScore)}>
                  Score: {performanceScore}/100
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={collectPerformanceMetrics}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                />
                Analyze
              </Button>
              <Button
                size="sm"
                onClick={optimizePerformance}
                disabled={optimizing || !metrics}
              >
                <Zap
                  className={cn("h-4 w-4 mr-2", optimizing && "animate-pulse")}
                />
                {optimizing ? "Optimizing..." : "Optimize"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <Tabs defaultValue="metrics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-6">
                {/* Performance Score */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div
                    className={cn(
                      "text-4xl font-bold mb-2",
                      getScoreColor(performanceScore),
                    )}
                  >
                    {performanceScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Performance Score
                  </div>
                  <Progress
                    value={performanceScore}
                    className="h-3 max-w-xs mx-auto"
                  />
                </div>

                {/* Core Web Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">LCP</span>
                        {metrics.largestContentfulPaint < 2500 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        {(metrics.largestContentfulPaint / 1000).toFixed(2)}s
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Largest Contentful Paint
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">FID</span>
                        {metrics.firstInputDelay < 100 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        {metrics.firstInputDelay.toFixed(0)}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        First Input Delay
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">CLS</span>
                        {metrics.cumulativeLayoutShift < 0.1 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        {metrics.cumulativeLayoutShift.toFixed(3)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cumulative Layout Shift
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(metrics.firstContentfulPaint / 1000).toFixed(2)}s
                    </div>
                    <div className="text-sm text-muted-foreground">FCP</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(metrics.bundleSize)}KB
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bundle Size
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(metrics.cacheHitRate)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cache Hit Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(metrics.memoryUsage)}MB
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Memory Usage
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-6">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const count =
                      category.id === "all"
                        ? suggestions.length
                        : suggestions.filter((s) => s.category === category.id)
                            .length;

                    return (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                        {count > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>

                {/* Suggestions List */}
                <div className="space-y-4">
                  {filteredSuggestions.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-muted-foreground">
                        No optimization suggestions for this category!
                      </p>
                    </div>
                  ) : (
                    filteredSuggestions.map((suggestion) => (
                      <Card
                        key={suggestion.id}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {suggestion.title}
                              </h4>
                              <Badge
                                variant={
                                  suggestion.priority === "high"
                                    ? "destructive"
                                    : suggestion.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                +{suggestion.estimatedImprovement}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {suggestion.description}
                          </p>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-blue-600">
                                Impact:
                              </span>{" "}
                              {suggestion.impact}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-purple-600">
                                Implementation:
                              </span>{" "}
                              {suggestion.implementation}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-6">
                {/* Real-time Status */}
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    Real-time monitoring is{" "}
                    {realTimeMonitoring ? "active" : "inactive"}. Performance
                    metrics are collected every 5 seconds.
                  </AlertDescription>
                </Alert>

                {/* Historical Performance */}
                {historicalData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Performance Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Average Load Time
                          </span>
                          <span className="text-sm">
                            {(
                              historicalData.reduce(
                                (sum, data) => sum + data.loadTime,
                                0,
                              ) /
                              historicalData.length /
                              1000
                            ).toFixed(2)}
                            s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Memory Trend
                          </span>
                          <div className="flex items-center gap-1">
                            {historicalData.length > 1 &&
                            historicalData[historicalData.length - 1]
                              .memoryUsage >
                              historicalData[historicalData.length - 2]
                                .memoryUsage ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm">
                              {Math.round(metrics.memoryUsage)}MB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Network Requests
                          </span>
                          <span className="text-sm">
                            {metrics.networkRequests}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Click "Analyze" to start performance monitoring
              </p>
              <Button onClick={collectPerformanceMetrics} disabled={loading}>
                <Zap className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimizer;
