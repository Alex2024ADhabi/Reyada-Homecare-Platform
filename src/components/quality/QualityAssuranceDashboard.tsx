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
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Shield,
  Award,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  getEnhancedQualityDashboard,
  getQualityImprovements,
  getPatientSafetyIncidents,
  getQualityMetrics,
  getBenchmarkingAnalysis,
  getQualityCertifications,
  getCertificationRenewalAlerts,
  getDOHComplianceDashboard,
  QualityImprovement,
  PatientSafetyIncident,
  QualityMetrics,
  BenchmarkingData,
  QualityCertification,
} from "@/api/quality-management.api";

interface QualityDashboardData {
  realTimeMetrics: {
    overall_quality_score: number;
    patient_safety_score: number;
    clinical_effectiveness_score: number;
    operational_efficiency_score: number;
    patient_satisfaction_score: number;
  };
  qualityImprovements: {
    active_initiatives: number;
    completed_this_month: number;
    average_completion_rate: number;
    total_roi_achieved: number;
  };
  patientSafety: {
    incidents_this_month: number;
    incidents_trend: "improving" | "stable" | "concerning";
    high_risk_areas: string[];
    corrective_actions_pending: number;
  };
  benchmarking: {
    metrics_above_benchmark: number;
    top_performing_areas: string[];
    improvement_opportunities: string[];
    industry_ranking_percentile: number;
  };
  certifications: {
    active_certifications: number;
    expiring_within_90_days: number;
    compliance_score: number;
    upcoming_audits: number;
  };
  alerts: {
    critical: any[];
    warning: any[];
    info: any[];
  };
  actionItems: {
    priority: "high" | "medium" | "low";
    category: string;
    description: string;
    due_date: string;
    assigned_to: string;
  }[];
}

interface DOHComplianceData {
  realTimeMetrics: {
    overall_compliance: number;
    documentation_compliance: number;
    patient_safety_score: number;
    clinical_quality_score: number;
    regulatory_adherence: number;
  };
  alerts: {
    critical: any[];
    warning: any[];
    info: any[];
  };
  actionableInsights: {
    priority: "high" | "medium" | "low";
    category: string;
    title: string;
    description: string;
    action_required: string;
    deadline?: string;
    impact: string;
  }[];
  complianceHistory: {
    date: string;
    overall_score: number;
    category_scores: Record<string, number>;
  }[];
  nonCompliantDocuments: {
    document_type: string;
    patient_id?: string;
    clinician: string;
    issue_description: string;
    severity: "critical" | "major" | "minor";
    date_identified: string;
    status: "open" | "in_progress" | "resolved";
  }[];
}

const QualityAssuranceDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<QualityDashboardData | null>(null);
  const [dohComplianceData, setDohComplianceData] =
    useState<DOHComplianceData | null>(null);
  const [improvements, setImprovements] = useState<QualityImprovement[]>([]);
  const [incidents, setIncidents] = useState<PatientSafetyIncident[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics[]>([]);
  const [benchmarking, setBenchmarking] = useState<any>(null);
  const [certifications, setCertifications] = useState<QualityCertification[]>(
    [],
  );
  const [renewalAlerts, setRenewalAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboardResponse,
        dohComplianceResponse,
        improvementsResponse,
        incidentsResponse,
        metricsResponse,
        benchmarkingResponse,
        certificationsResponse,
        renewalAlertsResponse,
      ] = await Promise.all([
        getEnhancedQualityDashboard(),
        getDOHComplianceDashboard(),
        getQualityImprovements(),
        getPatientSafetyIncidents(),
        getQualityMetrics(),
        getBenchmarkingAnalysis(),
        getQualityCertifications(),
        getCertificationRenewalAlerts(),
      ]);

      setDashboardData(dashboardResponse);
      setDohComplianceData(dohComplianceResponse);
      setImprovements(improvementsResponse);
      setIncidents(incidentsResponse);
      setMetrics(metricsResponse);
      setBenchmarking(benchmarkingResponse);
      setCertifications(certificationsResponse);
      setRenewalAlerts(renewalAlertsResponse);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load quality dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 80) return "secondary";
    if (score >= 70) return "outline";
    return "destructive";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "critical":
        return "destructive";
      case "medium":
      case "major":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading Quality Management Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quality Management System
          </h1>
          <p className="text-gray-600">
            Comprehensive quality assurance dashboard with real-time metrics and
            compliance monitoring
          </p>
        </div>

        {/* Critical Alerts */}
        {(dashboardData?.alerts.critical.length || 0) > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Quality Issues Detected</AlertTitle>
            <AlertDescription>
              {dashboardData?.alerts.critical.length} critical issues require
              immediate attention.
              <Button variant="link" className="p-0 h-auto ml-2">
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Real-time Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Quality Score
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData?.realTimeMetrics.overall_quality_score || 0}%
              </div>
              <Progress
                value={
                  dashboardData?.realTimeMetrics.overall_quality_score || 0
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patient Safety
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(dashboardData?.realTimeMetrics.patient_safety_score || 0)}`}
              >
                {dashboardData?.realTimeMetrics.patient_safety_score || 0}%
              </div>
              <div className="flex items-center mt-2">
                {getTrendIcon(
                  dashboardData?.patientSafety.incidents_trend || "stable",
                )}
                <span className="text-xs text-muted-foreground ml-1">
                  {dashboardData?.patientSafety.incidents_this_month || 0}{" "}
                  incidents this month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clinical Effectiveness
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(dashboardData?.realTimeMetrics.clinical_effectiveness_score || 0)}`}
              >
                {dashboardData?.realTimeMetrics.clinical_effectiveness_score ||
                  0}
                %
              </div>
              <Progress
                value={
                  dashboardData?.realTimeMetrics.clinical_effectiveness_score ||
                  0
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Operational Efficiency
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(dashboardData?.realTimeMetrics.operational_efficiency_score || 0)}`}
              >
                {dashboardData?.realTimeMetrics.operational_efficiency_score ||
                  0}
                %
              </div>
              <Progress
                value={
                  dashboardData?.realTimeMetrics.operational_efficiency_score ||
                  0
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patient Satisfaction
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(dashboardData?.realTimeMetrics.patient_satisfaction_score || 0)}`}
              >
                {dashboardData?.realTimeMetrics.patient_satisfaction_score || 0}
                %
              </div>
              <Progress
                value={
                  dashboardData?.realTimeMetrics.patient_satisfaction_score || 0
                }
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="improvements">Quality Improvements</TabsTrigger>
            <TabsTrigger value="safety">Patient Safety</TabsTrigger>
            <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quality Improvements Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quality Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData?.qualityImprovements
                          .active_initiatives || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Initiatives
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.qualityImprovements
                          .completed_this_month || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed This Month
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Completion Rate
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {dashboardData?.qualityImprovements
                          .average_completion_rate || 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData?.qualityImprovements
                          .average_completion_rate || 0
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Certifications Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quality Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.certifications.active_certifications ||
                          0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Certifications
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardData?.certifications
                          .expiring_within_90_days || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expiring Soon
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Compliance Score
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {dashboardData?.certifications.compliance_score || 0}%
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData?.certifications.compliance_score || 0
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Action Items</CardTitle>
                <CardDescription>
                  Critical tasks requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.actionItems.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </span>
                          <span>Assigned: {item.assigned_to}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No action items at this time
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Improvements Tab */}
          <TabsContent value="improvements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Quality Improvement Initiatives
              </h2>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                New Initiative
              </Button>
            </div>

            <div className="grid gap-6">
              {improvements.slice(0, 10).map((improvement) => (
                <Card key={improvement.improvement_id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {improvement.title}
                        </CardTitle>
                        <CardDescription>
                          {improvement.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          improvement.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {improvement.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {improvement.progress_percentage}%
                        </span>
                      </div>
                      <Progress value={improvement.progress_percentage} />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Category</div>
                          <div className="text-muted-foreground capitalize">
                            {improvement.category.replace("_", " ")}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Start Date</div>
                          <div className="text-muted-foreground">
                            {new Date(
                              improvement.start_date,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Target Date</div>
                          <div className="text-muted-foreground">
                            {new Date(
                              improvement.target_completion_date,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Budget</div>
                          <div className="text-muted-foreground">
                            $
                            {improvement.improvement_plan.budget_required.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {improvement.kpi_tracking &&
                        improvement.kpi_tracking.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">KPI Tracking</h4>
                            <div className="grid gap-2">
                              {improvement.kpi_tracking
                                .slice(0, 3)
                                .map((kpi, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                  >
                                    <span className="text-sm">
                                      {kpi.kpi_name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {kpi.current_value} / {kpi.target_value}
                                      </span>
                                      {getTrendIcon(kpi.trend)}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Patient Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Patient Safety Management</h2>
              <Button>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </div>

            {/* Safety Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Incidents This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {dashboardData?.patientSafety.incidents_this_month || 0}
                  </div>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(
                      dashboardData?.patientSafety.incidents_trend || "stable",
                    )}
                    <span className="text-sm text-muted-foreground ml-1 capitalize">
                      {dashboardData?.patientSafety.incidents_trend || "stable"}{" "}
                      trend
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {dashboardData?.patientSafety.corrective_actions_pending ||
                      0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Corrective actions requiring completion
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">High Risk Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData?.patientSafety.high_risk_areas
                      .slice(0, 3)
                      .map((area, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {area}
                        </Badge>
                      )) || (
                      <div className="text-sm text-muted-foreground">
                        No high-risk areas identified
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Incidents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Safety Incidents</CardTitle>
                <CardDescription>
                  Latest patient safety incidents and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.slice(0, 5).map((incident) => (
                    <div
                      key={incident.incident_id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getPriorityColor(incident.severity)}
                            >
                              {incident.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium capitalize">
                              {incident.incident_type.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {incident.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {incident.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {incident.location}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(
                            incident.incident_date,
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Reported by:</span>{" "}
                          {incident.reported_by}
                        </div>
                        <div>
                          <span className="font-medium">Actions:</span>{" "}
                          {incident.corrective_actions?.length || 0} pending
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Quality Performance Metrics
              </h2>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            </div>

            <div className="grid gap-6">
              {metrics.slice(0, 8).map((metric) => (
                <Card key={metric.metric_id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {metric.metric_name}
                        </CardTitle>
                        <CardDescription>{metric.description}</CardDescription>
                      </div>
                      <Badge
                        variant={getScoreBadgeVariant(
                          (metric.current_period?.actual_value /
                            metric.target_value) *
                            100,
                        )}
                      >
                        {metric.current_period?.performance_status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {metric.current_period?.actual_value || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Value
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-600">
                            {metric.target_value}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Target
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-2xl font-bold ${
                              (metric.current_period?.variance_from_target ||
                                0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {metric.current_period?.variance_percentage || 0}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Variance
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            {getTrendIcon(
                              metric.trend_analysis?.trend_direction ||
                                "stable",
                            )}
                            <span className="ml-1 text-sm font-medium capitalize">
                              {metric.trend_analysis?.trend_direction ||
                                "stable"}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Trend
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Performance vs Target
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(
                              ((metric.current_period?.actual_value || 0) /
                                metric.target_value) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            ((metric.current_period?.actual_value || 0) /
                              metric.target_value) *
                              100,
                          )}
                        />
                      </div>

                      {metric.benchmarking && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {metric.benchmarking.national_benchmark && (
                            <div>
                              <div className="font-medium">
                                National Benchmark
                              </div>
                              <div className="text-muted-foreground">
                                {metric.benchmarking.national_benchmark}
                              </div>
                            </div>
                          )}
                          {metric.benchmarking.percentile_ranking && (
                            <div>
                              <div className="font-medium">
                                Percentile Ranking
                              </div>
                              <div className="text-muted-foreground">
                                {metric.benchmarking.percentile_ranking}th
                              </div>
                            </div>
                          )}
                          {metric.benchmarking.peer_comparison && (
                            <div>
                              <div className="font-medium">Peer Comparison</div>
                              <div className="text-muted-foreground">
                                {metric.benchmarking.peer_comparison}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Benchmarking Tab */}
          <TabsContent value="benchmarking" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Performance Benchmarking</h2>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Update Benchmarks
              </Button>
            </div>

            {/* Benchmarking Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Above Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {benchmarking?.performance_summary.above_benchmark || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    out of{" "}
                    {benchmarking?.performance_summary.total_metrics || 0}{" "}
                    metrics
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">At Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {benchmarking?.performance_summary.at_benchmark || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    meeting industry standards
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Below Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {benchmarking?.performance_summary.below_benchmark || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    requiring improvement
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Industry Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {dashboardData?.benchmarking.industry_ranking_percentile ||
                      0}
                    th
                  </div>
                  <div className="text-sm text-muted-foreground">
                    percentile
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers and Improvement Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Performing Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.benchmarking.top_performing_areas.map(
                      (area, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <span className="font-medium">{area}</span>
                          <Badge variant="default">Excellent</Badge>
                        </div>
                      ),
                    ) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No top performing areas identified
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    Improvement Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.benchmarking.improvement_opportunities.map(
                      (opportunity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                        >
                          <span className="font-medium">{opportunity}</span>
                          <Badge variant="secondary">Focus Area</Badge>
                        </div>
                      ),
                    ) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No improvement opportunities identified
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DOH Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">DOH Compliance Dashboard</h2>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            {/* DOH Compliance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(dohComplianceData?.realTimeMetrics.overall_compliance || 0)}`}
                  >
                    {dohComplianceData?.realTimeMetrics.overall_compliance || 0}
                    %
                  </div>
                  <Progress
                    value={
                      dohComplianceData?.realTimeMetrics.overall_compliance || 0
                    }
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(dohComplianceData?.realTimeMetrics.documentation_compliance || 0)}`}
                  >
                    {dohComplianceData?.realTimeMetrics
                      .documentation_compliance || 0}
                    %
                  </div>
                  <Progress
                    value={
                      dohComplianceData?.realTimeMetrics
                        .documentation_compliance || 0
                    }
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Patient Safety
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(dohComplianceData?.realTimeMetrics.patient_safety_score || 0)}`}
                  >
                    {dohComplianceData?.realTimeMetrics.patient_safety_score ||
                      0}
                    %
                  </div>
                  <Progress
                    value={
                      dohComplianceData?.realTimeMetrics.patient_safety_score ||
                      0
                    }
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clinical Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(dohComplianceData?.realTimeMetrics.clinical_quality_score || 0)}`}
                  >
                    {dohComplianceData?.realTimeMetrics
                      .clinical_quality_score || 0}
                    %
                  </div>
                  <Progress
                    value={
                      dohComplianceData?.realTimeMetrics
                        .clinical_quality_score || 0
                    }
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Regulatory Adherence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(dohComplianceData?.realTimeMetrics.regulatory_adherence || 0)}`}
                  >
                    {dohComplianceData?.realTimeMetrics.regulatory_adherence ||
                      0}
                    %
                  </div>
                  <Progress
                    value={
                      dohComplianceData?.realTimeMetrics.regulatory_adherence ||
                      0
                    }
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Actionable Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Actionable Compliance Insights</CardTitle>
                <CardDescription>
                  Priority actions to improve DOH compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dohComplianceData?.actionableInsights
                    .slice(0, 5)
                    .map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={getPriorityColor(insight.priority)}
                              >
                                {insight.priority.toUpperCase()}
                              </Badge>
                              <span className="font-medium">
                                {insight.category}
                              </span>
                            </div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                          </div>
                          {insight.deadline && (
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                Deadline
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  insight.deadline,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <div className="text-sm font-medium mb-1">
                            Required Action:
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {insight.action_required}
                          </div>
                          <div className="text-sm font-medium mt-2">
                            Impact:
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {insight.impact}
                          </div>
                        </div>
                      </div>
                    )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No compliance insights available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Non-Compliant Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Non-Compliant Documentation</CardTitle>
                <CardDescription>
                  Documents requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dohComplianceData?.nonCompliantDocuments
                    .slice(0, 10)
                    .map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getPriorityColor(doc.severity)}>
                              {doc.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium">
                              {doc.document_type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.issue_description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Clinician: {doc.clinician}</span>
                            {doc.patient_id && (
                              <span>Patient: {doc.patient_id}</span>
                            )}
                            <span>
                              Identified:{" "}
                              {new Date(
                                doc.date_identified,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {doc.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No non-compliant documents found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QualityAssuranceDashboard;
