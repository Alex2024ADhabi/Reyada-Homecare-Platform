import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Settings,
  Play,
  Pause,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  Activity,
  Mail,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "executive"
    | "clinical"
    | "financial"
    | "operational"
    | "compliance";
  format: "pdf" | "excel" | "csv" | "json";
  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "on-demand";
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    enabled: boolean;
  };
  parameters: {
    dateRange: { start: string; end: string };
    filters: Record<string, any>;
    includeCharts: boolean;
    includeSummary: boolean;
  };
  recipients: string[];
  lastGenerated?: string;
  nextScheduled?: string;
  status: "active" | "paused" | "draft";
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  generatedBy: string;
  status: "generating" | "completed" | "failed" | "scheduled";
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
}

interface DataCorrelation {
  id: string;
  name: string;
  description: string;
  sourceModules: string[];
  correlationType: "positive" | "negative" | "neutral";
  strength: number;
  insights: string[];
  lastAnalyzed: string;
}

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  layout: {
    widgets: {
      id: string;
      type: "chart" | "metric" | "table" | "text";
      title: string;
      position: { x: number; y: number; width: number; height: number };
      config: any;
      dataSource: string;
    }[];
  };
  filters: {
    dateRange: boolean;
    departments: boolean;
    serviceLines: boolean;
    customFilters: { name: string; type: string; options: string[] }[];
  };
  permissions: {
    viewers: string[];
    editors: string[];
    public: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface InteractiveChart {
  id: string;
  type: "line" | "bar" | "pie" | "scatter" | "heatmap" | "gauge";
  title: string;
  dataSource: string;
  configuration: {
    xAxis: string;
    yAxis: string[];
    groupBy?: string;
    aggregation: "sum" | "avg" | "count" | "min" | "max";
    filters: any[];
  };
  styling: {
    colors: string[];
    theme: "light" | "dark";
    showLegend: boolean;
    showGrid: boolean;
  };
  interactivity: {
    drillDown: boolean;
    zoom: boolean;
    export: boolean;
    realTime: boolean;
  };
}

interface AutomatedReport {
  id: string;
  name: string;
  type: "scheduled" | "triggered" | "on_demand";
  schedule?: {
    frequency: "hourly" | "daily" | "weekly" | "monthly";
    time: string;
    timezone: string;
    enabled: boolean;
  };
  triggers?: {
    eventType: string;
    conditions: any[];
  }[];
  content: {
    sections: {
      id: string;
      type: "summary" | "chart" | "table" | "analysis";
      title: string;
      content: any;
    }[];
  };
  distribution: {
    email: {
      enabled: boolean;
      recipients: string[];
      subject: string;
      template: string;
    };
    portal: {
      enabled: boolean;
      notify: boolean;
    };
    webhook: {
      enabled: boolean;
      url: string;
    };
  };
  lastGenerated?: string;
  nextScheduled?: string;
  status: "active" | "paused" | "error";
}

interface IntegratedReportingEngineProps {
  isOffline?: boolean;
}

const IntegratedReportingEngine: React.FC<IntegratedReportingEngineProps> = ({
  isOffline = false,
}) => {
  const { isOnline } = useOfflineSync();
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Mock data - in production, this would come from APIs
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: "exec_summary",
      name: "Executive Summary Report",
      description:
        "Comprehensive overview of key performance indicators across all modules",
      category: "executive",
      format: "pdf",
      schedule: {
        frequency: "monthly",
        dayOfMonth: 1,
        time: "09:00",
        enabled: true,
      },
      parameters: {
        dateRange: { start: "2024-01-01", end: "2024-12-31" },
        filters: { includeAllModules: true },
        includeCharts: true,
        includeSummary: true,
      },
      recipients: ["ceo@reyada.com", "coo@reyada.com", "cfo@reyada.com"],
      lastGenerated: "2024-12-01T09:00:00Z",
      nextScheduled: "2025-01-01T09:00:00Z",
      status: "active",
    },
    {
      id: "clinical_performance",
      name: "Clinical Performance Report",
      description:
        "Detailed analysis of clinical outcomes, patient satisfaction, and quality metrics",
      category: "clinical",
      format: "excel",
      schedule: {
        frequency: "weekly",
        dayOfWeek: 1,
        time: "08:00",
        enabled: true,
      },
      parameters: {
        dateRange: { start: "2024-12-01", end: "2024-12-31" },
        filters: { includePatientOutcomes: true, includeQualityMetrics: true },
        includeCharts: true,
        includeSummary: true,
      },
      recipients: [
        "clinical.director@reyada.com",
        "quality.manager@reyada.com",
      ],
      lastGenerated: "2024-12-16T08:00:00Z",
      nextScheduled: "2024-12-23T08:00:00Z",
      status: "active",
    },
    {
      id: "revenue_analytics",
      name: "Revenue Analytics Report",
      description:
        "Financial performance analysis including revenue trends, collection rates, and forecasting",
      category: "financial",
      format: "pdf",
      schedule: {
        frequency: "monthly",
        dayOfMonth: 5,
        time: "10:00",
        enabled: true,
      },
      parameters: {
        dateRange: { start: "2024-12-01", end: "2024-12-31" },
        filters: { includeForecasting: true, includePayerAnalysis: true },
        includeCharts: true,
        includeSummary: true,
      },
      recipients: ["finance.director@reyada.com", "revenue.manager@reyada.com"],
      lastGenerated: "2024-12-05T10:00:00Z",
      nextScheduled: "2025-01-05T10:00:00Z",
      status: "active",
    },
  ]);

  const [generatedReports] = useState<GeneratedReport[]>([
    {
      id: "rpt_001",
      templateId: "exec_summary",
      templateName: "Executive Summary Report",
      generatedAt: "2024-12-18T09:00:00Z",
      generatedBy: "system",
      status: "completed",
      fileSize: 2048576,
      downloadUrl: "/reports/executive-summary-2024-12-18.pdf",
    },
    {
      id: "rpt_002",
      templateId: "clinical_performance",
      templateName: "Clinical Performance Report",
      generatedAt: "2024-12-18T08:00:00Z",
      generatedBy: "system",
      status: "completed",
      fileSize: 1536000,
      downloadUrl: "/reports/clinical-performance-2024-12-18.xlsx",
    },
    {
      id: "rpt_003",
      templateId: "revenue_analytics",
      templateName: "Revenue Analytics Report",
      generatedAt: "2024-12-18T10:00:00Z",
      generatedBy: "user_123",
      status: "generating",
    },
  ]);

  const [customDashboards] = useState<CustomDashboard[]>([
    {
      id: "exec_dashboard",
      name: "Executive Dashboard",
      description: "High-level KPIs and performance metrics for executive team",
      layout: {
        widgets: [
          {
            id: "revenue_metric",
            type: "metric",
            title: "Total Revenue",
            position: { x: 0, y: 0, width: 3, height: 2 },
            config: { format: "currency", trend: true },
            dataSource: "revenue_analytics",
          },
          {
            id: "patient_satisfaction",
            type: "gauge",
            title: "Patient Satisfaction",
            position: { x: 3, y: 0, width: 3, height: 2 },
            config: { min: 0, max: 5, target: 4.5 },
            dataSource: "patient_feedback",
          },
          {
            id: "revenue_trend",
            type: "chart",
            title: "Revenue Trend",
            position: { x: 0, y: 2, width: 6, height: 3 },
            config: { type: "line", period: "12M" },
            dataSource: "revenue_analytics",
          },
        ],
      },
      filters: {
        dateRange: true,
        departments: true,
        serviceLines: false,
        customFilters: [],
      },
      permissions: {
        viewers: ["executive_team", "board_members"],
        editors: ["ceo", "coo"],
        public: false,
      },
      createdBy: "admin",
      createdAt: "2024-12-01T00:00:00Z",
      updatedAt: "2024-12-18T00:00:00Z",
    },
    {
      id: "clinical_dashboard",
      name: "Clinical Operations Dashboard",
      description: "Clinical performance metrics and patient outcomes",
      layout: {
        widgets: [
          {
            id: "patient_outcomes",
            type: "chart",
            title: "Patient Outcomes",
            position: { x: 0, y: 0, width: 4, height: 3 },
            config: { type: "bar", groupBy: "outcome_type" },
            dataSource: "clinical_outcomes",
          },
          {
            id: "care_quality",
            type: "metric",
            title: "Care Quality Score",
            position: { x: 4, y: 0, width: 2, height: 2 },
            config: { format: "percentage", benchmark: 90 },
            dataSource: "quality_metrics",
          },
          {
            id: "compliance_status",
            type: "table",
            title: "Compliance Status",
            position: { x: 0, y: 3, width: 6, height: 2 },
            config: { sortable: true, filterable: true },
            dataSource: "compliance_tracking",
          },
        ],
      },
      filters: {
        dateRange: true,
        departments: false,
        serviceLines: true,
        customFilters: [
          {
            name: "Care Team",
            type: "multiselect",
            options: ["Nursing", "Therapy", "Social Work"],
          },
        ],
      },
      permissions: {
        viewers: ["clinical_staff", "quality_team"],
        editors: ["clinical_director", "quality_manager"],
        public: false,
      },
      createdBy: "clinical_director",
      createdAt: "2024-12-05T00:00:00Z",
      updatedAt: "2024-12-17T00:00:00Z",
    },
  ]);

  const [interactiveCharts] = useState<InteractiveChart[]>([
    {
      id: "revenue_trend_chart",
      type: "line",
      title: "Revenue Trend Analysis",
      dataSource: "revenue_analytics",
      configuration: {
        xAxis: "month",
        yAxis: ["total_revenue", "collected_amount"],
        groupBy: "payer_type",
        aggregation: "sum",
        filters: [],
      },
      styling: {
        colors: ["#3B82F6", "#10B981", "#F59E0B"],
        theme: "light",
        showLegend: true,
        showGrid: true,
      },
      interactivity: {
        drillDown: true,
        zoom: true,
        export: true,
        realTime: false,
      },
    },
    {
      id: "patient_satisfaction_gauge",
      type: "gauge",
      title: "Patient Satisfaction Score",
      dataSource: "patient_feedback",
      configuration: {
        xAxis: "satisfaction_score",
        yAxis: ["average_score"],
        aggregation: "avg",
        filters: [],
      },
      styling: {
        colors: ["#EF4444", "#F59E0B", "#10B981"],
        theme: "light",
        showLegend: false,
        showGrid: false,
      },
      interactivity: {
        drillDown: false,
        zoom: false,
        export: true,
        realTime: true,
      },
    },
  ]);

  const [automatedReports] = useState<AutomatedReport[]>([
    {
      id: "daily_operations_report",
      name: "Daily Operations Report",
      type: "scheduled",
      schedule: {
        frequency: "daily",
        time: "08:00",
        timezone: "Asia/Dubai",
        enabled: true,
      },
      content: {
        sections: [
          {
            id: "summary",
            type: "summary",
            title: "Daily Summary",
            content: {
              metrics: [
                "patient_visits",
                "revenue_generated",
                "compliance_score",
              ],
              period: "24h",
            },
          },
          {
            id: "patient_outcomes",
            type: "chart",
            title: "Patient Outcomes",
            content: {
              chartType: "bar",
              dataSource: "clinical_outcomes",
              period: "24h",
            },
          },
        ],
      },
      distribution: {
        email: {
          enabled: true,
          recipients: ["operations@reyada.com", "clinical@reyada.com"],
          subject: "Daily Operations Report - {{date}}",
          template: "daily_operations",
        },
        portal: {
          enabled: true,
          notify: true,
        },
        webhook: {
          enabled: false,
          url: "",
        },
      },
      lastGenerated: "2024-12-18T08:00:00Z",
      nextScheduled: "2024-12-19T08:00:00Z",
      status: "active",
    },
    {
      id: "compliance_alert_report",
      name: "Compliance Alert Report",
      type: "triggered",
      triggers: [
        {
          eventType: "compliance_violation",
          conditions: [{ field: "severity", operator: "gte", value: "high" }],
        },
        {
          eventType: "audit_finding",
          conditions: [
            { field: "category", operator: "in", value: ["critical", "major"] },
          ],
        },
      ],
      content: {
        sections: [
          {
            id: "alert_summary",
            type: "summary",
            title: "Compliance Alert Summary",
            content: {
              alertDetails: true,
              impactAssessment: true,
              recommendedActions: true,
            },
          },
          {
            id: "compliance_analysis",
            type: "analysis",
            title: "Compliance Analysis",
            content: {
              trendAnalysis: true,
              riskAssessment: true,
              benchmarking: true,
            },
          },
        ],
      },
      distribution: {
        email: {
          enabled: true,
          recipients: [
            "compliance@reyada.com",
            "legal@reyada.com",
            "ceo@reyada.com",
          ],
          subject: "URGENT: Compliance Alert - {{alert_type}}",
          template: "compliance_alert",
        },
        portal: {
          enabled: true,
          notify: true,
        },
        webhook: {
          enabled: true,
          url: "https://api.reyada.com/webhooks/compliance-alert",
        },
      },
      status: "active",
    },
  ]);

  const [dataCorrelations] = useState<DataCorrelation[]>([
    {
      id: "corr_001",
      name: "Clinical Quality ↔ Revenue Performance",
      description:
        "Correlation between clinical quality scores and revenue collection rates",
      sourceModules: ["clinical", "revenue"],
      correlationType: "positive",
      strength: 0.78,
      insights: [
        "Higher patient satisfaction scores correlate with 12% better collection rates",
        "Clinical outcome improvements lead to reduced claim denials",
        "Quality metrics above 90% show 15% higher revenue per episode",
      ],
      lastAnalyzed: "2024-12-18T12:00:00Z",
    },
    {
      id: "corr_002",
      name: "Compliance Automation ↔ Operational Efficiency",
      description:
        "Impact of automated compliance processes on operational efficiency",
      sourceModules: ["compliance", "operational"],
      correlationType: "positive",
      strength: 0.85,
      insights: [
        "Automated compliance checks reduce manual processing time by 40%",
        "Real-time compliance monitoring improves audit readiness by 65%",
        "Compliance automation correlates with 25% reduction in administrative overhead",
      ],
      lastAnalyzed: "2024-12-18T11:30:00Z",
    },
    {
      id: "corr_003",
      name: "Patient Outcomes ↔ Financial Metrics",
      description:
        "Relationship between patient health outcomes and financial performance",
      sourceModules: ["clinical", "financial"],
      correlationType: "positive",
      strength: 0.72,
      insights: [
        "Better patient outcomes reduce readmission costs by 18%",
        "Improved care coordination increases episode profitability by 22%",
        "Patient satisfaction above 4.5/5 correlates with 8% higher reimbursement rates",
      ],
      lastAnalyzed: "2024-12-18T10:45:00Z",
    },
    {
      id: "corr_004",
      name: "Staff Utilization ↔ Care Quality",
      description:
        "Impact of staff utilization rates on care quality indicators",
      sourceModules: ["administrative", "clinical"],
      correlationType: "negative",
      strength: 0.63,
      insights: [
        "Staff utilization above 90% correlates with 12% decrease in care quality scores",
        "Optimal utilization range of 80-85% maintains highest quality metrics",
        "Overutilization leads to increased incident rates and patient complaints",
      ],
      lastAnalyzed: "2024-12-18T09:15:00Z",
    },
  ]);

  const generateReport = async (templateId: string) => {
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`Generating report for template: ${templateId}`);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateStatus = (templateId: string) => {
    setReportTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? {
              ...template,
              status: template.status === "active" ? "paused" : "active",
            }
          : template,
      ),
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "executive":
        return <TrendingUp className="h-4 w-4" />;
      case "clinical":
        return <Activity className="h-4 w-4" />;
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "operational":
        return <BarChart3 className="h-4 w-4" />;
      case "compliance":
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "generating":
        return "bg-orange-100 text-orange-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCorrelationColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary" />
            Integrated Reporting Engine
          </h1>
          <p className="text-gray-600 mt-1">
            Standardized report templates, automated generation, and
            cross-module data correlation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={() => setShowTemplateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="dashboards">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="charts">
            <PieChart className="h-4 w-4 mr-2" />
            Interactive Charts
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Download className="h-4 w-4 mr-2" />
            Generated Reports
          </TabsTrigger>
          <TabsTrigger value="correlations">
            <TrendingUp className="h-4 w-4 mr-2" />
            Data Correlations
          </TabsTrigger>
          <TabsTrigger value="automation">
            <RefreshCw className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getCategoryIcon(template.category)}
                      <span className="ml-2 text-base">{template.name}</span>
                    </div>
                    <Badge className={getStatusColor(template.status)}>
                      {template.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Format:</span>
                      <span className="font-medium">
                        {template.format.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Schedule:</span>
                      <span className="font-medium">
                        {template.schedule.frequency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Recipients:</span>
                      <span className="font-medium">
                        {template.recipients.length}
                      </span>
                    </div>
                    {template.lastGenerated && (
                      <div className="text-xs text-gray-500">
                        Last generated:{" "}
                        {new Date(template.lastGenerated).toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => generateReport(template.id)}
                        disabled={loading}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTemplateStatus(template.id)}
                      >
                        {template.status === "active" ? (
                          <Pause className="w-3 h-3 mr-1" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        {template.status === "active" ? "Pause" : "Activate"}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Dashboards Tab */}
        <TabsContent value="dashboards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customDashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dashboard.name}</span>
                    <Badge variant="outline">
                      {dashboard.layout.widgets.length} widgets
                    </Badge>
                  </CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Created by:</span>
                      <span className="font-medium">{dashboard.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last updated:</span>
                      <span className="font-medium">
                        {new Date(dashboard.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Permissions:</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">
                          {dashboard.permissions.viewers.length} viewers
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dashboard.layout.widgets.slice(0, 3).map((widget) => (
                        <Badge
                          key={widget.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {widget.title}
                        </Badge>
                      ))}
                      {dashboard.layout.widgets.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{dashboard.layout.widgets.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Interactive Charts Tab */}
        <TabsContent value="charts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interactiveCharts.map((chart) => (
              <Card
                key={chart.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{chart.title}</span>
                    <Badge variant="outline">{chart.type}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Data source: {chart.dataSource}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Chart Type:</span>
                      <span className="font-medium capitalize">
                        {chart.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Aggregation:</span>
                      <span className="font-medium capitalize">
                        {chart.configuration.aggregation}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Real-time:</span>
                      <Badge
                        variant={
                          chart.interactivity.realTime ? "default" : "secondary"
                        }
                      >
                        {chart.interactivity.realTime ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">Features:</span>
                      <div className="flex flex-wrap gap-1">
                        {chart.interactivity.drillDown && (
                          <Badge variant="secondary" className="text-xs">
                            Drill-down
                          </Badge>
                        )}
                        {chart.interactivity.zoom && (
                          <Badge variant="secondary" className="text-xs">
                            Zoom
                          </Badge>
                        )}
                        {chart.interactivity.export && (
                          <Badge variant="secondary" className="text-xs">
                            Export
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View Chart
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Generated Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="space-y-4">
            {generatedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <h3 className="font-semibold">{report.templateName}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Generated:</span>
                          <div>
                            {new Date(report.generatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Generated By:</span>
                          <div>
                            {report.generatedBy === "system"
                              ? "Automated"
                              : "Manual"}
                          </div>
                        </div>
                        {report.fileSize && (
                          <div>
                            <span className="font-medium">File Size:</span>
                            <div>{formatFileSize(report.fileSize)}</div>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Report ID:</span>
                          <div className="font-mono text-xs">{report.id}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === "generating" && (
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                      )}
                      {report.status === "completed" && (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                      {report.status === "failed" && (
                        <Button size="sm" variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Correlations Tab */}
        <TabsContent value="correlations" className="mt-6">
          <div className="space-y-6">
            {dataCorrelations.map((correlation) => (
              <Card key={correlation.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{correlation.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {Math.round(correlation.strength * 100)}% correlation
                      </Badge>
                      <Badge
                        className={`${getCorrelationColor(correlation.correlationType)} bg-opacity-10`}
                      >
                        {correlation.correlationType}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>{correlation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Source Modules:</span>
                      {correlation.sourceModules.map((module) => (
                        <Badge key={module} variant="secondary">
                          {module}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <span className="font-medium text-sm">Key Insights:</span>
                      <ul className="space-y-1">
                        {correlation.insights.map((insight, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 flex items-start"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last analyzed:{" "}
                      {new Date(correlation.lastAnalyzed).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Automated Reports
                  </CardTitle>
                  <CardDescription>
                    Scheduled and triggered report generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {automatedReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-gray-500">
                            {report.type === "scheduled" && report.schedule
                              ? `${report.schedule.frequency} at ${report.schedule.time}`
                              : report.type === "triggered"
                                ? `Triggered by ${report.triggers?.length} events`
                                : "On demand"}
                          </div>
                          {report.nextScheduled && (
                            <div className="text-xs text-gray-400">
                              Next:{" "}
                              {new Date(report.nextScheduled).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Distribution Channels
                  </CardTitle>
                  <CardDescription>
                    Configure how reports are delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">
                            Email Distribution
                          </span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {
                          automatedReports.filter(
                            (r) => r.distribution.email.enabled,
                          ).length
                        }{" "}
                        reports configured
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span className="font-medium">
                            Portal Notifications
                          </span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {
                          automatedReports.filter(
                            (r) => r.distribution.portal.enabled,
                          ).length
                        }{" "}
                        reports configured
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          <span className="font-medium">
                            Webhook Integration
                          </span>
                        </div>
                        <Badge variant="secondary">Limited</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {
                          automatedReports.filter(
                            (r) => r.distribution.webhook.enabled,
                          ).length
                        }{" "}
                        reports configured
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Configure New Channel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Report Generation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-500">
                      Reports Generated Today
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      98.5%
                    </div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      2.3s
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg Generation Time
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      156
                    </div>
                    <div className="text-sm text-gray-500">
                      Active Recipients
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="schedule" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Scheduled Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportTemplates
                    .filter((template) => template.schedule.enabled)
                    .map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">
                            {template.schedule.frequency} at{" "}
                            {template.schedule.time}
                          </div>
                          {template.nextScheduled && (
                            <div className="text-xs text-gray-400">
                              Next:{" "}
                              {new Date(
                                template.nextScheduled,
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(template.status)}>
                            {template.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Distribution Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Recipients</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">admin@reyada.com</Badge>
                      <Badge variant="secondary">reports@reyada.com</Badge>
                      <Button size="sm" variant="outline">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Template</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          Standard Template
                        </SelectItem>
                        <SelectItem value="executive">
                          Executive Summary
                        </SelectItem>
                        <SelectItem value="detailed">
                          Detailed Report
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="email" defaultChecked />
                        <label htmlFor="email" className="text-sm">
                          Email delivery
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="portal" defaultChecked />
                        <label htmlFor="portal" className="text-sm">
                          Portal notification
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="archive" defaultChecked />
                        <label htmlFor="archive" className="text-sm">
                          Archive reports
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Report Template</DialogTitle>
            <DialogDescription>
              Configure a new automated report template with scheduling and
              distribution settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="Enter template name" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe what this report will contain" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="on-demand">On Demand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowTemplateDialog(false)}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegratedReportingEngine;
