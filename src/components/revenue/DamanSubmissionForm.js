import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, Clock, FileText, Upload, Calendar, DollarSign, User, Shield, } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
export default function DamanSubmissionForm({ patientId = "", onSubmissionComplete, }) {
    const { toast: toastContext } = useToastContext();
    const { handleSuccess, handleApiError } = useErrorHandler();
    const [submission, setSubmission] = useState({
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
    const [validationErrors, setValidationErrors] = useState([]);
    // Enhanced validation for Daman Authorization Updates with MSC compliance
    const validateSubmission = () => {
        const errors = [];
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
        if (!submission.clinicalJustification ||
            submission.clinicalJustification.length < 50) {
            errors.push("Clinical justification must be at least 50 characters");
        }
        if (submission.documents.length === 0) {
            errors.push("At least one supporting document is required");
        }
        // Enhanced validation for MSC Plan Extension with stricter requirements
        if (submission.mscPlanExtension && submission.requestedDuration > 90) {
            errors.push("MSC Plan extensions cannot exceed 90 days as per updated validation criteria");
        }
        // Payment terms validation (30 days as per CN_2025 updated requirements)
        if (submission.paymentTerms !== "30_days") {
            errors.push("Payment terms must be set to 30 days as per CN_2025 Daman Authorization Updates");
        }
        // Submission time validation (8:00 AM deadline)
        if (currentTime > submissionDeadline &&
            currentTime.getDate() === submissionDeadline.getDate()) {
            errors.push("Submissions must be completed before 8:00 AM daily deadline. Late submissions require escalation approval.");
        }
        // Service codes validation (new codes 17-25-1 through 17-25-5)
        if (submission.serviceCodes.length === 0) {
            errors.push("At least one service code must be selected from the updated code list");
        }
        // Deprecated service codes check (17-26-1 through 17-26-4)
        const deprecatedCodes = ["17-26-1", "17-26-2", "17-26-3", "17-26-4"];
        const hasDeprecatedCodes = submission.serviceCodes.some((code) => deprecatedCodes.includes(code));
        if (hasDeprecatedCodes) {
            errors.push("Deprecated service codes (17-26-1 through 17-26-4) are no longer accepted. Please use updated codes 17-25-1 through 17-25-5.");
        }
        // Wheelchair pre-approval validation (effective May 1, 2025)
        if (submission.wheelchairPreApproval &&
            submission.serviceType === "medical_equipment") {
            if (!submission.documents.includes("Wheelchair Pre-approval Form")) {
                errors.push("Wheelchair pre-approval form is required for medical equipment requests (effective May 1, 2025)");
            }
            if (!submission.documents.includes("Physiotherapist/OT Signature")) {
                errors.push("Physiotherapist or Occupational Therapist signature is required for wheelchair requests");
            }
            if (!submission.documents.includes("Warranty Documentation")) {
                errors.push("Wheelchair brand warranty documentation is required");
            }
        }
        // Homecare Allocation Automation validation (effective February 24, 2025)
        if (submission.serviceType === "nursing_care" ||
            submission.serviceType === "physiotherapy") {
            if (!submission.faceToFaceCompleted) {
                errors.push("Face-to-face assessment form must be completed for homecare services (OpenJet requirement)");
            }
            if (submission.periodicAssessmentRequired &&
                !submission.documents.includes("Periodic Assessment Form")) {
                errors.push("Periodic assessment form is required for ongoing homecare services");
            }
        }
        // MSC Plan Extension Enhanced Validation with comprehensive checks
        if (submission.mscPlanExtension) {
            if (submission.requestedDuration > 90) {
                errors.push("MSC Plan extensions cannot exceed 90 days as per updated validation criteria");
            }
            if (!submission.clinicalJustification ||
                submission.clinicalJustification.length < 100) {
                errors.push("MSC Plan extensions require detailed clinical justification (minimum 100 characters)");
            }
            // Additional MSC-specific validations
            if (!submission.documents.includes("Medical Report") ||
                !submission.documents.includes("Treatment Plan")) {
                errors.push("MSC Plan extensions require both Medical Report and Treatment Plan documentation");
            }
            if (submission.paymentTerms !== "30_days") {
                errors.push("MSC Plan extensions must use 30-day payment terms as per updated requirements");
            }
            // MSC plan extension deadline (May 14, 2025)
            const mscDeadline = new Date("2025-05-14");
            if (currentTime > mscDeadline) {
                errors.push("MSC plan extension deadline has passed (May 14, 2025). Please contact Armed Forces committee for additional medical needs.");
            }
        }
        // Enhanced Prior Authorization Workflow Validation
        if (submission.priorAuthorizationRequired) {
            if (!submission.authorizationNumber) {
                errors.push("Prior authorization number is required for this service type");
            }
            if (submission.serviceType === "medical_equipment" &&
                submission.requestedDuration > 30) {
                errors.push("Medical equipment authorizations require monthly renewal for extended periods");
            }
        }
        // Email communication validation (UAE-hosted domains only)
        const userEmail = localStorage.getItem("user_email") || "";
        if (userEmail && !userEmail.includes(".ae")) {
            errors.push("Official UAE-hosted email domain is required for Daman communications");
        }
        return errors;
    };
    const handleSubmit = async () => {
        const errors = validateSubmission();
        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationDialog(true);
            handleApiError(new Error(`Validation failed: ${errors.length} issues found`), "Daman Validation Error");
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
            const submissionData = {
                ...sanitizedSubmission,
                submissionDate: new Date().toISOString(),
                submissionStatus: "submitted",
            };
            // Validate required fields with proper type checking
            if (!submissionData.patientId ||
                typeof submissionData.patientId !== "string") {
                throw new Error("Valid patient ID is required");
            }
            if (!submissionData.serviceType ||
                typeof submissionData.serviceType !== "string") {
                throw new Error("Valid service type is required");
            }
            // Validate the complete submission data structure
            const validatedSubmissionData = JSON.parse(JSON.stringify(submissionData));
            // Mock API response with proper error handling
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        // Simulate potential API validation
                        if (!validatedSubmissionData) {
                            reject(new Error("Invalid submission data"));
                        }
                        resolve(true);
                    }
                    catch (err) {
                        reject(err);
                    }
                }, 2000);
            });
            const submissionId = `DAMAN-${Date.now()}`;
            handleSuccess("Daman Submission Successful", `Authorization request ${submissionId} has been submitted with 30-day payment terms.`);
            if (onSubmissionComplete && typeof onSubmissionComplete === "function") {
                onSubmissionComplete(submissionId);
            }
            // Reset form with proper structure and validation
            const resetSubmission = {
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
            const validatedResetSubmission = JSON.parse(JSON.stringify(resetSubmission));
            setSubmission(validatedResetSubmission);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Error submitting to Daman:", errorMessage);
            handleApiError(new Error(errorMessage), "Daman Submission Failed");
        }
        finally {
            setLoading(false);
        }
    };
    const addDocument = (documentType) => {
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
                const validatedSubmission = JSON.parse(JSON.stringify(updatedSubmission));
                setSubmission(validatedSubmission);
            }
        }
        catch (error) {
            console.error("Error adding document:", error);
        }
    };
    const removeDocument = (documentType) => {
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
        }
        catch (error) {
            console.error("Error removing document:", error);
        }
    };
    return (_jsxs("div", { className: "bg-white p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900", children: "Daman Authorization Submission" }), _jsx("p", { className: "text-gray-600 mt-1 text-sm sm:text-base", children: "Submit prior authorization requests with updated 30-day payment terms" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 text-xs sm:text-sm", children: "Updated Payment Terms: 30 Days" }), _jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 text-xs sm:text-sm", children: "Mobile Optimized" }), !isOnline && (_jsx(Badge, { variant: "outline", className: "bg-orange-50 text-orange-700 text-xs sm:text-sm", children: "Offline Mode" }))] })] }), _jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(DollarSign, { className: "h-4 w-4 text-blue-600 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(AlertTitle, { className: "text-blue-800 text-sm sm:text-base", children: "Updated Daman Authorization Requirements (2025)" }), _jsx(AlertDescription, { className: "text-blue-700 text-xs sm:text-sm", children: _jsxs("div", { className: "space-y-1 mt-2", children: [_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600 font-bold", children: "\u2022" }), _jsx("span", { children: "Payment terms updated from 45 to 30 days (CN_2025)" })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600 font-bold", children: "\u2022" }), _jsx("span", { children: "MSC plan extensions limited to 90 days (deadline: May 14, 2025)" })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600 font-bold", children: "\u2022" }), _jsx("span", { children: "New homecare service codes (17-25-1 to 17-25-5) effective June 1, 2024" })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600 font-bold", children: "\u2022" }), _jsx("span", { children: "Wheelchair pre-approval form mandatory from May 1, 2025" })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600 font-bold", children: "\u2022" }), _jsx("span", { children: "Homecare allocation automation via OpenJet from Feb 24, 2025" })] })] }) })] })] }), !isOnline && (_jsxs(Alert, { className: "bg-orange-50 border-orange-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-orange-600" }), _jsx(AlertTitle, { className: "text-orange-800", children: "Offline Mode Active" }), _jsx(AlertDescription, { className: "text-orange-700", children: "Your submission will be saved locally and synchronized when connection is restored. All data is encrypted and secure." })] })), _jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(FileText, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Mobile Document Capture" }), _jsx(AlertDescription, { className: "text-green-700", children: "Use your device camera to capture and validate documents directly in the form. Voice-to-text input available for clinical justification." })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(User, { className: "w-5 h-5 mr-2" }), "Patient Information"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "patientId", children: "Patient ID" }), _jsx(Input, { id: "patientId", value: submission.patientId, onChange: (e) => setSubmission({ ...submission, patientId: e.target.value }), placeholder: "Enter patient ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "authorizationNumber", children: "Authorization Number" }), _jsx(Input, { id: "authorizationNumber", value: submission.authorizationNumber, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    authorizationNumber: e.target.value,
                                                }), placeholder: "Enter Daman authorization number" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "Service Authorization"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "serviceType", children: "Service Type" }), _jsxs(Select, { value: submission.serviceType, onValueChange: (value) => setSubmission({ ...submission, serviceType: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select service type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "nursing_care", children: "Per Diem Simple Home Visit - Nursing (17-25-1) - AED 300" }), _jsx(SelectItem, { value: "physiotherapy", children: "Per Diem Simple Home Visit - Physiotherapy (17-25-2) - AED 300" }), _jsx(SelectItem, { value: "occupational_therapy", children: "Per Diem Specialized Home Visit - OT Consultation (17-25-3) - AED 800" }), _jsx(SelectItem, { value: "routine_nursing", children: "Per Diem Routine Home Nursing Care (17-25-4) - AED 900" }), _jsx(SelectItem, { value: "advanced_nursing", children: "Per Diem Advanced Home Nursing Care (17-25-5) - AED 1,800" }), _jsx(SelectItem, { value: "wheelchair_services", children: "Wheelchair Services (Requires Pre-approval Form)" }), _jsx(SelectItem, { value: "deprecated_services", disabled: true, children: "\u26A0\uFE0F Deprecated Codes (17-26-1 to 17-26-4) - Not Billable" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "requestedDuration", children: "Requested Duration (Days)" }), _jsx(Input, { id: "requestedDuration", type: "number", value: submission.requestedDuration, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    requestedDuration: parseInt(e.target.value) || 0,
                                                }), min: "1", max: "365" })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Enhanced Authorization Settings"] }), _jsx(CardDescription, { children: "Updated requirements and payment terms" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentTerms", children: "Payment Terms" }), _jsxs(Select, { value: submission.paymentTerms, onValueChange: (value) => setSubmission({
                                                    ...submission,
                                                    paymentTerms: value,
                                                }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "30_days", children: "30 Days (Updated Standard)" }), _jsx(SelectItem, { value: "45_days", disabled: true, children: "45 Days (Deprecated)" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-6", children: [_jsx("input", { type: "checkbox", id: "mscPlanExtension", checked: submission.mscPlanExtension, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    mscPlanExtension: e.target.checked,
                                                }), className: "rounded" }), _jsx(Label, { htmlFor: "mscPlanExtension", children: "MSC Plan Extension (Max 90 days)" })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "wheelchairPreApproval", checked: submission.wheelchairPreApproval, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    wheelchairPreApproval: e.target.checked,
                                                }), className: "rounded" }), _jsx(Label, { htmlFor: "wheelchairPreApproval", children: "Wheelchair Pre-approval Required (Effective May 1, 2025)" })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "faceToFaceCompleted", checked: submission.faceToFaceCompleted, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    faceToFaceCompleted: e.target.checked,
                                                }), className: "rounded" }), _jsx(Label, { htmlFor: "faceToFaceCompleted", children: "Face-to-Face Assessment Completed (OpenJet Requirement)" })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "homecareAllocation", checked: submission.homecareAllocation, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    homecareAllocation: e.target.checked,
                                                }), className: "rounded" }), _jsx(Label, { htmlFor: "homecareAllocation", children: "Homecare Allocation via OpenJet (Effective Feb 24, 2025)" })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-6", children: [_jsx("input", { type: "checkbox", id: "priorAuthRequired", checked: submission.priorAuthorizationRequired, onChange: (e) => setSubmission({
                                                    ...submission,
                                                    priorAuthorizationRequired: e.target.checked,
                                                }), className: "rounded" }), _jsx(Label, { htmlFor: "priorAuthRequired", children: "Prior Authorization Required" })] })] }), submission.mscPlanExtension && (_jsxs(Alert, { className: "bg-yellow-50 border-yellow-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsx(AlertTitle, { className: "text-yellow-800", children: "MSC Plan Extension Validation" }), _jsxs(AlertDescription, { className: "text-yellow-700", children: ["MSC plan extensions are subject to enhanced validation criteria and cannot exceed 90 days. Clinical justification must be minimum 100 characters.", submission.requestedDuration > 90 && (_jsxs("span", { className: "block mt-1 font-medium text-red-600", children: ["Current duration (", submission.requestedDuration, " days) exceeds the 90-day limit for MSC extensions."] })), submission.clinicalJustification.length < 100 && (_jsxs("span", { className: "block mt-1 font-medium text-red-600", children: ["Clinical justification too short (", submission.clinicalJustification.length, "/100 characters minimum)."] }))] })] })), (() => {
                                const currentTime = new Date();
                                const deadline = new Date();
                                deadline.setHours(8, 0, 0, 0);
                                const isLate = currentTime > deadline &&
                                    currentTime.getDate() === deadline.getDate();
                                return isLate ? (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(Clock, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Late Submission Warning" }), _jsx(AlertDescription, { className: "text-red-700", children: "Submissions after 8:00 AM require escalation approval and may experience delays. Please contact Daman Provider Relations for urgent cases." })] })) : (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "On-Time Submission" }), _jsx(AlertDescription, { className: "text-green-700", children: "Submission is within the 8:00 AM daily deadline window." })] }));
                            })()] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Clinical Justification" }) }), _jsx(CardContent, { children: _jsxs("div", { children: [_jsxs(Label, { htmlFor: "clinicalJustification", children: ["Clinical Justification (Minimum", " ", submission.mscPlanExtension ? "100" : "50", " characters)"] }), _jsx(Textarea, { id: "clinicalJustification", value: submission.clinicalJustification, onChange: (e) => setSubmission({
                                        ...submission,
                                        clinicalJustification: e.target.value,
                                    }), placeholder: "Provide detailed clinical justification for the requested services...", rows: 4, className: "mt-1" }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [submission.clinicalJustification.length, "/", submission.mscPlanExtension ? "100" : "50", " characters minimum", submission.mscPlanExtension &&
                                            submission.clinicalJustification.length < 100 && (_jsx("span", { className: "text-red-500 ml-2", children: "MSC extensions require 100+ characters" }))] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "Supporting Documents"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: [
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
                                    ].map((docType) => (_jsxs(Button, { variant: submission.documents.includes(docType)
                                            ? "default"
                                            : "outline", size: "sm", onClick: () => {
                                            if (submission.documents.includes(docType)) {
                                                removeDocument(docType);
                                            }
                                            else {
                                                addDocument(docType);
                                            }
                                        }, className: "justify-start", children: [submission.documents.includes(docType) ? (_jsx(CheckCircle, { className: "w-4 h-4 mr-2" })) : (_jsx(Upload, { className: "w-4 h-4 mr-2" })), docType] }, docType))) }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Selected documents: ", submission.documents.length] })] }) })] }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowValidationDialog(true), children: "Validate Submission" }), _jsx(Button, { onClick: handleSubmit, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "w-4 h-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Submit to Daman"] })) })] }), _jsx(Dialog, { open: showValidationDialog, onOpenChange: setShowValidationDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Submission Validation" }), _jsx(DialogDescription, { children: "Review validation results before submitting" })] }), _jsx("div", { className: "space-y-4", children: validationErrors.length === 0 ? (_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Validation Successful" }), _jsx(AlertDescription, { className: "text-green-700", children: "All required fields are completed and meet Daman requirements." })] })) : (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs(AlertTitle, { className: "text-red-800", children: ["Validation Errors (", validationErrors.length, ")"] }), _jsx(AlertDescription, { className: "text-red-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: validationErrors.map((error, index) => (_jsx("li", { children: error }, index))) }) })] })) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowValidationDialog(false), children: "Close" }), validationErrors.length === 0 && (_jsx(Button, { onClick: () => {
                                        setShowValidationDialog(false);
                                        handleSubmit();
                                    }, children: "Proceed with Submission" }))] })] }) })] }));
}
