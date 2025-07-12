/**
 * Signature Workflow Service
 * P3-002.4: Advanced Signature Workflow Management
 *
 * Manages complex signature workflows, conditional logic, and audit trails
 * for different clinical scenarios with comprehensive validation and tracking.
 */

import { SignatureData } from "@/components/ui/signature-capture";
import { signatureAuditService } from "@/services/signature-audit.service";

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  signerRole: string;
  required: boolean;
  conditional?: {
    field: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "greater_than"
      | "less_than";
    value: any;
  };
  dependencies?: string[]; // Step IDs that must be completed first
  escalation?: {
    timeoutHours: number;
    escalateTo: string;
    notificationMessage: string;
  };
  witnessRequired?: boolean;
  biometricRequired?: boolean;
  locationRequired?: boolean;
}

export interface WorkflowConfiguration {
  id: string;
  name: string;
  description: string;
  formType: string;
  steps: WorkflowStep[];
  parallelSteps?: string[][]; // Groups of steps that can be completed in parallel
  completionCriteria: {
    allStepsRequired: boolean;
    minimumStepsRequired?: number;
    criticalStepsRequired?: string[];
  };
  escalationRules: {
    timeoutHours: number;
    escalationChain: string[];
    autoEscalate: boolean;
  };
  auditRequirements: {
    fullAuditTrail: boolean;
    retentionPeriodYears: number;
    complianceStandards: string[];
  };
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  documentId: string;
  patientId?: string;
  episodeId?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "escalated";
  currentStep: string;
  completedSteps: string[];
  pendingSteps: string[];
  signatures: WorkflowSignature[];
  metadata: {
    formType: string;
    formData: any;
    priority: "low" | "medium" | "high" | "critical";
    dueDate?: string;
    tags?: string[];
  };
  auditTrail: WorkflowAuditEntry[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WorkflowSignature {
  stepId: string;
  signatureId: string;
  signerUserId: string;
  signerName: string;
  signerRole: string;
  signatureData: SignatureData;
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: any;
  witnessSignature?: {
    witnessUserId: string;
    witnessName: string;
    witnessRole: string;
    witnessSignatureData: SignatureData;
    timestamp: string;
  };
  biometricData?: {
    fingerprint?: string;
    voicePrint?: string;
    faceRecognition?: string;
  };
  locationData?: {
    latitude: number;
    longitude: number;
    address: string;
    facility: string;
  };
}

export interface WorkflowAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  details: any;
  ipAddress?: string;
  deviceInfo?: any;
  previousState?: any;
  newState?: any;
}

export interface WorkflowAnalytics {
  workflowId: string;
  totalInstances: number;
  completedInstances: number;
  averageCompletionTime: number;
  bottleneckSteps: {
    stepId: string;
    averageTime: number;
    timeoutRate: number;
  }[];
  escalationRate: number;
  complianceRate: number;
  userPerformance: {
    userId: string;
    userName: string;
    completionRate: number;
    averageTime: number;
    qualityScore: number;
  }[];
}

class SignatureWorkflowService {
  private workflows: Map<string, WorkflowConfiguration> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private analytics: Map<string, WorkflowAnalytics> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows() {
    // Emergency Preparedness Workflow
    this.registerWorkflow({
      id: "emergency_preparedness",
      name: "Emergency Preparedness Workflow",
      description:
        "Multi-step signature workflow for emergency preparedness documentation",
      formType: "emergency_preparedness",
      steps: [
        {
          id: "clinician_review",
          name: "Clinician Review",
          description:
            "Primary clinician reviews and signs the emergency preparedness plan",
          signerRole: "clinician",
          required: true,
          witnessRequired: false,
          biometricRequired: false,
          locationRequired: true,
        },
        {
          id: "patient_acknowledgment",
          name: "Patient Acknowledgment",
          description:
            "Patient or family member acknowledges the emergency plan",
          signerRole: "patient",
          required: true,
          dependencies: ["clinician_review"],
          conditional: {
            field: "patientCapable",
            operator: "equals",
            value: true,
          },
          witnessRequired: true,
        },
        {
          id: "family_acknowledgment",
          name: "Family Acknowledgment",
          description: "Family member acknowledges when patient is not capable",
          signerRole: "family",
          required: false,
          dependencies: ["clinician_review"],
          conditional: {
            field: "patientCapable",
            operator: "equals",
            value: false,
          },
          witnessRequired: true,
        },
        {
          id: "supervisor_approval",
          name: "Supervisor Approval",
          description: "Supervisor approves the emergency preparedness plan",
          signerRole: "supervisor",
          required: true,
          dependencies: ["clinician_review"],
          conditional: {
            field: "riskLevel",
            operator: "equals",
            value: "high",
          },
          escalation: {
            timeoutHours: 24,
            escalateTo: "medical_director",
            notificationMessage:
              "High-risk emergency plan requires urgent supervisor approval",
          },
        },
      ],
      completionCriteria: {
        allStepsRequired: false,
        criticalStepsRequired: ["clinician_review"],
      },
      escalationRules: {
        timeoutHours: 48,
        escalationChain: [
          "supervisor",
          "medical_director",
          "chief_medical_officer",
        ],
        autoEscalate: true,
      },
      auditRequirements: {
        fullAuditTrail: true,
        retentionPeriodYears: 7,
        complianceStandards: ["DOH", "JAWDA", "ADHICS"],
      },
    });

    // Documentation Review Workflow
    this.registerWorkflow({
      id: "documentation_review",
      name: "Documentation Review Workflow",
      description:
        "Comprehensive workflow for clinical documentation review and approval",
      formType: "documentation_review",
      steps: [
        {
          id: "primary_reviewer",
          name: "Primary Reviewer",
          description: "Primary reviewer conducts initial documentation review",
          signerRole: "reviewer",
          required: true,
          witnessRequired: false,
          biometricRequired: false,
          locationRequired: false,
        },
        {
          id: "quality_assurance",
          name: "Quality Assurance Review",
          description:
            "QA team reviews documentation for compliance and quality",
          signerRole: "qa_specialist",
          required: true,
          dependencies: ["primary_reviewer"],
          conditional: {
            field: "overallQualityRating",
            operator: "less_than",
            value: "good",
          },
          escalation: {
            timeoutHours: 72,
            escalateTo: "qa_manager",
            notificationMessage:
              "Documentation quality issues require QA manager review",
          },
        },
        {
          id: "compliance_officer",
          name: "Compliance Officer Review",
          description: "Compliance officer reviews for regulatory compliance",
          signerRole: "compliance_officer",
          required: false,
          dependencies: ["primary_reviewer"],
          conditional: {
            field: "regulatoryReporting",
            operator: "equals",
            value: "yes",
          },
          witnessRequired: true,
        },
        {
          id: "medical_director",
          name: "Medical Director Approval",
          description: "Medical director final approval for critical issues",
          signerRole: "medical_director",
          required: false,
          dependencies: ["primary_reviewer", "quality_assurance"],
          conditional: {
            field: "escalationRequired",
            operator: "equals",
            value: "yes",
          },
          biometricRequired: true,
          escalation: {
            timeoutHours: 48,
            escalateTo: "chief_medical_officer",
            notificationMessage:
              "Critical documentation issues require immediate medical director attention",
          },
        },
      ],
      parallelSteps: [["quality_assurance", "compliance_officer"]],
      completionCriteria: {
        allStepsRequired: false,
        criticalStepsRequired: ["primary_reviewer"],
      },
      escalationRules: {
        timeoutHours: 120,
        escalationChain: [
          "qa_manager",
          "medical_director",
          "chief_medical_officer",
        ],
        autoEscalate: true,
      },
      auditRequirements: {
        fullAuditTrail: true,
        retentionPeriodYears: 10,
        complianceStandards: ["DOH", "JAWDA", "ADHICS", "Daman"],
      },
    });

    // Quality Assurance Workflow
    this.registerWorkflow({
      id: "quality_assurance",
      name: "Quality Assurance Workflow",
      description:
        "Multi-level quality assurance workflow with escalation logic",
      formType: "quality_assurance",
      steps: [
        {
          id: "qa_specialist",
          name: "QA Specialist Review",
          description: "QA specialist conducts initial quality review",
          signerRole: "qa_specialist",
          required: true,
          witnessRequired: false,
          biometricRequired: false,
          locationRequired: false,
        },
        {
          id: "qa_manager",
          name: "QA Manager Approval",
          description: "QA manager reviews and approves quality findings",
          signerRole: "qa_manager",
          required: true,
          dependencies: ["qa_specialist"],
          conditional: {
            field: "qualityScore",
            operator: "less_than",
            value: 85,
          },
          escalation: {
            timeoutHours: 48,
            escalateTo: "quality_director",
            notificationMessage: "Low quality scores require manager review",
          },
        },
        {
          id: "corrective_action",
          name: "Corrective Action Plan",
          description: "Responsible party signs corrective action plan",
          signerRole: "responsible_party",
          required: false,
          dependencies: ["qa_specialist"],
          conditional: {
            field: "correctiveActionRequired",
            operator: "equals",
            value: true,
          },
          witnessRequired: true,
        },
      ],
      completionCriteria: {
        allStepsRequired: false,
        criticalStepsRequired: ["qa_specialist"],
      },
      escalationRules: {
        timeoutHours: 96,
        escalationChain: [
          "qa_manager",
          "quality_director",
          "chief_quality_officer",
        ],
        autoEscalate: true,
      },
      auditRequirements: {
        fullAuditTrail: true,
        retentionPeriodYears: 5,
        complianceStandards: ["DOH", "JAWDA"],
      },
    });
  }

  // Workflow Management
  registerWorkflow(workflow: WorkflowConfiguration): void {
    this.workflows.set(workflow.id, workflow);
  }

  getWorkflow(workflowId: string): WorkflowConfiguration | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): WorkflowConfiguration[] {
    return Array.from(this.workflows.values());
  }

  // Workflow Instance Management
  async createWorkflowInstance(
    workflowId: string,
    documentId: string,
    formData: any,
    options: {
      patientId?: string;
      episodeId?: string;
      priority?: "low" | "medium" | "high" | "critical";
      dueDate?: string;
      tags?: string[];
    } = {},
  ): Promise<WorkflowInstance> {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const instanceId = `${workflowId}_${documentId}_${Date.now()}`;
    const now = new Date().toISOString();

    // Determine initial pending steps
    const pendingSteps = workflow.steps
      .filter((step) => !step.dependencies || step.dependencies.length === 0)
      .filter((step) => this.evaluateStepCondition(step, formData))
      .map((step) => step.id);

    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      documentId,
      patientId: options.patientId,
      episodeId: options.episodeId,
      status: "pending",
      currentStep: pendingSteps[0] || "",
      completedSteps: [],
      pendingSteps,
      signatures: [],
      metadata: {
        formType: workflow.formType,
        formData,
        priority: options.priority || "medium",
        dueDate: options.dueDate,
        tags: options.tags,
      },
      auditTrail: [
        {
          id: `audit_${Date.now()}`,
          timestamp: now,
          action: "workflow_created",
          userId: "system",
          userName: "System",
          userRole: "system",
          details: {
            workflowId,
            documentId,
            initialSteps: pendingSteps,
          },
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.instances.set(instanceId, instance);
    return instance;
  }

  async getWorkflowInstance(
    instanceId: string,
  ): Promise<WorkflowInstance | undefined> {
    return this.instances.get(instanceId);
  }

  async updateWorkflowInstance(
    instanceId: string,
    updates: Partial<WorkflowInstance>,
  ): Promise<WorkflowInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    const updatedInstance = {
      ...instance,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.instances.set(instanceId, updatedInstance);
    return updatedInstance;
  }

  // Step Management
  async completeStep(
    instanceId: string,
    stepId: string,
    signature: WorkflowSignature,
    userId: string,
    userName: string,
    userRole: string,
  ): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${instance.workflowId} not found`);
    }

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow`);
    }

    // Validate step can be completed
    if (!instance.pendingSteps.includes(stepId)) {
      throw new Error(`Step ${stepId} is not currently pending`);
    }

    // Validate user role
    if (step.signerRole !== userRole && userRole !== "admin") {
      throw new Error(
        `User role ${userRole} not authorized for step ${stepId}`,
      );
    }

    const now = new Date().toISOString();

    // Add signature
    const updatedSignatures = [...instance.signatures, signature];

    // Update completed and pending steps
    const updatedCompletedSteps = [...instance.completedSteps, stepId];
    const updatedPendingSteps = instance.pendingSteps.filter(
      (s) => s !== stepId,
    );

    // Determine next pending steps
    const nextSteps = workflow.steps
      .filter((s) => !updatedCompletedSteps.includes(s.id))
      .filter(
        (s) =>
          !s.dependencies ||
          s.dependencies.every((dep) => updatedCompletedSteps.includes(dep)),
      )
      .filter((s) => this.evaluateStepCondition(s, instance.metadata.formData))
      .map((s) => s.id);

    updatedPendingSteps.push(
      ...nextSteps.filter((s) => !updatedPendingSteps.includes(s)),
    );

    // Determine workflow status
    let status: WorkflowInstance["status"] = "in_progress";
    if (updatedPendingSteps.length === 0) {
      const criticalSteps =
        workflow.completionCriteria.criticalStepsRequired || [];
      const allCriticalCompleted = criticalSteps.every((s) =>
        updatedCompletedSteps.includes(s),
      );

      if (allCriticalCompleted) {
        status = "completed";
      }
    }

    // Add audit entry
    const auditEntry: WorkflowAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: now,
      action: "step_completed",
      userId,
      userName,
      userRole,
      details: {
        stepId,
        stepName: step.name,
        signatureId: signature.signatureId,
      },
      previousState: {
        completedSteps: instance.completedSteps,
        pendingSteps: instance.pendingSteps,
        status: instance.status,
      },
      newState: {
        completedSteps: updatedCompletedSteps,
        pendingSteps: updatedPendingSteps,
        status,
      },
    };

    return this.updateWorkflowInstance(instanceId, {
      signatures: updatedSignatures,
      completedSteps: updatedCompletedSteps,
      pendingSteps: updatedPendingSteps,
      currentStep: updatedPendingSteps[0] || "",
      status,
      completedAt: status === "completed" ? now : undefined,
      auditTrail: [...instance.auditTrail, auditEntry],
    });
  }

  // Utility Methods
  private evaluateStepCondition(step: WorkflowStep, formData: any): boolean {
    if (!step.conditional) return true;

    const { field, operator, value } = step.conditional;
    const fieldValue = formData[field];

    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "not_equals":
        return fieldValue !== value;
      case "contains":
        return typeof fieldValue === "string" && fieldValue.includes(value);
      case "greater_than":
        return Number(fieldValue) > Number(value);
      case "less_than":
        return Number(fieldValue) < Number(value);
      default:
        return true;
    }
  }

  async getWorkflowProgress(instanceId: string): Promise<{
    totalSteps: number;
    completedSteps: number;
    pendingSteps: number;
    progressPercentage: number;
    currentStepInfo?: WorkflowStep;
    nextSteps: WorkflowStep[];
  }> {
    const instance = await this.getWorkflowInstance(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${instance.workflowId} not found`);
    }

    const applicableSteps = workflow.steps.filter((step) =>
      this.evaluateStepCondition(step, instance.metadata.formData),
    );

    const totalSteps = applicableSteps.length;
    const completedSteps = instance.completedSteps.length;
    const pendingSteps = instance.pendingSteps.length;
    const progressPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    const currentStepInfo = workflow.steps.find(
      (step) => step.id === instance.currentStep,
    );
    const nextSteps = workflow.steps.filter((step) =>
      instance.pendingSteps.includes(step.id),
    );

    return {
      totalSteps,
      completedSteps,
      pendingSteps,
      progressPercentage,
      currentStepInfo,
      nextSteps,
    };
  }

  async getWorkflowAnalytics(workflowId: string): Promise<WorkflowAnalytics> {
    // This would typically fetch from a database
    // For now, return mock analytics
    return {
      workflowId,
      totalInstances: 0,
      completedInstances: 0,
      averageCompletionTime: 0,
      bottleneckSteps: [],
      escalationRate: 0,
      complianceRate: 100,
      userPerformance: [],
    };
  }

  // Escalation Management
  async checkEscalations(): Promise<WorkflowInstance[]> {
    const escalatedInstances: WorkflowInstance[] = [];
    const now = new Date();

    for (const instance of this.instances.values()) {
      if (instance.status === "completed" || instance.status === "cancelled") {
        continue;
      }

      const workflow = this.getWorkflow(instance.workflowId);
      if (!workflow) continue;

      // Check step-level escalations
      for (const stepId of instance.pendingSteps) {
        const step = workflow.steps.find((s) => s.id === stepId);
        if (!step?.escalation) continue;

        const stepStartTime = new Date(instance.createdAt);
        const hoursElapsed =
          (now.getTime() - stepStartTime.getTime()) / (1000 * 60 * 60);

        if (hoursElapsed > step.escalation.timeoutHours) {
          // Escalate this instance
          await this.escalateWorkflow(
            instance.id,
            stepId,
            step.escalation.escalateTo,
          );
          escalatedInstances.push(instance);
        }
      }
    }

    return escalatedInstances;
  }

  private async escalateWorkflow(
    instanceId: string,
    stepId: string,
    escalateTo: string,
  ): Promise<void> {
    const instance = await this.getWorkflowInstance(instanceId);
    if (!instance) return;

    const auditEntry: WorkflowAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "workflow_escalated",
      userId: "system",
      userName: "System",
      userRole: "system",
      details: {
        stepId,
        escalatedTo: escalateTo,
        reason: "timeout",
      },
    };

    await this.updateWorkflowInstance(instanceId, {
      status: "escalated",
      auditTrail: [...instance.auditTrail, auditEntry],
    });
  }
}

export const signatureWorkflowService = new SignatureWorkflowService();
export default signatureWorkflowService;
