-- Reyada Homecare Platform Database Schema
-- DOH-Compliant Healthcare Management System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Management
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'therapist', 'coordinator')),
    license_number VARCHAR(100),
    department VARCHAR(100),
    emirates_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emirates_id VARCHAR(20) UNIQUE NOT NULL,
    mrn VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    nationality VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    address JSONB,
    emergency_contact JSONB,
    insurance_info JSONB,
    medical_history JSONB,
    allergies TEXT[],
    medications JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Episodes
CREATE TABLE patient_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    episode_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'cancelled')),
    diagnosis JSONB,
    treatment_plan JSONB,
    assigned_clinician UUID REFERENCES user_profiles(id),
    insurance_authorization JSONB,
    doh_compliance_status JSONB,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical Documentation
CREATE TABLE clinical_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES patient_episodes(id) ON DELETE CASCADE,
    form_type VARCHAR(100) NOT NULL,
    form_data JSONB NOT NULL,
    doh_domains JSONB, -- 9-domain assessment data
    clinician_id UUID REFERENCES user_profiles(id),
    supervisor_id UUID REFERENCES user_profiles(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed', 'approved')),
    electronic_signature JSONB,
    compliance_flags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daman Claims
CREATE TABLE daman_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    episode_id UUID REFERENCES patient_episodes(id),
    claim_number VARCHAR(100) UNIQUE,
    submission_date DATE,
    service_date DATE,
    service_codes JSONB,
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    daman_response JSONB,
    authorization_number VARCHAR(100),
    denial_reason TEXT,
    submitted_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOH Compliance Tracking
CREATE TABLE doh_compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    episode_id UUID REFERENCES patient_episodes(id),
    compliance_type VARCHAR(100) NOT NULL,
    compliance_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'compliant' CHECK (status IN ('compliant', 'non_compliant', 'pending_review')),
    reviewed_by UUID REFERENCES user_profiles(id),
    review_date TIMESTAMP WITH TIME ZONE,
    remediation_actions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES user_profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Electronic Signatures
CREATE TABLE electronic_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    signer_id UUID REFERENCES user_profiles(id),
    signature_data JSONB NOT NULL,
    signature_hash VARCHAR(256) NOT NULL,
    timestamp_signed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    device_info JSONB,
    verification_status VARCHAR(20) DEFAULT 'valid' CHECK (verification_status IN ('valid', 'invalid', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emirates ID Verifications
CREATE TABLE emirates_id_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emirates_id VARCHAR(20) NOT NULL,
    verification_data JSONB NOT NULL,
    verification_status VARCHAR(20) NOT NULL,
    confidence_score DECIMAL(5,2),
    government_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    metric_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backup Records
CREATE TABLE backup_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_type VARCHAR(50) NOT NULL,
    backup_status VARCHAR(20) NOT NULL,
    backup_location VARCHAR(500),
    backup_size BIGINT,
    encryption_status BOOLEAN DEFAULT true,
    integrity_hash VARCHAR(256),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_patients_emirates_id ON patients(emirates_id);
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_episodes_patient_id ON patient_episodes(patient_id);
CREATE INDEX idx_episodes_status ON patient_episodes(status);
CREATE INDEX idx_clinical_forms_patient_id ON clinical_forms(patient_id);
CREATE INDEX idx_clinical_forms_episode_id ON clinical_forms(episode_id);
CREATE INDEX idx_clinical_forms_type ON clinical_forms(form_type);
CREATE INDEX idx_daman_claims_patient_id ON daman_claims(patient_id);
CREATE INDEX idx_daman_claims_status ON daman_claims(status);
CREATE INDEX idx_compliance_patient_id ON doh_compliance_records(patient_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_electronic_signatures_document ON electronic_signatures(document_id, document_type);
CREATE INDEX idx_emirates_verifications_id ON emirates_id_verifications(emirates_id);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_backup_records_status ON backup_records(backup_status);
CREATE INDEX idx_backup_records_type ON backup_records(backup_type);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE daman_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE doh_compliance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Clinicians can view assigned patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patient_episodes 
            WHERE patient_episodes.patient_id = patients.id 
            AND patient_episodes.assigned_clinician = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_episodes_updated_at BEFORE UPDATE ON patient_episodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinical_forms_updated_at BEFORE UPDATE ON clinical_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daman_claims_updated_at BEFORE UPDATE ON daman_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doh_compliance_records_updated_at BEFORE UPDATE ON doh_compliance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Audit triggers
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_patient_episodes AFTER INSERT OR UPDATE OR DELETE ON patient_episodes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_clinical_forms AFTER INSERT OR UPDATE OR DELETE ON clinical_forms FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_daman_claims AFTER INSERT OR UPDATE OR DELETE ON daman_claims FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
