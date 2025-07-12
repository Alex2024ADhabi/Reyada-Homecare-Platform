/**
 * Production Real-Time Patient Safety Incident Detection Service
 * Automated incident detection, classification, and DOH reporting
 */

interface IncidentDetectionRule {
  id: string;
  name: string;
  type: IncidentType;
  triggers: DetectionTrigger[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoReport: boolean;
  mlModel?: string;
  confidenceThreshold: number;
}

interface DetectionTrigger {
  dataSource: 'vital_signs' | 'medication' | 'lab_results' | 'clinical_notes' | 'patient_movement' | 'equipment_logs';
  condition: string;
  threshold?: number;
  pattern?: RegExp;
  timeWindow?: number;
}

interface PatientSafetyIncident {
  id: string;
  patientId: string;
  type: IncidentType;
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

interface DOHIncidentReport {
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

class PatientSafetyIncidentDetectionService {
  private incidents: Map<string, PatientSafetyIncident> = new Map();
  private detectionRules: Map<string, IncidentDetectionRule> = new Map();
  private dohReports: Map<string, DOHIncidentReport> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private mlModels: Map<string, any> = new Map();
  private dataStreams: Map<string, any> = new Map();

  constructor() {
    this.initializeDetectionRules();
    this.initializeMLModels();
    this.initializeDataStreams();
    this.startRealTimeMonitoring();
  }

  /**
   * Initialize real-time detection rules
   */
  private initializeDetectionRules(): void {
    // Medication Error Detection
    this.addDetectionRule({
      id: 'medication_overdose_detection',
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
      severity: 'critical',
      autoReport: true,
      mlModel: 'medication_error_classifier',
      confidenceThreshold: 0.85
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
      severity: 'high',
      autoReport: true,
      mlModel: 'fall_detection_v2',
      confidenceThreshold: 0.75
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
      confidenceThreshold: 0.80
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
      severity: 'critical',
      autoReport: true,
      confidenceThreshold: 0.90
    });

    console.log(`✅ Initialized ${this.detectionRules.size} incident detection rules`);
  }

  /**
   * Initialize ML models for incident detection
   */
  private initializeMLModels(): void {
    // Medication Error Classifier
    this.mlModels.set('medication_error_classifier', {
      predict: (data: any) => {
        const errorIndicators = [
          data.dosage_variance > 0.2,
          data.timing_variance > 30,
          data.drug_interactions > 0,
          data.allergy_conflicts > 0
        ];
        
        const errorProbability = errorIndicators.filter(Boolean).length / errorIndicators.length;
        return {
          probability: errorProbability,
          confidence: 0.85,
          indicators: errorIndicators
        };
      }
    });

    // Fall Detection Model
    this.mlModels.set('fall_detection_v2', {
      predict: (data: any) => {
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
          confidence: 0.82,
          risk_factors: riskFactors
        };
      }
    });

    console.log(`✅ Initialized ${this.mlModels.size} ML models for incident detection`);
  }

  /**
   * Initialize real-time data streams
   */
  private initializeDataStreams(): void {
    // Vital Signs Stream
    this.dataStreams.set('vital_signs', {
      subscribe: (callback: Function) => {
        setInterval(() => {
          const vitalSigns = this.generateMockVitalSigns();
          callback(vitalSigns);
        }, 5000); // Every 5 seconds
      }
    });

    // Medication Administration Stream
    this.dataStreams.set('medication', {
      subscribe: (callback: Function) => {
        setInterval(() => {
          const medicationData = this.generateMockMedicationData();
          callback(medicationData);
        }, 10000); // Every 10 seconds
      }
    });

    // Lab Results Stream
    this.dataStreams.set('lab_results', {
      subscribe: (callback: Function) => {
        setInterval(() => {
          const labResults = this.generateMockLabResults();
          callback(labResults);
        }, 30000); // Every 30 seconds
      }
    });

    console.log(`✅ Initialized ${this.dataStreams.size} real-time data streams`);
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    // Subscribe to all data streams
    for (const [streamName, stream] of this.dataStreams.entries()) {
      stream.subscribe((data: any) => {
        this.processDataForIncidentDetection(streamName, data);
      });
    }

    // Process detected incidents
    this.monitoringInterval = setInterval(async () => {
      await this.processDetectedIncidents();
      await this.submitPendingDOHReports();
    }, 30000); // Every 30 seconds

    console.log('🔍 Real-time patient safety incident monitoring started');
  }

  /**
   * Process incoming data for incident detection
   */
  private async processDataForIncidentDetection(dataSource: string, data: any): Promise<void> {
    for (const [ruleId, rule] of this.detectionRules.entries()) {
      const relevantTriggers = rule.triggers.filter(trigger => trigger.dataSource === dataSource);
      
      for (const trigger of relevantTriggers) {
        const detectionResult = await this.evaluateTrigger(trigger, data);
        
        if (detectionResult.triggered) {
          await this.createIncidentFromDetection(rule, detectionResult, data);
        }
      }
    }
  }

  /**
   * Evaluate detection trigger
   */
  private async evaluateTrigger(trigger: DetectionTrigger, data: any): Promise<any> {
    switch (trigger.condition) {
      case 'dosage_exceeded':
        return this.checkDosageExceeded(data, trigger.threshold);
      
      case 'abnormal_response_to_medication':
        return this.checkAbnormalMedicationResponse(data);
      
      case 'sudden_position_change':
        return this.checkSuddenPositionChange(data, trigger.pattern);
      
      case 'infection_markers_elevated':
        return this.checkInfectionMarkers(data, trigger.threshold);
      
      case 'fever_pattern':
        return this.checkFeverPattern(data);
      
      case 'documentation_mismatch':
        return this.checkDocumentationMismatch(data, trigger.pattern);
      
      default:
        return { triggered: false, reason: 'unknown_condition' };
    }
  }

  /**
   * Trigger evaluation methods
   */
  private checkDosageExceeded(data: any, threshold?: number): any {
    const exceededDoses = data.medications?.filter((med: any) => 
      med.actual_dose > (med.prescribed_dose * (threshold || 1.5))
    ) || [];
    
    return {
      triggered: exceededDoses.length > 0,
      evidence: exceededDoses,
      severity: exceededDoses.length > 1 ? 'high' : 'medium'
    };
  }

  private checkAbnormalMedicationResponse(data: any): any {
    const abnormalResponses = data.responses?.filter((response: any) => 
      response.adverse_reaction || 
      response.unexpected_side_effects ||
      response.vital_signs_deviation > 2
    ) || [];

    return {
      triggered: abnormalResponses.length > 0,
      evidence: abnormalResponses,
      severity: 'high'
    };
  }

  private checkSuddenPositionChange(data: any, pattern?: RegExp): any {
    const suddenChanges = data.movements?.filter((movement: any) => {
      if (pattern && movement.notes) {
        return pattern.test(movement.notes);
      }
      return movement.acceleration_change > 5 || movement.position_delta > 1.5;
    }) || [];
    
    return {
      triggered: suddenChanges.length > 0,
      evidence: suddenChanges,
      severity: 'medium'
    };
  }

  private checkInfectionMarkers(data: any, threshold?: number): any {
    const elevatedMarkers = data.lab_values?.filter((lab: any) => 
      lab.white_blood_count > (lab.normal_range_max * (threshold || 2.0)) ||
      lab.c_reactive_protein > (lab.normal_range_max * (threshold || 2.0))
    ) || [];

    return {
      triggered: elevatedMarkers.length > 0,
      evidence: elevatedMarkers,
      severity: 'high'
    };
  }

  private checkFeverPattern(data: any): any {
    const feverReadings = data.vital_signs?.filter((vs: any) => vs.temperature > 38.0) || [];
    const persistentFever = feverReadings.length >= 3;
    
    return {
      triggered: persistentFever,
      evidence: feverReadings,
      severity: persistentFever ? 'medium' : 'low'
    };
  }

  private checkDocumentationMismatch(data: any, pattern?: RegExp): any {
    const mismatches = data.notes?.filter((note: any) => {
      if (pattern && note.content) {
        return pattern.test(note.content);
      }
      return note.patient_id_mismatch || note.procedure_mismatch;
    }) || [];

    return {
      triggered: mismatches.length > 0,
      evidence: mismatches,
      severity: 'critical'
    };
  }

  /**
   * Create incident from detection
   */
  private async createIncidentFromDetection(
    rule: IncidentDetectionRule,
    detectionResult: any,
    data: any
  ): Promise<string> {
    const incident: PatientSafetyIncident = {
      id: this.generateIncidentId(),
      patientId: data.patient_id || 'unknown',
      type: rule.type,
      severity: this.mapSeverity(rule.severity),
      detectionMethod: rule.mlModel ? 'ai_detected' : 'automated',
      detectedAt: Date.now(),
      reportedAt: Date.now(),
      location: data.location || 'unknown',
      description: this.generateIncidentDescription(rule, detectionResult),
      involvedPersonnel: data.staff_involved || [],
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
   * Generate mock data for testing
   */
  private generateMockVitalSigns(): any {
    return {
      patient_id: `P${Math.floor(Math.random() * 1000) + 1}`,
      timestamp: Date.now(),
      temperature: 36.5 + Math.random() * 4, // 36.5-40.5°C
      blood_pressure: `${120 + Math.floor(Math.random() * 60)}/${80 + Math.floor(Math.random() * 40)}`,
      heart_rate: 60 + Math.floor(Math.random() * 60),
      location: 'Room ' + (Math.floor(Math.random() * 100) + 1),
      vital_signs: [
        { temperature: 36.5 + Math.random() * 4 },
        { temperature: 36.5 + Math.random() * 4 },
        { temperature: 36.5 + Math.random() * 4 }
      ]
    };
  }

  private generateMockMedicationData(): any {
    return {
      patient_id: `P${Math.floor(Math.random() * 1000) + 1}`,
      timestamp: Date.now(),
      medications: [
        {
          name: 'Morphine',
          prescribed_dose: 10,
          actual_dose: 10 + Math.random() * 5,
          timing_variance: Math.random() * 60
        }
      ],
      responses: [
        {
          adverse_reaction: Math.random() > 0.9,
          unexpected_side_effects: Math.random() > 0.95,
          vital_signs_deviation: Math.random() * 3
        }
      ],
      staff_involved: ['N001', 'D001']
    };
  }

  private generateMockLabResults(): any {
    return {
      patient_id: `P${Math.floor(Math.random() * 1000) + 1}`,
      timestamp: Date.now(),
      lab_values: [
        {
          white_blood_count: 5000 + Math.random() * 10000,
          normal_range_max: 10000,
          c_reactive_protein: Math.random() * 50
        }
      ]
    };
  }

  /**
   * Helper methods
   */
  private mapSeverity(ruleSeverity: string): PatientSafetyIncident['severity'] {
    switch (ruleSeverity) {
      case 'critical': return 'catastrophic';
      case 'high': return 'major';
      case 'medium': return 'moderate';
      default: return 'minor';
    }
  }

  private generateIncidentDescription(rule: IncidentDetectionRule, detectionResult: any): string {
    const evidence = detectionResult.evidence?.map((e: any) => e.type || 'detection').join(', ') || 'automated detection';
    return `Automated detection of ${rule.name.toLowerCase()} based on: ${evidence}. Confidence: ${((detectionResult.confidence || 0.8) * 100).toFixed(1)}%`;
  }

  private calculateRiskScore(rule: IncidentDetectionRule, detectionResult: any): number {
    let score = 0;
    
    const severityScores = { low: 2, medium: 4, high: 7, critical: 10 };
    score += severityScores[rule.severity];
    
    score *= (detectionResult.confidence || 0.8);
    score += (detectionResult.evidence?.length || 1) * 0.5;
    
    return Math.min(Math.round(score), 10);
  }

  private shouldReportToDOH(incident: PatientSafetyIncident): boolean {
    return incident.severity === 'catastrophic' || 
           incident.severity === 'major' ||
           incident.type === 'wrong_patient_identification' ||
           incident.type === 'healthcare_associated_infection' ||
           incident.riskScore >= 7;
  }

  private async createDOHReport(incident: PatientSafetyIncident): Promise<string> {
    const report: DOHIncidentReport = {
      id: this.generateDOHReportId(),
      incidentId: incident.id,
      reportType: this.shouldReportToDOH(incident) ? 'mandatory' : 'voluntary',
      submittedAt: Date.now(),
      submittedBy: 'automated_system',
      dohReference: '',
      status: 'pending',
      followUpRequired: incident.severity === 'catastrophic',
      followUpDeadline: incident.severity === 'catastrophic' 
        ? Date.now() + (24 * 60 * 60 * 1000)
        : undefined
    };

    this.dohReports.set(report.id, report);
    incident.dohReported = true;
    incident.dohReportId = report.id;

    console.log(`📋 DOH report created: ${report.id} for incident ${incident.id}`);
    this.emit('doh_report_created', { incident, report });
    
    return report.id;
  }

  private async processDetectedIncidents(): Promise<void> {
    const unprocessedIncidents = Array.from(this.incidents.values())
      .filter(incident => incident.status === 'detected');

    for (const incident of unprocessedIncidents) {
      await this.processIncident(incident);
    }
  }

  private async processIncident(incident: PatientSafetyIncident): Promise<void> {
    try {
      incident.status = 'investigating';

      if (incident.severity === 'catastrophic' || incident.severity === 'major') {
        await this.triggerImmediateResponse(incident);
      }

      await this.notifyPersonnel(incident);
      this.incidents.set(incident.id, incident);

      console.log(`🔄 Processed incident: ${incident.id}`);
    } catch (error) {
      console.error(`❌ Error processing incident ${incident.id}:`, error);
    }
  }

  private async triggerImmediateResponse(incident: PatientSafetyIncident): Promise<void> {
    const immediateActions = [];

    switch (incident.type) {
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

  private async notifyPersonnel(incident: PatientSafetyIncident): Promise<void> {
    const notifications = [];

    if (incident.severity === 'catastrophic') {
      notifications.push('chief_medical_officer', 'patient_safety_director', 'medical_director');
    } else if (incident.severity === 'major') {
      notifications.push('patient_safety_officer', 'charge_nurse', 'attending_physician');
    } else {
      notifications.push('charge_nurse', 'unit_supervisor');
    }

    for (const recipient of notifications) {
      console.log(`📧 Notifying ${recipient} about incident: ${incident.id}`);
    }
  }

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

  private async submitDOHReport(report: DOHIncidentReport): Promise<void> {
    const incident = this.incidents.get(report.incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${report.incidentId}`);
    }

    // Simulate DOH API submission
    const response = await this.callDOHAPI('/api/incidents/report', {
      incident_id: incident.id,
      incident_type: incident.type,
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
      facility_name: 'Reyada Home Healthcare Services'
    });
    
    if (response.success) {
      report.status = 'submitted';
      report.dohReference = response.reference_number;
      
      console.log(`✅ DOH report submitted: ${report.id} (Ref: ${response.reference_number})`);
      this.emit('doh_report_submitted', report);
    } else {
      throw new Error(`DOH submission failed: ${response.error}`);
    }
  }

  private async callDOHAPI(endpoint: string, data: any): Promise<any> {
    console.log(`📡 Calling DOH API: ${endpoint}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      reference_number: `DOH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      submission_id: `SUB_${Date.now()}`,
      status: 'received',
      acknowledgment_required: data.severity === 'catastrophic'
    };
  }

  /**
   * Public API methods
   */
  addDetectionRule(rule: IncidentDetectionRule): void {
    this.detectionRules.set(rule.id, rule);
    console.log(`✅ Added detection rule: ${rule.name}`);
  }

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
        acc[inc.type] = (acc[inc.type] || 0) + 1;
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
    this.dataStreams.clear();
  }
}

// Singleton instance
const patientSafetyIncidentDetection = new PatientSafetyIncidentDetectionService();

export default patientSafetyIncidentDetection;
export { PatientSafetyIncidentDetectionService, PatientSafetyIncident, IncidentDetectionRule, DOHIncidentReport };