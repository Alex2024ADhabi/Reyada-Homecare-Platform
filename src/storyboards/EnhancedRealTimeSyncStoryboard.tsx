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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Shield,
  Users,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Stethoscope,
  FileText,
} from "lucide-react";

export default function EnhancedRealTimeSyncStoryboard() {
  const [syncStats, setSyncStats] = useState({
    isConnected: true,
    totalEvents: 1247,
    successfulSyncs: 1198,
    failedSyncs: 12,
    conflictsResolved: 37,
    averageLatency: 145,
    subscriptionCount: 23,
    offlineQueueSize: 0,
    lastSyncTime: new Date(),
  });

  const [complianceMetrics, setComplianceMetrics] = useState({
    dohCompliant: 98.5,
    hipaaCompliant: 99.2,
    jawdaCompliant: 97.8,
    encryptedData: 100,
    auditTrailComplete: 99.8,
  });

  const [criticalEvents, setCriticalEvents] = useState([
    {
      id: "evt_001",
      type: "vital_signs",
      patientId: "PAT_12345",
      priority: "critical",
      status: "synced",
      timestamp: new Date(Date.now() - 30000),
      data: "Blood Pressure: 180/110 mmHg",
    },
    {
      id: "evt_002",
      type: "medication",
      patientId: "PAT_67890",
      priority: "high",
      status: "pending",
      timestamp: new Date(Date.now() - 45000),
      data: "Insulin dosage adjustment",
    },
    {
      id: "evt_003",
      type: "assessment",
      patientId: "PAT_11111",
      priority: "medium",
      status: "conflict",
      timestamp: new Date(Date.now() - 60000),
      data: "Fall risk assessment update",
    },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setSyncStats((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 3),
        successfulSyncs: prev.successfulSyncs + Math.floor(Math.random() * 3),
        averageLatency: 120 + Math.floor(Math.random() * 50),
        lastSyncTime: new Date(),
      }));

      // Simulate compliance fluctuations
      setComplianceMetrics((prev) => ({
        ...prev,
        dohCompliant: Math.max(
          95,
          Math.min(100, prev.dohCompliant + (Math.random() - 0.5) * 2),
        ),
        hipaaCompliant: Math.max(
          95,
          Math.min(100, prev.hipaaCompliant + (Math.random() - 0.5) * 1),
        ),
        jawdaCompliant: Math.max(
          95,
          Math.min(100, prev.jawdaCompliant + (Math.random() - 0.5) * 1.5),
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const simulateEmergencySync = () => {
    setIsSimulating(true);
    const newEvent = {
      id: `evt_${Date.now()}`,
      type: "emergency",
      patientId: "PAT_EMRG",
      priority: "critical" as const,
      status: "syncing" as const,
      timestamp: new Date(),
      data: "Cardiac arrest - immediate response required",
    };

    setCriticalEvents((prev) => [newEvent, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setCriticalEvents((prev) =>
        prev.map((event) =>
          event.id === newEvent.id
            ? { ...event, status: "synced" as const }
            : event,
        ),
      );
      setIsSimulating(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "syncing":
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-black",
      low: "bg-green-500 text-white",
    };
    return variants[priority] || "bg-gray-500 text-white";
  };

  const successRate =
    syncStats.totalEvents > 0
      ? ((syncStats.successfulSyncs / syncStats.totalEvents) * 100).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-blue-600" />
            Enhanced Real-Time Sync Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Healthcare-compliant real-time data synchronization with advanced
            monitoring
          </p>
        </div>

        {/* Connection Status */}
        <Alert
          className={
            syncStats.isConnected
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <div className="flex items-center gap-2">
            {syncStats.isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription
              className={
                syncStats.isConnected ? "text-green-800" : "text-red-800"
              }
            >
              {syncStats.isConnected
                ? `Connected to healthcare sync service - Last sync: ${syncStats.lastSyncTime.toLocaleTimeString()}`
                : "Disconnected - Operating in offline mode"}
            </AlertDescription>
          </div>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {successRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {syncStats.successfulSyncs} of {syncStats.totalEvents} events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Latency
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {syncStats.averageLatency}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {syncStats.subscriptionCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Healthcare providers connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conflicts Resolved
              </CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {syncStats.conflictsResolved}
              </div>
              <p className="text-xs text-muted-foreground">
                Automatic conflict resolution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Healthcare Compliance Metrics
            </CardTitle>
            <CardDescription>
              Real-time monitoring of DOH, HIPAA, and JAWDA compliance standards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">DOH Compliance</span>
                  <span className="text-sm text-muted-foreground">
                    {complianceMetrics.dohCompliant.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={complianceMetrics.dohCompliant}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">HIPAA Compliance</span>
                  <span className="text-sm text-muted-foreground">
                    {complianceMetrics.hipaaCompliant.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={complianceMetrics.hipaaCompliant}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">JAWDA Compliance</span>
                  <span className="text-sm text-muted-foreground">
                    {complianceMetrics.jawdaCompliant.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={complianceMetrics.jawdaCompliant}
                  className="h-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Data Encryption</span>
                  <span className="text-sm text-muted-foreground">
                    {complianceMetrics.encryptedData}%
                  </span>
                </div>
                <Progress
                  value={complianceMetrics.encryptedData}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Audit Trail</span>
                  <span className="text-sm text-muted-foreground">
                    {complianceMetrics.auditTrailComplete}%
                  </span>
                </div>
                <Progress
                  value={complianceMetrics.auditTrailComplete}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Critical Healthcare Events
              </CardTitle>
              <CardDescription>
                Real-time monitoring of high-priority patient data
                synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criticalEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.patientId}</span>
                        <Badge className={getPriorityBadge(event.priority)}>
                          {event.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.data}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Sync Operations
              </CardTitle>
              <CardDescription>
                Healthcare data synchronization controls and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Stethoscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-muted-foreground">
                    Clinical Records
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-muted-foreground">
                    Assessments
                  </div>
                </div>
              </div>

              <Button
                onClick={simulateEmergencySync}
                disabled={isSimulating}
                className="w-full"
                variant={isSimulating ? "secondary" : "destructive"}
              >
                {isSimulating ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Processing Emergency Sync...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Simulate Emergency Sync
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                Emergency sync bypasses normal queuing for critical patient data
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Enhanced Real-Time Sync Service - Healthcare Compliant • DOH • HIPAA •
          JAWDA
        </div>
      </div>
    </div>
  );
}
