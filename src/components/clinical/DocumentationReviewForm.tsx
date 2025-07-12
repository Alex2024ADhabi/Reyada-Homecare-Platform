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
import { useSignatureWorkflow } from "@/hooks/useSignatureWorkflow";
import DOHComplianceValidator from "@/components/clinical/DOHComplianceValidator";
import SignatureWorkflow from "@/components/ui/signature-workflow";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Calendar,
  Pen,
  CheckCircle,
  AlertCircle,
  Target,
  Search,
  Shield,
  BookOpen,
  Eye,
  Edit,
  Archive,
  Workflow,
  GitBranch,
  UserCheck,
  Timer,
} from "lucide-react";

interface DocumentationReviewFormProps {
  patientId?: string;
  episodeId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  readOnly?: boolean;
}

// Documentation types
const documentationTypes = [
  "Initial Assessment",
  "Progress Notes",
  "Care Plan Updates",
  "Medication Records",
  "Vital Signs",
  "Incident Reports",
  "Discharge Planning",
  "Family Communications",
  "Physician Orders",
  "Lab Results",
  "Imaging Reports",
  "Therapy Notes",
];

// Review criteria
const reviewCriteria = [
  "Completeness",
  "Accuracy",
  "Timeliness",
  "Legibility",
  "Compliance",
  "Consistency",
  "Relevance",
  "Confidentiality",
];

// Quality ratings
const qualityRatings = [
  "Excellent (90-100%)",
  "Good (80-89%)",
  "Satisfactory (70-79%)",
  "Needs Improvement (60-69%)",
  "Poor (<60%)",
];

// Compliance standards
const complianceStandards = [
  "DOH Documentation Standards",
  "JAWDA Quality Requirements",
  "Daman Insurance Guidelines",
  "ADHICS Security Standards",
  "Tawteen Reporting Requirements",
  "Internal Quality Policies",
  "Legal Documentation Requirements",
  "Accreditation Standards",
];

// Review outcomes
const reviewOutcomes = [
  "Approved - No Action Required",
  "Approved - Minor Corrections Noted",
  "Conditional Approval - Corrections Required",
  "Rejected - Major Issues Identified",
  "Incomplete - Additional Information Needed",
];

const DocumentationReviewForm: React.FC<DocumentationReviewFormProps> = ({
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

  const [activeTab, setActiveTab] = useState("documentation-review");
  const [formCompletion, setFormCompletion] = useState(0);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>(
    [],
  );
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [dohCompliance, setDohCompliance] = useState<{
    isCompliant: boolean;
    issues: string[];
  }>({ isCompliant: true, issues: [] });
  const [workflowEnabled, setWorkflowEnabled] = useState(false);

  // Signature Workflow Integration
  const signatureWorkflow = useSignatureWorkflow({
    workflowId: "documentation_review",
    documentId: `doc_review_${patientId}_${episodeId}_${Date.now()}`,
    formData: watch ? watch() : {},
    patientId,
    episodeId,
    priority: "medium",
    autoStart: false,
    enableRealTimeUpdates: true,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: initialData || {
      // Documentation Review
      reviewDate: new Date().toISOString().split("T")[0],
      reviewerName: userProfile?.full_name || "",
      reviewerRole: userProfile?.role || "",
      documentationPeriod: "",
      totalDocumentsReviewed: "",
      reviewScope: "comprehensive",
      reviewPurpose: "quality_assurance",

      // Quality Assessment
      overallQualityRating: "",
      completenessScore: "",
      accuracyScore: "",
      timelinessScore: "",
      complianceScore: "",
      legibilityScore: "",
      consistencyScore: "",
      relevanceScore: "",
      confidentialityScore: "",

      // Compliance Review
      dohComplianceStatus: "compliant",
      jawdaComplianceStatus: "compliant",
      damanComplianceStatus: "compliant",
      adhicsComplianceStatus: "compliant",
      internalPolicyCompliance: "compliant",
      legalComplianceStatus: "compliant",
      accreditationCompliance: "compliant",

      // Findings and Issues
      criticalIssues: "",
      majorIssues: "",
      minorIssues: "",
      positiveFindings: "",
      improvementOpportunities: "",
      bestPracticesIdentified: "",

      // Corrective Actions
      immediateActions: "",
      shortTermActions: "",
      longTermActions: "",
      responsibleParties: "",
      targetCompletionDates: "",
      followUpSchedule: "",

      // Training and Education
      trainingNeeds: "",
      educationRecommendations: "",
      competencyGaps: "",
      trainingPriorities: "",
      resourceRequirements: "",
      trainingTimeline: "",

      // Quality Improvement
      processImprovements: "",
      systemEnhancements: "",
      policyUpdates: "",
      procedureRevisions: "",
      technologyNeeds: "",
      workflowOptimization: "",

      // Review Outcome
      reviewOutcome: "",
      overallRecommendation: "",
      nextReviewDate: "",
      escalationRequired: "no",
      managementNotification: "no",
      regulatoryReporting: "no",
    },
  });

  const watchReviewScope = watch("reviewScope");
  const watchEscalationRequired = watch("escalationRequired");
  const watchManagementNotification = watch("managementNotification");
  const watchRegulatoryReporting = watch("regulatoryReporting");
  const watchOverallQualityRating = watch("overallQualityRating");
  const watchReviewOutcome = watch("reviewOutcome");

  // Calculate form completion percentage
  useEffect(() => {
    const formValues = watch();
    const requiredFields = [
      "reviewDate",
      "reviewerName",
      "documentationPeriod",
      "totalDocumentsReviewed",
      "overallQualityRating",
      "dohComplianceStatus",
      "reviewOutcome",
      "overallRecommendation",
      "nextReviewDate",
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
    if (selectedDocumentTypes.length > 0) additionalPoints += 1;
    if (selectedCriteria.length > 0) additionalPoints += 1;
    if (selectedStandards.length > 0) additionalPoints += 1;

    const completionPercentage = Math.round(
      ((filledRequiredFields + additionalPoints) / (totalRequiredFields + 3)) *
        100,
    );
    setFormCompletion(Math.min(completionPercentage, 100));
  }, [watch, selectedDocumentTypes, selectedCriteria, selectedStandards]);

  const handleDocumentTypeChange = (type: string) => {
    setSelectedDocumentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleCriteriaChange = (criteria: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(criteria)
        ? prev.filter((c) => c !== criteria)
        : [...prev, criteria],
    );
  };

  const handleStandardChange = (standard: string) => {
    setSelectedStandards((prev) =>
      prev.includes(standard)
        ? prev.filter((s) => s !== standard)
        : [...prev, standard],
    );
  };

  const handleSignatureCapture = (data: string) => {
    setSignatureData(data);
  };

  const handleWorkflowToggle = () => {
    setWorkflowEnabled(!workflowEnabled);
    if (!workflowEnabled && !signatureWorkflow.instance) {
      signatureWorkflow.startWorkflow();
    }
  };

  const handleWorkflowStepComplete = async (
    stepId: string,
    signatureData: any,
  ) => {
    try {
      await signatureWorkflow.completeStep(stepId, signatureData);
    } catch (error) {
      console.error("Failed to complete workflow step:", error);
    }
  };

  const handleDOHComplianceCheck = (result: {
    isCompliant: boolean;
    issues: string[];
  }) => {
    setDohCompliance(result);
    if (!result.isCompliant && result.issues.length > 0) {
      const tabMapping = {
        "documentation-review": ["documentation", "review", "record", "file"],
        "quality-assessment": ["quality", "assessment", "score", "rating"],
        "compliance-review": ["compliance", "standard", "regulation", "policy"],
        "findings-issues": ["finding", "issue", "problem", "concern"],
        "corrective-actions": ["action", "correction", "improvement", "fix"],
        "training-education": ["training", "education", "competency", "skill"],
        "quality-improvement": [
          "improvement",
          "enhancement",
          "optimization",
          "process",
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
      selectedDocumentTypes,
      selectedCriteria,
      selectedStandards,
      reviewDate: new Date().toISOString(),
      clinicianId: userProfile?.id,
      clinicianName: userProfile?.full_name,
      clinicianRole: userProfile?.role,
      patientId,
      episodeId,
      formVersion: "1.0",
      formType: "documentation_review",
      submissionTimestamp: new Date().toISOString(),
    };

    const documentHash = generateDocumentHash(JSON.stringify(formData));

    if (signatureData) {
      try {
        const signaturePayload = {
          documentId: `documentation_review_${patientId}_${Date.now()}`,
          signerUserId: userProfile?.id || "",
          signerName: userProfile?.full_name || "",
          signerRole: userProfile?.role || "",
          timestamp: Date.now(),
          documentHash,
          signatureType: "clinician",
          metadata: {
            formType: "documentation_review",
            patientId,
            episodeId,
            signatureReason: "Documentation review completion",
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
      documentId: `documentation_review_${patientId}_${Date.now()}`,
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
              <CardTitle>Documentation Review Form</CardTitle>
              <CardDescription>
                Comprehensive review of clinical documentation for quality,
                compliance, and continuous improvement
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
              {workflowEnabled && signatureWorkflow.instance && (
                <Badge
                  variant={
                    signatureWorkflow.instance.status === "completed"
                      ? "default"
                      : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  <Workflow className="h-3 w-3" />
                  {signatureWorkflow.progress.progressPercentage}% Workflow
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-8 mb-4">
              <TabsTrigger value="documentation-review">
                <FileText className="mr-2 h-4 w-4" /> Review
              </TabsTrigger>
              <TabsTrigger value="quality-assessment">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Quality
              </TabsTrigger>
              <TabsTrigger value="compliance-review">
                <Shield className="mr-2 h-4 w-4" /> Compliance
              </TabsTrigger>
              <TabsTrigger value="findings-issues">
                <Search className="mr-2 h-4 w-4" /> Findings
              </TabsTrigger>
              <TabsTrigger value="corrective-actions">
                <Target className="mr-2 h-4 w-4" /> Actions
              </TabsTrigger>
              <TabsTrigger value="training-education">
                <BookOpen className="mr-2 h-4 w-4" /> Training
              </TabsTrigger>
              <TabsTrigger value="quality-improvement">
                <Edit className="mr-2 h-4 w-4" /> Improvement
              </TabsTrigger>
              <TabsTrigger value="signature-workflow">
                <GitBranch className="mr-2 h-4 w-4" /> Workflow
              </TabsTrigger>
            </TabsList>

            {/* Documentation Review Section */}
            <TabsContent value="documentation-review" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewDate">Review Date</Label>
                    <Input
                      id="reviewDate"
                      type="date"
                      {...register("reviewDate", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.reviewDate && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewerName">Reviewer Name</Label>
                    <Input
                      id="reviewerName"
                      placeholder="Full name of reviewer"
                      {...register("reviewerName", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.reviewerName && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewerRole">Reviewer Role</Label>
                    <Input
                      id="reviewerRole"
                      placeholder="Position/title"
                      {...register("reviewerRole")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentationPeriod">
                      Documentation Period
                    </Label>
                    <Input
                      id="documentationPeriod"
                      placeholder="e.g., January 2024, Q4 2023"
                      {...register("documentationPeriod", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.documentationPeriod && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalDocumentsReviewed">
                      Total Documents Reviewed
                    </Label>
                    <Input
                      id="totalDocumentsReviewed"
                      type="number"
                      min="0"
                      placeholder="Number of documents"
                      {...register("totalDocumentsReviewed", {
                        required: true,
                      })}
                      disabled={readOnly}
                    />
                    {errors.totalDocumentsReviewed && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewScope">Review Scope</Label>
                    <Controller
                      name="reviewScope"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select review scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comprehensive">
                              Comprehensive Review
                            </SelectItem>
                            <SelectItem value="focused">
                              Focused Review
                            </SelectItem>
                            <SelectItem value="targeted">
                              Targeted Review
                            </SelectItem>
                            <SelectItem value="random_sample">
                              Random Sample
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewPurpose">Review Purpose</Label>
                    <Controller
                      name="reviewPurpose"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select review purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quality_assurance">
                              Quality Assurance
                            </SelectItem>
                            <SelectItem value="compliance_audit">
                              Compliance Audit
                            </SelectItem>
                            <SelectItem value="incident_investigation">
                              Incident Investigation
                            </SelectItem>
                            <SelectItem value="accreditation_prep">
                              Accreditation Preparation
                            </SelectItem>
                            <SelectItem value="continuous_improvement">
                              Continuous Improvement
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">
                      Document Types Reviewed (select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {documentationTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`doc-type-${type}`}
                            checked={selectedDocumentTypes.includes(type)}
                            onCheckedChange={() =>
                              handleDocumentTypeChange(type)
                            }
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`doc-type-${type}`}
                            className="text-sm font-normal"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Review Summary</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        Period:{" "}
                        <span className="font-medium">
                          {watch("documentationPeriod") || "--"}
                        </span>
                      </div>
                      <div>
                        Documents:{" "}
                        <span className="font-medium">
                          {watch("totalDocumentsReviewed") || "--"}
                        </span>
                      </div>
                      <div>
                        Scope:{" "}
                        <span className="font-medium">
                          {watchReviewScope || "--"}
                        </span>
                      </div>
                      <div>
                        Types Selected:{" "}
                        <span className="font-medium">
                          {selectedDocumentTypes.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Quality Assessment Section */}
            <TabsContent value="quality-assessment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallQualityRating">
                      Overall Quality Rating
                    </Label>
                    <Controller
                      name="overallQualityRating"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {qualityRatings.map((rating) => (
                              <SelectItem
                                key={rating}
                                value={rating
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}
                              >
                                {rating}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.overallQualityRating && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completenessScore">
                      Completeness Score (%)
                    </Label>
                    <Input
                      id="completenessScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 85"
                      {...register("completenessScore")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accuracyScore">Accuracy Score (%)</Label>
                    <Input
                      id="accuracyScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 92"
                      {...register("accuracyScore")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timelinessScore">
                      Timeliness Score (%)
                    </Label>
                    <Input
                      id="timelinessScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 78"
                      {...register("timelinessScore")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complianceScore">
                      Compliance Score (%)
                    </Label>
                    <Input
                      id="complianceScore"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 95"
                      {...register("complianceScore")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      Review Criteria (select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {reviewCriteria.map((criteria) => (
                        <div
                          key={criteria}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`criteria-${criteria}`}
                            checked={selectedCriteria.includes(criteria)}
                            onCheckedChange={() =>
                              handleCriteriaChange(criteria)
                            }
                            disabled={readOnly}
                          />
                          <Label
                            htmlFor={`criteria-${criteria}`}
                            className="text-sm font-normal"
                          >
                            {criteria}
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
                        Overall Rating:{" "}
                        <span className="font-medium">
                          {watch("overallQualityRating") || "--"}
                        </span>
                      </div>
                      <div>
                        Completeness:{" "}
                        <span className="font-medium">
                          {watch("completenessScore") || "--"}%
                        </span>
                      </div>
                      <div>
                        Accuracy:{" "}
                        <span className="font-medium">
                          {watch("accuracyScore") || "--"}%
                        </span>
                      </div>
                      <div>
                        Compliance:{" "}
                        <span className="font-medium">
                          {watch("complianceScore") || "--"}%
                        </span>
                      </div>
                      <div>
                        Criteria Selected:{" "}
                        <span className="font-medium">
                          {selectedCriteria.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Quality Improvement Section */}
            <TabsContent value="quality-improvement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="processImprovements">
                      Process Improvements
                    </Label>
                    <Textarea
                      id="processImprovements"
                      placeholder="Identify process improvement opportunities"
                      {...register("processImprovements")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemEnhancements">
                      System Enhancements
                    </Label>
                    <Textarea
                      id="systemEnhancements"
                      placeholder="Recommend system and technology enhancements"
                      {...register("systemEnhancements")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policyUpdates">Policy Updates</Label>
                    <Textarea
                      id="policyUpdates"
                      placeholder="Suggest policy updates and revisions"
                      {...register("policyUpdates")}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="procedureRevisions">
                      Procedure Revisions
                    </Label>
                    <Textarea
                      id="procedureRevisions"
                      placeholder="Recommend procedure revisions"
                      {...register("procedureRevisions")}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewOutcome">Review Outcome</Label>
                    <Controller
                      name="reviewOutcome"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select review outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            {reviewOutcomes.map((outcome) => (
                              <SelectItem
                                key={outcome}
                                value={outcome
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}
                              >
                                {outcome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.reviewOutcome && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overallRecommendation">
                      Overall Recommendation
                    </Label>
                    <Textarea
                      id="overallRecommendation"
                      placeholder="Provide overall recommendation and summary"
                      {...register("overallRecommendation", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.overallRecommendation && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextReviewDate">Next Review Date</Label>
                    <Input
                      id="nextReviewDate"
                      type="date"
                      {...register("nextReviewDate", { required: true })}
                      disabled={readOnly}
                    />
                    {errors.nextReviewDate && (
                      <p className="text-sm text-red-500">Required field</p>
                    )}
                  </div>

                  {/* DOH Compliance Validator */}
                  <DOHComplianceValidator
                    formData={watch()}
                    formType="documentation_review"
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

            {/* Signature Workflow Section */}
            <TabsContent value="signature-workflow" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Signature Workflow
                    </h3>
                    <Button
                      variant={workflowEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={handleWorkflowToggle}
                      disabled={readOnly}
                    >
                      {workflowEnabled ? "Disable Workflow" : "Enable Workflow"}
                    </Button>
                  </div>

                  {workflowEnabled && (
                    <div className="space-y-4">
                      <Alert className="bg-blue-50 border-blue-200">
                        <Workflow className="h-4 w-4" />
                        <AlertDescription>
                          Advanced signature workflow is enabled. This form will
                          require multiple signatures based on review findings
                          and compliance requirements.
                        </AlertDescription>
                      </Alert>

                      {signatureWorkflow.instance && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Workflow Progress
                            </span>
                            <Badge variant="outline">
                              {signatureWorkflow.progress.completedSteps} of{" "}
                              {signatureWorkflow.progress.totalSteps} steps
                            </Badge>
                          </div>
                          <Progress
                            value={
                              signatureWorkflow.progress.progressPercentage
                            }
                            className="h-2"
                          />

                          <div className="text-xs text-muted-foreground">
                            Status:{" "}
                            <span className="font-medium capitalize">
                              {signatureWorkflow.instance.status}
                            </span>
                          </div>
                        </div>
                      )}

                      {signatureWorkflow.progress.currentStepInfo && (
                        <div className="border rounded-lg p-4 bg-yellow-50">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCheck className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                              Current Step:{" "}
                              {signatureWorkflow.progress.currentStepInfo.name}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-700">
                            {
                              signatureWorkflow.progress.currentStepInfo
                                .description
                            }
                          </p>
                          <div className="mt-2 text-xs text-yellow-600">
                            Required Role:{" "}
                            <span className="font-medium">
                              {
                                signatureWorkflow.progress.currentStepInfo
                                  .signerRole
                              }
                            </span>
                          </div>
                        </div>
                      )}

                      {signatureWorkflow.progress.nextSteps.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            Pending Steps
                          </h4>
                          <div className="space-y-2">
                            {signatureWorkflow.progress.nextSteps.map(
                              (step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <div>
                                    <div className="text-sm font-medium">
                                      {step.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Role: {step.signerRole}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {step.required && (
                                      <Badge variant="destructive" size="sm">
                                        Required
                                      </Badge>
                                    )}
                                    {signatureWorkflow.canCompleteStep(
                                      step.id,
                                    ) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setShowWorkflowDialog(true)
                                        }
                                      >
                                        Sign
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Workflow Configuration
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Workflow Type:</span>
                      <span className="font-medium">Documentation Review</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Auto-escalation:</span>
                      <span className="font-medium text-green-600">
                        Enabled
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Compliance Standards:</span>
                      <span className="font-medium">DOH, JAWDA, ADHICS</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Audit Trail:</span>
                      <span className="font-medium text-green-600">Full</span>
                    </div>
                  </div>

                  {signatureWorkflow.instance && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Workflow Rules</h4>

                      <div className="space-y-2 text-xs">
                        {watchOverallQualityRating &&
                          watchOverallQualityRating.includes("poor") && (
                            <Alert variant="destructive" className="py-2">
                              <AlertTriangle className="h-3 w-3" />
                              <AlertDescription className="text-xs">
                                Poor quality rating triggers QA specialist
                                review
                              </AlertDescription>
                            </Alert>
                          )}

                        {watchRegulatoryReporting === "yes" && (
                          <Alert className="py-2 bg-orange-50 border-orange-200">
                            <Shield className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              Regulatory reporting requires compliance officer
                              signature
                            </AlertDescription>
                          </Alert>
                        )}

                        {watchEscalationRequired === "yes" && (
                          <Alert className="py-2 bg-red-50 border-red-200">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              Escalation triggers medical director approval
                              requirement
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}

                  {signatureWorkflow.instance?.auditTrail &&
                    signatureWorkflow.instance.auditTrail.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Activity</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {signatureWorkflow.instance.auditTrail
                            .slice(-5)
                            .map((entry) => (
                              <div
                                key={entry.id}
                                className="text-xs p-2 bg-gray-50 rounded"
                              >
                                <div className="font-medium">
                                  {entry.action.replace("_", " ")}
                                </div>
                                <div className="text-muted-foreground">
                                  {entry.userName} •{" "}
                                  {new Date(entry.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
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
              <div className="flex space-x-2">
                {workflowEnabled ? (
                  <Button
                    onClick={() => setShowWorkflowDialog(true)}
                    disabled={
                      !signatureWorkflow.userPermissions.canSignCurrentStep ||
                      !isValid ||
                      formCompletion < 100
                    }
                  >
                    <GitBranch className="mr-2 h-4 w-4" /> Continue Workflow
                  </Button>
                ) : (
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
                  <span className="font-medium">Form Type:</span> Documentation
                  Review
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
                By signing, I confirm that this documentation review is accurate
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
                {isCreating ? "Processing..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Workflow Dialog */}
      {workflowEnabled && (
        <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Documentation Review Workflow
              </DialogTitle>
            </DialogHeader>

            {signatureWorkflow.instance && (
              <SignatureWorkflow
                workflow={signatureWorkflow.workflow}
                instance={signatureWorkflow.instance}
                userPermissions={signatureWorkflow.userPermissions}
                onStepComplete={handleWorkflowStepComplete}
                onWorkflowComplete={(instance) => {
                  setShowWorkflowDialog(false);
                  if (onSave) {
                    onSave({
                      ...watch(),
                      workflowInstance: instance,
                      workflowCompleted: true,
                    });
                  }
                }}
                onCancel={() => setShowWorkflowDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      <Progress value={formCompletion} className="h-2" />
    </div>
  );
};

export default DocumentationReviewForm;
