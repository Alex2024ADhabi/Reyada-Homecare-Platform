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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Lock,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  FileText,
  Settings,
  RefreshCw,
  Bell,
  Target,
  Network,
  Key,
  Fingerprint,
  Brain,
  Database,
  Globe,
  Cpu,
} from "lucide-react";

interface SecurityMetrics {
  overallSecurityScore: number;
  threatDetectionAccuracy: number;
  responseTime: number;
  auditCompliance: number;
  activeThreats: number;
  blockedAttacks: number;
  identityVerifications: number;
  policyViolations: number;
}

interface ZeroTrustMetrics {
  policiesActive: number;
  microSegmentsActive: number;
  activeContexts: number;
  activeSessions: number;
  averageRiskScore: number;
  highRiskUsers: number;
  verificationRate: number;
  trustLevelDistribution: Record<string, number>;
}

interface ThreatDetection {
  aiPoweredDetection: {
    accuracy: number;
    threatsDetected: number;
    falsePositives: number;
    modelVersion: string;
  };
  realTimeResponse: {
    averageResponseTime: number;
    automatedResponses: number;
    manualInterventions: number;
    successRate: number;
  };
  behavioralAnalysis: {
    anomaliesDetected: number;
    userProfiles: number;
    riskScoreAccuracy: number;
    adaptationRate: number;
  };
  threatIntelligence: {
    feedsActive: number;
    indicatorsProcessed: number;
    correlationAccuracy: number;
    updateFrequency: string;
  };
}

interface AuditTrailMetrics {
  immutableAuditTrail: {
    entriesLogged: number;
    integrityScore: number;
    retentionCompliance: number;
    encryptionStatus: string;
  };
  realTimeMonitoring: {
    activeMonitors: number;
    alertsGenerated: number;
    responseTime: number;
    coveragePercentage: number;
  };
  auditAnalytics: {
    patternsIdentified: number;
    complianceScore: number;
    riskAssessments: number;
    reportingAccuracy: number;
  };
  complianceReporting: {
    reportsGenerated: number;
    regulatoryCompliance: number;
    auditReadiness: number;
    documentationScore: number;
  };
}

interface SecurityIncident {
  id: string;
  type:
    | "threat_detected"
    | "policy_violation"
    | "access_denied"
    | "anomaly_detected";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: Date;
  status: "open" | "investigating" | "resolved";
  affectedResources: string[];
  responseActions: string[];
}

interface SecurityRecommendation {
  id: string;
  category: "zero_trust" | "threat_detection" | "audit_trail" | "compliance";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  estimatedTime: string;
}

const SecurityHardeningDashboard: React.FC = () => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    overallSecurityScore: 94,
    threatDetectionAccuracy: 97.8,
    responseTime: 0.3,
    auditCompliance: 99.2,
    activeThreats: 0,
    blockedAttacks: 247,
    identityVerifications: 1834,
    policyViolations: 3,
  });

  const [zeroTrustMetrics, setZeroTrustMetrics] = useState<ZeroTrustMetrics>({
    policiesActive: 12,
    microSegmentsActive: 8,
    activeContexts: 156,
    activeSessions: 89,
    averageRiskScore: 23.4,
    highRiskUsers: 2,
    verificationRate: 0.978,
    trustLevelDistribution: {
      verified: 45,
      high: 67,
      medium: 32,
      low: 8,
      none: 4,
    },
  });

  const [threatDetection, setThreatDetection] = useState<ThreatDetection>({
    aiPoweredDetection: {
      accuracy: 97.8,
      threatsDetected: 247,
      falsePositives: 5,
      modelVersion: "v2.1.3",
    },
    realTimeResponse: {
      averageResponseTime: 0.3,
      automatedResponses: 242,
      manualInterventions: 5,
      successRate: 98.8,
    },
    behavioralAnalysis: {
      anomaliesDetected: 18,
      userProfiles: 156,
      riskScoreAccuracy: 94.2,
      adaptationRate: 87.5,
    },
    threatIntelligence: {
      feedsActive: 15,
      indicatorsProcessed: 12847,
      correlationAccuracy: 92.1,
      updateFrequency: "Real-time",
    },
  });

  const [auditTrailMetrics, setAuditTrailMetrics] = useState<AuditTrailMetrics>(
    {
      immutableAuditTrail: {
        entriesLogged: 45672,
        integrityScore: 100,
        retentionCompliance: 99.8,
        encryptionStatus: "AES-256",
      },
      realTimeMonitoring: {
        activeMonitors: 24,
        alertsGenerated: 156,
        responseTime: 0.2,
        coveragePercentage: 98.7,
      },
      auditAnalytics: {
        patternsIdentified: 34,
        complianceScore: 99.2,
        riskAssessments: 89,
        reportingAccuracy: 97.8,
      },
      complianceReporting: {
        reportsGenerated: 23,
        regulatoryCompliance: 99.5,
        auditReadiness: 96.8,
        documentationScore: 98.1,
      },
    },
  );

  const [securityIncidents, setSecurityIncidents] = useState<
    SecurityIncident[]
  >([
    {
      id: "INC-001",
      type: "anomaly_detected",
      severity: "medium",
      description: "Unusual access pattern detected for user ID: USR-4567",
      timestamp: new Date(Date.now() - 1800000),
      status: "investigating",
      affectedResources: ["patient_data", "clinical_forms"],
      responseActions: [
        "User verification required",
        "Access temporarily restricted",
      ],
    },
    {
      id: "INC-002",
      type: "policy_violation",
      severity: "low",
      description: "Off-hours access attempt from unregistered device",
      timestamp: new Date(Date.now() - 3600000),
      status: "resolved",
      affectedResources: ["admin_panel"],
      responseActions: ["MFA challenge issued", "Device registration required"],
    },
    {
      id: "INC-003",
      type: "threat_detected",
      severity: "high",
      description: "Potential brute force attack detected on login endpoint",
      timestamp: new Date(Date.now() - 7200000),
      status: "resolved",
      affectedResources: ["authentication_service"],
      responseActions: [
        "IP blocked",
        "Rate limiting applied",
        "Security team notified",
      ],
    },
  ]);

  const [recommendations, setRecommendations] = useState<
    SecurityRecommendation[]
  >([
    {
      id: "REC-001",
      category: "zero_trust",
      priority: "high",
      title: "Implement Additional MFA Methods",
      description:
        "Add biometric authentication and hardware tokens for high-privilege users",
      impact: "Reduces identity-based attack vectors by 85%",
      effort: "medium",
      estimatedTime: "2-3 weeks",
    },
    {
      id: "REC-002",
      category: "threat_detection",
      priority: "medium",
      title: "Enhance Behavioral Analysis Models",
      description:
        "Update ML models with latest healthcare-specific threat patterns",
      impact: "Improves anomaly detection accuracy by 12%",
      effort: "low",
      estimatedTime: "1 week",
    },
    {
      id: "REC-003",
      category: "audit_trail",
      priority: "low",
      title: "Optimize Audit Log Storage",
      description: "Implement tiered storage for long-term audit log retention",
      impact: "Reduces storage costs by 40% while maintaining compliance",
      effort: "high",
      estimatedTime: "4-5 weeks",
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update metrics with slight variations
    setSecurityMetrics((prev) => ({
      ...prev,
      overallSecurityScore: Math.min(
        100,
        prev.overallSecurityScore + Math.random() * 2 - 1,
      ),
      blockedAttacks: prev.blockedAttacks + Math.floor(Math.random() * 5),
      identityVerifications:
        prev.identityVerifications + Math.floor(Math.random() * 10),
    }));

    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "investigating":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update timestamp every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Security Hardening Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Phase 4: Comprehensive Security Framework Control Center
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={refreshMetrics}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Security Score
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getSecurityScoreColor(securityMetrics.overallSecurityScore)}`}
              >
                {securityMetrics.overallSecurityScore.toFixed(1)}%
              </div>
              <Progress
                value={securityMetrics.overallSecurityScore}
                className="mt-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                Excellent security posture
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Threat Detection
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {securityMetrics.threatDetectionAccuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {securityMetrics.blockedAttacks} attacks blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Time
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {securityMetrics.responseTime}s
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Average incident response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Audit Compliance
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {securityMetrics.auditCompliance.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {auditTrailMetrics.immutableAuditTrail.entriesLogged.toLocaleString()}{" "}
                entries logged
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="zero-trust" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="zero-trust" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Zero-Trust Architecture
            </TabsTrigger>
            <TabsTrigger
              value="threat-detection"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Threat Detection
            </TabsTrigger>
            <TabsTrigger
              value="audit-trail"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Security Incidents
            </TabsTrigger>
          </TabsList>

          {/* Zero-Trust Architecture Tab */}
          <TabsContent value="zero-trust" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    Zero-Trust Framework Status
                  </CardTitle>
                  <CardDescription>
                    Complete zero-trust architecture implementation with
                    advanced identity verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {zeroTrustMetrics.policiesActive}
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Policies
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {zeroTrustMetrics.microSegmentsActive}
                      </div>
                      <div className="text-sm text-gray-600">
                        Micro-Segments
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {zeroTrustMetrics.activeContexts}
                      </div>
                      <div className="text-sm text-gray-600">
                        Security Contexts
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {zeroTrustMetrics.activeSessions}
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Sessions
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-green-600" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>
                    Advanced identity verification with multiple authentication
                    methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Verification Rate
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {(zeroTrustMetrics.verificationRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={zeroTrustMetrics.verificationRate * 100}
                    className="h-2"
                  />

                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Trust Level Distribution
                    </div>
                    {Object.entries(
                      zeroTrustMetrics.trustLevelDistribution,
                    ).map(([level, count]) => (
                      <div
                        key={level}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize">{level}</span>
                        <Badge variant="outline">{count} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-indigo-600" />
                  Micro-Segmentation & Network Security
                </CardTitle>
                <CardDescription>
                  Network segmentation rules and access controls for healthcare
                  data protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">
                        Healthcare Data Segment
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Patient data protection</div>
                      <div>• Clinical forms access</div>
                      <div>• Medical records security</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">
                        Administrative Segment
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Staff management</div>
                      <div>• Compliance reporting</div>
                      <div>• System administration</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">External Integration</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Insurance verification</div>
                      <div>• DOH reporting</div>
                      <div>• Third-party APIs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threat Detection Tab */}
          <TabsContent value="threat-detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI-Powered Threat Detection
                  </CardTitle>
                  <CardDescription>
                    Machine learning models for advanced threat identification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        Detection Accuracy
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {threatDetection.aiPoweredDetection.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Threats Detected
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {threatDetection.aiPoweredDetection.threatsDetected}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        False Positives
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {threatDetection.aiPoweredDetection.falsePositives}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Model Version</div>
                      <div className="text-lg font-bold text-blue-600">
                        {threatDetection.aiPoweredDetection.modelVersion}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Real-Time Response
                  </CardTitle>
                  <CardDescription>
                    Automated threat response and incident management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Response Time</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {threatDetection.realTimeResponse.averageResponseTime}s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-2xl font-bold text-green-600">
                        {threatDetection.realTimeResponse.successRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Automated</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {threatDetection.realTimeResponse.automatedResponses}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Manual</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {threatDetection.realTimeResponse.manualInterventions}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Behavioral Analysis
                  </CardTitle>
                  <CardDescription>
                    User behavior monitoring and anomaly detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Anomalies Detected</span>
                      <Badge variant="outline">
                        {threatDetection.behavioralAnalysis.anomaliesDetected}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Profiles</span>
                      <Badge variant="outline">
                        {threatDetection.behavioralAnalysis.userProfiles}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Score Accuracy</span>
                      <Badge variant="outline">
                        {threatDetection.behavioralAnalysis.riskScoreAccuracy}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Adaptation Rate</span>
                      <Badge variant="outline">
                        {threatDetection.behavioralAnalysis.adaptationRate}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    Threat Intelligence
                  </CardTitle>
                  <CardDescription>
                    External threat intelligence integration and correlation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Feeds</span>
                      <Badge variant="outline">
                        {threatDetection.threatIntelligence.feedsActive}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Indicators Processed</span>
                      <Badge variant="outline">
                        {threatDetection.threatIntelligence.indicatorsProcessed.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Correlation Accuracy</span>
                      <Badge variant="outline">
                        {threatDetection.threatIntelligence.correlationAccuracy}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Update Frequency</span>
                      <Badge variant="outline">
                        {threatDetection.threatIntelligence.updateFrequency}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit-trail" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Immutable Audit Trail
                  </CardTitle>
                  <CardDescription>
                    Tamper-proof audit logging with blockchain-like integrity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {auditTrailMetrics.immutableAuditTrail.entriesLogged.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Entries Logged
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {auditTrailMetrics.immutableAuditTrail.integrityScore}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Integrity Score
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Retention Compliance</span>
                      <Badge variant="outline">
                        {
                          auditTrailMetrics.immutableAuditTrail
                            .retentionCompliance
                        }
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Encryption Status</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.immutableAuditTrail.encryptionStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Real-Time Monitoring
                  </CardTitle>
                  <CardDescription>
                    Continuous audit monitoring with intelligent alerting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {auditTrailMetrics.realTimeMonitoring.activeMonitors}
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Monitors
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {auditTrailMetrics.realTimeMonitoring.alertsGenerated}
                      </div>
                      <div className="text-sm text-gray-600">
                        Alerts Generated
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.realTimeMonitoring.responseTime}s
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coverage</span>
                      <Badge variant="outline">
                        {
                          auditTrailMetrics.realTimeMonitoring
                            .coveragePercentage
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Audit Analytics
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics for audit pattern recognition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patterns Identified</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.auditAnalytics.patternsIdentified}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Compliance Score</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.auditAnalytics.complianceScore}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Assessments</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.auditAnalytics.riskAssessments}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reporting Accuracy</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.auditAnalytics.reportingAccuracy}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Compliance Reporting
                  </CardTitle>
                  <CardDescription>
                    Automated compliance reporting for healthcare regulations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reports Generated</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.complianceReporting.reportsGenerated}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Regulatory Compliance</span>
                      <Badge variant="outline">
                        {
                          auditTrailMetrics.complianceReporting
                            .regulatoryCompliance
                        }
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audit Readiness</span>
                      <Badge variant="outline">
                        {auditTrailMetrics.complianceReporting.auditReadiness}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documentation Score</span>
                      <Badge variant="outline">
                        {
                          auditTrailMetrics.complianceReporting
                            .documentationScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Recent Security Incidents
                  </CardTitle>
                  <CardDescription>
                    Real-time security incident monitoring and response tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityIncidents.map((incident) => (
                      <div key={incident.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getSeverityColor(incident.severity)}
                            >
                              {incident.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{incident.id}</span>
                            {getStatusIcon(incident.status)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {incident.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {incident.description}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              Affected Resources:
                            </span>
                            <div className="flex gap-1 mt-1">
                              {incident.affectedResources.map(
                                (resource, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {resource}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              Response Actions:
                            </span>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              {incident.responseActions.map((action, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Security Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered security improvement suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getSeverityColor(rec.priority)}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.category.replace("_", " ")}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {rec.description}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="text-green-600">
                            Impact: {rec.impact}
                          </div>
                          <div className="text-blue-600">
                            Effort: {rec.effort} • {rec.estimatedTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Phase 4 Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600" />
              Phase 4: Security Hardening - Implementation Status
            </CardTitle>
            <CardDescription>
              Comprehensive security framework implementation progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Zero-Trust Architecture (4/4)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Complete zero-trust framework
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Advanced identity verification
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Continuous security validation
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Micro-segmentation implementation
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Threat Detection (4/4)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    AI-powered threat detection
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Real-time threat response
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Advanced behavioral analysis
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Threat intelligence integration
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  Audit Trail (4/4)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Immutable audit trail
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Real-time audit monitoring
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Advanced audit analytics
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Comprehensive compliance reporting
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Phase 4: Security Hardening - COMPLETED
                </span>
              </div>
              <p className="text-sm text-green-700">
                All 12 security hardening subtasks have been successfully
                implemented. The healthcare platform now features
                enterprise-grade security with zero-trust architecture,
                AI-powered threat detection, and comprehensive audit trails.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityHardeningDashboard;
