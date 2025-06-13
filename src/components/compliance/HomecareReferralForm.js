import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, FileText, User, Calendar, Stethoscope, Home, Shield, Activity, Heart, Brain, Users, Pill, ClipboardList, Plus, } from "lucide-react";
import { ApiService } from "@/services/api.service";
import { toast } from "@/components/ui/use-toast";
export default function HomecareReferralForm({ patientId = "", onSubmit, onCancel, }) {
    const [referralData, setReferralData] = useState({
        patient_id: patientId,
        referring_facility_license: "",
        face_to_face_encounter_date: "",
        face_to_face_clinical_reason: "",
        homebound_justification: "",
        domains_of_care: {
            medical_history: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            physical_examination: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            functional_assessment: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            cognitive_assessment: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            psychosocial_assessment: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            environmental_assessment: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            medication_review: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            care_coordination: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
            discharge_planning: {
                completed: false,
                findings: "",
                assessed_by: "",
                assessment_date: "",
            },
        },
        required_services: [],
        discharge_planning: {
            estimated_duration: "",
            discharge_criteria: "",
            follow_up_plan: "",
            family_education: "",
        },
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic-info");
    const [serviceCodes, setServiceCodes] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    useEffect(() => {
        loadServiceCodes();
    }, []);
    const loadServiceCodes = async () => {
        try {
            const response = await ApiService.get("/api/homecare/service-codes-2024");
            setServiceCodes(response);
        }
        catch (error) {
            console.error("Error loading service codes:", error);
        }
    };
    const validateForm = () => {
        const errors = [];
        // Basic validation
        if (!referralData.patient_id)
            errors.push("Patient ID is required");
        if (!referralData.referring_facility_license)
            errors.push("Referring facility license is required");
        if (!referralData.face_to_face_encounter_date)
            errors.push("Face-to-face encounter date is required");
        if (!referralData.face_to_face_clinical_reason)
            errors.push("Face-to-face clinical reason is required");
        if (!referralData.homebound_justification)
            errors.push("Homebound justification is required");
        // Validate face-to-face encounter date (must be within last 30 days)
        if (referralData.face_to_face_encounter_date) {
            const encounterDate = new Date(referralData.face_to_face_encounter_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (encounterDate < thirtyDaysAgo) {
                errors.push("Face-to-face encounter must be within the last 30 days");
            }
        }
        // Validate 9 domains of care
        const domainNames = Object.keys(referralData.domains_of_care);
        const incompleteDomains = domainNames.filter((domain) => !referralData.domains_of_care[domain].completed);
        if (incompleteDomains.length > 0) {
            errors.push(`All 9 domains of care must be completed. Missing: ${incompleteDomains.join(", ")}`);
        }
        // Validate required services
        if (referralData.required_services.length === 0) {
            errors.push("At least one required service must be specified");
        }
        // Validate discharge planning
        if (!referralData.discharge_planning.estimated_duration)
            errors.push("Estimated duration is required");
        if (!referralData.discharge_planning.discharge_criteria)
            errors.push("Discharge criteria is required");
        setValidationErrors(errors);
        return errors.length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix all validation errors before submitting",
                variant: "destructive",
            });
            return;
        }
        try {
            setLoading(true);
            const response = await ApiService.post("/api/homecare/referrals", referralData);
            toast({
                title: "Referral submitted",
                description: `Referral ID: ${response.referral_id}`,
            });
            if (onSubmit) {
                onSubmit(response);
            }
        }
        catch (error) {
            console.error("Error submitting referral:", error);
            toast({
                title: "Error submitting referral",
                description: error instanceof Error ? error.message : "Failed to submit referral",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const updateDomainOfCare = (domain, field, value) => {
        setReferralData({
            ...referralData,
            domains_of_care: {
                ...referralData.domains_of_care,
                [domain]: {
                    ...referralData.domains_of_care[domain],
                    [field]: value,
                },
            },
        });
    };
    const addRequiredService = () => {
        setReferralData({
            ...referralData,
            required_services: [
                ...referralData.required_services,
                {
                    service_code: "",
                    service_name: "",
                    frequency: "",
                    duration: "",
                    justification: "",
                },
            ],
        });
    };
    const updateRequiredService = (index, field, value) => {
        const updatedServices = [...referralData.required_services];
        updatedServices[index] = {
            ...updatedServices[index],
            [field]: value,
        };
        setReferralData({
            ...referralData,
            required_services: updatedServices,
        });
    };
    const removeRequiredService = (index) => {
        const updatedServices = referralData.required_services.filter((_, i) => i !== index);
        setReferralData({
            ...referralData,
            required_services: updatedServices,
        });
    };
    const getCompletionPercentage = () => {
        const totalDomains = Object.keys(referralData.domains_of_care).length;
        const completedDomains = Object.values(referralData.domains_of_care).filter((domain) => domain.completed).length;
        return Math.round((completedDomains / totalDomains) * 100);
    };
    const getDomainIcon = (domainKey) => {
        const icons = {
            medical_history: _jsx(FileText, { className: "w-4 h-4" }),
            physical_examination: _jsx(Stethoscope, { className: "w-4 h-4" }),
            functional_assessment: _jsx(Activity, { className: "w-4 h-4" }),
            cognitive_assessment: _jsx(Brain, { className: "w-4 h-4" }),
            psychosocial_assessment: _jsx(Heart, { className: "w-4 h-4" }),
            environmental_assessment: _jsx(Home, { className: "w-4 h-4" }),
            medication_review: _jsx(Pill, { className: "w-4 h-4" }),
            care_coordination: _jsx(Users, { className: "w-4 h-4" }),
            discharge_planning: _jsx(ClipboardList, { className: "w-4 h-4" }),
        };
        return icons[domainKey] || _jsx(FileText, { className: "w-4 h-4" });
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Home Healthcare Referral Form" }), _jsx("p", { className: "text-gray-600 mt-1", children: "DOH-compliant homecare referral with 9-domain assessment" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => setShowPreview(true), children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Preview"] }), onCancel && (_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" })), _jsx(Button, { onClick: handleSubmit, disabled: loading, children: loading ? "Submitting..." : "Submit Referral" })] })] }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "9-Domain Assessment Progress" }), _jsxs("span", { className: "text-sm text-gray-600", children: [getCompletionPercentage(), "% Complete"] })] }), _jsx(Progress, { value: getCompletionPercentage(), className: "h-2" })] }) }), validationErrors.length > 0 && (_jsxs(Alert, { className: "border-red-200 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Validation Errors" }), _jsx(AlertDescription, { children: _jsx("ul", { className: "list-disc list-inside mt-2 space-y-1", children: validationErrors.map((error, index) => (_jsx("li", { className: "text-sm", children: error }, index))) }) })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "basic-info", children: "Basic Info" }), _jsx(TabsTrigger, { value: "encounter", children: "F2F Encounter" }), _jsx(TabsTrigger, { value: "domains", children: "9 Domains" }), _jsx(TabsTrigger, { value: "services", children: "Services" }), _jsx(TabsTrigger, { value: "discharge", children: "Discharge Plan" })] }), _jsx(TabsContent, { value: "basic-info", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(User, { className: "w-5 h-5 mr-2" }), "Basic Information"] }), _jsx(CardDescription, { children: "Patient and facility information" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patient-id", children: "Patient ID" }), _jsx(Input, { id: "patient-id", value: referralData.patient_id, onChange: (e) => setReferralData({
                                                                    ...referralData,
                                                                    patient_id: e.target.value,
                                                                }), placeholder: "Enter patient ID" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "facility-license", children: "Referring Facility License" }), _jsx(Input, { id: "facility-license", value: referralData.referring_facility_license, onChange: (e) => setReferralData({
                                                                    ...referralData,
                                                                    referring_facility_license: e.target.value,
                                                                }), placeholder: "DOH facility license number" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "homebound-justification", children: "Homebound Justification" }), _jsx(Textarea, { id: "homebound-justification", value: referralData.homebound_justification, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            homebound_justification: e.target.value,
                                                        }), placeholder: "Explain why the patient is homebound and unable to leave home without considerable effort", rows: 3 })] })] })] }) }), _jsx(TabsContent, { value: "encounter", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "Face-to-Face Encounter"] }), _jsx(CardDescription, { children: "Required face-to-face encounter documentation" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(Shield, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "DOH Requirement" }), _jsx(AlertDescription, { children: "Face-to-face encounter must have occurred within the last 30 days and be documented by a qualified healthcare provider." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "encounter-date", children: "Encounter Date" }), _jsx(Input, { id: "encounter-date", type: "date", value: referralData.face_to_face_encounter_date, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            face_to_face_encounter_date: e.target.value,
                                                        }), max: new Date().toISOString().split("T")[0] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "clinical-reason", children: "Clinical Reason" }), _jsx(Textarea, { id: "clinical-reason", value: referralData.face_to_face_clinical_reason, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            face_to_face_clinical_reason: e.target.value,
                                                        }), placeholder: "Describe the clinical reason for the face-to-face encounter and how it relates to the need for homecare services", rows: 4 })] })] })] }) }), _jsx(TabsContent, { value: "domains", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(ClipboardList, { className: "w-5 h-5 mr-2" }), "9 Domains of Care Assessment"] }), _jsx(CardDescription, { children: "Complete all 9 domains as required by DOH standards" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(referralData.domains_of_care).map(([domainKey, domainData]) => (_jsxs(Card, { className: `border-2 ${domainData.completed
                                                    ? "border-green-200 bg-green-50"
                                                    : "border-gray-200"}`, children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-sm flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [getDomainIcon(domainKey), _jsx("span", { className: "ml-2 capitalize", children: domainKey.replace("_", " ") })] }), domainData.completed && (_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }))] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `${domainKey}-completed`, checked: domainData.completed, onCheckedChange: (checked) => updateDomainOfCare(domainKey, "completed", checked) }), _jsx(Label, { htmlFor: `${domainKey}-completed`, className: "text-sm", children: "Assessment completed" })] }), domainData.completed && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs", children: "Findings" }), _jsx(Textarea, { value: domainData.findings, onChange: (e) => updateDomainOfCare(domainKey, "findings", e.target.value), placeholder: "Assessment findings", rows: 2, className: "text-sm" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Assessed by" }), _jsx(Input, { value: domainData.assessed_by, onChange: (e) => updateDomainOfCare(domainKey, "assessed_by", e.target.value), placeholder: "Assessor name", className: "text-sm" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Date" }), _jsx(Input, { type: "date", value: domainData.assessment_date, onChange: (e) => updateDomainOfCare(domainKey, "assessment_date", e.target.value), className: "text-sm" })] })] })] }))] })] }, domainKey))) }) })] }) }), _jsx(TabsContent, { value: "services", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Stethoscope, { className: "w-5 h-5 mr-2" }), "Required Services"] }), _jsx(Button, { onClick: addRequiredService, size: "sm", children: "Add Service" })] }), _jsx(CardDescription, { children: "Specify the homecare services required for this patient" })] }), _jsxs(CardContent, { className: "space-y-4", children: [referralData.required_services.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Stethoscope, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "No services added yet" }), _jsx("p", { className: "text-sm", children: "Click \"Add Service\" to get started" })] })) : (referralData.required_services.map((service, index) => (_jsx(Card, { className: "border border-gray-200", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "serviceName", children: "Service Name" }), _jsx(Input, { id: "serviceName", value: service.service_name, onChange: (e) => updateRequiredService(index, "service_name", e.target.value), placeholder: "Enter service name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "serviceCode", children: "Service Code" }), _jsx(Input, { id: "serviceCode", value: service.service_code, onChange: (e) => updateRequiredService(index, "service_code", e.target.value), placeholder: "Enter service code" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "frequency", children: "Frequency" }), _jsx(Input, { id: "frequency", value: service.frequency, onChange: (e) => updateRequiredService(index, "frequency", e.target.value), placeholder: "e.g., Daily, Weekly" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "duration", children: "Duration" }), _jsx(Input, { id: "duration", value: service.duration, onChange: (e) => updateRequiredService(index, "duration", e.target.value), placeholder: "e.g., 30 minutes" })] })] }), _jsxs("div", { className: "space-y-2 mt-4", children: [_jsx(Label, { htmlFor: "justification", children: "Justification" }), _jsx(Textarea, { id: "justification", value: service.justification, onChange: (e) => updateRequiredService(index, "justification", e.target.value), placeholder: "Provide clinical justification for this service", rows: 3 })] }), _jsx("div", { className: "flex justify-end mt-4", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeRequiredService(index), children: "Remove Service" }) })] }) }, index)))), _jsx("div", { className: "flex justify-end mt-4", children: _jsxs(Button, { onClick: addRequiredService, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Service"] }) })] })] }) }), _jsx(TabsContent, { value: "discharge", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(ClipboardList, { className: "w-5 h-5 mr-2" }), "Discharge Planning"] }), _jsx(CardDescription, { children: "Plan for patient discharge and follow-up care" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "estimatedDuration", children: "Estimated Duration" }), _jsx(Input, { id: "estimatedDuration", value: referralData.discharge_planning.estimated_duration, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            discharge_planning: {
                                                                ...referralData.discharge_planning,
                                                                estimated_duration: e.target.value,
                                                            },
                                                        }), placeholder: "e.g., 6-8 weeks" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "dischargeCriteria", children: "Discharge Criteria" }), _jsx(Textarea, { id: "dischargeCriteria", value: referralData.discharge_planning.discharge_criteria, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            discharge_planning: {
                                                                ...referralData.discharge_planning,
                                                                discharge_criteria: e.target.value,
                                                            },
                                                        }), placeholder: "Define criteria for successful discharge", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "followUpPlan", children: "Follow-up Plan" }), _jsx(Textarea, { id: "followUpPlan", value: referralData.discharge_planning.follow_up_plan, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            discharge_planning: {
                                                                ...referralData.discharge_planning,
                                                                follow_up_plan: e.target.value,
                                                            },
                                                        }), placeholder: "Describe follow-up care plan", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "familyEducation", children: "Family Education" }), _jsx(Textarea, { id: "familyEducation", value: referralData.discharge_planning.family_education, onChange: (e) => setReferralData({
                                                            ...referralData,
                                                            discharge_planning: {
                                                                ...referralData.discharge_planning,
                                                                family_education: e.target.value,
                                                            },
                                                        }), placeholder: "Describe family education and training provided", rows: 3 })] })] })] }) })] }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { onClick: handleSubmit, disabled: loading, children: loading ? "Submitting..." : "Submit Referral" })] })] }) }));
}
