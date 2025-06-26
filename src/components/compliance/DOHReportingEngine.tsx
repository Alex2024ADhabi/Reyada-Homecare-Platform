/**
 * DOH Reporting Engine
 * P4-004: DOH Reporting Engine (64h)
 *
 * Automated reporting system for DOH compliance requirements
 * with scheduled reports, custom templates, and regulatory submissions.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  Eye,
  RefreshCw,
  BarChart3,
  Filter,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DOHReportTemplate {
  id: string;
  name: string;
  description: string;
  type:
    | "compliance"
    | "quality"
    | "safety"
    | "performance"
    | "financial"
    | "operational";
  frequency:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "annually"
    | "on_demand";
  regulatoryRequirement: string;
  dataFields: {
    field: string;
    label: string;
    type: "text" | "number" | "date" | "boolean" | "select" | "multiselect";
    required: boolean;
    validation?: any;
    options?: string[];
  }[];
  calculations: {
    field: string;
    formula: string;
    description: string;
  }[];
  format: "pdf" | "excel" | "csv" | "xml" | "json";
  recipients: {
    type: "internal" | "doh" | "external";
    email: string;
    name: string;
    role: string;
  }[];
  submissionDeadline?: {
    daysFromPeriodEnd: number;
    timeOfDay: string;
  };
  lastUpdated: string;
  createdBy: string;
}

export interface DOHReport {
  id: string;
  templateId: string;
  templateName: string;
  title: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
    type: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  };
  status: "draft" | "pending_review" | "approved" | "submitted" | "rejected";
  data: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  submissionReference?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "critical";
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  auditTrail: {
    timestamp: string;
    action: string;
    userId: string;
    userName: string;
    details: any;
  }[];
  validationResults: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface ReportingSchedule {
  id: string;
  templateId: string;
  templateName: string;
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for annually
  timeOfDay: string; // HH:MM format
  autoSubmit: boolean;
  nextRunDate: string;
  lastRunDate?: string;
  lastRunStatus?: "success" | "failed" | "partial";
  notifications: {
    onGeneration: boolean;
    onSubmission: boolean;
    onFailure: boolean;
    recipients: string[];
  };
}

export interface DOHReportingEngineProps {
  templates?: DOHReportTemplate[];
  reports?: DOHReport[];
  schedules?: ReportingSchedule[];
  onGenerateReport?: (templateId: string, period: any) => Promise<DOHReport>;
  onSubmitReport?: (reportId: string) => Promise<void>;
  onCreateTemplate?: (template: Partial<DOHReportTemplate>) => Promise<void>;
  onUpdateTemplate?: (template: DOHReportTemplate) => Promise<void>;
  onCreateSchedule?: (schedule: Partial<ReportingSchedule>) => Promise<void>;
  onUpdateSchedule?: (schedule: ReportingSchedule) => Promise<void>;
  onDownloadReport?: (reportId: string, format: string) => Promise<void>;
  onRefresh?: () => void;
  className?: string;
}

const DOHReportingEngine: React.FC<DOHReportingEngineProps> = ({
  templates = [
    {
      id: "doh-monthly-compliance",
      name: "Monthly Compliance Report",
      description: "Monthly DOH compliance status report",
      type: "compliance",
      frequency: "monthly",
      regulatoryRequirement: "DOH Circular 2024-001",
      dataFields: [
        {
          field: "totalPatients",
          label: "Total Patients Served",
          type: "number",
          required: true,
        },
        {
          field: "complianceScore",
          label: "Overall Compliance Score",
          type: "number",
          required: true,
          validation: { min: 0, max: 100 },
        },
        {
          field: "incidentCount",
          label: "Safety Incidents",
          type: "number",
          required: true,
        },
      ],
      calculations: [
        {
          field: "complianceRate",
          formula: "(complianceScore / 100) * 100",
          description: "Compliance rate percentage",
        },
      ],
      format: "pdf",
      recipients: [
        {
          type: "doh",
          email: "compliance@doh.gov.ae",
          name: "DOH Compliance Team",
          role: "Regulatory Authority",
        },
      ],
      submissionDeadline: {
        daysFromPeriodEnd: 15,
        timeOfDay: "17:00",
      },
      lastUpdated: new Date().toISOString(),
      createdBy: "admin",
    },
  ],
  reports = [
    {
      id: "report-001",
      templateId: "doh-monthly-compliance",
      templateName: "Monthly Compliance Report",
      title: "December 2024 Compliance Report",
      reportPeriod: {
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        type: "monthly",
      },
      status: "pending_review",
      data: {
        totalPatients: 245,
        complianceScore: 87.5,
        incidentCount: 3,
      },
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      generatedBy: "system",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      attachments: [],
      auditTrail: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action: "report_generated",
          userId: "system",
          userName: "System",
          details: { automated: true },
        },
      ],
      validationResults: {
        isValid: true,
        errors: [],
        warnings: [],
      },
    },
  ],
  schedules = [
    {
      id: "schedule-001",
      templateId: "doh-monthly-compliance",
      templateName: "Monthly Compliance Report",
      enabled: true,
      frequency: "monthly",
      dayOfMonth: 1,
      timeOfDay: "09:00",
      autoSubmit: false,
      nextRunDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastRunDate: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastRunStatus: "success",
      notifications: {
        onGeneration: true,
        onSubmission: true,
        onFailure: true,
        recipients: ["admin@facility.com"],
      },
    },
  ],
  onGenerateReport,
  onSubmitReport,
  onCreateTemplate,
  onUpdateTemplate,
  onCreateSchedule,
  onUpdateSchedule,
  onDownloadReport,
  onRefresh,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState("reports");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DOHReportTemplate | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ReportingSchedule | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        filterStatus === "all" || report.status === filterStatus;
      const template = templates.find((t) => t.id === report.templateId);
      const matchesType = filterType === "all" || template?.type === filterType;
      return matchesStatus && matchesType;
    });
  }, [reports, templates, filterStatus, filterType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const pendingReports = reports.filter(
      (r) => r.status === "pending_review",
    ).length;
    const overdueReports = reports.filter((r) => {
      if (!r.dueDate) return false;
      return new Date(r.dueDate) < new Date() && r.status !== "submitted";
    }).length;
    const submittedReports = reports.filter(
      (r) => r.status === "submitted",
    ).length;

    return { totalReports, pendingReports, overdueReports, submittedReports };
  }, [reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "pending_review":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const now = new Date();
    const period = {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0],
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
      type: template.frequency,
    };

    await onGenerateReport?.(templateId, period);
  };

  return (
    <div className={cn("space-y-6 bg-white", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              DOH Reporting Engine
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overdue Reports Alert */}
      {stats.overdueReports > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {stats.overdueReports} report(s) are overdue for submission
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTab("reports")}
              >
                View Reports
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingReports}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdueReports}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.submittedReports}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    // Open generate report dialog
                  }}
                  className="ml-auto flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const template = templates.find(
                (t) => t.id === report.templateId,
              );
              const isOverdue =
                report.dueDate &&
                new Date(report.dueDate) < new Date() &&
                report.status !== "submitted";

              return (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{report.title}</h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              getStatusColor(report.status),
                            )}
                          >
                            {report.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-xs",
                              getPriorityColor(report.priority),
                            )}
                          >
                            {report.priority.toUpperCase()}
                          </Badge>
                          {template && (
                            <Badge variant="outline" className="text-xs">
                              {template.type.toUpperCase()}
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge className="text-xs bg-red-100 text-red-800">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Period:{" "}
                          {new Date(
                            report.reportPeriod.startDate,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            report.reportPeriod.endDate,
                          ).toLocaleDateString()}
                        </p>
                        <div className="text-xs text-gray-500">
                          Generated:{" "}
                          {new Date(report.generatedAt).toLocaleString()}
                        </div>
                        {report.dueDate && (
                          <div
                            className={cn(
                              "text-xs",
                              isOverdue ? "text-red-600" : "text-gray-500",
                            )}
                          >
                            Due: {new Date(report.dueDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDownloadReport?.(report.id, "pdf")}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        {report.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => onSubmitReport?.(report.id)}
                            className="flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Submit
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Validation Results */}
                    {!report.validationResults.isValid && (
                      <div className="mt-3 pt-3 border-t">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              {report.validationResults.errors.map(
                                (error, index) => (
                                  <div key={index} className="text-sm">
                                    • {error}
                                  </div>
                                ),
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report Templates</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsTemplateDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {template.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.frequency.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {template.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Requirement: {template.regulatoryRequirement}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fields: {template.dataFields.length} | Recipients:{" "}
                          {template.recipients.length}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReport(template.id)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Generate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsTemplateDialogOpen(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Edit
                        </Button>
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
              <div className="flex items-center justify-between">
                <CardTitle>Reporting Schedules</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedSchedule(null);
                    setIsScheduleDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {schedule.templateName}
                          </h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              schedule.enabled
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800",
                            )}
                          >
                            {schedule.enabled ? "ENABLED" : "DISABLED"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {schedule.frequency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Next run:{" "}
                          {new Date(schedule.nextRunDate).toLocaleString()}
                        </div>
                        {schedule.lastRunDate && (
                          <div className="text-xs text-gray-500">
                            Last run:{" "}
                            {new Date(schedule.lastRunDate).toLocaleString()} -
                            <span
                              className={cn(
                                "ml-1",
                                schedule.lastRunStatus === "success"
                                  ? "text-green-600"
                                  : schedule.lastRunStatus === "failed"
                                    ? "text-red-600"
                                    : "text-yellow-600",
                              )}
                            >
                              {schedule.lastRunStatus?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsScheduleDialogOpen(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Submission Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">On-Time Rate</p>
                    <p className="text-xl font-bold text-green-600">94.2%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Processing Time</p>
                    <p className="text-xl font-bold">2.3 days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Auto-Generated</p>
                    <p className="text-xl font-bold">78%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rejection Rate</p>
                    <p className="text-xl font-bold text-red-600">2.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => {
                  const templateReports = reports.filter(
                    (r) => r.templateId === template.id,
                  );
                  return (
                    <div
                      key={template.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{template.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {templateReports.length}
                        </span>
                        <span className="text-xs text-gray-500">reports</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DOHReportingEngine;
