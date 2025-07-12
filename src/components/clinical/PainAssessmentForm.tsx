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
  Thermometer,
  Zap,
  Repeat,
  Pill,
  Smile,
  Frown,
  Meh,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface PainAssessmentFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Pain characteristics options
const painTypes = [
  "Aching",
  "Burning",
  "Cramping",
  "Dull",
  "Numbing",
  "Pressure",
  "Radiating",
  "Sharp",
  "Shooting",
  "Stabbing",
  "Throbbing",
  "Tingling",
];

const painFactors = {
  aggravating: [
    "Movement",
    "Standing",
    "Sitting",
    "Walking",
    "Lying down",
    "Stress",
    "Cold",
    "Heat",
    "Pressure",
    "Activity",
  ],
  relieving: [
    "Rest",
    "Medication",
    "Ice",
    "Heat",
    "Position change",
    "Massage",
    "Relaxation",
    "Distraction",
    "Elevation",
  ],
};

const painLocations = [
  "Head",
  "Neck",
  "Shoulder - Left",
  "Shoulder - Right",
  "Arm - Left",
  "Arm - Right",
  "Elbow - Left",
  "Elbow - Right",
  "Wrist - Left",
  "Wrist - Right",
  "Hand - Left",
  "Hand - Right",
  "Chest",
  "Abdomen",
  "Back - Upper",
  "Back - Middle",
  "Back - Lower",
  "Hip - Left",
  "Hip - Right",
  "Leg - Left",
  "Leg - Right",
  "Knee - Left",
  "Knee - Right",
  "Ankle - Left",
  "Ankle - Right",
  "Foot - Left",
  "Foot - Right",
];

const painInterventions = [
  "Analgesics",
  "NSAIDs",
  "Opioids",
  "Muscle relaxants",
  "Anticonvulsants",
  "Antidepressants",
  "Topical agents",
  "Physical therapy",
  "Heat therapy",
  "Cold therapy",
  "TENS unit",
  "Massage",
  "Acupuncture",
  "Relaxation techniques",
  "Cognitive behavioral therapy",
  "Activity modification",
  "Assistive devices",
];

const PainAssessmentForm: React.FC<PainAssessmentFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("pain-scale");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedPainTypes, setSelectedPainTypes] = useState<string[]>([]);
  const [selectedAggravatingFactors, setSelectedAggravatingFactors] = useState<
    string[]
  >([]);
  const [selectedRelievingFactors, setSelectedRelievingFactors] = useState<
    string[]
  >([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>(
    [],
  );
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
      // Pain Scale
      painScore: "5",
      painScoreAtRest: "3",
      painScoreWithActivity: "7",
      painScoreWithMedication: "4",
      worstPainScore: "8",
      acceptablePainScore: "3",

      // Pain Characteristics
      painOnset: "",
      painDuration: "",
      painFrequency: "intermittent",
      painPattern: "",

      // Pain Impact
      impactOnSleep: "",
      impactOnMobility: "",
      impactOnMood: "",
      impactOnAppetite: "",
      impactOnSocialActivities: "",
      impactOnADLs: "",

      // Pain Management
      currentMedications: "",
      medicationEffectiveness: "",
      nonPharmacologicalInterventions: "",
      interventionEffectiveness: "",
      patientKnowledge: "",
      patientCopingStrategies: "",

      // Pain Management Plan
      shortTermGoals: "",
      longTermGoals: "",
      medicationPlan: "",
      nonPharmacologicalPlan: "",
      educationPlan: "",
      followUpPlan: "",
      referrals: "",
    },
  });

  const watchPainScore = watch("painScore");
  const watchPainFrequency = watch("painFrequency");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    // Define required fields for accurate completion percentage
    const requiredFields = [
      "painScore",
      "painScoreAtRest",
      "painScoreWithActivity",
      "painOnset",
      "painDuration",
      "painFrequency",
      "impactOnSleep",
      "impactOnMobility",
      "currentMedications",
      "medicationEffectiveness",
      "shortTermGoals",
      "medicationPlan",
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
    if (selectedPainTypes.length > 0) additionalPoints += 1;
    if (selectedLocations.length > 0) additionalPoints += 1;
    if (selectedAggravatingFactors.length > 0) additionalPoints += 0.5;
    if (selectedRelievingFactors.length > 0) additionalPoints += 0.5;
    if (selectedInterventions.length > 0) additionalPoints += 1;

    // Calculate completion based on required fields and additional points
    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 4)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [
    watch,
    selectedPainTypes,
    selectedLocations,
    selectedAggravatingFactors,
    selectedRelievingFactors,
    selectedInterventions,
  ]);

  const handlePainTypeChange = (type: string) => {
    setSelectedPainTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleAggravatingFactorChange = (factor: string) => {
    setSelectedAggravatingFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handleRelievingFactorChange = (factor: string) => {
    setSelectedRelievingFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location],
    );
  };

  const handleInterventionChange = (intervention: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention],
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
        "pain-scale": ["pain score", "scale", "rating"],
        "pain-characteristics": [
          "characteristics",
          "type",
          "onset",
          "duration",
          "frequency",
        ],
        "pain-location": ["location", "body", "area", "site"],
        "pain-impact": [
          "impact",
          "sleep",
          "mobility",
          "mood",
          "appetite",
          "social",
          "ADL",
        ],
        "pain-management": [
          "management",
          "medication",
          "intervention",
          "effectiveness",
        ],
        "management-plan": [
          "plan",
          "goal",
          "education",
          "follow up",
          "referral",
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
      painTypes: selectedPainTypes,
      painLocations: selectedLocations,
      aggravatingFactors: selectedAggravatingFactors,
      relievingFactors: selectedRelievingFactors,
      recommendedInterventions: selectedInterventions,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "pain_assessment",
      submissionTimestamp: new Date().toISOString(),
    };

    // Generate document hash for signature
    const documentHash = generateDocumentHash(JSON.stringify(formData));

    // Create digital signature if signature data exists
    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `pain_assessment_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "pain_assessment",
            patientId,
            episodeId,
            signatureReason: "Pain assessment completion",
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
      documentId: `pain_assessment_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  };

  // Function to render pain scale faces
  const renderPainFace = (score: number) => {
    if (score <= 3) {
      return <Smile className="h-6 w-6 text-green-500" />;
    } else if (score <= 6) {
      return <Meh className="h-6 w-6 text-yellow-500" />;
    } else {
      return <Frown className="h-6 w-6 text-red-500" />;
    }
  };

  // Function to get color for pain score
  const getPainScoreColor = (score: number) => {
    if (score <= 3) return "bg-green-100 text-green-800";
    if (score <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pain Assessment Form</CardTitle>
              <CardDescription>
                Comprehensive pain evaluation with scale, location, and
                management plan
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
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="pain-scale">
                <Thermometer className="mr-2 h-4 w-4" /> Pain Scale
              </TabsTrigger>
              <TabsTrigger value="pain-characteristics">
                <Zap className="mr-2 h-4 w-4" /> Characteristics
              </TabsTrigger>
              <TabsTrigger value="pain-location">
                <User className="mr-2 h-4 w-4" /> Location
              </TabsTrigger>
              <TabsTrigger value="pain-impact">
                <Activity className="mr-2 h-4 w-4" /> Impact
              </TabsTrigger>
              <TabsTrigger value="pain-management">
                <Pill className="mr-2 h-4 w-4" /> Management
              </TabsTrigger>
              <TabsTrigger value="management-plan">
                <ClipboardCheck className="mr-2 h-4 w-4" /> Plan
              </TabsTrigger>
            </TabsList>

            {/* Pain Scale Section */}
            <TabsContent value="pain-scale" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-4">
                  Pain Intensity Scale (0-10)
                </h3>
                <div className="grid grid-cols-11 gap-1 mb-6">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <div
                      key={score}
                      className={`text-center p-2 rounded-md ${parseInt(watchPainScore) === score ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white border"}`}
                    >
                      <div className="font-bold text-lg">{score}</div>
                      <div className="text-xs">
                        {score === 0 && "No Pain"}
                        {score > 0 && score <= 3 && "Mild"}
                        {score > 3 && score <= 6 && "Moderate"}
                        {score > 6 && "Severe"}
                      </div>
                      <div className="flex justify-center mt-1">
                        {score === 0 && (
                          <Smile className="h-5 w-5 text-green-500" />
                        )}
                        {score > 0 && score <= 3 && (
                          <Smile className="h-5 w-5 text-green-400" />
                        )}
                        {score > 3 && score <= 6 && (
                          <Meh className="h-5 w-5 text-yellow-500" />
                        )}
                        {score > 6 && score <= 9 && (
                          <Frown className="h-5 w-5 text-orange-500" />
                        )}
                        {score === 10 && (
                          <Frown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="painScore">Current Pain Score (0-10)</Label>
                    <Controller
                      name="painScore"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain score" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score} -{" "}
                                {score === 0
                                  ? "No Pain"
                                  : score <= 3
                                    ? "Mild"
                                    : score <= 6
                                      ? "Moderate"
                                      : "Severe"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.painScore && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painScoreAtRest">
                      Pain Score at Rest (0-10)
                    </Label>
                    <Controller
                      name="painScoreAtRest"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain score at rest" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.painScoreAtRest && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="worstPainScore">
                      Worst Pain Score (0-10)
                    </Label>
                    <Controller
                      name="worstPainScore"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select worst pain score" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="painScoreWithActivity">
                      Pain Score with Activity (0-10)
                    </Label>
                    <Controller
                      name="painScoreWithActivity"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain score with activity" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.painScoreWithActivity && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painScoreWithMedication">
                      Pain Score with Medication (0-10)
                    </Label>
                    <Controller
                      name="painScoreWithMedication"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain score with medication" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acceptablePainScore">
                      Acceptable Pain Score (0-10)
                    </Label>
                    <Controller
                      name="acceptablePainScore"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select acceptable pain score" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">Pain Score Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">Current Pain</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">
                        {watchPainScore}
                      </span>
                      <Badge
                        className={getPainScoreColor(parseInt(watchPainScore))}
                      >
                        {parseInt(watchPainScore) === 0
                          ? "No Pain"
                          : parseInt(watchPainScore) <= 3
                            ? "Mild"
                            : parseInt(watchPainScore) <= 6
                              ? "Moderate"
                              : "Severe"}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">Pain Trend</div>
                    <div className="flex items-center space-x-2 mt-1">
                      {parseInt(watch("painScoreAtRest")) <
                      parseInt(watchPainScore) ? (
                        <ArrowUp className="h-5 w-5 text-red-500" />
                      ) : parseInt(watch("painScoreAtRest")) >
                        parseInt(watchPainScore) ? (
                        <ArrowDown className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowRight className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="text-sm">
                        {parseInt(watch("painScoreAtRest")) <
                        parseInt(watchPainScore)
                          ? "Increasing"
                          : parseInt(watch("painScoreAtRest")) >
                              parseInt(watchPainScore)
                            ? "Decreasing"
                            : "Stable"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">Activity Impact</div>
                    <div className="flex items-center space-x-2 mt-1">
                      {parseInt(watch("painScoreWithActivity")) -
                        parseInt(watchPainScore) >=
                      2 ? (
                        <Badge className="bg-red-100 text-red-800">
                          Significant
                        </Badge>
                      ) : parseInt(watch("painScoreWithActivity")) -
                          parseInt(watchPainScore) >
                        0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Moderate
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          Minimal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">
                      Medication Effect
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {parseInt(watchPainScore) -
                        parseInt(watch("painScoreWithMedication")) >=
                      3 ? (
                        <Badge className="bg-green-100 text-green-800">
                          Effective
                        </Badge>
                      ) : parseInt(watchPainScore) -
                          parseInt(watch("painScoreWithMedication")) >
                        0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Partial
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Minimal
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pain Characteristics Section */}
            <TabsContent value="pain-characteristics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="painOnset">Pain Onset</Label>
                    <Input
                      id="painOnset"
                      type="date"
                      {...register("painOnset", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.painOnset && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painDuration">Pain Duration</Label>
                    <Input
                      id="painDuration"
                      placeholder="e.g., 3 weeks, 2 months"
                      {...register("painDuration", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.painDuration && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painFrequency">Pain Frequency</Label>
                    <Controller
                      name="painFrequency"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="constant">
                              Constant (always present)
                            </SelectItem>
                            <SelectItem value="intermittent">
                              Intermittent (comes and goes)
                            </SelectItem>
                            <SelectItem value="periodic">
                              Periodic (regular intervals)
                            </SelectItem>
                            <SelectItem value="occasional">
                              Occasional (rare episodes)
                            </SelectItem>
                            <SelectItem value="breakthrough">
                              Breakthrough (despite medication)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.painFrequency && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {watchPainFrequency === "intermittent" ||
                  watchPainFrequency === "periodic" ? (
                    <div className="space-y-2">
                      <Label htmlFor="painPattern">Pain Pattern</Label>
                      <Textarea
                        id="painPattern"
                        placeholder="Describe the pattern of pain (e.g., worse in morning, triggered by specific activities)"
                        {...register("painPattern")}
                        disabled={readOnly}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <Label>Pain Characteristics (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {painTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedPainTypes.includes(type)}
                          onCheckedChange={() => handlePainTypeChange(type)}
                          disabled={readOnly}
                        />
                        <Label
                          htmlFor={`type-${type}`}
                          className="text-sm font-normal"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <Label>Aggravating Factors (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {painFactors.aggravating.map((factor) => (
                      <div key={factor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`aggravating-${factor}`}
                          checked={selectedAggravatingFactors.includes(factor)}
                          onCheckedChange={() =>
                            handleAggravatingFactorChange(factor)
                          }
                          disabled={readOnly}
                        />
                        <Label
                          htmlFor={`aggravating-${factor}`}
                          className="text-sm font-normal"
                        >
                          {factor}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Relieving Factors (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {painFactors.relieving.map((factor) => (
                      <div key={factor} className="flex items-center space-x-2">
                        <Checkbox
                          id={`relieving-${factor}`}
                          checked={selectedRelievingFactors.includes(factor)}
                          onCheckedChange={() =>
                            handleRelievingFactorChange(factor)
                          }
                          disabled={readOnly}
                        />
                        <Label
                          htmlFor={`relieving-${factor}`}
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

            {/* Pain Location Section */}
            <TabsContent value="pain-location" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium mb-4">Pain Location Mapping</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {painLocations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => handleLocationChange(location)}
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`location-${location}`}
                        className="text-sm font-normal"
                      >
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="painRadiation">Pain Radiation Pattern</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <RadioGroup defaultValue="none">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="radiation-none" />
                        <Label htmlFor="radiation-none">No radiation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="unilateral"
                          id="radiation-unilateral"
                        />
                        <Label htmlFor="radiation-unilateral">
                          Unilateral radiation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="bilateral"
                          id="radiation-bilateral"
                        />
                        <Label htmlFor="radiation-bilateral">
                          Bilateral radiation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="distal" id="radiation-distal" />
                        <Label htmlFor="radiation-distal">
                          Radiates distally
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="proximal"
                          id="radiation-proximal"
                        />
                        <Label htmlFor="radiation-proximal">
                          Radiates proximally
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="painRadiationNotes">Radiation Notes</Label>
                    <Textarea
                      id="painRadiationNotes"
                      placeholder="Describe how the pain radiates"
                      {...register("painRadiationNotes")}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="additionalLocationNotes">
                  Additional Location Notes
                </Label>
                <Textarea
                  id="additionalLocationNotes"
                  placeholder="Any additional details about pain location"
                  {...register("additionalLocationNotes")}
                  disabled={readOnly}
                />
              </div>
            </TabsContent>

            {/* Pain Impact Section */}
            <TabsContent value="pain-impact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="impactOnSleep">Impact on Sleep</Label>
                  <Textarea
                    id="impactOnSleep"
                    placeholder="How does the pain affect sleep?"
                    {...register("impactOnSleep", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.impactOnSleep && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactOnMobility">Impact on Mobility</Label>
                  <Textarea
                    id="impactOnMobility"
                    placeholder="How does the pain affect mobility?"
                    {...register("impactOnMobility", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.impactOnMobility && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactOnMood">Impact on Mood</Label>
                  <Textarea
                    id="impactOnMood"
                    placeholder="How does the pain affect mood?"
                    {...register("impactOnMood")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactOnAppetite">Impact on Appetite</Label>
                  <Textarea
                    id="impactOnAppetite"
                    placeholder="How does the pain affect appetite?"
                    {...register("impactOnAppetite")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactOnSocialActivities">
                    Impact on Social Activities
                  </Label>
                  <Textarea
                    id="impactOnSocialActivities"
                    placeholder="How does the pain affect social activities?"
                    {...register("impactOnSocialActivities")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impactOnADLs">
                    Impact on Activities of Daily Living
                  </Label>
                  <Textarea
                    id="impactOnADLs"
                    placeholder="How does the pain affect ADLs?"
                    {...register("impactOnADLs")}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3">
                  Functional Impact Assessment
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="functionalLimitations">
                      Functional Limitations
                    </Label>
                    <Controller
                      name="functionalLimitations"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select functional limitation level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              None - No limitations
                            </SelectItem>
                            <SelectItem value="mild">
                              Mild - Minimal impact on function
                            </SelectItem>
                            <SelectItem value="moderate">
                              Moderate - Significant impact on some activities
                            </SelectItem>
                            <SelectItem value="severe">
                              Severe - Major limitations in multiple areas
                            </SelectItem>
                            <SelectItem value="complete">
                              Complete - Unable to perform most activities
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="painInterference">
                      Pain Interference with Daily Life
                    </Label>
                    <Controller
                      name="painInterference"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select interference level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              None - No interference
                            </SelectItem>
                            <SelectItem value="mild">
                              Mild - Noticeable but manageable
                            </SelectItem>
                            <SelectItem value="moderate">
                              Moderate - Regularly interferes
                            </SelectItem>
                            <SelectItem value="severe">
                              Severe - Constantly interferes
                            </SelectItem>
                            <SelectItem value="extreme">
                              Extreme - Prevents normal functioning
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pain Management Section */}
            <TabsContent value="pain-management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">
                    Current Pain Medications
                  </Label>
                  <Textarea
                    id="currentMedications"
                    placeholder="List current pain medications, dosage, and frequency"
                    {...register("currentMedications", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.currentMedications && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicationEffectiveness">
                    Medication Effectiveness
                  </Label>
                  <Textarea
                    id="medicationEffectiveness"
                    placeholder="Describe how effective the medications are"
                    {...register("medicationEffectiveness", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.medicationEffectiveness && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nonPharmacologicalInterventions">
                    Non-Pharmacological Interventions
                  </Label>
                  <Textarea
                    id="nonPharmacologicalInterventions"
                    placeholder="Describe any non-medication interventions used"
                    {...register("nonPharmacologicalInterventions")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interventionEffectiveness">
                    Intervention Effectiveness
                  </Label>
                  <Textarea
                    id="interventionEffectiveness"
                    placeholder="Describe how effective the interventions are"
                    {...register("interventionEffectiveness")}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="patientKnowledge">
                    Patient Knowledge of Pain Management
                  </Label>
                  <Textarea
                    id="patientKnowledge"
                    placeholder="Assess patient's understanding of pain management"
                    {...register("patientKnowledge")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientCopingStrategies">
                    Patient Coping Strategies
                  </Label>
                  <Textarea
                    id="patientCopingStrategies"
                    placeholder="Describe patient's coping strategies"
                    {...register("patientCopingStrategies")}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label className="mb-2 block">
                  Recommended Interventions (select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {painInterventions.map((intervention) => (
                    <div
                      key={intervention}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`intervention-${intervention}`}
                        checked={selectedInterventions.includes(intervention)}
                        onCheckedChange={() =>
                          handleInterventionChange(intervention)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`intervention-${intervention}`}
                        className="text-sm font-normal"
                      >
                        {intervention}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Pain Management Plan Section */}
            <TabsContent value="management-plan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shortTermGoals">Short-Term Goals</Label>
                  <Textarea
                    id="shortTermGoals"
                    placeholder="List short-term pain management goals"
                    {...register("shortTermGoals", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.shortTermGoals && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longTermGoals">Long-Term Goals</Label>
                  <Textarea
                    id="longTermGoals"
                    placeholder="List long-term pain management goals"
                    {...register("longTermGoals")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicationPlan">Medication Plan</Label>
                  <Textarea
                    id="medicationPlan"
                    placeholder="Describe medication plan"
                    {...register("medicationPlan", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.medicationPlan && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nonPharmacologicalPlan">
                    Non-Pharmacological Plan
                  </Label>
                  <Textarea
                    id="nonPharmacologicalPlan"
                    placeholder="Describe non-medication interventions plan"
                    {...register("nonPharmacologicalPlan")}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="educationPlan">Patient Education Plan</Label>
                  <Textarea
                    id="educationPlan"
                    placeholder="Describe patient education plan"
                    {...register("educationPlan")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpPlan">Follow-Up Plan</Label>
                  <Textarea
                    id="followUpPlan"
                    placeholder="Describe follow-up plan"
                    {...register("followUpPlan", { required: true })}
                    disabled={readOnly}
                  />
                  {errors.followUpPlan && (
                    <p className="text-sm text-red-500">Required field</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="referrals">Referrals</Label>
                <Textarea
                  id="referrals"
                  placeholder="List any referrals needed"
                  {...register("referrals")}
                  disabled={readOnly}
                />
              </div>

              {/* DOH Compliance Validator */}
              <DOHComplianceValidator
                formData={watch()}
                formType="pain_assessment"
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
                  <span className="font-medium">Form Type:</span> Pain
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
                By signing, I confirm that this pain assessment is accurate and
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

export default PainAssessmentForm;

interface SignatureStroke {
  timestamp: number;
  velocity?: number;
  pressure: number;
}
