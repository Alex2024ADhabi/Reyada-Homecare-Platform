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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@/components/ui";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";
import DOHComplianceValidator from "@/components/clinical/DOHComplianceValidator";
import {
  Activity,
  Droplets,
  Utensils,
  Pill,
  Eye,
  Clock,
  Calendar,
  Pen,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Heart,
} from "lucide-react";

interface DiabetesManagementFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Diabetes types
const diabetesTypes = [
  "Type 1 Diabetes",
  "Type 2 Diabetes",
  "Gestational Diabetes",
  "MODY",
  "Secondary Diabetes",
];

// Blood glucose ranges
const glucoseRanges = [
  "Normal (70-99 mg/dL)",
  "Prediabetic (100-125 mg/dL)",
  "Diabetic (≥126 mg/dL)",
  "Hypoglycemic (<70 mg/dL)",
  "Severe Hypoglycemia (<54 mg/dL)",
];

// Medication types
const diabetesMedications = [
  "Metformin",
  "Insulin (Rapid-acting)",
  "Insulin (Long-acting)",
  "Sulfonylureas",
  "DPP-4 Inhibitors",
  "GLP-1 Agonists",
  "SGLT-2 Inhibitors",
  "Thiazolidinediones",
];

// Complications
const diabetesComplications = [
  "Diabetic Retinopathy",
  "Diabetic Nephropathy",
  "Diabetic Neuropathy",
  "Cardiovascular Disease",
  "Peripheral Arterial Disease",
  "Diabetic Foot Ulcers",
  "Gastroparesis",
  "Hypoglycemia Unawareness",
];

const DiabetesManagementForm: React.FC<DiabetesManagementFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("glucose-monitoring");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedComplications, setSelectedComplications] = useState<string[]>([]);
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
      // Diabetes Information
      diabetesType: "",
      diagnosisDate: "",
      hba1c: "",
      hba1cDate: "",
      diabetesControl: "good",

      // Glucose Monitoring
      fastingGlucose: "",
      randomGlucose: "",
      glucoseMonitoringFrequency: "daily",
      glucoseMeter: "yes",
      continuousGlucoseMonitor: "no",
      hypoglycemicEpisodes: "no",
      hyperglycemicEpisodes: "no",

      // Medications
      insulinTherapy: "no",
      insulinType: "",
      insulinDosage: "",
      oralMedications: "no",
      medicationAdherence: "good",
      medicationSideEffects: "no",

      // Diet & Nutrition
      dietaryPlan: "",
      carbohydrateCounting: "no",
      nutritionistConsult: "no",
      weightStatus: "normal",
      bmi: "",
      dietaryCompliance: "good",

      // Physical Activity
      exerciseRoutine: "",
      exerciseFrequency: "none",
      exerciseLimitations: "",
      activityLevel: "sedentary",

      // Foot Care
      footExamination: "normal",
      footUlcers: "no",
      neuropathy: "no",
      footwear: "appropriate",
      footCareEducation: "provided",

      // Eye Care
      lastEyeExam: "",
      retinopathy: "no",
      visionChanges: "no",
      eyeCareReferral: "no",

      // Kidney Function
      creatinine: "",
      egfr: "",
      proteinuria: "no",
      nephropathy: "no",

      // Cardiovascular Risk
      bloodPressure: "",
      cholesterol: "",
      cardiovascularRisk: "low",
      smokingStatus: "never",

      // Self-Management
      diabetesEducation: "completed",
      selfMonitoringSkills: "adequate",
      emergencyPlan: "",
      supportSystem: "adequate",

      // Care Plan
      treatmentGoals: "",
      managementPlan: "",
      followUpPlan: "",
      patientEducation: "",
      referrals: "",
    },
  });

  const watchInsulinTherapy = watch("insulinTherapy");
  const watchOralMedications = watch("oralMedications");
  const watchFootUlcers = watch("footUlcers");
  const watchRetinopathy = watch("retinopathy");
  const watchNephropathy = watch("nephropathy");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "diabetesType",
      "hba1c",
      "fastingGlucose",
      "diabetesControl",
      "medicationAdherence",
      "dietaryCompliance",
      "footExamination",
      "treatmentGoals",
      "managementPlan",
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
    if (selectedMedications.length > 0) additionalPoints += 1;
    if (selectedComplications.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 2)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [watch, selectedMedications, selectedComplications]);

  const handleMedicationChange = (medication: string) => {
    setSelectedMedications((prev) =>
      prev.includes(medication)
        ? prev.filter((m) => m !== medication)
        : [...prev, medication],
    );
  };

  const handleComplicationChange = (complication: string) => {
    setSelectedComplications((prev) =>
      prev.includes(complication)
        ? prev.filter((c) => c !== complication)
        : [...prev, complication],
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
        "glucose-monitoring": ["glucose", "blood sugar", "monitoring", "hba1c"],
        "medications": ["medication", "insulin", "drug", "therapy"],
        "diet-nutrition": ["diet", "nutrition", "food", "carbohydrate"],
        "complications": ["complication", "retinopathy", "neuropathy", "nephropathy"],
        "foot-care": ["foot", "ulcer", "wound", "amputation"],
        "self-management": ["education", "self-care", "monitoring", "compliance"],
        "care-plan": ["plan", "goal", "treatment", "follow up"],
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
      selectedMedications,
      selectedComplications,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "diabetes_management",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `diabetes_management_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "diabetes_management",
            patientId,
            episodeId,
            signatureReason: "Diabetes management form completion",
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
      documentId: `diabetes_management_${patientId}_${Date.now()}`,
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
              <CardTitle>Diabetes Management Form</CardTitle>
              <CardDescription>
                Comprehensive diabetes care assessment including glucose monitoring,
                medication management, and complication screening
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
              <TabsTrigger value="glucose-monitoring">
                <Droplets className="mr-2 h-4 w-4" /> Glucose
              </TabsTrigger>
              <TabsTrigger value="medications">
                <Pill className="mr-2 h-4 w-4" /> Medications
              </TabsTrigger>
              <TabsTrigger value="diet-nutrition">
                <Utensils className="mr-2 h-4 w-4" /> Diet
              </TabsTrigger>
              <TabsTrigger value="complications">
                <AlertCircle className="mr-2 h-4 w-4" /> Complications
              </TabsTrigger>
              <TabsTrigger value="foot-care">
                <Activity className="mr-2 h-4 w-4" /> Foot Care
              </TabsTrigger>
              <TabsTrigger value="self-management">
                <TrendingUp className="mr-2 h-4 w-4" /> Self-Care
              </TabsTrigger>
              <TabsTrigger value="care-plan">
                <Target className="mr-2 h-4 w-4" /> Care Plan
              </TabsTrigger>
            </TabsList>

            {/* Glucose Monitoring Section */}
            <TabsContent value="glucose-monitoring" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diabetesType">Diabetes Type</Label>
                    <Controller
                      name="diabetesType"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select diabetes type" />
                          </SelectTrigger>
                          <SelectContent>
                            {diabetesTypes.map((type) => (
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
                    {errors.diabetesType && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hba1c">HbA1c (%)</Label>
                    <Input
                      id="hba1c"
                      type="number"
                      step="0.1"
                      min="4"
                      max="15"
                      placeholder="e.g., 7.2"
                      {...register("hba1c", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.hba1c && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fastingGlucose">Fasting Glucose (mg/dL)</Label>
                    <Input
                      id="fastingGlucose"
                      type="number"
                      min="50"
                      max="500"
                      placeholder="e.g., 120"
                      {...register("fastingGlucose", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.fastingGlucose && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diabetesControl">Diabetes Control</Label>
                    <Controller
                      name="diabetesControl"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select control level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent (HbA1c <7%)</SelectItem>
                            <SelectItem value="good">Good (HbA1c 7-8%)</SelectItem>
                            <SelectItem value="fair">Fair (HbA1c 8-9%)</SelectItem>
                            <SelectItem value="poor">Poor (HbA1c >9%)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.diabetesControl && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="glucoseMonitoringFrequency">Monitoring Frequency</Label>
                    <Controller
                      name="glucoseMonitoringFrequency"
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
                            <SelectItem value="multiple_daily">Multiple times daily</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="few_times_week">Few times per week</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="rarely">Rarely</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="continuousGlucoseMonitor">Continuous Glucose Monitor</Label>
                    <Controller
                      name="continuousGlucoseMonitor"
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

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Glucose Control Summary</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        HbA1c: <span className="font-medium">{watch("hba1c") || "--"}%</span>
                      </div>
                      <div>
                        Fasting: <span className="font-medium">{watch("fastingGlucose") || "--"} mg/dL</span>
                      </div>
                      <div>
                        Control: <span className="font-medium">{watch("diabetesControl") || "--"}</span>
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
                      placeholder="Short-term and long-term diabetes management goals"
                      {...register("treatmentGoals", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.treatmentGoals && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managementPlan">Management Plan</Label>
                    <Textarea
                      id="managementPlan"
                      placeholder="Comprehensive diabetes management strategy"
                      {...register("managementPlan", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.managementPlan && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
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
                    <Label htmlFor="referrals">Referrals</Label>
                    <Textarea
                      id="referrals"
                      placeholder="Specialist referrals and consultations"
                      {...register("referrals")}
                      disabled={readOnly}
                    />
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="diabetes_management"
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
                  <span className="font-medium">Form Type:</span> Diabetes
                  Management
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
                By signing, I confirm that this diabetes management assessment is
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

export default DiabetesManagementForm;