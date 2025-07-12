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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Calendar,
  MapPin,
  Truck,
  UserCheck,
  FileText,
  DollarSign,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import {
  getOperationalMetrics,
  getRealTimeMetrics,
  getBusinessIntelligence,
} from "@/services/real-time-analytics.service";

interface OperationalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: "up" | "down" | "stable";
  change: number;
  status: "excellent" | "good" | "warning" | "critical";
  category: "efficiency" | "utilization" | "quality" | "cost";
}

interface WorkflowAnalysis {
  id: string;
  workflowName: string;
  efficiency: number;
  bottlenecks: string[];
  avgProcessingTime: number;
  completionRate: number;
  errorRate: number;
  recommendations: string[];
}

interface ResourceUtilization {
  resourceType: string;
  utilization: number;
  capacity: number;
  efficiency: number;
  cost: number;
  trend: "increasing" | "decreasing" | "stable";
  optimization: string[];
}

interface OperationalAlert {
  id: string;
  type: "efficiency" | "utilization" | "quality" | "cost";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  timestamp: string;
  resolved: boolean;
}

interface OperationalAnalyticsDashboardProps {
  facilityId?: string;
  refreshInterval?: number;
}

const OperationalAnalyticsDashboard: React.FC<
  OperationalAnalyticsDashboardProps
> = ({ facilityId = "RHHCS-001", refreshInterval = 30000 }) => {
  const { toast } = useToastContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [operationalMetrics, setOperationalMetrics] = useState<
    OperationalMetric[]
  >([
    {
      id: "staff_productivity",
      name: "Staff Productivity",
      value: 94.6,
      unit: "%",
      target: 90,
      trend: "up",
      change: 3.2,
      status: "excellent",
      category: "efficiency",
    },
    {
      id: "equipment_utilization",
      name: "Equipment Utilization",
      value: 87.3,
      unit: "%",
      target: 85,
      trend: "up",
      change: 2.1,
      status: "good",
      category: "utilization",
    },
    {
      id: "facility_capacity",
      name: "Facility Capacity",
      value: 82.7,
      unit: "%",
      target: 80,
      trend: "stable",
      change: 0.5,
      status: "good",
      category: "utilization",
    },
    {
      id: "supply_chain_efficiency",
      name: "Supply Chain Efficiency",
      value: 91.4,
      unit: "%",
      target: 88,
      trend: "up",
      change: 4.7,
      status: "excellent",
      category: "efficiency",
    },
    {
      id: "energy_efficiency",
      name: "Energy Efficiency",
      value: 88.9,
      unit: "%",
      target: 85,
      trend: "up",
      change: 1.8,
      status: "good",
      category: "cost",
    },
    {
      id: "waste_reduction",
      name: "Waste Reduction",
      value: 76.3,
      unit: "%",
      target: 80,
      trend: "down",
      change: -2.1,
      status: "warning",
      category: "cost",
    },
  ]);

  const [workflowAnalyses, setWorkflowAnalyses] = useState<WorkflowAnalysis[]>([
    {
      id: "patient_admission",
      workflowName: "Patient Admission Process",
      efficiency: 92.3,
      bottlenecks: ["Insurance verification", "Medical history review"],
      avgProcessingTime: 45,
      completionRate: 98.7,
      errorRate: 1.3,
      recommendations: [
        "Implement automated insurance verification",
        "Digitize medical history intake",
        "Add parallel processing for documentation",
      ],
    },
    {
      id: "care_coordination",
      workflowName: "Care Coordination",
      efficiency: 89.1,
      bottlenecks: ["Provider communication", "Schedule coordination"],
      avgProcessingTime: 32,
      completionRate: 96.4,
      errorRate: 3.6,
      recommendations: [
        "Implement real-time messaging system",
        "Automated scheduling optimization",
        "Provider availability integration",
      ],
    },
    {
      id: "discharge_planning",
      workflowName: "Discharge Planning",
      efficiency: 94.7,
      bottlenecks: ["Equipment coordination", "Follow-up scheduling"],
      avgProcessingTime: 28,
      completionRate: 99.2,
      errorRate: 0.8,
      recommendations: [
        "Predictive equipment needs analysis",
        "Automated follow-up scheduling",
        "Integration with home care services",
      ],
    },
  ]);

  const [resourceUtilization, setResourceUtilization] = useState<
    ResourceUtilization[]
  >([
    {
      resourceType: "Clinical Staff",
      utilization: 87.2,
      capacity: 100,
      efficiency: 94.1,
      cost: 245000,
      trend: "stable",
      optimization: [
        "Implement flexible scheduling",
        "Cross-training programs",
        "Workload balancing algorithms",
      ],
    },
    {
      resourceType: "Medical Equipment",
      utilization: 78.9,
      capacity: 95,
      efficiency: 91.3,
      cost: 89000,
      trend: "increasing",
      optimization: [
        "Predictive maintenance scheduling",
        "Equipment sharing protocols",
        "Utilization tracking system",
      ],
    },
    {
      resourceType: "Transportation Fleet",
      utilization: 82.4,
      capacity: 90,
      efficiency: 88.7,
      cost: 67000,
      trend: "increasing",
      optimization: [
        "Route optimization algorithms",
        "Real-time traffic integration",
        "Vehicle maintenance scheduling",
      ],
    },
    {
      resourceType: "Facility Space",
      utilization: 75.6,
      capacity: 100,
      efficiency: 85.2,
      cost: 156000,
      trend: "stable",
      optimization: [
        "Space utilization analytics",
        "Flexible room configurations",
        "Occupancy optimization",
      ],
    },
  ]);

  const [operationalAlerts, setOperationalAlerts] = useState<
    OperationalAlert[]
  >([
    {
      id: "alert_001",
      type: "efficiency",
      severity: "medium",
      title: "Supply Chain Delay Detected",
      description: "Medical supplies delivery delayed by 24 hours",
      impact: "Potential impact on 12 scheduled procedures",
      recommendation:
        "Activate backup supplier and reschedule non-critical procedures",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "alert_002",
      type: "utilization",
      severity: "low",
      title: "Equipment Underutilization",
      description: "MRI machine utilization below 70% for past week",
      impact: "Reduced ROI on equipment investment",
      recommendation: "Review scheduling patterns and consider extended hours",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "alert_003",
      type: "quality",
      severity: "high",
      title: "Process Bottleneck Identified",
      description: "Patient admission process exceeding target time by 25%",
      impact: "Reduced patient satisfaction and increased wait times",
      recommendation: "Implement parallel processing and staff reallocation",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [operationalData, realTimeMetrics, businessIntelligence] =
        await Promise.all([
          getOperationalMetrics({
            includeEfficiency: true,
            includeUtilization: true,
            timeframe: selectedTimeframe,
          }),
          getRealTimeMetrics(),
          getBusinessIntelligence({ includeOperational: true }),
        ]);

      // Update operational metrics with real data
      if (operationalData.metrics) {
        setOperationalMetrics((prev) =>
          prev.map((metric) => {
            const updatedData = operationalData.metrics[metric.id];
            return updatedData ? { ...metric, ...updatedData } : metric;
          }),
        );
      }

      // Update workflow analyses
      if (operationalData.workflows) {
        setWorkflowAnalyses(operationalData.workflows);
      }

      // Update resource utilization
      if (operationalData.resources) {
        setResourceUtilization(operationalData.resources);
      }

      setLastUpdated(new Date());

      toast({
        title: "Operational Data Updated",
        description: "Latest operational analytics have been loaded",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing operational data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh operational analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
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
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "efficiency":
        return <Zap className="h-4 w-4" />;
      case "utilization":
        return <BarChart3 className="h-4 w-4" />;
      case "quality":
        return <Target className="h-4 w-4" />;
      case "cost":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Operational Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time operational metrics, workflow analysis, and resource
            optimization for {facilityId}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshData} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Key Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {operationalMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                {getCategoryIcon(metric.category)}
                <span className="ml-2">{metric.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(1)}
                    {metric.unit}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span
                      className={`text-sm ${
                        metric.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    Target: {metric.target}
                    {metric.unit}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={Math.min(100, (metric.value / metric.target) * 100)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Activity className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Users className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency Trends</CardTitle>
                <CardDescription>
                  Key efficiency metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Operational efficiency trend chart
                    </p>
                    <p className="text-sm text-gray-400">
                      Real-time efficiency tracking and forecasting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization Summary</CardTitle>
                <CardDescription>
                  Current utilization across all resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceUtilization.slice(0, 4).map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium">
                          {resource.resourceType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={resource.utilization}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-bold">
                          {resource.utilization.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-6">
          <div className="space-y-6">
            {workflowAnalyses.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{workflow.workflowName}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {workflow.efficiency.toFixed(1)}% Efficient
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {workflow.avgProcessingTime}min
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg Processing Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {workflow.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Completion Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {workflow.errorRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {workflow.bottlenecks.length}
                      </div>
                      <div className="text-sm text-gray-600">Bottlenecks</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">
                        Identified Bottlenecks
                      </h4>
                      <div className="space-y-2">
                        {workflow.bottlenecks.map((bottleneck, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{bottleneck}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        Optimization Recommendations
                      </h4>
                      <div className="space-y-2">
                        {workflow.recommendations.map(
                          (recommendation, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{recommendation}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resourceUtilization.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{resource.resourceType}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(resource.trend)}
                      <Badge variant="outline">
                        {resource.utilization.toFixed(1)}% utilized
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {resource.utilization.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Utilization</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {resource.efficiency.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Efficiency</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          ${resource.cost.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          Monthly Cost
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span>{resource.utilization.toFixed(1)}%</span>
                      </div>
                      <Progress value={resource.utilization} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacity</span>
                        <span>{resource.capacity.toFixed(1)}%</span>
                      </div>
                      <Progress value={resource.capacity} className="h-2" />
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        Optimization Opportunities
                      </h5>
                      <div className="space-y-1">
                        {resource.optimization.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="text-xs">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {operationalAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.severity === "critical"
                              ? "text-red-500"
                              : alert.severity === "high"
                                ? "text-orange-500"
                                : alert.severity === "medium"
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                          }`}
                        />
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="bg-green-100 text-green-800">
                            RESOLVED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Impact:</span>{" "}
                        {alert.impact}
                      </p>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Recommendation:</span>{" "}
                        {alert.recommendation}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                      {!alert.resolved && (
                        <Button size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationalAnalyticsDashboard;
