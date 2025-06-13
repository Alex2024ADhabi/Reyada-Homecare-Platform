import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Bell, Download } from "lucide-react";
import { FileText, Upload, CheckCircle, AlertCircle, MapPin, FileUp, Clipboard, ClipboardCheck, User, CreditCard, Stethoscope, Pill, Activity, FileSpreadsheet, FileImage, FilePlus, FileCheck, FileClock, FileBarChart, FileMinus, // Replacing FileMedical with FileMinus as a suitable alternative
FileSymlink, FileBox, Send, Clock, BarChart, FileSearch, FileQuestion, FileX, FileCheck2, History, } from "lucide-react";
import { ApiService } from "@/services/api.service";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useDamanAuthorization } from "@/hooks/useDamanAuthorization";
const DamanSubmissionForm = ({ patientId = "P12345", episodeId = "EP789", isOffline: propIsOffline, onComplete, }) => {
    const { isOnline, isSyncing, pendingItems, syncPendingData } = useOfflineSync();
    const { isLoading: isAuthLoading, error: authError, submitAuthorization, trackAuthorization, getAuthorizationDetails, uploadAdditionalDocuments, registerForNotifications, } = useDamanAuthorization();
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
    const [digitalSignatures, setDigitalSignatures] = useState({
        patientSignature: "",
        patientSignatureDate: "",
        providerSignature: "",
        providerSignatureDate: "",
    });
    // Mock patient details
    const [patientDetails, setPatientDetails] = useState({
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
    const [submissionHistory, setSubmissionHistory] = useState([
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
            comments: "Please provide updated clinical assessment and recent lab results",
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
    const requiredDocuments = [
        {
            id: "auth-request-form",
            name: "Daman Authorization Request Form",
            required: true,
            uploaded: false,
            icon: _jsx(FileText, { className: "h-4 w-4" }),
            description: "Official Daman form for requesting prior authorization",
        },
        {
            id: "medical-report",
            name: "Medical Report/Discharge Summary",
            required: true,
            uploaded: false,
            icon: _jsx(FileMinus, { className: "h-4 w-4" }),
            description: "Comprehensive medical report or hospital discharge summary",
        },
        {
            id: "face-to-face",
            name: "Face-to-Face Assessment Form",
            required: true,
            uploaded: false,
            icon: _jsx(User, { className: "h-4 w-4" }),
            description: "Documentation of in-person clinical assessment",
        },
        {
            id: "daman-consent",
            name: "Daman Consent Form",
            required: true,
            uploaded: false,
            icon: _jsx(ClipboardCheck, { className: "h-4 w-4" }),
            description: "Patient consent for treatment and information sharing",
        },
        {
            id: "doh-assessment",
            name: "DOH Healthcare Assessment Form (Scoring)",
            required: true,
            uploaded: false,
            icon: _jsx(FileSpreadsheet, { className: "h-4 w-4" }),
            description: "DOH-mandated assessment with domain scoring",
        },
        {
            id: "medication-list",
            name: "Medication List",
            required: true,
            uploaded: false,
            icon: _jsx(Pill, { className: "h-4 w-4" }),
            description: "Current and comprehensive list of all medications",
        },
        {
            id: "physician-report",
            name: "Physician Internal Medical Report",
            required: true,
            uploaded: false,
            icon: _jsx(Stethoscope, { className: "h-4 w-4" }),
            description: "Detailed medical report from attending physician",
        },
        {
            id: "vital-signs",
            name: "Vital Signs Monitoring Sheet",
            required: true,
            uploaded: false,
            icon: _jsx(Activity, { className: "h-4 w-4" }),
            description: "Record of patient's vital signs measurements",
        },
        {
            id: "mar",
            name: "Medication Administration Record (MAR)",
            required: true,
            uploaded: false,
            icon: _jsx(Clipboard, { className: "h-4 w-4" }),
            description: "Documentation of medication administration history",
        },
        {
            id: "pt-ot-form",
            name: "Daman PT & OT Assessment Form",
            required: false,
            uploaded: false,
            icon: _jsx(FileBarChart, { className: "h-4 w-4" }),
            description: "Physical and occupational therapy assessment (if applicable)",
        },
        {
            id: "thiqa-card",
            name: "Patient Thiqa Card copy",
            required: true,
            uploaded: false,
            icon: _jsx(CreditCard, { className: "h-4 w-4" }),
            description: "Copy of patient's Thiqa insurance card",
        },
        {
            id: "emirates-id",
            name: "Patient Emirates ID copy",
            required: true,
            uploaded: false,
            icon: _jsx(CreditCard, { className: "h-4 w-4" }),
            description: "Copy of patient's Emirates ID",
        },
        {
            id: "nurse-license",
            name: "Nurse License verification",
            required: true,
            uploaded: false,
            icon: _jsx(FileCheck, { className: "h-4 w-4" }),
            description: "Verification of nurse's professional license",
        },
        {
            id: "physician-license",
            name: "Physician License verification",
            required: true,
            uploaded: false,
            icon: _jsx(FileCheck, { className: "h-4 w-4" }),
            description: "Verification of physician's professional license",
        },
        {
            id: "therapist-license",
            name: "Therapist License verification",
            required: false,
            uploaded: false,
            icon: _jsx(FileCheck, { className: "h-4 w-4" }),
            description: "Verification of therapist's professional license (if applicable)",
        },
        {
            id: "location-map",
            name: "Location Map with GPS coordinates",
            required: true,
            uploaded: false,
            icon: _jsx(MapPin, { className: "h-4 w-4" }),
            description: "Map showing patient's home location with GPS coordinates",
        },
        {
            id: "justification-letter",
            name: "Justification Letter",
            required: false,
            uploaded: false,
            icon: _jsx(FileText, { className: "h-4 w-4" }),
            description: "Letter explaining medical necessity (if required)",
        },
        {
            id: "previous-auth",
            name: "Previous Authorization Letter",
            required: false,
            uploaded: false,
            icon: _jsx(FileClock, { className: "h-4 w-4" }),
            description: "Copy of previous authorization (for renewals only)",
        },
        {
            id: "progress-notes",
            name: "Clinical Progress Notes",
            required: true,
            uploaded: false,
            icon: _jsx(FileSymlink, { className: "h-4 w-4" }),
            description: "Recent clinical progress notes from healthcare providers",
        },
        {
            id: "lab-results",
            name: "Laboratory Results",
            required: true,
            uploaded: false,
            icon: _jsx(FileBarChart, { className: "h-4 w-4" }),
            description: "Recent laboratory test results",
        },
        {
            id: "imaging-reports",
            name: "Imaging Reports",
            required: false,
            uploaded: false,
            icon: _jsx(FileImage, { className: "h-4 w-4" }),
            description: "Radiology and imaging reports (if applicable)",
        },
        {
            id: "specialist-notes",
            name: "Specialist Consultation Notes",
            required: false,
            uploaded: false,
            icon: _jsx(FilePlus, { className: "h-4 w-4" }),
            description: "Notes from specialist consultations (if applicable)",
        },
        {
            id: "equipment-list",
            name: "Equipment/Supply Requirements List",
            required: true,
            uploaded: false,
            icon: _jsx(FileBox, { className: "h-4 w-4" }),
            description: "List of required medical equipment and supplies",
        },
    ];
    const [documents, setDocuments] = useState(requiredDocuments);
    // Calculate submission progress
    const calculateProgress = () => {
        const requiredDocs = documents.filter((doc) => doc.required);
        const uploadedRequiredDocs = requiredDocs.filter((doc) => doc.uploaded);
        const progress = Math.round((uploadedRequiredDocs.length / requiredDocs.length) * 100);
        setSubmissionProgress(progress);
        return progress;
    };
    // Enhanced error handling for API calls
    const handleApiError = (error, operation) => {
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
    const handleDocumentUpload = (documentId) => {
        // Create a file input element
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
        // Handle file selection
        fileInput.onchange = (e) => {
            const target = e.target;
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
            const missingDocs = documents.filter((doc) => doc.required && !doc.uploaded);
            if (missingDocs.length > 0) {
                alert(`Please upload all required documents. Missing: ${missingDocs.map((d) => d.name).join(", ")}`);
                setIsSubmitting(false);
                return;
            }
            // Verify DOH compliance for all uploaded documents
            const nonCompliantDocs = documents
                .filter((doc) => doc.uploaded)
                .filter((doc) => !verifyDOHCompliance(doc.id, doc.file));
            if (nonCompliantDocs.length > 0) {
                alert(`The following documents do not meet DOH compliance standards: ${nonCompliantDocs.map((d) => d.name).join(", ")}. Please review and reupload.`);
                setIsSubmitting(false);
                return;
            }
            // Check for digital signatures
            if (!digitalSignatures.patientSignature ||
                !digitalSignatures.providerSignature) {
                alert("Both patient and provider digital signatures are required for submission.");
                setIsSubmitting(false);
                return;
            }
            // Validate clinical justification
            const clinicalJustification = form.getValues("clinicalJustification") || "";
            if (clinicalJustification.length < 50) {
                alert("Clinical justification must be detailed and at least 50 characters long.");
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
                    gpsCoordinates: localStorage.getItem("last_known_location") || "unknown",
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
                await registerForNotifications(response.id, response.referenceNumber, notificationPreferences);
                // Add to submission history
                const newSubmission = {
                    id: response.id,
                    referenceNumber: response.referenceNumber,
                    submissionDate: new Date().toLocaleDateString(),
                    status: response.offlineQueued ? "pending" : "in-review",
                    comments: response.message ||
                        (response.offlineQueued
                            ? "Pending online synchronization"
                            : "Submission received and under initial review"),
                    reviewer: response.reviewer || "Pending Assignment",
                };
                setSubmissionHistory((prev) => [newSubmission, ...prev]);
                setSubmissionSuccess(true);
                if (onComplete)
                    onComplete(true);
                // Show success message with more details
                if (response.offlineQueued) {
                    alert("Submission saved for later sync when online connection is restored.\n\n" +
                        "Reference Number: " +
                        response.referenceNumber +
                        "\n" +
                        "Please note this reference number for tracking purposes.");
                }
                else {
                    alert("Submission successfully sent to Daman portal.\n\n" +
                        "Reference Number: " +
                        response.referenceNumber +
                        "\n" +
                        "Status: In Review\n" +
                        "Estimated Review Completion: " +
                        new Date(response.estimatedReviewCompletion).toLocaleDateString() +
                        "\n\n" +
                        "You will receive notifications when the status changes.");
                }
            }
            catch (apiError) {
                console.error("Error submitting Daman authorization:", apiError);
                // Use the enhanced error handling function
                const errorMessage = handleApiError(apiError, "submitting authorization");
                alert(`Error submitting authorization: ${errorMessage}`);
                setIsSubmitting(false);
            }
        }
        catch (error) {
            console.error("Error submitting Daman authorization:", error);
            alert(`Error: ${error.message || "An unexpected error occurred. Please try again."}`);
            if (onComplete)
                onComplete(false);
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
    const getStatusBadgeVariant = (status) => {
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
    const getStatusIcon = (status) => {
        switch (status) {
            case "approved":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "rejected":
                return _jsx(FileX, { className: "h-4 w-4 text-red-500" });
            case "additional-info":
                return _jsx(FileQuestion, { className: "h-4 w-4 text-amber-500" });
            case "in-review":
                return _jsx(FileSearch, { className: "h-4 w-4 text-blue-500" });
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-gray-500" });
            default:
                return _jsx(FileText, { className: "h-4 w-4" });
        }
    };
    // Register for webhook notifications for real-time status updates - Enhanced for Process 2: Authorization Submission and Tracking
    const registerForStatusNotifications = async (submissionId, referenceNumber) => {
        try {
            if (!isOffline) {
                // In a real implementation, this would register webhooks with Daman API
                console.log(`Registering for webhook notifications for submission ${submissionId}`);
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
        }
        catch (error) {
            console.error("Error registering for webhook notifications:", error);
            // Non-critical error, don't throw
        }
    };
    // Function to track submission status - Enhanced for Process 2: Authorization Submission and Tracking
    const trackSubmission = async (referenceNumber) => {
        try {
            setIsSubmitting(true);
            // Check if this is an offline submission
            if (referenceNumber.startsWith("OFFLINE-")) {
                // Find the submission in local history
                const submission = submissionHistory.find((s) => s.referenceNumber === referenceNumber);
                if (submission) {
                    // Update UI to show tracking information
                    setActiveTab("submission-tracking");
                    setIsSubmitting(false);
                }
                else {
                    alert(`Submission with reference number ${referenceNumber} not found.`);
                    setIsSubmitting(false);
                }
                return;
            }
            // For online submissions, get real-time status from API
            try {
                // Use the useDamanAuthorization hook to track the authorization
                const statusResponse = await trackAuthorization(referenceNumber);
                // Find the submission in history
                const existingSubmissionIndex = submissionHistory.findIndex((s) => s.referenceNumber === referenceNumber);
                if (existingSubmissionIndex >= 0) {
                    // Update the submission with latest status
                    const updatedHistory = [...submissionHistory];
                    updatedHistory[existingSubmissionIndex] = {
                        ...updatedHistory[existingSubmissionIndex],
                        status: statusResponse.status,
                        comments: statusResponse.comments ||
                            updatedHistory[existingSubmissionIndex].comments,
                        reviewer: statusResponse.reviewer ||
                            updatedHistory[existingSubmissionIndex].reviewer,
                        reviewDate: statusResponse.reviewDate ||
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
                            alert(`Tracking Information for ${referenceNumber}:\n\n` +
                                `Processing Stage: ${trackingInfo.processingStage}\n` +
                                `Assigned Reviewer: ${trackingInfo.assignedReviewer}\n` +
                                `Priority Level: ${trackingInfo.priorityLevel}\n` +
                                `Estimated Decision Date: ${new Date(trackingInfo.estimatedDecisionDate).toLocaleDateString()}\n` +
                                `Document Verification: ${trackingInfo.documentVerificationStatus}\n` +
                                `Clinical Review: ${trackingInfo.clinicalReviewStatus}\n` +
                                `Financial Review: ${trackingInfo.financialReviewStatus}\n\n` +
                                `For real-time updates, you can visit: ${trackingInfo.trackingUrl}`);
                        }, 500);
                    }
                    // If additional documents are required, notify the user
                    if (statusResponse.status === "additional-info" &&
                        statusResponse.requiredAdditionalDocuments?.length > 0) {
                        setTimeout(() => {
                            const docList = statusResponse.requiredAdditionalDocuments
                                .map((doc) => `- ${doc.name}: ${doc.description}`)
                                .join("\n");
                            alert(`Additional documents required for ${referenceNumber}:\n\n` +
                                `${docList}\n\n` +
                                `Please submit these documents by ${new Date(statusResponse.requiredAdditionalDocuments[0].deadline).toLocaleDateString()} ` +
                                `to avoid delays in processing.`);
                        }, 1000);
                    }
                }
                else {
                    // If not found in history, add it
                    const newSubmission = {
                        id: statusResponse.id,
                        referenceNumber,
                        submissionDate: statusResponse.submissionDate || new Date().toLocaleDateString(),
                        status: statusResponse.status,
                        comments: statusResponse.comments || "Status retrieved from Daman portal",
                        reviewer: statusResponse.reviewer || "Not assigned",
                        reviewDate: statusResponse.reviewDate,
                    };
                    setSubmissionHistory((prev) => [newSubmission, ...prev]);
                    setActiveTab("submission-tracking");
                }
            }
            catch (apiError) {
                // Handle API-specific errors
                const errorMessage = handleApiError(apiError, "tracking submission");
                alert(`Error tracking submission: ${errorMessage}`);
            }
            setIsSubmitting(false);
        }
        catch (error) {
            console.error("Error tracking submission:", error);
            alert(`Error tracking submission ${referenceNumber}: ${error.message || "Please try again."}`);
            setIsSubmitting(false);
        }
    };
    // Function to handle submission review process - Enhanced for Process 3: Authorization Status Management
    const handleReviewProcess = async (submissionId) => {
        try {
            setIsSubmitting(true);
            // Check if this is an offline submission
            if (submissionId.startsWith("offline-")) {
                // Find the submission in history
                const submission = submissionHistory.find((s) => s.id === submissionId);
                if (submission) {
                    // Switch to tracking tab and show details for this submission
                    setActiveTab("submission-tracking");
                    alert(`Offline submission ${submissionId} (${submission.referenceNumber}):\n\n` +
                        `Status: ${submission.status}\n` +
                        `Comments: ${submission.comments || "No comments"}\n\n` +
                        `This submission will be processed when your device reconnects to the internet.`);
                    setIsSubmitting(false);
                }
                else {
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
                const existingSubmissionIndex = submissionHistory.findIndex((s) => s.id === submissionId);
                if (existingSubmissionIndex >= 0) {
                    // Update the submission with latest details
                    const updatedHistory = [...submissionHistory];
                    updatedHistory[existingSubmissionIndex] = {
                        ...updatedHistory[existingSubmissionIndex],
                        status: detailsResponse.status,
                        comments: detailsResponse.comments ||
                            updatedHistory[existingSubmissionIndex].comments,
                        reviewer: detailsResponse.reviewer ||
                            updatedHistory[existingSubmissionIndex].reviewer,
                        reviewDate: detailsResponse.reviewDate ||
                            updatedHistory[existingSubmissionIndex].reviewDate,
                    };
                    setSubmissionHistory(updatedHistory);
                    setActiveTab("submission-tracking");
                    // Display detailed review information
                    const reviewTimeline = detailsResponse.reviewTimeline || [];
                    const timelineText = reviewTimeline.length > 0
                        ? reviewTimeline
                            .map((item) => `${new Date(item.timestamp).toLocaleString()}: ${item.action} - ${item.comment || "No comment"}`)
                            .join("\n")
                        : "No detailed timeline available";
                    // Enhanced alert with more detailed information based on status
                    if (detailsResponse.status === "approved" &&
                        detailsResponse.approvalDetails) {
                        const approval = detailsResponse.approvalDetails;
                        alert(`APPROVAL NOTIFICATION for ${detailsResponse.referenceNumber}\n\n` +
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
                            `IMPORTANT: Services can begin on ${new Date(approval.effectiveDate).toLocaleDateString()}`);
                    }
                    else if (detailsResponse.status === "rejected" &&
                        detailsResponse.rejectionDetails) {
                        const rejection = detailsResponse.rejectionDetails;
                        alert(`REJECTION NOTIFICATION for ${detailsResponse.referenceNumber}\n\n` +
                            `Rejection Code: ${rejection.rejectionCode}\n` +
                            `Rejection Date: ${new Date(rejection.rejectionDate).toLocaleDateString()}\n` +
                            `Rejected By: ${rejection.rejectedBy}\n\n` +
                            `Rejection Reasons:\n${rejection.rejectionReasons.map((reason) => `- ${reason}`).join("\n")}\n\n` +
                            `Appeal Process:\n` +
                            `- Appeal Deadline: ${new Date(rejection.appealProcess.appealDeadline).toLocaleDateString()}\n` +
                            `- Instructions: ${rejection.appealProcess.appealInstructions}\n\n` +
                            `Alternative Recommendations:\n${rejection.alternativeRecommendations.map((rec) => `- ${rec}`).join("\n")}`);
                    }
                    else {
                        // Standard review information for other statuses
                        alert(`Review process for submission ${submissionId} (${detailsResponse.referenceNumber}):\n\n` +
                            `Status: ${detailsResponse.status}\n` +
                            `Reviewer: ${detailsResponse.reviewer || "Not assigned"}\n` +
                            `Comments: ${detailsResponse.comments || "No comments"}\n` +
                            `Estimated Completion: ${new Date(detailsResponse.estimatedCompletionDate).toLocaleDateString()}\n\n` +
                            `Document Status:\n` +
                            `- Required: ${detailsResponse.documentStatus.totalRequired}\n` +
                            `- Uploaded: ${detailsResponse.documentStatus.totalUploaded}\n` +
                            `- Compliant: ${detailsResponse.documentStatus.compliant}\n` +
                            `- Non-Compliant: ${detailsResponse.documentStatus.nonCompliant}\n\n` +
                            `Timeline:\n${timelineText}`);
                    }
                    // Display next steps based on status management
                    if (detailsResponse.statusManagement?.nextSteps?.length > 0) {
                        setTimeout(() => {
                            const nextStepsText = detailsResponse.statusManagement.nextSteps
                                .map((step, i) => `${i + 1}. ${step}`)
                                .join("\n");
                            alert(`Next Steps for ${detailsResponse.referenceNumber}:\n\n${nextStepsText}\n\n` +
                                (detailsResponse.statusManagement.escalationOptions.available
                                    ? `Escalation Options Available:\n${detailsResponse.statusManagement.escalationOptions.escalationPath}`
                                    : "No escalation options available at this time."));
                        }, 500);
                    }
                }
                else {
                    alert(`Submission with ID ${submissionId} not found in the system.`);
                }
            }
            catch (apiError) {
                // Handle API-specific errors
                const errorMessage = handleApiError(apiError, "fetching review details");
                alert(`Error fetching review details: ${errorMessage}`);
            }
            setIsSubmitting(false);
        }
        catch (error) {
            console.error("Error fetching review details:", error);
            alert(`Error fetching review details for submission ${submissionId}: ${error.message || "Please try again."}`);
            setIsSubmitting(false);
        }
    };
    // Function to verify document compliance with DOH standards - Enhanced for Process 1 & 3
    const verifyDOHCompliance = (documentId, file) => {
        // In a real implementation, this would check document content against DOH standards
        // For this demo, we'll assume all documents are compliant if they exist
        if (!file)
            return false;
        // Mock implementation of DOH compliance checking
        // In a real implementation, this would analyze the document content
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        // Check file type compliance
        const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
        if (!allowedExtensions.includes(fileExtension || "")) {
            console.warn(`File ${file.name} has non-compliant extension: ${fileExtension}`);
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
    const handleAdditionalDocumentUpload = async (submissionId) => {
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
                    const target = e.target;
                    if (target.files && target.files.length > 0) {
                        setIsSubmitting(true);
                        // Process selected files
                        const files = Array.from(target.files);
                        const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
                        if (oversizedFiles.length > 0) {
                            alert(`${oversizedFiles.length} file(s) exceed the 5MB size limit and will be skipped.`);
                        }
                        const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
                        if (validFiles.length === 0) {
                            alert("No valid files selected. Please try again with smaller files.");
                            setIsSubmitting(false);
                            return;
                        }
                        // Check for DOH compliance of additional documents
                        const nonCompliantFiles = validFiles.filter((file) => !verifyDOHCompliance("additional-document", file));
                        if (nonCompliantFiles.length > 0) {
                            alert(`${nonCompliantFiles.length} file(s) do not meet DOH compliance standards and will be skipped. Please ensure all files are in the correct format and under 5MB.`);
                            // Filter out non-compliant files
                            const compliantFiles = validFiles.filter((file) => !nonCompliantFiles.includes(file));
                            if (compliantFiles.length === 0) {
                                alert("No compliant files to upload. Please try again with valid files.");
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
                                console.log("Storing additional documents in offline queue for submission:", submissionId, {
                                    files: validFiles.map((file) => ({
                                        name: file.name,
                                        size: file.size,
                                        type: file.type,
                                    })),
                                });
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
                                alert(`${validFiles.length} additional document(s) saved for later upload when online.\n\n` +
                                    `These documents will be automatically submitted when your device reconnects to the internet.`);
                            }
                            else {
                                // For online submissions, upload directly to API using the hook
                                const formData = new FormData();
                                validFiles.forEach((file, index) => {
                                    formData.append(`file${index}`, file);
                                });
                                // Use the useDamanAuthorization hook to upload additional documents
                                const response = await uploadAdditionalDocuments(submissionId, validFiles);
                                // Update submission status
                                const updatedHistory = submissionHistory.map((s) => {
                                    if (s.id === submissionId) {
                                        return {
                                            ...s,
                                            status: "in-review",
                                            comments: response.message ||
                                                `Additional documents received (${validFiles.length} file(s)), under review`,
                                            reviewDate: new Date().toLocaleDateString(),
                                        };
                                    }
                                    return s;
                                });
                                setSubmissionHistory(updatedHistory);
                                setIsSubmitting(false);
                                alert(`${validFiles.length} additional document(s) uploaded successfully.\n\n` +
                                    `Submission status updated to 'In Review'.\n` +
                                    `Estimated review completion: ${new Date(response.estimatedReviewCompletion).toLocaleDateString()}`);
                                // Register for status updates after uploading additional documents
                                await registerForStatusNotifications(submissionId, submission.referenceNumber);
                            }
                        }
                        catch (error) {
                            console.error("Error uploading additional documents:", error);
                            // Use the enhanced error handling function
                            const errorMessage = handleApiError(error, "uploading additional documents");
                            alert(`Error uploading additional documents: ${errorMessage}`);
                            setIsSubmitting(false);
                        }
                    }
                };
                // Trigger file selection dialog
                fileInput.click();
            }
            else {
                alert(`Cannot upload additional documents for this submission. Current status: ${submission?.status || "unknown"}.\n\n` +
                    `Additional documents can only be uploaded for submissions with 'Additional Info Required' status.`);
            }
        }
        catch (error) {
            console.error("Error uploading additional documents:", error);
            alert(`Error uploading additional documents: ${error.message || "Please try again."}`);
            setIsSubmitting(false);
        }
    };
    // Function to resubmit a rejected authorization - Enhanced for Process 3: Authorization Status Management
    const handleResubmit = async (submissionId) => {
        try {
            // Find the submission in history
            const submission = submissionHistory.find((s) => s.id === submissionId);
            if (submission && submission.status === "rejected") {
                // Check if this is an offline submission
                if (submissionId.startsWith("offline-")) {
                    alert(`Offline submission ${submission.referenceNumber} cannot be resubmitted until you're back online.`);
                    return;
                }
                // For online submissions, fetch previous submission data
                setIsSubmitting(true);
                try {
                    // Get previous submission details
                    const previousSubmission = await ApiService.getDamanAuthorizationDetails(submissionId);
                    // Reset the form for resubmission
                    setActiveTab("document-assembly");
                    handleReset();
                    // Pre-fill form with data from previous submission
                    form.reset({
                        clinicalJustification: previousSubmission.clinicalJustification || "",
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
                    alert("Please review and update the submission documents before resubmitting. Pay special attention to the documents that were previously rejected.");
                }
                catch (error) {
                    console.error("Error fetching previous submission data:", error);
                    // Still allow resubmission even if we can't get previous data
                    setActiveTab("document-assembly");
                    handleReset();
                    setIsSubmitting(false);
                    alert(`Could not retrieve previous submission data: ${error.message || "Unknown error"}. Please review and update the submission documents before resubmitting.`);
                }
            }
            else {
                alert(`Cannot resubmit this authorization. Current status: ${submission?.status || "unknown"}.`);
            }
        }
        catch (error) {
            console.error("Error preparing resubmission:", error);
            alert(`Error preparing resubmission: ${error.message || "Please try again."}`);
            setIsSubmitting(false);
        }
    };
    // Function to download approval letter - Enhanced for Process 3: Authorization Status Management
    const handleDownloadApproval = async (submissionId) => {
        try {
            // Find the submission in history
            const submission = submissionHistory.find((s) => s.id === submissionId);
            if (submission && submission.status === "approved") {
                // Check if this is an offline submission
                if (submissionId.startsWith("offline-")) {
                    alert(`Approval letter for offline submission ${submission.referenceNumber} will be available once you're back online.`);
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
                        billingInstructions: "Use authorization code with each claim submission",
                        documentationRequirements: "Daily progress notes required",
                        providerDetails: {
                            name: "Reyada Homecare",
                            licenseNumber: "DOH-HC-2023-001",
                            address: "Abu Dhabi, UAE",
                            contactNumber: "+971-2-123-4567",
                        },
                        legalDisclaimer: "This authorization is subject to patient eligibility at the time of service and the terms of the member's plan.",
                    };
                    // Mock PDF generation for demonstration with enhanced details
                    alert(`DAMAN PRIOR AUTHORIZATION APPROVAL\n` +
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
                            .map(([service, freq]) => `- ${service.charAt(0).toUpperCase() + service.slice(1)}: ${freq}`)
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
                        `===============================`);
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
                }
                catch (apiError) {
                    // Handle API-specific errors
                    const errorMessage = handleApiError(apiError, "downloading approval letter");
                    alert(`Error downloading approval letter: ${errorMessage}`);
                }
            }
            else {
                alert(`Cannot download approval letter. Current status: ${submission?.status || "unknown"}.`);
            }
        }
        catch (error) {
            console.error("Error downloading approval letter:", error);
            alert(`Error downloading approval letter: ${error.message || "Please try again."}`);
        }
    };
    return (_jsx("div", { className: "w-full bg-background", children: submissionSuccess ? (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-xl text-center text-green-600", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-2" }), "Daman Prior Authorization Submission Complete"] }), _jsxs(CardDescription, { className: "text-center", children: ["Your authorization request has been successfully", " ", isOffline ? "saved for later submission" : "submitted to Daman"] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "bg-muted p-4 rounded-md", children: [_jsx("p", { className: "font-medium", children: "Submission Reference:" }), _jsxs("p", { className: "text-sm", children: [isOffline ? "OFFLINE-" : "", "REF-", Math.random().toString(36).substring(2, 10).toUpperCase()] }), _jsx("p", { className: "font-medium mt-2", children: "Submission Date:" }), _jsx("p", { className: "text-sm", children: new Date().toLocaleDateString() })] }), _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: isOffline
                                    ? "This submission will be processed when your device reconnects to the internet."
                                    : "You will receive a notification when Daman processes this authorization request." }) })] }), _jsx(CardFooter, { className: "flex justify-center", children: _jsx(Button, { onClick: handleReset, children: "Submit Another Authorization" }) })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Daman Prior Authorization" }), _jsx("p", { className: "text-muted-foreground", children: "Prepare and submit authorization request to Daman insurance" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "outline", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Patient ID: ", patientId] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Episode: ", episodeId] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "document-assembly", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Document Assembly"] }), _jsxs(TabsTrigger, { value: "digital-signatures", children: [_jsx(FileCheck, { className: "h-4 w-4 mr-2" }), "Digital Signatures"] }), _jsxs(TabsTrigger, { value: "submission-tracking", children: [_jsx(FileSearch, { className: "h-4 w-4 mr-2" }), "Submission Tracking"] }), _jsxs(TabsTrigger, { value: "submission-history", children: [_jsx(History, { className: "h-4 w-4 mr-2" }), "Submission History"] })] }), _jsx(TabsContent, { value: "document-assembly", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-3 mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Clinical Justification" }), _jsx(CardDescription, { children: "Provide clinical justification for the requested services" })] }), _jsx(CardContent, { children: _jsx(Form, { ...form, children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "requestedServices", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Requested Services" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "nursing", checked: field.value?.includes("nursing"), onCheckedChange: (checked) => {
                                                                                                        const current = field.value || [];
                                                                                                        if (checked) {
                                                                                                            field.onChange([
                                                                                                                ...current,
                                                                                                                "nursing",
                                                                                                            ]);
                                                                                                        }
                                                                                                        else {
                                                                                                            field.onChange(current.filter((item) => item !== "nursing"));
                                                                                                        }
                                                                                                    } }), _jsx(Label, { htmlFor: "nursing", children: "Nursing Care" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "physiotherapy", checked: field.value?.includes("physiotherapy"), onCheckedChange: (checked) => {
                                                                                                        const current = field.value || [];
                                                                                                        if (checked) {
                                                                                                            field.onChange([
                                                                                                                ...current,
                                                                                                                "physiotherapy",
                                                                                                            ]);
                                                                                                        }
                                                                                                        else {
                                                                                                            field.onChange(current.filter((item) => item !== "physiotherapy"));
                                                                                                        }
                                                                                                    } }), _jsx(Label, { htmlFor: "physiotherapy", children: "Physiotherapy" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "occupational-therapy", checked: field.value?.includes("occupational-therapy"), onCheckedChange: (checked) => {
                                                                                                        const current = field.value || [];
                                                                                                        if (checked) {
                                                                                                            field.onChange([
                                                                                                                ...current,
                                                                                                                "occupational-therapy",
                                                                                                            ]);
                                                                                                        }
                                                                                                        else {
                                                                                                            field.onChange(current.filter((item) => item !== "occupational-therapy"));
                                                                                                        }
                                                                                                    } }), _jsx(Label, { htmlFor: "occupational-therapy", children: "Occupational Therapy" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "respiratory-therapy", checked: field.value?.includes("respiratory-therapy"), onCheckedChange: (checked) => {
                                                                                                        const current = field.value || [];
                                                                                                        if (checked) {
                                                                                                            field.onChange([
                                                                                                                ...current,
                                                                                                                "respiratory-therapy",
                                                                                                            ]);
                                                                                                        }
                                                                                                        else {
                                                                                                            field.onChange(current.filter((item) => item !== "respiratory-therapy"));
                                                                                                        }
                                                                                                    } }), _jsx(Label, { htmlFor: "respiratory-therapy", children: "Respiratory Therapy" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "equipment", checked: field.value?.includes("equipment"), onCheckedChange: (checked) => {
                                                                                                        const current = field.value || [];
                                                                                                        if (checked) {
                                                                                                            field.onChange([
                                                                                                                ...current,
                                                                                                                "equipment",
                                                                                                            ]);
                                                                                                        }
                                                                                                        else {
                                                                                                            field.onChange(current.filter((item) => item !== "equipment"));
                                                                                                        }
                                                                                                    } }), _jsx(Label, { htmlFor: "equipment", children: "Medical Equipment" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "requestedDuration", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Requested Duration (days)" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value.toString(), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select duration" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7", children: "7 days" }), _jsx(SelectItem, { value: "14", children: "14 days" }), _jsx(SelectItem, { value: "30", children: "30 days" }), _jsx(SelectItem, { value: "60", children: "60 days" }), _jsx(SelectItem, { value: "90", children: "90 days" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "urgencyLevel", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Urgency Level" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select urgency level" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "standard", children: "Standard (5-7 business days)" }), _jsx(SelectItem, { value: "urgent", children: "Urgent (24-48 hours)" }), _jsx(SelectItem, { value: "emergency", children: "Emergency (Same day)" })] })] }), _jsx(FormMessage, {})] })) })] }), _jsx("div", { children: _jsx(FormField, { control: form.control, name: "clinicalJustification", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Clinical Justification" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Provide detailed clinical justification for the requested services", className: "min-h-[200px]", ...field }) }), _jsx(FormDescription, { children: "Include patient's diagnosis, functional limitations, and expected outcomes" }), _jsx(FormMessage, {})] })) }) })] }) }) })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Document Assembly" }), _jsxs(Badge, { variant: "outline", children: [submissionProgress, "% Complete"] })] }), _jsx(CardDescription, { children: "Upload all required documents for Daman prior authorization submission" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[500px] pr-4", children: _jsx("div", { className: "space-y-6", children: documents.map((doc) => (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-muted p-2 rounded-md", children: doc.icon }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: doc.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: doc.description })] })] }), _jsx(Badge, { variant: doc.required ? "default" : "outline", className: "text-xs", children: doc.required ? "Required" : "Optional" })] }), _jsxs("div", { className: "mt-4 flex flex-col space-y-2", children: [doc.uploaded ? (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center text-green-600 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Document uploaded"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                                // In a real implementation, this would preview the document
                                                                                                if (doc.file) {
                                                                                                    const url = URL.createObjectURL(doc.file);
                                                                                                    window.open(url, "_blank");
                                                                                                }
                                                                                                else {
                                                                                                    alert("Preview not available for this document");
                                                                                                }
                                                                                            }, children: "Preview" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDocumentUpload(doc.id), children: "Replace" })] })] })) : (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: doc.required
                                                                                        ? "Required document"
                                                                                        : "Optional document" }), _jsxs(Button, { variant: "default", size: "sm", onClick: () => handleDocumentUpload(doc.id), children: [_jsx(Upload, { className: "h-4 w-4 mr-1" }), "Upload"] })] })), doc.uploaded && doc.file && (_jsxs("div", { className: "bg-muted rounded p-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: doc.file.name }), _jsxs("span", { children: [(doc.fileSize / 1024).toFixed(1), " KB"] })] }), _jsxs("div", { className: "flex justify-between text-muted-foreground mt-1", children: [_jsxs("span", { children: ["Uploaded:", " ", new Date(doc.uploadDate).toLocaleString()] }), _jsxs("span", { children: ["Type: ", doc.fileType] })] })] }))] })] }, doc.id))) }) }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", onClick: handleReset, children: "Reset" }), _jsx(Button, { onClick: handleSubmit, disabled: isSubmitting || submissionProgress < 100, children: isSubmitting
                                                            ? "Submitting..."
                                                            : isOffline
                                                                ? "Save for Later"
                                                                : "Submit to Daman" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Submission Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-2 w-full bg-muted rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary", style: { width: `${submissionProgress}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: [submissionProgress, "% Complete"] }), _jsxs("span", { children: [100 - submissionProgress, "% Remaining"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: "Required Documents" })] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [documents.filter((d) => d.required && d.uploaded).length, "/", documents.filter((d) => d.required).length] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: "Optional Documents" })] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [documents.filter((d) => !d.required && d.uploaded).length, "/", documents.filter((d) => !d.required).length] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Submission Checklist" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "check-patient-info", checked: true }), _jsx(Label, { htmlFor: "check-patient-info", className: "text-sm", children: "Patient Information Verified" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "check-insurance", checked: true }), _jsx(Label, { htmlFor: "check-insurance", className: "text-sm", children: "Insurance Details Confirmed" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "check-documents", checked: submissionProgress === 100 }), _jsx(Label, { htmlFor: "check-documents", className: "text-sm", children: "All Required Documents Uploaded" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "check-signatures", checked: false }), _jsx(Label, { htmlFor: "check-signatures", className: "text-sm", children: "All Signatures Obtained" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: "check-review", checked: false }), _jsx(Label, { htmlFor: "check-review", className: "text-sm", children: "Final Review Completed" })] }), _jsx(Separator, { className: "my-2" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "All checklist items must be completed before submission" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Submission Guidelines" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("p", { children: "\u2022 Accepted formats: PDF, DOC, DOCX, JPG, PNG" }), _jsx("p", { children: "\u2022 Maximum file size: 5MB per document" }), _jsx("p", { children: "\u2022 Patient identifiers must be visible" }), _jsx("p", { children: "\u2022 Medical reports must be dated within 30 days" }), _jsx("p", { children: "\u2022 All forms must have required signatures" }), _jsx("p", { children: "\u2022 Ensure all documents are clear and legible" }), _jsx("p", { children: "\u2022 Documents must comply with DOH standards" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "For assistance, contact the Insurance Coding Department at ext. 4567" })] }) })] })] })] }) }), _jsx(TabsContent, { value: "digital-signatures", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Digital Signatures" }), _jsx(CardDescription, { children: "Collect required digital signatures for Daman prior authorization submission" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Patient Signature" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patient-name", children: "Patient Name" }), _jsx(Input, { id: "patient-name", value: patientDetails.name, readOnly: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patient-emirates-id", children: "Emirates ID" }), _jsx(Input, { id: "patient-emirates-id", value: patientDetails.emiratesId, readOnly: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patient-signature-date", children: "Signature Date" }), _jsx(Input, { id: "patient-signature-date", type: "date", value: digitalSignatures.patientSignatureDate || "", onChange: (e) => setDigitalSignatures((prev) => ({
                                                                        ...prev,
                                                                        patientSignatureDate: e.target.value,
                                                                    })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patient-signature", children: "Patient Signature" }), _jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-md p-4 h-40 flex flex-col items-center justify-center", children: digitalSignatures.patientSignature ? (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center", children: [_jsxs("p", { className: "text-green-600 font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "Signature Captured"] }), _jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: ["Digitally signed by ", patientDetails.name, " on", " ", digitalSignatures.patientSignatureDate ||
                                                                                        new Date().toLocaleDateString()] }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: () => setDigitalSignatures((prev) => ({
                                                                                    ...prev,
                                                                                    patientSignature: "",
                                                                                    patientSignatureDate: "",
                                                                                })), children: "Clear Signature" })] })) : (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "No signature captured" }), _jsx(Button, { onClick: () => {
                                                                                    // In a real implementation, this would open a signature pad
                                                                                    // For this demo, we'll just set a placeholder value
                                                                                    setDigitalSignatures((prev) => ({
                                                                                        ...prev,
                                                                                        patientSignature: "data:image/png;base64,iVBORw0KGgoA...",
                                                                                        patientSignatureDate: new Date()
                                                                                            .toISOString()
                                                                                            .split("T")[0],
                                                                                    }));
                                                                                }, children: "Capture Signature" })] })) })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Provider Signature" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "provider-name", children: "Provider Name" }), _jsxs(Select, { value: digitalSignatures.providerSignature
                                                                                ? "signed"
                                                                                : "", onValueChange: (value) => {
                                                                                if (value === "signed") {
                                                                                    setDigitalSignatures((prev) => ({
                                                                                        ...prev,
                                                                                        providerSignature: "data:image/png;base64,iVBORw0KGgoA...",
                                                                                        providerSignatureDate: new Date()
                                                                                            .toISOString()
                                                                                            .split("T")[0],
                                                                                    }));
                                                                                }
                                                                            }, children: [_jsx(SelectTrigger, { id: "provider-name", children: _jsx(SelectValue, { placeholder: "Select provider" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "signed", children: "Dr. Ahmed Al Hashimi (Physician)" }), _jsx(SelectItem, { value: "other", children: "Dr. Fatima Al Zaabi (Specialist)" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "provider-signature-date", children: "Signature Date" }), _jsx(Input, { id: "provider-signature-date", type: "date", value: digitalSignatures.providerSignatureDate || "", onChange: (e) => setDigitalSignatures((prev) => ({
                                                                                ...prev,
                                                                                providerSignatureDate: e.target.value,
                                                                            })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "provider-signature", children: "Provider Signature" }), _jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-md p-4 h-40 flex flex-col items-center justify-center", children: digitalSignatures.providerSignature ? (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center", children: [_jsxs("p", { className: "text-green-600 font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "Signature Captured"] }), _jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: ["Digitally signed by Dr. Ahmed Al Hashimi on", " ", digitalSignatures.providerSignatureDate ||
                                                                                        new Date().toLocaleDateString()] }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: () => setDigitalSignatures((prev) => ({
                                                                                    ...prev,
                                                                                    providerSignature: "",
                                                                                    providerSignatureDate: "",
                                                                                })), children: "Clear Signature" })] })) : (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "No signature captured" }), _jsx(Button, { onClick: () => {
                                                                                    // In a real implementation, this would open a signature pad
                                                                                    setDigitalSignatures((prev) => ({
                                                                                        ...prev,
                                                                                        providerSignature: "data:image/png;base64,iVBORw0KGgoA...",
                                                                                        providerSignatureDate: new Date()
                                                                                            .toISOString()
                                                                                            .split("T")[0],
                                                                                    }));
                                                                                }, children: "Capture Signature" })] })) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "provider-attestation", children: "Provider Attestation" }), _jsx("div", { className: "bg-muted p-4 rounded-md", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "provider-attestation", checked: digitalSignatures.providerSignature !== "", onCheckedChange: (checked) => {
                                                                                            if (checked) {
                                                                                                setDigitalSignatures((prev) => ({
                                                                                                    ...prev,
                                                                                                    providerSignature: "data:image/png;base64,iVBORw0KGgoA...",
                                                                                                    providerSignatureDate: new Date()
                                                                                                        .toISOString()
                                                                                                        .split("T")[0],
                                                                                                }));
                                                                                            }
                                                                                            else {
                                                                                                setDigitalSignatures((prev) => ({
                                                                                                    ...prev,
                                                                                                    providerSignature: "",
                                                                                                    providerSignatureDate: "",
                                                                                                }));
                                                                                            }
                                                                                        } }), _jsx(Label, { htmlFor: "provider-attestation", className: "text-sm", children: "I attest that the information provided in this prior authorization request is accurate, complete, and medically necessary for the patient's care." })] }) })] })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Signature Requirements" }), _jsxs("ul", { className: "space-y-1 text-sm text-muted-foreground", children: [_jsx("li", { children: "\u2022 Both patient and provider signatures are required for submission" }), _jsx("li", { children: "\u2022 Digital signatures are compliant with DOH electronic signature requirements" }), _jsx("li", { children: "\u2022 Signatures are cryptographically secured and tamper-evident" }), _jsx("li", { children: "\u2022 Signature metadata includes timestamp and signer identity verification" })] })] })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Signature Requirements" }), _jsxs("ul", { className: "space-y-1 text-sm text-muted-foreground", children: [_jsx("li", { children: "\u2022 Both patient and provider signatures are required for submission" }), _jsx("li", { children: "\u2022 Digital signatures are compliant with DOH electronic signature requirements" }), _jsx("li", { children: "\u2022 Signatures are cryptographically secured and tamper-evident" }), _jsx("li", { children: "\u2022 Signature metadata includes timestamp and signer identity verification" })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setActiveTab("document-assembly"), children: "Back to Documents" }), _jsx(Button, { onClick: () => setActiveTab("submission-tracking"), children: "Continue to Submission" })] })] }) }), _jsx(TabsContent, { value: "submission-tracking", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Submission Tracking" }), _jsx(CardDescription, { children: "Track the status of your Daman prior authorization submissions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "tracking-reference", children: "Reference Number" }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(Input, { id: "tracking-reference", placeholder: "Enter reference number", defaultValue: "DAMAN-PA-2024-00456" }), _jsx(Button, { onClick: () => trackSubmission("DAMAN-PA-2024-00456"), children: "Track" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "tracking-status", children: "Current Status" }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [_jsx(FileSearch, { className: "h-5 w-5 text-blue-500" }), _jsx("span", { className: "font-medium", children: "In Review" }), _jsx(Badge, { variant: "secondary", className: "ml-2", children: "Updated 2 hours ago" })] })] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-md p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Bell, { className: "h-5 w-5 text-blue-500" }), _jsx("h4", { className: "font-medium", children: "Status Notifications" })] }), _jsx("p", { className: "text-sm mb-3", children: "Receive real-time notifications when your submission status changes" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "notify-email", defaultChecked: true }), _jsx(Label, { htmlFor: "notify-email", className: "text-sm", children: "Email Notifications" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "notify-sms", defaultChecked: true }), _jsx(Label, { htmlFor: "notify-sms", className: "text-sm", children: "SMS Notifications" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "notify-app", defaultChecked: true }), _jsx(Label, { htmlFor: "notify-app", className: "text-sm", children: "In-App Notifications" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Notify me when:" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "notify-status-change", defaultChecked: true }), _jsx(Label, { htmlFor: "notify-status-change", className: "text-sm", children: "Status Changes" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "notify-additional-info", defaultChecked: true }), _jsx(Label, { htmlFor: "notify-additional-info", className: "text-sm", children: "Additional Info Requested" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "notify-decision", defaultChecked: true }), _jsx(Label, { htmlFor: "notify-decision", className: "text-sm", children: "Final Decision Made" })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Submission Timeline" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-green-100 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }) }), _jsx("div", { className: "w-0.5 h-full bg-muted" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: "Submission Received" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "20 Feb 2024, 09:15" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Authorization request received by Daman" }), _jsxs("div", { className: "mt-2 bg-green-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-green-700", children: "Processing Details:" }), _jsx("p", { className: "text-green-600", children: "Submission validated and assigned tracking ID: SUB-12345. All required documents received." })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-green-100 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }) }), _jsx("div", { className: "w-0.5 h-full bg-muted" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: "Initial Verification" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "20 Feb 2024, 11:30" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Document verification completed" }), _jsxs("div", { className: "mt-2 bg-green-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-green-700", children: "Verification Results:" }), _jsx("p", { className: "text-green-600", children: "All 15 required documents verified. Patient eligibility confirmed. Submission passed to clinical review team." })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(FileSearch, { className: "h-4 w-4 text-blue-600" }) }), _jsx("div", { className: "w-0.5 h-full bg-muted" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: "Clinical Review" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "21 Feb 2024, 09:45" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Under review by Dr. Khalid Al Marzouqi" }), _jsxs("div", { className: "mt-2 bg-blue-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-blue-700", children: "Review Notes:" }), _jsx("p", { className: "text-blue-600", children: "Initial clinical assessment completed. Verifying medical necessity criteria and documentation completeness. Expected completion by EOD." })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "flex flex-col items-center", children: _jsx("div", { className: "h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center", children: _jsx(Clock, { className: "h-4 w-4 text-gray-600" }) }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium text-muted-foreground", children: "Decision" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "Pending" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Expected by 24 Feb 2024" }), _jsxs("div", { className: "mt-2 bg-gray-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-gray-700", children: "Next Steps:" }), _jsx("p", { className: "text-gray-600", children: "Clinical review \u2192 Financial review \u2192 Final decision. Estimated completion within 48 hours." })] })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Processing Details" }), _jsxs("div", { className: "bg-white border rounded-md p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Tracking ID:" }), _jsx("span", { className: "text-sm", children: "SUB-12345" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Priority Level:" }), _jsx("span", { className: "text-sm", children: "Standard" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Assigned Reviewer:" }), _jsx("span", { className: "text-sm", children: "Dr. Khalid Al Marzouqi" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Processing Stage:" }), _jsx("span", { className: "text-sm", children: "Clinical Review" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Est. Completion:" }), _jsx("span", { className: "text-sm", children: "24 Feb 2024" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last Updated:" }), _jsx("span", { className: "text-sm", children: "21 Feb 2024, 09:45" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Additional Information" }), _jsx("div", { className: "bg-amber-50 border border-amber-200 p-4 rounded-md", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-amber-500 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-amber-800 mb-1", children: "Additional Information May Be Required" }), _jsx("p", { className: "text-sm text-amber-700 mb-2", children: "Based on preliminary review, the following additional documents may be requested:" }), _jsxs("ul", { className: "text-sm text-amber-700 list-disc pl-5 space-y-1", children: [_jsx("li", { children: "Updated clinical progress notes from the last 7 days" }), _jsx("li", { children: "Recent vital signs monitoring records" }), _jsx("li", { children: "Detailed medication administration records" })] }), _jsx("p", { className: "text-sm text-amber-700 mt-2", children: "We recommend preparing these documents in advance to expedite the approval process if requested." })] })] }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Escalation Options" }), _jsxs("div", { className: "bg-gray-50 border rounded-md p-4", children: [_jsx("p", { className: "text-sm mb-3", children: "If you need to escalate this submission due to urgency or delays:" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Provider Relations:" }), _jsx("span", { className: "text-sm", children: "+971-2-614-9555" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Email:" }), _jsx("span", { className: "text-sm", children: "provider.relations@damanhealth.ae" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Reference:" }), _jsx("span", { className: "text-sm", children: "DAMAN-PA-2024-00456" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Escalation Criteria:" }), _jsx("span", { className: "text-sm", children: "Urgent medical necessity, 48+ hour delay" })] })] })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => {
                                                            // Find the most recent submission that needs additional info
                                                            const submission = submissionHistory.find((s) => s.status === "additional-info");
                                                            if (submission) {
                                                                handleAdditionalDocumentUpload(submission.id);
                                                            }
                                                            else {
                                                                alert("No submissions currently require additional documents.");
                                                            }
                                                        }, children: [_jsx(FileUp, { className: "h-4 w-4 mr-2" }), "Upload Additional Documents"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download Status Report"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(Bell, { className: "h-4 w-4 mr-2" }), "Set Alert"] }), _jsxs(Button, { children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Contact Reviewer"] })] })] })] }) }), _jsx(TabsContent, { value: "submission-history", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Submission History" }), _jsx(CardDescription, { children: "View and manage your previous authorization submissions" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[500px] pr-4", children: _jsx("div", { className: "space-y-4", children: submissionHistory.map((submission) => (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(submission.status), _jsx("h3", { className: "font-medium", children: submission.referenceNumber }), _jsx(Badge, { variant: "outline", children: submission.status === "approved"
                                                                                        ? "Approved"
                                                                                        : submission.status === "rejected"
                                                                                            ? "Rejected"
                                                                                            : submission.status === "additional-info"
                                                                                                ? "Additional Info Required"
                                                                                                : submission.status === "in-review"
                                                                                                    ? "In Review"
                                                                                                    : "Pending" })] }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["Submitted: ", submission.submissionDate, " | Reviewer: ", submission.reviewer] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleReviewProcess(submission.id), children: "View Details" }), _jsx(Button, { size: "sm", onClick: () => trackSubmission(submission.referenceNumber), children: "Track" })] })] }), _jsx("div", { className: "mt-3 bg-muted p-3 rounded-md", children: _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Comments: " }), submission.comments] }) }), _jsxs("div", { className: "mt-3 flex gap-2", children: [submission.status === "approved" && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownloadApproval(submission.id), children: [_jsx(FileCheck2, { className: "h-4 w-4 mr-1" }), "Download Approval"] })), submission.status === "rejected" && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleResubmit(submission.id), children: [_jsx(FileUp, { className: "h-4 w-4 mr-1" }), "Resubmit"] })), submission.status === "additional-info" && (_jsxs(Button, { size: "sm", onClick: () => handleAdditionalDocumentUpload(submission.id), children: [_jsx(FileUp, { className: "h-4 w-4 mr-1" }), "Upload Additional Info"] })), submission.status === "in-review" && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => trackSubmission(submission.referenceNumber), children: [_jsx(FileSearch, { className: "h-4 w-4 mr-1" }), "Track Status"] }))] })] }, submission.id))) }) }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", submissionHistory.length, " submissions from the last 90 days"] }), _jsxs(Button, { variant: "outline", children: [_jsx(BarChart, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }) })] })] })) }));
};
export default DamanSubmissionForm;
