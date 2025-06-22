// Simplified Core Healthcare Platform Database Schema
// Essential tables for the Reyada Homecare Platform

// Core table definitions with simplified structure
export const CORE_HEALTHCARE_SCHEMA = {
  // Patient Management
  patients: {
    tableName: "patients",
    primaryKey: "id",
    indexes: ["emirates_id", "phone_number", "insurance_provider", "status"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      emirates_id: { type: "string", required: true, unique: true },
      first_name_en: { type: "string", required: true },
      last_name_en: { type: "string", required: true },
      first_name_ar: { type: "string" },
      last_name_ar: { type: "string" },
      date_of_birth: { type: "date", required: true },
      gender: { type: "enum", values: ["male", "female"], required: true },
      phone_number: { type: "string", required: true },
      email: { type: "string" },
      address: { type: "text" },
      insurance_provider: { type: "string", required: true },
      insurance_type: { type: "string", required: true },
      membership_number: { type: "string", required: true },
      status: {
        type: "enum",
        values: ["active", "inactive", "suspended"],
        default: "active",
      },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
    },
  },

  // Episode Management
  episodes: {
    tableName: "episodes",
    primaryKey: "id",
    indexes: ["patient_id", "episode_number", "status", "start_date"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      patient_id: { type: "uuid", required: true, foreignKey: "patients.id" },
      episode_number: { type: "string", required: true, unique: true },
      primary_diagnosis: { type: "string", required: true },
      secondary_diagnoses: { type: "jsonb" },
      start_date: { type: "date", required: true },
      end_date: { type: "date" },
      status: {
        type: "enum",
        values: ["active", "completed", "cancelled"],
        default: "active",
      },
      care_team: { type: "jsonb" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
      created_by: {
        type: "uuid",
        required: true,
        foreignKey: "user_profiles.id",
      },
    },
  },

  // Clinical Forms
  clinical_forms: {
    tableName: "clinical_forms",
    primaryKey: "id",
    indexes: ["episode_id", "form_type", "status", "created_by"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      episode_id: { type: "uuid", required: true, foreignKey: "episodes.id" },
      form_type: { type: "string", required: true },
      form_data: { type: "jsonb", required: true },
      status: {
        type: "enum",
        values: ["draft", "completed", "submitted", "approved"],
        default: "draft",
      },
      signature_data: { type: "text" },
      signed_by: { type: "uuid", foreignKey: "user_profiles.id" },
      signed_at: { type: "timestamp" },
      submitted_at: { type: "timestamp" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
      created_by: {
        type: "uuid",
        required: true,
        foreignKey: "user_profiles.id",
      },
    },
  },

  // User Profiles
  user_profiles: {
    tableName: "user_profiles",
    primaryKey: "id",
    indexes: ["role", "license_number", "department", "is_active"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      full_name: { type: "string", required: true },
      role: {
        type: "enum",
        values: [
          "doctor",
          "nurse",
          "admin",
          "therapist",
          "manager",
          "coordinator",
          "supervisor",
        ],
        required: true,
      },
      license_number: { type: "string" },
      department: { type: "string" },
      phone_number: { type: "string" },
      email: { type: "string" },
      is_active: { type: "boolean", default: true },
      permissions: { type: "jsonb" },
      security_clearance: {
        type: "enum",
        values: ["standard", "elevated", "admin"],
        default: "standard",
      },
      last_login: { type: "timestamp" },
      password_hash: { type: "string" },
      mfa_enabled: { type: "boolean", default: false },
      mfa_secret: { type: "string" },
      failed_login_attempts: { type: "integer", default: 0 },
      account_locked_until: { type: "timestamp" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
    },
  },

  // Audit Logs
  audit_logs: {
    tableName: "audit_logs",
    primaryKey: "id",
    indexes: ["table_name", "record_id", "action", "created_by", "created_at"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      action: { type: "string", required: true },
      table_name: { type: "string", required: true },
      record_id: { type: "string", required: true },
      old_values: { type: "jsonb" },
      new_values: { type: "jsonb" },
      created_at: { type: "timestamp", default: "now" },
      created_by: { type: "uuid", foreignKey: "user_profiles.id" },
    },
  },

  // Medical Records - Missing Core Table
  medical_records: {
    tableName: "medical_records",
    primaryKey: "id",
    indexes: ["patient_id", "episode_id", "record_type", "created_at"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      patient_id: { type: "uuid", required: true, foreignKey: "patients.id" },
      episode_id: { type: "uuid", foreignKey: "episodes.id" },
      record_type: { type: "string", required: true },
      record_data: { type: "jsonb", required: true },
      attachments: { type: "jsonb" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
      created_by: {
        type: "uuid",
        required: true,
        foreignKey: "user_profiles.id",
      },
    },
  },

  // Medications - Missing Core Table
  medications: {
    tableName: "medications",
    primaryKey: "id",
    indexes: ["patient_id", "episode_id", "medication_name", "status"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      patient_id: { type: "uuid", required: true, foreignKey: "patients.id" },
      episode_id: { type: "uuid", foreignKey: "episodes.id" },
      medication_name: { type: "string", required: true },
      dosage: { type: "string", required: true },
      frequency: { type: "string", required: true },
      start_date: { type: "date", required: true },
      end_date: { type: "date" },
      status: {
        type: "enum",
        values: ["active", "discontinued", "completed"],
        default: "active",
      },
      prescribed_by: {
        type: "uuid",
        required: true,
        foreignKey: "user_profiles.id",
      },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
    },
  },

  // Appointments - Missing Core Table
  appointments: {
    tableName: "appointments",
    primaryKey: "id",
    indexes: [
      "patient_id",
      "healthcare_provider_id",
      "appointment_date",
      "status",
    ],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      patient_id: { type: "uuid", required: true, foreignKey: "patients.id" },
      healthcare_provider_id: {
        type: "uuid",
        required: true,
        foreignKey: "user_profiles.id",
      },
      appointment_date: { type: "timestamp", required: true },
      appointment_type: { type: "string", required: true },
      status: {
        type: "enum",
        values: ["scheduled", "completed", "cancelled", "no_show"],
        default: "scheduled",
      },
      notes: { type: "text" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
    },
  },

  // Streamlined DOH Compliance
  doh_compliance: {
    tableName: "doh_compliance",
    primaryKey: "id",
    indexes: ["episode_id", "compliance_type", "status"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      episode_id: { type: "uuid", required: true, foreignKey: "episodes.id" },
      compliance_type: { type: "string", required: true },
      compliance_data: { type: "jsonb", required: true },
      status: {
        type: "enum",
        values: ["compliant", "non_compliant", "pending"],
        default: "pending",
      },
      validation_date: { type: "timestamp" },
      validated_by: { type: "uuid", foreignKey: "user_profiles.id" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
    },
  },

  // Simplified Insurance Claims
  insurance_claims: {
    tableName: "insurance_claims",
    primaryKey: "id",
    indexes: ["episode_id", "claim_number", "status", "insurance_provider"],
    schema: {
      id: { type: "uuid", required: true, primaryKey: true },
      episode_id: { type: "uuid", required: true, foreignKey: "episodes.id" },
      claim_number: { type: "string", required: true, unique: true },
      insurance_provider: { type: "string", required: true },
      claim_data: { type: "jsonb", required: true },
      amount: { type: "decimal", precision: 10, scale: 2 },
      status: {
        type: "enum",
        values: ["draft", "submitted", "approved", "rejected", "paid"],
        default: "draft",
      },
      submitted_at: { type: "timestamp" },
      processed_at: { type: "timestamp" },
      created_at: { type: "timestamp", default: "now" },
      updated_at: { type: "timestamp", default: "now" },
      created_by: {
        type: "uuid",
        required: true,
        foreignKey: "user_profiles.id",
      },
    },
  },
};

// Enhanced Database Migration Scripts with Security and Compliance
export const MIGRATION_SCRIPTS = {
  "001_create_core_tables": `
    -- Create core healthcare tables with enhanced security and compliance
    -- Generated: ${new Date().toISOString()}
    -- Compliance: DOH, DAMAN, ADHICS V2, HIPAA
    
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- User profiles (create first due to foreign key dependencies)
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(200) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin', 'therapist', 'manager', 'coordinator', 'supervisor')),
      license_number VARCHAR(50),
      department VARCHAR(100),
      phone_number VARCHAR(20),
      email VARCHAR(255) UNIQUE,
      is_active BOOLEAN DEFAULT TRUE,
      permissions JSONB DEFAULT '{}',
      security_clearance VARCHAR(20) DEFAULT 'standard' CHECK (security_clearance IN ('standard', 'elevated', 'admin')),
      last_login TIMESTAMP WITH TIME ZONE,
      password_hash VARCHAR(255),
      mfa_enabled BOOLEAN DEFAULT FALSE,
      mfa_secret VARCHAR(255),
      failed_login_attempts INTEGER DEFAULT 0,
      account_locked_until TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Patients table with enhanced security and compliance
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      emirates_id VARCHAR(20) UNIQUE NOT NULL,
      first_name_en VARCHAR(100) NOT NULL,
      last_name_en VARCHAR(100) NOT NULL,
      first_name_ar VARCHAR(100),
      last_name_ar VARCHAR(100),
      date_of_birth DATE NOT NULL,
      gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
      phone_number VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      address TEXT,
      insurance_provider VARCHAR(100) NOT NULL,
      insurance_type VARCHAR(50) NOT NULL,
      membership_number VARCHAR(50) NOT NULL,
      policy_number VARCHAR(100),
      prior_authorization_number VARCHAR(100),
      eligibility_status VARCHAR(20) DEFAULT 'active' CHECK (eligibility_status IN ('active', 'inactive', 'suspended', 'expired')),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'discharged')),
      emergency_contact JSONB,
      next_of_kin JSONB,
      guardian_info JSONB,
      consent_status JSONB DEFAULT '{}',
      privacy_preferences JSONB DEFAULT '{}',
      data_retention_date DATE,
      anonymization_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID REFERENCES user_profiles(id),
      updated_by UUID REFERENCES user_profiles(id)
    );

    -- Episodes table
    CREATE TABLE IF NOT EXISTS episodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      episode_number VARCHAR(50) UNIQUE NOT NULL,
      primary_diagnosis VARCHAR(500) NOT NULL,
      secondary_diagnoses JSONB DEFAULT '[]',
      start_date DATE NOT NULL,
      end_date DATE,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
      care_team JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID NOT NULL REFERENCES user_profiles(id)
    );

    -- Clinical forms table
    CREATE TABLE IF NOT EXISTS clinical_forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
      form_type VARCHAR(100) NOT NULL,
      form_data JSONB NOT NULL,
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'submitted', 'approved')),
      signature_data TEXT,
      signed_by UUID REFERENCES user_profiles(id),
      signed_at TIMESTAMP WITH TIME ZONE,
      submitted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID NOT NULL REFERENCES user_profiles(id)
    );

    -- Medical records table (missing core table)
    CREATE TABLE IF NOT EXISTS medical_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
      record_type VARCHAR(100) NOT NULL,
      record_data JSONB NOT NULL,
      attachments JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID NOT NULL REFERENCES user_profiles(id)
    );

    -- Medications table (missing core table)
    CREATE TABLE IF NOT EXISTS medications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
      medication_name VARCHAR(200) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      frequency VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'completed')),
      prescribed_by UUID NOT NULL REFERENCES user_profiles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Appointments table (missing core table)
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      healthcare_provider_id UUID NOT NULL REFERENCES user_profiles(id),
      appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
      appointment_type VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Audit logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      action VARCHAR(100) NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      record_id VARCHAR(100) NOT NULL,
      old_values JSONB,
      new_values JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID REFERENCES user_profiles(id)
    );

    -- Streamlined DOH compliance table
    CREATE TABLE IF NOT EXISTS doh_compliance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
      compliance_type VARCHAR(100) NOT NULL,
      compliance_data JSONB NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('compliant', 'non_compliant', 'pending')),
      validation_date TIMESTAMP WITH TIME ZONE,
      validated_by UUID REFERENCES user_profiles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enhanced insurance claims table with compliance tracking
    CREATE TABLE IF NOT EXISTS insurance_claims (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
      claim_number VARCHAR(100) UNIQUE NOT NULL,
      insurance_provider VARCHAR(100) NOT NULL,
      claim_type VARCHAR(50) NOT NULL DEFAULT 'homecare',
      service_codes JSONB NOT NULL DEFAULT '[]',
      diagnosis_codes JSONB NOT NULL DEFAULT '[]',
      claim_data JSONB NOT NULL,
      amount DECIMAL(10,2),
      approved_amount DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid', 'appealed', 'cancelled')),
      submission_method VARCHAR(20) DEFAULT 'electronic' CHECK (submission_method IN ('electronic', 'manual', 'api')),
      prior_authorization_required BOOLEAN DEFAULT FALSE,
      prior_authorization_number VARCHAR(100),
      face_to_face_assessment JSONB,
      clinical_justification TEXT,
      provider_signature JSONB,
      patient_signature JSONB,
      letter_of_appointment JSONB,
      contact_person_details JSONB,
      compliance_status VARCHAR(20) DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending', 'under_review')),
      doh_compliance_score INTEGER DEFAULT 0,
      daman_compliance_score INTEGER DEFAULT 0,
      submitted_at TIMESTAMP WITH TIME ZONE,
      processed_at TIMESTAMP WITH TIME ZONE,
      approved_at TIMESTAMP WITH TIME ZONE,
      paid_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID NOT NULL REFERENCES user_profiles(id),
      updated_by UUID REFERENCES user_profiles(id)
    );
    
    -- Enhanced compliance tracking table
    CREATE TABLE IF NOT EXISTS compliance_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type VARCHAR(50) NOT NULL,
      entity_id UUID NOT NULL,
      compliance_framework VARCHAR(50) NOT NULL CHECK (compliance_framework IN ('DOH', 'DAMAN', 'ADHICS', 'HIPAA', 'GDPR')),
      compliance_domain VARCHAR(100) NOT NULL,
      compliance_status VARCHAR(20) NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending', 'under_review', 'exempt')),
      compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
      validation_date TIMESTAMP WITH TIME ZONE,
      expiry_date TIMESTAMP WITH TIME ZONE,
      validation_details JSONB DEFAULT '{}',
      remediation_actions JSONB DEFAULT '[]',
      risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      validated_by UUID REFERENCES user_profiles(id)
    );
    
    -- Security audit log table
    CREATE TABLE IF NOT EXISTS security_audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(50) NOT NULL,
      event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('authentication', 'authorization', 'data_access', 'data_modification', 'security_violation', 'system_event')),
      severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
      user_id UUID REFERENCES user_profiles(id),
      session_id VARCHAR(255),
      ip_address INET,
      user_agent TEXT,
      resource_accessed VARCHAR(255),
      action_performed VARCHAR(100),
      event_details JSONB DEFAULT '{}',
      risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
      geolocation JSONB,
      device_fingerprint VARCHAR(255),
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Data encryption keys table
    CREATE TABLE IF NOT EXISTS encryption_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key_name VARCHAR(100) UNIQUE NOT NULL,
      key_type VARCHAR(50) NOT NULL CHECK (key_type IN ('AES-256', 'RSA-2048', 'RSA-4096', 'ECDSA')),
      key_purpose VARCHAR(50) NOT NULL CHECK (key_purpose IN ('data_encryption', 'signature', 'authentication', 'key_exchange')),
      key_status VARCHAR(20) DEFAULT 'active' CHECK (key_status IN ('active', 'inactive', 'revoked', 'expired')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE,
      rotated_at TIMESTAMP WITH TIME ZONE,
      rotation_count INTEGER DEFAULT 0,
      created_by UUID NOT NULL REFERENCES user_profiles(id)
    );
  `,

  "002_create_indexes": `
    -- Create optimized indexes for better performance
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_emirates_id ON patients(emirates_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_phone ON patients(phone_number);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_insurance ON patients(insurance_provider);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_status ON patients(status);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_episodes_patient_id ON episodes(patient_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_episodes_episode_number ON episodes(episode_number);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_episodes_status ON episodes(status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_episodes_start_date ON episodes(start_date);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_forms_episode_id ON clinical_forms(episode_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_forms_form_type ON clinical_forms(form_type);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_forms_status ON clinical_forms(status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_forms_created_by ON clinical_forms(created_by);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_episode_id ON medical_records(episode_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_record_type ON medical_records(record_type);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medications_episode_id ON medications(episode_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medications_status ON medications(status);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_provider_id ON appointments(healthcare_provider_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_status ON appointments(status);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_license_number ON user_profiles(license_number);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_by ON audit_logs(created_by);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doh_compliance_episode_id ON doh_compliance(episode_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doh_compliance_type ON doh_compliance(compliance_type);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doh_compliance_status ON doh_compliance(status);

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_episode_id ON insurance_claims(episode_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_claim_number ON insurance_claims(claim_number);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_insurance_provider ON insurance_claims(insurance_provider);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_compliance_status ON insurance_claims(compliance_status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_prior_auth ON insurance_claims(prior_authorization_number);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_claims_service_codes ON insurance_claims USING GIN(service_codes);
    
    -- Compliance tracking indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tracking_entity ON compliance_tracking(entity_type, entity_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tracking_framework ON compliance_tracking(compliance_framework);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tracking_status ON compliance_tracking(compliance_status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tracking_score ON compliance_tracking(compliance_score);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_tracking_risk ON compliance_tracking(risk_level);
    
    -- Security audit log indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_event_type ON security_audit_log(event_type);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_category ON security_audit_log(event_category);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_severity ON security_audit_log(severity);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_ip_address ON security_audit_log(ip_address);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_risk_score ON security_audit_log(risk_score);
    
    -- Encryption keys indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encryption_keys_name ON encryption_keys(key_name);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encryption_keys_type ON encryption_keys(key_type);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encryption_keys_status ON encryption_keys(key_status);
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_encryption_keys_expires_at ON encryption_keys(expires_at);
  `,

  "003_create_rls_policies": `
    -- Enable Row Level Security on all tables
    ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE clinical_forms ENABLE ROW LEVEL SECURITY;
    ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
    ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE doh_compliance ENABLE ROW LEVEL SECURITY;
    ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

    -- Simplified RLS policies for better maintainability
    CREATE POLICY "healthcare_workers_can_access_patients" ON patients
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() 
          AND role IN ('doctor', 'nurse', 'therapist', 'admin')
          AND is_active = true
        )
      );

    CREATE POLICY "users_can_access_assigned_episodes" ON episodes
      FOR ALL USING (
        created_by = auth.uid() OR 
        auth.uid() IN (
          SELECT (care_team_member->>'user_id')::uuid 
          FROM jsonb_array_elements(care_team) AS care_team_member
        )
      );

    CREATE POLICY "users_can_access_related_clinical_forms" ON clinical_forms
      FOR ALL USING (
        created_by = auth.uid() OR 
        episode_id IN (
          SELECT id FROM episodes WHERE created_by = auth.uid()
        )
      );

    CREATE POLICY "users_can_view_own_profile" ON user_profiles
      FOR SELECT USING (id = auth.uid());

    CREATE POLICY "admins_can_manage_profiles" ON user_profiles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );

    CREATE POLICY "audit_logs_admin_only" ON audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
        )
      );
    
    -- Enhanced RLS policies for compliance tracking
    CREATE POLICY "compliance_tracking_authorized_access" ON compliance_tracking
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() 
          AND (role IN ('admin', 'supervisor', 'manager') OR security_clearance IN ('elevated', 'admin'))
        )
      );
    
    -- Security audit log policies
    CREATE POLICY "security_audit_log_admin_only" ON security_audit_log
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() 
          AND (role = 'admin' OR security_clearance = 'admin')
        )
      );
    
    -- Encryption keys policies
    CREATE POLICY "encryption_keys_admin_only" ON encryption_keys
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles 
          WHERE id = auth.uid() 
          AND role = 'admin' 
          AND security_clearance = 'admin'
        )
      );
  `,
};

// Streamlined ADHICS V2 Compliance Configuration
export const ADHICS_COMPLIANCE_CONFIG = {
  // Essential compliance domains only
  domains: [
    "patient_safety",
    "clinical_governance",
    "quality_management",
    "risk_management",
    "information_management",
  ],

  // Simplified validation rules
  validation_rules: {
    patient_safety: {
      required_fields: ["incident_reporting", "safety_protocols"],
      validation_frequency: "monthly",
    },
    clinical_governance: {
      required_fields: ["clinical_protocols", "staff_credentials"],
      validation_frequency: "quarterly",
    },
    quality_management: {
      required_fields: ["quality_indicators", "improvement_plans"],
      validation_frequency: "monthly",
    },
    risk_management: {
      required_fields: ["risk_assessment", "mitigation_plans"],
      validation_frequency: "quarterly",
    },
    information_management: {
      required_fields: ["data_security", "privacy_controls"],
      validation_frequency: "monthly",
    },
  },

  // Compliance status tracking
  status_levels: [
    "compliant",
    "partially_compliant",
    "non_compliant",
    "pending_review",
  ],
};

// Schema validation utilities
export const SCHEMA_UTILS = {
  // Validate table structure
  validateTableStructure: (tableName: string) => {
    return CORE_HEALTHCARE_SCHEMA[tableName] ? true : false;
  },

  // Get required fields for a table
  getRequiredFields: (tableName: string) => {
    const table = CORE_HEALTHCARE_SCHEMA[tableName];
    if (!table) return [];

    return Object.entries(table.schema)
      .filter(([_, field]: [string, any]) => field.required)
      .map(([fieldName, _]) => fieldName);
  },

  // Get foreign key relationships
  getForeignKeys: (tableName: string) => {
    const table = CORE_HEALTHCARE_SCHEMA[tableName];
    if (!table) return [];

    return Object.entries(table.schema)
      .filter(([_, field]: [string, any]) => field.foreignKey)
      .map(([fieldName, field]: [string, any]) => ({
        field: fieldName,
        references: field.foreignKey,
      }));
  },
};

export default CORE_HEALTHCARE_SCHEMA;
