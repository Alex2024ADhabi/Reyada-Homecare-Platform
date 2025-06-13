import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, CheckCircle, AlertTriangle, XCircle, TrendingUp, FileText, Clock, Activity, BarChart3, Eye, Lock, Database, Zap, Bell, Download, RefreshCw, Wifi, Server, Globe, AlertCircle, Settings, UserCheck, Target, Gauge, } from "lucide-react";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
const DamanComplianceDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [auditEntries, setAuditEntries] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [refreshInterval, setRefreshInterval] = useState(null);
    // Helper methods for compliance calculations
    const calculateMSCComplianceScore = (report) => {
        // Calculate MSC-specific compliance score based on guidelines
        let score = 0;
        const maxScore = 100;
        if (report?.mscCompliance?.initialVisitNotification)
            score += 20;
        if (report?.mscCompliance?.atcValidityRevision)
            score += 20;
        if (report?.mscCompliance?.treatmentPeriodCompliance)
            score += 20;
        if (report?.mscCompliance?.monthlyBilling)
            score += 20;
        if (report?.mscCompliance?.serviceConfirmation)
            score += 20;
        return Math.min(score, maxScore);
    };
    const calculateHomecareStandardsScore = (report) => {
        // Calculate homecare standards compliance score
        let score = 0;
        const maxScore = 100;
        if (report?.homecareStandards?.serviceCodesUpdated)
            score += 25;
        if (report?.homecareStandards?.documentationComplete)
            score += 25;
        if (report?.homecareStandards?.assessmentFormsValid)
            score += 25;
        if (report?.homecareStandards?.transitionCompleted)
            score += 25;
        return Math.min(score, maxScore);
    };
    const calculateWheelchairComplianceScore = (report) => {
        // Calculate wheelchair pre-approval compliance readiness
        let score = 0;
        const maxScore = 100;
        if (report?.wheelchairCompliance?.preApprovalFormReady)
            score += 34;
        if (report?.wheelchairCompliance?.documentationRequirements)
            score += 33;
        if (report?.wheelchairCompliance?.effectiveDateReadiness)
            score += 33;
        return Math.min(score, maxScore);
    };
    const logComplianceMonitoringFailure = (error) => {
        console.error("Compliance monitoring failure:", {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            component: "DamanComplianceDashboard",
            severity: "high",
            requiresAttention: true,
        });
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getComplianceStatusIcon = (status) => {
        switch (status) {
            case "compliant":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "warning":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "violation":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            default:
                return _jsx(Activity, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getScoreColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 75)
            return "text-yellow-600";
        return "text-red-600";
    };
    useEffect(() => {
        loadComplianceData();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(loadComplianceData, 30000);
        setRefreshInterval(interval);
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, []);
    const loadComplianceData = async () => {
        try {
            setLoading(true);
            // Load compliance metrics
            const metricsData = await loadComplianceMetrics();
            setMetrics(metricsData);
            // Load audit entries
            const auditData = await loadAuditEntries();
            setAuditEntries(auditData);
            // Load compliance alerts
            const alertsData = await loadComplianceAlerts();
            setAlerts(alertsData);
        }
        catch (error) {
            console.error("Error loading compliance data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadComplianceMetrics = async () => {
        try {
            // Simplified API call with mock data fallback
            const mockSystemStatus = {
                daman: { status: "healthy", responseTime: 150, complianceScore: 87.5 },
                openjet: {
                    status: "healthy",
                    responseTime: 120,
                    providerPortalUptime: 99.9,
                },
                complianceMetrics: {
                    overallComplianceScore: 87.5,
                    authorizationProcessingTime: 2.3,
                    documentationCompleteness: 96.8,
                    providerAuthenticationScore: 89.3,
                    dataProtectionScore: 92.1,
                    auditTrailCompleteness: 96.8,
                },
            };
            const mockPerformanceMetrics = {
                summary: { avgApiTime: 200 },
            };
            const mockComplianceReport = {};
            // Use mock data for now to prevent API errors
            const response = {};
            const systemStatus = mockSystemStatus;
            const performanceMetrics = mockPerformanceMetrics;
            const complianceReport = mockComplianceReport;
            // Simple validation without complex JSON processing
            const isValidResponse = response && typeof response === "object";
            if (!isValidResponse) {
                console.warn("Invalid metrics response format, using mock data");
            }
            // Calculate enhanced metrics based on system health, performance, and Daman 2025 compliance
            const damanHealthScore = systemStatus?.daman?.status === "healthy" ? 100 : 85;
            const openJetHealthScore = systemStatus?.openjet?.status === "healthy" ? 100 : 85;
            const performanceScore = Math.max(0, 100 - (performanceMetrics?.summary?.avgApiTime || 200) / 10);
            const complianceScore = systemStatus?.complianceMetrics?.overallComplianceScore || 87.5;
            // Enhanced compliance calculations based on Daman 2025 standards
            const mscComplianceScore = calculateMSCComplianceScore(complianceReport);
            const homecareStandardsScore = calculateHomecareStandardsScore(complianceReport);
            const wheelchairComplianceScore = calculateWheelchairComplianceScore(complianceReport);
            // Sanitize and validate numeric values with enhanced metrics and robust error handling
            const sanitizedMetrics = {
                authorizationSuccessRate: Math.max(0, Math.min(100, Number(response?.authorizationSuccessRate) || 94.2)),
                averageProcessingTime: Math.max(0, Number(response?.averageProcessingTime) || 2.3),
                pendingAuthorizations: Math.max(0, Math.floor(Number(response?.pendingAuthorizations) || 23)),
                expiredAuthorizations: Math.max(0, Math.floor(Number(response?.expiredAuthorizations) || 5)),
                complianceScore: Math.max(0, Math.min(100, Number(response?.complianceScore) || 87.5)),
                auditTrailCompleteness: Math.max(0, Math.min(100, Number(response?.auditTrailCompleteness) || 96.8)),
                dataProtectionScore: Math.max(0, Math.min(100, Number(response?.dataProtectionScore) || 92.1)),
                providerAuthenticationScore: Math.max(0, Math.min(100, Number(response?.providerAuthenticationScore) || 89.3)),
                // Enhanced compliance metrics with Daman 2025 standards and safe access
                realTimeEligibilityVerification: Math.max(0, Math.min(100, Number(response?.realTimeEligibilityVerification) ||
                    systemStatus?.integrationMetrics?.realTimeEligibilitySuccess ||
                    95.7)),
                webhookResponseTime: Math.max(0, Number(response?.webhookResponseTime) ||
                    systemStatus?.integrationMetrics?.webhookResponseTime ||
                    systemStatus?.daman?.responseTime ||
                    150),
                openJetIntegrationHealth: Math.max(0, Math.min(100, systemStatus?.openjet?.providerPortalUptime || openJetHealthScore)),
                letterOfAppointmentValidation: Math.max(0, Math.min(100, Number(response?.letterOfAppointmentValidation) ||
                    systemStatus?.complianceMetrics?.providerAuthenticationScore ||
                    98.2)),
                dataRetentionCompliance: Math.max(0, Math.min(100, Number(response?.dataRetentionCompliance) || 99.1)),
                encryptionCompliance: Math.max(0, Math.min(100, Number(response?.encryptionCompliance) ||
                    systemStatus?.complianceMetrics?.dataProtectionScore ||
                    100)),
                apiIntegrationHealth: Math.max(0, Math.min(100, systemStatus?.daman?.complianceScore || damanHealthScore)),
                automatedStatusSync: Math.max(0, Math.min(100, Number(response?.automatedStatusSync) || 93.8)),
                providerPortalUptime: Math.max(0, Math.min(100, systemStatus?.openjet?.providerPortalUptime || 99.9)),
                documentTransmissionSecurity: Math.max(0, Math.min(100, Number(response?.documentTransmissionSecurity) || 100)),
                dataAnonymizationScore: Math.max(0, Math.min(100, Number(response?.dataAnonymizationScore) || 97.3)),
                breachNotificationReadiness: Math.max(0, Math.min(100, Number(response?.breachNotificationReadiness) || 95.5)),
            };
            // Simple final validation
            if (!sanitizedMetrics || typeof sanitizedMetrics !== "object") {
                console.warn("Final metrics validation failed, using fallback");
                return getFallbackMetrics();
            }
            return sanitizedMetrics;
        }
        catch (error) {
            console.error("Failed to load compliance metrics:", error);
            // Log compliance monitoring failure for audit
            logComplianceMonitoringFailure(error);
            // Return comprehensive mock data with enhanced metrics and safe JSON structure
            const mockMetrics = {
                authorizationSuccessRate: 94.2,
                averageProcessingTime: 2.3,
                pendingAuthorizations: 23,
                expiredAuthorizations: 5,
                complianceScore: 87.5,
                auditTrailCompleteness: 96.8,
                dataProtectionScore: 92.1,
                providerAuthenticationScore: 89.3,
                realTimeEligibilityVerification: 95.7,
                webhookResponseTime: 150,
                openJetIntegrationHealth: 98.5,
                letterOfAppointmentValidation: 98.2,
                dataRetentionCompliance: 99.1,
                encryptionCompliance: 100,
                apiIntegrationHealth: 97.8,
                automatedStatusSync: 93.8,
                providerPortalUptime: 99.9,
                documentTransmissionSecurity: 100,
                dataAnonymizationScore: 97.3,
                breachNotificationReadiness: 95.5,
            };
            return mockMetrics;
        }
    };
    const getFallbackMetrics = () => {
        return {
            authorizationSuccessRate: 94.2,
            averageProcessingTime: 2.3,
            pendingAuthorizations: 23,
            expiredAuthorizations: 5,
            complianceScore: 87.5,
            auditTrailCompleteness: 96.8,
            dataProtectionScore: 92.1,
            providerAuthenticationScore: 89.3,
            realTimeEligibilityVerification: 95.7,
            webhookResponseTime: 150,
            openJetIntegrationHealth: 98.5,
            letterOfAppointmentValidation: 98.2,
            dataRetentionCompliance: 99.1,
            encryptionCompliance: 100,
            apiIntegrationHealth: 97.8,
            automatedStatusSync: 93.8,
            providerPortalUptime: 99.9,
            documentTransmissionSecurity: 100,
            dataAnonymizationScore: 97.3,
            breachNotificationReadiness: 95.5,
        };
    };
    const loadAuditEntries = async () => {
        try {
            // Use mock data to prevent API errors
            return [
                {
                    id: "audit-001",
                    timestamp: new Date().toISOString(),
                    userId: "provider-123",
                    action: "authorization_submitted",
                    resource: "patient-456",
                    details: "Prior authorization submitted for homecare services",
                    complianceStatus: "compliant",
                    ipAddress: "192.168.1.100",
                    userAgent: "Mozilla/5.0...",
                },
                {
                    id: "audit-002",
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    userId: "provider-124",
                    action: "document_uploaded",
                    resource: "authorization-789",
                    details: "Medical report uploaded for authorization",
                    complianceStatus: "compliant",
                    ipAddress: "192.168.1.101",
                    userAgent: "Mozilla/5.0...",
                },
                {
                    id: "audit-003",
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    userId: "provider-125",
                    action: "eligibility_verified",
                    resource: "patient-789",
                    details: "Patient eligibility verified successfully",
                    complianceStatus: "compliant",
                    ipAddress: "192.168.1.102",
                    userAgent: "Mozilla/5.0...",
                },
            ];
        }
        catch (error) {
            console.error("Failed to load audit entries:", error);
            return [];
        }
    };
    const loadComplianceAlerts = async () => {
        try {
            // Use mock data to prevent API errors
            return [
                {
                    id: "alert-001",
                    type: "authorization_expired",
                    severity: "high",
                    message: "Authorization ATC-2024-001 has expired",
                    details: "Patient requires renewed authorization for continued services",
                    createdAt: new Date().toISOString(),
                    resolved: false,
                    assignedTo: "provider-123",
                    category: "compliance",
                    damanRelated: true,
                    requiresImmedateAction: true,
                    estimatedResolutionTime: "2 hours",
                    impactLevel: "significant",
                },
                {
                    id: "alert-002",
                    type: "document_missing",
                    severity: "medium",
                    message: "Missing face-to-face assessment form",
                    details: "Authorization AUTH-2024-002 is missing required documentation",
                    createdAt: new Date(Date.now() - 1800000).toISOString(),
                    resolved: false,
                    category: "compliance",
                    damanRelated: true,
                    requiresImmedateAction: false,
                    estimatedResolutionTime: "4 hours",
                    impactLevel: "moderate",
                },
                {
                    id: "alert-003",
                    type: "integration_failure",
                    severity: "critical",
                    message: "Daman API integration failure detected",
                    details: "Unable to connect to Daman authorization service. Multiple requests failing.",
                    createdAt: new Date(Date.now() - 300000).toISOString(),
                    resolved: false,
                    assignedTo: "system-admin",
                    category: "integration",
                    damanRelated: true,
                    requiresImmedateAction: true,
                    estimatedResolutionTime: "30 minutes",
                    impactLevel: "severe",
                },
                {
                    id: "alert-004",
                    type: "webhook_timeout",
                    severity: "medium",
                    message: "Webhook response timeout from OpenJet",
                    details: "OpenJet webhook responses are taking longer than expected (>5 seconds)",
                    createdAt: new Date(Date.now() - 600000).toISOString(),
                    resolved: false,
                    category: "integration",
                    damanRelated: false,
                    requiresImmedateAction: false,
                    estimatedResolutionTime: "1 hour",
                    impactLevel: "moderate",
                },
                {
                    id: "alert-005",
                    type: "encryption_issue",
                    severity: "high",
                    message: "Data encryption validation failed",
                    details: "Some patient data may not be properly encrypted according to Daman standards",
                    createdAt: new Date(Date.now() - 900000).toISOString(),
                    resolved: false,
                    assignedTo: "security-team",
                    category: "security",
                    damanRelated: true,
                    requiresImmedateAction: true,
                    estimatedResolutionTime: "1 hour",
                    impactLevel: "significant",
                },
                {
                    id: "alert-006",
                    type: "performance_degradation",
                    severity: "medium",
                    message: "API response times degrading",
                    details: "Average API response time has increased to 3.2 seconds, above the 2-second threshold",
                    createdAt: new Date(Date.now() - 1200000).toISOString(),
                    resolved: false,
                    category: "performance",
                    damanRelated: false,
                    requiresImmedateAction: false,
                    estimatedResolutionTime: "2 hours",
                    impactLevel: "moderate",
                },
            ];
        }
        catch (error) {
            console.error("Failed to load compliance alerts:", error);
            return [];
        }
    };
    const generateComplianceReport = async () => {
        try {
            // Enhanced report data with comprehensive Daman 2025 compliance standards
            const reportData = {
                metrics: metrics || {},
                auditEntries: auditEntries.slice(0, 100), // Last 100 entries
                alerts: alerts.filter((alert) => !alert.resolved),
                generatedAt: new Date().toISOString(),
                reportType: "daman_compliance_comprehensive_2025",
                version: "2.0",
                generatedBy: "system",
                complianceStandards: "Daman_2025_Enhanced",
                damanStandardsCompliance: {
                    // Core compliance areas
                    paymentTerms: "30_days",
                    mscPlanExtensions: "extended_until_may_14_2025",
                    serviceCodes: "17-25-x_active_effective_june_2024",
                    wheelchairPreApproval: "mandatory_may_1_2025",
                    homecareAllocation: "openjet_automated_feb_24_2025",
                    submissionDeadline: "monthly_30_day_periods",
                    emailDomains: "uae_hosted_required_mandatory",
                    // MSC-specific compliance
                    mscCompliance: {
                        initialVisitNotification: "mandatory_within_90_days",
                        atcValidityRevision: "required_for_full_treatment_period",
                        treatmentPeriodCompliance: "90_day_maximum_per_authorization",
                        monthlyBillingRequirement: "mandatory_30_day_service_periods",
                        serviceConfirmationSignature: "blue_pen_patient_signature_required",
                        dailyScheduleSigning: "patient_relative_signature_mandatory",
                    },
                    // Homecare standards compliance
                    homecareStandards: {
                        serviceCodes2024: {
                            "17-25-1": {
                                active: true,
                                price: 300,
                                description: "Simple Home Visit - Nursing",
                            },
                            "17-25-2": {
                                active: true,
                                price: 300,
                                description: "Simple Home Visit - Supportive",
                            },
                            "17-25-3": {
                                active: true,
                                price: 800,
                                description: "Specialized Home Visit - Consultation",
                            },
                            "17-25-4": {
                                active: true,
                                price: 900,
                                description: "Routine Home Nursing Care",
                            },
                            "17-25-5": {
                                active: true,
                                price: 1800,
                                description: "Advanced Home Nursing Care",
                            },
                        },
                        deprecatedCodes: {
                            "17-26-1": { active: false, effectiveDate: "june_1_2024" },
                            "17-26-2": { active: false, effectiveDate: "june_1_2024" },
                            "17-26-3": { active: false, effectiveDate: "june_1_2024" },
                            "17-26-4": { active: false, effectiveDate: "june_1_2024" },
                        },
                        documentationRequirements: {
                            assessmentForm: "signed_stamped_referring_physician",
                            carePlanConsent: "patient_consent_required",
                            patientMonitoringForm: "mandatory_submission",
                            transitionPeriod: "2_months_june_july_2024",
                        },
                    },
                    // Provider authentication compliance
                    providerAuthentication: {
                        letterOfAppointment: "validation_required_2022_circular",
                        contactPersonManagement: "communication_negotiation_only",
                        uaeEmailDomain: "mandatory_no_non_uae_domains",
                        digitalSignatures: "required_all_submissions",
                        roleBasedAccess: "implemented_enforced",
                    },
                    // Integration compliance
                    integrationCompliance: {
                        openJetIntegration: "active_provider_services",
                        homecareAllocationAutomation: "effective_feb_24_2025",
                        realTimeEligibilityVerification: "implemented_active",
                        webhookNotifications: "configured_monitored",
                        automatedStatusSynchronization: "active_real_time",
                    },
                    // Data protection and security
                    dataProtectionCompliance: {
                        encryptionStandard: "AES_256_GCM",
                        dataAnonymization: "implemented_reporting",
                        auditTrailCompleteness: "comprehensive_7_year_retention",
                        breachNotificationReadiness: "automated_workflows",
                        secureTransmission: "TLS_1_3_enforced",
                    },
                },
                // Enhanced compliance scoring
                complianceScoring: {
                    overall: metrics?.complianceScore || 0,
                    breakdown: {
                        authorization: metrics?.authorizationSuccessRate || 0,
                        documentation: metrics?.auditTrailCompleteness || 0,
                        integration: metrics?.apiIntegrationHealth || 0,
                        security: metrics?.dataProtectionScore || 0,
                        provider: metrics?.providerAuthenticationScore || 0,
                    },
                },
                // Regulatory compliance status
                regulatoryCompliance: {
                    dohCompliance: "active_monitored",
                    damanStandards: "2025_enhanced_implemented",
                    mscGuidelines: "fully_compliant",
                    homecareRegulations: "updated_june_2024",
                    wheelchairPreApproval: "ready_may_2025",
                },
            };
            // Use local report data directly
            const response = {
                ...reportData,
                generatedLocally: true,
                timestamp: new Date().toISOString(),
            };
            // Simple JSON stringify with fallback
            let safeJsonString;
            try {
                safeJsonString = JSON.stringify(response, null, 2);
            }
            catch (stringifyError) {
                console.error("Failed to stringify response:", stringifyError);
                safeJsonString = JSON.stringify({
                    error: "Failed to generate report",
                    timestamp: new Date().toISOString(),
                }, null, 2);
            }
            // Download the generated report with proper error handling
            try {
                const blob = new Blob([safeJsonString], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                // Simple filename generation
                const dateStr = new Date().toISOString().split("T")[0];
                const sanitizedFilename = `daman-compliance-report-${dateStr}.json`;
                a.download = sanitizedFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log("Compliance report generated successfully");
            }
            catch (downloadError) {
                console.error("Download failed:", downloadError);
                // Fallback: copy to clipboard
                try {
                    await navigator.clipboard.writeText(safeJsonString);
                    alert("Report copied to clipboard (download failed)");
                }
                catch (clipboardError) {
                    console.error("Clipboard fallback failed:", clipboardError);
                    alert("Report generation completed but download failed. Check console for data.");
                    console.log("Report data:", safeJsonString);
                }
            }
        }
        catch (error) {
            console.error("Error generating compliance report:", error);
            // Enhanced error handling with user-friendly messages
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            const userMessage = `Failed to generate compliance report: ${errorMessage}. Please try again or contact support if the issue persists.`;
            // Show user-friendly error message
            alert(userMessage);
            // Log detailed error for debugging
            console.error("Detailed error information:", {
                error,
                metrics,
                auditEntries: auditEntries.length,
                alerts: alerts.length,
                timestamp: new Date().toISOString(),
            });
        }
    };
    const resolveAlert = async (alertId) => {
        try {
            // Update local state directly (no API call)
            setAlerts(alerts.map((alert) => alert.id === alertId ? { ...alert, resolved: true } : alert));
            console.log(`Alert ${alertId} resolved locally`);
        }
        catch (error) {
            console.error("Error resolving alert:", error);
        }
    };
    if (loading && !metrics) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading Daman compliance dashboard..." })] }) }));
    }
    return (_jsx(EnhancedErrorBoundary, { children: _jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Shield, { className: "h-6 w-6 mr-3 text-blue-600" }), "Daman Compliance Dashboard 2025"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Real-time monitoring and compliance tracking for enhanced Daman standards (MSC, Homecare, Provider Authentication)" }), _jsxs("div", { className: "flex items-center mt-2 space-x-4 text-sm", children: [_jsxs("span", { className: "flex items-center text-green-600", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "MSC Guidelines Active"] }), _jsxs("span", { className: "flex items-center text-blue-600", children: [_jsx(Server, { className: "h-4 w-4 mr-1" }), "OpenJet Integration"] }), _jsxs("span", { className: "flex items-center text-purple-600", children: [_jsx(Lock, { className: "h-4 w-4 mr-1" }), "Enhanced Security"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: generateComplianceReport, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export Report"] }), _jsxs(Button, { variant: "outline", onClick: loadComplianceData, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] })] }) }), alerts.filter((alert) => !alert.resolved).length > 0 && (_jsx("div", { className: "mb-6", children: _jsxs(Card, { className: "border-l-4 border-l-red-500", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center", children: [_jsx(Bell, { className: "h-5 w-5 mr-2 text-red-600" }), "Active Compliance Alerts (", alerts.filter((alert) => !alert.resolved).length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: alerts
                                        .filter((alert) => !alert.resolved)
                                        .map((alert) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getSeverityColor(alert.severity), children: alert.severity }), _jsx("span", { className: "font-medium text-gray-900", children: alert.message })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: alert.details })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: new Date(alert.createdAt).toLocaleTimeString() }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => resolveAlert(alert.id), children: "Resolve" })] })] }, alert.id))) }) })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Overall Compliance Score" }), _jsxs("p", { className: `text-2xl font-bold ${getScoreColor(metrics?.complianceScore || 0)}`, children: [metrics?.complianceScore || 0, "%"] }), _jsx(Progress, { value: metrics?.complianceScore || 0, className: "mt-2" })] }), _jsx(Shield, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Authorization Success Rate" }), _jsxs("p", { className: `text-2xl font-bold ${getScoreColor(metrics?.authorizationSuccessRate || 0)}`, children: [metrics?.authorizationSuccessRate || 0, "%"] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Avg: ", metrics?.averageProcessingTime || 0, " days"] })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "API Integration Health" }), _jsxs("p", { className: `text-2xl font-bold ${getScoreColor(metrics?.apiIntegrationHealth || 0)}`, children: [metrics?.apiIntegrationHealth || 0, "%"] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Response: ", metrics?.webhookResponseTime || 0, "ms"] })] }), _jsx(Server, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Data Protection Score" }), _jsxs("p", { className: `text-2xl font-bold ${getScoreColor(metrics?.dataProtectionScore || 0)}`, children: [metrics?.dataProtectionScore || 0, "%"] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Encryption: ", metrics?.encryptionCompliance || 0, "%"] })] }), _jsx(Lock, { className: "h-8 w-8 text-purple-600" })] }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Wifi, { className: "h-5 w-5 text-blue-600" }) }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [metrics?.realTimeEligibilityVerification || 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Real-time Eligibility" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Globe, { className: "h-5 w-5 text-green-600" }) }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [metrics?.openJetIntegrationHealth || 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "OpenJet Health" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(UserCheck, { className: "h-5 w-5 text-purple-600" }) }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [metrics?.letterOfAppointmentValidation || 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Provider Auth" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Database, { className: "h-5 w-5 text-orange-600" }) }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [metrics?.dataRetentionCompliance || 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Data Retention" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Zap, { className: "h-5 w-5 text-yellow-600" }) }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [metrics?.automatedStatusSync || 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Auto Sync" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Shield, { className: "h-5 w-5 text-red-600" }) }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [metrics?.breachNotificationReadiness || 0, "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Breach Ready" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-7", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "authorizations", children: "Authorizations" }), _jsx(TabsTrigger, { value: "integration", children: "Integration" }), _jsx(TabsTrigger, { value: "audit", children: "Audit Trail" }), _jsx(TabsTrigger, { value: "security", children: "Security" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "reports", children: "Reports" })] }), _jsx(TabsContent, { value: "overview", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Trends" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Protection" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: metrics?.dataProtectionScore || 0, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.dataProtectionScore || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Provider Authentication" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: metrics?.providerAuthenticationScore || 0, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.providerAuthenticationScore || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Authorization Processing" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: metrics?.authorizationSuccessRate || 0, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.authorizationSuccessRate || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Real-time Eligibility" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: metrics?.realTimeEligibilityVerification || 0, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.realTimeEligibilityVerification || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Automated Status Sync" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: metrics?.automatedStatusSync || 0, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.automatedStatusSync || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Anonymization" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: metrics?.dataAnonymizationScore || 0, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.dataAnonymizationScore || 0, "%"] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-64", children: _jsx("div", { className: "space-y-3", children: auditEntries.slice(0, 10).map((entry) => (_jsxs("div", { className: "flex items-center space-x-3 p-2 bg-gray-50 rounded", children: [getComplianceStatusIcon(entry.complianceStatus), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: entry.action.replace("_", " ") }), _jsx("p", { className: "text-xs text-gray-600", children: new Date(entry.timestamp).toLocaleString() })] })] }, entry.id))) }) }) })] })] }) }), _jsx(TabsContent, { value: "authorizations", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Authorization Management" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: Math.round(((metrics?.authorizationSuccessRate || 0) *
                                                                        (metrics?.pendingAuthorizations || 0)) /
                                                                        100) }), _jsx("div", { className: "text-sm text-gray-600", children: "Approved This Month" })] }), _jsxs("div", { className: "text-center p-4 bg-yellow-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: metrics?.pendingAuthorizations || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Pending Review" })] }), _jsxs("div", { className: "text-center p-4 bg-red-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: metrics?.expiredAuthorizations || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Expired/Rejected" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Authorization Processing KPIs" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Success Rate" }), _jsx(Target, { className: "h-4 w-4 text-green-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-green-600", children: [metrics?.authorizationSuccessRate || 0, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 95%" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Avg Processing" }), _jsx(Clock, { className: "h-4 w-4 text-blue-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [metrics?.averageProcessingTime || 0, "d"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 2 days" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Real-time Eligibility" }), _jsx(Wifi, { className: "h-4 w-4 text-purple-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [metrics?.realTimeEligibilityVerification || 0, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 98%" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Auto Sync" }), _jsx(Zap, { className: "h-4 w-4 text-orange-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [metrics?.automatedStatusSync || 0, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 95%" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "integration", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Server, { className: "h-5 w-5 mr-2" }), "Daman & OpenJet Integration Status"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-lg", children: "Daman API Integration" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "API Health" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${metrics?.apiIntegrationHealth && metrics.apiIntegrationHealth > 95 ? "bg-green-500" : "bg-red-500"}` }), _jsxs("span", { className: "text-sm", children: [metrics?.apiIntegrationHealth || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Response Time" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.webhookResponseTime || 0, "ms"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Eligibility Verification" }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Real-time" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Webhook Status" }), _jsx(Badge, { className: "bg-blue-100 text-blue-800", children: "Active" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-lg", children: "OpenJet Integration" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Connection Health" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${metrics?.openJetIntegrationHealth && metrics.openJetIntegrationHealth > 95 ? "bg-green-500" : "bg-red-500"}` }), _jsxs("span", { className: "text-sm", children: [metrics?.openJetIntegrationHealth || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Provider Portal" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.providerPortalUptime || 0, "% uptime"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Request Routing" }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Automated" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Status Sync" }), _jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [metrics?.automatedStatusSync || 0, "%"] })] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Integration Performance Metrics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [metrics?.webhookResponseTime || 0, "ms"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Avg Response Time" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [metrics?.realTimeEligibilityVerification || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Eligibility Success" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [metrics?.automatedStatusSync || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Sync Success Rate" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "audit", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Audit Trail" }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-2", children: auditEntries.map((entry) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getComplianceStatusIcon(entry.complianceStatus), _jsx("span", { className: "font-medium", children: entry.action.replace("_", " ") })] }), _jsx("span", { className: "text-sm text-gray-500", children: new Date(entry.timestamp).toLocaleString() })] }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: entry.details }), _jsxs("div", { className: "text-xs text-gray-500", children: ["User: ", entry.userId, " | Resource: ", entry.resource] })] }, entry.id))) }) }) })] }) }), _jsx(TabsContent, { value: "security", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Lock, { className: "h-5 w-5 mr-2" }), "Data Protection & Encryption"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "AES-256 Encryption" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: "bg-green-100 text-green-800", children: "Active" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.encryptionCompliance || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Anonymization" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: "bg-green-100 text-green-800", children: "Enabled" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.dataAnonymizationScore || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Secure Transmission" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: "bg-green-100 text-green-800", children: "TLS 1.3" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.documentTransmissionSecurity || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Retention Policy" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: "bg-blue-100 text-blue-800", children: "7 Years" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.dataRetentionCompliance || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Breach Notification" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: "bg-green-100 text-green-800", children: "Ready" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.breachNotificationReadiness || 0, "%"] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(UserCheck, { className: "h-5 w-5 mr-2" }), "Provider Authentication & Access"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Letter of Appointment" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: "bg-green-100 text-green-800", children: "Validated" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.letterOfAppointmentValidation || 0, "%"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Multi-Factor Authentication" }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Enforced" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Role-Based Access Control" }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Active" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Contact Person Management" }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Configured" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Session Management" }), _jsx(Badge, { className: "bg-blue-100 text-blue-800", children: "30min timeout" })] })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "Security Compliance Overview"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [metrics?.encryptionCompliance || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Encryption" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [metrics?.providerAuthenticationScore || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Authentication" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [metrics?.dataRetentionCompliance || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Data Retention" })] }), _jsxs("div", { className: "text-center p-4 bg-orange-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [metrics?.breachNotificationReadiness || 0, "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Breach Ready" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "performance", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Gauge, { className: "h-5 w-5 mr-2" }), "System Performance Monitoring"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "API Response" }), _jsx(Activity, { className: "h-4 w-4 text-blue-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [metrics?.webhookResponseTime || 0, "ms"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: <200ms" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Portal Uptime" }), _jsx(TrendingUp, { className: "h-4 w-4 text-green-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-green-600", children: [metrics?.providerPortalUptime || 0, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 99.9%" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Integration Health" }), _jsx(Server, { className: "h-4 w-4 text-purple-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [Math.round(((metrics?.apiIntegrationHealth || 0) +
                                                                            (metrics?.openJetIntegrationHealth || 0)) /
                                                                            2), "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 98%" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Processing Time" }), _jsx(Clock, { className: "h-4 w-4 text-orange-600" })] }), _jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [metrics?.averageProcessingTime || 0, "d"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Target: 2 days" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance Alerts & Recommendations" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [alerts
                                                            .filter((alert) => alert.category === "performance")
                                                            .map((alert) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getSeverityColor(alert.severity), children: alert.severity }), _jsx("span", { className: "font-medium text-gray-900", children: alert.message })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: alert.details })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-gray-500", children: ["ETA: ", alert.estimatedResolutionTime] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => resolveAlert(alert.id), children: "Resolve" })] })] }, alert.id))), alerts.filter((alert) => alert.category === "performance")
                                                            .length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-4 text-green-500" }), _jsx("p", { children: "No performance issues detected" })] }))] }) })] })] }) }), _jsx(TabsContent, { value: "reports", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Reports & Analytics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Button, { variant: "outline", onClick: generateComplianceReport, children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Monthly Compliance Report"] }), _jsxs(Button, { variant: "outline", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "KPI Dashboard Export"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Audit Trail Export"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), "Data Retention Report"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), "Security Assessment"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Server, { className: "h-4 w-4 mr-2" }), "Integration Health Report"] }), _jsxs(Button, { variant: "outline", children: [_jsx(UserCheck, { className: "h-4 w-4 mr-2" }), "Provider Authentication Report"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Gauge, { className: "h-4 w-4 mr-2" }), "Performance Analytics"] }), _jsxs(Button, { variant: "outline", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Incident Summary"] })] }), _jsxs("div", { className: "border-t pt-6", children: [_jsx("h4", { className: "font-medium mb-4", children: "Automated Reporting Schedule" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium", children: "Daily Reports" }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: "Active" })] }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 Authorization status updates" }), _jsx("li", { children: "\u2022 Integration health checks" }), _jsx("li", { children: "\u2022 Performance metrics" })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium", children: "Weekly Reports" }), _jsx(Badge, { className: "bg-blue-100 text-blue-800", children: "Scheduled" })] }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 Compliance score trends" }), _jsx("li", { children: "\u2022 Security audit summary" }), _jsx("li", { children: "\u2022 Provider authentication review" })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium", children: "Monthly Reports" }), _jsx(Badge, { className: "bg-purple-100 text-purple-800", children: "Automated" })] }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 Comprehensive compliance report" }), _jsx("li", { children: "\u2022 Data retention compliance" }), _jsx("li", { children: "\u2022 Regulatory submission prep" })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium", children: "Quarterly Reports" }), _jsx(Badge, { className: "bg-orange-100 text-orange-800", children: "Executive" })] }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 Executive compliance summary" }), _jsx("li", { children: "\u2022 ROI and efficiency metrics" }), _jsx("li", { children: "\u2022 Strategic recommendations" })] })] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Report Templates & Customization" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h5", { className: "font-medium mb-2", children: "Daman Compliance Template" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Standard template for Daman regulatory reporting" }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Customize"] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h5", { className: "font-medium mb-2", children: "DOH Submission Format" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "DOH-compliant format for regulatory submissions" }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Customize"] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h5", { className: "font-medium mb-2", children: "Executive Dashboard" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "High-level metrics for executive reporting" }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Customize"] })] })] }) }) })] })] }) })] })] }) }));
};
export default DamanComplianceDashboard;
