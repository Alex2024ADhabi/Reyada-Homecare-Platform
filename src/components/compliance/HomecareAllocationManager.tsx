import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  Calendar,
  User,
  Shield,
  Home,
  Activity,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface HomecareAllocationManagerProps {
  patientId?: string;
  onAllocationComplete?: (allocationId: string) => void;
  className?: string;
}

interface HomecareAllocationData {
  // Patient Information
  patientId: string;
  patientName: string;
  emiratesId: string;
  damanInsuranceNumber: string;

  // Allocation Request Details
  requestType: "new" | "reallocation" | "extension";
  serviceType: string;
  requestedDuration: number;
  urgencyLevel: "routine" | "urgent" | "emergency";

  // Face-to-Face Assessment (Mandatory from Feb 24, 2025)
  faceToFaceCompleted: boolean;
  faceToFaceDate: string;
  assessmentLocation: string;
  assessingClinician: string;
  assessmentFindings: string;

  // Required Documentation
  periodicAssessmentForm: boolean;
  updatedMedicalReport: boolean;
  treatmentPlan: boolean;
  patientConsent: boolean;
  insuranceVerification: boolean;

  // OpenJet Integration
  openJetRequestId: string;
  submissionStatus:
    | "draft"
    | "submitted"
    | "under_review"
    | "allocated"
    | "rejected";
  allocationProvider: string;
  allocationDate: string;

  // Compliance Tracking
  submissionTime: string;
  validationErrors: string[];
  complianceScore: number;
}

const HOMECARE_SERVICE_TYPES = [
  "Per Diem Simple Home Visit - Nursing (17-25-1)",
  "Per Diem Simple Home Visit - Physiotherapy (17-25-2)",
  "Per Diem Specialized Home Visit - OT Consultation (17-25-3)",
  "Per Diem Routine Home Nursing Care (17-25-4)",
  "Per Diem Advanced Home Nursing Care (17-25-5)",
];

const REQUIRED_DOCUMENTS = [
  "Face-to-Face Assessment Form",
  "Periodic Assessment Form",
  "Updated Medical Report",
  "Treatment Plan",
  "Patient Consent Form",
  "Insurance Verification",
  "Previous Allocation History (if applicable)",
];

export default function HomecareAllocationManager({
  patientId = "",
  onAllocationComplete,
  className,
}: HomecareAllocationManagerProps) {
  const [allocationData, setAllocationData] = useState<HomecareAllocationData>({
    patientId,
    patientName: "",
    emiratesId: "",
    damanInsuranceNumber: "",
    requestType: "new",
    serviceType: "",
    requestedDuration: 30,
    urgencyLevel: "routine",
    faceToFaceCompleted: false,
    faceToFaceDate: "",
    assessmentLocation: "",
    assessingClinician: "",
    assessmentFindings: "",
    periodicAssessmentForm: false,
    updatedMedicalReport: false,
    treatmentPlan: false,
    patientConsent: false,
    insuranceVerification: false,
    openJetRequestId: "",
    submissionStatus: "draft",
    allocationProvider: "",
    allocationDate: "",
    submissionTime: new Date().toISOString(),
    validationErrors: [],
    complianceScore: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");

  // Enhanced validation for Homecare Allocation Automation (Effective Feb 24, 2025)
  const validateAllocation = (): string[] => {
    const errors: string[] = [];
    const effectiveDate = new Date("2025-02-24");
    const currentDate = new Date();

    // Check if automation is effective
    if (currentDate >= effectiveDate) {
      // Patient Information Validation
      if (!allocationData.patientId) errors.push("Patient ID is required");
      if (!allocationData.patientName) errors.push("Patient name is required");
      if (!allocationData.emiratesId) errors.push("Emirates ID is required");
      if (!allocationData.damanInsuranceNumber)
        errors.push("Daman insurance number is required");

      // Service Request Validation
      if (!allocationData.serviceType)
        errors.push("Service type must be selected");
      if (allocationData.requestedDuration <= 0)
        errors.push("Requested duration must be greater than 0");

      // Face-to-Face Assessment Validation (Mandatory from Feb 24, 2025)
      if (!allocationData.faceToFaceCompleted) {
        errors.push(
          "Face-to-face assessment must be completed before homecare allocation (effective Feb 24, 2025)",
        );
      } else {
        if (!allocationData.faceToFaceDate)
          errors.push("Face-to-face assessment date is required");
        if (!allocationData.assessmentLocation)
          errors.push("Assessment location is required");
        if (!allocationData.assessingClinician)
          errors.push("Assessing clinician information is required");
        if (
          !allocationData.assessmentFindings ||
          allocationData.assessmentFindings.length < 50
        ) {
          errors.push(
            "Assessment findings must be at least 50 characters detailed",
          );
        }
      }

      // Required Documentation Validation
      if (!allocationData.periodicAssessmentForm) {
        errors.push("Periodic assessment form is mandatory");
      }
      if (!allocationData.updatedMedicalReport) {
        errors.push("Updated medical report is required");
      }
      if (!allocationData.treatmentPlan) {
        errors.push("Treatment plan documentation is required");
      }
      if (!allocationData.patientConsent) {
        errors.push("Patient consent form is mandatory");
      }
      if (!allocationData.insuranceVerification) {
        errors.push("Insurance verification is required");
      }

      // OpenJet Integration Validation
      if (
        !allocationData.openJetRequestId &&
        allocationData.submissionStatus !== "draft"
      ) {
        errors.push("OpenJet request ID is required for submission");
      }

      // Reallocation Specific Validation
      if (allocationData.requestType === "reallocation") {
        if (!allocationData.allocationProvider) {
          errors.push(
            "Current provider information is required for reallocation",
          );
        }
      }

      // Urgency Level Validation
      if (allocationData.urgencyLevel === "emergency") {
        if (
          !allocationData.assessmentFindings.toLowerCase().includes("emergency")
        ) {
          errors.push(
            "Emergency urgency level requires emergency justification in assessment findings",
          );
        }
      }
    }

    return errors;
  };

  const handleSubmitAllocation = async () => {
    const errors = validateAllocation();
    if (errors.length > 0) {
      setAllocationData((prev) => ({ ...prev, validationErrors: errors }));
      toast({
        title: "Validation Errors",
        description: `${errors.length} issues found. Please review and fix.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate OpenJet request ID if not provided
      const openJetId = allocationData.openJetRequestId || `OJ-${Date.now()}`;

      // Simulate OpenJet API submission with proper error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(true);
          } catch (err) {
            reject(err);
          }
        }, 3000);
      });

      const allocationId = `HCA-${Date.now()}`;

      // Ensure state update is properly structured
      const updatedData = {
        ...allocationData,
        openJetRequestId: openJetId,
        submissionStatus: "submitted" as const,
        complianceScore: 95,
        validationErrors: [],
      };

      setAllocationData(updatedData);

      toast({
        title: "Homecare Allocation Submitted",
        description: `Request ${allocationId} submitted via OpenJet automation system`,
      });

      if (onAllocationComplete) {
        onAllocationComplete(allocationId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Allocation submission error:", errorMessage);

      toast({
        title: "Submission Failed",
        description:
          "Failed to submit homecare allocation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateComplianceScore = (): number => {
    let score = 0;
    const maxScore = 100;

    // Patient information (20 points)
    if (allocationData.patientId) score += 5;
    if (allocationData.patientName) score += 5;
    if (allocationData.emiratesId) score += 5;
    if (allocationData.damanInsuranceNumber) score += 5;

    // Service details (20 points)
    if (allocationData.serviceType) score += 10;
    if (allocationData.requestedDuration > 0) score += 10;

    // Face-to-face assessment (30 points)
    if (allocationData.faceToFaceCompleted) score += 10;
    if (allocationData.faceToFaceDate) score += 5;
    if (allocationData.assessingClinician) score += 5;
    if (allocationData.assessmentFindings.length >= 50) score += 10;

    // Documentation (30 points)
    if (allocationData.periodicAssessmentForm) score += 6;
    if (allocationData.updatedMedicalReport) score += 6;
    if (allocationData.treatmentPlan) score += 6;
    if (allocationData.patientConsent) score += 6;
    if (allocationData.insuranceVerification) score += 6;

    return Math.min(score, maxScore);
  };

  useEffect(() => {
    const score = calculateComplianceScore();
    setAllocationData((prev) => ({ ...prev, complianceScore: score }));
  }, [
    allocationData.patientId,
    allocationData.patientName,
    allocationData.emiratesId,
    allocationData.damanInsuranceNumber,
    allocationData.serviceType,
    allocationData.requestedDuration,
    allocationData.faceToFaceCompleted,
    allocationData.faceToFaceDate,
    allocationData.assessingClinician,
    allocationData.assessmentFindings,
    allocationData.periodicAssessmentForm,
    allocationData.updatedMedicalReport,
    allocationData.treatmentPlan,
    allocationData.patientConsent,
    allocationData.insuranceVerification,
  ]);

  return (
    <div className={`bg-white space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Home className="w-6 h-6 mr-2 text-blue-600" />
            Homecare Allocation Manager
          </h2>
          <p className="text-gray-600 mt-1">
            OpenJet automation system for homecare allocation (Effective Feb 24,
            2025)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Compliance Score: {allocationData.complianceScore}%
          </Badge>
          <Badge
            className={
              allocationData.submissionStatus === "submitted"
                ? "text-green-600 bg-green-100"
                : "text-yellow-600 bg-yellow-100"
            }
          >
            {allocationData.submissionStatus.toUpperCase().replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Automation Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Calendar className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">
          Homecare Allocation Automation (Effective Feb 24, 2025)
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          All homecare allocation requests must now be submitted through the
          OpenJet system. Face-to-face assessments are mandatory, and requests
          will be processed automatically 24/7 with direct provider allocation.
        </AlertDescription>
      </Alert>

      {/* Validation Errors */}
      {allocationData.validationErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Validation Errors ({allocationData.validationErrors.length})
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {allocationData.validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Allocation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patient">Patient Info</TabsTrigger>
          <TabsTrigger value="service">Service Request</TabsTrigger>
          <TabsTrigger value="assessment">Face-to-Face</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="submission">Submission</TabsTrigger>
        </TabsList>

        {/* Patient Information Tab */}
        <TabsContent value="patient">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
              <CardDescription>
                Complete patient demographics and insurance details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={allocationData.patientId}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        patientId: e.target.value,
                      }))
                    }
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={allocationData.patientName}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        patientName: e.target.value,
                      }))
                    }
                    placeholder="Enter patient full name"
                  />
                </div>
                <div>
                  <Label htmlFor="emiratesId">Emirates ID</Label>
                  <Input
                    id="emiratesId"
                    value={allocationData.emiratesId}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        emiratesId: e.target.value,
                      }))
                    }
                    placeholder="xxx-xxxx-xxxxxxx-x"
                  />
                </div>
                <div>
                  <Label htmlFor="damanInsuranceNumber">
                    Daman Insurance Number
                  </Label>
                  <Input
                    id="damanInsuranceNumber"
                    value={allocationData.damanInsuranceNumber}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        damanInsuranceNumber: e.target.value,
                      }))
                    }
                    placeholder="Enter Daman insurance number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Request Tab */}
        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Service Request Details
              </CardTitle>
              <CardDescription>
                Configure homecare service allocation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requestType">Request Type</Label>
                  <Select
                    value={allocationData.requestType}
                    onValueChange={(value) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        requestType: value as
                          | "new"
                          | "reallocation"
                          | "extension",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Allocation</SelectItem>
                      <SelectItem value="reallocation">Reallocation</SelectItem>
                      <SelectItem value="extension">Extension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={allocationData.serviceType}
                    onValueChange={(value) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        serviceType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOMECARE_SERVICE_TYPES.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="requestedDuration">Duration (Days)</Label>
                  <Input
                    id="requestedDuration"
                    type="number"
                    value={allocationData.requestedDuration}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        requestedDuration: parseInt(e.target.value) || 0,
                      }))
                    }
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    value={allocationData.urgencyLevel}
                    onValueChange={(value) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        urgencyLevel: value as
                          | "routine"
                          | "urgent"
                          | "emergency",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {allocationData.requestType === "reallocation" && (
                <div>
                  <Label htmlFor="allocationProvider">Current Provider</Label>
                  <Input
                    id="allocationProvider"
                    value={allocationData.allocationProvider}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        allocationProvider: e.target.value,
                      }))
                    }
                    placeholder="Enter current provider name"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Face-to-Face Assessment Tab */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Face-to-Face Assessment (Mandatory)
              </CardTitle>
              <CardDescription>
                Complete face-to-face assessment required from Feb 24, 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="faceToFaceCompleted"
                  checked={allocationData.faceToFaceCompleted}
                  onChange={(e) =>
                    setAllocationData((prev) => ({
                      ...prev,
                      faceToFaceCompleted: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="faceToFaceCompleted">
                  Face-to-Face Assessment Completed
                </Label>
              </div>

              {allocationData.faceToFaceCompleted && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faceToFaceDate">Assessment Date</Label>
                      <Input
                        id="faceToFaceDate"
                        type="date"
                        value={allocationData.faceToFaceDate}
                        onChange={(e) =>
                          setAllocationData((prev) => ({
                            ...prev,
                            faceToFaceDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="assessmentLocation">
                        Assessment Location
                      </Label>
                      <Input
                        id="assessmentLocation"
                        value={allocationData.assessmentLocation}
                        onChange={(e) =>
                          setAllocationData((prev) => ({
                            ...prev,
                            assessmentLocation: e.target.value,
                          }))
                        }
                        placeholder="Enter assessment location"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="assessingClinician">
                      Assessing Clinician
                    </Label>
                    <Input
                      id="assessingClinician"
                      value={allocationData.assessingClinician}
                      onChange={(e) =>
                        setAllocationData((prev) => ({
                          ...prev,
                          assessingClinician: e.target.value,
                        }))
                      }
                      placeholder="Enter clinician name and credentials"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assessmentFindings">
                      Assessment Findings (Minimum 50 characters)
                    </Label>
                    <Textarea
                      id="assessmentFindings"
                      value={allocationData.assessmentFindings}
                      onChange={(e) =>
                        setAllocationData((prev) => ({
                          ...prev,
                          assessmentFindings: e.target.value,
                        }))
                      }
                      placeholder="Document detailed assessment findings, patient condition, and homecare needs..."
                      rows={4}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {allocationData.assessmentFindings.length}/50 characters
                      minimum
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Required Documentation
              </CardTitle>
              <CardDescription>
                Complete all required documents for homecare allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="periodicAssessmentForm"
                    checked={allocationData.periodicAssessmentForm}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        periodicAssessmentForm: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="periodicAssessmentForm">
                    Periodic Assessment Form (Updated)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="updatedMedicalReport"
                    checked={allocationData.updatedMedicalReport}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        updatedMedicalReport: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="updatedMedicalReport">
                    Updated Medical Report
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="treatmentPlan"
                    checked={allocationData.treatmentPlan}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        treatmentPlan: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="treatmentPlan">
                    Treatment Plan Documentation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="patientConsent"
                    checked={allocationData.patientConsent}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        patientConsent: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="patientConsent">Patient Consent Form</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="insuranceVerification"
                    checked={allocationData.insuranceVerification}
                    onChange={(e) =>
                      setAllocationData((prev) => ({
                        ...prev,
                        insuranceVerification: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="insuranceVerification">
                    Insurance Verification
                  </Label>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    Documentation Completion:
                  </span>
                  <Badge variant="outline">
                    {
                      [
                        allocationData.periodicAssessmentForm,
                        allocationData.updatedMedicalReport,
                        allocationData.treatmentPlan,
                        allocationData.patientConsent,
                        allocationData.insuranceVerification,
                      ].filter(Boolean).length
                    }{" "}
                    / 5
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submission Tab */}
        <TabsContent value="submission">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                OpenJet Submission
              </CardTitle>
              <CardDescription>
                Submit homecare allocation request via OpenJet automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compliance Score */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Compliance Score: {allocationData.complianceScore}%
                </h4>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${allocationData.complianceScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  {allocationData.complianceScore >= 90
                    ? "Ready for submission"
                    : "Complete missing requirements to improve score"}
                </p>
              </div>

              {/* OpenJet Integration */}
              <div>
                <Label htmlFor="openJetRequestId">OpenJet Request ID</Label>
                <Input
                  id="openJetRequestId"
                  value={allocationData.openJetRequestId}
                  onChange={(e) =>
                    setAllocationData((prev) => ({
                      ...prev,
                      openJetRequestId: e.target.value,
                    }))
                  }
                  placeholder="Auto-generated on submission"
                  disabled={allocationData.submissionStatus !== "draft"}
                />
              </div>

              {/* Submission Status */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  Submission Status
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      className={
                        allocationData.submissionStatus === "submitted"
                          ? "text-green-600 bg-green-100"
                          : "text-yellow-600 bg-yellow-100"
                      }
                    >
                      {allocationData.submissionStatus
                        .toUpperCase()
                        .replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Submission Time:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(allocationData.submissionTime).toLocaleString()}
                    </span>
                  </div>
                  {allocationData.allocationProvider && (
                    <div className="flex justify-between">
                      <span>Allocated Provider:</span>
                      <span className="text-sm text-gray-600">
                        {allocationData.allocationProvider}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const errors = validateAllocation();
                    setAllocationData((prev) => ({
                      ...prev,
                      validationErrors: errors,
                    }));
                    if (errors.length === 0) {
                      toast({
                        title: "Validation Successful",
                        description:
                          "All requirements met. Ready for submission.",
                      });
                    }
                  }}
                >
                  Validate Request
                </Button>
                <Button
                  onClick={handleSubmitAllocation}
                  disabled={isSubmitting || allocationData.complianceScore < 90}
                  className="flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit to OpenJet
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
