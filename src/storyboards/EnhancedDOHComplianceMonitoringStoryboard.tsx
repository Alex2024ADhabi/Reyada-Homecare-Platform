import React from "react";
import DOHRealTimeComplianceDashboard from "@/components/compliance/DOHRealTimeComplianceDashboard";

export default function EnhancedDOHComplianceMonitoringStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">
        Enhanced DOH Compliance Monitoring
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <DOHRealTimeComplianceDashboard />
      </div>
    </div>
  );
}
