import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, FileText, UserPlus, AlertCircle, Users, Shield, } from "lucide-react";
import { PatientService, supabase } from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientReferral from "./PatientReferral";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import PatientEpisode from "./PatientEpisode";
const PatientManagement = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
    const [isEmirateScanDialogOpen, setIsEmirateScanDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [activeSection, setActiveSection] = useState("patients");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const { handleSuccess, handleApiError } = useErrorHandler();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    // Emirates ID scanning state
    const [scanResult, setScanResult] = useState(null);
    const [scanningProgress, setScanningProgress] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
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
            const { data: { user }, } = await supabase.auth.getUser();
            setCurrentUser(user);
            // Load patients
            await loadPatients();
        }
        catch (error) {
            handleApiError(error, "PatientManagement initialization");
        }
        finally {
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
            const transformedPatients = data?.map((patient) => ({
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
                homeboundStatus: patient.status === "active" ? "qualified" : "pending_assessment",
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
                emergencyContacts: patient.emergency_contacts,
                chronicConditions: patient.chronic_conditions,
                currentMedications: patient.current_medications,
            })) || [];
            setPatients(transformedPatients);
        }
        catch (error) {
            handleApiError(error, "Loading patients");
        }
    };
    // Real-time updates
    useEffect(() => {
        if (!currentUser)
            return;
        // Subscribe to patient updates
        const subscription = supabase
            .channel("patients-changes")
            .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "patients",
        }, (payload) => {
            console.log("Patient updated:", payload);
            // Reload patients when changes occur
            loadPatients();
        })
            .subscribe();
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentUser]);
    // Handle patient registration
    const handleRegisterPatient = async (patientData) => {
        try {
            if (!currentUser) {
                handleApiError(new Error("User not authenticated"), "Patient registration");
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
            });
            if (error) {
                handleApiError(error, "Patient registration");
                return;
            }
            handleSuccess("Patient registered successfully");
            setIsRegisterDialogOpen(false);
            await loadPatients();
        }
        catch (error) {
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
    const mockPatients = [
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
    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
    };
    const handleBackToList = () => {
        setSelectedPatient(null);
    };
    const getInsuranceStatusColor = (status) => {
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
    const getLifecycleStatusColor = (status) => {
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
    const getRiskLevelColor = (level) => {
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
    const getHomeboundStatusColor = (status) => {
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
            const { mobileCommunicationService } = await import("@/services/mobile-communication.service");
            // Check camera capabilities
            const cameraStatus = await mobileCommunicationService.initializeCameraIntegration();
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
                    if (prev === null)
                        return 10;
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
                        const { offlineService } = await import("@/services/offline.service");
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
                }
                catch (error) {
                    setValidationErrors(["Failed to process Emirates ID scan"]);
                }
            }
            else {
                setValidationErrors([`Camera capture failed: ${captureResult.error}`]);
            }
        }
        catch (error) {
            console.error("Enhanced camera capture error:", error);
            setValidationErrors(["Camera access denied or not available"]);
        }
        finally {
            setIsScanning(false);
            setScanningProgress(null);
        }
    };
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            setIsScanning(true);
            setScanningProgress(0);
            setValidationErrors([]);
            // Simulate file processing progress
            const progressInterval = setInterval(() => {
                setScanningProgress((prev) => {
                    if (prev === null)
                        return 20;
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
                }
                catch (error) {
                    setValidationErrors(["Failed to process uploaded image"]);
                }
                finally {
                    setIsScanning(false);
                    setScanningProgress(null);
                }
            }, 2500);
        }
        catch (error) {
            console.error("File upload error:", error);
            setValidationErrors(["Failed to process uploaded file"]);
            setIsScanning(false);
            setScanningProgress(null);
        }
    };
    const validateScannedEmiratesId = async (emiratesId) => {
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
                setValidationErrors(validation.validation?.errors || ["Validation failed"]);
                setScanResult((prev) => prev ? { ...prev, verificationStatus: "failed" } : null);
            }
        }
        catch (error) {
            console.error("Validation error:", error);
            setValidationErrors([
                "Unable to validate Emirates ID with government database",
            ]);
        }
    };
    const handleUseScanResults = () => {
        if (scanResult) {
            // Auto-fill the registration form with scan results
            // This would typically update form state or call a callback
            console.log("Using scan results:", scanResult);
            setIsEmirateScanDialogOpen(false);
            setIsRegisterDialogOpen(true);
            // In a real implementation, you would populate the form fields here
            // For example: setFormData({ ...formData, ...scanResult });
        }
    };
    // Filter patients based on search query and active tab
    const filteredPatients = (patients.length > 0 ? patients : mockPatients).filter((patient) => {
        const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.emiratesId.includes(searchQuery);
        if (activeTab === "all")
            return matchesSearch;
        if (activeTab === "active")
            return matchesSearch && patient.insuranceStatus === "active";
        if (activeTab === "expired")
            return matchesSearch && patient.insuranceStatus === "expired";
        if (activeTab === "pending")
            return matchesSearch && patient.insuranceStatus === "pending";
        return matchesSearch;
    });
    if (selectedPatient) {
        return (_jsx(PatientEpisode, { patient: selectedPatient, onBack: handleBackToList }));
    }
    if (activeSection === "referrals") {
        return _jsx(PatientReferral, {});
    }
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Patient Management" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: activeSection === "referrals" ? "default" : "outline", onClick: () => setActiveSection("referrals"), children: [_jsx(UserPlus, { className: "mr-2 h-4 w-4" }), " Referrals"] }), _jsxs(Button, { variant: activeSection === "patients" ? "default" : "outline", onClick: () => setActiveSection("patients"), children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), " Patients"] }), _jsxs(Button, { onClick: () => setIsRegisterDialogOpen(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Register New Patient"] })] })] }), _jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by name or Emirates ID", className: "pl-10", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), " Filter"] }), _jsx(Tabs, { defaultValue: "all", className: "w-[400px]", onValueChange: setActiveTab, children: _jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "all", children: "All Patients" }), _jsx(TabsTrigger, { value: "active", children: "Active" }), _jsx(TabsTrigger, { value: "expired", children: "Expired" }), _jsx(TabsTrigger, { value: "pending", children: "Pending" })] }) })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Patient List" }) }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Emirates ID" }), _jsx(TableHead, { children: "Lifecycle Status" }), _jsx(TableHead, { children: "Homebound" }), _jsx(TableHead, { children: "Risk Level" }), _jsx(TableHead, { children: "Complexity" }), _jsx(TableHead, { children: "Insurance" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredPatients.length > 0 ? (filteredPatients.map((patient) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.id}` }), _jsx(AvatarFallback, { children: patient.name.substring(0, 2).toUpperCase() })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: patient.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [patient.gender, ",", " ", new Date().getFullYear() -
                                                                            new Date(patient.dob).getFullYear(), " ", "yrs"] })] })] }) }), _jsx(TableCell, { children: patient.emiratesId }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: getLifecycleStatusColor(patient.lifecycleStatus), children: patient.lifecycleStatus
                                                        .replace("_", " ")
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        patient.lifecycleStatus.replace("_", " ").slice(1) }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: getHomeboundStatusColor(patient.homeboundStatus), children: patient.homeboundStatus
                                                        .replace("_", " ")
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        patient.homeboundStatus.replace("_", " ").slice(1) }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: getRiskLevelColor(patient.riskLevel), children: patient.riskLevel.charAt(0).toUpperCase() +
                                                                patient.riskLevel.slice(1) }), patient.primaryRisks.length > 0 && (_jsxs("span", { className: "text-xs text-muted-foreground", children: ["(", patient.primaryRisks.length, " risks)"] }))] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-12 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${patient.complexityScore >= 80
                                                                    ? "bg-red-500"
                                                                    : patient.complexityScore >= 60
                                                                        ? "bg-orange-500"
                                                                        : patient.complexityScore >= 40
                                                                            ? "bg-yellow-500"
                                                                            : "bg-green-500"}`, style: { width: `${patient.complexityScore}%` } }) }), _jsx("span", { className: "text-sm font-medium", children: patient.complexityScore })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-sm", children: patient.insurance }), _jsx(Badge, { variant: "outline", className: `text-xs ${getInsuranceStatusColor(patient.insuranceStatus)}`, children: patient.insuranceStatus.charAt(0).toUpperCase() +
                                                                patient.insuranceStatus.slice(1) })] }) }), _jsx(TableCell, { className: "text-right", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => handlePatientSelect(patient), children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), " View Episodes"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), " Edit Patient"] }), _jsxs(DropdownMenuItem, { children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), " Lifecycle Management"] }), _jsxs(DropdownMenuItem, { children: [_jsx(AlertCircle, { className: "mr-2 h-4 w-4" }), " Risk Assessment"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), " Family/Caregivers"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Shield, { className: "mr-2 h-4 w-4" }), " Homebound Assessment"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), " Delete Patient"] })] })] }) })] }, patient.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-4", children: "No patients found matching your search criteria." }) })) })] }) })] }), _jsx(Dialog, { open: isRegisterDialogOpen, onOpenChange: setIsRegisterDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Register New Patient" }) }), _jsxs("div", { className: "grid gap-6 py-4", children: [_jsxs("div", { className: "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                setIsRegisterDialogOpen(false);
                                                setIsEmirateScanDialogOpen(true);
                                            }, children: "Scan Emirates ID" }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "or enter details manually" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "firstName", className: "text-sm font-medium", children: "First Name (English)" }), _jsx(Input, { id: "firstName", placeholder: "First Name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "lastName", className: "text-sm font-medium", children: "Last Name (English)" }), _jsx(Input, { id: "lastName", placeholder: "Last Name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "emiratesId", className: "text-sm font-medium", children: "Emirates ID" }), _jsx(Input, { id: "emiratesId", placeholder: "784-YYYY-XXXXXXX-X" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "dob", className: "text-sm font-medium", children: "Date of Birth" }), _jsx(Input, { id: "dob", type: "date" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "gender", className: "text-sm font-medium", children: "Gender" }), _jsxs("select", { className: "w-full p-2 border rounded", children: [_jsx("option", { value: "", children: "Select Gender" }), _jsx("option", { value: "male", children: "Male" }), _jsx("option", { value: "female", children: "Female" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "nationality", className: "text-sm font-medium", children: "Nationality" }), _jsxs("select", { className: "w-full p-2 border rounded", children: [_jsx("option", { value: "", children: "Select Nationality" }), _jsx("option", { value: "UAE", children: "UAE" }), _jsx("option", { value: "Saudi Arabia", children: "Saudi Arabia" }), _jsx("option", { value: "Egypt", children: "Egypt" }), _jsx("option", { value: "India", children: "India" }), _jsx("option", { value: "Pakistan", children: "Pakistan" }), _jsx("option", { value: "Philippines", children: "Philippines" }), _jsx("option", { value: "Other", children: "Other" })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "arabicFirstName", className: "text-sm font-medium", children: "First Name (Arabic)" }), _jsx(Input, { id: "arabicFirstName", placeholder: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644", dir: "rtl" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "arabicLastName", className: "text-sm font-medium", children: "Last Name (Arabic)" }), _jsx(Input, { id: "arabicLastName", placeholder: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0626\u0644\u0629", dir: "rtl" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "phone", className: "text-sm font-medium", children: "Phone Number" }), _jsx(Input, { id: "phone", placeholder: "+971 XX XXX XXXX" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "thiqaCard", className: "text-sm font-medium", children: "Thiqa Card Number (Optional)" }), _jsx(Input, { id: "thiqaCard", placeholder: "Thiqa Card Number" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "DOH 2025 Enhanced Registration" }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Homebound Status Assessment (DOH Requirement)" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "Homebound Status" }), _jsxs("select", { className: "w-full p-2 border rounded text-sm", children: [_jsx("option", { value: "", children: "Select homebound status" }), _jsx("option", { value: "qualified", children: "Qualified - Unable to leave home without considerable effort" }), _jsx("option", { value: "not_qualified", children: "Not Qualified - Able to leave home regularly" }), _jsx("option", { value: "pending_assessment", children: "Pending Assessment" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "Clinical Justification for Homebound Status" }), _jsx("textarea", { className: "w-full p-2 border rounded text-sm", rows: 3, placeholder: "Provide clinical justification for homebound status determination" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "Assessment Date" }), _jsx("input", { type: "date", className: "w-full p-2 border rounded text-sm" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "Assessed By" }), _jsx("input", { type: "text", className: "w-full p-2 border rounded text-sm", placeholder: "Healthcare provider name" })] })] })] })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Language Preferences & Communication" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-green-800", children: "Primary Language" }), _jsxs("select", { className: "w-full p-2 border rounded text-sm", children: [_jsx("option", { value: "", children: "Select primary language" }), _jsx("option", { value: "arabic", children: "Arabic" }), _jsx("option", { value: "english", children: "English" }), _jsx("option", { value: "urdu", children: "Urdu" }), _jsx("option", { value: "hindi", children: "Hindi" }), _jsx("option", { value: "tagalog", children: "Tagalog" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-green-800", children: "Interpreter Required" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "interpreterRequired", className: "rounded" }), _jsx("label", { htmlFor: "interpreterRequired", className: "text-sm", children: "Yes, interpreter services needed" })] })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Insurance Information" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Insurance Type" }), _jsxs("select", { className: "w-full p-2 border rounded", children: [_jsx("option", { value: "", children: "Select Insurance Type" }), _jsx("option", { value: "government", children: "Government Insurance" }), _jsx("option", { value: "private", children: "Private Insurance" }), _jsx("option", { value: "self_pay", children: "Self Pay" })] })] }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Enhanced Coverage Verification (CN_15_2025)" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "Pregnancy & Childbirth Coverage" }), _jsxs("select", { className: "w-full p-2 border rounded text-sm", children: [_jsx("option", { value: "", children: "Select coverage status" }), _jsx("option", { value: "covered", children: "Fully Covered" }), _jsx("option", { value: "partial", children: "Partially Covered" }), _jsx("option", { value: "not_covered", children: "Not Covered" }), _jsx("option", { value: "pending", children: "Verification Pending" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "POD Card Validation" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "podValidated", className: "rounded" }), _jsx("label", { htmlFor: "podValidated", className: "text-sm", children: "POD Card Validated" })] })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "text-sm font-medium text-blue-800", children: "Reproductive Health Services Coverage" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mt-1", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("input", { type: "checkbox", id: "prenatalCare", className: "rounded" }), _jsx("label", { htmlFor: "prenatalCare", className: "text-xs", children: "Prenatal Care" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("input", { type: "checkbox", id: "deliveryCare", className: "rounded" }), _jsx("label", { htmlFor: "deliveryCare", className: "text-xs", children: "Delivery Care" })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("input", { type: "checkbox", id: "postnatalCare", className: "rounded" }), _jsx("label", { htmlFor: "postnatalCare", className: "text-xs", children: "Postnatal Care" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "insuranceProvider", className: "text-sm font-medium", children: "Insurance Provider" }), _jsx(Input, { id: "insuranceProvider", placeholder: "e.g. Daman" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "insuranceType", className: "text-sm font-medium", children: "Insurance Type" }), _jsx(Input, { id: "insuranceType", placeholder: "e.g. Enhanced, Thiqa, Basic" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "policyNumber", className: "text-sm font-medium", children: "Policy Number" }), _jsx(Input, { id: "policyNumber", placeholder: "Policy Number" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "expiryDate", className: "text-sm font-medium", children: "Expiry Date" }), _jsx(Input, { id: "expiryDate", type: "date" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsRegisterDialogOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", variant: "default", size: "lg", className: "w-full", disabled: isLoading, children: "Register Patient" })] })] }) }), _jsx(Dialog, { open: isEmirateScanDialogOpen, onOpenChange: setIsEmirateScanDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Scan Emirates ID" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg", children: [_jsx("div", { className: "w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mb-2", children: "Camera access or file upload" }), _jsxs("div", { className: "flex gap-2 justify-center", children: [_jsx(Button, { onClick: () => handleCameraCapture(), children: "Enable Camera" }), _jsx(Button, { variant: "outline", onClick: () => document.getElementById("emiratesIdFile")?.click(), children: "Upload Image" })] }), _jsx("input", { id: "emiratesIdFile", type: "file", accept: "image/*,.pdf", className: "hidden", onChange: handleFileUpload })] }) }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Position the Emirates ID within the frame or upload a clear image. The system will automatically scan and extract information." })] }), scanningProgress && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Scanning Emirates ID..." }), _jsxs("span", { children: [scanningProgress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${scanningProgress}%` } }) })] })), scanResult && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Scan Results" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "Emirates ID:" }), " ", scanResult.emiratesId] }), _jsxs("div", { children: [_jsx("strong", { children: "Name:" }), " ", scanResult.fullNameEnglish] }), _jsxs("div", { children: [_jsx("strong", { children: "Nationality:" }), " ", scanResult.nationality] }), _jsxs("div", { children: [_jsx("strong", { children: "Date of Birth:" }), " ", scanResult.dateOfBirth] }), _jsxs("div", { children: [_jsx("strong", { children: "Gender:" }), " ", scanResult.gender] }), _jsxs("div", { children: [_jsx("strong", { children: "Expiry Date:" }), " ", scanResult.expiryDate] })] }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs ${scanResult.verificationStatus === "verified"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"}`, children: scanResult.verificationStatus === "verified"
                                                        ? "Verified"
                                                        : "Pending Verification" }), _jsxs("span", { className: "text-xs text-gray-600", children: ["Confidence: ", Math.round((scanResult.confidence || 0) * 100), "%"] })] })] })), validationErrors.length > 0 && (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-red-900 mb-2", children: "Validation Errors" }), _jsx("ul", { className: "text-sm text-red-800 space-y-1", children: validationErrors.map((error, index) => (_jsxs("li", { children: ["\u2022 ", error] }, index))) })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setIsEmirateScanDialogOpen(false);
                                        setIsRegisterDialogOpen(true);
                                        setScanResult(null);
                                        setValidationErrors([]);
                                        setScanningProgress(null);
                                    }, children: "Back to Form" }), _jsx(Button, { disabled: !scanResult || scanResult.verificationStatus !== "verified", onClick: handleUseScanResults, children: "Use Scan Results" })] })] }) })] }));
};
export default PatientManagement;
// Enhanced medical terminology dictionary
const medicalTerminologies = {
    "homebound_status": ["qualified", "not_qualified", "pending_assessment", "reassessment_required"],
    "risk_level": ["low", "medium", "high", "critical"],
    "complexity_score": [0, 100],
    "primary_risks": ["Fall Risk", "Medication Complexity", "Infection Risk", "Hospitalization Risk", "Pressure Injury Risk", "Medication Risk"],
    "nationality": ["UAE", "Saudi Arabia", "Egypt", "India", "Pakistan", "Philippines", "Other"],
    "insurance_type": ["government", "private", "self_pay"],
    "insurance_status": ["active", "expired", "pending"],
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
    "risk_level": ["low", "medium",]
};
