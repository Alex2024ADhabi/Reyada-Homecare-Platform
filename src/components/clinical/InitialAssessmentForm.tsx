/**
 * Initial Assessment Form
 * Part of P3-001.1.1: Core Assessment Forms
 *
 * Features:
 * - Patient demographics integration
 * - Chief complaint and history
 * - Basic vital signs capture
 * - Initial care plan outline
 * - DOH compliance validation
 * - Electronic signature integration
 */

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ElectronicSignature } from "@/components/ui/electronic-signature";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ClipboardList,
  User,
  FileText,
  Activity,
  Calendar,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Heart,
  Thermometer,
  Lungs,
  Brain,
  Pill,
  Home,
  Users,
  History,
  PenTool,
  Check,
  X,
} from "lucide-react";
import DOHComplianceValidator from "@/components/validation/DOHComplianceValidator";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface InitialAssessmentFormProps {
  patientId: string;
  episodeId: string;
  onSubmit?: (data: InitialAssessmentData) => Promise<void>;
  className?: string;
  loading?: boolean;
  error?: string | null;
  readOnly?: boolean;
  defaultValues?: Partial<InitialAssessmentData>;
}

export interface InitialAssessmentData {
  patientId: string;
  episodeId: string;
  recordedAt: string;
  recordedBy: string;
  demographics: {
    fullName: string;
    emiratesId: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    language: string;
    contactNumber: string;
    address: string;
    insuranceProvider: string;
    insuranceNumber: string;
    expiryDate: string;
  };
  chiefComplaint: {
    primaryComplaint: string;
    onsetDate: string;
    severity: number;
    description: string;
    aggravatingFactors: string;
    relievingFactors: string;
  };
  medicalHistory: {
    pastMedicalHistory: string;
    surgicalHistory: string;
    familyHistory: string;
    allergies: string;
    currentMedications: string;
  };
  vitalSigns: {
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    oxygenSaturation: number;
    painLevel: number;
    height: number;
    weight: number;
  };
  initialAssessment: {
    generalAppearance: string;
    mentalStatus: string;
    neurologicalStatus: string;
    cardiovascularStatus: string;
    respiratoryStatus: string;
    gastrointestinalStatus: string;
    musculoskeletalStatus: string;
    integumentaryStatus: string;
  };
  initialCarePlan: {
    primaryDiagnosis: string;
    secondaryDiagnoses: string;
    treatmentGoals: string;
    recommendedServices: string[];
    frequency: string;
    duration: string;
    specialInstructions: string;
  };
  signature?: {
    signatureId: string;
    signatureImage: string;
    signedBy: string;
    signedAt: string;
    signatureType: string;
  };
  validated?: boolean;
  validatedBy?: string;
  validatedAt?: string;
  complianceScore?: number;
  status: "draft" | "completed" | "reviewed" | "approved";
}

export const InitialAssessmentForm: React.FC<InitialAssessmentFormProps> = ({
  patientId,
  episodeId,
  onSubmit,
  className = "",
  loading = false,
  error = null,
  readOnly = false,
  defaultValues,
}) => {
  const { userProfile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("demographics");
  const [formState, setFormState] = useState({
    completeness: 0,
    isSubmitting: false,
    hasChanges: false,
    lastSaved: null as string | null,
  });
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    complianceScore: 0,
    lastValidated: null as string | null,
  });
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [formData, setFormData] = useState<InitialAssessmentData | null>(null);
  const [recommendedServices, setRecommendedServices] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
    getValues,
  } = useForm<InitialAssessmentData>({
    defaultValues: {
      patientId,
      episodeId,
      recordedAt: new Date().toISOString(),
      recordedBy: userProfile?.id || "",
      demographics: {
        fullName: defaultValues?.demographics?.fullName || "",
        emiratesId: defaultValues?.demographics?.emiratesId || "",
        dateOfBirth: defaultValues?.demographics?.dateOfBirth || "",
        gender: defaultValues?.demographics?.gender || "",
        nationality: defaultValues?.demographics?.nationality || "",
        language: defaultValues?.demographics?.language || "",
        contactNumber: defaultValues?.demographics?.contactNumber || "",
        address: defaultValues?.demographics?.address || "",
        insuranceProvider: defaultValues?.demographics?.insuranceProvider || "",
        insuranceNumber: defaultValues?.demographics?.insuranceNumber || "",
        expiryDate: defaultValues?.demographics?.expiryDate || "",
      },
      chiefComplaint: {
        primaryComplaint: defaultValues?.chiefComplaint?.primaryComplaint || "",
        onsetDate: defaultValues?.chiefComplaint?.onsetDate || "",
        severity: defaultValues?.chiefComplaint?.severity || 0,
        description: defaultValues?.chiefComplaint?.description || "",
        aggravatingFactors:
          defaultValues?.chiefComplaint?.aggravatingFactors || "",
        relievingFactors: defaultValues?.chiefComplaint?.relievingFactors || "",
      },
      medicalHistory: {
        pastMedicalHistory:
          defaultValues?.medicalHistory?.pastMedicalHistory || "",
        surgicalHistory: defaultValues?.medicalHistory?.surgicalHistory || "",
        familyHistory: defaultValues?.medicalHistory?.familyHistory || "",
        allergies: defaultValues?.medicalHistory?.allergies || "",
        currentMedications:
          defaultValues?.medicalHistory?.currentMedications || "",
      },
      vitalSigns: {
        bloodPressure: {
          systolic: defaultValues?.vitalSigns?.bloodPressure?.systolic || 0,
          diastolic: defaultValues?.vitalSigns?.bloodPressure?.diastolic || 0,
        },
        heartRate: defaultValues?.vitalSigns?.heartRate || 0,
        respiratoryRate: defaultValues?.vitalSigns?.respiratoryRate || 0,
        temperature: defaultValues?.vitalSigns?.temperature || 0,
        oxygenSaturation: defaultValues?.vitalSigns?.oxygenSaturation || 0,
        painLevel: defaultValues?.vitalSigns?.painLevel || 0,
        height: defaultValues?.vitalSigns?.height || 0,
        weight: defaultValues?.vitalSigns?.weight || 0,
      },
      initialAssessment: {
        generalAppearance:
          defaultValues?.initialAssessment?.generalAppearance || "",
        mentalStatus: defaultValues?.initialAssessment?.mentalStatus || "",
        neurologicalStatus:
          defaultValues?.initialAssessment?.neurologicalStatus || "",
        cardiovascularStatus:
          defaultValues?.initialAssessment?.cardiovascularStatus || "",
        respiratoryStatus:
          defaultValues?.initialAssessment?.respiratoryStatus || "",
        gastrointestinalStatus:
          defaultValues?.initialAssessment?.gastrointestinalStatus || "",
        musculoskeletalStatus:
          defaultValues?.initialAssessment?.musculoskeletalStatus || "",
        integumentaryStatus:
          defaultValues?.initialAssessment?.integumentaryStatus || "",
      },
      initialCarePlan: {
        primaryDiagnosis:
          defaultValues?.initialCarePlan?.primaryDiagnosis || "",
        secondaryDiagnoses:
          defaultValues?.initialCarePlan?.secondaryDiagnoses || "",
        treatmentGoals: defaultValues?.initialCarePlan?.treatmentGoals || "",
        recommendedServices:
          defaultValues?.initialCarePlan?.recommendedServices || [],
        frequency: defaultValues?.initialCarePlan?.frequency || "",
        duration: defaultValues?.initialCarePlan?.duration || "",
        specialInstructions:
          defaultValues?.initialCarePlan?.specialInstructions || "",
      },
      status: defaultValues?.status || "draft",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (defaultValues?.initialCarePlan?.recommendedServices) {
      setRecommendedServices(defaultValues.initialCarePlan.recommendedServices);
    }
  }, [defaultValues]);

  // Calculate form completeness
  const calculateFormCompleteness = useCallback(() => {
    const sections = [
      "demographics",
      "chiefComplaint",
      "medicalHistory",
      "vitalSigns",
      "initialAssessment",
      "initialCarePlan",
    ];

    let completedSections = 0;
    const values = getValues();

    // Check demographics section
    const demographicsFields = [
      "fullName",
      "emiratesId",
      "dateOfBirth",
      "gender",
      "contactNumber",
      "insuranceProvider",
      "insuranceNumber",
    ];
    const demographicsCompleted = demographicsFields.every(
      (field) => values.demographics[field as keyof typeof values.demographics],
    );
    if (demographicsCompleted) completedSections++;

    // Check chief complaint section
    const chiefComplaintFields = [
      "primaryComplaint",
      "onsetDate",
      "severity",
      "description",
    ];
    const chiefComplaintCompleted = chiefComplaintFields.every(
      (field) =>
        values.chiefComplaint[field as keyof typeof values.chiefComplaint],
    );
    if (chiefComplaintCompleted) completedSections++;

    // Check medical history section
    const medicalHistoryFields = [
      "pastMedicalHistory",
      "allergies",
      "currentMedications",
    ];
    const medicalHistoryCompleted = medicalHistoryFields.every(
      (field) =>
        values.medicalHistory[field as keyof typeof values.medicalHistory],
    );
    if (medicalHistoryCompleted) completedSections++;

    // Check vital signs section
    const vitalSignsCompleted =
      values.vitalSigns.bloodPressure.systolic > 0 &&
      values.vitalSigns.bloodPressure.diastolic > 0 &&
      values.vitalSigns.heartRate > 0 &&
      values.vitalSigns.respiratoryRate > 0 &&
      values.vitalSigns.temperature > 0;
    if (vitalSignsCompleted) completedSections++;

    // Check initial assessment section
    const initialAssessmentFields = [
      "generalAppearance",
      "mentalStatus",
      "neurologicalStatus",
      "cardiovascularStatus",
      "respiratoryStatus",
    ];
    const initialAssessmentCompleted = initialAssessmentFields.every(
      (field) =>
        values.initialAssessment[
          field as keyof typeof values.initialAssessment
        ],
    );
    if (initialAssessmentCompleted) completedSections++;

    // Check initial care plan section
    const initialCarePlanFields = [
      "primaryDiagnosis",
      "treatmentGoals",
      "frequency",
      "duration",
    ];
    const initialCarePlanCompleted =
      initialCarePlanFields.every(
        (field) =>
          values.initialCarePlan[field as keyof typeof values.initialCarePlan],
      ) && recommendedServices.length > 0;
    if (initialCarePlanCompleted) completedSections++;

    const completeness = (completedSections / sections.length) * 100;
    setFormState((prev) => ({ ...prev, completeness, hasChanges: true }));
    return completeness;
  }, [getValues, recommendedServices]);

  useEffect(() => {
    calculateFormCompleteness();
  }, [watchedValues, calculateFormCompleteness]);

  // Handle DOH validation change
  const handleDOHValidationChange = useCallback(
    (isValid: boolean, errors: string[], warnings: string[]) => {
      setValidationState({
        isValid,
        errors,
        warnings,
        complianceScore: isValid
          ? 100
          : Math.max(0, 100 - errors.length * 20 - warnings.length * 5),
        lastValidated: new Date().toISOString(),
      });
    },
    [],
  );

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formState.hasChanges) return;

    try {
      const currentData = getValues();
      const autoSaveData = {
        ...currentData,
        initialCarePlan: {
          ...currentData.initialCarePlan,
          recommendedServices,
        },
        status: "draft" as const,
      };

      // Save to localStorage as backup
      localStorage.setItem(
        `initial-assessment-draft-${patientId}-${episodeId}`,
        JSON.stringify(autoSaveData),
      );

      setFormState((prev) => ({
        ...prev,
        lastSaved: new Date().toISOString(),
        hasChanges: false,
      }));
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [
    getValues,
    recommendedServices,
    patientId,
    episodeId,
    formState.hasChanges,
  ]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Load draft data on component mount
  useEffect(() => {
    const draftKey = `initial-assessment-draft-${patientId}-${episodeId}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft && !defaultValues) {
      try {
        const draftData = JSON.parse(savedDraft);
        reset(draftData);
        if (draftData.initialCarePlan?.recommendedServices) {
          setRecommendedServices(draftData.initialCarePlan.recommendedServices);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [patientId, episodeId, defaultValues, reset]);

  // Handle form submission
  const handleFormSubmit = async (data: InitialAssessmentData) => {
    if (!validationState.isValid && validationState.errors.length > 0) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Update with recommended services
      const updatedData = {
        ...data,
        initialCarePlan: {
          ...data.initialCarePlan,
          recommendedServices,
        },
        recordedAt: new Date().toISOString(),
        recordedBy: userProfile?.id || "",
      };

      // Store the data temporarily and show signature dialog
      setFormData(updatedData);
      setShowSignatureDialog(true);
    } catch (error) {
      console.error("Form submission failed:", error);
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle signature completion
  const handleSignatureComplete = async (signatureData: any) => {
    try {
      setFormState((prev) => ({ ...prev, isSubmitting: true }));

      if (!formData) return;

      // Attach signature to form data
      const completedFormData = {
        ...formData,
        signature: {
          signatureId: signatureData.documentId,
          signatureImage: signatureData.signatureImage,
          signedBy: signatureData.userFullName,
          signedAt: signatureData.timestamp,
          signatureType: "clinician",
        },
        validated: true,
        validatedBy: signatureData.userFullName,
        validatedAt: signatureData.timestamp,
        complianceScore: validationState.complianceScore,
        status: "completed",
      };

      // Submit via API
      if (onSubmit) {
        await onSubmit(completedFormData);
      }

      // Clear draft from localStorage after successful submission
      const draftKey = `initial-assessment-draft-${patientId}-${episodeId}`;
      localStorage.removeItem(draftKey);

      setFormState((prev) => ({
        ...prev,
        lastSaved: new Date().toISOString(),
        hasChanges: false,
      }));
      setShowSignatureDialog(false);
    } catch (error) {
      console.error("Signature submission failed:", error);
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle recommended services change
  const handleServiceChange = (service: string) => {
    setRecommendedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };

  return (
    <div className={`bg-white min-h-screen ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                Initial Assessment Form
              </h2>
              <p className="text-gray-600 mt-1">
                Comprehensive patient assessment with DOH compliance validation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={validationState.isValid ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {validationState.isValid ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {validationState.complianceScore}% Compliant
              </Badge>
              <Badge variant="outline" className="text-xs">
                {Math.round(formState.completeness)}% Complete
              </Badge>
              {formState.hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
              {formState.lastSaved && (
                <Badge variant="outline" className="text-xs text-green-600">
                  Auto-saved{" "}
                  {new Date(formState.lastSaved).toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-6 mt-4">
            <TabsTrigger
              value="demographics"
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Demographics
            </TabsTrigger>
            <TabsTrigger
              value="chiefComplaint"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Chief Complaint
            </TabsTrigger>
            <TabsTrigger
              value="medicalHistory"
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Medical History
            </TabsTrigger>
            <TabsTrigger value="vitalSigns" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Vital Signs
            </TabsTrigger>
            <TabsTrigger
              value="initialAssessment"
              className="flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger
              value="initialCarePlan"
              className="flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Care Plan
            </TabsTrigger>
          </TabsList>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Demographics Section */}
          <TabsContent value="demographics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Demographics
                </CardTitle>
                <CardDescription>
                  Patient identification and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="flex items-center gap-2"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        {...register("demographics.fullName", {
                          required: "Full name is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.demographics?.fullName && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="emiratesId"
                        className="flex items-center gap-2"
                      >
                        Emirates ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emiratesId"
                        {...register("demographics.emiratesId", {
                          required: "Emirates ID is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.demographics?.emiratesId && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.emiratesId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="dateOfBirth"
                        className="flex items-center gap-2"
                      >
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("demographics.dateOfBirth", {
                          required: "Date of birth is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.demographics?.dateOfBirth && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="gender"
                        className="flex items-center gap-2"
                      >
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        defaultValue={watchedValues.demographics.gender}
                        onValueChange={(value) =>
                          setValue("demographics.gender", value)
                        }
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.demographics?.gender && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.gender.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        {...register("demographics.nationality")}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <Label htmlFor="language">Preferred Language</Label>
                      <Input
                        id="language"
                        {...register("demographics.language")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="contactNumber"
                        className="flex items-center gap-2"
                      >
                        Contact Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactNumber"
                        {...register("demographics.contactNumber", {
                          required: "Contact number is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.demographics?.contactNumber && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.contactNumber.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        {...register("demographics.address")}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="insuranceProvider"
                        className="flex items-center gap-2"
                      >
                        Insurance Provider{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="insuranceProvider"
                        {...register("demographics.insuranceProvider", {
                          required: "Insurance provider is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.demographics?.insuranceProvider && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.insuranceProvider.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="insuranceNumber"
                        className="flex items-center gap-2"
                      >
                        Insurance Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="insuranceNumber"
                        {...register("demographics.insuranceNumber", {
                          required: "Insurance number is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.demographics?.insuranceNumber && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.demographics.insuranceNumber.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="expiryDate">Insurance Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        {...register("demographics.expiryDate")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={formState.completeness}
                      className="w-[100px]"
                    />
                    <span className="text-sm text-gray-500">
                      {Math.round(formState.completeness)}% Complete
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoSave}
                    disabled={!formState.hasChanges || readOnly}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-3 h-3" />
                    Save Draft
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("chiefComplaint")}
                  disabled={readOnly}
                >
                  Next: Chief Complaint
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Chief Complaint Section */}
          <TabsContent value="chiefComplaint" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chief Complaint & History
                </CardTitle>
                <CardDescription>
                  Document the patient's primary concerns and symptoms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="primaryComplaint"
                        className="flex items-center gap-2"
                      >
                        Primary Complaint{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="primaryComplaint"
                        {...register("chiefComplaint.primaryComplaint", {
                          required: "Primary complaint is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.chiefComplaint?.primaryComplaint && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.chiefComplaint.primaryComplaint.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="onsetDate"
                        className="flex items-center gap-2"
                      >
                        Onset Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="onsetDate"
                        type="date"
                        {...register("chiefComplaint.onsetDate", {
                          required: "Onset date is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.chiefComplaint?.onsetDate && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.chiefComplaint.onsetDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="severity"
                        className="flex items-center gap-2"
                      >
                        Severity (0-10) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="severity"
                        type="number"
                        min="0"
                        max="10"
                        {...register("chiefComplaint.severity", {
                          required: "Severity is required",
                          min: { value: 0, message: "Minimum value is 0" },
                          max: { value: 10, message: "Maximum value is 10" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.chiefComplaint?.severity && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.chiefComplaint.severity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="description"
                        className="flex items-center gap-2"
                      >
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        {...register("chiefComplaint.description", {
                          required: "Description is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.chiefComplaint?.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.chiefComplaint.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="aggravatingFactors">
                        Aggravating Factors
                      </Label>
                      <Textarea
                        id="aggravatingFactors"
                        {...register("chiefComplaint.aggravatingFactors")}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <Label htmlFor="relievingFactors">
                        Relieving Factors
                      </Label>
                      <Textarea
                        id="relievingFactors"
                        {...register("chiefComplaint.relievingFactors")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("demographics")}
                  disabled={readOnly}
                >
                  Previous: Demographics
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("medicalHistory")}
                  disabled={readOnly}
                >
                  Next: Medical History
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Medical History Section */}
          <TabsContent value="medicalHistory" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Medical History
                </CardTitle>
                <CardDescription>
                  Document the patient's medical, surgical, and family history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="pastMedicalHistory"
                      className="flex items-center gap-2"
                    >
                      Past Medical History{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="pastMedicalHistory"
                      {...register("medicalHistory.pastMedicalHistory", {
                        required: "Past medical history is required",
                      })}
                      disabled={readOnly}
                    />
                    {errors.medicalHistory?.pastMedicalHistory && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.medicalHistory.pastMedicalHistory.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="surgicalHistory">Surgical History</Label>
                    <Textarea
                      id="surgicalHistory"
                      {...register("medicalHistory.surgicalHistory")}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label htmlFor="familyHistory">Family History</Label>
                    <Textarea
                      id="familyHistory"
                      {...register("medicalHistory.familyHistory")}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="allergies"
                      className="flex items-center gap-2"
                    >
                      Allergies <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="allergies"
                      {...register("medicalHistory.allergies", {
                        required: "Allergies information is required",
                      })}
                      placeholder="List allergies or write 'No Known Allergies'"
                      disabled={readOnly}
                    />
                    {errors.medicalHistory?.allergies && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.medicalHistory.allergies.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="currentMedications"
                      className="flex items-center gap-2"
                    >
                      Current Medications{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="currentMedications"
                      {...register("medicalHistory.currentMedications", {
                        required: "Current medications information is required",
                      })}
                      placeholder="List current medications or write 'No Current Medications'"
                      disabled={readOnly}
                    />
                    {errors.medicalHistory?.currentMedications && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.medicalHistory.currentMedications.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("chiefComplaint")}
                  disabled={readOnly}
                >
                  Previous: Chief Complaint
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("vitalSigns")}
                  disabled={readOnly}
                >
                  Next: Vital Signs
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Vital Signs Section */}
          <TabsContent value="vitalSigns" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vital Signs
                </CardTitle>
                <CardDescription>
                  Record the patient's vital signs and measurements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        Blood Pressure (mmHg){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <Input
                            id="systolic"
                            type="number"
                            placeholder="Systolic"
                            {...register("vitalSigns.bloodPressure.systolic", {
                              required: "Systolic BP is required",
                              min: {
                                value: 70,
                                message: "Minimum value is 70",
                              },
                              max: {
                                value: 250,
                                message: "Maximum value is 250",
                              },
                            })}
                            disabled={readOnly}
                          />
                          {errors.vitalSigns?.bloodPressure?.systolic && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.vitalSigns.bloodPressure.systolic.message}
                            </p>
                          )}
                        </div>
                        <div className="w-1/2">
                          <Input
                            id="diastolic"
                            type="number"
                            placeholder="Diastolic"
                            {...register("vitalSigns.bloodPressure.diastolic", {
                              required: "Diastolic BP is required",
                              min: {
                                value: 40,
                                message: "Minimum value is 40",
                              },
                              max: {
                                value: 150,
                                message: "Maximum value is 150",
                              },
                            })}
                            disabled={readOnly}
                          />
                          {errors.vitalSigns?.bloodPressure?.diastolic && (
                            <p className="text-sm text-red-600 mt-1">
                              {
                                errors.vitalSigns.bloodPressure.diastolic
                                  .message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="heartRate"
                        className="flex items-center gap-2"
                      >
                        Heart Rate (bpm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="heartRate"
                        type="number"
                        {...register("vitalSigns.heartRate", {
                          required: "Heart rate is required",
                          min: { value: 30, message: "Minimum value is 30" },
                          max: { value: 200, message: "Maximum value is 200" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.heartRate && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.heartRate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="respiratoryRate"
                        className="flex items-center gap-2"
                      >
                        Respiratory Rate (breaths/min){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        {...register("vitalSigns.respiratoryRate", {
                          required: "Respiratory rate is required",
                          min: { value: 8, message: "Minimum value is 8" },
                          max: { value: 40, message: "Maximum value is 40" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.respiratoryRate && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.respiratoryRate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="temperature"
                        className="flex items-center gap-2"
                      >
                        Temperature (°F) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        {...register("vitalSigns.temperature", {
                          required: "Temperature is required",
                          min: { value: 95, message: "Minimum value is 95" },
                          max: { value: 110, message: "Maximum value is 110" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.temperature && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.temperature.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="oxygenSaturation">
                        Oxygen Saturation (%)
                      </Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        {...register("vitalSigns.oxygenSaturation", {
                          min: { value: 70, message: "Minimum value is 70" },
                          max: { value: 100, message: "Maximum value is 100" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.oxygenSaturation && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.oxygenSaturation.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                      <Input
                        id="painLevel"
                        type="number"
                        min="0"
                        max="10"
                        {...register("vitalSigns.painLevel", {
                          min: { value: 0, message: "Minimum value is 0" },
                          max: { value: 10, message: "Maximum value is 10" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.painLevel && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.painLevel.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        {...register("vitalSigns.height", {
                          min: { value: 30, message: "Minimum value is 30" },
                          max: { value: 250, message: "Maximum value is 250" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.height && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.height.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        {...register("vitalSigns.weight", {
                          min: { value: 1, message: "Minimum value is 1" },
                          max: { value: 500, message: "Maximum value is 500" },
                        })}
                        disabled={readOnly}
                      />
                      {errors.vitalSigns?.weight && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.vitalSigns.weight.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("medicalHistory")}
                  disabled={readOnly}
                >
                  Previous: Medical History
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("initialAssessment")}
                  disabled={readOnly}
                >
                  Next: Initial Assessment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Initial Assessment Section */}
          <TabsContent value="initialAssessment" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Initial Assessment
                </CardTitle>
                <CardDescription>
                  Document the patient's physical and mental status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="generalAppearance">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        General Appearance{" "}
                        <span className="text-red-500">*</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.generalAppearance", {
                          required: "General appearance is required",
                        })}
                        placeholder="Describe the patient's general appearance, level of distress, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                      {errors.initialAssessment?.generalAppearance && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.initialAssessment.generalAppearance.message}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="mentalStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Mental Status <span className="text-red-500">*</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.mentalStatus", {
                          required: "Mental status is required",
                        })}
                        placeholder="Describe the patient's mental status, orientation, mood, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                      {errors.initialAssessment?.mentalStatus && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.initialAssessment.mentalStatus.message}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="neurologicalStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Neurological Status{" "}
                        <span className="text-red-500">*</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.neurologicalStatus", {
                          required: "Neurological status is required",
                        })}
                        placeholder="Describe the patient's neurological status, reflexes, sensation, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                      {errors.initialAssessment?.neurologicalStatus && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.initialAssessment.neurologicalStatus.message}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cardiovascularStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Cardiovascular Status{" "}
                        <span className="text-red-500">*</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.cardiovascularStatus", {
                          required: "Cardiovascular status is required",
                        })}
                        placeholder="Describe the patient's cardiovascular status, heart sounds, pulses, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                      {errors.initialAssessment?.cardiovascularStatus && (
                        <p className="text-sm text-red-600 mt-1">
                          {
                            errors.initialAssessment.cardiovascularStatus
                              .message
                          }
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="respiratoryStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <Lungs className="h-4 w-4" />
                        Respiratory Status{" "}
                        <span className="text-red-500">*</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.respiratoryStatus", {
                          required: "Respiratory status is required",
                        })}
                        placeholder="Describe the patient's respiratory status, breath sounds, effort, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                      {errors.initialAssessment?.respiratoryStatus && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.initialAssessment.respiratoryStatus.message}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="gastrointestinalStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Gastrointestinal Status
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register(
                          "initialAssessment.gastrointestinalStatus",
                        )}
                        placeholder="Describe the patient's gastrointestinal status, bowel sounds, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="musculoskeletalStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Musculoskeletal Status
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.musculoskeletalStatus")}
                        placeholder="Describe the patient's musculoskeletal status, range of motion, strength, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="integumentaryStatus">
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Integumentary Status
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      <Textarea
                        {...register("initialAssessment.integumentaryStatus")}
                        placeholder="Describe the patient's skin condition, wounds, etc."
                        className="min-h-[100px]"
                        disabled={readOnly}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("vitalSigns")}
                  disabled={readOnly}
                >
                  Previous: Vital Signs
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("initialCarePlan")}
                  disabled={readOnly}
                >
                  Next: Initial Care Plan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Initial Care Plan Section */}
          <TabsContent value="initialCarePlan" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Initial Care Plan
                </CardTitle>
                <CardDescription>
                  Document the patient's treatment plan and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="primaryDiagnosis"
                        className="flex items-center gap-2"
                      >
                        Primary Diagnosis{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="primaryDiagnosis"
                        {...register("initialCarePlan.primaryDiagnosis", {
                          required: "Primary diagnosis is required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.initialCarePlan?.primaryDiagnosis && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.initialCarePlan.primaryDiagnosis.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="secondaryDiagnoses">
                        Secondary Diagnoses
                      </Label>
                      <Textarea
                        id="secondaryDiagnoses"
                        {...register("initialCarePlan.secondaryDiagnoses")}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="treatmentGoals"
                        className="flex items-center gap-2"
                      >
                        Treatment Goals <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="treatmentGoals"
                        {...register("initialCarePlan.treatmentGoals", {
                          required: "Treatment goals are required",
                        })}
                        disabled={readOnly}
                      />
                      {errors.initialCarePlan?.treatmentGoals && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.initialCarePlan.treatmentGoals.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        Recommended Services{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nursing"
                            checked={recommendedServices.includes("nursing")}
                            onCheckedChange={() =>
                              handleServiceChange("nursing")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="nursing">Nursing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="physicalTherapy"
                            checked={recommendedServices.includes(
                              "physicalTherapy",
                            )}
                            onCheckedChange={() =>
                              handleServiceChange("physicalTherapy")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="physicalTherapy">
                            Physical Therapy
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="occupationalTherapy"
                            checked={recommendedServices.includes(
                              "occupationalTherapy",
                            )}
                            onCheckedChange={() =>
                              handleServiceChange("occupationalTherapy")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="occupationalTherapy">
                            Occupational Therapy
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="speechTherapy"
                            checked={recommendedServices.includes(
                              "speechTherapy",
                            )}
                            onCheckedChange={() =>
                              handleServiceChange("speechTherapy")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="speechTherapy">Speech Therapy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="respiratoryTherapy"
                            checked={recommendedServices.includes(
                              "respiratoryTherapy",
                            )}
                            onCheckedChange={() =>
                              handleServiceChange("respiratoryTherapy")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="respiratoryTherapy">
                            Respiratory Therapy
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="socialWork"
                            checked={recommendedServices.includes("socialWork")}
                            onCheckedChange={() =>
                              handleServiceChange("socialWork")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="socialWork">Social Work</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="homeHealthAide"
                            checked={recommendedServices.includes(
                              "homeHealthAide",
                            )}
                            onCheckedChange={() =>
                              handleServiceChange("homeHealthAide")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="homeHealthAide">
                            Home Health Aide
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nutritionalCounseling"
                            checked={recommendedServices.includes(
                              "nutritionalCounseling",
                            )}
                            onCheckedChange={() =>
                              handleServiceChange("nutritionalCounseling")
                            }
                            disabled={readOnly}
                          />
                          <Label htmlFor="nutritionalCounseling">
                            Nutritional Counseling
                          </Label>
                        </div>
                      </div>
                      {recommendedServices.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          At least one service must be selected
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="frequency"
                          className="flex items-center gap-2"
                        >
                          Frequency <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="frequency"
                          {...register("initialCarePlan.frequency", {
                            required: "Frequency is required",
                          })}
                          placeholder="e.g., 3 times per week"
                          disabled={readOnly}
                        />
                        {errors.initialCarePlan?.frequency && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.initialCarePlan.frequency.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="duration"
                          className="flex items-center gap-2"
                        >
                          Duration <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="duration"
                          {...register("initialCarePlan.duration", {
                            required: "Duration is required",
                          })}
                          placeholder="e.g., 4 weeks"
                          disabled={readOnly}
                        />
                        {errors.initialCarePlan?.duration && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.initialCarePlan.duration.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialInstructions">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="specialInstructions"
                        {...register("initialCarePlan.specialInstructions")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* DOH Compliance Validation */}
                <div className="mt-6">
                  <DOHComplianceValidator
                    formType="initial_assessment"
                    formData={watchedValues}
                    patientId={patientId}
                    episodeId={episodeId}
                    onValidationChange={handleDOHValidationChange}
                    realTimeValidation={true}
                    embedded={true}
                    validationType="clinical_form"
                    validationScope="single_form"
                    className="mb-6"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("initialAssessment")}
                  disabled={readOnly}
                >
                  Previous: Initial Assessment
                </Button>
                <Button
                  type="submit"
                  disabled={
                    formState.isSubmitting ||
                    (!validationState.isValid &&
                      validationState.errors.length > 0) ||
                    formState.completeness < 85 ||
                    readOnly
                  }
                  className="min-w-[140px]"
                >
                  {formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Assessment
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>

      {/* Electronic Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Electronic Signature Required</DialogTitle>
          </DialogHeader>
          <ElectronicSignature
            documentId={`initial-assessment-${patientId}-${new Date().getTime()}`}
            documentType="initial_assessment"
            onSignatureComplete={handleSignatureComplete}
            onCancel={() => setShowSignatureDialog(false)}
            biometricEnabled={false}
            workflowEnabled={true}
            captureRequirements={{
              minStrokes: 10,
              minDuration: 1000,
              minComplexity: 20,
              touchRequired: false,
            }}
            formData={{
              patientId,
              episodeId,
              formType: "initial_assessment",
              ...watchedValues,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InitialAssessmentForm;
