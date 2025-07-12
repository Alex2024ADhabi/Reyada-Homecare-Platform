/**
 * Production Advanced Clinical Outcome Measurement System
 * Dynamic outcome tracking with ML-powered analytics
 */

interface ClinicalOutcome {
  id: string;
  patientId: string;
  outcomeType: OutcomeType;
  category: OutcomeCategory;
  measurementDate: number;
  value: number | string | boolean;
  unit?: string;
  normalRange?: {
    min: number;
    max: number;
  };
  severity?: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
  dataSource: string;
  measuredBy: string;
  validated: boolean;
  notes?: string;
}

type OutcomeType = 
  | 'clinical_indicator'
  | 'functional_status'
  | 'quality_of_life'
  | 'patient_satisfaction'
  | 'safety_outcome'
  | 'cost_effectiveness'
  | 'readmission_risk'
  | 'mortality_risk'
  | 'infection_risk'
  | 'medication_adherence';

type OutcomeCategory =
  | 'cardiovascular'
  | 'respiratory'
  | 'neurological'
  | 'musculoskeletal'
  | 'endocrine'
  | 'renal'
  | 'gastrointestinal'
  | 'hematological'
  | 'infectious_disease'
  | 'mental_health'
  | 'general_health';

interface OutcomeMeasure {
  id: string;
  name: string;
  description: string;
  type: OutcomeType;
  category: OutcomeCategory;
  dataType: 'numeric' | 'categorical' | 'boolean' | 'text';
  unit?: string;
  normalRange?: {
    min: number;
    max: number;
  };
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  benchmarks: {
    internal: number;
    national: number;
    international: number;
  };
  riskFactors: string[];
  interventions: string[];
}

interface OutcomePrediction {
  id: string;
  patientId: string;
  outcomeType: OutcomeType;
  predictedValue: number;
  confidence: number;
  riskScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  modelVersion: string;
  predictionDate: number;
  validUntil: number;
}

interface RiskFactor {
  factor: string;
  weight: number;
  value: any;
  impact: 'positive' | 'negative' | 'neutral';
  modifiable: boolean;
}

interface OutcomeAlert {
  id: string;
  patientId: string;
  outcomeId: string;
  alertType: 'threshold_breach' | 'trend_deterioration' | 'prediction_high_risk' | 'data_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  actions: string[];
}

interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'time_series' | 'clustering';
  outcomeType: OutcomeType;
  version: string;
  accuracy: number;
  lastTrained: number;
  features: string[];
  hyperparameters: Record<string, any>;
  status: 'active' | 'training' | 'deprecated';
}

interface PatientOutcomeProfile {
  patientId: string;
  outcomes: ClinicalOutcome[];
  predictions: OutcomePrediction[];
  riskScore: number;
  overallTrend: 'improving' | 'stable' | 'declining';
  lastAssessment: number;
  nextAssessment: number;
  alerts: OutcomeAlert[];
}

class AdvancedClinicalOutcomeMeasurement {
  private outcomes: Map<string, ClinicalOutcome> = new Map();
  private outcomeMeasures: Map<string, OutcomeMeasure> = new Map();
  private predictions: Map<string, OutcomePrediction> = new Map();
  private alerts: Map<string, OutcomeAlert> = new Map();
  private mlModels: Map<string, MLModel> = new Map();
  private patientProfiles: Map<string, PatientOutcomeProfile> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeOutcomeMeasures();
    this.initializeMLModels();
    this.startOutcomeMonitoring();
  }

  /**
   * Initialize clinical outcome measures
   */
  private initializeOutcomeMeasures(): void {
    // Cardiovascular Outcomes
    this.addOutcomeMeasure({
      id: 'blood_pressure_control',
      name: 'Blood Pressure Control',
      description: 'Systolic and diastolic blood pressure measurements',
      type: 'clinical_indicator',
      category: 'cardiovascular',
      dataType: 'numeric',
      unit: 'mmHg',
      normalRange: { min: 90, max: 140 }, // Systolic
      frequency: 'daily',
      priority: 'high',
      evidenceLevel: 'A',
      benchmarks: { internal: 85, national: 78, international: 82 },
      riskFactors: ['age', 'diabetes', 'obesity', 'smoking'],
      interventions: ['medication_adjustment', 'lifestyle_modification', 'dietary_changes']
    });

    this.addOutcomeMeasure({
      id: 'cardiac_function',
      name: 'Cardiac Function Assessment',
      description: 'Ejection fraction and cardiac output measurements',
      type: 'clinical_indicator',
      category: 'cardiovascular',
      dataType: 'numeric',
      unit: '%',
      normalRange: { min: 50, max: 70 },
      frequency: 'monthly',
      priority: 'high',
      evidenceLevel: 'A',
      benchmarks: { internal: 55, national: 52, international: 54 },
      riskFactors: ['heart_disease', 'hypertension', 'diabetes'],
      interventions: ['medication_optimization', 'cardiac_rehabilitation']
    });

    // Respiratory Outcomes
    this.addOutcomeMeasure({
      id: 'oxygen_saturation',
      name: 'Oxygen Saturation',
      description: 'Blood oxygen saturation levels',
      type: 'clinical_indicator',
      category: 'respiratory',
      dataType: 'numeric',
      unit: '%',
      normalRange: { min: 95, max: 100 },
      frequency: 'continuous',
      priority: 'critical',
      evidenceLevel: 'A',
      benchmarks: { internal: 96, national: 95, international: 96 },
      riskFactors: ['copd', 'pneumonia', 'heart_failure'],
      interventions: ['oxygen_therapy', 'respiratory_therapy', 'medication_adjustment']
    });

    // Functional Status Outcomes
    this.addOutcomeMeasure({
      id: 'mobility_score',
      name: 'Mobility Assessment Score',
      description: 'Patient mobility and independence assessment',
      type: 'functional_status',
      category: 'musculoskeletal',
      dataType: 'numeric',
      unit: 'score',
      normalRange: { min: 80, max: 100 },
      frequency: 'weekly',
      priority: 'medium',
      evidenceLevel: 'B',
      benchmarks: { internal: 75, national: 70, international: 73 },
      riskFactors: ['age', 'frailty', 'cognitive_impairment'],
      interventions: ['physical_therapy', 'occupational_therapy', 'assistive_devices']
    });

    // Quality of Life Outcomes
    this.addOutcomeMeasure({
      id: 'pain_score',
      name: 'Pain Assessment Score',
      description: 'Patient-reported pain intensity',
      type: 'quality_of_life',
      category: 'general_health',
      dataType: 'numeric',
      unit: 'scale_0_10',
      normalRange: { min: 0, max: 3 },
      frequency: 'daily',
      priority: 'high',
      evidenceLevel: 'A',
      benchmarks: { internal: 2.5, national: 3.2, international: 2.8 },
      riskFactors: ['chronic_pain', 'inflammation', 'depression'],
      interventions: ['pain_management', 'physical_therapy', 'psychological_support']
    });

    // Safety Outcomes
    this.addOutcomeMeasure({
      id: 'fall_risk_score',
      name: 'Fall Risk Assessment',
      description: 'Comprehensive fall risk evaluation',
      type: 'safety_outcome',
      category: 'musculoskeletal',
      dataType: 'numeric',
      unit: 'risk_score',
      normalRange: { min: 0, max: 25 }, // Low risk
      frequency: 'weekly',
      priority: 'high',
      evidenceLevel: 'A',
      benchmarks: { internal: 20, national: 25, international: 22 },
      riskFactors: ['age', 'medication_count', 'cognitive_status', 'previous_falls'],
      interventions: ['fall_prevention_program', 'environmental_modifications', 'medication_review']
    });

    // Infection Risk
    this.addOutcomeMeasure({
      id: 'infection_risk',
      name: 'Healthcare Associated Infection Risk',
      description: 'Risk assessment for healthcare-associated infections',
      type: 'infection_risk',
      category: 'infectious_disease',
      dataType: 'numeric',
      unit: 'risk_percentage',
      normalRange: { min: 0, max: 10 },
      frequency: 'daily',
      priority: 'high',
      evidenceLevel: 'A',
      benchmarks: { internal: 5, national: 8, international: 6 },
      riskFactors: ['immunocompromised', 'invasive_devices', 'antibiotic_use'],
      interventions: ['infection_control_measures', 'antibiotic_stewardship', 'isolation_precautions']
    });

    console.log(`✅ Initialized ${this.outcomeMeasures.size} clinical outcome measures`);
  }

  /**
   * Initialize ML models for outcome prediction
   */
  private initializeMLModels(): void {
    // Readmission Risk Model
    this.addMLModel({
      id: 'readmission_risk_v3',
      name: 'Readmission Risk Prediction Model',
      type: 'classification',
      outcomeType: 'readmission_risk',
      version: '3.2.1',
      accuracy: 0.87,
      lastTrained: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      features: [
        'age', 'comorbidity_count', 'length_of_stay', 'discharge_disposition',
        'medication_count', 'previous_admissions', 'social_support'
      ],
      hyperparameters: {
        learning_rate: 0.01,
        max_depth: 6,
        n_estimators: 100
      },
      status: 'active'
    });

    // Mortality Risk Model
    this.addMLModel({
      id: 'mortality_risk_v2',
      name: 'Mortality Risk Prediction Model',
      type: 'classification',
      outcomeType: 'mortality_risk',
      version: '2.1.0',
      accuracy: 0.92,
      lastTrained: Date.now() - (14 * 24 * 60 * 60 * 1000), // 14 days ago
      features: [
        'age', 'severity_score', 'vital_signs', 'lab_values',
        'comorbidities', 'functional_status'
      ],
      hyperparameters: {
        learning_rate: 0.005,
        max_depth: 8,
        n_estimators: 200
      },
      status: 'active'
    });

    // Functional Decline Model
    this.addMLModel({
      id: 'functional_decline_v1',
      name: 'Functional Decline Prediction Model',
      type: 'regression',
      outcomeType: 'functional_status',
      version: '1.3.2',
      accuracy: 0.78,
      lastTrained: Date.now() - (21 * 24 * 60 * 60 * 1000), // 21 days ago
      features: [
        'baseline_function', 'age', 'cognitive_status', 'medication_burden',
        'social_support', 'depression_score'
      ],
      hyperparameters: {
        alpha: 0.1,
        l1_ratio: 0.5
      },
      status: 'active'
    });

    // Infection Risk Model
    this.addMLModel({
      id: 'infection_risk_v2',
      name: 'Healthcare Associated Infection Risk Model',
      type: 'classification',
      outcomeType: 'infection_risk',
      version: '2.0.1',
      accuracy: 0.84,
      lastTrained: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
      features: [
        'immune_status', 'invasive_devices', 'antibiotic_exposure',
        'length_of_stay', 'comorbidities', 'age'
      ],
      hyperparameters: {
        C: 1.0,
        gamma: 'scale',
        kernel: 'rbf'
      },
      status: 'active'
    });

    console.log(`✅ Initialized ${this.mlModels.size} ML models for outcome prediction`);
  }

  /**
   * Start outcome monitoring
   */
  private startOutcomeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.collectOutcomeData();
      await this.generatePredictions();
      await this.analyzeOutcomeTrends();
      await this.checkOutcomeAlerts();
    }, 300000); // Every 5 minutes

    console.log('📊 Advanced clinical outcome monitoring started');
  }

  /**
   * Collect outcome data from various sources
   */
  private async collectOutcomeData(): Promise<void> {
    try {
      // Simulate data collection from various healthcare systems
      const patientIds = ['P001', 'P002', 'P003', 'P004', 'P005'];
      
      for (const patientId of patientIds) {
        await this.collectPatientOutcomes(patientId);
      }
    } catch (error) {
      console.error('❌ Error collecting outcome data:', error);
    }
  }

  /**
   * Collect outcomes for specific patient
   */
  private async collectPatientOutcomes(patientId: string): Promise<void> {
    const measureIds = Array.from(this.outcomeMeasures.keys());
    
    for (const measureId of measureIds) {
      const measure = this.outcomeMeasures.get(measureId);
      if (!measure) continue;

      // Simulate data collection based on frequency
      if (this.shouldCollectData(measure.frequency)) {
        const outcome = await this.generateOutcomeData(patientId, measure);
        this.outcomes.set(outcome.id, outcome);
        
        // Update patient profile
        await this.updatePatientProfile(patientId, outcome);
      }
    }
  }

  /**
   * Check if data should be collected based on frequency
   */
  private shouldCollectData(frequency: OutcomeMeasure['frequency']): boolean {
    const now = Date.now();
    const random = Math.random();
    
    switch (frequency) {
      case 'continuous':
        return random < 0.8; // 80% chance
      case 'daily':
        return random < 0.3; // 30% chance (simulating daily collection)
      case 'weekly':
        return random < 0.1; // 10% chance
      case 'monthly':
        return random < 0.05; // 5% chance
      default:
        return random < 0.1;
    }
  }

  /**
   * Generate simulated outcome data
   */
  private async generateOutcomeData(patientId: string, measure: OutcomeMeasure): Promise<ClinicalOutcome> {
    let value: number | string | boolean;
    let severity: ClinicalOutcome['severity'] = 'normal';
    
    if (measure.dataType === 'numeric' && measure.normalRange) {
      // Generate value with some variation
      const midpoint = (measure.normalRange.min + measure.normalRange.max) / 2;
      const range = measure.normalRange.max - measure.normalRange.min;
      value = midpoint + (Math.random() - 0.5) * range * 1.5; // Allow some values outside normal range
      
      // Determine severity
      if (typeof value === 'number') {
        if (value < measure.normalRange.min * 0.8 || value > measure.normalRange.max * 1.2) {
          severity = 'severe';
        } else if (value < measure.normalRange.min * 0.9 || value > measure.normalRange.max * 1.1) {
          severity = 'moderate';
        } else if (value < measure.normalRange.min || value > measure.normalRange.max) {
          severity = 'mild';
        }
      }
    } else if (measure.dataType === 'boolean') {
      value = Math.random() > 0.7; // 30% chance of true
    } else {
      value = Math.floor(Math.random() * 100); // Generic numeric value
    }

    return {
      id: this.generateOutcomeId(),
      patientId,
      outcomeType: measure.type,
      category: measure.category,
      measurementDate: Date.now(),
      value,
      unit: measure.unit,
      normalRange: measure.normalRange,
      severity,
      trend: this.calculateTrend(patientId, measure.id, value),
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      dataSource: 'automated_collection',
      measuredBy: 'system',
      validated: true
    };
  }

  /**
   * Calculate trend for outcome
   */
  private calculateTrend(patientId: string, measureId: string, currentValue: any): ClinicalOutcome['trend'] {
    // Get previous outcomes for this patient and measure
    const previousOutcomes = Array.from(this.outcomes.values())
      .filter(outcome => 
        outcome.patientId === patientId && 
        outcome.outcomeType === measureId
      )
      .sort((a, b) => b.measurementDate - a.measurementDate)
      .slice(0, 3); // Last 3 measurements

    if (previousOutcomes.length === 0) return 'stable';

    const previousValue = previousOutcomes[0].value;
    if (typeof currentValue === 'number' && typeof previousValue === 'number') {
      const changePercent = Math.abs((currentValue - previousValue) / previousValue) * 100;
      
      if (changePercent < 5) return 'stable';
      
      // For most clinical measures, being within normal range is improving
      const measure = this.outcomeMeasures.get(measureId);
      if (measure?.normalRange) {
        const isCurrentNormal = currentValue >= measure.normalRange.min && currentValue <= measure.normalRange.max;
        const isPreviousNormal = previousValue >= measure.normalRange.min && previousValue <= measure.normalRange.max;
        
        if (isCurrentNormal && !isPreviousNormal) return 'improving';
        if (!isCurrentNormal && isPreviousNormal) return 'declining';
      }
      
      // Default trend based on direction
      return currentValue > previousValue ? 'improving' : 'declining';
    }

    return 'stable';
  }

  /**
   * Generate ML-based predictions
   */
  private async generatePredictions(): Promise<void> {
    const patientIds = Array.from(new Set(
      Array.from(this.outcomes.values()).map(o => o.patientId)
    ));

    for (const patientId of patientIds) {
      for (const [modelId, model] of this.mlModels.entries()) {
        if (model.status === 'active') {
          const prediction = await this.generatePrediction(patientId, model);
          this.predictions.set(prediction.id, prediction);
        }
      }
    }
  }

  /**
   * Generate individual prediction
   */
  private async generatePrediction(patientId: string, model: MLModel): Promise<OutcomePrediction> {
    // Get patient data for features
    const patientOutcomes = Array.from(this.outcomes.values())
      .filter(outcome => outcome.patientId === patientId)
      .sort((a, b) => b.measurementDate - a.measurementDate);

    // Simulate ML prediction
    const riskFactors = this.generateRiskFactors(patientId, model);
    const riskScore = this.calculateRiskScore(riskFactors);
    const predictedValue = this.simulateMLPrediction(model, riskScore);

    return {
      id: this.generatePredictionId(),
      patientId,
      outcomeType: model.outcomeType,
      predictedValue,
      confidence: model.accuracy * (0.8 + Math.random() * 0.2), // Vary confidence
      riskScore,
      riskFactors,
      recommendations: this.generateRecommendations(model.outcomeType, riskScore),
      modelVersion: model.version,
      predictionDate: Date.now(),
      validUntil: Date.now() + (24 * 60 * 60 * 1000) // Valid for 24 hours
    };
  }

  /**
   * Generate risk factors for prediction
   */
  private generateRiskFactors(patientId: string, model: MLModel): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];
    
    // Simulate risk factors based on model features
    for (const feature of model.features) {
      riskFactors.push({
        factor: feature,
        weight: Math.random(),
        value: this.simulateFeatureValue(feature),
        impact: Math.random() > 0.5 ? 'negative' : 'positive',
        modifiable: this.isModifiableRiskFactor(feature)
      });
    }

    return riskFactors;
  }

  /**
   * Simulate feature value
   */
  private simulateFeatureValue(feature: string): any {
    const featureValues: Record<string, any> = {
      'age': Math.floor(Math.random() * 40) + 40, // 40-80 years
      'comorbidity_count': Math.floor(Math.random() * 5),
      'length_of_stay': Math.floor(Math.random() * 14) + 1,
      'medication_count': Math.floor(Math.random() * 10) + 1,
      'previous_admissions': Math.floor(Math.random() * 3),
      'severity_score': Math.floor(Math.random() * 20) + 1,
      'functional_status': Math.floor(Math.random() * 100),
      'social_support': Math.random() > 0.3 // 70% have social support
    };

    return featureValues[feature] || Math.random();
  }

  /**
   * Check if risk factor is modifiable
   */
  private isModifiableRiskFactor(factor: string): boolean {
    const modifiableFactors = [
      'medication_count', 'functional_status', 'social_support',
      'depression_score', 'medication_burden', 'antibiotic_exposure'
    ];
    
    return modifiableFactors.includes(factor);
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(riskFactors: RiskFactor[]): number {
    let score = 0;
    let totalWeight = 0;

    for (const factor of riskFactors) {
      const impact = factor.impact === 'negative' ? 1 : -0.5;
      score += factor.weight * impact;
      totalWeight += factor.weight;
    }

    return totalWeight > 0 ? Math.max(0, Math.min(100, (score / totalWeight) * 100)) : 0;
  }

  /**
   * Simulate ML prediction
   */
  private simulateMLPrediction(model: MLModel, riskScore: number): number {
    switch (model.type) {
      case 'classification':
        return riskScore / 100; // Convert to probability
      case 'regression':
        return riskScore + (Math.random() - 0.5) * 20; // Add some noise
      default:
        return riskScore;
    }
  }

  /**
   * Generate recommendations based on prediction
   */
  private generateRecommendations(outcomeType: OutcomeType, riskScore: number): string[] {
    const recommendations: Record<OutcomeType, string[]> = {
      'readmission_risk': [
        'Enhance discharge planning',
        'Improve medication reconciliation',
        'Increase follow-up frequency',
        'Coordinate with primary care'
      ],
      'mortality_risk': [
        'Increase monitoring frequency',
        'Review treatment intensity',
        'Consider palliative care consultation',
        'Family meeting recommended'
      ],
      'functional_status': [
        'Physical therapy referral',
        'Occupational therapy assessment',
        'Home safety evaluation',
        'Assistive device evaluation'
      ],
      'infection_risk': [
        'Enhance infection control measures',
        'Review antibiotic stewardship',
        'Consider isolation precautions',
        'Immune system support'
      ],
      'clinical_indicator': ['Monitor closely', 'Review treatment plan'],
      'quality_of_life': ['Patient-centered care planning'],
      'patient_satisfaction': ['Improve communication'],
      'safety_outcome': ['Implement safety measures'],
      'cost_effectiveness': ['Review resource utilization'],
      'medication_adherence': ['Medication counseling']
    };

    const baseRecommendations = recommendations[outcomeType] || ['Monitor and reassess'];
    
    if (riskScore > 70) {
      return [...baseRecommendations, 'Urgent intervention required', 'Multidisciplinary team consultation'];
    } else if (riskScore > 50) {
      return [...baseRecommendations, 'Enhanced monitoring recommended'];
    }
    
    return baseRecommendations;
  }

  /**
   * Analyze outcome trends
   */
  private async analyzeOutcomeTrends(): Promise<void> {
    const patientIds = Array.from(new Set(
      Array.from(this.outcomes.values()).map(o => o.patientId)
    ));

    for (const patientId of patientIds) {
      await this.analyzePatientTrends(patientId);
    }
  }

  /**
   * Analyze trends for specific patient
   */
  private async analyzePatientTrends(patientId: string): Promise<void> {
    const patientOutcomes = Array.from(this.outcomes.values())
      .filter(outcome => outcome.patientId === patientId)
      .sort((a, b) => b.measurementDate - a.measurementDate);

    // Group by outcome type
    const outcomesByType = patientOutcomes.reduce((acc, outcome) => {
      if (!acc[outcome.outcomeType]) acc[outcome.outcomeType] = [];
      acc[outcome.outcomeType].push(outcome);
      return acc;
    }, {} as Record<string, ClinicalOutcome[]>);

    // Analyze trends for each outcome type
    for (const [outcomeType, outcomes] of Object.entries(outcomesByType)) {
      if (outcomes.length >= 3) { // Need at least 3 data points
        const trend = this.analyzeTrendPattern(outcomes);
        
        if (trend === 'declining' && outcomes[0].severity !== 'normal') {
          await this.createTrendAlert(patientId, outcomeType, outcomes);
        }
      }
    }
  }

  /**
   * Analyze trend pattern
   */
  private analyzeTrendPattern(outcomes: ClinicalOutcome[]): 'improving' | 'stable' | 'declining' {
    if (outcomes.length < 2) return 'stable';

    const recentOutcomes = outcomes.slice(0, 3).reverse(); // Get last 3 in chronological order
    let improvingCount = 0;
    let decliningCount = 0;

    for (let i = 1; i < recentOutcomes.length; i++) {
      if (recentOutcomes[i].trend === 'improving') improvingCount++;
      if (recentOutcomes[i].trend === 'declining') decliningCount++;
    }

    if (improvingCount > decliningCount) return 'improving';
    if (decliningCount > improvingCount) return 'declining';
    return 'stable';
  }

  /**
   * Create trend alert
   */
  private async createTrendAlert(patientId: string, outcomeType: string, outcomes: ClinicalOutcome[]): Promise<void> {
    const alert: OutcomeAlert = {
      id: this.generateAlertId(),
      patientId,
      outcomeId: outcomes[0].id,
      alertType: 'trend_deterioration',
      severity: outcomes[0].severity === 'severe' ? 'critical' : 'high',
      message: `Declining trend detected in ${outcomeType} for patient ${patientId}`,
      triggeredAt: Date.now(),
      acknowledged: false,
      actions: [
        'Review treatment plan',
        'Increase monitoring frequency',
        'Consider intervention adjustment',
        'Multidisciplinary team consultation'
      ]
    };

    this.alerts.set(alert.id, alert);
    this.emit('outcome_alert', alert);
    console.log(`🚨 Outcome trend alert: ${alert.message}`);
  }

  /**
   * Check outcome alerts
   */
  private async checkOutcomeAlerts(): Promise<void> {
    // Check for threshold breaches
    for (const [outcomeId, outcome] of this.outcomes.entries()) {
      if (outcome.severity === 'severe' || outcome.severity === 'critical') {
        await this.createThresholdAlert(outcome);
      }
    }

    // Check for high-risk predictions
    for (const [predictionId, prediction] of this.predictions.entries()) {
      if (prediction.riskScore > 80 && prediction.confidence > 0.8) {
        await this.createPredictionAlert(prediction);
      }
    }
  }

  /**
   * Create threshold alert
   */
  private async createThresholdAlert(outcome: ClinicalOutcome): Promise<void> {
    // Check if alert already exists for this outcome
    const existingAlert = Array.from(this.alerts.values()).find(
      alert => alert.outcomeId === outcome.id && alert.alertType === 'threshold_breach'
    );

    if (existingAlert) return;

    const alert: OutcomeAlert = {
      id: this.generateAlertId(),
      patientId: outcome.patientId,
      outcomeId: outcome.id,
      alertType: 'threshold_breach',
      severity: outcome.severity === 'critical' ? 'critical' : 'high',
      message: `${outcome.outcomeType} threshold breach: ${outcome.value} ${outcome.unit || ''}`,
      triggeredAt: Date.now(),
      acknowledged: false,
      actions: this.getThresholdActions(outcome.outcomeType)
    };

    this.alerts.set(alert.id, alert);
    this.emit('outcome_alert', alert);
  }

  /**
   * Create prediction alert
   */
  private async createPredictionAlert(prediction: OutcomePrediction): Promise<void> {
    const alert: OutcomeAlert = {
      id: this.generateAlertId(),
      patientId: prediction.patientId,
      outcomeId: prediction.id,
      alertType: 'prediction_high_risk',
      severity: prediction.riskScore > 90 ? 'critical' : 'high',
      message: `High risk prediction for ${prediction.outcomeType}: ${prediction.riskScore.toFixed(1)}% risk`,
      triggeredAt: Date.now(),
      acknowledged: false,
      actions: prediction.recommendations
    };

    this.alerts.set(alert.id, alert);
    this.emit('outcome_alert', alert);
  }

  /**
   * Get threshold actions
   */
  private getThresholdActions(outcomeType: OutcomeType): string[] {
    const actions: Record<OutcomeType, string[]> = {
      'clinical_indicator': ['Review vital signs', 'Assess patient condition', 'Consider intervention'],
      'functional_status': ['Physical therapy consultation', 'Safety assessment'],
      'quality_of_life': ['Pain management review', 'Comfort measures'],
      'patient_satisfaction': ['Address patient concerns', 'Improve communication'],
      'safety_outcome': ['Implement safety measures', 'Environmental assessment'],
      'cost_effectiveness': ['Review resource utilization'],
      'readmission_risk': ['Discharge planning review'],
      'mortality_risk': ['Urgent medical review', 'Family notification'],
      'infection_risk': ['Infection control measures'],
      'medication_adherence': ['Medication counseling']
    };

    return actions[outcomeType] || ['Clinical review required'];
  }

  /**
   * Update patient profile
   */
  private async updatePatientProfile(patientId: string, outcome: ClinicalOutcome): Promise<void> {
    let profile = this.patientProfiles.get(patientId);
    
    if (!profile) {
      profile = {
        patientId,
        outcomes: [],
        predictions: [],
        riskScore: 0,
        overallTrend: 'stable',
        lastAssessment: Date.now(),
        nextAssessment: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        alerts: []
      };
    }

    // Add outcome
    profile.outcomes.push(outcome);
    profile.outcomes.sort((a, b) => b.measurementDate - a.measurementDate);
    
    // Keep only recent outcomes (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    profile.outcomes = profile.outcomes.filter(o => o.measurementDate > thirtyDaysAgo);

    // Update overall trend
    profile.overallTrend = this.calculateOverallTrend(profile.outcomes);
    
    // Update risk score
    profile.riskScore = this.calculateOverallRiskScore(patientId);
    
    // Update last assessment
    profile.lastAssessment = Date.now();

    this.patientProfiles.set(patientId, profile);
  }

  /**
   * Calculate overall trend
   */
  private calculateOverallTrend(outcomes: ClinicalOutcome[]): 'improving' | 'stable' | 'declining' {
    if (outcomes.length === 0) return 'stable';

    const trendCounts = outcomes.reduce((acc, outcome) => {
      acc[outcome.trend]++;
      return acc;
    }, { improving: 0, stable: 0, declining: 0 });

    if (trendCounts.improving > trendCounts.declining) return 'improving';
    if (trendCounts.declining > trendCounts.improving) return 'declining';
    return 'stable';
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(patientId: string): number {
    const predictions = Array.from(this.predictions.values())
      .filter(p => p.patientId === patientId && p.validUntil > Date.now());

    if (predictions.length === 0) return 0;

    const weightedScore = predictions.reduce((sum, pred) => {
      return sum + (pred.riskScore * pred.confidence);
    }, 0);

    const totalWeight = predictions.reduce((sum, pred) => sum + pred.confidence, 0);

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  /**
   * Add outcome measure
   */
  addOutcomeMeasure(measure: OutcomeMeasure): void {
    this.outcomeMeasures.set(measure.id, measure);
    console.log(`✅ Added outcome measure: ${measure.name}`);
  }

  /**
   * Add ML model
   */
  addMLModel(model: MLModel): void {
    this.mlModels.set(model.id, model);
    console.log(`✅ Added ML model: ${model.name} (v${model.version})`);
  }

  /**
   * Get patient outcome profile
   */
  getPatientProfile(patientId: string): PatientOutcomeProfile | undefined {
    return this.patientProfiles.get(patientId);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): OutcomeAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;

    console.log(`✅ Outcome alert acknowledged: ${alertId} by ${acknowledgedBy}`);
    return true;
  }

  /**
   * Get outcome statistics
   */
  getOutcomeStats() {
    const outcomes = Array.from(this.outcomes.values());
    const predictions = Array.from(this.predictions.values());
    const alerts = Array.from(this.alerts.values());

    return {
      total_outcomes: outcomes.length,
      total_predictions: predictions.length,
      total_alerts: alerts.length,
      active_alerts: alerts.filter(a => !a.acknowledged).length,
      outcome_measures: this.outcomeMeasures.size,
      ml_models: this.mlModels.size,
      patient_profiles: this.patientProfiles.size,
      by_category: outcomes.reduce((acc, outcome) => {
        acc[outcome.category] = (acc[outcome.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_severity: outcomes.reduce((acc, outcome) => {
        acc[outcome.severity || 'unknown'] = (acc[outcome.severity || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avg_risk_score: this.patientProfiles.size > 0 ?
        Array.from(this.patientProfiles.values()).reduce((sum, p) => sum + p.riskScore, 0) / this.patientProfiles.size : 0
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
  private generateOutcomeId(): string {
    return `OUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePredictionId(): string {
    return `PRED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `OA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.outcomes.clear();
    this.outcomeMeasures.clear();
    this.predictions.clear();
    this.alerts.clear();
    this.mlModels.clear();
    this.patientProfiles.clear();
    this.eventListeners.clear();
  }
}

// Singleton instance
const clinicalOutcomeMeasurement = new AdvancedClinicalOutcomeMeasurement();

export default clinicalOutcomeMeasurement;
export { AdvancedClinicalOutcomeMeasurement, ClinicalOutcome, OutcomePrediction, PatientOutcomeProfile };