import React from "react";
import DamanTrainingInterface from "@/components/training/DamanTrainingInterface";

export default function DamanTrainingInterfaceStoryboard() {
  const mockFormData = {
    patientId: "784-1990-1234567-1",
    serviceType: "physiotherapy",
    providerId: "provider-001",
    clinicalJustification:
      "Patient requires physiotherapy for post-surgical rehabilitation",
    documents: ["surgical_report.pdf"],
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <DamanTrainingInterface
        currentField="clinicalJustification"
        formData={mockFormData}
        onGuidanceApply={(guidance) => {
          console.log("Applying guidance:", guidance);
        }}
      />
    </div>
  );
}
