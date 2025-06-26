/**
 * Signature Workflow Management Dashboard
 * P3-002.2.5: Signature Workflow Management Dashboard
 *
 * Comprehensive dashboard for managing signature workflows with real-time status monitoring,
 * bulk operations, workflow analytics, and reporting capabilities.
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Workflow,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Upload,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  FileText,
  User,
  Shield,
  Zap,
  Settings,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowStep } from "./signature-workflow";

export interface WorkflowInstance {
  id: string;
  documentId: string;
  documentType: string;
  documentTitle: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  steps: WorkflowStep[];
  currentStep: number;
  assignedUsers: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface WorkflowAnalytics {
  totalWorkflows: number;
  completedWorkflows: number;
  pendingWorkflows: number;
  averageCompletionTime: number;
  completionRate: number;
  bottlenecks: {
    stepType: string;
    averageTime: number;
    count: number;
  }[];
  userPerformance: {
    userId: string;
    userName: string;
    completedSignatures: number;
    averageTime: number;
    errorRate: number;
  }[];
}

export interface SignatureWorkflowDashboardProps {
  workflows: WorkflowInstance[];
  analytics: WorkflowAnalytics;
  onWorkflowAction?: (workflowId: string, action: string, data?: any) => void;
  onBulkAction?: (workflowIds: string[], action: string) => void;
  onRefresh?: () => void;
  onExport?: (format: "csv" | "excel" | "pdf") => void;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  className?: string;
}

const SignatureWorkflowDashboard: React.FC<SignatureWorkflowDashboardProps> = ({
  workflows,
  analytics,
  onWorkflowAction,
  onBulkAction,
  onRefresh,
  onExport,
  currentUser,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Filter and sort workflows
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows.filter((workflow) => {
      const matchesSearch =
        workflow.documentTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workflow.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.documentType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || workflow.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || workflow.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort workflows
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof WorkflowInstance];
      let bValue: any = b[sortBy as keyof WorkflowInstance];

      if (sortBy === "progress") {
        aValue =
          (a.steps.filter((s) => s.completed).length / a.steps.length) * 100;
        bValue =
          (b.steps.filter((s) => s.completed).length / b.steps.length) * 100;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [workflows, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const handleSelectWorkflow = (workflowId: string, selected: boolean) => {
    if (selected) {
      setSelectedWorkflows((prev) => [...prev, workflowId]);
    } else {
      setSelectedWorkflows((prev) => prev.filter((id) => id !== workflowId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedWorkflows(filteredWorkflows.map((w) => w.id));
    } else {
      setSelectedWorkflows([]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const calculateProgress = (workflow: WorkflowInstance) => {
    const completedSteps = workflow.steps.filter(
      (step) => step.completed,
    ).length;
    return (completedSteps / workflow.steps.length) * 100;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-6 w-6" />
              Signature Workflow Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
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

      {/* Analytics Overview */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workflows</p>
                  <p className="text-2xl font-bold">
                    {analytics.totalWorkflows}
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
                    {analytics.completionRate.toFixed(1)}%
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
                  <p className="text-sm text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold">
                    {(analytics.averageCompletionTime / 3600000).toFixed(1)}h
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
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {analytics.pendingWorkflows}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedWorkflows.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction?.(selectedWorkflows, "pause")}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause ({selectedWorkflows.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction?.(selectedWorkflows, "cancel")}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflows ({filteredWorkflows.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedWorkflows.length === filteredWorkflows.length &&
                  filteredWorkflows.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 w-12"></th>
                  <th className="p-4">Document</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Assigned</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((workflow) => {
                  const progress = calculateProgress(workflow);
                  return (
                    <tr key={workflow.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedWorkflows.includes(workflow.id)}
                          onCheckedChange={(checked) =>
                            handleSelectWorkflow(
                              workflow.id,
                              checked as boolean,
                            )
                          }
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {workflow.documentTitle}
                          </div>
                          <div className="text-sm text-gray-600">
                            {workflow.documentType} • {workflow.documentId}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(workflow.status)}
                          <Badge
                            className={cn(
                              "text-xs",
                              getStatusColor(workflow.status),
                            )}
                          >
                            {workflow.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={cn(
                            "text-xs",
                            getPriorityColor(workflow.priority),
                          )}
                        >
                          {workflow.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{Math.round(progress)}%</span>
                            <span className="text-gray-500">
                              {workflow.steps.filter((s) => s.completed).length}
                              /{workflow.steps.length}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {workflow.assignedUsers.length}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {new Date(workflow.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onWorkflowAction?.(workflow.id, "view")
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onWorkflowAction?.(workflow.id, "edit")
                            }
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
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

      {/* Export Options */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredWorkflows.length} of {workflows.length} workflows
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("csv")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("excel")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.("pdf")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureWorkflowDashboard;
