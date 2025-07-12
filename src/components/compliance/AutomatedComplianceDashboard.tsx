import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  TrendingUp,
  Calendar,
  Activity,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Zap,
  Target,
  BarChart3,
  Users,
  Database,
} from "lucide-react";

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: "excellent" | "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  category: string;
}

interface ComplianceAlert {
  id: string;
  type: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  actionRequired: boolean;
  assignedTo?: string;
  dueDate?: string;
}

interface AutomatedComplianceData {
  jawdaKPIs: {
    overallScore: number;
    complianceStatus: string;
    kpiResults: ComplianceMetric[];
    lastUpdate: string;
    alerts: string[];
    monthlyTrend: number[];
    benchmarkComparison: number;
  };
  regulatoryReporting: {
    totalReports: number;
    upcomingDeadlines: any[];
    recentReports: any[];
    reportsByType: Record<string, number>;
    automationRate: number;
    accuracyRate: number;
  };
  auditTrail: {
    totalEvents: number;
    criticalEvents: number;
    complianceEvents: number;
    recentAlerts: ComplianceAlert[];
    riskScore: number;
    complianceGaps: number;
  };
  realTimeStatus: {
    systemHealth: string;
    lastCheck: string;
    activeMonitoring: boolean;
    automationStatus: string;
    dataQuality: number;
    integrationStatus: Record<string, boolean>;
  };
  predictiveAnalytics: {
    riskPredictions: any[];
    complianceForecast: number[];
    recommendedActions: string[];
    costSavings: number;
  };
}

const AutomatedComplianceDashboard: React.FC = () => {
  const [complianceData, setComplianceData] =
    useState<AutomatedComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeAlerts, setRealTimeAlerts] = useState<ComplianceAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  useEffect(() => {
    loadAutomatedComplianceData();

    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAutomatedComplianceData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const filteredAlerts = realTimeAlerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || alert.type === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getMetricIcon = (category: string) => {
    switch (category) {
      case "Safety":
        return <Shield className="h-4 w-4" />;
      case "Quality":
        return <Target className="h-4 w-4" />;
      case "Compliance":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const loadAutomatedComplianceData = async () => {
    try {
      setLoading(true);

      // Import DOH Compliance Enhancement APIs
      const { getComplianceMonitoringDashboard, getAutomatedReportingStatus } =
        await import("@/api/reporting.api");
      const { dohAuditAPI } = await import("@/api/doh-audit.api");

      // Get real-time compliance monitoring data
      const complianceMonitoringData = await getComplianceMonitoringDashboard();

      // Get automated reporting status
      const reportingData = await getAutomatedReportingStatus();

      // Get real-time monitoring status
      const realTimeMonitoring = dohAuditAPI.startRealTimeMonitoring();

      // Get training compliance status
      const trainingStatus = dohAuditAPI.trackStaffTrainingCompliance();

      // Get audit trail data with risk assessment
      const auditLogs = JSON.parse(
        localStorage.getItem("compliance_audit_logs") || "[]",
      );
      const complianceAlerts = JSON.parse(
        localStorage.getItem("compliance_alerts") || "[]",
      );

      // Generate mock enhanced metrics
      const enhancedKPIs: ComplianceMetric[] = [
        {
          id: "patient-safety",
          name: "Patient Safety Score",
          value: 94,
          target: 95,
          status: "good",
          trend: "up",
          lastUpdated: new Date().toISOString(),
          category: "Safety",
        },
        {
          id: "documentation-quality",
          name: "Documentation Quality",
          value: 89,
          target: 90,
          status: "warning",
          trend: "stable",
          lastUpdated: new Date().toISOString(),
          category: "Quality",
        },
        {
          id: "regulatory-compliance",
          name: "Regulatory Compliance",
          value: 97,
          target: 95,
          status: "excellent",
          trend: "up",
          lastUpdated: new Date().toISOString(),
          category: "Compliance",
        },
      ];

      // Generate enhanced alerts
      const enhancedAlerts: ComplianceAlert[] = [
        {
          id: "alert-1",
          type: "high",
          title: "Documentation Gap Detected",
          description: "Missing clinical assessments for 3 patients",
          timestamp: new Date().toISOString(),
          source: "Clinical Documentation System",
          actionRequired: true,
          assignedTo: "Clinical Team",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "alert-2",
          type: "medium",
          title: "License Renewal Due",
          description: "2 clinician licenses expire within 30 days",
          timestamp: new Date().toISOString(),
          source: "License Management",
          actionRequired: true,
          assignedTo: "HR Department",
        },
      ];

      const auditTrailData = {
        totalEvents: auditLogs.length,
        criticalEvents: auditLogs.filter(
          (log: any) => log.severity === "critical",
        ).length,
        complianceEvents: auditLogs.filter(
          (log: any) => log.complianceCategory !== "general",
        ).length,
        recentAlerts: complianceAlerts.slice(-10),
      };

      setComplianceData({
        jawdaKPIs: {
          overallScore:
            complianceMonitoringData.overview.overall_compliance_score,
          complianceStatus: "meeting_target",
          kpiResults: enhancedKPIs,
          lastUpdate: complianceMonitoringData.overview.last_check,
          alerts: complianceMonitoringData.real_time_alerts.map(
            (alert) => alert.message,
          ),
          monthlyTrend: complianceMonitoringData.compliance_trends.daily_scores,
          benchmarkComparison: 88, // Industry benchmark
        },
        regulatoryReporting: {
          totalReports: reportingData.total_automated_reports,
          upcomingDeadlines: reportingData.upcoming_deadlines,
          recentReports: complianceMonitoringData.recent_reports,
          reportsByType: reportingData.reports_by_type,
          automationRate: reportingData.automation_rate,
          accuracyRate: reportingData.compliance_rate,
        },
        auditTrail: {
          ...auditTrailData,
          riskScore: 23, // Lower is better (0-100)
          complianceGaps: 5, // Number of identified gaps
        },
        realTimeStatus: {
          systemHealth: complianceMonitoringData.overview.monitoring_health,
          lastCheck: complianceMonitoringData.overview.last_check,
          activeMonitoring: realTimeMonitoring.status === "active",
          automationStatus: "active",
          dataQuality: 94, // Data quality score
          integrationStatus: {
            "DOH Systems": true,
            "Daman Integration": true,
            "MALAFFI EMR": true,
            "Tawteen Platform": true,
            "Real-time Monitoring": realTimeMonitoring.status === "active",
          },
        },
        predictiveAnalytics: {
          riskPredictions: [
            {
              risk: "Training Compliance Gap",
              probability:
                (100 -
                  trainingStatus.training_summary.training_completion_rate) /
                100,
              impact: "Medium",
            },
            {
              risk: "Certification Expiry",
              probability:
                trainingStatus.certification_tracking.expiring_within_30_days /
                trainingStatus.certification_tracking.active_certifications,
              impact: "High",
            },
            { risk: "Audit Findings", probability: 0.08, impact: "Critical" },
          ],
          complianceForecast: [92, 93, 94, 95, 96], // Next 5 months forecast
          recommendedActions: [
            "Complete remaining staff training sessions",
            "Implement automated certification renewal reminders",
            "Enhance real-time compliance monitoring",
            "Prepare for upcoming regulatory changes",
          ],
          costSavings: 125000, // Annual cost savings from automation
        },
      });

      // Set enhanced alerts
      setRealTimeAlerts(enhancedAlerts);
    } catch (error) {
      console.error("Failed to load automated compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "meeting_target":
      case "operational":
      case "active":
        return "bg-green-100 text-green-800";
      case "needs_improvement":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "meeting_target":
      case "operational":
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "needs_improvement":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading automated compliance data...</p>
        </div>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load compliance data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Automated Compliance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time DOH compliance monitoring and automated reporting
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceData.realTimeStatus.automationStatus)}
                <Badge
                  className={getStatusColor(
                    complianceData.realTimeStatus.automationStatus,
                  )}
                >
                  {complianceData.realTimeStatus.automationStatus}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                Last updated:{" "}
                {new Date(
                  complianceData.realTimeStatus.lastCheck,
                ).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts, metrics, reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 border-green-200" : ""}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
                />
                Auto Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Real-time Alerts */}
        {filteredAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Active Alerts ({filteredAlerts.length})
              </h3>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            {filteredAlerts.slice(0, 5).map((alert) => (
              <Alert
                key={alert.id}
                className={`border-l-4 ${
                  alert.type === "critical"
                    ? "border-l-red-500 bg-red-50"
                    : alert.type === "high"
                      ? "border-l-orange-500 bg-orange-50"
                      : alert.type === "medium"
                        ? "border-l-yellow-500 bg-yellow-50"
                        : "border-l-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={`compliance-${alert.type}`}>
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{alert.title}</span>
                    </div>
                    <AlertDescription className="text-sm">
                      {alert.description}
                    </AlertDescription>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Source: {alert.source}</span>
                      <span>
                        Time: {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      {alert.assignedTo && (
                        <span>Assigned: {alert.assignedTo}</span>
                      )}
                    </div>
                  </div>
                  {alert.actionRequired && (
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Enhanced Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="jawda">JAWDA KPIs</TabsTrigger>
            <TabsTrigger value="reporting">Reports</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* JAWDA KPIs Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        JAWDA KPIs
                      </CardTitle>
                    </div>
                    {getStatusIcon(complianceData.jawdaKPIs.complianceStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {complianceData.jawdaKPIs.overallScore}%
                    </div>
                    <Badge
                      className={getStatusColor(
                        complianceData.jawdaKPIs.complianceStatus,
                      )}
                    >
                      {complianceData.jawdaKPIs.complianceStatus.replace(
                        "_",
                        " ",
                      )}
                    </Badge>
                    <Progress
                      value={complianceData.jawdaKPIs.overallScore}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {complianceData.jawdaKPIs.kpiResults.length} KPIs tracked
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regulatory Reports Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        Reports
                      </CardTitle>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {complianceData.regulatoryReporting.totalReports}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Generated
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {
                        complianceData.regulatoryReporting.upcomingDeadlines
                          .length
                      }{" "}
                      upcoming deadlines
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        Audit Trail
                      </CardTitle>
                    </div>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {complianceData.auditTrail.totalEvents}
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">
                      Events Logged
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {complianceData.auditTrail.criticalEvents} critical events
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced System Status Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        System Status
                      </CardTitle>
                    </div>
                    {getStatusIcon(complianceData.realTimeStatus.systemHealth)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={getStatusColor(
                          complianceData.realTimeStatus.systemHealth,
                        )}
                      >
                        {complianceData.realTimeStatus.systemHealth}
                      </Badge>
                      <span className="text-sm font-medium">
                        {complianceData.realTimeStatus.dataQuality}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Data Quality</span>
                        <span>
                          {complianceData.realTimeStatus.dataQuality}%
                        </span>
                      </div>
                      <Progress
                        value={complianceData.realTimeStatus.dataQuality}
                        className="h-1"
                      />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        Monitoring:{" "}
                        {complianceData.realTimeStatus.activeMonitoring
                          ? "Active"
                          : "Inactive"}
                      </div>
                      <div>
                        Automation:{" "}
                        {complianceData.realTimeStatus.automationStatus}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium mb-1">
                        Integration Status
                      </div>
                      <div className="space-y-1">
                        {Object.entries(
                          complianceData.realTimeStatus.integrationStatus,
                        ).map(([system, status]) => (
                          <div
                            key={system}
                            className="flex items-center justify-between text-xs"
                          >
                            <span>{system}</span>
                            <div
                              className={`w-2 h-2 rounded-full ${status ? "bg-green-500" : "bg-red-500"}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Enhanced Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complianceData.jawdaKPIs.kpiResults.map((metric) => (
                <Card
                  key={metric.id}
                  className="bg-white hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon(metric.category)}
                        <CardTitle className="text-sm font-medium">
                          {metric.name}
                        </CardTitle>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-end space-x-2">
                        <span className="text-2xl font-bold">
                          {metric.value}%
                        </span>
                        <span className="text-sm text-gray-500">
                          / {metric.target}%
                        </span>
                      </div>
                      <Progress
                        value={(metric.value / metric.target) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <Badge
                          variant={`compliance-${metric.status === "excellent" ? "passed" : metric.status}`}
                        >
                          {metric.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(metric.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Metrics Summary Table */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Detailed Metrics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceData.jawdaKPIs.kpiResults.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">
                          {metric.name}
                        </TableCell>
                        <TableCell>{metric.category}</TableCell>
                        <TableCell>{metric.value}%</TableCell>
                        <TableCell>{metric.target}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={`compliance-${metric.status === "excellent" ? "passed" : metric.status}`}
                          >
                            {metric.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(metric.trend)}
                            <span className="text-sm">{metric.trend}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(metric.lastUpdated).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JAWDA KPIs Tab */}
          <TabsContent value="jawda" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Automated JAWDA KPI Tracking</CardTitle>
                <p className="text-sm text-gray-600">
                  Real-time calculation and monitoring of all DOH JAWDA KPIs
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {complianceData.jawdaKPIs.overallScore}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                      <Badge
                        className={getStatusColor(
                          complianceData.jawdaKPIs.complianceStatus,
                        )}
                      >
                        {complianceData.jawdaKPIs.complianceStatus.replace(
                          "_",
                          " ",
                        )}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {complianceData.jawdaKPIs.kpiResults.length}
                      </div>
                      <div className="text-sm text-gray-600">KPIs Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {complianceData.jawdaKPIs.alerts.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Alerts</div>
                    </div>
                  </div>

                  {complianceData.jawdaKPIs.alerts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Recent JAWDA Alerts</h4>
                      {complianceData.jawdaKPIs.alerts
                        .slice(0, 5)
                        .map((alert, index) => (
                          <Alert
                            key={index}
                            className="border-yellow-200 bg-yellow-50"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-yellow-800">
                              {alert}
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regulatory Reports Tab */}
          <TabsContent value="reporting" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Automated Regulatory Reporting</CardTitle>
                <p className="text-sm text-gray-600">
                  Scheduled generation and submission of regulatory reports
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Report Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Reports:</span>
                          <span className="font-semibold">
                            {complianceData.regulatoryReporting.totalReports}
                          </span>
                        </div>
                        {Object.entries(
                          complianceData.regulatoryReporting.reportsByType,
                        ).map(([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between text-sm"
                          >
                            <span>{type}:</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Upcoming Deadlines</h4>
                      <div className="space-y-2">
                        {complianceData.regulatoryReporting.upcomingDeadlines
                          .slice(0, 5)
                          .map((deadline, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {deadline.type}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    deadline.deadline,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge
                                className={`${
                                  deadline.daysUntil <= 3
                                    ? "bg-red-100 text-red-800"
                                    : deadline.daysUntil <= 7
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {deadline.daysUntil} days
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Compliance Audit Trail</CardTitle>
                <p className="text-sm text-gray-600">
                  Comprehensive logging of all compliance-related events
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {complianceData.auditTrail.totalEvents}
                      </div>
                      <div className="text-sm text-gray-600">Total Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {complianceData.auditTrail.criticalEvents}
                      </div>
                      <div className="text-sm text-gray-600">
                        Critical Events
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {complianceData.auditTrail.complianceEvents}
                      </div>
                      <div className="text-sm text-gray-600">
                        Compliance Events
                      </div>
                    </div>
                  </div>

                  {complianceData.auditTrail.recentAlerts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        Recent Compliance Alerts
                      </h4>
                      {complianceData.auditTrail.recentAlerts
                        .slice(0, 5)
                        .map((alert, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                className={getStatusColor(
                                  alert.severity || "medium",
                                )}
                              >
                                {alert.type || "Compliance Alert"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700">
                              Alert ID: {alert.alertId}
                            </div>
                            {alert.requiredActions && (
                              <div className="text-xs text-gray-600 mt-1">
                                Actions: {alert.requiredActions.length} required
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Predictive Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Predictions */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Risk Predictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceData.predictiveAnalytics.riskPredictions.map(
                      (risk, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{risk.risk}</div>
                            <div className="text-sm text-gray-600">
                              Impact: {risk.impact}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {Math.round(risk.probability * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Probability
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Forecast */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Compliance Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {
                          complianceData.predictiveAnalytics
                            .complianceForecast[4]
                        }
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Projected Score (5 months)
                      </div>
                    </div>
                    <div className="space-y-2">
                      {complianceData.predictiveAnalytics.complianceForecast.map(
                        (score, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">Month {index + 1}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={score} className="w-20 h-2" />
                              <span className="text-sm font-medium">
                                {score}%
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Actions */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Recommended Actions</h4>
                    <div className="space-y-2">
                      {complianceData.predictiveAnalytics.recommendedActions.map(
                        (action, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 p-2 bg-blue-50 rounded"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-sm">{action}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Cost Impact</h4>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        $
                        {complianceData.predictiveAnalytics.costSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Annual Savings Potential
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        From automation and process improvements
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={loadAutomatedComplianceData}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  alert("Generating comprehensive compliance report...")
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                onClick={() => alert("Exporting audit trail...")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  alert("Opening compliance dashboard settings...")
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database className="h-4 w-4" />
              <span>
                Last sync:{" "}
                {new Date(
                  complianceData.realTimeStatus.lastCheck,
                ).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedComplianceDashboard;
