import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Wheelchair,
  Eye,
  Upload,
  Download,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type:
    | "assessment"
    | "wheelchair_preapproval"
    | "face_to_face"
    | "treatment_plan"
    | "progress_note"
    | "other";
  status: "valid" | "expired" | "missing" | "pending_review" | "rejected";
  uploadDate?: string;
  expiryDate?: string;
  lastReviewDate?: string;
  reviewedBy?: string;
  fileSize?: number;
  fileType?: string;
  version: number;
  isRequired: boolean;
  complianceNotes: string[];
}

interface PatientDocuments {
  id: string;
  patientId: string;
  patientName: string;
  episodeId: string;
  documents: Document[];
  overallCompliance: number;
  lastUpdated: string;
  criticalIssues: string[];
  upcomingExpirations: Document[];
}

interface WheelchairPreApproval {
  id: string;
  patientName: string;
  requestDate: string;
  approvalStatus: "pending" | "approved" | "rejected" | "expired";
  expiryDate?: string;
  wheelchairType: string;
  justification: string;
  supportingDocuments: Document[];
  reviewNotes: string[];
}

interface FaceToFaceAssessment {
  id: string;
  patientName: string;
  assessmentDate: string;
  assessorName: string;
  assessmentType: "initial" | "follow_up" | "reassessment";
  status: "completed" | "scheduled" | "overdue" | "cancelled";
  nextDueDate?: string;
  findings: string;
  recommendations: string[];
  documents: Document[];
}

interface DocumentComplianceCheckerProps {
  className?: string;
}

const DocumentComplianceChecker: React.FC<DocumentComplianceCheckerProps> = ({
  className = "",
}) => {
  const [patientDocuments, setPatientDocuments] = useState<PatientDocuments[]>(
    [],
  );
  const [wheelchairApprovals, setWheelchairApprovals] = useState<
    WheelchairPreApproval[]
  >([]);
  const [faceToFaceAssessments, setFaceToFaceAssessments] = useState<
    FaceToFaceAssessment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDocumentData();
  }, []);

  const loadDocumentData = async () => {
    try {
      setLoading(true);

      // Mock patient documents data
      const mockPatientDocuments: PatientDocuments[] = [
        {
          id: "pd-001",
          patientId: "pat-001",
          patientName: "Ahmed Al Mansouri",
          episodeId: "ep-001",
          documents: [
            {
              id: "doc-001",
              name: "Initial Assessment",
              type: "assessment",
              status: "valid",
              uploadDate: "2024-03-01",
              expiryDate: "2024-06-01",
              lastReviewDate: "2024-03-01",
              reviewedBy: "Dr. Sarah Ahmed",
              fileSize: 2048,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: [
                "Complete assessment with all required sections",
              ],
            },
            {
              id: "doc-002",
              name: "Treatment Plan",
              type: "treatment_plan",
              status: "valid",
              uploadDate: "2024-03-02",
              lastReviewDate: "2024-03-02",
              reviewedBy: "Dr. Sarah Ahmed",
              fileSize: 1536,
              fileType: "PDF",
              version: 2,
              isRequired: true,
              complianceNotes: ["Updated treatment plan with goals"],
            },
            {
              id: "doc-003",
              name: "Face-to-Face Assessment",
              type: "face_to_face",
              status: "expired",
              uploadDate: "2024-01-15",
              expiryDate: "2024-03-15",
              lastReviewDate: "2024-01-15",
              reviewedBy: "Dr. Sarah Ahmed",
              fileSize: 1024,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: ["Assessment expired - requires renewal"],
            },
          ],
          overallCompliance: 75,
          lastUpdated: "2024-03-15",
          criticalIssues: ["Face-to-face assessment expired"],
          upcomingExpirations: [],
        },
        {
          id: "pd-002",
          patientId: "pat-002",
          patientName: "Fatima Al Zahra",
          episodeId: "ep-002",
          documents: [
            {
              id: "doc-004",
              name: "Wheelchair Pre-Approval",
              type: "wheelchair_preapproval",
              status: "valid",
              uploadDate: "2024-03-10",
              expiryDate: "2024-09-10",
              lastReviewDate: "2024-03-12",
              reviewedBy: "Dr. Mohammed Hassan",
              fileSize: 3072,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: [
                "Approved for manual wheelchair",
                "6-month validity",
              ],
            },
            {
              id: "doc-005",
              name: "Progress Notes",
              type: "progress_note",
              status: "missing",
              isRequired: true,
              version: 0,
              complianceNotes: ["Monthly progress notes required"],
            },
          ],
          overallCompliance: 60,
          lastUpdated: "2024-03-12",
          criticalIssues: ["Progress notes missing"],
          upcomingExpirations: [],
        },
      ];

      // Mock wheelchair approvals data
      const mockWheelchairApprovals: WheelchairPreApproval[] = [
        {
          id: "wa-001",
          patientName: "Fatima Al Zahra",
          requestDate: "2024-03-08",
          approvalStatus: "approved",
          expiryDate: "2024-09-08",
          wheelchairType: "Manual Wheelchair - Standard",
          justification:
            "Patient requires mobility assistance due to lower limb weakness",
          supportingDocuments: [
            {
              id: "doc-006",
              name: "Medical Assessment",
              type: "assessment",
              status: "valid",
              uploadDate: "2024-03-08",
              fileSize: 2048,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: ["Complete medical justification"],
            },
          ],
          reviewNotes: [
            "Approved for 6 months",
            "Standard manual wheelchair suitable",
          ],
        },
        {
          id: "wa-002",
          patientName: "Omar Al Rashid",
          requestDate: "2024-03-15",
          approvalStatus: "pending",
          wheelchairType: "Electric Wheelchair - Advanced",
          justification:
            "Patient requires powered mobility due to severe mobility limitations",
          supportingDocuments: [
            {
              id: "doc-007",
              name: "Specialist Report",
              type: "assessment",
              status: "pending_review",
              uploadDate: "2024-03-15",
              fileSize: 1536,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: ["Awaiting specialist review"],
            },
          ],
          reviewNotes: ["Under review - requires additional documentation"],
        },
      ];

      // Mock face-to-face assessments data
      const mockFaceToFaceAssessments: FaceToFaceAssessment[] = [
        {
          id: "fta-001",
          patientName: "Ahmed Al Mansouri",
          assessmentDate: "2024-01-15",
          assessorName: "Dr. Sarah Ahmed",
          assessmentType: "initial",
          status: "overdue",
          nextDueDate: "2024-03-15",
          findings: "Patient shows good progress with current treatment plan",
          recommendations: [
            "Continue current therapy",
            "Schedule follow-up in 2 months",
          ],
          documents: [
            {
              id: "doc-008",
              name: "Assessment Report",
              type: "face_to_face",
              status: "expired",
              uploadDate: "2024-01-15",
              expiryDate: "2024-03-15",
              fileSize: 1024,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: ["Assessment expired - renewal required"],
            },
          ],
        },
        {
          id: "fta-002",
          patientName: "Fatima Al Zahra",
          assessmentDate: "2024-03-10",
          assessorName: "Dr. Mohammed Hassan",
          assessmentType: "follow_up",
          status: "completed",
          nextDueDate: "2024-05-10",
          findings: "Patient adapting well to wheelchair use",
          recommendations: [
            "Continue mobility training",
            "Monitor for any complications",
          ],
          documents: [
            {
              id: "doc-009",
              name: "Follow-up Assessment",
              type: "face_to_face",
              status: "valid",
              uploadDate: "2024-03-10",
              expiryDate: "2024-05-10",
              fileSize: 1280,
              fileType: "PDF",
              version: 1,
              isRequired: true,
              complianceNotes: ["Complete follow-up assessment"],
            },
          ],
        },
      ];

      setPatientDocuments(mockPatientDocuments);
      setWheelchairApprovals(mockWheelchairApprovals);
      setFaceToFaceAssessments(mockFaceToFaceAssessments);
    } catch (error) {
      console.error("Error loading document data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDocumentData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "expired":
      case "overdue":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "missing":
        return "bg-gray-100 text-gray-800";
      case "pending":
      case "pending_review":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const criticalIssues = patientDocuments.reduce(
    (acc, pd) => acc + pd.criticalIssues.length,
    0,
  );
  const expiredDocuments = patientDocuments.reduce(
    (acc, pd) =>
      acc + pd.documents.filter((doc) => doc.status === "expired").length,
    0,
  );
  const missingDocuments = patientDocuments.reduce(
    (acc, pd) =>
      acc + pd.documents.filter((doc) => doc.status === "missing").length,
    0,
  );
  const pendingApprovals = wheelchairApprovals.filter(
    (wa) => wa.approvalStatus === "pending",
  ).length;
  const overdueAssessments = faceToFaceAssessments.filter(
    (fta) => fta.status === "overdue",
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 bg-gray-50 min-h-screen p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-blue-600" />
            Document Compliance Checker
          </h1>
          <p className="text-gray-600 mt-1">
            Validate documents, wheelchair pre-approvals, and face-to-face
            assessments
          </p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues > 0 && (
        <Alert variant="compliance-critical">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Document Issues</AlertTitle>
          <AlertDescription>
            {criticalIssues} critical document issue(s) require immediate
            attention.
            {expiredDocuments > 0 &&
              ` ${expiredDocuments} expired document(s).`}
            {missingDocuments > 0 &&
              ` ${missingDocuments} missing document(s).`}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">{patientDocuments.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {criticalIssues}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired Docs</p>
                <p className="text-2xl font-bold text-orange-600">
                  {expiredDocuments}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingApprovals}
                </p>
              </div>
              <Wheelchair className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Assessments</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueAssessments}
                </p>
              </div>
              <Eye className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wheelchair">Wheelchair Approvals</TabsTrigger>
          <TabsTrigger value="assessments">Face-to-Face</TabsTrigger>
          <TabsTrigger value="documents">All Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {patientDocuments.map((patient) => (
              <Card
                key={patient.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  patient.criticalIssues.length > 0 &&
                    "border-l-4 border-l-red-500",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {patient.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Episode: {patient.episodeId} | Last Updated:{" "}
                        {new Date(patient.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Compliance Score</p>
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          getComplianceColor(patient.overallCompliance),
                        )}
                      >
                        {patient.overallCompliance}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Documents</p>
                      <p className="font-semibold">
                        {patient.documents.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valid Documents</p>
                      <p className="font-semibold text-green-600">
                        {
                          patient.documents.filter(
                            (doc) => doc.status === "valid",
                          ).length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Issues</p>
                      <p className="font-semibold text-red-600">
                        {
                          patient.documents.filter(
                            (doc) => doc.status !== "valid",
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  {patient.criticalIssues.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 rounded">
                      <h4 className="font-medium text-red-800 mb-2">
                        Critical Issues:
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {patient.criticalIssues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium">Documents:</h4>
                    {patient.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium">{document.name}</h5>
                            <Badge className={getStatusColor(document.status)}>
                              {document.status.replace("_", " ")}
                            </Badge>
                            {document.isRequired && (
                              <Badge variant="outline">Required</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {document.uploadDate && (
                              <span>
                                Uploaded:{" "}
                                {new Date(
                                  document.uploadDate,
                                ).toLocaleDateString()}{" "}
                                |{" "}
                              </span>
                            )}
                            {document.expiryDate && (
                              <span>
                                Expires:{" "}
                                {new Date(
                                  document.expiryDate,
                                ).toLocaleDateString()}{" "}
                                |{" "}
                              </span>
                            )}
                            {document.fileSize && (
                              <span>
                                Size: {formatFileSize(document.fileSize)} |{" "}
                              </span>
                            )}
                            Version: {document.version}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {document.status === "missing" ? (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wheelchair">
          <Card>
            <CardHeader>
              <CardTitle>Wheelchair Pre-Approval Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="doh-requirement">
                  <Wheelchair className="h-4 w-4" />
                  <AlertTitle>Wheelchair Pre-Approval Requirements</AlertTitle>
                  <AlertDescription>
                    All wheelchair requests require medical justification,
                    supporting documentation, and DOH approval before provision.
                  </AlertDescription>
                </Alert>

                {wheelchairApprovals.map((approval) => (
                  <Card
                    key={approval.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      approval.approvalStatus === "pending" &&
                        "border-l-4 border-l-yellow-500",
                      approval.approvalStatus === "rejected" &&
                        "border-l-4 border-l-red-500",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">
                              {approval.patientName}
                            </h3>
                            <Badge
                              className={getStatusColor(
                                approval.approvalStatus,
                              )}
                            >
                              {approval.approvalStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">
                                Request Date:
                              </span>
                              <p className="font-medium">
                                {new Date(
                                  approval.requestDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Wheelchair Type:
                              </span>
                              <p className="font-medium">
                                {approval.wheelchairType}
                              </p>
                            </div>
                            {approval.expiryDate && (
                              <div>
                                <span className="text-gray-600">Expires:</span>
                                <p className="font-medium">
                                  {new Date(
                                    approval.expiryDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mb-3">
                            <span className="text-gray-600">
                              Justification:
                            </span>
                            <p className="text-sm mt-1">
                              {approval.justification}
                            </p>
                          </div>
                          {approval.supportingDocuments.length > 0 && (
                            <div className="mb-3">
                              <span className="text-gray-600">
                                Supporting Documents:
                              </span>
                              <div className="mt-1 space-y-1">
                                {approval.supportingDocuments.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{doc.name}</span>
                                    <Badge
                                      className={getStatusColor(doc.status)}
                                    >
                                      {doc.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {approval.reviewNotes.length > 0 && (
                            <div>
                              <span className="text-gray-600">
                                Review Notes:
                              </span>
                              <ul className="text-sm mt-1 space-y-1">
                                {approval.reviewNotes.map((note, index) => (
                                  <li key={index}>• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {approval.approvalStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Face-to-Face Assessment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="doh-requirement">
                  <Eye className="h-4 w-4" />
                  <AlertTitle>Face-to-Face Assessment Requirements</AlertTitle>
                  <AlertDescription>
                    Regular face-to-face assessments are mandatory for all
                    homecare patients. Assessments must be conducted within
                    specified timeframes.
                  </AlertDescription>
                </Alert>

                {faceToFaceAssessments.map((assessment) => (
                  <Card
                    key={assessment.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      assessment.status === "overdue" &&
                        "border-l-4 border-l-red-500",
                      assessment.status === "scheduled" &&
                        "border-l-4 border-l-blue-500",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">
                              {assessment.patientName}
                            </h3>
                            <Badge
                              className={getStatusColor(assessment.status)}
                            >
                              {assessment.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline">
                              {assessment.assessmentType}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">
                                Assessment Date:
                              </span>
                              <p className="font-medium">
                                {new Date(
                                  assessment.assessmentDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Assessor:</span>
                              <p className="font-medium">
                                {assessment.assessorName}
                              </p>
                            </div>
                            {assessment.nextDueDate && (
                              <div>
                                <span className="text-gray-600">Next Due:</span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    new Date(assessment.nextDueDate) <
                                      new Date()
                                      ? "text-red-600"
                                      : "text-green-600",
                                  )}
                                >
                                  {new Date(
                                    assessment.nextDueDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Documents:</span>
                              <p className="font-medium">
                                {assessment.documents.length}
                              </p>
                            </div>
                          </div>
                          <div className="mb-3">
                            <span className="text-gray-600">Findings:</span>
                            <p className="text-sm mt-1">
                              {assessment.findings}
                            </p>
                          </div>
                          {assessment.recommendations.length > 0 && (
                            <div className="mb-3">
                              <span className="text-gray-600">
                                Recommendations:
                              </span>
                              <ul className="text-sm mt-1 space-y-1">
                                {assessment.recommendations.map(
                                  (rec, index) => (
                                    <li key={index}>• {rec}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                          {assessment.documents.length > 0 && (
                            <div>
                              <span className="text-gray-600">
                                Assessment Documents:
                              </span>
                              <div className="mt-1 space-y-1">
                                {assessment.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{doc.name}</span>
                                    <Badge
                                      className={getStatusColor(doc.status)}
                                    >
                                      {doc.status.replace("_", " ")}
                                    </Badge>
                                    {doc.expiryDate && (
                                      <span className="text-xs text-gray-500">
                                        Expires:{" "}
                                        {new Date(
                                          doc.expiryDate,
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {assessment.status === "overdue" && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Assessment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>All Documents Overview</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="valid">Valid</option>
                    <option value="expired">Expired</option>
                    <option value="missing">Missing</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientDocuments.map((patient) =>
                  patient.documents
                    .filter((doc) => {
                      const matchesSearch =
                        searchTerm === "" ||
                        doc.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        patient.patientName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase());
                      const matchesStatus =
                        filterStatus === "all" || doc.status === filterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((document) => (
                      <Card
                        key={`${patient.id}-${document.id}`}
                        className={cn(
                          "transition-all hover:shadow-md",
                          document.status === "expired" &&
                            "border-l-4 border-l-red-500",
                          document.status === "missing" &&
                            "border-l-4 border-l-gray-500",
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold">
                                  {document.name}
                                </h3>
                                <Badge
                                  className={getStatusColor(document.status)}
                                >
                                  {document.status.replace("_", " ")}
                                </Badge>
                                {document.isRequired && (
                                  <Badge variant="outline">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Patient: {patient.patientName} | Episode:{" "}
                                {patient.episodeId}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {document.uploadDate && (
                                  <div>
                                    <span className="text-gray-600">
                                      Uploaded:
                                    </span>
                                    <p className="font-medium">
                                      {new Date(
                                        document.uploadDate,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                                {document.expiryDate && (
                                  <div>
                                    <span className="text-gray-600">
                                      Expires:
                                    </span>
                                    <p
                                      className={cn(
                                        "font-medium",
                                        new Date(document.expiryDate) <
                                          new Date()
                                          ? "text-red-600"
                                          : "text-green-600",
                                      )}
                                    >
                                      {new Date(
                                        document.expiryDate,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                                {document.fileSize && (
                                  <div>
                                    <span className="text-gray-600">Size:</span>
                                    <p className="font-medium">
                                      {formatFileSize(document.fileSize)}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">
                                    Version:
                                  </span>
                                  <p className="font-medium">
                                    {document.version}
                                  </p>
                                </div>
                              </div>
                              {document.complianceNotes.length > 0 && (
                                <div className="mt-3">
                                  <span className="text-gray-600">Notes:</span>
                                  <ul className="text-sm mt-1 space-y-1">
                                    {document.complianceNotes.map(
                                      (note, index) => (
                                        <li key={index}>• {note}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              {document.status === "missing" ? (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              )}
                              {document.status === "expired" && (
                                <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Renew
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentComplianceChecker;
