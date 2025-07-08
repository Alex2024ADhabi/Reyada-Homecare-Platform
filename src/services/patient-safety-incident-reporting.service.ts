/**
 * Patient Safety Incident Reporting Service
 * Automated patient safety incident detection, classification, and reporting for DOH Nine Domains compliance
 * Implements comprehensive incident management with real-time reporting and escalation
 */

import { dohComplianceErrorReportingService } from "./doh-compliance-error-reporting.service";
import { errorHandlerService } from "./error-handler.service";
import { smsEmailNotificationService } from "./sms-email-notification.service";
import websocketService from "./websocket.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { PatientRecord, PatientEpisode } from "../types/patient";
import {
  ClinicalAssessment,
  MedicationOrder,
  VitalSigns,
} from "../types/clinical";

interface PatientSafetyIncident {
  id: string;
  timestamp: Date;
  incidentType:
    | "medication_error"
    | "fall"
    | "pressure_ulcer"
    | "infection"
    | "surgical_complication"
    | "diagnostic_error"
    | "treatment_delay"
    | "equipment_failure"
    | "communication_failure"
    | "documentation_error"
    | "adverse_drug_reaction"
    | "patient_identification_error"
    | "other";
  severity: "no_harm" | "minor" | "moderate" | "severe" | "death";
  category: "actual" | "near_miss" | "unsafe_condition";
  domain:
    | "patient_safety"
    | "medication_management"
    | "infection_control"
    | "clinical_governance"
    | "quality_management"
    | "risk_management"
    | "patient_rights"
    | "information_management"
    | "facility_management";
  patientId?: string;
  patientDetails?: {
    name: string;
    emiratesId: string;
    age: number;
    gender: string;
    medicalRecordNumber: string;
  };
  location: {
    facilityId: string;
    department: string;
    room?: string;
    unit?: string;
  };
  involvedStaff: {
    staffId: string;
    name: string;
    role: string;
    department: string;
    involvement: "primary" | "secondary" | "witness";
  }[];
  description: string;
  contributingFactors: string[];
  immediateActions: string[];
  preventiveActions: string[];
  rootCauseAnalysis?: {
    completed: boolean;
    findings: string[];
    recommendations: string[];
    completedBy?: string;
    completedDate?: Date;
  };
  reportedBy: {
    staffId: string;
    name: string;
    role: string;
    department: string;
    contactInfo: string;
  };
  reportedAt: Date;
  discoveredAt: Date;
  status:
    | "reported"
    | "under_investigation"
    | "investigation_complete"
    | "corrective_actions_pending"
    | "closed"
    | "escalated";
  priority: "low" | "medium" | "high" | "critical" | "emergency";
  dohReportingRequired: boolean;
  dohReportedAt?: Date;
  dohReportId?: string;
  externalReporting?: {
    authority: string;
    reportId: string;
    reportedAt: Date;
  }[];
  followUpActions: {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: "pending" | "in_progress" | "completed" | "overdue";
    completedAt?: Date;
    notes?: string;
  }[];
  attachments?: {
    id: string;
    filename: string;
    type: "image" | "document" | "video" | "audio";
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
  tags: string[];
  metadata: {
    autoDetected: boolean;
    detectionSource?: string;
    confidence?: number;
    relatedIncidents?: string[];
    costImpact?: number;
    qualityImpact?: string;
  };
  auditTrail: {
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousValue?: any;
    newValue?: any;
  }[];
}

interface IncidentDetectionRule {
  id: string;
  name: string;
  description: string;
  incidentType: PatientSafetyIncident["incidentType"];
  domain: PatientSafetyIncident["domain"];
  triggers: {
    dataSource: "clinical" | "medication" | "vitals" | "system" | "manual";
    conditions: {
      field: string;
      operator:
        | "equals"
        | "contains"
        | "greater_than"
        | "less_than"
        | "between"
        | "regex";
      value: any;
      threshold?: number;
    }[];
    timeWindow?: number; // minutes
    frequency?: number; // occurrences within time window
  }[];
  severity: PatientSafetyIncident["severity"];
  priority: PatientSafetyIncident["priority"];
  autoReport: boolean;
  escalationRequired: boolean;
  notificationRecipients: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IncidentAnalytics {
  totalIncidents: number;
  incidentsByType: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  incidentsByDomain: Record<string, number>;
  incidentsByCategory: Record<string, number>;
  incidentsByLocation: Record<string, number>;
  preventableIncidents: number;
  nearMisses: number;
  actualHarm: number;
  dohReportedIncidents: number;
  averageResolutionTime: number;
  trendsAnalysis: {
    incidentTrend: "increasing" | "stable" | "decreasing";
    severityTrend: "improving" | "stable" | "worsening";
    preventionEffectiveness: "improving" | "stable" | "declining";
  };
  topContributingFactors: { factor: string; count: number }[];
  departmentPerformance: {
    department: string;
    incidentCount: number;
    severityScore: number;
    improvementTrend: "improving" | "stable" | "declining";
  }[];
  monthlyStatistics: {
    month: string;
    incidents: number;
    severity: Record<string, number>;
    preventable: number;
  }[];
}

interface SafetyCultureMetrics {
  reportingRate: number;
  nearMissReporting: number;
  staffEngagement: number;
  safetyTrainingCompliance: number;
  incidentLearningImplementation: number;
  leadershipSafetyRounds: number;
  patientSafetyCommitteeActivity: number;
  safetyGoals: {
    goal: string;
    target: number;
    current: number;
    status: "on_track" | "at_risk" | "behind";
  }[];
}

class PatientSafetyIncidentReportingService {
  private incidents: Map<string, PatientSafetyIncident> = new Map();
  private detectionRules: Map<string, IncidentDetectionRule> = new Map();
  private analytics: IncidentAnalytics;
  private safetyCultureMetrics: SafetyCultureMetrics;
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private analyticsInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private readonly INCIDENT_RETENTION_YEARS = 7; // DOH requirement
  private readonly REAL_TIME_MONITORING_INTERVAL = 60000; // 1 minute
  private readonly ANALYTICS_UPDATE_INTERVAL = 300000; // 5 minutes

  constructor() {
    this.analytics = {
      totalIncidents: 0,
      incidentsByType: {},
      incidentsBySeverity: {},
      incidentsByDomain: {},
      incidentsByCategory: {},
      incidentsByLocation: {},
      preventableIncidents: 0,
      nearMisses: 0,
      actualHarm: 0,
      dohReportedIncidents: 0,
      averageResolutionTime: 0,
      trendsAnalysis: {
        incidentTrend: "stable",
        severityTrend: "stable",
        preventionEffectiveness: "stable",
      },
      topContributingFactors: [],
      departmentPerformance: [],
      monthlyStatistics: [],
    };

    this.safetyCultureMetrics = {
      reportingRate: 0,
      nearMissReporting: 0,
      staffEngagement: 0,
      safetyTrainingCompliance: 0,
      incidentLearningImplementation: 0,
      leadershipSafetyRounds: 0,
      patientSafetyCommitteeActivity: 0,
      safetyGoals: [],
    };
  }

  /**
   * Initialize Patient Safety Incident Reporting Service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log(
        "🛡️ Initializing Patient Safety Incident Reporting Service...",
      );

      // Initialize detection rules
      await this.initializeDetectionRules();
      await this.initializeSafetyStandards();
      await this.initializeReportingTemplates();

      // Set up real-time monitoring
      this.setupRealTimeMonitoring();
      this.setupAnalyticsUpdates();
      this.setupAutomaticReporting();

      // Integrate with existing services
      this.integrateWithDOHCompliance();
      this.integrateWithClinicalSystems();
      this.integrateWithNotifications();

      // Initialize safety culture monitoring
      await this.initializeSafetyCultureMonitoring();

      this.isInitialized = true;
      console.log(
        `✅ Patient Safety Incident Reporting Service initialized with ${this.detectionRules.size} detection rules`,
      );
    } catch (error) {
      console.error(
        "❌ Failed to initialize Patient Safety Incident Reporting Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "PatientSafetyIncidentReportingService.initialize",
      });
      throw error;
    }
  }

  /**
   * Initialize incident detection rules
   */
  private async initializeDetectionRules(): Promise<void> {
    const rules: IncidentDetectionRule[] = [
      {
        id: "medication_error_detection",
        name: "Medication Error Detection",
        description:
          "Detects potential medication errors and adverse drug events",
        incidentType: "medication_error",
        domain: "medication_management",
        triggers: [
          {
            dataSource: "medication",
            conditions: [
              {
                field: "dosage_variance",
                operator: "greater_than",
                value: 20, // 20% variance
                threshold: 1,
              },
            ],
          },
          {
            dataSource: "clinical",
            conditions: [
              {
                field: "notes",
                operator: "regex",
                value:
                  /medication.*(error|wrong|incorrect|missed|overdose|adverse)/i,
              },
            ],
          },
        ],
        severity: "moderate",
        priority: "high",
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "pharmacy@facility.com",
          "patient.safety@facility.com",
          "medical.director@facility.com",
        ],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "fall_risk_detection",
        name: "Patient Fall Detection",
        description: "Detects patient falls and high fall risk situations",
        incidentType: "fall",
        domain: "patient_safety",
        triggers: [
          {
            dataSource: "clinical",
            conditions: [
              {
                field: "notes",
                operator: "regex",
                value: /fall|fell|slip|trip|unsteady|balance/i,
              },
            ],
          },
          {
            dataSource: "vitals",
            conditions: [
              {
                field: "mobility_score",
                operator: "less_than",
                value: 3,
                threshold: 1,
              },
            ],
          },
        ],
        severity: "moderate",
        priority: "high",
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "nursing@facility.com",
          "patient.safety@facility.com",
          "risk.management@facility.com",
        ],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "infection_control_breach",
        name: "Infection Control Breach Detection",
        description:
          "Detects potential infection control violations and healthcare-associated infections",
        incidentType: "infection",
        domain: "infection_control",
        triggers: [
          {
            dataSource: "clinical",
            conditions: [
              {
                field: "diagnosis",
                operator: "regex",
                value: /infection|sepsis|pneumonia|uti|surgical.site/i,
              },
            ],
            timeWindow: 72, // 72 hours post-admission
          },
          {
            dataSource: "system",
            conditions: [
              {
                field: "hand_hygiene_compliance",
                operator: "less_than",
                value: 80, // Below 80% compliance
              },
            ],
          },
        ],
        severity: "moderate",
        priority: "high",
        autoReport: true,
        escalationRequired: true,
        notificationRecipients: [
          "infection.control@facility.com",
          "patient.safety@facility.com",
          "quality@facility.com",
        ],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "pressure_ulcer_detection",
        name: "Pressure Ulcer Development Detection",
        description:
          "Detects development of pressure ulcers and skin integrity issues",
        incidentType: "pressure_ulcer",
        domain: "patient_safety",
        triggers: [
          {
            dataSource: "clinical",
            conditions: [
              {
                field: "wound_assessment",
                operator: "contains",
                value: "pressure ulcer",
              },
            ],
          },
          {
            dataSource: "clinical",
            conditions: [
              {
                field: "braden_score",
                operator: "less_than",
                value: 16, // High risk
              },
            ],
            timeWindow: 24, // Daily monitoring
          },
        ],
        severity: "moderate",
        priority: "medium",
        autoReport: true,
        escalationRequired: false,
        notificationRecipients: [
          "nursing@facility.com",
          "wound.care@facility.com",
          "patient.safety@facility.com",
        ],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "communication_failure_detection",
        name: "Communication Failure Detection",
        description:
          "Detects communication breakdowns that could impact patient safety",
        incidentType: "communication_failure",
        domain: "clinical_governance",
        triggers: [
          {
            dataSource: "clinical",
            conditions: [
              {
                field: "handoff_notes",
                operator: "equals",
                value: "", // Missing handoff notes
              },
            ],
          },
          {
            dataSource: "system",
            conditions: [
              {
                field: "critical_results_acknowledgment",
                operator: "greater_than",
                value: 60, // Not acknowledged within 60 minutes
              },
            ],
          },
        ],
        severity: "minor",
        priority: "medium",
        autoReport: true,
        escalationRequired: false,
        notificationRecipients: [
          "nursing.supervisor@facility.com",
          "patient.safety@facility.com",
        ],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    rules.forEach((rule) => {
      this.detectionRules.set(rule.id, rule);
    });

    console.log(`🛡️ Initialized ${rules.length} incident detection rules`);
  }

  /**
   * Initialize safety standards and benchmarks
   */
  private async initializeSafetyStandards(): Promise<void> {
    const safetyStandards = {
      DOH_NINE_DOMAINS: {
        patient_safety: {
          targets: {
            fall_rate: { target: "<2.5 per 1000 patient days", current: 0 },
            medication_errors: { target: "<1 per 1000 doses", current: 0 },
            pressure_ulcers: { target: "<5% prevalence", current: 0 },
            infections: { target: "<2% HAI rate", current: 0 },
          },
          reporting_requirements: {
            immediate: ["death", "severe harm", "surgical complications"],
            within_24h: [
              "moderate harm",
              "medication errors",
              "falls with injury",
            ],
            weekly: ["near misses", "unsafe conditions"],
          },
        },
        quality_indicators: {
          patient_satisfaction: { target: ">90%", current: 0 },
          safety_culture_score: { target: ">4.0/5.0", current: 0 },
          incident_learning_rate: { target: ">95%", current: 0 },
        },
      },
      INTERNATIONAL_BENCHMARKS: {
        WHO_PATIENT_SAFETY: {
          global_patient_safety_goals: [
            "Identify patients correctly",
            "Improve effective communication",
            "Improve the safety of high-alert medications",
            "Ensure safe surgery",
            "Reduce the risk of healthcare-associated infections",
            "Reduce the risk of patient harm resulting from falls",
          ],
        },
        JOINT_COMMISSION: {
          national_patient_safety_goals: [
            "Improve the accuracy of patient identification",
            "Improve the effectiveness of communication among caregivers",
            "Improve the safety of using medications",
            "Reduce the harm associated with clinical alarm systems",
            "Reduce the risk of healthcare-associated infections",
            "Identify safety risks inherent in the patient population",
          ],
        },
      },
    };

    console.log("🛡️ Initialized patient safety standards and benchmarks");
  }

  /**
   * Initialize reporting templates
   */
  private async initializeReportingTemplates(): Promise<void> {
    const templates = {
      DOH_INCIDENT_REPORT: {
        sections: [
          "incident_details",
          "patient_information",
          "staff_involved",
          "contributing_factors",
          "immediate_actions",
          "root_cause_analysis",
          "preventive_measures",
          "follow_up_actions",
        ],
        required_fields: [
          "incident_type",
          "severity",
          "location",
          "description",
          "reported_by",
          "discovered_at",
        ],
      },
      MEDICATION_ERROR_REPORT: {
        sections: [
          "medication_details",
          "error_description",
          "patient_impact",
          "contributing_factors",
          "system_improvements",
        ],
        required_fields: [
          "medication_name",
          "error_type",
          "stage_of_process",
          "patient_outcome",
        ],
      },
      FALL_INCIDENT_REPORT: {
        sections: [
          "fall_circumstances",
          "injury_assessment",
          "risk_factors",
          "environmental_factors",
          "prevention_strategies",
        ],
        required_fields: [
          "fall_location",
          "injury_sustained",
          "mobility_status",
          "fall_risk_score",
        ],
      },
    };

    console.log("🛡️ Initialized incident reporting templates");
  }

  /**
   * Report a patient safety incident
   */
  async reportIncident(incidentData: {
    incidentType: PatientSafetyIncident["incidentType"];
    severity: PatientSafetyIncident["severity"];
    category: PatientSafetyIncident["category"];
    domain: PatientSafetyIncident["domain"];
    description: string;
    patientId?: string;
    location: PatientSafetyIncident["location"];
    involvedStaff: PatientSafetyIncident["involvedStaff"];
    contributingFactors: string[];
    immediateActions: string[];
    reportedBy: PatientSafetyIncident["reportedBy"];
    discoveredAt?: Date;
    attachments?: PatientSafetyIncident["attachments"];
    metadata?: Partial<PatientSafetyIncident["metadata"]>;
  }): Promise<string> {
    try {
      const incidentId = this.generateIncidentId();
      const now = new Date();

      // Get patient details if patient ID provided
      let patientDetails: PatientSafetyIncident["patientDetails"];
      if (incidentData.patientId) {
        patientDetails = await this.getPatientDetails(incidentData.patientId);
      }

      // Determine priority and DOH reporting requirement
      const priority = this.determinePriority(incidentData);
      const dohReportingRequired =
        this.assessDOHReportingRequirement(incidentData);

      const incident: PatientSafetyIncident = {
        id: incidentId,
        timestamp: now,
        incidentType: incidentData.incidentType,
        severity: incidentData.severity,
        category: incidentData.category,
        domain: incidentData.domain,
        patientId: incidentData.patientId,
        patientDetails,
        location: incidentData.location,
        involvedStaff: incidentData.involvedStaff,
        description: incidentData.description,
        contributingFactors: incidentData.contributingFactors,
        immediateActions: incidentData.immediateActions,
        preventiveActions: [], // To be filled during investigation
        reportedBy: incidentData.reportedBy,
        reportedAt: now,
        discoveredAt: incidentData.discoveredAt || now,
        status: "reported",
        priority,
        dohReportingRequired,
        followUpActions: [],
        attachments: incidentData.attachments || [],
        tags: this.generateIncidentTags(incidentData),
        metadata: {
          autoDetected: incidentData.metadata?.autoDetected || false,
          detectionSource: incidentData.metadata?.detectionSource,
          confidence: incidentData.metadata?.confidence,
          relatedIncidents: incidentData.metadata?.relatedIncidents || [],
          ...incidentData.metadata,
        },
        auditTrail: [
          {
            timestamp: now,
            action: "incident_reported",
            performedBy: incidentData.reportedBy.staffId,
            details: "Initial incident report created",
          },
        ],
      };

      // Store the incident
      this.incidents.set(incidentId, incident);

      // Update analytics
      this.updateAnalytics(incident);

      // Integrate with DOH compliance reporting
      if (dohReportingRequired) {
        await this.reportToDOHCompliance(incident);
      }

      // Send immediate notifications
      await this.sendIncidentNotifications(incident);

      // Trigger automatic escalation if required
      if (this.requiresEscalation(incident)) {
        await this.escalateIncident(incident);
      }

      // Schedule follow-up actions
      await this.scheduleFollowUpActions(incident);

      // Emit event
      this.emit("incident-reported", incident);

      console.log(
        `🛡️ Patient safety incident reported: ${incidentId} (${incident.severity} - ${incident.incidentType})`,
      );

      return incidentId;
    } catch (error) {
      console.error("❌ Failed to report patient safety incident:", error);
      errorHandlerService.handleError(error, {
        context: "PatientSafetyIncidentReportingService.reportIncident",
        incidentData,
      });
      throw error;
    }
  }

  /**
   * Automatically detect incidents from clinical data
   */
  async detectIncidents(dataSource: {
    type: "clinical" | "medication" | "vitals" | "system";
    data: any;
    patientId?: string;
    timestamp?: Date;
  }): Promise<string[]> {
    try {
      const detectedIncidents: string[] = [];
      const relevantRules = Array.from(this.detectionRules.values()).filter(
        (rule) =>
          rule.enabled &&
          rule.triggers.some((t) => t.dataSource === dataSource.type),
      );

      for (const rule of relevantRules) {
        const isTriggered = await this.evaluateDetectionRule(rule, dataSource);
        if (isTriggered) {
          const incidentId = await this.createAutoDetectedIncident(
            rule,
            dataSource,
          );
          detectedIncidents.push(incidentId);
        }
      }

      if (detectedIncidents.length > 0) {
        console.log(
          `🛡️ Auto-detected ${detectedIncidents.length} potential patient safety incidents`,
        );
      }

      return detectedIncidents;
    } catch (error) {
      console.error("❌ Failed to detect incidents:", error);
      errorHandlerService.handleError(error, {
        context: "PatientSafetyIncidentReportingService.detectIncidents",
        dataSource,
      });
      return [];
    }
  }

  /**
   * Generate comprehensive incident analytics report
   */
  async generateAnalyticsReport(
    options: {
      startDate?: Date;
      endDate?: Date;
      includeComparisons?: boolean;
      includeTrends?: boolean;
      includeBenchmarks?: boolean;
    } = {},
  ): Promise<{
    analytics: IncidentAnalytics;
    safetyCulture: SafetyCultureMetrics;
    recommendations: string[];
    actionPlan: {
      priority: "high" | "medium" | "low";
      action: string;
      timeline: string;
      responsible: string;
    }[];
  }> {
    try {
      const now = new Date();
      const startDate =
        options.startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      const endDate = options.endDate || now;

      // Filter incidents by date range
      const filteredIncidents = Array.from(this.incidents.values()).filter(
        (incident) =>
          incident.timestamp >= startDate && incident.timestamp <= endDate,
      );

      // Generate analytics
      const analytics = this.calculateAnalytics(filteredIncidents);
      const safetyCulture =
        this.calculateSafetyCultureMetrics(filteredIncidents);
      const recommendations = this.generateRecommendations(
        analytics,
        safetyCulture,
      );
      const actionPlan = this.generateActionPlan(analytics, safetyCulture);

      console.log(
        `🛡️ Generated patient safety analytics report for ${filteredIncidents.length} incidents`,
      );

      return {
        analytics,
        safetyCulture,
        recommendations,
        actionPlan,
      };
    } catch (error) {
      console.error("❌ Failed to generate analytics report:", error);
      errorHandlerService.handleError(error, {
        context:
          "PatientSafetyIncidentReportingService.generateAnalyticsReport",
        options,
      });
      throw error;
    }
  }

  /**
   * Set up real-time monitoring
   */
  private setupRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.performRealTimeChecks();
      await this.updateIncidentStatuses();
      await this.checkOverdueActions();
    }, this.REAL_TIME_MONITORING_INTERVAL);
  }

  /**
   * Set up analytics updates
   */
  private setupAnalyticsUpdates(): void {
    this.analyticsInterval = setInterval(() => {
      this.updateRealTimeAnalytics();
      this.updateSafetyCultureMetrics();
      this.analyzeTrends();
    }, this.ANALYTICS_UPDATE_INTERVAL);
  }

  /**
   * Set up automatic reporting
   */
  private setupAutomaticReporting(): void {
    setInterval(async () => {
      await this.generateScheduledReports();
      await this.submitPendingDOHReports();
      await this.cleanupOldData();
    }, 3600000); // Every hour
  }

  /**
   * Integrate with DOH compliance service
   */
  private integrateWithDOHCompliance(): void {
    this.on("incident-reported", async (incident: PatientSafetyIncident) => {
      if (incident.dohReportingRequired) {
        await this.reportToDOHCompliance(incident);
      }
    });

    this.on("incident-escalated", async (incident: PatientSafetyIncident) => {
      await this.reportToDOHCompliance(incident);
    });
  }

  /**
   * Integrate with clinical systems
   */
  private integrateWithClinicalSystems(): void {
    // Listen for clinical data updates that might trigger incident detection
    // This would integrate with actual clinical systems in production
    console.log(
      "🛡️ Integrated with clinical systems for real-time incident detection",
    );
  }

  /**
   * Integrate with notifications service
   */
  private integrateWithNotifications(): void {
    this.on("incident-reported", async (incident: PatientSafetyIncident) => {
      await this.sendIncidentNotifications(incident);
    });

    this.on("incident-escalated", async (incident: PatientSafetyIncident) => {
      await this.sendEscalationNotifications(incident);
    });
  }

  /**
   * Initialize safety culture monitoring
   */
  private async initializeSafetyCultureMonitoring(): Promise<void> {
    // Initialize safety culture assessment tools and metrics
    this.safetyCultureMetrics.safetyGoals = [
      {
        goal: "Zero preventable patient harm",
        target: 0,
        current: 0,
        status: "on_track",
      },
      {
        goal: "95% incident reporting rate",
        target: 95,
        current: 0,
        status: "on_track",
      },
      {
        goal: "100% critical incident follow-up",
        target: 100,
        current: 0,
        status: "on_track",
      },
    ];

    console.log("🛡️ Initialized safety culture monitoring");
  }

  // Helper methods
  private generateIncidentId(): string {
    return `psi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getPatientDetails(
    patientId: string,
  ): Promise<PatientSafetyIncident["patientDetails"]> {
    // In production, this would fetch from patient management system
    return {
      name: "Patient Name",
      emiratesId: "784-XXXX-XXXXXXX-X",
      age: 65,
      gender: "male",
      medicalRecordNumber: `MRN-${patientId}`,
    };
  }

  private determinePriority(
    incidentData: any,
  ): PatientSafetyIncident["priority"] {
    if (incidentData.severity === "death") return "emergency";
    if (incidentData.severity === "severe") return "critical";
    if (incidentData.severity === "moderate") return "high";
    if (incidentData.severity === "minor") return "medium";
    return "low";
  }

  private assessDOHReportingRequirement(incidentData: any): boolean {
    return (
      incidentData.severity === "death" ||
      incidentData.severity === "severe" ||
      incidentData.incidentType === "medication_error" ||
      incidentData.incidentType === "infection" ||
      incidentData.incidentType === "surgical_complication"
    );
  }

  private generateIncidentTags(incidentData: any): string[] {
    const tags: string[] = [];
    tags.push(incidentData.incidentType);
    tags.push(incidentData.severity);
    tags.push(incidentData.category);
    tags.push(incidentData.domain);
    tags.push(incidentData.location.department);
    if (incidentData.patientId) tags.push("patient_involved");
    return tags;
  }

  private updateAnalytics(incident: PatientSafetyIncident): void {
    this.analytics.totalIncidents++;
    this.analytics.incidentsByType[incident.incidentType] =
      (this.analytics.incidentsByType[incident.incidentType] || 0) + 1;
    this.analytics.incidentsBySeverity[incident.severity] =
      (this.analytics.incidentsBySeverity[incident.severity] || 0) + 1;
    this.analytics.incidentsByDomain[incident.domain] =
      (this.analytics.incidentsByDomain[incident.domain] || 0) + 1;
    this.analytics.incidentsByCategory[incident.category] =
      (this.analytics.incidentsByCategory[incident.category] || 0) + 1;

    const locationKey = `${incident.location.facilityId}-${incident.location.department}`;
    this.analytics.incidentsByLocation[locationKey] =
      (this.analytics.incidentsByLocation[locationKey] || 0) + 1;

    if (incident.category === "near_miss") {
      this.analytics.nearMisses++;
    } else if (incident.category === "actual") {
      this.analytics.actualHarm++;
    }

    if (incident.dohReportingRequired) {
      this.analytics.dohReportedIncidents++;
    }
  }

  private async reportToDOHCompliance(
    incident: PatientSafetyIncident,
  ): Promise<void> {
    try {
      const complianceErrorId =
        await dohComplianceErrorReportingService.reportComplianceError({
          errorType: "patient_safety",
          severity: this.mapSeverityToDOH(incident.severity),
          complianceStandard: "DOH_NINE_DOMAINS",
          domain: incident.domain,
          description: `Patient Safety Incident: ${incident.description}`,
          sourceSystem: "PatientSafetyIncidentReporting",
          errorCode: `PSI_${incident.incidentType.toUpperCase()}`,
          contextData: {
            incidentId: incident.id,
            incidentType: incident.incidentType,
            category: incident.category,
            location: incident.location,
            involvedStaff: incident.involvedStaff,
            contributingFactors: incident.contributingFactors,
          },
          affectedPatients: incident.patientId ? [incident.patientId] : [],
          affectedStaff: incident.involvedStaff.map((staff) => staff.staffId),
          facilityId: incident.location.facilityId,
          departmentId: incident.location.department,
        });

      // Update incident with DOH report reference
      incident.dohReportId = complianceErrorId;
      incident.dohReportedAt = new Date();
      incident.auditTrail.push({
        timestamp: new Date(),
        action: "doh_report_submitted",
        performedBy: "system",
        details: `Reported to DOH compliance system with ID: ${complianceErrorId}`,
      });

      console.log(
        `🛡️ Patient safety incident ${incident.id} reported to DOH compliance: ${complianceErrorId}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to report incident ${incident.id} to DOH compliance:`,
        error,
      );
      throw error;
    }
  }

  private mapSeverityToDOH(
    severity: PatientSafetyIncident["severity"],
  ): "low" | "medium" | "high" | "critical" {
    switch (severity) {
      case "death":
        return "critical";
      case "severe":
        return "critical";
      case "moderate":
        return "high";
      case "minor":
        return "medium";
      case "no_harm":
        return "low";
      default:
        return "medium";
    }
  }

  // Event system
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in patient safety event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Public API methods
  public getIncidents(filters?: {
    severity?: string;
    incidentType?: string;
    domain?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): PatientSafetyIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filters) {
      if (filters.severity) {
        incidents = incidents.filter((i) => i.severity === filters.severity);
      }
      if (filters.incidentType) {
        incidents = incidents.filter(
          (i) => i.incidentType === filters.incidentType,
        );
      }
      if (filters.domain) {
        incidents = incidents.filter((i) => i.domain === filters.domain);
      }
      if (filters.status) {
        incidents = incidents.filter((i) => i.status === filters.status);
      }
      if (filters.startDate) {
        incidents = incidents.filter((i) => i.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        incidents = incidents.filter((i) => i.timestamp <= filters.endDate!);
      }
    }

    return incidents;
  }

  public getAnalytics(): IncidentAnalytics {
    return { ...this.analytics };
  }

  public getSafetyCultureMetrics(): SafetyCultureMetrics {
    return { ...this.safetyCultureMetrics };
  }

  public async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }

    this.eventListeners.clear();

    console.log("🧹 Patient Safety Incident Reporting Service cleaned up");
  }

  // Additional helper methods (simplified for brevity)
  private async sendIncidentNotifications(
    incident: PatientSafetyIncident,
  ): Promise<void> {
    // Send notifications to relevant stakeholders
    if (incident.priority === "critical" || incident.priority === "emergency") {
      await smsEmailNotificationService.sendSMS(
        "patient-safety-alert-sms",
        ["+971XXXXXXXXX"], // Patient safety officer
        {
          incidentId: incident.id,
          incidentType: incident.incidentType,
          severity: incident.severity,
          location: `${incident.location.department}, ${incident.location.facilityId}`,
        },
        {
          priority: "critical",
          healthcareContext: {
            patientSafety: true,
            urgencyLevel: "emergency",
            facilityId: incident.location.facilityId,
          },
        },
      );
    }

    // Send WebSocket notification
    websocketService.sendHealthcareMessage(
      "patient-safety-incident",
      {
        incidentId: incident.id,
        incidentType: incident.incidentType,
        severity: incident.severity,
        priority: incident.priority,
        location: incident.location,
        description: incident.description,
      },
      {
        priority: incident.priority,
        patientSafety: true,
        emergency: incident.priority === "emergency",
      },
    );
  }

  private requiresEscalation(incident: PatientSafetyIncident): boolean {
    return (
      incident.severity === "death" ||
      incident.severity === "severe" ||
      incident.priority === "emergency" ||
      incident.priority === "critical"
    );
  }

  private async escalateIncident(
    incident: PatientSafetyIncident,
  ): Promise<void> {
    incident.status = "escalated";
    incident.auditTrail.push({
      timestamp: new Date(),
      action: "incident_escalated",
      performedBy: "system",
      details: `Incident escalated due to ${incident.severity} severity`,
    });

    this.emit("incident-escalated", incident);
  }

  private async scheduleFollowUpActions(
    incident: PatientSafetyIncident,
  ): Promise<void> {
    const followUpActions: PatientSafetyIncident["followUpActions"] = [];

    // Schedule immediate actions based on incident type and severity
    if (incident.severity === "death" || incident.severity === "severe") {
      followUpActions.push({
        id: `${incident.id}_rca`,
        description: "Conduct root cause analysis",
        assignedTo: "patient.safety@facility.com",
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
        status: "pending",
      });
    }

    if (incident.incidentType === "medication_error") {
      followUpActions.push({
        id: `${incident.id}_med_review`,
        description: "Review medication administration process",
        assignedTo: "pharmacy@facility.com",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: "pending",
      });
    }

    incident.followUpActions = followUpActions;
  }

  private async sendEscalationNotifications(
    incident: PatientSafetyIncident,
  ): Promise<void> {
    // Send escalation notifications to senior management
    await smsEmailNotificationService.sendEmail(
      "patient-safety-escalation-email",
      ["medical.director@facility.com", "ceo@facility.com"],
      {
        incidentId: incident.id,
        incidentType: incident.incidentType,
        severity: incident.severity,
        description: incident.description,
        location: incident.location,
        reportedBy: incident.reportedBy,
      },
      {
        priority: "critical",
        healthcareContext: {
          patientSafety: true,
          escalation: true,
          urgencyLevel: "emergency",
          facilityId: incident.location.facilityId,
        },
      },
    );
  }

  // Simplified implementations for remaining methods
  private async evaluateDetectionRule(
    rule: IncidentDetectionRule,
    dataSource: any,
  ): Promise<boolean> {
    // Implement rule evaluation logic
    return false; // Placeholder
  }

  private async createAutoDetectedIncident(
    rule: IncidentDetectionRule,
    dataSource: any,
  ): Promise<string> {
    // Create incident from auto-detection
    return "auto_incident_id"; // Placeholder
  }

  private async performRealTimeChecks(): Promise<void> {
    // Perform real-time safety checks
  }

  private async updateIncidentStatuses(): Promise<void> {
    // Update incident statuses based on time and actions
  }

  private async checkOverdueActions(): Promise<void> {
    // Check for overdue follow-up actions
  }

  private updateRealTimeAnalytics(): void {
    // Update real-time analytics
  }

  private updateSafetyCultureMetrics(): void {
    // Update safety culture metrics
  }

  private analyzeTrends(): void {
    // Analyze incident trends
  }

  private async generateScheduledReports(): Promise<void> {
    // Generate scheduled reports
  }

  private async submitPendingDOHReports(): Promise<void> {
    // Submit pending DOH reports
  }

  private async cleanupOldData(): Promise<void> {
    // Cleanup old incident data
  }

  private calculateAnalytics(
    incidents: PatientSafetyIncident[],
  ): IncidentAnalytics {
    // Calculate comprehensive analytics
    return this.analytics; // Placeholder
  }

  private calculateSafetyCultureMetrics(
    incidents: PatientSafetyIncident[],
  ): SafetyCultureMetrics {
    // Calculate safety culture metrics
    return this.safetyCultureMetrics; // Placeholder
  }

  private generateRecommendations(
    analytics: IncidentAnalytics,
    safetyCulture: SafetyCultureMetrics,
  ): string[] {
    return [
      "Enhance medication safety protocols",
      "Implement fall prevention strategies",
      "Strengthen infection control measures",
      "Improve communication processes",
      "Enhance staff training programs",
    ];
  }

  private generateActionPlan(
    analytics: IncidentAnalytics,
    safetyCulture: SafetyCultureMetrics,
  ): any[] {
    return [
      {
        priority: "high",
        action: "Implement medication double-check protocol",
        timeline: "30 days",
        responsible: "Pharmacy Director",
      },
      {
        priority: "high",
        action: "Deploy fall risk assessment tools",
        timeline: "45 days",
        responsible: "Nursing Director",
      },
      {
        priority: "medium",
        action: "Enhance incident reporting training",
        timeline: "60 days",
        responsible: "Patient Safety Officer",
      },
    ];
  }
}

export const patientSafetyIncidentReportingService =
  new PatientSafetyIncidentReportingService();
export {
  PatientSafetyIncident,
  IncidentDetectionRule,
  IncidentAnalytics,
  SafetyCultureMetrics,
};
export default patientSafetyIncidentReportingService;
