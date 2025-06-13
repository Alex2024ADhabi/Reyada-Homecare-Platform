import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Mic, MicOff, Upload, Wifi, WifiOff, AlertCircle, Clock, FileText, Shield, } from "lucide-react";
import { mobileDamanIntegration } from "@/services/mobile-daman-integration.service";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { JsonValidator } from "@/utils/json-validator";
export const MobileDamanInterface = ({ patientId = "", serviceType = "", onSubmissionComplete, }) => {
    const [formData, setFormData] = useState({
        patientId,
        serviceType,
        clinicalJustification: "",
        providerId: "",
        urgencyLevel: "routine",
        estimatedDuration: 30,
        diagnosisCodes: [],
        treatmentPlan: "",
    });
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionProgress, setSubmissionProgress] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const { isOnline, isSyncing, pendingItems } = useOfflineSync();
    const { text: speechText, isListening, startListening, stopListening, hasRecognitionSupport, } = useSpeechRecognition({
        language: "en-US",
        continuous: true,
        interimResults: true,
    });
    // Update clinical justification with speech text
    useEffect(() => {
        if (speechText) {
            setFormData((prev) => ({
                ...prev,
                clinicalJustification: prev.clinicalJustification + " " + speechText,
            }));
        }
    }, [speechText]);
    const handleDocumentCapture = async (type) => {
        try {
            const attachment = await mobileDamanIntegration.captureDocument(type, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.8,
                format: "jpeg",
            });
            if (attachment) {
                setAttachments((prev) => [...prev, attachment]);
            }
        }
        catch (error) {
            console.error("Document capture failed:", error);
        }
    };
    const validateForm = () => {
        const errors = [];
        try {
            // Basic field validation
            if (!formData.patientId.trim()) {
                errors.push("Patient ID is required");
            }
            if (!formData.serviceType.trim()) {
                errors.push("Service type is required");
            }
            if (!formData.clinicalJustification.trim() ||
                formData.clinicalJustification.length < 100) {
                errors.push("Clinical justification must be at least 100 characters");
            }
            if (!formData.providerId.trim()) {
                errors.push("Provider ID is required");
            }
            if (attachments.length < 2) {
                errors.push("At least 2 supporting documents are required");
            }
            // JSON structure validation
            try {
                const jsonString = JsonValidator.safeStringify(formData);
                const validation = JsonValidator.validate(jsonString);
                if (!validation.isValid) {
                    errors.push("Form data contains invalid characters or structure");
                    console.error("Form validation JSON errors:", validation.errors);
                }
            }
            catch (jsonError) {
                errors.push("Form data structure is invalid");
                console.error("Form JSON validation error:", jsonError);
            }
            // Validate attachments structure
            try {
                attachments.forEach((attachment, index) => {
                    if (!attachment.filename || !attachment.type) {
                        errors.push(`Attachment ${index + 1} is missing required information`);
                    }
                });
            }
            catch (attachmentError) {
                errors.push("Attachment data is invalid");
                console.error("Attachment validation error:", attachmentError);
            }
        }
        catch (error) {
            errors.push("Form validation failed due to data structure issues");
            console.error("Form validation error:", error);
        }
        setValidationErrors(errors);
        return errors.length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        setSubmissionProgress(0);
        try {
            // Pre-submission data sanitization and validation
            let sanitizedFormData;
            let sanitizedAttachments;
            try {
                // Sanitize form data
                const formJsonString = JsonValidator.safeStringify(formData);
                const formValidation = JsonValidator.validate(formJsonString);
                if (!formValidation.isValid) {
                    throw new Error(`Form data validation failed: ${formValidation.errors?.join(", ")}`);
                }
                sanitizedFormData = formValidation.data || formData;
                // Sanitize attachments
                const attachmentsJsonString = JsonValidator.safeStringify(attachments);
                const attachmentsValidation = JsonValidator.validate(attachmentsJsonString);
                if (!attachmentsValidation.isValid) {
                    throw new Error(`Attachments validation failed: ${attachmentsValidation.errors?.join(", ")}`);
                }
                sanitizedAttachments = attachmentsValidation.data || attachments;
            }
            catch (sanitizationError) {
                console.error("Data sanitization failed:", sanitizationError);
                alert("Form data contains invalid characters. Please review and try again.");
                return;
            }
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setSubmissionProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);
            const result = await mobileDamanIntegration.submitMobileDamanForm(sanitizedFormData, sanitizedAttachments, {
                allowOffline: true,
                compressImages: true,
                validateBeforeSubmit: true,
            });
            clearInterval(progressInterval);
            setSubmissionProgress(100);
            if (result.success) {
                if (result.offlineStored) {
                    // Show offline success message
                    alert("Form saved offline. Will sync when connection is restored.");
                }
                else {
                    // Show online success message
                    alert("Form submitted successfully!");
                }
                if (onSubmissionComplete && result.submissionId) {
                    onSubmissionComplete(result.submissionId);
                }
                // Reset form
                setFormData({
                    patientId: "",
                    serviceType: "",
                    clinicalJustification: "",
                    providerId: "",
                    urgencyLevel: "routine",
                    estimatedDuration: 30,
                    diagnosisCodes: [],
                    treatmentPlan: "",
                });
                setAttachments([]);
                setCurrentStep(1);
            }
            else {
                const errorMessage = result.errors?.join(", ") || "Unknown error";
                alert(`Submission failed: ${errorMessage}`);
                console.error("Submission failed:", result.errors);
            }
        }
        catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            alert(`Submission failed: ${errorMessage}. Please try again.`);
        }
        finally {
            setIsSubmitting(false);
            setSubmissionProgress(0);
        }
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Patient ID *" }), _jsx(Input, { value: formData.patientId, onChange: (e) => setFormData((prev) => ({
                                        ...prev,
                                        patientId: e.target.value,
                                    })), placeholder: "Enter patient ID", className: "w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Service Type *" }), _jsx(Input, { value: formData.serviceType, onChange: (e) => setFormData((prev) => ({
                                        ...prev,
                                        serviceType: e.target.value,
                                    })), placeholder: "Enter service type", className: "w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Provider ID *" }), _jsx(Input, { value: formData.providerId, onChange: (e) => setFormData((prev) => ({
                                        ...prev,
                                        providerId: e.target.value,
                                    })), placeholder: "Enter provider ID", className: "w-full" })] })] }));
            case 2:
                return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { className: "block text-sm font-medium", children: "Clinical Justification *" }), hasRecognitionSupport && (_jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: isListening ? stopListening : startListening, className: "flex items-center gap-2", children: [isListening ? (_jsx(MicOff, { className: "h-4 w-4" })) : (_jsx(Mic, { className: "h-4 w-4" })), isListening ? "Stop" : "Voice"] }))] }), _jsx(Textarea, { value: formData.clinicalJustification, onChange: (e) => setFormData((prev) => ({
                                        ...prev,
                                        clinicalJustification: e.target.value,
                                    })), placeholder: "Provide detailed clinical justification (minimum 100 characters)", className: "w-full min-h-32", rows: 6 }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [formData.clinicalJustification.length, "/100 characters minimum"] }), isListening && (_jsxs(Alert, { className: "mt-2", children: [_jsx(Mic, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Listening... Speak clearly for medical terminology recognition." })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Treatment Plan" }), _jsx(Textarea, { value: formData.treatmentPlan, onChange: (e) => setFormData((prev) => ({
                                        ...prev,
                                        treatmentPlan: e.target.value,
                                    })), placeholder: "Describe the treatment plan", className: "w-full", rows: 4 })] })] }));
            case 3:
                return (_jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Supporting Documents *" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: () => handleDocumentCapture("camera"), className: "flex flex-col items-center p-4 h-auto", children: [_jsx(Camera, { className: "h-6 w-6 mb-2" }), _jsx("span", { className: "text-xs", children: "Camera" })] }), _jsxs(Button, { type: "button", variant: "outline", onClick: () => handleDocumentCapture("gallery"), className: "flex flex-col items-center p-4 h-auto", children: [_jsx(Upload, { className: "h-6 w-6 mb-2" }), _jsx("span", { className: "text-xs", children: "Gallery" })] }), _jsxs(Button, { type: "button", variant: "outline", onClick: () => handleDocumentCapture("document"), className: "flex flex-col items-center p-4 h-auto", children: [_jsx(FileText, { className: "h-6 w-6 mb-2" }), _jsx("span", { className: "text-xs", children: "Document" })] })] }), attachments.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "text-sm font-medium", children: ["Attached Documents (", attachments.length, ")"] }), attachments.map((attachment, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: attachment.filename }), _jsxs(Badge, { variant: "secondary", className: "text-xs", children: [(attachment.size / 1024).toFixed(1), "KB"] })] }), attachment.compressionApplied && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Compressed" }))] }, index)))] }))] }) }));
            case 4:
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Review Submission" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Patient ID:" }), _jsx("span", { className: "text-sm font-medium", children: formData.patientId })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Service Type:" }), _jsx("span", { className: "text-sm font-medium", children: formData.serviceType })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Provider ID:" }), _jsx("span", { className: "text-sm font-medium", children: formData.providerId })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Urgency Level:" }), _jsx(Badge, { variant: formData.urgencyLevel === "emergency"
                                                ? "destructive"
                                                : "secondary", children: formData.urgencyLevel })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Documents:" }), _jsxs("span", { className: "text-sm font-medium", children: [attachments.length, " attached"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Clinical Justification:" }), _jsx("p", { className: "text-sm mt-1 p-2 bg-gray-50 rounded max-h-20 overflow-y-auto", children: formData.clinicalJustification })] })] }), validationErrors.length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsx("ul", { className: "list-disc list-inside", children: validationErrors.map((error, index) => (_jsx("li", { children: error }, index))) }) })] }))] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-4 bg-white min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-6 w-6 text-blue-600" }), _jsx("h1", { className: "text-xl font-bold", children: "Daman Mobile" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [isOnline ? (_jsx(Wifi, { className: "h-5 w-5 text-green-600" })) : (_jsx(WifiOff, { className: "h-5 w-5 text-red-600" })), pendingItems.clinicalForms > 0 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [pendingItems.clinicalForms, " pending"] }))] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600 mb-2", children: [_jsxs("span", { children: ["Step ", currentStep, " of ", totalSteps] }), _jsxs("span", { children: [Math.round((currentStep / totalSteps) * 100), "%"] })] }), _jsx(Progress, { value: (currentStep / totalSteps) * 100, className: "h-2" })] }), !isOnline && (_jsxs(Alert, { className: "mb-4", children: [_jsx(WifiOff, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "You're offline. Forms will be saved locally and synced when connection is restored." })] })), isSyncing && (_jsxs(Alert, { className: "mb-4", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Syncing pending submissions..." })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg", children: [currentStep === 1 && "Patient Information", currentStep === 2 && "Clinical Details", currentStep === 3 && "Documentation", currentStep === 4 && "Review & Submit"] }), _jsxs(CardDescription, { children: [currentStep === 1 && "Enter basic patient and service information", currentStep === 2 &&
                                        "Provide clinical justification and treatment details", currentStep === 3 && "Attach supporting documents and images", currentStep === 4 && "Review all information before submission"] })] }), _jsx(CardContent, { children: renderStepContent() })] }), isSubmitting && (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Submitting..." }), _jsx(Progress, { value: submissionProgress, className: "h-2" }), _jsxs("div", { className: "text-xs text-gray-500", children: [submissionProgress, "%"] })] }) }) })), _jsxs("div", { className: "flex gap-2", children: [currentStep > 1 && (_jsx(Button, { variant: "outline", onClick: () => setCurrentStep((prev) => prev - 1), disabled: isSubmitting, className: "flex-1", children: "Previous" })), currentStep < totalSteps ? (_jsx(Button, { onClick: () => setCurrentStep((prev) => prev + 1), disabled: isSubmitting, className: "flex-1", children: "Next" })) : (_jsxs(Button, { onClick: handleSubmit, disabled: isSubmitting || validationErrors.length > 0, className: "flex-1", children: [isSubmitting ? "Submitting..." : "Submit", !isOnline && " (Offline)"] }))] })] }));
};
export default MobileDamanInterface;
