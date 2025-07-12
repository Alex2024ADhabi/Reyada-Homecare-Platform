/**
 * Signature Report Builder
 * P3-002.1.3: Advanced Report Builder for Signature Analytics
 *
 * Interactive report builder with drag-and-drop interface,
 * custom filters, and scheduled report generation.
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
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
  Plus,
  Trash2,
  Edit,
  Play,
  Save,
  Copy,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Users,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "compliance" | "performance" | "audit" | "custom";
  sections: ReportSection[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  format: "pdf" | "excel" | "csv" | "json";
  recipients?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ReportSection {
  id: string;
  type: "chart" | "table" | "metric" | "text";
  title: string;
  dataSource: string;
  configuration: any;
  position: { x: number; y: number; width: number; height: number };
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "greater" | "less" | "between" | "in";
  value: any;
  label: string;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
}

export interface SignatureReportBuilderProps {
  templates?: ReportTemplate[];
  onSaveTemplate?: (template: ReportTemplate) => Promise<void>;
  onGenerateReport?: (template: ReportTemplate) => Promise<void>;
  onScheduleReport?: (template: ReportTemplate) => Promise<void>;
  className?: string;
}

const AVAILABLE_SECTIONS = [
  {
    type: "chart",
    icon: BarChart3,
    title: "Bar Chart",
    description: "Display data as bar charts",
  },
  {
    type: "chart",
    icon: PieChart,
    title: "Pie Chart",
    description: "Show data distribution",
  },
  {
    type: "chart",
    icon: LineChart,
    title: "Line Chart",
    description: "Track trends over time",
  },
  {
    type: "table",
    icon: Table,
    title: "Data Table",
    description: "Tabular data display",
  },
  {
    type: "metric",
    icon: TrendingUp,
    title: "Key Metrics",
    description: "Important KPIs and metrics",
  },
];

const AVAILABLE_DATA_SOURCES = [
  { value: "signatures", label: "Signature Data" },
  { value: "workflows", label: "Workflow Data" },
  { value: "audit", label: "Audit Entries" },
  { value: "compliance", label: "Compliance Metrics" },
  { value: "performance", label: "Performance Data" },
  { value: "users", label: "User Activity" },
];

const SignatureReportBuilder: React.FC<SignatureReportBuilderProps> = ({
  templates = [],
  onSaveTemplate,
  onGenerateReport,
  onScheduleReport,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<
    Partial<ReportTemplate>
  >({});
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [draggedSection, setDraggedSection] = useState<any>(null);

  // Initialize with sample templates
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: "template_001",
      name: "DOH Compliance Report",
      description: "Comprehensive DOH compliance analysis with audit trails",
      category: "compliance",
      sections: [
        {
          id: "section_001",
          type: "metric",
          title: "Compliance Overview",
          dataSource: "compliance",
          configuration: {
            metrics: ["complianceRate", "violations", "warnings"],
          },
          position: { x: 0, y: 0, width: 12, height: 4 },
        },
        {
          id: "section_002",
          type: "chart",
          title: "Compliance Trends",
          dataSource: "audit",
          configuration: {
            chartType: "line",
            xAxis: "date",
            yAxis: "complianceRate",
          },
          position: { x: 0, y: 4, width: 8, height: 6 },
        },
        {
          id: "section_003",
          type: "table",
          title: "Non-Compliant Signatures",
          dataSource: "signatures",
          configuration: {
            columns: ["id", "user", "timestamp", "violations"],
            filter: { complianceStatus: "non_compliant" },
          },
          position: { x: 8, y: 4, width: 4, height: 6 },
        },
      ],
      filters: [
        {
          id: "filter_001",
          field: "timestamp",
          operator: "between",
          value: ["2024-01-01", "2024-12-31"],
          label: "Date Range",
        },
      ],
      format: "pdf",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "System",
    },
    {
      id: "template_002",
      name: "Performance Analytics Report",
      description: "Detailed performance metrics and bottleneck analysis",
      category: "performance",
      sections: [
        {
          id: "section_004",
          type: "metric",
          title: "Performance KPIs",
          dataSource: "performance",
          configuration: {
            metrics: ["averageTime", "throughput", "errorRate"],
          },
          position: { x: 0, y: 0, width: 12, height: 3 },
        },
        {
          id: "section_005",
          type: "chart",
          title: "Response Time Trends",
          dataSource: "performance",
          configuration: {
            chartType: "line",
            xAxis: "timestamp",
            yAxis: "responseTime",
          },
          position: { x: 0, y: 3, width: 6, height: 5 },
        },
        {
          id: "section_006",
          type: "chart",
          title: "Device Performance",
          dataSource: "performance",
          configuration: {
            chartType: "bar",
            xAxis: "deviceType",
            yAxis: "averageTime",
          },
          position: { x: 6, y: 3, width: 6, height: 5 },
        },
      ],
      filters: [],
      format: "excel",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "System",
    },
  ]);

  const handleCreateTemplate = () => {
    setEditingTemplate({
      name: "",
      description: "",
      category: "custom",
      sections: [],
      filters: [],
      format: "pdf",
    });
    setIsEditing(true);
    setShowTemplateDialog(true);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
    setShowTemplateDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate.name) return;

    const template: ReportTemplate = {
      id: editingTemplate.id || `template_${Date.now()}`,
      name: editingTemplate.name!,
      description: editingTemplate.description || "",
      category: editingTemplate.category || "custom",
      sections: editingTemplate.sections || [],
      filters: editingTemplate.filters || [],
      format: editingTemplate.format || "pdf",
      recipients: editingTemplate.recipients,
      schedule: editingTemplate.schedule,
      createdAt: editingTemplate.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: editingTemplate.createdBy || "Current User",
    };

    if (editingTemplate.id) {
      // Update existing template
      setReportTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? template : t)),
      );
    } else {
      // Add new template
      setReportTemplates((prev) => [...prev, template]);
    }

    await onSaveTemplate?.(template);
    setShowTemplateDialog(false);
    setIsEditing(false);
    setEditingTemplate({});
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    await onGenerateReport?.(template);
  };

  const handleScheduleReport = async (template: ReportTemplate) => {
    await onScheduleReport?.(template);
  };

  const handleAddSection = (sectionType: any) => {
    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type: sectionType.type,
      title: sectionType.title,
      dataSource: "signatures",
      configuration: {},
      position: { x: 0, y: 0, width: 6, height: 4 },
    };

    setEditingTemplate((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
  };

  const handleRemoveSection = (sectionId: string) => {
    setEditingTemplate((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((s) => s.id !== sectionId),
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "compliance":
        return "bg-blue-100 text-blue-800";
      case "performance":
        return "bg-green-100 text-green-800";
      case "audit":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("space-y-6 bg-white p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Signature Report Builder
          </h1>
          <p className="text-gray-600 mt-1">
            Create custom reports with drag-and-drop interface
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleCreateTemplate}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        getCategoryColor(template.category),
                      )}
                    >
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sections:</span>
                      <span className="font-medium">
                        {template.sections.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium uppercase">
                        {template.format}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport(template)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowScheduleDialog(true);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {AVAILABLE_SECTIONS.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleAddSection(section)}
                    >
                      <div className="text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h4 className="font-medium text-sm">{section.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Report Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {editingTemplate.sections?.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Drag components here to build your report</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingTemplate.sections?.map((section) => (
                        <div
                          key={section.id}
                          className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{section.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {section.type}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveSection(section.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Data Source: {section.dataSource}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTemplates
                  .filter((t) => t.schedule?.enabled)
                  .map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          {template.schedule?.frequency} at{" "}
                          {template.schedule?.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {template.schedule?.frequency}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {reportTemplates.filter((t) => t.schedule?.enabled).length ===
                  0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No scheduled reports configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate.id ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              Configure your report template settings and structure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={editingTemplate.name || ""}
                  onChange={(e) =>
                    setEditingTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingTemplate.category}
                  onValueChange={(value) =>
                    setEditingTemplate((prev) => ({
                      ...prev,
                      category: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingTemplate.description || ""}
                onChange={(e) =>
                  setEditingTemplate((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this report covers"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <Select
                  value={editingTemplate.format}
                  onValueChange={(value) =>
                    setEditingTemplate((prev) => ({
                      ...prev,
                      format: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
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
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Configure automatic report generation schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="enabled" />
              <Label htmlFor="enabled">Enable scheduled generation</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowScheduleDialog(false)}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignatureReportBuilder;
