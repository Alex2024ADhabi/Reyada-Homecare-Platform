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
} from "lucide-react";

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
