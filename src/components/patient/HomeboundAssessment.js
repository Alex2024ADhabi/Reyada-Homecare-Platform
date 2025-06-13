import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, CheckCircle, AlertCircle, FileText, Calendar, Save, RefreshCw, } from "lucide-react";
const HomeboundAssessment = ({ patientId, patientName, onBack, }) => {
    const [assessmentData, setAssessmentData] = useState({
        status: "pending_assessment",
        assessmentDate: new Date().toISOString().split("T")[0],
        assessedBy: "",
        clinicalJustification: "",
        nextReassessmentDate: "",
        criteria: {
            confinedToHome: false,
            considerableEffortToLeave: false,
            medicallyJustified: false,
            physicianOrders: false,
        },
        supportingDocumentation: [],
        riskFactors: [],
        functionalLimitations: [],
        medicalConditions: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // DOH Homebound Criteria
    const dohCriteria = [
        {
            key: "confinedToHome",
            title: "Confined to Home",
            description: "Patient is confined to the home or institution due to medical condition",
            required: true,
        },
        {
            key: "considerableEffortToLeave",
            title: "Considerable Effort to Leave",
            description: "Leaving home requires considerable and taxing effort",
            required: true,
        },
        {
            key: "medicallyJustified",
            title: "Medically Justified",
            description: "Homebound status is medically justified and documented",
            required: true,
        },
        {
            key: "physicianOrders",
            title: "Physician Orders",
            description: "Physician has ordered homecare services",
            required: true,
        },
    ];
    const calculateComplianceScore = () => {
        const criteriaCount = Object.values(assessmentData.criteria).filter(Boolean).length;
        return Math.round((criteriaCount / 4) * 100);
    };
    const determineStatus = () => {
        const allCriteriaMet = Object.values(assessmentData.criteria).every(Boolean);
        return allCriteriaMet ? "qualified" : "not_qualified";
    };
    const handleCriteriaChange = (key, value) => {
        setAssessmentData((prev) => ({
            ...prev,
            criteria: {
                ...prev.criteria,
                [key]: value,
            },
            status: determineStatus(),
        }));
    };
    const handleSubmitAssessment = async () => {
        setIsSubmitting(true);
        try {
            // In a real implementation, this would save to the database
            const finalStatus = determineStatus();
            setAssessmentData((prev) => ({ ...prev, status: finalStatus }));
            // Calculate next reassessment date (typically 60 days)
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 60);
            setAssessmentData((prev) => ({
                ...prev,
                nextReassessmentDate: nextDate.toISOString().split("T")[0],
            }));
            alert(`Homebound assessment completed. Status: ${finalStatus}`);
        }
        catch (error) {
            console.error("Error submitting assessment:", error);
            alert("Error submitting assessment. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getStatusColor = (status) => {
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
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-sm w-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: onBack, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Homebound Status Assessment" }), _jsxs("p", { className: "text-muted-foreground", children: [patientName, " - ID: ", patientId] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(Badge, { variant: "outline", className: getStatusColor(assessmentData.status), children: assessmentData.status.replace("_", " ").charAt(0).toUpperCase() +
                                assessmentData.status.replace("_", " ").slice(1) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "DOH Homebound Criteria Assessment"] }), _jsx(CardDescription, { children: "Complete assessment based on DOH homecare eligibility requirements" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: dohCriteria.map((criterion) => (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: criterion.key, checked: assessmentData.criteria[criterion.key], onCheckedChange: (checked) => handleCriteriaChange(criterion.key, checked === true) }), _jsxs(Label, { htmlFor: criterion.key, className: "font-medium", children: [criterion.title, criterion.required && (_jsx("span", { className: "text-red-500 ml-1", children: "*" }))] })] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1 ml-6", children: criterion.description })] }), assessmentData.criteria[criterion.key] ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 mt-1" })) : (_jsx(AlertCircle, { className: "h-5 w-5 text-amber-500 mt-1" }))] }), _jsx(Separator, {})] }, criterion.key))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Clinical Justification" }), _jsx(CardDescription, { children: "Provide detailed clinical justification for homebound status determination" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "clinical-justification", children: "Clinical Justification" }), _jsx(Textarea, { id: "clinical-justification", placeholder: "Provide detailed clinical justification for homebound status...", value: assessmentData.clinicalJustification, onChange: (e) => setAssessmentData((prev) => ({
                                                                ...prev,
                                                                clinicalJustification: e.target.value,
                                                            })), rows: 4 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "medical-conditions", children: "Primary Medical Conditions" }), _jsx(Textarea, { id: "medical-conditions", placeholder: "List primary medical conditions affecting mobility...", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "functional-limitations", children: "Functional Limitations" }), _jsx(Textarea, { id: "functional-limitations", placeholder: "Describe functional limitations and mobility restrictions...", rows: 3 })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "risk-factors", children: "Risk Factors" }), _jsx(Textarea, { id: "risk-factors", placeholder: "Identify risk factors that support homebound status...", rows: 2 })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Supporting Documentation" }), _jsx(CardDescription, { children: "Required documentation to support homebound status determination" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "physician-orders" }), _jsx(Label, { htmlFor: "physician-orders", children: "Physician Orders Available" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "medical-records" }), _jsx(Label, { htmlFor: "medical-records", children: "Recent Medical Records" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "assessment-forms" }), _jsx(Label, { htmlFor: "assessment-forms", children: "Assessment Forms Completed" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "insurance-auth" }), _jsx(Label, { htmlFor: "insurance-auth", children: "Insurance Authorization" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "discharge-summary" }), _jsx(Label, { htmlFor: "discharge-summary", children: "Hospital Discharge Summary" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "specialist-notes" }), _jsx(Label, { htmlFor: "specialist-notes", children: "Specialist Consultation Notes" })] })] })] }) }) })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "DOH Compliance Score" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Criteria Met" }), _jsxs("span", { className: "text-sm font-medium", children: [calculateComplianceScore(), "%"] })] }), _jsx(Progress, { value: calculateComplianceScore(), className: "h-2" }), _jsx("div", { className: "space-y-2", children: dohCriteria.map((criterion) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: criterion.title }), assessmentData.criteria[criterion.key] ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }, criterion.key))) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Assessment Details" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessment-date", children: "Assessment Date" }), _jsx(Input, { id: "assessment-date", type: "date", value: assessmentData.assessmentDate, onChange: (e) => setAssessmentData((prev) => ({
                                                                    ...prev,
                                                                    assessmentDate: e.target.value,
                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessed-by", children: "Assessed By" }), _jsxs(Select, { value: assessmentData.assessedBy, onValueChange: (value) => setAssessmentData((prev) => ({
                                                                    ...prev,
                                                                    assessedBy: value,
                                                                })), children: [_jsx(SelectTrigger, { id: "assessed-by", children: _jsx(SelectValue, { placeholder: "Select assessor" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "nurse-supervisor", children: "Nurse Supervisor" }), _jsx(SelectItem, { value: "case-manager", children: "Case Manager" }), _jsx(SelectItem, { value: "clinical-coordinator", children: "Clinical Coordinator" }), _jsx(SelectItem, { value: "physician", children: "Physician" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "next-reassessment", children: "Next Reassessment Date" }), _jsx(Input, { id: "next-reassessment", type: "date", value: assessmentData.nextReassessmentDate, onChange: (e) => setAssessmentData((prev) => ({
                                                                    ...prev,
                                                                    nextReassessmentDate: e.target.value,
                                                                })) })] })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { className: "w-full", onClick: handleSubmitAssessment, disabled: isSubmitting, children: [isSubmitting ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Save, { className: "h-4 w-4 mr-2" })), "Complete Assessment"] }), _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Generate Report"] }), _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Schedule Reassessment"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Assessment History" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Initial Assessment" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Jan 15, 2024" })] }), _jsx(Badge, { variant: "outline", className: "bg-green-100 text-green-800", children: "Qualified" })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "60-Day Review" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Mar 15, 2024" })] }), _jsx(Badge, { variant: "outline", className: "bg-green-100 text-green-800", children: "Qualified" })] })] }) })] })] })] })] }));
};
export default HomeboundAssessment;
