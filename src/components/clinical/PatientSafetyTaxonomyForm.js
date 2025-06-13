import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info, Shield, Save, } from "lucide-react";
import { ValidationUtils } from "@/components/ui/form-validation";
import { dohComplianceValidatorService } from "@/services/doh-compliance-validator.service";
const PatientSafetyTaxonomyForm = ({ incidentId, incidentType, incidentDescription, severity, onSave, onValidationComplete, readOnly = false, }) => {
    const [taxonomyData, setTaxonomyData] = useState({
        level_1: "",
        level_2: "",
        level_3: "",
        level_4: "",
        level_5: "",
        classification_confidence: 0,
        auto_classified: false,
        manual_review_required: false,
        taxonomy_version: "CN_19_2025",
        classification_timestamp: new Date().toISOString(),
        classified_by: "manual_entry",
    });
    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [autoClassificationSuggestion, setAutoClassificationSuggestion] = useState(null);
    // DOH CN_19_2025 Level 1 Categories
    const level1Categories = [
        "Patient Care",
        "Medication/IV Fluids",
        "Medical Device/Equipment",
        "Patient Protection",
        "Care Management",
        "Clinical Process/Procedure",
        "Documentation",
        "Infection Control",
        "Blood/Blood Products",
        "Nutrition",
        "Oxygen/Gas/Vapour",
        "Healthcare-associated Infection",
        "Surgery/Anaesthesia/Sedation",
        "Diagnostic/Screening/Prevention",
        "Rehabilitation/Therapy",
        "Discharge/Transfer",
    ];
    // Level 2 subcategories based on Level 1 selection
    const getLevel2Options = (level1) => {
        const subcategories = {
            "Patient Care": [
                "General Patient Care",
                "Patient Assessment",
                "Patient Monitoring",
                "Patient Education",
                "Discharge Planning",
            ],
            "Medication/IV Fluids": [
                "Medication Administration",
                "Medication Reconciliation",
                "IV Therapy",
                "Medication Storage",
                "Pharmacy Services",
            ],
            "Medical Device/Equipment": [
                "Equipment Malfunction",
                "Equipment Maintenance",
                "Device Usage",
                "Equipment Safety",
                "Technology Issues",
            ],
            "Patient Protection": [
                "Falls Prevention",
                "Restraint Use",
                "Patient Identification",
                "Security Issues",
                "Environmental Safety",
            ],
            "Clinical Process/Procedure": [
                "Clinical Assessment",
                "Diagnosis/Assessment",
                "Treatment Planning",
                "Procedure Performance",
                "Clinical Decision Making",
            ],
            Documentation: [
                "Clinical Documentation",
                "Administrative Documentation",
                "Legal Documentation",
                "Electronic Records",
                "Information Management",
            ],
            "Healthcare-associated Infection": [
                "Infection Prevention",
                "Infection Control",
                "Surveillance",
                "Outbreak Management",
                "Antimicrobial Stewardship",
            ],
            "Care Management": [
                "Care Coordination",
                "Communication",
                "Handoff/Transfer",
                "Multidisciplinary Care",
                "Continuity of Care",
            ],
        };
        return subcategories[level1] || [];
    };
    // Auto-classify incident on component mount
    useEffect(() => {
        if (incidentType && incidentDescription && severity) {
            performAutoClassification();
        }
    }, [incidentType, incidentDescription, severity]);
    // Validate taxonomy whenever data changes
    useEffect(() => {
        validateTaxonomy();
    }, [taxonomyData]);
    const performAutoClassification = async () => {
        try {
            setIsLoading(true);
            const suggestion = await dohComplianceValidatorService.classifyIncidentWithDOHTaxonomy(incidentType, incidentDescription, severity);
            setAutoClassificationSuggestion(suggestion);
        }
        catch (error) {
            console.error("Auto-classification failed:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const applyAutoClassification = () => {
        if (autoClassificationSuggestion) {
            setTaxonomyData({
                ...taxonomyData,
                ...autoClassificationSuggestion,
                auto_classified: true,
                classified_by: "system_auto_classifier",
            });
        }
    };
    const validateTaxonomy = () => {
        const result = ValidationUtils.validatePatientSafetyTaxonomy(taxonomyData);
        setValidationResult(result);
        if (onValidationComplete) {
            onValidationComplete(result.isValid, result.errors);
        }
    };
    const handleFieldChange = (field, value) => {
        setTaxonomyData((prev) => ({
            ...prev,
            [field]: value,
            classification_timestamp: new Date().toISOString(),
            auto_classified: false,
            classified_by: "manual_entry",
        }));
        // Reset dependent fields when parent level changes
        if (field === "level_1") {
            setTaxonomyData((prev) => ({
                ...prev,
                level_2: "",
                level_3: "",
                level_4: "",
                level_5: "",
            }));
        }
    };
    const handleSave = () => {
        if (onSave && validationResult?.isValid) {
            onSave(taxonomyData);
        }
    };
    const getComplianceLevelColor = (level) => {
        switch (level) {
            case "excellent":
                return "text-green-700 bg-green-100";
            case "good":
                return "text-blue-700 bg-blue-100";
            case "acceptable":
                return "text-yellow-700 bg-yellow-100";
            case "needs_improvement":
                return "text-red-700 bg-red-100";
            default:
                return "text-gray-700 bg-gray-100";
        }
    };
    return (_jsxs("div", { className: "space-y-6 bg-white", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5 text-blue-600" }), "DOH Patient Safety Taxonomy Classification (CN_19_2025)"] }), _jsx(CardDescription, { children: "Classify patient safety incidents according to DOH standards for regulatory compliance and learning opportunities." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-gray-600", children: "Incident Type" }), _jsx("p", { className: "font-medium", children: incidentType })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-gray-600", children: "Severity" }), _jsx(Badge, { variant: severity === "critical" || severity === "high"
                                                ? "destructive"
                                                : "secondary", children: severity.toUpperCase() })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-gray-600", children: "Taxonomy Version" }), _jsx("p", { className: "font-medium", children: taxonomyData.taxonomy_version })] })] }) })] }), autoClassificationSuggestion && !taxonomyData.auto_classified && (_jsxs(Alert, { children: [_jsx(Info, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { children: ["Auto-classification suggestion available (Confidence:", " ", autoClassificationSuggestion.classification_confidence, "%)"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: applyAutoClassification, disabled: readOnly, children: "Apply Suggestion" })] }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "5-Level Taxonomy Classification" }), _jsx(CardDescription, { children: "Complete all five levels for comprehensive incident classification" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "level_1", className: "text-sm font-medium", children: "Level 1: Primary Category *" }), _jsxs(Select, { value: taxonomyData.level_1, onValueChange: (value) => handleFieldChange("level_1", value), disabled: readOnly, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select primary category" }) }), _jsx(SelectContent, { children: level1Categories.map((category) => (_jsx(SelectItem, { value: category, children: category }, category))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "level_2", className: "text-sm font-medium", children: "Level 2: Subcategory *" }), _jsxs(Select, { value: taxonomyData.level_2, onValueChange: (value) => handleFieldChange("level_2", value), disabled: readOnly || !taxonomyData.level_1, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select subcategory" }) }), _jsx(SelectContent, { children: getLevel2Options(taxonomyData.level_1).map((subcategory) => (_jsx(SelectItem, { value: subcategory, children: subcategory }, subcategory))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "level_3", className: "text-sm font-medium", children: "Level 3: Specific Type *" }), _jsx(Input, { id: "level_3", value: taxonomyData.level_3, onChange: (e) => handleFieldChange("level_3", e.target.value), placeholder: "Describe the specific type of incident (min 5 characters)", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "level_4", className: "text-sm font-medium", children: "Level 4: Contributing Factors *" }), _jsx(Textarea, { id: "level_4", value: taxonomyData.level_4, onChange: (e) => handleFieldChange("level_4", e.target.value), placeholder: "Identify contributing factors (communication, training, protocols, equipment, etc.)", className: "h-20", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "level_5", className: "text-sm font-medium", children: "Level 5: Root Cause Analysis *" }), _jsx(Textarea, { id: "level_5", value: taxonomyData.level_5, onChange: (e) => handleFieldChange("level_5", e.target.value), placeholder: "Provide comprehensive root cause analysis (min 10 characters)", className: "h-24", disabled: readOnly })] })] })] }), validationResult && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [validationResult.isValid ? (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })) : (_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" })), "Classification Validation"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Completeness" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: validationResult.completeness, className: "w-24 h-2" }), _jsxs("span", { className: "text-sm font-medium", children: [validationResult.completeness, "%"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Compliance Level:" }), _jsx(Badge, { className: getComplianceLevelColor(validationResult.complianceLevel), children: validationResult.complianceLevel
                                            .replace("_", " ")
                                            .toUpperCase() })] }), validationResult.errors.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-red-600", children: "Validation Errors:" }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: validationResult.errors.map((error, index) => (_jsx("li", { className: "text-sm text-red-600", children: error }, index))) })] })), validationResult.recommendations?.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-blue-600", children: "Recommendations:" }), _jsx("ul", { className: "list-disc list-inside space-y-1", children: validationResult.recommendations.map((rec, index) => (_jsx("li", { className: "text-sm text-blue-600", children: rec }, index))) })] }))] })] })), !readOnly && (_jsxs("div", { className: "flex justify-end gap-2", children: [_jsxs(Button, { variant: "outline", onClick: performAutoClassification, disabled: isLoading, children: [_jsx(Shield, { className: "w-4 h-4 mr-2" }), isLoading ? "Classifying..." : "Auto-Classify"] }), _jsxs(Button, { onClick: handleSave, disabled: !validationResult?.isValid || isLoading, children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Classification"] })] }))] }));
};
export default PatientSafetyTaxonomyForm;
