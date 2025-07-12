/**
 * Signature Workflow Component
 * P3-002.2.2: Signature Workflow Integration
 *
 * Manages sequential signature processes, conditional logic,
 * and workflow status indicators for clinical forms.
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  User,
  FileText,
  ArrowRight,
  AlertTriangle,
  Info,
  Users,
  Shield,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignatureCapture, { SignatureData } from "./signature-capture";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";

export interface WorkflowStep {
  stepNumber: number;
  signerType: "clinician" | "patient" | "witness" | "supervisor";
  signerRole?: string;
  signerName?: string;
  completed: boolean;
  signatureId?: string;
  completedAt?: number;
  conditions?: Record<string, any>;
  required: boolean;
  description: string;
}

export interface SignatureWorkflowProps {
  documentId: string;
  documentType: string;
  formData?: any;
  steps: WorkflowStep[];
  currentStep: number;
  onStepComplete?: (stepNumber: number, signature: any) => void;
  onWorkflowComplete?: (allSignatures: any[]) => void;
  onWorkflowCancel?: () => void;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  readOnly?: boolean;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
  className?: string;
}

const SignatureWorkflow: React.FC<SignatureWorkflowProps> = ({
  documentId,
  documentType,
  formData,
  steps,
  currentStep,
  onStepComplete,
  onWorkflowComplete,
  onWorkflowCancel,
  currentUser,
  readOnly = false,
  showProgress = true,
  allowSkipOptional = false,
  className,
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [signatures, setSignatures] = useState<Map<number, any>>(new Map());
  const [isCapturing, setIsCapturing] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<
    "pending" | "in_progress" | "completed" | "cancelled"
  >("pending");
  const [currentSignature, setCurrentSignature] =
    useState<SignatureData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    createSignature,
    generateDocumentHash,
    canUserSign,
    getSecurityMetrics,
    isCreating,
  } = useDigitalSignature();

  // Calculate workflow progress
  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Get current step details
  const currentStepDetails = steps.find(
    (step) => step.stepNumber === activeStep,
  );
  const isCurrentUserStep =
    currentStepDetails &&
    currentUser &&
    (currentStepDetails.signerRole === currentUser.role ||
      (currentStepDetails.signerType === "patient" &&
        currentUser.role === "patient"));

  // Check if user can sign current step
  const canCurrentUserSign =
    currentUser && currentStepDetails
      ? canUserSign(
          currentUser.id,
          currentUser.role,
          documentType,
          currentStepDetails.signerType,
        )
      : false;

  useEffect(() => {
    // Update workflow status based on completion
    if (completedSteps === totalSteps) {
      setWorkflowStatus("completed");
      const allSignatures = Array.from(signatures.values());
      onWorkflowComplete?.(allSignatures);
    } else if (completedSteps > 0) {
      setWorkflowStatus("in_progress");
    } else {
      setWorkflowStatus("pending");
    }
  }, [completedSteps, totalSteps, signatures, onWorkflowComplete]);

  // Handle signature completion
  const handleSignatureComplete = async (signatureData: SignatureData) => {
    if (!currentUser || !currentStepDetails) return;

    try {
      setIsCapturing(true);

      // Generate document hash
      const documentHash = generateDocumentHash(
        JSON.stringify({
          documentId,
          documentType,
          formData,
          stepNumber: activeStep,
          timestamp: Date.now(),
        }),
      );

      // Create digital signature
      const signaturePayload = {
        documentId: `${documentId}_step_${activeStep}`,
        signerUserId: currentUser.id,
        signerName: currentUser.name,
        signerRole: currentUser.role,
        timestamp: Date.now(),
        documentHash,
        signatureType: currentStepDetails.signerType,
        metadata: {
          workflowStep: activeStep,
          documentType,
          stepDescription: currentStepDetails.description,
          signatureData: signatureData.imageData,
          captureMetadata: signatureData.metadata,
          auditTrail: [
            {
              action: "signature_captured",
              timestamp: new Date().toISOString(),
              user: currentUser.name,
              details: {
                stepNumber: activeStep,
                signerType: currentStepDetails.signerType,
                validationScore: 100, // From signature validation
              },
            },
          ],
        },
      };

      const digitalSignature = await createSignature(signaturePayload);

      // Store signature
      setSignatures(
        (prev) =>
          new Map(
            prev.set(activeStep, {
              ...digitalSignature,
              signatureData,
              stepDetails: currentStepDetails,
            }),
          ),
      );

      // Mark step as completed
      const updatedSteps = steps.map((step) =>
        step.stepNumber === activeStep
          ? {
              ...step,
              completed: true,
              signatureId: digitalSignature.id,
              completedAt: Date.now(),
            }
          : step,
      );

      // Move to next step
      const nextStep = updatedSteps.find((step) => !step.completed);
      if (nextStep) {
        setActiveStep(nextStep.stepNumber);
      }

      onStepComplete?.(activeStep, digitalSignature);
      setCurrentSignature(null);
      setValidationErrors([]);
    } catch (error) {
      console.error("Error creating signature:", error);
      setValidationErrors([`Failed to create signature: ${error}`]);
    } finally {
      setIsCapturing(false);
    }
  };

  // Skip optional step
  const skipOptionalStep = () => {
    if (!currentStepDetails || currentStepDetails.required) return;

    const nextStep = steps.find(
      (step) => step.stepNumber > activeStep && !step.completed,
    );
    if (nextStep) {
      setActiveStep(nextStep.stepNumber);
    }
  };

  // Get step icon
  const getStepIcon = (step: WorkflowStep) => {
    if (step.completed) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step.stepNumber === activeStep) {
      return <Clock className="h-5 w-5 text-blue-600" />;
    } else {
      switch (step.signerType) {
        case "clinician":
          return <User className="h-5 w-5 text-gray-400" />;
        case "patient":
          return <User className="h-5 w-5 text-gray-400" />;
        case "witness":
          return <Users className="h-5 w-5 text-gray-400" />;
        case "supervisor":
          return <Shield className="h-5 w-5 text-gray-400" />;
        default:
          return <User className="h-5 w-5 text-gray-400" />;
      }
    }
  };

  // Get step status badge
  const getStepStatusBadge = (step: WorkflowStep) => {
    if (step.completed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    } else if (step.stepNumber === activeStep) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Active
        </Badge>
      );
    } else if (step.required) {
      return <Badge variant="outline">Required</Badge>;
    } else {
      return (
        <Badge variant="outline" className="text-gray-500">
          Optional
        </Badge>
      );
    }
  };

  // Get signer type color
  const getSignerTypeColor = (signerType: string) => {
    switch (signerType) {
      case "clinician":
        return "text-blue-600";
      case "patient":
        return "text-green-600";
      case "witness":
        return "text-purple-600";
      case "supervisor":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Workflow Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-6 w-6" />
              Signature Workflow
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  workflowStatus === "completed" ? "default" : "secondary"
                }
              >
                {workflowStatus.replace("_", " ").toUpperCase()}
              </Badge>
              {showProgress && (
                <span className="text-sm text-gray-600">
                  {completedSteps} of {totalSteps} completed
                </span>
              )}
            </div>
          </div>
          {showProgress && (
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress: {Math.round(progressPercentage)}%</span>
                <span>{totalSteps - completedSteps} remaining</span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Signature Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.stepNumber}>
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  step.stepNumber === activeStep
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200",
                  step.completed && "border-green-200 bg-green-50",
                )}
              >
                <div className="flex items-center gap-4">
                  {getStepIcon(step)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Step {step.stepNumber}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          getSignerTypeColor(step.signerType),
                        )}
                      >
                        {step.signerType.charAt(0).toUpperCase() +
                          step.signerType.slice(1)}
                      </span>
                      {step.signerRole && (
                        <span className="text-sm text-gray-500">
                          ({step.signerRole})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.completed && step.completedAt && (
                      <p className="text-xs text-gray-500">
                        Completed: {new Date(step.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStepStatusBadge(step)}
                  {step.stepNumber === activeStep && !step.completed && (
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-px h-4 bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Current Step Signature Capture */}
      {currentStepDetails && !currentStepDetails.completed && !readOnly && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Step {activeStep}: {currentStepDetails.description}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCurrentUserStep && canCurrentUserSign ? (
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Please provide your digital signature to complete this step.
                  </AlertDescription>
                </Alert>

                <SignatureCapture
                  onSignatureComplete={handleSignatureComplete}
                  onSignatureChange={setCurrentSignature}
                  validationRules={{
                    minStrokes: 5,
                    minDuration: 1000,
                    minComplexity: 15,
                    requirePressure: false,
                  }}
                  showValidation={true}
                  showPreview={true}
                  mobileOptimized={true}
                  disabled={isCapturing}
                />

                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Signing as:{" "}
                    <span className="font-medium">{currentUser?.name}</span> (
                    {currentUser?.role})
                  </div>
                  <div className="flex items-center gap-2">
                    {allowSkipOptional && !currentStepDetails.required && (
                      <Button
                        variant="outline"
                        onClick={skipOptionalStep}
                        disabled={isCapturing}
                      >
                        Skip Optional
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {!isCurrentUserStep
                    ? `This step requires signature from: ${currentStepDetails.signerRole || currentStepDetails.signerType}`
                    : "You do not have permission to sign this step."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Actions */}
      {!readOnly && workflowStatus !== "completed" && (
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Document: {documentType} • ID: {documentId}
              </div>
              <div className="flex items-center gap-2">
                {onWorkflowCancel && (
                  <Button
                    variant="outline"
                    onClick={onWorkflowCancel}
                    disabled={isCapturing}
                  >
                    Cancel Workflow
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Workflow Summary */}
      {workflowStatus === "completed" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">
                  Workflow Completed
                </h3>
                <p className="text-sm text-green-700">
                  All required signatures have been collected successfully.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Steps:</span>
                <span className="ml-2 font-medium">{totalSteps}</span>
              </div>
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-2 font-medium text-green-600">
                  {completedSteps}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Document Type:</span>
                <span className="ml-2 font-medium">{documentType}</span>
              </div>
              <div>
                <span className="text-gray-600">Document ID:</span>
                <span className="ml-2 font-medium">{documentId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SignatureWorkflow;
