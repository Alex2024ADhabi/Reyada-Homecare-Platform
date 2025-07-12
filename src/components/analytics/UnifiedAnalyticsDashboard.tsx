import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
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
  Activity,
  Users,
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Target,
  Zap,
  Brain,
  Gauge,
  PieChart,
  LineChart,
  Wifi,
  WifiOff,
  Database,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Minus,
  Settings,
  Monitor,
  Stethoscope,
  Building,
  Cpu,
} from "lucide-react";

// Import all analytics dashboard components
import BusinessIntelligenceDashboard from "@/components/analytics/BusinessIntelligenceDashboard";
import ClinicalAnalyticsPlatform from "@/components/analytics/ClinicalAnalyticsPlatform";
import OperationalAnalyticsDashboard from "@/components/analytics/OperationalAnalyticsDashboard";
import PerformanceAnalyticsDashboard from "@/components/analytics/PerformanceAnalyticsDashboard";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import AdvancedSearch, {
  SearchFilter,
  SearchQuery,
} from "@/components/ui/advanced-search";
import {
  getRevenueAnalytics,
  getAccountsReceivableAging,
  getDenialAnalytics,
  getRevenueForecasting,
  getPayerPerformance,
  getEnhancedRevenueMetrics,
  getBusinessProcessOptimizationRecommendations,
  getBusinessProcessMetrics,
  getComplianceMetrics,
  generateComplianceReport,
  createAdvancedReport,
  generateAdvancedReport,
  generateCompliancePredictions,
  getAIPoweredComplianceInsights,
  createMobileOptimizedReport,
  generateMobileReport,
  integrateRegulatorySystem,
  syncRegulatoryData,
  createAdvancedVisualization,
  generateAdvancedVisualizationData,
  getMobileFieldComplianceData,
  getAIPoweredRiskPredictions,
  getExternalSystemsStatus,
  getAdvancedVisualizationMetrics,
} from "@/api/revenue-analytics.api";
import {
  getPerformanceTestMetrics,
  triggerLoadTest,
  getLoadTestResults,
  getPerformanceBenchmarks,
} from "@/api/quality-management.api";
import { LoadingSpinner, ProgressBar } from "@/components/ui/loading-states";
import { executeDataLakeQuery } from "@/api/data-lake.api";

interface CrossModuleKPI {
  id: string;
  name: string;
  category:
    | "clinical"
    | "revenue"
    | "compliance"
    | "operational"
    | "administrative";
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  status: "excellent" | "good" | "warning" | "critical";
  lastUpdated: string;
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  threshold: {
    warning: number;
    critical: number;
  };
  status: "normal" | "warning" | "critical";
  unit: string;
  description: string;
}

interface PredictiveInsight {
  id: string;
  type: "forecast" | "risk" | "anomaly";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  timeframe: string;
  recommendation: string;
  data: {
    current: number;
    predicted: number;
    variance: number;
  };
}

interface UnifiedAnalyticsDashboardProps {
  isOffline?: boolean;
  facilityId?: string;
  userRole?: string;
  customFilters?: {
    timeframe?: string;
    department?: string;
    priority?: string;
  };
}

const UnifiedAnalyticsDashboard: React.FC<UnifiedAnalyticsDashboardProps> = ({
  isOffline = false,
  facilityId = "RHHCS-001",
  userRole = "admin",
  customFilters = {},
}) => {
  const { isOnline, isSyncing, pendingItems } = useOfflineSync();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("today");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    filters: {},
  });
  const [filteredData, setFilteredData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [agingData, setAgingData] = useState<any>(null);
  const [denialData, setDenialData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [enhancedMetrics, setEnhancedMetrics] = useState<any>(null);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [processOptimizations, setProcessOptimizations] = useState<any[]>([]);
  const [processMetrics, setProcessMetrics] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [complianceReports, setComplianceReports] = useState<any[]>([]);
  const [advancedReports, setAdvancedReports] = useState<any[]>([]);
  const [compliancePredictions, setCompliancePredictions] = useState<any[]>([]);
  const [mobileOptimization, setMobileOptimization] = useState<any>(null);
  const [regulatoryIntegrations, setRegulatoryIntegrations] = useState<any[]>(
    [],
  );
  const [advancedVisualizations, setAdvancedVisualizations] = useState<any[]>(
    [],
  );
  const [mobileFieldData, setMobileFieldData] = useState<any>(null);
  const [aiRiskPredictions, setAiRiskPredictions] = useState<any>(null);
  const [externalSystemsStatus, setExternalSystemsStatus] = useState<any>(null);
  const [advancedVizMetrics, setAdvancedVizMetrics] = useState<any>(null);
  const [loadTestResults, setLoadTestResults] = useState<any>(null);
  const [performanceBenchmarks, setPerformanceBenchmarks] = useState<any>(null);
  const [testExecutionStatus, setTestExecutionStatus] = useState<{
    isRunning: boolean;
    currentTest?: string;
    progress?: number;
  }>({ isRunning: false });

  // Mock data - in production, this would come from APIs
  const [crossModuleKPIs] = useState<CrossModuleKPI[]>([
    {
      id: "patient_satisfaction",
      name: "Patient Satisfaction Score",
      category: "clinical",
      value: 4.7,
      target: 4.5,
      unit: "/5.0",
      trend: "up",
      change: 0.3,
      status: "excellent",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "revenue_collection",
      name: "Revenue Collection Rate",
      category: "revenue",
      value: 94.2,
      target: 90.0,
      unit: "%",
      trend: "up",
      change: 2.1,
      status: "excellent",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "compliance_score",
      name: "Overall Compliance Score",
      category: "compliance",
      value: 96.8,
      target: 95.0,
      unit: "%",
      trend: "stable",
      change: 0.1,
      status: "excellent",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "operational_efficiency",
      name: "Operational Efficiency Index",
      category: "operational",
      value: 88.5,
      target: 85.0,
      unit: "%",
      trend: "up",
      change: 1.8,
      status: "good",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "staff_utilization",
      name: "Staff Utilization Rate",
      category: "administrative",
      value: 87.3,
      target: 85.0,
      unit: "%",
      trend: "up",
      change: 2.5,
      status: "good",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "episode_completion",
      name: "Episode Completion Rate",
      category: "clinical",
      value: 92.1,
      target: 90.0,
      unit: "%",
      trend: "up",
      change: 1.2,
      status: "good",
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const [realTimeMetrics] = useState<RealTimeMetric[]>([
    {
      id: "active_patients",
      name: "Active Patients",
      value: 247,
      threshold: { warning: 300, critical: 350 },
      status: "normal",
      unit: "patients",
      description: "Currently active patient episodes",
    },
    {
      id: "pending_authorizations",
      name: "Pending Authorizations",
      value: 23,
      threshold: { warning: 50, critical: 100 },
      status: "normal",
      unit: "requests",
      description: "Authorization requests awaiting approval",
    },
    {
      id: "system_uptime",
      name: "System Uptime",
      value: 99.8,
      threshold: { warning: 98.0, critical: 95.0 },
      status: "normal",
      unit: "%",
      description: "Platform availability in last 24 hours",
    },
    {
      id: "data_sync_status",
      name: "Data Synchronization",
      value: 98.5,
      threshold: { warning: 95.0, critical: 90.0 },
      status: "normal",
      unit: "%",
      description: "Cross-module data synchronization health",
    },
  ]);

  const [predictiveInsights] = useState<PredictiveInsight[]>([
    {
      id: "revenue_growth",
      type: "forecast",
      title: "Revenue Growth Projection",
      description:
        "Expected 12% revenue increase over next quarter based on current trends",
      confidence: 87,
      impact: "high",
      timeframe: "Next 3 months",
      recommendation: "Prepare for increased capacity requirements",
      data: {
        current: 1250000,
        predicted: 1400000,
        variance: 50000,
      },
    },
    {
      id: "capacity_risk",
      type: "risk",
      title: "Capacity Utilization Risk",
      description: "High probability of reaching capacity limits in Q2 2025",
      confidence: 92,
      impact: "high",
      timeframe: "Next 6 months",
      recommendation: "Consider staff expansion and resource optimization",
      data: {
        current: 87.3,
        predicted: 95.8,
        variance: 3.2,
      },
    },
    {
      id: "compliance_anomaly",
      type: "anomaly",
      title: "Documentation Compliance Anomaly",
      description:
        "Unusual pattern detected in clinical documentation completion rates",
      confidence: 78,
      impact: "medium",
      timeframe: "Last 2 weeks",
      recommendation:
        "Review documentation workflows and provide additional training",
      data: {
        current: 94.2,
        predicted: 96.8,
        variance: 2.6,
      },
    },
  ]);

  // Enhanced data loading with error handling and caching
  const loadAnalyticsData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const promises = [];

      // Core revenue analytics
      promises.push(getRevenueAnalytics());
      promises.push(getAccountsReceivableAging());
      promises.push(getDenialAnalytics());
      promises.push(getRevenueForecasting());
      promises.push(getEnhancedRevenueMetrics({ realTimeUpdates: true }));

      // Business process optimization and enhanced features
      if (isOnline) {
        promises.push(getBusinessProcessOptimizationRecommendations());
        promises.push(getBusinessProcessMetrics());
        promises.push(getComplianceMetrics());
        promises.push(generateCompliancePredictions());
        promises.push(getAIPoweredComplianceInsights("comprehensive"));
        promises.push(getMobileFieldComplianceData());
        promises.push(getAIPoweredRiskPredictions());
        promises.push(getExternalSystemsStatus());
        promises.push(getAdvancedVisualizationMetrics());
      }

      const results = await Promise.allSettled(promises);

      // Process results with error handling
      const [
        revenue,
        aging,
        denial,
        forecast,
        enhanced,
        optimizations,
        metrics,
        compliance,
        predictions,
        aiInsights,
        mobileField,
        aiRisk,
        externalSystems,
        advancedViz,
      ] = results;

      if (revenue.status === "fulfilled") setRevenueData(revenue.value);
      if (aging.status === "fulfilled") setAgingData(aging.value);
      if (denial.status === "fulfilled") setDenialData(denial.value);
      if (forecast.status === "fulfilled") setForecastData(forecast.value);
      if (enhanced.status === "fulfilled") {
        setEnhancedMetrics(enhanced.value);
        setAlertsData(enhanced.value.alertsAndNotifications || []);
      }
      if (optimizations?.status === "fulfilled")
        setProcessOptimizations(optimizations.value);
      if (metrics?.status === "fulfilled") setProcessMetrics(metrics.value);
      if (compliance?.status === "fulfilled")
        setComplianceData(compliance.value);
      if (predictions?.status === "fulfilled")
        setCompliancePredictions(predictions.value);
      if (aiInsights?.status === "fulfilled") {
        // Process AI insights data
        setComplianceData((prev: any) => ({
          ...prev,
          aiInsights: aiInsights.value,
        }));
      }
      if (mobileField?.status === "fulfilled")
        setMobileFieldData(mobileField.value);
      if (aiRisk?.status === "fulfilled") setAiRiskPredictions(aiRisk.value);
      if (externalSystems?.status === "fulfilled")
        setExternalSystemsStatus(externalSystems.value);
      if (advancedViz?.status === "fulfilled")
        setAdvancedVizMetrics(advancedViz.value);

      // Update system health
      setSystemHealth({
        dataFreshness: new Date(),
        apiResponseTime: Date.now() - performance.now(),
        errorRate:
          results.filter((r) => r.status === "rejected").length /
          results.length,
        cacheHitRate: 0.85, // Mock value
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error loading analytics data:", error);
      // Set error state for user feedback
      setAlertsData((prev) => [
        ...prev,
        {
          id: "data_load_error",
          type: "error",
          message: "Failed to load some analytics data. Please try refreshing.",
          severity: "high",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, isOnline]);

  // Auto-refresh with intelligent intervals
  useEffect(() => {
    loadAnalyticsData();

    if (!autoRefresh || isOffline) return;

    const interval = setInterval(() => {
      if (isOnline && !isSyncing) {
        loadAnalyticsData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [
    loadAnalyticsData,
    autoRefresh,
    refreshInterval,
    isOnline,
    isOffline,
    isSyncing,
  ]);

  useEffect(() => {
    // Apply search filters when query changes
    if (searchQuery.query || Object.keys(searchQuery.filters).length > 0) {
      applySearchFilters();
    } else {
      setFilteredData(null);
    }
  }, [searchQuery, revenueData, agingData, denialData]);

  const refreshData = useCallback(async () => {
    await loadAnalyticsData();
  }, [loadAnalyticsData]);

  const applySearchFilters = () => {
    if (!revenueData) return;

    let filtered = { ...revenueData };

    // Apply text search
    if (searchQuery.query) {
      const query = searchQuery.query.toLowerCase();
      filtered.payerBreakdown = filtered.payerBreakdown.filter((payer: any) =>
        payer.payerName.toLowerCase().includes(query),
      );
      filtered.serviceLineBreakdown = filtered.serviceLineBreakdown.filter(
        (service: any) => service.serviceLine.toLowerCase().includes(query),
      );
    }

    // Apply date filters
    if (searchQuery.filters.dateFrom || searchQuery.filters.dateTo) {
      const fromDate = searchQuery.filters.dateFrom
        ? new Date(searchQuery.filters.dateFrom)
        : null;
      const toDate = searchQuery.filters.dateTo
        ? new Date(searchQuery.filters.dateTo)
        : null;

      filtered.monthlyTrends = filtered.monthlyTrends.filter((trend: any) => {
        const trendDate = new Date(trend.month);
        if (fromDate && trendDate < fromDate) return false;
        if (toDate && trendDate > toDate) return false;
        return true;
      });
    }

    // Apply payer filter
    if (searchQuery.filters.payer) {
      filtered.payerBreakdown = filtered.payerBreakdown.filter(
        (payer: any) => payer.payerName === searchQuery.filters.payer,
      );
    }

    // Apply service line filter
    if (searchQuery.filters.serviceLine) {
      filtered.serviceLineBreakdown = filtered.serviceLineBreakdown.filter(
        (service: any) =>
          service.serviceLine === searchQuery.filters.serviceLine,
      );
    }

    setFilteredData(filtered);
  };

  const getKPIIcon = (category: string) => {
    switch (category) {
      case "clinical":
        return <Activity className="h-5 w-5" />;
      case "revenue":
        return <DollarSign className="h-5 w-5" />;
      case "compliance":
        return <Shield className="h-5 w-5" />;
      case "operational":
        return <BarChart3 className="h-5 w-5" />;
      case "administrative":
        return <Users className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "forecast":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "anomaly":
        return <Eye className="h-5 w-5 text-purple-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const searchFilters: SearchFilter[] = [
    {
      id: "dateFrom",
      label: "From Date",
      type: "date",
      placeholder: "Select start date",
    },
    {
      id: "dateTo",
      label: "To Date",
      type: "date",
      placeholder: "Select end date",
    },
    {
      id: "payer",
      label: "Payer",
      type: "select",
      options:
        revenueData?.payerBreakdown?.map((payer: any) => ({
          value: payer.payerName,
          label: payer.payerName,
        })) || [],
      placeholder: "Select payer",
    },
    {
      id: "serviceLine",
      label: "Service Line",
      type: "select",
      options:
        revenueData?.serviceLineBreakdown?.map((service: any) => ({
          value: service.serviceLine,
          label: service.serviceLine,
        })) || [],
      placeholder: "Select service line",
    },
    {
      id: "revenueRange",
      label: "Revenue Range",
      type: "select",
      options: [
        { value: "0-100000", label: "$0 - $100K" },
        { value: "100000-500000", label: "$100K - $500K" },
        { value: "500000-1000000", label: "$500K - $1M" },
        { value: "1000000+", label: "$1M+" },
      ],
      placeholder: "Select revenue range",
    },
    {
      id: "collectionRate",
      label: "Collection Rate",
      type: "select",
      options: [
        { value: "0-70", label: "Below 70%" },
        { value: "70-85", label: "70% - 85%" },
        { value: "85-95", label: "85% - 95%" },
        { value: "95+", label: "Above 95%" },
      ],
      placeholder: "Select collection rate",
    },
  ];

  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
  };

  const displayData = filteredData || revenueData;

  // Calculate total pending sync items
  const totalPendingItems = useMemo(() => {
    return Object.values(pendingItems).reduce((sum, count) => sum + count, 0);
  }, [pendingItems]);

  // Enhanced KPI calculations
  const enhancedKPIs = useMemo(() => {
    if (!displayData) return [];

    return [
      {
        id: "real_time_revenue",
        name: "Real-Time Revenue",
        value: displayData.totalRevenue || 0,
        format: "currency",
        trend: "up",
        change: 5.2,
        status: "excellent",
        description: "Total revenue processed in real-time",
      },
      {
        id: "collection_velocity",
        name: "Collection Velocity",
        value: displayData.collectionRate || 0,
        format: "percentage",
        trend: "up",
        change: 2.1,
        status: "good",
        description: "Speed of payment collection",
      },
      {
        id: "denial_prevention",
        name: "Denial Prevention Rate",
        value: 100 - (displayData.denialRate || 0),
        format: "percentage",
        trend: "up",
        change: 1.8,
        status: "excellent",
        description: "Percentage of claims processed without denial",
      },
      {
        id: "process_automation",
        name: "Process Automation",
        value: 87.5,
        format: "percentage",
        trend: "up",
        change: 3.2,
        status: "good",
        description: "Percentage of automated processes",
      },
    ];
  }, [displayData]);

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      {/* Enhanced Header with System Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-primary" />
            Unified Analytics Dashboard
            {isSyncing && (
              <div className="ml-3 flex items-center text-blue-600">
                <Database className="h-4 w-4 mr-1 animate-pulse" />
                <span className="text-sm">Syncing...</span>
              </div>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Cross-module KPI tracking, real-time metrics, and predictive
            insights
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500 gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            {totalPendingItems > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalPendingItems} Pending Sync
              </Badge>
            )}
            {alertsData.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alertsData.length} Alert{alertsData.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <Badge
              variant={isOffline || !isOnline ? "destructive" : "secondary"}
              className="text-xs"
            >
              {isOffline || !isOnline ? "Offline Mode" : "Live Data"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500">Auto-refresh:</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-6 px-2 text-xs ${autoRefresh ? "text-green-600" : "text-gray-400"}`}
            >
              {autoRefresh ? "ON" : "OFF"}
            </Button>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} disabled={loading || isSyncing}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading || isSyncing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="mb-6">
        <AdvancedSearch
          placeholder="Search analytics data, payers, service lines..."
          filters={searchFilters}
          onSearch={handleSearch}
          showFilterCount={true}
          enableSavedSearches={true}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="overview">
            <Gauge className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="clinical">
            <Stethoscope className="h-4 w-4 mr-2" />
            Clinical
          </TabsTrigger>
          <TabsTrigger value="operational">
            <Activity className="h-4 w-4 mr-2" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Monitor className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="kpis">
            <Target className="h-4 w-4 mr-2" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="realtime">
            <Zap className="h-4 w-4 mr-2" />
            Real-Time
          </TabsTrigger>
          <TabsTrigger value="predictive">
            <Brain className="h-4 w-4 mr-2" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reporting">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Users className="h-4 w-4 mr-2" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Database className="h-4 w-4 mr-2" />
            Integration
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Alerts Section */}
          {alertsData.length > 0 && (
            <div className="mb-6">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Active Alerts ({alertsData.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alertsData.slice(0, 3).map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded border"
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-3 ${
                              alert.severity === "high"
                                ? "bg-red-500"
                                : alert.severity === "medium"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {alert.message}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Performance Indicators */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {enhancedKPIs.map((kpi, index) => (
                <Card
                  key={kpi.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 font-medium">
                          {kpi.name}
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {kpi.format === "currency"
                            ? `${kpi.value.toLocaleString()}`
                            : kpi.format === "percentage"
                              ? `${kpi.value.toFixed(1)}%`
                              : kpi.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {kpi.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${
                            kpi.status === "excellent"
                              ? "bg-green-100"
                              : kpi.status === "good"
                                ? "bg-blue-100"
                                : "bg-yellow-100"
                          }`}
                        >
                          {kpi.trend === "up" ? (
                            <TrendingUpIcon className="h-4 w-4 text-green-600" />
                          ) : kpi.trend === "down" ? (
                            <TrendingDownIcon className="h-4 w-4 text-red-600" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            kpi.trend === "up"
                              ? "text-green-600"
                              : kpi.trend === "down"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {kpi.change > 0 ? "+" : ""}
                          {kpi.change}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Real-time Revenue Metrics */}
          {displayData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        ${displayData.totalRevenue?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Collection Rate
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {displayData.collectionRate?.toFixed(1) || "0"}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">
                        Denial Rate
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {displayData.denialRate?.toFixed(1) || "0"}%
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Avg Days to Payment
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {displayData.averageDaysToPayment?.toFixed(0) || "0"}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Top KPIs Summary */}
            {crossModuleKPIs.slice(0, 6).map((kpi) => (
              <Card
                key={kpi.id}
                className={`border-l-4 ${getStatusColor(kpi.status)}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center">
                      {getKPIIcon(kpi.category)}
                      <span className="ml-2">{kpi.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {kpi.category}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {kpi.value}
                        {kpi.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Target: {kpi.target}
                        {kpi.unit}
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : kpi.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-300 rounded-full mr-1" />
                      )}
                      <span
                        className={
                          kpi.trend === "up"
                            ? "text-green-600"
                            : kpi.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                        }
                      >
                        {kpi.change > 0 ? "+" : ""}
                        {kpi.change}
                        {kpi.unit}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(kpi.value / kpi.target) * 100}
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Analytics Charts */}
          {displayData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Payer Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayData.payerBreakdown
                      ?.slice(0, 5)
                      .map((payer: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{payer.payerName}</div>
                            <div className="text-sm text-gray-500">
                              {payer.claims} claims •{" "}
                              {payer.collectionRate.toFixed(1)}% collection
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              ${payer.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payer.denialRate.toFixed(1)}% denial
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayData.monthlyTrends
                      ?.slice(0, 6)
                      .map((trend: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{trend.month}</div>
                            <div className="text-sm text-gray-500">
                              {trend.claims} claims
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              ${trend.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600">
                              {trend.collectionRate.toFixed(1)}% collected
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Real-Time Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realTimeMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-500">
                          {metric.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getMetricStatusColor(metric.status)}`}
                        >
                          {metric.value}
                          {metric.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {metric.status === "normal" ? (
                            <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />
                          ) : metric.status === "warning" ? (
                            <AlertTriangle className="h-3 w-3 inline mr-1 text-yellow-500" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 inline mr-1 text-red-500" />
                          )}
                          {metric.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Insights Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveInsights.slice(0, 3).map((insight) => (
                    <div
                      key={insight.id}
                      className="border-l-4 border-blue-200 pl-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            {getInsightIcon(insight.type)}
                            <span className="font-medium ml-2">
                              {insight.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                            <Badge
                              variant={
                                insight.impact === "high"
                                  ? "destructive"
                                  : insight.impact === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Intelligence Tab */}
        <TabsContent value="business" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Business Intelligence Dashboard
                </CardTitle>
                <CardDescription>
                  Executive KPIs, strategic insights, market analysis, and
                  forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <BusinessIntelligenceDashboard
                    facilityId={facilityId}
                    timeframe={customFilters.timeframe || timeframe}
                    userRole={userRole}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clinical Analytics Tab */}
        <TabsContent value="clinical" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Clinical Analytics Platform
                </CardTitle>
                <CardDescription>
                  Patient outcomes, quality metrics, patient safety, and care
                  pathways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ClinicalAnalyticsPlatform
                    facilityId={facilityId}
                    timeframe={customFilters.timeframe || timeframe}
                    department={customFilters.department}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operational Analytics Tab */}
        <TabsContent value="operational" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Operational Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Real-time operational metrics, workflow analysis, and resource
                  optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <OperationalAnalyticsDashboard
                    facilityId={facilityId}
                    refreshInterval={refreshInterval}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Performance Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  System performance monitoring, scalability metrics, and
                  response time analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <PerformanceAnalyticsDashboard
                    facilityId={facilityId}
                    timeframe={customFilters.timeframe || timeframe}
                    priority={customFilters.priority}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cross-Module KPIs Tab */}
        <TabsContent value="kpis" className="mt-6">
          {/* Service Line Performance */}
          {displayData?.serviceLineBreakdown && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Service Line Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayData.serviceLineBreakdown.map(
                  (service: any, index: number) => (
                    <Card
                      key={index}
                      className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-indigo-900">
                            {service.serviceLine}
                          </h4>
                          <Badge variant="outline" className="text-indigo-600">
                            {service.profitMargin.toFixed(1)}% margin
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Revenue:</span>
                            <span className="font-medium">
                              ${service.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Claims:</span>
                            <span className="font-medium">
                              {service.claims}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg per Claim:</span>
                            <span className="font-medium">
                              ${(service.revenue / service.claims).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crossModuleKPIs.map((kpi) => (
              <Card key={kpi.id} className={`${getStatusColor(kpi.status)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getKPIIcon(kpi.category)}
                      <span className="ml-2 text-base">{kpi.name}</span>
                    </div>
                    <Badge variant="outline">{kpi.category}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date(kpi.lastUpdated).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {kpi.value}
                          {kpi.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Target: {kpi.target}
                          {kpi.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm mb-1">
                          {kpi.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : kpi.trend === "down" ? (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          ) : (
                            <div className="h-4 w-4 bg-gray-300 rounded-full mr-1" />
                          )}
                          <span
                            className={
                              kpi.trend === "up"
                                ? "text-green-600"
                                : kpi.trend === "down"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }
                          >
                            {kpi.change > 0 ? "+" : ""}
                            {kpi.change}
                            {kpi.unit}
                          </span>
                        </div>
                        <Badge className={getStatusColor(kpi.status)}>
                          {kpi.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.round((kpi.value / kpi.target) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(kpi.value / kpi.target) * 100}
                        className="h-3"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Real-Time Metrics Tab */}
        <TabsContent value="realtime" className="mt-6">
          {/* Accounts Receivable Aging */}
          {agingData && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Accounts Receivable Aging Analysis
                  </CardTitle>
                  <CardDescription>
                    Total Outstanding: $
                    {agingData.totalOutstanding?.toLocaleString() || "0"} • Avg
                    Days: {agingData.averageDaysOutstanding?.toFixed(0) || "0"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {agingData.buckets?.map((bucket: any, index: number) => (
                      <div
                        key={index}
                        className="text-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          {bucket.ageRange} Days
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          ${bucket.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bucket.count} claims • {bucket.percentage.toFixed(1)}
                          %
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Denial Analytics */}
          {denialData && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Denial Analysis Dashboard
                  </CardTitle>
                  <CardDescription>
                    Total Denials: {denialData.totalDenials} • Amount: $
                    {denialData.totalDeniedAmount?.toLocaleString() || "0"} •
                    Appeal Success:{" "}
                    {denialData.appealSuccessRate?.toFixed(1) || "0"}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Top Denial Reasons</h4>
                      <div className="space-y-2">
                        {denialData.topDenialReasons
                          ?.slice(0, 5)
                          .map((reason: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-red-50 rounded"
                            >
                              <div>
                                <div className="font-medium text-red-900">
                                  {reason.reason}
                                </div>
                                <div className="text-sm text-red-600">
                                  {reason.count} cases •{" "}
                                  {reason.percentage.toFixed(1)}%
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-900">
                                  ${reason.amount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Payer Denial Rates</h4>
                      <div className="space-y-2">
                        {denialData.payerDenialRates
                          ?.slice(0, 5)
                          .map((payer: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-orange-50 rounded"
                            >
                              <div>
                                <div className="font-medium text-orange-900">
                                  {payer.payerName}
                                </div>
                                <div className="text-sm text-orange-600">
                                  {payer.deniedClaims} of {payer.totalClaims}{" "}
                                  claims
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-orange-900">
                                  {payer.denialRate.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {realTimeMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.name}</span>
                    <div
                      className={`h-3 w-3 rounded-full ${
                        metric.status === "normal"
                          ? "bg-green-500"
                          : metric.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                  </CardTitle>
                  <CardDescription>{metric.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${getMetricStatusColor(metric.status)}`}
                      >
                        {metric.value}
                        {metric.unit}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Status: {metric.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Warning Threshold</span>
                        <span>
                          {metric.threshold.warning}
                          {metric.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Critical Threshold</span>
                        <span>
                          {metric.threshold.critical}
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            metric.status === "normal"
                              ? "bg-green-500"
                              : metric.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (metric.value / metric.threshold.critical) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="predictive" className="mt-6">
          {/* Revenue Forecasting */}
          {forecastData && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Revenue Forecasting - {forecastData.forecastPeriod}
                  </CardTitle>
                  <CardDescription>
                    Projected Revenue: $
                    {forecastData.projectedRevenue?.toLocaleString() || "0"} •
                    Confidence Range: $
                    {forecastData.confidenceInterval?.lower?.toLocaleString() ||
                      "0"}{" "}
                    - $
                    {forecastData.confidenceInterval?.upper?.toLocaleString() ||
                      "0"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Key Forecast Drivers</h4>
                      <div className="space-y-2">
                        {forecastData.keyDrivers?.map(
                          (driver: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded"
                            >
                              <div>
                                <div className="font-medium text-blue-900">
                                  {driver.driver}
                                </div>
                                <div className="text-sm text-blue-600">
                                  {(driver.confidence * 100).toFixed(0)}%
                                  confidence
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-bold ${
                                    driver.impact > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {driver.impact > 0 ? "+" : ""}
                                  {(driver.impact * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Forecast Scenarios</h4>
                      <div className="space-y-2">
                        {forecastData.scenarios?.map(
                          (scenario: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium">
                                  {scenario.scenario}
                                </div>
                                <Badge variant="outline">
                                  {(scenario.probability * 100).toFixed(0)}%
                                  probability
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {scenario.description}
                              </div>
                              <div className="font-bold text-lg">
                                ${scenario.projectedRevenue.toLocaleString()}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-6">
            {predictiveInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getInsightIcon(insight.type)}
                      <span className="ml-2">{insight.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                      <Badge
                        variant={
                          insight.impact === "high"
                            ? "destructive"
                            : insight.impact === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {insight.timeframe} •{" "}
                    {insight.type.charAt(0).toUpperCase() +
                      insight.type.slice(1)}{" "}
                    Analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{insight.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Current</div>
                        <div className="text-xl font-bold">
                          {insight.data.current.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Predicted</div>
                        <div className="text-xl font-bold text-blue-600">
                          {insight.data.predicted.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Variance</div>
                        <div className="text-xl font-bold text-orange-600">
                          ±{insight.data.variance.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="font-medium text-blue-800 mb-1">
                        Recommendation
                      </div>
                      <p className="text-blue-700">{insight.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Cross-Dashboard Integration */}
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 shadow-lg border-2 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Dashboard Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Sync Status:</span>
                  <Badge
                    variant={isOnline ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {isOnline ? "Live" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Auto Refresh:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`h-6 px-2 text-xs ${autoRefresh ? "text-green-600" : "text-gray-400"}`}
                  >
                    {autoRefresh ? "ON" : "OFF"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Facility:</span>
                  <Badge variant="outline" className="text-xs">
                    {facilityId}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Role:</span>
                  <Badge variant="secondary" className="text-xs">
                    {userRole}
                  </Badge>
                </div>
                <Button
                  onClick={refreshData}
                  disabled={loading || isSyncing}
                  size="sm"
                  className="w-full"
                >
                  {loading || isSyncing ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Refresh All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Automated Testing Tab */}
        <TabsContent value="testing" className="mt-6">
          <div className="space-y-6">
            {/* Test Execution Control Panel */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                  Comprehensive Automated Testing Suite
                </CardTitle>
                <CardDescription>
                  Execute comprehensive test suites including unit, integration,
                  e2e, performance, and load testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Button
                    onClick={async () => {
                      setTestExecutionStatus({
                        isRunning: true,
                        currentTest: "All Tests",
                        progress: 0,
                      });
                      try {
                        const report = await fetch(
                          "/api/quality-management/testing/run-all",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              environment: "staging",
                              branch: "main",
                            }),
                          },
                        ).then((res) => res.json());
                        console.log("Test execution completed:", report);
                      } catch (error) {
                        console.error("Test execution failed:", error);
                      } finally {
                        setTestExecutionStatus({ isRunning: false });
                      }
                    }}
                    disabled={testExecutionStatus.isRunning}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    {testExecutionStatus.isRunning ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <RefreshCw className="h-6 w-6 mb-1" />
                    )}
                    <span className="text-xs">Run All Tests</span>
                  </Button>

                  <Button
                    onClick={async () => {
                      setTestExecutionStatus({
                        isRunning: true,
                        currentTest: "Load Test",
                        progress: 0,
                      });
                      try {
                        const result = await triggerLoadTest({
                          maxUsers: 1000,
                          duration: 1800,
                          rampUpTime: 300,
                          testScenario: "comprehensive",
                        });
                        const testResults = await getLoadTestResults(
                          result.testId,
                        );
                        setLoadTestResults(testResults);
                      } catch (error) {
                        console.error("Load test failed:", error);
                      } finally {
                        setTestExecutionStatus({ isRunning: false });
                      }
                    }}
                    disabled={testExecutionStatus.isRunning}
                    className="h-20 flex flex-col items-center justify-center"
                    variant="outline"
                  >
                    {testExecutionStatus.isRunning &&
                    testExecutionStatus.currentTest === "Load Test" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Zap className="h-6 w-6 mb-1" />
                    )}
                    <span className="text-xs">Load Test</span>
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const benchmarks = await getPerformanceBenchmarks();
                        setPerformanceBenchmarks(benchmarks);
                      } catch (error) {
                        console.error("Failed to fetch benchmarks:", error);
                      }
                    }}
                    className="h-20 flex flex-col items-center justify-center"
                    variant="outline"
                  >
                    <Gauge className="h-6 w-6 mb-1" />
                    <span className="text-xs">Benchmarks</span>
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const metrics = await getPerformanceTestMetrics();
                        console.log("Performance metrics:", metrics);
                      } catch (error) {
                        console.error(
                          "Failed to fetch performance metrics:",
                          error,
                        );
                      }
                    }}
                    className="h-20 flex flex-col items-center justify-center"
                    variant="outline"
                  >
                    <BarChart3 className="h-6 w-6 mb-1" />
                    <span className="text-xs">Test Metrics</span>
                  </Button>
                </div>

                {/* Test Execution Status */}
                {testExecutionStatus.isRunning && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">
                          Executing: {testExecutionStatus.currentTest}
                        </span>
                        <LoadingSpinner size="sm" />
                      </div>
                      {testExecutionStatus.progress !== undefined && (
                        <ProgressBar
                          progress={testExecutionStatus.progress}
                          color="blue"
                          size="sm"
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Load Test Results */}
            {loadTestResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Load Test Results
                  </CardTitle>
                  <CardDescription>
                    Test ID: {loadTestResults.testId} | Status:{" "}
                    {loadTestResults.status}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded border">
                      <div className="text-2xl font-bold text-green-900">
                        {loadTestResults.results?.requestsPerSecond?.toLocaleString() ||
                          "N/A"}
                      </div>
                      <div className="text-sm text-green-600">
                        Requests/Second
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border">
                      <div className="text-2xl font-bold text-blue-900">
                        {loadTestResults.results?.averageResponseTime || "N/A"}
                        ms
                      </div>
                      <div className="text-sm text-blue-600">
                        Avg Response Time
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border">
                      <div className="text-2xl font-bold text-purple-900">
                        {(
                          (loadTestResults.results?.errorRate || 0) * 100
                        ).toFixed(2)}
                        %
                      </div>
                      <div className="text-sm text-purple-600">Error Rate</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded border">
                      <div className="text-2xl font-bold text-orange-900">
                        {loadTestResults.results?.totalRequests?.toLocaleString() ||
                          "N/A"}
                      </div>
                      <div className="text-sm text-orange-600">
                        Total Requests
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Benchmarks */}
            {performanceBenchmarks && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gauge className="h-5 w-5 mr-2" />
                    Performance Benchmarks
                  </CardTitle>
                  <CardDescription>
                    Current performance vs targets and industry standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Current vs Target</h4>
                      <div className="space-y-3">
                        {Object.entries(
                          performanceBenchmarks.currentBenchmarks || {},
                        ).map(([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded"
                          >
                            <div>
                              <div className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                              </div>
                              <div className="text-sm text-gray-500">
                                Target: {value.target} | Current:{" "}
                                {value.current}
                              </div>
                            </div>
                            <Badge
                              variant={
                                value.trend === "improving"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {value.trend}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Performance Score</h4>
                      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {performanceBenchmarks.performanceScore}/100
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Performance Score
                        </div>
                        <ProgressBar
                          progress={performanceBenchmarks.performanceScore}
                          color="green"
                          className="mt-3"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Unified Analytics Summary */}
        {activeTab === "overview" && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-blue-600" />
                  Unified Analytics Summary
                </CardTitle>
                <CardDescription>
                  Cross-dashboard insights and integrated analytics from all
                  modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <Badge variant="outline">Business</Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      94.2%
                    </div>
                    <div className="text-sm text-gray-600">
                      Executive KPI Score
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      +2.1% vs last month
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      <Badge variant="outline">Clinical</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      96.8%
                    </div>
                    <div className="text-sm text-gray-600">
                      Patient Safety Score
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      +1.5% vs last month
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <Badge variant="outline">Operations</Badge>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      88.5%
                    </div>
                    <div className="text-sm text-gray-600">
                      Efficiency Index
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      +3.2% vs last month
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Monitor className="h-5 w-5 text-purple-600" />
                      <Badge variant="outline">Performance</Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      99.1%
                    </div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                    <div className="text-xs text-green-600 mt-1">
                      +0.3% vs last month
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Cross-Module Alerts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm">
                            Clinical workflow optimization needed
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Medium
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm">
                            Revenue targets exceeded this quarter
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Info
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("business")}
                        className="justify-start"
                      >
                        <Building className="h-3 w-3 mr-1" />
                        Business View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("clinical")}
                        className="justify-start"
                      >
                        <Stethoscope className="h-3 w-3 mr-1" />
                        Clinical View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("operational")}
                        className="justify-start"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Operations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("performance")}
                        className="justify-start"
                      >
                        <Monitor className="h-3 w-3 mr-1" />
                        Performance
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Optimization Tab */}
        <TabsContent value="optimization" className="mt-6">
          {/* Process Optimization Recommendations */}
          {processOptimizations.length > 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Process Optimization Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations to improve operational efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processOptimizations.slice(0, 5).map((rec, index) => (
                      <div
                        key={rec.id}
                        className="border-l-4 border-blue-200 pl-4 bg-blue-50 p-4 rounded-r-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-1">
                              {rec.processName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Current efficiency:{" "}
                              {rec.currentPerformance.efficiency.toFixed(1)}%
                            </p>
                            <div className="space-y-2">
                              {rec.recommendedChanges
                                .slice(0, 2)
                                .map((change: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-3 rounded border"
                                  >
                                    <p className="text-sm font-medium text-gray-800">
                                      {change.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                      <span>ROI: {change.estimatedROI}%</span>
                                      <span>
                                        Time Reduction:{" "}
                                        {change.expectedImpact.timeReduction}%
                                      </span>
                                      <Badge
                                        variant={
                                          change.priority === "critical"
                                            ? "destructive"
                                            : change.priority === "high"
                                              ? "default"
                                              : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {change.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-green-600">
                              {rec.confidence.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Confidence
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Process Metrics */}
          {processMetrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processMetrics.slice(0, 4).map((process, index) => (
                <Card key={process.processId}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {process.processName}
                    </CardTitle>
                    <CardDescription>
                      {process.category} process metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Throughput
                        </span>
                        <span className="font-medium">
                          {process.metrics.throughput}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Cycle Time
                        </span>
                        <span className="font-medium">
                          {process.metrics.cycleTime}min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Error Rate
                        </span>
                        <span
                          className={`font-medium ${
                            process.metrics.errorRate > 0.05
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {(process.metrics.errorRate * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Resource Utilization
                        </span>
                        <span className="font-medium">
                          {(process.metrics.resourceUtilization * 100).toFixed(
                            1,
                          )}
                          %
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-1">
                          vs Industry Benchmark
                        </div>
                        <Progress
                          value={
                            (process.metrics.throughput /
                              process.benchmarks.industry.throughput) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enhanced Compliance Monitoring Tab */}
        <TabsContent value="compliance" className="mt-6">
          {complianceData && (
            <div className="space-y-6">
              {/* AI-Powered Compliance Predictions */}
              {compliancePredictions.length > 0 && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      AI-Powered Compliance Predictions
                    </CardTitle>
                    <CardDescription>
                      Machine learning insights for proactive compliance
                      management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {compliancePredictions
                        .slice(0, 4)
                        .map((prediction, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white rounded-lg border border-purple-100"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-purple-900 capitalize">
                                {prediction.complianceType} Compliance
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-purple-600"
                              >
                                {Math.round(prediction.confidence * 100)}%
                                confidence
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Current:</span>
                                <span className="font-medium">
                                  {prediction.currentScore}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Predicted:</span>
                                <span
                                  className={`font-medium ${
                                    prediction.predictedScore >
                                    prediction.currentScore
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {prediction.predictedScore}%
                                </span>
                              </div>
                              <Progress
                                value={prediction.predictedScore}
                                className="h-2"
                              />
                              <div className="text-xs text-gray-500">
                                {prediction.predictionPeriod} forecast
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights Panel */}
              {complianceData.aiInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      AI-Powered Compliance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Key Insights</h4>
                        <div className="space-y-3">
                          {complianceData.aiInsights.insights
                            ?.slice(0, 3)
                            .map((insight: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 bg-blue-50 rounded border-l-4 border-blue-400"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-blue-900">
                                      {insight.type
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </div>
                                    <div className="text-sm text-blue-700 mt-1">
                                      {insight.insight}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(insight.confidence * 100)}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">AI Recommendations</h4>
                        <div className="space-y-3">
                          {complianceData.aiInsights.recommendations
                            ?.slice(0, 3)
                            .map((rec: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 bg-green-50 rounded border-l-4 border-green-400"
                              >
                                <div className="text-sm font-medium text-green-900">
                                  {rec.title}
                                </div>
                                <div className="text-sm text-green-700 mt-1">
                                  {rec.description}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    AI Generated
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(rec.confidence * 100)}%
                                    confidence
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Overall Compliance
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {complianceData.overallScore}%
                        </p>
                      </div>
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          DOH Compliance
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {complianceData.dohCompliance.score}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          Daman Compliance
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {complianceData.damanCompliance.score}%
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`bg-gradient-to-r ${
                    complianceData.riskAssessment.riskLevel === "low"
                      ? "from-green-50 to-green-100 border-green-200"
                      : complianceData.riskAssessment.riskLevel === "medium"
                        ? "from-yellow-50 to-yellow-100 border-yellow-200"
                        : complianceData.riskAssessment.riskLevel === "high"
                          ? "from-orange-50 to-orange-100 border-orange-200"
                          : "from-red-50 to-red-100 border-red-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            complianceData.riskAssessment.riskLevel === "low"
                              ? "text-green-600"
                              : complianceData.riskAssessment.riskLevel ===
                                  "medium"
                                ? "text-yellow-600"
                                : complianceData.riskAssessment.riskLevel ===
                                    "high"
                                  ? "text-orange-600"
                                  : "text-red-600"
                          }`}
                        >
                          Risk Level
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            complianceData.riskAssessment.riskLevel === "low"
                              ? "text-green-900"
                              : complianceData.riskAssessment.riskLevel ===
                                  "medium"
                                ? "text-yellow-900"
                                : complianceData.riskAssessment.riskLevel ===
                                    "high"
                                  ? "text-orange-900"
                                  : "text-red-900"
                          }`}
                        >
                          {complianceData.riskAssessment.riskLevel.toUpperCase()}
                        </p>
                      </div>
                      <AlertTriangle
                        className={`h-8 w-8 ${
                          complianceData.riskAssessment.riskLevel === "low"
                            ? "text-green-600"
                            : complianceData.riskAssessment.riskLevel ===
                                "medium"
                              ? "text-yellow-600"
                              : complianceData.riskAssessment.riskLevel ===
                                  "high"
                                ? "text-orange-600"
                                : "text-red-600"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Compliance Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Compliance Standards Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <div>
                          <div className="font-medium text-blue-900">
                            DOH Standards
                          </div>
                          <div className="text-sm text-blue-600">
                            Next Audit:{" "}
                            {new Date(
                              complianceData.dohCompliance.nextAudit,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-900">
                            {complianceData.dohCompliance.score}%
                          </div>
                          <Progress
                            value={complianceData.dohCompliance.score}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                        <div>
                          <div className="font-medium text-purple-900">
                            Daman Integration
                          </div>
                          <div className="text-sm text-purple-600">
                            Avg Processing:{" "}
                            {
                              complianceData.damanCompliance
                                .averageProcessingTime
                            }{" "}
                            days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-900">
                            {complianceData.damanCompliance.approvalRate}%
                          </div>
                          <Progress
                            value={complianceData.damanCompliance.approvalRate}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <div>
                          <div className="font-medium text-green-900">
                            JAWDA KPIs
                          </div>
                          <div className="text-sm text-green-600">
                            {complianceData.jawdaCompliance.kpisMet} of{" "}
                            {complianceData.jawdaCompliance.totalKpis} KPIs met
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-900">
                            {complianceData.jawdaCompliance.score}%
                          </div>
                          <Progress
                            value={complianceData.jawdaCompliance.score}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                        <div>
                          <div className="font-medium text-orange-900">
                            ADHICS Standards
                          </div>
                          <div className="text-sm text-orange-600">
                            Status:{" "}
                            {
                              complianceData.adhicsCompliance
                                .certificationStatus
                            }
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-900">
                            {complianceData.adhicsCompliance.score}%
                          </div>
                          <Progress
                            value={complianceData.adhicsCompliance.score}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Risk Assessment & Mitigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complianceData.riskAssessment.riskFactors
                        .slice(0, 5)
                        .map((risk: any, index: number) => (
                          <div
                            key={index}
                            className="border-l-4 border-orange-200 pl-4 bg-orange-50 p-3 rounded-r"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-orange-900">
                                  {risk.factor}
                                </div>
                                <div className="text-sm text-orange-600 mt-1">
                                  Category: {risk.category} • Impact:{" "}
                                  {(risk.impact * 100).toFixed(0)}%
                                </div>
                              </div>
                              <Badge
                                variant={
                                  risk.severity === "critical"
                                    ? "destructive"
                                    : risk.severity === "high"
                                      ? "default"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {risk.severity}
                              </Badge>
                            </div>
                          </div>
                        ))}

                      {complianceData.riskAssessment.mitigationActions.length >
                        0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border">
                          <div className="font-medium text-blue-900 mb-2">
                            Active Mitigation Actions
                          </div>
                          <div className="text-sm text-blue-700">
                            {
                              complianceData.riskAssessment.mitigationActions
                                .length
                            }{" "}
                            actions in progress
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Improvement Areas */}
              {complianceData.jawdaCompliance.improvementAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Priority Improvement Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {complianceData.jawdaCompliance.improvementAreas.map(
                        (area: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-yellow-50 rounded border border-yellow-200"
                          >
                            <div className="font-medium text-yellow-900">
                              {area}
                            </div>
                            <div className="text-sm text-yellow-600 mt-1">
                              Requires attention for compliance improvement
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Mobile Optimization Tab */}
        <TabsContent value="mobile" className="mt-6">
          <div className="space-y-6">
            {/* Mobile Field Compliance Checks */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Mobile Field Compliance Checks
                </CardTitle>
                <CardDescription>
                  Real-time compliance validation optimized for mobile field
                  workers with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900">
                        Real-Time Validation
                      </h4>
                      <Badge variant="outline" className="text-blue-600">
                        {mobileFieldData?.realTimeValidation?.offlineCapable
                          ? "Enhanced"
                          : "Active"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Forms Validated:</span>
                        <span className="font-medium">
                          {mobileFieldData?.realTimeValidation
                            ?.formsValidated || 247}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Rate:</span>
                        <span className="font-medium text-green-600">
                          {mobileFieldData?.realTimeValidation
                            ?.complianceRate || 96.8}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Validation Time:</span>
                        <span className="font-medium">
                          {mobileFieldData?.realTimeValidation
                            ?.averageValidationTime || 2.3}
                          s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Offline Capable:</span>
                        <span className="font-medium text-green-600">
                          {mobileFieldData?.realTimeValidation?.offlineCapable
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900">Voice Input</h4>
                      <Badge variant="outline" className="text-blue-600">
                        AI-Enhanced
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Medical Terms:</span>
                        <span className="font-medium">
                          {mobileFieldData?.voiceInputMetrics?.medicalTermsSupported?.toLocaleString() ||
                            "15,000+"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium text-green-600">
                          {mobileFieldData?.voiceInputMetrics?.accuracy || 98.2}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Languages:</span>
                        <span className="font-medium">
                          {mobileFieldData?.voiceInputMetrics?.languagesSupported?.join(
                            ", ",
                          ) || "EN, AR"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing:</span>
                        <span className="font-medium text-blue-600">
                          {mobileFieldData?.voiceInputMetrics
                            ?.processingSpeed || "Real-time"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900">
                        Camera Integration
                      </h4>
                      <Badge variant="outline" className="text-blue-600">
                        AI-Powered
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Wound Detection:</span>
                        <span className="font-medium text-green-600">
                          {mobileFieldData?.cameraIntegration?.woundDetection
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-Classification:</span>
                        <span className="font-medium">
                          {mobileFieldData?.cameraIntegration
                            ?.autoClassification
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Captures Processed:</span>
                        <span className="font-medium">
                          {mobileFieldData?.cameraIntegration
                            ?.capturesProcessed || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>HIPAA Compliant:</span>
                        <span className="font-medium text-green-600">
                          {mobileFieldData?.cameraIntegration?.hipaaCompliant
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI-Powered Risk Predictions for Mobile */}
            {aiRiskPredictions && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    AI-Powered Mobile Risk Predictions
                  </CardTitle>
                  <CardDescription>
                    Machine learning predictions for mobile field operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiRiskPredictions.riskPredictions
                      ?.slice(0, 3)
                      .map((prediction: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg border border-purple-100"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-purple-900 capitalize">
                              {prediction.type} Risk
                            </h4>
                            <Badge
                              variant={
                                prediction.trend === "increasing"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {prediction.trend}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Current Score:</span>
                              <span className="font-medium">
                                {prediction.currentScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Predicted Score:</span>
                              <span
                                className={`font-medium ${
                                  prediction.trend === "increasing"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {prediction.predictedScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Confidence:</span>
                              <span className="font-medium text-blue-600">
                                {Math.round(prediction.confidence * 100)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Timeframe:</span>
                              <span className="font-medium">
                                {prediction.timeframe}
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={prediction.predictedScore}
                            className="mt-3 h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mobile Dashboard Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Mobile-Optimized Analytics
                </CardTitle>
                <CardDescription>
                  Responsive dashboards and reports optimized for mobile devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={async () => {
                      try {
                        const mobileConfig = {
                          reportId: `mobile_compliance_${Date.now()}`,
                          name: "Mobile Compliance Dashboard",
                          mobileLayout: {
                            orientation: "portrait" as const,
                            breakpoints: {
                              small: 320,
                              medium: 768,
                              large: 1024,
                            },
                            components: [
                              {
                                id: "compliance_kpi",
                                type: "kpi" as const,
                                position: {
                                  x: 0,
                                  y: 0,
                                  width: 100,
                                  height: 150,
                                },
                                mobileSpecific: {
                                  swipeEnabled: true,
                                  pinchZoom: false,
                                  voiceInput: true,
                                  cameraIntegration: true,
                                },
                              },
                            ],
                          },
                          offlineCapability: true,
                          touchOptimized: true,
                          voiceEnabled: true,
                        };
                        await createMobileOptimizedReport(mobileConfig);
                        const mobileReport = await generateMobileReport(
                          mobileConfig.reportId,
                          "phone",
                        );
                        setMobileOptimization(mobileReport);
                      } catch (error) {
                        console.error("Failed to create mobile report:", error);
                      }
                    }}
                  >
                    <Users className="h-8 w-8 mb-2" />
                    <span className="text-sm">Generate Mobile Dashboard</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => {
                      // Simulate voice-enabled reporting with medical terminology
                      console.log(
                        "Voice-enabled reporting with medical terminology activated",
                      );
                    }}
                  >
                    <Activity className="h-8 w-8 mb-2" />
                    <span className="text-sm">Voice-Enabled Reports</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => {
                      // Simulate offline capability with sync
                      console.log(
                        "Offline mode with intelligent sync activated",
                      );
                    }}
                  >
                    <WifiOff className="h-8 w-8 mb-2" />
                    <span className="text-sm">Offline Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Report Preview */}
            {mobileOptimization && (
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Report Preview</CardTitle>
                  <CardDescription>
                    Preview of mobile-optimized dashboard for{" "}
                    {mobileOptimization.deviceType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      Device: {mobileOptimization.deviceType} | Touch Optimized:{" "}
                      {mobileOptimization.touchOptimized ? "Yes" : "No"} |
                      Offline Capable:{" "}
                      {mobileOptimization.offlineCapable ? "Yes" : "No"} | Voice
                      Enabled: {mobileOptimization.voiceEnabled ? "Yes" : "No"}
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-center text-gray-500">
                        Mobile Dashboard Preview
                        <br />
                        <small>
                          Optimized for {mobileOptimization.deviceType} devices
                          with field compliance features
                        </small>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="mt-6">
          <div className="space-y-6">
            {/* External Regulatory Systems */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  External Regulatory System Integration
                </CardTitle>
                <CardDescription>
                  Real-time integration with DOH, Daman, JAWDA, and ADHICS
                  systems with AI-powered monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* System Health Overview */}
                {externalSystemsStatus && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {externalSystemsStatus.overallHealth?.systemsOnline ||
                            4}
                        </div>
                        <div className="text-sm text-gray-600">
                          Systems Online
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {externalSystemsStatus.overallHealth?.averageUptime?.toFixed(
                            1,
                          ) || 99.1}
                          %
                        </div>
                        <div className="text-sm text-gray-600">Avg Uptime</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {externalSystemsStatus.overallHealth?.averageResponseTime?.toFixed(
                            0,
                          ) || 208}
                          ms
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg Response
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {externalSystemsStatus.overallHealth?.totalRecordsSynced?.toLocaleString() ||
                            "2,829"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Records Synced
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      name: "DOH System",
                      type: "doh",
                      status:
                        externalSystemsStatus?.dohSystem?.status || "connected",
                      lastSync:
                        externalSystemsStatus?.dohSystem?.lastSync ||
                        "2 minutes ago",
                      records:
                        externalSystemsStatus?.dohSystem?.recordsSynced?.toLocaleString() ||
                        "1,247",
                      uptime: externalSystemsStatus?.dohSystem?.uptime || 99.8,
                      responseTime:
                        externalSystemsStatus?.dohSystem?.responseTime || 150,
                      dataQuality:
                        externalSystemsStatus?.dohSystem?.dataQuality || 96.5,
                    },
                    {
                      name: "Daman Portal",
                      type: "daman",
                      status:
                        externalSystemsStatus?.damanPortal?.status ||
                        "connected",
                      lastSync:
                        externalSystemsStatus?.damanPortal?.lastSync ||
                        "5 minutes ago",
                      records:
                        externalSystemsStatus?.damanPortal?.recordsSynced?.toLocaleString() ||
                        "892",
                      uptime:
                        externalSystemsStatus?.damanPortal?.uptime || 99.5,
                      responseTime:
                        externalSystemsStatus?.damanPortal?.responseTime || 200,
                      dataQuality:
                        externalSystemsStatus?.damanPortal?.dataQuality || 94.2,
                    },
                    {
                      name: "JAWDA Platform",
                      type: "jawda",
                      status:
                        externalSystemsStatus?.jawdaPlatform?.status ||
                        "syncing",
                      lastSync:
                        externalSystemsStatus?.jawdaPlatform?.lastSync ||
                        "In progress",
                      records:
                        externalSystemsStatus?.jawdaPlatform?.recordsSynced?.toLocaleString() ||
                        "456",
                      uptime:
                        externalSystemsStatus?.jawdaPlatform?.uptime || 98.9,
                      responseTime:
                        externalSystemsStatus?.jawdaPlatform?.responseTime ||
                        300,
                      dataQuality:
                        externalSystemsStatus?.jawdaPlatform?.dataQuality ||
                        92.8,
                    },
                    {
                      name: "ADHICS System",
                      type: "adhics",
                      status:
                        externalSystemsStatus?.adhicsSystem?.status ||
                        "connected",
                      lastSync:
                        externalSystemsStatus?.adhicsSystem?.lastSync ||
                        "1 hour ago",
                      records:
                        externalSystemsStatus?.adhicsSystem?.recordsSynced?.toLocaleString() ||
                        "234",
                      uptime:
                        externalSystemsStatus?.adhicsSystem?.uptime || 99.2,
                      responseTime:
                        externalSystemsStatus?.adhicsSystem?.responseTime ||
                        180,
                      dataQuality:
                        externalSystemsStatus?.adhicsSystem?.dataQuality ||
                        95.1,
                    },
                  ].map((system, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{system.name}</h4>
                        <Badge
                          variant={
                            system.status === "connected"
                              ? "default"
                              : system.status === "syncing"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {system.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {system.status === "connected"
                          ? "Real-time data sync active"
                          : system.status === "syncing"
                            ? "Synchronizing data..."
                            : "Connection error - needs attention"}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        <div>Last Sync: {system.lastSync}</div>
                        <div>Records: {system.records}</div>
                        <div>Uptime: {system.uptime}%</div>
                        <div>Response: {system.responseTime}ms</div>
                        <div>Data Quality: {system.dataQuality}%</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={system.status === "syncing"}
                        onClick={async () => {
                          if (system.status === "connected") {
                            try {
                              await syncRegulatoryData(`${system.type}_system`);
                              console.log(`Synced data for ${system.name}`);
                            } catch (error) {
                              console.error(
                                `Sync failed for ${system.name}:`,
                                error,
                              );
                            }
                          } else {
                            try {
                              const integrationConfig = {
                                systemId: `${system.type}_system`,
                                name: system.name,
                                type: system.type as any,
                                apiEndpoint: `https://api.${system.type}.gov.ae`,
                                authenticationMethod: "oauth" as const,
                                dataSync: {
                                  frequency: "real_time" as const,
                                  lastSync: new Date().toISOString(),
                                  nextSync: new Date(
                                    Date.now() + 60 * 1000,
                                  ).toISOString(),
                                  status: "active" as const,
                                },
                                complianceMapping: [
                                  {
                                    localField: "compliance_score",
                                    externalField: "score",
                                    transformation: "percentage",
                                    validationRules: ["range_0_100"],
                                    required: true,
                                  },
                                ],
                              };
                              await integrateRegulatorySystem(
                                integrationConfig,
                              );
                              console.log(`Integrated ${system.name}`);
                            } catch (error) {
                              console.error(
                                `Integration failed for ${system.name}:`,
                                error,
                              );
                            }
                          }
                        }}
                      >
                        {system.status === "connected"
                          ? "Sync Now"
                          : system.status === "syncing"
                            ? "Syncing..."
                            : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Data Visualizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Advanced Data Visualizations & Dashboards
                </CardTitle>
                <CardDescription>
                  Interactive dashboards with AI-powered insights, real-time
                  analytics, and mobile optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Visualization Performance Metrics */}
                {advancedVizMetrics && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {advancedVizMetrics.interactiveDashboards?.length ||
                            0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Active Dashboards
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {advancedVizMetrics.mobileOptimization?.mobileViews ||
                            0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Mobile Views
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {advancedVizMetrics.mobileOptimization?.mobilePerformance?.toFixed(
                            1,
                          ) || 95.2}
                        </div>
                        <div className="text-sm text-gray-600">
                          Mobile Performance
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {advancedVizMetrics.aiInsights?.reduce(
                            (sum: number, insight: any) =>
                              sum + (insight.insightsGenerated || 0),
                            0,
                          ) || 0}
                        </div>
                        <div className="text-sm text-gray-600">AI Insights</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "AI-Enhanced Compliance Heatmap",
                      type: "heatmap",
                      description:
                        "Visual compliance status with predictive risk indicators",
                      aiFeatures: [
                        "Anomaly Detection",
                        "Risk Prediction",
                        "Trend Analysis",
                      ],
                    },
                    {
                      name: "Interactive Revenue Network",
                      type: "network_graph",
                      description:
                        "Dynamic revenue flow with payer relationship insights",
                      aiFeatures: [
                        "Pattern Recognition",
                        "Optimization Suggestions",
                        "Forecasting",
                      ],
                    },
                    {
                      name: "3D Compliance Timeline",
                      type: "timeline",
                      description:
                        "Immersive timeline with predictive milestones",
                      aiFeatures: [
                        "Predictive Events",
                        "Impact Analysis",
                        "Smart Alerts",
                      ],
                    },
                  ].map((viz, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{viz.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          AI-Powered
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {viz.description}
                      </p>
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">
                          AI Features:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {viz.aiFeatures.map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            const vizConfig = {
                              id: `viz_${viz.type}_${Date.now()}`,
                              name: viz.name,
                              type: viz.type as any,
                              dataSource: [
                                "compliance_monitoring",
                                "revenue_analytics",
                                "real_time_analytics",
                              ],
                              interactivity: {
                                drillDown: true,
                                filtering: true,
                                realTimeUpdates: true,
                                exportOptions: [
                                  "pdf",
                                  "png",
                                  "svg",
                                  "interactive",
                                ],
                              },
                              aiInsights: {
                                enabled: true,
                                anomalyDetection: true,
                                trendAnalysis: true,
                                predictiveOverlay: true,
                              },
                              mobileOptimized: true,
                            };
                            await createAdvancedVisualization(vizConfig);
                            const vizData =
                              await generateAdvancedVisualizationData(
                                vizConfig.id,
                              );
                            setAdvancedVisualizations((prev) => [
                              ...prev,
                              vizData,
                            ]);
                          } catch (error) {
                            console.error(
                              `Failed to create ${viz.name}:`,
                              error,
                            );
                          }
                        }}
                      >
                        Generate AI Visualization
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Visualizations */}
            {advancedVisualizations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated Advanced Visualizations</span>
                    <Badge variant="outline">
                      {advancedVisualizations.length} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {advancedVisualizations.map((viz, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {viz.type.replace("_", " ").toUpperCase()}
                          </h4>
                          <div className="flex gap-1">
                            <Badge variant="outline">Interactive</Badge>
                            <Badge variant="secondary">AI-Enhanced</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Generated:{" "}
                          {new Date(viz.generatedAt).toLocaleString()}
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded text-center border">
                          <div className="text-gray-700 font-medium mb-2">
                            {viz.type.replace("_", " ").toUpperCase()}{" "}
                            Visualization
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            AI-Enhanced with Real-time Updates
                          </div>
                          <div className="flex justify-center gap-2 text-xs">
                            <Badge variant="outline">Mobile Optimized</Badge>
                            <Badge variant="outline">Exportable</Badge>
                            <Badge variant="outline">Real-time</Badge>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Advanced Reporting Tab */}
        <TabsContent value="reporting" className="mt-6">
          <div className="space-y-6">
            {/* Report Generation Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Quick Report Generation
                  </CardTitle>
                  <CardDescription>
                    Generate compliance and operational reports instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={async () => {
                          try {
                            const report = await generateComplianceReport(
                              "comprehensive",
                              {
                                dateFrom: new Date(
                                  Date.now() - 30 * 24 * 60 * 60 * 1000,
                                ).toISOString(),
                                dateTo: new Date().toISOString(),
                                includeRecommendations: true,
                                includeActionPlan: true,
                              },
                            );
                            setComplianceReports((prev) => [report, ...prev]);
                          } catch (error) {
                            console.error(
                              "Failed to generate compliance report:",
                              error,
                            );
                          }
                        }}
                      >
                        <Shield className="h-6 w-6 mb-1" />
                        <span className="text-xs">Compliance Report</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={async () => {
                          try {
                            const report = await generateComplianceReport(
                              "doh",
                              {
                                dateFrom: new Date(
                                  Date.now() - 90 * 24 * 60 * 60 * 1000,
                                ).toISOString(),
                                dateTo: new Date().toISOString(),
                                includeRecommendations: true,
                              },
                            );
                            setComplianceReports((prev) => [report, ...prev]);
                          } catch (error) {
                            console.error(
                              "Failed to generate DOH report:",
                              error,
                            );
                          }
                        }}
                      >
                        <CheckCircle className="h-6 w-6 mb-1" />
                        <span className="text-xs">DOH Audit Report</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={async () => {
                          try {
                            const reportConfig = {
                              reportId: `revenue_report_${Date.now()}`,
                              name: "Monthly Revenue Analysis",
                              type: "financial" as const,
                              format: "dashboard" as const,
                              schedule: {
                                frequency: "monthly" as const,
                                enabled: false,
                              },
                              parameters: {
                                dateRange: {
                                  type: "relative" as const,
                                  relativePeriod: "last_30_days",
                                },
                                filters: {},
                                groupBy: ["payer", "service_line"],
                                metrics: [
                                  "sum_revenue",
                                  "avg_collection_rate",
                                  "count_claims",
                                ],
                                comparisons: [],
                              },
                              dataSource: [
                                "revenue_analytics",
                                "accounts_receivable",
                              ],
                              visualizations: [],
                              recipients: [],
                            };

                            const reportId =
                              await createAdvancedReport(reportConfig);
                            const generatedReport =
                              await generateAdvancedReport(reportId);
                            setAdvancedReports((prev) => [
                              generatedReport,
                              ...prev,
                            ]);
                          } catch (error) {
                            console.error(
                              "Failed to generate revenue report:",
                              error,
                            );
                          }
                        }}
                      >
                        <DollarSign className="h-6 w-6 mb-1" />
                        <span className="text-xs">Revenue Report</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={async () => {
                          try {
                            const reportConfig = {
                              reportId: `operational_report_${Date.now()}`,
                              name: "Operational Performance Dashboard",
                              type: "operational" as const,
                              format: "dashboard" as const,
                              schedule: {
                                frequency: "weekly" as const,
                                enabled: false,
                              },
                              parameters: {
                                dateRange: {
                                  type: "relative" as const,
                                  relativePeriod: "last_7_days",
                                },
                                filters: {},
                                groupBy: ["department", "service_type"],
                                metrics: [
                                  "avg_efficiency",
                                  "count_incidents",
                                  "sum_cost",
                                ],
                                comparisons: [],
                              },
                              dataSource: [
                                "business_processes",
                                "process_metrics",
                              ],
                              visualizations: [],
                              recipients: [],
                            };

                            const reportId =
                              await createAdvancedReport(reportConfig);
                            const generatedReport =
                              await generateAdvancedReport(reportId);
                            setAdvancedReports((prev) => [
                              generatedReport,
                              ...prev,
                            ]);
                          } catch (error) {
                            console.error(
                              "Failed to generate operational report:",
                              error,
                            );
                          }
                        }}
                      >
                        <Activity className="h-6 w-6 mb-1" />
                        <span className="text-xs">Operations Report</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Scheduled Reports
                  </CardTitle>
                  <CardDescription>
                    Automated report generation and distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium text-blue-900">
                          Daily Operations Summary
                        </div>
                        <div className="text-sm text-blue-600">
                          Next: Today 6:00 PM
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div>
                        <div className="font-medium text-green-900">
                          Weekly Compliance Review
                        </div>
                        <div className="text-sm text-green-600">
                          Next: Monday 9:00 AM
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                      <div>
                        <div className="font-medium text-purple-900">
                          Monthly Executive Dashboard
                        </div>
                        <div className="text-sm text-purple-600">
                          Next: 1st of next month
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Recent Reports
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReports.slice(0, 3).map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            {report.reportType.toUpperCase()} Compliance Report
                          </div>
                          <div className="text-sm text-gray-500">
                            Generated:{" "}
                            {new Date(report.generatedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            report.summary.overallScore >= 90
                              ? "default"
                              : report.summary.overallScore >= 70
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {report.summary.overallScore}% Score
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {advancedReports.slice(0, 2).map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-gray-500">
                            Generated:{" "}
                            {new Date(report.generatedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {report.metadata.dataPoints} data points
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {complianceReports.length === 0 &&
                    advancedReports.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No reports generated yet</p>
                        <p className="text-sm">
                          Use the quick report generation tools above to create
                          your first report
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
