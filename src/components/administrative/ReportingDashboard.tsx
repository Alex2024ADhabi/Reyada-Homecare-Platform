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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Filter,
  RefreshCw,
  Database,
  Brain,
  Shield,
  Zap,
  Target,
  Gauge,
  TrendingDown,
  Eye,
  Lock,
  Globe,
  Cpu,
  Cloud,
  Server,
} from "lucide-react";

const ReportingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("executive");
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [executiveAnalytics, setExecutiveAnalytics] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [mlModels, setMlModels] = useState<any[]>([]);
  const [dataGovernance, setDataGovernance] = useState<any>(null);
  const [dataLakeStatus, setDataLakeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Refresh every 5 minutes
    const realTimeInterval = setInterval(loadRealTimeData, 30000); // Real-time data every 30 seconds
    return () => {
      clearInterval(interval);
      clearInterval(realTimeInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load comprehensive analytics data
      const [
        reportsData,
        analyticsData,
        execAnalytics,
        mlData,
        governanceData,
        lakeStatus,
      ] = await Promise.all([
        Promise.resolve(mockReports),
        Promise.resolve(mockAnalytics),
        loadExecutiveAnalytics(),
        loadMLModelsStatus(),
        loadDataGovernanceStatus(),
        loadDataLakeStatus(),
      ]);

      setReports(reportsData);
      setAnalytics(analyticsData);
      setExecutiveAnalytics(execAnalytics);
      setMlModels(mlData);
      setDataGovernance(governanceData);
      setDataLakeStatus(lakeStatus);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const realTimeAnalytics = await loadRealTimeAnalytics();
      setRealTimeData(realTimeAnalytics);
    } catch (error) {
      console.error("Error loading real-time data:", error);
    }
  };

  const loadExecutiveAnalytics = async () => {
    // Simulate executive analytics API call
    return {
      kpis: {
        patient_satisfaction: {
          value: 4.7,
          target: 4.5,
          trend: "up",
          change: 0.2,
        },
        clinical_quality_score: {
          value: 94.2,
          target: 95.0,
          trend: "stable",
          change: 0.1,
        },
        financial_performance: {
          value: 87.5,
          target: 85.0,
          trend: "up",
          change: 2.5,
        },
        operational_efficiency: {
          value: 91.3,
          target: 90.0,
          trend: "up",
          change: 1.3,
        },
        compliance_score: {
          value: 96.8,
          target: 95.0,
          trend: "up",
          change: 1.8,
        },
        staff_utilization: {
          value: 88.4,
          target: 85.0,
          trend: "stable",
          change: 0.4,
        },
        cost_per_episode: {
          value: 2450,
          target: 2500,
          trend: "down",
          change: -50,
        },
        readmission_rate: {
          value: 3.2,
          target: 5.0,
          trend: "down",
          change: -0.8,
        },
      },
      trends: {
        patient_volume: {
          current_month: 1250,
          previous_month: 1180,
          growth_rate: 5.9,
          forecast_next_month: 1320,
        },
        revenue_trends: {
          monthly_revenue: [
            1200000, 1150000, 1300000, 1250000, 1400000, 1350000,
          ],
          year_over_year_growth: 12.5,
        },
      },
      alerts: [
        {
          id: "EXEC-001",
          severity: "high",
          category: "compliance",
          message: "DOH audit scheduled for next month",
          action_required: "Review compliance documentation",
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "EXEC-002",
          severity: "medium",
          category: "financial",
          message: "Claims processing delays affecting cash flow",
          action_required: "Review claims processing workflow",
          due_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ],
      forecasts: {
        patient_demand: {
          next_quarter: { predicted_volume: 3800, confidence: 0.85 },
          next_year: { predicted_volume: 16500, confidence: 0.78 },
        },
        revenue_forecast: {
          next_quarter: { predicted_revenue: 4200000, confidence: 0.82 },
          next_year: { predicted_revenue: 18500000, confidence: 0.75 },
        },
      },
    };
  };

  const loadRealTimeAnalytics = async () => {
    // Simulate real-time analytics API call
    return {
      current_patients: 145,
      active_sessions: 23,
      system_performance: {
        cpu_usage: 68,
        memory_usage: 72,
        response_time: 245,
        uptime: 99.8,
      },
      live_metrics: {
        patient_admissions_today: 12,
        completed_visits: 34,
        pending_authorizations: 8,
        critical_alerts: 2,
      },
      streaming_data: Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
        patient_count: 140 + Math.floor(Math.random() * 20),
        system_load: 60 + Math.floor(Math.random() * 30),
        response_time: 200 + Math.floor(Math.random() * 100),
      })),
    };
  };

  const loadMLModelsStatus = async () => {
    // Simulate ML models status API call
    return [
      {
        model_id: "patient-risk-v2.1",
        name: "Patient Risk Prediction",
        status: "deployed",
        accuracy: 0.92,
        last_trained: "2024-12-01T10:00:00Z",
        predictions_today: 156,
        avg_confidence: 0.87,
      },
      {
        model_id: "readmission-v1.8",
        name: "Readmission Prediction",
        status: "deployed",
        accuracy: 0.89,
        last_trained: "2024-11-28T14:30:00Z",
        predictions_today: 89,
        avg_confidence: 0.84,
      },
      {
        model_id: "resource-opt-v1.5",
        name: "Resource Optimization",
        status: "training",
        accuracy: 0.85,
        last_trained: "2024-11-25T09:15:00Z",
        predictions_today: 0,
        avg_confidence: 0.0,
      },
    ];
  };

  const loadDataGovernanceStatus = async () => {
    // Simulate data governance status API call
    return {
      policies: {
        total: 24,
        active: 22,
        pending_approval: 2,
        violations_today: 3,
      },
      data_quality: {
        overall_score: 94.5,
        completeness: 96.2,
        accuracy: 93.8,
        consistency: 92.1,
        validity: 95.7,
      },
      access_control: {
        total_users: 156,
        active_sessions: 23,
        failed_access_attempts: 5,
        privileged_access_reviews: 12,
      },
      compliance: {
        doh_compliance: 97.2,
        jawda_compliance: 94.8,
        gdpr_compliance: 98.5,
        hipaa_compliance: 96.3,
      },
    };
  };

  const loadDataLakeStatus = async () => {
    // Simulate data lake status API call
    return {
      storage: {
        total_size_gb: 2450,
        used_size_gb: 1876,
        growth_rate_gb_per_day: 12.5,
        estimated_full_date: "2025-08-15",
      },
      ingestion: {
        total_sources: 15,
        active_pipelines: 12,
        failed_jobs_today: 1,
        avg_ingestion_latency_minutes: 8.5,
      },
      schemas: {
        total_schemas: 45,
        patient_data: 12,
        clinical_data: 18,
        financial_data: 8,
        operational_data: 7,
      },
      performance: {
        query_response_time_ms: 245,
        throughput_queries_per_second: 125,
        cache_hit_rate: 87.3,
        availability: 99.95,
      },
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExportReport = (reportId: string) => {
    console.log("Exporting report:", reportId);
    // Implement export functionality
  };

  const handleScheduleReport = (reportId: string) => {
    console.log("Scheduling report:", reportId);
    // Implement scheduling functionality
  };

  // Mock data
  const mockReports = [
    {
      id: "RPT-001",
      name: "Monthly Clinical Summary",
      type: "Clinical",
      status: "Completed",
      lastGenerated: "2024-12-01T10:00:00Z",
      nextScheduled: "2025-01-01T10:00:00Z",
      recipients: ["clinical@reyadahomecare.ae"],
    },
    {
      id: "RPT-002",
      name: "Financial Performance Report",
      type: "Financial",
      status: "In Progress",
      lastGenerated: "2024-11-30T15:30:00Z",
      nextScheduled: "2024-12-31T15:30:00Z",
      recipients: ["finance@reyadahomecare.ae"],
    },
    {
      id: "RPT-003",
      name: "DOH Compliance Report",
      type: "Compliance",
      status: "Scheduled",
      lastGenerated: "2024-11-28T09:00:00Z",
      nextScheduled: "2024-12-28T09:00:00Z",
      recipients: ["compliance@reyadahomecare.ae"],
    },
  ];

  const mockAnalytics = {
    totalReports: 156,
    completedThisMonth: 42,
    scheduledReports: 18,
    averageGenerationTime: "3.2 minutes",
    reportTypes: [
      { name: "Clinical", value: 45, color: "#3b82f6" },
      { name: "Financial", value: 32, color: "#10b981" },
      { name: "Compliance", value: 28, color: "#f59e0b" },
      { name: "Operational", value: 51, color: "#ef4444" },
    ],
    monthlyTrends: [
      { month: "Jul", reports: 38, automated: 32 },
      { month: "Aug", reports: 42, automated: 35 },
      { month: "Sep", reports: 39, automated: 33 },
      { month: "Oct", reports: 45, automated: 38 },
      { month: "Nov", reports: 48, automated: 41 },
      { month: "Dec", reports: 42, automated: 36 },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Business Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive data management and analytics platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="ml">ML & AI</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="datalake">Data Lake</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          {/* Executive Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {executiveAnalytics?.kpis &&
              Object.entries(executiveAnalytics.kpis).map(
                ([key, kpi]: [string, any]) => (
                  <Card key={key} className="bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </CardTitle>
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : kpi.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Activity className="h-4 w-4 text-blue-600" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {typeof kpi.value === "number" && kpi.value < 10
                          ? kpi.value.toFixed(1)
                          : kpi.value.toLocaleString()}
                        {key.includes("rate") ||
                        key.includes("score") ||
                        key.includes("satisfaction")
                          ? "%"
                          : ""}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Target: {kpi.target}</span>
                        <Badge
                          variant={
                            kpi.value >= kpi.target ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {kpi.change > 0 ? "+" : ""}
                          {kpi.change}
                        </Badge>
                      </div>
                      <Progress
                        value={Math.min((kpi.value / kpi.target) * 100, 100)}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                ),
              )}
          </div>

          {/* Executive Alerts */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Executive Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executiveAnalytics?.alerts?.map((alert: any) => (
                  <Alert
                    key={alert.id}
                    className={`border-l-4 ${
                      alert.severity === "high"
                        ? "border-l-red-500 bg-red-50"
                        : alert.severity === "medium"
                          ? "border-l-amber-500 bg-amber-50"
                          : "border-l-blue-500 bg-blue-50"
                    }`}
                  >
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.action_required}
                          </p>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Patient Demand Forecast</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next Quarter</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {executiveAnalytics?.forecasts?.patient_demand?.next_quarter?.predicted_volume?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          executiveAnalytics?.forecasts?.patient_demand
                            ?.next_quarter?.confidence * 100
                        ).toFixed(0)}
                        % confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next Year</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {executiveAnalytics?.forecasts?.patient_demand?.next_year?.predicted_volume?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          executiveAnalytics?.forecasts?.patient_demand
                            ?.next_year?.confidence * 100
                        ).toFixed(0)}
                        % confidence
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Revenue Forecast</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next Quarter</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        AED{" "}
                        {(
                          executiveAnalytics?.forecasts?.revenue_forecast
                            ?.next_quarter?.predicted_revenue / 1000000
                        ).toFixed(1)}
                        M
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          executiveAnalytics?.forecasts?.revenue_forecast
                            ?.next_quarter?.confidence * 100
                        ).toFixed(0)}
                        % confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next Year</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        AED{" "}
                        {(
                          executiveAnalytics?.forecasts?.revenue_forecast
                            ?.next_year?.predicted_revenue / 1000000
                        ).toFixed(1)}
                        M
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          executiveAnalytics?.forecasts?.revenue_forecast
                            ?.next_year?.confidence * 100
                        ).toFixed(0)}
                        % confidence
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trends Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue performance and growth trajectory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={
                    executiveAnalytics?.trends?.revenue_trends?.monthly_revenue?.map(
                      (revenue: number, index: number) => ({
                        month: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                          index
                        ],
                        revenue: revenue / 1000000,
                      }),
                    ) || []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`AED ${value}M`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          {/* Real-time Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Patients
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.current_patients || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active in system
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sessions
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.active_sessions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Live connections
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Performance
                </CardTitle>
                <Gauge className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.system_performance?.uptime || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeData?.live_metrics?.critical_alerts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Streaming Data */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Live System Metrics</span>
              </CardTitle>
              <CardDescription>
                Real-time system performance and patient activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realTimeData?.streaming_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleTimeString()
                    }
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="patient_count"
                    stroke="#3b82f6"
                    name="Patient Count"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="system_load"
                    stroke="#ef4444"
                    name="System Load %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="response_time"
                    stroke="#10b981"
                    name="Response Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Performance Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={realTimeData?.system_performance?.cpu_usage || 0}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">
                    {realTimeData?.system_performance?.cpu_usage || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={realTimeData?.system_performance?.memory_usage || 0}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">
                    {realTimeData?.system_performance?.memory_usage || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {realTimeData?.system_performance?.response_time || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Today's Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Admissions</span>
                    <span className="font-medium">
                      {realTimeData?.live_metrics?.patient_admissions_today ||
                        0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed Visits</span>
                    <span className="font-medium">
                      {realTimeData?.live_metrics?.completed_visits || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Auth</span>
                    <span className="font-medium">
                      {realTimeData?.live_metrics?.pending_authorizations || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ml" className="space-y-6">
          {/* Machine Learning Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mlModels.map((model) => (
              <Card key={model.model_id} className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm">{model.name}</span>
                    <Badge
                      variant={
                        model.status === "deployed"
                          ? "default"
                          : model.status === "training"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {model.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">
                        {(model.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Predictions Today</span>
                      <span className="font-medium">
                        {model.predictions_today}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Confidence</span>
                      <span className="font-medium">
                        {(model.avg_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Trained</span>
                      <span className="font-medium">
                        {new Date(model.last_trained).toLocaleDateString()}
                      </span>
                    </div>
                    <Progress value={model.accuracy * 100} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ML Performance Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Model Performance Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={
                    mlModels.map((model) => ({
                      model: model.name.split(" ")[0],
                      accuracy: model.accuracy * 100,
                      confidence: model.avg_confidence * 100,
                      usage: (model.predictions_today / 200) * 100,
                    })) || []
                  }
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="model" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Accuracy"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Confidence"
                    dataKey="confidence"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Usage"
                    dataKey="usage"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Predictive Analytics */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <span>Predictive Analytics Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">High-Risk Patients</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">Critical Risk</span>
                      <Badge variant="destructive">12 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                      <span className="text-sm">High Risk</span>
                      <Badge variant="secondary">28 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm">Medium Risk</span>
                      <Badge variant="outline">45 patients</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">
                    Readmission Predictions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">Next 7 days</span>
                      <Badge variant="destructive">8 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                      <span className="text-sm">Next 30 days</span>
                      <Badge variant="secondary">23 patients</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm">Low Risk</span>
                      <Badge variant="outline">125 patients</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          {/* Data Governance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Policies
                </CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataGovernance?.policies?.active || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {dataGovernance?.policies?.total || 0} total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Data Quality Score
                </CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataGovernance?.data_quality?.overall_score || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Overall quality</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataGovernance?.access_control?.total_users || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dataGovernance?.access_control?.active_sessions || 0} active
                  sessions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Violations Today
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataGovernance?.policies?.violations_today || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Policy violations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Quality Metrics */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span>Data Quality Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dataGovernance?.data_quality &&
                  Object.entries(dataGovernance.data_quality)
                    .filter(([key]) => key !== "overall_score")
                    .map(([key, value]: [string, any]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {key.replace("_", " ")}
                          </span>
                          <span className="text-sm font-bold">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Scores */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>Compliance Scores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dataGovernance?.compliance &&
                  Object.entries(dataGovernance.compliance).map(
                    ([key, value]: [string, any]) => (
                      <Card key={key} className="border">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">
                              {value}%
                            </div>
                            <div className="text-sm font-medium uppercase">
                              {key.replace("_", " ")}
                            </div>
                            <Progress value={value} className="mt-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Access Control Summary */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-purple-600" />
                <span>Access Control Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">User Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Users</span>
                      <span className="font-medium">
                        {dataGovernance?.access_control?.total_users || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Sessions</span>
                      <span className="font-medium">
                        {dataGovernance?.access_control?.active_sessions || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed Attempts</span>
                      <span className="font-medium text-red-600">
                        {dataGovernance?.access_control
                          ?.failed_access_attempts || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Security Reviews</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Privileged Access Reviews</span>
                      <span className="font-medium">
                        {dataGovernance?.access_control
                          ?.privileged_access_reviews || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Approvals</span>
                      <span className="font-medium">
                        {dataGovernance?.policies?.pending_approval || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datalake" className="space-y-6">
          {/* Data Lake Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataLakeStatus?.storage?.used_size_gb || 0} GB
                </div>
                <p className="text-xs text-muted-foreground">
                  of {dataLakeStatus?.storage?.total_size_gb || 0} GB total
                </p>
                <Progress
                  value={
                    (dataLakeStatus?.storage?.used_size_gb /
                      dataLakeStatus?.storage?.total_size_gb) *
                      100 || 0
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Pipelines
                </CardTitle>
                <Cpu className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataLakeStatus?.ingestion?.active_pipelines || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {dataLakeStatus?.ingestion?.total_sources || 0} sources
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Query Performance
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataLakeStatus?.performance?.query_response_time_ms || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg response time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Availability
                </CardTitle>
                <Server className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataLakeStatus?.performance?.availability || 0}%
                </div>
                <p className="text-xs text-muted-foreground">System uptime</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Schemas Overview */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span>Data Schemas Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dataLakeStatus?.schemas &&
                  Object.entries(dataLakeStatus.schemas)
                    .filter(([key]) => key !== "total_schemas")
                    .map(([key, value]: [string, any]) => (
                      <div
                        key={key}
                        className="text-center p-4 border rounded-lg"
                      >
                        <div className="text-2xl font-bold mb-2">{value}</div>
                        <div className="text-sm font-medium capitalize">
                          {key.replace("_", " ")}
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>

          {/* Storage Growth Trend */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Storage Growth Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Current Usage</div>
                  <div className="text-2xl font-bold">
                    {dataLakeStatus?.storage?.used_size_gb || 0} GB
                  </div>
                  <Progress
                    value={
                      (dataLakeStatus?.storage?.used_size_gb /
                        dataLakeStatus?.storage?.total_size_gb) *
                        100 || 0
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Daily Growth Rate</div>
                  <div className="text-2xl font-bold">
                    {dataLakeStatus?.storage?.growth_rate_gb_per_day || 0}{" "}
                    GB/day
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average daily increase
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Estimated Full Date</div>
                  <div className="text-lg font-bold">
                    {new Date(
                      dataLakeStatus?.storage?.estimated_full_date ||
                        Date.now(),
                    ).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on current growth
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-amber-600" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Query Response Time</span>
                    <span className="font-medium">
                      {dataLakeStatus?.performance?.query_response_time_ms || 0}
                      ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Throughput</span>
                    <span className="font-medium">
                      {dataLakeStatus?.performance
                        ?.throughput_queries_per_second || 0}{" "}
                      queries/sec
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="font-medium">
                      {dataLakeStatus?.performance?.cache_hit_rate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Availability</span>
                    <span className="font-medium">
                      {dataLakeStatus?.performance?.availability || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span>Ingestion Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sources</span>
                    <span className="font-medium">
                      {dataLakeStatus?.ingestion?.total_sources || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Pipelines</span>
                    <span className="font-medium">
                      {dataLakeStatus?.ingestion?.active_pipelines || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Jobs Today</span>
                    <span className="font-medium text-red-600">
                      {dataLakeStatus?.ingestion?.failed_jobs_today || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Latency</span>
                    <span className="font-medium">
                      {dataLakeStatus?.ingestion
                        ?.avg_ingestion_latency_minutes || 0}{" "}
                      min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Reports Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalReports || 0}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.completedThisMonth || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed reports
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.scheduledReports || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upcoming reports
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Generation
                </CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.averageGenerationTime || "0 min"}
                </div>
                <p className="text-xs text-muted-foreground">Processing time</p>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Reports</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    New Report
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {report.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          report.status === "Completed"
                            ? "default"
                            : report.status === "In Progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {report.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Last:{" "}
                          {new Date(report.lastGenerated).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Next:{" "}
                          {new Date(report.nextScheduled).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportReport(report.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleReport(report.id)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Report Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.reportTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics?.reportTypes?.map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Monthly Report Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="reports"
                      fill="#3b82f6"
                      name="Total Reports"
                    />
                    <Bar dataKey="automated" fill="#10b981" name="Automated" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportingDashboard;
