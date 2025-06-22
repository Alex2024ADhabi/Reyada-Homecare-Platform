import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileText,
  Users,
  Clock,
  Activity,
  BarChart3,
  Eye,
  Lock,
  Database,
  Zap,
  Bell,
  Download,
  RefreshCw,
  Settings,
  Target,
  Gauge,
  AlertCircle,
  Globe,
  Server,
} from "lucide-react";

interface ComplianceMetrics {
  doh: {
    overallScore: number;
    nineDomainCompliance: number;
    documentationStandards: number;
    patientSafetyTaxonomy: number;
    auditReadiness: number;
    lastAuditDate: string;
    nextAuditDue: string;
  };
  daman: {
    overallScore: number;
    authorizationSuccessRate: number;
    providerAuthentication: number;
    dataProtection: number;
    integrationHealth: number;
    mscCompliance: number;
    homecareStandards: number;
  };
  jawda: {
    overallScore: number;
    kpiDataCollection: number;
    trainingCompliance: number;
    qualityMetrics: number;
    riskManagement: number;
    incidentClassification: number;
    auditReadiness: number;
  };
  crossCompliance: {
    dataConsistency: number;
    reportingAlignment: number;
    processIntegration: number;
    standardsHarmonization: number;
  };
}

interface ComplianceAlert {
  id: string;
  source: "DOH" | "DAMAN" | "JAWDA" | "CROSS";
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  dueDate: string;
  assignedTo: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

interface ValidationResult {
  entity: string;
  dohCompliant: boolean;
  damanCompliant: boolean;
  jawdaCompliant: boolean;
  crossValidation: {
    dataConsistency: boolean;
    fieldMapping: boolean;
    businessRules: boolean;
  };
  issues: string[];
  recommendations: string[];
}

const ComplianceIntegrationHub: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    loadComplianceData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadComplianceData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);

      // Load compliance metrics from all sources
      const [metricsData, alertsData, validationData] = await Promise.all([
        loadComplianceMetrics(),
        loadComplianceAlerts(),
        loadValidationResults(),
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setValidationResults(validationData);
    } catch (error) {
      console.error("Error loading compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceMetrics = async (): Promise<ComplianceMetrics> => {
    // Mock data - in production, this would fetch from actual APIs
    return {
      doh: {
        overallScore: 94.2,
        nineDomainCompliance: 96.8,
        documentationStandards: 92.5,
        patientSafetyTaxonomy: 98.1,
        auditReadiness: 89.7,
        lastAuditDate: "2024-11-15",
        nextAuditDue: "2025-05-15",
      },
      daman: {
        overallScore: 87.5,
        authorizationSuccessRate: 94.2,
        providerAuthentication: 89.3,
        dataProtection: 92.1,
        integrationHealth: 97.8,
        mscCompliance: 91.4,
        homecareStandards: 88.6,
      },
      jawda: {
        overallScore: 95.8,
        kpiDataCollection: 98.0,
        trainingCompliance: 100.0,
        qualityMetrics: 97.0,
        riskManagement: 93.0,
        incidentClassification: 94.0,
        auditReadiness: 96.0,
      },
      crossCompliance: {
        dataConsistency: 91.2,
        reportingAlignment: 88.7,
        processIntegration: 93.4,
        standardsHarmonization: 86.9,
      },
    };
  };

  const loadComplianceAlerts = async (): Promise<ComplianceAlert[]> => {
    return [
      {
        id: "alert-001",
        source: "DOH",
        type: "documentation_gap",
        severity: "medium",
        title: "Missing 9-Domain Assessment Documentation",
        description: "3 patient episodes missing complete 9-domain assessments",
        impact: "Potential audit finding and compliance score reduction",
        recommendation: "Complete missing assessments within 48 hours",
        dueDate: "2024-12-20",
        assignedTo: "Clinical Team Lead",
        status: "open",
        createdAt: "2024-12-18T10:30:00Z",
      },
      {
        id: "alert-002",
        source: "DAMAN",
        type: "authorization_expiry",
        severity: "high",
        title: "Authorization Expiring Soon",
        description: "5 patient authorizations expire within 7 days",
        impact: "Service interruption and revenue loss",
        recommendation: "Submit renewal requests immediately",
        dueDate: "2024-12-19",
        assignedTo: "Authorization Team",
        status: "in_progress",
        createdAt: "2024-12-18T09:15:00Z",
      },
      {
        id: "alert-003",
        source: "JAWDA",
        type: "training_due",
        severity: "medium",
        title: "Staff Training Renewal Due",
        description: "2 staff members require training renewal",
        impact: "Compliance score reduction",
        recommendation: "Schedule training sessions this week",
        dueDate: "2024-12-25",
        assignedTo: "HR Manager",
        status: "open",
        createdAt: "2024-12-18T08:45:00Z",
      },
      {
        id: "alert-004",
        source: "CROSS",
        type: "data_inconsistency",
        severity: "high",
        title: "Cross-System Data Mismatch",
        description:
          "Patient data inconsistency detected between DOH and DAMAN systems",
        impact: "Reporting accuracy and audit compliance",
        recommendation: "Reconcile data and update master records",
        dueDate: "2024-12-19",
        assignedTo: "Data Management Team",
        status: "open",
        createdAt: "2024-12-18T11:00:00Z",
      },
    ];
  };

  const loadValidationResults = async (): Promise<ValidationResult[]> => {
    return [
      {
        entity: "Patient Episode EP-2024-001",
        dohCompliant: true,
        damanCompliant: true,
        jawdaCompliant: true,
        crossValidation: {
          dataConsistency: true,
          fieldMapping: true,
          businessRules: true,
        },
        issues: [],
        recommendations: [],
      },
      {
        entity: "Patient Episode EP-2024-002",
        dohCompliant: false,
        damanCompliant: true,
        jawdaCompliant: true,
        crossValidation: {
          dataConsistency: false,
          fieldMapping: true,
          businessRules: false,
        },
        issues: [
          "Missing 9-domain assessment",
          "Inconsistent patient demographics across systems",
        ],
        recommendations: [
          "Complete 9-domain assessment",
          "Update patient demographics in DOH system",
        ],
      },
    ];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "DOH":
        return "bg-green-100 text-green-800";
      case "DAMAN":
        return "bg-blue-100 text-blue-800";
      case "JAWDA":
        return "bg-purple-100 text-purple-800";
      case "CROSS":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 85) return "text-blue-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const generateUnifiedReport = async () => {
    try {
      // Include revenue cycle integration compliance data
      const revenueComplianceData = await generateRevenueComplianceReport();

      const reportData = {
        generatedAt: new Date().toISOString(),
        reportType: "unified_compliance_report",
        version: "2.0",
        metrics: metrics,
        alerts: alerts.filter((alert) => alert.status !== "resolved"),
        validationResults: validationResults,
        revenueCompliance: revenueComplianceData,
        summary: {
          overallComplianceScore: metrics
            ? Math.round(
                (metrics.doh.overallScore +
                  metrics.daman.overallScore +
                  metrics.jawda.overallScore) /
                  3,
              )
            : 0,
          criticalAlerts: alerts.filter(
            (alert) => alert.severity === "critical",
          ).length,
          highAlerts: alerts.filter((alert) => alert.severity === "high")
            .length,
          totalValidationIssues: validationResults.reduce(
            (sum, result) => sum + result.issues.length,
            0,
          ),
          revenueIntegrationScore: revenueComplianceData.integrationScore,
          workflowAutomationRate: revenueComplianceData.automationRate,
        },
        recommendations: [
          "Implement automated cross-system data validation",
          "Establish unified compliance dashboard for real-time monitoring",
          "Create standardized reporting templates across all systems",
          "Develop integrated training program covering all compliance areas",
          "Enhance revenue cycle workflow automation for compliance",
          "Implement real-time payment reconciliation monitoring",
          "Establish automated billing compliance validation",
        ],
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unified-compliance-report-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating unified report:", error);
    }
  };

  const generateRevenueComplianceReport = async () => {
    // Generate comprehensive revenue cycle compliance report
    return {
      integrationScore: 94.5,
      automationRate: 87.3,
      claimsProcessingCompliance: {
        validationRate: 98.5,
        authorizationCompliance: 96.2,
        submissionAccuracy: 99.1,
        processingTimeCompliance: 94.8,
      },
      paymentReconciliationCompliance: {
        matchingAccuracy: 96.8,
        varianceManagement: 92.4,
        reconciliationTimeliness: 98.2,
        auditTrailCompleteness: 99.5,
      },
      revenueOptimizationCompliance: {
        denialPreventionRate: 87.5,
        paymentAccelerationRate: 91.2,
        leakageDetectionRate: 89.7,
        collectionOptimizationRate: 93.1,
      },
      workflowIntegrationHealth: {
        crossSystemDataConsistency: 95.3,
        realTimeProcessingRate: 92.8,
        automatedDecisionAccuracy: 94.6,
        escalationManagement: 96.1,
      },
      complianceGaps: [
        "Manual intervention required for 12.7% of complex cases",
        "Cross-system data validation needs enhancement",
        "Real-time monitoring coverage at 92.8%",
      ],
      recommendations: [
        "Implement AI-driven complex case automation",
        "Enhance cross-system validation protocols",
        "Expand real-time monitoring to 98%+ coverage",
      ],
    };
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: "resolved" as const }
          : alert,
      ),
    );
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance integration hub...</p>
        </div>
      </div>
    );
  }

  const overallScore = metrics
    ? Math.round(
        (metrics.doh.overallScore +
          metrics.daman.overallScore +
          metrics.jawda.overallScore) /
          3,
      )
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              Compliance Integration Hub
            </h1>
            <p className="text-gray-600 mt-2">
              Centralized monitoring and validation across DOH, DAMAN, and JAWDA
              compliance frameworks
            </p>
            <div className="flex items-center mt-3 space-x-6 text-sm">
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                DOH Standards Active
              </span>
              <span className="flex items-center text-blue-600">
                <Server className="h-4 w-4 mr-1" />
                DAMAN Integration
              </span>
              <span className="flex items-center text-purple-600">
                <Target className="h-4 w-4 mr-1" />
                JAWDA KPIs Monitored
              </span>
              <span className="flex items-center text-orange-600">
                <Globe className="h-4 w-4 mr-1" />
                Cross-Validation Active
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={generateUnifiedReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Unified Report
            </Button>
            <Button variant="outline" onClick={loadComplianceData}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(
        (alert) => alert.severity === "critical" && alert.status !== "resolved",
      ).length > 0 && (
        <div className="mb-6">
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Critical Compliance Issues Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts
                  .filter(
                    (alert) =>
                      alert.severity === "critical" &&
                      alert.status !== "resolved",
                  )
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSourceColor(alert.source)}>
                            {alert.source}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {alert.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Overall Compliance Score
                </p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
                >
                  {overallScore}%
                </p>
                <Progress value={overallScore} className="mt-2 h-2" />
              </div>
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  DOH Compliance
                </p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(metrics?.doh.overallScore || 0)}`}
                >
                  {metrics?.doh.overallScore || 0}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  9-Domain Assessment
                </p>
              </div>
              <FileText className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  JAWDA Score
                </p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(metrics?.jawda.overallScore || 0)}`}
                >
                  {metrics?.jawda.overallScore || 0}%
                </p>
                <p className="text-xs text-purple-600 mt-1">KPI Automation</p>
              </div>
              <Target className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Cross-Validation
                </p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(metrics?.crossCompliance.dataConsistency || 0)}`}
                >
                  {metrics?.crossCompliance.dataConsistency || 0}%
                </p>
                <p className="text-xs text-orange-600 mt-1">Data Consistency</p>
              </div>
              <Database className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doh">DOH Compliance</TabsTrigger>
          <TabsTrigger value="daman">DAMAN Integration</TabsTrigger>
          <TabsTrigger value="jawda">JAWDA Monitoring</TabsTrigger>
          <TabsTrigger value="validation">Cross-Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Compliance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {alerts
                      .filter((alert) => alert.status !== "resolved")
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getSourceColor(alert.source)}>
                                {alert.source}
                              </Badge>
                              <Badge
                                className={getSeverityColor(alert.severity)}
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm">
                              {alert.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Due:{" "}
                              {new Date(alert.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      DOH 9-Domain Compliance
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={metrics?.doh.nineDomainCompliance || 0}
                        className="w-20 h-2"
                      />
                      <span className="text-sm text-gray-600">
                        {metrics?.doh.nineDomainCompliance || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      DAMAN Authorization Success
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={metrics?.daman.authorizationSuccessRate || 0}
                        className="w-20 h-2"
                      />
                      <span className="text-sm text-gray-600">
                        {metrics?.daman.authorizationSuccessRate || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      JAWDA KPI Collection
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={metrics?.jawda.kpiDataCollection || 0}
                        className="w-20 h-2"
                      />
                      <span className="text-sm text-gray-600">
                        {metrics?.jawda.kpiDataCollection || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Cross-System Integration
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={metrics?.crossCompliance.processIntegration || 0}
                        className="w-20 h-2"
                      />
                      <span className="text-sm text-gray-600">
                        {metrics?.crossCompliance.processIntegration || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Compliance Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{result.entity}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">DOH:</span>
                        {getComplianceIcon(result.dohCompliant)}
                        <span className="text-sm text-gray-600">DAMAN:</span>
                        {getComplianceIcon(result.damanCompliant)}
                        <span className="text-sm text-gray-600">JAWDA:</span>
                        {getComplianceIcon(result.jawdaCompliant)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Data Consistency:</span>
                        <div className="flex items-center space-x-1 mt-1">
                          {getComplianceIcon(
                            result.crossValidation.dataConsistency,
                          )}
                          <span
                            className={
                              result.crossValidation.dataConsistency
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {result.crossValidation.dataConsistency
                              ? "Consistent"
                              : "Issues Found"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Field Mapping:</span>
                        <div className="flex items-center space-x-1 mt-1">
                          {getComplianceIcon(
                            result.crossValidation.fieldMapping,
                          )}
                          <span
                            className={
                              result.crossValidation.fieldMapping
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {result.crossValidation.fieldMapping
                              ? "Aligned"
                              : "Misaligned"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Business Rules:</span>
                        <div className="flex items-center space-x-1 mt-1">
                          {getComplianceIcon(
                            result.crossValidation.businessRules,
                          )}
                          <span
                            className={
                              result.crossValidation.businessRules
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {result.crossValidation.businessRules
                              ? "Compliant"
                              : "Violations"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {result.issues.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-red-600">
                          Issues:
                        </span>
                        <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                          {result.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.recommendations.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-blue-600">
                          Recommendations:
                        </span>
                        <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs for DOH, DAMAN, and JAWDA would be implemented similarly */}
        <TabsContent value="doh">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">9-Domain Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics?.doh.nineDomainCompliance || 0}%
                  </div>
                  <Progress
                    value={metrics?.doh.nineDomainCompliance || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Compliance Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Documentation Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics?.doh.documentationStandards || 0}%
                  </div>
                  <Progress
                    value={metrics?.doh.documentationStandards || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Standards Met</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics?.doh.auditReadiness || 0}%
                  </div>
                  <Progress
                    value={metrics?.doh.auditReadiness || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Ready for Audit</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daman">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authorization Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics?.daman.authorizationSuccessRate || 0}%
                  </div>
                  <Progress
                    value={metrics?.daman.authorizationSuccessRate || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Success Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integration Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics?.daman.integrationHealth || 0}%
                  </div>
                  <Progress
                    value={metrics?.daman.integrationHealth || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">System Health</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">MSC Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics?.daman.mscCompliance || 0}%
                  </div>
                  <Progress
                    value={metrics?.daman.mscCompliance || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">MSC Standards</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jawda">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KPI Data Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics?.jawda.kpiDataCollection || 0}%
                  </div>
                  <Progress
                    value={metrics?.jawda.kpiDataCollection || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Automation Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics?.jawda.trainingCompliance || 0}%
                  </div>
                  <Progress
                    value={metrics?.jawda.trainingCompliance || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Staff Trained</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics?.jawda.qualityMetrics || 0}%
                  </div>
                  <Progress
                    value={metrics?.jawda.qualityMetrics || 0}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">Quality Score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceIntegrationHub;
