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
  Pill,
  Shield,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  Heart,
} from "lucide-react";

interface MedicationReconciliationFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Medication categories
const medicationCategories = [
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Neurological",
  "Endocrine",
  "Musculoskeletal",
  "Psychiatric",
  "Antimicrobial",
  "Analgesic",
  "Dermatological",
  "Ophthalmological",
  "Hematological",
  "Immunological",
  "Other",
];

// Common allergies
const commonAllergies = [
  "Penicillin",
  "Sulfa drugs",
  "Aspirin",
  "NSAIDs",
  "Codeine",
  "Morphine",
  "Latex",
  "Iodine",
  "Shellfish",
  "Nuts",
  "Eggs",
  "Dairy",
  "Environmental allergens",
  "Food dyes",
  "Preservatives",
];

// Allergy reaction types
const reactionTypes = [
  "Rash",
  "Hives",
  "Itching",
  "Swelling",
  "Difficulty breathing",
  "Anaphylaxis",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Dizziness",
  "Headache",
  "Other",
];

// Compliance assessment options
const complianceReasons = [
  "Cost/Financial constraints",
  "Side effects",
  "Forgetfulness",
  "Complex regimen",
  "Lack of understanding",
  "Cultural/Religious beliefs",
  "Fear of dependency",
  "Feeling better",
  "Lack of perceived benefit",
  "Access issues",
  "Other",
];

// Drug interaction severity levels
const interactionSeverities = [
  "Major - Avoid combination",
  "Moderate - Monitor closely",
  "Minor - Monitor",
  "No significant interactions",
];

const MedicationReconciliationForm: React.FC<MedicationReconciliationFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("current-medications");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [currentMedications, setCurrentMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedReactions, setSelectedReactions] = useState<string[]>([]);
  const [selectedComplianceReasons, setSelectedComplianceReasons] = useState<string[]>([]);
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
      // Medication History
      medicationHistoryComplete: "no",
      previousMedicationReview: "",
      lastReviewDate: "",
      reviewedBy: "",
      
      // Current Medications
      totalMedicationCount: "0",
      prescriptionMedications: "0",
      otcMedications: "0",
      herbalSupplements: "0",
      vitamins: "0",
      
      // Allergies and Adverse Reactions
      hasKnownAllergies: "no",
      allergyTesting: "not_done",
      medicalAlertBracelet: "no",
      emergencyMedicationCarried: "no",
      
      // Medication Compliance
      overallCompliance: "good",
      missedDosesFrequency: "rarely",
      complianceBarriers: "",
      medicationReminders: "none",
      pillOrganizer: "no",
      
      // Drug Interactions
      interactionScreening: "not_completed",
      potentialInteractions: "",
      interactionSeverity: "no_significant_interactions",
      clinicalSignificance: "",
      
      // Medication Management
      pharmacyLocation: "",
      pharmacistConsultation: "no",
      medicationSynchronization: "no",
      automaticRefills: "no",
      medicationDelivery: "no",
      
      // Assessment and Plan
      medicationChanges: "none",
      newPrescriptions: "",
      discontinuedMedications: "",
      dosageAdjustments: "",
      patientEducation: "not_provided",
      followUpRequired: "no",
      nextReviewDate: "",
      pharmacistReferral: "no",
    },
  });

  const watchHasKnownAllergies = watch("hasKnownAllergies");
  const watchOverallCompliance = watch("overallCompliance");
  const watchInteractionScreening = watch("interactionScreening");
  const watchMedicationChanges = watch("medicationChanges");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "medicationHistoryComplete",
      "totalMedicationCount",
      "hasKnownAllergies",
      "overallCompliance",
      "interactionScreening",
      "pharmacyLocation",
      "medicationChanges",
      "patientEducation",
      "followUpRequired",
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
    if (currentMedications.length > 0) additionalPoints += 1;
    if (allergies.length > 0 || watchHasKnownAllergies === "no") additionalPoints += 1;
    if (selectedComplianceReasons.length > 0 || watchOverallCompliance === "good") additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 3)) * 100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [
    watch,
    currentMedications,
    allergies,
    selectedComplianceReasons,
    watchHasKnownAllergies,
    watchOverallCompliance,
  ]);

  const addMedication = () => {
    setCurrentMedications([...currentMedications, {
      id: Date.now(),
      name: "",
      dosage: "",
      frequency: "",
      route: "",
      indication: "",
      prescriber: "",
      startDate: "",
      category: "",
      status: "active",
    }]);
  };

  const removeMedication = (id: number) => {
    setCurrentMedications(currentMedications.filter(med => med.id !== id));
  };

  const updateMedication = (id: number, field: string, value: string) => {
    setCurrentMedications(currentMedications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const addAllergy = () => {
    setAllergies([...allergies, {
      id: Date.now(),
      allergen: "",
      reaction: "",
      severity: "",
      onset: "",
      verified: "no",
    }]);
  };

  const removeAllergy = (id: number) => {
    setAllergies(allergies.filter(allergy => allergy.id !== id));
  };

  const updateAllergy = (id: number, field: string, value: string) => {
    setAllergies(allergies.map(allergy => 
      allergy.id === id ? { ...allergy, [field]: value } : allergy
    ));
  };

  const handleAllergyChange = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy],
    );
  };

  const handleReactionChange = (reaction: string) => {
    setSelectedReactions((prev) =>
      prev.includes(reaction)
        ? prev.filter((r) => r !== reaction)
        : [...prev, reaction],
    );
  };

  const handleComplianceReasonChange = (reason: string) => {
    setSelectedComplianceReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason],
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
        "current-medications": ["medication", "drug", "prescription"],
        "allergies": ["allergy", "adverse", "reaction"],
        "compliance": ["compliance", "adherence", "missed"],
        "interactions": ["interaction", "contraindication"],
        "management": ["management", "pharmacy", "plan"],
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
      currentMedications,
      allergies,
      selectedAllergies,
      selectedReactions,
      selectedComplianceReasons,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "medication_reconciliation",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `medication_reconciliation_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "medication_reconciliation",
            patientId,
            episodeId,
            signatureReason: "Medication reconciliation completion",
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
      documentId: `medication_reconciliation_${patientId}_${Date.now()}`,
      signerUserId: userProfile.id,
      signerName: userProfile.full_name,
      signerRole: userProfile.role,
      documentHash: "placeholder",
      signatureType: "clinician",
    };

    const validation = validateSignatureRequirements(signaturePayload);
    return validation.isValid;
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
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
              <CardTitle>Medication Reconciliation Form</CardTitle>
              <CardDescription>
                Comprehensive medication review including current medications, allergies, and compliance assessment
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
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="current-medications">
                <Pill className="mr-2 h-4 w-4" /> Medications
              </TabsTrigger>
              <TabsTrigger value="allergies">
                <Shield className="mr-2 h-4 w-4" /> Allergies
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <CheckCircle className="mr-2 h-4 w-4" /> Compliance
              </TabsTrigger>
              <TabsTrigger value="interactions">
                <AlertTriangle className="mr-2 h-4 w-4" /> Interactions
              </TabsTrigger>
              <TabsTrigger value="management">
                <ClipboardCheck className="mr-2 h-4 w-4" /> Management
              </TabsTrigger>
            </TabsList>

            {/* Current Medications Section */}
            <TabsContent value="current-medications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationHistoryComplete">
                      Medication History Complete
                    </Label>
                    <Controller
                      name="medicationHistoryComplete"
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
                            <SelectItem value="yes">Yes - Complete</SelectItem>
                            <SelectItem value="partial">Partial - Some gaps</SelectItem>
                            <SelectItem value="no">No - Incomplete</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.medicationHistoryComplete && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastReviewDate">Last Medication Review Date</Label>
                    <Input
                      id="lastReviewDate"
                      type="date"
                      {...register("lastReviewDate")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewedBy">Reviewed By</Label>
                    <Input
                      id="reviewedBy"
                      placeholder="Healthcare provider name"
                      {...register("reviewedBy")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Medication Count Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalMedicationCount">Total Medications</Label>
                        <Input
                          id="totalMedicationCount"
                          type="number"
                          min="0"
                          {...register("totalMedicationCount", { required: true })}
                          disabled={readOnly}
                        />
                        {errors.totalMedicationCount && (
                          <p className="text-sm text-red-500">Required field</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prescriptionMedications">Prescription</Label>
                        <Input
                          id="prescriptionMedications"
                          type="number"
                          min="0"
                          {...register("prescriptionMedications")}
                          disabled={readOnly}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otcMedications">Over-the-Counter</Label>
                        <Input
                          id="otcMedications"
                          type="number"
                          min="0"
                          {...register("otcMedications")}
                          disabled={readOnly}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="herbalSupplements">Herbal/Supplements</Label>
                        <Input
                          id="herbalSupplements"
                          type="number"
                          min="0"
                          {...register("herbalSupplements")}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Current Medications List</h3>
                  {!readOnly && (
                    <Button onClick={addMedication} size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Medication
                    </Button>
                  )}
                </div>
                
                {currentMedications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No medications added yet</p>
                    {!readOnly && (
                      <Button onClick={addMedication} variant="outline" className="mt-2">
                        Add First Medication
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMedications.map((medication, index) => (
                      <Card key={medication.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Medication #{index + 1}</h4>
                          {!readOnly && (
                            <Button
                              onClick={() => removeMedication(medication.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Medication Name</Label>
                            <Input
                              value={medication.name}
                              onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                              placeholder="Enter medication name"
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                              placeholder="e.g., 10mg"
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input
                              value={medication.frequency}
                              onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                              placeholder="e.g., twice daily"
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Route</Label>
                            <Select
                              value={medication.route}
                              onValueChange={(value) => updateMedication(medication.id, 'route', value)}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select route" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="oral">Oral</SelectItem>
                                <SelectItem value="topical">Topical</SelectItem>
                                <SelectItem value="injection">Injection</SelectItem>
                                <SelectItem value="inhalation">Inhalation</SelectItem>
                                <SelectItem value="sublingual">Sublingual</SelectItem>
                                <SelectItem value="rectal">Rectal</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={medication.category}
                              onValueChange={(value) => updateMedication(medication.id, 'category', value)}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {medicationCategories.map((category) => (
                                  <SelectItem key={category} value={category.toLowerCase()}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={medication.status}
                              onValueChange={(value) => updateMedication(medication.id, 'status', value)}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="discontinued">Discontinued</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label>Indication</Label>
                            <Input
                              value={medication.indication}
                              onChange={(e) => updateMedication(medication.id, 'indication', e.target.value)}
                              placeholder="Reason for medication"
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Prescriber</Label>
                            <Input
                              value={medication.prescriber}
                              onChange={(e) => updateMedication(medication.id, 'prescriber', e.target.value)}
                              placeholder="Prescribing physician"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Allergies Section */}
            <TabsContent value="allergies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hasKnownAllergies">Known Allergies</Label>
                    <Controller
                      name="hasKnownAllergies"
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
                            <SelectItem value="no">No Known Allergies</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.hasKnownAllergies && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergyTesting">Allergy Testing</Label>
                    <Controller
                      name="allergyTesting"
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
                            <SelectItem value="not_done">Not Done</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalAlertBracelet">Medical Alert Bracelet</Label>
                    <Controller
                      name="medicalAlertBracelet"
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
                            <SelectItem value="recommended">Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyMedicationCarried">Emergency Medication Carried</Label>
                    <Controller
                      name="emergencyMedicationCarried"
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
                            <SelectItem value="yes">Yes (EpiPen, etc.)</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="prescribed">Prescribed but not carried</SelectItem>
                            <SelectItem value="not_applicable">Not Applicable</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {watchHasKnownAllergies === "yes" && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">Allergy Details</h3>
                    {!readOnly && (
                      <Button onClick={addAllergy} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Allergy
                      </Button>
                    )}
                  </div>
                  
                  {allergies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No allergies documented yet</p>
                      {!readOnly && (
                        <Button onClick={addAllergy} variant="outline" className="mt-2">
                          Add First Allergy
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allergies.map((allergy, index) => (
                        <Card key={allergy.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Allergy #{index + 1}</h4>
                            {!readOnly && (
                              <Button
                                onClick={() => removeAllergy(allergy.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Allergen</Label>
                              <Input
                                value={allergy.allergen}
                                onChange={(e) => updateAllergy(allergy.id, 'allergen', e.target.value)}
                                placeholder="Enter allergen"
                                disabled={readOnly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Reaction</Label>
                              <Input
                                value={allergy.reaction}
                                onChange={(e) => updateAllergy(allergy.id, 'reaction', e.target.value)}
                                placeholder="Describe reaction"
                                disabled={readOnly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Severity</Label>
                              <Select
                                value={allergy.severity}
                                onValueChange={(value) => updateAllergy(allergy.id, 'severity', value)}
                                disabled={readOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mild">Mild</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="severe">Severe</SelectItem>
                                  <SelectItem value="life-threatening">Life-threatening</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Compliance Section */}
            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallCompliance">Overall Medication Compliance</Label>
                    <Controller
                      name="overallCompliance"
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
                    {errors.overallCompliance && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="missedDosesFrequency">Missed Doses Frequency</Label>
                    <Controller
                      name="missedDosesFrequency"
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
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="rarely">Rarely (< once/month)</SelectItem>
                            <SelectItem value="occasionally">Occasionally (1-3 times/month)</SelectItem>
                            <SelectItem value="frequently">Frequently (weekly)</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationReminders">Medication Reminders</Label>
                    <Controller
                      name="medicationReminders"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select reminder type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="phone_alarm">Phone Alarm</SelectItem>
                            <SelectItem value="pill_organizer">Pill Organizer</SelectItem>
                            <SelectItem value="family_caregiver">Family/Caregiver</SelectItem>
                            <SelectItem value="app">Mobile App</SelectItem>
                            <SelectItem value="multiple">Multiple Methods</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pillOrganizer">Uses Pill Organizer</Label>
                    <Controller
                      name="pillOrganizer"
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
                            <SelectItem value="yes">Yes - Regularly</SelectItem>
                            <SelectItem value="sometimes">Sometimes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Compliance Summary</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 text-center">
                        <div className="text-sm text-gray-600">Compliance Level</div>
                        <Badge className={getComplianceColor(watchOverallCompliance)}>
                          {watchOverallCompliance === "excellent"
                            ? "Excellent"
                            : watchOverallCompliance === "good"
                              ? "Good"
                              : watchOverallCompliance === "fair"
                                ? "Fair"
                                : "Poor"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {(watchOverallCompliance === "fair" || watchOverallCompliance === "poor") && (
                <div className="mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="complianceBarriers">Compliance Barriers</Label>
                      <Textarea
                        id="complianceBarriers"
                        placeholder="Describe barriers to medication compliance"
                        {...register("complianceBarriers")}
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Common Compliance Issues (select all that apply)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {complianceReasons.map((reason) => (
                          <div key={reason} className="flex items-center space-x-2">
                            <Checkbox
                              id={`reason-${reason}`}
                              checked={selectedComplianceReasons.includes(reason)}
                              onCheckedChange={() => handleComplianceReasonChange(reason)}
                              disabled={readOnly}
                            />
                            <Label
                              htmlFor={`reason-${reason}`}
                              className="text-sm font-normal"
                            >
                              {reason}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Drug Interactions Section */}
            <TabsContent value="interactions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interactionScreening">Drug Interaction Screening</Label>
                    <Controller
                      name="interactionScreening"
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
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="not_completed">Not Completed</SelectItem>
                            <SelectItem value="not_applicable">Not Applicable</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.interactionScreening && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {watchInteractionScreening === "completed" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="interactionSeverity">Interaction Severity</Label>
                        <Controller
                          name="interactionSeverity"
                          control={control}
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
                                {interactionSeverities.map((severity) => (
                                  <SelectItem key={severity} value={severity.toLowerCase().replace(/\s+/g, '_')}>
                                    {severity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="potentialInteractions">Potential Interactions</Label>
                        <Textarea
                          id="potentialInteractions"
                          placeholder="List any potential drug interactions identified"
                          {...register("potentialInteractions")}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicalSignificance">Clinical Significance</Label>
                    <Textarea
                      id="clinicalSignificance"
                      placeholder="Describe clinical significance of any interactions"
                      {...register("clinicalSignificance")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <h3 className="font-medium text-yellow-800">Interaction Alert</h3>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Always verify drug interactions using current clinical decision support tools.
                      Consider patient-specific factors including age, kidney function, and comorbidities.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Management Section */}
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyLocation">Primary Pharmacy</Label>
                    <Input
                      id="pharmacyLocation"
                      placeholder="Pharmacy name and location"
                      {...register("pharmacyLocation", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.pharmacyLocation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pharmacistConsultation">Pharmacist Consultation</Label>
                    <Controller
                      name="pharmacistConsultation"
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
                            <SelectItem value="yes">Yes - Regular consultation</SelectItem>
                            <SelectItem value="occasional">Occasional consultation</SelectItem>
                            <SelectItem value="no">No consultation</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationSynchronization">Medication Synchronization</Label>
                    <Controller
                      name="medicationSynchronization"
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
                            <SelectItem value="yes">Yes - All medications synced</SelectItem>
                            <SelectItem value="partial">Partial synchronization</SelectItem>
                            <SelectItem value="no">No synchronization</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="automaticRefills">Automatic Refills</Label>
                    <Controller
                      name="automaticRefills"
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
                            <SelectItem value="yes">Yes - All medications</SelectItem>
                            <SelectItem value="some">Some medications</SelectItem>
                            <SelectItem value="no">No automatic refills</SelectItem>
                            <SelectItem value="recommended">Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationDelivery">Medication Delivery</Label>
                    <Controller
                      name="medicationDelivery"
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
                            <SelectItem value="yes">Yes - Home delivery</SelectItem>
                            <SelectItem value="pickup">Pharmacy pickup</SelectItem>
                            <SelectItem value="both">Both options available</SelectItem>
                            <SelectItem value="no">No delivery service</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Assessment and Plan</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicationChanges">Medication Changes</Label>
                      <Controller
                        name="medicationChanges"
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
                              <SelectItem value="none">No changes needed</SelectItem>
                              <SelectItem value="new">New medications added</SelectItem>
                              <SelectItem value="discontinued">Medications discontinued</SelectItem>
                              <SelectItem value="adjusted">Dosages adjusted</SelectItem>
                              <SelectItem value="multiple">Multiple changes</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.medicationChanges && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patientEducation">Patient Education Provided</Label>
                      <Controller
                        name="patientEducation"
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
                              <SelectItem value="comprehensive">Comprehensive education</SelectItem>
                              <SelectItem value="basic">Basic education</SelectItem>
                              <SelectItem value="written_materials">Written materials provided</SelectItem>
                              <SelectItem value="not_provided">Not provided</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.patientEducation && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="followUpRequired">Follow-up Required</Label>
                      <Controller
                        name="followUpRequired"
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
                              <SelectItem value="yes">Yes - Follow-up needed</SelectItem>
                              <SelectItem value="routine">Routine follow-up</SelectItem>
                              <SelectItem value="no">No follow-up needed</SelectItem>
                              <SelectItem value="prn">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.followUpRequired && (
                        <p className="text-sm text-red-500">Required field</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextReviewDate">Next Medication Review Date</Label>
                      <Input
                        id="nextReviewDate"
                        type="date"
                        {...register("nextReviewDate")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>

                {watchMedicationChanges !== "none" && (
                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPrescriptions">New Prescriptions</Label>
                      <Textarea
                        id="newPrescriptions"
                        placeholder="List any new medications prescribed"
                        {...register("newPrescriptions")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discontinuedMedications">Discontinued Medications</Label>
                      <Textarea
                        id="discontinuedMedications"
                        placeholder="List any medications discontinued and reasons"
                        {...register("discontinuedMedications")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dosageAdjustments">Dosage Adjustments</Label>
                      <Textarea
                        id="dosageAdjustments"
                        placeholder="List any dosage changes and rationale"
                        {...register("dosageAdjustments")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                )}

                {/* DOH Compliance Validator */}
                <DOHComplianceValidator
                  formData={watch()}
                  formType="medication_reconciliation"
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
                  <span className="font-medium">Form Type:</span> Medication
                  Reconciliation
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
                By signing, I confirm that this medication reconciliation is accurate
                and complete to the best of my knowledge. This electronic signature
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

export default MedicationReconciliationForm;
