import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  WifiOff,
  Wifi,
  Database,
  Sync,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import { offlineService } from "@/services/offline.service";

interface OfflineMetrics {
  totalOfflineTime: number;
  averageOfflineSession: number;
  dataStoredOffline: number;
  syncSuccessRate: number;
  conflictsResolved: number;
  predictiveCacheHits: number;
  networkEfficiency: number;
  userProductivity: number;
}

interface SyncActivity {
  timestamp: string;
  type: string;
  status: "success" | "failed" | "pending";
  dataSize: number;
  duration: number;
}

interface DataUsagePattern {
  category: string;
  offlineUsage: number;
  onlineUsage: number;
  cacheHits: number;
  syncFrequency: number;
}

interface OfflineAnalyticsDashboardProps {
  className?: string;
}

export default function OfflineAnalyticsDashboard({ className = "" }: OfflineAnalyticsDashboardProps) {
  const { toast } = useToastContext();
  const [metrics, setMetrics] = useState<OfflineMetrics>({
    totalOfflineTime: 0,
    averageOfflineSession: 0,
    dataStoredOffline: 0,
    syncSuccessRate: 0,
    conflictsResolved: 0,
    predictiveCacheHits: 0,
    networkEfficiency: 0,
    userProductivity: 0,
  });
  const [syncActivity, setSyncActivity] = useState<SyncActivity[]>([]);
  const [dataPatterns, setDataPatterns] = useState<DataUsagePattern[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    loadAnalyticsData();
    setupEventListeners();
    
    const interval = setInterval(loadAnalyticsData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const setupEventListeners = () => {
    const handleOnline = () => {
      setIsOnline(true);
      loadAnalyticsData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Get offline service data
      const pendingItems = await offlineService.getPendingSyncItems();
      
      // Generate mock analytics data based on time range
      const mockMetrics = generateMockMetrics(selectedTimeRange);
      const mockSyncActivity = generateMockSyncActivity(selectedTimeRange);
      const mockDataPatterns = generateMockDataPatterns();
      
      setMetrics(mockMetrics);
      setSyncActivity(mockSyncActivity);
      setDataPatterns(mockDataPatterns);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      toast({
        title: "Analytics Error",
        description: "Failed to load offline analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockMetrics = (timeRange: string): OfflineMetrics => {
    const multiplier = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30;
    
    return {
      totalOfflineTime: Math.floor(Math.random() * 120 * multiplier), // minutes
      averageOfflineSession: Math.floor(Math.random() * 30) + 5, // minutes
      dataStoredOffline: Math.floor(Math.random() * 50 * multiplier) + 10, // MB
      syncSuccessRate: Math.floor(Math.random() * 15) + 85, // percentage
      conflictsResolved: Math.floor(Math.random() * 10 * multiplier),
      predictiveCacheHits: Math.floor(Math.random() * 20) + 70, // percentage
      networkEfficiency: Math.floor(Math.random() * 25) + 70, // percentage
      userProductivity: Math.floor(Math.random() * 20) + 75, // percentage
    };
  };

  const generateMockSyncActivity = (timeRange: string): SyncActivity[] => {
    const count = timeRange === "24h" ? 24 : timeRange === "7d" ? 48 : 100;
    const activities: SyncActivity[] = [];
    
    for (let i = 0; i < count; i++) {
      const hoursAgo = i * (timeRange === "24h" ? 1 : timeRange === "7d" ? 3.5 : 7.2);
      const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      activities.push({
        timestamp: timestamp.toISOString(),
        type: ["clinical_forms", "patient_assessments", "service_initiations", "administrative_data"][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? "success" : Math.random() > 0.5 ? "failed" : "pending",
        dataSize: Math.floor(Math.random() * 5000) + 100, // KB
        duration: Math.floor(Math.random() * 10000) + 500, // ms
      });
    }
    
    return activities.reverse();
  };

  const generateMockDataPatterns = (): DataUsagePattern[] => {
    return [
      {
        category: "Clinical Forms",
        offlineUsage: Math.floor(Math.random() * 40) + 30,
        onlineUsage: Math.floor(Math.random() * 60) + 40,
        cacheHits: Math.floor(Math.random() * 30) + 60,
        syncFrequency: Math.floor(Math.random() * 20) + 10,
      },
      {
        category: "Patient Assessments",
        offlineUsage: Math.floor(Math.random() * 35) + 25,
        onlineUsage: Math.floor(Math.random() * 55) + 35,
        cacheHits: Math.floor(Math.random() * 25) + 65,
        syncFrequency: Math.floor(Math.random() * 15) + 8,
      },
      {
        category: "Service Initiations",
        offlineUsage: Math.floor(Math.random() * 30) + 20,
        onlineUsage: Math.floor(Math.random() * 50) + 30,
        cacheHits: Math.floor(Math.random() * 20) + 70,
        syncFrequency: Math.floor(Math.random() * 12) + 6,
      },
      {
        category: "Administrative Data",
        offlineUsage: Math.floor(Math.random() * 25) + 15,
        onlineUsage: Math.floor(Math.random() * 45) + 25,
        cacheHits: Math.floor(Math.random() * 15) + 75,
        syncFrequency: Math.floor(Math.random() * 10) + 4,
      },
    ];
  };

  const refreshData = () => {
    loadAnalyticsData();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated",
      variant: "success",
    });
  };

  const exportData = () => {
    const data = {
      metrics,
      syncActivity,
      dataPatterns,
      exportedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offline-analytics-${selectedTimeRange}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Analytics data has been exported successfully",
      variant: "success",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  const syncSuccessData = syncActivity.reduce((acc, activity) => {
    const hour = new Date(activity.timestamp).getHours();
    const existing = acc.find(item => item.hour === hour);
    
    if (existing) {
      existing.total++;
      if (activity.status === "success") existing.success++;
    } else {
      acc.push({
        hour,
        total: 1,
        success: activity.status === "success" ? 1 : 0,
        rate: 0,
      });
    }
    
    return acc;
  }, [] as any[]);

  syncSuccessData.forEach(item => {
    item.rate = item.total > 0 ? (item.success / item.total) * 100 : 0;
  });

  return (
    <div className={`bg-white space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Offline Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor offline usage patterns and sync performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isOnline ? (
              <><Wifi className="h-3 w-3 mr-1" />Online</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" />Offline</>
            )}
          </Badge>
          <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {["24h", "7d", "30d"].map((range) => (
            <Button
              key={range}
              onClick={() => setSelectedTimeRange(range as any)}
              variant={selectedTimeRange === range ? "default" : "outline"}
              size="sm"
            >
              {range === "24h" ? "Last 24 Hours" : range === "7d" ? "Last 7 Days" : "Last 30 Days"}
            </Button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offline Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(metrics.totalOfflineTime)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg session: {formatDuration(metrics.averageOfflineSession)}
                </p>
              </div>
              <WifiOff className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Stored Offline</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.dataStoredOffline} MB
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all categories
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sync Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.syncSuccessRate}%
                </p>
                <div className="flex items-center mt-1">
                  {metrics.syncSuccessRate >= 90 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <p className="text-xs text-gray-500">
                    {metrics.conflictsResolved} conflicts resolved
                  </p>
                </div>
              </div>
              <Sync className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.predictiveCacheHits}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Predictive caching efficiency
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="sync-activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sync-activity">Sync Activity</TabsTrigger>
          <TabsTrigger value="data-patterns">Data Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="sync-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sync className="h-5 w-5 mr-2" />
                Sync Success Rate Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
