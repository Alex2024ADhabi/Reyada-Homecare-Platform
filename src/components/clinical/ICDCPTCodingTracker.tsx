import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  FileCheck,
  Save,
  Upload,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Clock,
  BarChart2,
  FileSymlink,
  CheckSquare,
  AlertTriangle,
  BookOpen,
  Stethoscope,
} from "lucide-react";
import { ICDCPTCodingAPI, ICDCPTCodingRecord } from "@/api/icd-cpt-coding.api";

interface ICDCPTCodingTrackerProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
}

// Using the interface from the API
type ICDCPTRecord = ICDCPTCodingRecord;

const ICDCPTCodingTracker = ({
  patientId = "P12345",
  episodeId = "EP789",
  isOffline = false,
}: ICDCPTCodingTrackerProps) => {
  const [activeTab, setActiveTab] = useState("records");
  const [records, setRecords] = useState<ICDCPTCodingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] =
    useState<ICDCPTCodingRecord | null>(null);

  // Dialog states
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
  const [showPhysicianQueryDialog, setShowPhysicianQueryDialog] =
    useState(false);
  const [showQualityAuditDialog, setShowQualityAuditDialog] = useState(false);
  const [showPeerReviewDialog, setShowPeerReviewDialog] = useState(false);
  const [showAuthCheckDialog, setShowAuthCheckDialog] = useState(false);
  const [showCodeVerificationDialog, setShowCodeVerificationDialog] =
    useState(false);
  const [showMedicalRecordReviewDialog, setShowMedicalRecordReviewDialog] =
    useState(false);
  const [showGapAnalysisDialog, setShowGapAnalysisDialog] = useState(false);

  // Form states
  const [newIcdCode, setNewIcdCode] = useState("");
  const [newIcdDescription, setNewIcdDescription] = useState("");
  const [newCptCode, setNewCptCode] = useState("");
  const [newCptDescription, setNewCptDescription] = useState("");
  const [queryContent, setQueryContent] = useState("");
  const [queryFrom, setQueryFrom] = useState("Insurance Coding Officer");
  const [auditFindings, setAuditFindings] = useState("");
  const [auditActions, setAuditActions] = useState("");
  const [auditStatus, setAuditStatus] = useState("Pass");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComments, setReviewComments] = useState("");
  const [reviewApproval, setReviewApproval] = useState("Approved");
  const [discrepancies, setDiscrepancies] = useState("");
  const [resolutionRequired, setResolutionRequired] = useState(false);

  // New form states for enhanced functionality
  const [codeVerifier, setCodeVerifier] = useState("");
  const [codeVerificationComments, setCodeVerificationComments] = useState("");
  const [codeVerificationStatus, setCodeVerificationStatus] =
    useState("Verified");
  const [medicalRecordReviewer, setMedicalRecordReviewer] = useState("");
  const [medicalRecordFindings, setMedicalRecordFindings] = useState("");
  const [medicalRecordRecommendations, setMedicalRecordRecommendations] =
    useState("");
  const [gapAnalysisData, setGapAnalysisData] = useState(null);

  // Mock patient data
  const patient = {
    name: "Mohammed Al Mansoori",
    emiratesId: "784-1985-1234567-8",
    age: 67,
    gender: "Male",
    insurance: "Daman - Thiqa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
  };

  // Mock ICD-10 codes for dropdown
  const icdCodeOptions = [
    { code: "I10", description: "Essential (primary) hypertension" },
    {
      code: "E11.9",
      description: "Type 2 diabetes mellitus without complications",
    },
    {
      code: "J44.9",
      description: "Chronic obstructive pulmonary disease, unspecified",
    },
    { code: "M17.0", description: "Bilateral primary osteoarthritis of knee" },
    {
      code: "I25.10",
      description:
        "Atherosclerotic heart disease of native coronary artery without angina pectoris",
    },
  ];

  // Mock CPT codes for dropdown
  const cptCodeOptions = [
    { code: "99347", description: "Home visit, established patient (15 min)" },
    { code: "99348", description: "Home visit, established patient (25 min)" },
    { code: "99349", description: "Home visit, established patient (40 min)" },
    { code: "99350", description: "Home visit, established patient (60 min)" },
    { code: "97110", description: "Therapeutic exercises" },
    { code: "97112", description: "Neuromuscular reeducation" },
    { code: "97116", description: "Gait training" },
  ];

  // Fetch records from API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Use the API service to fetch records
        const fetchedRecords =
          await ICDCPTCodingAPI.getRecordsByPatientId(patientId);

        // Map the records to match the component's expected structure
        const mappedRecords = fetchedRecords.map((record) => ({
          ...record,
          _id: record.id, // Ensure compatibility with existing code that uses _id
        }));

        setRecords(mappedRecords);
      } catch (error) {
        console.error("Error fetching ICD & CPT records:", error);
        // If API fails, use mock data for demo purposes
        const mockRecords = [
          {
            id: "1",
            _id: "1",
            patient_id: patientId,
            mrn: "MRN12345",
            service_date: "2023-10-15",
            authorization_number: "AUTH-98765",
            icd_codes_assigned: ["I10", "E11.9"],
            icd_descriptions: [
              "Essential (primary) hypertension",
              "Type 2 diabetes mellitus without complications",
            ],
            cpt_codes_assigned: ["99347", "97110"],
            cpt_descriptions: [
              "Home visit, established patient (15 min)",
              "Therapeutic exercises",
            ],
            physician_query_required: true,
            physician_query_sent: true,
            physician_response_received: false,
            qa_audit_completed: false,
            peer_review_completed: false,
            authorization_code_alignment_checked: false,
            coding_status: "In Progress",
            created_at: "2023-10-14T08:00:00Z",
            updated_at: "2023-10-15T10:30:00Z",
          },
          {
            id: "2",
            _id: "2",
            patient_id: patientId,
            mrn: "MRN12345",
            service_date: "2023-10-10",
            authorization_number: "AUTH-98765",
            icd_codes_assigned: ["J44.9"],
            icd_descriptions: [
              "Chronic obstructive pulmonary disease, unspecified",
            ],
            cpt_codes_assigned: ["99348", "97112"],
            cpt_descriptions: [
              "Home visit, established patient (25 min)",
              "Neuromuscular reeducation",
            ],
            physician_query_required: false,
            physician_query_sent: false,
            physician_response_received: false,
            qa_audit_completed: true,
            peer_review_completed: true,
            authorization_code_alignment_checked: true,
            coding_status: "Completed",
            created_at: "2023-10-09T08:00:00Z",
            updated_at: "2023-10-11T14:45:00Z",
          },
        ];
        setRecords(mockRecords);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, isOffline]);

  // Create new record
  const handleCreateRecord = async () => {
    try {
      const newRecord = {
        patient_id: patientId,
        mrn: "MRN12345",
        service_date: new Date().toISOString().split("T")[0],
        authorization_number: "AUTH-98765",
        icd_codes_assigned: [],
        icd_descriptions: [],
        cpt_codes_assigned: [],
        cpt_descriptions: [],
        physician_query_required: false,
        physician_query_sent: false,
        physician_response_received: false,
        qa_audit_completed: false,
        peer_review_completed: false,
        authorization_code_alignment_checked: false,
        coding_status: "In Progress",
      };

      // Use the API service to create a new record
      const createdRecord = await ICDCPTCodingAPI.createRecord(newRecord);

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...createdRecord,
        _id: createdRecord.id,
      };

      setRecords([...records, recordWithId]);
      setSelectedRecord(recordWithId);
      setShowNewRecordDialog(false);
    } catch (error) {
      console.error("Error creating ICD & CPT record:", error);
      alert("Failed to create record. Please try again.");
    }
  };

  // Add ICD code to selected record
  const handleAddIcdCode = async () => {
    if (!selectedRecord || !newIcdCode || !newIcdDescription) return;

    try {
      const updates = {
        icd_codes_assigned: [...selectedRecord.icd_codes_assigned, newIcdCode],
        icd_descriptions: [
          ...selectedRecord.icd_descriptions,
          newIcdDescription,
        ],
      };

      // Use the API service to update the record
      const updatedRecord = await ICDCPTCodingAPI.updateRecord(
        selectedRecord.id,
        updates,
      );

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? recordWithId : record,
        ),
      );
      setSelectedRecord(recordWithId);
      setNewIcdCode("");
      setNewIcdDescription("");
    } catch (error) {
      console.error("Error adding ICD code:", error);
      alert("Failed to add ICD code. Please try again.");
    }
  };

  // Add CPT code to selected record
  const handleAddCptCode = async () => {
    if (!selectedRecord || !newCptCode || !newCptDescription) return;

    try {
      const updates = {
        cpt_codes_assigned: [...selectedRecord.cpt_codes_assigned, newCptCode],
        cpt_descriptions: [
          ...selectedRecord.cpt_descriptions,
          newCptDescription,
        ],
      };

      // Use the API service to update the record
      const updatedRecord = await ICDCPTCodingAPI.updateRecord(
        selectedRecord.id,
        updates,
      );

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? recordWithId : record,
        ),
      );
      setSelectedRecord(recordWithId);
      setNewCptCode("");
      setNewCptDescription("");
    } catch (error) {
      console.error("Error adding CPT code:", error);
      alert("Failed to add CPT code. Please try again.");
    }
  };

  // Submit physician query
  const handleSubmitPhysicianQuery = async () => {
    if (!selectedRecord || !queryContent || !queryFrom) return;

    try {
      // Use the API service to submit a physician query
      const updatedRecord = await ICDCPTCodingAPI.submitPhysicianQuery(
        selectedRecord.id,
        { queryContent, queryFrom },
      );

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? recordWithId : record,
        ),
      );
      setSelectedRecord(recordWithId);
      setShowPhysicianQueryDialog(false);
      setQueryContent("");
      setQueryFrom("Insurance Coding Officer");
      alert("Physician query submitted successfully");
    } catch (error) {
      console.error("Error submitting physician query:", error);
      alert("Failed to submit physician query. Please try again.");
    }
  };

  // Submit quality audit
  const handleSubmitQualityAudit = async () => {
    if (!selectedRecord || !auditFindings || !auditStatus) return;

    try {
      // Use the API service to submit a quality audit
      const updatedRecord = await ICDCPTCodingAPI.submitQualityAudit(
        selectedRecord.id,
        {
          findings: auditFindings,
          actionsRequired: auditActions,
          status: auditStatus,
        },
      );

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? recordWithId : record,
        ),
      );
      setSelectedRecord(recordWithId);
      setShowQualityAuditDialog(false);
      setAuditFindings("");
      setAuditActions("");
      setAuditStatus("Pass");
      alert("Quality audit submitted successfully");
    } catch (error) {
      console.error("Error submitting quality audit:", error);
      alert("Failed to submit quality audit. Please try again.");
    }
  };

  // Submit peer review
  const handleSubmitPeerReview = async () => {
    if (!selectedRecord || !reviewerName || !reviewComments || !reviewApproval)
      return;

    try {
      // Use the API service to submit a peer review
      const updatedRecord = await ICDCPTCodingAPI.submitPeerReview(
        selectedRecord.id,
        {
          reviewer: reviewerName,
          comments: reviewComments,
          approval: reviewApproval,
        },
      );

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? recordWithId : record,
        ),
      );
      setSelectedRecord(recordWithId);
      setShowPeerReviewDialog(false);
      setReviewerName("");
      setReviewComments("");
      setReviewApproval("Approved");
      alert("Peer review submitted successfully");
    } catch (error) {
      console.error("Error submitting peer review:", error);
      alert("Failed to submit peer review. Please try again.");
    }
  };

  // Submit authorization check
  const handleSubmitAuthCheck = async () => {
    if (!selectedRecord || !discrepancies) return;

    try {
      // Use the API service to submit an authorization check
      const updatedRecord = await ICDCPTCodingAPI.submitAuthorizationCheck(
        selectedRecord.id,
        {
          discrepancies,
          resolutionRequired,
        },
      );

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? recordWithId : record,
        ),
      );
      setSelectedRecord(recordWithId);
      setShowAuthCheckDialog(false);
      setDiscrepancies("");
      setResolutionRequired(false);
      alert("Authorization check submitted successfully");
    } catch (error) {
      console.error("Error submitting authorization check:", error);
      alert("Failed to submit authorization check. Please try again.");
    }
  };

  // Delete record
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      // Use the API service to delete a record
      await ICDCPTCodingAPI.deleteRecord(recordId);

      setRecords(records.filter((record) => record.id !== recordId));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
      alert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  // Resolve discrepancy
  const handleResolveDiscrepancy = async (recordId: string) => {
    try {
      // Use the API service to resolve a discrepancy
      const updatedRecord = await ICDCPTCodingAPI.resolveDiscrepancy(recordId);

      // Add _id for compatibility with existing code
      const recordWithId = {
        ...updatedRecord,
        _id: updatedRecord.id,
      };

      setRecords(
        records.map((record) =>
          record.id === recordId ? recordWithId : record,
        ),
      );
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(recordWithId);
      }
      alert("Discrepancy resolved successfully");
    } catch (error) {
      console.error("Error resolving discrepancy:", error);
      alert("Failed to resolve discrepancy. Please try again.");
    }
  };

  // New handlers for enhanced functionality

  // Handle code verification
  const handleSubmitCodeVerification = async () => {
    if (!selectedRecord || !codeVerifier || !codeVerificationComments) return;

    try {
      // In a real implementation, this would call the API
      // For now, we'll update the state directly
      const updatedRecord = {
        ...selectedRecord,
        code_verification_completed: true,
        code_verifier: codeVerifier,
        code_verification_comments: codeVerificationComments,
        code_verification_status: codeVerificationStatus,
        code_verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? updatedRecord : record,
        ),
      );
      setSelectedRecord(updatedRecord);
      setShowCodeVerificationDialog(false);
      setCodeVerifier("");
      setCodeVerificationComments("");
      setCodeVerificationStatus("Verified");
      alert("Code verification submitted successfully");
    } catch (error) {
      console.error("Error submitting code verification:", error);
      alert("Failed to submit code verification. Please try again.");
    }
  };

  // Handle medical record review
  const handleSubmitMedicalRecordReview = async () => {
    if (!selectedRecord || !medicalRecordReviewer || !medicalRecordFindings)
      return;

    try {
      // In a real implementation, this would call the API
      // For now, we'll update the state directly
      const updatedRecord = {
        ...selectedRecord,
        medical_record_review_completed: true,
        medical_record_reviewer: medicalRecordReviewer,
        medical_record_findings: medicalRecordFindings,
        medical_record_recommendations: medicalRecordRecommendations,
        medical_record_review_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setRecords(
        records.map((record) =>
          record.id === selectedRecord.id ? updatedRecord : record,
        ),
      );
      setSelectedRecord(updatedRecord);
      setShowMedicalRecordReviewDialog(false);
      setMedicalRecordReviewer("");
      setMedicalRecordFindings("");
      setMedicalRecordRecommendations("");
      alert("Medical record review submitted successfully");
    } catch (error) {
      console.error("Error submitting medical record review:", error);
      alert("Failed to submit medical record review. Please try again.");
    }
  };

  // Handle gap analysis
  const handlePerformGapAnalysis = async () => {
    try {
      // In a real implementation, this would call the API
      // For now, we'll use mock data
      const gapAnalysis = {
        totalRecords: records.length,
        completedRecords: records.filter((r) => r.coding_status === "Completed")
          .length,
        pendingPhysicianQueries: records.filter(
          (r) => r.physician_query_sent && !r.physician_response_received,
        ).length,
        pendingQualityAudits: records.filter((r) => !r.qa_audit_completed)
          .length,
        pendingPeerReviews: records.filter((r) => !r.peer_review_completed)
          .length,
        pendingAuthorizationChecks: records.filter(
          (r) => !r.authorization_code_alignment_checked,
        ).length,
        complianceRate:
          records.length > 0
            ? (records.filter(
                (r) =>
                  r.qa_audit_completed &&
                  r.peer_review_completed &&
                  r.authorization_code_alignment_checked,
              ).length /
                records.length) *
              100
            : 0,
        commonIssues: [
          "Missing specificity in ICD-10 codes",
          "CPT code and documentation mismatch",
          "Authorization code misalignment",
        ],
        recommendations: [
          "Schedule additional coder training on ICD-10 specificity",
          "Implement pre-submission documentation review",
          "Enhance authorization verification process",
        ],
      };

      setGapAnalysisData(gapAnalysis);
      setShowGapAnalysisDialog(true);
    } catch (error) {
      console.error("Error performing gap analysis:", error);
      alert("Failed to perform gap analysis. Please try again.");
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      {/* Patient Info Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback>{patient.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
              <span>Emirates ID: {patient.emiratesId}</span>
              <span className="hidden sm:inline">•</span>
              <span>
                {patient.age} years • {patient.gender}
              </span>
              <span className="hidden sm:inline">•</span>
              <Badge variant="outline">{patient.insurance}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Episode: {episodeId}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full md:w-[800px] grid-cols-4">
          <TabsTrigger value="records">
            <FileText className="h-4 w-4 mr-2" />
            ICD & CPT Records
          </TabsTrigger>
          <TabsTrigger value="queries">
            <MessageSquare className="h-4 w-4 mr-2" />
            Physician Queries
          </TabsTrigger>
          <TabsTrigger value="audits">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Quality Audits
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Records Tab Content */}
      {activeTab === "records" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List - Takes 1/3 of space on large screens */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>ICD & CPT Records</CardTitle>
                <CardDescription>Manage coding records</CardDescription>
              </div>
              <Button onClick={() => setShowNewRecordDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" /> New Record
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Records Found</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    No ICD & CPT coding records found for this patient. Create a
                    new record to get started.
                  </p>
                  <Button
                    onClick={() => setShowNewRecordDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create New Record
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                          selectedRecord?.id === record.id
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-accent"
                        }`}
                        onClick={() =>
                          setSelectedRecord({ ...record, _id: record.id })
                        }
                      >
                        <div>
                          <div className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {new Date(record.service_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.icd_codes_assigned.length} ICD,{" "}
                            {record.cpt_codes_assigned.length} CPT codes
                          </div>
                        </div>
                        <Badge
                          variant={
                            record.coding_status === "Completed"
                              ? "default"
                              : record.coding_status === "In Progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {record.coding_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Record Details - Takes 2/3 of space on large screens */}
          <Card className="lg:col-span-2">
            {selectedRecord ? (
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Record Details</CardTitle>
                      <CardDescription>
                        Service Date:{" "}
                        {new Date(
                          selectedRecord.service_date,
                        ).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRecord(selectedRecord._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* ICD Codes Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">ICD-10 Codes</h3>
                      <div className="space-y-4">
                        {selectedRecord.icd_codes_assigned.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedRecord.icd_codes_assigned.map(
                                (code, index) => (
                                  <TableRow key={`icd-${index}`}>
                                    <TableCell className="font-medium">
                                      {code}
                                    </TableCell>
                                    <TableCell>
                                      {selectedRecord.icd_descriptions[index]}
                                    </TableCell>
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No ICD-10 codes assigned yet.
                          </div>
                        )}

                        <div className="flex items-end gap-2">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="icd-code">Add ICD-10 Code</Label>
                            <Select
                              value={newIcdCode}
                              onValueChange={(value) => {
                                setNewIcdCode(value);
                                const selectedOption = icdCodeOptions.find(
                                  (option) => option.code === value,
                                );
                                if (selectedOption) {
                                  setNewIcdDescription(
                                    selectedOption.description,
                                  );
                                }
                              }}
                            >
                              <SelectTrigger id="icd-code">
                                <SelectValue placeholder="Select ICD-10 code" />
                              </SelectTrigger>
                              <SelectContent>
                                {icdCodeOptions.map((option) => (
                                  <SelectItem
                                    key={option.code}
                                    value={option.code}
                                  >
                                    {option.code} - {option.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleAddIcdCode}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* CPT Codes Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">CPT Codes</h3>
                      <div className="space-y-4">
                        {selectedRecord.cpt_codes_assigned.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedRecord.cpt_codes_assigned.map(
                                (code, index) => (
                                  <TableRow key={`cpt-${index}`}>
                                    <TableCell className="font-medium">
                                      {code}
                                    </TableCell>
                                    <TableCell>
                                      {selectedRecord.cpt_descriptions[index]}
                                    </TableCell>
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No CPT codes assigned yet.
                          </div>
                        )}

                        <div className="flex items-end gap-2">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="cpt-code">Add CPT Code</Label>
                            <Select
                              value={newCptCode}
                              onValueChange={(value) => {
                                setNewCptCode(value);
                                const selectedOption = cptCodeOptions.find(
                                  (option) => option.code === value,
                                );
                                if (selectedOption) {
                                  setNewCptDescription(
                                    selectedOption.description,
                                  );
                                }
                              }}
                            >
                              <SelectTrigger id="cpt-code">
                                <SelectValue placeholder="Select CPT code" />
                              </SelectTrigger>
                              <SelectContent>
                                {cptCodeOptions.map((option) => (
                                  <SelectItem
                                    key={option.code}
                                    value={option.code}
                                  >
                                    {option.code} - {option.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleAddCptCode}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Status and Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Status</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Physician Query:</span>
                            <Badge
                              variant={
                                selectedRecord.physician_query_sent
                                  ? selectedRecord.physician_response_received
                                    ? "default"
                                    : "secondary"
                                  : "outline"
                              }
                            >
                              {selectedRecord.physician_query_sent
                                ? selectedRecord.physician_response_received
                                  ? "Completed"
                                  : "Pending Response"
                                : "Not Required"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Quality Audit:</span>
                            <Badge
                              variant={
                                selectedRecord.qa_audit_completed
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {selectedRecord.qa_audit_completed
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Peer Review:</span>
                            <Badge
                              variant={
                                selectedRecord.peer_review_completed
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {selectedRecord.peer_review_completed
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              Authorization Check:
                            </span>
                            <Badge
                              variant={
                                selectedRecord.authorization_code_alignment_checked
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {selectedRecord.authorization_code_alignment_checked
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Actions</h3>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() =>
                              setShowMedicalRecordReviewDialog(true)
                            }
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Medical Record Review
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setShowCodeVerificationDialog(true)}
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Verify Code Assignment
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setShowPhysicianQueryDialog(true)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Submit Physician Query
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setShowQualityAuditDialog(true)}
                          >
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Submit Quality Audit
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setShowPeerReviewDialog(true)}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Submit Peer Review
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setShowAuthCheckDialog(true)}
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Check Authorization Alignment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Last updated:{" "}
                    {new Date(selectedRecord.updated_at).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const updatedRecord = {
                          ...selectedRecord,
                          coding_status: "In Progress",
                          updated_at: new Date().toISOString(),
                        };
                        setRecords(
                          records.map((record) =>
                            record._id === selectedRecord._id
                              ? updatedRecord
                              : record,
                          ),
                        );
                        setSelectedRecord(updatedRecord);
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" /> Save Draft
                    </Button>
                    <Button
                      onClick={() => {
                        const updatedRecord = {
                          ...selectedRecord,
                          coding_status: "Completed",
                          updated_at: new Date().toISOString(),
                        };
                        setRecords(
                          records.map((record) =>
                            record._id === selectedRecord._id
                              ? updatedRecord
                              : record,
                          ),
                        );
                        setSelectedRecord(updatedRecord);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Complete Coding
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Select a Record to View Details
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select an existing record from the list or create a new one to
                  start coding.
                </p>
                <Button
                  onClick={() => setShowNewRecordDialog(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create New Record
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Queries Tab Content */}
      {activeTab === "queries" && (
        <Card>
          <CardHeader>
            <CardTitle>Physician Queries</CardTitle>
            <CardDescription>
              Track and manage physician queries for documentation clarification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Query Status</TableHead>
                    <TableHead>Response Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records
                    .filter((record) => record.physician_query_sent)
                    .map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {new Date(record.service_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record._id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Sent</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.physician_response_received
                                ? "default"
                                : "outline"
                            }
                          >
                            {record.physician_response_received
                              ? "Received"
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setActiveTab("records");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {records.filter((record) => record.physician_query_sent)
                    .length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No physician queries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audits Tab Content */}
      {activeTab === "audits" && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Audits</CardTitle>
            <CardDescription>
              Track quality audits and peer reviews for coding accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Quality Audit</TableHead>
                    <TableHead>Peer Review</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records
                    .filter(
                      (record) =>
                        record.qa_audit_completed ||
                        record.peer_review_completed,
                    )
                    .map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {new Date(record.service_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record._id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.qa_audit_completed ? "default" : "outline"
                            }
                          >
                            {record.qa_audit_completed
                              ? "Completed"
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.peer_review_completed
                                ? "default"
                                : "outline"
                            }
                          >
                            {record.peer_review_completed
                              ? "Completed"
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setActiveTab("records");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {records.filter(
                    (record) =>
                      record.qa_audit_completed || record.peer_review_completed,
                  ).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No quality audits or peer reviews found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab Content */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Records
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{records.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {records.length > 0
                    ? Math.round(
                        (records.filter((r) => r.coding_status === "Completed")
                          .length /
                          records.length) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Accuracy
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95.5%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Queries
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    records.filter(
                      (r) =>
                        r.physician_query_sent &&
                        !r.physician_response_received,
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  -2 from yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gap Analysis and Process Improvement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gap Analysis</CardTitle>
                <CardDescription>
                  Identify improvement opportunities in coding processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={98.2} className="w-20" />
                      <span className="text-sm font-medium">98.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Documentation Quality</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94.5} className="w-20" />
                      <span className="text-sm font-medium">94.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Code Accuracy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95.5} className="w-20" />
                      <span className="text-sm font-medium">95.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Query Response Time</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87.3} className="w-20" />
                      <span className="text-sm font-medium">87.3%</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handlePerformGapAnalysis}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Generate Detailed Gap Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Issues & Recommendations</CardTitle>
                <CardDescription>
                  Top issues identified and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-sm">
                      Missing ICD-10 Specificity
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      15% of codes lack required specificity level
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium text-sm">
                      CPT Documentation Mismatch
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      8% of CPT codes don't align with documentation
                    </p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium text-sm">
                      Authorization Alignment
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      5% of codes need authorization verification
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-sm text-blue-900">
                      Recommendations
                    </h4>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Schedule ICD-10 specificity training</li>
                      <li>• Implement pre-submission review process</li>
                      <li>• Enhance authorization verification workflow</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coding Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Monthly trends in coding accuracy and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Accuracy Trend</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Jan</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Feb</span>
                      <span>95.1%</span>
                    </div>
                    <Progress value={95.1} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Mar</span>
                      <span>95.5%</span>
                    </div>
                    <Progress value={95.5} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Apr</span>
                      <span>96.0%</span>
                    </div>
                    <Progress value={96.0} className="h-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Completion Time (Hours)
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Jan</span>
                      <span>3.2</span>
                    </div>
                    <Progress value={64} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Feb</span>
                      <span>2.8</span>
                    </div>
                    <Progress value={56} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Mar</span>
                      <span>2.5</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Apr</span>
                      <span>2.3</span>
                    </div>
                    <Progress value={46} className="h-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Compliance Rate</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Jan</span>
                      <span>96.5%</span>
                    </div>
                    <Progress value={96.5} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Feb</span>
                      <span>97.2%</span>
                    </div>
                    <Progress value={97.2} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Mar</span>
                      <span>98.2%</span>
                    </div>
                    <Progress value={98.2} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Apr</span>
                      <span>98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Record Dialog */}
      <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New ICD & CPT Record</DialogTitle>
            <DialogDescription>
              Create a new coding record for this patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrn">Medical Record Number</Label>
                <Input id="mrn" defaultValue="MRN12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-date">Service Date</Label>
                <Input
                  id="service-date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-number">Authorization Number</Label>
              <Input id="auth-number" defaultValue="AUTH-98765" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewRecordDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRecord}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Physician Query Dialog */}
      <Dialog
        open={showPhysicianQueryDialog}
        onOpenChange={setShowPhysicianQueryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Physician Query</DialogTitle>
            <DialogDescription>
              Request clarification from physician for documentation or coding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="query-from">Query From</Label>
              <Select value={queryFrom} onValueChange={setQueryFrom}>
                <SelectTrigger id="query-from">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insurance Coding Officer">
                    Insurance Coding Officer
                  </SelectItem>
                  <SelectItem value="Medical Records Officer">
                    Medical Records Officer
                  </SelectItem>
                  <SelectItem value="Quality Assurance Officer">
                    Quality Assurance Officer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="query-content">Query Content</Label>
              <Textarea
                id="query-content"
                placeholder="Enter your query for the physician..."
                className="h-32"
                value={queryContent}
                onChange={(e) => setQueryContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPhysicianQueryDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitPhysicianQuery}>Submit Query</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quality Audit Dialog */}
      <Dialog
        open={showQualityAuditDialog}
        onOpenChange={setShowQualityAuditDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quality Audit</DialogTitle>
            <DialogDescription>
              Document quality audit findings for this coding record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="audit-status">Audit Status</Label>
              <Select value={auditStatus} onValueChange={setAuditStatus}>
                <SelectTrigger id="audit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="Needs Improvement">
                    Needs Improvement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-findings">Audit Findings</Label>
              <Textarea
                id="audit-findings"
                placeholder="Enter audit findings..."
                className="h-24"
                value={auditFindings}
                onChange={(e) => setAuditFindings(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-actions">Actions Required</Label>
              <Textarea
                id="audit-actions"
                placeholder="Enter actions required (if any)..."
                className="h-24"
                value={auditActions}
                onChange={(e) => setAuditActions(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQualityAuditDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitQualityAudit}>Submit Audit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Peer Review Dialog */}
      <Dialog
        open={showPeerReviewDialog}
        onOpenChange={setShowPeerReviewDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Peer Review</DialogTitle>
            <DialogDescription>
              Document peer review findings for this coding record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewer-name">Reviewer Name</Label>
              <Input
                id="reviewer-name"
                placeholder="Enter reviewer name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comments">Review Comments</Label>
              <Textarea
                id="review-comments"
                placeholder="Enter review comments..."
                className="h-24"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-approval">Review Outcome</Label>
              <Select value={reviewApproval} onValueChange={setReviewApproval}>
                <SelectTrigger id="review-approval">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Needs Revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPeerReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitPeerReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authorization Check Dialog */}
      <Dialog open={showAuthCheckDialog} onOpenChange={setShowAuthCheckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Authorization Alignment</DialogTitle>
            <DialogDescription>
              Verify that assigned codes align with authorized services
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discrepancies">Discrepancies Found</Label>
              <Textarea
                id="discrepancies"
                placeholder="Describe any discrepancies between codes and authorized services..."
                className="h-24"
                value={discrepancies}
                onChange={(e) => setDiscrepancies(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="resolution-required"
                checked={resolutionRequired}
                onCheckedChange={(checked) =>
                  setResolutionRequired(checked === true)
                }
              />
              <Label htmlFor="resolution-required">
                Resolution required before claim submission
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAuthCheckDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitAuthCheck}>Submit Check</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Verification Dialog */}
      <Dialog
        open={showCodeVerificationDialog}
        onOpenChange={setShowCodeVerificationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Code Assignment Verification</DialogTitle>
            <DialogDescription>
              Verify the accuracy and appropriateness of assigned ICD and CPT
              codes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code-verifier">Verifier Name</Label>
              <Input
                id="code-verifier"
                placeholder="Enter verifier name"
                value={codeVerifier}
                onChange={(e) => setCodeVerifier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-comments">
                Verification Comments
              </Label>
              <Textarea
                id="verification-comments"
                placeholder="Enter verification findings and comments..."
                className="h-24"
                value={codeVerificationComments}
                onChange={(e) => setCodeVerificationComments(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-status">Verification Status</Label>
              <Select
                value={codeVerificationStatus}
                onValueChange={setCodeVerificationStatus}
              >
                <SelectTrigger id="verification-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Needs Revision">Needs Revision</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCodeVerificationDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCodeVerification}>
              Submit Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Record Review Dialog */}
      <Dialog
        open={showMedicalRecordReviewDialog}
        onOpenChange={setShowMedicalRecordReviewDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enhanced Medical Record Review</DialogTitle>
            <DialogDescription>
              Comprehensive review of medical records and clinical documentation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="medical-reviewer">Reviewer Name</Label>
              <Input
                id="medical-reviewer"
                placeholder="Enter reviewer name"
                value={medicalRecordReviewer}
                onChange={(e) => setMedicalRecordReviewer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-findings">Review Findings</Label>
              <Textarea
                id="medical-findings"
                placeholder="Document findings from medical record review..."
                className="h-24"
                value={medicalRecordFindings}
                onChange={(e) => setMedicalRecordFindings(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-recommendations">Recommendations</Label>
              <Textarea
                id="medical-recommendations"
                placeholder="Enter recommendations for improvement..."
                className="h-24"
                value={medicalRecordRecommendations}
                onChange={(e) =>
                  setMedicalRecordRecommendations(e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMedicalRecordReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitMedicalRecordReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gap Analysis Dialog */}
      <Dialog
        open={showGapAnalysisDialog}
        onOpenChange={setShowGapAnalysisDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gap Analysis Report</DialogTitle>
            <DialogDescription>
              Comprehensive analysis of coding processes and improvement
              opportunities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[600px] overflow-y-auto">
            {gapAnalysisData && (
              <>
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {gapAnalysisData.totalRecords}
                    </div>
                    <div className="text-sm text-blue-800">Total Records</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {gapAnalysisData.completedRecords}
                    </div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {gapAnalysisData.pendingPhysicianQueries}
                    </div>
                    <div className="text-sm text-yellow-800">
                      Pending Queries
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {gapAnalysisData.complianceRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-800">
                      Compliance Rate
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Process Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quality Audits Pending</span>
                        <Badge variant="outline">
                          {gapAnalysisData.pendingQualityAudits}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Peer Reviews Pending</span>
                        <Badge variant="outline">
                          {gapAnalysisData.pendingPeerReviews}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Authorization Checks Pending
                        </span>
                        <Badge variant="outline">
                          {gapAnalysisData.pendingAuthorizationChecks}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Common Issues</h3>
                    <div className="space-y-2">
                      {gapAnalysisData.commonIssues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {gapAnalysisData.recommendations.map(
                      (recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGapAnalysisDialog(false)}
            >
              Close
            </Button>
            <Button onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ICDCPTCodingTracker;
