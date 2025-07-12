/**
 * Production Automated Patient Safety Incident Reporting System
 * Real-time incident detection and DOH reporting
 */

interface PatientSafetyIncident {
  id: string;
  patientId: string;
  incidentType: IncidentType;
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  detectionMethod: 'automated' | 'manual' | 'ai_detected';
  detectedAt: number;
  reportedAt: number;
  location: string;
  description: string;
  involvedPersonnel: string[];
  witnesses: string[];
  immediateActions: string[];
  rootCause?: string;
  preventiveMeasures: string[];
  dohReported: boolean;
  dohReportId?: string;
  status: 'detected' | 'investigating' | 'reported' | 'resolved';
  riskScore: number;
  mlConfidence?: number;
}

type IncidentType = 
  | 'medication_error'
  | 'patient_fall'
  | 'wrong_patient_identification'
  | 'surgical_complication'
  | 'healthcare_associated_infection'
  | 'diagnostic_error'
  | 'communication_failure'
  | 'equipment_malfunction'
  | 'documentation_error'
  | 'delay_in_treatment'
  | 'adverse_drug_reaction'
  | 'pressure_ulcer'
  | 'patient_elopement'
  | 'violence_aggression';

interface IncidentDetectionRule {
  id: string;
  name: string;
  type: IncidentType;
  triggers: DetectionTrigger[];
  severity: PatientSafetyIncident['severity'];
  autoReport: boolean;
  mlModel?: string;
  confidence_threshold: number;
}

interface DetectionTrigger {
  dataSource: 'vital_signs' | 'medication' | 'lab_results' | 'clinical_notes' | 'patient_movement' | 'equipment_logs';
  condition: string;
  threshold?: number;
  pattern?: RegExp;
  timeWindow?: number;
}

interface DOHReport {
  id: string;
  incidentId: string;
  reportType: 'mandatory' | 'voluntary';
  submittedAt: number;
  submittedBy: string;
  dohReference: string;
  status: 'pending' | 'submitted' | 'acknowledged' | 'under_review' | 'closed';
  followUpRequired: boolean;
  followUpDeadline?: number;
}

class AutomatedPatientSafetyIncidentReporting {
  private incidents: Map<string, PatientSafetyIncident> = new Map();
  private detectionRules: Map<string, IncidentDetectionRule> = new Map();
  private dohReports: Map<string, DOHReport> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private mlModels: Map<string, any> = new Map();

  constructor() {
    this.initializeDetectionRules();
    this.initializeMLModels();
    this.startRealTimeMonitoring();
  }

  /**
   * Initialize automated detection rules
   */
  private initializeDetectionRules(): void {
    // Medication Error Detection
    this.addDetectionRule({
      id: 'medication_overdose',
      name: 'Medication Overdose Detection',
      type: 'medication_error',
      triggers: [
        {
          dataSource: 'medication',
          condition: 'dosage_exceeded',
          threshold: 1.5 // 150% of prescribed dose
        },
        {
          dataSource: 'vital_signs',
          condition: 'abnormal_response_to_medication',
          timeWindow: 3600000 // 1 hour
        }
      ],
      severity: 'major',
      autoReport: true,
      confidence_threshold: 0.85
    });

    // Patient Fall Detection
    this.addDetectionRule({
      id: 'patient_fall_detection',
      name: 'Patient Fall Detection',
      type: 'patient_fall',
      triggers: [
        {
          dataSource: 'patient_movement',
          condition: 'sudden_position_change',
          pattern: /fall|dropped|collapsed/i
        },
        {
          dataSource: 'vital_signs',
          condition: 'impact_indicators',
          timeWindow: 300000 // 5 minutes
        }
      ],
      severity: 'moderate',
      autoReport: true,
      mlModel: 'fall_detection_v2',
      confidence_threshold: 0.75
    });

    // Healthcare Associated Infection
    this.addDetectionRule({
      id: 'hai_detection',
      name: 'Healthcare Associated Infection Detection',
      type: 'healthcare_associated_infection',
      triggers: [
        {
          dataSource: 'lab_results',
          condition: 'infection_markers_elevated',
          threshold: 2.0 // 2x normal levels
        },
        {
          dataSource: 'vital_signs',
          condition: 'fever_pattern',
          timeWindow: 86400000 // 24 hours
        }
      ],
      severity: 'major',
      autoReport: true,
      confidence_threshold: 0.80
    });

    // Wrong Patient Identification
    this.addDetectionRule({
      id: 'wrong_patient_id',
      name: 'Wrong Patient Identification',
      type: 'wrong_patient_identification',
      triggers: [
        {
          dataSource: 'clinical_notes',
          pattern: /wrong.*patient|incorrect.*id|misidentif/i,
          condition: 'documentation_mismatch'
        }
      ],
      severity: 'catastrophic',
      autoReport: true,
      confidence_threshold: 0.90
    });

    // Diagnostic Error Detection
    this.addDetectionRule({
      id: 'diagnostic_error',
      name: 'Diagnostic Error Detection',
      type: 'diagnostic_error',
      triggers: [
        {
          dataSource: 'lab_results',
          condition: 'contradictory_results',
          timeWindow: 172800000 // 48 hours
        },
        {
          dataSource: 'clinical_notes',
          pattern: /misdiagnos|incorrect.*diagnos|diagnostic.*error/i,
          condition: 'diagnostic_revision'
        }
      ],
      severity: 'major',
      autoReport: true,
      confidence_threshold: 0.70
    });

    console.log(`✅ Initialized ${this.detectionRules.size} incident detection rules`);
  }

  /**
   * Initialize ML models for incident detection
   */
  private initializeMLModels(): void {
    // Simulated ML models - in production these would be actual trained models
    this.mlModels.set('fall_detection_v2', {
      predict: (data: any) => {
        // Simulate fall detection ML model
        const riskFactors = [
          data.age > 65,
          data.mobility_score < 3,
          data.medication_count > 5,
          data.previous_falls > 0,
          data.cognitive_impairment
        ];
        
        const riskScore = riskFactors.filter(Boolean).length / riskFactors.length;
        return {
          probability: riskScore,
          confidence: 0.85,
          risk_factors: riskFactors
        };
      }
    });

    this.mlModels.set('medication_error_v1', {
      predict: (data: any) => {
        // Simulate medication error detection
        const errorIndicators = [
          data.dosage_variance > 0.2,
          data.timing_variance > 30, // minutes
          data.drug_interactions > 0,
          data.allergy_conflicts > 0
        ];
        
        const errorProbability = errorIndicators.filter(Boolean).length / errorIndicators.length;
        return {
          probability: errorProbability,
          confidence: 0.78,
          indicators: errorIndicators
        };
      }
    });

    console.log(`✅ Initialized ${this.mlModels.size} ML models for incident detection`);
  }

  /**
   * Start real-time monitoring for incident detection
   */
  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.scanForIncidents();
      await this.processDetectedIncidents();
      await this.submitPendingDOHReports();
    }, 30000); // Scan every 30 seconds

    console.log('🔍 Real-time incident monitoring started');
  }

  /**
   * Scan for potential incidents using detection rules
   */
  private async scanForIncidents(): Promise<void> {
    try {
      // Get recent data from various sources
      const recentData = await this.gatherRecentData();
      
      for (const [ruleId, rule] of this.detectionRules.entries()) {
        const detectionResult = await this.evaluateDetectionRule(rule, recentData);
        
        if (detectionResult.detected) {
          await this.createIncidentFromDetection(rule, detectionResult);
        }
      }
    } catch (error) {
      console.error('❌ Error scanning for incidents:', error);
    }
  }

  /**
   * Gather recent data from all monitoring sources
   */
  private async gatherRecentData(): Promise<any> {
    // In production, this would gather data from various healthcare systems
    return {
      vital_signs: await this.getRecentVitalSigns(),
      medications: await this.getRecentMedications(),
      lab_results: await this.getRecentLabResults(),
      clinical_notes: await this.getRecentClinicalNotes(),
      patient_movements: await this.getRecentPatientMovements(),
      equipment_logs: await this.getRecentEquipmentLogs()
    };
  }

  /**
   * Evaluate detection rule against recent data
   */
  private async evaluateDetectionRule(
    rule: IncidentDetectionRule, 
    data: any
  ): Promise<{ detected: boolean; confidence: number; evidence: any[] }> {
    const evidence: any[] = [];
    let detectionScore = 0;
    let totalTriggers = rule.triggers.length;

    for (const trigger of rule.triggers) {
      const triggerResult = await this.evaluateTrigger(trigger, data[trigger.dataSource]);
      
      if (triggerResult.triggered) {
        evidence.push(triggerResult);
        detectionScore++;
      }
    }

    const confidence = detectionScore / totalTriggers;
    
    // Use ML model if available
    if (rule.mlModel && this.mlModels.has(rule.mlModel)) {
      const mlModel = this.mlModels.get(rule.mlModel);
      const mlResult = mlModel.predict(data);
      
      if (mlResult.probability > rule.confidence_threshold) {
        return {
          detected: true,
          confidence: mlResult.confidence,
          evidence: [...evidence, { type: 'ml_prediction', result: mlResult }]
        };
      }
    }

    return {
      detected: confidence >= rule.confidence_threshold,
      confidence,
      evidence
    };
  }

  /**
   * Evaluate individual trigger
   */
  private async evaluateTrigger(trigger: DetectionTrigger, sourceData: any[]): Promise<any> {
    if (!sourceData || sourceData.length === 0) {
      return { triggered: false, reason: 'no_data' };
    }

    const recentData = trigger.timeWindow 
      ? sourceData.filter(item => Date.now() - item.timestamp < trigger.timeWindow)
      : sourceData;

    switch (trigger.condition) {
      case 'dosage_exceeded':
        return this.checkDosageExceeded(recentData, trigger.threshold);
      
      case 'abnormal_response_to_medication':
        return this.checkAbnormalMedicationResponse(recentData);
      
      case 'sudden_position_change':
        return this.checkSuddenPositionChange(recentData, trigger.pattern);
      
      case 'infection_markers_elevated':
        return this.checkInfectionMarkers(recentData, trigger.threshold);
      
      case 'fever_pattern':
        return this.checkFeverPattern(recentData);
      
      case 'documentation_mismatch':
        return this.checkDocumentationMismatch(recentData, trigger.pattern);
      
      default:
        return { triggered: false, reason: 'unknown_condition' };
    }
  }

  /**
   * Trigger evaluation methods
   */
  private checkDosageExceeded(data: any[], threshold?: number): any {
    const exceededDoses = data.filter(item => 
      item.actual_dose > (item.prescribed_dose * (threshold || 1.5))
    );
    
    return {
      triggered: exceededDoses.length > 0,
      evidence: exceededDoses,
      severity: exceededDoses.length > 1 ? 'high' : 'medium'
    };
  }

  private checkAbnormalMedicationResponse(data: any[]): any {
    const abnormalResponses = data.filter(item => 
      item.adverse_reaction || 
      item.unexpected_side_effects ||
      item.vital_signs_deviation > 2 // 2 standard deviations
    );
    
    return {
      triggered: abnormalResponses.length > 0,
      evidence: abnormalResponses,
      severity: 'high'
    };
  }

  private checkSuddenPositionChange(data: any[], pattern?: RegExp): any {
    const suddenChanges = data.filter(item => {
      if (pattern && item.notes) {
        return pattern.test(item.notes);
      }
      return item.acceleration_change > 5 || item.position_delta > 1.5;
    });
    
    return {
      triggered: suddenChanges.length > 0,
      evidence: suddenChanges,
      severity: 'medium'
    };
  }

  private checkInfectionMarkers(data: any[], threshold?: number): any {
    const elevatedMarkers = data.filter(item => 
      item.white_blood_count > (item.normal_range_max * (threshold || 2.0)) ||
      item.c_reactive_protein > (item.normal_range_max * (threshold || 2.0))
    );
    
    return {
      triggered: elevatedMarkers.length > 0,
      evidence: elevatedMarkers,
      severity: 'high'
    };
  }

  private checkFeverPattern(data: any[]): any {
    const feverReadings = data.filter(item => item.temperature > 38.0);
    const persistentFever = feverReadings.length >= 3; // 3+ readings in timeframe
    
    return {
      triggered: persistentFever,
      evidence: feverReadings,
      severity: persistentFever ? 'medium' : 'low'
    };
  }

  private checkDocumentationMismatch(data: any[], pattern?: RegExp): any {
    const mismatches = data.filter(item => {
      if (pattern && item.content) {
        return pattern.test(item.content);
      }
      return item.patient_id_mismatch || item.procedure_mismatch;
    });
    
    return {
      triggered: mismatches.length > 0,
      evidence: mismatches,
      severity: 'critical'
    };
  }

  /**
   * Create incident from detection result
   */
  private async createIncidentFromDetection(
    rule: IncidentDetectionRule,
    detectionResult: any
  ): Promise<string> {
    const incident: PatientSafetyIncident = {
      id: this.generateIncidentId(),
      patientId: detectionResult.evidence[0]?.patient_id || 'unknown',
      incidentType: rule.type,
      severity: rule.severity,
      detectionMethod: rule.mlModel ? 'ai_detected' : 'automated',
      detectedAt: Date.now(),
      reportedAt: Date.now(),
      location: detectionResult.evidence[0]?.location || 'unknown',
      description: this.generateIncidentDescription(rule, detectionResult),
      involvedPersonnel: detectionResult.evidence[0]?.staff_involved || [],
      witnesses: [],
      immediateActions: [],
      preventiveMeasures: [],
      dohReported: false,
      status: 'detected',
      riskScore: this.calculateRiskScore(rule, detectionResult),
      mlConfidence: detectionResult.confidence
    };

    this.incidents.set(incident.id, incident);

    // Auto-report to DOH if required
    if (rule.autoReport && this.shouldReportToDOH(incident)) {
      await this.createDOHReport(incident);
    }

    this.emit('incident_detected', incident);
    console.log(`🚨 Incident detected: ${incident.id} (${rule.type})`);
    
    return incident.id;
  }

  /**
   * Generate incident description
   */
  private generateIncidentDescription(rule: IncidentDetectionRule, detectionResult: any): string {
    const evidence = detectionResult.evidence.map((e: any) => e.type || 'detection').join(', ');
    return `Automated detection of ${rule.name.toLowerCase()} based on: ${evidence}. Confidence: ${(detectionResult.confidence * 100).toFixed(1)}%`;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(rule: IncidentDetectionRule, detectionResult: any): number {
    let score = 0;
    
    // Base score from severity
    const severityScores = { minor: 2, moderate: 4, major: 7, catastrophic: 10 };
    score += severityScores[rule.severity];
    
    // Confidence factor
    score *= detectionResult.confidence;
    
    // Evidence strength
    score += detectionResult.evidence.length * 0.5;
    
    return Math.min(Math.round(score), 10);
  }

  /**
   * Check if incident should be reported to DOH
   */
  private shouldReportToDOH(incident: PatientSafetyIncident): boolean {
    // DOH reporting criteria
    return incident.severity === 'catastrophic' || 
           incident.severity === 'major' ||
           incident.incidentType === 'wrong_patient_identification' ||
           incident.incidentType === 'healthcare_associated_infection' ||
           incident.riskScore >= 7;
  }

  /**
   * Create DOH report
   */
  private async createDOHReport(incident: PatientSafetyIncident): Promise<string> {
    const report: DOHReport = {
      id: this.generateDOHReportId(),
      incidentId: incident.id,
      reportType: this.shouldReportToDOH(incident) ? 'mandatory' : 'voluntary',
      submittedAt: Date.now(),
      submittedBy: 'automated_system',
      dohReference: '',
      status: 'pending',
      followUpRequired: incident.severity === 'catastrophic',
      followUpDeadline: incident.severity === 'catastrophic' 
        ? Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        : undefined
    };

    this.dohReports.set(report.id, report);
    incident.dohReported = true;
    incident.dohReportId = report.id;

    console.log(`📋 DOH report created: ${report.id} for incident ${incident.id}`);
    this.emit('doh_report_created', { incident, report });
    
    return report.id;
  }

  /**
   * Submit pending DOH reports
   */
  private async submitPendingDOHReports(): Promise<void> {
    const pendingReports = Array.from(this.dohReports.values())
      .filter(report => report.status === 'pending');

    for (const report of pendingReports) {
      try {
        await this.submitDOHReport(report);
      } catch (error) {
        console.error(`❌ Failed to submit DOH report ${report.id}:`, error);
      }
    }
  }

  /**
   * Submit individual DOH report
   */
  private async submitDOHReport(report: DOHReport): Promise<void> {
    const incident = this.incidents.get(report.incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${report.incidentId}`);
    }

    // Prepare DOH submission data
    const submissionData = {
      incident_id: incident.id,
      incident_type: incident.incidentType,
      severity: incident.severity,
      patient_id: incident.patientId,
      occurrence_date: new Date(incident.detectedAt).toISOString(),
      location: incident.location,
      description: incident.description,
      immediate_actions: incident.immediateActions,
      risk_score: incident.riskScore,
      detection_method: incident.detectionMethod,
      ml_confidence: incident.mlConfidence,
      facility_id: process.env.VITE_FACILITY_ID || 'RHC001',
      facility_name: 'Reyada Homecare Center'
    };

    // Submit to DOH API (simulated)
    const response = await this.callDOHAPI('/api/incidents/report', submissionData);
    
    if (response.success) {
      report.status = 'submitted';
      report.dohReference = response.reference_number;
      
      console.log(`✅ DOH report submitted: ${report.id} (Ref: ${response.reference_number})`);
      this.emit('doh_report_submitted', report);
    } else {
      throw new Error(`DOH submission failed: ${response.error}`);
    }
  }

  /**
   * Simulate DOH API call
   */
  private async callDOHAPI(endpoint: string, data: any): Promise<any> {
    // Simulate API call to DOH system
    console.log(`📡 Calling DOH API: ${endpoint}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful response
    return {
      success: true,
      reference_number: `DOH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      submission_id: `SUB_${Date.now()}`,
      status: 'received',
      acknowledgment_required: data.severity === 'catastrophic'
    };
  }

  /**
   * Data gathering methods (simulated)
   */
  private async getRecentVitalSigns(): Promise<any[]> {
    // Simulate recent vital signs data
    return [
      {
        patient_id: 'P001',
        timestamp: Date.now() - 300000,
        temperature: 39.2,
        blood_pressure: '180/110',
        heart_rate: 120,
        location: 'Room 101'
      },
      {
        patient_id: 'P002',
        timestamp: Date.now() - 600000,
        temperature: 36.8,
        blood_pressure: '120/80',
        heart_rate: 75,
        location: 'Room 102'
      }
    ];
  }

  private async getRecentMedications(): Promise<any[]> {
    return [
      {
        patient_id: 'P001',
        timestamp: Date.now() - 1800000,
        medication: 'Morphine',
        prescribed_dose: 10,
        actual_dose: 15,
        staff_id: 'N001',
        location: 'Room 101'
      }
    ];
  }

  private async getRecentLabResults(): Promise<any[]> {
    return [
      {
        patient_id: 'P003',
        timestamp: Date.now() - 3600000,
        white_blood_count: 15000,
        normal_range_max: 10000,
        c_reactive_protein: 50,
        location: 'Lab'
      }
    ];
  }

  private async getRecentClinicalNotes(): Promise<any[]> {
    return [
      {
        patient_id: 'P004',
        timestamp: Date.now() - 1200000,
        content: 'Patient experienced wrong medication administration',
        author: 'Dr. Smith',
        location: 'Room 104'
      }
    ];
  }

  private async getRecentPatientMovements(): Promise<any[]> {
    return [
      {
        patient_id: 'P005',
        timestamp: Date.now() - 900000,
        acceleration_change: 8.5,
        position_delta: 2.1,
        notes: 'Patient fell while getting up',
        location: 'Room 105'
      }
    ];
  }

  private async getRecentEquipmentLogs(): Promise<any[]> {
    return [
      {
        equipment_id: 'EQ001',
        timestamp: Date.now() - 1800000,
        status: 'malfunction',
        error_code: 'E001',
        location: 'ICU'
      }
    ];
  }

  /**
   * Process detected incidents
   */
  private async processDetectedIncidents(): Promise<void> {
    const unprocessedIncidents = Array.from(this.incidents.values())
      .filter(incident => incident.status === 'detected');

    for (const incident of unprocessedIncidents) {
      await this.processIncident(incident);
    }
  }

  /**
   * Process individual incident
   */
  private async processIncident(incident: PatientSafetyIncident): Promise<void> {
    try {
      // Update status
      incident.status = 'investigating';

      // Trigger immediate actions based on severity
      if (incident.severity === 'catastrophic' || incident.severity === 'major') {
        await this.triggerImmediateResponse(incident);
      }

      // Notify relevant personnel
      await this.notifyPersonnel(incident);

      // Update incident
      this.incidents.set(incident.id, incident);

      console.log(`🔄 Processed incident: ${incident.id}`);
    } catch (error) {
      console.error(`❌ Error processing incident ${incident.id}:`, error);
    }
  }

  /**
   * Trigger immediate response for critical incidents
   */
  private async triggerImmediateResponse(incident: PatientSafetyIncident): Promise<void> {
    const immediateActions = [];

    switch (incident.incidentType) {
      case 'medication_error':
        immediateActions.push('Stop current medication administration');
        immediateActions.push('Assess patient condition');
        immediateActions.push('Contact attending physician');
        break;
      
      case 'patient_fall':
        immediateActions.push('Assess patient for injuries');
        immediateActions.push('Do not move patient until assessed');
        immediateActions.push('Contact physician immediately');
        break;
      
      case 'wrong_patient_identification':
        immediateActions.push('Stop all procedures immediately');
        immediateActions.push('Verify patient identity');
        immediateActions.push('Notify charge nurse and physician');
        break;
    }

    incident.immediateActions = immediateActions;
    console.log(`🚨 Immediate response triggered for incident: ${incident.id}`);
  }

  /**
   * Notify relevant personnel
   */
  private async notifyPersonnel(incident: PatientSafetyIncident): Promise<void> {
    const notifications = [];

    // Determine notification recipients based on incident type and severity
    if (incident.severity === 'catastrophic') {
      notifications.push('chief_medical_officer', 'patient_safety_director', 'medical_director');
    } else if (incident.severity === 'major') {
      notifications.push('patient_safety_officer', 'charge_nurse', 'attending_physician');
    } else {
      notifications.push('charge_nurse', 'unit_supervisor');
    }

    // Send notifications (simulated)
    for (const recipient of notifications) {
      console.log(`📧 Notifying ${recipient} about incident: ${incident.id}`);
    }
  }

  /**
   * Add detection rule
   */
  addDetectionRule(rule: IncidentDetectionRule): void {
    this.detectionRules.set(rule.id, rule);
    console.log(`✅ Added detection rule: ${rule.name}`);
  }

  /**
   * Get incident statistics
   */
  getIncidentStats() {
    const incidents = Array.from(this.incidents.values());
    const dohReports = Array.from(this.dohReports.values());

    return {
      total_incidents: incidents.length,
      by_severity: incidents.reduce((acc, inc) => {
        acc[inc.severity] = (acc[inc.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_type: incidents.reduce((acc, inc) => {
        acc[inc.incidentType] = (acc[inc.incidentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_detection_method: incidents.reduce((acc, inc) => {
        acc[inc.detectionMethod] = (acc[inc.detectionMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      doh_reports: {
        total: dohReports.length,
        submitted: dohReports.filter(r => r.status === 'submitted').length,
        pending: dohReports.filter(r => r.status === 'pending').length
      },
      detection_rules: this.detectionRules.size,
      ml_models: this.mlModels.size
    };
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
    return `INC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDOHReportId(): string {
    return `DOH_RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.incidents.clear();
    this.detectionRules.clear();
    this.dohReports.clear();
    this.eventListeners.clear();
    this.mlModels.clear();
  }
}

// Singleton instance
const patientSafetyReporting = new AutomatedPatientSafetyIncidentReporting();

export default patientSafetyReporting;
export { AutomatedPatientSafetyIncidentReporting, PatientSafetyIncident, IncidentDetectionRule, DOHReport };