import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Server,
  Database,
  Wifi,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Zap,
  Settings,
  Brain,
  Shield,
  Target,
  Gauge,
  LineChart,
  PieChart,
  Eye,
  Download,
  RefreshCw,
  Cpu,
  HardDrive,
  Network,
  MemoryStick,
  TrendingDown,
  Minus,
} from "lucide-react";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: {
    warning: number;
    critical: number;
  };
  trend: "up" | "down" | "stable";
}

interface ServiceHealth {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

interface Alert {
  id: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  service: string;
}

interface PerformanceMetric {
  id: string;
  metric: string;
  current: number;
  target: number;
  unit: string;
  trend: number; // percentage change
}

interface PredictiveInsight {
  id: string;
  type: "forecast" | "anomaly" | "optimization" | "risk";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  timeframe: string;
  recommendation: string;
  data: {
    current: number;
    predicted: number;
    variance: number;
  };
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  threshold: {
    warning: number;
    critical: number;
  };
  trend: "up" | "down" | "stable";
  change: number;
  description: string;
}

interface SystemHealthMetric {
  id: string;
  component: string;
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastCheck: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

const ComprehensiveMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  
  // Real-time metrics state
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([
    {
      id: "response_time",
      name: "Average Response Time",
      value: 145,
      unit: "ms",
      status: "normal",
      threshold: { warning: 200, critical: 500 },
      trend: "down",
      change: -8.2,
      description: "API response time across all endpoints"
    },
    {
      id: "throughput",
      name: "Request Throughput",
      value: 2847,
      unit: "req/min",
      status: "normal",
      threshold: { warning: 3000, critical: 4000 },
      trend: "up",
      change: 12.5,
      description: "Requests processed per minute"
    },
    {
      id: "error_rate",
      name: "Error Rate",
      value: 0.05,
      unit: "%",
      status: "normal",
      threshold: { warning: 1.0, critical: 5.0 },
      trend: "down",
      change: -15.3,
      description: "Percentage of failed requests"
    },
    {
      id: "active_users",
      name: "Active Users",
      value: 892,
      unit: "users",
      status: "normal",
      threshold: { warning: 1000, critical: 1200 },
      trend: "up",
      change: 18.7,
      description: "Currently active system users"
    }
  ]);
  
  // System health metrics
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetric[]>([
    {
      id: "api_gateway",
      component: "API Gateway",
      status: "healthy",
      uptime: 99.9,
      responseTime: 145,
      errorRate: 0.02,
      throughput: 2847,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 45, memory: 62, disk: 23, network: 156 }
    },
    {
      id: "database",
      component: "Database Cluster",
      status: "healthy",
      uptime: 99.8,
      responseTime: 23,
      errorRate: 0.01,
      throughput: 1250,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 38, memory: 71, disk: 45, network: 89 }
    },
    {
      id: "cache_layer",
      component: "Cache Layer",
      status: "degraded",
      uptime: 98.5,
      responseTime: 89,
      errorRate: 0.15,
      throughput: 890,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 72, memory: 85, disk: 12, network: 234 }
    },
    {
      id: "external_apis",
      component: "External APIs",
      status: "healthy",
      uptime: 99.2,
      responseTime: 567,
      errorRate: 0.08,
      throughput: 456,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 25, memory: 34, disk: 8, network: 445 }
    }
  ]);
  
  // Predictive insights
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([
    {
      id: "performance_forecast",
      type: "forecast",
      title: "Performance Degradation Forecast",
      description: "System performance may degrade by 15% in the next 2 hours due to increased load",
      confidence: 87,
      impact: "medium",
      timeframe: "Next 2 hours",
      recommendation: "Consider scaling up resources or implementing load balancing",
      data: { current: 145, predicted: 167, variance: 12 }
    },
    {
      id: "capacity_risk",
      type: "risk",
      title: "Capacity Utilization Risk",
      description: "High probability of reaching capacity limits during peak hours",
      confidence: 92,
      impact: "high",
      timeframe: "Next 6 hours",
      recommendation: "Prepare auto-scaling policies and monitor resource allocation",
      data: { current: 72, predicted: 95, variance: 8 }
    },
    {
      id: "anomaly_detection",
      type: "anomaly",
      title: "Memory Usage Anomaly",
      description: "Unusual memory consumption pattern detected in cache layer",
      confidence: 78,
      impact: "medium",
      timeframe: "Last 30 minutes",
      recommendation: "Investigate memory leaks and optimize cache configuration",
      data: { current: 85, predicted: 65, variance: 20 }
    },
    {
      id: "optimization_opportunity",
      type: "optimization",
      title: "Database Query Optimization",
      description: "Potential 25% performance improvement through query optimization",
      confidence: 85,
      impact: "high",
      timeframe: "Implementation ready",
      recommendation: "Apply suggested database index optimizations",
      data: { current: 23, predicted: 17, variance: 3 }
    }
  ]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      id: "1",
      name: "CPU Usage",
      value: 68,
      unit: "%",
      status: "warning",
      threshold: { warning: 70, critical: 90 },
      trend: "up",
    },
    {
      id: "2",
      name: "Memory Usage",
      value: 45,
      unit: "%",
      status: "healthy",
      threshold: { warning: 80, critical: 95 },
      trend: "stable",
    },
    {
      id: "3",
      name: "Disk Usage",
      value: 72,
      unit: "%",
      status: "warning",
      threshold: { warning: 75, critical: 90 },
      trend: "up",
    },
    {
      id: "4",
      name: "Network I/O",
      value: 234,
      unit: "MB/s",
      status: "healthy",
      threshold: { warning: 500, critical: 800 },
      trend: "down",
    },
  ]);

  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([
    {
      id: "1",
      name: "API Gateway",
      status: "healthy",
      uptime: 99.9,
      responseTime: 145,
      errorRate: 0.02,
      lastCheck: "2024-01-18T15:30:00Z",
    },
    {
      id: "2",
      name: "Database Cluster",
      status: "healthy",
      uptime: 99.8,
      responseTime: 23,
      errorRate: 0.01,
      lastCheck: "2024-01-18T15:30:00Z",
    },
    {
      id: "3",
      name: "Cache Layer",
      status: "degraded",
      uptime: 98.5,
      responseTime: 89,
      errorRate: 0.15,
      lastCheck: "2024-01-18T15:30:00Z",
    },
    {
      id: "4",
      name: "External Integrations",
      status: "healthy",
      uptime: 99.2,
      responseTime: 567,
      errorRate: 0.08,
      lastCheck: "2024-01-18T15:30:00Z",
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      severity: "warning",
      title: "High CPU Usage Detected",
      description: "CPU usage has exceeded 65% for the past 10 minutes",
      timestamp: "2024-01-18T15:25:00Z",
      resolved: false,
      service: "Application Server",
    },
    {
      id: "2",
      severity: "error",
      title: "Cache Performance Degraded",
      description: "Redis cluster showing increased response times",
      timestamp: "2024-01-18T15:20:00Z",
      resolved: false,
      service: "Cache Layer",
    },
    {
      id: "3",
      severity: "info",
      title: "Scheduled Maintenance Completed",
      description: "Database maintenance window completed successfully",
      timestamp: "2024-01-18T14:00:00Z",
      resolved: true,
      service: "Database",
    },
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >([
    {
      id: "1",
      metric: "Request Throughput",
      current: 1247,
      target: 1000,
      unit: "req/min",
      trend: 12.5,
    },
    {
      id: "2",
      metric: "Average Response Time",
      current: 145,
      target: 200,
      unit: "ms",
      trend: -8.2,
    },
    {
      id: "3",
      metric: "Error Rate",
      current: 0.05,
      target: 0.1,
      unit: "%",
      trend: -15.3,
    },
    {
      id: "4",
      metric: "Active Users",
      current: 892,
      target: 800,
      unit: "users",
      trend: 18.7,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
      case "degraded":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
      case "down":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string | number) => {
    if (typeof trend === "number") {
      return trend > 0 ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      );
    }
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case "stable":
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  const overallHealth =
    (systemHealth.filter((s) => s.status === "healthy").length /
      systemHealth.length) *
    100;
  const activeAlerts = alerts.filter((a) => !a.resolved).length;
  
  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);
  
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      
      // Update metrics with slight variations
      setRealTimeMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * metric.value * 0.1,
        change: (Math.random() - 0.5) * 20
      })));
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "normal":
        return "text-green-600 bg-green-100 border-green-200";
      case "warning":
      case "degraded":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "normal":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
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
      case "optimization":
        return <Target className="h-5 w-5 text-green-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  // Enhanced monitoring metrics
  const [configurationHealth, setConfigurationHealth] = useState({
    status: "healthy" as "healthy" | "degraded" | "critical",
    score: 95,
    issues: 2,
    lastValidated: new Date().toISOString(),
  });

  const [integrationHealth, setIntegrationHealth] = useState({
    daman: { status: "healthy", responseTime: 145, uptime: 99.9 },
    malaffi: { status: "degraded", responseTime: 890, uptime: 98.2 },
    emiratesId: { status: "healthy", responseTime: 234, uptime: 99.8 },
    doh: { status: "healthy", responseTime: 567, uptime: 99.5 },
  });

  const [performanceOptimizations, setPerformanceOptimizations] = useState([
    {
      id: "response_time",
      name: "API Response Time Optimization",
      current: 145,
      target: 100,
      improvement: "37%",
      status: "in_progress",
    },
    {
      id: "memory_usage",
      name: "Memory Usage Optimization",
      current: 45,
      target: 35,
      improvement: "22%",
      status: "completed",
    },
    {
      id: "cache_hit_rate",
      name: "Cache Hit Rate Improvement",
      current: 87,
      target: 95,
      improvement: "9%",
      status: "planned",
    },
  ]);

  useEffect(() => {
    // Simulate real-time configuration health monitoring
    const configInterval = setInterval(() => {
      setConfigurationHealth((prev) => ({
        ...prev,
        lastValidated: new Date().toISOString(),
        score: Math.max(90, prev.score + (Math.random() - 0.5) * 2),
      }));
    }, 30000);

    return () => clearInterval(configInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Gauge className="h-8 w-8 mr-3 text-primary" />
              Advanced Performance Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time analytics, predictive monitoring, and proactive system optimization
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-500 gap-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              {activeAlerts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {activeAlerts} Alert{activeAlerts > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(overallHealth)}%
              </div>
              <div className="text-sm text-gray-500">System Health</div>
            </div>
            <div className="flex items-center gap-2">
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
              <Button onClick={refreshData} disabled={loading} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Real-time Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {realTimeMetrics.map((metric) => (
            <Card key={metric.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    {metric.id === 'response_time' && <Clock className="h-4 w-4 mr-2" />}
                    {metric.id === 'throughput' && <BarChart3 className="h-4 w-4 mr-2" />}
                    {metric.id === 'error_rate' && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {metric.id === 'active_users' && <Users className="h-4 w-4 mr-2" />}
                    {metric.name}
                  </span>
                  {getStatusIcon(metric.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold text-blue-900">
                    {typeof metric.value === 'number' ? metric.value.toFixed(metric.unit === '%' ? 2 : 0) : metric.value}
                    {metric.unit}
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm ml-1 ${
                      metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                  <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <Gauge className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="realtime">
              <Zap className="h-4 w-4 mr-2" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="predictive">
              <Brain className="h-4 w-4 mr-2" />
              Predictive
            </TabsTrigger>
            <TabsTrigger value="infrastructure">
              <Server className="h-4 w-4 mr-2" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <Target className="h-4 w-4 mr-2" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    System Health Overview
                  </CardTitle>
                  <CardDescription>
                    Real-time status of all platform components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemHealth.map((system) => (
                      <div key={system.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(system.status)}
                          <div>
                            <h4 className="font-medium text-sm">{system.component}</h4>
                            <p className="text-xs text-gray-600">
                              {system.uptime}% uptime • {system.responseTime}ms avg
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(system.status)}>
                            {system.status}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {system.throughput} req/min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    24-hour performance overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Performance trend charts</p>
                      <p className="text-sm text-gray-400">Real-time data visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Real-time Tab */}
          <TabsContent value="realtime" className="mt-6">
            <div className="space-y-6">
              {/* Resource Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Resource Utilization
                  </CardTitle>
                  <CardDescription>
                    Current resource usage across all system components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {systemHealth.map((system) => (
                      <div key={system.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">{system.component}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm">CPU</span>
                            </div>
                            <span className="text-sm font-medium">{system.metrics.cpu}%</span>
                          </div>
                          <Progress value={system.metrics.cpu} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <MemoryStick className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm">Memory</span>
                            </div>
                            <span className="text-sm font-medium">{system.metrics.memory}%</span>
                          </div>
                          <Progress value={system.metrics.memory} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <HardDrive className="h-4 w-4 mr-2 text-orange-500" />
                              <span className="text-sm">Disk</span>
                            </div>
                            <span className="text-sm font-medium">{system.metrics.disk}%</span>
                          </div>
                          <Progress value={system.metrics.disk} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Network className="h-4 w-4 mr-2 text-purple-500" />
                              <span className="text-sm">Network</span>
                            </div>
                            <span className="text-sm font-medium">{system.metrics.network} MB/s</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Predictive Tab */}
          <TabsContent value="predictive" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    AI-Powered Predictive Insights
                  </CardTitle>
                  <CardDescription>
                    Machine learning predictions for proactive system optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                              <Badge variant={
                                insight.impact === "critical" ? "destructive" :
                                insight.impact === "high" ? "default" :
                                insight.impact === "medium" ? "secondary" : "outline"
                              }>
                                {insight.impact} impact
                              </Badge>
                            </div>
                          </CardTitle>
                          <CardDescription>
                            {insight.timeframe} • {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Analysis
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-gray-700">{insight.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Current</div>
                                <div className="text-xl font-bold">
                                  {insight.data.current.toFixed(1)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Predicted</div>
                                <div className="text-xl font-bold text-blue-600">
                                  {insight.data.predicted.toFixed(1)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">Variance</div>
                                <div className="text-xl font-bold text-orange-600">
                                  ±{insight.data.variance.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <div className="font-medium text-blue-800 mb-1">Recommendation</div>
                              <p className="text-blue-700">{insight.recommendation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                      {getStatusIcon(metric.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {metric.value}{metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <Progress value={metric.value} className={`h-2 ${
                        metric.status === "critical" ? "bg-red-200" :
                        metric.status === "warning" ? "bg-yellow-200" : "bg-green-200"
                      }`} />
                      <div className="text-xs text-gray-600">
                        Warning: {metric.threshold.warning}{metric.unit} | 
                        Critical: {metric.threshold.critical}{metric.unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Optimization Tab */}
          <TabsContent value="optimization" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Performance Optimization Opportunities
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations for system optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceOptimizations.map((opt) => (
                    <div key={opt.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{opt.name}</h4>
                        <Badge variant={
                          opt.status === "completed" ? "default" :
                          opt.status === "in_progress" ? "secondary" : "outline"
                        }>
                          {opt.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium ml-2">
                            {opt.current}{opt.id.includes("time") ? "ms" : "%"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium ml-2">
                            {opt.target}{opt.id.includes("time") ? "ms" : "%"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Improvement:</span>
                          <span className="font-medium text-green-600 ml-2">{opt.improvement}</span>
                        </div>
                      </div>
                      <Progress value={(opt.current / opt.target) * 100} className="h-2 mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={alert.resolved ? "opacity-60" : ""}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.title}</span>
                          {alert.resolved && <Badge variant="outline">Resolved</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.resolved && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Acknowledge</Button>
                          <Button size="sm">Resolve</Button>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </TabsContent>
        </Tabs>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {activeAlerts}
              </div>
              <p className="text-xs text-gray-600">requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  serviceHealth.reduce((sum, s) => sum + s.responseTime, 0) /
                    serviceHealth.length,
                )}
                ms
              </div>
              <p className="text-xs text-gray-600">across all services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceMetrics.find((m) => m.metric === "Active Users")
                  ?.current || 0}
              </div>
              <p className="text-xs text-gray-600">currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Config Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  configurationHealth.status === "healthy"
                    ? "text-green-600"
                    : configurationHealth.status === "degraded"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {configurationHealth.score}%
              </div>
              <p className="text-xs text-gray-600">
                {configurationHealth.issues} issues detected
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health Overview</CardTitle>
                  <CardDescription>
                    Real-time status of all platform components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceHealth.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(service.status)}
                          <div>
                            <h4 className="font-medium text-sm">
                              {service.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {service.uptime}% uptime
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-sm">
                            {metric.metric}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Target: {metric.target} {metric.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {metric.current} {metric.unit}
                            </span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {metric.trend > 0 ? "+" : ""}
                            {metric.trend.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {metric.name}
                      </CardTitle>
                      {getStatusIcon(metric.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {metric.value}
                          {metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <Progress
                        value={metric.value}
                        className={`h-2 ${
                          metric.status === "critical"
                            ? "bg-red-200"
                            : metric.status === "warning"
                              ? "bg-yellow-200"
                              : "bg-green-200"
                        }`}
                      />
                      <div className="text-xs text-gray-600">
                        Warning: {metric.threshold.warning}
                        {metric.unit} | Critical: {metric.threshold.critical}
                        {metric.unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Topology</CardTitle>
                <CardDescription>
                  System architecture and component relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Infrastructure topology visualization would be implemented
                    here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="space-y-4">
              {serviceHealth.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {service.name}
                        </CardTitle>
                        <CardDescription>
                          Last checked:{" "}
                          {new Date(service.lastCheck).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <span className="text-sm text-gray-600">Uptime</span>
                        <div className="text-xl font-bold">
                          {service.uptime}%
                        </div>
                        <Progress value={service.uptime} className="h-2 mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Response Time
                        </span>
                        <div className="text-xl font-bold">
                          {service.responseTime}ms
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Average over 24h
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Error Rate
                        </span>
                        <div className="text-xl font-bold">
                          {service.errorRate}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last 24 hours
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button size="sm" variant="outline">
                        View Logs
                      </Button>
                      <Button size="sm" variant="outline">
                        View Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    24-hour performance overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      Performance trend charts would be implemented here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>
                    Current resource usage across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemMetrics.map((metric) => (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {metric.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {metric.value}
                            {metric.unit}
                          </span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Health Status</CardTitle>
                  <CardDescription>
                    Real-time status of external system integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(integrationHealth).map(
                      ([key, integration]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {integration.status === "healthy" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : integration.status === "degraded" ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <h4 className="font-medium text-sm capitalize">
                                {key}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {integration.uptime}% uptime •{" "}
                                {integration.responseTime}ms
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Optimizations</CardTitle>
                  <CardDescription>
                    Ongoing and planned performance improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceOptimizations.map((opt) => (
                      <div key={opt.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{opt.name}</h4>
                          <Badge
                            variant={
                              opt.status === "completed"
                                ? "default"
                                : opt.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {opt.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            Current: {opt.current}
                            {opt.id.includes("time") ? "ms" : "%"}
                          </span>
                          <span>
                            Target: {opt.target}
                            {opt.id.includes("time") ? "ms" : "%"}
                          </span>
                          <span className="text-green-600 font-medium">
                            {opt.improvement} improvement
                          </span>
                        </div>
                        <Progress
                          value={(opt.current / opt.target) * 100}
                          className="h-2 mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={alert.resolved ? "opacity-60" : ""}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.title}</span>
                          {alert.resolved && (
                            <Badge variant="outline">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {alert.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.service} •{" "}
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.resolved && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                          <Button size="sm">Resolve</Button>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveMonitoringDashboard;
