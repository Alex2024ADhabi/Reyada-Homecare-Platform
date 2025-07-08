import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  RefreshCw, 
  Server, 
  Shield, 
  Zap,
  Database,
  Globe,
  Users,
  Clock
} from "lucide-react";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface HealthMetrics {
  overallHealth: "healthy" | "degraded" | "unhealthy";
  services: ServiceHealth[];
  systemMetrics: SystemMetrics;
  activeUsers: number;
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
}

const MasterHealthDashboard: React.FC<{ className?: string }> = ({ 
  className = "" 
}) => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockMetrics: HealthMetrics = {
      overallHealth: "healthy",
      services: [
        {
          name: "API Gateway",
          status: "healthy",
          uptime: 99.9,
          responseTime: 45,
          errorRate: 0.1,
          lastCheck: new Date()
        },
        {
          name: "Database",
          status: "healthy",
          uptime: 99.8,
          responseTime: 12,
          errorRate: 0.0,
          lastCheck: new Date()
        },
        {
          name: "Authentication Service",
          status: "healthy",
          uptime: 99.9,
          responseTime: 23,
          errorRate: 0.2,
          lastCheck: new Date()
        },
        {
          name: "DOH Compliance Engine",
          status: "degraded",
          uptime: 98.5,
          responseTime: 156,
          errorRate: 1.2,
          lastCheck: new Date()
        },
        {
          name: "Real-time Sync",
          status: "healthy",
          uptime: 99.7,
          responseTime: 78,
          errorRate: 0.3,
          lastCheck: new Date()
        },
        {
          name: "File Storage",
          status: "healthy",
          uptime: 99.9,
          responseTime: 34,
          errorRate: 0.1,
          lastCheck: new Date()
        }
      ],
      systemMetrics: {
        cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
        memory: Math.floor(Math.random() * 40) + 40, // 40-80%
        disk: Math.floor(Math.random() * 20) + 30, // 30-50%
        network: Math.floor(Math.random() * 50) + 10 // 10-60%
      },
      activeUsers: Math.floor(Math.random() * 200) + 150,
      totalRequests: Math.floor(Math.random() * 10000) + 25000,
      avgResponseTime: Math.floor(Math.random() * 50) + 45,
      errorRate: Math.random() * 0.5,
      uptime: 99.2
    };
    
    setMetrics(mockMetrics);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!metrics) {
    return (
      <div className={`bg-white p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading health metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className={`h-8 w-8 ${getHealthColor(metrics.overallHealth)}`} />
            Master Health Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time platform health monitoring and system metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button 
            onClick={refreshMetrics} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getHealthIcon(metrics.overallHealth)}
              Overall Platform Health
            </span>
            <Badge className={getHealthBadgeColor(metrics.overallHealth)}>
              {metrics.overallHealth.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            System uptime: {metrics.uptime}% | Active users: {metrics.activeUsers}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalRequests.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.avgResponseTime}ms</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.errorRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.uptime}%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      {getHealthIcon(service.status)}
                      {service.name}
                    </span>
                    <Badge className={getHealthBadgeColor(service.status)}>
                      {service.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Last check: {service.lastCheck.toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="font-semibold">{service.uptime}%</span>
                    </div>
                    <Progress value={service.uptime} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Response Time</div>
                        <div className="font-semibold">{service.responseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Error Rate</div>
                        <div className="font-semibold">{service.errorRate}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.systemMetrics.cpu}%</div>
                <Progress value={metrics.systemMetrics.cpu} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.systemMetrics.cpu < 70 ? "Normal" : "High"} usage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.systemMetrics.memory}%</div>
                <Progress value={