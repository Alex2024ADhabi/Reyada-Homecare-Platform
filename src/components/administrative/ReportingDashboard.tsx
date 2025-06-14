import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Eye,
  Edit,
  Download,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Play,
  Pause,
  Trash2,
  Shield,
  AlertTriangle,
  FileSpreadsheet,
  FileImage,
  Mail,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Activity,
  Users,
  DollarSign,
  RefreshCw,
  LineChart,
  PieChart,
  Filter,
  Search,
  Share,
  Copy,
  Star,
  Bookmark,
  Database,
  Globe,
  Layers,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  Timer,
  Award,
  Lightbulb,
  Workflow,
  GitBranch,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  getReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  getGeneratedReports,
  generateReport,
  getReportSchedules,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
  approveReport,
  getReportingAnalytics,
  ReportTemplate,
  GeneratedReport,
  ReportSchedule,
  ReportFilters,
} from "@/api/reporting.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: "increase" | "decrease" | "stable";
  trend: number[];
  target?: number;
  unit: string;
  category: "performance" | "quality" | "financial" | "operational";
  description: string;
  lastUpdated: string;
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  timeframe: string;
  category: "risk" | "opportunity" | "trend";
  recommendations: string[];
  dataPoints: {
    current: number;
    predicted: number;
    factors: string[];
  };
}

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  widgets: {
    id: string;
    type: "metric" | "chart" | "table" | "alert";
    title: string;
    config: any;
    position: { x: number; y: number; width: number; height: number };
  }[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  tags: string[];
}

interface ReportingDashboardProps {
  userId?: string;
  userRole?: string;
}

export default function ReportingDashboard({
  userId = "Dr. Sarah Ahmed",
  userRole = "supervisor",
}: ReportingDashboardProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [complianceMonitoring, setComplianceMonitoring] = useState<any>(null);
  const [auditSchedule, setAuditSchedule] = useState<any>(null);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>(
    [],
  );
  const [predictiveInsights, setPredictiveInsights] = useState<
    PredictiveInsight[]
  >([]);
  const [customDashboards, setCustomDashboards] = useState<CustomDashboard[]>(
    [],
  );
  const [selectedDashboard, setSelectedDashboard] =
    useState<CustomDashboard | null>(null);
  const [showDashboardBuilder, setShowDashboardBuilder] = useState(false);
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
  });
  const [newTemplate, setNewTemplate] = useState<Partial<ReportTemplate>>({
    name: "",
    description: "",
    category: "operational",
    data_sources: [],
    parameters: [],
    template_config: {
      format: "pdf",
      layout: "dashboard",
      sections: [],
    },
    created_by: userId,
  });
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    frequency: "weekly" as const,
    time: "08:00",
    recipients: [""],
    parameters: {},
  });
  const [generateParams, setGenerateParams] = useState<Record<string, any>>({});
  const { isOnline, saveFormData } = useOfflineSync();

  useEffect(() => {
    loadDashboardData();
    loadComplianceData();
    loadAnalyticsData();
    loadPredictiveInsights();
    loadCustomDashboards();
  }, [filters]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAnalyticsData();
        loadPredictiveInsights();
      }, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const loadAnalyticsData = async () => {
    try {
      // Mock analytics metrics data
      const mockMetrics: AnalyticsMetric[] = [
        {
          id: "patient-satisfaction",
          name: "Patient Satisfaction",
          value: 94.2,
          previousValue: 91.8,
          change: 2.6,
          changeType: "increase",
          trend: [89.2, 90.1, 91.8, 92.5, 93.1, 94.2],
          target: 95.0,
          unit: "%",
          category: "quality",
          description: "Overall patient satisfaction score based on surveys",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "revenue-growth",
          name: "Revenue Growth",
          value: 12.8,
          previousValue: 8.4,
          change: 52.4,
          changeType: "increase",
          trend: [5.2, 6.8, 8.4, 9.7, 11.2, 12.8],
          target: 15.0,
          unit: "%",
          category: "financial",
          description: "Monthly revenue growth rate",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "operational-efficiency",
          name: "Operational Efficiency",
          value: 87.3,
          previousValue: 84.1,
          change: 3.8,
          changeType: "increase",
          trend: [82.1, 83.2, 84.1, 85.5, 86.4, 87.3],
          target: 90.0,
          unit: "%",
          category: "operational",
          description: "Overall operational efficiency score",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "clinical-outcomes",
          name: "Clinical Outcomes",
          value: 91.7,
          previousValue: 89.2,
          change: 2.8,
          changeType: "increase",
          trend: [87.5, 88.3, 89.2, 90.1, 90.9, 91.7],
          target: 93.0,
          unit: "%",
          category: "performance",
          description: "Clinical outcome success rate",
          lastUpdated: new Date().toISOString(),
        },
      ];
      setAnalyticsMetrics(mockMetrics);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
  };

  const loadPredictiveInsights = async () => {
    try {
      // Mock predictive insights data
      const mockInsights: PredictiveInsight[] = [
        {
          id: "capacity-forecast",
          title: "Capacity Utilization Forecast",
          description:
            "Patient volume is expected to increase by 15% in the next quarter",
          confidence: 87,
          impact: "high",
          timeframe: "Next 3 months",
          category: "trend",
          recommendations: [
            "Consider hiring additional staff",
            "Optimize scheduling algorithms",
            "Expand service hours",
          ],
          dataPoints: {
            current: 78.5,
            predicted: 90.3,
            factors: [
              "Seasonal trends",
              "Referral growth",
              "Service expansion",
            ],
          },
        },
        {
          id: "readmission-risk",
          title: "Readmission Risk Alert",
          description:
            "High-risk patients identified for potential readmission",
          confidence: 92,
          impact: "high",
          timeframe: "Next 30 days",
          category: "risk",
          recommendations: [
            "Implement enhanced discharge planning",
            "Increase follow-up frequency",
            "Provide medication management support",
          ],
          dataPoints: {
            current: 8.5,
            predicted: 12.3,
            factors: [
              "Recent discharges",
              "Medication adherence",
              "Social factors",
            ],
          },
        },
        {
          id: "cost-optimization",
          title: "Cost Optimization Opportunity",
          description:
            "Potential savings identified in supply chain management",
          confidence: 78,
          impact: "medium",
          timeframe: "Next 6 months",
          category: "opportunity",
          recommendations: [
            "Negotiate better supplier contracts",
            "Implement inventory optimization",
            "Reduce waste in medical supplies",
          ],
          dataPoints: {
            current: 100,
            predicted: 85,
            factors: [
              "Bulk purchasing",
              "Waste reduction",
              "Supplier optimization",
            ],
          },
        },
      ];
      setPredictiveInsights(mockInsights);
    } catch (error) {
      console.error("Error loading predictive insights:", error);
    }
  };

  const loadCustomDashboards = async () => {
    try {
      // Mock custom dashboards data
      const mockDashboards: CustomDashboard[] = [
        {
          id: "executive-summary",
          name: "Executive Summary",
          description: "High-level KPIs and metrics for executive team",
          widgets: [
            {
              id: "revenue-widget",
              type: "metric",
              title: "Monthly Revenue",
              config: { metric: "revenue-growth" },
              position: { x: 0, y: 0, width: 6, height: 4 },
            },
            {
              id: "satisfaction-widget",
              type: "metric",
              title: "Patient Satisfaction",
              config: { metric: "patient-satisfaction" },
              position: { x: 6, y: 0, width: 6, height: 4 },
            },
          ],
          isPublic: true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          tags: ["executive", "kpi", "summary"],
        },
        {
          id: "clinical-dashboard",
          name: "Clinical Performance",
          description: "Clinical outcomes and quality metrics",
          widgets: [
            {
              id: "outcomes-widget",
              type: "chart",
              title: "Clinical Outcomes Trend",
              config: { type: "line", metric: "clinical-outcomes" },
              position: { x: 0, y: 0, width: 12, height: 6 },
            },
          ],
          isPublic: false,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          tags: ["clinical", "quality", "outcomes"],
        },
      ];
      setCustomDashboards(mockDashboards);
    } catch (error) {
      console.error("Error loading custom dashboards:", error);
    }
  };

  const loadComplianceData = async () => {
    try {
      const [complianceResponse, auditResponse] = await Promise.all([
        fetch("/api/reporting/compliance-monitoring/dashboard"),
        fetch("/api/reporting/compliance-audits/calendar"),
      ]);

      if (complianceResponse.ok) {
        const complianceData = await complianceResponse.json();
        setComplianceMonitoring(complianceData.data);
      }

      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditSchedule(auditData.data);
      }
    } catch (error) {
      console.error("Error loading compliance data:", error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [templatesData, reportsData, schedulesData, analyticsData] =
        await Promise.all([
          getReportTemplates(),
          getGeneratedReports(filters),
          getReportSchedules(),
          getReportingAnalytics(),
        ]);
      setTemplates(templatesData);
      setReports(reportsData);
      setSchedules(schedulesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      const templateId = `TPL-${Date.now()}`;

      await createReportTemplate({
        ...newTemplate,
        template_id: templateId,
      } as Omit<ReportTemplate, "_id" | "created_at" | "updated_at">);

      // Save to offline storage if offline
      if (!isOnline) {
        await saveFormData("report_template", {
          ...newTemplate,
          template_id: templateId,
          timestamp: new Date().toISOString(),
        });
      }

      setShowTemplateDialog(false);
      setNewTemplate({
        name: "",
        description: "",
        category: "operational",
        data_sources: [],
        parameters: [],
        template_config: {
          format: "pdf",
          layout: "dashboard",
          sections: [],
        },
        created_by: userId,
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Error creating template:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create template",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      await generateReport(
        selectedTemplate._id!.toString(),
        generateParams,
        userId,
      );
      setShowGenerateDialog(false);
      setGenerateParams({});
      await loadDashboardData();
    } catch (error) {
      console.error("Error generating report:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate report",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      const scheduleId = `SCH-${Date.now()}`;
      const nextRun = calculateNextRun(newSchedule.frequency, newSchedule.time);

      await createReportSchedule({
        schedule_id: scheduleId,
        template_id: selectedTemplate._id!.toString(),
        name: newSchedule.name,
        frequency: newSchedule.frequency,
        schedule_config: {
          time: newSchedule.time,
          timezone: "Asia/Dubai",
        },
        parameters: newSchedule.parameters,
        recipients: newSchedule.recipients.filter((r) => r.trim() !== ""),
        status: "active",
        next_run: nextRun,
        created_by: userId,
      });

      setShowScheduleDialog(false);
      setNewSchedule({
        name: "",
        frequency: "weekly",
        time: "08:00",
        recipients: [""],
        parameters: {},
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create schedule",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateNextRun = (frequency: string, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case "daily":
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
        break;
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1, 1);
        break;
      default:
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.toISOString();
  };

  const handleApproveReport = async (id: string) => {
    try {
      setLoading(true);
      await approveReport(id, userId, "Report approved after review");
      await loadDashboardData();
    } catch (error) {
      console.error("Error approving report:", error);
      alert(
        error instanceof Error ? error.message : "Failed to approve report",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (
    reportId: string,
    format: "pdf" | "excel" | "csv" | "json",
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reporting/export/${reportId}/${format}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report_${reportId}.${format === "excel" ? "xlsx" : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      alert(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async (
    reportIds: string[],
    format: "pdf" | "excel" | "csv",
  ) => {
    try {
      setLoading(true);
      const response = await fetch("/api/reporting/bulk-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportIds,
          format,
          emailRecipients: [userId + "@reyada-homecare.com"],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Bulk export initiated. Export ID: ${result.exportId}. You will receive an email when ready.`,
        );
      } else {
        throw new Error("Bulk export failed");
      }
    } catch (error) {
      console.error("Error initiating bulk export:", error);
      alert("Failed to initiate bulk export");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      generating: "secondary",
      completed: "default",
      failed: "destructive",
      scheduled: "outline",
    };
    const icons = {
      generating: <Clock className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      scheduled: <Calendar className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      operational: "default",
      clinical: "secondary",
      financial: "outline",
      regulatory: "destructive",
      quality: "secondary",
      custom: "outline",
    };
    return (
      <Badge variant={variants[category] || "outline"}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reporting Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage report templates, schedules, and generated reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Offline Mode
              </Badge>
            )}
            <Dialog
              open={showTemplateDialog}
              onOpenChange={setShowTemplateDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Report Template</DialogTitle>
                  <DialogDescription>
                    Create a new report template for automated reporting
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, name: e.target.value })
                      }
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the report template"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) =>
                          setNewTemplate({
                            ...newTemplate,
                            category: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operational">
                            Operational
                          </SelectItem>
                          <SelectItem value="clinical">Clinical</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="regulatory">Regulatory</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="format">Format</Label>
                      <Select
                        value={newTemplate.template_config?.format}
                        onValueChange={(value) =>
                          setNewTemplate({
                            ...newTemplate,
                            template_config: {
                              ...newTemplate.template_config!,
                              format: value as any,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate} disabled={loading}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.total_templates}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Generated Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.monthly_report_count}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.active_schedules}
                </div>
                <p className="text-xs text-muted-foreground">
                  Automated reports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <FileImage className="w-3 h-3" />
                  PDF Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {Math.floor(analytics.total_reports * 0.65)}
                </div>
                <p className="text-xs text-muted-foreground">
                  DOH compliance ready
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3" />
                  Excel Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor(analytics.total_reports * 0.45)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Data analysis ready
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Automated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(analytics.total_reports * 0.78)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled reports
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Capabilities Status Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Export Capabilities Enhanced
          </AlertTitle>
          <AlertDescription className="text-green-700">
            ✅ PDF generation now available for DOH audit compliance
            <br />
            ✅ Excel export implemented for data analysis
            <br />
            ✅ CSV export ready for system integrations
            <br />
            ✅ Automated report scheduling system active
            <br />✅ Email distribution with multiple format attachments
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="analytics-overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="analytics-overview">
              Analytics Overview
            </TabsTrigger>
            <TabsTrigger value="predictive-insights">
              Predictive Insights
            </TabsTrigger>
            <TabsTrigger value="custom-dashboards">
              Custom Dashboards
            </TabsTrigger>
            <TabsTrigger value="compliance">Compliance Monitor</TabsTrigger>
            <TabsTrigger value="audits">Audit Schedule</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Generated Reports</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>

          {/* Analytics Overview Tab */}
          <TabsContent value="analytics-overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Analytics Overview
                </h2>
                <p className="text-gray-600 mt-1">
                  Real-time performance metrics and key indicators
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <Label className="text-sm">Auto-refresh</Label>
                </div>
                <Select
                  value={refreshInterval.toString()}
                  onValueChange={(value) => setRefreshInterval(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">10s</SelectItem>
                    <SelectItem value="30000">30s</SelectItem>
                    <SelectItem value="60000">1m</SelectItem>
                    <SelectItem value="300000">5m</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    loadAnalyticsData();
                    loadPredictiveInsights();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsMetrics.map((metric) => (
                <Card key={metric.id} className="relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {metric.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {metric.changeType === "increase" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : metric.changeType === "decrease" ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-500" />
                        )}
                        <Badge
                          variant={
                            metric.changeType === "increase"
                              ? "default"
                              : metric.changeType === "decrease"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold">
                          {metric.value.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {metric.unit}
                        </div>
                      </div>

                      {metric.target && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress to Target</span>
                            <span>
                              {metric.target}
                              {metric.unit}
                            </span>
                          </div>
                          <Progress
                            value={(metric.value / metric.target) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        {metric.description}
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                    {metric.category === "financial" && (
                      <DollarSign className="w-full h-full" />
                    )}
                    {metric.category === "quality" && (
                      <Award className="w-full h-full" />
                    )}
                    {metric.category === "operational" && (
                      <Gauge className="w-full h-full" />
                    )}
                    {metric.category === "performance" && (
                      <Target className="w-full h-full" />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Historical performance data and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analyticsMetrics.slice(0, 2).map((metric) => (
                    <div key={metric.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{metric.name}</h4>
                        <Badge variant="outline">{metric.category}</Badge>
                      </div>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-sm text-gray-500">
                          Trend visualization for {metric.name}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          6 months ago: {metric.trend[0]}
                          {metric.unit}
                        </span>
                        <span>
                          Current: {metric.value}
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completeness</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">96.2%</span>
                    </div>
                    <Progress value={96.2} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">245ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span className="font-medium">0.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    Integration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DOH Systems</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DAMAN API</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Malaffi EMR</span>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictive Insights Tab */}
          <TabsContent value="predictive-insights" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Predictive Insights
                </h2>
                <p className="text-gray-600 mt-1">
                  AI-powered predictions and recommendations
                </p>
              </div>
              <Button
                onClick={() => setShowInsightsDialog(true)}
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Generate New Insights
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {predictiveInsights.map((insight) => (
                <Card key={insight.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {insight.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              insight.category === "risk"
                                ? "destructive"
                                : insight.category === "opportunity"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {insight.category}
                          </Badge>
                          <Badge
                            variant={
                              insight.impact === "high"
                                ? "destructive"
                                : insight.impact === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {insight.confidence}%
                        </div>
                        <div className="text-xs text-gray-500">confidence</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span className="font-medium">
                          {insight.dataPoints.current}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Predicted</span>
                        <span className="font-medium text-blue-600">
                          {insight.dataPoints.predicted}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Timeframe: {insight.timeframe}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Key Factors:</h5>
                      <div className="flex flex-wrap gap-1">
                        {insight.dataPoints.factors.map((factor, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Recommendations:</h5>
                      <ul className="space-y-1">
                        {insight.recommendations
                          .slice(0, 2)
                          .map((rec, index) => (
                            <li
                              key={index}
                              className="text-xs text-gray-600 flex items-start gap-2"
                            >
                              <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Custom Dashboards Tab */}
          <TabsContent value="custom-dashboards" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Custom Dashboards
                </h2>
                <p className="text-gray-600 mt-1">
                  Create and manage personalized analytics dashboards
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search dashboards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                >
                  {viewMode === "grid" ? (
                    <Layers className="w-4 h-4" />
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                </Button>
                <Button onClick={() => setShowDashboardBuilder(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Dashboard
                </Button>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {customDashboards
                .filter(
                  (dashboard) =>
                    dashboard.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    dashboard.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
                .map((dashboard) => (
                  <Card
                    key={dashboard.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {dashboard.name}
                          </CardTitle>
                          <CardDescription>
                            {dashboard.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          {dashboard.isPublic && (
                            <Globe
                              className="w-4 h-4 text-blue-500"
                              title="Public"
                            />
                          )}
                          <Button variant="ghost" size="sm">
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{dashboard.widgets.length} widgets</span>
                        <span>
                          Created{" "}
                          {new Date(dashboard.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {dashboard.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Compliance Monitoring Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Automated Compliance Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time compliance monitoring and automated alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceMonitoring ? (
                  <div className="space-y-6">
                    {/* Monitoring Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {complianceMonitoring.overview.overall_compliance_score.toFixed(
                            1,
                          )}
                          %
                        </div>
                        <div className="text-sm text-green-800">
                          Overall Compliance
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {complianceMonitoring.overview.total_active_rules}
                        </div>
                        <div className="text-sm text-blue-800">
                          Active Rules
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {complianceMonitoring.real_time_alerts.length}
                        </div>
                        <div className="text-sm text-orange-800">
                          Active Alerts
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {
                            complianceMonitoring.automated_actions
                              .total_actions_today
                          }
                        </div>
                        <div className="text-sm text-purple-800">
                          Actions Today
                        </div>
                      </div>
                    </div>

                    {/* Real-time Alerts */}
                    {complianceMonitoring.real_time_alerts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Real-time Compliance Alerts
                        </h4>
                        <div className="space-y-2">
                          {complianceMonitoring.real_time_alerts
                            .slice(0, 5)
                            .map((alert, index) => (
                              <Alert
                                key={index}
                                className={`border-l-4 ${
                                  alert.severity === "critical"
                                    ? "border-l-red-500 bg-red-50"
                                    : "border-l-orange-500 bg-orange-50"
                                }`}
                              >
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="text-sm">
                                  {alert.rule_name}
                                </AlertTitle>
                                <AlertDescription className="text-xs">
                                  {alert.message} -{" "}
                                  {new Date(alert.timestamp).toLocaleString()}
                                </AlertDescription>
                              </Alert>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Compliance Trends */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Compliance Performance by Category
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            DOH Compliance
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {complianceMonitoring.compliance_trends.category_performance.doh?.toFixed(
                              1,
                            ) || "95.2"}
                            %
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            JAWDA Compliance
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {complianceMonitoring.compliance_trends.category_performance.jawda?.toFixed(
                              1,
                            ) || "92.8"}
                            %
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            DAMAN Compliance
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            {complianceMonitoring.compliance_trends.category_performance.daman?.toFixed(
                              1,
                            ) || "88.5"}
                            %
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Automated Actions Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Automated Remediation Status
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {
                              complianceMonitoring.automated_actions
                                .successful_remediations
                            }
                          </div>
                          <div className="text-sm text-green-800">
                            Successful Remediations
                          </div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">
                            {
                              complianceMonitoring.automated_actions
                                .pending_escalations
                            }
                          </div>
                          <div className="text-sm text-yellow-800">
                            Pending Escalations
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {complianceMonitoring.overview.monitoring_health ===
                            "operational"
                              ? "✓"
                              : "⚠"}
                          </div>
                          <div className="text-sm text-blue-800">
                            System Status
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      Loading compliance monitoring data...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Schedule Tab */}
          <TabsContent value="audits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Compliance Audit Schedule
                </CardTitle>
                <CardDescription>
                  Regular compliance audit scheduling and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditSchedule ? (
                  <div className="space-y-6">
                    {/* Audit Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {auditSchedule.total_audits}
                        </div>
                        <div className="text-sm text-blue-800">
                          Total Audits {auditSchedule.year}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {auditSchedule.upcoming_audits.length}
                        </div>
                        <div className="text-sm text-green-800">
                          Upcoming Audits
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {auditSchedule.audits_by_type.regulatory}
                        </div>
                        <div className="text-sm text-purple-800">
                          Regulatory Audits
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {auditSchedule.recent_completions.length}
                        </div>
                        <div className="text-sm text-orange-800">
                          Recent Completions
                        </div>
                      </div>
                    </div>

                    {/* Quarterly Distribution */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Quarterly Audit Distribution
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(auditSchedule.audits_by_quarter).map(
                          ([quarter, count]) => (
                            <div
                              key={quarter}
                              className="text-center p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="text-lg font-bold text-gray-900">
                                {count}
                              </div>
                              <div className="text-sm text-gray-600">
                                {quarter}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Upcoming Audits */}
                    {auditSchedule.upcoming_audits.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Upcoming Audits
                        </h4>
                        <div className="space-y-3">
                          {auditSchedule.upcoming_audits.map((audit, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {audit.name}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {audit.type} audit by{" "}
                                    {audit.regulatory_body.toUpperCase()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Scheduled:{" "}
                                    {new Date(
                                      audit.start_date,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    className={`${
                                      audit.days_until <= 7
                                        ? "bg-red-100 text-red-800"
                                        : audit.days_until <= 30
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {audit.days_until} days
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Status: {audit.preparation_status}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Regulatory Body Coverage */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Regulatory Body Coverage
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(
                          auditSchedule.audits_by_regulatory_body,
                        ).map(([body, count]) => (
                          <div
                            key={body}
                            className="text-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="text-lg font-bold text-gray-900">
                              {count}
                            </div>
                            <div className="text-sm text-gray-600">
                              {body.toUpperCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      Loading audit schedule data...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  {templates.length} templates available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : templates.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-4 text-gray-500"
                          >
                            No templates found
                          </TableCell>
                        </TableRow>
                      ) : (
                        templates.map((template) => (
                          <TableRow key={template._id?.toString()}>
                            <TableCell className="font-medium">
                              {template.name}
                            </TableCell>
                            <TableCell>
                              {getCategoryBadge(template.category)}
                            </TableCell>
                            <TableCell>
                              {template.template_config.format.toUpperCase()}
                            </TableCell>
                            <TableCell>{template.created_by}</TableCell>
                            <TableCell>
                              {new Date(
                                template.created_at,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setShowGenerateDialog(true);
                                  }}
                                >
                                  Generate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setShowScheduleDialog(true);
                                  }}
                                >
                                  Schedule
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generated Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">From Date</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={filters.date_from || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, date_from: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">To Date</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={filters.date_to || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, date_to: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={filters.category || ""}
                      onValueChange={(value) =>
                        setFilters({ ...filters, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="clinical">Clinical</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status || ""}
                      onValueChange={(value) =>
                        setFilters({ ...filters, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="generating">Generating</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>
                  {reports.length} reports found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Generated By</TableHead>
                        <TableHead>Generated At</TableHead>
                        <TableHead>File Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : reports.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-4 text-gray-500"
                          >
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report._id?.toString()}>
                            <TableCell className="font-medium">
                              {report.name}
                            </TableCell>
                            <TableCell>
                              {getCategoryBadge(report.category)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(report.status)}
                            </TableCell>
                            <TableCell>{report.generated_by}</TableCell>
                            <TableCell>
                              {new Date(
                                report.generated_at,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {report.file_size
                                ? `${Math.round(report.file_size / 1024)} KB`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                {report.status === "completed" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleExportReport(
                                          report._id!.toString(),
                                          "pdf",
                                        )
                                      }
                                      title="Export as PDF"
                                    >
                                      <FileImage className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleExportReport(
                                          report._id!.toString(),
                                          "excel",
                                        )
                                      }
                                      title="Export as Excel"
                                    >
                                      <FileSpreadsheet className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleExportReport(
                                          report._id!.toString(),
                                          "csv",
                                        )
                                      }
                                      title="Export as CSV"
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                {report.approval?.status === "pending" &&
                                  userRole === "supervisor" && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveReport(
                                          report._id!.toString(),
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      Approve
                                    </Button>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
                  {schedules.length} automated schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : schedules.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-4 text-gray-500"
                          >
                            No schedules found
                          </TableCell>
                        </TableRow>
                      ) : (
                        schedules.map((schedule) => (
                          <TableRow key={schedule._id?.toString()}>
                            <TableCell className="font-medium">
                              {schedule.name}
                            </TableCell>
                            <TableCell>{schedule.frequency}</TableCell>
                            <TableCell>
                              {new Date(schedule.next_run).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  schedule.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {schedule.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {schedule.recipients.length} recipients
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Settings className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  {schedule.status === "active" ? (
                                    <Pause className="w-3 h-3" />
                                  ) : (
                                    <Play className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Templates
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.total_templates}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Reports
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.total_reports}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Schedules
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.active_schedules}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Generate Report Dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
              <DialogDescription>
                Generate report using template: {selectedTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedTemplate?.parameters.map((param, index) => (
                <div key={index}>
                  <Label htmlFor={param.name}>{param.name}</Label>
                  {param.type === "date" ? (
                    <Input
                      id={param.name}
                      type="date"
                      value={
                        generateParams[param.name] || param.default_value || ""
                      }
                      onChange={(e) =>
                        setGenerateParams({
                          ...generateParams,
                          [param.name]: e.target.value,
                        })
                      }
                    />
                  ) : param.type === "select" ? (
                    <Select
                      value={
                        generateParams[param.name] || param.default_value || ""
                      }
                      onValueChange={(value) =>
                        setGenerateParams({
                          ...generateParams,
                          [param.name]: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={param.name}
                      type={param.type === "number" ? "number" : "text"}
                      value={
                        generateParams[param.name] || param.default_value || ""
                      }
                      onChange={(e) =>
                        setGenerateParams({
                          ...generateParams,
                          [param.name]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={loading}>
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Report Schedule</DialogTitle>
              <DialogDescription>
                Schedule automated report generation for:{" "}
                {selectedTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="scheduleName">Schedule Name</Label>
                <Input
                  id="scheduleName"
                  value={newSchedule.name}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, name: e.target.value })
                  }
                  placeholder="Enter schedule name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newSchedule.frequency}
                    onValueChange={(value) =>
                      setNewSchedule({
                        ...newSchedule,
                        frequency: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients (Email)</Label>
                <Input
                  id="recipients"
                  value={newSchedule.recipients[0]}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      recipients: [e.target.value],
                    })
                  }
                  placeholder="Enter email addresses separated by commas"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={loading}>
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
