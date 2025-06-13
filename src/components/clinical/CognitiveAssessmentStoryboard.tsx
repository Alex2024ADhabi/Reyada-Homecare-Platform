import React from "react";
import DOHNineDomainsValidator from "@/components/clinical/DOHNineDomainsValidator";

const CognitiveAssessmentStoryboard: React.FC = () => {
  const mockPatientData = {
    patientId: "P12345",
    name: "Ahmed Al Mansouri",
    age: 72,
    diagnosis: "Mild Cognitive Impairment",
  };

  const handleValidationComplete = (result: any) => {
    console.log("DOH Validation Complete:", result);
  };

  const handleCognitiveAssessmentSave = (assessment: any) => {
    console.log("Cognitive Assessment Saved:", assessment);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            DOH 9 Domains Validator - Cognitive Assessment Demo
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive cognitive assessment implementation with MoCA, MMSE,
            and dementia screening
          </p>
        </div>

        <DOHNineDomainsValidator
          patientData={mockPatientData}
          onValidationComplete={handleValidationComplete}
          onCognitiveAssessmentSave={handleCognitiveAssessmentSave}
        />
      </div>
    </div>
  );
};

export default CognitiveAssessmentStoryboard;
