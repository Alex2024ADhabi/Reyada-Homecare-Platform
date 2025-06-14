import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Wifi,
  Shield,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { environmentValidator } from "@/utils/environment-validator";

interface HealthMetric {
  name: string;
  status: "healthy" | "warning" | "error" | "unknown";
  value?: string | number;
  description: string;
  lastChecked: string;
}

interface PlatformHealthMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PlatformHealthMonitor: React.FC<PlatformHealthMonitorProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [overallHealth, setOverallHealth] = useState<
    "healthy" | "warning" | "error"
  >("unknown");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    checkPlatformHealth();

    if (autoRefresh) {
      const interval = setInterval(checkPlatformHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const checkPlatformHealth = async () => {
    setLoading(true);
    try {
      const metrics: HealthMetric[] = [];
      const now = new Date().toISOString();

      // Environment Configuration Health
      const envStatus = environmentValidator.getStatusReport();
      metrics.push({
        name: "Environment Configuration",
        status:
          envStatus.status === "healthy"
            ? "healthy"
            : envStatus.status === "warning"
              ? "warning"
              : "error",
        description: envStatus.message,
        lastChecked: now,
      });

      // Network Connectivity
      const networkStatus = navigator.onLine ? "healthy" : "error";
      metrics.push({
        name: "Network Connectivity",
        status: networkStatus,
        description: navigator.onLine ? "Online" : "Offline",
        lastChecked: now,
      });

      // Local Storage Health
      const storageHealth = checkLocalStorageHealth();
      metrics.push({
        name: "Local Storage",
        status: storageHealth.status,
        value: storageHealth.usage,
        description: storageHealth.description,
        lastChecked: now,
      });

      // Service Worker Status
      const swStatus = await checkServiceWorkerHealth();
      metrics.push({
        name: "Service Worker",
        status: swStatus.status,
        description: swStatus.description,
        lastChecked: now,
      });

      // Database Connection (IndexedDB)
      const dbStatus = await checkDatabaseHealth();
      metrics.push({
        name: "Offline Database",
        status: dbStatus.status,
        description: dbStatus.description,
        lastChecked: now,
      });

      // Mobile Capabilities
      const mobileStatus = checkMobileCapabilities();
      metrics.push({
        name: "Mobile Features",
        status: mobileStatus.status,
        value: `${mobileStatus.supportedFeatures}/${mobileStatus.totalFeatures}`,
        description: mobileStatus.description,
        lastChecked: now,
      });

      // Security Features
      const securityStatus = checkSecurityFeatures();
      metrics.push({
        name: "Security Features",
        status: securityStatus.status,
        description: securityStatus.description,
        lastChecked: now,
      });

      setHealthMetrics(metrics);

      // Calculate overall health
      const errorCount = metrics.filter((m) => m.status === "error").length;
      const warningCount = metrics.filter((m) => m.status === "warning").length;

      if (errorCount > 0) {
        setOverallHealth("error");
      } else if (warningCount > 0) {
        setOverallHealth("warning");
      } else {
        setOverallHealth("healthy");
      }

      setLastUpdate(now);
    } catch (error) {
      console.error("Health check failed:", error);
      setOverallHealth("error");
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorageHealth = () => {
    try {
      const testKey = "health_check_test";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      // Estimate storage usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }

      const usageMB = (totalSize / 1024 / 1024).toFixed(2);

      return {
        status: totalSize > 5 * 1024 * 1024 ? "warning" : ("healthy" as const), // 5MB warning
        usage: `${usageMB} MB`,
        description: `Storage usage: ${usageMB} MB`,
      };
    } catch (error) {
      return {
        status: "error" as const,
        usage: "Unknown",
        description: "Local storage access failed",
      };
    }
  };

  const checkServiceWorkerHealth = async () => {
    if (!("serviceWorker" in navigator)) {
      return {
        status: "warning" as const,
        description: "Service Worker not supported",
      };
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return {
          status: "healthy" as const,
          description: "Service Worker active",
        };
      } else {
        return {
          status: "warning" as const,
          description: "Service Worker not registered",
        };
      }
    } catch (error) {
      return {
        status: "error" as const,
        description: "Service Worker check failed",
      };
    }
  };

  const checkDatabaseHealth = async () => {
    if (!("indexedDB" in window)) {
      return {
        status: "error" as const,
        description: "IndexedDB not supported",
      };
    }

    try {
      // Try to open a test database
      const request = indexedDB.open("health_check_db", 1);

      return new Promise<{
        status: "healthy" | "warning" | "error";
        description: string;
      }>((resolve) => {
        request.onsuccess = () => {
          request.result.close();
          indexedDB.deleteDatabase("health_check_db");
          resolve({
            status: "healthy",
            description: "IndexedDB operational",
          });
        };

        request.onerror = () => {
          resolve({
            status: "error",
            description: "IndexedDB access failed",
          });
        };

        setTimeout(() => {
          resolve({
            status: "warning",
            description: "IndexedDB check timeout",
          });
        }, 5000);
      });
    } catch (error) {
      return {
        status: "error" as const,
        description: "IndexedDB check failed",
      };
    }
  };

  const checkMobileCapabilities = () => {
    const capabilities = {
      touchSupport: "ontouchstart" in window,
      geolocation: "geolocation" in navigator,
      camera:
        "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices,
      notifications: "Notification" in window,
      vibration: "vibrate" in navigator,
      orientation: "orientation" in screen,
    };

    const supportedFeatures =
      Object.values(capabilities).filter(Boolean).length;
    const totalFeatures = Object.keys(capabilities).length;

    const status =
      supportedFeatures >= totalFeatures * 0.8
        ? "healthy"
        : supportedFeatures >= totalFeatures * 0.5
          ? "warning"
          : "error";

    return {
      status: status as const,
      supportedFeatures,
      totalFeatures,
      description: `${supportedFeatures}/${totalFeatures} mobile features supported`,
    };
  };

  const checkSecurityFeatures = () => {
    const securityFeatures = {
      https: location.protocol === "https:",
      crypto: "crypto" in window && "subtle" in window.crypto,
      csp:
        document.querySelector('meta[http-equiv="Content-Security-Policy"]') !==
        null,
      secureContext: window.isSecureContext,
    };

    const enabledFeatures =
      Object.values(securityFeatures).filter(Boolean).length;
    const totalFeatures = Object.keys(securityFeatures).length;

    const status =
      enabledFeatures >= totalFeatures * 0.8
        ? "healthy"
        : enabledFeatures >= totalFeatures * 0.5
          ? "warning"
          : "error";

    return {
      status: status as const,
      description: `${enabledFeatures}/${totalFeatures} security features enabled`,
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getOverallHealthScore = () => {
    const healthyCount = healthMetrics.filter(
      (m) => m.status === "healthy",
    ).length;
    const totalCount = healthMetrics.length;
    return totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Platform Health Monitor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring of platform components and services
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  overallHealth === "healthy"
                    ? "default"
                    : overallHealth === "warning"
                      ? "secondary"
                      : "destructive"
                }
              >
                {overallHealth.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={checkPlatformHealth}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
                />
                {loading ? "Checking..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Health Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Health Score</span>
              <span
                className={cn(
                  "text-sm font-bold",
                  getStatusColor(overallHealth),
                )}
              >
                {getOverallHealthScore()}%
              </span>
            </div>
            <Progress value={getOverallHealthScore()} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              Last updated:{" "}
              {lastUpdate ? new Date(lastUpdate).toLocaleString() : "Never"}
            </p>
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthMetrics.map((metric, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  {metric.value && (
                    <Badge variant="outline" className="text-xs">
                      {metric.value}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {metric.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Checked: {new Date(metric.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>

          {/* Health Alerts */}
          {overallHealth !== "healthy" && (
            <div className="mt-6">
              <Alert
                variant={
                  overallHealth === "warning" ? "default" : "destructive"
                }
              >
                {overallHealth === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {overallHealth === "warning"
                    ? "Some platform components need attention. Review the warnings above."
                    : "Critical platform issues detected. Immediate attention required."}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformHealthMonitor;
