import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, FileText, Upload, Calendar, User, Shield, Home, Activity, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const HOMECARE_SERVICE_TYPES = [
    "Per Diem Simple Home Visit - Nursing (17-25-1)",
    "Per Diem Simple Home Visit - Physiotherapy (17-25-2)",
    "Per Diem Specialized Home Visit - OT Consultation (17-25-3)",
    "Per Diem Routine Home Nursing Care (17-25-4)",
    "Per Diem Advanced Home Nursing Care (17-25-5)",
];
const REQUIRED_DOCUMENTS = [
    "Face-to-Face Assessment Form",
    "Periodic Assessment Form",
    "Updated Medical Report",
    "Treatment Plan",
    "Patient Consent Form",
    "Insurance Verification",
    "Previous Allocation History (if applicable)",
];
export default function HomecareAllocationManager({ patientId = "", onAllocationComplete, className, }) {
    const [allocationData, setAllocationData] = useState({
        patientId,
        patientName: "",
        emiratesId: "",
        damanInsuranceNumber: "",
        requestType: "new",
        serviceType: "",
        requestedDuration: 30,
        urgencyLevel: "routine",
        faceToFaceCompleted: false,
        faceToFaceDate: "",
        assessmentLocation: "",
        assessingClinician: "",
        assessmentFindings: "",
        periodicAssessmentForm: false,
        updatedMedicalReport: false,
        treatmentPlan: false,
        patientConsent: false,
        insuranceVerification: false,
        openJetRequestId: "",
        submissionStatus: "draft",
        allocationProvider: "",
        allocationDate: "",
        submissionTime: new Date().toISOString(),
        validationErrors: [],
        complianceScore: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("patient");
    // Enhanced validation for Homecare Allocation Automation (Effective Feb 24, 2025)
    const validateAllocation = () => {
        const errors = [];
        const effectiveDate = new Date("2025-02-24");
        const currentDate = new Date();
        // Check if automation is effective
        if (currentDate >= effectiveDate) {
            // Patient Information Validation
            if (!allocationData.patientId)
                errors.push("Patient ID is required");
            if (!allocationData.patientName)
                errors.push("Patient name is required");
            if (!allocationData.emiratesId)
                errors.push("Emirates ID is required");
            if (!allocationData.damanInsuranceNumber)
                errors.push("Daman insurance number is required");
            // Service Request Validation
            if (!allocationData.serviceType)
                errors.push("Service type must be selected");
            if (allocationData.requestedDuration <= 0)
                errors.push("Requested duration must be greater than 0");
            // Face-to-Face Assessment Validation (Mandatory from Feb 24, 2025)
            if (!allocationData.faceToFaceCompleted) {
                errors.push("Face-to-face assessment must be completed before homecare allocation (effective Feb 24, 2025)");
            }
            else {
                if (!allocationData.faceToFaceDate)
                    errors.push("Face-to-face assessment date is required");
                if (!allocationData.assessmentLocation)
                    errors.push("Assessment location is required");
                if (!allocationData.assessingClinician)
                    errors.push("Assessing clinician information is required");
                if (!allocationData.assessmentFindings ||
                    allocationData.assessmentFindings.length < 50) {
                    errors.push("Assessment findings must be at least 50 characters detailed");
                }
            }
            // Required Documentation Validation
            if (!allocationData.periodicAssessmentForm) {
                errors.push("Periodic assessment form is mandatory");
            }
            if (!allocationData.updatedMedicalReport) {
                errors.push("Updated medical report is required");
            }
            if (!allocationData.treatmentPlan) {
                errors.push("Treatment plan documentation is required");
            }
            if (!allocationData.patientConsent) {
                errors.push("Patient consent form is mandatory");
            }
            if (!allocationData.insuranceVerification) {
                errors.push("Insurance verification is required");
            }
            // OpenJet Integration Validation
            if (!allocationData.openJetRequestId &&
                allocationData.submissionStatus !== "draft") {
                errors.push("OpenJet request ID is required for submission");
            }
            // Reallocation Specific Validation
            if (allocationData.requestType === "reallocation") {
                if (!allocationData.allocationProvider) {
                    errors.push("Current provider information is required for reallocation");
                }
            }
            // Urgency Level Validation
            if (allocationData.urgencyLevel === "emergency") {
                if (!allocationData.assessmentFindings.toLowerCase().includes("emergency")) {
                    errors.push("Emergency urgency level requires emergency justification in assessment findings");
                }
            }
        }
        return errors;
    };
    const handleSubmitAllocation = async () => {
        const errors = validateAllocation();
        if (errors.length > 0) {
            setAllocationData((prev) => ({ ...prev, validationErrors: errors }));
            toast({
                title: "Validation Errors",
                description: `${errors.length} issues found. Please review and fix.`,
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Generate OpenJet request ID if not provided
            const openJetId = allocationData.openJetRequestId || `OJ-${Date.now()}`;
            // Simulate OpenJet API submission with proper error handling
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(true);
                    }
                    catch (err) {
                        reject(err);
                    }
                }, 3000);
            });
            const allocationId = `HCA-${Date.now()}`;
            // Ensure state update is properly structured
            const updatedData = {
                ...allocationData,
                openJetRequestId: openJetId,
                submissionStatus: "submitted",
                complianceScore: 95,
                validationErrors: [],
            };
            setAllocationData(updatedData);
            toast({
                title: "Homecare Allocation Submitted",
                description: `Request ${allocationId} submitted via OpenJet automation system`,
            });
            if (onAllocationComplete) {
                onAllocationComplete(allocationId);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Allocation submission error:", errorMessage);
            toast({
                title: "Submission Failed",
                description: "Failed to submit homecare allocation request. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const calculateComplianceScore = () => {
        let score = 0;
        const maxScore = 100;
        // Patient information (20 points)
        if (allocationData.patientId)
            score += 5;
        if (allocationData.patientName)
            score += 5;
        if (allocationData.emiratesId)
            score += 5;
        if (allocationData.damanInsuranceNumber)
            score += 5;
        // Service details (20 points)
        if (allocationData.serviceType)
            score += 10;
        if (allocationData.requestedDuration > 0)
            score += 10;
        // Face-to-face assessment (30 points)
        if (allocationData.faceToFaceCompleted)
            score += 10;
        if (allocationData.faceToFaceDate)
            score += 5;
        if (allocationData.assessingClinician)
            score += 5;
        if (allocationData.assessmentFindings.length >= 50)
            score += 10;
        // Documentation (30 points)
        if (allocationData.periodicAssessmentForm)
            score += 6;
        if (allocationData.updatedMedicalReport)
            score += 6;
        if (allocationData.treatmentPlan)
            score += 6;
        if (allocationData.patientConsent)
            score += 6;
        if (allocationData.insuranceVerification)
            score += 6;
        return Math.min(score, maxScore);
    };
    useEffect(() => {
        const score = calculateComplianceScore();
        setAllocationData((prev) => ({ ...prev, complianceScore: score }));
    }, [
        allocationData.patientId,
        allocationData.patientName,
        allocationData.emiratesId,
        allocationData.damanInsuranceNumber,
        allocationData.serviceType,
        allocationData.requestedDuration,
        allocationData.faceToFaceCompleted,
        allocationData.faceToFaceDate,
        allocationData.assessingClinician,
        allocationData.assessmentFindings,
        allocationData.periodicAssessmentForm,
        allocationData.updatedMedicalReport,
        allocationData.treatmentPlan,
        allocationData.patientConsent,
        allocationData.insuranceVerification,
    ]);
    return (_jsxs("div", { className: `bg-white space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Home, { className: "w-6 h-6 mr-2 text-blue-600" }), "Homecare Allocation Manager"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "OpenJet automation system for homecare allocation (Effective Feb 24, 2025)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700", children: ["Compliance Score: ", allocationData.complianceScore, "%"] }), _jsx(Badge, { className: allocationData.submissionStatus === "submitted"
                                    ? "text-green-600 bg-green-100"
                                    : "text-yellow-600 bg-yellow-100", children: allocationData.submissionStatus.toUpperCase().replace("_", " ") })] })] }), _jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Calendar, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Homecare Allocation Automation (Effective Feb 24, 2025)" }), _jsx(AlertDescription, { className: "text-blue-700", children: "All homecare allocation requests must now be submitted through the OpenJet system. Face-to-face assessments are mandatory, and requests will be processed automatically 24/7 with direct provider allocation." })] }), allocationData.validationErrors.length > 0 && (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs(AlertTitle, { className: "text-red-800", children: ["Validation Errors (", allocationData.validationErrors.length, ")"] }), _jsx(AlertDescription, { className: "text-red-700", children: _jsx("ul", { className: "list-disc list-inside space-y-1 mt-2", children: allocationData.validationErrors.map((error, index) => (_jsx("li", { className: "text-sm", children: error }, index))) }) })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "patient", children: "Patient Info" }), _jsx(TabsTrigger, { value: "service", children: "Service Request" }), _jsx(TabsTrigger, { value: "assessment", children: "Face-to-Face" }), _jsx(TabsTrigger, { value: "documents", children: "Documents" }), _jsx(TabsTrigger, { value: "submission", children: "Submission" })] }), _jsx(TabsContent, { value: "patient", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(User, { className: "w-5 h-5 mr-2" }), "Patient Information"] }), _jsx(CardDescription, { children: "Complete patient demographics and insurance details" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "patientId", children: "Patient ID" }), _jsx(Input, { id: "patientId", value: allocationData.patientId, onChange: (e) => setAllocationData((prev) => ({
                                                            ...prev,
                                                            patientId: e.target.value,
                                                        })), placeholder: "Enter patient ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patientName", children: "Patient Name" }), _jsx(Input, { id: "patientName", value: allocationData.patientName, onChange: (e) => setAllocationData((prev) => ({
                                                            ...prev,
                                                            patientName: e.target.value,
                                                        })), placeholder: "Enter patient full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "emiratesId", children: "Emirates ID" }), _jsx(Input, { id: "emiratesId", value: allocationData.emiratesId, onChange: (e) => setAllocationData((prev) => ({
                                                            ...prev,
                                                            emiratesId: e.target.value,
                                                        })), placeholder: "xxx-xxxx-xxxxxxx-x" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "damanInsuranceNumber", children: "Daman Insurance Number" }), _jsx(Input, { id: "damanInsuranceNumber", value: allocationData.damanInsuranceNumber, onChange: (e) => setAllocationData((prev) => ({
                                                            ...prev,
                                                            damanInsuranceNumber: e.target.value,
                                                        })), placeholder: "Enter Daman insurance number" })] })] }) })] }) }), _jsx(TabsContent, { value: "service", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "Service Request Details"] }), _jsx(CardDescription, { children: "Configure homecare service allocation parameters" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "requestType", children: "Request Type" }), _jsxs(Select, { value: allocationData.requestType, onValueChange: (value) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                requestType: value,
                                                            })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select request type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "new", children: "New Allocation" }), _jsx(SelectItem, { value: "reallocation", children: "Reallocation" }), _jsx(SelectItem, { value: "extension", children: "Extension" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "serviceType", children: "Service Type" }), _jsxs(Select, { value: allocationData.serviceType, onValueChange: (value) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                serviceType: value,
                                                            })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select service type" }) }), _jsx(SelectContent, { children: HOMECARE_SERVICE_TYPES.map((service) => (_jsx(SelectItem, { value: service, children: service }, service))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "requestedDuration", children: "Duration (Days)" }), _jsx(Input, { id: "requestedDuration", type: "number", value: allocationData.requestedDuration, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                requestedDuration: parseInt(e.target.value) || 0,
                                                            })), min: "1", max: "365" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "urgencyLevel", children: "Urgency Level" }), _jsxs(Select, { value: allocationData.urgencyLevel, onValueChange: (value) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                urgencyLevel: value,
                                                            })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select urgency level" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "routine", children: "Routine" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" }), _jsx(SelectItem, { value: "emergency", children: "Emergency" })] })] })] })] }), allocationData.requestType === "reallocation" && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "allocationProvider", children: "Current Provider" }), _jsx(Input, { id: "allocationProvider", value: allocationData.allocationProvider, onChange: (e) => setAllocationData((prev) => ({
                                                        ...prev,
                                                        allocationProvider: e.target.value,
                                                    })), placeholder: "Enter current provider name" })] }))] })] }) }), _jsx(TabsContent, { value: "assessment", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Activity, { className: "w-5 h-5 mr-2" }), "Face-to-Face Assessment (Mandatory)"] }), _jsx(CardDescription, { children: "Complete face-to-face assessment required from Feb 24, 2025" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "faceToFaceCompleted", checked: allocationData.faceToFaceCompleted, onChange: (e) => setAllocationData((prev) => ({
                                                        ...prev,
                                                        faceToFaceCompleted: e.target.checked,
                                                    })), className: "rounded" }), _jsx(Label, { htmlFor: "faceToFaceCompleted", children: "Face-to-Face Assessment Completed" })] }), allocationData.faceToFaceCompleted && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "faceToFaceDate", children: "Assessment Date" }), _jsx(Input, { id: "faceToFaceDate", type: "date", value: allocationData.faceToFaceDate, onChange: (e) => setAllocationData((prev) => ({
                                                                        ...prev,
                                                                        faceToFaceDate: e.target.value,
                                                                    })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "assessmentLocation", children: "Assessment Location" }), _jsx(Input, { id: "assessmentLocation", value: allocationData.assessmentLocation, onChange: (e) => setAllocationData((prev) => ({
                                                                        ...prev,
                                                                        assessmentLocation: e.target.value,
                                                                    })), placeholder: "Enter assessment location" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "assessingClinician", children: "Assessing Clinician" }), _jsx(Input, { id: "assessingClinician", value: allocationData.assessingClinician, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                assessingClinician: e.target.value,
                                                            })), placeholder: "Enter clinician name and credentials" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "assessmentFindings", children: "Assessment Findings (Minimum 50 characters)" }), _jsx(Textarea, { id: "assessmentFindings", value: allocationData.assessmentFindings, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                assessmentFindings: e.target.value,
                                                            })), placeholder: "Document detailed assessment findings, patient condition, and homecare needs...", rows: 4 }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [allocationData.assessmentFindings.length, "/50 characters minimum"] })] })] }))] })] }) }), _jsx(TabsContent, { value: "documents", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "w-5 h-5 mr-2" }), "Required Documentation"] }), _jsx(CardDescription, { children: "Complete all required documents for homecare allocation" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "periodicAssessmentForm", checked: allocationData.periodicAssessmentForm, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                periodicAssessmentForm: e.target.checked,
                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "periodicAssessmentForm", children: "Periodic Assessment Form (Updated)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "updatedMedicalReport", checked: allocationData.updatedMedicalReport, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                updatedMedicalReport: e.target.checked,
                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "updatedMedicalReport", children: "Updated Medical Report" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "treatmentPlan", checked: allocationData.treatmentPlan, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                treatmentPlan: e.target.checked,
                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "treatmentPlan", children: "Treatment Plan Documentation" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "patientConsent", checked: allocationData.patientConsent, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                patientConsent: e.target.checked,
                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "patientConsent", children: "Patient Consent Form" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "insuranceVerification", checked: allocationData.insuranceVerification, onChange: (e) => setAllocationData((prev) => ({
                                                                ...prev,
                                                                insuranceVerification: e.target.checked,
                                                            })), className: "rounded" }), _jsx(Label, { htmlFor: "insuranceVerification", children: "Insurance Verification" })] })] }), _jsx("div", { className: "mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium text-gray-900", children: "Documentation Completion:" }), _jsxs(Badge, { variant: "outline", children: [[
                                                                allocationData.periodicAssessmentForm,
                                                                allocationData.updatedMedicalReport,
                                                                allocationData.treatmentPlan,
                                                                allocationData.patientConsent,
                                                                allocationData.insuranceVerification,
                                                            ].filter(Boolean).length, " ", "/ 5"] })] }) })] })] }) }), _jsx(TabsContent, { value: "submission", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Upload, { className: "w-5 h-5 mr-2" }), "OpenJet Submission"] }), _jsx(CardDescription, { children: "Submit homecare allocation request via OpenJet automation" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsxs("h4", { className: "font-medium text-blue-800 mb-2", children: ["Compliance Score: ", allocationData.complianceScore, "%"] }), _jsx("div", { className: "w-full bg-blue-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${allocationData.complianceScore}%` } }) }), _jsx("p", { className: "text-sm text-blue-700 mt-2", children: allocationData.complianceScore >= 90
                                                        ? "Ready for submission"
                                                        : "Complete missing requirements to improve score" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "openJetRequestId", children: "OpenJet Request ID" }), _jsx(Input, { id: "openJetRequestId", value: allocationData.openJetRequestId, onChange: (e) => setAllocationData((prev) => ({
                                                        ...prev,
                                                        openJetRequestId: e.target.value,
                                                    })), placeholder: "Auto-generated on submission", disabled: allocationData.submissionStatus !== "draft" })] }), _jsxs("div", { className: "p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-800 mb-2", children: "Submission Status" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Status:" }), _jsx(Badge, { className: allocationData.submissionStatus === "submitted"
                                                                        ? "text-green-600 bg-green-100"
                                                                        : "text-yellow-600 bg-yellow-100", children: allocationData.submissionStatus
                                                                        .toUpperCase()
                                                                        .replace("_", " ") })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Submission Time:" }), _jsx("span", { className: "text-sm text-gray-600", children: new Date(allocationData.submissionTime).toLocaleString() })] }), allocationData.allocationProvider && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Allocated Provider:" }), _jsx("span", { className: "text-sm text-gray-600", children: allocationData.allocationProvider })] }))] })] }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                        const errors = validateAllocation();
                                                        setAllocationData((prev) => ({
                                                            ...prev,
                                                            validationErrors: errors,
                                                        }));
                                                        if (errors.length === 0) {
                                                            toast({
                                                                title: "Validation Successful",
                                                                description: "All requirements met. Ready for submission.",
                                                            });
                                                        }
                                                    }, children: "Validate Request" }), _jsx(Button, { onClick: handleSubmitAllocation, disabled: isSubmitting || allocationData.complianceScore < 90, className: "flex items-center", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Activity, { className: "w-4 h-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Submit to OpenJet"] })) })] })] })] }) })] })] }));
}
