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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Send,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Users,
  Target,
  Zap,
  RefreshCw,
  Bell,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Award,
  Gauge,
  Star,
  Brain,
  Zap,
  Heart,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jawdaKPICalculationService, {
  JAWDAKPICalculationResult,
  PatientSatisfactionData,
  QualityImprovementWorkflow,
} from "@/services/jawda-kpi-calculation.service";
import predictiveRiskAssessmentService, {
  PatientRiskProfile,
  RiskAssessmentAnalytics,
  SafetyEventClassification,
} from "@/services/predictive-risk-assessment.service";
import realTimeSafetyAlertService, {
  SafetyAlert,
  SafetyAlertAnalytics,
} from "@/services/real-time-safety-alert.service";

interface DOHAutomatedReportingDashboardProps {
  className?: string;
}

interface DOHReport {
  id: string;
  reportType:
    | "monthly"
    | "quarterly"
    | "annual"
    | "incident"
    | "audit"
    | "compliance";
  title: string;
  generatedAt: string;
  submissionStatus:
    | "draft"
    | "pending_review"
    | "approved"
    | "submitted"
    | "acknowledged"
    | "rejected";
  dohReference?: string;
  nextReportDue: string;
  priority?: "low" | "medium" | "high" | "critical";
}

interface ReportSchedule {
  id: string;
  reportType: string;
  frequency: "monthly" | "quarterly" | "annually";
  nextDueDate: string;
  autoGenerate: boolean;
  recipients: string[];
  isActive: boolean;
}

interface ReportingMetrics {
  totalReports: number;
  submittedReports: number;
  pendingReports: number;
  rejectedReports: number;
  averageProcessingTime: number;
  complianceRate: number;
  lastReportGenerated: string | null;
}

const DOHAutomatedReportingDashboard: React.FC<
  DOHAutomatedReportingDashboardProps
> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReportType, setSelectedReportType] = useState("monthly");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [jawdaKPIs, setJawdaKPIs] = useState<JAWDAKPICalculationResult | null>(
    null,
  );
  const [patientSatisfaction, setPatientSatisfaction] = useState<
    PatientSatisfactionData[]
  >([]);
  const [qualityWorkflows, setQualityWorkflows] = useState<
    QualityImprovementWorkflow[]
  >([]);
  const [riskAssessmentData, setRiskAssessmentData] =
    useState<RiskAssessmentAnalytics | null>(null);
  const [highRiskPatients, setHighRiskPatients] = useState<
    PatientRiskProfile[]
  >([]);
  const [recentSafetyEvents, setRecentSafetyEvents] = useState<
    SafetyEventClassification[]
  >([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [safetyAlertAnalytics, setSafetyAlertAnalytics] =
    useState<SafetyAlertAnalytics | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<SafetyAlert[]>([]);

  // Mock data - in production, this would come from the service
  const [reportingMetrics, setReportingMetrics] = useState<ReportingMetrics>({
    totalReports: 156,
    submittedReports: 142,
    pendingReports: 8,
    rejectedReports: 6,
    averageProcessingTime: 24,
    complianceRate: 91.0,
    lastReportGenerated: new Date().toISOString(),
  });

  const [recentReports, setRecentReports] = useState<DOHReport[]>([
    {
      id: "DOH-RPT-001",
      reportType: "monthly",
      title: "DOH Monthly Compliance Report - November 2024",
      generatedAt: "2024-11-15T10:30:00Z",
      submissionStatus: "submitted",
      dohReference: "DOH-2024-NOV-001",
      nextReportDue: "2024-12-01T00:00:00Z",
    },
    {
      id: "DOH-RPT-002",
      reportType: "incident",
      title: "DOH Incident Report - Critical Safety Event",
      generatedAt: "2024-11-14T15:45:00Z",
      submissionStatus: "pending_review",
      nextReportDue: "2024-11-16T00:00:00Z",
      priority: "critical",
    },
    {
      id: "DOH-RPT-003",
      reportType: "quarterly",
      title: "DOH Quarterly Compliance Report - Q4 2024",
      generatedAt: "2024-11-10T09:15:00Z",
      submissionStatus: "draft",
      nextReportDue: "2024-12-31T00:00:00Z",
    },
  ]);

  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([
    {
      id: "SCHED-001",
      reportType: "monthly",
      frequency: "monthly",
      nextDueDate: "2024-12-01T00:00:00Z",
      autoGenerate: true,
      recipients: ["compliance@reyadahomecare.ae", "admin@reyadahomecare.ae"],
      isActive: true,
    },
    {
      id: "SCHED-002",
      reportType: "quarterly",
      frequency: "quarterly",
      nextDueDate: "2024-12-31T00:00:00Z",
      autoGenerate: true,
      recipients: ["compliance@reyadahomecare.ae"],
      isActive: true,
    },
  ]);

  const complianceTrendData = [
    { date: "2024-07", score: 88.5 },
    { date: "2024-08", score: 90.2 },
    { date: "2024-09", score: 89.8 },
    { date: "2024-10", score: 91.5 },
    { date: "2024-11", score: 93.2 },
  ];

  const reportTypeDistribution = [
    { name: "Monthly", value: 45, color: "#3b82f6" },
    { name: "Quarterly", value: 25, color: "#10b981" },
    { name: "Annual", value: 15, color: "#f59e0b" },
    { name: "Incident", value: 10, color: "#ef4444" },
    { name: "Audit", value: 5, color: "#8b5cf6" },
  ];

  const submissionStatusData = [
    { status: "Submitted", count: 142, color: "#10b981" },
    { status: "Pending", count: 8, color: "#f59e0b" },
    { status: "Draft", count: 4, color: "#6b7280" },
    { status: "Rejected", count: 2, color: "#ef4444" },
  ];

  // JAWDA KPI Integration
  useEffect(() => {
    const initializeJAWDAIntegration = async () => {
      try {
        // Load initial JAWDA KPI data
        const kpis = await jawdaKPICalculationService.getLatestKPIs();
        if (kpis) setJawdaKPIs(kpis);

        // Load patient satisfaction data
        const satisfaction =
          await jawdaKPICalculationService.getPatientSatisfactionData();
        setPatientSatisfaction(satisfaction);

        // Load quality workflows
        const workflows =
          await jawdaKPICalculationService.getQualityWorkflows();
        setQualityWorkflows(workflows);

        // Set up real-time listeners
        jawdaKPICalculationService.on(
          "kpi:calculated",
          (result: JAWDAKPICalculationResult) => {
            setJawdaKPIs(result);
          },
        );

        jawdaKPICalculationService.on(
          "satisfaction:survey-completed",
          (data: PatientSatisfactionData) => {
            setPatientSatisfaction((prev) => [...prev.slice(-99), data]);
          },
        );

        jawdaKPICalculationService.on(
          "workflow:created",
          (workflow: QualityImprovementWorkflow) => {
            setQualityWorkflows((prev) => [...prev, workflow]);
          },
        );

        // Initialize Risk Assessment Integration
        const riskAnalytics =
          await predictiveRiskAssessmentService.getRiskAssessmentAnalytics();
        setRiskAssessmentData(riskAnalytics);

        const highRisk = predictiveRiskAssessmentService.getHighRiskPatients();
        setHighRiskPatients(highRisk);

        // Set up risk assessment listeners
        predictiveRiskAssessmentService.on(
          "risk:high-risk-detected",
          (profile: PatientRiskProfile) => {
            setHighRiskPatients((prev) => {
              const updated = prev.filter(
                (p) => p.patientId !== profile.patientId,
              );
              return [profile, ...updated].slice(0, 10);
            });
          },
        );

        predictiveRiskAssessmentService.on(
          "safety-event:classified",
          (event: SafetyEventClassification) => {
            setRecentSafetyEvents((prev) => [event, ...prev.slice(0, 9)]);
          },
        );

        // Initialize Real-Time Safety Alert Integration
        const activeAlerts = realTimeSafetyAlertService.getActiveAlerts();
        setSafetyAlerts(activeAlerts);

        const criticalAlertsData =
          realTimeSafetyAlertService.getCriticalAlerts();
        setCriticalAlerts(criticalAlertsData);

        const alertAnalytics =
          await realTimeSafetyAlertService.getSafetyAlertAnalytics();
        setSafetyAlertAnalytics(alertAnalytics);

        // Set up real-time alert listeners
        realTimeSafetyAlertService.on("alert:created", (alert: SafetyAlert) => {
          setSafetyAlerts((prev) => [alert, ...prev]);
          if (
            alert.severity === "critical" ||
            alert.priority === "emergency" ||
            alert.priority === "immediate"
          ) {
            setCriticalAlerts((prev) => [alert, ...prev]);
          }
        });

        realTimeSafetyAlertService.on(
          "alert:acknowledged",
          (alert: SafetyAlert) => {
            setSafetyAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? alert : a)),
            );
            setCriticalAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? alert : a)),
            );
          },
        );

        realTimeSafetyAlertService.on(
          "alert:resolved",
          (alert: SafetyAlert) => {
            setSafetyAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? alert : a)),
            );
            setCriticalAlerts((prev) => prev.filter((a) => a.id !== alert.id));
          },
        );

        realTimeSafetyAlertService.on(
          "alert:escalated",
          (alert: SafetyAlert) => {
            setSafetyAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? alert : a)),
            );
            setCriticalAlerts((prev) =>
              prev.map((a) => (a.id === alert.id ? alert : a)),
            );
          },
        );

        console.log(
          "✅ JAWDA KPI, Risk Assessment, and Safety Alert integration initialized",
        );
      } catch (error) {
        console.error("❌ Failed to initialize JAWDA integration:", error);
      }
    };

    initializeJAWDAIntegration();

    return () => {
      jawdaKPICalculationService.removeAllListeners();
      predictiveRiskAssessmentService.removeAllListeners();
      realTimeSafetyAlertService.removeAllListeners();
    };
  }, []);

  const performanceMetrics = {
    reportGenerationTime: 24,
    submissionSuccessRate: 95.8,
    complianceRate: 91.0,
    automationEfficiency: 97.2,
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Generating report:", selectedReportType);
      // In production: await dohAutomatedReportingService.generateDOHReport(selectedReportType);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
      setShowReportDialog(false);
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Submitting report:", reportId);
      // In production: await dohAutomatedReportingService.submitReportToDOH(reportId);

      // Update report status
      setRecentReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                submissionStatus: "submitted" as const,
                dohReference: `DOH-${Date.now()}`,
              }
            : report,
        ),
      );
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Scheduling report");
      // In production: await dohAutomatedReportingService.scheduleReport(scheduleData);
    } catch (error) {
      console.error("Error scheduling report:", error);
    } finally {
      setLoading(false);
      setShowScheduleDialog(false);
    }
  };

  const getStatusBadge = (status: string, priority?: string) => {
    const statusConfig = {
      submitted: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      rejected: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      acknowledged: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} flex items-center gap-1`}>
          <Icon className="h-3 w-3" />
          {status.replace("_", " ").toUpperCase()}
        </Badge>
        {priority && (
          <Badge
            className={`${
              priority === "critical"
                ? "bg-red-100 text-red-800"
                : priority === "high"
                  ? "bg-orange-100 text-orange-800"
                  : priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {priority.toUpperCase()}
          </Badge>
        )}
      </div>
    );
  };

  const filteredReports = recentReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || report.submissionStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`space-y-6 p-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            DOH Automated Reporting
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive compliance reporting and submission management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowReportDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportingMetrics.totalReports}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportingMetrics.complianceRate}%
            </div>
            <Progress
              value={reportingMetrics.complianceRate}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reports
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportingMetrics.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportingMetrics.pendingReports > 5
                ? "Attention needed"
                : "On track"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Automation Efficiency
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.automationEfficiency}%
            </div>
            <Progress
              value={performanceMetrics.automationEfficiency}
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jawda-kpis">JAWDA KPIs</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="safety-alerts">Safety Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Compliance Trends
                </CardTitle>
                <CardDescription>
                  Monthly compliance score progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={complianceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Report Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Report Distribution
                </CardTitle>
                <CardDescription>Distribution by report type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reportTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {reportTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-gray-600">
                          Generated{" "}
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(report.submissionStatus, report.priority)}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JAWDA KPIs Tab */}
        <TabsContent value="jawda-kpis" className="space-y-6">
          {/* JAWDA KPI Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  JAWDA Overall Performance
                </CardTitle>
                <CardDescription>
                  Real-time JAWDA KPI calculation and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jawdaKPIs ? (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {jawdaKPIs.overallScore.toFixed(1)}%
                      </div>
                      <div className="text-lg text-gray-600 mb-4">
                        Overall JAWDA Score
                      </div>
                      <Progress
                        value={jawdaKPIs.overallScore}
                        className="h-3"
                      />
                    </div>

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(jawdaKPIs.categoryScores).map(
                        ([category, scores]) => {
                          const avgScore =
                            Object.values(scores).reduce(
                              (sum, score) => sum + score,
                              0,
                            ) / Object.values(scores).length;
                          return (
                            <div
                              key={category}
                              className="p-3 border rounded-lg"
                            >
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                {category
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </div>
                              <div className="text-xl font-bold text-blue-600">
                                {avgScore.toFixed(1)}%
                              </div>
                              <Progress value={avgScore} className="h-2 mt-1" />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading JAWDA KPI data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Patient Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {patientSatisfaction.length > 0
                      ? (
                          (patientSatisfaction.reduce(
                            (sum, s) => sum + s.ratings.overallSatisfaction,
                            0,
                          ) /
                            patientSatisfaction.length) *
                          20
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Based on {patientSatisfaction.length} surveys
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Quality Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      qualityWorkflows.filter((w) => w.status === "active")
                        .length
                    }
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Active improvement initiatives
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {jawdaKPIs && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>National:</span>
                        <span className="font-medium">
                          {jawdaKPIs.benchmarks.national}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Regional:</span>
                        <span className="font-medium">
                          {jawdaKPIs.benchmarks.regional}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Peer Group:</span>
                        <span className="font-medium">
                          {jawdaKPIs.benchmarks.peerGroup}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* JAWDA Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                JAWDA Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jawdaKPIs && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={jawdaKPIs.trends.monthly.map((score, index) => ({
                      month: `Month ${index + 1}`,
                      score,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quality Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jawdaKPIs && jawdaKPIs.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {jawdaKPIs.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.description}</h4>
                        <Badge
                          className={`${
                            rec.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : rec.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Category:{" "}
                        {rec.category.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </div>
                      <div className="space-y-1">
                        {rec.actionItems.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="text-sm text-gray-700 flex items-center gap-2"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-blue-600">
                        Expected Impact: +{rec.expectedImpact}% improvement
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    All KPIs are performing well. No recommendations at this
                    time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Quality Improvement Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qualityWorkflows.length > 0 ? (
                <div className="space-y-4">
                  {qualityWorkflows
                    .filter((w) => w.status === "active")
                    .map((workflow) => (
                      <div
                        key={workflow.workflowId}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{workflow.title}</h4>
                          <Badge
                            className={`${
                              workflow.priority === "critical"
                                ? "bg-red-100 text-red-800"
                                : workflow.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : workflow.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {workflow.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {workflow.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-500">
                              Current KPI:
                            </span>
                            <span className="ml-2 font-medium">
                              {workflow.currentKPI}%
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Target KPI:
                            </span>
                            <span className="ml-2 font-medium">
                              {workflow.targetKPI}%
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm text-gray-500 mb-1">
                            Progress:
                          </div>
                          <Progress
                            value={
                              (workflow.milestones.filter(
                                (m) => m.status === "completed",
                              ).length /
                                workflow.milestones.length) *
                              100
                            }
                            className="h-2"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {
                              workflow.milestones.filter(
                                (m) => m.status === "completed",
                              ).length
                            }{" "}
                            of {workflow.milestones.length} milestones completed
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          Timeline: {workflow.timeline}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No active quality improvement workflows
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk-assessment" className="space-y-6">
          {/* Risk Assessment Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Predictive Risk Assessment Integration
                </CardTitle>
                <CardDescription>
                  AI-powered patient risk prediction and intervention planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        High-Risk Patients
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {highRiskPatients.length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Requiring immediate intervention
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Risk Assessments Today
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {riskAssessmentData?.totalAssessments || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Automated assessments completed
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Fall Risk Predictions
                      </span>
                      <span className="text-sm text-gray-600">
                        {riskAssessmentData?.predictionAccuracy.fallRisk || 87}%
                        accuracy
                      </span>
                    </div>
                    <Progress
                      value={
                        riskAssessmentData?.predictionAccuracy.fallRisk || 87
                      }
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Medication Risk Analysis
                      </span>
                      <span className="text-sm text-gray-600">
                        {riskAssessmentData?.predictionAccuracy
                          .medicationRisk || 82}
                        % accuracy
                      </span>
                    </div>
                    <Progress
                      value={
                        riskAssessmentData?.predictionAccuracy.medicationRisk ||
                        82
                      }
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Clinical Deterioration
                      </span>
                      <span className="text-sm text-gray-600">
                        {riskAssessmentData?.predictionAccuracy
                          .deteriorationRisk || 91}
                        % accuracy
                      </span>
                    </div>
                    <Progress
                      value={
                        riskAssessmentData?.predictionAccuracy
                          .deteriorationRisk || 91
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Critical Risk Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {highRiskPatients.slice(0, 3).map((patient, index) => {
                      const colors = [
                        {
                          border: "border-l-red-500",
                          bg: "bg-red-50",
                          text: "text-red-600",
                        },
                        {
                          border: "border-l-orange-500",
                          bg: "bg-orange-50",
                          text: "text-orange-600",
                        },
                        {
                          border: "border-l-yellow-500",
                          bg: "bg-yellow-50",
                          text: "text-yellow-600",
                        },
                      ];
                      const color = colors[index] || colors[0];

                      return (
                        <div
                          key={patient.patientId}
                          className={`p-3 border-l-4 ${color.border} ${color.bg} rounded`}
                        >
                          <div className="text-sm font-medium">
                            {patient.patientId}
                          </div>
                          <div className="text-xs text-gray-600">
                            Risk score: {patient.overallRiskScore}%
                          </div>
                          <div className={`text-xs ${color.text} mt-1`}>
                            {patient.interventionPriority === "emergency"
                              ? "Immediate intervention required"
                              : patient.interventionPriority === "immediate"
                                ? "Review needed within 24h"
                                : "Monitor closely"}
                          </div>
                        </div>
                      );
                    })}
                    {highRiskPatients.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No critical risk alerts at this time
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    DOH Compliance Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patient Safety Domain</span>
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Management</span>
                      <span className="font-medium text-green-600">88%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Clinical Governance</span>
                      <span className="font-medium text-yellow-600">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* High-Risk Patients Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                High-Risk Patients Requiring Attention
              </CardTitle>
              <CardDescription>
                Patients identified by AI algorithms as requiring immediate or
                urgent intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highRiskPatients.length > 0 ? (
                <div className="space-y-4">
                  {highRiskPatients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.patientId}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold">
                            {patient.patientId}
                          </div>
                          <Badge
                            className={`${
                              patient.riskLevel === "critical"
                                ? "bg-red-100 text-red-800"
                                : patient.riskLevel === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {patient.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <Badge
                            className={`${
                              patient.interventionPriority === "emergency"
                                ? "bg-red-100 text-red-800"
                                : patient.interventionPriority === "immediate"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {patient.interventionPriority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {patient.overallRiskScore}%
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Fall Risk
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={patient.fallRiskAssessment.overallScore}
                              className="h-2 flex-1"
                            />
                            <span className="text-sm font-medium">
                              {patient.fallRiskAssessment.overallScore}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Deterioration Risk
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={
                                patient.deteriorationRisk.earlyWarningScore * 10
                              }
                              className="h-2 flex-1"
                            />
                            <span className="text-sm font-medium">
                              EWS: {patient.deteriorationRisk.earlyWarningScore}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Medication Risks
                          </div>
                          <div className="text-sm font-medium">
                            {patient.medicationRisks.length} identified
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-2">
                          Top Risk Factors:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {patient.riskFactors
                            .slice(0, 3)
                            .map((factor, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {factor.factor}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Next assessment due:{" "}
                          {new Date(
                            patient.nextAssessmentDue,
                          ).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Intervene
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No high-risk patients identified at this time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Assessment Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Assessment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessmentData && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={riskAssessmentData.trendAnalysis.riskTrends}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="riskScore"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessmentData && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          level: "Low",
                          count: riskAssessmentData.riskDistribution.low,
                          color: "#10b981",
                        },
                        {
                          level: "Medium",
                          count: riskAssessmentData.riskDistribution.medium,
                          color: "#f59e0b",
                        },
                        {
                          level: "High",
                          count: riskAssessmentData.riskDistribution.high,
                          color: "#f97316",
                        },
                        {
                          level: "Critical",
                          count: riskAssessmentData.riskDistribution.critical,
                          color: "#ef4444",
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={(entry) => entry.color} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Generated Intervention Recommendations
              </CardTitle>
              <CardDescription>
                Automated recommendations based on risk assessment algorithms
                and clinical best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600">
                        Emergency (
                        {
                          highRiskPatients.filter(
                            (p) => p.interventionPriority === "emergency",
                          ).length
                        }
                        )
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {highRiskPatients
                        .filter((p) => p.interventionPriority === "emergency")
                        .slice(0, 3)
                        .map((patient, index) => (
                          <li key={index}>
                            • {patient.patientId}:{" "}
                            {patient.recommendedActions[0]?.action ||
                              "Immediate assessment"}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-orange-600">
                        Immediate (
                        {
                          highRiskPatients.filter(
                            (p) => p.interventionPriority === "immediate",
                          ).length
                        }
                        )
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {highRiskPatients
                        .filter((p) => p.interventionPriority === "immediate")
                        .slice(0, 3)
                        .map((patient, index) => (
                          <li key={index}>
                            • {patient.patientId}:{" "}
                            {patient.recommendedActions[0]?.action ||
                              "Clinical review"}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-blue-600">
                        Urgent (
                        {
                          highRiskPatients.filter(
                            (p) => p.interventionPriority === "urgent",
                          ).length
                        }
                        )
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {highRiskPatients
                        .filter((p) => p.interventionPriority === "urgent")
                        .slice(0, 3)
                        .map((patient, index) => (
                          <li key={index}>
                            • {patient.patientId}:{" "}
                            {patient.recommendedActions[0]?.action ||
                              "Scheduled assessment"}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Run Batch Assessment
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Risk Report
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure AI Models
                  </Button>
                  <Button variant="outline">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Alerts Tab */}
        <TabsContent value="safety-alerts" className="space-y-6">
          {/* Safety Alert Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Alerts
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    safetyAlerts.filter((a) =>
                      [
                        "active",
                        "acknowledged",
                        "in_progress",
                        "escalated",
                      ].includes(a.status),
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {criticalAlerts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Immediate action needed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {safetyAlertAnalytics?.averageResponseTime || 0}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolution Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {safetyAlertAnalytics?.resolutionRate || 0}%
                </div>
                <Progress
                  value={safetyAlertAnalytics?.resolutionRate || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical Safety Alerts
              </CardTitle>
              <CardDescription>
                High-priority alerts requiring immediate attention and
                intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {criticalAlerts.length > 0 ? (
                <div className="space-y-4">
                  {criticalAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4 bg-red-50 border-red-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-red-800">
                            {alert.title}
                          </div>
                          <Badge
                            className={`${
                              alert.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : alert.severity === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge
                            className={`${
                              alert.priority === "emergency"
                                ? "bg-red-100 text-red-800"
                                : alert.priority === "immediate"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <Badge
                            className={`${
                              alert.status === "active"
                                ? "bg-red-100 text-red-800"
                                : alert.status === "acknowledged"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : alert.status === "escalated"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {alert.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-700 mb-2">
                          {alert.description}
                        </p>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Patient:</span>{" "}
                          {alert.patientId} |
                          <span className="font-medium ml-2">Source:</span>{" "}
                          {alert.triggerSource.replace("_", " ")} |
                          <span className="font-medium ml-2">
                            Escalation Level:
                          </span>{" "}
                          {alert.escalationLevel.replace("_", " ")}
                        </div>
                      </div>

                      {alert.complianceImpact && (
                        <div className="mb-3 p-2 bg-blue-50 rounded border">
                          <div className="text-sm font-medium text-blue-800 mb-1">
                            DOH Compliance Impact
                          </div>
                          <div className="text-sm text-blue-700">
                            <span className="font-medium">Domain:</span>{" "}
                            {alert.complianceImpact.jawdaDomain} |
                            <span className="font-medium ml-2">
                              Risk Level:
                            </span>{" "}
                            {alert.complianceImpact.complianceRisk} |
                            <span className="font-medium ml-2">
                              Reporting Required:
                            </span>{" "}
                            {alert.complianceImpact.reportingRequired
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          Assigned to:{" "}
                          {alert.assignedTo.length > 0
                            ? alert.assignedTo.join(", ")
                            : "Unassigned"}
                          {alert.acknowledgedBy.length > 0 && (
                            <span className="ml-2 text-green-600">
                              • Acknowledged by {alert.acknowledgedBy.length}{" "}
                              user(s)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.status === "active" && (
                            <Button
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {(alert.status === "acknowledged" ||
                            alert.status === "in_progress") && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {alert.escalationLevel !== "executive" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200"
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Escalate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No critical safety alerts at this time
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    All systems operating normally
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                All Active Safety Alerts
              </CardTitle>
              <CardDescription>
                Complete list of active safety alerts across all severity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safetyAlerts.filter((a) =>
                ["active", "acknowledged", "in_progress", "escalated"].includes(
                  a.status,
                ),
              ).length > 0 ? (
                <div className="space-y-3">
                  {safetyAlerts
                    .filter((a) =>
                      [
                        "active",
                        "acknowledged",
                        "in_progress",
                        "escalated",
                      ].includes(a.status),
                    )
                    .slice(0, 10)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                alert.severity === "critical"
                                  ? "bg-red-500"
                                  : alert.severity === "high"
                                    ? "bg-orange-500"
                                    : alert.severity === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{alert.title}</div>
                              <div className="text-sm text-gray-600">
                                {alert.alertType.replace("_", " ")} • Patient:{" "}
                                {alert.patientId} •
                                {new Date(alert.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${
                                alert.status === "active"
                                  ? "bg-red-100 text-red-800"
                                  : alert.status === "acknowledged"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : alert.status === "escalated"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {alert.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active safety alerts</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety Alert Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Alert Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safetyAlertAnalytics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(
                        safetyAlertAnalytics.alertsByType,
                      ).map(([type, count]) => ({
                        type: type.replace("_", " "),
                        count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="type"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Alert Response Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safetyAlertAnalytics && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={safetyAlertAnalytics.trendAnalysis.slice(-7)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="totalAlerts"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Total Alerts"
                      />
                      <Line
                        type="monotone"
                        dataKey="criticalAlerts"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Critical Alerts"
                      />
                      <Line
                        type="monotone"
                        dataKey="resolvedAlerts"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Resolved Alerts"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Safety Alert Performance Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators for the real-time safety alert system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safetyAlertAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {
                        safetyAlertAnalytics.complianceMetrics
                          .timelyAcknowledgment
                      }
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      Timely Acknowledgment
                    </div>
                    <Progress
                      value={
                        safetyAlertAnalytics.complianceMetrics
                          .timelyAcknowledgment
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {safetyAlertAnalytics.complianceMetrics.timelyResolution}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Timely Resolution
                    </div>
                    <Progress
                      value={
                        safetyAlertAnalytics.complianceMetrics.timelyResolution
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {safetyAlertAnalytics.escalationRate}%
                    </div>
                    <div className="text-sm text-gray-600">Escalation Rate</div>
                    <Progress
                      value={safetyAlertAnalytics.escalationRate}
                      className="mt-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {safetyAlertAnalytics.performanceMetrics.alertAccuracy}%
                    </div>
                    <div className="text-sm text-gray-600">Alert Accuracy</div>
                    <Progress
                      value={
                        safetyAlertAnalytics.performanceMetrics.alertAccuracy
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Safety Alert Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manual Alert
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Alert Report
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alert Rules
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Alerts
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter & Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending_review">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Reports Management</CardTitle>
              <CardDescription>
                Manage and track all DOH compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Type: {report.reportType}</span>
                          <span>
                            Generated:{" "}
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </span>
                          {report.dohReference && (
                            <span>DOH Ref: {report.dohReference}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(report.submissionStatus, report.priority)}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        {report.submissionStatus === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReport(report.id)}
                            disabled={loading}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Schedules</CardTitle>
              <CardDescription>
                Manage automated report generation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">
                          {schedule.reportType} Report
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Frequency: {schedule.frequency}</span>
                          <span>
                            Next Due:{" "}
                            {new Date(
                              schedule.nextDueDate,
                            ).toLocaleDateString()}
                          </span>
                          <span>Recipients: {schedule.recipients.length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          schedule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {schedule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch checked={schedule.autoGenerate} />
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Report Generation Time</span>
                  <span className="font-medium">
                    {performanceMetrics.reportGenerationTime}h avg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Submission Success Rate</span>
                  <span className="font-medium">
                    {performanceMetrics.submissionSuccessRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Compliance Rate</span>
                  <span className="font-medium">
                    {performanceMetrics.complianceRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Automation Efficiency</span>
                  <span className="font-medium">
                    {performanceMetrics.automationEfficiency}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Submission Status */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={submissionStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Configuration</CardTitle>
              <CardDescription>
                Configure automated reporting settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="facility-name">Facility Name</Label>
                    <Input
                      id="facility-name"
                      defaultValue="Reyada Home Healthcare Services"
                    />
                  </div>
                  <div>
                    <Label htmlFor="license-number">DOH License Number</Label>
                    <Input
                      id="license-number"
                      defaultValue="DOH-HHC-2024-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      defaultValue="compliance@reyadahomecare.ae"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-frequency">
                      Default Report Frequency
                    </Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-submit">
                      Auto-submit approved reports
                    </Label>
                    <Switch id="auto-submit" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">
                      Email notifications
                    </Label>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Select the type of report to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={selectedReportType}
                  onValueChange={setSelectedReportType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Compliance</SelectItem>
                    <SelectItem value="quarterly">Quarterly Review</SelectItem>
                    <SelectItem value="annual">Annual Report</SelectItem>
                    <SelectItem value="incident">Incident Report</SelectItem>
                    <SelectItem value="audit">Audit Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Report Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule Report</CardTitle>
              <CardDescription>
                Set up automated report generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="schedule-type">Report Type</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Textarea
                  id="recipients"
                  placeholder="Enter email addresses, one per line"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-generate">Auto-generate</Label>
                <Switch id="auto-generate" defaultChecked />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleScheduleReport} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DOHAutomatedReportingDashboard;
