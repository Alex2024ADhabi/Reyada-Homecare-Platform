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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Lock,
  Eye,
  Zap,
  Brain,
  FileText,
  Users,
  Database,
  Network,
  TrendingUp,
  AlertCircle,
  Cpu,
  Globe,
  Key,
  UserCheck,
  Clock,
  BarChart3,
} from "lucide-react";
import SecurityOrchestrator, {
  SecurityOrchestrationResult,
} from "@/services/security-orchestrator.service";

interface EnhancedSecurityDashboardProps {
  className?: string;
}

const EnhancedSecurityDashboard: React.FC<EnhancedSecurityDashboardProps> = ({
  className = "",
}) => {
  const [securityAssessment, setSecurityAssessment] =
    useState<SecurityOrchestrationResult | null>(null);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState<any>(null);
  const [securityEnhancements, setSecurityEnhancements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScans, setActiveScans] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    initializeEnhancedSecurityDashboard();

    // Setup real-time updates every 30 seconds
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const initializeEnhancedSecurityDashboard = async () => {
    try {
      const orchestrator = SecurityOrchestrator.getInstance();
      await orchestrator.initialize();

      // Generate comprehensive security assessment
      const assessment = await orchestrator.generateSecurityAssessment();
      setSecurityAssessment(assessment);

      // Deploy healthcare security measures
      await orchestrator.deployHealthcareSecurityMeasures();

      // Get real-time monitoring data
      const monitoring = await orchestrator.performRealTimeMonitoring();
      setRealTimeMonitoring(monitoring);

      // Get security enhancements history
      const enhancements = orchestrator.getSecurityEnhancements();
      setSecurityEnhancements(enhancements.slice(0, 10)); // Last 10 enhancements

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize enhanced security dashboard:", error);
      setLoading(false);
    }
  };

  const updateRealTimeData = async () => {
    try {
      const orchestrator = SecurityOrchestrator.getInstance();
      const monitoring = await orchestrator.performRealTimeMonitoring();
      setRealTimeMonitoring(monitoring);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update real-time data:", error);
    }
  };

  const runAdvancedSecurityScan = async (scanType: string) => {
    setActiveScans((prev) => [...prev, scanType]);

    try {
      const orchestrator = SecurityOrchestrator.getInstance();

      switch (scanType) {
        case "comprehensive_assessment":
          const assessment = await orchestrator.generateSecurityAssessment();
          setSecurityAssessment(assessment);
          break;
        case "healthcare_security":
          await orchestrator.deployHealthcareSecurityMeasures();
          break;
        case "incident_simulation":
          await orchestrator.executeAutomatedSecurityResponse({
            type: "security_test",
            severity: "medium",
            description: "Simulated security incident for testing",
            affectedSystems: ["test_system"],
            dataImpact: false,
          });
          break;
      }

      // Update enhancements
      const enhancements = orchestrator.getSecurityEnhancements();
      setSecurityEnhancements(enhancements.slice(0, 10));
    } catch (error) {
      console.error(`${scanType} scan failed:`, error);
    } finally {
      setActiveScans((prev) => prev.filter((scan) => scan !== scanType));
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 90) return "text-blue-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getSecurityScoreBadge = (score: number) => {
    if (score >= 95) return "bg-green-100 text-green-800";
    if (score >= 90) return "bg-blue-100 text-blue-800";
    if (score >= 80) return "bg-yellow-100 text-yellow-800";
    if (score >= 70) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getThreatLevelBadge = (level: string) => {
    switch (level) {
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

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 animate-spin" />
            <span>Initializing Enhanced Security Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Enhanced Security Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced security orchestration and healthcare compliance monitoring
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => runAdvancedSecurityScan("comprehensive_assessment")}
            disabled={activeScans.includes("comprehensive_assessment")}
            variant="outline"
          >
            {activeScans.includes("comprehensive_assessment") ? (
              <Activity className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Full Assessment
          </Button>
          <Button
            onClick={() => runAdvancedSecurityScan("healthcare_security")}
            disabled={activeScans.includes("healthcare_security")}
            variant="outline"
          >
            {activeScans.includes("healthcare_security") ? (
              <Activity className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Healthcare Scan
          </Button>
          <Button
            onClick={() => runAdvancedSecurityScan("incident_simulation")}
            disabled={activeScans.includes("incident_simulation")}
            variant="outline"
          >
            {activeScans.includes("incident_simulation") ? (
              <Activity className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Test Response
          </Button>
        </div>
      </div>

      {/* Real-time Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Security
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getSecurityScoreColor(securityAssessment?.overallSecurityScore || 0)}`}
            >
              {securityAssessment?.overallSecurityScore || 0}%
            </div>
            <Progress
              value={securityAssessment?.overallSecurityScore || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold capitalize ${getThreatLevelColor(realTimeMonitoring?.threatLevel || "low")}`}
            >
              {realTimeMonitoring?.threatLevel || "Low"}
            </div>
            <Badge
              className={getThreatLevelBadge(
                realTimeMonitoring?.threatLevel || "low",
              )}
            >
              {realTimeMonitoring?.activeThreats || 0} Active
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zero Trust</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getSecurityScoreColor(Math.round((securityAssessment?.zeroTrustStatus.trustScore || 0) * 100))}`}
            >
              {Math.round(
                (securityAssessment?.zeroTrustStatus.trustScore || 0) * 100,
              )}
              %
            </div>
            <Badge className="bg-green-100 text-green-800 mt-1">
              {securityAssessment?.zeroTrustStatus.enabled
                ? "Active"
                : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Detection</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                (securityAssessment?.aiThreatDetection.confidence || 0) * 100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityAssessment?.aiThreatDetection.threatsDetected || 0}{" "}
              Detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getSecurityScoreColor(realTimeMonitoring?.systemHealth || 0)}`}
            >
              {realTimeMonitoring?.systemHealth || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {realTimeMonitoring?.securityEvents || 0} Events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {securityAssessment?.criticalAlerts &&
        securityAssessment.criticalAlerts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical Security Alerts:</strong>
              <ul className="list-disc list-inside mt-2">
                {securityAssessment.criticalAlerts.map(
                  (alert: string, index: number) => (
                    <li key={index}>{alert}</li>
                  ),
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

      {/* Detailed Security Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="zero-trust">Zero Trust</TabsTrigger>
          <TabsTrigger value="data-protection">Data Protection</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="incident-response">Incident Response</TabsTrigger>
          <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Architecture
                </CardTitle>
                <CardDescription>
                  Comprehensive security framework status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Zero Trust Architecture</span>
                  <Badge
                    className={getSecurityScoreBadge(
                      Math.round(
                        (securityAssessment?.zeroTrustStatus.trustScore || 0) *
                          100,
                      ),
                    )}
                  >
                    {Math.round(
                      (securityAssessment?.zeroTrustStatus.trustScore || 0) *
                        100,
                    )}
                    %
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI Threat Detection</span>
                  <Badge className="bg-green-100 text-green-800">
                    {securityAssessment?.aiThreatDetection.active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Automated Response</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {securityAssessment?.incidentResponse.automated
                      ? "Enabled"
                      : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Continuous Monitoring</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Healthcare Compliance
                </CardTitle>
                <CardDescription>Regulatory compliance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>HIPAA Compliance</span>
                  <Badge
                    className={getSecurityScoreBadge(
                      securityAssessment?.complianceStatus.hipaa || 0,
                    )}
                  >
                    {securityAssessment?.complianceStatus.hipaa || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>DOH Standards</span>
                  <Badge
                    className={getSecurityScoreBadge(
                      securityAssessment?.complianceStatus.doh || 0,
                    )}
                  >
                    {securityAssessment?.complianceStatus.doh || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>JAWDA Framework</span>
                  <Badge
                    className={getSecurityScoreBadge(
                      securityAssessment?.complianceStatus.jawda || 0,
                    )}
                  >
                    {securityAssessment?.complianceStatus.jawda || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ADHICS Standards</span>
                  <Badge
                    className={getSecurityScoreBadge(
                      securityAssessment?.complianceStatus.adhics || 0,
                    )}
                  >
                    {securityAssessment?.complianceStatus.adhics || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Healthcare Compliance Overview</CardTitle>
                <CardDescription>
                  Comprehensive regulatory compliance status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {securityAssessment?.complianceStatus.overall || 0}%
                  </div>
                  <div className="text-sm text-blue-600">
                    Overall Compliance Score
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>HIPAA Privacy & Security</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={securityAssessment?.complianceStatus.hipaa || 0}
                        className="w-20"
                      />
                      <Badge
                        className={getSecurityScoreBadge(
                          securityAssessment?.complianceStatus.hipaa || 0,
                        )}
                      >
                        {securityAssessment?.complianceStatus.hipaa || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>UAE DOH Standards</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={securityAssessment?.complianceStatus.doh || 0}
                        className="w-20"
                      />
                      <Badge
                        className={getSecurityScoreBadge(
                          securityAssessment?.complianceStatus.doh || 0,
                        )}
                      >
                        {securityAssessment?.complianceStatus.doh || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>JAWDA Quality Framework</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={securityAssessment?.complianceStatus.jawda || 0}
                        className="w-20"
                      />
                      <Badge
                        className={getSecurityScoreBadge(
                          securityAssessment?.complianceStatus.jawda || 0,
                        )}
                      >
                        {securityAssessment?.complianceStatus.jawda || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ADHICS Standards</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={securityAssessment?.complianceStatus.adhics || 0}
                        className="w-20"
                      />
                      <Badge
                        className={getSecurityScoreBadge(
                          securityAssessment?.complianceStatus.adhics || 0,
                        )}
                      >
                        {securityAssessment?.complianceStatus.adhics || 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Recommendations</CardTitle>
                <CardDescription>
                  Actions to improve compliance posture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAssessment?.recommendations
                    .slice(0, 6)
                    .map((recommendation: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    )) || (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-green-600 font-medium">
                        All compliance requirements met
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        No immediate actions required
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zero-trust" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Zero Trust Architecture Status
              </CardTitle>
              <CardDescription>
                Continuous verification and microsegmentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(
                      (securityAssessment?.zeroTrustStatus.trustScore || 0) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-sm text-blue-600">Zero Trust Score</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-green-600">
                      Network Security
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      88%
                    </div>
                    <div className="text-sm text-purple-600">
                      Identity Trust
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      85%
                    </div>
                    <div className="text-sm text-orange-600">Device Trust</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Continuous Verification</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {securityAssessment?.zeroTrustStatus
                        .continuousVerification
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Network Microsegmentation</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {securityAssessment?.zeroTrustStatus.microsegmentation
                        ? "Deployed"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      <span>Identity Verification</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Enhanced
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-purple-500" />
                      <span>Least Privilege Access</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Enforced
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Advanced Data Protection
              </CardTitle>
              <CardDescription>
                Encryption, privacy compliance, and data integrity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {securityAssessment?.dataProtection.encryptionScore || 0}%
                  </div>
                  <div className="text-sm text-green-600">
                    Overall Data Protection Score
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Encryption & Security</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AES-256 Encryption</span>
                        <Badge
                          className={getSecurityScoreBadge(
                            securityAssessment?.dataProtection
                              .encryptionScore || 0,
                          )}
                        >
                          {securityAssessment?.dataProtection.encryptionScore ||
                            0}
                          %
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Integrity</span>
                        <Badge
                          className={getSecurityScoreBadge(
                            securityAssessment?.dataProtection.integrityScore ||
                              0,
                          )}
                        >
                          {securityAssessment?.dataProtection.integrityScore ||
                            0}
                          %
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Backup Security</span>
                        <Badge
                          className={getSecurityScoreBadge(
                            securityAssessment?.dataProtection.backupScore || 0,
                          )}
                        >
                          {securityAssessment?.dataProtection.backupScore || 0}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Privacy Compliance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">HIPAA Privacy</span>
                        <Badge
                          className={getSecurityScoreBadge(
                            securityAssessment?.dataProtection.privacyScore ||
                              0,
                          )}
                        >
                          {securityAssessment?.dataProtection.privacyScore || 0}
                          %
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">UAE Data Protection</span>
                        <Badge className={getSecurityScoreBadge(91)}>91%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">PHI Safeguards</span>
                        <Badge className={getSecurityScoreBadge(96)}>96%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Vulnerability Management
              </CardTitle>
              <CardDescription>
                System vulnerabilities and remediation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {securityAssessment?.vulnerabilityManagement
                        .criticalVulns || 0}
                    </div>
                    <div className="text-sm text-red-600">Critical</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {securityAssessment?.vulnerabilityManagement.highVulns ||
                        0}
                    </div>
                    <div className="text-sm text-orange-600">High</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {securityAssessment?.vulnerabilityManagement
                        .mediumVulns || 0}
                    </div>
                    <div className="text-sm text-yellow-600">Medium</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {securityAssessment?.vulnerabilityManagement.lowVulns ||
                        0}
                    </div>
                    <div className="text-sm text-blue-600">Low</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Remediation Progress</span>
                    <span className="text-sm text-gray-600">
                      {securityAssessment?.vulnerabilityManagement
                        .remediationProgress || 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      securityAssessment?.vulnerabilityManagement
                        .remediationProgress || 0
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incident-response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Incident Response
              </CardTitle>
              <CardDescription>
                Real-time threat response and recovery capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {securityAssessment?.incidentResponse.responseTime || 0}s
                    </div>
                    <div className="text-sm text-blue-600">
                      Avg Response Time
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {securityAssessment?.incidentResponse.playbooksActive ||
                        0}
                    </div>
                    <div className="text-sm text-green-600">
                      Active Playbooks
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {securityAssessment?.incidentResponse
                        .recoveryCapability || 0}
                      %
                    </div>
                    <div className="text-sm text-purple-600">
                      Recovery Capability
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Automated Response</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {securityAssessment?.incidentResponse.automated
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span>24/7 Monitoring</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <span>Compliance Reporting</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Automated
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhancements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Security Enhancements
              </CardTitle>
              <CardDescription>
                Recent security improvements and optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEnhancements.length > 0 ? (
                  securityEnhancements.map((enhancement, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">
                          {enhancement.category.replace(/_/g, " ")}
                        </h4>
                        <Badge
                          className={getSecurityScoreBadge(
                            enhancement.complianceScore,
                          )}
                        >
                          {enhancement.complianceScore}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          Threats Prevented: {enhancement.threatsPrevented}
                        </div>
                        <div>
                          Vulnerabilities Fixed:{" "}
                          {enhancement.vulnerabilitiesFixed}
                        </div>
                        <div>
                          Time:{" "}
                          {new Date(enhancement.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {enhancement.improvements.map(
                          (improvement: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{improvement}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      No security enhancements recorded yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSecurityDashboard;
