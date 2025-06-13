import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DOHNineDomainsValidator from "@/components/clinical/DOHNineDomainsValidator";
const CognitiveAssessmentStoryboard = () => {
    const mockPatientData = {
        patientId: "P12345",
        name: "Ahmed Al Mansouri",
        age: 72,
        diagnosis: "Mild Cognitive Impairment",
    };
    const handleValidationComplete = (result) => {
        console.log("DOH Validation Complete:", result);
    };
    const handleCognitiveAssessmentSave = (assessment) => {
        console.log("Cognitive Assessment Saved:", assessment);
    };
    return (_jsx("div", { className: "bg-white min-h-screen p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "DOH 9 Domains Validator - Cognitive Assessment Demo" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Comprehensive cognitive assessment implementation with MoCA, MMSE, and dementia screening" })] }), _jsx(DOHNineDomainsValidator, { patientData: mockPatientData, onValidationComplete: handleValidationComplete, onCognitiveAssessmentSave: handleCognitiveAssessmentSave })] }) }));
};
export default CognitiveAssessmentStoryboard;
