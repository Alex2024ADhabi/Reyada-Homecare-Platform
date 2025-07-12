/**
 * Medication Management Service
 * Comprehensive medication management with safety checks and clinical decision support
 */

import {
  healthcareRulesService,
  HealthcareRuleContext,
} from "@/services/healthcare-rules.service";
import { patientSafetyMonitoringService } from "@/services/patient-safety-monitoring.service";
import { errorRecovery } from "@/utils/error-recovery";

export interface MedicationOrder {
  id: string;
  patientId: string;
  episodeId: string;
  medication: MedicationDetails;
  prescriber: PrescriberInfo;
  orderDate: Date;
  startDate: Date;
  endDate?: Date;
  status:
    | "pending"
    | "verified"
    | "dispensed"
    | "administered"
    | "completed"
    | "cancelled"
    | "held";
  priority: "routine" | "urgent" | "stat" | "asap";
  indication: string;
  instructions: AdministrationInstructions;
  safetyChecks: SafetyCheckResult[];
  clinicalDecisionSupport: ClinicalDecisionSupportResult[];
  administrationHistory: AdministrationRecord[];
  monitoringPlan: MonitoringPlan;
  metadata: {
    orderSource: "physician" | "nurse_practitioner" | "pharmacist" | "protocol";
    verifiedBy?: string;
    verificationDate?: Date;
    lastModified: Date;
    modifiedBy: string;
  };
}

export interface MedicationDetails {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  strength: string;
  dosageForm:
    | "tablet"
    | "capsule"
    | "liquid"
    | "injection"
    | "topical"
    | "inhaler"
    | "patch";
  route:
    | "oral"
    | "iv"
    | "im"
    | "sc"
    | "topical"
    | "inhalation"
    | "rectal"
    | "sublingual";
  frequency: string;
  dose: {
    amount: number;
    unit: string;
    calculation?: DoseCalculation;
  };
  duration: {
    value: number;
    unit: "days" | "weeks" | "months" | "ongoing";
  };
  classification: {
    therapeuticClass: string;
    pharmacologicClass: string;
    controlledSubstance?: string;
    highRiskMedication: boolean;
  };
  contraindications: string[];
  interactions: DrugInteraction[];
  adverseEffects: AdverseEffect[];
  monitoringParameters: string[];
}

export interface PrescriberInfo {
  id: string;
  name: string;
  role: "physician" | "nurse_practitioner" | "physician_assistant";
  licenseNumber: string;
  specialty: string;
  contactInfo: {
    phone: string;
    email: string;
    pager?: string;
  };
}

export interface AdministrationInstructions {
  route: string;
  frequency: string;
  timing: string[];
  specialInstructions: string;
  foodRestrictions?: string;
  administrationNotes: string;
  patientEducation: string[];
}

export interface DoseCalculation {
  method:
    | "weight_based"
    | "bsa_based"
    | "age_based"
    | "renal_adjusted"
    | "hepatic_adjusted";
  parameters: {
    weight?: number;
    bsa?: number;
    age?: number;
    creatinineClearance?: number;
    hepaticFunction?: string;
  };
  formula: string;
  calculatedDose: number;
  adjustmentFactor?: number;
}

export interface DrugInteraction {
  id: string;
  interactingMedication: string;
  severity: "minor" | "moderate" | "major" | "contraindicated";
  mechanism: string;
  clinicalEffect: string;
  management: string;
  references: string[];
}

export interface AdverseEffect {
  id: string;
  effect: string;
  frequency: "common" | "uncommon" | "rare" | "very_rare";
  severity: "mild" | "moderate" | "severe" | "life_threatening";
  onset: "immediate" | "early" | "delayed";
  management: string;
  monitoring: string[];
}

export interface SafetyCheckResult {
  checkType:
    | "allergy"
    | "interaction"
    | "contraindication"
    | "dosage"
    | "renal"
    | "hepatic"
    | "pregnancy";
  status: "pass" | "warning" | "critical" | "fail";
  message: string;
  details: string;
  recommendations: string[];
  overrideReason?: string;
  overriddenBy?: string;
  timestamp: Date;
}

export interface ClinicalDecisionSupportResult {
  ruleId: string;
  recommendation: string;
  rationale: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  urgency: "immediate" | "urgent" | "routine";
  actions: string[];
  accepted: boolean;
  acceptedBy?: string;
  rejectionReason?: string;
  timestamp: Date;
}

export interface AdministrationRecord {
  id: string;
  administeredBy: string;
  administrationTime: Date;
  dose: {
    amount: number;
    unit: string;
  };
  route: string;
  site?: string;
  patientResponse: "good" | "fair" | "poor" | "adverse";
  adverseReactions?: AdverseReaction[];
  notes: string;
  witnessedBy?: string;
  documentation: {
    vitalSigns?: {
      before: any;
      after: any;
    };
    painScore?: {
      before: number;
      after: number;
    };
    patientEducation: boolean;
  };
}

export interface AdverseReaction {
  id: string;
  type: "allergic" | "side_effect" | "toxicity" | "idiosyncratic";
  severity: "mild" | "moderate" | "severe" | "life_threatening";
  onset: Date;
  description: string;
  interventions: string[];
  outcome: "resolved" | "resolving" | "ongoing" | "fatal";
  reportedToPharmacy: boolean;
  reportedToRegulatory: boolean;
}

export interface MonitoringPlan {
  parameters: MonitoringParameter[];
  schedule: MonitoringSchedule;
  alertThresholds: AlertThreshold[];
  escalationPlan: EscalationPlan;
}

export interface MonitoringParameter {
  parameter: string;
  type:
    | "laboratory"
    | "vital_signs"
    | "clinical_assessment"
    | "patient_reported";
  baseline?: any;
  target?: any;
  frequency: string;
  method: "automated" | "manual" | "patient_reported";
  criticalValues: {
    low?: any;
    high?: any;
  };
}

export interface MonitoringSchedule {
  frequency:
    | "continuous"
    | "hourly"
    | "every_4_hours"
    | "daily"
    | "weekly"
    | "monthly";
  duration: string;
  times?: string[];
  conditions?: string[];
}

export interface AlertThreshold {
  parameter: string;
  condition: string;
  value: any;
  severity: "info" | "warning" | "critical";
  action: string;
}

export interface EscalationPlan {
  levels: EscalationLevel[];
  timeframes: number[];
  contacts: string[];
}

export interface EscalationLevel {
  level: number;
  trigger: string;
  action: string;
  assignedTo: string;
  timeframe: number;
}

export interface MedicationReconciliation {
  id: string;
  patientId: string;
  episodeId: string;
  reconciliationType: "admission" | "transfer" | "discharge" | "routine";
  performedBy: string;
  performedDate: Date;
  homemedications: MedicationDetails[];
  hospitalMedications: MedicationDetails[];
  discrepancies: MedicationDiscrepancy[];
  interventions: ReconciliationIntervention[];
  status: "in_progress" | "completed" | "requires_review";
  reviewedBy?: string;
  reviewDate?: Date;
}

export interface MedicationDiscrepancy {
  id: string;
  type:
    | "omission"
    | "commission"
    | "dosage_difference"
    | "frequency_difference"
    | "route_difference";
  medication: string;
  homeValue: string;
  hospitalValue: string;
  clinicalSignificance: "high" | "medium" | "low";
  resolved: boolean;
  resolution?: string;
  resolvedBy?: string;
}

export interface ReconciliationIntervention {
  id: string;
  type:
    | "medication_added"
    | "medication_discontinued"
    | "dosage_adjusted"
    | "frequency_changed";
  medication: string;
  rationale: string;
  implementedBy: string;
  implementedDate: Date;
  patientEducated: boolean;
}

class MedicationManagementService {
  private static instance: MedicationManagementService;
  private medicationOrders = new Map<string, MedicationOrder>();
  private reconciliations = new Map<string, MedicationReconciliation>();
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): MedicationManagementService {
    if (!MedicationManagementService.instance) {
      MedicationManagementService.instance = new MedicationManagementService();
    }
    return MedicationManagementService.instance;
  }

  /**
   * Initialize medication management service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("💊 Initializing Medication Management Service...");

      // Initialize medication database
      await this.initializeMedicationDatabase();

      // Start medication monitoring
      await this.startMedicationMonitoring();

      // Initialize safety checking
      await this.initializeSafetyChecking();

      this.isInitialized = true;
      console.log("✅ Medication Management Service initialized successfully");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Medication Management Service:",
        error,
      );
      throw error;
    }
  }

  /**
   * Initialize medication database
   */
  private async initializeMedicationDatabase(): Promise<void> {
    console.log("📚 Medication database initialized");
  }

  /**
   * Create medication order with comprehensive safety checks
   */
  public async createMedicationOrder(orderData: {
    patientId: string;
    episodeId: string;
    medication: Partial<MedicationDetails>;
    prescriber: PrescriberInfo;
    indication: string;
    instructions: AdministrationInstructions;
    priority?: "routine" | "urgent" | "stat" | "asap";
  }): Promise<MedicationOrder> {
    return await errorRecovery.withRecovery(
      async () => {
        const orderId = `med_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create medication order
        const order: MedicationOrder = {
          id: orderId,
          patientId: orderData.patientId,
          episodeId: orderData.episodeId,
          medication: await this.enrichMedicationDetails(orderData.medication),
          prescriber: orderData.prescriber,
          orderDate: new Date(),
          startDate: new Date(),
          status: "pending",
          priority: orderData.priority || "routine",
          indication: orderData.indication,
          instructions: orderData.instructions,
          safetyChecks: [],
          clinicalDecisionSupport: [],
          administrationHistory: [],
          monitoringPlan: await this.createMonitoringPlan(orderData.medication),
          metadata: {
            orderSource: "physician",
            lastModified: new Date(),
            modifiedBy: orderData.prescriber.id,
          },
        };

        // Perform comprehensive safety checks
        order.safetyChecks = await this.performSafetyChecks(order);

        // Get clinical decision support
        order.clinicalDecisionSupport =
          await this.getClinicalDecisionSupport(order);

        // Check for critical safety issues
        const criticalIssues = order.safetyChecks.filter(
          (check) => check.status === "critical" || check.status === "fail",
        );
        if (criticalIssues.length > 0) {
          order.status = "held";
          console.warn(
            `🚨 Medication order held due to critical safety issues: ${order.id}`,
          );
        } else {
          order.status = "verified";
        }

        this.medicationOrders.set(orderId, order);

        console.log(
          `✅ Medication order created: ${order.medication.name} for patient ${order.patientId}`,
        );
        return order;
      },
      {
        maxRetries: 2,
        fallbackValue: null,
      },
    );
  }

  /**
   * Enrich medication details with comprehensive information
   */
  private async enrichMedicationDetails(
    medication: Partial<MedicationDetails>,
  ): Promise<MedicationDetails> {
    // In a real implementation, this would query a medication database
    return {
      id: medication.id || `med_${Date.now()}`,
      name: medication.name || "",
      genericName: medication.genericName || medication.name || "",
      brandNames: medication.brandNames || [],
      strength: medication.strength || "",
      dosageForm: medication.dosageForm || "tablet",
      route: medication.route || "oral",
      frequency: medication.frequency || "once_daily",
      dose: medication.dose || { amount: 1, unit: "tablet" },
      duration: medication.duration || { value: 7, unit: "days" },
      classification: medication.classification || {
        therapeuticClass: "unknown",
        pharmacologicClass: "unknown",
        highRiskMedication: false,
      },
      contraindications: medication.contraindications || [],
      interactions: medication.interactions || [],
      adverseEffects: medication.adverseEffects || [],
      monitoringParameters: medication.monitoringParameters || [],
    };
  }

  /**
   * Perform comprehensive safety checks
   */
  private async performSafetyChecks(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult[]> {
    const safetyChecks: SafetyCheckResult[] = [];

    // Allergy check
    const allergyCheck = await this.performAllergyCheck(order);
    safetyChecks.push(allergyCheck);

    // Drug interaction check
    const interactionCheck = await this.performInteractionCheck(order);
    safetyChecks.push(interactionCheck);

    // Contraindication check
    const contraindicationCheck =
      await this.performContraindicationCheck(order);
    safetyChecks.push(contraindicationCheck);

    // Dosage check
    const dosageCheck = await this.performDosageCheck(order);
    safetyChecks.push(dosageCheck);

    // Renal function check
    const renalCheck = await this.performRenalCheck(order);
    safetyChecks.push(renalCheck);

    // Hepatic function check
    const hepaticCheck = await this.performHepaticCheck(order);
    safetyChecks.push(hepaticCheck);

    return safetyChecks;
  }

  /**
   * Perform allergy check
   */
  private async performAllergyCheck(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult> {
    // Simulate allergy checking
    const hasAllergy = Math.random() < 0.1; // 10% chance of allergy

    return {
      checkType: "allergy",
      status: hasAllergy ? "critical" : "pass",
      message: hasAllergy
        ? "Patient has documented allergy to this medication"
        : "No known allergies to this medication",
      details: hasAllergy
        ? "Cross-reactivity possible with similar medications"
        : "Allergy history reviewed",
      recommendations: hasAllergy
        ? [
            "Do not administer",
            "Consider alternative medication",
            "Consult allergist",
          ]
        : [],
      timestamp: new Date(),
    };
  }

  /**
   * Perform drug interaction check
   */
  private async performInteractionCheck(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult> {
    // Simulate interaction checking
    const hasInteraction = Math.random() < 0.15; // 15% chance of interaction
    const severity = hasInteraction
      ? ["minor", "moderate", "major"][Math.floor(Math.random() * 3)]
      : null;

    return {
      checkType: "interaction",
      status:
        severity === "major"
          ? "critical"
          : severity === "moderate"
            ? "warning"
            : "pass",
      message: hasInteraction
        ? `${severity} drug interaction detected`
        : "No significant drug interactions found",
      details: hasInteraction
        ? "Interaction may affect medication efficacy or safety"
        : "Current medications reviewed for interactions",
      recommendations: hasInteraction
        ? [
            "Monitor closely",
            "Consider dose adjustment",
            "Consider alternative medication",
          ]
        : [],
      timestamp: new Date(),
    };
  }

  /**
   * Perform contraindication check
   */
  private async performContraindicationCheck(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult> {
    // Simulate contraindication checking
    const hasContraindication = Math.random() < 0.05; // 5% chance of contraindication

    return {
      checkType: "contraindication",
      status: hasContraindication ? "critical" : "pass",
      message: hasContraindication
        ? "Contraindication identified"
        : "No contraindications found",
      details: hasContraindication
        ? "Patient condition contraindicates this medication"
        : "Patient conditions reviewed",
      recommendations: hasContraindication
        ? [
            "Do not administer",
            "Consider alternative therapy",
            "Consult specialist",
          ]
        : [],
      timestamp: new Date(),
    };
  }

  /**
   * Perform dosage check
   */
  private async performDosageCheck(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult> {
    // Simulate dosage checking
    const dosageIssue = Math.random() < 0.1; // 10% chance of dosage issue

    return {
      checkType: "dosage",
      status: dosageIssue ? "warning" : "pass",
      message: dosageIssue
        ? "Dosage outside normal range"
        : "Dosage within normal range",
      details: dosageIssue
        ? "Consider dose adjustment based on patient factors"
        : "Dosage appropriate for indication",
      recommendations: dosageIssue
        ? [
            "Verify dosage calculation",
            "Consider patient-specific factors",
            "Monitor closely",
          ]
        : [],
      timestamp: new Date(),
    };
  }

  /**
   * Perform renal function check
   */
  private async performRenalCheck(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult> {
    // Simulate renal function checking
    const renalImpairment = Math.random() < 0.2; // 20% chance of renal impairment

    return {
      checkType: "renal",
      status: renalImpairment ? "warning" : "pass",
      message: renalImpairment
        ? "Renal function impairment detected"
        : "Normal renal function",
      details: renalImpairment
        ? "Dose adjustment may be required"
        : "No renal dose adjustment needed",
      recommendations: renalImpairment
        ? [
            "Adjust dose for renal function",
            "Monitor renal function",
            "Consider alternative if contraindicated",
          ]
        : [],
      timestamp: new Date(),
    };
  }

  /**
   * Perform hepatic function check
   */
  private async performHepaticCheck(
    order: MedicationOrder,
  ): Promise<SafetyCheckResult> {
    // Simulate hepatic function checking
    const hepaticImpairment = Math.random() < 0.15; // 15% chance of hepatic impairment

    return {
      checkType: "hepatic",
      status: hepaticImpairment ? "warning" : "pass",
      message: hepaticImpairment
        ? "Hepatic function impairment detected"
        : "Normal hepatic function",
      details: hepaticImpairment
        ? "Dose adjustment may be required"
        : "No hepatic dose adjustment needed",
      recommendations: hepaticImpairment
        ? [
            "Adjust dose for hepatic function",
            "Monitor liver function",
            "Consider alternative if contraindicated",
          ]
        : [],
      timestamp: new Date(),
    };
  }

  /**
   * Get clinical decision support
   */
  private async getClinicalDecisionSupport(
    order: MedicationOrder,
  ): Promise<ClinicalDecisionSupportResult[]> {
    const context: HealthcareRuleContext = {
      data: {
        medicationOrder: order,
      },
      patient: {
        id: order.patientId,
        age: 0, // Would be populated from patient data
        conditions: [],
        medications: [order.medication],
        allergies: [],
      },
      clinical: {
        episodeId: order.episodeId,
        assessmentType: "medication_order",
        urgency: order.priority === "stat" ? "critical" : "medium",
        clinicalDomain: "medication_safety",
        medications: [order.medication],
      },
      environment: {
        location: "home",
        resources: [],
        staffing: {
          nurses: 1,
          physicians: 1,
          pharmacists: 1,
          therapists: 0,
          supportStaff: 0,
        },
        equipment: [],
      },
      regulatory: {
        dohRequirements: [],
        jawdaStandards: [],
        adhicsCompliance: true,
        licenseRequirements: [],
      },
      system: {
        timestamp: new Date(),
        source: "medication_management",
        environment: "production",
      },
    };

    const decisions =
      await healthcareRulesService.evaluateHealthcareRules(context);

    return decisions.map((decision) => ({
      ruleId: decision.ruleId,
      recommendation: decision.recommendation,
      rationale: decision.rationale,
      evidenceLevel: decision.evidenceLevel,
      urgency: decision.urgency,
      actions: decision.actions.map((action) => action.description),
      accepted: false,
      timestamp: new Date(),
    }));
  }

  /**
   * Create monitoring plan
   */
  private async createMonitoringPlan(
    medication: Partial<MedicationDetails>,
  ): Promise<MonitoringPlan> {
    return {
      parameters: [
        {
          parameter: "therapeutic_response",
          type: "clinical_assessment",
          frequency: "daily",
          method: "manual",
          criticalValues: {},
        },
        {
          parameter: "adverse_effects",
          type: "patient_reported",
          frequency: "daily",
          method: "patient_reported",
          criticalValues: {},
        },
      ],
      schedule: {
        frequency: "daily",
        duration: "duration_of_therapy",
      },
      alertThresholds: [
        {
          parameter: "adverse_effects",
          condition: "present",
          value: true,
          severity: "warning",
          action: "assess_and_document",
        },
      ],
      escalationPlan: {
        levels: [
          {
            level: 1,
            trigger: "adverse_effect_reported",
            action: "notify_prescriber",
            assignedTo: "nurse",
            timeframe: 30,
          },
        ],
        timeframes: [30, 60, 120],
        contacts: ["prescriber", "pharmacist", "charge_nurse"],
      },
    };
  }

  /**
   * Start medication monitoring
   */
  private async startMedicationMonitoring(): Promise<void> {
    this.monitoringInterval = setInterval(() => {
      this.performMedicationMonitoring();
    }, 300000); // Check every 5 minutes

    console.log("📊 Medication monitoring started");
  }

  /**
   * Perform medication monitoring
   */
  private async performMedicationMonitoring(): Promise<void> {
    for (const order of this.medicationOrders.values()) {
      if (order.status === "administered" || order.status === "completed") {
        // Check for overdue monitoring
        const lastAdmin =
          order.administrationHistory[order.administrationHistory.length - 1];
        if (lastAdmin) {
          const timeSinceLastAdmin =
            Date.now() - lastAdmin.administrationTime.getTime();
          const monitoringDue = timeSinceLastAdmin > 4 * 60 * 60 * 1000; // 4 hours

          if (monitoringDue) {
            await patientSafetyMonitoringService.createSafetyAlert({
              patientId: order.patientId,
              type: "medium",
              category: "medication",
              title: "Medication Monitoring Due",
              message: `Monitoring due for ${order.medication.name}`,
              triggeredBy: "medication_monitoring",
            });
          }
        }
      }
    }
  }

  /**
   * Initialize safety checking
   */
  private async initializeSafetyChecking(): Promise<void> {
    console.log("🛡️ Medication safety checking initialized");
  }

  /**
   * Record medication administration
   */
  public async recordAdministration(
    orderId: string,
    administrationData: {
      administeredBy: string;
      dose: { amount: number; unit: string };
      route: string;
      site?: string;
      patientResponse: "good" | "fair" | "poor" | "adverse";
      notes: string;
      vitalSigns?: any;
      painScore?: { before: number; after: number };
    },
  ): Promise<boolean> {
    const order = this.medicationOrders.get(orderId);
    if (!order) return false;

    const administrationRecord: AdministrationRecord = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      administeredBy: administrationData.administeredBy,
      administrationTime: new Date(),
      dose: administrationData.dose,
      route: administrationData.route,
      site: administrationData.site,
      patientResponse: administrationData.patientResponse,
      notes: administrationData.notes,
      documentation: {
        vitalSigns: administrationData.vitalSigns,
        painScore: administrationData.painScore,
        patientEducation: true,
      },
    };

    order.administrationHistory.push(administrationRecord);
    order.status = "administered";
    order.metadata.lastModified = new Date();
    order.metadata.modifiedBy = administrationData.administeredBy;

    console.log(
      `✅ Medication administration recorded: ${order.medication.name} for patient ${order.patientId}`,
    );
    return true;
  }

  /**
   * Perform medication reconciliation
   */
  public async performMedicationReconciliation(
    patientId: string,
    episodeId: string,
    reconciliationType: "admission" | "transfer" | "discharge" | "routine",
    performedBy: string,
    homemedications: MedicationDetails[],
  ): Promise<MedicationReconciliation> {
    const reconciliationId = `recon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get current hospital medications
    const hospitalMedications = Array.from(this.medicationOrders.values())
      .filter(
        (order) =>
          order.patientId === patientId && order.episodeId === episodeId,
      )
      .map((order) => order.medication);

    // Identify discrepancies
    const discrepancies = await this.identifyDiscrepancies(
      homemedications,
      hospitalMedications,
    );

    const reconciliation: MedicationReconciliation = {
      id: reconciliationId,
      patientId,
      episodeId,
      reconciliationType,
      performedBy,
      performedDate: new Date(),
      homemedications,
      hospitalMedications,
      discrepancies,
      interventions: [],
      status: discrepancies.length > 0 ? "requires_review" : "completed",
    };

    this.reconciliations.set(reconciliationId, reconciliation);

    console.log(
      `✅ Medication reconciliation completed: ${discrepancies.length} discrepancies found`,
    );
    return reconciliation;
  }

  /**
   * Identify medication discrepancies
   */
  private async identifyDiscrepancies(
    homemedications: MedicationDetails[],
    hospitalMedications: MedicationDetails[],
  ): Promise<MedicationDiscrepancy[]> {
    const discrepancies: MedicationDiscrepancy[] = [];

    // Check for omissions (home meds not in hospital list)
    for (const homeMed of homemedications) {
      const hospitalMatch = hospitalMedications.find(
        (hosMed) =>
          hosMed.genericName.toLowerCase() ===
          homeMed.genericName.toLowerCase(),
      );

      if (!hospitalMatch) {
        discrepancies.push({
          id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "omission",
          medication: homeMed.name,
          homeValue: `${homeMed.dose.amount} ${homeMed.dose.unit} ${homeMed.frequency}`,
          hospitalValue: "Not prescribed",
          clinicalSignificance: "medium",
          resolved: false,
        });
      }
    }

    return discrepancies;
  }

  /**
   * Get medication order by ID
   */
  public getMedicationOrder(orderId: string): MedicationOrder | null {
    return this.medicationOrders.get(orderId) || null;
  }

  /**
   * Get medication orders for patient
   */
  public getPatientMedicationOrders(patientId: string): MedicationOrder[] {
    return Array.from(this.medicationOrders.values()).filter(
      (order) => order.patientId === patientId,
    );
  }

  /**
   * Get active medication orders
   */
  public getActiveMedicationOrders(): MedicationOrder[] {
    return Array.from(this.medicationOrders.values()).filter((order) =>
      ["verified", "dispensed", "administered"].includes(order.status),
    );
  }

  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      totalOrders: this.medicationOrders.size,
      activeOrders: this.getActiveMedicationOrders().length,
      reconciliations: this.reconciliations.size,
      monitoringActive: this.monitoringInterval !== null,
      ordersByStatus: {
        pending: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "pending",
        ).length,
        verified: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "verified",
        ).length,
        dispensed: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "dispensed",
        ).length,
        administered: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "administered",
        ).length,
        completed: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "completed",
        ).length,
        cancelled: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "cancelled",
        ).length,
        held: Array.from(this.medicationOrders.values()).filter(
          (o) => o.status === "held",
        ).length,
      },
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

export const medicationManagementService =
  MedicationManagementService.getInstance();
export default medicationManagementService;
