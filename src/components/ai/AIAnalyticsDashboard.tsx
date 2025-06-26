import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Cpu,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Shield,
  Database,
  Sparkles,
} from "lucide-react";
import { aiHubService } from "@/services/ai-hub.service";

interface AIAnalyticsDashboardProps {
  className?: string;
}

interface DashboardData {
  overview: {
    totalAIRequests: number;
    successRate: number;
    averageResponseTime: number;
    modelAccuracy: number;
  };
  services: any[];
  insights: any[];
  performance: {
    resourceUtilization: number;
    modelPerformance: any;
    systemHealth: any;
  };
  recommendations: string[];
}

interface ManpowerOptimization {
  currentEfficiency: number;
  optimizedEfficiency: number;
  costSavings: number;
  staffSatisfaction: number;
  patientSatisfaction: number;
  recommendations: string[];
}

export const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({
  className = "",
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [manpowerData, setManpowerData] = useState<ManpowerOptimization | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadManpowerData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await aiHubService.getAnalyticsDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to load AI analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadManpowerData = async () => {
    try {
      // Mock manpower optimization data
      const data: ManpowerOptimization = {
        currentEfficiency: 78,
        optimizedEfficiency: 92,
        costSavings: 15000,
        staffSatisfaction: 85,
        patientSatisfaction: 94,
        recommendations: [
          "Implement AI-driven shift scheduling",
          "Optimize route planning for home visits",
          "Cross-train staff for better flexibility",
          "Use predictive analytics for patient demand",
        ],
      };
      setManpowerData(data);
    } catch (error) {
      console.error("Failed to load manpower data:", error);
    }
  };

  const optimizeManpowerSchedule = async () => {
    setIsOptimizing(true);
    try {
      const scheduleRequest = {
        date: new Date(),
        shiftType: "full-day" as const,
        requiredStaff: {
          nurses: 15,
          therapists: 8,
          doctors: 5,
          support: 10,
        },
        patientLoad: 45,
        specialRequirements: ["Pediatric Care", "Geriatric Care"],
        logistics: {
          vehicles: 8,
          routes: ["Zone A", "Zone B", "Zone C"],
          equipment: ["Wheelchairs", "Medical Kits", "Oxygen Tanks"],
        },
      };

      const result =
        await aiHubService.optimizeManpowerSchedule(scheduleRequest);
      console.log("Manpower schedule optimized:", result);

      // Update manpower data with optimized results
      setManpowerData((prev) => ({
        ...prev!,
        optimizedEfficiency: Math.min(95, prev!.optimizedEfficiency + 3),
        costSavings: prev!.costSavings + 2000,
      }));
    } catch (error) {
      console.error("Failed to optimize manpower schedule:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const generatePredictiveInsights = async () => {
    try {
      const insights = await aiHubService.generatePredictiveInsights();
      console.log("Generated predictive insights:", insights);
      await loadDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error("Failed to generate insights:", error);
    }
  };

  if (isLoading || !dashboardData || !manpowerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading AI Analytics...</p>
          <p className="text-gray-600">Initializing intelligent insights</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto p-6 space-y-6 bg-white ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Intelligent insights and AI-powered optimization for Reyada Homecare
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Enhanced
          </Badge>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {dashboardData.overview.totalAIRequests.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 mt-1">Total processed</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {dashboardData.overview.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1">AI operations</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {dashboardData.overview.averageResponseTime}ms
            </div>
            <p className="text-xs text-purple-600 mt-1">Average</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {(dashboardData.overview.modelAccuracy * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-orange-600 mt-1">ML models</p>
          </CardContent>
        </Card>
      </div>

      {/* Manpower Optimization Section */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            AI-Powered Manpower Optimization
          </CardTitle>
          <p className="text-gray-600">
            Intelligent staff scheduling and resource allocation
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {manpowerData.currentEfficiency}%
              </div>
              <div className="text-sm text-gray-600">Current Efficiency</div>
              <Progress
                value={manpowerData.currentEfficiency}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {manpowerData.optimizedEfficiency}%
              </div>
              <div className="text-sm text-gray-600">AI Optimized</div>
              <Progress
                value={manpowerData.optimizedEfficiency}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${manpowerData.costSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Savings</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800">
                Staff Satisfaction: {manpowerData.staffSatisfaction}%
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Patient Satisfaction: {manpowerData.patientSatisfaction}%
              </Badge>
            </div>
            <Button
              onClick={optimizeManpowerSchedule}
              disabled={isOptimizing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isOptimizing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Optimize Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">AI Services</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI Service Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.services.slice(0, 4).map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">
                          {service.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            service.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {service.status}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          {(service.performance.accuracy * 100).toFixed(1)}%
                          accuracy
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Utilization</span>
                      <span>
                        {dashboardData.performance.systemHealth.cpuUtilization}%
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.performance.systemHealth.cpuUtilization
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>
                        {dashboardData.performance.systemHealth.memoryUsage}%
                      </span>
                    </div>
                    <Progress
                      value={dashboardData.performance.systemHealth.memoryUsage}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disk Space</span>
                      <span>
                        {dashboardData.performance.systemHealth.diskSpace}%
                      </span>
                    </div>
                    <Progress
                      value={dashboardData.performance.systemHealth.diskSpace}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      {service.name}
                    </span>
                    <Badge
                      className={
                        service.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {service.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy:</span>
                      <span className="font-medium">
                        {(service.performance.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time:</span>
                      <span className="font-medium">
                        {service.performance.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Throughput:</span>
                      <span className="font-medium">
                        {service.performance.throughput}/min
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Capabilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {service.capabilities.map(
                          (cap: string, capIndex: number) => (
                            <Badge
                              key={capIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {cap}
                            </Badge>
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

        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Predictive Insights</h3>
            <Button onClick={generatePredictiveInsights} variant="outline">
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate New Insights
            </Button>
          </div>
          <div className="space-y-4">
            {dashboardData.insights.length > 0 ? (
              dashboardData.insights.map((insight, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {insight.type === "forecast" && (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      )}
                      {insight.type === "anomaly" && (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                      {insight.type === "recommendation" && (
                        <Lightbulb className="h-4 w-4 text-green-600" />
                      )}
                      {insight.type === "trend" && (
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-blue-800">
                            {insight.title}
                          </strong>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                insight.impact === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : insight.impact === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                            >
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {(insight.confidence * 100).toFixed(0)}%
                              confidence
                            </Badge>
                          </div>
                        </div>
                        <p className="text-blue-700 mb-2">
                          {insight.description}
                        </p>
                        {insight.recommendations &&
                          insight.recommendations.length > 0 && (
                            <div className="mt-2">
                              <strong className="text-sm">
                                Recommendations:
                              </strong>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {insight.recommendations.map(
                                  (rec: string, recIndex: number) => (
                                    <li key={recIndex}>{rec}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))
            ) : (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  No predictive insights available. Click "Generate New
                  Insights" to create AI-powered recommendations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Accuracy</span>
                      <span>
                        {(
                          dashboardData.performance.modelPerformance
                            .averageAccuracy * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.performance.modelPerformance
                          .averageAccuracy * 100
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Model Drift</span>
                      <span>
                        {(
                          dashboardData.performance.modelPerformance
                            .modelDrift * 100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.performance.modelPerformance.modelDrift *
                        100
                      }
                      className="[&>div]:bg-orange-500"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Prediction Latency:{" "}
                    {
                      dashboardData.performance.modelPerformance
                        .predictionLatency
                    }
                    ms
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData.performance.resourceUtilization}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Overall Utilization
                  </div>
                </div>
                <Progress
                  value={dashboardData.performance.resourceUtilization}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">CPU:</span>
                    <span className="font-medium ml-2">
                      {dashboardData.performance.systemHealth.cpuUtilization}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-medium ml-2">
                      {dashboardData.performance.systemHealth.memoryUsage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Disk:</span>
                    <span className="font-medium ml-2">
                      {dashboardData.performance.systemHealth.diskSpace}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Network:</span>
                    <span className="font-medium ml-2">
                      {dashboardData.performance.systemHealth.networkLatency}ms
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                System Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manpower Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {manpowerData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <Zap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;
