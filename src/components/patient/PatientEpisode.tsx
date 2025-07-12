import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Plus,
  User,
  Camera,
  Mic,
  Save,
  Upload,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Bell,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Shield,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Pill,
  Stethoscope,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  EpisodeService,
  PatientService,
  ClinicalFormsService,
  RealtimeService,
} from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";
// Dynamic imports for services to support code splitting
// import { offlineService } from "@/services/offline.service";
// import { mobileCommunicationService } from "@/services/mobile-communication.service";
// import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";

interface EpisodeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type:
    | "assessment"
    | "visit"
    | "document"
    | "compliance"
    | "safety_incident"
    | "medication_admin"
    | "vital_signs"
    | "wound_care"
    | "therapy_session"
    | "family_education"
    | "discharge_planning"
    | "emergency_response";
  status:
    | "completed"
    | "pending"
    | "overdue"
    | "scheduled"
    | "in_progress"
    | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  // Enhanced fields for medical records integration
  clinician?: string;
  clinicianId?: string;
  location?: string;
  duration?: number;
  outcomes?: string;
  complications?: string;
  followUpRequired?: boolean;
  nextAppointment?: string;
  // DOH Patient Safety Integration
  safetyClassification?: {
    riskLevel: "low" | "medium" | "high" | "critical";
    preventable: boolean;
    reportedToDOH: boolean;
    taxonomyClassified: boolean;
    incidentType?: string;
    rootCause?: string;
    correctiveActions?: string[];
  };
  // Medical Records Compliance
  documentationComplete: boolean;
  signedBy?: string;
  witnessedBy?: string;
  electronicSignature?: {
    timestamp: string;
    ipAddress: string;
    deviceId: string;
    signatureData?: string;
  };
  // Enhanced Clinical Data
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    painScale?: number;
    weight?: number;
    height?: number;
  };
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    administered: boolean;
    administeredBy?: string;
    administeredAt?: string;
  }[];
  attachments?: {
    id: string;
    type: "image" | "document" | "audio" | "video";
    filename: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }[];
  // Mobile Integration
  voiceNotes?: {
    id: string;
    transcript: string;
    audioUrl?: string;
    duration: number;
    recordedAt: string;
  }[];
  // Real-time Collaboration
  collaborators?: {
    userId: string;
    name: string;
    role: string;
    lastActive: string;
  }[];
  // Quality Metrics
  qualityScore?: number;
  complianceScore?: number;
  patientSatisfaction?: number;
}

interface ClinicalForm {
  id: string;
  name: string;
  lastUpdated: string;
  status:
    | "completed"
    | "pending"
    | "draft"
    | "in_progress"
    | "reviewed"
    | "approved";
  compliance: number;
  formType: string;
  version: string;
  createdBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  dohCompliant: boolean;
  requiredFields: string[];
  completedFields: string[];
  validationErrors: string[];
  electronicSignature?: {
    signedBy: string;
    signedAt: string;
    ipAddress: string;
    deviceInfo: string;
  };
  attachments?: {
    id: string;
    filename: string;
    type: string;
    url: string;
  }[];
  aiSuggestions?: {
    field: string;
    suggestion: string;
    confidence: number;
  }[];
  offlineCapable: boolean;
  syncStatus: "synced" | "pending" | "conflict" | "error";
}

interface PatientEpisodeProps {
  episodeId?: string;
  patientId?: string;
  isOffline?: boolean;
  episodeData?: {
    id: string;
    startDate: string;
    endDate?: string;
    status: "active" | "completed" | "pending" | "suspended" | "transferred";
    careType: string;
    primaryDiagnosis: string;
    secondaryDiagnoses?: string[];
    complianceScore: number;
    qualityScore: number;
    patientSatisfactionScore: number;
    events: EpisodeEvent[];
    clinicalForms: ClinicalForm[];
    careTeam: {
      id: string;
      name: string;
      role: string;
      specialty?: string;
      licenseNumber?: string;
      contactInfo?: {
        phone?: string;
        email?: string;
      };
      isActive: boolean;
      lastActivity?: string;
    }[];
    emergencyContacts: {
      id: string;
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      isPrimary: boolean;
    }[];
    insuranceInfo: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
      authorizationNumber?: string;
      expiryDate?: string;
      copayAmount?: number;
      deductible?: number;
    };
    goals: {
      id: string;
      description: string;
      targetDate: string;
      status: "active" | "achieved" | "modified" | "discontinued";
      progress: number;
      measurableOutcomes: string[];
    }[];
    riskFactors: {
      factor: string;
      severity: "low" | "medium" | "high" | "critical";
      mitigation: string;
      lastAssessed: string;
    }[];
    alerts: {
      id: string;
      type: "allergy" | "medication" | "condition" | "safety" | "compliance";
      message: string;
      severity: "info" | "warning" | "critical";
      isActive: boolean;
      createdAt: string;
    }[];
  };
}

const PatientEpisode: React.FC<PatientEpisodeProps> = ({
  episodeId = "EP12345",
  patientId = "PT67890",
  isOffline = false,
  episodeData = {
    id: "EP12345",
    startDate: "2023-06-15",
    endDate: "2023-09-15",
    status: "active" as const,
    careType: "Post-Hospital Transitional Care",
    primaryDiagnosis: "Congestive Heart Failure",
    secondaryDiagnoses: ["Diabetes Mellitus Type 2", "Hypertension"],
    complianceScore: 85,
    qualityScore: 92,
    patientSatisfactionScore: 88,
    events: [
      {
        id: "EV001",
        date: "2023-06-15",
        title: "Initial Assessment",
        description: "Complete 9-domain DOH assessment",
        type: "assessment" as const,
        status: "completed" as const,
        priority: "high" as const,
        clinician: "Dr. Sarah Ahmed",
        clinicianId: "DOC001",
        location: "Patient Home",
        duration: 90,
        documentationComplete: true,
        vitalSigns: {
          bloodPressure: "130/85",
          heartRate: 78,
          temperature: 36.7,
          oxygenSaturation: 96,
          respiratoryRate: 18,
          painScale: 2,
        },
        qualityScore: 95,
        complianceScore: 100,
      },
      {
        id: "EV002",
        date: "2023-06-18",
        title: "Nursing Visit",
        description: "Vital signs monitoring and medication review",
        type: "visit" as const,
        status: "completed" as const,
        priority: "medium" as const,
        clinician: "Nurse Fatima Al-Zahra",
        clinicianId: "NUR001",
        location: "Patient Home",
        duration: 45,
        documentationComplete: true,
        medications: [
          {
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            route: "Oral",
            administered: true,
            administeredBy: "NUR001",
            administeredAt: "2023-06-18T09:00:00Z",
          },
          {
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            route: "Oral",
            administered: true,
            administeredBy: "NUR001",
            administeredAt: "2023-06-18T09:05:00Z",
          },
        ],
      },
      {
        id: "EV003",
        date: "2023-06-22",
        title: "Physiotherapy Session",
        description: "Mobility exercises and gait training",
        type: "therapy_session" as const,
        status: "completed" as const,
        priority: "medium" as const,
        clinician: "PT Ahmed Hassan",
        clinicianId: "PT001",
        location: "Patient Home",
        duration: 60,
        documentationComplete: true,
        outcomes:
          "Patient demonstrated improved balance and increased walking distance by 20 meters",
        followUpRequired: true,
        nextAppointment: "2023-06-29",
      },
      {
        id: "EV004",
        date: "2023-06-25",
        title: "Wound Care Documentation",
        description: "Wound measurement and treatment plan",
        type: "wound_care" as const,
        status: "pending" as const,
        priority: "high" as const,
        clinician: "Nurse Fatima Al-Zahra",
        clinicianId: "NUR001",
        location: "Patient Home",
        duration: 30,
        documentationComplete: false,
        attachments: [
          {
            id: "ATT001",
            type: "image",
            filename: "wound_photo_20230625.jpg",
            url: "/attachments/wound_photo_20230625.jpg",
            uploadedAt: "2023-06-25T14:30:00Z",
            uploadedBy: "NUR001",
          },
        ],
      },
      {
        id: "EV005",
        date: "2023-06-28",
        title: "DOH Compliance Check",
        description: "Verification of documentation standards",
        type: "compliance" as const,
        status: "scheduled" as const,
        priority: "critical" as const,
        clinician: "Quality Assurance Team",
        clinicianId: "QA001",
        location: "Virtual Review",
        duration: 60,
        documentationComplete: false,
        safetyClassification: {
          riskLevel: "low",
          preventable: true,
          reportedToDOH: false,
          taxonomyClassified: true,
        },
      },
    ],
    careTeam: [
      {
        id: "DOC001",
        name: "Dr. Sarah Ahmed",
        role: "Primary Physician",
        specialty: "Internal Medicine",
        licenseNumber: "DOH-12345",
        contactInfo: {
          phone: "+971-50-123-4567",
          email: "s.ahmed@hospital.ae",
        },
        isActive: true,
        lastActivity: "2023-06-25T10:30:00Z",
      },
      {
        id: "NUR001",
        name: "Nurse Fatima Al-Zahra",
        role: "Registered Nurse",
        specialty: "Home Healthcare",
        licenseNumber: "DOH-67890",
        contactInfo: {
          phone: "+971-50-234-5678",
          email: "f.alzahra@homecare.ae",
        },
        isActive: true,
        lastActivity: "2023-06-24T16:45:00Z",
      },
      {
        id: "PT001",
        name: "PT Ahmed Hassan",
        role: "Physiotherapist",
        specialty: "Geriatric Physiotherapy",
        licenseNumber: "DOH-11111",
        contactInfo: {
          phone: "+971-50-345-6789",
          email: "a.hassan@therapy.ae",
        },
        isActive: true,
        lastActivity: "2023-06-22T14:00:00Z",
      },
    ],
    emergencyContacts: [
      {
        id: "EC001",
        name: "Aisha Al-Mansoori",
        relationship: "Daughter",
        phone: "+971-50-456-7890",
        email: "aisha.almansoori@email.com",
        isPrimary: true,
      },
      {
        id: "EC002",
        name: "Omar Al-Mansoori",
        relationship: "Son",
        phone: "+971-50-567-8901",
        email: "omar.almansoori@email.com",
        isPrimary: false,
      },
    ],
    insuranceInfo: {
      provider: "Daman - Thiqa",
      policyNumber: "THQ-2023-001234",
      groupNumber: "GRP-789",
      authorizationNumber: "AUTH-456789",
      expiryDate: "2024-12-31",
      copayAmount: 50,
      deductible: 500,
    },
    goals: [
      {
        id: "G001",
        description: "Improve mobility and independence in daily activities",
        targetDate: "2023-08-15",
        status: "active",
        progress: 65,
        measurableOutcomes: [
          "Walk 100 meters without assistance",
          "Climb stairs independently",
          "Perform ADLs without help",
        ],
      },
      {
        id: "G002",
        description: "Stabilize blood pressure and glucose levels",
        targetDate: "2023-07-30",
        status: "active",
        progress: 80,
        measurableOutcomes: [
          "BP < 140/90 mmHg consistently",
          "HbA1c < 7%",
          "Medication adherence > 95%",
        ],
      },
    ],
    riskFactors: [
      {
        factor: "Fall Risk",
        severity: "medium",
        mitigation:
          "Physical therapy, home safety assessment, assistive devices",
        lastAssessed: "2023-06-22",
      },
      {
        factor: "Medication Non-adherence",
        severity: "low",
        mitigation: "Pill organizer, family education, regular monitoring",
        lastAssessed: "2023-06-18",
      },
    ],
    alerts: [
      {
        id: "A001",
        type: "allergy",
        message: "Penicillin allergy - severe reaction",
        severity: "critical",
        isActive: true,
        createdAt: "2023-06-15T08:00:00Z",
      },
      {
        id: "A002",
        type: "medication",
        message: "Warfarin interaction risk with new medications",
        severity: "warning",
        isActive: true,
        createdAt: "2023-06-18T12:00:00Z",
      },
    ],
    clinicalForms: [
      {
        id: "CF001",
        name: "DOH Healthcare Assessment",
        lastUpdated: "2023-06-15",
        status: "completed" as const,
        compliance: 100,
        formType: "assessment",
        version: "2.1",
        createdBy: "DOC001",
        reviewedBy: "QA001",
        approvedBy: "QA001",
        dohCompliant: true,
        requiredFields: [
          "patient_demographics",
          "medical_history",
          "current_medications",
          "vital_signs",
          "assessment_findings",
        ],
        completedFields: [
          "patient_demographics",
          "medical_history",
          "current_medications",
          "vital_signs",
          "assessment_findings",
        ],
        validationErrors: [],
        electronicSignature: {
          signedBy: "DOC001",
          signedAt: "2023-06-15T16:30:00Z",
          ipAddress: "192.168.1.100",
          deviceInfo: "iPad Pro 12.9",
        },
        offlineCapable: true,
        syncStatus: "synced",
      },
      {
        id: "CF002",
        name: "Nursing Progress Note",
        lastUpdated: "2023-06-18",
        status: "completed" as const,
        compliance: 95,
        formType: "progress_note",
        version: "1.8",
        createdBy: "NUR001",
        reviewedBy: "DOC001",
        dohCompliant: true,
        requiredFields: ["patient_status", "interventions", "outcomes", "plan"],
        completedFields: [
          "patient_status",
          "interventions",
          "outcomes",
          "plan",
        ],
        validationErrors: [],
        electronicSignature: {
          signedBy: "NUR001",
          signedAt: "2023-06-18T17:15:00Z",
          ipAddress: "192.168.1.101",
          deviceInfo: "iPhone 14 Pro",
        },
        offlineCapable: true,
        syncStatus: "synced",
      },
      {
        id: "CF003",
        name: "Physiotherapy Assessment",
        lastUpdated: "2023-06-22",
        status: "completed" as const,
        compliance: 90,
        formType: "therapy_assessment",
        version: "1.5",
        createdBy: "PT001",
        dohCompliant: true,
        requiredFields: [
          "functional_assessment",
          "range_of_motion",
          "strength_testing",
          "treatment_plan",
        ],
        completedFields: [
          "functional_assessment",
          "range_of_motion",
          "strength_testing",
          "treatment_plan",
        ],
        validationErrors: [],
        electronicSignature: {
          signedBy: "PT001",
          signedAt: "2023-06-22T15:45:00Z",
          ipAddress: "192.168.1.102",
          deviceInfo: "Samsung Galaxy Tab S8",
        },
        offlineCapable: true,
        syncStatus: "synced",
      },
      {
        id: "CF004",
        name: "Wound Assessment",
        lastUpdated: "2023-06-25",
        status: "in_progress" as const,
        compliance: 60,
        formType: "wound_assessment",
        version: "2.0",
        createdBy: "NUR001",
        dohCompliant: false,
        requiredFields: [
          "wound_location",
          "wound_dimensions",
          "wound_stage",
          "treatment_plan",
          "photo_documentation",
        ],
        completedFields: ["wound_location", "wound_dimensions", "wound_stage"],
        validationErrors: [
          "Photo documentation required",
          "Treatment plan incomplete",
        ],
        attachments: [
          {
            id: "ATT001",
            filename: "wound_photo_20230625.jpg",
            type: "image/jpeg",
            url: "/attachments/wound_photo_20230625.jpg",
          },
        ],
        aiSuggestions: [
          {
            field: "treatment_plan",
            suggestion: "Consider silver dressing for antimicrobial properties",
            confidence: 0.85,
          },
        ],
        offlineCapable: true,
        syncStatus: "pending",
      },
      {
        id: "CF005",
        name: "Medication Administration Record",
        lastUpdated: "",
        status: "pending" as const,
        compliance: 0,
        formType: "medication_record",
        version: "1.3",
        createdBy: "NUR001",
        dohCompliant: false,
        requiredFields: [
          "medication_list",
          "administration_times",
          "patient_response",
          "adverse_reactions",
        ],
        completedFields: [],
        validationErrors: ["Form not started"],
        offlineCapable: true,
        syncStatus: "pending",
      },
    ],
  },
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EpisodeEvent | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ClinicalForm | null>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileOptimized, setMobileOptimized] = useState(false);
  const [voiceIntegrated, setVoiceIntegrated] = useState(false);
  const [cameraIntegrated, setCameraIntegrated] = useState(false);
  const [touchEnabled, setTouchEnabled] = useState(false);
  const [offlineCapable, setOfflineCapable] = useState(false);
  const [realTimeSync, setRealTimeSync] = useState(false);
  const [enhancedFeatures, setEnhancedFeatures] = useState({
    voiceNotes: false,
    cameraCapture: false,
    offlineSync: false,
    realTimeCollaboration: false,
    aiInsights: false,
  });
  const [bedsideVisitValidation, setBedsideVisitValidation] = useState({
    visitIntegration: 0,
    clinicianTracking: 0,
    documentationCompleteness: 0,
    multidisciplinaryTeam: 0,
    patientJourneyIntegration: 0,
    issues: [],
    recommendations: [],
    lastValidated: null,
    validationInProgress: false,
  });
  const [episodeValidationMetrics, setEpisodeValidationMetrics] = useState({
    overallHealth: 0,
    criticalIssues: 0,
    highPriorityIssues: 0,
    totalRecommendations: 0,
    lastAssessment: null,
  });
  const { handleSuccess, handleApiError } = useErrorHandler();

  // Initialize component with enhanced mobile and offline capabilities
  useEffect(() => {
    initializeComponent();
    initializeMobileFeatures();
    initializeOfflineCapabilities();
    validateBedsideVisitIntegration();
  }, []);

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

      // Initialize voice capabilities
      try {
        const { mobileCommunicationService } = await import(
          "@/services/mobile-communication.service"
        );
        const voiceSupported =
          mobileCommunicationService.isVoiceRecognitionSupported();
        setVoiceIntegrated(voiceSupported);

        if (voiceSupported) {
          setEnhancedFeatures((prev) => ({ ...prev, voiceNotes: true }));
        }
      } catch (error) {
        console.warn("Voice integration not available:", error);
      }

      // Initialize camera capabilities
      try {
        const { mobileCommunicationService } = await import(
          "@/services/mobile-communication.service"
        );
        const cameraStatus =
          await mobileCommunicationService.initializeCameraIntegration();
        setCameraIntegrated(cameraStatus.supported);

        if (cameraStatus.supported) {
          setEnhancedFeatures((prev) => ({ ...prev, cameraCapture: true }));
        }
      } catch (error) {
        console.warn("Camera integration not available:", error);
      }

      console.log("Mobile features initialized:", {
        mobile: isMobile,
        touch: "ontouchstart" in window,
        voice: voiceIntegrated,
        camera: cameraIntegrated,
      });
    } catch (error) {
      console.error("Failed to initialize mobile features:", error);
    }
  };

  const initializeOfflineCapabilities = async () => {
    try {
      const { offlineService } = await import("@/services/offline.service");
      await offlineService.init();
      setOfflineCapable(true);
      setEnhancedFeatures((prev) => ({ ...prev, offlineSync: true }));

      // Initialize mobile offline sync if supported
      const mobileSync = await offlineService.initializeMobileOfflineSync();
      if (mobileSync.success) {
        setEnhancedFeatures((prev) => ({
          ...prev,
          realTimeCollaboration: true,
        }));
        console.log(
          "Mobile offline sync initialized with capabilities:",
          mobileSync.capabilities,
        );
      }
    } catch (error) {
      console.warn("Offline capabilities not available:", error);
    }
  };

  const initializeComponent = async () => {
    try {
      setIsLoading(true);

      // Load episode data if not provided
      if (!episodeData && episodeId) {
        const { data, error } = await EpisodeService.getEpisode(episodeId);
        if (error) {
          handleApiError(error, "Loading episode data");
          return;
        }
        // Set episode data from API
      }

      // Set up real-time subscriptions
      if (episodeId) {
        const subscription = RealtimeService.subscribeToEpisode(
          episodeId,
          (payload) => {
            console.log("Episode updated:", payload);
            // Handle real-time updates
          },
        );

        return () => {
          RealtimeService.unsubscribe(`episode-${episodeId}`);
        };
      }
    } catch (error) {
      handleApiError(error, "Episode initialization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceNote = async () => {
    if (!voiceRecording) {
      try {
        setVoiceRecording(true);
        const { mobileCommunicationService } = await import(
          "@/services/mobile-communication.service"
        );

        const voiceResult =
          await mobileCommunicationService.startEnhancedVoiceRecognition({
            language: "en",
            medicalTerminology: true,
            continuousRecognition: true,
            interimResults: true,
            medicalSpecialty: "nursing",
            offlineMode: isOffline,
            realTimeTranscription: true,
            speakerIdentification: false,
          });

        if (voiceResult?.success) {
          // Set up voice recognition callback
          mobileCommunicationService.onVoiceRecognitionResult((result) => {
            if (result?.transcript) {
              // Process voice input for clinical insights
              processVoiceTranscript(result.transcript, result.isFinal);
            }
          });
          handleSuccess("Voice recording started - speak your clinical notes");
        } else {
          throw new Error(
            voiceResult?.error || "Failed to start voice recognition",
          );
        }
      } catch (error) {
        handleApiError(error, "Starting voice recording");
        setVoiceRecording(false);
      }
    } else {
      try {
        const { mobileCommunicationService } = await import(
          "@/services/mobile-communication.service"
        );
        mobileCommunicationService.stopVoiceRecognition();
        handleSuccess("Voice recording stopped");
      } catch (error) {
        console.error("Failed to stop voice recognition:", error);
      }
      setVoiceRecording(false);
    }
  };

  const processVoiceTranscript = async (
    transcript: string,
    isFinal: boolean,
  ) => {
    if (!transcript || typeof transcript !== "string") return;

    try {
      // Process transcript for clinical insights using NLP
      const { naturalLanguageProcessingService } = await import(
        "@/services/natural-language-processing.service"
      );

      const clinicalAnalysis =
        await naturalLanguageProcessingService.processClinicalNote(transcript, {
          language: "en",
          includeCodeSuggestions: true,
          includeSentimentAnalysis: true,
        });

      if (clinicalAnalysis && isFinal) {
        // Save voice note to episode
        const voiceNote = {
          id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transcript,
          audioUrl: null, // Would contain actual audio URL in production
          duration: 0, // Would contain actual duration
          recordedAt: new Date().toISOString(),
          clinicalAnalysis,
          entities: clinicalAnalysis.entities,
          codingSuggestions: clinicalAnalysis.codingSuggestions,
        };

        // Add to episode events or save offline
        if (isOffline) {
          await handleSaveOffline({
            type: "voice_note",
            episodeId,
            patientId,
            data: voiceNote,
          });
        }

        handleSuccess(
          `Voice note processed - found ${clinicalAnalysis.entities.length} clinical entities`,
        );
      }
    } catch (error) {
      console.error("Voice transcript processing failed:", error);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { mobileCommunicationService } = await import(
        "@/services/mobile-communication.service"
      );

      const cameraStatus =
        await mobileCommunicationService.initializeCameraIntegration();

      if (!cameraStatus.supported) {
        handleApiError(
          new Error("Camera not supported on this device"),
          "Camera initialization",
        );
        return;
      }

      if (!cameraStatus.permissions.camera) {
        handleApiError(
          new Error("Camera permission required for wound documentation"),
          "Camera permissions",
        );
        return;
      }

      const result = await mobileCommunicationService.captureWoundImage({
        facingMode: "environment",
        resolution: { width: 1920, height: 1080 },
        annotations: {
          measurements: [],
          notes: [
            `Episode: ${episodeId}`,
            `Patient: ${patientId}`,
            `Captured: ${new Date().toLocaleString()}`,
            "Clinical documentation image",
          ],
          timestamp: new Date().toISOString(),
        },
      });

      if (result.success && result.imageData) {
        // Create attachment record
        const attachment = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "image" as const,
          filename: `clinical_image_${new Date().toISOString().split("T")[0]}.jpg`,
          url: result.imageData.dataUrl,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.id || "unknown",
          metadata: result.imageData.metadata,
        };

        // Save to offline storage if offline
        if (isOffline) {
          await handleSaveOffline({
            type: "clinical_image",
            episodeId,
            patientId,
            data: attachment,
          });
        }

        const fileSize = result.imageData.metadata?.fileSize || 0;
        handleSuccess(
          `Clinical image captured successfully (${Math.round(fileSize / 1024)}KB)`,
        );
      } else {
        throw new Error(result.error || "Failed to capture image");
      }
    } catch (error) {
      handleApiError(error, "Camera capture");
    }
  };

  const handleSaveOffline = async (data: any) => {
    try {
      if (isOffline) {
        const { offlineService } = await import("@/services/offline.service");

        await offlineService.saveClinicalForm({
          type: data.type || "episode_update",
          patientId: patientId,
          data: {
            episodeId,
            updateData: data,
            timestamp: new Date().toISOString(),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language,
            },
          },
          status: "draft",
        });

        handleSuccess(
          "Data saved offline - will sync when connection is restored",
        );
      } else {
        // If online, save directly to database
        try {
          const { data: savedData, error } = await EpisodeService.updateEpisode(
            episodeId,
            {
              updated_at: new Date().toISOString(),
              metadata: {
                ...data,
                lastModified: new Date().toISOString(),
                modifiedBy: currentUser?.id,
              },
            },
          );

          if (error) {
            throw error;
          }

          handleSuccess("Episode data saved successfully");
        } catch (error) {
          // Fallback to offline storage if online save fails
          await this.handleSaveOffline(data);
        }
      }
    } catch (error) {
      handleApiError(error, "Saving episode data");
    }
  };

  /**
   * Validate Bedside Visit Integration for Nurses, Therapists, and Doctors
   */
  const validateBedsideVisitIntegration = async () => {
    try {
      const validation = {
        visitIntegration: 0,
        clinicianTracking: 0,
        documentationCompleteness: 0,
        multidisciplinaryTeam: 0,
        patientJourneyIntegration: 0,
        issues: [],
        recommendations: [],
      };

      // 1. Visit Integration Assessment
      const visitIntegration = await assessVisitIntegration();
      validation.visitIntegration = visitIntegration.score;
      validation.issues.push(...visitIntegration.issues);
      validation.recommendations.push(...visitIntegration.recommendations);

      // 2. Clinician Tracking Validation
      const clinicianTracking = await validateClinicianTracking();
      validation.clinicianTracking = clinicianTracking.score;
      validation.issues.push(...clinicianTracking.issues);
      validation.recommendations.push(...clinicianTracking.recommendations);

      // 3. Documentation Completeness Check
      const documentationCompleteness = await checkDocumentationCompleteness();
      validation.documentationCompleteness = documentationCompleteness.score;
      validation.issues.push(...documentationCompleteness.issues);
      validation.recommendations.push(
        ...documentationCompleteness.recommendations,
      );

      // 4. Multidisciplinary Team Assessment
      const multidisciplinaryTeam = await assessMultidisciplinaryTeam();
      validation.multidisciplinaryTeam = multidisciplinaryTeam.score;
      validation.issues.push(...multidisciplinaryTeam.issues);
      validation.recommendations.push(...multidisciplinaryTeam.recommendations);

      // 5. Patient Journey Integration
      const patientJourneyIntegration =
        await validatePatientJourneyIntegration();
      validation.patientJourneyIntegration = patientJourneyIntegration.score;
      validation.issues.push(...patientJourneyIntegration.issues);
      validation.recommendations.push(
        ...patientJourneyIntegration.recommendations,
      );

      // Enhanced validation with timestamp and progress tracking
      const enhancedValidation = {
        ...validation,
        lastValidated: new Date().toISOString(),
        validationInProgress: false,
      };

      setBedsideVisitValidation(enhancedValidation);

      // Update episode validation metrics
      const overallScore = Math.round(
        (validation.visitIntegration +
          validation.clinicianTracking +
          validation.documentationCompleteness +
          validation.multidisciplinaryTeam +
          validation.patientJourneyIntegration) /
          5,
      );

      setEpisodeValidationMetrics({
        overallHealth: overallScore,
        criticalIssues: validation.issues.filter(
          (i) => i.severity === "critical",
        ).length,
        highPriorityIssues: validation.issues.filter(
          (i) => i.severity === "high",
        ).length,
        totalRecommendations: validation.recommendations.length,
        lastAssessment: new Date().toISOString(),
      });

      // Enhanced logging with actionable insights
      console.log("🏠 Enhanced Bedside Visit Integration Validation:", {
        timestamp: new Date().toISOString(),
        overallScore,
        healthStatus:
          overallScore >= 90
            ? "EXCELLENT"
            : overallScore >= 75
              ? "GOOD"
              : overallScore >= 60
                ? "NEEDS_IMPROVEMENT"
                : "CRITICAL",
        breakdown: {
          visitIntegration: validation.visitIntegration,
          clinicianTracking: validation.clinicianTracking,
          documentationCompleteness: validation.documentationCompleteness,
          multidisciplinaryTeam: validation.multidisciplinaryTeam,
          patientJourneyIntegration: validation.patientJourneyIntegration,
        },
        issuesSummary: {
          total: validation.issues.length,
          critical: validation.issues.filter((i) => i.severity === "critical")
            .length,
          high: validation.issues.filter((i) => i.severity === "high").length,
          medium: validation.issues.filter((i) => i.severity === "medium")
            .length,
          low: validation.issues.filter((i) => i.severity === "low").length,
        },
        actionableRecommendations: validation.recommendations.slice(0, 5),
        nextValidationDue: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(), // 24 hours from now
      });

      // Trigger alerts for critical issues
      const criticalIssues = validation.issues.filter(
        (i) => i.severity === "critical",
      );
      if (criticalIssues.length > 0) {
        handleSuccess(
          `⚠️ ${criticalIssues.length} critical bedside visit integration issues detected. Immediate attention required.`,
        );
      }

      return enhancedValidation;
    } catch (error) {
      console.error("❌ Bedside Visit Integration Validation Failed:", error);
      return null;
    }
  };

  /**
   * Assess Visit Integration in Patient Journey
   */
  const assessVisitIntegration = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check if visits are properly recorded in episode events
      const visitEvents =
        episodeData?.events?.filter(
          (e) =>
            e.type === "visit" ||
            e.type === "therapy_session" ||
            e.type === "assessment" ||
            e.type === "wound_care" ||
            e.type === "medication_admin",
        ) || [];

      if (visitEvents.length === 0) {
        issues.push({
          type: "visit_integration",
          severity: "critical",
          message: "No bedside visits recorded in patient episode",
          component: "VisitTracking",
        });
        score -= 50;
        recommendations.push(
          "Implement comprehensive bedside visit tracking system",
        );
      } else if (visitEvents.length < 3) {
        issues.push({
          type: "visit_integration",
          severity: "medium",
          message:
            "Limited bedside visit records - may indicate incomplete tracking",
          component: "VisitFrequency",
        });
        score -= 20;
        recommendations.push(
          "Increase frequency of bedside visit documentation",
        );
      }

      // Check visit scheduling integration
      const scheduledVisits = visitEvents.filter(
        (e) => e.status === "scheduled",
      );
      const completedVisits = visitEvents.filter(
        (e) => e.status === "completed",
      );

      if (scheduledVisits.length === 0 && completedVisits.length > 0) {
        issues.push({
          type: "visit_integration",
          severity: "medium",
          message:
            "No scheduled visits found - scheduling system may not be integrated",
          component: "VisitScheduling",
        });
        score -= 15;
        recommendations.push(
          "Integrate visit scheduling system with patient episode tracking",
        );
      }

      // Check visit location tracking
      const visitsWithLocation = visitEvents.filter(
        (e) => e.location && e.location !== "",
      );
      if (visitsWithLocation.length < visitEvents.length * 0.8) {
        issues.push({
          type: "visit_integration",
          severity: "low",
          message: "Some visits lack location information",
          component: "LocationTracking",
        });
        score -= 10;
        recommendations.push(
          "Ensure all bedside visits include location information",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Visit integration assessment failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Visit integration assessment system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix visit integration assessment system"],
      };
    }
  };

  /**
   * Validate Clinician Tracking and Assignment
   */
  const validateClinicianTracking = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      const visitEvents =
        episodeData?.events?.filter(
          (e) =>
            e.type === "visit" ||
            e.type === "therapy_session" ||
            e.type === "assessment",
        ) || [];

      // Check clinician assignment
      const visitsWithoutClinician = visitEvents.filter(
        (e) => !e.clinician || !e.clinicianId,
      );
      if (visitsWithoutClinician.length > 0) {
        issues.push({
          type: "clinician_tracking",
          severity: "high",
          message: `${visitsWithoutClinician.length} visits lack proper clinician assignment`,
          component: "ClinicianAssignment",
        });
        score -= visitsWithoutClinician.length * 15;
        recommendations.push(
          "Ensure all bedside visits have assigned clinicians with proper identification",
        );
      }

      // Check care team integration
      const careTeamMembers = episodeData?.careTeam || [];
      const visitClinicians = new Set(
        visitEvents.map((e) => e.clinicianId).filter(Boolean),
      );
      const careTeamIds = new Set(careTeamMembers.map((m) => m.id));

      const unregisteredClinicians = Array.from(visitClinicians).filter(
        (id) => !careTeamIds.has(id),
      );
      if (unregisteredClinicians.length > 0) {
        issues.push({
          type: "clinician_tracking",
          severity: "medium",
          message: `${unregisteredClinicians.length} clinicians conducting visits are not in care team registry`,
          component: "CareTeamIntegration",
        });
        score -= unregisteredClinicians.length * 10;
        recommendations.push(
          "Ensure all visiting clinicians are registered in the care team",
        );
      }

      // Check clinician license tracking
      const cliniciansWithoutLicense = careTeamMembers.filter(
        (m) => !m.licenseNumber,
      );
      if (cliniciansWithoutLicense.length > 0) {
        issues.push({
          type: "clinician_tracking",
          severity: "high",
          message: `${cliniciansWithoutLicense.length} care team members lack license number tracking`,
          component: "LicenseTracking",
        });
        score -= cliniciansWithoutLicense.length * 12;
        recommendations.push(
          "Track and validate all clinician license numbers for compliance",
        );
      }

      // Check active status tracking
      const inactiveClinicians = careTeamMembers.filter((m) => !m.isActive);
      if (inactiveClinicians.length > 0) {
        issues.push({
          type: "clinician_tracking",
          severity: "medium",
          message: `${inactiveClinicians.length} care team members marked as inactive`,
          component: "ActiveStatusTracking",
        });
        score -= inactiveClinicians.length * 8;
        recommendations.push(
          "Review and update care team member active status regularly",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Clinician tracking validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Clinician tracking validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix clinician tracking validation system"],
      };
    }
  };

  /**
   * Check Documentation Completeness for Bedside Visits
   */
  const checkDocumentationCompleteness = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      const visitEvents =
        episodeData?.events?.filter(
          (e) =>
            e.type === "visit" ||
            e.type === "therapy_session" ||
            e.type === "assessment",
        ) || [];

      // Check documentation completion status
      const incompleteDocumentation = visitEvents.filter(
        (e) => !e.documentationComplete,
      );
      if (incompleteDocumentation.length > 0) {
        issues.push({
          type: "documentation_completeness",
          severity: "high",
          message: `${incompleteDocumentation.length} visits have incomplete documentation`,
          component: "DocumentationStatus",
        });
        score -= incompleteDocumentation.length * 20;
        recommendations.push(
          "Complete documentation for all bedside visits to ensure continuity of care",
        );
      }

      // Check vital signs documentation
      const visitsWithoutVitals = visitEvents.filter(
        (e) => !e.vitalSigns || Object.keys(e.vitalSigns || {}).length === 0,
      );
      if (visitsWithoutVitals.length > visitEvents.length * 0.5) {
        issues.push({
          type: "documentation_completeness",
          severity: "medium",
          message: "Many visits lack vital signs documentation",
          component: "VitalSignsDocumentation",
        });
        score -= 15;
        recommendations.push(
          "Ensure vital signs are documented for appropriate visit types",
        );
      }

      // Check outcomes documentation
      const visitsWithoutOutcomes = visitEvents.filter(
        (e) => !e.outcomes && !e.complications,
      );
      if (visitsWithoutOutcomes.length > visitEvents.length * 0.3) {
        issues.push({
          type: "documentation_completeness",
          severity: "medium",
          message: "Many visits lack outcomes or complications documentation",
          component: "OutcomesDocumentation",
        });
        score -= 10;
        recommendations.push(
          "Document visit outcomes and any complications for all bedside visits",
        );
      }

      // Check follow-up requirements
      const visitsRequiringFollowUp = visitEvents.filter(
        (e) => e.followUpRequired,
      );
      const visitsWithFollowUpPlanned = visitsRequiringFollowUp.filter(
        (e) => e.nextAppointment,
      );

      if (visitsRequiringFollowUp.length > visitsWithFollowUpPlanned.length) {
        const missingFollowUps =
          visitsRequiringFollowUp.length - visitsWithFollowUpPlanned.length;
        issues.push({
          type: "documentation_completeness",
          severity: "medium",
          message: `${missingFollowUps} visits requiring follow-up lack scheduled next appointments`,
          component: "FollowUpPlanning",
        });
        score -= missingFollowUps * 8;
        recommendations.push(
          "Schedule follow-up appointments for all visits that require them",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Documentation completeness check failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Documentation completeness check system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix documentation completeness check system"],
      };
    }
  };

  /**
   * Assess Multidisciplinary Team Representation
   */
  const assessMultidisciplinaryTeam = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      const visitEvents =
        episodeData?.events?.filter(
          (e) =>
            e.type === "visit" ||
            e.type === "therapy_session" ||
            e.type === "assessment",
        ) || [];

      // Analyze clinician types from visits
      const clinicianTypes = new Set();
      visitEvents.forEach((event) => {
        if (event.clinician) {
          const clinician = event.clinician.toLowerCase();
          if (clinician.includes("nurse")) clinicianTypes.add("nurse");
          else if (clinician.includes("doctor") || clinician.includes("dr."))
            clinicianTypes.add("doctor");
          else if (
            clinician.includes("pt ") ||
            clinician.includes("physiotherapist")
          )
            clinicianTypes.add("physiotherapist");
          else if (
            clinician.includes("ot ") ||
            clinician.includes("occupational")
          )
            clinicianTypes.add("occupational_therapist");
          else if (clinician.includes("speech"))
            clinicianTypes.add("speech_therapist");
          else if (clinician.includes("respiratory"))
            clinicianTypes.add("respiratory_therapist");
          else if (clinician.includes("social"))
            clinicianTypes.add("social_worker");
          else if (
            clinician.includes("nutrition") ||
            clinician.includes("dietitian")
          )
            clinicianTypes.add("nutritionist");
        }
      });

      // Check for essential team members based on diagnosis
      const requiredTypes = ["nurse", "doctor"];
      const recommendedTypes = ["physiotherapist"];

      // Add specific requirements based on diagnosis
      if (episodeData?.primaryDiagnosis?.toLowerCase().includes("heart")) {
        recommendedTypes.push("nutritionist");
      }
      if (
        episodeData?.secondaryDiagnoses?.some((d) =>
          d.toLowerCase().includes("diabetes"),
        )
      ) {
        recommendedTypes.push("nutritionist");
      }

      // Check required team members
      const missingRequired = requiredTypes.filter(
        (type) => !clinicianTypes.has(type),
      );
      if (missingRequired.length > 0) {
        issues.push({
          type: "multidisciplinary_team",
          severity: "critical",
          message: `Missing essential team members: ${missingRequired.join(", ")}`,
          component: "EssentialTeamMembers",
        });
        score -= missingRequired.length * 30;
        recommendations.push(
          `Ensure essential team members (${missingRequired.join(", ")}) are involved in bedside care`,
        );
      }

      // Check recommended team members
      const missingRecommended = recommendedTypes.filter(
        (type) => !clinicianTypes.has(type),
      );
      if (missingRecommended.length > 0) {
        issues.push({
          type: "multidisciplinary_team",
          severity: "medium",
          message: `Missing recommended team members: ${missingRecommended.join(", ")}`,
          component: "RecommendedTeamMembers",
        });
        score -= missingRecommended.length * 15;
        recommendations.push(
          `Consider involving recommended team members (${missingRecommended.join(", ")}) based on patient condition`,
        );
      }

      // Check team coordination
      const careTeamSize = episodeData?.careTeam?.length || 0;
      if (careTeamSize < 3) {
        issues.push({
          type: "multidisciplinary_team",
          severity: "medium",
          message: "Small care team size may limit comprehensive care delivery",
          component: "TeamSize",
        });
        score -= 10;
        recommendations.push(
          "Expand care team to include more disciplines for comprehensive patient care",
        );
      }

      // Check team communication
      const recentActivity =
        episodeData?.careTeam?.filter((m) => {
          if (!m.lastActivity) return false;
          const lastActive = new Date(m.lastActivity);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastActive > weekAgo;
        }) || [];

      if (recentActivity.length < careTeamSize * 0.7) {
        issues.push({
          type: "multidisciplinary_team",
          severity: "medium",
          message:
            "Low recent activity from care team members indicates poor coordination",
          component: "TeamCommunication",
        });
        score -= 15;
        recommendations.push(
          "Improve care team communication and coordination mechanisms",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Multidisciplinary team assessment failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Multidisciplinary team assessment system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix multidisciplinary team assessment system"],
      };
    }
  };

  /**
   * Validate Patient Journey Integration with Bedside Visits
   */
  const validatePatientJourneyIntegration = async () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check timeline integration
      const allEvents = episodeData?.events || [];
      const visitEvents = allEvents.filter(
        (e) =>
          e.type === "visit" ||
          e.type === "therapy_session" ||
          e.type === "assessment",
      );

      if (visitEvents.length === 0) {
        issues.push({
          type: "patient_journey_integration",
          severity: "critical",
          message: "No bedside visits integrated into patient journey timeline",
          component: "TimelineIntegration",
        });
        score -= 40;
        recommendations.push(
          "Integrate all bedside visits into the patient journey timeline",
        );
      }

      // Check chronological ordering
      const sortedEvents = [...allEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const isChronological =
        JSON.stringify(allEvents.map((e) => e.date)) ===
        JSON.stringify(sortedEvents.map((e) => e.date));

      if (!isChronological) {
        issues.push({
          type: "patient_journey_integration",
          severity: "medium",
          message: "Patient journey events are not in chronological order",
          component: "ChronologicalOrdering",
        });
        score -= 15;
        recommendations.push(
          "Ensure patient journey events are displayed in chronological order",
        );
      }

      // Check care continuity
      const visitDates = visitEvents
        .map((e) => new Date(e.date))
        .sort((a, b) => a.getTime() - b.getTime());
      let largeGaps = 0;

      for (let i = 1; i < visitDates.length; i++) {
        const daysDiff =
          (visitDates[i].getTime() - visitDates[i - 1].getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysDiff > 7) largeGaps++;
      }

      if (largeGaps > 0) {
        issues.push({
          type: "patient_journey_integration",
          severity: "low",
          message: `${largeGaps} gaps of more than 7 days between visits detected`,
          component: "CareContinuity",
        });
        score -= largeGaps * 5;
        recommendations.push(
          "Review care continuity and consider more frequent visits if clinically appropriate",
        );
      }

      // Check goal alignment
      const goals = episodeData?.goals || [];
      const goalRelatedEvents = allEvents.filter(
        (e) =>
          e.description?.toLowerCase().includes("goal") ||
          e.outcomes?.toLowerCase().includes("goal") ||
          goals.some((g) =>
            e.description
              ?.toLowerCase()
              .includes(g.description.toLowerCase().substring(0, 20)),
          ),
      );

      if (goals.length > 0 && goalRelatedEvents.length === 0) {
        issues.push({
          type: "patient_journey_integration",
          severity: "medium",
          message:
            "Patient care goals are not reflected in bedside visit activities",
          component: "GoalAlignment",
        });
        score -= 20;
        recommendations.push(
          "Align bedside visit activities with established patient care goals",
        );
      }

      return { score: Math.max(0, score), issues, recommendations };
    } catch (error) {
      console.error("Patient journey integration validation failed:", error);
      return {
        score: 0,
        issues: [
          {
            type: "system_error",
            severity: "critical",
            message: "Patient journey integration validation system failure",
            component: "ValidationSystem",
          },
        ],
        recommendations: ["Fix patient journey integration validation system"],
      };
    }
  };

  const handleEventClick = (event: EpisodeEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleFormClick = (form: ClinicalForm) => {
    setSelectedForm(form);
    setShowFormDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "assessment":
        return <FileText className="h-4 w-4" />;
      case "visit":
        return <User className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "compliance":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm w-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading episode data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      {/* Enhanced Offline Status Banner */}
      {isOffline && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Offline Mode Active</strong>
                <p className="text-sm mt-1">
                  Changes will be saved locally and synced when connection is
                  restored. Voice notes and images are fully supported offline.
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                Offline Capable
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Bedside Visit Integration Issues */}
      {bedsideVisitValidation.issues.length > 0 && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Bedside Visit Integration Issues</strong>
                <p className="text-sm mt-1">
                  {bedsideVisitValidation.issues.length} issues detected in
                  bedside visit tracking and integration.
                  {bedsideVisitValidation.issues.filter(
                    (i) => i.severity === "critical",
                  ).length > 0 &&
                    ` ${bedsideVisitValidation.issues.filter((i) => i.severity === "critical").length} critical issues require immediate attention.`}
                </p>
              </div>
              <div className="flex gap-1">
                <Badge
                  variant="outline"
                  className="text-xs border-orange-300 text-orange-700"
                >
                  {
                    bedsideVisitValidation.issues.filter(
                      (i) => i.severity === "critical",
                    ).length
                  }{" "}
                  Critical
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs border-yellow-300 text-yellow-700"
                >
                  {
                    bedsideVisitValidation.issues.filter(
                      (i) => i.severity === "high",
                    ).length
                  }{" "}
                  High
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Mobile Features Banner */}
      {mobileOptimized && (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Mobile-Optimized Experience</strong>
                <p className="text-sm mt-1">
                  Touch-optimized interface with voice input and camera
                  integration enabled.
                </p>
              </div>
              <div className="flex gap-1">
                {voiceIntegrated && (
                  <Badge variant="outline" className="text-xs">
                    Voice
                  </Badge>
                )}
                {cameraIntegrated && (
                  <Badge variant="outline" className="text-xs">
                    Camera
                  </Badge>
                )}
                {touchEnabled && (
                  <Badge variant="outline" className="text-xs">
                    Touch
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Active Alerts */}
      {episodeData.alerts?.filter((alert) => alert.isActive).length > 0 && (
        <div className="mb-4 space-y-2">
          {episodeData.alerts
            .filter((alert) => alert.isActive)
            .map((alert) => (
              <Alert
                key={alert.id}
                className={`${
                  alert.severity === "critical"
                    ? "border-red-200 bg-red-50"
                    : alert.severity === "warning"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.type.toUpperCase()}:</strong> {alert.message}
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Episode of Care</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{episodeData.id}</Badge>
            <Badge className={getStatusColor(episodeData.status)}>
              {episodeData.status.charAt(0).toUpperCase() +
                episodeData.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEventDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button variant="outline" onClick={handleVoiceNote}>
            <Mic
              className={`h-4 w-4 mr-2 ${voiceRecording ? "text-red-500" : ""}`}
            />
            {voiceRecording ? "Stop Recording" : "Voice Note"}
          </Button>
          <Button variant="outline" onClick={handleCameraCapture}>
            <Camera className="h-4 w-4 mr-2" />
            Capture
          </Button>
          <Button onClick={() => setShowFormDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Care Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{episodeData.careType}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Primary Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {episodeData.primaryDiagnosis}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DOH Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress value={episodeData.complianceScore} className="h-2" />
              <span className="text-lg font-medium">
                {episodeData.complianceScore}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress
                value={episodeData.qualityScore}
                className="h-2 bg-green-100"
              />
              <span className="text-lg font-medium text-green-600">
                {episodeData.qualityScore}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Start Date: {episodeData.startDate}
          </span>
        </div>
        {episodeData.endDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              End Date: {episodeData.endDate}
            </span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-10 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="care-team">Care Team</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
          <TabsTrigger value="daman-auth">Daman Auth</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Episode Summary</CardTitle>
              <CardDescription>
                Key information about this episode of care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Care Plan Goals</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Improve mobility and independence in activities of daily
                      living
                    </li>
                    <li>
                      Stabilize vital signs and manage heart failure symptoms
                    </li>
                    <li>
                      Prevent hospital readmission within 30 days of discharge
                    </li>
                    <li>
                      Educate patient and caregiver on medication management
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-red-50 rounded-md border border-red-100">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-muted-foreground">
                          Blood Pressure
                        </p>
                      </div>
                      <p className="font-medium text-red-600">130/85 mmHg</p>
                      <p className="text-xs text-red-500">Slightly elevated</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <p className="text-sm text-muted-foreground">
                          Heart Rate
                        </p>
                      </div>
                      <p className="font-medium text-blue-600">78 bpm</p>
                      <p className="text-xs text-blue-500">Normal</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md border border-green-100">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">
                          Oxygen Saturation
                        </p>
                      </div>
                      <p className="font-medium text-green-600">96%</p>
                      <p className="text-xs text-green-500">Good</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-md border border-orange-100">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <p className="text-sm text-muted-foreground">
                          Temperature
                        </p>
                      </div>
                      <p className="font-medium text-orange-600">36.7°C</p>
                      <p className="text-xs text-orange-500">Normal</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Current Goals Progress</h4>
                  <div className="space-y-3">
                    {episodeData.goals?.map((goal) => (
                      <div key={goal.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">
                            {goal.description}
                          </p>
                          <Badge
                            className={
                              goal.status === "active"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={goal.progress} className="h-2" />
                          <span className="text-sm font-medium">
                            {goal.progress}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Target:{" "}
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Visits</CardTitle>
              <CardDescription>Scheduled care team visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Nursing Visit</p>
                      <p className="text-sm text-muted-foreground">
                        June 30, 2023 - 10:00 AM
                      </p>
                    </div>
                  </div>
                  <Badge>Scheduled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Physiotherapy Session</p>
                      <p className="text-sm text-muted-foreground">
                        July 2, 2023 - 2:00 PM
                      </p>
                    </div>
                  </div>
                  <Badge>Scheduled</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Schedule New Visit
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Journey Timeline</CardTitle>
              <CardDescription>
                Chronological view of patient care activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {episodeData.events.map((event, index) => (
                  <div key={event.id} className="relative pl-6 pb-6">
                    {index < episodeData.events.length - 1 && (
                      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                    <div
                      className="bg-gray-50 p-4 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          {event.priority && (
                            <Badge className={getPriorityColor(event.priority)}>
                              {event.priority}
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{event.date}</span>
                          </div>
                          {event.clinician && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{event.clinician}</span>
                            </div>
                          )}
                          {event.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{event.duration} min</span>
                            </div>
                          )}
                        </div>
                        {event.attachments && event.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <FileText className="h-3 w-3" />
                            <span>
                              {event.attachments.length} attachment(s)
                            </span>
                          </div>
                        )}
                      </div>
                      {event.vitalSigns && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {event.vitalSigns.bloodPressure && (
                              <div>
                                <span className="text-muted-foreground">
                                  BP:
                                </span>
                                <span className="ml-1 font-medium">
                                  {event.vitalSigns.bloodPressure}
                                </span>
                              </div>
                            )}
                            {event.vitalSigns.heartRate && (
                              <div>
                                <span className="text-muted-foreground">
                                  HR:
                                </span>
                                <span className="ml-1 font-medium">
                                  {event.vitalSigns.heartRate} bpm
                                </span>
                              </div>
                            )}
                            {event.vitalSigns.temperature && (
                              <div>
                                <span className="text-muted-foreground">
                                  Temp:
                                </span>
                                <span className="ml-1 font-medium">
                                  {event.vitalSigns.temperature}°C
                                </span>
                              </div>
                            )}
                            {event.vitalSigns.oxygenSaturation && (
                              <div>
                                <span className="text-muted-foreground">
                                  O2:
                                </span>
                                <span className="ml-1 font-medium">
                                  {event.vitalSigns.oxygenSaturation}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Timeline Event
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Documentation</CardTitle>
              <CardDescription>
                Forms and clinical notes for this episode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {episodeData.clinicalForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleFormClick(form)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <FileText className="h-5 w-5 text-primary" />
                        {form.syncStatus === "pending" && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        {form.syncStatus === "conflict" && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{form.name}</p>
                          {form.dohCompliant && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200"
                            >
                              DOH
                            </Badge>
                          )}
                          {form.offlineCapable && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Offline
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {form.lastUpdated
                            ? `Last updated: ${form.lastUpdated}`
                            : "Not started"}
                        </p>
                        {form.validationErrors.length > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            {form.validationErrors.length} validation error(s)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={getStatusColor(form.status)}>
                          {form.status.charAt(0).toUpperCase() +
                            form.status.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1 mt-1">
                          <Progress
                            value={form.compliance}
                            className="h-1 w-16"
                          />
                          <span className="text-xs">{form.compliance}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Create New Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="care-team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Team</CardTitle>
              <CardDescription>
                Healthcare professionals involved in patient care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {episodeData.careTeam?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                        {member.specialty && (
                          <p className="text-xs text-muted-foreground">
                            {member.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            member.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {member.contactInfo?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.contactInfo.phone}</span>
                          </div>
                        )}
                        {member.contactInfo?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.contactInfo.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Patient emergency contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {episodeData.emergencyContacts?.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contact.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {contact.isPrimary && (
                        <Badge className="mb-1">Primary</Badge>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Goals & Outcomes</CardTitle>
              <CardDescription>
                Patient care objectives and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {episodeData.goals?.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{goal.description}</h4>
                      <Badge
                        className={
                          goal.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Progress value={goal.progress} className="h-2" />
                      <span className="text-sm font-medium">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Target Date:{" "}
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Measurable Outcomes:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {goal.measurableOutcomes.map((outcome, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
              <CardDescription>
                Identified risks and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {episodeData.riskFactors?.map((risk, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{risk.factor}</h4>
                      <Badge className={getPriorityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {risk.mitigation}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last assessed:{" "}
                      {new Date(risk.lastAssessed).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care-plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Plan of Care Integration
              </CardTitle>
              <CardDescription>
                Comprehensive care planning with DOH compliance and multidisciplinary coordination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Current Plan Status</h4>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan Version:</span>
                        <span className="font-medium">2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective Date:</span>
                        <span className="font-medium">2023-06-15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Review Date:</span>
                        <span className="font-medium">2023-07-15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion:</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3">Multidisciplinary Input Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Nursing Assessment</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Physician Review</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Approved</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Physical Therapy</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">In Progress</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Family Education</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Scheduled</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">Care Goals Progress</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Mobility Improvement</span>
                          <span className="text-sm font-bold">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Target: Walk 100m independently</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Medication Adherence</span>
                          <span className="text-sm font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Target: >95% compliance</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Vital Signs Stability</span>
                          <span className="text-sm font-bold">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Target: BP <140/90 consistently</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-3">Implementation Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Plan Development Complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Physician Approval Obtained</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Family Consent Documented</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Staff Training in Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Implementation Started</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Recent Plan Activities</h4>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Plan of Care Updated</p>
                      <p className="text-xs text-muted-foreground">Physical therapy goals revised based on progress assessment</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Family Education Completed</p>
                      <p className="text-xs text-muted-foreground">Medication management training provided to primary caregiver</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Multidisciplinary Review</p>
                      <p className="text-xs text-muted-foreground">Care team meeting conducted to review progress and adjust interventions</p>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Full Plan
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="daman-auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Daman Authorization Status
              </CardTitle>
              <CardDescription>
                Insurance authorization tracking and claims management for Daman - Thiqa coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">Current Authorization</h4>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Authorization Number:</span>
                        <span className="font-medium">AUTH-456789</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Policy Number:</span>
                        <span className="font-medium">THQ-2023-001234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid Until:</span>
                        <span className="font-medium">2024-12-31</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Approved Services:</span>
                        <span className="font-medium text-green-600">12 visits</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used Services:</span>
                        <span className="font-medium text-blue-600">4 visits</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span className="font-medium text-orange-600">8 visits</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">Coverage Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Coverage Type:</span>
                        <span className="font-medium">Daman - Thiqa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Copay Amount:</span>
                        <span className="font-medium">AED 50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deductible:</span>
                        <span className="font-medium">AED 500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage Percentage:</span>
                        <span className="font-medium text-green-600">80%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3">Authorization Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Initial Authorization</p>
                          <p className="text-xs text-muted-foreground">Approved for 12 home healthcare visits</p>
                          <p className="text-xs text-green-600">June 10, 2023 - Approved</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Pre-Authorization Review</p>
                          <p className="text-xs text-muted-foreground">Medical necessity documentation submitted</p>
                          <p className="text-xs text-blue-600">June 8, 2023 - Submitted</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Extension Request</p>
                          <p className="text-xs text-muted-foreground">Additional 6 visits requested</p>
                          <p className="text-xs text-orange-600">Pending Review</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-3">Claims Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Submitted Claims</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">4</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Approved Claims</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">3</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Claims</span>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">1</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Claimed</span>
                        <span className="font-medium text-green-600">AED 2,400</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Approved</span>
                        <span className="font-medium text-blue-600">AED 1,920</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Recent Authorization Activities</h4>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Claim
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Claim Approved - Visit #4</p>
                      <p className="text-xs text-muted-foreground">Nursing visit claim processed and approved - AED 480</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Extension Request Submitted</p>
                      <p className="text-xs text-muted-foreground">Requested additional 6 visits for continued physiotherapy</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <Upload className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Claim Submitted - Visit #3</p>
                      <p className="text-xs text-muted-foreground">Physiotherapy session claim submitted to Daman</p>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-green-700">Approval Rate</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">2.1</div>
                    <div className="text-sm text-blue-700">Avg Days to Approval</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">AED 1,920</div>
                    <div className="text-sm text-purple-700">Total Reimbursed</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View All Claims
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Submit New Claim
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Management
              </CardTitle>
              <CardDescription>
                Current medications, administration records, and adherence tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">Current Medications</h4>
                      <Badge className="bg-green-100 text-green-800">5 Active</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Lisinopril 10mg</p>
                          <p className="text-sm text-muted-foreground">Once daily, Oral</p>
                          <p className="text-xs text-green-600">Last taken: Today 8:00 AM</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">Taken</Badge>
                          <p className="text-xs text-muted-foreground">Next: Tomorrow 8:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Metformin 500mg</p>
                          <p className="text-sm text-muted-foreground">Twice daily, Oral</p>
                          <p className="text-xs text-orange-600">Due: Today 6:00 PM</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-orange-100 text-orange-800 mb-1">Due</Badge>
                          <p className="text-xs text-muted-foreground">Morning dose taken</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Furosemide 40mg</p>
                          <p className="text-sm text-muted-foreground">Once daily, Oral</p>
                          <p className="text-xs text-green-600">Last taken: Today 9:00 AM</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">Taken</Badge>
                          <p className="text-xs text-muted-foreground">Next: Tomorrow 9:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3">Medication Alerts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Allergy Alert</p>
                          <p className="text-xs text-red-600">Patient allergic to Penicillin - severe reaction</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Drug Interaction</p>
                          <p className="text-xs text-yellow-600">Monitor for Warfarin interactions with new medications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">Adherence Tracking</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Overall Adherence</span>
                          <span className="text-sm font-bold text-green-600">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Lisinopril</span>
                          <span className="text-sm font-bold">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Metformin</span>
                          <span className="text-sm font-bold">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Furosemide</span>
                          <span className="text-sm font-bold">94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-3">Administration Records</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Today's Doses</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">3/5 Taken</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Missed Doses (7 days)</span>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">2</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Side Effects Reported</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">0</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Medication Review</span>
                        <span className="text-muted-foreground">June 18, 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Recent Medication Activities</h4>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Administration
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lisinopril 10mg Administered</p>
                      <p className="text-xs text-muted-foreground">Administered by Nurse Fatima Al-Zahra at 8:00 AM</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Medication Reminder Set</p>
                      <p className="text-xs text-muted-foreground">Evening Metformin dose reminder scheduled for 6:00 PM</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Medication List Updated</p>
                      <p className="text-xs text-muted-foreground">Dosage adjustment for Furosemide documented by Dr. Sarah Ahmed</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Full History
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export MAR
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Equipment Management
              </CardTitle>
              <CardDescription>
                Medical equipment tracking, maintenance, and patient assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">Assigned Equipment</h4>
                      <Badge className="bg-green-100 text-green-800">4 Items</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Blood Pressure Monitor</p>
                          <p className="text-sm text-muted-foreground">Model: Omron HEM-7120 | Serial: BP001234</p>
                          <p className="text-xs text-green-600">Last calibrated: June 20, 2023</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">Active</Badge>
                          <p className="text-xs text-muted-foreground">Next service: Dec 2023</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Pulse Oximeter</p>
                          <p className="text-sm text-muted-foreground">Model: Nonin 9560 | Serial: PO005678</p>
                          <p className="text-xs text-green-600">Last calibrated: June 15, 2023</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">Active</Badge>
                          <p className="text-xs text-muted-foreground">Next service: Nov 2023</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Digital Thermometer</p>
                          <p className="text-sm text-muted-foreground">Model: Braun ThermoScan | Serial: TH009876</p>
                          <p className="text-xs text-orange-600">Calibration due: July 1, 2023</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-orange-100 text-orange-800 mb-1">Service Due</Badge>
                          <p className="text-xs text-muted-foreground">Overdue by 3 days</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">Weighing Scale</p>
                          <p className="text-sm text-muted-foreground">Model: Seca 803 | Serial: WS012345</p>
                          <p className="text-xs text-green-600">Last calibrated: June 10, 2023</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-1">Active</Badge>
                          <p className="text-xs text-muted-foreground">Next service: Dec 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3">Equipment Alerts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-white rounded border border-red-300">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Calibration Overdue</p>
                          <p className="text-xs text-red-600">Digital Thermometer requires immediate calibration</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white rounded border border-orange-300">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Maintenance Due</p>
                          <p className="text-xs text-orange-600">Blood Pressure Monitor service due in 2 weeks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">Usage Statistics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Equipment Utilization</span>
                          <span className="text-sm font-bold text-green-600">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-bold text-blue-600">24</div>
                          <div className="text-muted-foreground">BP Readings</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-bold text-green-600">18</div>
                          <div className="text-muted-foreground">O2 Sat Checks</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-bold text-purple-600">12</div>
                          <div className="text-muted-foreground">Weight Checks</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-bold text-orange-600">15</div>
                          <div className="text-muted-foreground">Temp Readings</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3">Maintenance Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Upcoming Services</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">3</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Overdue Services</span>
                        <Badge variant="outline" className="bg-red-50 text-red-700">1</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Equipment in Service</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">4/4</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Inventory Check</span>
                        <span className="text-muted-foreground">June 20, 2023</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-3">Quality Assurance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">All equipment DOH certified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Biomedical engineering approved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">1 item requires calibration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Insurance coverage verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Recent Equipment Activities</h4>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Usage
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Blood Pressure Reading Recorded</p>
                      <p className="text-xs text-muted-foreground">130/85 mmHg recorded using BP Monitor BP001234</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Equipment Calibration Completed</p>
                      <p className="text-xs text-muted-foreground">Pulse Oximeter PO005678 calibrated and certified</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Maintenance Alert Generated</p>
                      <p className="text-xs text-muted-foreground">Digital Thermometer TH009876 requires calibration</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Inventory
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Bedside Visit Integration Health */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-purple-900">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Bedside Visit Integration Health
                </div>
                <div className="flex items-center gap-2">
                  {episodeValidationMetrics.lastAssessment && (
                    <Badge variant="outline" className="text-xs">
                      Last:{" "}
                      {new Date(
                        episodeValidationMetrics.lastAssessment,
                      ).toLocaleDateString()}
                    </Badge>
                  )}
                  <Badge
                    className={`text-xs ${
                      episodeValidationMetrics.overallHealth >= 90
                        ? "bg-green-100 text-green-800 border-green-200"
                        : episodeValidationMetrics.overallHealth >= 75
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : episodeValidationMetrics.overallHealth >= 60
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {episodeValidationMetrics.overallHealth >= 90
                      ? "EXCELLENT"
                      : episodeValidationMetrics.overallHealth >= 75
                        ? "GOOD"
                        : episodeValidationMetrics.overallHealth >= 60
                          ? "NEEDS IMPROVEMENT"
                          : "CRITICAL"}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Real-time assessment of bedside visit tracking, clinician
                integration, and patient journey continuity
                {episodeValidationMetrics.criticalIssues > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                    ⚠️ {episodeValidationMetrics.criticalIssues} critical issues
                    require immediate attention
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Visit Integration
                    </span>
                    <span className="text-sm font-bold">
                      {bedsideVisitValidation.visitIntegration}%
                    </span>
                  </div>
                  <Progress
                    value={bedsideVisitValidation.visitIntegration}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Clinician Tracking
                    </span>
                    <span className="text-sm font-bold">
                      {bedsideVisitValidation.clinicianTracking}%
                    </span>
                  </div>
                  <Progress
                    value={bedsideVisitValidation.clinicianTracking}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Documentation Completeness
                    </span>
                    <span className="text-sm font-bold">
                      {bedsideVisitValidation.documentationCompleteness}%
                    </span>
                  </div>
                  <Progress
                    value={bedsideVisitValidation.documentationCompleteness}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Multidisciplinary Team
                    </span>
                    <span className="text-sm font-bold">
                      {bedsideVisitValidation.multidisciplinaryTeam}%
                    </span>
                  </div>
                  <Progress
                    value={bedsideVisitValidation.multidisciplinaryTeam}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">
                    Overall Bedside Visit Health
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {episodeValidationMetrics.overallHealth}%
                  </span>
                </div>
                <Progress
                  value={episodeValidationMetrics.overallHealth}
                  className="h-3 mb-3"
                />

                {/* Action Items Summary */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-red-600">
                      {episodeValidationMetrics.criticalIssues}
                    </div>
                    <div className="text-xs text-gray-600">Critical Issues</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-orange-600">
                      {episodeValidationMetrics.highPriorityIssues}
                    </div>
                    <div className="text-xs text-gray-600">High Priority</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-blue-600">
                      {episodeValidationMetrics.totalRecommendations}
                    </div>
                    <div className="text-xs text-gray-600">Recommendations</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => validateBedsideVisitIntegration()}
                    disabled={bedsideVisitValidation.validationInProgress}
                  >
                    <RefreshCw
                      className={`h-3 w-3 mr-1 ${bedsideVisitValidation.validationInProgress ? "animate-spin" : ""}`}
                    />
                    Re-validate
                  </Button>
                  {episodeValidationMetrics.criticalIssues > 0 && (
                    <Button size="sm" variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Address Critical
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Patient Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Progress
                    value={episodeData.patientSatisfactionScore}
                    className="h-2 bg-blue-100"
                  />
                  <span className="text-lg font-medium text-blue-600">
                    {episodeData.patientSatisfactionScore}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Documentation Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="h-2 bg-purple-100" />
                  <span className="text-lg font-medium text-purple-600">
                    92%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Care Coordination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="h-2 bg-orange-100" />
                  <span className="text-lg font-medium text-orange-600">
                    88%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Episode Analytics</CardTitle>
              <CardDescription>
                Key performance indicators and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Care Activities</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Visits</span>
                      <span className="font-medium">
                        {
                          episodeData.events.filter((e) => e.type === "visit")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Assessments</span>
                      <span className="font-medium">
                        {
                          episodeData.events.filter(
                            (e) => e.type === "assessment",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documents</span>
                      <span className="font-medium">
                        {episodeData.clinicalForms.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Forms</span>
                      <span className="font-medium">
                        {
                          episodeData.clinicalForms.filter(
                            (f) => f.status === "completed",
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Quality Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On-time Visits</span>
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documentation Timeliness</span>
                      <span className="font-medium text-blue-600">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Goal Achievement</span>
                      <span className="font-medium text-purple-600">73%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Safety Incidents</span>
                      <span className="font-medium text-green-600">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || "Event Details"}</DialogTitle>
            <DialogDescription>{selectedEvent?.description}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.date}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Clinician</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.clinician || "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.duration
                      ? `${selectedEvent.duration} minutes`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {selectedEvent.vitalSigns && (
                <div>
                  <Label className="text-sm font-medium">Vital Signs</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(selectedEvent.vitalSigns).map(
                      ([key, value]) =>
                        value && (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground">
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                            </span>
                            <span className="ml-1 font-medium">{value}</span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.outcomes && (
                <div>
                  <Label className="text-sm font-medium">Outcomes</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.outcomes}
                  </p>
                </div>
              )}

              {selectedEvent.attachments &&
                selectedEvent.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attachments</Label>
                    <div className="space-y-2 mt-2">
                      {selectedEvent.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{attachment.filename}</span>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Handle edit event
                setShowEventDialog(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Details Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedForm?.name || "Form Details"}</DialogTitle>
            <DialogDescription>
              Clinical form information and status
            </DialogDescription>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedForm.status)}>
                    {selectedForm.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Compliance</Label>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={selectedForm.compliance}
                      className="h-2 w-20"
                    />
                    <span className="text-sm">{selectedForm.compliance}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">DOH Compliant</Label>
                  <Badge
                    className={
                      selectedForm.dohCompliant
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedForm.dohCompliant ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sync Status</Label>
                  <Badge
                    className={
                      selectedForm.syncStatus === "synced"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {selectedForm.syncStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Progress</Label>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-green-600">
                    ✓ Completed: {selectedForm.completedFields?.join(", ")}
                  </div>
                  {selectedForm.requiredFields &&
                    selectedForm.completedFields && (
                      <div className="text-sm text-orange-600">
                        ⏳ Remaining:{" "}
                        {selectedForm.requiredFields
                          .filter(
                            (f) => !selectedForm.completedFields.includes(f),
                          )
                          .join(", ")}
                      </div>
                    )}
                </div>
              </div>

              {selectedForm.validationErrors &&
                selectedForm.validationErrors.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">
                      Validation Errors
                    </Label>
                    <ul className="mt-1 space-y-1">
                      {selectedForm.validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedForm.aiSuggestions &&
                selectedForm.aiSuggestions.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-blue-600">
                      AI Suggestions
                    </Label>
                    <div className="mt-1 space-y-2">
                      {selectedForm.aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 bg-blue-50 rounded text-sm"
                        >
                          <div className="font-medium">{suggestion.field}</div>
                          <div className="text-blue-700">
                            {suggestion.suggestion}
                          </div>
                          <div className="text-xs text-blue-600">
                            Confidence:{" "}
                            {Math.round(suggestion.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Handle open form for editing
                setShowFormDialog(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Open Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientEpisode;
