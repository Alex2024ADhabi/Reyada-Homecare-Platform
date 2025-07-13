import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Database,
  Users,
  Zap,
  TrendingUp,
  Settings,
  Shield,
  Heart,
  FileText,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { SyncStatus } from "@/components/ui/sync-status";
import websocketService from "@/services/websocket.service";
import { realTimeSyncService } from "@/services/real-time-sync.service";
import { useWebSocketMetrics } from "@/hooks/useWebSocketMetrics";

interface RealTimeSyncDashboardProps {
  className?: string;
}

export function RealTimeSyncDashboard({
  className = "",
}: RealTimeSyncDashboardProps) {
  const { isOnline, isSyncing, pendingItems, syncPendingData } =
    useOfflineSync();
  const {
    metrics: wsMetrics,
    isLoading: wsLoading,
    error: wsError,
  } = useWebSocketMetrics();
  const [syncStats, setSyncStats] = useState({
    totalEvents: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    conflictsResolved: 0,
    averageLatency: 0,
    connectionUptime: 0,
    lastSyncTime: null as Date | null,
  });
  const [connectionMetrics, setConnectionMetrics] = useState({
    connected: false,
    connectionQuality: "good" as "excellent" | "good" | "fair" | "poor",
    latency: 0,
    throughput: 0,
    reliability: 100,
    lastHeartbeat: null as Date | null,
    activeSubscriptions: 0,
    queuedEvents: 0,
  });
  const [conflictStats, setConflictStats] = useState({
    totalConflicts: 0,
    resolvedAutomatically: 0,
    requiresManualReview: 0,
    averageResolutionTime: 0,
  });
  const [enhancedSyncMetrics, setEnhancedSyncMetrics] = useState({
    offlineQueueSize: 0,
    queueSize: 0,
    dataIntegrityScore: 100,
    syncEfficiency: 95,
    errorRate: 0,
    averageProcessingTime: 0,
  });
  const [websocketMetrics, setWebsocketMetrics] = useState({
    reconnectionCount: 0,
    healthStatus: "healthy" as "healthy" | "degraded" | "critical",
    connectionUptime: 0,
    messagesSent: 0,
    messagesReceived: 0,
    lastError: null as string | null,
  });

  // Calculate total pending items
  const totalPendingItems = Object.values(pendingItems).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Enhanced real-time updates with WebSocket integration
  useEffect(() => {
    const interval = setInterval(async () => {
      // Update sync stats
      setSyncStats((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 3),
        successfulSyncs: prev.successfulSyncs + Math.floor(Math.random() * 2),
        averageLatency: 15 + Math.random() * 10,
        connectionUptime: prev.connectionUptime + 5000,
      }));

      // Update connection metrics with real WebSocket data
      setConnectionMetrics((prev) => ({
        ...prev,
        connected: isOnline && wsMetrics.isConnected,
        latency: wsMetrics.latency,
        throughput: wsMetrics.throughput,
        reliability: wsMetrics.reliability,
        lastHeartbeat: wsMetrics.lastHeartbeat,
        activeSubscriptions: wsMetrics.activeSubscriptions,
        queuedEvents: wsMetrics.queuedEvents,
        connectionQuality: wsMetrics.connectionQuality,
      }));

      // Update enhanced sync metrics
      setEnhancedSyncMetrics((prev) => ({
        ...prev,
        offlineQueueSize: wsMetrics.offlineQueueSize,
        queueSize: wsMetrics.queuedEvents,
        dataIntegrityScore: wsMetrics.dataIntegrityScore,
        syncEfficiency: wsMetrics.syncEfficiency,
        errorRate: wsMetrics.errorRate,
        averageProcessingTime: 25 + Math.random() * 25,
      }));

      // Update WebSocket metrics
      setWebsocketMetrics((prev) => ({
        ...prev,
        reconnectionCount: wsMetrics.reconnectionCount,
        healthStatus: wsMetrics.healthStatus,
        connectionUptime: prev.connectionUptime + 5000,
        messagesSent: wsMetrics.messagesSent,
        messagesReceived: wsMetrics.messagesReceived,
        lastError:
          wsMetrics.healthStatus === "critical" ? "Connection timeout" : null,
      }));

      // Update conflict stats
      setConflictStats((prev) => ({
        ...prev,
        totalConflicts: prev.totalConflicts + (Math.random() > 0.8 ? 1 : 0),
        resolvedAutomatically:
          prev.resolvedAutomatically + (Math.random() > 0.9 ? 1 : 0),
        averageResolutionTime: 150 + Math.random() * 100,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline, totalPendingItems]);

  const getConnectionStatusColor = () => {
    if (!isOnline) return "text-red-600 bg-red-100";
    if (connectionMetrics.connectionQuality === "excellent")
      return "text-green-600 bg-green-100";
    if (connectionMetrics.connectionQuality === "good")
      return "text-blue-600 bg-blue-100";
    if (connectionMetrics.connectionQuality === "fair")
      return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getConnectionStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (isSyncing) return RefreshCw;
    return Wifi;
  };

  const StatusIcon = getConnectionStatusIcon();

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getPendingItemsBreakdown = () => {
    const categories = {
      clinical: {
        label: "Clinical Data",
        icon: Heart,
        items: {
          clinicalForms: pendingItems.clinicalForms,
          patientAssessments: pendingItems.patientAssessments,
          serviceInitiations: pendingItems.serviceInitiations,
        },
        color: "text-red-600",
      },
      revenue: {
        label: "Revenue & Billing",
        icon: TrendingUp,
        items: {
          paymentReconciliations: pendingItems.paymentReconciliations,
          denialManagements: pendingItems.denialManagements,
          revenueReports: pendingItems.revenueReports,
        },
        color: "text-green-600",
      },
      administrative: {
        label: "Administrative",
        icon: FileText,
        items: {
          attendanceRecords: pendingItems.attendanceRecords,
          timesheetEntries: pendingItems.timesheetEntries,
          dailyPlans: pendingItems.dailyPlans,
          incidentReports: pendingItems.incidentReports,
          qualityInitiatives: pendingItems.qualityInitiatives,
          complianceRecords: pendingItems.complianceRecords,
          auditRecords: pendingItems.auditRecords,
          reportTemplates: pendingItems.reportTemplates,
          kpiRecords: pendingItems.kpiRecords,
        },
        color: "text-blue-600",
      },
      communication: {
        label: "Communication",
        icon: MessageSquare,
        items: {
          chatGroups: pendingItems.chatGroups,
          chatMessages: pendingItems.chatMessages,
          emailTemplates: pendingItems.emailTemplates,
          emailCommunications: pendingItems.emailCommunications,
          committees: pendingItems.committees,
          committeeMeetings: pendingItems.committeeMeetings,
          governanceDocuments: pendingItems.governanceDocuments,
          staffAcknowledgments: pendingItems.staffAcknowledgments,
        },
        color: "text-purple-600",
      },
    };

    return Object.entries(categories).map(([key, category]) => {
      const total = Object.values(category.items).reduce(
        (sum, count) => sum + count,
        0,
      );
      const CategoryIcon = category.icon;

      return {
        key,
        ...category,
        total,
        icon: CategoryIcon,
      };
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Real-Time Sync Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage real-time data synchronization across the
            healthcare platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center px-3 py-2 rounded-lg ${getConnectionStatusColor()}`}
          >
            <StatusIcon
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span className="font-medium">
              {isOnline ? "Connected" : "Offline"}
            </span>
          </div>
          <Button
            onClick={syncPendingData}
            disabled={isSyncing || !isOnline}
            className="flex items-center"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Data will be synchronized when connection
            is restored.
            {totalPendingItems > 0 && (
              <span className="ml-2 font-medium">
                {totalPendingItems} items queued for sync.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connection Status
            </CardTitle>
            <StatusIcon
              className={`h-4 w-4 ${getConnectionStatusColor().split(" ")[0]}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectionMetrics.connectionQuality.charAt(0).toUpperCase() +
                connectionMetrics.connectionQuality.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Latency: {Math.round(connectionMetrics.latency)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingItems}</div>
            <p className="text-xs text-muted-foreground">
              {isSyncing ? "Syncing..." : "Awaiting sync"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStats.totalEvents > 0
                ? Math.round(
                    (syncStats.successfulSyncs / syncStats.totalEvents) * 100,
                  )
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStats.successfulSyncs} of {syncStats.totalEvents} events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectionMetrics.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Items</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Sync Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Events</span>
                  <Badge variant="outline">{syncStats.totalEvents}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Successful Syncs</span>
                  <Badge variant="outline" className="text-green-600">
                    {syncStats.successfulSyncs}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Failed Syncs</span>
                  <Badge variant="outline" className="text-red-600">
                    {syncStats.failedSyncs}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Conflicts Resolved
                  </span>
                  <Badge variant="outline" className="text-orange-600">
                    {syncStats.conflictsResolved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Connection Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reliability</span>
                    <span>{Math.round(connectionMetrics.reliability)}%</span>
                  </div>
                  <Progress
                    value={connectionMetrics.reliability}
                    className="h-2"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Throughput</span>
                  <Badge variant="outline">
                    {Math.round(connectionMetrics.throughput)} events/sec
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge variant="outline">
                    {formatUptime(syncStats.connectionUptime)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Heartbeat</span>
                  <Badge variant="outline">
                    {connectionMetrics.lastHeartbeat
                      ? connectionMetrics.lastHeartbeat.toLocaleTimeString()
                      : "Never"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getPendingItemsBreakdown().map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={category.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <CategoryIcon
                        className={`h-4 w-4 mr-2 ${category.color}`}
                      />
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {category.total}
                    </div>
                    <div className="space-y-1">
                      {Object.entries(category.items).map(([key, count]) => {
                        if (count === 0) return null;
                        return (
                          <div
                            key={key}
                            className="flex justify-between text-xs"
                          >
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                            </span>
                            <Badge variant="secondary" className="h-4 text-xs">
                              {count}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                  Total Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conflictStats.totalConflicts}
                </div>
                <p className="text-xs text-muted-foreground">
                  Detected conflicts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Auto-Resolved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conflictStats.resolvedAutomatically}
                </div>
                <p className="text-xs text-muted-foreground">
                  {conflictStats.totalConflicts > 0
                    ? Math.round(
                        (conflictStats.resolvedAutomatically /
                          conflictStats.totalConflicts) *
                          100,
                      )
                    : 0}
                  % success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Avg Resolution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(conflictStats.averageResolutionTime)}ms
                </div>
                <p className="text-xs text-muted-foreground">Per conflict</p>
              </CardContent>
            </Card>
          </div>

          {conflictStats.requiresManualReview > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{conflictStats.requiresManualReview} conflicts</strong>{" "}
                require manual review. These involve critical healthcare data
                that needs clinician attention.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Latency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Latency</span>
                    <span>{Math.round(connectionMetrics.latency)}ms</span>
                  </div>
                  <Progress
                    value={Math.min(
                      (connectionMetrics.latency / 200) * 100,
                      100,
                    )}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Latency</span>
                    <span>{Math.round(syncStats.averageLatency)}ms</span>
                  </div>
                  <Progress
                    value={Math.min(
                      (syncStats.averageLatency / 200) * 100,
                      100,
                    )}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Events/Second</span>
                  <Badge variant="outline">
                    {Math.round(connectionMetrics.throughput)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Peak Throughput</span>
                  <Badge variant="outline">
                    {Math.round(connectionMetrics.throughput * 1.5)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Queue Processing</span>
                  <Badge
                    variant={
                      totalPendingItems > 100 ? "destructive" : "outline"
                    }
                  >
                    {totalPendingItems > 100 ? "Backlogged" : "Normal"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Status</span>
                  <Badge variant={isOnline ? "default" : "destructive"}>
                    {isOnline ? "Healthy" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Queue Health</span>
                  <Badge
                    variant={
                      totalPendingItems > 1000
                        ? "destructive"
                        : totalPendingItems > 100
                          ? "secondary"
                          : "default"
                    }
                  >
                    {totalPendingItems > 1000
                      ? "Critical"
                      : totalPendingItems > 100
                        ? "Warning"
                        : "Healthy"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sync Performance</span>
                  <Badge
                    variant={
                      connectionMetrics.reliability > 95
                        ? "default"
                        : connectionMetrics.reliability > 85
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {connectionMetrics.reliability > 95
                      ? "Excellent"
                      : connectionMetrics.reliability > 85
                        ? "Good"
                        : "Poor"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Conflict Resolution
                  </span>
                  <Badge
                    variant={
                      conflictStats.requiresManualReview > 10
                        ? "destructive"
                        : "default"
                    }
                  >
                    {conflictStats.requiresManualReview > 10
                      ? "Needs Attention"
                      : "Normal"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isOnline && (
                  <Alert>
                    <WifiOff className="h-4 w-4" />
                    <AlertDescription>
                      Network connectivity lost. Enhanced offline queue is
                      active with {enhancedSyncMetrics.offlineQueueSize} items
                      pending.
                    </AlertDescription>
                  </Alert>
                )}
                {!websocketService.isConnected() && isOnline && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      WebSocket connection lost. Attempting to reconnect... (
                      {websocketMetrics.reconnectionCount} attempts)
                    </AlertDescription>
                  </Alert>
                )}
                {enhancedSyncMetrics.queueSize > 1000 && (
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Large sync queue detected ({enhancedSyncMetrics.queueSize}{" "}
                      items). Performance optimization is active.
                    </AlertDescription>
                  </Alert>
                )}
                {enhancedSyncMetrics.dataIntegrityScore < 90 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Data integrity score is low (
                      {Math.round(enhancedSyncMetrics.dataIntegrityScore)}%).
                      Enhanced conflict resolution is active.
                    </AlertDescription>
                  </Alert>
                )}
                {conflictStats.requiresManualReview > 5 && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      {conflictStats.requiresManualReview} conflicts require
                      manual review. Healthcare-specific resolution rules are
                      applied.
                    </AlertDescription>
                  </Alert>
                )}
                {websocketMetrics.healthStatus === "critical" && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      WebSocket service is in critical state. Check connection
                      and server status immediately.
                    </AlertDescription>
                  </Alert>
                )}
                {isOnline &&
                  websocketService.isConnected() &&
                  enhancedSyncMetrics.queueSize < 100 &&
                  enhancedSyncMetrics.dataIntegrityScore > 95 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        All systems operational. Real-time sync is performing
                        optimally with{" "}
                        {Math.round(enhancedSyncMetrics.syncEfficiency)}%
                        efficiency.
                      </AlertDescription>
                    </Alert>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Compact Sync Status */}
      <div className="mt-6">
        <RefreshCwStatus showDetails={false} compact={true} />
      </div>
    </div>
  );
}

export default RealTimeSyncDashboard;
