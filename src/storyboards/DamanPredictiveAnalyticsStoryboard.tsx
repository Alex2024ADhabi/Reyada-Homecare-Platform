import React from "react";
import DamanPredictiveAnalytics from "@/components/analytics/DamanPredictiveAnalytics";

export default function DamanPredictiveAnalyticsStoryboard() {
  const mockAuthorizationData = {
    patientId: "784-1990-1234567-1",
    serviceType: "home_nursing",
    providerId: "provider-001",
    clinicalJustification:
      "Patient has post-stroke hemiplegia with significant mobility limitations requiring intensive home nursing care for medication management, wound care, and rehabilitation support. Patient cannot safely travel to outpatient facilities due to severe mobility restrictions and requires skilled nursing interventions at home.",
    urgencyLevel: "routine",
    documents: ["medical_report.pdf", "assessment.pdf", "prescription.pdf"],
    estimatedDuration: 30,
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <DamanPredictiveAnalytics
        authorizationData={mockAuthorizationData}
        onRecommendationApply={(recommendation) => {
          console.log("Applying recommendation:", recommendation);
        }}
      />
    </div>
  );
}
