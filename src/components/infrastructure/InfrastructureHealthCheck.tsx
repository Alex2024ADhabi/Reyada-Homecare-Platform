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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  Zap,
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";

interface HealthCheckResult {
  component: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  responseTime: number;
  lastChecked: Date;
  details: {
    message: string;
    metrics?: Record<string, any>;
    recommendations?: string[];
  };
}

interface InfrastructureHealthCheckProps {
  className?: string;
}

const InfrastructureHealthCheck: React.FC<InfrastructureHealthCheckProps> = ({
  className = "",
}) => {
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [overallHealth, setOverallHealth] = useState<
    "healthy" | "warning" | "critical"
  >("healthy");

  const runHealthChecks = async () => {
    setIsRunning(true);
    const startTime = Date.now();

    try {
      // Simulate comprehensive health checks
      const checks: HealthCheckResult[] = [
        {
          component: "Kubernetes Primary Cluster",
          status: "healthy",
          responseTime: Math.random() * 100 + 50,
          lastChecked: new Date(),
          details: {
            message: "All nodes healthy, pods running normally",
            metrics: {
              nodes: 12,
              pods: 45,
              services: 8,
              cpuUtilization: 65,
              memoryUtilization: 72,
            },
            recommendations: [
              "Monitor CPU usage trends",
              "Consider scaling if usage exceeds 80%",
            ],
          },
        },
        {
          component: "Kubernetes DR Cluster",
          status: "healthy",
          responseTime: Math.random() * 150 + 75,
          lastChecked: new Date(),
          details: {
            message: "Disaster recovery cluster ready for failover",
            metrics: {
              nodes: 6,
              pods: 18,
              services: 6,
              replicationLag: 0.5,
            },
          },
        },
        {
          component: "Load Balancer (Primary)",
          status: "healthy",
          responseTime: Math.random() * 80 + 40,
          lastChecked: new Date(),
          details: {
            message: "All targets healthy, optimal response times",
            metrics: {
              healthyTargets: 14,
              totalTargets: 15,
              responseTime: 120,
              throughput: 1250,
            },
          },
        },
        {
          component: "Database Cluster",
          status: Math.random() > 0.8 ? "warning" : "healthy",
          responseTime: Math.random() * 200 + 100,
          lastChecked: new Date(),
          details: {
            message: "Primary database online, replicas synchronized",
            metrics: {
              primaryStatus: "online",
              replicas: 3,
              replicationLag: 0.8,
              connections: 85,
              cpuUsage: 45,
              memoryUsage: 62,
            },
            recommendations: [
              "Monitor connection pool usage",
              "Consider read replica scaling",
            ],
          },
        },
        {
          component: "CDN (CloudFront)",
          status: "healthy",
          responseTime: Math.random() * 60 + 30,
          lastChecked: new Date(),
          details: {
            message: "Global distribution active, high cache hit ratio",
            metrics: {
              distributions: 2,
              cacheHitRatio: 94.5,
              bandwidth: 2.8,
              requests: 125000,
            },
          },
        },
        {
          component: "Monitoring Stack",
          status: "healthy",
          responseTime: Math.random() * 120 + 60,
          lastChecked: new Date(),
          details: {
            message: "All monitoring services operational",
            metrics: {
              cloudWatchAlarms: 45,
              activeAlerts: 3,
              criticalAlerts: 0,
              logVolume: 45.2,
              uptime: 99.97,
            },
          },
        },
        {
          component: "Security Services",
          status: "healthy",
          responseTime: Math.random() * 90 + 45,
          lastChecked: new Date(),
          details: {
            message: "All security services active, no threats detected",
            metrics: {
              guardDutyFindings: 0,
              configRules: 28,
              compliantResources: 156,
              nonCompliantResources: 2,
            },
            recommendations: [
              "Review non-compliant resources",
              "Update security policies",
            ],
          },
        },
        {
          component: "Backup Systems",
          status: "healthy",
          responseTime: Math.random() * 150 + 100,
          lastChecked: new Date(),
          details: {
            message: "Automated backups running successfully",
            metrics: {
              dailyBackups: 7,
              lastBackupTime: "2 hours ago",
              backupSize: "2.4 GB",
              retentionCompliance: 100,
            },
          },
        },
        {
          component: "Network Infrastructure",
          status: "healthy",
          responseTime: Math.random() * 70 + 35,
          lastChecked: new Date(),
          details: {
            message: "Network connectivity optimal across all regions",
            metrics: {
              latencyDubai: 12,
              latencyIreland: 45,
              packetLoss: 0.01,
              bandwidth: "10 Gbps",
            },
          },
        },
      ];

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setHealthChecks(checks);
      setLastRunTime(new Date());

      // Calculate overall health
      const criticalCount = checks.filter(
        (c) => c.status === "critical",
      ).length;
      const warningCount = checks.filter((c) => c.status === "warning").length;

      if (criticalCount > 0) {
        setOverallHealth("critical");
      } else if (warningCount > 0) {
        setOverallHealth("warning");
      } else {
        setOverallHealth("healthy");
      }
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runHealthChecks();
    // Set up periodic health checks every 5 minutes
    const interval = setInterval(runHealthChecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getComponentIcon = (component: string) => {
    if (component.includes("Kubernetes")) return <Server className="h-4 w-4" />;
    if (component.includes("Database")) return <Database className="h-4 w-4" />;
    if (component.includes("Load Balancer"))
      return <Network className="h-4 w-4" />;
    if (component.includes("CDN")) return <Globe className="h-4 w-4" />;
    if (component.includes("Monitoring"))
      return <Activity className="h-4 w-4" />;
    if (component.includes("Security")) return <Shield className="h-4 w-4" />;
    if (component.includes("Backup")) return <HardDrive className="h-4 w-4" />;
    if (component.includes("Network")) return <Network className="h-4 w-4" />;
    return <Server className="h-4 w-4" />;
  };

  const healthyCount = healthChecks.filter(
    (c) => c.status === "healthy",
  ).length;
  const warningCount = healthChecks.filter(
    (c) => c.status === "warning",
  ).length;
  const criticalCount = healthChecks.filter(
    (c) => c.status === "critical",
  ).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Infrastructure Health Check
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive health monitoring across all infrastructure components
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastRunTime && (
            <div className="text-sm text-gray-600">
              Last check: {lastRunTime.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={runHealthChecks} disabled={isRunning} size="sm">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Checking..." : "Run Health Check"}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {getStatusIcon(overallHealth)}
              <span className="ml-2">Overall Infrastructure Health</span>
            </span>
            <Badge className={getStatusColor(overallHealth)}>
              {overallHealth.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {healthyCount}
              </div>
              <div className="text-sm text-gray-600">Healthy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {warningCount}
              </div>
              <div className="text-sm text-gray-600">Warning</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {criticalCount}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
          </div>
          {healthChecks.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Health Score</span>
                <span>
                  {Math.round((healthyCount / healthChecks.length) * 100)}%
                </span>
              </div>
              <Progress
                value={(healthyCount / healthChecks.length) * 100}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Critical Infrastructure Issues
          </AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalCount} critical issue(s) detected. Immediate attention
            required.
          </AlertDescription>
        </Alert>
      )}

      {/* Health Check Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthChecks.map((check, index) => (
          <Card
            key={index}
            className={`border-l-4 ${
              check.status === "healthy"
                ? "border-l-green-500"
                : check.status === "warning"
                  ? "border-l-yellow-500"
                  : check.status === "critical"
                    ? "border-l-red-500"
                    : "border-l-gray-500"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getComponentIcon(check.component)}
                  <CardTitle className="text-sm">{check.component}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(check.status)}
                  <Badge
                    variant="outline"
                    className={getStatusColor(check.status)}
                  >
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">{check.details.message}</p>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Response Time</span>
                <span>{check.responseTime.toFixed(0)}ms</span>
              </div>

              {check.details.metrics && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">
                    Key Metrics:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(check.details.metrics)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {check.details.recommendations &&
                check.details.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">
                      Recommendations:
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {check.details.recommendations
                        .slice(0, 2)
                        .map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

              <div className="text-xs text-gray-500">
                Last checked: {check.lastChecked.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {isRunning && healthChecks.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Running comprehensive health checks...
          </p>
        </div>
      )}
    </div>
  );
};

export default InfrastructureHealthCheck;
