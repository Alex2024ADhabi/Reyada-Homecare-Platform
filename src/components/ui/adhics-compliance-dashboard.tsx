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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Lock,
  Users,
  Database,
  Activity,
} from "lucide-react";
import {
  adhicsComplianceService,
  ADHICSComplianceResult,
  ADHICSViolation,
  ADHICSControlImplementation,
} from "@/services/adhics-compliance.service";

export default function ADHICSComplianceDashboard() {
  const [complianceResult, setComplianceResult] =
    useState<ADHICSComplianceResult | null>(null);
  const [controlImplementations, setControlImplementations] = useState<
    ADHICSControlImplementation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);
  const [selectedViolation, setSelectedViolation] =
    useState<ADHICSViolation | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const result =
        await adhicsComplianceService.performComplianceAssessment();
      const controls = adhicsComplianceService.getAllControlImplementations();

      setComplianceResult(result);
      setControlImplementations(controls);
    } catch (error) {
      console.error("Failed to load compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAssessment = async () => {
    try {
      setAssessmentInProgress(true);
      const result =
        await adhicsComplianceService.performComplianceAssessment();
      setComplianceResult(result);
    } catch (error) {
      console.error("Assessment failed:", error);
    } finally {
      setAssessmentInProgress(false);
    }
  };

  const generateReport = async () => {
    try {
      setReportGenerating(true);
      const report = await adhicsComplianceService.generateComplianceReport();

      // Create and download the report
      const reportContent = JSON.stringify(report, null, 2);
      const blob = new Blob([reportContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adhics-compliance-report-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setReportGenerating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive";
      case "High":
        return "destructive";
      case "Medium":
        return "outline";
      case "Low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getImplementationStatusColor = (status: string) => {
    switch (status) {
      case "Implemented":
        return "text-green-600";
      case "Partially Implemented":
        return "text-yellow-600";
      case "Not Implemented":
        return "text-red-600";
      case "Not Applicable":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">
          Loading ADHICS V2 compliance data...
        </span>
      </div>
    );
  }

  if (!complianceResult) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <p className="text-lg mb-4">No compliance data available</p>
          <Button onClick={loadComplianceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Compliance Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ADHICS V2 Compliance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Abu Dhabi Healthcare Information and Cyber Security Standard V2
            Compliance Monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={runAssessment}
            disabled={assessmentInProgress}
            variant="outline"
          >
            {assessmentInProgress ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            {assessmentInProgress ? "Assessing..." : "Run Assessment"}
          </Button>
          <Button onClick={generateReport} disabled={reportGenerating}>
            {reportGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {reportGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceResult.overallScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceResult.complianceLevel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Section A</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceResult.sectionAScore}%
            </div>
            <p className="text-xs text-muted-foreground">Governance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Section B</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceResult.sectionBScore}%
            </div>
            <p className="text-xs text-muted-foreground">Controls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complianceResult.violations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                complianceResult.violations.filter(
                  (v) => v.severity === "Critical",
                ).length
              }{" "}
              Critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Certification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Certification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge
                variant={
                  complianceResult.certificationStatus === "Certified"
                    ? "default"
                    : complianceResult.certificationStatus === "Pending"
                      ? "secondary"
                      : "destructive"
                }
                className="text-lg px-4 py-2"
              >
                {complianceResult.certificationStatus}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Last Assessment:{" "}
                {new Date(complianceResult.lastAssessment).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Next Assessment Due:{" "}
                {new Date(complianceResult.nextAssessmentDue).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {complianceResult.isCompliant ? "✓" : "✗"}
              </div>
              <p className="text-sm text-gray-600">
                {complianceResult.isCompliant ? "Compliant" : "Non-Compliant"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="violations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="controls">Control Implementations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="governance">Section A - Governance</TabsTrigger>
          <TabsTrigger value="technical">Section B - Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Violations
              </CardTitle>
              <CardDescription>
                Active violations requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {complianceResult.violations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getSeverityBadgeVariant(
                              violation.severity,
                            )}
                          >
                            {violation.severity}
                          </Badge>
                          <span className="font-medium">
                            {violation.control}
                          </span>
                          <Badge variant="outline">
                            Section {violation.section}
                          </Badge>
                        </div>
                        <Badge
                          variant={
                            violation.status === "Open"
                              ? "destructive"
                              : violation.status === "In Progress"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {violation.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-2">
                        {violation.description}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Deadline:</strong>{" "}
                        {new Date(violation.deadline).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <strong>Remediation Steps:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {violation.remediation.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      {violation.assignedTo && (
                        <div className="text-sm text-gray-600 mt-2">
                          <strong>Assigned to:</strong> {violation.assignedTo}
                        </div>
                      )}
                    </div>
                  ))}
                  {complianceResult.violations.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-semibold text-green-600">
                        No violations found!
                      </p>
                      <p className="text-gray-600">
                        Your system is fully compliant with ADHICS V2 standards.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Control Implementations
              </CardTitle>
              <CardDescription>
                Status of all ADHICS V2 control implementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {controlImplementations.map((control) => (
                    <div
                      key={control.controlId}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{control.controlId}</Badge>
                          <Badge variant="outline">
                            Section {control.section}
                          </Badge>
                          <span className="font-medium">
                            {control.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${getImplementationStatusColor(control.implementationStatus)}`}
                          >
                            {control.implementationStatus}
                          </span>
                          {control.evidenceProvided && (
                            <Badge variant="secondary">Evidence Provided</Badge>
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{control.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {control.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Maturity Level:</strong>{" "}
                          {control.maturityLevel}/5
                        </div>
                        <div>
                          <strong>Risk Rating:</strong> {control.riskRating}
                        </div>
                        <div>
                          <strong>Business Impact:</strong>{" "}
                          {control.businessImpact}
                        </div>
                        <div>
                          <strong>Last Reviewed:</strong>{" "}
                          {new Date(control.lastReviewed).toLocaleDateString()}
                        </div>
                      </div>
                      {control.implementationNotes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Notes:</strong> {control.implementationNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Recommendations
              </CardTitle>
              <CardDescription>
                Actionable recommendations to improve compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceResult.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Information Security Governance</CardTitle>
                <CardDescription>
                  ADHICS Section A compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>ISGC Establishment</span>
                    <Badge variant="default">Implemented</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>HIIP Workgroup</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CISO Designation</span>
                    <Badge variant="default">Appointed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Risk Management</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governance Metrics</CardTitle>
                <CardDescription>Key governance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Policy Coverage</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Risk Assessment Completion</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Asset Classification</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Audit Compliance</span>
                      <span>97%</span>
                    </div>
                    <Progress value={97} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Technical Controls</CardTitle>
                <CardDescription>
                  ADHICS Section B implementation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Access Control (AC)</span>
                    <Badge variant="default">Implemented</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Privacy (DP)</span>
                    <Badge variant="default">Implemented</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cryptographic Controls (SA)</span>
                    <Badge variant="default">Implemented</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Incident Management (IM)</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>Technical security indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Encryption Coverage</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Access Control Effectiveness</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Vulnerability Management</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Incident Response Readiness</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
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
