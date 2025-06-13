import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, Clock, FileText, Upload, Calendar, User, Shield, Home, Activity, Settings, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const HOMECARE_SERVICES = [
    {
        code: "17-25-1",
        name: "Per Diem Simple Home Visit - Nursing",
        rate: 300,
        description: "Basic nursing care at home",
    },
    {
        code: "17-25-2",
        name: "Per Diem Simple Home Visit - Physiotherapy",
        rate: 300,
        description: "Basic physiotherapy services at home",
    },
    {
        code: "17-25-3",
        name: "Per Diem Specialized Home Visit - OT Consultation",
        rate: 800,
        description: "Occupational therapy consultation",
    },
    {
        code: "17-25-4",
        name: "Per Diem Routine Home Nursing Care",
        rate: 900,
        description: "Routine nursing care with monitoring",
    },
    {
        code: "17-25-5",
        name: "Per Diem Advanced Home Nursing Care",
        rate: 1800,
        description: "Advanced nursing care with specialized equipment",
    },
];
const REQUIRED_DOCUMENTS = [
    "Face-to-Face Assessment Form (OpenJet)",
    "Medical Report",
    "Treatment Plan",
    "Physician Referral",
    "Insurance Authorization",
    "Patient Consent Form",
    "Homecare Service Agreement",
    "Provider Credentials Verification",
    "Emergency Contact Information",
    "Medication List",
    "Care Plan Documentation",
    "Quality Assurance Checklist",
];
export default function HomecareAllocationManager({ patientId = "", onAllocationComplete, className, }) {
    const [allocation, setAllocation] = useState({
        patientId,
        patientName: "",
        emiratesId: "",
        damanInsuranceNumber: "",
        contactNumber: "",
        address: "",
        serviceType: "",
        serviceCodes: [],
        requestedDuration: 30,
        frequency: "daily",
        urgencyLevel: "routine",
        openJetRequestId: "",
        faceToFaceAssessmentCompleted: false,
        faceToFaceAssessmentDate: "",
        assessmentOutcome: "",
        periodicAssessmentRequired: false,
        nextAssessmentDate: "",
        preferredProvider: "",
        allocatedProvider: "",
        providerContactInfo: {
            name: "",
            phone: "",
            email: "",
            licenseNumber: "",
        },
        preferredSchedule: {
            startDate: "",
            endDate: "",
            timeSlots: [],
            specialRequirements: "",
        },
        requiredDocuments: [],
        uploadedDocuments: [],
        clinicalJustification: "",
        allocationStatus: "pending",
        complianceChecks: {
            damanApproval: false,
            providerCredentials: false,
            serviceAuthorization: false,
            documentationComplete: false,
        },
        automatedRouting: true,
        routingCriteria: {
            location: true,
            specialization: true,
            availability: true,
            patientPreference: true,
        },
        qualityMetrics: {
            responseTime: 0,
            allocationAccuracy: 0,
            patientSatisfaction: 0,
            providerCompliance: 0,
        },
        requestDate: new Date().toISOString(),
        allocationDate: "",
        confirmationDate: "",
        lastUpdated: new Date().toISOString(),
    });
    const [activeTab, setActiveTab] = useState("patient");
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    // Enhanced validation with OpenJet integration requirements
    const validateAllocation = () => {
        const errors = [];
        const openJetEffectiveDate = new Date("2025-02-24");
        const currentDate = new Date();
        const isOpenJetActive = currentDate >= openJetEffectiveDate;
        // Patient Information Validation
        if (!allocation.patientId)
            errors.push("Patient ID is required");
        if (!allocation.patientName)
            errors.push("Patient name is required");
        if (!allocation.emiratesId)
            errors.push("Emirates ID is required");
        if (!allocation.damanInsuranceNumber)
            errors.push("Daman insurance number is required");
        if (!allocation.contactNumber)
            errors.push("Contact number is required");
        if (!allocation.address)
            errors.push("Patient address is required");
        // Service Requirements Validation
        if (!allocation.serviceType)
            errors.push("Service type must be selected");
        if (allocation.serviceCodes.length === 0)
            errors.push("At least one service code must be selected");
        if (allocation.requestedDuration <= 0)
            errors.push("Requested duration must be greater than 0");
        // OpenJet Integration Validation (Effective Feb 24, 2025)
        if (isOpenJetActive) {
            if (!allocation.openJetRequestId)
                errors.push("OpenJet request ID is required from Feb 24, 2025");
            if (!allocation.faceToFaceAssessmentCompleted)
                errors.push("Face-to-face assessment must be completed for homecare allocation");
            if (!allocation.faceToFaceAssessmentDate)
                errors.push("Face-to-face assessment date is required");
            if (!allocation.assessmentOutcome)
                errors.push("Assessment outcome must be documented");
            // Periodic assessment requirements
            if (allocation.periodicAssessmentRequired &&
                !allocation.nextAssessmentDate) {
                errors.push("Next assessment date is required for periodic assessments");
            }
        }
        // Provider Allocation Validation
        if (allocation.allocationStatus !== "pending") {
            if (!allocation.allocatedProvider)
                errors.push("Provider must be allocated");
            if (!allocation.providerContactInfo.name)
                errors.push("Provider contact information is required");
            if (!allocation.providerContactInfo.licenseNumber)
                errors.push("Provider license number is required");
        }
        // Scheduling Validation
        if (!allocation.preferredSchedule.startDate)
            errors.push("Service start date is required");
        if (!allocation.preferredSchedule.endDate)
            errors.push("Service end date is required");
        if (allocation.preferredSchedule.timeSlots.length === 0)
            errors.push("At least one time slot must be selected");
        // Documentation Validation
        if (allocation.requiredDocuments.length === 0)
            errors.push("Required documents must be specified");
        if (!allocation.clinicalJustification ||
            allocation.clinicalJustification.length < 50) {
            errors.push("Clinical justification must be at least 50 characters long");
        }
        // OpenJet specific document requirements
        if (isOpenJetActive) {
            if (!allocation.requiredDocuments.includes("Face-to-Face Assessment Form (OpenJet)")) {
                errors.push("Face-to-Face Assessment Form (OpenJet) is mandatory from Feb 24, 2025");
            }
        }
        // Compliance Checks Validation
        if (allocation.allocationStatus === "confirmed") {
            if (!allocation.complianceChecks.damanApproval)
                errors.push("Daman approval is required before confirmation");
            if (!allocation.complianceChecks.providerCredentials)
                errors.push("Provider credentials must be verified");
            if (!allocation.complianceChecks.serviceAuthorization)
                errors.push("Service authorization must be confirmed");
            if (!allocation.complianceChecks.documentationComplete)
                errors.push("All documentation must be complete");
        }
        return errors;
    };
    const handleSubmitAllocation = async () => {
        const errors = validateAllocation();
        if (errors.length > 0) {
            setValidationErrors(errors);
            toast({
                title: "Validation Errors",
                description: `${errors.length} issues found. Please review and fix.`,
                variant: "destructive",
            });
            return;
        }
        setIsProcessing(true);
        try {
            // Validate allocation data structure before processing
            const sanitizedAllocation = JSON.parse(JSON.stringify(allocation));
            if (!sanitizedAllocation || typeof sanitizedAllocation !== "object") {
                throw new Error("Invalid allocation data structure");
            }
            // Simulate OpenJet integration and automated routing
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const allocationId = `HCA-${Date.now()}`;
            const openJetRequestId = `OJ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            // Create validated update object with proper structure
            const updatedAllocation = {
                ...sanitizedAllocation,
                openJetRequestId,
                allocationStatus: "allocated",
                allocationDate: new Date().toISOString(),
                allocatedProvider: "Reyada Home Healthcare Services",
                providerContactInfo: {
                    name: "Nurse Sarah Al-Zahra",
                    phone: "+971-50-123-4567",
                    email: "sarah.alzahra@reyada.ae",
                    licenseNumber: "RN-UAE-2024-001",
                },
                qualityMetrics: {
                    responseTime: 15,
                    allocationAccuracy: 98,
                    patientSatisfaction: 95,
                    providerCompliance: 97,
                },
                lastUpdated: new Date().toISOString(),
            };
            // Validate the updated allocation before setting state
            const validatedAllocation = JSON.parse(JSON.stringify(updatedAllocation));
            setAllocation(validatedAllocation);
            toast({
                title: "Homecare Allocation Successful",
                description: `Allocation ${allocationId} created with OpenJet integration. Provider allocated automatically.`,
            });
            if (onAllocationComplete && typeof onAllocationComplete === "function") {
                onAllocationComplete(allocationId);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Allocation processing error:", errorMessage);
            toast({
                title: "Allocation Failed",
                description: "Failed to process homecare allocation. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const addDocument = (documentType) => {
        try {
            if (!documentType || typeof documentType !== "string") {
                console.warn("Invalid document type provided");
                return;
            }
            if (!allocation.requiredDocuments.includes(documentType)) {
                setAllocation((prev) => {
                    const updatedAllocation = {
                        ...prev,
                        requiredDocuments: [...prev.requiredDocuments, documentType],
                    };
                    // Validate the update before applying
                    JSON.parse(JSON.stringify(updatedAllocation));
                    return updatedAllocation;
                });
            }
        }
        catch (error) {
            console.error("Error adding document:", error);
        }
    };
    const removeDocument = (documentType) => {
        try {
            if (!documentType || typeof documentType !== "string") {
                console.warn("Invalid document type provided");
                return;
            }
            setAllocation((prev) => {
                const updatedAllocation = {
                    ...prev,
                    requiredDocuments: prev.requiredDocuments.filter((doc) => doc !== documentType),
                };
                // Validate the update before applying
                JSON.parse(JSON.stringify(updatedAllocation));
                return updatedAllocation;
            });
        }
        catch (error) {
            console.error("Error removing document:", error);
        }
    };
    const addTimeSlot = (timeSlot) => {
        try {
            if (!timeSlot || typeof timeSlot !== "string") {
                console.warn("Invalid time slot provided");
                return;
            }
            if (!allocation.preferredSchedule.timeSlots.includes(timeSlot)) {
                setAllocation((prev) => {
                    const updatedAllocation = {
                        ...prev,
                        preferredSchedule: {
                            ...prev.preferredSchedule,
                            timeSlots: [...prev.preferredSchedule.timeSlots, timeSlot],
                        },
                    };
                    // Validate the update before applying
                    JSON.parse(JSON.stringify(updatedAllocation));
                    return updatedAllocation;
                });
            }
        }
        catch (error) {
            console.error("Error adding time slot:", error);
        }
    };
    const removeTimeSlot = (timeSlot) => {
        try {
            if (!timeSlot || typeof timeSlot !== "string") {
                console.warn("Invalid time slot provided");
                return;
            }
            setAllocation((prev) => {
                const updatedAllocation = {
                    ...prev,
                    preferredSchedule: {
                        ...prev.preferredSchedule,
                        timeSlots: prev.preferredSchedule.timeSlots.filter((slot) => slot !== timeSlot),
                    },
                };
                // Validate the update before applying
                JSON.parse(JSON.stringify(updatedAllocation));
                return updatedAllocation;
            });
        }
        catch (error) {
            console.error("Error removing time slot:", error);
        }
    };
    return (_jsxs("div", { className: `bg-white space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Home, { className: "w-6 h-6 mr-2 text-blue-600" }), "Homecare Allocation Manager"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "OpenJet integrated homecare allocation with automated routing (Effective Feb 24, 2025)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700", children: "OpenJet Integration Active" }), _jsx(Badge, { className: allocation.allocationStatus === "allocated"
                                    ? "text-green-600 bg-green-100"
                                    : "text-yellow-600 bg-yellow-100", children: allocation.allocationStatus.toUpperCase() })] })] }), _jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Settings, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "OpenJet Homecare Allocation Automation (Effective Feb 24, 2025)" }), _jsx(AlertDescription, { className: "text-blue-700", children: _jsxs("ul", { className: "list-disc list-inside space-y-1 mt-2", children: [_jsx("li", { children: "Automated provider routing and tracking" }), _jsx("li", { children: "Face-to-face assessment form mandatory" }), _jsx("li", { children: "Real-time service request status synchronization" }), _jsx("li", { children: "Unified provider portal experience" }), _jsx("li", { children: "Enhanced quality metrics and compliance monitoring" })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "patient", children: "Patient Info" }), _jsx(TabsTrigger, { value: "services", children: "Services" }), _jsx(TabsTrigger, { value: "assessment", children: "Assessment" }), _jsx(TabsTrigger, { value: "provider", children: "Provider" }), _jsx(TabsTrigger, { value: "schedule", children: "Schedule" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" })] }), _jsx(TabsContent, { value: "patient", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(User, { className: "w-5 h-5 mr-2" }), "Patient Information"] }), _jsx(CardDescription, { children: "Complete patient demographics and contact details" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "patientId", children: "Patient ID" }), _jsx(Input, { id: "patientId", value: allocation.patientId, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                patientId: e.target.value,
                                                            })), placeholder: "Enter patient ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patientName", children: "Patient Name" }), _jsx(Input, { id: "patientName", value: allocation.patientName, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                patientName: e.target.value,
                                                            })), placeholder: "Enter patient full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emiratesId", children: "Emirates ID" }), _jsx(Input, { id: "emiratesId", value: allocation.emiratesId, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                emiratesId: e.target.value,
                                                            })), placeholder: "xxx-xxxx-xxxxxxx-x" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "damanInsuranceNumber", children: "Daman Insurance Number" }), _jsx(Input, { id: "damanInsuranceNumber", value: allocation.damanInsuranceNumber, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                damanInsuranceNumber: e.target.value,
                                                            })), placeholder: "Enter Daman insurance number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contactNumber", children: "Contact Number" }), _jsx(Input, { id: "contactNumber", value: allocation.contactNumber, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                contactNumber: e.target.value,
                                                            })), placeholder: "+971-xx-xxx-xxxx" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "address", children: "Home Address" }), _jsx(Textarea, { id: "address", value: allocation.address, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    })), placeholder: "Enter complete home address for service delivery", rows: 3 })] })] })] }) }), _jsx(TabsContent, { value: "services", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Activity, { className: "w-5 h-5 mr-2" }), "Homecare Services"] }), _jsx(CardDescription, { children: "Select required homecare services with updated codes" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "serviceType", children: "Primary Service Type" }), _jsxs(Select, { value: allocation.serviceType, onValueChange: (value) => setAllocation((prev) => ({ ...prev, serviceType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select primary service" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "nursing_care", children: "Nursing Care" }), _jsx(SelectItem, { value: "physiotherapy", children: "Physiotherapy" }), _jsx(SelectItem, { value: "occupational_therapy", children: "Occupational Therapy" }), _jsx(SelectItem, { value: "routine_nursing", children: "Routine Nursing" }), _jsx(SelectItem, { value: "advanced_nursing", children: "Advanced Nursing" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "urgencyLevel", children: "Urgency Level" }), _jsxs(Select, { value: allocation.urgencyLevel, onValueChange: (value) => setAllocation((prev) => ({
                                                                ...prev,
                                                                urgencyLevel: value,
                                                            })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "routine", children: "Routine" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" }), _jsx(SelectItem, { value: "emergency", children: "Emergency" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "requestedDuration", children: "Duration (Days)" }), _jsx(Input, { id: "requestedDuration", type: "number", value: allocation.requestedDuration, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                requestedDuration: parseInt(e.target.value) || 0,
                                                            })), min: "1", max: "365" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "frequency", children: "Service Frequency" }), _jsxs(Select, { value: allocation.frequency, onValueChange: (value) => setAllocation((prev) => ({ ...prev, frequency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "daily", children: "Daily" }), _jsx(SelectItem, { value: "twice_daily", children: "Twice Daily" }), _jsx(SelectItem, { value: "three_times_weekly", children: "3 Times Weekly" }), _jsx(SelectItem, { value: "weekly", children: "Weekly" }), _jsx(SelectItem, { value: "as_needed", children: "As Needed" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Available Service Codes (2025)" }), _jsx("div", { className: "grid grid-cols-1 gap-3 mt-2", children: HOMECARE_SERVICES.map((service) => (_jsx("div", { className: "p-4 border rounded-lg bg-green-50 border-green-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", id: service.code, checked: allocation.serviceCodes.includes(service.code), onChange: (e) => {
                                                                                if (e.target.checked) {
                                                                                    setAllocation((prev) => ({
                                                                                        ...prev,
                                                                                        serviceCodes: [
                                                                                            ...prev.serviceCodes,
                                                                                            service.code,
                                                                                        ],
                                                                                    }));
                                                                                }
                                                                                else {
                                                                                    setAllocation((prev) => ({
                                                                                        ...prev,
                                                                                        serviceCodes: prev.serviceCodes.filter((code) => code !== service.code),
                                                                                    }));
                                                                                }
                                                                            }, className: "rounded" }), _jsxs("div", { children: [_jsxs(Label, { htmlFor: service.code, className: "font-medium", children: [service.code, " - ", service.name] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: service.description })] })] }), _jsxs(Badge, { className: "text-green-600 bg-green-100", children: ["AED ", service.rate] })] }) }, service.code))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "clinicalJustification", children: "Clinical Justification (Minimum 50 characters)" }), _jsx(Textarea, { id: "clinicalJustification", value: allocation.clinicalJustification, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        clinicalJustification: e.target.value,
                                                    })), placeholder: "Provide detailed clinical justification for homecare services...", rows: 4, className: "mt-1" }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [allocation.clinicalJustification.length, "/50 characters minimum"] })] })] })] }) }), _jsx(TabsContent, { value: "assessment", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "Face-to-Face Assessment (OpenJet Requirement)"] }), _jsx(CardDescription, { children: "Complete face-to-face assessment as per OpenJet integration requirements" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "openJetRequestId", children: "OpenJet Request ID" }), _jsx(Input, { id: "openJetRequestId", value: allocation.openJetRequestId, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                openJetRequestId: e.target.value,
                                                            })), placeholder: "Auto-generated on submission", disabled: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "faceToFaceAssessmentDate", children: "Assessment Date" }), _jsx(Input, { id: "faceToFaceAssessmentDate", type: "date", value: allocation.faceToFaceAssessmentDate, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                faceToFaceAssessmentDate: e.target.value,
                                                            })) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "faceToFaceAssessmentCompleted", checked: allocation.faceToFaceAssessmentCompleted, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        faceToFaceAssessmentCompleted: e.target.checked,
                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "faceToFaceAssessmentCompleted", children: "Face-to-Face Assessment Completed (Required for OpenJet)" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "assessmentOutcome", children: "Assessment Outcome" }), _jsx(Textarea, { id: "assessmentOutcome", value: allocation.assessmentOutcome, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        assessmentOutcome: e.target.value,
                                                    })), placeholder: "Document the outcome of the face-to-face assessment...", rows: 3 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "periodicAssessmentRequired", checked: allocation.periodicAssessmentRequired, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        periodicAssessmentRequired: e.target.checked,
                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "periodicAssessmentRequired", children: "Periodic Assessment Required" })] }), allocation.periodicAssessmentRequired && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "nextAssessmentDate", children: "Next Assessment Date" }), _jsx(Input, { id: "nextAssessmentDate", type: "date", value: allocation.nextAssessmentDate, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        nextAssessmentDate: e.target.value,
                                                    })) })] }))] })] }) }), _jsx(TabsContent, { value: "provider", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "Provider Allocation"] }), _jsx(CardDescription, { children: "Automated provider routing and allocation management" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "automatedRouting", checked: allocation.automatedRouting, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        automatedRouting: e.target.checked,
                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "automatedRouting", children: "Enable Automated Provider Routing (OpenJet)" })] }), allocation.automatedRouting && (_jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-800 mb-3", children: "Routing Criteria" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "locationCriteria", checked: allocation.routingCriteria.location, onChange: (e) => setAllocation((prev) => ({
                                                                        ...prev,
                                                                        routingCriteria: {
                                                                            ...prev.routingCriteria,
                                                                            location: e.target.checked,
                                                                        },
                                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "locationCriteria", children: "Location-based" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "specializationCriteria", checked: allocation.routingCriteria.specialization, onChange: (e) => setAllocation((prev) => ({
                                                                        ...prev,
                                                                        routingCriteria: {
                                                                            ...prev.routingCriteria,
                                                                            specialization: e.target.checked,
                                                                        },
                                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "specializationCriteria", children: "Specialization Match" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "availabilityCriteria", checked: allocation.routingCriteria.availability, onChange: (e) => setAllocation((prev) => ({
                                                                        ...prev,
                                                                        routingCriteria: {
                                                                            ...prev.routingCriteria,
                                                                            availability: e.target.checked,
                                                                        },
                                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "availabilityCriteria", children: "Real-time Availability" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "patientPreferenceCriteria", checked: allocation.routingCriteria.patientPreference, onChange: (e) => setAllocation((prev) => ({
                                                                        ...prev,
                                                                        routingCriteria: {
                                                                            ...prev.routingCriteria,
                                                                            patientPreference: e.target.checked,
                                                                        },
                                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "patientPreferenceCriteria", children: "Patient Preference" })] })] })] })), _jsxs("div", { children: [_jsx(Label, { htmlFor: "preferredProvider", children: "Preferred Provider" }), _jsx(Input, { id: "preferredProvider", value: allocation.preferredProvider, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        preferredProvider: e.target.value,
                                                    })), placeholder: "Enter preferred provider name (optional)" })] }), allocation.allocationStatus !== "pending" && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-800 mb-3", children: "Allocated Provider Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Provider Name" }), _jsx("p", { className: "text-sm font-medium", children: allocation.providerContactInfo.name })] }), _jsxs("div", { children: [_jsx(Label, { children: "License Number" }), _jsx("p", { className: "text-sm font-medium", children: allocation.providerContactInfo.licenseNumber })] }), _jsxs("div", { children: [_jsx(Label, { children: "Contact Phone" }), _jsx("p", { className: "text-sm font-medium", children: allocation.providerContactInfo.phone })] }), _jsxs("div", { children: [_jsx(Label, { children: "Email" }), _jsx("p", { className: "text-sm font-medium", children: allocation.providerContactInfo.email })] })] })] }))] })] }) }), _jsx(TabsContent, { value: "schedule", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Service Schedule"] }), _jsx(CardDescription, { children: "Configure preferred schedule and timing for homecare services" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "startDate", children: "Service Start Date" }), _jsx(Input, { id: "startDate", type: "date", value: allocation.preferredSchedule.startDate, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                preferredSchedule: {
                                                                    ...prev.preferredSchedule,
                                                                    startDate: e.target.value,
                                                                },
                                                            })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "endDate", children: "Service End Date" }), _jsx(Input, { id: "endDate", type: "date", value: allocation.preferredSchedule.endDate, onChange: (e) => setAllocation((prev) => ({
                                                                ...prev,
                                                                preferredSchedule: {
                                                                    ...prev.preferredSchedule,
                                                                    endDate: e.target.value,
                                                                },
                                                            })) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Preferred Time Slots" }), _jsx("div", { className: "grid grid-cols-3 gap-2 mt-2", children: [
                                                        "08:00-10:00",
                                                        "10:00-12:00",
                                                        "12:00-14:00",
                                                        "14:00-16:00",
                                                        "16:00-18:00",
                                                        "18:00-20:00",
                                                    ].map((timeSlot) => (_jsxs(Button, { variant: allocation.preferredSchedule.timeSlots.includes(timeSlot)
                                                            ? "default"
                                                            : "outline", size: "sm", onClick: () => {
                                                            if (allocation.preferredSchedule.timeSlots.includes(timeSlot)) {
                                                                removeTimeSlot(timeSlot);
                                                            }
                                                            else {
                                                                addTimeSlot(timeSlot);
                                                            }
                                                        }, className: "justify-center", children: [allocation.preferredSchedule.timeSlots.includes(timeSlot) ? (_jsx(CheckCircle, { className: "w-3 h-3 mr-1" })) : (_jsx(Clock, { className: "w-3 h-3 mr-1" })), timeSlot] }, timeSlot))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "specialRequirements", children: "Special Requirements" }), _jsx(Textarea, { id: "specialRequirements", value: allocation.preferredSchedule.specialRequirements, onChange: (e) => setAllocation((prev) => ({
                                                        ...prev,
                                                        preferredSchedule: {
                                                            ...prev.preferredSchedule,
                                                            specialRequirements: e.target.value,
                                                        },
                                                    })), placeholder: "Any special scheduling requirements or preferences...", rows: 3 })] })] })] }) }), _jsx(TabsContent, { value: "compliance", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "Compliance & Documentation"] }), _jsx(CardDescription, { children: "Ensure all compliance requirements and documentation are complete" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Required Documents" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 mt-2", children: REQUIRED_DOCUMENTS.map((docType) => {
                                                        const isSelected = allocation.requiredDocuments.includes(docType);
                                                        const isOpenJetDoc = docType.includes("OpenJet");
                                                        return (_jsx(Button, { variant: isSelected ? "default" : "outline", size: "sm", onClick: () => {
                                                                if (isSelected) {
                                                                    removeDocument(docType);
                                                                }
                                                                else {
                                                                    addDocument(docType);
                                                                }
                                                            }, className: "justify-start h-auto p-3", children: _jsxs("div", { className: "flex items-start space-x-2 w-full", children: [isSelected ? (_jsx(CheckCircle, { className: "w-4 h-4 mt-0.5 text-green-600" })) : (_jsx(Upload, { className: "w-4 h-4 mt-0.5" })), _jsxs("div", { className: "text-left flex-1", children: [_jsx("div", { className: "font-medium text-sm", children: docType }), isOpenJetDoc && (_jsx("div", { className: "text-xs text-blue-600 mt-1", children: "OpenJet Requirement" }))] })] }) }, docType));
                                                    }) })] }), _jsxs("div", { className: "p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-800 mb-3", children: "Compliance Checklist" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "damanApproval", checked: allocation.complianceChecks.damanApproval, onChange: (e) => setAllocation((prev) => ({
                                                                                ...prev,
                                                                                complianceChecks: {
                                                                                    ...prev.complianceChecks,
                                                                                    damanApproval: e.target.checked,
                                                                                },
                                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "damanApproval", children: "Daman Approval" })] }), _jsx(Badge, { className: allocation.complianceChecks.damanApproval
                                                                        ? "text-green-600 bg-green-100"
                                                                        : "text-red-600 bg-red-100", children: allocation.complianceChecks.damanApproval
                                                                        ? "Complete"
                                                                        : "Pending" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "providerCredentials", checked: allocation.complianceChecks.providerCredentials, onChange: (e) => setAllocation((prev) => ({
                                                                                ...prev,
                                                                                complianceChecks: {
                                                                                    ...prev.complianceChecks,
                                                                                    providerCredentials: e.target.checked,
                                                                                },
                                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "providerCredentials", children: "Provider Credentials" })] }), _jsx(Badge, { className: allocation.complianceChecks.providerCredentials
                                                                        ? "text-green-600 bg-green-100"
                                                                        : "text-red-600 bg-red-100", children: allocation.complianceChecks.providerCredentials
                                                                        ? "Verified"
                                                                        : "Pending" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "serviceAuthorization", checked: allocation.complianceChecks.serviceAuthorization, onChange: (e) => setAllocation((prev) => ({
                                                                                ...prev,
                                                                                complianceChecks: {
                                                                                    ...prev.complianceChecks,
                                                                                    serviceAuthorization: e.target.checked,
                                                                                },
                                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "serviceAuthorization", children: "Service Authorization" })] }), _jsx(Badge, { className: allocation.complianceChecks.serviceAuthorization
                                                                        ? "text-green-600 bg-green-100"
                                                                        : "text-red-600 bg-red-100", children: allocation.complianceChecks.serviceAuthorization
                                                                        ? "Authorized"
                                                                        : "Pending" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "documentationComplete", checked: allocation.complianceChecks.documentationComplete, onChange: (e) => setAllocation((prev) => ({
                                                                                ...prev,
                                                                                complianceChecks: {
                                                                                    ...prev.complianceChecks,
                                                                                    documentationComplete: e.target.checked,
                                                                                },
                                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "documentationComplete", children: "Documentation Complete" })] }), _jsx(Badge, { className: allocation.complianceChecks.documentationComplete
                                                                        ? "text-green-600 bg-green-100"
                                                                        : "text-red-600 bg-red-100", children: allocation.complianceChecks.documentationComplete
                                                                        ? "Complete"
                                                                        : "Incomplete" })] })] })] }), allocation.allocationStatus !== "pending" && (_jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-800 mb-3", children: "Quality Metrics" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [allocation.qualityMetrics.responseTime, "m"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Response Time" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [allocation.qualityMetrics.allocationAccuracy, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Allocation Accuracy" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [allocation.qualityMetrics.patientSatisfaction, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Patient Satisfaction" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [allocation.qualityMetrics.providerCompliance, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Provider Compliance" })] })] })] }))] })] }) })] }), validationErrors.length > 0 && (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs(AlertTitle, { className: "text-red-800", children: ["Validation Errors (", validationErrors.length, ")"] }), _jsx(AlertDescription, { className: "text-red-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: validationErrors.map((error, index) => (_jsx("li", { className: "text-sm", children: error }, index))) }) })] })), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => {
                            const errors = validateAllocation();
                            setValidationErrors(errors);
                            if (errors.length === 0) {
                                toast({
                                    title: "Validation Successful",
                                    description: "All requirements met. Ready for allocation.",
                                });
                            }
                        }, children: "Validate Allocation" }), _jsx(Button, { onClick: handleSubmitAllocation, disabled: isProcessing, className: "flex items-center", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Activity, { className: "w-4 h-4 mr-2 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Submit Allocation Request"] })) })] })] }));
}
