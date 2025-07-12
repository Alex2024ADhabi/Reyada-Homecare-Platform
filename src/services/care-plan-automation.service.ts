/**
 * Care Plan Automation Service
 * Intelligent care plan generation, management, and automation with evidence-based recommendations
 */

import {
  rulesEngine,
  RuleContext,
  HealthcareRule,
} from "@/engines/rules.engine";
import { medicationManagementService } from "@/services/medication-management.service";
import { patientSafetyMonitoringService } from "@/services/patient-safety-monitoring.service";
import { errorRecovery } from "@/utils/error-recovery";

export interface CarePlan {
  id: string;
  patientId: string;
  episodeId: string;
  planType:
    | "acute_care"
    | "chronic_management"
    | "rehabilitation"
    | "palliative"
    | "preventive";
  status:
    | "draft"
    | "active"
    | "on_hold"
    | "completed"
    | "cancelled"
    | "revised";
  priority: "low" | "medium" | "high" | "urgent" | "critical";
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  effectiveDate: Date;
  reviewDate: Date;
  expirationDate?: Date;
  goals: CareGoal[];
  interventions: CareIntervention[];
  assessments: CareAssessment[];
  outcomes: CareOutcome[];
  careTeam: CareTeamMember[];
  automationRules: AutomationRule[];
  qualityMetrics: QualityMetric[];
  complianceStatus: ComplianceStatus;
  evidenceBase: EvidenceReference[];
  patientPreferences: PatientPreference[];
  barriers: CareBarrier[];
  resources: CareResource[];
  metadata: Record<string, any>;
}

export interface CareGoal {
  id: string;
  category:
    | "clinical"
    | "functional"
    | "psychosocial"
    | "educational"
    | "safety";
  description: string;
  targetOutcome: string;
  measurableIndicators: MeasurableIndicator[];
  timeframe: {
    start: Date;
    target: Date;
    review: Date;
  };
  priority: "low" | "medium" | "high" | "critical";
  status:
    | "not_started"
    | "in_progress"
    | "achieved"
    | "partially_achieved"
    | "not_achieved"
    | "discontinued";
  assignedTo: string[];
  progress: GoalProgress[];
  barriers: string[];
  interventions: string[]; // References to intervention IDs
  evidenceLevel: "A" | "B" | "C" | "D";
  patientAgreement: boolean;
}

export interface MeasurableIndicator {
  id: string;
  name: string;
  type: "numeric" | "boolean" | "categorical" | "scale";
  unit?: string;
  targetValue: any;
  currentValue?: any;
  frequency: "daily" | "weekly" | "monthly" | "as_needed";
  method: "automated" | "manual" | "patient_reported";
  lastMeasured?: Date;
  trend: "improving" | "stable" | "declining" | "unknown";
}

export interface GoalProgress {
  id: string;
  date: Date;
  status: string;
  progress: number; // 0-100 percentage
  notes: string;
  measuredBy: string;
  nextReview: Date;
  adjustmentsNeeded: boolean;
  adjustmentReason?: string;
}

export interface CareIntervention {
  id: string;
  type:
    | "medication"
    | "procedure"
    | "therapy"
    | "education"
    | "monitoring"
    | "lifestyle"
    | "psychosocial";
  category:
    | "treatment"
    | "prevention"
    | "rehabilitation"
    | "supportive"
    | "palliative";
  name: string;
  description: string;
  rationale: string;
  instructions: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate?: Date;
  status: "planned" | "active" | "completed" | "discontinued" | "on_hold";
  assignedTo: string;
  relatedGoals: string[]; // Goal IDs
  prerequisites: string[];
  contraindications: string[];
  expectedOutcomes: string[];
  monitoringParameters: MonitoringParameter[];
  safetyConsiderations: string[];
  patientInstructions: string;
  caregiverInstructions: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  costEstimate?: number;
  insuranceCoverage?: string;
  automationTriggers: AutomationTrigger[];
}

export interface MonitoringParameter {
  id: string;
  name: string;
  type: "vital_signs" | "laboratory" | "functional" | "behavioral" | "symptom";
  frequency: string;
  alertThresholds: Record<string, any>;
  method: "automated" | "manual" | "patient_reported";
  responsible: string;
}

export interface CareAssessment {
  id: string;
  type: "initial" | "ongoing" | "comprehensive" | "focused" | "discharge";
  name: string;
  description: string;
  frequency: string;
  dueDate: Date;
  completedDate?: Date;
  status: "due" | "overdue" | "completed" | "cancelled";
  assignedTo: string;
  domains: AssessmentDomain[];
  tools: AssessmentTool[];
  findings: AssessmentFinding[];
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface AssessmentDomain {
  name: string;
  score?: number;
  maxScore?: number;
  interpretation: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
}

export interface AssessmentTool {
  name: string;
  version: string;
  validated: boolean;
  score?: number;
  interpretation: string;
}

export interface AssessmentFinding {
  domain: string;
  finding: string;
  significance: "normal" | "abnormal" | "critical";
  actionRequired: boolean;
  recommendations: string[];
}

export interface CareOutcome {
  id: string;
  goalId: string;
  interventionId?: string;
  measureDate: Date;
  outcome: string;
  value: any;
  unit?: string;
  status:
    | "achieved"
    | "partially_achieved"
    | "not_achieved"
    | "improved"
    | "stable"
    | "declined";
  clinicalSignificance: "significant" | "moderate" | "minimal" | "none";
  patientSatisfaction?: number; // 1-10 scale
  notes: string;
  nextMeasurement?: Date;
  trendAnalysis: TrendAnalysis;
}

export interface TrendAnalysis {
  direction: "improving" | "stable" | "declining";
  rate: "rapid" | "moderate" | "slow";
  consistency: "consistent" | "variable" | "inconsistent";
  predictedOutcome: string;
  confidenceLevel: number; // 0-100
}

export interface CareTeamMember {
  id: string;
  name: string;
  role:
    | "physician"
    | "nurse"
    | "pharmacist"
    | "therapist"
    | "social_worker"
    | "dietitian"
    | "case_manager"
    | "specialist";
  specialty?: string;
  responsibilities: string[];
  contactInfo: ContactInfo;
  availability: Availability;
  primaryContact: boolean;
  communicationPreferences: string[];
}

export interface ContactInfo {
  phone: string;
  email: string;
  pager?: string;
  emergencyContact?: string;
}

export interface Availability {
  schedule: string;
  onCall: boolean;
  backupContact?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  priority: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
}

export interface AutomationTrigger {
  type:
    | "time_based"
    | "event_based"
    | "threshold_based"
    | "status_change"
    | "assessment_result";
  parameters: Record<string, any>;
  frequency?: string;
}

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface AutomationAction {
  type:
    | "update_goal"
    | "add_intervention"
    | "schedule_assessment"
    | "send_notification"
    | "escalate_care"
    | "adjust_medication";
  parameters: Record<string, any>;
  delay?: number; // minutes
  conditions?: string[];
}

export interface QualityMetric {
  id: string;
  name: string;
  category: "clinical" | "safety" | "efficiency" | "satisfaction" | "cost";
  target: number;
  current?: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  benchmark: string;
  trendDirection: "improving" | "stable" | "declining";
  lastMeasured?: Date;
}

export interface ComplianceStatus {
  overallScore: number; // 0-100
  clinicalGuidelines: GuidelineCompliance[];
  regulatoryRequirements: RegulatoryCompliance[];
  qualityStandards: QualityCompliance[];
  lastAudit: Date;
  nextAudit: Date;
  deficiencies: ComplianceDeficiency[];
}

export interface GuidelineCompliance {
  guideline: string;
  version: string;
  compliance: number; // 0-100
  lastReview: Date;
  deviations: string[];
}

export interface RegulatoryCompliance {
  regulation: string;
  authority: string;
  compliance: number; // 0-100
  lastInspection?: Date;
  findings: string[];
}

export interface QualityCompliance {
  standard: string;
  organization: string;
  compliance: number; // 0-100
  certification?: string;
  expirationDate?: Date;
}

export interface ComplianceDeficiency {
  type: "clinical" | "regulatory" | "quality";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  correctionPlan: string;
  dueDate: Date;
  responsible: string;
  status: "open" | "in_progress" | "resolved";
}

export interface EvidenceReference {
  id: string;
  type: "guideline" | "research" | "best_practice" | "expert_opinion";
  title: string;
  source: string;
  url?: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  relevance: "high" | "medium" | "low";
  lastReviewed: Date;
  summary: string;
}

export interface PatientPreference {
  id: string;
  category:
    | "treatment"
    | "communication"
    | "cultural"
    | "religious"
    | "lifestyle";
  preference: string;
  importance: "low" | "medium" | "high" | "critical";
  accommodated: boolean;
  notes: string;
}

export interface CareBarrier {
  id: string;
  type:
    | "financial"
    | "transportation"
    | "language"
    | "cultural"
    | "cognitive"
    | "physical"
    | "social";
  description: string;
  impact: "low" | "medium" | "high" | "critical";
  mitigationPlan: string;
  status: "identified" | "addressing" | "resolved";
  responsible: string;
}

export interface CareResource {
  id: string;
  type:
    | "educational"
    | "support_group"
    | "equipment"
    | "service"
    | "financial_assistance";
  name: string;
  description: string;
  provider: string;
  contactInfo: string;
  cost?: number;
  availability: string;
  eligibilityRequirements: string[];
  utilization: ResourceUtilization;
}

export interface ResourceUtilization {
  assigned: boolean;
  startDate?: Date;
  endDate?: Date;
  frequency?: string;
  effectiveness?: "effective" | "partially_effective" | "ineffective";
  patientSatisfaction?: number;
  notes?: string;
}

export interface CarePlanTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  goals: Partial<CareGoal>[];
  interventions: Partial<CareIntervention>[];
  assessments: Partial<CareAssessment>[];
  automationRules: Partial<AutomationRule>[];
  qualityMetrics: Partial<QualityMetric>[];
  careTeamRoles: string[];
  estimatedDuration: number; // days
  complexity: "low" | "medium" | "high";
  lastUpdated: Date;
  approvedBy: string;
}

export interface CarePlanRecommendation {
  id: string;
  type: "goal" | "intervention" | "assessment" | "team_member" | "resource";
  priority: "low" | "medium" | "high" | "critical";
  recommendation: string;
  rationale: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  expectedBenefit: string;
  risks: string[];
  alternatives: string[];
  cost?: number;
  timeframe: string;
  prerequisites: string[];
  contraindications: string[];
  patientFactors: string[];
  clinicalFactors: string[];
  socialFactors: string[];
  confidence: number; // 0-100
}

class CarePlanAutomationService {
  private static instance: CarePlanAutomationService;
  private carePlans = new Map<string, CarePlan>();
  private templates = new Map<string, CarePlanTemplate>();
  private automationRules = new Map<string, AutomationRule>();
  private isInitialized = false;
  private automationInterval: NodeJS.Timeout | null = null;

  public static getInstance(): CarePlanAutomationService {
    if (!CarePlanAutomationService.instance) {
      CarePlanAutomationService.instance = new CarePlanAutomationService();
    }
    return CarePlanAutomationService.instance;
  }

  /**
   * Initialize care plan automation service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🏥 Initializing Care Plan Automation Service...");

      // Load care plan templates
      await this.loadCarePlanTemplates();

      // Initialize automation rules
      await this.initializeAutomationRules();

      // Start automation engine
      await this.startAutomationEngine();

      // Initialize quality monitoring
      await this.initializeQualityMonitoring();

      this.isInitialized = true;
      console.log("✅ Care Plan Automation Service initialized successfully");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Care Plan Automation Service:",
        error,
      );
      throw error;
    }
  }

  /**
   * Load comprehensive care plan templates
   */
  private async loadCarePlanTemplates(): Promise<void> {
    const templates: CarePlanTemplate[] = [
      {
        id: "diabetes_management_template",
        name: "Comprehensive Diabetes Management Plan",
        description:
          "Evidence-based care plan for diabetes management with automated monitoring",
        category: "chronic_disease",
        condition: "diabetes_mellitus",
        evidenceLevel: "A",
        goals: [
          {
            category: "clinical",
            description: "Achieve optimal glycemic control",
            targetOutcome: "HbA1c < 7.0%",
            measurableIndicators: [
              {
                id: "hba1c_indicator",
                name: "HbA1c Level",
                type: "numeric",
                unit: "%",
                targetValue: 7.0,
                frequency: "monthly",
                method: "automated",
                trend: "unknown",
              },
            ],
            priority: "high",
            evidenceLevel: "A",
            patientAgreement: true,
          },
          {
            category: "functional",
            description: "Maintain healthy weight",
            targetOutcome: "BMI 18.5-24.9",
            measurableIndicators: [
              {
                id: "bmi_indicator",
                name: "Body Mass Index",
                type: "numeric",
                unit: "kg/m²",
                targetValue: 24,
                frequency: "weekly",
                method: "manual",
                trend: "unknown",
              },
            ],
            priority: "medium",
            evidenceLevel: "A",
            patientAgreement: true,
          },
        ],
        interventions: [
          {
            type: "medication",
            category: "treatment",
            name: "Metformin Therapy",
            description: "First-line medication for type 2 diabetes",
            rationale: "Evidence-based first-line treatment for T2DM",
            frequency: "twice_daily",
            duration: "ongoing",
            evidenceLevel: "A",
            monitoringParameters: [
              {
                id: "glucose_monitoring",
                name: "Blood Glucose",
                type: "laboratory",
                frequency: "daily",
                alertThresholds: { low: 70, high: 180 },
                method: "patient_reported",
                responsible: "patient",
              },
            ],
          },
          {
            type: "education",
            category: "prevention",
            name: "Diabetes Self-Management Education",
            description: "Comprehensive diabetes education program",
            rationale: "Improves self-care behaviors and outcomes",
            frequency: "initial_and_annual",
            duration: "4_sessions",
            evidenceLevel: "A",
          },
        ],
        assessments: [
          {
            type: "comprehensive",
            name: "Diabetes Comprehensive Assessment",
            description: "Complete diabetes care assessment",
            frequency: "quarterly",
            domains: [
              {
                name: "Glycemic Control",
                interpretation: "Assessment of blood sugar management",
                riskLevel: "medium",
                recommendations: ["Continue current regimen"],
              },
              {
                name: "Complications Screening",
                interpretation: "Screen for diabetes complications",
                riskLevel: "low",
                recommendations: ["Annual screening"],
              },
            ],
          },
        ],
        automationRules: [
          {
            name: "High Glucose Alert",
            description: "Alert when glucose levels are consistently high",
            trigger: {
              type: "threshold_based",
              parameters: { glucose_level: 200, frequency: "3_consecutive" },
            },
            conditions: [
              {
                field: "glucose_level",
                operator: "greater_than",
                value: 200,
              },
            ],
            actions: [
              {
                type: "send_notification",
                parameters: {
                  recipient: "primary_physician",
                  message: "Patient glucose levels consistently elevated",
                },
              },
            ],
            priority: "high",
            enabled: true,
            executionCount: 0,
            successRate: 100,
          },
        ],
        qualityMetrics: [
          {
            name: "HbA1c Target Achievement",
            category: "clinical",
            target: 80,
            unit: "percentage",
            frequency: "quarterly",
            benchmark: "ADA_Guidelines",
            trendDirection: "improving",
          },
        ],
        careTeamRoles: ["physician", "nurse", "dietitian", "pharmacist"],
        estimatedDuration: 365, // 1 year
        complexity: "medium",
        lastUpdated: new Date(),
        approvedBy: "Endocrinology Department",
      },
      {
        id: "hypertension_management_template",
        name: "Hypertension Management Plan",
        description:
          "Comprehensive hypertension management with lifestyle and medication interventions",
        category: "cardiovascular",
        condition: "hypertension",
        evidenceLevel: "A",
        goals: [
          {
            category: "clinical",
            description: "Achieve target blood pressure",
            targetOutcome: "BP < 130/80 mmHg",
            measurableIndicators: [
              {
                id: "bp_indicator",
                name: "Blood Pressure",
                type: "numeric",
                unit: "mmHg",
                targetValue: 130,
                frequency: "daily",
                method: "patient_reported",
                trend: "unknown",
              },
            ],
            priority: "high",
            evidenceLevel: "A",
            patientAgreement: true,
          },
        ],
        interventions: [
          {
            type: "medication",
            category: "treatment",
            name: "ACE Inhibitor Therapy",
            description: "First-line antihypertensive medication",
            rationale: "Evidence-based treatment for hypertension",
            frequency: "daily",
            duration: "ongoing",
            evidenceLevel: "A",
          },
          {
            type: "lifestyle",
            category: "prevention",
            name: "DASH Diet Implementation",
            description: "Dietary Approaches to Stop Hypertension",
            rationale: "Proven dietary intervention for BP reduction",
            frequency: "daily",
            duration: "ongoing",
            evidenceLevel: "A",
          },
        ],
        assessments: [
          {
            type: "ongoing",
            name: "Blood Pressure Monitoring",
            description: "Regular BP monitoring and assessment",
            frequency: "weekly",
          },
        ],
        automationRules: [
          {
            name: "Hypertensive Crisis Alert",
            description: "Immediate alert for severe hypertension",
            trigger: {
              type: "threshold_based",
              parameters: { systolic_bp: 180, diastolic_bp: 120 },
            },
            conditions: [
              {
                field: "systolic_bp",
                operator: "greater_than",
                value: 180,
                logicalOperator: "OR",
              },
              {
                field: "diastolic_bp",
                operator: "greater_than",
                value: 120,
              },
            ],
            actions: [
              {
                type: "escalate_care",
                parameters: {
                  urgency: "immediate",
                  recipient: "emergency_physician",
                },
              },
            ],
            priority: "critical",
            enabled: true,
            executionCount: 0,
            successRate: 100,
          },
        ],
        qualityMetrics: [
          {
            name: "BP Control Rate",
            category: "clinical",
            target: 75,
            unit: "percentage",
            frequency: "monthly",
            benchmark: "AHA_Guidelines",
            trendDirection: "improving",
          },
        ],
        careTeamRoles: ["physician", "nurse", "dietitian"],
        estimatedDuration: 180, // 6 months
        complexity: "medium",
        lastUpdated: new Date(),
        approvedBy: "Cardiology Department",
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });

    console.log(`✅ Loaded ${templates.length} care plan templates`);
  }

  /**
   * Generate intelligent care plan recommendations
   */
  public async generateCarePlanRecommendations(
    patientId: string,
    clinicalData: Record<string, any>,
    preferences: PatientPreference[] = [],
  ): Promise<CarePlanRecommendation[]> {
    return await errorRecovery.withRecovery(
      async () => {
        const recommendations: CarePlanRecommendation[] = [];

        // Analyze patient data using healthcare rules engine
        const ruleContext: RuleContext = {
          data: clinicalData,
          patient: {
            id: patientId,
            age: clinicalData.age || 0,
            conditions: clinicalData.conditions || [],
            medications: clinicalData.medications || [],
            allergies: clinicalData.allergies || [],
          },
          clinical: {
            episodeId: clinicalData.episodeId || "",
            assessmentType: "care_planning",
            urgency: "medium",
          },
        };

        const ruleResults = await rulesEngine.evaluateRules(ruleContext);

        // Generate evidence-based recommendations
        for (const rule of ruleResults.matchedRules) {
          if (rule.category === "care_planning") {
            const recommendation: CarePlanRecommendation = {
              id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: this.determineRecommendationType(rule),
              priority: this.mapRulePriorityToRecommendation(rule.priority),
              recommendation: rule.description,
              rationale: rule.rationale || "Evidence-based recommendation",
              evidenceLevel: rule.evidenceLevel || "B",
              expectedBenefit:
                rule.expectedOutcome || "Improved patient outcomes",
              risks: rule.risks || [],
              alternatives: rule.alternatives || [],
              timeframe: rule.timeframe || "ongoing",
              prerequisites: rule.prerequisites || [],
              contraindications: rule.contraindications || [],
              patientFactors: this.extractPatientFactors(clinicalData),
              clinicalFactors: this.extractClinicalFactors(clinicalData),
              socialFactors: this.extractSocialFactors(clinicalData),
              confidence: rule.confidence || 85,
            };

            recommendations.push(recommendation);
          }
        }

        // Add template-based recommendations
        const templateRecommendations =
          await this.generateTemplateRecommendations(clinicalData, preferences);
        recommendations.push(...templateRecommendations);

        // Sort by priority and confidence
        recommendations.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff =
            priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.confidence - a.confidence;
        });

        console.log(
          `✅ Generated ${recommendations.length} care plan recommendations for patient ${patientId}`,
        );
        return recommendations;
      },
      {
        maxRetries: 2,
        fallbackValue: [],
      },
    );
  }

  /**
   * Create comprehensive care plan
   */
  public async createCarePlan(
    patientId: string,
    episodeId: string,
    planType: CarePlan["planType"],
    clinicalData: Record<string, any>,
    createdBy: string,
    templateId?: string,
  ): Promise<CarePlan> {
    return await errorRecovery.withRecovery(
      async () => {
        const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get recommendations
        const recommendations = await this.generateCarePlanRecommendations(
          patientId,
          clinicalData,
        );

        // Create care plan from template or recommendations
        let carePlan: CarePlan;
        if (templateId && this.templates.has(templateId)) {
          carePlan = await this.createFromTemplate(
            planId,
            patientId,
            episodeId,
            templateId,
            clinicalData,
            createdBy,
          );
        } else {
          carePlan = await this.createFromRecommendations(
            planId,
            patientId,
            episodeId,
            planType,
            recommendations,
            clinicalData,
            createdBy,
          );
        }

        // Initialize automation rules
        await this.initializeCarePlanAutomation(carePlan);

        // Create safety profile integration
        await this.integrateSafetyMonitoring(carePlan);

        // Store care plan
        this.carePlans.set(planId, carePlan);

        console.log(
          `✅ Care plan created: ${carePlan.id} for patient ${patientId}`,
        );
        return carePlan;
      },
      {
        maxRetries: 2,
        fallbackValue: null,
      },
    );
  }

  /**
   * Create care plan from template
   */
  private async createFromTemplate(
    planId: string,
    patientId: string,
    episodeId: string,
    templateId: string,
    clinicalData: Record<string, any>,
    createdBy: string,
  ): Promise<CarePlan> {
    const template = this.templates.get(templateId)!;
    const now = new Date();

    const carePlan: CarePlan = {
      id: planId,
      patientId,
      episodeId,
      planType: "chronic_management", // Default, can be customized
      status: "draft",
      priority: "medium",
      createdBy,
      createdAt: now,
      lastUpdated: now,
      effectiveDate: now,
      reviewDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      goals: this.instantiateGoals(template.goals, clinicalData),
      interventions: this.instantiateInterventions(
        template.interventions,
        clinicalData,
      ),
      assessments: this.instantiateAssessments(
        template.assessments,
        clinicalData,
      ),
      outcomes: [],
      careTeam: this.createCareTeam(template.careTeamRoles, clinicalData),
      automationRules: this.instantiateAutomationRules(
        template.automationRules,
      ),
      qualityMetrics: this.instantiateQualityMetrics(template.qualityMetrics),
      complianceStatus: {
        overallScore: 100,
        clinicalGuidelines: [],
        regulatoryRequirements: [],
        qualityStandards: [],
        lastAudit: now,
        nextAudit: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        deficiencies: [],
      },
      evidenceBase: [
        {
          id: `evidence_${Date.now()}`,
          type: "guideline",
          title: `${template.name} Evidence Base`,
          source: "Clinical Guidelines",
          evidenceLevel: template.evidenceLevel,
          relevance: "high",
          lastReviewed: now,
          summary: `Evidence-based template for ${template.condition}`,
        },
      ],
      patientPreferences: [],
      barriers: [],
      resources: [],
      metadata: {
        templateId,
        templateVersion: "1.0",
        complexity: template.complexity,
        estimatedDuration: template.estimatedDuration,
      },
    };

    return carePlan;
  }

  /**
   * Create care plan from recommendations
   */
  private async createFromRecommendations(
    planId: string,
    patientId: string,
    episodeId: string,
    planType: CarePlan["planType"],
    recommendations: CarePlanRecommendation[],
    clinicalData: Record<string, any>,
    createdBy: string,
  ): Promise<CarePlan> {
    const now = new Date();

    const carePlan: CarePlan = {
      id: planId,
      patientId,
      episodeId,
      planType,
      status: "draft",
      priority: "medium",
      createdBy,
      createdAt: now,
      lastUpdated: now,
      effectiveDate: now,
      reviewDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      goals: this.createGoalsFromRecommendations(recommendations),
      interventions:
        this.createInterventionsFromRecommendations(recommendations),
      assessments: this.createAssessmentsFromRecommendations(recommendations),
      outcomes: [],
      careTeam: this.createDefaultCareTeam(clinicalData),
      automationRules: [],
      qualityMetrics: this.createDefaultQualityMetrics(),
      complianceStatus: {
        overallScore: 95,
        clinicalGuidelines: [],
        regulatoryRequirements: [],
        qualityStandards: [],
        lastAudit: now,
        nextAudit: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        deficiencies: [],
      },
      evidenceBase: recommendations.map((rec) => ({
        id: `evidence_${rec.id}`,
        type: "best_practice",
        title: rec.recommendation,
        source: "AI Recommendations",
        evidenceLevel: rec.evidenceLevel,
        relevance: "high",
        lastReviewed: now,
        summary: rec.rationale,
      })),
      patientPreferences: [],
      barriers: [],
      resources: [],
      metadata: {
        generatedFromRecommendations: true,
        recommendationCount: recommendations.length,
      },
    };

    return carePlan;
  }

  /**
   * Initialize care plan automation
   */
  private async initializeCarePlanAutomation(
    carePlan: CarePlan,
  ): Promise<void> {
    for (const rule of carePlan.automationRules) {
      this.automationRules.set(rule.id, rule);
    }

    // Add default automation rules
    const defaultRules: AutomationRule[] = [
      {
        id: `auto_${carePlan.id}_review`,
        name: "Automatic Care Plan Review",
        description: "Automatically schedule care plan reviews",
        trigger: {
          type: "time_based",
          parameters: { interval: "monthly" },
          frequency: "monthly",
        },
        conditions: [
          {
            field: "status",
            operator: "equals",
            value: "active",
          },
        ],
        actions: [
          {
            type: "schedule_assessment",
            parameters: {
              assessmentType: "care_plan_review",
              assignedTo: carePlan.createdBy,
            },
          },
        ],
        priority: "medium",
        enabled: true,
        executionCount: 0,
        successRate: 100,
      },
    ];

    defaultRules.forEach((rule) => {
      carePlan.automationRules.push(rule);
      this.automationRules.set(rule.id, rule);
    });
  }

  /**
   * Integrate with patient safety monitoring
   */
  private async integrateSafetyMonitoring(carePlan: CarePlan): Promise<void> {
    // Create safety profile if it doesn't exist
    const safetyProfile = patientSafetyMonitoringService.getSafetyProfile(
      carePlan.patientId,
    );

    if (!safetyProfile) {
      await patientSafetyMonitoringService.createSafetyProfile(
        carePlan.patientId,
        {
          carePlanId: carePlan.id,
          goals: carePlan.goals,
          interventions: carePlan.interventions,
        },
        carePlan.createdBy,
      );
    }

    // Add safety-related automation rules
    const safetyRules: AutomationRule[] = [
      {
        id: `safety_${carePlan.id}_monitoring`,
        name: "Safety Monitoring Integration",
        description: "Monitor care plan for safety concerns",
        trigger: {
          type: "event_based",
          parameters: { event: "safety_alert_created" },
        },
        conditions: [
          {
            field: "alert_severity",
            operator: "greater_than",
            value: "medium",
          },
        ],
        actions: [
          {
            type: "send_notification",
            parameters: {
              recipient: "care_team",
              message: "Safety alert requires care plan review",
            },
          },
        ],
        priority: "high",
        enabled: true,
        executionCount: 0,
        successRate: 100,
      },
    ];

    safetyRules.forEach((rule) => {
      carePlan.automationRules.push(rule);
      this.automationRules.set(rule.id, rule);
    });
  }

  /**
   * Start automation engine
   */
  private async startAutomationEngine(): Promise<void> {
    this.automationInterval = setInterval(() => {
      this.processAutomationRules();
    }, 300000); // Check every 5 minutes

    console.log("🤖 Care plan automation engine started");
  }

  /**
   * Process automation rules
   */
  private async processAutomationRules(): Promise<void> {
    for (const rule of this.automationRules.values()) {
      if (!rule.enabled) continue;

      try {
        const shouldExecute = await this.evaluateAutomationRule(rule);
        if (shouldExecute) {
          await this.executeAutomationRule(rule);
          rule.lastExecuted = new Date();
          rule.executionCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing automation rule ${rule.id}:`, error);
        rule.successRate = Math.max(
          0,
          rule.successRate - 5, // Decrease success rate on error
        );
      }
    }
  }

  /**
   * Evaluate automation rule conditions
   */
  private async evaluateAutomationRule(rule: AutomationRule): Promise<boolean> {
    // Check trigger conditions
    if (rule.trigger.type === "time_based") {
      const now = new Date();
      const lastExecuted = rule.lastExecuted || new Date(0);
      const interval = this.parseTimeInterval(
        rule.trigger.frequency || "daily",
      );
      return now.getTime() - lastExecuted.getTime() >= interval;
    }

    // Evaluate rule conditions using rules engine
    const ruleContext: RuleContext = {
      data: { rule: rule },
      patient: {
        id: "",
        age: 0,
        conditions: [],
        medications: [],
        allergies: [],
      },
    };

    const result = await rulesEngine.evaluateRules(ruleContext);
    return result.matchedRules.length > 0;
  }

  /**
   * Execute automation rule actions
   */
  private async executeAutomationRule(rule: AutomationRule): Promise<void> {
    console.log(`🔄 Executing automation rule: ${rule.name}`);

    for (const action of rule.actions) {
      try {
        await this.executeAutomationAction(action, rule);
      } catch (error) {
        console.error(
          `❌ Error executing action ${action.type} for rule ${rule.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Execute individual automation action
   */
  private async executeAutomationAction(
    action: AutomationAction,
    rule: AutomationRule,
  ): Promise<void> {
    switch (action.type) {
      case "send_notification":
        console.log(
          `📧 Notification sent: ${action.parameters.message} to ${action.parameters.recipient}`,
        );
        break;

      case "schedule_assessment":
        console.log(
          `📅 Assessment scheduled: ${action.parameters.assessmentType}`,
        );
        break;

      case "update_goal":
        console.log(`🎯 Goal updated based on automation rule`);
        break;

      case "add_intervention":
        console.log(`💊 Intervention added based on automation rule`);
        break;

      case "escalate_care":
        console.log(
          `🚨 Care escalated: ${action.parameters.urgency} to ${action.parameters.recipient}`,
        );
        break;

      case "adjust_medication":
        // Integrate with medication management service
        console.log(`💊 Medication adjustment triggered`);
        break;

      default:
        console.warn(`⚠️ Unknown automation action type: ${action.type}`);
    }
  }

  /**
   * Update care plan progress
   */
  public async updateCarePlanProgress(
    planId: string,
    progressData: {
      goalId?: string;
      interventionId?: string;
      assessmentId?: string;
      outcome?: Partial<CareOutcome>;
      notes?: string;
    },
    updatedBy: string,
  ): Promise<boolean> {
    const carePlan = this.carePlans.get(planId);
    if (!carePlan) return false;

    try {
      // Update goal progress
      if (progressData.goalId) {
        const goal = carePlan.goals.find((g) => g.id === progressData.goalId);
        if (goal) {
          const progress: GoalProgress = {
            id: `progress_${Date.now()}`,
            date: new Date(),
            status: "in_progress",
            progress: 50, // Default, should be calculated
            notes: progressData.notes || "",
            measuredBy: updatedBy,
            nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            adjustmentsNeeded: false,
          };
          goal.progress = goal.progress || [];
          goal.progress.push(progress);
        }
      }

      // Add outcome if provided
      if (progressData.outcome) {
        const outcome: CareOutcome = {
          id: `outcome_${Date.now()}`,
          goalId: progressData.goalId || "",
          interventionId: progressData.interventionId,
          measureDate: new Date(),
          outcome: progressData.outcome.outcome || "Progress noted",
          value: progressData.outcome.value,
          unit: progressData.outcome.unit,
          status: progressData.outcome.status || "improved",
          clinicalSignificance:
            progressData.outcome.clinicalSignificance || "moderate",
          patientSatisfaction: progressData.outcome.patientSatisfaction,
          notes: progressData.notes || "",
          trendAnalysis: {
            direction: "improving",
            rate: "moderate",
            consistency: "consistent",
            predictedOutcome: "Continued improvement expected",
            confidenceLevel: 80,
          },
        };
        carePlan.outcomes.push(outcome);
      }

      carePlan.lastUpdated = new Date();

      console.log(`✅ Care plan progress updated: ${planId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating care plan progress:`, error);
      return false;
    }
  }

  /**
   * Initialize quality monitoring
   */
  private async initializeQualityMonitoring(): Promise<void> {
    setInterval(() => {
      this.monitorCarePlanQuality();
    }, 3600000); // Check every hour

    console.log("📊 Care plan quality monitoring initialized");
  }

  /**
   * Monitor care plan quality
   */
  private monitorCarePlanQuality(): void {
    for (const carePlan of this.carePlans.values()) {
      if (carePlan.status !== "active") continue;

      // Check for overdue assessments
      const overdueAssessments = carePlan.assessments.filter(
        (assessment) =>
          assessment.status === "due" && new Date() > assessment.dueDate,
      );

      if (overdueAssessments.length > 0) {
        console.warn(
          `⚠️ Care plan ${carePlan.id} has ${overdueAssessments.length} overdue assessments`,
        );
      }

      // Check goal progress
      const stagnantGoals = carePlan.goals.filter((goal) => {
        const lastProgress = goal.progress?.[goal.progress.length - 1];
        if (!lastProgress) return true;
        const daysSinceUpdate =
          (Date.now() - lastProgress.date.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 14; // No progress in 2 weeks
      });

      if (stagnantGoals.length > 0) {
        console.warn(
          `⚠️ Care plan ${carePlan.id} has ${stagnantGoals.length} stagnant goals`,
        );
      }

      // Update quality metrics
      this.updateQualityMetrics(carePlan);
    }
  }

  /**
   * Update quality metrics for care plan
   */
  private updateQualityMetrics(carePlan: CarePlan): void {
    for (const metric of carePlan.qualityMetrics) {
      switch (metric.name) {
        case "Goal Achievement Rate":
          const achievedGoals = carePlan.goals.filter(
            (g) => g.status === "achieved",
          ).length;
          metric.current = (achievedGoals / carePlan.goals.length) * 100;
          break;

        case "Assessment Timeliness":
          const onTimeAssessments = carePlan.assessments.filter(
            (a) => a.status === "completed" && a.completedDate! <= a.dueDate,
          ).length;
          metric.current =
            (onTimeAssessments / carePlan.assessments.length) * 100;
          break;

        case "Intervention Adherence":
          const activeInterventions = carePlan.interventions.filter(
            (i) => i.status === "active",
          ).length;
          metric.current =
            (activeInterventions / carePlan.interventions.length) * 100;
          break;
      }

      metric.lastMeasured = new Date();
      metric.trendDirection =
        metric.current! >= metric.target ? "improving" : "declining";
    }
  }

  // Helper methods for template instantiation
  private instantiateGoals(
    templateGoals: Partial<CareGoal>[],
    clinicalData: Record<string, any>,
  ): CareGoal[] {
    return templateGoals.map((templateGoal, index) => ({
      id: `goal_${Date.now()}_${index}`,
      category: templateGoal.category || "clinical",
      description: templateGoal.description || "Care goal",
      targetOutcome: templateGoal.targetOutcome || "Improved outcome",
      measurableIndicators: templateGoal.measurableIndicators || [],
      timeframe: {
        start: new Date(),
        target: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        review: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      priority: templateGoal.priority || "medium",
      status: "not_started",
      assignedTo: ["primary_nurse"],
      progress: [],
      barriers: [],
      interventions: [],
      evidenceLevel: templateGoal.evidenceLevel || "B",
      patientAgreement: templateGoal.patientAgreement || false,
    }));
  }

  private instantiateInterventions(
    templateInterventions: Partial<CareIntervention>[],
    clinicalData: Record<string, any>,
  ): CareIntervention[] {
    return templateInterventions.map((templateIntervention, index) => ({
      id: `intervention_${Date.now()}_${index}`,
      type: templateIntervention.type || "monitoring",
      category: templateIntervention.category || "treatment",
      name: templateIntervention.name || "Care intervention",
      description:
        templateIntervention.description || "Intervention description",
      rationale: templateIntervention.rationale || "Clinical rationale",
      instructions: templateIntervention.instructions || "Follow instructions",
      frequency: templateIntervention.frequency || "daily",
      duration: templateIntervention.duration || "ongoing",
      startDate: new Date(),
      status: "planned",
      assignedTo: "primary_nurse",
      relatedGoals: [],
      prerequisites: [],
      contraindications: [],
      expectedOutcomes: [],
      monitoringParameters: templateIntervention.monitoringParameters || [],
      safetyConsiderations: [],
      patientInstructions: "",
      caregiverInstructions: "",
      evidenceLevel: templateIntervention.evidenceLevel || "B",
      automationTriggers: [],
    }));
  }

  private instantiateAssessments(
    templateAssessments: Partial<CareAssessment>[],
    clinicalData: Record<string, any>,
  ): CareAssessment[] {
    return templateAssessments.map((templateAssessment, index) => ({
      id: `assessment_${Date.now()}_${index}`,
      type: templateAssessment.type || "ongoing",
      name: templateAssessment.name || "Care assessment",
      description: templateAssessment.description || "Assessment description",
      frequency: templateAssessment.frequency || "weekly",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "due",
      assignedTo: "primary_nurse",
      domains: templateAssessment.domains || [],
      tools: [],
      findings: [],
      recommendations: [],
      followUpRequired: false,
    }));
  }

  private instantiateAutomationRules(
    templateRules: Partial<AutomationRule>[],
  ): AutomationRule[] {
    return templateRules.map((templateRule, index) => ({
      id: `rule_${Date.now()}_${index}`,
      name: templateRule.name || "Automation rule",
      description: templateRule.description || "Rule description",
      trigger: templateRule.trigger || {
        type: "time_based",
        parameters: {},
      },
      conditions: templateRule.conditions || [],
      actions: templateRule.actions || [],
      priority: templateRule.priority || "medium",
      enabled: templateRule.enabled !== false,
      executionCount: 0,
      successRate: 100,
    }));
  }

  private instantiateQualityMetrics(
    templateMetrics: Partial<QualityMetric>[],
  ): QualityMetric[] {
    return templateMetrics.map((templateMetric, index) => ({
      id: `metric_${Date.now()}_${index}`,
      name: templateMetric.name || "Quality metric",
      category: templateMetric.category || "clinical",
      target: templateMetric.target || 80,
      unit: templateMetric.unit || "percentage",
      frequency: templateMetric.frequency || "monthly",
      benchmark: templateMetric.benchmark || "Industry Standard",
      trendDirection: "stable",
    }));
  }

  // Helper methods for recommendation-based creation
  private createGoalsFromRecommendations(
    recommendations: CarePlanRecommendation[],
  ): CareGoal[] {
    return recommendations
      .filter((rec) => rec.type === "goal")
      .map((rec, index) => ({
        id: `goal_${Date.now()}_${index}`,
        category: "clinical",
        description: rec.recommendation,
        targetOutcome: rec.expectedBenefit,
        measurableIndicators: [],
        timeframe: {
          start: new Date(),
          target: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          review: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        priority: rec.priority,
        status: "not_started",
        assignedTo: ["primary_nurse"],
        progress: [],
        barriers: [],
        interventions: [],
        evidenceLevel: rec.evidenceLevel,
        patientAgreement: false,
      }));
  }

  private createInterventionsFromRecommendations(
    recommendations: CarePlanRecommendation[],
  ): CareIntervention[] {
    return recommendations
      .filter((rec) => rec.type === "intervention")
      .map((rec, index) => ({
        id: `intervention_${Date.now()}_${index}`,
        type: "monitoring",
        category: "treatment",
        name: rec.recommendation,
        description: rec.rationale,
        rationale: rec.rationale,
        instructions: "Follow care plan instructions",
        frequency: "daily",
        duration: rec.timeframe,
        startDate: new Date(),
        status: "planned",
        assignedTo: "primary_nurse",
        relatedGoals: [],
        prerequisites: rec.prerequisites,
        contraindications: rec.contraindications,
        expectedOutcomes: [rec.expectedBenefit],
        monitoringParameters: [],
        safetyConsiderations: rec.risks,
        patientInstructions: "",
        caregiverInstructions: "",
        evidenceLevel: rec.evidenceLevel,
        automationTriggers: [],
      }));
  }

  private createAssessmentsFromRecommendations(
    recommendations: CarePlanRecommendation[],
  ): CareAssessment[] {
    return recommendations
      .filter((rec) => rec.type === "assessment")
      .map((rec, index) => ({
        id: `assessment_${Date.now()}_${index}`,
        type: "ongoing",
        name: rec.recommendation,
        description: rec.rationale,
        frequency: "weekly",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "due",
        assignedTo: "primary_nurse",
        domains: [],
        tools: [],
        findings: [],
        recommendations: [],
        followUpRequired: false,
      }));
  }

  private createCareTeam(
    roles: string[],
    clinicalData: Record<string, any>,
  ): CareTeamMember[] {
    return roles.map((role, index) => ({
      id: `team_${Date.now()}_${index}`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} Team Member`,
      role: role as CareTeamMember["role"],
      responsibilities: [`Primary ${role} responsibilities`],
      contactInfo: {
        phone: "555-0000",
        email: `${role}@healthcare.com`,
      },
      availability: {
        schedule: "Monday-Friday 8AM-5PM",
        onCall: false,
      },
      primaryContact: index === 0,
      communicationPreferences: ["email", "phone"],
    }));
  }

  private createDefaultCareTeam(
    clinicalData: Record<string, any>,
  ): CareTeamMember[] {
    return this.createCareTeam(["physician", "nurse"], clinicalData);
  }

  private createDefaultQualityMetrics(): QualityMetric[] {
    return [
      {
        id: `metric_${Date.now()}_1`,
        name: "Goal Achievement Rate",
        category: "clinical",
        target: 80,
        unit: "percentage",
        frequency: "monthly",
        benchmark: "Industry Standard",
        trendDirection: "stable",
      },
      {
        id: `metric_${Date.now()}_2`,
        name: "Assessment Timeliness",
        category: "efficiency",
        target: 95,
        unit: "percentage",
        frequency: "weekly",
        benchmark: "Quality Standards",
        trendDirection: "stable",
      },
    ];
  }

  // Helper methods for recommendation generation
  private generateTemplateRecommendations(
    clinicalData: Record<string, any>,
    preferences: PatientPreference[],
  ): CarePlanRecommendation[] {
    const recommendations: CarePlanRecommendation[] = [];

    // Analyze conditions and suggest templates
    const conditions = clinicalData.conditions || [];
    for (const condition of conditions) {
      const matchingTemplates = Array.from(this.templates.values()).filter(
        (template) => template.condition.includes(condition.toLowerCase()),
      );

      for (const template of matchingTemplates) {
        recommendations.push({
          id: `template_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "goal",
          priority: "high",
          recommendation: `Implement ${template.name}`,
          rationale: template.description,
          evidenceLevel: template.evidenceLevel,
          expectedBenefit: "Improved clinical outcomes",
          risks: [],
          alternatives: [],
          timeframe: `${template.estimatedDuration} days`,
          prerequisites: [],
          contraindications: [],
          patientFactors: [],
          clinicalFactors: [condition],
          socialFactors: [],
          confidence: 90,
        });
      }
    }

    return recommendations;
  }

  private determineRecommendationType(
    rule: HealthcareRule,
  ): CarePlanRecommendation["type"] {
    if (rule.category.includes("goal")) return "goal";
    if (rule.category.includes("intervention")) return "intervention";
    if (rule.category.includes("assessment")) return "assessment";
    if (rule.category.includes("team")) return "team_member";
    return "intervention";
  }

  private mapRulePriorityToRecommendation(
    priority: string,
  ): CarePlanRecommendation["priority"] {
    switch (priority.toLowerCase()) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "medium";
    }
  }

  private extractPatientFactors(clinicalData: Record<string, any>): string[] {
    const factors: string[] = [];
    if (clinicalData.age) factors.push(`Age: ${clinicalData.age}`);
    if (clinicalData.gender) factors.push(`Gender: ${clinicalData.gender}`);
    if (clinicalData.allergies)
      factors.push(`Allergies: ${clinicalData.allergies.join(", ")}`);
    return factors;
  }

  private extractClinicalFactors(clinicalData: Record<string, any>): string[] {
    const factors: string[] = [];
    if (clinicalData.conditions)
      factors.push(`Conditions: ${clinicalData.conditions.join(", ")}`);
    if (clinicalData.medications)
      factors.push(`Medications: ${clinicalData.medications.length} active`);
    return factors;
  }

  private extractSocialFactors(clinicalData: Record<string, any>): string[] {
    const factors: string[] = [];
    if (clinicalData.insurance)
      factors.push(`Insurance: ${clinicalData.insurance}`);
    if (clinicalData.supportSystem)
      factors.push(`Support: ${clinicalData.supportSystem}`);
    return factors;
  }

  private parseTimeInterval(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case "hourly":
        return 60 * 60 * 1000;
      case "daily":
        return 24 * 60 * 60 * 1000;
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000; // Default to daily
    }
  }

  /**
   * Get care plan by ID
   */
  public getCarePlan(planId: string): CarePlan | null {
    return this.carePlans.get(planId) || null;
  }

  /**
   * Get care plans for patient
   */
  public getPatientCarePlans(patientId: string): CarePlan[] {
    return Array.from(this.carePlans.values()).filter(
      (plan) => plan.patientId === patientId,
    );
  }

  /**
   * Get active care plans
   */
  public getActiveCarePlans(): CarePlan[] {
    return Array.from(this.carePlans.values()).filter(
      (plan) => plan.status === "active",
    );
  }

  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      carePlansCount: this.carePlans.size,
      templatesCount: this.templates.size,
      automationRulesCount: this.automationRules.size,
      activeCarePlansCount: this.getActiveCarePlans().length,
      automationEngineRunning: this.automationInterval !== null,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.automationInterval) {
      clearInterval(this.automationInterval);
      this.automationInterval = null;
    }
  }
}

export const carePlanAutomationService =
  CarePlanAutomationService.getInstance();
export default carePlanAutomationService;
