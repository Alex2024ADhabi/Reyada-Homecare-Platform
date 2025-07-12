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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Users,
  Car,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
  Zap,
  Brain,
  Shield,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OperationalMetrics {
  activeVisits: number;
  staffOnDuty: number;
  vehiclesInUse: number;
  emergencyAlerts: number;
  patientSatisfaction: number;
  resourceUtilization: number;
  routeEfficiency: number;
  complianceScore: number;
  // New DOH Homecare Standards Metrics
  homeboundAssessments: number;
  levelOfCareClassifications: number;
  nineDomainsCompliance: number;
  digitalFormsCompletion: number;
  communicationCompliance: number;
  enhancedComplianceScore: number;
}

interface PredictiveInsight {
  id: string;
  type: "demand" | "resource" | "risk" | "optimization";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  timeframe: string;
  actionRequired: boolean;
}

interface OperationalIntelligenceDashboardProps {
  facilityId?: string;
  refreshInterval?: number;
}

export default function OperationalIntelligenceDashboard({
  facilityId = "RHHCS-001",
  refreshInterval = 30000,
}: OperationalIntelligenceDashboardProps) {
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    activeVisits: 45,
    staffOnDuty: 28,
    vehiclesInUse: 12,
    emergencyAlerts: 0,
    patientSatisfaction: 94.5,
    resourceUtilization: 87.2,
    routeEfficiency: 92.8,
    complianceScore: 98.1,
    // New DOH Homecare Standards Metrics
    homeboundAssessments: 42,
    levelOfCareClassifications: 45,
    nineDomainsCompliance: 96.8,
    digitalFormsCompletion: 98.2,
    communicationCompliance: 100.0,
    enhancedComplianceScore: 97.5,
  });

  const [predictiveInsights, setPredictiveInsights] = useState<
    PredictiveInsight[]
  >([
    {
      id: "insight-001",
      type: "demand",
      title: "Increased Demand Forecast",
      description:
        "15% increase in service requests expected next week based on seasonal patterns",
      confidence: 87,
      impact: "high",
      timeframe: "Next 7 days",
      actionRequired: true,
    },
    {
      id: "insight-002",
      type: "resource",
      title: "Staff Optimization Opportunity",
      description:
        "Reallocating 3 nurses to Zone B could improve response times by 12%",
      confidence: 92,
      impact: "medium",
      timeframe: "Immediate",
      actionRequired: true,
    },
    {
      id: "insight-003",
      type: "risk",
      title: "Patient Risk Alert",
      description:
        "2 high-complexity patients showing early warning signs for hospitalization",
      confidence: 95,
      impact: "high",
      timeframe: "Next 48 hours",
      actionRequired: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshMetrics = async () => {
    setLoading(true);
    try {
      // Simulate real-time data updates
      setMetrics((prev) => ({
        ...prev,
        activeVisits: prev.activeVisits + Math.floor(Math.random() * 5) - 2,
        staffOnDuty: prev.staffOnDuty + Math.floor(Math.random() * 3) - 1,
        vehiclesInUse: prev.vehiclesInUse + Math.floor(Math.random() * 3) - 1,
        resourceUtilization: Math.min(
          100,
          Math.max(70, prev.resourceUtilization + Math.random() * 4 - 2),
        ),
        routeEfficiency: Math.min(
          100,
          Math.max(80, prev.routeEfficiency + Math.random() * 3 - 1.5),
        ),
      }));
    } catch (error) {
      console.error("Error refreshing metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "demand":
        return <TrendingUp className="w-4 h-4" />;
      case "resource":
        return <Users className="w-4 h-4" />;
      case "risk":
        return <AlertTriangle className="w-4 h-4" />;
      case "optimization":
        return <Target className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-orange-600 bg-orange-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-600" />
              Operational Intelligence Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time operational insights and predictive analytics for{" "}
              {facilityId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Live Data
            </Badge>
            <Button
              onClick={refreshMetrics}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {metrics.activeVisits}
              </div>
              <p className="text-xs text-blue-600">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Staff on Duty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {metrics.staffOnDuty}
              </div>
              <p className="text-xs text-green-600">
                Available for assignments
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicles in Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {metrics.vehiclesInUse}
              </div>
              <p className="text-xs text-purple-600">
                Active fleet utilization
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {metrics.complianceScore}%
              </div>
              <p className="text-xs text-orange-600">DOH & JAWDA compliant</p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>
                    Real-time utilization across all resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Staff Utilization</span>
                      <span>{metrics.resourceUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={metrics.resourceUtilization}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Route Efficiency</span>
                      <span>{metrics.routeEfficiency.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.routeEfficiency} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patient Satisfaction</span>
                      <span>{metrics.patientSatisfaction.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={metrics.patientSatisfaction}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Alerts</CardTitle>
                  <CardDescription>
                    Real-time monitoring and alert system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.emergencyAlerts === 0 ? (
                    <Alert className="bg-green-50 border-green-200">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">
                        All Systems Normal
                      </AlertTitle>
                      <AlertDescription className="text-green-700">
                        No emergency alerts or critical issues detected.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">
                        {metrics.emergencyAlerts} Active Alert(s)
                      </AlertTitle>
                      <AlertDescription className="text-red-700">
                        Immediate attention required for critical situations.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Predictive analytics and intelligent recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveInsights.map((insight) => (
                    <Card
                      key={insight.id}
                      className="border-l-4 border-l-blue-400"
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getInsightIcon(insight.type)}
                            <h4 className="font-semibold">{insight.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact.toUpperCase()}
                            </Badge>
                            {insight.actionRequired && (
                              <Badge variant="outline" className="text-red-600">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {insight.confidence}%</span>
                          <span>Timeframe: {insight.timeframe}</span>
                        </div>
                        <Progress
                          value={insight.confidence}
                          className="h-1 mt-2"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Average Response Time
                        </span>
                      </div>
                      <span className="text-sm font-bold">18 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Service Completion Rate
                        </span>
                      </div>
                      <span className="text-sm font-bold">97.8%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Route Optimization
                        </span>
                      </div>
                      <span className="text-sm font-bold">92.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Indicators</CardTitle>
                  <CardDescription>
                    JAWDA KPI performance and quality metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">
                          Patient Satisfaction
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {metrics.patientSatisfaction}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">
                          Safety Score
                        </span>
                      </div>
                      <span className="text-sm font-bold">99.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Clinical Outcomes
                        </span>
                      </div>
                      <span className="text-sm font-bold">96.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>
                  AI-powered recommendations for operational improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                      Route Optimization Opportunity
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Implementing dynamic route adjustments could reduce travel
                      time by 15% and fuel costs by 12%.
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-green-50 border-green-200">
                    <Users className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                      Staff Allocation Enhancement
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                      Redistributing staff based on patient complexity scores
                      could improve care quality by 8%.
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-purple-50 border-purple-200">
                    <Target className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-800">
                      Resource Utilization Improvement
                    </AlertTitle>
                    <AlertDescription className="text-purple-700">
                      Equipment sharing optimization could increase utilization
                      by 10% and reduce costs by 7%.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
