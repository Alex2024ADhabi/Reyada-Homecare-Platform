/**
 * Signature Analytics Dashboard
 * P3-002.3.3: Audit and Reporting
 *
 * Comprehensive dashboard for signature analytics, compliance reporting,
 * and audit trail visualization with real-time metrics and export capabilities.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  FileText,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Calendar,
  Search,
  Settings,
  Eye,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  signatureAuditService,
  SignatureAnalytics,
  SignatureAuditEntry,
  ComplianceReport,
  AuditExportOptions,
} from "@/services/signature-audit.service";
import {
  signatureExportService,
  ExportOptions,
  PerformanceExportData,
  BottleneckAnalysis,
} from "@/services/signature-export.service";
import { SignatureData } from "@/components/ui/signature-capture";
import { WorkflowInstance } from "@/services/signature-workflow.service";

export interface SignatureAnalyticsDashboardProps {
  className?: string;
  refreshInterval?: number;
  defaultDateRange?: {
    startDate: string;
    endDate: string;
  };
  signatures?: SignatureData[];
  workflows?: WorkflowInstance[];
  enablePerformanceTracking?: boolean;
  enableBottleneckAnalysis?: boolean;
  enableUserAnalytics?: boolean;
  enableMobileOptimization?: boolean;
}

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple,
];

const SignatureAnalyticsDashboard: React.FC<
  SignatureAnalyticsDashboardProps
> = ({
  className,
  refreshInterval = 30000, // 30 seconds
  defaultDateRange,
  signatures = [],
  workflows = [],
  enablePerformanceTracking = true,
  enableBottleneckAnalysis = true,
  enableUserAnalytics = true,
  enableMobileOptimization = true,
}) => {
  // State
  const [analytics, setAnalytics] = useState<SignatureAnalytics | null>(null);
  const [auditEntries, setAuditEntries] = useState<SignatureAuditEntry[]>([]);
  const [complianceReport, setComplianceReport] =
    useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState(
    defaultDateRange || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
  );
  const [filters, setFilters] = useState({
    eventTypes: [] as string[],
    userIds: [] as string[],
    complianceStatus: [] as string[],
    severity: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [exportOptions, setExportOptions] = useState<
    Partial<AuditExportOptions>
  >({
    format: "csv",
    includeDetails: true,
    includeMetadata: false,
  });
  const [performanceData, setPerformanceData] = useState<
    PerformanceExportData[]
  >([]);
  const [bottleneckData, setBottleneckData] = useState<BottleneckAnalysis[]>(
    [],
  );
  const [completionRates, setCompletionRates] = useState<any[]>([]);
  const [userPerformanceData, setUserPerformanceData] = useState<any[]>([]);
  const [deviceMetrics, setDeviceMetrics] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<{
    activeUsers: number;
    signaturesPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    systemLoad: number;
  }>({
    activeUsers: 0,
    signaturesPerMinute: 0,
    averageResponseTime: 0,
    errorRate: 0,
    throughput: 0,
    systemLoad: 0,
  });

  // Load data
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData(true); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dateRange, filters, refreshInterval]);

  const loadDashboardData = async (silent: boolean = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      // Load analytics
      const analyticsData = signatureAuditService.getSignatureAnalytics(true);
      setAnalytics(analyticsData);

      // Load audit entries
      const { entries } = signatureAuditService.getAuditEntries({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        eventTypes:
          filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
        userIds: filters.userIds.length > 0 ? filters.userIds : undefined,
        complianceStatus:
          filters.complianceStatus.length > 0
            ? filters.complianceStatus
            : undefined,
        severity: filters.severity.length > 0 ? filters.severity : undefined,
        limit: 1000,
      });
      setAuditEntries(entries);

      // Generate compliance report
      const report = await signatureAuditService.generateComplianceReport(
        "custom",
        dateRange,
        "Dashboard User",
      );
      setComplianceReport(report);

      // Load enhanced analytics data
      if (enablePerformanceTracking) {
        const perfData = await signatureExportService.exportPerformanceData(
          signatures,
          workflows,
          entries,
          {
            format: "json",
            includeMetadata: true,
            includePerformanceMetrics: true,
            includeDeviceInfo: true,
            includeImages: false,
          },
        );
        setPerformanceData(JSON.parse(perfData.data as string));
      }

      if (enableBottleneckAnalysis) {
        const bottleneckResult =
          await signatureExportService.exportBottleneckAnalysis(workflows, {
            format: "json",
            includeMetadata: true,
            includePerformanceMetrics: true,
            includeDeviceInfo: true,
            includeImages: false,
          });
        setBottleneckData(JSON.parse(bottleneckResult.data as string));
      }

      if (enableUserAnalytics) {
        const userPerfResult =
          await signatureExportService.exportUserPerformance(
            signatures,
            workflows,
            entries,
            {
              format: "json",
              includeMetadata: true,
              includePerformanceMetrics: true,
              includeDeviceInfo: true,
              includeImages: false,
            },
          );
        setUserPerformanceData(JSON.parse(userPerfResult.data as string));
      }

      // Calculate completion rates
      const completionData = workflows.map((workflow) => {
        const totalSteps = workflow.signatures?.length || 0;
        const completedSteps =
          workflow.signatures?.filter((s) => s.timestamp).length || 0;
        return {
          workflowId: workflow.id,
          completionRate:
            totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
          totalSteps,
          completedSteps,
          status: workflow.status,
          duration: workflow.completedAt
            ? new Date(workflow.completedAt).getTime() -
              new Date(workflow.createdAt).getTime()
            : 0,
        };
      });
      setCompletionRates(completionData);

      // Calculate device metrics
      const deviceMetricsData = signatures.reduce((acc, signature) => {
        const deviceType = signature.metadata?.deviceType || "unknown";
        if (!acc[deviceType]) {
          acc[deviceType] = {
            count: 0,
            averageTime: 0,
            averagePressure: 0,
            frameRates: [],
            latencies: [],
          };
        }
        acc[deviceType].count++;
        acc[deviceType].averageTime += signature.metadata?.totalTime || 0;
        acc[deviceType].averagePressure +=
          signature.metadata?.averagePressure || 0;
        if (signature.metadata?.performanceMetrics) {
          acc[deviceType].frameRates.push(
            signature.metadata.performanceMetrics.frameRate || 0,
          );
          acc[deviceType].latencies.push(
            signature.metadata.performanceMetrics.strokeLatency || 0,
          );
        }
        return acc;
      }, {} as any);

      setDeviceMetrics(
        Object.entries(deviceMetricsData).map(
          ([deviceType, data]: [string, any]) => ({
            deviceType,
            count: data.count,
            averageTime: data.averageTime / data.count,
            averagePressure: data.averagePressure / data.count,
            averageFrameRate:
              data.frameRates.length > 0
                ? data.frameRates.reduce(
                    (sum: number, rate: number) => sum + rate,
                    0,
                  ) / data.frameRates.length
                : 0,
            averageLatency:
              data.latencies.length > 0
                ? data.latencies.reduce(
                    (sum: number, lat: number) => sum + lat,
                    0,
                  ) / data.latencies.length
                : 0,
          }),
        ),
      );

      // Update real-time metrics
      setRealTimeMetrics({
        activeUsers: new Set(
          entries
            .filter(
              (e) =>
                new Date(e.timestamp).getTime() > Date.now() - 5 * 60 * 1000,
            )
            .map((e) => e.userId),
        ).size,
        signaturesPerMinute: entries.filter(
          (e) =>
            e.eventType === "signature_created" &&
            new Date(e.timestamp).getTime() > Date.now() - 60 * 1000,
        ).length,
        averageResponseTime:
          performanceData.length > 0
            ? performanceData.reduce((sum, p) => sum + p.latency, 0) /
              performanceData.length
            : 0,
        errorRate:
          entries.length > 0
            ? (entries.filter((e) => e.complianceStatus === "non_compliant")
                .length /
                entries.length) *
              100
            : 0,
        throughput: entries.filter(
          (e) =>
            e.eventType === "signature_created" &&
            new Date(e.timestamp).getTime() > Date.now() - 60 * 60 * 1000,
        ).length,
        systemLoad: Math.random() * 100, // This would come from actual system metrics
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Filtered audit entries for search
  const filteredAuditEntries = useMemo(() => {
    if (!searchTerm) return auditEntries;

    const term = searchTerm.toLowerCase();
    return auditEntries.filter(
      (entry) =>
        entry.userName.toLowerCase().includes(term) ||
        entry.details.action.toLowerCase().includes(term) ||
        entry.details.description.toLowerCase().includes(term) ||
        entry.documentId.toLowerCase().includes(term),
    );
  }, [auditEntries, searchTerm]);

  // Enhanced export functionality
  const handleExport = async (
    exportType:
      | "audit"
      | "performance"
      | "bottlenecks"
      | "completion"
      | "dashboard" = "audit",
  ) => {
    try {
      setIsLoading(true);
      let exportData;

      switch (exportType) {
        case "performance":
          exportData = await signatureExportService.exportPerformanceData(
            signatures,
            workflows,
            filteredAuditEntries,
            {
              format: exportOptions.format as "json" | "csv" | "pdf" | "excel",
              includeMetadata: exportOptions.includeMetadata || false,
              includePerformanceMetrics: true,
              includeDeviceInfo: true,
              includeImages: false,
              dateRange,
              filters,
            },
          );
          break;

        case "bottlenecks":
          exportData = await signatureExportService.exportBottleneckAnalysis(
            workflows,
            {
              format: exportOptions.format as "json" | "csv" | "pdf" | "excel",
              includeMetadata: exportOptions.includeMetadata || false,
              includePerformanceMetrics: true,
              includeDeviceInfo: true,
              includeImages: false,
              dateRange,
            },
          );
          break;

        case "completion":
          exportData = await signatureExportService.exportCompletionRates(
            workflows,
            {
              format: exportOptions.format as "json" | "csv" | "pdf" | "excel",
              includeMetadata: exportOptions.includeMetadata || false,
              includePerformanceMetrics: true,
              includeDeviceInfo: true,
              includeImages: false,
              dateRange,
            },
          );
          break;

        case "dashboard":
          exportData = await signatureExportService.exportDashboardData(
            signatures,
            workflows,
            filteredAuditEntries,
            {
              format: exportOptions.format as "json" | "csv" | "pdf" | "excel",
              includeMetadata: exportOptions.includeMetadata || false,
              includePerformanceMetrics: true,
              includeDeviceInfo: true,
              includeImages: false,
              dateRange,
              filters,
            },
          );
          break;

        default:
          exportData = await signatureAuditService.exportAuditData({
            format: exportOptions.format as "json" | "csv" | "pdf" | "excel",
            dateRange,
            filters,
            includeDetails: exportOptions.includeDetails,
            includeMetadata: exportOptions.includeMetadata,
            sortBy: "timestamp",
            sortOrder: "desc",
          });
      }

      // Create download link
      const blob = new Blob([exportData.data], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exportData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (isLoading && !analytics) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6 bg-gray-50 min-h-screen", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Signature Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive audit and compliance reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => loadDashboardData()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleExport("audit")}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Audit</span>
            </Button>
            <Button
              onClick={() => handleExport("performance")}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Performance</span>
            </Button>
            <Button
              onClick={() => handleExport("dashboard")}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Full Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    format: value as any,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search audit entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetails"
                    checked={exportOptions.includeDetails}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeDetails: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="includeDetails" className="text-sm">
                    Include Details
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeMetadata: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="includeMetadata" className="text-sm">
                    Include Metadata
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <LineChartIcon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Audit Trail</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics */}
          {enableMobileOptimization && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {realTimeMetrics.activeUsers}
                    </p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {realTimeMetrics.signaturesPerMinute}
                    </p>
                    <p className="text-sm text-gray-600">Signatures/Min</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {realTimeMetrics.averageResponseTime.toFixed(1)}ms
                    </p>
                    <p className="text-sm text-gray-600">Avg Response</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {realTimeMetrics.errorRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Error Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {realTimeMetrics.throughput}
                    </p>
                    <p className="text-sm text-gray-600">Hourly Throughput</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {realTimeMetrics.systemLoad.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">System Load</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Signatures
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.totalSignatures.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{analytics?.signaturesThisPeriod || 0} this period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Compliance Rate
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.complianceRate.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress
                    value={analytics?.complianceRate || 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg. Signing Time
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round((analytics?.averageSigningTime || 0) / 60000)}
                      m
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">
                    {((analytics?.averageSigningTime || 0) / 1000).toFixed(1)}s
                    average
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Users
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.mostActiveUsers.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Activity className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">Last 30 days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Signature Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.timeSeriesData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="signatures"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                      name="Signatures"
                    />
                    <Area
                      type="monotone"
                      dataKey="violations"
                      stackId="2"
                      stroke={COLORS.danger}
                      fill={COLORS.danger}
                      fillOpacity={0.6}
                      name="Violations"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Document Types */}
            <Card>
              <CardHeader>
                <CardTitle>Document Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.documentTypeDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name} (${percentage.toFixed(1)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(analytics?.documentTypeDistribution || []).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Dashboard */}
          {enablePerformanceTracking && performanceData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {(
                        performanceData.reduce(
                          (sum, p) => sum + p.completionTime,
                          0,
                        ) /
                        performanceData.length /
                        1000
                      ).toFixed(1)}
                      s
                    </p>
                    <p className="text-sm text-gray-600">Avg Completion Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(
                        performanceData.reduce(
                          (sum, p) => sum + p.frameRate,
                          0,
                        ) / performanceData.length
                      ).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Avg Frame Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {(
                        performanceData.reduce((sum, p) => sum + p.latency, 0) /
                        performanceData.length
                      ).toFixed(1)}
                      ms
                    </p>
                    <p className="text-sm text-gray-600">Avg Latency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Device Metrics */}
          {deviceMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Device Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Device Type</th>
                        <th className="text-left p-2">Count</th>
                        <th className="text-left p-2">Avg Time</th>
                        <th className="text-left p-2">Avg Pressure</th>
                        <th className="text-left p-2">Frame Rate</th>
                        <th className="text-left p-2">Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceMetrics.map((device, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">
                            {device.deviceType}
                          </td>
                          <td className="p-2">{device.count}</td>
                          <td className="p-2">
                            {(device.averageTime / 1000).toFixed(1)}s
                          </td>
                          <td className="p-2">
                            {device.averagePressure.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {device.averageFrameRate.toFixed(0)} FPS
                          </td>
                          <td className="p-2">
                            {device.averageLatency.toFixed(1)}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics?.complianceBreakdown.map((compliance, index) => (
              <Card key={compliance.standard}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {compliance.standard}
                    </h3>
                    <Badge
                      variant={
                        compliance.rate >= 90
                          ? "default"
                          : compliance.rate >= 70
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {compliance.rate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Compliant</span>
                      <span className="font-medium text-green-600">
                        {compliance.compliant}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Non-Compliant</span>
                      <span className="font-medium text-red-600">
                        {compliance.nonCompliant}
                      </span>
                    </div>
                    <Progress value={compliance.rate} className="h-2 mt-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Compliance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Breakdown by Standard</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics?.complianceBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="standard" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="compliant"
                    fill={COLORS.success}
                    name="Compliant"
                  />
                  <Bar
                    dataKey="nonCompliant"
                    fill={COLORS.danger}
                    name="Non-Compliant"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Completion Rate Tracking */}
          {completionRates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(
                        completionRates.reduce(
                          (sum, cr) => sum + cr.completionRate,
                          0,
                        ) / completionRates.length
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-sm text-gray-600">
                      Average Completion Rate
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {
                        completionRates.filter(
                          (cr) => cr.status === "completed",
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Completed Workflows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {(
                        completionRates.reduce(
                          (sum, cr) => sum + cr.duration,
                          0,
                        ) /
                        completionRates.length /
                        3600000
                      ).toFixed(1)}
                      h
                    </p>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionRates.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workflowId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="completionRate"
                      fill="#3b82f6"
                      name="Completion Rate (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Bottleneck Analysis */}
          {enableBottleneckAnalysis && bottleneckData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bottleneck Identification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bottleneckData.slice(0, 5).map((bottleneck, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{bottleneck.stepName}</h4>
                        <Badge
                          variant={
                            bottleneck.timeoutRate > 10
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {bottleneck.timeoutRate.toFixed(1)}% timeout rate
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Avg Time:</span>
                          <span className="ml-2 font-medium">
                            {(bottleneck.averageTime / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Median:</span>
                          <span className="ml-2 font-medium">
                            {(bottleneck.medianTime / 1000).toFixed(1)}s
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max:</span>
                          <span className="ml-2 font-medium">
                            {(bottleneck.maxTime / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Performance Analytics */}
          {enableUserAnalytics && userPerformanceData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Signatures</th>
                        <th className="text-left p-2">Avg Time</th>
                        <th className="text-left p-2">Compliance</th>
                        <th className="text-left p-2">Error Rate</th>
                        <th className="text-left p-2">Devices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPerformanceData.slice(0, 10).map((user, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{user.userName}</td>
                          <td className="p-2">{user.signaturesCompleted}</td>
                          <td className="p-2">
                            {(user.averageTime / 1000).toFixed(1)}s
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                user.complianceRate >= 95
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.complianceRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                user.errorRate <= 5 ? "default" : "destructive"
                              }
                            >
                              {user.errorRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="p-2">{user.deviceTypes.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      High Risk
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {analytics?.riskMetrics.highRisk || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Medium Risk
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {analytics?.riskMetrics.mediumRisk || 0}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Low Risk
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics?.riskMetrics.lowRisk || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Security Incidents
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {analytics?.riskMetrics.securityIncidents || 0}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics?.performanceMetrics.completionRate.toFixed(1) ||
                      0}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(
                      (analytics?.performanceMetrics.averageWorkflowTime || 0) /
                        60000,
                    )}
                    m
                  </p>
                  <p className="text-sm text-gray-600">Avg. Workflow Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics?.performanceMetrics.escalationRate.toFixed(1) ||
                      0}
                    %
                  </p>
                  <p className="text-sm text-gray-600">Escalation Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Series Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics?.timeSeriesData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    name="Compliance Rate (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="violations"
                    stroke={COLORS.danger}
                    strokeWidth={2}
                    name="Violations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Entries</CardTitle>
              <p className="text-sm text-gray-600">
                Showing {filteredAuditEntries.length} of {auditEntries.length}{" "}
                entries
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAuditEntries.slice(0, 50).map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            variant={
                              entry.severity === "high"
                                ? "destructive"
                                : entry.severity === "medium"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {entry.eventType}
                          </Badge>
                          <Badge
                            variant={
                              entry.complianceStatus === "compliant"
                                ? "default"
                                : entry.complianceStatus === "non_compliant"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {entry.complianceStatus}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {entry.details.action}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.details.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>User: {entry.userName}</span>
                          <span>Document: {entry.documentId}</span>
                          {entry.details.riskScore && (
                            <span>Risk: {entry.details.riskScore}/100</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {complianceReport && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Report Summary</CardTitle>
                <p className="text-sm text-gray-600">
                  Generated on{" "}
                  {new Date(complianceReport.generatedAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {complianceReport.summary.totalSignatures}
                    </p>
                    <p className="text-sm text-gray-600">Total Signatures</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {complianceReport.summary.complianceRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Compliance Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(
                        complianceReport.summary.averageProcessingTime / 60000,
                      )}
                      m
                    </p>
                    <p className="text-sm text-gray-600">
                      Avg. Processing Time
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {complianceReport.summary.completedWorkflows}
                    </p>
                    <p className="text-sm text-gray-600">Completed Workflows</p>
                  </div>
                </div>

                {/* Recommendations */}
                {complianceReport.recommendations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {complianceReport.recommendations.map(
                        (recommendation, index) => (
                          <Alert key={index}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {recommendation}
                            </AlertDescription>
                          </Alert>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {complianceReport.actionItems.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Action Items
                    </h4>
                    <div className="space-y-3">
                      {complianceReport.actionItems.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  item.priority === "high"
                                    ? "destructive"
                                    : item.priority === "medium"
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {item.priority}
                              </Badge>
                              <span className="font-medium">
                                {item.description}
                              </span>
                            </div>
                            {item.dueDate && (
                              <span className="text-xs text-gray-500">
                                Due:{" "}
                                {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {item.assignedTo && (
                            <p className="text-sm text-gray-600 mt-1">
                              Assigned to: {item.assignedTo}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignatureAnalyticsDashboard;
