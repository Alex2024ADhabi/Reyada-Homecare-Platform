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
  AlertTriangle,
  Phone,
  MapPin,
  Shield,
  Users,
  FileText,
  Clock,
  Calendar,
  Pen,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  Heart,
} from "lucide-react";

interface EmergencyPreparednessFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Emergency types
const emergencyTypes = [
  "Medical Emergency",
  "Cardiac Arrest",
  "Respiratory Distress",
  "Severe Bleeding",
  "Allergic Reaction",
  "Diabetic Emergency",
  "Seizure",
  "Fall with Injury",
  "Medication Error",
  "Equipment Failure",
  "Natural Disaster",
  "Security Threat",
];

// Risk levels
const riskLevels = ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"];

// Emergency equipment
const emergencyEquipment = [
  "AED (Automated External Defibrillator)",
  "Oxygen Tank",
  "First Aid Kit",
  "Emergency Medications",
  "Suction Device",
  "Blood Pressure Cuff",
  "Pulse Oximeter",
  "Glucometer",
  "Emergency Lighting",
  "Communication Device",
  "Stretcher/Gurney",
  "Spinal Board",
];

// Communication methods
const communicationMethods = [
  "Landline Phone",
  "Mobile Phone",
  "Two-way Radio",
  "Emergency Alert System",
  "Satellite Phone",
  "Internet Communication",
  "Pager System",
];

const EmergencyPreparednessForm: React.FC<EmergencyPreparednessFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("risk-assessment");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedCommunication, setSelectedCommunication] = useState<string[]>(
    [],
  );
  const [selectedEmergencyTypes, setSelectedEmergencyTypes] = useState<
    string[]
  >([]);
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
      // Risk Assessment
      overallRiskLevel: "",
      patientRiskFactors: "",
      environmentalHazards: "",
      medicalComplexity: "low",
      mobilityLimitations: "none",
      cognitiveStatus: "intact",
      communicationBarriers: "none",

      // Emergency Contacts
      primaryEmergencyContact: "",
      primaryContactPhone: "",
      primaryContactRelationship: "",
      secondaryEmergencyContact: "",
      secondaryContactPhone: "",
      secondaryContactRelationship: "",
      physicianContact: "",
      physicianPhone: "",
      localEmergencyServices: "911",
      poisonControlCenter: "1-800-222-1222",

      // Emergency Procedures
      cardiacEmergencyProcedure: "",
      respiratoryEmergencyProcedure: "",
      diabeticEmergencyProcedure: "",
      seizureProcedure: "",
      fallProcedure: "",
      medicationErrorProcedure: "",
      evacuationProcedure: "",
      shelterInPlaceProcedure: "",

      // Equipment & Supplies
      emergencyKitLocation: "",
      equipmentMaintenanceSchedule: "",
      medicationStorage: "",
      backupPowerSource: "no",
      waterSupply: "adequate",
      foodSupply: "adequate",

      // Communication Plan
      primaryCommunicationMethod: "",
      backupCommunicationMethod: "",
      emergencyNotificationSystem: "no",
      familyNotificationPlan: "",
      staffNotificationPlan: "",
      externalAgencyContacts: "",

      // Training & Education
      staffTrainingCompleted: "no",
      lastTrainingDate: "",
      cprCertification: "no",
      firstAidCertification: "no",
      patientEducationProvided: "no",
      familyEducationProvided: "no",
      emergencyDrillsCompleted: "no",
      lastDrillDate: "",

      // Documentation & Review
      planLastReviewed: "",
      planNextReview: "",
      incidentReportingProcedure: "",
      qualityImprovementProcess: "",
      regulatoryCompliance: "yes",
      insuranceNotification: "",
    },
  });

  const watchMedicalComplexity = watch("medicalComplexity");
  const watchBackupPowerSource = watch("backupPowerSource");
  const watchEmergencyNotificationSystem = watch("emergencyNotificationSystem");
  const watchStaffTrainingCompleted = watch("staffTrainingCompleted");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "overallRiskLevel",
      "primaryEmergencyContact",
      "primaryContactPhone",
      "cardiacEmergencyProcedure",
      "respiratoryEmergencyProcedure",
      "emergencyKitLocation",
      "primaryCommunicationMethod",
      "staffTrainingCompleted",
      "planLastReviewed",
      "incidentReportingProcedure",
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
    if (selectedCommunication.length > 0) additionalPoints += 1;
    if (selectedEmergencyTypes.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 3)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [watch, selectedEquipment, selectedCommunication, selectedEmergencyTypes]);

  const handleEquipmentChange = (equipment: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment],
    );
  };

  const handleCommunicationChange = (method: string) => {
    setSelectedCommunication((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const handleEmergencyTypeChange = (type: string) => {
    setSelectedEmergencyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
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
        "risk-assessment": ["risk", "assessment", "hazard", "factor"],
        "emergency-contacts": ["contact", "phone", "emergency", "physician"],
        procedures: ["procedure", "protocol", "response", "action"],
        "equipment-supplies": ["equipment", "supply", "kit", "maintenance"],
        communication: ["communication", "notification", "alert", "contact"],
        training: ["training", "education", "certification", "drill"],
        documentation: ["documentation", "review", "compliance", "report"],
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
      selectedCommunication,
      selectedEmergencyTypes,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "emergency_preparedness",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `emergency_preparedness_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "emergency_preparedness",
            patientId,
            episodeId,
            signatureReason: "Emergency preparedness plan completion",
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
      documentId: `emergency_preparedness_${patientId}_${Date.now()}`,
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
              <CardTitle>Emergency Preparedness Form</CardTitle>
              <CardDescription>
                Comprehensive emergency preparedness planning including risk
                assessment, emergency procedures, and communication protocols
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
              <TabsTrigger value="risk-assessment">
                <AlertTriangle className="mr-2 h-4 w-4" /> Risk
              </TabsTrigger>
              <TabsTrigger value="emergency-contacts">
                <Phone className="mr-2 h-4 w-4" /> Contacts
              </TabsTrigger>
              <TabsTrigger value="procedures">
                <FileText className="mr-2 h-4 w-4" /> Procedures
              </TabsTrigger>
              <TabsTrigger value="equipment-supplies">
                <Shield className="mr-2 h-4 w-4" /> Equipment
              </TabsTrigger>
              <TabsTrigger value="communication">
                <Zap className="mr-2 h-4 w-4" /> Communication
              </TabsTrigger>
              <TabsTrigger value="training">
                <Users className="mr-2 h-4 w-4" /> Training
              </TabsTrigger>
              <TabsTrigger value="documentation">
                <Target className="mr-2 h-4 w-4" /> Documentation
              </TabsTrigger>
            </TabsList>

            {/* Risk Assessment Section */}
            <TabsContent value="risk-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                            {riskLevels.map((level) => (
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
                    {errors.overallRiskLevel && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientRiskFactors">
                      Patient Risk Factors
                    </Label>
                    <Textarea
                      id="patientRiskFactors"
                      placeholder="Identify specific patient risk factors"
                      {...register("patientRiskFactors")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environmentalHazards">
                      Environmental Hazards
                    </Label>
                    <Textarea
                      id="environmentalHazards"
                      placeholder="Identify environmental hazards and risks"
                      {...register("environmentalHazards")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalComplexity">
                      Medical Complexity
                    </Label>
                    <Controller
                      name="medicalComplexity"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      Emergency Types (select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {emergencyTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`emergency-${type}`}
                            checked={selectedEmergencyTypes.includes(type)}
                            onCheckedChange={() =>
                              handleEmergencyTypeChange(type)
                            }
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`emergency-${type}`}
                            className="text-sm font-normal"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      Risk Assessment Summary
                    </h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Overall Risk:{" "}
                        <span className="font-medium">
                          {watch("overallRiskLevel") || "--"}
                        </span>
                      </div>
                      <div>
                        Medical Complexity:{" "}
                        <span className="font-medium">
                          {watchMedicalComplexity || "--"}
                        </span>
                      </div>
                      <div>
                        Emergency Types:{" "}
                        <span className="font-medium">
                          {selectedEmergencyTypes.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Emergency Contacts Section */}
            <TabsContent value="emergency-contacts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmergencyContact">
                      Primary Emergency Contact
                    </Label>
                    <Input
                      id="primaryEmergencyContact"
                      placeholder="Full name"
                      {...register("primaryEmergencyContact", {
                        required: true,
                      })}
                      disabled={readOnly}
                    />
                    {errors.primaryEmergencyContact && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactPhone">Phone Number</Label>
                    <Input
                      id="primaryContactPhone"
                      type="tel"
                      placeholder="Phone number"
                      {...register("primaryContactPhone", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.primaryContactPhone && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryContactRelationship">
                      Relationship
                    </Label>
                    <Input
                      id="primaryContactRelationship"
                      placeholder="e.g., Spouse, Child, Friend"
                      {...register("primaryContactRelationship")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="physicianContact">Primary Physician</Label>
                    <Input
                      id="physicianContact"
                      placeholder="Physician name"
                      {...register("physicianContact")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="physicianPhone">Physician Phone</Label>
                    <Input
                      id="physicianPhone"
                      type="tel"
                      placeholder="Physician phone number"
                      {...register("physicianPhone")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryEmergencyContact">
                      Secondary Emergency Contact
                    </Label>
                    <Input
                      id="secondaryEmergencyContact"
                      placeholder="Full name"
                      {...register("secondaryEmergencyContact")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryContactPhone">Phone Number</Label>
                    <Input
                      id="secondaryContactPhone"
                      type="tel"
                      placeholder="Phone number"
                      {...register("secondaryContactPhone")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localEmergencyServices">
                      Local Emergency Services
                    </Label>
                    <Input
                      id="localEmergencyServices"
                      placeholder="911 or local emergency number"
                      {...register("localEmergencyServices")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      Emergency Contacts Summary
                    </h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Primary Contact:{" "}
                        <span className="font-medium">
                          {watch("primaryEmergencyContact") || "--"}
                        </span>
                      </div>
                      <div>
                        Primary Phone:{" "}
                        <span className="font-medium">
                          {watch("primaryContactPhone") || "--"}
                        </span>
                      </div>
                      <div>
                        Physician:{" "}
                        <span className="font-medium">
                          {watch("physicianContact") || "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Documentation Section */}
            <TabsContent value="documentation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="planLastReviewed">Plan Last Reviewed</Label>
                    <Input
                      id="planLastReviewed"
                      type="date"
                      {...register("planLastReviewed", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.planLastReviewed && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="planNextReview">Next Review Date</Label>
                    <Input
                      id="planNextReview"
                      type="date"
                      {...register("planNextReview")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incidentReportingProcedure">
                      Incident Reporting Procedure
                    </Label>
                    <Textarea
                      id="incidentReportingProcedure"
                      placeholder="Describe incident reporting procedures"
                      {...register("incidentReportingProcedure", {
                        required: true,
                      })}
                      disabled={readOnly}
                    />
                    {errors.incidentReportingProcedure && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualityImprovementProcess">
                      Quality Improvement Process
                    </Label>
                    <Textarea
                      id="qualityImprovementProcess"
                      placeholder="Describe quality improvement processes"
                      {...register("qualityImprovementProcess")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regulatoryCompliance">
                      Regulatory Compliance
                    </Label>
                    <Controller
                      name="regulatoryCompliance"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select compliance status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Compliant</SelectItem>
                            <SelectItem value="no">Non-Compliant</SelectItem>
                            <SelectItem value="partial">
                              Partially Compliant
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceNotification">
                      Insurance Notification Process
                    </Label>
                    <Textarea
                      id="insuranceNotification"
                      placeholder="Describe insurance notification procedures"
                      {...register("insuranceNotification")}
                      disabled={readOnly}
                    />
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="emergency_preparedness"
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
                  <span className="font-medium">Form Type:</span> Emergency
                  Preparedness
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
                By signing, I confirm that this emergency preparedness plan is
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
                {isCreating ? "Processing..." : "Submit Plan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Progress value={formCompletion} className="h-2" />
    </div>
  );
};

export default EmergencyPreparednessForm;
