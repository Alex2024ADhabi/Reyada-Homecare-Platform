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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Database,
  Network,
  Server,
  RefreshCw,
  Bell,
  Target,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";

// Types
interface IntegrationHealthReport {
  reportId: string;
  timestamp: Date;
  overallHealthScore: number;
  individualSystemHealth: SystemHealthMetrics[];
  performanceTrends: PerformanceTrend[];
  predictedIssues: PredictedIssue[];
  optimizationOpportunities: OptimizationOpportunity[];
  recommendedActions: RecommendedAction[];
  alertsAndNotifications: IntegrationAlert[];
}

interface SystemHealthMetrics {
  systemId: string;
  systemName: string;
  systemType: string;
  healthScore: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastHealthCheck: Date;
  status: "healthy" | "degraded" | "critical" | "offline";
}

interface PerformanceTrend {
  systemId: string;
  metricType: string;
  trend: "improving" | "stable" | "degrading";
  trendStrength: number;
  historicalData: any[];
  projectedValues: any[];
}

interface PredictedIssue {
  issueId: string;
  systemId: string;
  issueType: string;
  severity: "low" | "medium" | "high" | "critical";
  probability: number;
  timeToOccurrence: number;
  description: string;
  potentialImpact: string;
  preventiveActions: string[];
}

interface OptimizationOpportunity {
  opportunityId: string;
  systemId: string;
  type: string;
  description: string;
  expectedBenefit: string;
  implementationEffort: string;
  estimatedROI: number;
  timeline: string;
  prerequisites: string[];
}

interface RecommendedAction {
  actionId: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  title: string;
  description: string;
  expectedOutcome: string;
  requiredResources: string[];
  estimatedDuration: string;
  riskLevel: string;
}

interface IntegrationAlert {
  alertId: string;
  systemId: string;
  alertType: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  escalationLevel: number;
}

interface IntegrationAnalytics {
  totalHealthReports: number;
  averageHealthScore: number;
  totalPerformanceRecords: number;
  totalDataFlowRecords: number;
  systemsMonitored: number;
  criticalIssues: number;
  optimizationOpportunities: number;
  healthReports: IntegrationHealthReport[];
  performanceData: any[];
  dataFlowData: any[];
}

const IntegrationIntelligenceDashboard: React.FC = () => {
  const [healthReport, setHealthReport] =
    useState<IntegrationHealthReport | null>(null);
  const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize data if needed
      await fetch("/api/integration-intelligence/initialize", {
        method: "POST",
      });

      // Load health report and analytics
      const [healthResponse, analyticsResponse] = await Promise.all([
        fetch("/api/integration-intelligence/health"),
        fetch("/api/integration-intelligence/analytics"),
      ]);

      if (!healthResponse.ok || !analyticsResponse.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const healthData = await healthResponse.json();
      const analyticsData = await analyticsResponse.json();

      setHealthReport(healthData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      case "offline":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "degrading":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Loading Integration Intelligence Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Error Loading Dashboard
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {error}
            <Button
              onClick={loadDashboardData}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!healthReport || !analytics) {
    return (
      <div className="p-6 bg-white">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Integration intelligence data is not available. Please check your
            system configuration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredSystems =
    selectedSystem === "all"
      ? healthReport.individualSystemHealth
      : healthReport.individualSystemHealth.filter(
          (system) => system.systemId === selectedSystem,
        );

  const criticalAlerts = healthReport.alertsAndNotifications.filter(
    (alert) => alert.severity === "critical",
  );
  const highPriorityActions = healthReport.recommendedActions.filter(
    (action) => action.priority === "critical" || action.priority === "high",
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Integration Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced System Integration Monitoring & Optimization Platform
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            Last Updated:{" "}
            {new Date(healthReport.timestamp).toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Critical Alerts Detected
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalAlerts.length} critical alert
            {criticalAlerts.length > 1 ? "s" : ""} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Health Score
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {healthReport.overallHealthScore.toFixed(1)}%
            </div>
            <Progress
              value={healthReport.overallHealthScore}
              className="mt-2"
            />
            <p className="text-xs text-gray-600 mt-2">
              {healthReport.overallHealthScore >= 90
                ? "Excellent"
                : healthReport.overallHealthScore >= 80
                  ? "Good"
                  : healthReport.overallHealthScore >= 70
                    ? "Fair"
                    : "Poor"}{" "}
              system health
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Systems Monitored
            </CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.systemsMonitored}
            </div>
            <p className="text-xs text-gray-600 mt-2">Active integrations</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.criticalIssues}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Optimization Opportunities
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.optimizationOpportunities}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Performance improvements available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="systems" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white">
          <TabsTrigger value="systems" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>Systems</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger
            value="optimization"
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Optimization</span>
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className="flex items-center space-x-2"
          >
            <LineChart className="h-4 w-4" />
            <span>Predictions</span>
          </TabsTrigger>
        </TabsList>

        {/* Systems Tab */}
        <TabsContent value="systems" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSystems.map((system) => (
              <Card key={system.systemId} className="bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {system.systemName}
                      </CardTitle>
                      <CardDescription>
                        {system.systemType.toUpperCase()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(system.status)}>
                      {system.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Score</span>
                      <span className="font-medium">
                        {system.healthScore.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={system.healthScore} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Response Time</span>
                      </div>
                      <div className="font-medium">
                        {system.responseTime.toFixed(0)}ms
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Uptime</span>
                      </div>
                      <div className="font-medium">
                        {system.uptime.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Error Rate</span>
                      </div>
                      <div className="font-medium">
                        {system.errorRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Database className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Throughput</span>
                      </div>
                      <div className="font-medium">
                        {system.throughput.toFixed(0)}/min
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last checked:{" "}
                    {new Date(system.lastHealthCheck).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Performance Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthReport.performanceTrends
                    .slice(0, 5)
                    .map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getTrendIcon(trend.trend)}
                          <div>
                            <div className="font-medium">
                              {trend.systemId.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {trend.metricType.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              trend.trend === "improving"
                                ? "bg-green-50 text-green-700"
                                : trend.trend === "degrading"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                            }
                          >
                            {trend.trend}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            Strength: {(trend.trendStrength * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span>Data Flow Intelligence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.totalDataFlowRecords}
                    </div>
                    <div className="text-sm text-purple-700">
                      Active Data Flows
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-bold text-lg">
                        {analytics.totalPerformanceRecords}
                      </div>
                      <div className="text-gray-600">Performance Records</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-bold text-lg">
                        {analytics.averageHealthScore.toFixed(1)}%
                      </div>
                      <div className="text-gray-600">Avg Health Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-red-600" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthReport.alertsAndNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts. All systems are operating normally.</p>
                  </div>
                ) : (
                  healthReport.alertsAndNotifications.map((alert) => (
                    <div key={alert.alertId} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {alert.systemId.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Type: {alert.alertType}
                        </span>
                        <span className="text-gray-600">
                          Escalation Level: {alert.escalationLevel}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span>Optimization Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthReport.optimizationOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.opportunityId}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">
                            {opportunity.type.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {opportunity.systemId.toUpperCase()}
                          </div>
                        </div>
                        <Badge className="bg-green-50 text-green-700">
                          ROI: {opportunity.estimatedROI.toFixed(1)}x
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">
                        {opportunity.description}
                      </p>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Expected Benefit:</strong>{" "}
                        {opportunity.expectedBenefit}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Effort: {opportunity.implementationEffort}</span>
                        <span>Timeline: {opportunity.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Recommended Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthReport.recommendedActions.map((action) => (
                    <div
                      key={action.actionId}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{action.title}</div>
                        <Badge className={getSeverityColor(action.priority)}>
                          {action.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{action.description}</p>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Expected Outcome:</strong>{" "}
                        {action.expectedOutcome}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duration: {action.estimatedDuration}</span>
                        <span>Risk: {action.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5 text-purple-600" />
                  <span>Predicted Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthReport.predictedIssues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>
                        No issues predicted. Systems are expected to operate
                        normally.
                      </p>
                    </div>
                  ) : (
                    healthReport.predictedIssues.map((issue) => (
                      <div
                        key={issue.issueId}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              {issue.issueType.replace("_", " ").toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {issue.systemId.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {issue.probability.toFixed(0)}% probability
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">
                          {issue.description}
                        </p>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Potential Impact:</strong>{" "}
                          {issue.potentialImpact}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Time to Occurrence:</strong>{" "}
                          {issue.timeToOccurrence} hours
                        </div>
                        {issue.preventiveActions.length > 0 && (
                          <div className="text-sm">
                            <strong className="text-gray-600">
                              Preventive Actions:
                            </strong>
                            <ul className="list-disc list-inside mt-1 text-gray-600">
                              {issue.preventiveActions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Edge Computing Dashboard Component */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-blue-600" />
                  <span>Edge Computing Intelligence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Edge Device Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-blue-700">
                        Active Devices
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        98.5%
                      </div>
                      <div className="text-sm text-green-700">Uptime</div>
                    </div>
                  </div>

                  {/* Edge Workload Distribution */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload Distribution</span>
                      <span className="font-medium">75% Optimal</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  {/* Cache Performance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cache Hit Rate</span>
                      <span className="font-medium">89.2%</span>
                    </div>
                    <Progress value={89.2} className="h-2" />
                  </div>

                  {/* Conflict Resolution */}
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Active Conflicts
                      </span>
                    </div>
                    <div className="text-xs text-yellow-700">
                      2 resource conflicts detected and auto-resolved
                    </div>
                  </div>

                  {/* Offline Operations */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold">156</div>
                      <div className="text-gray-600">Offline Ops</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold">23MB</div>
                      <div className="text-gray-600">Cached Data</div>
                    </div>
                  </div>

                  {/* Device Capabilities */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Device Capabilities
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Processing Power</span>
                        <span>High (8.2/10)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Network Quality</span>
                        <span>Excellent (95%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Storage Available</span>
                        <span>2.1GB Free</span>
                      </div>
                    </div>
                  </div>

                  {/* Intelligent Sync Status */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Intelligent Sync Active
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      Predictive sync enabled • Next sync in 12 min
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationIntelligenceDashboard;
