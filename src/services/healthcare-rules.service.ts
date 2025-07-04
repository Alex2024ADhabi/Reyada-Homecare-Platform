/**
 * Healthcare-Specific Business Rules Engine
 * Comprehensive healthcare business logic and clinical decision support
 */

import {
  rulesEngine,
  RuleContext,
  Rule,
  RuleAction,
} from "@/engines/rules.engine";
import { errorRecovery } from "@/utils/error-recovery";

export interface HealthcareRule extends Rule {
  clinicalDomain:
    | "medication_safety"
    | "clinical_assessment"
    | "infection_control"
    | "fall_prevention"
    | "pain_management"
    | "wound_care"
    | "vital_signs"
    | "laboratory_values"
    | "nursing_interventions"
    | "physician_orders";
  evidenceLevel: "A" | "B" | "C" | "D";
  clinicalGuidelines: string[];
  dohCompliant: boolean;
  jawdaCompliant: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  patientPopulation: string[];
  contraindications: string[];
  prerequisites: string[];
  outcomes: ClinicalOutcome[];
}

export interface ClinicalOutcome {
  type: "therapeutic" | "diagnostic" | "preventive" | "safety";
  description: string;
  measurable: boolean;
  timeframe: string;
  target: any;
  unit?: string;
}

export interface HealthcareRuleContext extends RuleContext {
  clinical: {
    episodeId: string;
    assessmentType: string;
    urgency: "low" | "medium" | "high" | "critical";
    clinicalDomain?: string;
    vitalSigns?: VitalSigns;
    laboratoryValues?: LaboratoryValues;
    medications?: Medication[];
    allergies?: Allergy[];
    conditions?: MedicalCondition[];
    procedures?: Procedure[];
    assessments?: ClinicalAssessment[];
  };
  environment: {
    location: "home" | "clinic" | "hospital" | "emergency";
    resources: string[];
    staffing: StaffingLevel;
    equipment: string[];
  };
  regulatory: {
    dohRequirements: string[];
    jawdaStandards: string[];
    adhicsCompliance: boolean;
    licenseRequirements: string[];
  };
}

export interface VitalSigns {
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painScore: number;
  timestamp: Date;
}

export interface LaboratoryValues {
  glucose: number;
  hemoglobin: number;
  whiteBloodCount: number;
  creatinine: number;
  sodium: number;
  potassium: number;
  timestamp: Date;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  route: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescriber: string;
  indication: string;
  contraindications: string[];
  interactions: string[];
}

export interface Allergy {
  id: string;
  allergen: string;
  type: "drug" | "food" | "environmental";
  severity: "mild" | "moderate" | "severe" | "life_threatening";
  reaction: string;
  onsetDate: Date;
}

export interface MedicalCondition {
  id: string;
  name: string;
  icdCode: string;
  severity: "mild" | "moderate" | "severe";
  status: "active" | "resolved" | "chronic";
  diagnosisDate: Date;
  managementPlan: string;
}

export interface Procedure {
  id: string;
  name: string;
  cptCode: string;
  performedDate: Date;
  performer: string;
  outcome: string;
  complications?: string[];
}

export interface ClinicalAssessment {
  id: string;
  type: string;
  domain: string;
  score: number;
  maxScore: number;
  interpretation: string;
  recommendations: string[];
  assessedBy: string;
  assessmentDate: Date;
}

export interface StaffingLevel {
  nurses: number;
  physicians: number;
  pharmacists: number;
  therapists: number;
  supportStaff: number;
}

export interface ClinicalDecisionSupport {
  ruleId: string;
  recommendation: string;
  rationale: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  urgency: "immediate" | "urgent" | "routine";
  actions: ClinicalAction[];
  contraindications: string[];
  monitoring: MonitoringRequirement[];
}

export interface ClinicalAction {
  type:
    | "medication"
    | "procedure"
    | "assessment"
    | "monitoring"
    | "education"
    | "referral";
  description: string;
  priority: "immediate" | "urgent" | "routine";
  timeframe: string;
  assignedTo: string;
  resources: string[];
  documentation: string[];
}

export interface MonitoringRequirement {
  parameter: string;
  frequency: string;
  method: "automated" | "manual" | "hybrid";
  alertThresholds: Record<string, any>;
  duration: string;
}

class HealthcareRulesService {
  private static instance: HealthcareRulesService;
  private healthcareRules = new Map<string, HealthcareRule>();
  private isInitialized = false;

  public static getInstance(): HealthcareRulesService {
    if (!HealthcareRulesService.instance) {
      HealthcareRulesService.instance = new HealthcareRulesService();
    }
    return HealthcareRulesService.instance;
  }

  /**
   * Initialize healthcare rules service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🧠 Initializing Healthcare Rules Service...");

      // Load healthcare-specific rules
      await this.loadHealthcareRules();

      // Initialize clinical decision support
      await this.initializeClinicalDecisionSupport();

      this.isInitialized = true;
      console.log("✅ Healthcare Rules Service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Healthcare Rules Service:", error);
      throw error;
    }
  }

  /**
   * Load comprehensive healthcare rules
   */
  private async loadHealthcareRules(): Promise<void> {
    const rules: HealthcareRule[] = [
      {
        id: "medication_allergy_check",
        name: "Medication Allergy Safety Check",
        description:
          "Prevent administration of medications to which patient is allergic",
        clinicalDomain: "medication_safety",
        evidenceLevel: "A",
        clinicalGuidelines: [
          "ISMP_Allergy_Guidelines",
          "DOH_Medication_Safety",
        ],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "critical",
        patientPopulation: ["all_patients"],
        contraindications: [],
        prerequisites: ["allergy_history_documented"],
        outcomes: [
          {
            type: "safety",
            description: "Prevention of allergic reactions",
            measurable: true,
            timeframe: "immediate",
            target: 0,
            unit: "allergic_reactions",
          },
        ],
        conditions: [
          {
            field: "clinical.medications",
            operator: "exists",
            value: true,
          },
          {
            field: "patient.allergies",
            operator: "exists",
            value: true,
          },
        ],
        actions: [
          {
            type: "validation",
            description: "Check for medication-allergy conflicts",
            parameters: {
              severity: "critical",
              blockingAction: true,
            },
          },
        ],
        priority: "critical",
        enabled: true,
        category: "safety",
      },
      {
        id: "vital_signs_critical_alert",
        name: "Critical Vital Signs Alert",
        description:
          "Alert for critically abnormal vital signs requiring immediate intervention",
        clinicalDomain: "vital_signs",
        evidenceLevel: "A",
        clinicalGuidelines: ["AHA_Vital_Signs", "DOH_Emergency_Standards"],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "critical",
        patientPopulation: ["all_patients"],
        contraindications: [],
        prerequisites: ["vital_signs_documented"],
        outcomes: [
          {
            type: "safety",
            description: "Early detection of clinical deterioration",
            measurable: true,
            timeframe: "immediate",
            target: 100,
            unit: "percentage_detected",
          },
        ],
        conditions: [
          {
            field: "clinical.vitalSigns.temperature",
            operator: ">",
            value: 40,
          },
          {
            field: "clinical.vitalSigns.temperature",
            operator: "<",
            value: 35,
          },
          {
            field: "clinical.vitalSigns.bloodPressure.systolic",
            operator: ">",
            value: 180,
          },
          {
            field: "clinical.vitalSigns.bloodPressure.systolic",
            operator: "<",
            value: 90,
          },
          {
            field: "clinical.vitalSigns.heartRate",
            operator: ">",
            value: 120,
          },
          {
            field: "clinical.vitalSigns.heartRate",
            operator: "<",
            value: 50,
          },
          {
            field: "clinical.vitalSigns.oxygenSaturation",
            operator: "<",
            value: 90,
          },
        ],
        actions: [
          {
            type: "alert",
            description: "Generate critical vital signs alert",
            parameters: {
              severity: "critical",
              escalation: true,
              timeframe: "immediate",
            },
          },
        ],
        priority: "critical",
        enabled: true,
        category: "monitoring",
      },
      {
        id: "fall_risk_assessment",
        name: "Fall Risk Assessment and Prevention",
        description: "Assess fall risk and implement prevention measures",
        clinicalDomain: "fall_prevention",
        evidenceLevel: "A",
        clinicalGuidelines: [
          "CDC_Fall_Prevention",
          "Joint_Commission_Fall_Prevention",
        ],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "high",
        patientPopulation: [
          "elderly",
          "mobility_impaired",
          "medication_related_risk",
        ],
        contraindications: [],
        prerequisites: ["mobility_assessment_completed"],
        outcomes: [
          {
            type: "preventive",
            description: "Reduction in fall incidents",
            measurable: true,
            timeframe: "monthly",
            target: 50,
            unit: "percentage_reduction",
          },
        ],
        conditions: [
          {
            field: "patient.age",
            operator: ">=",
            value: 65,
          },
          {
            field: "clinical.assessments",
            operator: "contains",
            value: { type: "mobility", score: { "<": 3 } },
          },
          {
            field: "patient.conditions",
            operator: "contains",
            value: "fall_history",
          },
        ],
        actions: [
          {
            type: "assessment",
            description: "Implement fall prevention protocol",
            parameters: {
              protocol: "comprehensive_fall_prevention",
              frequency: "daily",
            },
          },
        ],
        priority: "high",
        enabled: true,
        category: "prevention",
      },
      {
        id: "pain_management_protocol",
        name: "Evidence-Based Pain Management",
        description: "Implement evidence-based pain management strategies",
        clinicalDomain: "pain_management",
        evidenceLevel: "A",
        clinicalGuidelines: ["WHO_Pain_Management", "APS_Pain_Guidelines"],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "medium",
        patientPopulation: ["chronic_pain", "acute_pain", "post_operative"],
        contraindications: ["opioid_allergy", "respiratory_depression"],
        prerequisites: ["pain_assessment_completed"],
        outcomes: [
          {
            type: "therapeutic",
            description: "Pain score reduction",
            measurable: true,
            timeframe: "4_hours",
            target: 3,
            unit: "pain_scale_points",
          },
        ],
        conditions: [
          {
            field: "clinical.vitalSigns.painScore",
            operator: ">=",
            value: 4,
          },
        ],
        actions: [
          {
            type: "intervention",
            description: "Implement multimodal pain management",
            parameters: {
              approach: "multimodal",
              reassessment: "2_hours",
            },
          },
        ],
        priority: "high",
        enabled: true,
        category: "treatment",
      },
      {
        id: "infection_control_protocol",
        name: "Infection Prevention and Control",
        description:
          "Implement infection prevention measures based on risk factors",
        clinicalDomain: "infection_control",
        evidenceLevel: "A",
        clinicalGuidelines: [
          "CDC_Infection_Control",
          "WHO_Infection_Prevention",
        ],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "high",
        patientPopulation: [
          "immunocompromised",
          "invasive_devices",
          "wound_care",
        ],
        contraindications: [],
        prerequisites: ["infection_risk_assessment"],
        outcomes: [
          {
            type: "preventive",
            description: "Healthcare-associated infection prevention",
            measurable: true,
            timeframe: "monthly",
            target: 1,
            unit: "infections_per_1000_patient_days",
          },
        ],
        conditions: [
          {
            field: "clinical.vitalSigns.temperature",
            operator: ">",
            value: 38.5,
          },
          {
            field: "clinical.laboratoryValues.whiteBloodCount",
            operator: ">",
            value: 12000,
          },
          {
            field: "patient.conditions",
            operator: "contains",
            value: "immunocompromised",
          },
        ],
        actions: [
          {
            type: "protocol",
            description: "Activate infection control measures",
            parameters: {
              isolation: "contact_precautions",
              monitoring: "enhanced",
            },
          },
        ],
        priority: "high",
        enabled: true,
        category: "prevention",
      },
      {
        id: "wound_care_protocol",
        name: "Evidence-Based Wound Care Management",
        description: "Implement evidence-based wound care protocols",
        clinicalDomain: "wound_care",
        evidenceLevel: "A",
        clinicalGuidelines: ["WOCN_Wound_Care", "NPUAP_Pressure_Ulcer"],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "medium",
        patientPopulation: [
          "pressure_ulcer_risk",
          "diabetic",
          "vascular_disease",
        ],
        contraindications: ["wound_infection"],
        prerequisites: ["wound_assessment_completed"],
        outcomes: [
          {
            type: "therapeutic",
            description: "Wound healing progression",
            measurable: true,
            timeframe: "weekly",
            target: 20,
            unit: "percentage_size_reduction",
          },
        ],
        conditions: [
          {
            field: "clinical.assessments",
            operator: "contains",
            value: { type: "wound", stage: { ">=": 2 } },
          },
        ],
        actions: [
          {
            type: "treatment",
            description: "Implement evidence-based wound care",
            parameters: {
              dressing: "moisture_retentive",
              frequency: "daily",
            },
          },
        ],
        priority: "medium",
        enabled: true,
        category: "treatment",
      },
      {
        id: "laboratory_critical_values",
        name: "Critical Laboratory Values Alert",
        description:
          "Alert for critical laboratory values requiring immediate action",
        clinicalDomain: "laboratory_values",
        evidenceLevel: "A",
        clinicalGuidelines: [
          "CAP_Critical_Values",
          "Joint_Commission_Lab_Safety",
        ],
        dohCompliant: true,
        jawdaCompliant: true,
        riskLevel: "critical",
        patientPopulation: ["all_patients"],
        contraindications: [],
        prerequisites: ["laboratory_results_available"],
        outcomes: [
          {
            type: "safety",
            description: "Timely response to critical values",
            measurable: true,
            timeframe: "30_minutes",
            target: 100,
            unit: "percentage_responded",
          },
        ],
        conditions: [
          {
            field: "clinical.laboratoryValues.glucose",
            operator: "<",
            value: 50,
          },
          {
            field: "clinical.laboratoryValues.glucose",
            operator: ">",
            value: 400,
          },
          {
            field: "clinical.laboratoryValues.potassium",
            operator: "<",
            value: 2.5,
          },
          {
            field: "clinical.laboratoryValues.potassium",
            operator: ">",
            value: 6.0,
          },
          {
            field: "clinical.laboratoryValues.creatinine",
            operator: ">",
            value: 3.0,
          },
        ],
        actions: [
          {
            type: "alert",
            description: "Generate critical lab value alert",
            parameters: {
              severity: "critical",
              notification: "immediate",
              escalation: true,
            },
          },
        ],
        priority: "critical",
        enabled: true,
        category: "monitoring",
      },
    ];

    // Register rules with the rules engine
    for (const rule of rules) {
      this.healthcareRules.set(rule.id, rule);
      await rulesEngine.addRule(rule);
    }

    console.log(`✅ Loaded ${rules.length} healthcare-specific rules`);
  }

  /**
   * Initialize clinical decision support
   */
  private async initializeClinicalDecisionSupport(): Promise<void> {
    console.log("🧠 Clinical decision support initialized");
  }

  /**
   * Evaluate healthcare rules for clinical decision support
   */
  public async evaluateHealthcareRules(
    context: HealthcareRuleContext,
  ): Promise<ClinicalDecisionSupport[]> {
    return await errorRecovery.withRecovery(
      async () => {
        const decisions: ClinicalDecisionSupport[] = [];
        const ruleResult = await rulesEngine.evaluateRules(context);

        for (const matchedRule of ruleResult.matchedRules) {
          const healthcareRule = this.healthcareRules.get(matchedRule.id);
          if (!healthcareRule) continue;

          const decision: ClinicalDecisionSupport = {
            ruleId: healthcareRule.id,
            recommendation: this.generateRecommendation(
              healthcareRule,
              context,
            ),
            rationale: this.generateRationale(healthcareRule, context),
            evidenceLevel: healthcareRule.evidenceLevel,
            urgency: this.determineUrgency(healthcareRule),
            actions: this.generateClinicalActions(healthcareRule, context),
            contraindications: healthcareRule.contraindications,
            monitoring: this.generateMonitoringRequirements(healthcareRule),
          };

          decisions.push(decision);
        }

        console.log(
          `🧠 Generated ${decisions.length} clinical decision support recommendations`,
        );
        return decisions;
      },
      {
        maxRetries: 2,
        fallbackValue: [],
      },
    );
  }

  /**
   * Generate clinical recommendation
   */
  private generateRecommendation(
    rule: HealthcareRule,
    context: HealthcareRuleContext,
  ): string {
    switch (rule.clinicalDomain) {
      case "medication_safety":
        return `Medication safety alert: ${rule.description}. Review patient allergies and current medications.`;
      case "vital_signs":
        return `Critical vital signs detected: ${rule.description}. Immediate assessment and intervention required.`;
      case "fall_prevention":
        return `Fall risk identified: ${rule.description}. Implement fall prevention measures immediately.`;
      case "pain_management":
        return `Pain management needed: ${rule.description}. Consider multimodal pain management approach.`;
      case "infection_control":
        return `Infection risk detected: ${rule.description}. Implement infection control measures.`;
      case "wound_care":
        return `Wound care protocol: ${rule.description}. Follow evidence-based wound care guidelines.`;
      case "laboratory_values":
        return `Critical lab values: ${rule.description}. Immediate clinical correlation and intervention required.`;
      default:
        return `Clinical recommendation: ${rule.description}`;
    }
  }

  /**
   * Generate clinical rationale
   */
  private generateRationale(
    rule: HealthcareRule,
    context: HealthcareRuleContext,
  ): string {
    return `Based on ${rule.evidenceLevel} level evidence from ${rule.clinicalGuidelines.join(", ")}. Risk level: ${rule.riskLevel}.`;
  }

  /**
   * Determine urgency level
   */
  private determineUrgency(
    rule: HealthcareRule,
  ): "immediate" | "urgent" | "routine" {
    switch (rule.riskLevel) {
      case "critical":
        return "immediate";
      case "high":
        return "urgent";
      default:
        return "routine";
    }
  }

  /**
   * Generate clinical actions
   */
  private generateClinicalActions(
    rule: HealthcareRule,
    context: HealthcareRuleContext,
  ): ClinicalAction[] {
    const actions: ClinicalAction[] = [];

    switch (rule.clinicalDomain) {
      case "medication_safety":
        actions.push({
          type: "assessment",
          description: "Review medication list and allergy history",
          priority: "immediate",
          timeframe: "5_minutes",
          assignedTo: "pharmacist",
          resources: ["medication_database", "allergy_records"],
          documentation: ["medication_reconciliation", "allergy_verification"],
        });
        break;
      case "vital_signs":
        actions.push({
          type: "monitoring",
          description: "Continuous vital signs monitoring",
          priority: "immediate",
          timeframe: "continuous",
          assignedTo: "nurse",
          resources: ["monitoring_equipment"],
          documentation: ["vital_signs_flow_sheet"],
        });
        break;
      case "fall_prevention":
        actions.push({
          type: "procedure",
          description: "Implement fall prevention measures",
          priority: "urgent",
          timeframe: "30_minutes",
          assignedTo: "nurse",
          resources: ["fall_prevention_kit"],
          documentation: ["fall_risk_assessment", "prevention_measures"],
        });
        break;
    }

    return actions;
  }

  /**
   * Generate monitoring requirements
   */
  private generateMonitoringRequirements(
    rule: HealthcareRule,
  ): MonitoringRequirement[] {
    const requirements: MonitoringRequirement[] = [];

    switch (rule.clinicalDomain) {
      case "vital_signs":
        requirements.push({
          parameter: "vital_signs",
          frequency: "every_15_minutes",
          method: "automated",
          alertThresholds: {
            temperature: { critical_high: 40, critical_low: 35 },
            blood_pressure: { critical_high: 180, critical_low: 90 },
            heart_rate: { critical_high: 120, critical_low: 50 },
            oxygen_saturation: { critical_low: 90 },
          },
          duration: "until_stable",
        });
        break;
      case "laboratory_values":
        requirements.push({
          parameter: "laboratory_values",
          frequency: "daily",
          method: "manual",
          alertThresholds: {
            glucose: { critical_high: 400, critical_low: 50 },
            potassium: { critical_high: 6.0, critical_low: 2.5 },
            creatinine: { critical_high: 3.0 },
          },
          duration: "until_normalized",
        });
        break;
    }

    return requirements;
  }

  /**
   * Get healthcare rule by ID
   */
  public getHealthcareRule(ruleId: string): HealthcareRule | null {
    return this.healthcareRules.get(ruleId) || null;
  }

  /**
   * Get rules by clinical domain
   */
  public getRulesByDomain(domain: string): HealthcareRule[] {
    return Array.from(this.healthcareRules.values()).filter(
      (rule) => rule.clinicalDomain === domain,
    );
  }

  /**
   * Get rules by risk level
   */
  public getRulesByRiskLevel(riskLevel: string): HealthcareRule[] {
    return Array.from(this.healthcareRules.values()).filter(
      (rule) => rule.riskLevel === riskLevel,
    );
  }

  /**
   * Validate clinical context
   */
  public validateClinicalContext(context: HealthcareRuleContext): boolean {
    // Basic validation
    if (!context.patient || !context.clinical) {
      return false;
    }

    // Ensure required clinical data is present
    if (!context.clinical.episodeId || !context.clinical.assessmentType) {
      return false;
    }

    return true;
  }

  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      rulesCount: this.healthcareRules.size,
      rulesByDomain: {
        medication_safety: this.getRulesByDomain("medication_safety").length,
        vital_signs: this.getRulesByDomain("vital_signs").length,
        fall_prevention: this.getRulesByDomain("fall_prevention").length,
        pain_management: this.getRulesByDomain("pain_management").length,
        infection_control: this.getRulesByDomain("infection_control").length,
        wound_care: this.getRulesByDomain("wound_care").length,
        laboratory_values: this.getRulesByDomain("laboratory_values").length,
      },
      rulesByRiskLevel: {
        critical: this.getRulesByRiskLevel("critical").length,
        high: this.getRulesByRiskLevel("high").length,
        medium: this.getRulesByRiskLevel("medium").length,
        low: this.getRulesByRiskLevel("low").length,
      },
    };
  }
}

export const healthcareRulesService = HealthcareRulesService.getInstance();
export default healthcareRulesService;
