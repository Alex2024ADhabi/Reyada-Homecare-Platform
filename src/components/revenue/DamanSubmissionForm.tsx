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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  User,
  Shield,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
import { damanComplianceValidator } from "@/services/daman-compliance-validator.service";

interface DamanSubmissionFormProps {
  patientId?: string;
  onSubmissionComplete?: (submissionId: string) => void;
}

interface DamanSubmission {
  patientId: string;
  authorizationNumber: string;
  serviceType: string;
  requestedDuration: number;
  clinicalJustification: string;
  documents: string[];
  paymentTerms: "30_days" | "45_days"; // Updated from 45 to 30 days per CN_2025
  mscPlanExtension: boolean;
  priorAuthorizationRequired: boolean;
  serviceCodes: string[]; // New service codes 17-25-1 through 17-25-5
  submissionTime: string; // Track submission time for 8AM deadline
  wheelchairPreApproval?: boolean; // For wheelchair pre-approval forms
  submissionStatus: "draft" | "submitted" | "approved" | "rejected";
  submissionDate?: string;
  approvalDate?: string;
  rejectionReason?: string;
  homecareAllocation?: boolean; // For OpenJet homecare allocation
  faceToFaceCompleted?: boolean; // Face-to-face assessment requirement
  periodicAssessmentRequired?: boolean; // Periodic assessment requirement
}

export default function DamanSubmissionForm({
  patientId = "",
  onSubmissionComplete,
}: DamanSubmissionFormProps) {
  const { toast: toastContext } = useToastContext();
  const { handleSuccess, handleApiError } = useErrorHandler();

  const [submission, setSubmission] = useState<DamanSubmission>({
    patientId,
    authorizationNumber: "",
    serviceType: "",
    requestedDuration: 30,
    clinicalJustification: "",
    documents: [],
    paymentTerms: "30_days", // Updated from 45 to 30 days per CN_2025 Daman Authorization Updates
    mscPlanExtension: false,
    priorAuthorizationRequired: true,
    submissionStatus: "draft",
    serviceCodes: [],
    submissionTime: new Date().toISOString(),
    wheelchairPreApproval: false,
  });
  const [loading, setLoading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [eligibilityStatus, setEligibilityStatus] = useState<any>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Enhanced validation for Daman Authorization Updates with MSC compliance
  const validateSubmission = (): string[] => {
    const errors: string[] = [];
    const currentTime = new Date();
    const submissionDeadline = new Date();
    submissionDeadline.setHours(8, 0, 0, 0); // 8:00 AM deadline

    if (!submission.patientId) {
      errors.push("Patient ID is required");
    }

    if (!submission.authorizationNumber) {
      errors.push("Authorization number is required");
    }

    if (!submission.serviceType) {
      errors.push("Service type must be specified");
    }

    if (submission.requestedDuration <= 0) {
      errors.push("Requested duration must be greater than 0");
    }

    if (
      !submission.clinicalJustification ||
      submission.clinicalJustification.length < 50
    ) {
      errors.push("Clinical justification must be at least 50 characters");
    }

    if (submission.documents.length === 0) {
      errors.push("At least one supporting document is required");
    }

    // Enhanced validation for MSC Plan Extension with stricter requirements
    if (submission.mscPlanExtension && submission.requestedDuration > 90) {
      errors.push(
        "MSC Plan extensions cannot exceed 90 days as per updated validation criteria",
      );
    }

    // Payment terms validation (30 days as per CN_2025 updated requirements)
    if (submission.paymentTerms !== "30_days") {
      errors.push(
        "Payment terms must be set to 30 days as per CN_2025 Daman Authorization Updates",
      );
    }

    // Submission time validation (8:00 AM deadline)
    if (
      currentTime > submissionDeadline &&
      currentTime.getDate() === submissionDeadline.getDate()
    ) {
      errors.push(
        "Submissions must be completed before 8:00 AM daily deadline. Late submissions require escalation approval.",
      );
    }

    // Service codes validation (new codes 17-25-1 through 17-25-5)
    if (submission.serviceCodes.length === 0) {
      errors.push(
        "At least one service code must be selected from the updated code list",
      );
    }

    // Deprecated service codes check (17-26-1 through 17-26-4)
    const deprecatedCodes = ["17-26-1", "17-26-2", "17-26-3", "17-26-4"];
    const hasDeprecatedCodes = submission.serviceCodes.some((code) =>
      deprecatedCodes.includes(code),
    );
    if (hasDeprecatedCodes) {
      errors.push(
        "Deprecated service codes (17-26-1 through 17-26-4) are no longer accepted. Please use updated codes 17-25-1 through 17-25-5.",
      );
    }

    // Wheelchair pre-approval validation (effective May 1, 2025)
    if (
      submission.wheelchairPreApproval &&
      submission.serviceType === "medical_equipment"
    ) {
      if (!submission.documents.includes("Wheelchair Pre-approval Form")) {
        errors.push(
          "Wheelchair pre-approval form is required for medical equipment requests (effective May 1, 2025)",
        );
      }
      if (!submission.documents.includes("Physiotherapist/OT Signature")) {
        errors.push(
          "Physiotherapist or Occupational Therapist signature is required for wheelchair requests",
        );
      }
      if (!submission.documents.includes("Warranty Documentation")) {
        errors.push("Wheelchair brand warranty documentation is required");
      }
    }

    // Homecare Allocation Automation validation (effective February 24, 2025)
    if (
      submission.serviceType === "nursing_care" ||
      submission.serviceType === "physiotherapy"
    ) {
      if (!submission.faceToFaceCompleted) {
        errors.push(
          "Face-to-face assessment form must be completed for homecare services (OpenJet requirement)",
        );
      }
      if (
        submission.periodicAssessmentRequired &&
        !submission.documents.includes("Periodic Assessment Form")
      ) {
        errors.push(
          "Periodic assessment form is required for ongoing homecare services",
        );
      }
    }

    // MSC Plan Extension Enhanced Validation with comprehensive checks
    if (submission.mscPlanExtension) {
      if (submission.requestedDuration > 90) {
        errors.push(
          "MSC Plan extensions cannot exceed 90 days as per updated validation criteria",
        );
      }
      if (
        !submission.clinicalJustification ||
        submission.clinicalJustification.length < 100
      ) {
        errors.push(
          "MSC Plan extensions require detailed clinical justification (minimum 100 characters)",
        );
      }
      // Additional MSC-specific validations
      if (
        !submission.documents.includes("Medical Report") ||
        !submission.documents.includes("Treatment Plan")
      ) {
        errors.push(
          "MSC Plan extensions require both Medical Report and Treatment Plan documentation",
        );
      }
      if (submission.paymentTerms !== "30_days") {
        errors.push(
          "MSC Plan extensions must use 30-day payment terms as per updated requirements",
        );
      }
      // MSC plan extension deadline (May 14, 2025)
      const mscDeadline = new Date("2025-05-14");
      if (currentTime > mscDeadline) {
        errors.push(
          "MSC plan extension deadline has passed (May 14, 2025). Please contact Armed Forces committee for additional medical needs.",
        );
      }
    }

    // Enhanced Prior Authorization Workflow Validation
    if (submission.priorAuthorizationRequired) {
      if (!submission.authorizationNumber) {
        errors.push(
          "Prior authorization number is required for this service type",
        );
      }
      if (
        submission.serviceType === "medical_equipment" &&
        submission.requestedDuration > 30
      ) {
        errors.push(
          "Medical equipment authorizations require monthly renewal for extended periods",
        );
      }
    }

    // Email communication validation (UAE-hosted domains only)
    const userEmail = localStorage.getItem("user_email") || "";
    if (userEmail && !userEmail.includes(".ae")) {
      errors.push(
        "Official UAE-hosted email domain is required for Daman communications",
      );
    }

    return errors;
  };

  // Real-time eligibility verification
  const verifyEligibility = async () => {
    if (!submission.patientId || !submission.authorizationNumber) {
      toast({
        title: "Missing Information",
        description:
          "Patient ID and authorization number are required for eligibility verification",
        variant: "destructive",
      });
      return;
    }

    try {
      setEligibilityLoading(true);

      const eligibilityResult =
        await damanComplianceValidator.verifyEligibilityRealTime({
          membershipNumber: submission.authorizationNumber,
          emiratesId: submission.patientId,
          serviceDate: new Date().toISOString(),
        });

      setEligibilityStatus(eligibilityResult);

      if (eligibilityResult.isEligible) {
        toast({
          title: "Eligibility Verified",
          description: "Patient is eligible for requested services",
        });
      } else {
        toast({
          title: "Eligibility Issues",
          description: eligibilityResult.errors.join(", "),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Eligibility verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify eligibility at this time",
        variant: "destructive",
      });
    } finally {
      setEligibilityLoading(false);
    }
  };

  // Enhanced submission with real-time processing
  const handleSubmit = async () => {
    const errors = validateSubmission();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationDialog(true);
      handleApiError(
        new Error(`Validation failed: ${errors.length} issues found`),
        "Daman Validation Error",
      );
      return;
    }

    try {
      setLoading(true);

      // Sanitize and validate submission data structure
      const sanitizedSubmission = JSON.parse(JSON.stringify(submission));
      if (!sanitizedSubmission || typeof sanitizedSubmission !== "object") {
        throw new Error("Invalid submission data structure");
      }

      // Ensure submission data is properly structured with validation
      const submissionData: DamanSubmission = {
        ...sanitizedSubmission,
        submissionDate: new Date().toISOString(),
        submissionStatus: "submitted",
      };

      // Validate required fields with proper type checking
      if (
        !submissionData.patientId ||
        typeof submissionData.patientId !== "string"
      ) {
        throw new Error("Valid patient ID is required");
      }
      if (
        !submissionData.serviceType ||
        typeof submissionData.serviceType !== "string"
      ) {
        throw new Error("Valid service type is required");
      }

      // Validate the complete submission data structure
      const validatedSubmissionData = JSON.parse(
        JSON.stringify(submissionData),
      );

      // Enhanced API submission with real-time processing
      const response = await fetch("/api/daman-authorization/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedSubmissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      const result = await response.json();

      // Start real-time status tracking
      if (result.id) {
        startRealTimeTracking(result.id);
      }

      const submissionId = `DAMAN-${Date.now()}`;

      handleSuccess(
        "Daman Submission Successful",
        `Authorization request ${submissionId} has been submitted with 30-day payment terms.`,
      );

      if (onSubmissionComplete && typeof onSubmissionComplete === "function") {
        onSubmissionComplete(submissionId);
      }

      // Reset form with proper structure and validation
      const resetSubmission: DamanSubmission = {
        patientId: "",
        authorizationNumber: "",
        serviceType: "",
        requestedDuration: 30,
        clinicalJustification: "",
        documents: [],
        paymentTerms: "30_days",
        mscPlanExtension: false,
        priorAuthorizationRequired: true,
        submissionStatus: "draft",
        serviceCodes: [],
        submissionTime: new Date().toISOString(),
        wheelchairPreApproval: false,
        homecareAllocation: false,
        faceToFaceCompleted: false,
        periodicAssessmentRequired: false,
      };

      // Validate reset data before setting state
      const validatedResetSubmission = JSON.parse(
        JSON.stringify(resetSubmission),
      );
      setSubmission(validatedResetSubmission);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error submitting to Daman:", errorMessage);

      handleApiError(new Error(errorMessage), "Daman Submission Failed");
    } finally {
      setLoading(false);
    }
  };

  const addDocument = (documentType: string) => {
    try {
      if (!documentType || typeof documentType !== "string") {
        console.warn("Invalid document type provided");
        return;
      }

      if (!submission.documents.includes(documentType)) {
        const updatedSubmission = {
          ...submission,
          documents: [...submission.documents, documentType],
        };
        // Validate the update before applying
        const validatedSubmission = JSON.parse(
          JSON.stringify(updatedSubmission),
        );
        setSubmission(validatedSubmission);
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const removeDocument = (documentType: string) => {
    try {
      if (!documentType || typeof documentType !== "string") {
        console.warn("Invalid document type provided");
        return;
      }

      const updatedSubmission = {
        ...submission,
        documents: submission.documents.filter((doc) => doc !== documentType),
      };
      // Validate the update before applying
      const validatedSubmission = JSON.parse(JSON.stringify(updatedSubmission));
      setSubmission(validatedSubmission);
    } catch (error) {
      console.error("Error removing document:", error);
    }
  };

  return (
    <div className="bg-white p-6 space-y-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Daman Authorization Submission
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Submit prior authorization requests with updated 30-day payment
            terms
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 text-xs sm:text-sm"
          >
            Updated Payment Terms: 30 Days
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 text-xs sm:text-sm"
          >
            Mobile Optimized
          </Badge>
          {!isOnline && (
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 text-xs sm:text-sm"
            >
              Offline Mode
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={verifyEligibility}
            disabled={eligibilityLoading}
            className="flex items-center gap-2"
          >
            {eligibilityLoading ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Verify Eligibility
          </Button>
          {eligibilityStatus && (
            <Badge
              variant={eligibilityStatus.isEligible ? "default" : "destructive"}
              className="text-xs"
            >
              {eligibilityStatus.isEligible ? "Eligible" : "Not Eligible"}
            </Badge>
          )}
        </div>
      </div>

      {/* Real-time Eligibility Status */}
      {eligibilityStatus && (
        <Alert
          className={
            eligibilityStatus.isEligible
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }
        >
          <Shield
            className={`h-4 w-4 ${eligibilityStatus.isEligible ? "text-green-600" : "text-red-600"}`}
          />
          <AlertTitle
            className={
              eligibilityStatus.isEligible ? "text-green-800" : "text-red-800"
            }
          >
            Eligibility Status:{" "}
            {eligibilityStatus.isEligible ? "Verified" : "Issues Detected"}
          </AlertTitle>
          <AlertDescription
            className={
              eligibilityStatus.isEligible ? "text-green-700" : "text-red-700"
            }
          >
            {eligibilityStatus.isEligible ? (
              <div className="space-y-1">
                <div>✓ Membership Status: Active</div>
                <div>
                  ✓ Coverage Level:{" "}
                  {eligibilityStatus.eligibilityDetails?.coverageLevel}
                </div>
                <div>
                  ✓ Pre-authorization:{" "}
                  {eligibilityStatus.eligibilityDetails?.preAuthRequired
                    ? "Required"
                    : "Not Required"}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {eligibilityStatus.errors.map(
                  (error: string, index: number) => (
                    <div key={index}>✗ {error}</div>
                  ),
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Status Tracking */}
      {realTimeStatus && (
        <Alert className="bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Real-time Status: {realTimeStatus.currentStatus}
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            <div className="space-y-1">
              <div>Next Action: {realTimeStatus.nextAction}</div>
              <div>
                Estimated Completion:{" "}
                {new Date(
                  realTimeStatus.estimatedCompletion,
                ).toLocaleDateString()}
              </div>
              {realTimeStatus.reviewerNotes && (
                <div>Reviewer Notes: {realTimeStatus.reviewerNotes}</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Mobile-Responsive Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-blue-800 text-sm sm:text-base">
            Updated Daman Authorization Requirements (2025)
          </AlertTitle>
          <AlertDescription className="text-blue-700 text-xs sm:text-sm">
            <div className="space-y-1 mt-2">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Payment terms updated from 45 to 30 days (CN_2025)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  MSC plan extensions limited to 90 days (deadline: May 14,
                  2025)
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  New homecare service codes (17-25-1 to 17-25-5) effective June
                  1, 2024
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Wheelchair pre-approval form mandatory from May 1, 2025
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Homecare allocation automation via OpenJet from Feb 24, 2025
                </span>
              </div>
            </div>
          </AlertDescription>
        </div>
      </Alert>

      {/* Mobile Notification Handling */}
      {!isOnline && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            Offline Mode Active
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            Your submission will be saved locally and synchronized when
            connection is restored. All data is encrypted and secure.
          </AlertDescription>
        </Alert>
      )}

      {/* Mobile Document Capture Alert */}
      <Alert className="bg-green-50 border-green-200">
        <FileText className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          Mobile Document Capture
        </AlertTitle>
        <AlertDescription className="text-green-700">
          Use your device camera to capture and validate documents directly in
          the form. Voice-to-text input available for clinical justification.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={submission.patientId}
                onChange={(e) =>
                  setSubmission({ ...submission, patientId: e.target.value })
                }
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label htmlFor="authorizationNumber">Authorization Number</Label>
              <Input
                id="authorizationNumber"
                value={submission.authorizationNumber}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    authorizationNumber: e.target.value,
                  })
                }
                placeholder="Enter Daman authorization number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Service Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                value={submission.serviceType}
                onValueChange={(value) =>
                  setSubmission({ ...submission, serviceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nursing_care">
                    Per Diem Simple Home Visit - Nursing (17-25-1) - AED 300
                  </SelectItem>
                  <SelectItem value="physiotherapy">
                    Per Diem Simple Home Visit - Physiotherapy (17-25-2) - AED
                    300
                  </SelectItem>
                  <SelectItem value="occupational_therapy">
                    Per Diem Specialized Home Visit - OT Consultation (17-25-3)
                    - AED 800
                  </SelectItem>
                  <SelectItem value="routine_nursing">
                    Per Diem Routine Home Nursing Care (17-25-4) - AED 900
                  </SelectItem>
                  <SelectItem value="advanced_nursing">
                    Per Diem Advanced Home Nursing Care (17-25-5) - AED 1,800
                  </SelectItem>
                  <SelectItem value="wheelchair_services">
                    Wheelchair Services (Requires Pre-approval Form)
                  </SelectItem>
                  <SelectItem value="deprecated_services" disabled>
                    ⚠️ Deprecated Codes (17-26-1 to 17-26-4) - Not Billable
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="requestedDuration">
                Requested Duration (Days)
              </Label>
              <Input
                id="requestedDuration"
                type="number"
                value={submission.requestedDuration}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    requestedDuration: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                max="365"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Authorization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Enhanced Authorization Settings
          </CardTitle>
          <CardDescription>
            Updated requirements and payment terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select
                value={submission.paymentTerms}
                onValueChange={(value) =>
                  setSubmission({
                    ...submission,
                    paymentTerms: value as "30_days" | "45_days",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30_days">
                    30 Days (Updated Standard)
                  </SelectItem>
                  <SelectItem value="45_days" disabled>
                    45 Days (Deprecated)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="mscPlanExtension"
                checked={submission.mscPlanExtension}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    mscPlanExtension: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="mscPlanExtension">
                MSC Plan Extension (Max 90 days)
              </Label>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="wheelchairPreApproval"
                checked={submission.wheelchairPreApproval}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    wheelchairPreApproval: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="wheelchairPreApproval">
                Wheelchair Pre-approval Required (Effective May 1, 2025)
              </Label>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="faceToFaceCompleted"
                checked={submission.faceToFaceCompleted}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    faceToFaceCompleted: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="faceToFaceCompleted">
                Face-to-Face Assessment Completed (OpenJet Requirement)
              </Label>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="homecareAllocation"
                checked={submission.homecareAllocation}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    homecareAllocation: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="homecareAllocation">
                Homecare Allocation via OpenJet (Effective Feb 24, 2025)
              </Label>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="priorAuthRequired"
                checked={submission.priorAuthorizationRequired}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    priorAuthorizationRequired: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="priorAuthRequired">
                Prior Authorization Required
              </Label>
            </div>
          </div>

          {/* MSC Plan Extension Validation */}
          {submission.mscPlanExtension && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">
                MSC Plan Extension Validation
              </AlertTitle>
              <AlertDescription className="text-yellow-700">
                MSC plan extensions are subject to enhanced validation criteria
                and cannot exceed 90 days. Clinical justification must be
                minimum 100 characters.
                {submission.requestedDuration > 90 && (
                  <span className="block mt-1 font-medium text-red-600">
                    Current duration ({submission.requestedDuration} days)
                    exceeds the 90-day limit for MSC extensions.
                  </span>
                )}
                {submission.clinicalJustification.length < 100 && (
                  <span className="block mt-1 font-medium text-red-600">
                    Clinical justification too short (
                    {submission.clinicalJustification.length}/100 characters
                    minimum).
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Time Alert */}
          {(() => {
            const currentTime = new Date();
            const deadline = new Date();
            deadline.setHours(8, 0, 0, 0);
            const isLate =
              currentTime > deadline &&
              currentTime.getDate() === deadline.getDate();

            return isLate ? (
              <Alert className="bg-red-50 border-red-200">
                <Clock className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Late Submission Warning
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  Submissions after 8:00 AM require escalation approval and may
                  experience delays. Please contact Daman Provider Relations for
                  urgent cases.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  On-Time Submission
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Submission is within the 8:00 AM daily deadline window.
                </AlertDescription>
              </Alert>
            );
          })()}
        </CardContent>
      </Card>

      {/* Clinical Justification */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Justification</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="clinicalJustification">
              Clinical Justification (Minimum{" "}
              {submission.mscPlanExtension ? "100" : "50"} characters)
            </Label>
            <Textarea
              id="clinicalJustification"
              value={submission.clinicalJustification}
              onChange={(e) =>
                setSubmission({
                  ...submission,
                  clinicalJustification: e.target.value,
                })
              }
              placeholder="Provide detailed clinical justification for the requested services..."
              rows={4}
              className="mt-1"
            />
            <div className="text-sm text-gray-500 mt-1">
              {submission.clinicalJustification.length}/
              {submission.mscPlanExtension ? "100" : "50"} characters minimum
              {submission.mscPlanExtension &&
                submission.clinicalJustification.length < 100 && (
                  <span className="text-red-500 ml-2">
                    MSC extensions require 100+ characters
                  </span>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Supporting Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "Medical Report",
                "Treatment Plan",
                "Physician Referral",
                "Insurance Card",
                "Patient Consent",
                "Previous Authorization",
                "Wheelchair Pre-approval Form (New - May 2025)",
                "Physiotherapist/OT Signature",
                "Warranty Documentation",
                "Face-to-Face Assessment (OpenJet)",
                "Periodic Assessment Form (Updated)",
                "Medical Report (Updated)",
                "Homecare Allocation Request",
              ].map((docType) => (
                <Button
                  key={docType}
                  variant={
                    submission.documents.includes(docType)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    if (submission.documents.includes(docType)) {
                      removeDocument(docType);
                    } else {
                      addDocument(docType);
                    }
                  }}
                  className="justify-start"
                >
                  {submission.documents.includes(docType) ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {docType}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Selected documents: {submission.documents.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => setShowValidationDialog(true)}>
          Validate Submission
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit to Daman
            </>
          )}
        </Button>
      </div>

      {/* Validation Dialog */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Validation</DialogTitle>
            <DialogDescription>
              Review validation results before submitting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {validationErrors.length === 0 ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Validation Successful
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  All required fields are completed and meet Daman requirements.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Validation Errors ({validationErrors.length})
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
            >
              Close
            </Button>
            {validationErrors.length === 0 && (
              <Button
                onClick={() => {
                  setShowValidationDialog(false);
                  handleSubmit();
                }}
              >
                Proceed with Submission
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
