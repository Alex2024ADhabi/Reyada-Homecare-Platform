import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  Workflow,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface WorkflowStep {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "pending" | "failed";
  duration?: number;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
}

interface WorkflowInstance {
  id: string;
  claimId: string;
  patientName: string;
  workflowType: "claim_submission" | "payment_processing" | "denial_management";
  currentStep: string;
  progress: number;
  status: "active" | "completed" | "failed" | "paused";
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  totalAmount: number;
  priority: "low" | "medium" | "high" | "urgent";
}

interface RevenueWorkflowIntegrationProps {
  isOffline?: boolean;
}

const RevenueWorkflowIntegration = ({
  isOffline = false,
}: RevenueWorkflowIntegrationProps) => {
  const { isOnline } = useOfflineSync();
  const {
    isLoading,
    error,
    getKPIDashboard,
    generateCashFlowProjection,
    getPayerPerformanceAnalytics,
  } = useRevenueManagement();

  const [activeTab, setActiveTab] = useState("workflows");
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowInstance | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Mock workflow data
  const mockWorkflows: WorkflowInstance[] = [
    {
      id: "wf-001",
      claimId: "CL-2024-0001",
      patientName: "Mohammed Al Mansoori",
      workflowType: "claim_submission",
      currentStep: "clinical_review",
      progress: 65,
      status: "active",
      steps: [
        {
          id: "step-1",
          name: "Document Collection",
          status: "completed",
          duration: 120,
          completedAt: "2024-02-20T09:00:00Z",
          assignedTo: "Sarah Ahmed",
        },
        {
          id: "step-2",
          name: "Clinical Review",
          status: "in_progress",
          assignedTo: "Dr. Ahmed Hassan",
        },
        {
          id: "step-3",
          name: "Coding & Billing",
          status: "pending",
        },
        {
          id: "step-4",
          name: "Submission",
          status: "pending",
        },
      ],
      startedAt: "2024-02-20T08:30:00Z",
      totalAmount: 7500.0,
      priority: "high",
    },
    {
      id: "wf-002",
      claimId: "CL-2024-0002",
      patientName: "Fatima Al Zaabi",
      workflowType: "payment_processing",
      currentStep: "payment_reconciliation",
      progress: 80,
      status: "active",
      steps: [
        {
          id: "step-1",
          name: "Payment Received",
          status: "completed",
          duration: 60,
          completedAt: "2024-02-19T14:00:00Z",
        },
        {
          id: "step-2",
          name: "Payment Reconciliation",
          status: "in_progress",
          assignedTo: "Finance Team",
        },
        {
          id: "step-3",
          name: "Account Update",
          status: "pending",
        },
      ],
      startedAt: "2024-02-19T13:45:00Z",
      totalAmount: 3600.0,
      priority: "medium",
    },
    {
      id: "wf-003",
      claimId: "CL-2024-0003",
      patientName: "Ahmed Al Shamsi",
      workflowType: "denial_management",
      currentStep: "appeal_preparation",
      progress: 40,
      status: "active",
      steps: [
        {
          id: "step-1",
          name: "Denial Analysis",
          status: "completed",
          duration: 180,
          completedAt: "2024-02-18T11:00:00Z",
          assignedTo: "Dr. Mariam Ali",
        },
        {
          id: "step-2",
          name: "Appeal Preparation",
          status: "in_progress",
          assignedTo: "Legal Team",
        },
        {
          id: "step-3",
          name: "Appeal Submission",
          status: "pending",
        },
        {
          id: "step-4",
          name: "Appeal Tracking",
          status: "pending",
        },
      ],
      startedAt: "2024-02-18T10:30:00Z",
      totalAmount: 4200.0,
      priority: "urgent",
    },
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      if (isOnline && !isOffline) {
        // In a real implementation, this would fetch from API
        setWorkflows(mockWorkflows);
      } else {
        setWorkflows(mockWorkflows);
      }
    } catch (error) {
      console.error("Error loading workflows:", error);
      setWorkflows(mockWorkflows);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      completed: "secondary",
      failed: "destructive",
      paused: "outline",
    } as const;

    const icons = {
      active: <Activity className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      failed: <AlertCircle className="w-3 h-3" />,
      paused: <Clock className="w-3 h-3" />,
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "outline"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount);
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesStatus =
      filterStatus === "all" || workflow.status === filterStatus;
    const matchesType =
      filterType === "all" || workflow.workflowType === filterType;
    return matchesStatus && matchesType;
  });

  const calculateSummaryStats = () => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(
      (w) => w.status === "active",
    ).length;
    const completedWorkflows = workflows.filter(
      (w) => w.status === "completed",
    ).length;
    const failedWorkflows = workflows.filter(
      (w) => w.status === "failed",
    ).length;
    const totalAmount = workflows.reduce((sum, w) => sum + w.totalAmount, 0);
    const averageProgress =
      workflows.reduce((sum, w) => sum + w.progress, 0) / totalWorkflows;

    return {
      totalWorkflows,
      activeWorkflows,
      completedWorkflows,
      failedWorkflows,
      totalAmount,
      averageProgress,
      completionRate:
        totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0,
    };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue Workflow Integration
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage revenue cycle workflows across all processes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={loadWorkflows} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Workflow className="h-4 w-4 mr-2" />
              Total Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeWorkflows} active, {stats.completedWorkflows}{" "}
              completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageProgress.toFixed(1)}%
            </div>
            <Progress value={stats.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.failedWorkflows} failed workflows
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">
            <Workflow className="h-4 w-4 mr-2" />
            Active Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimization
          </TabsTrigger>
        </TabsList>

        {/* Active Workflows Tab */}
        <TabsContent value="workflows" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Workflow Management</CardTitle>
                  <CardDescription>
                    Monitor and manage all revenue cycle workflows
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="claim_submission">
                        Claim Submission
                      </SelectItem>
                      <SelectItem value="payment_processing">
                        Payment Processing
                      </SelectItem>
                      <SelectItem value="denial_management">
                        Denial Management
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className="border-l-4 border-l-primary"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {workflow.claimId} - {workflow.patientName}
                          </CardTitle>
                          <CardDescription>
                            {workflow.workflowType
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(workflow.status)}
                          {getPriorityBadge(workflow.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Current Step:</span>
                            <p>
                              {workflow.currentStep
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Progress:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress
                                value={workflow.progress}
                                className="flex-1"
                              />
                              <span className="text-xs">
                                {workflow.progress}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span>
                            <p>{formatCurrency(workflow.totalAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Started:</span>
                            <p>
                              {new Date(
                                workflow.startedAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Workflow Steps */}
                        <div>
                          <span className="font-medium text-sm mb-2 block">
                            Workflow Steps:
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {workflow.steps.map((step, index) => (
                              <div
                                key={step.id}
                                className="flex items-center gap-2 min-w-fit"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  {getStepStatusIcon(step.status)}
                                  <span className="text-xs text-center min-w-20">
                                    {step.name}
                                  </span>
                                  {step.assignedTo && (
                                    <span className="text-xs text-muted-foreground">
                                      {step.assignedTo}
                                    </span>
                                  )}
                                </div>
                                {index < workflow.steps.length - 1 && (
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Last updated: {new Date().toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm">Manage</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Workflow Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Claim Submission</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "40%" }}
                        />
                      </div>
                      <span className="text-sm">40%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payment Processing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: "35%" }}
                        />
                      </div>
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Denial Management</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: "25%" }}
                        />
                      </div>
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Completion Time:</span>
                    <span className="font-medium">3.2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <span className="font-medium text-green-600">94.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bottleneck Rate:</span>
                    <span className="font-medium text-amber-600">12.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">SLA Compliance:</span>
                    <span className="font-medium text-green-600">98.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Process Optimization
                </CardTitle>
                <CardDescription>
                  Identify and optimize workflow bottlenecks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Real-time</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  AI-powered analysis of workflow efficiency
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Resource Allocation
                </CardTitle>
                <CardDescription>
                  Optimize staff and resource allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Daily</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Balance workload across team members
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Track KPIs and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Weekly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Comprehensive performance reporting
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueWorkflowIntegration;
