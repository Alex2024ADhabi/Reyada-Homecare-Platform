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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Bell,
  BarChart3,
  Gauge,
  Users,
  Shield,
  Heart,
  Stethoscope,
  Building,
  Target,
} from "lucide-react";

interface QualityMetric {
  id: string;
  name: string;
  description: string;
  category:
    | "clinical"
    | "operational"
    | "safety"
    | "patient_experience"
    | "compliance";
  current: {
    value: number;
    timestamp: Date;
    trend: "improving" | "stable" | "declining";
    confidence: number;
  };
  target: {
    value: number;
    operator: "greater_than" | "less_than" | "equals" | "between";
  };
  thresholds: {
    critical: { value: number };
    warning: { value: number };
    target: { value: number };
  };
  unit: string;
  priority: "low" | "medium" | "high" | "critical";
}

interface QualityAlert {
  id: string;
  timestamp: Date;
  metricName: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  status: "active" | "acknowledged" | "resolved";
}

const RealTimeQualityMetricsMonitoringDashboard: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const refreshData = async () => {
    setIsRefreshing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockMetrics: QualityMetric[] = [
      {
        id: "patient_satisfaction_score",
        name: "Patient Satisfaction Score",
        description: "Overall patient satisfaction rating",
        category: "patient_experience",
        current: {
          value: 88.5,
          timestamp: new Date(),
          trend: "improving",
          confidence: 95,
        },
        target: {
          value: 90,
          operator: "greater_than",
        },
        thresholds: {
          critical: { value: 70 },
          warning: { value: 80 },
          target: { value: 90 },
        },
        unit: "percentage",
        priority: "high",
      },
      {
        id: "medication_error_rate",
        name: "Medication Error Rate",
        description: "Rate of medication errors per 1000 administrations",
        category: "safety",
        current: {
          value: 0.8,
          timestamp: new Date(),
          trend: "stable",
          confidence: 92,
        },
        target: {
          value: 1,
          operator: "less_than",
        },
        thresholds: {
          critical: { value: 5 },
          warning: { value: 2 },
          target: { value: 1 },
        },
        unit: "per_1000_administrations",
        priority: "critical",
      },
      {
        id: "healthcare_associated_infection_rate",
        name: "Healthcare-Associated Infection Rate",
        description: "Rate of HAIs per 1000 patient days",
        category: "safety",
        current: {
          value: 1.2,
          timestamp: new Date(),
          trend: "declining",
          confidence: 88,
        },
        target: {
          value: 2,
          operator: "less_than",
        },
        thresholds: {
          critical: { value: 5 },
          warning: { value: 3 },
          target: { value: 2 },
        },
        unit: "per_1000_patient_days",
        priority: "critical",
      },
      {
        id: "patient_fall_rate",
        name: "Patient Fall Rate",
        description: "Rate of patient falls per 1000 patient days",
        category: "safety",
        current: {
          value: 2.1,
          timestamp: new Date(),
          trend: "improving",
          confidence: 90,
        },
        target: {
          value: 2.5,
          operator: "less_than",
        },
        thresholds: {
          critical: { value: 5 },
          warning: { value: 3.5 },
          target: { value: 2.5 },
        },
        unit: "per_1000_patient_days",
        priority: "high",
      },
      {
        id: "clinical_guideline_adherence",
        name: "Clinical Guideline Adherence",
        description: "Percentage of clinical decisions following guidelines",
        category: "clinical",
        current: {
          value: 82.3,
          timestamp: new Date(),
          trend: "improving",
          confidence: 87,
        },
        target: {
          value: 85,
          operator: "greater_than",
        },
        thresholds: {
          critical: { value: 70 },
          warning: { value: 80 },
          target: { value: 85 },
        },
        unit: "percentage",
        priority: "high",
      },
      {
        id: "operational_efficiency_score",
        name: "Operational Efficiency Score",
        description: "Overall operational efficiency rating",
        category: "operational",
        current: {
          value: 76.8,
          timestamp: new Date(),
          trend: "stable",
          confidence: 85,
        },
        target: {
          value: 80,
          operator: "greater_than",
        },
        thresholds: {
          critical: { value: 60 },
          warning: { value: 70 },
          target: { value: 80 },
        },
        unit: "percentage",
        priority: "medium",
      },
    ];

    const mockAlerts: QualityAlert[] = [
      {
        id: "alert_001",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        metricName: "Clinical Guideline Adherence",
        severity: "medium",
        message:
          "Clinical guideline adherence below target threshold (82.3% vs 85% target)",
        status: "active",
      },
      {
        id: "alert_002",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        metricName: "Operational Efficiency Score",
        severity: "medium",
        message:
          "Operational efficiency below target threshold (76.8% vs 80% target)",
        status: "acknowledged",
      },
    ];

    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600";
      case "declining":
        return "text-red-600";
      default:
        return "text-gray-600";
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safety":
        return <Shield className="h-5 w-5" />;
      case "clinical":
        return <Stethoscope className="h-5 w-5" />;
      case "patient_experience":
        return <Heart className="h-5 w-5" />;
      case "operational":
        return <Building className="h-5 w-5" />;
      case "compliance":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getMetricStatus = (metric: QualityMetric) => {
    const { current, target, thresholds } = metric;
    const isTargetMet =
      target.operator === "greater_than"
        ? current.value >= target.value
        : current.value <= target.value;

    if (isTargetMet) return "target";

    const isCritical =
      target.operator === "greater_than"
        ? current.value <= thresholds.critical.value
        : current.value >= thresholds.critical.value;

    if (isCritical) return "critical";

    const isWarning =
      target.operator === "greater_than"
        ? current.value <= thresholds.warning.value
        : current.value >= thresholds.warning.value;

    return isWarning ? "warning" : "normal";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "target":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredMetrics =
    selectedCategory === "all"
      ? metrics
      : metrics.filter((m) => m.category === selectedCategory);

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalMetrics = metrics.filter(
    (m) => getMetricStatus(m) === "critical",
  );
  const warningMetrics = metrics.filter(
    (m) => getMetricStatus(m) === "warning",
  );
  const targetMetrics = metrics.filter((m) => getMetricStatus(m) === "target");

  if (metrics.length === 0) {
    return (
      <div className={`bg-white p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading quality metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Real-time Quality Metrics Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Continuous monitoring of healthcare quality metrics with real-time
            alerting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring across all domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Status
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalMetrics.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Metrics below critical threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Met</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {targetMetrics.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Metrics meeting target goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              Active Quality Alerts
            </CardTitle>
            <CardDescription>
              Quality metrics requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={getSeverityColor(alert.severity)}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.metricName}</div>
                        <div className="text-sm">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
          <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Filter by category:</span>
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {[
              "safety",
              "clinical",
              "patient_experience",
              "operational",
              "compliance",
            ].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category.replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map((metric) => {
              const status = getMetricStatus(metric);
              return (
                <Card key={metric.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(metric.category)}
                        <span className="truncate">{metric.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <Badge className={getPriorityColor(metric.priority)}>
                          {metric.priority}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {metric.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Value */}
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {metric.current.value.toFixed(1)}
                          <span className="text-lg text-gray-500 ml-1">
                            {metric.unit === "percentage"
                              ? "%"
                              : metric.unit.replace("_", " ")}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(metric.current.trend)}`}
                        >
                          {getTrendIcon(metric.current.trend)}
                          <span className="capitalize">
                            {metric.current.trend}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Target: {metric.target.value}
                            {metric.unit === "percentage" ? "%" : ""}
                          </span>
                          <span>Confidence: {metric.current.confidence}%</span>
                        </div>
                        <Progress
                          value={metric.current.confidence}
                          className="h-2"
                        />
                      </div>

                      {/* Thresholds */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-red-600 font-medium">
                            Critical
                          </div>
                          <div>{metric.thresholds.critical.value}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-600 font-medium">
                            Warning
                          </div>
                          <div>{metric.thresholds.warning.value}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">
                            Target
                          </div>
                          <div>{metric.thresholds.target.value}</div>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="text-xs text-gray-500 text-center">
                        Updated: {metric.current.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>
                Quality metrics trends and predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Trend analysis dashboard coming soon...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Advanced analytics and predictive modeling for quality metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DOH Compliance Status</CardTitle>
              <CardDescription>
                Real-time compliance monitoring and reporting status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">5</div>
                    <div className="text-sm text-green-700">
                      Compliant Metrics
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">1</div>
                    <div className="text-sm text-yellow-700">At Risk</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-sm text-red-700">Non-Compliant</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">DOH Reporting Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Patient Safety Metrics</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Weekly
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Quality Indicators</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Monthly
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Operational Metrics</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Quarterly
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeQualityMetricsMonitoringDashboard;
