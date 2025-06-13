import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Download,
  Save,
  Play,
  Settings,
  BarChart3,
  Table,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Copy,
  Share,
  FileText,
  Mail,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage, T } from "@/components/ui/multi-language-support";
import { backupRecoveryService } from "@/services/backup-recovery.service";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ReportField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean" | "select";
  source: string;
  options?: string[];
  aggregation?: "sum" | "count" | "avg" | "min" | "max";
  format?: string;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "greater" | "less" | "between" | "in";
  value: any;
  label?: string;
}

export interface ReportSort {
  field: string;
  direction: "asc" | "desc";
}

export interface ReportVisualization {
  type: "table" | "bar" | "line" | "pie" | "metric";
  title: string;
  fields: string[];
  config?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  fields: ReportField[];
  filters: ReportFilter[];
  sorting: ReportSort[];
  visualizations: ReportVisualization[];
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    time: string;
    recipients: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ReportBuilderProps {
  availableFields: ReportField[];
  onSave: (
    template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">,
  ) => void;
  onRun: (template: ReportTemplate) => void;
  onExport: (template: ReportTemplate, format: "pdf" | "excel" | "csv") => void;
  existingTemplate?: ReportTemplate;
  className?: string;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  availableFields,
  onSave,
  onRun,
  onExport,
  existingTemplate,
  className,
}) => {
  const { t, isRTL } = useLanguage();
  const [template, setTemplate] = React.useState<
    Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">
  >({
    name: existingTemplate?.name || "",
    description: existingTemplate?.description || "",
    fields: existingTemplate?.fields || [],
    filters: existingTemplate?.filters || [],
    sorting: existingTemplate?.sorting || [],
    visualizations: existingTemplate?.visualizations || [],
    schedule: existingTemplate?.schedule,
  });

  const [activeTab, setActiveTab] = React.useState<
    "fields" | "filters" | "sorting" | "visualizations" | "schedule"
  >("fields");
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  const [reportTemplates, setReportTemplates] = React.useState<any[]>([]);
  const [complianceChecks, setComplianceChecks] = React.useState({
    dohCompliant: false,
    dataPrivacy: false,
    auditTrail: false,
    electronicSignature: false,
  });

  const addField = (field: ReportField) => {
    if (!template.fields.find((f) => f.id === field.id)) {
      setTemplate((prev) => ({
        ...prev,
        fields: [...prev.fields, field],
      }));
    }
  };

  const removeField = (fieldId: string) => {
    setTemplate((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: `filter_${Date.now()}`,
      field: "",
      operator: "equals",
      value: "",
    };
    setTemplate((prev) => ({
      ...prev,
      filters: [...prev.filters, newFilter],
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setTemplate((prev) => ({
      ...prev,
      filters: prev.filters.map((f) =>
        f.id === filterId ? { ...f, ...updates } : f,
      ),
    }));
  };

  const removeFilter = (filterId: string) => {
    setTemplate((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.id !== filterId),
    }));
  };

  const addSort = (field: string, direction: "asc" | "desc") => {
    setTemplate((prev) => ({
      ...prev,
      sorting: [
        ...prev.sorting.filter((s) => s.field !== field),
        { field, direction },
      ],
    }));
  };

  const removeSort = (field: string) => {
    setTemplate((prev) => ({
      ...prev,
      sorting: prev.sorting.filter((s) => s.field !== field),
    }));
  };

  const addVisualization = (type: ReportVisualization["type"]) => {
    const newViz: ReportVisualization = {
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      fields: [],
    };
    setTemplate((prev) => ({
      ...prev,
      visualizations: [...prev.visualizations, newViz],
    }));
  };

  const updateVisualization = (
    index: number,
    updates: Partial<ReportVisualization>,
  ) => {
    setTemplate((prev) => ({
      ...prev,
      visualizations: prev.visualizations.map((v, i) =>
        i === index ? { ...v, ...updates } : v,
      ),
    }));
  };

  const removeVisualization = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      visualizations: prev.visualizations.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (template.name.trim()) {
      onSave(template);
    }
  };

  const handleRun = async () => {
    if (existingTemplate) {
      setIsGenerating(true);
      setGenerationProgress(0);

      // Simulate report generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Create backup before running report
        await backupRecoveryService.executeBackup("daily-full-backup");

        await onRun({ ...existingTemplate, ...template });
        setGenerationProgress(100);
        setTimeout(() => {
          setIsGenerating(false);
          setGenerationProgress(0);
        }, 1000);
      } catch (error) {
        setIsGenerating(false);
        setGenerationProgress(0);
        console.error("Report generation failed:", error);
      }
    }
  };

  const handlePreview = () => {
    // Generate mock preview data based on selected fields
    const mockData = Array.from({ length: 10 }, (_, i) => {
      const row: Record<string, any> = {};
      template.fields.forEach((field) => {
        switch (field.type) {
          case "text":
            row[field.name] = `Sample ${field.name} ${i + 1}`;
            break;
          case "number":
            row[field.name] = Math.floor(Math.random() * 1000);
            break;
          case "date":
            row[field.name] = format(
              new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd",
            );
            break;
          case "boolean":
            row[field.name] = Math.random() > 0.5;
            break;
          default:
            row[field.name] = `Value ${i + 1}`;
        }
      });
      return row;
    });
    setPreviewData(mockData);
    setIsPreviewOpen(true);
  };

  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Fields</h3>
        <Badge variant="secondary">{template.fields.length} selected</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {availableFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-sm">{field.name}</div>
                  <div className="text-xs text-gray-500">
                    {field.type} • {field.source}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addField(field)}
                  disabled={template.fields.some((f) => f.id === field.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {template.fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-2 border rounded bg-blue-50"
              >
                <div>
                  <div className="font-medium text-sm">{field.name}</div>
                  <div className="text-xs text-gray-500">
                    {field.type} • {field.source}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeField(field.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFiltersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button onClick={addFilter} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </Button>
      </div>

      <div className="space-y-3">
        {template.filters.map((filter) => (
          <Card key={filter.id}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <Label>Field</Label>
                  <Select
                    value={filter.field}
                    onValueChange={(value) =>
                      updateFilter(filter.id, { field: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {template.fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Operator</Label>
                  <Select
                    value={filter.operator}
                    onValueChange={(value: any) =>
                      updateFilter(filter.id, { operator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater">Greater than</SelectItem>
                      <SelectItem value="less">Less than</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                      <SelectItem value="in">In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Value</Label>
                  <Input
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(filter.id, { value: e.target.value })
                    }
                    placeholder="Enter value"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {template.filters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No filters added. Click "Add Filter" to create one.
          </div>
        )}
      </div>
    </div>
  );

  const renderSortingTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sorting</h3>

      <div className="space-y-3">
        {template.fields.map((field) => {
          const sort = template.sorting.find((s) => s.field === field.id);
          return (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <div className="font-medium">{field.name}</div>
                <div className="text-sm text-gray-500">{field.type}</div>
              </div>
              <div className="flex items-center space-x-2">
                {sort && (
                  <Badge variant="secondary">
                    {sort.direction === "asc" ? "Ascending" : "Descending"}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addSort(field.id, "asc")}>
                      <SortAsc className="h-4 w-4 mr-2" />
                      Sort Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addSort(field.id, "desc")}>
                      <SortDesc className="h-4 w-4 mr-2" />
                      Sort Descending
                    </DropdownMenuItem>
                    {sort && (
                      <DropdownMenuItem onClick={() => removeSort(field.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Sort
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderVisualizationsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Visualizations</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Chart
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addVisualization("table")}>
              <Table className="h-4 w-4 mr-2" />
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addVisualization("bar")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Bar Chart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addVisualization("line")}>
              <LineChart className="h-4 w-4 mr-2" />
              Line Chart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addVisualization("pie")}>
              <PieChart className="h-4 w-4 mr-2" />
              Pie Chart
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template.visualizations.map((viz, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{viz.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeVisualization(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={viz.title}
                  onChange={(e) =>
                    updateVisualization(index, { title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Fields</Label>
                <div className="space-y-2">
                  {template.fields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={viz.fields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          const newFields = checked
                            ? [...viz.fields, field.id]
                            : viz.fields.filter((f) => f !== field.id);
                          updateVisualization(index, { fields: newFields });
                        }}
                      />
                      <Label className="text-sm">{field.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {template.visualizations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No visualizations added. Click "Add Chart" to create one.
        </div>
      )}
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Schedule (Optional)</h3>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!template.schedule}
              onCheckedChange={(checked) => {
                setTemplate((prev) => ({
                  ...prev,
                  schedule: checked
                    ? {
                        frequency: "daily",
                        time: "09:00",
                        recipients: [],
                      }
                    : undefined,
                }));
              }}
            />
            <Label>Enable automatic report generation</Label>
          </div>

          {template.schedule && (
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={template.schedule.frequency}
                    onValueChange={(value: any) =>
                      setTemplate((prev) => ({
                        ...prev,
                        schedule: prev.schedule
                          ? { ...prev.schedule, frequency: value }
                          : undefined,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={template.schedule.time}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        schedule: prev.schedule
                          ? { ...prev.schedule, time: e.target.value }
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Recipients (comma-separated emails)</Label>
                <Textarea
                  value={template.schedule.recipients.join(", ")}
                  onChange={(e) =>
                    setTemplate((prev) => ({
                      ...prev,
                      schedule: prev.schedule
                        ? {
                            ...prev.schedule,
                            recipients: e.target.value
                              .split(",")
                              .map((email) => email.trim())
                              .filter(Boolean),
                          }
                        : undefined,
                    }))
                  }
                  placeholder="user1@example.com, user2@example.com"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced DOH compliance checking
  React.useEffect(() => {
    const checkCompliance = () => {
      const checks = {
        dohCompliant: template.fields.some(
          (f) =>
            f.name.toLowerCase().includes("doh") ||
            f.name.toLowerCase().includes("compliance"),
        ),
        dataPrivacy: template.fields.some(
          (f) =>
            f.name.toLowerCase().includes("privacy") ||
            f.name.toLowerCase().includes("gdpr"),
        ),
        auditTrail: template.fields.some(
          (f) =>
            f.name.toLowerCase().includes("audit") ||
            f.name.toLowerCase().includes("log"),
        ),
        electronicSignature: template.fields.some(
          (f) =>
            f.name.toLowerCase().includes("signature") ||
            f.name.toLowerCase().includes("sign"),
        ),
      };
      setComplianceChecks(checks);
    };
    checkCompliance();
  }, [template.fields]);

  return (
    <div className={cn("w-full space-y-6 bg-white", isRTL && "rtl", className)}>
      {/* Enhanced Header with Compliance Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <Input
                value={template.name}
                onChange={(e) =>
                  setTemplate((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("reports.template") || "Report Name"}
                className="text-xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <Textarea
              value={template.description}
              onChange={(e) =>
                setTemplate((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                t("reports.description") || "Report description (optional)"
              }
              className="text-sm text-gray-600 bg-transparent border-none p-0 resize-none focus-visible:ring-0"
              rows={2}
              dir={isRTL ? "rtl" : "ltr"}
            />

            {/* Compliance Status */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  complianceChecks.dohCompliant ? "default" : "secondary"
                }
                className="gap-1"
              >
                {complianceChecks.dohCompliant ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                <T k="compliance.dohCompliant" fallback="DOH Compliant" />
              </Badge>
              <Badge
                variant={complianceChecks.dataPrivacy ? "default" : "secondary"}
                className="gap-1"
              >
                {complianceChecks.dataPrivacy ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                <T k="compliance.dataPrivacy" fallback="Data Privacy" />
              </Badge>
              <Badge
                variant={complianceChecks.auditTrail ? "default" : "secondary"}
                className="gap-1"
              >
                {complianceChecks.auditTrail ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                <T k="compliance.auditTrail" fallback="Audit Trail" />
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Generation Progress */}
            {isGenerating && (
              <div className="w-full sm:w-48 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>
                    <T k="reports.generating" fallback="Generating..." />
                  </span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={isGenerating}
              >
                <Eye className="h-4 w-4 mr-2" />
                <T k="reports.preview" fallback="Preview" />
              </Button>
              <Button
                variant="outline"
                onClick={handleRun}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                <T k="reports.run" fallback="Run" />
              </Button>
              <Button onClick={handleSave} disabled={isGenerating}>
                <Save className="h-4 w-4 mr-2" />
                <T k="common.save" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isGenerating}>
                    <Download className="h-4 w-4 mr-2" />
                    <T k="common.export" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      existingTemplate && onExport(existingTemplate, "pdf")
                    }
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <T k="reports.exportPdf" fallback="Export as PDF" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      existingTemplate && onExport(existingTemplate, "excel")
                    }
                  >
                    <Table className="h-4 w-4 mr-2" />
                    <T k="reports.exportExcel" fallback="Export as Excel" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      existingTemplate && onExport(existingTemplate, "csv")
                    }
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <T k="reports.exportCsv" fallback="Export as CSV" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                <T k="common.share" fallback="Share" />
              </Button>
            </div>
          </div>
        </div>

        {/* DOH Compliance Alert */}
        {!complianceChecks.dohCompliant && (
          <Alert className="mt-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <T
                k="reports.dohComplianceWarning"
                fallback="This report may not meet DOH compliance requirements. Consider adding compliance-related fields."
              />
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Enhanced Tabs with Progress Indicators */}
      <div className="border-b bg-white">
        <nav
          className={cn(
            "flex overflow-x-auto",
            isRTL ? "flex-row-reverse" : "",
          )}
        >
          {[
            {
              id: "fields",
              label: t("reports.fields") || "Fields",
              icon: Table,
              count: template.fields.length,
            },
            {
              id: "filters",
              label: t("reports.filters") || "Filters",
              icon: Filter,
              count: template.filters.length,
            },
            {
              id: "sorting",
              label: t("reports.sorting") || "Sorting",
              icon: SortAsc,
              count: template.sorting.length,
            },
            {
              id: "visualizations",
              label: t("reports.charts") || "Charts",
              icon: BarChart3,
              count: template.visualizations.length,
            },
            {
              id: "schedule",
              label: t("reports.schedule") || "Schedule",
              icon: Calendar,
              count: template.schedule ? 1 : 0,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === "fields" && renderFieldsTab()}
        {activeTab === "filters" && renderFiltersTab()}
        {activeTab === "sorting" && renderSortingTab()}
        {activeTab === "visualizations" && renderVisualizationsTab()}
        {activeTab === "schedule" && renderScheduleTab()}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              Preview of your report with sample data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {template.fields.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {template.fields.map((field) => (
                        <th
                          key={field.id}
                          className="border border-gray-300 px-4 py-2 text-left font-medium"
                        >
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {template.fields.map((field) => (
                          <td
                            key={field.id}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {String(row[field.name] || "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {template.fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No fields selected. Please add fields to see the preview.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportBuilder;
