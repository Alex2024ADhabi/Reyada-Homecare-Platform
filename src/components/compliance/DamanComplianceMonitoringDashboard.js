import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, CheckCircle, Clock, FileText, Shield, TrendingUp, Users, Database, Lock, Eye, RefreshCw, Download, BarChart3, LineChart, PieChart, Search, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
import { ADHICSComplianceService } from "@/services/adhics-compliance.service";
import { SecurityService, AuditLogger } from "@/services/security.service";
import { patientComplaintAPI } from "@/api/incident-management.api";
const DamanComplianceMonitoringDashboard = () => {
    const [complianceMetrics, setComplianceMetrics] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [complianceAlerts, setComplianceAlerts] = useState([]);
    const [overallScore, setOverallScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [trendData, setTrendData] = useState([]);
    const [complianceReports, setComplianceReports] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [drillDownData, setDrillDownData] = useState(null);
    const [reportGenerating, setReportGenerating] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
    });
    const [filterCategory, setFilterCategory] = useState("all");
    const [adhicsCompliance, setAdhicsCompliance] = useState(null);
    const [adhicsViolations, setAdhicsViolations] = useState([]);
    const [complianceGaps, setComplianceGaps] = useState([]);
    const [securityAssessment, setSecurityAssessment] = useState(null);
    const [complaintMetrics, setComplaintMetrics] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
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
            const adhicsAssessment = await ADHICSComplianceService.performComprehensiveAssessment({
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
        }
        catch (error) {
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
        }
        catch (error) {
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
            const mockMetrics = [
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
            const mockAuditLogs = [
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
            const mockAlerts = [
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
                    description: "3 authorization requests missing face-to-face assessment",
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
                    description: "User access review not performed within required timeframe",
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
            const avgScore = sanitizedMetrics.reduce((sum, metric) => {
                const normalizedValue = metric.name.includes("Time")
                    ? Math.max(0, 100 - (metric.value / metric.target) * 100)
                    : (metric.value / metric.target) * 100;
                return sum + Math.min(100, normalizedValue);
            }, 0) / sanitizedMetrics.length;
            setOverallScore(Math.round(avgScore));
            setLastRefresh(new Date());
            // Load trend data
            const mockTrendData = [];
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
            const mockReports = [
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
        }
        catch (error) {
            console.error("Error loading compliance data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
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
    const getStatusBadgeVariant = (status) => {
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
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "up":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
            case "down":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-red-500 rotate-180" });
            case "stable":
                return _jsx(Activity, { className: "h-4 w-4 text-blue-500" });
            default:
                return null;
        }
    };
    const generateComplianceReport = async (reportType = "monthly") => {
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
                    successRate: (auditLogs.filter((log) => log.status === "success").length /
                        auditLogs.length) *
                        100,
                    damanRelatedEntries: auditLogs.filter((log) => log.damanRelated)
                        .length,
                },
                trendAnalysis: {
                    averageScore: trendData.reduce((sum, item) => sum + item.value, 0) /
                        trendData.length,
                    trend: trendData[trendData.length - 1]?.value > trendData[0]?.value
                        ? "improving"
                        : "declining",
                    volatility: Math.max(...trendData.map((item) => item.value)) -
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
                throw new Error(`Report generation failed: ${validation.errors?.join(", ")}`);
            }
            // Simulate report generation
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const newReport = {
                id: Date.now().toString(),
                name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Compliance Report - ${new Date().toLocaleDateString()}`,
                type: reportType,
                generatedAt: new Date().toISOString(),
                status: "ready",
                downloadUrl: `/reports/${reportType}-${Date.now()}.pdf`,
                metrics: {
                    overallScore,
                    authorizationSuccessRate: complianceMetrics.find((m) => m.id === "auth_success_rate")
                        ?.value || 0,
                    documentCompleteness: complianceMetrics.find((m) => m.id === "doc_completeness")?.value ||
                        0,
                    auditTrailIntegrity: complianceMetrics.find((m) => m.id === "audit_trail")?.value || 0,
                },
            };
            setComplianceReports((prev) => [newReport, ...prev]);
            console.log("Compliance report generated:", reportData);
        }
        catch (error) {
            console.error("Error generating compliance report:", error);
        }
        finally {
            setReportGenerating(false);
        }
    };
    const handleDrillDown = (metricId) => {
        setSelectedMetric(metricId);
        // Mock drill-down data
        const mockDrillDown = {
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
    const exportReport = async (reportId, format = "pdf") => {
        try {
            const report = complianceReports.find((r) => r.id === reportId);
            if (!report)
                return;
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
                    criticalIssues: complianceAlerts.filter((a) => a.type === "critical" && !a.resolved).length,
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
            let content;
            let mimeType;
            let fileExtension;
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
        }
        catch (error) {
            console.error("Error exporting report:", error);
        }
    };
    const exportTrendData = async (format) => {
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
                    averageScore: trendData.reduce((sum, item) => sum + item.value, 0) /
                        trendData.length,
                    highestScore: Math.max(...trendData.map((item) => item.value)),
                    lowestScore: Math.min(...trendData.map((item) => item.value)),
                    volatility: Math.max(...trendData.map((item) => item.value)) -
                        Math.min(...trendData.map((item) => item.value)),
                },
            };
            let content;
            let mimeType;
            let fileExtension;
            if (format === "csv") {
                content = convertTrendDataToCSV(trendExportData);
                mimeType = "text/csv";
                fileExtension = "csv";
            }
            else {
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
        }
        catch (error) {
            console.error("Error exporting trend data:", error);
        }
    };
    const convertToCSV = (data) => {
        const headers = ["Metric", "Value", "Target", "Status", "Last Updated"];
        const rows = data.detailedMetrics.map((metric) => [
            metric.name,
            metric.value,
            metric.target,
            metric.status,
            metric.lastUpdated,
        ]);
        return [headers, ...rows].map((row) => row.join(",")).join("\n");
    };
    const convertTrendDataToCSV = (data) => {
        const headers = ["Date", "Compliance Score", "Target", "Category"];
        const rows = data.trendData.map((item) => [
            item.date,
            item.value,
            item.target,
            item.category,
        ]);
        return [headers, ...rows].map((row) => row.join(",")).join("\n");
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center h-96", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin" }), _jsx("span", { className: "ml-2", children: "Loading compliance data..." })] }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-white min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Daman Compliance Monitoring" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Real-time compliance dashboard for Daman 2025 standards" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Last updated: ", lastRefresh.toLocaleTimeString()] }), _jsxs(Button, { onClick: loadComplianceData, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }), _jsxs(Button, { onClick: generateComplianceReport, children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "Overall Compliance Score"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-4xl font-bold text-blue-600", children: [overallScore, "%"] }), _jsxs("div", { className: "flex-1", children: [_jsx(Progress, { value: overallScore, className: "h-3" }), _jsxs("div", { className: "flex justify-between text-sm text-gray-500 mt-1", children: [_jsx("span", { children: "0%" }), _jsx("span", { children: "Target: 95%" }), _jsx("span", { children: "100%" })] })] }), _jsx(Badge, { variant: overallScore >= 95
                                                ? "default"
                                                : overallScore >= 85
                                                    ? "secondary"
                                                    : "destructive", children: overallScore >= 95
                                                ? "Excellent"
                                                : overallScore >= 85
                                                    ? "Good"
                                                    : "Needs Improvement" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Lock, { className: "h-5 w-5 mr-2" }), "ADHICS V2 Compliance"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-4xl font-bold text-green-600", children: [adhicsCompliance?.overallScore || 0, "%"] }), _jsxs("div", { className: "flex-1", children: [_jsx(Progress, { value: adhicsCompliance?.overallScore || 0, className: "h-3" }), _jsxs("div", { className: "flex justify-between text-sm text-gray-500 mt-1", children: [_jsxs("span", { children: ["Section A: ", adhicsCompliance?.sectionA?.score || 0, "%"] }), _jsxs("span", { children: ["Section B: ", adhicsCompliance?.sectionB?.score || 0, "%"] })] })] }), _jsx(Badge, { variant: (adhicsCompliance?.overallScore || 0) >= 95
                                                    ? "default"
                                                    : (adhicsCompliance?.overallScore || 0) >= 85
                                                        ? "secondary"
                                                        : "destructive", children: (adhicsCompliance?.overallScore || 0) >= 95
                                                    ? "Compliant"
                                                    : (adhicsCompliance?.overallScore || 0) >= 85
                                                        ? "Mostly Compliant"
                                                        : "Non-Compliant" })] }), adhicsViolations.length > 0 && (_jsxs("div", { className: "mt-3 text-sm text-red-600", children: [adhicsViolations.length, " active violations requiring attention"] }))] })] })] }), complianceAlerts.filter((alert) => !alert.resolved).length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center text-red-600", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Active Compliance Alerts"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: complianceAlerts
                                .filter((alert) => !alert.resolved)
                                .map((alert) => (_jsxs(Alert, { variant: alert.type === "critical" ? "destructive" : "default", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: alert.title }), _jsxs(AlertDescription, { children: [alert.description, _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Standard: ", alert.damanStandard, " |", " ", new Date(alert.timestamp).toLocaleString()] })] })] }, alert.id))) }) })] })), _jsxs(Tabs, { defaultValue: "metrics", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "metrics", children: "Compliance Metrics" }), _jsx(TabsTrigger, { value: "complaints", children: "Patient Complaints" }), _jsx(TabsTrigger, { value: "adhics", children: "ADHICS V2 Status" }), _jsx(TabsTrigger, { value: "audit", children: "Audit Trail" }), _jsx(TabsTrigger, { value: "reports", children: "Reports & Analytics" }), _jsx(TabsTrigger, { value: "trends", children: "Trend Analysis" }), _jsx(TabsTrigger, { value: "drilldown", children: "Drill-Down Analysis" }), _jsx(TabsTrigger, { value: "security", children: "Security Assessment" })] }), _jsx(TabsContent, { value: "metrics", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: complianceMetrics.map((metric) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center justify-between", children: [metric.name, getTrendIcon(metric.trend)] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors", onClick: () => handleDrillDown(metric.id), title: "Click for detailed analysis", children: metric.name.includes("Time")
                                                                ? `${metric.value}h`
                                                                : `${metric.value}%` }), _jsx(Badge, { variant: getStatusBadgeVariant(metric.status), children: metric.status })] }), _jsx(Progress, { value: metric.name.includes("Time")
                                                        ? Math.max(0, 100 - (metric.value / metric.target) * 100)
                                                        : (metric.value / metric.target) * 100, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Target:", " ", metric.name.includes("Time")
                                                                    ? `${metric.target}h`
                                                                    : `${metric.target}%`] }), _jsx("span", { children: new Date(metric.lastUpdated).toLocaleTimeString() })] })] }) })] }, metric.id))) }) }), _jsxs(TabsContent, { value: "complaints", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Total Complaints"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: complaintMetrics?.total || 0 }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "All time complaints" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Open Complaints"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: complaintMetrics?.byStatus?.Open || 0 }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Pending resolution" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Resolved This Month"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: complaintMetrics?.byStatus?.Closed || 0 }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Successfully closed" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Avg Resolution Time"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [Math.round(complaintMetrics?.averageResolutionTime || 0), "h"] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Average hours to resolve" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Complaints by Severity"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: Object.entries(complaintMetrics?.bySeverity || {}).map(([severity, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center", children: _jsx(Badge, { variant: severity === "Critical"
                                                                        ? "destructive"
                                                                        : severity === "High"
                                                                            ? "outline"
                                                                            : "secondary", className: "mr-2", children: severity }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "text-sm font-medium", children: count }), _jsx(Progress, { value: (count /
                                                                            (complaintMetrics?.total || 1)) *
                                                                            100, className: "w-20 h-2" })] })] }, severity))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2" }), "Complaints by Type"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: Object.entries(complaintMetrics?.byType || {}).map(([type, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: type }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm", children: count }), _jsx(Progress, { value: (count /
                                                                            (complaintMetrics?.total || 1)) *
                                                                            100, className: "w-20 h-2" })] })] }, type))) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2" }), "Recent Patient Complaints"] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-4", children: recentComplaints.map((complaint) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: complaint.status === "Closed"
                                                                                ? "default"
                                                                                : complaint.status === "Open"
                                                                                    ? "destructive"
                                                                                    : "secondary", children: complaint.status }), _jsx(Badge, { variant: complaint.severity === "Critical"
                                                                                ? "destructive"
                                                                                : complaint.severity === "High"
                                                                                    ? "outline"
                                                                                    : "secondary", children: complaint.severity })] }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(complaint.complaintDate).toLocaleDateString() })] }), _jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "font-medium mb-1", children: [complaint.complaintId, " - ", complaint.patientName] }), _jsxs("div", { className: "text-gray-600 mb-2", children: ["Type: ", complaint.complaintType, " | Channel:", " ", complaint.channelOfCommunication] }), _jsx("div", { className: "text-gray-700", children: complaint.description }), complaint.immediateActionPlan && (_jsxs("div", { className: "mt-2 p-2 bg-blue-50 rounded text-xs", children: [_jsx("strong", { children: "Action Taken:" }), " ", complaint.immediateActionPlan] }))] })] }, complaint.complaintId))) }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(LineChart, { className: "h-5 w-5 mr-2" }), "Monthly Complaint Trends"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border", children: _jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h4", { className: "font-semibold text-gray-800", children: "Complaint Volume Trend" }), _jsx("div", { className: "flex gap-2", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }), _jsx("span", { className: "text-xs text-gray-600", children: "Complaints" })] }) })] }), _jsx("div", { className: "flex-1 flex items-end justify-between px-2", children: (complaintMetrics?.monthlyTrend || [])
                                                            .slice(-6)
                                                            .map((item, index) => {
                                                            const height = Math.max(20, (item.count /
                                                                Math.max(...(complaintMetrics?.monthlyTrend || []).map((t) => t.count))) *
                                                                150);
                                                            return (_jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsx("div", { className: "w-8 bg-blue-500 rounded-t", style: { height: `${height}px` }, title: `${item.count} complaints` }), _jsx("span", { className: "text-xs text-gray-500 transform -rotate-45 origin-left", children: item.month })] }, index));
                                                        }) })] }) }) })] })] }), _jsxs(TabsContent, { value: "adhics", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "Section A - Governance Framework"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Overall Score" }), _jsxs("span", { className: "font-bold text-2xl", children: [adhicsCompliance?.sectionA?.score || 0, "%"] })] }), _jsx(Progress, { value: adhicsCompliance?.sectionA?.score || 0, className: "h-2" }), adhicsCompliance?.sectionA?.violations?.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold text-red-600", children: "Active Violations:" }), adhicsCompliance.sectionA.violations
                                                                    .slice(0, 3)
                                                                    .map((violation, index) => (_jsxs("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: ["\u2022 ", violation] }, index)))] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Lock, { className: "h-5 w-5 mr-2" }), "Section B - Control Requirements"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Overall Score" }), _jsxs("span", { className: "font-bold text-2xl", children: [adhicsCompliance?.sectionB?.score || 0, "%"] })] }), _jsx(Progress, { value: adhicsCompliance?.sectionB?.score || 0, className: "h-2" }), adhicsCompliance?.sectionB?.violations?.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold text-red-600", children: "Active Violations:" }), adhicsCompliance.sectionB.violations
                                                                    .slice(0, 3)
                                                                    .map((violation, index) => (_jsxs("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: ["\u2022 ", violation] }, index)))] }))] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2" }), "Compliance Gaps & Remediation"] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-4", children: complianceGaps.map((gap, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-semibold", children: gap.control }), _jsx(Badge, { variant: gap.severity === "critical"
                                                                        ? "destructive"
                                                                        : gap.severity === "high"
                                                                            ? "outline"
                                                                            : "secondary", children: gap.severity })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: gap.description }), _jsxs("div", { className: "text-xs text-gray-500 mb-2", children: ["Section: ", gap.section, " | Control: ", gap.controlId] }), gap.recommendations && (_jsxs("div", { className: "mt-2", children: [_jsx("h5", { className: "text-sm font-semibold mb-1", children: "Recommendations:" }), _jsx("ul", { className: "text-sm space-y-1", children: gap.recommendations
                                                                        .slice(0, 3)
                                                                        .map((rec, recIndex) => (_jsxs("li", { className: "text-blue-600", children: ["\u2022 ", rec] }, recIndex))) })] }))] }, index))) }) }) })] })] }), _jsx(TabsContent, { value: "audit", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Eye, { className: "h-5 w-5 mr-2" }), "Recent Audit Entries"] }), _jsx(CardDescription, { children: "Comprehensive audit trail for all Daman-related activities" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-3", children: auditLogs.map((log) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: log.status === "success"
                                                                            ? "default"
                                                                            : log.status === "failure"
                                                                                ? "destructive"
                                                                                : "secondary", children: log.status }), log.damanRelated && (_jsx(Badge, { variant: "outline", children: "Daman" })), log.complianceImpact && (_jsx(Badge, { variant: "outline", children: "Compliance Impact" }))] }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(log.timestamp).toLocaleString() })] }), _jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-medium", children: log.action }), _jsx("div", { className: "text-gray-600", children: log.details }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["User: ", log.userId, " | Resource: ", log.resource] })] })] }, log.id))) }) }) })] }) }), _jsxs(TabsContent, { value: "reports", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2" }), "Compliance Report Generation"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => generateComplianceReport("daily"), disabled: reportGenerating, size: "sm", children: reportGenerating ? "Generating..." : "Daily Report" }), _jsx(Button, { onClick: () => generateComplianceReport("weekly"), disabled: reportGenerating, size: "sm", children: "Weekly Report" }), _jsx(Button, { onClick: () => generateComplianceReport("monthly"), disabled: reportGenerating, size: "sm", children: "Monthly Report" }), _jsx(Button, { onClick: () => generateComplianceReport("quarterly"), disabled: reportGenerating, size: "sm", children: "Quarterly Report" })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: complianceReports.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Reports" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: complianceReports.filter((r) => r.status === "ready")
                                                                        .length }), _jsx("div", { className: "text-sm text-gray-600", children: "Ready for Download" })] }), _jsxs("div", { className: "text-center p-4 bg-yellow-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: complianceReports.filter((r) => r.status === "generating").length }), _jsx("div", { className: "text-sm text-gray-600", children: "Currently Generating" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: "7 Years" }), _jsx("div", { className: "text-sm text-gray-600", children: "Data Retention Period" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Generated Reports" }), complianceReports.map((report) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: report.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Generated:", " ", new Date(report.generatedAt).toLocaleString()] }), _jsxs("div", { className: "flex gap-4 mt-2 text-sm", children: [_jsxs("span", { children: ["Overall Score: ", report.metrics.overallScore, "%"] }), _jsxs("span", { children: ["Auth Success:", " ", report.metrics.authorizationSuccessRate, "%"] }), _jsxs("span", { children: ["Doc Complete:", " ", report.metrics.documentCompleteness, "%"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: report.status === "ready"
                                                                                    ? "default"
                                                                                    : report.status === "generating"
                                                                                        ? "secondary"
                                                                                        : "destructive", children: report.status }), report.status === "ready" && (_jsxs("div", { className: "flex gap-1", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportReport(report.id, "pdf"), children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "PDF"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportReport(report.id, "excel"), children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Excel"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportReport(report.id, "csv"), children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "CSV"] })] }))] })] }) }, report.id)))] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(BarChart3, { className: "h-5 w-5 mr-2" }), "Reporting Statistics"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: "100%" }), _jsx("div", { className: "text-sm text-gray-600", children: "Automated Report Success Rate" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: "2.3s" }), _jsx("div", { className: "text-sm text-gray-600", children: "Average Generation Time" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: "24/7" }), _jsx("div", { className: "text-sm text-gray-600", children: "Automated Monitoring" })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Database, { className: "h-5 w-5 mr-2" }), "Data Protection Metrics"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Encryption Coverage" }), _jsx("span", { className: "font-bold", children: "100%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Data Anonymization" }), _jsx("span", { className: "font-bold", children: "98.5%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Access Control" }), _jsx("span", { className: "font-bold", children: "99.2%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Audit Trail Coverage" }), _jsx("span", { className: "font-bold", children: "99.1%" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2" }), "Provider Authentication"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Valid Appointments" }), _jsx("span", { className: "font-bold", children: "94.7%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Contact Validation" }), _jsx("span", { className: "font-bold", children: "96.3%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "UAE Email Compliance" }), _jsx("span", { className: "font-bold", children: "89.1%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Role-based Access" }), _jsx("span", { className: "font-bold", children: "100%" })] })] }) })] })] })] }), _jsx(TabsContent, { value: "trends", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(LineChart, { className: "h-5 w-5 mr-2" }), "Compliance Trend Analysis & Forecasting"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportTrendData("csv"), children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Export CSV"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportTrendData("excel"), children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Export Excel"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border", children: _jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h4", { className: "font-semibold text-gray-800", children: "30-Day Compliance Trend" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }), _jsx("span", { className: "text-xs text-gray-600", children: "Actual" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsx("span", { className: "text-xs text-gray-600", children: "Target" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-purple-500 rounded-full" }), _jsx("span", { className: "text-xs text-gray-600", children: "Forecast" })] })] })] }), _jsx("div", { className: "flex-1 flex items-end justify-between px-2", children: trendData.slice(-7).map((item, index) => {
                                                                const height = (item.value / 100) * 150;
                                                                const targetHeight = (item.target / 100) * 150;
                                                                return (_jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsxs("div", { className: "flex items-end gap-1", children: [_jsx("div", { className: "w-4 bg-blue-500 rounded-t", style: { height: `${height}px` }, title: `${item.value.toFixed(1)}%` }), _jsx("div", { className: "w-1 bg-green-500 rounded-t", style: { height: `${targetHeight}px` }, title: `Target: ${item.target}%` })] }), _jsx("span", { className: "text-xs text-gray-500 transform -rotate-45 origin-left", children: new Date(item.date).toLocaleDateString("en-US", {
                                                                                month: "short",
                                                                                day: "numeric",
                                                                            }) })] }, index));
                                                            }) })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [trendData.length > 0
                                                                        ? (trendData.reduce((sum, item) => sum + item.value, 0) / trendData.length).toFixed(1)
                                                                        : "0", "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "30-Day Average" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [trendData.length > 1 &&
                                                                        trendData[trendData.length - 1]?.value >
                                                                            trendData[0]?.value
                                                                        ? "+"
                                                                        : "", trendData.length > 1
                                                                        ? (trendData[trendData.length - 1]?.value -
                                                                            trendData[0]?.value).toFixed(1)
                                                                        : "0", "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Trend Change" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [(overallScore + (Math.random() * 4 - 2)).toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Next Month Forecast" })] })] }), _jsxs("div", { className: "bg-blue-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Forecasting Insights" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Compliance scores show steady improvement over the past 30 days" }), _jsx("li", { children: "\u2022 Authorization success rate is trending upward (+2.3% this month)" }), _jsx("li", { children: "\u2022 Document completeness remains consistently above target" }), _jsx("li", { children: "\u2022 Predicted 95%+ overall score achievement by next month" })] })] })] }) })] }) }), _jsx(TabsContent, { value: "drilldown", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Search, { className: "h-5 w-5 mr-2" }), "Detailed Drill-Down Analysis"] }), _jsx(CardDescription, { children: "Click on any metric in the Compliance Metrics tab to see detailed breakdown" })] }), _jsx(CardContent, { children: selectedMetric && drillDownData ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold capitalize", children: [selectedMetric.replace("_", " "), " - Detailed Analysis"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedMetric(null), children: "Close Analysis" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: drillDownData.subcategories.map((subcategory, index) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm flex items-center justify-between", children: [subcategory.name, getTrendIcon(subcategory.trend)] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold mb-2", children: [subcategory.value, "%"] }), _jsx("div", { className: "space-y-1", children: subcategory.details.map((detail, detailIndex) => (_jsx("div", { className: "text-xs text-gray-600", children: detail }, detailIndex))) })] })] }, index))) }), _jsxs("div", { className: "bg-yellow-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Recommendations" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Focus on improving response times during peak hours" }), _jsx("li", { children: "\u2022 Implement automated document validation checks" }), _jsx("li", { children: "\u2022 Enhance staff training for authorization processes" }), _jsx("li", { children: "\u2022 Consider additional resources for high-volume periods" })] })] })] })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(PieChart, { className: "h-16 w-16 mx-auto mb-4 text-gray-400" }), _jsx("p", { className: "text-gray-600", children: "Select a metric from the Compliance Metrics tab" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Click on any metric value to see detailed breakdown and analysis" })] })) })] }) }), _jsx(TabsContent, { value: "security", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "Security Assessment Results"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-semibold", children: "Overall Security Status" }), _jsx(Badge, { variant: securityAssessment?.passed ? "default" : "destructive", children: securityAssessment?.passed ? "PASSED" : "FAILED" })] }), securityAssessment?.errors?.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold text-red-600", children: "Security Errors:" }), securityAssessment.errors.map((error, index) => (_jsxs("div", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: ["\u2022 ", error] }, index)))] })), securityAssessment?.warnings?.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold text-yellow-600", children: "Security Warnings:" }), securityAssessment.warnings.map((warning, index) => (_jsxs("div", { className: "text-sm text-yellow-600 bg-yellow-50 p-2 rounded", children: ["\u2022 ", warning] }, index)))] })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mt-4", children: [_jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-lg font-bold text-blue-600", children: securityAssessment?.checks?.inputSanitization
                                                                    ? "✓"
                                                                    : "✗" }), _jsx("div", { className: "text-xs text-gray-600", children: "Input Sanitization" })] }), _jsxs("div", { className: "text-center p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-lg font-bold text-green-600", children: securityAssessment?.checks?.csrfProtection ? "✓" : "✗" }), _jsx("div", { className: "text-xs text-gray-600", children: "CSRF Protection" })] }), _jsxs("div", { className: "text-center p-3 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-lg font-bold text-purple-600", children: securityAssessment?.checks?.cspHeaders ? "✓" : "✗" }), _jsx("div", { className: "text-xs text-gray-600", children: "CSP Headers" })] }), _jsxs("div", { className: "text-center p-3 bg-orange-50 rounded-lg", children: [_jsx("div", { className: "text-lg font-bold text-orange-600", children: securityAssessment?.checks?.dataEncryption ? "✓" : "✗" }), _jsx("div", { className: "text-xs text-gray-600", children: "Data Encryption" })] })] })] }) })] }) })] })] }));
};
export default DamanComplianceMonitoringDashboard;
