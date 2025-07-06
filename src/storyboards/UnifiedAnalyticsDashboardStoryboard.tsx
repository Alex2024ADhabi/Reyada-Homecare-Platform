import React from "react";
import UnifiedAnalyticsDashboard from "@/components/analytics/UnifiedAnalyticsDashboard";

export default function UnifiedAnalyticsDashboardStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedAnalyticsDashboard
        facilityId="RHHCS-001"
        userRole="admin"
        customFilters={{
          timeframe: "month",
          department: "all",
          priority: "high",
        }}
      />
    </div>
  );
}
