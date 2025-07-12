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
import {
  Activity,
  Database,
  Wifi,
  WifiOff,
  Server,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastContext } from "@/components/ui/toast-provider";
import { performanceMonitor } from "@/services/performance-monitor.service";
import { cacheOptimization } from "@/services/cache-optimization.service";
import { realTimeSyncService } from "@/services/real-time-sync.service";

interface SystemStatusProps {
  className?: string;
  showDetails?: boolean;
}

interface SystemHealth {
  overall: "healthy" | "warning" | "critical";
  database: "connected" | "disconnected" | "error";
  network: "online" | "offline" | "slow";
  cache: "optimal" | "degraded" | "full";
  sync: "active" | "inactive" | "error";
  performance: "good" | "fair" | "poor";
  security: "secure" | "warning" | "vulnerable";
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  className,
  showDetails = false,
}) => {
  const { toast } = useToastContext();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "healthy",
    database: "connected",
    network: "online",
    cache: "optimal",
    sync: "active",
    performance: "good",
    security: "secure",
  });
  const [lastChecked, setLastChecked] = useState(new Date());
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    try {
      // Check network status
      const networkStatus = navigator.onLine ? "online" : "offline";

      // Check cache performance
      const cacheStats = cacheOptimization.getStats();
      const cacheStatus =
        cacheStats.hitRate > 80
          ? "optimal"
          : cacheStats.hitRate > 50
            ? "degraded"
            : "full";

      // Check sync service
      const syncStatus = realTimeSyncService.getConnectionStatus()
        ? "active"
        : "inactive";

      // Check performance metrics
      const performanceReport = performanceMonitor.getReport();
      const performanceStatus =
        performanceReport.alerts.length === 0
          ? "good"
          : performanceReport.alerts.length < 3
            ? "fair"
            : "poor";

      // Simulate database check
      const databaseStatus = "connected"; // In real app, this would be an actual check

      // Simulate security check
      const securityStatus = "secure"; // In real app, this would check for security issues

      // Determine overall health
      const criticalIssues = [
        networkStatus === "offline",
        databaseStatus === "error",
        syncStatus === "error",
        securityStatus === "vulnerable",
      ].filter(Boolean).length;

      const warningIssues = [
        networkStatus === "slow",
        cacheStatus === "degraded",
        performanceStatus === "fair",
        securityStatus === "warning",
      ].filter(Boolean).length;

      const overallStatus =
        criticalIssues > 0
          ? "critical"
          : warningIssues > 0
            ? "warning"
            : "healthy";

      setSystemHealth({
        overall: overallStatus,
        database: databaseStatus,
        network: networkStatus,
        cache: cacheStatus,
        sync: syncStatus,
        performance: performanceStatus,
        security: securityStatus,
      });

      setLastChecked(new Date());

      if (overallStatus === "critical") {
        toast({
          title: "System Health Alert",
          description:
            "Critical system issues detected. Please check system status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking system health:", error);
      toast({
        title: "Health Check Failed",
        description: "Unable to check system health",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
      case "online":
      case "optimal":
      case "active":
      case "good":
      case "secure":
        return "text-green-600 bg-green-100";
      case "warning":
      case "slow":
      case "degraded":
      case "fair":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
      case "disconnected":
      case "offline":
      case "error":
      case "full":
      case "inactive":
      case "poor":
      case "vulnerable":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (component: string, status: string) => {
    const iconClass = "h-4 w-4";

    if (
      status.includes("error") ||
      status === "critical" ||
      status === "offline" ||
      status === "disconnected"
    ) {
      return <AlertCircle className={cn(iconClass, "text-red-500")} />;
    }

    if (
      status === "warning" ||
      status === "degraded" ||
      status === "fair" ||
      status === "slow"
    ) {
      return <AlertCircle className={cn(iconClass, "text-yellow-500")} />;
    }

    return <CheckCircle className={cn(iconClass, "text-green-500")} />;
  };

  const getComponentIcon = (component: string) => {
    const iconClass = "h-4 w-4";
    switch (component) {
      case "database":
        return <Database className={iconClass} />;
      case "network":
        return systemHealth.network === "online" ? (
          <Wifi className={iconClass} />
        ) : (
          <WifiOff className={iconClass} />
        );
      case "cache":
        return <Zap className={iconClass} />;
      case "sync":
        return <RefreshCw className={iconClass} />;
      case "performance":
        return <Activity className={iconClass} />;
      case "security":
        return <Shield className={iconClass} />;
      default:
        return <Server className={iconClass} />;
    }
  };

  if (!showDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {getStatusIcon("overall", systemHealth.overall)}
        <Badge className={getStatusColor(systemHealth.overall)}>
          System {systemHealth.overall}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkSystemHealth}
          disabled={isChecking}
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon("overall", systemHealth.overall)}
              System Health Status
            </CardTitle>
            <CardDescription>
              Last checked: {lastChecked.toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(systemHealth.overall)}>
              {systemHealth.overall.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSystemHealth}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(systemHealth)
            .filter(([key]) => key !== "overall")
            .map(([component, status]) => (
              <div
                key={component}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {getComponentIcon(component)}
                  <span className="font-medium capitalize">
                    {component.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(component, status)}
                  <Badge className={getStatusColor(status)} variant="outline">
                    {status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>System monitoring active - checks every 30 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
