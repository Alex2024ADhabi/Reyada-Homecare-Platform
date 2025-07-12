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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Brain,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import { DataTable } from "@/components/ui/data-table";
import { JsonValidator } from "@/utils/json-validator";
import {
  createDataMart,
  optimizeETLProcesses,
  monitorDataQuality,
  createCustomReport,
  createSelfServiceWorkspace,
  scheduleAutomatedReport,
  exportData,
  generatePDFReport,
  generateExcelReport,
  createDocumentWorkflow,
  processDocumentOCR,
  implementElectronicSignature,
  optimizeDatabaseQueries,
  implementCachingLayer,
  monitorPerformanceMetrics,
  configureLoadBalancing,
} from "@/api/integration-intelligence.api";
import {
  getRevenueAnalytics,
  getPredictiveInsights,
  getBusinessIntelligence,
  getRealTimeMetrics,
  getClinicalAnalytics,
  getOperationalMetrics,
} from "@/services/real-time-analytics.service";

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  target?: number;
  unit?: string;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: "revenue" | "operations" | "quality" | "compliance";
  recommendation: string;
  timeframe: string;
}

interface AdvancedDashboardProps {
  dateRange?: string;
  refreshInterval?: number;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  dateRange = "30d",
  refreshInterval = 30000,
}) => {
  const { toast } = useToastContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dataWarehouseMetrics, setDataWarehouseMetrics] = useState({
    totalDataMarts: 4,
    etlProcesses: 12,
    dataQualityScore: 94.2,
    storageUtilization: 78.5,
  });
  const [reportingMetrics, setReportingMetrics] = useState({
    totalReports: 156,
    scheduledReports: 23,
    selfServiceUsers: 45,
    dataExports: 89,
  });
  const [showDataWarehouse, setShowDataWarehouse] = useState(false);
  const [showReporting, setShowReporting] = useState(false);
  const [showSelfService, setShowSelfService] = useState(false);
  const [customReportData, setCustomReportData] = useState(null);
  const [exportProgress, setExportProgress] = useState(null);
  const [documentWorkflows, setDocumentWorkflows] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    queryOptimization: 0,
    cacheHitRate: 0,
    responseTime: 0,
    loadBalancingStatus: "inactive",
  });
  const [documentProcessing, setDocumentProcessing] = useState({
    ocrProgress: 0,
    signatureStatus: "pending",
    versionControl: "v1.0",
  });

  // Mock data - in real implementation, this would come from APIs
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      label: "Total Revenue",
      value: 2847500,
      change: 12.5,
      trend: "up",
      target: 3000000,
      unit: "AED",
    },
    {
      label: "Active Patients",
      value: 1247,
      change: 8.3,
      trend: "up",
      target: 1500,
    },
    {
      label: "Compliance Score",
      value: 94.2,
      change: 2.1,
      trend: "up",
      target: 95,
      unit: "%",
    },
    {
      label: "Avg Response Time",
      value: 2.3,
      change: -15.2,
      trend: "up",
      target: 2.0,
      unit: "hrs",
    },
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([
    { name: "Jan", value: 2400, change: 5.2 },
    { name: "Feb", value: 2210, change: -7.9 },
    { name: "Mar", value: 2290, change: 3.6 },
    { name: "Apr", value: 2000, change: -12.7 },
    { name: "May", value: 2181, change: 9.1 },
    { name: "Jun", value: 2500, change: 14.6 },
  ]);

  const [predictiveInsights, setPredictiveInsights] = useState<
    PredictiveInsight[]
  >([
    {
      id: "1",
      title: "Revenue Growth Opportunity",
      description:
        "Based on current trends, implementing automated billing could increase revenue by 18%",
      confidence: 87,
      impact: "high",
      category: "revenue",
      recommendation: "Deploy automated billing system within next quarter",
      timeframe: "3 months",
    },
    {
      id: "2",
      title: "Staff Optimization Alert",
      description:
        "Peak demand periods show 23% understaffing in physiotherapy services",
      confidence: 92,
      impact: "medium",
      category: "operations",
      recommendation: "Hire 2 additional physiotherapists or adjust scheduling",
      timeframe: "6 weeks",
    },
    {
      id: "3",
      title: "Compliance Risk Detected",
      description:
        "Documentation completion rates dropping below DOH requirements",
      confidence: 78,
      impact: "high",
      category: "compliance",
      recommendation: "Implement mandatory documentation checkpoints",
      timeframe: "2 weeks",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Fetch real-time analytics data
      const [
        revenueData,
        businessIntelligence,
        realTimeMetrics,
        clinicalData,
        operationalData,
      ] = await Promise.all([
        getRevenueAnalytics({ dateRange: selectedDateRange }),
        getBusinessIntelligence({ includeForecasting: true }),
        getRealTimeMetrics(),
        getClinicalAnalytics({ includeOutcomes: true }),
        getOperationalMetrics({ includeEfficiency: true }),
      ]);

      // Update metrics with real data
      setMetrics([
        {
          label: "Total Revenue",
          value: revenueData.totalRevenue || 2847500,
          change: revenueData.growthRate || 12.5,
          trend: "up",
          target: 3000000,
          unit: "AED",
        },
        {
          label: "Active Patients",
          value: realTimeMetrics.activePatients || 1247,
          change: realTimeMetrics.patientGrowth || 8.3,
          trend: "up",
          target: 1500,
        },
        {
          label: "Compliance Score",
          value: businessIntelligence.complianceScore || 94.2,
          change: businessIntelligence.complianceImprovement || 2.1,
          trend: "up",
          target: 95,
          unit: "%",
        },
        {
          label: "Avg Response Time",
          value: operationalData.avgResponseTime || 2.3,
          change: operationalData.responseTimeImprovement || -15.2,
          trend: "up",
          target: 2.0,
          unit: "hrs",
        },
      ]);

      // Update predictive insights
      const insights = await getPredictiveInsights({
        categories: ["revenue", "operations", "compliance"],
        timeframe: "90d",
      });
      setPredictiveInsights(insights.insights || predictiveInsights);

      // Update data warehouse metrics
      setDataWarehouseMetrics({
        totalDataMarts: businessIntelligence.dataMarts || 4,
        etlProcesses: businessIntelligence.etlProcesses || 12,
        dataQualityScore: businessIntelligence.dataQuality || 94.2,
        storageUtilization: businessIntelligence.storageUtilization || 78.5,
      });

      // Update reporting metrics
      setReportingMetrics({
        totalReports: businessIntelligence.totalReports || 156,
        scheduledReports: businessIntelligence.scheduledReports || 23,
        selfServiceUsers: businessIntelligence.selfServiceUsers || 45,
        dataExports: businessIntelligence.dataExports || 89,
      });

      setLastUpdated(new Date());

      toast({
        title: "Dashboard Updated",
        description: "Latest analytics data has been loaded",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing analytics data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDataMart = async () => {
    try {
      const martStructure = {
        martId: `mart_${Date.now()}`,
        name: "Custom Analytics Mart",
        type: "operational" as const,
        schema: {
          tables: [
            {
              name: "analytics_data",
              columns: [
                {
                  name: "id",
                  type: "varchar(50)",
                  constraints: ["PRIMARY KEY"],
                  indexes: ["idx_id"],
                },
                {
                  name: "metric_name",
                  type: "varchar(100)",
                  constraints: ["NOT NULL"],
                  indexes: ["idx_metric"],
                },
                {
                  name: "value",
                  type: "decimal(10,2)",
                  constraints: ["NOT NULL"],
                  indexes: [],
                },
                {
                  name: "timestamp",
                  type: "datetime",
                  constraints: ["NOT NULL"],
                  indexes: ["idx_timestamp"],
                },
              ],
              relationships: [],
            },
          ],
        },
        etlProcesses: [],
        dataQualityRules: [],
        refreshSchedule: "0 2 * * *",
        retentionPolicy: "5 years",
        accessControls: ["analytics_team"],
      };

      const martId = await createDataMart(martStructure);

      toast({
        title: "Data Mart Created",
        description: `Successfully created data mart: ${martId}`,
        variant: "success",
      });

      setDataWarehouseMetrics((prev) => ({
        ...prev,
        totalDataMarts: prev.totalDataMarts + 1,
      }));
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create data mart",
        variant: "destructive",
      });
    }
  };

  const handleOptimizeETL = async () => {
    try {
      const optimization = await optimizeETLProcesses();

      toast({
        title: "ETL Optimization Complete",
        description: `Overall improvement: ${optimization.overallImprovement.toFixed(1)}%`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize ETL processes",
        variant: "destructive",
      });
    }
  };

  const handleCreateCustomReport = async () => {
    try {
      const reportConfig = {
        name: "Custom Analytics Report",
        dataSources: ["clinical_mart", "financial_mart"],
        visualizations: [
          { type: "chart", config: { type: "bar" } },
          { type: "table", config: { columns: ["metric", "value"] } },
        ],
        filters: [],
        userId: "current_user",
      };

      const result = await createCustomReport(reportConfig);
      setCustomReportData(result);

      toast({
        title: "Report Created",
        description: `Custom report created: ${result.reportId}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Report Creation Failed",
        description: "Failed to create custom report",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async (format: string) => {
    try {
      setExportProgress({ status: "processing", progress: 0 });

      const exportConfig = {
        dataSource: "analytics_mart",
        format: format as "csv" | "excel" | "json" | "pdf",
        filters: [],
        columns: ["metric_name", "value", "timestamp"],
        userId: "current_user",
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev && prev.progress < 90) {
            return { ...prev, progress: prev.progress + 10 };
          }
          return prev;
        });
      }, 200);

      let result;
      if (format === "pdf") {
        result = await generatePDFReport(exportConfig);
      } else if (format === "excel") {
        result = await generateExcelReport(exportConfig);
      } else {
        result = await exportData(exportConfig);
      }

      clearInterval(progressInterval);
      setExportProgress({
        status: "completed",
        progress: 100,
        downloadUrl: result.downloadUrl,
      });

      toast({
        title: "Export Complete",
        description: `Data exported successfully as ${format.toUpperCase()}`,
        variant: "success",
      });
    } catch (error) {
      setExportProgress(null);
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleDocumentWorkflow = async (action: string) => {
    try {
      let result;
      switch (action) {
        case "ocr":
          setDocumentProcessing((prev) => ({ ...prev, ocrProgress: 0 }));
          result = await processDocumentOCR({
            documentId: "sample-doc-001",
            documentType: "clinical_form",
            processingOptions: {
              language: "en",
              extractTables: true,
              extractSignatures: true,
            },
          });
          setDocumentProcessing((prev) => ({ ...prev, ocrProgress: 100 }));
          break;
        case "signature":
          result = await implementElectronicSignature({
            documentId: "sample-doc-001",
            signerEmail: "clinician@rhhcs.ae",
            signatureType: "electronic",
            requiresTimestamp: true,
          });
          setDocumentProcessing((prev) => ({
            ...prev,
            signatureStatus: "completed",
          }));
          break;
        case "workflow":
          result = await createDocumentWorkflow({
            workflowName: "Clinical Document Review",
            steps: [
              { step: "document_upload", assignee: "clinician" },
              { step: "quality_review", assignee: "quality_manager" },
              { step: "final_approval", assignee: "medical_director" },
            ],
            automationRules: {
              autoAssign: true,
              notificationEnabled: true,
              deadlineTracking: true,
            },
          });
          setDocumentWorkflows((prev) => [...prev, result]);
          break;
      }

      toast({
        title: "Document Action Complete",
        description: `${action.toUpperCase()} processing completed successfully`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Document Action Failed",
        description: `Failed to process ${action}`,
        variant: "destructive",
      });
    }
  };

  const handlePerformanceOptimization = async (action: string) => {
    try {
      let result;
      switch (action) {
        case "database":
          result = await optimizeDatabaseQueries({
            targetTables: ["patients", "clinical_assessments", "care_plans"],
            optimizationType: "index_optimization",
            performanceTarget: "sub_100ms",
          });
          setPerformanceMetrics((prev) => ({
            ...prev,
            queryOptimization: result.improvementPercentage,
          }));
          break;
        case "caching":
          result = await implementCachingLayer({
            cacheType: "redis",
            cacheStrategy: "write_through",
            ttl: 3600,
            maxMemory: "2gb",
          });
          setPerformanceMetrics((prev) => ({
            ...prev,
            cacheHitRate: result.hitRate,
          }));
          break;
        case "monitoring":
          result = await monitorPerformanceMetrics({
            metricsToTrack: [
              "response_time",
              "throughput",
              "error_rate",
              "resource_utilization",
            ],
            alertThresholds: {
              response_time: 500,
              error_rate: 5,
              cpu_utilization: 80,
            },
          });
          setPerformanceMetrics((prev) => ({
            ...prev,
            responseTime: result.averageResponseTime,
          }));
          break;
        case "loadbalancing":
          result = await configureLoadBalancing({
            strategy: "round_robin",
            healthCheckInterval: 30,
            autoScaling: {
              enabled: true,
              minInstances: 2,
              maxInstances: 10,
              targetCPU: 70,
            },
          });
          setPerformanceMetrics((prev) => ({
            ...prev,
            loadBalancingStatus: "active",
          }));
          break;
      }

      toast({
        title: "Performance Optimization Complete",
        description: `${action.toUpperCase()} optimization implemented successfully`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: `Failed to implement ${action} optimization`,
        variant: "destructive",
      });
    }
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === "AED") {
      return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
      }).format(value);
    }

    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }

    if (unit === "hrs") {
      return `${value.toFixed(1)} hrs`;
    }

    return value.toLocaleString();
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up" && change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (trend === "up" && change < 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "revenue":
        return <DollarSign className="h-4 w-4" />;
      case "operations":
        return <Activity className="h-4 w-4" />;
      case "quality":
        return <Target className="h-4 w-4" />;
      case "compliance":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time AI-powered insights, predictive analytics, and
            comprehensive business intelligence for homecare operations
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshData} disabled={isLoading}>
            {isLoading ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend, metric.change)}
                    <span
                      className={`text-sm ${
                        metric.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {metric.target && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Target</div>
                    <div className="text-sm font-medium">
                      {formatValue(metric.target, metric.unit)}
                    </div>
                    <div
                      className={`text-xs ${
                        metric.value >= metric.target
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {((metric.value / metric.target) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertCircle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="warehouse">
            <Target className="h-4 w-4 mr-2" />
            Data Warehouse
          </TabsTrigger>
          <TabsTrigger value="reporting">
            <Activity className="h-4 w-4 mr-2" />
            Advanced Reporting
          </TabsTrigger>
          <TabsTrigger value="documents">
            <CheckCircle className="h-4 w-4 mr-2" />
            Document Management
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="exports">
            <DollarSign className="h-4 w-4 mr-2" />
            Export & Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Monthly revenue performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Interactive chart would be rendered here
                    </p>
                    <p className="text-sm text-gray-400">
                      Using Chart.js or similar library
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>
                  Key performance indicators breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "Patient Satisfaction",
                      value: 94,
                      color: "bg-green-500",
                    },
                    {
                      label: "Staff Efficiency",
                      value: 87,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Compliance Rate",
                      value: 96,
                      color: "bg-purple-500",
                    },
                    {
                      label: "Revenue Growth",
                      value: 78,
                      color: "bg-yellow-500",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-24 text-sm">{item.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium">
                        {item.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            {predictiveInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(insight.category)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">
                        Recommendation:
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {insight.recommendation}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Timeframe: {insight.timeframe}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        Category: {insight.category}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>
                Historical data analysis and future projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">
                    Advanced trend analysis charts
                  </p>
                  <p className="text-sm text-gray-400">
                    Time series analysis, forecasting, and pattern recognition
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {[
              {
                type: "warning",
                title: "Documentation Compliance Alert",
                message: "3 patient records missing required signatures",
                time: "2 hours ago",
              },
              {
                type: "info",
                title: "System Maintenance Scheduled",
                message: "Planned maintenance window: Sunday 2:00 AM - 4:00 AM",
                time: "1 day ago",
              },
              {
                type: "success",
                title: "Monthly Target Achieved",
                message:
                  "Revenue target for this month has been exceeded by 12%",
                time: "3 days ago",
              },
            ].map((alert, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        alert.type === "warning"
                          ? "bg-yellow-100"
                          : alert.type === "info"
                            ? "bg-blue-100"
                            : "bg-green-100"
                      }`}
                    >
                      {alert.type === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : alert.type === "info" ? (
                        <Activity className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{alert.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Warehouse Tab */}
        <TabsContent value="warehouse" className="mt-6">
          <div className="space-y-6">
            {/* Data Warehouse Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Data Marts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataWarehouseMetrics.totalDataMarts}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Active data marts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    ETL Processes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataWarehouseMetrics.etlProcesses}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Running processes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Data Quality Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataWarehouseMetrics.dataQualityScore.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    +2.1% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Storage Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataWarehouseMetrics.storageUtilization.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    of allocated space
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Data Warehouse Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Mart Management</CardTitle>
                  <CardDescription>
                    Create and manage data mart structures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCreateDataMart} className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Create New Data Mart
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Clinical Data Mart - Active</p>
                    <p>• Financial Data Mart - Active</p>
                    <p>• Operational Data Mart - Active</p>
                    <p>• Compliance Data Mart - Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ETL Optimization</CardTitle>
                  <CardDescription>
                    Monitor and optimize ETL processes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleOptimizeETL} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize ETL Processes
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Average execution time: 4.2 min</p>
                    <p>• Success rate: 98.5%</p>
                    <p>• Data freshness: 15 min</p>
                    <p>• Next optimization: 2 hours</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Quality Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Monitoring</CardTitle>
                <CardDescription>
                  Real-time data quality metrics and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      rule: "Completeness Check",
                      score: 96.8,
                      status: "passing",
                    },
                    {
                      rule: "Accuracy Validation",
                      score: 94.2,
                      status: "passing",
                    },
                    {
                      rule: "Consistency Rules",
                      score: 91.5,
                      status: "warning",
                    },
                    {
                      rule: "Uniqueness Constraints",
                      score: 98.1,
                      status: "passing",
                    },
                  ].map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            rule.status === "passing"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="font-medium">{rule.rule}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{rule.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Reporting Tab */}
        <TabsContent value="reporting" className="mt-6">
          <div className="space-y-6">
            {/* Reporting Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportingMetrics.totalReports}
                  </div>
                  <p className="text-xs text-green-600 mt-1">+12 this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Scheduled Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportingMetrics.scheduledReports}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Self-Service Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportingMetrics.selfServiceUsers}
                  </div>
                  <p className="text-xs text-green-600 mt-1">+8 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Data Exports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportingMetrics.dataExports}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Reporting Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Report Builder</CardTitle>
                  <CardDescription>
                    Create custom reports with drag-and-drop interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCreateCustomReport} className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Create Custom Report
                  </Button>
                  {customReportData && (
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-sm text-green-800">
                        Report created: {customReportData.reportId}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {customReportData.recommendations.length}{" "}
                        recommendations available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Self-Service Analytics</CardTitle>
                  <CardDescription>
                    Enable users to create their own analytics workspaces
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setShowSelfService(!showSelfService)}
                    className="w-full"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Launch Self-Service Portal
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Drag-and-drop report builder</p>
                    <p>• Pre-built visualization templates</p>
                    <p>• Real-time data connections</p>
                    <p>• Collaborative workspaces</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Export Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Data Export Capabilities</CardTitle>
                <CardDescription>
                  Export data in multiple formats with advanced filtering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["CSV", "Excel", "JSON", "PDF"].map((format) => (
                    <Button
                      key={format}
                      variant="outline"
                      onClick={() => handleExportData(format.toLowerCase())}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Export {format}
                    </Button>
                  ))}
                </div>

                {exportProgress && (
                  <div className="mt-4 p-4 bg-blue-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Export Progress
                      </span>
                      <span className="text-sm">
                        {exportProgress.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress.progress}%` }}
                      />
                    </div>
                    {exportProgress.status === "completed" &&
                      exportProgress.downloadUrl && (
                        <div className="mt-2">
                          <a
                            href={exportProgress.downloadUrl}
                            className="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download exported file
                          </a>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Automated Report Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Report Scheduling</CardTitle>
                <CardDescription>
                  Schedule reports to be generated and delivered automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Executive Summary",
                      frequency: "Daily",
                      nextRun: "Tomorrow 8:00 AM",
                      recipients: 3,
                    },
                    {
                      name: "Financial Report",
                      frequency: "Weekly",
                      nextRun: "Monday 9:00 AM",
                      recipients: 5,
                    },
                    {
                      name: "Quality Metrics",
                      frequency: "Monthly",
                      nextRun: "1st of next month",
                      recipients: 8,
                    },
                    {
                      name: "Compliance Dashboard",
                      frequency: "Weekly",
                      nextRun: "Friday 5:00 PM",
                      recipients: 12,
                    },
                  ].map((schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{schedule.name}</div>
                        <div className="text-sm text-gray-600">
                          {schedule.frequency} • Next: {schedule.nextRun}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {schedule.recipients} recipients
                        </div>
                        <div className="text-xs text-green-600">Active</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Document Management Tab */}
        <TabsContent value="documents" className="mt-6">
          <div className="space-y-6">
            {/* Document Processing Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    OCR Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {documentProcessing.ocrProgress}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Document extraction progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Electronic Signatures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {documentProcessing.signatureStatus}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Signature processing status
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Version Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {documentProcessing.versionControl}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Current document version
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Document Management Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>OCR & Document Processing</CardTitle>
                  <CardDescription>
                    Extract text and data from scanned documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleDocumentWorkflow("ocr")}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Document OCR
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Automatic text extraction</p>
                    <p>• Table and form recognition</p>
                    <p>• Signature detection</p>
                    <p>• Multi-language support</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Electronic Signature Integration</CardTitle>
                  <CardDescription>
                    Secure digital signature workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleDocumentWorkflow("signature")}
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Implement E-Signature
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Legal compliance</p>
                    <p>• Timestamp verification</p>
                    <p>• Multi-party signing</p>
                    <p>• Audit trail tracking</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Workflow Engine */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Document Workflow</CardTitle>
                <CardDescription>
                  Configure and manage document approval processes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleDocumentWorkflow("workflow")}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create Document Workflow
                </Button>

                {documentWorkflows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Active Workflows:</h4>
                    {documentWorkflows.map((workflow, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">
                          {workflow.workflowName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {workflow.steps?.length || 0} steps configured
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="space-y-6">
            {/* Performance Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Query Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.queryOptimization.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Performance improvement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cache Hit Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.cacheHitRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cache efficiency</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.responseTime.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Average response time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Load Balancing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {performanceMetrics.loadBalancingStatus}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-scaling status
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Optimization Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Optimization</CardTitle>
                  <CardDescription>
                    Optimize database queries and indexing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handlePerformanceOptimization("database")}
                    className="w-full"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize Database Queries
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Index optimization</p>
                    <p>• Query plan analysis</p>
                    <p>• Performance tuning</p>
                    <p>• Resource monitoring</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Caching Layer Implementation</CardTitle>
                  <CardDescription>
                    Deploy comprehensive caching strategy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handlePerformanceOptimization("caching")}
                    className="w-full"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Implement Caching Layer
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Redis integration</p>
                    <p>• Cache invalidation</p>
                    <p>• Memory optimization</p>
                    <p>• Hit rate monitoring</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Infrastructure Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Monitoring</CardTitle>
                  <CardDescription>
                    Real-time system performance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handlePerformanceOptimization("monitoring")}
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Enable Performance Monitoring
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Real-time metrics</p>
                    <p>• Alert thresholds</p>
                    <p>• Performance dashboards</p>
                    <p>• Historical analysis</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Load Balancing & Auto-Scaling</CardTitle>
                  <CardDescription>
                    Configure automatic scaling and load distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() =>
                      handlePerformanceOptimization("loadbalancing")
                    }
                    className="w-full"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Configure Load Balancing
                  </Button>
                  <div className="text-sm text-gray-600">
                    <p>• Auto-scaling policies</p>
                    <p>• Health check monitoring</p>
                    <p>• Traffic distribution</p>
                    <p>• Failover management</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Export & Reports Tab */}
        <TabsContent value="exports" className="mt-6">
          <div className="space-y-6">
            {/* Enhanced Export Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Export & Reporting</CardTitle>
                <CardDescription>
                  Generate comprehensive reports in multiple formats with
                  automated scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {["PDF", "Excel", "CSV", "JSON"].map((format) => (
                    <Button
                      key={format}
                      variant="outline"
                      onClick={() => handleExportData(format.toLowerCase())}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Export {format}
                    </Button>
                  ))}
                </div>

                {exportProgress && (
                  <div className="mt-4 p-4 bg-blue-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Export Progress
                      </span>
                      <span className="text-sm">
                        {exportProgress.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress.progress}%` }}
                      />
                    </div>
                    {exportProgress.status === "completed" &&
                      exportProgress.downloadUrl && (
                        <div className="mt-2">
                          <a
                            href={exportProgress.downloadUrl}
                            className="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download exported file
                          </a>
                        </div>
                      )}
                  </div>
                )}

                {/* Bulk Export Capabilities */}
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-3">
                    Bulk Data Export Features:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>• Multi-table data extraction</p>
                      <p>• Custom date range filtering</p>
                      <p>• Automated report scheduling</p>
                    </div>
                    <div>
                      <p>• Template-based reporting</p>
                      <p>• Email delivery integration</p>
                      <p>• Compression and encryption</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Report Template Engine */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Template Engine</CardTitle>
                <CardDescription>
                  Create and manage custom report templates for automated
                  generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Clinical Reports
                    </Button>
                    <Button className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financial Reports
                    </Button>
                    <Button className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Compliance Reports
                    </Button>
                  </div>

                  <div className="p-4 bg-green-50 rounded">
                    <h5 className="font-medium text-green-800 mb-2">
                      Template Engine Features:
                    </h5>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Drag-and-drop report builder</p>
                      <p>• Dynamic data binding</p>
                      <p>• Conditional formatting</p>
                      <p>• Multi-language support</p>
                      <p>• Brand customization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;
