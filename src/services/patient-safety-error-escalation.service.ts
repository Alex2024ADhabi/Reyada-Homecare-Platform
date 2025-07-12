// Patient Safety Error Escalation Service
// Implements automated escalation workflows for patient safety incidents

import { EventEmitter } from "events";
// Import services with error handling
let errorHandlerService: any;
let performanceMonitoringService: any;
let smsEmailNotificationService: any;
let healthcareErrorPatternsService: any;

try {
  errorHandlerService = require("./error-handler.service")
    .errorHandlerService || {
    handleError: (error: any, context?: any) =>
      console.error("Error:", error, context),
  };
} catch {
  errorHandlerService = {
    handleError: (error: any, context?: any) =>
      console.error("Error:", error, context),
  };
}

try {
  performanceMonitoringService = require("./performance-monitoring.service")
    .performanceMonitoringService || {
    recordMetric: (metric: any) => console.log("Metric:", metric),
  };
} catch {
  performanceMonitoringService = {
    recordMetric: (metric: any) => console.log("Metric:", metric),
  };
}

try {
  smsEmailNotificationService = require("./sms-email-notification.service")
    .smsEmailNotificationService || {
    sendNotification: (data: any) => console.log("Notification:", data),
  };
} catch {
  smsEmailNotificationService = {
    sendNotification: (data: any) => console.log("Notification:", data),
  };
}

try {
  healthcareErrorPatternsService =
    require("./healthcare-error-patterns.service")
      .healthcareErrorPatternsService || {
      on: () => {},
      emit: () => {},
    };
} catch {
  healthcareErrorPatternsService = {
    on: () => {},
    emit: () => {},
  };
}

interface EscalationRule {
  id: string;
  name: string;
  description: string;
  triggers: {
    errorSeverity: ("low" | "medium" | "high" | "critical")[];
    patientSafetyCategories: (
      | "medication"
      | "surgical"
      | "diagnostic"
      | "communication"
      | "system"
      | "other"
    )[];
    timeThresholds: {
      immediate: number; // minutes
      urgent: number; // minutes
      routine: number; // hours
    };
    repeatOccurrence: {
      enabled: boolean;
      threshold: number; // number of similar incidents
      timeWindow: number; // hours
    };
  };
  escalationLevels: EscalationLevel[];
  dohRequirements: {
    reportingRequired: boolean;
    reportingTimeframe: number; // hours
    investigationRequired: boolean;
    externalNotificationRequired: boolean;
  };
  jawdaImpact: {
    kpiAffected: string[];
    qualityMetricImpact: "low" | "medium" | "high";
    accreditationRisk: boolean;
  };
}

interface EscalationLevel {
  level: number;
  name: string;
  description: string;
  triggerAfter: number; // minutes
  stakeholders: Stakeholder[];
  actions: EscalationAction[];
  autoResolve: boolean;
  requiresAcknowledgment: boolean;
}

interface Stakeholder {
  role: string;
  name: string;
  email?: string;
  phone?: string;
  department: string;
  priority: "primary" | "secondary" | "backup";
  availabilityHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

interface EscalationAction {
  type: "notification" | "workflow" | "system" | "external";
  description: string;
  parameters: Record<string, any>;
  automated: boolean;
  criticalPath: boolean;
}

interface PatientSafetyIncident {
  id: string;
  timestamp: Date;
  errorEventId: string;
  patientId?: string;
  facilityId: string;
  reportedBy: {
    userId: string;
    name: string;
    role: string;
  };
  incident: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    category:
      | "medication"
      | "surgical"
      | "diagnostic"
      | "communication"
      | "system"
      | "other";
    description: string;
    location: string;
    witnessesPresent: boolean;
    patientHarm: {
      occurred: boolean;
      level: "none" | "minor" | "moderate" | "severe" | "death";
      description?: string;
    };
  };
  escalation: {
    ruleId: string;
    currentLevel: number;
    status: "pending" | "in-progress" | "escalated" | "resolved" | "closed";
    escalatedAt?: Date;
    acknowledgedBy: string[];
    timeline: EscalationEvent[];
  };
  investigation: {
    required: boolean;
    assigned: boolean;
    assignedTo?: string;
    dueDate?: Date;
    status: "not-started" | "in-progress" | "completed";
    findings?: string;
    rootCause?: string;
    correctiveActions?: string[];
  };
  reporting: {
    dohReported: boolean;
    dohReportId?: string;
    jawdaReported: boolean;
    internalReported: boolean;
    familyNotified: boolean;
    mediaInvolved: boolean;
  };
  resolution: {
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    outcome: string;
    lessonsLearned?: string[];
    systemChanges?: string[];
  };
}

interface EscalationEvent {
  timestamp: Date;
  level: number;
  action: string;
  performedBy: string;
  result: "success" | "failed" | "pending";
  notes?: string;
}

interface EscalationMetrics {
  totalIncidents: number;
  incidentsBySeverity: Record<string, number>;
  incidentsByCategory: Record<string, number>;
  escalationsByLevel: Record<number, number>;
  averageResolutionTime: number;
  complianceMetrics: {
    dohReportingCompliance: number;
    timelyEscalation: number;
    acknowledgmentRate: number;
  };
  patientHarmEvents: {
    total: number;
    byLevel: Record<string, number>;
    preventable: number;
  };
  systemImprovements: {
    implementedChanges: number;
    preventedRecurrence: number;
  };
}

class PatientSafetyErrorEscalationService extends EventEmitter {
  private escalationRules: Map<string, EscalationRule> = new Map();
  private activeIncidents: Map<string, PatientSafetyIncident> = new Map();
  private stakeholders: Map<string, Stakeholder> = new Map();
  private metrics: EscalationMetrics;
  private escalationTimers: Map<string, NodeJS.Timeout[]> = new Map();
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();

    this.metrics = {
      totalIncidents: 0,
      incidentsBySeverity: {},
      incidentsByCategory: {},
      escalationsByLevel: {},
      averageResolutionTime: 0,
      complianceMetrics: {
        dohReportingCompliance: 100,
        timelyEscalation: 100,
        acknowledgmentRate: 100,
      },
      patientHarmEvents: {
        total: 0,
        byLevel: {},
        preventable: 0,
      },
      systemImprovements: {
        implementedChanges: 0,
        preventedRecurrence: 0,
      },
    };

    this.initialize();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🚨 Initializing Patient Safety Error Escalation Service...");

      // Load escalation rules and stakeholders
      this.loadEscalationRules();
      this.loadStakeholders();

      // Set up event listeners
      this.setupEventListeners();

      // Start monitoring and reporting
      this.startIncidentMonitoring();
      this.startMetricsCollection();

      this.isInitialized = true;
      console.log(
        `✅ Patient Safety Error Escalation Service initialized with ${this.escalationRules.size} rules`,
      );
      this.emit("service-initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Patient Safety Error Escalation Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "PatientSafetyErrorEscalationService.initialize",
      });
      throw error;
    }
  }

  private loadEscalationRules(): void {
    const rules: EscalationRule[] = [
      {
        id: "critical_medication_error",
        name: "Critical Medication Error Escalation",
        description:
          "Escalation for critical medication-related patient safety incidents",
        triggers: {
          errorSeverity: ["critical", "high"],
          patientSafetyCategories: ["medication"],
          timeThresholds: {
            immediate: 0, // Immediate escalation
            urgent: 15, // 15 minutes
            routine: 2, // 2 hours
          },
          repeatOccurrence: {
            enabled: true,
            threshold: 2,
            timeWindow: 24,
          },
        },
        escalationLevels: [
          {
            level: 1,
            name: "Immediate Response",
            description:
              "Immediate notification to clinical staff and pharmacy",
            triggerAfter: 0,
            stakeholders: [
              "charge_nurse",
              "clinical_pharmacist",
              "attending_physician",
            ],
            actions: [
              {
                type: "notification",
                description: "Send immediate SMS and email alerts",
                parameters: {
                  priority: "critical",
                  channels: ["sms", "email"],
                },
                automated: true,
                criticalPath: true,
              },
              {
                type: "system",
                description: "Flag patient record with medication alert",
                parameters: { alertType: "medication_safety" },
                automated: true,
                criticalPath: true,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
          {
            level: 2,
            name: "Management Escalation",
            description:
              "Escalate to nursing management and patient safety officer",
            triggerAfter: 15,
            stakeholders: ["nursing_manager", "patient_safety_officer"],
            actions: [
              {
                type: "notification",
                description: "Notify management team",
                parameters: { priority: "high" },
                automated: true,
                criticalPath: true,
              },
              {
                type: "workflow",
                description: "Initiate incident investigation workflow",
                parameters: { investigationType: "medication_error" },
                automated: true,
                criticalPath: false,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
          {
            level: 3,
            name: "Executive and Regulatory Escalation",
            description:
              "Escalate to executive team and prepare regulatory reporting",
            triggerAfter: 60,
            stakeholders: [
              "chief_medical_officer",
              "compliance_officer",
              "ceo",
            ],
            actions: [
              {
                type: "notification",
                description: "Executive team notification",
                parameters: { priority: "critical" },
                automated: true,
                criticalPath: true,
              },
              {
                type: "external",
                description: "Prepare DOH incident report",
                parameters: { reportType: "patient_safety_incident" },
                automated: false,
                criticalPath: true,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
        ],
        dohRequirements: {
          reportingRequired: true,
          reportingTimeframe: 24,
          investigationRequired: true,
          externalNotificationRequired: true,
        },
        jawdaImpact: {
          kpiAffected: [
            "Patient Safety",
            "Medication Management",
            "Quality Indicators",
          ],
          qualityMetricImpact: "high",
          accreditationRisk: true,
        },
      },
      {
        id: "patient_fall_incident",
        name: "Patient Fall Incident Escalation",
        description:
          "Escalation for patient fall incidents with potential harm",
        triggers: {
          errorSeverity: ["medium", "high", "critical"],
          patientSafetyCategories: ["system", "communication"],
          timeThresholds: {
            immediate: 5,
            urgent: 30,
            routine: 4,
          },
          repeatOccurrence: {
            enabled: true,
            threshold: 3,
            timeWindow: 72,
          },
        },
        escalationLevels: [
          {
            level: 1,
            name: "Clinical Assessment",
            description: "Immediate clinical assessment and documentation",
            triggerAfter: 5,
            stakeholders: ["charge_nurse", "attending_physician"],
            actions: [
              {
                type: "notification",
                description: "Alert clinical team for patient assessment",
                parameters: { priority: "high" },
                automated: true,
                criticalPath: true,
              },
              {
                type: "system",
                description: "Update fall risk assessment",
                parameters: { assessmentType: "post_fall" },
                automated: false,
                criticalPath: true,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
          {
            level: 2,
            name: "Safety Review",
            description: "Patient safety team review and investigation",
            triggerAfter: 30,
            stakeholders: ["patient_safety_officer", "risk_manager"],
            actions: [
              {
                type: "workflow",
                description: "Initiate fall investigation",
                parameters: { investigationType: "patient_fall" },
                automated: true,
                criticalPath: false,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
        ],
        dohRequirements: {
          reportingRequired: false,
          reportingTimeframe: 0,
          investigationRequired: true,
          externalNotificationRequired: false,
        },
        jawdaImpact: {
          kpiAffected: ["Patient Safety", "Fall Prevention"],
          qualityMetricImpact: "medium",
          accreditationRisk: false,
        },
      },
      {
        id: "infection_control_breach",
        name: "Infection Control Breach Escalation",
        description: "Escalation for infection control protocol violations",
        triggers: {
          errorSeverity: ["medium", "high", "critical"],
          patientSafetyCategories: ["system", "other"],
          timeThresholds: {
            immediate: 10,
            urgent: 60,
            routine: 8,
          },
          repeatOccurrence: {
            enabled: true,
            threshold: 2,
            timeWindow: 48,
          },
        },
        escalationLevels: [
          {
            level: 1,
            name: "Infection Control Response",
            description: "Immediate infection control team notification",
            triggerAfter: 10,
            stakeholders: ["infection_control_nurse", "charge_nurse"],
            actions: [
              {
                type: "notification",
                description: "Alert infection control team",
                parameters: { priority: "high" },
                automated: true,
                criticalPath: true,
              },
              {
                type: "system",
                description: "Initiate isolation protocols if needed",
                parameters: { protocolType: "infection_control" },
                automated: false,
                criticalPath: true,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
          {
            level: 2,
            name: "Management and Regulatory Review",
            description:
              "Management review and potential regulatory notification",
            triggerAfter: 60,
            stakeholders: ["infection_control_manager", "quality_director"],
            actions: [
              {
                type: "workflow",
                description: "Initiate infection control investigation",
                parameters: { investigationType: "infection_control" },
                automated: true,
                criticalPath: false,
              },
              {
                type: "external",
                description: "Consider DOH notification if required",
                parameters: { authority: "DOH", conditional: true },
                automated: false,
                criticalPath: false,
              },
            ],
            autoResolve: false,
            requiresAcknowledgment: true,
          },
        ],
        dohRequirements: {
          reportingRequired: false,
          reportingTimeframe: 0,
          investigationRequired: true,
          externalNotificationRequired: false,
        },
        jawdaImpact: {
          kpiAffected: ["Infection Control", "Patient Safety"],
          qualityMetricImpact: "medium",
          accreditationRisk: true,
        },
      },
    ];

    rules.forEach((rule) => {
      this.escalationRules.set(rule.id, rule);
    });

    console.log(`✅ Loaded ${rules.length} escalation rules`);
  }

  private loadStakeholders(): void {
    const stakeholders: Stakeholder[] = [
      {
        role: "charge_nurse",
        name: "Charge Nurse",
        email: "charge.nurse@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Nursing",
        priority: "primary",
        availabilityHours: {
          start: "06:00",
          end: "18:00",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "clinical_pharmacist",
        name: "Clinical Pharmacist",
        email: "pharmacist@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Pharmacy",
        priority: "primary",
        availabilityHours: {
          start: "08:00",
          end: "17:00",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "attending_physician",
        name: "Attending Physician",
        email: "physician@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Medical",
        priority: "primary",
        availabilityHours: {
          start: "00:00",
          end: "23:59",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "nursing_manager",
        name: "Nursing Manager",
        email: "nursing.manager@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Nursing Management",
        priority: "secondary",
        availabilityHours: {
          start: "07:00",
          end: "19:00",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "patient_safety_officer",
        name: "Patient Safety Officer",
        email: "safety.officer@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Quality & Safety",
        priority: "primary",
        availabilityHours: {
          start: "08:00",
          end: "17:00",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "chief_medical_officer",
        name: "Chief Medical Officer",
        email: "cmo@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Executive",
        priority: "secondary",
        availabilityHours: {
          start: "00:00",
          end: "23:59",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "compliance_officer",
        name: "Compliance Officer",
        email: "compliance@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Compliance",
        priority: "primary",
        availabilityHours: {
          start: "08:00",
          end: "17:00",
          timezone: "Asia/Dubai",
        },
      },
      {
        role: "ceo",
        name: "Chief Executive Officer",
        email: "ceo@rhhcs.ae",
        phone: "+971-50-xxx-xxxx",
        department: "Executive",
        priority: "backup",
        availabilityHours: {
          start: "00:00",
          end: "23:59",
          timezone: "Asia/Dubai",
        },
      },
    ];

    stakeholders.forEach((stakeholder) => {
      this.stakeholders.set(stakeholder.role, stakeholder);
    });

    console.log(`✅ Loaded ${stakeholders.length} stakeholders`);
  }

  private setupEventListeners(): void {
    // Listen for healthcare error events
    if (typeof healthcareErrorPatternsService !== "undefined") {
      healthcareErrorPatternsService.on("error-classified", (error: any) => {
        this.handleHealthcareError(error);
      });
    }

    // Listen for system events
    this.on("incident-created", (incident: PatientSafetyIncident) => {
      this.startEscalationTimers(incident);
    });

    this.on(
      "escalation-acknowledged",
      (data: { incidentId: string; level: number; userId: string }) => {
        this.handleEscalationAcknowledgment(data);
      },
    );
  }

  private startIncidentMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.monitorActiveIncidents();
    }, 60000); // Check every minute
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
      this.reportMetrics();
    }, 300000); // Every 5 minutes
  }

  private handleHealthcareError(error: any): void {
    // Create patient safety incident from healthcare error
    const incident = this.createIncidentFromError(error);
    if (incident) {
      this.processIncident(incident);
    }
  }

  private createIncidentFromError(error: any): PatientSafetyIncident | null {
    // Only create incidents for patient safety related errors
    if (
      error.category !== "patient-safety" &&
      error.patientSafetyImpact.level === "none"
    ) {
      return null;
    }

    const incident: PatientSafetyIncident = {
      id: `psi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      errorEventId: error.id,
      patientId: error.patientId,
      facilityId: error.facilityId || "RHHCS-001",
      reportedBy: {
        userId: error.userId || "system",
        name: "System Generated",
        role: "automated",
      },
      incident: {
        type: error.type,
        severity: error.severity,
        category: this.mapErrorCategoryToIncidentCategory(error.category),
        description: error.description,
        location: "Unknown",
        witnessesPresent: false,
        patientHarm: {
          occurred:
            error.patientSafetyImpact.level !== "none" &&
            error.patientSafetyImpact.level !== "minimal",
          level: this.mapSafetyImpactToHarmLevel(
            error.patientSafetyImpact.level,
          ),
          description: error.patientSafetyImpact.description,
        },
      },
      escalation: {
        ruleId: this.selectEscalationRule(error),
        currentLevel: 0,
        status: "pending",
        acknowledgedBy: [],
        timeline: [],
      },
      investigation: {
        required:
          error.severity === "critical" || error.severity === "catastrophic",
        assigned: false,
        status: "not-started",
      },
      reporting: {
        dohReported: false,
        jawdaReported: false,
        internalReported: false,
        familyNotified: false,
        mediaInvolved: false,
      },
      resolution: {
        resolved: false,
        outcome: "",
      },
    };

    return incident;
  }

  private mapErrorCategoryToIncidentCategory(
    category: string,
  ):
    | "medication"
    | "surgical"
    | "diagnostic"
    | "communication"
    | "system"
    | "other" {
    switch (category) {
      case "patient-safety":
        return "medication";
      case "clinical-quality":
        return "diagnostic";
      case "operational":
        return "system";
      case "regulatory-compliance":
        return "other";
      case "data-privacy":
        return "system";
      case "system-reliability":
        return "system";
      default:
        return "other";
    }
  }

  private mapSafetyImpactToHarmLevel(
    level: string,
  ): "none" | "minor" | "moderate" | "severe" | "death" {
    switch (level) {
      case "none":
      case "minimal":
        return "none";
      case "moderate":
        return "minor";
      case "significant":
        return "moderate";
      case "severe":
        return "severe";
      default:
        return "none";
    }
  }

  private selectEscalationRule(error: any): string {
    // Select appropriate escalation rule based on error characteristics
    if (error.type === "medication-error") {
      return "critical_medication_error";
    } else if (
      error.type === "system-error" &&
      error.description.includes("fall")
    ) {
      return "patient_fall_incident";
    } else if (
      error.type === "compliance-error" &&
      error.description.includes("infection")
    ) {
      return "infection_control_breach";
    }

    // Default to medication error rule for critical incidents
    return "critical_medication_error";
  }

  private processIncident(incident: PatientSafetyIncident): void {
    // Store incident
    this.activeIncidents.set(incident.id, incident);

    // Update metrics
    this.metrics.totalIncidents++;
    this.metrics.incidentsBySeverity[incident.incident.severity] =
      (this.metrics.incidentsBySeverity[incident.incident.severity] || 0) + 1;
    this.metrics.incidentsByCategory[incident.incident.category] =
      (this.metrics.incidentsByCategory[incident.incident.category] || 0) + 1;

    if (incident.incident.patientHarm.occurred) {
      this.metrics.patientHarmEvents.total++;
      this.metrics.patientHarmEvents.byLevel[
        incident.incident.patientHarm.level
      ] =
        (this.metrics.patientHarmEvents.byLevel[
          incident.incident.patientHarm.level
        ] || 0) + 1;
    }

    console.log(`🚨 Patient safety incident created: ${incident.id}`);
    this.emit("incident-created", incident);

    // Start escalation process
    this.initiateEscalation(incident);
  }

  private initiateEscalation(incident: PatientSafetyIncident): void {
    const rule = this.escalationRules.get(incident.escalation.ruleId);
    if (!rule) {
      console.error(
        `❌ Escalation rule not found: ${incident.escalation.ruleId}`,
      );
      return;
    }

    // Start with level 1 escalation
    const firstLevel = rule.escalationLevels[0];
    if (firstLevel) {
      this.executeEscalationLevel(incident, firstLevel, rule);
    }
  }

  private executeEscalationLevel(
    incident: PatientSafetyIncident,
    level: EscalationLevel,
    rule: EscalationRule,
  ): void {
    console.log(
      `⬆️ Executing escalation level ${level.level} for incident ${incident.id}`,
    );

    // Update incident status
    incident.escalation.currentLevel = level.level;
    incident.escalation.status = "in-progress";
    incident.escalation.escalatedAt = new Date();

    // Record escalation event
    const escalationEvent: EscalationEvent = {
      timestamp: new Date(),
      level: level.level,
      action: `Escalated to ${level.name}`,
      performedBy: "system",
      result: "success",
      notes: level.description,
    };

    incident.escalation.timeline.push(escalationEvent);

    // Execute escalation actions
    level.actions.forEach((action) => {
      this.executeEscalationAction(incident, action, level);
    });

    // Update metrics
    this.metrics.escalationsByLevel[level.level] =
      (this.metrics.escalationsByLevel[level.level] || 0) + 1;

    this.emit("escalation-executed", { incident, level, rule });
  }

  private executeEscalationAction(
    incident: PatientSafetyIncident,
    action: EscalationAction,
    level: EscalationLevel,
  ): void {
    try {
      switch (action.type) {
        case "notification":
          this.sendNotifications(incident, action, level);
          break;
        case "workflow":
          this.initiateWorkflow(incident, action);
          break;
        case "system":
          this.executeSystemAction(incident, action);
          break;
        case "external":
          this.handleExternalAction(incident, action);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to execute escalation action:`, error);
      errorHandlerService.handleError(error, {
        context: "PatientSafetyErrorEscalationService.executeEscalationAction",
        incidentId: incident.id,
        action: action.type,
      });
    }
  }

  private sendNotifications(
    incident: PatientSafetyIncident,
    action: EscalationAction,
    level: EscalationLevel,
  ): void {
    const stakeholderRoles = level.stakeholders;
    const priority = action.parameters.priority || "medium";
    const urgent = action.parameters.urgent || false;

    stakeholderRoles.forEach((role) => {
      const stakeholder = this.stakeholders.get(role);
      if (stakeholder) {
        const message = {
          to: stakeholder.email,
          subject: `Patient Safety Alert - Level ${level.level}: ${incident.incident.type}`,
          body: `
            Patient Safety Incident Alert
            
            Incident ID: ${incident.id}
            Severity: ${incident.incident.severity}
            Type: ${incident.incident.type}
            Description: ${incident.incident.description}
            
            Escalation Level: ${level.level} - ${level.name}
            Action Required: ${level.description}
            
            Please acknowledge receipt and take appropriate action.
            
            Facility: ${incident.facilityId}
            Timestamp: ${incident.timestamp.toISOString()}
          `,
          priority,
          urgent,
        };

        // Send notification (would integrate with actual notification service)
        console.log(
          `📧 Sending notification to ${stakeholder.name} (${stakeholder.email})`,
        );
        this.emit("notification-sent", { incident, stakeholder, message });
      }
    });
  }

  private initiateWorkflow(
    incident: PatientSafetyIncident,
    action: EscalationAction,
  ): void {
    const workflowType = action.parameters.investigationType;

    if (workflowType && incident.investigation.required) {
      incident.investigation.status = "in-progress";
      incident.investigation.assigned = true;
      incident.investigation.dueDate = new Date(
        Date.now() + 72 * 60 * 60 * 1000,
      ); // 72 hours

      console.log(
        `🔍 Initiated ${workflowType} investigation for incident ${incident.id}`,
      );
      this.emit("investigation-initiated", { incident, workflowType });
    }
  }

  private executeSystemAction(
    incident: PatientSafetyIncident,
    action: EscalationAction,
  ): void {
    const actionType =
      action.parameters.alertType ||
      action.parameters.assessmentType ||
      action.parameters.protocolType;

    console.log(
      `⚙️ Executing system action: ${actionType} for incident ${incident.id}`,
    );
    this.emit("system-action-executed", {
      incident,
      actionType,
      parameters: action.parameters,
    });
  }

  private handleExternalAction(
    incident: PatientSafetyIncident,
    action: EscalationAction,
  ): void {
    const authority = action.parameters.authority;
    const reportType = action.parameters.reportType;

    if (authority === "DOH" && !incident.reporting.dohReported) {
      incident.reporting.dohReported = true;
      this.metrics.regulatoryReports++;

      console.log(`📋 DOH reporting initiated for incident ${incident.id}`);
      this.emit("doh-reporting-initiated", { incident, reportType });
    }
  }

  private startEscalationTimers(incident: PatientSafetyIncident): void {
    const rule = this.escalationRules.get(incident.escalation.ruleId);
    if (!rule) return;

    const timers: NodeJS.Timeout[] = [];

    // Set timers for each escalation level
    rule.escalationLevels.forEach((level, index) => {
      if (index === 0) return; // First level is immediate

      const timer = setTimeout(
        () => {
          if (
            incident.escalation.currentLevel < level.level &&
            incident.escalation.status !== "resolved"
          ) {
            this.executeEscalationLevel(incident, level, rule);
          }
        },
        level.triggerAfter * 60 * 1000,
      ); // Convert minutes to milliseconds

      timers.push(timer);
    });

    this.escalationTimers.set(incident.id, timers);
  }

  private handleEscalationAcknowledgment(data: {
    incidentId: string;
    level: number;
    userId: string;
  }): void {
    const incident = this.activeIncidents.get(data.incidentId);
    if (!incident) return;

    if (!incident.escalation.acknowledgedBy.includes(data.userId)) {
      incident.escalation.acknowledgedBy.push(data.userId);

      const event: EscalationEvent = {
        timestamp: new Date(),
        level: data.level,
        action: "Acknowledged",
        performedBy: data.userId,
        result: "success",
        notes: `Escalation level ${data.level} acknowledged`,
      };

      incident.escalation.timeline.push(event);

      console.log(
        `✅ Escalation acknowledged for incident ${data.incidentId} by ${data.userId}`,
      );
      this.emit("escalation-acknowledged-processed", {
        incident,
        userId: data.userId,
      });
    }
  }

  private monitorActiveIncidents(): void {
    const now = Date.now();

    for (const [incidentId, incident] of this.activeIncidents.entries()) {
      // Check for overdue acknowledgments
      const rule = this.escalationRules.get(incident.escalation.ruleId);
      if (rule) {
        const currentLevel = rule.escalationLevels.find(
          (l) => l.level === incident.escalation.currentLevel,
        );
        if (currentLevel && currentLevel.requiresAcknowledgment) {
          const escalationTime =
            incident.escalation.escalatedAt?.getTime() || 0;
          const timeSinceEscalation = now - escalationTime;

          // If no acknowledgment after 30 minutes, escalate further
          if (
            timeSinceEscalation > 30 * 60 * 1000 &&
            incident.escalation.acknowledgedBy.length === 0
          ) {
            console.warn(
              `⚠️ No acknowledgment for incident ${incidentId} after 30 minutes`,
            );
            this.emit("acknowledgment-overdue", {
              incident,
              timeSinceEscalation,
            });
          }
        }
      }

      // Auto-resolve old incidents
      const incidentAge = now - incident.timestamp.getTime();
      if (incidentAge > 7 * 24 * 60 * 60 * 1000) {
        // 7 days
        this.resolveIncident(
          incidentId,
          "auto-resolved",
          "Automatically resolved after 7 days",
        );
      }
    }
  }

  private updateMetrics(): void {
    // Calculate average resolution time
    const resolvedIncidents = Array.from(this.activeIncidents.values()).filter(
      (i) => i.resolution.resolved && i.resolution.resolvedAt,
    );

    if (resolvedIncidents.length > 0) {
      const totalResolutionTime = resolvedIncidents.reduce((sum, incident) => {
        const resolutionTime =
          incident.resolution.resolvedAt!.getTime() -
          incident.timestamp.getTime();
        return sum + resolutionTime;
      }, 0);

      this.metrics.averageResolutionTime =
        totalResolutionTime / resolvedIncidents.length;
    }

    // Update compliance metrics
    const totalIncidents = this.metrics.totalIncidents;
    if (totalIncidents > 0) {
      const dohReportedCount = Array.from(this.activeIncidents.values()).filter(
        (i) => i.reporting.dohReported,
      ).length;

      this.metrics.complianceMetrics.dohReportingCompliance =
        (dohReportedCount / totalIncidents) * 100;

      const acknowledgedCount = Array.from(
        this.activeIncidents.values(),
      ).filter((i) => i.escalation.acknowledgedBy.length > 0).length;

      this.metrics.complianceMetrics.acknowledgmentRate =
        (acknowledgedCount / totalIncidents) * 100;
    }
  }

  private reportMetrics(): void {
    try {
      performanceMonitoringService.recordMetric({
        type: "patient-safety",
        name: "Total_Incidents",
        value: this.metrics.totalIncidents,
        unit: "count",
      });

      performanceMonitoringService.recordMetric({
        type: "patient-safety",
        name: "Patient_Harm_Events",
        value: this.metrics.patientHarmEvents.total,
        unit: "count",
      });

      performanceMonitoringService.recordMetric({
        type: "patient-safety",
        name: "Average_Resolution_Time",
        value: this.metrics.averageResolutionTime,
        unit: "ms",
      });

      performanceMonitoringService.recordMetric({
        type: "patient-safety",
        name: "DOH_Reporting_Compliance",
        value: this.metrics.complianceMetrics.dohReportingCompliance,
        unit: "percentage",
      });
    } catch (error) {
      console.error("❌ Failed to report patient safety metrics:", error);
    }
  }

  // Public API methods
  async createIncident(
    incidentData: Partial<PatientSafetyIncident>,
  ): Promise<PatientSafetyIncident> {
    const incident: PatientSafetyIncident = {
      id: `psi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      errorEventId: incidentData.errorEventId || "",
      patientId: incidentData.patientId,
      facilityId: incidentData.facilityId || "RHHCS-001",
      reportedBy: incidentData.reportedBy || {
        userId: "unknown",
        name: "Unknown",
        role: "unknown",
      },
      incident: incidentData.incident || {
        type: "other",
        severity: "low",
        category: "other",
        description: "No description provided",
        location: "Unknown",
        witnessesPresent: false,
        patientHarm: {
          occurred: false,
          level: "none",
        },
      },
      escalation: {
        ruleId: incidentData.escalation?.ruleId || "critical_medication_error",
        currentLevel: 0,
        status: "pending",
        acknowledgedBy: [],
        timeline: [],
      },
      investigation: {
        required: incidentData.investigation?.required || false,
        assigned: false,
        status: "not-started",
      },
      reporting: {
        dohReported: false,
        jawdaReported: false,
        internalReported: false,
        familyNotified: false,
        mediaInvolved: false,
      },
      resolution: {
        resolved: false,
        outcome: "",
      },
    };

    this.processIncident(incident);
    return incident;
  }

  acknowledgeEscalation(
    incidentId: string,
    userId: string,
    level?: number,
  ): boolean {
    const incident = this.activeIncidents.get(incidentId);
    if (!incident) {
      console.error(`❌ Incident not found: ${incidentId}`);
      return false;
    }

    const escalationLevel = level || incident.escalation.currentLevel;
    this.handleEscalationAcknowledgment({
      incidentId,
      level: escalationLevel,
      userId,
    });
    return true;
  }

  resolveIncident(
    incidentId: string,
    resolvedBy: string,
    outcome: string,
  ): boolean {
    const incident = this.activeIncidents.get(incidentId);
    if (!incident) {
      console.error(`❌ Incident not found: ${incidentId}`);
      return false;
    }

    incident.resolution.resolved = true;
    incident.resolution.resolvedAt = new Date();
    incident.resolution.resolvedBy = resolvedBy;
    incident.resolution.outcome = outcome;
    incident.escalation.status = "resolved";

    // Clear escalation timers
    const timers = this.escalationTimers.get(incidentId);
    if (timers) {
      timers.forEach((timer) => clearTimeout(timer));
      this.escalationTimers.delete(incidentId);
    }

    console.log(`✅ Incident resolved: ${incidentId}`);
    this.emit("incident-resolved", { incident, resolvedBy, outcome });

    return true;
  }

  getIncident(incidentId: string): PatientSafetyIncident | undefined {
    return this.activeIncidents.get(incidentId);
  }

  getAllIncidents(): PatientSafetyIncident[] {
    return Array.from(this.activeIncidents.values());
  }

  getIncidentsByStatus(
    status: PatientSafetyIncident["escalation"]["status"],
  ): PatientSafetyIncident[] {
    return Array.from(this.activeIncidents.values()).filter(
      (incident) => incident.escalation.status === status,
    );
  }

  getMetrics(): EscalationMetrics {
    return { ...this.metrics };
  }

  getEscalationRules(): EscalationRule[] {
    return Array.from(this.escalationRules.values());
  }

  getStakeholders(): Stakeholder[] {
    return Array.from(this.stakeholders.values());
  }

  // Cleanup method
  destroy(): void {
    console.log("🧹 Destroying Patient Safety Error Escalation Service...");

    // Clear all timers
    for (const timers of this.escalationTimers.values()) {
      timers.forEach((timer) => clearTimeout(timer));
    }
    this.escalationTimers.clear();

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clear all data
    this.activeIncidents.clear();
    this.escalationRules.clear();
    this.stakeholders.clear();

    console.log("✅ Patient Safety Error Escalation Service destroyed");
  }
}

// Create and export singleton instance
export const patientSafetyErrorEscalationService =
  new PatientSafetyErrorEscalationService();
export default patientSafetyErrorEscalationService;
