import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ClinicalFormsService,
  RealtimeService,
  supabase,
  PatientService,
  EpisodeService,
} from "@/api/supabase.api";
import { HomecareAPI } from "@/api/homecare.api";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
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
  Monitor,
  Smartphone,
  Tablet,
  WifiOff,
  Shield,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  UserPlus,
  Database,
  Lock,
  Unlock,
  Bell,
  MessageSquare,
  Globe,
  Wifi,
  CloudSync,
  HardDrive,
  Award,
  BookOpen,
  Clipboard,
  Stethoscope,
  Pill,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  LineChart,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  Info,
  Calendar,
  User,
  Heart,
  Activity,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import ComplianceChecker from "./ComplianceChecker";
import PatientAssessment from "./PatientAssessment";
import StartOfService from "./StartOfService";
import PlanOfCare from "./PlanOfCare";
import DamanSubmissionForm from "./DamanSubmissionForm";
import RoundsManagement from "./RoundsManagement";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";
import { clinicalWorkflowAutomationService } from "@/services/clinical-workflow-automation.service";
import { patientSafetyMonitoringService } from "@/services/patient-safety-monitoring.service";
import { healthcareRulesService } from "@/services/healthcare-rules.service";
import { medicationManagementService } from "@/services/medication-management.service";
import { carePlanAutomationService } from "@/services/care-plan-automation.service";
import { MobileResponsiveLayout } from "@/components/ui/mobile-responsive";
import { EnhancedToast } from "@/components/ui/enhanced-toast";
import { toast } from "@/hooks/useToast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import VoiceInput from "@/components/ui/voice-input";

interface ClinicalDocumentationProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
  onFormSubmit?: (formData: any) => void;
  onPatientUpdate?: (patientData: any) => void;
  enableAdvancedFeatures?: boolean;
  roleBasedAccess?: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSubmit: boolean;
    canViewAnalytics: boolean;
    canManageWorkflows: boolean;
  };
  integrationSettings?: {
    malaffiEnabled: boolean;
    damanEnabled: boolean;
    dohComplianceEnabled: boolean;
    realTimeSyncEnabled: boolean;
  };
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
  onFormSubmit,
  onPatientUpdate,
  enableAdvancedFeatures = true,
  roleBasedAccess = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canSubmit: true,
    canViewAnalytics: true,
    canManageWorkflows: true,
  },
  integrationSettings = {
    malaffiEnabled: true,
    damanEnabled: true,
    dohComplianceEnabled: true,
    realTimeSyncEnabled: true,
  },
}: ClinicalDocumentationProps) => {
  const [activeTab, setActiveTab] = useState("forms"); // State for top-level tabs
  const [activeForm, setActiveForm] = useState("assessment");
  const [mobileOptimized, setMobileOptimized] = useState(false);
  const [touchEnabled, setTouchEnabled] = useState(false);
  const [gestureSupport, setGestureSupport] = useState(false);
  const [cameraIntegrated, setCameraIntegrated] = useState(false);
  const [voiceIntegrated, setVoiceIntegrated] = useState(false);
  const [offlineFormsEnabled, setOfflineFormsEnabled] = useState(false);
  const [realTimeValidation, setRealTimeValidation] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [collaborativeEditing, setCollaborativeEditing] = useState(false);
  const [enhancedSecurity, setEnhancedSecurity] = useState(true);
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [documentProgress, setDocumentProgress] = useState(35);
  const [showComplianceChecker, setShowComplianceChecker] = useState(false);
  const [nlpAnalysis, setNlpAnalysis] = useState(null);
  const [codingSuggestions, setCodingSuggestions] = useState([]);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [workflowAutomation, setWorkflowAutomation] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] =
    useState<ClinicalWorkflow | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [episodeData, setEpisodeData] = useState<any>(null);
  const [clinicalHistory, setClinicalHistory] = useState<any[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState({
    malaffi: "connected",
    daman: "connected",
    doh: "compliant",
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [formTemplates, setFormTemplates] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [recentForms, setRecentForms] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    interactionLatency: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
  });
  const [accessibilityScore, setAccessibilityScore] = useState(95);
  const [userExperienceMetrics, setUserExperienceMetrics] = useState({
    taskCompletionRate: 94,
    errorRate: 2.1,
    satisfactionScore: 4.7,
    usabilityScore: 92,
  });

  // Healthcare Integration States
  const [fhirData, setFhirData] = useState<any>(null);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [medicationData, setMedicationData] = useState<any>(null);
  const [hospitalAdmissions, setHospitalAdmissions] = useState<any[]>([]);
  const [telehealthSessions, setTelehealthSessions] = useState<any[]>([]);
  const [healthcareIntegrationStatus, setHealthcareIntegrationStatus] =
    useState({
      fhir: { enabled: false, status: "disconnected", lastSync: null },
      laboratory: { enabled: false, status: "disconnected", lastSync: null },
      pharmacy: { enabled: false, status: "disconnected", lastSync: null },
      hospital: { enabled: false, status: "disconnected", lastSync: null },
      telehealth: { enabled: false, status: "disconnected", lastSync: null },
    });
  const [isLoadingHealthcareData, setIsLoadingHealthcareData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeSync, setRealTimeSync] = useState(true);
  const [networkStatus, setNetworkStatus] = useState({ online: true });
  const [clinicalDecisionSupport, setClinicalDecisionSupport] = useState<any[]>(
    [],
  );
  const [patientSafetyAlerts, setPatientSafetyAlerts] = useState<any[]>([]);
  const [medicationAlerts, setMedicationAlerts] = useState<any[]>([]);
  const [carePlanRecommendations, setCarePlanRecommendations] = useState<any[]>(
    [],
  );
  const [workflowProgress, setWorkflowProgress] = useState({
    currentStep: "initialization",
    completedSteps: 0,
    totalSteps: 7,
    estimatedTimeRemaining: 15,
  });

  // Advanced Clinical Documentation Features
  const [clinicalTemplates, setClinicalTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [smartValidationEnabled, setSmartValidationEnabled] = useState(true);
  const [automatedCodingEnabled, setAutomatedCodingEnabled] = useState(true);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [icdCptSuggestions, setIcdCptSuggestions] = useState<any[]>([]);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [medicalVocabularyMode, setMedicalVocabularyMode] = useState(true);
  const [realTimeValidationResults, setRealTimeValidationResults] = useState<
    any[]
  >([]);
  const [documentationHistory, setDocumentationHistory] = useState<any[]>([]);

  // Enhanced Voice Recognition with Medical Terminology
  const {
    text: voiceText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error: voiceError,
  } = useSpeechRecognition({
    language: "en-US",
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
  });
  const [showWorkflowToast, setShowWorkflowToast] = useState(false);
  const [automationStats, setAutomationStats] = useState({
    formsAutomated: 0,
    timeSaved: 0,
    errorsReduced: 0,
  });
  const [systemValidation, setSystemValidation] = useState({
    medicalRecordsIntegrity: 0,
    formsIntegration: 0,
    workflowRobustness: 0,
    complianceAlignment: 0,
    patientJourneyTracking: 0,
    bedsideVisitIntegration: 0,
    issues: [],
    recommendations: [],
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

  // Enhanced initialization with patient data loading and integration setup
  useEffect(() => {
    const startTime = performance.now();

    initializeComponent();
    initializeMobileFeatures();
    initializePerformanceTracking();
    initializeAccessibilityEnhancements();
    validateMedicalRecordSystem();
    loadPatientData();
    setupIntegrations();
    loadFormTemplates();
    initializeCollaboration();
    initializeAdvancedClinicalFeatures();
    loadHealthcareIntegrationData();

    const initTime = performance.now() - startTime;
    setPerformanceMetrics((prev) => ({ ...prev, renderTime: initTime }));
  }, [patientId, episodeId]);

  // Initialize Advanced Clinical Documentation Features
  const initializeAdvancedClinicalFeatures = useCallback(async () => {
    try {
      // Load clinical templates
      await loadClinicalTemplates();

      // Initialize audit trail
      await initializeAuditTrail();

      // Setup real-time validation
      if (smartValidationEnabled) {
        setupRealTimeValidation();
      }

      // Initialize automated coding
      if (automatedCodingEnabled) {
        setupAutomatedCoding();
      }

      console.log("Advanced clinical documentation features initialized");
    } catch (error) {
      console.error("Failed to initialize advanced clinical features:", error);
    }
  }, [smartValidationEnabled, automatedCodingEnabled]);

  // Load patient data from multiple sources
  const loadPatientData = useCallback(async () => {
    if (!patientId) return;

    try {
      setIsLoading(true);

      // Load patient from Supabase
      const { data: patient, error: patientError } =
        await PatientService.getPatient(patientId);
      if (patientError) throw patientError;

      setPatientData(patient);
      onPatientUpdate?.(patient);

      // Load episode data if episodeId provided
      if (episodeId) {
        const { data: episode, error: episodeError } =
          await EpisodeService.getEpisode(episodeId);
        if (episodeError) throw episodeError;
        setEpisodeData(episode);
      }

      // Load clinical history
      const { data: episodes, error: episodesError } =
        await PatientService.getPatientEpisodes(patientId);
      if (episodesError) throw episodesError;
      setClinicalHistory(episodes || []);

      // Load recent forms
      if (episodeId) {
        const { data: forms, error: formsError } =
          await ClinicalFormsService.getEpisodeForms(episodeId);
        if (formsError) throw formsError;
        setRecentForms(forms || []);
      }
    } catch (error) {
      handleApiError(error, "Loading patient data");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, episodeId, onPatientUpdate, handleApiError]);

  // Setup integrations based on settings
  const setupIntegrations = useCallback(async () => {
    if (!enableAdvancedFeatures) return;

    try {
      // Check Malaffi integration status
      if (integrationSettings.malaffiEnabled) {
        // This would typically check connection status
        setIntegrationStatus((prev) => ({ ...prev, malaffi: "connected" }));
      }

      // Check Daman integration status
      if (integrationSettings.damanEnabled) {
        setIntegrationStatus((prev) => ({ ...prev, daman: "connected" }));
      }

      // Check DOH compliance status
      if (integrationSettings.dohComplianceEnabled) {
        setIntegrationStatus((prev) => ({ ...prev, doh: "compliant" }));
      }
    } catch (error) {
      console.error("Integration setup failed:", error);
    }
  }, [enableAdvancedFeatures, integrationSettings]);

  // Load form templates
  const loadFormTemplates = useCallback(async () => {
    try {
      // This would typically load from a templates service
      const templates = [
        {
          id: "quick-assessment",
          name: "Quick Assessment",
          category: "assessment",
          estimatedTime: 5,
          fields: ["vital_signs", "pain_level", "mobility"],
        },
        {
          id: "medication-review",
          name: "Medication Review",
          category: "medication",
          estimatedTime: 10,
          fields: ["current_medications", "adherence", "side_effects"],
        },
      ];
      setFormTemplates(templates);
    } catch (error) {
      console.error("Failed to load form templates:", error);
    }
  }, []);

  // Load Clinical Templates Library
  const loadClinicalTemplates = useCallback(async () => {
    try {
      const templates = [
        {
          id: "diabetes-assessment",
          name: "Diabetes Management Assessment",
          category: "chronic-conditions",
          description: "Comprehensive diabetes care assessment template",
          fields: {
            blood_glucose: {
              type: "number",
              required: true,
              validation: { min: 70, max: 400 },
            },
            hba1c: {
              type: "number",
              required: true,
              validation: { min: 4, max: 15 },
            },
            medication_adherence: {
              type: "select",
              options: ["Excellent", "Good", "Fair", "Poor"],
            },
            foot_examination: { type: "textarea", medicalTerms: true },
            dietary_compliance: {
              type: "select",
              options: ["Compliant", "Partially Compliant", "Non-Compliant"],
            },
          },
          icdCodes: ["E11.9", "E11.65", "E11.40"],
          cptCodes: ["99213", "99214"],
        },
        {
          id: "wound-assessment",
          name: "Wound Care Assessment",
          category: "wound-care",
          description: "Detailed wound assessment and care planning",
          fields: {
            wound_location: { type: "text", required: true },
            wound_size: {
              type: "object",
              fields: { length: "number", width: "number", depth: "number" },
            },
            wound_stage: {
              type: "select",
              options: [
                "Stage 1",
                "Stage 2",
                "Stage 3",
                "Stage 4",
                "Unstageable",
                "DTI",
              ],
            },
            drainage: {
              type: "select",
              options: ["None", "Minimal", "Moderate", "Heavy"],
            },
            wound_bed: { type: "textarea", medicalTerms: true },
            treatment_plan: { type: "textarea", required: true },
          },
          icdCodes: ["L89.90", "L89.91", "L89.92"],
          cptCodes: ["97597", "97598", "11042"],
        },
        {
          id: "cardiac-assessment",
          name: "Cardiac Assessment",
          category: "cardiovascular",
          description: "Comprehensive cardiac evaluation template",
          fields: {
            heart_rate: {
              type: "number",
              required: true,
              validation: { min: 40, max: 200 },
            },
            blood_pressure: {
              type: "object",
              fields: { systolic: "number", diastolic: "number" },
            },
            rhythm: {
              type: "select",
              options: ["Regular", "Irregular", "Atrial Fibrillation", "Other"],
            },
            chest_pain: { type: "textarea", medicalTerms: true },
            edema: {
              type: "select",
              options: ["None", "Trace", "1+", "2+", "3+", "4+"],
            },
            activity_tolerance: { type: "textarea", required: true },
          },
          icdCodes: ["I25.9", "I50.9", "I48.91"],
          cptCodes: ["93000", "93005", "99213"],
        },
        {
          id: "respiratory-assessment",
          name: "Respiratory Assessment",
          category: "respiratory",
          description: "Comprehensive respiratory evaluation",
          fields: {
            respiratory_rate: {
              type: "number",
              required: true,
              validation: { min: 8, max: 40 },
            },
            oxygen_saturation: {
              type: "number",
              required: true,
              validation: { min: 70, max: 100 },
            },
            breath_sounds: { type: "textarea", medicalTerms: true },
            dyspnea: {
              type: "select",
              options: ["None", "Mild", "Moderate", "Severe"],
            },
            cough: { type: "textarea", medicalTerms: true },
            oxygen_therapy: { type: "textarea" },
          },
          icdCodes: ["J44.1", "J18.9", "R06.02"],
          cptCodes: ["94010", "94060", "99213"],
        },
      ];
      setClinicalTemplates(templates);
    } catch (error) {
      console.error("Failed to load clinical templates:", error);
    }
  }, []);

  // Initialize Audit Trail
  const initializeAuditTrail = useCallback(async () => {
    try {
      const initialAuditEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: "session_started",
        user: currentUser?.email || "anonymous",
        patientId,
        episodeId,
        details: "Clinical documentation session initiated",
        ipAddress: "masked",
        userAgent: navigator.userAgent,
      };
      setAuditTrail([initialAuditEntry]);
    } catch (error) {
      console.error("Failed to initialize audit trail:", error);
    }
  }, [currentUser, patientId, episodeId]);

  // Setup Real-time Validation
  const setupRealTimeValidation = useCallback(() => {
    // This would set up real-time validation listeners
    console.log("Real-time validation enabled");
  }, []);

  // Setup Automated Coding
  const setupAutomatedCoding = useCallback(() => {
    // This would initialize the automated ICD/CPT coding system
    console.log("Automated coding system enabled");
  }, []);

  // Initialize collaboration features
  const initializeCollaboration = useCallback(async () => {
    if (!enableAdvancedFeatures || !integrationSettings.realTimeSyncEnabled)
      return;

    try {
      // Set up real-time collaboration
      if (episodeId) {
        const subscription = RealtimeService.subscribeToPresence(
          `episode-${episodeId}`,
          {
            user_id: currentUser?.id || "anonymous",
            full_name:
              currentUser?.user_metadata?.full_name || "Anonymous User",
            role: currentUser?.user_metadata?.role || "viewer",
          },
          (payload) => {
            setCollaborators(Object.values(payload.presences || {}));
          },
        );

        return () => {
          RealtimeService.unsubscribe(`presence-episode-${episodeId}`);
        };
      }
    } catch (error) {
      console.error("Failed to initialize collaboration:", error);
    }
  }, [
    enableAdvancedFeatures,
    integrationSettings.realTimeSyncEnabled,
    episodeId,
    currentUser,
  ]);

  const initializePerformanceTracking = () => {
    // Track interaction latency
    let interactionStart = 0;

    document.addEventListener("click", () => {
      interactionStart = performance.now();
    });

    // Monitor after state updates
    setTimeout(() => {
      const latency = performance.now() - interactionStart;
      if (latency > 0) {
        setPerformanceMetrics((prev) => ({
          ...prev,
          interactionLatency: latency,
        }));
      }
    }, 0);

    // Monitor memory usage
    if ((performance as any).memory) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        setPerformanceMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        }));
      };

      updateMemoryUsage();
      setInterval(updateMemoryUsage, 10000);
    }
  };

  const initializeAccessibilityEnhancements = () => {
    // Enhanced keyboard navigation for clinical forms
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        // Ensure proper tab order in clinical forms
        const clinicalForm = document.querySelector(".clinical-form-container");
        if (clinicalForm) {
          const focusableElements = clinicalForm.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );

          // Add visual focus indicators
          focusableElements.forEach((element) => {
            element.addEventListener("focus", () => {
              element.classList.add("enhanced-focus");
            });
            element.addEventListener("blur", () => {
              element.classList.remove("enhanced-focus");
            });
          });
        }
      }

      // Quick save with Ctrl+S
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSaveForm();
        (window as any).announceToScreenReader?.("Form saved successfully");
      }
    };

    document.addEventListener("keydown", handleKeyboardNavigation);

    // Voice commands for clinical documentation
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();

        if (command.includes("save form")) {
          handleSaveForm();
          (window as any).announceToScreenReader?.(
            "Voice command executed: Form saved",
          );
        } else if (command.includes("start voice input")) {
          handleVoiceInput();
        } else if (command.includes("take photo")) {
          handleCameraCapture();
        }
      };

      // Enable voice commands with Alt+V
      document.addEventListener("keydown", (event) => {
        if (event.altKey && event.key === "v") {
          recognition.start();
          (window as any).announceToScreenReader?.(
            "Voice command mode activated",
          );
        }
      });
    }

    // Real-time accessibility scoring
    const checkAccessibility = () => {
      let score = 100;

      // Check for missing alt text
      const images = document.querySelectorAll("img:not([alt])");
      score -= images.length * 5;

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      if (headings.length === 0) score -= 10;

      // Check for form labels
      const inputs = document.querySelectorAll(
        "input:not([aria-label]):not([aria-labelledby])",
      );
      const unlabeledInputs = Array.from(inputs).filter((input) => {
        const id = input.getAttribute("id");
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      score -= unlabeledInputs.length * 3;

      // Check color contrast (simplified)
      const elements = document.querySelectorAll("*");
      let lowContrastCount = 0;
      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (
          color &&
          backgroundColor &&
          color !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          // Simplified contrast check
          if (color === backgroundColor) {
            lowContrastCount++;
          }
        }
      });
      score -= Math.min(lowContrastCount * 2, 20);

      setAccessibilityScore(Math.max(0, score));
    };

    checkAccessibility();
    setInterval(checkAccessibility, 30000);
  };

  const initializeMobileFeatures = async () => {
    try {
      // Detect mobile device
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setMobileOptimized(isMobile);

      // Initialize touch support
      setTouchEnabled("ontouchstart" in window);

      // Initialize gesture support
      setGestureSupport("GestureEvent" in window);

      // Initialize camera integration
      const cameraStatus =
        await mobileCommunicationService.initializeCameraIntegration();
      setCameraIntegrated(cameraStatus.supported);

      // Initialize voice integration
      const voiceSupported =
        mobileCommunicationService.isVoiceRecognitionSupported();
      setVoiceIntegrated(voiceSupported);

      // Initialize offline forms
      await offlineService.init();
      setOfflineFormsEnabled(true);

      // Initialize collaborative editing if online
      if (navigator.onLine) {
        setCollaborativeEditing(true);
      }

      console.log("Mobile features initialized:", {
        mobile: isMobile,
        touch: touchEnabled,
        camera: cameraStatus.supported,
        voice: voiceSupported,
        offline: true,
      });
    } catch (error) {
      console.error("Failed to initialize mobile features:", error);
    }
  };

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

  // Enhanced patient data with real-time updates
  const patient = useMemo(
    () =>
      patientData || {
        name: "Mohammed Al Mansoori",
        emiratesId: "784-1985-1234567-8",
        age: 67,
        gender: "Male",
        insurance: "Daman - Thiqa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
        status: "Active",
        riskLevel: "Medium",
        lastVisit: "2024-01-15",
        nextAppointment: "2024-01-22",
        primaryDiagnosis: "Diabetes Type 2, Hypertension",
        allergies: ["Penicillin"],
        medications: ["Metformin 500mg", "Lisinopril 10mg"],
        emergencyContact: {
          name: "Fatima Al Mansoori",
          relationship: "Wife",
          phone: "+971-50-234-5678",
        },
      },
    [patientData],
  );

  // Enhanced mobile-first clinical forms with DOH Patient Safety Taxonomy integration
  const clinicalForms = useMemo(
    () =>
      formTemplates.length > 0
        ? formTemplates
        : [
            {
              id: "assessment",
              name: "DOH 9-Domain Assessment",
              dohCompliant: true,
              taxonomyRequired: false,
              mobileOptimized: true,
              offlineCapable: true,
              voiceEnabled: true,
              touchOptimized: true,
              estimatedTime: 15,
              priority: "critical",
              category: "assessment",
            },
            {
              id: "vital-signs",
              name: "Vital Signs Monitoring",
              dohCompliant: true,
              taxonomyRequired: false,
              mobileOptimized: true,
              offlineCapable: true,
              voiceEnabled: true,
              touchOptimized: true,
              estimatedTime: 5,
              priority: "high",
              category: "monitoring",
            },
            {
              id: "medication",
              name: "Medication Administration Record",
              dohCompliant: true,
              taxonomyRequired: true,
              mobileOptimized: true,
              offlineCapable: true,
              voiceEnabled: true,
              touchOptimized: true,
              estimatedTime: 8,
              priority: "critical",
              category: "medication",
              requiresSignature: true,
            },
            {
              id: "wound-care",
              name: "Wound Assessment & Documentation",
              dohCompliant: true,
              taxonomyRequired: true,
              mobileOptimized: true,
              offlineCapable: true,
              voiceEnabled: true,
              touchOptimized: true,
              cameraRequired: true,
              estimatedTime: 12,
              priority: "high",
              category: "wound_care",
              requiresPhotos: true,
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
          ],
    [formTemplates],
  );

  // Enhanced DOH 9-Domain Assessment with real-time validation
  const [assessmentDomains, setAssessmentDomains] = useState([
    {
      id: "medication",
      name: "Medication Management",
      score: formData.nineDomainsAssessment?.medication?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.medication?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "nutrition",
      name: "Nutrition/Hydration Care",
      score: formData.nineDomainsAssessment?.nutrition?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.nutrition?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "respiratory",
      name: "Respiratory Care",
      score: formData.nineDomainsAssessment?.respiratory?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.respiratory?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "skin",
      name: "Skin & Wound Care",
      score: formData.nineDomainsAssessment?.skin?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.skin?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "bladder",
      name: "Bowel & Bladder Care",
      score: formData.nineDomainsAssessment?.bladder?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.bladder?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "palliative",
      name: "Palliative Care",
      score: formData.nineDomainsAssessment?.palliative?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.palliative?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "monitoring",
      name: "Observation/Close Monitoring",
      score: formData.nineDomainsAssessment?.monitoring?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.monitoring?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "transitional",
      name: "Post-Hospital Transitional Care",
      score: formData.nineDomainsAssessment?.transitional?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.transitional?.justification || "",
      requiredForDOH: true,
    },
    {
      id: "rehabilitation",
      name: "Physiotherapy & Rehabilitation",
      score: formData.nineDomainsAssessment?.rehabilitation?.score || 0,
      maxScore: 5,
      validated: false,
      clinicalJustification:
        formData.nineDomainsAssessment?.rehabilitation?.justification || "",
      requiredForDOH: true,
    },
  ]);

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
    if (isListening) {
      stopListening();
      setVoiceInputActive(false);
    } else {
      startListening();
      setVoiceInputActive(true);

      // Log audit trail
      addAuditTrailEntry(
        "voice_input_started",
        "Voice input session initiated",
      );
    }
  };

  // Enhanced Voice Transcription Handler
  const handleVoiceTranscription = useCallback(
    async (text: string, metadata: any) => {
      try {
        // Process medical terminology
        const processedText = await processMedicalVoiceInput(text);

        // Update form data with voice input
        setVoiceTranscript(processedText);

        // Generate automated coding suggestions
        if (automatedCodingEnabled) {
          const codingSuggestions =
            await generateAutomatedCoding(processedText);
          setIcdCptSuggestions(codingSuggestions);
        }

        // Perform real-time validation
        if (smartValidationEnabled) {
          const validationResults =
            await performRealTimeValidation(processedText);
          setRealTimeValidationResults(validationResults);
        }

        // Log audit trail
        addAuditTrailEntry(
          "voice_transcription_completed",
          `Voice input processed: ${text.length} characters`,
          {
            confidence: metadata.confidence,
            medicalTermsDetected: metadata.medicalTermsDetected?.length || 0,
          },
        );
      } catch (error) {
        console.error("Voice transcription processing failed:", error);
      }
    },
    [automatedCodingEnabled, smartValidationEnabled],
  );

  // Process Medical Voice Input
  const processMedicalVoiceInput = async (text: string): Promise<string> => {
    try {
      // Enhanced medical terminology processing
      let processedText = text;

      // Medical abbreviation expansion
      const medicalAbbreviations = {
        bp: "blood pressure",
        hr: "heart rate",
        rr: "respiratory rate",
        temp: "temperature",
        "o2 sat": "oxygen saturation",
        sob: "shortness of breath",
        cp: "chest pain",
        doe: "dyspnea on exertion",
        pnd: "paroxysmal nocturnal dyspnea",
        jvd: "jugular venous distension",
      };

      Object.entries(medicalAbbreviations).forEach(([abbr, expansion]) => {
        const regex = new RegExp(`\\b${abbr}\\b`, "gi");
        processedText = processedText.replace(regex, expansion);
      });

      // Medical term standardization
      const medicalTermCorrections = {
        "high blood pressure": "hypertension",
        "low blood pressure": "hypotension",
        "fast heart rate": "tachycardia",
        "slow heart rate": "bradycardia",
        "short of breath": "dyspnea",
        "difficulty breathing": "dyspnea",
        "chest pain": "chest pain",
        "heart attack": "myocardial infarction",
        stroke: "cerebrovascular accident",
      };

      Object.entries(medicalTermCorrections).forEach(([term, correction]) => {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        processedText = processedText.replace(regex, correction);
      });

      return processedText;
    } catch (error) {
      console.error("Medical voice input processing failed:", error);
      return text;
    }
  };

  // Generate Automated ICD/CPT Coding
  const generateAutomatedCoding = async (text: string): Promise<any[]> => {
    try {
      const suggestions = [];

      // ICD-10 suggestions based on text analysis
      const icdMappings = {
        hypertension: [
          {
            code: "I10",
            description: "Essential hypertension",
            confidence: 0.9,
          },
        ],
        diabetes: [
          {
            code: "E11.9",
            description: "Type 2 diabetes mellitus without complications",
            confidence: 0.85,
          },
        ],
        "chest pain": [
          {
            code: "R06.02",
            description: "Shortness of breath",
            confidence: 0.8,
          },
        ],
        dyspnea: [
          {
            code: "R06.00",
            description: "Dyspnea, unspecified",
            confidence: 0.9,
          },
        ],
        wound: [
          {
            code: "L89.90",
            description:
              "Pressure ulcer of unspecified site, unspecified stage",
            confidence: 0.75,
          },
        ],
      };

      // CPT suggestions based on procedures mentioned
      const cptMappings = {
        assessment: [
          {
            code: "99213",
            description: "Office visit, established patient, low complexity",
            confidence: 0.8,
          },
        ],
        "wound care": [
          {
            code: "97597",
            description: "Debridement, open wound",
            confidence: 0.85,
          },
        ],
        "medication review": [
          {
            code: "99605",
            description: "Medication therapy management",
            confidence: 0.9,
          },
        ],
      };

      const lowerText = text.toLowerCase();

      // Check for ICD matches
      Object.entries(icdMappings).forEach(([term, codes]) => {
        if (lowerText.includes(term)) {
          suggestions.push(
            ...codes.map((code) => ({ ...code, type: "ICD-10" })),
          );
        }
      });

      // Check for CPT matches
      Object.entries(cptMappings).forEach(([term, codes]) => {
        if (lowerText.includes(term)) {
          suggestions.push(...codes.map((code) => ({ ...code, type: "CPT" })));
        }
      });

      return suggestions;
    } catch (error) {
      console.error("Automated coding generation failed:", error);
      return [];
    }
  };

  // Perform Real-time Validation
  const performRealTimeValidation = async (text: string): Promise<any[]> => {
    try {
      const validationResults = [];

      // Check for required medical information
      const requiredElements = {
        "vital signs":
          /\b(blood pressure|heart rate|temperature|respiratory rate|oxygen saturation)\b/i,
        assessment: /\b(assessment|diagnosis|condition|findings)\b/i,
        plan: /\b(plan|treatment|intervention|medication)\b/i,
      };

      Object.entries(requiredElements).forEach(([element, regex]) => {
        if (!regex.test(text)) {
          validationResults.push({
            type: "missing_element",
            severity: "warning",
            message: `Consider including ${element} in documentation`,
            suggestion: `Add ${element} details to improve documentation completeness`,
          });
        }
      });

      // Check for medical terminology accuracy
      const medicalTerms =
        text.match(/\b[a-z]+tion\b|\b[a-z]+sis\b|\b[a-z]+emia\b/gi) || [];
      medicalTerms.forEach((term) => {
        // This would typically check against a medical dictionary
        validationResults.push({
          type: "terminology_check",
          severity: "info",
          message: `Medical term detected: ${term}`,
          suggestion: "Verify spelling and context of medical terminology",
        });
      });

      return validationResults;
    } catch (error) {
      console.error("Real-time validation failed:", error);
      return [];
    }
  };

  // Add Audit Trail Entry
  const addAuditTrailEntry = useCallback(
    (action: string, details: string, metadata?: any) => {
      const entry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        user: currentUser?.email || "anonymous",
        patientId,
        episodeId,
        details,
        metadata,
        ipAddress: "masked",
        userAgent: navigator.userAgent.substring(0, 100),
      };

      setAuditTrail((prev) => [...prev, entry]);
    },
    [currentUser, patientId, episodeId],
  );

  // Apply Clinical Template
  const applyClinicalTemplate = useCallback(
    (templateId: string) => {
      const template = clinicalTemplates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(templateId);

        // Pre-populate form with template structure
        const templateData = {};
        Object.entries(template.fields).forEach(
          ([fieldName, fieldConfig]: [string, any]) => {
            if (fieldConfig.type === "select" && fieldConfig.options) {
              templateData[fieldName] = fieldConfig.options[0];
            } else if (fieldConfig.type === "number") {
              templateData[fieldName] = fieldConfig.validation?.min || 0;
            } else {
              templateData[fieldName] = "";
            }
          },
        );

        setFormData((prev) => ({ ...prev, ...templateData }));

        // Set coding suggestions from template
        const codingSuggestions = [];
        if (template.icdCodes) {
          codingSuggestions.push(
            ...template.icdCodes.map((code) => ({
              code,
              type: "ICD-10",
              confidence: 0.95,
              source: "template",
            })),
          );
        }
        if (template.cptCodes) {
          codingSuggestions.push(
            ...template.cptCodes.map((code) => ({
              code,
              type: "CPT",
              confidence: 0.95,
              source: "template",
            })),
          );
        }
        setIcdCptSuggestions(codingSuggestions);

        // Log audit trail
        addAuditTrailEntry(
          "template_applied",
          `Applied clinical template: ${template.name}`,
          {
            templateId,
            templateName: template.name,
            category: template.category,
          },
        );
      }
    },
    [clinicalTemplates, addAuditTrailEntry],
  );

  // Smart Form Validation
  const performSmartValidation = useCallback(
    async (fieldName: string, value: any) => {
      if (!smartValidationEnabled) return;

      try {
        const validationResults = [];

        // Get template validation rules
        const template = clinicalTemplates.find(
          (t) => t.id === selectedTemplate,
        );
        if (template && template.fields[fieldName]) {
          const fieldConfig = template.fields[fieldName];

          // Numeric validation
          if (fieldConfig.type === "number" && fieldConfig.validation) {
            const numValue = parseFloat(value);
            if (
              fieldConfig.validation.min &&
              numValue < fieldConfig.validation.min
            ) {
              validationResults.push({
                field: fieldName,
                type: "range_error",
                severity: "error",
                message: `Value must be at least ${fieldConfig.validation.min}`,
              });
            }
            if (
              fieldConfig.validation.max &&
              numValue > fieldConfig.validation.max
            ) {
              validationResults.push({
                field: fieldName,
                type: "range_error",
                severity: "error",
                message: `Value must not exceed ${fieldConfig.validation.max}`,
              });
            }
          }

          // Required field validation
          if (
            fieldConfig.required &&
            (!value || value.toString().trim() === "")
          ) {
            validationResults.push({
              field: fieldName,
              type: "required_field",
              severity: "error",
              message: `${fieldName} is required`,
            });
          }

          // Medical terminology validation
          if (fieldConfig.medicalTerms && typeof value === "string") {
            const medicalTermValidation =
              await validateMedicalTerminology(value);
            validationResults.push(...medicalTermValidation);
          }
        }

        // Update real-time validation results
        setRealTimeValidationResults((prev) => {
          const filtered = prev.filter((result) => result.field !== fieldName);
          return [...filtered, ...validationResults];
        });
      } catch (error) {
        console.error("Smart validation failed:", error);
      }
    },
    [smartValidationEnabled, selectedTemplate, clinicalTemplates],
  );

  // Validate Medical Terminology
  const validateMedicalTerminology = async (text: string): Promise<any[]> => {
    const results = [];

    // Check for common medical term misspellings
    const commonMisspellings = {
      diabetis: "diabetes",
      hypertention: "hypertension",
      pnemonia: "pneumonia",
      asma: "asthma",
      arthritus: "arthritis",
    };

    Object.entries(commonMisspellings).forEach(([misspelling, correction]) => {
      if (text.toLowerCase().includes(misspelling)) {
        results.push({
          type: "spelling_suggestion",
          severity: "warning",
          message: `Did you mean "${correction}" instead of "${misspelling}"?`,
          suggestion: correction,
        });
      }
    });

    return results;
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

  const handleSaveForm = async (isDraft = true) => {
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

      // Enhanced form data with metadata
      const enhancedFormData = {
        ...formData,
        metadata: {
          version: "2.0",
          integrations: {
            malaffi: integrationSettings.malaffiEnabled,
            daman: integrationSettings.damanEnabled,
            doh: integrationSettings.dohComplianceEnabled,
          },
          aiInsights: aiInsights,
          collaborators: collaborators.map((c) => c.user_id),
          deviceInfo: {
            mobile: mobileOptimized,
            offline: isOffline,
            voiceUsed: voiceInputActive,
            cameraUsed: cameraIntegrated,
          },
        },
      };

      // Save to Supabase
      const { data, error } = await ClinicalFormsService.createClinicalForm({
        episode_id: episodeId,
        form_type: activeForm as any,
        form_data: enhancedFormData,
        status: isDraft ? "draft" : "submitted",
        created_by: currentUser.id,
        doh_compliant: true,
      });

      if (error) {
        handleApiError(error, "Saving clinical form");
        return;
      }

      // Trigger callback if provided
      onFormSubmit?.(data);

      // Update recent forms
      setRecentForms((prev) => [data, ...prev.slice(0, 9)]);

      handleSuccess(
        isDraft ? "Form saved as draft" : "Form submitted successfully",
      );

      if (isOffline) {
        alert(
          "Form saved locally. Will sync when online connection is restored.",
        );
      } else if (!isDraft) {
        setShowComplianceChecker(true);
      }

      // Update document progress
      setDocumentProgress(isDraft ? Math.min(documentProgress + 10, 90) : 100);
    } catch (error) {
      handleApiError(error, "Saving form");
    }
  };

  // Enhanced form submission with compliance checking
  const handleSubmitForm = async () => {
    await handleSaveForm(false);
  };

  // Quick actions for common tasks
  const handleQuickAction = useCallback(async (actionId: string) => {
    switch (actionId) {
      case "vital-signs":
        setActiveForm("vital-signs");
        setActiveTab("forms");
        break;
      case "medication-review":
        setActiveForm("medication");
        setActiveTab("forms");
        break;
      case "pain-assessment":
        setActiveForm("pain");
        setActiveTab("forms");
        break;
      case "discharge-planning":
        setActiveForm("discharge");
        setActiveTab("forms");
        break;
      default:
        console.log("Unknown quick action:", actionId);
    }
  }, []);

  // Search functionality for forms and data
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) return;

      try {
        // This would typically search through forms, patient data, etc.
        const searchResults = recentForms.filter(
          (form) =>
            form.form_type.toLowerCase().includes(query.toLowerCase()) ||
            JSON.stringify(form.form_data)
              .toLowerCase()
              .includes(query.toLowerCase()),
        );

        // Update UI with search results
        console.log("Search results:", searchResults);
      } catch (error) {
        console.error("Search failed:", error);
      }
    },
    [recentForms],
  );

  // Bulk actions for multiple forms
  const handleBulkAction = useCallback(
    async (action: string) => {
      if (selectedForms.length === 0) return;

      try {
        switch (action) {
          case "export":
            // Export selected forms
            console.log("Exporting forms:", selectedForms);
            break;
          case "delete":
            // Delete selected forms
            console.log("Deleting forms:", selectedForms);
            break;
          case "archive":
            // Archive selected forms
            console.log("Archiving forms:", selectedForms);
            break;
          default:
            console.log("Unknown bulk action:", action);
        }
      } catch (error) {
        handleApiError(error, `Bulk ${action}`);
      }
    },
    [selectedForms, handleApiError],
  );

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

  /**
   * Comprehensive Medical Record System Validation
   * Validates robustness and integration of all components
   */
  const validateMedicalRecordSystem = async () => {
    try {
      const validation = {
        medicalRecordsIntegrity: 0,
        formsIntegration: 0,
        workflowRobustness: 0,
        complianceAlignment: 0,
        patientJourneyTracking: 0,
        bedsideVisitIntegration: 0,
        issues: [],
        recommendations: [],
      };

      // 1. Medical Records Integrity Check
      const recordsIntegrity = await validateMedicalRecordsIntegrity();
      validation.medicalRecordsIntegrity = recordsIntegrity.score;
      validation.issues.push(...recordsIntegrity.issues);
      validation.recommendations.push(...recordsIntegrity.recommendations);

      // 2. Forms Integration Validation
      const formsIntegration = await validateFormsIntegration();
      validation.formsIntegration = formsIntegration.score;
      validation.issues.push(...formsIntegration.issues);
      validation.recommendations.push(...formsIntegration.recommendations);

      // 3. Workflow Robustness Assessment
      const workflowRobustness = await validateWorkflowRobustness();
      validation.workflowRobustness = workflowRobustness.score;
      validation.issues.push(...workflowRobustness.issues);
      validation.recommendations.push(...workflowRobustness.recommendations);

      // 4. Compliance Alignment Check
      const complianceAlignment = await validateComplianceAlignment();
      validation.complianceAlignment = complianceAlignment.score;
      validation.issues.push(...complianceAlignment.issues);
      validation.recommendations.push(...complianceAlignment.recommendations);

      // 5. Patient Journey Tracking Validation
      const patientJourney = await validatePatientJourneyTracking();
      validation.patientJourneyTracking = patientJourney.score;
      validation.issues.push(...patientJourney.issues);
      validation.recommendations.push(...patientJourney.recommendations);

      // 6. Bedside Visit Integration Check
      const bedsideVisits = await validateBedsideVisitIntegration();
      validation.bedsideVisitIntegration = bedsideVisits.score;
      validation.issues.push(...bedsideVisits.issues);
      validation.recommendations.push(...bedsideVisits.recommendations);

      setSystemValidation(validation);

      // Log validation results
      console.log("🏥 Medical Record System Validation Results:", {
        overallScore: Math.round(
          (validation.medicalRecordsIntegrity +
            validation.formsIntegration +
            validation.workflowRobustness +
            validation.complianceAlignment +
            validation.patientJourneyTracking +
            validation.bedsideVisitIntegration) /
            6,
        ),
        breakdown: {
          medicalRecordsIntegrity: validation.medicalRecordsIntegrity,
          formsIntegration: validation.formsIntegration,
          workflowRobustness: validation.workflowRobustness,
          complianceAlignment: validation.complianceAlignment,
          patientJourneyTracking: validation.patientJourneyTracking,
          bedsideVisitIntegration: validation.bedsideVisitIntegration,
        },
        totalIssues: validation.issues.length,
        criticalIssues: validation.issues.filter(
          (i) => i.severity === "critical",
        ).length,
        recommendations: validation.recommendations.length,
      });

      return validation;
    } catch (error) {
      console.error("❌ Medical Record System Validation Failed:", error);
      return null;
    }
  };

  /**
   * Validate Medical Records Data Integrity
   */
  const validateMedicalRecordsIntegrity = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check patient data consistency
      if (!patientId || patientId === "P12345") {
        issues.push({
          type: "data_integrity",
          severity: "high",
          message:
            "Patient ID is using default/mock value - real patient data integration missing",
          component: "PatientData",
        });
        score -= 20;
        recommendations.push(
          "Integrate with real patient database and Emirates ID verification system",
        );
      }

      // Check episode data completeness
      if (!episodeId || episodeId === "EP789") {
        issues.push({
          type: "data_integrity",
          severity: "high",
          message:
            "Episode ID is using default/mock value - real episode management missing",
          component: "EpisodeManagement",
        });
        score -= 20;
        recommendations.push(
          "Implement proper episode lifecycle management with unique identifiers",
        );
      }

      // Check form data validation
      if (!formData.patientEmiratesId || formData.patientEmiratesId === "") {
        issues.push({
          type: "data_integrity",
          severity: "critical",
          message:
            "Emirates ID integration missing - DOH compliance requirement not met",
          component: "EmiratesIDVerification",
        });
        score -= 25;
        recommendations.push(
          "Implement Emirates ID verification service integration",
        );
      }

      // Check electronic signature implementation
      if (!formData.electronicSignature) {
        issues.push({
          type: "data_integrity",
          severity: "critical",
          message: "Electronic signature system not properly integrated",
          component: "ElectronicSignature",
        });
        score -= 15;
        recommendations.push(
          "Implement secure electronic signature capture and validation",
        );
      }

      // Check audit trail completeness
      const auditTrailExists = await checkAuditTrailIntegration();
      if (!auditTrailExists) {
        issues.push({
          type: "data_integrity",
          severity: "high",
          message:
            "Audit trail system not properly integrated for medical records",
          component: "AuditTrail",
        });
        score -= 10;
        recommendations.push(
          "Implement comprehensive audit logging for all medical record changes",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Medical records integrity validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Medical records integrity validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix validation system errors"],
      };
    }
  };

  /**
   * Validate Forms Integration and Interoperability
   */
  const validateFormsIntegration = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check clinical forms completeness
      const requiredForms = [
        "assessment",
        "vital-signs",
        "medication",
        "wound-care",
        "nursing-notes",
        "physio",
        "respiratory",
        "speech",
        "occupational",
        "nutrition",
        "discharge",
        "safety",
        "pain",
        "fall-risk",
        "glasgow",
        "care-plan",
        "daman-submission",
      ];

      const availableForms = clinicalForms.map((f) => f.id);
      const missingForms = requiredForms.filter(
        (f) => !availableForms.includes(f),
      );

      if (missingForms.length > 0) {
        issues.push({
          type: "forms_integration",
          severity: "medium",
          message: `Missing clinical forms: ${missingForms.join(", ")}`,
          component: "ClinicalForms",
        });
        score -= missingForms.length * 3;
        recommendations.push(
          "Implement all required clinical forms for comprehensive care documentation",
        );
      }

      // Check DOH compliance integration
      const nonCompliantForms = clinicalForms.filter((f) => !f.dohCompliant);
      if (nonCompliantForms.length > 0) {
        issues.push({
          type: "forms_integration",
          severity: "critical",
          message: `${nonCompliantForms.length} forms are not DOH compliant`,
          component: "DOHCompliance",
        });
        score -= nonCompliantForms.length * 5;
        recommendations.push(
          "Ensure all clinical forms meet DOH compliance standards",
        );
      }

      // Check mobile optimization
      const nonMobileForms = clinicalForms.filter((f) => !f.mobileOptimized);
      if (nonMobileForms.length > 0) {
        issues.push({
          type: "forms_integration",
          severity: "medium",
          message: `${nonMobileForms.length} forms are not mobile-optimized`,
          component: "MobileOptimization",
        });
        score -= nonMobileForms.length * 2;
        recommendations.push(
          "Optimize all forms for mobile devices and touch interfaces",
        );
      }

      // Check offline capability
      const nonOfflineForms = clinicalForms.filter((f) => !f.offlineCapable);
      if (nonOfflineForms.length > 0) {
        issues.push({
          type: "forms_integration",
          severity: "high",
          message: `${nonOfflineForms.length} forms lack offline capability`,
          component: "OfflineCapability",
        });
        score -= nonOfflineForms.length * 3;
        recommendations.push(
          "Enable offline functionality for all critical clinical forms",
        );
      }

      // Check voice integration
      const nonVoiceForms = clinicalForms.filter((f) => !f.voiceEnabled);
      if (nonVoiceForms.length > 0) {
        issues.push({
          type: "forms_integration",
          severity: "low",
          message: `${nonVoiceForms.length} forms lack voice input capability`,
          component: "VoiceIntegration",
        });
        score -= nonVoiceForms.length * 1;
        recommendations.push(
          "Implement voice input for improved clinical documentation efficiency",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Forms integration validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Forms integration validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix forms integration validation system"],
      };
    }
  };

  /**
   * Validate Workflow Automation Robustness
   */
  const validateWorkflowRobustness = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check workflow automation service integration
      if (!workflowAutomation || !currentWorkflow) {
        issues.push({
          type: "workflow_robustness",
          severity: "high",
          message: "Workflow automation system not properly initialized",
          component: "WorkflowAutomation",
        });
        score -= 25;
        recommendations.push(
          "Initialize and configure workflow automation service",
        );
      }

      // Check workflow step completion tracking
      if (currentWorkflow) {
        const incompleteSteps = currentWorkflow.steps.filter(
          (s) => s.status === "pending",
        );
        if (incompleteSteps.length > currentWorkflow.steps.length * 0.7) {
          issues.push({
            type: "workflow_robustness",
            severity: "medium",
            message:
              "High number of incomplete workflow steps indicates poor automation",
            component: "WorkflowExecution",
          });
          score -= 15;
          recommendations.push(
            "Improve workflow automation to reduce manual intervention",
          );
        }
      }

      // Check error handling in workflows
      if (workflowStatus.hasError) {
        issues.push({
          type: "workflow_robustness",
          severity: "high",
          message: `Workflow error detected: ${workflowStatus.errorMessage}`,
          component: "WorkflowErrorHandling",
        });
        score -= 20;
        recommendations.push(
          "Implement robust error handling and recovery mechanisms",
        );
      }

      // Check real-time collaboration
      if (!collaborativeEditing) {
        issues.push({
          type: "workflow_robustness",
          severity: "medium",
          message: "Real-time collaboration not enabled for clinical workflows",
          component: "Collaboration",
        });
        score -= 10;
        recommendations.push(
          "Enable real-time collaboration for care team coordination",
        );
      }

      // Check workflow performance metrics
      if (performanceMetrics.renderTime > 2000) {
        issues.push({
          type: "workflow_robustness",
          severity: "medium",
          message: "Workflow rendering performance is below optimal (>2s)",
          component: "Performance",
        });
        score -= 10;
        recommendations.push(
          "Optimize workflow rendering performance for better user experience",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Workflow robustness validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Workflow robustness validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix workflow validation system"],
      };
    }
  };

  /**
   * Validate Regulatory Compliance Alignment
   */
  const validateComplianceAlignment = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check DOH compliance integration
      if (!showComplianceChecker) {
        issues.push({
          type: "compliance_alignment",
          severity: "critical",
          message: "DOH compliance checker not integrated into workflow",
          component: "DOHCompliance",
        });
        score -= 30;
        recommendations.push(
          "Integrate DOH compliance checker into all clinical documentation workflows",
        );
      }

      // Check validation errors handling
      if (validationErrors.length > 0) {
        issues.push({
          type: "compliance_alignment",
          severity: "high",
          message: `${validationErrors.length} validation errors detected in current session`,
          component: "ValidationErrors",
        });
        score -= validationErrors.length * 5;
        recommendations.push(
          "Address all validation errors to ensure compliance",
        );
      }

      // Check enhanced security measures
      if (!enhancedSecurity) {
        issues.push({
          type: "compliance_alignment",
          severity: "high",
          message: "Enhanced security measures not enabled",
          component: "Security",
        });
        score -= 20;
        recommendations.push(
          "Enable enhanced security features for patient data protection",
        );
      }

      // Check real-time validation
      if (!realTimeValidation) {
        issues.push({
          type: "compliance_alignment",
          severity: "medium",
          message: "Real-time validation not enabled",
          component: "RealTimeValidation",
        });
        score -= 15;
        recommendations.push(
          "Enable real-time validation to prevent compliance issues",
        );
      }

      // Check accessibility compliance
      if (accessibilityScore < 90) {
        issues.push({
          type: "compliance_alignment",
          severity: "medium",
          message: `Accessibility score (${accessibilityScore}%) below recommended threshold`,
          component: "Accessibility",
        });
        score -= 90 - accessibilityScore;
        recommendations.push(
          "Improve accessibility features to meet compliance standards",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Compliance alignment validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Compliance alignment validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix compliance validation system"],
      };
    }
  };

  /**
   * Validate Patient Journey Tracking Integration
   */
  const validatePatientJourneyTracking = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check episode tracking completeness
      if (
        !episodeData ||
        !episodeData.events ||
        episodeData.events.length === 0
      ) {
        issues.push({
          type: "patient_journey",
          severity: "critical",
          message: "Patient journey events not properly tracked",
          component: "EpisodeTracking",
        });
        score -= 40;
        recommendations.push(
          "Implement comprehensive patient journey event tracking",
        );
      }

      // Check care team integration
      if (!episodeData?.careTeam || episodeData.careTeam.length === 0) {
        issues.push({
          type: "patient_journey",
          severity: "high",
          message: "Care team information not integrated into patient journey",
          component: "CareTeamIntegration",
        });
        score -= 25;
        recommendations.push(
          "Integrate care team information into patient journey tracking",
        );
      }

      // Check goals and outcomes tracking
      if (!episodeData?.goals || episodeData.goals.length === 0) {
        issues.push({
          type: "patient_journey",
          severity: "high",
          message: "Patient care goals not tracked in journey",
          component: "GoalsTracking",
        });
        score -= 20;
        recommendations.push(
          "Implement care goals tracking and progress monitoring",
        );
      }

      // Check timeline visualization
      const timelineEvents =
        episodeData?.events?.filter((e) => e.date && e.title) || [];
      if (timelineEvents.length < 3) {
        issues.push({
          type: "patient_journey",
          severity: "medium",
          message:
            "Insufficient timeline events for comprehensive journey tracking",
          component: "TimelineVisualization",
        });
        score -= 15;
        recommendations.push(
          "Enhance timeline visualization with more detailed event tracking",
        );
      }

      // Check real-time updates
      if (!realTimeSync) {
        issues.push({
          type: "patient_journey",
          severity: "medium",
          message:
            "Real-time synchronization not enabled for patient journey updates",
          component: "RealTimeSync",
        });
        score -= 10;
        recommendations.push(
          "Enable real-time synchronization for live patient journey updates",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Patient journey validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Patient journey validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix patient journey validation system"],
      };
    }
  };

  /**
   * Validate Bedside Visit Integration (Nurses, Therapists, Doctors)
   */
  const validateBedsideVisitIntegration = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check visit types coverage
      const visitEvents =
        episodeData?.events?.filter(
          (e) =>
            e.type === "visit" ||
            e.type === "therapy_session" ||
            e.type === "assessment",
        ) || [];

      if (visitEvents.length === 0) {
        issues.push({
          type: "bedside_visits",
          severity: "critical",
          message: "No bedside visits recorded in patient journey",
          component: "VisitTracking",
        });
        score -= 40;
        recommendations.push(
          "Implement comprehensive bedside visit tracking for all care providers",
        );
      }

      // Check clinician assignment
      const visitsWithoutClinician = visitEvents.filter(
        (e) => !e.clinician || !e.clinicianId,
      );
      if (visitsWithoutClinician.length > 0) {
        issues.push({
          type: "bedside_visits",
          severity: "high",
          message: `${visitsWithoutClinician.length} visits lack proper clinician assignment`,
          component: "ClinicianAssignment",
        });
        score -= visitsWithoutClinician.length * 10;
        recommendations.push(
          "Ensure all bedside visits have proper clinician identification and assignment",
        );
      }

      // Check visit documentation completeness
      const incompleteVisits = visitEvents.filter(
        (e) => !e.documentationComplete,
      );
      if (incompleteVisits.length > 0) {
        issues.push({
          type: "bedside_visits",
          severity: "high",
          message: `${incompleteVisits.length} visits have incomplete documentation`,
          component: "VisitDocumentation",
        });
        score -= incompleteVisits.length * 8;
        recommendations.push(
          "Complete documentation for all bedside visits to ensure continuity of care",
        );
      }

      // Check multi-disciplinary team representation
      const clinicianTypes = new Set(
        visitEvents.map((e) => {
          if (e.clinician?.toLowerCase().includes("nurse")) return "nurse";
          if (
            e.clinician?.toLowerCase().includes("doctor") ||
            e.clinician?.toLowerCase().includes("dr.")
          )
            return "doctor";
          if (
            e.clinician?.toLowerCase().includes("pt ") ||
            e.clinician?.toLowerCase().includes("physiotherapist")
          )
            return "physiotherapist";
          if (
            e.clinician?.toLowerCase().includes("ot ") ||
            e.clinician?.toLowerCase().includes("occupational")
          )
            return "occupational_therapist";
          if (e.clinician?.toLowerCase().includes("speech"))
            return "speech_therapist";
          return "other";
        }),
      );

      const expectedTypes = ["nurse", "doctor", "physiotherapist"];
      const missingTypes = expectedTypes.filter(
        (type) => !clinicianTypes.has(type),
      );

      if (missingTypes.length > 0) {
        issues.push({
          type: "bedside_visits",
          severity: "medium",
          message: `Missing bedside visits from: ${missingTypes.join(", ")}`,
          component: "MultidisciplinaryTeam",
        });
        score -= missingTypes.length * 5;
        recommendations.push(
          "Ensure comprehensive multi-disciplinary team involvement in bedside care",
        );
      }

      // Check visit outcomes tracking
      const visitsWithoutOutcomes = visitEvents.filter(
        (e) => !e.outcomes && !e.vitalSigns && !e.medications,
      );
      if (visitsWithoutOutcomes.length > 0) {
        issues.push({
          type: "bedside_visits",
          severity: "medium",
          message: `${visitsWithoutOutcomes.length} visits lack documented outcomes or interventions`,
          component: "OutcomesTracking",
        });
        score -= visitsWithoutOutcomes.length * 5;
        recommendations.push(
          "Document outcomes and interventions for all bedside visits",
        );
      }

      // Check mobile integration for bedside visits
      if (!mobileOptimized || !touchEnabled) {
        issues.push({
          type: "bedside_visits",
          severity: "medium",
          message:
            "Mobile optimization not enabled for bedside visit documentation",
          component: "MobileIntegration",
        });
        score -= 15;
        recommendations.push(
          "Enable mobile optimization for bedside visit documentation at point of care",
        );
      }

      // Check voice integration for bedside documentation
      if (!voiceIntegrated) {
        issues.push({
          type: "bedside_visits",
          severity: "low",
          message: "Voice input not available for bedside visit documentation",
          component: "VoiceIntegration",
        });
        score -= 5;
        recommendations.push(
          "Implement voice input capability for efficient bedside documentation",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Bedside visit integration validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Bedside visit integration validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix bedside visit validation system"],
      };
    }
  };

  /**
   * Check if audit trail system is properly integrated
   */
  const checkAuditTrailIntegration = async () => {
    try {
      // Check if audit logging is available
      const auditCapable =
        typeof window !== "undefined" &&
        "localStorage" in window &&
        "sessionStorage" in window;

      // Check if user actions are being tracked
      const userActionsTracked = currentUser && currentUser.id;

      // Check if form changes are being logged
      const formChangesLogged = formData && Object.keys(formData).length > 0;

      return auditCapable && userActionsTracked && formChangesLogged;
    } catch (error) {
      console.error("Audit trail check failed:", error);
      return false;
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
          {/* Enhanced Patient Info Header with Integration Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>
                    {patient.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {integrationSettings.realTimeSyncEnabled && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  {patient.riskLevel && (
                    <Badge
                      variant={
                        patient.riskLevel === "High"
                          ? "destructive"
                          : patient.riskLevel === "Medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {patient.riskLevel} Risk
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <span>Emirates ID: {patient.emiratesId}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    {patient.age} years • {patient.gender}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="outline">{patient.insurance}</Badge>
                </div>
                {patient.primaryDiagnosis && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Stethoscope className="h-3 w-3" />
                    <span>{patient.primaryDiagnosis}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
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

              {/* Integration Status Indicators */}
              {enableAdvancedFeatures && (
                <div className="flex items-center gap-2">
                  {integrationSettings.malaffiEnabled && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={
                              integrationStatus.malaffi === "connected"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            <Database className="h-3 w-3 mr-1" />
                            Malaffi
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Malaffi EMR: {integrationStatus.malaffi}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {integrationSettings.damanEnabled && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={
                              integrationStatus.daman === "connected"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Daman
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Daman Integration: {integrationStatus.daman}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {integrationSettings.dohComplianceEnabled && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={
                              integrationStatus.doh === "compliant"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            DOH
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          DOH Compliance: {integrationStatus.doh}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}

              {/* Collaborators Indicator */}
              {collaborators.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 3).map((collaborator, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs border-2 border-white">
                              {collaborator.full_name?.charAt(0) || "U"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {collaborator.full_name} ({collaborator.role})
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {collaborators.length > 3 && (
                      <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs border-2 border-white">
                        +{collaborators.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Search and Quick Actions Bar */}
          {enableAdvancedFeatures && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search forms, patient data, or clinical notes..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  {selectedForms.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("export")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export ({selectedForms.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Clinical Templates Quick Access */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyClinicalTemplate("diabetes-assessment")}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Diabetes Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyClinicalTemplate("wound-assessment")}
                  className="text-xs"
                >
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Wound Care Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyClinicalTemplate("cardiac-assessment")}
                  className="text-xs"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Cardiac Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    applyClinicalTemplate("respiratory-assessment")
                  }
                  className="text-xs"
                >
                  <Wind className="h-3 w-3 mr-1" />
                  Respiratory Template
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("vital-signs")}
                  className="text-xs"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Vital Signs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("medication-review")}
                  className="text-xs"
                >
                  <Pill className="h-3 w-3 mr-1" />
                  Medications
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("pain-assessment")}
                  className="text-xs"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Pain Assessment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("discharge-planning")}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Discharge
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full md:w-[1400px] grid-cols-8">
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
              <TabsTrigger value="rounds">
                <Stethoscope className="h-4 w-4 mr-2" />
                Bedside Rounds
              </TabsTrigger>
              <TabsTrigger value="healthcare-integration">
                <Database className="h-4 w-4 mr-2" />
                Healthcare Data
              </TabsTrigger>
              <TabsTrigger value="telehealth">
                <Globe className="h-4 w-4 mr-2" />
                Telehealth
              </TabsTrigger>
              {enableAdvancedFeatures && (
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              )}
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

          {/* System Validation Results */}
          {systemValidation.issues.length > 0 && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-900">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Medical Record System Issues Detected
                  </CardTitle>
                  <CardDescription>
                    {systemValidation.issues.length} issues found affecting
                    system robustness and integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">
                        {
                          systemValidation.issues.filter(
                            (i) => i.severity === "critical",
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Critical Issues
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {
                          systemValidation.issues.filter(
                            (i) => i.severity === "high",
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">High Priority</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-yellow-600">
                        {systemValidation.recommendations.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Recommendations
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {systemValidation.issues.slice(0, 5).map((issue, index) => (
                      <Alert
                        key={index}
                        className={`${
                          issue.severity === "critical"
                            ? "border-red-200 bg-red-50"
                            : issue.severity === "high"
                              ? "border-orange-200 bg-orange-50"
                              : "border-yellow-200 bg-yellow-50"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <strong>{issue.component}:</strong>{" "}
                              {issue.message}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                issue.severity === "critical"
                                  ? "border-red-300 text-red-700"
                                  : issue.severity === "high"
                                    ? "border-orange-300 text-orange-700"
                                    : "border-yellow-300 text-yellow-700"
                              }`}
                            >
                              {issue.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                    {systemValidation.issues.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        ... and {systemValidation.issues.length - 5} more issues
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Clinical Decision Support Dashboard */}
          {clinicalDecisionSupport.length > 0 && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-900">
                    <Brain className="h-5 w-5 mr-2" />
                    Clinical Decision Support
                  </CardTitle>
                  <CardDescription>
                    AI-powered clinical recommendations based on evidence-based
                    guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clinicalDecisionSupport.map((decision, index) => (
                      <Alert
                        key={index}
                        className={`${
                          decision.urgency === "immediate"
                            ? "border-red-200 bg-red-50"
                            : decision.urgency === "urgent"
                              ? "border-orange-200 bg-orange-50"
                              : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                {decision.recommendation}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Evidence Level {decision.evidenceLevel}
                                </Badge>
                                <Badge
                                  variant={
                                    decision.urgency === "immediate"
                                      ? "destructive"
                                      : decision.urgency === "urgent"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {decision.urgency}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {decision.rationale}
                            </p>
                            {decision.actions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">
                                  Recommended Actions:
                                </p>
                                <ul className="text-xs space-y-1">
                                  {decision.actions.map(
                                    (action, actionIndex) => (
                                      <li
                                        key={actionIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <ArrowRight className="h-3 w-3" />
                                        {action.description} (Priority:{" "}
                                        {action.priority})
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Patient Safety Monitoring Dashboard */}
          {patientSafetyAlerts.length > 0 && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-900">
                    <Shield className="h-5 w-5 mr-2" />
                    Patient Safety Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time patient safety alerts and risk assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patientSafetyAlerts.map((alert, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm">{alert.description}</p>
                              {alert.recommendation && (
                                <p className="text-xs mt-1 text-gray-600">
                                  Recommendation: {alert.recommendation}
                                </p>
                              )}
                            </div>
                            <Badge variant="destructive">
                              {alert.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Medication Safety Alerts */}
          {medicationAlerts.length > 0 && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-900">
                    <Pill className="h-5 w-5 mr-2" />
                    Medication Safety Alerts
                  </CardTitle>
                  <CardDescription>
                    Drug interactions, allergies, and dosing recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {medicationAlerts.map((alert, index) => (
                      <Alert
                        key={index}
                        className="border-yellow-200 bg-yellow-50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm">{alert.description}</p>
                              {alert.action && (
                                <p className="text-xs mt-1 text-gray-600">
                                  Action: {alert.action}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">{alert.type}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Care Plan Recommendations */}
          {carePlanRecommendations.length > 0 && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-900">
                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                    Automated Care Plan Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized care plan suggestions based on patient data and
                    clinical guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {carePlanRecommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {recommendation.title}
                          </h4>
                          <Badge variant="outline">
                            {recommendation.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {recommendation.description}
                        </p>
                        {recommendation.goals && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium">Goals:</p>
                            {recommendation.goals.map((goal, goalIndex) => (
                              <div
                                key={goalIndex}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{goal.description}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">
                                    Target: {goal.target}
                                  </span>
                                  <Progress
                                    value={goal.progress}
                                    className="w-16 h-2"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Workflow Progress Dashboard */}
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-900">
                  <Workflow className="h-5 w-5 mr-2" />
                  Healthcare Workflow Progress
                </CardTitle>
                <CardDescription>
                  Real-time workflow automation and clinical decision support
                  progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Current Step:{" "}
                      {workflowProgress.currentStep.replace("_", " ")}
                    </span>
                    <span className="text-sm font-medium">
                      {workflowProgress.completedSteps}/
                      {workflowProgress.totalSteps} Complete
                    </span>
                  </div>
                  <Progress
                    value={
                      (workflowProgress.completedSteps /
                        workflowProgress.totalSteps) *
                      100
                    }
                    className="h-3"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white rounded border">
                      <div className="text-lg font-bold text-green-600">
                        {workflowProgress.completedSteps}
                      </div>
                      <div className="text-xs text-gray-600">
                        Steps Completed
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="text-lg font-bold text-blue-600">
                        {workflowProgress.estimatedTimeRemaining}min
                      </div>
                      <div className="text-xs text-gray-600">
                        Est. Time Remaining
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round(
                          (workflowProgress.completedSteps /
                            workflowProgress.totalSteps) *
                            100,
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-600">
                        Workflow Complete
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Dashboard */}
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Monitor className="h-5 w-5 mr-2" />
                  Medical Record System Health
                </CardTitle>
                <CardDescription>
                  Comprehensive validation of system robustness and integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Medical Records Integrity
                      </span>
                      <span className="text-sm font-bold">
                        {systemValidation.medicalRecordsIntegrity}%
                      </span>
                    </div>
                    <Progress
                      value={systemValidation.medicalRecordsIntegrity}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Forms Integration
                      </span>
                      <span className="text-sm font-bold">
                        {systemValidation.formsIntegration}%
                      </span>
                    </div>
                    <Progress
                      value={systemValidation.formsIntegration}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Workflow Robustness
                      </span>
                      <span className="text-sm font-bold">
                        {systemValidation.workflowRobustness}%
                      </span>
                    </div>
                    <Progress
                      value={systemValidation.workflowRobustness}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Compliance Alignment
                      </span>
                      <span className="text-sm font-bold">
                        {systemValidation.complianceAlignment}%
                      </span>
                    </div>
                    <Progress
                      value={systemValidation.complianceAlignment}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Patient Journey Tracking
                      </span>
                      <span className="text-sm font-bold">
                        {systemValidation.patientJourneyTracking}%
                      </span>
                    </div>
                    <Progress
                      value={systemValidation.patientJourneyTracking}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Bedside Visit Integration
                      </span>
                      <span className="text-sm font-bold">
                        {systemValidation.bedsideVisitIntegration}%
                      </span>
                    </div>
                    <Progress
                      value={systemValidation.bedsideVisitIntegration}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Overall System Health
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        (systemValidation.medicalRecordsIntegrity +
                          systemValidation.formsIntegration +
                          systemValidation.workflowRobustness +
                          systemValidation.complianceAlignment +
                          systemValidation.patientJourneyTracking +
                          systemValidation.bedsideVisitIntegration) /
                          6,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (systemValidation.medicalRecordsIntegrity +
                        systemValidation.formsIntegration +
                        systemValidation.workflowRobustness +
                        systemValidation.complianceAlignment +
                        systemValidation.patientJourneyTracking +
                        systemValidation.bedsideVisitIntegration) /
                        6,
                    )}
                    className="h-3 mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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
                            <div
                              key={domain.id}
                              className="space-y-2 p-4 border rounded-lg bg-gray-50"
                            >
                              <div className="flex justify-between items-center">
                                <Label
                                  htmlFor={domain.id}
                                  className="font-medium flex items-center gap-2"
                                >
                                  {domain.name}
                                  {domain.requiredForDOH && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-red-50 text-red-700 border-red-200"
                                    >
                                      DOH Required
                                    </Badge>
                                  )}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {domain.score}/{domain.maxScore}
                                  </span>
                                  {domain.validated && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={domain.id}
                                  type="range"
                                  min="0"
                                  max="5"
                                  value={domain.score}
                                  className="w-full"
                                  onChange={(e) => {
                                    const newScore = parseInt(e.target.value);
                                    const updatedDomains =
                                      assessmentDomains.map((d) =>
                                        d.id === domain.id
                                          ? {
                                              ...d,
                                              score: newScore,
                                              validated: false,
                                            }
                                          : d,
                                      );
                                    setAssessmentDomains(updatedDomains);

                                    // Update form data
                                    setFormData((prev) => ({
                                      ...prev,
                                      nineDomainsAssessment: {
                                        ...prev.nineDomainsAssessment,
                                        [domain.id]: {
                                          ...prev.nineDomainsAssessment?.[
                                            domain.id
                                          ],
                                          score: newScore,
                                        },
                                      },
                                    }));
                                  }}
                                />
                                <span className="text-xs text-gray-500 min-w-[60px]">
                                  Score: {domain.score}
                                </span>
                              </div>
                              <Textarea
                                placeholder={`Enter clinical justification for ${domain.name} score... (Required for DOH compliance)`}
                                className="h-20"
                                value={domain.clinicalJustification}
                                onChange={async (e) => {
                                  const text = e.target.value;

                                  // Update domain justification
                                  const updatedDomains = assessmentDomains.map(
                                    (d) =>
                                      d.id === domain.id
                                        ? {
                                            ...d,
                                            clinicalJustification: text,
                                            validated: text.length >= 10,
                                          }
                                        : d,
                                  );
                                  setAssessmentDomains(updatedDomains);

                                  // Update form data
                                  setFormData((prev) => ({
                                    ...prev,
                                    nineDomainsAssessment: {
                                      ...prev.nineDomainsAssessment,
                                      [domain.id]: {
                                        ...prev.nineDomainsAssessment?.[
                                          domain.id
                                        ],
                                        justification: text,
                                        score: domain.score,
                                      },
                                    },
                                  }));

                                  // Generate AI coding suggestions for longer text
                                  if (text.length > 50) {
                                    try {
                                      const suggestions =
                                        await naturalLanguageProcessingService.generateAutomatedCodingSuggestions(
                                          text,
                                        );
                                      setCodingSuggestions(
                                        suggestions.slice(0, 3),
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Failed to generate coding suggestions:",
                                        error,
                                      );
                                    }
                                  }
                                }}
                              />
                              {domain.clinicalJustification.length > 0 &&
                                domain.clinicalJustification.length < 10 && (
                                  <p className="text-xs text-red-600">
                                    Clinical justification must be at least 10
                                    characters for DOH compliance
                                  </p>
                                )}
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
                  {/* Advanced Clinical Documentation Features */}
                  <div className="space-y-4">
                    {/* Voice Input Section */}
                    {voiceInputEnabled && hasRecognitionSupport && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-blue-900 flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            Enhanced Voice Input with Medical Terminology
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                medicalVocabularyMode ? "default" : "outline"
                              }
                            >
                              Medical Mode
                            </Badge>
                            <Switch
                              checked={medicalVocabularyMode}
                              onCheckedChange={setMedicalVocabularyMode}
                            />
                          </div>
                        </div>

                        <VoiceInput
                          onTranscriptionComplete={handleVoiceTranscription}
                          onTranscriptionUpdate={(text) =>
                            setVoiceTranscript(text)
                          }
                          medicalMode={medicalVocabularyMode}
                          language="en-US"
                          maxDuration={300}
                          className="mb-4"
                        />

                        {voiceTranscript && (
                          <div className="mt-3">
                            <Label className="text-sm font-medium">
                              Voice Transcript:
                            </Label>
                            <Textarea
                              value={voiceTranscript}
                              onChange={(e) => {
                                setVoiceTranscript(e.target.value);
                                performSmartValidation(
                                  "voice_transcript",
                                  e.target.value,
                                );
                              }}
                              className="mt-1 min-h-20"
                              placeholder="Voice transcription will appear here..."
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clinical Template Library */}
                    {clinicalTemplates.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Clinical Template Library
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {clinicalTemplates.map((template) => (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => applyClinicalTemplate(template.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-sm">
                                      {template.name}
                                    </h5>
                                    <p className="text-xs text-gray-600">
                                      {template.description}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1"
                                    >
                                      {template.category}
                                    </Badge>
                                  </div>
                                  {selectedTemplate === template.id && (
                                    <Check className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Smart Form Validation Results */}
                    {smartValidationEnabled &&
                      realTimeValidationResults.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Smart Validation Results
                          </h4>
                          <div className="space-y-2">
                            {realTimeValidationResults.map((result, index) => (
                              <Alert
                                key={index}
                                className={`${result.severity === "error" ? "border-red-200 bg-red-50" : result.severity === "warning" ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"}`}
                              >
                                <AlertDescription className="text-sm">
                                  <div className="flex items-center justify-between">
                                    <span>{result.message}</span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {result.severity}
                                    </Badge>
                                  </div>
                                  {result.suggestion && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {result.suggestion}
                                    </p>
                                  )}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Automated ICD/CPT Coding Suggestions */}
                    {automatedCodingEnabled && icdCptSuggestions.length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Automated Coding Suggestions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {icdCptSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge
                                  variant={
                                    suggestion.type === "ICD-10"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {suggestion.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(suggestion.confidence * 100)}%
                                  confidence
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">
                                {suggestion.code}
                              </p>
                              <p className="text-xs text-gray-600">
                                {suggestion.description}
                              </p>
                              {suggestion.source && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Source: {suggestion.source}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

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
                        onClick={() => handleSaveForm(true)}
                        disabled={!roleBasedAccess.canCreate}
                      >
                        <Save className="h-4 w-4 mr-2" /> Save Draft
                      </Button>
                      <Button
                        onClick={handleSubmitForm}
                        disabled={!roleBasedAccess.canSubmit}
                      >
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
                      {enableAdvancedFeatures && (
                        <Button
                          variant="outline"
                          onClick={() => setShowComplianceChecker(true)}
                          disabled={!roleBasedAccess.canViewAnalytics}
                        >
                          <Shield className="h-4 w-4 mr-2" /> Check Compliance
                        </Button>
                      )}
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

                {/* Enhanced Recent Forms with Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Recent Forms</CardTitle>
                      {recentForms.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log("View all forms")}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(recentForms.length > 0 ? recentForms : clinicalForms)
                        .slice(0, 5)
                        .map((form, index) => {
                          const isRecentForm = recentForms.length > 0;
                          const formId = isRecentForm ? form.id : form.id;
                          const formName = isRecentForm
                            ? form.form_type
                            : form.name;
                          const formStatus = isRecentForm
                            ? form.status
                            : "template";

                          return (
                            <div
                              key={formId}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group"
                              onClick={() =>
                                isRecentForm
                                  ? console.log("Open form", form.id)
                                  : setActiveForm(form.id)
                              }
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={selectedForms.includes(formId)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedForms((prev) => [
                                          ...prev,
                                          formId,
                                        ]);
                                      } else {
                                        setSelectedForms((prev) =>
                                          prev.filter((id) => id !== formId),
                                        );
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm font-medium">
                                    {formName}
                                  </span>
                                  {isRecentForm && (
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(
                                        form.created_at,
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    formStatus === "submitted"
                                      ? "default"
                                      : formStatus === "draft"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {isRecentForm
                                    ? formStatus
                                    : index === 0
                                      ? "Today"
                                      : index === 1
                                        ? "Yesterday"
                                        : `${index + 1}d ago`}
                                </Badge>
                                {isRecentForm && roleBasedAccess.canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log("Edit form", form.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      {recentForms.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent forms</p>
                          <p className="text-xs">
                            Start documenting to see forms here
                          </p>
                        </div>
                      )}
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

                {/* Clinical Audit Trail */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Clinical Audit Trail
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {auditTrail.slice(-5).map((entry) => (
                        <div
                          key={entry.id}
                          className="text-xs bg-gray-50 p-2 rounded"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {entry.action.replace("_", " ")}
                            </span>
                            <span className="text-gray-500">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{entry.details}</p>
                          {entry.metadata && (
                            <p className="text-gray-500 mt-1">
                              {JSON.stringify(entry.metadata)}
                            </p>
                          )}
                        </div>
                      ))}
                      {auditTrail.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No audit trail entries yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

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

                {/* Advanced Features Toggle */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Advanced Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        Voice Input with Medical Terminology
                      </Label>
                      <Switch
                        checked={voiceInputEnabled}
                        onCheckedChange={setVoiceInputEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Smart Form Validation</Label>
                      <Switch
                        checked={smartValidationEnabled}
                        onCheckedChange={setSmartValidationEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        Automated ICD/CPT Coding
                      </Label>
                      <Switch
                        checked={automatedCodingEnabled}
                        onCheckedChange={setAutomatedCodingEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Medical Vocabulary Mode</Label>
                      <Switch
                        checked={medicalVocabularyMode}
                        onCheckedChange={setMedicalVocabularyMode}
                      />
                    </div>
                  </CardContent>
                </Card>

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
          ) : activeTab === "rounds" ? (
            <RoundsManagement
              patientId={patientId}
              episodeId={episodeId}
              isOffline={isOffline}
              onRoundComplete={(roundData) => {
                console.log("Round completed:", roundData);
                handleSuccess("Bedside round completed successfully");
              }}
            />
          ) : activeTab === "healthcare-integration" ? (
            <HealthcareIntegrationView
              patientId={patientId}
              fhirData={fhirData}
              labResults={labResults}
              medicationData={medicationData}
              hospitalAdmissions={hospitalAdmissions}
              integrationStatus={healthcareIntegrationStatus}
              isLoading={isLoadingHealthcareData}
              onRefresh={loadHealthcareIntegrationData}
            />
          ) : activeTab === "telehealth" ? (
            <TelehealthView
              patientId={patientId}
              telehealthSessions={telehealthSessions}
              integrationStatus={healthcareIntegrationStatus.telehealth}
              isLoading={isLoadingHealthcareData}
              onRefresh={loadHealthcareIntegrationData}
            />
          ) : activeTab === "analytics" && enableAdvancedFeatures ? (
            <ClinicalAnalyticsView
              patientId={patientId}
              episodeId={episodeId}
              clinicalHistory={clinicalHistory}
              recentForms={recentForms}
              integrationStatus={integrationStatus}
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

          {/* Enhanced Mobile Bottom Navigation with Performance Metrics */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 z-30 shadow-lg">
            <div className="flex justify-around items-center">
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 haptic-feedback"
                aria-label="Navigate to Dashboard"
              >
                <Monitor className="h-4 w-4" />
                <span className="text-xs mt-1">Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 haptic-feedback"
                aria-label="Navigate to Patients"
              >
                <Smartphone className="h-4 w-4" />
                <span className="text-xs mt-1">Patients</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-col h-auto py-2 haptic-feedback"
                aria-label="Navigate to Forms"
              >
                <Tablet className="h-4 w-4" />
                <span className="text-xs mt-1">Forms</span>
              </Button>
              {!networkStatus.online && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-col h-auto py-2 haptic-feedback"
                  aria-label="Offline Mode Active"
                >
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs mt-1">Offline</span>
                </Button>
              )}
            </div>

            {/* Performance Indicator */}
            {performanceMetrics.renderTime > 0 && (
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                  <span>
                    Render: {performanceMetrics.renderTime.toFixed(1)}ms
                  </span>
                  {performanceMetrics.memoryUsage > 0 && (
                    <span>Memory: {performanceMetrics.memoryUsage}MB</span>
                  )}
                  <span>A11y: {accessibilityScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileResponsiveLayout>
    </ClinicalWorkflowErrorBoundary>
  );
};

// Enhanced Clinical Analytics View Component
const ClinicalAnalyticsView: React.FC<{
  patientId: string;
  episodeId: string;
  clinicalHistory: any[];
  recentForms: any[];
  integrationStatus: any;
}> = ({
  patientId,
  episodeId,
  clinicalHistory,
  recentForms,
  integrationStatus,
}) => {
  const analyticsData = useMemo(() => {
    return {
      totalForms: recentForms.length,
      completedForms: recentForms.filter((f) => f.status === "submitted")
        .length,
      draftForms: recentForms.filter((f) => f.status === "draft").length,
      complianceRate:
        recentForms.length > 0
          ? (recentForms.filter((f) => f.doh_compliant).length /
              recentForms.length) *
            100
          : 0,
      averageCompletionTime: 15, // Mock data
      formTypes: recentForms.reduce(
        (acc, form) => {
          acc[form.form_type] = (acc[form.form_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }, [recentForms]);

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.completedForms} completed,{" "}
              {analyticsData.draftForms} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.complianceRate.toFixed(1)}%
            </div>
            <Progress value={analyticsData.complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.averageCompletionTime}min
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">12% faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Malaffi</span>
                <Badge
                  variant={
                    integrationStatus.malaffi === "connected"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {integrationStatus.malaffi}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Daman</span>
                <Badge
                  variant={
                    integrationStatus.daman === "connected"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {integrationStatus.daman}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">DOH</span>
                <Badge
                  variant={
                    integrationStatus.doh === "compliant"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {integrationStatus.doh}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Form Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analyticsData.formTypes).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {type.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / analyticsData.totalForms) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Clinical Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinicalHistory.slice(0, 5).map((episode, index) => (
                <div key={episode.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {episode.primary_diagnosis || "Episode"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(episode.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {episode.status}
                  </Badge>
                </div>
              ))}
              {clinicalHistory.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No clinical history available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-sm text-green-700">Form Completion Rate</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.3min</div>
              <p className="text-sm text-blue-700">Avg Response Time</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">99.1%</div>
              <p className="text-sm text-purple-700">Data Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Healthcare Integration View Component
const HealthcareIntegrationView: React.FC<{
  patientId: string;
  fhirData: any;
  labResults: any[];
  medicationData: any;
  hospitalAdmissions: any[];
  integrationStatus: any;
  isLoading: boolean;
  onRefresh: () => void;
}> = ({
  patientId,
  fhirData,
  labResults,
  medicationData,
  hospitalAdmissions,
  integrationStatus,
  isLoading,
  onRefresh,
}) => {
  const [activeIntegrationTab, setActiveIntegrationTab] = useState("fhir");

  return (
    <div className="space-y-6">
      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">FHIR Integration</p>
                <p className="text-xs text-muted-foreground">Patient Data</p>
              </div>
              <Badge
                variant={
                  integrationStatus.fhir.status === "connected"
                    ? "default"
                    : "destructive"
                }
                className="text-xs"
              >
                {integrationStatus.fhir.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Laboratory</p>
                <p className="text-xs text-muted-foreground">
                  {labResults.length} Results
                </p>
              </div>
              <Badge
                variant={
                  integrationStatus.laboratory.status === "connected"
                    ? "default"
                    : "destructive"
                }
                className="text-xs"
              >
                {integrationStatus.laboratory.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pharmacy</p>
                <p className="text-xs text-muted-foreground">Medications</p>
              </div>
              <Badge
                variant={
                  integrationStatus.pharmacy.status === "connected"
                    ? "default"
                    : "destructive"
                }
                className="text-xs"
              >
                {integrationStatus.pharmacy.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Hospital</p>
                <p className="text-xs text-muted-foreground">
                  {hospitalAdmissions.length} Admissions
                </p>
              </div>
              <Badge
                variant={
                  integrationStatus.hospital.status === "connected"
                    ? "default"
                    : "destructive"
                }
                className="text-xs"
              >
                {integrationStatus.hospital.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Tabs */}
      <Tabs
        value={activeIntegrationTab}
        onValueChange={setActiveIntegrationTab}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fhir">
            <Database className="h-4 w-4 mr-2" />
            FHIR Data
          </TabsTrigger>
          <TabsTrigger value="laboratory">
            <Thermometer className="h-4 w-4 mr-2" />
            Lab Results
          </TabsTrigger>
          <TabsTrigger value="pharmacy">
            <Pill className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="hospital">
            <Heart className="h-4 w-4 mr-2" />
            Hospital Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fhir" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>FHIR Patient Data</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Standardized patient data from FHIR R4 resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fhirData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Patient ID</Label>
                      <p className="text-sm text-muted-foreground">
                        {fhirData.id}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Active Status
                      </Label>
                      <Badge
                        variant={fhirData.active ? "default" : "secondary"}
                      >
                        {fhirData.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground">
                        {fhirData.name?.[0]?.given?.join(" ")}{" "}
                        {fhirData.name?.[0]?.family}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {fhirData.gender}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Birth Date</Label>
                      <p className="text-sm text-muted-foreground">
                        {fhirData.birthDate}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Identifiers</Label>
                      <div className="space-y-1">
                        {fhirData.identifier?.map((id: any, index: number) => (
                          <p
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {id.type?.coding?.[0]?.display || "ID"}: {id.value}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {fhirData.telecom && (
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Information
                      </Label>
                      <div className="space-y-1 mt-1">
                        {fhirData.telecom.map((contact: any, index: number) => (
                          <p
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {contact.system}: {contact.value} ({contact.use})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {fhirData.address && (
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <div className="space-y-1 mt-1">
                        {fhirData.address.map((addr: any, index: number) => (
                          <p
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {addr.line?.join(", ")}, {addr.city}, {addr.state}{" "}
                            {addr.postalCode}, {addr.country}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No FHIR data available
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={onRefresh}
                  >
                    Load FHIR Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laboratory" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Laboratory Results</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Recent laboratory test results and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {labResults.length > 0 ? (
                <div className="space-y-4">
                  {labResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{result.testType}</h4>
                          <Badge
                            variant={
                              result.status === "final"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs font-medium">
                              Order Date
                            </Label>
                            <p className="text-muted-foreground">
                              {new Date(result.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">
                              Collection Date
                            </Label>
                            <p className="text-muted-foreground">
                              {new Date(
                                result.collectionDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">
                              Result Date
                            </Label>
                            <p className="text-muted-foreground">
                              {new Date(result.resultDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {result.results && result.results.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">
                              Test Results
                            </Label>
                            <div className="mt-2 space-y-2">
                              {result.results.map(
                                (test: any, testIndex: number) => (
                                  <div
                                    key={testIndex}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                  >
                                    <span className="text-sm">
                                      {test.parameter}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {test.value} {test.unit}
                                      </span>
                                      <Badge
                                        variant={
                                          test.status === "normal"
                                            ? "secondary"
                                            : test.status === "critical"
                                              ? "destructive"
                                              : "default"
                                        }
                                        className="text-xs"
                                      >
                                        {test.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {result.criticalValues &&
                          result.criticalValues.length > 0 && (
                            <Alert className="mt-4" variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Critical values detected:{" "}
                                {result.criticalValues.join(", ")}
                              </AlertDescription>
                            </Alert>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Thermometer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No laboratory results available
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={onRefresh}
                  >
                    Load Lab Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pharmacy" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medication Management</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Current medications, adherence, and pharmacy data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medicationData ? (
                <div className="space-y-6">
                  {/* Adherence Score */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Medication Adherence</h4>
                      <Badge
                        variant={
                          medicationData.adherenceScore >= 80
                            ? "default"
                            : "destructive"
                        }
                      >
                        {medicationData.adherenceScore}%
                      </Badge>
                    </div>
                    <Progress
                      value={medicationData.adherenceScore}
                      className="h-2"
                    />
                  </div>

                  {/* Current Medications */}
                  <div>
                    <h4 className="font-medium mb-3">Current Medications</h4>
                    <div className="space-y-3">
                      {medicationData.currentMedications?.map(
                        (med: any, index: number) => (
                          <Card
                            key={index}
                            className="border-l-4 border-l-green-500"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{med.name}</h5>
                                <Badge
                                  variant={
                                    med.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {med.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs font-medium">
                                    Strength
                                  </Label>
                                  <p className="text-muted-foreground">
                                    {med.strength}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium">
                                    Frequency
                                  </Label>
                                  <p className="text-muted-foreground">
                                    {med.frequency}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium">
                                    Route
                                  </Label>
                                  <p className="text-muted-foreground">
                                    {med.route}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium">
                                    Refills
                                  </Label>
                                  <p className="text-muted-foreground">
                                    {med.remainingRefills} remaining
                                  </p>
                                </div>
                              </div>

                              {med.adherence && (
                                <div className="mt-3 p-2 bg-gray-50 rounded">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>
                                      Adherence Score: {med.adherence.score}%
                                    </span>
                                    <span>
                                      Missed Doses: {med.adherence.missedDoses}
                                    </span>
                                    <span>
                                      Last Taken:{" "}
                                      {new Date(
                                        med.adherence.lastTaken,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Drug Interactions */}
                  {medicationData.interactions &&
                    medicationData.interactions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Drug Interactions</h4>
                        <div className="space-y-2">
                          {medicationData.interactions.map(
                            (interaction: any, index: number) => (
                              <Alert
                                key={index}
                                variant={
                                  interaction.severity === "Major"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  <div className="flex items-center justify-between">
                                    <span>{interaction.description}</span>
                                    <Badge variant="outline">
                                      {interaction.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-xs mt-1">
                                    {interaction.recommendation}
                                  </p>
                                </AlertDescription>
                              </Alert>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Allergies */}
                  {medicationData.allergies &&
                    medicationData.allergies.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Known Allergies</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {medicationData.allergies.map(
                            (allergy: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 bg-red-50 border border-red-200 rounded"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {allergy.allergen}
                                  </span>
                                  <Badge variant="destructive">
                                    {allergy.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {allergy.reaction}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No medication data available
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={onRefresh}
                  >
                    Load Medication Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospital" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hospital Admissions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Hospital admission history and discharge planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hospitalAdmissions.length > 0 ? (
                <div className="space-y-4">
                  {hospitalAdmissions.map((admission, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            {admission.hospital.name}
                          </h4>
                          <Badge
                            variant={
                              admission.dischargeDate ? "secondary" : "default"
                            }
                          >
                            {admission.dischargeDate ? "Discharged" : "Active"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <Label className="text-xs font-medium">
                              Admission Date
                            </Label>
                            <p className="text-muted-foreground">
                              {new Date(
                                admission.admissionDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">
                              Department
                            </Label>
                            <p className="text-muted-foreground">
                              {admission.department}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">
                              Admission Type
                            </Label>
                            <p className="text-muted-foreground">
                              {admission.admissionType}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">
                              Primary Diagnosis
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {admission.primaryDiagnosis.code} -{" "}
                              {admission.primaryDiagnosis.description}
                            </p>
                          </div>

                          {admission.attendingPhysician && (
                            <div>
                              <Label className="text-sm font-medium">
                                Attending Physician
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {admission.attendingPhysician.name} -{" "}
                                {admission.attendingPhysician.department}
                              </p>
                            </div>
                          )}

                          {admission.procedures &&
                            admission.procedures.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Procedures
                                </Label>
                                <div className="space-y-1 mt-1">
                                  {admission.procedures.map(
                                    (proc: any, procIndex: number) => (
                                      <p
                                        key={procIndex}
                                        className="text-sm text-muted-foreground"
                                      >
                                        {proc.code} - {proc.description} (
                                        {new Date(
                                          proc.date,
                                        ).toLocaleDateString()}
                                        )
                                      </p>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {admission.transitionToCare &&
                            admission.transitionToCare.homecareReferral && (
                              <Alert>
                                <Heart className="h-4 w-4" />
                                <AlertDescription>
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      Homecare Referral
                                    </p>
                                    <p className="text-sm">
                                      Services:{" "}
                                      {admission.transitionToCare.services.join(
                                        ", ",
                                      )}
                                    </p>
                                    <p className="text-sm">
                                      Duration:{" "}
                                      {admission.transitionToCare.duration}
                                    </p>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No hospital admissions found
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={onRefresh}
                  >
                    Load Hospital Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Telehealth View Component
const TelehealthView: React.FC<{
  patientId: string;
  telehealthSessions: any[];
  integrationStatus: any;
  isLoading: boolean;
  onRefresh: () => void;
}> = ({
  patientId,
  telehealthSessions,
  integrationStatus,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="space-y-6">
      {/* Telehealth Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Telehealth Integration</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  integrationStatus.status === "connected"
                    ? "default"
                    : "destructive"
                }
              >
                {integrationStatus.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>
            Virtual care sessions and telehealth platform integration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Telehealth Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Telehealth Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {telehealthSessions.length > 0 ? (
            <div className="space-y-4">
              {telehealthSessions.map((session, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{session.appointmentType}</h4>
                      <Badge
                        variant={
                          session.status === "completed"
                            ? "default"
                            : session.status === "scheduled"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <Label className="text-xs font-medium">
                          Scheduled Time
                        </Label>
                        <p className="text-muted-foreground">
                          {new Date(session.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Platform</Label>
                        <p className="text-muted-foreground">
                          {session.platform.name} v{session.platform.version}
                        </p>
                      </div>
                    </div>

                    {session.participants && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium">
                          Participants
                        </Label>
                        <div className="space-y-1 mt-1">
                          {session.participants.map(
                            (participant: any, partIndex: number) => (
                              <div
                                key={partIndex}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>
                                  {participant.name} ({participant.role})
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {participant.joinStatus}
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {session.clinicalFeatures && (
                      <div className="bg-gray-50 p-3 rounded">
                        <Label className="text-sm font-medium">
                          Clinical Features Available
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${session.clinicalFeatures.vitalSigns.enabled ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Vital Signs Monitoring</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${session.clinicalFeatures.digitalStethoscope ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Digital Stethoscope</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${session.clinicalFeatures.skinExamination ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Skin Examination</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${session.clinicalFeatures.prescriptionManagement ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            <span>Prescription Management</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {session.compliance && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium">
                          Compliance Status
                        </Label>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>
                              HIPAA:{" "}
                              {session.compliance.hipaaCompliant ? "✓" : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>
                              DOH: {session.compliance.dohApproved ? "✓" : "✗"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            <span>
                              Encryption:{" "}
                              {session.compliance.encryptionStandard}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No telehealth sessions found
              </p>
              <Button variant="outline" className="mt-2" onClick={onRefresh}>
                Load Telehealth Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalDocumentation;
