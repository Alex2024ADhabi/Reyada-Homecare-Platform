/**
 * Patient Data Orchestrator
 * Central coordination system for all patient data operations
 * Part of Phase 1: Foundation & Core Features - Missing Orchestrators
 */

import { EventEmitter } from 'eventemitter3';

// Patient Data Types
export interface PatientRecord {
  id: string;
  emiratesId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    phoneNumber: string;
    email: string;
    address: {
      street: string;
      city: string;
      emirate: string;
      postalCode: string;
    };
  };
  medicalInfo: {
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: Medication[];
    emergencyContact: EmergencyContact;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    coverage: string[];
  };
  careHistory: CareEpisode[];
  documents: PatientDocument[];
  preferences: PatientPreferences;
  status: 'active' | 'inactive' | 'transferred' | 'deceased';
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
}

export interface CareEpisode {
  id: string;
  startDate: string;
  endDate?: string;
  careType: string;
  primaryCaregiver: string;
  diagnosis: string[];
  treatmentPlan: string;
  status: 'active' | 'completed' | 'suspended';
  notes: string[];
}

export interface PatientDocument {
  id: string;
  type: 'medical_report' | 'insurance_card' | 'id_copy' | 'consent_form' | 'other';
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

export interface PatientPreferences {
  language: string;
  communicationMethod: 'phone' | 'email' | 'sms' | 'whatsapp';
  appointmentReminders: boolean;
  medicationReminders: boolean;
  privacySettings: {
    shareWithFamily: boolean;
    shareWithInsurance: boolean;
    marketingCommunications: boolean;
  };
}

export interface DataOperation {
  id: string;
  type: 'create' | 'read' | 'update' | 'delete' | 'sync';
  entity: 'patient' | 'episode' | 'document' | 'medication' | 'appointment';
  entityId: string;
  userId: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  metadata: {
    source: string;
    version: number;
    checksum: string;
    encrypted: boolean;
  };
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

class PatientDataOrchestrator extends EventEmitter {
  private patients: Map<string, PatientRecord> = new Map();
  private operations: Map<string, DataOperation> = new Map();
  private syncQueue: DataOperation[] = [];
  private isInitialized = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeOrchestrator();
  }

  private async initializeOrchestrator(): Promise<void> {
    try {
      console.log("🔄 Initializing Patient Data Orchestrator...");

      // Initialize data validation rules
      await this.initializeValidationRules();

      // Setup data synchronization
      this.setupDataSync();

      // Initialize encryption
      await this.initializeEncryption();

      this.isInitialized = true;
      this.emit("orchestrator:initialized");

      console.log("✅ Patient Data Orchestrator initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Patient Data Orchestrator:", error);
      throw error;
    }
  }

  /**
   * Create new patient record with full validation and orchestration
   */
  async createPatient(patientData: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientRecord> {
    try {
      if (!this.isInitialized) {
        throw new Error("Orchestrator not initialized");
      }

      const patientId = this.generatePatientId();
      const timestamp = new Date().toISOString();

      // Validate patient data
      const validation = await this.validatePatientData(patientData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Encrypt sensitive data
      const encryptedData = await this.encryptSensitiveData(patientData);

      // Create patient record
      const patient: PatientRecord = {
        ...encryptedData,
        id: patientId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Store patient
      this.patients.set(patientId, patient);

      // Create operation record
      const operation = await this.createOperation('create', 'patient', patientId, 'system', patient);

      // Emit events
      this.emit("patient:created", patient);
      this.emit("data:changed", { type: 'create', entity: 'patient', id: patientId });

      // Queue for sync
      this.queueForSync(operation);

      console.log(`👤 Patient created: ${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`);
      return patient;
    } catch (error) {
      console.error("❌ Failed to create patient:", error);
      throw error;
    }
  }

  /**
   * Update patient record with validation and change tracking
   */
  async updatePatient(patientId: string, updates: Partial<PatientRecord>, userId: string): Promise<PatientRecord> {
    try {
      const existingPatient = this.patients.get(patientId);
      if (!existingPatient) {
        throw new Error(`Patient not found: ${patientId}`);
      }

      // Validate updates
      const validation = await this.validatePatientData({ ...existingPatient, ...updates });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Encrypt sensitive updates
      const encryptedUpdates = await this.encryptSensitiveData(updates);

      // Apply updates
      const updatedPatient: PatientRecord = {
        ...existingPatient,
        ...encryptedUpdates,
        updatedAt: new Date().toISOString(),
      };

      // Store updated patient
      this.patients.set(patientId, updatedPatient);

      // Create operation record
      const operation = await this.createOperation('update', 'patient', patientId, userId, updates);

      // Emit events
      this.emit("patient:updated", { previous: existingPatient, current: updatedPatient });
      this.emit("data:changed", { type: 'update', entity: 'patient', id: patientId });

      // Queue for sync
      this.queueForSync(operation);

      console.log(`👤 Patient updated: ${patientId}`);
      return updatedPatient;
    } catch (error) {
      console.error("❌ Failed to update patient:", error);
      throw error;
    }
  }

  /**
   * Get patient with decryption and access logging
   */
  async getPatient(patientId: string, userId: string): Promise<PatientRecord | null> {
    try {
      const patient = this.patients.get(patientId);
      if (!patient) {
        return null;
      }

      // Log access
      await this.logDataAccess('read', 'patient', patientId, userId);

      // Decrypt sensitive data
      const decryptedPatient = await this.decryptSensitiveData(patient);

      this.emit("patient:accessed", { patientId, userId, timestamp: new Date().toISOString() });
      return decryptedPatient;
    } catch (error) {
      console.error("❌ Failed to get patient:", error);
      throw error;
    }
  }

  /**
   * Search patients with advanced filtering
   */
  async searchPatients(criteria: any, userId: string): Promise<PatientRecord[]> {
    try {
      const results: PatientRecord[] = [];
      
      for (const [id, patient] of this.patients) {
        if (this.matchesCriteria(patient, criteria)) {
          const decryptedPatient = await this.decryptSensitiveData(patient);
          results.push(decryptedPatient);
        }
      }

      // Log search
      await this.logDataAccess('read', 'patient', 'search', userId);

      this.emit("patients:searched", { criteria, results: results.length, userId });
      return results;
    } catch (error) {
      console.error("❌ Failed to search patients:", error);
      throw error;
    }
  }

  /**
   * Add care episode to patient
   */
  async addCareEpisode(patientId: string, episode: Omit<CareEpisode, 'id'>, userId: string): Promise<CareEpisode> {
    try {
      const patient = this.patients.get(patientId);
      if (!patient) {
        throw new Error(`Patient not found: ${patientId}`);
      }

      const episodeId = this.generateEpisodeId();
      const careEpisode: CareEpisode = {
        ...episode,
        id: episodeId,
      };

      // Add episode to patient
      patient.careHistory.push(careEpisode);
      patient.updatedAt = new Date().toISOString();

      // Update patient record
      this.patients.set(patientId, patient);

      // Create operation record
      const operation = await this.createOperation('create', 'episode', episodeId, userId, careEpisode);

      // Emit events
      this.emit("episode:added", { patientId, episode: careEpisode });
      this.emit("data:changed", { type: 'create', entity: 'episode', id: episodeId });

      // Queue for sync
      this.queueForSync(operation);

      console.log(`📋 Care episode added to patient ${patientId}: ${episodeId}`);
      return careEpisode;
    } catch (error) {
      console.error("❌ Failed to add care episode:", error);
      throw error;
    }
  }

  /**
   * Sync data with external systems
   */
  async syncData(): Promise<void> {
    try {
      if (this.syncQueue.length === 0) {
        return;
      }

      console.log(`🔄 Syncing ${this.syncQueue.length} operations...`);

      const operations = [...this.syncQueue];
      this.syncQueue = [];

      for (const operation of operations) {
        try {
          await this.processOperation(operation);
          operation.status = 'completed';
          this.emit("operation:completed", operation);
        } catch (error) {
          operation.status = 'failed';
          this.emit("operation:failed", { operation, error });
          console.error(`❌ Failed to sync operation ${operation.id}:`, error);
        }
      }

      this.emit("sync:completed", { processed: operations.length });
    } catch (error) {
      console.error("❌ Failed to sync data:", error);
      throw error;
    }
  }

  /**
   * Get orchestrator statistics
   */
  getStatistics(): any {
    return {
      totalPatients: this.patients.size,
      pendingOperations: this.syncQueue.length,
      completedOperations: Array.from(this.operations.values()).filter(op => op.status === 'completed').length,
      failedOperations: Array.from(this.operations.values()).filter(op => op.status === 'failed').length,
      lastSync: this.syncQueue.length > 0 ? null : new Date().toISOString(),
      isHealthy: this.isInitialized && this.syncQueue.length < 100,
    };
  }

  // Private helper methods
  private async initializeValidationRules(): Promise<void> {
    // Initialize data validation rules
    console.log("🔄 Validation rules initialized");
  }

  private setupDataSync(): void {
    // Setup periodic sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 30000);
  }

  private async initializeEncryption(): Promise<void> {
    // Initialize encryption for sensitive data
    console.log("🔐 Encryption initialized");
  }

  private async validatePatientData(data: any): Promise<DataValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Emirates ID validation
    if (!data.emiratesId || !/^\d{15}$/.test(data.emiratesId)) {
      errors.push({
        field: 'emiratesId',
        message: 'Emirates ID must be 15 digits',
        severity: 'critical',
        code: 'INVALID_EMIRATES_ID',
      });
    }

    // Phone number validation
    if (!data.personalInfo?.phoneNumber || !/^\+971\d{9}$/.test(data.personalInfo.phoneNumber)) {
      errors.push({
        field: 'phoneNumber',
        message: 'Phone number must be valid UAE format (+971XXXXXXXXX)',
        severity: 'high',
        code: 'INVALID_PHONE',
      });
    }

    // Email validation
    if (data.personalInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        severity: 'medium',
        code: 'INVALID_EMAIL',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5)),
    };
  }

  private async encryptSensitiveData(data: any): Promise<any> {
    // Simulate encryption of sensitive fields
    const encrypted = { ...data };
    
    if (encrypted.emiratesId) {
      encrypted.emiratesId = `ENC_${encrypted.emiratesId}`;
    }
    
    if (encrypted.personalInfo?.phoneNumber) {
      encrypted.personalInfo.phoneNumber = `ENC_${encrypted.personalInfo.phoneNumber}`;
    }

    return encrypted;
  }

  private async decryptSensitiveData(data: any): Promise<any> {
    // Simulate decryption of sensitive fields
    const decrypted = { ...data };
    
    if (decrypted.emiratesId?.startsWith('ENC_')) {
      decrypted.emiratesId = decrypted.emiratesId.replace('ENC_', '');
    }
    
    if (decrypted.personalInfo?.phoneNumber?.startsWith('ENC_')) {
      decrypted.personalInfo.phoneNumber = decrypted.personalInfo.phoneNumber.replace('ENC_', '');
    }

    return decrypted;
  }

  private async createOperation(type: DataOperation['type'], entity: DataOperation['entity'], entityId: string, userId: string, data: any): Promise<DataOperation> {
    const operation: DataOperation = {
      id: this.generateOperationId(),
      type,
      entity,
      entityId,
      userId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      data,
      metadata: {
        source: 'patient_data_orchestrator',
        version: 1,
        checksum: this.calculateChecksum(data),
        encrypted: true,
      },
    };

    this.operations.set(operation.id, operation);
    return operation;
  }

  private queueForSync(operation: DataOperation): void {
    this.syncQueue.push(operation);
    this.emit("operation:queued", operation);
  }

  private async processOperation(operation: DataOperation): Promise<void> {
    // Simulate processing operation (sync with external systems)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, this would sync with:
    // - DOH systems
    // - Insurance providers
    // - Hospital systems
    // - Backup systems
  }

  private async logDataAccess(type: string, entity: string, entityId: string, userId: string): Promise<void> {
    const accessLog = {
      type,
      entity,
      entityId,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress: 'unknown', // Would be captured from request
    };

    this.emit("data:accessed", accessLog);
  }

  private matchesCriteria(patient: PatientRecord, criteria: any): boolean {
    // Simple criteria matching - in production would be more sophisticated
    if (criteria.name) {
      const fullName = `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`.toLowerCase();
      return fullName.includes(criteria.name.toLowerCase());
    }

    if (criteria.emiratesId) {
      return patient.emiratesId.includes(criteria.emiratesId);
    }

    return true;
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private generatePatientId(): string {
    return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEpisodeId(): string {
    return `EP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }
      
      // Final sync before shutdown
      await this.syncData();
      
      this.removeAllListeners();
      console.log("🔄 Patient Data Orchestrator shutdown completed");
    } catch (error) {
      console.error("❌ Error during orchestrator shutdown:", error);
    }
  }
}

export const patientDataOrchestrator = new PatientDataOrchestrator();
export default patientDataOrchestrator;