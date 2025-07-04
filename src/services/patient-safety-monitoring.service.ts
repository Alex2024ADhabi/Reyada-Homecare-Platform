/**
 * Patient Safety Monitoring Service
 * Real-time patient safety monitoring with automated alerts and interventions
 */

import { rulesEngine, RuleContext } from "@/engines/rules.engine";
import { errorRecovery } from "@/utils/error-recovery";

export interface PatientSafetyProfile {
  patientId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: RiskFactor[];
  safetyAlerts: SafetyAlert[];
  monitoringParameters: MonitoringParameter[];
  interventions: SafetyIntervention[];
  lastAssessment: Date;
  nextAssessment: Date;
  assignedSafetyOfficer: string;
}

export interface RiskFactor {
  id: string;
  type:
    | "clinical"
    | "environmental"
    | "behavioral"
    | "medication"
    | "procedural";
  category:
    | "fall_risk"
    | "medication_error"
    | "infection_risk"
    | "pressure_ulcer"
    | "suicide_risk"
    | "violence_risk";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  identifiedDate: Date;
  mitigationPlan: string;
  status: "active" | "mitigated" | "resolved";
  evidenceLevel: "A" | "B" | "C" | "D";
}

export interface SafetyAlert {
  id: string;
  patientId: string;
  type: "critical" | "high" | "medium" | "low" | "informational";
  category:
    | "vital_signs"
    | "medication"
    | "fall_risk"
    | "infection"
    | "behavioral"
    | "environmental";
  title: string;
  message: string;
  triggeredBy: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  escalated: boolean;
  escalatedTo?: string;
  actions: SafetyAction[];
  metadata: Record<string, any>;
}

export interface MonitoringParameter {
  id: string;
  name: string;
  type:
    | "vital_signs"
    | "laboratory"
    | "behavioral"
    | "environmental"
    | "medication_levels";
  value: any;
  unit?: string;
  normalRange: {
    min?: number;
    max?: number;
    target?: number;
  };
  alertThresholds: {
    critical_low?: number;
    low?: number;
    high?: number;
    critical_high?: number;
  };
  frequency: "continuous" | "hourly" | "every_4_hours" | "daily" | "weekly";
  lastMeasurement: Date;
  trend: "improving" | "stable" | "declining" | "critical";
  automated: boolean;
}

export interface SafetyIntervention {
  id: string;
  type: "preventive" | "corrective" | "emergency" | "educational";
  category:
    | "medication_safety"
    | "fall_prevention"
    | "infection_control"
    | "behavioral_management";
  description: string;
  implementedBy: string;
  implementedAt: Date;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  effectiveness:
    | "effective"
    | "partially_effective"
    | "ineffective"
    | "unknown";
  followUpRequired: boolean;
  followUpDate?: Date;
  outcome: string;
}

export interface SafetyAction {
  id: string;
  type:
    | "notification"
    | "escalation"
    | "intervention"
    | "documentation"
    | "monitoring_change";
  description: string;
  priority: "immediate" | "urgent" | "routine";
  assignedTo: string;
  dueDate: Date;
  status: "pending" | "in_progress" | "completed" | "overdue";
  completedBy?: string;
  completedAt?: Date;
  result?: string;
}

export interface SafetyMetrics {
  patientId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalAlerts: number;
    criticalAlerts: number;
    resolvedAlerts: number;
    averageResolutionTime: number; // minutes
    preventedIncidents: number;
    safetyScore: number; // 0-100
    riskReduction: number; // percentage
    complianceScore: number; // 0-100
  };
  trends: {
    alertFrequency: "increasing" | "stable" | "decreasing";
    riskLevel: "increasing" | "stable" | "decreasing";
    interventionEffectiveness: "improving" | "stable" | "declining";
  };
}

export interface SafetyProtocol {
  id: string;
  name: string;
  description: string;
  category:
    | "fall_prevention"
    | "medication_safety"
    | "infection_control"
    | "suicide_prevention"
    | "violence_prevention";
  triggers: ProtocolTrigger[];
  steps: ProtocolStep[];
  monitoringRequirements: MonitoringRequirement[];
  documentation: DocumentationRequirement[];
  qualityIndicators: QualityIndicator[];
  evidenceBase: string[];
  lastReviewed: Date;
  nextReview: Date;
  approvedBy: string;
}

export interface ProtocolTrigger {
  condition: string;
  threshold: any;
  urgency: "immediate" | "urgent" | "routine";
  autoActivate: boolean;
}

export interface ProtocolStep {
  id: string;
  name: string;
  description: string;
  role: string;
  timeframe: number; // minutes
  mandatory: boolean;
  dependencies: string[];
  documentation: string[];
}

export interface MonitoringRequirement {
  parameter: string;
  frequency: string;
  method: "automated" | "manual" | "hybrid";
  alertThresholds: Record<string, any>;
}

export interface DocumentationRequirement {
  type: string;
  frequency: string;
  template: string;
  mandatory: boolean;
}

export interface QualityIndicator {
  name: string;
  target: number;
  measurement: string;
  frequency: string;
}

class PatientSafetyMonitoringService {
  private static instance: PatientSafetyMonitoringService;
  private safetyProfiles = new Map<string, PatientSafetyProfile>();
  private safetyProtocols = new Map<string, SafetyProtocol>();
  private activeAlerts = new Map<string, SafetyAlert>();
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): PatientSafetyMonitoringService {
    if (!PatientSafetyMonitoringService.instance) {
      PatientSafetyMonitoringService.instance =
        new PatientSafetyMonitoringService();
    }
    return PatientSafetyMonitoringService.instance;
  }

  /**
   * Initialize patient safety monitoring service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🛡️ Initializing Patient Safety Monitoring Service...");

      // Load safety protocols
      await this.loadSafetyProtocols();

      // Initialize real-time monitoring
      await this.startRealTimeMonitoring();

      // Initialize alert processing
      await this.initializeAlertProcessing();

      this.isInitialized = true;
      console.log(
        "✅ Patient Safety Monitoring Service initialized successfully",
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize Patient Safety Monitoring Service:",
        error,
      );
      throw error;
    }
  }

  /**
   * Load comprehensive safety protocols
   */
  private async loadSafetyProtocols(): Promise<void> {
    const protocols: SafetyProtocol[] = [
      {
        id: "fall_prevention_protocol",
        name: "Comprehensive Fall Prevention Protocol",
        description:
          "Evidence-based fall prevention protocol with risk assessment and interventions",
        category: "fall_prevention",
        triggers: [
          {
            condition: "age >= 65",
            threshold: 65,
            urgency: "routine",
            autoActivate: true,
          },
          {
            condition: "mobility_score < 3",
            threshold: 3,
            urgency: "urgent",
            autoActivate: true,
          },
          {
            condition: "fall_history = true",
            threshold: true,
            urgency: "urgent",
            autoActivate: true,
          },
        ],
        steps: [
          {
            id: "fall_risk_assessment",
            name: "Comprehensive Fall Risk Assessment",
            description: "Complete validated fall risk assessment tool",
            role: "nurse",
            timeframe: 30,
            mandatory: true,
            dependencies: [],
            documentation: ["fall_risk_score", "risk_factors_identified"],
          },
          {
            id: "environmental_assessment",
            name: "Environmental Safety Assessment",
            description: "Assess patient environment for fall hazards",
            role: "nurse",
            timeframe: 15,
            mandatory: true,
            dependencies: ["fall_risk_assessment"],
            documentation: ["environmental_hazards", "safety_modifications"],
          },
          {
            id: "intervention_implementation",
            name: "Fall Prevention Interventions",
            description:
              "Implement evidence-based fall prevention interventions",
            role: "nurse",
            timeframe: 45,
            mandatory: true,
            dependencies: ["environmental_assessment"],
            documentation: ["interventions_implemented", "patient_education"],
          },
        ],
        monitoringRequirements: [
          {
            parameter: "mobility_status",
            frequency: "daily",
            method: "manual",
            alertThresholds: { deterioration: true },
          },
          {
            parameter: "medication_effects",
            frequency: "every_4_hours",
            method: "automated",
            alertThresholds: { sedation_level: "high" },
          },
        ],
        documentation: [
          {
            type: "fall_risk_assessment",
            frequency: "daily",
            template: "fall_risk_form",
            mandatory: true,
          },
          {
            type: "intervention_effectiveness",
            frequency: "weekly",
            template: "intervention_review_form",
            mandatory: true,
          },
        ],
        qualityIndicators: [
          {
            name: "fall_rate_reduction",
            target: 50,
            measurement: "percentage_reduction_in_falls",
            frequency: "monthly",
          },
          {
            name: "assessment_timeliness",
            target: 95,
            measurement: "percentage_assessments_completed_on_time",
            frequency: "weekly",
          },
        ],
        evidenceBase: [
          "CDC_Fall_Prevention_Guidelines",
          "Joint_Commission_Fall_Prevention",
          "AHRQ_Fall_Prevention_Toolkit",
        ],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        approvedBy: "Chief Nursing Officer",
      },
      {
        id: "medication_safety_protocol",
        name: "Comprehensive Medication Safety Protocol",
        description:
          "Multi-layered medication safety protocol with automated checks",
        category: "medication_safety",
        triggers: [
          {
            condition: "high_risk_medication = true",
            threshold: true,
            urgency: "immediate",
            autoActivate: true,
          },
          {
            condition: "polypharmacy >= 5",
            threshold: 5,
            urgency: "urgent",
            autoActivate: true,
          },
          {
            condition: "renal_impairment = true",
            threshold: true,
            urgency: "urgent",
            autoActivate: true,
          },
        ],
        steps: [
          {
            id: "medication_reconciliation",
            name: "Comprehensive Medication Reconciliation",
            description: "Complete medication reconciliation with all sources",
            role: "pharmacist",
            timeframe: 60,
            mandatory: true,
            dependencies: [],
            documentation: [
              "current_medications",
              "discontinued_medications",
              "new_medications",
            ],
          },
          {
            id: "interaction_screening",
            name: "Drug Interaction Screening",
            description: "Automated and manual drug interaction screening",
            role: "pharmacist",
            timeframe: 30,
            mandatory: true,
            dependencies: ["medication_reconciliation"],
            documentation: [
              "interactions_identified",
              "clinical_significance",
              "recommendations",
            ],
          },
          {
            id: "dosage_optimization",
            name: "Dosage Optimization",
            description: "Optimize dosages based on patient factors",
            role: "pharmacist",
            timeframe: 45,
            mandatory: true,
            dependencies: ["interaction_screening"],
            documentation: [
              "dosage_adjustments",
              "rationale",
              "monitoring_plan",
            ],
          },
        ],
        monitoringRequirements: [
          {
            parameter: "medication_adherence",
            frequency: "daily",
            method: "hybrid",
            alertThresholds: { non_adherence: true },
          },
          {
            parameter: "adverse_drug_reactions",
            frequency: "continuous",
            method: "automated",
            alertThresholds: { severity: "moderate" },
          },
        ],
        documentation: [
          {
            type: "medication_reconciliation",
            frequency: "admission_and_discharge",
            template: "med_rec_form",
            mandatory: true,
          },
          {
            type: "adverse_event_reporting",
            frequency: "as_needed",
            template: "adverse_event_form",
            mandatory: true,
          },
        ],
        qualityIndicators: [
          {
            name: "medication_error_rate",
            target: 0.1,
            measurement: "errors_per_1000_doses",
            frequency: "monthly",
          },
          {
            name: "adverse_drug_event_rate",
            target: 2,
            measurement: "events_per_1000_patient_days",
            frequency: "monthly",
          },
        ],
        evidenceBase: [
          "ISMP_Medication_Safety_Guidelines",
          "Joint_Commission_Medication_Management",
          "WHO_Medication_Safety_Standards",
        ],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approvedBy: "Chief Pharmacist",
      },
      {
        id: "infection_control_protocol",
        name: "Advanced Infection Control Protocol",
        description: "Comprehensive infection prevention and control protocol",
        category: "infection_control",
        triggers: [
          {
            condition: "temperature > 38.5",
            threshold: 38.5,
            urgency: "urgent",
            autoActivate: true,
          },
          {
            condition: "white_blood_count > 12000",
            threshold: 12000,
            urgency: "urgent",
            autoActivate: true,
          },
          {
            condition: "isolation_required = true",
            threshold: true,
            urgency: "immediate",
            autoActivate: true,
          },
        ],
        steps: [
          {
            id: "infection_risk_assessment",
            name: "Infection Risk Assessment",
            description: "Comprehensive assessment of infection risk factors",
            role: "nurse",
            timeframe: 20,
            mandatory: true,
            dependencies: [],
            documentation: [
              "risk_factors",
              "infection_history",
              "current_symptoms",
            ],
          },
          {
            id: "isolation_precautions",
            name: "Implement Isolation Precautions",
            description: "Implement appropriate isolation precautions",
            role: "nurse",
            timeframe: 15,
            mandatory: true,
            dependencies: ["infection_risk_assessment"],
            documentation: [
              "isolation_type",
              "precautions_implemented",
              "staff_education",
            ],
          },
          {
            id: "monitoring_surveillance",
            name: "Infection Monitoring and Surveillance",
            description: "Continuous monitoring for signs of infection",
            role: "nurse",
            timeframe: 30,
            mandatory: true,
            dependencies: ["isolation_precautions"],
            documentation: [
              "monitoring_parameters",
              "surveillance_results",
              "trend_analysis",
            ],
          },
        ],
        monitoringRequirements: [
          {
            parameter: "vital_signs",
            frequency: "every_4_hours",
            method: "automated",
            alertThresholds: { fever: 38.5, tachycardia: 100 },
          },
          {
            parameter: "laboratory_values",
            frequency: "daily",
            method: "automated",
            alertThresholds: { wbc_elevation: 12000, procalcitonin: 0.5 },
          },
        ],
        documentation: [
          {
            type: "infection_assessment",
            frequency: "daily",
            template: "infection_assessment_form",
            mandatory: true,
          },
          {
            type: "isolation_compliance",
            frequency: "shift",
            template: "isolation_compliance_form",
            mandatory: true,
          },
        ],
        qualityIndicators: [
          {
            name: "healthcare_associated_infection_rate",
            target: 1,
            measurement: "infections_per_1000_patient_days",
            frequency: "monthly",
          },
          {
            name: "isolation_compliance_rate",
            target: 98,
            measurement: "percentage_compliance_with_isolation_precautions",
            frequency: "weekly",
          },
        ],
        evidenceBase: [
          "CDC_Infection_Control_Guidelines",
          "WHO_Infection_Prevention_Standards",
          "Joint_Commission_Infection_Control",
        ],
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approvedBy: "Infection Control Officer",
      },
    ];

    protocols.forEach((protocol) => {
      this.safetyProtocols.set(protocol.id, protocol);
    });

    console.log(`✅ Loaded ${protocols.length} safety protocols`);
  }

  /**
   * Create or update patient safety profile
   */
  public async createSafetyProfile(
    patientId: string,
    clinicalData: Record<string, any>,
    assignedSafetyOfficer: string,
  ): Promise<PatientSafetyProfile> {
    return await errorRecovery.withRecovery(
      async () => {
        const riskFactors = await this.assessRiskFactors(
          patientId,
          clinicalData,
        );
        const riskLevel = this.calculateOverallRiskLevel(riskFactors);
        const monitoringParameters = await this.determineMonitoringParameters(
          riskLevel,
          riskFactors,
        );

        const profile: PatientSafetyProfile = {
          patientId,
          riskLevel,
          riskFactors,
          safetyAlerts: [],
          monitoringParameters,
          interventions: [],
          lastAssessment: new Date(),
          nextAssessment: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          assignedSafetyOfficer,
        };

        this.safetyProfiles.set(patientId, profile);

        // Activate relevant safety protocols
        await this.activateSafetyProtocols(profile);

        console.log(
          `✅ Safety profile created for patient: ${patientId} (Risk Level: ${riskLevel})`,
        );
        return profile;
      },
      {
        maxRetries: 2,
        fallbackValue: null,
      },
    );
  }

  /**
   * Assess patient risk factors
   */
  private async assessRiskFactors(
    patientId: string,
    clinicalData: Record<string, any>,
  ): Promise<RiskFactor[]> {
    const riskFactors: RiskFactor[] = [];

    // Fall risk assessment
    if (
      clinicalData.age >= 65 ||
      clinicalData.mobilityScore < 3 ||
      clinicalData.fallHistory
    ) {
      riskFactors.push({
        id: `fall_risk_${Date.now()}`,
        type: "clinical",
        category: "fall_risk",
        severity: clinicalData.age >= 80 ? "high" : "medium",
        description: "Elevated fall risk based on age, mobility, and history",
        identifiedDate: new Date(),
        mitigationPlan: "Implement fall prevention protocol",
        status: "active",
        evidenceLevel: "A",
      });
    }

    // Medication risk assessment
    if (clinicalData.medications && clinicalData.medications.length >= 5) {
      riskFactors.push({
        id: `medication_risk_${Date.now()}`,
        type: "medication",
        category: "medication_error",
        severity: clinicalData.medications.length >= 10 ? "high" : "medium",
        description: "Polypharmacy increases medication error risk",
        identifiedDate: new Date(),
        mitigationPlan: "Enhanced medication reconciliation and monitoring",
        status: "active",
        evidenceLevel: "A",
      });
    }

    // Infection risk assessment
    if (clinicalData.immunocompromised || clinicalData.invasiveDevices) {
      riskFactors.push({
        id: `infection_risk_${Date.now()}`,
        type: "clinical",
        category: "infection_risk",
        severity: "high",
        description:
          "Increased infection risk due to immunocompromised state or invasive devices",
        identifiedDate: new Date(),
        mitigationPlan: "Enhanced infection control measures",
        status: "active",
        evidenceLevel: "A",
      });
    }

    return riskFactors;
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRiskLevel(
    riskFactors: RiskFactor[],
  ): "low" | "medium" | "high" | "critical" {
    if (riskFactors.length === 0) return "low";

    const criticalFactors = riskFactors.filter(
      (rf) => rf.severity === "critical",
    ).length;
    const highFactors = riskFactors.filter(
      (rf) => rf.severity === "high",
    ).length;
    const mediumFactors = riskFactors.filter(
      (rf) => rf.severity === "medium",
    ).length;

    if (criticalFactors > 0) return "critical";
    if (highFactors >= 2 || (highFactors >= 1 && mediumFactors >= 2))
      return "high";
    if (highFactors >= 1 || mediumFactors >= 2) return "medium";
    return "low";
  }

  /**
   * Determine monitoring parameters based on risk
   */
  private async determineMonitoringParameters(
    riskLevel: string,
    riskFactors: RiskFactor[],
  ): Promise<MonitoringParameter[]> {
    const parameters: MonitoringParameter[] = [];

    // Base monitoring for all patients
    parameters.push({
      id: "vital_signs_basic",
      name: "Basic Vital Signs",
      type: "vital_signs",
      value: null,
      normalRange: { min: 36, max: 37.5 },
      alertThresholds: {
        critical_low: 35,
        low: 36,
        high: 38,
        critical_high: 40,
      },
      frequency: riskLevel === "critical" ? "continuous" : "every_4_hours",
      lastMeasurement: new Date(),
      trend: "stable",
      automated: true,
    });

    // Risk-specific monitoring
    if (riskFactors.some((rf) => rf.category === "fall_risk")) {
      parameters.push({
        id: "mobility_assessment",
        name: "Mobility Assessment",
        type: "behavioral",
        value: null,
        normalRange: { min: 3, max: 5 },
        alertThresholds: { low: 2, critical_low: 1 },
        frequency: "daily",
        lastMeasurement: new Date(),
        trend: "stable",
        automated: false,
      });
    }

    if (riskFactors.some((rf) => rf.category === "medication_error")) {
      parameters.push({
        id: "medication_levels",
        name: "Medication Levels Monitoring",
        type: "medication_levels",
        value: null,
        normalRange: {},
        alertThresholds: {},
        frequency: "daily",
        lastMeasurement: new Date(),
        trend: "stable",
        automated: true,
      });
    }

    return parameters;
  }

  /**
   * Activate relevant safety protocols
   */
  private async activateSafetyProtocols(
    profile: PatientSafetyProfile,
  ): Promise<void> {
    for (const protocol of this.safetyProtocols.values()) {
      for (const trigger of protocol.triggers) {
        if (await this.evaluateProtocolTrigger(trigger, profile)) {
          console.log(
            `🔄 Activating safety protocol: ${protocol.name} for patient ${profile.patientId}`,
          );
          await this.executeProtocolSteps(protocol, profile);
        }
      }
    }
  }

  /**
   * Evaluate protocol trigger conditions
   */
  private async evaluateProtocolTrigger(
    trigger: ProtocolTrigger,
    profile: PatientSafetyProfile,
  ): Promise<boolean> {
    // Simplified trigger evaluation - in production, use rules engine
    const ruleContext: RuleContext = {
      data: {
        riskLevel: profile.riskLevel,
        riskFactors: profile.riskFactors.map((rf) => rf.category),
      },
      patient: {
        id: profile.patientId,
        age: 0, // Would be populated from patient data
        conditions: [],
        medications: [],
        allergies: [],
      },
    };

    const result = await rulesEngine.evaluateRules(ruleContext);
    return result.matchedRules.length > 0;
  }

  /**
   * Execute protocol steps
   */
  private async executeProtocolSteps(
    protocol: SafetyProtocol,
    profile: PatientSafetyProfile,
  ): Promise<void> {
    for (const step of protocol.steps) {
      const intervention: SafetyIntervention = {
        id: `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "preventive",
        category: protocol.category as any,
        description: step.description,
        implementedBy: profile.assignedSafetyOfficer,
        implementedAt: new Date(),
        status: "planned",
        effectiveness: "unknown",
        followUpRequired: true,
        followUpDate: new Date(Date.now() + step.timeframe * 60000),
        outcome: "Pending implementation",
      };

      profile.interventions.push(intervention);
    }
  }

  /**
   * Start real-time monitoring
   */
  private async startRealTimeMonitoring(): Promise<void> {
    this.monitoringInterval = setInterval(() => {
      this.performRealTimeChecks();
    }, 60000); // Check every minute

    console.log("📊 Real-time safety monitoring started");
  }

  /**
   * Perform real-time safety checks
   */
  private async performRealTimeChecks(): Promise<void> {
    for (const profile of this.safetyProfiles.values()) {
      // Check for overdue assessments
      if (new Date() > profile.nextAssessment) {
        await this.createSafetyAlert({
          patientId: profile.patientId,
          type: "medium",
          category: "behavioral",
          title: "Safety Assessment Overdue",
          message:
            "Patient safety assessment is overdue and requires immediate attention",
          triggeredBy: "automated_monitoring",
        });
      }

      // Check monitoring parameters
      for (const parameter of profile.monitoringParameters) {
        if (parameter.automated) {
          await this.checkParameterThresholds(profile, parameter);
        }
      }

      // Check intervention follow-ups
      for (const intervention of profile.interventions) {
        if (
          intervention.followUpRequired &&
          intervention.followUpDate &&
          new Date() > intervention.followUpDate
        ) {
          await this.createSafetyAlert({
            patientId: profile.patientId,
            type: "medium",
            category: "behavioral",
            title: "Intervention Follow-up Required",
            message: `Follow-up required for intervention: ${intervention.description}`,
            triggeredBy: "intervention_monitoring",
          });
        }
      }
    }
  }

  /**
   * Check parameter thresholds
   */
  private async checkParameterThresholds(
    profile: PatientSafetyProfile,
    parameter: MonitoringParameter,
  ): Promise<void> {
    // Simulate parameter value checking
    const simulatedValue = Math.random() * 40 + 35; // Temperature simulation

    if (
      parameter.alertThresholds.critical_high &&
      simulatedValue > parameter.alertThresholds.critical_high
    ) {
      await this.createSafetyAlert({
        patientId: profile.patientId,
        type: "critical",
        category: "vital_signs",
        title: "Critical High Value Alert",
        message: `${parameter.name} is critically high: ${simulatedValue}`,
        triggeredBy: parameter.id,
      });
    } else if (
      parameter.alertThresholds.high &&
      simulatedValue > parameter.alertThresholds.high
    ) {
      await this.createSafetyAlert({
        patientId: profile.patientId,
        type: "high",
        category: "vital_signs",
        title: "High Value Alert",
        message: `${parameter.name} is elevated: ${simulatedValue}`,
        triggeredBy: parameter.id,
      });
    }
  }

  /**
   * Create safety alert
   */
  public async createSafetyAlert(alertData: {
    patientId: string;
    type: SafetyAlert["type"];
    category: SafetyAlert["category"];
    title: string;
    message: string;
    triggeredBy: string;
  }): Promise<SafetyAlert> {
    const alert: SafetyAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: alertData.patientId,
      type: alertData.type,
      category: alertData.category,
      title: alertData.title,
      message: alertData.message,
      triggeredBy: alertData.triggeredBy,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      escalated: false,
      actions: [],
      metadata: {},
    };

    // Add to active alerts
    this.activeAlerts.set(alert.id, alert);

    // Add to patient profile
    const profile = this.safetyProfiles.get(alertData.patientId);
    if (profile) {
      profile.safetyAlerts.push(alert);
    }

    // Create safety actions based on alert type
    await this.createSafetyActions(alert);

    console.log(
      `🚨 Safety alert created: ${alert.title} for patient ${alert.patientId}`,
    );
    return alert;
  }

  /**
   * Create safety actions for alert
   */
  private async createSafetyActions(alert: SafetyAlert): Promise<void> {
    const actions: SafetyAction[] = [];

    if (alert.type === "critical") {
      actions.push({
        id: `action_${Date.now()}_1`,
        type: "notification",
        description: "Immediate notification to attending physician",
        priority: "immediate",
        assignedTo: "attending_physician",
        dueDate: new Date(Date.now() + 5 * 60000), // 5 minutes
        status: "pending",
      });

      actions.push({
        id: `action_${Date.now()}_2`,
        type: "escalation",
        description: "Escalate to charge nurse if no response in 10 minutes",
        priority: "urgent",
        assignedTo: "charge_nurse",
        dueDate: new Date(Date.now() + 10 * 60000), // 10 minutes
        status: "pending",
      });
    } else if (alert.type === "high") {
      actions.push({
        id: `action_${Date.now()}_1`,
        type: "notification",
        description: "Notify primary nurse",
        priority: "urgent",
        assignedTo: "primary_nurse",
        dueDate: new Date(Date.now() + 15 * 60000), // 15 minutes
        status: "pending",
      });
    }

    alert.actions = actions;
  }

  /**
   * Initialize alert processing
   */
  private async initializeAlertProcessing(): Promise<void> {
    setInterval(() => {
      this.processOverdueActions();
    }, 300000); // Check every 5 minutes

    console.log("⚡ Alert processing initialized");
  }

  /**
   * Process overdue actions
   */
  private processOverdueActions(): void {
    const now = new Date();

    for (const alert of this.activeAlerts.values()) {
      for (const action of alert.actions) {
        if (action.status === "pending" && now > action.dueDate) {
          action.status = "overdue";
          console.warn(
            `⚠️ Safety action overdue: ${action.description} for alert ${alert.id}`,
          );

          // Auto-escalate critical overdue actions
          if (alert.type === "critical" && !alert.escalated) {
            alert.escalated = true;
            alert.escalatedTo = "safety_officer";
            console.error(`🚨 Critical safety alert escalated: ${alert.title}`);
          }
        }
      }
    }
  }

  /**
   * Acknowledge safety alert
   */
  public async acknowledgeSafetyAlert(
    alertId: string,
    acknowledgedBy: string,
  ): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    console.log(
      `✅ Safety alert acknowledged: ${alert.title} by ${acknowledgedBy}`,
    );
    return true;
  }

  /**
   * Resolve safety alert
   */
  public async resolveSafetyAlert(
    alertId: string,
    resolvedBy: string,
    resolution: string,
  ): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date();
    alert.metadata.resolution = resolution;

    // Mark all actions as completed
    alert.actions.forEach((action) => {
      if (action.status === "pending" || action.status === "overdue") {
        action.status = "completed";
        action.completedBy = resolvedBy;
        action.completedAt = new Date();
        action.result = resolution;
      }
    });

    console.log(`✅ Safety alert resolved: ${alert.title} by ${resolvedBy}`);
    return true;
  }

  /**
   * Get patient safety profile
   */
  public getSafetyProfile(patientId: string): PatientSafetyProfile | null {
    return this.safetyProfiles.get(patientId) || null;
  }

  /**
   * Get active safety alerts
   */
  public getActiveSafetyAlerts(patientId?: string): SafetyAlert[] {
    const alerts = Array.from(this.activeAlerts.values()).filter(
      (alert) => !alert.resolved,
    );

    return patientId
      ? alerts.filter((alert) => alert.patientId === patientId)
      : alerts;
  }

  /**
   * Generate safety metrics
   */
  public generateSafetyMetrics(
    patientId: string,
    days: number = 30,
  ): SafetyMetrics | null {
    const profile = this.safetyProfiles.get(patientId);
    if (!profile) return null;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const periodAlerts = profile.safetyAlerts.filter(
      (alert) => alert.timestamp >= startDate && alert.timestamp <= endDate,
    );

    const totalAlerts = periodAlerts.length;
    const criticalAlerts = periodAlerts.filter(
      (alert) => alert.type === "critical",
    ).length;
    const resolvedAlerts = periodAlerts.filter(
      (alert) => alert.resolved,
    ).length;

    const resolutionTimes = periodAlerts
      .filter((alert) => alert.resolved && alert.resolvedAt)
      .map((alert) => alert.resolvedAt!.getTime() - alert.timestamp.getTime());

    const averageResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) /
          resolutionTimes.length /
          60000 // Convert to minutes
        : 0;

    const safetyScore = Math.max(
      0,
      100 - criticalAlerts * 10 - (totalAlerts - resolvedAlerts) * 5,
    );

    return {
      patientId,
      period: { start: startDate, end: endDate },
      metrics: {
        totalAlerts,
        criticalAlerts,
        resolvedAlerts,
        averageResolutionTime: Math.round(averageResolutionTime),
        preventedIncidents: Math.max(
          0,
          profile.interventions.filter((i) => i.effectiveness === "effective")
            .length,
        ),
        safetyScore: Math.round(safetyScore),
        riskReduction:
          (profile.riskFactors.filter((rf) => rf.status === "mitigated")
            .length /
            profile.riskFactors.length) *
          100,
        complianceScore: 95, // Placeholder
      },
      trends: {
        alertFrequency: "stable", // Simplified
        riskLevel: "stable",
        interventionEffectiveness: "improving",
      },
    };
  }

  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      safetyProfilesCount: this.safetyProfiles.size,
      activeAlertsCount: Array.from(this.activeAlerts.values()).filter(
        (a) => !a.resolved,
      ).length,
      protocolsCount: this.safetyProtocols.size,
      monitoringActive: this.monitoringInterval !== null,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const patientSafetyMonitoringService =
  PatientSafetyMonitoringService.getInstance();
export default patientSafetyMonitoringService;
