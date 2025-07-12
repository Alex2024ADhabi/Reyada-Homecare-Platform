import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Bell, Download } from "lucide-react";
import {
  FileText,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  MapPin,
  FileUp,
  Clipboard,
  ClipboardCheck,
  Calendar,
  User,
  CreditCard,
  Stethoscope,
  Pill,
  Activity,
  FileSpreadsheet,
  Map,
  FileImage,
  FilePlus,
  FileCheck,
  FileClock,
  FileBarChart,
  FileMinus, // Replacing FileMedical with FileMinus as a suitable alternative
  FileSymlink,
  FileBox,
  Send,
  Clock,
  CheckSquare,
  BarChart,
  FileSearch,
  FileQuestion,
  FileX,
  FileCheck2,
  History,
} from "lucide-react";
import { ApiService } from "@/services/api.service";
import { SERVICE_ENDPOINTS } from "@/config/api.config";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useDamanAuthorization } from "@/hooks/useDamanAuthorization";

// Digital signatures state
interface DigitalSignature {
  patientSignature?: string;
  patientSignatureDate?: string;
  providerSignature?: string;
  providerSignatureDate?: string;
}

// Patient details for enhanced submission
interface PatientDetails {
  name: string;
  emiratesId: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  insuranceDetails: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
}

interface DamanSubmissionFormProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
  onComplete?: (success: boolean) => void;
}

interface DocumentStatus {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  icon: React.ReactNode;
  description: string;
  file?: File;
  uploadDate?: string;
  uploadedBy?: string;
  fileSize?: number;
  fileType?: string;
}

interface SubmissionStatus {
  id: string;
  referenceNumber: string;
  submissionDate: string;
  status: "pending" | "approved" | "rejected" | "additional-info" | "in-review";
  comments?: string;
  reviewer?: string;
  reviewDate?: string;
}

const DamanSubmissionForm = ({
  patientId = "P12345",
  episodeId = "EP789",
  isOffline: propIsOffline,
  onComplete,
}: DamanSubmissionFormProps) => {
  const { isOnline, isSyncing, pendingItems, syncPendingData } =
    useOfflineSync();
  const {
    isLoading: isAuthLoading,
    error: authError,
    submitAuthorization,
    trackAuthorization,
    getAuthorizationDetails,
    uploadAdditionalDocuments,
    registerForNotifications,
  } = useDamanAuthorization();

  // Use the offline status from the hook, but allow it to be overridden by props
  const isOffline = propIsOffline !== undefined ? propIsOffline : !isOnline;
  const form = useForm({
    defaultValues: {
      clinicalJustification: "",
      requestedServices: [],
      requestedDuration: 30,
      urgencyLevel: "standard",
      additionalNotes: "",
    },
  });
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("documents");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for digital signatures
  const [digitalSignatures, setDigitalSignatures] = useState<DigitalSignature>({
    patientSignature: "",
    patientSignatureDate: "",
    providerSignature: "",
    providerSignatureDate: "",
  });

  // Mock patient details
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: "Mohammed Al Mansoori",
    emiratesId: "784-1985-1234567-8",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    nationality: "UAE",
    insuranceDetails: {
      provider: "Daman - Thiqa",
      policyNumber: "THQ-12345678",
      expiryDate: "2024-12-31",
    },
  });

  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("document-assembly");

  // Mock submission history
  const [submissionHistory, setSubmissionHistory] = useState<
    SubmissionStatus[]
  >([
    {
      id: "sub-001",
      referenceNumber: "DAMAN-PA-2023-12345",
      submissionDate: "2023-11-15",
      status: "approved",
      comments: "Approved for 30 days of home healthcare services",
      reviewer: "Dr. Ahmed Al Mansouri",
      reviewDate: "2023-11-20",
    },
    {
      id: "sub-002",
      referenceNumber: "DAMAN-PA-2023-12789",
      submissionDate: "2023-12-10",
      status: "rejected",
      comments: "Insufficient clinical justification for continued services",
      reviewer: "Dr. Fatima Al Zaabi",
      reviewDate: "2023-12-15",
    },
    {
      id: "sub-003",
      referenceNumber: "DAMAN-PA-2024-00123",
      submissionDate: "2024-01-05",
      status: "additional-info",
      comments:
        "Please provide updated clinical assessment and recent lab results",
      reviewer: "Dr. Mohammed Al Hashimi",
      reviewDate: "2024-01-08",
    },
    {
      id: "sub-004",
      referenceNumber: "DAMAN-PA-2024-00456",
      submissionDate: "2024-02-20",
      status: "in-review",
      comments: "Under clinical review",
      reviewer: "Pending",
      reviewDate: "N/A",
    },
  ]);

  // Required documents for Daman Prior Authorization
  const requiredDocuments: DocumentStatus[] = [
    {
      id: "auth-request-form",
      name: "Daman Authorization Request Form",
      required: true,
      uploaded: false,
      icon: <FileText className="h-4 w-4" />,
      description: "Official Daman form for requesting prior authorization",
    },
    {
      id: "medical-report",
      name: "Medical Report/Discharge Summary",
      required: true,
      uploaded: false,
      icon: <FileMinus className="h-4 w-4" />,
      description: "Comprehensive medical report or hospital discharge summary",
    },
    {
      id: "face-to-face",
      name: "Face-to-Face Assessment Form",
      required: true,
      uploaded: false,
      icon: <User className="h-4 w-4" />,
      description: "Documentation of in-person clinical assessment",
    },
    {
      id: "daman-consent",
      name: "Daman Consent Form",
      required: true,
      uploaded: false,
      icon: <ClipboardCheck className="h-4 w-4" />,
      description: "Patient consent for treatment and information sharing",
    },
    {
      id: "doh-assessment",
      name: "DOH Healthcare Assessment Form (Scoring)",
      required: true,
      uploaded: false,
      icon: <FileSpreadsheet className="h-4 w-4" />,
      description: "DOH-mandated assessment with domain scoring",
    },
    {
      id: "medication-list",
      name: "Medication List",
      required: true,
      uploaded: false,
      icon: <Pill className="h-4 w-4" />,
      description: "Current and comprehensive list of all medications",
    },
    {
      id: "physician-report",
      name: "Physician Internal Medical Report",
      required: true,
      uploaded: false,
      icon: <Stethoscope className="h-4 w-4" />,
      description: "Detailed medical report from attending physician",
    },
    {
      id: "vital-signs",
      name: "Vital Signs Monitoring Sheet",
      required: true,
      uploaded: false,
      icon: <Activity className="h-4 w-4" />,
      description: "Record of patient's vital signs measurements",
    },
    {
      id: "mar",
      name: "Medication Administration Record (MAR)",
      required: true,
      uploaded: false,
      icon: <Clipboard className="h-4 w-4" />,
      description: "Documentation of medication administration history",
    },
    {
      id: "pt-ot-form",
      name: "Daman PT & OT Assessment Form",
      required: false,
      uploaded: false,
      icon: <FileBarChart className="h-4 w-4" />,
      description:
        "Physical and occupational therapy assessment (if applicable)",
    },
    {
      id: "thiqa-card",
      name: "Patient Thiqa Card copy",
      required: true,
      uploaded: false,
      icon: <CreditCard className="h-4 w-4" />,
      description: "Copy of patient's Thiqa insurance card",
    },
    {
      id: "emirates-id",
      name: "Patient Emirates ID copy",
      required: true,
      uploaded: false,
      icon: <CreditCard className="h-4 w-4" />,
      description: "Copy of patient's Emirates ID",
    },
    {
      id: "nurse-license",
      name: "Nurse License verification",
      required: true,
      uploaded: false,
      icon: <FileCheck className="h-4 w-4" />,
      description: "Verification of nurse's professional license",
    },
    {
      id: "physician-license",
      name: "Physician License verification",
      required: true,
      uploaded: false,
      icon: <FileCheck className="h-4 w-4" />,
      description: "Verification of physician's professional license",
    },
    {
      id: "therapist-license",
      name: "Therapist License verification",
      required: false,
      uploaded: false,
      icon: <FileCheck className="h-4 w-4" />,
      description:
        "Verification of therapist's professional license (if applicable)",
    },
    {
      id: "location-map",
      name: "Location Map with GPS coordinates",
      required: true,
      uploaded: false,
      icon: <MapPin className="h-4 w-4" />,
      description: "Map showing patient's home location with GPS coordinates",
    },
    {
      id: "justification-letter",
      name: "Justification Letter",
      required: false,
      uploaded: false,
      icon: <FileText className="h-4 w-4" />,
      description: "Letter explaining medical necessity (if required)",
    },
    {
      id: "previous-auth",
      name: "Previous Authorization Letter",
      required: false,
      uploaded: false,
      icon: <FileClock className="h-4 w-4" />,
      description: "Copy of previous authorization (for renewals only)",
    },
    {
      id: "progress-notes",
      name: "Clinical Progress Notes",
      required: true,
      uploaded: false,
      icon: <FileSymlink className="h-4 w-4" />,
      description: "Recent clinical progress notes from healthcare providers",
    },
    {
      id: "lab-results",
      name: "Laboratory Results",
      required: true,
      uploaded: false,
      icon: <FileBarChart className="h-4 w-4" />,
      description: "Recent laboratory test results",
    },
    {
      id: "imaging-reports",
      name: "Imaging Reports",
      required: false,
      uploaded: false,
      icon: <FileImage className="h-4 w-4" />,
      description: "Radiology and imaging reports (if applicable)",
    },
    {
      id: "specialist-notes",
      name: "Specialist Consultation Notes",
      required: false,
      uploaded: false,
      icon: <FilePlus className="h-4 w-4" />,
      description: "Notes from specialist consultations (if applicable)",
    },
    {
      id: "equipment-list",
      name: "Equipment/Supply Requirements List",
      required: true,
      uploaded: false,
      icon: <FileBox className="h-4 w-4" />,
      description: "List of required medical equipment and supplies",
    },
  ];

  const [documents, setDocuments] =
    useState<DocumentStatus[]>(requiredDocuments);

  // Calculate submission progress
  const calculateProgress = () => {
    const requiredDocs = documents.filter((doc) => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter((doc) => doc.uploaded);
    const progress = Math.round(
      (uploadedRequiredDocs.length / requiredDocs.length) * 100,
    );
    setSubmissionProgress(progress);
    return progress;
  };

  // Enhanced error handling for API calls
  const handleApiError = (error: any, operation: string): string => {
    console.error(`Error during ${operation}:`, error);

    // Check for network connectivity issues
    if (!navigator.onLine) {
      return "You are currently offline. Please try again when you have an internet connection.";
    }

    // Check for API rate limiting
    if (error.response?.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    // Check for server errors
    if (error.response?.status >= 500) {
      return "The server is currently experiencing issues. Please try again later.";
    }

    // Check for authorization errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "You are not authorized to perform this action. Please log in again.";
    }

    // Default error message
    return error.message || "An unexpected error occurred. Please try again.";
  };

  // Handle document upload
  const handleDocumentUpload = (documentId: string) => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

    // Handle file selection
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size exceeds 5MB limit. Please select a smaller file.");
          return;
        }

        // Update document status
        const updatedDocuments = documents.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              uploaded: true,
              file: file,
              uploadDate: new Date().toISOString(),
              uploadedBy: "Current User", // In a real app, get from auth context
              fileSize: file.size,
              fileType: file.type,
            };
          }
          return doc;
        });

        setDocuments(updatedDocuments);
        calculateProgress();

        // In a real implementation, upload to server
        if (!isOffline) {
          // Simulate uploading to server
          const formData = new FormData();
          formData.append("file", file);
          formData.append("documentId", documentId);
          formData.append("patientId", patientId);
          formData.append("episodeId", episodeId);

          // Example of how the actual API call would look:
          // try {
          //   await ApiService.post(
          //     `${SERVICE_ENDPOINTS.clinical}/documents/upload`,
          //     formData,
          //     { headers: { 'Content-Type': 'multipart/form-data' } }
          //   );
          // } catch (error) {
          //   console.error('Error uploading document:', error);
          //   alert('Error uploading document. Please try again.');
          // }
        }
      }
    };

    // Trigger file selection dialog
    fileInput.click();
  };

  // Handle form submission - Enhanced for Process 2: Authorization Submission and Tracking
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Check if all required documents are uploaded
      const missingDocs = documents.filter(
        (doc) => doc.required && !doc.uploaded,
      );

      if (missingDocs.length > 0) {
        alert(
          `Please upload all required documents. Missing: ${missingDocs.map((d) => d.name).join(", ")}`,
        );
        setIsSubmitting(false);
        return;
      }

      // Verify DOH compliance for all uploaded documents
      const nonCompliantDocs = documents
        .filter((doc) => doc.uploaded)
        .filter((doc) => !verifyDOHCompliance(doc.id, doc.file));

      if (nonCompliantDocs.length > 0) {
        alert(
          `The following documents do not meet DOH compliance standards: ${nonCompliantDocs.map((d) => d.name).join(", ")}. Please review and reupload.`,
        );
        setIsSubmitting(false);
        return;
      }

      // Check for digital signatures
      if (
        !digitalSignatures.patientSignature ||
        !digitalSignatures.providerSignature
      ) {
        alert(
          "Both patient and provider digital signatures are required for submission.",
        );
        setIsSubmitting(false);
        return;
      }

      // Validate clinical justification
      const clinicalJustification =
        form.getValues("clinicalJustification") || "";
      if (clinicalJustification.length < 50) {
        alert(
          "Clinical justification must be detailed and at least 50 characters long.",
        );
        setIsSubmitting(false);
        return;
      }

      // Validate requested services
      const requestedServices = form.getValues("requestedServices") || [];
      if (requestedServices.length === 0) {
        alert("Please select at least one requested service.");
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data with enhanced metadata
      const submissionData = {
        patientId,
        episodeId,
        documents: documents.filter((d) => d.uploaded).map((d) => d.id),
        submissionDate: new Date().toISOString(),
        clinicalJustification: clinicalJustification,
        requestedServices: requestedServices,
        requestedDuration: form.getValues("requestedDuration") || 30,
        urgencyLevel: form.getValues("urgencyLevel") || "standard",
        additionalNotes: form.getValues("additionalNotes") || "",
        digitalSignatures: digitalSignatures,
        submittedBy: localStorage.getItem("user_id") || "unknown",
        facilityDetails: {
          name: "Reyada Homecare",
          licenseNumber: "DOH-HC-2023-001",
          address: "Abu Dhabi, UAE",
        },
        patientDetails: patientDetails,
        documentMetadata: documents
          .filter((d) => d.uploaded)
          .map((d) => ({
            id: d.id,
            name: d.name,
            uploadDate: d.uploadDate,
            uploadedBy: d.uploadedBy,
            fileType: d.fileType,
            verificationStatus: "verified",
          })),
        // Enhanced metadata for improved tracking and compliance
        submissionMetadata: {
          submissionVersion: "2.0",
          platform: "Reyada Homecare Platform",
          deviceId: localStorage.getItem("device_id") || "unknown",
          gpsCoordinates:
            localStorage.getItem("last_known_location") || "unknown",
          submissionTimestamp: new Date().toISOString(),
          dohComplianceVersion: "DOH-2023-R4",
          damanPortalVersion: "Daman-API-v3",
        },
      };

      try {
        // Use the useDamanAuthorization hook to submit the authorization
        const response = await submitAuthorization(submissionData);

        // Register for webhook notifications
        const notificationPreferences = {
          events: [
            "status-change",
            "review-update",
            "additional-info-request",
            "approval",
            "rejection",
            "expiry-warning",
          ],
          channels: ["email", "sms", "app"],
          priority: "high",
        };

        await registerForNotifications(
          response.id,
          response.referenceNumber,
          notificationPreferences,
        );

        // Add to submission history
        const newSubmission: SubmissionStatus = {
          id: response.id,
          referenceNumber: response.referenceNumber,
          submissionDate: new Date().toLocaleDateString(),
          status: response.offlineQueued ? "pending" : "in-review",
          comments:
            response.message ||
            (response.offlineQueued
              ? "Pending online synchronization"
              : "Submission received and under initial review"),
          reviewer: response.reviewer || "Pending Assignment",
        };

        setSubmissionHistory((prev) => [newSubmission, ...prev]);
        setSubmissionSuccess(true);
        if (onComplete) onComplete(true);

        // Show success message with more details
        if (response.offlineQueued) {
          alert(
            "Submission saved for later sync when online connection is restored.\n\n" +
              "Reference Number: " +
              response.referenceNumber +
              "\n" +
              "Please note this reference number for tracking purposes.",
          );
        } else {
          alert(
            "Submission successfully sent to Daman portal.\n\n" +
              "Reference Number: " +
              response.referenceNumber +
              "\n" +
              "Status: In Review\n" +
              "Estimated Review Completion: " +
              new Date(
                response.estimatedReviewCompletion,
              ).toLocaleDateString() +
              "\n\n" +
              "You will receive notifications when the status changes.",
          );
        }
      } catch (apiError: any) {
        console.error("Error submitting Daman authorization:", apiError);

        // Use the enhanced error handling function
        const errorMessage = handleApiError(
          apiError,
          "submitting authorization",
        );
        alert(`Error submitting authorization: ${errorMessage}`);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Error submitting Daman authorization:", error);
      alert(
        `Error: ${error.message || "An unexpected error occurred. Please try again."}`,
      );
      if (onComplete) onComplete(false);
      setIsSubmitting(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    // Reset document status
    setDocuments(requiredDocuments);
    setSubmissionProgress(0);
    setSubmissionSuccess(false);

    // Reset form values
    form.reset({
      clinicalJustification: "",
      requestedServices: [],
      requestedDuration: 30,
      urgencyLevel: "standard",
      additionalNotes: "",
    });

    // Release any object URLs to prevent memory leaks
    documents.forEach((doc) => {
      if (doc.file && doc.uploaded) {
        URL.revokeObjectURL(URL.createObjectURL(doc.file));
      }
    });
  };

  // Function to get status badge variant based on submission status
  const getStatusBadgeVariant = (status: SubmissionStatus["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "additional-info":
        return "warning";
      case "in-review":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  // Function to get status icon based on submission status
  const getStatusIcon = (status: SubmissionStatus["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <FileX className="h-4 w-4 text-red-500" />;
      case "additional-info":
        return <FileQuestion className="h-4 w-4 text-amber-500" />;
      case "in-review":
        return <FileSearch className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Register for webhook notifications for real-time status updates - Enhanced for Process 2: Authorization Submission and Tracking
  const registerForStatusNotifications = async (
    submissionId: string,
    referenceNumber: string,
  ) => {
    try {
      if (!isOffline) {
        // In a real implementation, this would register webhooks with Daman API
        console.log(
          `Registering for webhook notifications for submission ${submissionId}`,
        );

        // Set up notification preferences
        const notificationChannels = [
          "email", // Email notifications
          "sms", // SMS notifications
          "app", // In-app notifications
        ];

        const notificationEvents = [
          "status-change", // Any change in submission status
          "review-update", // Updates from reviewer
          "additional-info-request", // Requests for additional information
          "approval", // Approval notifications
          "rejection", // Rejection notifications
          "expiry-warning", // Notifications about approaching expiry
        ];

        // Example of how the API call would look
        // await ApiService.post(
        //   `${SERVICE_ENDPOINTS.daman}/webhooks/register`,
        //   {
        //     submissionId,
        //     referenceNumber,
        //     callbackUrl: process.env.WEBHOOK_CALLBACK_URL || "https://api.reyada-homecare.ae/webhooks/daman",
        //     events: notificationEvents,
        //     channels: notificationChannels,
        //     recipientEmail: localStorage.getItem('user_email') || '',
        //     recipientPhone: localStorage.getItem('user_phone') || '',
        //     priority: 'high'
        //   }
        // );

        // Register for real-time updates via WebSocket if available
        // if (WebSocketService.isAvailable()) {
        //   WebSocketService.subscribe(`submission-updates/${submissionId}`, (data) => {
        //     // Update submission status in real-time
        //     const updatedSubmission = data.submission;
        //     setSubmissionHistory(prev => {
        //       const updated = [...prev];
        //       const index = updated.findIndex(s => s.id === updatedSubmission.id);
        //       if (index >= 0) {
        //         updated[index] = updatedSubmission;
        //       } else {
        //         updated.unshift(updatedSubmission);
        //       }
        //       return updated;
        //     });
        //   });
        // }
      }
    } catch (error) {
      console.error("Error registering for webhook notifications:", error);
      // Non-critical error, don't throw
    }
  };

  // Function to track submission status - Enhanced for Process 2: Authorization Submission and Tracking
  const trackSubmission = async (referenceNumber: string) => {
    try {
      setIsSubmitting(true);

      // Check if this is an offline submission
      if (referenceNumber.startsWith("OFFLINE-")) {
        // Find the submission in local history
        const submission = submissionHistory.find(
          (s) => s.referenceNumber === referenceNumber,
        );

        if (submission) {
          // Update UI to show tracking information
          setActiveTab("submission-tracking");
          setIsSubmitting(false);
        } else {
          alert(
            `Submission with reference number ${referenceNumber} not found.`,
          );
          setIsSubmitting(false);
        }
        return;
      }

      // For online submissions, get real-time status from API
      try {
        // Use the useDamanAuthorization hook to track the authorization
        const statusResponse = await trackAuthorization(referenceNumber);

        // Find the submission in history
        const existingSubmissionIndex = submissionHistory.findIndex(
          (s) => s.referenceNumber === referenceNumber,
        );

        if (existingSubmissionIndex >= 0) {
          // Update the submission with latest status
          const updatedHistory = [...submissionHistory];
          updatedHistory[existingSubmissionIndex] = {
            ...updatedHistory[existingSubmissionIndex],
            status: statusResponse.status,
            comments:
              statusResponse.comments ||
              updatedHistory[existingSubmissionIndex].comments,
            reviewer:
              statusResponse.reviewer ||
              updatedHistory[existingSubmissionIndex].reviewer,
            reviewDate:
              statusResponse.reviewDate ||
              updatedHistory[existingSubmissionIndex].reviewDate,
          };

          setSubmissionHistory(updatedHistory);
          setActiveTab("submission-tracking");

          // Display detailed tracking information
          if (statusResponse.trackingDetails) {
            const trackingInfo = statusResponse.trackingDetails;
            console.log("Detailed tracking information:", trackingInfo);

            // In a real implementation, this would update a tracking details panel in the UI
            // For now, we'll just show an alert with key tracking information
            setTimeout(() => {
              alert(
                `Tracking Information for ${referenceNumber}:\n\n` +
                  `Processing Stage: ${trackingInfo.processingStage}\n` +
                  `Assigned Reviewer: ${trackingInfo.assignedReviewer}\n` +
                  `Priority Level: ${trackingInfo.priorityLevel}\n` +
                  `Estimated Decision Date: ${new Date(trackingInfo.estimatedDecisionDate).toLocaleDateString()}\n` +
                  `Document Verification: ${trackingInfo.documentVerificationStatus}\n` +
                  `Clinical Review: ${trackingInfo.clinicalReviewStatus}\n` +
                  `Financial Review: ${trackingInfo.financialReviewStatus}\n\n` +
                  `For real-time updates, you can visit: ${trackingInfo.trackingUrl}`,
              );
            }, 500);
          }

          // If additional documents are required, notify the user
          if (
            statusResponse.status === "additional-info" &&
            statusResponse.requiredAdditionalDocuments?.length > 0
          ) {
            setTimeout(() => {
              const docList = statusResponse.requiredAdditionalDocuments
                .map((doc) => `- ${doc.name}: ${doc.description}`)
                .join("\n");

              alert(
                `Additional documents required for ${referenceNumber}:\n\n` +
                  `${docList}\n\n` +
                  `Please submit these documents by ${new Date(statusResponse.requiredAdditionalDocuments[0].deadline).toLocaleDateString()} ` +
                  `to avoid delays in processing.`,
              );
            }, 1000);
          }
        } else {
          // If not found in history, add it
          const newSubmission: SubmissionStatus = {
            id: statusResponse.id,
            referenceNumber,
            submissionDate:
              statusResponse.submissionDate || new Date().toLocaleDateString(),
            status: statusResponse.status,
            comments:
              statusResponse.comments || "Status retrieved from Daman portal",
            reviewer: statusResponse.reviewer || "Not assigned",
            reviewDate: statusResponse.reviewDate,
          };

          setSubmissionHistory((prev) => [newSubmission, ...prev]);
          setActiveTab("submission-tracking");
        }
      } catch (apiError: any) {
        // Handle API-specific errors
        const errorMessage = handleApiError(apiError, "tracking submission");
        alert(`Error tracking submission: ${errorMessage}`);
      }

      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error tracking submission:", error);
      alert(
        `Error tracking submission ${referenceNumber}: ${error.message || "Please try again."}`,
      );
      setIsSubmitting(false);
    }
  };

  // Function to handle submission review process - Enhanced for Process 3: Authorization Status Management
  const handleReviewProcess = async (submissionId: string) => {
    try {
      setIsSubmitting(true);

      // Check if this is an offline submission
      if (submissionId.startsWith("offline-")) {
        // Find the submission in history
        const submission = submissionHistory.find((s) => s.id === submissionId);

        if (submission) {
          // Switch to tracking tab and show details for this submission
          setActiveTab("submission-tracking");

          alert(
            `Offline submission ${submissionId} (${submission.referenceNumber}):\n\n` +
              `Status: ${submission.status}\n` +
              `Comments: ${submission.comments || "No comments"}\n\n` +
              `This submission will be processed when your device reconnects to the internet.`,
          );

          setIsSubmitting(false);
        } else {
          alert(`Submission with ID ${submissionId} not found.`);
          setIsSubmitting(false);
        }
        return;
      }

      // For online submissions, get detailed information from API
      try {
        // Use the useDamanAuthorization hook to get authorization details
        const detailsResponse = await getAuthorizationDetails(submissionId);

        // Find the submission in history
        const existingSubmissionIndex = submissionHistory.findIndex(
          (s) => s.id === submissionId,
        );

        if (existingSubmissionIndex >= 0) {
          // Update the submission with latest details
          const updatedHistory = [...submissionHistory];
          updatedHistory[existingSubmissionIndex] = {
            ...updatedHistory[existingSubmissionIndex],
            status: detailsResponse.status,
            comments:
              detailsResponse.comments ||
              updatedHistory[existingSubmissionIndex].comments,
            reviewer:
              detailsResponse.reviewer ||
              updatedHistory[existingSubmissionIndex].reviewer,
            reviewDate:
              detailsResponse.reviewDate ||
              updatedHistory[existingSubmissionIndex].reviewDate,
          };

          setSubmissionHistory(updatedHistory);
          setActiveTab("submission-tracking");

          // Display detailed review information
          const reviewTimeline = detailsResponse.reviewTimeline || [];
          const timelineText =
            reviewTimeline.length > 0
              ? reviewTimeline
                  .map(
                    (item: any) =>
                      `${new Date(item.timestamp).toLocaleString()}: ${item.action} - ${item.comment || "No comment"}`,
                  )
                  .join("\n")
              : "No detailed timeline available";

          // Enhanced alert with more detailed information based on status
          if (
            detailsResponse.status === "approved" &&
            detailsResponse.approvalDetails
          ) {
            const approval = detailsResponse.approvalDetails;
            alert(
              `APPROVAL NOTIFICATION for ${detailsResponse.referenceNumber}\n\n` +
                `Authorization Code: ${approval.approvalCode}\n` +
                `Approval Date: ${new Date(approval.approvalDate).toLocaleDateString()}\n` +
                `Effective Date: ${new Date(approval.effectiveDate).toLocaleDateString()}\n` +
                `Expiration Date: ${new Date(approval.expirationDate).toLocaleDateString()}\n\n` +
                `Approved Services:\n` +
                Object.entries(approval.approvedFrequency)
                  .map(([service, freq]) => `- ${service}: ${freq}`)
                  .join("\n") +
                `\n\n` +
                `Special Notes: ${approval.specialNotes}\n\n` +
                `Billing Instructions: ${approval.billingInstructions}\n` +
                `Documentation Requirements: ${approval.documentationRequirements}\n\n` +
                `IMPORTANT: Services can begin on ${new Date(approval.effectiveDate).toLocaleDateString()}`,
            );
          } else if (
            detailsResponse.status === "rejected" &&
            detailsResponse.rejectionDetails
          ) {
            const rejection = detailsResponse.rejectionDetails;
            alert(
              `REJECTION NOTIFICATION for ${detailsResponse.referenceNumber}\n\n` +
                `Rejection Code: ${rejection.rejectionCode}\n` +
                `Rejection Date: ${new Date(rejection.rejectionDate).toLocaleDateString()}\n` +
                `Rejected By: ${rejection.rejectedBy}\n\n` +
                `Rejection Reasons:\n${rejection.rejectionReasons.map((reason) => `- ${reason}`).join("\n")}\n\n` +
                `Appeal Process:\n` +
                `- Appeal Deadline: ${new Date(rejection.appealProcess.appealDeadline).toLocaleDateString()}\n` +
                `- Instructions: ${rejection.appealProcess.appealInstructions}\n\n` +
                `Alternative Recommendations:\n${rejection.alternativeRecommendations.map((rec) => `- ${rec}`).join("\n")}`,
            );
          } else {
            // Standard review information for other statuses
            alert(
              `Review process for submission ${submissionId} (${detailsResponse.referenceNumber}):\n\n` +
                `Status: ${detailsResponse.status}\n` +
                `Reviewer: ${detailsResponse.reviewer || "Not assigned"}\n` +
                `Comments: ${detailsResponse.comments || "No comments"}\n` +
                `Estimated Completion: ${new Date(detailsResponse.estimatedCompletionDate).toLocaleDateString()}\n\n` +
                `Document Status:\n` +
                `- Required: ${detailsResponse.documentStatus.totalRequired}\n` +
                `- Uploaded: ${detailsResponse.documentStatus.totalUploaded}\n` +
                `- Compliant: ${detailsResponse.documentStatus.compliant}\n` +
                `- Non-Compliant: ${detailsResponse.documentStatus.nonCompliant}\n\n` +
                `Timeline:\n${timelineText}`,
            );
          }

          // Display next steps based on status management
          if (detailsResponse.statusManagement?.nextSteps?.length > 0) {
            setTimeout(() => {
              const nextStepsText = detailsResponse.statusManagement.nextSteps
                .map((step, i) => `${i + 1}. ${step}`)
                .join("\n");
              alert(
                `Next Steps for ${detailsResponse.referenceNumber}:\n\n${nextStepsText}\n\n` +
                  (detailsResponse.statusManagement.escalationOptions.available
                    ? `Escalation Options Available:\n${detailsResponse.statusManagement.escalationOptions.escalationPath}`
                    : "No escalation options available at this time."),
              );
            }, 500);
          }
        } else {
          alert(`Submission with ID ${submissionId} not found in the system.`);
        }
      } catch (apiError: any) {
        // Handle API-specific errors
        const errorMessage = handleApiError(
          apiError,
          "fetching review details",
        );
        alert(`Error fetching review details: ${errorMessage}`);
      }

      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error fetching review details:", error);
      alert(
        `Error fetching review details for submission ${submissionId}: ${error.message || "Please try again."}`,
      );
      setIsSubmitting(false);
    }
  };

  // Function to verify document compliance with DOH standards - Enhanced for Process 1 & 3
  const verifyDOHCompliance = (documentId: string, file?: File): boolean => {
    // In a real implementation, this would check document content against DOH standards
    // For this demo, we'll assume all documents are compliant if they exist
    if (!file) return false;

    // Mock implementation of DOH compliance checking
    // In a real implementation, this would analyze the document content
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    // Check file type compliance
    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    if (!allowedExtensions.includes(fileExtension || "")) {
      console.warn(
        `File ${file.name} has non-compliant extension: ${fileExtension}`,
      );
      return false;
    }

    // Check file size compliance (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn(`File ${file.name} exceeds maximum size of 5MB`);
      return false;
    }

    // For specific document types, perform additional checks
    if (documentId === "doh-assessment") {
      // In a real implementation, would check if the DOH assessment form has all required fields
      // For demo purposes, we'll assume it's compliant
      return true;
    }

    return true;
  };

  // Function to handle additional document upload for existing submissions - Enhanced for Process 2 & 3
  const handleAdditionalDocumentUpload = async (submissionId: string) => {
    try {
      // Find the submission in history
      const submission = submissionHistory.find((s) => s.id === submissionId);

      if (submission && submission.status === "additional-info") {
        // Create a file input element
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
        fileInput.multiple = true; // Allow multiple file selection

        // Handle file selection
        fileInput.onchange = async (e) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            setIsSubmitting(true);

            // Process selected files
            const files = Array.from(target.files);
            const oversizedFiles = files.filter(
              (file) => file.size > 5 * 1024 * 1024,
            );

            if (oversizedFiles.length > 0) {
              alert(
                `${oversizedFiles.length} file(s) exceed the 5MB size limit and will be skipped.`,
              );
            }

            const validFiles = files.filter(
              (file) => file.size <= 5 * 1024 * 1024,
            );

            if (validFiles.length === 0) {
              alert(
                "No valid files selected. Please try again with smaller files.",
              );
              setIsSubmitting(false);
              return;
            }

            // Check for DOH compliance of additional documents
            const nonCompliantFiles = validFiles.filter(
              (file) => !verifyDOHCompliance("additional-document", file),
            );

            if (nonCompliantFiles.length > 0) {
              alert(
                `${nonCompliantFiles.length} file(s) do not meet DOH compliance standards and will be skipped. Please ensure all files are in the correct format and under 5MB.`,
              );

              // Filter out non-compliant files
              const compliantFiles = validFiles.filter(
                (file) => !nonCompliantFiles.includes(file),
              );

              if (compliantFiles.length === 0) {
                alert(
                  "No compliant files to upload. Please try again with valid files.",
                );
                setIsSubmitting(false);
                return;
              }
            }

            try {
              // Check if this is an offline submission
              if (submissionId.startsWith("offline-")) {
                // Store files for later sync
                // In a real implementation, this would use the actual offline service
                // await offlineService.addToQueue({
                //   url: `${SERVICE_ENDPOINTS.daman}/prior-authorization/${submission.referenceNumber}/additional-documents`,
                //   method: "post",
                //   data: {
                //     files: validFiles.map((file) => ({
                //       name: file.name,
                //       size: file.size,
                //       type: file.type,
                //       // In a real implementation, we'd need to store the file content
                //       // This is just a placeholder
                //       content: "file-content-placeholder",
                //     })),
                //     submissionId,
                //   },
                //   headers: { "Content-Type": "application/json" },
                //   timestamp: new Date().toISOString(),
                // });

                // Mock offline queue for demonstration
                console.log(
                  "Storing additional documents in offline queue for submission:",
                  submissionId,
                  {
                    files: validFiles.map((file) => ({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    })),
                  },
                );

                // Update submission status locally
                const updatedHistory = submissionHistory.map((s) => {
                  if (s.id === submissionId) {
                    return {
                      ...s,
                      status: "pending",
                      comments: `Additional documents saved for upload (${validFiles.length} file(s)), will be submitted when online`,
                      reviewDate: new Date().toLocaleDateString(),
                    };
                  }
                  return s;
                });

                setSubmissionHistory(updatedHistory);
                setIsSubmitting(false);

                alert(
                  `${validFiles.length} additional document(s) saved for later upload when online.\n\n` +
                    `These documents will be automatically submitted when your device reconnects to the internet.`,
                );
              } else {
                // For online submissions, upload directly to API using the hook
                const formData = new FormData();
                validFiles.forEach((file, index) => {
                  formData.append(`file${index}`, file);
                });

                // Use the useDamanAuthorization hook to upload additional documents
                const response = await uploadAdditionalDocuments(
                  submissionId,
                  validFiles,
                );

                // Update submission status
                const updatedHistory = submissionHistory.map((s) => {
                  if (s.id === submissionId) {
                    return {
                      ...s,
                      status: "in-review",
                      comments:
                        response.message ||
                        `Additional documents received (${validFiles.length} file(s)), under review`,
                      reviewDate: new Date().toLocaleDateString(),
                    };
                  }
                  return s;
                });

                setSubmissionHistory(updatedHistory);
                setIsSubmitting(false);

                alert(
                  `${validFiles.length} additional document(s) uploaded successfully.\n\n` +
                    `Submission status updated to 'In Review'.\n` +
                    `Estimated review completion: ${new Date(response.estimatedReviewCompletion).toLocaleDateString()}`,
                );

                // Register for status updates after uploading additional documents
                await registerForStatusNotifications(
                  submissionId,
                  submission.referenceNumber,
                );
              }
            } catch (error: any) {
              console.error("Error uploading additional documents:", error);

              // Use the enhanced error handling function
              const errorMessage = handleApiError(
                error,
                "uploading additional documents",
              );
              alert(`Error uploading additional documents: ${errorMessage}`);
              setIsSubmitting(false);
            }
          }
        };

        // Trigger file selection dialog
        fileInput.click();
      } else {
        alert(
          `Cannot upload additional documents for this submission. Current status: ${submission?.status || "unknown"}.\n\n` +
            `Additional documents can only be uploaded for submissions with 'Additional Info Required' status.`,
        );
      }
    } catch (error: any) {
      console.error("Error uploading additional documents:", error);
      alert(
        `Error uploading additional documents: ${error.message || "Please try again."}`,
      );
      setIsSubmitting(false);
    }
  };

  // Function to resubmit a rejected authorization - Enhanced for Process 3: Authorization Status Management
  const handleResubmit = async (submissionId: string) => {
    try {
      // Find the submission in history
      const submission = submissionHistory.find((s) => s.id === submissionId);

      if (submission && submission.status === "rejected") {
        // Check if this is an offline submission
        if (submissionId.startsWith("offline-")) {
          alert(
            `Offline submission ${submission.referenceNumber} cannot be resubmitted until you're back online.`,
          );
          return;
        }

        // For online submissions, fetch previous submission data
        setIsSubmitting(true);

        try {
          // Get previous submission details
          const previousSubmission =
            await ApiService.getDamanAuthorizationDetails(submissionId);

          // Reset the form for resubmission
          setActiveTab("document-assembly");
          handleReset();

          // Pre-fill form with data from previous submission
          form.reset({
            clinicalJustification:
              previousSubmission.clinicalJustification || "",
            requestedServices: previousSubmission.requestedServices || [],
            requestedDuration: previousSubmission.requestedDuration || 30,
            urgencyLevel: previousSubmission.urgencyLevel || "standard",
            additionalNotes: `Resubmission of ${submission.referenceNumber}. Previous comments: ${submission.comments}`,
          });

          // Mark documents as needed
          const updatedDocuments = documents.map((doc) => {
            // Check if this document was in the previous submission
            const wasUploaded = previousSubmission.documents?.includes(doc.id);
            return {
              ...doc,
              // Don't mark as uploaded, but highlight that it was previously included
              description: wasUploaded
                ? `${doc.description} (Was included in previous submission)`
                : doc.description,
            };
          });

          setDocuments(updatedDocuments);
          setIsSubmitting(false);

          alert(
            "Please review and update the submission documents before resubmitting. Pay special attention to the documents that were previously rejected.",
          );
        } catch (error: any) {
          console.error("Error fetching previous submission data:", error);

          // Still allow resubmission even if we can't get previous data
          setActiveTab("document-assembly");
          handleReset();
          setIsSubmitting(false);

          alert(
            `Could not retrieve previous submission data: ${error.message || "Unknown error"}. Please review and update the submission documents before resubmitting.`,
          );
        }
      } else {
        alert(
          `Cannot resubmit this authorization. Current status: ${submission?.status || "unknown"}.`,
        );
      }
    } catch (error: any) {
      console.error("Error preparing resubmission:", error);
      alert(
        `Error preparing resubmission: ${error.message || "Please try again."}`,
      );
      setIsSubmitting(false);
    }
  };

  // Function to download approval letter - Enhanced for Process 3: Authorization Status Management
  const handleDownloadApproval = async (submissionId: string) => {
    try {
      // Find the submission in history
      const submission = submissionHistory.find((s) => s.id === submissionId);

      if (submission && submission.status === "approved") {
        // Check if this is an offline submission
        if (submissionId.startsWith("offline-")) {
          alert(
            `Approval letter for offline submission ${submission.referenceNumber} will be available once you're back online.`,
          );
          return;
        }

        // For online submissions, download from API
        try {
          // In a real implementation, this would call the actual API
          // const blob = await ApiService.downloadApprovalLetter(submissionId);

          // Enhanced approval letter with more comprehensive details
          const approvalDetails = {
            referenceNumber: submission.referenceNumber,
            approvalCode: `AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            approvalDate: submission.reviewDate || new Date().toISOString(),
            effectiveDate: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
            expirationDate: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
            approvedBy: submission.reviewer || "Daman Review Committee",
            patientDetails: {
              name: "Mohammed Al Mansoori",
              emiratesId: "784-1985-1234567-8",
              insuranceDetails: {
                provider: "Daman - Thiqa",
                policyNumber: "THQ-12345678",
              },
            },
            approvedServices: ["nursing", "physiotherapy"],
            approvedFrequency: {
              nursing: "Daily",
              physiotherapy: "3 times per week",
            },
            approvedDuration: 30,
            specialNotes: "Vital signs monitoring required with each visit",
            billingInstructions:
              "Use authorization code with each claim submission",
            documentationRequirements: "Daily progress notes required",
            providerDetails: {
              name: "Reyada Homecare",
              licenseNumber: "DOH-HC-2023-001",
              address: "Abu Dhabi, UAE",
              contactNumber: "+971-2-123-4567",
            },
            legalDisclaimer:
              "This authorization is subject to patient eligibility at the time of service and the terms of the member's plan.",
          };

          // Mock PDF generation for demonstration with enhanced details
          alert(
            `DAMAN PRIOR AUTHORIZATION APPROVAL\n` +
              `===============================\n\n` +
              `AUTHORIZATION DETAILS:\n` +
              `Reference Number: ${approvalDetails.referenceNumber}\n` +
              `Authorization Code: ${approvalDetails.approvalCode}\n` +
              `Approval Date: ${new Date(approvalDetails.approvalDate).toLocaleDateString()}\n` +
              `Effective Date: ${new Date(approvalDetails.effectiveDate).toLocaleDateString()}\n` +
              `Expiration Date: ${new Date(approvalDetails.expirationDate).toLocaleDateString()}\n\n` +
              `PATIENT INFORMATION:\n` +
              `Name: ${approvalDetails.patientDetails.name}\n` +
              `Emirates ID: ${approvalDetails.patientDetails.emiratesId}\n` +
              `Insurance: ${approvalDetails.patientDetails.insuranceDetails.provider}\n` +
              `Policy Number: ${approvalDetails.patientDetails.insuranceDetails.policyNumber}\n\n` +
              `APPROVED SERVICES:\n` +
              Object.entries(approvalDetails.approvedFrequency)
                .map(
                  ([service, freq]) =>
                    `- ${service.charAt(0).toUpperCase() + service.slice(1)}: ${freq}`,
                )
                .join("\n") +
              `\n` +
              `Approved Duration: ${approvalDetails.approvedDuration} days\n\n` +
              `SPECIAL INSTRUCTIONS:\n` +
              `- ${approvalDetails.specialNotes}\n` +
              `- ${approvalDetails.documentationRequirements}\n` +
              `- ${approvalDetails.billingInstructions}\n\n` +
              `PROVIDER INFORMATION:\n` +
              `Provider: ${approvalDetails.providerDetails.name}\n` +
              `License: ${approvalDetails.providerDetails.licenseNumber}\n` +
              `Contact: ${approvalDetails.providerDetails.contactNumber}\n\n` +
              `DISCLAIMER:\n` +
              `${approvalDetails.legalDisclaimer}\n\n` +
              `Approved By: ${approvalDetails.approvedBy}\n` +
              `Digital Signature: [Signature Verified]\n\n` +
              `This document serves as official authorization for the specified services.\n` +
              `===============================`,
          );

          // In a real implementation, we would create a download link
          // const url = window.URL.createObjectURL(blob);
          // const link = document.createElement("a");
          // link.href = url;
          // link.setAttribute(
          //   "download",
          //   `Approval_${submission.referenceNumber}.pdf`,
          // );
          // document.body.appendChild(link);
          // link.click();
          //
          // // Clean up
          // setTimeout(() => {
          //   window.URL.revokeObjectURL(url);
          //   link.remove();
          // }, 100);

          // Track the download event and log for compliance
          // analyticsService.trackEvent({
          //   category: 'Authorization',
          //   action: 'Download Approval Letter',
          //   label: submission.referenceNumber
          // });

          // Log the download for compliance tracking
          console.log("Approval letter downloaded:", {
            submissionId,
            referenceNumber: submission.referenceNumber,
            downloadedBy: localStorage.getItem("user_id") || "unknown",
            downloadTimestamp: new Date().toISOString(),
            approvalDetails: approvalDetails,
          });

          // In a real implementation, we would also store this in the compliance log
          // await ApiService.post(`${SERVICE_ENDPOINTS.compliance}/authorization-logs`, {
          //   action: "approval-letter-download",
          //   submissionId,
          //   referenceNumber: submission.referenceNumber,
          //   performedBy: localStorage.getItem("user_id") || "unknown",
          //   timestamp: new Date().toISOString(),
          //   details: approvalDetails
          // });
        } catch (apiError: any) {
          // Handle API-specific errors
          const errorMessage = handleApiError(
            apiError,
            "downloading approval letter",
          );
          alert(`Error downloading approval letter: ${errorMessage}`);
        }
      } else {
        alert(
          `Cannot download approval letter. Current status: ${submission?.status || "unknown"}.`,
        );
      }
    } catch (error: any) {
      console.error("Error downloading approval letter:", error);
      alert(
        `Error downloading approval letter: ${error.message || "Please try again."}`,
      );
    }
  };

  return (
    <div className="w-full bg-background">
      {submissionSuccess ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center text-green-600">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              Daman Prior Authorization Submission Complete
            </CardTitle>
            <CardDescription className="text-center">
              Your authorization request has been successfully{" "}
              {isOffline ? "saved for later submission" : "submitted to Daman"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Submission Reference:</p>
              <p className="text-sm">
                {isOffline ? "OFFLINE-" : ""}REF-
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
              <p className="font-medium mt-2">Submission Date:</p>
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isOffline
                  ? "This submission will be processed when your device reconnects to the internet."
                  : "You will receive a notification when Daman processes this authorization request."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleReset}>Submit Another Authorization</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Daman Prior Authorization</h2>
              <p className="text-muted-foreground">
                Prepare and submit authorization request to Daman insurance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOffline ? "destructive" : "outline"}
                className="text-xs"
              >
                {isOffline ? "Offline Mode" : "Online"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Patient ID: {patientId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Episode: {episodeId}
              </Badge>
            </div>
          </div>

          {/* Tabs for different sections of the authorization process */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="document-assembly">
                <FileText className="h-4 w-4 mr-2" />
                Document Assembly
              </TabsTrigger>
              <TabsTrigger value="digital-signatures">
                <FileCheck className="h-4 w-4 mr-2" />
                Digital Signatures
              </TabsTrigger>
              <TabsTrigger value="submission-tracking">
                <FileSearch className="h-4 w-4 mr-2" />
                Submission Tracking
              </TabsTrigger>
              <TabsTrigger value="submission-history">
                <History className="h-4 w-4 mr-2" />
                Submission History
              </TabsTrigger>
            </TabsList>

            {/* Document Assembly Tab */}
            <TabsContent value="document-assembly" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clinical Justification Form */}
                <Card className="lg:col-span-3 mb-6">
                  <CardHeader>
                    <CardTitle>Clinical Justification</CardTitle>
                    <CardDescription>
                      Provide clinical justification for the requested services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="requestedServices"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requested Services</FormLabel>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="nursing"
                                      checked={field.value?.includes("nursing")}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...current,
                                            "nursing",
                                          ]);
                                        } else {
                                          field.onChange(
                                            current.filter(
                                              (item) => item !== "nursing",
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <Label htmlFor="nursing">
                                      Nursing Care
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="physiotherapy"
                                      checked={field.value?.includes(
                                        "physiotherapy",
                                      )}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...current,
                                            "physiotherapy",
                                          ]);
                                        } else {
                                          field.onChange(
                                            current.filter(
                                              (item) =>
                                                item !== "physiotherapy",
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <Label htmlFor="physiotherapy">
                                      Physiotherapy
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="occupational-therapy"
                                      checked={field.value?.includes(
                                        "occupational-therapy",
                                      )}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...current,
                                            "occupational-therapy",
                                          ]);
                                        } else {
                                          field.onChange(
                                            current.filter(
                                              (item) =>
                                                item !== "occupational-therapy",
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <Label htmlFor="occupational-therapy">
                                      Occupational Therapy
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="respiratory-therapy"
                                      checked={field.value?.includes(
                                        "respiratory-therapy",
                                      )}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...current,
                                            "respiratory-therapy",
                                          ]);
                                        } else {
                                          field.onChange(
                                            current.filter(
                                              (item) =>
                                                item !== "respiratory-therapy",
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <Label htmlFor="respiratory-therapy">
                                      Respiratory Therapy
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="equipment"
                                      checked={field.value?.includes(
                                        "equipment",
                                      )}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...current,
                                            "equipment",
                                          ]);
                                        } else {
                                          field.onChange(
                                            current.filter(
                                              (item) => item !== "equipment",
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <Label htmlFor="equipment">
                                      Medical Equipment
                                    </Label>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="requestedDuration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requested Duration (days)</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value.toString()}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="14">14 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="urgencyLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Urgency Level</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select urgency level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="standard">
                                      Standard (5-7 business days)
                                    </SelectItem>
                                    <SelectItem value="urgent">
                                      Urgent (24-48 hours)
                                    </SelectItem>
                                    <SelectItem value="emergency">
                                      Emergency (Same day)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name="clinicalJustification"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Clinical Justification</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Provide detailed clinical justification for the requested services"
                                    className="min-h-[200px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include patient's diagnosis, functional
                                  limitations, and expected outcomes
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
                {/* Main Content - Takes 2/3 of space on large screens */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Document Assembly</CardTitle>
                      <Badge variant="outline">
                        {submissionProgress}% Complete
                      </Badge>
                    </div>
                    <CardDescription>
                      Upload all required documents for Daman prior
                      authorization submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-6">
                        {documents.map((doc) => (
                          <div key={doc.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted p-2 rounded-md">
                                  {doc.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={doc.required ? "default" : "outline"}
                                className="text-xs"
                              >
                                {doc.required ? "Required" : "Optional"}
                              </Badge>
                            </div>
                            <div className="mt-4 flex flex-col space-y-2">
                              {doc.uploaded ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Document uploaded
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // In a real implementation, this would preview the document
                                        if (doc.file) {
                                          const url = URL.createObjectURL(
                                            doc.file,
                                          );
                                          window.open(url, "_blank");
                                        } else {
                                          alert(
                                            "Preview not available for this document",
                                          );
                                        }
                                      }}
                                    >
                                      Preview
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDocumentUpload(doc.id)
                                      }
                                    >
                                      Replace
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-muted-foreground">
                                    {doc.required
                                      ? "Required document"
                                      : "Optional document"}
                                  </div>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleDocumentUpload(doc.id)}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Upload
                                  </Button>
                                </div>
                              )}

                              {doc.uploaded && doc.file && (
                                <div className="bg-muted rounded p-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {doc.file.name}
                                    </span>
                                    <span>
                                      {(doc.fileSize! / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground mt-1">
                                    <span>
                                      Uploaded:{" "}
                                      {new Date(
                                        doc.uploadDate!,
                                      ).toLocaleString()}
                                    </span>
                                    <span>Type: {doc.fileType}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || submissionProgress < 100}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : isOffline
                          ? "Save for Later"
                          : "Submit to Daman"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Sidebar - Takes 1/3 of space on large screens */}
                <div className="space-y-6">
                  {/* Submission Progress */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Submission Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${submissionProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{submissionProgress}% Complete</span>
                          <span>{100 - submissionProgress}% Remaining</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Required Documents
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {
                                documents.filter(
                                  (d) => d.required && d.uploaded,
                                ).length
                              }
                              /{documents.filter((d) => d.required).length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Optional Documents
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {
                                documents.filter(
                                  (d) => !d.required && d.uploaded,
                                ).length
                              }
                              /{documents.filter((d) => !d.required).length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submission Checklist */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Submission Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="check-patient-info" checked={true} />
                          <Label
                            htmlFor="check-patient-info"
                            className="text-sm"
                          >
                            Patient Information Verified
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="check-insurance" checked={true} />
                          <Label htmlFor="check-insurance" className="text-sm">
                            Insurance Details Confirmed
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="check-documents"
                            checked={submissionProgress === 100}
                          />
                          <Label htmlFor="check-documents" className="text-sm">
                            All Required Documents Uploaded
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="check-signatures" checked={false} />
                          <Label htmlFor="check-signatures" className="text-sm">
                            All Signatures Obtained
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="check-review" checked={false} />
                          <Label htmlFor="check-review" className="text-sm">
                            Final Review Completed
                          </Label>
                        </div>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">
                          All checklist items must be completed before
                          submission
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submission Guidelines */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Submission Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
                        <p>• Maximum file size: 5MB per document</p>
                        <p>• Patient identifiers must be visible</p>
                        <p>• Medical reports must be dated within 30 days</p>
                        <p>• All forms must have required signatures</p>
                        <p>• Ensure all documents are clear and legible</p>
                        <p>• Documents must comply with DOH standards</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          For assistance, contact the Insurance Coding
                          Department at ext. 4567
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Digital Signatures Tab */}
            <TabsContent value="digital-signatures" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Signatures</CardTitle>
                  <CardDescription>
                    Collect required digital signatures for Daman prior
                    authorization submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Patient Signature Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Patient Signature</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="patient-name">Patient Name</Label>
                          <Input
                            id="patient-name"
                            value={patientDetails.name}
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="patient-emirates-id">
                            Emirates ID
                          </Label>
                          <Input
                            id="patient-emirates-id"
                            value={patientDetails.emiratesId}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="patient-signature-date">
                          Signature Date
                        </Label>
                        <Input
                          id="patient-signature-date"
                          type="date"
                          value={digitalSignatures.patientSignatureDate || ""}
                          onChange={(e) =>
                            setDigitalSignatures((prev) => ({
                              ...prev,
                              patientSignatureDate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="patient-signature">
                          Patient Signature
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 h-40 flex flex-col items-center justify-center">
                          {digitalSignatures.patientSignature ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <p className="text-green-600 font-medium flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Signature Captured
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Digitally signed by {patientDetails.name} on{" "}
                                {digitalSignatures.patientSignatureDate ||
                                  new Date().toLocaleDateString()}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() =>
                                  setDigitalSignatures((prev) => ({
                                    ...prev,
                                    patientSignature: "",
                                    patientSignatureDate: "",
                                  }))
                                }
                              >
                                Clear Signature
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-muted-foreground mb-4">
                                No signature captured
                              </p>
                              <Button
                                onClick={() => {
                                  // In a real implementation, this would open a signature pad
                                  // For this demo, we'll just set a placeholder value
                                  setDigitalSignatures((prev) => ({
                                    ...prev,
                                    patientSignature:
                                      "data:image/png;base64,iVBORw0KGgoA...",
                                    patientSignatureDate: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                  }));
                                }}
                              >
                                Capture Signature
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Provider Signature Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Provider Signature
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="provider-name">Provider Name</Label>
                          <Select
                            value={
                              digitalSignatures.providerSignature
                                ? "signed"
                                : ""
                            }
                            onValueChange={(value) => {
                              if (value === "signed") {
                                setDigitalSignatures((prev) => ({
                                  ...prev,
                                  providerSignature:
                                    "data:image/png;base64,iVBORw0KGgoA...",
                                  providerSignatureDate: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                }));
                              }
                            }}
                          >
                            <SelectTrigger id="provider-name">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="signed">
                                Dr. Ahmed Al Hashimi (Physician)
                              </SelectItem>
                              <SelectItem value="other">
                                Dr. Fatima Al Zaabi (Specialist)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="provider-signature-date">
                            Signature Date
                          </Label>
                          <Input
                            id="provider-signature-date"
                            type="date"
                            value={
                              digitalSignatures.providerSignatureDate || ""
                            }
                            onChange={(e) =>
                              setDigitalSignatures((prev) => ({
                                ...prev,
                                providerSignatureDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="provider-signature">
                          Provider Signature
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 h-40 flex flex-col items-center justify-center">
                          {digitalSignatures.providerSignature ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <p className="text-green-600 font-medium flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Signature Captured
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Digitally signed by Dr. Ahmed Al Hashimi on{" "}
                                {digitalSignatures.providerSignatureDate ||
                                  new Date().toLocaleDateString()}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() =>
                                  setDigitalSignatures((prev) => ({
                                    ...prev,
                                    providerSignature: "",
                                    providerSignatureDate: "",
                                  }))
                                }
                              >
                                Clear Signature
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-muted-foreground mb-4">
                                No signature captured
                              </p>
                              <Button
                                onClick={() => {
                                  // In a real implementation, this would open a signature pad
                                  setDigitalSignatures((prev) => ({
                                    ...prev,
                                    providerSignature:
                                      "data:image/png;base64,iVBORw0KGgoA...",
                                    providerSignatureDate: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                  }));
                                }}
                              >
                                Capture Signature
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="provider-attestation">
                            Provider Attestation
                          </Label>
                          <div className="bg-muted p-4 rounded-md">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="provider-attestation"
                                checked={
                                  digitalSignatures.providerSignature !== ""
                                }
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setDigitalSignatures((prev) => ({
                                      ...prev,
                                      providerSignature:
                                        "data:image/png;base64,iVBORw0KGgoA...",
                                      providerSignatureDate: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                    }));
                                  } else {
                                    setDigitalSignatures((prev) => ({
                                      ...prev,
                                      providerSignature: "",
                                      providerSignatureDate: "",
                                    }));
                                  }
                                }}
                              />
                              <Label
                                htmlFor="provider-attestation"
                                className="text-sm"
                              >
                                I attest that the information provided in this
                                prior authorization request is accurate,
                                complete, and medically necessary for the
                                patient's care.
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">
                          Signature Requirements
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>
                            • Both patient and provider signatures are required
                            for submission
                          </li>
                          <li>
                            • Digital signatures are compliant with DOH
                            electronic signature requirements
                          </li>
                          <li>
                            • Signatures are cryptographically secured and
                            tamper-evident
                          </li>
                          <li>
                            • Signature metadata includes timestamp and signer
                            identity verification
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">
                        Signature Requirements
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>
                          • Both patient and provider signatures are required
                          for submission
                        </li>
                        <li>
                          • Digital signatures are compliant with DOH electronic
                          signature requirements
                        </li>
                        <li>
                          • Signatures are cryptographically secured and
                          tamper-evident
                        </li>
                        <li>
                          • Signature metadata includes timestamp and signer
                          identity verification
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("document-assembly")}
                  >
                    Back to Documents
                  </Button>
                  <Button onClick={() => setActiveTab("submission-tracking")}>
                    Continue to Submission
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Submission Tracking Tab */}
            <TabsContent value="submission-tracking" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Tracking</CardTitle>
                  <CardDescription>
                    Track the status of your Daman prior authorization
                    submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tracking-reference">
                          Reference Number
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="tracking-reference"
                            placeholder="Enter reference number"
                            defaultValue="DAMAN-PA-2024-00456"
                          />
                          <Button
                            onClick={() =>
                              trackSubmission("DAMAN-PA-2024-00456")
                            }
                          >
                            Track
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tracking-status">Current Status</Label>
                        <div className="flex items-center gap-2 mt-3">
                          <FileSearch className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">In Review</span>
                          <Badge variant="secondary" className="ml-2">
                            Updated 2 hours ago
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced notification preferences for Process 2 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">Status Notifications</h4>
                      </div>
                      <p className="text-sm mb-3">
                        Receive real-time notifications when your submission
                        status changes
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-email" defaultChecked />
                            <Label htmlFor="notify-email" className="text-sm">
                              Email Notifications
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-sms" defaultChecked />
                            <Label htmlFor="notify-sms" className="text-sm">
                              SMS Notifications
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-app" defaultChecked />
                            <Label htmlFor="notify-app" className="text-sm">
                              In-App Notifications
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Notify me when:</p>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="notify-status-change"
                              defaultChecked
                            />
                            <Label
                              htmlFor="notify-status-change"
                              className="text-sm"
                            >
                              Status Changes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="notify-additional-info"
                              defaultChecked
                            />
                            <Label
                              htmlFor="notify-additional-info"
                              className="text-sm"
                            >
                              Additional Info Requested
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notify-decision" defaultChecked />
                            <Label
                              htmlFor="notify-decision"
                              className="text-sm"
                            >
                              Final Decision Made
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Enhanced submission timeline for Process 2 */}
                    <div>
                      <h3 className="font-medium mb-2">Submission Timeline</h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="w-0.5 h-full bg-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Submission Received</p>
                              <Badge variant="outline" className="text-xs">
                                20 Feb 2024, 09:15
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Authorization request received by Daman
                            </p>
                            <div className="mt-2 bg-green-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-green-700">
                                Processing Details:
                              </p>
                              <p className="text-green-600">
                                Submission validated and assigned tracking ID:
                                SUB-12345. All required documents received.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="w-0.5 h-full bg-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                Initial Verification
                              </p>
                              <Badge variant="outline" className="text-xs">
                                20 Feb 2024, 11:30
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Document verification completed
                            </p>
                            <div className="mt-2 bg-green-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-green-700">
                                Verification Results:
                              </p>
                              <p className="text-green-600">
                                All 15 required documents verified. Patient
                                eligibility confirmed. Submission passed to
                                clinical review team.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileSearch className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="w-0.5 h-full bg-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Clinical Review</p>
                              <Badge variant="outline" className="text-xs">
                                21 Feb 2024, 09:45
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Under review by Dr. Khalid Al Marzouqi
                            </p>
                            <div className="mt-2 bg-blue-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-blue-700">
                                Review Notes:
                              </p>
                              <p className="text-blue-600">
                                Initial clinical assessment completed. Verifying
                                medical necessity criteria and documentation
                                completeness. Expected completion by EOD.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-muted-foreground">
                                Decision
                              </p>
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Expected by 24 Feb 2024
                            </p>
                            <div className="mt-2 bg-gray-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-gray-700">
                                Next Steps:
                              </p>
                              <p className="text-gray-600">
                                Clinical review → Financial review → Final
                                decision. Estimated completion within 48 hours.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Enhanced tracking details for Process 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Processing Details</h3>
                        <div className="bg-white border rounded-md p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Tracking ID:
                            </span>
                            <span className="text-sm">SUB-12345</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Priority Level:
                            </span>
                            <span className="text-sm">Standard</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Assigned Reviewer:
                            </span>
                            <span className="text-sm">
                              Dr. Khalid Al Marzouqi
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Processing Stage:
                            </span>
                            <span className="text-sm">Clinical Review</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Est. Completion:
                            </span>
                            <span className="text-sm">24 Feb 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Last Updated:
                            </span>
                            <span className="text-sm">21 Feb 2024, 09:45</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">
                          Additional Information
                        </h3>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800 mb-1">
                                Additional Information May Be Required
                              </p>
                              <p className="text-sm text-amber-700 mb-2">
                                Based on preliminary review, the following
                                additional documents may be requested:
                              </p>
                              <ul className="text-sm text-amber-700 list-disc pl-5 space-y-1">
                                <li>
                                  Updated clinical progress notes from the last
                                  7 days
                                </li>
                                <li>Recent vital signs monitoring records</li>
                                <li>
                                  Detailed medication administration records
                                </li>
                              </ul>
                              <p className="text-sm text-amber-700 mt-2">
                                We recommend preparing these documents in
                                advance to expedite the approval process if
                                requested.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced escalation options for Process 3 */}
                    <div>
                      <h3 className="font-medium mb-2">Escalation Options</h3>
                      <div className="bg-gray-50 border rounded-md p-4">
                        <p className="text-sm mb-3">
                          If you need to escalate this submission due to urgency
                          or delays:
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Provider Relations:
                            </span>
                            <span className="text-sm">+971-2-614-9555</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm">
                              provider.relations@damanhealth.ae
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Reference:
                            </span>
                            <span className="text-sm">DAMAN-PA-2024-00456</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Escalation Criteria:
                            </span>
                            <span className="text-sm">
                              Urgent medical necessity, 48+ hour delay
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Find the most recent submission that needs additional info
                        const submission = submissionHistory.find(
                          (s) => s.status === "additional-info",
                        );
                        if (submission) {
                          handleAdditionalDocumentUpload(submission.id);
                        } else {
                          alert(
                            "No submissions currently require additional documents.",
                          );
                        }
                      }}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload Additional Documents
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Status Report
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Alert
                    </Button>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Contact Reviewer
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Submission History Tab */}
            <TabsContent value="submission-history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submission History</CardTitle>
                  <CardDescription>
                    View and manage your previous authorization submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {submissionHistory.map((submission) => (
                        <div
                          key={submission.id}
                          className="border rounded-md p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(submission.status)}
                                <h3 className="font-medium">
                                  {submission.referenceNumber}
                                </h3>
                                <Badge variant="outline">
                                  {submission.status === "approved"
                                    ? "Approved"
                                    : submission.status === "rejected"
                                      ? "Rejected"
                                      : submission.status === "additional-info"
                                        ? "Additional Info Required"
                                        : submission.status === "in-review"
                                          ? "In Review"
                                          : "Pending"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Submitted: {submission.submissionDate} |
                                Reviewer: {submission.reviewer}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReviewProcess(submission.id)
                                }
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  trackSubmission(submission.referenceNumber)
                                }
                              >
                                Track
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 bg-muted p-3 rounded-md">
                            <p className="text-sm">
                              <span className="font-medium">Comments: </span>
                              {submission.comments}
                            </p>
                          </div>

                          <div className="mt-3 flex gap-2">
                            {submission.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDownloadApproval(submission.id)
                                }
                              >
                                <FileCheck2 className="h-4 w-4 mr-1" />
                                Download Approval
                              </Button>
                            )}
                            {submission.status === "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResubmit(submission.id)}
                              >
                                <FileUp className="h-4 w-4 mr-1" />
                                Resubmit
                              </Button>
                            )}
                            {submission.status === "additional-info" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAdditionalDocumentUpload(submission.id)
                                }
                              >
                                <FileUp className="h-4 w-4 mr-1" />
                                Upload Additional Info
                              </Button>
                            )}
                            {submission.status === "in-review" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  trackSubmission(submission.referenceNumber)
                                }
                              >
                                <FileSearch className="h-4 w-4 mr-1" />
                                Track Status
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {submissionHistory.length} submissions from the last
                    90 days
                  </div>
                  <Button variant="outline">
                    <BarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default DamanSubmissionForm;
