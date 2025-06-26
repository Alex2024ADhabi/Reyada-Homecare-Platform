import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
// Error handler service is now integrated into this file

// Enhanced Supabase configuration with robust environment variable handling
const getEnvironmentVariable = (key: string): string | undefined => {
  // Check process.env first (Node.js environment)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Check import.meta.env (Vite environment)
  if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // Check window environment variables (runtime)
  if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
    return (window as any).env[key];
  }
  
  return undefined;
};

const supabaseUrl = getEnvironmentVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvironmentVariable('VITE_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getEnvironmentVariable('VITE_SUPABASE_SERVICE_ROLE_KEY');

// Enhanced validation with fallback configuration
if (!supabaseUrl) {
  console.error(
    "❌ VITE_SUPABASE_URL is not set. Please add it to your environment variables.",
  );
  // In development, provide helpful guidance
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info("💡 For development, ensure your .env file contains VITE_SUPABASE_URL");
  }
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  console.error(
    "❌ VITE_SUPABASE_ANON_KEY is not set. Please add it to your environment variables.",
  );
  // In development, provide helpful guidance
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info("💡 For development, ensure your .env file contains VITE_SUPABASE_ANON_KEY");
  }
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

// Service role key is optional but recommended for admin operations
if (!supabaseServiceRoleKey) {
  console.warn(
    "⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations may be limited.",
  );
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info("💡 Add VITE_SUPABASE_SERVICE_ROLE_KEY for full admin functionality");
  }
}

console.log("✅ Supabase configuration validated:", {
  url: supabaseUrl.substring(0, 30) + "...",
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceRoleKey,
});

// Create Supabase client with enhanced configuration
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "X-Client-Info": "reyada-homecare-platform",
      },
    },
  },
);

// Type definitions for our healthcare platform
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Patient types
export type Patient = Tables<"patients">;
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

// Episode types
export type Episode = Tables<"episodes">;
export type EpisodeInsert = Database["public"]["Tables"]["episodes"]["Insert"];
export type EpisodeUpdate = Database["public"]["Tables"]["episodes"]["Update"];

// Clinical form types
export type ClinicalForm = Tables<"clinical_forms">;
export type ClinicalFormInsert =
  Database["public"]["Tables"]["clinical_forms"]["Insert"];
export type ClinicalFormUpdate =
  Database["public"]["Tables"]["clinical_forms"]["Update"];

// User profile types
export type UserProfile = Tables<"user_profiles">;
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profiles"]["Insert"];
export type UserProfileUpdate =
  Database["public"]["Tables"]["user_profiles"]["Update"];

// Enhanced Error Handling and Logging Framework - P1-007
export class ErrorHandlingService {
  private static logError(error: any, context: string, metadata?: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
      metadata,
      severity: this.determineSeverity(error),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Log:', errorLog);
    }

    // In production, send to logging service
    this.sendToLoggingService(errorLog);
  }

  private static determineSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.code?.includes('auth') || error.code?.includes('security')) {
      return 'critical';
    }
    if (error.code?.includes('database') || error.code?.includes('connection')) {
      return 'high';
    }
    if (error.code?.includes('validation')) {
      return 'medium';
    }
    return 'low';
  }

  private static async sendToLoggingService(errorLog: any) {
    try {
      // Insert into security_audit_log table
      await supabase.from('security_audit_log').insert({
        event_type: 'application_error',
        event_category: 'system_event',
        severity: errorLog.severity,
        event_details: errorLog,
        created_at: new Date().toISOString(),
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  static handleApiError(error: any, context: string, metadata?: any) {
    this.logError(error, context, metadata);
    
    // Return sanitized error for client
    return {
      message: this.getSafeErrorMessage(error),
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
    };
  }

  private static getSafeErrorMessage(error: any): string {
    // Don't expose sensitive information in error messages
    const safeMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Invalid credentials',
      'auth/wrong-password': 'Invalid credentials',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'database/connection-error': 'Service temporarily unavailable',
    };

    return safeMessages[error.code] || 'An unexpected error occurred';
  }
}

// Emirates ID Integration Service - P2-001
export class EmiratesIdService {
  // Verify Emirates ID format
  static validateEmiratesIdFormat(emiratesId: string): boolean {
    // Emirates ID format: 784-YYYY-XXXXXXX-X
    const emiratesIdRegex = /^784-\d{4}-\d{7}-\d{1}$/;
    return emiratesIdRegex.test(emiratesId);
  }

  // Extract information from Emirates ID
  static extractEmiratesIdInfo(emiratesId: string) {
    if (!this.validateEmiratesIdFormat(emiratesId)) {
      throw new Error('Invalid Emirates ID format');
    }

    const parts = emiratesId.split('-');
    const birthYear = parts[1];
    const serialNumber = parts[2];
    const checkDigit = parts[3];

    // Extract gender from serial number (odd = male, even = female)
    const lastDigit = parseInt(serialNumber.slice(-1));
    const gender = lastDigit % 2 === 1 ? 'Male' : 'Female';

    return {
      birthYear: parseInt(birthYear),
      serialNumber,
      checkDigit: parseInt(checkDigit),
      gender,
      isValid: true
    };
  }

  // Simulate Emirates ID verification with external service
  static async verifyEmiratesId(emiratesId: string) {
    try {
      // Validate format first
      if (!this.validateEmiratesIdFormat(emiratesId)) {
        return {
          isValid: false,
          error: 'Invalid Emirates ID format',
          data: null
        };
      }

      // Extract basic info
      const basicInfo = this.extractEmiratesIdInfo(emiratesId);

      // Simulate API call to Emirates ID verification service
      // In production, this would call the actual UAE government API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Mock verification response
      const mockVerificationData = {
        emiratesId,
        fullNameEn: 'Ahmed Mohammed Al-Mansoori',
        fullNameAr: 'أحمد محمد المنصوري',
        dateOfBirth: `${basicInfo.birthYear}-03-15`,
        gender: basicInfo.gender,
        nationality: 'UAE',
        cardExpiryDate: '2029-12-31',
        isActive: true,
        address: {
          emirate: 'Dubai',
          area: 'Al Wasl',
          building: 'Villa 123',
          street: 'Al Wasl Road'
        },
        photo: null // In production, this would contain the photo data
      };

      return {
        isValid: true,
        error: null,
        data: mockVerificationData
      };
    } catch (error) {
      return {
        isValid: false,
        error: ErrorHandlingService.handleApiError(error, 'EmiratesIdService.verifyEmiratesId'),
        data: null
      };
    }
  }

  // Store Emirates ID verification result
  static async storeVerificationResult(patientId: string, verificationData: any) {
    try {
      const { error } = await supabase
        .from('emirates_id_verifications')
        .insert({
          patient_id: patientId,
          emirates_id: verificationData.emiratesId,
          verification_status: 'verified',
          verification_data: verificationData,
          verified_at: new Date().toISOString(),
          expires_at: verificationData.cardExpiryDate
        });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: ErrorHandlingService.handleApiError(error, 'EmiratesIdService.storeVerificationResult')
      };
    }
  }

  // Get verification history for a patient
  static async getVerificationHistory(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('emirates_id_verifications')
        .select('*')
        .eq('patient_id', patientId)
        .order('verified_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'EmiratesIdService.getVerificationHistory')
      };
    }
  }

  // Scan Emirates ID using camera/OCR (mock implementation)
  static async scanEmiratesId(imageData: string | File) {
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock OCR result
      const mockOcrResult = {
        emiratesId: '784-1990-1234567-1',
        confidence: 0.95,
        extractedText: {
          nameEn: 'AHMED MOHAMMED AL-MANSOORI',
          nameAr: 'أحمد محمد المنصوري',
          dateOfBirth: '15/03/1990',
          gender: 'M',
          nationality: 'ARE',
          cardNumber: '784-1990-1234567-1',
          expiryDate: '31/12/2029'
        },
        boundingBoxes: {
          emiratesId: { x: 100, y: 150, width: 200, height: 30 },
          name: { x: 100, y: 200, width: 300, height: 25 },
          dateOfBirth: { x: 100, y: 250, width: 150, height: 25 }
        }
      };

      return {
        success: true,
        data: mockOcrResult,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'EmiratesIdService.scanEmiratesId')
      };
    }
  }
}

// Insurance Verification Service - P2-002
export class InsuranceVerificationService {
  // Verify insurance coverage with provider
  static async verifyInsuranceCoverage(insuranceData: {
    policyNumber: string;
    provider: string;
    membershipNumber?: string;
    patientId: string;
  }) {
    try {
      // Simulate API call to insurance provider
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay

      // Mock verification response based on provider
      const mockVerificationData = {
        policyNumber: insuranceData.policyNumber,
        provider: insuranceData.provider,
        membershipNumber: insuranceData.membershipNumber,
        isActive: true,
        coverageDetails: {
          homeHealthcare: {
            covered: true,
            copayAmount: 50,
            deductible: 200,
            maxVisitsPerYear: 100,
            preAuthRequired: insuranceData.provider === 'DAMAN'
          },
          physiotherapy: {
            covered: true,
            sessionsPerYear: 24,
            copayAmount: 30
          },
          medicalEquipment: {
            covered: true,
            preAuthRequired: true,
            coveragePercentage: 80
          }
        },
        eligibilityStatus: 'ACTIVE',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        primaryCarePhysician: 'Dr. Ahmed Al-Rashid',
        groupNumber: 'GRP-12345',
        planType: 'Premium Health Plan'
      };

      return {
        isValid: true,
        error: null,
        data: mockVerificationData
      };
    } catch (error) {
      return {
        isValid: false,
        error: ErrorHandlingService.handleApiError(error, 'InsuranceVerificationService.verifyInsuranceCoverage'),
        data: null
      };
    }
  }

  // Get real-time eligibility check
  static async checkEligibility(policyNumber: string, provider: string, serviceType: string) {
    try {
      // Simulate real-time eligibility check
      await new Promise(resolve => setTimeout(resolve, 2000));

      const eligibilityResponse = {
        eligible: true,
        serviceType,
        authorizationRequired: provider === 'DAMAN' || serviceType === 'medical_equipment',
        copayAmount: serviceType === 'homecare' ? 50 : 30,
        remainingBenefits: {
          visits: 85,
          sessions: 20,
          equipmentAllowance: 5000
        },
        priorAuthNumber: provider === 'DAMAN' ? 'PA-' + Math.random().toString(36).substring(2, 10).toUpperCase() : null
      };

      return {
        success: true,
        data: eligibilityResponse,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'InsuranceVerificationService.checkEligibility')
      };
    }
  }

  // Store insurance verification result
  static async storeVerificationResult(patientId: string, verificationData: any) {
    try {
      const { error } = await supabase
        .from('insurance_verifications')
        .insert({
          patient_id: patientId,
          policy_number: verificationData.policyNumber,
          provider: verificationData.provider,
          verification_status: 'verified',
          verification_data: verificationData,
          verified_at: new Date().toISOString(),
          expires_at: verificationData.expirationDate
        });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: ErrorHandlingService.handleApiError(error, 'InsuranceVerificationService.storeVerificationResult')
      };
    }
  }

  // Get verification history for a patient
  static async getVerificationHistory(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('insurance_verifications')
        .select('*')
        .eq('patient_id', patientId)
        .order('verified_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'InsuranceVerificationService.getVerificationHistory')
      };
    }
  }

  // Validate insurance card using OCR (mock implementation)
  static async scanInsuranceCard(imageData: string | File) {
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock OCR result
      const mockOcrResult = {
        policyNumber: 'POL-123456789',
        membershipNumber: 'MEM-987654321',
        provider: 'DAMAN',
        memberName: 'Ahmed Mohammed Al-Mansoori',
        groupNumber: 'GRP-12345',
        effectiveDate: '01/01/2024',
        expirationDate: '31/12/2024',
        confidence: 0.92,
        extractedText: {
          policyNumber: 'POL-123456789',
          membershipNumber: 'MEM-987654321',
          provider: 'DAMAN',
          memberName: 'AHMED MOHAMMED AL-MANSOORI',
          groupNumber: 'GRP-12345'
        },
        boundingBoxes: {
          policyNumber: { x: 150, y: 200, width: 200, height: 30 },
          memberName: { x: 150, y: 250, width: 300, height: 25 },
          provider: { x: 150, y: 100, width: 150, height: 25 }
        }
      };

      return {
        success: true,
        data: mockOcrResult,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'InsuranceVerificationService.scanInsuranceCard')
      };
    }
  }

  // Get supported insurance providers
  static getSupportedProviders() {
    return [
      { code: 'DAMAN', name: 'Daman Health Insurance', requiresPreAuth: true },
      { code: 'ADNIC', name: 'Abu Dhabi National Insurance Company', requiresPreAuth: false },
      { code: 'OMAN', name: 'Oman Insurance Company', requiresPreAuth: false },
      { code: 'ORIENT', name: 'Orient Insurance', requiresPreAuth: false },
      { code: 'SALAMA', name: 'Islamic Arab Insurance Company (Salama)', requiresPreAuth: false },
      { code: 'UNION', name: 'Union Insurance', requiresPreAuth: false },
      { code: 'METHAQ', name: 'Methaq Takaful Insurance', requiresPreAuth: true },
      { code: 'WATANIA', name: 'Watania International', requiresPreAuth: false }
    ];
  }

  // Check if pre-authorization is required
  static requiresPreAuthorization(provider: string, serviceType: string) {
    const preAuthProviders = ['DAMAN', 'METHAQ'];
    const preAuthServices = ['medical_equipment', 'specialized_therapy'];
    
    return preAuthProviders.includes(provider) || preAuthServices.includes(serviceType);
  }
}

// Patient Consent Management Service - P2-008
export class PatientConsentService {
  // Create new consent record
  static async createConsent(consentData: {
    patientId: string;
    consentType: string;
    consentCategory: string;
    consentText: string;
    isRequired: boolean;
    expiresAt?: string;
    metadata?: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('patient_consents')
        .insert({
          patient_id: consentData.patientId,
          consent_type: consentData.consentType,
          consent_category: consentData.consentCategory,
          consent_text: consentData.consentText,
          is_required: consentData.isRequired,
          status: 'pending',
          expires_at: consentData.expiresAt,
          metadata: consentData.metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.createConsent')
      };
    }
  }

  // Record consent decision (accept/decline)
  static async recordConsentDecision(consentId: string, decision: {
    status: 'accepted' | 'declined';
    signedBy: string;
    signatureData?: string;
    witnessName?: string;
    witnessSignature?: string;
    decisionReason?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('patient_consents')
        .update({
          status: decision.status,
          signed_by: decision.signedBy,
          signature_data: decision.signatureData,
          witness_name: decision.witnessName,
          witness_signature: decision.witnessSignature,
          decision_reason: decision.decisionReason,
          signed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', consentId)
        .select()
        .single();

      if (error) throw error;

      // Log consent decision in audit trail
      await this.logConsentAudit(consentId, decision.status, decision.signedBy);

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.recordConsentDecision')
      };
    }
  }

  // Get patient consents
  static async getPatientConsents(patientId: string, filters?: {
    consentType?: string;
    status?: string;
    includeExpired?: boolean;
  }) {
    try {
      let queryBuilder = supabase
        .from('patient_consents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (filters?.consentType) {
        queryBuilder = queryBuilder.eq('consent_type', filters.consentType);
      }

      if (filters?.status) {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }

      if (!filters?.includeExpired) {
        queryBuilder = queryBuilder.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.getPatientConsents')
      };
    }
  }

  // Check if specific consent is valid
  static async checkConsentValidity(patientId: string, consentType: string) {
    try {
      const { data, error } = await supabase
        .from('patient_consents')
        .select('*')
        .eq('patient_id', patientId)
        .eq('consent_type', consentType)
        .eq('status', 'accepted')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('signed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      const isValid = !!data;
      const expiresAt = data?.expires_at;
      const signedAt = data?.signed_at;

      return {
        isValid,
        consent: data,
        expiresAt,
        signedAt,
        error: null
      };
    } catch (error) {
      return {
        isValid: false,
        consent: null,
        expiresAt: null,
        signedAt: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.checkConsentValidity')
      };
    }
  }

  // Revoke consent
  static async revokeConsent(consentId: string, revokedBy: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('patient_consents')
        .update({
          status: 'revoked',
          revoked_by: revokedBy,
          revoked_at: new Date().toISOString(),
          revocation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', consentId)
        .select()
        .single();

      if (error) throw error;

      // Log consent revocation in audit trail
      await this.logConsentAudit(consentId, 'revoked', revokedBy, reason);

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.revokeConsent')
      };
    }
  }

  // Get consent audit trail
  static async getConsentAuditTrail(consentId: string) {
    try {
      const { data, error } = await supabase
        .from('consent_audit_log')
        .select('*')
        .eq('consent_id', consentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.getConsentAuditTrail')
      };
    }
  }

  // Generate consent form PDF
  static async generateConsentPDF(consentId: string) {
    try {
      // Get consent details
      const { data: consent, error: consentError } = await supabase
        .from('patient_consents')
        .select(`
          *,
          patients (
            first_name_en,
            last_name_en,
            emirates_id,
            date_of_birth
          )
        `)
        .eq('id', consentId)
        .single();

      if (consentError) throw consentError;

      // Mock PDF generation - in production, use a PDF library
      const pdfData = {
        consentId,
        patientName: `${consent.patients.first_name_en} ${consent.patients.last_name_en}`,
        emiratesId: consent.patients.emirates_id,
        consentType: consent.consent_type,
        consentText: consent.consent_text,
        status: consent.status,
        signedAt: consent.signed_at,
        signedBy: consent.signed_by,
        witnessName: consent.witness_name,
        generatedAt: new Date().toISOString()
      };

      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        pdfUrl: `https://storage.example.com/consents/${consentId}.pdf`,
        pdfData,
        error: null
      };
    } catch (error) {
      return {
        pdfUrl: null,
        pdfData: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.generateConsentPDF')
      };
    }
  }

  // Get required consents for patient
  static async getRequiredConsents(patientId: string, serviceType?: string) {
    try {
      // Define required consents based on service type
      const requiredConsents = {
        'homecare': [
          {
            type: 'treatment_consent',
            category: 'medical',
            text: 'I consent to receive home healthcare services including medical treatment, nursing care, and therapy services as prescribed by my physician.',
            isRequired: true
          },
          {
            type: 'privacy_consent',
            category: 'privacy',
            text: 'I consent to the collection, use, and disclosure of my personal health information for the purpose of providing healthcare services.',
            isRequired: true
          },
          {
            type: 'emergency_contact',
            category: 'emergency',
            text: 'I authorize healthcare providers to contact my designated emergency contacts in case of medical emergencies.',
            isRequired: true
          }
        ],
        'therapy': [
          {
            type: 'therapy_consent',
            category: 'medical',
            text: 'I consent to receive physical therapy, occupational therapy, and/or speech therapy services as prescribed.',
            isRequired: true
          },
          {
            type: 'equipment_consent',
            category: 'equipment',
            text: 'I consent to the use of medical equipment and devices during therapy sessions.',
            isRequired: false
          }
        ],
        'medication': [
          {
            type: 'medication_consent',
            category: 'medical',
            text: 'I consent to the administration of prescribed medications by qualified healthcare professionals.',
            isRequired: true
          },
          {
            type: 'medication_storage',
            category: 'safety',
            text: 'I understand and consent to the proper storage and handling requirements for my medications.',
            isRequired: true
          }
        ]
      };

      const consentsToCheck = serviceType ? requiredConsents[serviceType] || [] : requiredConsents['homecare'];
      
      // Check existing consents
      const { data: existingConsents } = await this.getPatientConsents(patientId);
      const existingConsentTypes = existingConsents?.map(c => c.consent_type) || [];

      // Filter out already obtained consents
      const missingConsents = consentsToCheck.filter(consent => 
        !existingConsentTypes.includes(consent.type)
      );

      return {
        requiredConsents: consentsToCheck,
        missingConsents,
        existingConsents: existingConsents || [],
        error: null
      };
    } catch (error) {
      return {
        requiredConsents: [],
        missingConsents: [],
        existingConsents: [],
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.getRequiredConsents')
      };
    }
  }

  // Bulk create required consents
  static async createRequiredConsents(patientId: string, serviceType: string) {
    try {
      const { missingConsents } = await this.getRequiredConsents(patientId, serviceType);
      
      const consentPromises = missingConsents.map(consent => 
        this.createConsent({
          patientId,
          consentType: consent.type,
          consentCategory: consent.category,
          consentText: consent.text,
          isRequired: consent.isRequired
        })
      );

      const results = await Promise.all(consentPromises);
      const successful = results.filter(r => !r.error).map(r => r.data);
      const failed = results.filter(r => r.error);

      return {
        created: successful,
        failed,
        totalCreated: successful.length,
        error: failed.length > 0 ? failed[0].error : null
      };
    } catch (error) {
      return {
        created: [],
        failed: [],
        totalCreated: 0,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.createRequiredConsents')
      };
    }
  }

  // Private method to log consent audit
  private static async logConsentAudit(consentId: string, action: string, performedBy: string, notes?: string) {
    try {
      await supabase.from('consent_audit_log').insert({
        consent_id: consentId,
        action,
        performed_by: performedBy,
        notes,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log consent audit:', error);
    }
  }

  // Validate consent signature
  static async validateSignature(signatureData: string, patientId: string) {
    try {
      // Mock signature validation - in production, use proper signature verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation checks
      const isValidFormat = signatureData.startsWith('data:image/');
      const hasMinimumLength = signatureData.length > 100;
      
      const validationResult = {
        isValid: isValidFormat && hasMinimumLength,
        confidence: Math.random() * 0.3 + 0.7, // Mock confidence score 0.7-1.0
        timestamp: new Date().toISOString(),
        validationMethod: 'digital_signature_analysis'
      };

      return {
        validation: validationResult,
        error: null
      };
    } catch (error) {
      return {
        validation: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.validateSignature')
      };
    }
  }

  // Get consent statistics
  static async getConsentStatistics(patientId?: string) {
    try {
      let queryBuilder = supabase.from('patient_consents').select('status, consent_type, created_at');
      
      if (patientId) {
        queryBuilder = queryBuilder.eq('patient_id', patientId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      const stats = {
        total: data.length,
        accepted: data.filter(c => c.status === 'accepted').length,
        declined: data.filter(c => c.status === 'declined').length,
        pending: data.filter(c => c.status === 'pending').length,
        revoked: data.filter(c => c.status === 'revoked').length,
        byType: data.reduce((acc, consent) => {
          acc[consent.consent_type] = (acc[consent.consent_type] || 0) + 1;
          return acc;
        }, {}),
        recentActivity: data
          .filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .length
      };

      return { stats, error: null };
    } catch (error) {
      return {
        stats: null,
        error: ErrorHandlingService.handleApiError(error, 'PatientConsentService.getConsentStatistics')
      };
    }
  }
}

// Multi-Factor Authentication Service - P1-003
export class MFAService {
  // Generate TOTP secret for user
  static async generateTOTPSecret(userId: string) {
    try {
      const secret = this.generateRandomSecret();
      const qrCodeUrl = this.generateQRCodeUrl(secret, userId);
      
      // Store encrypted secret in user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          mfa_secret: secret, // In production, this should be encrypted
          mfa_enabled: false // Will be enabled after verification
        })
        .eq('id', userId);

      if (error) throw error;
      
      return { secret, qrCodeUrl, error: null };
    } catch (error) {
      return {
        secret: null,
        qrCodeUrl: null,
        error: ErrorHandlingService.handleApiError(error, 'MFAService.generateTOTPSecret'),
      };
    }
  }

  // Verify TOTP code
  static async verifyTOTP(userId: string, code: string) {
    try {
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('mfa_secret')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user.mfa_secret) throw new Error('MFA not configured');

      const isValid = this.validateTOTPCode(user.mfa_secret, code);
      
      if (isValid) {
        // Enable MFA if this is the first successful verification
        await supabase
          .from('user_profiles')
          .update({ mfa_enabled: true })
          .eq('id', userId);
      }

      return { isValid, error: null };
    } catch (error) {
      return {
        isValid: false,
        error: ErrorHandlingService.handleApiError(error, 'MFAService.verifyTOTP'),
      };
    }
  }

  // Generate backup codes
  static async generateBackupCodes(userId: string) {
    try {
      const codes = Array.from({ length: 10 }, () => this.generateBackupCode());
      
      // Store hashed backup codes
      const hashedCodes = codes.map(code => this.hashBackupCode(code));
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          backup_codes: hashedCodes,
        })
        .eq('id', userId);

      if (error) throw error;
      
      return { codes, error: null };
    } catch (error) {
      return {
        codes: null,
        error: ErrorHandlingService.handleApiError(error, 'MFAService.generateBackupCodes'),
      };
    }
  }

  private static generateRandomSecret(): string {
    // Generate a 32-character base32 secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private static generateQRCodeUrl(secret: string, userId: string): string {
    const issuer = 'Reyada Homecare Platform';
    const label = `${issuer}:${userId}`;
    return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }

  private static validateTOTPCode(secret: string, code: string): boolean {
    // Simplified TOTP validation - in production use a proper TOTP library
    const timeStep = Math.floor(Date.now() / 1000 / 30);
    const expectedCode = this.generateTOTPCode(secret, timeStep);
    return code === expectedCode;
  }

  private static generateTOTPCode(secret: string, timeStep: number): string {
    // Simplified TOTP generation - in production use a proper TOTP library
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  private static generateBackupCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private static hashBackupCode(code: string): string {
    // In production, use proper hashing like bcrypt
    return btoa(code);
  }
}

// Backup and Recovery Service - P1-008
export class BackupRecoveryService {
  // Initiate backup
  static async initiateBackup(backupType: 'full' | 'incremental' | 'differential', userId: string) {
    try {
      const backupId = crypto.randomUUID();
      const backupLocation = `backups/${backupType}/${new Date().toISOString().split('T')[0]}/${backupId}`;
      
      // Create backup metadata record
      const { data, error } = await supabase
        .from('backup_metadata')
        .insert({
          id: backupId,
          backup_type: backupType,
          backup_status: 'in_progress',
          backup_location: backupLocation,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // In production, trigger actual backup process
      this.performBackup(backupId, backupType, backupLocation);
      
      return { backupId, error: null };
    } catch (error) {
      return {
        backupId: null,
        error: ErrorHandlingService.handleApiError(error, 'BackupRecoveryService.initiateBackup'),
      };
    }
  }

  // Get backup status
  static async getBackupStatus(backupId: string) {
    try {
      const { data, error } = await supabase
        .from('backup_metadata')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'BackupRecoveryService.getBackupStatus'),
      };
    }
  }

  // List available backups
  static async listBackups(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('backup_metadata')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, 'BackupRecoveryService.listBackups'),
      };
    }
  }

  private static async performBackup(backupId: string, backupType: string, backupLocation: string) {
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Update backup status
      await supabase
        .from('backup_metadata')
        .update({
          backup_status: 'completed',
          backup_size: Math.floor(Math.random() * 1000000000), // Random size for demo
          checksum: 'sha256:' + Math.random().toString(36),
          completed_at: new Date().toISOString(),
        })
        .eq('id', backupId);
    } catch (error) {
      // Update backup status to failed
      await supabase
        .from('backup_metadata')
        .update({
          backup_status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', backupId);
    }
  }
}

// Authentication and User Management
export class AuthService {
  // Sign up with role-based access
  static async signUp(
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: "doctor" | "nurse" | "admin" | "therapist";
      license_number?: string;
      department?: string;
    },
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            license_number: userData.license_number,
            department: userData.department,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, userData);
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, "AuthService.signUp"),
      };
    }
  }

  // Sign in
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(error, "AuthService.signIn"),
      };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return {
        error: errorHandler.handleApiError(error, "AuthService.signOut"),
      };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return {
        user: null,
        error: errorHandler.handleApiError(error, "AuthService.getCurrentUser"),
      };
    }
  }

  // Get user profile with role information
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(error, "AuthService.getUserProfile"),
      };
    }
  }

  // Create user profile
  private static async createUserProfile(
    userId: string,
    userData: {
      full_name: string;
      role: "doctor" | "nurse" | "admin" | "therapist";
      license_number?: string;
      department?: string;
    },
  ) {
    try {
      const { data, error } = await supabase.from("user_profiles").insert({
        id: userId,
        full_name: userData.full_name,
        role: userData.role,
        license_number: userData.license_number,
        department: userData.department,
        is_active: true,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "AuthService.createUserProfile",
        ),
      };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: UserProfileUpdate) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "AuthService.updateUserProfile",
        ),
      };
    }
  }

  // Check user permissions
  static async checkPermission(userId: string, permission: string) {
    try {
      const { data, error } = await supabase.rpc("check_user_permission", {
        user_id: userId,
        permission_name: permission,
      });

      if (error) throw error;
      return { hasPermission: data, error: null };
    } catch (error) {
      return {
        hasPermission: false,
        error: errorHandler.handleApiError(
          error,
          "AuthService.checkPermission",
        ),
      };
    }
  }
}

// Emergency Contact Management Service - P2-007
export class EmergencyContactService {
  // Create emergency contact
  static async createEmergencyContact(contactData: {
    patientId: string;
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    isPrimary?: boolean;
    canMakeDecisions?: boolean;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          patient_id: contactData.patientId,
          name: contactData.name,
          relationship: contactData.relationship,
          phone_number: contactData.phoneNumber,
          email: contactData.email,
          address: contactData.address,
          is_primary: contactData.isPrimary || false,
          can_make_decisions: contactData.canMakeDecisions || false,
          notes: contactData.notes,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.createEmergencyContact'
        )
      };
    }
  }

  // Get emergency contacts for patient
  static async getPatientEmergencyContacts(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.getPatientEmergencyContacts'
        )
      };
    }
  }

  // Update emergency contact
  static async updateEmergencyContact(contactId: string, updates: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    isPrimary?: boolean;
    canMakeDecisions?: boolean;
    notes?: string;
  }) {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Handle field name mapping
      if (updates.phoneNumber !== undefined) {
        updateData.phone_number = updates.phoneNumber;
        delete updateData.phoneNumber;
      }
      if (updates.isPrimary !== undefined) {
        updateData.is_primary = updates.isPrimary;
        delete updateData.isPrimary;
      }
      if (updates.canMakeDecisions !== undefined) {
        updateData.can_make_decisions = updates.canMakeDecisions;
        delete updateData.canMakeDecisions;
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updateData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.updateEmergencyContact'
        )
      };
    }
  }

  // Delete emergency contact
  static async deleteEmergencyContact(contactId: string) {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.deleteEmergencyContact'
        )
      };
    }
  }

  // Set primary emergency contact
  static async setPrimaryContact(patientId: string, contactId: string) {
    try {
      // First, remove primary status from all contacts for this patient
      await supabase
        .from('emergency_contacts')
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq('patient_id', patientId);

      // Then set the selected contact as primary
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update({ 
          is_primary: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.setPrimaryContact'
        )
      };
    }
  }

  // Validate emergency contact data
  static validateEmergencyContact(contactData: any) {
    const errors = [];
    const warnings = [];

    // Required field validation
    if (!contactData.name || contactData.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Contact name is required',
        severity: 'error'
      });
    }

    if (!contactData.relationship || contactData.relationship.trim().length === 0) {
      errors.push({
        field: 'relationship',
        message: 'Relationship is required',
        severity: 'error'
      });
    }

    if (!contactData.phoneNumber || contactData.phoneNumber.trim().length === 0) {
      errors.push({
        field: 'phoneNumber',
        message: 'Phone number is required',
        severity: 'error'
      });
    } else {
      // UAE phone number validation
      const phoneRegex = /^(\+971|00971|971)?[0-9]{8,9}$/;
      if (!phoneRegex.test(contactData.phoneNumber.replace(/\s+/g, ''))) {
        warnings.push({
          field: 'phoneNumber',
          message: 'Phone number format may be invalid',
          suggestion: 'UAE phone numbers should start with +971 or 971'
        });
      }
    }

    // Email validation (if provided)
    if (contactData.email && contactData.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.email)) {
        warnings.push({
          field: 'email',
          message: 'Invalid email format',
          suggestion: 'Please provide a valid email address'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Get emergency contact statistics
  static async getEmergencyContactStatistics(patientId?: string) {
    try {
      let query = supabase
        .from('emergency_contacts')
        .select('relationship, is_primary, can_make_decisions, status, created_at');

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(contact => contact.status === 'active').length,
        inactive: data.filter(contact => contact.status === 'inactive').length,
        primary: data.filter(contact => contact.is_primary).length,
        canMakeDecisions: data.filter(contact => contact.can_make_decisions).length,
        byRelationship: data.reduce((acc, contact) => {
          acc[contact.relationship] = (acc[contact.relationship] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentlyAdded: data
          .filter(contact => new Date(contact.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .length
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.getEmergencyContactStatistics'
        )
      };
    }
  }

  // Notify emergency contacts
  static async notifyEmergencyContacts(patientId: string, message: string, urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    try {
      const { data: contacts, error: contactsError } = await this.getPatientEmergencyContacts(patientId);
      if (contactsError) throw contactsError;

      const notifications = [];
      for (const contact of contacts) {
        // In production, this would send actual SMS/email notifications
        const notification = {
          contact_id: contact.id,
          patient_id: patientId,
          message,
          urgency,
          notification_type: urgency === 'critical' ? 'sms_and_email' : 'sms',
          status: 'sent', // Mock status
          sent_at: new Date().toISOString()
        };
        notifications.push(notification);
      }

      // Store notification records
      const { data, error } = await supabase
        .from('emergency_notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'EmergencyContactService.notifyEmergencyContacts'
        )
      };
    }
  }
}

// Patient Demographics Validation Service - P2-006
export class PatientDemographicsValidationService {
  // Validate patient demographics data
  static async validatePatientDemographics(patientData: any) {
    try {
      const validationResult = {
        isValid: true,
        errors: [] as Array<{
          field: string;
          message: string;
          severity: 'error' | 'warning' | 'info';
        }>,
        warnings: [] as Array<{
          field: string;
          message: string;
          suggestion: string;
        }>,
        completeness: {
          score: 0,
          maxScore: 100,
          percentage: 0,
          missingFields: [] as string[],
          optionalFields: [] as string[]
        },
        compliance: {
          dohCompliant: true,
          emiratesIdValid: false,
          insuranceValid: false,
          contactInfoComplete: false
        }
      };

      // Emirates ID validation
      if (!patientData.emirates_id) {
        validationResult.errors.push({
          field: 'emirates_id',
          message: 'Emirates ID is required',
          severity: 'error'
        });
        validationResult.isValid = false;
        validationResult.compliance.dohCompliant = false;
      } else {
        const emiratesIdValid = EmiratesIdService.validateEmiratesIdFormat(patientData.emirates_id);
        if (!emiratesIdValid) {
          validationResult.errors.push({
            field: 'emirates_id',
            message: 'Invalid Emirates ID format. Expected format: 784-YYYY-XXXXXXX-X',
            severity: 'error'
          });
          validationResult.isValid = false;
          validationResult.compliance.dohCompliant = false;
        } else {
          validationResult.compliance.emiratesIdValid = true;
        }
      }

      // Name validation
      if (!patientData.first_name_en || !patientData.last_name_en) {
        validationResult.errors.push({
          field: 'name',
          message: 'First name and last name in English are required',
          severity: 'error'
        });
        validationResult.isValid = false;
        validationResult.compliance.dohCompliant = false;
      }

      // Date of birth validation
      if (!patientData.date_of_birth) {
        validationResult.errors.push({
          field: 'date_of_birth',
          message: 'Date of birth is required',
          severity: 'error'
        });
        validationResult.isValid = false;
        validationResult.compliance.dohCompliant = false;
      } else {
        const birthDate = new Date(patientData.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age > 150 || age < 0) {
          validationResult.errors.push({
            field: 'date_of_birth',
            message: 'Invalid date of birth',
            severity: 'error'
          });
          validationResult.isValid = false;
        }
        
        if (age < 18) {
          validationResult.warnings.push({
            field: 'date_of_birth',
            message: 'Patient is under 18 years old',
            suggestion: 'Ensure guardian consent is obtained for minors'
          });
        }
      }

      // Gender validation
      if (!patientData.gender) {
        validationResult.errors.push({
          field: 'gender',
          message: 'Gender is required',
          severity: 'error'
        });
        validationResult.isValid = false;
        validationResult.compliance.dohCompliant = false;
      }

      // Phone number validation
      if (!patientData.phone_number) {
        validationResult.errors.push({
          field: 'phone_number',
          message: 'Phone number is required',
          severity: 'error'
        });
        validationResult.isValid = false;
        validationResult.compliance.contactInfoComplete = false;
      } else {
        const phoneRegex = /^(\+971|00971|971)?[0-9]{8,9}$/;
        if (!phoneRegex.test(patientData.phone_number.replace(/\s+/g, ''))) {
          validationResult.warnings.push({
            field: 'phone_number',
            message: 'Phone number format may be invalid',
            suggestion: 'UAE phone numbers should start with +971 or 971'
          });
        } else {
          validationResult.compliance.contactInfoComplete = true;
        }
      }

      // Email validation
      if (patientData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(patientData.email)) {
          validationResult.warnings.push({
            field: 'email',
            message: 'Invalid email format',
            suggestion: 'Please provide a valid email address'
          });
        }
      }

      // Insurance validation
      if (!patientData.insurance_provider) {
        validationResult.warnings.push({
          field: 'insurance_provider',
          message: 'Insurance provider not specified',
          suggestion: 'Insurance information is recommended for billing purposes'
        });
      } else {
        validationResult.compliance.insuranceValid = true;
      }

      // Calculate completeness score
      const requiredFields = ['emirates_id', 'first_name_en', 'last_name_en', 'date_of_birth', 'gender', 'phone_number'];
      const optionalFields = ['first_name_ar', 'last_name_ar', 'email', 'address', 'insurance_provider', 'insurance_type', 'insurance_number'];
      
      let completedRequired = 0;
      let completedOptional = 0;
      
      requiredFields.forEach(field => {
        if (patientData[field]) {
          completedRequired++;
        } else {
          validationResult.completeness.missingFields.push(field);
        }
      });
      
      optionalFields.forEach(field => {
        if (patientData[field]) {
          completedOptional++;
        } else {
          validationResult.completeness.optionalFields.push(field);
        }
      });
      
      const requiredScore = (completedRequired / requiredFields.length) * 70; // 70% weight for required fields
      const optionalScore = (completedOptional / optionalFields.length) * 30; // 30% weight for optional fields
      
      validationResult.completeness.score = Math.round(requiredScore + optionalScore);
      validationResult.completeness.maxScore = 100;
      validationResult.completeness.percentage = validationResult.completeness.score;

      return { data: validationResult, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'PatientDemographicsValidationService.validatePatientDemographics'
        )
      };
    }
  }

  // Get validation status for a patient
  static async getPatientValidationStatus(patientId: string) {
    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;

      const validationResult = await this.validatePatientDemographics(patient);
      
      return {
        data: {
          patientId,
          lastValidated: new Date().toISOString(),
          validationResult: validationResult.data
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'PatientDemographicsValidationService.getPatientValidationStatus'
        )
      };
    }
  }

  // Batch validate multiple patients
  static async batchValidatePatients(patientIds: string[]) {
    try {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (error) throw error;

      const validationResults = await Promise.all(
        patients.map(async (patient) => {
          const validation = await this.validatePatientDemographics(patient);
          return {
            patientId: patient.id,
            patientName: `${patient.first_name_en} ${patient.last_name_en}`,
            validationResult: validation.data
          };
        })
      );

      const summary = {
        totalPatients: validationResults.length,
        validPatients: validationResults.filter(r => r.validationResult?.isValid).length,
        invalidPatients: validationResults.filter(r => !r.validationResult?.isValid).length,
        averageCompleteness: Math.round(
          validationResults.reduce((sum, r) => sum + (r.validationResult?.completeness.percentage || 0), 0) / validationResults.length
        ),
        dohCompliantPatients: validationResults.filter(r => r.validationResult?.compliance.dohCompliant).length
      };

      return {
        data: {
          summary,
          results: validationResults,
          validatedAt: new Date().toISOString()
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'PatientDemographicsValidationService.batchValidatePatients'
        )
      };
    }
  }

  // Get validation statistics
  static async getValidationStatistics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    department?: string;
  }) {
    try {
      let query = supabase.from('patients').select('*');
      
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data: patients, error } = await query;
      if (error) throw error;

      const validationResults = await Promise.all(
        patients.map(patient => this.validatePatientDemographics(patient))
      );

      const stats = {
        totalPatients: patients.length,
        validPatients: validationResults.filter(r => r.data?.isValid).length,
        invalidPatients: validationResults.filter(r => !r.data?.isValid).length,
        averageCompleteness: Math.round(
          validationResults.reduce((sum, r) => sum + (r.data?.completeness.percentage || 0), 0) / validationResults.length
        ),
        dohCompliance: {
          compliant: validationResults.filter(r => r.data?.compliance.dohCompliant).length,
          nonCompliant: validationResults.filter(r => !r.data?.compliance.dohCompliant).length,
          complianceRate: Math.round(
            (validationResults.filter(r => r.data?.compliance.dohCompliant).length / validationResults.length) * 100
          )
        },
        commonIssues: {
          missingEmiratesId: validationResults.filter(r => 
            r.data?.errors.some(e => e.field === 'emirates_id')
          ).length,
          invalidEmiratesId: validationResults.filter(r => 
            r.data?.errors.some(e => e.field === 'emirates_id' && e.message.includes('Invalid'))
          ).length,
          missingContactInfo: validationResults.filter(r => 
            !r.data?.compliance.contactInfoComplete
          ).length,
          missingInsurance: validationResults.filter(r => 
            !r.data?.compliance.insuranceValid
          ).length
        }
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'PatientDemographicsValidationService.getValidationStatistics'
        )
      };
    }
  }
}

// Patient Management Service
export class PatientService {
  // Create new patient
  static async createPatient(patientData: PatientInsert) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .insert(patientData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "PatientService.createPatient",
        ),
      };
    }
  }

  // Get patient by ID
  static async getPatient(patientId: string) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          *,
          episodes (
            id,
            episode_number,
            status,
            start_date,
            end_date,
            primary_diagnosis
          )
        `,
        )
        .eq("id", patientId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(error, "PatientService.getPatient"),
      };
    }
  }

  // Enhanced search patients with advanced filtering - P2-004
  static async searchPatients(
    query: string,
    filters?: {
      insurance_type?: string;
      insurance_provider?: string;
      status?: string;
      gender?: string;
      age_range?: { min?: number; max?: number };
      date_range?: { from?: string; to?: string };
      has_active_episodes?: boolean;
      episode_status?: string;
      service_type?: string;
      limit?: number;
      offset?: number;
      sort_by?: 'name' | 'created_at' | 'last_updated' | 'emirates_id';
      sort_order?: 'asc' | 'desc';
    },
  ) {
    try {
      let queryBuilder = supabase.from("patients").select(`
          id,
          emirates_id,
          first_name_en,
          last_name_en,
          first_name_ar,
          last_name_ar,
          date_of_birth,
          gender,
          phone_number,
          email,
          address,
          insurance_provider,
          insurance_type,
          insurance_policy_number,
          status,
          created_at,
          updated_at,
          episodes!left(
            id,
            status,
            service_type,
            start_date,
            end_date
          )
        `);

      // Enhanced search conditions
      if (query && query.trim()) {
        const searchTerms = query.trim().split(' ').filter(term => term.length > 0);
        const searchConditions = [];
        
        for (const term of searchTerms) {
          searchConditions.push(
            `first_name_en.ilike.%${term}%`,
            `last_name_en.ilike.%${term}%`,
            `first_name_ar.ilike.%${term}%`,
            `last_name_ar.ilike.%${term}%`,
            `emirates_id.ilike.%${term}%`,
            `phone_number.ilike.%${term}%`,
            `email.ilike.%${term}%`
          );
        }
        
        queryBuilder = queryBuilder.or(searchConditions.join(','));
      }

      // Apply filters
      if (filters?.insurance_type) {
        queryBuilder = queryBuilder.eq("insurance_type", filters.insurance_type);
      }
      
      if (filters?.insurance_provider) {
        queryBuilder = queryBuilder.eq("insurance_provider", filters.insurance_provider);
      }
      
      if (filters?.status) {
        queryBuilder = queryBuilder.eq("status", filters.status);
      }
      
      if (filters?.gender) {
        queryBuilder = queryBuilder.eq("gender", filters.gender);
      }

      // Age range filter
      if (filters?.age_range) {
        const currentYear = new Date().getFullYear();
        if (filters.age_range.min !== undefined) {
          const maxBirthYear = currentYear - filters.age_range.min;
          queryBuilder = queryBuilder.lte("date_of_birth", `${maxBirthYear}-12-31`);
        }
        if (filters.age_range.max !== undefined) {
          const minBirthYear = currentYear - filters.age_range.max;
          queryBuilder = queryBuilder.gte("date_of_birth", `${minBirthYear}-01-01`);
        }
      }

      // Date range filter
      if (filters?.date_range) {
        if (filters.date_range.from) {
          queryBuilder = queryBuilder.gte("created_at", filters.date_range.from);
        }
        if (filters.date_range.to) {
          queryBuilder = queryBuilder.lte("created_at", filters.date_range.to);
        }
      }

      // Sorting
      const sortBy = filters?.sort_by || 'created_at';
      const sortOrder = filters?.sort_order || 'desc';
      
      switch (sortBy) {
        case 'name':
          queryBuilder = queryBuilder.order('first_name_en', { ascending: sortOrder === 'asc' });
          break;
        case 'emirates_id':
          queryBuilder = queryBuilder.order('emirates_id', { ascending: sortOrder === 'asc' });
          break;
        case 'last_updated':
          queryBuilder = queryBuilder.order('updated_at', { ascending: sortOrder === 'asc' });
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: sortOrder === 'asc' });
      }

      // Pagination
      if (filters?.offset) {
        queryBuilder = queryBuilder.range(filters.offset, (filters.offset + (filters?.limit || 50)) - 1);
      } else {
        queryBuilder = queryBuilder.limit(filters?.limit || 50);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      
      // Post-process results for episode filtering
      let filteredData = data;
      
      if (filters?.has_active_episodes !== undefined) {
        filteredData = data.filter(patient => {
          const hasActiveEpisodes = patient.episodes?.some(ep => ep.status === 'active') || false;
          return filters.has_active_episodes ? hasActiveEpisodes : !hasActiveEpisodes;
        });
      }
      
      if (filters?.episode_status) {
        filteredData = filteredData.filter(patient => 
          patient.episodes?.some(ep => ep.status === filters.episode_status)
        );
      }
      
      if (filters?.service_type) {
        filteredData = filteredData.filter(patient => 
          patient.episodes?.some(ep => ep.service_type === filters.service_type)
        );
      }

      return { data: filteredData, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "PatientService.searchPatients",
        ),
      };
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string, limit: number = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name_en, last_name_en, emirates_id, phone_number")
        .or(
          `first_name_en.ilike.%${query}%,last_name_en.ilike.%${query}%,emirates_id.ilike.%${query}%,phone_number.ilike.%${query}%`
        )
        .limit(limit);

      if (error) throw error;
      
      const suggestions = data.map(patient => ({
        id: patient.id,
        label: `${patient.first_name_en} ${patient.last_name_en}`,
        sublabel: patient.emirates_id,
        type: 'patient'
      }));

      return { data: suggestions, error: null };
    } catch (error) {
      return {
        data: [],
        error: ErrorHandlingService.handleApiError(
          error,
          "PatientService.getSearchSuggestions",
        ),
      };
    }
  }

  // Get advanced search filters options
  static async getSearchFilterOptions() {
    try {
      const [insuranceProviders, serviceTypes, episodeStatuses] = await Promise.all([
        supabase.from("patients").select("insurance_provider").not("insurance_provider", "is", null),
        supabase.from("episodes").select("service_type").not("service_type", "is", null),
        supabase.from("episodes").select("status").not("status", "is", null)
      ]);

      const filterOptions = {
        insuranceProviders: [...new Set(insuranceProviders.data?.map(p => p.insurance_provider) || [])],
        insuranceTypes: ['Basic', 'Premium', 'VIP', 'Government', 'Corporate'],
        genders: ['Male', 'Female'],
        patientStatuses: ['active', 'inactive', 'suspended'],
        serviceTypes: [...new Set(serviceTypes.data?.map(e => e.service_type) || [])],
        episodeStatuses: [...new Set(episodeStatuses.data?.map(e => e.status) || [])],
        ageRanges: [
          { label: '0-17 (Pediatric)', min: 0, max: 17 },
          { label: '18-64 (Adult)', min: 18, max: 64 },
          { label: '65+ (Senior)', min: 65, max: null }
        ],
        sortOptions: [
          { value: 'name', label: 'Name' },
          { value: 'created_at', label: 'Date Created' },
          { value: 'last_updated', label: 'Last Updated' },
          { value: 'emirates_id', label: 'Emirates ID' }
        ]
      };

      return { data: filterOptions, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "PatientService.getSearchFilterOptions",
        ),
      };
    }
  }

  // Update patient
  static async updatePatient(patientId: string, updates: PatientUpdate) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", patientId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "PatientService.updatePatient",
        ),
      };
    }
  }

  // Get patient episodes
  static async getPatientEpisodes(patientId: string) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select(
          `
          *,
          clinical_forms (
            id,
            form_type,
            status,
            created_at,
            updated_at
          )
        `,
        )
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "PatientService.getPatientEpisodes",
        ),
      };
    }
  }

  // Get patient with active episodes count
  static async getPatientWithEpisodeCount(patientId: string) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          *,
          episodes!inner(
            id,
            status,
            created_at
          )
        `,
        )
        .eq("id", patientId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "PatientService.getPatientWithEpisodeCount",
        ),
      };
    }
  }

  // Get patients with episode statistics
  static async getPatientsWithEpisodeStats(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `
          *,
          episodes(
            id,
            status,
            start_date,
            end_date
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "PatientService.getPatientsWithEpisodeStats",
        ),
      };
    }
  }
}

// Care Team Management Service
export class CareTeamService {
  // Add care team member to episode
  static async addCareTeamMember(episodeId: string, memberData: {
    userId: string;
    role: string;
    responsibilities: string[];
    isPrimary?: boolean;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('episode_care_team')
        .insert({
          episode_id: episodeId,
          user_id: memberData.userId,
          role: memberData.role,
          responsibilities: memberData.responsibilities,
          is_primary: memberData.isPrimary || false,
          start_date: memberData.startDate || new Date().toISOString(),
          end_date: memberData.endDate,
          notes: memberData.notes,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            role,
            license_number,
            department
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'CareTeamService.addCareTeamMember'
        )
      };
    }
  }

  // Remove care team member from episode
  static async removeCareTeamMember(episodeId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_care_team')
        .update({
          status: 'inactive',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('episode_id', episodeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'CareTeamService.removeCareTeamMember'
        )
      };
    }
  }

  // Get care team members for episode
  static async getEpisodeCareTeam(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from('episode_care_team')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            role,
            license_number,
            department
          )
        `)
        .eq('episode_id', episodeId)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'CareTeamService.getEpisodeCareTeam'
        )
      };
    }
  }

  // Update care team member
  static async updateCareTeamMember(episodeId: string, userId: string, updates: {
    role?: string;
    responsibilities?: string[];
    isPrimary?: boolean;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('episode_care_team')
        .update({
          ...updates,
          is_primary: updates.isPrimary,
          updated_at: new Date().toISOString()
        })
        .eq('episode_id', episodeId)
        .eq('user_id', userId)
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            role,
            license_number,
            department
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'CareTeamService.updateCareTeamMember'
        )
      };
    }
  }

  // Get available staff for care team assignment
  static async getAvailableStaff(filters?: {
    role?: string;
    department?: string;
    isActive?: boolean;
  }) {
    try {
      let queryBuilder = supabase
        .from('user_profiles')
        .select('id, full_name, role, license_number, department')
        .eq('is_active', filters?.isActive !== false);

      if (filters?.role) {
        queryBuilder = queryBuilder.eq('role', filters.role);
      }

      if (filters?.department) {
        queryBuilder = queryBuilder.eq('department', filters.department);
      }

      const { data, error } = await queryBuilder
        .order('full_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'CareTeamService.getAvailableStaff'
        )
      };
    }
  }

  // Get care team statistics
  static async getCareTeamStatistics(episodeId?: string) {
    try {
      let query = supabase
        .from('episode_care_team')
        .select('role, status, created_at');

      if (episodeId) {
        query = query.eq('episode_id', episodeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(member => member.status === 'active').length,
        inactive: data.filter(member => member.status === 'inactive').length,
        byRole: data.reduce((acc, member) => {
          acc[member.role] = (acc[member.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentAdditions: data
          .filter(member => new Date(member.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          'CareTeamService.getCareTeamStatistics'
        )
      };
    }
  }
}

// Episode Management Service
export class EpisodeService {
  // Create new episode
  static async createEpisode(episodeData: EpisodeInsert) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .insert(episodeData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.createEpisode",
        ),
      };
    }
  }

  // Get episode by ID
  static async getEpisode(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select(
          `
          *,
          patients (
            id,
            emirates_id,
            first_name_en,
            last_name_en,
            date_of_birth,
            gender
          ),
          clinical_forms (
            id,
            form_type,
            form_data,
            status,
            created_by,
            created_at,
            updated_at
          )
        `,
        )
        .eq("id", episodeId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(error, "EpisodeService.getEpisode"),
      };
    }
  }

  // Update episode
  static async updateEpisode(episodeId: string, updates: EpisodeUpdate) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.updateEpisode",
        ),
      };
    }
  }

  // Get episodes by patient ID
  static async getEpisodesByPatient(patientId: string) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select(
          `
          *,
          clinical_forms (
            id,
            form_type,
            status,
            created_at,
            updated_at
          )
        `,
        )
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.getEpisodesByPatient",
        ),
      };
    }
  }

  // Get active episodes
  static async getActiveEpisodes(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select(
          `
          *,
          patients (
            id,
            emirates_id,
            first_name_en,
            last_name_en,
            phone_number
          )
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.getActiveEpisodes",
        ),
      };
    }
  }

  // Complete episode
  static async completeEpisode(episodeId: string, completionData?: {
    end_date?: string;
    completion_notes?: string;
  }) {
    try {
      const updates: EpisodeUpdate = {
        status: "completed",
        end_date: completionData?.end_date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("episodes")
        .update(updates)
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.completeEpisode",
        ),
      };
    }
  }

  // Cancel episode
  static async cancelEpisode(episodeId: string, cancellationReason?: string) {
    try {
      const updates: EpisodeUpdate = {
        status: "cancelled",
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("episodes")
        .update(updates)
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.cancelEpisode",
        ),
      };
    }
  }

  // Suspend episode
  static async suspendEpisode(episodeId: string, suspensionReason?: string) {
    try {
      const updates: EpisodeUpdate = {
        status: "suspended",
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("episodes")
        .update(updates)
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.suspendEpisode",
        ),
      };
    }
  }

  // Reactivate episode
  static async reactivateEpisode(episodeId: string) {
    try {
      const updates: EpisodeUpdate = {
        status: "active",
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("episodes")
        .update(updates)
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.reactivateEpisode",
        ),
      };
    }
  }

  // Get episode statistics
  static async getEpisodeStatistics(patientId?: string) {
    try {
      let query = supabase
        .from("episodes")
        .select("status, created_at, end_date");

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(ep => ep.status === 'active').length,
        completed: data.filter(ep => ep.status === 'completed').length,
        cancelled: data.filter(ep => ep.status === 'cancelled').length,
        suspended: data.filter(ep => ep.status === 'suspended').length,
        averageDuration: 0
      };

      // Calculate average duration for completed episodes
      const completedEpisodes = data.filter(ep => ep.status === 'completed' && ep.end_date);
      if (completedEpisodes.length > 0) {
        const totalDuration = completedEpisodes.reduce((sum, ep) => {
          const start = new Date(ep.created_at).getTime();
          const end = new Date(ep.end_date).getTime();
          return sum + (end - start);
        }, 0);
        stats.averageDuration = Math.round(totalDuration / completedEpisodes.length / (1000 * 60 * 60 * 24)); // days
      }

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.getEpisodeStatistics",
        ),
      };
    }
  }

  // Search episodes
  static async searchEpisodes(query: string, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    try {
      let queryBuilder = supabase
        .from("episodes")
        .select(
          `
          *,
          patients (
            id,
            emirates_id,
            first_name_en,
            last_name_en,
            phone_number
          )
        `,
        );

      // Add search conditions
      if (query) {
        queryBuilder = queryBuilder.or(
          `episode_number.ilike.%${query}%,primary_diagnosis.ilike.%${query}%`,
        );
      }

      // Add filters
      if (filters?.status) {
        queryBuilder = queryBuilder.eq("status", filters.status);
      }
      if (filters?.dateFrom) {
        queryBuilder = queryBuilder.gte("start_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        queryBuilder = queryBuilder.lte("start_date", filters.dateTo);
      }

      // Add limit and ordering
      queryBuilder = queryBuilder
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 50);

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.searchEpisodes",
        ),
      };
    }
  }

  // Get episodes with care team information
  static async getEpisodesWithCareTeam(patientId?: string, limit: number = 50) {
    try {
      let queryBuilder = supabase
        .from("episodes")
        .select(
          `
          *,
          patients (
            id,
            emirates_id,
            first_name_en,
            last_name_en,
            phone_number
          ),
          clinical_forms (
            id,
            form_type,
            status,
            created_at
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (patientId) {
        queryBuilder = queryBuilder.eq("patient_id", patientId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.getEpisodesWithCareTeam",
        ),
      };
    }
  }

  // Get episode timeline
  static async getEpisodeTimeline(episodeId: string) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select(
          `
          *,
          clinical_forms (
            id,
            form_type,
            status,
            created_at,
            updated_at,
            signed_at
          )
        `,
        )
        .eq("id", episodeId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.getEpisodeTimeline",
        ),
      };
    }
  }

  // Update episode care plan
  static async updateEpisodeCarePlan(episodeId: string, carePlan: any) {
    try {
      const { data, error } = await supabase
        .from("episodes")
        .update({
          care_plan: carePlan,
          updated_at: new Date().toISOString()
        })
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.updateEpisodeCarePlan",
        ),
      };
    }
  }

  // Add physician orders to episode
  static async addPhysicianOrders(episodeId: string, orders: any) {
    try {
      const { data: episode, error: fetchError } = await supabase
        .from("episodes")
        .select("physician_orders")
        .eq("id", episodeId)
        .single();

      if (fetchError) throw fetchError;

      const existingOrders = episode.physician_orders || [];
      const updatedOrders = [...existingOrders, ...orders];

      const { data, error } = await supabase
        .from("episodes")
        .update({
          physician_orders: updatedOrders,
          updated_at: new Date().toISOString()
        })
        .eq("id", episodeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: ErrorHandlingService.handleApiError(
          error,
          "EpisodeService.addPhysicianOrders",
        ),
      };
    }
  }
}

// Clinical Forms Service
export class ClinicalFormsService {
  // Create clinical form
  static async createClinicalForm(formData: ClinicalFormInsert) {
    try {
      const { data, error } = await supabase
        .from("clinical_forms")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "ClinicalFormsService.createClinicalForm",
        ),
      };
    }
  }

  // Get clinical form by ID
  static async getClinicalForm(formId: string) {
    try {
      const { data, error } = await supabase
        .from("clinical_forms")
        .select(
          `
          *,
          episodes (
            id,
            episode_number,
            patients (
              id,
              first_name_en,
              last_name_en,
              emirates_id
            )
          ),
          user_profiles!clinical_forms_created_by_fkey (
            id,
            full_name,
            role,
            license_number
          )
        `,
        )
        .eq("id", formId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "ClinicalFormsService.getClinicalForm",
        ),
      };
    }
  }

  // Update clinical form
  static async updateClinicalForm(formId: string, updates: ClinicalFormUpdate) {
    try {
      const { data, error } = await supabase
        .from("clinical_forms")
        .update(updates)
        .eq("id", formId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "ClinicalFormsService.updateClinicalForm",
        ),
      };
    }
  }

  // Get forms for episode
  static async getEpisodeForms(episodeId: string, formType?: string) {
    try {
      let queryBuilder = supabase
        .from("clinical_forms")
        .select(
          `
          *,
          user_profiles!clinical_forms_created_by_fkey (
            full_name,
            role,
            license_number
          )
        `,
        )
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false });

      if (formType) {
        queryBuilder = queryBuilder.eq("form_type", formType);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "ClinicalFormsService.getEpisodeForms",
        ),
      };
    }
  }

  // Submit form for DOH compliance
  static async submitForm(
    formId: string,
    signatureData: {
      signature_data: string;
      signed_by: string;
      signed_at: string;
    },
  ) {
    try {
      const { data, error } = await supabase
        .from("clinical_forms")
        .update({
          status: "submitted",
          signature_data: signatureData.signature_data,
          signed_by: signatureData.signed_by,
          signed_at: signatureData.signed_at,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", formId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "ClinicalFormsService.submitForm",
        ),
      };
    }
  }
}

// Real-time Subscriptions Service
export class RealtimeService {
  private static subscriptions: Map<string, any> = new Map();

  // Subscribe to patient updates
  static subscribeToPatient(
    patientId: string,
    callback: (payload: any) => void,
  ) {
    const subscription = supabase
      .channel(`patient-${patientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
          filter: `id=eq.${patientId}`,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set(`patient-${patientId}`, subscription);
    return subscription;
  }

  // Subscribe to episode updates
  static subscribeToEpisode(
    episodeId: string,
    callback: (payload: any) => void,
  ) {
    const subscription = supabase
      .channel(`episode-${episodeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "episodes",
          filter: `id=eq.${episodeId}`,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set(`episode-${episodeId}`, subscription);
    return subscription;
  }

  // Subscribe to clinical forms updates
  static subscribeToClinicalForms(
    episodeId: string,
    callback: (payload: any) => void,
  ) {
    const subscription = supabase
      .channel(`clinical-forms-${episodeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clinical_forms",
          filter: `episode_id=eq.${episodeId}`,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set(`clinical-forms-${episodeId}`, subscription);
    return subscription;
  }

  // Subscribe to user presence (for collaborative editing)
  static subscribeToPresence(
    roomId: string,
    userInfo: {
      user_id: string;
      full_name: string;
      role: string;
    },
    callback: (payload: any) => void,
  ) {
    const subscription = supabase
      .channel(`presence-${roomId}`)
      .on("presence", { event: "sync" }, callback)
      .on("presence", { event: "join" }, callback)
      .on("presence", { event: "leave" }, callback)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await subscription.track(userInfo);
        }
      });

    this.subscriptions.set(`presence-${roomId}`, subscription);
    return subscription;
  }

  // Unsubscribe from a channel
  static unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(key);
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }
}

// File Storage Service
export class StorageService {
  // Upload medical image/document
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    },
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || "3600",
          contentType: options?.contentType || file.type,
          upsert: options?.upsert || false,
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(error, "StorageService.uploadFile"),
      };
    }
  }

  // Get file URL
  static getFileUrl(bucket: string, path: string) {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      return {
        url: null,
        error: errorHandler.handleApiError(error, "StorageService.getFileUrl"),
      };
    }
  }

  // Delete file
  static async deleteFile(bucket: string, paths: string[]) {
    try {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(error, "StorageService.deleteFile"),
      };
    }
  }

  // Create signed URL for secure access
  static async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600,
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(
          error,
          "StorageService.createSignedUrl",
        ),
      };
    }
  }
}

// Database utility functions
export const dbUtils = {
  // Check if user has access to patient
  async checkPatientAccess(userId: string, patientId: string) {
    try {
      const { data, error } = await supabase.rpc("check_patient_access", {
        user_id: userId,
        patient_id: patientId,
      });

      if (error) throw error;
      return { hasAccess: data, error: null };
    } catch (error) {
      return {
        hasAccess: false,
        error: errorHandler.handleApiError(error, "dbUtils.checkPatientAccess"),
      };
    }
  },

  // Get user permissions
  async getUserPermissions(userId: string) {
    try {
      const { data, error } = await supabase.rpc("get_user_permissions", {
        user_id: userId,
      });

      if (error) throw error;
      return { permissions: data, error: null };
    } catch (error) {
      return {
        permissions: [],
        error: errorHandler.handleApiError(error, "dbUtils.getUserPermissions"),
      };
    }
  },

  // Audit log function
  async createAuditLog(
    action: string,
    table_name: string,
    record_id: string,
    old_values?: any,
    new_values?: any,
  ) {
    try {
      const { data, error } = await supabase.from("audit_logs").insert({
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: errorHandler.handleApiError(error, "dbUtils.createAuditLog"),
      };
    }
  },
};

export default supabase;
