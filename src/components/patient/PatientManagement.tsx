import React, { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Users,
  Shield,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  UserPlus,
  Database,
  FileSpreadsheet,
  Lock,
  Unlock,
  Bell,
  MessageSquare,
  Camera,
  Mic,
  Globe,
  Smartphone,
  Wifi,
  WifiOff,
  CloudSync,
  HardDrive,
  Zap,
  Target,
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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PatientService,
  EpisodeService,
  RealtimeService,
} from "@/api/supabase.api";
import {
  getAllManpowerCapacity,
  generateAdvancedAnalytics,
  trackPatientOutcome,
  getPatientOutcomes,
  generateWorkforceIntelligence,
  performSystemHealthCheck,
  generateComprehensiveReport,
  getPatientManagementMetrics,
  generatePatientSearchAnalytics,
} from "@/api/manpower.api";
import { useErrorHandler } from "@/services/error-handler.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

interface Patient {
  id: string;
  emiratesId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  phoneNumber: string;
  email?: string;
  address: {
    street: string;
    city: string;
    emirate: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    isPrimary: boolean;
  };
  secondaryContacts?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  }[];
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    copayAmount?: number;
    deductible?: number;
    authorizationNumber?: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    surgicalHistory?: string[];
    familyHistory?: string[];
  };
  status: "Active" | "Inactive" | "Discharged" | "Pending" | "Transferred";
  registrationDate: string;
  lastVisit?: string;
  nextAppointment?: string;
  assignedClinician?: string;
  careTeam?: {
    id: string;
    name: string;
    role: string;
    specialty?: string;
  }[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  complianceScore: number;
  satisfactionScore: number;
  // Enhanced Patient Management Features
  acuityScore?: number;
  languagePreference?: string;
  culturalConsiderations?: string[];
  accessibilityNeeds?: string[];
  transportationNeeds?: boolean;
  familyAccessControls?: {
    allowedMembers: {
      name: string;
      relationship: string;
      phoneNumber: string;
      accessLevel: "View" | "Limited" | "Full";
      permissions: string[];
    }[];
    restrictedInformation: string[];
    consentStatus: "Granted" | "Pending" | "Denied";
    lastUpdated: string;
  };
  digitalEngagement?: {
    portalAccess: boolean;
    mobileAppUser: boolean;
    communicationPreferences: string[];
    lastLogin?: string;
  };
  qualityMetrics?: {
    outcomeScores: number[];
    goalAchievement: number;
    readmissionRisk: number;
    medicationAdherence: number;
  };
  financialInfo?: {
    totalCost: number;
    insuranceCoverage: number;
    outOfPocketExpenses: number;
    paymentStatus: "Current" | "Overdue" | "Paid";
  };
  tags?: string[];
  notes?: string;
  createdBy: string;
  lastModifiedBy?: string;
  lastModified?: string;
}

interface PatientManagementProps {
  onPatientSelect?: (patient: Patient) => void;
  selectedPatientId?: string;
  viewMode?: "list" | "grid" | "detailed" | "analytics";
  showFilters?: boolean;
  enableAdvancedFeatures?: boolean;
  departmentFilter?: string;
  roleBasedAccess?: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canViewAnalytics: boolean;
    canManageFamilyAccess: boolean;
  };
}

interface SearchFilters {
  searchTerm: string;
  status: string;
  riskLevel: string;
  insuranceProvider: string;
  assignedClinician: string;
  dateRange: {
    from?: string;
    to?: string;
  };
  tags: string[];
  acuityLevel?: string;
  hasUpcomingAppointments?: boolean;
  complianceThreshold?: number;
}

interface PatientAnalytics {
  totalPatients: number;
  activePatients: number;
  averageSatisfactionScore: number;
  averageComplianceScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  insuranceDistribution: { [key: string]: number };
  outcomeMetrics: {
    averageOutcomeScore: number;
    goalAchievementRate: number;
    readmissionRate: number;
    medicationAdherenceRate: number;
  };
  trendData: {
    patientGrowth: number[];
    satisfactionTrend: number[];
    complianceTrend: number[];
  };
  demographicBreakdown: {
    ageGroups: { [key: string]: number };
    genderDistribution: { [key: string]: number };
    emirateDistribution: { [key: string]: number };
  };
}

const PatientManagement: React.FC<PatientManagementProps> = ({
  onPatientSelect,
  selectedPatientId,
  viewMode = "list",
  showFilters = true,
  enableAdvancedFeatures = true,
  departmentFilter,
  roleBasedAccess = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canViewAnalytics: true,
    canManageFamilyAccess: true,
  },
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    status: "All",
    riskLevel: "All",
    insuranceProvider: "All",
    assignedClinician: "All",
    dateRange: {},
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFamilyAccessDialog, setShowFamilyAccessDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({});
  const [patientAnalytics, setPatientAnalytics] =
    useState<PatientAnalytics | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"list" | "grid" | "analytics">(
    viewMode as any,
  );
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error">(
    "synced",
  );
  const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);
  const { handleSuccess, handleApiError } = useErrorHandler();

  // Enhanced mock data with advanced features
  const mockPatients: Patient[] = [
    {
      id: "1",
      emiratesId: "784-1990-1234567-1",
      firstName: "Ahmed",
      lastName: "Al-Mansoori",
      dateOfBirth: "1985-03-15",
      gender: "Male",
      phoneNumber: "+971-50-123-4567",
      email: "ahmed.almansoori@email.com",
      address: {
        street: "Al Wasl Road, Villa 123",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "12345",
        coordinates: {
          latitude: 25.2048,
          longitude: 55.2708,
        },
      },
      emergencyContact: {
        name: "Fatima Al-Mansoori",
        relationship: "Wife",
        phoneNumber: "+971-50-234-5678",
        email: "fatima.almansoori@email.com",
        isPrimary: true,
      },
      secondaryContacts: [
        {
          name: "Omar Al-Mansoori",
          relationship: "Son",
          phoneNumber: "+971-50-345-6789",
          email: "omar.almansoori@email.com",
        },
      ],
      insuranceInfo: {
        provider: "Daman - Thiqa",
        policyNumber: "THQ-2023-001234",
        expiryDate: "2024-12-31",
        copayAmount: 50,
        deductible: 500,
        authorizationNumber: "AUTH-456789",
      },
      medicalHistory: {
        conditions: ["Diabetes Type 2", "Hypertension"],
        allergies: ["Penicillin"],
        medications: ["Metformin 500mg", "Lisinopril 10mg"],
        surgicalHistory: ["Appendectomy (2010)"],
        familyHistory: ["Diabetes (Father)", "Heart Disease (Mother)"],
      },
      status: "Active",
      registrationDate: "2023-01-15",
      lastVisit: "2023-06-20",
      nextAppointment: "2023-07-05",
      assignedClinician: "Dr. Sarah Ahmed",
      careTeam: [
        {
          id: "DOC001",
          name: "Dr. Sarah Ahmed",
          role: "Primary Physician",
          specialty: "Internal Medicine",
        },
        {
          id: "NUR001",
          name: "Nurse Fatima Al-Zahra",
          role: "Registered Nurse",
          specialty: "Home Healthcare",
        },
      ],
      riskLevel: "Medium",
      complianceScore: 85,
      satisfactionScore: 92,
      acuityScore: 3,
      languagePreference: "Arabic",
      culturalConsiderations: ["Islamic dietary requirements", "Prayer times"],
      accessibilityNeeds: ["Wheelchair accessible"],
      transportationNeeds: false,
      familyAccessControls: {
        allowedMembers: [
          {
            name: "Fatima Al-Mansoori",
            relationship: "Wife",
            phoneNumber: "+971-50-234-5678",
            accessLevel: "Full",
            permissions: [
              "View Medical Records",
              "Schedule Appointments",
              "Receive Updates",
            ],
          },
          {
            name: "Omar Al-Mansoori",
            relationship: "Son",
            phoneNumber: "+971-50-345-6789",
            accessLevel: "Limited",
            permissions: ["Receive Emergency Updates"],
          },
        ],
        restrictedInformation: [],
        consentStatus: "Granted",
        lastUpdated: "2023-06-15",
      },
      digitalEngagement: {
        portalAccess: true,
        mobileAppUser: true,
        communicationPreferences: ["SMS", "Email", "Push Notifications"],
        lastLogin: "2023-06-18",
      },
      qualityMetrics: {
        outcomeScores: [85, 88, 92, 87],
        goalAchievement: 78,
        readmissionRisk: 15,
        medicationAdherence: 92,
      },
      financialInfo: {
        totalCost: 2400,
        insuranceCoverage: 1920,
        outOfPocketExpenses: 480,
        paymentStatus: "Current",
      },
      tags: ["Diabetes", "High Priority", "Family Caregiver"],
      notes:
        "Patient is very compliant with treatment plan. Family is actively involved in care.",
      createdBy: "admin",
      lastModifiedBy: "nurse_001",
      lastModified: "2023-06-20T10:30:00Z",
    },
    {
      id: "2",
      emiratesId: "784-1988-2345678-2",
      firstName: "Mariam",
      lastName: "Al-Zahra",
      dateOfBirth: "1988-07-22",
      gender: "Female",
      phoneNumber: "+971-50-987-6543",
      email: "mariam.alzahra@email.com",
      address: {
        street: "Sheikh Zayed Road, Apt 456",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "54321",
      },
      emergencyContact: {
        name: "Hassan Al-Zahra",
        relationship: "Husband",
        phoneNumber: "+971-50-876-5432",
        isPrimary: true,
      },
      insuranceInfo: {
        provider: "ADNIC",
        policyNumber: "ADN-2023-005678",
        expiryDate: "2024-08-31",
      },
      medicalHistory: {
        conditions: ["Asthma"],
        allergies: ["Shellfish"],
        medications: ["Albuterol Inhaler"],
      },
      status: "Active",
      registrationDate: "2023-02-10",
      lastVisit: "2023-06-18",
      assignedClinician: "Dr. Amina Hassan",
      riskLevel: "Low",
      complianceScore: 95,
      satisfactionScore: 88,
      acuityScore: 2,
      languagePreference: "English",
      tags: ["Asthma", "Young Adult"],
      createdBy: "admin",
      lastModified: "2023-06-18T14:20:00Z",
    },
  ];

  useEffect(() => {
    loadPatients();
    if (enableAdvancedFeatures) {
      loadPatientAnalytics();
      checkSystemStatus();
    }
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchFilters]);

  // Enhanced filtering with advanced search capabilities
  const filteredPatientsData = useMemo(() => {
    let filtered = patients;

    // Text search across multiple fields
    if (searchFilters.searchTerm) {
      const searchLower = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.emiratesId.includes(searchFilters.searchTerm) ||
          patient.phoneNumber.includes(searchFilters.searchTerm) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.assignedClinician?.toLowerCase().includes(searchLower) ||
          patient.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Status filter
    if (searchFilters.status !== "All") {
      filtered = filtered.filter(
        (patient) => patient.status === searchFilters.status,
      );
    }

    // Risk level filter
    if (searchFilters.riskLevel !== "All") {
      filtered = filtered.filter(
        (patient) => patient.riskLevel === searchFilters.riskLevel,
      );
    }

    // Insurance provider filter
    if (searchFilters.insuranceProvider !== "All") {
      filtered = filtered.filter((patient) =>
        patient.insuranceInfo.provider.includes(
          searchFilters.insuranceProvider,
        ),
      );
    }

    // Assigned clinician filter
    if (searchFilters.assignedClinician !== "All") {
      filtered = filtered.filter(
        (patient) =>
          patient.assignedClinician === searchFilters.assignedClinician,
      );
    }

    // Date range filter
    if (searchFilters.dateRange.from || searchFilters.dateRange.to) {
      filtered = filtered.filter((patient) => {
        const patientDate = new Date(patient.registrationDate);
        const fromDate = searchFilters.dateRange.from
          ? new Date(searchFilters.dateRange.from)
          : null;
        const toDate = searchFilters.dateRange.to
          ? new Date(searchFilters.dateRange.to)
          : null;

        if (fromDate && patientDate < fromDate) return false;
        if (toDate && patientDate > toDate) return false;
        return true;
      });
    }

    // Tags filter
    if (searchFilters.tags.length > 0) {
      filtered = filtered.filter((patient) =>
        searchFilters.tags.some((tag) => patient.tags?.includes(tag)),
      );
    }

    // Acuity level filter
    if (searchFilters.acuityLevel) {
      filtered = filtered.filter(
        (patient) =>
          patient.acuityScore?.toString() === searchFilters.acuityLevel,
      );
    }

    // Upcoming appointments filter
    if (searchFilters.hasUpcomingAppointments) {
      filtered = filtered.filter((patient) => patient.nextAppointment);
    }

    // Compliance threshold filter
    if (searchFilters.complianceThreshold) {
      filtered = filtered.filter(
        (patient) =>
          patient.complianceScore >= searchFilters.complianceThreshold!,
      );
    }

    return filtered;
  }, [patients, searchFilters]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      // const { data, error } = await PatientService.searchPatients("");
      // if (error) throw error;
      // setPatients(data || []);

      // Using mock data for now
      setTimeout(() => {
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      handleApiError(error, "Loading patients");
      setIsLoading(false);
    }
  };

  const loadPatientAnalytics = async () => {
    try {
      const [analytics, patientMetrics] = await Promise.all([
        generateAdvancedAnalytics({
          start_date: "2023-01-01",
          end_date: new Date().toISOString().split("T")[0],
        }),
        getPatientManagementMetrics({
          date_from: "2023-01-01",
          date_to: new Date().toISOString().split("T")[0],
        }),
      ]);

      // Transform analytics data for patient management
      const patientAnalyticsData: PatientAnalytics = {
        totalPatients: patientMetrics.total_patients,
        activePatients: patientMetrics.active_patients,
        averageSatisfactionScore: patientMetrics.average_satisfaction,
        averageComplianceScore: patientMetrics.compliance_rate * 100,
        riskDistribution: {
          low: Math.round(patients.length * 0.4),
          medium: Math.round(patients.length * 0.35),
          high: Math.round(patients.length * 0.2),
          critical: Math.round(patients.length * 0.05),
        },
        insuranceDistribution: {
          "Daman - Thiqa": 45,
          ADNIC: 25,
          AXA: 15,
          Others: 15,
        },
        outcomeMetrics: {
          averageOutcomeScore: 87.5,
          goalAchievementRate: 78.2,
          readmissionRate: patientMetrics.readmission_rate * 100,
          medicationAdherenceRate: 91.3,
        },
        trendData: {
          patientGrowth: analytics.trend_analysis.patient_volume_trend,
          satisfactionTrend: analytics.trend_analysis.satisfaction_trend,
          complianceTrend: [92, 94, 91, 95, 93, 96, 94],
        },
        demographicBreakdown: {
          ageGroups: {
            "18-30": 15,
            "31-45": 25,
            "46-60": 35,
            "60+": 25,
          },
          genderDistribution: {
            Male: 52,
            Female: 48,
          },
          emirateDistribution: {
            Dubai: 35,
            "Abu Dhabi": 30,
            Sharjah: 20,
            Others: 15,
          },
        },
      };

      setPatientAnalytics(patientAnalyticsData);
    } catch (error) {
      console.error("Failed to load patient analytics:", error);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const healthCheck = await performSystemHealthCheck();
      setSyncStatus(
        healthCheck.overall_health === "Excellent" ? "synced" : "error",
      );
    } catch (error) {
      setSyncStatus("error");
    }
  };

  const filterPatients = () => {
    setFilteredPatients(filteredPatientsData);
  };

  const handleAddPatient = async () => {
    try {
      // Validate required fields
      if (
        !newPatient.firstName ||
        !newPatient.lastName ||
        !newPatient.emiratesId
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Replace with actual API call
      // const { data, error } = await PatientService.createPatient(newPatient);
      // if (error) throw error;

      const patient: Patient = {
        ...newPatient,
        id: Date.now().toString(),
        registrationDate: new Date().toISOString().split("T")[0],
        status: "Active",
        complianceScore: 0,
        satisfactionScore: 0,
        createdBy: "current_user", // Replace with actual user
        lastModified: new Date().toISOString(),
        familyAccessControls: {
          allowedMembers: [],
          restrictedInformation: [],
          consentStatus: "Pending",
          lastUpdated: new Date().toISOString(),
        },
        digitalEngagement: {
          portalAccess: false,
          mobileAppUser: false,
          communicationPreferences: ["Phone"],
        },
        tags: [],
      } as Patient;

      setPatients([...patients, patient]);
      setNewPatient({});
      setShowAddDialog(false);
      handleSuccess("Patient added successfully");

      // Track patient outcome for analytics
      if (enableAdvancedFeatures) {
        await trackPatientOutcome({
          patient_id: patient.id,
          episode_id: `EP-${patient.id}`,
          staff_assigned: [patient.assignedClinician || "unassigned"],
          service_type: "Initial Registration",
          start_date: patient.registrationDate,
          clinical_outcomes: {
            functional_improvement: 0,
            pain_reduction: 0,
            medication_adherence: 0,
            goal_achievement: 0,
            readmission_within_30_days: false,
          },
          satisfaction_metrics: {
            overall_satisfaction: 0,
            care_quality_rating: 0,
            communication_rating: 0,
            timeliness_rating: 0,
            would_recommend: false,
          },
          cost_effectiveness: {
            total_cost: 0,
            cost_per_visit: 0,
            insurance_coverage: 0,
            cost_savings_vs_hospital: 0,
          },
          quality_indicators: {
            documentation_completeness: 100,
            care_plan_adherence: 0,
            safety_incidents: 0,
            infection_prevention_score: 100,
          },
          staff_performance_impact: {
            primary_nurse_rating: 0,
            therapist_effectiveness: 0,
            care_coordination_score: 0,
            family_engagement_level: 0,
          },
        });
      }
    } catch (error) {
      handleApiError(error, "Adding patient");
    }
  };

  const handleEditPatient = async () => {
    if (!selectedPatient) return;

    try {
      // Replace with actual API call
      // const { data, error } = await PatientService.updatePatient(selectedPatient.id, selectedPatient);
      // if (error) throw error;

      const updatedPatient = {
        ...selectedPatient,
        lastModified: new Date().toISOString(),
        lastModifiedBy: "current_user", // Replace with actual user
      };

      setPatients(
        patients.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)),
      );
      setShowEditDialog(false);
      setSelectedPatient(null);
      handleSuccess("Patient updated successfully");
    } catch (error) {
      handleApiError(error, "Updating patient");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPatients.length === 0) {
      handleApiError(new Error("Please select patients first"), "Bulk action");
      return;
    }

    try {
      switch (action) {
        case "export":
          await handleExportPatients(selectedPatients);
          break;
        case "deactivate":
          await handleBulkStatusUpdate(selectedPatients, "Inactive");
          break;
        case "assign_clinician":
          // Open dialog for clinician assignment
          break;
        case "add_tags":
          // Open dialog for tag management
          break;
        default:
          break;
      }
    } catch (error) {
      handleApiError(error, "Bulk action");
    }
  };

  const handleBulkStatusUpdate = async (
    patientIds: string[],
    newStatus: string,
  ) => {
    try {
      const updatedPatients = patients.map((patient) =>
        patientIds.includes(patient.id)
          ? {
              ...patient,
              status: newStatus as any,
              lastModified: new Date().toISOString(),
            }
          : patient,
      );

      setPatients(updatedPatients);
      setSelectedPatients([]);
      handleSuccess(`${patientIds.length} patients updated successfully`);
    } catch (error) {
      handleApiError(error, "Bulk status update");
    }
  };

  const handleExportPatients = async (patientIds?: string[]) => {
    try {
      const patientsToExport = patientIds
        ? patients.filter((p) => patientIds.includes(p.id))
        : filteredPatientsData;

      // Create CSV content
      const headers = [
        "ID",
        "Emirates ID",
        "First Name",
        "Last Name",
        "Date of Birth",
        "Gender",
        "Phone",
        "Email",
        "Status",
        "Risk Level",
        "Compliance Score",
        "Satisfaction Score",
        "Registration Date",
      ];

      const csvContent = [
        headers.join(","),
        ...patientsToExport.map((patient) =>
          [
            patient.id,
            patient.emiratesId,
            patient.firstName,
            patient.lastName,
            patient.dateOfBirth,
            patient.gender,
            patient.phoneNumber,
            patient.email || "",
            patient.status,
            patient.riskLevel,
            patient.complianceScore,
            patient.satisfactionScore,
            patient.registrationDate,
          ].join(","),
        ),
      ].join("\n");

      // Download CSV file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      handleSuccess(
        `Exported ${patientsToExport.length} patients successfully`,
      );
    } catch (error) {
      handleApiError(error, "Exporting patients");
    }
  };

  const handleImportPatients = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      const importedPatients: Patient[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",");
          const patient: Partial<Patient> = {};

          headers.forEach((header, index) => {
            const value = values[index]?.trim();
            switch (header.trim()) {
              case "Emirates ID":
                patient.emiratesId = value;
                break;
              case "First Name":
                patient.firstName = value;
                break;
              case "Last Name":
                patient.lastName = value;
                break;
              case "Date of Birth":
                patient.dateOfBirth = value;
                break;
              case "Gender":
                patient.gender = value as "Male" | "Female";
                break;
              case "Phone":
                patient.phoneNumber = value;
                break;
              case "Email":
                patient.email = value;
                break;
              default:
                break;
            }
          });

          if (patient.firstName && patient.lastName && patient.emiratesId) {
            importedPatients.push({
              ...patient,
              id: Date.now().toString() + i,
              status: "Active",
              registrationDate: new Date().toISOString().split("T")[0],
              complianceScore: 0,
              satisfactionScore: 0,
              riskLevel: "Low",
              createdBy: "import",
              lastModified: new Date().toISOString(),
            } as Patient);
          }
        }
      }

      setPatients([...patients, ...importedPatients]);
      handleSuccess(
        `Imported ${importedPatients.length} patients successfully`,
      );
      setShowImportDialog(false);
    } catch (error) {
      handleApiError(error, "Importing patients");
    }
  };

  const handleFamilyAccessUpdate = async (
    patientId: string,
    accessControls: any,
  ) => {
    try {
      const updatedPatients = patients.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              familyAccessControls: {
                ...accessControls,
                lastUpdated: new Date().toISOString(),
              },
              lastModified: new Date().toISOString(),
            }
          : patient,
      );

      setPatients(updatedPatients);
      setShowFamilyAccessDialog(false);
      handleSuccess("Family access controls updated successfully");
    } catch (error) {
      handleApiError(error, "Updating family access controls");
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-white p-6 rounded-lg shadow-sm w-full">
        {/* Enhanced Header with System Status */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Patient Management
                {enableAdvancedFeatures && (
                  <Badge variant="outline" className="text-xs">
                    Enhanced
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2">
                Comprehensive patient records and analytics
                {syncStatus === "synced" && (
                  <Wifi className="h-3 w-3 text-green-500" />
                )}
                {syncStatus === "pending" && (
                  <CloudSync className="h-3 w-3 text-orange-500 animate-spin" />
                )}
                {syncStatus === "error" && (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
              </p>
            </div>
            {isOfflineMode && (
              <Alert className="w-auto">
                <HardDrive className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Offline Mode - Changes will sync when connected
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex border rounded-lg p-1">
              <Button
                variant={currentView === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("list")}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant={currentView === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("grid")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              {enableAdvancedFeatures && (
                <Button
                  variant={currentView === "analytics" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("analytics")}
                >
                  <PieChart className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            {roleBasedAccess.canCreate && (
              <Button onClick={() => setShowAddDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            )}

            {roleBasedAccess.canExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExportPatients()}>
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Patients
                  </DropdownMenuItem>
                  {selectedPatients.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("export")}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Selected ({selectedPatients.length})
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("deactivate")}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Deactivate Selected
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="outline" onClick={loadPatients}>
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        {showFilters && (
          <div className="mb-6">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name, Emirates ID, phone, email, or tags..."
                    value={searchFilters.searchTerm}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={searchFilters.status}
                onValueChange={(value) =>
                  setSearchFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={searchFilters.riskLevel}
                onValueChange={(value) =>
                  setSearchFilters((prev) => ({ ...prev, riskLevel: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Risk Levels</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              {enableAdvancedFeatures && (
                <>
                  <Select
                    value={searchFilters.insuranceProvider}
                    onValueChange={(value) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        insuranceProvider: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Providers</SelectItem>
                      <SelectItem value="Daman">Daman</SelectItem>
                      <SelectItem value="ADNIC">ADNIC</SelectItem>
                      <SelectItem value="AXA">AXA</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setAdvancedSearchVisible(!advancedSearchVisible)
                    }
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </>
              )}
            </div>

            {/* Advanced Search Panel */}
            {advancedSearchVisible && enableAdvancedFeatures && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Acuity Level</Label>
                    <Select
                      value={searchFilters.acuityLevel || ""}
                      onValueChange={(value) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          acuityLevel: value || undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Level</SelectItem>
                        <SelectItem value="1">Level 1 (Low)</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3 (Medium)</SelectItem>
                        <SelectItem value="4">Level 4</SelectItem>
                        <SelectItem value="5">Level 5 (Critical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Registration Date From
                    </Label>
                    <Input
                      type="date"
                      value={searchFilters.dateRange.from || ""}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            from: e.target.value || undefined,
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Registration Date To
                    </Label>
                    <Input
                      type="date"
                      value={searchFilters.dateRange.to || ""}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            to: e.target.value || undefined,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="upcoming-appointments"
                      checked={searchFilters.hasUpcomingAppointments || false}
                      onCheckedChange={(checked) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          hasUpcomingAppointments: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="upcoming-appointments" className="text-sm">
                      Has Upcoming Appointments
                    </Label>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Min Compliance Score
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={searchFilters.complianceThreshold || ""}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          complianceThreshold: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSearchFilters({
                          searchTerm: "",
                          status: "All",
                          riskLevel: "All",
                          insuranceProvider: "All",
                          assignedClinician: "All",
                          dateRange: {},
                          tags: [],
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary and Quick Stats */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredPatientsData.length} of {patients.length}{" "}
              patients
            </div>
            {selectedPatients.length > 0 && (
              <Badge variant="secondary">
                {selectedPatients.length} selected
              </Badge>
            )}
          </div>

          {enableAdvancedFeatures && patientAnalytics && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active: {patientAnalytics.activePatients}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>
                  Avg Satisfaction:{" "}
                  {patientAnalytics.averageSatisfactionScore.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-blue-500" />
                <span>
                  Avg Compliance:{" "}
                  {patientAnalytics.averageComplianceScore.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading patients...</span>
          </div>
        ) : (
          <>
            {currentView === "analytics" &&
            enableAdvancedFeatures &&
            patientAnalytics ? (
              <PatientAnalyticsView analytics={patientAnalytics} />
            ) : currentView === "grid" ? (
              <PatientGridView
                patients={filteredPatientsData}
                selectedPatients={selectedPatients}
                onPatientSelect={onPatientSelect}
                onPatientEdit={(patient) => {
                  setSelectedPatient(patient);
                  setShowEditDialog(true);
                }}
                onSelectionChange={setSelectedPatients}
                roleBasedAccess={roleBasedAccess}
                enableAdvancedFeatures={enableAdvancedFeatures}
              />
            ) : (
              <PatientListView
                patients={filteredPatientsData}
                selectedPatients={selectedPatients}
                selectedPatientId={selectedPatientId}
                onPatientSelect={onPatientSelect}
                onPatientEdit={(patient) => {
                  setSelectedPatient(patient);
                  setShowEditDialog(true);
                }}
                onFamilyAccessEdit={(patient) => {
                  setSelectedPatient(patient);
                  setShowFamilyAccessDialog(true);
                }}
                onSelectionChange={setSelectedPatients}
                roleBasedAccess={roleBasedAccess}
                enableAdvancedFeatures={enableAdvancedFeatures}
              />
            )}
          </>
        )}

        {/* Enhanced Dialogs */}
        {/* Add Patient Dialog - Enhanced */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information. Required fields are marked with *
              </DialogDescription>
            </DialogHeader>
            <EnhancedPatientForm
              patient={newPatient}
              onChange={setNewPatient}
              onSubmit={handleAddPatient}
              onCancel={() => setShowAddDialog(false)}
              isEditing={false}
              enableAdvancedFeatures={enableAdvancedFeatures}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog - Enhanced */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information</DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <EnhancedPatientForm
                patient={selectedPatient}
                onChange={setSelectedPatient}
                onSubmit={handleEditPatient}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedPatient(null);
                }}
                isEditing={true}
                enableAdvancedFeatures={enableAdvancedFeatures}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Family Access Controls Dialog */}
        {enableAdvancedFeatures && (
          <Dialog
            open={showFamilyAccessDialog}
            onOpenChange={setShowFamilyAccessDialog}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Family Access Controls</DialogTitle>
                <DialogDescription>
                  Manage family member access to patient information
                </DialogDescription>
              </DialogHeader>
              {selectedPatient && (
                <FamilyAccessControlsForm
                  patient={selectedPatient}
                  onSave={(accessControls) =>
                    handleFamilyAccessUpdate(selectedPatient.id, accessControls)
                  }
                  onCancel={() => setShowFamilyAccessDialog(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Patients</DialogTitle>
              <DialogDescription>
                Upload a CSV file with patient data. Download template for
                format reference.
              </DialogDescription>
            </DialogHeader>
            <PatientImportForm
              onImport={handleImportPatients}
              onCancel={() => setShowImportDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

// Enhanced Patient List View Component
const PatientListView: React.FC<{
  patients: Patient[];
  selectedPatients: string[];
  selectedPatientId?: string;
  onPatientSelect?: (patient: Patient) => void;
  onPatientEdit: (patient: Patient) => void;
  onFamilyAccessEdit: (patient: Patient) => void;
  onSelectionChange: (selected: string[]) => void;
  roleBasedAccess: any;
  enableAdvancedFeatures: boolean;
}> = ({
  patients,
  selectedPatients,
  selectedPatientId,
  onPatientSelect,
  onPatientEdit,
  onFamilyAccessEdit,
  onSelectionChange,
  roleBasedAccess,
  enableAdvancedFeatures,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(patients.map((p) => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPatients, patientId]);
    } else {
      onSelectionChange(selectedPatients.filter((id) => id !== patientId));
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedPatients.length === patients.length &&
                  patients.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Emirates ID</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            {enableAdvancedFeatures && <TableHead>Acuity</TableHead>}
            <TableHead>Scores</TableHead>
            {enableAdvancedFeatures && <TableHead>Next Appt</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedPatientId === patient.id ? "bg-blue-50" : ""
              }`}
              onClick={() => onPatientSelect?.(patient)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedPatients.includes(patient.id)}
                  onCheckedChange={(checked) =>
                    handleSelectPatient(patient.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patient.gender} • Born: {patient.dateOfBirth}
                    </p>
                    {enableAdvancedFeatures &&
                      patient.tags &&
                      patient.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {patient.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {patient.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{patient.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {patient.emiratesId}
                </code>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {patient.phoneNumber}
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {patient.email}
                    </div>
                  )}
                  {enableAdvancedFeatures &&
                    patient.digitalEngagement?.portalAccess && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Smartphone className="h-3 w-3" />
                        Portal User
                      </div>
                    )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="font-medium">
                    {patient.insuranceInfo.provider}
                  </p>
                  <p className="text-muted-foreground">
                    {patient.insuranceInfo.policyNumber}
                  </p>
                  {enableAdvancedFeatures &&
                    patient.insuranceInfo.authorizationNumber && (
                      <p className="text-xs text-green-600">
                        Auth: {patient.insuranceInfo.authorizationNumber}
                      </p>
                    )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    patient.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : patient.status === "Inactive"
                        ? "bg-gray-100 text-gray-800"
                        : patient.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                  }
                >
                  {patient.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    patient.riskLevel === "Critical"
                      ? "bg-red-100 text-red-800"
                      : patient.riskLevel === "High"
                        ? "bg-orange-100 text-orange-800"
                        : patient.riskLevel === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }
                >
                  {patient.riskLevel}
                </Badge>
              </TableCell>
              {enableAdvancedFeatures && (
                <TableCell>
                  {patient.acuityScore && (
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        {patient.acuityScore}
                      </span>
                    </div>
                  )}
                </TableCell>
              )}
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs">
                        {patient.complianceScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">
                        {patient.satisfactionScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              {enableAdvancedFeatures && (
                <TableCell>
                  {patient.nextAppointment ? (
                    <div className="text-xs">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(patient.nextAppointment).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      None scheduled
                    </span>
                  )}
                </TableCell>
              )}
              <TableCell>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatientSelect?.(patient);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Details</TooltipContent>
                  </Tooltip>

                  {roleBasedAccess.canEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPatientEdit(patient);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Patient</TooltipContent>
                    </Tooltip>
                  )}

                  {enableAdvancedFeatures &&
                    roleBasedAccess.canManageFamilyAccess && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFamilyAccessEdit(patient);
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Family Access</TooltipContent>
                      </Tooltip>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Placeholder components for enhanced features
const PatientGridView: React.FC<any> = ({ patients }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {patients.map((patient: Patient) => (
      <Card key={patient.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {patient.firstName} {patient.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {patient.emiratesId}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Status:</span>
              <Badge
                variant={patient.status === "Active" ? "default" : "secondary"}
              >
                {patient.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Risk Level:</span>
              <Badge
                variant={
                  patient.riskLevel === "Critical" ? "destructive" : "outline"
                }
              >
                {patient.riskLevel}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Compliance:</span>
              <span className="text-sm font-medium">
                {patient.complianceScore}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const PatientAnalyticsView: React.FC<{ analytics: PatientAnalytics }> = ({
  analytics,
}) => (
  <div className="space-y-6">
    {/* Key Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            Active: {analytics.activePatients}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Satisfaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.averageSatisfactionScore.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Out of 5.0</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.averageComplianceScore.toFixed(1)}%
          </div>
          <Progress value={analytics.averageComplianceScore} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Goal Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.outcomeMetrics.goalAchievementRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              Treatment goals
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Risk Distribution Chart */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Risk Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Low Risk</span>
              </div>
              <span className="text-sm font-medium">
                {analytics.riskDistribution.low}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Medium Risk</span>
              </div>
              <span className="text-sm font-medium">
                {analytics.riskDistribution.medium}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">High Risk</span>
              </div>
              <span className="text-sm font-medium">
                {analytics.riskDistribution.high}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Critical Risk</span>
              </div>
              <span className="text-sm font-medium">
                {analytics.riskDistribution.critical}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Insurance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.insuranceDistribution).map(
              ([provider, percentage]) => (
                <div
                  key={provider}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm">{provider}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Outcome Metrics */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Clinical Outcomes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.outcomeMetrics.averageOutcomeScore.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Outcome Score</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.outcomeMetrics.goalAchievementRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Goal Achievement</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.outcomeMetrics.readmissionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Readmission Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.outcomeMetrics.medicationAdherenceRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              Medication Adherence
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const EnhancedPatientForm: React.FC<any> = ({
  patient,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  enableAdvancedFeatures,
}) => {
  const [currentTab, setCurrentTab] = useState("basic");

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          {enableAdvancedFeatures && (
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={patient.firstName || ""}
                onChange={(e) =>
                  onChange({ ...patient, firstName: e.target.value })
                }
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={patient.lastName || ""}
                onChange={(e) =>
                  onChange({ ...patient, lastName: e.target.value })
                }
                placeholder="Enter last name"
              />
            </div>
            <div>
              <Label htmlFor="emiratesId">Emirates ID *</Label>
              <Input
                id="emiratesId"
                value={patient.emiratesId || ""}
                onChange={(e) =>
                  onChange({ ...patient, emiratesId: e.target.value })
                }
                placeholder="784-YYYY-XXXXXXX-X"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={patient.dateOfBirth || ""}
                onChange={(e) =>
                  onChange({ ...patient, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={patient.gender || ""}
                onValueChange={(value) =>
                  onChange({ ...patient, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={patient.phoneNumber || ""}
                onChange={(e) =>
                  onChange({ ...patient, phoneNumber: e.target.value })
                }
                placeholder="+971-XX-XXX-XXXX"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={patient.email || ""}
                onChange={(e) =>
                  onChange({ ...patient, email: e.target.value })
                }
                placeholder="patient@email.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={patient.address?.street || ""}
                onChange={(e) =>
                  onChange({
                    ...patient,
                    address: { ...patient.address, street: e.target.value },
                  })
                }
                placeholder="Enter full address"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Textarea
                id="conditions"
                value={patient.medicalHistory?.conditions?.join(", ") || ""}
                onChange={(e) =>
                  onChange({
                    ...patient,
                    medicalHistory: {
                      ...patient.medicalHistory,
                      conditions: e.target.value
                        .split(", ")
                        .filter((c) => c.trim()),
                    },
                  })
                }
                placeholder="Enter medical conditions (comma separated)"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={patient.medicalHistory?.allergies?.join(", ") || ""}
                onChange={(e) =>
                  onChange({
                    ...patient,
                    medicalHistory: {
                      ...patient.medicalHistory,
                      allergies: e.target.value
                        .split(", ")
                        .filter((a) => a.trim()),
                    },
                  })
                }
                placeholder="Enter allergies (comma separated)"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                value={patient.medicalHistory?.medications?.join(", ") || ""}
                onChange={(e) =>
                  onChange({
                    ...patient,
                    medicalHistory: {
                      ...patient.medicalHistory,
                      medications: e.target.value
                        .split(", ")
                        .filter((m) => m.trim()),
                    },
                  })
                }
                placeholder="Enter current medications (comma separated)"
                rows={2}
              />
            </div>
          </div>
        </TabsContent>

        {enableAdvancedFeatures && (
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select
                  value={patient.riskLevel || "Low"}
                  onValueChange={(value) =>
                    onChange({ ...patient, riskLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="languagePreference">Language Preference</Label>
                <Select
                  value={patient.languagePreference || ""}
                  onValueChange={(value) =>
                    onChange({ ...patient, languagePreference: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                    <SelectItem value="Filipino">Filipino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={patient.notes || ""}
                  onChange={(e) =>
                    onChange({ ...patient, notes: e.target.value })
                  }
                  placeholder="Additional notes about the patient"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? "Update" : "Add"} Patient
        </Button>
      </div>
    </div>
  );
};

const FamilyAccessControlsForm: React.FC<any> = ({
  patient,
  onSave,
  onCancel,
}) => {
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    accessLevel: "View" as "View" | "Limited" | "Full",
    permissions: [] as string[],
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const availablePermissions = [
    "View Medical Records",
    "Schedule Appointments",
    "Receive Updates",
    "Emergency Contact",
    "Billing Information",
    "Care Plan Access",
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) return;

    const updatedAccessControls = {
      ...patient.familyAccessControls,
      allowedMembers: [
        ...(patient.familyAccessControls?.allowedMembers || []),
        newMember,
      ],
    };

    onSave(updatedAccessControls);
    setNewMember({
      name: "",
      relationship: "",
      phoneNumber: "",
      accessLevel: "View",
      permissions: [],
    });
    setShowAddForm(false);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers =
      patient.familyAccessControls?.allowedMembers?.filter(
        (_: any, i: number) => i !== index,
      ) || [];

    const updatedAccessControls = {
      ...patient.familyAccessControls,
      allowedMembers: updatedMembers,
    };

    onSave(updatedAccessControls);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Configure family member access to {patient.firstName} {patient.lastName}
        's information. Family members can be granted different levels of access
        to patient data.
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">
            Authorized Family Members
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {showAddForm && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memberName">Full Name *</Label>
                  <Input
                    id="memberName"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={newMember.relationship}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, relationship: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="memberPhone">Phone Number</Label>
                  <Input
                    id="memberPhone"
                    value={newMember.phoneNumber}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+971-XX-XXX-XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select
                    value={newMember.accessLevel}
                    onValueChange={(value: any) =>
                      setNewMember({ ...newMember, accessLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="View">View Only</SelectItem>
                      <SelectItem value="Limited">Limited Access</SelectItem>
                      <SelectItem value="Full">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={permission}
                        checked={newMember.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewMember({
                              ...newMember,
                              permissions: [
                                ...newMember.permissions,
                                permission,
                              ],
                            });
                          } else {
                            setNewMember({
                              ...newMember,
                              permissions: newMember.permissions.filter(
                                (p) => p !== permission,
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMember({
                      name: "",
                      relationship: "",
                      phoneNumber: "",
                      accessLevel: "View",
                      permissions: [],
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {patient.familyAccessControls?.allowedMembers?.map(
            (member: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.relationship} • {member.accessLevel} Access
                        </p>
                        {member.phoneNumber && (
                          <p className="text-xs text-muted-foreground">
                            {member.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    {member.permissions && member.permissions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {member.permissions.map((permission: string) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ),
          ) || (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No family members configured</p>
              <p className="text-sm">
                Add family members to grant them access to patient information
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(patient.familyAccessControls)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const PatientImportForm: React.FC<any> = ({ onImport, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file">Select CSV File</Label>
        <Input
          id="file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          CSV should include columns: Emirates ID, First Name, Last Name, Date
          of Birth, Gender, Phone, Email
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!file}>
          Import Patients
        </Button>
      </div>
    </div>
  );
};

export default PatientManagement;
