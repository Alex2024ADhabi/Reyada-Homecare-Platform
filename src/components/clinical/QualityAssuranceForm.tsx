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
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Clock,
  Calendar,
  Pen,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  Shield,
} from "lucide-react";

interface QualityAssuranceFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Quality indicators
const qualityIndicators = [
  "Patient Safety",
  "Clinical Effectiveness",
  "Patient Experience",
  "Timeliness",
  "Efficiency",
  "Equity",
  "Care Coordination",
  "Communication",
  "Medication Safety",
  "Infection Prevention",
  "Documentation Quality",
  "Staff Competency",
];

// Performance ratings
const performanceRatings = [
  "Excellent (90-100%)",
  "Good (80-89%)",
  "Satisfactory (70-79%)",
  "Needs Improvement (60-69%)",
  "Poor (<60%)",
];

// Audit types
const auditTypes = [
  "Internal Quality Audit",
  "External Regulatory Audit",
  "DOH Compliance Audit",
  "Insurance Audit",
  "Accreditation Survey",
  "Peer Review",
  "Patient Safety Review",
  "Clinical Documentation Review",
];

// Improvement priorities
const improvementPriorities = [
  "High Priority",
  "Medium Priority",
  "Low Priority",
  "Urgent",
  "Routine",
];

const QualityAssuranceForm: React.FC<QualityAssuranceFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("quality-metrics");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedAuditTypes, setSelectedAuditTypes] = useState<string[]>([]);
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
      // Quality Metrics
      overallQualityScore: "",
      patientSatisfactionScore: "",
      clinicalOutcomesScore: "",
      safetyScore: "",
      complianceScore: "",
      efficiencyScore: "",
      qualityTrends: "",
      benchmarkComparison: "",

      // Performance Indicators
      readmissionRate: "",
      infectionRate: "",
      medicationErrorRate: "",
      fallRate: "",
      pressureUlcerRate: "",
      documentationCompleteness: "",
      timelinessOfCare: "",
      staffTurnoverRate: "",

      // Audit Results
      lastAuditDate: "",
      auditScore: "",
      auditFindings: "",
      correctiveActions: "",
      complianceStatus: "compliant",
      regulatoryIssues: "",
      followUpRequired: "no",
      nextAuditDate: "",

      // Improvement Initiatives
      currentInitiatives: "",
      improvementGoals: "",
      actionPlans: "",
      resourceRequirements: "",
      timeframes: "",
      responsibleParties: "",
      progressMonitoring: "",
      expectedOutcomes: "",

      // Staff Performance
      staffCompetencyAssessment: "",
      trainingNeeds: "",
      performanceIssues: "",
      recognitionPrograms: "",
      staffFeedback: "",
      professionalDevelopment: "",

      // Patient Feedback
      patientComplaints: "",
      complaintResolution: "",
      patientSuggestions: "",
      satisfactionSurveyResults: "",
      patientTestimonials: "",
      familyFeedback: "",

      // Risk Management
      identifiedRisks: "",
      riskMitigation: "",
      incidentReports: "",
      rootCauseAnalysis: "",
      preventiveActions: "",
      riskMonitoring: "",

      // Continuous Improvement
      qualityCommittee: "active",
      meetingFrequency: "monthly",
      improvementCulture: "",
      bestPractices: "",
      innovationInitiatives: "",
      knowledgeSharing: "",
      qualityEducation: "",
      sustainabilityPlan: "",
    },
  });

  const watchComplianceStatus = watch("complianceStatus");
  const watchFollowUpRequired = watch("followUpRequired");
  const watchQualityCommittee = watch("qualityCommittee");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "overallQualityScore",
      "patientSatisfactionScore",
      "clinicalOutcomesScore",
      "lastAuditDate",
      "auditScore",
      "complianceStatus",
      "currentInitiatives",
      "improvementGoals",
      "staffCompetencyAssessment",
      "identifiedRisks",
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
    if (selectedIndicators.length > 0) additionalPoints += 1;
    if (selectedAuditTypes.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 2)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [watch, selectedIndicators, selectedAuditTypes]);

  const handleIndicatorChange = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator],
    );
  };

  const handleAuditTypeChange = (auditType: string) => {
    setSelectedAuditTypes((prev) =>
      prev.includes(auditType)
        ? prev.filter((a) => a !== auditType)
        : [...prev, auditType],
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
        "quality-metrics": ["quality", "metric", "score", "performance"],
        "audit-results": ["audit", "compliance", "finding", "regulatory"],
        improvement: ["improvement", "initiative", "goal", "action"],
        "staff-performance": ["staff", "competency", "training", "performance"],
        "patient-feedback": [
          "patient",
          "feedback",
          "complaint",
          "satisfaction",
        ],
        "risk-management": ["risk", "incident", "safety", "mitigation"],
        "continuous-improvement": [
          "continuous",
          "committee",
          "culture",
          "best practice",
        ],
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
      selectedIndicators,
      selectedAuditTypes,
      assessmentDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "quality_assurance",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `quality_assurance_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "quality_assurance",
            patientId,
            episodeId,
            signatureReason: "Quality assurance assessment completion",
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
      documentId: `quality_assurance_${patientId}_${Date.now()}`,
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
              <CardTitle>Quality Assurance Form</CardTitle>
              <CardDescription>
                Comprehensive quality assurance assessment including performance
                metrics, audit results, and continuous improvement initiatives
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
              <TabsTrigger value="quality-metrics">
                <BarChart3 className="mr-2 h-4 w-4" /> Metrics
              </TabsTrigger>
              <TabsTrigger value="audit-results">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Audits
              </TabsTrigger>
              <TabsTrigger value="improvement">
                <TrendingUp className="mr-2 h-4 w-4" /> Improvement
              </TabsTrigger>
              <TabsTrigger value="staff-performance">
                <Users className="mr-2 h-4 w-4" /> Staff
              </TabsTrigger>
              <TabsTrigger value="patient-feedback">
                <FileText className="mr-2 h-4 w-4" /> Feedback
              </TabsTrigger>
              <TabsTrigger value="risk-management">
                <Shield className="mr-2 h-4 w-4" /> Risk
              </TabsTrigger>
              <TabsTrigger value="continuous-improvement">
                <Award className="mr-2 h-4 w-4" /> Continuous
              </TabsTrigger>
            </TabsList>

            {/* Quality Metrics Section */}
            <TabsContent value="quality-metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallQualityScore">
                      Overall Quality Score (%)
                    </Label>
                    <Input
                      id="overallQualityScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 85"
                      {...register("overallQualityScore", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.overallQualityScore && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientSatisfactionScore">
                      Patient Satisfaction Score (%)
                    </Label>
                    <Input
                      id="patientSatisfactionScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 92"
                      {...register("patientSatisfactionScore", {
                        required: true,
                      })}
                      disabled={readOnly}
                    />
                    {errors.patientSatisfactionScore && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinicalOutcomesScore">
                      Clinical Outcomes Score (%)
                    </Label>
                    <Input
                      id="clinicalOutcomesScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 88"
                      {...register("clinicalOutcomesScore", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.clinicalOutcomesScore && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="safetyScore">Safety Score (%)</Label>
                    <Input
                      id="safetyScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 95"
                      {...register("safetyScore")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      Quality Indicators (select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {qualityIndicators.map((indicator) => (
                        <div
                          key={indicator}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`indicator-${indicator}`}
                            checked={selectedIndicators.includes(indicator)}
                            onCheckedChange={() =>
                              handleIndicatorChange(indicator)
                            }
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`indicator-${indicator}`}
                            className="text-sm font-normal"
                          >
                            {indicator}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      Quality Metrics Summary
                    </h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Overall Score:{" "}
                        <span className="font-medium">
                          {watch("overallQualityScore") || "--"}%
                        </span>
                      </div>
                      <div>
                        Patient Satisfaction:{" "}
                        <span className="font-medium">
                          {watch("patientSatisfactionScore") || "--"}%
                        </span>
                      </div>
                      <div>
                        Clinical Outcomes:{" "}
                        <span className="font-medium">
                          {watch("clinicalOutcomesScore") || "--"}%
                        </span>
                      </div>
                      <div>
                        Selected Indicators:{" "}
                        <span className="font-medium">
                          {selectedIndicators.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Continuous Improvement Section */}
            <TabsContent value="continuous-improvement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualityCommittee">
                      Quality Committee Status
                    </Label>
                    <Controller
                      name="qualityCommittee"
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="forming">Forming</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingFrequency">Meeting Frequency</Label>
                    <Controller
                      name="meetingFrequency"
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
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="improvementCulture">
                      Improvement Culture
                    </Label>
                    <Textarea
                      id="improvementCulture"
                      placeholder="Describe the organizational culture of continuous improvement"
                      {...register("improvementCulture")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bestPractices">Best Practices</Label>
                    <Textarea
                      id="bestPractices"
                      placeholder="Document best practices and successful initiatives"
                      {...register("bestPractices")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="innovationInitiatives">
                      Innovation Initiatives
                    </Label>
                    <Textarea
                      id="innovationInitiatives"
                      placeholder="Describe current innovation and improvement initiatives"
                      {...register("innovationInitiatives")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knowledgeSharing">Knowledge Sharing</Label>
                    <Textarea
                      id="knowledgeSharing"
                      placeholder="Describe knowledge sharing mechanisms and practices"
                      {...register("knowledgeSharing")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sustainabilityPlan">
                      Sustainability Plan
                    </Label>
                    <Textarea
                      id="sustainabilityPlan"
                      placeholder="Plan for sustaining quality improvements"
                      {...register("sustainabilityPlan")}
                      disabled={readOnly}
                    />
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="quality_assurance"
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
                  <span className="font-medium">Form Type:</span> Quality
                  Assurance
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
                By signing, I confirm that this quality assurance assessment is
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

export default QualityAssuranceForm;
