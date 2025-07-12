import React from "react";
import ComprehensiveAssessmentForm from "@/components/clinical/ComprehensiveAssessmentForm";

export default function ComprehensiveAssessmentFormStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Comprehensive Assessment Form
          </h1>
          <p className="text-gray-600">
            Advanced clinical assessment form with auto-save, digital
            signatures, DOH compliance validation, and comprehensive clinical
            documentation capabilities.
          </p>
        </div>

        <ComprehensiveAssessmentForm
          patientId="patient_001"
          episodeId="episode_001"
          autoSave={true}
          offlineMode={false}
          onSave={(data) => {
            console.log("Form saved:", data);
          }}
          onAutoSave={(data) => {
            console.log("Auto-saved:", data);
          }}
          onDraftSave={(data) => {
            console.log("Draft saved:", data);
          }}
          onCancel={() => {
            console.log("Form cancelled");
          }}
          initialData={{
            fullName: "Ahmed Al-Mansouri",
            emiratesId: "784-1990-1234567-1",
            dateOfBirth: "1990-05-15",
            gender: "male",
            contactNumber: "+971-50-123-4567",
            address: "123 Sheikh Zayed Road, Dubai",
            insuranceProvider: "Daman",
            insuranceNumber: "DM123456789",
            chiefComplaint: "Chronic back pain and mobility issues",
            severity: "moderate",
          }}
        />
      </div>
    </div>
  );
}
