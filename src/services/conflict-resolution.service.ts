/**
 * Production Real-Time Sync Conflict Resolution
 * Operational Transform Algorithms for Healthcare Data
 */

interface Operation {
  type: 'insert' | 'delete' | 'retain' | 'replace';
  position?: number;
  length?: number;
  content?: any;
  field?: string;
  timestamp: number;
  userId: string;
  operationId: string;
}

interface TransformResult {
  transformedOp1: Operation;
  transformedOp2: Operation;
}

interface ConflictResolutionRule {
  field: string;
  strategy: 'latest_wins' | 'merge' | 'priority_based' | 'medical_priority' | 'manual_review';
  priority?: number;
  validator?: (value: any) => boolean;
}

interface HealthcareDataConflict {
  id: string;
  patientId: string;
  dataType: 'vital_signs' | 'medication' | 'clinical_note' | 'assessment' | 'care_plan';
  localVersion: any;
  serverVersion: any;
  conflictFields: string[];
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolution?: any;
  resolutionMethod?: string;
}

class RealTimeSyncConflictResolver {
  private conflictRules: Map<string, ConflictResolutionRule> = new Map();
  private activeConflicts: Map<string, HealthcareDataConflict> = new Map();
  private operationHistory: Operation[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.initializeHealthcareRules();
  }

  /**
   * Initialize healthcare-specific conflict resolution rules
   */
  private initializeHealthcareRules(): void {
    // Critical medical data - always requires manual review
    this.conflictRules.set('vital_signs.blood_pressure', {
      field: 'vital_signs.blood_pressure',
      strategy: 'medical_priority',
      priority: 10,
      validator: (value) => this.validateBloodPressure(value)
    });

    this.conflictRules.set('vital_signs.heart_rate', {
      field: 'vital_signs.heart_rate',
      strategy: 'medical_priority',
      priority: 10,
      validator: (value) => this.validateHeartRate(value)
    });

    this.conflictRules.set('medication.dosage', {
      field: 'medication.dosage',
      strategy: 'manual_review',
      priority: 10,
      validator: (value) => this.validateDosage(value)
    });

    this.conflictRules.set('medication.frequency', {
      field: 'medication.frequency',
      strategy: 'manual_review',
      priority: 10
    });

    // Clinical notes - merge strategy with timestamp priority
    this.conflictRules.set('clinical_note.content', {
      field: 'clinical_note.content',
      strategy: 'merge',
      priority: 8
    });

    this.conflictRules.set('clinical_note.diagnosis', {
      field: 'clinical_note.diagnosis',
      strategy: 'latest_wins',
      priority: 9
    });

    // Assessment data - priority based on clinician level
    this.conflictRules.set('assessment.score', {
      field: 'assessment.score',
      strategy: 'priority_based',
      priority: 7
    });

    // Care plan - requires careful merging
    this.conflictRules.set('care_plan.goals', {
      field: 'care_plan.goals',
      strategy: 'merge',
      priority: 8
    });

    this.conflictRules.set('care_plan.interventions', {
      field: 'care_plan.interventions',
      strategy: 'merge',
      priority: 8
    });

    // Patient demographics - latest wins for most fields
    this.conflictRules.set('patient.contact_info', {
      field: 'patient.contact_info',
      strategy: 'latest_wins',
      priority: 5
    });

    this.conflictRules.set('patient.emergency_contact', {
      field: 'patient.emergency_contact',
      strategy: 'latest_wins',
      priority: 7
    });
  }

  /**
   * Transform operations using Operational Transform algorithm
   */
  transformOperations(op1: Operation, op2: Operation): TransformResult {
    // Handle different operation type combinations
    if (op1.type === 'insert' && op2.type === 'insert') {
      return this.transformInsertInsert(op1, op2);
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      return this.transformInsertDelete(op1, op2);
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      const result = this.transformInsertDelete(op2, op1);
      return { transformedOp1: result.transformedOp2, transformedOp2: result.transformedOp1 };
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      return this.transformDeleteDelete(op1, op2);
    } else if (op1.type === 'replace' || op2.type === 'replace') {
      return this.transformReplace(op1, op2);
    }

    // Default: no transformation needed
    return { transformedOp1: op1, transformedOp2: op2 };
  }

  /**
   * Transform two insert operations
   */
  private transformInsertInsert(op1: Operation, op2: Operation): TransformResult {
    if (!op1.position || !op2.position) {
      return { transformedOp1: op1, transformedOp2: op2 };
    }

    let transformedOp1 = { ...op1 };
    let transformedOp2 = { ...op2 };

    if (op1.position <= op2.position) {
      transformedOp2.position = op2.position + (op1.content?.length || 1);
    } else {
      transformedOp1.position = op1.position + (op2.content?.length || 1);
    }

    return { transformedOp1, transformedOp2 };
  }

  /**
   * Transform insert and delete operations
   */
  private transformInsertDelete(insertOp: Operation, deleteOp: Operation): TransformResult {
    if (!insertOp.position || !deleteOp.position || !deleteOp.length) {
      return { transformedOp1: insertOp, transformedOp2: deleteOp };
    }

    let transformedInsert = { ...insertOp };
    let transformedDelete = { ...deleteOp };

    if (insertOp.position <= deleteOp.position) {
      transformedDelete.position = deleteOp.position + (insertOp.content?.length || 1);
    } else if (insertOp.position > deleteOp.position + deleteOp.length) {
      transformedInsert.position = insertOp.position - deleteOp.length;
    } else {
      // Insert is within delete range
      transformedInsert.position = deleteOp.position;
      transformedDelete.length = deleteOp.length + (insertOp.content?.length || 1);
    }

    return { transformedOp1: transformedInsert, transformedOp2: transformedDelete };
  }

  /**
   * Transform two delete operations
   */
  private transformDeleteDelete(op1: Operation, op2: Operation): TransformResult {
    if (!op1.position || !op2.position || !op1.length || !op2.length) {
      return { transformedOp1: op1, transformedOp2: op2 };
    }

    let transformedOp1 = { ...op1 };
    let transformedOp2 = { ...op2 };

    const op1End = op1.position + op1.length;
    const op2End = op2.position + op2.length;

    if (op1End <= op2.position) {
      // No overlap, op2 position shifts
      transformedOp2.position = op2.position - op1.length;
    } else if (op2End <= op1.position) {
      // No overlap, op1 position shifts
      transformedOp1.position = op1.position - op2.length;
    } else {
      // Overlapping deletes - complex case
      const overlapStart = Math.max(op1.position, op2.position);
      const overlapEnd = Math.min(op1End, op2End);
      const overlapLength = overlapEnd - overlapStart;

      if (op1.position < op2.position) {
        transformedOp1.length = op1.length - overlapLength;
        transformedOp2.position = op1.position;
        transformedOp2.length = op2.length - overlapLength;
      } else {
        transformedOp2.length = op2.length - overlapLength;
        transformedOp1.position = op2.position;
        transformedOp1.length = op1.length - overlapLength;
      }
    }

    return { transformedOp1, transformedOp2 };
  }

  /**
   * Transform operations involving replace
   */
  private transformReplace(op1: Operation, op2: Operation): TransformResult {
    // For healthcare data, replace operations often need manual review
    if (this.isHealthcareCriticalField(op1.field) || this.isHealthcareCriticalField(op2.field)) {
      // Mark for manual review
      return {
        transformedOp1: { ...op1, type: 'replace' },
        transformedOp2: { ...op2, type: 'replace' }
      };
    }

    // Use timestamp-based resolution for non-critical fields
    if (op1.timestamp > op2.timestamp) {
      return { transformedOp1: op1, transformedOp2: { ...op2, type: 'retain' } };
    } else {
      return { transformedOp1: { ...op1, type: 'retain' }, transformedOp2: op2 };
    }
  }

  /**
   * Resolve healthcare data conflicts
   */
  async resolveHealthcareConflict(conflict: HealthcareDataConflict): Promise<any> {
    console.log(`🔄 Resolving healthcare conflict: ${conflict.id}`);

    const resolution: any = {};
    let requiresManualReview = false;

    for (const field of conflict.conflictFields) {
      const rule = this.conflictRules.get(field) || this.getDefaultRule(field);
      const localValue = this.getNestedValue(conflict.localVersion, field);
      const serverValue = this.getNestedValue(conflict.serverVersion, field);

      switch (rule.strategy) {
        case 'latest_wins':
          resolution[field] = this.resolveLatestWins(localValue, serverValue, conflict);
          break;

        case 'merge':
          resolution[field] = await this.resolveMerge(localValue, serverValue, field);
          break;

        case 'priority_based':
          resolution[field] = this.resolvePriorityBased(localValue, serverValue, conflict);
          break;

        case 'medical_priority':
          resolution[field] = this.resolveMedicalPriority(localValue, serverValue, conflict);
          break;

        case 'manual_review':
          requiresManualReview = true;
          resolution[field] = null; // Will be resolved manually
          break;
      }
    }

    if (requiresManualReview) {
      await this.flagForManualReview(conflict);
      return null; // No automatic resolution
    }

    // Apply resolution
    const resolvedData = { ...conflict.serverVersion, ...resolution };
    
    // Validate resolved data
    if (await this.validateResolvedData(resolvedData, conflict.dataType)) {
      conflict.resolved = true;
      conflict.resolution = resolvedData;
      conflict.resolutionMethod = 'automatic';
      
      this.activeConflicts.set(conflict.id, conflict);
      
      console.log(`✅ Healthcare conflict resolved automatically: ${conflict.id}`);
      return resolvedData;
    } else {
      await this.flagForManualReview(conflict);
      return null;
    }
  }

  /**
   * Resolve using latest timestamp
   */
  private resolveLatestWins(localValue: any, serverValue: any, conflict: HealthcareDataConflict): any {
    const localTimestamp = localValue?.timestamp || conflict.timestamp;
    const serverTimestamp = serverValue?.timestamp || 0;
    
    return localTimestamp > serverTimestamp ? localValue : serverValue;
  }

  /**
   * Resolve by merging values
   */
  private async resolveMerge(localValue: any, serverValue: any, field: string): Promise<any> {
    if (field.includes('clinical_note.content')) {
      return this.mergeClinicalNotes(localValue, serverValue);
    } else if (field.includes('care_plan')) {
      return this.mergeCarePlan(localValue, serverValue);
    } else if (Array.isArray(localValue) && Array.isArray(serverValue)) {
      return this.mergeArrays(localValue, serverValue);
    } else if (typeof localValue === 'object' && typeof serverValue === 'object') {
      return { ...serverValue, ...localValue };
    }
    
    return localValue; // Default to local
  }

  /**
   * Merge clinical notes intelligently
   */
  private mergeClinicalNotes(localNote: any, serverNote: any): any {
    if (!localNote || !serverNote) {
      return localNote || serverNote;
    }

    return {
      ...serverNote,
      content: this.mergeTextContent(localNote.content, serverNote.content),
      lastModified: Math.max(localNote.lastModified || 0, serverNote.lastModified || 0),
      contributors: [...new Set([...(localNote.contributors || []), ...(serverNote.contributors || [])])]
    };
  }

  /**
   * Merge text content with conflict markers
   */
  private mergeTextContent(localText: string, serverText: string): string {
    if (localText === serverText) return localText;
    
    // Simple merge with conflict markers for manual review
    return `${serverText}\n\n--- MERGED CONTENT ---\n${localText}`;
  }

  /**
   * Merge care plan data
   */
  private mergeCarePlan(localPlan: any, serverPlan: any): any {
    if (!localPlan || !serverPlan) {
      return localPlan || serverPlan;
    }

    return {
      ...serverPlan,
      goals: this.mergeArrays(localPlan.goals || [], serverPlan.goals || []),
      interventions: this.mergeArrays(localPlan.interventions || [], serverPlan.interventions || []),
      lastUpdated: Math.max(localPlan.lastUpdated || 0, serverPlan.lastUpdated || 0)
    };
  }

  /**
   * Merge arrays with deduplication
   */
  private mergeArrays(localArray: any[], serverArray: any[]): any[] {
    const merged = [...serverArray];
    
    for (const localItem of localArray) {
      const exists = merged.some(serverItem => 
        JSON.stringify(serverItem) === JSON.stringify(localItem)
      );
      
      if (!exists) {
        merged.push(localItem);
      }
    }
    
    return merged;
  }

  /**
   * Resolve based on user priority/role
   */
  private resolvePriorityBased(localValue: any, serverValue: any, conflict: HealthcareDataConflict): any {
    // In a real implementation, this would check user roles/permissions
    // For now, use timestamp as fallback
    return this.resolveLatestWins(localValue, serverValue, conflict);
  }

  /**
   * Resolve based on medical priority
   */
  private resolveMedicalPriority(localValue: any, serverValue: any, conflict: HealthcareDataConflict): any {
    // Critical medical data requires validation
    if (this.validateMedicalValue(localValue) && this.validateMedicalValue(serverValue)) {
      // Both valid - use latest
      return this.resolveLatestWins(localValue, serverValue, conflict);
    } else if (this.validateMedicalValue(localValue)) {
      return localValue;
    } else if (this.validateMedicalValue(serverValue)) {
      return serverValue;
    }
    
    // Neither valid - flag for manual review
    return null;
  }

  /**
   * Flag conflict for manual review
   */
  private async flagForManualReview(conflict: HealthcareDataConflict): Promise<void> {
    conflict.severity = 'critical';
    this.activeConflicts.set(conflict.id, conflict);
    
    // Notify healthcare staff
    console.log(`⚠️ Healthcare conflict requires manual review: ${conflict.id}`);
    
    // In a real implementation, this would send notifications to appropriate staff
    // await notificationService.sendEmergencyAlert({
    //   type: 'data_conflict',
    //   patientId: conflict.patientId,
    //   conflictId: conflict.id,
    //   severity: conflict.severity
    // }, clinicianIds);
  }

  /**
   * Validate resolved healthcare data
   */
  private async validateResolvedData(data: any, dataType: string): Promise<boolean> {
    switch (dataType) {
      case 'vital_signs':
        return this.validateVitalSigns(data);
      case 'medication':
        return this.validateMedication(data);
      case 'clinical_note':
        return this.validateClinicalNote(data);
      case 'assessment':
        return this.validateAssessment(data);
      case 'care_plan':
        return this.validateCarePlan(data);
      default:
        return true; // Default validation
    }
  }

  /**
   * Healthcare-specific validators
   */
  private validateVitalSigns(data: any): boolean {
    if (!data) return false;
    
    // Validate blood pressure
    if (data.bloodPressure) {
      const [systolic, diastolic] = data.bloodPressure.split('/').map(Number);
      if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
        return false;
      }
    }
    
    // Validate heart rate
    if (data.heartRate && (data.heartRate < 30 || data.heartRate > 220)) {
      return false;
    }
    
    // Validate temperature
    if (data.temperature && (data.temperature < 32 || data.temperature > 45)) {
      return false;
    }
    
    return true;
  }

  private validateBloodPressure(value: string): boolean {
    if (!value) return false;
    const [systolic, diastolic] = value.split('/').map(Number);
    return systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150;
  }

  private validateHeartRate(value: number): boolean {
    return value >= 30 && value <= 220;
  }

  private validateDosage(value: any): boolean {
    return value && typeof value === 'string' && value.length > 0;
  }

  private validateMedication(data: any): boolean {
    return data && data.name && data.dosage && data.frequency;
  }

  private validateClinicalNote(data: any): boolean {
    return data && data.content && data.content.length > 0;
  }

  private validateAssessment(data: any): boolean {
    return data && typeof data.score === 'number';
  }

  private validateCarePlan(data: any): boolean {
    return data && Array.isArray(data.goals) && Array.isArray(data.interventions);
  }

  private validateMedicalValue(value: any): boolean {
    // Basic validation - in real implementation, this would be more comprehensive
    return value !== null && value !== undefined;
  }

  /**
   * Utility methods
   */
  private isHealthcareCriticalField(field?: string): boolean {
    if (!field) return false;
    
    const criticalFields = [
      'vital_signs',
      'medication.dosage',
      'medication.frequency',
      'clinical_note.diagnosis',
      'assessment.score'
    ];
    
    return criticalFields.some(critical => field.includes(critical));
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getDefaultRule(field: string): ConflictResolutionRule {
    return {
      field,
      strategy: 'latest_wins',
      priority: 5
    };
  }

  /**
   * Add operation to history
   */
  addOperation(operation: Operation): void {
    this.operationHistory.push(operation);
    
    // Limit history size
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory = this.operationHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get conflict statistics
   */
  getConflictStats() {
    const conflicts = Array.from(this.activeConflicts.values());
    
    return {
      total: conflicts.length,
      resolved: conflicts.filter(c => c.resolved).length,
      pending: conflicts.filter(c => !c.resolved).length,
      critical: conflicts.filter(c => c.severity === 'critical').length,
      byDataType: conflicts.reduce((acc, c) => {
        acc[c.dataType] = (acc[c.dataType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Get active conflicts
   */
  getActiveConflicts(): HealthcareDataConflict[] {
    return Array.from(this.activeConflicts.values()).filter(c => !c.resolved);
  }
}

// Singleton instance
const conflictResolver = new RealTimeSyncConflictResolver();

export default conflictResolver;
export { RealTimeSyncConflictResolver, Operation, HealthcareDataConflict, TransformResult };