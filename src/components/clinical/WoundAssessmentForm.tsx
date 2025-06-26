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
  Camera,
  Ruler,
  Droplets,
  Bandage,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Eye,
  Palette,
  Thermometer,
} from "lucide-react";

interface WoundAssessmentFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Wound types
const woundTypes = [
  "Pressure Ulcer/Injury",
  "Diabetic Ulcer",
  "Venous Ulcer",
  "Arterial Ulcer",
  "Surgical Wound",
  "Traumatic Wound",
  "Burn",
  "Laceration",
  "Abrasion",
  "Puncture",
  "Other",
];

// Wound locations
const woundLocations = [
  "Sacrum",
  "Coccyx",
  "Heel - Left",
  "Heel - Right",
  "Ankle - Left",
  "Ankle - Right",
  "Foot - Left",
  "Foot - Right",
  "Leg - Left",
  "Leg - Right",
  "Hip - Left",
  "Hip - Right",
  "Buttock - Left",
  "Buttock - Right",
  "Back",
  "Shoulder - Left",
  "Shoulder - Right",
  "Elbow - Left",
  "Elbow - Right",
  "Arm - Left",
  "Arm - Right",
  "Hand - Left",
  "Hand - Right",
  "Abdomen",
  "Chest",
  "Other",
];

// Wound stages (pressure ulcers)
const pressureUlcerStages = [
  "Stage 1 - Non-blanchable erythema",
  "Stage 2 - Partial thickness skin loss",
  "Stage 3 - Full thickness skin loss",
  "Stage 4 - Full thickness tissue loss",
  "Unstageable - Obscured full thickness",
  "Deep Tissue Injury - Purple/maroon",
];

// Wound bed characteristics
const woundBedTypes = [
  "Granulation tissue",
  "Slough",
  "Eschar",
  "Necrotic tissue",
  "Epithelial tissue",
  "Bone visible",
  "Tendon visible",
  "Muscle visible",
];

// Exudate types
const exudateTypes = [
  "None",
  "Serous",
  "Serosanguineous",
  "Sanguineous",
  "Purulent",
  "Seropurulent",
];

// Wound edges
const woundEdgeTypes = [
  "Attached",
  "Not attached",
  "Rolled under",
  "Thickened",
  "Fibrotic",
  "Hyperkeratotic",
];

// Periwound skin conditions
const periwoundConditions = [
  "Normal",
  "Erythema",
  "Edema",
  "Induration",
  "Maceration",
  "Excoriation",
  "Callus",
  "Hyperkeratosis",
  "Discoloration",
];

// Treatment interventions
const treatmentInterventions = [
  "Wound cleansing",
  "Debridement - Sharp",
  "Debridement - Enzymatic",
  "Debridement - Autolytic",
  "Debridement - Mechanical",
  "Topical antimicrobial",
  "Systemic antibiotics",
  "Negative pressure therapy",
  "Compression therapy",
  "Offloading",
  "Moisture management",
  "Pain management",
  "Nutritional support",
  "Patient education",
];

const WoundAssessmentForm: React.FC<WoundAssessmentFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("wound-identification");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedWoundBedTypes, setSelectedWoundBedTypes] = useState<string[]>(
    [],
  );
  const [selectedPeriwoundConditions, setSelectedPeriwoundConditions] =
    useState<string[]>([]);
  const [selectedTreatmentInterventions, setSelectedTreatmentInterventions] =
    useState<string[]>([]);
  const [woundPhotos, setWoundPhotos] = useState<string[]>([]);
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
      // Wound Identification
      woundType: "",
      woundLocation: "",
      woundNumber: "1",
      dateFirstNoticed: "",
      dateOfAssessment: new Date().toISOString().split("T")[0],
      assessmentFrequency: "weekly",

      // Wound Measurements
      length: "",
      width: "",
      depth: "",
      area: "",
      volume: "",
      measurementMethod: "ruler",
      tunneling: "no",
      tunnelingDepth: "",
      tunnelingDirection: "",
      undermining: "no",
      underminingDepth: "",
      underminingDirection: "",

      // Wound Staging (for pressure ulcers)
      pressureUlcerStage: "",
      stageRationale: "",

      // Wound Bed Assessment
      woundBedPercentages: {
        granulation: "0",
        slough: "0",
        eschar: "0",
        necrotic: "0",
        epithelial: "0",
        other: "0",
      },
      woundBedDescription: "",

      // Exudate Assessment
      exudateType: "none",
      exudateAmount: "none",
      exudateOdor: "none",
      exudateColor: "",
      exudateConsistency: "",

      // Wound Edges and Periwound
      woundEdgeType: "",
      woundEdgeDescription: "",
      periwoundSkinTemp: "normal",
      periwoundSkinColor: "normal",
      periwoundSkinIntegrity: "intact",

      // Pain Assessment
      painAtRest: "0",
      painWithMovement: "0",
      painWithDressing: "0",
      painDescription: "",
      painManagement: "",

      // Signs of Infection
      signsOfInfection: "no",
      infectionSigns: [],
      cultureObtained: "no",
      cultureResults: "",

      // Healing Progress
      healingProgress: "stable",
      healingBarriers: "",
      previousTreatments: "",
      treatmentResponse: "",

      // Current Treatment Plan
      cleansingAgent: "",
      primaryDressing: "",
      secondaryDressing: "",
      dressingChangeFrequency: "daily",
      offloadingDevices: "",
      compressionTherapy: "no",

      // Goals and Plan
      shortTermGoals: "",
      longTermGoals: "",
      expectedHealingTime: "",
      followUpPlan: "",
      patientEducation: "",
      caregiverEducation: "",
      referrals: "",
    },
  });

  const watchWoundType = watch("woundType");
  const watchSignsOfInfection = watch("signsOfInfection");
  const watchTunneling = watch("tunneling");
  const watchUndermining = watch("undermining");
  const watchHealingProgress = watch("healingProgress");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "woundType",
      "woundLocation",
      "dateFirstNoticed",
      "dateOfAssessment",
      "length",
      "width",
      "exudateType",
      "exudateAmount",
      "woundEdgeType",
      "painAtRest",
      "signsOfInfection",
      "healingProgress",
      "primaryDressing",
      "shortTermGoals",
      "followUpPlan",
    ];

    const totalRequiredFields = requiredFields.length;
    const filledRequiredFields = requiredFields.filter(
      (field) =>
        formValues[field] !== "" &&
        formValues[field] !== null &&
        formValues[field] !== undefined,
    ).length;

    // Add additional completion points
    let additionalPoints = 0;
    if (selectedWoundBedTypes.length > 0) additionalPoints += 1;
    if (selectedPeriwoundConditions.length > 0) additionalPoints += 1;
    if (selectedTreatmentInterventions.length > 0) additionalPoints += 1;
    if (woundPhotos.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 4)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [
    watch,
    selectedWoundBedTypes,
    selectedPeriwoundConditions,
    selectedTreatmentInterventions,
    woundPhotos,
  ]);

  const handleWoundBedTypeChange = (type: string) => {
    setSelectedWoundBedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handlePeriwoundConditionChange = (condition: string) => {
    setSelectedPeriwoundConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    );
  };

  const handleTreatmentInterventionChange = (intervention: string) => {
    setSelectedTreatmentInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention],
    );
  };

  const handlePhotoCapture = () => {
    // Placeholder for photo capture functionality
    const photoId = `photo_${Date.now()}`;
    setWoundPhotos((prev) => [...prev, photoId]);
  };

  const removePhoto = (photoId: string) => {
    setWoundPhotos((prev) => prev.filter((id) => id !== photoId));
  };

  const handleSignatureCapture = (data: string) => {
    setSignatureData(data);
  };

  const handleDOHComplianceCheck = (result: {
    isCompliant: boolean;
    issues: string[];
  }) => {
    setDohCompliance(result);
    if (!result.isCompliant && result.issues.length > 0) {
      const tabMapping = {
        "wound-identification": ["wound type", "location", "identification"],
        measurements: ["measurement", "size", "dimension", "length", "width"],
        assessment: ["assessment", "bed", "exudate", "edge"],
        healing: ["healing", "progress", "infection", "pain"],
        treatment: ["treatment", "dressing", "plan", "intervention"],
        documentation: ["photo", "documentation", "goal", "education"],
      };

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
    if (!dohCompliance.isCompliant) {
      console.error(
        "Cannot submit form with DOH compliance issues:",
        dohCompliance.issues,
      );
      return;
    }

    const formData = {
      ...data,
      selectedWoundBedTypes,
      selectedPeriwoundConditions,
      selectedTreatmentInterventions,
      woundPhotos,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "wound_assessment",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `wound_assessment_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "wound_assessment",
            patientId,
            episodeId,
            signatureReason: "Wound assessment completion",
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

    if (onSave) {
      onSave(formData);
    }
  };

  const validateSignature = () => {
    if (!userProfile) return false;

    const signaturePayload = {
      documentId: `wound_assessment_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  };

  const getHealingProgressColor = (progress: string) => {
    switch (progress) {
      case "improving":
        return "bg-green-100 text-green-800";
      case "stable":
        return "bg-blue-100 text-blue-800";
      case "deteriorating":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Wound Assessment Form</CardTitle>
              <CardDescription>
                Comprehensive wound evaluation with measurement, staging, and
                treatment planning
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
              <TabsTrigger value="wound-identification">
                <Eye className="mr-2 h-4 w-4" /> Identification
              </TabsTrigger>
              <TabsTrigger value="measurements">
                <Ruler className="mr-2 h-4 w-4" /> Measurements
              </TabsTrigger>
              <TabsTrigger value="assessment">
                <Activity className="mr-2 h-4 w-4" /> Assessment
              </TabsTrigger>
              <TabsTrigger value="healing">
                <TrendingUp className="mr-2 h-4 w-4" /> Healing
              </TabsTrigger>
              <TabsTrigger value="treatment">
                <Bandage className="mr-2 h-4 w-4" /> Treatment
              </TabsTrigger>
              <TabsTrigger value="documentation">
                <Camera className="mr-2 h-4 w-4" /> Documentation
              </TabsTrigger>
            </TabsList>

            {/* Wound Identification Section */}
            <TabsContent value="wound-identification" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="woundType">Wound Type</Label>
                    <Controller
                      name="woundType"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select wound type" />
                          </SelectTrigger>
                          <SelectContent>
                            {woundTypes.map((type) => (
                              <SelectItem
                                key={type}
                                value={type.toLowerCase().replace(/\s+/g, "_")}
                              >
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.woundType && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="woundLocation">Wound Location</Label>
                    <Controller
                      name="woundLocation"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select wound location" />
                          </SelectTrigger>
                          <SelectContent>
                            {woundLocations.map((location) => (
                              <SelectItem
                                key={location}
                                value={location
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}
                              >
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.woundLocation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="woundNumber">
                      Wound Number (if multiple)
                    </Label>
                    <Input
                      id="woundNumber"
                      type="number"
                      min="1"
                      {...register("woundNumber")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFirstNoticed">Date First Noticed</Label>
                    <Input
                      id="dateFirstNoticed"
                      type="date"
                      {...register("dateFirstNoticed", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.dateFirstNoticed && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfAssessment">Date of Assessment</Label>
                    <Input
                      id="dateOfAssessment"
                      type="date"
                      {...register("dateOfAssessment", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.dateOfAssessment && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessmentFrequency">
                      Assessment Frequency
                    </Label>
                    <Controller
                      name="assessmentFrequency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="every_other_day">
                              Every Other Day
                            </SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="as_needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {watchWoundType === "pressure_ulcer/injury" && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Pressure Ulcer Staging</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pressureUlcerStage">
                        Pressure Ulcer Stage
                      </Label>
                      <Controller
                        name="pressureUlcerStage"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {pressureUlcerStages.map((stage) => (
                                <SelectItem
                                  key={stage}
                                  value={stage
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")}
                                >
                                  {stage}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stageRationale">Staging Rationale</Label>
                      <Textarea
                        id="stageRationale"
                        placeholder="Explain the rationale for the selected stage"
                        {...register("stageRationale")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Measurements Section */}
            <TabsContent value="measurements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Wound Dimensions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length">Length (cm)</Label>
                        <Input
                          id="length"
                          type="number"
                          step="0.1"
                          min="0"
                          {...register("length", { required: true })}
                          disabled={readOnly}
                        />
                        {errors.length && (
                          <p className="text-sm text-red-500">Required field</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="width">Width (cm)</Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.1"
                          min="0"
                          {...register("width", { required: true })}
                          disabled={readOnly}
                        />
                        {errors.width && (
                          <p className="text-sm text-red-500">Required field</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depth">Depth (cm)</Label>
                        <Input
                          id="depth"
                          type="number"
                          step="0.1"
                          min="0"
                          {...register("depth")}
                          disabled={readOnly}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area">Area (cm²)</Label>
                        <Input
                          id="area"
                          type="number"
                          step="0.1"
                          min="0"
                          {...register("area")}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurementMethod">
                      Measurement Method
                    </Label>
                    <Controller
                      name="measurementMethod"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ruler">Ruler</SelectItem>
                            <SelectItem value="wound_measuring_guide">
                              Wound Measuring Guide
                            </SelectItem>
                            <SelectItem value="digital_planimetry">
                              Digital Planimetry
                            </SelectItem>
                            <SelectItem value="photography_with_scale">
                              Photography with Scale
                            </SelectItem>
                            <SelectItem value="acetate_tracing">
                              Acetate Tracing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tunneling">Tunneling Present</Label>
                      <Controller
                        name="tunneling"
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

                    {watchTunneling === "yes" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="tunnelingDepth">
                            Tunneling Depth (cm)
                          </Label>
                          <Input
                            id="tunnelingDepth"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register("tunnelingDepth")}
                            disabled={readOnly}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tunnelingDirection">
                            Tunneling Direction (clock position)
                          </Label>
                          <Input
                            id="tunnelingDirection"
                            placeholder="e.g., 3 o'clock"
                            {...register("tunnelingDirection")}
                            disabled={readOnly}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="undermining">Undermining Present</Label>
                      <Controller
                        name="undermining"
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

                    {watchUndermining === "yes" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="underminingDepth">
                            Undermining Depth (cm)
                          </Label>
                          <Input
                            id="underminingDepth"
                            type="number"
                            step="0.1"
                            min="0"
                            {...register("underminingDepth")}
                            disabled={readOnly}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="underminingDirection">
                            Undermining Direction (clock position)
                          </Label>
                          <Input
                            id="underminingDirection"
                            placeholder="e.g., 9-12 o'clock"
                            {...register("underminingDirection")}
                            disabled={readOnly}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Assessment Section */}
            <TabsContent value="assessment" className="space-y-4">
              <div className="space-y-6">
                {/* Wound Bed Assessment */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Wound Bed Assessment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="granulation">
                        Granulation Tissue (%)
                      </Label>
                      <Input
                        id="granulation"
                        type="number"
                        min="0"
                        max="100"
                        {...register("woundBedPercentages.granulation")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slough">Slough (%)</Label>
                      <Input
                        id="slough"
                        type="number"
                        min="0"
                        max="100"
                        {...register("woundBedPercentages.slough")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eschar">Eschar (%)</Label>
                      <Input
                        id="eschar"
                        type="number"
                        min="0"
                        max="100"
                        {...register("woundBedPercentages.eschar")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="necrotic">Necrotic Tissue (%)</Label>
                      <Input
                        id="necrotic"
                        type="number"
                        min="0"
                        max="100"
                        {...register("woundBedPercentages.necrotic")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="epithelial">Epithelial Tissue (%)</Label>
                      <Input
                        id="epithelial"
                        type="number"
                        min="0"
                        max="100"
                        {...register("woundBedPercentages.epithelial")}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="other">Other (%)</Label>
                      <Input
                        id="other"
                        type="number"
                        min="0"
                        max="100"
                        {...register("woundBedPercentages.other")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="woundBedDescription">
                      Wound Bed Description
                    </Label>
                    <Textarea
                      id="woundBedDescription"
                      placeholder="Describe the wound bed characteristics"
                      {...register("woundBedDescription")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Exudate Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Exudate Assessment</h3>
                    <div className="space-y-2">
                      <Label htmlFor="exudateType">Exudate Type</Label>
                      <Controller
                        name="exudateType"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select exudate type" />
                            </SelectTrigger>
                            <SelectContent>
                              {exudateTypes.map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type.toLowerCase()}
                                >
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.exudateType && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exudateAmount">Exudate Amount</Label>
                      <Controller
                        name="exudateAmount"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select amount" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="scant">Scant</SelectItem>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="copious">Copious</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.exudateAmount && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exudateOdor">Exudate Odor</Label>
                      <Controller
                        name="exudateOdor"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select odor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="mild">Mild</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="strong">Strong</SelectItem>
                              <SelectItem value="foul">Foul</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Wound Edges & Periwound</h3>
                    <div className="space-y-2">
                      <Label htmlFor="woundEdgeType">Wound Edge Type</Label>
                      <Controller
                        name="woundEdgeType"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select edge type" />
                            </SelectTrigger>
                            <SelectContent>
                              {woundEdgeTypes.map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type
                                    .toLowerCase()
                                    .replace(/\s+/g, "_")}
                                >
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.woundEdgeType && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periwoundSkinTemp">
                        Periwound Skin Temperature
                      </Label>
                      <Controller
                        name="periwoundSkinTemp"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select temperature" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="hot">Hot</SelectItem>
                              <SelectItem value="cool">Cool</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periwoundSkinColor">
                        Periwound Skin Color
                      </Label>
                      <Controller
                        name="periwoundSkinColor"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="pink">Pink</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="brown">Brown</SelectItem>
                              <SelectItem value="black">Black</SelectItem>
                              <SelectItem value="white">White</SelectItem>
                              <SelectItem value="yellow">Yellow</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Periwound Conditions */}
                <div className="mt-6">
                  <Label className="mb-2 block">
                    Periwound Skin Conditions (select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {periwoundConditions.map((condition) => (
                      <div
                        key={condition}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`periwound-${condition}`}
                          checked={selectedPeriwoundConditions.includes(
                            condition,
                          )}
                          onCheckedChange={() =>
                            handlePeriwoundConditionChange(condition)
                          }
                          disabled={readOnly}
                        />
                        <Label
                          htmlFor={`periwound-${condition}`}
                          className="text-sm font-normal"
                        >
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Healing Progress Section */}
            <TabsContent value="healing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="painAtRest">Pain at Rest (0-10)</Label>
                    <Controller
                      name="painAtRest"
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
                    {errors.painAtRest && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painWithMovement">
                      Pain with Movement (0-10)
                    </Label>
                    <Controller
                      name="painWithMovement"
                      control={control}
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
                    <Label htmlFor="painWithDressing">
                      Pain with Dressing Change (0-10)
                    </Label>
                    <Controller
                      name="painWithDressing"
                      control={control}
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
                    <Label htmlFor="painDescription">Pain Description</Label>
                    <Textarea
                      id="painDescription"
                      placeholder="Describe the nature and characteristics of pain"
                      {...register("painDescription")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signsOfInfection">
                      Signs of Infection Present
                    </Label>
                    <Controller
                      name="signsOfInfection"
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
                            <SelectItem value="suspected">Suspected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.signsOfInfection && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {watchSignsOfInfection !== "no" && (
                    <>
                      <div className="space-y-2">
                        <Label>
                          Signs of Infection (select all that apply)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Increased pain",
                            "Erythema",
                            "Warmth",
                            "Swelling",
                            "Purulent drainage",
                            "Foul odor",
                            "Delayed healing",
                            "Fever",
                            "Increased white blood cells",
                            "Friable granulation tissue",
                          ].map((sign) => (
                            <div
                              key={sign}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`infection-${sign}`}
                                {...register("infectionSigns")}
                                value={sign}
                                disabled={readOnly}
                              />
                              <Label
                                htmlFor={`infection-${sign}`}
                                className="text-sm font-normal"
                              >
                                {sign}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cultureObtained">
                          Culture Obtained
                        </Label>
                        <Controller
                          name="cultureObtained"
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
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cultureResults">Culture Results</Label>
                        <Textarea
                          id="cultureResults"
                          placeholder="Enter culture results if available"
                          {...register("cultureResults")}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="healingProgress">Healing Progress</Label>
                    <Controller
                      name="healingProgress"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select progress" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="improving">Improving</SelectItem>
                            <SelectItem value="stable">Stable</SelectItem>
                            <SelectItem value="deteriorating">
                              Deteriorating
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.healingProgress && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium">Healing Progress Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">Current Status</div>
                    <Badge
                      className={getHealingProgressColor(watchHealingProgress)}
                    >
                      {watchHealingProgress === "improving"
                        ? "Improving"
                        : watchHealingProgress === "stable"
                          ? "Stable"
                          : "Deteriorating"}
                    </Badge>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">Pain Level</div>
                    <div className="text-xl font-bold">
                      {watch("painAtRest")}/10
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="text-sm text-gray-600">Infection Risk</div>
                    <Badge
                      variant={
                        watchSignsOfInfection === "no"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {watchSignsOfInfection === "no"
                        ? "Low"
                        : watchSignsOfInfection === "suspected"
                          ? "Moderate"
                          : "High"}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Treatment Section */}
            <TabsContent value="treatment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">
                    Current Treatment Plan
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="cleansingAgent">Cleansing Agent</Label>
                    <Input
                      id="cleansingAgent"
                      placeholder="e.g., Normal saline, wound cleanser"
                      {...register("cleansingAgent")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryDressing">Primary Dressing</Label>
                    <Input
                      id="primaryDressing"
                      placeholder="e.g., Hydrocolloid, foam, alginate"
                      {...register("primaryDressing", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.primaryDressing && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryDressing">
                      Secondary Dressing
                    </Label>
                    <Input
                      id="secondaryDressing"
                      placeholder="e.g., Gauze, transparent film"
                      {...register("secondaryDressing")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dressingChangeFrequency">
                      Dressing Change Frequency
                    </Label>
                    <Controller
                      name="dressingChangeFrequency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="twice_daily">
                              Twice Daily
                            </SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="every_other_day">
                              Every Other Day
                            </SelectItem>
                            <SelectItem value="every_3_days">
                              Every 3 Days
                            </SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as_needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">
                    Additional Interventions
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="offloadingDevices">
                      Offloading Devices
                    </Label>
                    <Input
                      id="offloadingDevices"
                      placeholder="e.g., Heel protectors, pressure redistribution"
                      {...register("offloadingDevices")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compressionTherapy">
                      Compression Therapy
                    </Label>
                    <Controller
                      name="compressionTherapy"
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
                            <SelectItem value="contraindicated">
                              Contraindicated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painManagement">Pain Management</Label>
                    <Textarea
                      id="painManagement"
                      placeholder="Describe pain management strategies"
                      {...register("painManagement")}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label className="mb-2 block">
                  Treatment Interventions (select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {treatmentInterventions.map((intervention) => (
                    <div
                      key={intervention}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`treatment-${intervention}`}
                        checked={selectedTreatmentInterventions.includes(
                          intervention,
                        )}
                        onCheckedChange={() =>
                          handleTreatmentInterventionChange(intervention)
                        }
                        disabled={readOnly}
                      />
                      <Label
                        htmlFor={`treatment-${intervention}`}
                        className="text-sm font-normal"
                      >
                        {intervention}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Documentation Section */}
            <TabsContent value="documentation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Photo Documentation</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Capture wound photos for documentation and progress
                      tracking
                    </p>
                    <Button
                      type="button"
                      onClick={handlePhotoCapture}
                      disabled={readOnly}
                      className="mb-2"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Photo
                    </Button>
                    <p className="text-xs text-gray-500">
                      Photos should include a measuring device for scale
                    </p>
                  </div>

                  {woundPhotos.length > 0 && (
                    <div className="space-y-2">
                      <Label>Captured Photos ({woundPhotos.length})</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {woundPhotos.map((photoId, index) => (
                          <div
                            key={photoId}
                            className="relative bg-gray-100 p-4 rounded border"
                          >
                            <div className="text-center">
                              <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-600">
                                Photo {index + 1}
                              </p>
                              <p className="text-xs text-gray-500">{photoId}</p>
                            </div>
                            {!readOnly && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removePhoto(photoId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Goals and Planning</h3>
                  <div className="space-y-2">
                    <Label htmlFor="shortTermGoals">
                      Short-Term Goals (1-2 weeks)
                    </Label>
                    <Textarea
                      id="shortTermGoals"
                      placeholder="List short-term wound healing goals"
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
                      placeholder="List long-term wound healing goals"
                      {...register("longTermGoals")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedHealingTime">
                      Expected Healing Time
                    </Label>
                    <Input
                      id="expectedHealingTime"
                      placeholder="e.g., 4-6 weeks"
                      {...register("expectedHealingTime")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="followUpPlan">Follow-Up Plan</Label>
                    <Textarea
                      id="followUpPlan"
                      placeholder="Describe follow-up assessment schedule and criteria"
                      {...register("followUpPlan", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.followUpPlan && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="patientEducation">
                    Patient Education Provided
                  </Label>
                  <Textarea
                    id="patientEducation"
                    placeholder="Document patient education topics covered"
                    {...register("patientEducation")}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caregiverEducation">
                    Caregiver Education Provided
                  </Label>
                  <Textarea
                    id="caregiverEducation"
                    placeholder="Document caregiver education topics covered"
                    {...register("caregiverEducation")}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referrals">Referrals</Label>
                <Textarea
                  id="referrals"
                  placeholder="List any referrals made (wound specialist, vascular surgeon, etc.)"
                  {...register("referrals")}
                  disabled={readOnly}
                />
              </div>

              {/* DOH Compliance Validator */}
              <DOHComplianceValidator
                formData={watch()}
                formType="wound_assessment"
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
                  <span className="font-medium">Form Type:</span> Wound
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
                By signing, I confirm that this wound assessment is accurate and
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

export default WoundAssessmentForm;
