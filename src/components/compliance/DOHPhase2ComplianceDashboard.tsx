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
  Activity,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
} from "lucide-react";
import { dohComplianceAutomationService } from "@/services/doh-compliance-automation.service";

interface ComplianceViolation {
  id: string;
  ruleId: string;
  entityType: string;
  entityId: string;
  violationType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: string;
  status: string;
}

interface DashboardData {
  overallCompliance: number;
  nineDomainsCompliance: number;
  patientSafetyScore: number;
  clinicalDocumentationScore: number;
  staffComplianceScore: number;
  jawdaIntegrationScore: number;
  healthcareErrorPatternsScore: number;
  patientSafetyMonitoringScore: number;
  recentViolations: ComplianceViolation[];
  upcomingAudits: any[];
  complianceTrends: any[];
  actionItems: any[];
  integrationStatus: {
    jawdaService: boolean;
    healthcareErrorService: boolean;
    patientSafetyService: boolean;
    realTimeMonitoring: boolean;
  };
  phase2Progress: {
    completedServices: string[];
    pendingServices: string[];
    overallProgress: number;
  };
  patientSafetyMetrics: {
    activeProfiles: number;
    criticalAlerts: number;
    resolvedAlerts: number;
    averageRiskLevel: string;
    interventionsActive: number;
  };
}

interface Phase2Status {
  overallProgress: number;
  serviceStatus: Record<
    string,
    {
      implemented: boolean;
      integrated: boolean;
      healthStatus: "healthy" | "warning" | "error";
      lastCheck: string;
    }
  >;
  nextSteps: string[];
  estimatedCompletion: string;
}

export default function DOHPhase2ComplianceDashboard({
  className = "",
}: {
  className?: string;
}) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [phase2Status, setPhase2Status] = useState<Phase2Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadPhase2Status();

    // Set up real-time updates
    const interval = setInterval(() => {
      if (realTimeEnabled) {
        loadDashboardData();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data =
        await dohComplianceAutomationService.generateDOHComplianceDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhase2Status = async () => {
    try {
      const status =
        await dohComplianceAutomationService.getPhase2ImplementationStatus();
      setPhase2Status(status);
    } catch (err) {
      console.error("Phase 2 status error:", err);
    }
  };

  const toggleRealTimeMonitoring = () => {
    if (realTimeEnabled) {
      dohComplianceAutomationService.disableRealTimeMonitoring();
      setRealTimeEnabled(false);
    } else {
      dohComplianceAutomationService.enableRealTimeMonitoring();
      setRealTimeEnabled(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 95) return "default";
    if (score >= 85) return "secondary";
    return "destructive";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  const getHealthStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                Loading DOH Phase 2 Compliance Dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DOH Phase 2 Compliance Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive DOH compliance monitoring with Phase 2 integrations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleRealTimeMonitoring}
              variant={realTimeEnabled ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>{realTimeEnabled ? "Real-time ON" : "Real-time OFF"}</span>
            </Button>
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Phase 2 Progress Overview */}
        {phase2Status && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Phase 2 Implementation Progress</span>
              </CardTitle>
              <CardDescription>
                Overall progress of DOH Compliance Automation Phase 2 services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Overall Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {phase2Status.overallProgress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={phase2Status.overallProgress}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(phase2Status.serviceStatus).map(
                    ([service, status]) => (
                      <div key={service} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {service.replace(/-/g, " ")}
                          </span>
                          {getHealthStatusIcon(status.healthStatus)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              status.implemented ? "default" : "secondary"
                            }
                          >
                            {status.implemented ? "Implemented" : "Pending"}
                          </Badge>
                          {status.integrated && (
                            <Badge variant="outline">Integrated</Badge>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Compliance Metrics */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Compliance
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.overallCompliance.toFixed(1)}%
                </div>
                <Badge
                  variant={getScoreBadgeVariant(
                    dashboardData.overallCompliance,
                  )}
                  className="mt-2"
                >
                  {dashboardData.overallCompliance >= 95
                    ? "Excellent"
                    : dashboardData.overallCompliance >= 85
                      ? "Good"
                      : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nine Domains
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.nineDomainsCompliance.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  DOH Assessment Compliance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Patient Safety
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.patientSafetyScore.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Safety Incident Management
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Safety Monitoring
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.patientSafetyMonitoringScore.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Real-time Safety Monitoring
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  JAWDA Integration
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.jawdaIntegrationScore.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Standards Automation
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Tabs */}
        {dashboardData && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="safety">Patient Safety</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="actions">Action Items</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Scores by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        name: "Clinical Documentation",
                        score: dashboardData.clinicalDocumentationScore,
                      },
                      {
                        name: "Staff Management",
                        score: dashboardData.staffComplianceScore,
                      },
                      {
                        name: "Healthcare Error Patterns",
                        score: dashboardData.healthcareErrorPatternsScore,
                      },
                      {
                        name: "Patient Safety Monitoring",
                        score: dashboardData.patientSafetyMonitoringScore,
                      },
                      {
                        name: "JAWDA Integration",
                        score: dashboardData.jawdaIntegrationScore,
                      },
                    ].map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          <span
                            className={`text-sm font-bold ${getScoreColor(item.score)}`}
                          >
                            {item.score.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={item.score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Integration Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">JAWDA Service</span>
                      <Badge
                        variant={
                          dashboardData.integrationStatus.jawdaService
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboardData.integrationStatus.jawdaService
                          ? "Connected"
                          : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Healthcare Error Service
                      </span>
                      <Badge
                        variant={
                          dashboardData.integrationStatus.healthcareErrorService
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboardData.integrationStatus.healthcareErrorService
                          ? "Connected"
                          : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Patient Safety Service
                      </span>
                      <Badge
                        variant={
                          dashboardData.integrationStatus.patientSafetyService
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboardData.integrationStatus.patientSafetyService
                          ? "Connected"
                          : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Real-time Monitoring
                      </span>
                      <Badge
                        variant={
                          dashboardData.integrationStatus.realTimeMonitoring
                            ? "default"
                            : "secondary"
                        }
                      >
                        {dashboardData.integrationStatus.realTimeMonitoring
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="safety" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Safety Metrics</CardTitle>
                    <CardDescription>
                      Real-time patient safety monitoring statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {dashboardData.patientSafetyMetrics.activeProfiles}
                        </div>
                        <div className="text-sm text-gray-600">
                          Active Profiles
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {dashboardData.patientSafetyMetrics.criticalAlerts}
                        </div>
                        <div className="text-sm text-gray-600">
                          Critical Alerts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {dashboardData.patientSafetyMetrics.resolvedAlerts}
                        </div>
                        <div className="text-sm text-gray-600">
                          Resolved Alerts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {
                            dashboardData.patientSafetyMetrics
                              .interventionsActive
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          Active Interventions
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Average Risk Level
                        </span>
                        <Badge
                          variant={
                            dashboardData.patientSafetyMetrics
                              .averageRiskLevel === "critical"
                              ? "destructive"
                              : dashboardData.patientSafetyMetrics
                                    .averageRiskLevel === "high"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {dashboardData.patientSafetyMetrics.averageRiskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Safety Monitoring Status</CardTitle>
                    <CardDescription>
                      Current status of patient safety monitoring systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Real-time Monitoring
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Alert Processing
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600">
                            Operational
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Safety Protocols
                        </span>
                        <Badge variant="default">3 Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Integration Health
                        </span>
                        <Badge
                          variant={
                            dashboardData.integrationStatus.patientSafetyService
                              ? "default"
                              : "destructive"
                          }
                        >
                          {dashboardData.integrationStatus.patientSafetyService
                            ? "Healthy"
                            : "Degraded"}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <strong>Safety Score:</strong>{" "}
                        {dashboardData.patientSafetyMonitoringScore.toFixed(1)}%
                      </div>
                      <Progress
                        value={dashboardData.patientSafetyMonitoringScore}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="violations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Compliance Violations</CardTitle>
                  <CardDescription>
                    Latest violations detected by the automated compliance
                    system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.recentViolations.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No recent violations detected
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.recentViolations.map((violation) => (
                        <div
                          key={violation.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{violation.ruleId}</Badge>
                            <Badge
                              variant={
                                violation.severity === "critical"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {violation.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>
                              {violation.entityType}: {violation.entityId}
                            </span>
                            <span>
                              {new Date(
                                violation.detectedAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dashboardData.phase2Progress.completedServices.map(
                        (service) => (
                          <div
                            key={service}
                            className="flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{service}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pending Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dashboardData.phase2Progress.pendingServices.map(
                        (service) => (
                          <div
                            key={service}
                            className="flex items-center space-x-2"
                          >
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">{service}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <CardDescription>
                    Required actions to maintain DOH compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.actionItems.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-gray-600">No pending action items</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.actionItems.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={
                                item.priority === "high"
                                  ? "destructive"
                                  : item.priority === "medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {item.priority} priority
                            </Badge>
                            <span className="text-xs text-gray-600">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            Assigned to: {item.assignedTo}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Next Steps */}
        {phase2Status && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Next Steps</span>
              </CardTitle>
              <CardDescription>
                Recommended actions to complete Phase 2 implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {phase2Status.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Estimated Completion:</strong>{" "}
                  {new Date(
                    phase2Status.estimatedCompletion,
                  ).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
