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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Award,
  Database,
  Network,
  Sync,
  FileSync,
  AlertOctagon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dohEnhancedComplianceService } from "@/services/doh-enhanced-compliance.service";
import { dohComplianceValidatorService } from "@/services/doh-compliance-validator.service";
import type {
  DOHEnhancedComplianceResult,
  DOHFinding,
} from "@/services/doh-enhanced-compliance.service";

interface DOHEnhancedComplianceDashboardProps {
  facilityId?: string;
  showHeader?: boolean;
}

export default function DOHEnhancedComplianceDashboard({
  facilityId = "RHHCS-001",
  showHeader = true,
}: DOHEnhancedComplianceDashboardProps) {
  const [complianceData, setComplianceData] =
    useState<DOHEnhancedComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFinding, setSelectedFinding] = useState<DOHFinding | null>(
    null,
  );

  useEffect(() => {
    loadComplianceData();
  }, [facilityId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const result =
        await dohEnhancedComplianceService.performEnhancedComplianceAssessment(
          facilityId,
        );
      setComplianceData(result);
    } catch (error) {
      console.error("Error loading enhanced compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const report =
        await dohEnhancedComplianceService.generateComplianceReport(facilityId);

      // Download report
      const blob = new Blob([report.executiveSummary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DOH_Enhanced_Compliance_Report_${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: "bg-green-100 text-green-800",
      non_compliant: "bg-red-100 text-red-800",
      needs_improvement: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  if (loading && !complianceData) {
    return (
      <div className="flex items-center justify-center py-8 bg-white">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading enhanced compliance data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                DOH Enhanced Compliance Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive DOH CN_48/2025 compliance monitoring -{" "}
                {facilityId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {complianceData && (
                <Badge
                  className={
                    complianceData.overallCompliance
                      ? "text-green-600 bg-green-100"
                      : "text-red-600 bg-red-100"
                  }
                >
                  {complianceData.overallCompliance
                    ? "COMPLIANT"
                    : "NON-COMPLIANT"}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                CN_48/2025
              </Badge>
              <Button
                onClick={loadComplianceData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={generateReport}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        )}

        {complianceData && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Overall Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {complianceData.complianceScore}%
                  </div>
                  <Progress
                    value={complianceData.complianceScore}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    {complianceData.regulatoryVersion} Standards
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Audit Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {complianceData.auditReadiness}%
                  </div>
                  <Progress
                    value={complianceData.auditReadiness}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    Ready for DOH audit
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    {complianceData.criticalFindings.length}
                  </div>
                  <p className="text-xs text-red-600">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Next Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-purple-900">
                    {new Date(
                      complianceData.nextAssessmentDue,
                    ).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Scheduled assessment
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Status Alert */}
            {complianceData.overallCompliance ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  DOH Compliance Achieved
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  All critical DOH requirements have been met. The facility is
                  compliant with CN_48/2025 standards and ready for regulatory
                  audit.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Compliance Issues Identified
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  {complianceData.criticalFindings.length} critical findings
                  require immediate attention to achieve DOH compliance.
                </AlertDescription>
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="testing">Phase 2 Testing</TabsTrigger>
                <TabsTrigger value="integration">
                  Integration Testing
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Domain Compliance Scores</CardTitle>
                      <CardDescription>
                        Performance across all DOH compliance domains
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(complianceData.domains).map(
                          ([domain, data]) => (
                            <div key={domain} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium capitalize">
                                  {domain
                                    .replace(/([A-Z])/g, " $1")
                                    .toLowerCase()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {data.score}%
                                  </span>
                                  {getStatusBadge(data.status)}
                                </div>
                              </div>
                              <Progress value={data.score} className="h-2" />
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Assessment Summary</CardTitle>
                      <CardDescription>
                        Key metrics from the latest compliance assessment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Assessment Date
                          </span>
                          <span className="text-sm">
                            {new Date(
                              complianceData.assessmentTimestamp,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Regulatory Version
                          </span>
                          <span className="text-sm">
                            {complianceData.regulatoryVersion}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Total Recommendations
                          </span>
                          <span className="text-sm">
                            {complianceData.recommendations.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Compliance Status
                          </span>
                          {getStatusBadge(
                            complianceData.overallCompliance
                              ? "compliant"
                              : "non_compliant",
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Domains Tab */}
              <TabsContent value="domains" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(complianceData.domains).map(
                    ([domainName, domainData]) => (
                      <Card
                        key={domainName}
                        className="border-l-4 border-l-blue-400"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="capitalize">
                                {domainName
                                  .replace(/([A-Z])/g, " $1")
                                  .toLowerCase()}
                              </CardTitle>
                              <CardDescription>
                                Last assessed:{" "}
                                {new Date(
                                  domainData.lastAssessed,
                                ).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                {domainData.score}%
                              </span>
                              {getStatusBadge(domainData.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Progress
                              value={domainData.score}
                              className="h-3"
                            />

                            {domainData.findings.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">
                                  Domain Findings:
                                </h4>
                                <div className="space-y-2">
                                  {domainData.findings.map((finding) => (
                                    <div
                                      key={finding.id}
                                      className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                                    >
                                      {getSeverityIcon(finding.severity)}
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">
                                          {finding.description}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {finding.regulation}
                                        </p>
                                      </div>
                                      <Badge
                                        className={getSeverityColor(
                                          finding.severity,
                                        )}
                                      >
                                        {finding.severity}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </TabsContent>

              {/* Findings Tab */}
              <TabsContent value="findings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Critical Compliance Findings</CardTitle>
                    <CardDescription>
                      Issues requiring immediate attention for DOH compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {complianceData.criticalFindings.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Critical Findings
                        </h3>
                        <p className="text-gray-600">
                          All critical compliance requirements are being met.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Finding ID</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Severity</TableHead>
                              <TableHead>Timeline</TableHead>
                              <TableHead>Responsible</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {complianceData.criticalFindings.map((finding) => (
                              <TableRow key={finding.id}>
                                <TableCell className="font-medium">
                                  {finding.id}
                                </TableCell>
                                <TableCell>{finding.category}</TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="text-sm">
                                      {finding.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {finding.regulation}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getSeverityColor(
                                      finding.severity,
                                    )}
                                  >
                                    {finding.severity}
                                  </Badge>
                                </TableCell>
                                <TableCell>{finding.timeline}</TableCell>
                                <TableCell>{finding.responsible}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {finding.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Phase 2 Testing Tab */}
              <TabsContent value="testing" className="space-y-6">
                <Phase2TestingResults facilityId={facilityId} />
                <DigitalFormsValidationResults facilityId={facilityId} />
                <JAWDAKPIAutomationTestingResults facilityId={facilityId} />
              </TabsContent>

              {/* Integration Testing Tab */}
              <TabsContent value="integration" className="space-y-6">
                <MalaffiEMRIntegrationTestingResults facilityId={facilityId} />
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                <div className="space-y-4">
                  {complianceData.recommendations.map(
                    (recommendation, index) => (
                      <Card
                        key={index}
                        className="border-l-4 border-l-blue-400"
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                {recommendation.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                {recommendation.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>Category: {recommendation.category}</span>
                                <span>Timeline: {recommendation.timeline}</span>
                                <span>
                                  Effort: {recommendation.estimatedEffort}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={getSeverityColor(
                                recommendation.priority,
                              )}
                            >
                              {recommendation.priority}
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">
                              Expected Benefits:
                            </h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {recommendation.benefits.map((benefit, idx) => (
                                <li key={idx}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Timeline</CardTitle>
                    <CardDescription>
                      Key dates and milestones for DOH compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">Last Assessment</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              complianceData.assessmentTimestamp,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                          <h4 className="font-medium">Next Assessment Due</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              complianceData.nextAssessmentDue,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <div>
                          <h4 className="font-medium">Regulatory Version</h4>
                          <p className="text-sm text-gray-600">
                            {complianceData.regulatoryVersion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

// Digital Forms Validation Results Component
function DigitalFormsValidationResults({ facilityId }: { facilityId: string }) {
  const [validationResults, setValidationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDigitalFormsValidation = async () => {
    try {
      setLoading(true);

      // Mock forms data for comprehensive testing
      const mockFormsData = {
        appendix4Data: {
          patient_demographics: {
            name: "Test Patient",
            date_of_birth: "1960-01-01",
            emirates_id: "784-1234-1234567-1",
            address: "Dubai, UAE",
            phone: "+971-50-1234567",
          },
          referring_physician: {
            name: "Dr. Ahmed Al-Rashid",
            license_number: "DOH-MD-123456",
            contact_information: "ahmed.rashid@hospital.ae",
            specialty: "Internal Medicine",
          },
          face_to_face_encounter: {
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Patient Home",
            clinical_findings:
              "Patient shows signs of mobility limitations and requires assistance",
            homebound_justification:
              "Patient unable to leave home without significant effort due to chronic conditions and mobility limitations requiring assistive devices",
          },
          homebound_justification:
            "Patient has multiple chronic conditions including heart failure and diabetes that significantly limit mobility and ability to leave home safely without considerable effort and assistance.",
          treatment_plan: {
            goals: [
              "Improve mobility",
              "Medication management",
              "Prevent complications",
            ],
            interventions: [
              "Physical therapy",
              "Nursing care",
              "Medication monitoring",
            ],
            frequency: "3 times per week",
            duration: "90 days",
          },
          periodic_assessment_schedule: {
            frequency: "30_days",
          },
          clinical_condition:
            "Chronic heart failure with reduced ejection fraction",
          functional_status: "Limited mobility, requires assistance with ADLs",
          medication_list: ["Lisinopril", "Metformin", "Furosemide"],
          physician_orders: ["Home nursing care", "Physical therapy"],
          emergency_contact: {
            name: "Family Member",
            phone: "+971-50-7654321",
          },
          insurance_information: {
            provider: "Daman",
            policy_number: "DM123456789",
          },
          treatment_plan_attachment: {
            file_name: "treatment_plan.pdf",
            file_size: 2048000,
            digitally_signed: true,
          },
          physician_signature: {
            digital_signature: true,
            timestamp: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            license_verified: true,
            license_number: "DOH-MD-123456",
            integrity_verified: true,
            hash_validation: true,
          },
          periodic_assessment_automation: {
            automated_scheduling: true,
            thirty_day_trigger: true,
            thirty_day_notification_sent: true,
            sixty_day_trigger: true,
            sixty_day_notification_sent: true,
            ninety_day_trigger: true,
            ninety_day_notification_sent: true,
            escalation_protocols: true,
            overdue_notifications: true,
          },
        },
        appendix7Data: {
          section_a: {
            service_type: "routine_care",
            care_type: "nursing_care",
            care_type_justification:
              "Patient requires skilled nursing care for medication management and monitoring of chronic conditions",
            professional_requirements: [
              "Registered Nurse",
              "Physical Therapist",
            ],
            daily_hours: 6,
            equipment_needs: true,
            equipment_list: ["Blood pressure monitor", "Glucose meter"],
          },
          section_b: {
            automated_tracking: true,
            service_delivery_log: true,
            monthly_summary: {
              automated_generation: true,
            },
            service_hours: {
              total_hours: 180,
              breakdown_by_service: {
                nursing: 120,
                therapy: 60,
              },
            },
            quality_metrics: {
              patient_satisfaction: 95,
              clinical_outcomes: 88,
            },
            billing_integration: true,
            billing_codes_validated: true,
          },
          section_c: {
            discharge_criteria: [
              "Goals achieved",
              "Patient stable",
              "Family educated",
            ],
            goal_achievement: {
              assessment_completed: true,
              outcomes_documented: true,
            },
            transition_planning: {
              next_level_of_care: "Outpatient follow-up",
              provider_coordination: true,
            },
            patient_education: {
              education_provided: true,
              understanding_verified: true,
            },
            follow_up: {
              appointments_scheduled: true,
              contact_information_provided: true,
            },
          },
          level_of_care_upgrade: {
            criteria_monitoring: true,
            automated_assessment: true,
            clinical_justification:
              "Patient's condition has improved significantly with current interventions, allowing for potential step-down in care intensity while maintaining quality outcomes.",
            physician_approval: true,
            physician_signature: true,
            timeline_tracking: true,
            implementation_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            cost_analysis: true,
            budget_approval: true,
          },
        },
        appendix8Data: {
          IM_series: {
            questions_completed: true,
            medication_assessment: true,
            administration_monitoring: true,
            side_effects_tracking: true,
          },
          IN_series: {
            questions_completed: true,
            nutritional_status: true,
            hydration_assessment: true,
            feeding_tolerance: true,
          },
          IR_series: {
            questions_completed: true,
            respiratory_status: true,
            oxygen_requirements: true,
            airway_management: true,
          },
          IS_series: {
            questions_completed: true,
            skin_integrity: true,
            wound_assessment: true,
            healing_progress: true,
          },
          IB_series: {
            questions_completed: true,
            bowel_function: true,
            bladder_function: true,
            continence_management: true,
          },
          IP_series: {
            questions_completed: true,
            pain_assessment: true,
            symptom_management: true,
            comfort_measures: true,
          },
          IO_series: {
            questions_completed: true,
            vital_signs_monitoring: true,
            neurological_assessment: true,
            behavioral_observations: true,
          },
          IT_series: {
            questions_completed: true,
            transition_readiness: true,
            education_completion: true,
            support_system_assessment: true,
          },
          automated_progress_tracking: {
            data_collection_automated: true,
            real_time_updates: true,
            trend_analysis: true,
            improvement_indicators: true,
            alert_system: true,
            deterioration_detection: true,
            goal_tracking: true,
            milestone_monitoring: true,
            predictive_analytics: true,
            risk_stratification: true,
          },
          outcome_measurement: {
            standardized_measures: true,
            measurement_tools: [
              "Barthel Index",
              "Mini-Mental State Exam",
              "Pain Scale",
            ],
            baseline_measurements: true,
            baseline_date: new Date(
              Date.now() - 90 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            periodic_assessment: true,
            assessment_frequency: "monthly",
            data_integration: true,
            ehr_integration: true,
            quality_reporting: true,
            regulatory_reporting: true,
          },
          assessment_renewal: {
            automated_scheduling: true,
            renewal_calendar: true,
            pre_renewal_notifications: true,
            notification_timeline: "14 days prior",
            criteria_validation: true,
            eligibility_check: true,
            documentation_update: true,
            automated_form_generation: true,
            stakeholder_communication: true,
            multi_party_coordination: true,
          },
        },
      };

      const results =
        dohComplianceValidatorService.executeDigitalFormsValidationSuite(
          mockFormsData,
        );
      setValidationResults(results);
    } catch (error) {
      console.error("Error running digital forms validation:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFormStatusColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 85) return "text-blue-600 bg-blue-100 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getFormStatusIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 85) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (score >= 70)
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subtask 2.1.2: Digital Forms Validation</CardTitle>
              <CardDescription>
                Comprehensive testing for DOH Referral/Periodic Assessment Form
                (Appendix 4), Healthcare Assessment Form (Appendix 7), and
                Patient Monitoring Form (Appendix 8)
              </CardDescription>
            </div>
            <Button
              onClick={runDigitalFormsValidation}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {loading ? "Validating Forms..." : "Run Digital Forms Validation"}
            </Button>
          </div>
        </CardHeader>

        {validationResults && (
          <CardContent>
            {/* Validation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {validationResults.overallDigitalFormsScore}%
                  </div>
                  <p className="text-sm text-blue-600">Overall Score</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-900">
                    {validationResults.validationSummary.compliantForms}
                  </div>
                  <p className="text-sm text-green-600">Compliant Forms</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-900">
                    {validationResults.validationSummary.formsNeedingAttention}
                  </div>
                  <p className="text-sm text-red-600">
                    Forms Needing Attention
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-4">
                  <div className="text-sm font-bold text-purple-900 capitalize">
                    {validationResults.validationSummary.overallComplianceLevel.replace(
                      "_",
                      " ",
                    )}
                  </div>
                  <p className="text-sm text-purple-600">Compliance Level</p>
                </CardContent>
              </Card>
            </div>

            {/* Form Validation Results */}
            <div className="space-y-6">
              {/* Subtask 2.1.2.1: DOH Referral/Periodic Assessment Form (Appendix 4) */}
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.2.1: DOH Referral/Periodic Assessment Form
                        (Appendix 4)
                      </CardTitle>
                      <CardDescription>
                        Mandatory field completion, treatment plan attachment,
                        physician e-signature, periodic assessment automation
                        (30-90 days)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getFormStatusIcon(
                        validationResults.digitalFormsResults.appendix4Results
                          .overallComplianceScore,
                      )}
                      <Badge
                        className={getFormStatusColor(
                          validationResults.digitalFormsResults.appendix4Results
                            .overallComplianceScore,
                        )}
                      >
                        {
                          validationResults.digitalFormsResults.appendix4Results
                            .overallComplianceScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      validationResults.digitalFormsResults.appendix4Results
                        .testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getFormStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Form Completion Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Form Completion Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Fields:</span>
                        <span className="ml-2">
                          {
                            validationResults.digitalFormsResults
                              .appendix4Results.formValidationSummary
                              .totalFields
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Completed:</span>
                        <span className="ml-2">
                          {
                            validationResults.digitalFormsResults
                              .appendix4Results.formValidationSummary
                              .completedFields
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Missing:</span>
                        <span className="ml-2">
                          {
                            validationResults.digitalFormsResults
                              .appendix4Results.formValidationSummary
                              .missingFields.length
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          className={getFormStatusColor(
                            validationResults.digitalFormsResults
                              .appendix4Results.overallComplianceScore,
                          )}
                        >
                          {
                            validationResults.digitalFormsResults
                              .appendix4Results.formValidationSummary
                              .complianceLevel
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.1.2.2: DOH Healthcare Assessment Form (Appendix 7) */}
              <Card className="border-l-4 border-l-green-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.2.2: DOH Healthcare Assessment Form
                        (Appendix 7)
                      </CardTitle>
                      <CardDescription>
                        Section A: Service and care type determination, Section
                        B: Monthly service summary automation, Section C:
                        Homecare discharge planning, Level of care upgrade
                        tracking
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getFormStatusIcon(
                        validationResults.digitalFormsResults.appendix7Results
                          .overallComplianceScore,
                      )}
                      <Badge
                        className={getFormStatusColor(
                          validationResults.digitalFormsResults.appendix7Results
                            .overallComplianceScore,
                        )}
                      >
                        {
                          validationResults.digitalFormsResults.appendix7Results
                            .overallComplianceScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      validationResults.digitalFormsResults.appendix7Results
                        .testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getFormStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Section Completion Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Section Completion Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {Object.entries(
                        validationResults.digitalFormsResults.appendix7Results
                          .sectionCompletionSummary,
                      ).map(([sectionName, sectionData]: [string, any]) => {
                        if (sectionName === "overallCompletion") return null;
                        return (
                          <div key={sectionName} className="text-center">
                            <div className="text-sm font-medium capitalize mb-1">
                              {sectionName.replace(/([A-Z])/g, " $1")}
                            </div>
                            <div className="text-lg font-bold">
                              {typeof sectionData === "object"
                                ? sectionData.completionPercentage
                                : sectionData}
                              %
                            </div>
                            <div className="text-xs text-gray-600">
                              {typeof sectionData === "object" &&
                              sectionData.completed
                                ? "Complete"
                                : "In Progress"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.1.2.3: DOH Patient Monitoring Form (Appendix 8) */}
              <Card className="border-l-4 border-l-purple-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.2.3: DOH Patient Monitoring Form (Appendix
                        8)
                      </CardTitle>
                      <CardDescription>
                        Domain-specific clinical questions (IM, IN, IR, IS, IB,
                        IP, IO, IT series), automated progress tracking, outcome
                        measurement integration, assessment period renewal
                        automation
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getFormStatusIcon(
                        validationResults.digitalFormsResults.appendix8Results
                          .overallComplianceScore,
                      )}
                      <Badge
                        className={getFormStatusColor(
                          validationResults.digitalFormsResults.appendix8Results
                            .overallComplianceScore,
                        )}
                      >
                        {
                          validationResults.digitalFormsResults.appendix8Results
                            .overallComplianceScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      validationResults.digitalFormsResults.appendix8Results
                        .testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getFormStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Domain Questions Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Domain Questions Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Domains:</span>
                        <span className="ml-2">
                          {
                            validationResults.digitalFormsResults
                              .appendix8Results.domainQuestionsSummary
                              .totalDomains
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Completed:</span>
                        <span className="ml-2">
                          {
                            validationResults.digitalFormsResults
                              .appendix8Results.domainQuestionsSummary
                              .completedDomains
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Completion:</span>
                        <span className="ml-2">
                          {
                            validationResults.digitalFormsResults
                              .appendix8Results.domainQuestionsSummary
                              .overallCompletion
                          }
                          %
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          className={getFormStatusColor(
                            validationResults.digitalFormsResults
                              .appendix8Results.overallComplianceScore,
                          )}
                        >
                          {validationResults.digitalFormsResults
                            .appendix8Results.domainQuestionsSummary
                            .overallCompletion >= 90
                            ? "Complete"
                            : "In Progress"}
                        </Badge>
                      </div>
                    </div>

                    {/* Domain Status Grid */}
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Domain Series Status</h5>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {Object.entries(
                          validationResults.digitalFormsResults.appendix8Results
                            .domainQuestionsSummary.domainCompletionStatus,
                        ).map(([domain, completed]: [string, any]) => (
                          <div
                            key={domain}
                            className={`p-2 rounded text-center text-xs ${
                              completed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <div className="font-medium">{domain}</div>
                            <div>{completed ? "✓" : "✗"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues and Recommendations */}
            {(validationResults.criticalIssues.length > 0 ||
              validationResults.recommendations.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {validationResults.criticalIssues.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Critical Issues (
                        {validationResults.criticalIssues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {validationResults.criticalIssues.map(
                          (issue: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-red-50 rounded"
                            >
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700">
                                {issue}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {validationResults.recommendations.length > 0 && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Recommendations (
                        {validationResults.recommendations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {validationResults.recommendations.map(
                          (recommendation: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-blue-50 rounded"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-700">
                                {recommendation}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        )}

        {!validationResults && (
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Digital Forms Validation Ready
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Run Digital Forms Validation" to execute comprehensive
                testing for all DOH digital forms.
              </p>
              <div className="text-sm text-gray-500">
                <p>
                  • Subtask 2.1.2.1: DOH Referral/Periodic Assessment Form
                  (Appendix 4)
                </p>
                <p>
                  • Subtask 2.1.2.2: DOH Healthcare Assessment Form (Appendix 7)
                </p>
                <p>
                  • Subtask 2.1.2.3: DOH Patient Monitoring Form (Appendix 8)
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// JAWDA KPI Automation Testing Results Component
function JAWDAKPIAutomationTestingResults({
  facilityId,
}: {
  facilityId: string;
}) {
  const [jawdaTestingResults, setJawdaTestingResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runJAWDAKPITests = async () => {
    try {
      setLoading(true);

      // Mock facility data for comprehensive JAWDA KPI testing
      const mockFacilityData = {
        facilityId: facilityId,
        // Emergency Department Visits Data
        edVisits: [
          {
            patientId: "P001",
            visitDate: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            visitType: "emergency_department",
            resultedInHospitalization: false,
            reason: "Chest pain evaluation",
          },
          {
            patientId: "P002",
            visitDate: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            visitType: "emergency_department",
            resultedInHospitalization: true,
            reason: "Acute respiratory distress",
          },
        ],
        // Hospitalization Data
        hospitalizations: [
          {
            patientId: "P003",
            admissionDate: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            plannedStatus: false,
            acuteCare: true,
            reason: "Unplanned admission for infection",
          },
        ],
        // Ambulation Assessment Data
        ambulationAssessments: [
          {
            patientId: "P001",
            baselineDate: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            baselineScore: 60,
            assessmentTool: "Barthel Index",
            followUpAssessments: [
              {
                date: new Date(
                  Date.now() - 15 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                score: 75,
              },
              {
                date: new Date().toISOString(),
                score: 85,
              },
            ],
          },
          {
            patientId: "P002",
            baselineDate: new Date(
              Date.now() - 25 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            baselineScore: 45,
            assessmentTool: "Barthel Index",
            followUpAssessments: [
              {
                date: new Date(
                  Date.now() - 10 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                score: 55,
              },
            ],
          },
        ],
        // Pressure Injury Data
        pressureInjuries: [
          {
            patientId: "P004",
            identificationDate: new Date(
              Date.now() - 12 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            stage: "Stage 2",
            location: "Sacrum",
            acquiredDuringCare: true,
          },
        ],
        // Fall Incident Data
        fallIncidents: [
          {
            patientId: "P005",
            incidentDate: new Date(
              Date.now() - 8 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            location: "Bathroom",
            injuryOccurred: true,
            injurySeverity: "Minor",
          },
        ],
        // Discharge Data
        discharges: [
          {
            patientId: "P001",
            dischargeDate: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            destination: "Home",
            dischargeReason: "Goals achieved",
          },
          {
            patientId: "P002",
            dischargeDate: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            destination: "Skilled Nursing Facility",
            dischargeReason: "Requires higher level of care",
          },
        ],
        // Patient Data for Individual Tracking
        patients: [
          {
            patientId: "P001",
            admissionDate: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            dischargeDate: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            patientDays: 27,
            incidents: [
              {
                incidentId: "INC001",
                incidentDate: new Date(
                  Date.now() - 15 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                incidentType: "medication_error",
                patientId: "P001",
                description: "Wrong medication dosage administered",
                severity: "moderate",
                outcome: "No harm to patient",
                preventability: "preventable",
                reportedBy: "Nurse Smith",
                category: "Medication/IV Fluids",
                subcategory: "Wrong dose",
                dohTaxonomyLevel1: "Medication/IV Fluids",
                automatedClassification: true,
                safetyImpact: {
                  harmLevel: "no_harm",
                  riskScore: 3,
                  mitigationRequired: true,
                },
              },
            ],
            visits: [
              {
                visitId: "V001",
                visitType: "routine_nursing",
                qualityRelated: false,
                classificationReason: "Scheduled routine care",
              },
              {
                visitId: "V002",
                visitType: "emergency_response",
                qualityRelated: true,
                classificationReason: "Response to medication error incident",
                qualityIndicators: ["medication_safety", "patient_monitoring"],
                preventabilityAssessment: "preventable",
                clinicalReview: {
                  reviewDate: new Date(
                    Date.now() - 10 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  reviewer: "Dr. Johnson",
                  approved: true,
                },
              },
            ],
          },
        ],
        // Patient Days Calculation
        patientDays: {
          totalDays: 1250,
          calculationMethod: "automated",
          lastUpdated: new Date().toISOString(),
        },
        // KPI Calculations
        kpiCalculations: {
          edVisitsRate: 0.8, // per 1000 patient days
          unplannedHospitalizationRate: 0.8,
          ambulationImprovementRate: 75.0, // percentage
          pressureInjuryRate: 0.8,
          fallInjuryRate: 0.8,
          dischargeToCommunityRate: 0.8,
          unplannedHospitalizations: { count: 1 },
          pressureInjuriesStage2Plus: { count: 1 },
          fallsWithInjury: { count: 1 },
          communityDischarges: { count: 1 },
        },
        // Benchmarks
        benchmarks: {
          edVisitsTarget: 3.0,
          unplannedHospitalizationTarget: 2.5,
          ambulationImprovementTarget: 80.0,
          pressureInjuryTarget: 1.2,
          fallInjuryTarget: 1.0,
          dischargeToCommunityTarget: 85.0,
          source: "JAWDA National Benchmarks",
          lastUpdated: new Date().toISOString(),
          version: "2025.1",
          autoUpdate: true,
        },
        // Automation and Tracking Systems
        automatedReporting: {
          edVisits: { enabled: true, frequency: "real_time" },
          unplannedHospitalizations: { enabled: true, frequency: "real_time" },
          ambulation: { enabled: true, frequency: "daily" },
          pressureInjury: { enabled: true, frequency: "real_time" },
          falls: { enabled: true, frequency: "real_time" },
          dischargeToCommunity: { enabled: true, frequency: "daily" },
          benchmarkComparison: {
            enabled: true,
            frequency: "weekly",
            recipients: ["quality@facility.com", "admin@facility.com"],
          },
        },
        realTimeCalculation: {
          edVisits: true,
          unplannedHospitalizations: true,
          ambulation: true,
          pressureInjury: true,
          falls: true,
          dischargeToCommunity: true,
        },
        dataValidation: {
          edVisits: { automated: true },
          unplannedHospitalizations: { automated: true },
          ambulation: { automated: true },
          pressureInjury: { automated: true },
          falls: { automated: true },
          dischargeToCommunity: { automated: true },
        },
        alertSystem: {
          edVisits: { enabled: true },
          unplannedHospitalizations: { enabled: true },
          ambulation: { enabled: true },
          pressureInjury: { enabled: true },
          falls: { enabled: true },
          dischargeToCommunity: { enabled: true },
        },
        trendAnalysis: {
          enabled: true,
          historicalComparison: true,
          forecastingEnabled: true,
          edVisits: { enabled: true },
          unplannedHospitalizations: { enabled: true, historicalData: [] },
          ambulation: { enabled: true },
          pressureInjury: { enabled: true },
          falls: { enabled: true },
          dischargeToCommunity: { enabled: true },
        },
        // Incident Logging System
        incidentLogging: {
          realTimeCapture: true,
          automatedTimestamps: true,
          immediateNotification: true,
          automatedClassification: true,
          workflowIntegration: true,
        },
        // Classification Systems
        classificationRules: {
          qualityRelated: {
            automatedRules: true,
            confidenceThreshold: 95,
          },
        },
        classificationMetrics: {
          accuracy: 96,
          falsePositiveRate: 3,
          falseNegativeRate: 4,
        },
        automatedReview: { enabled: true },
        continuousLearning: { enabled: true },
        // Patient Days Tracking
        patientDaysTracking: {
          realTimeUpdates: true,
          midnightRecalculation: true,
          auditTrail: true,
        },
        dataQuality: {
          patientDays: {
            accuracy: 99.5,
            completeness: 100,
          },
        },
        // Performance Systems
        performanceComparison: {
          automated: true,
          edVisitsRate: { status: "exceeds_target", variance: -2.2 },
          unplannedHospitalizationRate: {
            status: "exceeds_target",
            variance: -1.7,
          },
          ambulationImprovementRate: { status: "below_target", variance: -5.0 },
          pressureInjuryRate: { status: "exceeds_target", variance: -0.4 },
          fallInjuryRate: { status: "exceeds_target", variance: -0.2 },
          dischargeToCommunityRate: { status: "below_target", variance: -35.0 },
        },
        performanceAlerts: {
          enabled: true,
          thresholds: true,
          escalationRules: true,
        },
        // Prevention Protocols
        preventionProtocols: {
          pressureInjury: {
            implemented: true,
            complianceTracking: true,
          },
          falls: {
            implemented: true,
            effectivenessTracking: true,
          },
        },
        fallRiskAssessments: [
          {
            patientId: "P005",
            riskScore: 8,
            preventionPlan: "Bed alarm, frequent rounding",
          },
        ],
        dischargePlanning: {
          automated: true,
          communityResourceTracking: true,
        },
        automatedTracking: {
          ambulation: {
            enabled: true,
            assessmentScheduling: true,
          },
        },
      };

      const results =
        dohComplianceValidatorService.executeJAWDAKPIAutomationTesting(
          mockFacilityData,
        );
      setJawdaTestingResults(results);
    } catch (error) {
      console.error("Error running JAWDA KPI automation tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getKPIStatusColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 85) return "text-blue-600 bg-blue-100 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getKPIStatusIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 85) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (score >= 70)
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subtask 2.1.3: JAWDA KPI Automation Testing</CardTitle>
              <CardDescription>
                Comprehensive testing for real-time KPI calculations and
                patient-level incident tracking
              </CardDescription>
            </div>
            <Button
              onClick={runJAWDAKPITests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              {loading ? "Running JAWDA Tests..." : "Run JAWDA KPI Tests"}
            </Button>
          </div>
        </CardHeader>

        {jawdaTestingResults && (
          <CardContent>
            {/* JAWDA Testing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {jawdaTestingResults.overallJAWDAScore}%
                  </div>
                  <p className="text-sm text-blue-600">Overall JAWDA Score</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-900">
                    {jawdaTestingResults.jawdaTestingSummary.passedKPITests}
                  </div>
                  <p className="text-sm text-green-600">Tests Passed</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-900">
                    {jawdaTestingResults.jawdaTestingSummary.failedKPITests}
                  </div>
                  <p className="text-sm text-red-600">Tests Failed</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-900">
                    {jawdaTestingResults.jawdaTestingSummary.automationLevel}%
                  </div>
                  <p className="text-sm text-purple-600">Automation Level</p>
                </CardContent>
              </Card>
            </div>

            {/* JAWDA KPI Test Results */}
            <div className="space-y-6">
              {/* Subtask 2.1.3.1: Real-time KPI Calculations */}
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.3.1: Real-time KPI Calculations
                      </CardTitle>
                      <CardDescription>
                        Emergency Department visits, unplanned hospitalization
                        rate, ambulation improvement, pressure injury rate, fall
                        injury rate, and discharge to community rate
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getKPIStatusIcon(
                        jawdaTestingResults.jawdaKPIResults
                          .realTimeKPICalculations.overallKPIScore,
                      )}
                      <Badge
                        className={getKPIStatusColor(
                          jawdaTestingResults.jawdaKPIResults
                            .realTimeKPICalculations.overallKPIScore,
                        )}
                      >
                        {
                          jawdaTestingResults.jawdaKPIResults
                            .realTimeKPICalculations.overallKPIScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(
                      jawdaTestingResults.jawdaKPIResults
                        .realTimeKPICalculations.testResults,
                    ).map(([kpiName, kpiResult]: [string, any]) => (
                      <div key={kpiName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {kpiName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getKPIStatusIcon(kpiResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {kpiResult.score}%
                        </div>
                        <Progress
                          value={kpiResult.score}
                          className="h-2 mt-1"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          Automation: {kpiResult.automationScore}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* KPI Calculation Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      KPI Calculation Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total KPIs:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .realTimeKPICalculations.kpiCalculationSummary
                              .totalKPIs
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Passing:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .realTimeKPICalculations.kpiCalculationSummary
                              .passingKPIs
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Failing:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .realTimeKPICalculations.kpiCalculationSummary
                              .failingKPIs
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Automation:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .realTimeKPICalculations.kpiCalculationSummary
                              .automationLevel
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.1.3.2: Patient-level Incident Tracking */}
              <Card className="border-l-4 border-l-green-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.3.2: Patient-level Incident Tracking
                      </CardTitle>
                      <CardDescription>
                        Individual patient incident logging, quality-related vs
                        unrelated visit classification, patient days calculation
                        accuracy, and benchmark comparison automation
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getKPIStatusIcon(
                        jawdaTestingResults.jawdaKPIResults
                          .patientLevelIncidentTracking.overallTrackingScore,
                      )}
                      <Badge
                        className={getKPIStatusColor(
                          jawdaTestingResults.jawdaKPIResults
                            .patientLevelIncidentTracking.overallTrackingScore,
                        )}
                      >
                        {
                          jawdaTestingResults.jawdaKPIResults
                            .patientLevelIncidentTracking.overallTrackingScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      jawdaTestingResults.jawdaKPIResults
                        .patientLevelIncidentTracking.testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getKPIStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          Automation: {testResult.automationScore}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Patient Tracking Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Patient Tracking Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Patients:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .patientLevelIncidentTracking
                              .patientTrackingSummary.totalPatients
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">With Incidents:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .patientLevelIncidentTracking
                              .patientTrackingSummary.patientsWithIncidents
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Tracking Accuracy:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .patientLevelIncidentTracking
                              .patientTrackingSummary.trackingAccuracy
                          }
                          %
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Automation Level:</span>
                        <span className="ml-2">
                          {
                            jawdaTestingResults.jawdaKPIResults
                              .patientLevelIncidentTracking
                              .patientTrackingSummary.automationLevel
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues and Recommendations */}
            {(jawdaTestingResults.criticalIssues.length > 0 ||
              jawdaTestingResults.recommendations.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {jawdaTestingResults.criticalIssues.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Critical Issues (
                        {jawdaTestingResults.criticalIssues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {jawdaTestingResults.criticalIssues.map(
                          (issue: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-red-50 rounded"
                            >
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700">
                                {issue}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {jawdaTestingResults.recommendations.length > 0 && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Recommendations (
                        {jawdaTestingResults.recommendations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {jawdaTestingResults.recommendations.map(
                          (recommendation: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-blue-50 rounded"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-700">
                                {recommendation}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        )}

        {!jawdaTestingResults && (
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                JAWDA KPI Automation Testing Ready
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Run JAWDA KPI Tests" to execute comprehensive testing for
                real-time KPI calculations and patient-level incident tracking.
              </p>
              <div className="text-sm text-gray-500">
                <p>
                  • Subtask 2.1.3.1: Real-time KPI calculations (ED visits,
                  hospitalizations, ambulation, pressure injuries, falls,
                  discharge rates)
                </p>
                <p>
                  • Subtask 2.1.3.2: Patient-level incident tracking (individual
                  logging, visit classification, patient days calculation,
                  benchmark comparison)
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Malaffi EMR Integration Testing Results Component
function MalaffiEMRIntegrationTestingResults({
  facilityId,
}: {
  facilityId: string;
}) {
  const [malaffiTestingResults, setMalaffiTestingResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runMalaffiIntegrationTests = async () => {
    try {
      setLoading(true);

      // Mock Malaffi integration data for comprehensive testing
      const mockMalaffiIntegrationData = {
        facilityId: facilityId,
        // Malaffi Connection Configuration
        malaffiConnection: {
          endpoint: "https://api.malaffi.ae/v2",
          authenticated: true,
          patientDataAccess: true,
          clinicalDataAccess: true,
          automated: true,
          connectionHealth: {
            status: "healthy",
            latency: 120,
            uptime: 99.8,
            lastHealthCheck: new Date().toISOString(),
          },
        },
        // Patient Data Integration
        patientData: {
          demographics: {
            synchronized: true,
            lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            recordCount: 1250,
            syncAccuracy: 99.2,
          },
          medicalHistory: {
            synchronized: true,
            lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            recordCount: 3400,
            syncAccuracy: 98.8,
          },
          currentMedications: {
            synchronized: true,
            lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            recordCount: 890,
            syncAccuracy: 99.5,
          },
        },
        // Document Synchronization
        documentSync: {
          pushEnabled: true,
          pullEnabled: true,
          automated: true,
          batchProcessing: true,
          realTimeSync: true,
          compressionEnabled: true,
          encryptionEnabled: true,
        },
        // Clinical Documents
        clinicalDocuments: {
          carePlans: {
            total: 450,
            synchronized: 445,
            pending: 5,
            failed: 0,
            lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
          assessments: {
            total: 1200,
            synchronized: 1195,
            pending: 3,
            failed: 2,
            lastSync: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          },
          progressNotes: {
            total: 2800,
            synchronized: 2790,
            pending: 8,
            failed: 2,
            lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
        },
        // Document Integration Settings
        documentIntegration: {
          carePlans: true,
          assessments: true,
          medications: true,
          labResults: true,
          automated: true,
          validationEnabled: true,
          auditTrail: true,
        },
        // Sync Operations Tracking
        syncOperations: {
          total: 15420,
          successful: 15380,
          failed: 40,
          pending: 12,
          averageTime: 2.3,
          lastOperation: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        // Sync Performance Metrics
        syncPerformance: {
          averageTime: 2.3,
          peakTime: 8.7,
          minTime: 0.8,
          throughput: 450,
          errorRate: 0.26,
          retrySuccessRate: 95.2,
        },
        // Real-time Sync Monitoring
        syncMonitoring: {
          realTime: true,
          automated: true,
          dashboardEnabled: true,
          alertsEnabled: true,
          performanceTracking: true,
          healthChecks: true,
          statusNotifications: true,
        },
        // Failure Recovery Systems
        failureRecovery: {
          implemented: true,
          automated: true,
          retryMechanism: true,
          queueManagement: true,
          dataIntegrityChecks: true,
          rollbackCapability: true,
          manualOverride: true,
        },
        // Error Handling Configuration
        errorHandling: {
          networkFailure: true,
          partialSync: true,
          dataConflicts: true,
          manualOverride: true,
          automated: true,
          overrideAutomation: true,
          escalationRules: true,
          notificationSystem: true,
        },
        // Data Quality and Validation
        dataQuality: {
          validationRules: true,
          integrityChecks: true,
          duplicateDetection: true,
          formatValidation: true,
          businessRuleValidation: true,
          auditLogging: true,
        },
        // Security and Compliance
        security: {
          encryption: {
            inTransit: true,
            atRest: true,
            keyManagement: true,
          },
          authentication: {
            oauth2: true,
            tokenRefresh: true,
            sessionManagement: true,
          },
          authorization: {
            roleBasedAccess: true,
            dataLevelSecurity: true,
            auditTrail: true,
          },
        },
        // Performance Optimization
        performanceOptimization: {
          caching: true,
          compression: true,
          batchProcessing: true,
          parallelProcessing: true,
          loadBalancing: true,
          connectionPooling: true,
        },
      };

      const results =
        dohComplianceValidatorService.executeMalaffiEMRIntegrationTesting(
          mockMalaffiIntegrationData,
        );
      setMalaffiTestingResults(results);
    } catch (error) {
      console.error("Error running Malaffi EMR integration tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationStatusColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 85) return "text-blue-600 bg-blue-100 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getIntegrationStatusIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 85) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (score >= 70)
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Subtask 2.2.1: Malaffi EMR Integration Testing
              </CardTitle>
              <CardDescription>
                Comprehensive testing for bi-directional data synchronization,
                clinical document integration, and error handling with Malaffi
                EMR
              </CardDescription>
            </div>
            <Button
              onClick={runMalaffiIntegrationTests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Network className="w-4 h-4" />
              )}
              {loading
                ? "Running Integration Tests..."
                : "Run Malaffi Integration Tests"}
            </Button>
          </div>
        </CardHeader>

        {malaffiTestingResults && (
          <CardContent>
            {/* Integration Testing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {malaffiTestingResults.overallMalaffiIntegrationScore}%
                  </div>
                  <p className="text-sm text-blue-600">
                    Overall Integration Score
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-900">
                    {malaffiTestingResults.malaffiTestingSummary.passedTests}
                  </div>
                  <p className="text-sm text-green-600">Tests Passed</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-900">
                    {malaffiTestingResults.malaffiTestingSummary.failedTests}
                  </div>
                  <p className="text-sm text-red-600">Tests Failed</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-900">
                    {
                      malaffiTestingResults.malaffiTestingSummary
                        .syncReliability
                    }
                    %
                  </div>
                  <p className="text-sm text-purple-600">Sync Reliability</p>
                </CardContent>
              </Card>
            </div>

            {/* Malaffi Integration Test Results */}
            <div className="space-y-6">
              {/* Subtask 2.2.1.1: Bi-directional Data Synchronization */}
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.2.1.1: Bi-directional Data Synchronization
                      </CardTitle>
                      <CardDescription>
                        Patient data pull from Malaffi, clinical document push
                        to Malaffi, real-time sync monitoring, and sync failure
                        recovery
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getIntegrationStatusIcon(
                        malaffiTestingResults.malaffiIntegrationResults
                          .biDirectionalDataSync.overallSyncScore,
                      )}
                      <Badge
                        className={getIntegrationStatusColor(
                          malaffiTestingResults.malaffiIntegrationResults
                            .biDirectionalDataSync.overallSyncScore,
                        )}
                      >
                        {
                          malaffiTestingResults.malaffiIntegrationResults
                            .biDirectionalDataSync.overallSyncScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      malaffiTestingResults.malaffiIntegrationResults
                        .biDirectionalDataSync.testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getIntegrationStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          Automation: {testResult.automationScore}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sync Performance Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Sync Performance Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Operations:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .biDirectionalDataSync.syncPerformanceSummary
                              .totalSyncOperations
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Successful:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .biDirectionalDataSync.syncPerformanceSummary
                              .successfulSyncs
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Failed:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .biDirectionalDataSync.syncPerformanceSummary
                              .failedSyncs
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Avg Time:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .biDirectionalDataSync.syncPerformanceSummary
                              .averageSyncTime
                          }
                          s
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Real-time:</span>
                        <Badge
                          className={
                            malaffiTestingResults.malaffiIntegrationResults
                              .biDirectionalDataSync.syncPerformanceSummary
                              .realTimeMonitoring
                              ? "text-green-600 bg-green-100"
                              : "text-red-600 bg-red-100"
                          }
                        >
                          {malaffiTestingResults.malaffiIntegrationResults
                            .biDirectionalDataSync.syncPerformanceSummary
                            .realTimeMonitoring
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.2.1.2: Clinical Document Integration */}
              <Card className="border-l-4 border-l-green-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.2.1.2: Clinical Document Integration
                      </CardTitle>
                      <CardDescription>
                        Care plan synchronization, assessment result sharing,
                        medication list updates, and laboratory result
                        integration
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getIntegrationStatusIcon(
                        malaffiTestingResults.malaffiIntegrationResults
                          .clinicalDocumentIntegration.overallDocumentScore,
                      )}
                      <Badge
                        className={getIntegrationStatusColor(
                          malaffiTestingResults.malaffiIntegrationResults
                            .clinicalDocumentIntegration.overallDocumentScore,
                        )}
                      >
                        {
                          malaffiTestingResults.malaffiIntegrationResults
                            .clinicalDocumentIntegration.overallDocumentScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      malaffiTestingResults.malaffiIntegrationResults
                        .clinicalDocumentIntegration.testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getIntegrationStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          Automation: {testResult.automationScore}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Document Integration Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">
                      Document Integration Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">
                          Total Document Types:
                        </span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .clinicalDocumentIntegration
                              .documentIntegrationSummary.totalDocumentTypes
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Integrated:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .clinicalDocumentIntegration
                              .documentIntegrationSummary.integratedDocuments
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Pending:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .clinicalDocumentIntegration
                              .documentIntegrationSummary.pendingIntegration
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Accuracy:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .clinicalDocumentIntegration
                              .documentIntegrationSummary.integrationAccuracy
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.2.1.3: Error Handling and Recovery */}
              <Card className="border-l-4 border-l-purple-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.2.1.3: Error Handling and Recovery
                      </CardTitle>
                      <CardDescription>
                        Network failure recovery, partial sync completion, data
                        conflict resolution, and manual sync override
                        functionality
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getIntegrationStatusIcon(
                        malaffiTestingResults.malaffiIntegrationResults
                          .errorHandlingRecovery.overallRecoveryScore,
                      )}
                      <Badge
                        className={getIntegrationStatusColor(
                          malaffiTestingResults.malaffiIntegrationResults
                            .errorHandlingRecovery.overallRecoveryScore,
                        )}
                      >
                        {
                          malaffiTestingResults.malaffiIntegrationResults
                            .errorHandlingRecovery.overallRecoveryScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      malaffiTestingResults.malaffiIntegrationResults
                        .errorHandlingRecovery.testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getIntegrationStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                        <div className="text-xs text-gray-600 mt-1">
                          Automation: {testResult.automationScore}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Error Handling Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Error Handling Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">
                          Total Error Scenarios:
                        </span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .errorHandlingRecovery.errorHandlingSummary
                              .totalErrorScenarios
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Handled:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .errorHandlingRecovery.errorHandlingSummary
                              .handledErrors
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Unhandled:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .errorHandlingRecovery.errorHandlingSummary
                              .unhandledErrors
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Recovery Rate:</span>
                        <span className="ml-2">
                          {
                            malaffiTestingResults.malaffiIntegrationResults
                              .errorHandlingRecovery.errorHandlingSummary
                              .recoverySuccessRate
                          }
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues and Recommendations */}
            {(malaffiTestingResults.criticalIssues.length > 0 ||
              malaffiTestingResults.recommendations.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {malaffiTestingResults.criticalIssues.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5" />
                        Critical Issues (
                        {malaffiTestingResults.criticalIssues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {malaffiTestingResults.criticalIssues.map(
                          (issue: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-red-50 rounded"
                            >
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700">
                                {issue}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {malaffiTestingResults.recommendations.length > 0 && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Recommendations (
                        {malaffiTestingResults.recommendations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {malaffiTestingResults.recommendations.map(
                          (recommendation: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-blue-50 rounded"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-700">
                                {recommendation}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        )}

        {!malaffiTestingResults && (
          <CardContent>
            <div className="text-center py-8">
              <Network className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Malaffi EMR Integration Testing Ready
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Run Malaffi Integration Tests" to execute comprehensive
                testing for EMR integration capabilities.
              </p>
              <div className="text-sm text-gray-500">
                <p>
                  • Subtask 2.2.1.1: Bi-directional data synchronization
                  (patient data pull, clinical document push, real-time
                  monitoring, failure recovery)
                </p>
                <p>
                  • Subtask 2.2.1.2: Clinical document integration (care plans,
                  assessments, medications, lab results)
                </p>
                <p>
                  • Subtask 2.2.1.3: Error handling and recovery (network
                  failures, partial sync, data conflicts, manual override)
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Phase 2 Testing Results Component
function Phase2TestingResults({ facilityId }: { facilityId: string }) {
  const [testingResults, setTestingResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const runPhase2Tests = async () => {
    try {
      setLoading(true);

      // Mock patient data for comprehensive testing
      const mockPatientData = {
        patientId: "TEST-001",
        demographics: { name: "Test Patient", age: 65 },
        medicalHistory: { conditions: ["diabetes", "hypertension"] },
        functionalStatus: {
          mobility: "limited",
          adl: { bathing: "assistance", dressing: "independent" },
        },
        cognitiveStatus: { orientation: "oriented", memory: "intact" },
        socialSupport: { caregiver: true, family: "available" },
        environmentalFactors: { homeAccess: "adequate", safety: "assessed" },
        medical_conditions: [
          { severity: "moderate", prevents_leaving_home: true },
        ],
        functional_limitations: {
          mobility: { severity: "severe" },
          adl: { bathing: "dependent", dressing: "assistance" },
        },
        safetyRisks: [
          { riskType: "fall", severity: "high", mitigationRequired: true },
        ],
        physician_orders: ["home_confinement"],
        medical_contraindications: ["leaving_home"],
        clinical_justification:
          "Patient requires continuous monitoring due to unstable medical condition",
        absences: { medical: 1, religious: 0, family: 0 },
        absences_last_month: 1,
        faceToFaceEncounter: {
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          reason: "Comprehensive assessment for homecare eligibility",
          homeboundJustification:
            "Patient unable to leave home without significant effort due to mobility limitations",
        },
        serviceStartDate: new Date().toISOString(),
        postCareEncounter: {
          scheduled: true,
          scheduledDate: new Date(
            Date.now() + 45 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          automatedTracking: true,
        },
        physicianCertification: {
          digitalSignature: true,
          automatedWorkflow: true,
          timestampValidated: true,
          licenseVerified: true,
        },
        clinicalCondition: {
          primaryDiagnosis:
            "Chronic heart failure with reduced ejection fraction",
          secondaryConditions: ["diabetes mellitus type 2", "hypertension"],
          functionalStatus: { mobility: "severely limited" },
          prognosis: "Stable with appropriate management and monitoring",
        },
        functionalLimitations: {
          adl: {
            bathing: "dependent",
            dressing: "assistance",
            toileting: "assistance",
          },
          iadl: {
            cooking: "unable",
            shopping: "unable",
            medication: "assistance",
          },
          mobility: { severity: "severe", impactOnDailyLiving: true },
          cognitive: { impactOnDailyLiving: false },
        },
        safetyRisks: {
          fallRisk: { severity: "high", mitigationRequired: true },
          medicationSafety: { riskType: "polypharmacy" },
          environmental: ["stairs", "loose rugs"],
          emergencyResponse: { planInPlace: true },
        },
        skilledCareRequirements: {
          nursing: { complexity: "advanced", frequency: "daily" },
          therapy: ["physical therapy", "occupational therapy"],
          equipment: ["hospital bed", "oxygen concentrator"],
          professionalRequired: "registered nurse",
        },
        medicalStability: {
          vitalSigns: { stable: true },
          medications: { stable: false },
          conditionProgression: { status: "stable" },
          hospitalizationRisk: { level: "moderate" },
        },
      };

      const results =
        dohComplianceValidatorService.executePhase2ComprehensiveTesting(
          mockPatientData,
        );
      setTestingResults(results);
    } catch (error) {
      console.error("Error running Phase 2 tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTestStatusColor = (score: number) => {
    if (score >= 95) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 85) return "text-blue-600 bg-blue-100 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getTestStatusIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 85) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (score >= 70)
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Phase 2: Comprehensive Functional Testing</CardTitle>
              <CardDescription>
                DOH Compliance Testing for New Standards - Subtasks 2.1.1.1
                through 2.1.1.3
              </CardDescription>
            </div>
            <Button
              onClick={runPhase2Tests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              {loading ? "Running Tests..." : "Run Phase 2 Tests"}
            </Button>
          </div>
        </CardHeader>

        {testingResults && (
          <CardContent>
            {/* Testing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {testingResults.overallPhase2Score}%
                  </div>
                  <p className="text-sm text-blue-600">Overall Score</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-900">
                    {testingResults.testingSummary.passedTests}
                  </div>
                  <p className="text-sm text-green-600">Tests Passed</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-red-900">
                    {testingResults.testingSummary.failedTests}
                  </div>
                  <p className="text-sm text-red-600">Tests Failed</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-4">
                  <div className="text-sm font-bold text-purple-900 capitalize">
                    {testingResults.testingSummary.complianceLevel.replace(
                      "_",
                      " ",
                    )}
                  </div>
                  <p className="text-sm text-purple-600">Compliance Level</p>
                </CardContent>
              </Card>
            </div>

            {/* Test Results by Subtask */}
            <div className="space-y-6">
              {/* Subtask 2.1.1.1: Homebound Assessment Compliance */}
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.1.1: Homebound Assessment Compliance
                      </CardTitle>
                      <CardDescription>
                        Digital verification, illness/injury automation,
                        contraindication documentation, absence tracking
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(
                        testingResults.phase2Results
                          .homeboundAssessmentCompliance.overallComplianceScore,
                      )}
                      <Badge
                        className={getTestStatusColor(
                          testingResults.phase2Results
                            .homeboundAssessmentCompliance
                            .overallComplianceScore,
                        )}
                      >
                        {
                          testingResults.phase2Results
                            .homeboundAssessmentCompliance
                            .overallComplianceScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      testingResults.phase2Results.homeboundAssessmentCompliance
                        .testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getTestStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.1.1.2: Face-to-Face Encounter Requirements */}
              <Card className="border-l-4 border-l-green-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.1.2: Face-to-Face Encounter Requirements
                      </CardTitle>
                      <CardDescription>
                        30-day prior documentation, 60-day post-care tracking,
                        physician certification, clinical documentation
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(
                        testingResults.phase2Results
                          .faceToFaceEncounterRequirements
                          .overallComplianceScore,
                      )}
                      <Badge
                        className={getTestStatusColor(
                          testingResults.phase2Results
                            .faceToFaceEncounterRequirements
                            .overallComplianceScore,
                        )}
                      >
                        {
                          testingResults.phase2Results
                            .faceToFaceEncounterRequirements
                            .overallComplianceScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      testingResults.phase2Results
                        .faceToFaceEncounterRequirements.testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getTestStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subtask 2.1.1.3: Medical Necessity Documentation */}
              <Card className="border-l-4 border-l-purple-400">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">
                        Subtask 2.1.1.3: Medical Necessity Documentation
                      </CardTitle>
                      <CardDescription>
                        Functional limitations, safety risks, skilled care
                        requirements, medical stability assessment
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(
                        testingResults.phase2Results
                          .medicalNecessityDocumentation.overallComplianceScore,
                      )}
                      <Badge
                        className={getTestStatusColor(
                          testingResults.phase2Results
                            .medicalNecessityDocumentation
                            .overallComplianceScore,
                        )}
                      >
                        {
                          testingResults.phase2Results
                            .medicalNecessityDocumentation
                            .overallComplianceScore
                        }
                        %
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      testingResults.phase2Results.medicalNecessityDocumentation
                        .testResults,
                    ).map(([testName, testResult]: [string, any]) => (
                      <div key={testName} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">
                            {testName
                              .replace(/([A-Z])/g, " $1")
                              .replace("Test", "")
                              .trim()}
                          </h4>
                          {getTestStatusIcon(testResult.score)}
                        </div>
                        <div className="text-lg font-bold">
                          {testResult.score}%
                        </div>
                        <Progress
                          value={testResult.score}
                          className="h-2 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues and Recommendations */}
            {(testingResults.criticalIssues.length > 0 ||
              testingResults.recommendations.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {testingResults.criticalIssues.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Critical Issues ({testingResults.criticalIssues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {testingResults.criticalIssues.map(
                          (issue: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-red-50 rounded"
                            >
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-red-700">
                                {issue}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {testingResults.recommendations.length > 0 && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Recommendations ({testingResults.recommendations.length}
                        )
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {testingResults.recommendations.map(
                          (recommendation: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-blue-50 rounded"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-700">
                                {recommendation}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        )}

        {!testingResults && (
          <CardContent>
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Phase 2 Testing Ready
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Run Phase 2 Tests" to execute comprehensive functional
                testing for new DOH standards.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Subtask 2.1.1.1: Homebound assessment compliance</p>
                <p>• Subtask 2.1.1.2: Face-to-face encounter requirements</p>
                <p>• Subtask 2.1.1.3: Medical necessity documentation</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
