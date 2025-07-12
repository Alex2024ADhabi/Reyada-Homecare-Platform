import React from "react";
import AdvancedRobustnessValidationDashboard from "@/components/validation/AdvancedRobustnessValidationDashboard";

export default function AdvancedRobustnessValidationStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Advanced Robustness Validation
        </h1>
        <AdvancedRobustnessValidationDashboard className="w-full" />
      </div>
    </div>
  );
}
