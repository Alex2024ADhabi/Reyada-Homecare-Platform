import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
// Validation schemas
export const PatientValidationSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name too long"),
    emiratesId: z
        .string()
        .regex(/^\d{3}-\d{4}-\d{7}-\d{1}$/, "Invalid Emirates ID format"),
    phone: z.string().regex(/^\+971[0-9]{9}$/, "Invalid UAE phone number"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    dateOfBirth: z.string().refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 120;
    }, "Invalid date of birth"),
    gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
    address: z.string().min(10, "Address must be at least 10 characters"),
    emergencyContact: z.object({
        name: z.string().min(2, "Emergency contact name required"),
        phone: z.string().regex(/^\+971[0-9]{9}$/, "Invalid phone number"),
        relationship: z.string().min(2, "Relationship required"),
    }),
    insurance: z
        .object({
        provider: z.string().min(2, "Insurance provider required"),
        policyNumber: z.string().min(5, "Policy number required"),
        expiryDate: z.string().refine((date) => {
            return new Date(date) > new Date();
        }, "Insurance must not be expired"),
    })
        .optional(),
});
export const ClinicalFormValidationSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    formType: z.enum(["assessment", "care-plan", "progress-note", "discharge"], {
        required_error: "Form type is required",
    }),
    vitalSigns: z
        .object({
        bloodPressure: z
            .string()
            .regex(/^\d{2,3}\/\d{2,3}$/, "Invalid blood pressure format (e.g., 120/80)")
            .optional(),
        heartRate: z.number().min(30).max(200).optional(),
        temperature: z.number().min(35).max(42).optional(),
        respiratoryRate: z.number().min(8).max(40).optional(),
        oxygenSaturation: z.number().min(70).max(100).optional(),
    })
        .optional(),
    assessment: z.string().min(10, "Assessment must be at least 10 characters"),
    plan: z.string().min(10, "Care plan must be at least 10 characters"),
    medications: z
        .array(z.object({
        name: z.string().min(1, "Medication name required"),
        dosage: z.string().min(1, "Dosage required"),
        frequency: z.string().min(1, "Frequency required"),
        route: z.string().min(1, "Route required"),
    }))
        .optional(),
    signature: z.string().min(1, "Digital signature is required"),
});
export const DamanAuthorizationSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    serviceType: z.enum(["nursing", "physiotherapy", "occupational-therapy", "speech-therapy"], {
        required_error: "Service type is required",
    }),
    duration: z.number().min(1).max(365, "Duration cannot exceed 365 days"),
    frequency: z.string().min(1, "Frequency is required"),
    clinicalJustification: z
        .string()
        .min(50, "Clinical justification must be at least 50 characters"),
    documents: z.array(z.string()).min(1, "At least one document is required"),
    physicianSignature: z.string().min(1, "Physician signature is required"),
    patientConsent: z
        .boolean()
        .refine((val) => val === true, "Patient consent is required"),
});
export const ValidationError = ({ error, className, }) => {
    if (!error)
        return null;
    return (_jsxs("div", { className: cn("flex items-center gap-1 text-sm text-red-600 mt-1", className), children: [_jsx(AlertTriangle, { className: "h-3 w-3" }), _jsx("span", { children: error.message })] }));
};
export const ValidationSuccess = ({ show, message = "Valid", className, }) => {
    if (!show)
        return null;
    return (_jsxs("div", { className: cn("flex items-center gap-1 text-sm text-green-600 mt-1", className), children: [_jsx(CheckCircle, { className: "h-3 w-3" }), _jsx("span", { children: message })] }));
};
export const ValidationInfo = ({ message, className, }) => {
    return (_jsxs("div", { className: cn("flex items-center gap-1 text-sm text-blue-600 mt-1", className), children: [_jsx(Info, { className: "h-3 w-3" }), _jsx("span", { children: message })] }));
};
export const ValidatedField = ({ children, error, success, info, className, }) => {
    return (_jsxs("div", { className: cn("space-y-1", className), children: [children, _jsx(ValidationError, { error: error }), _jsx(ValidationSuccess, { show: success && !error }), info && !error && _jsx(ValidationInfo, { message: info })] }));
};
// Real-time validation hook with enhanced JSON safety and DOH compliance
export const useRealTimeValidation = (schema, value, field, dohCompliance = false) => {
    const [isValid, setIsValid] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [complianceLevel, setComplianceLevel] = React.useState(null);
    const [dohRequirements, setDohRequirements] = React.useState([]);
    React.useEffect(() => {
        if (!value) {
            setIsValid(null);
            setError(null);
            setComplianceLevel(null);
            setDohRequirements([]);
            return;
        }
        try {
            // Sanitize value to ensure JSON safety
            let sanitizedValue;
            try {
                sanitizedValue = JSON.parse(JSON.stringify(value));
            }
            catch (jsonError) {
                setIsValid(false);
                setError("Invalid data structure");
                setComplianceLevel("critical");
                return;
            }
            // DOH-specific validation
            if (dohCompliance) {
                const dohValidationResult = validateDOHCompliance(field, sanitizedValue);
                setComplianceLevel(dohValidationResult.level);
                setDohRequirements(dohValidationResult.requirements);
                if (dohValidationResult.level === "critical") {
                    setIsValid(false);
                    setError(dohValidationResult.error || "DOH compliance violation");
                    return;
                }
            }
            // Safely access schema shape with proper validation
            if (!schema || !schema.shape || typeof schema.shape !== "object") {
                console.warn("Invalid schema provided to useRealTimeValidation");
                return;
            }
            const fieldSchema = schema.shape[field];
            if (fieldSchema && typeof fieldSchema.parse === "function") {
                fieldSchema.parse(sanitizedValue);
                setIsValid(true);
                setError(null);
                if (!dohCompliance)
                    setComplianceLevel("passed");
            }
            else {
                console.warn(`Field schema not found for field: ${field}`);
                setIsValid(null);
                setError(null);
            }
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                const errorMessage = err.errors[0]?.message || "Invalid value";
                setIsValid(false);
                setError(errorMessage);
                setComplianceLevel(dohCompliance ? "high" : null);
            }
            else {
                const errorMessage = err instanceof Error ? err.message : "Validation error";
                console.error("Validation error:", errorMessage);
                setIsValid(false);
                setError(errorMessage);
                setComplianceLevel("critical");
            }
        }
    }, [value, schema, field, dohCompliance]);
    return { isValid, error, complianceLevel, dohRequirements };
};
// DOH compliance validation function
const validateDOHCompliance = (field, value) => {
    const dohRules = {
        emiratesId: {
            pattern: /^\d{3}-\d{4}-\d{7}-\d{1}$/,
            requirements: ["Valid Emirates ID format", "Checksum validation"],
            level: "critical",
        },
        medicalRecordNumber: {
            pattern: /^MRN\d{6,10}$/,
            requirements: ["Unique MRN format", "Sequential numbering"],
            level: "high",
        },
        licenseNumber: {
            pattern: /^[A-Z]{2}\d{6}$/,
            requirements: ["DOH license format", "Active license status"],
            level: "critical",
        },
        insurancePolicy: {
            minLength: 5,
            requirements: ["Valid insurance provider", "Active policy status"],
            level: "medium",
        },
    };
    const rule = dohRules[field];
    if (!rule) {
        return { level: "low", requirements: [], error: null };
    }
    if (rule.pattern && !rule.pattern.test(value)) {
        return {
            level: rule.level,
            requirements: rule.requirements,
            error: `Invalid ${field} format according to DOH standards`,
        };
    }
    if (rule.minLength && value.length < rule.minLength) {
        return {
            level: rule.level,
            requirements: rule.requirements,
            error: `${field} must meet minimum length requirements`,
        };
    }
    return {
        level: "passed",
        requirements: rule.requirements,
        error: null,
    };
};
// DOH 2025 Compliance validation schemas
export const DOH2025ValidationSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required for DOH compliance"),
    emiratesId: z
        .string()
        .regex(/^\d{3}-\d{4}-\d{7}-\d{1}$/, "Invalid Emirates ID format per DOH standards"),
    medicalRecordNumber: z
        .string()
        .regex(/^MRN\d{6,10}$/, "MRN must follow DOH format requirements"),
    licenseNumber: z
        .string()
        .regex(/^[A-Z]{2}\d{6}$/, "License number must comply with DOH format"),
    serviceCode: z
        .string()
        .min(3, "Service code required for DOH claims processing"),
    diagnosisCode: z
        .string()
        .regex(/^[A-Z]\d{2}(\.\d{1,2})?$/, "ICD-10 diagnosis code required"),
    procedureCode: z
        .string()
        .regex(/^\d{5}$/, "CPT procedure code must be 5 digits"),
    authorizationNumber: z
        .string()
        .min(8, "Authorization number required for DOH compliance"),
    complianceLevel: z.enum(["critical", "high", "medium", "low", "passed"]),
    validationTimestamp: z.date(),
    dohRequirements: z.array(z.string()),
});
// DOH Patient Safety Taxonomy Validation Schema (CN_19_2025)
export const DOHPatientSafetyTaxonomySchema = z.object({
    level_1: z.string().min(1, "Level 1 (Primary Category) is required"),
    level_2: z.string().min(1, "Level 2 (Subcategory) is required"),
    level_3: z
        .string()
        .min(5, "Level 3 (Specific Type) must be at least 5 characters"),
    level_4: z.string().min(1, "Level 4 (Contributing Factors) is required"),
    level_5: z
        .string()
        .min(10, "Level 5 (Root Cause Analysis) must be at least 10 characters"),
    classification_confidence: z.number().min(0).max(100).optional(),
    auto_classified: z.boolean().optional(),
    manual_review_required: z.boolean().optional(),
    taxonomy_version: z.string().default("CN_19_2025"),
    classification_timestamp: z.string().optional(),
    classified_by: z.string().optional(),
});
// Enhanced Incident Report Validation with Patient Safety Taxonomy
export const EnhancedIncidentReportValidationSchema = z.object({
    incident_id: z.string().min(1, "Incident ID is required"),
    incident_type: z.enum([
        "safety",
        "quality",
        "equipment",
        "medication",
        "patient_fall",
        "infection",
        "clinical_care",
        "documentation",
        "communication",
        "behavioral",
        "seizure",
        "wound_care",
        "respiratory",
        "feeding",
        "other",
    ]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    description: z
        .string()
        .min(20, "Incident description must be at least 20 characters"),
    doh_taxonomy: DOHPatientSafetyTaxonomySchema,
    patient_safety_impact: z.object({
        severity_level: z.enum([
            "no_harm",
            "mild_harm",
            "moderate_harm",
            "severe_harm",
            "death",
        ]),
        harm_description: z.string().min(1, "Harm description is required"),
        preventability_score: z.number().min(1).max(5),
        learning_opportunity: z.boolean(),
        system_failure_indicators: z.array(z.string()),
    }),
    doh_reportable: z.boolean(),
    whistleblowing_eligible: z.boolean(),
    // Enhanced medical records integration
    medical_record_number: z.string().optional(),
    patient_demographics: z
        .object({
        age: z.number().min(0).max(150),
        gender: z.enum(["male", "female"]),
        nationality: z.string().min(1),
    })
        .optional(),
    clinical_context: z
        .object({
        primary_diagnosis: z.string().optional(),
        current_medications: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        chronic_conditions: z.array(z.string()).optional(),
    })
        .optional(),
    vital_signs_at_incident: z
        .object({
        temperature: z.number().optional(),
        pulse: z.number().optional(),
        blood_pressure: z.string().optional(),
        respiratory_rate: z.number().optional(),
        oxygen_saturation: z.number().optional(),
    })
        .optional(),
});
// Medical Records Validation Schemas
export const VitalSignsValidationSchema = z.object({
    temperature: z.number().min(30).max(45).optional(),
    pulse: z.number().min(30).max(200).optional(),
    blood_pressure: z
        .string()
        .regex(/^\d{2,3}\/\d{2,3}$/)
        .optional(),
    respiratory_rate: z.number().min(8).max(40).optional(),
    oxygen_saturation: z.number().min(70).max(100).optional(),
    weight: z.number().min(0.5).max(500).optional(),
    height: z.number().min(30).max(250).optional(),
    pain_level: z.number().min(0).max(10).optional(),
    recorded_by: z.string().min(1, "Healthcare provider name is required"),
    recording_time: z.string().min(1, "Recording time is required"),
});
export const MedicationAdministrationValidationSchema = z.object({
    medication_name: z.string().min(1, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    route: z.enum(["oral", "enteral", "iv", "im", "sc", "topical", "inhalation"]),
    frequency: z.enum(["OD", "BID", "TID", "QID", "PRN", "STAT"]),
    administered_by: z.string().min(1, "Administrator name is required"),
    administration_time: z.string().min(1, "Administration time is required"),
    patient_response: z.string().optional(),
    side_effects: z.string().optional(),
    witnessed_by: z.string().optional(),
});
export const SeizureMonitoringValidationSchema = z.object({
    onset_time: z.string().min(1, "Onset time is required"),
    duration: z.string().min(1, "Duration is required"),
    seizure_type: z.enum([
        "tonic",
        "clonic",
        "tonic-clonic",
        "absence",
        "myoclonic",
        "atonic",
        "focal",
        "unknown",
    ]),
    description: z.string().min(10, "Detailed description is required"),
    triggering_factors: z.string().optional(),
    interventions: z.string().optional(),
    post_seizure_status: z.string().optional(),
    witnessed_by: z.string().min(1, "Witness name is required"),
    recorded_by: z.string().min(1, "Recorder name is required"),
});
export const WoundAssessmentValidationSchema = z.object({
    location: z.string().min(1, "Wound location is required"),
    size: z.object({
        length: z.number().min(0),
        width: z.number().min(0),
        depth: z.number().min(0).optional(),
    }),
    stage: z.enum(["stage1", "stage2", "stage3", "stage4", "unstageable", "dti"]),
    appearance: z.string().min(1, "Wound appearance description is required"),
    drainage: z.enum(["none", "minimal", "moderate", "heavy"]),
    treatment: z.string().min(1, "Treatment description is required"),
    healing_progress: z.string().optional(),
    photograph_taken: z.boolean(),
    assessed_by: z.string().min(1, "Assessor name is required"),
    assessment_date: z.string().min(1, "Assessment date is required"),
});
export const EnhancedClinicalFormValidationSchema = ClinicalFormValidationSchema.extend({
    dohComplianceCheck: z.boolean().default(true),
    authorizationStatus: z.enum(["pending", "approved", "denied", "expired"]),
    qualityMetrics: z.object({
        completeness: z.number().min(0).max(100),
        accuracy: z.number().min(0).max(100),
        timeliness: z.number().min(0).max(100),
    }),
    complianceFlags: z.array(z.object({
        type: z.enum(["critical", "warning", "info"]),
        message: z.string(),
        requirement: z.string(),
        remediation: z.string(),
    })),
});
// Validation utilities with enhanced JSON safety and DOH compliance
export const ValidationUtils = {
    // JSON structure validation
    validateJsonStructure: (data) => {
        try {
            JSON.parse(JSON.stringify(data));
            return true;
        }
        catch (error) {
            return false;
        }
    },
    // Safe data sanitization
    sanitizeData: (data) => {
        try {
            return JSON.parse(JSON.stringify(data));
        }
        catch (error) {
            console.error("Data sanitization failed:", error);
            return null;
        }
    },
    // Emirates ID validation
    validateEmiratesId: (id) => {
        if (!id || typeof id !== "string")
            return false;
        const regex = /^\d{3}-\d{4}-\d{7}-\d{1}$/;
        if (!regex.test(id))
            return false;
        // Additional checksum validation could be added here
        return true;
    },
    // UAE phone number validation
    validateUAEPhone: (phone) => {
        if (!phone || typeof phone !== "string")
            return false;
        const regex = /^\+971[0-9]{9}$/;
        return regex.test(phone);
    },
    // Medical record number validation
    validateMRN: (mrn) => {
        if (!mrn || typeof mrn !== "string")
            return false;
        const regex = /^MRN\d{6,10}$/;
        return regex.test(mrn);
    },
    // Insurance policy validation
    validateInsurancePolicy: (policy) => {
        if (!policy || typeof policy !== "string")
            return false;
        // Basic format validation - can be customized per provider
        return policy.length >= 5 && policy.length <= 20;
    },
    // Medication dosage validation
    validateDosage: (dosage) => {
        if (!dosage || typeof dosage !== "string")
            return false;
        const regex = /^\d+(\.\d+)?\s*(mg|g|ml|units?|tablets?)$/i;
        return regex.test(dosage);
    },
    // Blood pressure validation
    validateBloodPressure: (bp) => {
        if (!bp || typeof bp !== "string")
            return false;
        const regex = /^\d{2,3}\/\d{2,3}$/;
        if (!regex.test(bp))
            return false;
        const [systolic, diastolic] = bp.split("/").map(Number);
        return (systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150);
    },
    // Temperature validation (Celsius)
    validateTemperature: (temp) => {
        if (typeof temp !== "number" || isNaN(temp))
            return false;
        return temp >= 35 && temp <= 42;
    },
    // Heart rate validation
    validateHeartRate: (hr) => {
        if (typeof hr !== "number" || isNaN(hr))
            return false;
        return hr >= 30 && hr <= 200;
    },
    // Oxygen saturation validation
    validateOxygenSaturation: (spo2) => {
        if (typeof spo2 !== "number" || isNaN(spo2))
            return false;
        return spo2 >= 70 && spo2 <= 100;
    },
    // DOH 2025 specific validations
    validateDOHAuthorization: (authNumber) => {
        if (!authNumber || typeof authNumber !== "string")
            return false;
        const regex = /^AUTH\d{8}$/;
        return regex.test(authNumber);
    },
    validateServiceCode: (code) => {
        if (!code || typeof code !== "string")
            return false;
        const regex = /^[A-Z]{2}\d{3}$/;
        return regex.test(code);
    },
    validateComplianceLevel: (level) => {
        const validLevels = ["critical", "high", "medium", "low", "passed"];
        return validLevels.includes(level);
    },
    // DOH Patient Safety Taxonomy Validations (CN_19_2025)
    validatePatientSafetyTaxonomy: (taxonomy) => {
        const errors = [];
        let completeness = 0;
        // Validate required levels
        const requiredLevels = [
            "level_1",
            "level_2",
            "level_3",
            "level_4",
            "level_5",
        ];
        requiredLevels.forEach((level) => {
            if (taxonomy[level] && taxonomy[level].trim().length > 0) {
                completeness += 20;
            }
            else {
                errors.push(`${level.replace("_", " ")} is required for DOH compliance`);
            }
        });
        // Validate Level 1 categories
        const validLevel1Categories = [
            "Patient Care",
            "Medication/IV Fluids",
            "Medical Device/Equipment",
            "Patient Protection",
            "Care Management",
            "Clinical Process/Procedure",
            "Documentation",
            "Infection Control",
            "Blood/Blood Products",
            "Nutrition",
            "Oxygen/Gas/Vapour",
            "Healthcare-associated Infection",
            "Surgery/Anaesthesia/Sedation",
            "Diagnostic/Screening/Prevention",
            "Rehabilitation/Therapy",
            "Discharge/Transfer",
        ];
        if (taxonomy.level_1 && !validLevel1Categories.includes(taxonomy.level_1)) {
            errors.push(`Invalid Level 1 category. Must be from DOH approved list.`);
        }
        // Validate minimum character requirements
        if (taxonomy.level_3 && taxonomy.level_3.length < 5) {
            errors.push("Level 3 description must be at least 5 characters");
        }
        if (taxonomy.level_5 && taxonomy.level_5.length < 10) {
            errors.push("Level 5 root cause analysis must be at least 10 characters");
        }
        // Validate taxonomy version
        if (taxonomy.taxonomy_version &&
            taxonomy.taxonomy_version !== "CN_19_2025") {
            errors.push("Taxonomy version must be CN_19_2025 for current DOH compliance");
        }
        return {
            isValid: errors.length === 0 && completeness === 100,
            errors,
            completeness,
        };
    },
    validatePatientSafetyImpact: (impact) => {
        const errors = [];
        const validSeverityLevels = [
            "no_harm",
            "mild_harm",
            "moderate_harm",
            "severe_harm",
            "death",
        ];
        if (!impact.severity_level ||
            !validSeverityLevels.includes(impact.severity_level)) {
            errors.push("Valid severity level is required");
        }
        if (!impact.harm_description ||
            impact.harm_description.trim().length === 0) {
            errors.push("Harm description is required");
        }
        if (typeof impact.preventability_score !== "number" ||
            impact.preventability_score < 1 ||
            impact.preventability_score > 5) {
            errors.push("Preventability score must be between 1 and 5");
        }
        if (typeof impact.learning_opportunity !== "boolean") {
            errors.push("Learning opportunity flag is required");
        }
        if (!Array.isArray(impact.system_failure_indicators)) {
            errors.push("System failure indicators must be an array");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    },
    validateIncidentClassificationCompleteness: (incident) => {
        const missingElements = [];
        let completeness = 0;
        // Check DOH taxonomy (40% weight)
        if (incident.doh_taxonomy) {
            const taxonomyValidation = ValidationUtils.validatePatientSafetyTaxonomy(incident.doh_taxonomy);
            completeness += (taxonomyValidation.completeness * 0.4) / 100;
            if (!taxonomyValidation.isValid) {
                missingElements.push(...taxonomyValidation.errors);
            }
        }
        else {
            missingElements.push("DOH Patient Safety Taxonomy classification missing");
        }
        // Check patient safety impact (30% weight)
        if (incident.patient_safety_impact) {
            const impactValidation = ValidationUtils.validatePatientSafetyImpact(incident.patient_safety_impact);
            if (impactValidation.isValid) {
                completeness += 30;
            }
            else {
                missingElements.push(...impactValidation.errors);
            }
        }
        else {
            missingElements.push("Patient safety impact assessment missing");
        }
        // Check basic incident information (30% weight)
        const requiredFields = [
            "incident_id",
            "incident_type",
            "severity",
            "description",
        ];
        let basicInfoComplete = 0;
        requiredFields.forEach((field) => {
            if (incident[field] && incident[field].toString().trim().length > 0) {
                basicInfoComplete += 7.5; // 30% / 4 fields
            }
            else {
                missingElements.push(`${field.replace("_", " ")} is required`);
            }
        });
        completeness += basicInfoComplete;
        // Determine compliance level
        let complianceLevel;
        if (completeness >= 95) {
            complianceLevel = "excellent";
        }
        else if (completeness >= 80) {
            complianceLevel = "good";
        }
        else if (completeness >= 60) {
            complianceLevel = "acceptable";
        }
        else {
            complianceLevel = "needs_improvement";
        }
        return {
            completeness: Math.round(completeness),
            missingElements,
            complianceLevel,
        };
    },
    validateDOHTimestamp: (timestamp) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            return hoursDiff <= 24; // Must be within 24 hours for DOH compliance
        }
        catch {
            return false;
        }
    },
    // Enhanced compliance checking
    checkDOHCompliance: (data) => {
        const violations = [];
        const requirements = [];
        // Check required DOH fields
        if (!data.emiratesId ||
            !ValidationUtils.validateEmiratesId(data.emiratesId)) {
            violations.push("Invalid or missing Emirates ID");
            requirements.push("Valid Emirates ID in format XXX-XXXX-XXXXXXX-X");
        }
        if (!data.licenseNumber ||
            !ValidationUtils.validateServiceCode(data.licenseNumber)) {
            violations.push("Invalid or missing license number");
            requirements.push("Valid DOH license number");
        }
        if (!data.authorizationNumber ||
            !ValidationUtils.validateDOHAuthorization(data.authorizationNumber)) {
            violations.push("Invalid or missing authorization number");
            requirements.push("Valid DOH authorization number");
        }
        // Determine compliance level
        let level;
        if (violations.length === 0) {
            level = "passed";
        }
        else if (violations.some((v) => v.includes("Emirates ID") || v.includes("authorization"))) {
            level = "critical";
        }
        else if (violations.length > 2) {
            level = "high";
        }
        else if (violations.length > 1) {
            level = "medium";
        }
        else {
            level = "low";
        }
        return {
            isCompliant: violations.length === 0,
            level,
            violations,
            requirements,
        };
    },
};
export const ValidationSummary = ({ errors, className, }) => {
    const errorCount = Object.keys(errors).length;
    if (errorCount === 0)
        return null;
    return (_jsxs("div", { className: cn("bg-red-50 border border-red-200 rounded-lg p-4", className), children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs("h4", { className: "font-medium text-red-800", children: ["Please fix ", errorCount, " error", errorCount > 1 ? "s" : "", " before continuing:"] })] }), _jsx("ul", { className: "list-disc list-inside space-y-1 text-sm text-red-700", children: Object.entries(errors).map(([field, error]) => (_jsxs("li", { children: [_jsxs("strong", { children: [field, ":"] }), " ", error?.message] }, field))) })] }));
};
export default {
    PatientValidationSchema,
    ClinicalFormValidationSchema,
    DamanAuthorizationSchema,
    ValidationError,
    ValidationSuccess,
    ValidationInfo,
    ValidatedField,
    useRealTimeValidation,
    ValidationUtils,
    ValidationSummary,
};
