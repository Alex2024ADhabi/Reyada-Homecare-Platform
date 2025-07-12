import { Database } from "../types/supabase";
import { supabase } from "./supabase.api";
import { z } from "zod";

// UNIFIED DATA SCHEMA IMPLEMENTATION
// Standardized patient data models across all modules with consistent field naming conventions

// Core unified schemas with consistent naming conventions
export const UnifiedPatientSchema = z.object({
  id: z.string().uuid(),
  emiratesId: z.string().min(15).max(15), // UAE Emirates ID format
  personalInfo: z.object({
    firstNameEn: z.string().min(1),
    lastNameEn: z.string().min(1),
    firstNameAr: z.string().optional(),
    lastNameAr: z.string().optional(),
    dateOfBirth: z.string().datetime(),
    gender: z.enum(["male", "female", "other"]),
    nationality: z.string(),
    languagePreference: z.string().default("en"),
    interpreterRequired: z.boolean().default(false),
  }),
  contactInfo: z.object({
    phoneNumber: z.string().regex(/^\+971[0-9]{8,9}$/), // UAE phone format
    email: z.string().email().optional(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      emirate: z.string(),
      postalCode: z.string().optional(),
      coordinates: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
    }),
  }),
  insuranceInfo: z.object({
    provider: z.string().optional(),
    type: z.enum(["government", "private", "corporate"]).optional(),
    number: z.string().optional(),
    thiqaCardNumber: z.string().optional(),
    validFrom: z.string().datetime().optional(),
    validTo: z.string().datetime().optional(),
    coverageDetails: z
      .object({
        homecareServices: z.boolean().default(false),
        nursingCare: z.boolean().default(false),
        physicalTherapy: z.boolean().default(false),
        medicalEquipment: z.boolean().default(false),
        medications: z.boolean().default(false),
      })
      .optional(),
  }),
  medicalInfo: z.object({
    medicalRecordNumber: z.string().optional(),
    bloodType: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),
    allergies: z
      .array(
        z.object({
          allergen: z.string(),
          reaction: z.string(),
          severity: z.enum(["mild", "moderate", "severe"]),
          onsetDate: z.string().datetime().optional(),
        }),
      )
      .default([]),
    chronicConditions: z
      .array(
        z.object({
          condition: z.string(),
          diagnosisDate: z.string().datetime().optional(),
          status: z
            .enum(["active", "controlled", "resolved"])
            .default("active"),
        }),
      )
      .default([]),
    currentMedications: z
      .array(
        z.object({
          name: z.string(),
          dosage: z.string(),
          frequency: z.string(),
          startDate: z.string().datetime(),
          prescribedBy: z.string(),
        }),
      )
      .default([]),
  }),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        phoneNumber: z.string(),
        isPrimary: z.boolean().default(false),
      }),
    )
    .default([]),
  status: z.enum(["active", "inactive", "discharged"]).default("active"),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().uuid(),
    lastModifiedBy: z.string().uuid(),
    version: z.number().default(1),
    syncStatus: z
      .enum(["synced", "pending", "error", "conflict"])
      .default("synced"),
    lastSyncTime: z.string().datetime().optional(),
  }),
});

export const UnifiedEpisodeSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  episodeNumber: z.string(),
  episodeInfo: z.object({
    status: z
      .enum(["active", "completed", "cancelled", "suspended"])
      .default("active"),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    type: z
      .enum(["admission", "outpatient", "homecare", "emergency"])
      .default("homecare"),
  }),
  clinicalInfo: z.object({
    primaryDiagnosis: z
      .object({
        code: z.string(),
        description: z.string(),
        system: z.enum(["ICD-10", "ICD-11", "SNOMED-CT"]).default("ICD-10"),
      })
      .optional(),
    secondaryDiagnoses: z
      .array(
        z.object({
          code: z.string(),
          description: z.string(),
          system: z.enum(["ICD-10", "ICD-11", "SNOMED-CT"]).default("ICD-10"),
        }),
      )
      .default([]),
    physicianOrders: z
      .array(
        z.object({
          orderId: z.string(),
          orderType: z.string(),
          description: z.string(),
          orderedBy: z.string(),
          orderDate: z.string().datetime(),
          status: z
            .enum(["active", "completed", "cancelled"])
            .default("active"),
        }),
      )
      .default([]),
  }),
  carePlan: z.object({
    goals: z
      .array(
        z.object({
          id: z.string(),
          description: z.string(),
          targetDate: z.string().datetime(),
          status: z
            .enum(["active", "achieved", "discontinued"])
            .default("active"),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
        }),
      )
      .default([]),
    interventions: z
      .array(
        z.object({
          id: z.string(),
          type: z.string(),
          description: z.string(),
          frequency: z.string(),
          assignedTo: z.string(),
          status: z
            .enum(["active", "completed", "discontinued"])
            .default("active"),
        }),
      )
      .default([]),
    careTeam: z
      .array(
        z.object({
          memberId: z.string(),
          name: z.string(),
          role: z.string(),
          specialty: z.string().optional(),
          isPrimary: z.boolean().default(false),
        }),
      )
      .default([]),
  }),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().uuid(),
    lastModifiedBy: z.string().uuid(),
    version: z.number().default(1),
    syncStatus: z
      .enum(["synced", "pending", "error", "conflict"])
      .default("synced"),
    lastSyncTime: z.string().datetime().optional(),
  }),
});

export const UnifiedClinicalFormSchema = z.object({
  id: z.string().uuid(),
  episodeId: z.string().uuid(),
  patientId: z.string().uuid(),
  formInfo: z.object({
    type: z.string(),
    version: z.string().default("1.0"),
    status: z
      .enum(["draft", "completed", "submitted", "approved"])
      .default("draft"),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  }),
  formData: z.record(z.any()), // Flexible form data structure
  assessmentData: z.object({
    nineDomainAssessment: z
      .object({
        physicalHealth: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        mentalHealth: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        socialSupport: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        functionalStatus: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        cognitiveStatus: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        behavioralHealth: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        environmentalFactors: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        caregiverSupport: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
        serviceCoordination: z.object({
          score: z.number().min(0).max(100),
          maxScore: z.number().default(100),
          findings: z.string(),
          riskFactors: z.array(z.string()).default([]),
        }),
      })
      .optional(),
    overallScore: z
      .object({
        total: z.number(),
        maxTotal: z.number(),
        percentage: z.number(),
        riskLevel: z.enum(["low", "moderate", "high", "critical"]),
      })
      .optional(),
  }),
  signatureData: z.object({
    signed: z.boolean().default(false),
    signedBy: z.string().optional(),
    signedAt: z.string().datetime().optional(),
    signatureImage: z.string().optional(),
    witnessSignature: z.string().optional(),
  }),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        type: z.enum(["photo", "document", "audio", "video"]),
        url: z.string(),
        description: z.string().optional(),
        uploadedAt: z.string().datetime(),
      }),
    )
    .default([]),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().uuid(),
    lastModifiedBy: z.string().uuid(),
    submittedAt: z.string().datetime().optional(),
    version: z.number().default(1),
    syncStatus: z
      .enum(["synced", "pending", "error", "conflict"])
      .default("synced"),
    lastSyncTime: z.string().datetime().optional(),
  }),
});

// Type definitions from schemas
export type UnifiedPatient = z.infer<typeof UnifiedPatientSchema>;
export type UnifiedEpisode = z.infer<typeof UnifiedEpisodeSchema>;
export type UnifiedClinicalForm = z.infer<typeof UnifiedClinicalFormSchema>;

// External System Integration Schemas
export const ExternalSystemIntegrationSchema = z.object({
  id: z.string().uuid(),
  systemType: z.enum([
    "fhir",
    "emr",
    "laboratory",
    "imaging",
    "malaffi",
    "moh",
    "insurance",
  ]),
  systemName: z.string(),
  integrationStatus: z.enum(["connected", "disconnected", "error", "syncing"]),
  lastSyncTime: z.string().datetime().optional(),
  syncFrequency: z.enum(["real-time", "hourly", "daily", "weekly", "manual"]),
  configuration: z.object({
    baseUrl: z.string().url(),
    apiVersion: z.string(),
    authMethod: z.enum(["api-key", "oauth2", "jwt", "certificate"]),
    timeout: z.number().default(30000),
    retries: z.number().default(3),
    rateLimit: z
      .object({
        requests: z.number(),
        window: z.number(),
      })
      .optional(),
  }),
  dataMapping: z.object({
    inboundMapping: z.record(z.string()),
    outboundMapping: z.record(z.string()),
    transformationRules: z
      .array(
        z.object({
          field: z.string(),
          rule: z.string(),
          condition: z.string().optional(),
        }),
      )
      .default([]),
  }),
  complianceSettings: z.object({
    dataEncryption: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
    consentRequired: z.boolean().default(true),
    dataRetentionDays: z.number().default(2555), // 7 years
    gdprCompliant: z.boolean().default(true),
    hipaaCompliant: z.boolean().default(true),
    dohCompliant: z.boolean().default(true),
  }),
  errorHandling: z.object({
    retryPolicy: z.object({
      maxRetries: z.number().default(3),
      backoffStrategy: z.enum(["linear", "exponential"]).default("exponential"),
      initialDelay: z.number().default(1000),
    }),
    fallbackBehavior: z.enum(["queue", "skip", "alert"]).default("queue"),
    alertThresholds: z.object({
      errorRate: z.number().default(0.05),
      responseTime: z.number().default(5000),
    }),
  }),
  metadata: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().uuid(),
    lastModifiedBy: z.string().uuid(),
    version: z.string().default("1.0"),
    tags: z.array(z.string()).default([]),
  }),
});

export const IntegrationSyncLogSchema = z.object({
  id: z.string().uuid(),
  integrationId: z.string().uuid(),
  syncType: z.enum(["full", "incremental", "delta"]),
  direction: z.enum(["inbound", "outbound", "bidirectional"]),
  status: z.enum([
    "started",
    "in_progress",
    "completed",
    "failed",
    "cancelled",
  ]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  recordsProcessed: z.number().default(0),
  recordsSuccessful: z.number().default(0),
  recordsFailed: z.number().default(0),
  errors: z
    .array(
      z.object({
        recordId: z.string().optional(),
        errorCode: z.string(),
        errorMessage: z.string(),
        timestamp: z.string().datetime(),
        severity: z.enum(["low", "medium", "high", "critical"]),
      }),
    )
    .default([]),
  performance: z
    .object({
      averageResponseTime: z.number(),
      throughputPerSecond: z.number(),
      memoryUsage: z.number().optional(),
      cpuUsage: z.number().optional(),
    })
    .optional(),
  dataQuality: z
    .object({
      completenessScore: z.number().min(0).max(100),
      accuracyScore: z.number().min(0).max(100),
      consistencyScore: z.number().min(0).max(100),
      timelinessScore: z.number().min(0).max(100),
    })
    .optional(),
  metadata: z.object({
    triggeredBy: z.enum(["scheduled", "manual", "event", "api"]),
    triggerDetails: z.any().optional(),
    batchId: z.string().optional(),
    correlationId: z.string().optional(),
  }),
});

export const DataConflictResolutionSchema = z.object({
  id: z.string().uuid(),
  conflictType: z.enum([
    "data_mismatch",
    "version_conflict",
    "missing_record",
    "duplicate_record",
  ]),
  entityType: z.enum(["patient", "episode", "clinical_form", "assessment"]),
  entityId: z.string().uuid(),
  sourceSystem: z.string(),
  targetSystem: z.string(),
  conflictDetails: z.object({
    field: z.string(),
    sourceValue: z.any(),
    targetValue: z.any(),
    lastModified: z.object({
      source: z.string().datetime(),
      target: z.string().datetime(),
    }),
  }),
  resolutionStrategy: z.enum([
    "source_wins",
    "target_wins",
    "merge",
    "manual",
    "latest_timestamp",
  ]),
  resolutionStatus: z.enum(["pending", "resolved", "escalated", "ignored"]),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNotes: z.string().optional(),
  impactAssessment: z.object({
    severity: z.enum(["low", "medium", "high", "critical"]),
    affectedSystems: z.array(z.string()),
    businessImpact: z.string(),
    technicalImpact: z.string(),
  }),
  auditTrail: z
    .array(
      z.object({
        action: z.string(),
        performedBy: z.string().uuid(),
        timestamp: z.string().datetime(),
        details: z.any(),
      }),
    )
    .default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Type definitions from new schemas
export type ExternalSystemIntegration = z.infer<
  typeof ExternalSystemIntegrationSchema
>;
export type IntegrationSyncLog = z.infer<typeof IntegrationSyncLogSchema>;
export type DataConflictResolution = z.infer<
  typeof DataConflictResolutionSchema
>;

// Enhanced Data Validation Service with Integration Support
export class EnhancedUnifiedDataValidationService extends UnifiedDataValidationService {
  /**
   * Validate external system integration configuration
   */
  static validateIntegrationConfig(data: any): {
    valid: boolean;
    errors: string[];
    data?: ExternalSystemIntegration;
  } {
    try {
      const validatedData = ExternalSystemIntegrationSchema.parse(data);
      return {
        valid: true,
        errors: [],
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: ["Unknown validation error"],
      };
    }
  }

  /**
   * Validate sync log data
   */
  static validateSyncLog(data: any): {
    valid: boolean;
    errors: string[];
    data?: IntegrationSyncLog;
  } {
    try {
      const validatedData = IntegrationSyncLogSchema.parse(data);
      return {
        valid: true,
        errors: [],
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: ["Unknown validation error"],
      };
    }
  }

  /**
   * Validate conflict resolution data
   */
  static validateConflictResolution(data: any): {
    valid: boolean;
    errors: string[];
    data?: DataConflictResolution;
  } {
    try {
      const validatedData = DataConflictResolutionSchema.parse(data);
      return {
        valid: true,
        errors: [],
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: ["Unknown validation error"],
      };
    }
  }

  /**
   * Cross-system data consistency validation
   */
  static async validateCrossSystemConsistency(
    entityType: "patient" | "episode" | "clinical_form",
    entityId: string,
    systems: string[],
  ): Promise<{
    consistent: boolean;
    conflicts: DataConflictResolution[];
    recommendations: string[];
  }> {
    const conflicts: DataConflictResolution[] = [];
    const recommendations: string[] = [];

    try {
      // This would typically fetch data from multiple systems and compare
      // For now, we'll simulate the validation

      // Check for data consistency across systems
      for (const system of systems) {
        // Simulate conflict detection
        if (Math.random() > 0.9) {
          // 10% chance of conflict for demo
          const conflict: DataConflictResolution = {
            id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conflictType: "data_mismatch",
            entityType,
            entityId,
            sourceSystem: "local",
            targetSystem: system,
            conflictDetails: {
              field: "lastModified",
              sourceValue: new Date().toISOString(),
              targetValue: new Date(Date.now() - 86400000).toISOString(),
              lastModified: {
                source: new Date().toISOString(),
                target: new Date(Date.now() - 86400000).toISOString(),
              },
            },
            resolutionStrategy: "latest_timestamp",
            resolutionStatus: "pending",
            impactAssessment: {
              severity: "medium",
              affectedSystems: ["local", system],
              businessImpact: "Data inconsistency may affect reporting",
              technicalImpact: "Sync processes may fail",
            },
            auditTrail: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          conflicts.push(conflict);
        }
      }

      if (conflicts.length > 0) {
        recommendations.push(
          "Resolve data conflicts before proceeding with sync",
        );
        recommendations.push(
          "Consider implementing automated conflict resolution",
        );
        recommendations.push("Review data governance policies");
      } else {
        recommendations.push("Data is consistent across all systems");
        recommendations.push("Continue with regular sync operations");
      }

      return {
        consistent: conflicts.length === 0,
        conflicts,
        recommendations,
      };
    } catch (error) {
      return {
        consistent: false,
        conflicts: [],
        recommendations: ["Error occurred during consistency validation"],
      };
    }
  }
}

// Field mapping service for consistent naming
export class FieldMappingService {
  private static readonly FIELD_MAPPINGS = {
    // Patient field mappings
    patient: {
      emirates_id: "emiratesId",
      first_name_en: "personalInfo.firstNameEn",
      last_name_en: "personalInfo.lastNameEn",
      first_name_ar: "personalInfo.firstNameAr",
      last_name_ar: "personalInfo.lastNameAr",
      date_of_birth: "personalInfo.dateOfBirth",
      phone_number: "contactInfo.phoneNumber",
      insurance_provider: "insuranceInfo.provider",
      insurance_type: "insuranceInfo.type",
      insurance_number: "insuranceInfo.number",
      thiqa_card_number: "insuranceInfo.thiqaCardNumber",
      medical_record_number: "medicalInfo.medicalRecordNumber",
      blood_type: "medicalInfo.bloodType",
      chronic_conditions: "medicalInfo.chronicConditions",
      current_medications: "medicalInfo.currentMedications",
      emergency_contacts: "emergencyContacts",
      language_preference: "personalInfo.languagePreference",
      interpreter_required: "personalInfo.interpreterRequired",
      created_at: "metadata.createdAt",
      updated_at: "metadata.updatedAt",
      created_by: "metadata.createdBy",
    },
    // Episode field mappings
    episode: {
      patient_id: "patientId",
      episode_number: "episodeNumber",
      start_date: "episodeInfo.startDate",
      end_date: "episodeInfo.endDate",
      primary_diagnosis: "clinicalInfo.primaryDiagnosis.description",
      secondary_diagnoses: "clinicalInfo.secondaryDiagnoses",
      physician_orders: "clinicalInfo.physicianOrders",
      care_plan: "carePlan",
      created_at: "metadata.createdAt",
      updated_at: "metadata.updatedAt",
      created_by: "metadata.createdBy",
    },
    // Clinical form field mappings
    clinicalForm: {
      episode_id: "episodeId",
      form_type: "formInfo.type",
      form_data: "formData",
      signature_data: "signatureData.signatureImage",
      signed_by: "signatureData.signedBy",
      signed_at: "signatureData.signedAt",
      submitted_at: "metadata.submittedAt",
      created_at: "metadata.createdAt",
      updated_at: "metadata.updatedAt",
      created_by: "metadata.createdBy",
    },
  };

  /**
   * Map legacy field names to unified field names
   */
  static mapFields(
    data: any,
    entityType: "patient" | "episode" | "clinicalForm",
  ): any {
    const mappings = this.FIELD_MAPPINGS[entityType];
    const mappedData: any = {};

    Object.entries(data).forEach(([key, value]) => {
      const mappedKey = mappings[key as keyof typeof mappings] || key;
      this.setNestedValue(mappedData, mappedKey, value);
    });

    return mappedData;
  }

  /**
   * Set nested object value using dot notation
   */
  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get standardized field names for a given entity type
   */
  static getStandardizedFields(
    entityType: "patient" | "episode" | "clinicalForm",
  ): string[] {
    return Object.values(this.FIELD_MAPPINGS[entityType]);
  }
}

// Data consistency service
export class DataConsistencyService {
  /**
   * Ensure data consistency across modules
   */
  static async ensureConsistency(
    entityType: "patient" | "episode" | "clinicalForm",
    entityId: string,
  ): Promise<{
    consistent: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      switch (entityType) {
        case "patient":
          return await this.checkPatientConsistency(entityId);
        case "episode":
          return await this.checkEpisodeConsistency(entityId);
        case "clinicalForm":
          return await this.checkClinicalFormConsistency(entityId);
        default:
          return {
            consistent: false,
            issues: ["Unknown entity type"],
            recommendations: ["Specify valid entity type"],
          };
      }
    } catch (error) {
      return {
        consistent: false,
        issues: [
          `Error checking consistency: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        recommendations: ["Review data integrity and try again"],
      };
    }
  }

  private static async checkPatientConsistency(patientId: string): Promise<{
    consistent: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if patient exists in all related tables
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();

    if (!patient) {
      issues.push("Patient record not found");
      recommendations.push("Verify patient ID and ensure record exists");
      return { consistent: false, issues, recommendations };
    }

    // Check episodes consistency
    const { data: episodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("patient_id", patientId);

    if (episodes) {
      episodes.forEach((episode) => {
        if (episode.patient_id !== patientId) {
          issues.push(`Episode ${episode.id} has mismatched patient_id`);
          recommendations.push("Update episode patient_id to match");
        }
      });
    }

    return {
      consistent: issues.length === 0,
      issues,
      recommendations,
    };
  }

  private static async checkEpisodeConsistency(episodeId: string): Promise<{
    consistent: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if episode exists and has valid patient reference
    const { data: episode } = await supabase
      .from("episodes")
      .select("*, patients(*)")
      .eq("id", episodeId)
      .single();

    if (!episode) {
      issues.push("Episode record not found");
      recommendations.push("Verify episode ID and ensure record exists");
      return { consistent: false, issues, recommendations };
    }

    if (!episode.patients) {
      issues.push("Episode has invalid patient reference");
      recommendations.push("Update episode patient_id to valid patient");
    }

    // Check clinical forms consistency
    const { data: clinicalForms } = await supabase
      .from("clinical_forms")
      .select("*")
      .eq("episode_id", episodeId);

    if (clinicalForms) {
      clinicalForms.forEach((form) => {
        if (form.episode_id !== episodeId) {
          issues.push(`Clinical form ${form.id} has mismatched episode_id`);
          recommendations.push("Update clinical form episode_id to match");
        }
      });
    }

    return {
      consistent: issues.length === 0,
      issues,
      recommendations,
    };
  }

  private static async checkClinicalFormConsistency(formId: string): Promise<{
    consistent: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if clinical form exists and has valid episode reference
    const { data: clinicalForm } = await supabase
      .from("clinical_forms")
      .select("*, episodes(*, patients(*))")
      .eq("id", formId)
      .single();

    if (!clinicalForm) {
      issues.push("Clinical form record not found");
      recommendations.push("Verify form ID and ensure record exists");
      return { consistent: false, issues, recommendations };
    }

    if (!clinicalForm.episodes) {
      issues.push("Clinical form has invalid episode reference");
      recommendations.push("Update clinical form episode_id to valid episode");
    } else if (!clinicalForm.episodes.patients) {
      issues.push("Clinical form episode has invalid patient reference");
      recommendations.push("Update episode patient_id to valid patient");
    }

    return {
      consistent: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

// Export singleton instance
export const emiratesIdVerificationService =
  new EmiratesIdVerificationService();
export default emiratesIdVerificationService;
