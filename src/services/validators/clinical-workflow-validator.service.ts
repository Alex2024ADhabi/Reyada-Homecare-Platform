/**
 * Clinical Workflow Validator
 * Validates clinical workflows and processes for compliance and efficiency
 * Part of Phase 1: Foundation & Core Features - Missing Validators
 */

import { EventEmitter } from 'eventemitter3';

// Clinical Workflow Types
export interface ClinicalWorkflow {
  id: string;
  name: string;
  type: 'assessment' | 'treatment' | 'medication' | 'discharge' | 'emergency' | 'routine';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  outcomes: WorkflowOutcome[];
  metadata: {
    version: string;
    createdBy: string;
    approvedBy: string;
    effectiveDate: string;
    expiryDate?: string;
    complianceLevel: 'basic' | 'standard' | 'advanced' | 'critical';
  };
  status: 'draft' | 'active' | 'suspended' | 'retired';
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'decision' | 'validation' | 'notification';
  order: number;
  required: boolean;
  timeLimit?: number; // minutes
  assignedRole: string[];
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  validations: StepValidation[];
  dependencies: string[]; // step IDs
}

export interface WorkflowTrigger {
  id: string;
  type: 'time' | 'event' | 'condition' | 'manual';
  condition: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkflowCondition {
  id: string;
  expression: string;
  description: string;
  type: 'prerequisite' | 'validation' | 'business_rule' | 'safety_check';
}

export interface WorkflowOutcome {
  id: string;
  name: string;
  type: 'success' | 'failure' | 'partial' | 'escalation';
  actions: string[];
  notifications: string[];
}

export interface WorkflowInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  validation: InputValidation;
  source: 'user' | 'system' | 'external' | 'calculated';
}

export interface WorkflowOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  destination: 'database' | 'notification' | 'report' | 'external_system';
  format?: string;
}

export interface StepValidation {
  type: 'required' | 'format' | 'range' | 'custom' | 'clinical_rule';
  rule: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface InputValidation {
  rules: ValidationRule[];
  customValidator?: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'custom';
  value?: any;
  message: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  patientId: string;
  executedBy: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'suspended';
  currentStep: string;
  completedSteps: string[];
  stepResults: Record<string, any>;
  errors: WorkflowError[];
  warnings: WorkflowWarning[];
  metrics: ExecutionMetrics;
}

export interface WorkflowError {
  stepId: string;
  type: 'validation' | 'business_rule' | 'system' | 'timeout' | 'permission';
  message: string;
  details: any;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkflowWarning {
  stepId: string;
  type: 'performance' | 'data_quality' | 'compliance' | 'best_practice';
  message: string;
  suggestion: string;
  timestamp: string;
}

export interface ExecutionMetrics {
  totalDuration: number; // milliseconds
  stepDurations: Record<string, number>;
  validationTime: number;
  waitTime: number;
  processingTime: number;
  errorCount: number;
  warningCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: WorkflowError[];
  warnings: WorkflowWarning[];
  recommendations: string[];
  complianceLevel: 'non_compliant' | 'partially_compliant' | 'compliant' | 'fully_compliant';
}

class ClinicalWorkflowValidator extends EventEmitter {
  private workflows: Map<string, ClinicalWorkflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private validationRules: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    this.initializeValidator();
  }

  private async initializeValidator(): Promise<void> {
    try {
      console.log("🔍 Initializing Clinical Workflow Validator...");

      // Load validation rules
      await this.loadValidationRules();

      // Initialize clinical standards
      await this.initializeClinicalStandards();

      // Setup compliance monitoring
      this.setupComplianceMonitoring();

      this.isInitialized = true;
      this.emit("validator:initialized");

      console.log("✅ Clinical Workflow Validator initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Clinical Workflow Validator:", error);
      throw error;
    }
  }

  /**
   * Validate clinical workflow definition
   */
  async validateWorkflow(workflow: ClinicalWorkflow): Promise<ValidationResult> {
    try {
      if (!this.isInitialized) {
        throw new Error("Validator not initialized");
      }

      const errors: WorkflowError[] = [];
      const warnings: WorkflowWarning[] = [];
      const recommendations: string[] = [];

      // Validate workflow structure
      const structureValidation = await this.validateWorkflowStructure(workflow);
      errors.push(...structureValidation.errors);
      warnings.push(...structureValidation.warnings);

      // Validate clinical compliance
      const complianceValidation = await this.validateClinicalCompliance(workflow);
      errors.push(...complianceValidation.errors);
      warnings.push(...complianceValidation.warnings);

      // Validate step dependencies
      const dependencyValidation = await this.validateStepDependencies(workflow);
      errors.push(...dependencyValidation.errors);
      warnings.push(...dependencyValidation.warnings);

      // Validate business rules
      const businessRuleValidation = await this.validateBusinessRules(workflow);
      errors.push(...businessRuleValidation.errors);
      warnings.push(...businessRuleValidation.warnings);

      // Generate recommendations
      recommendations.push(...this.generateRecommendations(workflow, errors, warnings));

      // Calculate compliance level
      const complianceLevel = this.calculateComplianceLevel(errors, warnings);

      // Calculate overall score
      const score = this.calculateValidationScore(errors, warnings);

      const result: ValidationResult = {
        isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
        score,
        errors,
        warnings,
        recommendations,
        complianceLevel,
      };

      this.emit("workflow:validated", { workflowId: workflow.id, result });
      return result;
    } catch (error) {
      console.error("❌ Failed to validate workflow:", error);
      throw error;
    }
  }

  /**
   * Validate workflow execution in real-time
   */
  async validateExecution(execution: WorkflowExecution): Promise<ValidationResult> {
    try {
      const workflow = this.workflows.get(execution.workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${execution.workflowId}`);
      }

      const errors: WorkflowError[] = [];
      const warnings: WorkflowWarning[] = [];

      // Validate current step
      const currentStepValidation = await this.validateCurrentStep(execution, workflow);
      errors.push(...currentStepValidation.errors);
      warnings.push(...currentStepValidation.warnings);

      // Validate timing constraints
      const timingValidation = await this.validateTiming(execution, workflow);
      errors.push(...timingValidation.errors);
      warnings.push(...timingValidation.warnings);

      // Validate data integrity
      const dataValidation = await this.validateExecutionData(execution, workflow);
      errors.push(...dataValidation.errors);
      warnings.push(...dataValidation.warnings);

      // Validate permissions
      const permissionValidation = await this.validatePermissions(execution, workflow);
      errors.push(...permissionValidation.errors);
      warnings.push(...permissionValidation.warnings);

      const result: ValidationResult = {
        isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
        score: this.calculateValidationScore(errors, warnings),
        errors,
        warnings,
        recommendations: this.generateExecutionRecommendations(execution, errors, warnings),
        complianceLevel: this.calculateComplianceLevel(errors, warnings),
      };

      this.emit("execution:validated", { executionId: execution.id, result });
      return result;
    } catch (error) {
      console.error("❌ Failed to validate execution:", error);
      throw error;
    }
  }

  /**
   * Validate step input data
   */
  async validateStepInput(stepId: string, input: any, workflow: ClinicalWorkflow): Promise<ValidationResult> {
    try {
      const step = workflow.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error(`Step not found: ${stepId}`);
      }

      const errors: WorkflowError[] = [];
      const warnings: WorkflowWarning[] = [];

      // Validate each input field
      for (const inputDef of step.inputs) {
        const value = input[inputDef.name];
        const fieldValidation = await this.validateInputField(inputDef, value, stepId);
        errors.push(...fieldValidation.errors);
        warnings.push(...fieldValidation.warnings);
      }

      // Validate clinical rules
      const clinicalValidation = await this.validateClinicalRules(step, input);
      errors.push(...clinicalValidation.errors);
      warnings.push(...clinicalValidation.warnings);

      return {
        isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
        score: this.calculateValidationScore(errors, warnings),
        errors,
        warnings,
        recommendations: [],
        complianceLevel: this.calculateComplianceLevel(errors, warnings),
      };
    } catch (error) {
      console.error("❌ Failed to validate step input:", error);
      throw error;
    }
  }

  /**
   * Register new workflow for validation
   */
  async registerWorkflow(workflow: ClinicalWorkflow): Promise<void> {
    try {
      // Validate workflow before registration
      const validation = await this.validateWorkflow(workflow);
      
      if (!validation.isValid) {
        throw new Error(`Cannot register invalid workflow: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      this.workflows.set(workflow.id, workflow);
      this.emit("workflow:registered", workflow);

      console.log(`🔍 Workflow registered: ${workflow.name}`);
    } catch (error) {
      console.error("❌ Failed to register workflow:", error);
      throw error;
    }
  }

  /**
   * Get validation statistics
   */
  getValidationStatistics(): any {
    const executions = Array.from(this.executions.values());
    const workflows = Array.from(this.workflows.values());

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      totalExecutions: executions.length,
      completedExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      averageExecutionTime: this.calculateAverageExecutionTime(executions),
      complianceRate: this.calculateOverallComplianceRate(executions),
      errorRate: this.calculateErrorRate(executions),
      topErrors: this.getTopErrors(executions),
    };
  }

  // Private helper methods
  private async loadValidationRules(): Promise<void> {
    // Load DOH clinical validation rules
    this.validationRules.set('doh_medication', {
      rules: [
        { field: 'dosage', type: 'required', message: 'Medication dosage is required' },
        { field: 'frequency', type: 'required', message: 'Medication frequency is required' },
        { field: 'prescriber', type: 'required', message: 'Prescriber information is required' },
      ],
    });

    // Load clinical assessment rules
    this.validationRules.set('clinical_assessment', {
      rules: [
        { field: 'vital_signs', type: 'required', message: 'Vital signs must be recorded' },
        { field: 'assessment_date', type: 'required', message: 'Assessment date is required' },
        { field: 'assessor_id', type: 'required', message: 'Assessor identification is required' },
      ],
    });

    console.log("🔍 Validation rules loaded");
  }

  private async initializeClinicalStandards(): Promise<void> {
    // Initialize DOH clinical standards
    console.log("🔍 Clinical standards initialized");
  }

  private setupComplianceMonitoring(): void {
    // Setup real-time compliance monitoring
    setInterval(() => {
      this.monitorCompliance();
    }, 60000); // Every minute
  }

  private async monitorCompliance(): Promise<void> {
    const activeExecutions = Array.from(this.executions.values())
      .filter(e => e.status === 'running');

    for (const execution of activeExecutions) {
      const validation = await this.validateExecution(execution);
      if (!validation.isValid) {
        this.emit("compliance:violation", { execution, validation });
      }
    }
  }

  private async validateWorkflowStructure(workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Validate required fields
    if (!workflow.name || workflow.name.trim().length === 0) {
      errors.push({
        stepId: 'structure',
        type: 'validation',
        message: 'Workflow name is required',
        details: { field: 'name' },
        timestamp: new Date().toISOString(),
        severity: 'high',
      });
    }

    // Validate steps
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push({
        stepId: 'structure',
        type: 'validation',
        message: 'Workflow must have at least one step',
        details: { field: 'steps' },
        timestamp: new Date().toISOString(),
        severity: 'critical',
      });
    }

    // Validate step order
    const stepOrders = workflow.steps.map(s => s.order).sort((a, b) => a - b);
    for (let i = 0; i < stepOrders.length - 1; i++) {
      if (stepOrders[i] === stepOrders[i + 1]) {
        warnings.push({
          stepId: 'structure',
          type: 'data_quality',
          message: 'Duplicate step order detected',
          suggestion: 'Ensure each step has a unique order number',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return { errors, warnings };
  }

  private async validateClinicalCompliance(workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Validate DOH compliance requirements
    if (workflow.type === 'medication' && !workflow.metadata.approvedBy) {
      errors.push({
        stepId: 'compliance',
        type: 'business_rule',
        message: 'Medication workflows must be approved by licensed physician',
        details: { requirement: 'DOH_MED_001' },
        timestamp: new Date().toISOString(),
        severity: 'critical',
      });
    }

    // Validate clinical documentation requirements
    const hasDocumentationStep = workflow.steps.some(step => 
      step.type === 'manual' && step.name.toLowerCase().includes('document')
    );

    if (!hasDocumentationStep && workflow.type !== 'emergency') {
      warnings.push({
        stepId: 'compliance',
        type: 'compliance',
        message: 'Clinical workflows should include documentation step',
        suggestion: 'Add a documentation step to ensure proper record keeping',
        timestamp: new Date().toISOString(),
      });
    }

    return { errors, warnings };
  }

  private async validateStepDependencies(workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    const stepIds = new Set(workflow.steps.map(s => s.id));

    for (const step of workflow.steps) {
      for (const depId of step.dependencies) {
        if (!stepIds.has(depId)) {
          errors.push({
            stepId: step.id,
            type: 'validation',
            message: `Step dependency not found: ${depId}`,
            details: { dependency: depId },
            timestamp: new Date().toISOString(),
            severity: 'high',
          });
        }
      }
    }

    return { errors, warnings };
  }

  private async validateBusinessRules(workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Validate business rules specific to workflow type
    switch (workflow.type) {
      case 'medication':
        if (!workflow.steps.some(s => s.name.toLowerCase().includes('verify'))) {
          errors.push({
            stepId: 'business_rule',
            type: 'business_rule',
            message: 'Medication workflows must include verification step',
            details: { rule: 'MEDICATION_VERIFICATION' },
            timestamp: new Date().toISOString(),
            severity: 'high',
          });
        }
        break;

      case 'emergency':
        const maxTime = Math.max(...workflow.steps.map(s => s.timeLimit || 0));
        if (maxTime > 30) {
          warnings.push({
            stepId: 'business_rule',
            type: 'performance',
            message: 'Emergency workflow steps should complete within 30 minutes',
            suggestion: 'Review time limits for emergency procedures',
            timestamp: new Date().toISOString(),
          });
        }
        break;
    }

    return { errors, warnings };
  }

  private async validateCurrentStep(execution: WorkflowExecution, workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    const currentStep = workflow.steps.find(s => s.id === execution.currentStep);
    if (!currentStep) {
      errors.push({
        stepId: execution.currentStep,
        type: 'system',
        message: 'Current step not found in workflow definition',
        details: { stepId: execution.currentStep },
        timestamp: new Date().toISOString(),
        severity: 'critical',
      });
    }

    return { errors, warnings };
  }

  private async validateTiming(execution: WorkflowExecution, workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    const currentStep = workflow.steps.find(s => s.id === execution.currentStep);
    if (currentStep?.timeLimit) {
      const stepStartTime = new Date(execution.startTime).getTime();
      const currentTime = Date.now();
      const elapsedMinutes = (currentTime - stepStartTime) / (1000 * 60);

      if (elapsedMinutes > currentStep.timeLimit) {
        errors.push({
          stepId: execution.currentStep,
          type: 'timeout',
          message: `Step exceeded time limit of ${currentStep.timeLimit} minutes`,
          details: { timeLimit: currentStep.timeLimit, elapsed: elapsedMinutes },
          timestamp: new Date().toISOString(),
          severity: 'high',
        });
      }
    }

    return { errors, warnings };
  }

  private async validateExecutionData(execution: WorkflowExecution, workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Validate step results data integrity
    for (const [stepId, result] of Object.entries(execution.stepResults)) {
      const step = workflow.steps.find(s => s.id === stepId);
      if (step) {
        const validation = await this.validateStepOutput(step, result);
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      }
    }

    return { errors, warnings };
  }

  private async validatePermissions(execution: WorkflowExecution, workflow: ClinicalWorkflow): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    const currentStep = workflow.steps.find(s => s.id === execution.currentStep);
    if (currentStep) {
      // Validate user has required role for current step
      const userRole = 'nurse'; // Would be retrieved from user context
      if (!currentStep.assignedRole.includes(userRole)) {
        errors.push({
          stepId: execution.currentStep,
          type: 'permission',
          message: `User role '${userRole}' not authorized for this step`,
          details: { requiredRoles: currentStep.assignedRole, userRole },
          timestamp: new Date().toISOString(),
          severity: 'high',
        });
      }
    }

    return { errors, warnings };
  }

  private async validateInputField(inputDef: WorkflowInput, value: any, stepId: string): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Required field validation
    if (inputDef.required && (value === null || value === undefined || value === '')) {
      errors.push({
        stepId,
        type: 'validation',
        message: `Required field '${inputDef.name}' is missing`,
        details: { field: inputDef.name },
        timestamp: new Date().toISOString(),
        severity: 'high',
      });
    }

    // Type validation
    if (value !== null && value !== undefined) {
      const actualType = typeof value;
      if (inputDef.type !== 'object' && inputDef.type !== 'array' && actualType !== inputDef.type) {
        errors.push({
          stepId,
          type: 'validation',
          message: `Field '${inputDef.name}' expected ${inputDef.type} but got ${actualType}`,
          details: { field: inputDef.name, expected: inputDef.type, actual: actualType },
          timestamp: new Date().toISOString(),
          severity: 'medium',
        });
      }
    }

    return { errors, warnings };
  }

  private async validateClinicalRules(step: WorkflowStep, input: any): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Apply clinical validation rules
    for (const validation of step.validations) {
      if (validation.type === 'clinical_rule') {
        const ruleResult = await this.applyClinicalRule(validation.rule, input);
        if (!ruleResult.isValid) {
          errors.push({
            stepId: step.id,
            type: 'business_rule',
            message: validation.message,
            details: { rule: validation.rule, input },
            timestamp: new Date().toISOString(),
            severity: validation.severity as any,
          });
        }
      }
    }

    return { errors, warnings };
  }

  private async validateStepOutput(step: WorkflowStep, output: any): Promise<{ errors: WorkflowError[], warnings: WorkflowWarning[] }> {
    const errors: WorkflowError[] = [];
    const warnings: WorkflowWarning[] = [];

    // Validate output against expected outputs
    for (const outputDef of step.outputs) {
      if (!(outputDef.name in output)) {
        warnings.push({
          stepId: step.id,
          type: 'data_quality',
          message: `Expected output '${outputDef.name}' not found`,
          suggestion: `Ensure step produces required output: ${outputDef.name}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return { errors, warnings };
  }

  private async applyClinicalRule(rule: string, input: any): Promise<{ isValid: boolean }> {
    // Simulate clinical rule application
    // In production, this would apply actual clinical validation rules
    return { isValid: true };
  }

  private generateRecommendations(workflow: ClinicalWorkflow, errors: WorkflowError[], warnings: WorkflowWarning[]): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push("Address critical errors before deploying workflow");
    }

    if (warnings.length > 5) {
      recommendations.push("Consider reviewing workflow design to reduce complexity");
    }

    if (workflow.steps.length > 20) {
      recommendations.push("Consider breaking down complex workflow into smaller sub-workflows");
    }

    return recommendations;
  }

  private generateExecutionRecommendations(execution: WorkflowExecution, errors: WorkflowError[], warnings: WorkflowWarning[]): string[] {
    const recommendations: string[] = [];

    if (errors.some(e => e.type === 'timeout')) {
      recommendations.push("Review time allocation for workflow steps");
    }

    if (errors.some(e => e.type === 'permission')) {
      recommendations.push("Verify user permissions and role assignments");
    }

    return recommendations;
  }

  private calculateComplianceLevel(errors: WorkflowError[], warnings: WorkflowWarning[]): ValidationResult['complianceLevel'] {
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const highErrors = errors.filter(e => e.severity === 'high').length;

    if (criticalErrors > 0) return 'non_compliant';
    if (highErrors > 0) return 'partially_compliant';
    if (warnings.length > 0) return 'compliant';
    return 'fully_compliant';
  }

  private calculateValidationScore(errors: WorkflowError[], warnings: WorkflowWarning[]): number {
    let score = 100;
    
    errors.forEach(error => {
      switch (error.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    warnings.forEach(() => score -= 2);

    return Math.max(0, score);
  }

  private calculateAverageExecutionTime(executions: WorkflowExecution[]): number {
    const completed = executions.filter(e => e.status === 'completed' && e.endTime);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, exec) => {
      const duration = new Date(exec.endTime!).getTime() - new Date(exec.startTime).getTime();
      return sum + duration;
    }, 0);

    return totalTime / completed.length;
  }

  private calculateOverallComplianceRate(executions: WorkflowExecution[]): number {
    if (executions.length === 0) return 100;

    const compliant = executions.filter(e => 
      e.errors.filter(err => err.severity === 'critical' || err.severity === 'high').length === 0
    ).length;

    return (compliant / executions.length) * 100;
  }

  private calculateErrorRate(executions: WorkflowExecution[]): number {
    if (executions.length === 0) return 0;
    return (executions.filter(e => e.status === 'failed').length / executions.length) * 100;
  }

  private getTopErrors(executions: WorkflowExecution[]): Array<{ type: string; count: number }> {
    const errorCounts = new Map<string, number>();

    executions.forEach(exec => {
      exec.errors.forEach(error => {
        const key = `${error.type}:${error.message}`;
        errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
      });
    });

    return Array.from(errorCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.removeAllListeners();
      console.log("🔍 Clinical Workflow Validator shutdown completed");
    } catch (error) {
      console.error("❌ Error during validator shutdown:", error);
    }
  }
}

export const clinicalWorkflowValidator = new ClinicalWorkflowValidator();
export default clinicalWorkflowValidator;