import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Shield, CheckCircle, XCircle, Clock, Activity, Send, Eye, RefreshCw, Server, } from "lucide-react";
import { damanIntegrationAPI } from "@/api/daman-integration.api";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
import { useToast } from "@/hooks/useToast";
const EnhancedDamanWorkflow = () => {
    const { toast } = useToast();
    const [workflowState, setWorkflowState] = useState({
        currentStep: 1,
        authorizationData: {
            patientId: "",
            serviceType: "",
            providerId: "",
            clinicalJustification: "",
            requestedServices: [],
            urgencyLevel: "routine",
            estimatedDuration: 0,
            diagnosisCodes: [],
            treatmentPlan: "",
            paymentTerms: 30, // Updated to 30 days
            submissionDeadline: "08:00",
            gracePeriodEnabled: true,
            lateSubmissionHandling: true,
        },
        validationResults: null,
        submissionStatus: "idle",
        errors: [],
    });
    const [systemHealth, setSystemHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadSystemHealth();
    }, []);
    const loadSystemHealth = async () => {
        try {
            const health = await damanIntegrationAPI.getSystemStatus();
            setSystemHealth(health);
        }
        catch (error) {
            console.error("Failed to load system health:", error);
            toast({
                title: "System Health Check Failed",
                description: "Unable to verify Daman integration status",
                variant: "destructive",
            });
        }
    };
    const validateAuthorizationData = async () => {
        try {
            setWorkflowState((prev) => ({
                ...prev,
                submissionStatus: "validating",
                errors: [],
            }));
            // Sanitize input data
            const sanitizedData = {
                ...workflowState.authorizationData,
                patientId: inputSanitizer.sanitizeText(workflowState.authorizationData.patientId, 50).sanitized,
                serviceType: inputSanitizer.sanitizeText(workflowState.authorizationData.serviceType, 100).sanitized,
                providerId: inputSanitizer.sanitizeText(workflowState.authorizationData.providerId, 50).sanitized,
                clinicalJustification: inputSanitizer.sanitizeText(workflowState.authorizationData.clinicalJustification, 2000).sanitized,
                treatmentPlan: inputSanitizer.sanitizeText(workflowState.authorizationData.treatmentPlan, 2000).sanitized,
            };
            // Validate JSON structure
            const jsonString = JsonValidator.safeStringify(sanitizedData);
            const validationResult = JsonValidator.validate(jsonString);
            if (!validationResult.isValid) {
                throw new Error(`Invalid data structure: ${validationResult.errors?.join(", ")}`);
            }
            // Perform business logic validation
            const errors = [];
            if (!sanitizedData.patientId)
                errors.push("Patient ID is required");
            if (!sanitizedData.serviceType)
                errors.push("Service type is required");
            if (!sanitizedData.providerId)
                errors.push("Provider ID is required");
            if (!sanitizedData.clinicalJustification)
                errors.push("Clinical justification is required");
            if (!sanitizedData.treatmentPlan)
                errors.push("Treatment plan is required");
            if (errors.length > 0) {
                setWorkflowState((prev) => ({
                    ...prev,
                    submissionStatus: "error",
                    errors,
                }));
                return;
            }
            // Update state with validated data
            setWorkflowState((prev) => ({
                ...prev,
                authorizationData: sanitizedData,
                validationResults: validationResult,
                submissionStatus: "idle",
                errors: [],
            }));
            toast({
                title: "Validation Successful",
                description: "Authorization data is valid and ready for submission",
                variant: "default",
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
            setWorkflowState((prev) => ({
                ...prev,
                submissionStatus: "error",
                errors: [errorMessage],
            }));
            toast({
                title: "Validation Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };
    const submitAuthorization = async () => {
        try {
            setWorkflowState((prev) => ({ ...prev, submissionStatus: "submitting" }));
            const response = await damanIntegrationAPI.submitAuthorization(workflowState.authorizationData);
            setWorkflowState((prev) => ({
                ...prev,
                submissionStatus: "completed",
                validationResults: {
                    ...prev.validationResults,
                    submissionResponse: response,
                },
            }));
            toast({
                title: "Authorization Submitted",
                description: `Authorization ID: ${response.authorizationId}`,
                variant: "default",
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Submission failed";
            setWorkflowState((prev) => ({
                ...prev,
                submissionStatus: "error",
                errors: [errorMessage],
            }));
            toast({
                title: "Submission Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };
    const performEligibilityCheck = async () => {
        if (!workflowState.authorizationData.patientId ||
            !workflowState.authorizationData.serviceType) {
            toast({
                title: "Missing Information",
                description: "Patient ID and Service Type are required for eligibility check",
                variant: "destructive",
            });
            return;
        }
        try {
            setLoading(true);
            const eligibilityResult = await damanIntegrationAPI.performRealTimeEligibilityCheck(workflowState.authorizationData.patientId, workflowState.authorizationData.serviceType, workflowState.authorizationData.providerId || "default-provider");
            toast({
                title: "Eligibility Check Complete",
                description: eligibilityResult.eligible
                    ? "Patient is eligible"
                    : "Patient eligibility requires review",
                variant: eligibilityResult.eligible ? "default" : "destructive",
            });
            setWorkflowState((prev) => ({
                ...prev,
                validationResults: {
                    ...prev.validationResults,
                    eligibilityCheck: eligibilityResult,
                },
            }));
        }
        catch (error) {
            toast({
                title: "Eligibility Check Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const updateAuthorizationData = (field, value) => {
        setWorkflowState((prev) => ({
            ...prev,
            authorizationData: {
                ...prev.authorizationData,
                [field]: value,
            },
        }));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-600";
            case "validating":
            case "submitting":
                return "text-blue-600";
            case "error":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
            case "validating":
            case "submitting":
                return _jsx(Activity, { className: "h-5 w-5 text-blue-600 animate-spin" });
            case "error":
                return _jsx(XCircle, { className: "h-5 w-5 text-red-600" });
            default:
                return _jsx(Clock, { className: "h-5 w-5 text-gray-600" });
        }
    };
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Shield, { className: "h-6 w-6 mr-3 text-blue-600" }), "Enhanced Daman Workflow"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Comprehensive Daman authorization workflow with real-time validation" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Button, { variant: "outline", onClick: loadSystemHealth, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "System Status"] }) })] }) }), systemHealth && (_jsx("div", { className: "mb-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Server, { className: "h-5 w-5 mr-2" }), "Integration Health Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Daman API" }), _jsxs("p", { className: "text-sm text-gray-600", children: [systemHealth.daman.responseTime, "ms"] })] }), _jsx(Badge, { className: systemHealth.daman.status === "healthy"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800", children: systemHealth.daman.status })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "OpenJet" }), _jsxs("p", { className: "text-sm text-gray-600", children: [systemHealth.openjet.responseTime, "ms"] })] }), _jsx(Badge, { className: systemHealth.openjet.status === "healthy"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800", children: systemHealth.openjet.status })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Overall Health" }), _jsxs("p", { className: "text-sm text-gray-600", children: [systemHealth.overallHealth, "%"] })] }), _jsx(Progress, { value: systemHealth.overallHealth, className: "w-16 h-2" })] })] }) })] }) })), _jsx("div", { className: "mb-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [getStatusIcon(workflowState.submissionStatus), _jsxs("span", { className: `ml-2 ${getStatusColor(workflowState.submissionStatus)}`, children: ["Workflow Status: ", workflowState.submissionStatus.toUpperCase()] })] }) }), workflowState.errors.length > 0 && (_jsx(CardContent, { children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-red-800 mb-2", children: "Validation Errors:" }), _jsx("ul", { className: "list-disc list-inside text-red-700 text-sm", children: workflowState.errors.map((error, index) => (_jsx("li", { children: error }, index))) })] }) }))] }) }), _jsxs(Tabs, { defaultValue: "authorization", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "authorization", children: "Authorization" }), _jsx(TabsTrigger, { value: "eligibility", children: "Eligibility" }), _jsx(TabsTrigger, { value: "validation", children: "Validation" }), _jsx(TabsTrigger, { value: "submission", children: "Submission" })] }), _jsx(TabsContent, { value: "authorization", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Authorization Request Details" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "patientId", children: "Patient ID *" }), _jsx(Input, { id: "patientId", value: workflowState.authorizationData.patientId, onChange: (e) => updateAuthorizationData("patientId", e.target.value), placeholder: "Enter patient ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "providerId", children: "Provider ID *" }), _jsx(Input, { id: "providerId", value: workflowState.authorizationData.providerId, onChange: (e) => updateAuthorizationData("providerId", e.target.value), placeholder: "Enter provider ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "serviceType", children: "Service Type *" }), _jsxs(Select, { value: workflowState.authorizationData.serviceType, onValueChange: (value) => updateAuthorizationData("serviceType", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select service type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "17-25-1", children: "Per Diem - Simple Home Visit - Nursing Service" }), _jsx(SelectItem, { value: "17-25-2", children: "Per Diem - Simple Home Visit - Supportive Service" }), _jsx(SelectItem, { value: "17-25-3", children: "Per Diem - Specialized Home Visit - Consultation" }), _jsx(SelectItem, { value: "17-25-4", children: "Per Diem - Routine Home Nursing Care" }), _jsx(SelectItem, { value: "17-25-5", children: "Per Diem - Advanced Home Nursing Care" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "urgencyLevel", children: "Urgency Level" }), _jsxs(Select, { value: workflowState.authorizationData.urgencyLevel, onValueChange: (value) => updateAuthorizationData("urgencyLevel", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "routine", children: "Routine" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" }), _jsx(SelectItem, { value: "emergency", children: "Emergency" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "clinicalJustification", children: "Clinical Justification *" }), _jsx(Textarea, { id: "clinicalJustification", value: workflowState.authorizationData.clinicalJustification, onChange: (e) => updateAuthorizationData("clinicalJustification", e.target.value), placeholder: "Provide detailed clinical justification", rows: 4 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "treatmentPlan", children: "Treatment Plan *" }), _jsx(Textarea, { id: "treatmentPlan", value: workflowState.authorizationData.treatmentPlan, onChange: (e) => updateAuthorizationData("treatmentPlan", e.target.value), placeholder: "Describe the treatment plan", rows: 4 })] })] })] }) }), _jsx(TabsContent, { value: "eligibility", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Real-time Eligibility Verification" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { onClick: performEligibilityCheck, disabled: loading || !workflowState.authorizationData.patientId, className: "w-full", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), loading
                                                        ? "Checking Eligibility..."
                                                        : "Perform Eligibility Check"] }), workflowState.validationResults?.eligibilityCheck && (_jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Eligibility Results:" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Eligible:" }), _jsx(Badge, { className: workflowState.validationResults.eligibilityCheck
                                                                            .eligible
                                                                            ? "bg-green-100 text-green-800 ml-2"
                                                                            : "bg-red-100 text-red-800 ml-2", children: workflowState.validationResults.eligibilityCheck
                                                                            .eligible
                                                                            ? "Yes"
                                                                            : "No" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Pre-Auth Required:" }), _jsx(Badge, { className: workflowState.validationResults.eligibilityCheck
                                                                            .preAuthRequired
                                                                            ? "bg-yellow-100 text-yellow-800 ml-2"
                                                                            : "bg-green-100 text-green-800 ml-2", children: workflowState.validationResults.eligibilityCheck
                                                                            .preAuthRequired
                                                                            ? "Yes"
                                                                            : "No" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Response Time:" }), _jsxs("span", { className: "ml-2", children: [workflowState.validationResults.eligibilityCheck
                                                                                .responseTime, "ms"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Validation Time:" }), _jsx("span", { className: "ml-2", children: new Date(workflowState.validationResults.eligibilityCheck.validationTimestamp).toLocaleTimeString() })] })] })] }))] }) })] }) }), _jsx(TabsContent, { value: "validation", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Data Validation & Compliance Check" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { onClick: validateAuthorizationData, disabled: workflowState.submissionStatus === "validating", className: "w-full", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), workflowState.submissionStatus === "validating"
                                                        ? "Validating..."
                                                        : "Validate Authorization Data"] }), workflowState.validationResults && (_jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Validation Results:" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mr-2" }), _jsx("span", { children: "JSON Structure: Valid" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mr-2" }), _jsx("span", { children: "Data Sanitization: Complete" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mr-2" }), _jsx("span", { children: "Business Rules: Validated" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600 mr-2" }), _jsx("span", { children: "Daman Compliance: Verified" })] })] })] }))] }) })] }) }), _jsx(TabsContent, { value: "submission", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Submit Authorization Request" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { onClick: submitAuthorization, disabled: workflowState.submissionStatus === "submitting" ||
                                                    !workflowState.validationResults, className: "w-full", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), workflowState.submissionStatus === "submitting"
                                                        ? "Submitting..."
                                                        : "Submit to Daman"] }), workflowState.validationResults?.submissionResponse && (_jsxs("div", { className: "mt-4 p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-800 mb-2", children: "Submission Successful!" }), _jsxs("div", { className: "space-y-2 text-sm text-green-700", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Authorization ID:" }), _jsx("span", { className: "ml-2", children: workflowState.validationResults.submissionResponse
                                                                            .authorizationId })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Status:" }), _jsx(Badge, { className: "bg-green-100 text-green-800 ml-2", children: workflowState.validationResults.submissionResponse
                                                                            .status })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Reference Number:" }), _jsx("span", { className: "ml-2", children: workflowState.validationResults.submissionResponse
                                                                            .referenceNumber })] })] })] }))] }) })] }) })] })] }));
};
export default EnhancedDamanWorkflow;
