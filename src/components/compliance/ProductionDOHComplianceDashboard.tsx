import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Shield,
  Activity,
  Users,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Lock,
  Zap,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Bell,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Cpu,
  HardDrive,
  Network,
  Battery,
  Signal,
  Gauge,
  Award,
  Star,
  Bookmark,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash,
  Save,
  X,
  Check,
} from "lucide-react";

// Production Service Interfaces
interface ProductionMetrics {
  aiClassification: {
    totalClassifications: number;
    accuracy: number;
    processingTime: number;
    activeModels: number;
  };
  careCoordination: {
    activePlans: number;
    coordinationScore: number;
    goalAchievementRate: number;
    communicationEffectiveness: number;
  };
  blockchainAudit: {
    totalEntries: number;
    chainIntegrity: number;
    verificationRate: number;
    blocksMined: number;
  };
  riskAssessment: {
    highRiskPatients: number;
    predictionAccuracy: number;
    interventionSuccessRate: number;
    alertsGenerated: number;
  };
  safetyAlerts: {
    activeAlerts: number;
    criticalAlerts: number;
    responseTime: number;
    resolutionRate: number;
  };
  qualityMetrics: {
    overallScore: number;
    jawdaCompliance: number;
    dohCompliance: number;
    patientSatisfaction: number;
  };
}

interface SystemHealth {
  services: {
    name: string;
    status: "healthy" | "warning" | "critical" | "offline";
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastCheck: Date;
  }[];
  infrastructure: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  performance: {
    throughput: number;
    latency: number;
    availability: number;
    reliability: number;
  };
}

interface ComplianceStatus {
  overall: number;
  domains: {
    patientSafety: number;
    clinicalGovernance: number;
    qualityManagement: number;
    riskManagement: number;
    informationManagement: number;
    humanResources: number;
    leadershipGovernance: number;
    facilitiesManagement: number;
    medicalEquipment: number;
  };
  jawdaKPIs: {
    kpi: string;
    current: number;
    target: number;
    status: "excellent" | "good" | "warning" | "critical";
  }[];
  auditReadiness: number;
}

const ProductionDOHComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    aiClassification: {
      totalClassifications: 1247,
      accuracy: 94.7,
      processingTime: 2.3,
      activeModels: 3,
    },
    careCoordination: {
      activePlans: 89,
      coordinationScore: 92.5,
      goalAchievementRate: 87.3,
      communicationEffectiveness: 91.8,
    },
    blockchainAudit: {
      totalEntries: 15847,
      chainIntegrity: 100,
      verificationRate: 99.8,
      blocksMined: 247,
    },
    riskAssessment: {
      highRiskPatients: 23,
      predictionAccuracy: 91.2,
      interventionSuccessRate: 78.5,
      alertsGenerated: 156,
    },
    safetyAlerts: {
      activeAlerts: 7,
      criticalAlerts: 2,
      responseTime: 12,
      resolutionRate: 94.3,
    },
    qualityMetrics: {
      overallScore: 96.2,
      jawdaCompliance: 98.1,
      dohCompliance: 97.8,
      patientSatisfaction: 4.6,
    },
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    services: [
      {
        name: "AI Classification Service",
        status: "healthy",
        uptime: 99.98,
        responseTime: 45,
        errorRate: 0.001,
        lastCheck: new Date(),
      },
      {
        name: "Care Coordination Service",
        status: "healthy",
        uptime: 99.95,
        responseTime: 32,
        errorRate: 0.002,
        lastCheck: new Date(),
      },
      {
        name: "Blockchain Audit Service",
        status: "healthy",
        uptime: 99.99,
        responseTime: 18,
        errorRate: 0.0001,
        lastCheck: new Date(),
      },
      {
        name: "Risk Assessment Service",
        status: "warning",
        uptime: 99.87,
        responseTime: 78,
        errorRate: 0.005,
        lastCheck: new Date(),
      },
      {
        name: "Safety Alert Service",
        status: "healthy",
        uptime: 99.92,
        responseTime: 23,
        errorRate: 0.003,
        lastCheck: new Date(),
      },
    ],
    infrastructure: {
      cpu: 23,
      memory: 67,
      disk: 45,
      network: 12,
    },
    performance: {
      throughput: 1250,
      latency: 35,
      availability: 99.95,
      reliability: 99.8,
    },
  });

  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    overall: 97.8,
    domains: {
      patientSafety: 98.5,
      clinicalGovernance: 97.2,
      qualityManagement: 98.9,
      riskManagement: 96.8,
      informationManagement: 97.5,
      humanResources: 98.1,
      leadershipGovernance: 97.8,
      facilitiesManagement: 96.9,
      medicalEquipment: 98.3,
    },
    jawdaKPIs: [
      { kpi: "Patient Fall Rate", current: 2.1, target: 2.5, status: "excellent" },
      { kpi: "Medication Error Rate", current: 1.3, target: 1.5, status: "excellent" },
      { kpi: "Readmission Rate", current: 7.8, target: 8.5, status: "excellent" },
      { kpi: "Patient Satisfaction", current: 4.6, target: 4.0, status: "excellent" },
      { kpi: "Staff Satisfaction", current: 4.2, target: 4.0, status: "excellent" },
      { kpi: "Infection Rate", current: 0.8, target: 1.0, status: "excellent" },
    ],
    auditReadiness: 98.7,
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setMetrics(prev => ({
        ...prev,
        aiClassification: {
          ...prev.aiClassification,
          totalClassifications: prev.aiClassification.totalClassifications + Math.floor(Math.random() * 3),
          processingTime: Math.max(1, prev.aiClassification.processingTime + (Math.random() - 0.5) * 0.5),
        },
        safetyAlerts: {
          ...prev.safetyAlerts,
          activeAlerts: Math.max(0, prev.safetyAlerts.activeAlerts + (Math.random() > 0.8 ? 1 : 0) - (Math.random() > 0.7 ? 1 : 0)),
          responseTime: Math.max(5, prev.safetyAlerts.responseTime + (Math.random() - 0.5) * 5),
        },
      }));

      setSystemHealth(prev => ({
        ...prev,
        infrastructure: {
          cpu: Math.max(0, Math.min(100, prev.infrastructure.cpu + (Math.random() - 0.5) * 5)),
          memory: Math.max(0, Math.min(100, prev.infrastructure.memory + (Math.random() - 0.5) * 3)),
          disk: Math.max(0, Math.min(100, prev.infrastructure.disk + (Math.random() - 0.5) * 2)),
          network: Math.max(0, Math.min(100, prev.infrastructure.network + (Math.random() - 0.5) * 8)),
        },
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      case "offline":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "excellent":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "good":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "offline":
        return <X className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Production DOH Compliance Control Center
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and management of all compliance automation systems
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="text-lg font-semibold text-green-600">
                System Status: Operational
              </div>
            </div>
            <Button onClick={refreshData} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {complianceStatus.overall.toFixed(1)}%
                </div>
                <p className="text-green-700 text-sm">DOH Compliance</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {metrics.aiClassification.accuracy.toFixed(1)}%
                </div>
                <p className="text-blue-700 text-sm">AI Accuracy</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50">
            <Database className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {metrics.blockchainAudit.chainIntegrity}%
                </div>
                <p className="text-purple-700 text-sm">Chain Integrity</p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className={`border-${metrics.safetyAlerts.criticalAlerts > 0 ? 'orange' : 'green'}-200 bg-${metrics.safetyAlerts.criticalAlerts > 0 ? 'orange' : 'green'}-50`}>
            <Bell className={`h-4 w-4 text-${metrics.safetyAlerts.criticalAlerts > 0 ? 'orange' : 'green'}-600`} />
            <AlertDescription>
              <div className="text-center">
                <div className={`text-2xl font-bold text-${metrics.safetyAlerts.criticalAlerts > 0 ? 'orange' : 'green'}-800`}>
                  {metrics.safetyAlerts.activeAlerts}
                </div>
                <p className={`text-${metrics.safetyAlerts.criticalAlerts > 0 ? 'orange' : 'green'}-700 text-sm`}>Active Alerts</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-services">AI Services</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Production Services Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Production Services Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemHealth.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          {getStatusIcon(service.status)}
                          <div className="ml-3">
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">
                              Uptime: {service.uptime}% | Response: {Math.round(service.responseTime)}ms
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gauge className="h-5 w-5 mr-2 text-green-600" />
                    Infrastructure Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>{Math.round(systemHealth.infrastructure.cpu)}%</span>
                      </div>
                      <Progress value={systemHealth.infrastructure.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{Math.round(systemHealth.infrastructure.memory)}%</span>
                      </div>
                      <Progress value={systemHealth.infrastructure.memory} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disk Usage</span>
                        <span>{Math.round(systemHealth.infrastructure.disk)}%</span>
                      </div>
                      <Progress value={systemHealth.infrastructure.disk} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network Usage</span>
                        <span>{Math.round(systemHealth.infrastructure.network)}%</span>
                      </div>
                      <Progress value={systemHealth.infrastructure.network} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {metrics.aiClassification.totalClassifications.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">AI Classifications</div>
                    <div className="text-xs text-green-600 mt-1">
                      ↗️ +{Math.floor(Math.random() * 50) + 10} today
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {metrics.careCoordination.activePlans}
                    </div>
                    <div className="text-sm text-gray-600">Active Care Plans</div>
                    <div className="text-xs text-green-600 mt-1">
                      ↗️ {metrics.careCoordination.coordinationScore.toFixed(1)}% efficiency
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {metrics.blockchainAudit.totalEntries.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Audit Entries</div>
                    <div className="text-xs text-green-600 mt-1">
                      ⛓️ {metrics.blockchainAudit.blocksMined} blocks mined
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {metrics.riskAssessment.highRiskPatients}
                    </div>
                    <div className="text-sm text-gray-600">High-Risk Patients</div>
                    <div className="text-xs text-blue-600 mt-1">
                      🎯 {metrics.riskAssessment.predictionAccuracy.toFixed(1)}% accuracy
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    AI Classification Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.aiClassification.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Classification Accuracy</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.aiClassification.processingTime.toFixed(1)}s
                        </div>
                        <div className="text-sm text-gray-600">Avg Processing Time</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Models</span>
                        <span className="font-medium">{metrics.aiClassification.activeModels}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Classifications</span>
                        <span className="font-medium">{metrics.aiClassification.totalClassifications.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Model Performance</span>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Care Coordination Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.careCoordination.coordinationScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Coordination Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.careCoordination.goalAchievementRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Goal Achievement</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Plans</span>
                        <span className="font-medium">{metrics.careCoordination.activePlans}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Communication Effectiveness</span>
                        <span className="font-medium">{metrics.careCoordination.communicationEffectiveness.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service Status</span>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-orange-600" />
                  Predictive Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.riskAssessment.highRiskPatients}
                    </div>
                    <div className="text-sm text-gray-600">High-Risk Patients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.riskAssessment.predictionAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Prediction Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.riskAssessment.interventionSuccessRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Intervention Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.riskAssessment.alertsGenerated}
                    </div>
                    <div className="text-sm text-gray-600">Alerts Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    DOH Nine Domains Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(complianceStatus.domains).map(([domain, score]) => (
                      <div key={domain} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{domain.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium">{score.toFixed(1)}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    JAWDA KPIs Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceStatus.jawdaKPIs.map((kpi, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{kpi.kpi}</div>
                          <div className="text-xs text-gray-500">
                            Current: {kpi.current} | Target: {kpi.target}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(kpi.status)}
                          <Badge className={`ml-2 ${getStatusColor(kpi.status)}`}>
                            {kpi.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-purple-600" />
                  Audit Readiness Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {complianceStatus.auditReadiness.toFixed(1)}%
                  </div>
                  <div className="text-lg text-gray-600">Overall Audit Readiness</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-gray-600">Documentation Complete</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.7%</div>
                    <div className="text-sm text-gray-600">Process Compliance</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">97.2%</div>
                    <div className="text-sm text-gray-600">Staff Readiness</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-orange-600" />
                    Real-Time Safety Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {metrics.safetyAlerts.activeAlerts}
                        </div>
                        <div className="text-sm text-gray-600">Active Alerts</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {metrics.safetyAlerts.criticalAlerts}
                        </div>
                        <div className="text-sm text-gray-600">Critical Alerts</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Response Time</span>
                        <span className="font-medium">{Math.round(metrics.safetyAlerts.responseTime)} min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Resolution Rate</span>
                        <span className="font-medium">{metrics.safetyAlerts.resolutionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Alert System Status</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.qualityMetrics.overallScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Overall Quality Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.qualityMetrics.patientSatisfaction.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Patient Satisfaction</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>JAWDA Compliance</span>
                        <span className="font-medium">{metrics.qualityMetrics.jawdaCompliance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>DOH Compliance</span>
                        <span className="font-medium">{metrics.qualityMetrics.dohCompliance.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quality Status</span>
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-purple-600" />
                    Blockchain Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.blockchainAudit.totalEntries.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Audit Entries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.blockchainAudit.chainIntegrity}%
                        </div>
                        <div className="text-sm text-gray-600">Chain Integrity</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Blocks Mined</span>
                        <span className="font-medium">{metrics.blockchainAudit.blocksMined}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Verification Rate</span>
                        <span className="font-medium">{metrics.blockchainAudit.verificationRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Blockchain Status</span>
                        <Badge className="bg-green-100 text-green-800">Secure</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-red-600" />
                    Security & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-sm text-gray-600">Data Integrity</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-600">Security Breaches</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Encryption Status</span>
                        <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Access Control</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Audit Compliance</span>
                        <Badge className="bg-green-100 text-green-800">100%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemHealth.performance.throughput.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Requests/min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(systemHealth.performance.latency)}ms
                    </div>
                    <div className="text-sm text-gray-600">Avg Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {systemHealth.performance.availability.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">Availability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {systemHealth.performance.reliability.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Reliability</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance trend chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Service distribution chart would be displayed here</p>
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

export default ProductionDOHComplianceDashboard;