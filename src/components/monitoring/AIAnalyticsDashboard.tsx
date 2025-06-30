/**
 * AI Analytics Dashboard Component
 * Phase 3: UI/UX Components - AI Analytics Dashboard
 *
 * Comprehensive AI-powered analytics dashboard for the Reyada Homecare Platform
 * with real-time insights, predictive analytics, and healthcare-specific metrics.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Target,
  Lightbulb,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIAnalyticsData {
  overview: {
    totalPatients: number;
    activeCases: number;
    completedAssessments: number;
    complianceScore: number;
    aiAccuracy: number;
    systemHealth: number;
  };
  predictions: {
    patientRisk: Array<{
      patientId: string;
      riskLevel: "low" | "medium" | "high" | "critical";
      riskFactors: string[];
      confidence: number;
      recommendation: string;
    }>;
    resourceNeeds: {
      staffing: number;
      equipment: number;
      medications: number;
      confidence: number;
    };
    complianceRisk: {
      dohCompliance: number;
      jawdaCompliance: number;
      overallRisk: number;
      criticalAreas: string[];
    };
  };
  performance: {
    formCompletion: {
      rate: number;
      trend: "up" | "down" | "stable";
      avgTime: number;
    };
    errorRates: {
      clinical: number;
      technical: number;
      user: number;
      trend: "up" | "down" | "stable";
    };
    userEngagement: {
      activeUsers: number;
      sessionDuration: number;
      featureUsage: Record<string, number>;
    };
  };
  insights: {
    recommendations: Array<{
      id: string;
      type: "optimization" | "compliance" | "risk" | "efficiency";
      priority: "low" | "medium" | "high" | "critical";
      title: string;
      description: string;
      impact: string;
      effort: "low" | "medium" | "high";
      confidence: number;
    }>;
    trends: Array<{
      metric: string;
      direction: "up" | "down" | "stable";
      change: number;
      significance: "low" | "medium" | "high";
      description: string;
    }>;
    anomalies: Array<{
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      timestamp: Date;
      affected: string[];
    }>;
  };
}

export interface AIAnalyticsDashboardProps {
  data?: AIAnalyticsData;
  refreshInterval?: number;
  onRefresh?: () => void;
  onExport?: (format: "pdf" | "excel" | "json") => void;
  onInsightAction?: (insightId: string, action: string) => void;
  className?: string;
}

const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({
  data,
  refreshInterval = 30000,
  onRefresh,
  onExport,
  onInsightAction,
  className,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AIAnalyticsData | null>(
    data || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate mock data for demonstration
  const generateMockData = useCallback((): AIAnalyticsData => {
    const now = new Date();
    return {
      overview: {
        totalPatients: 1247 + Math.floor(Math.random() * 50),
        activeCases: 89 + Math.floor(Math.random() * 20),
        completedAssessments: 2156 + Math.floor(Math.random() * 100),
        complianceScore: 92 + Math.floor(Math.random() * 8),
        aiAccuracy: 94.5 + Math.random() * 5,
        systemHealth: 96 + Math.floor(Math.random() * 4),
      },
      predictions: {
        patientRisk: [
          {
            patientId: "P001",
            riskLevel: "high",
            riskFactors: ["Diabetes", "Hypertension", "Age > 65"],
            confidence: 87.5,
            recommendation: "Increase monitoring frequency to twice weekly",
          },
          {
            patientId: "P002",
            riskLevel: "medium",
            riskFactors: ["Recent Surgery", "Medication Changes"],
            confidence: 72.3,
            recommendation: "Schedule follow-up assessment within 48 hours",
          },
          {
            patientId: "P003",
            riskLevel: "critical",
            riskFactors: [
              "Multiple Comorbidities",
              "Poor Medication Adherence",
            ],
            confidence: 94.2,
            recommendation: "Immediate clinical intervention required",
          },
        ],
        resourceNeeds: {
          staffing: 85 + Math.floor(Math.random() * 15),
          equipment: 92 + Math.floor(Math.random() * 8),
          medications: 78 + Math.floor(Math.random() * 20),
          confidence: 89.5,
        },
        complianceRisk: {
          dohCompliance: 95 + Math.floor(Math.random() * 5),
          jawdaCompliance: 93 + Math.floor(Math.random() * 7),
          overallRisk: 12 + Math.floor(Math.random() * 8),
          criticalAreas: ["Documentation Timeliness", "Signature Compliance"],
        },
      },
      performance: {
        formCompletion: {
          rate: 94.2 + Math.random() * 5,
          trend: Math.random() > 0.5 ? "up" : "stable",
          avgTime: 8.5 + Math.random() * 2,
        },
        errorRates: {
          clinical: 2.1 + Math.random() * 1,
          technical: 1.8 + Math.random() * 1,
          user: 3.2 + Math.random() * 1,
          trend: Math.random() > 0.7 ? "down" : "stable",
        },
        userEngagement: {
          activeUsers: 156 + Math.floor(Math.random() * 30),
          sessionDuration: 24.5 + Math.random() * 10,
          featureUsage: {
            "Patient Management": 89,
            "Clinical Forms": 76,
            "Compliance Checker": 65,
            Analytics: 43,
            Reporting: 58,
          },
        },
      },
      insights: {
        recommendations: [
          {
            id: "rec_001",
            type: "optimization",
            priority: "high",
            title: "Optimize Form Completion Workflow",
            description:
              "AI analysis suggests reorganizing clinical forms to reduce completion time by 15%",
            impact: "Reduce documentation time by 2.3 minutes per form",
            effort: "medium",
            confidence: 87.2,
          },
          {
            id: "rec_002",
            type: "compliance",
            priority: "critical",
            title: "Address DOH Documentation Gaps",
            description:
              "Missing signatures detected in 12% of clinical assessments",
            impact: "Improve DOH compliance score by 8 points",
            effort: "low",
            confidence: 94.5,
          },
          {
            id: "rec_003",
            type: "risk",
            priority: "medium",
            title: "Implement Predictive Patient Monitoring",
            description:
              "AI model can predict patient deterioration 48 hours in advance",
            impact: "Reduce emergency interventions by 23%",
            effort: "high",
            confidence: 78.9,
          },
        ],
        trends: [
          {
            metric: "Patient Satisfaction",
            direction: "up",
            change: 12.5,
            significance: "high",
            description:
              "Significant improvement in patient satisfaction scores",
          },
          {
            metric: "Documentation Accuracy",
            direction: "up",
            change: 8.3,
            significance: "medium",
            description: "AI-assisted validation improving accuracy",
          },
          {
            metric: "System Response Time",
            direction: "down",
            change: -15.2,
            significance: "high",
            description: "Performance optimization showing results",
          },
        ],
        anomalies: [
          {
            type: "Performance Spike",
            severity: "medium",
            description: "Unusual increase in form completion time detected",
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            affected: ["Clinical Forms", "Assessment Module"],
          },
          {
            type: "Compliance Alert",
            severity: "high",
            description: "Multiple missing signatures in recent submissions",
            timestamp: new Date(now.getTime() - 45 * 60 * 1000),
            affected: ["DOH Forms", "Digital Signatures"],
          },
        ],
      },
    };
  }, []);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newData = data || generateMockData();
      setAnalyticsData(newData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [data, generateMockData]);

  // Auto-refresh data
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadAnalyticsData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadAnalyticsData]);

  // Initial data load
  useEffect(() => {
    if (!analyticsData) {
      loadAnalyticsData();
    }
  }, [analyticsData, loadAnalyticsData]);

  const handleRefresh = () => {
    onRefresh?.();
    loadAnalyticsData();
  };

  const handleExport = (format: "pdf" | "excel" | "json") => {
    onExport?.(format);
  };

  const handleInsightAction = (insightId: string, action: string) => {
    onInsightAction?.(insightId, action);
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 mx-auto text-blue-600 animate-pulse" />
          <p className="text-gray-600">Loading AI Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 bg-gray-50 min-h-screen p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "flex items-center gap-2",
              autoRefresh && "bg-green-50 border-green-200",
            )}
          >
            <Zap className="h-4 w-4" />
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">
                  {analyticsData.overview.totalPatients.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analyticsData.overview.activeCases}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assessments</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.overview.completedAssessments.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.overview.complianceScore}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analyticsData.overview.aiAccuracy.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.overview.systemHealth}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Form Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {analyticsData.performance.formCompletion.rate.toFixed(1)}
                      %
                    </span>
                    {getTrendIcon(
                      analyticsData.performance.formCompletion.trend,
                    )}
                  </div>
                  <Progress
                    value={analyticsData.performance.formCompletion.rate}
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600">
                    Average completion time:{" "}
                    {analyticsData.performance.formCompletion.avgTime.toFixed(
                      1,
                    )}{" "}
                    minutes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Users</span>
                    <span className="font-bold">
                      {analyticsData.performance.userEngagement.activeUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Session</span>
                    <span className="font-bold">
                      {analyticsData.performance.userEngagement.sessionDuration.toFixed(
                        1,
                      )}{" "}
                      min
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Feature Usage:</p>
                    {Object.entries(
                      analyticsData.performance.userEngagement.featureUsage,
                    ).map(([feature, usage]) => (
                      <div key={feature} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{feature}</span>
                          <span>{usage}%</span>
                        </div>
                        <Progress value={usage} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Risk Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Patient Risk Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.predictions.patientRisk.map(
                    (patient, index) => (
                      <div
                        key={patient.patientId}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {patient.patientId}
                          </span>
                          <Badge
                            variant={getRiskBadgeVariant(patient.riskLevel)}
                          >
                            {patient.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Risk Factors: {patient.riskFactors.join(", ")}</p>
                          <p>Confidence: {patient.confidence}%</p>
                        </div>
                        <p className="text-sm bg-blue-50 p-2 rounded">
                          {patient.recommendation}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resource Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resource Needs Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Staffing</span>
                        <span>
                          {analyticsData.predictions.resourceNeeds.staffing}%
                        </span>
                      </div>
                      <Progress
                        value={analyticsData.predictions.resourceNeeds.staffing}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Equipment</span>
                        <span>
                          {analyticsData.predictions.resourceNeeds.equipment}%
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.predictions.resourceNeeds.equipment
                        }
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Medications</span>
                        <span>
                          {analyticsData.predictions.resourceNeeds.medications}%
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.predictions.resourceNeeds.medications
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Prediction Confidence:{" "}
                    {analyticsData.predictions.resourceNeeds.confidence}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Trend</span>
                    {getTrendIcon(analyticsData.performance.errorRates.trend)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Clinical Errors</span>
                      <span className="font-bold text-red-600">
                        {analyticsData.performance.errorRates.clinical.toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Technical Errors</span>
                      <span className="font-bold text-orange-600">
                        {analyticsData.performance.errorRates.technical.toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Errors</span>
                      <span className="font-bold text-yellow-600">
                        {analyticsData.performance.errorRates.user.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>DOH Compliance</span>
                        <span>
                          {
                            analyticsData.predictions.complianceRisk
                              .dohCompliance
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.predictions.complianceRisk.dohCompliance
                        }
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>JAWDA Compliance</span>
                        <span>
                          {
                            analyticsData.predictions.complianceRisk
                              .jawdaCompliance
                          }
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          analyticsData.predictions.complianceRisk
                            .jawdaCompliance
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-sm font-medium text-red-800">
                      Critical Areas:
                    </p>
                    <ul className="text-sm text-red-700 mt-1">
                      {analyticsData.predictions.complianceRisk.criticalAreas.map(
                        (area, index) => (
                          <li key={index}>• {area}</li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.insights.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge
                          variant={getRiskBadgeVariant(rec.priority)}
                          className={getPriorityColor(rec.priority)}
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Impact: {rec.impact}</p>
                        <p>
                          Effort: {rec.effort} • Confidence: {rec.confidence}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleInsightAction(rec.id, "implement")
                          }
                        >
                          Implement
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInsightAction(rec.id, "dismiss")}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trends & Anomalies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends & Anomalies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Trends</h4>
                    <div className="space-y-2">
                      {analyticsData.insights.trends.map((trend, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {getTrendIcon(trend.direction)}
                            <span className="text-sm">{trend.metric}</span>
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              trend.direction === "up"
                                ? "text-green-600"
                                : "text-red-600",
                            )}
                          >
                            {trend.direction === "up" ? "+" : ""}
                            {trend.change}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recent Anomalies</h4>
                    <div className="space-y-2">
                      {analyticsData.insights.anomalies.map(
                        (anomaly, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium">{anomaly.type}</p>
                                <p className="text-sm">{anomaly.description}</p>
                                <p className="text-xs">
                                  {anomaly.timestamp.toLocaleString()} •{" "}
                                  {anomaly.affected.join(", ")}
                                </p>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ),
                      )}
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

export default AIAnalyticsDashboard;
