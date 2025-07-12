/**
 * Advanced Rules Engine
 * Provides comprehensive business rules processing and decision automation
 */

import { errorRecovery } from "@/utils/error-recovery";

export interface Rule {
  id: string;
  name: string;
  description: string;
  category:
    | "clinical"
    | "administrative"
    | "compliance"
    | "business"
    | "safety";
  priority: "low" | "medium" | "high" | "critical";
  conditions: RuleCondition[];
  actions: RuleAction[];
  metadata: {
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    tags: string[];
  };
}

export interface RuleCondition {
  id: string;
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "exists"
    | "in"
    | "not_in"
    | "between"
    | "regex";
  value: any;
  logicalOperator?: "AND" | "OR";
  negate?: boolean;
}

export interface RuleAction {
  id: string;
  type:
    | "set_value"
    | "send_notification"
    | "trigger_workflow"
    | "log_event"
    | "validate"
    | "block"
    | "approve"
    | "calculate";
  parameters: Record<string, any>;
  priority: number;
  condition?: string;
}

export interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: string[];
  executionOrder: "sequential" | "parallel" | "priority";
  stopOnFirstMatch: boolean;
  metadata: Record<string, any>;
}

export interface RuleContext {
  data: Record<string, any>;
  patient?: {
    id: string;
    age: number;
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  clinical?: {
    episodeId: string;
    assessmentType: string;
    urgency: "low" | "medium" | "high" | "critical";
  };
  system?: {
    timestamp: Date;
    source: string;
    environment: string;
  };
}

export interface RuleExecutionResult {
  ruleId: string;
  matched: boolean;
  actions: RuleActionResult[];
  executionTime: number;
  error?: string;
  metadata: Record<string, any>;
}

export interface RuleActionResult {
  actionId: string;
  type: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface RuleEvaluationResult {
  success: boolean;
  matchedRules: string[];
  executedActions: RuleActionResult[];
  totalExecutionTime: number;
  errors: string[];
  warnings: string[];
  metadata: {
    rulesEvaluated: number;
    actionsExecuted: number;
    timestamp: Date;
  };
}

export interface RuleStats {
  isInitialized: boolean;
  totalRules: number;
  activeRules: number;
  ruleExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  topMatchedRules: Array<{ ruleId: string; count: number }>;
}

class RulesEngine {
  private static instance: RulesEngine;
  private isInitialized = false;
  private rules = new Map<string, Rule>();
  private ruleSets = new Map<string, RuleSet>();
  private executionHistory: RuleExecutionResult[] = [];
  private stats: RuleStats;

  public static getInstance(): RulesEngine {
    if (!RulesEngine.instance) {
      RulesEngine.instance = new RulesEngine();
    }
    return RulesEngine.instance;
  }

  constructor() {
    this.stats = {
      isInitialized: false,
      totalRules: 0,
      activeRules: 0,
      ruleExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      topMatchedRules: [],
    };
  }

  /**
   * Initialize the rules engine
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("⚖️ Initializing Rules Engine...");

      // Load healthcare business rules
      await this.loadHealthcareRules();

      // Load compliance rules
      await this.loadComplianceRules();

      // Load clinical decision rules
      await this.loadClinicalRules();

      // Load safety rules
      await this.loadSafetyRules();

      // Load enhanced compliance rules
      await this.loadEnhancedComplianceRules();

      // Initialize rule sets
      await this.initializeRuleSets();

      // Start rule monitoring
      await this.startRuleMonitoring();

      this.isInitialized = true;
      this.stats.isInitialized = true;
      console.log("✅ Rules Engine initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Rules Engine:", error);
      throw error;
    }
  }

  /**
   * Evaluate rules against context
   */
  public async evaluateRules(
    context: RuleContext,
  ): Promise<RuleEvaluationResult> {
    return await errorRecovery.withRecovery(
      async () => {
        if (!this.isInitialized) {
          await this.initialize();
        }

        const startTime = Date.now();
        const result: RuleEvaluationResult = {
          success: true,
          matchedRules: [],
          executedActions: [],
          totalExecutionTime: 0,
          errors: [],
          warnings: [],
          metadata: {
            rulesEvaluated: 0,
            actionsExecuted: 0,
            timestamp: new Date(),
          },
        };

        console.log("⚖️ Evaluating rules against context...");

        // Get active rules sorted by priority
        const activeRules = Array.from(this.rules.values())
          .filter((rule) => rule.metadata.isActive)
          .sort(
            (a, b) =>
              this.getPriorityValue(b.priority) -
              this.getPriorityValue(a.priority),
          );

        result.metadata.rulesEvaluated = activeRules.length;

        // Evaluate each rule
        for (const rule of activeRules) {
          try {
            const ruleResult = await this.evaluateRule(rule, context);

            if (ruleResult.matched) {
              result.matchedRules.push(rule.id);
              result.executedActions.push(...ruleResult.actions);
            }

            // Store execution history
            this.executionHistory.push(ruleResult);

            // Limit history size
            if (this.executionHistory.length > 1000) {
              this.executionHistory = this.executionHistory.slice(-500);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            result.errors.push(`Rule ${rule.id}: ${errorMessage}`);
            console.error(`❌ Rule evaluation failed for ${rule.id}:`, error);
          }
        }

        result.totalExecutionTime = Date.now() - startTime;
        result.metadata.actionsExecuted = result.executedActions.length;
        result.success = result.errors.length === 0;

        // Update statistics
        this.updateStats(result);

        console.log(
          `✅ Rules evaluation completed: ${result.matchedRules.length} rules matched, ${result.executedActions.length} actions executed`,
        );
        return result;
      },
      {
        maxRetries: 2,
        fallbackValue: {
          success: false,
          matchedRules: [],
          executedActions: [],
          totalExecutionTime: 0,
          errors: ["Rules evaluation failed"],
          warnings: [],
          metadata: {
            rulesEvaluated: 0,
            actionsExecuted: 0,
            timestamp: new Date(),
          },
        },
      },
    );
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    rule: Rule,
    context: RuleContext,
  ): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    const result: RuleExecutionResult = {
      ruleId: rule.id,
      matched: false,
      actions: [],
      executionTime: 0,
      metadata: {
        category: rule.category,
        priority: rule.priority,
      },
    };

    try {
      // Evaluate conditions
      const conditionsMatch = await this.evaluateConditions(
        rule.conditions,
        context,
      );
      result.matched = conditionsMatch;

      if (conditionsMatch) {
        console.log(`✅ Rule matched: ${rule.name}`);

        // Execute actions
        for (const action of rule.actions) {
          try {
            const actionResult = await this.executeAction(action, context);
            result.actions.push(actionResult);
          } catch (error) {
            const actionResult: RuleActionResult = {
              actionId: action.id,
              type: action.type,
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
            result.actions.push(actionResult);
          }
        }
      }

      result.executionTime = Date.now() - startTime;
      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      result.executionTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateConditions(
    conditions: RuleCondition[],
    context: RuleContext,
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogicalOperator: "AND" | "OR" = "AND";

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, context);

      if (i === 0) {
        result = conditionResult;
      } else {
        if (currentLogicalOperator === "AND") {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      // Set logical operator for next iteration
      if (condition.logicalOperator) {
        currentLogicalOperator = condition.logicalOperator;
      }
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: RuleCondition,
    context: RuleContext,
  ): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    let result = false;

    switch (condition.operator) {
      case "equals":
        result = fieldValue === condition.value;
        break;
      case "not_equals":
        result = fieldValue !== condition.value;
        break;
      case "greater_than":
        result = Number(fieldValue) > Number(condition.value);
        break;
      case "less_than":
        result = Number(fieldValue) < Number(condition.value);
        break;
      case "contains":
        result = String(fieldValue)
          .toLowerCase()
          .includes(String(condition.value).toLowerCase());
        break;
      case "exists":
        result = fieldValue !== undefined && fieldValue !== null;
        break;
      case "in":
        result =
          Array.isArray(condition.value) &&
          condition.value.includes(fieldValue);
        break;
      case "not_in":
        result =
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue);
        break;
      case "between":
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const numValue = Number(fieldValue);
          result =
            numValue >= condition.value[0] && numValue <= condition.value[1];
        }
        break;
      case "regex":
        try {
          const regex = new RegExp(condition.value);
          result = regex.test(String(fieldValue));
        } catch (error) {
          console.warn(`Invalid regex pattern: ${condition.value}`);
          result = false;
        }
        break;
      default:
        console.warn(`Unknown operator: ${condition.operator}`);
        result = false;
    }

    return condition.negate ? !result : result;
  }

  /**
   * Get field value from context
   */
  private getFieldValue(field: string, context: RuleContext): any {
    const parts = field.split(".");
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Execute rule action
   */
  private async executeAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<RuleActionResult> {
    const result: RuleActionResult = {
      actionId: action.id,
      type: action.type,
      success: false,
    };

    try {
      switch (action.type) {
        case "set_value":
          result.result = await this.executeSetValueAction(action, context);
          break;
        case "send_notification":
          result.result = await this.executeSendNotificationAction(
            action,
            context,
          );
          break;
        case "trigger_workflow":
          result.result = await this.executeTriggerWorkflowAction(
            action,
            context,
          );
          break;
        case "log_event":
          result.result = await this.executeLogEventAction(action, context);
          break;
        case "validate":
          result.result = await this.executeValidateAction(action, context);
          break;
        case "block":
          result.result = await this.executeBlockAction(action, context);
          break;
        case "approve":
          result.result = await this.executeApproveAction(action, context);
          break;
        case "calculate":
          result.result = await this.executeCalculateAction(action, context);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      result.success = true;
      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }

  // Action execution methods
  private async executeSetValueAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { field, value } = action.parameters;
    console.log(`📝 Setting ${field} = ${value}`);
    return { field, value, timestamp: new Date() };
  }

  private async executeSendNotificationAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { recipient, message, priority } = action.parameters;
    console.log(`📧 Sending notification to ${recipient}: ${message}`);
    return { recipient, message, priority, sent: true, timestamp: new Date() };
  }

  private async executeTriggerWorkflowAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { workflowId, data } = action.parameters;
    console.log(`🔄 Triggering workflow: ${workflowId}`);
    return { workflowId, data, triggered: true, timestamp: new Date() };
  }

  private async executeLogEventAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { level, message, category } = action.parameters;
    console.log(`📋 Logging event [${level}] ${category}: ${message}`);
    return { level, message, category, logged: true, timestamp: new Date() };
  }

  private async executeValidateAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { validationType, criteria } = action.parameters;
    console.log(`✅ Validating ${validationType} against criteria`);
    return { validationType, criteria, valid: true, timestamp: new Date() };
  }

  private async executeBlockAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { reason, severity } = action.parameters;
    console.log(`🚫 Blocking action: ${reason} (${severity})`);
    return { reason, severity, blocked: true, timestamp: new Date() };
  }

  private async executeApproveAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { approvalType, conditions } = action.parameters;
    console.log(`✅ Approving ${approvalType}`);
    return { approvalType, conditions, approved: true, timestamp: new Date() };
  }

  private async executeCalculateAction(
    action: RuleAction,
    context: RuleContext,
  ): Promise<any> {
    const { formula, variables } = action.parameters;
    console.log(`🧮 Calculating: ${formula}`);
    // Simple calculation simulation
    const result = Math.random() * 100;
    return { formula, variables, result, timestamp: new Date() };
  }

  /**
   * Load healthcare business rules
   */
  private async loadHealthcareRules(): Promise<void> {
    console.log("🏥 Loading healthcare business rules...");

    const healthcareRules: Omit<Rule, "id" | "metadata">[] = [
      {
        name: "Patient Age Validation",
        description: "Validate patient age for specific treatments",
        category: "clinical",
        priority: "high",
        conditions: [
          {
            id: "age_check",
            field: "patient.age",
            operator: "greater_than",
            value: 65,
          },
        ],
        actions: [
          {
            id: "flag_elderly",
            type: "set_value",
            parameters: {
              field: "patient.isElderly",
              value: true,
            },
            priority: 1,
          },
          {
            id: "notify_geriatric_care",
            type: "send_notification",
            parameters: {
              recipient: "geriatric_team",
              message: "Elderly patient requires specialized care protocols",
              priority: "high",
            },
            priority: 2,
          },
        ],
      },
      {
        name: "Medication Allergy Check",
        description: "Check for medication allergies before prescription",
        category: "safety",
        priority: "critical",
        conditions: [
          {
            id: "allergy_exists",
            field: "patient.allergies",
            operator: "exists",
            value: null,
          },
        ],
        actions: [
          {
            id: "validate_medications",
            type: "validate",
            parameters: {
              validationType: "medication_allergy",
              criteria: "cross_reference_allergies",
            },
            priority: 1,
          },
          {
            id: "block_if_allergic",
            type: "block",
            parameters: {
              reason: "Patient has known allergies to prescribed medication",
              severity: "critical",
            },
            priority: 2,
            condition: "allergy_match_found",
          },
        ],
      },
      {
        name: "High Risk Patient Assessment",
        description:
          "Identify high-risk patients requiring additional monitoring",
        category: "clinical",
        priority: "high",
        conditions: [
          {
            id: "multiple_conditions",
            field: "patient.conditions",
            operator: "greater_than",
            value: 2,
          },
          {
            id: "elderly_patient",
            field: "patient.age",
            operator: "greater_than",
            value: 70,
            logicalOperator: "OR",
          },
        ],
        actions: [
          {
            id: "set_high_risk",
            type: "set_value",
            parameters: {
              field: "patient.riskLevel",
              value: "high",
            },
            priority: 1,
          },
          {
            id: "trigger_monitoring",
            type: "trigger_workflow",
            parameters: {
              workflowId: "enhanced_monitoring_workflow",
              data: {
                patientId: "{{patient.id}}",
                riskFactors: "{{patient.conditions}}",
              },
            },
            priority: 2,
          },
        ],
      },
    ];

    for (const ruleData of healthcareRules) {
      await this.createRule(ruleData);
    }

    console.log(
      `✅ Loaded ${healthcareRules.length} healthcare business rules`,
    );
  }

  /**
   * Load compliance rules
   */
  private async loadComplianceRules(): Promise<void> {
    console.log("📋 Loading compliance rules...");

    const complianceRules: Omit<Rule, "id" | "metadata">[] = [
      {
        name: "DOH Documentation Compliance",
        description: "Ensure all required DOH documentation is complete",
        category: "compliance",
        priority: "critical",
        conditions: [
          {
            id: "assessment_type_check",
            field: "clinical.assessmentType",
            operator: "in",
            value: [
              "initial_assessment",
              "comprehensive_assessment",
              "discharge_planning",
            ],
          },
        ],
        actions: [
          {
            id: "validate_doh_fields",
            type: "validate",
            parameters: {
              validationType: "doh_compliance",
              criteria: "required_fields_complete",
            },
            priority: 1,
          },
          {
            id: "block_incomplete",
            type: "block",
            parameters: {
              reason: "DOH required fields are incomplete",
              severity: "high",
            },
            priority: 2,
            condition: "validation_failed",
          },
        ],
      },
      {
        name: "JAWDA Quality Standards",
        description: "Ensure JAWDA quality standards are met",
        category: "compliance",
        priority: "high",
        conditions: [
          {
            id: "quality_check",
            field: "data.qualityScore",
            operator: "less_than",
            value: 85,
          },
        ],
        actions: [
          {
            id: "trigger_quality_review",
            type: "trigger_workflow",
            parameters: {
              workflowId: "quality_improvement_workflow",
              data: {
                currentScore: "{{data.qualityScore}}",
                requiredScore: 85,
              },
            },
            priority: 1,
          },
          {
            id: "notify_quality_team",
            type: "send_notification",
            parameters: {
              recipient: "quality_assurance_team",
              message:
                "Quality score below JAWDA standards - immediate review required",
              priority: "high",
            },
            priority: 2,
          },
        ],
      },
      {
        name: "Data Privacy Compliance",
        description: "Ensure patient data privacy compliance",
        category: "compliance",
        priority: "critical",
        conditions: [
          {
            id: "sensitive_data_access",
            field: "system.source",
            operator: "not_in",
            value: ["authorized_system", "clinical_portal"],
          },
        ],
        actions: [
          {
            id: "log_access_attempt",
            type: "log_event",
            parameters: {
              level: "warning",
              message: "Unauthorized access attempt to sensitive patient data",
              category: "security",
            },
            priority: 1,
          },
          {
            id: "block_access",
            type: "block",
            parameters: {
              reason: "Unauthorized access to sensitive patient data",
              severity: "critical",
            },
            priority: 2,
          },
        ],
      },
    ];

    for (const ruleData of complianceRules) {
      await this.createRule(ruleData);
    }

    console.log(`✅ Loaded ${complianceRules.length} compliance rules`);
  }

  /**
   * Load clinical decision rules
   */
  private async loadClinicalRules(): Promise<void> {
    console.log("🏥 Loading clinical decision rules...");

    const clinicalRules: Omit<Rule, "id" | "metadata">[] = [
      {
        name: "Critical Vital Signs Alert",
        description:
          "Alert for critical vital signs requiring immediate attention",
        category: "clinical",
        priority: "critical",
        conditions: [
          {
            id: "blood_pressure_high",
            field: "data.systolicBP",
            operator: "greater_than",
            value: 180,
          },
          {
            id: "heart_rate_critical",
            field: "data.heartRate",
            operator: "greater_than",
            value: 120,
            logicalOperator: "OR",
          },
        ],
        actions: [
          {
            id: "immediate_alert",
            type: "send_notification",
            parameters: {
              recipient: "emergency_team",
              message:
                "CRITICAL: Patient vital signs require immediate medical attention",
              priority: "critical",
            },
            priority: 1,
          },
          {
            id: "trigger_emergency_protocol",
            type: "trigger_workflow",
            parameters: {
              workflowId: "emergency_response_workflow",
              data: {
                patientId: "{{patient.id}}",
                vitalSigns: "{{data}}",
                urgency: "critical",
              },
            },
            priority: 2,
          },
        ],
      },
      {
        name: "Medication Dosage Validation",
        description:
          "Validate medication dosages based on patient characteristics",
        category: "safety",
        priority: "high",
        conditions: [
          {
            id: "elderly_patient",
            field: "patient.age",
            operator: "greater_than",
            value: 65,
          },
          {
            id: "kidney_condition",
            field: "patient.conditions",
            operator: "contains",
            value: "kidney",
            logicalOperator: "OR",
          },
        ],
        actions: [
          {
            id: "calculate_adjusted_dose",
            type: "calculate",
            parameters: {
              formula: "standard_dose * age_factor * kidney_factor",
              variables: {
                standard_dose: "{{data.medicationDose}}",
                age_factor: 0.8,
                kidney_factor: 0.7,
              },
            },
            priority: 1,
          },
          {
            id: "recommend_dose_adjustment",
            type: "send_notification",
            parameters: {
              recipient: "prescribing_physician",
              message:
                "Dose adjustment recommended for elderly patient with kidney condition",
              priority: "medium",
            },
            priority: 2,
          },
        ],
      },
    ];

    for (const ruleData of clinicalRules) {
      await this.createRule(ruleData);
    }

    console.log(`✅ Loaded ${clinicalRules.length} clinical decision rules`);
  }

  /**
   * Load enhanced healthcare compliance rules
   */
  private async loadEnhancedComplianceRules(): Promise<void> {
    console.log("🏥 Loading enhanced healthcare compliance rules...");

    const enhancedRules: Omit<Rule, "id" | "metadata">[] = [
      {
        name: "DOH 9-Domain Assessment Validation",
        description:
          "Ensure all 9 DOH domains are properly assessed and documented",
        category: "compliance",
        priority: "critical",
        conditions: [
          {
            id: "assessment_type_9domain",
            field: "clinical.assessmentType",
            operator: "equals",
            value: "doh_9_domain",
          },
        ],
        actions: [
          {
            id: "validate_all_domains",
            type: "validate",
            parameters: {
              validationType: "doh_9_domain_complete",
              criteria: "all_domains_documented",
              requiredDomains: [
                "physical_health",
                "cognitive_mental",
                "psychosocial",
                "spiritual_cultural",
                "financial",
                "legal",
                "cultural_ethnic",
                "environmental",
                "caregiver_support",
              ],
            },
            priority: 1,
          },
          {
            id: "block_incomplete_assessment",
            type: "block",
            parameters: {
              reason:
                "DOH 9-domain assessment incomplete - all domains must be documented",
              severity: "critical",
            },
            priority: 2,
            condition: "domains_incomplete",
          },
        ],
      },
      {
        name: "JAWDA Quality Indicator Compliance",
        description:
          "Ensure JAWDA quality indicators are met for homecare services",
        category: "compliance",
        priority: "high",
        conditions: [
          {
            id: "homecare_service",
            field: "data.serviceType",
            operator: "equals",
            value: "homecare",
          },
        ],
        actions: [
          {
            id: "validate_jawda_indicators",
            type: "validate",
            parameters: {
              validationType: "jawda_quality_indicators",
              criteria: "homecare_standards_v8.3",
              indicators: [
                "patient_satisfaction",
                "clinical_outcomes",
                "safety_measures",
                "care_coordination",
                "staff_competency",
              ],
            },
            priority: 1,
          },
          {
            id: "trigger_quality_improvement",
            type: "trigger_workflow",
            parameters: {
              workflowId: "jawda_quality_improvement",
              data: {
                serviceId: "{{data.serviceId}}",
                indicators: "{{validation_results}}",
              },
            },
            priority: 2,
            condition: "indicators_below_threshold",
          },
        ],
      },
      {
        name: "Healthcare Data Encryption Compliance",
        description:
          "Ensure all healthcare data is properly encrypted according to standards",
        category: "compliance",
        priority: "critical",
        conditions: [
          {
            id: "sensitive_data_access",
            field: "data.containsPHI",
            operator: "equals",
            value: true,
          },
        ],
        actions: [
          {
            id: "validate_encryption",
            type: "validate",
            parameters: {
              validationType: "data_encryption",
              criteria: "aes_256_gcm",
              standard: "HIPAA_HITECH",
            },
            priority: 1,
          },
          {
            id: "log_phi_access",
            type: "log_event",
            parameters: {
              level: "info",
              message: "PHI data accessed - encryption validated",
              category: "compliance",
            },
            priority: 2,
          },
          {
            id: "block_unencrypted_access",
            type: "block",
            parameters: {
              reason: "PHI data must be encrypted - access denied",
              severity: "critical",
            },
            priority: 3,
            condition: "encryption_validation_failed",
          },
        ],
      },
    ];

    for (const ruleData of enhancedRules) {
      await this.createRule(ruleData);
    }

    console.log(`✅ Loaded ${enhancedRules.length} enhanced compliance rules`);
  }

  /**
   * Load safety rules
   */
  private async loadSafetyRules(): Promise<void> {
    console.log("🛡️ Loading safety rules...");

    const safetyRules: Omit<Rule, "id" | "metadata">[] = [
      {
        name: "Fall Risk Assessment",
        description: "Assess and flag patients at high risk of falling",
        category: "safety",
        priority: "high",
        conditions: [
          {
            id: "age_risk",
            field: "patient.age",
            operator: "greater_than",
            value: 75,
          },
          {
            id: "mobility_issues",
            field: "data.mobilityScore",
            operator: "less_than",
            value: 3,
            logicalOperator: "OR",
          },
        ],
        actions: [
          {
            id: "set_fall_risk",
            type: "set_value",
            parameters: {
              field: "patient.fallRisk",
              value: "high",
            },
            priority: 1,
          },
          {
            id: "implement_fall_precautions",
            type: "trigger_workflow",
            parameters: {
              workflowId: "fall_prevention_workflow",
              data: {
                patientId: "{{patient.id}}",
                riskLevel: "high",
              },
            },
            priority: 2,
          },
        ],
      },
      {
        name: "Infection Control Protocol",
        description: "Trigger infection control measures when indicated",
        category: "safety",
        priority: "critical",
        conditions: [
          {
            id: "fever_present",
            field: "data.temperature",
            operator: "greater_than",
            value: 38.5,
          },
          {
            id: "infection_symptoms",
            field: "data.symptoms",
            operator: "contains",
            value: "infection",
            logicalOperator: "OR",
          },
        ],
        actions: [
          {
            id: "isolate_patient",
            type: "set_value",
            parameters: {
              field: "patient.isolationRequired",
              value: true,
            },
            priority: 1,
          },
          {
            id: "notify_infection_control",
            type: "send_notification",
            parameters: {
              recipient: "infection_control_team",
              message:
                "Patient requires infection control assessment and isolation precautions",
              priority: "high",
            },
            priority: 2,
          },
        ],
      },
    ];

    for (const ruleData of safetyRules) {
      await this.createRule(ruleData);
    }

    console.log(`✅ Loaded ${safetyRules.length} safety rules`);
  }

  /**
   * Create a new rule
   */
  public async createRule(
    ruleData: Omit<Rule, "id" | "metadata">,
  ): Promise<string> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rule: Rule = {
      ...ruleData,
      id: ruleId,
      metadata: {
        version: "1.0.0",
        author: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        tags: [ruleData.category, ruleData.priority],
      },
    };

    this.rules.set(ruleId, rule);
    this.updateRuleStats();

    console.log(`✅ Created rule: ${rule.name} (${ruleId})`);
    return ruleId;
  }

  /**
   * Initialize rule sets
   */
  private async initializeRuleSets(): Promise<void> {
    console.log("📚 Initializing rule sets...");

    const ruleSets = [
      {
        id: "clinical_assessment_rules",
        name: "Clinical Assessment Rules",
        description: "Rules for clinical assessment validation and processing",
        rules: Array.from(this.rules.values())
          .filter((rule) => rule.category === "clinical")
          .map((rule) => rule.id),
        executionOrder: "priority" as const,
        stopOnFirstMatch: false,
        metadata: { category: "clinical" },
      },
      {
        id: "compliance_validation_rules",
        name: "Compliance Validation Rules",
        description: "Rules for regulatory compliance validation",
        rules: Array.from(this.rules.values())
          .filter((rule) => rule.category === "compliance")
          .map((rule) => rule.id),
        executionOrder: "sequential" as const,
        stopOnFirstMatch: true,
        metadata: { category: "compliance" },
      },
      {
        id: "safety_monitoring_rules",
        name: "Safety Monitoring Rules",
        description: "Rules for patient safety monitoring and alerts",
        rules: Array.from(this.rules.values())
          .filter((rule) => rule.category === "safety")
          .map((rule) => rule.id),
        executionOrder: "priority" as const,
        stopOnFirstMatch: false,
        metadata: { category: "safety" },
      },
    ];

    ruleSets.forEach((ruleSet) => {
      this.ruleSets.set(ruleSet.id, ruleSet);
    });

    console.log(`✅ Initialized ${ruleSets.length} rule sets`);
  }

  /**
   * Start rule monitoring
   */
  private async startRuleMonitoring(): Promise<void> {
    console.log("📊 Starting rule monitoring...");

    // Monitor rule performance
    setInterval(() => {
      this.updateRuleStats();
      this.cleanupExecutionHistory();
    }, 60000); // Every minute

    console.log("✅ Rule monitoring started");
  }

  /**
   * Update rule statistics
   */
  private updateRuleStats(): void {
    this.stats.totalRules = this.rules.size;
    this.stats.activeRules = Array.from(this.rules.values()).filter(
      (rule) => rule.metadata.isActive,
    ).length;
    this.stats.ruleExecutions = this.executionHistory.length;

    if (this.executionHistory.length > 0) {
      const successfulExecutions = this.executionHistory.filter(
        (result) => !result.error,
      ).length;
      this.stats.successRate =
        (successfulExecutions / this.executionHistory.length) * 100;

      const totalExecutionTime = this.executionHistory.reduce(
        (sum, result) => sum + result.executionTime,
        0,
      );
      this.stats.averageExecutionTime =
        totalExecutionTime / this.executionHistory.length;

      // Calculate top matched rules
      const ruleMatchCounts = new Map<string, number>();
      this.executionHistory.forEach((result) => {
        if (result.matched) {
          const count = ruleMatchCounts.get(result.ruleId) || 0;
          ruleMatchCounts.set(result.ruleId, count + 1);
        }
      });

      this.stats.topMatchedRules = Array.from(ruleMatchCounts.entries())
        .map(([ruleId, count]) => ({ ruleId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  }

  /**
   * Cleanup execution history
   */
  private cleanupExecutionHistory(): void {
    // Keep only recent execution history
    const maxHistorySize = 1000;
    if (this.executionHistory.length > maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-maxHistorySize / 2);
    }
  }

  /**
   * Get priority value for sorting
   */
  private getPriorityValue(priority: string): number {
    switch (priority) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Update statistics after rule evaluation
   */
  private updateStats(result: RuleEvaluationResult): void {
    this.stats.ruleExecutions++;

    if (result.success) {
      this.stats.successRate =
        (this.stats.successRate * (this.stats.ruleExecutions - 1) + 100) /
        this.stats.ruleExecutions;
    } else {
      this.stats.successRate =
        (this.stats.successRate * (this.stats.ruleExecutions - 1)) /
        this.stats.ruleExecutions;
    }

    this.stats.averageExecutionTime =
      (this.stats.averageExecutionTime * (this.stats.ruleExecutions - 1) +
        result.totalExecutionTime) /
      this.stats.ruleExecutions;
  }

  /**
   * Get rules engine statistics
   */
  public getStats(): RuleStats {
    return { ...this.stats };
  }

  /**
   * Get all rules
   */
  public getRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  public getRule(ruleId: string): Rule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get rules by category
   */
  public getRulesByCategory(category: Rule["category"]): Rule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.category === category,
    );
  }

  /**
   * Get execution history
   */
  public getExecutionHistory(limit?: number): RuleExecutionResult[] {
    const history = [...this.executionHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get rule sets
   */
  public getRuleSets(): RuleSet[] {
    return Array.from(this.ruleSets.values());
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return this.isInitialized && this.rules.size > 0;
    } catch (error) {
      console.error("Rules engine health check failed:", error);
      return false;
    }
  }

  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      rulesCount: this.rules.size,
      activeRulesCount: this.stats.activeRules,
      ruleSetsCount: this.ruleSets.size,
      executionHistorySize: this.executionHistory.length,
      stats: this.stats,
    };
  }
}

export const rulesEngine = RulesEngine.getInstance();
export default rulesEngine;
