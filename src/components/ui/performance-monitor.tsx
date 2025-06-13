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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { useBundleOptimization } from "@/services/bundle-optimization.service";
import { useMemoryLeakDetection } from "@/hooks/useMemoryLeakPrevention";

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = "",
  showDetails = true,
}) => {
  const {
    getPerformanceMetrics,
    generatePerformanceReport,
    analyzeBundleSize,
  } = useBundleOptimization();
  const { checkLeaks, getMemoryUsage } =
    useMemoryLeakDetection("PerformanceMonitor");

  const [metrics, setMetrics] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);
  const [memoryLeaks, setMemoryLeaks] = useState<any[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, reportData, bundleData, leaksData, memoryData] =
        await Promise.all([
          getPerformanceMetrics(),
          generatePerformanceReport(),
          analyzeBundleSize(),
          checkLeaks(),
          getMemoryUsage(),
        ]);

      setMetrics(metricsData);
      setReport(reportData);
      setBundleAnalysis(bundleData);
      setMemoryLeaks(leaksData);
      setMemoryUsage(memoryData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-green-600 bg-green-100";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Activity className="h-4 w-4 text-green-500" />
        <span className="text-sm text-muted-foreground">
          Performance: {report?.scores?.lcp?.rating || "monitoring"}
        </span>
        {memoryLeaks.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {memoryLeaks.length} leaks
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Real-time application performance and optimization insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
              <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
              <TabsTrigger value="memory">Memory Usage</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              {report && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        First Contentful Paint
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatTime(report.scores.fcp.score)}
                      </div>
                      <Badge
                        className={`text-xs ${getScoreColor(report.scores.fcp.rating)}`}
                      >
                        {report.scores.fcp.rating}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Largest Contentful Paint
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatTime(report.scores.lcp.score)}
                      </div>
                      <Badge
                        className={`text-xs ${getScoreColor(report.scores.lcp.rating)}`}
                      >
                        {report.scores.lcp.rating}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        First Input Delay
                      </CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatTime(report.scores.fid.score)}
                      </div>
                      <Badge
                        className={`text-xs ${getScoreColor(report.scores.fid.rating)}`}
                      >
                        {report.scores.fid.rating}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Cumulative Layout Shift
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {report.scores.cls.score.toFixed(3)}
                      </div>
                      <Badge
                        className={`text-xs ${getScoreColor(report.scores.cls.rating)}`}
                      >
                        {report.scores.cls.rating}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bundle" className="space-y-4">
              {bundleAnalysis && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Total Bundle Size
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatBytes(bundleAnalysis.totalSize)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gzipped: {formatBytes(bundleAnalysis.gzippedSize)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Chunks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {bundleAnalysis.chunks.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {
                            bundleAnalysis.chunks.filter((c: any) => c.isAsync)
                              .length
                          }{" "}
                          async
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Dependencies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {bundleAnalysis.dependencies.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {
                            bundleAnalysis.dependencies.filter(
                              (d: any) => d.usage === "partial",
                            ).length
                          }{" "}
                          partially used
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Chunk Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {bundleAnalysis.chunks.map((chunk: any) => (
                          <div
                            key={chunk.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{chunk.name}</span>
                              {chunk.isAsync && (
                                <Badge variant="secondary" className="text-xs">
                                  async
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatBytes(chunk.size)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memoryUsage && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Used Heap:</span>
                        <span>{formatBytes(memoryUsage.usedJSHeapSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Heap:</span>
                        <span>{formatBytes(memoryUsage.totalJSHeapSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heap Limit:</span>
                        <span>{formatBytes(memoryUsage.jsHeapSizeLimit)}</span>
                      </div>
                      <Progress
                        value={
                          (memoryUsage.usedJSHeapSize /
                            memoryUsage.totalJSHeapSize) *
                          100
                        }
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resource Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Components:</span>
                      <span>{memoryUsage?.trackedComponents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Event Listeners:</span>
                      <span>{memoryUsage?.activeEventListeners || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timers:</span>
                      <span>{memoryUsage?.activeTimers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subscriptions:</span>
                      <span>{memoryUsage?.activeSubscriptions || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {memoryLeaks.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>
                      {memoryLeaks.length} memory leak(s) detected:
                    </strong>
                    <ul className="mt-2 space-y-1">
                      {memoryLeaks.slice(0, 3).map((leak, index) => (
                        <li key={index} className="text-sm">
                          • {leak.componentName}: {leak.description}
                        </li>
                      ))}
                    </ul>
                    {memoryLeaks.length > 3 && (
                      <p className="text-sm mt-1">
                        ...and {memoryLeaks.length - 3} more
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {bundleAnalysis?.recommendations && (
                <div className="space-y-3">
                  {bundleAnalysis.recommendations
                    .slice(0, 10)
                    .map((rec: any, index: number) => (
                      <Alert
                        key={index}
                        className={
                          rec.priority === "critical" ? "border-red-200" : ""
                        }
                      >
                        <div className="flex items-start gap-2">
                          {rec.priority === "critical" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  rec.priority === "critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {rec.type}
                              </Badge>
                            </div>
                            <AlertDescription>
                              <strong>{rec.description}</strong>
                              <p className="text-sm mt-1">
                                {rec.implementation}
                              </p>
                              {rec.estimatedSavings > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Potential savings:{" "}
                                  {formatBytes(rec.estimatedSavings)}
                                </p>
                              )}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                </div>
              )}

              {report?.recommendations && report.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Performance Recommendations:</h4>
                  <ul className="space-y-1">
                    {report.recommendations.map(
                      (rec: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                          {rec}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
