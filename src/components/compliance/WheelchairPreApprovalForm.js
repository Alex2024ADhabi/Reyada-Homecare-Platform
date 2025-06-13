import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, FileText, Upload, Calendar, User, Shield, Wheelchair, Clock, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const WHEELCHAIR_TYPES = [
    "Manual Standard Wheelchair",
    "Manual Lightweight Wheelchair",
    "Electric Powered Wheelchair",
    "Standing Wheelchair",
    "Sports/Recreation Wheelchair",
    "Pediatric Wheelchair",
    "Bariatric Wheelchair",
    "Tilt-in-Space Wheelchair",
];
const SPECIAL_FEATURES = [
    "Pressure Relief Cushion",
    "Elevating Leg Rests",
    "Removable Armrests",
    "Anti-Tip Wheels",
    "Adjustable Footrests",
    "Reclining Backrest",
    "Headrest Support",
    "Lateral Support",
    "Chest Harness",
    "Oxygen Tank Holder",
    "Cup Holder",
    "Storage Bag",
    "Weather Protection",
    "Quick Release Wheels",
];
export default function WheelchairPreApprovalForm({ patientId = "", onFormComplete, className, }) {
    const [formData, setFormData] = useState({
        patientId,
        patientName: "",
        emiratesId: "",
        damanInsuranceNumber: "",
        dateOfBirth: "",
        contactNumber: "",
        primaryDiagnosis: "",
        icd10Code: "",
        functionalAssessment: "",
        mobilityLimitations: "",
        currentMobilityAids: "",
        assessmentDate: new Date().toISOString().split("T")[0],
        assessingProfessional: "",
        professionalType: "physiotherapist",
        licenseNumber: "",
        facilityName: "",
        wheelchairType: "",
        wheelchairBrand: "",
        wheelchairModel: "",
        specialFeatures: [],
        estimatedCost: 0,
        seatDimensions: {
            width: "",
            depth: "",
            height: "",
        },
        medicalNecessity: "",
        functionalGoals: "",
        alternativesConsidered: "",
        expectedOutcomes: "",
        warrantyDocumentation: false,
        technicalSpecifications: false,
        medicalReportAttached: false,
        medicalReportDate: "",
        professionalSignature: false,
        professionalSignatureDate: "",
        physicianApproval: false,
        physicianName: "",
        physicianSignatureDate: "",
        formVersion: "2025.1",
        submissionDate: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days validity
        formStatus: "draft",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [activeSection, setActiveSection] = useState("patient");
    // Enhanced validation for wheelchair pre-approval (Effective May 1, 2025)
    const validateForm = () => {
        const errors = [];
        const effectiveDate = new Date("2025-05-01");
        const currentDate = new Date();
        // OpenJet integration validation
        if (!formData.openJetIntegration) {
            errors.push("OpenJet system integration is required for homecare allocation");
        }
        // Face-to-face form completion workflow validation
        if (!formData.faceToFaceCompleted) {
            errors.push("Face-to-face assessment form must be completed");
        }
        // Check if form is required (effective May 1, 2025)
        if (currentDate >= effectiveDate) {
            // Patient Information Validation
            if (!formData.patientId)
                errors.push("Patient ID is required");
            if (!formData.patientName)
                errors.push("Patient name is required");
            if (!formData.emiratesId)
                errors.push("Emirates ID is required");
            if (!formData.damanInsuranceNumber)
                errors.push("Daman insurance number is required");
            if (!formData.dateOfBirth)
                errors.push("Date of birth is required");
            if (!formData.contactNumber)
                errors.push("Contact number is required");
            // Clinical Assessment Validation
            if (!formData.primaryDiagnosis)
                errors.push("Primary diagnosis is required");
            if (!formData.icd10Code)
                errors.push("ICD-10 code is required");
            if (!formData.functionalAssessment ||
                formData.functionalAssessment.length < 50) {
                errors.push("Functional assessment must be at least 50 characters");
            }
            if (!formData.mobilityLimitations)
                errors.push("Mobility limitations must be documented");
            // Assessment date validation (not older than 30 days)
            if (formData.assessmentDate) {
                const assessmentDate = new Date(formData.assessmentDate);
                const daysDiff = Math.floor((currentDate.getTime() - assessmentDate.getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysDiff > 30) {
                    errors.push("Assessment date cannot be older than 30 days");
                }
            }
            // Professional Information Validation
            if (!formData.assessingProfessional)
                errors.push("Assessing professional name is required");
            if (!formData.licenseNumber)
                errors.push("Professional license number is required");
            if (!formData.facilityName)
                errors.push("Facility name is required");
            // Wheelchair Specifications Validation
            if (!formData.wheelchairType)
                errors.push("Wheelchair type must be selected");
            if (!formData.wheelchairBrand)
                errors.push("Wheelchair brand is required");
            if (!formData.wheelchairModel)
                errors.push("Wheelchair model is required");
            if (formData.estimatedCost <= 0)
                errors.push("Estimated cost must be greater than zero");
            if (!formData.seatDimensions.width || !formData.seatDimensions.depth) {
                errors.push("Seat dimensions (width and depth) are required");
            }
            // Clinical Justification Validation (Enhanced requirements)
            if (!formData.medicalNecessity ||
                formData.medicalNecessity.length < 100) {
                errors.push("Medical necessity justification must be at least 100 characters");
            }
            if (!formData.functionalGoals)
                errors.push("Functional goals must be specified");
            if (!formData.alternativesConsidered)
                errors.push("Alternatives considered must be documented");
            if (!formData.expectedOutcomes)
                errors.push("Expected outcomes must be described");
            // Required elements in medical necessity
            const requiredElements = [
                "diagnosis",
                "functional",
                "mobility",
                "necessity",
            ];
            const missingElements = requiredElements.filter((element) => !formData.medicalNecessity.toLowerCase().includes(element));
            if (missingElements.length > 0) {
                errors.push(`Medical necessity missing required elements: ${missingElements.join(", ")}`);
            }
            // Documentation Requirements (Mandatory from May 1, 2025)
            if (!formData.warrantyDocumentation) {
                errors.push("Wheelchair brand warranty documentation is mandatory");
            }
            if (!formData.technicalSpecifications) {
                errors.push("Technical specifications document is required");
            }
            if (!formData.medicalReportAttached) {
                errors.push("Updated medical report is required");
            }
            // Medical report age validation (not older than 3 months)
            if (formData.medicalReportDate) {
                const reportDate = new Date(formData.medicalReportDate);
                const daysSinceReport = Math.floor((currentDate.getTime() - reportDate.getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysSinceReport > 90) {
                    errors.push("Medical report must not be older than 3 months");
                }
            }
            // Professional Signatures Validation (Mandatory from May 1, 2025)
            if (!formData.professionalSignature) {
                errors.push("Professional signature is required (Physiotherapist, OT, Rehabilitation Specialist, or Consultant)");
            }
            if (!formData.professionalSignatureDate) {
                errors.push("Professional signature date is required");
            }
            if (!formData.physicianApproval) {
                errors.push("Physician approval is required");
            }
            if (!formData.physicianName) {
                errors.push("Physician name is required");
            }
            // ICD-10 Format Validation
            const icd10Pattern = /^[A-Z][0-9]{2}(\.[0-9X]{1,4})?$/;
            if (formData.icd10Code && !icd10Pattern.test(formData.icd10Code)) {
                errors.push("ICD-10 code format is invalid (e.g., M79.3)");
            }
            // Form Validity Check (1 month validity period)
            const submissionDate = new Date(formData.submissionDate);
            const expiryDate = new Date(submissionDate);
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            if (currentDate > expiryDate) {
                errors.push("Form has expired. Wheelchair pre-approval forms are valid for 1 month only");
            }
        }
        return errors;
    };
    const handleSubmit = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setValidationErrors(errors);
            toast({
                title: "Validation Errors",
                description: `${errors.length} issues found. Please review and fix.`,
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Enhanced form submission with comprehensive data validation
            const formId = `WPA-${Date.now()}`;
            const currentDate = new Date();
            const validUntilDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            // Create sanitized form data to prevent JSON serialization errors
            const sanitizedFormData = {
                // Patient Information
                patientId: String(formData.patientId || ""),
                patientName: String(formData.patientName || ""),
                emiratesId: String(formData.emiratesId || ""),
                damanInsuranceNumber: String(formData.damanInsuranceNumber || ""),
                dateOfBirth: String(formData.dateOfBirth || ""),
                contactNumber: String(formData.contactNumber || ""),
                // Clinical Assessment
                primaryDiagnosis: String(formData.primaryDiagnosis || ""),
                icd10Code: String(formData.icd10Code || ""),
                functionalAssessment: String(formData.functionalAssessment || ""),
                mobilityLimitations: String(formData.mobilityLimitations || ""),
                currentMobilityAids: String(formData.currentMobilityAids || ""),
                assessmentDate: String(formData.assessmentDate || currentDate.toISOString().split("T")[0]),
                // Professional Information
                assessingProfessional: String(formData.assessingProfessional || ""),
                professionalType: [
                    "physiotherapist",
                    "occupational_therapist",
                    "rehabilitation_specialist",
                    "consultant",
                ].includes(formData.professionalType)
                    ? formData.professionalType
                    : "physiotherapist",
                licenseNumber: String(formData.licenseNumber || ""),
                facilityName: String(formData.facilityName || ""),
                // Wheelchair Specifications
                wheelchairType: String(formData.wheelchairType || ""),
                wheelchairBrand: String(formData.wheelchairBrand || ""),
                wheelchairModel: String(formData.wheelchairModel || ""),
                specialFeatures: Array.isArray(formData.specialFeatures)
                    ? formData.specialFeatures
                    : [],
                estimatedCost: Math.max(0, Number(formData.estimatedCost) || 0),
                seatDimensions: {
                    width: String(formData.seatDimensions?.width || ""),
                    depth: String(formData.seatDimensions?.depth || ""),
                    height: String(formData.seatDimensions?.height || ""),
                },
                // Clinical Justification
                medicalNecessity: String(formData.medicalNecessity || ""),
                functionalGoals: String(formData.functionalGoals || ""),
                alternativesConsidered: String(formData.alternativesConsidered || ""),
                expectedOutcomes: String(formData.expectedOutcomes || ""),
                // Documentation
                warrantyDocumentation: Boolean(formData.warrantyDocumentation),
                technicalSpecifications: Boolean(formData.technicalSpecifications),
                medicalReportAttached: Boolean(formData.medicalReportAttached),
                medicalReportDate: String(formData.medicalReportDate || ""),
                // Signatures
                professionalSignature: Boolean(formData.professionalSignature),
                professionalSignatureDate: String(formData.professionalSignatureDate || ""),
                physicianApproval: Boolean(formData.physicianApproval),
                physicianName: String(formData.physicianName || ""),
                physicianSignatureDate: String(formData.physicianSignatureDate || ""),
                // Form Metadata
                formId,
                formVersion: String(formData.formVersion || "2025.1"),
                submissionDate: currentDate.toISOString(),
                validUntil: validUntilDate.toISOString(),
                formStatus: "completed",
                // Compliance tracking
                damanCompliance: {
                    effectiveDate: "2025-05-01",
                    replacesForm: "PT Form",
                    validityPeriod: "30 days",
                    requiredSignatures: ["professional", "physician"],
                    mandatoryDocuments: ["warranty", "technical_specs", "medical_report"],
                },
            };
            // Simulate API submission with enhanced error handling
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        // Validate the sanitized data can be serialized to JSON
                        JSON.stringify(sanitizedFormData);
                        resolve(sanitizedFormData);
                    }
                    catch (jsonError) {
                        reject(new Error(`JSON serialization failed: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
                    }
                }, 2000);
            });
            // Update form state with sanitized data
            setFormData((prev) => ({
                ...prev,
                ...sanitizedFormData,
                formStatus: "completed",
            }));
            toast({
                title: "Wheelchair Pre-approval Completed",
                description: `Form ${formId} completed successfully. Valid for 30 days. Ready for Daman submission.`,
            });
            if (onFormComplete) {
                onFormComplete(sanitizedFormData);
            }
            setValidationErrors([]);
        }
        catch (error) {
            console.error("Form submission error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast({
                title: "Submission Failed",
                description: `Failed to complete wheelchair pre-approval form: ${errorMessage}. Please try again.`,
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const toggleSpecialFeature = (feature) => {
        setFormData((prev) => ({
            ...prev,
            specialFeatures: prev.specialFeatures.includes(feature)
                ? prev.specialFeatures.filter((f) => f !== feature)
                : [...prev.specialFeatures, feature],
        }));
    };
    const updateFormData = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const updateNestedFormData = (parent, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value,
            },
        }));
    };
    return (_jsxs("div", { className: `bg-white space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Wheelchair, { className: "w-6 h-6 mr-2 text-blue-600" }), "Wheelchair Pre-approval Form (2025)"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Mandatory for wheelchair requests (Effective May 1, 2025) - PT form no longer accepted" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700", children: "Valid for 30 Days" }), _jsx(Badge, { className: "text-orange-600 bg-orange-100", children: "Effective May 1, 2025" }), _jsx(Badge, { className: formData.formStatus === "completed"
                                    ? "text-green-600 bg-green-100"
                                    : "text-yellow-600 bg-yellow-100", children: formData.formStatus.toUpperCase() })] })] }), _jsxs(Alert, { className: "bg-orange-50 border-orange-200", children: [_jsx(Calendar, { className: "h-4 w-4 text-orange-600" }), _jsx(AlertTitle, { className: "text-orange-800", children: "New Requirement - Effective May 1, 2025" }), _jsx(AlertDescription, { className: "text-orange-700", children: _jsxs("ul", { className: "list-disc list-inside space-y-1 mt-2", children: [_jsx("li", { children: "Wheelchair pre-approval form is now mandatory for all wheelchair authorization requests" }), _jsx("li", { children: "PT (physiotherapy) form is no longer accepted" }), _jsx("li", { children: "Form validity period is limited to 1 month from assessment date" }), _jsx("li", { children: "Professional signatures from qualified therapists or consultants are required" }), _jsx("li", { children: "Wheelchair brand warranty documentation is mandatory" }), _jsx("li", { children: "Updated medical report (not older than 3 months) must be attached" })] }) })] }), _jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center", children: [_jsx(Clock, { className: "w-4 h-4 mr-2" }), "Form Validity Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Form Version:" }), " ", formData.formVersion] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Valid Until:" }), " ", new Date(formData.validUntil).toLocaleDateString()] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Days Remaining:" }), Math.max(0, Math.ceil((new Date(formData.validUntil).getTime() -
                                            new Date().getTime()) /
                                            (1000 * 60 * 60 * 24)))] })] }) })] }), _jsx("div", { className: "flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg", children: [
                    { id: "patient", label: "Patient Info" },
                    { id: "clinical", label: "Clinical Assessment" },
                    { id: "professional", label: "Professional Info" },
                    { id: "wheelchair", label: "Wheelchair Specs" },
                    { id: "justification", label: "Clinical Justification" },
                    { id: "documentation", label: "Documentation" },
                    { id: "signatures", label: "Signatures" },
                ].map((section) => (_jsx("button", { onClick: () => setActiveSection(section.id), className: `px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === section.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"}`, children: section.label }, section.id))) }), activeSection === "patient" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(User, { className: "w-5 h-5 mr-2" }), "Patient Information"] }), _jsx(CardDescription, { children: "Complete patient demographics and insurance details" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "patientId", children: "Patient ID *" }), _jsx(Input, { id: "patientId", value: formData.patientId, onChange: (e) => updateFormData("patientId", e.target.value), placeholder: "Enter patient ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patientName", children: "Patient Full Name *" }), _jsx(Input, { id: "patientName", value: formData.patientName, onChange: (e) => updateFormData("patientName", e.target.value), placeholder: "Enter patient full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emiratesId", children: "Emirates ID *" }), _jsx(Input, { id: "emiratesId", value: formData.emiratesId, onChange: (e) => updateFormData("emiratesId", e.target.value), placeholder: "xxx-xxxx-xxxxxxx-x" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "damanInsuranceNumber", children: "Daman Insurance Number *" }), _jsx(Input, { id: "damanInsuranceNumber", value: formData.damanInsuranceNumber, onChange: (e) => updateFormData("damanInsuranceNumber", e.target.value), placeholder: "Enter Daman insurance number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dateOfBirth", children: "Date of Birth *" }), _jsx(Input, { id: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: (e) => updateFormData("dateOfBirth", e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contactNumber", children: "Contact Number *" }), _jsx(Input, { id: "contactNumber", value: formData.contactNumber, onChange: (e) => updateFormData("contactNumber", e.target.value), placeholder: "+971 xx xxx xxxx" })] })] }) })] })), activeSection === "clinical" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "Clinical Assessment"] }), _jsx(CardDescription, { children: "Medical condition and functional assessment details" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "primaryDiagnosis", children: "Primary Diagnosis *" }), _jsx(Input, { id: "primaryDiagnosis", value: formData.primaryDiagnosis, onChange: (e) => updateFormData("primaryDiagnosis", e.target.value), placeholder: "Enter primary diagnosis" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "icd10Code", children: "ICD-10 Code *" }), _jsx(Input, { id: "icd10Code", value: formData.icd10Code, onChange: (e) => updateFormData("icd10Code", e.target.value), placeholder: "e.g., M79.3" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "assessmentDate", children: "Assessment Date *" }), _jsx(Input, { id: "assessmentDate", type: "date", value: formData.assessmentDate, onChange: (e) => updateFormData("assessmentDate", e.target.value) }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Assessment must not be older than 30 days" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "functionalAssessment", children: "Functional Assessment * (Minimum 50 characters)" }), _jsx(Textarea, { id: "functionalAssessment", value: formData.functionalAssessment, onChange: (e) => updateFormData("functionalAssessment", e.target.value), placeholder: "Describe patient's current functional status, capabilities, and limitations in detail...", rows: 4 }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [formData.functionalAssessment.length, "/50 characters minimum"] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "mobilityLimitations", children: "Mobility Limitations *" }), _jsx(Textarea, { id: "mobilityLimitations", value: formData.mobilityLimitations, onChange: (e) => updateFormData("mobilityLimitations", e.target.value), placeholder: "Detail specific mobility limitations and restrictions that require wheelchair assistance...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "currentMobilityAids", children: "Current Mobility Aids" }), _jsx(Input, { id: "currentMobilityAids", value: formData.currentMobilityAids, onChange: (e) => updateFormData("currentMobilityAids", e.target.value), placeholder: "List current mobility aids (walker, cane, crutches, etc.)" })] })] })] })), activeSection === "professional" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "Professional Information"] }), _jsx(CardDescription, { children: "Assessing professional details and credentials" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "assessingProfessional", children: "Assessing Professional Name *" }), _jsx(Input, { id: "assessingProfessional", value: formData.assessingProfessional, onChange: (e) => updateFormData("assessingProfessional", e.target.value), placeholder: "Enter professional full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "professionalType", children: "Professional Type *" }), _jsxs(Select, { value: formData.professionalType, onValueChange: (value) => updateFormData("professionalType", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select professional type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "physiotherapist", children: "Physiotherapist" }), _jsx(SelectItem, { value: "occupational_therapist", children: "Occupational Therapist" }), _jsx(SelectItem, { value: "rehabilitation_specialist", children: "Rehabilitation Specialist" }), _jsx(SelectItem, { value: "consultant", children: "Consultant" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "licenseNumber", children: "License Number *" }), _jsx(Input, { id: "licenseNumber", value: formData.licenseNumber, onChange: (e) => updateFormData("licenseNumber", e.target.value), placeholder: "Enter professional license number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "facilityName", children: "Facility Name *" }), _jsx(Input, { id: "facilityName", value: formData.facilityName, onChange: (e) => updateFormData("facilityName", e.target.value), placeholder: "Enter facility/clinic name" })] })] }) })] })), activeSection === "wheelchair" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Wheelchair, { className: "w-5 h-5 mr-2" }), "Wheelchair Specifications"] }), _jsx(CardDescription, { children: "Detailed wheelchair requirements and specifications" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "wheelchairType", children: "Wheelchair Type *" }), _jsxs(Select, { value: formData.wheelchairType, onValueChange: (value) => updateFormData("wheelchairType", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select wheelchair type" }) }), _jsx(SelectContent, { children: WHEELCHAIR_TYPES.map((type) => (_jsx(SelectItem, { value: type, children: type }, type))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "estimatedCost", children: "Estimated Cost (AED) *" }), _jsx(Input, { id: "estimatedCost", type: "number", value: formData.estimatedCost, onChange: (e) => updateFormData("estimatedCost", parseFloat(e.target.value) || 0), placeholder: "Enter estimated cost", min: "0" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "wheelchairBrand", children: "Wheelchair Brand *" }), _jsx(Input, { id: "wheelchairBrand", value: formData.wheelchairBrand, onChange: (e) => updateFormData("wheelchairBrand", e.target.value), placeholder: "Enter wheelchair brand" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "wheelchairModel", children: "Wheelchair Model *" }), _jsx(Input, { id: "wheelchairModel", value: formData.wheelchairModel, onChange: (e) => updateFormData("wheelchairModel", e.target.value), placeholder: "Enter wheelchair model" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Seat Dimensions (cm) *" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-2", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "seatWidth", children: "Width *" }), _jsx(Input, { id: "seatWidth", value: formData.seatDimensions.width, onChange: (e) => updateNestedFormData("seatDimensions", "width", e.target.value), placeholder: "e.g., 45" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "seatDepth", children: "Depth *" }), _jsx(Input, { id: "seatDepth", value: formData.seatDimensions.depth, onChange: (e) => updateNestedFormData("seatDimensions", "depth", e.target.value), placeholder: "e.g., 40" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "seatHeight", children: "Height" }), _jsx(Input, { id: "seatHeight", value: formData.seatDimensions.height, onChange: (e) => updateNestedFormData("seatDimensions", "height", e.target.value), placeholder: "e.g., 50" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Special Features" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 mt-2", children: SPECIAL_FEATURES.map((feature) => (_jsx(Button, { variant: formData.specialFeatures.includes(feature)
                                                ? "default"
                                                : "outline", size: "sm", onClick: () => toggleSpecialFeature(feature), className: "justify-start h-auto p-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [formData.specialFeatures.includes(feature) ? (_jsx(CheckCircle, { className: "w-3 h-3" })) : (_jsx("div", { className: "w-3 h-3 border border-gray-300 rounded" })), _jsx("span", { className: "text-xs", children: feature })] }) }, feature))) }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Selected features: ", formData.specialFeatures.length] })] })] })] })), activeSection === "justification" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "Clinical Justification"] }), _jsx(CardDescription, { children: "Detailed clinical justification for wheelchair prescription" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "medicalNecessity", children: "Medical Necessity * (Minimum 100 characters)" }), _jsx(Textarea, { id: "medicalNecessity", value: formData.medicalNecessity, onChange: (e) => updateFormData("medicalNecessity", e.target.value), placeholder: "Provide comprehensive medical necessity justification including diagnosis, functional limitations, mobility requirements, and necessity for wheelchair assistance...", rows: 5 }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [formData.medicalNecessity.length, "/100 characters minimum", _jsx("br", {}), "Must include: diagnosis, functional status, mobility needs, necessity"] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "functionalGoals", children: "Functional Goals *" }), _jsx(Textarea, { id: "functionalGoals", value: formData.functionalGoals, onChange: (e) => updateFormData("functionalGoals", e.target.value), placeholder: "Describe specific functional goals and expected improvements with wheelchair use...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "alternativesConsidered", children: "Alternatives Considered *" }), _jsx(Textarea, { id: "alternativesConsidered", value: formData.alternativesConsidered, onChange: (e) => updateFormData("alternativesConsidered", e.target.value), placeholder: "List and explain why alternative mobility aids (walker, cane, crutches, etc.) were considered but deemed unsuitable...", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "expectedOutcomes", children: "Expected Outcomes *" }), _jsx(Textarea, { id: "expectedOutcomes", value: formData.expectedOutcomes, onChange: (e) => updateFormData("expectedOutcomes", e.target.value), placeholder: "Describe expected clinical outcomes, functional improvements, and quality of life benefits...", rows: 3 })] })] })] })), activeSection === "documentation" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Upload, { className: "w-5 h-5 mr-2" }), "Required Documentation"] }), _jsx(CardDescription, { children: "Mandatory documentation for wheelchair authorization (Effective May 1, 2025)" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(FileText, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Required Documents Checklist" }), _jsx(AlertDescription, { className: "text-blue-700", children: "All documents listed below are mandatory for wheelchair authorization requests." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg", children: [_jsx("input", { type: "checkbox", id: "warrantyDocumentation", checked: formData.warrantyDocumentation, onChange: (e) => updateFormData("warrantyDocumentation", e.target.checked), className: "rounded" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "warrantyDocumentation", className: "font-medium", children: "Wheelchair Brand Warranty Documentation *" }), _jsx("p", { className: "text-sm text-gray-600", children: "Official warranty documentation from wheelchair manufacturer" })] }), formData.warrantyDocumentation && (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }))] }), _jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg", children: [_jsx("input", { type: "checkbox", id: "technicalSpecifications", checked: formData.technicalSpecifications, onChange: (e) => updateFormData("technicalSpecifications", e.target.checked), className: "rounded" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "technicalSpecifications", className: "font-medium", children: "Technical Specifications Document *" }), _jsx("p", { className: "text-sm text-gray-600", children: "Detailed technical specifications and features document" })] }), formData.technicalSpecifications && (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }))] }), _jsxs("div", { className: "flex items-center space-x-3 p-3 border rounded-lg", children: [_jsx("input", { type: "checkbox", id: "medicalReportAttached", checked: formData.medicalReportAttached, onChange: (e) => updateFormData("medicalReportAttached", e.target.checked), className: "rounded" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "medicalReportAttached", className: "font-medium", children: "Updated Medical Report *" }), _jsx("p", { className: "text-sm text-gray-600", children: "Medical report from treating physician (not older than 3 months)" }), _jsxs("div", { className: "mt-2", children: [_jsx(Label, { htmlFor: "medicalReportDate", className: "text-sm", children: "Medical Report Date" }), _jsx(Input, { id: "medicalReportDate", type: "date", value: formData.medicalReportDate, onChange: (e) => updateFormData("medicalReportDate", e.target.value), className: "mt-1" })] })] }), formData.medicalReportAttached && (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }))] })] }), _jsxs(Alert, { className: "bg-yellow-50 border-yellow-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsx(AlertTitle, { className: "text-yellow-800", children: "Important Documentation Notes" }), _jsx(AlertDescription, { className: "text-yellow-700", children: _jsxs("ul", { className: "list-disc list-inside space-y-1 mt-2", children: [_jsx("li", { children: "All documents must be current and properly signed/stamped" }), _jsx("li", { children: "Medical reports must not be older than 3 months" }), _jsx("li", { children: "Warranty documentation must be from official manufacturer" }), _jsx("li", { children: "Keep copies of all approval forms in patient records for future reference" }), _jsx("li", { children: "Failure to provide required documentation will result in rejection" })] }) })] })] })] })), activeSection === "signatures" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 mr-2" }), "Professional Signatures & Approvals"] }), _jsx(CardDescription, { children: "Required signatures from qualified professionals (Effective May 1, 2025)" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { className: "bg-green-50 border-green-200", children: [_jsx(Shield, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "Professional Signature Requirements" }), _jsx(AlertDescription, { className: "text-green-700", children: "Signatures must be from qualified physiotherapist, occupational therapist, rehabilitation specialist, or consultant." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx("input", { type: "checkbox", id: "professionalSignature", checked: formData.professionalSignature, onChange: (e) => updateFormData("professionalSignature", e.target.checked), className: "rounded" }), _jsx(Label, { htmlFor: "professionalSignature", className: "font-medium", children: "Professional Signature Required *" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "professionalSignatureDate", children: "Signature Date *" }), _jsx(Input, { id: "professionalSignatureDate", type: "date", value: formData.professionalSignatureDate, onChange: (e) => updateFormData("professionalSignatureDate", e.target.value) })] }) }), _jsxs("p", { className: "text-sm text-gray-600 mt-2", children: ["By checking this box, I confirm that I have assessed the patient and recommend the prescribed wheelchair as medically necessary. Professional:", " ", formData.assessingProfessional || "Not specified", " (", formData.professionalType.replace("_", " ").toUpperCase(), ")"] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [_jsx("input", { type: "checkbox", id: "physicianApproval", checked: formData.physicianApproval, onChange: (e) => updateFormData("physicianApproval", e.target.checked), className: "rounded" }), _jsx(Label, { htmlFor: "physicianApproval", className: "font-medium", children: "Physician Approval Required *" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "physicianName", children: "Physician Name *" }), _jsx(Input, { id: "physicianName", value: formData.physicianName, onChange: (e) => updateFormData("physicianName", e.target.value), placeholder: "Enter approving physician name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "physicianSignatureDate", children: "Approval Date" }), _jsx(Input, { id: "physicianSignatureDate", type: "date", value: formData.physicianSignatureDate, onChange: (e) => updateFormData("physicianSignatureDate", e.target.value) })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "By checking this box, I approve the wheelchair prescription as medically necessary for the patient's condition and functional requirements." })] })] })] })] })), validationErrors.length > 0 && (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs(AlertTitle, { className: "text-red-800", children: ["Validation Errors (", validationErrors.length, ")"] }), _jsx(AlertDescription, { className: "text-red-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: validationErrors.map((error, index) => (_jsx("li", { className: "text-sm", children: error }, index))) }) })] })), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => {
                            const errors = validateForm();
                            setValidationErrors(errors);
                            if (errors.length === 0) {
                                toast({
                                    title: "Validation Successful",
                                    description: "All requirements met. Form is ready for completion.",
                                });
                            }
                            else {
                                toast({
                                    title: "Validation Issues",
                                    description: `${errors.length} issues found. Please review the errors above.`,
                                    variant: "destructive",
                                });
                            }
                        }, children: "Validate Form" }), _jsx(Button, { onClick: handleSubmit, disabled: isSubmitting || formData.formStatus === "completed", className: "flex items-center", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4 mr-2 animate-spin" }), "Completing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Complete Pre-approval Form"] })) })] })] }));
}
