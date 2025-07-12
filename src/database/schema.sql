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

-- DOH Referral Forms Indexes
CREATE INDEX idx_doh_referral_forms_patient_id ON doh_referral_forms(patient_id);
CREATE INDEX idx_doh_referral_forms_form_date ON doh_referral_forms(form_date);
CREATE INDEX idx_doh_referral_forms_patient_date ON doh_referral_forms(patient_id, form_date);
CREATE INDEX idx_doh_referral_forms_status ON doh_referral_forms(form_status);
CREATE INDEX idx_doh_referral_forms_generating_code ON doh_referral_forms(generating_code);
CREATE INDEX idx_doh_referral_forms_applied_code ON doh_referral_forms(applied_code);
CREATE INDEX idx_doh_referral_forms_compliance_status ON doh_referral_forms(compliance_status);
CREATE INDEX idx_doh_referral_forms_form_type ON doh_referral_forms(form_type);
CREATE INDEX idx_doh_referral_forms_treating_physician ON doh_referral_forms(treating_physician_id);
CREATE INDEX idx_doh_referral_forms_referring_physician ON doh_referral_forms(referring_physician_id);

-- Healthcare Providers Indexes
CREATE INDEX idx_healthcare_providers_license ON healthcare_providers(license_number);
CREATE INDEX idx_healthcare_providers_specialty ON healthcare_providers(specialty);
CREATE INDEX idx_healthcare_providers_facility ON healthcare_providers(facility_name);
CREATE INDEX idx_healthcare_providers_active ON healthcare_providers(is_active);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE daman_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE doh_compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE doh_referral_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;

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

-- DOH Referral Forms RLS Policies
CREATE POLICY "Healthcare providers can view referral forms" ON doh_referral_forms
    FOR SELECT USING (
        treating_physician_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR referring_physician_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create referral forms" ON doh_referral_forms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can update their referral forms" ON doh_referral_forms
    FOR UPDATE USING (
        treating_physician_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR referring_physician_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Healthcare Providers RLS Policies
CREATE POLICY "All authenticated users can view healthcare providers" ON healthcare_providers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage healthcare providers" ON healthcare_providers
    FOR ALL USING (
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
CREATE TRIGGER update_doh_referral_forms_updated_at BEFORE UPDATE ON doh_referral_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_healthcare_providers_updated_at BEFORE UPDATE ON healthcare_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Healthcare Providers Table (required for DOH referral forms)
CREATE TABLE healthcare_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialty VARCHAR(100),
    facility_name VARCHAR(255),
    facility_license VARCHAR(100),
    contact_info JSONB,
    credentials JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOH Referral Forms Table (PostgreSQL compatible)
CREATE TABLE doh_referral_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    referring_facility_name VARCHAR(200) NOT NULL,
    referring_facility_license VARCHAR(50) NOT NULL,
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('referral', 'periodic_assessment')),
    form_date DATE NOT NULL,
    pre_referral_status VARCHAR(50) CHECK (pre_referral_status IN ('inpatient_hospital', 'community', 'long_term_facility', 'rehab_hospital', 'other')),
    face_to_face_encounter JSONB NOT NULL, -- FTF details
    homebound_criteria JSONB NOT NULL, -- Homebound certification
    domains_of_care JSONB NOT NULL, -- Selected domains with details
    required_services JSONB NOT NULL, -- Services needed
    treating_physician_id UUID NOT NULL REFERENCES healthcare_providers(id),
    referring_physician_id UUID NOT NULL REFERENCES healthcare_providers(id),
    treating_physician_signature VARCHAR(500), -- Digital signature URL
    referring_physician_signature VARCHAR(500), -- Digital signature URL
    next_assessment_date DATE,
    discharge_plan JSONB, -- Discharge planning details
    form_status VARCHAR(50) DEFAULT 'draft' CHECK (form_status IN ('draft', 'completed', 'submitted', 'approved', 'rejected')),
    submission_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for Analytics & Business Intelligence Tables
CREATE INDEX idx_kpi_definitions_name ON kpi_definitions(kpi_name);
CREATE INDEX idx_kpi_definitions_code ON kpi_definitions(kpi_code);
CREATE INDEX idx_kpi_definitions_category ON kpi_definitions(category);
CREATE INDEX idx_kpi_definitions_active ON kpi_definitions(is_active);
CREATE INDEX idx_kpi_definitions_generating_code ON kpi_definitions(generating_code);
CREATE INDEX idx_kpi_definitions_applied_code ON kpi_definitions(applied_code);
CREATE INDEX idx_kpi_definitions_compliance ON kpi_definitions(compliance_status);
CREATE INDEX idx_kpi_definitions_frequency ON kpi_definitions(frequency);

CREATE INDEX idx_kpi_measurements_kpi_period ON kpi_measurements(kpi_id, measurement_period);
CREATE INDEX idx_kpi_measurements_performance ON kpi_measurements(performance_status, measurement_period);
CREATE INDEX idx_kpi_measurements_approved_by ON kpi_measurements(approved_by);
CREATE INDEX idx_kpi_measurements_generating_code ON kpi_measurements(generating_code);
CREATE INDEX idx_kpi_measurements_applied_code ON kpi_measurements(applied_code);
CREATE INDEX idx_kpi_measurements_compliance ON kpi_measurements(compliance_status);
CREATE INDEX idx_kpi_measurements_published ON kpi_measurements(published, published_date);
CREATE INDEX idx_kpi_measurements_trend ON kpi_measurements(trend);

-- Indexes for Data Encryption & Security Tables
CREATE INDEX idx_encryption_keys_key_id ON encryption_keys(key_id);
CREATE INDEX idx_encryption_keys_purpose ON encryption_keys(key_purpose);
CREATE INDEX idx_encryption_keys_status ON encryption_keys(status, expiry_date);
CREATE INDEX idx_encryption_keys_expiry ON encryption_keys(expiry_date);
CREATE INDEX idx_encryption_keys_generating_code ON encryption_keys(generating_code);
CREATE INDEX idx_encryption_keys_applied_code ON encryption_keys(applied_code);
CREATE INDEX idx_encryption_keys_compliance ON encryption_keys(compliance_status);
CREATE INDEX idx_encryption_keys_last_used ON encryption_keys(last_used);

CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_status ON user_sessions(user_id, session_status);
CREATE INDEX idx_user_sessions_active ON user_sessions(session_status, last_activity);
CREATE INDEX idx_user_sessions_ip_security ON user_sessions(ip_address, security_violations);
CREATE INDEX idx_user_sessions_login_time ON user_sessions(login_time);
CREATE INDEX idx_user_sessions_generating_code ON user_sessions(generating_code);
CREATE INDEX idx_user_sessions_applied_code ON user_sessions(applied_code);
CREATE INDEX idx_user_sessions_compliance ON user_sessions(compliance_status);
CREATE INDEX idx_user_sessions_concurrent ON user_sessions(user_id, is_concurrent);
CREATE INDEX idx_user_sessions_mfa ON user_sessions(mfa_verified, authentication_method);

-- Enable RLS for Analytics & Business Intelligence Tables
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_measurements ENABLE ROW LEVEL SECURITY;

-- Enable RLS for Data Encryption & Security Tables
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Analytics & Business Intelligence Tables
CREATE POLICY "All authenticated users can view KPI definitions" ON kpi_definitions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage KPI definitions" ON kpi_definitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view KPI measurements" ON kpi_measurements
    FOR SELECT USING (
        approved_by = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create KPI measurements" ON kpi_measurements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their KPI measurements" ON kpi_measurements
    FOR UPDATE USING (
        approved_by = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Data Encryption & Security Tables
CREATE POLICY "Admins can manage encryption keys" ON encryption_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "System can create user sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update triggers for Analytics & Business Intelligence Tables
CREATE TRIGGER update_kpi_definitions_updated_at BEFORE UPDATE ON kpi_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_measurements_updated_at BEFORE UPDATE ON kpi_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for Data Encryption & Security Tables
CREATE TRIGGER update_encryption_keys_updated_at BEFORE UPDATE ON encryption_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Analytics & Business Intelligence Tables
CREATE TRIGGER audit_kpi_definitions AFTER INSERT OR UPDATE OR DELETE ON kpi_definitions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_kpi_measurements AFTER INSERT OR UPDATE OR DELETE ON kpi_measurements FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Audit triggers for Data Encryption & Security Tables
CREATE TRIGGER audit_encryption_keys AFTER INSERT OR UPDATE OR DELETE ON encryption_keys FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_user_sessions AFTER INSERT OR UPDATE OR DELETE ON user_sessions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Functions for Analytics & Business Intelligence
-- ================================================

-- Function to auto-generate KPI codes
CREATE OR REPLACE FUNCTION generate_kpi_code()
RETURNS TRIGGER AS $
DECLARE
    category_prefix VARCHAR(3);
    sequence_num INTEGER;
    new_kpi_code VARCHAR(20);
BEGIN
    -- Get category prefix
    category_prefix := CASE NEW.category
        WHEN 'financial' THEN 'FIN'
        WHEN 'operational' THEN 'OPS'
        WHEN 'clinical' THEN 'CLI'
        WHEN 'patient_satisfaction' THEN 'SAT'
        WHEN 'staff_productivity' THEN 'PRD'
        ELSE 'GEN'
    END;
    
    -- Get next sequence number for this category
    SELECT COALESCE(MAX(CAST(RIGHT(kpi_code, 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM kpi_definitions
    WHERE kpi_code LIKE category_prefix || '%';
    
    -- Generate new KPI code: PREFIX-NNN
    new_kpi_code := category_prefix || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    NEW.kpi_code := new_kpi_code;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate KPI codes
CREATE TRIGGER generate_kpi_code_trigger
    BEFORE INSERT ON kpi_definitions
    FOR EACH ROW
    WHEN (NEW.kpi_code IS NULL OR NEW.kpi_code = '')
    EXECUTE FUNCTION generate_kpi_code();

-- Function to validate KPI measurements
CREATE OR REPLACE FUNCTION validate_kpi_measurement()
RETURNS TRIGGER AS $
DECLARE
    kpi_record RECORD;
BEGIN
    -- Get KPI definition
    SELECT * INTO kpi_record FROM kpi_definitions WHERE id = NEW.kpi_id;
    
    -- Set performance status based on thresholds
    IF kpi_record.threshold_green IS NOT NULL AND kpi_record.threshold_yellow IS NOT NULL AND kpi_record.threshold_red IS NOT NULL THEN
        IF kpi_record.trend_direction = 'higher_better' THEN
            IF NEW.measured_value >= kpi_record.threshold_green THEN
                NEW.performance_status := 'excellent';
            ELSIF NEW.measured_value >= kpi_record.threshold_yellow THEN
                NEW.performance_status := 'good';
            ELSIF NEW.measured_value >= kpi_record.threshold_red THEN
                NEW.performance_status := 'warning';
            ELSE
                NEW.performance_status := 'critical';
            END IF;
        ELSIF kpi_record.trend_direction = 'lower_better' THEN
            IF NEW.measured_value <= kpi_record.threshold_green THEN
                NEW.performance_status := 'excellent';
            ELSIF NEW.measured_value <= kpi_record.threshold_yellow THEN
                NEW.performance_status := 'good';
            ELSIF NEW.measured_value <= kpi_record.threshold_red THEN
                NEW.performance_status := 'warning';
            ELSE
                NEW.performance_status := 'critical';
            END IF;
        END IF;
    END IF;
    
    -- Set target value from KPI definition if not provided
    IF NEW.target_value IS NULL THEN
        NEW.target_value := kpi_record.target_value;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate KPI measurements
CREATE TRIGGER validate_kpi_measurement_trigger
    BEFORE INSERT OR UPDATE ON kpi_measurements
    FOR EACH ROW
    EXECUTE FUNCTION validate_kpi_measurement();

-- Functions for Data Encryption & Security
-- ================================================

-- Function to auto-expire encryption keys
CREATE OR REPLACE FUNCTION expire_encryption_keys()
RETURNS TRIGGER AS $
BEGIN
    -- Auto-expire keys that have passed their expiry date
    IF NEW.expiry_date < NOW() AND NEW.status = 'active' THEN
        NEW.status := 'expired';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-expire encryption keys
CREATE TRIGGER expire_encryption_keys_trigger
    BEFORE UPDATE ON encryption_keys
    FOR EACH ROW
    EXECUTE FUNCTION expire_encryption_keys();

-- Function to manage user session security
CREATE OR REPLACE FUNCTION manage_user_session_security()
RETURNS TRIGGER AS $
BEGIN
    -- Auto-expire sessions based on inactivity
    IF NEW.last_activity < (NOW() - INTERVAL '24 hours') AND NEW.session_status = 'active' THEN
        NEW.session_status := 'expired';
        NEW.logout_time := NOW();
    END IF;
    
    -- Lock session if too many security violations
    IF NEW.security_violations >= 5 AND NEW.session_status = 'active' THEN
        NEW.session_status := 'locked';
    END IF;
    
    -- Update concurrent session count
    IF TG_OP = 'INSERT' THEN
        UPDATE user_sessions 
        SET concurrent_session_count = (
            SELECT COUNT(*) FROM user_sessions 
            WHERE user_id = NEW.user_id AND session_status = 'active'
        ) + 1,
        is_concurrent = CASE WHEN (
            SELECT COUNT(*) FROM user_sessions 
            WHERE user_id = NEW.user_id AND session_status = 'active'
        ) > 0 THEN TRUE ELSE FALSE END
        WHERE user_id = NEW.user_id AND session_status = 'active';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to manage user session security
CREATE TRIGGER manage_user_session_security_trigger
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION manage_user_session_security();

-- Insert default KPI definitions
INSERT INTO kpi_definitions (kpi_name, category, description, calculation_formula, data_sources, target_value, unit_of_measure, frequency, trend_direction, threshold_green, threshold_yellow, threshold_red, generating_code, applied_code, created_by) VALUES
('Revenue Per Patient Episode', 'financial', 'Average revenue generated per patient episode', 'SUM(invoice_total) / COUNT(episodes)', '{"tables": ["invoices", "patient_episodes"]}', 3000.00, 'AED', 'monthly', 'higher_better', 3500.00, 3000.00, 2500.00, 'KPI_REVENUE_PER_EPISODE_001', 'APPLIED_REVENUE_PER_EPISODE_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Patient Visit Completion Rate', 'operational', 'Percentage of scheduled visits completed successfully', '(completed_visits / scheduled_visits) * 100', '{"tables": ["appointments"]}', 95.00, 'percentage', 'weekly', 'higher_better', 98.00, 95.00, 90.00, 'KPI_VISIT_COMPLETION_002', 'APPLIED_VISIT_COMPLETION_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Clinical Outcome Improvement', 'clinical', 'Percentage of patients showing clinical improvement', '(improved_patients / total_patients) * 100', '{"tables": ["clinical_forms", "patient_episodes"]}', 85.00, 'percentage', 'monthly', 'higher_better', 90.00, 85.00, 80.00, 'KPI_CLINICAL_IMPROVEMENT_003', 'APPLIED_CLINICAL_IMPROVEMENT_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Patient Satisfaction Index', 'patient_satisfaction', 'Overall patient satisfaction score', 'AVG(satisfaction_score)', '{"tables": ["appointments"]}', 4.5, 'score', 'monthly', 'higher_better', 4.7, 4.5, 4.0, 'KPI_PATIENT_SATISFACTION_004', 'APPLIED_PATIENT_SATISFACTION_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Staff Productivity Index', 'staff_productivity', 'Average number of patient visits per staff member per day', 'COUNT(appointments) / COUNT(DISTINCT provider_id) / working_days', '{"tables": ["appointments", "healthcare_providers"]}', 8.0, 'visits_per_day', 'weekly', 'higher_better', 10.0, 8.0, 6.0, 'KPI_STAFF_PRODUCTIVITY_005', 'APPLIED_STAFF_PRODUCTIVITY_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Equipment Utilization Rate', 'operational', 'Percentage of equipment actively in use', '(equipment_in_use / total_equipment) * 100', '{"tables": ["equipment"]}', 80.00, 'percentage', 'weekly', 'higher_better', 85.00, 80.00, 70.00, 'KPI_EQUIPMENT_UTILIZATION_006', 'APPLIED_EQUIPMENT_UTILIZATION_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Insurance Claim Approval Rate', 'financial', 'Percentage of insurance claims approved on first submission', '(approved_claims / submitted_claims) * 100', '{"tables": ["daman_claims", "pre_authorizations"]}', 90.00, 'percentage', 'monthly', 'higher_better', 95.00, 90.00, 85.00, 'KPI_CLAIM_APPROVAL_007', 'APPLIED_CLAIM_APPROVAL_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medication Adherence Rate', 'clinical', 'Percentage of patients adhering to prescribed medication regimens', '(adherent_patients / total_patients_on_medication) * 100', '{"tables": ["clinical_forms", "medical_records"]}', 85.00, 'percentage', 'monthly', 'higher_better', 90.00, 85.00, 80.00, 'KPI_MEDICATION_ADHERENCE_008', 'APPLIED_MEDICATION_ADHERENCE_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default encryption keys (placeholder - actual keys should be generated securely)
INSERT INTO encryption_keys (key_id, key_purpose, encryption_algorithm, key_strength, key_value, expiry_date, generating_code, applied_code, created_by) VALUES
('PATIENT_DATA_KEY_001', 'patient_data', 'AES-256-GCM', 256, decode('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF', 'hex'), NOW() + INTERVAL '1 year', 'EK_PATIENT_DATA_001', 'APPLIED_PATIENT_DATA_001', 'system'),
('DOCUMENT_KEY_001', 'documents', 'AES-256-GCM', 256, decode('FEDCBA9876543210FEDCBA9876543210FEDCBA9876543210FEDCBA9876543210', 'hex'), NOW() + INTERVAL '1 year', 'EK_DOCUMENT_001', 'APPLIED_DOCUMENT_001', 'system'),
('COMMUNICATION_KEY_001', 'communications', 'AES-256-GCM', 256, decode('1122334455667788990011223344556677889900112233445566778899001122', 'hex'), NOW() + INTERVAL '1 year', 'EK_COMMUNICATION_001', 'APPLIED_COMMUNICATION_001', 'system'),
('BACKUP_KEY_001', 'backups', 'AES-256-GCM', 256, decode('AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899', 'hex'), NOW() + INTERVAL '1 year', 'EK_BACKUP_001', 'APPLIED_BACKUP_001', 'system');

-- Scheduled job to clean up expired sessions (PostgreSQL extension required)
-- This would typically be implemented as a cron job or scheduled task
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete sessions older than 30 days
    DELETE FROM user_sessions 
    WHERE logout_time < (NOW() - INTERVAL '30 days')
    OR (session_status = 'expired' AND last_activity < (NOW() - INTERVAL '7 days'));
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, created_at)
    VALUES ('user_sessions', uuid_generate_v4(), 'CLEANUP', 
            jsonb_build_object('deleted_sessions', deleted_count, 'cleanup_date', NOW()),
            (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1), NOW());
    
    RETURN deleted_count;
END;
$ LANGUAGE plpgsql;

-- Function to rotate encryption keys
CREATE OR REPLACE FUNCTION rotate_encryption_key(key_id_param VARCHAR(100))
RETURNS BOOLEAN AS $
DECLARE
    key_record RECORD;
    new_key_value BYTEA;
BEGIN
    -- Get current key
    SELECT * INTO key_record FROM encryption_keys WHERE key_id = key_id_param AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Mark current key as rotated
    UPDATE encryption_keys 
    SET status = 'expired', 
        rotation_count = rotation_count + 1,
        updated_at = NOW()
    WHERE key_id = key_id_param AND status = 'active';
    
    -- Generate new key (placeholder - should use secure random generation)
    new_key_value := decode(md5(random()::text || clock_timestamp()::text), 'hex');
    
    -- Insert new key
    INSERT INTO encryption_keys (
        key_id, key_purpose, encryption_algorithm, key_strength, 
        key_value, expiry_date, generating_code, applied_code, created_by
    ) VALUES (
        key_id_param, key_record.key_purpose, key_record.encryption_algorithm, 
        key_record.key_strength, new_key_value, NOW() + INTERVAL '1 year',
        'ROTATED_' || key_record.generating_code, 'ROTATED_' || key_record.applied_code, 'system'
    );
    
    RETURN TRUE;
END;
$ LANGUAGE plpgsql;

-- Function to validate session security
CREATE OR REPLACE FUNCTION validate_session_security(session_id_param VARCHAR(255))
RETURNS JSONB AS $
DECLARE
    session_record RECORD;
    security_score INTEGER := 100;
    security_issues JSONB := '[]'::JSONB;
BEGIN
    -- Get session details
    SELECT * INTO session_record FROM user_sessions WHERE session_id = session_id_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'reason', 'Session not found');
    END IF;
    
    -- Check session status
    IF session_record.session_status != 'active' THEN
        RETURN jsonb_build_object('valid', false, 'reason', 'Session not active', 'status', session_record.session_status);
    END IF;
    
    -- Check session expiry
    IF session_record.last_activity < (NOW() - INTERVAL '24 hours') THEN
        UPDATE user_sessions SET session_status = 'expired', logout_time = NOW() WHERE session_id = session_id_param;
        RETURN jsonb_build_object('valid', false, 'reason', 'Session expired due to inactivity');
    END IF;
    
    -- Check security violations
    IF session_record.security_violations > 0 THEN
        security_score := security_score - (session_record.security_violations * 10);
        security_issues := security_issues || jsonb_build_object('type', 'security_violations', 'count', session_record.security_violations);
    END IF;
    
    -- Check failed attempts
    IF session_record.failed_attempts > 0 THEN
        security_score := security_score - (session_record.failed_attempts * 5);
        security_issues := security_issues || jsonb_build_object('type', 'failed_attempts', 'count', session_record.failed_attempts);
    END IF;
    
    -- Check MFA verification
    IF NOT session_record.mfa_verified AND session_record.authentication_method != 'sso' THEN
        security_score := security_score - 20;
        security_issues := security_issues || jsonb_build_object('type', 'mfa_not_verified');
    END IF;
    
    -- Update last activity
    UPDATE user_sessions SET last_activity = NOW() WHERE session_id = session_id_param;
    
    RETURN jsonb_build_object(
        'valid', true,
        'security_score', security_score,
        'security_issues', security_issues,
        'session_info', jsonb_build_object(
            'user_id', session_record.user_id,
            'login_time', session_record.login_time,
            'last_activity', NOW(),
            'authentication_method', session_record.authentication_method,
            'mfa_verified', session_record.mfa_verified
        )
    );
END;
$ LANGUAGE plpgsql;

-- Medical Records Table (required for homecare services)
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES patient_episodes(id) ON DELETE CASCADE,
    record_type VARCHAR(100) NOT NULL,
    record_data JSONB NOT NULL,
    clinical_notes TEXT,
    vital_signs JSONB,
    medications JSONB,
    allergies TEXT[],
    diagnosis_codes JSONB,
    treatment_plan JSONB,
    provider_id UUID REFERENCES user_profiles(id),
    facility_name VARCHAR(255),
    record_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Home Healthcare Domains Table
CREATE TABLE homecare_domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(100) UNIQUE NOT NULL,
    domain_code VARCHAR(10) UNIQUE,
    description TEXT,
    requires_skilled_nursing BOOLEAN DEFAULT TRUE,
    billing_category VARCHAR(20) CHECK (billing_category IN ('simple_visit', 'routine_care', 'advanced_care')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert DoH required domains
INSERT INTO homecare_domains (domain_name, domain_code, description, billing_category) VALUES
('Medication Management', 'MED', 'IV infusions, injections, narcotic administration', 'routine_care'),
('Nutrition/Hydration Care', 'NUT', 'Enteral feeding, TPN, nutritional assessment', 'routine_care'),
('Respiratory Care', 'RESP', 'Oxygen therapy, ventilator management, tracheostomy care', 'advanced_care'),
('Skin & Wound Care', 'WOUND', 'Complex wound care, pressure sore management', 'routine_care'),
('Bowel and Bladder Care', 'BOWEL', 'Catheter care, bladder training, peritoneal dialysis', 'routine_care'),
('Palliative Care', 'PALL', 'Pain management, symptom relief for terminal illness', 'routine_care'),
('Observation/Close Monitoring', 'OBS', 'Monitoring for high-risk patients', 'routine_care'),
('Post-Hospital Transitional Care', 'TRANS', 'Training and transitional care periods', 'routine_care'),
('Physiotherapy & Rehabilitation', 'REHAB', 'PT, OT, ST, RT services', 'simple_visit');

-- Home Healthcare Services Table
CREATE TABLE homecare_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    domain_id INTEGER NOT NULL REFERENCES homecare_domains(id),
    service_name VARCHAR(200) NOT NULL,
    service_description TEXT,
    type_of_care VARCHAR(20) NOT NULL CHECK (type_of_care IN ('simple_visit', 'routine_care', 'advanced_care')),
    daily_duration_hours DECIMAL(4, 2),
    weekly_frequency INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_duration_days INTEGER,
    provider_type_required VARCHAR(20) NOT NULL CHECK (provider_type_required IN ('RN', 'AN', 'PT', 'OT', 'ST', 'RT', 'physician')),
    requires_specialized_nurse BOOLEAN DEFAULT FALSE,
    equipment_needed JSONB,
    supplies_needed JSONB,
    skill_level_required VARCHAR(20) DEFAULT 'basic' CHECK (skill_level_required IN ('basic', 'intermediate', 'advanced')),
    training_required TEXT,
    safety_precautions TEXT,
    monitoring_parameters JSONB,
    expected_outcomes TEXT,
    discharge_criteria TEXT,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'discontinued')),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL REFERENCES healthcare_providers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOH Assessment Forms Table
CREATE TABLE doh_assessment_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    homecare_provider_name VARCHAR(200) NOT NULL,
    assessment_date DATE NOT NULL,
    next_assessment_date DATE NOT NULL,
    location_of_service VARCHAR(500) NOT NULL,
    services_summary JSONB NOT NULL, -- Service types with care levels
    level_of_care_determination JSONB NOT NULL, -- LOC calculations
    monitoring_questions JSONB NOT NULL, -- Clinical monitoring questions
    discharge_plan JSONB, -- Discharge planning if applicable
    homecare_physician_id UUID NOT NULL REFERENCES healthcare_providers(id),
    physician_signature VARCHAR(500),
    form_status VARCHAR(20) DEFAULT 'draft' CHECK (form_status IN ('draft', 'completed', 'submitted')),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- DOH Monitoring Forms Table
CREATE TABLE doh_monitoring_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    assessment_period_start DATE NOT NULL,
    assessment_period_end DATE NOT NULL,
    homecare_provider_name VARCHAR(200) NOT NULL,
    location_of_service VARCHAR(500) NOT NULL,
    clinical_monitoring_responses JSONB NOT NULL, -- All monitoring questions
    medication_management_metrics JSONB,
    nutrition_hydration_metrics JSONB,
    respiratory_care_metrics JSONB,
    wound_care_metrics JSONB,
    bowel_bladder_metrics JSONB,
    palliative_care_metrics JSONB,
    observation_monitoring_metrics JSONB,
    transitional_care_metrics JSONB,
    rehabilitation_metrics JSONB,
    overall_homecare_metrics JSONB,
    homecare_physician_id UUID NOT NULL REFERENCES healthcare_providers(id),
    physician_signature VARCHAR(500),
    form_status VARCHAR(20) DEFAULT 'draft' CHECK (form_status IN ('draft', 'completed', 'submitted')),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Additional Indexes for new tables
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_episode_id ON medical_records(episode_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_homecare_services_record_id ON homecare_services(medical_record_id);
CREATE INDEX idx_homecare_services_domain_status ON homecare_services(domain_id, status);
CREATE INDEX idx_homecare_services_generating_code ON homecare_services(generating_code);
CREATE INDEX idx_homecare_services_applied_code ON homecare_services(applied_code);
CREATE INDEX idx_doh_assessment_forms_patient_id ON doh_assessment_forms(patient_id);
CREATE INDEX idx_doh_assessment_forms_record_id ON doh_assessment_forms(medical_record_id);
CREATE INDEX idx_doh_assessment_forms_assessment_date ON doh_assessment_forms(assessment_date);
CREATE INDEX idx_doh_assessment_forms_generating_code ON doh_assessment_forms(generating_code);
CREATE INDEX idx_doh_assessment_forms_applied_code ON doh_assessment_forms(applied_code);
CREATE INDEX idx_doh_monitoring_forms_patient_id ON doh_monitoring_forms(patient_id);
CREATE INDEX idx_doh_monitoring_forms_period_start ON doh_monitoring_forms(assessment_period_start);
CREATE INDEX idx_doh_monitoring_forms_generating_code ON doh_monitoring_forms(generating_code);
CREATE INDEX idx_doh_monitoring_forms_applied_code ON doh_monitoring_forms(applied_code);

-- Enable RLS for new tables
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE homecare_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE homecare_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE doh_assessment_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE doh_monitoring_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Healthcare providers can view medical records" ON medical_records
    FOR SELECT USING (
        provider_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "All authenticated users can view homecare domains" ON homecare_domains
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Healthcare providers can view homecare services" ON homecare_services
    FOR SELECT USING (
        created_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can view assessment forms" ON doh_assessment_forms
    FOR SELECT USING (
        homecare_physician_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can view monitoring forms" ON doh_monitoring_forms
    FOR SELECT USING (
        homecare_physician_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

-- Update triggers for new tables
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homecare_services_updated_at BEFORE UPDATE ON homecare_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doh_assessment_forms_updated_at BEFORE UPDATE ON doh_assessment_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doh_monitoring_forms_updated_at BEFORE UPDATE ON doh_monitoring_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Care Planning & Team Coordination Tables
-- ================================================

-- Care Plans Table
CREATE TABLE care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    plan_name VARCHAR(200) NOT NULL,
    plan_type VARCHAR(20) DEFAULT 'initial' CHECK (plan_type IN ('initial', 'updated', 'emergency', 'discharge')),
    effective_date DATE NOT NULL,
    review_date DATE NOT NULL,
    estimated_length_of_stay INTEGER, -- days
    primary_diagnosis VARCHAR(500),
    goals_objectives JSONB NOT NULL, -- Structured goals
    interventions JSONB NOT NULL, -- Planned interventions
    patient_education_plan TEXT,
    family_education_plan TEXT,
    discharge_criteria TEXT,
    safety_measures TEXT,
    emergency_protocols TEXT,
    equipment_supplies_needed JSONB,
    interdisciplinary_team JSONB, -- Team member IDs and roles
    created_by UUID NOT NULL REFERENCES healthcare_providers(id),
    approved_by UUID REFERENCES healthcare_providers(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'discontinued')),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Care Plan Goals Table
CREATE TABLE care_plan_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_plan_id UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
    goal_category VARCHAR(20) NOT NULL CHECK (goal_category IN ('clinical', 'functional', 'educational', 'psychosocial', 'safety')),
    goal_description TEXT NOT NULL,
    target_date DATE,
    success_criteria TEXT,
    assigned_to UUID REFERENCES healthcare_providers(id), -- Healthcare provider responsible
    priority_level VARCHAR(10) DEFAULT 'medium' CHECK (priority_level IN ('high', 'medium', 'low')),
    current_status VARCHAR(20) DEFAULT 'not_started' CHECK (current_status IN ('not_started', 'in_progress', 'achieved', 'modified', 'discontinued')),
    progress_notes TEXT,
    last_reviewed_date DATE,
    reviewed_by UUID REFERENCES healthcare_providers(id),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Care Planning Tables
CREATE INDEX idx_care_plans_patient_id ON care_plans(patient_id);
CREATE INDEX idx_care_plans_medical_record_id ON care_plans(medical_record_id);
CREATE INDEX idx_care_plans_effective_date ON care_plans(patient_id, effective_date);
CREATE INDEX idx_care_plans_status ON care_plans(status);
CREATE INDEX idx_care_plans_generating_code ON care_plans(generating_code);
CREATE INDEX idx_care_plans_applied_code ON care_plans(applied_code);
CREATE INDEX idx_care_plans_created_by ON care_plans(created_by);
CREATE INDEX idx_care_plans_approved_by ON care_plans(approved_by);
CREATE INDEX idx_care_plan_goals_care_plan_id ON care_plan_goals(care_plan_id);
CREATE INDEX idx_care_plan_goals_status ON care_plan_goals(care_plan_id, current_status);
CREATE INDEX idx_care_plan_goals_assigned_to ON care_plan_goals(assigned_to);
CREATE INDEX idx_care_plan_goals_generating_code ON care_plan_goals(generating_code);
CREATE INDEX idx_care_plan_goals_applied_code ON care_plan_goals(applied_code);
CREATE INDEX idx_care_plan_goals_category ON care_plan_goals(goal_category);
CREATE INDEX idx_care_plan_goals_priority ON care_plan_goals(priority_level);

-- Enable RLS for Care Planning Tables
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plan_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Care Planning Tables
CREATE POLICY "Healthcare providers can view care plans" ON care_plans
    FOR SELECT USING (
        created_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create care plans" ON care_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can update their care plans" ON care_plans
    FOR UPDATE USING (
        created_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view care plan goals" ON care_plan_goals
    FOR SELECT USING (
        assigned_to IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM care_plans 
            WHERE care_plans.id = care_plan_goals.care_plan_id 
            AND (care_plans.created_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR care_plans.approved_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ))
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create care plan goals" ON care_plan_goals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can update care plan goals" ON care_plan_goals
    FOR UPDATE USING (
        assigned_to IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM care_plans 
            WHERE care_plans.id = care_plan_goals.care_plan_id 
            AND (care_plans.created_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR care_plans.approved_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ))
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Update triggers for Care Planning Tables
CREATE TRIGGER update_care_plans_updated_at BEFORE UPDATE ON care_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_plan_goals_updated_at BEFORE UPDATE ON care_plan_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Patient Addresses Table (required for appointment home visits)
CREATE TABLE patient_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'primary' CHECK (address_type IN ('primary', 'secondary', 'emergency', 'billing')),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'UAE',
    coordinates POINT,
    access_instructions TEXT,
    parking_instructions TEXT,
    security_codes TEXT,
    landmark_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    verified_date DATE,
    verified_by UUID REFERENCES user_profiles(id),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Appointment & Scheduling Tables
-- ================================================

-- Appointment Types Table
CREATE TABLE appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    requires_equipment BOOLEAN DEFAULT FALSE,
    equipment_list JSONB,
    preparation_instructions TEXT,
    billing_code VARCHAR(50),
    service_category VARCHAR(50),
    requires_physician BOOLEAN DEFAULT FALSE,
    requires_nurse BOOLEAN DEFAULT FALSE,
    requires_therapist BOOLEAN DEFAULT FALSE,
    max_daily_appointments INTEGER DEFAULT 10,
    buffer_time_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Service Locations Table
CREATE TABLE service_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_name VARCHAR(200) NOT NULL,
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('clinic', 'home', 'facility', 'hospital', 'rehabilitation_center')),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'UAE',
    coordinates POINT,
    contact_details JSONB,
    operating_hours JSONB,
    capacity INTEGER DEFAULT 1,
    equipment_available JSONB,
    accessibility_features JSONB,
    parking_availability BOOLEAN DEFAULT TRUE,
    public_transport_access JSONB,
    emergency_procedures TEXT,
    license_number VARCHAR(100),
    accreditation_details JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES patient_episodes(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id),
    appointment_type_id UUID NOT NULL REFERENCES appointment_types(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location_type VARCHAR(20) DEFAULT 'home' CHECK (location_type IN ('home', 'clinic', 'facility', 'hospital', 'rehabilitation_center')),
    service_location_id UUID REFERENCES service_locations(id),
    patient_address_id UUID REFERENCES patient_addresses(id),
    appointment_status VARCHAR(20) DEFAULT 'scheduled' CHECK (appointment_status IN ('scheduled', 'confirmed', 'in_transit', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency', 'follow_up')),
    chief_complaint TEXT,
    special_instructions TEXT,
    equipment_needed JSONB,
    estimated_travel_time INTEGER, -- minutes
    actual_travel_time INTEGER,
    mileage_distance DECIMAL(8,2),
    transportation_method VARCHAR(50),
    check_in_time TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancellation_date TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES user_profiles(id),
    rescheduled_from UUID REFERENCES appointments(id),
    rescheduled_to UUID REFERENCES appointments(id),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_instructions TEXT,
    patient_satisfaction_score INTEGER CHECK (patient_satisfaction_score BETWEEN 1 AND 5),
    patient_feedback TEXT,
    provider_notes TEXT,
    clinical_notes TEXT,
    vital_signs_taken JSONB,
    medications_administered JSONB,
    procedures_performed JSONB,
    billing_status VARCHAR(20) DEFAULT 'pending' CHECK (billing_status IN ('pending', 'billed', 'paid', 'cancelled', 'disputed')),
    billing_amount DECIMAL(10,2),
    insurance_authorization_number VARCHAR(100),
    daman_claim_number VARCHAR(100),
    weather_conditions VARCHAR(100),
    traffic_conditions VARCHAR(100),
    emergency_contact_notified BOOLEAN DEFAULT FALSE,
    family_present BOOLEAN DEFAULT FALSE,
    interpreter_required BOOLEAN DEFAULT FALSE,
    interpreter_language VARCHAR(50),
    consent_obtained BOOLEAN DEFAULT FALSE,
    consent_type VARCHAR(50),
    documentation_complete BOOLEAN DEFAULT FALSE,
    quality_metrics JSONB,
    compliance_flags JSONB,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment Resources Table (for equipment and staff allocation)
CREATE TABLE appointment_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('equipment', 'staff', 'vehicle', 'medication', 'supplies')),
    resource_id UUID, -- Generic reference to various resource tables
    resource_name VARCHAR(200) NOT NULL,
    quantity_required INTEGER DEFAULT 1,
    quantity_allocated INTEGER DEFAULT 0,
    allocation_status VARCHAR(20) DEFAULT 'pending' CHECK (allocation_status IN ('pending', 'allocated', 'confirmed', 'unavailable', 'cancelled')),
    allocated_by UUID REFERENCES user_profiles(id),
    allocation_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Appointment Notifications Table
CREATE TABLE appointment_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('reminder', 'confirmation', 'cancellation', 'rescheduling', 'arrival', 'completion')),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('patient', 'provider', 'family', 'coordinator')),
    recipient_contact JSONB NOT NULL, -- phone, email, etc.
    notification_method VARCHAR(20) NOT NULL CHECK (notification_method IN ('sms', 'email', 'phone', 'push', 'whatsapp')),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    message_content TEXT,
    response_received TEXT,
    retry_count INTEGER DEFAULT 0,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Appointment Conflicts Table (for scheduling conflict resolution)
CREATE TABLE appointment_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    conflicting_appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('time_overlap', 'provider_double_booking', 'location_conflict', 'resource_conflict', 'patient_double_booking')),
    conflict_severity VARCHAR(20) DEFAULT 'medium' CHECK (conflict_severity IN ('low', 'medium', 'high', 'critical')),
    conflict_description TEXT,
    resolution_status VARCHAR(20) DEFAULT 'unresolved' CHECK (resolution_status IN ('unresolved', 'resolved', 'escalated', 'ignored')),
    resolution_method VARCHAR(100),
    resolved_by UUID REFERENCES user_profiles(id),
    resolved_date TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for Appointment & Scheduling Tables
CREATE INDEX idx_patient_addresses_patient_id ON patient_addresses(patient_id);
CREATE INDEX idx_patient_addresses_type ON patient_addresses(patient_id, address_type);
CREATE INDEX idx_patient_addresses_generating_code ON patient_addresses(generating_code);
CREATE INDEX idx_patient_addresses_applied_code ON patient_addresses(applied_code);
CREATE INDEX idx_patient_addresses_active ON patient_addresses(is_active);

CREATE INDEX idx_appointment_types_name ON appointment_types(type_name);
CREATE INDEX idx_appointment_types_active ON appointment_types(is_active);
CREATE INDEX idx_appointment_types_generating_code ON appointment_types(generating_code);
CREATE INDEX idx_appointment_types_applied_code ON appointment_types(applied_code);
CREATE INDEX idx_appointment_types_category ON appointment_types(service_category);

CREATE INDEX idx_service_locations_type ON service_locations(location_type);
CREATE INDEX idx_service_locations_active ON service_locations(is_active);
CREATE INDEX idx_service_locations_generating_code ON service_locations(generating_code);
CREATE INDEX idx_service_locations_applied_code ON service_locations(applied_code);
CREATE INDEX idx_service_locations_city ON service_locations(city);

CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_appointments_provider_schedule ON appointments(provider_id, appointment_date, appointment_time);
CREATE INDEX idx_appointments_status_date ON appointments(appointment_status, appointment_date);
CREATE INDEX idx_appointments_location_date ON appointments(service_location_id, appointment_date);
CREATE INDEX idx_appointments_episode ON appointments(episode_id);
CREATE INDEX idx_appointments_type ON appointments(appointment_type_id);
CREATE INDEX idx_appointments_priority ON appointments(priority, appointment_date);
CREATE INDEX idx_appointments_billing_status ON appointments(billing_status);
CREATE INDEX idx_appointments_generating_code ON appointments(generating_code);
CREATE INDEX idx_appointments_applied_code ON appointments(applied_code);
CREATE INDEX idx_appointments_number ON appointments(appointment_number);
CREATE INDEX idx_appointments_follow_up ON appointments(follow_up_required, follow_up_date);
CREATE INDEX idx_appointments_rescheduled_from ON appointments(rescheduled_from);
CREATE INDEX idx_appointments_rescheduled_to ON appointments(rescheduled_to);

CREATE INDEX idx_appointment_resources_appointment ON appointment_resources(appointment_id);
CREATE INDEX idx_appointment_resources_type ON appointment_resources(resource_type);
CREATE INDEX idx_appointment_resources_status ON appointment_resources(allocation_status);
CREATE INDEX idx_appointment_resources_generating_code ON appointment_resources(generating_code);
CREATE INDEX idx_appointment_resources_applied_code ON appointment_resources(applied_code);

CREATE INDEX idx_appointment_notifications_appointment ON appointment_notifications(appointment_id);
CREATE INDEX idx_appointment_notifications_scheduled ON appointment_notifications(scheduled_time);
CREATE INDEX idx_appointment_notifications_status ON appointment_notifications(delivery_status);
CREATE INDEX idx_appointment_notifications_type ON appointment_notifications(notification_type);
CREATE INDEX idx_appointment_notifications_generating_code ON appointment_notifications(generating_code);
CREATE INDEX idx_appointment_notifications_applied_code ON appointment_notifications(applied_code);

CREATE INDEX idx_appointment_conflicts_primary ON appointment_conflicts(primary_appointment_id);
CREATE INDEX idx_appointment_conflicts_conflicting ON appointment_conflicts(conflicting_appointment_id);
CREATE INDEX idx_appointment_conflicts_type ON appointment_conflicts(conflict_type);
CREATE INDEX idx_appointment_conflicts_status ON appointment_conflicts(resolution_status);
CREATE INDEX idx_appointment_conflicts_severity ON appointment_conflicts(conflict_severity);
CREATE INDEX idx_appointment_conflicts_generating_code ON appointment_conflicts(generating_code);
CREATE INDEX idx_appointment_conflicts_applied_code ON appointment_conflicts(applied_code);

-- Enable RLS for Appointment & Scheduling Tables
ALTER TABLE patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Appointment & Scheduling Tables
CREATE POLICY "Healthcare providers can view patient addresses" ON patient_addresses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments 
            WHERE appointments.patient_address_id = patient_addresses.id 
            AND appointments.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "All authenticated users can view appointment types" ON appointment_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can view service locations" ON service_locations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Healthcare providers can view appointments" ON appointments
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create appointments" ON appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their appointments" ON appointments
    FOR UPDATE USING (
        provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view appointment resources" ON appointment_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments 
            WHERE appointments.id = appointment_resources.appointment_id 
            AND (appointments.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR appointments.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can view appointment notifications" ON appointment_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments 
            WHERE appointments.id = appointment_notifications.appointment_id 
            AND (appointments.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR appointments.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can view appointment conflicts" ON appointment_conflicts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments 
            WHERE (appointments.id = appointment_conflicts.primary_appointment_id 
                OR appointments.id = appointment_conflicts.conflicting_appointment_id)
            AND (appointments.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR appointments.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

-- Update triggers for Appointment & Scheduling Tables
CREATE TRIGGER update_patient_addresses_updated_at BEFORE UPDATE ON patient_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON appointment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_locations_updated_at BEFORE UPDATE ON service_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_resources_updated_at BEFORE UPDATE ON appointment_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_notifications_updated_at BEFORE UPDATE ON appointment_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_conflicts_updated_at BEFORE UPDATE ON appointment_conflicts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced Audit Triggers for Data Integrity and Compliance
-- ================================================

-- Enhanced audit trigger function with data integrity checks
CREATE OR REPLACE FUNCTION enhanced_audit_trigger_function()
RETURNS TRIGGER AS $
DECLARE
    current_user_id UUID;
    generating_code VARCHAR(100);
    applied_code VARCHAR(100);
    compliance_status VARCHAR(50);
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Generate audit codes
    generating_code := 'AUDIT_' || TG_TABLE_NAME || '_' || TG_OP || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;
    applied_code := 'APPLIED_AUDIT_' || TG_TABLE_NAME || '_' || TG_OP;
    compliance_status := 'DOH_COMPLIANT';
    
    -- Data integrity validation
    IF TG_OP = 'UPDATE' THEN
        -- Validate critical field changes
        IF TG_TABLE_NAME = 'patients' THEN
            -- Prevent unauthorized changes to critical patient data
            IF OLD.emirates_id != NEW.emirates_id AND current_user_id NOT IN (
                SELECT id FROM user_profiles WHERE role IN ('admin', 'coordinator')
            ) THEN
                RAISE EXCEPTION 'Unauthorized attempt to modify Emirates ID for patient %', OLD.mrn;
            END IF;
            
            -- Audit patient data changes with enhanced tracking
            INSERT INTO audit_logs (
                table_name, record_id, action, old_values, new_values, 
                user_id, ip_address, user_agent, created_at
            ) VALUES (
                TG_TABLE_NAME, NEW.id, TG_OP,
                jsonb_build_object(
                    'emirates_id', OLD.emirates_id,
                    'mrn', OLD.mrn,
                    'first_name', OLD.first_name,
                    'last_name', OLD.last_name,
                    'phone', OLD.phone,
                    'email', OLD.email,
                    'generating_code', generating_code,
                    'applied_code', applied_code,
                    'compliance_status', compliance_status
                ),
                jsonb_build_object(
                    'emirates_id', NEW.emirates_id,
                    'mrn', NEW.mrn,
                    'first_name', NEW.first_name,
                    'last_name', NEW.last_name,
                    'phone', NEW.phone,
                    'email', NEW.email,
                    'generating_code', generating_code,
                    'applied_code', applied_code,
                    'compliance_status', compliance_status
                ),
                current_user_id, inet_client_addr(), 
                current_setting('application_name', true), NOW()
            );
        END IF;
        
        -- Enhanced medical records audit
        IF TG_TABLE_NAME = 'medical_records' THEN
            INSERT INTO audit_logs (
                table_name, record_id, action, old_values, new_values, 
                user_id, created_at
            ) VALUES (
                TG_TABLE_NAME, NEW.id, TG_OP,
                jsonb_build_object(
                    'record_type', OLD.record_type,
                    'clinical_notes', OLD.clinical_notes,
                    'vital_signs', OLD.vital_signs,
                    'medications', OLD.medications,
                    'diagnosis_codes', OLD.diagnosis_codes,
                    'generating_code', generating_code,
                    'applied_code', applied_code
                ),
                jsonb_build_object(
                    'record_type', NEW.record_type,
                    'clinical_notes', NEW.clinical_notes,
                    'vital_signs', NEW.vital_signs,
                    'medications', NEW.medications,
                    'diagnosis_codes', NEW.diagnosis_codes,
                    'generating_code', generating_code,
                    'applied_code', applied_code
                ),
                current_user_id, NOW()
            );
        END IF;
        
        -- Enhanced appointment audit with status change tracking
        IF TG_TABLE_NAME = 'appointments' THEN
            -- Track appointment status changes
            IF OLD.appointment_status != NEW.appointment_status THEN
                INSERT INTO audit_logs (
                    table_name, record_id, action, old_values, new_values, 
                    user_id, created_at
                ) VALUES (
                    TG_TABLE_NAME, NEW.id, 'STATUS_CHANGE',
                    jsonb_build_object(
                        'old_status', OLD.appointment_status,
                        'appointment_date', OLD.appointment_date,
                        'patient_id', OLD.patient_id,
                        'provider_id', OLD.provider_id,
                        'generating_code', generating_code,
                        'applied_code', applied_code
                    ),
                    jsonb_build_object(
                        'new_status', NEW.appointment_status,
                        'appointment_date', NEW.appointment_date,
                        'patient_id', NEW.patient_id,
                        'provider_id', NEW.provider_id,
                        'generating_code', generating_code,
                        'applied_code', applied_code
                    ),
                    current_user_id, NOW()
                );
            END IF;
        END IF;
        
        -- Enhanced invoice payment audit
        IF TG_TABLE_NAME = 'invoices' THEN
            IF OLD.amount_paid != NEW.amount_paid THEN
                -- Update payment status based on amount paid
                NEW.payment_status := CASE
                    WHEN NEW.amount_paid = 0 THEN 'unpaid'
                    WHEN NEW.amount_paid >= NEW.total_amount THEN 'paid'
                    WHEN NEW.amount_paid > NEW.total_amount THEN 'overpaid'
                    ELSE 'partial'
                END;
                
                -- Audit payment changes
                INSERT INTO audit_logs (
                    table_name, record_id, action, old_values, new_values, 
                    user_id, created_at
                ) VALUES (
                    TG_TABLE_NAME, NEW.id, 'PAYMENT_UPDATE',
                    jsonb_build_object(
                        'old_amount_paid', OLD.amount_paid,
                        'old_payment_status', OLD.payment_status,
                        'total_amount', OLD.total_amount,
                        'generating_code', generating_code,
                        'applied_code', applied_code
                    ),
                    jsonb_build_object(
                        'new_amount_paid', NEW.amount_paid,
                        'new_payment_status', NEW.payment_status,
                        'total_amount', NEW.total_amount,
                        'generating_code', generating_code,
                        'applied_code', applied_code
                    ),
                    current_user_id, NOW()
                );
            END IF;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            table_name, record_id, action, new_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, 
            jsonb_build_object(
                'record_data', row_to_json(NEW),
                'generating_code', generating_code,
                'applied_code', applied_code,
                'compliance_status', compliance_status
            ),
            current_user_id, NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            table_name, record_id, action, old_values, user_id, created_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, 
            jsonb_build_object(
                'record_data', row_to_json(OLD),
                'generating_code', generating_code,
                'applied_code', applied_code,
                'compliance_status', compliance_status
            ),
            current_user_id, NOW()
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Enhanced prescription audit trigger
CREATE OR REPLACE FUNCTION prescription_audit_trigger()
RETURNS TRIGGER AS $
DECLARE
    patient_record RECORD;
    prescribing_provider RECORD;
BEGIN
    -- Get patient information
    SELECT * INTO patient_record FROM patients WHERE id = (
        SELECT patient_id FROM medical_records WHERE id = NEW.medical_record_id
    );
    
    -- Get prescribing provider information
    SELECT * INTO prescribing_provider FROM healthcare_providers WHERE id = NEW.prescribed_by;
    
    -- Create detailed prescription audit
    INSERT INTO audit_logs (
        table_name, record_id, action, new_values, user_id, created_at
    ) VALUES (
        'prescriptions', NEW.id, 'PRESCRIPTION_CREATED',
        jsonb_build_object(
            'patient_mrn', patient_record.mrn,
            'patient_name', patient_record.first_name || ' ' || patient_record.last_name,
            'medication_name', NEW.medication_name,
            'dosage', NEW.dosage,
            'frequency', NEW.frequency,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date,
            'prescribing_provider', prescribing_provider.provider_name,
            'provider_license', prescribing_provider.license_number,
            'generating_code', 'PRESCRIPTION_AUDIT_' || NEW.id::TEXT,
            'applied_code', 'APPLIED_PRESCRIPTION_' || NEW.id::TEXT,
            'compliance_status', 'DOH_COMPLIANT'
        ),
        NEW.prescribed_by, NOW()
    );
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Data integrity validation trigger
CREATE OR REPLACE FUNCTION data_integrity_validation_trigger()
RETURNS TRIGGER AS $
BEGIN
    -- Validate Emirates ID format
    IF TG_TABLE_NAME = 'patients' AND NEW.emirates_id IS NOT NULL THEN
        IF LENGTH(NEW.emirates_id) != 15 OR NEW.emirates_id !~ '^[0-9]{15}

-- Route Optimization for Home Visits
-- ================================================

-- Route Optimizations Table
CREATE TABLE route_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    optimization_date DATE NOT NULL,
    total_appointments INTEGER NOT NULL,
    total_distance_km DECIMAL(8, 2),
    total_travel_time_minutes INTEGER,
    optimization_algorithm VARCHAR(50) DEFAULT 'genetic_algorithm', -- e.g., 'genetic_algorithm', 'nearest_neighbor', 'ant_colony', 'simulated_annealing'
    route_sequence JSONB NOT NULL, -- Ordered list of appointment IDs with timestamps
    waypoints JSONB, -- GPS coordinates in order with metadata
    traffic_considerations JSONB, -- Real-time traffic data and predictions
    weather_considerations JSONB, -- Weather impact on travel times
    fuel_consumption_estimate DECIMAL(6, 2), -- Liters
    carbon_footprint_kg DECIMAL(8, 4), -- Environmental impact tracking
    optimization_score DECIMAL(5, 2), -- Efficiency score (0-100)
    actual_distance_km DECIMAL(8, 2), -- Post-execution actual distance
    actual_travel_time_minutes INTEGER, -- Post-execution actual time
    deviations_from_plan JSONB, -- Tracking of route changes and reasons
    route_status VARCHAR(20) DEFAULT 'planned' CHECK (route_status IN ('planned', 'active', 'completed', 'cancelled', 'modified')),
    optimization_parameters JSONB, -- Algorithm-specific parameters used
    cost_analysis JSONB, -- Financial cost breakdown
    patient_satisfaction_metrics JSONB, -- Patient feedback on timing
    emergency_contingencies JSONB, -- Emergency route alternatives
    vehicle_type VARCHAR(50), -- Type of vehicle used for optimization
    driver_preferences JSONB, -- Driver-specific routing preferences
    accessibility_requirements JSONB, -- Special accessibility considerations
    time_window_constraints JSONB, -- Patient availability windows
    service_duration_estimates JSONB, -- Expected time at each location
    route_complexity_score DECIMAL(4, 2), -- Complexity rating for the route
    optimization_duration_seconds INTEGER, -- Time taken to compute optimization
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route Optimization Metrics Table (for performance tracking)
CREATE TABLE route_optimization_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_optimization_id UUID NOT NULL REFERENCES route_optimizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('efficiency', 'cost_savings', 'time_savings', 'fuel_savings', 'patient_satisfaction', 'environmental_impact')),
    metric_value DECIMAL(10, 4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL, -- e.g., 'percentage', 'minutes', 'km', 'liters', 'kg_co2'
    baseline_value DECIMAL(10, 4), -- Comparison baseline
    improvement_percentage DECIMAL(5, 2), -- Calculated improvement
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(100), -- Source of the metric data
    confidence_level DECIMAL(3, 2), -- Confidence in the measurement (0-1)
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Route Optimization History Table (for tracking changes)
CREATE TABLE route_optimization_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_optimization_id UUID NOT NULL REFERENCES route_optimizations(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('created', 'modified', 'cancelled', 'completed', 'emergency_change')),
    change_reason TEXT,
    previous_route_data JSONB, -- Previous route configuration
    new_route_data JSONB, -- New route configuration
    impact_analysis JSONB, -- Analysis of the change impact
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES user_profiles(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    change_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Route Optimization Tables
CREATE INDEX idx_route_optimizations_provider_date ON route_optimizations(provider_id, optimization_date);
CREATE INDEX idx_route_optimizations_status ON route_optimizations(route_status);
CREATE INDEX idx_route_optimizations_date ON route_optimizations(optimization_date);
CREATE INDEX idx_route_optimizations_algorithm ON route_optimizations(optimization_algorithm);
CREATE INDEX idx_route_optimizations_score ON route_optimizations(optimization_score);
CREATE INDEX idx_route_optimizations_generating_code ON route_optimizations(generating_code);
CREATE INDEX idx_route_optimizations_applied_code ON route_optimizations(applied_code);
CREATE INDEX idx_route_optimizations_created_by ON route_optimizations(created_by);
CREATE INDEX idx_route_optimizations_compliance ON route_optimizations(compliance_status);

CREATE INDEX idx_route_optimization_metrics_route_id ON route_optimization_metrics(route_optimization_id);
CREATE INDEX idx_route_optimization_metrics_type ON route_optimization_metrics(metric_type);
CREATE INDEX idx_route_optimization_metrics_date ON route_optimization_metrics(measurement_date);
CREATE INDEX idx_route_optimization_metrics_generating_code ON route_optimization_metrics(generating_code);
CREATE INDEX idx_route_optimization_metrics_applied_code ON route_optimization_metrics(applied_code);

CREATE INDEX idx_route_optimization_history_route_id ON route_optimization_history(route_optimization_id);
CREATE INDEX idx_route_optimization_history_type ON route_optimization_history(change_type);
CREATE INDEX idx_route_optimization_history_timestamp ON route_optimization_history(change_timestamp);
CREATE INDEX idx_route_optimization_history_generating_code ON route_optimization_history(generating_code);
CREATE INDEX idx_route_optimization_history_applied_code ON route_optimization_history(applied_code);
CREATE INDEX idx_route_optimization_history_created_by ON route_optimization_history(created_by);

-- Enable RLS for Route Optimization Tables
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Route Optimization Tables
CREATE POLICY "Healthcare providers can view their route optimizations" ON route_optimizations
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create route optimizations" ON route_optimizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their route optimizations" ON route_optimizations
    FOR UPDATE USING (
        provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view route optimization metrics" ON route_optimization_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM route_optimizations 
            WHERE route_optimizations.id = route_optimization_metrics.route_optimization_id 
            AND (route_optimizations.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR route_optimizations.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create route optimization metrics" ON route_optimization_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can view route optimization history" ON route_optimization_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM route_optimizations 
            WHERE route_optimizations.id = route_optimization_history.route_optimization_id 
            AND (route_optimizations.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR route_optimizations.created_by = auth.uid())
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create route optimization history" ON route_optimization_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

-- Update triggers for Route Optimization Tables
CREATE TRIGGER update_route_optimizations_updated_at BEFORE UPDATE ON route_optimizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_optimization_metrics_updated_at BEFORE UPDATE ON route_optimization_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Route Optimization Tables
CREATE TRIGGER audit_route_optimizations AFTER INSERT OR UPDATE OR DELETE ON route_optimizations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_route_optimization_metrics AFTER INSERT OR UPDATE OR DELETE ON route_optimization_metrics FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_route_optimization_history AFTER INSERT OR UPDATE OR DELETE ON route_optimization_history FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Billing & Insurance Tables
-- ================================================

-- Insurance Companies Table (required for billing)
CREATE TABLE insurance_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    company_code VARCHAR(20) UNIQUE NOT NULL,
    contact_info JSONB,
    billing_address JSONB,
    payment_terms_days INTEGER DEFAULT 30,
    electronic_billing_enabled BOOLEAN DEFAULT FALSE,
    api_credentials JSONB,
    contract_details JSONB,
    coverage_types JSONB,
    preauthorization_required BOOLEAN DEFAULT TRUE,
    claim_submission_format VARCHAR(50) DEFAULT 'electronic',
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- CPT Codes Table (required for billing)
CREATE TABLE cpt_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpt_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    base_rvu DECIMAL(8, 4), -- Relative Value Units
    work_rvu DECIMAL(8, 4),
    practice_expense_rvu DECIMAL(8, 4),
    malpractice_rvu DECIMAL(8, 4),
    modifier_allowed BOOLEAN DEFAULT TRUE,
    bilateral_surgery BOOLEAN DEFAULT FALSE,
    assistant_surgery BOOLEAN DEFAULT FALSE,
    co_surgery BOOLEAN DEFAULT FALSE,
    multiple_procedure BOOLEAN DEFAULT FALSE,
    effective_date DATE NOT NULL,
    termination_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Service Tariffs Table
CREATE TABLE service_tariffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(200) NOT NULL,
    service_code VARCHAR(20) UNIQUE NOT NULL,
    cpt_code_id UUID REFERENCES cpt_codes(id),
    insurance_company_id UUID REFERENCES insurance_companies(id),
    level_of_care VARCHAR(30) CHECK (level_of_care IN ('simple_home_visit', 'routine_home_nursing', 'advanced_home_nursing', 'specialized_home_visit')),
    base_price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER,
    requires_preauthorization BOOLEAN DEFAULT FALSE,
    billing_unit VARCHAR(20) DEFAULT 'per_visit' CHECK (billing_unit IN ('per_visit', 'per_hour', 'per_day', 'per_procedure')),
    maximum_units_per_day INTEGER,
    maximum_units_per_week INTEGER,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Pre-Authorizations Table
CREATE TABLE pre_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID NOT NULL REFERENCES insurance_companies(id),
    authorization_number VARCHAR(100) UNIQUE,
    request_date DATE NOT NULL,
    requested_by UUID NOT NULL REFERENCES healthcare_providers(id),
    requested_services JSONB NOT NULL, -- List of requested services
    medical_justification TEXT NOT NULL,
    supporting_documents JSONB, -- URLs to uploaded documents
    authorization_status VARCHAR(20) DEFAULT 'pending' CHECK (authorization_status IN ('pending', 'approved', 'denied', 'expired', 'cancelled')),
    approved_services JSONB, -- Services actually approved
    approval_date DATE,
    effective_date DATE,
    expiry_date DATE,
    approved_units INTEGER,
    used_units INTEGER DEFAULT 0,
    denial_reason TEXT,
    reviewer_notes TEXT,
    insurance_reviewer VARCHAR(200),
    appeal_deadline DATE,
    appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'filed', 'approved', 'denied')),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID REFERENCES insurance_companies(id),
    medical_record_id UUID REFERENCES medical_records(id),
    appointment_id UUID REFERENCES appointments(id),
    invoice_date DATE NOT NULL,
    service_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('patient', 'insurance', 'mixed')),
    subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    patient_responsibility DECIMAL(12, 2) DEFAULT 0.00,
    insurance_responsibility DECIMAL(12, 2) DEFAULT 0.00,
    copay_amount DECIMAL(12, 2) DEFAULT 0.00,
    deductible_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_terms_days INTEGER DEFAULT 30,
    due_date DATE NOT NULL,
    invoice_status VARCHAR(20) DEFAULT 'draft' CHECK (invoice_status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overpaid', 'refunded')),
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    balance_due DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    billing_address TEXT,
    notes TEXT,
    internal_notes TEXT,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    sent_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Line Items Table
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_tariff_id UUID REFERENCES service_tariffs(id),
    description VARCHAR(500) NOT NULL,
    service_code VARCHAR(20),
    cpt_code VARCHAR(10),
    service_date DATE NOT NULL,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id),
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    preauthorization_id UUID REFERENCES pre_authorizations(id),
    diagnosis_codes JSONB, -- ICD codes for this service
    modifiers JSONB, -- CPT modifiers if applicable
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Payment Records Table (for tracking payments)
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'insurance_payment', 'online_payment')),
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_reference VARCHAR(100),
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_processor VARCHAR(100),
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (payment_amount - processing_fee) STORED,
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    payment_notes TEXT,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_date DATE,
    refund_reason TEXT,
    reconciliation_status VARCHAR(20) DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'matched', 'disputed', 'resolved')),
    bank_deposit_date DATE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Adjustments Table (for corrections and adjustments)
CREATE TABLE billing_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('discount', 'write_off', 'correction', 'insurance_adjustment', 'contractual_adjustment')),
    adjustment_amount DECIMAL(12, 2) NOT NULL,
    adjustment_date DATE NOT NULL,
    reason_code VARCHAR(20),
    description TEXT NOT NULL,
    approved_by UUID NOT NULL REFERENCES user_profiles(id),
    approval_date DATE NOT NULL,
    reversal_allowed BOOLEAN DEFAULT TRUE,
    reversed_by UUID REFERENCES user_profiles(id),
    reversal_date DATE,
    reversal_reason TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Billing & Insurance Tables
CREATE INDEX idx_insurance_companies_code ON insurance_companies(company_code);
CREATE INDEX idx_insurance_companies_active ON insurance_companies(is_active);
CREATE INDEX idx_insurance_companies_generating_code ON insurance_companies(generating_code);
CREATE INDEX idx_insurance_companies_applied_code ON insurance_companies(applied_code);

CREATE INDEX idx_cpt_codes_code ON cpt_codes(cpt_code);
CREATE INDEX idx_cpt_codes_category ON cpt_codes(category);
CREATE INDEX idx_cpt_codes_effective_date ON cpt_codes(effective_date, termination_date);
CREATE INDEX idx_cpt_codes_active ON cpt_codes(is_active);
CREATE INDEX idx_cpt_codes_generating_code ON cpt_codes(generating_code);
CREATE INDEX idx_cpt_codes_applied_code ON cpt_codes(applied_code);

CREATE INDEX idx_service_tariffs_service_code ON service_tariffs(service_code);
CREATE INDEX idx_service_tariffs_insurance_pricing ON service_tariffs(service_code, insurance_company_id);
CREATE INDEX idx_service_tariffs_effective_dates ON service_tariffs(effective_date, expiry_date);
CREATE INDEX idx_service_tariffs_level_care ON service_tariffs(level_of_care);
CREATE INDEX idx_service_tariffs_active ON service_tariffs(is_active);
CREATE INDEX idx_service_tariffs_generating_code ON service_tariffs(generating_code);
CREATE INDEX idx_service_tariffs_applied_code ON service_tariffs(applied_code);

CREATE INDEX idx_pre_authorizations_patient_id ON pre_authorizations(patient_id);
CREATE INDEX idx_pre_authorizations_insurance_id ON pre_authorizations(insurance_company_id);
CREATE INDEX idx_pre_authorizations_auth_number ON pre_authorizations(authorization_number);
CREATE INDEX idx_pre_authorizations_status_tracking ON pre_authorizations(authorization_status, expiry_date);
CREATE INDEX idx_pre_authorizations_request_date ON pre_authorizations(patient_id, request_date);
CREATE INDEX idx_pre_authorizations_generating_code ON pre_authorizations(generating_code);
CREATE INDEX idx_pre_authorizations_applied_code ON pre_authorizations(applied_code);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_patient_date ON invoices(patient_id, invoice_date);
CREATE INDEX idx_invoices_insurance_date ON invoices(insurance_company_id, invoice_date);
CREATE INDEX idx_invoices_status_due ON invoices(invoice_status, due_date);
CREATE INDEX idx_invoices_payment_tracking ON invoices(payment_status, balance_due);
CREATE INDEX idx_invoices_service_date ON invoices(service_date);
CREATE INDEX idx_invoices_generating_code ON invoices(generating_code);
CREATE INDEX idx_invoices_applied_code ON invoices(applied_code);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_service_billing ON invoice_line_items(service_code, service_date);
CREATE INDEX idx_invoice_line_items_provider_id ON invoice_line_items(provider_id);
CREATE INDEX idx_invoice_line_items_preauth_id ON invoice_line_items(preauthorization_id);
CREATE INDEX idx_invoice_line_items_generating_code ON invoice_line_items(generating_code);
CREATE INDEX idx_invoice_line_items_applied_code ON invoice_line_items(applied_code);

CREATE INDEX idx_payment_records_invoice_id ON payment_records(invoice_id);
CREATE INDEX idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX idx_payment_records_payment_method ON payment_records(payment_method);
CREATE INDEX idx_payment_records_status ON payment_records(payment_status);
CREATE INDEX idx_payment_records_reconciliation ON payment_records(reconciliation_status);
CREATE INDEX idx_payment_records_generating_code ON payment_records(generating_code);
CREATE INDEX idx_payment_records_applied_code ON payment_records(applied_code);

CREATE INDEX idx_billing_adjustments_invoice_id ON billing_adjustments(invoice_id);
CREATE INDEX idx_billing_adjustments_type ON billing_adjustments(adjustment_type);
CREATE INDEX idx_billing_adjustments_date ON billing_adjustments(adjustment_date);
CREATE INDEX idx_billing_adjustments_approved_by ON billing_adjustments(approved_by);
CREATE INDEX idx_billing_adjustments_generating_code ON billing_adjustments(generating_code);
CREATE INDEX idx_billing_adjustments_applied_code ON billing_adjustments(applied_code);

-- Enable RLS for Billing & Insurance Tables
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Billing & Insurance Tables
CREATE POLICY "All authenticated users can view insurance companies" ON insurance_companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage insurance companies" ON insurance_companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view CPT codes" ON cpt_codes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage CPT codes" ON cpt_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view service tariffs" ON service_tariffs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage service tariffs" ON service_tariffs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view pre-authorizations" ON pre_authorizations
    FOR SELECT USING (
        requested_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create pre-authorizations" ON pre_authorizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their pre-authorizations" ON pre_authorizations
    FOR UPDATE USING (
        requested_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view invoices" ON invoices
    FOR SELECT USING (
        created_by = auth.uid()
        OR approved_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create invoices" ON invoices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their invoices" ON invoices
    FOR UPDATE USING (
        created_by = auth.uid()
        OR approved_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view invoice line items" ON invoice_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND (invoices.created_by = auth.uid() OR invoices.approved_by = auth.uid())
        )
        OR provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create invoice line items" ON invoice_line_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can view payment records" ON payment_records
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payment_records.invoice_id 
            AND (invoices.created_by = auth.uid() OR invoices.approved_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create payment records" ON payment_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can view billing adjustments" ON billing_adjustments
    FOR SELECT USING (
        created_by = auth.uid()
        OR approved_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = billing_adjustments.invoice_id 
            AND (invoices.created_by = auth.uid() OR invoices.approved_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create billing adjustments" ON billing_adjustments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

-- Update triggers for Billing & Insurance Tables
CREATE TRIGGER update_insurance_companies_updated_at BEFORE UPDATE ON insurance_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cpt_codes_updated_at BEFORE UPDATE ON cpt_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_tariffs_updated_at BEFORE UPDATE ON service_tariffs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pre_authorizations_updated_at BEFORE UPDATE ON pre_authorizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_line_items_updated_at BEFORE UPDATE ON invoice_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_adjustments_updated_at BEFORE UPDATE ON billing_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Billing & Insurance Tables
CREATE TRIGGER audit_insurance_companies AFTER INSERT OR UPDATE OR DELETE ON insurance_companies FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_cpt_codes AFTER INSERT OR UPDATE OR DELETE ON cpt_codes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_service_tariffs AFTER INSERT OR UPDATE OR DELETE ON service_tariffs FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_pre_authorizations AFTER INSERT OR UPDATE OR DELETE ON pre_authorizations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_invoice_line_items AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_payment_records AFTER INSERT OR UPDATE OR DELETE ON payment_records FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_billing_adjustments AFTER INSERT OR UPDATE OR DELETE ON billing_adjustments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Payments & Financial Transactions
-- ================================================

-- Payment Methods Table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_name VARCHAR(50) UNIQUE NOT NULL,
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('cash', 'card', 'bank_transfer', 'cheque', 'online', 'insurance')),
    requires_reference BOOLEAN DEFAULT FALSE,
    processing_fee_percentage DECIMAL(5, 4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Enhanced Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(30) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID REFERENCES insurance_companies(id),
    payment_date DATE NOT NULL,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('full_payment', 'partial_payment', 'advance_payment', 'refund', 'adjustment')),
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    reference_number VARCHAR(100), -- Cheque number, transaction ID, etc.
    bank_name VARCHAR(200),
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (payment_amount - processing_fee) STORED,
    payment_status VARCHAR(20) DEFAULT 'cleared' CHECK (payment_status IN ('pending', 'cleared', 'bounced', 'cancelled', 'refunded')),
    clearance_date DATE,
    bounced_reason TEXT,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_date DATE,
    notes TEXT,
    received_by UUID NOT NULL REFERENCES healthcare_providers(id),
    approved_by UUID REFERENCES healthcare_providers(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    receipt_printed BOOLEAN DEFAULT FALSE,
    receipt_sent BOOLEAN DEFAULT FALSE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Quality Metrics & Reporting
-- ================================================

-- Quality Indicators Table
CREATE TABLE quality_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_name VARCHAR(200) UNIQUE NOT NULL,
    indicator_code VARCHAR(20) UNIQUE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('clinical', 'safety', 'efficiency', 'satisfaction', 'financial')),
    description TEXT,
    measurement_unit VARCHAR(50),
    target_value DECIMAL(10, 4),
    calculation_method TEXT,
    data_sources JSONB, -- Tables/fields used for calculation
    reporting_frequency VARCHAR(20) CHECK (reporting_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    is_jawda_indicator BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Quality Measurements Table
CREATE TABLE quality_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID NOT NULL REFERENCES quality_indicators(id) ON DELETE CASCADE,
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    measured_value DECIMAL(15, 6) NOT NULL,
    target_value DECIMAL(15, 6),
    variance_percentage DECIMAL(8, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN target_value > 0 THEN ((measured_value - target_value) / target_value) * 100 
            ELSE NULL 
        END
    ) STORED,
    numerator BIGINT, -- For ratio indicators
    denominator BIGINT, -- For ratio indicators
    sample_size BIGINT,
    confidence_interval VARCHAR(50),
    measurement_notes TEXT,
    data_quality_score SMALLINT CHECK (data_quality_score BETWEEN 1 AND 5), -- 1-5 rating of data completeness/accuracy
    calculated_by VARCHAR(100), -- System process or user
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES healthcare_providers(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    reported_to_doh BOOLEAN DEFAULT FALSE,
    doh_submission_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Financial Transactions Table (for comprehensive financial tracking)
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(30) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'transfer', 'fee', 'discount')),
    related_payment_id UUID REFERENCES payments(id),
    related_invoice_id UUID REFERENCES invoices(id),
    patient_id UUID REFERENCES patients(id),
    transaction_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    description TEXT NOT NULL,
    account_code VARCHAR(20), -- For accounting integration
    cost_center VARCHAR(50),
    department VARCHAR(100),
    transaction_status VARCHAR(20) DEFAULT 'completed' CHECK (transaction_status IN ('pending', 'completed', 'cancelled', 'reversed')),
    reversal_transaction_id UUID REFERENCES financial_transactions(id),
    reversal_reason TEXT,
    reconciliation_status VARCHAR(20) DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'reconciled', 'disputed')),
    reconciliation_date DATE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Payment & Financial Tables
CREATE INDEX idx_payment_methods_name ON payment_methods(method_name);
CREATE INDEX idx_payment_methods_type ON payment_methods(method_type);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX idx_payment_methods_generating_code ON payment_methods(generating_code);
CREATE INDEX idx_payment_methods_applied_code ON payment_methods(applied_code);

CREATE INDEX idx_payments_number ON payments(payment_number);
CREATE INDEX idx_payments_patient_date ON payments(patient_id, payment_date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status_clearance ON payments(payment_status, clearance_date);
CREATE INDEX idx_payments_method ON payments(payment_method_id);
CREATE INDEX idx_payments_insurance ON payments(insurance_company_id);
CREATE INDEX idx_payments_received_by ON payments(received_by);
CREATE INDEX idx_payments_generating_code ON payments(generating_code);
CREATE INDEX idx_payments_applied_code ON payments(applied_code);
CREATE INDEX idx_payments_type ON payments(payment_type);

CREATE INDEX idx_quality_indicators_name ON quality_indicators(indicator_name);
CREATE INDEX idx_quality_indicators_code ON quality_indicators(indicator_code);
CREATE INDEX idx_quality_indicators_category ON quality_indicators(category);
CREATE INDEX idx_quality_indicators_active ON quality_indicators(is_active);
CREATE INDEX idx_quality_indicators_jawda ON quality_indicators(is_jawda_indicator);
CREATE INDEX idx_quality_indicators_generating_code ON quality_indicators(generating_code);
CREATE INDEX idx_quality_indicators_applied_code ON quality_indicators(applied_code);

CREATE INDEX idx_quality_measurements_indicator_period ON quality_measurements(indicator_id, measurement_period_start);
CREATE INDEX idx_quality_measurements_reporting_period ON quality_measurements(measurement_period_end, reported_to_doh);
CREATE INDEX idx_quality_measurements_approved_by ON quality_measurements(approved_by);
CREATE INDEX idx_quality_measurements_generating_code ON quality_measurements(generating_code);
CREATE INDEX idx_quality_measurements_applied_code ON quality_measurements(applied_code);
CREATE INDEX idx_quality_measurements_calculation_date ON quality_measurements(calculation_date);

CREATE INDEX idx_financial_transactions_number ON financial_transactions(transaction_number);
CREATE INDEX idx_financial_transactions_type_date ON financial_transactions(transaction_type, transaction_date);
CREATE INDEX idx_financial_transactions_patient ON financial_transactions(patient_id);
CREATE INDEX idx_financial_transactions_payment ON financial_transactions(related_payment_id);
CREATE INDEX idx_financial_transactions_invoice ON financial_transactions(related_invoice_id);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(transaction_status);
CREATE INDEX idx_financial_transactions_reconciliation ON financial_transactions(reconciliation_status, reconciliation_date);
CREATE INDEX idx_financial_transactions_generating_code ON financial_transactions(generating_code);
CREATE INDEX idx_financial_transactions_applied_code ON financial_transactions(applied_code);
CREATE INDEX idx_financial_transactions_account_code ON financial_transactions(account_code);

-- Enable RLS for Payment & Financial Tables
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Payment & Financial Tables
CREATE POLICY "All authenticated users can view payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage payment methods" ON payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view payments" ON payments
    FOR SELECT USING (
        received_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create payments" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their payments" ON payments
    FOR UPDATE USING (
        received_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view quality indicators" ON quality_indicators
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage quality indicators" ON quality_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view quality measurements" ON quality_measurements
    FOR SELECT USING (
        approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create quality measurements" ON quality_measurements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their quality measurements" ON quality_measurements
    FOR UPDATE USING (
        approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view financial transactions" ON financial_transactions
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create financial transactions" ON financial_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their financial transactions" ON financial_transactions
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Update triggers for Payment & Financial Tables
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_indicators_updated_at BEFORE UPDATE ON quality_indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_measurements_updated_at BEFORE UPDATE ON quality_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Payment & Financial Tables
CREATE TRIGGER audit_payment_methods AFTER INSERT OR UPDATE OR DELETE ON payment_methods FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_quality_indicators AFTER INSERT OR UPDATE OR DELETE ON quality_indicators FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_quality_measurements AFTER INSERT OR UPDATE OR DELETE ON quality_measurements FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_financial_transactions AFTER INSERT OR UPDATE OR DELETE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Update triggers for Communication & Notifications Tables
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for Integration & Data Exchange Tables
CREATE TRIGGER update_integration_endpoints_updated_at BEFORE UPDATE ON integration_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_exchanges_updated_at BEFORE UPDATE ON data_exchanges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for Laboratory & Diagnostic Results Tables
CREATE TRIGGER update_lab_test_catalog_updated_at BEFORE UPDATE ON lab_test_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_orders_updated_at BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Communication & Notifications Tables
CREATE TRIGGER audit_notification_templates AFTER INSERT OR UPDATE OR DELETE ON notification_templates FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_notifications AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Audit triggers for Integration & Data Exchange Tables
CREATE TRIGGER audit_integration_endpoints AFTER INSERT OR UPDATE OR DELETE ON integration_endpoints FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_data_exchanges AFTER INSERT OR UPDATE OR DELETE ON data_exchanges FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Audit triggers for Laboratory & Diagnostic Results Tables
CREATE TRIGGER audit_lab_test_catalog AFTER INSERT OR UPDATE OR DELETE ON lab_test_catalog FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_lab_orders AFTER INSERT OR UPDATE OR DELETE ON lab_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_lab_results AFTER INSERT OR UPDATE OR DELETE ON lab_results FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Advanced Indexes for Performance Optimization
-- ================================================

-- Enhanced composite indexes for common query patterns with generating/applied codes
CREATE INDEX idx_patient_active_homebound_codes ON patients(is_active, created_at) WHERE is_active = TRUE;
CREATE INDEX idx_appointment_provider_date_status_codes ON appointments(provider_id, appointment_date, appointment_status, generating_code, applied_code);
CREATE INDEX idx_medical_record_patient_date_type_codes ON medical_records(patient_id, record_date, record_type);
CREATE INDEX idx_prescription_patient_status_date_codes ON clinical_forms(patient_id, status, created_at, generating_code, applied_code) WHERE form_type LIKE '%prescription%';
CREATE INDEX idx_invoice_patient_status_date_codes ON invoices(patient_id, invoice_status, invoice_date, generating_code, applied_code);
CREATE INDEX idx_payment_date_status_amount_codes ON payments(payment_date, payment_status, payment_amount, generating_code, applied_code);
CREATE INDEX idx_quality_indicator_period_codes ON quality_measurements(indicator_id, measurement_period_start, generating_code, applied_code);
CREATE INDEX idx_document_patient_category_date_codes ON documents(patient_id, document_category_id, document_date, generating_code, applied_code);
CREATE INDEX idx_notification_recipient_scheduled_codes ON notifications(recipient_type, recipient_id, scheduled_time, generating_code, applied_code);
CREATE INDEX idx_audit_user_table_created_enhanced ON audit_logs(user_id, table_name, created_at, action);

-- Full-text search indexes for PostgreSQL with enhanced search capabilities
CREATE INDEX idx_patients_fulltext_enhanced ON patients USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(emirates_id, '') || ' ' || COALESCE(mrn, '')));
CREATE INDEX idx_medical_records_fulltext_enhanced ON medical_records USING GIN (to_tsvector('english', COALESCE(clinical_notes, '') || ' ' || COALESCE(record_type, '')));
CREATE INDEX idx_documents_fulltext_enhanced ON documents USING GIN (to_tsvector('english', document_title || ' ' || COALESCE(ocr_text, '') || ' ' || COALESCE(document_description, '')));

-- Performance optimization indexes with compliance tracking
CREATE INDEX idx_episodes_active_clinician_compliance ON patient_episodes(assigned_clinician, status, compliance_status) WHERE status = 'active';
CREATE INDEX idx_clinical_forms_pending_review_compliance ON clinical_forms(status, created_at, compliance_status, generating_code) WHERE status IN ('draft', 'completed');
CREATE INDEX idx_daman_claims_pending_compliance ON daman_claims(status, submission_date, compliance_status, generating_code) WHERE status = 'pending';
CREATE INDEX idx_appointments_today_compliance ON appointments(appointment_date, appointment_status, compliance_status) WHERE appointment_date = CURRENT_DATE;
CREATE INDEX idx_equipment_maintenance_due_compliance ON equipment(next_maintenance_due, compliance_status, generating_code) WHERE next_maintenance_due <= CURRENT_DATE + INTERVAL '30 days';
CREATE INDEX idx_inventory_low_stock_compliance ON inventory_stock(item_id, quantity_available, status, compliance_status, generating_code) WHERE status = 'active';
CREATE INDEX idx_lab_orders_critical_compliance ON lab_orders(critical_results, order_status, compliance_status, generating_code) WHERE critical_results = TRUE;
CREATE INDEX idx_incidents_open_compliance ON incidents(status, incident_date, compliance_status, generating_code) WHERE status IN ('reported', 'under_investigation');

-- Advanced audit and compliance indexes
CREATE INDEX idx_audit_logs_compliance_tracking ON audit_logs(table_name, action, created_at, user_id);
CREATE INDEX idx_audit_logs_record_tracking ON audit_logs(record_id, table_name, created_at);
CREATE INDEX idx_audit_logs_user_activity ON audit_logs(user_id, created_at, action);
CREATE INDEX idx_audit_logs_table_activity ON audit_logs(table_name, created_at, action);

-- DOH compliance specific indexes
CREATE INDEX idx_doh_compliance_status_tracking ON doh_compliance_records(compliance_type, status, created_at, reviewed_by);
CREATE INDEX idx_doh_referral_compliance_tracking ON doh_referral_forms(compliance_status, form_status, generating_code, applied_code);
CREATE INDEX idx_doh_assessment_compliance_tracking ON doh_assessment_forms(compliance_status, form_status, generating_code, applied_code);
CREATE INDEX idx_doh_monitoring_compliance_tracking ON doh_monitoring_forms(compliance_status, form_status, generating_code, applied_code);

-- Financial and billing optimization indexes
CREATE INDEX idx_invoices_payment_tracking_enhanced ON invoices(payment_status, due_date, total_amount, generating_code, applied_code);
CREATE INDEX idx_payments_reconciliation_enhanced ON payments(payment_status, payment_date, invoice_id, generating_code, applied_code);
CREATE INDEX idx_financial_transactions_enhanced ON financial_transactions(transaction_type, transaction_date, amount, generating_code, applied_code);

-- Healthcare provider and appointment optimization
CREATE INDEX idx_healthcare_providers_active_specialty ON healthcare_providers(is_active, specialty, license_number, generating_code);
CREATE INDEX idx_appointments_provider_schedule_enhanced ON appointments(provider_id, appointment_date, appointment_time, appointment_status, generating_code);
CREATE INDEX idx_appointment_conflicts_resolution ON appointment_conflicts(resolution_status, conflict_severity, generating_code, applied_code);

-- Patient care and episode tracking
CREATE INDEX idx_patient_episodes_care_tracking ON patient_episodes(patient_id, status, start_date, assigned_clinician, generating_code);
CREATE INDEX idx_care_plans_active_tracking ON care_plans(patient_id, status, effective_date, generating_code, applied_code);
CREATE INDEX idx_care_plan_goals_progress ON care_plan_goals(care_plan_id, current_status, target_date, generating_code);

-- Equipment and inventory management indexes
CREATE INDEX idx_equipment_status_location_enhanced ON equipment(status, location, assigned_to, generating_code, applied_code);
CREATE INDEX idx_equipment_maintenance_schedule_enhanced ON equipment_maintenance(equipment_id, scheduled_date, maintenance_status, generating_code);
CREATE INDEX idx_inventory_stock_tracking_enhanced ON inventory_stock(item_id, status, expiry_date, generating_code, applied_code);

-- Quality and performance tracking indexes
CREATE INDEX idx_quality_indicators_active_category ON quality_indicators(is_active, category, generating_code, applied_code);
CREATE INDEX idx_quality_measurements_performance ON quality_measurements(indicator_id, measurement_period_start, performance_status, generating_code);
CREATE INDEX idx_kpi_measurements_trend_analysis ON kpi_measurements(kpi_id, measurement_period, trend, generating_code, applied_code);

-- Communication and notification indexes
CREATE INDEX idx_notifications_delivery_tracking_enhanced ON notifications(delivery_status, scheduled_time, priority, generating_code, applied_code);
CREATE INDEX idx_notification_templates_active_type ON notification_templates(is_active, template_type, category, generating_code);

-- Integration and data exchange indexes
CREATE INDEX idx_integration_endpoints_status_type ON integration_endpoints(is_active, endpoint_type, connection_status, generating_code);
CREATE INDEX idx_data_exchanges_status_tracking ON data_exchanges(exchange_status, data_type, patient_id, generating_code, applied_code);

-- Laboratory and diagnostic indexes
CREATE INDEX idx_lab_orders_status_priority_enhanced ON lab_orders(order_status, priority, order_date, generating_code, applied_code);
CREATE INDEX idx_lab_results_abnormal_tracking ON lab_results(abnormal_flag, result_date, critical_notification_required, generating_code);

-- Document management indexes
CREATE INDEX idx_documents_approval_tracking ON documents(approval_status, document_category_id, patient_id, generating_code, applied_code);
CREATE INDEX idx_document_categories_access_level_enhanced ON document_categories(access_level, is_active, generating_code, applied_code);

-- Incident management indexes
CREATE INDEX idx_incidents_severity_tracking ON incidents(severity_level, status, incident_date, generating_code, applied_code);
CREATE INDEX idx_incident_types_category_active ON incident_types(category, is_active, generating_code, applied_code);

-- Route optimization indexes
CREATE INDEX idx_route_optimizations_provider_date_enhanced ON route_optimizations(provider_id, optimization_date, route_status, generating_code);
CREATE INDEX idx_route_optimization_metrics_type_date ON route_optimization_metrics(route_optimization_id, metric_type, measurement_date, generating_code);

-- Partial indexes for frequently accessed data
CREATE INDEX idx_patients_active_recent ON patients(created_at, is_active) WHERE is_active = TRUE AND created_at >= CURRENT_DATE - INTERVAL '1 year';
CREATE INDEX idx_appointments_upcoming ON appointments(appointment_date, appointment_time, appointment_status) WHERE appointment_date >= CURRENT_DATE AND appointment_status NOT IN ('cancelled', 'completed');
CREATE INDEX idx_invoices_outstanding ON invoices(due_date, payment_status, total_amount) WHERE payment_status IN ('unpaid', 'partial') AND due_date >= CURRENT_DATE - INTERVAL '90 days';
CREATE INDEX idx_clinical_forms_recent_pending ON clinical_forms(created_at, status, form_type) WHERE status IN ('draft', 'completed') AND created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Covering indexes for common queries
CREATE INDEX idx_patients_search_covering ON patients(mrn, emirates_id) INCLUDE (first_name, last_name, phone, email, is_active);
CREATE INDEX idx_appointments_provider_covering ON appointments(provider_id, appointment_date) INCLUDE (appointment_time, appointment_status, patient_id, generating_code);
CREATE INDEX idx_medical_records_patient_covering ON medical_records(patient_id, record_date) INCLUDE (record_type, provider_id, generating_code, applied_code);

-- Views for Common Queries
-- ================================================

-- Active patient summary view
CREATE VIEW v_active_patients AS
SELECT 
    p.id,
    p.mrn,
    p.first_name || ' ' || p.last_name AS full_name,
    p.gender,
    p.date_of_birth,
    EXTRACT(YEAR FROM AGE(p.date_of_birth)) AS age,
    p.nationality,
    p.phone,
    p.email,
    COUNT(DISTINCT pe.id) AS total_episodes,
    COUNT(DISTINCT mr.id) AS total_medical_records,
    MAX(mr.record_date) AS last_medical_record_date,
    COUNT(DISTINCT a.id) AS total_appointments,
    MAX(a.appointment_date) AS last_appointment_date,
    p.created_at AS registration_date
FROM patients p
LEFT JOIN patient_episodes pe ON p.id = pe.patient_id
LEFT JOIN medical_records mr ON p.id = mr.patient_id
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.mrn, p.first_name, p.last_name, p.gender, p.date_of_birth, p.nationality, p.phone, p.email, p.created_at;

-- Provider schedule view
CREATE VIEW v_provider_schedules AS
SELECT 
    hp.id AS provider_id,
    hp.provider_name,
    hp.license_number,
    hp.specialty,
    hp.facility_name,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_date >= CURRENT_DATE - INTERVAL '30 days' THEN a.id END) AS appointments_last_30_days,
    COUNT(DISTINCT CASE WHEN a.appointment_status = 'completed' THEN a.id END) AS completed_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_status = 'cancelled' THEN a.id END) AS cancelled_appointments,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.appointment_status = 'completed' THEN a.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT a.id), 0)) * 100, 2
    ) AS completion_rate_percentage,
    hp.is_active
FROM healthcare_providers hp
LEFT JOIN appointments a ON hp.id = a.provider_id
WHERE hp.is_active = TRUE
GROUP BY hp.id, hp.provider_name, hp.license_number, hp.specialty, hp.facility_name, hp.is_active;

-- Patient care summary view
CREATE VIEW v_patient_care_summary AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.first_name || ' ' || p.last_name AS patient_name,
    COUNT(DISTINCT pe.id) AS total_episodes,
    COUNT(DISTINCT mr.id) AS total_visits,
    COUNT(DISTINCT CASE WHEN mr.record_date >= CURRENT_DATE - INTERVAL '30 days' THEN mr.id END) AS visits_last_30_days,
    COUNT(DISTINCT cf.id) AS total_clinical_forms,
    COUNT(DISTINCT CASE WHEN cf.status = 'completed' THEN cf.id END) AS completed_forms,
    COUNT(DISTINCT hs.id) AS active_homecare_services,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_status = 'completed' THEN a.id END) AS completed_appointments,
    MAX(mr.record_date) AS last_visit_date,
    MIN(mr.record_date) AS first_visit_date,
    MAX(pe.start_date) AS latest_episode_start,
    COUNT(DISTINCT CASE WHEN pe.status = 'active' THEN pe.id END) AS active_episodes
FROM patients p
LEFT JOIN patient_episodes pe ON p.id = pe.patient_id
LEFT JOIN medical_records mr ON p.id = mr.patient_id
LEFT JOIN clinical_forms cf ON p.id = cf.patient_id
LEFT JOIN homecare_services hs ON mr.id = hs.medical_record_id AND hs.status = 'active'
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.mrn, p.first_name, p.last_name;

-- Financial dashboard view
CREATE VIEW v_financial_dashboard AS
SELECT 
    DATE(i.invoice_date) AS invoice_date,
    COUNT(i.id) AS total_invoices,
    SUM(i.total_amount) AS total_billed,
    SUM(i.amount_paid) AS total_collected,
    SUM(i.total_amount - i.amount_paid) AS total_outstanding,
    SUM(CASE WHEN i.payment_status = 'paid' THEN i.total_amount ELSE 0 END) AS paid_invoices_amount,
    SUM(CASE WHEN i.due_date < CURRENT_DATE AND (i.total_amount - i.amount_paid) > 0 THEN (i.total_amount - i.amount_paid) ELSE 0 END) AS overdue_amount,
    COUNT(CASE WHEN i.invoice_type = 'insurance' THEN 1 END) AS insurance_invoices,
    COUNT(CASE WHEN i.invoice_type = 'patient' THEN 1 END) AS patient_invoices,
    ROUND(
        (SUM(i.amount_paid) / NULLIF(SUM(i.total_amount), 0)) * 100, 2
    ) AS collection_rate_percentage
FROM invoices i
WHERE i.invoice_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE(i.invoice_date)
ORDER BY invoice_date DESC;

-- DOH Compliance Summary View
CREATE VIEW v_doh_compliance_summary AS
SELECT 
    DATE_TRUNC('month', dcr.created_at) AS compliance_month,
    dcr.compliance_type,
    COUNT(*) AS total_records,
    COUNT(CASE WHEN dcr.status = 'compliant' THEN 1 END) AS compliant_records,
    COUNT(CASE WHEN dcr.status = 'non_compliant' THEN 1 END) AS non_compliant_records,
    COUNT(CASE WHEN dcr.status = 'pending_review' THEN 1 END) AS pending_review_records,
    ROUND(
        (COUNT(CASE WHEN dcr.status = 'compliant' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) AS compliance_rate_percentage
FROM doh_compliance_records dcr
WHERE dcr.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', dcr.created_at), dcr.compliance_type
ORDER BY compliance_month DESC, dcr.compliance_type;

-- Equipment Utilization View
CREATE VIEW v_equipment_utilization AS
SELECT 
    ec.category_name,
    COUNT(e.id) AS total_equipment,
    COUNT(CASE WHEN e.status = 'available' THEN 1 END) AS available_equipment,
    COUNT(CASE WHEN e.status = 'in_use' THEN 1 END) AS in_use_equipment,
    COUNT(CASE WHEN e.status = 'maintenance' THEN 1 END) AS maintenance_equipment,
    COUNT(CASE WHEN e.status = 'repair' THEN 1 END) AS repair_equipment,
    ROUND(
        (COUNT(CASE WHEN e.status = 'in_use' THEN 1 END)::DECIMAL / COUNT(e.id)) * 100, 2
    ) AS utilization_rate_percentage,
    COUNT(CASE WHEN e.next_maintenance_due <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) AS maintenance_due_soon
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.id
WHERE e.condition != 'retired'
GROUP BY ec.id, ec.category_name
ORDER BY utilization_rate_percentage DESC;

-- Stored Procedures for Common Operations
-- ================================================

-- Function to calculate patient age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE) 
RETURNS INTEGER
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    age INTEGER;
BEGIN
    age := EXTRACT(YEAR FROM AGE(birth_date));
    RETURN age;
END;
$;

-- Function to get next available appointment slot
CREATE OR REPLACE FUNCTION get_next_available_slot(
    p_provider_id UUID,
    p_appointment_date DATE,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
    available_time TIME,
    slot_duration INTEGER
)
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    slot_time TIME;
    slot_start TIME := '08:00:00';
    slot_end TIME := '17:00:00';
    slot_interval INTERVAL := '30 minutes';
BEGIN
    -- Generate time slots and check availability
    FOR slot_time IN 
        SELECT generate_series(slot_start, slot_end - (p_duration_minutes || ' minutes')::INTERVAL, slot_interval)::TIME
    LOOP
        -- Check if slot is available
        IF NOT EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.provider_id = p_provider_id
            AND a.appointment_date = p_appointment_date
            AND a.appointment_time = slot_time
            AND a.appointment_status NOT IN ('cancelled', 'no_show')
        ) THEN
            available_time := slot_time;
            slot_duration := p_duration_minutes;
            RETURN NEXT;
            RETURN; -- Return first available slot
        END IF;
    END LOOP;
    
    RETURN;
END;
$;

-- Function to update patient homebound status
CREATE OR REPLACE FUNCTION update_homebound_status(
    p_patient_id UUID,
    p_certified_by UUID,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $
DECLARE
    patient_exists BOOLEAN;
BEGIN
    -- Check if patient exists
    SELECT EXISTS(SELECT 1 FROM patients WHERE id = p_patient_id AND is_active = TRUE) INTO patient_exists;
    
    IF NOT patient_exists THEN
        RAISE EXCEPTION 'Patient not found or inactive';
    END IF;
    
    -- Update patient record
    UPDATE patients 
    SET 
        updated_at = NOW()
    WHERE id = p_patient_id;
    
    -- Create audit log entry
    INSERT INTO audit_logs (user_id, table_name, record_id, action, new_values)
    VALUES (
        p_certified_by, 
        'patients', 
        p_patient_id, 
        'UPDATE',
        jsonb_build_object(
            'homebound_status', TRUE, 
            'certified_date', CURRENT_DATE, 
            'reason', p_reason,
            'generating_code', 'HOMEBOUND_UPDATE_' || p_patient_id::TEXT,
            'applied_code', 'APPLIED_HOMEBOUND_' || p_patient_id::TEXT
        )
    );
    
    RETURN TRUE;
END;
$;

-- Function to calculate care plan compliance
CREATE OR REPLACE FUNCTION calculate_care_plan_compliance(
    p_patient_id UUID,
    p_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    care_plan_id UUID,
    plan_name VARCHAR(200),
    total_goals BIGINT,
    achieved_goals BIGINT,
    in_progress_goals BIGINT,
    not_started_goals BIGINT,
    compliance_percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
READS SQL DATA
AS $
BEGIN
    RETURN QUERY
    SELECT 
        cp.id AS care_plan_id,
        cp.plan_name,
        COUNT(cpg.id) AS total_goals,
        COUNT(CASE WHEN cpg.current_status = 'achieved' THEN 1 END) AS achieved_goals,
        COUNT(CASE WHEN cpg.current_status = 'in_progress' THEN 1 END) AS in_progress_goals,
        COUNT(CASE WHEN cpg.current_status = 'not_started' THEN 1 END) AS not_started_goals,
        ROUND(
            (COUNT(CASE WHEN cpg.current_status = 'achieved' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(cpg.id), 0)) * 100, 2
        ) AS compliance_percentage
    FROM care_plans cp
    LEFT JOIN care_plan_goals cpg ON cp.id = cpg.care_plan_id
    WHERE cp.patient_id = p_patient_id
    AND cp.effective_date >= p_period_start
    AND cp.effective_date <= p_period_end
    AND cp.status = 'active'
    GROUP BY cp.id, cp.plan_name;
END;
$;

-- Function to generate comprehensive patient report
CREATE OR REPLACE FUNCTION generate_patient_report(
    p_patient_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '90 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    patient_info JSONB;
    episodes_info JSONB;
    appointments_info JSONB;
    clinical_forms_info JSONB;
    compliance_info JSONB;
    result JSONB;
BEGIN
    -- Get patient basic information
    SELECT jsonb_build_object(
        'patient_id', p.id,
        'mrn', p.mrn,
        'name', p.first_name || ' ' || p.last_name,
        'date_of_birth', p.date_of_birth,
        'age', calculate_age(p.date_of_birth),
        'gender', p.gender,
        'nationality', p.nationality,
        'phone', p.phone,
        'email', p.email,
        'registration_date', p.created_at
    ) INTO patient_info
    FROM patients p
    WHERE p.id = p_patient_id;
    
    -- Get episodes information
    SELECT jsonb_agg(
        jsonb_build_object(
            'episode_id', pe.id,
            'episode_number', pe.episode_number,
            'start_date', pe.start_date,
            'end_date', pe.end_date,
            'status', pe.status,
            'assigned_clinician', hp.provider_name
        )
    ) INTO episodes_info
    FROM patient_episodes pe
    LEFT JOIN healthcare_providers hp ON pe.assigned_clinician = hp.id
    WHERE pe.patient_id = p_patient_id
    AND pe.start_date >= p_start_date;
    
    -- Get appointments information
    SELECT jsonb_agg(
        jsonb_build_object(
            'appointment_id', a.id,
            'appointment_date', a.appointment_date,
            'appointment_time', a.appointment_time,
            'status', a.appointment_status,
            'provider', hp.provider_name,
            'location_type', a.location_type
        )
    ) INTO appointments_info
    FROM appointments a
    LEFT JOIN healthcare_providers hp ON a.provider_id = hp.id
    WHERE a.patient_id = p_patient_id
    AND a.appointment_date >= p_start_date;
    
    -- Get clinical forms information
    SELECT jsonb_agg(
        jsonb_build_object(
            'form_id', cf.id,
            'form_type', cf.form_type,
            'status', cf.status,
            'created_date', cf.created_at,
            'clinician', hp.provider_name
        )
    ) INTO clinical_forms_info
    FROM clinical_forms cf
    LEFT JOIN healthcare_providers hp ON cf.clinician_id = hp.id
    WHERE cf.patient_id = p_patient_id
    AND cf.created_at >= p_start_date;
    
    -- Get compliance information
    SELECT jsonb_agg(
        jsonb_build_object(
            'compliance_type', dcr.compliance_type,
            'status', dcr.status,
            'review_date', dcr.review_date,
            'reviewed_by', hp.provider_name
        )
    ) INTO compliance_info
    FROM doh_compliance_records dcr
    LEFT JOIN healthcare_providers hp ON dcr.reviewed_by = hp.id
    WHERE dcr.patient_id = p_patient_id
    AND dcr.created_at >= p_start_date;
    
    -- Build final result
    result := jsonb_build_object(
        'report_generated_at', NOW(),
        'report_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'patient_information', patient_info,
        'episodes', COALESCE(episodes_info, '[]'::jsonb),
        'appointments', COALESCE(appointments_info, '[]'::jsonb),
        'clinical_forms', COALESCE(clinical_forms_info, '[]'::jsonb),
        'compliance_records', COALESCE(compliance_info, '[]'::jsonb),
        'generating_code', 'PATIENT_REPORT_' || p_patient_id::TEXT || '_' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'applied_code', 'APPLIED_PATIENT_REPORT_' || p_patient_id::TEXT
    );
    
    RETURN result;
END;
$;

-- Function to calculate provider performance metrics
CREATE OR REPLACE FUNCTION calculate_provider_performance(
    p_provider_id UUID,
    p_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    provider_info RECORD;
    performance_metrics JSONB;
BEGIN
    -- Get provider information
    SELECT * INTO provider_info
    FROM healthcare_providers
    WHERE id = p_provider_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Provider not found';
    END IF;
    
    -- Calculate performance metrics
    SELECT jsonb_build_object(
        'provider_id', p_provider_id,
        'provider_name', provider_info.provider_name,
        'period', jsonb_build_object(
            'start_date', p_period_start,
            'end_date', p_period_end
        ),
        'appointment_metrics', jsonb_build_object(
            'total_appointments', COUNT(a.id),
            'completed_appointments', COUNT(CASE WHEN a.appointment_status = 'completed' THEN 1 END),
            'cancelled_appointments', COUNT(CASE WHEN a.appointment_status = 'cancelled' THEN 1 END),
            'no_show_appointments', COUNT(CASE WHEN a.appointment_status = 'no_show' THEN 1 END),
            'completion_rate', ROUND(
                (COUNT(CASE WHEN a.appointment_status = 'completed' THEN 1 END)::DECIMAL / 
                 NULLIF(COUNT(a.id), 0)) * 100, 2
            )
        ),
        'patient_metrics', jsonb_build_object(
            'unique_patients_served', COUNT(DISTINCT a.patient_id),
            'average_satisfaction_score', ROUND(AVG(a.patient_satisfaction_score), 2)
        ),
        'clinical_metrics', jsonb_build_object(
            'clinical_forms_completed', (
                SELECT COUNT(*) FROM clinical_forms cf 
                WHERE cf.clinician_id = p_provider_id 
                AND cf.created_at BETWEEN p_period_start AND p_period_end
                AND cf.status = 'completed'
            ),
            'compliance_rate', (
                SELECT ROUND(
                    (COUNT(CASE WHEN dcr.status = 'compliant' THEN 1 END)::DECIMAL / 
                     NULLIF(COUNT(dcr.id), 0)) * 100, 2
                )
                FROM doh_compliance_records dcr
                WHERE dcr.reviewed_by = p_provider_id
                AND dcr.created_at BETWEEN p_period_start AND p_period_end
            )
        ),
        'generating_code', 'PROVIDER_PERFORMANCE_' || p_provider_id::TEXT,
        'applied_code', 'APPLIED_PROVIDER_PERF_' || p_provider_id::TEXT,
        'calculated_at', NOW()
    ) INTO performance_metrics
    FROM appointments a
    WHERE a.provider_id = p_provider_id
    AND a.appointment_date BETWEEN p_period_start AND p_period_end;
    
    RETURN performance_metrics;
END;
$;

-- Equipment & Inventory Management
-- ================================================

CREATE TABLE equipment_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    requires_calibration BOOLEAN DEFAULT FALSE,
    calibration_frequency_days INTEGER,
    requires_maintenance BOOLEAN DEFAULT TRUE,
    maintenance_frequency_days INTEGER,
    safety_classification VARCHAR(20) DEFAULT 'medium' CHECK (safety_classification IN ('low', 'medium', 'high')),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_number VARCHAR(30) UNIQUE NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES equipment_categories(id),
    manufacturer VARCHAR(200),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(12, 2),
    warranty_expiry DATE,
    location VARCHAR(200),
    assigned_to UUID REFERENCES healthcare_providers(id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'repair', 'retired')),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    last_calibration_date DATE,
    next_calibration_due DATE,
    usage_hours INTEGER DEFAULT 0,
    maintenance_cost_ytd DECIMAL(10, 2) DEFAULT 0.00,
    specifications JSONB,
    operating_instructions TEXT,
    safety_protocols TEXT,
    service_contacts JSONB,
    insurance_value DECIMAL(12, 2),
    depreciation_rate DECIMAL(5, 4),
    current_value DECIMAL(12, 2),
    is_critical BOOLEAN DEFAULT FALSE,
    backup_equipment_id UUID REFERENCES equipment(id),
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'calibration', 'inspection')),
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    performed_by VARCHAR(200),
    service_company VARCHAR(200),
    work_description TEXT NOT NULL,
    parts_replaced JSONB,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    downtime_hours DECIMAL(6, 2) DEFAULT 0.00,
    maintenance_status VARCHAR(20) DEFAULT 'scheduled' CHECK (maintenance_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    quality_check_passed BOOLEAN DEFAULT TRUE,
    next_maintenance_date DATE,
    warranty_work BOOLEAN DEFAULT FALSE,
    documentation_url VARCHAR(1000),
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID REFERENCES healthcare_providers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supply Chain & Inventory
-- ================================================

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(200) UNIQUE NOT NULL,
    supplier_code VARCHAR(20) UNIQUE,
    contact_person VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(500),
    tax_registration VARCHAR(100),
    trade_license VARCHAR(100),
    payment_terms_days INTEGER DEFAULT 30,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_time_days INTEGER DEFAULT 7,
    quality_rating DECIMAL(3, 2) DEFAULT 5.00,
    performance_score DECIMAL(5, 2) DEFAULT 100.00,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_date DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    requires_expiry_tracking BOOLEAN DEFAULT FALSE,
    requires_lot_tracking BOOLEAN DEFAULT FALSE,
    requires_serial_tracking BOOLEAN DEFAULT FALSE,
    storage_requirements TEXT,
    handling_instructions TEXT,
    safety_category VARCHAR(20) DEFAULT 'general' CHECK (safety_category IN ('general', 'hazardous', 'controlled')),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(30) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES inventory_categories(id),
    description TEXT,
    manufacturer VARCHAR(200),
    brand VARCHAR(100),
    model_number VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    standard_cost DECIMAL(10, 4) NOT NULL,
    selling_price DECIMAL(10, 4),
    reorder_level INTEGER DEFAULT 10,
    maximum_stock_level INTEGER DEFAULT 100,
    minimum_stock_level INTEGER DEFAULT 5,
    lead_time_days INTEGER DEFAULT 7,
    shelf_life_days INTEGER,
    storage_location VARCHAR(100),
    storage_temperature_min DECIMAL(5, 2),
    storage_temperature_max DECIMAL(5, 2),
    is_controlled_substance BOOLEAN DEFAULT FALSE,
    requires_prescription BOOLEAN DEFAULT FALSE,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
    weight_kg DECIMAL(8, 4),
    dimensions VARCHAR(100),
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_item_code VARCHAR(100),
    barcode VARCHAR(200),
    image_url VARCHAR(1000),
    safety_data_sheet_url VARCHAR(1000),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE inventory_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location VARCHAR(100) NOT NULL,
    lot_number VARCHAR(100),
    expiry_date DATE,
    quantity_on_hand DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    quantity_reserved DECIMAL(12, 4) DEFAULT 0.0000,
    quantity_available DECIMAL(12, 4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    unit_cost DECIMAL(10, 4) NOT NULL,
    total_value DECIMAL(15, 4) GENERATED ALWAYS AS (quantity_on_hand * unit_cost) STORED,
    last_movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_count_date DATE,
    variance_quantity DECIMAL(12, 4) DEFAULT 0.0000,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'damaged', 'recalled', 'quarantine')),
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for Equipment & Inventory Management Tables
CREATE INDEX idx_equipment_categories_name ON equipment_categories(category_name);
CREATE INDEX idx_equipment_categories_active ON equipment_categories(is_active);
CREATE INDEX idx_equipment_categories_generating_code ON equipment_categories(generating_code);
CREATE INDEX idx_equipment_categories_applied_code ON equipment_categories(applied_code);
CREATE INDEX idx_equipment_categories_compliance ON equipment_categories(compliance_status);

CREATE INDEX idx_equipment_number ON equipment(equipment_number);
CREATE INDEX idx_equipment_status ON equipment(status, location);
CREATE INDEX idx_equipment_maintenance_schedule ON equipment(next_maintenance_due);
CREATE INDEX idx_equipment_assigned_equipment ON equipment(assigned_to);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_generating_code ON equipment(generating_code);
CREATE INDEX idx_equipment_applied_code ON equipment(applied_code);
CREATE INDEX idx_equipment_compliance ON equipment(compliance_status);
CREATE INDEX idx_equipment_calibration_schedule ON equipment(next_calibration_due);
CREATE INDEX idx_equipment_warranty ON equipment(warranty_expiry);

CREATE INDEX idx_equipment_maintenance_equipment_id ON equipment_maintenance(equipment_id, scheduled_date);
CREATE INDEX idx_equipment_maintenance_schedule ON equipment_maintenance(scheduled_date, maintenance_status);
CREATE INDEX idx_equipment_maintenance_type ON equipment_maintenance(maintenance_type);
CREATE INDEX idx_equipment_maintenance_generating_code ON equipment_maintenance(generating_code);
CREATE INDEX idx_equipment_maintenance_applied_code ON equipment_maintenance(applied_code);
CREATE INDEX idx_equipment_maintenance_compliance ON equipment_maintenance(compliance_status);

CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_status ON suppliers(is_active, is_approved);
CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX idx_suppliers_generating_code ON suppliers(generating_code);
CREATE INDEX idx_suppliers_applied_code ON suppliers(applied_code);
CREATE INDEX idx_suppliers_compliance ON suppliers(compliance_status);

CREATE INDEX idx_inventory_categories_name ON inventory_categories(category_name);
CREATE INDEX idx_inventory_categories_active ON inventory_categories(is_active);
CREATE INDEX idx_inventory_categories_generating_code ON inventory_categories(generating_code);
CREATE INDEX idx_inventory_categories_applied_code ON inventory_categories(applied_code);
CREATE INDEX idx_inventory_categories_compliance ON inventory_categories(compliance_status);

CREATE INDEX idx_inventory_items_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_items_name ON inventory_items(item_name);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_reorder_tracking ON inventory_items(reorder_level, minimum_stock_level);
CREATE INDEX idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_generating_code ON inventory_items(generating_code);
CREATE INDEX idx_inventory_items_applied_code ON inventory_items(applied_code);
CREATE INDEX idx_inventory_items_compliance ON inventory_items(compliance_status);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);

CREATE INDEX idx_inventory_stock_item_location ON inventory_stock(item_id, location);
CREATE INDEX idx_inventory_stock_expiry_tracking ON inventory_stock(expiry_date, status);
CREATE INDEX idx_inventory_stock_lot_tracking ON inventory_stock(lot_number);
CREATE INDEX idx_inventory_stock_status ON inventory_stock(status);
CREATE INDEX idx_inventory_stock_generating_code ON inventory_stock(generating_code);
CREATE INDEX idx_inventory_stock_applied_code ON inventory_stock(applied_code);
CREATE INDEX idx_inventory_stock_compliance ON inventory_stock(compliance_status);
CREATE INDEX idx_inventory_stock_movement_date ON inventory_stock(last_movement_date);

-- Enable RLS for Equipment & Inventory Management Tables
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Equipment & Inventory Management Tables
CREATE POLICY "All authenticated users can view equipment categories" ON equipment_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage equipment categories" ON equipment_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view equipment" ON equipment
    FOR SELECT USING (
        assigned_to IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create equipment" ON equipment
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can update equipment" ON equipment
    FOR UPDATE USING (
        assigned_to IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view equipment maintenance" ON equipment_maintenance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipment 
            WHERE equipment.id = equipment_maintenance.equipment_id 
            AND (equipment.assigned_to IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR equipment.created_by = auth.uid())
        )
        OR created_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create equipment maintenance" ON equipment_maintenance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "All authenticated users can view suppliers" ON suppliers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage suppliers" ON suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view inventory categories" ON inventory_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage inventory categories" ON inventory_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view inventory items" ON inventory_items
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create inventory items" ON inventory_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update inventory items" ON inventory_items
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view inventory stock" ON inventory_stock
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create inventory stock" ON inventory_stock
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update inventory stock" ON inventory_stock
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'nurse')
        )
    );

-- Update triggers for Equipment & Inventory Management Tables
CREATE TRIGGER update_equipment_categories_updated_at BEFORE UPDATE ON equipment_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_maintenance_updated_at BEFORE UPDATE ON equipment_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON inventory_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Equipment & Inventory Management Tables
CREATE TRIGGER audit_equipment_categories AFTER INSERT OR UPDATE OR DELETE ON equipment_categories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_equipment AFTER INSERT OR UPDATE OR DELETE ON equipment FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_equipment_maintenance AFTER INSERT OR UPDATE OR DELETE ON equipment_maintenance FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON suppliers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory_categories AFTER INSERT OR UPDATE OR DELETE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory_items AFTER INSERT OR UPDATE OR DELETE ON inventory_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory_stock AFTER INSERT OR UPDATE OR DELETE ON inventory_stock FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Functions for Equipment & Inventory Management
-- ================================================

-- Function to auto-generate equipment numbers
CREATE OR REPLACE FUNCTION generate_equipment_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_equipment_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(equipment_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM equipment
    WHERE equipment_number LIKE 'EQP-' || year_suffix || '-%';
    
    -- Generate new equipment number: EQP-YY-NNNNNN
    new_equipment_number := 'EQP-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.equipment_number := new_equipment_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate equipment numbers
CREATE TRIGGER generate_equipment_number_trigger
    BEFORE INSERT ON equipment
    FOR EACH ROW
    WHEN (NEW.equipment_number IS NULL OR NEW.equipment_number = '')
    EXECUTE FUNCTION generate_equipment_number();

-- Function to auto-generate supplier codes
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $
DECLARE
    sequence_num INTEGER;
    new_supplier_code VARCHAR(20);
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(RIGHT(supplier_code, 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM suppliers
    WHERE supplier_code LIKE 'SUP-%';
    
    -- Generate new supplier code: SUP-NNNN
    new_supplier_code := 'SUP-' || LPAD(sequence_num::TEXT, 4, '0');
    
    NEW.supplier_code := new_supplier_code;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate supplier codes
CREATE TRIGGER generate_supplier_code_trigger
    BEFORE INSERT ON suppliers
    FOR EACH ROW
    WHEN (NEW.supplier_code IS NULL OR NEW.supplier_code = '')
    EXECUTE FUNCTION generate_supplier_code();

-- Function to auto-generate inventory item codes
CREATE OR REPLACE FUNCTION generate_item_code()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_item_code VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(item_code, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM inventory_items
    WHERE item_code LIKE 'ITM-' || year_suffix || '-%';
    
    -- Generate new item code: ITM-YY-NNNNNN
    new_item_code := 'ITM-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.item_code := new_item_code;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate inventory item codes
CREATE TRIGGER generate_item_code_trigger
    BEFORE INSERT ON inventory_items
    FOR EACH ROW
    WHEN (NEW.item_code IS NULL OR NEW.item_code = '')
    EXECUTE FUNCTION generate_item_code();

-- Function to update equipment maintenance schedules
CREATE OR REPLACE FUNCTION update_equipment_maintenance_schedule()
RETURNS TRIGGER AS $
BEGIN
    -- Update equipment maintenance dates when maintenance is completed
    IF NEW.maintenance_status = 'completed' AND OLD.maintenance_status != 'completed' THEN
        UPDATE equipment 
        SET 
            last_maintenance_date = COALESCE(NEW.actual_date, NEW.scheduled_date),
            next_maintenance_due = CASE 
                WHEN NEW.next_maintenance_date IS NOT NULL THEN NEW.next_maintenance_date
                ELSE COALESCE(NEW.actual_date, NEW.scheduled_date) + INTERVAL '1 day' * (
                    SELECT COALESCE(maintenance_frequency_days, 365) 
                    FROM equipment_categories 
                    WHERE id = (SELECT category_id FROM equipment WHERE id = NEW.equipment_id)
                )
            END,
            maintenance_cost_ytd = maintenance_cost_ytd + NEW.cost
        WHERE id = NEW.equipment_id;
        
        -- Update calibration dates if this was a calibration
        IF NEW.maintenance_type = 'calibration' THEN
            UPDATE equipment 
            SET 
                last_calibration_date = COALESCE(NEW.actual_date, NEW.scheduled_date),
                next_calibration_due = CASE 
                    WHEN NEW.next_maintenance_date IS NOT NULL THEN NEW.next_maintenance_date
                    ELSE COALESCE(NEW.actual_date, NEW.scheduled_date) + INTERVAL '1 day' * (
                        SELECT COALESCE(calibration_frequency_days, 365) 
                        FROM equipment_categories 
                        WHERE id = (SELECT category_id FROM equipment WHERE id = NEW.equipment_id)
                    )
                END
            WHERE id = NEW.equipment_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to update equipment maintenance schedules
CREATE TRIGGER update_equipment_maintenance_schedule_trigger
    AFTER UPDATE ON equipment_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_maintenance_schedule();

-- Function to check inventory reorder levels
CREATE OR REPLACE FUNCTION check_inventory_reorder_levels()
RETURNS TRIGGER AS $
DECLARE
    item_record RECORD;
    total_available DECIMAL(12, 4);
BEGIN
    -- Get item information
    SELECT * INTO item_record FROM inventory_items WHERE id = NEW.item_id;
    
    -- Calculate total available quantity for this item across all locations
    SELECT COALESCE(SUM(quantity_available), 0) INTO total_available
    FROM inventory_stock 
    WHERE item_id = NEW.item_id AND status = 'active';
    
    -- Check if reorder is needed
    IF total_available <= item_record.reorder_level THEN
        -- Create notification for low stock
        INSERT INTO notifications (
            notification_type,
            recipient_type,
            recipient_id,
            subject,
            message,
            priority,
            generating_code,
            applied_code,
            created_by
        ) VALUES (
            'system',
            'admin',
            (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1),
            'Low Stock Alert: ' || item_record.item_name,
            'Item: ' || item_record.item_name || ' (' || item_record.item_code || ')\nCurrent Stock: ' || total_available || ' ' || item_record.unit_of_measure || '\nReorder Level: ' || item_record.reorder_level || ' ' || item_record.unit_of_measure || '\n\nReorder required.',
            'high',
            'LOW_STOCK_ALERT_' || NEW.item_id::TEXT,
            'APPLIED_LOW_STOCK_' || NEW.item_id::TEXT,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to check inventory reorder levels
CREATE TRIGGER check_inventory_reorder_levels_trigger
    AFTER INSERT OR UPDATE ON inventory_stock
    FOR EACH ROW
    EXECUTE FUNCTION check_inventory_reorder_levels();

-- Insert default equipment categories
INSERT INTO equipment_categories (category_name, description, requires_calibration, calibration_frequency_days, requires_maintenance, maintenance_frequency_days, safety_classification, generating_code, applied_code, created_by) VALUES
('Medical Devices', 'General medical equipment and devices', TRUE, 365, TRUE, 180, 'high', 'EC_MEDICAL_DEVICES_001', 'APPLIED_MEDICAL_DEVICES_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Monitoring Equipment', 'Patient monitoring and diagnostic equipment', TRUE, 180, TRUE, 90, 'high', 'EC_MONITORING_EQUIP_002', 'APPLIED_MONITORING_EQUIP_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Mobility Aids', 'Wheelchairs, walkers, and mobility assistance', FALSE, NULL, TRUE, 90, 'medium', 'EC_MOBILITY_AIDS_003', 'APPLIED_MOBILITY_AIDS_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Respiratory Equipment', 'Oxygen concentrators, CPAP, ventilators', TRUE, 90, TRUE, 30, 'high', 'EC_RESPIRATORY_EQUIP_004', 'APPLIED_RESPIRATORY_EQUIP_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Infusion Pumps', 'IV pumps and infusion devices', TRUE, 180, TRUE, 60, 'high', 'EC_INFUSION_PUMPS_005', 'APPLIED_INFUSION_PUMPS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Wound Care Equipment', 'Wound vacs, dressing supplies, specialized beds', FALSE, NULL, TRUE, 180, 'medium', 'EC_WOUND_CARE_006', 'APPLIED_WOUND_CARE_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Communication Devices', 'Tablets, phones, emergency call systems', FALSE, NULL, TRUE, 365, 'low', 'EC_COMMUNICATION_007', 'APPLIED_COMMUNICATION_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Safety Equipment', 'Fall prevention, bed rails, safety alarms', FALSE, NULL, TRUE, 180, 'high', 'EC_SAFETY_EQUIPMENT_008', 'APPLIED_SAFETY_EQUIPMENT_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default inventory categories
INSERT INTO inventory_categories (category_name, description, requires_expiry_tracking, requires_lot_tracking, requires_serial_tracking, storage_requirements, safety_category, generating_code, applied_code, created_by) VALUES
('Medications', 'Prescription and over-the-counter medications', TRUE, TRUE, FALSE, 'Store in cool, dry place. Temperature controlled.', 'controlled', 'IC_MEDICATIONS_001', 'APPLIED_MEDICATIONS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medical Supplies', 'Disposable medical supplies and consumables', TRUE, TRUE, FALSE, 'Store in clean, dry environment', 'general', 'IC_MEDICAL_SUPPLIES_002', 'APPLIED_MEDICAL_SUPPLIES_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Wound Care Supplies', 'Dressings, bandages, wound care products', TRUE, TRUE, FALSE, 'Store in sterile environment', 'general', 'IC_WOUND_CARE_003', 'APPLIED_WOUND_CARE_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Nutritional Products', 'Enteral feeds, supplements, nutritional products', TRUE, TRUE, FALSE, 'Temperature controlled storage required', 'general', 'IC_NUTRITIONAL_004', 'APPLIED_NUTRITIONAL_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Personal Care Items', 'Hygiene products, personal care supplies', TRUE, FALSE, FALSE, 'Store in dry environment', 'general', 'IC_PERSONAL_CARE_005', 'APPLIED_PERSONAL_CARE_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Diagnostic Supplies', 'Test strips, collection containers, diagnostic kits', TRUE, TRUE, FALSE, 'Temperature and humidity controlled', 'general', 'IC_DIAGNOSTIC_006', 'APPLIED_DIAGNOSTIC_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Safety Supplies', 'PPE, infection control, safety equipment', TRUE, FALSE, FALSE, 'Store in clean, accessible location', 'general', 'IC_SAFETY_SUPPLIES_007', 'APPLIED_SAFETY_SUPPLIES_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Office Supplies', 'Administrative and documentation supplies', FALSE, FALSE, FALSE, 'Standard office storage', 'general', 'IC_OFFICE_SUPPLIES_008', 'APPLIED_OFFICE_SUPPLIES_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default suppliers
INSERT INTO suppliers (supplier_name, contact_person, email, phone, address, payment_terms_days, delivery_time_days, quality_rating, is_approved, generating_code, applied_code, created_by) VALUES
('Gulf Medical Supplies LLC', 'Ahmed Al-Rashid', 'ahmed@gulfmedical.ae', '+971-4-123-4567', 'Dubai Healthcare City, Dubai, UAE', 30, 2, 4.8, TRUE, 'SUP_GULF_MEDICAL_001', 'APPLIED_GULF_MEDICAL_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Emirates Healthcare Equipment', 'Fatima Al-Zahra', 'fatima@emirateshealthcare.ae', '+971-2-234-5678', 'Abu Dhabi Medical District, Abu Dhabi, UAE', 45, 3, 4.6, TRUE, 'SUP_EMIRATES_HEALTH_002', 'APPLIED_EMIRATES_HEALTH_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Al-Seha Medical Trading', 'Mohammed bin Rashid', 'mohammed@alsehamedical.ae', '+971-6-345-6789', 'Sharjah Medical City, Sharjah, UAE', 30, 1, 4.9, TRUE, 'SUP_AL_SEHA_003', 'APPLIED_AL_SEHA_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Pharma Plus Distribution', 'Aisha Al-Mansouri', 'aisha@pharmaplus.ae', '+971-3-456-7890', 'Al Ain Medical District, Al Ain, UAE', 60, 5, 4.5, TRUE, 'SUP_PHARMA_PLUS_004', 'APPLIED_PHARMA_PLUS_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Advanced Medical Technologies', 'Omar Al-Maktoum', 'omar@advmedtech.ae', '+971-4-567-8901', 'Dubai Investment Park, Dubai, UAE', 30, 7, 4.7, TRUE, 'SUP_ADV_MED_TECH_005', 'APPLIED_ADV_MED_TECH_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Function to validate equipment assignment
CREATE OR REPLACE FUNCTION validate_equipment_assignment()
RETURNS TRIGGER AS $
BEGIN
    -- Ensure equipment is available before assignment
    IF NEW.assigned_to IS NOT NULL AND NEW.status != 'in_use' THEN
        NEW.status := 'in_use';
    ELSIF NEW.assigned_to IS NULL AND OLD.assigned_to IS NOT NULL THEN
        NEW.status := 'available';
    END IF;
    
    -- Prevent assignment of equipment under maintenance or repair
    IF NEW.assigned_to IS NOT NULL AND NEW.status IN ('maintenance', 'repair') THEN
        RAISE EXCEPTION 'Cannot assign equipment that is under maintenance or repair';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate equipment assignment
CREATE TRIGGER validate_equipment_assignment_trigger
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION validate_equipment_assignment();

-- Function to validate inventory stock movements
CREATE OR REPLACE FUNCTION validate_inventory_stock_movement()
RETURNS TRIGGER AS $
BEGIN
    -- Prevent negative stock
    IF NEW.quantity_on_hand < 0 THEN
        RAISE EXCEPTION 'Inventory quantity cannot be negative for item %', 
            (SELECT item_name FROM inventory_items WHERE id = NEW.item_id);
    END IF;
    
    -- Prevent reserved quantity from exceeding on-hand quantity
    IF NEW.quantity_reserved > NEW.quantity_on_hand THEN
        RAISE EXCEPTION 'Reserved quantity cannot exceed on-hand quantity for item %', 
            (SELECT item_name FROM inventory_items WHERE id = NEW.item_id);
    END IF;
    
    -- Update last movement date when quantities change
    IF TG_OP = 'UPDATE' AND (OLD.quantity_on_hand != NEW.quantity_on_hand OR OLD.quantity_reserved != NEW.quantity_reserved) THEN
        NEW.last_movement_date := NOW();
    END IF;
    
    -- Check expiry dates
    IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate inventory stock movements
CREATE TRIGGER validate_inventory_stock_movement_trigger
    BEFORE INSERT OR UPDATE ON inventory_stock
    FOR EACH ROW
    EXECUTE FUNCTION validate_inventory_stock_movement();

-- Insert default payment methods
INSERT INTO payment_methods (method_name, method_type, requires_reference, processing_fee_percentage, generating_code, applied_code, created_by) VALUES
('Cash', 'cash', FALSE, 0.0000, 'CASH_PAYMENT_METHOD_001', 'APPLIED_CASH_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Credit Card', 'card', TRUE, 2.5000, 'CARD_PAYMENT_METHOD_002', 'APPLIED_CARD_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Debit Card', 'card', TRUE, 1.5000, 'CARD_PAYMENT_METHOD_003', 'APPLIED_CARD_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Bank Transfer', 'bank_transfer', TRUE, 0.5000, 'BANK_PAYMENT_METHOD_004', 'APPLIED_BANK_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Cheque', 'cheque', TRUE, 0.0000, 'CHEQUE_PAYMENT_METHOD_005', 'APPLIED_CHEQUE_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Online Payment', 'online', TRUE, 2.0000, 'ONLINE_PAYMENT_METHOD_006', 'APPLIED_ONLINE_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Insurance Payment', 'insurance', TRUE, 0.0000, 'INSURANCE_PAYMENT_METHOD_007', 'APPLIED_INSURANCE_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default quality indicators
INSERT INTO quality_indicators (indicator_name, indicator_code, category, description, measurement_unit, target_value, reporting_frequency, is_jawda_indicator, generating_code, applied_code, created_by) VALUES
('Patient Satisfaction Score', 'PSS001', 'satisfaction', 'Overall patient satisfaction rating', 'percentage', 85.0000, 'monthly', TRUE, 'QI_PSS_001', 'APPLIED_PSS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Clinical Outcome Success Rate', 'COSR002', 'clinical', 'Percentage of successful clinical outcomes', 'percentage', 90.0000, 'quarterly', TRUE, 'QI_COSR_002', 'APPLIED_COSR_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medication Error Rate', 'MER003', 'safety', 'Rate of medication errors per 1000 administrations', 'per_1000', 2.0000, 'monthly', TRUE, 'QI_MER_003', 'APPLIED_MER_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Average Response Time', 'ART004', 'efficiency', 'Average response time to patient requests', 'minutes', 30.0000, 'weekly', FALSE, 'QI_ART_004', 'APPLIED_ART_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Cost Per Episode', 'CPE005', 'financial', 'Average cost per patient episode', 'AED', 2500.0000, 'monthly', FALSE, 'QI_CPE_005', 'APPLIED_CPE_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Readmission Rate', 'RR006', 'clinical', 'Rate of patient readmissions within 30 days', 'percentage', 5.0000, 'monthly', TRUE, 'QI_RR_006', 'APPLIED_RR_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Staff Compliance Rate', 'SCR007', 'safety', 'Staff compliance with safety protocols', 'percentage', 95.0000, 'monthly', TRUE, 'QI_SCR_007', 'APPLIED_SCR_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Documentation Completeness', 'DC008', 'efficiency', 'Percentage of complete clinical documentation', 'percentage', 98.0000, 'weekly', TRUE, 'QI_DC_008', 'APPLIED_DC_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Analytics & Business Intelligence
-- ================================================

-- KPI Definitions Table
CREATE TABLE kpi_definitions (
    id SERIAL PRIMARY KEY,
    kpi_name VARCHAR(200) UNIQUE NOT NULL,
    kpi_code VARCHAR(20) UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('financial', 'operational', 'clinical', 'patient_satisfaction', 'staff_productivity')),
    description TEXT,
    calculation_formula TEXT NOT NULL,
    data_sources JSONB NOT NULL,
    target_value DECIMAL(15, 6),
    unit_of_measure VARCHAR(50),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    trend_direction VARCHAR(20) DEFAULT 'higher_better' CHECK (trend_direction IN ('higher_better', 'lower_better', 'target_range')),
    threshold_green DECIMAL(15, 6),
    threshold_yellow DECIMAL(15, 6),
    threshold_red DECIMAL(15, 6),
    dashboard_display BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Measurements Table
CREATE TABLE kpi_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id),
    measurement_period DATE NOT NULL,
    measured_value DECIMAL(15, 6) NOT NULL,
    target_value DECIMAL(15, 6),
    previous_period_value DECIMAL(15, 6),
    percentage_change DECIMAL(8, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN previous_period_value > 0 THEN ((measured_value - previous_period_value) / previous_period_value) * 100 
            ELSE NULL 
        END
    ) STORED,
    performance_status VARCHAR(20) NOT NULL CHECK (performance_status IN ('excellent', 'good', 'warning', 'critical')),
    trend VARCHAR(20) DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining', 'volatile')),
    data_quality_score SMALLINT DEFAULT 5 CHECK (data_quality_score BETWEEN 1 AND 5),
    calculation_details JSONB,
    notes TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by VARCHAR(100),
    approved_by UUID REFERENCES user_profiles(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    published BOOLEAN DEFAULT FALSE,
    published_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Data Encryption & Security
-- ================================================

-- Encryption Keys Table
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id VARCHAR(100) UNIQUE NOT NULL,
    key_purpose VARCHAR(20) NOT NULL CHECK (key_purpose IN ('patient_data', 'documents', 'communications', 'backups')),
    encryption_algorithm VARCHAR(50) NOT NULL,
    key_strength INTEGER NOT NULL,
    key_value BYTEA NOT NULL,
    initialization_vector BYTEA,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'compromised')),
    rotation_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count BIGINT DEFAULT 0,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    ip_address INET NOT NULL,
    user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'expired', 'terminated', 'locked')),
    device_fingerprint VARCHAR(500),
    location_data JSONB,
    authentication_method VARCHAR(20) NOT NULL CHECK (authentication_method IN ('password', 'mfa', 'biometric', 'sso')),
    mfa_verified BOOLEAN DEFAULT FALSE,
    session_data JSONB,
    security_violations INTEGER DEFAULT 0,
    last_violation_time TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    is_concurrent BOOLEAN DEFAULT FALSE,
    concurrent_session_count INTEGER DEFAULT 1,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Enable RLS for Communication & Notifications Tables
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS for Integration & Data Exchange Tables
ALTER TABLE integration_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exchanges ENABLE ROW LEVEL SECURITY;

-- Enable RLS for Laboratory & Diagnostic Results Tables
ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Function to automatically create financial transaction for payments
CREATE OR REPLACE FUNCTION create_financial_transaction_for_payment()
RETURNS TRIGGER AS $
BEGIN
    -- Create corresponding financial transaction for new payment
    IF TG_OP = 'INSERT' THEN
        INSERT INTO financial_transactions (
            transaction_number,
            transaction_type,
            related_payment_id,
            related_invoice_id,
            patient_id,
            transaction_date,
            amount,
            currency,
            exchange_rate,
            description,
            transaction_status,
            generating_code,
            applied_code,
            created_by
        ) VALUES (
            'FT-' || NEW.payment_number,
            'payment',
            NEW.id,
            NEW.invoice_id,
            NEW.patient_id,
            NEW.payment_date,
            NEW.payment_amount,
            NEW.currency,
            NEW.exchange_rate,
            'Financial transaction for payment: ' || NEW.payment_number,
            CASE WHEN NEW.payment_status = 'cleared' THEN 'completed' ELSE 'pending' END,
            'FT_' || NEW.generating_code,
            'FT_' || NEW.applied_code,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to create financial transaction for payments
CREATE TRIGGER create_financial_transaction_on_payment
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction_for_payment();

-- RLS Policies for Communication & Notifications Tables
CREATE POLICY "All authenticated users can view notification templates" ON notification_templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage notification templates" ON notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view notifications" ON notifications
    FOR SELECT USING (
        sender_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR recipient_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their notifications" ON notifications
    FOR UPDATE USING (
        sender_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Integration & Data Exchange Tables
CREATE POLICY "All authenticated users can view integration endpoints" ON integration_endpoints
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage integration endpoints" ON integration_endpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view data exchanges" ON data_exchanges
    FOR SELECT USING (
        initiated_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create data exchanges" ON data_exchanges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their data exchanges" ON data_exchanges
    FOR UPDATE USING (
        initiated_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Laboratory & Diagnostic Results Tables
CREATE POLICY "All authenticated users can view lab test catalog" ON lab_test_catalog
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage lab test catalog" ON lab_test_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view lab orders" ON lab_orders
    FOR SELECT USING (
        ordering_provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR collected_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create lab orders" ON lab_orders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their lab orders" ON lab_orders
    FOR UPDATE USING (
        ordering_provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR collected_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_orders 
            WHERE lab_orders.id = lab_results.lab_order_id 
            AND (lab_orders.ordering_provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.collected_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.reviewed_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.created_by = auth.uid())
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create lab results" ON lab_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their lab results" ON lab_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lab_orders 
            WHERE lab_orders.id = lab_results.lab_order_id 
            AND (lab_orders.ordering_provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.collected_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.reviewed_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.created_by = auth.uid())
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Function to update invoice payment status
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $
DECLARE
    total_paid DECIMAL(12,2);
    invoice_total DECIMAL(12,2);
BEGIN
    -- Only process if payment is related to an invoice
    IF NEW.invoice_id IS NOT NULL THEN
        -- Calculate total payments for this invoice
        SELECT COALESCE(SUM(payment_amount), 0) INTO total_paid
        FROM payments 
        WHERE invoice_id = NEW.invoice_id 
        AND payment_status = 'cleared';
        
        -- Get invoice total
        SELECT total_amount INTO invoice_total
        FROM invoices 
        WHERE id = NEW.invoice_id;
        
        -- Update invoice payment status
        UPDATE invoices 
        SET 
            amount_paid = total_paid,
            payment_status = CASE 
                WHEN total_paid = 0 THEN 'unpaid'
                WHEN total_paid < invoice_total THEN 'partial'
                WHEN total_paid = invoice_total THEN 'paid'
                WHEN total_paid > invoice_total THEN 'overpaid'
                ELSE payment_status
            END,
            invoice_status = CASE 
                WHEN total_paid >= invoice_total THEN 'paid'
                ELSE invoice_status
            END,
            paid_date = CASE 
                WHEN total_paid >= invoice_total AND paid_date IS NULL THEN NOW()
                ELSE paid_date
            END
        WHERE id = NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to update invoice payment status
CREATE TRIGGER update_invoice_payment_status_trigger
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

-- Indexes for Communication & Notifications Tables
CREATE INDEX idx_notification_templates_name ON notification_templates(template_name);
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX idx_notification_templates_category ON notification_templates(category);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX idx_notification_templates_generating_code ON notification_templates(generating_code);
CREATE INDEX idx_notification_templates_applied_code ON notification_templates(applied_code);
CREATE INDEX idx_notification_templates_compliance ON notification_templates(compliance_status);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id, scheduled_time);
CREATE INDEX idx_notifications_patient ON notifications(patient_id, scheduled_time);
CREATE INDEX idx_notifications_delivery_tracking ON notifications(delivery_status, scheduled_time);
CREATE INDEX idx_notifications_template ON notifications(template_id);
CREATE INDEX idx_notifications_appointment ON notifications(related_appointment_id);
CREATE INDEX idx_notifications_medical_record ON notifications(related_record_id);
CREATE INDEX idx_notifications_sender ON notifications(sender_id);
CREATE INDEX idx_notifications_priority ON notifications(priority, scheduled_time);
CREATE INDEX idx_notifications_generating_code ON notifications(generating_code);
CREATE INDEX idx_notifications_applied_code ON notifications(applied_code);
CREATE INDEX idx_notifications_compliance ON notifications(compliance_status);

-- Indexes for Integration & Data Exchange Tables
CREATE INDEX idx_integration_endpoints_name ON integration_endpoints(endpoint_name);
CREATE INDEX idx_integration_endpoints_type ON integration_endpoints(endpoint_type);
CREATE INDEX idx_integration_endpoints_active ON integration_endpoints(is_active);
CREATE INDEX idx_integration_endpoints_connection_status ON integration_endpoints(connection_status);
CREATE INDEX idx_integration_endpoints_generating_code ON integration_endpoints(generating_code);
CREATE INDEX idx_integration_endpoints_applied_code ON integration_endpoints(applied_code);
CREATE INDEX idx_integration_endpoints_compliance ON integration_endpoints(compliance_status);

CREATE INDEX idx_data_exchanges_patient ON data_exchanges(patient_id, data_type);
CREATE INDEX idx_data_exchanges_endpoint ON data_exchanges(endpoint_id);
CREATE INDEX idx_data_exchanges_status ON data_exchanges(exchange_status, start_time);
CREATE INDEX idx_data_exchanges_external_reference ON data_exchanges(external_reference_id);
CREATE INDEX idx_data_exchanges_initiated_by ON data_exchanges(initiated_by);
CREATE INDEX idx_data_exchanges_type ON data_exchanges(data_type, exchange_type);
CREATE INDEX idx_data_exchanges_consent ON data_exchanges(consent_status, consent_date);
CREATE INDEX idx_data_exchanges_generating_code ON data_exchanges(generating_code);
CREATE INDEX idx_data_exchanges_applied_code ON data_exchanges(applied_code);
CREATE INDEX idx_data_exchanges_compliance ON data_exchanges(compliance_status);

-- Indexes for Laboratory & Diagnostic Results Tables
CREATE INDEX idx_lab_test_catalog_code ON lab_test_catalog(test_code);
CREATE INDEX idx_lab_test_catalog_name ON lab_test_catalog(test_name);
CREATE INDEX idx_lab_test_catalog_category ON lab_test_catalog(test_category);
CREATE INDEX idx_lab_test_catalog_active ON lab_test_catalog(is_active);
CREATE INDEX idx_lab_test_catalog_generating_code ON lab_test_catalog(generating_code);
CREATE INDEX idx_lab_test_catalog_applied_code ON lab_test_catalog(applied_code);
CREATE INDEX idx_lab_test_catalog_compliance ON lab_test_catalog(compliance_status);

CREATE INDEX idx_lab_orders_number ON lab_orders(order_number);
CREATE INDEX idx_lab_orders_patient_date ON lab_orders(patient_id, order_date);
CREATE INDEX idx_lab_orders_provider_orders ON lab_orders(ordering_provider_id, order_date);
CREATE INDEX idx_lab_orders_status_priority ON lab_orders(order_status, priority);
CREATE INDEX idx_lab_orders_medical_record ON lab_orders(medical_record_id);
CREATE INDEX idx_lab_orders_collected_by ON lab_orders(collected_by);
CREATE INDEX idx_lab_orders_reviewed_by ON lab_orders(reviewed_by);
CREATE INDEX idx_lab_orders_critical_results ON lab_orders(critical_results, critical_notification_sent);
CREATE INDEX idx_lab_orders_generating_code ON lab_orders(generating_code);
CREATE INDEX idx_lab_orders_applied_code ON lab_orders(applied_code);
CREATE INDEX idx_lab_orders_compliance ON lab_orders(compliance_status);

CREATE INDEX idx_lab_results_order_results ON lab_results(lab_order_id, result_date);
CREATE INDEX idx_lab_results_test_catalog ON lab_results(test_catalog_id);
CREATE INDEX idx_lab_results_abnormal_results ON lab_results(abnormal_flag, result_date);
CREATE INDEX idx_lab_results_critical_results ON lab_results(critical_notification_required, critical_notification_sent);
CREATE INDEX idx_lab_results_status ON lab_results(result_status);
CREATE INDEX idx_lab_results_trend ON lab_results(trend_direction);
CREATE INDEX idx_lab_results_generating_code ON lab_results(generating_code);
CREATE INDEX idx_lab_results_applied_code ON lab_results(applied_code);
CREATE INDEX idx_lab_results_compliance ON lab_results(compliance_status);

-- Incident Management & Safety
-- ================================================

-- Incident Types Table
CREATE TABLE incident_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('medication_error', 'patient_fall', 'equipment_failure', 'infection', 'documentation_error', 'other')),
    severity_levels JSONB, -- Available severity levels for this type
    mandatory_fields JSONB, -- Required fields for reporting
    notification_required BOOLEAN DEFAULT FALSE,
    investigation_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(30) UNIQUE NOT NULL,
    incident_type_id UUID NOT NULL REFERENCES incident_types(id),
    patient_id UUID REFERENCES patients(id),
    provider_id UUID REFERENCES healthcare_providers(id),
    incident_date DATE NOT NULL,
    incident_time TIME NOT NULL,
    location VARCHAR(200),
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('minor', 'moderate', 'major', 'catastrophic')),
    actual_harm VARCHAR(20) DEFAULT 'none' CHECK (actual_harm IN ('none', 'minor', 'moderate', 'major', 'death')),
    potential_harm VARCHAR(20) DEFAULT 'none' CHECK (potential_harm IN ('none', 'minor', 'moderate', 'major', 'death')),
    incident_description TEXT NOT NULL,
    immediate_actions_taken TEXT,
    contributing_factors JSONB,
    equipment_involved VARCHAR(200),
    medications_involved JSONB,
    witnesses JSONB, -- Array of witness information
    reported_by UUID NOT NULL REFERENCES healthcare_providers(id),
    report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manager_notified BOOLEAN DEFAULT FALSE,
    manager_notification_date TIMESTAMP WITH TIME ZONE,
    family_notified BOOLEAN DEFAULT FALSE,
    family_notification_date TIMESTAMP WITH TIME ZONE,
    physician_notified BOOLEAN DEFAULT FALSE,
    physician_notification_date TIMESTAMP WITH TIME ZONE,
    investigation_required BOOLEAN DEFAULT FALSE,
    investigation_completed BOOLEAN DEFAULT FALSE,
    investigation_findings TEXT,
    corrective_actions TEXT,
    prevention_measures TEXT,
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'under_investigation', 'resolved', 'closed')),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    regulatory_reporting_required BOOLEAN DEFAULT FALSE,
    regulatory_reported BOOLEAN DEFAULT FALSE,
    regulatory_report_date TIMESTAMP WITH TIME ZONE,
    lessons_learned TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Document Management & Attachments
-- ================================================

-- Document Categories Table
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    allowed_file_types JSONB, -- e.g., ['pdf', 'jpg', 'png', 'doc']
    max_file_size_mb INTEGER DEFAULT 10,
    retention_period_years INTEGER DEFAULT 7,
    requires_encryption BOOLEAN DEFAULT TRUE,
    access_level VARCHAR(20) DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted')),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id),
    medical_record_id UUID REFERENCES medical_records(id),
    appointment_id UUID REFERENCES appointments(id),
    document_category_id UUID NOT NULL REFERENCES document_categories(id),
    document_title VARCHAR(500) NOT NULL,
    document_description TEXT,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(256), -- For integrity verification
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_key_id VARCHAR(100),
    document_date DATE,
    expiry_date DATE,
    is_signed BOOLEAN DEFAULT FALSE,
    digital_signatures JSONB, -- Array of digital signature info
    version_number INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    access_permissions JSONB, -- Who can view/edit this document
    tags JSONB, -- Document tags for searching
    ocr_text TEXT, -- Extracted text for searching
    thumbnail_path VARCHAR(1000),
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    uploaded_by UUID NOT NULL REFERENCES healthcare_providers(id),
    reviewed_by UUID REFERENCES healthcare_providers(id),
    review_date TIMESTAMP WITH TIME ZONE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approval_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for Incident Management Tables
CREATE INDEX idx_incident_types_name ON incident_types(type_name);
CREATE INDEX idx_incident_types_category ON incident_types(category);
CREATE INDEX idx_incident_types_active ON incident_types(is_active);
CREATE INDEX idx_incident_types_generating_code ON incident_types(generating_code);
CREATE INDEX idx_incident_types_applied_code ON incident_types(applied_code);
CREATE INDEX idx_incident_types_compliance ON incident_types(compliance_status);

CREATE INDEX idx_incidents_number ON incidents(incident_number);
CREATE INDEX idx_incidents_patient_date ON incidents(patient_id, incident_date);
CREATE INDEX idx_incidents_provider_date ON incidents(provider_id, incident_date);
CREATE INDEX idx_incidents_status_severity ON incidents(status, severity_level);
CREATE INDEX idx_incidents_type_id ON incidents(incident_type_id);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_report_date ON incidents(report_date);
CREATE INDEX idx_incidents_follow_up ON incidents(follow_up_required, follow_up_date);
CREATE INDEX idx_incidents_regulatory_reporting ON incidents(regulatory_reporting_required, regulatory_reported);
CREATE INDEX idx_incidents_generating_code ON incidents(generating_code);
CREATE INDEX idx_incidents_applied_code ON incidents(applied_code);
CREATE INDEX idx_incidents_compliance ON incidents(compliance_status);

-- Indexes for Document Management Tables
CREATE INDEX idx_document_categories_name ON document_categories(category_name);
CREATE INDEX idx_document_categories_active ON document_categories(is_active);
CREATE INDEX idx_document_categories_access_level ON document_categories(access_level);
CREATE INDEX idx_document_categories_generating_code ON document_categories(generating_code);
CREATE INDEX idx_document_categories_applied_code ON document_categories(applied_code);
CREATE INDEX idx_document_categories_compliance ON document_categories(compliance_status);

CREATE INDEX idx_documents_number ON documents(document_number);
CREATE INDEX idx_documents_patient_date ON documents(patient_id, document_date);
CREATE INDEX idx_documents_medical_record ON documents(medical_record_id);
CREATE INDEX idx_documents_appointment ON documents(appointment_id);
CREATE INDEX idx_documents_category ON documents(document_category_id);
CREATE INDEX idx_documents_title_search ON documents(document_title);
CREATE INDEX idx_documents_file_hash ON documents(file_hash);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_reviewed_by ON documents(reviewed_by);
CREATE INDEX idx_documents_approval_status ON documents(approval_status);
CREATE INDEX idx_documents_parent_document ON documents(parent_document_id);
CREATE INDEX idx_documents_version ON documents(parent_document_id, version_number);
CREATE INDEX idx_documents_active ON documents(is_active);
CREATE INDEX idx_documents_generating_code ON documents(generating_code);
CREATE INDEX idx_documents_applied_code ON documents(applied_code);
CREATE INDEX idx_documents_compliance ON documents(compliance_status);
CREATE INDEX idx_documents_tags ON documents USING GIN (tags);
CREATE INDEX idx_documents_ocr_text ON documents USING GIN (to_tsvector('english', ocr_text));

-- Enable RLS for Incident Management & Document Management Tables
ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Incident Management Tables
CREATE POLICY "All authenticated users can view incident types" ON incident_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage incident types" ON incident_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view incidents" ON incidents
    FOR SELECT USING (
        reported_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create incidents" ON incidents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their incidents" ON incidents
    FOR UPDATE USING (
        reported_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Document Management Tables
CREATE POLICY "All authenticated users can view document categories" ON document_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage document categories" ON document_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view documents" ON documents
    FOR SELECT USING (
        uploaded_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
        OR (
            patient_id IS NOT NULL 
            AND EXISTS (
                SELECT 1 FROM patient_episodes 
                WHERE patient_episodes.patient_id = documents.patient_id 
                AND patient_episodes.assigned_clinician = auth.uid()
            )
        )
    );

CREATE POLICY "Healthcare providers can create documents" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their documents" ON documents
    FOR UPDATE USING (
        uploaded_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Update triggers for Incident Management & Document Management Tables
CREATE TRIGGER update_incident_types_updated_at BEFORE UPDATE ON incident_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON document_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Incident Management & Document Management Tables
CREATE TRIGGER audit_incident_types AFTER INSERT OR UPDATE OR DELETE ON incident_types FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_incidents AFTER INSERT OR UPDATE OR DELETE ON incidents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_document_categories AFTER INSERT OR UPDATE OR DELETE ON document_categories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Insert default incident types
INSERT INTO incident_types (type_name, category, severity_levels, mandatory_fields, notification_required, investigation_required, generating_code, applied_code, created_by) VALUES
('Medication Administration Error', 'medication_error', '["minor", "moderate", "major", "catastrophic"]', '["medication_name", "dosage", "administration_time", "patient_condition"]', TRUE, TRUE, 'IT_MED_ERROR_001', 'APPLIED_MED_ERROR_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Patient Fall', 'patient_fall', '["minor", "moderate", "major"]', '["fall_location", "injury_assessment", "mobility_status", "environmental_factors"]', TRUE, TRUE, 'IT_PATIENT_FALL_002', 'APPLIED_PATIENT_FALL_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Equipment Malfunction', 'equipment_failure', '["minor", "moderate", "major", "catastrophic"]', '["equipment_type", "malfunction_description", "patient_impact", "maintenance_history"]', TRUE, FALSE, 'IT_EQUIPMENT_FAIL_003', 'APPLIED_EQUIPMENT_FAIL_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Healthcare-Associated Infection', 'infection', '["moderate", "major", "catastrophic"]', '["infection_type", "source_identification", "isolation_measures", "contact_tracing"]', TRUE, TRUE, 'IT_HAI_004', 'APPLIED_HAI_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Documentation Error', 'documentation_error', '["minor", "moderate", "major"]', '["document_type", "error_description", "correction_method", "impact_assessment"]', FALSE, FALSE, 'IT_DOC_ERROR_005', 'APPLIED_DOC_ERROR_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Near Miss Event', 'other', '["minor", "moderate"]', '["event_description", "potential_consequences", "prevention_measures"]', FALSE, FALSE, 'IT_NEAR_MISS_006', 'APPLIED_NEAR_MISS_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default document categories
INSERT INTO document_categories (category_name, description, allowed_file_types, max_file_size_mb, retention_period_years, requires_encryption, access_level, generating_code, applied_code, created_by) VALUES
('Clinical Reports', 'Medical reports, lab results, diagnostic imaging', '["pdf", "jpg", "png", "dcm", "doc", "docx"]', 50, 10, TRUE, 'confidential', 'DC_CLINICAL_REPORTS_001', 'APPLIED_CLINICAL_REPORTS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Patient Consent Forms', 'Informed consent, treatment authorization forms', '["pdf", "jpg", "png", "doc", "docx"]', 10, 7, TRUE, 'confidential', 'DC_CONSENT_FORMS_002', 'APPLIED_CONSENT_FORMS_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Insurance Documents', 'Insurance cards, pre-authorization forms, claims', '["pdf", "jpg", "png", "doc", "docx"]', 25, 7, TRUE, 'internal', 'DC_INSURANCE_DOCS_003', 'APPLIED_INSURANCE_DOCS_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Identification Documents', 'Emirates ID, passport, visa documents', '["pdf", "jpg", "png"]', 10, 5, TRUE, 'restricted', 'DC_ID_DOCUMENTS_004', 'APPLIED_ID_DOCUMENTS_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Care Plans', 'Treatment plans, care coordination documents', '["pdf", "doc", "docx", "txt"]', 15, 7, TRUE, 'internal', 'DC_CARE_PLANS_005', 'APPLIED_CARE_PLANS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Incident Reports', 'Safety incident documentation, investigation reports', '["pdf", "doc", "docx", "jpg", "png"]', 20, 10, TRUE, 'restricted', 'DC_INCIDENT_REPORTS_006', 'APPLIED_INCIDENT_REPORTS_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Quality Assurance', 'Quality metrics, audit reports, compliance documents', '["pdf", "doc", "docx", "xls", "xlsx"]', 30, 7, TRUE, 'internal', 'DC_QUALITY_ASSURANCE_007', 'APPLIED_QUALITY_ASSURANCE_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Training Materials', 'Staff training documents, certifications, protocols', '["pdf", "doc", "docx", "ppt", "pptx", "mp4", "avi"]', 100, 5, FALSE, 'internal', 'DC_TRAINING_MATERIALS_008', 'APPLIED_TRAINING_MATERIALS_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default notification templates
INSERT INTO notification_templates (template_name, template_type, category, subject_template, body_template, variables, language, generating_code, applied_code, created_by) VALUES
('Appointment Reminder SMS', 'sms', 'appointment', NULL, 'Dear {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}} with {{provider_name}}. Please confirm by replying YES.', '{"patient_name": "string", "appointment_date": "date", "appointment_time": "time", "provider_name": "string"}', 'en', 'NT_APPT_REMINDER_SMS_001', 'APPLIED_APPT_REMINDER_SMS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Appointment Confirmation Email', 'email', 'appointment', 'Appointment Confirmation - {{appointment_date}}', 'Dear {{patient_name}},\n\nYour appointment has been confirmed for {{appointment_date}} at {{appointment_time}} with {{provider_name}}.\n\nLocation: {{location}}\nService: {{service_type}}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nReyada Homecare Team', '{"patient_name": "string", "appointment_date": "date", "appointment_time": "time", "provider_name": "string", "location": "string", "service_type": "string"}', 'en', 'NT_APPT_CONFIRM_EMAIL_002', 'APPLIED_APPT_CONFIRM_EMAIL_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Lab Results Available', 'email', 'general', 'Lab Results Available - {{patient_name}}', 'Dear {{patient_name}},\n\nYour lab results for tests ordered on {{order_date}} are now available.\n\nPlease log into your patient portal or contact us to discuss the results with your healthcare provider.\n\nTest(s): {{test_names}}\n\nBest regards,\nReyada Homecare Team', '{"patient_name": "string", "order_date": "date", "test_names": "string"}', 'en', 'NT_LAB_RESULTS_EMAIL_003', 'APPLIED_LAB_RESULTS_EMAIL_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Critical Lab Alert', 'system', 'emergency', 'CRITICAL: Lab Results Alert', 'CRITICAL LAB ALERT\n\nPatient: {{patient_name}} ({{mrn}})\nTest: {{test_name}}\nResult: {{result_value}} {{units}}\nNormal Range: {{normal_range}}\nOrdered by: {{ordering_provider}}\n\nImmediate attention required.', '{"patient_name": "string", "mrn": "string", "test_name": "string", "result_value": "string", "units": "string", "normal_range": "string", "ordering_provider": "string"}', 'en', 'NT_CRITICAL_LAB_ALERT_004', 'APPLIED_CRITICAL_LAB_ALERT_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medication Reminder', 'sms', 'medication', NULL, 'Medication Reminder: Time to take your {{medication_name}} ({{dosage}}). Next dose at {{next_dose_time}}.', '{"medication_name": "string", "dosage": "string", "next_dose_time": "time"}', 'en', 'NT_MED_REMINDER_SMS_005', 'APPLIED_MED_REMINDER_SMS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Billing Statement', 'email', 'billing', 'Billing Statement - {{invoice_number}}', 'Dear {{patient_name}},\n\nYour billing statement is ready.\n\nInvoice Number: {{invoice_number}}\nService Date: {{service_date}}\nAmount Due: {{amount_due}} AED\nDue Date: {{due_date}}\n\nPlease log into your patient portal to view the full statement and make payment.\n\nThank you,\nReyada Homecare Billing Team', '{"patient_name": "string", "invoice_number": "string", "service_date": "date", "amount_due": "decimal", "due_date": "date"}', 'en', 'NT_BILLING_STATEMENT_006', 'APPLIED_BILLING_STATEMENT_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default integration endpoints
INSERT INTO integration_endpoints (endpoint_name, endpoint_type, base_url, authentication_type, api_version, data_format, rate_limit_per_minute, timeout_seconds, retry_attempts, generating_code, applied_code, created_by) VALUES
('Malaffi EMR Integration', 'malaffi', 'https://api.malaffi.ae/v1', 'oauth2', 'v1.0', 'fhir', 30, 45, 3, 'IE_MALAFFI_EMR_001', 'APPLIED_MALAFFI_EMR_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Daman Insurance API', 'insurance', 'https://api.daman.ae/claims', 'api_key', 'v2.1', 'json', 60, 30, 3, 'IE_DAMAN_INSURANCE_002', 'APPLIED_DAMAN_INSURANCE_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Lab Results Integration', 'laboratory', 'https://lab-api.example.ae/v1', 'bearer', 'v1.0', 'hl7', 120, 60, 2, 'IE_LAB_RESULTS_003', 'APPLIED_LAB_RESULTS_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Radiology PACS Integration', 'radiology', 'https://pacs.example.ae/api', 'basic', 'v1.2', 'json', 30, 120, 2, 'IE_RADIOLOGY_PACS_004', 'APPLIED_RADIOLOGY_PACS_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Pharmacy Integration', 'pharmacy', 'https://pharmacy-api.example.ae/v1', 'api_key', 'v1.0', 'json', 90, 30, 3, 'IE_PHARMACY_005', 'APPLIED_PHARMACY_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default lab test catalog entries
INSERT INTO lab_test_catalog (test_code, test_name, test_category, specimen_type, normal_range_male, normal_range_female, normal_range_pediatric, units, critical_low, critical_high, turnaround_time_hours, requires_fasting, special_instructions, generating_code, applied_code, created_by) VALUES
('CBC001', 'Complete Blood Count', 'Hematology', 'Whole Blood', 'WBC: 4.5-11.0, RBC: 4.7-6.1, Hgb: 14-18', 'WBC: 4.5-11.0, RBC: 4.2-5.4, Hgb: 12-16', 'Age-dependent ranges', '10^9/L, 10^12/L, g/dL', 2.0, 30.0, 4, FALSE, 'EDTA tube required', 'LTC_CBC_001', 'APPLIED_CBC_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('GLUC001', 'Fasting Glucose', 'Chemistry', 'Serum', '70-100 mg/dL', '70-100 mg/dL', '60-100 mg/dL', 'mg/dL', 40.0, 400.0, 2, TRUE, 'Patient must fast 8-12 hours', 'LTC_GLUC_001', 'APPLIED_GLUC_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('HBA1C001', 'Hemoglobin A1c', 'Chemistry', 'Whole Blood', '<7.0%', '<7.0%', '<7.0%', '%', 4.0, 15.0, 24, FALSE, 'No fasting required', 'LTC_HBA1C_001', 'APPLIED_HBA1C_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('LIPID001', 'Lipid Panel', 'Chemistry', 'Serum', 'Total Chol <200, LDL <100, HDL >40, TG <150', 'Total Chol <200, LDL <100, HDL >50, TG <150', 'Age-dependent ranges', 'mg/dL', 50.0, 500.0, 4, TRUE, 'Fast 9-12 hours, water allowed', 'LTC_LIPID_001', 'APPLIED_LIPID_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('TSH001', 'Thyroid Stimulating Hormone', 'Endocrinology', 'Serum', '0.4-4.0 mIU/L', '0.4-4.0 mIU/L', 'Age-dependent ranges', 'mIU/L', 0.1, 20.0, 6, FALSE, 'Morning collection preferred', 'LTC_TSH_001', 'APPLIED_TSH_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('URINE001', 'Urinalysis Complete', 'Urinalysis', 'Urine', 'Normal ranges vary by parameter', 'Normal ranges vary by parameter', 'Normal ranges vary by parameter', 'Various', NULL, NULL, 2, FALSE, 'Clean catch midstream specimen', 'LTC_URINE_001', 'APPLIED_URINE_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('CRP001', 'C-Reactive Protein', 'Immunology', 'Serum', '<3.0 mg/L', '<3.0 mg/L', '<3.0 mg/L', 'mg/L', 0.0, 100.0, 4, FALSE, 'Acute phase reactant', 'LTC_CRP_001', 'APPLIED_CRP_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('D3001', 'Vitamin D (25-OH)', 'Chemistry', 'Serum', '30-100 ng/mL', '30-100 ng/mL', '30-100 ng/mL', 'ng/mL', 10.0, 150.0, 24, FALSE, 'No special preparation required', 'LTC_D3_001', 'APPLIED_D3_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Functions for auto-generating order numbers
CREATE OR REPLACE FUNCTION generate_lab_order_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_order_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(order_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM lab_orders
    WHERE order_number LIKE 'LAB-' || year_suffix || '-%';
    
    -- Generate new order number: LAB-YY-NNNNNN
    new_order_number := 'LAB-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.order_number := new_order_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate lab order numbers
CREATE TRIGGER generate_lab_order_number_trigger
    BEFORE INSERT ON lab_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_lab_order_number();

-- Function to handle critical lab results notifications
CREATE OR REPLACE FUNCTION handle_critical_lab_results()
RETURNS TRIGGER AS $
DECLARE
    test_info RECORD;
    order_info RECORD;
    patient_info RECORD;
BEGIN
    -- Check if result is critical
    IF NEW.abnormal_flag IN ('critical_high', 'critical_low') OR NEW.critical_notification_required THEN
        -- Get test information
        SELECT * INTO test_info FROM lab_test_catalog WHERE id = NEW.test_catalog_id;
        
        -- Get order information
        SELECT * INTO order_info FROM lab_orders WHERE id = NEW.lab_order_id;
        
        -- Get patient information
        SELECT * INTO patient_info FROM patients WHERE id = order_info.patient_id;
        
        -- Create critical notification
        INSERT INTO notifications (
            notification_type,
            recipient_type,
            recipient_id,
            patient_id,
            subject,
            message,
            priority,
            related_record_id,
            sender_id,
            generating_code,
            applied_code,
            created_by
        ) VALUES (
            'system',
            'provider',
            order_info.ordering_provider_id,
            order_info.patient_id,
            'CRITICAL: Lab Results Alert',
            'CRITICAL LAB ALERT\n\nPatient: ' || patient_info.first_name || ' ' || patient_info.last_name || ' (' || patient_info.mrn || ')\nTest: ' || test_info.test_name || '\nResult: ' || COALESCE(NEW.result_value, NEW.numeric_value::TEXT) || ' ' || COALESCE(NEW.units, '') || '\nNormal Range: ' || NEW.reference_range || '\n\nImmediate attention required.',
            'urgent',
            order_info.medical_record_id,
            order_info.ordering_provider_id,
            'CRITICAL_LAB_NOTIFICATION_' || NEW.id::TEXT,
            'APPLIED_CRITICAL_LAB_' || NEW.id::TEXT,
            NEW.created_by
        );
        
        -- Mark critical notification as sent
        NEW.critical_notification_sent := TRUE;
        
        -- Update lab order with critical flag
        UPDATE lab_orders 
        SET critical_results = TRUE, 
            critical_notification_sent = TRUE 
        WHERE id = NEW.lab_order_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to handle critical lab results
CREATE TRIGGER handle_critical_lab_results_trigger
    AFTER INSERT OR UPDATE ON lab_results
    FOR EACH ROW
    EXECUTE FUNCTION handle_critical_lab_results();

-- Function to generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_incident_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(incident_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM incidents
    WHERE incident_number LIKE 'INC-' || year_suffix || '-%';
    
    -- Generate new incident number: INC-YY-NNNNNN
    new_incident_number := 'INC-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.incident_number := new_incident_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate incident numbers
CREATE TRIGGER generate_incident_number_trigger
    BEFORE INSERT ON incidents
    FOR EACH ROW
    WHEN (NEW.incident_number IS NULL OR NEW.incident_number = '')
    EXECUTE FUNCTION generate_incident_number();

-- Function to generate document numbers
CREATE OR REPLACE FUNCTION generate_document_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_document_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(document_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM documents
    WHERE document_number LIKE 'DOC-' || year_suffix || '-%';
    
    -- Generate new document number: DOC-YY-NNNNNN
    new_document_number := 'DOC-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.document_number := new_document_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate document numbers
CREATE TRIGGER generate_document_number_trigger
    BEFORE INSERT ON documents
    FOR EACH ROW
    WHEN (NEW.document_number IS NULL OR NEW.document_number = '')
    EXECUTE FUNCTION generate_document_number();

-- Function to update document access tracking
CREATE OR REPLACE FUNCTION update_document_access()
RETURNS TRIGGER AS $
BEGIN
    -- Update last accessed timestamp and download count for SELECT operations
    -- This would typically be called from application layer, but included for completeness
    IF TG_OP = 'UPDATE' AND OLD.download_count < NEW.download_count THEN
        NEW.last_accessed := NOW();
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to track document access
CREATE TRIGGER update_document_access_trigger
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_access();

-- Function to validate incident severity and harm levels
CREATE OR REPLACE FUNCTION validate_incident_severity()
RETURNS TRIGGER AS $
BEGIN
    -- Ensure actual harm is not greater than potential harm
    IF NEW.actual_harm = 'death' AND NEW.potential_harm != 'death' THEN
        NEW.potential_harm := 'death';
    ELSIF NEW.actual_harm = 'major' AND NEW.potential_harm IN ('none', 'minor', 'moderate') THEN
        NEW.potential_harm := 'major';
    ELSIF NEW.actual_harm = 'moderate' AND NEW.potential_harm IN ('none', 'minor') THEN
        NEW.potential_harm := 'moderate';
    ELSIF NEW.actual_harm = 'minor' AND NEW.potential_harm = 'none' THEN
        NEW.potential_harm := 'minor';
    END IF;
    
    -- Auto-set investigation required for major incidents
    IF NEW.severity_level IN ('major', 'catastrophic') OR NEW.actual_harm IN ('major', 'death') THEN
        NEW.investigation_required := TRUE;
    END IF;
    
    -- Auto-set regulatory reporting for severe incidents
    IF NEW.severity_level = 'catastrophic' OR NEW.actual_harm = 'death' THEN
        NEW.regulatory_reporting_required := TRUE;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate incident data
CREATE TRIGGER validate_incident_severity_trigger
    BEFORE INSERT OR UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION validate_incident_severity();

-- Function to validate document file constraints
CREATE OR REPLACE FUNCTION validate_document_constraints()
RETURNS TRIGGER AS $
DECLARE
    category_record RECORD;
    file_extension VARCHAR(10);
BEGIN
    -- Get document category constraints
    SELECT * INTO category_record
    FROM document_categories
    WHERE id = NEW.document_category_id;
    
    -- Extract file extension
    file_extension := LOWER(RIGHT(NEW.file_name, LENGTH(NEW.file_name) - POSITION('.' IN REVERSE(NEW.file_name))));
    
    -- Validate file type
    IF NOT (category_record.allowed_file_types @> to_jsonb(file_extension)) THEN
        RAISE EXCEPTION 'File type % not allowed for category %', file_extension, category_record.category_name;
    END IF;
    
    -- Validate file size
    IF NEW.file_size_bytes > (category_record.max_file_size_mb * 1024 * 1024) THEN
        RAISE EXCEPTION 'File size exceeds maximum allowed size of % MB for category %', 
            category_record.max_file_size_mb, category_record.category_name;
    END IF;
    
    -- Set encryption requirement based on category
    IF category_record.requires_encryption THEN
        NEW.is_encrypted := TRUE;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate document constraints
CREATE TRIGGER validate_document_constraints_trigger
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION validate_document_constraints();

-- Communication & Notifications
-- ================================================

-- Notification Templates Table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('sms', 'email', 'push', 'system')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('appointment', 'medication', 'emergency', 'billing', 'general')),
    subject_template VARCHAR(500),
    body_template TEXT NOT NULL,
    variables JSONB, -- Available template variables
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('sms', 'email', 'push', 'system')),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('patient', 'provider', 'admin', 'family')),
    recipient_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id),
    template_id UUID REFERENCES notification_templates(id),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    delivery_attempts INTEGER DEFAULT 0,
    failure_reason TEXT,
    read_status BOOLEAN DEFAULT FALSE,
    read_time TIMESTAMP WITH TIME ZONE,
    response_required BOOLEAN DEFAULT FALSE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    response_received TEXT,
    response_time TIMESTAMP WITH TIME ZONE,
    related_appointment_id UUID REFERENCES appointments(id),
    related_record_id UUID REFERENCES medical_records(id),
    sender_id UUID REFERENCES healthcare_providers(id),
    cost DECIMAL(8, 4) DEFAULT 0.0000, -- SMS/call costs
    external_reference VARCHAR(200), -- Third-party service reference
    metadata JSONB, -- Additional notification data
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Integration & Data Exchange
-- ================================================

-- Integration Endpoints Table
CREATE TABLE integration_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_name VARCHAR(100) UNIQUE NOT NULL,
    endpoint_type VARCHAR(20) NOT NULL CHECK (endpoint_type IN ('malaffi', 'insurance', 'laboratory', 'radiology', 'pharmacy', 'other')),
    base_url VARCHAR(500) NOT NULL,
    authentication_type VARCHAR(20) NOT NULL CHECK (authentication_type IN ('none', 'basic', 'bearer', 'oauth2', 'api_key')),
    authentication_details JSONB, -- Encrypted credentials
    api_version VARCHAR(20),
    data_format VARCHAR(20) DEFAULT 'json' CHECK (data_format IN ('json', 'xml', 'hl7', 'fhir')),
    rate_limit_per_minute INTEGER DEFAULT 60,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    last_connection_test TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(20) DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
    error_message TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Data Exchanges Table
CREATE TABLE data_exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exchange_type VARCHAR(20) NOT NULL CHECK (exchange_type IN ('send', 'receive', 'sync')),
    endpoint_id UUID NOT NULL REFERENCES integration_endpoints(id),
    patient_id UUID REFERENCES patients(id),
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('patient_demographics', 'medical_records', 'lab_results', 'radiology', 'prescriptions', 'allergies', 'immunizations')),
    exchange_status VARCHAR(20) DEFAULT 'pending' CHECK (exchange_status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    request_payload JSONB,
    response_payload JSONB,
    external_reference_id VARCHAR(200),
    initiated_by UUID REFERENCES healthcare_providers(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    bytes_transferred BIGINT,
    records_processed INTEGER,
    validation_errors JSONB,
    consent_status VARCHAR(20) DEFAULT 'pending' CHECK (consent_status IN ('granted', 'denied', 'pending', 'expired')),
    consent_date TIMESTAMP WITH TIME ZONE,
    audit_trail JSONB, -- Detailed logging
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Laboratory & Diagnostic Results
-- ================================================

-- Lab Test Catalog Table
CREATE TABLE lab_test_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_code VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    test_category VARCHAR(100),
    specimen_type VARCHAR(100),
    normal_range_male VARCHAR(200),
    normal_range_female VARCHAR(200),
    normal_range_pediatric VARCHAR(200),
    units VARCHAR(50),
    critical_low DECIMAL(15, 6),
    critical_high DECIMAL(15, 6),
    turnaround_time_hours INTEGER,
    requires_fasting BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Lab Orders Table
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    ordering_provider_id UUID NOT NULL REFERENCES healthcare_providers(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
    clinical_indication TEXT,
    specimen_collection_date TIMESTAMP WITH TIME ZONE,
    specimen_collection_location VARCHAR(200),
    collected_by UUID REFERENCES healthcare_providers(id),
    lab_facility VARCHAR(200),
    external_order_id VARCHAR(100),
    order_status VARCHAR(20) DEFAULT 'ordered' CHECK (order_status IN ('ordered', 'collected', 'in_transit', 'received', 'in_progress', 'completed', 'cancelled')),
    completion_date TIMESTAMP WITH TIME ZONE,
    report_url VARCHAR(1000),
    critical_results BOOLEAN DEFAULT FALSE,
    critical_notification_sent BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES healthcare_providers(id),
    review_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Lab Results Table
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    test_catalog_id UUID NOT NULL REFERENCES lab_test_catalog(id),
    result_value VARCHAR(500),
    numeric_value DECIMAL(15, 6),
    units VARCHAR(50),
    reference_range VARCHAR(200),
    abnormal_flag VARCHAR(20) DEFAULT 'normal' CHECK (abnormal_flag IN ('normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal')),
    result_status VARCHAR(20) DEFAULT 'final' CHECK (result_status IN ('preliminary', 'final', 'corrected', 'cancelled')),
    result_date TIMESTAMP WITH TIME ZONE NOT NULL,
    performed_by VARCHAR(200),
    verified_by VARCHAR(200),
    methodology VARCHAR(200),
    notes TEXT,
    quality_flags JSONB,
    delta_check_flag BOOLEAN DEFAULT FALSE,
    previous_value DECIMAL(15, 6),
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('stable', 'increasing', 'decreasing', 'fluctuating')),
    critical_notification_required BOOLEAN DEFAULT FALSE,
    critical_notification_sent BOOLEAN DEFAULT FALSE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Enhanced API Architecture & Endpoints Implementation
-- ================================================

-- API Configuration Table
CREATE TABLE api_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_name VARCHAR(100) UNIQUE NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    api_version VARCHAR(20) NOT NULL,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    authentication_type VARCHAR(20) NOT NULL CHECK (authentication_type IN ('jwt', 'oauth2', 'api_key', 'basic')),
    token_expiry_minutes INTEGER DEFAULT 60,
    refresh_token_expiry_hours INTEGER DEFAULT 24,
    rate_limit_per_minute INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- API Response Tracking Table
CREATE TABLE api_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(100) UNIQUE NOT NULL,
    endpoint_name VARCHAR(200) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    request_url VARCHAR(1000) NOT NULL,
    request_headers JSONB,
    request_body JSONB,
    response_status INTEGER NOT NULL,
    response_headers JSONB,
    response_body JSONB,
    response_time_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    validation_errors JSONB,
    metadata JSONB,
    pagination_info JSONB,
    timestamp_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp_response TIMESTAMP WITH TIME ZONE,
    api_version VARCHAR(20),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- API Endpoint Definitions Table
CREATE TABLE api_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_category VARCHAR(50) NOT NULL CHECK (endpoint_category IN ('patient', 'medical_records', 'homecare', 'appointments', 'billing', 'quality', 'integration', 'analytics')),
    endpoint_name VARCHAR(200) NOT NULL,
    http_method VARCHAR(10) NOT NULL CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
    endpoint_path VARCHAR(500) NOT NULL,
    description TEXT,
    request_schema JSONB,
    response_schema JSONB,
    authentication_required BOOLEAN DEFAULT TRUE,
    rate_limit_per_minute INTEGER DEFAULT 60,
    cache_duration_seconds INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT 'v1',
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Insert comprehensive API endpoint definitions
INSERT INTO api_endpoints (endpoint_category, endpoint_name, http_method, endpoint_path, description, authentication_required, generating_code, applied_code, created_by) VALUES
-- Patient Management APIs
('patient', 'Create Patient', 'POST', '/api/v1/patients', 'Create a new patient record with Emirates ID integration', TRUE, 'API_CREATE_PATIENT_001', 'APPLIED_CREATE_PATIENT_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('patient', 'Get Patients', 'GET', '/api/v1/patients', 'Retrieve paginated list of patients with filtering', TRUE, 'API_GET_PATIENTS_002', 'APPLIED_GET_PATIENTS_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('patient', 'Get Patient by ID', 'GET', '/api/v1/patients/:id', 'Retrieve specific patient by ID', TRUE, 'API_GET_PATIENT_003', 'APPLIED_GET_PATIENT_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('patient', 'Update Patient', 'PUT', '/api/v1/patients/:id', 'Update patient information', TRUE, 'API_UPDATE_PATIENT_004', 'APPLIED_UPDATE_PATIENT_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('patient', 'Search Patients', 'GET', '/api/v1/patients/search', 'Search patients by various criteria', TRUE, 'API_SEARCH_PATIENTS_005', 'APPLIED_SEARCH_PATIENTS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('patient', 'Get Homebound Patients', 'GET', '/api/v1/patients/homebound', 'Retrieve all homebound certified patients', TRUE, 'API_HOMEBOUND_PATIENTS_006', 'APPLIED_HOMEBOUND_PATIENTS_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Medical Records APIs
('medical_records', 'Create Medical Record', 'POST', '/api/v1/patients/:patientId/medical-records', 'Create new medical record for patient', TRUE, 'API_CREATE_MEDICAL_RECORD_007', 'APPLIED_CREATE_MEDICAL_RECORD_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('medical_records', 'Get Medical Records', 'GET', '/api/v1/patients/:patientId/medical-records', 'Retrieve patient medical records', TRUE, 'API_GET_MEDICAL_RECORDS_008', 'APPLIED_GET_MEDICAL_RECORDS_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('medical_records', 'Start Visit', 'POST', '/api/v1/medical-records/:id/start-visit', 'Start a clinical visit session', TRUE, 'API_START_VISIT_009', 'APPLIED_START_VISIT_009', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('medical_records', 'Complete Visit', 'POST', '/api/v1/medical-records/:id/complete-visit', 'Complete and finalize clinical visit', TRUE, 'API_COMPLETE_VISIT_010', 'APPLIED_COMPLETE_VISIT_010', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('medical_records', 'Add Vital Signs', 'POST', '/api/v1/medical-records/:id/vital-signs', 'Record patient vital signs', TRUE, 'API_ADD_VITAL_SIGNS_011', 'APPLIED_ADD_VITAL_SIGNS_011', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Homecare APIs
('homecare', 'Create Care Plan', 'POST', '/api/v1/patients/:patientId/care-plans', 'Create comprehensive care plan', TRUE, 'API_CREATE_CARE_PLAN_012', 'APPLIED_CREATE_CARE_PLAN_012', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('homecare', 'Add Homecare Service', 'POST', '/api/v1/medical-records/:id/homecare-services', 'Add homecare service to medical record', TRUE, 'API_ADD_HOMECARE_SERVICE_013', 'APPLIED_ADD_HOMECARE_SERVICE_013', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('homecare', 'Create DOH Referral Form', 'POST', '/api/v1/patients/:patientId/doh-forms/referral', 'Create DOH compliant referral form', TRUE, 'API_CREATE_DOH_REFERRAL_014', 'APPLIED_CREATE_DOH_REFERRAL_014', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('homecare', 'Calculate Level of Care', 'POST', '/api/v1/homecare-services/calculate-level-of-care', 'Calculate patient level of care requirements', TRUE, 'API_CALCULATE_LOC_015', 'APPLIED_CALCULATE_LOC_015', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Appointment Management APIs
('appointments', 'Create Appointment', 'POST', '/api/v1/appointments', 'Schedule new patient appointment', TRUE, 'API_CREATE_APPOINTMENT_016', 'APPLIED_CREATE_APPOINTMENT_016', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('appointments', 'Get Appointments', 'GET', '/api/v1/appointments', 'Retrieve appointments with filtering', TRUE, 'API_GET_APPOINTMENTS_017', 'APPLIED_GET_APPOINTMENTS_017', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('appointments', 'Update Appointment', 'PUT', '/api/v1/appointments/:id', 'Update appointment details', TRUE, 'API_UPDATE_APPOINTMENT_018', 'APPLIED_UPDATE_APPOINTMENT_018', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('appointments', 'Cancel Appointment', 'PATCH', '/api/v1/appointments/:id/cancel', 'Cancel scheduled appointment', TRUE, 'API_CANCEL_APPOINTMENT_019', 'APPLIED_CANCEL_APPOINTMENT_019', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('appointments', 'Optimize Routes', 'POST', '/api/v1/appointments/optimize-routes', 'Optimize provider routes for home visits', TRUE, 'API_OPTIMIZE_ROUTES_020', 'APPLIED_OPTIMIZE_ROUTES_020', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Billing & Insurance APIs
('billing', 'Create Invoice', 'POST', '/api/v1/invoices', 'Generate patient or insurance invoice', TRUE, 'API_CREATE_INVOICE_021', 'APPLIED_CREATE_INVOICE_021', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('billing', 'Record Payment', 'POST', '/api/v1/payments', 'Record patient payment transaction', TRUE, 'API_RECORD_PAYMENT_022', 'APPLIED_RECORD_PAYMENT_022', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('billing', 'Create Pre-Authorization', 'POST', '/api/v1/pre-authorizations', 'Submit insurance pre-authorization request', TRUE, 'API_CREATE_PREAUTH_023', 'APPLIED_CREATE_PREAUTH_023', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('billing', 'Submit Insurance Claim', 'POST', '/api/v1/insurance-claims/:id/submit', 'Submit claim to insurance provider', TRUE, 'API_SUBMIT_CLAIM_024', 'APPLIED_SUBMIT_CLAIM_024', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Quality & Compliance APIs
('quality', 'Get Quality Indicators', 'GET', '/api/v1/quality/indicators', 'Retrieve quality performance indicators', TRUE, 'API_GET_QUALITY_INDICATORS_025', 'APPLIED_GET_QUALITY_INDICATORS_025', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('quality', 'Record Quality Measurement', 'POST', '/api/v1/quality/measurements', 'Record quality metric measurement', TRUE, 'API_RECORD_QUALITY_MEASUREMENT_026', 'APPLIED_RECORD_QUALITY_MEASUREMENT_026', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('quality', 'Report Incident', 'POST', '/api/v1/incidents', 'Report safety or quality incident', TRUE, 'API_REPORT_INCIDENT_027', 'APPLIED_REPORT_INCIDENT_027', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('quality', 'Get Compliance Status', 'GET', '/api/v1/compliance/status', 'Check DOH compliance status', TRUE, 'API_GET_COMPLIANCE_STATUS_028', 'APPLIED_GET_COMPLIANCE_STATUS_028', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Integration APIs
('integration', 'Sync with Malaffi', 'POST', '/api/v1/integration/malaffi/sync', 'Synchronize data with Malaffi EMR', TRUE, 'API_SYNC_MALAFFI_029', 'APPLIED_SYNC_MALAFFI_029', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('integration', 'Verify Insurance Eligibility', 'POST', '/api/v1/integration/insurance/verify-eligibility', 'Verify patient insurance eligibility', TRUE, 'API_VERIFY_INSURANCE_030', 'APPLIED_VERIFY_INSURANCE_030', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('integration', 'Send Notification', 'POST', '/api/v1/notifications/sms', 'Send SMS notification to patient', TRUE, 'API_SEND_SMS_031', 'APPLIED_SEND_SMS_031', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),

-- Analytics & Reporting APIs
('analytics', 'Get Dashboard Data', 'GET', '/api/v1/analytics/dashboard', 'Retrieve dashboard KPI data', TRUE, 'API_GET_DASHBOARD_032', 'APPLIED_GET_DASHBOARD_032', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('analytics', 'Calculate KPI', 'POST', '/api/v1/analytics/kpis/:id/calculate', 'Calculate specific KPI measurement', TRUE, 'API_CALCULATE_KPI_033', 'APPLIED_CALCULATE_KPI_033', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('analytics', 'Generate Custom Report', 'POST', '/api/v1/reports/custom', 'Generate custom analytics report', TRUE, 'API_GENERATE_REPORT_034', 'APPLIED_GENERATE_REPORT_034', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('analytics', 'Get Revenue Analytics', 'GET', '/api/v1/analytics/revenue', 'Retrieve financial performance analytics', TRUE, 'API_GET_REVENUE_ANALYTICS_035', 'APPLIED_GET_REVENUE_ANALYTICS_035', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default API configuration
INSERT INTO api_configurations (config_name, base_url, api_version, timeout_seconds, retry_attempts, authentication_type, token_expiry_minutes, refresh_token_expiry_hours, rate_limit_per_minute, generating_code, applied_code, created_by) VALUES
('Reyada Homecare API', 'https://api.reyada-homecare.ae', 'v1.0', 30, 3, 'jwt', 60, 24, 100, 'API_CONFIG_REYADA_001', 'APPLIED_API_CONFIG_REYADA_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Malaffi Integration API', 'https://api.malaffi.ae', 'v1.0', 45, 3, 'oauth2', 30, 12, 60, 'API_CONFIG_MALAFFI_002', 'APPLIED_API_CONFIG_MALAFFI_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Daman Insurance API', 'https://api.daman.ae', 'v2.1', 30, 3, 'api_key', 120, 24, 30, 'API_CONFIG_DAMAN_003', 'APPLIED_API_CONFIG_DAMAN_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Indexes for API tables
CREATE INDEX idx_api_configurations_name ON api_configurations(config_name);
CREATE INDEX idx_api_configurations_active ON api_configurations(is_active);
CREATE INDEX idx_api_configurations_generating_code ON api_configurations(generating_code);
CREATE INDEX idx_api_configurations_applied_code ON api_configurations(applied_code);

CREATE INDEX idx_api_responses_request_id ON api_responses(request_id);
CREATE INDEX idx_api_responses_endpoint_timestamp ON api_responses(endpoint_name, timestamp_request);
CREATE INDEX idx_api_responses_success_status ON api_responses(success, response_status);
CREATE INDEX idx_api_responses_generating_code ON api_responses(generating_code);
CREATE INDEX idx_api_responses_applied_code ON api_responses(applied_code);

CREATE INDEX idx_api_endpoints_category ON api_endpoints(endpoint_category);
CREATE INDEX idx_api_endpoints_method_path ON api_endpoints(http_method, endpoint_path);
CREATE INDEX idx_api_endpoints_active ON api_endpoints(is_active);
CREATE INDEX idx_api_endpoints_generating_code ON api_endpoints(generating_code);
CREATE INDEX idx_api_endpoints_applied_code ON api_endpoints(applied_code);

-- Enable RLS for API tables
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for API tables
CREATE POLICY "Admins can manage API configurations" ON api_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view API endpoints" ON api_endpoints
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can log API responses" ON api_responses
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update triggers for API tables
CREATE TRIGGER update_api_configurations_updated_at BEFORE UPDATE ON api_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_responses_updated_at BEFORE UPDATE ON api_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON api_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for API tables
CREATE TRIGGER enhanced_audit_api_configurations AFTER INSERT OR UPDATE OR DELETE ON api_configurations FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_api_responses AFTER INSERT OR UPDATE OR DELETE ON api_responses FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_api_endpoints AFTER INSERT OR UPDATE OR DELETE ON api_endpoints FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
 THEN
            RAISE EXCEPTION 'Invalid Emirates ID format: %. Must be 15 digits.', NEW.emirates_id;
        END IF;
    END IF;
    
    -- Validate MRN uniqueness and format
    IF TG_TABLE_NAME = 'patients' AND NEW.mrn IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM patients WHERE mrn = NEW.mrn AND id != COALESCE(NEW.id, uuid_generate_v4())) THEN
            RAISE EXCEPTION 'MRN % already exists', NEW.mrn;
        END IF;
    END IF;
    
    -- Validate appointment date constraints
    IF TG_TABLE_NAME = 'appointments' THEN
        IF NEW.appointment_date < CURRENT_DATE THEN
            RAISE EXCEPTION 'Cannot schedule appointments in the past';
        END IF;
        
        -- Check for double booking
        IF EXISTS (
            SELECT 1 FROM appointments 
            WHERE provider_id = NEW.provider_id 
            AND appointment_date = NEW.appointment_date 
            AND appointment_time = NEW.appointment_time
            AND appointment_status NOT IN ('cancelled', 'no_show')
            AND id != COALESCE(NEW.id, uuid_generate_v4())
        ) THEN
            RAISE EXCEPTION 'Provider already has an appointment at this time';
        END IF;
    END IF;
    
    -- Validate invoice amounts
    IF TG_TABLE_NAME = 'invoices' THEN
        IF NEW.total_amount < 0 THEN
            RAISE EXCEPTION 'Invoice total amount cannot be negative';
        END IF;
        
        IF NEW.amount_paid < 0 THEN
            RAISE EXCEPTION 'Invoice paid amount cannot be negative';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply enhanced audit triggers to all critical tables
CREATE TRIGGER enhanced_audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_patient_episodes AFTER INSERT OR UPDATE OR DELETE ON patient_episodes FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_clinical_forms AFTER INSERT OR UPDATE OR DELETE ON clinical_forms FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_daman_claims AFTER INSERT OR UPDATE OR DELETE ON daman_claims FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_doh_referral_forms AFTER INSERT OR UPDATE OR DELETE ON doh_referral_forms FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_healthcare_providers AFTER INSERT OR UPDATE OR DELETE ON healthcare_providers FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_doh_compliance_records AFTER INSERT OR UPDATE OR DELETE ON doh_compliance_records FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_medical_records AFTER INSERT OR UPDATE OR DELETE ON medical_records FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_homecare_services AFTER INSERT OR UPDATE OR DELETE ON homecare_services FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_doh_assessment_forms AFTER INSERT OR UPDATE OR DELETE ON doh_assessment_forms FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_doh_monitoring_forms AFTER INSERT OR UPDATE OR DELETE ON doh_monitoring_forms FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_care_plans AFTER INSERT OR UPDATE OR DELETE ON care_plans FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_care_plan_goals AFTER INSERT OR UPDATE OR DELETE ON care_plan_goals FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_patient_addresses AFTER INSERT OR UPDATE OR DELETE ON patient_addresses FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_appointment_types AFTER INSERT OR UPDATE OR DELETE ON appointment_types FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_service_locations AFTER INSERT OR UPDATE OR DELETE ON service_locations FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_appointment_resources AFTER INSERT OR UPDATE OR DELETE ON appointment_resources FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_appointment_notifications AFTER INSERT OR UPDATE OR DELETE ON appointment_notifications FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER enhanced_audit_appointment_conflicts AFTER INSERT OR UPDATE OR DELETE ON appointment_conflicts FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();

-- Apply data integrity validation triggers
CREATE TRIGGER data_integrity_patients BEFORE INSERT OR UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION data_integrity_validation_trigger();
CREATE TRIGGER data_integrity_appointments BEFORE INSERT OR UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION data_integrity_validation_trigger();
CREATE TRIGGER data_integrity_invoices BEFORE INSERT OR UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION data_integrity_validation_trigger();

-- Route Optimization for Home Visits
-- ================================================

-- Route Optimizations Table
CREATE TABLE route_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    optimization_date DATE NOT NULL,
    total_appointments INTEGER NOT NULL,
    total_distance_km DECIMAL(8, 2),
    total_travel_time_minutes INTEGER,
    optimization_algorithm VARCHAR(50) DEFAULT 'genetic_algorithm', -- e.g., 'genetic_algorithm', 'nearest_neighbor', 'ant_colony', 'simulated_annealing'
    route_sequence JSONB NOT NULL, -- Ordered list of appointment IDs with timestamps
    waypoints JSONB, -- GPS coordinates in order with metadata
    traffic_considerations JSONB, -- Real-time traffic data and predictions
    weather_considerations JSONB, -- Weather impact on travel times
    fuel_consumption_estimate DECIMAL(6, 2), -- Liters
    carbon_footprint_kg DECIMAL(8, 4), -- Environmental impact tracking
    optimization_score DECIMAL(5, 2), -- Efficiency score (0-100)
    actual_distance_km DECIMAL(8, 2), -- Post-execution actual distance
    actual_travel_time_minutes INTEGER, -- Post-execution actual time
    deviations_from_plan JSONB, -- Tracking of route changes and reasons
    route_status VARCHAR(20) DEFAULT 'planned' CHECK (route_status IN ('planned', 'active', 'completed', 'cancelled', 'modified')),
    optimization_parameters JSONB, -- Algorithm-specific parameters used
    cost_analysis JSONB, -- Financial cost breakdown
    patient_satisfaction_metrics JSONB, -- Patient feedback on timing
    emergency_contingencies JSONB, -- Emergency route alternatives
    vehicle_type VARCHAR(50), -- Type of vehicle used for optimization
    driver_preferences JSONB, -- Driver-specific routing preferences
    accessibility_requirements JSONB, -- Special accessibility considerations
    time_window_constraints JSONB, -- Patient availability windows
    service_duration_estimates JSONB, -- Expected time at each location
    route_complexity_score DECIMAL(4, 2), -- Complexity rating for the route
    optimization_duration_seconds INTEGER, -- Time taken to compute optimization
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route Optimization Metrics Table (for performance tracking)
CREATE TABLE route_optimization_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_optimization_id UUID NOT NULL REFERENCES route_optimizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('efficiency', 'cost_savings', 'time_savings', 'fuel_savings', 'patient_satisfaction', 'environmental_impact')),
    metric_value DECIMAL(10, 4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL, -- e.g., 'percentage', 'minutes', 'km', 'liters', 'kg_co2'
    baseline_value DECIMAL(10, 4), -- Comparison baseline
    improvement_percentage DECIMAL(5, 2), -- Calculated improvement
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(100), -- Source of the metric data
    confidence_level DECIMAL(3, 2), -- Confidence in the measurement (0-1)
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Route Optimization History Table (for tracking changes)
CREATE TABLE route_optimization_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_optimization_id UUID NOT NULL REFERENCES route_optimizations(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('created', 'modified', 'cancelled', 'completed', 'emergency_change')),
    change_reason TEXT,
    previous_route_data JSONB, -- Previous route configuration
    new_route_data JSONB, -- New route configuration
    impact_analysis JSONB, -- Analysis of the change impact
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES user_profiles(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    change_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Route Optimization Tables
CREATE INDEX idx_route_optimizations_provider_date ON route_optimizations(provider_id, optimization_date);
CREATE INDEX idx_route_optimizations_status ON route_optimizations(route_status);
CREATE INDEX idx_route_optimizations_date ON route_optimizations(optimization_date);
CREATE INDEX idx_route_optimizations_algorithm ON route_optimizations(optimization_algorithm);
CREATE INDEX idx_route_optimizations_score ON route_optimizations(optimization_score);
CREATE INDEX idx_route_optimizations_generating_code ON route_optimizations(generating_code);
CREATE INDEX idx_route_optimizations_applied_code ON route_optimizations(applied_code);
CREATE INDEX idx_route_optimizations_created_by ON route_optimizations(created_by);
CREATE INDEX idx_route_optimizations_compliance ON route_optimizations(compliance_status);

CREATE INDEX idx_route_optimization_metrics_route_id ON route_optimization_metrics(route_optimization_id);
CREATE INDEX idx_route_optimization_metrics_type ON route_optimization_metrics(metric_type);
CREATE INDEX idx_route_optimization_metrics_date ON route_optimization_metrics(measurement_date);
CREATE INDEX idx_route_optimization_metrics_generating_code ON route_optimization_metrics(generating_code);
CREATE INDEX idx_route_optimization_metrics_applied_code ON route_optimization_metrics(applied_code);

CREATE INDEX idx_route_optimization_history_route_id ON route_optimization_history(route_optimization_id);
CREATE INDEX idx_route_optimization_history_type ON route_optimization_history(change_type);
CREATE INDEX idx_route_optimization_history_timestamp ON route_optimization_history(change_timestamp);
CREATE INDEX idx_route_optimization_history_generating_code ON route_optimization_history(generating_code);
CREATE INDEX idx_route_optimization_history_applied_code ON route_optimization_history(applied_code);
CREATE INDEX idx_route_optimization_history_created_by ON route_optimization_history(created_by);

-- Enable RLS for Route Optimization Tables
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Route Optimization Tables
CREATE POLICY "Healthcare providers can view their route optimizations" ON route_optimizations
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create route optimizations" ON route_optimizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their route optimizations" ON route_optimizations
    FOR UPDATE USING (
        provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view route optimization metrics" ON route_optimization_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM route_optimizations 
            WHERE route_optimizations.id = route_optimization_metrics.route_optimization_id 
            AND (route_optimizations.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR route_optimizations.created_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create route optimization metrics" ON route_optimization_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can view route optimization history" ON route_optimization_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM route_optimizations 
            WHERE route_optimizations.id = route_optimization_history.route_optimization_id 
            AND (route_optimizations.provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR route_optimizations.created_by = auth.uid())
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create route optimization history" ON route_optimization_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

-- Update triggers for Route Optimization Tables
CREATE TRIGGER update_route_optimizations_updated_at BEFORE UPDATE ON route_optimizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_optimization_metrics_updated_at BEFORE UPDATE ON route_optimization_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Route Optimization Tables
CREATE TRIGGER audit_route_optimizations AFTER INSERT OR UPDATE OR DELETE ON route_optimizations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_route_optimization_metrics AFTER INSERT OR UPDATE OR DELETE ON route_optimization_metrics FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_route_optimization_history AFTER INSERT OR UPDATE OR DELETE ON route_optimization_history FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Billing & Insurance Tables
-- ================================================

-- Insurance Companies Table (required for billing)
CREATE TABLE insurance_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL,
    company_code VARCHAR(20) UNIQUE NOT NULL,
    contact_info JSONB,
    billing_address JSONB,
    payment_terms_days INTEGER DEFAULT 30,
    electronic_billing_enabled BOOLEAN DEFAULT FALSE,
    api_credentials JSONB,
    contract_details JSONB,
    coverage_types JSONB,
    preauthorization_required BOOLEAN DEFAULT TRUE,
    claim_submission_format VARCHAR(50) DEFAULT 'electronic',
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- CPT Codes Table (required for billing)
CREATE TABLE cpt_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpt_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    base_rvu DECIMAL(8, 4), -- Relative Value Units
    work_rvu DECIMAL(8, 4),
    practice_expense_rvu DECIMAL(8, 4),
    malpractice_rvu DECIMAL(8, 4),
    modifier_allowed BOOLEAN DEFAULT TRUE,
    bilateral_surgery BOOLEAN DEFAULT FALSE,
    assistant_surgery BOOLEAN DEFAULT FALSE,
    co_surgery BOOLEAN DEFAULT FALSE,
    multiple_procedure BOOLEAN DEFAULT FALSE,
    effective_date DATE NOT NULL,
    termination_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Service Tariffs Table
CREATE TABLE service_tariffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(200) NOT NULL,
    service_code VARCHAR(20) UNIQUE NOT NULL,
    cpt_code_id UUID REFERENCES cpt_codes(id),
    insurance_company_id UUID REFERENCES insurance_companies(id),
    level_of_care VARCHAR(30) CHECK (level_of_care IN ('simple_home_visit', 'routine_home_nursing', 'advanced_home_nursing', 'specialized_home_visit')),
    base_price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER,
    requires_preauthorization BOOLEAN DEFAULT FALSE,
    billing_unit VARCHAR(20) DEFAULT 'per_visit' CHECK (billing_unit IN ('per_visit', 'per_hour', 'per_day', 'per_procedure')),
    maximum_units_per_day INTEGER,
    maximum_units_per_week INTEGER,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Pre-Authorizations Table
CREATE TABLE pre_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID NOT NULL REFERENCES insurance_companies(id),
    authorization_number VARCHAR(100) UNIQUE,
    request_date DATE NOT NULL,
    requested_by UUID NOT NULL REFERENCES healthcare_providers(id),
    requested_services JSONB NOT NULL, -- List of requested services
    medical_justification TEXT NOT NULL,
    supporting_documents JSONB, -- URLs to uploaded documents
    authorization_status VARCHAR(20) DEFAULT 'pending' CHECK (authorization_status IN ('pending', 'approved', 'denied', 'expired', 'cancelled')),
    approved_services JSONB, -- Services actually approved
    approval_date DATE,
    effective_date DATE,
    expiry_date DATE,
    approved_units INTEGER,
    used_units INTEGER DEFAULT 0,
    denial_reason TEXT,
    reviewer_notes TEXT,
    insurance_reviewer VARCHAR(200),
    appeal_deadline DATE,
    appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'filed', 'approved', 'denied')),
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID REFERENCES insurance_companies(id),
    medical_record_id UUID REFERENCES medical_records(id),
    appointment_id UUID REFERENCES appointments(id),
    invoice_date DATE NOT NULL,
    service_date DATE NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('patient', 'insurance', 'mixed')),
    subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    patient_responsibility DECIMAL(12, 2) DEFAULT 0.00,
    insurance_responsibility DECIMAL(12, 2) DEFAULT 0.00,
    copay_amount DECIMAL(12, 2) DEFAULT 0.00,
    deductible_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_terms_days INTEGER DEFAULT 30,
    due_date DATE NOT NULL,
    invoice_status VARCHAR(20) DEFAULT 'draft' CHECK (invoice_status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overpaid', 'refunded')),
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    balance_due DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    billing_address TEXT,
    notes TEXT,
    internal_notes TEXT,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    sent_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Line Items Table
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_tariff_id UUID REFERENCES service_tariffs(id),
    description VARCHAR(500) NOT NULL,
    service_code VARCHAR(20),
    cpt_code VARCHAR(10),
    service_date DATE NOT NULL,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id),
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    preauthorization_id UUID REFERENCES pre_authorizations(id),
    diagnosis_codes JSONB, -- ICD codes for this service
    modifiers JSONB, -- CPT modifiers if applicable
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Payment Records Table (for tracking payments)
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'insurance_payment', 'online_payment')),
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_reference VARCHAR(100),
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_processor VARCHAR(100),
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (payment_amount - processing_fee) STORED,
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    payment_notes TEXT,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_date DATE,
    refund_reason TEXT,
    reconciliation_status VARCHAR(20) DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'matched', 'disputed', 'resolved')),
    bank_deposit_date DATE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Adjustments Table (for corrections and adjustments)
CREATE TABLE billing_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('discount', 'write_off', 'correction', 'insurance_adjustment', 'contractual_adjustment')),
    adjustment_amount DECIMAL(12, 2) NOT NULL,
    adjustment_date DATE NOT NULL,
    reason_code VARCHAR(20),
    description TEXT NOT NULL,
    approved_by UUID NOT NULL REFERENCES user_profiles(id),
    approval_date DATE NOT NULL,
    reversal_allowed BOOLEAN DEFAULT TRUE,
    reversed_by UUID REFERENCES user_profiles(id),
    reversal_date DATE,
    reversal_reason TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Billing & Insurance Tables
CREATE INDEX idx_insurance_companies_code ON insurance_companies(company_code);
CREATE INDEX idx_insurance_companies_active ON insurance_companies(is_active);
CREATE INDEX idx_insurance_companies_generating_code ON insurance_companies(generating_code);
CREATE INDEX idx_insurance_companies_applied_code ON insurance_companies(applied_code);

CREATE INDEX idx_cpt_codes_code ON cpt_codes(cpt_code);
CREATE INDEX idx_cpt_codes_category ON cpt_codes(category);
CREATE INDEX idx_cpt_codes_effective_date ON cpt_codes(effective_date, termination_date);
CREATE INDEX idx_cpt_codes_active ON cpt_codes(is_active);
CREATE INDEX idx_cpt_codes_generating_code ON cpt_codes(generating_code);
CREATE INDEX idx_cpt_codes_applied_code ON cpt_codes(applied_code);

CREATE INDEX idx_service_tariffs_service_code ON service_tariffs(service_code);
CREATE INDEX idx_service_tariffs_insurance_pricing ON service_tariffs(service_code, insurance_company_id);
CREATE INDEX idx_service_tariffs_effective_dates ON service_tariffs(effective_date, expiry_date);
CREATE INDEX idx_service_tariffs_level_care ON service_tariffs(level_of_care);
CREATE INDEX idx_service_tariffs_active ON service_tariffs(is_active);
CREATE INDEX idx_service_tariffs_generating_code ON service_tariffs(generating_code);
CREATE INDEX idx_service_tariffs_applied_code ON service_tariffs(applied_code);

CREATE INDEX idx_pre_authorizations_patient_id ON pre_authorizations(patient_id);
CREATE INDEX idx_pre_authorizations_insurance_id ON pre_authorizations(insurance_company_id);
CREATE INDEX idx_pre_authorizations_auth_number ON pre_authorizations(authorization_number);
CREATE INDEX idx_pre_authorizations_status_tracking ON pre_authorizations(authorization_status, expiry_date);
CREATE INDEX idx_pre_authorizations_request_date ON pre_authorizations(patient_id, request_date);
CREATE INDEX idx_pre_authorizations_generating_code ON pre_authorizations(generating_code);
CREATE INDEX idx_pre_authorizations_applied_code ON pre_authorizations(applied_code);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_patient_date ON invoices(patient_id, invoice_date);
CREATE INDEX idx_invoices_insurance_date ON invoices(insurance_company_id, invoice_date);
CREATE INDEX idx_invoices_status_due ON invoices(invoice_status, due_date);
CREATE INDEX idx_invoices_payment_tracking ON invoices(payment_status, balance_due);
CREATE INDEX idx_invoices_service_date ON invoices(service_date);
CREATE INDEX idx_invoices_generating_code ON invoices(generating_code);
CREATE INDEX idx_invoices_applied_code ON invoices(applied_code);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_service_billing ON invoice_line_items(service_code, service_date);
CREATE INDEX idx_invoice_line_items_provider_id ON invoice_line_items(provider_id);
CREATE INDEX idx_invoice_line_items_preauth_id ON invoice_line_items(preauthorization_id);
CREATE INDEX idx_invoice_line_items_generating_code ON invoice_line_items(generating_code);
CREATE INDEX idx_invoice_line_items_applied_code ON invoice_line_items(applied_code);

CREATE INDEX idx_payment_records_invoice_id ON payment_records(invoice_id);
CREATE INDEX idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX idx_payment_records_payment_method ON payment_records(payment_method);
CREATE INDEX idx_payment_records_status ON payment_records(payment_status);
CREATE INDEX idx_payment_records_reconciliation ON payment_records(reconciliation_status);
CREATE INDEX idx_payment_records_generating_code ON payment_records(generating_code);
CREATE INDEX idx_payment_records_applied_code ON payment_records(applied_code);

CREATE INDEX idx_billing_adjustments_invoice_id ON billing_adjustments(invoice_id);
CREATE INDEX idx_billing_adjustments_type ON billing_adjustments(adjustment_type);
CREATE INDEX idx_billing_adjustments_date ON billing_adjustments(adjustment_date);
CREATE INDEX idx_billing_adjustments_approved_by ON billing_adjustments(approved_by);
CREATE INDEX idx_billing_adjustments_generating_code ON billing_adjustments(generating_code);
CREATE INDEX idx_billing_adjustments_applied_code ON billing_adjustments(applied_code);

-- Enable RLS for Billing & Insurance Tables
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Billing & Insurance Tables
CREATE POLICY "All authenticated users can view insurance companies" ON insurance_companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage insurance companies" ON insurance_companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view CPT codes" ON cpt_codes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage CPT codes" ON cpt_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view service tariffs" ON service_tariffs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage service tariffs" ON service_tariffs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view pre-authorizations" ON pre_authorizations
    FOR SELECT USING (
        requested_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create pre-authorizations" ON pre_authorizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their pre-authorizations" ON pre_authorizations
    FOR UPDATE USING (
        requested_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view invoices" ON invoices
    FOR SELECT USING (
        created_by = auth.uid()
        OR approved_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create invoices" ON invoices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their invoices" ON invoices
    FOR UPDATE USING (
        created_by = auth.uid()
        OR approved_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view invoice line items" ON invoice_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND (invoices.created_by = auth.uid() OR invoices.approved_by = auth.uid())
        )
        OR provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create invoice line items" ON invoice_line_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can view payment records" ON payment_records
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payment_records.invoice_id 
            AND (invoices.created_by = auth.uid() OR invoices.approved_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create payment records" ON payment_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can view billing adjustments" ON billing_adjustments
    FOR SELECT USING (
        created_by = auth.uid()
        OR approved_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = billing_adjustments.invoice_id 
            AND (invoices.created_by = auth.uid() OR invoices.approved_by = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create billing adjustments" ON billing_adjustments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

-- Update triggers for Billing & Insurance Tables
CREATE TRIGGER update_insurance_companies_updated_at BEFORE UPDATE ON insurance_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cpt_codes_updated_at BEFORE UPDATE ON cpt_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_tariffs_updated_at BEFORE UPDATE ON service_tariffs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pre_authorizations_updated_at BEFORE UPDATE ON pre_authorizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_line_items_updated_at BEFORE UPDATE ON invoice_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_adjustments_updated_at BEFORE UPDATE ON billing_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Billing & Insurance Tables
CREATE TRIGGER audit_insurance_companies AFTER INSERT OR UPDATE OR DELETE ON insurance_companies FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_cpt_codes AFTER INSERT OR UPDATE OR DELETE ON cpt_codes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_service_tariffs AFTER INSERT OR UPDATE OR DELETE ON service_tariffs FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_pre_authorizations AFTER INSERT OR UPDATE OR DELETE ON pre_authorizations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_invoice_line_items AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_payment_records AFTER INSERT OR UPDATE OR DELETE ON payment_records FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_billing_adjustments AFTER INSERT OR UPDATE OR DELETE ON billing_adjustments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Payments & Financial Transactions
-- ================================================

-- Payment Methods Table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_name VARCHAR(50) UNIQUE NOT NULL,
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('cash', 'card', 'bank_transfer', 'cheque', 'online', 'insurance')),
    requires_reference BOOLEAN DEFAULT FALSE,
    processing_fee_percentage DECIMAL(5, 4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Enhanced Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(30) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_company_id UUID REFERENCES insurance_companies(id),
    payment_date DATE NOT NULL,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('full_payment', 'partial_payment', 'advance_payment', 'refund', 'adjustment')),
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    reference_number VARCHAR(100), -- Cheque number, transaction ID, etc.
    bank_name VARCHAR(200),
    processing_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (payment_amount - processing_fee) STORED,
    payment_status VARCHAR(20) DEFAULT 'cleared' CHECK (payment_status IN ('pending', 'cleared', 'bounced', 'cancelled', 'refunded')),
    clearance_date DATE,
    bounced_reason TEXT,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_date DATE,
    notes TEXT,
    received_by UUID NOT NULL REFERENCES healthcare_providers(id),
    approved_by UUID REFERENCES healthcare_providers(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    receipt_printed BOOLEAN DEFAULT FALSE,
    receipt_sent BOOLEAN DEFAULT FALSE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Quality Metrics & Reporting
-- ================================================

-- Quality Indicators Table
CREATE TABLE quality_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_name VARCHAR(200) UNIQUE NOT NULL,
    indicator_code VARCHAR(20) UNIQUE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('clinical', 'safety', 'efficiency', 'satisfaction', 'financial')),
    description TEXT,
    measurement_unit VARCHAR(50),
    target_value DECIMAL(10, 4),
    calculation_method TEXT,
    data_sources JSONB, -- Tables/fields used for calculation
    reporting_frequency VARCHAR(20) CHECK (reporting_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    is_jawda_indicator BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Quality Measurements Table
CREATE TABLE quality_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID NOT NULL REFERENCES quality_indicators(id) ON DELETE CASCADE,
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    measured_value DECIMAL(15, 6) NOT NULL,
    target_value DECIMAL(15, 6),
    variance_percentage DECIMAL(8, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN target_value > 0 THEN ((measured_value - target_value) / target_value) * 100 
            ELSE NULL 
        END
    ) STORED,
    numerator BIGINT, -- For ratio indicators
    denominator BIGINT, -- For ratio indicators
    sample_size BIGINT,
    confidence_interval VARCHAR(50),
    measurement_notes TEXT,
    data_quality_score SMALLINT CHECK (data_quality_score BETWEEN 1 AND 5), -- 1-5 rating of data completeness/accuracy
    calculated_by VARCHAR(100), -- System process or user
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES healthcare_providers(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    reported_to_doh BOOLEAN DEFAULT FALSE,
    doh_submission_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Financial Transactions Table (for comprehensive financial tracking)
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(30) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'transfer', 'fee', 'discount')),
    related_payment_id UUID REFERENCES payments(id),
    related_invoice_id UUID REFERENCES invoices(id),
    patient_id UUID REFERENCES patients(id),
    transaction_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    description TEXT NOT NULL,
    account_code VARCHAR(20), -- For accounting integration
    cost_center VARCHAR(50),
    department VARCHAR(100),
    transaction_status VARCHAR(20) DEFAULT 'completed' CHECK (transaction_status IN ('pending', 'completed', 'cancelled', 'reversed')),
    reversal_transaction_id UUID REFERENCES financial_transactions(id),
    reversal_reason TEXT,
    reconciliation_status VARCHAR(20) DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'reconciled', 'disputed')),
    reconciliation_date DATE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Payment & Financial Tables
CREATE INDEX idx_payment_methods_name ON payment_methods(method_name);
CREATE INDEX idx_payment_methods_type ON payment_methods(method_type);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX idx_payment_methods_generating_code ON payment_methods(generating_code);
CREATE INDEX idx_payment_methods_applied_code ON payment_methods(applied_code);

CREATE INDEX idx_payments_number ON payments(payment_number);
CREATE INDEX idx_payments_patient_date ON payments(patient_id, payment_date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status_clearance ON payments(payment_status, clearance_date);
CREATE INDEX idx_payments_method ON payments(payment_method_id);
CREATE INDEX idx_payments_insurance ON payments(insurance_company_id);
CREATE INDEX idx_payments_received_by ON payments(received_by);
CREATE INDEX idx_payments_generating_code ON payments(generating_code);
CREATE INDEX idx_payments_applied_code ON payments(applied_code);
CREATE INDEX idx_payments_type ON payments(payment_type);

CREATE INDEX idx_quality_indicators_name ON quality_indicators(indicator_name);
CREATE INDEX idx_quality_indicators_code ON quality_indicators(indicator_code);
CREATE INDEX idx_quality_indicators_category ON quality_indicators(category);
CREATE INDEX idx_quality_indicators_active ON quality_indicators(is_active);
CREATE INDEX idx_quality_indicators_jawda ON quality_indicators(is_jawda_indicator);
CREATE INDEX idx_quality_indicators_generating_code ON quality_indicators(generating_code);
CREATE INDEX idx_quality_indicators_applied_code ON quality_indicators(applied_code);

CREATE INDEX idx_quality_measurements_indicator_period ON quality_measurements(indicator_id, measurement_period_start);
CREATE INDEX idx_quality_measurements_reporting_period ON quality_measurements(measurement_period_end, reported_to_doh);
CREATE INDEX idx_quality_measurements_approved_by ON quality_measurements(approved_by);
CREATE INDEX idx_quality_measurements_generating_code ON quality_measurements(generating_code);
CREATE INDEX idx_quality_measurements_applied_code ON quality_measurements(applied_code);
CREATE INDEX idx_quality_measurements_calculation_date ON quality_measurements(calculation_date);

CREATE INDEX idx_financial_transactions_number ON financial_transactions(transaction_number);
CREATE INDEX idx_financial_transactions_type_date ON financial_transactions(transaction_type, transaction_date);
CREATE INDEX idx_financial_transactions_patient ON financial_transactions(patient_id);
CREATE INDEX idx_financial_transactions_payment ON financial_transactions(related_payment_id);
CREATE INDEX idx_financial_transactions_invoice ON financial_transactions(related_invoice_id);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(transaction_status);
CREATE INDEX idx_financial_transactions_reconciliation ON financial_transactions(reconciliation_status, reconciliation_date);
CREATE INDEX idx_financial_transactions_generating_code ON financial_transactions(generating_code);
CREATE INDEX idx_financial_transactions_applied_code ON financial_transactions(applied_code);
CREATE INDEX idx_financial_transactions_account_code ON financial_transactions(account_code);

-- Enable RLS for Payment & Financial Tables
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Payment & Financial Tables
CREATE POLICY "All authenticated users can view payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage payment methods" ON payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view payments" ON payments
    FOR SELECT USING (
        received_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create payments" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their payments" ON payments
    FOR UPDATE USING (
        received_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view quality indicators" ON quality_indicators
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage quality indicators" ON quality_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view quality measurements" ON quality_measurements
    FOR SELECT USING (
        approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create quality measurements" ON quality_measurements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their quality measurements" ON quality_measurements
    FOR UPDATE USING (
        approved_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view financial transactions" ON financial_transactions
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create financial transactions" ON financial_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their financial transactions" ON financial_transactions
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Update triggers for Payment & Financial Tables
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_indicators_updated_at BEFORE UPDATE ON quality_indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_measurements_updated_at BEFORE UPDATE ON quality_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Payment & Financial Tables
CREATE TRIGGER audit_payment_methods AFTER INSERT OR UPDATE OR DELETE ON payment_methods FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_quality_indicators AFTER INSERT OR UPDATE OR DELETE ON quality_indicators FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_quality_measurements AFTER INSERT OR UPDATE OR DELETE ON quality_measurements FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_financial_transactions AFTER INSERT OR UPDATE OR DELETE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Update triggers for Communication & Notifications Tables
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for Integration & Data Exchange Tables
CREATE TRIGGER update_integration_endpoints_updated_at BEFORE UPDATE ON integration_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_exchanges_updated_at BEFORE UPDATE ON data_exchanges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for Laboratory & Diagnostic Results Tables
CREATE TRIGGER update_lab_test_catalog_updated_at BEFORE UPDATE ON lab_test_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_orders_updated_at BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Communication & Notifications Tables
CREATE TRIGGER audit_notification_templates AFTER INSERT OR UPDATE OR DELETE ON notification_templates FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_notifications AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Audit triggers for Integration & Data Exchange Tables
CREATE TRIGGER audit_integration_endpoints AFTER INSERT OR UPDATE OR DELETE ON integration_endpoints FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_data_exchanges AFTER INSERT OR UPDATE OR DELETE ON data_exchanges FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Audit triggers for Laboratory & Diagnostic Results Tables
CREATE TRIGGER audit_lab_test_catalog AFTER INSERT OR UPDATE OR DELETE ON lab_test_catalog FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_lab_orders AFTER INSERT OR UPDATE OR DELETE ON lab_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_lab_results AFTER INSERT OR UPDATE OR DELETE ON lab_results FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Advanced Indexes for Performance Optimization
-- ================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_patient_active_homebound ON patients(is_active, created_at) WHERE is_active = TRUE;
CREATE INDEX idx_appointment_provider_date_status ON appointments(provider_id, appointment_date, appointment_status);
CREATE INDEX idx_medical_record_patient_date_type ON medical_records(patient_id, record_date, record_type);
CREATE INDEX idx_prescription_patient_status_date ON clinical_forms(patient_id, status, created_at) WHERE form_type LIKE '%prescription%';
CREATE INDEX idx_invoice_patient_status_date ON invoices(patient_id, invoice_status, invoice_date);
CREATE INDEX idx_payment_date_status_amount ON payments(payment_date, payment_status, payment_amount);
CREATE INDEX idx_quality_indicator_period ON quality_measurements(indicator_id, measurement_period_start);
CREATE INDEX idx_document_patient_category_date ON documents(patient_id, document_category_id, document_date);
CREATE INDEX idx_notification_recipient_scheduled ON notifications(recipient_type, recipient_id, scheduled_time);
CREATE INDEX idx_audit_user_table_created ON audit_logs(user_id, table_name, created_at);

-- Full-text search indexes for PostgreSQL
CREATE INDEX idx_patients_fulltext ON patients USING GIN (to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX idx_medical_records_fulltext ON medical_records USING GIN (to_tsvector('english', clinical_notes));
CREATE INDEX idx_documents_fulltext ON documents USING GIN (to_tsvector('english', document_title || ' ' || COALESCE(ocr_text, '')));

-- Performance optimization indexes
CREATE INDEX idx_episodes_active_clinician ON patient_episodes(assigned_clinician, status) WHERE status = 'active';
CREATE INDEX idx_clinical_forms_pending_review ON clinical_forms(status, created_at) WHERE status IN ('draft', 'completed');
CREATE INDEX idx_daman_claims_pending ON daman_claims(status, submission_date) WHERE status = 'pending';
CREATE INDEX idx_appointments_today ON appointments(appointment_date, appointment_status) WHERE appointment_date = CURRENT_DATE;
CREATE INDEX idx_equipment_maintenance_due ON equipment(next_maintenance_due) WHERE next_maintenance_due <= CURRENT_DATE + INTERVAL '30 days';
CREATE INDEX idx_inventory_low_stock ON inventory_stock(item_id, quantity_available) WHERE status = 'active';
CREATE INDEX idx_lab_orders_critical ON lab_orders(critical_results, order_status) WHERE critical_results = TRUE;
CREATE INDEX idx_incidents_open ON incidents(status, incident_date) WHERE status IN ('reported', 'under_investigation');

-- Views for Common Queries
-- ================================================

-- Active patient summary view
CREATE VIEW v_active_patients AS
SELECT 
    p.id,
    p.mrn,
    p.first_name || ' ' || p.last_name AS full_name,
    p.gender,
    p.date_of_birth,
    EXTRACT(YEAR FROM AGE(p.date_of_birth)) AS age,
    p.nationality,
    p.phone,
    p.email,
    COUNT(DISTINCT pe.id) AS total_episodes,
    COUNT(DISTINCT mr.id) AS total_medical_records,
    MAX(mr.record_date) AS last_medical_record_date,
    COUNT(DISTINCT a.id) AS total_appointments,
    MAX(a.appointment_date) AS last_appointment_date,
    p.created_at AS registration_date
FROM patients p
LEFT JOIN patient_episodes pe ON p.id = pe.patient_id
LEFT JOIN medical_records mr ON p.id = mr.patient_id
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.mrn, p.first_name, p.last_name, p.gender, p.date_of_birth, p.nationality, p.phone, p.email, p.created_at;

-- Provider schedule view
CREATE VIEW v_provider_schedules AS
SELECT 
    hp.id AS provider_id,
    hp.provider_name,
    hp.license_number,
    hp.specialty,
    hp.facility_name,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_date >= CURRENT_DATE - INTERVAL '30 days' THEN a.id END) AS appointments_last_30_days,
    COUNT(DISTINCT CASE WHEN a.appointment_status = 'completed' THEN a.id END) AS completed_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_status = 'cancelled' THEN a.id END) AS cancelled_appointments,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.appointment_status = 'completed' THEN a.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT a.id), 0)) * 100, 2
    ) AS completion_rate_percentage,
    hp.is_active
FROM healthcare_providers hp
LEFT JOIN appointments a ON hp.id = a.provider_id
WHERE hp.is_active = TRUE
GROUP BY hp.id, hp.provider_name, hp.license_number, hp.specialty, hp.facility_name, hp.is_active;

-- Patient care summary view
CREATE VIEW v_patient_care_summary AS
SELECT 
    p.id AS patient_id,
    p.mrn,
    p.first_name || ' ' || p.last_name AS patient_name,
    COUNT(DISTINCT pe.id) AS total_episodes,
    COUNT(DISTINCT mr.id) AS total_visits,
    COUNT(DISTINCT CASE WHEN mr.record_date >= CURRENT_DATE - INTERVAL '30 days' THEN mr.id END) AS visits_last_30_days,
    COUNT(DISTINCT cf.id) AS total_clinical_forms,
    COUNT(DISTINCT CASE WHEN cf.status = 'completed' THEN cf.id END) AS completed_forms,
    COUNT(DISTINCT hs.id) AS active_homecare_services,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_status = 'completed' THEN a.id END) AS completed_appointments,
    MAX(mr.record_date) AS last_visit_date,
    MIN(mr.record_date) AS first_visit_date,
    MAX(pe.start_date) AS latest_episode_start,
    COUNT(DISTINCT CASE WHEN pe.status = 'active' THEN pe.id END) AS active_episodes
FROM patients p
LEFT JOIN patient_episodes pe ON p.id = pe.patient_id
LEFT JOIN medical_records mr ON p.id = mr.patient_id
LEFT JOIN clinical_forms cf ON p.id = cf.patient_id
LEFT JOIN homecare_services hs ON mr.id = hs.medical_record_id AND hs.status = 'active'
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.mrn, p.first_name, p.last_name;

-- Financial dashboard view
CREATE VIEW v_financial_dashboard AS
SELECT 
    DATE(i.invoice_date) AS invoice_date,
    COUNT(i.id) AS total_invoices,
    SUM(i.total_amount) AS total_billed,
    SUM(i.amount_paid) AS total_collected,
    SUM(i.total_amount - i.amount_paid) AS total_outstanding,
    SUM(CASE WHEN i.payment_status = 'paid' THEN i.total_amount ELSE 0 END) AS paid_invoices_amount,
    SUM(CASE WHEN i.due_date < CURRENT_DATE AND (i.total_amount - i.amount_paid) > 0 THEN (i.total_amount - i.amount_paid) ELSE 0 END) AS overdue_amount,
    COUNT(CASE WHEN i.invoice_type = 'insurance' THEN 1 END) AS insurance_invoices,
    COUNT(CASE WHEN i.invoice_type = 'patient' THEN 1 END) AS patient_invoices,
    ROUND(
        (SUM(i.amount_paid) / NULLIF(SUM(i.total_amount), 0)) * 100, 2
    ) AS collection_rate_percentage
FROM invoices i
WHERE i.invoice_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE(i.invoice_date)
ORDER BY invoice_date DESC;

-- DOH Compliance Summary View
CREATE VIEW v_doh_compliance_summary AS
SELECT 
    DATE_TRUNC('month', dcr.created_at) AS compliance_month,
    dcr.compliance_type,
    COUNT(*) AS total_records,
    COUNT(CASE WHEN dcr.status = 'compliant' THEN 1 END) AS compliant_records,
    COUNT(CASE WHEN dcr.status = 'non_compliant' THEN 1 END) AS non_compliant_records,
    COUNT(CASE WHEN dcr.status = 'pending_review' THEN 1 END) AS pending_review_records,
    ROUND(
        (COUNT(CASE WHEN dcr.status = 'compliant' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) AS compliance_rate_percentage
FROM doh_compliance_records dcr
WHERE dcr.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', dcr.created_at), dcr.compliance_type
ORDER BY compliance_month DESC, dcr.compliance_type;

-- Equipment Utilization View
CREATE VIEW v_equipment_utilization AS
SELECT 
    ec.category_name,
    COUNT(e.id) AS total_equipment,
    COUNT(CASE WHEN e.status = 'available' THEN 1 END) AS available_equipment,
    COUNT(CASE WHEN e.status = 'in_use' THEN 1 END) AS in_use_equipment,
    COUNT(CASE WHEN e.status = 'maintenance' THEN 1 END) AS maintenance_equipment,
    COUNT(CASE WHEN e.status = 'repair' THEN 1 END) AS repair_equipment,
    ROUND(
        (COUNT(CASE WHEN e.status = 'in_use' THEN 1 END)::DECIMAL / COUNT(e.id)) * 100, 2
    ) AS utilization_rate_percentage,
    COUNT(CASE WHEN e.next_maintenance_due <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) AS maintenance_due_soon
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.id
WHERE e.condition != 'retired'
GROUP BY ec.id, ec.category_name
ORDER BY utilization_rate_percentage DESC;

-- Stored Procedures for Common Operations
-- ================================================

-- Function to calculate patient age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE) 
RETURNS INTEGER
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    age INTEGER;
BEGIN
    age := EXTRACT(YEAR FROM AGE(birth_date));
    RETURN age;
END;
$;

-- Function to get next available appointment slot
CREATE OR REPLACE FUNCTION get_next_available_slot(
    p_provider_id UUID,
    p_appointment_date DATE,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
    available_time TIME,
    slot_duration INTEGER
)
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    slot_time TIME;
    slot_start TIME := '08:00:00';
    slot_end TIME := '17:00:00';
    slot_interval INTERVAL := '30 minutes';
BEGIN
    -- Generate time slots and check availability
    FOR slot_time IN 
        SELECT generate_series(slot_start, slot_end - (p_duration_minutes || ' minutes')::INTERVAL, slot_interval)::TIME
    LOOP
        -- Check if slot is available
        IF NOT EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.provider_id = p_provider_id
            AND a.appointment_date = p_appointment_date
            AND a.appointment_time = slot_time
            AND a.appointment_status NOT IN ('cancelled', 'no_show')
        ) THEN
            available_time := slot_time;
            slot_duration := p_duration_minutes;
            RETURN NEXT;
            RETURN; -- Return first available slot
        END IF;
    END LOOP;
    
    RETURN;
END;
$;

-- Function to update patient homebound status
CREATE OR REPLACE FUNCTION update_homebound_status(
    p_patient_id UUID,
    p_certified_by UUID,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $
DECLARE
    patient_exists BOOLEAN;
BEGIN
    -- Check if patient exists
    SELECT EXISTS(SELECT 1 FROM patients WHERE id = p_patient_id AND is_active = TRUE) INTO patient_exists;
    
    IF NOT patient_exists THEN
        RAISE EXCEPTION 'Patient not found or inactive';
    END IF;
    
    -- Update patient record
    UPDATE patients 
    SET 
        updated_at = NOW()
    WHERE id = p_patient_id;
    
    -- Create audit log entry
    INSERT INTO audit_logs (user_id, table_name, record_id, action, new_values)
    VALUES (
        p_certified_by, 
        'patients', 
        p_patient_id, 
        'UPDATE',
        jsonb_build_object(
            'homebound_status', TRUE, 
            'certified_date', CURRENT_DATE, 
            'reason', p_reason,
            'generating_code', 'HOMEBOUND_UPDATE_' || p_patient_id::TEXT,
            'applied_code', 'APPLIED_HOMEBOUND_' || p_patient_id::TEXT
        )
    );
    
    RETURN TRUE;
END;
$;

-- Function to calculate care plan compliance
CREATE OR REPLACE FUNCTION calculate_care_plan_compliance(
    p_patient_id UUID,
    p_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    care_plan_id UUID,
    plan_name VARCHAR(200),
    total_goals BIGINT,
    achieved_goals BIGINT,
    in_progress_goals BIGINT,
    not_started_goals BIGINT,
    compliance_percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
READS SQL DATA
AS $
BEGIN
    RETURN QUERY
    SELECT 
        cp.id AS care_plan_id,
        cp.plan_name,
        COUNT(cpg.id) AS total_goals,
        COUNT(CASE WHEN cpg.current_status = 'achieved' THEN 1 END) AS achieved_goals,
        COUNT(CASE WHEN cpg.current_status = 'in_progress' THEN 1 END) AS in_progress_goals,
        COUNT(CASE WHEN cpg.current_status = 'not_started' THEN 1 END) AS not_started_goals,
        ROUND(
            (COUNT(CASE WHEN cpg.current_status = 'achieved' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(cpg.id), 0)) * 100, 2
        ) AS compliance_percentage
    FROM care_plans cp
    LEFT JOIN care_plan_goals cpg ON cp.id = cpg.care_plan_id
    WHERE cp.patient_id = p_patient_id
    AND cp.effective_date >= p_period_start
    AND cp.effective_date <= p_period_end
    AND cp.status = 'active'
    GROUP BY cp.id, cp.plan_name;
END;
$;

-- Function to generate comprehensive patient report
CREATE OR REPLACE FUNCTION generate_patient_report(
    p_patient_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '90 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    patient_info JSONB;
    episodes_info JSONB;
    appointments_info JSONB;
    clinical_forms_info JSONB;
    compliance_info JSONB;
    result JSONB;
BEGIN
    -- Get patient basic information
    SELECT jsonb_build_object(
        'patient_id', p.id,
        'mrn', p.mrn,
        'name', p.first_name || ' ' || p.last_name,
        'date_of_birth', p.date_of_birth,
        'age', calculate_age(p.date_of_birth),
        'gender', p.gender,
        'nationality', p.nationality,
        'phone', p.phone,
        'email', p.email,
        'registration_date', p.created_at
    ) INTO patient_info
    FROM patients p
    WHERE p.id = p_patient_id;
    
    -- Get episodes information
    SELECT jsonb_agg(
        jsonb_build_object(
            'episode_id', pe.id,
            'episode_number', pe.episode_number,
            'start_date', pe.start_date,
            'end_date', pe.end_date,
            'status', pe.status,
            'assigned_clinician', hp.provider_name
        )
    ) INTO episodes_info
    FROM patient_episodes pe
    LEFT JOIN healthcare_providers hp ON pe.assigned_clinician = hp.id
    WHERE pe.patient_id = p_patient_id
    AND pe.start_date >= p_start_date;
    
    -- Get appointments information
    SELECT jsonb_agg(
        jsonb_build_object(
            'appointment_id', a.id,
            'appointment_date', a.appointment_date,
            'appointment_time', a.appointment_time,
            'status', a.appointment_status,
            'provider', hp.provider_name,
            'location_type', a.location_type
        )
    ) INTO appointments_info
    FROM appointments a
    LEFT JOIN healthcare_providers hp ON a.provider_id = hp.id
    WHERE a.patient_id = p_patient_id
    AND a.appointment_date >= p_start_date;
    
    -- Get clinical forms information
    SELECT jsonb_agg(
        jsonb_build_object(
            'form_id', cf.id,
            'form_type', cf.form_type,
            'status', cf.status,
            'created_date', cf.created_at,
            'clinician', hp.provider_name
        )
    ) INTO clinical_forms_info
    FROM clinical_forms cf
    LEFT JOIN healthcare_providers hp ON cf.clinician_id = hp.id
    WHERE cf.patient_id = p_patient_id
    AND cf.created_at >= p_start_date;
    
    -- Get compliance information
    SELECT jsonb_agg(
        jsonb_build_object(
            'compliance_type', dcr.compliance_type,
            'status', dcr.status,
            'review_date', dcr.review_date,
            'reviewed_by', hp.provider_name
        )
    ) INTO compliance_info
    FROM doh_compliance_records dcr
    LEFT JOIN healthcare_providers hp ON dcr.reviewed_by = hp.id
    WHERE dcr.patient_id = p_patient_id
    AND dcr.created_at >= p_start_date;
    
    -- Build final result
    result := jsonb_build_object(
        'report_generated_at', NOW(),
        'report_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'patient_information', patient_info,
        'episodes', COALESCE(episodes_info, '[]'::jsonb),
        'appointments', COALESCE(appointments_info, '[]'::jsonb),
        'clinical_forms', COALESCE(clinical_forms_info, '[]'::jsonb),
        'compliance_records', COALESCE(compliance_info, '[]'::jsonb),
        'generating_code', 'PATIENT_REPORT_' || p_patient_id::TEXT || '_' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'applied_code', 'APPLIED_PATIENT_REPORT_' || p_patient_id::TEXT
    );
    
    RETURN result;
END;
$;

-- Function to calculate provider performance metrics
CREATE OR REPLACE FUNCTION calculate_provider_performance(
    p_provider_id UUID,
    p_period_start DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_period_end DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
READS SQL DATA
AS $
DECLARE
    provider_info RECORD;
    performance_metrics JSONB;
BEGIN
    -- Get provider information
    SELECT * INTO provider_info
    FROM healthcare_providers
    WHERE id = p_provider_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Provider not found';
    END IF;
    
    -- Calculate performance metrics
    SELECT jsonb_build_object(
        'provider_id', p_provider_id,
        'provider_name', provider_info.provider_name,
        'period', jsonb_build_object(
            'start_date', p_period_start,
            'end_date', p_period_end
        ),
        'appointment_metrics', jsonb_build_object(
            'total_appointments', COUNT(a.id),
            'completed_appointments', COUNT(CASE WHEN a.appointment_status = 'completed' THEN 1 END),
            'cancelled_appointments', COUNT(CASE WHEN a.appointment_status = 'cancelled' THEN 1 END),
            'no_show_appointments', COUNT(CASE WHEN a.appointment_status = 'no_show' THEN 1 END),
            'completion_rate', ROUND(
                (COUNT(CASE WHEN a.appointment_status = 'completed' THEN 1 END)::DECIMAL / 
                 NULLIF(COUNT(a.id), 0)) * 100, 2
            )
        ),
        'patient_metrics', jsonb_build_object(
            'unique_patients_served', COUNT(DISTINCT a.patient_id),
            'average_satisfaction_score', ROUND(AVG(a.patient_satisfaction_score), 2)
        ),
        'clinical_metrics', jsonb_build_object(
            'clinical_forms_completed', (
                SELECT COUNT(*) FROM clinical_forms cf 
                WHERE cf.clinician_id = p_provider_id 
                AND cf.created_at BETWEEN p_period_start AND p_period_end
                AND cf.status = 'completed'
            ),
            'compliance_rate', (
                SELECT ROUND(
                    (COUNT(CASE WHEN dcr.status = 'compliant' THEN 1 END)::DECIMAL / 
                     NULLIF(COUNT(dcr.id), 0)) * 100, 2
                )
                FROM doh_compliance_records dcr
                WHERE dcr.reviewed_by = p_provider_id
                AND dcr.created_at BETWEEN p_period_start AND p_period_end
            )
        ),
        'generating_code', 'PROVIDER_PERFORMANCE_' || p_provider_id::TEXT,
        'applied_code', 'APPLIED_PROVIDER_PERF_' || p_provider_id::TEXT,
        'calculated_at', NOW()
    ) INTO performance_metrics
    FROM appointments a
    WHERE a.provider_id = p_provider_id
    AND a.appointment_date BETWEEN p_period_start AND p_period_end;
    
    RETURN performance_metrics;
END;
$;

-- Equipment & Inventory Management
-- ================================================

CREATE TABLE equipment_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    requires_calibration BOOLEAN DEFAULT FALSE,
    calibration_frequency_days INTEGER,
    requires_maintenance BOOLEAN DEFAULT TRUE,
    maintenance_frequency_days INTEGER,
    safety_classification VARCHAR(20) DEFAULT 'medium' CHECK (safety_classification IN ('low', 'medium', 'high')),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_number VARCHAR(30) UNIQUE NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES equipment_categories(id),
    manufacturer VARCHAR(200),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(12, 2),
    warranty_expiry DATE,
    location VARCHAR(200),
    assigned_to UUID REFERENCES healthcare_providers(id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'repair', 'retired')),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    last_calibration_date DATE,
    next_calibration_due DATE,
    usage_hours INTEGER DEFAULT 0,
    maintenance_cost_ytd DECIMAL(10, 2) DEFAULT 0.00,
    specifications JSONB,
    operating_instructions TEXT,
    safety_protocols TEXT,
    service_contacts JSONB,
    insurance_value DECIMAL(12, 2),
    depreciation_rate DECIMAL(5, 4),
    current_value DECIMAL(12, 2),
    is_critical BOOLEAN DEFAULT FALSE,
    backup_equipment_id UUID REFERENCES equipment(id),
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'calibration', 'inspection')),
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    performed_by VARCHAR(200),
    service_company VARCHAR(200),
    work_description TEXT NOT NULL,
    parts_replaced JSONB,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    downtime_hours DECIMAL(6, 2) DEFAULT 0.00,
    maintenance_status VARCHAR(20) DEFAULT 'scheduled' CHECK (maintenance_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    quality_check_passed BOOLEAN DEFAULT TRUE,
    next_maintenance_date DATE,
    warranty_work BOOLEAN DEFAULT FALSE,
    documentation_url VARCHAR(1000),
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID REFERENCES healthcare_providers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supply Chain & Inventory
-- ================================================

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(200) UNIQUE NOT NULL,
    supplier_code VARCHAR(20) UNIQUE,
    contact_person VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(500),
    tax_registration VARCHAR(100),
    trade_license VARCHAR(100),
    payment_terms_days INTEGER DEFAULT 30,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_time_days INTEGER DEFAULT 7,
    quality_rating DECIMAL(3, 2) DEFAULT 5.00,
    performance_score DECIMAL(5, 2) DEFAULT 100.00,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_date DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    requires_expiry_tracking BOOLEAN DEFAULT FALSE,
    requires_lot_tracking BOOLEAN DEFAULT FALSE,
    requires_serial_tracking BOOLEAN DEFAULT FALSE,
    storage_requirements TEXT,
    handling_instructions TEXT,
    safety_category VARCHAR(20) DEFAULT 'general' CHECK (safety_category IN ('general', 'hazardous', 'controlled')),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(30) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES inventory_categories(id),
    description TEXT,
    manufacturer VARCHAR(200),
    brand VARCHAR(100),
    model_number VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    standard_cost DECIMAL(10, 4) NOT NULL,
    selling_price DECIMAL(10, 4),
    reorder_level INTEGER DEFAULT 10,
    maximum_stock_level INTEGER DEFAULT 100,
    minimum_stock_level INTEGER DEFAULT 5,
    lead_time_days INTEGER DEFAULT 7,
    shelf_life_days INTEGER,
    storage_location VARCHAR(100),
    storage_temperature_min DECIMAL(5, 2),
    storage_temperature_max DECIMAL(5, 2),
    is_controlled_substance BOOLEAN DEFAULT FALSE,
    requires_prescription BOOLEAN DEFAULT FALSE,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
    weight_kg DECIMAL(8, 4),
    dimensions VARCHAR(100),
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_item_code VARCHAR(100),
    barcode VARCHAR(200),
    image_url VARCHAR(1000),
    safety_data_sheet_url VARCHAR(1000),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE inventory_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location VARCHAR(100) NOT NULL,
    lot_number VARCHAR(100),
    expiry_date DATE,
    quantity_on_hand DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    quantity_reserved DECIMAL(12, 4) DEFAULT 0.0000,
    quantity_available DECIMAL(12, 4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    unit_cost DECIMAL(10, 4) NOT NULL,
    total_value DECIMAL(15, 4) GENERATED ALWAYS AS (quantity_on_hand * unit_cost) STORED,
    last_movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_count_date DATE,
    variance_quantity DECIMAL(12, 4) DEFAULT 0.0000,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'damaged', 'recalled', 'quarantine')),
    notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for Equipment & Inventory Management Tables
CREATE INDEX idx_equipment_categories_name ON equipment_categories(category_name);
CREATE INDEX idx_equipment_categories_active ON equipment_categories(is_active);
CREATE INDEX idx_equipment_categories_generating_code ON equipment_categories(generating_code);
CREATE INDEX idx_equipment_categories_applied_code ON equipment_categories(applied_code);
CREATE INDEX idx_equipment_categories_compliance ON equipment_categories(compliance_status);

CREATE INDEX idx_equipment_number ON equipment(equipment_number);
CREATE INDEX idx_equipment_status ON equipment(status, location);
CREATE INDEX idx_equipment_maintenance_schedule ON equipment(next_maintenance_due);
CREATE INDEX idx_equipment_assigned_equipment ON equipment(assigned_to);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_generating_code ON equipment(generating_code);
CREATE INDEX idx_equipment_applied_code ON equipment(applied_code);
CREATE INDEX idx_equipment_compliance ON equipment(compliance_status);
CREATE INDEX idx_equipment_calibration_schedule ON equipment(next_calibration_due);
CREATE INDEX idx_equipment_warranty ON equipment(warranty_expiry);

CREATE INDEX idx_equipment_maintenance_equipment_id ON equipment_maintenance(equipment_id, scheduled_date);
CREATE INDEX idx_equipment_maintenance_schedule ON equipment_maintenance(scheduled_date, maintenance_status);
CREATE INDEX idx_equipment_maintenance_type ON equipment_maintenance(maintenance_type);
CREATE INDEX idx_equipment_maintenance_generating_code ON equipment_maintenance(generating_code);
CREATE INDEX idx_equipment_maintenance_applied_code ON equipment_maintenance(applied_code);
CREATE INDEX idx_equipment_maintenance_compliance ON equipment_maintenance(compliance_status);

CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_status ON suppliers(is_active, is_approved);
CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX idx_suppliers_generating_code ON suppliers(generating_code);
CREATE INDEX idx_suppliers_applied_code ON suppliers(applied_code);
CREATE INDEX idx_suppliers_compliance ON suppliers(compliance_status);

CREATE INDEX idx_inventory_categories_name ON inventory_categories(category_name);
CREATE INDEX idx_inventory_categories_active ON inventory_categories(is_active);
CREATE INDEX idx_inventory_categories_generating_code ON inventory_categories(generating_code);
CREATE INDEX idx_inventory_categories_applied_code ON inventory_categories(applied_code);
CREATE INDEX idx_inventory_categories_compliance ON inventory_categories(compliance_status);

CREATE INDEX idx_inventory_items_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_items_name ON inventory_items(item_name);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_reorder_tracking ON inventory_items(reorder_level, minimum_stock_level);
CREATE INDEX idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_generating_code ON inventory_items(generating_code);
CREATE INDEX idx_inventory_items_applied_code ON inventory_items(applied_code);
CREATE INDEX idx_inventory_items_compliance ON inventory_items(compliance_status);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);

CREATE INDEX idx_inventory_stock_item_location ON inventory_stock(item_id, location);
CREATE INDEX idx_inventory_stock_expiry_tracking ON inventory_stock(expiry_date, status);
CREATE INDEX idx_inventory_stock_lot_tracking ON inventory_stock(lot_number);
CREATE INDEX idx_inventory_stock_status ON inventory_stock(status);
CREATE INDEX idx_inventory_stock_generating_code ON inventory_stock(generating_code);
CREATE INDEX idx_inventory_stock_applied_code ON inventory_stock(applied_code);
CREATE INDEX idx_inventory_stock_compliance ON inventory_stock(compliance_status);
CREATE INDEX idx_inventory_stock_movement_date ON inventory_stock(last_movement_date);

-- Enable RLS for Equipment & Inventory Management Tables
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Equipment & Inventory Management Tables
CREATE POLICY "All authenticated users can view equipment categories" ON equipment_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage equipment categories" ON equipment_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view equipment" ON equipment
    FOR SELECT USING (
        assigned_to IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create equipment" ON equipment
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can update equipment" ON equipment
    FOR UPDATE USING (
        assigned_to IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view equipment maintenance" ON equipment_maintenance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipment 
            WHERE equipment.id = equipment_maintenance.equipment_id 
            AND (equipment.assigned_to IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR equipment.created_by = auth.uid())
        )
        OR created_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create equipment maintenance" ON equipment_maintenance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "All authenticated users can view suppliers" ON suppliers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage suppliers" ON suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "All authenticated users can view inventory categories" ON inventory_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage inventory categories" ON inventory_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view inventory items" ON inventory_items
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create inventory items" ON inventory_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update inventory items" ON inventory_items
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view inventory stock" ON inventory_stock
    FOR SELECT USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can create inventory stock" ON inventory_stock
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update inventory stock" ON inventory_stock
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'nurse')
        )
    );

-- Update triggers for Equipment & Inventory Management Tables
CREATE TRIGGER update_equipment_categories_updated_at BEFORE UPDATE ON equipment_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_maintenance_updated_at BEFORE UPDATE ON equipment_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON inventory_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Equipment & Inventory Management Tables
CREATE TRIGGER audit_equipment_categories AFTER INSERT OR UPDATE OR DELETE ON equipment_categories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_equipment AFTER INSERT OR UPDATE OR DELETE ON equipment FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_equipment_maintenance AFTER INSERT OR UPDATE OR DELETE ON equipment_maintenance FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON suppliers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory_categories AFTER INSERT OR UPDATE OR DELETE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory_items AFTER INSERT OR UPDATE OR DELETE ON inventory_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_inventory_stock AFTER INSERT OR UPDATE OR DELETE ON inventory_stock FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Functions for Equipment & Inventory Management
-- ================================================

-- Function to auto-generate equipment numbers
CREATE OR REPLACE FUNCTION generate_equipment_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_equipment_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(equipment_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM equipment
    WHERE equipment_number LIKE 'EQP-' || year_suffix || '-%';
    
    -- Generate new equipment number: EQP-YY-NNNNNN
    new_equipment_number := 'EQP-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.equipment_number := new_equipment_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate equipment numbers
CREATE TRIGGER generate_equipment_number_trigger
    BEFORE INSERT ON equipment
    FOR EACH ROW
    WHEN (NEW.equipment_number IS NULL OR NEW.equipment_number = '')
    EXECUTE FUNCTION generate_equipment_number();

-- Function to auto-generate supplier codes
CREATE OR REPLACE FUNCTION generate_supplier_code()
RETURNS TRIGGER AS $
DECLARE
    sequence_num INTEGER;
    new_supplier_code VARCHAR(20);
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(RIGHT(supplier_code, 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM suppliers
    WHERE supplier_code LIKE 'SUP-%';
    
    -- Generate new supplier code: SUP-NNNN
    new_supplier_code := 'SUP-' || LPAD(sequence_num::TEXT, 4, '0');
    
    NEW.supplier_code := new_supplier_code;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate supplier codes
CREATE TRIGGER generate_supplier_code_trigger
    BEFORE INSERT ON suppliers
    FOR EACH ROW
    WHEN (NEW.supplier_code IS NULL OR NEW.supplier_code = '')
    EXECUTE FUNCTION generate_supplier_code();

-- Function to auto-generate inventory item codes
CREATE OR REPLACE FUNCTION generate_item_code()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_item_code VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(item_code, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM inventory_items
    WHERE item_code LIKE 'ITM-' || year_suffix || '-%';
    
    -- Generate new item code: ITM-YY-NNNNNN
    new_item_code := 'ITM-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.item_code := new_item_code;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate inventory item codes
CREATE TRIGGER generate_item_code_trigger
    BEFORE INSERT ON inventory_items
    FOR EACH ROW
    WHEN (NEW.item_code IS NULL OR NEW.item_code = '')
    EXECUTE FUNCTION generate_item_code();

-- Function to update equipment maintenance schedules
CREATE OR REPLACE FUNCTION update_equipment_maintenance_schedule()
RETURNS TRIGGER AS $
BEGIN
    -- Update equipment maintenance dates when maintenance is completed
    IF NEW.maintenance_status = 'completed' AND OLD.maintenance_status != 'completed' THEN
        UPDATE equipment 
        SET 
            last_maintenance_date = COALESCE(NEW.actual_date, NEW.scheduled_date),
            next_maintenance_due = CASE 
                WHEN NEW.next_maintenance_date IS NOT NULL THEN NEW.next_maintenance_date
                ELSE COALESCE(NEW.actual_date, NEW.scheduled_date) + INTERVAL '1 day' * (
                    SELECT COALESCE(maintenance_frequency_days, 365) 
                    FROM equipment_categories 
                    WHERE id = (SELECT category_id FROM equipment WHERE id = NEW.equipment_id)
                )
            END,
            maintenance_cost_ytd = maintenance_cost_ytd + NEW.cost
        WHERE id = NEW.equipment_id;
        
        -- Update calibration dates if this was a calibration
        IF NEW.maintenance_type = 'calibration' THEN
            UPDATE equipment 
            SET 
                last_calibration_date = COALESCE(NEW.actual_date, NEW.scheduled_date),
                next_calibration_due = CASE 
                    WHEN NEW.next_maintenance_date IS NOT NULL THEN NEW.next_maintenance_date
                    ELSE COALESCE(NEW.actual_date, NEW.scheduled_date) + INTERVAL '1 day' * (
                        SELECT COALESCE(calibration_frequency_days, 365) 
                        FROM equipment_categories 
                        WHERE id = (SELECT category_id FROM equipment WHERE id = NEW.equipment_id)
                    )
                END
            WHERE id = NEW.equipment_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to update equipment maintenance schedules
CREATE TRIGGER update_equipment_maintenance_schedule_trigger
    AFTER UPDATE ON equipment_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_maintenance_schedule();

-- Function to check inventory reorder levels
CREATE OR REPLACE FUNCTION check_inventory_reorder_levels()
RETURNS TRIGGER AS $
DECLARE
    item_record RECORD;
    total_available DECIMAL(12, 4);
BEGIN
    -- Get item information
    SELECT * INTO item_record FROM inventory_items WHERE id = NEW.item_id;
    
    -- Calculate total available quantity for this item across all locations
    SELECT COALESCE(SUM(quantity_available), 0) INTO total_available
    FROM inventory_stock 
    WHERE item_id = NEW.item_id AND status = 'active';
    
    -- Check if reorder is needed
    IF total_available <= item_record.reorder_level THEN
        -- Create notification for low stock
        INSERT INTO notifications (
            notification_type,
            recipient_type,
            recipient_id,
            subject,
            message,
            priority,
            generating_code,
            applied_code,
            created_by
        ) VALUES (
            'system',
            'admin',
            (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1),
            'Low Stock Alert: ' || item_record.item_name,
            'Item: ' || item_record.item_name || ' (' || item_record.item_code || ')\nCurrent Stock: ' || total_available || ' ' || item_record.unit_of_measure || '\nReorder Level: ' || item_record.reorder_level || ' ' || item_record.unit_of_measure || '\n\nReorder required.',
            'high',
            'LOW_STOCK_ALERT_' || NEW.item_id::TEXT,
            'APPLIED_LOW_STOCK_' || NEW.item_id::TEXT,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to check inventory reorder levels
CREATE TRIGGER check_inventory_reorder_levels_trigger
    AFTER INSERT OR UPDATE ON inventory_stock
    FOR EACH ROW
    EXECUTE FUNCTION check_inventory_reorder_levels();

-- Insert default equipment categories
INSERT INTO equipment_categories (category_name, description, requires_calibration, calibration_frequency_days, requires_maintenance, maintenance_frequency_days, safety_classification, generating_code, applied_code, created_by) VALUES
('Medical Devices', 'General medical equipment and devices', TRUE, 365, TRUE, 180, 'high', 'EC_MEDICAL_DEVICES_001', 'APPLIED_MEDICAL_DEVICES_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Monitoring Equipment', 'Patient monitoring and diagnostic equipment', TRUE, 180, TRUE, 90, 'high', 'EC_MONITORING_EQUIP_002', 'APPLIED_MONITORING_EQUIP_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Mobility Aids', 'Wheelchairs, walkers, and mobility assistance', FALSE, NULL, TRUE, 90, 'medium', 'EC_MOBILITY_AIDS_003', 'APPLIED_MOBILITY_AIDS_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Respiratory Equipment', 'Oxygen concentrators, CPAP, ventilators', TRUE, 90, TRUE, 30, 'high', 'EC_RESPIRATORY_EQUIP_004', 'APPLIED_RESPIRATORY_EQUIP_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Infusion Pumps', 'IV pumps and infusion devices', TRUE, 180, TRUE, 60, 'high', 'EC_INFUSION_PUMPS_005', 'APPLIED_INFUSION_PUMPS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Wound Care Equipment', 'Wound vacs, dressing supplies, specialized beds', FALSE, NULL, TRUE, 180, 'medium', 'EC_WOUND_CARE_006', 'APPLIED_WOUND_CARE_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Communication Devices', 'Tablets, phones, emergency call systems', FALSE, NULL, TRUE, 365, 'low', 'EC_COMMUNICATION_007', 'APPLIED_COMMUNICATION_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Safety Equipment', 'Fall prevention, bed rails, safety alarms', FALSE, NULL, TRUE, 180, 'high', 'EC_SAFETY_EQUIPMENT_008', 'APPLIED_SAFETY_EQUIPMENT_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default inventory categories
INSERT INTO inventory_categories (category_name, description, requires_expiry_tracking, requires_lot_tracking, requires_serial_tracking, storage_requirements, safety_category, generating_code, applied_code, created_by) VALUES
('Medications', 'Prescription and over-the-counter medications', TRUE, TRUE, FALSE, 'Store in cool, dry place. Temperature controlled.', 'controlled', 'IC_MEDICATIONS_001', 'APPLIED_MEDICATIONS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medical Supplies', 'Disposable medical supplies and consumables', TRUE, TRUE, FALSE, 'Store in clean, dry environment', 'general', 'IC_MEDICAL_SUPPLIES_002', 'APPLIED_MEDICAL_SUPPLIES_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Wound Care Supplies', 'Dressings, bandages, wound care products', TRUE, TRUE, FALSE, 'Store in sterile environment', 'general', 'IC_WOUND_CARE_003', 'APPLIED_WOUND_CARE_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Nutritional Products', 'Enteral feeds, supplements, nutritional products', TRUE, TRUE, FALSE, 'Temperature controlled storage required', 'general', 'IC_NUTRITIONAL_004', 'APPLIED_NUTRITIONAL_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Personal Care Items', 'Hygiene products, personal care supplies', TRUE, FALSE, FALSE, 'Store in dry environment', 'general', 'IC_PERSONAL_CARE_005', 'APPLIED_PERSONAL_CARE_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Diagnostic Supplies', 'Test strips, collection containers, diagnostic kits', TRUE, TRUE, FALSE, 'Temperature and humidity controlled', 'general', 'IC_DIAGNOSTIC_006', 'APPLIED_DIAGNOSTIC_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Safety Supplies', 'PPE, infection control, safety equipment', TRUE, FALSE, FALSE, 'Store in clean, accessible location', 'general', 'IC_SAFETY_SUPPLIES_007', 'APPLIED_SAFETY_SUPPLIES_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Office Supplies', 'Administrative and documentation supplies', FALSE, FALSE, FALSE, 'Standard office storage', 'general', 'IC_OFFICE_SUPPLIES_008', 'APPLIED_OFFICE_SUPPLIES_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default suppliers
INSERT INTO suppliers (supplier_name, contact_person, email, phone, address, payment_terms_days, delivery_time_days, quality_rating, is_approved, generating_code, applied_code, created_by) VALUES
('Gulf Medical Supplies LLC', 'Ahmed Al-Rashid', 'ahmed@gulfmedical.ae', '+971-4-123-4567', 'Dubai Healthcare City, Dubai, UAE', 30, 2, 4.8, TRUE, 'SUP_GULF_MEDICAL_001', 'APPLIED_GULF_MEDICAL_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Emirates Healthcare Equipment', 'Fatima Al-Zahra', 'fatima@emirateshealthcare.ae', '+971-2-234-5678', 'Abu Dhabi Medical District, Abu Dhabi, UAE', 45, 3, 4.6, TRUE, 'SUP_EMIRATES_HEALTH_002', 'APPLIED_EMIRATES_HEALTH_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Al-Seha Medical Trading', 'Mohammed bin Rashid', 'mohammed@alsehamedical.ae', '+971-6-345-6789', 'Sharjah Medical City, Sharjah, UAE', 30, 1, 4.9, TRUE, 'SUP_AL_SEHA_003', 'APPLIED_AL_SEHA_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Pharma Plus Distribution', 'Aisha Al-Mansouri', 'aisha@pharmaplus.ae', '+971-3-456-7890', 'Al Ain Medical District, Al Ain, UAE', 60, 5, 4.5, TRUE, 'SUP_PHARMA_PLUS_004', 'APPLIED_PHARMA_PLUS_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Advanced Medical Technologies', 'Omar Al-Maktoum', 'omar@advmedtech.ae', '+971-4-567-8901', 'Dubai Investment Park, Dubai, UAE', 30, 7, 4.7, TRUE, 'SUP_ADV_MED_TECH_005', 'APPLIED_ADV_MED_TECH_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Function to validate equipment assignment
CREATE OR REPLACE FUNCTION validate_equipment_assignment()
RETURNS TRIGGER AS $
BEGIN
    -- Ensure equipment is available before assignment
    IF NEW.assigned_to IS NOT NULL AND NEW.status != 'in_use' THEN
        NEW.status := 'in_use';
    ELSIF NEW.assigned_to IS NULL AND OLD.assigned_to IS NOT NULL THEN
        NEW.status := 'available';
    END IF;
    
    -- Prevent assignment of equipment under maintenance or repair
    IF NEW.assigned_to IS NOT NULL AND NEW.status IN ('maintenance', 'repair') THEN
        RAISE EXCEPTION 'Cannot assign equipment that is under maintenance or repair';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate equipment assignment
CREATE TRIGGER validate_equipment_assignment_trigger
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION validate_equipment_assignment();

-- Function to validate inventory stock movements
CREATE OR REPLACE FUNCTION validate_inventory_stock_movement()
RETURNS TRIGGER AS $
BEGIN
    -- Prevent negative stock
    IF NEW.quantity_on_hand < 0 THEN
        RAISE EXCEPTION 'Inventory quantity cannot be negative for item %', 
            (SELECT item_name FROM inventory_items WHERE id = NEW.item_id);
    END IF;
    
    -- Prevent reserved quantity from exceeding on-hand quantity
    IF NEW.quantity_reserved > NEW.quantity_on_hand THEN
        RAISE EXCEPTION 'Reserved quantity cannot exceed on-hand quantity for item %', 
            (SELECT item_name FROM inventory_items WHERE id = NEW.item_id);
    END IF;
    
    -- Update last movement date when quantities change
    IF TG_OP = 'UPDATE' AND (OLD.quantity_on_hand != NEW.quantity_on_hand OR OLD.quantity_reserved != NEW.quantity_reserved) THEN
        NEW.last_movement_date := NOW();
    END IF;
    
    -- Check expiry dates
    IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate inventory stock movements
CREATE TRIGGER validate_inventory_stock_movement_trigger
    BEFORE INSERT OR UPDATE ON inventory_stock
    FOR EACH ROW
    EXECUTE FUNCTION validate_inventory_stock_movement();

-- Insert default payment methods
INSERT INTO payment_methods (method_name, method_type, requires_reference, processing_fee_percentage, generating_code, applied_code, created_by) VALUES
('Cash', 'cash', FALSE, 0.0000, 'CASH_PAYMENT_METHOD_001', 'APPLIED_CASH_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Credit Card', 'card', TRUE, 2.5000, 'CARD_PAYMENT_METHOD_002', 'APPLIED_CARD_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Debit Card', 'card', TRUE, 1.5000, 'CARD_PAYMENT_METHOD_003', 'APPLIED_CARD_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Bank Transfer', 'bank_transfer', TRUE, 0.5000, 'BANK_PAYMENT_METHOD_004', 'APPLIED_BANK_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Cheque', 'cheque', TRUE, 0.0000, 'CHEQUE_PAYMENT_METHOD_005', 'APPLIED_CHEQUE_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Online Payment', 'online', TRUE, 2.0000, 'ONLINE_PAYMENT_METHOD_006', 'APPLIED_ONLINE_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Insurance Payment', 'insurance', TRUE, 0.0000, 'INSURANCE_PAYMENT_METHOD_007', 'APPLIED_INSURANCE_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default quality indicators
INSERT INTO quality_indicators (indicator_name, indicator_code, category, description, measurement_unit, target_value, reporting_frequency, is_jawda_indicator, generating_code, applied_code, created_by) VALUES
('Patient Satisfaction Score', 'PSS001', 'satisfaction', 'Overall patient satisfaction rating', 'percentage', 85.0000, 'monthly', TRUE, 'QI_PSS_001', 'APPLIED_PSS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Clinical Outcome Success Rate', 'COSR002', 'clinical', 'Percentage of successful clinical outcomes', 'percentage', 90.0000, 'quarterly', TRUE, 'QI_COSR_002', 'APPLIED_COSR_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medication Error Rate', 'MER003', 'safety', 'Rate of medication errors per 1000 administrations', 'per_1000', 2.0000, 'monthly', TRUE, 'QI_MER_003', 'APPLIED_MER_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Average Response Time', 'ART004', 'efficiency', 'Average response time to patient requests', 'minutes', 30.0000, 'weekly', FALSE, 'QI_ART_004', 'APPLIED_ART_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Cost Per Episode', 'CPE005', 'financial', 'Average cost per patient episode', 'AED', 2500.0000, 'monthly', FALSE, 'QI_CPE_005', 'APPLIED_CPE_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Readmission Rate', 'RR006', 'clinical', 'Rate of patient readmissions within 30 days', 'percentage', 5.0000, 'monthly', TRUE, 'QI_RR_006', 'APPLIED_RR_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Staff Compliance Rate', 'SCR007', 'safety', 'Staff compliance with safety protocols', 'percentage', 95.0000, 'monthly', TRUE, 'QI_SCR_007', 'APPLIED_SCR_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Documentation Completeness', 'DC008', 'efficiency', 'Percentage of complete clinical documentation', 'percentage', 98.0000, 'weekly', TRUE, 'QI_DC_008', 'APPLIED_DC_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Analytics & Business Intelligence
-- ================================================

-- KPI Definitions Table
CREATE TABLE kpi_definitions (
    id SERIAL PRIMARY KEY,
    kpi_name VARCHAR(200) UNIQUE NOT NULL,
    kpi_code VARCHAR(20) UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('financial', 'operational', 'clinical', 'patient_satisfaction', 'staff_productivity')),
    description TEXT,
    calculation_formula TEXT NOT NULL,
    data_sources JSONB NOT NULL,
    target_value DECIMAL(15, 6),
    unit_of_measure VARCHAR(50),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    trend_direction VARCHAR(20) DEFAULT 'higher_better' CHECK (trend_direction IN ('higher_better', 'lower_better', 'target_range')),
    threshold_green DECIMAL(15, 6),
    threshold_yellow DECIMAL(15, 6),
    threshold_red DECIMAL(15, 6),
    dashboard_display BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Measurements Table
CREATE TABLE kpi_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id),
    measurement_period DATE NOT NULL,
    measured_value DECIMAL(15, 6) NOT NULL,
    target_value DECIMAL(15, 6),
    previous_period_value DECIMAL(15, 6),
    percentage_change DECIMAL(8, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN previous_period_value > 0 THEN ((measured_value - previous_period_value) / previous_period_value) * 100 
            ELSE NULL 
        END
    ) STORED,
    performance_status VARCHAR(20) NOT NULL CHECK (performance_status IN ('excellent', 'good', 'warning', 'critical')),
    trend VARCHAR(20) DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining', 'volatile')),
    data_quality_score SMALLINT DEFAULT 5 CHECK (data_quality_score BETWEEN 1 AND 5),
    calculation_details JSONB,
    notes TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by VARCHAR(100),
    approved_by UUID REFERENCES user_profiles(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    published BOOLEAN DEFAULT FALSE,
    published_date TIMESTAMP WITH TIME ZONE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Data Encryption & Security
-- ================================================

-- Encryption Keys Table
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id VARCHAR(100) UNIQUE NOT NULL,
    key_purpose VARCHAR(20) NOT NULL CHECK (key_purpose IN ('patient_data', 'documents', 'communications', 'backups')),
    encryption_algorithm VARCHAR(50) NOT NULL,
    key_strength INTEGER NOT NULL,
    key_value BYTEA NOT NULL,
    initialization_vector BYTEA,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'compromised')),
    rotation_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count BIGINT DEFAULT 0,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    ip_address INET NOT NULL,
    user_agent TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'expired', 'terminated', 'locked')),
    device_fingerprint VARCHAR(500),
    location_data JSONB,
    authentication_method VARCHAR(20) NOT NULL CHECK (authentication_method IN ('password', 'mfa', 'biometric', 'sso')),
    mfa_verified BOOLEAN DEFAULT FALSE,
    session_data JSONB,
    security_violations INTEGER DEFAULT 0,
    last_violation_time TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    is_concurrent BOOLEAN DEFAULT FALSE,
    concurrent_session_count INTEGER DEFAULT 1,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Enable RLS for Communication & Notifications Tables
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS for Integration & Data Exchange Tables
ALTER TABLE integration_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exchanges ENABLE ROW LEVEL SECURITY;

-- Enable RLS for Laboratory & Diagnostic Results Tables
ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Function to automatically create financial transaction for payments
CREATE OR REPLACE FUNCTION create_financial_transaction_for_payment()
RETURNS TRIGGER AS $
BEGIN
    -- Create corresponding financial transaction for new payment
    IF TG_OP = 'INSERT' THEN
        INSERT INTO financial_transactions (
            transaction_number,
            transaction_type,
            related_payment_id,
            related_invoice_id,
            patient_id,
            transaction_date,
            amount,
            currency,
            exchange_rate,
            description,
            transaction_status,
            generating_code,
            applied_code,
            created_by
        ) VALUES (
            'FT-' || NEW.payment_number,
            'payment',
            NEW.id,
            NEW.invoice_id,
            NEW.patient_id,
            NEW.payment_date,
            NEW.payment_amount,
            NEW.currency,
            NEW.exchange_rate,
            'Financial transaction for payment: ' || NEW.payment_number,
            CASE WHEN NEW.payment_status = 'cleared' THEN 'completed' ELSE 'pending' END,
            'FT_' || NEW.generating_code,
            'FT_' || NEW.applied_code,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to create financial transaction for payments
CREATE TRIGGER create_financial_transaction_on_payment
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION create_financial_transaction_for_payment();

-- RLS Policies for Communication & Notifications Tables
CREATE POLICY "All authenticated users can view notification templates" ON notification_templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage notification templates" ON notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view notifications" ON notifications
    FOR SELECT USING (
        sender_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR recipient_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their notifications" ON notifications
    FOR UPDATE USING (
        sender_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Integration & Data Exchange Tables
CREATE POLICY "All authenticated users can view integration endpoints" ON integration_endpoints
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage integration endpoints" ON integration_endpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view data exchanges" ON data_exchanges
    FOR SELECT USING (
        initiated_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create data exchanges" ON data_exchanges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their data exchanges" ON data_exchanges
    FOR UPDATE USING (
        initiated_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Laboratory & Diagnostic Results Tables
CREATE POLICY "All authenticated users can view lab test catalog" ON lab_test_catalog
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage lab test catalog" ON lab_test_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view lab orders" ON lab_orders
    FOR SELECT USING (
        ordering_provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR collected_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create lab orders" ON lab_orders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their lab orders" ON lab_orders
    FOR UPDATE USING (
        ordering_provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR collected_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_orders 
            WHERE lab_orders.id = lab_results.lab_order_id 
            AND (lab_orders.ordering_provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.collected_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.reviewed_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.created_by = auth.uid())
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create lab results" ON lab_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their lab results" ON lab_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lab_orders 
            WHERE lab_orders.id = lab_results.lab_order_id 
            AND (lab_orders.ordering_provider_id IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.collected_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.reviewed_by IN (
                SELECT id FROM healthcare_providers 
                WHERE id IN (
                    SELECT id FROM user_profiles 
                    WHERE id = auth.uid()
                )
            ) OR lab_orders.created_by = auth.uid())
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Function to update invoice payment status
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $
DECLARE
    total_paid DECIMAL(12,2);
    invoice_total DECIMAL(12,2);
BEGIN
    -- Only process if payment is related to an invoice
    IF NEW.invoice_id IS NOT NULL THEN
        -- Calculate total payments for this invoice
        SELECT COALESCE(SUM(payment_amount), 0) INTO total_paid
        FROM payments 
        WHERE invoice_id = NEW.invoice_id 
        AND payment_status = 'cleared';
        
        -- Get invoice total
        SELECT total_amount INTO invoice_total
        FROM invoices 
        WHERE id = NEW.invoice_id;
        
        -- Update invoice payment status
        UPDATE invoices 
        SET 
            amount_paid = total_paid,
            payment_status = CASE 
                WHEN total_paid = 0 THEN 'unpaid'
                WHEN total_paid < invoice_total THEN 'partial'
                WHEN total_paid = invoice_total THEN 'paid'
                WHEN total_paid > invoice_total THEN 'overpaid'
                ELSE payment_status
            END,
            invoice_status = CASE 
                WHEN total_paid >= invoice_total THEN 'paid'
                ELSE invoice_status
            END,
            paid_date = CASE 
                WHEN total_paid >= invoice_total AND paid_date IS NULL THEN NOW()
                ELSE paid_date
            END
        WHERE id = NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to update invoice payment status
CREATE TRIGGER update_invoice_payment_status_trigger
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_payment_status();

-- Indexes for Communication & Notifications Tables
CREATE INDEX idx_notification_templates_name ON notification_templates(template_name);
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX idx_notification_templates_category ON notification_templates(category);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX idx_notification_templates_generating_code ON notification_templates(generating_code);
CREATE INDEX idx_notification_templates_applied_code ON notification_templates(applied_code);
CREATE INDEX idx_notification_templates_compliance ON notification_templates(compliance_status);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id, scheduled_time);
CREATE INDEX idx_notifications_patient ON notifications(patient_id, scheduled_time);
CREATE INDEX idx_notifications_delivery_tracking ON notifications(delivery_status, scheduled_time);
CREATE INDEX idx_notifications_template ON notifications(template_id);
CREATE INDEX idx_notifications_appointment ON notifications(related_appointment_id);
CREATE INDEX idx_notifications_medical_record ON notifications(related_record_id);
CREATE INDEX idx_notifications_sender ON notifications(sender_id);
CREATE INDEX idx_notifications_priority ON notifications(priority, scheduled_time);
CREATE INDEX idx_notifications_generating_code ON notifications(generating_code);
CREATE INDEX idx_notifications_applied_code ON notifications(applied_code);
CREATE INDEX idx_notifications_compliance ON notifications(compliance_status);

-- Indexes for Integration & Data Exchange Tables
CREATE INDEX idx_integration_endpoints_name ON integration_endpoints(endpoint_name);
CREATE INDEX idx_integration_endpoints_type ON integration_endpoints(endpoint_type);
CREATE INDEX idx_integration_endpoints_active ON integration_endpoints(is_active);
CREATE INDEX idx_integration_endpoints_connection_status ON integration_endpoints(connection_status);
CREATE INDEX idx_integration_endpoints_generating_code ON integration_endpoints(generating_code);
CREATE INDEX idx_integration_endpoints_applied_code ON integration_endpoints(applied_code);
CREATE INDEX idx_integration_endpoints_compliance ON integration_endpoints(compliance_status);

CREATE INDEX idx_data_exchanges_patient ON data_exchanges(patient_id, data_type);
CREATE INDEX idx_data_exchanges_endpoint ON data_exchanges(endpoint_id);
CREATE INDEX idx_data_exchanges_status ON data_exchanges(exchange_status, start_time);
CREATE INDEX idx_data_exchanges_external_reference ON data_exchanges(external_reference_id);
CREATE INDEX idx_data_exchanges_initiated_by ON data_exchanges(initiated_by);
CREATE INDEX idx_data_exchanges_type ON data_exchanges(data_type, exchange_type);
CREATE INDEX idx_data_exchanges_consent ON data_exchanges(consent_status, consent_date);
CREATE INDEX idx_data_exchanges_generating_code ON data_exchanges(generating_code);
CREATE INDEX idx_data_exchanges_applied_code ON data_exchanges(applied_code);
CREATE INDEX idx_data_exchanges_compliance ON data_exchanges(compliance_status);

-- Indexes for Laboratory & Diagnostic Results Tables
CREATE INDEX idx_lab_test_catalog_code ON lab_test_catalog(test_code);
CREATE INDEX idx_lab_test_catalog_name ON lab_test_catalog(test_name);
CREATE INDEX idx_lab_test_catalog_category ON lab_test_catalog(test_category);
CREATE INDEX idx_lab_test_catalog_active ON lab_test_catalog(is_active);
CREATE INDEX idx_lab_test_catalog_generating_code ON lab_test_catalog(generating_code);
CREATE INDEX idx_lab_test_catalog_applied_code ON lab_test_catalog(applied_code);
CREATE INDEX idx_lab_test_catalog_compliance ON lab_test_catalog(compliance_status);

CREATE INDEX idx_lab_orders_number ON lab_orders(order_number);
CREATE INDEX idx_lab_orders_patient_date ON lab_orders(patient_id, order_date);
CREATE INDEX idx_lab_orders_provider_orders ON lab_orders(ordering_provider_id, order_date);
CREATE INDEX idx_lab_orders_status_priority ON lab_orders(order_status, priority);
CREATE INDEX idx_lab_orders_medical_record ON lab_orders(medical_record_id);
CREATE INDEX idx_lab_orders_collected_by ON lab_orders(collected_by);
CREATE INDEX idx_lab_orders_reviewed_by ON lab_orders(reviewed_by);
CREATE INDEX idx_lab_orders_critical_results ON lab_orders(critical_results, critical_notification_sent);
CREATE INDEX idx_lab_orders_generating_code ON lab_orders(generating_code);
CREATE INDEX idx_lab_orders_applied_code ON lab_orders(applied_code);
CREATE INDEX idx_lab_orders_compliance ON lab_orders(compliance_status);

CREATE INDEX idx_lab_results_order_results ON lab_results(lab_order_id, result_date);
CREATE INDEX idx_lab_results_test_catalog ON lab_results(test_catalog_id);
CREATE INDEX idx_lab_results_abnormal_results ON lab_results(abnormal_flag, result_date);
CREATE INDEX idx_lab_results_critical_results ON lab_results(critical_notification_required, critical_notification_sent);
CREATE INDEX idx_lab_results_status ON lab_results(result_status);
CREATE INDEX idx_lab_results_trend ON lab_results(trend_direction);
CREATE INDEX idx_lab_results_generating_code ON lab_results(generating_code);
CREATE INDEX idx_lab_results_applied_code ON lab_results(applied_code);
CREATE INDEX idx_lab_results_compliance ON lab_results(compliance_status);

-- Incident Management & Safety
-- ================================================

-- Incident Types Table
CREATE TABLE incident_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('medication_error', 'patient_fall', 'equipment_failure', 'infection', 'documentation_error', 'other')),
    severity_levels JSONB, -- Available severity levels for this type
    mandatory_fields JSONB, -- Required fields for reporting
    notification_required BOOLEAN DEFAULT FALSE,
    investigation_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(30) UNIQUE NOT NULL,
    incident_type_id UUID NOT NULL REFERENCES incident_types(id),
    patient_id UUID REFERENCES patients(id),
    provider_id UUID REFERENCES healthcare_providers(id),
    incident_date DATE NOT NULL,
    incident_time TIME NOT NULL,
    location VARCHAR(200),
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('minor', 'moderate', 'major', 'catastrophic')),
    actual_harm VARCHAR(20) DEFAULT 'none' CHECK (actual_harm IN ('none', 'minor', 'moderate', 'major', 'death')),
    potential_harm VARCHAR(20) DEFAULT 'none' CHECK (potential_harm IN ('none', 'minor', 'moderate', 'major', 'death')),
    incident_description TEXT NOT NULL,
    immediate_actions_taken TEXT,
    contributing_factors JSONB,
    equipment_involved VARCHAR(200),
    medications_involved JSONB,
    witnesses JSONB, -- Array of witness information
    reported_by UUID NOT NULL REFERENCES healthcare_providers(id),
    report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manager_notified BOOLEAN DEFAULT FALSE,
    manager_notification_date TIMESTAMP WITH TIME ZONE,
    family_notified BOOLEAN DEFAULT FALSE,
    family_notification_date TIMESTAMP WITH TIME ZONE,
    physician_notified BOOLEAN DEFAULT FALSE,
    physician_notification_date TIMESTAMP WITH TIME ZONE,
    investigation_required BOOLEAN DEFAULT FALSE,
    investigation_completed BOOLEAN DEFAULT FALSE,
    investigation_findings TEXT,
    corrective_actions TEXT,
    prevention_measures TEXT,
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'under_investigation', 'resolved', 'closed')),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    regulatory_reporting_required BOOLEAN DEFAULT FALSE,
    regulatory_reported BOOLEAN DEFAULT FALSE,
    regulatory_report_date TIMESTAMP WITH TIME ZONE,
    lessons_learned TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Document Management & Attachments
-- ================================================

-- Document Categories Table
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    allowed_file_types JSONB, -- e.g., ['pdf', 'jpg', 'png', 'doc']
    max_file_size_mb INTEGER DEFAULT 10,
    retention_period_years INTEGER DEFAULT 7,
    requires_encryption BOOLEAN DEFAULT TRUE,
    access_level VARCHAR(20) DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted')),
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id),
    medical_record_id UUID REFERENCES medical_records(id),
    appointment_id UUID REFERENCES appointments(id),
    document_category_id UUID NOT NULL REFERENCES document_categories(id),
    document_title VARCHAR(500) NOT NULL,
    document_description TEXT,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(256), -- For integrity verification
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_key_id VARCHAR(100),
    document_date DATE,
    expiry_date DATE,
    is_signed BOOLEAN DEFAULT FALSE,
    digital_signatures JSONB, -- Array of digital signature info
    version_number INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    access_permissions JSONB, -- Who can view/edit this document
    tags JSONB, -- Document tags for searching
    ocr_text TEXT, -- Extracted text for searching
    thumbnail_path VARCHAR(1000),
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    uploaded_by UUID NOT NULL REFERENCES healthcare_providers(id),
    reviewed_by UUID REFERENCES healthcare_providers(id),
    review_date TIMESTAMP WITH TIME ZONE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approval_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for Incident Management Tables
CREATE INDEX idx_incident_types_name ON incident_types(type_name);
CREATE INDEX idx_incident_types_category ON incident_types(category);
CREATE INDEX idx_incident_types_active ON incident_types(is_active);
CREATE INDEX idx_incident_types_generating_code ON incident_types(generating_code);
CREATE INDEX idx_incident_types_applied_code ON incident_types(applied_code);
CREATE INDEX idx_incident_types_compliance ON incident_types(compliance_status);

CREATE INDEX idx_incidents_number ON incidents(incident_number);
CREATE INDEX idx_incidents_patient_date ON incidents(patient_id, incident_date);
CREATE INDEX idx_incidents_provider_date ON incidents(provider_id, incident_date);
CREATE INDEX idx_incidents_status_severity ON incidents(status, severity_level);
CREATE INDEX idx_incidents_type_id ON incidents(incident_type_id);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_report_date ON incidents(report_date);
CREATE INDEX idx_incidents_follow_up ON incidents(follow_up_required, follow_up_date);
CREATE INDEX idx_incidents_regulatory_reporting ON incidents(regulatory_reporting_required, regulatory_reported);
CREATE INDEX idx_incidents_generating_code ON incidents(generating_code);
CREATE INDEX idx_incidents_applied_code ON incidents(applied_code);
CREATE INDEX idx_incidents_compliance ON incidents(compliance_status);

-- Indexes for Document Management Tables
CREATE INDEX idx_document_categories_name ON document_categories(category_name);
CREATE INDEX idx_document_categories_active ON document_categories(is_active);
CREATE INDEX idx_document_categories_access_level ON document_categories(access_level);
CREATE INDEX idx_document_categories_generating_code ON document_categories(generating_code);
CREATE INDEX idx_document_categories_applied_code ON document_categories(applied_code);
CREATE INDEX idx_document_categories_compliance ON document_categories(compliance_status);

CREATE INDEX idx_documents_number ON documents(document_number);
CREATE INDEX idx_documents_patient_date ON documents(patient_id, document_date);
CREATE INDEX idx_documents_medical_record ON documents(medical_record_id);
CREATE INDEX idx_documents_appointment ON documents(appointment_id);
CREATE INDEX idx_documents_category ON documents(document_category_id);
CREATE INDEX idx_documents_title_search ON documents(document_title);
CREATE INDEX idx_documents_file_hash ON documents(file_hash);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_reviewed_by ON documents(reviewed_by);
CREATE INDEX idx_documents_approval_status ON documents(approval_status);
CREATE INDEX idx_documents_parent_document ON documents(parent_document_id);
CREATE INDEX idx_documents_version ON documents(parent_document_id, version_number);
CREATE INDEX idx_documents_active ON documents(is_active);
CREATE INDEX idx_documents_generating_code ON documents(generating_code);
CREATE INDEX idx_documents_applied_code ON documents(applied_code);
CREATE INDEX idx_documents_compliance ON documents(compliance_status);
CREATE INDEX idx_documents_tags ON documents USING GIN (tags);
CREATE INDEX idx_documents_ocr_text ON documents USING GIN (to_tsvector('english', ocr_text));

-- Enable RLS for Incident Management & Document Management Tables
ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Incident Management Tables
CREATE POLICY "All authenticated users can view incident types" ON incident_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage incident types" ON incident_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view incidents" ON incidents
    FOR SELECT USING (
        reported_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
    );

CREATE POLICY "Healthcare providers can create incidents" ON incidents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their incidents" ON incidents
    FOR UPDATE USING (
        reported_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR provider_id IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- RLS Policies for Document Management Tables
CREATE POLICY "All authenticated users can view document categories" ON document_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage document categories" ON document_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

CREATE POLICY "Healthcare providers can view documents" ON documents
    FOR SELECT USING (
        uploaded_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor')
        )
        OR (
            patient_id IS NOT NULL 
            AND EXISTS (
                SELECT 1 FROM patient_episodes 
                WHERE patient_episodes.patient_id = documents.patient_id 
                AND patient_episodes.assigned_clinician = auth.uid()
            )
        )
    );

CREATE POLICY "Healthcare providers can create documents" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator', 'doctor', 'nurse')
        )
    );

CREATE POLICY "Healthcare providers can update their documents" ON documents
    FOR UPDATE USING (
        uploaded_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR reviewed_by IN (
            SELECT id FROM healthcare_providers 
            WHERE id IN (
                SELECT id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('admin', 'coordinator')
        )
    );

-- Update triggers for Incident Management & Document Management Tables
CREATE TRIGGER update_incident_types_updated_at BEFORE UPDATE ON incident_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON document_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for Incident Management & Document Management Tables
CREATE TRIGGER audit_incident_types AFTER INSERT OR UPDATE OR DELETE ON incident_types FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_incidents AFTER INSERT OR UPDATE OR DELETE ON incidents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_document_categories AFTER INSERT OR UPDATE OR DELETE ON document_categories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Insert default incident types
INSERT INTO incident_types (type_name, category, severity_levels, mandatory_fields, notification_required, investigation_required, generating_code, applied_code, created_by) VALUES
('Medication Administration Error', 'medication_error', '["minor", "moderate", "major", "catastrophic"]', '["medication_name", "dosage", "administration_time", "patient_condition"]', TRUE, TRUE, 'IT_MED_ERROR_001', 'APPLIED_MED_ERROR_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Patient Fall', 'patient_fall', '["minor", "moderate", "major"]', '["fall_location", "injury_assessment", "mobility_status", "environmental_factors"]', TRUE, TRUE, 'IT_PATIENT_FALL_002', 'APPLIED_PATIENT_FALL_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Equipment Malfunction', 'equipment_failure', '["minor", "moderate", "major", "catastrophic"]', '["equipment_type", "malfunction_description", "patient_impact", "maintenance_history"]', TRUE, FALSE, 'IT_EQUIPMENT_FAIL_003', 'APPLIED_EQUIPMENT_FAIL_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Healthcare-Associated Infection', 'infection', '["moderate", "major", "catastrophic"]', '["infection_type", "source_identification", "isolation_measures", "contact_tracing"]', TRUE, TRUE, 'IT_HAI_004', 'APPLIED_HAI_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Documentation Error', 'documentation_error', '["minor", "moderate", "major"]', '["document_type", "error_description", "correction_method", "impact_assessment"]', FALSE, FALSE, 'IT_DOC_ERROR_005', 'APPLIED_DOC_ERROR_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Near Miss Event', 'other', '["minor", "moderate"]', '["event_description", "potential_consequences", "prevention_measures"]', FALSE, FALSE, 'IT_NEAR_MISS_006', 'APPLIED_NEAR_MISS_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default document categories
INSERT INTO document_categories (category_name, description, allowed_file_types, max_file_size_mb, retention_period_years, requires_encryption, access_level, generating_code, applied_code, created_by) VALUES
('Clinical Reports', 'Medical reports, lab results, diagnostic imaging', '["pdf", "jpg", "png", "dcm", "doc", "docx"]', 50, 10, TRUE, 'confidential', 'DC_CLINICAL_REPORTS_001', 'APPLIED_CLINICAL_REPORTS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Patient Consent Forms', 'Informed consent, treatment authorization forms', '["pdf", "jpg", "png", "doc", "docx"]', 10, 7, TRUE, 'confidential', 'DC_CONSENT_FORMS_002', 'APPLIED_CONSENT_FORMS_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Insurance Documents', 'Insurance cards, pre-authorization forms, claims', '["pdf", "jpg", "png", "doc", "docx"]', 25, 7, TRUE, 'internal', 'DC_INSURANCE_DOCS_003', 'APPLIED_INSURANCE_DOCS_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Identification Documents', 'Emirates ID, passport, visa documents', '["pdf", "jpg", "png"]', 10, 5, TRUE, 'restricted', 'DC_ID_DOCUMENTS_004', 'APPLIED_ID_DOCUMENTS_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Care Plans', 'Treatment plans, care coordination documents', '["pdf", "doc", "docx", "txt"]', 15, 7, TRUE, 'internal', 'DC_CARE_PLANS_005', 'APPLIED_CARE_PLANS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Incident Reports', 'Safety incident documentation, investigation reports', '["pdf", "doc", "docx", "jpg", "png"]', 20, 10, TRUE, 'restricted', 'DC_INCIDENT_REPORTS_006', 'APPLIED_INCIDENT_REPORTS_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Quality Assurance', 'Quality metrics, audit reports, compliance documents', '["pdf", "doc", "docx", "xls", "xlsx"]', 30, 7, TRUE, 'internal', 'DC_QUALITY_ASSURANCE_007', 'APPLIED_QUALITY_ASSURANCE_007', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Training Materials', 'Staff training documents, certifications, protocols', '["pdf", "doc", "docx", "ppt", "pptx", "mp4", "avi"]', 100, 5, FALSE, 'internal', 'DC_TRAINING_MATERIALS_008', 'APPLIED_TRAINING_MATERIALS_008', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default notification templates
INSERT INTO notification_templates (template_name, template_type, category, subject_template, body_template, variables, language, generating_code, applied_code, created_by) VALUES
('Appointment Reminder SMS', 'sms', 'appointment', NULL, 'Dear {{patient_name}}, this is a reminder for your appointment on {{appointment_date}} at {{appointment_time}} with {{provider_name}}. Please confirm by replying YES.', '{"patient_name": "string", "appointment_date": "date", "appointment_time": "time", "provider_name": "string"}', 'en', 'NT_APPT_REMINDER_SMS_001', 'APPLIED_APPT_REMINDER_SMS_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Appointment Confirmation Email', 'email', 'appointment', 'Appointment Confirmation - {{appointment_date}}', 'Dear {{patient_name}},\n\nYour appointment has been confirmed for {{appointment_date}} at {{appointment_time}} with {{provider_name}}.\n\nLocation: {{location}}\nService: {{service_type}}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nReyada Homecare Team', '{"patient_name": "string", "appointment_date": "date", "appointment_time": "time", "provider_name": "string", "location": "string", "service_type": "string"}', 'en', 'NT_APPT_CONFIRM_EMAIL_002', 'APPLIED_APPT_CONFIRM_EMAIL_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Lab Results Available', 'email', 'general', 'Lab Results Available - {{patient_name}}', 'Dear {{patient_name}},\n\nYour lab results for tests ordered on {{order_date}} are now available.\n\nPlease log into your patient portal or contact us to discuss the results with your healthcare provider.\n\nTest(s): {{test_names}}\n\nBest regards,\nReyada Homecare Team', '{"patient_name": "string", "order_date": "date", "test_names": "string"}', 'en', 'NT_LAB_RESULTS_EMAIL_003', 'APPLIED_LAB_RESULTS_EMAIL_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Critical Lab Alert', 'system', 'emergency', 'CRITICAL: Lab Results Alert', 'CRITICAL LAB ALERT\n\nPatient: {{patient_name}} ({{mrn}})\nTest: {{test_name}}\nResult: {{result_value}} {{units}}\nNormal Range: {{normal_range}}\nOrdered by: {{ordering_provider}}\n\nImmediate attention required.', '{"patient_name": "string", "mrn": "string", "test_name": "string", "result_value": "string", "units": "string", "normal_range": "string", "ordering_provider": "string"}', 'en', 'NT_CRITICAL_LAB_ALERT_004', 'APPLIED_CRITICAL_LAB_ALERT_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Medication Reminder', 'sms', 'medication', NULL, 'Medication Reminder: Time to take your {{medication_name}} ({{dosage}}). Next dose at {{next_dose_time}}.', '{"medication_name": "string", "dosage": "string", "next_dose_time": "time"}', 'en', 'NT_MED_REMINDER_SMS_005', 'APPLIED_MED_REMINDER_SMS_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Billing Statement', 'email', 'billing', 'Billing Statement - {{invoice_number}}', 'Dear {{patient_name}},\n\nYour billing statement is ready.\n\nInvoice Number: {{invoice_number}}\nService Date: {{service_date}}\nAmount Due: {{amount_due}} AED\nDue Date: {{due_date}}\n\nPlease log into your patient portal to view the full statement and make payment.\n\nThank you,\nReyada Homecare Billing Team', '{"patient_name": "string", "invoice_number": "string", "service_date": "date", "amount_due": "decimal", "due_date": "date"}', 'en', 'NT_BILLING_STATEMENT_006', 'APPLIED_BILLING_STATEMENT_006', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default integration endpoints
INSERT INTO integration_endpoints (endpoint_name, endpoint_type, base_url, authentication_type, api_version, data_format, rate_limit_per_minute, timeout_seconds, retry_attempts, generating_code, applied_code, created_by) VALUES
('Malaffi EMR Integration', 'malaffi', 'https://api.malaffi.ae/v1', 'oauth2', 'v1.0', 'fhir', 30, 45, 3, 'IE_MALAFFI_EMR_001', 'APPLIED_MALAFFI_EMR_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Daman Insurance API', 'insurance', 'https://api.daman.ae/claims', 'api_key', 'v2.1', 'json', 60, 30, 3, 'IE_DAMAN_INSURANCE_002', 'APPLIED_DAMAN_INSURANCE_002', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Lab Results Integration', 'laboratory', 'https://lab-api.example.ae/v1', 'bearer', 'v1.0', 'hl7', 120, 60, 2, 'IE_LAB_RESULTS_003', 'APPLIED_LAB_RESULTS_003', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Radiology PACS Integration', 'radiology', 'https://pacs.example.ae/api', 'basic', 'v1.2', 'json', 30, 120, 2, 'IE_RADIOLOGY_PACS_004', 'APPLIED_RADIOLOGY_PACS_004', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('Pharmacy Integration', 'pharmacy', 'https://pharmacy-api.example.ae/v1', 'api_key', 'v1.0', 'json', 90, 30, 3, 'IE_PHARMACY_005', 'APPLIED_PHARMACY_005', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Insert default lab test catalog entries
INSERT INTO lab_test_catalog (test_code, test_name, test_category, specimen_type, normal_range_male, normal_range_female, normal_range_pediatric, units, critical_low, critical_high, turnaround_time_hours, requires_fasting, special_instructions, generating_code, applied_code, created_by) VALUES
('CBC001', 'Complete Blood Count', 'Hematology', 'Whole Blood', 'WBC: 4.5-11.0, RBC: 4.7-6.1, Hgb: 14-18', 'WBC: 4.5-11.0, RBC: 4.2-5.4, Hgb: 12-16', 'Age-dependent ranges', '10^9/L, 10^12/L, g/dL', 2.0, 30.0, 4, FALSE, 'EDTA tube required', 'LTC_CBC_001', 'APPLIED_CBC_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('GLUC001', 'Fasting Glucose', 'Chemistry', 'Serum', '70-100 mg/dL', '70-100 mg/dL', '60-100 mg/dL', 'mg/dL', 40.0, 400.0, 2, TRUE, 'Patient must fast 8-12 hours', 'LTC_GLUC_001', 'APPLIED_GLUC_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('HBA1C001', 'Hemoglobin A1c', 'Chemistry', 'Whole Blood', '<7.0%', '<7.0%', '<7.0%', '%', 4.0, 15.0, 24, FALSE, 'No fasting required', 'LTC_HBA1C_001', 'APPLIED_HBA1C_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('LIPID001', 'Lipid Panel', 'Chemistry', 'Serum', 'Total Chol <200, LDL <100, HDL >40, TG <150', 'Total Chol <200, LDL <100, HDL >50, TG <150', 'Age-dependent ranges', 'mg/dL', 50.0, 500.0, 4, TRUE, 'Fast 9-12 hours, water allowed', 'LTC_LIPID_001', 'APPLIED_LIPID_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('TSH001', 'Thyroid Stimulating Hormone', 'Endocrinology', 'Serum', '0.4-4.0 mIU/L', '0.4-4.0 mIU/L', 'Age-dependent ranges', 'mIU/L', 0.1, 20.0, 6, FALSE, 'Morning collection preferred', 'LTC_TSH_001', 'APPLIED_TSH_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('URINE001', 'Urinalysis Complete', 'Urinalysis', 'Urine', 'Normal ranges vary by parameter', 'Normal ranges vary by parameter', 'Normal ranges vary by parameter', 'Various', NULL, NULL, 2, FALSE, 'Clean catch midstream specimen', 'LTC_URINE_001', 'APPLIED_URINE_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('CRP001', 'C-Reactive Protein', 'Immunology', 'Serum', '<3.0 mg/L', '<3.0 mg/L', '<3.0 mg/L', 'mg/L', 0.0, 100.0, 4, FALSE, 'Acute phase reactant', 'LTC_CRP_001', 'APPLIED_CRP_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)),
('D3001', 'Vitamin D (25-OH)', 'Chemistry', 'Serum', '30-100 ng/mL', '30-100 ng/mL', '30-100 ng/mL', 'ng/mL', 10.0, 150.0, 24, FALSE, 'No special preparation required', 'LTC_D3_001', 'APPLIED_D3_001', (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));

-- Functions for auto-generating order numbers
CREATE OR REPLACE FUNCTION generate_lab_order_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_order_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(order_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM lab_orders
    WHERE order_number LIKE 'LAB-' || year_suffix || '-%';
    
    -- Generate new order number: LAB-YY-NNNNNN
    new_order_number := 'LAB-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.order_number := new_order_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate lab order numbers
CREATE TRIGGER generate_lab_order_number_trigger
    BEFORE INSERT ON lab_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_lab_order_number();

-- Function to handle critical lab results notifications
CREATE OR REPLACE FUNCTION handle_critical_lab_results()
RETURNS TRIGGER AS $
DECLARE
    test_info RECORD;
    order_info RECORD;
    patient_info RECORD;
BEGIN
    -- Check if result is critical
    IF NEW.abnormal_flag IN ('critical_high', 'critical_low') OR NEW.critical_notification_required THEN
        -- Get test information
        SELECT * INTO test_info FROM lab_test_catalog WHERE id = NEW.test_catalog_id;
        
        -- Get order information
        SELECT * INTO order_info FROM lab_orders WHERE id = NEW.lab_order_id;
        
        -- Get patient information
        SELECT * INTO patient_info FROM patients WHERE id = order_info.patient_id;
        
        -- Create critical notification
        INSERT INTO notifications (
            notification_type,
            recipient_type,
            recipient_id,
            patient_id,
            subject,
            message,
            priority,
            related_record_id,
            sender_id,
            generating_code,
            applied_code,
            created_by
        ) VALUES (
            'system',
            'provider',
            order_info.ordering_provider_id,
            order_info.patient_id,
            'CRITICAL: Lab Results Alert',
            'CRITICAL LAB ALERT\n\nPatient: ' || patient_info.first_name || ' ' || patient_info.last_name || ' (' || patient_info.mrn || ')\nTest: ' || test_info.test_name || '\nResult: ' || COALESCE(NEW.result_value, NEW.numeric_value::TEXT) || ' ' || COALESCE(NEW.units, '') || '\nNormal Range: ' || NEW.reference_range || '\n\nImmediate attention required.',
            'urgent',
            order_info.medical_record_id,
            order_info.ordering_provider_id,
            'CRITICAL_LAB_NOTIFICATION_' || NEW.id::TEXT,
            'APPLIED_CRITICAL_LAB_' || NEW.id::TEXT,
            NEW.created_by
        );
        
        -- Mark critical notification as sent
        NEW.critical_notification_sent := TRUE;
        
        -- Update lab order with critical flag
        UPDATE lab_orders 
        SET critical_results = TRUE, 
            critical_notification_sent = TRUE 
        WHERE id = NEW.lab_order_id;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to handle critical lab results
CREATE TRIGGER handle_critical_lab_results_trigger
    AFTER INSERT OR UPDATE ON lab_results
    FOR EACH ROW
    EXECUTE FUNCTION handle_critical_lab_results();

-- Function to generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_incident_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(incident_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM incidents
    WHERE incident_number LIKE 'INC-' || year_suffix || '-%';
    
    -- Generate new incident number: INC-YY-NNNNNN
    new_incident_number := 'INC-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.incident_number := new_incident_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate incident numbers
CREATE TRIGGER generate_incident_number_trigger
    BEFORE INSERT ON incidents
    FOR EACH ROW
    WHEN (NEW.incident_number IS NULL OR NEW.incident_number = '')
    EXECUTE FUNCTION generate_incident_number();

-- Function to generate document numbers
CREATE OR REPLACE FUNCTION generate_document_number()
RETURNS TRIGGER AS $
DECLARE
    year_suffix VARCHAR(2);
    sequence_num INTEGER;
    new_document_number VARCHAR(30);
BEGIN
    -- Get last 2 digits of current year
    year_suffix := RIGHT(EXTRACT(YEAR FROM NOW())::TEXT, 2);
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(RIGHT(document_number, 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM documents
    WHERE document_number LIKE 'DOC-' || year_suffix || '-%';
    
    -- Generate new document number: DOC-YY-NNNNNN
    new_document_number := 'DOC-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.document_number := new_document_number;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate document numbers
CREATE TRIGGER generate_document_number_trigger
    BEFORE INSERT ON documents
    FOR EACH ROW
    WHEN (NEW.document_number IS NULL OR NEW.document_number = '')
    EXECUTE FUNCTION generate_document_number();

-- Function to update document access tracking
CREATE OR REPLACE FUNCTION update_document_access()
RETURNS TRIGGER AS $
BEGIN
    -- Update last accessed timestamp and download count for SELECT operations
    -- This would typically be called from application layer, but included for completeness
    IF TG_OP = 'UPDATE' AND OLD.download_count < NEW.download_count THEN
        NEW.last_accessed := NOW();
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to track document access
CREATE TRIGGER update_document_access_trigger
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_access();

-- Function to validate incident severity and harm levels
CREATE OR REPLACE FUNCTION validate_incident_severity()
RETURNS TRIGGER AS $
BEGIN
    -- Ensure actual harm is not greater than potential harm
    IF NEW.actual_harm = 'death' AND NEW.potential_harm != 'death' THEN
        NEW.potential_harm := 'death';
    ELSIF NEW.actual_harm = 'major' AND NEW.potential_harm IN ('none', 'minor', 'moderate') THEN
        NEW.potential_harm := 'major';
    ELSIF NEW.actual_harm = 'moderate' AND NEW.potential_harm IN ('none', 'minor') THEN
        NEW.potential_harm := 'moderate';
    ELSIF NEW.actual_harm = 'minor' AND NEW.potential_harm = 'none' THEN
        NEW.potential_harm := 'minor';
    END IF;
    
    -- Auto-set investigation required for major incidents
    IF NEW.severity_level IN ('major', 'catastrophic') OR NEW.actual_harm IN ('major', 'death') THEN
        NEW.investigation_required := TRUE;
    END IF;
    
    -- Auto-set regulatory reporting for severe incidents
    IF NEW.severity_level = 'catastrophic' OR NEW.actual_harm = 'death' THEN
        NEW.regulatory_reporting_required := TRUE;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate incident data
CREATE TRIGGER validate_incident_severity_trigger
    BEFORE INSERT OR UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION validate_incident_severity();

-- Function to validate document file constraints
CREATE OR REPLACE FUNCTION validate_document_constraints()
RETURNS TRIGGER AS $
DECLARE
    category_record RECORD;
    file_extension VARCHAR(10);
BEGIN
    -- Get document category constraints
    SELECT * INTO category_record
    FROM document_categories
    WHERE id = NEW.document_category_id;
    
    -- Extract file extension
    file_extension := LOWER(RIGHT(NEW.file_name, LENGTH(NEW.file_name) - POSITION('.' IN REVERSE(NEW.file_name))));
    
    -- Validate file type
    IF NOT (category_record.allowed_file_types @> to_jsonb(file_extension)) THEN
        RAISE EXCEPTION 'File type % not allowed for category %', file_extension, category_record.category_name;
    END IF;
    
    -- Validate file size
    IF NEW.file_size_bytes > (category_record.max_file_size_mb * 1024 * 1024) THEN
        RAISE EXCEPTION 'File size exceeds maximum allowed size of % MB for category %', 
            category_record.max_file_size_mb, category_record.category_name;
    END IF;
    
    -- Set encryption requirement based on category
    IF category_record.requires_encryption THEN
        NEW.is_encrypted := TRUE;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to validate document constraints
CREATE TRIGGER validate_document_constraints_trigger
    BEFORE INSERT OR UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION validate_document_constraints();

-- Communication & Notifications
-- ================================================

-- Notification Templates Table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('sms', 'email', 'push', 'system')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('appointment', 'medication', 'emergency', 'billing', 'general')),
    subject_template VARCHAR(500),
    body_template TEXT NOT NULL,
    variables JSONB, -- Available template variables
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('sms', 'email', 'push', 'system')),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('patient', 'provider', 'admin', 'family')),
    recipient_id UUID NOT NULL,
    patient_id UUID REFERENCES patients(id),
    template_id UUID REFERENCES notification_templates(id),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    delivery_attempts INTEGER DEFAULT 0,
    failure_reason TEXT,
    read_status BOOLEAN DEFAULT FALSE,
    read_time TIMESTAMP WITH TIME ZONE,
    response_required BOOLEAN DEFAULT FALSE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    response_received TEXT,
    response_time TIMESTAMP WITH TIME ZONE,
    related_appointment_id UUID REFERENCES appointments(id),
    related_record_id UUID REFERENCES medical_records(id),
    sender_id UUID REFERENCES healthcare_providers(id),
    cost DECIMAL(8, 4) DEFAULT 0.0000, -- SMS/call costs
    external_reference VARCHAR(200), -- Third-party service reference
    metadata JSONB, -- Additional notification data
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Integration & Data Exchange
-- ================================================

-- Integration Endpoints Table
CREATE TABLE integration_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_name VARCHAR(100) UNIQUE NOT NULL,
    endpoint_type VARCHAR(20) NOT NULL CHECK (endpoint_type IN ('malaffi', 'insurance', 'laboratory', 'radiology', 'pharmacy', 'other')),
    base_url VARCHAR(500) NOT NULL,
    authentication_type VARCHAR(20) NOT NULL CHECK (authentication_type IN ('none', 'basic', 'bearer', 'oauth2', 'api_key')),
    authentication_details JSONB, -- Encrypted credentials
    api_version VARCHAR(20),
    data_format VARCHAR(20) DEFAULT 'json' CHECK (data_format IN ('json', 'xml', 'hl7', 'fhir')),
    rate_limit_per_minute INTEGER DEFAULT 60,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    last_connection_test TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(20) DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
    error_message TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Data Exchanges Table
CREATE TABLE data_exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exchange_type VARCHAR(20) NOT NULL CHECK (exchange_type IN ('send', 'receive', 'sync')),
    endpoint_id UUID NOT NULL REFERENCES integration_endpoints(id),
    patient_id UUID REFERENCES patients(id),
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('patient_demographics', 'medical_records', 'lab_results', 'radiology', 'prescriptions', 'allergies', 'immunizations')),
    exchange_status VARCHAR(20) DEFAULT 'pending' CHECK (exchange_status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    request_payload JSONB,
    response_payload JSONB,
    external_reference_id VARCHAR(200),
    initiated_by UUID REFERENCES healthcare_providers(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    bytes_transferred BIGINT,
    records_processed INTEGER,
    validation_errors JSONB,
    consent_status VARCHAR(20) DEFAULT 'pending' CHECK (consent_status IN ('granted', 'denied', 'pending', 'expired')),
    consent_date TIMESTAMP WITH TIME ZONE,
    audit_trail JSONB, -- Detailed logging
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Laboratory & Diagnostic Results
-- ================================================

-- Lab Test Catalog Table
CREATE TABLE lab_test_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_code VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    test_category VARCHAR(100),
    specimen_type VARCHAR(100),
    normal_range_male VARCHAR(200),
    normal_range_female VARCHAR(200),
    normal_range_pediatric VARCHAR(200),
    units VARCHAR(50),
    critical_low DECIMAL(15, 6),
    critical_high DECIMAL(15, 6),
    turnaround_time_hours INTEGER,
    requires_fasting BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Lab Orders Table
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    ordering_provider_id UUID NOT NULL REFERENCES healthcare_providers(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
    clinical_indication TEXT,
    specimen_collection_date TIMESTAMP WITH TIME ZONE,
    specimen_collection_location VARCHAR(200),
    collected_by UUID REFERENCES healthcare_providers(id),
    lab_facility VARCHAR(200),
    external_order_id VARCHAR(100),
    order_status VARCHAR(20) DEFAULT 'ordered' CHECK (order_status IN ('ordered', 'collected', 'in_transit', 'received', 'in_progress', 'completed', 'cancelled')),
    completion_date TIMESTAMP WITH TIME ZONE,
    report_url VARCHAR(1000),
    critical_results BOOLEAN DEFAULT FALSE,
    critical_notification_sent BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES healthcare_providers(id),
    review_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Lab Results Table
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    test_catalog_id UUID NOT NULL REFERENCES lab_test_catalog(id),
    result_value VARCHAR(500),
    numeric_value DECIMAL(15, 6),
    units VARCHAR(50),
    reference_range VARCHAR(200),
    abnormal_flag VARCHAR(20) DEFAULT 'normal' CHECK (abnormal_flag IN ('normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal')),
    result_status VARCHAR(20) DEFAULT 'final' CHECK (result_status IN ('preliminary', 'final', 'corrected', 'cancelled')),
    result_date TIMESTAMP WITH TIME ZONE NOT NULL,
    performed_by VARCHAR(200),
    verified_by VARCHAR(200),
    methodology VARCHAR(200),
    notes TEXT,
    quality_flags JSONB,
    delta_check_flag BOOLEAN DEFAULT FALSE,
    previous_value DECIMAL(15, 6),
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('stable', 'increasing', 'decreasing', 'fluctuating')),
    critical_notification_required BOOLEAN DEFAULT FALSE,
    critical_notification_sent BOOLEAN DEFAULT FALSE,
    generating_code VARCHAR(100) NOT NULL,
    applied_code VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) DEFAULT '3.0',
    compliance_status VARCHAR(50) DEFAULT 'DOH_COMPLIANT',
    integration_status JSONB,
    audit_trail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);
