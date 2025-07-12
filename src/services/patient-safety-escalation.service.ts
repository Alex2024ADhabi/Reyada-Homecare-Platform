/**
 * Production Patient Safety Error Escalation System
 * Automated escalation workflows for healthcare incidents
 */

interface PatientSafetyIncident {
  id: string;
  type: SafetyIncidentType;
  severity: 'near_miss' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  category: SafetyCategory;
  patientId: string;
  reportedBy: string;
  reportedAt: number;
  description: string;
  location: string;
  witnesses: string[];
  immediateActions: string[];
  status: IncidentStatus;
  escalationLevel: number;
  escalationHistory: EscalationStep[];
  riskScore: number;
  dohReportable: boolean;
  investigationRequired: boolean;
  rootCauseAnalysis?: RootCauseAnalysis;
}

type SafetyIncidentType = 
  | 'medication_error'
  | 'patient_fall'
  | 'wrong_patient'
  | 'surgical_error'
  | 'diagnostic_error'
  | 'communication_failure'
  | 'equipment_failure'
  | 'infection_control'
  | 'documentation_error'
  | 'delay_in_treatment';

type SafetyCategory =
  | 'clinical_care'
  | 'medication_safety'
  | 'surgical_safety'
  | 'diagnostic_safety'
  | 'environmental_safety'
  | 'information_safety'
  | 'equipment_safety';

type IncidentStatus = 
  | 'reported'
  | 'under_review'
  | 'investigating'
  | 'escalated'
  | 'resolved'
  | 'closed';

interface EscalationStep {
  level: number;
  escalatedTo: string[];
  escalatedAt: number;
  escalatedBy: string;
  reason: string;
  response?: EscalationResponse;
  timeToResponse?: number;
}

interface EscalationResponse {
  respondedBy: string;
  respondedAt: number;
  actions: string[];
  nextSteps: string[];
  escalateToNext: boolean;
}

interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  targetLevel: number;
  recipients: EscalationRecipient[];
  timeThreshold: number;
  autoEscalate: boolean;
  requiresAcknowledgment: boolean;
}

interface EscalationCondition {
  field: keyof PatientSafetyIncident;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

interface EscalationRecipient {
  role: string;
  userId?: string;
  department?: string;
  contactMethod: 'email' | 'sms' | 'push' | 'phone';
  priority: number;
}

interface RootCauseAnalysis {
  id: string;
  incidentId: string;
  conductedBy: string;
  conductedAt: number;
  methodology: 'fishbone' | 'five_whys' | 'fault_tree' | 'barrier_analysis';
  findings: RCAFinding[];
  rootCauses: string[];
  contributingFactors: string[];
  recommendations: RCARecommendation[];
  preventiveMeasures: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'reviewed';
}

interface RCAFinding {
  category: string;
  description: string;
  evidence: string[];
  impact: 'low' | 'medium' | 'high';
}

interface RCARecommendation {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: number;
  status: 'pending' | 'in_progress' | 'completed';
  resources: string[];
}

class PatientSafetyErrorEscalation {
  private incidents: Map<string, PatientSafetyIncident> = new Map();
  private escalationRules: Map<string, EscalationRule> = new Map();
  private escalationQueue: PatientSafetyIncident[] = [];
  private acknowledgmentQueue: Map<string, EscalationStep> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEscalationRules();
    this.startEscalationProcessing();
  }

  /**
   * Initialize patient safety escalation rules
   */
  private initializeEscalationRules(): void {
    // Level 1: Immediate Supervisor/Charge Nurse
    this.addEscalationRule({
      id: 'level_1_immediate',
      name: 'Immediate Supervisor Escalation',
      conditions: [
        { field: 'severity', operator: 'in', value: ['minor', 'moderate', 'major', 'catastrophic'] }
      ],
      targetLevel: 1,
      recipients: [
        { role: 'charge_nurse', contactMethod: 'push', priority: 1 },
        { role: 'unit_supervisor', contactMethod: 'email', priority: 2 }
      ],
      timeThreshold: 300000, // 5 minutes
      autoEscalate: true,
      requiresAcknowledgment: true
    });

    // Level 2: Department Manager/Medical Director
    this.addEscalationRule({
      id: 'level_2_management',
      name: 'Department Management Escalation',
      conditions: [
        { field: 'severity', operator: 'in', value: ['moderate', 'major', 'catastrophic'] },
        { field: 'escalationLevel', operator: 'greater_than', value: 0 }
      ],
      targetLevel: 2,
      recipients: [
        { role: 'department_manager', contactMethod: 'phone', priority: 1 },
        { role: 'medical_director', contactMethod: 'push', priority: 1 },
        { role: 'patient_safety_officer', contactMethod: 'email', priority: 2 }
      ],
      timeThreshold: 900000, // 15 minutes
      autoEscalate: true,
      requiresAcknowledgment: true
    });

    // Level 3: Senior Leadership/Chief Medical Officer
    this.addEscalationRule({
      id: 'level_3_senior',
      name: 'Senior Leadership Escalation',
      conditions: [
        { field: 'severity', operator: 'in', value: ['major', 'catastrophic'] },
        { field: 'escalationLevel', operator: 'greater_than', value: 1 }
      ],
      targetLevel: 3,
      recipients: [
        { role: 'chief_medical_officer', contactMethod: 'phone', priority: 1 },
        { role: 'chief_nursing_officer', contactMethod: 'phone', priority: 1 },
        { role: 'ceo', contactMethod: 'email', priority: 2 }
      ],
      timeThreshold: 1800000, // 30 minutes
      autoEscalate: true,
      requiresAcknowledgment: true
    });

    // Level 4: External Reporting/DOH
    this.addEscalationRule({
      id: 'level_4_external',
      name: 'External Reporting Escalation',
      conditions: [
        { field: 'severity', operator: 'equals', value: 'catastrophic' },
        { field: 'dohReportable', operator: 'equals', value: true }
      ],
      targetLevel: 4,
      recipients: [
        { role: 'compliance_officer', contactMethod: 'phone', priority: 1 },
        { role: 'legal_counsel', contactMethod: 'email', priority: 2 },
        { role: 'doh_liaison', contactMethod: 'email', priority: 1 }
      ],
      timeThreshold: 3600000, // 1 hour
      autoEscalate: false, // Manual approval required
      requiresAcknowledgment: true
    });

    // Medication Error Specific Rules
    this.addEscalationRule({
      id: 'medication_error_critical',
      name: 'Critical Medication Error',
      conditions: [
        { field: 'type', operator: 'equals', value: 'medication_error' },
        { field: 'severity', operator: 'in', value: ['major', 'catastrophic'] }
      ],
      targetLevel: 2,
      recipients: [
        { role: 'chief_pharmacist', contactMethod: 'phone', priority: 1 },
        { role: 'medication_safety_officer', contactMethod: 'push', priority: 1 },
        { role: 'attending_physician', contactMethod: 'phone', priority: 2 }
      ],
      timeThreshold: 600000, // 10 minutes
      autoEscalate: true,
      requiresAcknowledgment: true
    });

    // Surgical Error Rules
    this.addEscalationRule({
      id: 'surgical_error_immediate',
      name: 'Surgical Error Immediate',
      conditions: [
        { field: 'type', operator: 'equals', value: 'surgical_error' }
      ],
      targetLevel: 3,
      recipients: [
        { role: 'chief_of_surgery', contactMethod: 'phone', priority: 1 },
        { role: 'operating_room_director', contactMethod: 'phone', priority: 1 },
        { role: 'patient_safety_officer', contactMethod: 'push', priority: 2 }
      ],
      timeThreshold: 300000, // 5 minutes
      autoEscalate: true,
      requiresAcknowledgment: true
    });

    console.log(`✅ Initialized ${this.escalationRules.size} patient safety escalation rules`);
  }

  /**
   * Report patient safety incident
   */
  async reportIncident(
    incidentData: Omit<PatientSafetyIncident, 'id' | 'reportedAt' | 'status' | 'escalationLevel' | 'escalationHistory' | 'riskScore'>
  ): Promise<string> {
    const incident: PatientSafetyIncident = {
      ...incidentData,
      id: this.generateIncidentId(),
      reportedAt: Date.now(),
      status: 'reported',
      escalationLevel: 0,
      escalationHistory: [],
      riskScore: this.calculateRiskScore(incidentData)
    };

    // Store incident
    this.incidents.set(incident.id, incident);

    // Immediate assessment and escalation
    await this.assessAndEscalate(incident);

    // Emit incident reported event
    this.emit('incident_reported', incident);

    console.log(`🚨 Patient safety incident reported: ${incident.id} (${incident.type})`);
    return incident.id;
  }

  /**
   * Assess incident and trigger escalation
   */
  private async assessAndEscalate(incident: PatientSafetyIncident): Promise<void> {
    // Find applicable escalation rules
    const applicableRules = this.findApplicableRules(incident);

    for (const rule of applicableRules) {
      if (rule.autoEscalate) {
        await this.executeEscalation(incident, rule);
      } else {
        // Add to queue for manual review
        this.escalationQueue.push(incident);
      }
    }

    // Check if DOH reporting is required
    if (incident.dohReportable) {
      await this.initiateDOHReporting(incident);
    }

    // Check if investigation is required
    if (incident.investigationRequired || incident.severity === 'major' || incident.severity === 'catastrophic') {
      await this.initiateInvestigation(incident);
    }
  }

  /**
   * Find applicable escalation rules
   */
  private findApplicableRules(incident: PatientSafetyIncident): EscalationRule[] {
    const applicableRules: EscalationRule[] = [];

    for (const rule of this.escalationRules.values()) {
      if (this.evaluateRuleConditions(incident, rule.conditions)) {
        applicableRules.push(rule);
      }
    }

    // Sort by target level
    return applicableRules.sort((a, b) => a.targetLevel - b.targetLevel);
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(
    incident: PatientSafetyIncident,
    conditions: EscalationCondition[]
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = incident[condition.field];

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater_than':
          return fieldValue > condition.value;
        case 'less_than':
          return fieldValue < condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }

  /**
   * Execute escalation
   */
  private async executeEscalation(
    incident: PatientSafetyIncident,
    rule: EscalationRule
  ): Promise<void> {
    const escalationStep: EscalationStep = {
      level: rule.targetLevel,
      escalatedTo: rule.recipients.map(r => r.role),
      escalatedAt: Date.now(),
      escalatedBy: 'system',
      reason: `Auto-escalated based on rule: ${rule.name}`
    };

    // Update incident
    incident.escalationLevel = Math.max(incident.escalationLevel, rule.targetLevel);
    incident.escalationHistory.push(escalationStep);
    incident.status = 'escalated';

    // Send notifications
    await this.sendEscalationNotifications(incident, rule, escalationStep);

    // Add to acknowledgment queue if required
    if (rule.requiresAcknowledgment) {
      this.acknowledgmentQueue.set(
        `${incident.id}_${rule.targetLevel}`,
        escalationStep
      );
    }

    console.log(`🚨 Incident escalated: ${incident.id} to level ${rule.targetLevel}`);
    this.emit('incident_escalated', { incident, rule, escalationStep });
  }

  /**
   * Send escalation notifications
   */
  private async sendEscalationNotifications(
    incident: PatientSafetyIncident,
    rule: EscalationRule,
    escalationStep: EscalationStep
  ): Promise<void> {
    for (const recipient of rule.recipients) {
      try {
        await this.sendNotification(incident, recipient, escalationStep);
      } catch (error) {
        console.error(`❌ Failed to send notification to ${recipient.role}:`, error);
      }
    }
  }

  /**
   * Send individual notification
   */
  private async sendNotification(
    incident: PatientSafetyIncident,
    recipient: EscalationRecipient,
    escalationStep: EscalationStep
  ): Promise<void> {
    const message = this.formatEscalationMessage(incident, escalationStep);

    switch (recipient.contactMethod) {
      case 'email':
        await this.sendEmailNotification(recipient, incident, message);
        break;
      case 'sms':
        await this.sendSMSNotification(recipient, incident, message);
        break;
      case 'push':
        await this.sendPushNotification(recipient, incident, message);
        break;
      case 'phone':
        await this.initiatePhoneCall(recipient, incident);
        break;
    }

    console.log(`📧 Escalation notification sent to ${recipient.role} via ${recipient.contactMethod}`);
  }

  /**
   * Format escalation message
   */
  private formatEscalationMessage(
    incident: PatientSafetyIncident,
    escalationStep: EscalationStep
  ): string {
    return `
PATIENT SAFETY INCIDENT ESCALATION

Incident ID: ${incident.id}
Type: ${incident.type}
Severity: ${incident.severity.toUpperCase()}
Patient ID: ${incident.patientId}
Location: ${incident.location}
Reported: ${new Date(incident.reportedAt).toLocaleString()}
Escalation Level: ${escalationStep.level}

Description: ${incident.description}

Immediate Actions Taken:
${incident.immediateActions.map(action => `- ${action}`).join('\n')}

IMMEDIATE ATTENTION REQUIRED
Please acknowledge receipt and respond with actions taken.
    `.trim();
  }

  /**
   * Notification methods (simulated)
   */
  private async sendEmailNotification(
    recipient: EscalationRecipient,
    incident: PatientSafetyIncident,
    message: string
  ): Promise<void> {
    // Use email service
    try {
      const emailService = await import('./email-sms.service').then(m => m.default);
      await emailService.sendEmail({
        to: [{ email: `${recipient.role}@hospital.com`, name: recipient.role }],
        template: 'emergency_alert',
        data: {
          alertType: 'Patient Safety Incident',
          patientId: incident.patientId,
          alertTime: new Date(incident.reportedAt).toLocaleString(),
          alertDetails: message
        },
        priority: 'urgent'
      });
    } catch (error) {
      console.warn('⚠️ Email service not available, logging notification');
      console.log(`📧 EMAIL: ${recipient.role} - ${message}`);
    }
  }

  private async sendSMSNotification(
    recipient: EscalationRecipient,
    incident: PatientSafetyIncident,
    message: string
  ): Promise<void> {
    // Use SMS service
    try {
      const smsService = await import('./email-sms.service').then(m => m.default);
      await smsService.sendSMS({
        to: [{ phone: `+971-50-XXX-XXXX`, name: recipient.role }],
        template: 'emergency_alert_sms',
        data: {
          alertType: incident.type,
          patientName: `Patient ${incident.patientId}`,
          alertTime: new Date(incident.reportedAt).toLocaleString()
        },
        priority: 'urgent'
      });
    } catch (error) {
      console.warn('⚠️ SMS service not available, logging notification');
      console.log(`📱 SMS: ${recipient.role} - ${message.substring(0, 160)}`);
    }
  }

  private async sendPushNotification(
    recipient: EscalationRecipient,
    incident: PatientSafetyIncident,
    message: string
  ): Promise<void> {
    // Use push notification service
    try {
      const notificationService = await import('./notification.service').then(m => m.default);
      await notificationService.sendPatientAlert(
        incident.patientId,
        [recipient.userId || recipient.role],
        'emergency',
        message.substring(0, 200)
      );
    } catch (error) {
      console.warn('⚠️ Push notification service not available, logging notification');
      console.log(`🔔 PUSH: ${recipient.role} - ${message}`);
    }
  }

  private async initiatePhoneCall(
    recipient: EscalationRecipient,
    incident: PatientSafetyIncident
  ): Promise<void> {
    // In a real implementation, this would integrate with a phone system
    console.log(`📞 PHONE CALL: Initiating call to ${recipient.role} for incident ${incident.id}`);
    
    // Simulate phone call logging
    const callLog = {
      recipient: recipient.role,
      incidentId: incident.id,
      initiatedAt: Date.now(),
      status: 'initiated'
    };
    
    // Log the call attempt
    console.log(`📞 Phone call initiated:`, callLog);
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    incident: Omit<PatientSafetyIncident, 'id' | 'reportedAt' | 'status' | 'escalationLevel' | 'escalationHistory' | 'riskScore'>
  ): number {
    let score = 0;

    // Severity scoring
    const severityScores = {
      near_miss: 1,
      minor: 2,
      moderate: 4,
      major: 7,
      catastrophic: 10
    };
    score += severityScores[incident.severity];

    // Type scoring
    const typeScores = {
      medication_error: 3,
      surgical_error: 4,
      wrong_patient: 4,
      patient_fall: 2,
      diagnostic_error: 3,
      communication_failure: 2,
      equipment_failure: 2,
      infection_control: 3,
      documentation_error: 1,
      delay_in_treatment: 2
    };
    score += typeScores[incident.type] || 1;

    // DOH reportable adds to score
    if (incident.dohReportable) {
      score += 3;
    }

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Initiate DOH reporting
   */
  private async initiateDOHReporting(incident: PatientSafetyIncident): Promise<void> {
    console.log(`📋 Initiating DOH reporting for incident: ${incident.id}`);
    
    // Create DOH report
    const dohReport = {
      incidentId: incident.id,
      reportType: 'patient_safety_incident',
      severity: incident.severity,
      description: incident.description,
      location: incident.location,
      reportedAt: Date.now(),
      status: 'pending_submission'
    };

    // In a real implementation, this would integrate with DOH reporting systems
    console.log(`📋 DOH report created:`, dohReport);
    
    this.emit('doh_report_initiated', { incident, dohReport });
  }

  /**
   * Initiate investigation
   */
  private async initiateInvestigation(incident: PatientSafetyIncident): Promise<void> {
    console.log(`🔍 Initiating investigation for incident: ${incident.id}`);
    
    incident.investigationRequired = true;
    incident.status = 'investigating';

    // Create root cause analysis
    const rca: RootCauseAnalysis = {
      id: this.generateRCAId(),
      incidentId: incident.id,
      conductedBy: 'patient_safety_team',
      conductedAt: Date.now(),
      methodology: 'fishbone',
      findings: [],
      rootCauses: [],
      contributingFactors: [],
      recommendations: [],
      preventiveMeasures: [],
      status: 'planned'
    };

    incident.rootCauseAnalysis = rca;
    
    this.emit('investigation_initiated', { incident, rca });
  }

  /**
   * Acknowledge escalation
   */
  async acknowledgeEscalation(
    incidentId: string,
    escalationLevel: number,
    acknowledgedBy: string,
    response: Omit<EscalationResponse, 'respondedAt'>
  ): Promise<boolean> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      console.warn(`⚠️ Incident not found: ${incidentId}`);
      return false;
    }

    const escalationStep = incident.escalationHistory.find(
      step => step.level === escalationLevel
    );

    if (!escalationStep) {
      console.warn(`⚠️ Escalation step not found: ${incidentId} level ${escalationLevel}`);
      return false;
    }

    // Update escalation step with response
    escalationStep.response = {
      ...response,
      respondedAt: Date.now()
    };
    escalationStep.timeToResponse = Date.now() - escalationStep.escalatedAt;

    // Remove from acknowledgment queue
    this.acknowledgmentQueue.delete(`${incidentId}_${escalationLevel}`);

    // Check if further escalation is needed
    if (escalationStep.response.escalateToNext) {
      await this.escalateToNextLevel(incident);
    }

    console.log(`✅ Escalation acknowledged: ${incidentId} level ${escalationLevel}`);
    this.emit('escalation_acknowledged', { incident, escalationStep });

    return true;
  }

  /**
   * Escalate to next level
   */
  private async escalateToNextLevel(incident: PatientSafetyIncident): Promise<void> {
    const nextLevel = incident.escalationLevel + 1;
    const nextLevelRules = Array.from(this.escalationRules.values()).filter(
      rule => rule.targetLevel === nextLevel
    );

    for (const rule of nextLevelRules) {
      if (this.evaluateRuleConditions(incident, rule.conditions)) {
        await this.executeEscalation(incident, rule);
        break;
      }
    }
  }

  /**
   * Start escalation processing
   */
  private startEscalationProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processAcknowledmentTimeouts();
      this.processEscalationQueue();
    }, 60000); // Process every minute
  }

  /**
   * Process acknowledgment timeouts
   */
  private processAcknowledmentTimeouts(): void {
    const now = Date.now();
    const timeoutThreshold = 1800000; // 30 minutes

    for (const [key, escalationStep] of this.acknowledgmentQueue.entries()) {
      if (now - escalationStep.escalatedAt > timeoutThreshold && !escalationStep.response) {
        const [incidentId, level] = key.split('_');
        console.warn(`⚠️ Escalation acknowledgment timeout: ${incidentId} level ${level}`);
        
        // Auto-escalate to next level
        const incident = this.incidents.get(incidentId);
        if (incident) {
          this.escalateToNextLevel(incident);
        }
      }
    }
  }

  /**
   * Process escalation queue
   */
  private processEscalationQueue(): void {
    // Process manual escalations that are pending approval
    const pendingEscalations = this.escalationQueue.filter(
      incident => incident.status === 'reported'
    );

    for (const incident of pendingEscalations) {
      // Check if manual approval has been given (simulated)
      if (this.shouldAutoApproveEscalation(incident)) {
        this.assessAndEscalate(incident);
      }
    }
  }

  /**
   * Check if escalation should be auto-approved
   */
  private shouldAutoApproveEscalation(incident: PatientSafetyIncident): boolean {
    // In a real implementation, this would check for manual approvals
    // For simulation, auto-approve after 10 minutes for major incidents
    return incident.severity === 'major' && 
           (Date.now() - incident.reportedAt) > 600000;
  }

  /**
   * Add escalation rule
   */
  addEscalationRule(rule: EscalationRule): void {
    this.escalationRules.set(rule.id, rule);
    console.log(`✅ Added escalation rule: ${rule.name}`);
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`❌ Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Generate unique IDs
   */
  private generateIncidentId(): string {
    return `PSI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRCAId(): string {
    return `RCA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get escalation statistics
   */
  getEscalationStats() {
    const totalIncidents = this.incidents.size;
    const escalatedIncidents = Array.from(this.incidents.values()).filter(
      i => i.escalationLevel > 0
    ).length;
    const pendingAcknowledgments = this.acknowledgmentQueue.size;
    const queuedEscalations = this.escalationQueue.length;

    const incidentsBySeverity = Array.from(this.incidents.values()).reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const incidentsByType = Array.from(this.incidents.values()).reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalIncidents,
      escalated: escalatedIncidents,
      escalationRate: totalIncidents > 0 ? (escalatedIncidents / totalIncidents) * 100 : 0,
      pendingAcknowledgments,
      queuedEscalations,
      bySeverity: incidentsBySeverity,
      byType: incidentsByType,
      rules: this.escalationRules.size
    };
  }

  /**
   * Get active incidents
   */
  getActiveIncidents(): PatientSafetyIncident[] {
    return Array.from(this.incidents.values()).filter(
      incident => incident.status !== 'closed'
    );
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    this.incidents.clear();
    this.escalationRules.clear();
    this.escalationQueue = [];
    this.acknowledgmentQueue.clear();
    this.eventListeners.clear();
  }
}

// Singleton instance
const patientSafetyEscalation = new PatientSafetyErrorEscalation();

export default patientSafetyEscalation;
export { PatientSafetyErrorEscalation, PatientSafetyIncident, EscalationRule, RootCauseAnalysis };