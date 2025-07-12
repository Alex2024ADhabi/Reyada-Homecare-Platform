/**
 * Signature Workflow Hook
 * P3-002.4: Advanced Signature Workflow Management
 *
 * React hook for seamless signature workflow management with real-time
 * state tracking, user permission validation, and comprehensive error management.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  signatureWorkflowService,
  WorkflowConfiguration,
  WorkflowInstance,
  WorkflowStep,
  WorkflowSignature,
} from "@/services/signature-workflow.service";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";
import { SignatureData } from "@/components/ui/signature-capture";

export interface UseSignatureWorkflowOptions {
  workflowId: string;
  documentId: string;
  formData: any;
  patientId?: string;
  episodeId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  tags?: string[];
  autoStart?: boolean;
  enableRealTimeUpdates?: boolean;
}

export interface UseSignatureWorkflowReturn {
  // Workflow State
  workflow: WorkflowConfiguration | null;
  instance: WorkflowInstance | null;
  isLoading: boolean;
  error: string | null;

  // Progress Information
  progress: {
    totalSteps: number;
    completedSteps: number;
    pendingSteps: number;
    progressPercentage: number;
    currentStepInfo?: WorkflowStep;
    nextSteps: WorkflowStep[];
  };

  // User Permissions
  userPermissions: {
    canSignCurrentStep: boolean;
    canViewWorkflow: boolean;
    canCancelWorkflow: boolean;
    canEscalateWorkflow: boolean;
    availableSteps: WorkflowStep[];
  };

  // Workflow Actions
  startWorkflow: () => Promise<void>;
  completeStep: (
    stepId: string,
    signatureData: SignatureData,
    witnessData?: SignatureData,
  ) => Promise<void>;
  cancelWorkflow: (reason: string) => Promise<void>;
  escalateWorkflow: (stepId: string, reason: string) => Promise<void>;
  refreshWorkflow: () => Promise<void>;

  // Step Information
  getCurrentStep: () => WorkflowStep | null;
  getStepStatus: (stepId: string) => "pending" | "completed" | "not_applicable";
  isStepRequired: (stepId: string) => boolean;
  canCompleteStep: (stepId: string) => boolean;

  // Validation
  validateWorkflowCompletion: () => {
    isComplete: boolean;
    missingSteps: WorkflowStep[];
    errors: string[];
  };

  // Analytics
  getWorkflowAnalytics: () => Promise<any>;
}

export const useSignatureWorkflow = (
  options: UseSignatureWorkflowOptions,
): UseSignatureWorkflowReturn => {
  const { userProfile } = useSupabaseAuth();
  const { createSignature, generateDocumentHash } = useDigitalSignature();

  // State
  const [workflow, setWorkflow] = useState<WorkflowConfiguration | null>(null);
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    totalSteps: 0,
    completedSteps: 0,
    pendingSteps: 0,
    progressPercentage: 0,
    nextSteps: [] as WorkflowStep[],
  });

  // Initialize workflow
  useEffect(() => {
    const initializeWorkflow = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const workflowConfig = signatureWorkflowService.getWorkflow(
          options.workflowId,
        );
        if (!workflowConfig) {
          throw new Error(`Workflow ${options.workflowId} not found`);
        }

        setWorkflow(workflowConfig);

        if (options.autoStart !== false) {
          await startWorkflow();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize workflow",
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkflow();
  }, [options.workflowId, options.documentId]);

  // Update progress when instance changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!instance) {
        setProgress({
          totalSteps: 0,
          completedSteps: 0,
          pendingSteps: 0,
          progressPercentage: 0,
          nextSteps: [],
        });
        return;
      }

      try {
        const progressInfo = await signatureWorkflowService.getWorkflowProgress(
          instance.id,
        );
        setProgress(progressInfo);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    };

    updateProgress();
  }, [instance]);

  // Real-time updates (if enabled)
  useEffect(() => {
    if (!options.enableRealTimeUpdates || !instance) return;

    const interval = setInterval(async () => {
      try {
        const updatedInstance =
          await signatureWorkflowService.getWorkflowInstance(instance.id);
        if (
          updatedInstance &&
          updatedInstance.updatedAt !== instance.updatedAt
        ) {
          setInstance(updatedInstance);
        }
      } catch (err) {
        console.error("Failed to fetch real-time updates:", err);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [instance, options.enableRealTimeUpdates]);

  // User permissions
  const userPermissions = useMemo(() => {
    if (!workflow || !userProfile) {
      return {
        canSignCurrentStep: false,
        canViewWorkflow: false,
        canCancelWorkflow: false,
        canEscalateWorkflow: false,
        availableSteps: [],
      };
    }

    const userRole = userProfile.role;
    const availableSteps = workflow.steps.filter(
      (step) => step.signerRole === userRole || userRole === "admin",
    );

    const canSignCurrentStep = instance
      ? instance.pendingSteps.some((stepId) => {
          const step = workflow.steps.find((s) => s.id === stepId);
          return step && (step.signerRole === userRole || userRole === "admin");
        })
      : false;

    return {
      canSignCurrentStep,
      canViewWorkflow: true,
      canCancelWorkflow: userRole === "admin" || userRole === "supervisor",
      canEscalateWorkflow: userRole === "admin" || userRole === "supervisor",
      availableSteps,
    };
  }, [workflow, userProfile, instance]);

  // Start workflow
  const startWorkflow = useCallback(async () => {
    if (!workflow) {
      throw new Error("Workflow not initialized");
    }

    try {
      setIsLoading(true);
      setError(null);

      const newInstance = await signatureWorkflowService.createWorkflowInstance(
        options.workflowId,
        options.documentId,
        options.formData,
        {
          patientId: options.patientId,
          episodeId: options.episodeId,
          priority: options.priority,
          dueDate: options.dueDate,
          tags: options.tags,
        },
      );

      setInstance(newInstance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start workflow";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [workflow, options]);

  // Complete step
  const completeStep = useCallback(
    async (
      stepId: string,
      signatureData: SignatureData,
      witnessData?: SignatureData,
    ) => {
      if (!instance || !userProfile) {
        throw new Error("Workflow instance or user not available");
      }

      if (!canCompleteStep(stepId)) {
        throw new Error("User not authorized to complete this step");
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create digital signature
        const documentHash = generateDocumentHash(
          JSON.stringify({
            instanceId: instance.id,
            stepId,
            formData: options.formData,
            timestamp: Date.now(),
          }),
        );

        const signaturePayload = {
          documentId: `${instance.id}_${stepId}`,
          signerUserId: userProfile.id,
          signerName: userProfile.full_name,
          signerRole: userProfile.role,
          timestamp: Date.now(),
          documentHash,
          signatureType: "workflow_step" as const,
          metadata: {
            workflowId: instance.workflowId,
            instanceId: instance.id,
            stepId,
            formType: instance.metadata.formType,
          },
        };

        const digitalSignature = await createSignature(signaturePayload);

        // Create workflow signature
        const workflowSignature: WorkflowSignature = {
          stepId,
          signatureId: digitalSignature.id,
          signerUserId: userProfile.id,
          signerName: userProfile.full_name,
          signerRole: userProfile.role,
          signatureData,
          timestamp: new Date().toISOString(),
          witnessSignature: witnessData
            ? {
                witnessUserId: "witness_user", // This would come from witness selection
                witnessName: "Witness Name",
                witnessRole: "witness",
                witnessSignatureData: witnessData,
                timestamp: new Date().toISOString(),
              }
            : undefined,
        };

        // Complete the step
        const updatedInstance = await signatureWorkflowService.completeStep(
          instance.id,
          stepId,
          workflowSignature,
          userProfile.id,
          userProfile.full_name,
          userProfile.role,
        );

        setInstance(updatedInstance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to complete step";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      instance,
      userProfile,
      options.formData,
      createSignature,
      generateDocumentHash,
    ],
  );

  // Cancel workflow
  const cancelWorkflow = useCallback(
    async (reason: string) => {
      if (!instance || !userPermissions.canCancelWorkflow) {
        throw new Error("Not authorized to cancel workflow");
      }

      try {
        setIsLoading(true);
        setError(null);

        const updatedInstance =
          await signatureWorkflowService.updateWorkflowInstance(instance.id, {
            status: "cancelled",
            auditTrail: [
              ...instance.auditTrail,
              {
                id: `audit_${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: "workflow_cancelled",
                userId: userProfile?.id || "unknown",
                userName: userProfile?.full_name || "Unknown",
                userRole: userProfile?.role || "unknown",
                details: { reason },
              },
            ],
          });

        setInstance(updatedInstance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to cancel workflow";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [instance, userPermissions.canCancelWorkflow, userProfile],
  );

  // Escalate workflow
  const escalateWorkflow = useCallback(
    async (stepId: string, reason: string) => {
      if (!instance || !userPermissions.canEscalateWorkflow) {
        throw new Error("Not authorized to escalate workflow");
      }

      try {
        setIsLoading(true);
        setError(null);

        const updatedInstance =
          await signatureWorkflowService.updateWorkflowInstance(instance.id, {
            status: "escalated",
            auditTrail: [
              ...instance.auditTrail,
              {
                id: `audit_${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: "workflow_escalated",
                userId: userProfile?.id || "unknown",
                userName: userProfile?.full_name || "Unknown",
                userRole: userProfile?.role || "unknown",
                details: { stepId, reason },
              },
            ],
          });

        setInstance(updatedInstance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to escalate workflow";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [instance, userPermissions.canEscalateWorkflow, userProfile],
  );

  // Refresh workflow
  const refreshWorkflow = useCallback(async () => {
    if (!instance) return;

    try {
      setIsLoading(true);
      const updatedInstance =
        await signatureWorkflowService.getWorkflowInstance(instance.id);
      if (updatedInstance) {
        setInstance(updatedInstance);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh workflow",
      );
    } finally {
      setIsLoading(false);
    }
  }, [instance]);

  // Get current step
  const getCurrentStep = useCallback((): WorkflowStep | null => {
    if (!workflow || !instance || !instance.currentStep) return null;
    return (
      workflow.steps.find((step) => step.id === instance.currentStep) || null
    );
  }, [workflow, instance]);

  // Get step status
  const getStepStatus = useCallback(
    (stepId: string): "pending" | "completed" | "not_applicable" => {
      if (!instance) return "not_applicable";

      if (instance.completedSteps.includes(stepId)) return "completed";
      if (instance.pendingSteps.includes(stepId)) return "pending";
      return "not_applicable";
    },
    [instance],
  );

  // Check if step is required
  const isStepRequired = useCallback(
    (stepId: string): boolean => {
      if (!workflow) return false;
      const step = workflow.steps.find((s) => s.id === stepId);
      return step?.required || false;
    },
    [workflow],
  );

  // Check if user can complete step
  const canCompleteStep = useCallback(
    (stepId: string): boolean => {
      if (!workflow || !userProfile || !instance) return false;

      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) return false;

      const hasPermission =
        step.signerRole === userProfile.role || userProfile.role === "admin";
      const isStepPending = instance.pendingSteps.includes(stepId);

      return hasPermission && isStepPending;
    },
    [workflow, userProfile, instance],
  );

  // Validate workflow completion
  const validateWorkflowCompletion = useCallback(() => {
    if (!workflow || !instance) {
      return {
        isComplete: false,
        missingSteps: [],
        errors: ["Workflow not initialized"],
      };
    }

    const criticalSteps =
      workflow.completionCriteria.criticalStepsRequired || [];
    const missingCriticalSteps = criticalSteps.filter(
      (stepId) => !instance.completedSteps.includes(stepId),
    );

    const missingSteps = workflow.steps.filter(
      (step) => step.required && !instance.completedSteps.includes(step.id),
    );

    const errors: string[] = [];
    if (missingCriticalSteps.length > 0) {
      errors.push(`Missing critical steps: ${missingCriticalSteps.join(", ")}`);
    }

    const isComplete =
      missingCriticalSteps.length === 0 &&
      (workflow.completionCriteria.allStepsRequired
        ? missingSteps.length === 0
        : true);

    return {
      isComplete,
      missingSteps,
      errors,
    };
  }, [workflow, instance]);

  // Get workflow analytics
  const getWorkflowAnalytics = useCallback(async () => {
    if (!workflow) return null;
    return signatureWorkflowService.getWorkflowAnalytics(workflow.id);
  }, [workflow]);

  return {
    // State
    workflow,
    instance,
    isLoading,
    error,
    progress,
    userPermissions,

    // Actions
    startWorkflow,
    completeStep,
    cancelWorkflow,
    escalateWorkflow,
    refreshWorkflow,

    // Step Information
    getCurrentStep,
    getStepStatus,
    isStepRequired,
    canCompleteStep,

    // Validation
    validateWorkflowCompletion,

    // Analytics
    getWorkflowAnalytics,
  };
};

export default useSignatureWorkflow;
