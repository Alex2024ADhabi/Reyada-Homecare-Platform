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
  Home,
  Users,
  FileText,
  Calendar,
  Clock,
  Pen,
  CheckCircle,
  AlertCircle,
  Target,
  MapPin,
  Phone,
  Briefcase,
  Heart,
  Shield,
} from "lucide-react";

interface DischargePlanningFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Discharge destinations
const dischargeDestinations = [
  "Home with Family",
  "Home Alone",
  "Assisted Living Facility",
  "Skilled Nursing Facility",
  "Rehabilitation Center",
  "Long-term Care Facility",
  "Hospice Care",
  "Another Hospital",
  "Other",
];

// Care levels
const careLevels = [
  "Independent",
  "Minimal Assistance",
  "Moderate Assistance",
  "Maximum Assistance",
  "Total Care",
];

// Equipment needs
const medicalEquipment = [
  "Hospital Bed",
  "Wheelchair",
  "Walker",
  "Oxygen Concentrator",
  "CPAP Machine",
  "Nebulizer",
  "Blood Pressure Monitor",
  "Glucose Monitor",
  "Wound Care Supplies",
  "Catheter Supplies",
  "Compression Stockings",
  "Shower Chair",
  "Grab Bars",
  "Raised Toilet Seat",
];

// Services needed
const homeServices = [
  "Home Health Nursing",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Social Work Services",
  "Home Health Aide",
  "Meal Delivery",
  "Transportation Services",
  "Pharmacy Delivery",
  "Housekeeping Services",
];

const DischargePlanningForm: React.FC<DischargePlanningFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("discharge-planning");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
      // Discharge Planning
      dischargeDate: "",
      dischargeTime: "",
      dischargeDestination: "",
      dischargeDestinationOther: "",
      careLevel: "independent",
      primaryCaregiver: "",
      caregiverRelationship: "",
      caregiverPhone: "",
      caregiverAddress: "",
      backupCaregiver: "",
      backupCaregiverPhone: "",

      // Medical Management
      dischargeDiagnosis: "",
      medicationReconciliation: "completed",
      medicationInstructions: "",
      followUpAppointments: "",
      primaryPhysician: "",
      specialistReferrals: "",
      labWorkNeeded: "no",
      labInstructions: "",

      // Home Environment
      homeAssessmentCompleted: "no",
      homeModificationsNeeded: "no",
      homeModifications: "",
      safetyHazards: "",
      accessibilityIssues: "",
      emergencyContacts: "",

      // Equipment and Services
      medicalEquipmentNeeded: "no",
      equipmentOrdered: "no",
      equipmentDeliveryDate: "",
      homeServicesNeeded: "no",
      servicesArranged: "no",
      serviceStartDate: "",

      // Patient Education
      educationProvided: "",
      educationMaterials: "",
      demonstrationCompleted: "no",
      patientUnderstanding: "good",
      familyEducation: "",
      emergencyInstructions: "",

      // Discharge Readiness
      medicalStability: "stable",
      functionalStatus: "independent",
      cognitiveStatus: "intact",
      socialSupport: "adequate",
      dischargeReadiness: "ready",
      barriers: "",
      interventions: "",

      // Follow-up Plan
      followUpPlan: "",
      nextAppointment: "",
      warningSignsEducation: "",
      whenToCallDoctor: "",
      emergencyPlan: "",
      qualityOfLifeGoals: "",
    },
  });

  const watchDischargeDestination = watch("dischargeDestination");
  const watchHomeAssessment = watch("homeAssessmentCompleted");
  const watchHomeModifications = watch("homeModificationsNeeded");
  const watchMedicalEquipment = watch("medicalEquipmentNeeded");
  const watchHomeServices = watch("homeServicesNeeded");
  const watchLabWork = watch("labWorkNeeded");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "dischargeDate",
      "dischargeDestination",
      "careLevel",
      "dischargeDiagnosis",
      "medicationReconciliation",
      "followUpAppointments",
      "educationProvided",
      "dischargeReadiness",
      "followUpPlan",
      "emergencyPlan",
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
    if (selectedEquipment.length > 0) additionalPoints += 1;
    if (selectedServices.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 2)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [watch, selectedEquipment, selectedServices]);

  const handleEquipmentChange = (equipment: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment],
    );
  };

  const handleServiceChange = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
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
        "discharge-planning": ["discharge", "planning", "destination"],
        "medical-management": ["medical", "medication", "diagnosis"],
        "home-environment": ["home", "environment", "safety"],
        "equipment-services": ["equipment", "service", "delivery"],
        "patient-education": ["education", "instruction", "teaching"],
        "follow-up": ["follow up", "appointment", "plan"],
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
      selectedEquipment,
      selectedServices,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "discharge_planning",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `discharge_planning_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "discharge_planning",
            patientId,
            episodeId,
            signatureReason: "Discharge planning form completion",
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
      documentId: `discharge_planning_${patientId}_${Date.now()}`,
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
              <CardTitle>Discharge Planning Form</CardTitle>
              <CardDescription>
                Comprehensive discharge planning including destination, care
                coordination, and follow-up arrangements
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
              <TabsTrigger value="discharge-planning">
                <Home className="mr-2 h-4 w-4" /> Planning
              </TabsTrigger>
              <TabsTrigger value="medical-management">
                <Heart className="mr-2 h-4 w-4" /> Medical
              </TabsTrigger>
              <TabsTrigger value="home-environment">
                <MapPin className="mr-2 h-4 w-4" /> Home
              </TabsTrigger>
              <TabsTrigger value="equipment-services">
                <Briefcase className="mr-2 h-4 w-4" /> Equipment
              </TabsTrigger>
              <TabsTrigger value="patient-education">
                <FileText className="mr-2 h-4 w-4" /> Education
              </TabsTrigger>
              <TabsTrigger value="follow-up">
                <Target className="mr-2 h-4 w-4" /> Follow-up
              </TabsTrigger>
            </TabsList>

            {/* Discharge Planning Section */}
            <TabsContent value="discharge-planning" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dischargeDate">
                      Planned Discharge Date
                    </Label>
                    <Input
                      id="dischargeDate"
                      type="date"
                      {...register("dischargeDate", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.dischargeDate && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dischargeTime">Discharge Time</Label>
                    <Input
                      id="dischargeTime"
                      type="time"
                      {...register("dischargeTime")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dischargeDestination">
                      Discharge Destination
                    </Label>
                    <Controller
                      name="dischargeDestination"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {dischargeDestinations.map((destination) => (
                              <SelectItem
                                key={destination}
                                value={destination
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}
                              >
                                {destination}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.dischargeDestination && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {watchDischargeDestination === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="dischargeDestinationOther">
                        Other Destination (specify)
                      </Label>
                      <Input
                        id="dischargeDestinationOther"
                        placeholder="Specify other destination"
                        {...register("dischargeDestinationOther")}
                        disabled={readOnly}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="careLevel">Required Care Level</Label>
                    <Controller
                      name="careLevel"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select care level" />
                          </SelectTrigger>
                          <SelectContent>
                            {careLevels.map((level) => (
                              <SelectItem
                                key={level}
                                value={level.toLowerCase().replace(/\s+/g, "_")}
                              >
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.careLevel && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryCaregiver">Primary Caregiver</Label>
                    <Input
                      id="primaryCaregiver"
                      placeholder="Name of primary caregiver"
                      {...register("primaryCaregiver")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiverRelationship">Relationship</Label>
                    <Input
                      id="caregiverRelationship"
                      placeholder="e.g., Spouse, Child, Friend"
                      {...register("caregiverRelationship")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiverPhone">Caregiver Phone</Label>
                    <Input
                      id="caregiverPhone"
                      type="tel"
                      placeholder="Phone number"
                      {...register("caregiverPhone")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiverAddress">Caregiver Address</Label>
                    <Textarea
                      id="caregiverAddress"
                      placeholder="Complete address"
                      {...register("caregiverAddress")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Discharge Summary</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Date:{" "}
                        <span className="font-medium">
                          {watch("dischargeDate") || "--"}
                        </span>
                      </div>
                      <div>
                        Destination:{" "}
                        <span className="font-medium">
                          {watch("dischargeDestination") || "--"}
                        </span>
                      </div>
                      <div>
                        Care Level:{" "}
                        <span className="font-medium">
                          {watch("careLevel") || "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Medical Management Section */}
            <TabsContent value="medical-management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dischargeDiagnosis">
                      Discharge Diagnosis
                    </Label>
                    <Textarea
                      id="dischargeDiagnosis"
                      placeholder="Primary and secondary diagnoses"
                      {...register("dischargeDiagnosis", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.dischargeDiagnosis && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationReconciliation">
                      Medication Reconciliation
                    </Label>
                    <Controller
                      name="medicationReconciliation"
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
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.medicationReconciliation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicationInstructions">
                      Medication Instructions
                    </Label>
                    <Textarea
                      id="medicationInstructions"
                      placeholder="Detailed medication instructions for patient"
                      {...register("medicationInstructions")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labWorkNeeded">Lab Work Needed</Label>
                    <Controller
                      name="labWorkNeeded"
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

                  {watchLabWork === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="labInstructions">Lab Instructions</Label>
                      <Textarea
                        id="labInstructions"
                        placeholder="Specific lab work instructions"
                        {...register("labInstructions")}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="followUpAppointments">
                      Follow-up Appointments
                    </Label>
                    <Textarea
                      id="followUpAppointments"
                      placeholder="Scheduled follow-up appointments"
                      {...register("followUpAppointments", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.followUpAppointments && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryPhysician">Primary Physician</Label>
                    <Input
                      id="primaryPhysician"
                      placeholder="Name and contact information"
                      {...register("primaryPhysician")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialistReferrals">
                      Specialist Referrals
                    </Label>
                    <Textarea
                      id="specialistReferrals"
                      placeholder="Referrals to specialists"
                      {...register("specialistReferrals")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Medical Status</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Medication Reconciliation:{" "}
                        <span className="font-medium">
                          {watch("medicationReconciliation") || "--"}
                        </span>
                      </div>
                      <div>
                        Lab Work:{" "}
                        <span className="font-medium">
                          {watchLabWork === "yes" ? "Required" : "Not Required"}
                        </span>
                      </div>
                      <div>
                        Follow-up:{" "}
                        <span className="font-medium">
                          {watch("followUpAppointments")
                            ? "Scheduled"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Equipment and Services Section */}
            <TabsContent value="equipment-services" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalEquipmentNeeded">
                      Medical Equipment Needed
                    </Label>
                    <Controller
                      name="medicalEquipmentNeeded"
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

                  {watchMedicalEquipment === "yes" && (
                    <>
                      <div>
                        <Label className="mb-2 block">
                          Equipment Needed (select all that apply)
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {medicalEquipment.map((equipment) => (
                            <div
                              key={equipment}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`equipment-${equipment}`}
                                checked={selectedEquipment.includes(equipment)}
                                onCheckedChange={() =>
                                  handleEquipmentChange(equipment)
                                }
                                disabled={readOnly}
                              />
                              <Label
                                htmlFor={`equipment-${equipment}`}
                                className="text-sm font-normal"
                              >
                                {equipment}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipmentOrdered">
                          Equipment Ordered
                        </Label>
                        <Controller
                          name="equipmentOrdered"
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
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipmentDeliveryDate">
                          Expected Delivery Date
                        </Label>
                        <Input
                          id="equipmentDeliveryDate"
                          type="date"
                          {...register("equipmentDeliveryDate")}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeServicesNeeded">
                      Home Services Needed
                    </Label>
                    <Controller
                      name="homeServicesNeeded"
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

                  {watchHomeServices === "yes" && (
                    <>
                      <div>
                        <Label className="mb-2 block">
                          Services Needed (select all that apply)
                        </Label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                          {homeServices.map((service) => (
                            <div
                              key={service}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`service-${service}`}
                                checked={selectedServices.includes(service)}
                                onCheckedChange={() =>
                                  handleServiceChange(service)
                                }
                                disabled={readOnly}
                              />
                              <Label
                                htmlFor={`service-${service}`}
                                className="text-sm font-normal"
                              >
                                {service}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servicesArranged">
                          Services Arranged
                        </Label>
                        <Controller
                          name="servicesArranged"
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
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serviceStartDate">
                          Service Start Date
                        </Label>
                        <Input
                          id="serviceStartDate"
                          type="date"
                          {...register("serviceStartDate")}
                          disabled={readOnly}
                        />
                      </div>
                    </>
                  )}

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      Equipment & Services Status
                    </h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Equipment:{" "}
                        <span className="font-medium">
                          {watchMedicalEquipment === "yes"
                            ? "Required"
                            : "Not Required"}
                        </span>
                      </div>
                      <div>
                        Services:{" "}
                        <span className="font-medium">
                          {watchHomeServices === "yes"
                            ? "Required"
                            : "Not Required"}
                        </span>
                      </div>
                      <div>
                        Selected Equipment:{" "}
                        <span className="font-medium">
                          {selectedEquipment.length}
                        </span>
                      </div>
                      <div>
                        Selected Services:{" "}
                        <span className="font-medium">
                          {selectedServices.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Follow-up Plan Section */}
            <TabsContent value="follow-up" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="followUpPlan">Follow-up Plan</Label>
                    <Textarea
                      id="followUpPlan"
                      placeholder="Comprehensive follow-up plan"
                      {...register("followUpPlan", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.followUpPlan && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextAppointment">Next Appointment</Label>
                    <Input
                      id="nextAppointment"
                      type="datetime-local"
                      {...register("nextAppointment")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warningSignsEducation">
                      Warning Signs Education
                    </Label>
                    <Textarea
                      id="warningSignsEducation"
                      placeholder="Warning signs patient should watch for"
                      {...register("warningSignsEducation")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whenToCallDoctor">
                      When to Call Doctor
                    </Label>
                    <Textarea
                      id="whenToCallDoctor"
                      placeholder="Specific situations requiring medical attention"
                      {...register("whenToCallDoctor")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPlan">Emergency Plan</Label>
                    <Textarea
                      id="emergencyPlan"
                      placeholder="Emergency action plan and contacts"
                      {...register("emergencyPlan", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.emergencyPlan && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualityOfLifeGoals">
                      Quality of Life Goals
                    </Label>
                    <Textarea
                      id="qualityOfLifeGoals"
                      placeholder="Patient's quality of life goals and expectations"
                      {...register("qualityOfLifeGoals")}
                      disabled={readOnly}
                    />
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="discharge_planning"
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
                  <span className="font-medium">Form Type:</span> Discharge
                  Planning
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
                By signing, I confirm that this discharge planning assessment is
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

export default DischargePlanningForm;
