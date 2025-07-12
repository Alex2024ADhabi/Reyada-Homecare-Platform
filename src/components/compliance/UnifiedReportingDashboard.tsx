import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Database,
  Settings,
  Filter,
  Eye,
} from "lucide-react";

interface ReportMetrics {
  dohReports: {
    monthlySubmissions: number;
    complianceRate: number;
    auditFindings: number;
    nineDomainCoverage: number;
  };
  damanReports: {
    authorizationReports: number;
    claimsSubmitted: number;
    approvalRate: number;
    revenueTracked: number;
  };
  jawdaReports: {
    kpiReports: number;
    qualityIndicators: number;
    trainingReports: number;
    incidentReports: number;
  };
  unifiedMetrics: {
    totalReports: number;
    automationRate: number;
    dataAccuracy: number;
    timeliness: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: "DOH" | "DAMAN" | "JAWDA" | "UNIFIED";
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  lastGenerated: string;
  nextDue: string;
  status: "active" | "draft" | "archived";
  recipients: string[];
  automationLevel: "manual" | "semi-automated" | "fully-automated";
}

interface ReportSchedule {
  id: string;
  templateId: string;
  templateName: string;
  scheduledDate: string;
  status: "pending" | "generating" | "completed" | "failed";
  progress: number;
  estimatedCompletion: string;
}

const UnifiedReportingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  useEffect(() => {
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    try {
      setLoading(true);

      const [metricsData, templatesData, schedulesData] = await Promise.all([
        loadReportMetrics(),
        loadReportTemplates(),
        loadReportSchedules(),
      ]);

      setMetrics(metricsData);
      setTemplates(templatesData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error loading reporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportMetrics = async (): Promise<ReportMetrics> => {
    return {
      dohReports: {
        monthlySubmissions: 24,
        complianceRate: 96.8,
        auditFindings: 2,
        nineDomainCoverage: 98.5,
      },
      damanReports: {
        authorizationReports: 156,
        claimsSubmitted: 89,
        approvalRate: 94.2,
        revenueTracked: 2847500,
      },
      jawdaReports: {
        kpiReports: 12,
        qualityIndicators: 45,
        trainingReports: 8,
        incidentReports: 3,
      },
      unifiedMetrics: {
        totalReports: 337,
        automationRate: 87.3,
        dataAccuracy: 98.1,
        timeliness: 94.7,
      },
    };
  };

  const loadReportTemplates = async (): Promise<ReportTemplate[]> => {
    return [
      {
        id: "doh-monthly",
        name: "DOH Monthly Compliance Report",
        type: "DOH",
        description:
          "Comprehensive monthly compliance report covering all 9 domains",
        frequency: "monthly",
        lastGenerated: "2024-12-01T00:00:00Z",
        nextDue: "2025-01-01T00:00:00Z",
        status: "active",
        recipients: ["compliance@hospital.ae", "doh-liaison@hospital.ae"],
        automationLevel: "fully-automated",
      },
      {
        id: "daman-weekly",
        name: "DAMAN Authorization Weekly Summary",
        type: "DAMAN",
        description: "Weekly summary of authorization requests and approvals",
        frequency: "weekly",
        lastGenerated: "2024-12-16T00:00:00Z",
        nextDue: "2024-12-23T00:00:00Z",
        status: "active",
        recipients: ["daman-team@hospital.ae", "finance@hospital.ae"],
        automationLevel: "fully-automated",
      },
      {
        id: "jawda-quarterly",
        name: "JAWDA Quality Indicators Report",
        type: "JAWDA",
        description:
          "Quarterly quality performance indicators and KPI analysis",
        frequency: "quarterly",
        lastGenerated: "2024-10-01T00:00:00Z",
        nextDue: "2025-01-01T00:00:00Z",
        status: "active",
        recipients: ["quality@hospital.ae", "management@hospital.ae"],
        automationLevel: "semi-automated",
      },
      {
        id: "unified-executive",
        name: "Executive Unified Compliance Dashboard",
        type: "UNIFIED",
        description:
          "High-level executive summary across all compliance frameworks",
        frequency: "monthly",
        lastGenerated: "2024-12-01T00:00:00Z",
        nextDue: "2025-01-01T00:00:00Z",
        status: "active",
        recipients: [
          "ceo@hospital.ae",
          "coo@hospital.ae",
          "compliance-head@hospital.ae",
        ],
        automationLevel: "fully-automated",
      },
      {
        id: "cross-validation",
        name: "Cross-System Validation Report",
        type: "UNIFIED",
        description:
          "Data consistency and validation across DOH, DAMAN, and JAWDA systems",
        frequency: "weekly",
        lastGenerated: "2024-12-16T00:00:00Z",
        nextDue: "2024-12-23T00:00:00Z",
        status: "active",
        recipients: ["data-team@hospital.ae", "it@hospital.ae"],
        automationLevel: "fully-automated",
      },
    ];
  };

  const loadReportSchedules = async (): Promise<ReportSchedule[]> => {
    return [
      {
        id: "schedule-001",
        templateId: "doh-monthly",
        templateName: "DOH Monthly Compliance Report",
        scheduledDate: "2024-12-31T23:59:00Z",
        status: "pending",
        progress: 0,
        estimatedCompletion: "2025-01-01T02:00:00Z",
      },
      {
        id: "schedule-002",
        templateId: "daman-weekly",
        templateName: "DAMAN Authorization Weekly Summary",
        scheduledDate: "2024-12-22T18:00:00Z",
        status: "generating",
        progress: 65,
        estimatedCompletion: "2024-12-22T19:30:00Z",
      },
      {
        id: "schedule-003",
        templateId: "cross-validation",
        templateName: "Cross-System Validation Report",
        scheduledDate: "2024-12-22T20:00:00Z",
        status: "completed",
        progress: 100,
        estimatedCompletion: "2024-12-22T20:45:00Z",
      },
    ];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "DOH":
        return "bg-green-100 text-green-800";
      case "DAMAN":
        return "bg-blue-100 text-blue-800";
      case "JAWDA":
        return "bg-purple-100 text-purple-800";
      case "UNIFIED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAutomationIcon = (level: string) => {
    switch (level) {
      case "fully-automated":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "semi-automated":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case "manual":
        return <Users className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const generateReport = async (templateId: string) => {
    try {
      // Simulate report generation
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      const newSchedule: ReportSchedule = {
        id: `schedule-${Date.now()}`,
        templateId,
        templateName: template.name,
        scheduledDate: new Date().toISOString(),
        status: "generating",
        progress: 0,
        estimatedCompletion: new Date(
          Date.now() + 30 * 60 * 1000,
        ).toISOString(),
      };

      setSchedules([newSchedule, ...schedules]);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === newSchedule.id
              ? { ...schedule, progress: Math.min(schedule.progress + 10, 100) }
              : schedule,
          ),
        );
      }, 1000);

      // Complete after 10 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === newSchedule.id
              ? { ...schedule, status: "completed" as const, progress: 100 }
              : schedule,
          ),
        );
      }, 10000);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const exportUnifiedReport = async () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        reportType: "unified_reporting_dashboard",
        period: selectedPeriod,
        metrics: metrics,
        templates: templates,
        schedules: schedules,
        summary: {
          totalActiveTemplates: templates.filter((t) => t.status === "active")
            .length,
          fullyAutomatedReports: templates.filter(
            (t) => t.automationLevel === "fully-automated",
          ).length,
          pendingReports: schedules.filter((s) => s.status === "pending")
            .length,
          completedReports: schedules.filter((s) => s.status === "completed")
            .length,
        },
        recommendations: [
          "Increase automation level for semi-automated reports",
          "Implement real-time data validation for improved accuracy",
          "Create standardized templates for cross-system reporting",
          "Establish automated quality checks for all generated reports",
        ],
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unified-reporting-dashboard-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting unified report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading unified reporting dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Unified Reporting Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Centralized reporting across DOH, DAMAN, and JAWDA compliance
              frameworks
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportUnifiedReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Dashboard
            </Button>
            <Button variant="outline" onClick={loadReportingData}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Total Reports
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {metrics?.unifiedMetrics.totalReports || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">This month</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Automation Rate
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {metrics?.unifiedMetrics.automationRate || 0}%
                </p>
                <Progress
                  value={metrics?.unifiedMetrics.automationRate || 0}
                  className="mt-2 h-2"
                />
              </div>
              <Target className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Data Accuracy
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {metrics?.unifiedMetrics.dataAccuracy || 0}%
                </p>
                <Progress
                  value={metrics?.unifiedMetrics.dataAccuracy || 0}
                  className="mt-2 h-2"
                />
              </div>
              <Database className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Timeliness
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {metrics?.unifiedMetrics.timeliness || 0}%
                </p>
                <Progress
                  value={metrics?.unifiedMetrics.timeliness || 0}
                  className="mt-2 h-2"
                />
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="schedules">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Generation by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">DOH</Badge>
                      <span className="text-sm font-medium">
                        Monthly Submissions
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {metrics?.dohReports.monthlySubmissions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">DAMAN</Badge>
                      <span className="text-sm font-medium">
                        Authorization Reports
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {metrics?.damanReports.authorizationReports || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        JAWDA
                      </Badge>
                      <span className="text-sm font-medium">KPI Reports</span>
                    </div>
                    <span className="text-lg font-bold">
                      {metrics?.jawdaReports.kpiReports || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Report Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {schedules.slice(0, 5).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {schedule.templateName}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Scheduled:{" "}
                            {new Date(schedule.scheduledDate).toLocaleString()}
                          </p>
                          {schedule.status === "generating" && (
                            <Progress
                              value={schedule.progress}
                              className="mt-2 h-1"
                            />
                          )}
                        </div>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Automation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-600">
                              {template.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(template.type)}>
                            {template.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {template.frequency}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getAutomationIcon(template.automationLevel)}
                            <span className="text-sm capitalize">
                              {template.automationLevel.replace("-", " ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(template.status)}>
                            {template.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(template.nextDue).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateReport(template.id)}
                            >
                              Generate
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{schedule.templateName}</h4>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Scheduled:</span>
                        <br />
                        {new Date(schedule.scheduledDate).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Est. Completion:</span>
                        <br />
                        {new Date(
                          schedule.estimatedCompletion,
                        ).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Progress:</span>
                        <br />
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress
                            value={schedule.progress}
                            className="flex-1 h-2"
                          />
                          <span className="text-xs">{schedule.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DOH Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics?.dohReports.complianceRate || 0}%
                  </div>
                  <Progress
                    value={metrics?.dohReports.complianceRate || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Monthly Average</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DAMAN Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics?.damanReports.approvalRate || 0}%
                  </div>
                  <Progress
                    value={metrics?.damanReports.approvalRate || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Authorization Success
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">JAWDA Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics?.jawdaReports.qualityIndicators || 0}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Active Indicators
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedReportingDashboard;
