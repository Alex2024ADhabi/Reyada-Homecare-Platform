import { jsx as _jsx } from "react/jsx-runtime";
import PatientLifecycleManager from "@/components/patient/PatientLifecycleManager";
export default function PatientLifecycleStoryboard() {
    return (_jsx("div", { className: "bg-gray-50 min-h-screen p-4", children: _jsx(PatientLifecycleManager, { patientId: "P12345", patientName: "Ahmed Al Mansoori", onBack: () => console.log("Back clicked") }) }));
}
