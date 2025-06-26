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
  Wind,
  Thermometer,
  Gauge,
  Stethoscope,
  Zap,
  Target,
  TrendingUp,
  Droplets,
} from "lucide-react";

interface RespiratoryAssessmentFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Breathing patterns
const breathingPatterns = [
  "Normal",
  "Tachypnea",
  "Bradypnea",
  "Dyspnea",
  "Orthopnea",
  "Paroxysmal Nocturnal Dyspnea",
  "Cheyne-Stokes",
  "Kussmaul",
  "Biot's",
  "Apneustic",
  "Ataxic",
];

// Cough characteristics
const coughTypes = [
  "None",
  "Dry",
  "Productive",
  "Hacking",
  "Barking",
  "Whooping",
  "Chronic",
];

// Sputum characteristics
const sputumTypes = [
  "None",
  "Clear",
  "White",
  "Yellow",
  "Green",
  "Brown",
  "Pink/Frothy",
  "Blood-tinged",
  "Purulent",
];

// Chest sounds
const chestSounds = [
  "Clear",
  "Crackles (Fine)",
  "Crackles (Coarse)",
  "Wheeze",
  "Rhonchi",
  "Stridor",
  "Pleural Friction Rub",
  "Diminished",
  "Absent",
];

// Respiratory symptoms
const respiratorySymptoms = [
  "Shortness of breath",
  "Chest pain",
  "Cough",
  "Wheezing",
  "Chest tightness",
  "Fatigue",
  "Dizziness",
  "Cyanosis",
  "Hemoptysis",
  "Night sweats",
];

// Oxygen delivery methods
const oxygenDeliveryMethods = [
  "Room Air",
  "Nasal Cannula",
  "Simple Face Mask",
  "Non-rebreather Mask",
  "Venturi Mask",
  "CPAP",
  "BiPAP",
  "Mechanical Ventilation",
  "High Flow Nasal Cannula",
];

const RespiratoryAssessmentForm: React.FC<RespiratoryAssessmentFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("breathing-pattern");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedChestSounds, setSelectedChestSounds] = useState<string[]>([]);
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
      // Breathing Pattern Assessment
      respiratoryRate: "",
      breathingPattern: "normal",
      breathingEffort: "normal",
      useOfAccessoryMuscles: "no",
      chestExpansion: "symmetrical",
      breathSounds: "clear",

      // Oxygen Saturation
      oxygenSaturation: "",
      oxygenSaturationMethod: "pulse_oximetry",
      oxygenTherapy: "no",
      oxygenDeliveryMethod: "room_air",
      oxygenFlowRate: "",
      fiO2: "",

      // Cough Assessment
      coughPresent: "no",
      coughType: "none",
      coughFrequency: "none",
      coughTiming: "none",
      sputumProduction: "no",
      sputumType: "none",
      sputumAmount: "none",
      sputumConsistency: "",

      // Chest Assessment
      chestShape: "normal",
      chestMovement: "symmetrical",
      tactileFremitus: "normal",
      percussion: "resonant",
      auscultationFindings: "",

      // Respiratory Symptoms
      dyspneaAtRest: "no",
      dyspneaOnExertion: "no",
      orthopnea: "no",
      pnd: "no",
      chestPain: "no",
      chestPainDescription: "",
      wheezing: "no",

      // Functional Assessment
      exerciseTolerance: "",
      adlLimitations: "",
      sleepDisturbances: "no",
      fatigueLevel: "none",

      // Airway Management
      airwayPatency: "patent",
      secretionManagement: "independent",
      suctioning: "no",
      suctioningFrequency: "",
      tracheostomy: "no",
      tracheostomyType: "",

      // Medications
      bronchodilators: "no",
      corticosteroids: "no",
      mucolytics: "no",
      antibiotics: "no",
      currentMedications: "",
      medicationCompliance: "good",

      // Care Plan
      respiratoryGoals: "",
      interventions: "",
      patientEducation: "",
      followUpPlan: "",
      emergencyPlan: "",
    },
  });

  const watchOxygenTherapy = watch("oxygenTherapy");
  const watchCoughPresent = watch("coughPresent");
  const watchSputumProduction = watch("sputumProduction");
  const watchChestPain = watch("chestPain");
  const watchTraceostomy = watch("tracheostomy");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "respiratoryRate",
      "breathingPattern",
      "oxygenSaturation",
      "coughPresent",
      "dyspneaAtRest",
      "airwayPatency",
      "respiratoryGoals",
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
    if (selectedSymptoms.length > 0) additionalPoints += 1;
    if (selectedChestSounds.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 2)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [watch, selectedSymptoms, selectedChestSounds]);

  const handleSymptomChange = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  const handleChestSoundChange = (sound: string) => {
    setSelectedChestSounds((prev) =>
      prev.includes(sound) ? prev.filter((s) => s !== sound) : [...prev, sound],
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
    if (!result.isCompliant && result.issues.length > 0) {
      const tabMapping = {
        "breathing-pattern": ["breathing", "respiratory rate", "pattern"],
        "oxygen-assessment": ["oxygen", "saturation", "therapy"],
        "cough-assessment": ["cough", "sputum", "secretion"],
        "chest-assessment": ["chest", "auscultation", "percussion"],
        symptoms: ["symptom", "dyspnea", "pain"],
        "airway-management": ["airway", "management", "suction"],
        "care-plan": ["plan", "goal", "education", "follow up"],
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
      selectedSymptoms,
      selectedChestSounds,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "respiratory_assessment",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `respiratory_assessment_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "respiratory_assessment",
            patientId,
            episodeId,
            signatureReason: "Respiratory assessment completion",
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
      documentId: `respiratory_assessment_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Respiratory Assessment Form</CardTitle>
              <CardDescription>
                Comprehensive respiratory evaluation including breathing
                patterns, oxygen saturation, and airway management
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
              <TabsTrigger value="breathing-pattern">
                <Wind className="mr-2 h-4 w-4" /> Breathing
              </TabsTrigger>
              <TabsTrigger value="oxygen-assessment">
                <Gauge className="mr-2 h-4 w-4" /> Oxygen
              </TabsTrigger>
              <TabsTrigger value="cough-assessment">
                <Droplets className="mr-2 h-4 w-4" /> Cough
              </TabsTrigger>
              <TabsTrigger value="chest-assessment">
                <Stethoscope className="mr-2 h-4 w-4" /> Chest
              </TabsTrigger>
              <TabsTrigger value="symptoms">
                <Activity className="mr-2 h-4 w-4" /> Symptoms
              </TabsTrigger>
              <TabsTrigger value="airway-management">
                <Zap className="mr-2 h-4 w-4" /> Airway
              </TabsTrigger>
              <TabsTrigger value="care-plan">
                <Target className="mr-2 h-4 w-4" /> Care Plan
              </TabsTrigger>
            </TabsList>

            {/* Breathing Pattern Section */}
            <TabsContent value="breathing-pattern" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate">
                      Respiratory Rate (breaths/min)
                    </Label>
                    <Input
                      id="respiratoryRate"
                      type="number"
                      min="0"
                      max="60"
                      placeholder="e.g., 16"
                      {...register("respiratoryRate", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.respiratoryRate && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breathingPattern">Breathing Pattern</Label>
                    <Controller
                      name="breathingPattern"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select breathing pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            {breathingPatterns.map((pattern) => (
                              <SelectItem
                                key={pattern}
                                value={pattern
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}
                              >
                                {pattern}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.breathingPattern && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breathingEffort">Breathing Effort</Label>
                    <Controller
                      name="breathingEffort"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select effort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="mild_distress">
                              Mild Distress
                            </SelectItem>
                            <SelectItem value="moderate_distress">
                              Moderate Distress
                            </SelectItem>
                            <SelectItem value="severe_distress">
                              Severe Distress
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="useOfAccessoryMuscles">
                      Use of Accessory Muscles
                    </Label>
                    <Controller
                      name="useOfAccessoryMuscles"
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
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chestExpansion">Chest Expansion</Label>
                    <Controller
                      name="chestExpansion"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select expansion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="symmetrical">
                              Symmetrical
                            </SelectItem>
                            <SelectItem value="asymmetrical">
                              Asymmetrical
                            </SelectItem>
                            <SelectItem value="reduced_left">
                              Reduced Left
                            </SelectItem>
                            <SelectItem value="reduced_right">
                              Reduced Right
                            </SelectItem>
                            <SelectItem value="reduced_bilateral">
                              Reduced Bilateral
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breathSounds">Breath Sounds</Label>
                    <Controller
                      name="breathSounds"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select breath sounds" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clear">Clear</SelectItem>
                            <SelectItem value="diminished">
                              Diminished
                            </SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="adventitious">
                              Adventitious
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      Breathing Assessment Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Respiratory Rate</div>
                        <div className="font-medium">
                          {watch("respiratoryRate") || "--"} bpm
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Pattern</div>
                        <div className="font-medium">
                          {watch("breathingPattern") || "--"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Oxygen Assessment Section */}
            <TabsContent value="oxygen-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation">
                      Oxygen Saturation (%)
                    </Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 98"
                      {...register("oxygenSaturation", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.oxygenSaturation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturationMethod">
                      Measurement Method
                    </Label>
                    <Controller
                      name="oxygenSaturationMethod"
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
                            <SelectItem value="pulse_oximetry">
                              Pulse Oximetry
                            </SelectItem>
                            <SelectItem value="arterial_blood_gas">
                              Arterial Blood Gas
                            </SelectItem>
                            <SelectItem value="co_oximetry">
                              Co-oximetry
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oxygenTherapy">Oxygen Therapy</Label>
                    <Controller
                      name="oxygenTherapy"
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
                </div>

                <div className="space-y-4">
                  {watchOxygenTherapy === "yes" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="oxygenDeliveryMethod">
                          Delivery Method
                        </Label>
                        <Controller
                          name="oxygenDeliveryMethod"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select delivery method" />
                              </SelectTrigger>
                              <SelectContent>
                                {oxygenDeliveryMethods.map((method) => (
                                  <SelectItem
                                    key={method}
                                    value={method
                                      .toLowerCase()
                                      .replace(/\s+/g, "_")}
                                  >
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="oxygenFlowRate">
                          Flow Rate (L/min)
                        </Label>
                        <Input
                          id="oxygenFlowRate"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="e.g., 2"
                          {...register("oxygenFlowRate")}
                          disabled={readOnly}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fiO2">FiO2 (%)</Label>
                        <Input
                          id="fiO2"
                          type="number"
                          min="21"
                          max="100"
                          placeholder="e.g., 28"
                          {...register("fiO2")}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Oxygen Status</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        SpO2:{" "}
                        <span className="font-medium">
                          {watch("oxygenSaturation") || "--"}%
                        </span>
                      </div>
                      <div>
                        Therapy:{" "}
                        <span className="font-medium">
                          {watchOxygenTherapy === "yes" ? "Active" : "None"}
                        </span>
                      </div>
                      {watchOxygenTherapy === "yes" && (
                        <div>
                          Flow Rate:{" "}
                          <span className="font-medium">
                            {watch("oxygenFlowRate") || "--"} L/min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Cough Assessment Section */}
            <TabsContent value="cough-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coughPresent">Cough Present</Label>
                    <Controller
                      name="coughPresent"
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
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.coughPresent && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {watchCoughPresent === "yes" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="coughType">Cough Type</Label>
                        <Controller
                          name="coughType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select cough type" />
                              </SelectTrigger>
                              <SelectContent>
                                {coughTypes.map((type) => (
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coughFrequency">Cough Frequency</Label>
                        <Controller
                          name="coughFrequency"
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
                                <SelectItem value="occasional">
                                  Occasional
                                </SelectItem>
                                <SelectItem value="frequent">
                                  Frequent
                                </SelectItem>
                                <SelectItem value="constant">
                                  Constant
                                </SelectItem>
                                <SelectItem value="paroxysmal">
                                  Paroxysmal
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sputumProduction">
                          Sputum Production
                        </Label>
                        <Controller
                          name="sputumProduction"
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

                <div className="space-y-4">
                  {watchSputumProduction === "yes" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sputumType">Sputum Type</Label>
                        <Controller
                          name="sputumType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select sputum type" />
                              </SelectTrigger>
                              <SelectContent>
                                {sputumTypes.map((type) => (
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sputumAmount">Sputum Amount</Label>
                        <Controller
                          name="sputumAmount"
                          control={control}
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
                                <SelectItem value="scant">Scant</SelectItem>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="copious">Copious</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sputumConsistency">
                          Sputum Consistency
                        </Label>
                        <Input
                          id="sputumConsistency"
                          placeholder="e.g., thick, thin, frothy"
                          {...register("sputumConsistency")}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}

                  {watchCoughPresent === "yes" && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Cough Summary</h3>
                      <div className="text-sm space-y-1">
                        <div>
                          Type:{" "}
                          <span className="font-medium">
                            {watch("coughType") || "--"}
                          </span>
                        </div>
                        <div>
                          Frequency:{" "}
                          <span className="font-medium">
                            {watch("coughFrequency") || "--"}
                          </span>
                        </div>
                        <div>
                          Productive:{" "}
                          <span className="font-medium">
                            {watchSputumProduction === "yes" ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Chest Assessment Section */}
            <TabsContent value="chest-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chestShape">Chest Shape</Label>
                    <Controller
                      name="chestShape"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select chest shape" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="barrel_chest">
                              Barrel Chest
                            </SelectItem>
                            <SelectItem value="pectus_excavatum">
                              Pectus Excavatum
                            </SelectItem>
                            <SelectItem value="pectus_carinatum">
                              Pectus Carinatum
                            </SelectItem>
                            <SelectItem value="kyphoscoliosis">
                              Kyphoscoliosis
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tactileFremitus">Tactile Fremitus</Label>
                    <Controller
                      name="tactileFremitus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fremitus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="increased">Increased</SelectItem>
                            <SelectItem value="decreased">Decreased</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="percussion">Percussion</Label>
                    <Controller
                      name="percussion"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select percussion note" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resonant">Resonant</SelectItem>
                            <SelectItem value="hyperresonant">
                              Hyperresonant
                            </SelectItem>
                            <SelectItem value="dull">Dull</SelectItem>
                            <SelectItem value="flat">Flat</SelectItem>
                            <SelectItem value="tympanic">Tympanic</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      Chest Sounds (select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {chestSounds.map((sound) => (
                        <div
                          key={sound}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`sound-${sound}`}
                            checked={selectedChestSounds.includes(sound)}
                            onCheckedChange={() =>
                              handleChestSoundChange(sound)
                            }
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`sound-${sound}`}
                            className="text-sm font-normal"
                          >
                            {sound}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auscultationFindings">
                      Auscultation Findings
                    </Label>
                    <Textarea
                      id="auscultationFindings"
                      placeholder="Describe detailed auscultation findings"
                      {...register("auscultationFindings")}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Symptoms Section */}
            <TabsContent value="symptoms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dyspneaAtRest">Dyspnea at Rest</Label>
                    <Controller
                      name="dyspneaAtRest"
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
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.dyspneaAtRest && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dyspneaOnExertion">
                      Dyspnea on Exertion
                    </Label>
                    <Controller
                      name="dyspneaOnExertion"
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
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chestPain">Chest Pain</Label>
                    <Controller
                      name="chestPain"
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
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {watchChestPain === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="chestPainDescription">
                        Chest Pain Description
                      </Label>
                      <Textarea
                        id="chestPainDescription"
                        placeholder="Describe chest pain characteristics, location, triggers"
                        {...register("chestPainDescription")}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      Respiratory Symptoms (select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {respiratorySymptoms.map((symptom) => (
                        <div
                          key={symptom}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`symptom-${symptom}`}
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={() => handleSymptomChange(symptom)}
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`symptom-${symptom}`}
                            className="text-sm font-normal"
                          >
                            {symptom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exerciseTolerance">
                      Exercise Tolerance
                    </Label>
                    <Textarea
                      id="exerciseTolerance"
                      placeholder="Describe patient's exercise tolerance and limitations"
                      {...register("exerciseTolerance")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleepDisturbances">
                      Sleep Disturbances
                    </Label>
                    <Controller
                      name="sleepDisturbances"
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
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="occasional">
                              Occasional
                            </SelectItem>
                            <SelectItem value="frequent">Frequent</SelectItem>
                            <SelectItem value="nightly">Nightly</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Airway Management Section */}
            <TabsContent value="airway-management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="airwayPatency">Airway Patency</Label>
                    <Controller
                      name="airwayPatency"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select airway status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patent">Patent</SelectItem>
                            <SelectItem value="partially_obstructed">
                              Partially Obstructed
                            </SelectItem>
                            <SelectItem value="obstructed">
                              Obstructed
                            </SelectItem>
                            <SelectItem value="artificial_airway">
                              Artificial Airway
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.airwayPatency && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretionManagement">
                      Secretion Management
                    </Label>
                    <Controller
                      name="secretionManagement"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select management" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="independent">
                              Independent
                            </SelectItem>
                            <SelectItem value="assisted_coughing">
                              Assisted Coughing
                            </SelectItem>
                            <SelectItem value="suctioning_required">
                              Suctioning Required
                            </SelectItem>
                            <SelectItem value="postural_drainage">
                              Postural Drainage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tracheostomy">Tracheostomy</Label>
                    <Controller
                      name="tracheostomy"
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
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {watchTraceostomy === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="tracheostomyType">
                        Tracheostomy Type
                      </Label>
                      <Input
                        id="tracheostomyType"
                        placeholder="e.g., cuffed, uncuffed, fenestrated"
                        {...register("tracheostomyType")}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">
                      Current Respiratory Medications
                    </Label>
                    <Textarea
                      id="currentMedications"
                      placeholder="List current respiratory medications with dosages"
                      {...register("currentMedications")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationCompliance">
                      Medication Compliance
                    </Label>
                    <Controller
                      name="medicationCompliance"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Airway Status</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Patency:{" "}
                        <span className="font-medium">
                          {watch("airwayPatency") || "--"}
                        </span>
                      </div>
                      <div>
                        Secretions:{" "}
                        <span className="font-medium">
                          {watch("secretionManagement") || "--"}
                        </span>
                      </div>
                      <div>
                        Tracheostomy:{" "}
                        <span className="font-medium">
                          {watchTraceostomy === "yes" ? "Present" : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Care Plan Section */}
            <TabsContent value="care-plan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="respiratoryGoals">Respiratory Goals</Label>
                    <Textarea
                      id="respiratoryGoals"
                      placeholder="Short-term and long-term respiratory goals"
                      {...register("respiratoryGoals", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.respiratoryGoals && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interventions">Planned Interventions</Label>
                    <Textarea
                      id="interventions"
                      placeholder="Respiratory therapy interventions and treatments"
                      {...register("interventions")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientEducation">Patient Education</Label>
                    <Textarea
                      id="patientEducation"
                      placeholder="Education provided to patient and family"
                      {...register("patientEducation")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="followUpPlan">Follow-up Plan</Label>
                    <Textarea
                      id="followUpPlan"
                      placeholder="Follow-up schedule and monitoring plan"
                      {...register("followUpPlan", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.followUpPlan && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPlan">Emergency Action Plan</Label>
                    <Textarea
                      id="emergencyPlan"
                      placeholder="When to seek emergency care, warning signs"
                      {...register("emergencyPlan")}
                      disabled={readOnly}
                    />
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="respiratory_assessment"
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
                </div>
              </div>
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
                  <span className="font-medium">Form Type:</span> Respiratory
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
                By signing, I confirm that this respiratory assessment is
                accurate and complete to the best of my knowledge. This
                electronic signature is legally binding and complies with DOH
                requirements for clinical documentation.
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

export default RespiratoryAssessmentForm;
