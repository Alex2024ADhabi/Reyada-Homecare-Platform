import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Heart,
  FileCheck,
  Database,
  Network,
  RefreshCw,
  Download,
  Filter,
  Zap,
  Target,
  Settings,
} from "lucide-react";
import { errorHandlerService } from "@/services/error-handler.service";
import { enhancedErrorRecoveryService } from "@/services/enhanced-error-recovery.service";
import { useWebSocket } from "@/hooks/useWebSocket";

interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: any[];
  topErrors: { message: string; count: number }[];
  healthcareErrors: number;
  dohComplianceErrors: number;
  patientSafetyErrors: number;
  criticalHealthcareErrors: number;
  errorRecoveryRate: number;
  averageRecoveryTime: number;
}

interface RecoveryMetrics {
  totalRecoveryAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  recoverySuccessRate: number;
  criticalRecoveries: number;
  healthcareRecoveries: number;
  dohComplianceRecoveries: number;
  patientSafetyRecoveries: number;
}

interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface SystemHealth {
  overall: "healthy" | "warning" | "critical";
  components: {
    errorHandling: "operational" | "degraded" | "failed";
    realTimeSync: "operational" | "degraded" | "failed";
    dohCompliance: "operational" | "degraded" | "failed";
    patientSafety: "operational" | "degraded" | "failed";
  };
  uptime: number;
  lastIncident: Date | null;
}

export function ErrorMonitoringDashboard() {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [recoveryMetrics, setRecoveryMetrics] =
    useState<RecoveryMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "healthy",
    components: {
      errorHandling: "operational",
      realTimeSync: "operational",
      dohCompliance: "operational",
      patientSafety: "operational",
    },
    uptime: 99.9,
    lastIncident: null,
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>([]);
  const [systemHealthScore, setSystemHealthScore] = useState(100);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [activeFailovers, setActiveFailovers] = useState([]);
  const [autoHealingRules, setAutoHealingRules] = useState([]);

  // WebSocket integration for real-time updates
  const { isConnected, subscribe } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  useEffect(() => {
    loadMetrics();
    loadRecoveryMetrics();
    loadSystemStatus();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadMetrics();
      loadRecoveryMetrics();
      loadSystemStatus();
    }, 30000); // Update every 30 seconds

    // Set up error handler listeners
    errorHandlerService.on("error-occurred", handleNewError);
    errorHandlerService.on("critical-error", handleCriticalError);
    errorHandlerService.on("patient-safety-risk", handlePatientSafetyRisk);
    errorHandlerService.on("doh-compliance-risk", handleDOHComplianceRisk);

    // Set up WebSocket subscriptions for real-time events
    const unsubscribeErrorMonitoring = subscribe(
      "error-monitoring",
      handleErrorMonitoringEvent,
    );
    const unsubscribeErrorRecovery = subscribe(
      "error-recovery",
      handleErrorRecoveryEvent,
    );

    return () => {
      clearInterval(interval);
      errorHandlerService.off("error-occurred", handleNewError);
      errorHandlerService.off("critical-error", handleCriticalError);
      errorHandlerService.off("patient-safety-risk", handlePatientSafetyRisk);
      errorHandlerService.off("doh-compliance-risk", handleDOHComplianceRisk);
      unsubscribeErrorMonitoring();
      unsubscribeErrorRecovery();
    };
  }, [subscribe]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const errorMetrics = errorHandlerService.getErrorMetrics();
      const healthcareMetrics = errorHandlerService.getHealthcareErrorMetrics();

      setMetrics({
        ...errorMetrics,
        ...healthcareMetrics,
      });

      updateSystemHealth(errorMetrics, healthcareMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecoveryMetrics = async () => {
    try {
      const recoveryData = enhancedErrorRecoveryService.getRecoveryMetrics();
      setRecoveryMetrics(recoveryData);
    } catch (error) {
      console.error("Failed to load recovery metrics:", error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const healthScore = enhancedErrorRecoveryService.getSystemHealthScore();
      const emergencyMode = enhancedErrorRecoveryService.isInEmergencyMode();
      const failovers = enhancedErrorRecoveryService.getActiveFailovers();
      const healingRules = enhancedErrorRecoveryService.getAutoHealingRules();

      setSystemHealthScore(healthScore);
      setIsEmergencyMode(emergencyMode);
      setActiveFailovers(failovers);
      setAutoHealingRules(healingRules);
    } catch (error) {
      console.error("Failed to load system status:", error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    // Handle real-time WebSocket messages
    if (
      message.type === "error-monitoring" ||
      message.type === "error-recovery"
    ) {
      const event: RealTimeEvent = {
        type: message.data.type,
        data: message.data.data,
        timestamp: message.data.timestamp,
      };

      setRealTimeEvents((prev) => [event, ...prev.slice(0, 9)]); // Keep last 10 events

      // Refresh metrics on important events
      if (
        [
          "critical-error",
          "patient-safety-risk",
          "doh-compliance-risk",
          "emergency-mode-activated",
          "system-failover",
        ].includes(event.type)
      ) {
        loadMetrics();
        loadRecoveryMetrics();
        loadSystemStatus();
      }
    }
  };

  const handleErrorMonitoringEvent = (data: any) => {
    handleWebSocketMessage({ type: "error-monitoring", data });
  };

  const handleErrorRecoveryEvent = (data: any) => {
    handleWebSocketMessage({ type: "error-recovery", data });
  };

  const updateSystemHealth = (errorMetrics: any, healthcareMetrics: any) => {
    const recentCriticalErrors = errorMetrics.recentErrors.filter(
      (error: any) =>
        error.severity === "critical" &&
        new Date(error.timestamp).getTime() > Date.now() - 300000, // Last 5 minutes
    ).length;

    const overall =
      recentCriticalErrors > 2
        ? "critical"
        : recentCriticalErrors > 0
          ? "warning"
          : "healthy";

    setSystemHealth((prev) => ({
      ...prev,
      overall,
      components: {
        errorHandling:
          errorMetrics.totalErrors > 100 ? "degraded" : "operational",
        realTimeSync: recentCriticalErrors > 0 ? "degraded" : "operational",
        dohCompliance:
          healthcareMetrics.dohComplianceErrors > 5
            ? "degraded"
            : "operational",
        patientSafety:
          healthcareMetrics.patientSafetyErrors > 0
            ? "degraded"
            : "operational",
      },
      uptime: Math.max(95, 100 - recentCriticalErrors * 0.5),
      lastIncident: recentCriticalErrors > 0 ? new Date() : prev.lastIncident,
    }));
  };

  const handleNewError = (errorReport: any) => {
    loadMetrics(); // Refresh metrics when new error occurs
  };

  const handleCriticalError = (errorReport: any) => {
    // Show immediate notification for critical errors
    console.warn("Critical error detected:", errorReport);
    loadMetrics();
  };

  const handlePatientSafetyRisk = (errorReport: any) => {
    console.warn("Patient safety risk detected:", errorReport);
    loadMetrics();
  };

  const handleDOHComplianceRisk = (errorReport: any) => {
    console.warn("DOH compliance risk detected:", errorReport);
    loadMetrics();
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "text-green-600 bg-green-100";
      case "warning":
      case "degraded":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
      case "failed":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const exportErrorReport = () => {
    if (!metrics) return;

    const report = {
      timestamp: new Date().toISOString(),
      systemHealth,
      metrics,
      recentErrors: metrics.recentErrors,
      summary: {
        totalErrors: metrics.totalErrors,
        recoveryRate: metrics.errorRecoveryRate,
        criticalHealthcareErrors: metrics.criticalHealthcareErrors,
        dohComplianceErrors: metrics.dohComplianceErrors,
        patientSafetyErrors: metrics.patientSafetyErrors,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-monitoring-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading error monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Error Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time error tracking with healthcare compliance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMetrics} disabled={isLoading} variant="outline">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={exportErrorReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card
        className={`border-2 ${
          systemHealth.overall === "healthy"
            ? "border-green-200 bg-green-50"
            : systemHealth.overall === "warning"
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getHealthIcon(systemHealth.overall)}
            System Health Status
            <Badge className={getHealthColor(systemHealth.overall)}>
              {systemHealth.overall.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth.uptime.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Handling</span>
                <Badge
                  className={getHealthColor(
                    systemHealth.components.errorHandling,
                  )}
                  size="sm"
                >
                  {systemHealth.components.errorHandling}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Sync</span>
                <Badge
                  className={getHealthColor(
                    systemHealth.components.realTimeRefreshCw,
                  )}
                  size="sm"
                >
                  {systemHealth.components.realTimeSync}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">DOH Compliance</span>
                <Badge
                  className={getHealthColor(
                    systemHealth.components.dohCompliance,
                  )}
                  size="sm"
                >
                  {systemHealth.components.dohCompliance}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Patient Safety</span>
                <Badge
                  className={getHealthColor(
                    systemHealth.components.patientSafety,
                  )}
                  size="sm"
                >
                  {systemHealth.components.patientSafety}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Last Updated</div>
              <div className="text-xs text-gray-500">
                {lastUpdated.toLocaleTimeString()}
              </div>
              {systemHealth.lastIncident && (
                <div className="text-xs text-red-500 mt-1">
                  Last incident:{" "}
                  {systemHealth.lastIncident.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Errors
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.totalErrors}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Recovery Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {recoveryMetrics?.recoverySuccessRate?.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  {systemHealthScore}%
                </p>
              </div>
              <Target className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Critical Healthcare
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.criticalHealthcareErrors}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Auto Recoveries
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {recoveryMetrics?.successfulRecoveries || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare-Specific Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Healthcare Error Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Patient Safety Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Safety Errors:</span>
                  <Badge
                    variant={
                      metrics.patientSafetyErrors > 0
                        ? "destructive"
                        : "default"
                    }
                  >
                    {metrics.patientSafetyErrors}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recovery Time:</span>
                  <span className="text-sm">
                    {metrics.averageRecoveryTime?.toFixed(0) || 0}ms
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">DOH Compliance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Compliance Errors:</span>
                  <Badge
                    variant={
                      metrics.dohComplianceErrors > 0
                        ? "destructive"
                        : "default"
                    }
                  >
                    {metrics.dohComplianceErrors}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Audit Trail:</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">System Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Healthcare Errors:</span>
                  <span className="text-sm">{metrics.healthcareErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Error Rate:</span>
                  <span className="text-sm">
                    {metrics.totalErrors > 0
                      ? (
                          (metrics.healthcareErrors / metrics.totalErrors) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.errorsByCategory).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {category === "network" && (
                        <Network className="h-4 w-4" />
                      )}
                      {category === "security" && (
                        <Shield className="h-4 w-4" />
                      )}
                      {category === "system" && (
                        <Database className="h-4 w-4" />
                      )}
                      {category === "validation" && (
                        <FileCheck className="h-4 w-4" />
                      )}
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / metrics.totalErrors) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.errorsBySeverity).map(
                ([severity, count]) => {
                  const severityColors = {
                    low: "bg-green-600",
                    medium: "bg-yellow-600",
                    high: "bg-orange-600",
                    critical: "bg-red-600",
                  };

                  return (
                    <div
                      key={severity}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${severityColors[severity as keyof typeof severityColors]}`}
                        />
                        <span className="capitalize">{severity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${severityColors[severity as keyof typeof severityColors]}`}
                            style={{
                              width: `${(count / metrics.totalErrors) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recovery Metrics */}
      {recoveryMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Enhanced Recovery Analytics
              {isEmergencyMode && (
                <Badge variant="destructive" className="ml-2">
                  EMERGENCY MODE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recoveryMetrics.totalRecoveryAttempts}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recoveryMetrics.successfulRecoveries}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {recoveryMetrics.averageRecoveryTime?.toFixed(0) || 0}ms
                </div>
                <div className="text-sm text-gray-600">Avg Recovery Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recoveryMetrics.healthcareRecoveries}
                </div>
                <div className="text-sm text-gray-600">
                  Healthcare Recoveries
                </div>
              </div>
            </div>

            {/* Recovery Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Recovery Success Rate</span>
                <span>{recoveryMetrics.recoverySuccessRate?.toFixed(1)}%</span>
              </div>
              <Progress
                value={recoveryMetrics.recoverySuccessRate}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-Time Events and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Events
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {realTimeEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No real-time events yet
                </div>
              ) : (
                realTimeEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {event.type.replace(/-/g, " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Recovery Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Recovery Systems Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Failovers:</span>
                <Badge variant="default">{activeFailovers.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-Healing Rules:</span>
                <Badge variant="default">{autoHealingRules.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Mode:</span>
                <Badge variant={isEmergencyMode ? "destructive" : "default"}>
                  {isEmergencyMode ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">WebSocket Connection:</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </Badge>
              </div>

              {/* System Health Score Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>System Health Score</span>
                  <span>{systemHealthScore}%</span>
                </div>
                <Progress
                  value={systemHealthScore}
                  className={`h-2 ${systemHealthScore < 70 ? "bg-red-100" : systemHealthScore < 90 ? "bg-yellow-100" : "bg-green-100"}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentErrors.slice(0, 5).map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      error.severity === "critical"
                        ? "destructive"
                        : error.severity === "high"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {error.severity}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">
                      {error.message.substring(0, 60)}...
                    </div>
                    <div className="text-xs text-gray-500">
                      {error.category} •{" "}
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {error.patientSafetyRisk && (
                    <Heart className="h-4 w-4 text-red-500" />
                  )}
                  {error.dohComplianceRisk && (
                    <FileCheck className="h-4 w-4 text-purple-500" />
                  )}
                  <Badge variant={error.resolved ? "default" : "outline"}>
                    {error.resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorMonitoringDashboard;
