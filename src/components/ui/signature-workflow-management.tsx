/**
 * Signature Workflow Management Component
 * P3-002.1.2: Multi-Level Signature Workflows
 *
 * Advanced workflow management system with multi-signer support,
 * conditional routing, escalation handling, and comprehensive monitoring.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Workflow,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Upload,
  Bell,
  Shield,
  FileText,
  User,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignatureWorkflow } from "@/hooks/useSignatureWorkflow";
import { signatureWorkflowService } from "@/services/signature-workflow.service";
import SignatureWorkflow from "./signature-workflow";
import SignatureCapture from "./signature-capture";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "clinical" | "administrative" | "compliance" | "custom";
  steps: WorkflowStepTemplate[];
  conditions: WorkflowCondition[];
  escalationRules: EscalationRule[];
  notifications: NotificationRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface WorkflowStepTemplate {
  id: string;
  name: string;
  description: string;
  signerRole: string;
  signerType: "clinician" | "patient" | "witness" | "supervisor" | "admin";
  required: boolean;
  order: number;
  conditions?: WorkflowCondition[];
  timeoutHours?: number;
  escalationTo?: string;
  witnessRequired?: boolean;
  biometricRequired?: boolean;
  locationRequired?: boolean;
  customFields?: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "exists"
    | "not_exists";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface EscalationRule {
  id: string;
  stepId: string;
  timeoutHours: number;
  escalateTo: string;
  notificationMessage: string;
  autoEscalate: boolean;
  escalationChain: string[];
}

export interface NotificationRule {
  id: string;
  event:
    | "step_assigned"
    | "step_completed"
    | "workflow_completed"
    | "escalation"
    | "timeout";
  recipients: string[];
  method: "email" | "sms" | "push" | "in_app";
  template: string;
  enabled: boolean;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  documentId: string;
  documentType: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "escalated"
    | "error";
  currentStep: number;
  completedSteps: number[];
  pendingSteps: number[];
  signatures: WorkflowSignature[];
  metadata: {
    patientId?: string;
    episodeId?: string;
    priority: "low" | "medium" | "high" | "critical";
    dueDate?: string;
    tags: string[];
    formData: any;
  };
  auditTrail: WorkflowAuditEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedUsers: string[];
  escalations: WorkflowEscalation[];
}

export interface WorkflowSignature {
  stepId: string;
  signatureId: string;
  signerUserId: string;
  signerName: string;
  signerRole: string;
  signatureData: any;
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: any;
  witnessSignature?: {
    witnessUserId: string;
    witnessName: string;
    witnessRole: string;
    witnessSignatureData: any;
    timestamp: string;
  };
  biometricData?: {
    fingerprint?: string;
    voicePrint?: string;
    faceRecognition?: string;
  };
  locationData?: {
    latitude: number;
    longitude: number;
    address: string;
    facility: string;
  };
}

export interface WorkflowAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  details: any;
  ipAddress?: string;
  deviceInfo?: any;
  previousState?: any;
  newState?: any;
}

export interface WorkflowEscalation {
  id: string;
  stepId: string;
  escalatedTo: string;
  escalatedBy: string;
  reason: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SignatureWorkflowManagementProps {
  templates?: WorkflowTemplate[];
  instances?: WorkflowInstance[];
  currentUser?: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  onTemplateCreate?: (template: WorkflowTemplate) => void;
  onTemplateUpdate?: (
    templateId: string,
    updates: Partial<WorkflowTemplate>,
  ) => void;
  onTemplateDelete?: (templateId: string) => void;
  onInstanceCreate?: (
    templateId: string,
    documentId: string,
    formData: any,
  ) => void;
  onInstanceUpdate?: (
    instanceId: string,
    updates: Partial<WorkflowInstance>,
  ) => void;
  onInstanceCancel?: (instanceId: string, reason: string) => void;
  onStepComplete?: (instanceId: string, stepId: string, signature: any) => void;
  onEscalate?: (instanceId: string, stepId: string, reason: string) => void;
  onExport?: (format: "csv" | "excel" | "pdf") => void;
  className?: string;
}

const SignatureWorkflowManagement: React.FC<
  SignatureWorkflowManagementProps
> = ({
  templates = [],
  instances = [],
  currentUser,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onInstanceCreate,
  onInstanceUpdate,
  onInstanceCancel,
  onStepComplete,
  onEscalate,
  onExport,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [selectedInstance, setSelectedInstance] =
    useState<WorkflowInstance | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [selectedStepForEscalation, setSelectedStepForEscalation] = useState<
    string | null
  >(null);
  const [workflowInstances, setWorkflowInstances] = useState<
    WorkflowInstance[]
  >([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<
    WorkflowTemplate[]
  >([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Load workflow data
  useEffect(() => {
    loadWorkflowData();

    if (realTimeUpdates) {
      const interval = setInterval(loadWorkflowData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const loadWorkflowData = async () => {
    try {
      const workflows = signatureWorkflowService.getAllWorkflows();
      setWorkflowTemplates(
        workflows.map((w) => ({
          id: w.id,
          name: w.name,
          description: w.description,
          category: "clinical" as const,
          steps: w.steps.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            signerRole: s.signerRole,
            signerType: "clinician" as const,
            required: s.required,
            order: 1,
            timeoutHours: s.escalation?.timeoutHours,
            escalationTo: s.escalation?.escalateTo,
            witnessRequired: s.witnessRequired,
            biometricRequired: s.biometricRequired,
            locationRequired: s.locationRequired,
          })),
          conditions: [],
          escalationRules: [],
          notifications: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0",
        })),
      );
    } catch (error) {
      console.error("Failed to load workflow data:", error);
    }
  };

  // Filter instances based on current filters
  const filteredInstances = useMemo(() => {
    const instancesToFilter =
      instances.length > 0 ? instances : workflowInstances;
    return instancesToFilter.filter((instance) => {
      const matchesStatus =
        filterStatus === "all" || instance.status === filterStatus;
      const matchesPriority =
        filterPriority === "all" ||
        instance.metadata.priority === filterPriority;
      const matchesSearch =
        searchTerm === "" ||
        instance.documentType
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        instance.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [instances, filterStatus, filterPriority, searchTerm]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const instancesToAnalyze =
      instances.length > 0 ? instances : workflowInstances;
    const totalInstances = instancesToAnalyze.length;
    const completedInstances = instancesToAnalyze.filter(
      (i) => i.status === "completed",
    ).length;
    const pendingInstances = instancesToAnalyze.filter(
      (i) => i.status === "pending" || i.status === "in_progress",
    ).length;
    const escalatedInstances = instancesToAnalyze.filter(
      (i) => i.status === "escalated",
    ).length;
    const overdueInstances = instancesToAnalyze.filter((i) => {
      if (!i.metadata.dueDate) return false;
      return (
        new Date(i.metadata.dueDate) < new Date() && i.status !== "completed"
      );
    }).length;

    const completionRate =
      totalInstances > 0 ? (completedInstances / totalInstances) * 100 : 0;
    const escalationRate =
      totalInstances > 0 ? (escalatedInstances / totalInstances) * 100 : 0;

    // Calculate average completion time
    const completedWithTimes = instancesToAnalyze.filter(
      (i) => i.status === "completed" && i.completedAt,
    );
    const avgCompletionTime =
      completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, instance) => {
            const start = new Date(instance.createdAt).getTime();
            const end = new Date(instance.completedAt!).getTime();
            return sum + (end - start);
          }, 0) / completedWithTimes.length
        : 0;

    return {
      totalInstances,
      completedInstances,
      pendingInstances,
      escalatedInstances,
      overdueInstances,
      completionRate,
      escalationRate,
      avgCompletionTime: avgCompletionTime / (1000 * 60 * 60), // Convert to hours
    };
  }, [instances, workflowInstances]);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "escalated":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Handle escalation
  const handleEscalation = () => {
    if (
      selectedInstance &&
      selectedStepForEscalation &&
      escalationReason.trim()
    ) {
      onEscalate?.(
        selectedInstance.id,
        selectedStepForEscalation,
        escalationReason,
      );
      setShowEscalationDialog(false);
      setEscalationReason("");
      setSelectedStepForEscalation(null);
    }
  };

  // Calculate progress for instance
  const calculateProgress = (instance: WorkflowInstance) => {
    const templatesToUse = templates.length > 0 ? templates : workflowTemplates;
    const template = templatesToUse.find((t) => t.id === instance.templateId);
    if (!template) return 0;

    const totalSteps = template.steps.length;
    const completedSteps = instance.completedSteps.length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-6 w-6" />
              Signature Workflow Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("csv")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCreatingTemplate(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="instances">Workflow Instances</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-bold">
                      {dashboardMetrics.totalInstances}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {dashboardMetrics.completionRate.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">
                      {dashboardMetrics.pendingInstances}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Escalated</p>
                    <p className="text-2xl font-bold">
                      {dashboardMetrics.escalatedInstances}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInstances.slice(0, 5).map((instance) => {
                  const templatesToUse =
                    templates.length > 0 ? templates : workflowTemplates;
                  const template = templatesToUse.find(
                    (t) => t.id === instance.templateId,
                  );
                  const progress = calculateProgress(instance);

                  return (
                    <div
                      key={instance.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(instance.status)}
                        <div>
                          <div className="font-medium">
                            {instance.documentType}
                          </div>
                          <div className="text-sm text-gray-600">
                            {template?.name} • {instance.documentId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(progress)}%
                          </div>
                          <Progress value={progress} className="w-20 h-2" />
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            getStatusColor(instance.status),
                          )}
                        >
                          {instance.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Instances Tab */}
        <TabsContent value="instances" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterPriority}
                    onValueChange={setFilterPriority}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instances List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Workflow Instances ({filteredInstances.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Document</th>
                      <th className="p-4">Template</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstances.map((instance) => {
                      const templatesToUse =
                        templates.length > 0 ? templates : workflowTemplates;
                      const template = templatesToUse.find(
                        (t) => t.id === instance.templateId,
                      );
                      const progress = calculateProgress(instance);
                      const isOverdue =
                        instance.metadata.dueDate &&
                        new Date(instance.metadata.dueDate) < new Date() &&
                        instance.status !== "completed";

                      return (
                        <tr
                          key={instance.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-medium">
                                {instance.documentType}
                              </div>
                              <div className="text-sm text-gray-600">
                                {instance.documentId}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {template?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(instance.status)}
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getStatusColor(instance.status),
                                )}
                              >
                                {instance.status
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={cn(
                                "text-xs",
                                getPriorityColor(instance.metadata.priority),
                              )}
                            >
                              {instance.metadata.priority.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{Math.round(progress)}%</span>
                                <span className="text-gray-500">
                                  {instance.completedSteps.length}/
                                  {template?.steps.length || 0}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          </td>
                          <td className="p-4">
                            {instance.metadata.dueDate ? (
                              <div
                                className={cn(
                                  "text-sm",
                                  isOverdue
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600",
                                )}
                              >
                                {new Date(
                                  instance.metadata.dueDate,
                                ).toLocaleDateString()}
                                {isOverdue && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-2 text-xs"
                                  >
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No due date</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedInstance(instance)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {instance.status === "in_progress" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInstance(instance);
                                    setSelectedStepForEscalation(
                                      instance.pendingSteps[0]?.toString() ||
                                        null,
                                    );
                                    setShowEscalationDialog(true);
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Workflow Templates (
                {(templates.length > 0 ? templates : workflowTemplates).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(templates.length > 0 ? templates : workflowTemplates).map(
                  (template) => (
                    <Card key={template.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {template.steps.length} steps
                          </span>
                          <span className="text-gray-500">
                            v{template.version}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTemplate(template)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditingTemplate(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTemplateDelete?.(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Average Completion Time
                    </span>
                    <span className="font-medium">
                      {dashboardMetrics.avgCompletionTime.toFixed(1)} hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Completion Rate
                    </span>
                    <span className="font-medium">
                      {dashboardMetrics.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Escalation Rate
                    </span>
                    <span className="font-medium">
                      {dashboardMetrics.escalationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Overdue Workflows
                    </span>
                    <span className="font-medium text-red-600">
                      {dashboardMetrics.overdueInstances}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      status: "completed",
                      count: dashboardMetrics.completedInstances,
                      color: "bg-green-500",
                    },
                    {
                      status: "pending",
                      count: dashboardMetrics.pendingInstances,
                      color: "bg-blue-500",
                    },
                    {
                      status: "escalated",
                      count: dashboardMetrics.escalatedInstances,
                      color: "bg-orange-500",
                    },
                  ].map(({ status, count, color }) => {
                    const percentage =
                      dashboardMetrics.totalInstances > 0
                        ? (count / dashboardMetrics.totalInstances) * 100
                        : 0;

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{status}</span>
                          <span>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", color)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Escalation Dialog */}
      <Dialog
        open={showEscalationDialog}
        onOpenChange={setShowEscalationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Workflow Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Escalation Reason</label>
              <Textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Please provide a reason for escalation..."
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEscalationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEscalation}
                disabled={!escalationReason.trim()}
              >
                Escalate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instance Detail View */}
      {selectedInstance && (
        <Dialog
          open={!!selectedInstance}
          onOpenChange={() => setSelectedInstance(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Workflow Instance: {selectedInstance.documentType}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Instance Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Document ID:</span>
                  <span className="ml-2 font-medium">
                    {selectedInstance.documentId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={cn(
                      "ml-2 text-xs",
                      getStatusColor(selectedInstance.status),
                    )}
                  >
                    {selectedInstance.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <Badge
                    className={cn(
                      "ml-2 text-xs",
                      getPriorityColor(selectedInstance.metadata.priority),
                    )}
                  >
                    {selectedInstance.metadata.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedInstance.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {selectedInstance.completedSteps.length} of{" "}
                    {templates.find((t) => t.id === selectedInstance.templateId)
                      ?.steps.length || 0}{" "}
                    steps completed
                  </span>
                </div>
                <Progress
                  value={calculateProgress(selectedInstance)}
                  className="h-2"
                />
              </div>

              {/* Workflow Steps */}
              <div className="space-y-3">
                <h4 className="font-medium">Workflow Steps</h4>
                <div className="space-y-2">
                  {(templates.length > 0 ? templates : workflowTemplates)
                    .find((t) => t.id === selectedInstance.templateId)
                    ?.steps.map((step, index) => {
                      const isCompleted =
                        selectedInstance.completedSteps.includes(step.id);
                      const isPending = selectedInstance.pendingSteps.includes(
                        step.id,
                      );
                      const signature = selectedInstance.signatures.find(
                        (s) => s.stepId === step.id,
                      );

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg",
                            isCompleted && "border-green-200 bg-green-50",
                            isPending && "border-blue-200 bg-blue-50",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : isPending ? (
                              <Clock className="h-5 w-5 text-blue-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                            <div>
                              <div className="font-medium">{step.name}</div>
                              <div className="text-sm text-gray-600">
                                {step.signerType} • {step.signerRole}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {isCompleted && signature && (
                              <div className="text-xs text-gray-500">
                                Signed by {signature.signerName}
                                <br />
                                {new Date(signature.timestamp).toLocaleString()}
                              </div>
                            )}
                            {step.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SignatureWorkflowManagement;
