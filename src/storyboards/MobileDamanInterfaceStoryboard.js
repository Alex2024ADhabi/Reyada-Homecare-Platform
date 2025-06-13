import { jsx as _jsx } from "react/jsx-runtime";
import MobileDamanInterface from "@/components/mobile/MobileDamanInterface";
export default function MobileDamanInterfaceStoryboard() {
    return (_jsx("div", { className: "bg-gray-100 min-h-screen", children: _jsx(MobileDamanInterface, { patientId: "784-1990-1234567-1", serviceType: "home_nursing", onSubmissionComplete: (submissionId) => {
                console.log("Submission completed:", submissionId);
            } }) }));
}
