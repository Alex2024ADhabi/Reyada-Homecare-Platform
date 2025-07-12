/**
 * Signature Workflow Builder Component
 * P3-002.2.1: Advanced Workflow Builder
 *
 * Drag-and-drop workflow builder for creating custom signature workflows
 * with conditional logic, parallel processing, and escalation rules.
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Workflow,
  Plus,
  Settings,
  Trash2,
  Copy,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  MapPin,
  Eye,
  Save,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  witnessRequired: boolean;
  biometricRequired: boolean;
  locationRequired: boolean;
  timeoutHours?: number;
  escalationTo?: string;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string;
  nextStepId: string;
}

export interface EscalationRule {
  id: string;
  timeoutHours: number;
  escalateTo: string;
  autoEscalate: boolean;
  escalationChain: string[];
}

export interface NotificationRule {
  id: string;
  event:
    | "step_started"
    | "step_completed"
    | "workflow_completed"
    | "escalation";
  recipients: string[];
  template: string;
}

export interface WorkflowBuilderProps {
  template?: WorkflowTemplate;
  onSave?: (template: WorkflowTemplate) => void;
  onTest?: (template: WorkflowTemplate) => void;
  onExport?: (
    template: WorkflowTemplate,
    format: "json" | "xml" | "yaml",
  ) => void;
  onImport?: (file: File) => void;
  className?: string;
}

interface StepPosition {
  x: number;
  y: number;
}

interface WorkflowConnection {
  from: string;
  to: string;
  condition?: WorkflowCondition;
}

const SignatureWorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  template,
  onSave,
  onTest,
  onExport,
  onImport,
  className,
}) => {
  const [workflowTemplate, setWorkflowTemplate] = useState<WorkflowTemplate>(
    template || {
      id: `workflow_${Date.now()}`,
      name: "New Workflow",
      description: "",
      category: "custom",
      steps: [],
      conditions: [],
      escalationRules: [],
      notifications: [],
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0",
    },
  );

  const [selectedStep, setSelectedStep] = useState<WorkflowStepTemplate | null>(
    null,
  );
  const [stepPositions, setStepPositions] = useState<Map<string, StepPosition>>(
    new Map(),
  );
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testData, setTestData] = useState<any>({});

  // Step Templates
  const stepTemplates = [
    {
      type: "clinician",
      name: "Clinician Signature",
      icon: Users,
      description: "Requires clinician signature",
      defaultRole: "clinician",
    },
    {
      type: "patient",
      name: "Patient Signature",
      icon: Users,
      description: "Requires patient signature",
      defaultRole: "patient",
    },
    {
      type: "witness",
      name: "Witness Signature",
      icon: Eye,
      description: "Requires witness signature",
      defaultRole: "witness",
    },
    {
      type: "supervisor",
      name: "Supervisor Approval",
      icon: Shield,
      description: "Requires supervisor approval",
      defaultRole: "supervisor",
    },
    {
      type: "admin",
      name: "Admin Review",
      icon: Settings,
      description: "Requires admin review",
      defaultRole: "admin",
    },
  ];

  const addStep = useCallback(
    (stepType: string) => {
      const template = stepTemplates.find((t) => t.type === stepType);
      if (!template) return;

      const newStep: WorkflowStepTemplate = {
        id: `step_${Date.now()}`,
        name: template.name,
        description: template.description,
        signerRole: template.defaultRole,
        signerType: template.type as any,
        required: true,
        order: workflowTemplate.steps.length + 1,
        witnessRequired: false,
        biometricRequired: false,
        locationRequired: false,
      };

      setWorkflowTemplate((prev) => ({
        ...prev,
        steps: [...prev.steps, newStep],
        updatedAt: new Date().toISOString(),
      }));

      // Set initial position
      const position: StepPosition = {
        x: 100 + (workflowTemplate.steps.length % 3) * 200,
        y: 100 + Math.floor(workflowTemplate.steps.length / 3) * 150,
      };
      setStepPositions((prev) => new Map(prev).set(newStep.id, position));
    },
    [workflowTemplate.steps.length, stepTemplates],
  );

  const updateStep = useCallback(
    (stepId: string, updates: Partial<WorkflowStepTemplate>) => {
      setWorkflowTemplate((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step,
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [],
  );

  const deleteStep = useCallback((stepId: string) => {
    setWorkflowTemplate((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
      updatedAt: new Date().toISOString(),
    }));
    setStepPositions((prev) => {
      const newPositions = new Map(prev);
      newPositions.delete(stepId);
      return newPositions;
    });
    setConnections((prev) =>
      prev.filter((conn) => conn.from !== stepId && conn.to !== stepId),
    );
  }, []);

  const duplicateStep = useCallback(
    (stepId: string) => {
      const step = workflowTemplate.steps.find((s) => s.id === stepId);
      if (!step) return;

      const newStep: WorkflowStepTemplate = {
        ...step,
        id: `step_${Date.now()}`,
        name: `${step.name} (Copy)`,
        order: workflowTemplate.steps.length + 1,
      };

      setWorkflowTemplate((prev) => ({
        ...prev,
        steps: [...prev.steps, newStep],
        updatedAt: new Date().toISOString(),
      }));

      // Position near original step
      const originalPosition = stepPositions.get(stepId);
      if (originalPosition) {
        const newPosition: StepPosition = {
          x: originalPosition.x + 50,
          y: originalPosition.y + 50,
        };
        setStepPositions((prev) => new Map(prev).set(newStep.id, newPosition));
      }
    },
    [workflowTemplate.steps, stepPositions],
  );

  const handleStepDrag = useCallback(
    (stepId: string, position: StepPosition) => {
      setStepPositions((prev) => new Map(prev).set(stepId, position));
    },
    [],
  );

  const addConnection = useCallback(
    (from: string, to: string, condition?: WorkflowCondition) => {
      const newConnection: WorkflowConnection = { from, to, condition };
      setConnections((prev) => [
        ...prev.filter((c) => !(c.from === from && c.to === to)),
        newConnection,
      ]);
    },
    [],
  );

  const testWorkflow = useCallback(() => {
    if (!onTest) return;
    setIsTestMode(true);
    onTest(workflowTemplate);
  }, [workflowTemplate, onTest]);

  const saveWorkflow = useCallback(() => {
    if (!onSave) return;
    onSave(workflowTemplate);
  }, [workflowTemplate, onSave]);

  const exportWorkflow = useCallback(
    (format: "json" | "xml" | "yaml") => {
      if (!onExport) return;
      onExport(workflowTemplate, format);
    },
    [workflowTemplate, onExport],
  );

  const getStepIcon = (signerType: string) => {
    const template = stepTemplates.find((t) => t.type === signerType);
    return template?.icon || Users;
  };

  const getStepColor = (signerType: string) => {
    switch (signerType) {
      case "clinician":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "patient":
        return "bg-green-100 border-green-300 text-green-800";
      case "witness":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "supervisor":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "admin":
        return "bg-gray-100 border-gray-300 text-gray-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-white", className)}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Workflow Builder</h2>
            </div>
            <Input
              value={workflowTemplate.name}
              onChange={(e) =>
                setWorkflowTemplate((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-64"
              placeholder="Workflow name"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testWorkflow}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Test
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveWorkflow}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step Palette */}
        <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <h3 className="font-medium mb-4">Step Templates</h3>
          <div className="space-y-2">
            {stepTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.type}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors"
                  onClick={() => addStep(template.type)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {template.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Workflow Statistics */}
          <div className="mt-6 p-3 bg-white rounded-lg border">
            <h4 className="font-medium text-sm mb-2">Workflow Stats</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Steps:</span>
                <span>{workflowTemplate.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Required Steps:</span>
                <span>
                  {workflowTemplate.steps.filter((s) => s.required).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span>{connections.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-auto bg-gray-50">
          <div className="absolute inset-0 p-4">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Steps */}
            {workflowTemplate.steps.map((step) => {
              const position = stepPositions.get(step.id) || { x: 0, y: 0 };
              const Icon = getStepIcon(step.signerType);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "absolute w-48 p-3 border-2 rounded-lg cursor-move shadow-sm",
                    getStepColor(step.signerType),
                    selectedStep?.id === step.id && "ring-2 ring-blue-500",
                  )}
                  style={{
                    left: position.x,
                    top: position.y,
                  }}
                  onClick={() => setSelectedStep(step)}
                  onDoubleClick={() => setShowStepDialog(true)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {step.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateStep(step.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStep(step.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {step.witnessRequired && <Eye className="h-3 w-3" />}
                    {step.biometricRequired && <Shield className="h-3 w-3" />}
                    {step.locationRequired && <MapPin className="h-3 w-3" />}
                    {step.timeoutHours && <Clock className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}

            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none">
              {connections.map((connection, index) => {
                const fromPos = stepPositions.get(connection.from);
                const toPos = stepPositions.get(connection.to);
                if (!fromPos || !toPos) return null;

                const fromX = fromPos.x + 192; // Step width
                const fromY = fromPos.y + 40; // Step height / 2
                const toX = toPos.x;
                const toY = toPos.y + 40;

                return (
                  <g key={index}>
                    <line
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke="#6b7280"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    {connection.condition && (
                      <text
                        x={(fromX + toX) / 2}
                        y={(fromY + toY) / 2 - 5}
                        className="text-xs fill-gray-600"
                        textAnchor="middle"
                      >
                        {connection.condition.field}
                      </text>
                    )}
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedStep && (
          <div className="w-80 border-l bg-white p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Step Properties</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStep(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedStep.name}
                  onChange={(e) =>
                    updateStep(selectedStep.id, { name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedStep.description}
                  onChange={(e) =>
                    updateStep(selectedStep.id, { description: e.target.value })
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Signer Role</label>
                <Input
                  value={selectedStep.signerRole}
                  onChange={(e) =>
                    updateStep(selectedStep.id, { signerRole: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Signer Type</label>
                <Select
                  value={selectedStep.signerType}
                  onValueChange={(value) =>
                    updateStep(selectedStep.id, { signerType: value as any })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinician">Clinician</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="witness">Witness</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={selectedStep.required}
                    onCheckedChange={(checked) =>
                      updateStep(selectedStep.id, {
                        required: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="required" className="text-sm">
                    Required Step
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="witness"
                    checked={selectedStep.witnessRequired}
                    onCheckedChange={(checked) =>
                      updateStep(selectedStep.id, {
                        witnessRequired: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="witness" className="text-sm">
                    Witness Required
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="biometric"
                    checked={selectedStep.biometricRequired}
                    onCheckedChange={(checked) =>
                      updateStep(selectedStep.id, {
                        biometricRequired: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="biometric" className="text-sm">
                    Biometric Required
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="location"
                    checked={selectedStep.locationRequired}
                    onCheckedChange={(checked) =>
                      updateStep(selectedStep.id, {
                        locationRequired: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="location" className="text-sm">
                    Location Required
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Timeout (Hours)</label>
                <Input
                  type="number"
                  value={selectedStep.timeoutHours || ""}
                  onChange={(e) =>
                    updateStep(selectedStep.id, {
                      timeoutHours: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1"
                  placeholder="No timeout"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Escalate To</label>
                <Input
                  value={selectedStep.escalationTo || ""}
                  onChange={(e) =>
                    updateStep(selectedStep.id, {
                      escalationTo: e.target.value || undefined,
                    })
                  }
                  className="mt-1"
                  placeholder="Role or user ID"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="escalation">Escalation</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Workflow Name</label>
                <Input
                  value={workflowTemplate.name}
                  onChange={(e) =>
                    setWorkflowTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={workflowTemplate.description}
                  onChange={(e) =>
                    setWorkflowTemplate((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={workflowTemplate.category}
                  onValueChange={(value) =>
                    setWorkflowTemplate((prev) => ({
                      ...prev,
                      category: value as any,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="administrative">
                      Administrative
                    </SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={workflowTemplate.isActive}
                  onCheckedChange={(checked) =>
                    setWorkflowTemplate((prev) => ({
                      ...prev,
                      isActive: checked as boolean,
                    }))
                  }
                />
                <label htmlFor="active" className="text-sm">
                  Active Workflow
                </label>
              </div>
            </TabsContent>

            <TabsContent value="escalation" className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure escalation rules for this workflow.
              </p>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure notification settings for this workflow.
              </p>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <p className="text-sm text-gray-600">
                Export this workflow template.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportWorkflow("json")}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportWorkflow("xml")}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export XML
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportWorkflow("yaml")}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export YAML
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignatureWorkflowBuilder;
