import { jsx as _jsx } from "react/jsx-runtime";
import DamanTrainingInterface from "@/components/training/DamanTrainingInterface";
export default function DamanTrainingInterfaceStoryboard() {
    const mockFormData = {
        patientId: "784-1990-1234567-1",
        serviceType: "physiotherapy",
        providerId: "provider-001",
        clinicalJustification: "Patient requires physiotherapy for post-surgical rehabilitation",
        documents: ["surgical_report.pdf"],
    };
    return (_jsx("div", { className: "bg-white min-h-screen p-6", children: _jsx(DamanTrainingInterface, { currentField: "clinicalJustification", formData: mockFormData, onGuidanceApply: (guidance) => {
                console.log("Applying guidance:", guidance);
            } }) }));
}
