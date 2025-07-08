/**
 * Patient Safety Error Escalation Service
 * Handles patient safety incidents with automated escalation and notification
 */

import { errorHandlerService } from "./error-handler.service";
import { smsEmailNotificationService } from "./sms-email-notification.service";
import { websocketService } from "./websocket.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface SafetyIncident {
  id: string;
  timestamp: Date;
  patientId: string;
  patientName: string;
  incidentType:
    | "medication"
    | "fall"
    | "infection"
    | "procedure"
    | "equipment"
    | "communication"
    | "other";
  severity: "low" | "moderate" | "high" | "critical" | "catastrophic";
  description: string;
  location: string;
  reportedBy: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  witnesses?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  immediateActions: string[];
  status: "reported" | "investigating" | "escalated" | "resolved" | "closed";
  escalationLevel: number;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  dohReportingRequired: boolean;
  jawdaImpact: boolean;
  rootCauseAnalysis?: {
    completed: boolean;
    findings: string;
    contributingFactors: string[];
    recommendations: string[];
  };
  preventiveActions: string[];
  followUpRequired: boolean;
  metadata: {
    facilityId: string;
    departmentId: string;
    shiftId?: string;
    episodeId?: string;
    clinicalContext?: any;
  };
}

interface EscalationRule {
  id: string;
  name: string;
  conditions: {
    incidentTypes: string[];
    severityLevels: string[];
    timeThresholds: {
      initial: number; // minutes
      escalation: number; // minutes
      critical: number; // minutes
    };
    patientCriteria?: {
      age?: { min?: number; max?: number };
      conditions?: string[];
      riskFactors?: string[];
    };
  };
  escalationPath: Array<{
    level: number;
    roles: string[];
    departments: string[];
    notificationMethods: ("email" | "sms" | "push" | "call")[];
    timeLimit: number; // minutes
    autoEscalate: boolean;
  }>;
  dohNotificationRequired: boolean;
  jawdaReportingRequired: boolean;
  externalNotifications?: Array<{
    organization: string;
    contactInfo: string;
    conditions: string[];
  }>;
}

interface EscalationEvent {
  id: string;
  incidentId: string;
  timestamp: Date;
  fromLevel: number;
  toLevel: number;
  reason: string;
  triggeredBy: "manual" | "automatic" | "timeout";
  notificationsSent: Array<{
    method: string;
    recipient: string;
    status: "sent" | "delivered" | "failed";
    timestamp: Date;
  }>;
  acknowledged: boolean;
  acknowledgedBy?: {
    id: string;
    name: string;
    timestamp: Date;
  };
}

interface SafetyMetrics {
  totalIncidents: number;
  incidentsByType: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  escalationMetrics: {
    totalEscalations: number;
    averageEscalationTime: number;
    escalationsByLevel: Record<number, number>;
    timeoutEscalations: number;
  };
  responseMetrics: {
    averageResponseTime: number;
    averageResolutionTime: number;
    acknowledgmentRate: number;
  };
  complianceMetrics: {
    dohReportingCompliance: number;
    jawdaReportingCompliance: number;
    timelyReportingRate: number;
  };
  patientSafetyIndicators: {
    preventableIncidents: number;
    recurrentIncidents: number;
    nearMissEvents: number;
    safetyImprovementActions: number;
  };
}

class PatientSafetyErrorEscalationService {
  private incidents: Map<string, SafetyIncident> = new Map();
  private escalationRules: Map<string, EscalationRule> = new Map();
  private escalationEvents: Map<string, EscalationEvent[]> = new Map();
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private metrics: SafetyMetrics;
  private isInitialized = false;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.metrics = {
      totalIncidents: 0,
      incidentsByType: {},
      incidentsBySeverity: {},
      escalationMetrics: {
        totalEscalations: 0,
        averageEscalationTime: 0,
        escalationsByLevel: {},
        timeoutEscalations: 0,
      },
      responseMetrics: {
        averageResponseTime: 0,
        averageResolutionTime: 0,
        acknowledgmentRate: 0,
      },
      complianceMetrics: {
        dohReportingCompliance: 0,
        jawdaReportingCompliance: 0,
        timelyReportingRate: 0,
      },
      patientSafetyIndicators: {
        preventableIncidents: 0,
        recurrentIncidents: 0,
        nearMissEvents: 0,
        safetyImprovementActions: 0,
      },
    };
  }

  /**
   * Initialize patient safety error escalation service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🚨 Initializing Patient Safety Error Escalation Service...");

      // Initialize escalation rules
      await this.initializeEscalationRules();

      // Start monitoring and reporting
      this.startSafetyMonitoring();
      this.startComplianceReporting();

      this.isInitialized = true;
      console.log(
        `✅ Patient Safety Error Escalation Service initialized with ${this.escalationRules.size} escalation rules`,
      );
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

  private async initializeEscalationRules(): Promise<void> {
    const rules: EscalationRule[] = [
      {
        id: "critical_medication_error",
        name: "Critical Medication Error Escalation",
        conditions: {
          incidentTypes: ["medication"],
          severityLevels: ["critical", "catastrophic"],
          timeThresholds: {
            initial: 5, // 5 minutes
            escalation: 15, // 15 minutes
            critical: 30, // 30 minutes
          },
        },
        escalationPath: [
          {
            level: 1,
            roles: ["charge_nurse", "attending_physician"],
            departments: ["nursing", "medical"],
            notificationMethods: ["push", "sms"],
            timeLimit: 5,
            autoEscalate: true,
          },
          {
            level: 2,
            roles: ["nursing_supervisor", "chief_medical_officer"],
            departments: ["administration", "quality"],
            notificationMethods: ["call", "email", "sms"],
            timeLimit: 15,
            autoEscalate: true,
          },
          {
            level: 3,
            roles: ["facility_director", "patient_safety_officer"],
            departments: ["executive", "patient_safety"],
            notificationMethods: ["call", "email"],
            timeLimit: 30,
            autoEscalate: false,
          },
        ],
        dohNotificationRequired: true,
        jawdaReportingRequired: true,
        externalNotifications: [
          {
            organization: "DOH Patient Safety Division",
            contactInfo: "safety@doh.gov.ae",
            conditions: ["critical", "catastrophic"],
          },
        ],
      },
      {
        id: "patient_fall_escalation",
        name: "Patient Fall Escalation",
        conditions: {
          incidentTypes: ["fall"],
          severityLevels: ["moderate", "high", "critical"],
          timeThresholds: {
            initial: 10,
            escalation: 30,
            critical: 60,
          },
          patientCriteria: {
            age: { min: 65 },
            riskFactors: ["fall_risk", "mobility_impaired"],
          },
        },
        escalationPath: [
          {
            level: 1,
            roles: ["charge_nurse", "physician"],
            departments: ["nursing"],
            notificationMethods: ["push", "email"],
            timeLimit: 10,
            autoEscalate: true,
          },
          {
            level: 2,
            roles: ["nursing_supervisor", "risk_manager"],
            departments: ["administration", "risk_management"],
            notificationMethods: ["sms", "email"],
            timeLimit: 30,
            autoEscalate: true,
          },
        ],
        dohNotificationRequired: true,
        jawdaReportingRequired: true,
      },
      {
        id: "healthcare_acquired_infection",
        name: "Healthcare-Acquired Infection Escalation",
        conditions: {
          incidentTypes: ["infection"],
          severityLevels: ["high", "critical"],
          timeThresholds: {
            initial: 15,
            escalation: 45,
            critical: 120,
          },
        },
        escalationPath: [
          {
            level: 1,
            roles: ["infection_control_nurse", "attending_physician"],
            departments: ["infection_control", "medical"],
            notificationMethods: ["push", "email"],
            timeLimit: 15,
            autoEscalate: true,
          },
          {
            level: 2,
            roles: ["chief_medical_officer", "epidemiologist"],
            departments: ["administration", "public_health"],
            notificationMethods: ["call", "email"],
            timeLimit: 45,
            autoEscalate: true,
          },
        ],
        dohNotificationRequired: true,
        jawdaReportingRequired: true,
        externalNotifications: [
          {
            organization: "DOH Communicable Disease Control",
            contactInfo: "cdc@doh.gov.ae",
            conditions: ["outbreak_potential"],
          },
        ],
      },
      {
        id: "equipment_failure_critical",
        name: "Critical Equipment Failure Escalation",
        conditions: {
          incidentTypes: ["equipment"],
          severityLevels: ["critical", "catastrophic"],
          timeThresholds: {
            initial: 2, // 2 minutes for critical equipment
            escalation: 10,
            critical: 20,
          },
        },
        escalationPath: [
          {
            level: 1,
            roles: ["biomedical_engineer", "charge_nurse"],
            departments: ["biomedical", "nursing"],
            notificationMethods: ["push", "call"],
            timeLimit: 2,
            autoEscalate: true,
          },
          {
            level: 2,
            roles: ["facilities_manager", "chief_medical_officer"],
            departments: ["facilities", "administration"],
            notificationMethods: ["call", "sms"],
            timeLimit: 10,
            autoEscalate: true,
          },
        ],
        dohNotificationRequired: false,
        jawdaReportingRequired: true,
      },
    ];

    rules.forEach((rule) => {
      this.escalationRules.set(rule.id, rule);
    });

    console.log(
      `🚨 Initialized ${rules.length} patient safety escalation rules`,
    );
  }

  /**
   * Report a patient safety incident
   */
  async reportIncident(
    incident: Omit<
      SafetyIncident,
      "id" | "timestamp" | "status" | "escalationLevel"
    >,
  ): Promise<string> {
    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullIncident: SafetyIncident = {
      ...incident,
      id: incidentId,
      timestamp: new Date(),
      status: "reported",
      escalationLevel: 0,
    };

    // Store incident
    this.incidents.set(incidentId, fullIncident);
    this.escalationEvents.set(incidentId, []);

    // Update metrics
    this.updateIncidentMetrics(fullIncident);

    // Find applicable escalation rule
    const escalationRule = this.findApplicableEscalationRule(fullIncident);
    if (escalationRule) {
      // Start escalation process
      await this.initiateEscalation(fullIncident, escalationRule);
    }

    // Send immediate notifications
    await this.sendImmediateNotifications(fullIncident);

    // Emit event
    this.emit("incident-reported", fullIncident);

    console.log(
      `🚨 Patient safety incident reported: ${incidentId} (${incident.severity})`,
    );
    return incidentId;
  }

  private findApplicableEscalationRule(
    incident: SafetyIncident,
  ): EscalationRule | null {
    for (const rule of this.escalationRules.values()) {
      // Check incident type
      if (!rule.conditions.incidentTypes.includes(incident.incidentType)) {
        continue;
      }

      // Check severity level
      if (!rule.conditions.severityLevels.includes(incident.severity)) {
        continue;
      }

      // Check patient criteria if specified
      if (rule.conditions.patientCriteria) {
        // In a real implementation, this would check patient data
        // For now, assume criteria are met
      }

      return rule;
    }

    return null;
  }

  private async initiateEscalation(
    incident: SafetyIncident,
    rule: EscalationRule,
  ): Promise<void> {
    const firstLevel = rule.escalationPath[0];
    if (!firstLevel) return;

    // Start with level 1 escalation
    await this.escalateToLevel(incident, rule, 1);

    // Set up automatic escalation timer if enabled
    if (firstLevel.autoEscalate) {
      this.scheduleAutoEscalation(incident.id, rule, 1);
    }
  }

  private async escalateToLevel(
    incident: SafetyIncident,
    rule: EscalationRule,
    level: number,
  ): Promise<void> {
    const escalationLevel = rule.escalationPath.find(
      (path) => path.level === level,
    );
    if (!escalationLevel) return;

    const escalationEventId = `escalation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const escalationEvent: EscalationEvent = {
      id: escalationEventId,
      incidentId: incident.id,
      timestamp: new Date(),
      fromLevel: incident.escalationLevel,
      toLevel: level,
      reason: `Escalated to level ${level} per ${rule.name}`,
      triggeredBy: "automatic",
      notificationsSent: [],
      acknowledged: false,
    };

    // Update incident escalation level
    incident.escalationLevel = level;
    incident.status = "escalated";
    this.incidents.set(incident.id, incident);

    // Send notifications to appropriate personnel
    for (const method of escalationLevel.notificationMethods) {
      await this.sendEscalationNotification(
        incident,
        escalationLevel,
        method,
        escalationEvent,
      );
    }

    // Store escalation event
    const events = this.escalationEvents.get(incident.id) || [];
    events.push(escalationEvent);
    this.escalationEvents.set(incident.id, events);

    // Update metrics
    this.updateEscalationMetrics(escalationEvent);

    // Send DOH notification if required
    if (rule.dohNotificationRequired && level === 1) {
      await this.sendDOHNotification(incident, rule);
    }

    // Send external notifications if required
    if (rule.externalNotifications && level === 1) {
      await this.sendExternalNotifications(
        incident,
        rule.externalNotifications,
      );
    }

    // Emit event
    this.emit("incident-escalated", { incident, escalationEvent });

    console.log(`🚨 Incident ${incident.id} escalated to level ${level}`);
  }

  private scheduleAutoEscalation(
    incidentId: string,
    rule: EscalationRule,
    currentLevel: number,
  ): void {
    const currentLevelConfig = rule.escalationPath.find(
      (path) => path.level === currentLevel,
    );
    if (!currentLevelConfig) return;

    const timeoutMs = currentLevelConfig.timeLimit * 60 * 1000; // Convert minutes to milliseconds

    const timerId = setTimeout(async () => {
      const incident = this.incidents.get(incidentId);
      if (!incident) return;

      // Check if incident has been acknowledged
      const events = this.escalationEvents.get(incidentId) || [];
      const currentLevelEvent = events.find((e) => e.toLevel === currentLevel);

      if (!currentLevelEvent?.acknowledged) {
        // Escalate to next level
        const nextLevel = currentLevel + 1;
        const nextLevelConfig = rule.escalationPath.find(
          (path) => path.level === nextLevel,
        );

        if (nextLevelConfig) {
          await this.escalateToLevel(incident, rule, nextLevel);

          // Schedule next escalation if auto-escalate is enabled
          if (nextLevelConfig.autoEscalate) {
            this.scheduleAutoEscalation(incidentId, rule, nextLevel);
          }
        }

        // Update metrics for timeout escalation
        this.metrics.escalationMetrics.timeoutEscalations++;
      }

      // Clean up timer
      this.activeTimers.delete(`${incidentId}_${currentLevel}`);
    }, timeoutMs);

    this.activeTimers.set(`${incidentId}_${currentLevel}`, timerId);
  }

  private async sendImmediateNotifications(
    incident: SafetyIncident,
  ): Promise<void> {
    // Send real-time notification via WebSocket
    await websocketService.sendHealthcareMessage(
      "patient_safety_incident",
      {
        incidentId: incident.id,
        patientId: incident.patientId,
        patientName: incident.patientName,
        severity: incident.severity,
        incidentType: incident.incidentType,
        location: incident.location,
        description: incident.description,
        timestamp: incident.timestamp,
      },
      {
        priority: "critical",
        emergency:
          incident.severity === "critical" ||
          incident.severity === "catastrophic",
        patientSafety: true,
        dohCompliance: incident.dohReportingRequired,
      },
    );
  }

  private async sendEscalationNotification(
    incident: SafetyIncident,
    escalationLevel: EscalationRule["escalationPath"][0],
    method: string,
    escalationEvent: EscalationEvent,
  ): Promise<void> {
    const notificationData = {
      incidentId: incident.id,
      patientName: incident.patientName,
      severity: incident.severity,
      incidentType: incident.incidentType,
      location: incident.location,
      escalationLevel: escalationLevel.level,
      roles: escalationLevel.roles,
      departments: escalationLevel.departments,
    };

    try {
      switch (method) {
        case "email":
          await smsEmailNotificationService.sendEmail(
            "patient-safety-alert-email",
            ["safety-team@hospital.com"], // In production, get actual recipients
            notificationData,
            {
              priority: "critical",
              healthcareContext: {
                patientId: incident.patientId,
                facilityId: incident.metadata.facilityId,
                urgencyLevel: "emergency",
                complianceType: "DOH",
              },
            },
          );
          break;

        case "sms":
          await smsEmailNotificationService.sendSMS(
            "patient-safety-alert-sms",
            ["+971501234567"], // In production, get actual phone numbers
            notificationData,
            {
              priority: "critical",
              healthcareContext: {
                patientId: incident.patientId,
                facilityId: incident.metadata.facilityId,
                urgencyLevel: "emergency",
              },
            },
          );
          break;

        case "push":
          await websocketService.sendHealthcareMessage(
            "safety_escalation_notification",
            notificationData,
            {
              priority: "critical",
              emergency: true,
              patientSafety: true,
            },
          );
          break;

        case "call":
          // In production, integrate with calling service
          console.log(`📞 Would initiate call for incident ${incident.id}`);
          break;
      }

      escalationEvent.notificationsSent.push({
        method,
        recipient: "system", // In production, track actual recipients
        status: "sent",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Failed to send ${method} notification:`, error);
      escalationEvent.notificationsSent.push({
        method,
        recipient: "system",
        status: "failed",
        timestamp: new Date(),
      });
    }
  }

  private async sendDOHNotification(
    incident: SafetyIncident,
    rule: EscalationRule,
  ): Promise<void> {
    // Send notification to DOH Patient Safety Division
    const dohNotificationData = {
      facilityId: incident.metadata.facilityId,
      incidentId: incident.id,
      patientId: incident.patientId, // Anonymized in production
      incidentType: incident.incidentType,
      severity: incident.severity,
      timestamp: incident.timestamp,
      location: incident.location,
      description: incident.description,
      immediateActions: incident.immediateActions,
      reportingRequirement: "DOH_PATIENT_SAFETY_INCIDENT",
    };

    try {
      // In production, this would integrate with DOH reporting system
      console.log("📋 DOH Patient Safety Notification:", dohNotificationData);

      // Update compliance metrics
      this.metrics.complianceMetrics.dohReportingCompliance++;
    } catch (error) {
      console.error("Failed to send DOH notification:", error);
      errorHandlerService.handleError(error, {
        context: "PatientSafetyErrorEscalationService.sendDOHNotification",
        incidentId: incident.id,
      });
    }
  }

  private async sendExternalNotifications(
    incident: SafetyIncident,
    externalNotifications: EscalationRule["externalNotifications"],
  ): Promise<void> {
    if (!externalNotifications) return;

    for (const notification of externalNotifications) {
      try {
        // Check if conditions are met
        const conditionsMet = notification.conditions.some(
          (condition) =>
            incident.severity === condition ||
            incident.description
              .toLowerCase()
              .includes(condition.toLowerCase()),
        );

        if (conditionsMet) {
          // Send external notification
          console.log(
            `📤 External notification to ${notification.organization}:`,
            {
              contact: notification.contactInfo,
              incident: incident.id,
              severity: incident.severity,
            },
          );
        }
      } catch (error) {
        console.error(
          `Failed to send external notification to ${notification.organization}:`,
          error,
        );
      }
    }
  }

  /**
   * Acknowledge an escalation
   */
  async acknowledgeEscalation(
    incidentId: string,
    escalationLevel: number,
    acknowledgedBy: {
      id: string;
      name: string;
    },
  ): Promise<boolean> {
    const events = this.escalationEvents.get(incidentId);
    if (!events) return false;

    const escalationEvent = events.find(
      (e) => e.toLevel === escalationLevel && !e.acknowledged,
    );
    if (!escalationEvent) return false;

    escalationEvent.acknowledged = true;
    escalationEvent.acknowledgedBy = {
      ...acknowledgedBy,
      timestamp: new Date(),
    };

    // Cancel auto-escalation timer
    const timerId = this.activeTimers.get(`${incidentId}_${escalationLevel}`);
    if (timerId) {
      clearTimeout(timerId);
      this.activeTimers.delete(`${incidentId}_${escalationLevel}`);
    }

    // Update metrics
    this.metrics.responseMetrics.acknowledgmentRate =
      (this.metrics.responseMetrics.acknowledgmentRate + 1) / 2;

    // Emit event
    this.emit("escalation-acknowledged", {
      incidentId,
      escalationLevel,
      acknowledgedBy,
    });

    console.log(
      `✅ Escalation acknowledged for incident ${incidentId} at level ${escalationLevel}`,
    );
    return true;
  }

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string,
    status: SafetyIncident["status"],
    updatedBy: {
      id: string;
      name: string;
    },
  ): Promise<boolean> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    const previousStatus = incident.status;
    incident.status = status;
    this.incidents.set(incidentId, incident);

    // Cancel all active timers if incident is resolved or closed
    if (status === "resolved" || status === "closed") {
      this.activeTimers.forEach((timerId, key) => {
        if (key.startsWith(incidentId)) {
          clearTimeout(timerId);
          this.activeTimers.delete(key);
        }
      });
    }

    // Emit event
    this.emit("incident-status-updated", {
      incidentId,
      previousStatus,
      newStatus: status,
      updatedBy,
    });

    console.log(
      `📝 Incident ${incidentId} status updated: ${previousStatus} → ${status}`,
    );
    return true;
  }

  private updateIncidentMetrics(incident: SafetyIncident): void {
    this.metrics.totalIncidents++;

    // Update by type
    this.metrics.incidentsByType[incident.incidentType] =
      (this.metrics.incidentsByType[incident.incidentType] || 0) + 1;

    // Update by severity
    this.metrics.incidentsBySeverity[incident.severity] =
      (this.metrics.incidentsBySeverity[incident.severity] || 0) + 1;
  }

  private updateEscalationMetrics(escalationEvent: EscalationEvent): void {
    this.metrics.escalationMetrics.totalEscalations++;

    // Update by level
    this.metrics.escalationMetrics.escalationsByLevel[escalationEvent.toLevel] =
      (this.metrics.escalationMetrics.escalationsByLevel[
        escalationEvent.toLevel
      ] || 0) + 1;
  }

  private startSafetyMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.analyzeSafetyTrends();
      this.identifyRecurrentIssues();
      this.reportSafetyMetrics();
    }, 300000); // Every 5 minutes
  }

  private startComplianceReporting(): void {
    setInterval(() => {
      this.generateComplianceReport();
      this.checkReportingDeadlines();
    }, 3600000); // Every hour
  }

  private analyzeSafetyTrends(): void {
    const recentIncidents = Array.from(this.incidents.values()).filter(
      (incident) => {
        const hoursSinceIncident =
          (Date.now() - incident.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursSinceIncident <= 24; // Last 24 hours
      },
    );

    if (recentIncidents.length > 5) {
      console.warn(
        `⚠️ High incident volume: ${recentIncidents.length} incidents in last 24 hours`,
      );
      this.emit("high-incident-volume", {
        count: recentIncidents.length,
        period: "24h",
      });
    }
  }

  private identifyRecurrentIssues(): void {
    const incidentsByType = new Map<string, SafetyIncident[]>();

    Array.from(this.incidents.values()).forEach((incident) => {
      const key = `${incident.incidentType}_${incident.location}`;
      if (!incidentsByType.has(key)) {
        incidentsByType.set(key, []);
      }
      incidentsByType.get(key)!.push(incident);
    });

    incidentsByType.forEach((incidents, key) => {
      if (incidents.length >= 3) {
        console.warn(
          `⚠️ Recurrent issue identified: ${key} (${incidents.length} incidents)`,
        );
        this.emit("recurrent-issue-identified", { type: key, incidents });
      }
    });
  }

  private reportSafetyMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "patient_safety",
      name: "Total_Safety_Incidents",
      value: this.metrics.totalIncidents,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "patient_safety",
      name: "Critical_Incidents",
      value: this.metrics.incidentsBySeverity["critical"] || 0,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "patient_safety",
      name: "Escalation_Rate",
      value:
        this.metrics.totalIncidents > 0
          ? (this.metrics.escalationMetrics.totalEscalations /
              this.metrics.totalIncidents) *
            100
          : 0,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "compliance",
      name: "DOH_Reporting_Compliance",
      value: this.metrics.complianceMetrics.dohReportingCompliance,
      unit: "count",
    });
  }

  private generateComplianceReport(): void {
    const report = {
      reportDate: new Date().toISOString(),
      totalIncidents: this.metrics.totalIncidents,
      dohReportableIncidents: Array.from(this.incidents.values()).filter(
        (incident) => incident.dohReportingRequired,
      ).length,
      jawdaReportableIncidents: Array.from(this.incidents.values()).filter(
        (incident) => incident.jawdaImpact,
      ).length,
      complianceMetrics: this.metrics.complianceMetrics,
    };

    console.log("📊 Patient Safety Compliance Report:", report);
    this.emit("compliance-report-generated", report);
  }

  private checkReportingDeadlines(): void {
    const overdueIncidents = Array.from(this.incidents.values()).filter(
      (incident) => {
        if (!incident.dohReportingRequired) return false;

        const hoursSinceIncident =
          (Date.now() - incident.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursSinceIncident > 24 && incident.status !== "closed"; // DOH requires 24-hour reporting
      },
    );

    if (overdueIncidents.length > 0) {
      console.warn(
        `⚠️ ${overdueIncidents.length} incidents have overdue DOH reporting`,
      );
      this.emit("overdue-reporting", overdueIncidents);
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
          console.error(`Error in safety event listener for ${event}:`, error);
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
  public getIncident(incidentId: string): SafetyIncident | undefined {
    return this.incidents.get(incidentId);
  }

  public getAllIncidents(): SafetyIncident[] {
    return Array.from(this.incidents.values());
  }

  public getEscalationEvents(incidentId: string): EscalationEvent[] {
    return this.escalationEvents.get(incidentId) || [];
  }

  public getMetrics(): SafetyMetrics {
    return { ...this.metrics };
  }

  public getEscalationRules(): EscalationRule[] {
    return Array.from(this.escalationRules.values());
  }

  public addEscalationRule(rule: EscalationRule): void {
    this.escalationRules.set(rule.id, rule);
    console.log(`Added escalation rule: ${rule.name}`);
  }

  public removeEscalationRule(ruleId: string): boolean {
    const removed = this.escalationRules.delete(ruleId);
    if (removed) {
      console.log(`Removed escalation rule: ${ruleId}`);
    }
    return removed;
  }

  public async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clear all active timers
    this.activeTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.activeTimers.clear();

    this.incidents.clear();
    this.escalationEvents.clear();
    this.eventListeners.clear();

    console.log("🧹 Patient Safety Error Escalation Service cleaned up");
  }
}

export const patientSafetyErrorEscalationService =
  new PatientSafetyErrorEscalationService();
export { SafetyIncident, EscalationRule, EscalationEvent, SafetyMetrics };
export default patientSafetyErrorEscalationService;
