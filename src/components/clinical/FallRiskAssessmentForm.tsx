import React, { useState, useEffect } from "react";
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
} from "@/components/ui";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";
import DOHComplianceValidator from "@/components/clinical/DOHComplianceValidator";
import {
  User,
  FileText,
  ClipboardCheck,
  Activity,
  Clock,
  Calendar,
  Pen,
  CheckCircle,
  AlertCircle,
  Home,
  Footprints,
  Eye,
  Brain,
  Pill,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface FallRiskAssessmentFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Fall risk factors
const intrinsicRiskFactors = [
  "Age 65 or older",
  "History of falls",
  "Visual impairment",
  "Hearing impairment",
  "Cognitive impairment",
  "Impaired mobility",
  "Gait disturbance",
  "Balance problems",
  "Muscle weakness",
  "Postural hypotension",
  "Urinary incontinence/frequency",
  "Chronic pain",
  "Fear of falling",
  "Depression",
  "Dizziness/vertigo",
];

const extrinsicRiskFactors = [
  "Poor lighting",
  "Uneven flooring",
  "Loose rugs",
  "Lack of grab bars",
  "Inappropriate footwear",
  "Cluttered environment",
  "Slippery surfaces",
  "Inadequate assistive devices",
  "Improper bed height",
  "Improper chair height",
  "Pets in the home",
  "Stairs without railings",
  "Bathroom hazards",
  "Electrical cords in walkways",
  "Unstable furniture",
];

const medicationRiskFactors = [
  "Sedatives/hypnotics",
  "Antidepressants",
  "Antipsychotics",
  "Antihypertensives",
  "Diuretics",
  "Anticonvulsants",
  "Opioid analgesics",
  "Benzodiazepines",
  "Polypharmacy (≥4 medications)",
  "Recent medication changes",
  "Alcohol use",
];

const preventionStrategies = [
  "Strength and balance exercises",
  "Medication review and adjustment",
  "Vision assessment and correction",
  "Home safety evaluation",
  "Assistive device provision",
  "Patient education",
  "Vitamin D supplementation",
  "Fall alarm system",
  "Footwear assessment",
  "Continence management",
  "Physical therapy referral",
  "Occupational therapy referral",
  "Cognitive assessment",
  "Caregiver education",
  "Regular reassessment",
];

const FallRiskAssessmentForm: React.FC<FallRiskAssessmentFormProps> = ({
  patientId,
  episodeId,
  onSave,
  onCancel,
  initialData,
  readOnly = false,
}) => {
  const { userProfile } = useSupabaseAuth();
  const {
    createSignature,
    generateDocumentHash,
    validateSignatureRequirements,
    currentSignature,
    isCreating,
  } = useDigitalSignature();

  const [activeTab, setActiveTab] = useState("history");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedIntrinsicFactors, setSelectedIntrinsicFactors] = useState<
    string[]
  >([]);
  const [selectedExtrinsicFactors, setSelectedExtrinsicFactors] = useState<
    string[]
  >([]);
  const [selectedMedicationFactors, setSelectedMedicationFactors] = useState<
    string[]
  >([]);
  const [selectedPreventionStrategies, setSelectedPreventionStrategies] =
    useState<string[]>([]);
  const [dohCompliance, setDohCompliance] = useState<{
    isCompliant: boolean;
    issues: string[];
  }>({ isCompliant: true, issues: [] });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: initialData || {
      // Fall History
      hasPreviousFalls: "no",
      numberOfFalls: "0",
      fallTimeframe: "",
      fallCircumstances: "",
      fallInjuries: "",
      hospitalizedForFalls: "no",

      // Mobility Assessment
      mobilityStatus: "independent",
      gaitAssessment: "",
      balanceAssessment: "",
      transferAbility: "",
      assistiveDevices: [],

      // Environmental Assessment
      homeSafetyEvaluation: "not_completed",
      environmentalModifications: "",
      lightingAdequacy: "",
      bathroomSafety: "",
      bedroomSafety: "",
      stairsSafety: "",

      // Clinical Assessment
      visionStatus: "",
      hearingStatus: "",
      cognitiveStatus: "",
      continenceStatus: "",
      nutritionalStatus: "",
      orthostatic: "not_tested",
      systolicLying: "",
      diastolicLying: "",
      pulseLying: "",
      systolicStanding: "",
      diastolicStanding: "",
      pulseStanding: "",

      // Medication Review
      medicationReview: "not_completed",
      highRiskMedications: "",
      medicationRecommendations: "",

      // Risk Assessment
      morseScore: "",
      stratifyScore: "",
      overallRiskLevel: "moderate",
      clinicalJudgment: "",

      // Prevention Plan
      fallPreventionEducation: "not_completed",
      strengthExercises: "not_prescribed",
      balanceExercises: "not_prescribed",
      referrals: "",
      followUpPlan: "",
      caregiverEducation: "not_completed",
      preventionPlanNotes: "",
    },
  });

  const watchHasPreviousFalls = watch("hasPreviousFalls");
  const watchMobilityStatus = watch("mobilityStatus");
  const watchOrthostatic = watch("orthostatic");
  const watchOverallRiskLevel = watch("overallRiskLevel");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    // Define required fields for accurate completion percentage
    const requiredFields = [
      "hasPreviousFalls",
      "mobilityStatus",
      "gaitAssessment",
      "balanceAssessment",
      "homeSafetyEvaluation",
      "visionStatus",
      "cognitiveStatus",
      "medicationReview",
      "overallRiskLevel",
      "fallPreventionEducation",
      "followUpPlan",
    ];

    const totalRequiredFields = requiredFields.length;
    const filledRequiredFields = requiredFields.filter(
      (field) =>
        formValues[field] !== "" &&
        formValues[field] !== null &&
        formValues[field] !== undefined,
    ).length;

    // Add additional completion points for selected items in arrays
    let additionalPoints = 0;
    if (selectedIntrinsicFactors.length > 0) additionalPoints += 1;
    if (selectedExtrinsicFactors.length > 0) additionalPoints += 1;
    if (selectedMedicationFactors.length > 0) additionalPoints += 1;
    if (selectedPreventionStrategies.length > 0) additionalPoints += 1;

    // Calculate completion based on required fields and additional points
    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 4)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [
    watch,
    selectedIntrinsicFactors,
    selectedExtrinsicFactors,
    selectedMedicationFactors,
    selectedPreventionStrategies,
  ]);

  const handleIntrinsicFactorChange = (factor: string) => {
    setSelectedIntrinsicFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handleExtrinsicFactorChange = (factor: string) => {
    setSelectedExtrinsicFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handleMedicationFactorChange = (factor: string) => {
    setSelectedMedicationFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handlePreventionStrategyChange = (strategy: string) => {
    setSelectedPreventionStrategies((prev) =>
      prev.includes(strategy)
        ? prev.filter((s) => s !== strategy)
        : [...prev, strategy],
    );
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
        history: ["fall history", "previous falls", "circumstances"],
        mobility: [
          "mobility",
          "gait",
          "balance",
          "transfer",
          "assistive device",
        ],
        environment: [
          "environment",
          "home safety",
          "bathroom",
          "bedroom",
          "stairs",
        ],
        clinical: [
          "vision",
          "hearing",
          "cognitive",
          "continence",
          "orthostatic",
        ],
        medication: ["medication", "drug", "pharmacy"],
        risk: ["risk level", "morse", "stratify", "assessment"],
        prevention: [
          "prevention",
          "plan",
          "education",
          "exercise",
          "follow up",
        ],
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
      console.error(
        "Cannot submit form with DOH compliance issues:",
        dohCompliance.issues,
      );
      return;
    }

    // Add selected arrays to form data
    const formData = {
      ...data,
      intrinsicRiskFactors: selectedIntrinsicFactors,
      extrinsicRiskFactors: selectedExtrinsicFactors,
      medicationRiskFactors: selectedMedicationFactors,
      preventionStrategies: selectedPreventionStrategies,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "fall_risk_assessment",
      submissionTimestamp: new Date().toISOString(),
    };

    // Generate document hash for signature
    const documentHash = generateDocumentHash(JSON.stringify(formData));

    // Create digital signature if signature data exists
    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `fall_risk_assessment_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "fall_risk_assessment",
            patientId,
            episodeId,
            signatureReason: "Fall risk assessment completion",
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

  const validateSignature = () => {
    if (!userProfile) return false;

    const signaturePayload = {
      documentId: `fall_risk_assessment_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  };

  // Function to get color for risk level
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Fall Risk Assessment Form</CardTitle>
              <CardDescription>
                Comprehensive evaluation of fall risk factors and prevention
                strategies
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
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="history">
                <Clock className="mr-2 h-4 w-4" /> Fall History
              </TabsTrigger>
              <TabsTrigger value="mobility">
                <Footprints className="mr-2 h-4 w-4" /> Mobility
              </TabsTrigger>
              <TabsTrigger value="environment">
                <Home className="mr-2 h-4 w-4" /> Environment
              </TabsTrigger>
              <TabsTrigger value="clinical">
                <Activity className="mr-2 h-4 w-4" /> Clinical
              </TabsTrigger>
              <TabsTrigger value="medication">
                <Pill className="mr-2 h-4 w-4" /> Medication
              </TabsTrigger>
              <TabsTrigger value="risk">
                <AlertCircle className="mr-2 h-4 w-4" /> Risk Level
              </TabsTrigger>
              <TabsTrigger value="prevention">
                <ClipboardCheck className="mr-2 h-4 w-4" /> Prevention
              </TabsTrigger>
            </TabsList>

            {/* Fall History Section */}
            <TabsContent value="history" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hasPreviousFalls">
                      Previous Falls in Last 12 Months
                    </Label>
                    <Controller
                      name="hasPreviousFalls"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.hasPreviousFalls && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {watchHasPreviousFalls === "yes" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="numberOfFalls">Number of Falls</Label>
                        <Controller
                          name="numberOfFalls"
                          control={control}
                          rules={{ required: watchHasPreviousFalls === "yes" }}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select number" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5+">5 or more</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.numberOfFalls && (
                          <p className="text-sm text-red-500">Required field</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fallTimeframe">
                          Timeframe of Last Fall
                        </Label>
                        <Controller
                          name="fallTimeframe"
                          control={control}
                          rules={{ required: watchHasPreviousFalls === "yes" }}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select timeframe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="within_month">
                                  Within past month
                                </SelectItem>
                                <SelectItem value="1_3_months">
                                  1-3 months ago
                                </SelectItem>
                                <SelectItem value="3_6_months">
                                  3-6 months ago
                                </SelectItem>
                                <SelectItem value="6_12_months">
                                  6-12 months ago
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.fallTimeframe && (
                          <p className="text-sm text-red-500">Required field</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  {watchHasPreviousFalls === "yes" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fallCircumstances">
                          Circumstances of Falls
                        </Label>
                        <Textarea
                          id="fallCircumstances"
                          placeholder="Describe the circumstances of previous falls"
                          {...register("fallCircumstances", {
                            required: watchHasPreviousFalls === "yes",
                          })}
                          disabled={readOnly}
                        />
                        {errors.fallCircumstances && (
                          <p className="text-sm text-red-500">Required field</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fallInjuries">
                          Injuries from Falls
                        </Label>
                        <Textarea
                          id="fallInjuries"
                          placeholder="Describe any injuries sustained from falls"
                          {...register("fallInjuries")}
                          disabled={readOnly}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hospitalizedForFalls">
                          Hospitalized for Falls
                        </Label>
                        <Controller
                          name="hospitalizedForFalls"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">
                  Intrinsic Risk Factors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {intrinsicRiskFactors.map((factor) => (
                    <div key={factor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`intrinsic-${factor}`}
                        checked={selectedIntrinsicFactors.includes(factor)}
                        onCheckedChange={() =>
                          handleIntrinsicFactorChange(factor)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`intrinsic-${factor}`}
                        className="text-sm font-normal"
                      >
                        {factor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Mobility Assessment Section */}
            <TabsContent value="mobility" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobilityStatus">Mobility Status</Label>
                    <Controller
                      name="mobilityStatus"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mobility status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="independent">
                              Independent
                            </SelectItem>
                            <SelectItem value="needs_supervision">
                              Needs Supervision
                            </SelectItem>
                            <SelectItem value="needs_assistance">
                              Needs Assistance
                            </SelectItem>
                            <SelectItem value="dependent">Dependent</SelectItem>
                            <SelectItem value="bedbound">Bedbound</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.mobilityStatus && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gaitAssessment">Gait Assessment</Label>
                    <Textarea
                      id="gaitAssessment"
                      placeholder="Describe gait pattern, stability, and any abnormalities"
                      {...register("gaitAssessment", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.gaitAssessment && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balanceAssessment">
                      Balance Assessment
                    </Label>
                    <Textarea
                      id="balanceAssessment"
                      placeholder="Describe static and dynamic balance"
                      {...register("balanceAssessment", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.balanceAssessment && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transferAbility">Transfer Ability</Label>
                    <Controller
                      name="transferAbility"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transfer ability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="independent">
                              Independent
                            </SelectItem>
                            <SelectItem value="standby_assistance">
                              Standby Assistance
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
                  </div>

                  <div className="space-y-2">
                    <Label>Assistive Devices Used</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "None",
                        "Cane",
                        "Walker",
                        "Rollator",
                        "Wheelchair",
                        "Crutches",
                        "Furniture",
                        "Other",
                      ].map((device) => (
                        <div
                          key={device}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`device-${device}`}
                            {...register("assistiveDevices")}
                            value={device}
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

                  {watchMobilityStatus !== "independent" && (
                    <div className="space-y-2">
                      <Label htmlFor="mobilityNotes">
                        Additional Mobility Notes
                      </Label>
                      <Textarea
                        id="mobilityNotes"
                        placeholder="Additional notes about mobility status"
                        {...register("mobilityNotes")}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Environmental Assessment Section */}
            <TabsContent value="environment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeSafetyEvaluation">
                      Home Safety Evaluation
                    </Label>
                    <Controller
                      name="homeSafetyEvaluation"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="not_completed">
                              Not Completed
                            </SelectItem>
                            <SelectItem value="declined">
                              Declined by Patient
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.homeSafetyEvaluation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environmentalModifications">
                      Environmental Modifications
                    </Label>
                    <Textarea
                      id="environmentalModifications"
                      placeholder="Describe any environmental modifications made or recommended"
                      {...register("environmentalModifications")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lightingAdequacy">Lighting Adequacy</Label>
                    <Controller
                      name="lightingAdequacy"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select lighting status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adequate">Adequate</SelectItem>
                            <SelectItem value="inadequate">
                              Inadequate
                            </SelectItem>
                            <SelectItem value="not_assessed">
                              Not Assessed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bathroomSafety">Bathroom Safety</Label>
                    <Controller
                      name="bathroomSafety"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bathroom safety status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="safe">Safe</SelectItem>
                            <SelectItem value="needs_modification">
                              Needs Modification
                            </SelectItem>
                            <SelectItem value="unsafe">Unsafe</SelectItem>
                            <SelectItem value="not_assessed">
                              Not Assessed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bedroomSafety">Bedroom Safety</Label>
                    <Controller
                      name="bedroomSafety"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bedroom safety status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="safe">Safe</SelectItem>
                            <SelectItem value="needs_modification">
                              Needs Modification
                            </SelectItem>
                            <SelectItem value="unsafe">Unsafe</SelectItem>
                            <SelectItem value="not_assessed">
                              Not Assessed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stairsSafety">Stairs Safety</Label>
                    <Controller
                      name="stairsSafety"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stairs safety status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="safe">Safe</SelectItem>
                            <SelectItem value="needs_modification">
                              Needs Modification
                            </SelectItem>
                            <SelectItem value="unsafe">Unsafe</SelectItem>
                            <SelectItem value="not_applicable">
                              Not Applicable
                            </SelectItem>
                            <SelectItem value="not_assessed">
                              Not Assessed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">
                  Extrinsic Risk Factors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {extrinsicRiskFactors.map((factor) => (
                    <div key={factor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`extrinsic-${factor}`}
                        checked={selectedExtrinsicFactors.includes(factor)}
                        onCheckedChange={() =>
                          handleExtrinsicFactorChange(factor)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`extrinsic-${factor}`}
                        className="text-sm font-normal"
                      >
                        {factor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Clinical Assessment Section */}
            <TabsContent value="clinical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visionStatus">Vision Status</Label>
                    <Controller
                      name="visionStatus"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vision status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="impaired_corrected">
                              Impaired - Corrected
                            </SelectItem>
                            <SelectItem value="impaired_uncorrected">
                              Impaired - Uncorrected
                            </SelectItem>
                            <SelectItem value="legally_blind">
                              Legally Blind
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.visionStatus && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hearingStatus">Hearing Status</Label>
                    <Controller
                      name="hearingStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hearing status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="impaired_corrected">
                              Impaired - Corrected
                            </SelectItem>
                            <SelectItem value="impaired_uncorrected">
                              Impaired - Uncorrected
                            </SelectItem>
                            <SelectItem value="deaf">Deaf</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cognitiveStatus">Cognitive Status</Label>
                    <Controller
                      name="cognitiveStatus"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cognitive status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="mild_impairment">
                              Mild Impairment
                            </SelectItem>
                            <SelectItem value="moderate_impairment">
                              Moderate Impairment
                            </SelectItem>
                            <SelectItem value="severe_impairment">
                              Severe Impairment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.cognitiveStatus && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="continenceStatus">Continence Status</Label>
                    <Controller
                      name="continenceStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select continence status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continent">Continent</SelectItem>
                            <SelectItem value="occasional_incontinence">
                              Occasional Incontinence
                            </SelectItem>
                            <SelectItem value="frequent_incontinence">
                              Frequent Incontinence
                            </SelectItem>
                            <SelectItem value="incontinent">
                              Incontinent
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nutritionalStatus">
                      Nutritional Status
                    </Label>
                    <Controller
                      name="nutritionalStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nutritional status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orthostatic">
                      Orthostatic Hypotension Assessment
                    </Label>
                    <Controller
                      name="orthostatic"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assessment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="not_tested">
                              Not Tested
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {watchOrthostatic !== "not_tested" && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Orthostatic Vital Signs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolicLying">Systolic BP (Lying)</Label>
                      <Input
                        id="systolicLying"
                        type="number"
                        placeholder="mmHg"
                        {...register("systolicLying")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolicLying">
                        Diastolic BP (Lying)
                      </Label>
                      <Input
                        id="diastolicLying"
                        type="number"
                        placeholder="mmHg"
                        {...register("diastolicLying")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pulseLying">Pulse (Lying)</Label>
                      <Input
                        id="pulseLying"
                        type="number"
                        placeholder="bpm"
                        {...register("pulseLying")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="systolicStanding">
                        Systolic BP (Standing)
                      </Label>
                      <Input
                        id="systolicStanding"
                        type="number"
                        placeholder="mmHg"
                        {...register("systolicStanding")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolicStanding">
                        Diastolic BP (Standing)
                      </Label>
                      <Input
                        id="diastolicStanding"
                        type="number"
                        placeholder="mmHg"
                        {...register("diastolicStanding")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pulseStanding">Pulse (Standing)</Label>
                      <Input
                        id="pulseStanding"
                        type="number"
                        placeholder="bpm"
                        {...register("pulseStanding")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Medication Review Section */}
            <TabsContent value="medication" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationReview">
                      Medication Review Status
                    </Label>
                    <Controller
                      name="medicationReview"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="not_completed">
                              Not Completed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.medicationReview && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="highRiskMedications">
                      High-Risk Medications
                    </Label>
                    <Textarea
                      id="highRiskMedications"
                      placeholder="List medications that increase fall risk"
                      {...register("highRiskMedications")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationRecommendations">
                      Medication Recommendations
                    </Label>
                    <Textarea
                      id="medicationRecommendations"
                      placeholder="Recommendations for medication adjustments"
                      {...register("medicationRecommendations")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium mb-3">Medication Risk Factors</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {medicationRiskFactors.map((factor) => (
                      <div key={factor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`medication-${factor}`}
                          checked={selectedMedicationFactors.includes(factor)}
                          onCheckedChange={() =>
                            handleMedicationFactorChange(factor)
                          }
                          disabled={readOnly}
                        />
                        <Label
                          htmlFor={`medication-${factor}`}
                          className="text-sm font-normal"
                        >
                          {factor}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Risk Assessment Section */}
            <TabsContent value="risk" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="morseScore">Morse Fall Scale Score</Label>
                    <Input
                      id="morseScore"
                      type="number"
                      placeholder="Enter score (0-125)"
                      {...register("morseScore")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stratifyScore">STRATIFY Score</Label>
                    <Input
                      id="stratifyScore"
                      type="number"
                      placeholder="Enter score (0-5)"
                      {...register("stratifyScore")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overallRiskLevel">Overall Risk Level</Label>
                    <Controller
                      name="overallRiskLevel"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
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
                    {errors.overallRiskLevel && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicalJudgment">Clinical Judgment</Label>
                    <Textarea
                      id="clinicalJudgment"
                      placeholder="Clinical judgment regarding fall risk"
                      {...register("clinicalJudgment")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Risk Summary</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 text-center">
                        <div className="text-sm text-gray-600">Risk Level</div>
                        <Badge
                          className={getRiskLevelColor(watchOverallRiskLevel)}
                        >
                          {watchOverallRiskLevel === "low"
                            ? "Low Risk"
                            : watchOverallRiskLevel === "moderate"
                              ? "Moderate Risk"
                              : "High Risk"}
                        </Badge>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-sm text-gray-600">
                          Risk Factors
                        </div>
                        <div className="text-xl font-bold">
                          {selectedIntrinsicFactors.length +
                            selectedExtrinsicFactors.length +
                            selectedMedicationFactors.length}
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-sm text-gray-600">
                          Interventions
                        </div>
                        <div className="text-xl font-bold">
                          {selectedPreventionStrategies.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Prevention Plan Section */}
            <TabsContent value="prevention" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fallPreventionEducation">
                      Fall Prevention Education
                    </Label>
                    <Controller
                      name="fallPreventionEducation"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="not_completed">
                              Not Completed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.fallPreventionEducation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strengthExercises">
                      Strength Exercises
                    </Label>
                    <Controller
                      name="strengthExercises"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prescribed">
                              Prescribed
                            </SelectItem>
                            <SelectItem value="not_prescribed">
                              Not Prescribed
                            </SelectItem>
                            <SelectItem value="contraindicated">
                              Contraindicated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balanceExercises">Balance Exercises</Label>
                    <Controller
                      name="balanceExercises"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prescribed">
                              Prescribed
                            </SelectItem>
                            <SelectItem value="not_prescribed">
                              Not Prescribed
                            </SelectItem>
                            <SelectItem value="contraindicated">
                              Contraindicated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referrals">Referrals</Label>
                    <Textarea
                      id="referrals"
                      placeholder="List any referrals made (PT, OT, etc.)"
                      {...register("referrals")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="followUpPlan">Follow-Up Plan</Label>
                    <Textarea
                      id="followUpPlan"
                      placeholder="Describe follow-up plan for fall risk management"
                      {...register("followUpPlan", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.followUpPlan && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiverEducation">
                      Caregiver Education
                    </Label>
                    <Controller
                      name="caregiverEducation"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="not_completed">
                              Not Completed
                            </SelectItem>
                            <SelectItem value="not_applicable">
                              Not Applicable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preventionPlanNotes">
                      Prevention Plan Notes
                    </Label>
                    <Textarea
                      id="preventionPlanNotes"
                      placeholder="Additional notes about fall prevention plan"
                      {...register("preventionPlanNotes")}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">
                  Prevention Strategies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {preventionStrategies.map((strategy) => (
                    <div key={strategy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`strategy-${strategy}`}
                        checked={selectedPreventionStrategies.includes(
                          strategy,
                        )}
                        onCheckedChange={() =>
                          handlePreventionStrategyChange(strategy)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`strategy-${strategy}`}
                        className="text-sm font-normal"
                      >
                        {strategy}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOH Compliance Validator */}
              <DOHComplianceValidator
                formData={watch()}
                formType="fall_risk_assessment"
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
                  <span className="font-medium">Form Type:</span> Fall Risk
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
                By signing, I confirm that this fall risk assessment is accurate
                and complete to the best of my knowledge. This electronic
                signature is legally binding and complies with DOH requirements
                for clinical documentation.
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

export default FallRiskAssessmentForm;
