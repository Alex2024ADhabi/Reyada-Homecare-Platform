import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Shield,
  FileCheck,
  Activity,
  BarChart3,
  RefreshCw,
  Settings,
  TestTube,
  Bug,
  TrendingUp,
  Award,
  Database,
  Server,
  Users,
  Heart,
  AlertCircle,
  Eye,
  Cpu,
  HardDrive,
  Network,
  Lock,
  FileText,
  Bell,
  Download,
  Upload,
  Monitor,
  Gauge,
  LineChart,
  PieChart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";

interface TestSuite {
  name: string;
  status: "PASSED" | "FAILED" | "RUNNING" | "PENDING";
  coverage: number;
  duration: number;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface ProductionService {
  id: string;
  name: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "OFFLINE";
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastCheck: Date;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

interface IncidentAlert {
  id: string;
  type: "PATIENT_FALL" | "MEDICATION_ERROR" | "INFECTION" | "SYSTEM_ERROR";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  patientId?: string;
  location?: string;
}

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "UP" | "DOWN" | "STABLE";
  status: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
  lastUpdated: Date;
}

interface ComprehensiveTestingAutomationDashboardProps {
  className?: string;
}

export function ComprehensiveTestingAutomationDashboard({
  className = "",
}: ComprehensiveTestingAutomationDashboardProps) {
  const [activeTab, setActiveTab] = useState("production");
  const [realTimeData, setRealTimeData] = useState({
    totalPatients: 1247,
    activeIncidents: 3,
    systemHealth: 98.7,
    complianceScore: 99.2,
  });

  // Production Services State
  const [productionServices, setProductionServices] = useState<ProductionService[]>([
    {
      id: "incident-detection",
      name: "Patient Safety Incident Detection",
      status: "HEALTHY",
      uptime: 99.98,
      responseTime: 45,
      errorRate: 0.001,
      throughput: 1250,
      lastCheck: new Date(),
      metrics: { cpu: 15, memory: 42, disk: 23, network: 8 },
    },
    {
      id: "quality-metrics",
      name: "Real-Time Quality Metrics",
      status: "HEALTHY",
      uptime: 99.95,
      responseTime: 32,
      errorRate: 0.002,
      throughput: 890,
      lastCheck: new Date(),
      metrics: { cpu: 12, memory: 38, disk: 19, network: 6 },
    },
    {
      id: "redis-cache",
      name: "Redis Cache Service",
      status: "HEALTHY",
      uptime: 99.99,
      responseTime: 2,
      errorRate: 0.0001,
      throughput: 15000,
      lastCheck: new Date(),
      metrics: { cpu: 8, memory: 65, disk: 12, network: 25 },
    },
    {
      id: "doh-compliance",
      name: "DOH Compliance Engine",
      status: "HEALTHY",
      uptime: 99.92,
      responseTime: 78,
      errorRate: 0.003,
      throughput: 450,
      lastCheck: new Date(),
      metrics: { cpu: 22, memory: 55, disk: 31, network: 12 },
    },
  ]);

  // Incident Alerts State
  const [incidentAlerts, setIncidentAlerts] = useState<IncidentAlert[]>([
    {
      id: "INC_001",
      type: "PATIENT_FALL",
      severity: "HIGH",
      message: "Patient fall detected in Room 204 - immediate assessment required",
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false,
      patientId: "P001247",
      location: "Room 204",
    },
    {
      id: "INC_002",
      type: "MEDICATION_ERROR",
      severity: "MEDIUM",
      message: "Dosage variance detected - 15% above prescribed amount",
      timestamp: new Date(Date.now() - 600000),
      acknowledged: true,
      patientId: "P001156",
      location: "Room 156",
    },
    {
      id: "INC_003",
      type: "SYSTEM_ERROR",
      severity: "LOW",
      message: "Temporary connection timeout to external lab system",
      timestamp: new Date(Date.now() - 900000),
      acknowledged: true,
    },
  ]);

  // Quality Metrics State
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
    {
      id: "fall-rate",
      name: "Patient Fall Rate",
      value: 2.1,
      target: 2.5,
      unit: "per 1000 days",
      trend: "DOWN",
      status: "EXCELLENT",
      lastUpdated: new Date(),
    },
    {
      id: "medication-errors",
      name: "Medication Error Rate",
      value: 1.3,
      target: 1.5,
      unit: "per 1000 doses",
      trend: "STABLE",
      status: "GOOD",
      lastUpdated: new Date(),
    },
    {
      id: "readmission-rate",
      name: "30-Day Readmission Rate",
      value: 7.8,
      target: 8.5,
      unit: "%",
      trend: "DOWN",
      status: "EXCELLENT",
      lastUpdated: new Date(),
    },
    {
      id: "satisfaction-score",
      name: "Patient Satisfaction",
      value: 4.3,
      target: 4.0,
      unit: "out of 5",
      trend: "UP",
      status: "EXCELLENT",
      lastUpdated: new Date(),
    },
  ]);

  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: "Unit Tests",
      status: "PASSED",
      coverage: 100,
      duration: 45,
      tests: 1247,
      passed: 1247,
      failed: 0,
      skipped: 0,
    },
    {
      name: "Integration Tests",
      status: "PASSED",
      coverage: 98,
      duration: 120,
      tests: 456,
      passed: 456,
      failed: 0,
      skipped: 0,
    },
    {
      name: "End-to-End Tests",
      status: "PASSED",
      coverage: 95,
      duration: 180,
      tests: 234,
      passed: 234,
      failed: 0,
      skipped: 0,
    },
    {
      name: "Performance Tests",
      status: "PASSED",
      coverage: 100,
      duration: 90,
      tests: 89,
      passed: 89,
      failed: 0,
      skipped: 0,
    },
    {
      name: "Security Tests",
      status: "PASSED",
      coverage: 100,
      duration: 75,
      tests: 156,
      passed: 156,
      failed: 0,
      skipped: 0,
    },
    {
      name: "Compliance Tests",
      status: "PASSED",
      coverage: 100,
      duration: 60,
      tests: 78,
      passed: 78,
      failed: 0,
      skipped: 0,
    },
    {
      name: "Accessibility Tests",
      status: "PASSED",
      coverage: 100,
      duration: 30,
      tests: 45,
      passed: 45,
      failed: 0,
      skipped: 0,
    },
    {
      name: "Load Tests",
      status: "PASSED",
      coverage: 100,
      duration: 300,
      tests: 25,
      passed: 25,
      failed: 0,
      skipped: 0,
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(new Date());
  const [autoRun, setAutoRun] = useState(true);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update real-time metrics
      setRealTimeData(prev => ({
        ...prev,
        totalPatients: prev.totalPatients + Math.floor(Math.random() * 3) - 1,
        systemHealth: Math.max(95, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 0.5)),
        complianceScore: Math.max(95, Math.min(100, prev.complianceScore + (Math.random() - 0.5) * 0.3)),
      }));

      // Update service metrics
      setProductionServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(1, service.responseTime + (Math.random() - 0.5) * 10),
        throughput: Math.max(0, service.throughput + (Math.random() - 0.5) * 100),
        metrics: {
          cpu: Math.max(0, Math.min(100, service.metrics.cpu + (Math.random() - 0.5) * 5)),
          memory: Math.max(0, Math.min(100, service.metrics.memory + (Math.random() - 0.5) * 3)),
          disk: Math.max(0, Math.min(100, service.metrics.disk + (Math.random() - 0.5) * 2)),
          network: Math.max(0, Math.min(100, service.metrics.network + (Math.random() - 0.5) * 8)),
        },
        lastCheck: new Date(),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);
  const totalSkipped = testSuites.reduce(
    (sum, suite) => sum + suite.skipped,
    0,
  );
  const overallCoverage = Math.round(
    testSuites.reduce((sum, suite) => sum + suite.coverage, 0) /
      testSuites.length,
  );
  const totalDuration = testSuites.reduce(
    (sum, suite) => sum + suite.duration,
    0,
  );

  const runAllTests = async () => {
    setIsRunning(true);
    // Simulate test execution
    for (let i = 0; i < testSuites.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTestSuites((prev) =>
        prev.map((suite, index) =>
          index === i ? { ...suite, status: "RUNNING" as const } : suite,
        ),
      );
    }

    // Complete all tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTestSuites((prev) =>
      prev.map((suite) => ({ ...suite, status: "PASSED" as const })),
    );
    setLastRun(new Date());
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "text-green-600 bg-green-100";
      case "FAILED":
        return "text-red-600 bg-red-100";
      case "RUNNING":
        return "text-blue-600 bg-blue-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASSED":
        return CheckCircle;
      case "FAILED":
        return XCircle;
      case "RUNNING":
        return RefreshCw;
      case "PENDING":
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-600 bg-green-100";
      case "WARNING":
        return "text-yellow-600 bg-yellow-100";
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      case "OFFLINE":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "LOW":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setIncidentAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "EXCELLENT":
        return "text-green-600";
      case "GOOD":
        return "text-blue-600";
      case "WARNING":
        return "text-yellow-600";
      case "CRITICAL":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "UP":
        return "↗️";
      case "DOWN":
        return "↘️";
      case "STABLE":
        return "→";
      default:
        return "→";
    }
  };

  return (
    <div className={`space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            DOH Compliance Production Control Center
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring, incident detection, and quality metrics for healthcare compliance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last run: {lastRun.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRun(!autoRun)}
          >
            <Activity
              className={`h-4 w-4 mr-2 ${autoRun ? "animate-pulse" : ""}`}
            />
            {autoRun ? "Auto" : "Manual"}
          </Button>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play
              className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Running..." : "Run All Tests"}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Alert className="border-green-200 bg-green-50">
          <Heart className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">
                {realTimeData.systemHealth.toFixed(1)}%
              </div>
              <p className="text-green-700 text-sm">System Health</p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-200 bg-blue-50">
          <Users className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {realTimeData.totalPatients.toLocaleString()}
              </div>
              <p className="text-blue-700 text-sm">Active Patients</p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-purple-200 bg-purple-50">
          <Shield className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">
                {realTimeData.complianceScore.toFixed(1)}%
              </div>
              <p className="text-purple-700 text-sm">DOH Compliance</p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className={`border-${realTimeData.activeIncidents > 0 ? 'orange' : 'green'}-200 bg-${realTimeData.activeIncidents > 0 ? 'orange' : 'green'}-50`}>
          <AlertCircle className={`h-4 w-4 text-${realTimeData.activeIncidents > 0 ? 'orange' : 'green'}-600`} />
          <AlertDescription>
            <div className="text-center">
              <div className={`text-2xl font-bold text-${realTimeData.activeIncidents > 0 ? 'orange' : 'green'}-800`}>
                {realTimeData.activeIncidents}
              </div>
              <p className={`text-${realTimeData.activeIncidents > 0 ? 'orange' : 'green'}-700 text-sm`}>Active Incidents</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Across {testSuites.length} test suites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((totalPassed / totalTests) * 100)}%
            </div>
            <Progress
              value={(totalPassed / totalTests) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {overallCoverage}%
            </div>
            <Progress value={overallCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(totalDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total execution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2 text-blue-600" />
                  Production Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productionServices.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge className={getServiceStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Uptime:</span>
                          <span className="ml-2 font-medium">{service.uptime}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Response:</span>
                          <span className="ml-2 font-medium">{Math.round(service.responseTime)}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Error Rate:</span>
                          <span className="ml-2 font-medium">{service.errorRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Throughput:</span>
                          <span className="ml-2 font-medium">{service.throughput}/min</span>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">CPU</div>
                          <div className="text-sm font-medium">{Math.round(service.metrics.cpu)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Memory</div>
                          <div className="text-sm font-medium">{Math.round(service.metrics.memory)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Disk</div>
                          <div className="text-sm font-medium">{Math.round(service.metrics.disk)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Network</div>
                          <div className="text-sm font-medium">{Math.round(service.metrics.network)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2 text-green-600" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "API Response Time", value: "45ms", target: "<100ms", status: "EXCELLENT" },
                    { name: "Database Queries", value: "12ms", target: "<50ms", status: "EXCELLENT" },
                    { name: "Cache Hit Rate", value: "98.7%", target: ">95%", status: "EXCELLENT" },
                    { name: "Memory Usage", value: "42%", target: "<80%", status: "EXCELLENT" },
                    { name: "CPU Utilization", value: "15%", target: "<70%", status: "EXCELLENT" },
                    { name: "Disk I/O", value: "23%", target: "<60%", status: "EXCELLENT" },
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-500">Target: {metric.target}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{metric.value}</div>
                        <Badge className="text-xs bg-green-100 text-green-800">{metric.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Incidents */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Active Incidents
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {incidentAlerts.filter(alert => !alert.acknowledged).length} Unacknowledged
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incidentAlerts.map((alert) => (
                      <div key={alert.id} className={`border rounded-lg p-4 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="ml-2 text-sm text-gray-500">
                                {alert.type.replace('_', ' ')}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                {alert.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{alert.message}</p>
                            {alert.patientId && (
                              <div className="text-xs text-gray-500">
                                Patient: {alert.patientId} | Location: {alert.location}
                              </div>
                            )}
                          </div>
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Incident Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Incident Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-500">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-500">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">45</div>
                    <div className="text-sm text-gray-500">This Month</div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">By Type</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Patient Falls</span>
                        <span className="font-medium">15</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medication Errors</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>System Errors</span>
                        <span className="font-medium">22</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {qualityMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{metric.name}</span>
                    <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                      {metric.value} {metric.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {metric.target} {metric.unit}
                    </div>
                    <Badge className={`text-xs ${getMetricStatusColor(metric.status)} bg-opacity-10`}>
                      {metric.status}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      Updated: {metric.lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Test Results Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Passed</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {totalPassed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span>Failed</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {totalFailed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                      <span>Skipped</span>
                    </div>
                    <span className="font-semibold text-yellow-600">
                      {totalSkipped}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Code Coverage</span>
                      <span>{overallCoverage}%</span>
                    </div>
                    <Progress value={overallCoverage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Test Reliability</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance Score</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSuites.map((suite, index) => {
              const StatusIcon = getStatusIcon(suite.status);
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <StatusIcon
                          className={`h-4 w-4 mr-2 ${
                            suite.status === "RUNNING" ? "animate-spin" : ""
                          } ${getStatusColor(suite.status).split(" ")[0]}`}
                        />
                        {suite.name}
                      </div>
                      <Badge className={getStatusColor(suite.status)}>
                        {suite.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            {suite.passed}
                          </div>
                          <div className="text-xs text-gray-500">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">
                            {suite.failed}
                          </div>
                          <div className="text-xs text-gray-500">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">
                            {suite.skipped}
                          </div>
                          <div className="text-xs text-gray-500">Skipped</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Coverage</span>
                          <span>{suite.coverage}%</span>
                        </div>
                        <Progress value={suite.coverage} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Duration: {formatDuration(suite.duration)}</span>
                        <span>Tests: {suite.tests}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Frontend Components", coverage: 100, lines: 15420 },
              { name: "Backend Services", coverage: 98, lines: 23150 },
              { name: "API Endpoints", coverage: 100, lines: 8750 },
              { name: "Database Queries", coverage: 95, lines: 4320 },
              { name: "Authentication", coverage: 100, lines: 2180 },
              { name: "Authorization", coverage: 100, lines: 1950 },
              { name: "Validation Logic", coverage: 100, lines: 3420 },
              { name: "Error Handling", coverage: 100, lines: 2850 },
              { name: "Integration Points", coverage: 97, lines: 5670 },
            ].map((module, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Coverage</span>
                      <span
                        className={
                          module.coverage >= 95
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {module.coverage}%
                      </span>
                    </div>
                    <Progress value={module.coverage} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {module.lines.toLocaleString()} lines covered
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "API Response Time",
                value: "45ms",
                target: "<100ms",
                status: "EXCELLENT",
              },
              {
                name: "Database Queries",
                value: "12ms",
                target: "<50ms",
                status: "EXCELLENT",
              },
              {
                name: "Page Load Time",
                value: "1.2s",
                target: "<3s",
                status: "EXCELLENT",
              },
              {
                name: "Memory Usage",
                value: "42MB",
                target: "<100MB",
                status: "EXCELLENT",
              },
              {
                name: "CPU Utilization",
                value: "15%",
                target: "<50%",
                status: "EXCELLENT",
              },
              {
                name: "Network Latency",
                value: "8ms",
                target: "<20ms",
                status: "EXCELLENT",
              },
              {
                name: "Throughput",
                value: "12K req/s",
                target: ">10K",
                status: "EXCELLENT",
              },
              {
                name: "Error Rate",
                value: "0.001%",
                target: "<0.1%",
                status: "EXCELLENT",
              },
            ].map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-green-600">
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {metric.target}
                    </div>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      {metric.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  DOH Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">99.2%</div>
                    <div className="text-sm text-gray-500">Overall Compliance Score</div>
                  </div>
                  <Progress value={99.2} className="h-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nine Domains</span>
                      <span className="text-green-600 font-medium">✓ Complete</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>JAWDA Standards</span>
                      <span className="text-green-600 font-medium">✓ Complete</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Patient Safety</span>
                      <span className="text-green-600 font-medium">✓ Complete</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Regulatory Reporting</span>
                      <span className="text-green-600 font-medium">✓ Complete</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Documentation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Clinical Forms", completed: 16, total: 16 },
                    { name: "Assessment Tools", completed: 9, total: 9 },
                    { name: "Care Plans", completed: 1247, total: 1247 },
                    { name: "Incident Reports", completed: 45, total: 45 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.completed}/{item.total}</span>
                      </div>
                      <Progress value={(item.completed / item.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Audit Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-3">
                    <div className="font-medium text-sm">DOH Annual Audit</div>
                    <div className="text-xs text-gray-500">Completed - March 2024</div>
                    <div className="text-xs text-green-600">✓ Passed with Excellence</div>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <div className="font-medium text-sm">JAWDA Assessment</div>
                    <div className="text-xs text-gray-500">Scheduled - June 2024</div>
                    <div className="text-xs text-blue-600">📋 In Preparation</div>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <div className="font-medium text-sm">Internal Review</div>
                    <div className="text-xs text-gray-500">Monthly - Next: May 15</div>
                    <div className="text-xs text-yellow-600">⏰ Upcoming</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2 text-blue-600" />
                  Generate Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "DOH Compliance Report", description: "Comprehensive compliance status and metrics" },
                    { name: "Quality Metrics Dashboard", description: "Real-time quality indicators and trends" },
                    { name: "Incident Analysis Report", description: "Patient safety incidents and root cause analysis" },
                    { name: "Performance Analytics", description: "System performance and optimization insights" },
                    { name: "JAWDA Standards Report", description: "JAWDA compliance assessment and recommendations" },
                  ].map((report, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{report.name}</div>
                          <div className="text-xs text-gray-500">{report.description}</div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-600" />
                  Automated Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Real-time Incident Detection</span>
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality Metrics Monitoring</span>
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Threshold Alerts</span>
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Performance Alerts</span>
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Alert Statistics (24h)</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Alerts</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Critical</span>
                        <span className="font-medium text-red-600">1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>High Priority</span>
                        <span className="font-medium text-orange-600">3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium Priority</span>
                        <span className="font-medium text-yellow-600">8</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Low Priority</span>
                        <span className="font-medium text-blue-600">11</span>
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
  );
}

export default ComprehensiveTestingAutomationDashboard;
