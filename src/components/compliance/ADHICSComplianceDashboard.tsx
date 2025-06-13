import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Download,
  Settings,
  Lock,
  Users,
  Activity,
  FileText,
  Calendar,
  Target,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

interface ADHICSViolation {
  id: string;
  section: "A" | "B";
  control: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  remediation: string[];
  deadline: string;
  status: "Open" | "In Progress" | "Resolved" | "Deferred";
  assignedTo?: string;
  estimatedEffort?: string;
}

interface ADHICSControlImplementation {
  controlId: string;
  section: "A" | "B";
  category: string;
  title: string;
  description: string;
  implementationStatus:
    | "Implemented"
    | "Partially Implemented"
    | "Not Implemented"
    | "Not Applicable";
  evidenceProvided: boolean;
  lastReviewed: string;
  reviewedBy: string;
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  riskRating: "Low" | "Medium" | "High" | "Critical";
  businessImpact: "Low" | "Medium" | "High" | "Critical";
  implementationNotes?: string;
}

interface ADHICSComplianceResult {
  isCompliant: boolean;
  overallScore: number;
  sectionAScore: number;
  sectionBScore: number;
  violations: ADHICSViolation[];
  recommendations: string[];
  complianceLevel: "Excellent" | "Good" | "Acceptable" | "Needs Improvement";
  lastAssessment: string;
  nextAssessmentDue: string;
  certificationStatus: "Certified" | "Pending" | "Expired" | "Not Certified";
}

interface ADHICSComplianceDashboardProps {
  facilityId?: string;
  onComplianceUpdate?: (result: ADHICSComplianceResult) => void;
}

export default function ADHICSComplianceDashboard({
  facilityId = "facility-001",
  onComplianceUpdate,
}: ADHICSComplianceDashboardProps) {
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
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const generateMockComplianceResult = (): ADHICSComplianceResult => {
    const mockViolations: ADHICSViolation[] = [
      {
        id: "ADHICS-A-001",
        section: "A",
        control: "2.1.1",
        severity: "High",
        description:
          "Information Security Governance Committee requires enhanced documentation",
        remediation: [
          "Update ISGC charter with detailed responsibilities",
          "Document quarterly meeting minutes",
          "Define escalation procedures",
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "In Progress",
        assignedTo: "CISO Office",
        estimatedEffort: "2 weeks",
      },
      {
        id: "ADHICS-B-002",
        section: "B",
        control: "AC.1.1",
        severity: "Medium",
        description:
          "Access control policy needs regular review cycle implementation",
        remediation: [
          "Establish quarterly access review process",
          "Implement automated access monitoring",
          "Update access control procedures",
        ],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
        assignedTo: "IT Security Team",
        estimatedEffort: "3 weeks",
      },
    ];

    return {
      isCompliant: true,
      overallScore: 88,
      sectionAScore: 85,
      sectionBScore: 91,
      violations: mockViolations,
      recommendations: [
        "Enhance governance documentation and processes",
        "Implement continuous monitoring for critical controls",
        "Schedule regular compliance assessments",
        "Strengthen incident response procedures",
      ],
      complianceLevel: "Good",
      lastAssessment: new Date().toISOString(),
      nextAssessmentDue: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      certificationStatus: "Certified",
    };
  };

  const generateMockControlImplementations =
    (): ADHICSControlImplementation[] => {
      return [
        {
          controlId: "2.1.1",
          section: "A",
          category: "Information Security Governance",
          title: "Information Security Governance Committee (ISGC)",
          description:
            "Establish and maintain an Information Security Governance Committee",
          implementationStatus: "Implemented",
          evidenceProvided: true,
          lastReviewed: new Date().toISOString(),
          reviewedBy: "CISO",
          maturityLevel: 4,
          riskRating: "Low",
          businessImpact: "High",
          implementationNotes:
            "ISGC established with quarterly meetings and documented procedures",
        },
        {
          controlId: "2.1.3",
          section: "A",
          category: "Information Security Governance",
          title: "Chief Information Security Officer (CISO)",
          description: "Designate a Chief Information Security Officer",
          implementationStatus: "Implemented",
          evidenceProvided: true,
          lastReviewed: new Date().toISOString(),
          reviewedBy: "CEO",
          maturityLevel: 5,
          riskRating: "Low",
          businessImpact: "Critical",
          implementationNotes:
            "CISO appointed with appropriate qualifications and authority",
        },
        {
          controlId: "AC.1.1",
          section: "B",
          category: "Access Control",
          title: "Access Control Policy",
          description: "Establish and maintain access control policy",
          implementationStatus: "Partially Implemented",
          evidenceProvided: true,
          lastReviewed: new Date().toISOString(),
          reviewedBy: "IT Security Manager",
          maturityLevel: 3,
          riskRating: "Medium",
          businessImpact: "High",
          implementationNotes:
            "Policy exists but requires regular review process implementation",
        },
        {
          controlId: "DP.1.1",
          section: "B",
          category: "Data Privacy and Protection",
          title: "Data Privacy Policy",
          description: "Establish and maintain data privacy policy",
          implementationStatus: "Implemented",
          evidenceProvided: true,
          lastReviewed: new Date().toISOString(),
          reviewedBy: "Data Protection Officer",
          maturityLevel: 5,
          riskRating: "Low",
          businessImpact: "Critical",
          implementationNotes:
            "Comprehensive data privacy policy with regular updates and training",
        },
      ];
    };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = generateMockComplianceResult();
      const controls = generateMockControlImplementations();

      setComplianceResult(result);
      setControlImplementations(controls);

      if (onComplianceUpdate) {
        onComplianceUpdate(result);
      }
    } catch (error) {
      console.error("Failed to load compliance data:", error);
      toast({
        title: "Error",
        description: "Failed to load ADHICS compliance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAssessment = async () => {
    try {
      setAssessmentInProgress(true);
      // Simulate assessment process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const result = generateMockComplianceResult();
      setComplianceResult(result);

      toast({
        title: "Assessment Complete",
        description: `ADHICS V2 compliance assessment completed. Overall score: ${result.overallScore}%`,
      });
    } catch (error) {
      console.error("Assessment failed:", error);
      toast({
        title: "Assessment Failed",
        description: "Failed to complete ADHICS compliance assessment",
        variant: "destructive",
      });
    } finally {
      setAssessmentInProgress(false);
    }
  };

  const generateReport = async () => {
    try {
      setReportGenerating(true);
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const reportData = {
        facilityId,
        complianceResult,
        controlImplementations,
        generatedAt: new Date().toISOString(),
      };

      // Create and download the report
      const reportContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([reportContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adhics-compliance-report-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "ADHICS compliance report has been downloaded",
      });
    } catch (error) {
      console.error("Report generation failed:", error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate compliance report",
        variant: "destructive",
      });
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

  const getSeverityBadgeVariant = (
    severity: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
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
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">
          Loading ADHICS V2 compliance data...
        </span>
      </div>
    );
  }

  if (!complianceResult) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
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
      {/* Header */}
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

      {/* Overview Cards */}
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

      {/* Detailed Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="controls">Control Implementations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Section A - Governance</span>
                      <span>{complianceResult.sectionAScore}%</span>
                    </div>
                    <Progress
                      value={complianceResult.sectionAScore}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Section B - Controls</span>
                      <span>{complianceResult.sectionBScore}%</span>
                    </div>
                    <Progress
                      value={complianceResult.sectionBScore}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Compliance</span>
                      <span>{complianceResult.overallScore}%</span>
                    </div>
                    <Progress
                      value={complianceResult.overallScore}
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Controls</span>
                    <span className="font-semibold">
                      {controlImplementations.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Implemented</span>
                    <span className="font-semibold text-green-600">
                      {
                        controlImplementations.filter(
                          (c) => c.implementationStatus === "Implemented",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Partially Implemented</span>
                    <span className="font-semibold text-yellow-600">
                      {
                        controlImplementations.filter(
                          (c) =>
                            c.implementationStatus === "Partially Implemented",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Not Implemented</span>
                    <span className="font-semibold text-red-600">
                      {
                        controlImplementations.filter(
                          (c) => c.implementationStatus === "Not Implemented",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
      </Tabs>
    </div>
  );
}
