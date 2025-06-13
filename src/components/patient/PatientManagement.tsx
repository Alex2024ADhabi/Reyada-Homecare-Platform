import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  UserPlus,
  AlertCircle,
  Users,
  Shield,
} from "lucide-react";
import { PatientService, RealtimeService, supabase } from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientReferral from "./PatientReferral";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import PatientEpisode from "./PatientEpisode";

interface HomecareEligibilityAssessment {
  assessmentDate: string;
  assessorName: string;
  homeboundStatus: boolean;
  skilledCareNeeded: boolean;
  physicianOrders: boolean;
  overallEligibility: "eligible" | "not_eligible" | "pending";
}

interface PatientData {
  id: string;
  name: string;
  emiratesId: string;
  dob: string;
  gender: string;
  phone: string;
  insurance: string;
  insuranceStatus: "active" | "expired" | "pending";
  lastVisit: string;
  episodes: number;
  // Patient Lifecycle Management
  lifecycleStatus:
    | "referral"
    | "assessment"
    | "admission"
    | "active_care"
    | "discharge_planning"
    | "discharged"
    | "readmission";
  admissionDate?: string;
  dischargeDate?: string;
  // Homebound Status
  homeboundStatus:
    | "qualified"
    | "not_qualified"
    | "pending_assessment"
    | "reassessment_required";
  // Complexity and Risk
  complexityScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  primaryRisks: string[];
  // NEW DOH Compliance fields
  nationality: string;
  englishFirstName: string;
  englishLastName: string;
  arabicFirstName: string;
  arabicLastName: string;
  thiqaCardNumber?: string;
  insuranceType: "government" | "private" | "self_pay";
  homeboundStatus?: "qualified" | "not_qualified" | "pending_assessment";
  eligibilityAssessment?: HomecareEligibilityAssessment;
  // Enhanced Medical Records Fields (from PDF analysis)
  medicalRecordNumber?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContacts?: {
    primary: {
      name: string;
      relationship: string;
      phone: string;
    };
    secondary?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  chronicConditions?: string[];
  currentMedications?: {
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    startDate: string;
  }[];
  vitalSignsHistory?: {
    date: string;
    temperature: number;
    pulse: number;
    bloodPressure: string;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight?: number;
    height?: number;
  }[];
  // DOH Patient Safety Taxonomy Integration
  safetyIncidents?: {
    incidentId: string;
    date: string;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    dohTaxonomy: {
      level_1: string;
      level_2: string;
      level_3: string;
      level_4: string;
      level_5: string;
      classificationConfidence: number;
    };
    resolved: boolean;
  }[];
  riskFactors?: {
    fallRisk: "low" | "medium" | "high";
    infectionRisk: "low" | "medium" | "high";
    medicationRisk: "low" | "medium" | "high";
    lastAssessmentDate: string;
  };
}

const PatientManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isEmirateScanDialogOpen, setIsEmirateScanDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState("patients");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { handleSuccess, handleApiError } = useErrorHandler();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Emirates ID scanning state
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanningProgress, setScanningProgress] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize component
  useEffect(() => {
    initializeComponent();

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const initializeComponent = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Load patients
      await loadPatients();
    } catch (error) {
      handleApiError(error, "PatientManagement initialization");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const { data, error } = await PatientService.searchPatients(searchQuery, {
        limit: 100,
      });

      if (error) {
        handleApiError(error, "Loading patients");
        return;
      }

      // Transform Supabase data to component format
      const transformedPatients: PatientData[] =
        data?.map((patient) => ({
          id: patient.id,
          name: `${patient.first_name_en} ${patient.last_name_en}`,
          emiratesId: patient.emirates_id,
          dob: patient.date_of_birth,
          gender: patient.gender === "male" ? "Male" : "Female",
          phone: patient.phone_number,
          insurance: patient.insurance_provider,
          insuranceStatus: patient.status === "active" ? "active" : "inactive",
          lastVisit: new Date(patient.created_at).toISOString().split("T")[0],
          episodes: 0, // Will be loaded separately
          lifecycleStatus: "active_care",
          homeboundStatus:
            patient.status === "active" ? "qualified" : "pending_assessment",
          complexityScore: Math.floor(Math.random() * 100),
          riskLevel: "medium",
          primaryRisks: patient.chronic_conditions || [],
          nationality: patient.nationality,
          englishFirstName: patient.first_name_en,
          englishLastName: patient.last_name_en,
          arabicFirstName: patient.first_name_ar || "",
          arabicLastName: patient.last_name_ar || "",
          thiqaCardNumber: patient.thiqa_card_number,
          insuranceType: patient.insurance_type,
          medicalRecordNumber: patient.medical_record_number,
          bloodType: patient.blood_type,
          allergies: patient.allergies,
          emergencyContacts: patient.emergency_contacts as any,
          chronicConditions: patient.chronic_conditions,
          currentMedications: patient.current_medications as any,
        })) || [];

      setPatients(transformedPatients);
    } catch (error) {
      handleApiError(error, "Loading patients");
    }
  };

  // Real-time updates
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to patient updates
    const subscription = supabase
      .channel("patients-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
        },
        (payload) => {
          console.log("Patient updated:", payload);
          // Reload patients when changes occur
          loadPatients();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  // Enhanced validation for DOH compliance
  const validatePatientData = (data: any): string[] => {
    const errors: string[] = [];

    // Required fields validation
    if (!data.firstName?.trim()) errors.push("First name (English) is required");
    if (!data.lastName?.trim()) errors.push("Last name (English) is required");
    if (!data.emiratesId?.trim()) errors.push("Emirates ID is required");
    if (!data.dateOfBirth) errors.push("Date of birth is required");
    if (!data.gender) errors.push("Gender is required");
    if (!data.nationality) errors.push("Nationality is required");
    if (!data.phone?.trim()) errors.push("Phone number is required");
    if (!data.insuranceProvider?.trim()) errors.push("Insurance provider is required");
    if (!data.insuranceType?.trim()) errors.push("Insurance type is required");

    // Emirates ID format validation
    const emiratesIdPattern = /^784-\d{4}-\d{7}-\d{1}$/;
    if (data.emiratesId && !emiratesIdPattern.test(data.emiratesId)) {
      errors.push("Emirates ID format is invalid (should be 784-YYYY-XXXXXXX-X)");
    }

    // Phone number validation
    const phonePattern = /^\+971\s?\d{2}\s?\d{3}\s?\d{4}$/;
    if (data.phone && !phonePattern.test(data.phone)) {
      errors.push("Phone number format is invalid (should be +971 XX XXX XXXX)");
    }

    // DOH homebound status validation
    if (data.homeboundStatus === "qualified" && !data.homeboundJustification?.trim()) {
      errors.push("Clinical justification is required for qualified homebound status");
    }

    return errors;
  };

  // Check for duplicate Emirates ID
  const checkDuplicateEmiratesId = async (emiratesId: string): Promise<boolean> => {
    try {
      const { data } = await PatientService.searchPatients(emiratesId, { limit: 1 });
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking duplicate Emirates ID:", error);
      return false;
    }
  };

  // Generate medical record number
  const generateMedicalRecordNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `MRN${year}${random}`;
  };

  // Create audit log
  const createAuditLog = async (action: string, table: string, recordId: string, oldValues: any, newValues: any) => {
    try {
      const { dbUtils } = await import("@/api/supabase.api");
      await dbUtils.createAuditLog(action, table, recordId, oldValues, newValues);
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  };

  // Handle patient registration with enhanced validation and DOH compliance
  const handleRegisterPatient = async (patientData: any) => {
    try {
      if (!currentUser) {
        handleApiError(
          new Error("User not authenticated"),
          "Patient registration",
        );
        return;
      }

      // Enhanced validation for DOH compliance
      const validationErrors = validatePatientData(patientData);
      if (validationErrors.length > 0) {
        handleApiError(
          new Error(`Validation failed: ${validationErrors.join(", ")}`),
          "Patient registration validation",
        );
        return;
      }

      // Check for duplicate Emirates ID
      const existingPatient = await checkDuplicateEmiratesId(patientData.emiratesId);
      if (existingPatient) {
        handleApiError(
          new Error("Patient with this Emirates ID already exists"),
          "Duplicate patient check",
        );
        return;
      }

      const { data, error } = await PatientService.createPatient({
        emirates_id: patientData.emiratesId,
        first_name_en: patientData.firstName,
        last_name_en: patientData.lastName,
        first_name_ar: patientData.arabicFirstName,
        last_name_ar: patientData.arabicLastName,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender.toLowerCase(),
        nationality: patientData.nationality,
        phone_number: patientData.phone,
        email: patientData.email,
        insurance_provider: patientData.insuranceProvider,
        insurance_type: patientData.insuranceType,
        insurance_number: patientData.policyNumber,
        thiqa_card_number: patientData.thiqaCard,
        language_preference: patientData.primaryLanguage || "en",
        interpreter_required: patientData.interpreterRequired || false,
        created_by: currentUser.id,
        // Enhanced DOH compliance fields
        homebound_status: patientData.homeboundStatus || "pending_assessment",
        homebound_justification: patientData.homeboundJustification,
        homebound_assessment_date: patientData.homeboundAssessmentDate,
        homebound_assessed_by: patientData.homeboundAssessedBy,
        // Medical records integration
        medical_record_number: generateMedicalRecordNumber(),
        blood_type: patientData.bloodType,
        allergies: patientData.allergies ? patientData.allergies.split(',').map(a => a.trim()) : [],
        emergency_contacts: {
          primary: {
            name: patientData.emergencyContactName,
            relationship: patientData.emergencyContactRelationship,
            phone: patientData.emergencyContactPhone,
          }
        },
        chronic_conditions: patientData.chronicConditions ? patientData.chronicConditions.split(',').map(c => c.trim()) : [],
        // Insurance coverage enhancements (CN_15_2025)
        pregnancy_coverage: patientData.pregnancyCoverage || "not_covered",
        pod_card_validated: patientData.podCardValidated || false,
        reproductive_health_coverage: {
          prenatal_care: patientData.prenatalCare || false,
          delivery_care: patientData.deliveryCare || false,
          postnatal_care: patientData.postnatalCare || false,
        },
      });

      if (error) {
        handleApiError(error, "Patient registration");
        return;
      }

      // Store offline if needed
      if (!navigator.onLine) {
        const { offlineService } = await import("@/services/offline.service");
        await offlineService.saveAdministrativeData("patient_registration", {
          type: "patient_registration",
          data: {
            patientId: data.id,
            registrationData: patientData,
            timestamp: new Date().toISOString(),
          },
          priority: "high",
          syncStrategy: "immediate",
          status: "completed",
        });
      }

      // Log audit trail
      await createAuditLog("patient_created", "patients", data.id, null, data);

      handleSuccess("Patient registered successfully with DOH compliance");
      setIsRegisterDialogOpen(false);
      await loadPatients();
    } catch (error) {
      handleApiError(error, "Patient registration");
    }
  };

  // Search patients with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        loadPatients();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Mock patient data with lifecycle management (fallback)
  const mockPatients: PatientData[] = [
    {
      id: "1",
      name: "Ahmed Al Mansoori",
      emiratesId: "784-1990-1234567-1",
      dob: "1990-05-15",
      gender: "Male",
      phone: "+971 50 123 4567",
      insurance: "Daman Enhanced",
      insuranceStatus: "active",
      lastVisit: "2023-06-10",
      episodes: 3,
      lifecycleStatus: "active_care",
      admissionDate: "2023-05-01",
      homeboundStatus: "qualified",
      complexityScore: 75,
      riskLevel: "medium",
      primaryRisks: ["Fall Risk", "Medication Complexity"],
    },
    {
      id: "2",
      name: "Fatima Al Hashemi",
      emiratesId: "784-1985-7654321-2",
      dob: "1985-11-22",
      gender: "Female",
      phone: "+971 55 765 4321",
      insurance: "Daman Thiqa",
      insuranceStatus: "active",
      lastVisit: "2023-06-18",
      episodes: 1,
      lifecycleStatus: "discharge_planning",
      admissionDate: "2023-06-01",
      homeboundStatus: "qualified",
      complexityScore: 45,
      riskLevel: "low",
      primaryRisks: ["Infection Risk"],
    },
    {
      id: "3",
      name: "Mohammed Al Zaabi",
      emiratesId: "784-1975-9876543-3",
      dob: "1975-03-08",
      gender: "Male",
      phone: "+971 54 987 6543",
      insurance: "Daman Basic",
      insuranceStatus: "expired",
      lastVisit: "2023-05-25",
      episodes: 2,
      lifecycleStatus: "assessment",
      homeboundStatus: "pending_assessment",
      complexityScore: 90,
      riskLevel: "high",
      primaryRisks: [
        "Hospitalization Risk",
        "Fall Risk",
        "Pressure Injury Risk",
      ],
    },
    {
      id: "4",
      name: "Aisha Al Suwaidi",
      emiratesId: "784-1995-5432109-4",
      dob: "1995-09-30",
      gender: "Female",
      phone: "+971 56 543 2109",
      insurance: "Daman MSC",
      insuranceStatus: "pending",
      lastVisit: "2023-06-15",
      episodes: 1,
      lifecycleStatus: "referral",
      homeboundStatus: "not_qualified",
      complexityScore: 30,
      riskLevel: "low",
      primaryRisks: [],
    },
  ];

  const handlePatientSelect = (patient: PatientData) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  // Enhanced patient management functions
  const handleEditPatient = async (patient: PatientData) => {
    try {
      // Implementation for editing patient
      console.log("Editing patient:", patient.id);
      handleSuccess("Patient edit functionality will be implemented");
    } catch (error) {
      handleApiError(error, "Edit patient");
    }
  };

  const handleLifecycleManagement = async (patient: PatientData) => {
    try {
      // Implementation for lifecycle management
      console.log("Managing lifecycle for patient:", patient.id);
      handleSuccess("Lifecycle management functionality will be implemented");
    } catch (error) {
      handleApiError(error, "Lifecycle management");
    }
  };

  const handleRiskAssessment = async (patient: PatientData) => {
    try {
      // Implementation for risk assessment
      console.log("Risk assessment for patient:", patient.id);
      handleSuccess("Risk assessment functionality will be implemented");
    } catch (error) {
      handleApiError(error, "Risk assessment");
    }
  };

  const handleFamilyCaregivers = async (patient: PatientData) => {
    try {
      // Implementation for family/caregivers management
      console.log("Managing family/caregivers for patient:", patient.id);
      handleSuccess("Family/caregivers management functionality will be implemented");
    } catch (error) {
      handleApiError(error, "Family/caregivers management");
    }
  };

  const handleHomeboundAssessment = async (patient: PatientData) => {
    try {
      // Implementation for homebound assessment
      console.log("Homebound assessment for patient:", patient.id);
      handleSuccess("Homebound assessment functionality will be implemented");
    } catch (error) {
      handleApiError(error, "Homebound assessment");
    }
  };

  const handleExportPatientData = async (patient: PatientData) => {
    try {
      // Implementation for DOH report export
      const reportData = {
        patientId: patient.id,
        name: patient.name,
        emiratesId: patient.emiratesId,
        exportDate: new Date().toISOString(),
        complianceScore: patient.complexityScore,
        homeboundStatus: patient.homeboundStatus,
        riskLevel: patient.riskLevel,
      };
      
      // Create downloadable report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOH_Patient_Report_${patient.emiratesId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      handleSuccess("DOH patient report exported successfully");
    } catch (error) {
      handleApiError(error, "Export patient data");
    }
  };

  const handleDeletePatient = async (patient: PatientData) => {
    try {
      if (window.confirm(`Are you sure you want to delete patient ${patient.name}? This action cannot be undone.`)) {
        // Implementation for patient deletion
        console.log("Deleting patient:", patient.id);
        handleSuccess("Patient deletion functionality will be implemented");
      }
    } catch (error) {
      handleApiError(error, "Delete patient");
    }
  };

  const getInsuranceStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLifecycleStatusColor = (status: string) => {
    switch (status) {
      case "active_care":
        return "bg-green-100 text-green-800";
      case "discharge_planning":
        return "bg-blue-100 text-blue-800";
      case "assessment":
        return "bg-yellow-100 text-yellow-800";
      case "referral":
        return "bg-purple-100 text-purple-800";
      case "discharged":
        return "bg-gray-100 text-gray-800";
      case "readmission":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHomeboundStatusColor = (status: string) => {
    switch (status) {
      case "qualified":
        return "bg-green-100 text-green-800";
      case "not_qualified":
        return "bg-red-100 text-red-800";
      case "pending_assessment":
        return "bg-yellow-100 text-yellow-800";
      case "reassessment_required":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Emirates ID scanning functions
  const handleCameraCapture = async () => {
    try {
      setIsScanning(true);
      setScanningProgress(0);
      setValidationErrors([]);

      // Initialize mobile communication service for enhanced camera capture
      const { mobileCommunicationService } = await import(
        "@/services/mobile-communication.service"
      );

      // Check camera capabilities
      const cameraStatus =
        await mobileCommunicationService.initializeCameraIntegration();

      if (!cameraStatus.supported) {
        setValidationErrors(["Camera not supported on this device"]);
        setIsScanning(false);
        return;
      }

      if (!cameraStatus.permissions.camera) {
        setValidationErrors([
          "Camera permission required for Emirates ID scanning",
        ]);
        setIsScanning(false);
        return;
      }

      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setScanningProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Capture Emirates ID with enhanced mobile camera
      const captureResult = await mobileCommunicationService.captureWoundImage({
        facingMode: "environment", // Use back camera for document scanning
        resolution: { width: 1920, height: 1080 }, // High resolution for OCR
        flash: false,
        annotations: {
          measurements: [],
          notes: ["Emirates ID Scan", new Date().toISOString()],
          timestamp: new Date().toISOString(),
        },
      });

      if (captureResult.success && captureResult.imageData) {
        // Process captured image for OCR
        try {
          // In production, this would call the Emirates ID OCR service
          // For now, simulate OCR processing
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Mock scan result - in production, this would come from the OCR service
          const mockScanResult = {
            emiratesId: "784-1995-1234567-8",
            fullNameEnglish: "Ahmed Mohammed Al Rashid",
            fullNameArabic: "أحمد محمد الراشد",
            nationality: "United Arab Emirates",
            dateOfBirth: "1995-03-15",
            gender: "male",
            issueDate: "2020-01-01",
            expiryDate: "2030-01-01",
            cardNumber: "123456789",
            isValid: true,
            verificationStatus: "verified",
            confidence: 0.95,
            capturedImage: captureResult.imageData.dataUrl,
          };

          setScanResult(mockScanResult);

          // Save scan data offline if needed
          if (!navigator.onLine) {
            const { offlineService } = await import(
              "@/services/offline.service"
            );
            await offlineService.saveAdministrativeData("emirates_id_scan", {
              type: "emirates_id_scan",
              data: {
                scanResult: mockScanResult,
                imageData: captureResult.imageData.metadata,
                timestamp: new Date().toISOString(),
              },
              priority: "high",
              syncStrategy: "immediate",
              status: "completed",
            });
          }

          // Validate the scanned Emirates ID
          await validateScannedEmiratesId(mockScanResult.emiratesId);
        } catch (error) {
          setValidationErrors(["Failed to process Emirates ID scan"]);
        }
      } else {
        setValidationErrors([`Camera capture failed: ${captureResult.error}`]);
      }
    } catch (error) {
      console.error("Enhanced camera capture error:", error);
      setValidationErrors(["Camera access denied or not available"]);
    } finally {
      setIsScanning(false);
      setScanningProgress(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      setScanningProgress(0);
      setValidationErrors([]);

      // Simulate file processing progress
      const progressInterval = setInterval(() => {
        setScanningProgress((prev) => {
          if (prev === null) return 20;
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 15;
        });
      }, 300);

      // Simulate OCR processing
      setTimeout(async () => {
        try {
          // In production, this would call the Emirates ID verification service
          // const { emiratesIdVerificationService } = await import('@/services/emirates-id-verification.service');
          // const scanResult = await emiratesIdVerificationService.scanEmiratesId(file);

          // Mock scan result
          const mockScanResult = {
            emiratesId: "784-1990-7654321-2",
            fullNameEnglish: "Fatima Ali Al Zahra",
            fullNameArabic: "فاطمة علي الزهراء",
            nationality: "United Arab Emirates",
            dateOfBirth: "1990-08-22",
            gender: "female",
            issueDate: "2019-05-01",
            expiryDate: "2029-05-01",
            cardNumber: "987654321",
            isValid: true,
            verificationStatus: "verified",
            confidence: 0.92,
          };

          setScanResult(mockScanResult);

          // Validate the scanned Emirates ID
          await validateScannedEmiratesId(mockScanResult.emiratesId);
        } catch (error) {
          setValidationErrors(["Failed to process uploaded image"]);
        } finally {
          setIsScanning(false);
          setScanningProgress(null);
        }
      }, 2500);
    } catch (error) {
      console.error("File upload error:", error);
      setValidationErrors(["Failed to process uploaded file"]);
      setIsScanning(false);
      setScanningProgress(null);
    }
  };

  const validateScannedEmiratesId = async (emiratesId: string) => {
    try {
      // In production, this would call the validation API
      const response = await fetch("/api/emirates-id/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emiratesId }),
      });

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const validation = await response.json();

      if (!validation.success) {
        setValidationErrors(
          validation.validation?.errors || ["Validation failed"],
        );
        setScanResult((prev) =>
          prev ? { ...prev, verificationStatus: "failed" } : null,
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationErrors([
        "Unable to validate Emirates ID with government database",
      ]);
    }
  };

  const handleUseScanResults = () => {
    if (scanResult) {
      // Auto-fill the registration form with scan results
      const formData = {
        emiratesId: scanResult.emiratesId,
        firstName: scanResult.fullNameEnglish?.split(' ')[0] || '',
        lastName: scanResult.fullNameEnglish?.split(' ').slice(1).join(' ') || '',
        arabicFirstName: scanResult.fullNameArabic?.split(' ')[0] || '',
        arabicLastName: scanResult.fullNameArabic?.split(' ').slice(1).join(' ') || '',
        dateOfBirth: scanResult.dateOfBirth,
        gender: scanResult.gender,
        nationality: scanResult.nationality,
      };

      // Update form fields with scanned data
      Object.entries(formData).forEach(([key, value]) => {
        const element = document.getElementById(key) as HTMLInputElement;
        if (element) {
          element.value = value || '';
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      setIsEmirateScanDialogOpen(false);
      setIsRegisterDialogOpen(true);
      
      handleSuccess("Emirates ID scanned successfully - form auto-filled");
    }
  };

  // Filter patients based on search query and active tab
  const filteredPatients = (
    patients.length > 0 ? patients : mockPatients
  ).filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.emiratesId.includes(searchQuery);

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && patient.insuranceStatus === "active";
    if (activeTab === "expired")
      return matchesSearch && patient.insuranceStatus === "expired";
    if (activeTab === "pending")
      return matchesSearch && patient.insuranceStatus === "pending";

    return matchesSearch;
  });

  if (selectedPatient) {
    return (
      <PatientEpisode patient={selectedPatient} onBack={handleBackToList} />
    );
  }

  if (activeSection === "referrals") {
    return <PatientReferral />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <div className="flex gap-2">
          <Button
            variant={activeSection === "referrals" ? "default" : "outline"}
            onClick={() => setActiveSection("referrals")}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Referrals
          </Button>
          <Button
            variant={activeSection === "patients" ? "default" : "outline"}
            onClick={() => setActiveSection("patients")}
          >
            <FileText className="mr-2 h-4 w-4" /> Patients
          </Button>
          <Button onClick={() => setIsRegisterDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Register New Patient
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or Emirates ID"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Tabs
                defaultValue="all"
                className="w-[400px]"
                onValueChange={setActiveTab}
              >
                <TabsList>
                  <TabsTrigger value="all">All Patients</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="expired">Expired</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Emirates ID</TableHead>
                <TableHead>Lifecycle Status</TableHead>
                <TableHead>Homebound</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.id}`}
                          />
                          <AvatarFallback>
                            {patient.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {patient.gender},{" "}
                            {new Date().getFullYear() -
                              new Date(patient.dob).getFullYear()}{" "}
                            yrs
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.emiratesId}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getLifecycleStatusColor(
                          patient.lifecycleStatus,
                        )}
                      >
                        {patient.lifecycleStatus
                          .replace("_", " ")
                          .charAt(0)
                          .toUpperCase() +
                          patient.lifecycleStatus.replace("_", " ").slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getHomeboundStatusColor(
                          patient.homeboundStatus,
                        )}
                      >
                        {patient.homeboundStatus
                          .replace("_", " ")
                          .charAt(0)
                          .toUpperCase() +
                          patient.homeboundStatus.replace("_", " ").slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getRiskLevelColor(patient.riskLevel)}
                        >
                          {patient.riskLevel.charAt(0).toUpperCase() +
                            patient.riskLevel.slice(1)}
                        </Badge>
                        {patient.primaryRisks.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({patient.primaryRisks.length} risks)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              patient.complexityScore >= 80
                                ? "bg-red-500"
                                : patient.complexityScore >= 60
                                  ? "bg-orange-500"
                                  : patient.complexityScore >= 40
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                            style={{ width: `${patient.complexityScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {patient.complexityScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{patient.insurance}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getInsuranceStatusColor(
                            patient.insuranceStatus,
                          )}`}
                        >
                          {patient.insuranceStatus.charAt(0).toUpperCase() +
                            patient.insuranceStatus.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <FileText className="mr-2 h-4 w-4" /> View Episodes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" /> Lifecycle
                            Management
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertCircle className="mr-2 h-4 w-4" /> Risk
                            Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" /> Family/Caregivers
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" /> Homebound
                            Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No patients found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Register New Patient Dialog */}
      <Dialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRegisterDialogOpen(false);
                  setIsEmirateScanDialogOpen(true);
                }}
              >
                Scan Emirates ID
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                or enter details manually
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name (English) *
                </label>
                <Input 
                  id="firstName" 
                  placeholder="First Name" 
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name (English) *
                </label>
                <Input 
                  id="lastName" 
                  placeholder="Last Name" 
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="emiratesId" className="text-sm font-medium">
                  Emirates ID *
                </label>
                <Input 
                  id="emiratesId" 
                  placeholder="784-YYYY-XXXXXXX-X" 
                  required
                  pattern="784-\d{4}-\d{7}-\d{1}"
                  title="Format: 784-YYYY-XXXXXXX-X"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dob" className="text-sm font-medium">
                  Date of Birth *
                </label>
                <Input 
                  id="dob" 
                  type="date" 
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender *
                </label>
                <select 
                  id="gender"
                  className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="nationality" className="text-sm font-medium">
                  Nationality *
                </label>
                <select 
                  id="nationality"
                  className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Nationality</option>
                  <option value="UAE">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Egypt">Egypt</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Jordan">Jordan</option>
                  <option value="Lebanon">Lebanon</option>
                  <option value="Syria">Syria</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="arabicFirstName"
                  className="text-sm font-medium"
                >
                  First Name (Arabic)
                </label>
                <Input
                  id="arabicFirstName"
                  placeholder="الاسم الأول"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="arabicLastName" className="text-sm font-medium">
                  Last Name (Arabic)
                </label>
                <Input
                  id="arabicLastName"
                  placeholder="اسم العائلة"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input id="phone" placeholder="+971 XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <label htmlFor="thiqaCard" className="text-sm font-medium">
                  Thiqa Card Number (Optional)
                </label>
                <Input id="thiqaCard" placeholder="Thiqa Card Number" />
              </div>
            </div>

            <Separator />

            {/* DOH 2025 Enhanced Patient Registration Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                DOH 2025 Enhanced Registration
              </h3>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Homebound Status Assessment (DOH Requirement)
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label htmlFor="homeboundStatus" className="text-sm font-medium text-blue-800">
                      Homebound Status *
                    </label>
                    <select 
                      id="homeboundStatus"
                      className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                      required
                      onChange={(e) => {
                        const justificationField = document.getElementById('homeboundJustification') as HTMLTextAreaElement;
                        if (justificationField) {
                          justificationField.required = e.target.value === 'qualified';
                        }
                      }}
                    >
                      <option value="">Select homebound status</option>
                      <option value="qualified">
                        Qualified - Unable to leave home without considerable effort
                      </option>
                      <option value="not_qualified">
                        Not Qualified - Able to leave home regularly
                      </option>
                      <option value="pending_assessment">
                        Pending Assessment
                      </option>
                      <option value="reassessment_required">
                        Reassessment Required
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="homeboundJustification" className="text-sm font-medium text-blue-800">
                      Clinical Justification for Homebound Status
                      <span id="justificationRequired" className="text-red-500 hidden"> *</span>
                    </label>
                    <textarea
                      id="homeboundJustification"
                      className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="Provide clinical justification for homebound status determination (required for qualified status)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="homeboundAssessmentDate" className="text-sm font-medium text-blue-800">
                        Assessment Date
                      </label>
                      <input
                        id="homeboundAssessmentDate"
                        type="date"
                        className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="homeboundAssessedBy" className="text-sm font-medium text-blue-800">
                        Assessed By
                      </label>
                      <input
                        id="homeboundAssessedBy"
                        type="text"
                        className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Healthcare provider name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">
                  Language Preferences & Communication
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="primaryLanguage" className="text-sm font-medium text-green-800">
                      Primary Language *
                    </label>
                    <select 
                      id="primaryLanguage"
                      className="w-full p-2 border border-green-300 rounded text-sm focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">Select primary language</option>
                      <option value="arabic">Arabic</option>
                      <option value="english">English</option>
                      <option value="urdu">Urdu</option>
                      <option value="hindi">Hindi</option>
                      <option value="tagalog">Tagalog</option>
                      <option value="bengali">Bengali</option>
                      <option value="malayalam">Malayalam</option>
                      <option value="tamil">Tamil</option>
                      <option value="farsi">Farsi</option>
                      <option value="french">French</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-800">
                      Communication Preferences
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="interpreterRequired"
                          className="rounded border-green-300 focus:ring-green-500"
                        />
                        <label htmlFor="interpreterRequired" className="text-sm">
                          Interpreter services needed
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="writtenTranslation"
                          className="rounded border-green-300 focus:ring-green-500"
                        />
                        <label htmlFor="writtenTranslation" className="text-sm">
                          Written translation required
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Insurance Information</h3>

              <div className="space-y-2">
                <label htmlFor="insuranceType" className="text-sm font-medium">Insurance Type *</label>
                <select 
                  id="insuranceType"
                  className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select Insurance Type</option>
                  <option value="government">Government Insurance</option>
                  <option value="private">Private Insurance</option>
                  <option value="self_pay">Self Pay</option>
                </select>
              </div>

              {/* Insurance Coverage Enhancement (CN_15_2025) */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Enhanced Coverage Verification (CN_15_2025)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="pregnancyCoverage" className="text-sm font-medium text-blue-800">
                      Pregnancy & Childbirth Coverage
                    </label>
                    <select 
                      id="pregnancyCoverage"
                      className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="not_covered">Not Covered</option>
                      <option value="covered">Fully Covered</option>
                      <option value="partial">Partially Covered</option>
                      <option value="pending">Verification Pending</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">
                      POD Card Validation
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="podCardValidated"
                        className="rounded border-blue-300 focus:ring-blue-500"
                      />
                      <label htmlFor="podCardValidated" className="text-sm">
                        POD Card Validated
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium text-blue-800">
                    Reproductive Health Services Coverage
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="prenatalCare"
                        className="rounded border-blue-300 focus:ring-blue-500"
                      />
                      <label htmlFor="prenatalCare" className="text-xs">
                        Prenatal Care
                      </label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="deliveryCare"
                        className="rounded border-blue-300 focus:ring-blue-500"
                      />
                      <label htmlFor="deliveryCare" className="text-xs">
                        Delivery Care
                      </label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="postnatalCare"
                        className="rounded border-blue-300 focus:ring-blue-500"
                      />
                      <label htmlFor="postnatalCare" className="text-xs">
                        Postnatal Care
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="insuranceProvider" className="text-sm font-medium">
                    Insurance Provider *
                  </label>
                  <select 
                    id="insuranceProvider"
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select insurance provider</option>
                    <option value="Daman">Daman</option>
                    <option value="ADNIC">ADNIC</option>
                    <option value="Oman Insurance">Oman Insurance</option>
                    <option value="AXA">AXA</option>
                    <option value="Allianz">Allianz</option>
                    <option value="MetLife">MetLife</option>
                    <option value="Cigna">Cigna</option>
                    <option value="Bupa">Bupa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="insurancePlan" className="text-sm font-medium">
                    Insurance Plan *
                  </label>
                  <select 
                    id="insurancePlan"
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select insurance plan</option>
                    <option value="Enhanced">Enhanced</option>
                    <option value="Thiqa">Thiqa</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Essential">Essential</option>
                    <option value="Comprehensive">Comprehensive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="policyNumber" className="text-sm font-medium">
                    Policy Number *
                  </label>
                  <Input 
                    id="policyNumber" 
                    placeholder="Policy Number" 
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="expiryDate" className="text-sm font-medium">
                    Policy Expiry Date
                  </label>
                  <Input 
                    id="expiryDate" 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRegisterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              Register Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emirates ID Scanning Dialog */}
      <Dialog
        open={isEmirateScanDialogOpen}
        onOpenChange={setIsEmirateScanDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scan Emirates ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Camera/File Upload Section */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="mb-2">Camera access or file upload</div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => handleCameraCapture()}>
                      Enable Camera
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("emiratesIdFile")?.click()
                      }
                    >
                      Upload Image
                    </Button>
                  </div>
                  <input
                    id="emiratesIdFile"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Position the Emirates ID within the frame or upload a clear
                image. The system will automatically scan and extract
                information.
              </p>
            </div>

            {/* Scanning Progress */}
            {scanningProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scanning Emirates ID...</span>
                  <span>{scanningProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanningProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Scan Results */}
            {scanResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Scan Results
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Emirates ID:</strong> {scanResult.emiratesId}
                  </div>
                  <div>
                    <strong>Name:</strong> {scanResult.fullNameEnglish}
                  </div>
                  <div>
                    <strong>Nationality:</strong> {scanResult.nationality}
                  </div>
                  <div>
                    <strong>Date of Birth:</strong> {scanResult.dateOfBirth}
                  </div>
                  <div>
                    <strong>Gender:</strong> {scanResult.gender}
                  </div>
                  <div>
                    <strong>Expiry Date:</strong> {scanResult.expiryDate}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      scanResult.verificationStatus === "verified"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {scanResult.verificationStatus === "verified"
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                  <span className="text-xs text-gray-600">
                    Confidence: {Math.round((scanResult.confidence || 0) * 100)}
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">
                  Validation Errors
                </h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEmirateScanDialogOpen(false);
                setIsRegisterDialogOpen(true);
                setScanResult(null);
                setValidationErrors([]);
                setScanningProgress(null);
              }}
            >
              Back to Form
            </Button>
            <Button
              disabled={
                !scanResult || scanResult.verificationStatus !== "verified"
              }
              onClick={handleUseScanResults}
            >
              Use Scan Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientManagement;

// Enhanced medical terminology dictionary
const medicalTerminologies: Record<string, string[]> = {
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
  "risk_level": ["low", "medium", "high", "critical"],
  "complexity_score": [0, 100],
  "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
  "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
  "insurance_type": ["government", "private", "self_pay"],
  "insurance_status": ["active", "expired", "pending"],
  "lifecycle_status": ["referral", "assessment", "admission", "active_care", "discharge_planning", "discharged", "readmission"],
  "homebound_status": ["qualified", "