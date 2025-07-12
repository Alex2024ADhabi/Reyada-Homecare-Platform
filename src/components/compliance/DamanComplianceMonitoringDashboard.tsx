import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Database,
  Lock,
  Eye,
  RefreshCw,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
import { ADHICSComplianceService } from "@/services/adhics-compliance.service";
import { SecurityService, AuditLogger } from "@/services/security.service";
import { patientComplaintAPI } from "@/api/incident-management.api";

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: "excellent" | "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  status: "success" | "failure" | "warning";
  details: string;
  damanRelated: boolean;
  complianceImpact: boolean;
}

interface ComplianceAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  damanStandard: string;
  adhicsSection?: string;
  adhicsControl?: string;
  complianceGap?: boolean;
  remediationSteps?: string[];
  riskLevel?: "low" | "medium" | "high" | "critical";
}

interface TrendData {
  date: string;
  value: number;
  target: number;
  category: string;
}

interface ComplianceReport {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly" | "quarterly";
  generatedAt: string;
  status: "generating" | "ready" | "failed";
  downloadUrl?: string;
  metrics: {
    overallScore: number;
    authorizationSuccessRate: number;
    documentCompleteness: number;
    auditTrailIntegrity: number;
  };
}

interface DrillDownData {
  category: string;
  subcategories: {
    name: string;
    value: number;
    trend: "up" | "down" | "stable";
    details: string[];
  }[];
}

const DamanComplianceMonitoringDashboard: React.FC = () => {
  const [complianceMetrics, setComplianceMetrics] = useState<
    ComplianceMetric[]
  >([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>(
    [],
  );
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [complianceReports, setComplianceReports] = useState<
    ComplianceReport[]
  >([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(
    null,
  );
  const [reportGenerating, setReportGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [adhicsCompliance, setAdhicsCompliance] = useState<any>(null);
  const [adhicsViolations, setAdhicsViolations] = useState<any[]>([]);
  const [complianceGaps, setComplianceGaps] = useState<any[]>([]);
  const [securityAssessment, setSecurityAssessment] = useState<any>(null);
  const [complaintMetrics, setComplaintMetrics] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    loadComplianceData();
    loadADHICSCompliance();
    loadComplaintData();
    const interval = setInterval(() => {
      loadComplianceData();
      loadADHICSCompliance();
      loadComplaintData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadADHICSCompliance = async () => {
    try {
      // Initialize security service
      SecurityService.initialize();

      // Get ADHICS compliance assessment
      const adhicsAssessment =
        await ADHICSComplianceService.performComprehensiveAssessment({
          includeAutomatedScans: true,
          generateRecommendations: true,
          checkDataProtection: true,
          validateAccessControls: true,
          assessPhysicalSecurity: true,
          reviewIncidentManagement: true,
        });

      setAdhicsCompliance(adhicsAssessment);

      // Get violations and gaps
      const violations = await ADHICSComplianceService.getViolations();
      const gaps = await ADHICSComplianceService.identifyComplianceGaps();

      setAdhicsViolations(violations);
      setComplianceGaps(gaps);

      // Perform security assessment
      const securityCheck = SecurityService.performSecurityCheck();
      setSecurityAssessment(securityCheck);

      // Log compliance assessment
      AuditLogger.logSecurityEvent({
        type: "compliance_violation",
        details: {
          adhicsScore: adhicsAssessment?.overallScore || 0,
          violationsCount: violations.length,
          gapsCount: gaps.length,
          securityPassed: securityCheck.passed,
        },
        severity: adhicsAssessment?.overallScore < 85 ? "high" : "medium",
        complianceImpact: true,
        damanRelated: true,
      });
    } catch (error) {
      console.error("Error loading ADHICS compliance data:", error);
      AuditLogger.logSecurityEvent({
        type: "system_event",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        severity: "high",
      });
    }
  };

  const loadComplaintData = async () => {
    try {
      // Load complaint statistics
      const statsResponse = await patientComplaintAPI.getComplaintStatistics();
      if (statsResponse.success) {
        setComplaintMetrics(statsResponse.data);
      }

      // Load recent complaints
      const complaintsResponse = await patientComplaintAPI.getComplaints({
        page: 1,
        limit: 5,
      });
      if (complaintsResponse.success) {
        setRecentComplaints(complaintsResponse.data);
      }

      // Log complaint data access
      AuditLogger.logSecurityEvent({
        type: "data_access",
        details: {
          action: "load_complaint_metrics",
          complaintsCount: complaintsResponse.data?.length || 0,
        },
        severity: "low",
        complianceImpact: true,
        damanRelated: true,
      });
    } catch (error) {
      console.error("Error loading complaint data:", error);
      AuditLogger.logSecurityEvent({
        type: "system_event",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          action: "load_complaint_data_failed",
        },
        severity: "medium",
      });
    }
  };

  const loadComplianceData = async () => {
    try {
      setLoading(true);

      // Simulate API calls with proper JSON validation and sanitization
      const mockMetrics: ComplianceMetric[] = [
        {
          id: "auth_success_rate",
          name: "Authorization Success Rate",
          value: 94.2,
          target: 95.0,
          status: "warning",
          trend: "up",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "doc_completeness",
          name: "Documentation Completeness",
          value: 96.8,
          target: 98.0,
          status: "good",
          trend: "stable",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "response_time",
          name: "Average Response Time (hours)",
          value: 2.3,
          target: 2.0,
          status: "warning",
          trend: "down",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "data_protection",
          name: "Data Protection Score",
          value: 98.5,
          target: 95.0,
          status: "excellent",
          trend: "up",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "audit_trail",
          name: "Audit Trail Completeness",
          value: 99.1,
          target: 98.0,
          status: "excellent",
          trend: "stable",
          lastUpdated: new Date().toISOString(),
        },
      ];

      const mockAuditLogs: AuditLogEntry[] = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          userId: "provider_001",
          action: "daman_authorization_submitted",
          resource: "patient_12345",
          status: "success",
          details: "Authorization request submitted successfully",
          damanRelated: true,
          complianceImpact: true,
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          userId: "admin_001",
          action: "compliance_report_generated",
          resource: "monthly_report_2025_01",
          status: "success",
          details: "Monthly compliance report generated",
          damanRelated: true,
          complianceImpact: false,
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          userId: "provider_002",
          action: "document_upload_failed",
          resource: "auth_doc_67890",
          status: "failure",
          details: "Document upload failed - invalid format",
          damanRelated: true,
          complianceImpact: true,
        },
      ];

      const mockAlerts: ComplianceAlert[] = [
        {
          id: "1",
          type: "warning",
          title: "Authorization Success Rate Below Target",
          description: "Current success rate is 94.2%, below the target of 95%",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: false,
          damanStandard: "MSC Guidelines 2025",
        },
        {
          id: "2",
          type: "critical",
          title: "Missing Required Documentation",
          description:
            "3 authorization requests missing face-to-face assessment",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: false,
          damanStandard: "Homecare Standards 2025",
          adhicsSection: "Section A - Governance",
          adhicsControl: "AM 2.3 - Asset Ownership",
          complianceGap: true,
          remediationSteps: [
            "Implement mandatory face-to-face assessment workflow",
            "Update authorization request forms",
            "Train staff on new requirements",
          ],
          riskLevel: "critical",
        },
        {
          id: "3",
          type: "critical",
          title: "ADHICS V2 Access Control Violation",
          description:
            "User access review not performed within required timeframe",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          resolved: false,
          damanStandard: "ADHICS V2 Standards",
          adhicsSection: "Section B - Access Control",
          adhicsControl: "AC 4.1 - Access Review",
          complianceGap: true,
          remediationSteps: [
            "Perform immediate access review",
            "Implement automated access review scheduling",
            "Document access review procedures",
          ],
          riskLevel: "critical",
        },
        {
          id: "4",
          type: "warning",
          title: "Physical Security Gap",
          description: "Server room access logs incomplete for last 48 hours",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          resolved: false,
          damanStandard: "ADHICS V2 Standards",
          adhicsSection: "Section B - Physical Security",
          adhicsControl: "PE 2.4 - Secure Area Access Logs",
          complianceGap: true,
          remediationSteps: [
            "Review and complete access logs",
            "Implement automated logging system",
            "Establish log monitoring procedures",
          ],
          riskLevel: "medium",
        },
      ];

      // Validate and sanitize data
      const sanitizedMetrics = mockMetrics.map((metric) => ({
        ...metric,
        name: inputSanitizer.sanitizeText(metric.name, 100).sanitized,
        lastUpdated: inputSanitizer.sanitizeText(metric.lastUpdated, 50)
          .sanitized,
      }));

      const sanitizedLogs = mockAuditLogs.map((log) => ({
        ...log,
        action: inputSanitizer.sanitizeText(log.action, 100).sanitized,
        details: inputSanitizer.sanitizeText(log.details, 500).sanitized,
      }));

      const sanitizedAlerts = mockAlerts.map((alert) => ({
        ...alert,
        title: inputSanitizer.sanitizeText(alert.title, 200).sanitized,
        description: inputSanitizer.sanitizeText(alert.description, 500)
          .sanitized,
      }));

      setComplianceMetrics(sanitizedMetrics);
      setAuditLogs(sanitizedLogs);
      setComplianceAlerts(sanitizedAlerts);

      // Calculate overall score
      const avgScore =
        sanitizedMetrics.reduce((sum, metric) => {
          const normalizedValue = metric.name.includes("Time")
            ? Math.max(0, 100 - (metric.value / metric.target) * 100)
            : (metric.value / metric.target) * 100;
          return sum + Math.min(100, normalizedValue);
        }, 0) / sanitizedMetrics.length;

      setOverallScore(Math.round(avgScore));
      setLastRefresh(new Date());

      // Load trend data
      const mockTrendData: TrendData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        mockTrendData.push({
          date: date.toISOString().split("T")[0],
          value: Math.random() * 20 + 80, // 80-100 range
          target: 95,
          category: "overall",
        });
      }
      setTrendData(mockTrendData);

      // Load compliance reports
      const mockReports: ComplianceReport[] = [
        {
          id: "1",
          name: "Monthly Compliance Report - January 2025",
          type: "monthly",
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "ready",
          downloadUrl: "/reports/monthly-jan-2025.pdf",
          metrics: {
            overallScore: 92.5,
            authorizationSuccessRate: 94.2,
            documentCompleteness: 96.8,
            auditTrailIntegrity: 98.1,
          },
        },
        {
          id: "2",
          name: "Weekly Compliance Report - Week 4",
          type: "weekly",
          generatedAt: new Date().toISOString(),
          status: "generating",
          metrics: {
            overallScore: 0,
            authorizationSuccessRate: 0,
            documentCompleteness: 0,
            auditTrailIntegrity: 0,
          },
        },
      ];
      setComplianceReports(mockReports);
    } catch (error) {
      console.error("Error loading compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      case "warning":
        return "outline";
      case "critical":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case "stable":
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const generateComplianceReport = async (
    reportType: "daily" | "weekly" | "monthly" | "quarterly" = "monthly",
  ) => {
    try {
      setReportGenerating(true);

      const reportData = {
        timestamp: new Date().toISOString(),
        reportType,
        dateRange,
        overallScore,
        metrics: complianceMetrics,
        alerts: complianceAlerts.filter((alert) => !alert.resolved),
        auditSummary: {
          totalEntries: auditLogs.length,
          successRate:
            (auditLogs.filter((log) => log.status === "success").length /
              auditLogs.length) *
            100,
          damanRelatedEntries: auditLogs.filter((log) => log.damanRelated)
            .length,
        },
        trendAnalysis: {
          averageScore:
            trendData.reduce((sum, item) => sum + item.value, 0) /
            trendData.length,
          trend:
            trendData[trendData.length - 1]?.value > trendData[0]?.value
              ? "improving"
              : "declining",
          volatility:
            Math.max(...trendData.map((item) => item.value)) -
            Math.min(...trendData.map((item) => item.value)),
        },
        forecasting: {
          nextMonthPrediction: overallScore + (Math.random() * 4 - 2), // Simple prediction
          confidenceLevel: 85,
          recommendedActions: [
            "Focus on authorization success rate improvement",
            "Enhance documentation completeness processes",
            "Implement additional audit trail monitoring",
          ],
        },
      };

      // Validate JSON before processing
      const jsonString = JsonValidator.safeStringify(reportData, 2);
      const validation = JsonValidator.validate(jsonString);

      if (!validation.isValid) {
        throw new Error(
          `Report generation failed: ${validation.errors?.join(", ")}`,
        );
      }

      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newReport: ComplianceReport = {
        id: Date.now().toString(),
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Compliance Report - ${new Date().toLocaleDateString()}`,
        type: reportType,
        generatedAt: new Date().toISOString(),
        status: "ready",
        downloadUrl: `/reports/${reportType}-${Date.now()}.pdf`,
        metrics: {
          overallScore,
          authorizationSuccessRate:
            complianceMetrics.find((m) => m.id === "auth_success_rate")
              ?.value || 0,
          documentCompleteness:
            complianceMetrics.find((m) => m.id === "doc_completeness")?.value ||
            0,
          auditTrailIntegrity:
            complianceMetrics.find((m) => m.id === "audit_trail")?.value || 0,
        },
      };

      setComplianceReports((prev) => [newReport, ...prev]);

      console.log("Compliance report generated:", reportData);
    } catch (error) {
      console.error("Error generating compliance report:", error);
    } finally {
      setReportGenerating(false);
    }
  };

  const handleDrillDown = (metricId: string) => {
    setSelectedMetric(metricId);

    // Mock drill-down data
    const mockDrillDown: DrillDownData = {
      category: metricId,
      subcategories: [
        {
          name: "Authorization Requests",
          value: 94.2,
          trend: "up",
          details: [
            "MSC authorizations: 96.5%",
            "Homecare services: 92.8%",
            "Wheelchair approvals: 89.3%",
          ],
        },
        {
          name: "Document Submission",
          value: 96.8,
          trend: "stable",
          details: [
            "Face-to-face assessments: 98.2%",
            "Medical reports: 95.4%",
            "Authorization forms: 97.1%",
          ],
        },
        {
          name: "Response Times",
          value: 87.5,
          trend: "down",
          details: [
            "Average response: 2.3 hours",
            "Target: 2.0 hours",
            "Peak delays: 4.1 hours",
          ],
        },
      ],
    };

    setDrillDownData(mockDrillDown);
  };

  const exportReport = async (
    reportId: string,
    format: "pdf" | "excel" | "csv" = "pdf",
  ) => {
    try {
      const report = complianceReports.find((r) => r.id === reportId);
      if (!report) return;

      // Enhanced export with comprehensive data
      const exportData = {
        reportId,
        format,
        timestamp: new Date().toISOString(),
        reportMetadata: {
          generatedBy: "Daman Compliance Monitor",
          version: "2.0",
          complianceStandards: ["DOH_2025", "DAMAN_MSC"],
          dataRetentionPeriod: "7 years",
        },
        executiveSummary: {
          overallScore,
          criticalIssues: complianceAlerts.filter(
            (a) => a.type === "critical" && !a.resolved,
          ).length,
          complianceGaps: complianceMetrics.filter((m) => m.value < m.target)
            .length,
          recommendedActions: [
            "Address critical compliance violations immediately",
            "Implement automated monitoring for real-time alerts",
            "Enhance staff training on DOH 2025 requirements",
          ],
        },
        detailedMetrics: complianceMetrics,
        trendAnalysis: {
          data: trendData,
          insights: [
            "Compliance scores show steady improvement over 30 days",
            "Authorization success rate trending upward (+2.3%)",
            "Document completeness consistently above target",
          ],
          forecast: {
            nextMonth: overallScore + (Math.random() * 4 - 2),
            confidence: 85,
            factors: [
              "Seasonal variations",
              "Staff training completion",
              "System upgrades",
            ],
          },
        },
        auditTrail: auditLogs.slice(-50),
        complianceAlerts: complianceAlerts,
        data: report,
      };

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case "csv":
          content = convertToCSV(exportData);
          mimeType = "text/csv";
          fileExtension = "csv";
          break;
        case "excel":
          content = JSON.stringify(exportData, null, 2); // In production, use proper Excel library
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          fileExtension = "xlsx";
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          mimeType = "application/json";
          fileExtension = "json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daman-compliance-report-${reportId}-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log export action for audit
      console.log(`Compliance report exported: ${reportId} as ${format}`);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const exportTrendData = async (format: "csv" | "excel") => {
    try {
      const trendExportData = {
        exportTimestamp: new Date().toISOString(),
        dataRange: {
          startDate: trendData[0]?.date,
          endDate: trendData[trendData.length - 1]?.date,
          totalDays: trendData.length,
        },
        trendData,
        summary: {
          averageScore:
            trendData.reduce((sum, item) => sum + item.value, 0) /
            trendData.length,
          highestScore: Math.max(...trendData.map((item) => item.value)),
          lowestScore: Math.min(...trendData.map((item) => item.value)),
          volatility:
            Math.max(...trendData.map((item) => item.value)) -
            Math.min(...trendData.map((item) => item.value)),
        },
      };

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === "csv") {
        content = convertTrendDataToCSV(trendExportData);
        mimeType = "text/csv";
        fileExtension = "csv";
      } else {
        content = JSON.stringify(trendExportData, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-trend-data-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting trend data:", error);
    }
  };

  const convertToCSV = (data: any): string => {
    const headers = ["Metric", "Value", "Target", "Status", "Last Updated"];
    const rows = data.detailedMetrics.map((metric: any) => [
      metric.name,
      metric.value,
      metric.target,
      metric.status,
      metric.lastUpdated,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const convertTrendDataToCSV = (data: any): string => {
    const headers = ["Date", "Compliance Score", "Target", "Category"];
    const rows = data.trendData.map((item: any) => [
      item.date,
      item.value,
      item.target,
      item.category,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading compliance data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Daman Compliance Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time compliance dashboard for Daman 2025 standards
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={loadComplianceData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateComplianceReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      {/* Enhanced Overall Compliance Score with ADHICS Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Overall Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-blue-600">
                {overallScore}%
              </div>
              <div className="flex-1">
                <Progress value={overallScore} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span>Target: 95%</span>
                  <span>100%</span>
                </div>
              </div>
              <Badge
                variant={
                  overallScore >= 95
                    ? "default"
                    : overallScore >= 85
                      ? "secondary"
                      : "destructive"
                }
              >
                {overallScore >= 95
                  ? "Excellent"
                  : overallScore >= 85
                    ? "Good"
                    : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              ADHICS V2 Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-green-600">
                {adhicsCompliance?.overallScore || 0}%
              </div>
              <div className="flex-1">
                <Progress
                  value={adhicsCompliance?.overallScore || 0}
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>
                    Section A: {adhicsCompliance?.sectionA?.score || 0}%
                  </span>
                  <span>
                    Section B: {adhicsCompliance?.sectionB?.score || 0}%
                  </span>
                </div>
              </div>
              <Badge
                variant={
                  (adhicsCompliance?.overallScore || 0) >= 95
                    ? "default"
                    : (adhicsCompliance?.overallScore || 0) >= 85
                      ? "secondary"
                      : "destructive"
                }
              >
                {(adhicsCompliance?.overallScore || 0) >= 95
                  ? "Compliant"
                  : (adhicsCompliance?.overallScore || 0) >= 85
                    ? "Mostly Compliant"
                    : "Non-Compliant"}
              </Badge>
            </div>
            {adhicsViolations.length > 0 && (
              <div className="mt-3 text-sm text-red-600">
                {adhicsViolations.length} active violations requiring attention
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {complianceAlerts.filter((alert) => !alert.resolved).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Active Compliance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceAlerts
                .filter((alert) => !alert.resolved)
                .map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={
                      alert.type === "critical" ? "destructive" : "default"
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>
                      {alert.description}
                      <div className="text-xs text-gray-500 mt-1">
                        Standard: {alert.damanStandard} |{" "}
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Compliance Metrics</TabsTrigger>
          <TabsTrigger value="complaints">Patient Complaints</TabsTrigger>
          <TabsTrigger value="adhics">ADHICS V2 Status</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="drilldown">Drill-Down Analysis</TabsTrigger>
          <TabsTrigger value="security">Security Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {metric.name}
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleDrillDown(metric.id)}
                        title="Click for detailed analysis"
                      >
                        {metric.name.includes("Time")
                          ? `${metric.value}h`
                          : `${metric.value}%`}
                      </span>
                      <Badge variant={getStatusBadgeVariant(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <Progress
                      value={
                        metric.name.includes("Time")
                          ? Math.max(
                              0,
                              100 - (metric.value / metric.target) * 100,
                            )
                          : (metric.value / metric.target) * 100
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Target:{" "}
                        {metric.name.includes("Time")
                          ? `${metric.target}h`
                          : `${metric.target}%`}
                      </span>
                      <span>
                        {new Date(metric.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          {/* Patient Complaint Management Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Total Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {complaintMetrics?.total || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All time complaints
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Open Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {complaintMetrics?.byStatus?.Open || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pending resolution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolved This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {complaintMetrics?.byStatus?.Closed || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Successfully closed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Avg Resolution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(complaintMetrics?.averageResolutionTime || 0)}h
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Average hours to resolve
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Complaint Severity Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Complaints by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(complaintMetrics?.bySeverity || {}).map(
                    ([severity, count]) => (
                      <div
                        key={severity}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Badge
                            variant={
                              severity === "Critical"
                                ? "destructive"
                                : severity === "High"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="mr-2"
                          >
                            {severity}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">
                            {count as number}
                          </div>
                          <Progress
                            value={
                              ((count as number) /
                                (complaintMetrics?.total || 1)) *
                              100
                            }
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Complaints by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(complaintMetrics?.byType || {}).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{type}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{count as number}</span>
                          <Progress
                            value={
                              ((count as number) /
                                (complaintMetrics?.total || 1)) *
                              100
                            }
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Recent Patient Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div
                      key={complaint.complaintId}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              complaint.status === "Closed"
                                ? "default"
                                : complaint.status === "Open"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {complaint.status}
                          </Badge>
                          <Badge
                            variant={
                              complaint.severity === "Critical"
                                ? "destructive"
                                : complaint.severity === "High"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {complaint.severity}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            complaint.complaintDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium mb-1">
                          {complaint.complaintId} - {complaint.patientName}
                        </div>
                        <div className="text-gray-600 mb-2">
                          Type: {complaint.complaintType} | Channel:{" "}
                          {complaint.channelOfCommunication}
                        </div>
                        <div className="text-gray-700">
                          {complaint.description}
                        </div>
                        {complaint.immediateActionPlan && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <strong>Action Taken:</strong>{" "}
                            {complaint.immediateActionPlan}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Complaint Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Monthly Complaint Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border">
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">
                      Complaint Volume Trend
                    </h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          Complaints
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between px-2">
                    {(complaintMetrics?.monthlyTrend || [])
                      .slice(-6)
                      .map((item: any, index: number) => {
                        const height = Math.max(
                          20,
                          (item.count /
                            Math.max(
                              ...(complaintMetrics?.monthlyTrend || []).map(
                                (t: any) => t.count,
                              ),
                            )) *
                            150,
                        );
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className="w-8 bg-blue-500 rounded-t"
                              style={{ height: `${height}px` }}
                              title={`${item.count} complaints`}
                            ></div>
                            <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adhics" className="space-y-4">
          {/* ADHICS V2 Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Section A - Governance Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Score</span>
                    <span className="font-bold text-2xl">
                      {adhicsCompliance?.sectionA?.score || 0}%
                    </span>
                  </div>
                  <Progress
                    value={adhicsCompliance?.sectionA?.score || 0}
                    className="h-2"
                  />

                  {adhicsCompliance?.sectionA?.violations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-600">
                        Active Violations:
                      </h4>
                      {adhicsCompliance.sectionA.violations
                        .slice(0, 3)
                        .map((violation: string, index: number) => (
                          <div
                            key={index}
                            className="text-sm text-red-600 bg-red-50 p-2 rounded"
                          >
                            • {violation}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Section B - Control Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Score</span>
                    <span className="font-bold text-2xl">
                      {adhicsCompliance?.sectionB?.score || 0}%
                    </span>
                  </div>
                  <Progress
                    value={adhicsCompliance?.sectionB?.score || 0}
                    className="h-2"
                  />

                  {adhicsCompliance?.sectionB?.violations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-600">
                        Active Violations:
                      </h4>
                      {adhicsCompliance.sectionB.violations
                        .slice(0, 3)
                        .map((violation: string, index: number) => (
                          <div
                            key={index}
                            className="text-sm text-red-600 bg-red-50 p-2 rounded"
                          >
                            • {violation}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Gaps and Remediation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Compliance Gaps & Remediation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {complianceGaps.map((gap: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{gap.control}</h4>
                        <Badge
                          variant={
                            gap.severity === "critical"
                              ? "destructive"
                              : gap.severity === "high"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {gap.description}
                      </p>
                      <div className="text-xs text-gray-500 mb-2">
                        Section: {gap.section} | Control: {gap.controlId}
                      </div>
                      {gap.recommendations && (
                        <div className="mt-2">
                          <h5 className="text-sm font-semibold mb-1">
                            Recommendations:
                          </h5>
                          <ul className="text-sm space-y-1">
                            {gap.recommendations
                              .slice(0, 3)
                              .map((rec: string, recIndex: number) => (
                                <li key={recIndex} className="text-blue-600">
                                  • {rec}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Recent Audit Entries
              </CardTitle>
              <CardDescription>
                Comprehensive audit trail for all Daman-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              log.status === "success"
                                ? "default"
                                : log.status === "failure"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {log.status}
                          </Badge>
                          {log.damanRelated && (
                            <Badge variant="outline">Daman</Badge>
                          )}
                          {log.complianceImpact && (
                            <Badge variant="outline">Compliance Impact</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-gray-600">{log.details}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          User: {log.userId} | Resource: {log.resource}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Report Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Compliance Report Generation
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => generateComplianceReport("daily")}
                    disabled={reportGenerating}
                    size="sm"
                  >
                    {reportGenerating ? "Generating..." : "Daily Report"}
                  </Button>
                  <Button
                    onClick={() => generateComplianceReport("weekly")}
                    disabled={reportGenerating}
                    size="sm"
                  >
                    Weekly Report
                  </Button>
                  <Button
                    onClick={() => generateComplianceReport("monthly")}
                    disabled={reportGenerating}
                    size="sm"
                  >
                    Monthly Report
                  </Button>
                  <Button
                    onClick={() => generateComplianceReport("quarterly")}
                    disabled={reportGenerating}
                    size="sm"
                  >
                    Quarterly Report
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {complianceReports.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Reports</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        complianceReports.filter((r) => r.status === "ready")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Ready for Download
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {
                        complianceReports.filter(
                          (r) => r.status === "generating",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Currently Generating
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      7 Years
                    </div>
                    <div className="text-sm text-gray-600">
                      Data Retention Period
                    </div>
                  </div>
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Generated Reports</h3>
                  {complianceReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-gray-600">
                            Generated:{" "}
                            {new Date(report.generatedAt).toLocaleString()}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>
                              Overall Score: {report.metrics.overallScore}%
                            </span>
                            <span>
                              Auth Success:{" "}
                              {report.metrics.authorizationSuccessRate}%
                            </span>
                            <span>
                              Doc Complete:{" "}
                              {report.metrics.documentCompleteness}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              report.status === "ready"
                                ? "default"
                                : report.status === "generating"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {report.status}
                          </Badge>
                          {report.status === "ready" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportReport(report.id, "pdf")}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportReport(report.id, "excel")}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Excel
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportReport(report.id, "csv")}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                CSV
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automated Compliance Reporting Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Reporting Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">
                    Automated Report Success Rate
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2.3s</div>
                  <div className="text-sm text-gray-600">
                    Average Generation Time
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-gray-600">
                    Automated Monitoring
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Protection Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Encryption Coverage</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Anonymization</span>
                    <span className="font-bold">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Access Control</span>
                    <span className="font-bold">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Audit Trail Coverage</span>
                    <span className="font-bold">99.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Provider Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Valid Appointments</span>
                    <span className="font-bold">94.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Contact Validation</span>
                    <span className="font-bold">96.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>UAE Email Compliance</span>
                    <span className="font-bold">89.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Role-based Access</span>
                    <span className="font-bold">100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Compliance Trend Analysis & Forecasting
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportTrendData("csv")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportTrendData("excel")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export Excel
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Enhanced Trend Visualization */}
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-800">
                        30-Day Compliance Trend
                      </h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">Actual</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">Target</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            Forecast
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between px-2">
                      {trendData.slice(-7).map((item, index) => {
                        const height = (item.value / 100) * 150;
                        const targetHeight = (item.target / 100) * 150;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex items-end gap-1">
                              <div
                                className="w-4 bg-blue-500 rounded-t"
                                style={{ height: `${height}px` }}
                                title={`${item.value.toFixed(1)}%`}
                              ></div>
                              <div
                                className="w-1 bg-green-500 rounded-t"
                                style={{ height: `${targetHeight}px` }}
                                title={`Target: ${item.target}%`}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                              {new Date(item.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Trend Analysis Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {trendData.length > 0
                        ? (
                            trendData.reduce(
                              (sum, item) => sum + item.value,
                              0,
                            ) / trendData.length
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                    <div className="text-sm text-gray-600">30-Day Average</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {trendData.length > 1 &&
                      trendData[trendData.length - 1]?.value >
                        trendData[0]?.value
                        ? "+"
                        : ""}
                      {trendData.length > 1
                        ? (
                            trendData[trendData.length - 1]?.value -
                            trendData[0]?.value
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Trend Change</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(overallScore + (Math.random() * 4 - 2)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Next Month Forecast
                    </div>
                  </div>
                </div>

                {/* Forecasting Insights */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Forecasting Insights</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • Compliance scores show steady improvement over the past
                      30 days
                    </li>
                    <li>
                      • Authorization success rate is trending upward (+2.3%
                      this month)
                    </li>
                    <li>
                      • Document completeness remains consistently above target
                    </li>
                    <li>
                      • Predicted 95%+ overall score achievement by next month
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drilldown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Detailed Drill-Down Analysis
              </CardTitle>
              <CardDescription>
                Click on any metric in the Compliance Metrics tab to see
                detailed breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMetric && drillDownData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">
                      {selectedMetric.replace("_", " ")} - Detailed Analysis
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMetric(null)}
                    >
                      Close Analysis
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {drillDownData.subcategories.map((subcategory, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            {subcategory.name}
                            {getTrendIcon(subcategory.trend)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2">
                            {subcategory.value}%
                          </div>
                          <div className="space-y-1">
                            {subcategory.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="text-xs text-gray-600"
                              >
                                {detail}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • Focus on improving response times during peak hours
                      </li>
                      <li>• Implement automated document validation checks</li>
                      <li>
                        • Enhance staff training for authorization processes
                      </li>
                      <li>
                        • Consider additional resources for high-volume periods
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Select a metric from the Compliance Metrics tab
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click on any metric value to see detailed breakdown and
                    analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Security Assessment Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Assessment Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Overall Security Status</span>
                  <Badge
                    variant={
                      securityAssessment?.passed ? "default" : "destructive"
                    }
                  >
                    {securityAssessment?.passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>

                {securityAssessment?.errors?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">
                      Security Errors:
                    </h4>
                    {securityAssessment.errors.map(
                      (error: string, index: number) => (
                        <div
                          key={index}
                          className="text-sm text-red-600 bg-red-50 p-2 rounded"
                        >
                          • {error}
                        </div>
                      ),
                    )}
                  </div>
                )}

                {securityAssessment?.warnings?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600">
                      Security Warnings:
                    </h4>
                    {securityAssessment.warnings.map(
                      (warning: string, index: number) => (
                        <div
                          key={index}
                          className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded"
                        >
                          • {warning}
                        </div>
                      ),
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {securityAssessment?.checks?.inputSanitization
                        ? "✓"
                        : "✗"}
                    </div>
                    <div className="text-xs text-gray-600">
                      Input Sanitization
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {securityAssessment?.checks?.csrfProtection ? "✓" : "✗"}
                    </div>
                    <div className="text-xs text-gray-600">CSRF Protection</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {securityAssessment?.checks?.cspHeaders ? "✓" : "✗"}
                    </div>
                    <div className="text-xs text-gray-600">CSP Headers</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {securityAssessment?.checks?.dataEncryption ? "✓" : "✗"}
                    </div>
                    <div className="text-xs text-gray-600">Data Encryption</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DamanComplianceMonitoringDashboard;
