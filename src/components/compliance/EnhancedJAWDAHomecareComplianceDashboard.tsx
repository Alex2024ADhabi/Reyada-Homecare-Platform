import React, { useState, useEffect } from "react";
import enhancedJAWDAHomecareKPIService from "@/services/enhanced-jawda-homecare-kpi.service";

interface KPIMetric {
  id: string;
  code: string;
  name: string;
  nameArabic: string;
  currentValue: number;
  target: number;
  unitOfMeasure: string;
  status:
    | "excellent"
    | "good"
    | "acceptable"
    | "needs_improvement"
    | "critical";
  trend: "improving" | "stable" | "declining";
  desiredDirection: "lower" | "higher";
  dataQuality: "high" | "medium" | "low";
  confidence: number;
  lastCalculated: number;
}

interface ComplianceAlert {
  id: string;
  kpiCode: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  triggeredAt: number;
  status: "open" | "acknowledged" | "resolved";
}

interface CaseMixData {
  quarter: number;
  year: number;
  serviceCodes: {
    simpleVisitNurse: number;
    simpleVisitSupportive: number;
    specializedVisit: number;
    routineNursingCare: number;
    advancedNursingCare: number;
    selfPay: number;
  };
  totalPatientDays: number;
}

const EnhancedJAWDAHomecareComplianceDashboard: React.FC = () => {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [caseMixData, setCaseMixData] = useState<CaseMixData | null>(null);
  const [overallCompliance, setOverallCompliance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize KPI data
    loadKPIData();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadKPIData();
    }, 30000); // Update every 30 seconds

    // Listen to KPI service events
    enhancedJAWDAHomecareKPIService.on("kpi_calculated", handleKPICalculated);
    enhancedJAWDAHomecareKPIService.on(
      "compliance_alert",
      handleComplianceAlert,
    );
    enhancedJAWDAHomecareKPIService.on(
      "case_mix_generated",
      handleCaseMixGenerated,
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadKPIData = async () => {
    try {
      const stats = enhancedJAWDAHomecareKPIService.getKPIStats();

      // Mock KPI data - in production, this would come from the service
      const mockKPIs: KPIMetric[] = [
        {
          id: "HC001",
          code: "HC-001",
          name: "Emergency Department Visits without Hospitalization",
          nameArabic: "زيارات قسم الطوارئ دون دخول المستشفى",
          currentValue: 4.2,
          target: 5.0,
          unitOfMeasure: "Percentage per 100 patient days",
          status: "good",
          trend: "improving",
          desiredDirection: "lower",
          dataQuality: "high",
          confidence: 0.95,
          lastCalculated: Date.now(),
        },
        {
          id: "HC002",
          code: "HC-002",
          name: "Unplanned Acute Care Hospitalization",
          nameArabic: "دخول المستشفى للرعاية الحادة غير المخطط لها",
          currentValue: 6.8,
          target: 8.0,
          unitOfMeasure: "Percentage per home health day",
          status: "good",
          trend: "stable",
          desiredDirection: "lower",
          dataQuality: "high",
          confidence: 0.95,
          lastCalculated: Date.now(),
        },
        {
          id: "HC003",
          code: "HC-003",
          name: "Improvement in Ambulation (Physiotherapy)",
          nameArabic: "تحسن في المشي (العلاج الطبيعي)",
          currentValue: 78.5,
          target: 75.0,
          unitOfMeasure: "Percentage of patients",
          status: "excellent",
          trend: "improving",
          desiredDirection: "higher",
          dataQuality: "high",
          confidence: 0.9,
          lastCalculated: Date.now(),
        },
        {
          id: "HC004",
          code: "HC-004",
          name: "Pressure Injury Rate (Stage 2+)",
          nameArabic: "معدل إصابات الضغط (المرحلة 2+)",
          currentValue: 1.8,
          target: 2.0,
          unitOfMeasure: "Rate per 1000 patient days",
          status: "good",
          trend: "improving",
          desiredDirection: "lower",
          dataQuality: "high",
          confidence: 0.92,
          lastCalculated: Date.now(),
        },
        {
          id: "HC005",
          code: "HC-005",
          name: "Patient Falls with Injury Rate",
          nameArabic: "معدل سقوط المرضى مع الإصابة",
          currentValue: 1.2,
          target: 1.5,
          unitOfMeasure: "Rate per 1000 patient days",
          status: "excellent",
          trend: "stable",
          desiredDirection: "lower",
          dataQuality: "high",
          confidence: 0.88,
          lastCalculated: Date.now(),
        },
        {
          id: "HC006",
          code: "HC-006",
          name: "Discharge to Community",
          nameArabic: "الخروج إلى المجتمع",
          currentValue: 87.3,
          target: 85.0,
          unitOfMeasure: "Percentage of discharges",
          status: "excellent",
          trend: "improving",
          desiredDirection: "higher",
          dataQuality: "high",
          confidence: 0.9,
          lastCalculated: Date.now(),
        },
      ];

      setKpiMetrics(mockKPIs);
      setOverallCompliance(stats.overall_compliance || 92.5);
      setLastUpdated(new Date().toISOString());
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading KPI data:", error);
      setIsLoading(false);
    }
  };

  const handleKPICalculated = (data: any) => {
    console.log("KPI calculated:", data);
    loadKPIData();
  };

  const handleComplianceAlert = (alert: any) => {
    const newAlert: ComplianceAlert = {
      id: `alert-${Date.now()}`,
      kpiCode: alert.kpi.code,
      severity: alert.severity,
      message: alert.message,
      triggeredAt: Date.now(),
      status: "open",
    };
    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
  };

  const handleCaseMixGenerated = (caseMix: any) => {
    setCaseMixData({
      quarter: caseMix.reportingPeriod.quarter,
      year: caseMix.reportingPeriod.year,
      serviceCodes: caseMix.serviceCodes,
      totalPatientDays: caseMix.totalPatientDays,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "acceptable":
        return "bg-yellow-500";
      case "needs_improvement":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "acceptable":
        return "text-yellow-600";
      case "needs_improvement":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      case "declining":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculatePerformanceIndicator = (
    current: number,
    target: number,
    desiredDirection: string,
  ) => {
    if (desiredDirection === "lower") {
      return current <= target ? "Meeting Target" : "Above Target";
    } else {
      return current >= target ? "Meeting Target" : "Below Target";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            JAWDA Home Healthcare Compliance Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time monitoring of 6 core JAWDA KPIs for home healthcare
            services
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {overallCompliance.toFixed(1)}% Overall Compliance
          </div>
        </div>
      </div>

      {/* Overall Compliance Gauge */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">
            Overall JAWDA Compliance Score
          </h3>
          <span className="text-sm text-gray-500">Target: ≥95%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className={`h-6 rounded-full transition-all duration-500 ${
              overallCompliance >= 95
                ? "bg-green-500"
                : overallCompliance >= 85
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${Math.min(overallCompliance, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>95% (Target)</span>
          <span>100%</span>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          JAWDA Home Healthcare KPIs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiMetrics.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm leading-tight">
                    {kpi.code}: {kpi.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-arabic">
                    {kpi.nameArabic}
                  </p>
                </div>
                <div className="flex items-center ml-2">
                  {getTrendIcon(kpi.trend)}
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)} text-white`}
                  >
                    {kpi.status.charAt(0).toUpperCase() +
                      kpi.status.slice(1).replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span
                    className={`text-2xl font-bold ${getStatusTextColor(kpi.status)}`}
                  >
                    {kpi.currentValue}
                  </span>
                  <span className="text-sm text-gray-500">
                    Target: {kpi.target}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{kpi.unitOfMeasure}</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(kpi.status)}`}
                  style={{
                    width: `${Math.min(
                      kpi.desiredDirection === "lower"
                        ? Math.max(
                            0,
                            100 - (kpi.currentValue / kpi.target) * 50,
                          )
                        : (kpi.currentValue / kpi.target) * 100,
                      100,
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span
                  className={`font-medium ${
                    calculatePerformanceIndicator(
                      kpi.currentValue,
                      kpi.target,
                      kpi.desiredDirection,
                    ) === "Meeting Target"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {calculatePerformanceIndicator(
                    kpi.currentValue,
                    kpi.target,
                    kpi.desiredDirection,
                  )}
                </span>
                <span className="text-gray-500">
                  Quality: {kpi.dataQuality} ({Math.round(kpi.confidence * 100)}
                  %)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Mix Submission Data */}
      {caseMixData && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Case Mix Submission - Q{caseMixData.quarter} {caseMixData.year}
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {caseMixData.serviceCodes.simpleVisitNurse}
                </div>
                <div className="text-xs text-gray-500">
                  Simple Visit Nurse (17-25-1)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {caseMixData.serviceCodes.simpleVisitSupportive}
                </div>
                <div className="text-xs text-gray-500">
                  Simple Visit Supportive (17-25-2)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {caseMixData.serviceCodes.specializedVisit}
                </div>
                <div className="text-xs text-gray-500">
                  Specialized Visit (17-25-3)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {caseMixData.serviceCodes.routineNursingCare}
                </div>
                <div className="text-xs text-gray-500">
                  Routine Nursing (17-25-4)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {caseMixData.serviceCodes.advancedNursingCare}
                </div>
                <div className="text-xs text-gray-500">
                  Advanced Nursing (17-25-5)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {caseMixData.serviceCodes.selfPay}
                </div>
                <div className="text-xs text-gray-500">Self-Pay (XXXX)</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-gray-800">
                {caseMixData.totalPatientDays}
              </div>
              <div className="text-sm text-gray-500">Total Patient Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Compliance Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    alert.severity === "critical"
                      ? "bg-red-500"
                      : alert.severity === "high"
                        ? "bg-orange-500"
                        : alert.severity === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {alert.kpiCode}: {alert.message}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(alert.triggeredAt)}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.status === "open"
                      ? "bg-red-100 text-red-800"
                      : alert.status === "acknowledged"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedJAWDAHomecareComplianceDashboard;
