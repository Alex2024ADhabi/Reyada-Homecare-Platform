// P4-003: Security Incident Response Automation
// Automated security incident detection, response, and management

import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { securityService } from "./security.service";

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category:
    | "data_breach"
    | "unauthorized_access"
    | "malware"
    | "ddos"
    | "insider_threat"
    | "system_compromise";
  status: "open" | "investigating" | "contained" | "resolved" | "closed";
  detectedAt: Date;
  reportedAt: Date;
  assignedTo?: string;
  affectedSystems: string[];
  affectedUsers: string[];
  impactAssessment: {
    confidentiality: "none" | "low" | "medium" | "high";
    integrity: "none" | "low" | "medium" | "high";
    availability: "none" | "low" | "medium" | "high";
    patientSafety: "none" | "low" | "medium" | "high";
  };
  timeline: IncidentTimelineEntry[];
  evidence: Evidence[];
  responseActions: ResponseAction[];
  lessonsLearned?: string;
  rootCause?: string;
  preventiveMeasures?: string[];
}

interface IncidentTimelineEntry {
  timestamp: Date;
  event: string;
  details: string;
  actor: string;
  automated: boolean;
}

interface Evidence {
  id: string;
  type: "log" | "screenshot" | "network_capture" | "file" | "database_record";
  description: string;
  location: string;
  collectedAt: Date;
  collectedBy: string;
  hash?: string;
  chainOfCustody: ChainOfCustodyEntry[];
}

interface ChainOfCustodyEntry {
  timestamp: Date;
  action: "collected" | "transferred" | "analyzed" | "stored";
  person: string;
  location: string;
  notes?: string;
}

interface ResponseAction {
  id: string;
  type:
    | "containment"
    | "eradication"
    | "recovery"
    | "communication"
    | "investigation";
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedTo: string;
  dueDate: Date;
  completedAt?: Date;
  automated: boolean;
  results?: string;
}

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  type: "manual" | "automated";
  priority: number;
  estimatedDuration: number;
  dependencies: string[];
  automationScript?: string;
}

interface IncidentPlaybook {
  id: string;
  name: string;
  category: string;
  severity: string;
  steps: PlaybookStep[];
  slaMinutes: number;
}

class SecurityIncidentResponseService {
  private incidents: Map<string, SecurityIncident> = new Map();
  private playbooks: Map<string, IncidentPlaybook> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private alertChannels: AlertChannel[] = [];
  private isMonitoring = false;
  private readonly MAX_INCIDENTS = 1000;

  constructor() {
    this.initializePlaybooks();
    this.initializeAutomationRules();
    this.initializeAlertChannels();
    this.startMonitoring();
  }

  private initializePlaybooks(): void {
    const playbooks: IncidentPlaybook[] = [
      {
        id: "data_breach_critical",
        name: "Critical Data Breach Response",
        category: "data_breach",
        severity: "critical",
        slaMinutes: 60,
        steps: [
          {
            id: "step_1",
            title: "Immediate Containment",
            description:
              "Isolate affected systems and prevent further data exposure",
            type: "automated",
            priority: 1,
            estimatedDuration: 15,
            dependencies: [],
            automationScript: "isolate_affected_systems()",
          },
          {
            id: "step_2",
            title: "Notify Stakeholders",
            description: "Alert CISO, legal team, and executive leadership",
            type: "automated",
            priority: 1,
            estimatedDuration: 5,
            dependencies: [],
            automationScript: "notify_critical_stakeholders()",
          },
          {
            id: "step_3",
            title: "Evidence Collection",
            description:
              "Preserve logs, system images, and other digital evidence",
            type: "automated",
            priority: 2,
            estimatedDuration: 30,
            dependencies: ["step_1"],
            automationScript: "collect_digital_evidence()",
          },
          {
            id: "step_4",
            title: "Impact Assessment",
            description:
              "Determine scope of data exposure and affected individuals",
            type: "manual",
            priority: 2,
            estimatedDuration: 60,
            dependencies: ["step_3"],
          },
          {
            id: "step_5",
            title: "Regulatory Notification",
            description:
              "Notify DOH and other regulatory bodies within required timeframe",
            type: "manual",
            priority: 3,
            estimatedDuration: 120,
            dependencies: ["step_4"],
          },
        ],
      },
      {
        id: "unauthorized_access_high",
        name: "High Severity Unauthorized Access",
        category: "unauthorized_access",
        severity: "high",
        slaMinutes: 120,
        steps: [
          {
            id: "step_1",
            title: "Account Lockdown",
            description: "Disable compromised accounts and reset credentials",
            type: "automated",
            priority: 1,
            estimatedDuration: 10,
            dependencies: [],
            automationScript: "lockdown_compromised_accounts()",
          },
          {
            id: "step_2",
            title: "Session Termination",
            description: "Terminate all active sessions for affected accounts",
            type: "automated",
            priority: 1,
            estimatedDuration: 5,
            dependencies: [],
            automationScript: "terminate_active_sessions()",
          },
          {
            id: "step_3",
            title: "Access Log Analysis",
            description:
              "Review access logs to determine scope of unauthorized activity",
            type: "automated",
            priority: 2,
            estimatedDuration: 45,
            dependencies: ["step_1", "step_2"],
            automationScript: "analyze_access_logs()",
          },
        ],
      },
      {
        id: "healthcare_system_compromise",
        name: "Healthcare System Compromise",
        category: "system_compromise",
        severity: "critical",
        slaMinutes: 30,
        steps: [
          {
            id: "step_1",
            title: "Patient Safety Assessment",
            description: "Evaluate impact on patient care and safety systems",
            type: "manual",
            priority: 1,
            estimatedDuration: 15,
            dependencies: [],
          },
          {
            id: "step_2",
            title: "System Isolation",
            description: "Isolate compromised healthcare systems from network",
            type: "automated",
            priority: 1,
            estimatedDuration: 10,
            dependencies: [],
            automationScript: "isolate_healthcare_systems()",
          },
          {
            id: "step_3",
            title: "Backup System Activation",
            description:
              "Activate backup systems to maintain patient care continuity",
            type: "automated",
            priority: 1,
            estimatedDuration: 20,
            dependencies: ["step_2"],
            automationScript: "activate_backup_systems()",
          },
        ],
      },
    ];

    playbooks.forEach((playbook) => {
      this.playbooks.set(playbook.id, playbook);
    });

    console.log(`Initialized ${playbooks.length} incident response playbooks`);
  }

  private initializeAutomationRules(): void {
    const rules: AutomationRule[] = [
      {
        id: "auto_contain_malware",
        name: "Automatic Malware Containment",
        trigger: "malware_detected",
        conditions: ["severity >= high", "confidence >= 0.8"],
        actions: ["isolate_system", "notify_security_team", "collect_evidence"],
        enabled: true,
      },
      {
        id: "auto_block_suspicious_ip",
        name: "Block Suspicious IP Addresses",
        trigger: "suspicious_activity_detected",
        conditions: ["threat_score >= 8", "multiple_failed_attempts"],
        actions: ["block_ip", "create_incident", "notify_soc"],
        enabled: true,
      },
      {
        id: "auto_escalate_critical",
        name: "Auto-escalate Critical Incidents",
        trigger: "incident_created",
        conditions: ["severity = critical", "category = data_breach"],
        actions: [
          "notify_executives",
          "activate_crisis_team",
          "start_playbook",
        ],
        enabled: true,
      },
    ];

    rules.forEach((rule) => {
      this.automationRules.set(rule.id, rule);
    });

    console.log(`Initialized ${rules.length} automation rules`);
  }

  private initializeAlertChannels(): void {
    this.alertChannels = [
      {
        id: "email_security_team",
        type: "email",
        name: "Security Team Email",
        config: {
          recipients: ["security@reyada.ae", "ciso@reyada.ae"],
          severity: ["medium", "high", "critical"],
        },
        enabled: true,
      },
      {
        id: "slack_security_alerts",
        type: "slack",
        name: "Security Alerts Slack Channel",
        config: {
          webhook: process.env.SLACK_SECURITY_WEBHOOK,
          channel: "#security-alerts",
          severity: ["high", "critical"],
        },
        enabled: true,
      },
      {
        id: "sms_critical_alerts",
        type: "sms",
        name: "Critical Incident SMS",
        config: {
          numbers: ["+971501234567", "+971507654321"],
          severity: ["critical"],
        },
        enabled: true,
      },
    ];

    console.log(`Initialized ${this.alertChannels.length} alert channels`);
  }

  async createIncident(incidentData: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    category: string;
    detectedAt?: Date;
    affectedSystems?: string[];
    affectedUsers?: string[];
    source?: string;
  }): Promise<SecurityIncident> {
    try {
      const incident: SecurityIncident = {
        id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: incidentData.title,
        description: incidentData.description,
        severity: incidentData.severity,
        category: incidentData.category as any,
        status: "open",
        detectedAt: incidentData.detectedAt || new Date(),
        reportedAt: new Date(),
        affectedSystems: incidentData.affectedSystems || [],
        affectedUsers: incidentData.affectedUsers || [],
        impactAssessment: {
          confidentiality: "none",
          integrity: "none",
          availability: "none",
          patientSafety: "none",
        },
        timeline: [
          {
            timestamp: new Date(),
            event: "Incident Created",
            details: `Incident created from ${incidentData.source || "manual report"}`,
            actor: "system",
            automated: true,
          },
        ],
        evidence: [],
        responseActions: [],
      };

      // Store incident
      this.incidents.set(incident.id, incident);

      // Apply automation rules
      await this.applyAutomationRules("incident_created", incident);

      // Send alerts
      await this.sendAlerts(incident);

      // Start appropriate playbook
      await this.startPlaybook(incident);

      // Record metrics
      performanceMonitoringService.recordMetric({
        type: "security",
        name: "Security_Incident_Created",
        value: 1,
        unit: "count",
        metadata: {
          severity: incident.severity,
          category: incident.category,
        },
      });

      console.log(
        `Security incident created: ${incident.id} - ${incident.title}`,
      );
      return incident;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityIncidentResponseService.createIncident",
        incidentData,
      });
      throw error;
    }
  }

  private async applyAutomationRules(
    trigger: string,
    incident: SecurityIncident,
  ): Promise<void> {
    try {
      for (const rule of this.automationRules.values()) {
        if (!rule.enabled || rule.trigger !== trigger) continue;

        const conditionsMet = this.evaluateRuleConditions(
          rule.conditions,
          incident,
        );
        if (conditionsMet) {
          await this.executeAutomationActions(rule.actions, incident);

          this.addTimelineEntry(incident, {
            event: "Automation Rule Applied",
            details: `Applied rule: ${rule.name}`,
            actor: "system",
            automated: true,
          });
        }
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityIncidentResponseService.applyAutomationRules",
        trigger,
        incidentId: incident.id,
      });
    }
  }

  private evaluateRuleConditions(
    conditions: string[],
    incident: SecurityIncident,
  ): boolean {
    return conditions.every((condition) => {
      if (condition.includes("severity >= high")) {
        return ["high", "critical"].includes(incident.severity);
      }
      if (condition.includes("severity = critical")) {
        return incident.severity === "critical";
      }
      if (condition.includes("category = data_breach")) {
        return incident.category === "data_breach";
      }
      // Add more condition evaluations as needed
      return true;
    });
  }

  private async executeAutomationActions(
    actions: string[],
    incident: SecurityIncident,
  ): Promise<void> {
    for (const action of actions) {
      try {
        switch (action) {
          case "isolate_system":
            await this.isolateAffectedSystems(incident);
            break;
          case "notify_security_team":
            await this.notifySecurityTeam(incident);
            break;
          case "collect_evidence":
            await this.collectEvidence(incident);
            break;
          case "block_ip":
            await this.blockSuspiciousIPs(incident);
            break;
          case "create_incident":
            // Already created, skip
            break;
          case "notify_executives":
            await this.notifyExecutives(incident);
            break;
          case "activate_crisis_team":
            await this.activateCrisisTeam(incident);
            break;
          case "start_playbook":
            await this.startPlaybook(incident);
            break;
          default:
            console.warn(`Unknown automation action: ${action}`);
        }
      } catch (error) {
        errorHandlerService.handleError(error, {
          context: "SecurityIncidentResponseService.executeAutomationActions",
          action,
          incidentId: incident.id,
        });
      }
    }
  }

  private async startPlaybook(incident: SecurityIncident): Promise<void> {
    try {
      // Find appropriate playbook
      const playbookKey = `${incident.category}_${incident.severity}`;
      let playbook = this.playbooks.get(playbookKey);

      if (!playbook) {
        // Try to find a generic playbook for the category
        playbook = Array.from(this.playbooks.values()).find(
          (p) => p.category === incident.category,
        );
      }

      if (!playbook) {
        console.warn(
          `No playbook found for incident: ${incident.category}_${incident.severity}`,
        );
        return;
      }

      // Create response actions from playbook steps
      for (const step of playbook.steps) {
        const action: ResponseAction = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: this.mapStepTypeToActionType(step.type),
          description: step.description,
          status: "pending",
          assignedTo: step.type === "automated" ? "system" : "security_team",
          dueDate: new Date(Date.now() + step.estimatedDuration * 60000),
          automated: step.type === "automated",
        };

        incident.responseActions.push(action);

        // Execute automated steps immediately
        if (step.type === "automated" && step.automationScript) {
          await this.executeAutomationScript(
            step.automationScript,
            incident,
            action,
          );
        }
      }

      this.addTimelineEntry(incident, {
        event: "Playbook Started",
        details: `Started playbook: ${playbook.name}`,
        actor: "system",
        automated: true,
      });

      console.log(
        `Started playbook ${playbook.name} for incident ${incident.id}`,
      );
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityIncidentResponseService.startPlaybook",
        incidentId: incident.id,
      });
    }
  }

  private mapStepTypeToActionType(stepType: string): ResponseAction["type"] {
    const mapping: Record<string, ResponseAction["type"]> = {
      containment: "containment",
      investigation: "investigation",
      recovery: "recovery",
      communication: "communication",
      eradication: "eradication",
    };
    return mapping[stepType] || "investigation";
  }

  private async executeAutomationScript(
    script: string,
    incident: SecurityIncident,
    action: ResponseAction,
  ): Promise<void> {
    try {
      action.status = "in_progress";

      // Mock automation script execution
      switch (script) {
        case "isolate_affected_systems()":
          await this.isolateAffectedSystems(incident);
          break;
        case "notify_critical_stakeholders()":
          await this.notifyExecutives(incident);
          break;
        case "collect_digital_evidence()":
          await this.collectEvidence(incident);
          break;
        case "lockdown_compromised_accounts()":
          await this.lockdownCompromisedAccounts(incident);
          break;
        case "terminate_active_sessions()":
          await this.terminateActiveSessions(incident);
          break;
        case "analyze_access_logs()":
          await this.analyzeAccessLogs(incident);
          break;
        default:
          console.warn(`Unknown automation script: ${script}`);
      }

      action.status = "completed";
      action.completedAt = new Date();
      action.results = `Automation script ${script} executed successfully`;

      this.addTimelineEntry(incident, {
        event: "Automated Action Completed",
        details: `Completed: ${action.description}`,
        actor: "system",
        automated: true,
      });
    } catch (error) {
      action.status = "failed";
      action.results = `Failed to execute: ${error.message}`;

      errorHandlerService.handleError(error, {
        context: "SecurityIncidentResponseService.executeAutomationScript",
        script,
        incidentId: incident.id,
      });
    }
  }

  // Automation action implementations
  private async isolateAffectedSystems(
    incident: SecurityIncident,
  ): Promise<void> {
    console.log(`Isolating affected systems for incident ${incident.id}`);
    // Mock system isolation
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async notifySecurityTeam(incident: SecurityIncident): Promise<void> {
    console.log(`Notifying security team for incident ${incident.id}`);
    await this.sendAlerts(incident);
  }

  private async notifyExecutives(incident: SecurityIncident): Promise<void> {
    console.log(`Notifying executives for critical incident ${incident.id}`);
    // Mock executive notification
  }

  private async activateCrisisTeam(incident: SecurityIncident): Promise<void> {
    console.log(`Activating crisis team for incident ${incident.id}`);
    // Mock crisis team activation
  }

  private async collectEvidence(incident: SecurityIncident): Promise<void> {
    console.log(`Collecting evidence for incident ${incident.id}`);

    const evidence: Evidence = {
      id: `evidence_${Date.now()}`,
      type: "log",
      description: "System logs from affected systems",
      location: "/var/log/security/",
      collectedAt: new Date(),
      collectedBy: "system",
      chainOfCustody: [
        {
          timestamp: new Date(),
          action: "collected",
          person: "system",
          location: "automated_collection",
          notes: "Automatically collected during incident response",
        },
      ],
    };

    incident.evidence.push(evidence);
  }

  private async blockSuspiciousIPs(incident: SecurityIncident): Promise<void> {
    console.log(`Blocking suspicious IPs for incident ${incident.id}`);
    // Mock IP blocking
  }

  private async lockdownCompromisedAccounts(
    incident: SecurityIncident,
  ): Promise<void> {
    console.log(
      `Locking down compromised accounts for incident ${incident.id}`,
    );
    // Mock account lockdown
  }

  private async terminateActiveSessions(
    incident: SecurityIncident,
  ): Promise<void> {
    console.log(`Terminating active sessions for incident ${incident.id}`);
    // Mock session termination
  }

  private async analyzeAccessLogs(incident: SecurityIncident): Promise<void> {
    console.log(`Analyzing access logs for incident ${incident.id}`);
    // Mock log analysis
  }

  private async sendAlerts(incident: SecurityIncident): Promise<void> {
    try {
      for (const channel of this.alertChannels) {
        if (!channel.enabled) continue;

        const shouldAlert = channel.config.severity.includes(incident.severity);
        if (shouldAlert) {
          await this.sendAlert(channel, incident);
        }
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityIncidentResponseService.sendAlerts",
        incidentId: incident.id,
      });
    }
  }

  private async sendAlert(
    channel: AlertChannel,
    incident: SecurityIncident,
  ): Promise<void> {
    console.log(
      `Sending ${channel.type} alert for incident ${incident.id} via ${channel.name}`,
    );

    const alertMessage = {
      title: `Security Incident: ${incident.title}`,
      severity: incident.severity.toUpperCase(),
      description: incident.description,
      incidentId: incident.id,
      timestamp: incident.detectedAt.toISOString(),
    };

    // Mock alert sending
    switch (channel.type) {
      case "email":
        console.log(`Email sent to: ${channel.config.recipients?.join(", ")}`);
        break;
      case "slack":
        console.log(`Slack message sent to: ${channel.config.channel}`);
        break;
      case "sms":
        console.log(`SMS sent to: ${channel.config.numbers?.join(", ")}`);
        break;
    }
  }

  private addTimelineEntry(
    incident: SecurityIncident,
    entry: Omit<IncidentTimelineEntry, "timestamp">,
  ): void {
    incident.timeline.push({
      timestamp: new Date(),
      ...entry,
    });
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor for security events
    setInterval(() => {
      this.checkForSecurityEvents();
    }, 60000); // Every minute

    // Update incident statuses
    setInterval(() => {
      this.updateIncidentStatuses();
    }, 300000); // Every 5 minutes

    console.log("Security incident response monitoring started");
  }

  private async checkForSecurityEvents(): Promise<void> {
    try {
      // Check security service for new events
      const securityEvents = securityService.getSecurityEvents("high", 10);

      for (const event of securityEvents) {
        // Check if we already have an incident for this event
        const existingIncident = Array.from(this.incidents.values()).find(
          (inc) => inc.description.includes(event.id),
        );

        if (!existingIncident && event.severity === "high") {
          await this.createIncident({
            title: `Security Event: ${event.type}`,
            description: `${event.description} (Event ID: ${event.id})`,
            severity: "high",
            category: "suspicious_activity",
            detectedAt: new Date(event.timestamp),
            source: "security_monitoring",
          });
        }
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "SecurityIncidentResponseService.checkForSecurityEvents",
      });
    }
  }

  private updateIncidentStatuses(): void {
    for (const incident of this.incidents.values()) {
      // Auto-close resolved incidents after 24 hours
      if (incident.status === "resolved") {
        const resolvedTime = incident.timeline.find((entry) =>
          entry.event.includes("Resolved"),
        )?.timestamp;

        if (resolvedTime && Date.now() - resolvedTime.getTime() > 86400000) {
          incident.status = "closed";
          this.addTimelineEntry(incident, {
            event: "Incident Closed",
            details: "Automatically closed after 24 hours in resolved status",
            actor: "system",
            automated: true,
          });
        }
      }
    }
  }

  // Public API methods
  getIncident(incidentId: string): SecurityIncident | undefined {
    return this.incidents.get(incidentId);
  }

  getAllIncidents(filters?: {
    status?: string;
    severity?: string;
    category?: string;
    limit?: number;
  }): SecurityIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filters) {
      if (filters.status) {
        incidents = incidents.filter((inc) => inc.status === filters.status);
      }
      if (filters.severity) {
        incidents = incidents.filter(
          (inc) => inc.severity === filters.severity,
        );
      }
      if (filters.category) {
        incidents = incidents.filter(
          (inc) => inc.category === filters.category,
        );
      }
    }

    incidents.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());

    return filters?.limit ? incidents.slice(0, filters.limit) : incidents;
  }

  async updateIncident(
    incidentId: string,
    updates: Partial<SecurityIncident>,
  ): Promise<SecurityIncident | null> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    Object.assign(incident, updates);

    this.addTimelineEntry(incident, {
      event: "Incident Updated",
      details: `Updated fields: ${Object.keys(updates).join(", ")}`,
      actor: "user",
      automated: false,
    });

    return incident;
  }

  getIncidentStats(): any {
    const incidents = Array.from(this.incidents.values());
    const recentIncidents = incidents.filter(
      (inc) => Date.now() - inc.detectedAt.getTime() < 86400000, // Last 24 hours
    );

    return {
      totalIncidents: incidents.length,
      recentIncidents: recentIncidents.length,
      openIncidents: incidents.filter((inc) => inc.status === "open").length,
      criticalIncidents: incidents.filter((inc) => inc.severity === "critical")
        .length,
      incidentsBySeverity: this.groupBy(incidents, "severity"),
      incidentsByCategory: this.groupBy(incidents, "category"),
      incidentsByStatus: this.groupBy(incidents, "status"),
      averageResolutionTime: this.calculateAverageResolutionTime(incidents),
    };
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageResolutionTime(
    incidents: SecurityIncident[],
  ): number {
    const resolvedIncidents = incidents.filter(
      (inc) => inc.status === "resolved" || inc.status === "closed",
    );
    if (resolvedIncidents.length === 0) return 0;

    const totalTime = resolvedIncidents.reduce((sum, inc) => {
      const resolvedEntry = inc.timeline.find((entry) =>
        entry.event.includes("Resolved"),
      );
      if (resolvedEntry) {
        return (
          sum + (resolvedEntry.timestamp.getTime() - inc.detectedAt.getTime())
        );
      }
      return sum;
    }, 0);

    return totalTime / resolvedIncidents.length / (1000 * 60 * 60); // Convert to hours
  }
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  enabled: boolean;
}

interface AlertChannel {
  id: string;
  type: "email" | "slack" | "sms" | "webhook";
  name: string;
  config: {
    recipients?: string[];
    webhook?: string;
    channel?: string;
    numbers?: string[];
    severity: string[];
  };
  enabled: boolean;
}

export const securityIncidentResponseService =
  new SecurityIncidentResponseService();
export {
  SecurityIncident,
  IncidentTimelineEntry,
  Evidence,
  ResponseAction,
  IncidentPlaybook,
};
export default securityIncidentResponseService;
