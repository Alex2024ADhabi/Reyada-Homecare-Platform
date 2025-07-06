import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Search,
  Plus,
  User,
  Shield,
  FileText,
  Camera,
  Mic,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Signature,
  Activity,
  Users,
  Calendar as CalendarIcon2,
  MapPin,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  PatientService,
  EpisodeService,
  EmiratesIdService,
  InsuranceVerificationService,
  PatientConsentService,
  PatientDemographicsValidationService,
  EmergencyContactService,
  Patient,
  Episode,
} from "@/api/supabase.api";

interface PatientManagementProps {
  className?: string;
}

export default function PatientManagement({
  className,
}: PatientManagementProps = {}) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [showEmiratesIdDialog, setShowEmiratesIdDialog] = useState(false);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showEpisodeDialog, setShowEpisodeDialog] = useState(false);
  const [showEpisodeDetailsDialog, setShowEpisodeDetailsDialog] =
    useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [patientEpisodes, setPatientEpisodes] = useState<Episode[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Emergency Contact Management state
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [showEmergencyContactDialog, setShowEmergencyContactDialog] =
    useState(false);
  const [selectedEmergencyContact, setSelectedEmergencyContact] =
    useState<any>(null);
  const [emergencyContactData, setEmergencyContactData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    address: "",
    isPrimary: false,
    canMakeDecisions: false,
    notes: "",
  });

  // Enhanced Search state
  const [searchFilters, setSearchFilters] = useState({
    insurance_type: "",
    insurance_provider: "",
    status: "",
    gender: "",
    age_range: { min: undefined, max: undefined },
    has_active_episodes: undefined,
    episode_status: "",
    service_type: "",
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>(null);

  // Enhanced new patient form state with Emirates ID integration
  const [newPatientData, setNewPatientData] = useState({
    emirates_id: "",
    first_name_en: "",
    last_name_en: "",
    first_name_ar: "",
    last_name_ar: "",
    date_of_birth: new Date(),
    gender: "",
    phone_number: "",
    email: "",
    address: "",
    address_ar: "",
    nationality: "",
    insurance_provider: "",
    insurance_policy_number: "",
    insurance_type: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    preferred_language: "en",
    biometric_data: null,
    emirates_id_verified: false,
    emirates_id_verification_date: null,
    emirates_id_expiry_date: null,
    place_of_birth: "",
    marital_status: "",
    occupation: "",
    education_level: "",
    monthly_income: "",
    family_size: 1,
    housing_type: "",
    has_chronic_conditions: false,
    chronic_conditions: [],
    allergies: [],
    current_medications: [],
    previous_surgeries: [],
    family_medical_history: [],
    social_history: {
      smoking: false,
      alcohol: false,
      exercise_frequency: "",
      diet_type: "",
    },
    accessibility_needs: [],
    communication_preferences: {
      sms: true,
      email: true,
      phone: true,
      whatsapp: false,
    },
    consent_data_sharing: false,
    consent_marketing: false,
    consent_research: false,
  });

  // Emirates ID verification state
  const [emiratesIdData, setEmiratesIdData] = useState({
    emiratesId: "",
    verificationResult: null,
    isVerified: false,
  });

  // Insurance verification state
  const [insuranceData, setInsuranceData] = useState({
    policyNumber: "",
    provider: "",
    membershipNumber: "",
    verificationResult: null,
    isVerified: false,
  });

  // Patient consent management state
  const [patientConsents, setPatientConsents] = useState([]);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [consentDecision, setConsentDecision] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [decisionReason, setDecisionReason] = useState("");

  // Episode management state
  const [episodeData, setEpisodeData] = useState({
    episode_number: "",
    primary_diagnosis: "",
    secondary_diagnosis: "",
    start_date: new Date(),
    expected_end_date: null,
    status: "active",
    priority: "medium",
    care_team_lead: "",
    physician_name: "",
    physician_license: "",
    referral_source: "",
    service_type: "homecare",
    frequency: "",
    duration_weeks: "",
    special_instructions: "",
    medical_equipment_needed: [],
    medications: [],
    allergies: [],
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });

  // Load patient consents, episodes, validation, and emergency contacts when patient is selected
  useEffect(() => {
    if (selectedPatient?.id) {
      loadPatientConsents(selectedPatient.id);
      loadPatientEpisodes(selectedPatient.id);
      validatePatientDemographics(selectedPatient.id);
      loadEmergencyContacts(selectedPatient.id);
    }
  }, [selectedPatient]);

  // Load search filter options on component mount
  useEffect(() => {
    loadSearchFilterOptions();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !hasActiveFilters()) return;

    setIsSearching(true);
    try {
      const { data, error } = await PatientService.searchPatients(searchQuery, {
        ...searchFilters,
        limit: 50,
      });
      if (error) {
        console.error("Search error:", error);
        return;
      }
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const hasActiveFilters = () => {
    return Object.values(searchFilters).some((value) => {
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some((v) => v !== undefined && v !== "");
      }
      return value !== "" && value !== undefined;
    });
  };

  const handleSearchInputChange = async (value: string) => {
    setSearchQuery(value);

    // Get search suggestions
    if (value.length >= 2) {
      try {
        const { data } = await PatientService.getSearchSuggestions(value, 5);
        setSearchSuggestions(data || []);
      } catch (error) {
        console.error("Error getting search suggestions:", error);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const loadSearchFilterOptions = async () => {
    try {
      const { data, error } = await PatientService.getSearchFilterOptions();
      if (error) {
        console.error("Error loading filter options:", error);
        return;
      }
      setFilterOptions(data);
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const clearSearchFilters = () => {
    setSearchFilters({
      insurance_type: "",
      insurance_provider: "",
      status: "",
      gender: "",
      age_range: { min: undefined, max: undefined },
      has_active_episodes: undefined,
      episode_status: "",
      service_type: "",
      sort_by: "created_at",
      sort_order: "desc",
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleCreatePatient = async () => {
    setIsProcessing(true);
    try {
      // Validate required fields
      if (
        !newPatientData.emirates_id ||
        !newPatientData.first_name_en ||
        !newPatientData.last_name_en ||
        !newPatientData.phone_number
      ) {
        alert(
          "Please fill in all required fields (Emirates ID, Name, Phone Number)",
        );
        setIsProcessing(false);
        return;
      }

      // Validate Emirates ID format if not already verified
      if (!newPatientData.emirates_id_verified) {
        const { emiratesIdVerificationService } = await import(
          "@/services/emirates-id-verification.service"
        );
        const validation =
          await emiratesIdVerificationService.validateEmiratesId(
            newPatientData.emirates_id,
          );

        if (!validation.isValid) {
          alert("Please verify Emirates ID before creating patient record");
          setIsProcessing(false);
          return;
        }
      }

      // Enhanced patient data with comprehensive information
      const enhancedPatientData = {
        ...newPatientData,
        date_of_birth: newPatientData.date_of_birth.toISOString().split("T")[0],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        registration_source: "manual",
        registration_method: "emirates_id_verified",
        data_quality_score: newPatientData.emirates_id_verified ? 95 : 75,
        compliance_status: "compliant",
        last_verification_date: newPatientData.emirates_id_verification_date,
        // Calculate age
        age: Math.floor(
          (new Date().getTime() -
            new Date(newPatientData.date_of_birth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        ),
        // Generate patient ID
        patient_id: `PAT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        // Multi-language support
        display_name:
          newPatientData.preferred_language === "ar"
            ? `${newPatientData.first_name_ar} ${newPatientData.last_name_ar}`.trim() ||
              `${newPatientData.first_name_en} ${newPatientData.last_name_en}`
            : `${newPatientData.first_name_en} ${newPatientData.last_name_en}`,
        // Privacy and consent tracking
        consent_timestamp: new Date().toISOString(),
        privacy_settings: {
          data_sharing: newPatientData.consent_data_sharing,
          marketing: newPatientData.consent_marketing,
          research: newPatientData.consent_research,
          communication_preferences: newPatientData.communication_preferences,
        },
        // DOH compliance fields
        doh_compliance: {
          emirates_id_verified: newPatientData.emirates_id_verified,
          demographics_complete: true,
          contact_verified: false, // Will be verified separately
          insurance_verified: false, // Will be verified separately
          consent_obtained: true,
          data_quality_check: true,
        },
      };

      const { data, error } =
        await PatientService.createPatient(enhancedPatientData);

      if (error) {
        console.error("Error creating patient:", error);
        alert("Failed to create patient record. Please try again.");
        return;
      }

      // Log successful patient creation for audit
      console.log("✅ Patient created successfully:", {
        patientId: data.id,
        emiratesId: newPatientData.emirates_id,
        verified: newPatientData.emirates_id_verified,
        timestamp: new Date().toISOString(),
      });

      setSelectedPatient(data);
      setShowNewPatientDialog(false);
      setActiveTab("details");

      // Reset form to initial state
      setNewPatientData({
        emirates_id: "",
        first_name_en: "",
        last_name_en: "",
        first_name_ar: "",
        last_name_ar: "",
        date_of_birth: new Date(),
        gender: "",
        phone_number: "",
        email: "",
        address: "",
        address_ar: "",
        nationality: "",
        insurance_provider: "",
        insurance_policy_number: "",
        insurance_type: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        preferred_language: "en",
        biometric_data: null,
        emirates_id_verified: false,
        emirates_id_verification_date: null,
        emirates_id_expiry_date: null,
        place_of_birth: "",
        marital_status: "",
        occupation: "",
        education_level: "",
        monthly_income: "",
        family_size: 1,
        housing_type: "",
        has_chronic_conditions: false,
        chronic_conditions: [],
        allergies: [],
        current_medications: [],
        previous_surgeries: [],
        family_medical_history: [],
        social_history: {
          smoking: false,
          alcohol: false,
          exercise_frequency: "",
          diet_type: "",
        },
        accessibility_needs: [],
        communication_preferences: {
          sms: true,
          email: true,
          phone: true,
          whatsapp: false,
        },
        consent_data_sharing: false,
        consent_marketing: false,
        consent_research: false,
      });

      // Reset Emirates ID verification state
      setEmiratesIdData({
        emiratesId: "",
        verificationResult: null,
        isVerified: false,
      });
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmiratesIdVerification = async () => {
    if (!emiratesIdData.emiratesId) return;

    setIsVerifying(true);
    try {
      // Import Emirates ID verification service
      const { emiratesIdVerificationService } = await import(
        "@/services/emirates-id-verification.service"
      );

      const result = await emiratesIdVerificationService.validateEmiratesId(
        emiratesIdData.emiratesId,
      );

      setEmiratesIdData({
        ...emiratesIdData,
        verificationResult: result,
        isVerified: result.isValid,
      });

      // Auto-populate patient data if verification successful
      if (result.isValid && result.verificationDetails) {
        const verifiedData = result.verificationDetails;
        setNewPatientData((prev) => ({
          ...prev,
          emirates_id: emiratesIdData.emiratesId,
          emirates_id_verified: true,
          emirates_id_verification_date: new Date().toISOString(),
          // Auto-populate from Emirates ID data if available
          first_name_en: verifiedData.fullNameEnglish || prev.first_name_en,
          first_name_ar: verifiedData.fullNameArabic || prev.first_name_ar,
          gender: verifiedData.gender || prev.gender,
          date_of_birth: verifiedData.dateOfBirth
            ? new Date(verifiedData.dateOfBirth)
            : prev.date_of_birth,
          nationality: verifiedData.nationality || prev.nationality,
          emirates_id_expiry_date: verifiedData.expiryDate || null,
        }));
      }

      if (result.isValid && selectedPatient?.id) {
        // Store verification result in database
        await EmiratesIdService.storeVerificationResult(
          selectedPatient.id,
          result,
        );
      }
    } catch (error) {
      console.error("Emirates ID verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInsuranceVerification = async () => {
    if (!insuranceData.policyNumber || !insuranceData.provider) return;

    setIsVerifying(true);
    try {
      const result = await InsuranceVerificationService.verifyInsuranceCoverage(
        {
          policyNumber: insuranceData.policyNumber,
          provider: insuranceData.provider,
          membershipNumber: insuranceData.membershipNumber,
          patientId: selectedPatient?.id || "",
        },
      );

      setInsuranceData({
        ...insuranceData,
        verificationResult: result,
        isVerified: result.isValid,
      });

      if (result.isValid && selectedPatient?.id) {
        await InsuranceVerificationService.storeVerificationResult(
          selectedPatient.id,
          result.data,
        );
      }
    } catch (error) {
      console.error("Insurance verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const loadPatientConsents = async (patientId: string) => {
    try {
      const { data, error } =
        await PatientConsentService.getPatientConsents(patientId);
      if (error) {
        console.error("Error loading patient consents:", error);
        return;
      }
      setPatientConsents(data || []);
    } catch (error) {
      console.error("Error loading patient consents:", error);
    }
  };

  const loadPatientEpisodes = async (patientId: string) => {
    try {
      const { data, error } =
        await EpisodeService.getEpisodesByPatient(patientId);
      if (error) {
        console.error("Error loading patient episodes:", error);
        return;
      }
      setPatientEpisodes(data || []);
    } catch (error) {
      console.error("Error loading patient episodes:", error);
    }
  };

  const handleConsentDecision = async () => {
    if (!selectedConsent || !consentDecision) return;

    setIsProcessing(true);
    try {
      const { data, error } = await PatientConsentService.recordConsentDecision(
        selectedConsent.id,
        {
          status: consentDecision,
          signedBy:
            selectedPatient?.first_name_en +
            " " +
            selectedPatient?.last_name_en,
          signatureData,
          witnessName,
          decisionReason,
        },
      );

      if (error) {
        console.error("Error recording consent decision:", error);
        return;
      }

      // Refresh consents
      if (selectedPatient?.id) {
        await loadPatientConsents(selectedPatient.id);
      }

      // Reset form
      setSelectedConsent(null);
      setConsentDecision("");
      setSignatureData("");
      setWitnessName("");
      setDecisionReason("");
      setShowSignatureDialog(false);
    } catch (error) {
      console.error("Error recording consent decision:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateEpisode = async () => {
    if (!selectedPatient?.id) return;

    setIsProcessing(true);
    try {
      // Generate episode number
      const episodeNumber = `EP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const newEpisodeData = {
        ...episodeData,
        patient_id: selectedPatient.id,
        episode_number: episodeNumber,
        created_by: "current-user-id", // This should come from auth context
        created_at: new Date().toISOString(),
      };

      const { data, error } =
        await EpisodeService.createEpisode(newEpisodeData);
      if (error) {
        console.error("Error creating episode:", error);
        return;
      }

      // Refresh episodes
      await loadPatientEpisodes(selectedPatient.id);

      // Reset form and close dialog
      setEpisodeData({
        episode_number: "",
        primary_diagnosis: "",
        secondary_diagnosis: "",
        start_date: new Date(),
        expected_end_date: null,
        status: "active",
        priority: "medium",
        care_team_lead: "",
        physician_name: "",
        physician_license: "",
        referral_source: "",
        service_type: "homecare",
        frequency: "",
        duration_weeks: "",
        special_instructions: "",
        medical_equipment_needed: [],
        medications: [],
        allergies: [],
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
      });
      setShowEpisodeDialog(false);
    } catch (error) {
      console.error("Error creating episode:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewEpisode = async (episode: Episode) => {
    setSelectedEpisode(episode);
    setShowEpisodeDetailsDialog(true);
  };

  const handleUpdateEpisodeStatus = async (
    episodeId: string,
    newStatus: string,
  ) => {
    setIsProcessing(true);
    try {
      let result;

      switch (newStatus) {
        case "completed":
          result = await EpisodeService.completeEpisode(episodeId);
          break;
        case "cancelled":
          result = await EpisodeService.cancelEpisode(episodeId);
          break;
        case "suspended":
          result = await EpisodeService.suspendEpisode(episodeId);
          break;
        case "active":
          result = await EpisodeService.reactivateEpisode(episodeId);
          break;
        default:
          result = await EpisodeService.updateEpisode(episodeId, {
            status: newStatus,
            updated_at: new Date().toISOString(),
          });
      }

      if (result.error) {
        console.error("Error updating episode status:", result.error);
        return;
      }

      // Refresh episodes
      if (selectedPatient?.id) {
        await loadPatientEpisodes(selectedPatient.id);
      }
    } catch (error) {
      console.error("Error updating episode status:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePatientDemographics = async (patientId: string) => {
    setIsValidating(true);
    try {
      const { data, error } =
        await PatientDemographicsValidationService.getPatientValidationStatus(
          patientId,
        );
      if (error) {
        console.error("Validation error:", error);
        return;
      }
      setValidationResult(data);
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidateAllPatients = async () => {
    if (!searchResults.length) return;

    setIsValidating(true);
    try {
      const patientIds = searchResults.map((p) => p.id);
      const { data, error } =
        await PatientDemographicsValidationService.batchValidatePatients(
          patientIds,
        );
      if (error) {
        console.error("Batch validation error:", error);
        return;
      }
      // You could show a summary dialog here
      console.log("Batch validation results:", data);
    } catch (error) {
      console.error("Batch validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  // Emergency Contact Management functions
  const loadEmergencyContacts = async (patientId: string) => {
    try {
      const { data, error } =
        await EmergencyContactService.getPatientEmergencyContacts(patientId);
      if (error) {
        console.error("Error loading emergency contacts:", error);
        return;
      }
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error("Error loading emergency contacts:", error);
    }
  };

  const handleCreateEmergencyContact = async () => {
    if (!selectedPatient?.id) return;

    setIsProcessing(true);
    try {
      const { data, error } =
        await EmergencyContactService.createEmergencyContact({
          patientId: selectedPatient.id,
          ...emergencyContactData,
        });

      if (error) {
        console.error("Error creating emergency contact:", error);
        return;
      }

      // Refresh emergency contacts
      await loadEmergencyContacts(selectedPatient.id);

      // Reset form and close dialog
      setEmergencyContactData({
        name: "",
        relationship: "",
        phoneNumber: "",
        email: "",
        address: "",
        isPrimary: false,
        canMakeDecisions: false,
        notes: "",
      });
      setShowEmergencyContactDialog(false);
    } catch (error) {
      console.error("Error creating emergency contact:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateEmergencyContact = async () => {
    if (!selectedEmergencyContact?.id) return;

    setIsProcessing(true);
    try {
      const { data, error } =
        await EmergencyContactService.updateEmergencyContact(
          selectedEmergencyContact.id,
          emergencyContactData,
        );

      if (error) {
        console.error("Error updating emergency contact:", error);
        return;
      }

      // Refresh emergency contacts
      if (selectedPatient?.id) {
        await loadEmergencyContacts(selectedPatient.id);
      }

      // Reset form and close dialog
      setSelectedEmergencyContact(null);
      setEmergencyContactData({
        name: "",
        relationship: "",
        phoneNumber: "",
        email: "",
        address: "",
        isPrimary: false,
        canMakeDecisions: false,
        notes: "",
      });
      setShowEmergencyContactDialog(false);
    } catch (error) {
      console.error("Error updating emergency contact:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEmergencyContact = async (contactId: string) => {
    setIsProcessing(true);
    try {
      const { data, error } =
        await EmergencyContactService.deleteEmergencyContact(contactId);
      if (error) {
        console.error("Error deleting emergency contact:", error);
        return;
      }

      // Refresh emergency contacts
      if (selectedPatient?.id) {
        await loadEmergencyContacts(selectedPatient.id);
      }
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetPrimaryContact = async (contactId: string) => {
    if (!selectedPatient?.id) return;

    setIsProcessing(true);
    try {
      const { data, error } = await EmergencyContactService.setPrimaryContact(
        selectedPatient.id,
        contactId,
      );
      if (error) {
        console.error("Error setting primary contact:", error);
        return;
      }

      // Refresh emergency contacts
      await loadEmergencyContacts(selectedPatient.id);
    } catch (error) {
      console.error("Error setting primary contact:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditEmergencyContact = (contact: any) => {
    setSelectedEmergencyContact(contact);
    setEmergencyContactData({
      name: contact.name || "",
      relationship: contact.relationship || "",
      phoneNumber: contact.phone_number || "",
      email: contact.email || "",
      address: contact.address || "",
      isPrimary: contact.is_primary || false,
      canMakeDecisions: contact.can_make_decisions || false,
      notes: contact.notes || "",
    });
    setShowEmergencyContactDialog(true);
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-6 space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Patient Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive patient management with Emirates ID integration,
            insurance verification, and consent management
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="search">Search Patients</TabsTrigger>
            <TabsTrigger value="details">Patient Details</TabsTrigger>
            <TabsTrigger value="validation">
              Demographics Validation
            </TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="consent">Consent Management</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Search</CardTitle>
                <CardDescription>
                  Search for existing patients or create new patient records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Search by name, Emirates ID, phone, or email..."
                        value={searchQuery}
                        onChange={(e) =>
                          handleSearchInputChange(e.target.value)
                        }
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                      {searchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                          {searchSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                              onClick={() => {
                                setSearchQuery(suggestion.label);
                                setSearchSuggestions([]);
                                handleSearch();
                              }}
                            >
                              <div className="font-medium">
                                {suggestion.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {suggestion.sublabel}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    >
                      Advanced
                    </Button>
                    {hasActiveFilters() && (
                      <Button variant="outline" onClick={clearSearchFilters}>
                        Clear Filters
                      </Button>
                    )}
                    <Dialog
                      open={showNewPatientDialog}
                      onOpenChange={setShowNewPatientDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          New Patient
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Patient</DialogTitle>
                          <DialogDescription>
                            Enter patient information to create a new record
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Emirates ID Section with Real-time Verification */}
                          <div className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="font-semibold mb-3 flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Emirates ID Verification
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="emirates_id">
                                  Emirates ID *
                                </Label>
                                <div className="flex space-x-2">
                                  <Input
                                    id="emirates_id"
                                    value={newPatientData.emirates_id}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setNewPatientData({
                                        ...newPatientData,
                                        emirates_id: value,
                                      });
                                      setEmiratesIdData({
                                        ...emiratesIdData,
                                        emiratesId: value,
                                      });
                                    }}
                                    placeholder="784-YYYY-XXXXXXX-X"
                                    className={
                                      newPatientData.emirates_id_verified
                                        ? "border-green-500"
                                        : ""
                                    }
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEmiratesIdVerification}
                                    disabled={
                                      isVerifying || !newPatientData.emirates_id
                                    }
                                  >
                                    {isVerifying ? "Verifying..." : "Verify"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsScanning(true)}
                                  >
                                    <Camera className="h-4 w-4" />
                                  </Button>
                                </div>
                                {newPatientData.emirates_id_verified && (
                                  <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verified on{" "}
                                    {new Date(
                                      newPatientData.emirates_id_verification_date,
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="nationality">Nationality</Label>
                                <Input
                                  id="nationality"
                                  value={newPatientData.nationality}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      nationality: e.target.value,
                                    })
                                  }
                                  placeholder="UAE"
                                  readOnly={newPatientData.emirates_id_verified}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Personal Information */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              Personal Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="preferred_language">
                                  Preferred Language
                                </Label>
                                <Select
                                  value={newPatientData.preferred_language}
                                  onValueChange={(value) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      preferred_language: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ar">
                                      العربية (Arabic)
                                    </SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <Select
                                  value={newPatientData.gender}
                                  onValueChange={(value) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      gender: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">
                                      Female
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Name Fields - Multi-language Support */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              Name Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="first_name_en">
                                  First Name (English) *
                                </Label>
                                <Input
                                  id="first_name_en"
                                  value={newPatientData.first_name_en}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      first_name_en: e.target.value,
                                    })
                                  }
                                  readOnly={newPatientData.emirates_id_verified}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="last_name_en">
                                  Last Name (English) *
                                </Label>
                                <Input
                                  id="last_name_en"
                                  value={newPatientData.last_name_en}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      last_name_en: e.target.value,
                                    })
                                  }
                                  readOnly={newPatientData.emirates_id_verified}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="first_name_ar">
                                  الاسم الأول (Arabic)
                                </Label>
                                <Input
                                  id="first_name_ar"
                                  value={newPatientData.first_name_ar}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      first_name_ar: e.target.value,
                                    })
                                  }
                                  dir="rtl"
                                  readOnly={newPatientData.emirates_id_verified}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="last_name_ar">
                                  اسم العائلة (Arabic)
                                </Label>
                                <Input
                                  id="last_name_ar"
                                  value={newPatientData.last_name_ar}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      last_name_ar: e.target.value,
                                    })
                                  }
                                  dir="rtl"
                                  readOnly={newPatientData.emirates_id_verified}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              Contact Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="phone_number">
                                  Phone Number *
                                </Label>
                                <Input
                                  id="phone_number"
                                  value={newPatientData.phone_number}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      phone_number: e.target.value,
                                    })
                                  }
                                  placeholder="+971 XX XXX XXXX"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={newPatientData.email}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      email: e.target.value,
                                    })
                                  }
                                  placeholder="patient@example.com"
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="address">
                                  Address (English)
                                </Label>
                                <Textarea
                                  id="address"
                                  value={newPatientData.address}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      address: e.target.value,
                                    })
                                  }
                                  placeholder="Enter full address"
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="address_ar">
                                  العنوان (Arabic)
                                </Label>
                                <Textarea
                                  id="address_ar"
                                  value={newPatientData.address_ar}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      address_ar: e.target.value,
                                    })
                                  }
                                  placeholder="أدخل العنوان الكامل"
                                  dir="rtl"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Date of Birth */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              Birth Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Date of Birth *</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {newPatientData.date_of_birth
                                        ? format(
                                            newPatientData.date_of_birth,
                                            "PPP",
                                          )
                                        : "Select date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={newPatientData.date_of_birth}
                                      onSelect={(date) =>
                                        setNewPatientData({
                                          ...newPatientData,
                                          date_of_birth: date || new Date(),
                                        })
                                      }
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="place_of_birth">
                                  Place of Birth
                                </Label>
                                <Input
                                  id="place_of_birth"
                                  value={newPatientData.place_of_birth}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      place_of_birth: e.target.value,
                                    })
                                  }
                                  placeholder="City, Country"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Additional Demographics */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              Additional Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="marital_status">
                                  Marital Status
                                </Label>
                                <Select
                                  value={newPatientData.marital_status}
                                  onValueChange={(value) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      marital_status: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single">
                                      Single
                                    </SelectItem>
                                    <SelectItem value="married">
                                      Married
                                    </SelectItem>
                                    <SelectItem value="divorced">
                                      Divorced
                                    </SelectItem>
                                    <SelectItem value="widowed">
                                      Widowed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input
                                  id="occupation"
                                  value={newPatientData.occupation}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      occupation: e.target.value,
                                    })
                                  }
                                  placeholder="Patient's occupation"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="education_level">
                                  Education Level
                                </Label>
                                <Select
                                  value={newPatientData.education_level}
                                  onValueChange={(value) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      education_level: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="primary">
                                      Primary
                                    </SelectItem>
                                    <SelectItem value="secondary">
                                      Secondary
                                    </SelectItem>
                                    <SelectItem value="diploma">
                                      Diploma
                                    </SelectItem>
                                    <SelectItem value="bachelor">
                                      Bachelor's
                                    </SelectItem>
                                    <SelectItem value="master">
                                      Master's
                                    </SelectItem>
                                    <SelectItem value="phd">PhD</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="family_size">Family Size</Label>
                                <Input
                                  id="family_size"
                                  type="number"
                                  min="1"
                                  value={newPatientData.family_size}
                                  onChange={(e) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      family_size:
                                        parseInt(e.target.value) || 1,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Communication Preferences */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">
                              Communication Preferences
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="comm_sms"
                                  checked={
                                    newPatientData.communication_preferences.sms
                                  }
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      communication_preferences: {
                                        ...newPatientData.communication_preferences,
                                        sms: checked as boolean,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor="comm_sms">
                                  SMS Notifications
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="comm_email"
                                  checked={
                                    newPatientData.communication_preferences
                                      .email
                                  }
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      communication_preferences: {
                                        ...newPatientData.communication_preferences,
                                        email: checked as boolean,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor="comm_email">
                                  Email Notifications
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="comm_phone"
                                  checked={
                                    newPatientData.communication_preferences
                                      .phone
                                  }
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      communication_preferences: {
                                        ...newPatientData.communication_preferences,
                                        phone: checked as boolean,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor="comm_phone">Phone Calls</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="comm_whatsapp"
                                  checked={
                                    newPatientData.communication_preferences
                                      .whatsapp
                                  }
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      communication_preferences: {
                                        ...newPatientData.communication_preferences,
                                        whatsapp: checked as boolean,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor="comm_whatsapp">WhatsApp</Label>
                              </div>
                            </div>
                          </div>

                          {/* Consent Management */}
                          <div className="border rounded-lg p-4 bg-yellow-50">
                            <h4 className="font-semibold mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Consent & Privacy
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="consent_data_sharing"
                                  checked={newPatientData.consent_data_sharing}
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      consent_data_sharing: checked as boolean,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor="consent_data_sharing"
                                  className="text-sm"
                                >
                                  I consent to sharing my data with healthcare
                                  providers for treatment purposes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="consent_marketing"
                                  checked={newPatientData.consent_marketing}
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      consent_marketing: checked as boolean,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor="consent_marketing"
                                  className="text-sm"
                                >
                                  I consent to receiving marketing
                                  communications
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="consent_research"
                                  checked={newPatientData.consent_research}
                                  onCheckedChange={(checked) =>
                                    setNewPatientData({
                                      ...newPatientData,
                                      consent_research: checked as boolean,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor="consent_research"
                                  className="text-sm"
                                >
                                  I consent to my anonymized data being used for
                                  research purposes
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowNewPatientDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreatePatient}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Creating..." : "Create Patient"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Advanced Search Filters */}
                  {showAdvancedSearch && filterOptions && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Search Filters</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Insurance Provider</Label>
                            <Select
                              value={searchFilters.insurance_provider}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  insurance_provider: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Any provider</SelectItem>
                                {filterOptions.insuranceProviders.map(
                                  (provider: string) => (
                                    <SelectItem key={provider} value={provider}>
                                      {provider}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Insurance Type</Label>
                            <Select
                              value={searchFilters.insurance_type}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  insurance_type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Any type</SelectItem>
                                {filterOptions.insuranceTypes.map(
                                  (type: string) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                              value={searchFilters.gender}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  gender: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Any gender</SelectItem>
                                {filterOptions.genders.map((gender: string) => (
                                  <SelectItem key={gender} value={gender}>
                                    {gender}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Patient Status</Label>
                            <Select
                              value={searchFilters.status}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  status: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Any status</SelectItem>
                                {filterOptions.patientStatuses.map(
                                  (status: string) => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Service Type</Label>
                            <Select
                              value={searchFilters.service_type}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  service_type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any service" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Any service</SelectItem>
                                {filterOptions.serviceTypes.map(
                                  (service: string) => (
                                    <SelectItem key={service} value={service}>
                                      {service
                                        .replace("_", " ")
                                        .replace(/\b\w/g, (l: string) =>
                                          l.toUpperCase(),
                                        )}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Episode Status</Label>
                            <Select
                              value={searchFilters.episode_status}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  episode_status: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any episode status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">
                                  Any episode status
                                </SelectItem>
                                {filterOptions.episodeStatuses.map(
                                  (status: string) => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Sort By</Label>
                            <Select
                              value={searchFilters.sort_by}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  sort_by: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {filterOptions.sortOptions.map(
                                  (option: any) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Select
                              value={searchFilters.sort_order}
                              onValueChange={(value) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  sort_order: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desc">
                                  Newest First
                                </SelectItem>
                                <SelectItem value="asc">
                                  Oldest First
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has_active_episodes"
                              checked={
                                searchFilters.has_active_episodes === true
                              }
                              onCheckedChange={(checked) =>
                                setSearchFilters({
                                  ...searchFilters,
                                  has_active_episodes: checked
                                    ? true
                                    : undefined,
                                })
                              }
                            />
                            <Label htmlFor="has_active_episodes">
                              Has Active Episodes
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Search Results</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleValidateAllPatients}
                        disabled={isValidating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isValidating ? "Validating..." : "Validate All"}
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {searchResults.map((patient) => (
                        <Card
                          key={patient.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveTab("details");
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">
                                  {patient.first_name_en} {patient.last_name_en}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Emirates ID: {patient.emirates_id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Phone: {patient.phone_number}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    patient.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {patient.status}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {patient.insurance_provider}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedPatient ? (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Patient Information</CardTitle>
                        <CardDescription>
                          {selectedPatient.first_name_en}{" "}
                          {selectedPatient.last_name_en} -{" "}
                          {selectedPatient.emirates_id}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("validation")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Validation
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name (English)</Label>
                      <p className="text-sm">
                        {selectedPatient.first_name_en}{" "}
                        {selectedPatient.last_name_en}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Emirates ID</Label>
                      <p className="text-sm">{selectedPatient.emirates_id}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <p className="text-sm">{selectedPatient.date_of_birth}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <p className="text-sm">{selectedPatient.gender}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <p className="text-sm">{selectedPatient.phone_number}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Insurance Provider</Label>
                      <p className="text-sm">
                        {selectedPatient.insurance_provider}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please search for and select a patient to view their
                    details.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            {selectedPatient ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Demographics Validation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Validation status for {selectedPatient.first_name_en}{" "}
                      {selectedPatient.last_name_en}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      validatePatientDemographics(selectedPatient.id)
                    }
                    disabled={isValidating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isValidating ? "Validating..." : "Re-validate"}
                  </Button>
                </div>

                {validationResult ? (
                  <div className="grid gap-6">
                    {/* Overall Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          {validationResult.validationResult.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          Overall Validation Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Validation Status</Label>
                            <Badge
                              variant={
                                validationResult.validationResult.isValid
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {validationResult.validationResult.isValid
                                ? "Valid"
                                : "Invalid"}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Label>Completeness Score</Label>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${validationResult.validationResult.completeness.percentage}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {
                                  validationResult.validationResult.completeness
                                    .percentage
                                }
                                %
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>DOH Compliance</Label>
                            <Badge
                              variant={
                                validationResult.validationResult.compliance
                                  .dohCompliant
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {validationResult.validationResult.compliance
                                .dohCompliant
                                ? "Compliant"
                                : "Non-Compliant"}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Label>Last Validated</Label>
                            <p className="text-sm">
                              {format(
                                new Date(validationResult.lastValidated),
                                "PPP p",
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Compliance Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Compliance Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <span>Emirates ID Valid</span>
                            {validationResult.validationResult.compliance
                              .emiratesIdValid ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Insurance Valid</span>
                            {validationResult.validationResult.compliance
                              .insuranceValid ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Contact Info Complete</span>
                            {validationResult.validationResult.compliance
                              .contactInfoComplete ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Errors */}
                    {validationResult.validationResult.errors.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-red-600">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Validation Errors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {validationResult.validationResult.errors.map(
                              (error, index) => (
                                <div
                                  key={index}
                                  className="p-3 border-l-4 border-red-500 bg-red-50"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {error.field}
                                    </span>
                                    <Badge variant="destructive">
                                      {error.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-red-700 mt-1">
                                    {error.message}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Warnings */}
                    {validationResult.validationResult.warnings.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-yellow-600">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Validation Warnings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {validationResult.validationResult.warnings.map(
                              (warning, index) => (
                                <div
                                  key={index}
                                  className="p-3 border-l-4 border-yellow-500 bg-yellow-50"
                                >
                                  <span className="font-medium">
                                    {warning.field}
                                  </span>
                                  <p className="text-sm text-yellow-700 mt-1">
                                    {warning.message}
                                  </p>
                                  <p className="text-sm text-yellow-600 mt-1 italic">
                                    Suggestion: {warning.suggestion}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Missing Fields */}
                    {validationResult.validationResult.completeness
                      .missingFields.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Missing Required Fields</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {validationResult.validationResult.completeness.missingFields.map(
                              (field, index) => (
                                <Badge key={index} variant="outline">
                                  {field
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Optional Fields */}
                    {validationResult.validationResult.completeness
                      .optionalFields.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Missing Optional Fields</CardTitle>
                          <CardDescription>
                            These fields are optional but recommended for
                            complete patient records
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {validationResult.validationResult.completeness.optionalFields.map(
                              (field, index) => (
                                <Badge key={index} variant="secondary">
                                  {field
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      {isValidating ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-sm text-muted-foreground">
                            Validating patient demographics...
                          </p>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            No Validation Data
                          </h3>
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            Click the validate button to check patient
                            demographics.
                          </p>
                          <Button
                            onClick={() =>
                              validatePatientDemographics(selectedPatient.id)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validate Now
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please select a patient to view their demographics
                    validation.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="episodes" className="space-y-6">
            {selectedPatient ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Episode Management
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage care episodes for {selectedPatient.first_name_en}{" "}
                      {selectedPatient.last_name_en}
                    </p>
                  </div>
                  <Dialog
                    open={showEpisodeDialog}
                    onOpenChange={setShowEpisodeDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Episode
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Episode</DialogTitle>
                        <DialogDescription>
                          Create a new care episode for{" "}
                          {selectedPatient.first_name_en}{" "}
                          {selectedPatient.last_name_en}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="primary_diagnosis">
                              Primary Diagnosis *
                            </Label>
                            <Input
                              id="primary_diagnosis"
                              value={episodeData.primary_diagnosis}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  primary_diagnosis: e.target.value,
                                })
                              }
                              placeholder="Enter primary diagnosis"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondary_diagnosis">
                              Secondary Diagnosis
                            </Label>
                            <Input
                              id="secondary_diagnosis"
                              value={episodeData.secondary_diagnosis}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  secondary_diagnosis: e.target.value,
                                })
                              }
                              placeholder="Enter secondary diagnosis"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {episodeData.start_date
                                    ? format(episodeData.start_date, "PPP")
                                    : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={episodeData.start_date}
                                  onSelect={(date) =>
                                    setEpisodeData({
                                      ...episodeData,
                                      start_date: date || new Date(),
                                    })
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Expected End Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {episodeData.expected_end_date
                                    ? format(
                                        episodeData.expected_end_date,
                                        "PPP",
                                      )
                                    : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={episodeData.expected_end_date}
                                  onSelect={(date) =>
                                    setEpisodeData({
                                      ...episodeData,
                                      expected_end_date: date,
                                    })
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                              value={episodeData.priority}
                              onValueChange={(value) =>
                                setEpisodeData({
                                  ...episodeData,
                                  priority: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service_type">Service Type</Label>
                            <Select
                              value={episodeData.service_type}
                              onValueChange={(value) =>
                                setEpisodeData({
                                  ...episodeData,
                                  service_type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="homecare">
                                  Home Healthcare
                                </SelectItem>
                                <SelectItem value="nursing">
                                  Nursing Care
                                </SelectItem>
                                <SelectItem value="physiotherapy">
                                  Physiotherapy
                                </SelectItem>
                                <SelectItem value="occupational_therapy">
                                  Occupational Therapy
                                </SelectItem>
                                <SelectItem value="speech_therapy">
                                  Speech Therapy
                                </SelectItem>
                                <SelectItem value="wound_care">
                                  Wound Care
                                </SelectItem>
                                <SelectItem value="medication_management">
                                  Medication Management
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="physician_name">
                              Physician Name *
                            </Label>
                            <Input
                              id="physician_name"
                              value={episodeData.physician_name}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  physician_name: e.target.value,
                                })
                              }
                              placeholder="Enter physician name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="physician_license">
                              Physician License
                            </Label>
                            <Input
                              id="physician_license"
                              value={episodeData.physician_license}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  physician_license: e.target.value,
                                })
                              }
                              placeholder="Enter physician license number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="care_team_lead">
                              Care Team Lead
                            </Label>
                            <Input
                              id="care_team_lead"
                              value={episodeData.care_team_lead}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  care_team_lead: e.target.value,
                                })
                              }
                              placeholder="Enter care team lead name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="referral_source">
                              Referral Source
                            </Label>
                            <Input
                              id="referral_source"
                              value={episodeData.referral_source}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  referral_source: e.target.value,
                                })
                              }
                              placeholder="Enter referral source"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Input
                              id="frequency"
                              value={episodeData.frequency}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  frequency: e.target.value,
                                })
                              }
                              placeholder="e.g., 3 times per week"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration_weeks">
                              Duration (Weeks)
                            </Label>
                            <Input
                              id="duration_weeks"
                              type="number"
                              value={episodeData.duration_weeks}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  duration_weeks: e.target.value,
                                })
                              }
                              placeholder="Enter duration in weeks"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="special_instructions">
                            Special Instructions
                          </Label>
                          <Textarea
                            id="special_instructions"
                            value={episodeData.special_instructions}
                            onChange={(e) =>
                              setEpisodeData({
                                ...episodeData,
                                special_instructions: e.target.value,
                              })
                            }
                            placeholder="Enter any special instructions or notes"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emergency_contact_name">
                              Emergency Contact Name
                            </Label>
                            <Input
                              id="emergency_contact_name"
                              value={episodeData.emergency_contact_name}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  emergency_contact_name: e.target.value,
                                })
                              }
                              placeholder="Enter contact name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergency_contact_phone">
                              Emergency Contact Phone
                            </Label>
                            <Input
                              id="emergency_contact_phone"
                              value={episodeData.emergency_contact_phone}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  emergency_contact_phone: e.target.value,
                                })
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergency_contact_relationship">
                              Relationship
                            </Label>
                            <Input
                              id="emergency_contact_relationship"
                              value={episodeData.emergency_contact_relationship}
                              onChange={(e) =>
                                setEpisodeData({
                                  ...episodeData,
                                  emergency_contact_relationship:
                                    e.target.value,
                                })
                              }
                              placeholder="e.g., Spouse, Child"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowEpisodeDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateEpisode}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Creating..." : "Create Episode"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Episodes List */}
                <div className="space-y-4">
                  {patientEpisodes.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Episodes Found
                        </h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                          This patient doesn't have any care episodes yet.
                        </p>
                        <Button onClick={() => setShowEpisodeDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Episode
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {patientEpisodes.map((episode) => (
                        <Card
                          key={episode.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {episode.episode_number}
                                </CardTitle>
                                <CardDescription>
                                  {episode.primary_diagnosis}
                                </CardDescription>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    episode.status === "active"
                                      ? "default"
                                      : episode.status === "completed"
                                        ? "secondary"
                                        : episode.status === "suspended"
                                          ? "destructive"
                                          : episode.status === "cancelled"
                                            ? "outline"
                                            : "outline"
                                  }
                                >
                                  {episode.status.charAt(0).toUpperCase() +
                                    episode.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <CalendarIcon2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>
                                    Start:{" "}
                                    {format(
                                      new Date(episode.start_date),
                                      "PPP",
                                    )}
                                  </span>
                                </div>
                                {episode.expected_end_date && (
                                  <div className="flex items-center">
                                    <CalendarIcon2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>
                                      Expected End:{" "}
                                      {format(
                                        new Date(episode.expected_end_date),
                                        "PPP",
                                      )}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>
                                    Physician: {episode.physician_name}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>
                                    Care Lead:{" "}
                                    {episode.care_team_lead || "Not assigned"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>Service: {episode.service_type}</span>
                                </div>
                                {episode.frequency && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>Frequency: {episode.frequency}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewEpisode(episode)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement edit episode functionality
                                    console.log("Edit episode:", episode.id);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement episode timeline view
                                    console.log("View timeline:", episode.id);
                                  }}
                                >
                                  <Activity className="h-4 w-4 mr-2" />
                                  Timeline
                                </Button>
                              </div>
                              <div className="flex space-x-2">
                                {episode.status === "active" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateEpisodeStatus(
                                        episode.id,
                                        "cancelled",
                                      )
                                    }
                                  >
                                    Cancel
                                  </Button>
                                )}
                                {episode.status === "suspended" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateEpisodeStatus(
                                        episode.id,
                                        "active",
                                      )
                                    }
                                  >
                                    Reactivate
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please select a patient from the search tab to manage their
                    episodes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            {selectedPatient ? (
              <div className="grid gap-6">
                {/* Emirates ID Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Emirates ID Verification
                    </CardTitle>
                    <CardDescription>
                      Verify patient identity using Emirates ID
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter Emirates ID (784-YYYY-XXXXXXX-X)"
                        value={emiratesIdData.emiratesId}
                        onChange={(e) =>
                          setEmiratesIdData({
                            ...emiratesIdData,
                            emiratesId: e.target.value,
                          })
                        }
                      />
                      <Button
                        onClick={handleEmiratesIdVerification}
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Verifying..." : "Verify"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsScanning(true)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Scan ID
                      </Button>
                    </div>

                    {emiratesIdData.verificationResult && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center mb-2">
                          {emiratesIdData.isVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className="font-semibold">
                            {emiratesIdData.isVerified
                              ? "Verification Successful"
                              : "Verification Failed"}
                          </span>
                        </div>
                        {emiratesIdData.isVerified &&
                          emiratesIdData.verificationResult.data && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                Name:{" "}
                                {
                                  emiratesIdData.verificationResult.data
                                    .fullNameEn
                                }
                              </div>
                              <div>
                                Gender:{" "}
                                {emiratesIdData.verificationResult.data.gender}
                              </div>
                              <div>
                                DOB:{" "}
                                {
                                  emiratesIdData.verificationResult.data
                                    .dateOfBirth
                                }
                              </div>
                              <div>
                                Nationality:{" "}
                                {
                                  emiratesIdData.verificationResult.data
                                    .nationality
                                }
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Insurance Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Insurance Verification
                    </CardTitle>
                    <CardDescription>
                      Verify insurance coverage and eligibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Insurance Provider</Label>
                        <Select
                          value={insuranceData.provider}
                          onValueChange={(value) =>
                            setInsuranceData({
                              ...insuranceData,
                              provider: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAMAN">DAMAN</SelectItem>
                            <SelectItem value="ADNIC">ADNIC</SelectItem>
                            <SelectItem value="OMAN">Oman Insurance</SelectItem>
                            <SelectItem value="ORIENT">
                              Orient Insurance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Policy Number</Label>
                        <Input
                          placeholder="Enter policy number"
                          value={insuranceData.policyNumber}
                          onChange={(e) =>
                            setInsuranceData({
                              ...insuranceData,
                              policyNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleInsuranceVerification}
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Verifying..." : "Verify Coverage"}
                      </Button>
                      <Button variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Scan Card
                      </Button>
                    </div>

                    {insuranceData.verificationResult && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center mb-2">
                          {insuranceData.isVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className="font-semibold">
                            {insuranceData.isVerified
                              ? "Coverage Verified"
                              : "Verification Failed"}
                          </span>
                        </div>
                        {insuranceData.isVerified &&
                          insuranceData.verificationResult.data && (
                            <div className="space-y-2 text-sm">
                              <div>
                                Status:{" "}
                                {
                                  insuranceData.verificationResult.data
                                    .eligibilityStatus
                                }
                              </div>
                              <div>
                                Plan:{" "}
                                {insuranceData.verificationResult.data.planType}
                              </div>
                              <div>
                                Home Healthcare:{" "}
                                {insuranceData.verificationResult.data
                                  .coverageDetails.homeHealthcare.covered
                                  ? "Covered"
                                  : "Not Covered"}
                              </div>
                              {insuranceData.verificationResult.data
                                .coverageDetails.homeHealthcare
                                .preAuthRequired && (
                                <div className="text-amber-600">
                                  ⚠️ Pre-authorization required
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please select a patient to perform verification checks.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            {selectedPatient ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Emergency Contacts
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage emergency contacts for{" "}
                      {selectedPatient.first_name_en}{" "}
                      {selectedPatient.last_name_en}
                    </p>
                  </div>
                  <Dialog
                    open={showEmergencyContactDialog}
                    onOpenChange={setShowEmergencyContactDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Emergency Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedEmergencyContact ? "Edit" : "Add"} Emergency
                          Contact
                        </DialogTitle>
                        <DialogDescription>
                          {selectedEmergencyContact ? "Update" : "Add"}{" "}
                          emergency contact information for{" "}
                          {selectedPatient.first_name_en}{" "}
                          {selectedPatient.last_name_en}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact_name">Full Name *</Label>
                          <Input
                            id="contact_name"
                            value={emergencyContactData.name}
                            onChange={(e) =>
                              setEmergencyContactData({
                                ...emergencyContactData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="relationship">Relationship *</Label>
                          <Select
                            value={emergencyContactData.relationship}
                            onValueChange={(value) =>
                              setEmergencyContactData({
                                ...emergencyContactData,
                                relationship: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Guardian">Guardian</SelectItem>
                              <SelectItem value="Friend">Friend</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Phone Number *</Label>
                          <Input
                            id="phone_number"
                            value={emergencyContactData.phoneNumber}
                            onChange={(e) =>
                              setEmergencyContactData({
                                ...emergencyContactData,
                                phoneNumber: e.target.value,
                              })
                            }
                            placeholder="+971 XX XXX XXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={emergencyContactData.email}
                            onChange={(e) =>
                              setEmergencyContactData({
                                ...emergencyContactData,
                                email: e.target.value,
                              })
                            }
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={emergencyContactData.address}
                            onChange={(e) =>
                              setEmergencyContactData({
                                ...emergencyContactData,
                                address: e.target.value,
                              })
                            }
                            placeholder="Enter full address"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={emergencyContactData.notes}
                            onChange={(e) =>
                              setEmergencyContactData({
                                ...emergencyContactData,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Additional notes or instructions"
                            rows={2}
                          />
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is_primary"
                              checked={emergencyContactData.isPrimary}
                              onCheckedChange={(checked) =>
                                setEmergencyContactData({
                                  ...emergencyContactData,
                                  isPrimary: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="is_primary">Primary Contact</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can_make_decisions"
                              checked={emergencyContactData.canMakeDecisions}
                              onCheckedChange={(checked) =>
                                setEmergencyContactData({
                                  ...emergencyContactData,
                                  canMakeDecisions: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="can_make_decisions">
                              Can Make Medical Decisions
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEmergencyContactDialog(false);
                            setSelectedEmergencyContact(null);
                            setEmergencyContactData({
                              name: "",
                              relationship: "",
                              phoneNumber: "",
                              email: "",
                              address: "",
                              isPrimary: false,
                              canMakeDecisions: false,
                              notes: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={
                            selectedEmergencyContact
                              ? handleUpdateEmergencyContact
                              : handleCreateEmergencyContact
                          }
                          disabled={
                            isProcessing ||
                            !emergencyContactData.name ||
                            !emergencyContactData.relationship ||
                            !emergencyContactData.phoneNumber
                          }
                        >
                          {isProcessing
                            ? "Saving..."
                            : selectedEmergencyContact
                              ? "Update Contact"
                              : "Add Contact"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {emergencyContacts.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Emergency Contacts
                      </h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        This patient doesn't have any emergency contacts yet.
                      </p>
                      <Button
                        onClick={() => setShowEmergencyContactDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Contact
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {emergencyContacts.map((contact) => (
                      <Card
                        key={contact.id}
                        className={
                          contact.is_primary ? "border-blue-200 bg-blue-50" : ""
                        }
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center">
                                {contact.name}
                                {contact.is_primary && (
                                  <Badge className="ml-2" variant="default">
                                    Primary
                                  </Badge>
                                )}
                                {contact.can_make_decisions && (
                                  <Badge className="ml-2" variant="secondary">
                                    Decision Maker
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                {contact.relationship}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{contact.phone_number}</span>
                              </div>
                              {contact.email && (
                                <div className="flex items-center">
                                  <span className="h-4 w-4 mr-2 text-muted-foreground">
                                    @
                                  </span>
                                  <span>{contact.email}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {contact.address && (
                                <div className="flex items-start">
                                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                                  <span className="text-sm">
                                    {contact.address}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {contact.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                              <strong>Notes:</strong> {contact.notes}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditEmergencyContact(contact)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              {!contact.is_primary && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleSetPrimaryContact(contact.id)
                                  }
                                  disabled={isProcessing}
                                >
                                  Set as Primary
                                </Button>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteEmergencyContact(contact.id)
                              }
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please select a patient to manage their emergency contacts.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="consent" className="space-y-6">
            {selectedPatient ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Consent Management
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage patient consents for{" "}
                      {selectedPatient.first_name_en}{" "}
                      {selectedPatient.last_name_en}
                    </p>
                  </div>
                  <Button onClick={() => setShowConsentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Consent
                  </Button>
                </div>

                {patientConsents.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Consents Found
                      </h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        This patient doesn't have any consent records yet.
                      </p>
                      <Button onClick={() => setShowConsentDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Consent
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {patientConsents.map((consent) => (
                      <Card key={consent.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {consent.consent_type}
                              </CardTitle>
                              <CardDescription>
                                {consent.consent_category}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                consent.status === "accepted"
                                  ? "default"
                                  : consent.status === "declined"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {consent.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{consent.consent_text}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {consent.signed_at
                                ? `Signed: ${format(new Date(consent.signed_at), "PPP")}`
                                : "Not signed"}
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              {consent.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedConsent(consent);
                                    setShowSignatureDialog(true);
                                  }}
                                >
                                  <Signature className="h-4 w-4 mr-2" />
                                  Sign
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Patient Selected
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please select a patient to manage their consent records.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Episode Details Dialog */}
        <Dialog
          open={showEpisodeDetailsDialog}
          onOpenChange={setShowEpisodeDetailsDialog}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Episode Details</DialogTitle>
              <DialogDescription>
                {selectedEpisode?.episode_number} -{" "}
                {selectedEpisode?.primary_diagnosis}
              </DialogDescription>
            </DialogHeader>
            {selectedEpisode && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Episode Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Episode Number:</span>
                        <span>{selectedEpisode.episode_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={
                            selectedEpisode.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedEpisode.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Priority:</span>
                        <Badge
                          variant={
                            selectedEpisode.priority === "urgent"
                              ? "destructive"
                              : selectedEpisode.priority === "high"
                                ? "default"
                                : "outline"
                          }
                        >
                          {selectedEpisode.priority?.charAt(0).toUpperCase() +
                            selectedEpisode.priority?.slice(1) || "Medium"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>
                          {format(new Date(selectedEpisode.start_date), "PPP")}
                        </span>
                      </div>
                      {selectedEpisode.expected_end_date && (
                        <div className="flex justify-between">
                          <span className="font-medium">Expected End:</span>
                          <span>
                            {format(
                              new Date(selectedEpisode.expected_end_date),
                              "PPP",
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Service Type:</span>
                        <span>{selectedEpisode.service_type}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Care Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Physician:</span>
                        <span>{selectedEpisode.physician_name}</span>
                      </div>
                      {selectedEpisode.physician_license && (
                        <div className="flex justify-between">
                          <span className="font-medium">License:</span>
                          <span>{selectedEpisode.physician_license}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Care Team Lead:</span>
                        <span>
                          {selectedEpisode.care_team_lead || "Not assigned"}
                        </span>
                      </div>
                      {selectedEpisode.referral_source && (
                        <div className="flex justify-between">
                          <span className="font-medium">Referral Source:</span>
                          <span>{selectedEpisode.referral_source}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Clinical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium">Primary Diagnosis:</span>
                      <p className="mt-1">
                        {selectedEpisode.primary_diagnosis}
                      </p>
                    </div>
                    {selectedEpisode.secondary_diagnosis && (
                      <div>
                        <span className="font-medium">
                          Secondary Diagnosis:
                        </span>
                        <p className="mt-1">
                          {selectedEpisode.secondary_diagnosis}
                        </p>
                      </div>
                    )}
                    {selectedEpisode.special_instructions && (
                      <div>
                        <span className="font-medium">
                          Special Instructions:
                        </span>
                        <p className="mt-1">
                          {selectedEpisode.special_instructions}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(selectedEpisode.emergency_contact_name ||
                  selectedEpisode.emergency_contact_phone) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedEpisode.emergency_contact_name && (
                        <div className="flex justify-between">
                          <span className="font-medium">Name:</span>
                          <span>{selectedEpisode.emergency_contact_name}</span>
                        </div>
                      )}
                      {selectedEpisode.emergency_contact_phone && (
                        <div className="flex justify-between">
                          <span className="font-medium">Phone:</span>
                          <span>{selectedEpisode.emergency_contact_phone}</span>
                        </div>
                      )}
                      {selectedEpisode.emergency_contact_relationship && (
                        <div className="flex justify-between">
                          <span className="font-medium">Relationship:</span>
                          <span>
                            {selectedEpisode.emergency_contact_relationship}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEpisodeDetailsDialog(false)}
                  >
                    Close
                  </Button>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Episode
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Consent Signature Dialog */}
        <Dialog
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Consent Decision</DialogTitle>
              <DialogDescription>
                Record the patient's consent decision with electronic signature
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Consent Decision</Label>
                <Select
                  value={consentDecision}
                  onValueChange={setConsentDecision}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accepted">Accept</SelectItem>
                    <SelectItem value="declined">Decline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Witness Name (Optional)</Label>
                <Input
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  placeholder="Enter witness name"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter reason for decision"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Electronic Signature</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Signature className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Signature pad would be implemented here
                  </p>
                  <Button variant="outline" className="mt-2">
                    Clear Signature
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSignatureDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConsentDecision}
                disabled={isProcessing || !consentDecision}
              >
                {isProcessing ? "Recording..." : "Record Decision"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
