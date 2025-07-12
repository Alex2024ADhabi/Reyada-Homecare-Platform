/**
 * Signature Performance Optimizer Component
 * P3-002.4: Performance Optimization & Monitoring
 *
 * Advanced performance monitoring and optimization dashboard for the signature system
 * with real-time metrics, bottleneck detection, and automated recommendations.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Download,
  Eye,
  HardDrive,
  Info,
  Lightbulb,
  Monitor,
  Network,
  Play,
  RefreshCw,
  Settings,
  Shield,
  Square,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  signaturePerformanceOptimizerService,
  PerformanceMetrics,
  PerformanceBottleneck,
  OptimizationRecommendation,
  PerformanceProfile,
  PerformanceAlert,
  PerformanceReport,
} from "@/services/signature-performance-optimizer.service";

export interface SignaturePerformanceOptimizerProps {
  className?: string;
  autoOptimize?: boolean;
  enableRealTimeMonitoring?: boolean;
  enablePredictiveAnalysis?: boolean;
  enableAutoRecommendations?: boolean;
  performanceProfile?: string;
  onOptimizationApplied?: (optimization: OptimizationRecommendation) => void;
  onBottleneckDetected?: (bottleneck: PerformanceBottleneck) => void;
  onThresholdExceeded?: (
    metric: string,
    value: number,
    threshold: number,
  ) => void;
  onPerformanceScoreChanged?: (score: number) => void;
}

const SignaturePerformanceOptimizer: React.FC<
  SignaturePerformanceOptimizerProps
> = ({
  className,
  autoOptimize = false,
  enableRealTimeMonitoring = true,
  enablePredictiveAnalysis = true,
  enableAutoRecommendations = true,
  performanceProfile = "balanced",
  onOptimizationApplied,
  onBottleneckDetected,
  onThresholdExceeded,
  onPerformanceScoreChanged,
}) => {
  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetrics[]
  >([]);
  const [currentMetrics, setCurrentMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [bottlenecks, setBottlenecks] = useState<PerformanceBottleneck[]>([]);
  const [recommendations, setRecommendations] = useState<
    OptimizationRecommendation[]
  >([]);
  const [performanceProfiles, setPerformanceProfiles] = useState<
    PerformanceProfile[]
  >([]);
  const [activeProfile, setActiveProfile] = useState<PerformanceProfile | null>(
    null,
  );
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [performanceScore, setPerformanceScore] = useState<number>(100);
  const [timeRange, setTimeRange] = useState("1h");
  const [selectedBottleneck, setSelectedBottleneck] =
    useState<PerformanceBottleneck | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<OptimizationRecommendation | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [optimizationInProgress, setOptimizationInProgress] = useState<
    Set<string>
  >(new Set());

  // Load initial data
  useEffect(() => {
    loadInitialData();
    if (enableRealTimeMonitoring) {
      startMonitoring();
    }
    return () => {
      signaturePerformanceOptimizerService.stopMonitoring();
    };
  }, [enableRealTimeMonitoring]);

  // Update performance score
  useEffect(() => {
    const updateScore = async () => {
      const score =
        await signaturePerformanceOptimizerService.calculatePerformanceScore();
      setPerformanceScore(score);
      onPerformanceScoreChanged?.(score);
    };
    updateScore();
  }, [currentMetrics, onPerformanceScoreChanged]);

  const loadInitialData = async () => {
    try {
      const profiles =
        await signaturePerformanceOptimizerService.getPerformanceProfiles();
      setPerformanceProfiles(profiles);

      const active =
        await signaturePerformanceOptimizerService.getActiveProfile();
      setActiveProfile(active);

      if (performanceProfile && !active) {
        await signaturePerformanceOptimizerService.activateProfile(
          performanceProfile,
        );
        const newActive =
          await signaturePerformanceOptimizerService.getActiveProfile();
        setActiveProfile(newActive);
      }

      await loadPerformanceData();
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const metrics =
        await signaturePerformanceOptimizerService.getPerformanceMetrics(
          timeRange,
        );
      setPerformanceMetrics(metrics);
      if (metrics.length > 0) {
        setCurrentMetrics(metrics[metrics.length - 1]);
      }

      const bottlenecksList =
        await signaturePerformanceOptimizerService.getAllBottlenecks();
      setBottlenecks(bottlenecksList);

      const recommendationsList =
        await signaturePerformanceOptimizerService.getAllRecommendations();
      setRecommendations(recommendationsList);

      const alertsList =
        await signaturePerformanceOptimizerService.getAlerts(false);
      setAlerts(alertsList);

      if (enablePredictiveAnalysis) {
        const insights =
          await signaturePerformanceOptimizerService.getPredictiveInsights();
        setPredictiveInsights(insights);
      }
    } catch (error) {
      console.error("Failed to load performance data:", error);
    }
  };

  const startMonitoring = async () => {
    try {
      setIsMonitoring(true);
      await signaturePerformanceOptimizerService.startMonitoring(1000);

      // Set up periodic data refresh
      const interval = setInterval(async () => {
        await loadPerformanceData();
      }, 5000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      setIsMonitoring(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      await signaturePerformanceOptimizerService.stopMonitoring();
      setIsMonitoring(false);
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
    }
  };

  const handleOptimizationApply = async (recommendationId: string) => {
    try {
      setOptimizationInProgress((prev) => new Set(prev).add(recommendationId));
      await signaturePerformanceOptimizerService.applyOptimization(
        recommendationId,
      );
      const recommendation = recommendations.find(
        (r) => r.id === recommendationId,
      );
      if (recommendation) {
        onOptimizationApplied?.(recommendation);
      }
      await loadPerformanceData();
    } catch (error) {
      console.error("Failed to apply optimization:", error);
    } finally {
      setOptimizationInProgress((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recommendationId);
        return newSet;
      });
    }
  };

  const handleProfileChange = async (profileId: string) => {
    try {
      await signaturePerformanceOptimizerService.activateProfile(profileId);
      const newActive =
        await signaturePerformanceOptimizerService.getActiveProfile();
      setActiveProfile(newActive);
    } catch (error) {
      console.error("Failed to change profile:", error);
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      await signaturePerformanceOptimizerService.acknowledgeAlert(alertId);
      await loadPerformanceData();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const generateReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      const report =
        await signaturePerformanceOptimizerService.generatePerformanceReport({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });
      // In a real implementation, this would download or display the report
      console.log("Performance report generated:", report);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (!currentMetrics) {
      return {
        responseTime: 0,
        memoryUsage: 0,
        frameRate: 0,
        errorRate: 0,
        networkLatency: 0,
        cacheHitRate: 0,
      };
    }

    return {
      responseTime: Math.round(currentMetrics.responseTime),
      memoryUsage: Math.round(currentMetrics.memoryUsage),
      frameRate: Math.round(currentMetrics.frameRate),
      errorRate: Number(currentMetrics.errorRate.toFixed(2)),
      networkLatency: Math.round(currentMetrics.networkLatency),
      cacheHitRate: Math.round(currentMetrics.cacheHitRate),
    };
  }, [currentMetrics]);

  const getMetricStatus = (
    value: number,
    thresholds: { warning: number; critical: number },
    direction: "higher" | "lower" = "lower",
  ) => {
    if (direction === "lower") {
      if (value >= thresholds.critical) return "critical";
      if (value >= thresholds.warning) return "warning";
      return "good";
    } else {
      if (value <= thresholds.critical) return "critical";
      if (value <= thresholds.warning) return "warning";
      return "good";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("space-y-6 p-6 bg-gray-50 min-h-screen", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Signature Performance Optimizer
          </h1>
          <p className="text-gray-600 mt-1">
            P3-002.4: Real-time monitoring and optimization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            className={cn(
              "text-sm",
              isMonitoring
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800",
            )}
          >
            {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
          </Badge>
          <Button
            variant="outline"
            onClick={generateReport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={cn(
              "flex items-center space-x-2",
              isMonitoring
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700",
            )}
          >
            {isMonitoring ? (
              <>
                <Square className="h-4 w-4" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Start Monitoring</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Overall Performance Score
              </h3>
              <p className="text-sm text-gray-600">
                Based on current system metrics and optimization status
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {performanceScore}
              </div>
              <div className="text-sm text-gray-500">/ 100</div>
              <Progress value={performanceScore} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.responseTime}ms
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs mt-2",
                getStatusColor(
                  getMetricStatus(dashboardMetrics.responseTime, {
                    warning: 1000,
                    critical: 2000,
                  }),
                ),
              )}
            >
              {getMetricStatus(dashboardMetrics.responseTime, {
                warning: 1000,
                critical: 2000,
              }).toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Memory Usage
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.memoryUsage}MB
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <HardDrive className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs mt-2",
                getStatusColor(
                  getMetricStatus(dashboardMetrics.memoryUsage, {
                    warning: 100,
                    critical: 200,
                  }),
                ),
              )}
            >
              {getMetricStatus(dashboardMetrics.memoryUsage, {
                warning: 100,
                critical: 200,
              }).toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Frame Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.frameRate} FPS
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Monitor className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs mt-2",
                getStatusColor(
                  getMetricStatus(
                    dashboardMetrics.frameRate,
                    { warning: 30, critical: 20 },
                    "higher",
                  ),
                ),
              )}
            >
              {getMetricStatus(
                dashboardMetrics.frameRate,
                { warning: 30, critical: 20 },
                "higher",
              ).toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.errorRate}%
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs mt-2",
                getStatusColor(
                  getMetricStatus(dashboardMetrics.errorRate, {
                    warning: 2,
                    critical: 5,
                  }),
                ),
              )}
            >
              {getMetricStatus(dashboardMetrics.errorRate, {
                warning: 2,
                critical: 5,
              }).toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Network</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.networkLatency}ms
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Network className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs mt-2",
                getStatusColor(
                  getMetricStatus(dashboardMetrics.networkLatency, {
                    warning: 100,
                    critical: 200,
                  }),
                ),
              )}
            >
              {getMetricStatus(dashboardMetrics.networkLatency, {
                warning: 100,
                critical: 200,
              }).toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Hit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardMetrics.cacheHitRate}%
                </p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-full">
                <Database className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <Badge
              className={cn(
                "text-xs mt-2",
                getStatusColor(
                  getMetricStatus(
                    dashboardMetrics.cacheHitRate,
                    { warning: 70, critical: 50 },
                    "higher",
                  ),
                ),
              )}
            >
              {getMetricStatus(
                dashboardMetrics.cacheHitRate,
                { warning: 70, critical: 50 },
                "higher",
              ).toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Active Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <Alert
                  key={alert.id}
                  className="border-l-4 border-l-orange-500"
                >
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-gray-600">
                        {alert.message}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAlertAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="dashboard"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger
            value="bottlenecks"
            className="flex items-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Bottlenecks</span>
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="flex items-center space-x-2"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Profiles</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Time</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">-12%</span>
                    </div>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">+8%</span>
                    </div>
                  </div>
                  <Progress value={60} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Frame Rate</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">+15%</span>
                    </div>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <span className="text-sm font-bold">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <span className="text-sm font-bold">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Network</span>
                    </div>
                    <span className="text-sm font-bold">Good</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bottlenecks Tab */}
        <TabsContent value="bottlenecks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bottlenecks.map((bottleneck) => (
              <Card key={bottleneck.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getSeverityIcon(bottleneck.severity)}
                      {bottleneck.component}
                    </CardTitle>
                    <Badge
                      className={cn(
                        "text-xs",
                        getPriorityColor(bottleneck.severity),
                      )}
                    >
                      {bottleneck.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {bottleneck.metric}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bottleneck.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Impact: {bottleneck.impact}%
                    </span>
                    <span className="text-gray-500">
                      Affected: {bottleneck.affectedUsers} users
                    </span>
                  </div>
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedBottleneck(bottleneck)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Bottleneck Details</DialogTitle>
                        </DialogHeader>
                        {selectedBottleneck && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Description</h4>
                              <p className="text-sm text-gray-600">
                                {selectedBottleneck.description}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Recommendation</h4>
                              <p className="text-sm text-gray-600">
                                {selectedBottleneck.recommendation}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Business Impact</h4>
                              <p className="text-sm text-gray-600">
                                {selectedBottleneck.businessImpact}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium">
                                  Expected Improvement
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {selectedBottleneck.estimatedImprovement}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  Implementation Effort
                                </h4>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    getPriorityColor(
                                      selectedBottleneck.implementationEffort,
                                    ),
                                  )}
                                >
                                  {selectedBottleneck.implementationEffort.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {recommendation.title}
                    </CardTitle>
                    <Badge
                      className={cn(
                        "text-xs",
                        getPriorityColor(recommendation.priority),
                      )}
                    >
                      {recommendation.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {recommendation.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 capitalize">
                        {recommendation.category}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      <span className="ml-2 capitalize">
                        {recommendation.implementation.difficulty}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">
                        {recommendation.implementation.estimatedTime}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={cn(
                          "ml-2 text-xs",
                          recommendation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : recommendation.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800",
                        )}
                      >
                        {recommendation.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      Expected Benefits:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • {recommendation.expectedBenefit.performanceGain}
                      </li>
                      <li>• {recommendation.expectedBenefit.userExperience}</li>
                      <li>
                        • {recommendation.expectedBenefit.resourceSavings}
                      </li>
                    </ul>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            setSelectedRecommendation(recommendation)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Optimization Recommendation</DialogTitle>
                        </DialogHeader>
                        {selectedRecommendation && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">
                                Implementation Steps
                              </h4>
                              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 mt-2">
                                {selectedRecommendation.implementation.steps.map(
                                  (step, index) => (
                                    <li key={index}>{step}</li>
                                  ),
                                )}
                              </ol>
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Required Resources
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedRecommendation.implementation.resources.map(
                                  (resource, index) => (
                                    <Badge key={index} variant="outline">
                                      {resource}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                            {selectedRecommendation.risks.length > 0 && (
                              <div>
                                <h4 className="font-medium">Risks</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                                  {selectedRecommendation.risks.map(
                                    (risk, index) => (
                                      <li key={index}>{risk}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    {recommendation.status === "pending" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleOptimizationApply(recommendation.id)
                        }
                        disabled={optimizationInProgress.has(recommendation.id)}
                      >
                        {optimizationInProgress.has(recommendation.id) ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Apply
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {performanceProfiles.map((profile) => (
              <Card
                key={profile.id}
                className={cn(
                  "border cursor-pointer transition-all",
                  profile.isActive
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-300",
                )}
                onClick={() => handleProfileChange(profile.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    {profile.isActive && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{profile.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Device:</span>
                      <span className="ml-2 capitalize">
                        {profile.deviceType}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Network:</span>
                      <span className="ml-2 capitalize">
                        {profile.networkCondition}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Optimizations:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Compression</span>
                        <Badge
                          variant={
                            profile.optimizations.enableCompression
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {profile.optimizations.enableCompression
                            ? "ON"
                            : "OFF"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Caching</span>
                        <Badge
                          variant={
                            profile.optimizations.enableCaching
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {profile.optimizations.enableCaching ? "ON" : "OFF"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max Frame Rate</span>
                        <span className="text-xs">
                          {profile.optimizations.maxFrameRate} FPS
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {predictiveInsights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {predictiveInsights.map((insight) => (
                <Card key={insight.id} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <span className="ml-2">
                          {insight.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Impact:</span>
                        <Badge
                          className={cn(
                            "ml-2 text-xs",
                            getPriorityColor(insight.impact),
                          )}
                        >
                          {insight.impact.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Prediction:</h4>
                      <p className="text-sm text-gray-600">
                        {insight.prediction}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Recommendation:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {insight.recommendation}
                      </p>
                    </div>
                    <Progress value={insight.confidence} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Predictive Insights Available
                </h3>
                <p className="text-gray-600">
                  Predictive insights will appear here once sufficient
                  performance data has been collected.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignaturePerformanceOptimizer;
