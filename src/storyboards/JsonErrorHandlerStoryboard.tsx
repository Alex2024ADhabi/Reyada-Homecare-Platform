import React from "react";

export default function JsonErrorHandlerStoryboard() {
  const testData = {
    patientId: "P123456",
    serviceType: "home_nursing",
    clinicalJustification:
      "Patient requires comprehensive home nursing care due to post-surgical complications and mobility limitations.",
    providerId: "PRV-001-HN",
    documents: ["medical-report.pdf", "assessment-form.pdf"],
  };

  return (
    <div className="bg-white p-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">JSON Error Handler</h1>
          <p className="text-gray-600">
            Comprehensive JSON validation and error handling component
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Test Data:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
