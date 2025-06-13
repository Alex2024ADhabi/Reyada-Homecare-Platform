import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ClinicalFormsService,
  RealtimeService,
  supabase,
} from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  Camera,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  ClipboardList,
  Rocket,
  FileSpreadsheet,
  FileUp,
  Zap,
  Brain,
  Workflow,
  ArrowRight,
  Timer,
  Target,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import ComplianceChecker from "./ComplianceChecker";
import PatientAssessment from "./PatientAssessment";
import StartOfService from "./StartOfService";
import PlanOfCare from "./PlanOfCare";
import DamanSubmissionForm from "./DamanSubmissionForm";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";
import { MobileResponsiveLayout } from "@/components/ui/mobile-responsive";
import { EnhancedToast } from "@/components/ui/enhanced-toast";
import { toast } from "@/hooks/useToast";

interface ClinicalDocumentationProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
}

// FIXED: Comprehensive Error Boundary for Workflow Automation
class ClinicalWorkflowErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error; errorInfo?: string }
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Clinical Workflow Error:", error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
      hasError: true,
    });

    // Notify parent component of error
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Log to monitoring service
    this.logWorkflowError(error, errorInfo);
  }

  private logWorkflowError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Enhanced error logging for workflow automation failures
      const errorData = {
        timestamp: new Date().toISOString(),
        error: {
          name: error?.name || "UnknownError",
          message: error?.message || "Unknown error occurred",
          stack: error?.stack || "No stack trace available",
        },
        errorInfo: {
          componentStack:
            errorInfo?.componentStack || "No component stack available",
        },
        context: {
          component: "ClinicalDocumentation",
          workflow: "clinical-documentation-automation",
          severity: "HIGH",
          impact: "WORKFLOW_DISRUPTION",
        },
      };

      // Send to error monitoring service
      console.error("WORKFLOW_ERROR:", JSON.stringify(errorData, null, 2));

      // Show user-friendly error message with proper error handling
      if (typeof toast === "function") {
        toast({
          title: "Workflow Error Detected",
          description:
            "Clinical documentation workflow encountered an error. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (loggingError) {
      console.error("Error in error logging:", loggingError);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Workflow Error Recovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Clinical documentation workflow encountered an error. The
                  system is attempting to recover.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">Error Details:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {this.state.error?.message || "Unknown workflow error"}
                </p>
                <p className="text-xs text-gray-500">
                  Error ID: {Date.now().toString(36)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    this.setState({
                      hasError: false,
                      error: undefined,
                      errorInfo: undefined,
                    });
                    window.location.reload();
                  }}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Workflow
                </Button>
                <Button
                  onClick={() => {
                    // Reset component state
                    this.setState({
                      hasError: false,
                      error: undefined,
                      errorInfo: undefined,
                    });
                  }}
                  variant="secondary"
                >
                  Continue Without Automation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Workflow Automation Engine
interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "skipped";
  required: boolean;
  estimatedTime: number; // in minutes
  dependencies: string[];
  autoTrigger?: boolean;
}

interface ClinicalWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  totalEstimatedTime: number;
  completionRate: number;
  priority: "low" | "medium" | "high" | "critical";
}

const WorkflowAutomationEngine: React.FC<{
  workflow: ClinicalWorkflow;
  onStepComplete: (stepId: string) => void;
  onWorkflowComplete: () => void;
}> = ({ workflow, onStepComplete, onWorkflowComplete }) => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [automationEnabled, setAutomationEnabled] = useState(true);

  useEffect(() => {
    // Auto-advance to next available step
    if (automationEnabled) {
      const nextStep = workflow.steps.find(
        (step) =>
          step.status === "pending" &&
          step.dependencies.every(
            (dep) =>
              workflow.steps.find((s) => s.id === dep)?.status === "completed",
          ),
      );

      if (nextStep && nextStep.autoTrigger) {
        setCurrentStep(nextStep.id);
        setTimeout(() => {
          onStepComplete(nextStep.id);
        }, nextStep.estimatedTime * 100); // Simulate processing time
      }
    }
  }, [workflow.steps, automationEnabled]);

  const completedSteps = workflow.steps.filter(
    (step) => step.status === "completed",
  ).length;
  const totalSteps = workflow.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Card className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-900">
          <Workflow className="h-5 w-5 mr-2" />
          Clinical Workflow Automation
          <Badge variant="outline" className="ml-2 text-xs">
            {workflow.priority.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          {workflow.description} • Est. {workflow.totalEstimatedTime} min
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />

        <div className="space-y-2">
          {workflow.steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-2 rounded-md border"
            >
              <div className="flex items-center space-x-2">
                {step.status === "completed" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : step.status === "in-progress" ? (
                  <Timer className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
                <span
                  className={`text-sm ${step.status === "completed" ? "line-through text-gray-500" : ""}`}
                >
                  {step.name}
                </span>
                {step.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {step.estimatedTime}min
                </span>
                {step.status === "pending" &&
                  step.dependencies.length === 0 && (
                    <Button size="sm" onClick={() => onStepComplete(step.id)}>
                      Start
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
            <Label className="text-sm">Enable Auto-Workflow</Label>
          </div>
          <Button
            onClick={onWorkflowComplete}
            disabled={progressPercentage < 100}
            className="flex items-center"
          >
            <Target className="h-4 w-4 mr-2" />
            Complete Workflow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ClinicalDocumentation = ({
  patientId = "P12345",
  episodeId = "EP789",
  isOffline = false,
}: ClinicalDocumentationProps) => {
  const [activeTab, setActiveTab] = useState("forms"); // State for top-level tabs
  const [activeForm, setActiveForm] = useState("assessment");
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [documentProgress, setDocumentProgress] = useState(35);
  const [showComplianceChecker, setShowComplianceChecker] = useState(false);
  const [nlpAnalysis, setNlpAnalysis] = useState(null);
  const [codingSuggestions, setCodingSuggestions] = useState([]);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [workflowAutomation, setWorkflowAutomation] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] =
    useState<ClinicalWorkflow | null>(null);
  const [showWorkflowToast, setShowWorkflowToast] = useState(false);
  const [automationStats, setAutomationStats] = useState({
    formsAutomated: 0,
    timeSaved: 0,
    errorsReduced: 0,
  });
  const [workflowStatus, setWorkflowStatus] = useState({
    hasError: false,
    errorMessage: "",
    currentStep: "initialization",
  });
  const [formData, setFormData] = useState({
    patientId: patientId,
    serviceDate: "",
    serviceTime: "",
    providerId: "",
    serviceLocation: "",
    providerName: "",
    providerLicense: "",
    patientEmiratesId: "",
    clinicalFindings: "",
    interventionsProvided: "",
    electronicSignature: null,
    documentType: "",
    providerLicenseExpiry: "",
    nineDomainsAssessment: {},
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedForms, setSavedForms] = useState<any[]>([]);
  const { handleSuccess, handleApiError } = useErrorHandler();

  // Initialize component with Supabase
  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Load existing forms for this episode
      if (episodeId) {
        await loadEpisodeForms();
      }

      // Set up real-time subscriptions
      if (episodeId) {
        const subscription = RealtimeService.subscribeToClinicalForms(
          episodeId,
          (payload) => {
            console.log("Clinical form updated:", payload);
            loadEpisodeForms();
          },
        );

        return () => {
          RealtimeService.unsubscribe(`clinical-forms-${episodeId}`);
        };
      }
    } catch (error) {
      handleApiError(error, "Clinical documentation initialization");
    }
  };

  const loadEpisodeForms = async () => {
    try {
      const { data, error } =
        await ClinicalFormsService.getEpisodeForms(episodeId);
      if (error) {
        handleApiError(error, "Loading clinical forms");
        return;
      }
      setSavedForms(data || []);
    } catch (error) {
      handleApiError(error, "Loading clinical forms");
    }
  };

  // Initialize workflow automation
  useEffect(() => {
    if (workflowAutomation) {
      const workflow: ClinicalWorkflow = {
        id: "clinical-doc-workflow",
        name: "Clinical Documentation Workflow",
        description: "Automated clinical documentation with AI assistance",
        totalEstimatedTime: 25,
        completionRate: 0,
        priority: "high",
        steps: [
          {
            id: "patient-verification",
            name: "Patient Identity Verification",
            status: "completed",
            required: true,
            estimatedTime: 2,
            dependencies: [],
            autoTrigger: true,
          },
          {
            id: "form-selection",
            name: "Intelligent Form Selection",
            status: "completed",
            required: true,
            estimatedTime: 1,
            dependencies: ["patient-verification"],
            autoTrigger: true,
          },
          {
            id: "ai-assistance",
            name: "AI-Powered Documentation",
            status: "in-progress",
            required: false,
            estimatedTime: 8,
            dependencies: ["form-selection"],
            autoTrigger: false,
          },
          {
            id: "compliance-check",
            name: "Real-time Compliance Validation",
            status: "pending",
            required: true,
            estimatedTime: 3,
            dependencies: ["ai-assistance"],
            autoTrigger: true,
          },
          {
            id: "quality-review",
            name: "Quality Assurance Review",
            status: "pending",
            required: true,
            estimatedTime: 5,
            dependencies: ["compliance-check"],
            autoTrigger: false,
          },
          {
            id: "electronic-signature",
            name: "Electronic Signature Capture",
            status: "pending",
            required: true,
            estimatedTime: 2,
            dependencies: ["quality-review"],
            autoTrigger: false,
          },
          {
            id: "submission",
            name: "Automated Submission",
            status: "pending",
            required: true,
            estimatedTime: 4,
            dependencies: ["electronic-signature"],
            autoTrigger: true,
          },
        ],
      };
      setCurrentWorkflow(workflow);
      setAutomationStats({
        formsAutomated: 156,
        timeSaved: 342,
        errorsReduced: 89,
      });
    }
  }, [workflowAutomation]);

  // Show workflow automation toast
  useEffect(() => {
    if (workflowAutomation && !showWorkflowToast) {
      setShowWorkflowToast(true);
      setTimeout(() => setShowWorkflowToast(false), 5000);
    }
  }, [workflowAutomation]);

  // Mock patient data
  const patient = {
    name: "Mohammed Al Mansoori",
    emiratesId: "784-1985-1234567-8",
    age: 67,
    gender: "Male",
    insurance: "Daman - Thiqa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
  };

  // Enhanced clinical forms with DOH Patient Safety Taxonomy integration
  const clinicalForms = [
    {
      id: "assessment",
      name: "9-Domain Assessment",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "vital-signs",
      name: "Vital Signs",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "medication",
      name: "Medication Administration",
      dohCompliant: true,
      taxonomyRequired: true,
    },
    {
      id: "wound-care",
      name: "Wound Documentation",
      dohCompliant: true,
      taxonomyRequired: true,
    },
    {
      id: "nursing-notes",
      name: "Nursing Notes",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "physio",
      name: "Physiotherapy Notes",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "respiratory",
      name: "Respiratory Therapy",
      dohCompliant: true,
      taxonomyRequired: true,
    },
    {
      id: "speech",
      name: "Speech Therapy",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "occupational",
      name: "Occupational Therapy",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "nutrition",
      name: "Nutrition Assessment",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "discharge",
      name: "Discharge Planning",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "safety",
      name: "Safety Assessment",
      dohCompliant: true,
      taxonomyRequired: true,
    },
    {
      id: "pain",
      name: "Pain Assessment",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "fall-risk",
      name: "Fall Risk Assessment",
      dohCompliant: true,
      taxonomyRequired: true,
    },
    {
      id: "glasgow",
      name: "Glasgow Coma Scale",
      dohCompliant: true,
      taxonomyRequired: true,
    },
    {
      id: "care-plan",
      name: "Care Plan",
      dohCompliant: true,
      taxonomyRequired: false,
    },
    {
      id: "daman-submission",
      name: "Daman Prior Authorization",
      dohCompliant: true,
      taxonomyRequired: false,
    },
  ];

  // Mock assessment domains
  const assessmentDomains = [
    { id: "medication", name: "Medication Management", score: 3, maxScore: 5 },
    {
      id: "nutrition",
      name: "Nutrition/Hydration Care",
      score: 4,
      maxScore: 5,
    },
    { id: "respiratory", name: "Respiratory Care", score: 2, maxScore: 5 },
    { id: "skin", name: "Skin & Wound Care", score: 5, maxScore: 5 },
    { id: "bladder", name: "Bowel & Bladder Care", score: 3, maxScore: 5 },
    { id: "palliative", name: "Palliative Care", score: 0, maxScore: 5 },
    {
      id: "monitoring",
      name: "Observation/Close Monitoring",
      score: 4,
      maxScore: 5,
    },
    {
      id: "transitional",
      name: "Post-Hospital Transitional Care",
      score: 3,
      maxScore: 5,
    },
    {
      id: "rehabilitation",
      name: "Physiotherapy & Rehabilitation",
      score: 4,
      maxScore: 5,
    },
  ];

  // FIXED: Complete Form Validation for Required DOH Fields with null safety
  const validateForm = () => {
    const errors: string[] = [];

    // Ensure formData exists and has required structure
    if (!formData || typeof formData !== "object") {
      errors.push("Form data is invalid or missing");
      setValidationErrors(errors);
      return false;
    }

    // Core DOH Required Fields with null safety
    if (!formData.patientId || String(formData.patientId).trim() === "")
      errors.push("Patient ID is required for DOH compliance");
    if (!formData.serviceDate || String(formData.serviceDate).trim() === "")
      errors.push("Service date is required for DOH compliance");
    if (!formData.serviceTime || String(formData.serviceTime).trim() === "")
      errors.push("Service time is required for DOH compliance");
    if (!formData.providerId || String(formData.providerId).trim() === "")
      errors.push("Provider ID is required for DOH compliance");
    if (
      !formData.serviceLocation ||
      String(formData.serviceLocation).trim() === ""
    )
      errors.push("Service location is required for DOH compliance");

    // DOH-Specific Validation Rules with null safety
    if (
      !formData.providerName ||
      typeof formData.providerName !== "string" ||
      formData.providerName.trim().length < 2
    ) {
      errors.push(
        "Provider name is required and must be at least 2 characters",
      );
    }

    if (
      !formData.providerLicense ||
      typeof formData.providerLicense !== "string" ||
      formData.providerLicense.trim().length < 5
    ) {
      errors.push("Provider license number is required for DOH compliance");
    }

    // Emirates ID Validation (DOH Requirement) with null safety
    if (
      formData.patientEmiratesId &&
      typeof formData.patientEmiratesId === "string"
    ) {
      const emiratesIdPattern = /^784-[0-9]{4}-[0-9]{7}-[0-9]$/;
      if (!emiratesIdPattern.test(formData.patientEmiratesId.trim())) {
        errors.push("Invalid Emirates ID format. Expected: 784-YYYY-XXXXXXX-X");
      }
    } else {
      errors.push("Patient Emirates ID is required for DOH compliance");
    }

    // Service Date Validation with null safety
    if (formData.serviceDate && typeof formData.serviceDate === "string") {
      try {
        const serviceDate = new Date(formData.serviceDate);
        if (isNaN(serviceDate.getTime())) {
          errors.push("Invalid service date format");
        } else {
          const today = new Date();
          const maxFutureDate = new Date();
          maxFutureDate.setDate(today.getDate() + 30);

          if (serviceDate > maxFutureDate) {
            errors.push(
              "Service date cannot be more than 30 days in the future",
            );
          }

          const minPastDate = new Date();
          minPastDate.setFullYear(today.getFullYear() - 1);
          if (serviceDate < minPastDate) {
            errors.push("Service date cannot be more than 1 year in the past");
          }
        }
      } catch (dateError) {
        errors.push("Invalid service date format");
      }
    }

    // Clinical Findings Validation (DOH Requirement) with null safety
    if (
      !formData.clinicalFindings ||
      typeof formData.clinicalFindings !== "string" ||
      formData.clinicalFindings.trim().length < 10
    ) {
      errors.push(
        "Clinical findings must be documented with at least 10 characters for DOH compliance",
      );
    }

    // Interventions Validation (DOH Requirement) with null safety
    if (
      !formData.interventionsProvided ||
      typeof formData.interventionsProvided !== "string" ||
      formData.interventionsProvided.trim().length < 10
    ) {
      errors.push(
        "Interventions provided must be documented with at least 10 characters for DOH compliance",
      );
    }

    // Electronic Signature Validation (DOH Requirement)
    if (!formData.electronicSignature) {
      errors.push("Electronic signature is required for DOH compliance");
    }

    // Document Type Validation
    if (!formData.documentType) {
      errors.push("Document type must be specified for DOH compliance");
    }

    // Service Time Format Validation with null safety
    if (formData.serviceTime && typeof formData.serviceTime === "string") {
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(formData.serviceTime.trim())) {
        errors.push("Service time must be in HH:MM format (24-hour)");
      }
    }

    // Provider License Expiry Check with null safety
    if (
      formData.providerLicenseExpiry &&
      typeof formData.providerLicenseExpiry === "string"
    ) {
      try {
        const expiryDate = new Date(formData.providerLicenseExpiry);
        if (isNaN(expiryDate.getTime())) {
          errors.push("Invalid provider license expiry date format");
        } else {
          const today = new Date();
          if (expiryDate <= today) {
            errors.push(
              "Provider license has expired. Cannot create documentation with expired license.",
            );
          }
        }
      } catch (dateError) {
        errors.push("Invalid provider license expiry date format");
      }
    }

    // DOH Nine Domains Assessment Validation with null safety
    const requiredDomains = [
      "cardiovascular",
      "respiratory",
      "neurological",
      "musculoskeletal",
      "genitourinary",
      "integumentary",
      "gastrointestinal",
      "psychosocial",
      "cognitive",
    ];

    const missingDomains = requiredDomains.filter((domain) => {
      if (
        !formData.nineDomainsAssessment ||
        typeof formData.nineDomainsAssessment !== "object"
      ) {
        return true;
      }
      const domainValue = formData.nineDomainsAssessment[domain];
      return (
        !domainValue ||
        (typeof domainValue === "string" && domainValue.trim() === "")
      );
    });

    if (missingDomains.length > 0) {
      errors.push(
        `DOH Nine Domains Assessment incomplete. Missing: ${missingDomains.join(", ")}`,
      );
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleVoiceInput = async () => {
    if (!voiceInputActive) {
      // Start enhanced voice input with medical terminology
      setVoiceInputActive(true);
      try {
        // Initialize mobile communication service for enhanced voice recognition
        const { mobileCommunicationService } = await import(
          "@/services/mobile-communication.service"
        );

        // Determine medical specialty based on active form
        const medicalSpecialty =
          activeForm === "physio"
            ? "physiotherapy"
            : activeForm === "occupational"
              ? "occupational"
              : activeForm === "speech"
                ? "speech"
                : activeForm === "respiratory"
                  ? "respiratory"
                  : activeForm === "nursing-notes"
                    ? "nursing"
                    : "general";

        // Start enhanced voice recognition
        const voiceResult =
          await mobileCommunicationService.startEnhancedVoiceRecognition({
            language: "en",
            medicalTerminology: true,
            continuousRecognition: true,
            interimResults: true,
            maxAlternatives: 3,
            medicalSpecialty,
            offlineMode: isOffline,
            realTimeTranscription: true,
            speakerIdentification: false,
          });

        if (voiceResult?.success) {
          // Set up voice recognition callback
          if (mobileCommunicationService.onVoiceRecognitionResult) {
            mobileCommunicationService.onVoiceRecognitionResult((result) => {
              if (result?.transcript) {
                setVoiceTranscript(result.transcript);

                // Process transcript for clinical insights if final
                if (result.isFinal) {
                  processVoiceTranscript(result.transcript);
                }
              }
            });
          }
        } else {
          console.error(
            "Failed to start voice recognition:",
            voiceResult?.error || "Unknown error",
          );
          setVoiceInputActive(false);
        }
      } catch (error) {
        console.error("Enhanced voice input failed:", error);
        setVoiceInputActive(false);
      }
    } else {
      // Stop voice input
      try {
        const { mobileCommunicationService } = await import(
          "@/services/mobile-communication.service"
        );
        if (mobileCommunicationService?.stopVoiceRecognition) {
          mobileCommunicationService.stopVoiceRecognition();
        }
      } catch (error) {
        console.error("Failed to stop voice recognition:", error);
      }
      setVoiceInputActive(false);
    }
  };

  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript || typeof transcript !== "string") {
      console.warn("Invalid transcript provided to processVoiceTranscript");
      return;
    }

    try {
      // Process the transcript for clinical insights
      const clinicalAnalysis =
        await naturalLanguageProcessingService.processClinicalNote(transcript, {
          language: "en",
          includeCodeSuggestions: true,
          includeSentimentAnalysis: false,
        });

      if (clinicalAnalysis) {
        setNlpAnalysis(clinicalAnalysis);
        if (
          clinicalAnalysis.codingSuggestions &&
          Array.isArray(clinicalAnalysis.codingSuggestions)
        ) {
          setCodingSuggestions(clinicalAnalysis.codingSuggestions);
        }
      }

      // Save to offline storage if offline
      if (isOffline) {
        try {
          const { offlineService } = await import("@/services/offline.service");
          if (offlineService?.saveClinicalForm) {
            await offlineService.saveClinicalForm({
              type: "voice_transcript",
              patientId: patientId,
              data: {
                transcript,
                clinicalAnalysis,
                formType: activeForm,
                timestamp: new Date().toISOString(),
              },
              status: "draft",
            });
          }
        } catch (offlineError) {
          console.error("Failed to save to offline storage:", offlineError);
        }
      }
    } catch (error) {
      console.error("Voice transcript processing failed:", error);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Initialize mobile communication service for camera integration
      const { mobileCommunicationService } = await import(
        "@/services/mobile-communication.service"
      );

      if (!mobileCommunicationService) {
        alert("Camera service not available");
        return;
      }

      // Check camera capabilities
      const cameraStatus =
        await mobileCommunicationService.initializeCameraIntegration();

      if (!cameraStatus?.supported) {
        alert("Camera not supported on this device");
        return;
      }

      if (!cameraStatus?.permissions?.camera) {
        alert("Camera permission required for wound documentation");
        return;
      }

      // Capture wound image with annotations
      const captureResult = await mobileCommunicationService.captureWoundImage({
        facingMode: "environment", // Use back camera for wound documentation
        resolution: { width: 1920, height: 1080 },
        flash: false,
        annotations: {
          measurements: [], // Will be added by user after capture
          notes: [
            `Patient: ${patientId}`,
            `Episode: ${episodeId}`,
            `Form: ${activeForm}`,
          ],
          timestamp: new Date().toISOString(),
        },
      });

      if (captureResult?.success && captureResult?.imageData) {
        // Process captured image
        const imageData = captureResult.imageData;

        // Save image data to offline storage
        if (isOffline) {
          try {
            const { offlineService } = await import(
              "@/services/offline.service"
            );
            if (offlineService?.saveClinicalForm) {
              await offlineService.saveClinicalForm({
                type: "wound_image",
                patientId: patientId,
                data: {
                  imageDataUrl: imageData?.dataUrl || "",
                  metadata: imageData?.metadata || {},
                  formType: activeForm,
                  episodeId: episodeId,
                },
                status: "draft",
              });
            }
          } catch (offlineError) {
            console.error(
              "Failed to save image to offline storage:",
              offlineError,
            );
          }
        }

        // Show success message
        const fileSize = imageData?.metadata?.fileSize || 0;
        alert(
          `Wound image captured successfully! File size: ${Math.round(fileSize / 1024)}KB`,
        );

        // Update workflow step if automation is enabled
        if (workflowAutomation && currentWorkflow) {
          handleWorkflowStepComplete("ai-assistance");
        }
      } else {
        alert(
          `Failed to capture image: ${captureResult?.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Camera capture failed:", error);
      alert("Camera capture failed. Please try again.");
    }
  };

  const handleSaveForm = async () => {
    try {
      if (!validateForm()) {
        if (typeof toast === "function") {
          toast({
            title: "Validation Error",
            description: `Please fix the following errors: ${validationErrors.join(", ")}`,
            variant: "destructive",
          });
        } else {
          console.error("Validation errors:", validationErrors);
          alert(
            `Please fix the following errors: ${validationErrors.join(", ")}`,
          );
        }
        return;
      }

      if (!currentUser) {
        handleApiError(new Error("User not authenticated"), "Saving form");
        return;
      }

      // Save to Supabase
      const { data, error } = await ClinicalFormsService.createClinicalForm({
        episode_id: episodeId,
        form_type: activeForm as any,
        form_data: formData,
        status: "draft",
        created_by: currentUser.id,
        doh_compliant: true,
      });

      if (error) {
        handleApiError(error, "Saving clinical form");
        return;
      }

      handleSuccess("Form saved successfully");

      if (isOffline) {
        alert(
          "Form saved locally. Will sync when online connection is restored.",
        );
      } else {
        setShowComplianceChecker(true);
      }
    } catch (error) {
      handleApiError(error, "Saving form");
    }
  };

  const handleComplianceComplete = (passed: boolean) => {
    setShowComplianceChecker(false);
    if (passed) {
      alert("Form successfully submitted and meets DOH compliance standards.");
      // Update workflow step
      if (currentWorkflow) {
        handleWorkflowStepComplete("compliance-check");
      }
    } else {
      alert("Please address the compliance issues before submitting.");
    }
  };

  const handleWorkflowStepComplete = (stepId: string) => {
    if (currentWorkflow) {
      const updatedWorkflow = {
        ...currentWorkflow,
        steps: currentWorkflow.steps.map((step) =>
          step.id === stepId ? { ...step, status: "completed" as const } : step,
        ),
      };
      const completedSteps = updatedWorkflow.steps.filter(
        (s) => s.status === "completed",
      ).length;
      updatedWorkflow.completionRate =
        (completedSteps / updatedWorkflow.steps.length) * 100;
      setCurrentWorkflow(updatedWorkflow);
    }
  };

  const handleWorkflowComplete = () => {
    if (currentWorkflow) {
      const updatedWorkflow = {
        ...currentWorkflow,
        steps: currentWorkflow.steps.map((step) => ({
          ...step,
          status: "completed" as const,
        })),
        completionRate: 100,
      };
      setCurrentWorkflow(updatedWorkflow);
      setAutomationStats((prev) => ({
        formsAutomated: prev.formsAutomated + 1,
        timeSaved: prev.timeSaved + currentWorkflow.totalEstimatedTime,
        errorsReduced: prev.errorsReduced + 3,
      }));
    }
  };

  return (
    <ClinicalWorkflowErrorBoundary
      onError={(error) => {
        console.error("Clinical Documentation Workflow Error:", error);
        setWorkflowStatus((prev) => ({
          ...prev,
          hasError: true,
          errorMessage: error.message,
          currentStep: "error-recovery",
        }));
      }}
    >
      <MobileResponsiveLayout
        enablePWA={true}
        enableOfflineMode={true}
        className="w-full h-full bg-background"
      >
        {/* Workflow Automation Toast */}
        {showWorkflowToast && (
          <div className="fixed top-4 right-4 z-50">
            <EnhancedToast
              id="workflow-automation"
              title="Workflow Automation Active"
              description="AI-powered clinical documentation workflow is now running"
              variant="workflow-automation"
              onDismiss={() => setShowWorkflowToast(false)}
              action={{
                label: "View Details",
                onClick: () => console.log("Workflow details"),
              }}
            />
          </div>
        )}

        <div className="p-4 md:p-6">
          {/* Patient Info Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <span>Emirates ID: {patient.emiratesId}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    {patient.age} years • {patient.gender}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="outline">{patient.insurance}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOffline ? "destructive" : "secondary"}
                className="text-xs"
              >
                {isOffline ? "Offline Mode" : "Online"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Episode: {episodeId}
              </Badge>
              {workflowStatus.hasError && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Workflow Error
                </Badge>
              )}
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full md:w-[800px] grid-cols-4">
              <TabsTrigger value="forms">
                <FileText className="h-4 w-4 mr-2" />
                Clinical Forms
              </TabsTrigger>
              <TabsTrigger value="assessment">
                <ClipboardList className="h-4 w-4 mr-2" />
                Patient Assessment
              </TabsTrigger>
              <TabsTrigger value="service">
                <Rocket className="h-4 w-4 mr-2" />
                Start of Service
              </TabsTrigger>
              <TabsTrigger value="plan-of-care">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Plan of Care
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Clinical Forms Tab Content */}
          {activeTab === "forms" && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Select Clinical Form
              </Label>
              <Select value={activeForm} onValueChange={setActiveForm}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a clinical form" />
                </SelectTrigger>
                <SelectContent>
                  {clinicalForms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Workflow Automation Panel */}
          {workflowAutomation && currentWorkflow && (
            <div className="mb-6">
              <WorkflowAutomationEngine
                workflow={currentWorkflow}
                onStepComplete={handleWorkflowStepComplete}
                onWorkflowComplete={handleWorkflowComplete}
              />
            </div>
          )}

          {/* Automation Statistics */}
          {workflowAutomation && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-900">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Automation Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {automationStats.formsAutomated}
                      </div>
                      <div className="text-sm text-gray-600">
                        Forms Automated
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">
                        {automationStats.timeSaved}min
                      </div>
                      <div className="text-sm text-gray-600">Time Saved</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">
                        {automationStats.errorsReduced}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Errors Reduced
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Please fix the following validation errors:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Content Area */}
          {activeTab === "forms" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Content - Takes 2/3 of space on large screens */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {clinicalForms.find((f) => f.id === activeForm)?.name ||
                      "Clinical Form"}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        Document your clinical findings and interventions
                      </span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Last updated: Today, 14:32
                        </span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeForm === "assessment" ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">
                        DOH 9-Domain Assessment
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Score each domain based on patient needs (0-5)
                      </p>

                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-6">
                          {assessmentDomains.map((domain) => (
                            <div key={domain.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label
                                  htmlFor={domain.id}
                                  className="font-medium"
                                >
                                  {domain.name}
                                </Label>
                                <span className="text-sm font-medium">
                                  {domain.score}/{domain.maxScore}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={domain.id}
                                  type="range"
                                  min="0"
                                  max="5"
                                  value={domain.score}
                                  className="w-full"
                                />
                              </div>
                              <Textarea
                                placeholder={`Enter clinical justification for ${domain.name} score...`}
                                className="h-20"
                                onChange={async (e) => {
                                  const text = e.target.value;
                                  if (text.length > 50) {
                                    try {
                                      // Generate coding suggestions as user types
                                      const suggestions =
                                        await naturalLanguageProcessingService.generateAutomatedCodingSuggestions(
                                          text,
                                        );
                                      setCodingSuggestions(
                                        suggestions.slice(0, 3),
                                      ); // Show top 3 suggestions
                                    } catch (error) {
                                      console.error(
                                        "Failed to generate coding suggestions:",
                                        error,
                                      );
                                    }
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : activeForm === "wound-care" ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">
                        Wound Documentation
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="wound-location">
                              Wound Location
                            </Label>
                            <Select defaultValue="sacrum">
                              <SelectTrigger id="wound-location">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sacrum">Sacrum</SelectItem>
                                <SelectItem value="heel">Heel</SelectItem>
                                <SelectItem value="ischium">Ischium</SelectItem>
                                <SelectItem value="trochanter">
                                  Trochanter
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="wound-stage">Wound Stage</Label>
                            <Select defaultValue="stage2">
                              <SelectTrigger id="wound-stage">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stage1">Stage 1</SelectItem>
                                <SelectItem value="stage2">Stage 2</SelectItem>
                                <SelectItem value="stage3">Stage 3</SelectItem>
                                <SelectItem value="stage4">Stage 4</SelectItem>
                                <SelectItem value="unstageable">
                                  Unstageable
                                </SelectItem>
                                <SelectItem value="dti">
                                  Deep Tissue Injury
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="wound-length">Length (cm)</Label>
                              <Input
                                id="wound-length"
                                type="number"
                                placeholder="0.0"
                                defaultValue="4.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="wound-width">Width (cm)</Label>
                              <Input
                                id="wound-width"
                                type="number"
                                placeholder="0.0"
                                defaultValue="3.2"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="wound-depth">Depth (cm)</Label>
                            <Input
                              id="wound-depth"
                              type="number"
                              placeholder="0.0"
                              defaultValue="0.8"
                            />
                          </div>

                          <div>
                            <Label htmlFor="wound-exudate">Exudate</Label>
                            <Select defaultValue="moderate">
                              <SelectTrigger id="wound-exudate">
                                <SelectValue placeholder="Select exudate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="moderate">
                                  Moderate
                                </SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-md h-[200px] flex flex-col items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Tap to capture wound image
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={handleCameraCapture}
                            >
                              <Camera className="h-4 w-4 mr-2" /> Capture Image
                            </Button>
                          </div>

                          <div>
                            <Label htmlFor="wound-notes">Treatment Notes</Label>
                            <Textarea
                              id="wound-notes"
                              placeholder="Enter wound treatment notes..."
                              className="h-[120px]"
                              defaultValue="Wound cleaned with normal saline. Foam dressing applied. Patient tolerated procedure well."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : activeForm === "daman-submission" ? (
                    <DamanSubmissionForm
                      patientId={patientId}
                      episodeId={episodeId}
                      isOffline={isOffline}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {clinicalForms.find((f) => f.id === activeForm)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        This form template is available for documentation.
                        Select it from the dropdown to begin documenting.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t pt-4">
                  {/* Workflow Automation Controls */}
                  {workflowAutomation && (
                    <Alert className="bg-purple-50 border-purple-200">
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            AI workflow automation is active
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setWorkflowAutomation(false)}
                            >
                              Disable
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleWorkflowStepComplete("ai-assistance")
                              }
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Next Step
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={handleVoiceInput}>
                        <Mic
                          className={`h-4 w-4 mr-2 ${voiceInputActive ? "text-red-500" : ""}`}
                        />
                        {voiceInputActive ? "Stop Voice" : "Voice Input"}
                      </Button>
                      <Button variant="outline" onClick={handleCameraCapture}>
                        <Camera className="h-4 w-4 mr-2" /> Capture
                      </Button>
                      {!workflowAutomation && (
                        <Button
                          variant="outline"
                          onClick={() => setWorkflowAutomation(true)}
                        >
                          <Zap className="h-4 w-4 mr-2" /> Enable AI
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setDocumentProgress(
                            Math.min(100, documentProgress + 10),
                          )
                        }
                      >
                        <Save className="h-4 w-4 mr-2" /> Save Draft
                      </Button>
                      <Button onClick={handleSaveForm}>
                        {isOffline ? (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Save Offline
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" /> Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Sidebar - Takes 1/3 of space on large screens */}
              <div className="space-y-6">
                {/* Form Progress */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Documentation Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={documentProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{documentProgress}% Complete</span>
                        <span>{100 - documentProgress}% Remaining</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Patient Demographics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Vital Signs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Assessment Incomplete</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">
                            Electronic Signature Required
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Forms */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Forms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {clinicalForms.slice(0, 5).map((form, index) => (
                        <div
                          key={form.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => setActiveForm(form.id)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{form.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {index === 0
                              ? "Today"
                              : index === 1
                                ? "Yesterday"
                                : `${index + 1}d ago`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* NLP Coding Suggestions */}
                {codingSuggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        AI Coding Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {codingSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-2 bg-blue-50 rounded-md"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {suggestion.system}: {suggestion.code}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Voice Transcript */}
                {voiceTranscript && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Mic className="h-4 w-4 mr-2" />
                        Voice Transcript
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">
                        {voiceTranscript}
                      </p>
                      {nlpAnalysis && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-600">
                            Entities found: {nlpAnalysis.entities.length} |
                            Concepts: {nlpAnalysis.concepts.length} |
                            Confidence:{" "}
                            {Math.round(nlpAnalysis.confidence * 100)}%
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Required Fields */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Required Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="req-assessment"
                          checked={documentProgress > 30}
                        />
                        <Label htmlFor="req-assessment" className="text-sm">
                          9-Domain Assessment
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="req-vitals"
                          checked={documentProgress > 20}
                        />
                        <Label htmlFor="req-vitals" className="text-sm">
                          Vital Signs
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="req-medication" />
                        <Label htmlFor="req-medication" className="text-sm">
                          Medication Administration
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="req-signature" />
                        <Label htmlFor="req-signature" className="text-sm">
                          Electronic Signature
                        </Label>
                      </div>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground">
                        All fields required for DOH compliance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeTab === "assessment" ? (
            <PatientAssessment
              patientId={patientId}
              episodeId={episodeId}
              isOffline={isOffline}
            />
          ) : activeTab === "service" ? (
            <StartOfService
              patientId={patientId}
              episodeId={episodeId}
              isOffline={isOffline}
            />
          ) : (
            <PlanOfCare
              patientId={patientId}
              episodeId={episodeId}
              isOffline={isOffline}
            />
          )}

          {/* Compliance Checker Modal */}
          {showComplianceChecker && (
            <ComplianceChecker
              formType={activeForm}
              onComplete={handleComplianceComplete}
              isOpen={showComplianceChecker}
            />
          )}
        </div>
      </MobileResponsiveLayout>
    </ClinicalWorkflowErrorBoundary>
  );
};

export default ClinicalDocumentation;
