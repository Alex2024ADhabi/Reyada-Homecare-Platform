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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Mic,
  MicOff,
  Upload,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  User,
  Shield,
} from "lucide-react";
import { mobileDamanIntegration } from "@/services/mobile-daman-integration.service";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { JsonValidator } from "@/utils/json-validator";

interface MobileDamanInterfaceProps {
  patientId?: string;
  serviceType?: string;
  onSubmissionComplete?: (submissionId: string) => void;
}

export const MobileDamanInterface: React.FC<MobileDamanInterfaceProps> = ({
  patientId = "",
  serviceType = "",
  onSubmissionComplete,
}) => {
  const [formData, setFormData] = useState({
    patientId,
    serviceType,
    clinicalJustification: "",
    providerId: "",
    urgencyLevel: "routine" as "routine" | "urgent" | "emergency",
    estimatedDuration: 30,
    diagnosisCodes: [] as string[],
    treatmentPlan: "",
  });

  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const { isOnline, isSyncing, pendingItems } = useOfflineSync();
  const {
    text: speechText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition({
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

  const handleDocumentCapture = async (
    type: "camera" | "gallery" | "document",
  ) => {
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
    } catch (error) {
      console.error("Document capture failed:", error);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    try {
      // Basic field validation
      if (!formData.patientId.trim()) {
        errors.push("Patient ID is required");
      }

      if (!formData.serviceType.trim()) {
        errors.push("Service type is required");
      }

      if (
        !formData.clinicalJustification.trim() ||
        formData.clinicalJustification.length < 100
      ) {
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
      } catch (jsonError) {
        errors.push("Form data structure is invalid");
        console.error("Form JSON validation error:", jsonError);
      }

      // Validate attachments structure
      try {
        attachments.forEach((attachment, index) => {
          if (!attachment.filename || !attachment.type) {
            errors.push(
              `Attachment ${index + 1} is missing required information`,
            );
          }
        });
      } catch (attachmentError) {
        errors.push("Attachment data is invalid");
        console.error("Attachment validation error:", attachmentError);
      }
    } catch (error) {
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
          throw new Error(
            `Form data validation failed: ${formValidation.errors?.join(", ")}`,
          );
        }

        sanitizedFormData = formValidation.data || formData;

        // Sanitize attachments
        const attachmentsJsonString = JsonValidator.safeStringify(attachments);
        const attachmentsValidation = JsonValidator.validate(
          attachmentsJsonString,
        );

        if (!attachmentsValidation.isValid) {
          throw new Error(
            `Attachments validation failed: ${attachmentsValidation.errors?.join(", ")}`,
          );
        }

        sanitizedAttachments = attachmentsValidation.data || attachments;
      } catch (sanitizationError) {
        console.error("Data sanitization failed:", sanitizationError);
        alert(
          "Form data contains invalid characters. Please review and try again.",
        );
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

      const result = await mobileDamanIntegration.submitMobileDamanForm(
        sanitizedFormData,
        sanitizedAttachments,
        {
          allowOffline: true,
          compressImages: true,
          validateBeforeSubmit: true,
        },
      );

      clearInterval(progressInterval);
      setSubmissionProgress(100);

      if (result.success) {
        if (result.offlineStored) {
          // Show offline success message
          alert("Form saved offline. Will sync when connection is restored.");
        } else {
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
      } else {
        const errorMessage = result.errors?.join(", ") || "Unknown error";
        alert(`Submission failed: ${errorMessage}`);
        console.error("Submission failed:", result.errors);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Submission failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Patient ID *
              </label>
              <Input
                value={formData.patientId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    patientId: e.target.value,
                  }))
                }
                placeholder="Enter patient ID"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Service Type *
              </label>
              <Input
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceType: e.target.value,
                  }))
                }
                placeholder="Enter service type"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Provider ID *
              </label>
              <Input
                value={formData.providerId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    providerId: e.target.value,
                  }))
                }
                placeholder="Enter provider ID"
                className="w-full"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Clinical Justification *
                </label>
                {hasRecognitionSupport && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className="flex items-center gap-2"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {isListening ? "Stop" : "Voice"}
                  </Button>
                )}
              </div>
              <Textarea
                value={formData.clinicalJustification}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    clinicalJustification: e.target.value,
                  }))
                }
                placeholder="Provide detailed clinical justification (minimum 100 characters)"
                className="w-full min-h-32"
                rows={6}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.clinicalJustification.length}/100 characters minimum
              </div>
              {isListening && (
                <Alert className="mt-2">
                  <Mic className="h-4 w-4" />
                  <AlertDescription>
                    Listening... Speak clearly for medical terminology
                    recognition.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Treatment Plan
              </label>
              <Textarea
                value={formData.treatmentPlan}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    treatmentPlan: e.target.value,
                  }))
                }
                placeholder="Describe the treatment plan"
                className="w-full"
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Supporting Documents *
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDocumentCapture("camera")}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Camera className="h-6 w-6 mb-2" />
                  <span className="text-xs">Camera</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDocumentCapture("gallery")}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-xs">Gallery</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDocumentCapture("document")}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-xs">Document</span>
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    Attached Documents ({attachments.length})
                  </h4>
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{attachment.filename}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(attachment.size / 1024).toFixed(1)}KB
                        </Badge>
                      </div>
                      {attachment.compressionApplied && (
                        <Badge variant="outline" className="text-xs">
                          Compressed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Submission</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Patient ID:</span>
                <span className="text-sm font-medium">
                  {formData.patientId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service Type:</span>
                <span className="text-sm font-medium">
                  {formData.serviceType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Provider ID:</span>
                <span className="text-sm font-medium">
                  {formData.providerId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Urgency Level:</span>
                <Badge
                  variant={
                    formData.urgencyLevel === "emergency"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {formData.urgencyLevel}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Documents:</span>
                <span className="text-sm font-medium">
                  {attachments.length} attached
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-600">
                  Clinical Justification:
                </span>
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded max-h-20 overflow-y-auto">
                  {formData.clinicalJustification}
                </p>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">Daman Mobile</h1>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}

          {pendingItems.clinicalForms > 0 && (
            <Badge variant="outline" className="text-xs">
              {pendingItems.clinicalForms} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Offline Status */}
      {!isOnline && (
        <Alert className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Forms will be saved locally and synced when
            connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Status */}
      {isSyncing && (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertDescription>Syncing pending submissions...</AlertDescription>
        </Alert>
      )}

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentStep === 1 && "Patient Information"}
            {currentStep === 2 && "Clinical Details"}
            {currentStep === 3 && "Documentation"}
            {currentStep === 4 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter basic patient and service information"}
            {currentStep === 2 &&
              "Provide clinical justification and treatment details"}
            {currentStep === 3 && "Attach supporting documents and images"}
            {currentStep === 4 && "Review all information before submission"}
          </CardDescription>
        </CardHeader>

        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Submission Progress */}
      {isSubmitting && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">Submitting...</div>
              <Progress value={submissionProgress} className="h-2" />
              <div className="text-xs text-gray-500">{submissionProgress}%</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Previous
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || validationErrors.length > 0}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
            {!isOnline && " (Offline)"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileDamanInterface;
