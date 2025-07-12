import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Users,
  Activity,
  FileText,
  Brain,
  Fingerprint,
  Network,
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Key,
  Scan,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle2,
  Clock3,
  Target,
  Layers,
  Link,
  Hash,
  Blocks,
  Verified,
} from "lucide-react";

// Security Dashboard Types
interface SecurityMetrics {
  zeroTrust: {
    trustScore: number;
    activePolicies: number;
    accessRequests: number;
    challengeSuccess: number;
    riskScore: number;
    continuousValidation: number;
  };
  identityVerification: {
    mfaAdoption: number;
    biometricEnrollment: number;
    authenticationSuccess: number;
    deviceTrust: number;
    sessionSecurity: number;
    riskAssessment: number;
  };
  threatDetection: {
    threatsDetected: number;
    mlAccuracy: number;
    anomaliesFound: number;
    responseTime: number;
    falsePositives: number;
    threatIntelligence: number;
  };
  auditTrail: {
    eventsLogged: number;
    chainIntegrity: number;
    complianceScore: number;
    blockchainBlocks: number;
    auditCoverage: number;
    reportGeneration: number;
  };
}

interface SecurityAlert {
  id: string;
  type: "zero_trust" | "identity" | "threat" | "audit" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
  affectedUsers?: number;
  riskScore: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: "authentication" | "authorization" | "threat_detected" | "audit_event" | "compliance_violation";
  user: string;
  action: string;
  resource: string;
  outcome: "success" | "failure" | "blocked";
  riskScore: number;
  location: string;
  device: string;
}

const SecurityHardeningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    zeroTrust: {
      trustScore: 87.3,
      activePolicies: 24,
      accessRequests: 1247,
      challengeSuccess: 94.2,
      riskScore: 23.7,
      continuousValidation: 98.5,
    },
    identityVerification: {
      mfaAdoption: 92.8,
      biometricEnrollment: 78.4,
      authenticationSuccess: 96.7,
      deviceTrust: 85.2,
      sessionSecurity: 91.6,
      riskAssessment: 88.9,
    },
    threatDetection: {
      threatsDetected: 47,
      mlAccuracy: 94.3,
      anomaliesFound: 12,
      responseTime: 1.8,
      falsePositives: 3.2,
      threatIntelligence: 89.7,
    },
    auditTrail: {
      eventsLogged: 15420,
      chainIntegrity: 100.0,
      complianceScore: 96.8,
      blockchainBlocks: 156,
      auditCoverage: 99.2,
      reportGeneration: 87.5,
    },
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: "alert-001",
      type: "threat",
      severity: "critical",
      title: "Advanced Persistent Threat Detected",
      description: "ML models detected sophisticated attack pattern targeting patient data access",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      acknowledged: false,
      source: "AI Threat Detection",
      affectedUsers: 3,
      riskScore: 95,
    },
    {
      id: "alert-002",
      type: "zero_trust",
      severity: "high",
      title: "Zero-Trust Policy Violation",
      description: "Multiple access attempts from untrusted device bypassing verification",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      acknowledged: false,
      source: "Zero-Trust Framework",
      affectedUsers: 1,
      riskScore: 78,
    },
    {
      id: "alert-003",
      type: "identity",
      severity: "medium",
      title: "Biometric Authentication Anomaly",
      description: "Unusual biometric patterns detected for user authentication",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      acknowledged: false,
      source: "Identity Verification",
      affectedUsers: 1,
      riskScore: 65,
    },
  ]);

  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([
    {
      id: "evt-001",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: "threat_detected",
      user: "system",
      action: "anomaly_detection",
      resource: "network_traffic",
      outcome: "blocked",
      riskScore: 85,
      location: "External",
      device: "Unknown",
    },
    {
      id: "evt-002",
      timestamp: new Date(Date.now() - 180000).toISOString(),
      type: "authentication",
      user: "dr.smith@hospital.com",
      action: "biometric_login",
      resource: "patient_portal",
      outcome: "success",
      riskScore: 12,
      location: "Hospital Network",
      device: "Trusted Workstation",
    },
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        zeroTrust: {
          ...prev.zeroTrust,
          trustScore: Math.max(80, Math.min(100, prev.zeroTrust.trustScore + (Math.random() - 0.5) * 2)),
          accessRequests: prev.zeroTrust.accessRequests + Math.floor(Math.random() * 5),
          riskScore: Math.max(0, Math.min(100, prev.zeroTrust.riskScore + (Math.random() - 0.5) * 3)),
        },
        threatDetection: {
          ...prev.threatDetection,
          threatsDetected: prev.threatDetection.threatsDetected + (Math.random() > 0.8 ? 1 : 0),
          responseTime: Math.max(0.5, prev.threatDetection.responseTime + (Math.random() - 0.5) * 0.3),
        },
        auditTrail: {
          ...prev.auditTrail,
          eventsLogged: prev.auditTrail.eventsLogged + Math.floor(Math.random() * 10),
          blockchainBlocks: prev.auditTrail.blockchainBlocks + (Math.random() > 0.9 ? 1 : 0),
        },
      }));

      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-600 bg-green-100";
    if (value >= thresholds.warning) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "success": return "text-green-600 bg-green-100";
      case "failure": return "text-red-600 bg-red-100";
      case "blocked": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics to show scan results
    setMetrics(prev => ({
      ...prev,
      zeroTrust: {
        ...prev.zeroTrust,
        trustScore: Math.min(100, prev.zeroTrust.trustScore + 2),
        continuousValidation: Math.min(100, prev.zeroTrust.continuousValidation + 1),
      },
      threatDetection: {
        ...prev.threatDetection,
        mlAccuracy: Math.min(100, prev.threatDetection.mlAccuracy + 1),
        threatIntelligence: Math.min(100, prev.threatDetection.threatIntelligence + 2),
      },
    }));
    
    setIsScanning(false);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Security Hardening Control Center
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced security monitoring and threat protection for Phase 4 implementation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="text-lg font-semibold text-green-600">
                Security Status: Hardened
              </div>
            </div>
            <Button 
              onClick={runSecurityScan}
              disabled={isScanning}
              className="bg-red-600 hover:bg-red-700"
            >
              <Shield className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Security Scan'}
            </Button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {metrics.zeroTrust.trustScore.toFixed(1)}%
                </div>
                <p className="text-blue-700 text-sm">Zero-Trust Score</p>
                <div className="text-xs text-blue-600 mt-1">
                  {metrics.zeroTrust.activePolicies} active policies
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Fingerprint className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {metrics.identityVerification.mfaAdoption.toFixed(1)}%
                </div>
                <p className="text-green-700 text-sm">MFA Adoption</p>
                <div className="text-xs text-green-600 mt-1">
                  {metrics.identityVerification.biometricEnrollment.toFixed(1)}% biometric
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50">
            <Brain className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {metrics.threatDetection.threatsDetected}
                </div>
                <p className="text-purple-700 text-sm">Threats Detected</p>
                <div className="text-xs text-purple-600 mt-1">
                  {metrics.threatDetection.mlAccuracy.toFixed(1)}% ML accuracy
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50">
            <Blocks className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800">
                  {metrics.auditTrail.chainIntegrity.toFixed(1)}%
                </div>
                <p className="text-orange-700 text-sm">Chain Integrity</p>
                <div className="text-xs text-orange-600 mt-1">
                  {metrics.auditTrail.blockchainBlocks} blocks
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="zero-trust">Zero-Trust</TabsTrigger>
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Metrics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Security Posture Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Zero-Trust Implementation</span>
                        <span>{metrics.zeroTrust.trustScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.zeroTrust.trustScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Identity Verification</span>
                        <span>{metrics.identityVerification.authenticationSuccess.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.identityVerification.authenticationSuccess} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Threat Detection</span>
                        <span>{metrics.threatDetection.mlAccuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.threatDetection.mlAccuracy} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Audit Compliance</span>
                        <span>{metrics.auditTrail.complianceScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.auditTrail.complianceScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Real-Time Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.action}</div>
                          <div className="text-xs text-gray-500">{event.user} → {event.resource}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getOutcomeColor(event.outcome)}>
                            {event.outcome.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            Risk: {event.riskScore}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-orange-600" />
                    Active Security Alerts
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    {alerts.filter(alert => !alert.acknowledged).length} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.filter(alert => !alert.acknowledged).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="ml-2 font-medium text-sm">{alert.title}</span>
                        </div>
                        <div className="text-xs text-gray-500">{alert.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {alert.source} • {new Date(alert.timestamp).toLocaleString()}
                          {alert.affectedUsers && ` • ${alert.affectedUsers} users affected`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-red-600 font-medium">
                          Risk: {alert.riskScore}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content would go here */}
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityHardeningDashboard;