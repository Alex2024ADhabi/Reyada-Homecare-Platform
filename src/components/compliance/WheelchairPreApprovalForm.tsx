import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  Upload,
  Calendar,
  User,
  Shield,
  Wheelchair,
  Clock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface WheelchairPreApprovalFormProps {
  patientId?: string;
  onFormComplete?: (formData: any) => void;
  className?: string;
}

interface WheelchairFormData {
  // Patient Information
  patientId: string;
  patientName: string;
  emiratesId: string;
  damanInsuranceNumber: string;
  dateOfBirth: string;
  contactNumber: string;

  // Clinical Assessment
  primaryDiagnosis: string;
  icd10Code: string;
  functionalAssessment: string;
  mobilityLimitations: string;
  currentMobilityAids: string;
  assessmentDate: string;

  // Professional Information
  assessingProfessional: string;
  professionalType:
    | "physiotherapist"
    | "occupational_therapist"
    | "rehabilitation_specialist"
    | "consultant";
  licenseNumber: string;
  facilityName: string;

  // Wheelchair Specifications
  wheelchairType: string;
  wheelchairBrand: string;
  wheelchairModel: string;
  specialFeatures: string[];
  estimatedCost: number;
  seatDimensions: {
    width: string;
    depth: string;
    height: string;
  };

  // Clinical Justification
  medicalNecessity: string;
  functionalGoals: string;
  alternativesConsidered: string;
  expectedOutcomes: string;

  // Required Documentation
  warrantyDocumentation: boolean;
  technicalSpecifications: boolean;
  medicalReportAttached: boolean;
  medicalReportDate: string;

  // Professional Signatures
  professionalSignature: boolean;
  professionalSignatureDate: string;
  physicianApproval: boolean;
  physicianName: string;
  physicianSignatureDate: string;

  // Form Metadata
  formVersion: string;
  submissionDate: string;
  validUntil: string;
  formStatus:
    | "draft"
    | "completed"
    | "submitted"
    | "approved"
    | "rejected"
    | "expired";
}

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

export default function WheelchairPreApprovalForm({
  patientId = "",
  onFormComplete,
  className,
}: WheelchairPreApprovalFormProps) {
  const [formData, setFormData] = useState<WheelchairFormData>({
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("patient");

  // Enhanced validation for wheelchair pre-approval (Effective May 1, 2025)
  const validateForm = (): string[] => {
    const errors: string[] = [];
    const effectiveDate = new Date("2025-05-01");
    const currentDate = new Date();

    // OpenJet integration validation
    if (!formData.openJetIntegration) {
      errors.push(
        "OpenJet system integration is required for homecare allocation",
      );
    }

    // Face-to-face form completion workflow validation
    if (!formData.faceToFaceCompleted) {
      errors.push("Face-to-face assessment form must be completed");
    }

    // Check if form is required (effective May 1, 2025)
    if (currentDate >= effectiveDate) {
      // Patient Information Validation
      if (!formData.patientId) errors.push("Patient ID is required");
      if (!formData.patientName) errors.push("Patient name is required");
      if (!formData.emiratesId) errors.push("Emirates ID is required");
      if (!formData.damanInsuranceNumber)
        errors.push("Daman insurance number is required");
      if (!formData.dateOfBirth) errors.push("Date of birth is required");
      if (!formData.contactNumber) errors.push("Contact number is required");

      // Clinical Assessment Validation
      if (!formData.primaryDiagnosis)
        errors.push("Primary diagnosis is required");
      if (!formData.icd10Code) errors.push("ICD-10 code is required");
      if (
        !formData.functionalAssessment ||
        formData.functionalAssessment.length < 50
      ) {
        errors.push("Functional assessment must be at least 50 characters");
      }
      if (!formData.mobilityLimitations)
        errors.push("Mobility limitations must be documented");

      // Assessment date validation (not older than 30 days)
      if (formData.assessmentDate) {
        const assessmentDate = new Date(formData.assessmentDate);
        const daysDiff = Math.floor(
          (currentDate.getTime() - assessmentDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysDiff > 30) {
          errors.push("Assessment date cannot be older than 30 days");
        }
      }

      // Professional Information Validation
      if (!formData.assessingProfessional)
        errors.push("Assessing professional name is required");
      if (!formData.licenseNumber)
        errors.push("Professional license number is required");
      if (!formData.facilityName) errors.push("Facility name is required");

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
      if (
        !formData.medicalNecessity ||
        formData.medicalNecessity.length < 100
      ) {
        errors.push(
          "Medical necessity justification must be at least 100 characters",
        );
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
      const missingElements = requiredElements.filter(
        (element) => !formData.medicalNecessity.toLowerCase().includes(element),
      );
      if (missingElements.length > 0) {
        errors.push(
          `Medical necessity missing required elements: ${missingElements.join(", ")}`,
        );
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
        const daysSinceReport = Math.floor(
          (currentDate.getTime() - reportDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysSinceReport > 90) {
          errors.push("Medical report must not be older than 3 months");
        }
      }

      // Professional Signatures Validation (Mandatory from May 1, 2025)
      if (!formData.professionalSignature) {
        errors.push(
          "Professional signature is required (Physiotherapist, OT, Rehabilitation Specialist, or Consultant)",
        );
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
        errors.push(
          "Form has expired. Wheelchair pre-approval forms are valid for 1 month only",
        );
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
      const validUntilDate = new Date(
        currentDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

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
        assessmentDate: String(
          formData.assessmentDate || currentDate.toISOString().split("T")[0],
        ),

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
        professionalSignatureDate: String(
          formData.professionalSignatureDate || "",
        ),
        physicianApproval: Boolean(formData.physicianApproval),
        physicianName: String(formData.physicianName || ""),
        physicianSignatureDate: String(formData.physicianSignatureDate || ""),

        // Form Metadata
        formId,
        formVersion: String(formData.formVersion || "2025.1"),
        submissionDate: currentDate.toISOString(),
        validUntil: validUntilDate.toISOString(),
        formStatus: "completed" as const,

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
          } catch (jsonError) {
            reject(
              new Error(
                `JSON serialization failed: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
              ),
            );
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
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast({
        title: "Submission Failed",
        description: `Failed to complete wheelchair pre-approval form: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpecialFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      specialFeatures: prev.specialFeatures.includes(feature)
        ? prev.specialFeatures.filter((f) => f !== feature)
        : [...prev.specialFeatures, feature],
    }));
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof WheelchairFormData],
        [field]: value,
      },
    }));
  };

  return (
    <div className={`bg-white space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Wheelchair className="w-6 h-6 mr-2 text-blue-600" />
            Wheelchair Pre-approval Form (2025)
          </h2>
          <p className="text-gray-600 mt-1">
            Mandatory for wheelchair requests (Effective May 1, 2025) - PT form
            no longer accepted
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Valid for 30 Days
          </Badge>
          <Badge className="text-orange-600 bg-orange-100">
            Effective May 1, 2025
          </Badge>
          <Badge
            className={
              formData.formStatus === "completed"
                ? "text-green-600 bg-green-100"
                : "text-yellow-600 bg-yellow-100"
            }
          >
            {formData.formStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Effective Date Alert */}
      <Alert className="bg-orange-50 border-orange-200">
        <Calendar className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">
          New Requirement - Effective May 1, 2025
        </AlertTitle>
        <AlertDescription className="text-orange-700">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              Wheelchair pre-approval form is now mandatory for all wheelchair
              authorization requests
            </li>
            <li>PT (physiotherapy) form is no longer accepted</li>
            <li>
              Form validity period is limited to 1 month from assessment date
            </li>
            <li>
              Professional signatures from qualified therapists or consultants
              are required
            </li>
            <li>Wheelchair brand warranty documentation is mandatory</li>
            <li>
              Updated medical report (not older than 3 months) must be attached
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Form Validity Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Form Validity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Form Version:</span>{" "}
              {formData.formVersion}
            </div>
            <div>
              <span className="font-medium">Valid Until:</span>{" "}
              {new Date(formData.validUntil).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Days Remaining:</span>
              {Math.max(
                0,
                Math.ceil(
                  (new Date(formData.validUntil).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "patient", label: "Patient Info" },
          { id: "clinical", label: "Clinical Assessment" },
          { id: "professional", label: "Professional Info" },
          { id: "wheelchair", label: "Wheelchair Specs" },
          { id: "justification", label: "Clinical Justification" },
          { id: "documentation", label: "Documentation" },
          { id: "signatures", label: "Signatures" },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Patient Information Section */}
      {activeSection === "patient" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
            <CardDescription>
              Complete patient demographics and insurance details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID *</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => updateFormData("patientId", e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <Label htmlFor="patientName">Patient Full Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    updateFormData("patientName", e.target.value)
                  }
                  placeholder="Enter patient full name"
                />
              </div>
              <div>
                <Label htmlFor="emiratesId">Emirates ID *</Label>
                <Input
                  id="emiratesId"
                  value={formData.emiratesId}
                  onChange={(e) => updateFormData("emiratesId", e.target.value)}
                  placeholder="xxx-xxxx-xxxxxxx-x"
                />
              </div>
              <div>
                <Label htmlFor="damanInsuranceNumber">
                  Daman Insurance Number *
                </Label>
                <Input
                  id="damanInsuranceNumber"
                  value={formData.damanInsuranceNumber}
                  onChange={(e) =>
                    updateFormData("damanInsuranceNumber", e.target.value)
                  }
                  placeholder="Enter Daman insurance number"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    updateFormData("dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    updateFormData("contactNumber", e.target.value)
                  }
                  placeholder="+971 xx xxx xxxx"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Assessment Section */}
      {activeSection === "clinical" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Clinical Assessment
            </CardTitle>
            <CardDescription>
              Medical condition and functional assessment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryDiagnosis">Primary Diagnosis *</Label>
                <Input
                  id="primaryDiagnosis"
                  value={formData.primaryDiagnosis}
                  onChange={(e) =>
                    updateFormData("primaryDiagnosis", e.target.value)
                  }
                  placeholder="Enter primary diagnosis"
                />
              </div>
              <div>
                <Label htmlFor="icd10Code">ICD-10 Code *</Label>
                <Input
                  id="icd10Code"
                  value={formData.icd10Code}
                  onChange={(e) => updateFormData("icd10Code", e.target.value)}
                  placeholder="e.g., M79.3"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="assessmentDate">Assessment Date *</Label>
                <Input
                  id="assessmentDate"
                  type="date"
                  value={formData.assessmentDate}
                  onChange={(e) =>
                    updateFormData("assessmentDate", e.target.value)
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Assessment must not be older than 30 days
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="functionalAssessment">
                Functional Assessment * (Minimum 50 characters)
              </Label>
              <Textarea
                id="functionalAssessment"
                value={formData.functionalAssessment}
                onChange={(e) =>
                  updateFormData("functionalAssessment", e.target.value)
                }
                placeholder="Describe patient's current functional status, capabilities, and limitations in detail..."
                rows={4}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.functionalAssessment.length}/50 characters minimum
              </div>
            </div>

            <div>
              <Label htmlFor="mobilityLimitations">
                Mobility Limitations *
              </Label>
              <Textarea
                id="mobilityLimitations"
                value={formData.mobilityLimitations}
                onChange={(e) =>
                  updateFormData("mobilityLimitations", e.target.value)
                }
                placeholder="Detail specific mobility limitations and restrictions that require wheelchair assistance..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="currentMobilityAids">Current Mobility Aids</Label>
              <Input
                id="currentMobilityAids"
                value={formData.currentMobilityAids}
                onChange={(e) =>
                  updateFormData("currentMobilityAids", e.target.value)
                }
                placeholder="List current mobility aids (walker, cane, crutches, etc.)"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Information Section */}
      {activeSection === "professional" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Assessing professional details and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessingProfessional">
                  Assessing Professional Name *
                </Label>
                <Input
                  id="assessingProfessional"
                  value={formData.assessingProfessional}
                  onChange={(e) =>
                    updateFormData("assessingProfessional", e.target.value)
                  }
                  placeholder="Enter professional full name"
                />
              </div>
              <div>
                <Label htmlFor="professionalType">Professional Type *</Label>
                <Select
                  value={formData.professionalType}
                  onValueChange={(value) =>
                    updateFormData("professionalType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select professional type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physiotherapist">
                      Physiotherapist
                    </SelectItem>
                    <SelectItem value="occupational_therapist">
                      Occupational Therapist
                    </SelectItem>
                    <SelectItem value="rehabilitation_specialist">
                      Rehabilitation Specialist
                    </SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    updateFormData("licenseNumber", e.target.value)
                  }
                  placeholder="Enter professional license number"
                />
              </div>
              <div>
                <Label htmlFor="facilityName">Facility Name *</Label>
                <Input
                  id="facilityName"
                  value={formData.facilityName}
                  onChange={(e) =>
                    updateFormData("facilityName", e.target.value)
                  }
                  placeholder="Enter facility/clinic name"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wheelchair Specifications Section */}
      {activeSection === "wheelchair" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wheelchair className="w-5 h-5 mr-2" />
              Wheelchair Specifications
            </CardTitle>
            <CardDescription>
              Detailed wheelchair requirements and specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wheelchairType">Wheelchair Type *</Label>
                <Select
                  value={formData.wheelchairType}
                  onValueChange={(value) =>
                    updateFormData("wheelchairType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select wheelchair type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WHEELCHAIR_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedCost">Estimated Cost (AED) *</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    updateFormData(
                      "estimatedCost",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="Enter estimated cost"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="wheelchairBrand">Wheelchair Brand *</Label>
                <Input
                  id="wheelchairBrand"
                  value={formData.wheelchairBrand}
                  onChange={(e) =>
                    updateFormData("wheelchairBrand", e.target.value)
                  }
                  placeholder="Enter wheelchair brand"
                />
              </div>
              <div>
                <Label htmlFor="wheelchairModel">Wheelchair Model *</Label>
                <Input
                  id="wheelchairModel"
                  value={formData.wheelchairModel}
                  onChange={(e) =>
                    updateFormData("wheelchairModel", e.target.value)
                  }
                  placeholder="Enter wheelchair model"
                />
              </div>
            </div>

            {/* Seat Dimensions */}
            <div>
              <Label>Seat Dimensions (cm) *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="seatWidth">Width *</Label>
                  <Input
                    id="seatWidth"
                    value={formData.seatDimensions.width}
                    onChange={(e) =>
                      updateNestedFormData(
                        "seatDimensions",
                        "width",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., 45"
                  />
                </div>
                <div>
                  <Label htmlFor="seatDepth">Depth *</Label>
                  <Input
                    id="seatDepth"
                    value={formData.seatDimensions.depth}
                    onChange={(e) =>
                      updateNestedFormData(
                        "seatDimensions",
                        "depth",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <Label htmlFor="seatHeight">Height</Label>
                  <Input
                    id="seatHeight"
                    value={formData.seatDimensions.height}
                    onChange={(e) =>
                      updateNestedFormData(
                        "seatDimensions",
                        "height",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
            </div>

            {/* Special Features */}
            <div>
              <Label>Special Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {SPECIAL_FEATURES.map((feature) => (
                  <Button
                    key={feature}
                    variant={
                      formData.specialFeatures.includes(feature)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleSpecialFeature(feature)}
                    className="justify-start h-auto p-2"
                  >
                    <div className="flex items-center space-x-2">
                      {formData.specialFeatures.includes(feature) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded" />
                      )}
                      <span className="text-xs">{feature}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected features: {formData.specialFeatures.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Justification Section */}
      {activeSection === "justification" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Clinical Justification
            </CardTitle>
            <CardDescription>
              Detailed clinical justification for wheelchair prescription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="medicalNecessity">
                Medical Necessity * (Minimum 100 characters)
              </Label>
              <Textarea
                id="medicalNecessity"
                value={formData.medicalNecessity}
                onChange={(e) =>
                  updateFormData("medicalNecessity", e.target.value)
                }
                placeholder="Provide comprehensive medical necessity justification including diagnosis, functional limitations, mobility requirements, and necessity for wheelchair assistance..."
                rows={5}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.medicalNecessity.length}/100 characters minimum
                <br />
                Must include: diagnosis, functional status, mobility needs,
                necessity
              </div>
            </div>

            <div>
              <Label htmlFor="functionalGoals">Functional Goals *</Label>
              <Textarea
                id="functionalGoals"
                value={formData.functionalGoals}
                onChange={(e) =>
                  updateFormData("functionalGoals", e.target.value)
                }
                placeholder="Describe specific functional goals and expected improvements with wheelchair use..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="alternativesConsidered">
                Alternatives Considered *
              </Label>
              <Textarea
                id="alternativesConsidered"
                value={formData.alternativesConsidered}
                onChange={(e) =>
                  updateFormData("alternativesConsidered", e.target.value)
                }
                placeholder="List and explain why alternative mobility aids (walker, cane, crutches, etc.) were considered but deemed unsuitable..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="expectedOutcomes">Expected Outcomes *</Label>
              <Textarea
                id="expectedOutcomes"
                value={formData.expectedOutcomes}
                onChange={(e) =>
                  updateFormData("expectedOutcomes", e.target.value)
                }
                placeholder="Describe expected clinical outcomes, functional improvements, and quality of life benefits..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation Section */}
      {activeSection === "documentation" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Required Documentation
            </CardTitle>
            <CardDescription>
              Mandatory documentation for wheelchair authorization (Effective
              May 1, 2025)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <FileText className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">
                Required Documents Checklist
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                All documents listed below are mandatory for wheelchair
                authorization requests.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="warrantyDocumentation"
                  checked={formData.warrantyDocumentation}
                  onChange={(e) =>
                    updateFormData("warrantyDocumentation", e.target.checked)
                  }
                  className="rounded"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="warrantyDocumentation"
                    className="font-medium"
                  >
                    Wheelchair Brand Warranty Documentation *
                  </Label>
                  <p className="text-sm text-gray-600">
                    Official warranty documentation from wheelchair manufacturer
                  </p>
                </div>
                {formData.warrantyDocumentation && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="technicalSpecifications"
                  checked={formData.technicalSpecifications}
                  onChange={(e) =>
                    updateFormData("technicalSpecifications", e.target.checked)
                  }
                  className="rounded"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="technicalSpecifications"
                    className="font-medium"
                  >
                    Technical Specifications Document *
                  </Label>
                  <p className="text-sm text-gray-600">
                    Detailed technical specifications and features document
                  </p>
                </div>
                {formData.technicalSpecifications && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="medicalReportAttached"
                  checked={formData.medicalReportAttached}
                  onChange={(e) =>
                    updateFormData("medicalReportAttached", e.target.checked)
                  }
                  className="rounded"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="medicalReportAttached"
                    className="font-medium"
                  >
                    Updated Medical Report *
                  </Label>
                  <p className="text-sm text-gray-600">
                    Medical report from treating physician (not older than 3
                    months)
                  </p>
                  <div className="mt-2">
                    <Label htmlFor="medicalReportDate" className="text-sm">
                      Medical Report Date
                    </Label>
                    <Input
                      id="medicalReportDate"
                      type="date"
                      value={formData.medicalReportDate}
                      onChange={(e) =>
                        updateFormData("medicalReportDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                {formData.medicalReportAttached && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">
                Important Documentation Notes
              </AlertTitle>
              <AlertDescription className="text-yellow-700">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    All documents must be current and properly signed/stamped
                  </li>
                  <li>Medical reports must not be older than 3 months</li>
                  <li>
                    Warranty documentation must be from official manufacturer
                  </li>
                  <li>
                    Keep copies of all approval forms in patient records for
                    future reference
                  </li>
                  <li>
                    Failure to provide required documentation will result in
                    rejection
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Signatures Section */}
      {activeSection === "signatures" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Professional Signatures & Approvals
            </CardTitle>
            <CardDescription>
              Required signatures from qualified professionals (Effective May 1,
              2025)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Professional Signature Requirements
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Signatures must be from qualified physiotherapist, occupational
                therapist, rehabilitation specialist, or consultant.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="professionalSignature"
                    checked={formData.professionalSignature}
                    onChange={(e) =>
                      updateFormData("professionalSignature", e.target.checked)
                    }
                    className="rounded"
                  />
                  <Label
                    htmlFor="professionalSignature"
                    className="font-medium"
                  >
                    Professional Signature Required *
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="professionalSignatureDate">
                      Signature Date *
                    </Label>
                    <Input
                      id="professionalSignatureDate"
                      type="date"
                      value={formData.professionalSignatureDate}
                      onChange={(e) =>
                        updateFormData(
                          "professionalSignatureDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  By checking this box, I confirm that I have assessed the
                  patient and recommend the prescribed wheelchair as medically
                  necessary. Professional:{" "}
                  {formData.assessingProfessional || "Not specified"} (
                  {formData.professionalType.replace("_", " ").toUpperCase()})
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="physicianApproval"
                    checked={formData.physicianApproval}
                    onChange={(e) =>
                      updateFormData("physicianApproval", e.target.checked)
                    }
                    className="rounded"
                  />
                  <Label htmlFor="physicianApproval" className="font-medium">
                    Physician Approval Required *
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="physicianName">Physician Name *</Label>
                    <Input
                      id="physicianName"
                      value={formData.physicianName}
                      onChange={(e) =>
                        updateFormData("physicianName", e.target.value)
                      }
                      placeholder="Enter approving physician name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="physicianSignatureDate">
                      Approval Date
                    </Label>
                    <Input
                      id="physicianSignatureDate"
                      type="date"
                      value={formData.physicianSignatureDate}
                      onChange={(e) =>
                        updateFormData("physicianSignatureDate", e.target.value)
                      }
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  By checking this box, I approve the wheelchair prescription as
                  medically necessary for the patient's condition and functional
                  requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Validation Errors ({validationErrors.length})
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            const errors = validateForm();
            setValidationErrors(errors);
            if (errors.length === 0) {
              toast({
                title: "Validation Successful",
                description:
                  "All requirements met. Form is ready for completion.",
              });
            } else {
              toast({
                title: "Validation Issues",
                description: `${errors.length} issues found. Please review the errors above.`,
                variant: "destructive",
              });
            }
          }}
        >
          Validate Form
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || formData.formStatus === "completed"}
          className="flex items-center"
        >
          {isSubmitting ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Pre-approval Form
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
