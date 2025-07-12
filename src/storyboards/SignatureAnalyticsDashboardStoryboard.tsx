import React from "react";
import SignatureAnalyticsDashboard from "@/components/ui/signature-analytics-dashboard";

export default function SignatureAnalyticsDashboardStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignatureAnalyticsDashboard
        refreshInterval={60000}
        defaultDateRange={{
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        }}
      />
    </div>
  );
}
