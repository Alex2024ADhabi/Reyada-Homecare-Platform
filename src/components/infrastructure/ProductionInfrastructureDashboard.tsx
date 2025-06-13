import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Database,
  Globe,
  Monitor,
  Server,
  Shield,
  TrendingUp,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  AlertCircle,
  Cpu,
  HardDrive,
  Network,
  Timer,
  GitBranch,
  Rocket,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';

interface InfrastructureMetrics {
  kubernetes: {
    clusters: number;
    nodes: number;
    pods: number;
    services: number;
    health: 'healthy' | 'warning' | 'critical';
  };
  loadBalancing: {
    albs: number;
    targets: number;
    healthyTargets: number;
    responseTime: number;
    throughput: number;
  };
  databases: {
    primary: {
      status: 'online' | 'offline' | 'maintenance';
      cpu: number;
      memory: number;
      connections: number;
    };
    replicas: number;
    backups: number;
  };
  cdn: {
    distributions: number;
    cacheHitRatio: number;
    bandwidth: number;
    requests: number;
  };
  monitoring: {
    alerts: number;
    criticalAlerts: number;
    uptime: number;
    logVolume: number;
  };
}

interface AutoScalingStatus {
  enabled: boolean;
  currentReplicas: number;
  desiredReplicas: number;
  minReplicas: number;
  maxReplicas: number;
  cpuUtilization: number;
  memoryUtilization: number;
}

const ProductionInfrastructureDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<InfrastructureMetrics>({
    kubernetes: {
      clusters: 2,
      nodes: 12,
      pods: 45,
      services: 8,
      health: 'healthy'
    },
    loadBalancing: {
      albs: 3,
      targets: 15,
      healthyTargets: 14,
      responseTime: 120,
      throughput: 1250
    },
    databases: {
      primary: {
        status: 'online',
        cpu: 45,
        memory: 62,
        connections: 85
      },
      replicas: 3,
      backups: 7
    },
    cdn: {
      distributions: 2,
      cacheHitRatio: 94.5,
      bandwidth: 2.8,
      requests: 125000
    },
    monitoring: {
      alerts: 3,
      criticalAlerts: 0,
      uptime: 99.97,
      logVolume: 45.2
    }
  });

  const [autoScaling, setAutoScaling] = useState<AutoScalingStatus>({
    enabled: true,
    currentReplicas: 8,
    desiredReplicas: 8,
    minReplicas: 3,
    maxReplicas: 20,
    cpuUtilization: 65,
    memoryUtilization: 72
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshMetrics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with simulated real-time data
    setMetrics(prev => ({
      ...prev,
      loadBalancing: {
        ...prev.loadBalancing,
        responseTime: Math.floor(Math.random() * 50) + 100,
        throughput: Math.floor(Math.random() * 500) + 1000
      },
      databases: {
        ...prev.databases,
        primary: {
          ...prev.databases.primary,
          cpu: Math.floor(Math.random() * 30) + 40,
          memory: Math.floor(Math.random() * 20) + 55,
          connections: Math.floor(Math.random() * 40) + 70
        }
      }
    }));
    
    setAutoScaling(prev => ({
      ...prev,
      cpuUtilization: Math.floor(Math.random() * 30) + 50,
      memoryUtilization: Math.floor(Math.random() * 25) + 60
    }));
    
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Infrastructure</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive monitoring and management of production infrastructure
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button onClick={refreshMetrics} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Critical Alerts */}
        {metrics.monitoring.criticalAlerts > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Critical Alerts</AlertTitle>
            <AlertDescription className="text-red-700">
              {metrics.monitoring.criticalAlerts} critical alert(s) require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              {getHealthIcon(metrics.kubernetes.health)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{metrics.kubernetes.health}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.kubernetes.pods} pods running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.monitoring.uptime}%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Timer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.loadBalancing.responseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.monitoring.alerts}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.monitoring.criticalAlerts} critical
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="kubernetes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
            <TabsTrigger value="loadbalancing">Load Balancing</TabsTrigger>
            <TabsTrigger value="databases">Database Clustering & Replication</TabsTrigger>
            <TabsTrigger value="cdn">CDN for Static Assets</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring & Logging Infrastructure</TabsTrigger>
            <TabsTrigger value="devops">DevOps & CI/CD</TabsTrigger>
          </TabsList>

          <TabsContent value="kubernetes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Cluster Overview
                  </CardTitle>
                  <CardDescription>
                    Kubernetes cluster status and resources
                  </CardDescription>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Primary Cluster</span>
                          <Badge variant="outline" className="text-green-600">
                            {metrics.kubernetes.nodes} nodes
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Pods: {metrics.kubernetes.pods} | Services: {metrics.kubernetes.services}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>DR Cluster</span>
                          <Badge variant="outline" className="text-blue-600">
                            6 nodes
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Pods: 18 | Services: 6
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Auto-scaling Status</span>
                        <span className="text-green-600">
                          {autoScaling.currentReplicas}/{autoScaling.maxReplicas} replicas
                        </span>
                      </div>
                      <Progress
                        value={(autoScaling.currentReplicas / autoScaling.maxReplicas) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">CPU Utilization:</span>
                        <div className="font-medium">{autoScaling.cpuUtilization}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Memory Utilization:</span>
                        <div className="font-medium">{autoScaling.memoryUtilization}%</div>
                      </div>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loadbalancing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Load Balancing & Auto-scaling
                  </CardTitle>
                  <CardDescription>
                    Multi-region load balancing with intelligent auto-scaling
                  </CardDescription>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Primary ALB (Dubai)</span>
                          <Badge variant="outline" className="text-green-600">
                            Active
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Targets: {metrics.loadBalancing.healthyTargets}/{metrics.loadBalancing.targets}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Secondary ALB (Ireland)</span>
                          <Badge variant="outline" className="text-blue-600">
                            Standby
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Targets: 8/8 | Failover Ready
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span>{metrics.loadBalancing.responseTime}ms</span>
                      </div>
                      <Progress
                        value={Math.min((metrics.loadBalancing.responseTime / 500) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Throughput</span>
                        <span>{metrics.loadBalancing.throughput} req/s</span>
                      </div>
                      <Progress
                        value={Math.min((metrics.loadBalancing.throughput / 2000) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="databases" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Clustering & Replication
                  </CardTitle>
                  <CardDescription>
                    Multi-region database cluster with automated replication
                  </CardDescription>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Primary DB (Dubai)</span>
                          <Badge variant="outline" className="text-green-600">
                            {metrics.databases.primary.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          PostgreSQL 14 | Multi-AZ
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Read Replicas</span>
                          <Badge variant="outline" className="text-blue-600">
                            {metrics.databases.replicas} active
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Cross-region replication
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{metrics.databases.primary.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={metrics.databases.primary.cpu}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>{metrics.databases.primary.memory.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={metrics.databases.primary.memory}
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">Connections:</span>
                        <div className="font-medium">{metrics.databases.primary.connections}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Backups:</span>
                        <div className="font-medium">{metrics.databases.backups}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Replication Lag:</span>
                        <div className="font-medium text-green-600">< 1s</div>
                      </div>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cdn" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    CDN for Static Assets
                  </CardTitle>
                  <CardDescription>
                    Global CloudFront distribution with edge caching
                  </CardDescription>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Distributions</span>
                          <Badge variant="outline" className="text-green-600">
                            {metrics.cdn.distributions} active
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Global edge locations
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cache Hit Ratio</span>
                          <span className="text-green-600">{metrics.cdn.cacheHitRatio}%</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Optimal performance
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cache Performance</span>
                        <span>{metrics.cdn.cacheHitRatio}%</span>
                      </div>
                      <Progress
                        value={metrics.cdn.cacheHitRatio}
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">Bandwidth:</span>
                        <div className="font-medium">{metrics.cdn.bandwidth} GB/h</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Requests:</span>
                        <div className="font-medium">{metrics.cdn.requests.toLocaleString()}/h</div>
                      </div>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="h-5 w-5 mr-2" />
                    Infrastructure Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CloudWatch Metrics</span>
                      <Badge variant="outline" className="text-green-600">Collecting</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Prometheus</span>
                      <Badge variant="outline" className="text-green-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grafana Dashboards</span>
                      <Badge variant="outline" className="text-blue-600">12 active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Custom Metrics</span>
                      <Badge variant="outline" className="text-blue-600">45 configured</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Alert Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SNS Topics</span>
                      <Badge variant="outline" className="text-green-600">8 configured</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PagerDuty Integration</span>
                      <Badge variant="outline" className="text-green-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Slack Notifications</span>
                      <Badge variant="outline" className="text-green-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Alerts</span>
                      <Badge variant="outline" className="text-green-600">Configured</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Centralized Logging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Elasticsearch Cluster</span>
                      <Badge variant="outline" className="text-green-600">3 nodes</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Kibana Dashboard</span>
                      <Badge variant="outline" className="text-green-600">Available</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Log Retention</span>
                      <Badge variant="outline" className="text-blue-600">90 days</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Log Volume</span>
                      <Badge variant="outline" className="text-blue-600">{metrics.monitoring.logVolume} GB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AWS GuardDuty</span>
                      <Badge variant="outline" className="text-green-600">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AWS Config</span>
                      <Badge variant="outline" className="text-green-600">Monitoring</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CloudTrail</span>
                      <Badge variant="outline" className="text-green-600">Logging</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Security Alerts</span>
                      <Badge variant="outline" className="text-green-600">0 active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devops" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GitBranch className="h-5 w-5 mr-2" />
                    Deployment Pipelines
                  </CardTitle>
                  <CardDescription>
                    Automated CI/CD pipelines with multi-stage deployments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Production Pipeline</span>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Last Deploy: 2 hours ago
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Staging Pipeline</span>
                        <Badge variant="outline" className="text-blue-600">
                          <Play className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Stage: Testing (3/5)
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="text-green-600">95.5%</span>
                    </div>
                    <Progress value={95.5} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Deployments Today:</span>
                      <div className="font-medium">12</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Duration:</span>
                      <div className="font-medium">3.2min</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Queue:</span>
                      <div className="font-medium">2</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="h-5 w-5 mr-2" />
                    Environment Management
                  </CardTitle>
                  <CardDescription>
                    Multi-environment deployment and health monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600">
                          Healthy
                        </Badge>
                        <span className="text-xs text-gray-600">v1.2.3</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Staging</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-blue-600">
                          Deploying
                        </Badge>
                        <span className="text-xs text-gray-600">v1.2.4</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Development</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600">
                          Healthy
                        </Badge>
                        <span className="text-xs text-gray-600">v1.3.0-dev</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Testing</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-yellow-600">
                          Maintenance
                        </Badge>
                        <span className="text-xs text-gray-600">v1.2.3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Migrations
                  </CardTitle>
                  <CardDescription>
                    Automated schema migrations with rollback capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Migration v2.1.0</span>
                      <Badge variant="outline" className="text-green-600">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Migration v2.0.9</span>
                      <Badge variant="outline" className="text-blue-600">
                        Running
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Migration v2.0.8</span>
                      <Badge variant="outline" className="text-gray-600">
                        Pending
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <div className="font-medium text-green-600">24</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending:</span>
                      <div className="font-medium text-blue-600">3</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Rollback Procedures
                  </CardTitle>
                  <CardDescription>
                    Automated rollback with health monitoring triggers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production Rollback</span>
                      <Badge variant="outline" className="text-green-600">
                        Ready
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Staging Rollback</span>
                      <Badge variant="outline" className="text-green-600">
                        Ready
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Auto-Rollback</span>
                      <Badge variant="outline" className="text-blue-600">
                        Enabled
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rollback Readiness</span>
                      <span className="text-green-600">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Available Plans:</span>
                      <div className="font-medium">4</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Executed:</span>
                      <div className="font-medium">Never</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Health Checks & Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time health monitoring across all environments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Production Health</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>API Gateway</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Database</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Frontend</span>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Response Times</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>API</span>
                          <span className="text-green-600">245ms</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Database</span>
                          <span className="text-green-600">12ms</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Frontend</span>
                          <span className="text-green-600">180ms</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Monitoring Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Uptime</span>
                          <span className="text-green-600">99.97%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Error Rate</span>
                          <span className="text-green-600">0.02%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Alerts</span>
                          <span className="text-green-600">0 Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductionInfrastructureDashboard;