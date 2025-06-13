import React, { useState, useEffect } from "react";
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
  Activity,
  Clock,
  Database,
  Wifi,
  Eye,
  Smartphone,
  Monitor,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  Target,
  Users,
  Shield,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface EnhancedPerformanceMetrics {
  // Core Web Vitals
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  firstContentfulPaint: number;

  // Performance Metrics
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;

  // Resource Metrics
  memoryUsage: number;
  networkRequests: number;
  bundleSize: number;
  cacheHitRate: number;

  // User Experience Metrics
  taskCompletionRate: number;
  errorRate: number;
  userSatisfaction: number;
  accessibilityScore: number;

  // Mobile Performance
  mobilePerformanceScore: number;
  touchResponseTime: number;
  batteryImpact: number;

  // Advanced Metrics
  renderingPerformance: number;
  javascriptExecutionTime: number;
  domContentLoaded: number;
  pageLoadComplete: number;
}

interface PerformanceOptimization {
  id: string;
  category: "performance" | "accessibility" | "mobile" | "user-experience";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  implementation: string;
  estimatedImprovement: number;
  status: "active" | "pending" | "completed";
}

interface EnhancedPerformanceDashboardProps {
  className?: string;
  realTimeMonitoring?: boolean;
  autoOptimization?: boolean;
}

export const EnhancedPerformanceDashboard: React.FC<
  EnhancedPerformanceDashboardProps
> = ({ className, realTimeMonitoring = true, autoOptimization = false }) => {
  const [metrics, setMetrics] = useState<EnhancedPerformanceMetrics>({
    largestContentfulPaint: 1200,
    firstInputDelay: 45,
    cumulativeLayoutShift: 0.08,
    firstContentfulPaint: 800,
    timeToInteractive: 1800,
    totalBlockingTime: 120,
    speedIndex: 1500,
    memoryUsage: 42,
    networkRequests: 28,
    bundleSize: 380,
    cacheHitRate: 87,
    taskCompletionRate: 94,
    errorRate: 2.1,
    userSatisfaction: 4.7,
    accessibilityScore: 95,
    mobilePerformanceScore: 92,
    touchResponseTime: 16,
    batteryImpact: 15,
    renderingPerformance: 88,
    javascriptExecutionTime: 240,
    domContentLoaded: 950,
    pageLoadComplete: 2100,
  });

  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>(
    [
      {
        id: "lazy-loading",
        category: "performance",
        title: "Image Lazy Loading",
        description:
          "Implement lazy loading for images to improve initial page load",
        impact: "high",
        implementation: 'Add loading="lazy" attribute to images',
        estimatedImprovement: 25,
        status: "completed",
      },
      {
        id: "code-splitting",
        category: "performance",
        title: "Code Splitting",
        description: "Split JavaScript bundles for better caching and loading",
        impact: "high",
        implementation: "Implement dynamic imports and route-based splitting",
        estimatedImprovement: 30,
        status: "active",
      },
      {
        id: "accessibility-enhancements",
        category: "accessibility",
        title: "Enhanced Accessibility",
        description: "Improve ARIA labels and keyboard navigation",
        impact: "medium",
        implementation:
          "Add comprehensive ARIA attributes and focus management",
        estimatedImprovement: 15,
        status: "active",
      },
      {
        id: "mobile-optimization",
        category: "mobile",
        title: "Mobile Touch Optimization",
        description: "Optimize touch targets and gestures for mobile devices",
        impact: "high",
        implementation: "Increase touch target sizes and add gesture support",
        estimatedImprovement: 20,
        status: "completed",
      },
      {
        id: "ux-improvements",
        category: "user-experience",
        title: "User Experience Enhancements",
        description: "Improve user flows and reduce cognitive load",
        impact: "medium",
        implementation: "Streamline forms and add contextual help",
        estimatedImprovement: 18,
        status: "pending",
      },
    ],
  );

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [performanceScore, setPerformanceScore] = useState(0);

  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        collectRealTimeMetrics();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  useEffect(() => {
    calculatePerformanceScore();
  }, [metrics]);

  const collectRealTimeMetrics = async () => {
    try {
      // Collect Core Web Vitals
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      const fcp =
        paint.find((entry) => entry.name === "first-contentful-paint")
          ?.startTime || 0;

      // Update metrics with real data
      setMetrics((prev) => ({
        ...prev,
        firstContentfulPaint: fcp,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.navigationStart,
        pageLoadComplete: navigation.loadEventEnd - navigation.navigationStart,
        memoryUsage: (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : prev.memoryUsage,
      }));

      // Simulate other metrics updates
      setMetrics((prev) => ({
        ...prev,
        taskCompletionRate: Math.min(
          100,
          prev.taskCompletionRate + Math.random() * 0.5,
        ),
        userSatisfaction: Math.min(
          5,
          prev.userSatisfaction + Math.random() * 0.1,
        ),
        accessibilityScore: Math.min(
          100,
          prev.accessibilityScore + Math.random() * 0.3,
        ),
      }));
    } catch (error) {
      console.error("Error collecting real-time metrics:", error);
    }
  };

  const calculatePerformanceScore = () => {
    const weights = {
      lcp: 0.25,
      fid: 0.25,
      cls: 0.25,
      fcp: 0.25,
    };

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

    const score = Math.round(
      lcpScore * weights.lcp +
        fidScore * weights.fid +
        clsScore * weights.cls +
        fcpScore * weights.fcp,
    );

    setPerformanceScore(score);
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

  const optimizePerformance = async () => {
    setLoading(true);
    try {
      // Simulate performance optimizations
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Apply optimizations
      setOptimizations((prev) =>
        prev.map((opt) =>
          opt.status === "pending" ? { ...opt, status: "active" } : opt,
        ),
      );

      // Improve metrics
      setMetrics((prev) => ({
        ...prev,
        largestContentfulPaint: Math.max(
          800,
          prev.largestContentfulPaint * 0.9,
        ),
        firstInputDelay: Math.max(20, prev.firstInputDelay * 0.8),
        cumulativeLayoutShift: Math.max(0.05, prev.cumulativeLayoutShift * 0.7),
        bundleSize: Math.max(200, prev.bundleSize * 0.85),
        cacheHitRate: Math.min(100, prev.cacheHitRate + 5),
      }));
    } catch (error) {
      console.error("Performance optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enhanced Performance Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive performance monitoring with real-time optimization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getScoreBadgeVariant(performanceScore)}>
                Score: {performanceScore}/100
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={collectRealTimeMetrics}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={optimizePerformance}
                disabled={loading}
              >
                <Brain
                  className={cn("h-4 w-4 mr-2", loading && "animate-pulse")}
                />
                {loading ? "Optimizing..." : "Optimize"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="core-vitals">Core Vitals</TabsTrigger>
              <TabsTrigger value="user-experience">User Experience</TabsTrigger>
              <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                  Overall Performance Score
                </div>
                <Progress
                  value={performanceScore}
                  className="h-3 max-w-xs mx-auto"
                />
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {(metrics.largestContentfulPaint / 1000).toFixed(1)}s
                    </div>
                    <div className="text-xs text-muted-foreground">LCP</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.firstInputDelay}ms
                    </div>
                    <div className="text-xs text-muted-foreground">FID</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.cumulativeLayoutShift.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">CLS</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.accessibilityScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Accessibility
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="core-vitals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Core Web Vitals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Largest Contentful Paint</span>
                        <span>
                          {(metrics.largestContentfulPaint / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (2500 - metrics.largestContentfulPaint) / 25,
                        )}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>First Input Delay</span>
                        <span>{metrics.firstInputDelay}ms</span>
                      </div>
                      <Progress
                        value={Math.min(100, 100 - metrics.firstInputDelay)}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cumulative Layout Shift</span>
                        <span>{metrics.cumulativeLayoutShift.toFixed(3)}</span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (0.1 - metrics.cumulativeLayoutShift) * 1000,
                        )}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Time to Interactive</span>
                        <span>
                          {(metrics.timeToInteractive / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (5000 - metrics.timeToInteractive) / 50,
                        )}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Blocking Time</span>
                        <span>{metrics.totalBlockingTime}ms</span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (300 - metrics.totalBlockingTime) / 3,
                        )}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Speed Index</span>
                        <span>{(metrics.speedIndex / 1000).toFixed(1)}s</span>
                      </div>
                      <Progress
                        value={Math.min(100, (4000 - metrics.speedIndex) / 40)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="user-experience" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      User Experience Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Task Completion Rate</span>
                        <span>{metrics.taskCompletionRate}%</span>
                      </div>
                      <Progress
                        value={metrics.taskCompletionRate}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>User Satisfaction</span>
                        <span>{metrics.userSatisfaction}/5.0</span>
                      </div>
                      <Progress
                        value={metrics.userSatisfaction * 20}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Error Rate</span>
                        <span className="text-red-600">
                          {metrics.errorRate}%
                        </span>
                      </div>
                      <Progress
                        value={100 - metrics.errorRate}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Mobile Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mobile Performance Score</span>
                        <span>{metrics.mobilePerformanceScore}%</span>
                      </div>
                      <Progress
                        value={metrics.mobilePerformanceScore}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Touch Response Time</span>
                        <span>{metrics.touchResponseTime}ms</span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (50 - metrics.touchResponseTime) * 2,
                        )}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Battery Impact</span>
                        <span className="text-green-600">
                          {metrics.batteryImpact}%
                        </span>
                      </div>
                      <Progress
                        value={100 - metrics.batteryImpact}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="optimizations" className="space-y-6">
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <Card
                    key={optimization.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{optimization.title}</h4>
                          <Badge
                            variant={
                              optimization.impact === "high"
                                ? "destructive"
                                : optimization.impact === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {optimization.impact}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {optimization.category.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {optimization.status === "completed" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {optimization.status === "active" && (
                            <Activity className="h-4 w-4 text-blue-500" />
                          )}
                          {optimization.status === "pending" && (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <Badge
                            variant={
                              optimization.status === "completed"
                                ? "default"
                                : optimization.status === "active"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {optimization.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {optimization.description}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-blue-600">
                            Implementation:
                          </span>{" "}
                          {optimization.implementation}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">
                            Expected Improvement:
                          </span>{" "}
                          +{optimization.estimatedImprovement}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPerformanceDashboard;
