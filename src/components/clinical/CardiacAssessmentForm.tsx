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
  Heart,
  Stethoscope,
  Zap,
  TrendingUp,
  Target,
  Pill,
} from "lucide-react";

interface CardiacAssessmentFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Cardiac history conditions
const cardiacConditions = [
  "Coronary Artery Disease",
  "Myocardial Infarction",
  "Heart Failure",
  "Atrial Fibrillation",
  "Hypertension",
  "Valvular Disease",
  "Cardiomyopathy",
  "Arrhythmias",
  "Pericarditis",
  "Congenital Heart Disease",
  "Peripheral Artery Disease",
  "Deep Vein Thrombosis",
  "Pulmonary Embolism",
];

// Risk factors
const riskFactors = [
  "Smoking",
  "Diabetes",
  "High Cholesterol",
  "Family History",
  "Obesity",
  "Sedentary Lifestyle",
  "Stress",
  "Age",
  "Gender",
  "Alcohol Use",
  "Drug Use",
];

// Cardiac symptoms
const cardiacSymptoms = [
  "Chest Pain",
  "Shortness of Breath",
  "Palpitations",
  "Dizziness",
  "Syncope",
  "Fatigue",
  "Edema",
  "Orthopnea",
  "Paroxysmal Nocturnal Dyspnea",
  "Claudication",
  "Nausea",
  "Diaphoresis",
];

// Cardiac medications
const cardiacMedications = [
  "ACE Inhibitors",
  "ARBs",
  "Beta Blockers",
  "Calcium Channel Blockers",
  "Diuretics",
  "Statins",
  "Antiplatelet Agents",
  "Anticoagulants",
  "Nitrates",
  "Digoxin",
  "Antiarrhythmics",
];

// Activity restrictions
const activityRestrictions = [
  "No restrictions",
  "Light activity only",
  "Moderate activity restriction",
  "Severe activity restriction",
  "Bed rest",
  "Cardiac rehabilitation",
  "Supervised exercise only",
];

const CardiacAssessmentForm: React.FC<CardiacAssessmentFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("cardiac-history");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedRiskFactors, setSelectedRiskFactors] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
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
      // Cardiac History
      previousCardiacEvents: "",
      familyHistory: "",
      surgicalHistory: "",
      lastCardiacEvent: "",
      
      // Current Symptoms
      chestPainDescription: "",
      chestPainSeverity: "0",
      dyspneaOnExertion: "no",
      orthopnea: "no",
      pnd: "no",
      palpitations: "no",
      syncope: "no",
      edemaLocation: "",
      
      // Physical Assessment
      heartRate: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
      bmi: "",
      
      // Cardiovascular Examination
      heartSounds: "normal",
      murmurs: "none",
      gallops: "none",
      rubs: "none",
      jugularVeinDistention: "no",
      peripheralPulses: "normal",
      capillaryRefill: "normal",
      skinColor: "normal",
      
      // Functional Assessment
      nyhaClass: "1",
      exerciseTolerance: "",
      adlLimitations: "",
      walkingDistance: "",
      stairClimbing: "",
      
      // Diagnostic Tests
      ecgFindings: "",
      ecgDate: "",
      echoFindings: "",
      echoDate: "",
      stressTestResults: "",
      stressTestDate: "",
      holterResults: "",
      holterDate: "",
      
      // Laboratory Results
      troponin: "",
      bnp: "",
      totalCholesterol: "",
      ldl: "",
      hdl: "",
      triglycerides: "",
      creatinine: "",
      hemoglobin: "",
      
      // Current Management
      currentMedications: "",
      medicationCompliance: "good",
      dietRestrictions: "",
      fluidRestrictions: "",
      activityRestrictions: "no_restrictions",
      
      // Care Plan
      treatmentGoals: "",
      medicationChanges: "",
      lifestyleModifications: "",
      followUpPlan: "",
      patientEducation: "",
      emergencyPlan: "",
      referrals: "",
    },
  });

  const watchNyhaClass = watch("nyhaClass");
  const watchChestPainSeverity = watch("chestPainSeverity");
  const watchMedicationCompliance = watch("medicationCompliance");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "heartRate",
      "bloodPressureSystolic",
      "bloodPressureDiastolic",
      "nyhaClass",
      "heartSounds",
      "currentMedications",
      "medicationCompliance",
      "treatmentGoals",
      "followUpPlan",
      "patientEducation",
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
    if (selectedConditions.length > 0) additionalPoints += 1;
    if (selectedRiskFactors.length > 0) additionalPoints += 1;
    if (selectedSymptoms.length > 0) additionalPoints += 1;
    if (selectedMedications.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 4)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [
    watch,
    selectedConditions,
    selectedRiskFactors,
    selectedSymptoms,
    selectedMedications,
  ]);

  const handleConditionChange = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    );
  };

  const handleRiskFactorChange = (factor: string) => {
    setSelectedRiskFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  const handleSymptomChange = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  const handleMedicationChange = (medication: string) => {
    setSelectedMedications((prev) =>
      prev.includes(medication)
        ? prev.filter((m) => m !== medication)
        : [...prev, medication],
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
        "cardiac-history": ["history", "condition", "risk"],
        "symptoms": ["symptom", "chest pain", "dyspnea"],
        "physical-assessment": ["vital", "examination", "physical"],
        "functional-assessment": ["functional", "nyha", "exercise"],
        "diagnostic-tests": ["test", "ecg", "echo", "lab"],
        "current-management": ["medication", "management", "compliance"],
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
      cardiacConditions: selectedConditions,
      riskFactors: selectedRiskFactors,
      currentSymptoms: selectedSymptoms,
      cardiacMedications: selectedMedications,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "cardiac_assessment",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `cardiac_assessment_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "cardiac_assessment",
            patientId,
            episodeId,
            signatureReason: "Cardiac assessment completion",
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
      documentId: `cardiac_assessment_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  };

  // Function to get NYHA class description
  const getNyhaDescription = (nyhaClass: string) => {
    const descriptions = {
      "1": "No symptoms with ordinary activity",
      "2": "Slight limitation with ordinary activity",
      "3": "Marked limitation with less than ordinary activity",
      "4": "Symptoms at rest or with any physical activity",
    };
    return descriptions[nyhaClass as keyof typeof descriptions] || "";
  };

  // Function to get risk level color
  const getRiskLevelColor = (nyhaClass: string) => {
    if (nyhaClass === "1") return "bg-green-100 text-green-800";
    if (nyhaClass === "2") return "bg-yellow-100 text-yellow-800";
    if (nyhaClass === "3") return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cardiac Assessment Form</CardTitle>
              <CardDescription>
                Comprehensive cardiovascular evaluation including history, symptoms, and management plan
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
              <TabsTrigger value="cardiac-history">
                <Heart className="mr-2 h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger value="symptoms">
                <Activity className="mr-2 h-4 w-4" /> Symptoms
              </TabsTrigger>
              <TabsTrigger value="physical-assessment">
                <Stethoscope className="mr-2 h-4 w-4" /> Physical
              </TabsTrigger>
              <TabsTrigger value="functional-assessment">
                <TrendingUp className="mr-2 h-4 w-4" /> Functional
              </TabsTrigger>
              <TabsTrigger value="diagnostic-tests">
                <Zap className="mr-2 h-4 w-4" /> Diagnostics
              </TabsTrigger>
              <TabsTrigger value="current-management">
                <Pill className="mr-2 h-4 w-4" /> Management
              </TabsTrigger>
              <TabsTrigger value="care-plan">
                <Target className="mr-2 h-4 w-4" /> Care Plan
              </TabsTrigger>
            </TabsList>

            {/* Cardiac History Section */}
            <TabsContent value="cardiac-history" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="previousCardiacEvents">Previous Cardiac Events</Label>
                    <Textarea
                      id="previousCardiacEvents"
                      placeholder="Describe any previous cardiac events, procedures, or hospitalizations"
                      {...register("previousCardiacEvents")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyHistory">Family History</Label>
                    <Textarea
                      id="familyHistory"
                      placeholder="Family history of cardiac disease"
                      {...register("familyHistory")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surgicalHistory">Surgical History</Label>
                    <Textarea
                      id="surgicalHistory"
                      placeholder="Previous cardiac surgeries or procedures"
                      {...register("surgicalHistory")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastCardiacEvent">Last Cardiac Event Date</Label>
                    <Input
                      id="lastCardiacEvent"
                      type="date"
                      {...register("lastCardiacEvent")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Cardiac Conditions (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {cardiacConditions.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={`condition-${condition}`}
                            checked={selectedConditions.includes(condition)}
                            onCheckedChange={() => handleConditionChange(condition)}
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`condition-${condition}`}
                            className="text-sm font-normal"
                          >
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Risk Factors (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {riskFactors.map((factor) => (
                        <div key={factor} className="flex items-center space-x-2">
                          <Checkbox
                            id={`risk-${factor}`}
                            checked={selectedRiskFactors.includes(factor)}
                            onCheckedChange={() => handleRiskFactorChange(factor)}
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`risk-${factor}`}
                            className="text-sm font-normal"
                          >
                            {factor}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Symptoms Section */}
            <TabsContent value="symptoms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chestPainDescription">Chest Pain Description</Label>
                    <Textarea
                      id="chestPainDescription"
                      placeholder="Describe chest pain characteristics, location, triggers"
                      {...register("chestPainDescription")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chestPainSeverity">Chest Pain Severity (0-10)</Label>
                    <Controller
                      name="chestPainSeverity"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pain severity" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score} - {score === 0 ? "No Pain" : score <= 3 ? "Mild" : score <= 6 ? "Moderate" : "Severe"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dyspneaOnExertion">Dyspnea on Exertion</Label>
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
                              <SelectValue placeholder="Select" />
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
                      <Label htmlFor="orthopnea">Orthopnea</Label>
                      <Controller
                        name="orthopnea"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="1-pillow">1 Pillow</SelectItem>
                              <SelectItem value="2-pillows">2 Pillows</SelectItem>
                              <SelectItem value="3-pillows">3+ Pillows</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pnd">Paroxysmal Nocturnal Dyspnea</Label>
                      <Controller
                        name="pnd"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="occasional">Occasional</SelectItem>
                              <SelectItem value="frequent">Frequent</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="palpitations">Palpitations</Label>
                      <Controller
                        name="palpitations"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="occasional">Occasional</SelectItem>
                              <SelectItem value="frequent">Frequent</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edemaLocation">Edema Location</Label>
                    <Input
                      id="edemaLocation"
                      placeholder="Location and severity of edema"
                      {...register("edemaLocation")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Current Symptoms (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {cardiacSymptoms.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
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

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Symptom Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Chest Pain Severity</div>
                        <Badge className={parseInt(watchChestPainSeverity) > 6 ? "bg-red-100 text-red-800" : parseInt(watchChestPainSeverity) > 3 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                          {watchChestPainSeverity}/10
                        </Badge>
                      </div>
                      <div>
                        <div className="text-gray-600">Active Symptoms</div>
                        <div className="font-medium">{selectedSymptoms.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Physical Assessment Section */}
            <TabsContent value="physical-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Vital Signs</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        placeholder="e.g., 72"
                        {...register("heartRate", { required: true })}
                        disabled={readOnly}
                      />
                      {errors.heartRate && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        placeholder="e.g., 16"
                        {...register("respiratoryRate")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureSystolic">Systolic BP (mmHg)</Label>
                      <Input
                        id="bloodPressureSystolic"
                        type="number"
                        placeholder="e.g., 120"
                        {...register("bloodPressureSystolic", { required: true })}
                        disabled={readOnly}
                      />
                      {errors.bloodPressureSystolic && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureDiastolic">Diastolic BP (mmHg)</Label>
                      <Input
                        id="bloodPressureDiastolic"
                        type="number"
                        placeholder="e.g., 80"
                        {...register("bloodPressureDiastolic", { required: true })}
                        disabled={readOnly}
                      />
                      {errors.bloodPressureDiastolic && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        placeholder="e.g., 98"
                        {...register("oxygenSaturation")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 70.5"
                        {...register("weight")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="e.g., 170"
                        {...register("height")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Cardiovascular Examination</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heartSounds">Heart Sounds</Label>
                    <Controller
                      name="heartSounds"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select heart sounds" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal S1, S2</SelectItem>
                            <SelectItem value="s3-gallop">S3 Gallop</SelectItem>
                            <SelectItem value="s4-gallop">S4 Gallop</SelectItem>
                            <SelectItem value="irregular">Irregular</SelectItem>
                            <SelectItem value="muffled">Muffled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.heartSounds && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="murmurs">Murmurs</Label>
                    <Controller
                      name="murmurs"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select murmur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="systolic">Systolic</SelectItem>
                            <SelectItem value="diastolic">Diastolic</SelectItem>
                            <SelectItem value="continuous">Continuous</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jugularVeinDistention">Jugular Vein Distention</Label>
                    <Controller
                      name="jugularVeinDistention"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select JVD" />
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
                    <Label htmlFor="peripheralPulses">Peripheral Pulses</Label>
                    <Controller
                      name="peripheralPulses"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pulse quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="weak">Weak</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="bounding">Bounding</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capillaryRefill">Capillary Refill</Label>
                    <Controller
                      name="capillaryRefill"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select capillary refill" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal (&lt;2 sec)</SelectItem>
                            <SelectItem value="delayed">Delayed (&gt;2 sec)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Functional Assessment Section */}
            <TabsContent value="functional-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nyhaClass">NYHA Functional Class</Label>
                    <Controller
                      name="nyhaClass"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select NYHA class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Class I - No symptoms</SelectItem>
                            <SelectItem value="2">Class II - Slight limitation</SelectItem>
                            <SelectItem value="3">Class III - Marked limitation</SelectItem>
                            <SelectItem value="4">Class IV - Symptoms at rest</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.nyhaClass && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">NYHA Class {watchNyhaClass}</h4>
                    <p className="text-sm text-gray-600">
                      {getNyhaDescription(watchNyhaClass)}
                    </p>
                    <Badge className={getRiskLevelColor(watchNyhaClass)} variant="outline">
                      {watchNyhaClass === "1" ? "Low Risk" : watchNyhaClass === "2" ? "Mild Risk" : watchNyhaClass === "3" ? "Moderate Risk" : "High Risk"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exerciseTolerance">Exercise Tolerance</Label>
                    <Textarea
                      id="exerciseTolerance"
                      placeholder="Describe patient's exercise tolerance and limitations"
                      {...register("exerciseTolerance")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adlLimitations">ADL Limitations</Label>
                    <Textarea
                      id="adlLimitations"
                      placeholder="Activities of daily living limitations"
                      {...register("adlLimitations")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walkingDistance">Walking Distance</Label>
                    <Input
                      id="walkingDistance"
                      placeholder="Maximum walking distance without symptoms"
                      {...register("walkingDistance")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stairClimbing">Stair Climbing Ability</Label>
                    <Input
                      id="stairClimbing"
                      placeholder="Number of flights of stairs tolerated"
                      {...register("stairClimbing")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Functional Status Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>NYHA Class:</span>
                        <Badge className={getRiskLevelColor(watchNyhaClass)}>
                          Class {watchNyhaClass}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Functional Level:</span>
                        <span className="font-medium">
                          {watchNyhaClass === "1" ? "Normal" : watchNyhaClass === "2" ? "Mildly Limited" : watchNyhaClass === "3" ? "Moderately Limited" : "Severely Limited"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Diagnostic Tests Section */}
            <TabsContent value="diagnostic-tests" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Cardiac Tests</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ecgFindings">ECG Findings</Label>
                    <Textarea
                      id="ecgFindings"
                      placeholder="ECG interpretation and findings"
                      {...register("ecgFindings")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ecgDate">ECG Date</Label>
                    <Input
                      id="ecgDate"
                      type="date"
                      {...register("ecgDate")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="echoFindings">Echocardiogram Findings</Label>
                    <Textarea
                      id="echoFindings"
                      placeholder="Echo results including EF, wall motion, valves"
                      {...register("echoFindings")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="echoDate">Echo Date</Label>
                    <Input
                      id="echoDate"
                      type="date"
                      {...register("echoDate")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stressTestResults">Stress Test Results</Label>
                    <Textarea
                      id="stressTestResults"
                      placeholder="Stress test findings and interpretation"
                      {...register("stressTestResults")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stressTestDate">Stress Test Date</Label>
                    <Input
                      id="stressTestDate"
                      type="date"
                      {...register("stressTestDate")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Laboratory Results</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="troponin">Troponin</Label>
                      <Input
                        id="troponin"
                        placeholder="ng/mL"
                        {...register("troponin")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bnp">BNP/NT-proBNP</Label>
                      <Input
                        id="bnp"
                        placeholder="pg/mL"
                        {...register("bnp")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalCholesterol">Total Cholesterol</Label>
                      <Input
                        id="totalCholesterol"
                        placeholder="mg/dL"
                        {...register("totalCholesterol")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ldl">LDL</Label>
                      <Input
                        id="ldl"
                        placeholder="mg/dL"
                        {...register("ldl")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hdl">HDL</Label>
                      <Input
                        id="hdl"
                        placeholder="mg/dL"
                        {...register("hdl")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="triglycerides">Triglycerides</Label>
                      <Input
                        id="triglycerides"
                        placeholder="mg/dL"
                        {...register("triglycerides")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creatinine">Creatinine</Label>
                      <Input
                        id="creatinine"
                        placeholder="mg/dL"
                        {...register("creatinine")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hemoglobin">Hemoglobin</Label>
                      <Input
                        id="hemoglobin"
                        placeholder="g/dL"
                        {...register("hemoglobin")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holterResults">Holter Monitor Results</Label>
                    <Textarea
                      id="holterResults"
                      placeholder="24-48 hour Holter monitor findings"
                      {...register("holterResults")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holterDate">Holter Date</Label>
                    <Input
                      id="holterDate"
                      type="date"
                      {...register("holterDate")}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Current Management Section */}
            <TabsContent value="current-management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Cardiac Medications</Label>
                    <Textarea
                      id="currentMedications"
                      placeholder="List current cardiac medications with dosages"
                      {...register("currentMedications", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.currentMedications && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationCompliance">Medication Compliance</Label>
                    <Controller
                      name="medicationCompliance"
                      control={control}
                      rules={{ required: true }}
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
                            <SelectItem value="excellent">Excellent (>95%)</SelectItem>
                            <SelectItem value="good">Good (80-95%)</SelectItem>
                            <SelectItem value="fair">Fair (60-79%)</SelectItem>
                            <SelectItem value="poor">Poor (<60%)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.medicationCompliance && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietRestrictions">Diet Restrictions</Label>
                    <Textarea
                      id="dietRestrictions"
                      placeholder="Sodium restriction, fluid restriction, etc."
                      {...register("dietRestrictions")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fluidRestrictions">Fluid Restrictions</Label>
                    <Input
                      id="fluidRestrictions"
                      placeholder="e.g., 2L per day"
                      {...register("fluidRestrictions")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityRestrictions">Activity Restrictions</Label>
                    <Controller
                      name="activityRestrictions"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            {activityRestrictions.map((restriction) => (
                              <SelectItem key={restriction} value={restriction.toLowerCase().replace(/\s+/g, '_')}>
                                {restriction}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Cardiac Medication Classes (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {cardiacMedications.map((medication) => (
                        <div key={medication} className="flex items-center space-x-2">
                          <Checkbox
                            id={`medication-${medication}`}
                            checked={selectedMedications.includes(medication)}
                            onCheckedChange={() => handleMedicationChange(medication)}
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`medication-${medication}`}
                            className="text-sm font-normal"
                          >
                            {medication}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Management Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Medication Compliance:</span>
                        <Badge className={watchMedicationCompliance === "excellent" || watchMedicationCompliance === "good" ? "bg-green-100 text-green-800" : watchMedicationCompliance === "fair" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                          {watchMedicationCompliance}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Medication Classes:</span>
                        <span className="font-medium">{selectedMedications.length}</span>
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
                    <Label htmlFor="treatmentGoals">Treatment Goals</Label>
                    <Textarea
                      id="treatmentGoals"
                      placeholder="Short-term and long-term treatment goals"
                      {...register("treatmentGoals", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.treatmentGoals && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationChanges">Medication Changes</Label>
                    <Textarea
                      id="medicationChanges"
                      placeholder="Planned medication adjustments or additions"
                      {...register("medicationChanges")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lifestyleModifications">Lifestyle Modifications</Label>
                    <Textarea
                      id="lifestyleModifications"
                      placeholder="Diet, exercise, smoking cessation recommendations"
                      {...register("lifestyleModifications")}
                      disabled={readOnly}
                    />
                  </div>

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
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientEducation">Patient Education</Label>
                    <Textarea
                      id="patientEducation"
                      placeholder="Education provided to patient and family"
                      {...register("patientEducation", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.patientEducation && (
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

                  <div className="space-y-2">
                    <Label htmlFor="referrals">Referrals</Label>
                    <Textarea
                      id="referrals"
                      placeholder="Specialist referrals or additional services needed"
                      {...register("referrals")}
                      disabled={readOnly}
                    />
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="cardiac_assessment"
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
                  <span className="font-medium">Form Type:</span> Cardiac
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
                By signing, I confirm that this cardiac assessment is accurate and
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

export default CardiacAssessmentForm;
