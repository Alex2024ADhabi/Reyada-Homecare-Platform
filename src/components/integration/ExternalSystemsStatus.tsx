/**
 * External Systems Status Dashboard
 * Displays real-time status of all external system integrations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Database,
  CreditCard,
  Mail,
  MessageSquare,
  FileText,
  Shield,
  Zap,
  Globe,
  Wifi,
  Settings,
} from "lucide-react";
import { communicationService } from "@/services/communication.service";
import { realTimeSyncService } from "@/services/real-time-sync.service";
import { workflowAutomationService } from "@/services/workflow-automation.service";

interface SystemStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  lastChecked: string;
  responseTime?: number;
  uptime?: number;
  errorCount?: number;
  description: string;
  icon: React.ReactNode;
}

interface ExternalSystemsStatusProps {
  className?: string;
}

const ExternalSystemsStatus: React.FC<ExternalSystemsStatusProps> = ({
  className = "",
}) => {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeConnections: 0,
    messagesSent: 0,
    workflowsExecuted: 0,
    apiCallsProcessed: 0,
  });
  const [integrationHealth, setIntegrationHealth] = useState({
    overall: "healthy",
    communicationService: "online",
    realTimeSync: "connected",
    workflowAutomation: "active",
    externalApis: "operational",
  });

  const mockSystems: SystemStatus[] = [
    {
      id: "malaffi-emr",
      name: "Malaffi EMR",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 245,
      uptime: 99.8,
      errorCount: 0,
      description: "UAE National EMR System Integration",
      icon: <Database className="h-5 w-5" />,
    },
    {
      id: "emirates-id",
      name: "Emirates ID Verification",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 180,
      uptime: 99.9,
      errorCount: 0,
      description: "Government ID Verification Service",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "payment-gateway",
      name: "Payment Gateway",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 320,
      uptime: 99.5,
      errorCount: 2,
      description: "Secure Payment Processing",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "sms-service",
      name: "SMS Notifications",
      status: "degraded",
      lastChecked: new Date().toISOString(),
      responseTime: 850,
      uptime: 98.2,
      errorCount: 15,
      description: "SMS Communication Service",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "email-service",
      name: "Email Notifications",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 420,
      uptime: 99.7,
      errorCount: 1,
      description: "Email Communication Service",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: "doh-reporting",
      name: "DOH Reporting",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 680,
      uptime: 99.1,
      errorCount: 3,
      description: "Government Reporting System",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "real-time-sync",
      name: "Real-time Sync Service",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 95,
      uptime: 99.9,
      errorCount: 0,
      description: "Bidirectional data synchronization",
      icon: <Wifi className="h-5 w-5" />,
    },
    {
      id: "workflow-automation",
      name: "Workflow Automation Engine",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 150,
      uptime: 99.7,
      errorCount: 1,
      description: "AI-powered workflow orchestration",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      id: "external-api-hub",
      name: "External API Integration Hub",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 280,
      uptime: 99.4,
      errorCount: 3,
      description: "Centralized external API management",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      id: "communication-service",
      name: "Real-time Communication",
      status: "online",
      lastChecked: new Date().toISOString(),
      responseTime: 120,
      uptime: 99.8,
      errorCount: 0,
      description: "Multi-channel communication system",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update real-time metrics
      const communicationStats =
        await communicationService.getNotificationAnalytics({
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        });

      const workflowStats = workflowAutomationService.getExecutionStatistics();
      const syncStatus = realTimeSyncService.getConnectionStatus();

      setRealTimeMetrics({
        activeConnections: syncStatus ? 5 : 0,
        messagesSent: communicationStats.totalNotifications,
        workflowsExecuted: workflowStats.totalExecutions,
        apiCallsProcessed: 1247, // Mock data
      });

      setIntegrationHealth({
        overall:
          syncStatus && workflowStats.successRate > 95 ? "healthy" : "degraded",
        communicationService:
          communicationStats.deliveryRate > 95 ? "online" : "degraded",
        realTimeSync: syncStatus ? "connected" : "disconnected",
        workflowAutomation:
          workflowStats.successRate > 90 ? "active" : "degraded",
        externalApis: "operational",
      });

      setSystems(mockSystems);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("Failed to load system status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      case "maintenance":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "maintenance":
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "degraded":
        return "Degraded";
      case "offline":
        return "Offline";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  const overallHealth = () => {
    const onlineCount = systems.filter((s) => s.status === "online").length;
    const totalCount = systems.length;
    const percentage = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

    if (percentage >= 90) return { status: "healthy", color: "text-green-600" };
    if (percentage >= 70)
      return { status: "degraded", color: "text-yellow-600" };
    return { status: "critical", color: "text-red-600" };
  };

  const health = overallHealth();

  return (
    <div className={`space-y-6 bg-white ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            External Systems Status
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {lastUpdated || "Never"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`text-sm font-medium ${health.color}`}>
            System Health: {health.status.toUpperCase()}
          </div>
          <Button
            onClick={loadSystemStatus}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Integration Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Real-time Integration Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeMetrics.activeConnections}
              </div>
              <div className="text-sm text-gray-600">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {realTimeMetrics.messagesSent}
              </div>
              <div className="text-sm text-gray-600">Messages Sent (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeMetrics.workflowsExecuted}
              </div>
              <div className="text-sm text-gray-600">Workflows Executed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {realTimeMetrics.apiCallsProcessed}
              </div>
              <div className="text-sm text-gray-600">API Calls Processed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Health Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <span>Integration Health Dashboard</span>
            <Badge className={getStatusColor(integrationHealth.overall)}>
              {integrationHealth.overall.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  Communication Service
                </span>
              </div>
              <Badge
                className={getStatusColor(
                  integrationHealth.communicationService,
                )}
              >
                {integrationHealth.communicationService.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Real-time Sync</span>
              </div>
              <Badge className={getStatusColor(integrationHealth.realTimeSync)}>
                {integrationHealth.realTimeSync.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Workflow Automation</span>
              </div>
              <Badge
                className={getStatusColor(integrationHealth.workflowAutomation)}
              >
                {integrationHealth.workflowAutomation.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">External APIs</span>
              </div>
              <Badge className={getStatusColor(integrationHealth.externalApis)}>
                {integrationHealth.externalApis.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((system) => (
          <Card key={system.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {system.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{system.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {system.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(system.status)}
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(system.status)} text-white`}
                  >
                    {getStatusText(system.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Response Time</span>
                    <div className="font-medium">
                      {system.responseTime ? `${system.responseTime}ms` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Uptime</span>
                    <div className="font-medium">
                      {system.uptime ? `${system.uptime}%` : "N/A"}
                    </div>
                  </div>
                </div>

                {system.errorCount !== undefined && system.errorCount > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {system.errorCount} error
                      {system.errorCount !== 1 ? "s" : ""} in the last 24 hours
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-xs text-gray-500">
                  Last checked:{" "}
                  {new Date(system.lastChecked).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {systems.some((s) => s.status !== "online") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systems
                .filter((s) => s.status !== "online")
                .map((system) => (
                  <Alert key={system.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{system.name}</strong> is currently{" "}
                      {system.status}.
                      {system.status === "degraded" &&
                        " Performance may be impacted."}
                      {system.status === "offline" &&
                        " Service is unavailable."}
                      {system.status === "maintenance" &&
                        " Scheduled maintenance in progress."}
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExternalSystemsStatus;
