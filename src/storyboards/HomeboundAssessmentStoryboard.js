import { jsx as _jsx } from "react/jsx-runtime";
import HomeboundAssessment from "@/components/patient/HomeboundAssessment";
export default function HomeboundAssessmentStoryboard() {
    return (_jsx("div", { className: "bg-gray-50 min-h-screen p-4", children: _jsx(HomeboundAssessment, { patientId: "P12345", patientName: "Ahmed Al Mansoori", onBack: () => console.log("Back clicked") }) }));
}
