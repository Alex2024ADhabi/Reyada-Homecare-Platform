import React from "react";
import GovernanceLibraryDashboard from "@/components/governance/GovernanceLibraryDashboard";

export default function GovernanceLibraryDashboardStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="mb-6 p-6 bg-white border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Governance & Regulations Library Dashboard
          </h1>
          <p className="text-gray-600">
            Complete governance document management system with upload,
            publishing, staff notifications, and compliance monitoring
            capabilities.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Document Upload
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Auto-Publishing
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Staff Notifications
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Library Access
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Compliance Monitoring
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              Regulatory Reporting
            </span>
          </div>
        </div>

        <GovernanceLibraryDashboard />
      </div>
    </div>
  );
}
