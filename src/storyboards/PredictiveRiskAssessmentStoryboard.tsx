import React from "react";
import DOHAutomatedReportingDashboard from "@/components/compliance/DOHAutomatedReportingDashboard";

export default function PredictiveRiskAssessmentStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Predictive Risk Assessment
        </h1>
        <DOHAutomatedReportingDashboard />
      </div>
    </div>
  );
}
