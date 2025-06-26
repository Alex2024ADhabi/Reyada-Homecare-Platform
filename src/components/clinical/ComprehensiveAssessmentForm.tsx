import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Button,
  Input,
  Label,
  Textarea,
  Badge,
  Alert,
  AlertDescription,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Switch,
  ScrollArea,
  Toast,
} from "@/components/ui";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";
import DOHComplianceValidator from "@/components/clinical/DOHComplianceValidator";
import {
  User,
  FileText,
  ClipboardCheck,
  Activity,
  UserCog,
  Stethoscope,
  Save,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Pen,
  Heart,
  Brain,
  Eye,
  Ear,
  Shield,
  Users,
  Home,
  Phone,
  MapPin,
  Pill,
  Utensils,
  Zap,
  Target,
  BookOpen,
  AlertTriangle,
  Timer,
  Download,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ComprehensiveAssessmentFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
  autoSave?: boolean;
  offlineMode?: boolean;
  onAutoSave?: (data: any) => void;
  onDraftSave?: (data: any) => void;
}

const ComprehensiveAssessmentForm: React.FC<
  ComprehensiveAssessmentFormProps
> = ({
  patientId,
  episodeId,
  onSave,
  onCancel,
  initialData,
  readOnly = false,
  autoSave = true,
  offlineMode = false,
  onAutoSave,
  onDraftSave,
}) => {
  const { userProfile } = useSupabaseAuth();
  const {
    createSignature,
    generateDocumentHash,
    validateSignatureRequirements,
    currentSignature,
    isCreating,
  } = useDigitalSignature();

  const [activeTab, setActiveTab] = useState("demographics");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [assistiveDevices, setAssistiveDevices] = useState<string[]>([]);
  const [safetyRisks, setSafetyRisks] = useState<string[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [careTeamMembers, setCareTeamMembers] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [careGoals, setCareGoals] = useState<any[]>([]);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [dohCompliance, setDohCompliance] = useState<{
    isCompliant: boolean;
    issues: string[];
  }>({ isCompliant: true, issues: [] });

  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const formDataRef = useRef<any>({});

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: initialData || {
      // Demographics & Contact Information
      fullName: "",
      emiratesId: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      nationality: "",
      preferredLanguage: "english",
      contactNumber: "",
      alternateContact: "",
      email: "",
      address: "",
      city: "",
      emirate: "",
      postalCode: "",
      insuranceProvider: "",
      insuranceNumber: "",
      expiryDate: "",
      policyType: "",
      copayAmount: "",

      // Emergency Contacts
      emergencyContact1Name: "",
      emergencyContact1Relationship: "",
      emergencyContact1Phone: "",
      emergencyContact2Name: "",
      emergencyContact2Relationship: "",
      emergencyContact2Phone: "",

      // Medical History - Comprehensive
      chiefComplaint: "",
      historyOfPresentIllness: "",
      onsetDate: "",
      severity: "moderate",
      associatedSymptoms: "",
      aggravatingFactors: "",
      relievingFactors: "",
      pastMedicalHistory: "",
      surgicalHistory: "",
      familyHistory: "",
      maternalHistory: "",
      paternalHistory: "",
      socialHistory: "",
      occupationalHistory: "",
      travelHistory: "",
      immunizationHistory: "",
      menstrualHistory: "",
      obstetricHistory: "",

      // Allergies & Medications - Structured
      knownAllergies: "no",
      allergyDetails: "",
      currentMedications: "",
      medicationCompliance: "good",
      overTheCounterMeds: "",
      herbalSupplements: "",
      recentMedicationChanges: "",

      // Physical Examination - Comprehensive
      generalAppearance: "",
      consciousnessLevel: "alert",
      orientation: "oriented_x3",

      // Vital Signs
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
      oxygenSaturation: "",
      painLevel: "0",
      painLocation: "",
      painCharacter: "",

      // Anthropometric
      height: "",
      weight: "",
      bmi: "",
      bodyFatPercentage: "",
      waistCircumference: "",

      // System-by-System Examination
      cardiovascularExam: "",
      respiratoryExam: "",
      gastrointestinalExam: "",
      genitourinaryExam: "",
      neurologicalExam: "",
      musculoskeletalExam: "",
      dermatologicalExam: "",
      psychiatricExam: "",

      // Head & Neck
      headExam: "",
      eyeExam: "",
      earExam: "",
      noseThroatExam: "",
      neckExam: "",
      lymphNodeExam: "",

      // Functional Assessment - Detailed
      adlStatus: "independent",
      iadlStatus: "independent",
      mobilityStatus: "",
      transferAbility: "independent",
      ambulationDistance: "",
      balanceAssessment: "",
      fallHistory: "no",
      assistiveDeviceUse: "",

      // Cognitive Assessment
      cognitiveFunctioning: "",
      memoryAssessment: "",
      orientationAssessment: "",
      executiveFunctionAssessment: "",
      communicationAbility: "",

      // Psychosocial Assessment
      moodAssessment: "",
      anxietyLevel: "none",
      depressionScreening: "negative",
      socialSupport: "",
      copingMechanisms: "",
      spiritualNeeds: "",
      culturalConsiderations: "",

      // Environmental Assessment
      homeEnvironment: "",
      homeSafety: "",
      accessibilityNeeds: "",
      caregiverSupport: "",
      caregiverStress: "none",
      communityResources: "",
      transportationNeeds: "",

      // Nutritional Assessment
      nutritionalStatus: "",
      dietaryRestrictions: "",
      appetiteChanges: "no",
      weightChanges: "stable",
      swallowingDifficulties: "no",
      nutritionalSupplements: "",

      // Risk Assessment - Comprehensive
      fallRisk: "low",
      fallRiskScore: "",
      pressureUlcerRisk: "low",
      bradenScore: "",
      nutritionalRisk: "low",
      malnutritionRisk: "",
      infectionRisk: "low",
      medicationRisk: "low",
      cognitiveRisk: "low",
      socialRisk: "low",
      painAssessment: "",
      painManagementPlan: "",

      // Safety Assessment
      suicidalIdeation: "no",
      homicidalIdeation: "no",
      substanceUse: "no",
      abuseScreening: "negative",
      domesticViolence: "no",

      // Care Planning
      primaryDiagnosis: "",
      secondaryDiagnoses: "",
      clinicalImpression: "",
      treatmentPlan: "",
      shortTermGoals: "",
      longTermGoals: "",
      interventions: "",
      expectedOutcomes: "",

      // Service Planning
      recommendedServices: "",
      serviceFrequency: "",
      serviceDuration: "",
      skillsRequired: "",
      equipmentNeeds: "",

      // Follow-up & Monitoring
      followUpPlan: "",
      monitoringParameters: "",
      reassessmentSchedule: "",
      emergencyPlan: "",

      // Education & Training
      educationProvided: "",
      patientUnderstanding: "",
      caregiverTraining: "",
      educationMaterials: "",

      // Referrals & Coordination
      referrals: "",
      specialistConsultations: "",
      communityReferrals: "",
      careCoordination: "",

      // Quality Indicators
      qualityMeasures: "",
      patientSatisfaction: "",
      outcomeMetrics: "",

      // DOH Compliance Fields
      dohDomain1: "", // Patient Rights
      dohDomain2: "", // Patient Safety
      dohDomain3: "", // Clinical Care
      dohDomain4: "", // Medication Management
      dohDomain5: "", // Infection Control
      dohDomain6: "", // Quality Management
      dohDomain7: "", // Information Management
      dohDomain8: "", // Human Resources
      dohDomain9: "", // Facility Management
    },
  });

  const watchHeight = watch("height");
  const watchWeight = watch("weight");
  const formValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && !readOnly) {
      autoSaveIntervalRef.current = setInterval(() => {
        const currentFormData = formValues;
        if (
          JSON.stringify(currentFormData) !==
          JSON.stringify(formDataRef.current)
        ) {
          handleAutoSave(currentFormData);
          formDataRef.current = currentFormData;
        }
      }, 30000); // Auto-save every 30 seconds

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [autoSave, readOnly, formValues]);

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (watchHeight && watchWeight) {
      const heightInMeters = parseFloat(watchHeight) / 100;
      const weightInKg = parseFloat(watchWeight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setValue("bmi", bmi);
      }
    }
  }, [watchHeight, watchWeight, setValue]);

  // Calculate form completion percentage
  useEffect(() => {
    // Define required fields for comprehensive assessment
    const requiredFields = [
      // Demographics (Core)
      "fullName",
      "emiratesId",
      "dateOfBirth",
      "gender",
      "contactNumber",
      "address",
      "insuranceProvider",
      "insuranceNumber",
      "expiryDate",

      // Emergency Contact (At least one)
      "emergencyContact1Name",
      "emergencyContact1Phone",

      // Medical History (Core)
      "chiefComplaint",
      "historyOfPresentIllness",
      "onsetDate",
      "severity",
      "pastMedicalHistory",
      "currentMedications",
      "knownAllergies",

      // Physical Examination (Core)
      "generalAppearance",
      "consciousnessLevel",
      "orientation",
      "bloodPressure",
      "heartRate",
      "respiratoryRate",
      "temperature",
      "oxygenSaturation",
      "painLevel",
      "height",
      "weight",

      // System Examinations (Key Systems)
      "cardiovascularExam",
      "respiratoryExam",
      "neurologicalExam",

      // Functional Assessment
      "adlStatus",
      "iadlStatus",
      "mobilityStatus",
      "cognitiveFunctioning",

      // Psychosocial
      "moodAssessment",
      "socialSupport",

      // Environmental
      "homeEnvironment",
      "homeSafety",
      "caregiverSupport",

      // Risk Assessment
      "fallRisk",
      "pressureUlcerRisk",
      "nutritionalRisk",
      "painAssessment",

      // Care Planning
      "primaryDiagnosis",
      "clinicalImpression",
      "treatmentPlan",
      "shortTermGoals",
      "longTermGoals",
      "followUpPlan",

      // Education & Services
      "educationProvided",
      "recommendedServices",

      // DOH Compliance (Core Domains)
      "dohDomain1",
      "dohDomain2",
      "dohDomain3",
      "dohDomain6",
    ];

    const totalRequiredFields = requiredFields.length;
    const filledRequiredFields = requiredFields.filter(
      (field) =>
        formValues[field] !== "" &&
        formValues[field] !== null &&
        formValues[field] !== undefined,
    ).length;

    // Calculate completion based on required fields
    const completionPercentage = Math.round(
      (filledRequiredFields / totalRequiredFields) * 100,
    );
    setFormCompletion(completionPercentage);
  }, [formValues]);

  // Auto-save handler
  const handleAutoSave = async (data: any) => {
    if (isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      const draftData = {
        ...data,
        assistiveDevices,
        safetyRisks,
        emergencyContacts,
        careTeamMembers,
        medications,
        allergies,
        diagnoses,
        careGoals,
        lastModified: new Date().toISOString(),
        isDraft: true,
        formType: "comprehensive_assessment",
        patientId,
        episodeId,
      };

      if (onAutoSave) {
        await onAutoSave(draftData);
      } else if (onDraftSave) {
        await onDraftSave(draftData);
      }

      setLastAutoSave(new Date());
      setIsDraft(true);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Manual save draft
  const handleSaveDraft = async () => {
    const currentData = formValues;
    await handleAutoSave(currentData);
  };

  const handleAssistiveDeviceChange = (device: string) => {
    setAssistiveDevices((prev) =>
      prev.includes(device)
        ? prev.filter((d) => d !== device)
        : [...prev, device],
    );
  };

  const handleSafetyRiskChange = (risk: string) => {
    setSafetyRisks((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk],
    );
  };

  // Add emergency contact
  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        relationship: "",
        phone: "",
        email: "",
        isPrimary: false,
      },
    ]);
  };

  // Add care team member
  const addCareTeamMember = () => {
    setCareTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        role: "",
        specialty: "",
        contact: "",
        isPrimary: false,
      },
    ]);
  };

  // Add medication
  const addMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        dosage: "",
        frequency: "",
        route: "",
        indication: "",
        prescriber: "",
        startDate: "",
        endDate: "",
        isActive: true,
      },
    ]);
  };

  // Add allergy
  const addAllergy = () => {
    setAllergies((prev) => [
      ...prev,
      {
        id: Date.now(),
        allergen: "",
        reaction: "",
        severity: "mild",
        onset: "",
        treatment: "",
      },
    ]);
  };

  // Add diagnosis
  const addDiagnosis = () => {
    setDiagnoses((prev) => [
      ...prev,
      {
        id: Date.now(),
        diagnosis: "",
        icdCode: "",
        isPrimary: false,
        dateOfDiagnosis: "",
        status: "active",
      },
    ]);
  };

  // Add care goal
  const addCareGoal = () => {
    setCareGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        goal: "",
        targetDate: "",
        priority: "medium",
        status: "active",
        interventions: "",
        outcomes: "",
      },
    ]);
  };

  const handleSignatureCapture = (data: string) => {
    setSignatureData(data);
  };

  const handleDOHComplianceCheck = (result: {
    isCompliant: boolean;
    issues: string[];
  }) => {
    setDohCompliance(result);
    // If there are compliance issues, automatically switch to the tab with issues
    if (!result.isCompliant && result.issues.length > 0) {
      // Extract tab name from issue message if possible
      const tabMapping = {
        demographics: [
          "patient",
          "name",
          "emirates id",
          "contact",
          "insurance",
        ],
        "medical-history": [
          "medical history",
          "chief complaint",
          "allergies",
          "medications",
        ],
        "physical-exam": [
          "vital signs",
          "physical",
          "examination",
          "blood pressure",
        ],
        "functional-status": ["functional", "adl", "iadl", "mobility"],
        "risk-assessment": ["risk", "fall", "pressure", "ulcer", "nutritional"],
        "assessment-plan": ["assessment", "plan", "impression", "treatment"],
      };

      // Find the first issue and determine which tab it belongs to
      const firstIssue = result.issues[0].toLowerCase();
      for (const [tab, keywords] of Object.entries(tabMapping)) {
        if (keywords.some((keyword) => firstIssue.includes(keyword))) {
          setActiveTab(tab);
          break;
        }
      }
    }
  };

  const onSubmit = async (data: any) => {
    // Validate DOH compliance before submission
    if (!dohCompliance.isCompliant) {
      // Show toast or alert about compliance issues
      console.error(
        "Cannot submit form with DOH compliance issues:",
        dohCompliance.issues,
      );
      return;
    }

    // Add assistive devices and safety risks to form data
    const formData = {
      ...data,
      assistiveDevices,
      safetyRisks,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "comprehensive_assessment",
      submissionTimestamp: new Date().toISOString(),
    };

    // Generate document hash for signature
    const documentHash = generateDocumentHash(JSON.stringify(formData));

    // Create digital signature if signature data exists
    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `assessment_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "comprehensive_assessment",
            patientId,
            episodeId,
            signatureReason: "Clinical assessment completion",
            auditTrail: [
              {
                action: "form_created",
                timestamp: new Date().toISOString(),
                user: userProfile?.full_name,
              },
              {
                action: "form_submitted",
                timestamp: new Date().toISOString(),
                user: userProfile?.full_name,
              },
            ],
          },
        };

        await createSignature(signaturePayload);
      } catch (error) {
        console.error("Error creating signature:", error);
      }
    }

    // Call onSave with the form data
    if (onSave) {
      onSave(formData);
    }
  };

  const validateSignature = useCallback(() => {
    if (!userProfile) return false;

    const signaturePayload = {
      documentId: `assessment_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  }, [userProfile, patientId, validateSignatureRequirements]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Comprehensive Assessment Form</CardTitle>
              <CardDescription>
                Complete all sections for a thorough patient assessment
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={formCompletion === 100 ? "default" : "outline"}
                className="ml-2"
              >
                {formCompletion}% Complete
              </Badge>
              <Badge
                variant={dohCompliance.isCompliant ? "default" : "destructive"}
              >
                {dohCompliance.isCompliant ? "DOH Compliant" : "Non-Compliant"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="demographics">
                  <User className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Demographics</span>
                  <span className="sm:hidden">Demo</span>
                </TabsTrigger>
                <TabsTrigger value="medical-history">
                  <FileText className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Medical History</span>
                  <span className="sm:hidden">History</span>
                </TabsTrigger>
                <TabsTrigger value="physical-exam">
                  <Stethoscope className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Physical Exam</span>
                  <span className="sm:hidden">Exam</span>
                </TabsTrigger>
                <TabsTrigger value="functional-status">
                  <UserCog className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Functional</span>
                  <span className="sm:hidden">Func</span>
                </TabsTrigger>
                <TabsTrigger value="psychosocial">
                  <Brain className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Psychosocial</span>
                  <span className="sm:hidden">Psych</span>
                </TabsTrigger>
                <TabsTrigger value="environmental">
                  <Home className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Environmental</span>
                  <span className="sm:hidden">Env</span>
                </TabsTrigger>
                <TabsTrigger value="risk-assessment">
                  <AlertCircle className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Risk Assessment</span>
                  <span className="sm:hidden">Risk</span>
                </TabsTrigger>
                <TabsTrigger value="care-planning">
                  <ClipboardCheck className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Care Planning</span>
                  <span className="sm:hidden">Plan</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {offlineMode ? (
                    <WifiOff className="h-3 w-3 text-orange-500" />
                  ) : (
                    <Wifi className="h-3 w-3 text-green-500" />
                  )}
                  {lastAutoSave && (
                    <span>Saved {lastAutoSave.toLocaleTimeString()}</span>
                  )}
                  {isAutoSaving && (
                    <span className="text-blue-500">Saving...</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                >
                  {showAdvancedFeatures ? "Basic" : "Advanced"}
                </Button>

                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isAutoSaving}
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Save Draft
                  </Button>
                )}
              </div>
            </div>

            {/* Demographics Section */}
            <TabsContent value="demographics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emiratesId">Emirates ID</Label>
                  <Input
                    id="emiratesId"
                    {...register("emiratesId", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.emiratesId && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                    )}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    {...register("contactNumber", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register("address", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    {...register("insuranceProvider", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.insuranceProvider && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceNumber">Insurance Number</Label>
                  <Input
                    id="insuranceNumber"
                    {...register("insuranceNumber", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.insuranceNumber && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Insurance Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...register("expiryDate", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Medical History Section */}
            <TabsContent value="medical-history" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                  <Textarea
                    id="chiefComplaint"
                    {...register("chiefComplaint", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.chiefComplaint && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onsetDate">Onset Date</Label>
                  <Input
                    id="onsetDate"
                    type="date"
                    {...register("onsetDate", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.onsetDate && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Controller
                    name="severity"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.severity && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="past-medical-history">
                  <AccordionTrigger>Past Medical History</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="pastMedicalHistory"
                      {...register("pastMedicalHistory", { required: true })}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                    {errors.pastMedicalHistory && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="surgical-history">
                  <AccordionTrigger>Surgical History</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="surgicalHistory"
                      {...register("surgicalHistory")}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="family-history">
                  <AccordionTrigger>Family History</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="familyHistory"
                      {...register("familyHistory")}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="allergies">
                  <AccordionTrigger>Allergies</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="allergies"
                      {...register("allergies", { required: true })}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                    {errors.allergies && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="current-medications">
                  <AccordionTrigger>Current Medications</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="currentMedications"
                      {...register("currentMedications", { required: true })}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                    {errors.currentMedications && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="immunization-history">
                  <AccordionTrigger>Immunization History</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="immunizationHistory"
                      {...register("immunizationHistory")}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="social-history">
                  <AccordionTrigger>Social History</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="socialHistory"
                      {...register("socialHistory")}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="travel-history">
                  <AccordionTrigger>Travel History</AccordionTrigger>
                  <AccordionContent>
                    <Textarea
                      id="travelHistory"
                      {...register("travelHistory")}
                      className="min-h-[100px]"
                      disabled={readOnly}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Physical Examination Section */}
            <TabsContent value="physical-exam" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalAppearance">General Appearance</Label>
                <Textarea
                  id="generalAppearance"
                  {...register("generalAppearance", { required: true })}
                  disabled={readOnly}
                />
                {errors.generalAppearance && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4 flex items-center">
                  <Activity className="mr-2 h-5 w-5" /> Vital Signs
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                    <Input
                      id="bloodPressure"
                      placeholder="120/80"
                      {...register("bloodPressure", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.bloodPressure && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      {...register("heartRate", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.heartRate && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate">
                      Respiratory Rate (breaths/min)
                    </Label>
                    <Input
                      id="respiratoryRate"
                      type="number"
                      {...register("respiratoryRate", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.respiratoryRate && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      {...register("temperature", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.temperature && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation">
                      Oxygen Saturation (%)
                    </Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      max="100"
                      {...register("oxygenSaturation", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.oxygenSaturation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                    <Controller
                      name="painLevel"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain level" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                              <SelectItem key={level} value={level.toString()}>
                                {level} -{" "}
                                {level === 0
                                  ? "No Pain"
                                  : level < 4
                                    ? "Mild"
                                    : level < 7
                                      ? "Moderate"
                                      : "Severe"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.painLevel && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4">
                  Anthropometric Measurements
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      {...register("height", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.height && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      {...register("weight", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.weight && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bmi">BMI</Label>
                    <Input id="bmi" {...register("bmi")} disabled={true} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Functional Status Section */}
            <TabsContent value="functional-status" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adlStatus">
                    Activities of Daily Living (ADL)
                  </Label>
                  <Controller
                    name="adlStatus"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ADL status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="independent">
                            Independent
                          </SelectItem>
                          <SelectItem value="minimal_assistance">
                            Minimal Assistance
                          </SelectItem>
                          <SelectItem value="moderate_assistance">
                            Moderate Assistance
                          </SelectItem>
                          <SelectItem value="maximum_assistance">
                            Maximum Assistance
                          </SelectItem>
                          <SelectItem value="dependent">Dependent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.adlStatus && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iadlStatus">
                    Instrumental Activities of Daily Living (IADL)
                  </Label>
                  <Controller
                    name="iadlStatus"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select IADL status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="independent">
                            Independent
                          </SelectItem>
                          <SelectItem value="minimal_assistance">
                            Minimal Assistance
                          </SelectItem>
                          <SelectItem value="moderate_assistance">
                            Moderate Assistance
                          </SelectItem>
                          <SelectItem value="maximum_assistance">
                            Maximum Assistance
                          </SelectItem>
                          <SelectItem value="dependent">Dependent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.iadlStatus && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobilityStatus">Mobility Status</Label>
                <Textarea
                  id="mobilityStatus"
                  {...register("mobilityStatus", { required: true })}
                  disabled={readOnly}
                />
                {errors.mobilityStatus && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Assistive Devices</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Wheelchair",
                    "Walker",
                    "Cane",
                    "Crutches",
                    "Hospital Bed",
                    "Oxygen",
                    "Commode",
                    "Grab Bars",
                    "Other",
                  ].map((device) => (
                    <div key={device} className="flex items-center space-x-2">
                      <Checkbox
                        id={`device-${device}`}
                        checked={assistiveDevices.includes(device)}
                        onCheckedChange={() =>
                          handleAssistiveDeviceChange(device)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`device-${device}`}
                        className="text-sm font-normal"
                      >
                        {device}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeEnvironment">Home Environment</Label>
                <Textarea
                  id="homeEnvironment"
                  {...register("homeEnvironment", { required: true })}
                  disabled={readOnly}
                />
                {errors.homeEnvironment && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="caregiverSupport">Caregiver Support</Label>
                <Textarea
                  id="caregiverSupport"
                  {...register("caregiverSupport", { required: true })}
                  disabled={readOnly}
                />
                {errors.caregiverSupport && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>
            </TabsContent>

            {/* Risk Assessment Section */}
            <TabsContent value="risk-assessment" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fallRisk">Fall Risk</Label>
                  <Controller
                    name="fallRisk"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fall risk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="moderate">
                            Moderate Risk
                          </SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.fallRisk && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pressureUlcerRisk">Pressure Ulcer Risk</Label>
                  <Controller
                    name="pressureUlcerRisk"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pressure ulcer risk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="moderate">
                            Moderate Risk
                          </SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.pressureUlcerRisk && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nutritionalRisk">Nutritional Risk</Label>
                  <Controller
                    name="nutritionalRisk"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nutritional risk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="moderate">
                            Moderate Risk
                          </SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.nutritionalRisk && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="painAssessment">Pain Assessment</Label>
                <Textarea
                  id="painAssessment"
                  {...register("painAssessment", { required: true })}
                  disabled={readOnly}
                />
                {errors.painAssessment && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cognitiveFunctioning">
                  Cognitive Functioning
                </Label>
                <Textarea
                  id="cognitiveFunctioning"
                  {...register("cognitiveFunctioning", { required: true })}
                  disabled={readOnly}
                />
                {errors.cognitiveFunctioning && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Safety Risks</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Fall History",
                    "Cognitive Impairment",
                    "Visual Impairment",
                    "Hearing Impairment",
                    "Medication Risks",
                    "Environmental Hazards",
                    "Wandering",
                    "Self-Neglect",
                    "Other",
                  ].map((risk) => (
                    <div key={risk} className="flex items-center space-x-2">
                      <Checkbox
                        id={`risk-${risk}`}
                        checked={safetyRisks.includes(risk)}
                        onCheckedChange={() => handleSafetyRiskChange(risk)}
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`risk-${risk}`}
                        className="text-sm font-normal"
                      >
                        {risk}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Assessment & Plan Section */}
            <TabsContent value="assessment-plan" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicalImpression">Clinical Impression</Label>
                <Textarea
                  id="clinicalImpression"
                  {...register("clinicalImpression", { required: true })}
                  className="min-h-[100px]"
                  disabled={readOnly}
                />
                {errors.clinicalImpression && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                <Textarea
                  id="treatmentPlan"
                  {...register("treatmentPlan", { required: true })}
                  className="min-h-[100px]"
                  disabled={readOnly}
                />
                {errors.treatmentPlan && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  {...register("goals", { required: true })}
                  className="min-h-[100px]"
                  disabled={readOnly}
                />
                {errors.goals && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpPlan">Follow-up Plan</Label>
                <Textarea
                  id="followUpPlan"
                  {...register("followUpPlan", { required: true })}
                  disabled={readOnly}
                />
                {errors.followUpPlan && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referrals">Referrals</Label>
                <Textarea
                  id="referrals"
                  {...register("referrals")}
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationProvided">Education Provided</Label>
                <Textarea
                  id="educationProvided"
                  {...register("educationProvided", { required: true })}
                  disabled={readOnly}
                />
                {errors.educationProvided && (
                  <p className="text-sm text-red-500">Required field</p>
                )}
              </div>

              {/* DOH Compliance Validator */}
              <DOHComplianceValidator
                formData={watch()}
                formType="comprehensive_assessment"
                onComplianceCheck={handleDOHComplianceCheck}
              />

              {!dohCompliance.isCompliant && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-5">
                      {dohCompliance.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={readOnly}>
                Cancel
              </Button>
            )}
            {!readOnly && (
              <Button
                onClick={() => setShowSignatureDialog(true)}
                disabled={
                  !validateSignature() || !isValid || formCompletion < 100
                }
              >
                <Pen className="mr-2 h-4 w-4" /> Sign & Save
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Electronic Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Electronic Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Clinician:</span>{" "}
                  {userProfile?.full_name}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {userProfile?.role}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date().toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Time:</span>{" "}
                  {new Date().toLocaleTimeString()}
                </div>
                <div>
                  <span className="font-medium">Form Type:</span> Comprehensive
                  Assessment
                </div>
                <div>
                  <span className="font-medium">Patient ID:</span>{" "}
                  {patientId || "Not specified"}
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4 h-40 flex items-center justify-center bg-gray-50">
              {signatureData ? (
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p>Signature captured</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Digitally signed with secure hash
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Please sign in the box below
                  </p>
                  {/* Signature pad would be implemented here */}
                  <Button
                    className="mt-2"
                    onClick={() =>
                      handleSignatureCapture("signature-data-placeholder")
                    }
                  >
                    Capture Signature
                  </Button>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                By signing, I confirm that this assessment is accurate and
                complete to the best of my knowledge. This electronic signature
                is legally binding and complies with DOH requirements for
                clinical documentation.
              </p>
            </div>

            <Alert
              variant="info"
              className="bg-blue-50 text-blue-800 border-blue-200"
            >
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <p className="text-xs">
                  This document will be securely stored and cannot be modified
                  after signing.
                </p>
              </div>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSignatureDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={!signatureData || isCreating}
              >
                {isCreating ? "Processing..." : "Submit Assessment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Progress value={formCompletion} className="h-2" />
    </div>
  );
};

export default ComprehensiveAssessmentForm;
