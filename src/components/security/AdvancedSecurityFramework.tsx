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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Activity,
  Users,
  Network,
  FileShield,
  Cpu,
  Globe,
  Database,
  Smartphone,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  DollarSign,
  HeartHandshake,
  Stethoscope,
  Calendar,
  UserCheck,
  AlertCircle,
  Timer,
  Gauge,
} from "lucide-react";
import { SecurityService } from "@/services/security.service";

interface SecurityMetric {
  id: string;
  name: string;
  score: number;
  status: "excellent" | "good" | "warning" | "critical";
  description: string;
  recommendations: string[];
  category:
    | "zero-trust"
    | "ai-detection"
    | "compliance"
    | "encryption"
    | "monitoring";
  lastUpdated: string;
}

interface ThreatDetection {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  resolved: boolean;
  source:
    | "ai-detection"
    | "behavioral-analysis"
    | "network-monitoring"
    | "manual";
  confidence: number;
  automatedResponse: boolean;
}

interface ComplianceCheck {
  id: string;
  standard: string;
  requirement: string;
  status: "compliant" | "non-compliant" | "partial";
  lastAudit: string;
  nextAudit: string;
  automatedMonitoring: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
}

interface ZeroTrustMetrics {
  trustScore: number;
  deviceTrust: number;
  networkTrust: number;
  identityTrust: number;
  accessDecisions: {
    allowed: number;
    denied: number;
    challenged: number;
  };
  continuousVerification: boolean;
}

interface AIThreatMetrics {
  threatsDetected: number;
  anomaliesFound: number;
  predictionsGenerated: number;
  modelAccuracy: number;
  falsePositiveRate: number;
  responseTime: number;
}

interface ComplianceFramework {
  id: string;
  name: string;
  type: "HIPAA" | "UAE_DATA_PROTECTION" | "ISO_27001" | "DOH" | "DAMAN";
  status: "compliant" | "non-compliant" | "partial" | "monitoring";
  score: number;
  lastAudit: string;
  nextAudit: string;
  automatedChecks: number;
  criticalFindings: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  requirements: {
    total: number;
    compliant: number;
    pending: number;
    failed: number;
  };
}

interface PredictiveAnalytics {
  patientRiskPrediction: {
    highRiskPatients: number;
    riskFactorsIdentified: number;
    preventiveInterventions: number;
    accuracyRate: number;
    earlyWarnings: number;
  };
  resourceForecasting: {
    staffingOptimization: number;
    demandPrediction: number;
    utilizationRate: number;
    costSavings: number;
    efficiencyGain: number;
  };
  revenueOptimization: {
    claimsAccuracy: number;
    denialPrevention: number;
    revenueIncrease: number;
    processingTime: number;
    complianceRate: number;
  };
  qualityPrediction: {
    outcomeAccuracy: number;
    improvementAreas: number;
    patientSatisfaction: number;
    qualityScore: number;
    continuousImprovement: number;
  };
}

interface RealTimeMetrics {
  securityIncidents: {
    active: number;
    resolved: number;
    critical: number;
    responseTime: number;
  };
  complianceStatus: {
    overallScore: number;
    frameworksMonitored: number;
    automatedChecks: number;
    violations: number;
  };
  threatIntelligence: {
    threatsBlocked: number;
    vulnerabilities: number;
    patchStatus: number;
    riskScore: number;
  };
  performanceMetrics: {
    systemUptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

const AdvancedSecurityFramework: React.FC = () => {
  const [securityService] = useState(() => SecurityService.getInstance());
  const [isLoading, setIsLoading] = useState(true);
  const [zeroTrustMetrics, setZeroTrustMetrics] = useState<ZeroTrustMetrics>({
    trustScore: 0,
    deviceTrust: 0,
    networkTrust: 0,
    identityTrust: 0,
    accessDecisions: { allowed: 0, denied: 0, challenged: 0 },
    continuousVerification: false,
  });
  const [aiThreatMetrics, setAIThreatMetrics] = useState<AIThreatMetrics>({
    threatsDetected: 0,
    anomaliesFound: 0,
    predictionsGenerated: 0,
    modelAccuracy: 0,
    falsePositiveRate: 0,
    responseTime: 0,
  });
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);

  const [threatDetections, setThreatDetections] = useState<ThreatDetection[]>(
    [],
  );

  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>(
    [],
  );
  const [complianceFrameworks, setComplianceFrameworks] = useState<
    ComplianceFramework[]
  >([]);
  const [predictiveAnalytics, setPredictiveAnalytics] =
    useState<PredictiveAnalytics>({
      patientRiskPrediction: {
        highRiskPatients: 0,
        riskFactorsIdentified: 0,
        preventiveInterventions: 0,
        accuracyRate: 0,
        earlyWarnings: 0,
      },
      resourceForecasting: {
        staffingOptimization: 0,
        demandPrediction: 0,
        utilizationRate: 0,
        costSavings: 0,
        efficiencyGain: 0,
      },
      revenueOptimization: {
        claimsAccuracy: 0,
        denialPrevention: 0,
        revenueIncrease: 0,
        processingTime: 0,
        complianceRate: 0,
      },
      qualityPrediction: {
        outcomeAccuracy: 0,
        improvementAreas: 0,
        patientSatisfaction: 0,
        qualityScore: 0,
        continuousImprovement: 0,
      },
    });
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    securityIncidents: {
      active: 0,
      resolved: 0,
      critical: 0,
      responseTime: 0,
    },
    complianceStatus: {
      overallScore: 0,
      frameworksMonitored: 0,
      automatedChecks: 0,
      violations: 0,
    },
    threatIntelligence: {
      threatsBlocked: 0,
      vulnerabilities: 0,
      patchStatus: 0,
      riskScore: 0,
    },
    performanceMetrics: {
      systemUptime: 0,
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
    },
  });

  // Initialize security framework
  useEffect(() => {
    const initializeSecurityFramework = async () => {
      try {
        setIsLoading(true);

        // Initialize security service
        await securityService.initialize();

        // Load security metrics
        await loadSecurityMetrics();

        // Load threat detections
        await loadThreatDetections();

        // Load compliance status
        await loadComplianceStatus();

        // Load Zero Trust metrics
        await loadZeroTrustMetrics();

        // Load AI threat metrics
        await loadAIThreatMetrics();

        // Load compliance frameworks
        await loadComplianceFrameworks();

        // Load predictive analytics
        await loadPredictiveAnalytics();

        // Load real-time metrics
        await loadRealTimeMetrics();

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize security framework:", error);
        setIsLoading(false);
      }
    };

    initializeSecurityFramework();
  }, [securityService]);

  const loadSecurityMetrics = async () => {
    const metrics: SecurityMetric[] = [
      {
        id: "1",
        name: "Zero Trust Architecture",
        score: 92,
        status: "excellent",
        description: "Continuous verification and least privilege access",
        category: "zero-trust",
        lastUpdated: new Date().toISOString(),
        recommendations: [
          "Implement device compliance checking",
          "Enhance network microsegmentation",
        ],
      },
      {
        id: "2",
        name: "AI Threat Detection",
        score: 88,
        status: "good",
        description: "Machine learning-powered anomaly detection",
        category: "ai-detection",
        lastUpdated: new Date().toISOString(),
        recommendations: [
          "Improve model training data",
          "Reduce false positive rate",
        ],
      },
      {
        id: "3",
        name: "Advanced Encryption",
        score: 96,
        status: "excellent",
        description: "AES-256-GCM with quantum-resistant algorithms",
        category: "encryption",
        lastUpdated: new Date().toISOString(),
        recommendations: [
          "Implement automated key rotation",
          "Add hardware security modules",
        ],
      },
      {
        id: "4",
        name: "Compliance Monitoring",
        score: 85,
        status: "good",
        description: "Automated DOH, DAMAN, and ADHICS compliance",
        category: "compliance",
        lastUpdated: new Date().toISOString(),
        recommendations: [
          "Enhance real-time monitoring",
          "Automate compliance reporting",
        ],
      },
      {
        id: "5",
        name: "Behavioral Analytics",
        score: 79,
        status: "warning",
        description: "User behavior analysis and anomaly detection",
        category: "ai-detection",
        lastUpdated: new Date().toISOString(),
        recommendations: [
          "Expand behavioral baselines",
          "Implement adaptive thresholds",
        ],
      },
      {
        id: "6",
        name: "Incident Response",
        score: 91,
        status: "excellent",
        description: "Automated threat response and containment",
        category: "monitoring",
        lastUpdated: new Date().toISOString(),
        recommendations: [
          "Enhance playbook automation",
          "Improve response time metrics",
        ],
      },
    ];
    setSecurityMetrics(metrics);
  };

  const loadThreatDetections = async () => {
    const threats: ThreatDetection[] = [
      {
        id: "1",
        type: "Behavioral Anomaly",
        severity: "medium",
        description: "Unusual access pattern detected for user account",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        source: "ai-detection",
        confidence: 0.87,
        automatedResponse: true,
      },
      {
        id: "2",
        type: "Network Intrusion Attempt",
        severity: "high",
        description: "Suspicious network traffic from external IP",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolved: true,
        source: "network-monitoring",
        confidence: 0.94,
        automatedResponse: true,
      },
      {
        id: "3",
        type: "Data Exfiltration Risk",
        severity: "critical",
        description: "Large data transfer detected outside normal hours",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        source: "ai-detection",
        confidence: 0.92,
        automatedResponse: true,
      },
      {
        id: "4",
        type: "Privilege Escalation",
        severity: "high",
        description: "Unauthorized attempt to access admin functions",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        resolved: true,
        source: "behavioral-analysis",
        confidence: 0.89,
        automatedResponse: true,
      },
    ];
    setThreatDetections(threats);
  };

  const loadComplianceStatus = async () => {
    const compliance: ComplianceCheck[] = [
      {
        id: "1",
        standard: "DOH Standards",
        requirement: "Clinical Documentation Compliance",
        status: "compliant",
        lastAudit: "2024-01-15",
        nextAudit: "2024-04-15",
        automatedMonitoring: true,
        riskLevel: "low",
      },
      {
        id: "2",
        standard: "DAMAN Requirements",
        requirement: "Insurance Data Protection",
        status: "compliant",
        lastAudit: "2024-01-10",
        nextAudit: "2024-04-10",
        automatedMonitoring: true,
        riskLevel: "low",
      },
      {
        id: "3",
        standard: "ADHICS V2",
        requirement: "Cybersecurity Framework",
        status: "partial",
        lastAudit: "2024-01-05",
        nextAudit: "2024-02-05",
        automatedMonitoring: true,
        riskLevel: "medium",
      },
      {
        id: "4",
        standard: "UAE Data Protection Law",
        requirement: "Data Localization & Privacy",
        status: "compliant",
        lastAudit: "2024-01-12",
        nextAudit: "2024-04-12",
        automatedMonitoring: true,
        riskLevel: "low",
      },
      {
        id: "5",
        standard: "ISO 27001",
        requirement: "Information Security Management",
        status: "compliant",
        lastAudit: "2024-01-08",
        nextAudit: "2024-04-08",
        automatedMonitoring: false,
        riskLevel: "medium",
      },
    ];
    setComplianceChecks(compliance);
  };

  const loadZeroTrustMetrics = async () => {
    const metrics: ZeroTrustMetrics = {
      trustScore: 0.85,
      deviceTrust: 0.92,
      networkTrust: 0.88,
      identityTrust: 0.94,
      accessDecisions: {
        allowed: 1247,
        denied: 23,
        challenged: 156,
      },
      continuousVerification: true,
    };
    setZeroTrustMetrics(metrics);
  };

  const loadAIThreatMetrics = async () => {
    const metrics: AIThreatMetrics = {
      threatsDetected: 47,
      anomaliesFound: 23,
      predictionsGenerated: 12,
      modelAccuracy: 0.94,
      falsePositiveRate: 0.08,
      responseTime: 1.2,
    };
    setAIThreatMetrics(metrics);
  };

  const loadComplianceFrameworks = async () => {
    const frameworks: ComplianceFramework[] = [
      {
        id: "1",
        name: "HIPAA Compliance",
        type: "HIPAA",
        status: "compliant",
        score: 94,
        lastAudit: "2024-01-15",
        nextAudit: "2024-07-15",
        automatedChecks: 156,
        criticalFindings: 0,
        riskLevel: "low",
        requirements: {
          total: 164,
          compliant: 156,
          pending: 8,
          failed: 0,
        },
      },
      {
        id: "2",
        name: "UAE Data Protection Law",
        type: "UAE_DATA_PROTECTION",
        status: "compliant",
        score: 91,
        lastAudit: "2024-01-10",
        nextAudit: "2024-04-10",
        automatedChecks: 89,
        criticalFindings: 1,
        riskLevel: "low",
        requirements: {
          total: 95,
          compliant: 89,
          pending: 5,
          failed: 1,
        },
      },
      {
        id: "3",
        name: "ISO 27001",
        type: "ISO_27001",
        status: "partial",
        score: 87,
        lastAudit: "2024-01-05",
        nextAudit: "2024-03-05",
        automatedChecks: 112,
        criticalFindings: 3,
        riskLevel: "medium",
        requirements: {
          total: 133,
          compliant: 112,
          pending: 18,
          failed: 3,
        },
      },
      {
        id: "4",
        name: "DOH Standards",
        type: "DOH",
        status: "compliant",
        score: 96,
        lastAudit: "2024-01-20",
        nextAudit: "2024-04-20",
        automatedChecks: 78,
        criticalFindings: 0,
        riskLevel: "low",
        requirements: {
          total: 82,
          compliant: 78,
          pending: 4,
          failed: 0,
        },
      },
      {
        id: "5",
        name: "DAMAN Requirements",
        type: "DAMAN",
        status: "monitoring",
        score: 89,
        lastAudit: "2024-01-12",
        nextAudit: "2024-02-12",
        automatedChecks: 67,
        criticalFindings: 2,
        riskLevel: "medium",
        requirements: {
          total: 75,
          compliant: 67,
          pending: 6,
          failed: 2,
        },
      },
    ];
    setComplianceFrameworks(frameworks);
  };

  const loadPredictiveAnalytics = async () => {
    const analytics: PredictiveAnalytics = {
      patientRiskPrediction: {
        highRiskPatients: 127,
        riskFactorsIdentified: 89,
        preventiveInterventions: 156,
        accuracyRate: 0.92,
        earlyWarnings: 34,
      },
      resourceForecasting: {
        staffingOptimization: 23,
        demandPrediction: 0.89,
        utilizationRate: 0.87,
        costSavings: 145000,
        efficiencyGain: 0.18,
      },
      revenueOptimization: {
        claimsAccuracy: 0.94,
        denialPrevention: 67,
        revenueIncrease: 234000,
        processingTime: 2.3,
        complianceRate: 0.96,
      },
      qualityPrediction: {
        outcomeAccuracy: 0.91,
        improvementAreas: 12,
        patientSatisfaction: 0.88,
        qualityScore: 0.93,
        continuousImprovement: 0.15,
      },
    };
    setPredictiveAnalytics(analytics);
  };

  const loadRealTimeMetrics = async () => {
    const metrics: RealTimeMetrics = {
      securityIncidents: {
        active: 3,
        resolved: 47,
        critical: 1,
        responseTime: 1.2,
      },
      complianceStatus: {
        overallScore: 92,
        frameworksMonitored: 5,
        automatedChecks: 502,
        violations: 6,
      },
      threatIntelligence: {
        threatsBlocked: 1247,
        vulnerabilities: 8,
        patchStatus: 0.94,
        riskScore: 0.23,
      },
      performanceMetrics: {
        systemUptime: 0.9987,
        responseTime: 0.34,
        throughput: 2847,
        errorRate: 0.002,
      },
    };
    setRealTimeMetrics(metrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const overallSecurityScore =
    securityMetrics.length > 0
      ? Math.round(
          securityMetrics.reduce((sum, metric) => sum + metric.score, 0) /
            securityMetrics.length,
        )
      : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "zero-trust":
        return <Shield className="h-4 w-4" />;
      case "ai-detection":
        return <Brain className="h-4 w-4" />;
      case "encryption":
        return <Lock className="h-4 w-4" />;
      case "compliance":
        return <FileShield className="h-4 w-4" />;
      case "monitoring":
        return <Activity className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "ai-detection":
        return <Brain className="h-4 w-4" />;
      case "behavioral-analysis":
        return <Users className="h-4 w-4" />;
      case "network-monitoring":
        return <Network className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Initializing Advanced Security Framework...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Advanced Security Framework
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive security monitoring and compliance management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overallSecurityScore}%
              </div>
              <div className="text-sm text-gray-500">Security Score</div>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance-frameworks">Compliance</TabsTrigger>
            <TabsTrigger value="predictive-analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="real-time">Real-time</TabsTrigger>
            <TabsTrigger value="zero-trust">Zero Trust</TabsTrigger>
            <TabsTrigger value="ai-threats">AI Detection</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="compliance-frameworks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {complianceFrameworks.map((framework) => (
                <Card
                  key={framework.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileShield className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg font-semibold">
                          {framework.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          framework.status === "compliant"
                            ? "default"
                            : framework.status === "partial"
                              ? "secondary"
                              : framework.status === "monitoring"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {framework.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          {framework.score}%
                        </span>
                        <div className="flex items-center space-x-2">
                          {framework.criticalFindings === 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : framework.criticalFindings <= 2 ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm text-gray-600">
                            {framework.criticalFindings} critical
                          </span>
                        </div>
                      </div>
                      <Progress value={framework.score} className="h-3" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Compliant:</span>
                            <span className="font-medium text-green-600">
                              {framework.requirements.compliant}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium text-yellow-600">
                              {framework.requirements.pending}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Failed:</span>
                            <span className="font-medium text-red-600">
                              {framework.requirements.failed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Auto Checks:</span>
                            <span className="font-medium text-blue-600">
                              {framework.automatedChecks}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Last audit: {framework.lastAudit}</span>
                          <span>Next: {framework.nextAudit}</span>
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant={
                              framework.riskLevel === "low"
                                ? "default"
                                : framework.riskLevel === "medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {framework.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Automated Compliance Monitoring</CardTitle>
                <CardDescription>
                  Real-time compliance status across all frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {realTimeMetrics.complianceStatus.overallScore}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {realTimeMetrics.complianceStatus.frameworksMonitored}
                    </div>
                    <p className="text-sm text-gray-600">Frameworks</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {realTimeMetrics.complianceStatus.automatedChecks}
                    </div>
                    <p className="text-sm text-gray-600">Auto Checks</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {realTimeMetrics.complianceStatus.violations}
                    </div>
                    <p className="text-sm text-gray-600">Violations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive-analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-red-500" />
                    <span>Patient Risk Prediction</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered proactive care through risk assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600 mb-1">
                          {
                            predictiveAnalytics.patientRiskPrediction
                              .highRiskPatients
                          }
                        </div>
                        <p className="text-xs text-gray-600">
                          High Risk Patients
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600 mb-1">
                          {
                            predictiveAnalytics.patientRiskPrediction
                              .riskFactorsIdentified
                          }
                        </div>
                        <p className="text-xs text-gray-600">Risk Factors</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600 mb-1">
                          {
                            predictiveAnalytics.patientRiskPrediction
                              .preventiveInterventions
                          }
                        </div>
                        <p className="text-xs text-gray-600">Interventions</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.patientRiskPrediction
                              .accuracyRate * 100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Accuracy</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Early Warnings Generated:
                        </span>
                        <Badge variant="secondary">
                          {
                            predictiveAnalytics.patientRiskPrediction
                              .earlyWarnings
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Resource Forecasting</span>
                  </CardTitle>
                  <CardDescription>
                    Optimal staffing through demand prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 mb-1">
                          {
                            predictiveAnalytics.resourceForecasting
                              .staffingOptimization
                          }
                          %
                        </div>
                        <p className="text-xs text-gray-600">Optimization</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.resourceForecasting
                              .demandPrediction * 100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Prediction</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600 mb-1">
                          AED
                          {(
                            predictiveAnalytics.resourceForecasting
                              .costSavings / 1000
                          ).toFixed(0)}
                          K
                        </div>
                        <p className="text-xs text-gray-600">Cost Savings</p>
                      </div>
                      <div className="text-center p-3 bg-teal-50 rounded-lg">
                        <div className="text-xl font-bold text-teal-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.resourceForecasting
                              .efficiencyGain * 100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Efficiency</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Utilization Rate:</span>
                        <Progress
                          value={
                            predictiveAnalytics.resourceForecasting
                              .utilizationRate * 100
                          }
                          className="w-24 h-2"
                        />
                        <span className="font-medium">
                          {Math.round(
                            predictiveAnalytics.resourceForecasting
                              .utilizationRate * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span>Revenue Optimization</span>
                  </CardTitle>
                  <CardDescription>
                    Predictive claims analysis for revenue growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.revenueOptimization
                              .claimsAccuracy * 100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Claims Accuracy</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 mb-1">
                          {
                            predictiveAnalytics.revenueOptimization
                              .denialPrevention
                          }
                        </div>
                        <p className="text-xs text-gray-600">
                          Denials Prevented
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600 mb-1">
                          AED
                          {(
                            predictiveAnalytics.revenueOptimization
                              .revenueIncrease / 1000
                          ).toFixed(0)}
                          K
                        </div>
                        <p className="text-xs text-gray-600">
                          Revenue Increase
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600 mb-1">
                          {
                            predictiveAnalytics.revenueOptimization
                              .processingTime
                          }
                          s
                        </div>
                        <p className="text-xs text-gray-600">Processing Time</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Compliance Rate:</span>
                        <Progress
                          value={
                            predictiveAnalytics.revenueOptimization
                              .complianceRate * 100
                          }
                          className="w-24 h-2"
                        />
                        <span className="font-medium">
                          {Math.round(
                            predictiveAnalytics.revenueOptimization
                              .complianceRate * 100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-500" />
                    <span>Quality Prediction</span>
                  </CardTitle>
                  <CardDescription>
                    Continuous improvement through outcome prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-xl font-bold text-indigo-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.qualityPrediction
                              .outcomeAccuracy * 100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">
                          Outcome Accuracy
                        </p>
                      </div>
                      <div className="text-center p-3 bg-pink-50 rounded-lg">
                        <div className="text-xl font-bold text-pink-600 mb-1">
                          {
                            predictiveAnalytics.qualityPrediction
                              .improvementAreas
                          }
                        </div>
                        <p className="text-xs text-gray-600">
                          Improvement Areas
                        </p>
                      </div>
                      <div className="text-center p-3 bg-cyan-50 rounded-lg">
                        <div className="text-xl font-bold text-cyan-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.qualityPrediction
                              .patientSatisfaction * 100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Satisfaction</p>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <div className="text-xl font-bold text-emerald-600 mb-1">
                          {Math.round(
                            predictiveAnalytics.qualityPrediction.qualityScore *
                              100,
                          )}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Quality Score</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Continuous Improvement:
                        </span>
                        <Badge variant="default">
                          +
                          {Math.round(
                            predictiveAnalytics.qualityPrediction
                              .continuousImprovement * 100,
                          )}
                          %
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>Security Incidents</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time incident monitoring and response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {realTimeMetrics.securityIncidents.active}
                      </div>
                      <p className="text-sm text-gray-600">Active Incidents</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {realTimeMetrics.securityIncidents.resolved}
                      </div>
                      <p className="text-sm text-gray-600">Resolved</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {realTimeMetrics.securityIncidents.critical}
                      </div>
                      <p className="text-sm text-gray-600">Critical</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {realTimeMetrics.securityIncidents.responseTime}s
                      </div>
                      <p className="text-sm text-gray-600">Avg Response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Threat Intelligence</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced threat detection and prevention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {realTimeMetrics.threatIntelligence.threatsBlocked}
                      </div>
                      <p className="text-sm text-gray-600">Threats Blocked</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {realTimeMetrics.threatIntelligence.vulnerabilities}
                      </div>
                      <p className="text-sm text-gray-600">Vulnerabilities</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {Math.round(
                          realTimeMetrics.threatIntelligence.patchStatus * 100,
                        )}
                        %
                      </div>
                      <p className="text-sm text-gray-600">Patch Status</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Math.round(
                          realTimeMetrics.threatIntelligence.riskScore * 100,
                        )}
                        %
                      </div>
                      <p className="text-sm text-gray-600">Risk Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-green-500" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    System performance and availability monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Uptime</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={
                            realTimeMetrics.performanceMetrics.systemUptime *
                            100
                          }
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-bold text-green-600">
                          {(
                            realTimeMetrics.performanceMetrics.systemUptime *
                            100
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm font-bold">
                        {realTimeMetrics.performanceMetrics.responseTime}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Throughput</span>
                      <span className="text-sm font-bold">
                        {realTimeMetrics.performanceMetrics.throughput} req/min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm font-bold text-red-600">
                        {(
                          realTimeMetrics.performanceMetrics.errorRate * 100
                        ).toFixed(3)}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="h-5 w-5 text-indigo-500" />
                    <span>Automated Response</span>
                  </CardTitle>
                  <CardDescription>
                    Incident response automation status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          Auto-Containment
                        </span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          Threat Response
                        </span>
                      </div>
                      <Badge variant="default">Automated</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">AI Analysis</span>
                      </div>
                      <Badge variant="default">Learning</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          Compliance Check
                        </span>
                      </div>
                      <Badge variant="default">Continuous</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityMetrics.map((metric) => (
                <Card
                  key={metric.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(metric.category)}
                        <CardTitle className="text-sm font-medium">
                          {metric.name}
                        </CardTitle>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {metric.score}%
                        </span>
                        {metric.status === "excellent" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : metric.status === "critical" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <Progress value={metric.score} className="h-2" />
                      <p className="text-xs text-gray-600">
                        {metric.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(metric.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Score Trend</CardTitle>
                  <CardDescription>
                    Overall security posture over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {overallSecurityScore}%
                      </div>
                      <p className="text-gray-600">Current Security Score</p>
                      <div className="mt-4 text-sm text-gray-500">
                        ↗ +5% from last month
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Security Status</CardTitle>
                  <CardDescription>
                    Live security monitoring dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Zero Trust Active</span>
                      </div>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">AI Detection</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Monitoring</span>
                      </div>
                      <Badge variant="default">24/7</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileShield className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Compliance</span>
                      </div>
                      <Badge variant="secondary">Automated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="zero-trust" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zero Trust Architecture</CardTitle>
                  <CardDescription>
                    Continuous verification and least privilege access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round(zeroTrustMetrics.trustScore * 100)}%
                      </div>
                      <p className="text-gray-600">Overall Trust Score</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            Device Trust
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={zeroTrustMetrics.deviceTrust * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-bold">
                            {Math.round(zeroTrustMetrics.deviceTrust * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Network className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            Network Trust
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={zeroTrustMetrics.networkTrust * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-bold">
                            {Math.round(zeroTrustMetrics.networkTrust * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">
                            Identity Trust
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={zeroTrustMetrics.identityTrust * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-bold">
                            {Math.round(zeroTrustMetrics.identityTrust * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Decisions (24h)</CardTitle>
                  <CardDescription>
                    Real-time access control decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Allowed</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {zeroTrustMetrics.accessDecisions.allowed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Denied</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">
                        {zeroTrustMetrics.accessDecisions.denied}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Challenged</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">
                        {zeroTrustMetrics.accessDecisions.challenged}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          Continuous Verification
                        </span>
                        <Badge
                          variant={
                            zeroTrustMetrics.continuousVerification
                              ? "default"
                              : "destructive"
                          }
                        >
                          {zeroTrustMetrics.continuousVerification
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-threats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Threat Detection</CardTitle>
                  <CardDescription>
                    Machine learning-powered security analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {aiThreatMetrics.threatsDetected}
                        </div>
                        <p className="text-sm text-gray-600">
                          Threats Detected
                        </p>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {aiThreatMetrics.anomaliesFound}
                        </div>
                        <p className="text-sm text-gray-600">Anomalies Found</p>
                      </div>

                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {aiThreatMetrics.predictionsGenerated}
                        </div>
                        <p className="text-sm text-gray-600">Predictions</p>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {Math.round(aiThreatMetrics.modelAccuracy * 100)}%
                        </div>
                        <p className="text-sm text-gray-600">Model Accuracy</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Performance Metrics</CardTitle>
                  <CardDescription>
                    Real-time AI system performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        False Positive Rate
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={(1 - aiThreatMetrics.falsePositiveRate) * 100}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-bold">
                          {Math.round(aiThreatMetrics.falsePositiveRate * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm font-bold">
                        {aiThreatMetrics.responseTime}s
                      </span>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">
                            Behavioral Analysis
                          </span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-medium">
                            Anomaly Detection
                          </span>
                        </div>
                        <Badge variant="default">Learning</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-teal-500" />
                          <span className="text-sm font-medium">
                            Threat Intelligence
                          </span>
                        </div>
                        <Badge variant="default">Updated</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Threat Detections</CardTitle>
                <CardDescription>
                  Real-time security threats and anomalies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatDetections.map((threat) => (
                    <div
                      key={threat.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-md ${
                        threat.severity === "critical"
                          ? "border-red-200 bg-red-50"
                          : threat.severity === "high"
                            ? "border-orange-200 bg-orange-50"
                            : threat.severity === "medium"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getSourceIcon(threat.source)}
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              threat.severity === "critical"
                                ? "text-red-500"
                                : threat.severity === "high"
                                  ? "text-orange-500"
                                  : threat.severity === "medium"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{threat.type}</h4>
                            {threat.automatedResponse && (
                              <Badge variant="secondary" className="text-xs">
                                Auto-Response
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {threat.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              {new Date(threat.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Confidence: {Math.round(threat.confidence * 100)}%
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              Source: {threat.source.replace("-", " ")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <Badge
                          variant={threat.resolved ? "default" : "destructive"}
                        >
                          {threat.resolved ? "Resolved" : "Active"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {threat.resolved ? "View Details" : "Investigate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                  Regulatory compliance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.map((check) => (
                    <div
                      key={check.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-md ${
                        check.status === "compliant"
                          ? "border-green-200 bg-green-50"
                          : check.status === "partial"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <FileShield
                            className={`h-5 w-5 ${
                              check.status === "compliant"
                                ? "text-green-500"
                                : check.status === "partial"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                            }`}
                          />
                          {check.automatedMonitoring && (
                            <Activity className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{check.standard}</h4>
                            {check.automatedMonitoring && (
                              <Badge variant="secondary" className="text-xs">
                                Auto-Monitor
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {check.requirement}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Last audit: {check.lastAudit}
                            </p>
                            <p className="text-xs text-gray-500">
                              Next: {check.nextAudit}
                            </p>
                            <Badge
                              variant={
                                check.riskLevel === "low"
                                  ? "default"
                                  : check.riskLevel === "medium"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {check.riskLevel} risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            check.status === "compliant"
                              ? "default"
                              : check.status === "partial"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {check.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Immediate Actions Required</CardTitle>
                  <CardDescription>
                    Critical security improvements needed now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription>
                        <strong>Critical:</strong> Address ADHICS V2 partial
                        compliance - implement missing advanced controls within
                        30 days
                      </AlertDescription>
                    </Alert>
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertDescription>
                        <strong>High Priority:</strong> Improve behavioral
                        analytics baseline to reduce false positives
                      </AlertDescription>
                    </Alert>
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Eye className="h-4 w-4 text-yellow-500" />
                      <AlertDescription>
                        <strong>Medium Priority:</strong> Enhance AI model
                        training data for better threat prediction accuracy
                      </AlertDescription>
                    </Alert>
                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <AlertDescription>
                        <strong>Optimization:</strong> Implement automated key
                        rotation for enhanced encryption security
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Enhancement Roadmap</CardTitle>
                  <CardDescription>
                    Strategic security improvements timeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <span className="text-sm font-medium">
                          Q4 2024: Zero Trust Architecture
                        </span>
                        <p className="text-xs text-gray-500">
                          ✓ Implemented and operational
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <div>
                        <span className="text-sm font-medium">
                          Q1 2025: AI Threat Detection Enhancement
                        </span>
                        <p className="text-xs text-gray-500">
                          In progress - 75% complete
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <div>
                        <span className="text-sm font-medium">
                          Q2 2025: Advanced Behavioral Analytics
                        </span>
                        <p className="text-xs text-gray-500">
                          Planned - ML model optimization
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <Lock className="w-5 h-5 text-indigo-500" />
                      <div>
                        <span className="text-sm font-medium">
                          Q3 2025: Quantum-Resistant Encryption
                        </span>
                        <p className="text-xs text-gray-500">
                          Research phase - algorithm selection
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                      <Database className="w-5 h-5 text-teal-500" />
                      <div>
                        <span className="text-sm font-medium">
                          Q4 2025: Advanced Compliance Automation
                        </span>
                        <p className="text-xs text-gray-500">
                          Planning - regulatory requirement analysis
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security Automation Status</CardTitle>
                <CardDescription>
                  Current automation capabilities and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-700">
                        Automated
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Threat detection & response</li>
                      <li>• Compliance monitoring</li>
                      <li>• Access control decisions</li>
                      <li>• Incident containment</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium text-yellow-700">
                        Partial
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Vulnerability management</li>
                      <li>• Security reporting</li>
                      <li>• Risk assessment</li>
                      <li>• Audit preparation</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-red-700">Manual</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Security policy updates</li>
                      <li>• Advanced threat hunting</li>
                      <li>• Compliance gap analysis</li>
                      <li>• Security training delivery</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedSecurityFramework;
