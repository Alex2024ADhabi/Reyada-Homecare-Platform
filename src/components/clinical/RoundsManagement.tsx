import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Stethoscope,
  Shield,
  ClipboardCheck,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
  Mic,
  Save,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Brain,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  Star,
  Award,
  Zap,
  Globe,
  Wifi,
  WifiOff,
} from "lucide-react";
import QualityRoundForm from "./QualityRoundForm";
import InfectionControlRoundForm from "./InfectionControlRoundForm";
import ClinicalRoundForm from "./ClinicalRoundForm";
import PhysicianRoundForm from "./PhysicianRoundForm";

// DOH Standards Mapping
const dohStandardsMapping = {
  qualityRound: {
    standard: "DOH/ST/HPS/PHHS/V2/2024",
    sections: ["3.5.11", "3.5.12"], // Quality management
    jawdaIndicators: ["Patient Safety", "Clinical Outcomes"],
  },
  infectionControlRound: {
    standard: "DOH Standards for Health Sector EHSMS",
    sections: ["Infection Prevention", "Environmental Safety"],
    requirements: ["Hand Hygiene", "PPE Usage", "Environmental Cleanliness"],
  },
  clinicalRound: {
    standard: "DOH Clinical Privileging Framework",
    sections: ["3.5.9", "3.5.14"], // Clinical practice scope
    careQuality: ["Patient Assessment", "Care Planning", "Documentation"],
  },
  physicianRound: {
    standard: "DOH/ST/HPS/PHHS/V2/2024",
    sections: ["4.1.4"], // Home Healthcare Service Provider Physicians duties
    oversight: ["Medical Management", "Order Review", "Progress Evaluation"],
  },
};

// JAWDA Indicators Integration
const jawdaIndicators = {
  patientSafety: [
    "Medication Error Rate",
    "Fall Incident Rate",
    "Infection Rate",
    "Emergency Transfer Rate",
  ],
  clinicalQuality: [
    "Care Plan Adherence",
    "Patient Satisfaction Score",
    "Functional Status Improvement",
    "Wound Healing Rate",
  ],
  processQuality: [
    "Documentation Completeness",
    "Assessment Timeliness",
    "Staff Competency Rate",
    "Compliance Score",
  ],
};

// Round Scheduling Workflow Types
interface RoundSchedule {
  id: string;
  roundType: string;
  patientId: string;
  episodeId: string;
  supervisorId: string;
  assignedAssessorId: string;
  scheduledDate: string;
  scheduledTime: string;
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "confirmed"
    | "reassigned"
    | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedDuration: number;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    accessInstructions?: string;
  };
  notifications: {
    sent: boolean;
    sentAt?: string;
    reminderSent: boolean;
    reminderAt?: string;
  };
  acceptanceDeadline: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Assessment Execution Workflow Types
interface AssessmentExecution {
  id: string;
  scheduleId: string;
  assessorId: string;
  patientId: string;
  episodeId: string;
  workflow: {
    arrivalTime?: string;
    gpsVerification?: {
      verified: boolean;
      coordinates: { lat: number; lng: number };
      accuracy: number;
      timestamp: string;
    };
    patientIdentityVerification?: {
      verified: boolean;
      method: "emirates_id" | "photo_id" | "biometric" | "family_confirmation";
      timestamp: string;
    };
    assessmentTimer?: {
      startTime: string;
      endTime?: string;
      duration?: number;
      pausedTime?: number;
    };
    formSections: {
      sectionId: string;
      sectionName: string;
      completed: boolean;
      completedAt?: string;
      data: any;
    }[];
    photosCapture: {
      photoId: string;
      type: "wound" | "environment" | "equipment" | "documentation";
      description: string;
      timestamp: string;
      location?: string;
      metadata?: any;
    }[];
    reviewCompleted: boolean;
    reviewedAt?: string;
    actionItems: {
      id: string;
      priority: "low" | "medium" | "high" | "critical";
      category: string;
      description: string;
      assignedTo?: string;
      dueDate?: string;
      status: "pending" | "in_progress" | "completed";
    }[];
    digitalSignature?: {
      signed: boolean;
      signedAt: string;
      signatureData: string;
      signerName: string;
      signerRole: string;
    };
    submission?: {
      submitted: boolean;
      submittedAt: string;
      syncStatus: "pending" | "synced" | "failed";
      syncedAt?: string;
    };
  };
  complianceData: {
    dohStandards: {
      standard: string;
      sections: string[];
      complianceScore: number;
      nonCompliantItems: string[];
    };
    jawdaIndicators: {
      category: string;
      indicators: {
        name: string;
        value: number;
        target: number;
        status: "met" | "not_met" | "exceeded";
      }[];
    }[];
  };
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface RoundData {
  id: string;
  type: "quality" | "infection-control" | "clinical" | "physician";
  patientId: string;
  episodeId: string;
  scheduledDate: string;
  completedDate?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  nurseId: string;
  nurseName: string;
  findings: string;
  recommendations: string;
  followUpRequired: boolean;
  followUpDate?: string;
  checklist: Record<string, boolean>;
  photos: string[];
  voiceNotes: string[];
  priority: "low" | "medium" | "high" | "critical";
  environmentalFactors: {
    homeCondition: string;
    safetyHazards: string[];
    accessibilityIssues: string[];
    familySupport: string;
  };
  vitalSigns?: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    painLevel?: number;
  };
  medications?: {
    administered: boolean;
    medicationList: string[];
    adherenceNotes: string;
    sideEffects: string;
  };
  woundAssessment?: {
    location: string;
    size: { length: number; width: number; depth: number };
    stage: string;
    drainage: string;
    treatmentPlan: string;
    photos: string[];
  };
  mobilityAssessment?: {
    ambulation: string;
    assistiveDevices: string[];
    fallRisk: "low" | "medium" | "high";
    safetyMeasures: string[];
  };
  cognitiveAssessment?: {
    orientation: string;
    memory: string;
    communication: string;
    behavioralConcerns: string;
  };
  dohCompliance: {
    nineDomainsCompleted: boolean;
    documentationComplete: boolean;
    signatureObtained: boolean;
    complianceScore: number;
  };
  qualityMetrics?: {
    patientSatisfaction: number;
    careQuality: number;
    safetyScore: number;
    outcomesMet: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface RoundsManagementProps {
  patientId: string;
  episodeId: string;
  isOffline?: boolean;
  onRoundComplete?: (roundData: RoundData) => void;
}

const RoundsManagement: React.FC<RoundsManagementProps> = ({
  patientId,
  episodeId,
  isOffline = false,
  onRoundComplete,
}) => {
  const [activeRoundType, setActiveRoundType] = useState<string>("quality");
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentRound, setCurrentRound] = useState<Partial<RoundData> | null>(
    null,
  );
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [selectedRoundForView, setSelectedRoundForView] =
    useState<RoundData | null>(null);
  const [roundsFilter, setRoundsFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [isLoading, setIsLoading] = useState(false);
  const [roundsStats, setRoundsStats] = useState({
    totalRounds: 0,
    completedToday: 0,
    pendingRounds: 0,
    averageScore: 0,
    complianceRate: 0,
  });

  // Round Scheduling State
  const [roundSchedules, setRoundSchedules] = useState<RoundSchedule[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<RoundSchedule | null>(null);
  const [assessmentExecution, setAssessmentExecution] =
    useState<AssessmentExecution | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [assessmentTimer, setAssessmentTimer] = useState<{
    startTime: Date | null;
    duration: number;
  }>({ startTime: null, duration: 0 });
  const [complianceMetrics, setComplianceMetrics] = useState<any>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [reportingPeriod, setReportingPeriod] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Enhanced round type configurations with DOH compliance
  const roundTypes = {
    quality: {
      name: "Quality Round",
      icon: ClipboardCheck,
      color: "bg-blue-500",
      description:
        "Comprehensive quality assessment of patient care and environment",
      dohRequired: true,
      estimatedDuration: 45,
      frequency: "Weekly",
      checklist: [
        "Patient comfort and positioning assessed",
        "Medication administration reviewed",
        "Care plan adherence evaluated",
        "Family education provided",
        "Documentation completeness verified",
        "Equipment functionality checked",
        "Infection control measures observed",
        "Patient satisfaction assessed",
        "DOH 9-domain assessment completed",
        "Quality metrics documented",
      ],
      requiredSkills: [
        "Quality Assessment",
        "Patient Safety",
        "DOH Compliance",
      ],
    },
    "infection-control": {
      name: "Infection Control Round",
      icon: Shield,
      color: "bg-red-500",
      description: "Infection prevention and control assessment",
      dohRequired: true,
      estimatedDuration: 30,
      frequency: "Bi-weekly",
      checklist: [
        "Hand hygiene compliance observed",
        "Personal protective equipment usage",
        "Wound care sterile technique",
        "Medical device cleanliness",
        "Home environment sanitation",
        "Isolation precautions if applicable",
        "Waste disposal procedures",
        "Family infection control education",
        "Infection risk assessment completed",
        "Environmental hazards documented",
      ],
      requiredSkills: [
        "Infection Control",
        "Sterile Technique",
        "Risk Assessment",
      ],
    },
    clinical: {
      name: "Clinical Rounds",
      icon: Stethoscope,
      color: "bg-green-500",
      description: "Clinical assessment and care evaluation",
      dohRequired: true,
      estimatedDuration: 60,
      frequency: "Daily",
      checklist: [
        "Vital signs assessment",
        "Physical examination performed",
        "Symptom evaluation",
        "Medication effects monitored",
        "Treatment response assessed",
        "Care plan modifications needed",
        "Referrals or consultations required",
        "Patient education reinforced",
        "Wound assessment if applicable",
        "Mobility and safety evaluation",
        "Cognitive status assessment",
      ],
      requiredSkills: [
        "Clinical Assessment",
        "Physical Examination",
        "Care Planning",
      ],
    },
    physician: {
      name: "Physician Round",
      icon: UserCheck,
      color: "bg-purple-500",
      description: "Physician-led comprehensive patient evaluation",
      dohRequired: true,
      estimatedDuration: 90,
      frequency: "Weekly",
      checklist: [
        "Medical history reviewed",
        "Current medications evaluated",
        "Diagnostic results analyzed",
        "Treatment plan updated",
        "Prognosis assessment",
        "Specialist referrals considered",
        "Family conference conducted",
        "Discharge planning reviewed",
        "Orders updated and signed",
        "Care team coordination",
        "Quality outcomes reviewed",
      ],
      requiredSkills: [
        "Medical Diagnosis",
        "Treatment Planning",
        "Care Coordination",
      ],
    },
  };

  useEffect(() => {
    loadRounds();
    loadRoundSchedules();
    initializeGeolocation();
    loadDashboardMetrics();
  }, [patientId, episodeId]);

  // Timer effect for assessment execution
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (assessmentTimer.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor(
          (now.getTime() - assessmentTimer.startTime!.getTime()) / 1000,
        );
        setAssessmentTimer((prev) => ({ ...prev, duration }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [assessmentTimer.startTime]);

  // Initialize geolocation for GPS verification
  const initializeGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation not available:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      );
    }
  };

  // Load round schedules
  const loadRoundSchedules = async () => {
    try {
      // Mock data for round schedules
      const mockSchedules: RoundSchedule[] = [
        {
          id: "schedule-1",
          roundType: "quality",
          patientId,
          episodeId,
          supervisorId: "supervisor-1",
          assignedAssessorId: "assessor-1",
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          scheduledTime: "10:00",
          status: "pending",
          priority: "medium",
          estimatedDuration: 45,
          location: {
            address: "123 Patient Home Address, Abu Dhabi",
            coordinates: { lat: 24.4539, lng: 54.3773 },
            accessInstructions: "Ring doorbell, patient is expecting visit",
          },
          notifications: {
            sent: true,
            sentAt: new Date().toISOString(),
            reminderSent: false,
          },
          acceptanceDeadline: new Date(
            Date.now() + 12 * 60 * 60 * 1000,
          ).toISOString(),
          notes: "Patient prefers morning visits",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "schedule-2",
          roundType: "infection-control",
          patientId,
          episodeId,
          supervisorId: "supervisor-1",
          assignedAssessorId: "assessor-2",
          scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          scheduledTime: "14:00",
          status: "accepted",
          priority: "high",
          estimatedDuration: 30,
          location: {
            address: "123 Patient Home Address, Abu Dhabi",
            coordinates: { lat: 24.4539, lng: 54.3773 },
          },
          notifications: {
            sent: true,
            sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            reminderSent: true,
            reminderAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          acceptanceDeadline: new Date(
            Date.now() + 36 * 60 * 60 * 1000,
          ).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setRoundSchedules(mockSchedules);
    } catch (error) {
      console.error("Failed to load round schedules:", error);
    }
  };

  const loadRounds = async () => {
    setIsLoading(true);
    try {
      // Enhanced mock data with comprehensive round information
      const mockRounds: RoundData[] = [
        {
          id: "1",
          type: "quality",
          patientId,
          episodeId,
          scheduledDate: "2024-01-20T10:00:00Z",
          completedDate: "2024-01-20T10:45:00Z",
          status: "completed",
          nurseId: "nurse1",
          nurseName: "Sarah Johnson, RN",
          findings:
            "Patient comfortable, medication compliance good, family engaged in care. Home environment safe and clean.",
          recommendations:
            "Continue current care plan, schedule follow-up in 3 days. Consider physical therapy referral.",
          followUpRequired: true,
          followUpDate: "2024-01-23T10:00:00Z",
          checklist: {
            "Patient comfort and positioning assessed": true,
            "Medication administration reviewed": true,
            "Care plan adherence evaluated": true,
            "Family education provided": true,
            "Documentation completeness verified": true,
            "Equipment functionality checked": true,
            "Infection control measures observed": true,
            "Patient satisfaction assessed": true,
            "DOH 9-domain assessment completed": true,
            "Quality metrics documented": true,
          },
          photos: [],
          voiceNotes: [],
          priority: "medium",
          environmentalFactors: {
            homeCondition: "Clean and well-maintained",
            safetyHazards: [],
            accessibilityIssues: ["Narrow doorway to bedroom"],
            familySupport: "Excellent - spouse and daughter actively involved",
          },
          vitalSigns: {
            bloodPressure: { systolic: 130, diastolic: 80 },
            heartRate: 72,
            temperature: 98.6,
            respiratoryRate: 16,
            oxygenSaturation: 98,
            painLevel: 2,
          },
          dohCompliance: {
            nineDomainsCompleted: true,
            documentationComplete: true,
            signatureObtained: true,
            complianceScore: 95,
          },
          qualityMetrics: {
            patientSatisfaction: 9,
            careQuality: 8,
            safetyScore: 10,
            outcomesMet: true,
          },
          createdAt: "2024-01-20T09:30:00Z",
          updatedAt: "2024-01-20T10:45:00Z",
        },
        {
          id: "2",
          type: "infection-control",
          patientId,
          episodeId,
          scheduledDate: "2024-01-21T14:00:00Z",
          completedDate: "2024-01-21T14:30:00Z",
          status: "completed",
          nurseId: "nurse2",
          nurseName: "Ahmed Al-Rashid, RN",
          findings:
            "Excellent hand hygiene compliance. Wound care performed with proper sterile technique. No signs of infection.",
          recommendations:
            "Continue current infection control measures. Monitor wound healing progress.",
          followUpRequired: false,
          checklist: {
            "Hand hygiene compliance observed": true,
            "Personal protective equipment usage": true,
            "Wound care sterile technique": true,
            "Medical device cleanliness": true,
            "Home environment sanitation": true,
            "Isolation precautions if applicable": false,
            "Waste disposal procedures": true,
            "Family infection control education": true,
            "Infection risk assessment completed": true,
            "Environmental hazards documented": true,
          },
          photos: [],
          voiceNotes: [],
          priority: "high",
          environmentalFactors: {
            homeCondition: "Very clean, well-organized",
            safetyHazards: [],
            accessibilityIssues: [],
            familySupport: "Good - family follows infection control protocols",
          },
          woundAssessment: {
            location: "Left lower leg",
            size: { length: 3.2, width: 2.1, depth: 0.5 },
            stage: "Stage 2",
            drainage: "Minimal serous",
            treatmentPlan: "Daily dressing changes with foam dressing",
            photos: [],
          },
          dohCompliance: {
            nineDomainsCompleted: true,
            documentationComplete: true,
            signatureObtained: true,
            complianceScore: 98,
          },
          createdAt: "2024-01-21T13:45:00Z",
          updatedAt: "2024-01-21T14:30:00Z",
        },
        {
          id: "3",
          type: "clinical",
          patientId,
          episodeId,
          scheduledDate: "2024-01-22T09:00:00Z",
          status: "scheduled",
          nurseId: "nurse3",
          nurseName: "Maria Santos, RN",
          findings: "",
          recommendations: "",
          followUpRequired: false,
          checklist: {},
          photos: [],
          voiceNotes: [],
          priority: "medium",
          environmentalFactors: {
            homeCondition: "",
            safetyHazards: [],
            accessibilityIssues: [],
            familySupport: "",
          },
          dohCompliance: {
            nineDomainsCompleted: false,
            documentationComplete: false,
            signatureObtained: false,
            complianceScore: 0,
          },
          createdAt: "2024-01-22T08:00:00Z",
          updatedAt: "2024-01-22T08:00:00Z",
        },
      ];

      setRounds(mockRounds);

      // Calculate stats
      const stats = {
        totalRounds: mockRounds.length,
        completedToday: mockRounds.filter(
          (r) =>
            r.status === "completed" &&
            new Date(r.completedDate || "").toDateString() ===
              new Date().toDateString(),
        ).length,
        pendingRounds: mockRounds.filter((r) => r.status === "scheduled")
          .length,
        averageScore:
          mockRounds
            .filter((r) => r.qualityMetrics)
            .reduce((acc, r) => acc + (r.qualityMetrics?.careQuality || 0), 0) /
            mockRounds.filter((r) => r.qualityMetrics).length || 0,
        complianceRate:
          mockRounds
            .filter((r) => r.dohCompliance)
            .reduce((acc, r) => acc + r.dohCompliance.complianceScore, 0) /
            mockRounds.filter((r) => r.dohCompliance).length || 0,
      };

      setRoundsStats(stats);
    } catch (error) {
      console.error("Failed to load rounds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Round Scheduling Workflow Functions
  const createRoundSchedule = async (roundType: string) => {
    const config = roundTypes[roundType as keyof typeof roundTypes];
    const newSchedule: RoundSchedule = {
      id: `schedule-${Date.now()}`,
      roundType,
      patientId,
      episodeId,
      supervisorId: "current-supervisor-id", // Would get from auth context
      assignedAssessorId: "selected-assessor-id", // Would be selected by supervisor
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      scheduledTime: "10:00",
      status: "pending",
      priority: "medium",
      estimatedDuration: config.estimatedDuration,
      location: {
        address: "Patient Home Address", // Would get from patient data
        coordinates: gpsLocation || undefined,
      },
      notifications: {
        sent: false,
        reminderSent: false,
      },
      acceptanceDeadline: new Date(
        Date.now() + 12 * 60 * 60 * 1000,
      ).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 1: Supervisor Creates Schedule
    setRoundSchedules((prev) => [...prev, newSchedule]);

    // Step 2: System Validates Availability (mock validation)
    const isAvailable = await validateAssessorAvailability(
      newSchedule.assignedAssessorId,
      newSchedule.scheduledDate,
      newSchedule.scheduledTime,
    );

    if (isAvailable) {
      // Step 3: Notification Sent to Assessor
      await sendNotificationToAssessor(newSchedule);
      setSelectedSchedule(newSchedule);
      setShowScheduleDialog(true);
    } else {
      // Reassign to another assessor
      await reassignToAnotherAssessor(newSchedule);
    }
  };

  const validateAssessorAvailability = async (
    assessorId: string,
    date: string,
    time: string,
  ): Promise<boolean> => {
    // Mock validation - in real system would check assessor's schedule
    return Math.random() > 0.2; // 80% chance of availability
  };

  const sendNotificationToAssessor = async (schedule: RoundSchedule) => {
    // Mock notification sending
    const updatedSchedule = {
      ...schedule,
      notifications: {
        sent: true,
        sentAt: new Date().toISOString(),
        reminderSent: false,
      },
    };

    setRoundSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? updatedSchedule : s)),
    );

    // Simulate assessor response after some time
    setTimeout(() => {
      handleAssessorResponse(
        schedule.id,
        Math.random() > 0.3 ? "accepted" : "declined",
      );
    }, 2000);
  };

  const handleAssessorResponse = (
    scheduleId: string,
    response: "accepted" | "declined",
  ) => {
    setRoundSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id === scheduleId) {
          if (response === "accepted") {
            return {
              ...schedule,
              status: "confirmed",
              updatedAt: new Date().toISOString(),
            };
          } else {
            // Reassign to another assessor
            reassignToAnotherAssessor(schedule);
            return {
              ...schedule,
              status: "reassigned",
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return schedule;
      }),
    );
  };

  const reassignToAnotherAssessor = async (schedule: RoundSchedule) => {
    // Mock reassignment logic
    const newAssessorId = "backup-assessor-id";
    const updatedSchedule = {
      ...schedule,
      assignedAssessorId: newAssessorId,
      status: "pending" as const,
      updatedAt: new Date().toISOString(),
    };

    setRoundSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? updatedSchedule : s)),
    );
    await sendNotificationToAssessor(updatedSchedule);
  };

  // Assessment Execution Workflow Functions
  const startAssessmentExecution = (schedule: RoundSchedule) => {
    const execution: AssessmentExecution = {
      id: `execution-${Date.now()}`,
      scheduleId: schedule.id,
      assessorId: schedule.assignedAssessorId,
      patientId: schedule.patientId,
      episodeId: schedule.episodeId,
      workflow: {
        formSections: [],
        photosCapture: [],
        reviewCompleted: false,
        actionItems: [],
      },
      complianceData: {
        dohStandards: {
          standard:
            dohStandardsMapping[
              schedule.roundType as keyof typeof dohStandardsMapping
            ]?.standard || "",
          sections:
            dohStandardsMapping[
              schedule.roundType as keyof typeof dohStandardsMapping
            ]?.sections || [],
          complianceScore: 0,
          nonCompliantItems: [],
        },
        jawdaIndicators: Object.entries(jawdaIndicators).map(
          ([category, indicators]) => ({
            category,
            indicators: indicators.map((name) => ({
              name,
              value: 0,
              target: 100,
              status: "not_met" as const,
            })),
          }),
        ),
      },
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(execution);
    setShowExecutionDialog(true);
  };

  const handleArrivalAtLocation = () => {
    if (!assessmentExecution) return;

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        arrivalTime: new Date().toISOString(),
      },
      status: "in_progress" as const,
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);

    // Step 1: GPS Verification
    if (gpsLocation) {
      verifyGPSLocation();
    }
  };

  const verifyGPSLocation = () => {
    if (!assessmentExecution || !gpsLocation) return;

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        gpsVerification: {
          verified: true,
          coordinates: gpsLocation,
          accuracy: 10, // meters
          timestamp: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const verifyPatientIdentity = (
    method: "emirates_id" | "photo_id" | "biometric" | "family_confirmation",
  ) => {
    if (!assessmentExecution) return;

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        patientIdentityVerification: {
          verified: true,
          method,
          timestamp: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const startAssessmentTimer = () => {
    const startTime = new Date();
    setAssessmentTimer({ startTime, duration: 0 });

    if (!assessmentExecution) return;

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        assessmentTimer: {
          startTime: startTime.toISOString(),
          duration: 0,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const completeFormSection = (
    sectionId: string,
    sectionName: string,
    data: any,
  ) => {
    if (!assessmentExecution) return;

    const updatedSections = [...assessmentExecution.workflow.formSections];
    const existingIndex = updatedSections.findIndex(
      (s) => s.sectionId === sectionId,
    );

    const sectionData = {
      sectionId,
      sectionName,
      completed: true,
      completedAt: new Date().toISOString(),
      data,
    };

    if (existingIndex >= 0) {
      updatedSections[existingIndex] = sectionData;
    } else {
      updatedSections.push(sectionData);
    }

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        formSections: updatedSections,
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const capturePhoto = (
    type: "wound" | "environment" | "equipment" | "documentation",
    description: string,
  ) => {
    if (!assessmentExecution) return;

    const photo = {
      photoId: `photo-${Date.now()}`,
      type,
      description,
      timestamp: new Date().toISOString(),
      location: "Patient Home",
      metadata: {
        gpsCoordinates: gpsLocation,
        assessmentId: assessmentExecution.id,
      },
    };

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        photosCapture: [...assessmentExecution.workflow.photosCapture, photo],
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const generateActionItems = () => {
    if (!assessmentExecution) return;

    // Mock action item generation based on assessment data
    const actionItems = [
      {
        id: `action-${Date.now()}-1`,
        priority: "medium" as const,
        category: "Documentation",
        description: "Update care plan based on assessment findings",
        assignedTo: "care-coordinator-id",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "pending" as const,
      },
      {
        id: `action-${Date.now()}-2`,
        priority: "high" as const,
        category: "Patient Safety",
        description: "Follow up on medication adherence",
        assignedTo: "primary-nurse-id",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "pending" as const,
      },
    ];

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        actionItems,
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const submitDigitalSignature = (
    signatureData: string,
    signerName: string,
    signerRole: string,
  ) => {
    if (!assessmentExecution) return;

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        digitalSignature: {
          signed: true,
          signedAt: new Date().toISOString(),
          signatureData,
          signerName,
          signerRole,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);
  };

  const submitAssessment = async () => {
    if (!assessmentExecution) return;

    // Calculate compliance scores
    const complianceScore = calculateComplianceScore(assessmentExecution);

    const updatedExecution = {
      ...assessmentExecution,
      workflow: {
        ...assessmentExecution.workflow,
        submission: {
          submitted: true,
          submittedAt: new Date().toISOString(),
          syncStatus: "pending" as const,
        },
      },
      complianceData: {
        ...assessmentExecution.complianceData,
        dohStandards: {
          ...assessmentExecution.complianceData.dohStandards,
          complianceScore,
        },
      },
      status: "completed" as const,
      updatedAt: new Date().toISOString(),
    };

    setAssessmentExecution(updatedExecution);

    // Sync to server
    await syncToServer(updatedExecution);
  };

  const syncToServer = async (execution: AssessmentExecution) => {
    try {
      // Mock server sync
      setTimeout(() => {
        const updatedExecution = {
          ...execution,
          workflow: {
            ...execution.workflow,
            submission: {
              ...execution.workflow.submission!,
              syncStatus: "synced" as const,
              syncedAt: new Date().toISOString(),
            },
          },
        };
        setAssessmentExecution(updatedExecution);

        // Create completed round record
        const completedRound = convertExecutionToRound(updatedExecution);
        setRounds((prev) => [completedRound, ...prev]);

        onRoundComplete?.(completedRound);
      }, 2000);
    } catch (error) {
      console.error("Failed to sync assessment:", error);
      // Handle sync failure
    }
  };

  const calculateComplianceScore = (execution: AssessmentExecution): number => {
    // Mock compliance calculation based on completed sections and DOH standards
    const completedSections = execution.workflow.formSections.filter(
      (s) => s.completed,
    ).length;
    const totalSections =
      roundTypes[execution.scheduleId.split("-")[0] as keyof typeof roundTypes]
        ?.checklist.length || 10;
    const baseScore = (completedSections / totalSections) * 100;

    // Apply DOH standards weighting
    const hasSignature = execution.workflow.digitalSignature?.signed || false;
    const hasPhotos = execution.workflow.photosCapture.length > 0;
    const hasActionItems = execution.workflow.actionItems.length > 0;

    let adjustedScore = baseScore;
    if (hasSignature) adjustedScore += 5;
    if (hasPhotos) adjustedScore += 3;
    if (hasActionItems) adjustedScore += 2;

    return Math.min(100, Math.round(adjustedScore));
  };

  const convertExecutionToRound = (
    execution: AssessmentExecution,
  ): RoundData => {
    const schedule = roundSchedules.find((s) => s.id === execution.scheduleId);

    return {
      id: execution.id,
      type: (schedule?.roundType || "quality") as RoundData["type"],
      patientId: execution.patientId,
      episodeId: execution.episodeId,
      scheduledDate: schedule?.scheduledDate || new Date().toISOString(),
      completedDate:
        execution.workflow.submission?.submittedAt || new Date().toISOString(),
      status: "completed",
      nurseId: execution.assessorId,
      nurseName: "Assessment Nurse", // Would get from user data
      findings: "Assessment completed successfully with digital workflow",
      recommendations: execution.workflow.actionItems
        .map((a) => a.description)
        .join("; "),
      followUpRequired: execution.workflow.actionItems.length > 0,
      followUpDate: execution.workflow.actionItems[0]?.dueDate,
      checklist: execution.workflow.formSections.reduce(
        (acc, section) => ({
          ...acc,
          [section.sectionName]: section.completed,
        }),
        {},
      ),
      photos: execution.workflow.photosCapture.map((p) => p.photoId),
      voiceNotes: [],
      priority: "medium",
      environmentalFactors: {
        homeCondition: "Assessed via digital workflow",
        safetyHazards: [],
        accessibilityIssues: [],
        familySupport: "Good",
      },
      dohCompliance: {
        nineDomainsCompleted: true,
        documentationComplete: true,
        signatureObtained: execution.workflow.digitalSignature?.signed || false,
        complianceScore: execution.complianceData.dohStandards.complianceScore,
      },
      qualityMetrics: {
        patientSatisfaction: 9,
        careQuality: 8,
        safetyScore: 9,
        outcomesMet: true,
      },
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    };
  };

  const startNewRound = (roundType: string) => {
    // Use new scheduling workflow instead of direct round creation
    createRoundSchedule(roundType);
  };

  const updateCompletionProgress = (round: Partial<RoundData>) => {
    if (!round.checklist) return;

    const totalItems = Object.keys(round.checklist).length;
    const completedItems = Object.values(round.checklist).filter(
      Boolean,
    ).length;
    const hasFindings = round.findings && round.findings.length > 10;
    const hasRecommendations =
      round.recommendations && round.recommendations.length > 10;

    const progress =
      (completedItems / totalItems) * 70 +
      (hasFindings ? 15 : 0) +
      (hasRecommendations ? 15 : 0);
    setCompletionProgress(Math.min(progress, 100));
  };

  const updateChecklistItem = (item: string, checked: boolean) => {
    if (!currentRound) return;

    const updatedRound = {
      ...currentRound,
      checklist: {
        ...currentRound.checklist,
        [item]: checked,
      },
    };
    setCurrentRound(updatedRound);
    updateCompletionProgress(updatedRound);
  };

  const updateRoundField = (field: string, value: any) => {
    if (!currentRound) return;

    const updatedRound = {
      ...currentRound,
      [field]: value,
    };
    setCurrentRound(updatedRound);
    updateCompletionProgress(updatedRound);
  };

  const saveRound = async () => {
    if (!currentRound) return;

    const completedRound: RoundData = {
      ...currentRound,
      id: Date.now().toString(),
      completedDate: new Date().toISOString(),
      status: "completed",
      createdAt: currentRound.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RoundData;

    setRounds((prev) => [completedRound, ...prev]);
    setCurrentRound(null);
    setIsCreatingRound(false);
    setCompletionProgress(0);

    onRoundComplete?.(completedRound);
  };

  const cancelRound = () => {
    setCurrentRound(null);
    setIsCreatingRound(false);
    setCompletionProgress(0);
  };

  const getRoundsByType = (type: string) => {
    return rounds.filter((round) => round.type === type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "scheduled":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Filter and sort rounds
  const filteredRounds = rounds
    .filter((round) => {
      const matchesFilter =
        roundsFilter === "all" ||
        round.type === roundsFilter ||
        round.status === roundsFilter;
      const matchesSearch =
        searchQuery === "" ||
        round.nurseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        round.findings.toLowerCase().includes(searchQuery.toLowerCase()) ||
        round.recommendations.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.scheduledDate).getTime() -
            new Date(a.scheduledDate).getTime()
          );
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "type":
          return a.type.localeCompare(b.type);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleRoundFormComplete = (roundData: any) => {
    const completedRound: RoundData = {
      ...roundData,
      id: Date.now().toString(),
      completedDate: new Date().toISOString(),
      status: "completed",
      createdAt: currentRound?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RoundData;

    setRounds((prev) => [completedRound, ...prev]);
    setCurrentRound(null);
    setIsCreatingRound(false);
    setShowRoundForm(false);
    setCompletionProgress(0);
    onRoundComplete?.(completedRound);
  };

  const handleRoundFormCancel = () => {
    setCurrentRound(null);
    setIsCreatingRound(false);
    setShowRoundForm(false);
    setCompletionProgress(0);
  };

  // Dashboard Metrics and Analytics Functions
  const loadDashboardMetrics = async () => {
    try {
      // Simulate loading dashboard metrics
      const metrics = {
        overview: {
          totalRoundsCompleted: rounds.filter((r) => r.status === "completed")
            .length,
          complianceRate: 94.2,
          actionItemsOpen: 23,
          qualityScore: 4.3,
        },
        trends: {
          monthlyCompliance: [89.2, 91.5, 93.1, 94.2, 92.8, 95.1],
          qualityTrends: [4.1, 4.2, 4.0, 4.3, 4.4, 4.3],
          actionItemResolution: [85, 88, 92, 89, 91, 94],
        },
        alerts: [
          {
            type: "compliance",
            severity: "high",
            message: "Quality compliance below threshold for Patient ID: 123",
            timestamp: new Date().toISOString(),
            actionRequired: true,
          },
          {
            type: "documentation",
            severity: "medium",
            message: "Missing signatures on 3 clinical forms",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            actionRequired: true,
          },
          {
            type: "schedule",
            severity: "low",
            message: "2 rounds scheduled for tomorrow require confirmation",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            actionRequired: false,
          },
        ],
        reportTypes: {
          compliance: {
            name: "Compliance Reports",
            description:
              "DOH Standards compliance percentage, Non-compliance trends, Action item status",
            metrics: [
              "DOH Standards compliance percentage",
              "Non-compliance trends",
              "Action item status",
            ],
          },
          quality: {
            name: "Quality Metrics Reports",
            description:
              "JAWDA indicators performance, Patient satisfaction trends, Clinical outcomes",
            metrics: [
              "JAWDA indicators performance",
              "Patient satisfaction trends",
              "Clinical outcomes",
            ],
          },
          operational: {
            name: "Operational Reports",
            description:
              "Round completion rates, Staff performance, Resource utilization",
            metrics: [
              "Round completion rates",
              "Staff performance",
              "Resource utilization",
            ],
          },
        },
      };
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error("Failed to load dashboard metrics:", error);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      setIsLoading(true);

      // Simulate report generation
      const reportData = {
        reportId: `RPT-${Date.now()}`,
        type: reportType,
        period: reportingPeriod,
        generatedAt: new Date().toISOString(),
        data: await getReportData(reportType),
      };

      // In a real implementation, this would call the reporting API
      console.log("Generated report:", reportData);

      // Show success message or download report
      alert(
        `${dashboardMetrics.reportTypes[reportType]?.name} generated successfully!`,
      );
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
      setShowReportsDialog(false);
    }
  };

  const getReportData = async (reportType: string) => {
    const baseData = {
      totalRounds: rounds.length,
      completedRounds: rounds.filter((r) => r.status === "completed").length,
      averageComplianceScore:
        rounds.reduce(
          (acc, r) => acc + (r.dohCompliance?.complianceScore || 0),
          0,
        ) / rounds.length,
      period: reportingPeriod,
    };

    switch (reportType) {
      case "compliance":
        return {
          ...baseData,
          dohStandardsCompliance: 94.2,
          nonComplianceItems: [
            { item: "Missing documentation", count: 3, severity: "medium" },
            { item: "Incomplete assessments", count: 1, severity: "high" },
          ],
          actionItemStatus: {
            open: 23,
            inProgress: 15,
            completed: 142,
            overdue: 5,
          },
        };
      case "quality":
        return {
          ...baseData,
          jawdaIndicators: {
            patientSafety: 95.2,
            clinicalQuality: 91.8,
            processQuality: 88.5,
          },
          patientSatisfactionTrends: [4.1, 4.2, 4.0, 4.3, 4.4, 4.3],
          clinicalOutcomes: {
            improvementRate: 87.3,
            readmissionRate: 2.1,
            complicationRate: 1.8,
          },
        };
      case "operational":
        return {
          ...baseData,
          roundCompletionRates: {
            quality: 96.5,
            infectionControl: 94.2,
            clinical: 98.1,
            physician: 91.7,
          },
          staffPerformance: {
            averageRoundTime: 45,
            documentationQuality: 92.3,
            patientSatisfaction: 4.2,
          },
          resourceUtilization: {
            staffUtilization: 88.4,
            equipmentUsage: 76.2,
            timeEfficiency: 91.8,
          },
        };
      default:
        return baseData;
    }
  };

  const exportReport = async (format: "pdf" | "excel" | "csv") => {
    try {
      setIsLoading(true);

      // Simulate export process
      const exportData = {
        format,
        reportType: selectedReportType,
        period: reportingPeriod,
        exportedAt: new Date().toISOString(),
      };

      console.log("Exporting report:", exportData);

      // In a real implementation, this would trigger file download
      alert(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="p-6">
        {/* Enhanced Header with Statistics */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                Bedside Rounds Management
              </h1>
              <p className="text-gray-600">
                Comprehensive bedside visit documentation for quality, infection
                control, clinical, and physician rounds
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              {isOffline && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <WifiOff className="h-3 w-3" />
                  Offline Mode
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                DOH Compliant
              </Badge>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Rounds
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {roundsStats.totalRounds}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completed Today
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {roundsStats.completedToday}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {roundsStats.pendingRounds}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Quality
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {roundsStats.averageScore.toFixed(1)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      DOH Compliance
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {roundsStats.complianceRate.toFixed(0)}%
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search rounds by nurse, findings, or recommendations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roundsFilter} onValueChange={setRoundsFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rounds</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="infection-control">
                    Infection Control
                  </SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="physician">Physician</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={loadRounds}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {!isCreatingRound ? (
          <>
            {/* Round Scheduling Dashboard */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Round Scheduling Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        roundSchedules.filter((s) => s.status === "pending")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Pending Acceptance
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        roundSchedules.filter((s) => s.status === "confirmed")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Confirmed Rounds
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        roundSchedules.filter((s) => s.status === "reassigned")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Reassigned</div>
                  </div>
                </div>

                {roundSchedules.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recent Schedules</h4>
                    <div className="space-y-2">
                      {roundSchedules.slice(0, 3).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {
                                roundTypes[
                                  schedule.roundType as keyof typeof roundTypes
                                ]?.name
                              }
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.scheduledDate} at{" "}
                              {schedule.scheduledTime}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${
                                schedule.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : schedule.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : schedule.status === "reassigned"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {schedule.status}
                            </Badge>
                            {schedule.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  startAssessmentExecution(schedule)
                                }
                              >
                                Start Assessment
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DOH Standards & JAWDA Indicators */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  DOH Standards & JAWDA Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">DOH Standards Mapping</h4>
                    <div className="space-y-3">
                      {Object.entries(dohStandardsMapping).map(
                        ([key, mapping]) => (
                          <div key={key} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm">
                              {roundTypes[key as keyof typeof roundTypes]?.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Standard: {mapping.standard}
                            </div>
                            <div className="text-xs text-gray-600">
                              Sections: {mapping.sections.join(", ")}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">JAWDA Indicators</h4>
                    <div className="space-y-3">
                      {Object.entries(jawdaIndicators).map(
                        ([category, indicators]) => (
                          <div key={category} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {indicators.slice(0, 2).join(", ")}...
                            </div>
                            <div className="text-xs text-blue-600">
                              {indicators.length} indicators
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Round Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(roundTypes).map(([key, config]) => {
                const Icon = config.icon;
                const recentRounds = getRoundsByType(key);
                const lastRound = recentRounds[0];
                const completedRounds = recentRounds.filter(
                  (r) => r.status === "completed",
                );
                const avgScore =
                  completedRounds.length > 0
                    ? completedRounds.reduce(
                        (acc, r) =>
                          acc + (r.dohCompliance?.complianceScore || 0),
                        0,
                      ) / completedRounds.length
                    : 0;

                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
                    style={{
                      borderLeftColor: config.color.replace("bg-", "#"),
                    }}
                    onClick={() => setActiveRoundType(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-2 rounded-lg ${config.color} text-white`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {recentRounds.length} rounds
                          </Badge>
                          {config.dohRequired && (
                            <Badge
                              variant="secondary"
                              className="text-xs block"
                            >
                              DOH Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1">{config.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {config.description}
                      </p>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Duration: {config.estimatedDuration}min</span>
                          <span>Frequency: {config.frequency}</span>
                        </div>
                        {avgScore > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">
                              Avg Score: {avgScore.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {lastRound && (
                          <div className="text-xs text-gray-500">
                            Last:{" "}
                            {new Date(
                              lastRound.completedDate ||
                                lastRound.scheduledDate,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startNewRound(key);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start Round
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p>Required Skills:</p>
                              <ul className="list-disc list-inside">
                                {config.requiredSkills.map((skill, idx) => (
                                  <li key={idx}>{skill}</li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Reporting & Analytics Dashboard */}
            {dashboardMetrics && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Reporting & Analytics Dashboard
                    </CardTitle>
                    <Button
                      onClick={() => setShowReportsDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Generate Reports
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Overview Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total Rounds Completed
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {dashboardMetrics.overview.totalRoundsCompleted}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Compliance Rate
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {dashboardMetrics.overview.complianceRate}%
                            </p>
                          </div>
                          <Award className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Action Items Open
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {dashboardMetrics.overview.actionItemsOpen}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Quality Score
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                              {dashboardMetrics.overview.qualityScore}/5.0
                            </p>
                          </div>
                          <Star className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trends and Alerts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trends */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Performance Trends
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Monthly Compliance
                            </span>
                            <span className="text-xs text-blue-600">
                              Last 6 months
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {dashboardMetrics.trends.monthlyCompliance.map(
                              (value: number, index: number) => (
                                <div
                                  key={index}
                                  className="flex-1 bg-blue-200 rounded"
                                  style={{ height: `${(value / 100) * 30}px` }}
                                  title={`${value}%`}
                                />
                              ),
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Quality Trends
                            </span>
                            <span className="text-xs text-green-600">
                              Last 6 months
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {dashboardMetrics.trends.qualityTrends.map(
                              (value: number, index: number) => (
                                <div
                                  key={index}
                                  className="flex-1 bg-green-200 rounded"
                                  style={{ height: `${(value / 5) * 30}px` }}
                                  title={`${value}/5.0`}
                                />
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alerts */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Recent Alerts
                      </h4>
                      <div className="space-y-2">
                        {dashboardMetrics.alerts.map(
                          (alert: any, index: number) => (
                            <Alert
                              key={index}
                              className={`${
                                alert.severity === "high"
                                  ? "border-red-200 bg-red-50"
                                  : alert.severity === "medium"
                                    ? "border-orange-200 bg-orange-50"
                                    : "border-blue-200 bg-blue-50"
                              }`}
                            >
                              <AlertTriangle
                                className={`h-4 w-4 ${
                                  alert.severity === "high"
                                    ? "text-red-600"
                                    : alert.severity === "medium"
                                      ? "text-orange-600"
                                      : "text-blue-600"
                                }`}
                              />
                              <AlertDescription>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {alert.message}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        alert.timestamp,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  {alert.actionRequired && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Action Required
                                    </Badge>
                                  )}
                                </div>
                              </AlertDescription>
                            </Alert>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Recent Rounds with Advanced Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Rounds -{" "}
                    {
                      roundTypes[activeRoundType as keyof typeof roundTypes]
                        ?.name
                    }
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log("Export rounds")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredRounds.map((round) => (
                      <Card
                        key={round.id}
                        className="border-l-4"
                        style={{
                          borderLeftColor: roundTypes[
                            round.type
                          ]?.color.replace("bg-", "#"),
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(round.status)}`}
                              ></div>
                              <div>
                                <span className="font-medium">
                                  {round.nurseName}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {roundTypes[round.type]?.name}
                                  </Badge>
                                  <Badge
                                    className={getPriorityColor(round.priority)}
                                  >
                                    {round.priority.toUpperCase()}
                                  </Badge>
                                  {round.dohCompliance?.complianceScore && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      DOH: {round.dohCompliance.complianceScore}
                                      %
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    round.completedDate || round.scheduledDate,
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(
                                    round.completedDate || round.scheduledDate,
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedRoundForView(round)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {round.status !== "completed" && (
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Content Display */}
                          <div className="space-y-3">
                            {round.vitalSigns && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <Label className="text-sm font-medium text-blue-900">
                                  Vital Signs
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                                  {round.vitalSigns.bloodPressure && (
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-3 w-3 text-red-500" />
                                      <span>
                                        BP:{" "}
                                        {
                                          round.vitalSigns.bloodPressure
                                            .systolic
                                        }
                                        /
                                        {
                                          round.vitalSigns.bloodPressure
                                            .diastolic
                                        }
                                      </span>
                                    </div>
                                  )}
                                  {round.vitalSigns.heartRate && (
                                    <div className="flex items-center gap-1">
                                      <Activity className="h-3 w-3 text-green-500" />
                                      <span>
                                        HR: {round.vitalSigns.heartRate}
                                      </span>
                                    </div>
                                  )}
                                  {round.vitalSigns.temperature && (
                                    <div className="flex items-center gap-1">
                                      <Thermometer className="h-3 w-3 text-orange-500" />
                                      <span>
                                        Temp: {round.vitalSigns.temperature}°F
                                      </span>
                                    </div>
                                  )}
                                  {round.vitalSigns.oxygenSaturation && (
                                    <div className="flex items-center gap-1">
                                      <Wind className="h-3 w-3 text-blue-500" />
                                      <span>
                                        O2: {round.vitalSigns.oxygenSaturation}%
                                      </span>
                                    </div>
                                  )}
                                  {round.vitalSigns.painLevel !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                      <span>
                                        Pain: {round.vitalSigns.painLevel}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">
                                  Findings
                                </Label>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                  {round.findings ||
                                    "No findings documented yet"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">
                                  Recommendations
                                </Label>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                  {round.recommendations ||
                                    "No recommendations documented yet"}
                                </p>
                              </div>
                            </div>

                            {/* Quality Metrics */}
                            {round.qualityMetrics && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <Label className="text-sm font-medium text-green-900">
                                  Quality Metrics
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>
                                      Satisfaction:{" "}
                                      {round.qualityMetrics.patientSatisfaction}
                                      /10
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-blue-500" />
                                    <span>
                                      Care Quality:{" "}
                                      {round.qualityMetrics.careQuality}/10
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-green-500" />
                                    <span>
                                      Safety: {round.qualityMetrics.safetyScore}
                                      /10
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                    <span>
                                      Outcomes:{" "}
                                      {round.qualityMetrics.outcomesMet
                                        ? "Met"
                                        : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Checklist Progress */}
                            {Object.keys(round.checklist).length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Checklist Progress
                                </Label>
                                <div className="mt-2">
                                  <Progress
                                    value={
                                      (Object.values(round.checklist).filter(
                                        Boolean,
                                      ).length /
                                        Object.keys(round.checklist).length) *
                                      100
                                    }
                                    className="h-2"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {
                                      Object.values(round.checklist).filter(
                                        Boolean,
                                      ).length
                                    }{" "}
                                    of {Object.keys(round.checklist).length}{" "}
                                    items completed
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {round.followUpRequired && (
                            <Alert className="mt-3">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    Follow-up Required
                                  </span>
                                  {round.followUpDate && (
                                    <span className="text-sm">
                                      Due:{" "}
                                      {new Date(
                                        round.followUpDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {filteredRounds.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No rounds found matching your criteria</p>
                        <p className="text-sm">
                          Try adjusting your search or filter settings
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        ) : null}

        {/* Assessment Execution Dialog */}
        {showExecutionDialog && assessmentExecution && (
          <Dialog
            open={showExecutionDialog}
            onOpenChange={setShowExecutionDialog}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Assessment Execution Workflow
                </DialogTitle>
                <DialogDescription>
                  Digital workflow for bedside round assessment
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Workflow Progress */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Assessment Progress</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div
                      className={`p-2 rounded text-center ${
                        assessmentExecution.workflow.arrivalTime
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <MapPin className="h-4 w-4 mx-auto mb-1" />
                      <div>Arrival</div>
                      {assessmentExecution.workflow.arrivalTime && (
                        <div className="text-xs">
                          {new Date(
                            assessmentExecution.workflow.arrivalTime,
                          ).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    <div
                      className={`p-2 rounded text-center ${
                        assessmentExecution.workflow.gpsVerification?.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Globe className="h-4 w-4 mx-auto mb-1" />
                      <div>GPS Verified</div>
                    </div>
                    <div
                      className={`p-2 rounded text-center ${
                        assessmentExecution.workflow.patientIdentityVerification
                          ?.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <UserCheck className="h-4 w-4 mx-auto mb-1" />
                      <div>ID Verified</div>
                    </div>
                    <div
                      className={`p-2 rounded text-center ${
                        assessmentExecution.workflow.assessmentTimer?.startTime
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1" />
                      <div>Timer Started</div>
                      {assessmentTimer.startTime && (
                        <div className="text-xs">
                          {Math.floor(assessmentTimer.duration / 60)}:
                          {(assessmentTimer.duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {!assessmentExecution.workflow.arrivalTime && (
                    <Button
                      onClick={handleArrivalAtLocation}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Arrive at Location
                    </Button>
                  )}

                  {assessmentExecution.workflow.arrivalTime &&
                    !assessmentExecution.workflow.patientIdentityVerification
                      ?.verified && (
                      <Button
                        onClick={() => verifyPatientIdentity("emirates_id")}
                        className="w-full"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Verify Patient ID
                      </Button>
                    )}

                  {assessmentExecution.workflow.patientIdentityVerification
                    ?.verified &&
                    !assessmentExecution.workflow.assessmentTimer
                      ?.startTime && (
                      <Button onClick={startAssessmentTimer} className="w-full">
                        <Clock className="h-4 w-4 mr-2" />
                        Start Assessment
                      </Button>
                    )}

                  {assessmentExecution.workflow.assessmentTimer?.startTime && (
                    <Button
                      onClick={() =>
                        capturePhoto("wound", "Wound documentation")
                      }
                      variant="outline"
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                  )}
                </div>

                {/* Form Sections Progress */}
                {assessmentExecution.workflow.assessmentTimer?.startTime && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Assessment Sections</h4>
                    <div className="space-y-2">
                      {roundTypes[
                        selectedSchedule?.roundType as keyof typeof roundTypes
                      ]?.checklist
                        .slice(0, 5)
                        .map((item, index) => {
                          const isCompleted =
                            assessmentExecution.workflow.formSections.some(
                              (s) => s.sectionName === item && s.completed,
                            );
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm">{item}</span>
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      completeFormSection(
                                        `section-${index}`,
                                        item,
                                        { completed: true },
                                      )
                                    }
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Photos Captured */}
                {assessmentExecution.workflow.photosCapture.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Photos Captured</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {assessmentExecution.workflow.photosCapture.map(
                        (photo) => (
                          <div
                            key={photo.photoId}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="font-medium text-sm">
                              {photo.type}
                            </div>
                            <div className="text-xs text-gray-600">
                              {photo.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(photo.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {assessmentExecution.workflow.formSections.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Action Items</h4>
                      <Button size="sm" onClick={generateActionItems}>
                        Generate Actions
                      </Button>
                    </div>
                    {assessmentExecution.workflow.actionItems.length > 0 && (
                      <div className="space-y-2">
                        {assessmentExecution.workflow.actionItems.map(
                          (action) => (
                            <div
                              key={action.id}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">
                                    {action.description}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {action.category} • Due: {action.dueDate}
                                  </div>
                                </div>
                                <Badge
                                  className={getPriorityColor(action.priority)}
                                >
                                  {action.priority}
                                </Badge>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Digital Signature */}
                {assessmentExecution.workflow.actionItems.length > 0 &&
                  !assessmentExecution.workflow.digitalSignature?.signed && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Digital Signature</h4>
                      <Button
                        onClick={() =>
                          submitDigitalSignature(
                            "signature-data-placeholder",
                            "Current User",
                            "Assessor",
                          )
                        }
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Sign Assessment
                      </Button>
                    </div>
                  )}

                {/* Submit Assessment */}
                {assessmentExecution.workflow.digitalSignature?.signed &&
                  !assessmentExecution.workflow.submission?.submitted && (
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h4 className="font-medium mb-3">Submit Assessment</h4>
                      <Button
                        onClick={submitAssessment}
                        className="w-full"
                        size="lg"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit & Sync to Server
                      </Button>
                    </div>
                  )}

                {/* Submission Status */}
                {assessmentExecution.workflow.submission?.submitted && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium mb-3">Submission Status</h4>
                    <div className="flex items-center gap-2">
                      {assessmentExecution.workflow.submission.syncStatus ===
                      "synced" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : assessmentExecution.workflow.submission.syncStatus ===
                        "pending" ? (
                        <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="capitalize">
                        {assessmentExecution.workflow.submission.syncStatus}
                      </span>
                    </div>
                    {assessmentExecution.workflow.submission.syncedAt && (
                      <div className="text-sm text-gray-600 mt-1">
                        Synced at:{" "}
                        {new Date(
                          assessmentExecution.workflow.submission.syncedAt,
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExecutionDialog(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Specialized Round Forms */}
        {showRoundForm && currentRound && (
          <Dialog open={showRoundForm} onOpenChange={setShowRoundForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(
                    roundTypes[currentRound?.type as keyof typeof roundTypes]
                      ?.icon || FileText,
                    { className: "h-5 w-5" },
                  )}
                  {
                    roundTypes[currentRound?.type as keyof typeof roundTypes]
                      ?.name
                  }
                </DialogTitle>
                <DialogDescription>
                  Complete the{" "}
                  {roundTypes[
                    currentRound?.type as keyof typeof roundTypes
                  ]?.name.toLowerCase()}{" "}
                  documentation
                </DialogDescription>
              </DialogHeader>

              {currentRound.type === "quality" && (
                <QualityRoundForm
                  patientId={patientId}
                  episodeId={episodeId}
                  onComplete={handleRoundFormComplete}
                  onCancel={handleRoundFormCancel}
                />
              )}

              {currentRound.type === "infection-control" && (
                <InfectionControlRoundForm
                  patientId={patientId}
                  episodeId={episodeId}
                  onComplete={handleRoundFormComplete}
                  onCancel={handleRoundFormCancel}
                />
              )}

              {currentRound.type === "clinical" && (
                <ClinicalRoundForm
                  patientId={patientId}
                  episodeId={episodeId}
                  onComplete={handleRoundFormComplete}
                  onCancel={handleRoundFormCancel}
                />
              )}

              {currentRound.type === "physician" && (
                <PhysicianRoundForm
                  patientId={patientId}
                  episodeId={episodeId}
                  onComplete={handleRoundFormComplete}
                  onCancel={handleRoundFormCancel}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Round Details View Dialog */}
        {selectedRoundForView && (
          <Dialog
            open={!!selectedRoundForView}
            onOpenChange={() => setSelectedRoundForView(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(
                    roundTypes[selectedRoundForView.type]?.icon || FileText,
                    { className: "h-5 w-5" },
                  )}
                  {roundTypes[selectedRoundForView.type]?.name} - Details
                </DialogTitle>
                <DialogDescription>
                  Completed by {selectedRoundForView.nurseName} on{" "}
                  {new Date(
                    selectedRoundForView.completedDate ||
                      selectedRoundForView.scheduledDate,
                  ).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status</span>
                        <Badge
                          className={getStatusColor(
                            selectedRoundForView.status,
                          )}
                        >
                          {selectedRoundForView.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Priority</span>
                        <Badge
                          className={getPriorityColor(
                            selectedRoundForView.priority,
                          )}
                        >
                          {selectedRoundForView.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          DOH Compliance
                        </span>
                        <Badge variant="secondary">
                          {selectedRoundForView.dohCompliance
                            ?.complianceScore || 0}
                          %
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vital Signs */}
                {selectedRoundForView.vitalSigns && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(selectedRoundForView.vitalSigns).map(
                          ([key, value]) => {
                            if (value === undefined || value === null)
                              return null;
                            return (
                              <div
                                key={key}
                                className="text-center p-3 bg-gray-50 rounded-lg"
                              >
                                <p className="text-sm text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                                <p className="text-lg font-semibold">
                                  {typeof value === "object"
                                    ? `${value.systolic}/${value.diastolic}`
                                    : value}
                                  {key === "temperature" && "°F"}
                                  {key === "oxygenSaturation" && "%"}
                                  {key === "painLevel" && "/10"}
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Clinical Findings and Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Clinical Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        {selectedRoundForView.findings ||
                          "No findings documented"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        {selectedRoundForView.recommendations ||
                          "No recommendations documented"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Checklist */}
                {Object.keys(selectedRoundForView.checklist).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Assessment Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(selectedRoundForView.checklist).map(
                          ([item, checked]) => (
                            <div
                              key={item}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle
                                className={`h-4 w-4 ${checked ? "text-green-500" : "text-gray-300"}`}
                              />
                              <span
                                className={`text-sm ${checked ? "text-gray-900" : "text-gray-500"}`}
                              >
                                {item}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quality Metrics */}
                {selectedRoundForView.qualityMetrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Patient Satisfaction
                          </p>
                          <p className="text-lg font-semibold">
                            {
                              selectedRoundForView.qualityMetrics
                                .patientSatisfaction
                            }
                            /10
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Care Quality</p>
                          <p className="text-lg font-semibold">
                            {selectedRoundForView.qualityMetrics.careQuality}/10
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Safety Score</p>
                          <p className="text-lg font-semibold">
                            {selectedRoundForView.qualityMetrics.safetyScore}/10
                          </p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Outcomes</p>
                          <p className="text-lg font-semibold">
                            {selectedRoundForView.qualityMetrics.outcomesMet
                              ? "Met"
                              : "Pending"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Reports Generation Dialog */}
        {showReportsDialog && dashboardMetrics && (
          <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Reports
                </DialogTitle>
                <DialogDescription>
                  Generate comprehensive reports for compliance, quality
                  metrics, and operational analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Report Period Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={reportingPeriod.startDate}
                      onChange={(e) =>
                        setReportingPeriod((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={reportingPeriod.endDate}
                      onChange={(e) =>
                        setReportingPeriod((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Report Types */}
                <div>
                  <h4 className="font-medium mb-3">Select Report Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(dashboardMetrics.reportTypes).map(
                      ([key, reportType]: [string, any]) => (
                        <Card
                          key={key}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedReportType === key
                              ? "ring-2 ring-blue-500 bg-blue-50"
                              : "hover:shadow-md"
                          }`}
                          onClick={() => setSelectedReportType(key)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  key === "compliance"
                                    ? "bg-green-100 text-green-600"
                                    : key === "quality"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-purple-100 text-purple-600"
                                }`}
                              >
                                {key === "compliance" ? (
                                  <Shield className="h-4 w-4" />
                                ) : key === "quality" ? (
                                  <Star className="h-4 w-4" />
                                ) : (
                                  <BarChart3 className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-sm mb-1">
                                  {reportType.name}
                                </h5>
                                <p className="text-xs text-gray-600 mb-2">
                                  {reportType.description}
                                </p>
                                <div className="space-y-1">
                                  {reportType.metrics.map(
                                    (metric: string, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span className="text-xs text-gray-700">
                                          {metric}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </div>

                {/* Export Options */}
                {selectedReportType && (
                  <div>
                    <h4 className="font-medium mb-3">Export Options</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => exportReport("pdf")}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => exportReport("excel")}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Excel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => exportReport("csv")}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        CSV
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowReportsDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => generateReport(selectedReportType)}
                  disabled={!selectedReportType || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default RoundsManagement;
